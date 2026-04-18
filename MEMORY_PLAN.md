# Plan — AI Memory Layer (Supermemory-style)

Adding semantic search and "Ask your notes" to eNote, built on top of the
existing Supabase + Postgres stack using `pgvector`. No new infra, no separate
vector DB.

**Inspiration:** [supermemory.ai](https://supermemory.ai/) — personal AI memory
layer over your own saved content (semantic search + RAG).

---

## What this unlocks

1. **Semantic search** — find a note by *meaning* ("that thing I wrote about
   auth bugs") even when the keywords don't match.
2. **Ask your notes** — natural-language questions answered by an LLM, using
   your relevant notes as retrieval context. Every answer cites the source
   notes.
3. **Related notes** — on a note's detail page, show a "you might also look at"
   list based on cosine similarity to the current note's embedding.
4. **Auto-linking suggestions** — while writing, surface existing notes that
   might be worth linking, based on embedding proximity.

---

## Tech choices

| Decision | Pick | Why |
|---|---|---|
| Vector DB | Supabase `pgvector` | Already on Supabase. Production-ready, Postgres-native. Zero extra infra. |
| Embedding model | OpenAI `text-embedding-3-small` (1536-dim) | Cheap (~$0.02/M tokens), strong quality, widely tested. Upgrade path to `-large` or Voyage-3 later if needed. |
| Index type | HNSW | Better recall/latency tradeoff than IVFFlat for our size. Supabase recommends it. |
| Distance metric | Cosine (`<=>`) | Works best for text embeddings. |
| Embedding runtime | Supabase Edge Function | Keeps the OpenAI API key off the client. Trigger from a DB webhook on note insert/update, or call from a save-hook in the client. |
| Answer LLM | Claude Haiku 4.5 (or GPT-4o-mini) | Cheap (~$0.15/M input tokens), fast, good enough for RAG synthesis. |
| Chunking | Whole notes for v1 | Most notes are short. Revisit if notes grow past ~2k tokens. |

---

## Schema (new migration)

```sql
-- Enable pgvector (idempotent)
create extension if not exists vector;

-- Store the embedding alongside the note for cheap retrieval
alter table public.notes
  add column if not exists embedding vector(1536),
  add column if not exists embedding_model text,
  add column if not exists embedding_updated_at timestamptz;

-- HNSW index for fast nearest-neighbor over cosine similarity
create index if not exists notes_embedding_idx
  on public.notes
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- RPC: given a query vector and the caller, return the top-K closest notes.
-- SECURITY INVOKER so RLS is honored — users can only retrieve their own notes.
create or replace function public.search_notes_by_embedding(
  query_embedding vector(1536),
  match_count int default 5
)
returns table (
  id uuid,
  title text,
  content_text text,
  updated_at timestamptz,
  similarity float
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
  order by n.embedding <=> query_embedding
  limit match_count;
$$;
```

**Why SECURITY INVOKER:** the function executes as the calling user, so
row-level security on `notes` automatically scopes results to their own
notes. No extra auth checks needed.

---

## Embedding pipeline

**Goal:** keep embeddings in sync with note content without blocking the UI.

**Trigger points:**
- Client-side, after `useUpdateNote` or `useCreateNote` succeeds, fire a
  non-blocking call to the `embed-note` Edge Function.
- Debounce 2s per note id so rapid typing doesn't spam the embedding API.

**Edge Function `embed-note` (supabase/functions/embed-note/index.ts):**
1. Auth: verify JWT, get `user_id` from `auth.uid()`.
2. Fetch the note by id (scoped by user_id for safety).
3. Build the embedding text: `${title}\n\n${content_text}` truncated to
   ~8k tokens.
4. POST to OpenAI `/v1/embeddings` with `text-embedding-3-small`.
5. Update `notes.embedding`, `embedding_model = 'text-embedding-3-small'`,
   `embedding_updated_at = now()`.
6. Return 204.

**Backfill:** one-off script that iterates notes with `embedding is null`
and embeds them. Run once after migration.

**Env vars needed:**
- `OPENAI_API_KEY` — Supabase project secret, never client-exposed.

---

## Client-side features (phased delivery)

### Phase 1 — Semantic search (~1 day)

**Scope:** new search mode in the Command Menu ("Ask" or "Semantic").

1. User opens ⌘K → toggles to "Ask" mode (or types `?` prefix).
2. On submit, call an Edge Function `search-notes` that:
   - Embeds the query with the same model.
   - Calls `search_notes_by_embedding(query_vec, 5)`.
   - Returns the top 5 notes + similarity scores.
3. Render results as a ranked list in the command menu. Clicking opens the
   note.
4. **No LLM yet** — just retrieval. Proves the indexing pipeline works and
   delivers immediate user value.

**Acceptance:** typing "auth bug" surfaces the note about login failures even
though it actually says "session token expired."

### Phase 2 — Ask your notes with citations (~1 day)

**Scope:** LLM synthesis on top of Phase 1 retrieval.

1. Same UX as Phase 1, but now the Edge Function also:
   - Takes the top 5 retrieved notes.
   - Builds a prompt: question + note excerpts with ids.
   - Calls Claude Haiku 4.5 or GPT-4o-mini with streaming.
   - Streams the answer back to the client.
2. Client renders the streamed answer in a dedicated pane below the input,
   with **citation chips** like `[1]`, `[2]` that link to the source notes.

**Prompt shape (sketch):**
```
You are answering a question using the user's personal notes as the ONLY
source. Cite the note number in square brackets for every claim.

Notes:
[1] Title: "Auth bug" (2 weeks ago)
    Session tokens were expiring after 15 min due to the wrong refresh path...

[2] Title: "Supabase migration" (5 days ago)
    ...

Question: <user's question>

Answer concisely. If the notes don't contain the answer, say so.
```

### Phase 3 — Related notes (~half day)

**Scope:** on the note detail page, a "Related" card in the sidebar.

1. Take the current note's embedding.
2. Call `search_notes_by_embedding(this_note.embedding, 4)` filtering out
   the current note id.
3. Show 3-4 titles with faded previews.
4. Silently handle: if the note has no embedding yet (still indexing), hide
   the card.

### Phase 4 — Auto-linking while writing (later, optional)

**Scope:** as the user writes, suggest wiki-style `[[links]]` to existing
related notes.

1. On each paragraph commit (on blur or 2s idle), embed the current
   paragraph.
2. Query top-3 related notes.
3. Show subtle chips above the editor: "Link to: [Auth bug] [Session flow]".
4. Clicking inserts a `[[note-id|title]]` link.

**Defer.** Phase 1-3 deliver the 10x value. Phase 4 is polish.

---

## Costs (realistic, 2026 prices)

| Operation | Cost |
|---|---|
| Initial backfill — 1,000 notes × 500 tokens avg | ~$0.01 one-time |
| New note embedding | ~$0.00001 each (fractions of a cent) |
| Semantic search query embedding | ~$0.00001 each |
| LLM answer — 2k input + 300 output via Claude Haiku | ~$0.0004 per ask |

**Typical month for a heavy user** (50 notes created, 100 asks):
~$0.04 — basically noise against existing Supabase + hosting spend.

---

## Privacy / trust considerations

1. **Opt-in, not opt-out.** Add a setting: "AI-powered search and Q&A" — off
   by default for the first rollout, let users turn it on. Indexing doesn't
   start until consent.
2. **No training on user data.** Use OpenAI API with `"store": false` and
   the zero-retention flag on the organization. Add to the privacy policy.
3. **Server-side keys only.** OpenAI key lives in Supabase secrets, never
   in the client bundle.
4. **Delete-on-delete.** When a note is deleted, its embedding is gone
   (it's a column on the notes row). When the account is deleted, the cascade
   takes everything.

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Embedding API is down | Retry with backoff. Show "AI search temporarily unavailable" in UI, fall back to keyword search. |
| Stale embeddings (note edited but embed not yet refreshed) | Debounced 2s update on save. Worst case: search is slightly behind for 2s. |
| Very long notes blow past the 8k token limit | Chunk into 2k-token windows, embed each, store multiple rows per note. (Skip for v1 — most notes are short.) |
| Pricing model changes | Code is isolated in one Edge Function — swap providers in one place. |
| Query injection into the LLM | User's question is passed as user role content, not system. Notes are quoted in the system prompt. No instruction-following exploit path. |

---

## Milestones

- **M1 (ship-ready MVP):** migration + backfill + Edge Function + Phase 1
  semantic search. Demo: "where did I write about X" returns the right note.
- **M2 (WOW demo):** Phase 2 LLM answers with citations. This is the launch
  tweet.
- **M3 (polish):** Phase 3 related-notes sidebar. Subtle but sticky.
- **M4 (optional):** Phase 4 auto-linking while writing.

Target: M1 + M2 shippable in a focused weekend. M3 a few hours after.

---

## Open questions (decide before starting)

1. **Embedding provider:** OpenAI vs Voyage vs local BGE? Default pick:
   OpenAI `text-embedding-3-small`. Reason: known-good, cheap, frictionless.
2. **Client-side vs Edge Function embedding calls?** Edge Function — keeps
   the API key off the client. Non-negotiable.
3. **Rollout:** behind a setting toggle? Yes, per privacy section above.
4. **Billing:** who pays for the LLM calls? For v1, we absorb it. Monitor per-
   user usage; revisit if a heavy user costs more than the subscription.
