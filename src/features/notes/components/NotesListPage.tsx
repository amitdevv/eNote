import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotes, useCreateNote, useSearchNotes } from '../hooks';
import { NoteRow } from './NoteRow';
import { NotesSkeleton } from './NoteRowSkeleton';
import { BulkActionBar } from './BulkActionBar';
import { NotesFilterBar, DEFAULT_FILTERS, type FilterState } from './NotesFilterBar';
import { Spinner } from '@/shared/components/ui/spinner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Kbd } from '@/shared/components/ui/kbd';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { HugeiconsIcon, Search01Icon, Note01Icon } from '@/shared/lib/icons';

export function NotesListPage() {
  useDocumentTitle('Notes');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(query, 200);
  const searching = debouncedQuery.trim().length > 0;
  const hasTypedButNotDebounced = query.trim().length > 0 && query !== debouncedQuery;

  const { data: notes, isLoading } = useNotes(filters);
  const { data: searchResults, isFetching: searchLoading } = useSearchNotes(debouncedQuery);
  const createNote = useCreateNote();
  const navigate = useNavigate();

  async function handleCreate() {
    const note = await createNote.mutateAsync();
    navigate(`/notes/${note.id}`, { state: { fresh: true } });
  }

  const visible = searching ? searchResults ?? [] : notes ?? [];
  const loading = searching ? searchLoading : isLoading;
  const showSpinnerInInput = searching && (searchLoading || hasTypedButNotDebounced);

  // Multi-select state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  function toggleSelect(id: string, shiftKey: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (shiftKey && lastClickedId) {
        // Range-select between lastClickedId and id
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
              <span className="text-[12px] font-normal text-ink-subtle tabular-nums">
                {notes.length}
              </span>
            )}
          </span>
        }
        trailing={
          <Button size="sm" variant="outline" onClick={handleCreate} disabled={createNote.isPending}>
            New note
          </Button>
        }
      />

      <div className="border-b border-line-subtle px-4 py-2.5">
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
          />
          <Input
            data-search-input
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-10"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            {showSpinnerInInput ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="pointer-events-auto h-5 w-5 flex items-center justify-center rounded text-ink-subtle hover:text-ink-strong"
                aria-label="Clear search"
              >
                ×
              </button>
            ) : (
              <Kbd>/</Kbd>
            )}
          </div>
        </div>
      </div>

      {!searching && <NotesFilterBar state={filters} onChange={setFilters} />}

      <div className="flex-1 overflow-y-auto">
        {loading && (notes?.length ?? 0) === 0 && <NotesSkeleton />}

        {!loading && visible.length === 0 && !searching && (
          <EmptyState
            icon={<HugeiconsIcon icon={Note01Icon} size={24} className="text-ink-subtle" />}
            title={filters.pinnedOnly ? 'No pinned notes' : 'No notes yet'}
            description={
              filters.pinnedOnly
                ? 'Pin a note from its row or detail view to keep it handy.'
                : 'Press C anywhere to create a note. ⌘K opens commands.'
            }
            action={
              !filters.pinnedOnly && (
                <Button size="md" onClick={handleCreate} disabled={createNote.isPending}>
                  Create note
                </Button>
              )
            }
          />
        )}

        {!loading && visible.length === 0 && searching && (
          <EmptyState
            icon={<HugeiconsIcon icon={Search01Icon} size={24} className="text-ink-subtle" />}
            title="No matches"
            description={`Nothing matches "${debouncedQuery.trim()}".`}
          />
        )}

        {visible.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.12 }}
            className="divide-y divide-line-subtle"
          >
            <AnimatePresence initial={false}>
              {visible.map((n) => (
                <NoteRow
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
