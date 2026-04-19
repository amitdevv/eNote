import { useEmbedPhase } from '../embedStatus';
import { useAIStatus } from '../hooks';

/**
 * Tiny "Indexing…" indicator shown in the note detail header while a save
 * is being embedded. Invisible when:
 *   - the user hasn't connected Gemini (nothing to index)
 *   - the note is idle (no pending/in-flight embed)
 *
 * We intentionally don't show a "done" flash — the indicator is about live
 * work, not recent work. Flashes add noise for zero signal.
 */
export function IndexingDot({ noteId }: { noteId: string }) {
  const phase = useEmbedPhase(noteId);
  const { data: aiStatus } = useAIStatus();
  if (!aiStatus?.connected) return null;
  if (!phase) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-caption text-ink-subtle"
      aria-live="polite"
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-brand opacity-50 animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
      </span>
      Indexing…
    </span>
  );
}
