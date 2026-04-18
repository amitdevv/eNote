import { useState, type KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { HugeiconsIcon, Delete01Icon, Calendar01Icon, Flag03Icon } from '@/shared/lib/icons';
import { cn } from '@/shared/lib/cn';
import { TaskCheckbox } from './TaskCheckbox';
import { DateChip } from './DateChip';
import { DatePicker } from './DatePicker';
import { PriorityPicker } from './PriorityPicker';
import { useUpdateTask, useDeleteTask } from '../hooks';
import type { Priority, Task } from '../types';
import { PRIORITY_META } from '../types';

type Props = {
  task: Task;
  /** Hide the date chip (e.g. when the row sits under a date header). */
  hideDate?: boolean;
};

/**
 * Linear-style one-line task row. Metadata (priority flag + due date) stays
 * visible at all times so it never flickers on hover; the chips themselves
 * are the edit triggers. Only the delete button appears on hover.
 */
export function TaskRow({ task, hideDate }: Props) {
  const update = useUpdateTask();
  const del = useDeleteTask();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  function startEdit() {
    setTitle(task.title);
    setDescription(task.description);
    setEditing(true);
  }

  async function save() {
    const nextTitle = title.trim();
    const nextDesc = description.trim();
    setEditing(false);
    if (!nextTitle) {
      setTitle(task.title);
      return;
    }
    if (nextTitle === task.title && nextDesc === task.description) return;
    try {
      await update.mutateAsync({
        id: task.id,
        patch: { title: nextTitle, description: nextDesc },
      });
    } catch (e) {
      setTitle(task.title);
      setDescription(task.description);
      toast.error('Could not save task', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  function cancel() {
    setTitle(task.title);
    setDescription(task.description);
    setEditing(false);
  }

  const priorityMeta = PRIORITY_META[task.priority as Priority];

  if (editing) {
    return (
      <div className="flex items-start gap-3 px-2 py-2 border-b border-line-subtle">
        <div className="pt-[2px]">
          <TaskCheckbox
            priority={task.priority as Priority}
            checked={task.done}
            onChange={(next) =>
              update.mutate({
                id: task.id,
                patch: { done: next, done_at: next ? new Date().toISOString() : null },
              })
            }
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                save();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            placeholder="Task name"
            className="w-full bg-transparent text-[13px] text-ink-strong focus:outline-none placeholder:text-ink-placeholder"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                save();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                cancel();
              }
            }}
            onBlur={save}
            placeholder="Description"
            className="w-full bg-transparent text-[12px] text-ink-muted focus:outline-none placeholder:text-ink-placeholder"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group h-10 flex items-center gap-3 px-2 border-b border-line-subtle hover:bg-surface-muted/40 transition-colors">
      <TaskCheckbox
        priority={task.priority as Priority}
        checked={task.done}
        onChange={(next) =>
          update.mutate({
            id: task.id,
            patch: { done: next, done_at: next ? new Date().toISOString() : null },
          })
        }
      />

      {/* Title + inline description — single line, truncated */}
      <button
        type="button"
        onClick={startEdit}
        className="flex-1 min-w-0 flex items-baseline gap-2 text-left overflow-hidden"
      >
        <span
          className={cn(
            'text-[13px] truncate shrink-0 max-w-[70%]',
            task.done ? 'text-ink-muted line-through' : 'text-ink-strong',
          )}
        >
          {task.title}
        </span>
        {task.description && (
          <span
            className={cn(
              'text-[12px] truncate',
              task.done ? 'text-ink-subtle' : 'text-ink-muted',
            )}
          >
            {task.description}
          </span>
        )}
      </button>

      {/* Priority column — chip is the trigger; dim flag when priority = 4 */}
      <div className="w-[28px] shrink-0 flex justify-end">
        <PriorityPicker
          value={task.priority as Priority}
          onChange={(p) => update.mutate({ id: task.id, patch: { priority: p } })}
        >
          <button
            type="button"
            aria-label="Set priority"
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-surface-muted transition-colors"
            style={
              task.priority < 4
                ? { color: priorityMeta.dot }
                : { color: 'var(--ink-subtle, #9ca3af)' }
            }
          >
            <HugeiconsIcon icon={Flag03Icon} size={13} />
          </button>
        </PriorityPicker>
      </div>

      {/* Due date column — chip is the trigger; shows calendar icon when unset */}
      {!hideDate && (
        <div className="w-[96px] shrink-0 flex justify-end">
          <DatePicker
            value={task.due_at}
            onChange={(iso) => update.mutate({ id: task.id, patch: { due_at: iso } })}
          >
            <button
              type="button"
              aria-label={task.due_at ? 'Change due date' : 'Set due date'}
              className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 hover:bg-surface-muted transition-colors"
            >
              {task.due_at ? (
                <DateChip due={task.due_at} done={task.done} />
              ) : (
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={13}
                  className="text-ink-subtle"
                />
              )}
            </button>
          </DatePicker>
        </div>
      )}

      {/* Delete — hover only, small */}
      <button
        type="button"
        onClick={() => del.mutate(task.id)}
        aria-label="Delete task"
        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <HugeiconsIcon icon={Delete01Icon} size={13} />
      </button>
    </div>
  );
}
