import { Link } from 'react-router-dom';
import type { Note } from '../types';
import { formatRelative } from '@/shared/lib/date';
import { HugeiconsIcon, PinIcon, ArchiveIcon } from '@/shared/lib/icons';
import { useUpdateNote } from '../hooks';
import { cn } from '@/shared/lib/cn';

export function NoteRow({ note }: { note: Note }) {
  const update = useUpdateNote();
  const preview = note.content_text?.trim().slice(0, 160) || 'Empty note';

  function togglePin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    update.mutate({ id: note.id, patch: { pinned: !note.pinned } });
  }

  function archive(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    update.mutate({ id: note.id, patch: { archived: true } });
  }

  return (
    <Link
      to={`/notes/${note.id}`}
      className="group relative flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/60 focus-visible:bg-surface-muted/60 focus-visible:outline-none transition-colors duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {note.pinned && <HugeiconsIcon icon={PinIcon} size={12} className="text-brand shrink-0" />}
          <span className="text-title font-medium text-ink-strong truncate">
            {note.title || 'Untitled'}
          </span>
        </div>
        <p className="mt-0.5 text-preview text-ink-muted truncate">{preview}</p>
      </div>

      {/* Timestamp — fades out on hover so actions can replace it */}
      <span className="text-preview text-ink-subtle shrink-0 tabular-nums transition-opacity duration-150 group-hover:opacity-0 group-focus-within:opacity-0">
        {formatRelative(note.updated_at)}
      </span>

      {/* Hover / focus actions */}
      <div className="absolute right-4 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
        <button
          onClick={togglePin}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
            note.pinned
              ? 'text-brand hover:bg-surface-active'
              : 'text-ink-subtle hover:bg-surface-active hover:text-ink-strong'
          )}
        >
          <HugeiconsIcon icon={PinIcon} size={14} />
        </button>
        <button
          onClick={archive}
          aria-label="Archive note"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-active hover:text-ink-strong transition-colors"
        >
          <HugeiconsIcon icon={ArchiveIcon} size={14} />
        </button>
      </div>
    </Link>
  );
}
