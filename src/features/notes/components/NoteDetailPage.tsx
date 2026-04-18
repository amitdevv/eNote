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
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { PageHeader } from '@/shared/components/app/PageHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  HugeiconsIcon,
  MoreHorizontalIcon,
  PinIcon,
  ArchiveIcon,
  Delete01Icon,
} from '@/shared/lib/icons';

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (note && note.id !== loadedIdRef.current) {
      setDraft({ title: note.title, content: note.content, contentText: note.content_text });
      setDirty(false);
      loadedIdRef.current = note.id;
    }
  }, [note]);

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

  useEffect(() => () => flush(), [flush]);

  async function performDelete() {
    if (!note) return;
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
      <PageHeader
        leading={
          <button
            onClick={() => {
              flush();
              navigate('/notes');
            }}
            className="text-header font-medium text-ink-muted hover:text-ink-strong transition-colors"
          >
            ← Notes
          </button>
        }
        trailing={
          <>
            <span
              className="text-[12px] text-ink-subtle tabular-nums min-w-[120px] text-right"
              aria-live="polite"
            >
              {statusLabel}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Note actions"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={togglePin}>
                  <HugeiconsIcon icon={PinIcon} size={14} className="text-ink-subtle" />
                  {note.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={toggleArchive}>
                  <HugeiconsIcon icon={ArchiveIcon} size={14} className="text-ink-subtle" />
                  {note.archived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem destructive onSelect={() => setConfirmDelete(true)}>
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this note?"
        description="This cannot be undone. Archive instead if you might want it back."
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={performDelete}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-10 md:px-12 py-12">
          <input
            value={draft.title}
            onChange={(e) => {
              setDraft((d) => ({ ...d, title: e.target.value }));
              setDirty(true);
            }}
            placeholder="Untitled"
            className="w-full bg-transparent text-[32px] leading-[1.15] font-semibold text-ink-strong tracking-[-0.02em] placeholder:text-ink-placeholder focus:outline-none mb-8 py-1 border-b border-transparent focus:border-line-subtle transition-colors duration-150"
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
