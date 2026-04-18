import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Command } from 'cmdk';
import * as Popover from '@radix-ui/react-popover';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import {
  HugeiconsIcon,
  Delete01Icon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
} from '@/shared/lib/icons';
import { LabelChip, LabelDot } from './LabelChip';
import { useLabels, useLabelColorMap } from '@/features/labels/hooks';
import { useCreateLabel } from '@/features/labels/hooks';
import { PALETTE_KEYS, type PaletteKey } from '../labelColor';

type Props = {
  labels: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

function colorForName(name: string): PaletteKey {
  // Simple deterministic hash so a user-created label always gets the same
  // color regardless of which device / session created it.
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % (PALETTE_KEYS.length - 1); // skip stone (orphan color)
  return PALETTE_KEYS[idx];
}

/**
 * Select labels from the user's curated list. New labels can be created
 * inline: type a name, press Enter (or click the "Create …" row) to add it.
 */
export function LabelEditor({ labels, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { data: allLabels, isLoading } = useLabels();
  const colorMap = useLabelColorMap();
  const createLabel = useCreateLabel();

  const trimmed = query.trim();
  const lcQuery = trimmed.toLowerCase();
  const existingNames = useMemo(
    () => new Set((allLabels ?? []).map((l) => l.name.toLowerCase())),
    [allLabels],
  );
  const canCreate = trimmed.length > 0 && !existingNames.has(lcQuery);

  function toggle(name: string) {
    onChange(labels.includes(name) ? labels.filter((l) => l !== name) : [...labels, name]);
  }

  function remove(name: string) {
    onChange(labels.filter((l) => l !== name));
  }

  async function createAndAttach() {
    if (!canCreate || createLabel.isPending) return;
    const name = trimmed;
    try {
      await createLabel.mutateAsync({ name, color: colorForName(name) });
      if (!labels.includes(name)) onChange([...labels, name]);
      setQuery('');
    } catch (e) {
      toast.error('Could not create label', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <div className={cn('flex items-center flex-wrap gap-1.5', className)}>
      {labels.map((name) => {
        const color = colorMap[name];
        const c = color ? undefined : 'stone';
        return (
          <LabelChip key={name} label={name} color={color ?? c} size="sm" className="pr-0.5">
            <button
              type="button"
              onClick={() => remove(name)}
              aria-label={`Remove label ${name}`}
              className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              style={{ color: 'currentColor' }}
            >
              <HugeiconsIcon icon={Delete01Icon} size={10} />
            </button>
          </LabelChip>
        );
      })}

      <Popover.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery('');
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-micro font-medium text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors border border-dashed border-line-default"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={11} />
            {labels.length === 0 ? 'Add label' : 'Add'}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            sideOffset={6}
            align="start"
            className="z-50 w-[260px] rounded-lg border border-line-default bg-surface-panel shadow-md overflow-hidden data-[state=open]:animate-fade-in"
          >
            <Command loop>
              <div className="flex items-center gap-2 border-b border-line-subtle px-2.5 h-9">
                <HugeiconsIcon icon={Search01Icon} size={13} className="text-ink-subtle shrink-0" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search or create…"
                  className="flex-1 bg-transparent text-preview text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
                />
              </div>
              <Command.List className="max-h-[240px] overflow-y-auto p-1">
                {/* Empty state only shows when there's no query and no labels at all. */}
                {!canCreate && (
                  <Command.Empty className="py-6 text-center text-caption text-ink-muted">
                    {isLoading
                      ? 'Loading…'
                      : (allLabels?.length ?? 0) === 0
                        ? 'No labels yet. Type to create one.'
                        : 'No matches'}
                  </Command.Empty>
                )}
                {(allLabels ?? []).map((l) => {
                  const checked = labels.includes(l.name);
                  return (
                    <Command.Item
                      key={l.id}
                      value={l.name}
                      onSelect={() => toggle(l.name)}
                      className="flex items-center gap-2.5 rounded-md px-2 h-8 text-preview text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
                    >
                      <LabelDot color={l.color} />
                      <span className="truncate flex-1">{l.name}</span>
                      {checked && <span className="text-brand text-preview">✓</span>}
                    </Command.Item>
                  );
                })}

                {/* Inline "Create …" row — appears when the query doesn't match
                    any existing label. Enter or click selects it. */}
                {canCreate && (
                  <Command.Item
                    value={`__create__:${trimmed}`}
                    onSelect={createAndAttach}
                    className="flex items-center gap-2.5 rounded-md px-2 h-8 text-preview text-ink-strong cursor-pointer data-[selected=true]:bg-surface-muted"
                  >
                    <LabelDot color={colorForName(trimmed)} />
                    <span className="text-ink-muted">Create</span>
                    <span className="truncate font-medium">{trimmed}</span>
                    {createLabel.isPending && (
                      <span className="ml-auto text-micro text-ink-subtle">Adding…</span>
                    )}
                  </Command.Item>
                )}
              </Command.List>
              <div className="border-t border-line-subtle p-1">
                <Link
                  to="/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 h-8 text-caption text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
                >
                  <HugeiconsIcon icon={Settings01Icon} size={13} className="text-ink-subtle" />
                  Manage labels…
                </Link>
              </div>
            </Command>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
