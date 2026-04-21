import { extractFactsForNote } from './api';

// Debounced per-note fact-extraction scheduler. Mirrors embedQueue but with
// a longer debounce — extraction is one Gemini chat call PLUS one embedding
// per fact, so it's ~3-5x more expensive than embedding alone. We don't
// want to fire it on every keystroke or every save while the user is mid-
// edit. Five seconds of idle is the sweet spot.
//
// Fire-and-forget. If the user hasn't connected Gemini, the Edge Function
// returns 400 and we silently drop. Backfill catches up when they connect.
//
// We DON'T publish per-note status to a UI store today — fact extraction
// is invisible by design (the user notices it via better answers in Ask).
// If we ever want a "smart memory updating…" pill, plumb it the same way
// embedQueue uses useEmbedStatus.

const DEBOUNCE_MS = 5_000;
const timers = new Map<string, number>();

export function scheduleExtractFacts(noteId: string): void {
  const existing = timers.get(noteId);
  if (existing !== undefined) clearTimeout(existing);

  const handle = setTimeout(async () => {
    timers.delete(noteId);
    try {
      await extractFactsForNote(noteId);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn('[ai] fact extraction skipped', { noteId, err: e });
      }
    }
  }, DEBOUNCE_MS);
  timers.set(noteId, handle as unknown as number);
}

export function cancelExtractFacts(noteId: string): void {
  const existing = timers.get(noteId);
  if (existing !== undefined) {
    clearTimeout(existing);
    timers.delete(noteId);
  }
}
