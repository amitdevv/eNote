import { Link } from 'react-router-dom';
import type { Note } from '../types';
import { formatRelative } from '@/shared/lib/date';
import { HugeiconsIcon, PinIcon, ArchiveIcon } from '@/shared/lib/icons';
import { useUpdateNote } from '../hooks';
import { cn } from '@/shared/lib/cn';

export function NoteRow({ note }: { note: Note }) {
  const update = useUpdateNote();
  const preview = note.content_text?.trim().slice(0, 140) || 'Empty note';

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
      className="group flex items-center gap-3 px-4 py-3 hover:bg-surface-muted/60 transition-colors duration-150"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {note.pinned && <HugeiconsIcon icon={PinIcon} size={13} className="text-brand shrink-0" />}
          <span className="text-title font-medium text-ink-strong truncate">
            {note.title || 'Untitled'}
          </span>
        </div>
        <p className="mt-0.5 text-preview text-ink-muted truncate">{preview}</p>
      </div>

      {/* Hover actions */}
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          onClick={togglePin}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-active hover:text-ink-strong transition-colors',
            note.pinned && 'text-brand'
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

      <span className="text-preview text-ink-subtle shrink-0 group-hover:hidden">
        {formatRelative(note.updated_at)}
      </span>
    </Link>
  );
}
