import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion';
import { HugeiconsIcon } from '@/shared/lib/icons';
import { cn } from '@/shared/lib/cn';
import type { SlashCommandItem } from '../slashCommand';

export type SlashMenuHandle = {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
};

export const SlashMenu = forwardRef<SlashMenuHandle, SuggestionProps<SlashCommandItem>>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setSelected(0);
    }, [items]);

    useLayoutEffect(() => {
      const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${selected}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }, [selected]);

    const select = (idx: number) => {
      const item = items[idx];
      if (item) command(item);
    };

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowDown') {
          setSelected((s) => (s + 1) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === 'ArrowUp') {
          setSelected((s) => (s - 1 + Math.max(items.length, 1)) % Math.max(items.length, 1));
          return true;
        }
        if (event.key === 'Enter' || event.key === 'Tab') {
          select(selected);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="w-[280px] rounded-xl border border-line-default bg-surface-panel shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18),0_4px_10px_-6px_rgba(0,0,0,0.08)] p-2 text-preview text-ink-muted">
          No results
        </div>
      );
    }

    return (
      <div
        ref={listRef}
        className="w-[280px] max-h-[320px] overflow-y-auto rounded-xl border border-line-default bg-surface-panel shadow-[0_10px_30px_-10px_rgba(0,0,0,0.18),0_4px_10px_-6px_rgba(0,0,0,0.08)] p-1"
      >
        {items.map((item, idx) => {
          const active = idx === selected;
          return (
            <button
              key={item.title}
              type="button"
              data-idx={idx}
              onMouseEnter={() => setSelected(idx)}
              onMouseDown={(e) => {
                e.preventDefault();
                select(idx);
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors',
                active ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
              )}
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-line-subtle bg-surface-raised text-ink-default">
                <HugeiconsIcon icon={item.icon} size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-preview font-medium text-ink-strong truncate">
                  {item.title}
                </p>
                <p className="text-micro text-ink-muted truncate">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    );
  },
);
SlashMenu.displayName = 'SlashMenu';
