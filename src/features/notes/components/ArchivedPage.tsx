import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotes, useUpdateNote, useDeleteNote } from '../hooks';
import { getDisplayTitle } from '../types';
import { Spinner } from '@/shared/components/ui/spinner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { formatRelative } from '@/shared/lib/date';
import { HugeiconsIcon, ArchiveIcon, Delete01Icon } from '@/shared/lib/icons';
import { useState } from 'react';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export function ArchivedPage() {
  useDocumentTitle('Archived');
  const { data: notes, isLoading } = useNotes({ archived: true });
  const update = useUpdateNote();
  const del = useDeleteNote();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function unarchive(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    update.mutate({ id, patch: { archived: false } });
  }

  return (
    <>
      <PageHeader
        title="Archived"
        trailing={
          <Link to="/notes" className="text-preview text-ink-muted hover:text-ink-strong transition-colors">
            ← Back to Notes
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}

        {!isLoading && (!notes || notes.length === 0) && (
          <EmptyState
            icon={<HugeiconsIcon icon={ArchiveIcon} size={28} className="text-ink-subtle" />}
            title="Nothing archived"
            description="Archived notes appear here. You can restore or delete them."
          />
        )}

        {notes && notes.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="divide-y divide-line-subtle"
          >
            {notes.map((n) => {
              const title = getDisplayTitle(n);
              const hasRealTitle = !!n.title?.trim() && n.title !== 'Untitled';
              const preview = hasRealTitle
                ? (n.content_text?.trim().slice(0, 180) || 'Empty note')
                : (n.content_text?.split('\n').slice(1).join(' ').trim().slice(0, 180) || '');
              return (
                <Link
                  key={n.id}
                  to={`/notes/${n.id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 hover:bg-surface-muted/60 transition-colors duration-150"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-title font-medium text-ink-strong truncate block">
                      {title}
                    </span>
                    {preview ? (
                      <p className="mt-0.5 text-preview text-ink-muted truncate">{preview}</p>
                    ) : (
                      <p className="mt-0.5 text-preview text-ink-placeholder italic">Empty note</p>
                    )}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => unarchive(e, n.id)}
                      aria-label="Restore"
                      className="flex h-7 items-center gap-1 rounded-md px-2 text-caption text-ink-subtle hover:bg-surface-active hover:text-ink-strong transition-colors"
                    >
                      Restore
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmDelete(n.id);
                      }}
                      aria-label="Delete permanently"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors"
                    >
                      <HugeiconsIcon icon={Delete01Icon} size={14} />
                    </button>
                  </div>
                  <span className="text-preview text-ink-subtle shrink-0 group-hover:hidden">
                    {formatRelative(n.updated_at)}
                  </span>
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete permanently?"
        description="This note will be deleted forever and cannot be recovered."
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={async () => {
          if (confirmDelete) await del.mutateAsync(confirmDelete);
        }}
      />

    </>
  );
}
