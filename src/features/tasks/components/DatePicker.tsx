import { useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { DayPicker } from 'react-day-picker';
import { startOfDay } from 'date-fns';
import { HugeiconsIcon, Delete01Icon } from '@/shared/lib/icons';

type Props = {
  value: string | null;
  onChange: (iso: string | null) => void;
  children: ReactNode;
};

function toIso(d: Date): string {
  return startOfDay(d).toISOString();
}

export function DatePicker({ value, onChange, children }: Props) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;

  function pick(d: Date) {
    onChange(toIso(d));
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          className="z-50 w-[260px] rounded-xl border border-line-default bg-surface-panel shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18),0_4px_10px_-6px_rgba(0,0,0,0.08)] overflow-hidden data-[state=open]:animate-fade-in"
        >
          <div className="p-2">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => d && pick(d)}
              weekStartsOn={1}
              showOutsideDays
              navLayout="around"
              classNames={{
                months: 'flex flex-col gap-2',
                month: 'flex flex-col gap-2 relative',
                month_caption:
                  'flex items-center justify-center h-7',
                caption_label:
                  'text-caption font-semibold text-ink-strong tracking-tight',
                button_previous:
                  'absolute left-0 top-0 h-7 w-7 rounded-md hover:bg-surface-muted flex items-center justify-center text-ink-muted cursor-pointer bg-transparent border-0 p-0 z-10',
                button_next:
                  'absolute right-0 top-0 h-7 w-7 rounded-md hover:bg-surface-muted flex items-center justify-center text-ink-muted cursor-pointer bg-transparent border-0 p-0 z-10',
                chevron: 'h-3.5 w-3.5 fill-current',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday:
                  'w-8 h-6 text-caption font-medium text-ink-muted uppercase tracking-wide text-center',
                weeks: '',
                week: 'flex w-full mt-0.5',
                day: 'w-8 h-8 p-0 relative text-center',
                day_button:
                  'w-7 h-7 mx-auto rounded-md text-caption text-ink-default hover:bg-surface-muted transition-colors flex items-center justify-center font-medium disabled:opacity-40 disabled:pointer-events-none bg-transparent border-0 cursor-pointer',
                selected:
                  '[&_button]:bg-brand [&_button]:text-white [&_button]:hover:bg-brand',
                today:
                  '[&_button]:ring-1 [&_button]:ring-brand/40 [&_button]:text-brand [&_button]:font-semibold',
                outside: '[&_button]:text-ink-subtle [&_button]:opacity-60',
                disabled: 'opacity-40 pointer-events-none',
                hidden: 'invisible',
              }}
            />
          </div>

          <div className="flex items-center justify-end px-1.5 py-1 border-t border-line-subtle">
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="flex items-center gap-1.5 h-7 px-2 text-micro text-ink-muted hover:text-red-600 transition-colors rounded-md"
            >
              <HugeiconsIcon icon={Delete01Icon} size={11} />
              Clear
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
