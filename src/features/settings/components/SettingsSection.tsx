import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Linear-style settings section: title + optional description above,
 * content rendered inside a bordered white card.
 *
 * When `padded` is false (default), use <Row /> children or divide-y groups
 * internally so the card's rounded edges stay clean. When `padded` is true,
 * the card gets its own padding — useful for forms that span the whole card.
 */
export function SettingsSection({
  title,
  description,
  action,
  padded,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between mb-3 gap-3">
        <div className="min-w-0">
          <h2 className="text-[14px] font-semibold text-ink-strong">{title}</h2>
          {description && (
            <p className="text-[12px] text-ink-muted mt-0.5">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="rounded-xl border border-line-default bg-surface-raised overflow-hidden">
        <div className={cn(padded && 'p-4')}>{children}</div>
      </div>
    </section>
  );
}

/** A divider between rows inside a SettingsSection card. */
export function SettingsDivider() {
  return <div className="h-px bg-line-subtle" aria-hidden />;
}

/** Single row inside a SettingsSection. Label + optional hint, with a control on the right. */
export function SettingsRow({
  label,
  hint,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 px-4 py-3.5', className)}
    >
      <div className="min-w-0">
        <p className="text-[14px] text-ink-strong">{label}</p>
        {hint && <p className="text-[12px] text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
