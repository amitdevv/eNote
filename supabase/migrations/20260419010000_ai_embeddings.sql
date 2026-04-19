-- AI layer — Milestone 1
-- Adds pgvector support, per-note embedding column, HNSW index, semantic-search
-- RPC, and BYOK (bring-your-own-key) columns on user_settings for Gemini.
--
-- 768-dim because Google's text-embedding-004 returns 768. If we ever add a
-- second embedding provider we'll either pad/truncate to 768 or add separate
-- columns per model. Not worth designing for that today.

-- ============================================================================
-- Extensions
-- ============================================================================

create extension if not exists vector;

-- ============================================================================
-- Embeddings on notes
-- ============================================================================

alter table public.notes
  add column if not exists embedding            vector(768),
  add column if not exists embedding_updated_at timestamptz;

-- HNSW index tuned for small-medium scale. Cosine distance matches how we
-- query via `1 - (embedding <=> query)`.
create index if not exists notes_embedding_idx
  on public.notes
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- ============================================================================
-- BYOK — Gemini key storage on user_settings
-- ============================================================================
-- We store an AES-256-GCM ciphertext (base64). Encryption/decryption happens
-- in Edge Functions using a server-side ENCRYPTION_KEY. The raw key never
-- lives in the DB and never goes back to the client.

alter table public.user_settings
  add column if not exists gemini_key_ciphertext text,
  add column if not exists gemini_key_last4      text,
  add column if not exists gemini_connected_at   timestamptz;

-- ============================================================================
-- RPC: semantic search (scoped to caller via RLS)
-- ============================================================================
-- SECURITY INVOKER so RLS on notes auto-scopes results to auth.uid().

create or replace function public.search_notes_by_embedding(
  query_embedding vector(768),
  match_count     int default 5,
  exclude_id      uuid default null
)
returns table (
  id            uuid,
  title         text,
  content_text  text,
  updated_at    timestamptz,
  similarity    float
)
language sql
stable
security invoker
as $$
  select
    n.id,
    n.title,
    n.content_text,
    n.updated_at,
    1 - (n.embedding <=> query_embedding) as similarity
  from public.notes n
  where n.user_id = auth.uid()
    and n.archived = false
    and n.embedding is not null
    and (exclude_id is null or n.id <> exclude_id)
  order by n.embedding <=> query_embedding
  limit match_count;
$$;

comment on function public.search_notes_by_embedding is
  'Returns the top match_count notes owned by the caller, ranked by cosine similarity to query_embedding. RLS-scoped via SECURITY INVOKER.';

-- ============================================================================
-- Helper view: notes pending embedding (for backfill UIs)
-- ============================================================================

create or replace view public.notes_pending_embedding as
  select id, user_id, title, updated_at
  from public.notes
  where embedding is null
    and archived = false
    and user_id = auth.uid();

comment on view public.notes_pending_embedding is
  'Caller-scoped list of non-archived notes that still need an embedding.';
