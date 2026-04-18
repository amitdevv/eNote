import { format, formatDistanceToNow, isThisYear, isToday, isYesterday } from 'date-fns';

export function formatRelative(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  if (isThisYear(d)) return format(d, 'MMM d');
  return format(d, 'MMM d, yyyy');
}

export function formatAgo(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return formatDistanceToNow(d, { addSuffix: true });
}
