import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Note } from '../types';
import { getDisplayTitle } from '../types';
import { formatRelative } from '@/shared/lib/date';
import { HugeiconsIcon, PinIcon, ArchiveIcon } from '@/shared/lib/icons';
import { useUpdateNote } from '../hooks';
import { cn } from '@/shared/lib/cn';
import { LabelChip } from './LabelChip';
import { useLabelColorMap } from '@/features/labels/hooks';
import { Tooltip } from '@/shared/components/ui/tooltip';

type Props = {
  note: Note;
  selected?: boolean;
  anySelected?: boolean;
  onToggleSelect?: (id: string, shiftKey: boolean) => void;
};

export function NoteRow({ note, selected, anySelected, onToggleSelect }: Props) {
  const update = useUpdateNote();
  const colorMap = useLabelColorMap();
  const title = getDisplayTitle(note);
  const hasRealTitle = !!note.title?.trim() && note.title !== 'Untitled';
  const preview = hasRealTitle
    ? (note.content_text?.trim().slice(0, 180) || '')
    : (note.content_text?.split('\n').slice(1).join(' ').trim().slice(0, 180) || '');

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

  function onCheckboxClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onToggleSelect?.(note.id, e.shiftKey);
  }

  return (
    <motion.div
      layout="position"
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
      className={cn(selected && 'bg-brand/5')}
    >
      <Link
        to={`/notes/${note.id}`}
        className="group relative flex items-center gap-3 pl-3 pr-4 py-3.5 hover:bg-surface-muted/60 focus-visible:bg-surface-muted/60 focus-visible:outline-none transition-colors duration-150"
      >
        {/* Checkbox — visible on hover always, always when any selected */}
        {onToggleSelect && (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={selected ? 'Deselect note' : 'Select note'}
            onClick={onCheckboxClick}
            className={cn(
              'shrink-0 size-4 rounded border flex items-center justify-center transition-all duration-150',
              selected
                ? 'bg-brand border-brand text-white opacity-100'
                : 'border-line-default bg-surface-raised text-transparent',
              anySelected || selected
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
            )}
          >
            {selected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                <path
                  d="M1 4l2.5 2.5L9 1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {note.pinned && <HugeiconsIcon icon={PinIcon} size={13} className="text-brand shrink-0" />}
            <span className="text-title font-medium text-ink-strong truncate">{title}</span>
            {note.labels && note.labels.length > 0 && (
              <span className="flex items-center gap-1 shrink-0">
                {note.labels.slice(0, 3).map((l) => (
                  <LabelChip key={l} label={l} color={colorMap[l]} size="xs" />
                ))}
                {note.labels.length > 3 && (
                  <span className="text-[11px] text-ink-subtle">+{note.labels.length - 3}</span>
                )}
              </span>
            )}
          </div>
          {preview ? (
            <p className="mt-0.5 text-preview text-ink-muted truncate">{preview}</p>
          ) : (
            <p className="mt-0.5 text-preview text-ink-placeholder italic">Empty note</p>
          )}
        </div>

        <span className="text-preview text-ink-subtle shrink-0 tabular-nums transition-opacity duration-150 group-hover:opacity-0 group-focus-within:opacity-0">
          {formatRelative(note.updated_at)}
        </span>

        <div className="absolute right-4 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
          <Tooltip content={note.pinned ? 'Unpin' : 'Pin'}>
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
          </Tooltip>
          <Tooltip content="Archive">
            <button
              onClick={archive}
              aria-label="Archive note"
              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-active hover:text-ink-strong transition-colors"
            >
              <HugeiconsIcon icon={ArchiveIcon} size={14} />
            </button>
          </Tooltip>
        </div>
      </Link>
    </motion.div>
  );
}
