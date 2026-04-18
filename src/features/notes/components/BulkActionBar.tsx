import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { HugeiconsIcon, ArchiveIcon, Delete01Icon, PinIcon } from '@/shared/lib/icons';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { Tooltip } from '@/shared/components/ui/tooltip';
import { useBulkDeleteNotes, useBulkUpdateNotes } from '../hooks';

export function BulkActionBar({
  ids,
  pinnedAll,
  onClear,
}: {
  ids: string[];
  /** true if every selected note is already pinned → show unpin instead of pin */
  pinnedAll: boolean;
  onClear: () => void;
}) {
  const count = ids.length;
  const visible = count > 0;
  const bulkUpdate = useBulkUpdateNotes();
  const bulkDelete = useBulkDeleteNotes();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function archive() {
    await bulkUpdate.mutateAsync({ ids, patch: { archived: true } });
    onClear();
  }

  async function togglePin() {
    await bulkUpdate.mutateAsync({ ids, patch: { pinned: !pinnedAll } });
  }

  async function performDelete() {
    await bulkDelete.mutateAsync(ids);
    onClear();
  }

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center"
          >
            <div
              className={cn(
                'pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-line-default bg-surface-panel shadow-lg p-1 pl-3',
                'text-preview text-ink-default'
              )}
            >
              <span className="pr-2 text-ink-muted tabular-nums">
                {count} selected
              </span>
              <div className="w-px h-5 bg-line-default mx-0.5" />
              <Tooltip content={pinnedAll ? 'Unpin all' : 'Pin all'}>
                <button
                  type="button"
                  onClick={togglePin}
                  disabled={bulkUpdate.isPending}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
                >
                  <HugeiconsIcon icon={PinIcon} size={14} />
                  <span>{pinnedAll ? 'Unpin' : 'Pin'}</span>
                </button>
              </Tooltip>
              <Tooltip content="Archive all">
                <button
                  type="button"
                  onClick={archive}
                  disabled={bulkUpdate.isPending}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
                >
                  <HugeiconsIcon icon={ArchiveIcon} size={14} />
                  <span>Archive</span>
                </button>
              </Tooltip>
              <Tooltip content="Delete all">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={bulkDelete.isPending}
                  className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-ink-muted hover:bg-red-500/10 hover:text-red-600 transition-colors"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                  <span>Delete</span>
                </button>
              </Tooltip>
              <div className="w-px h-5 bg-line-default mx-0.5" />
              <Tooltip content="Clear selection">
                <button
                  type="button"
                  onClick={onClear}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors"
                  aria-label="Clear selection"
                >
                  ×
                </button>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${count} ${count === 1 ? 'note' : 'notes'}?`}
        description="This cannot be undone. Archive instead if you might want them back."
        confirmLabel="Delete"
        destructive
        onConfirm={performDelete}
      />
    </>
  );
}
