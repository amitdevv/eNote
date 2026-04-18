import {
  addDays,
  format,
  isPast,
  isSameDay,
  isThisWeek,
  isThisYear,
  isTomorrow,
  parseISO,
  startOfDay,
} from 'date-fns';

/**
 * Render a due date the way Todoist does: weekday name for this week, "Tomorrow",
 * "Today", absolute date further out, "Yesterday" / exact past date for overdue.
 * Colour is a separate concern — see `dueColor` below.
 */
export function formatDue(due: string | Date): string {
  const d = typeof due === 'string' ? parseISO(due) : due;
  const today = startOfDay(new Date());
  const dDay = startOfDay(d);

  if (isSameDay(dDay, today)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isSameDay(dDay, addDays(today, -1))) return 'Yesterday';

  if (isThisWeek(d, { weekStartsOn: 1 }) && dDay > today) {
    return format(d, 'EEEE'); // e.g. "Wednesday"
  }

  return isThisYear(d) ? format(d, 'd MMM') : format(d, 'd MMM yyyy');
}

export type DueTone = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later' | 'done';

export function dueTone(due: string | Date, done = false): DueTone {
  if (done) return 'done';
  const d = typeof due === 'string' ? parseISO(due) : due;
  const today = startOfDay(new Date());
  const dDay = startOfDay(d);
  if (dDay < today) return 'overdue';
  if (isSameDay(dDay, today)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  if (isThisWeek(d, { weekStartsOn: 1 }) || dDay <= addDays(today, 7)) return 'soon';
  return 'later';
}

/** Group tasks (with due dates) into day buckets, sorted chronologically. */
export function groupByDay<T extends { due_at: string | null }>(tasks: T[]) {
  const buckets = new Map<string, { date: Date; items: T[] }>();
  for (const t of tasks) {
    if (!t.due_at) continue;
    const d = startOfDay(parseISO(t.due_at));
    const key = format(d, 'yyyy-MM-dd');
    if (!buckets.has(key)) buckets.set(key, { date: d, items: [] });
    buckets.get(key)!.items.push(t);
  }
  return [...buckets.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function dayHeading(date: Date): { primary: string; secondary: string } {
  const today = startOfDay(new Date());
  const dDay = startOfDay(date);

  if (isSameDay(dDay, today)) {
    return { primary: 'Today', secondary: format(date, 'EEE, d MMM') };
  }
  if (isTomorrow(date)) {
    return { primary: 'Tomorrow', secondary: format(date, 'EEE, d MMM') };
  }
  if (dDay < today) {
    return { primary: 'Overdue', secondary: format(date, 'EEE, d MMM') };
  }
  if (isThisWeek(date, { weekStartsOn: 1 })) {
    return { primary: format(date, 'EEEE'), secondary: format(date, 'd MMM') };
  }
  return {
    primary: format(date, 'EEE, d MMM'),
    secondary: isThisYear(date) ? '' : format(date, 'yyyy'),
  };
}

export function isOverdue(due: string | Date): boolean {
  const d = typeof due === 'string' ? parseISO(due) : due;
  return isPast(d) && !isSameDay(d, new Date());
}
