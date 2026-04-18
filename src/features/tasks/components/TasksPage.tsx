import { useMemo, useState } from 'react';
import { isSameDay, parseISO, startOfDay } from 'date-fns';
import * as Tabs from '@radix-ui/react-tabs';
import { useTasks, useClearCompleted } from '../hooks';
import type { Task } from '../types';
import { TaskRow } from './TaskRow';
import { TaskComposer } from './TaskComposer';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { cn } from '@/shared/lib/cn';
import { HugeiconsIcon, CheckmarkSquare01Icon } from '@/shared/lib/icons';
import { groupByDay, dayHeading, isOverdue } from '../date';

type View = 'inbox' | 'today' | 'upcoming';

function SectionHeader({
  primary,
  secondary,
  tone,
}: {
  primary: string;
  secondary?: string;
  tone?: 'overdue' | 'today' | 'default';
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 pt-5 pb-2 px-2 border-b border-line-subtle">
      <h3 className="flex items-baseline gap-2">
        <span
          className={cn(
            'text-[13px] font-semibold',
            tone === 'overdue'
              ? 'text-red-600'
              : tone === 'today'
                ? 'text-emerald-600'
                : 'text-ink-strong',
          )}
        >
          {primary}
        </span>
        {secondary && <span className="text-[12px] text-ink-muted">{secondary}</span>}
      </h3>
    </div>
  );
}

function InboxView({ tasks }: { tasks: Task[] }) {
  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const clearDone = useClearCompleted();

  return (
    <>
      <TaskComposer />

      {open.length === 0 && done.length === 0 ? (
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkSquare01Icon} size={18} />}
          title="Inbox zero"
          description="Add a task above. Keep quick captures here; drag to a day when you're ready to commit."
          className="py-16"
        />
      ) : (
        <>
          {open.length > 0 && (
            <section>
              <div className="flex flex-col">
                {open.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <div className="flex items-center justify-between pt-4 pb-2 px-2 border-b border-line-subtle">
                <h3 className="text-[12px] font-medium uppercase tracking-wide text-ink-subtle">
                  Completed · {done.length}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearDone.mutate()}
                  disabled={clearDone.isPending}
                >
                  {clearDone.isPending ? 'Clearing…' : 'Clear completed'}
                </Button>
              </div>
              <div className="flex flex-col">
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

function TodayView({ tasks }: { tasks: Task[] }) {
  const today = startOfDay(new Date());
  const { overdue, dueToday } = useMemo(() => {
    const open = tasks.filter((t) => !t.done && t.due_at);
    return {
      overdue: open.filter((t) => isOverdue(t.due_at!)),
      dueToday: open.filter((t) => {
        const d = parseISO(t.due_at!);
        return isSameDay(d, today);
      }),
    };
  }, [tasks, today]);

  if (overdue.length === 0 && dueToday.length === 0) {
    return (
      <>
        <TaskComposer defaultDueAt={today.toISOString()} />
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkSquare01Icon} size={18} />}
          title="Nothing due today"
          description="Enjoy it, or pull something in from Upcoming."
          className="py-16"
        />
      </>
    );
  }

  return (
    <>
      {overdue.length > 0 && (
        <section>
          <SectionHeader
            primary="Overdue"
            secondary={`${overdue.length} ${overdue.length === 1 ? 'task' : 'tasks'}`}
            tone="overdue"
          />
          <div className="flex flex-col">
            {overdue.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          primary="Today"
          secondary={
            dueToday.length > 0
              ? `${dueToday.length} ${dueToday.length === 1 ? 'task' : 'tasks'}`
              : undefined
          }
          tone="today"
        />
        <div className="flex flex-col">
          {dueToday.map((t) => (
            <TaskRow key={t.id} task={t} hideDate />
          ))}
        </div>
        <div className="pt-2">
          <TaskComposer defaultDueAt={today.toISOString()} />
        </div>
      </section>
    </>
  );
}

function UpcomingView({ tasks }: { tasks: Task[] }) {
  const today = startOfDay(new Date());
  const future = tasks.filter((t) => {
    if (t.done || !t.due_at) return false;
    const d = startOfDay(parseISO(t.due_at));
    return d >= today;
  });
  const buckets = groupByDay(future);
  const undated = tasks.filter((t) => !t.done && !t.due_at);

  if (buckets.length === 0 && undated.length === 0) {
    return (
      <>
        <TaskComposer />
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkSquare01Icon} size={18} />}
          title="No upcoming tasks"
          description="Schedule a task with a date and it'll show up on its day."
          className="py-16"
        />
      </>
    );
  }

  return (
    <>
      {buckets.map(({ date, items }) => {
        const heading = dayHeading(date);
        const tone =
          isSameDay(date, today)
            ? 'today'
            : date < today
              ? 'overdue'
              : 'default';
        return (
          <section key={date.toISOString()}>
            <SectionHeader
              primary={heading.primary}
              secondary={heading.secondary}
              tone={tone}
            />
            <div className="flex flex-col">
              {items.map((t) => (
                <TaskRow key={t.id} task={t} hideDate />
              ))}
            </div>
            <div className="pt-2 pb-3">
              <TaskComposer defaultDueAt={date.toISOString()} />
            </div>
          </section>
        );
      })}

      {undated.length > 0 && (
        <section>
          <SectionHeader primary="No date" secondary={`${undated.length}`} />
          <div className="flex flex-col">
            {undated.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

const VIEWS: { id: View; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
];

export function TasksPage() {
  useDocumentTitle('Tasks');
  const [view, setView] = useState<View>('today');
  const { data: tasks, isLoading } = useTasks();
  const all = tasks ?? [];

  const counts = useMemo(() => {
    const today = startOfDay(new Date());
    const openWithDate = all.filter((t) => !t.done && t.due_at);
    return {
      today: openWithDate.filter((t) => {
        const d = parseISO(t.due_at!);
        return isSameDay(d, today) || d < today;
      }).length,
      upcoming: openWithDate.filter((t) => startOfDay(parseISO(t.due_at!)) > today).length,
      inbox: all.filter((t) => !t.done).length,
    };
  }, [all]);

  return (
    <>
      <PageHeader title="Tasks" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[760px] mx-auto px-6 py-8">
          <Tabs.Root value={view} onValueChange={(v) => setView(v as View)}>
            <Tabs.List className="flex items-center gap-1 border-b border-line-subtle mb-5">
              {VIEWS.map((v) => (
                <Tabs.Trigger
                  key={v.id}
                  value={v.id}
                  className={cn(
                    'relative h-9 px-3 text-[13px] font-medium text-ink-muted hover:text-ink-strong transition-colors',
                    'data-[state=active]:text-ink-strong',
                    'after:absolute after:inset-x-2 after:bottom-[-1px] after:h-[2px] after:rounded-t after:bg-brand after:opacity-0 data-[state=active]:after:opacity-100',
                  )}
                >
                  {v.label}
                  <span className="ml-1.5 text-[11px] text-ink-subtle tabular-nums">
                    {counts[v.id]}
                  </span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {isLoading ? (
              <div className="px-3 py-12 text-[13px] text-ink-muted text-center">
                Loading…
              </div>
            ) : (
              <>
                <Tabs.Content value="inbox" className="space-y-4 focus:outline-none">
                  <InboxView tasks={all} />
                </Tabs.Content>
                <Tabs.Content value="today" className="space-y-4 focus:outline-none">
                  <TodayView tasks={all} />
                </Tabs.Content>
                <Tabs.Content value="upcoming" className="focus:outline-none">
                  <UpcomingView tasks={all} />
                </Tabs.Content>
              </>
            )}
          </Tabs.Root>
        </div>
      </div>
    </>
  );
}
