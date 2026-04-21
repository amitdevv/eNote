-- AI layer — user_facts hardening
-- Date: 2026-04-21
--
-- Closes the correctness gaps the initial 20260421000000_user_facts.sql had:
--   1. No uniqueness constraint on the active fact in a chain → concurrent
--      extractions could create two is_latest=true rows for the same
--      (subject, predicate). Without enforcement, retrieval breaks.
--   2. find_fact_to_supersede returned NULL similarity in edge cases; the JS
--      caller fell back to a "always retire" default. We replace it with a
--      transactional upsert that does the lookup, supersession, and insert
--      in one PL/pgSQL block holding an advisory lock per chain.
--   3. extract-facts has no fast path to skip notes whose facts are still
--      current. We add notes.facts_extracted_at so the backfill can resume
--      where it left off and skip work that's already been done.

-- ============================================================================
-- 1. Dedupe any pre-existing latest duplicates BEFORE adding the unique index
-- ============================================================================
-- The system is brand-new but defensive: if any chain already has multiple
-- is_latest=true rows, keep the most recently created and mark the rest as
-- superseded by it. Without this, the unique partial index below would fail
-- to build and the migration would abort halfway.

with ranked as (
  select
    id,
    user_id, subject, predicate,
    row_number() over (
      partition by user_id, subject, predicate
      order by created_at desc, id desc
    ) as rn,
    first_value(id) over (
      partition by user_id, subject, predicate
      order by created_at desc, id desc
    ) as winner_id
  from public.user_facts
  where is_latest = true
)
update public.user_facts f
   set is_latest    = false,
       superseded_by = ranked.winner_id,
       superseded_at = now()
  from ranked
 where ranked.id = f.id
   and ranked.rn > 1;

-- ============================================================================
-- 2. Unique partial index — exactly one is_latest row per chain, per user
-- ============================================================================
-- Belt-and-suspenders: even if our application logic ever races, the DB
-- refuses to write a duplicate. extract-facts catches the unique-violation
-- and retries via the upsert function below.

create unique index if not exists user_facts_chain_unique_latest
  on public.user_facts(user_id, subject, predicate)
  where is_latest = true;

-- ============================================================================
-- 3. notes.facts_extracted_at — for backfill resume + skip-if-fresh
-- ============================================================================

alter table public.notes
  add column if not exists facts_extracted_at timestamptz;

comment on column public.notes.facts_extracted_at is
  'Timestamp of the last successful extract-facts run for this note. Used by the backfill to skip notes whose facts are still current (notes.updated_at <= facts_extracted_at).';

-- Speeds up the "list notes needing extraction" query in the backfill.
create index if not exists notes_facts_extracted_at_idx
  on public.notes(user_id, facts_extracted_at);

-- ============================================================================
-- 4. upsert_user_fact — transactional insert + supersession
-- ============================================================================
-- Replaces the previous "JS does lookup, then JS does insert, then JS does
-- update" three-call dance, which had:
--   - a race between lookup and insert (no row lock)
--   - a race between insert and update (no transaction)
--   - a NULL-similarity fallback that always retired the old fact
--
-- Behavior:
--   - Acquires an advisory lock keyed on hash(user_id || subject || predicate).
--     Serializes all upserts for the same chain across all backends. Lock is
--     held until the surrounding transaction commits.
--   - If the user has manually retired this exact (subject, predicate, object)
--     before (user_edited = true), refuses to resurrect it. Returns
--     skipped_reason = 'user_retired'.
--   - Looks up the current is_latest fact for the chain. If one exists and
--     embedding similarity to the new fact is at least p_min_similarity, marks
--     the old fact superseded_by the new one in the same transaction.
--   - Inserts the new fact (is_latest = true).
--   - Returns inserted_id, superseded_id (nullable), skipped_reason (nullable).

create or replace function public.upsert_user_fact(
  p_subject         text,
  p_predicate       text,
  p_object          text,
  p_statement       text,
  p_source_excerpt  text,
  p_source_note_id  uuid,
  p_embedding       vector(768),
  p_min_similarity  float default 0.5
)
returns table (
  inserted_id    uuid,
  superseded_id  uuid,
  skipped_reason text
)
language plpgsql
security invoker
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
  v_existing_embedding vector(768);
  v_similarity float;
  v_new_id uuid;
  v_superseded_id uuid;
begin
  if v_user_id is null then
    raise exception 'auth.uid() is null — call must be authenticated';
  end if;

  -- Serialize all upserts for this chain. Two concurrent extractions of the
  -- same (subject, predicate) can't interleave their lookup + insert.
  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || '|' || p_subject || '|' || p_predicate, 0)
  );

  -- Refuse to resurrect a fact the user explicitly retired.
  if exists (
    select 1
      from public.user_facts
     where user_id     = v_user_id
       and subject     = p_subject
       and predicate   = p_predicate
       and object      = p_object
       and user_edited = true
  ) then
    return query select null::uuid, null::uuid, 'user_retired'::text;
    return;
  end if;

  -- Find the current latest fact for this chain (if any).
  select id, embedding
    into v_existing_id, v_existing_embedding
    from public.user_facts
   where user_id   = v_user_id
     and subject   = p_subject
     and predicate = p_predicate
     and is_latest = true
   limit 1
   for update;

  -- If an existing fact is similar enough to count as "the same fact, new
  -- value", retire it BEFORE inserting the new one. The unique partial index
  -- requires only one is_latest row per chain at any moment, so we must
  -- demote the old one first.
  if v_existing_id is not null then
    if v_existing_embedding is null or p_embedding is null then
      v_similarity := 0;  -- conservative: no embedding data → don't supersede
    else
      v_similarity := 1 - (v_existing_embedding <=> p_embedding);
    end if;

    if v_similarity >= p_min_similarity then
      update public.user_facts
         set is_latest    = false,
             superseded_at = now()
       where id = v_existing_id;
      v_superseded_id := v_existing_id;
    end if;
  end if;

  -- Insert the new fact. If we didn't supersede the existing one (similarity
  -- too low → it's a different fact that happens to share predicate name),
  -- this insert will violate the unique partial index. Surface that as a
  -- specific error code the caller can catch and decide what to do.
  begin
    insert into public.user_facts (
      user_id, subject, predicate, object, statement, embedding,
      source_note_id, source_excerpt, is_latest
    )
    values (
      v_user_id, p_subject, p_predicate, p_object, p_statement, p_embedding,
      p_source_note_id, p_source_excerpt, true
    )
    returning id into v_new_id;
  exception when unique_violation then
    -- An existing latest fact for this chain wasn't superseded (similarity
    -- below threshold). The caller asked to insert anyway; we refuse and
    -- return the existing fact as the "winner".
    return query select null::uuid, v_existing_id, 'predicate_collision_low_similarity'::text;
    return;
  end;

  -- Wire the supersession pointer now that the new id exists.
  if v_superseded_id is not null then
    update public.user_facts
       set superseded_by = v_new_id
     where id = v_superseded_id;
  end if;

  return query select v_new_id, v_superseded_id, null::text;
end;
$$;

comment on function public.upsert_user_fact is
  'Atomic upsert for a fact. Acquires per-chain advisory lock, refuses to resurrect user-retired facts, supersedes existing fact when similar enough, inserts new fact (is_latest=true), wires superseded_by. RLS-scoped via auth.uid().';

-- ============================================================================
-- 5. Deprecate find_fact_to_supersede
-- ============================================================================
-- Kept for backward compatibility but no longer called by extract-facts.
-- Drop in a future migration once we're sure nothing references it.

comment on function public.find_fact_to_supersede is
  'DEPRECATED. Use upsert_user_fact instead, which performs lookup + insert + supersession atomically. Scheduled for removal.';
