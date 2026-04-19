import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks';
import * as api from './api';
import { embedNote } from './api';
import type { SemanticHit } from './api';
import * as convs from './conversations';
import type {
  ConversationSummary,
  ConversationDetail,
} from './conversations';

const keys = {
  status: (userId: string) => ['ai', 'status', userId] as const,
  pendingCount: (userId: string) => ['ai', 'pendingCount', userId] as const,
  todayUsage: (userId: string) => ['ai', 'todayUsage', userId] as const,
  conversations: (userId: string) => ['ai', 'conversations', userId] as const,
  conversation: (id: string) => ['ai', 'conversation', id] as const,
};

export function useAIStatus() {
  const { user } = useAuth();
  return useQuery({
    queryKey: user ? keys.status(user.id) : ['ai', 'status', 'none'],
    queryFn: () => api.getAIStatus(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });
}

export function useConnectGemini() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (apiKey: string) => api.connectGemini(apiKey),
    onSuccess: (status) => {
      if (user) qc.setQueryData(keys.status(user.id), status);
    },
  });
}

export function useDisconnectGemini() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: () => api.disconnectGemini(),
    onSuccess: (status) => {
      if (user) qc.setQueryData(keys.status(user.id), status);
    },
  });
}

/**
 * Backfill up to `batchSize` pending notes sequentially. Returns a callable
 * runner instead of auto-running so the UI decides when (e.g. after connect).
 *
 * Sequential, not parallel — Gemini free tier is RPM-limited and a parallel
 * burst from 200 notes will trip it. We're fine being slow in the background.
 */
export function useBackfillEmbeddings() {
  return useMutation({
    mutationFn: async ({
      onProgress,
    }: {
      onProgress?: (done: number, total: number) => void;
    } = {}) => {
      const total = await api.countPendingEmbeddings();
      if (total === 0) return { total: 0, embedded: 0 };

      let embedded = 0;
      // Process in batches of 20 so we can show progress without loading
      // thousands of rows into memory at once.
      while (true) {
        const batch = await api.listPendingEmbeddings(20);
        if (batch.length === 0) break;
        for (const note of batch) {
          const text = `${note.title}\n\n${note.content_text}`.trim();
          if (!text) {
            embedded += 1;
            continue;
          }
          try {
            await embedNote(note.id, text);
          } catch (e) {
            if (import.meta.env.DEV) console.warn('[ai] backfill item failed', e);
          }
          embedded += 1;
          onProgress?.(embedded, total);
        }
      }
      return { total, embedded };
    },
  });
}

/**
 * Semantic search hook. Only fires when AI is connected and the query has
 * at least 3 characters. Results are cached briefly so navigating away and
 * back doesn't re-embed.
 */
export function useSemanticSearch(query: string) {
  const { data: status } = useAIStatus();
  const enabled = !!status?.connected && query.trim().length >= 3;
  return useQuery<SemanticHit[]>({
    queryKey: ['ai', 'search', query.trim()],
    queryFn: () => api.semanticSearchNotes(query),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

/**
 * Today's Gemini usage for the caller. Refreshed every 30s so the user sees
 * counters tick up without a manual reload.
 */
export function useTodayUsage() {
  const { user } = useAuth();
  const { data: status } = useAIStatus();
  return useQuery({
    queryKey: user ? keys.todayUsage(user.id) : ['ai', 'todayUsage', 'none'],
    queryFn: () => api.getTodayUsage(),
    enabled: !!user && !!status?.connected,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

/**
 * Related notes for the given note id. Returns empty when AI isn't connected
 * or the note hasn't been embedded yet (the RPC returns zero rows in that
 * case — no error).
 */
export function useRelatedNotes(noteId: string | undefined) {
  const { data: status } = useAIStatus();
  const enabled = !!status?.connected && !!noteId;
  return useQuery<SemanticHit[]>({
    queryKey: ['ai', 'related', noteId ?? 'none'],
    queryFn: () => api.getRelatedNotes(noteId!),
    enabled,
    staleTime: 60_000,
    retry: false,
  });
}

// ─── Chat history ───────────────────────────────────────────────────────────

export function useConversations() {
  const { user } = useAuth();
  return useQuery<ConversationSummary[]>({
    queryKey: user ? keys.conversations(user.id) : ['ai', 'conversations', 'none'],
    queryFn: () => convs.listConversations(),
    enabled: !!user,
    staleTime: 10_000,
  });
}

export function useConversation(id: string | undefined) {
  return useQuery<ConversationDetail>({
    queryKey: id ? keys.conversation(id) : ['ai', 'conversation', 'none'],
    queryFn: () => convs.getConversation(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => convs.deleteConversation(id),
    onSuccess: (_void, id) => {
      if (user) qc.invalidateQueries({ queryKey: keys.conversations(user.id) });
      qc.removeQueries({ queryKey: keys.conversation(id) });
    },
  });
}

export function useRenameConversation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      convs.renameConversation(id, title),
    onSuccess: (_void, { id }) => {
      if (user) qc.invalidateQueries({ queryKey: keys.conversations(user.id) });
      qc.invalidateQueries({ queryKey: keys.conversation(id) });
    },
  });
}
