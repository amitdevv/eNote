import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes } from '../hooks';
import { useNotesUI } from '../store';
import { NoteCard } from './NoteCard';
import { NotesSkeleton } from './NoteRowSkeleton';
import { BulkActionBar } from './BulkActionBar';
import { NotesFilterBar, DEFAULT_FILTERS, type FilterState } from './NotesFilterBar';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Button } from '@/shared/components/ui/button';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { HugeiconsIcon, Note01Icon } from '@/shared/lib/icons';

export function NotesListPage() {
  useDocumentTitle('Notes');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const { data: notes, isLoading } = useNotes(filters);
  const setQuickCaptureOpen = useNotesUI((s) => s.setQuickCaptureOpen);

  function handleCreate() {
    setQuickCaptureOpen(true);
  }

  const visible = notes ?? [];

  // Multi-select state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  function toggleSelect(id: string, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClickedId) {
        const list = visible.map((n) => n.id);
        const a = list.indexOf(lastClickedId);
        const b = list.indexOf(id);
        if (a !== -1 && b !== -1) {
          const [start, end] = a < b ? [a, b] : [b, a];
          for (let i = start; i <= end; i++) next.add(list[i]);
          setLastClickedId(id);
          return next;
        }
      }
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setLastClickedId(id);
      return next;
    });
  }

  const selectedIds = useMemo(() => [...selected], [selected]);
  const pinnedAll = selectedIds.length > 0 && selectedIds.every((id) => {
    const note = (notes ?? []).find((n) => n.id === id);
    return note?.pinned === true;
  });

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Notes
            {notes && notes.length > 0 && (
              <span className="text-caption font-normal text-ink-subtle tabular-nums">
                {notes.length}
              </span>
            )}
          </span>
        }
        trailing={
          <Button size="sm" variant="default" onClick={handleCreate}>
            New note
          </Button>
        }
      />

      <NotesFilterBar state={filters} onChange={setFilters} />

      <div className="flex-1 overflow-y-auto">
        {isLoading && visible.length === 0 && <NotesSkeleton />}

        {!isLoading && visible.length === 0 && (
          <EmptyState
            icon={<HugeiconsIcon icon={Note01Icon} size={24} className="text-ink-subtle" />}
            title={filters.pinnedOnly ? 'No pinned notes' : 'No notes yet'}
            description={
              filters.pinnedOnly
                ? 'Pin a note from its row or detail view to keep it handy.'
                : 'Create a note to get started.'
            }
            action={
              !filters.pinnedOnly && (
                <Button size="md" onClick={handleCreate}>
                  Create note
                </Button>
              )
            }
          />
        )}

        {visible.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="columns-1 sm:columns-2 lg:columns-3 2xl:columns-4 gap-3 px-4 py-4 [&>*]:mb-3 [&>*]:break-inside-avoid"
          >
            <AnimatePresence initial={false}>
              {visible.map((n) => (
                <NoteCard
                  key={n.id}
                  note={n}
                  selected={selected.has(n.id)}
                  anySelected={selected.size > 0}
                  onToggleSelect={toggleSelect}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <BulkActionBar
        ids={selectedIds}
        pinnedAll={pinnedAll}
        onClear={() => setSelected(new Set())}
      />
    </>
  );
}
