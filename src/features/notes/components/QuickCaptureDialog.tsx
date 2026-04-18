import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateNote } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { Kbd } from '@/shared/components/ui/kbd';
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className="fixed left-1/2 top-[14vh] -translate-x-1/2 z-50 w-[min(calc(100vw-2rem),560px)] rounded-xl border border-line-default bg-surface-panel shadow-lg overflow-hidden data-[state=open]:animate-slide-up focus:outline-none"
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
            className="w-full px-5 pt-2 pb-4 text-[15px] leading-[1.6] text-ink-default placeholder:text-ink-placeholder bg-transparent focus:outline-none resize-none"
          />

          {/* Label chip picker */}
          <div className="px-5 pb-3">
            <LabelEditor labels={labels} onChange={setLabels} />
          </div>

          <div className="border-t border-line-subtle bg-surface-muted/30 flex items-center justify-between gap-3 px-4 py-2.5">
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-ink-subtle">
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
              <span>save</span>
              <span className="text-ink-placeholder mx-1">·</span>
              <Kbd>⇧⌘</Kbd>
              <Kbd>↵</Kbd>
              <span>open in editor</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
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
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
