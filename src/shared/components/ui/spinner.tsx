import { cn } from '@/shared/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block h-4 w-4 rounded-full border-2 border-ink-placeholder border-t-transparent animate-spin',
        className
      )}
    />
  );
}
