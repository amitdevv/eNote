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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { cn } from '@/shared/lib/cn';
import { HugeiconsIcon, CheckmarkSquare01Icon } from '@/shared/lib/icons';
import { groupByDay, dayHeading, isOverdue } from '../date';

type View = 'inbox' | 'today' | 'upcoming';
type SortKey = 'default' | 'priority' | 'due' | 'title';
type SortDir = 'asc' | 'desc';

type Sort = { key: SortKey; dir: SortDir };

function sortTasks(list: Task[], sort: Sort): Task[] {
  if (sort.key === 'default') return list;
  const sign = sort.dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    switch (sort.key) {
      case 'priority':
        return sign * (a.priority - b.priority);
      case 'due': {
        const av = a.due_at ? new Date(a.due_at).getTime() : Number.POSITIVE_INFINITY;
        const bv = b.due_at ? new Date(b.due_at).getTime() : Number.POSITIVE_INFINITY;
        return sign * (av - bv);
      }
      case 'title':
        return sign * a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

type ColumnOption = { key: SortKey; dir: SortDir; label: string };

const COLUMN_OPTIONS: Record<SortKey, ColumnOption[]> = {
  title: [
    { key: 'title', dir: 'asc', label: 'A → Z' },
    { key: 'title', dir: 'desc', label: 'Z → A' },
  ],
  priority: [
    { key: 'priority', dir: 'asc', label: 'Highest first (P1 → P4)' },
    { key: 'priority', dir: 'desc', label: 'Lowest first (P4 → P1)' },
  ],
  due: [
    { key: 'due', dir: 'asc', label: 'Earliest first' },
    { key: 'due', dir: 'desc', label: 'Latest first' },
  ],
  default: [],
};

function ColumnButton({
  column,
  label,
  sort,
  onSortChange,
  align = 'left',
  width,
}: {
  column: SortKey;
  label: string;
  sort: Sort;
  onSortChange: (next: Sort) => void;
  align?: 'left' | 'right';
  width?: string;
}) {
  const active = sort.key === column;
  const arrow = active ? (sort.dir === 'asc' ? '↑' : '↓') : '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-6 items-center gap-1 rounded px-1.5 text-caption font-medium uppercase tracking-wide transition-colors',
            active
              ? 'text-ink-strong bg-surface-muted'
              : 'text-ink-muted hover:text-ink-strong hover:bg-surface-muted/70',
            align === 'right' && 'justify-end',
            width,
          )}
          style={align === 'right' ? { marginLeft: 'auto' } : undefined}
        >
          {label} {arrow}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align === 'right' ? 'end' : 'start'}>
        <DropdownMenuLabel>Sort by {label.toLowerCase()}</DropdownMenuLabel>
        {COLUMN_OPTIONS[column].map((opt) => {
          const isActive =
            sort.key === opt.key && sort.dir === opt.dir;
          return (
            <DropdownMenuItem
              key={`${opt.key}-${opt.dir}`}
              onSelect={() => onSortChange({ key: opt.key, dir: opt.dir })}
            >
              <span className="flex-1">{opt.label}</span>
              {isActive && <span className="text-brand">✓</span>}
            </DropdownMenuItem>
          );
        })}
        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onSortChange({ key: 'default', dir: 'asc' })}
            >
              <span className="flex-1 text-ink-muted">Clear sort</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColumnHeader({
  sort,
  onSortChange,
}: {
  sort: Sort;
  onSortChange: (next: Sort) => void;
}) {
  return (
    <div className="sticky top-0 z-10 h-9 flex items-center px-2 gap-2 bg-surface-app/95 backdrop-blur-sm border-b border-line-subtle">
      <span className="size-[18px] shrink-0" aria-hidden />
      <div className="flex-1 min-w-0">
        <ColumnButton
          column="title"
          label="Name"
          sort={sort}
          onSortChange={onSortChange}
        />
      </div>
      <div className="w-[96px] flex justify-end">
        <ColumnButton
          column="priority"
          label="Priority"
          sort={sort}
          onSortChange={onSortChange}
          align="right"
        />
      </div>
      <div className="w-[96px] flex justify-end">
        <ColumnButton
          column="due"
          label="Due"
          sort={sort}
          onSortChange={onSortChange}
          align="right"
        />
      </div>
      {/* Spacer for the hover delete button column in TaskRow */}
      <span className="w-7 shrink-0" aria-hidden />
    </div>
  );
}

function SectionHeader({
  primary,
  secondary,
  tone,
  action,
}: {
  primary: string;
  secondary?: string;
  tone?: 'overdue' | 'today' | 'default';
  action?: React.ReactNode;
}) {
  return (
    <div className="h-9 flex items-center justify-between gap-3 px-2 bg-surface-muted/40 border-b border-line-subtle">
      <h3 className="flex items-baseline gap-2">
        <span
          className={cn(
            'text-caption font-semibold',
            tone === 'overdue'
              ? 'text-red-600'
              : tone === 'today'
                ? 'text-brand'
                : 'text-ink-strong',
          )}
        >
          {primary}
        </span>
        {secondary && (
          <span className="text-micro text-ink-muted tabular-nums">{secondary}</span>
        )}
      </h3>
      {action}
    </div>
  );
}

function InboxView({
  tasks,
  sort,
  composerKey,
}: {
  tasks: Task[];
  sort: Sort;
  composerKey: number;
}) {
  const clearDone = useClearCompleted();
  const open = sortTasks(tasks.filter((t) => !t.done), sort);
  const done = sortTasks(tasks.filter((t) => t.done), sort);

  return (
    <>
      <div className="mb-4">
        <TaskComposer key={composerKey} autoFocus={composerKey > 0} />
      </div>

      {open.length === 0 && done.length === 0 ? (
        <EmptyState
          icon={<HugeiconsIcon icon={CheckmarkSquare01Icon} size={18} />}
          title="Inbox zero"
          description="Add a task above. Keep quick captures here; move them to a day when you're ready."
          className="py-16"
        />
      ) : (
        <>
          {open.length > 0 && (
            <div className="flex flex-col">
              {open.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}

          {done.length > 0 && (
            <section className="mt-4">
              <SectionHeader
                primary="Completed"
                secondary={`${done.length}`}
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearDone.mutate()}
                    disabled={clearDone.isPending}
                  >
                    {clearDone.isPending ? 'Clearing…' : 'Clear'}
                  </Button>
                }
              />
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

function TodayView({
  tasks,
  sort,
  composerKey,
}: {
  tasks: Task[];
  sort: Sort;
  composerKey: number;
}) {
  const today = startOfDay(new Date());
  const { overdue, dueToday } = useMemo(() => {
    const open = tasks.filter((t) => !t.done && t.due_at);
    return {
      overdue: sortTasks(
        open.filter((t) => isOverdue(t.due_at!)),
        sort,
      ),
      dueToday: sortTasks(
        open.filter((t) => {
          const d = parseISO(t.due_at!);
          return isSameDay(d, today);
        }),
        sort,
      ),
    };
  }, [tasks, today, sort]);

  if (overdue.length === 0 && dueToday.length === 0) {
    return (
      <>
        <div className="mb-4">
          <TaskComposer
            key={composerKey}
            defaultDueAt={today.toISOString()}
            autoFocus={composerKey > 0}
          />
        </div>
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
            secondary={`${overdue.length}`}
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
          secondary={dueToday.length > 0 ? `${dueToday.length}` : undefined}
          tone="today"
        />
        <div className="flex flex-col">
          {dueToday.map((t) => (
            <TaskRow key={t.id} task={t} hideDate />
          ))}
        </div>
        <div className="px-2 py-2">
          <TaskComposer
            key={composerKey}
            defaultDueAt={today.toISOString()}
            autoFocus={composerKey > 0}
          />
        </div>
      </section>
    </>
  );
}

function UpcomingView({
  tasks,
  sort,
  composerKey,
}: {
  tasks: Task[];
  sort: Sort;
  composerKey: number;
}) {
  const today = startOfDay(new Date());
  const future = tasks.filter((t) => {
    if (t.done || !t.due_at) return false;
    const d = startOfDay(parseISO(t.due_at));
    return d >= today;
  });
  const buckets = groupByDay(future);
  const undated = sortTasks(
    tasks.filter((t) => !t.done && !t.due_at),
    sort,
  );

  if (buckets.length === 0 && undated.length === 0) {
    return (
      <>
        <div className="mb-4">
          <TaskComposer key={composerKey} autoFocus={composerKey > 0} />
        </div>
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
        const tone = isSameDay(date, today)
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
              {sortTasks(items, sort).map((t) => (
                <TaskRow key={t.id} task={t} hideDate />
              ))}
            </div>
            <div className="px-2 py-2">
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
  const [sort, setSort] = useState<Sort>({ key: 'default', dir: 'asc' });
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

  const [composerKey] = useState(0);

  return (
    <>
      <PageHeader title="Tasks" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[860px] mx-auto px-4 py-6">
          <Tabs.Root value={view} onValueChange={(v) => setView(v as View)}>
            <Tabs.List className="flex items-center gap-1 border-b border-line-subtle mb-4 px-2">
              {VIEWS.map((v) => (
                <Tabs.Trigger
                  key={v.id}
                  value={v.id}
                  className={cn(
                    'relative h-9 px-3 rounded-md text-preview font-medium text-ink-muted hover:text-ink-strong transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                    'data-[state=active]:text-ink-strong',
                    'after:absolute after:inset-x-2 after:bottom-[-1px] after:h-[2px] after:rounded-t after:bg-brand after:opacity-0 data-[state=active]:after:opacity-100',
                  )}
                >
                  {v.label}
                  <span className="ml-1.5 text-micro text-ink-subtle tabular-nums">
                    {counts[v.id]}
                  </span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {isLoading ? (
              <div className="px-3 py-12 text-preview text-ink-muted text-center">
                Loading…
              </div>
            ) : (
              <>
                <Tabs.Content value="inbox" className="focus:outline-none">
                  <ColumnHeader sort={sort} onSortChange={setSort} />
                  <InboxView tasks={all} sort={sort} composerKey={composerKey} />
                </Tabs.Content>
                <Tabs.Content value="today" className="focus:outline-none">
                  <ColumnHeader sort={sort} onSortChange={setSort} />
                  <TodayView tasks={all} sort={sort} composerKey={composerKey} />
                </Tabs.Content>
                <Tabs.Content value="upcoming" className="focus:outline-none">
                  <ColumnHeader sort={sort} onSortChange={setSort} />
                  <UpcomingView tasks={all} sort={sort} composerKey={composerKey} />
                </Tabs.Content>
              </>
            )}
          </Tabs.Root>
        </div>
      </div>
    </>
  );
}
