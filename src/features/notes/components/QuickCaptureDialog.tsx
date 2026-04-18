import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateNote } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { LabelEditor } from './LabelEditor';
import type { NoteDoc } from '@/shared/lib/supabase';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Compact modal for quickly jotting a note without opening the full editor.
 *   ⌘ Enter   → save and close
 *   ⇧⌘ Enter  → save and open in full editor
 *   Esc       → cancel
 */
export function QuickCaptureDialog({ open, onOpenChange }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const create = useCreateNote();
  const navigate = useNavigate();
  const busy = create.isPending;

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
      setLabels([]);
    }
  }, [open]);

  const hasContent = title.trim().length > 0 || body.trim().length > 0;

  async function save(openInEditor: boolean) {
    if (!hasContent) {
      onOpenChange(false);
      return;
    }
    try {
      const content: NoteDoc = body.trim()
        ? {
            type: 'doc',
            content: body
              .split('\n')
              .map((line) => ({
                type: 'paragraph',
                content: line ? [{ type: 'text', text: line }] : [],
              })),
          }
        : { type: 'doc', content: [] };

      const note = await create.mutateAsync({
        title: title.trim() || 'Untitled',
        content,
        content_text: body,
        labels,
      });
      onOpenChange(false);
      if (openInEditor) {
        navigate(`/notes/${note.id}`);
      } else {
        toast.success('Note saved');
      }
    } catch (e) {
      toast.error('Could not save', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          style={{ translate: '-50% 0' }}
          className="fixed left-1/2 bottom-6 z-50 w-[min(calc(100vw-2rem),640px)] rounded-2xl border border-line-default bg-surface-panel shadow-lg overflow-hidden data-[state=open]:animate-sheet-in data-[state=closed]:animate-sheet-out focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              save(e.shiftKey);
            }
          }}
        >
          <Dialog.Title className="sr-only">Quick note</Dialog.Title>

          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full px-5 pt-5 pb-1 text-[22px] font-semibold text-ink-strong tracking-[-0.015em] placeholder:text-ink-placeholder bg-transparent focus:outline-none"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing…"
            rows={5}
            className="w-full px-5 pt-2 pb-4 text-title leading-[1.6] text-ink-default placeholder:text-ink-placeholder bg-transparent focus:outline-none resize-none"
          />

          {/* Label chip picker */}
          <div className="px-5 pb-3">
            <LabelEditor labels={labels} onChange={setLabels} />
          </div>

          <div className="border-t border-line-subtle bg-surface-muted/30 flex items-center justify-end gap-2 px-4 py-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => save(true)}
              disabled={busy || !hasContent}
            >
              Open in editor
            </Button>
            <Button
              size="sm"
              onClick={() => save(false)}
              disabled={busy || !hasContent}
            >
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
