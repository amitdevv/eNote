-- AI layer — Milestone 2
-- Adds the `related_notes_by_id` RPC so the client can ask for neighbors
-- of an existing note without having to fetch its 768-dim embedding and
-- ship it back over the wire on every render.
--
-- Scoped via SECURITY INVOKER: auth.uid() gates both the source lookup
-- and the neighbor scan through RLS on notes.

create or replace function public.related_notes_by_id(
  source_id   uuid,
  match_count int default 3
)
returns table (
  id           uuid,
  title        text,
  content_text text,
  updated_at   timestamptz,
  similarity   float
)
language sql
stable
security invoker
as $$
  with src as (
    select embedding
    from public.notes
    where id = source_id
      and user_id = auth.uid()
      and embedding is not null
    limit 1
  )
  select
    n.id,
    n.title,
    n.content_text,
    n.updated_at,
    1 - (n.embedding <=> s.embedding) as similarity
  from public.notes n, src s
  where n.user_id = auth.uid()
    and n.archived = false
    and n.embedding is not null
    and n.id <> source_id
  order by n.embedding <=> s.embedding
  limit match_count;
$$;

comment on function public.related_notes_by_id is
  'Returns up to match_count notes most similar to source_id (by cosine), excluding the source. RLS-scoped via SECURITY INVOKER.';
