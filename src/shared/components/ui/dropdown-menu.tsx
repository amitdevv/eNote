import * as React from 'react';
import * as DM from '@radix-ui/react-dropdown-menu';
import { cn } from '@/shared/lib/cn';

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuGroup = DM.Group;
export const DropdownMenuPortal = DM.Portal;

export const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DM.Content>,
  React.ComponentPropsWithoutRef<typeof DM.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <DM.Portal>
    <DM.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[180px] overflow-hidden rounded-lg border border-line-default bg-surface-panel shadow-md p-1',
        'data-[state=open]:animate-fade-in',
        className
      )}
      {...props}
    />
  </DM.Portal>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

type ItemProps = React.ComponentPropsWithoutRef<typeof DM.Item> & {
  destructive?: boolean;
  shortcut?: string;
};

export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DM.Item>, ItemProps>(
  ({ className, destructive, shortcut, children, ...props }, ref) => (
    <DM.Item
      ref={ref}
      className={cn(
        'relative flex items-center gap-2 rounded-md px-2 h-8 text-preview outline-none cursor-pointer select-none transition-colors duration-100',
        destructive
          ? 'text-red-600 data-[highlighted]:bg-red-500/10'
          : 'text-ink-default data-[highlighted]:bg-surface-muted data-[highlighted]:text-ink-strong',
        className
      )}
      {...props}
    >
      <span className="flex-1 min-w-0 flex items-center gap-2">{children}</span>
      {shortcut && (
        <span className="text-micro font-mono text-ink-subtle">{shortcut}</span>
      )}
    </DM.Item>
  )
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DM.Separator>,
  React.ComponentPropsWithoutRef<typeof DM.Separator>
>(({ className, ...props }, ref) => (
  <DM.Separator ref={ref} className={cn('my-1 h-px bg-line-subtle', className)} {...props} />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DM.Label>,
  React.ComponentPropsWithoutRef<typeof DM.Label>
>(({ className, ...props }, ref) => (
  <DM.Label
    ref={ref}
    className={cn(
      'px-2 py-1 text-micro font-medium uppercase tracking-wider text-ink-subtle',
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';
