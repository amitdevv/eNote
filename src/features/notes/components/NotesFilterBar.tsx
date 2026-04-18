import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { cn } from '@/shared/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  HugeiconsIcon,
  PinIcon,
  ArrowRight01Icon,
  PlusSignIcon,
  Delete01Icon,
  Note01Icon,
  Search01Icon,
} from '@/shared/lib/icons';
import type { NoteSort } from '../api';
import { useLabels, useLabelColorMap } from '@/features/labels/hooks';
import { LabelChip, LabelDot } from './LabelChip';

// ── Types ────────────────────────────────────────────────────────────────

export type FilterState = {
  pinnedOnly: boolean;
  labels: string[];
  sort: NoteSort;
};

export const DEFAULT_FILTERS: FilterState = {
  pinnedOnly: false,
  labels: [],
  sort: 'updated',
};

const SORT_LABELS: Record<NoteSort, string> = {
  updated: 'Last updated',
  created: 'Date created',
  title: 'Title',
};

// ── Subcomponents ───────────────────────────────────────────────────────

function ChipShell({
  onClear,
  children,
  interactive,
}: {
  onClear?: () => void;
  children: React.ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        'inline-flex h-7 items-center rounded-full bg-surface-muted text-[12px] font-medium text-ink-default',
        interactive && 'hover:bg-surface-active transition-colors duration-150'
      )}
    >
      <span className="pl-2.5 flex items-center gap-1.5">{children}</span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Remove filter"
          className="h-7 w-7 flex items-center justify-center text-ink-subtle hover:text-ink-strong transition-colors"
        >
          <HugeiconsIcon icon={Delete01Icon} size={12} />
        </button>
      )}
    </div>
  );
}

function LabelPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const { data: allLabels } = useLabels();
  const labels = allLabels ?? [];

  function toggle(label: string) {
    const next = selected.includes(label)
      ? selected.filter((l) => l !== label)
      : [...selected, label];
    onChange(next);
  }

  const [query, setQuery] = useState('');
  const filtered = labels.filter((l) =>
    l.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="w-[240px]">
      <div className="flex items-center gap-2 border-b border-line-subtle px-2.5 h-9">
        <HugeiconsIcon icon={Search01Icon} size={13} className="text-ink-subtle shrink-0" />
        <input
          autoFocus
          placeholder="Search labels…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-[13px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
        />
      </div>
      <div className="max-h-[260px] overflow-y-auto p-1 flex flex-col">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-ink-muted">
            {labels.length === 0 ? 'No labels yet. Create one in Settings.' : 'No matches.'}
          </div>
        ) : (
          filtered.map((l) => {
            const checked = selected.includes(l.name);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggle(l.name)}
                className="flex items-center gap-2.5 rounded-md px-2 h-8 text-[13px] text-ink-default hover:bg-surface-muted transition-colors text-left"
              >
                <LabelDot color={l.color} />
                <span className="truncate flex-1">{l.name}</span>
                {checked && <span className="text-brand text-[13px]">✓</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────

type FilterKind = 'pinned' | 'labels';

const ALL_FILTERS: { id: FilterKind; label: string; icon: typeof PinIcon }[] = [
  { id: 'pinned', label: 'Pinned', icon: PinIcon },
  { id: 'labels', label: 'Labels', icon: Note01Icon },
];

export function NotesFilterBar({
  state,
  onChange,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerView, setPickerView] = useState<'main' | 'labels'>('main');
  const [labelsOpen, setLabelsOpen] = useState(false);
  const colorMap = useLabelColorMap();

  const anyActive =
    state.pinnedOnly || state.labels.length > 0 || state.sort !== 'updated';

  function addFilter(kind: FilterKind) {
    if (kind === 'pinned') {
      onChange({ ...state, pinnedOnly: true });
      setPickerOpen(false);
      setPickerView('main');
    } else if (kind === 'labels') {
      // Stay in the same popover — switch to the labels sub-view.
      setPickerView('labels');
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap border-b border-line-subtle px-3 py-2 min-h-[44px]">
      {/* Active: Pinned */}
      {state.pinnedOnly && (
        <ChipShell onClear={() => onChange({ ...state, pinnedOnly: false })}>
          <HugeiconsIcon icon={PinIcon} size={12} className="text-brand" />
          Pinned
        </ChipShell>
      )}

      {/* Active: Labels (popover to edit selection). Shows colored chip if single,
          else a neutral chip with a count. */}
      {state.labels.length > 0 && (
        <Popover.Root open={labelsOpen} onOpenChange={setLabelsOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
            >
              {state.labels.length === 1 ? (
                <LabelChip label={state.labels[0]} color={colorMap[state.labels[0]]} size="sm" className="pr-0.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...state, labels: [] });
                    }}
                    className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={10} />
                  </span>
                </LabelChip>
              ) : (
                <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-muted text-[12px] font-medium text-ink-default pl-2 pr-1">
                  <span className="flex items-center -space-x-1">
                    {state.labels.slice(0, 3).map((l) => (
                      <LabelDot key={l} color={colorMap[l]} size={8} className="ring-2 ring-surface-panel" />
                    ))}
                  </span>
                  <span>{state.labels.length} labels</span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange({ ...state, labels: [] });
                    }}
                    aria-label="Clear labels filter"
                    className="h-5 w-5 flex items-center justify-center rounded-full text-ink-subtle hover:text-ink-strong hover:bg-surface-active"
                  >
                    <HugeiconsIcon icon={Delete01Icon} size={10} />
                  </span>
                </span>
              )}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              sideOffset={6}
              align="start"
              className="z-50 rounded-lg border border-line-default bg-surface-panel shadow-md overflow-hidden data-[state=open]:animate-fade-in"
            >
              <LabelPicker
                selected={state.labels}
                onChange={(next) => onChange({ ...state, labels: next })}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      )}

      {/* Active: non-default sort appears as a chip so it looks consistent with other filters */}
      {state.sort !== 'updated' && (
        <ChipShell onClear={() => onChange({ ...state, sort: 'updated' })}>
          <span className="text-ink-subtle">Sort ·</span>
          {SORT_LABELS[state.sort]}
        </ChipShell>
      )}

      {/* + Filter trigger */}
      <Popover.Root
        open={pickerOpen}
        onOpenChange={(o) => {
          setPickerOpen(o);
          if (!o) setPickerView('main');
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors border border-dashed border-line-default"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={12} />
            Filter
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className="z-50 rounded-lg border border-line-default bg-surface-panel shadow-md overflow-hidden data-[state=open]:animate-fade-in"
          >
            {pickerView === 'main' ? (
              <div className="w-[220px] flex flex-col p-1">
                {ALL_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => addFilter(f.id)}
                    className="flex items-center gap-2.5 rounded-md px-2 h-8 text-[13px] text-ink-default hover:bg-surface-muted transition-colors text-left"
                  >
                    <HugeiconsIcon icon={f.icon} size={14} className="text-ink-subtle" />
                    <span className="flex-1">{f.label}</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-ink-subtle" />
                  </button>
                ))}
              </div>
            ) : (
              <LabelPicker
                selected={state.labels}
                onChange={(next) => onChange({ ...state, labels: next })}
              />
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {/* Sort dropdown (always visible on the right) */}
      <div className="ml-auto flex items-center gap-1.5">
        {anyActive && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="h-7 px-2 text-[12px] text-ink-subtle hover:text-ink-strong transition-colors"
          >
            Reset
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-7 inline-flex items-center gap-1 rounded-full px-2.5 text-[12px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
            >
              <span className="text-ink-subtle">Sort:</span>
              {SORT_LABELS[state.sort]}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={11}
                className="rotate-90 text-ink-subtle"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABELS) as NoteSort[]).map((s) => (
              <DropdownMenuItem key={s} onSelect={() => onChange({ ...state, sort: s })}>
                <span className="flex-1">{SORT_LABELS[s]}</span>
                {state.sort === s && <span className="text-brand text-[12px]">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
