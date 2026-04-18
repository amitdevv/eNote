import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/cn';

export const TooltipProvider = TooltipPrimitive.Provider;

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 rounded-md bg-ink-strong px-2 py-1 text-[11px] font-medium text-surface-raised shadow-md',
      'data-[state=delayed-open]:animate-fade-in',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

/**
 * Convenience wrapper: `<Tooltip content="Pin · P">{child}</Tooltip>`.
 * `shortcut` renders a lightly-tinted kbd after the label.
 */
export function Tooltip({
  content,
  shortcut,
  side = 'top',
  delayDuration = 200,
  children,
}: {
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  children: React.ReactNode;
}) {
  if (!content) return <>{children}</>;
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipContent side={side}>
          <span className="flex items-center gap-1.5">
            <span>{content}</span>
            {shortcut && (
              <span className="rounded bg-white/10 px-1 font-mono text-[10px] text-white/80">
                {shortcut}
              </span>
            )}
          </span>
        </TooltipContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
