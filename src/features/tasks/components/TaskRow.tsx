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
  /** When true, hide the date chip (e.g. when the row already sits under a date header). */
  hideDate?: boolean;
};

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

  return (
    <div className="group flex gap-3 px-2 py-2.5 border-b border-line-subtle last:border-b-0 hover:bg-surface-muted/30 transition-colors">
      <div className="pt-[3px]">
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

      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex flex-col gap-1.5">
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
              className="w-full bg-transparent text-[14px] text-ink-strong focus:outline-none placeholder:text-ink-placeholder"
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
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="block w-full text-left"
          >
            <p
              className={cn(
                'text-[14px] leading-[1.35] truncate',
                task.done ? 'text-ink-muted line-through' : 'text-ink-strong',
              )}
            >
              {task.title}
            </p>
            {task.description && (
              <p
                className={cn(
                  'text-[12px] leading-[1.4] mt-0.5 line-clamp-2',
                  task.done ? 'text-ink-subtle' : 'text-ink-muted',
                )}
              >
                {task.description}
              </p>
            )}
            {!hideDate && task.due_at && (
              <div className="mt-1.5">
                <DateChip due={task.due_at} done={task.done} />
              </div>
            )}
          </button>
        )}
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <DatePicker
          value={task.due_at}
          onChange={(iso) => update.mutate({ id: task.id, patch: { due_at: iso } })}
        >
          <button
            type="button"
            aria-label={task.due_at ? 'Change due date' : 'Set due date'}
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors"
          >
            <HugeiconsIcon icon={Calendar01Icon} size={14} />
          </button>
        </DatePicker>
        <PriorityPicker
          value={task.priority as Priority}
          onChange={(p) => update.mutate({ id: task.id, patch: { priority: p } })}
        >
          <button
            type="button"
            aria-label="Set priority"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors"
            style={task.priority < 4 ? { color: priorityMeta.dot } : undefined}
          >
            <HugeiconsIcon icon={Flag03Icon} size={14} />
          </button>
        </PriorityPicker>
        <button
          type="button"
          onClick={() => del.mutate(task.id)}
          aria-label="Delete task"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors"
        >
          <HugeiconsIcon icon={Delete01Icon} size={14} />
        </button>
      </div>
    </div>
  );
}
