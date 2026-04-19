import { Link } from 'react-router-dom';
import { useRelatedNotes } from '../hooks';
import { HugeiconsIcon, Note01Icon } from '@/shared/lib/icons';

/**
 * A compact "Related" section for the note detail page. Silent when:
 *   - AI is not connected
 *   - the note hasn't been embedded yet (RPC returns 0 rows)
 *   - there simply aren't any close neighbors
 *
 * We don't render a placeholder in any of those cases — the card only
 * appears when it's actually useful. That keeps notes with no neighbors
 * (short notes, brand-new notes) looking clean.
 */
export function RelatedNotes({ noteId }: { noteId: string }) {
  const { data, isLoading } = useRelatedNotes(noteId);

  if (isLoading) return null;
  if (!data || data.length === 0) return null;

  return (
    <aside className="mt-16 pt-6 border-t border-line-subtle">
      <h3 className="text-micro font-medium uppercase tracking-wider text-ink-subtle mb-3">
        Related
      </h3>
      <ul className="flex flex-col gap-1">
        {data.map((hit) => {
          const title = hit.title?.trim() || 'Untitled';
          const preview = hit.content_text?.slice(0, 140) ?? '';
          return (
            <li key={hit.id}>
              <Link
                to={`/notes/${hit.id}`}
                className="group flex items-start gap-3 rounded-lg px-2.5 py-2 -mx-2.5 hover:bg-surface-muted transition-colors"
              >
                <HugeiconsIcon
                  icon={Note01Icon}
                  size={14}
                  className="text-ink-subtle mt-[3px] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-preview text-ink-strong font-medium truncate block">
                    {title}
                  </span>
                  {preview && (
                    <p className="text-caption text-ink-muted truncate">
                      {preview}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
