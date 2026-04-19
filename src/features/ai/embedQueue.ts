import { embedNote } from './api';
import { useEmbedStatus } from './embedStatus';

// Debounced per-note embedding scheduler. Call schedule(id, buildText) after
// a note save succeeds; if the same note is saved again within DEBOUNCE_MS
// the previous scheduled call is replaced (we only want to embed the latest).
//
// Runs as fire-and-forget from the client. If the user hasn't connected
// Gemini yet, the Edge Function returns 400 and we silently drop — the
// backfill pass (on first connect) will catch up later.
//
// Also publishes per-note phase (pending → embedding → cleared) into the
// embedStatus store so the UI can render a live "Indexing…" indicator.

const DEBOUNCE_MS = 2_000;
const timers = new Map<string, number>();

export function scheduleEmbed(
  noteId: string,
  buildText: () => string,
): void {
  const existing = timers.get(noteId);
  if (existing !== undefined) clearTimeout(existing);

  useEmbedStatus.getState().set(noteId, 'pending');

  const handle = setTimeout(async () => {
    timers.delete(noteId);
    const text = buildText().trim();
    if (!text) {
      useEmbedStatus.getState().clear(noteId);
      return;
    }
    useEmbedStatus.getState().set(noteId, 'embedding');
    try {
      await embedNote(noteId, text);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[ai] embed skipped', { noteId, err: e });
      }
    } finally {
      useEmbedStatus.getState().clear(noteId);
    }
  }, DEBOUNCE_MS);
  timers.set(noteId, handle as unknown as number);
}

export function cancelEmbed(noteId: string): void {
  const existing = timers.get(noteId);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(noteId);
    useEmbedStatus.getState().clear(noteId);
  }
}

export function buildEmbedText(title: string, content_text: string): string {
  const t = (title ?? '').trim();
  const c = (content_text ?? '').trim();
  if (t && c) return `${t}\n\n${c}`;
  return t || c;
}
