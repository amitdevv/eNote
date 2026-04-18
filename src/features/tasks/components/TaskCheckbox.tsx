import { PRIORITY_META, type Priority } from '../types';
import { cn } from '@/shared/lib/cn';

type Props = {
  checked: boolean;
  priority: Priority;
  onChange: (next: boolean) => void;
  className?: string;
};

/**
 * Todoist-style circular checkbox whose border colour reflects priority.
 * When checked, the ring fills solid with the priority colour and a white tick lands on top.
 */
export function TaskCheckbox({ checked, priority, onChange, className }: Props) {
  const meta = PRIORITY_META[priority];
  const isNone = priority === 4;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? 'Mark task incomplete' : 'Mark task complete'}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'size-[18px] shrink-0 rounded-full border transition-colors duration-150 flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ink-default/20',
        checked ? 'text-white' : 'bg-transparent',
        className,
      )}
      style={{
        borderColor: isNone && !checked ? undefined : meta.dot,
        borderWidth: isNone ? 1 : 1.5,
        backgroundColor: checked ? meta.dot : undefined,
      }}
    >
      {checked && (
        <svg viewBox="0 0 16 16" width={11} height={11} fill="none" aria-hidden>
          <path
            d="M3.5 8l3 3L12.5 5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {/* Subtle inner tint when not checked, to echo the design's opacity-10 fill. */}
      {!checked && !isNone && (
        <span
          aria-hidden
          className="size-[10px] rounded-full opacity-30"
          style={{ backgroundColor: meta.dot }}
        />
      )}
    </button>
  );
}
