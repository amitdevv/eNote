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
  Delete01Icon,
  Tag01Icon,
  Search01Icon,
} from '@/shared/lib/icons';
import type { NoteSort } from '../api';
import { useLabels, useLabelColorMap } from '@/features/labels/hooks';
import { LabelDot } from './LabelChip';

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

// ── Label picker (used inside the Labels popover) ───────────────────────

function LabelPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const { data: allLabels } = useLabels();
  const labels = allLabels ?? [];
  const [query, setQuery] = useState('');

  const filtered = labels.filter((l) =>
    l.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggle(label: string) {
    const next = selected.includes(label)
      ? selected.filter((l) => l !== label)
      : [...selected, label];
    onChange(next);
  }

  return (
    <div className="w-[240px]">
      <div className="flex items-center gap-2 border-b border-line-subtle px-2.5 h-9">
        <HugeiconsIcon icon={Search01Icon} size={13} className="text-ink-subtle shrink-0" />
        <input
          autoFocus
          placeholder="Search labels"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-preview text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
        />
      </div>
      <div className="max-h-[260px] overflow-y-auto p-1 flex flex-col">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-caption text-ink-muted">
            {labels.length === 0 ? 'No labels yet' : 'No matches'}
          </div>
        ) : (
          filtered.map((l) => {
            const checked = selected.includes(l.name);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggle(l.name)}
                className="flex items-center gap-2.5 rounded-md px-2 h-8 text-preview text-ink-default hover:bg-surface-muted transition-colors text-left"
              >
                <LabelDot color={l.color} />
                <span className="truncate flex-1">{l.name}</span>
                {checked && <span className="text-brand text-preview">✓</span>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Filter pill shell ───────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption font-medium transition-colors',
        active
          ? 'bg-brand/10 text-brand hover:bg-brand/15'
          : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
      )}
    >
      {children}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────

export function NotesFilterBar({
  state,
  onChange,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const colorMap = useLabelColorMap();

  const anyActive =
    state.pinnedOnly || state.labels.length > 0 || state.sort !== 'updated';

  const labelsActive = state.labels.length > 0;

  return (
    <div className="flex items-center gap-1.5 flex-wrap border-b border-line-subtle px-3 py-2 min-h-[44px]">
      {/* Pinned toggle */}
      <FilterPill
        active={state.pinnedOnly}
        onClick={() => onChange({ ...state, pinnedOnly: !state.pinnedOnly })}
      >
        <HugeiconsIcon icon={PinIcon} size={12} />
        Pinned
      </FilterPill>

      {/* Labels popover */}
      <Popover.Root open={labelsOpen} onOpenChange={setLabelsOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption font-medium transition-colors',
              labelsActive
                ? 'bg-brand/10 text-brand hover:bg-brand/15'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
            )}
          >
            {labelsActive ? (
              <span className="flex items-center -space-x-1">
                {state.labels.slice(0, 3).map((l) => (
                  <LabelDot
                    key={l}
                    color={colorMap[l]}
                    size={8}
                    className="ring-2 ring-surface-panel"
                  />
                ))}
              </span>
            ) : (
              <HugeiconsIcon icon={Tag01Icon} size={12} />
            )}
            {labelsActive
              ? state.labels.length === 1
                ? state.labels[0]
                : `${state.labels.length} labels`
              : 'Labels'}
            {labelsActive && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ ...state, labels: [] });
                }}
                aria-label="Clear labels"
                className="ml-0.5 -mr-1 h-4 w-4 flex items-center justify-center rounded-full hover:bg-brand/20"
              >
                <HugeiconsIcon icon={Delete01Icon} size={9} />
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

      {/* Sort + Reset on the right */}
      <div className="ml-auto flex items-center gap-1.5">
        {anyActive && (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="h-7 px-2 text-caption text-ink-subtle hover:text-ink-strong transition-colors"
          >
            Reset
          </button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="h-7 inline-flex items-center gap-1 rounded-full px-2.5 text-caption font-medium text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
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
                {state.sort === s && <span className="text-brand text-caption">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
