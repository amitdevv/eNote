-- AI layer — fact store
-- Date: 2026-04-21
--
-- Solves the "contradicting notes" problem (e.g. note A says "fav subject =
-- maths", note B says "science"; vanilla RAG returns both with equal weight
-- and the model dutifully cites both).
--
-- Approach: a separate user_facts table where each row is an atomic
-- (subject, predicate, object) triple extracted from a note. New facts
-- supersede old ones via is_latest + superseded_by. Retrieval filters
-- to is_latest = true, so contradictions are physically impossible to
-- return. Vector search on the fact's `statement` lets us find candidates
-- to reconcile against when extraction produces a new fact.

-- ============================================================================
-- Extensions (vector is already installed by 20260419010000_ai_embeddings.sql,
-- but `create extension if not exists` is idempotent)
-- ============================================================================

create extension if not exists vector;

-- ============================================================================
-- user_facts
-- ============================================================================

create table public.user_facts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,

  -- The atomic triple. We keep them separate so we can do exact match on
  -- (subject, predicate) for fast supersession lookup, AND we keep a
  -- pre-rendered `statement` so the LLM (and the user) sees clean prose.
  subject         text not null,    -- almost always "user"; future-proofs for "user.work" etc.
  predicate       text not null,    -- snake_case, e.g. "favorite_subject", "weakness", "city"
  object          text not null,    -- the value, e.g. "science", "DSA", "Bangalore"
  statement       text not null,    -- "User's favorite subject is science"

  -- Semantic embedding of `statement`, used to find related facts during
  -- reconciliation (predicate names from different extractions can drift —
  -- "favorite_subject" vs "fav_subject" — embeddings catch the synonymy).
  embedding       vector(768),

  -- Versioning. Only one fact per (user_id, subject, predicate) chain has
  -- is_latest = true. When a new fact arrives that supersedes an old one,
  -- the old row is updated to is_latest = false and superseded_by points
  -- to the winner. This gives us a queryable history without losing data.
  is_latest       boolean not null default true,
  superseded_by   uuid references public.user_facts(id) on delete set null,
  superseded_at   timestamptz,

  -- Provenance — every fact must point back to the note it came from so
  -- the UI can show "learned from this note", and so deleting a note can
  -- cascade-delete its facts.
  source_note_id  uuid not null references public.notes(id) on delete cascade,
  source_excerpt  text,             -- the sentence/line from the note

  -- User-confidence: facts the user manually edits get marked so re-
  -- extraction doesn't overwrite them. Reserved for future UI.
  user_edited     boolean not null default false,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.user_facts is
  'Atomic facts extracted from notes. is_latest gates which fact represents the current truth for a (subject, predicate) chain. New extractions supersede old via superseded_by.';

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------

-- Fast supersession lookup: "find the current fact for (user, subject,
-- predicate)". Partial index keeps it tiny — at 10k facts we'd only have
-- ~one entry per chain in here, since superseded rows are excluded.
create index user_facts_chain_latest_idx
  on public.user_facts(user_id, subject, predicate)
  where is_latest;

-- All-facts-for-user listing (for the Facts panel UI).
create index user_facts_user_id_idx
  on public.user_facts(user_id);

-- Cascade lookups when a note is deleted.
create index user_facts_source_note_idx
  on public.user_facts(source_note_id);

-- Vector search across only the *current* facts. Building HNSW over the
-- whole table would waste space indexing superseded rows we never query.
-- Postgres can't put HNSW on a partial subset directly, so we index the
-- full column but rely on the WHERE clause at query time to filter.
create index user_facts_embedding_idx
  on public.user_facts
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Touch updated_at automatically (reuse the helper from the reset migration).
create trigger user_facts_touch_updated_at
  before update on public.user_facts
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Row-level security
-- ============================================================================

alter table public.user_facts enable row level security;

create policy "user_facts_select_own" on public.user_facts
  for select using (auth.uid() = user_id);

create policy "user_facts_insert_own" on public.user_facts
  for insert with check (auth.uid() = user_id);

create policy "user_facts_update_own" on public.user_facts
  for update using (auth.uid() = user_id);

create policy "user_facts_delete_own" on public.user_facts
  for delete using (auth.uid() = user_id);

-- ============================================================================
-- RPC: semantic fact search (current facts only)
-- ============================================================================
-- Mirrors search_notes_by_embedding. SECURITY INVOKER so RLS scopes results
-- to auth.uid() automatically.

create or replace function public.search_facts_by_embedding(
  query_embedding vector(768),
  match_count     int default 5,
  min_similarity  float default 0.0
)
returns table (
  id              uuid,
  subject         text,
  predicate       text,
  object          text,
  statement       text,
  source_note_id  uuid,
  source_excerpt  text,
  created_at      timestamptz,
  similarity      float
)
language sql
stable
security invoker
as $$
  select
    f.id,
    f.subject,
    f.predicate,
    f.object,
    f.statement,
    f.source_note_id,
    f.source_excerpt,
    f.created_at,
    1 - (f.embedding <=> query_embedding) as similarity
  from public.user_facts f
  where f.user_id = auth.uid()
    and f.is_latest = true
    and f.embedding is not null
    and (1 - (f.embedding <=> query_embedding)) >= min_similarity
  order by f.embedding <=> query_embedding
  limit match_count;
$$;

comment on function public.search_facts_by_embedding is
  'Returns the top match_count CURRENT facts (is_latest = true) owned by the caller, ranked by cosine similarity. Filtered by min_similarity. RLS-scoped via SECURITY INVOKER.';

-- ============================================================================
-- RPC: find supersession candidate by (subject, predicate) + similarity
-- ============================================================================
-- Used by extract-facts during reconciliation. Returns the existing latest
-- fact for the same (subject, predicate) IF one exists — that's the row
-- whose is_latest flag we'll flip when inserting the new fact.
--
-- We pass the candidate embedding too: if (subject, predicate) match but
-- similarity is unexpectedly low, the extraction probably aliased an
-- unrelated fact; the caller can decide whether to trust the match.

create or replace function public.find_fact_to_supersede(
  p_subject       text,
  p_predicate     text,
  p_embedding     vector(768)
)
returns table (
  id          uuid,
  statement   text,
  similarity  float
)
language sql
stable
security invoker
as $$
  select
    f.id,
    f.statement,
    case
      when p_embedding is null or f.embedding is null then null
      else 1 - (f.embedding <=> p_embedding)
    end as similarity
  from public.user_facts f
  where f.user_id  = auth.uid()
    and f.subject  = p_subject
    and f.predicate = p_predicate
    and f.is_latest = true
  limit 1;
$$;

comment on function public.find_fact_to_supersede is
  'Returns the current fact (is_latest=true) for the caller matching (subject, predicate), with cosine similarity to the supplied embedding. Used by the fact extractor to decide if a new fact should supersede an existing one.';
