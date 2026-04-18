import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useNote, useUpdateNote, useDeleteNote } from '../hooks';
import { NoteEditor } from './NoteEditor';
import { Spinner } from '@/shared/components/ui/spinner';
import { Button } from '@/shared/components/ui/button';
import { formatAgo } from '@/shared/lib/date';
import type { NoteDoc } from '@/shared/lib/supabase';
import { EMPTY_DOC } from '../types';
import { useAutoSave } from '@/shared/hooks/useAutoSave';

type Draft = {
  title: string;
  content: NoteDoc;
  contentText: string;
};

export function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { data: note, isLoading } = useNote(noteId);
  const update = useUpdateNote();
  const del = useDeleteNote();

  const [draft, setDraft] = useState<Draft>({ title: '', content: EMPTY_DOC, contentText: '' });
  const [dirty, setDirty] = useState(false);

  // Load note → draft; track which noteId we've loaded so switching notes resets cleanly.
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (note && note.id !== loadedIdRef.current) {
      setDraft({ title: note.title, content: note.content, contentText: note.content_text });
      setDirty(false);
      loadedIdRef.current = note.id;
    }
  }, [note]);

  // Auto-save with flush-on-exit. Only runs after note is loaded and user has edited.
  const { flush } = useAutoSave<Draft>({
    value: draft,
    enabled: !!note && dirty,
    delay: 700,
    save: async (d) => {
      if (!note) return;
      try {
        await update.mutateAsync({
          id: note.id,
          patch: {
            title: d.title.trim() || 'Untitled',
            content: d.content,
            content_text: d.contentText,
          },
        });
        setDirty(false);
      } catch (e) {
        toast.error('Failed to save', {
          description: e instanceof Error ? e.message : 'Retrying on next change.',
        });
      }
    },
  });

  // Also flush on route change (unmount handles most cases, but belt-and-suspenders).
  useEffect(() => () => flush(), [flush]);

  async function handleDelete() {
    if (!note) return;
    if (!confirm('Delete this note?')) return;
    flush();
    await del.mutateAsync(note.id);
    navigate('/notes');
  }

  function togglePin() {
    if (!note) return;
    update.mutate({ id: note.id, patch: { pinned: !note.pinned } });
  }

  function toggleArchive() {
    if (!note) return;
    const willArchive = !note.archived;
    update.mutate({ id: note.id, patch: { archived: willArchive } });
    if (willArchive) navigate('/notes');
  }

  const statusLabel = useMemo(() => {
    if (dirty) return 'Editing…';
    if (update.isPending) return 'Saving…';
    if (note) return `Saved ${formatAgo(note.updated_at)}`;
    return '';
  }, [dirty, update.isPending, note]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-[14px] text-ink-muted">Note not found.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
          Back to notes
        </Button>
      </div>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between border-b border-line-subtle px-4 h-11">
        <button
          onClick={() => {
            flush();
            navigate('/notes');
          }}
          className="text-header font-medium text-ink-muted hover:text-ink-strong transition-colors"
        >
          ← Notes
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-ink-subtle tabular-nums">{statusLabel}</span>
          <Button size="sm" variant="ghost" onClick={togglePin}>
            {note.pinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button size="sm" variant="ghost" onClick={toggleArchive}>
            {note.archived ? 'Unarchive' : 'Archive'}
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={del.isPending}>
            Delete
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-12 py-10">
          <input
            value={draft.title}
            onChange={(e) => {
              setDraft((d) => ({ ...d, title: e.target.value }));
              setDirty(true);
            }}
            placeholder="Untitled"
            className="w-full bg-transparent text-[30px] font-semibold text-ink-strong tracking-tight placeholder:text-ink-placeholder focus:outline-none mb-6"
          />
          <NoteEditor
            initialContent={draft.content}
            onChange={(doc, text) => {
              setDraft((d) => ({ ...d, content: doc, contentText: text }));
              setDirty(true);
            }}
          />
        </div>
      </div>
    </>
  );
}
