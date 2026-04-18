import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useNote, useUpdateNote, useDeleteNote } from '../hooks';
import { NoteEditor } from './NoteEditor';
import { Spinner } from '@/shared/components/ui/spinner';
import { Button } from '@/shared/components/ui/button';
import { useAutoSave } from '@/shared/hooks/useAutoSave';
import {
  useDraftSnapshot,
  readDraftSnapshot,
  clearDraftSnapshot,
} from '@/shared/hooks/useDraftSnapshot';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { Tooltip } from '@/shared/components/ui/tooltip';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { Note } from '../types';
import { getDisplayTitle } from '../types';
import { LabelEditor } from './LabelEditor';
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
  content: Note['content'];
  contentText: string;
  labels: string[];
};

export function NoteDetailPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { data: note, isLoading } = useNote(noteId);

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
        <p className="text-nav text-ink-muted">Note not found.</p>
        <Button variant="ghost" size="sm" onClick={() => navigate('/notes')}>
          Back to notes
        </Button>
      </div>
    );
  }

  // Inner component is keyed on note.id so draft is (re)initialised
  // synchronously from the loaded note — no useEffect race on first render.
  return <NoteDetail key={note.id} note={note} />;
}

function NoteDetail({ note }: { note: Note }) {
  const navigate = useNavigate();
  const location = useLocation();
  const update = useUpdateNote();
  const del = useDeleteNote();

  const [draft, setDraft] = useState<Draft>(() => {
    const recovered = readDraftSnapshot<Draft>(note.id, note.updated_at);
    return (
      recovered ?? {
        title: note.title,
        content: note.content,
        contentText: note.content_text,
        labels: note.labels ?? [],
      }
    );
  });
  // Start dirty if we recovered from a snapshot so autosave writes on first change.
  const [dirty, setDirty] = useState(() =>
    readDraftSnapshot<Draft>(note.id, note.updated_at) !== null,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (dirty) {
      toast('Recovered unsaved changes', {
        description: 'Picked up where you left off.',
      });
    }
    const state = location.state as { fresh?: boolean } | null;
    if (state?.fresh) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      });
      window.history.replaceState({}, '');
    }
    // intentional: run once per mount (one per note via the outer key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { flush } = useAutoSave<Draft>({
    value: draft,
    enabled: dirty,
    delay: 700,
    save: async (d) => {
      try {
        await update.mutateAsync({
          id: note.id,
          patch: {
            title: d.title.trim() || 'Untitled',
            content: d.content,
            content_text: d.contentText,
            labels: d.labels,
          },
        });
        setDirty(false);
        clearDraftSnapshot(note.id);
      } catch (e) {
        toast.error('Failed to save', {
          description: e instanceof Error ? e.message : 'Retrying on next change.',
        });
      }
    },
  });

  useEffect(() => () => flush(), [flush]);

  useDraftSnapshot<Draft>({
    id: note.id,
    draft,
    baseUpdatedAt: note.updated_at,
    enabled: dirty,
  });

  async function performDelete() {
    flush();
    clearDraftSnapshot(note.id);
    await del.mutateAsync(note.id);
    navigate('/notes');
  }

  function togglePin() {
    update.mutate({ id: note.id, patch: { pinned: !note.pinned } });
  }

  function toggleArchive() {
    const willArchive = !note.archived;
    update.mutate({ id: note.id, patch: { archived: willArchive } });
    if (willArchive) navigate('/notes');
  }

  useDocumentTitle(getDisplayTitle(note));

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
            <DropdownMenu>
              <Tooltip content="Note actions">
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Note actions"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                  </button>
                </DropdownMenuTrigger>
              </Tooltip>
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
            ref={titleInputRef}
            value={draft.title}
            onChange={(e) => {
              setDraft((d) => ({ ...d, title: e.target.value }));
              setDirty(true);
            }}
            placeholder="Untitled"
            className="w-full bg-transparent text-[32px] leading-[1.15] font-semibold text-ink-strong tracking-[-0.02em] placeholder:text-ink-placeholder focus:outline-none mb-3 py-1 border-b border-transparent focus:border-line-subtle transition-colors duration-150"
          />
          <LabelEditor
            labels={draft.labels}
            onChange={(next) => {
              setDraft((d) => ({ ...d, labels: next }));
              setDirty(true);
            }}
            className="mb-6"
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
