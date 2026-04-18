import { HugeiconsIcon, Calendar03Icon } from '@/shared/lib/icons';
import { cn } from '@/shared/lib/cn';
import { dueTone, formatDue, type DueTone } from '../date';

const TONE_CLASS: Record<DueTone, string> = {
  overdue: 'text-red-600',
  today: 'text-brand',
  tomorrow: 'text-amber-600',
  soon: 'text-violet-600',
  later: 'text-ink-muted',
  done: 'text-ink-subtle',
};

export function DateChip({
  due,
  done = false,
  className,
}: {
  due: string;
  done?: boolean;
  className?: string;
}) {
  const tone = dueTone(due, done);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-caption leading-none',
        TONE_CLASS[tone],
        className,
      )}
    >
      <HugeiconsIcon icon={Calendar03Icon} size={12} strokeWidth={1.8} />
      {formatDue(due)}
    </span>
  );
}
