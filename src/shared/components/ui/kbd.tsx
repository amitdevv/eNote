import { cn } from '@/shared/lib/cn';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-[20px] items-center justify-center rounded-md bg-surface-muted px-1.5 font-mono text-[11px] font-medium text-ink-muted',
        className
      )}
    >
      {children}
    </kbd>
  );
}
