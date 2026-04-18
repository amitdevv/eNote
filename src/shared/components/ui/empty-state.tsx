import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 py-24 px-6',
        className
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <p className="text-nav font-medium text-ink-strong">{title}</p>
        {description && <p className="text-preview text-ink-muted leading-[1.5]">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
