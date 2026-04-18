import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Note } from '../types';
import { getDisplayTitle } from '../types';
import { formatRelative } from '@/shared/lib/date';
import { useState } from 'react';
import { HugeiconsIcon, PinIcon, ArchiveIcon, Delete01Icon } from '@/shared/lib/icons';
import { useUpdateNote, useDeleteNote } from '../hooks';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
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

export function NoteCard({ note, selected, anySelected, onToggleSelect }: Props) {
  const update = useUpdateNote();
  const del = useDeleteNote();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colorMap = useLabelColorMap();
  const title = getDisplayTitle(note);
  const hasRealTitle = !!note.title?.trim() && note.title !== 'Untitled';
  const preview = hasRealTitle
    ? (note.content_text?.trim().slice(0, 320) || '')
    : (note.content_text?.split('\n').slice(1).join(' ').trim().slice(0, 320) || '');

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

  function onDeleteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(true);
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
    >
      <Link
        to={`/notes/${note.id}`}
        className={cn(
          'group relative flex flex-col gap-2 min-h-[92px] rounded-xl border bg-surface-raised p-4',
          'transition-[box-shadow,border-color] duration-150',
          'hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12),0_2px_6px_-3px_rgba(0,0,0,0.06)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          selected
            ? 'border-brand bg-brand/5'
            : 'border-line-default hover:border-line-default',
        )}
      >
        {/* Selection checkbox — nudged into the top-left corner so it never
            sits over the title text. */}
        {onToggleSelect && (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={selected ? 'Deselect note' : 'Select note'}
            onClick={onCheckboxClick}
            className={cn(
              'absolute top-2 left-2 size-4 rounded border flex items-center justify-center transition-all duration-150 z-10',
              selected
                ? 'bg-brand border-brand text-white opacity-100'
                : 'border-line-default bg-surface-raised text-transparent',
              anySelected || selected
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100',
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

        {/* Title row — pushes right when the checkbox is visible so it never
            sits under the checkbox. */}
        <div
          className={cn(
            'flex items-start gap-2 min-w-0',
            (anySelected || selected) && 'pl-5',
          )}
        >
          {note.pinned && (
            <HugeiconsIcon
              icon={PinIcon}
              size={13}
              className="text-brand shrink-0 mt-[3px]"
            />
          )}
          <h3 className="flex-1 text-title font-semibold text-ink-strong line-clamp-2 leading-[1.3]">
            {title}
          </h3>
        </div>

        {/* Preview — only renders when there's actual content */}
        {preview && (
          <p
            className="flex-1 text-preview leading-[1.55] overflow-hidden text-ink-muted"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}
          >
            {preview}
          </p>
        )}

        {/* Footer: labels + timestamp — always shown, spacer pushes to bottom */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            {note.labels && note.labels.length > 0 && (
              <>
                {note.labels.slice(0, 2).map((l) => (
                  <LabelChip key={l} label={l} color={colorMap[l]} size="xs" />
                ))}
                {note.labels.length > 2 && (
                  <span className="text-micro text-ink-subtle shrink-0">
                    +{note.labels.length - 2}
                  </span>
                )}
              </>
            )}
          </div>
          <span className="text-micro text-ink-subtle shrink-0 tabular-nums transition-opacity duration-150 group-hover:opacity-0">
            {formatRelative(note.updated_at)}
          </span>
        </div>

        {/* Hover actions — replace timestamp on hover */}
        <div className="absolute right-3 bottom-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
          <Tooltip content={note.pinned ? 'Unpin' : 'Pin'}>
            <button
              onClick={togglePin}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-colors bg-surface-raised',
                note.pinned
                  ? 'text-brand hover:bg-surface-active'
                  : 'text-ink-subtle hover:bg-surface-active hover:text-ink-strong',
              )}
            >
              <HugeiconsIcon icon={PinIcon} size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Archive">
            <button
              onClick={archive}
              aria-label="Archive note"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-raised text-ink-subtle hover:bg-surface-active hover:text-ink-strong transition-colors"
            >
              <HugeiconsIcon icon={ArchiveIcon} size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Delete">
            <button
              onClick={onDeleteClick}
              aria-label="Delete note"
              className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-raised text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors"
            >
              <HugeiconsIcon icon={Delete01Icon} size={14} />
            </button>
          </Tooltip>
        </div>
      </Link>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete note?"
        description="This cannot be undone. Archive instead if you might want it back."
        confirmLabel="Delete"
        destructive
        onConfirm={() => del.mutateAsync(note.id)}
      />
    </motion.div>
  );
}
