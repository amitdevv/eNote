import { supabase } from '@/shared/lib/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

export type AIStatus = {
  connected: boolean;
  last4: string | null;
  connectedAt: string | null;
};

// ─── Edge Function base ─────────────────────────────────────────────────────

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function callFn<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${FN_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body && typeof body === 'object' && 'error' in body && body.error)
      || `Request failed (${res.status})`;
    throw new Error(String(msg));
  }
  return body as T;
}

// ─── AI status (derived from user_settings via direct SELECT) ───────────────

export async function getAIStatus(userId: string): Promise<AIStatus> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('gemini_key_last4, gemini_connected_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data || !data.gemini_key_last4) {
    return { connected: false, last4: null, connectedAt: null };
  }
  return {
    connected: true,
    last4: data.gemini_key_last4 as string,
    connectedAt: (data.gemini_connected_at as string | null) ?? null,
  };
}

// ─── BYOK key management ────────────────────────────────────────────────────

export async function connectGemini(apiKey: string): Promise<AIStatus> {
  const res = await callFn<{ connected: true; last4: string; connectedAt: string }>(
    '/gemini-key',
    { method: 'POST', body: JSON.stringify({ apiKey }) },
  );
  return { connected: true, last4: res.last4, connectedAt: res.connectedAt };
}

export async function disconnectGemini(): Promise<AIStatus> {
  await callFn<{ connected: false }>('/gemini-key', { method: 'DELETE' });
  return { connected: false, last4: null, connectedAt: null };
}

// ─── Embeddings ─────────────────────────────────────────────────────────────

/**
 * Embed text + write it to a note row in a single server round-trip.
 * Fire-and-forget from note save hooks.
 */
export async function embedNote(noteId: string, text: string): Promise<void> {
  await callFn('/gemini-embed', {
    method: 'POST',
    body: JSON.stringify({ noteId, text }),
  });
}

/** Embed arbitrary text and return the vector — used by search queries. */
export async function embedQuery(text: string): Promise<number[]> {
  const res = await callFn<{ embedding: number[] }>('/gemini-embed', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  return res.embedding;
}

// ─── Fact extraction ────────────────────────────────────────────────────────

export type ExtractFactsResult = {
  ok: true;
  extracted: number;
  superseded: number;
  facts: { id: string; predicate: string; statement: string }[];
};

/**
 * Extract atomic facts from a note. Replaces any prior facts from the same
 * note. Reconciles vs existing facts: if the new fact has the same
 * (subject, predicate) as an existing latest fact, the old one is marked
 * is_latest = false and superseded_by points to the new row.
 *
 * Fire-and-forget from the note save hook (via factsQueue).
 */
export async function extractFactsForNote(noteId: string): Promise<ExtractFactsResult> {
  return callFn<ExtractFactsResult>('/extract-facts', {
    method: 'POST',
    body: JSON.stringify({ noteId }),
  });
}

/**
 * List non-archived notes that NEED fact extraction. A note needs extraction
 * if it hasn't been extracted yet OR if it was modified after its last
 * extraction. Lets the backfill resume across sessions and skip work that's
 * already current — the difference between a 70-minute re-run and a
 * 30-second tail update.
 *
 * We deliberately fetch only ids and titles — content_text isn't needed
 * client-side because extract-facts loads it server-side.
 */
export async function listNoteIdsForFactBackfill(): Promise<{ id: string; title: string }[]> {
  // PostgREST .or() with column-comparison: facts_extracted_at IS NULL
  // (never extracted) OR notes.updated_at > facts_extracted_at (note edited
  // after last extraction). The second branch needs a JS-side filter because
  // PostgREST doesn't expose direct column-vs-column comparison in .or().
  const { data, error } = await supabase
    .from('notes')
    .select('id,title,updated_at,facts_extracted_at')
    .eq('archived', false)
    .order('created_at', { ascending: true });
  if (error) throw error;
  type Row = { id: string; title: string; updated_at: string; facts_extracted_at: string | null };
  return ((data ?? []) as Row[])
    .filter((r) => {
      if (!r.facts_extracted_at) return true;
      return new Date(r.updated_at).getTime() > new Date(r.facts_extracted_at).getTime();
    })
    .map((r) => ({ id: r.id, title: r.title }));
}

// ─── Facts (catalog + manual retirement) ────────────────────────────────────

export type UserFact = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  statement: string;
  source_note_id: string;
  source_excerpt: string | null;
  source_note_title: string | null;
  is_latest: boolean;
  superseded_by: string | null;
  superseded_at: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * List every CURRENT fact (is_latest=true) for the caller, with the source
 * note's title joined in for display. Newest first.
 */
export async function listMyFacts(): Promise<UserFact[]> {
  const { data, error } = await supabase
    .from('user_facts')
    .select(
      'id,subject,predicate,object,statement,source_note_id,source_excerpt,is_latest,superseded_by,superseded_at,created_at,updated_at,notes:source_note_id(title)'
    )
    .eq('is_latest', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // PostgREST returns the embedded `notes` relationship as an array even for
  // a to-one foreign key. We always read the first (and only) element.
  type Row = Omit<UserFact, 'source_note_title'> & {
    notes: { title: string }[] | { title: string } | null;
  };
  return ((data ?? []) as unknown as Row[]).map((r) => {
    const joined = Array.isArray(r.notes) ? r.notes[0] : r.notes;
    return {
      id: r.id,
      subject: r.subject,
      predicate: r.predicate,
      object: r.object,
      statement: r.statement,
      source_note_id: r.source_note_id,
      source_excerpt: r.source_excerpt,
      source_note_title: joined?.title ?? null,
      is_latest: r.is_latest,
      superseded_by: r.superseded_by,
      superseded_at: r.superseded_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}

/**
 * Manually retire a fact the user disagrees with. Sets is_latest=false but
 * leaves superseded_by NULL so we know it was a manual retirement, not
 * automatic supersession by a newer fact.
 */
export async function retireFact(factId: string): Promise<void> {
  const { error } = await supabase
    .from('user_facts')
    .update({
      is_latest: false,
      superseded_at: new Date().toISOString(),
      user_edited: true,
    })
    .eq('id', factId);
  if (error) throw error;
}

// ─── Search & related ───────────────────────────────────────────────────────

export type SemanticHit = {
  id: string;
  title: string;
  content_text: string;
  updated_at: string;
  similarity: number;
};

/**
 * Embed the query via the Edge Function, then nearest-neighbor against the
 * caller's notes through the RLS-scoped RPC. Two round trips on purpose —
 * query embedding happens rarely (user types + debounce) and we keep the key
 * server-side.
 */
export async function semanticSearchNotes(
  query: string,
  limit = 5,
): Promise<SemanticHit[]> {
  const q = query.trim();
  if (!q) return [];
  const embedding = await embedQuery(q);
  // pgvector accepts the Postgres text form `[n1,n2,...]` via PostgREST.
  // Passing as a string avoids any ambiguous array-type coercion on the way
  // through the RPC boundary.
  const vecLiteral = `[${embedding.join(',')}]`;
  const { data, error } = await supabase.rpc('search_notes_by_embedding', {
    query_embedding: vecLiteral,
    match_count: limit,
  });
  if (error) throw error;
  return (data ?? []) as SemanticHit[];
}

export async function getRelatedNotes(
  noteId: string,
  limit = 3,
): Promise<SemanticHit[]> {
  const { data, error } = await supabase.rpc('related_notes_by_id', {
    source_id: noteId,
    match_count: limit,
  });
  if (error) throw error;
  return (data ?? []) as SemanticHit[];
}

// ─── Ask (streaming) ────────────────────────────────────────────────────────

export type AskSource = {
  n: number;
  id: string;
  title: string;
  preview: string;
  similarity: number;
  updatedAt: string;
};

export type AskHandlers = {
  onConversation?: (info: { id: string; isNew: boolean }) => void;
  onSources?: (sources: AskSource[]) => void;
  onToken?: (text: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
  signal?: AbortSignal;
};

/**
 * Stream an answer from `gemini-ask`. The server emits SSE frames with events
 * `conversation`, `sources`, `token`, `done`, `error`. We parse frame-by-frame
 * and fan out to handlers — no external SSE library needed.
 */
export async function askNotes(
  question: string,
  opts: { conversationId?: string | null } & AskHandlers,
): Promise<void> {
  const { conversationId, ...h } = opts;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    h.onError?.('Not authenticated');
    return;
  }

  const res = await fetch(`${FN_BASE}/gemini-ask`, {
    method: 'POST',
    signal: h.signal,
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      accept: 'text/event-stream',
    },
    body: JSON.stringify({ question, conversationId: conversationId ?? null }),
  });

  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => ({}));
    h.onError?.(String(body?.error ?? `Request failed (${res.status})`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let frameEnd: number;
      while ((frameEnd = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, frameEnd);
        buffer = buffer.slice(frameEnd + 2);

        let event = 'message';
        const dataLines: string[] = [];
        for (const line of frame.split('\n')) {
          if (line.startsWith('event: ')) event = line.slice(7);
          else if (line.startsWith('data: ')) dataLines.push(line.slice(6));
        }
        if (dataLines.length === 0 && event !== 'done') continue;
        const payload = dataLines.join('\n');

        if (event === 'conversation') {
          try {
            h.onConversation?.(JSON.parse(payload));
          } catch {
            // ignore
          }
        } else if (event === 'sources') {
          try {
            h.onSources?.(JSON.parse(payload) as AskSource[]);
          } catch {
            // ignore
          }
        } else if (event === 'token') {
          try {
            h.onToken?.(JSON.parse(payload) as string);
          } catch {
            // some providers send plain strings; fall back
            h.onToken?.(payload);
          }
        } else if (event === 'done') {
          h.onDone?.();
          return;
        } else if (event === 'error') {
          try {
            h.onError?.(JSON.parse(payload) as string);
          } catch {
            h.onError?.(payload);
          }
          return;
        }
      }
    }
  } catch (e) {
    if ((e as Error)?.name !== 'AbortError') {
      h.onError?.(e instanceof Error ? e.message : 'Stream failed');
    }
  }
}

// ─── Today's usage ──────────────────────────────────────────────────────────

export type TodayUsage = {
  day: string; // YYYY-MM-DD (UTC)
  embeds: number;
  asks: number;
};

export async function getTodayUsage(): Promise<TodayUsage> {
  // Match the UTC day the server uses.
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('ai_usage')
    .select('action,count')
    .eq('day', today);
  if (error) throw error;
  let embeds = 0;
  let asks = 0;
  for (const row of (data ?? []) as { action: string; count: number }[]) {
    if (row.action === 'embed') embeds += row.count;
    else if (row.action === 'ask') asks += row.count;
  }
  return { day: today, embeds, asks };
}

// ─── Pending-embedding list (for backfill) ──────────────────────────────────

export async function countPendingEmbeddings(): Promise<number> {
  const { count, error } = await supabase
    .from('notes')
    .select('id', { count: 'exact', head: true })
    .is('embedding', null)
    .eq('archived', false);
  if (error) throw error;
  return count ?? 0;
}

export async function listPendingEmbeddings(limit = 50): Promise<
  { id: string; title: string; content_text: string }[]
> {
  const { data, error } = await supabase
    .from('notes')
    .select('id,title,content_text')
    .is('embedding', null)
    .eq('archived', false)
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as { id: string; title: string; content_text: string }[];
}

/**
 * Clear the embedding + embedding_updated_at on every non-archived note for
 * the caller. After this, the backfill mutation will re-embed them all.
 * Used when we change the embedding model or task-type hints — old vectors
 * are still mathematically valid but live in a different space, so the
 * cleanest fix is a full re-embed.
 */
export async function clearAllEmbeddings(userId: string): Promise<number> {
  // `.select('id')` after an update returns the affected rows; we use its
  // length as the count. The count-option overload isn't available on update
  // builders, and a separate COUNT query would race against the update.
  const { data, error } = await supabase
    .from('notes')
    .update({ embedding: null, embedding_updated_at: null })
    .eq('user_id', userId)
    .eq('archived', false)
    .not('embedding', 'is', null)
    .select('id');
  if (error) throw error;
  return data?.length ?? 0;
}
