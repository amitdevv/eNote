import { type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { HugeiconsIcon, Flag03Icon } from '@/shared/lib/icons';
import { cn } from '@/shared/lib/cn';
import { PRIORITY_META, type Priority } from '../types';

export function PriorityPicker({
  value,
  onChange,
  children,
}: {
  value: Priority;
  onChange: (next: Priority) => void;
  children: ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="z-50 w-[180px] rounded-lg border border-line-default bg-surface-panel shadow-md overflow-hidden p-1 data-[state=open]:animate-fade-in"
        >
          {([1, 2, 3, 4] as const).map((p) => {
            const meta = PRIORITY_META[p];
            const active = value === p;
            return (
              <Popover.Close asChild key={p}>
                <button
                  type="button"
                  onClick={() => onChange(p)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-2 h-8 text-preview transition-colors text-left',
                    active
                      ? 'bg-surface-muted text-ink-strong'
                      : 'text-ink-default hover:bg-surface-muted/60',
                  )}
                >
                  <HugeiconsIcon
                    icon={Flag03Icon}
                    size={14}
                    style={{ color: meta.dot }}
                  />
                  <span className="flex-1 truncate">{meta.label}</span>
                </button>
              </Popover.Close>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
