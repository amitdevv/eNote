import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useNotes, useCreateNote, useSearchNotes } from '../hooks';
import { NoteRow } from './NoteRow';
import { Spinner } from '@/shared/components/ui/spinner';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Kbd } from '@/shared/components/ui/kbd';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { HugeiconsIcon, Search01Icon, Note01Icon } from '@/shared/lib/icons';

export function NotesListPage() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
  const searching = debouncedQuery.trim().length > 0;

  const { data: notes, isLoading } = useNotes();
  const { data: searchResults, isFetching: searchLoading } = useSearchNotes(debouncedQuery);
  const createNote = useCreateNote();
  const navigate = useNavigate();

  async function handleCreate() {
    const note = await createNote.mutateAsync();
    navigate(`/notes/${note.id}`, { state: { fresh: true } });
  }

  const visible = searching ? searchResults ?? [] : notes ?? [];
  const loading = searching ? searchLoading : isLoading;

  return (
    <>
      <PageHeader
        title="Notes"
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
            <Kbd>/</Kbd>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        )}

        {!loading && visible.length === 0 && !searching && (
          <EmptyState
            icon={<HugeiconsIcon icon={Note01Icon} size={24} className="text-ink-subtle" />}
            title="No notes yet"
            description="Press C anywhere to create a note. ⌘K opens commands."
            action={
              <Button size="md" onClick={handleCreate} disabled={createNote.isPending}>
                Create note
              </Button>
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
            {visible.map((n) => (
              <NoteRow key={n.id} note={n} />
            ))}
          </motion.div>
        )}
      </div>
    </>
  );
}
