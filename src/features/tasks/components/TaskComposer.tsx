import { useState } from 'react';
import { toast } from 'sonner';
import {
  HugeiconsIcon,
  Calendar01Icon,
  Flag03Icon,
  PlusSignIcon,
} from '@/shared/lib/icons';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from './DatePicker';
import { PriorityPicker } from './PriorityPicker';
import { DateChip } from './DateChip';
import { useCreateTask } from '../hooks';
import type { Priority } from '../types';
import { PRIORITY_META } from '../types';

type Props = {
  /** Initial due date for tasks composed here (e.g. the day bucket in Upcoming). */
  defaultDueAt?: string | null;
  autoFocus?: boolean;
  onCancel?: () => void;
};

/**
 * Todoist-style inline composer. Collapsed state is a "+ Add task" ghost row.
 * Expanded state shows a title field, a description field, and chip buttons for
 * date and priority. Enter submits; Esc collapses.
 */
export function TaskComposer({ defaultDueAt, autoFocus, onCancel }: Props) {
  const create = useCreateTask();
  const [open, setOpen] = useState(!!autoFocus);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueAt, setDueAt] = useState<string | null>(defaultDueAt ?? null);

  const priorityMeta = PRIORITY_META[priority];

  function reset() {
    setTitle('');
    setDescription('');
    setPriority(4);
    setDueAt(defaultDueAt ?? null);
  }

  function close() {
    reset();
    setOpen(false);
    onCancel?.();
  }

  async function submit() {
    const t = title.trim();
    if (!t) return;
    try {
      await create.mutateAsync({
        title: t,
        description: description.trim() || undefined,
        priority,
        due_at: dueAt,
      });
      reset();
      // Stay open so the user can add another — mirrors Todoist behaviour.
    } catch (e) {
      toast.error('Could not add task', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 w-full px-2 rounded-md text-[13px] text-ink-muted hover:bg-surface-muted/60 hover:text-ink-strong transition-colors"
      >
        <span className="flex size-5 items-center justify-center rounded-full bg-brand/90 text-white">
          <HugeiconsIcon icon={PlusSignIcon} size={12} strokeWidth={2.4} />
        </span>
        Add task
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line-default bg-surface-raised shadow-xs overflow-hidden">
      <div className="flex flex-col gap-1 px-3 pt-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              close();
            }
          }}
          placeholder="Task name"
          className="w-full bg-transparent text-[14px] font-medium text-ink-strong focus:outline-none placeholder:text-ink-placeholder"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              close();
            }
          }}
          placeholder="Description"
          className="w-full bg-transparent text-[12px] text-ink-muted focus:outline-none placeholder:text-ink-placeholder"
        />

        <div className="flex items-center gap-1.5 py-2 flex-wrap">
          <DatePicker value={dueAt} onChange={setDueAt}>
            <button
              type="button"
              className={cn(
                'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border text-[12px] transition-colors',
                dueAt
                  ? 'border-line-subtle bg-surface-muted/40'
                  : 'border-line-default text-ink-muted hover:text-ink-strong hover:bg-surface-muted/60',
              )}
            >
              {dueAt ? (
                <DateChip due={dueAt} />
              ) : (
                <>
                  <HugeiconsIcon icon={Calendar01Icon} size={12} />
                  Date
                </>
              )}
            </button>
          </DatePicker>

          <PriorityPicker value={priority} onChange={setPriority}>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-line-default text-[12px] text-ink-muted hover:text-ink-strong hover:bg-surface-muted/60 transition-colors"
              style={priority < 4 ? { color: priorityMeta.dot } : undefined}
            >
              <HugeiconsIcon icon={Flag03Icon} size={12} />
              {priority < 4 ? `P${priority}` : 'Priority'}
            </button>
          </PriorityPicker>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-line-subtle bg-surface-muted/20">
        <Button variant="ghost" size="sm" onClick={close}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={submit}
          disabled={!title.trim() || create.isPending}
        >
          {create.isPending ? 'Adding…' : 'Add task'}
        </Button>
      </div>
    </div>
  );
}
