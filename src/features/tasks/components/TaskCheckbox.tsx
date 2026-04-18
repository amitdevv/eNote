import { motion, AnimatePresence } from 'framer-motion';
import {
  HugeiconsIcon,
  CircleIcon,
  CheckmarkCircle02Icon,
} from '@/shared/lib/icons';
import { PRIORITY_META, type Priority } from '../types';
import { cn } from '@/shared/lib/cn';

type Props = {
  checked: boolean;
  priority: Priority;
  onChange: (next: boolean) => void;
  className?: string;
};

/**
 * Circular task checkbox with a satisfying tick animation.
 * Uses HugeIcons' CircleIcon (idle) and CheckmarkCircle02Icon (checked).
 * Border/fill colour reflects priority. Hover previews the filled state.
 */
export function TaskCheckbox({ checked, priority, onChange, className }: Props) {
  const meta = PRIORITY_META[priority];
  const isNone = priority === 4;
  const tint = isNone ? 'var(--ink-subtle, #9ca3af)' : meta.dot;

  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? 'Mark task incomplete' : 'Mark task complete'}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      whileTap={{ scale: 0.85 }}
      animate={checked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
      className={cn(
        'group relative size-[18px] shrink-0 rounded-full flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-ink-default/20',
        className,
      )}
      style={{ color: tint }}
    >
      <AnimatePresence initial={false} mode="wait">
        {checked ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={18}
              strokeWidth={2}
              className="drop-shadow-sm"
            />
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="relative flex items-center justify-center"
          >
            {/* Idle circle */}
            <HugeiconsIcon
              icon={CircleIcon}
              size={18}
              strokeWidth={isNone ? 1.5 : 2}
              className="transition-opacity duration-150 group-hover:opacity-0"
            />
            {/* Hover preview — the filled check shows faintly on hover */}
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={18}
              strokeWidth={2}
              className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-150"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
