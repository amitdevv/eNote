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
      'z-50 rounded-md bg-ink-strong px-2 py-1 text-micro font-medium text-surface-raised shadow-md',
      'data-[state=delayed-open]:animate-fade-in',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = 'TooltipContent';

/**
 * Convenience wrapper: `<Tooltip content="Pin">{child}</Tooltip>`.
 * Accepts an optional `shortcut` prop but does not render it — shortcuts
 * are shown only in Settings to avoid chrome noise. The prop is kept so
 * call sites compile; future behaviour may reintroduce it selectively.
 */
export function Tooltip({
  content,
  side = 'top',
  delayDuration = 200,
  children,
}: {
  content: React.ReactNode;
  /** Reserved. Not rendered — see file comment. */
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
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
