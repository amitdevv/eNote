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
