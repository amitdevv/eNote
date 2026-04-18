import { cn } from '@/shared/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { HugeiconsIcon, PinIcon, ArrowRight01Icon } from '@/shared/lib/icons';
import type { NoteSort } from '../api';

export type FilterState = {
  pinnedOnly: boolean;
  sort: NoteSort;
};

const SORT_LABELS: Record<NoteSort, string> = {
  updated: 'Last updated',
  created: 'Date created',
  title: 'Title',
};

function Pill({
  active,
  icon,
  children,
  onClick,
}: {
  active?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-7 inline-flex items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors duration-150',
        active
          ? 'bg-surface-active text-ink-strong'
          : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function NotesFilterBar({
  state,
  onChange,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const anyActive = state.pinnedOnly || state.sort !== 'updated';

  return (
    <div className="flex items-center gap-1 border-b border-line-subtle px-3 h-11">
      <Pill
        active={state.pinnedOnly}
        icon={<HugeiconsIcon icon={PinIcon} size={13} />}
        onClick={() => onChange({ ...state, pinnedOnly: !state.pinnedOnly })}
      >
        Pinned
      </Pill>

      <div className="w-px h-4 bg-line-default mx-1" aria-hidden />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'h-7 inline-flex items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors duration-150',
              state.sort !== 'updated'
                ? 'bg-surface-active text-ink-strong'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong'
            )}
          >
            <span className="text-ink-subtle">Sort ·</span>
            <span>{SORT_LABELS[state.sort]}</span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={12}
              className="rotate-90 text-ink-subtle"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {(Object.keys(SORT_LABELS) as NoteSort[]).map((s) => (
            <DropdownMenuItem
              key={s}
              onSelect={() => onChange({ ...state, sort: s })}
              className={state.sort === s ? 'text-ink-strong' : ''}
            >
              {SORT_LABELS[s]}
              {state.sort === s && (
                <span className="ml-auto text-brand text-[12px]">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {anyActive && (
        <button
          type="button"
          onClick={() => onChange({ pinnedOnly: false, sort: 'updated' })}
          className="ml-auto h-7 px-2 text-[12px] text-ink-subtle hover:text-ink-strong transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
