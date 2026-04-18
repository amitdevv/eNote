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
        'flex flex-col items-center justify-center text-center gap-3 py-20 px-6',
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="text-[15px] font-medium text-ink-strong">{title}</p>
        {description && <p className="text-[13px] text-ink-muted max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
