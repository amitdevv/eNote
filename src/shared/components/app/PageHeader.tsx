import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type Props = {
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

/**
 * 44px tall row with a subtle bottom border.
 * - `leading`: stuff before the title (e.g. a back button). If present, title still shows.
 * - `title`: the main heading — text-header font-medium.
 * - `trailing`: right-side actions.
 */
export function PageHeader({ title, leading, trailing, className }: Props) {
  return (
    <header
      className={cn(
        'flex items-center justify-between gap-3 border-b border-line-subtle px-4 h-11 shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {leading}
        {title && (
          <h1 className="text-header font-medium text-ink-strong truncate">{title}</h1>
        )}
      </div>
      {trailing && <div className="flex items-center gap-2 shrink-0">{trailing}</div>}
    </header>
  );
}
