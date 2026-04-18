import { useState } from 'react';
import { toast } from 'sonner';
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from '../hooks';
import { PALETTE_KEYS, paletteByKey, type PaletteKey } from '@/features/notes/labelColor';
import { LabelChip } from '@/features/notes/components/LabelChip';
import { HugeiconsIcon, Delete01Icon, PlusSignIcon, Edit02Icon } from '@/shared/lib/icons';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/cn';
import type { Label } from '../types';
import { SettingsSection } from '@/features/settings/components/SettingsSection';

function ColorSwatches({
  value,
  onChange,
}: {
  value: PaletteKey | string;
  onChange: (next: PaletteKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {PALETTE_KEYS.map((k) => {
        const p = paletteByKey(k);
        const selected = value === k;
        return (
          <button
            key={k}
            type="button"
            aria-label={`Color ${k}`}
            onClick={() => onChange(k)}
            className={cn(
              'relative size-5 rounded-full transition-all duration-150 outline-none',
              selected
                ? 'ring-2 ring-offset-2 ring-offset-surface-raised'
                : 'hover:scale-110'
            )}
            style={{
              backgroundColor: p.dot,
              ...(selected ? { boxShadow: `0 0 0 2px ${p.dot}` } : {}),
            }}
          >
            {selected && (
              <svg
                viewBox="0 0 20 20"
                width={10}
                height={10}
                className="absolute inset-0 m-auto"
                fill="none"
              >
                <path
                  d="M4 10l3.5 3.5L16 5"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}

function EditableLabelRow({ label }: { label: Label }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(label.name);
  const [color, setColor] = useState<PaletteKey>((label.color as PaletteKey) ?? 'stone');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = useUpdateLabel();
  const del = useDeleteLabel();

  async function save() {
    const trimmed = name.trim().toLowerCase().replace(/^#/, '');
    if (!trimmed) {
      setName(label.name);
      setEditing(false);
      return;
    }
    try {
      await update.mutateAsync({ id: label.id, patch: { name: trimmed, color } });
      setEditing(false);
    } catch (e) {
      toast.error('Could not save label', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 px-4 py-3.5">
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') {
                setName(label.name);
                setColor((label.color as PaletteKey) ?? 'stone');
                setEditing(false);
              }
            }}
            className="flex-1 h-8 bg-transparent text-[14px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
          />
          <Button size="sm" onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <ColorSwatches value={color} onChange={setColor} />
        <div>
          <LabelChip label={name || label.name} color={color} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3 group">
        <LabelChip label={label.name} color={label.color} size="sm" />
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit label"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors"
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete label"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors"
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete label "${label.name}"?`}
        description="Notes that reference this label will keep the name but render it in neutral grey."
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={async () => {
          await del.mutateAsync(label.id);
        }}
      />
    </>
  );
}

function CreateLabelRow() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState<PaletteKey>('blue');
  const create = useCreateLabel();

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await create.mutateAsync({ name: trimmed, color });
      setName('');
      setColor('blue');
      setCreating(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(
        msg.includes('unique') || msg.includes('duplicate')
          ? `Label "${trimmed}" already exists`
          : 'Could not create label',
        { description: msg.includes('unique') ? undefined : msg }
      );
    }
  }

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex items-center gap-1.5 h-11 w-full px-4 text-[13px] font-medium text-ink-muted hover:bg-surface-muted/60 hover:text-ink-strong transition-colors"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
        New label
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex items-center gap-2">
        <input
          autoFocus
          placeholder="Label name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
              setCreating(false);
              setName('');
            }
          }}
          className="flex-1 h-8 bg-transparent text-[14px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
        />
        <Button size="sm" onClick={submit} disabled={!name.trim() || create.isPending}>
          {create.isPending ? 'Adding…' : 'Add'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
          Cancel
        </Button>
      </div>
      <ColorSwatches value={color} onChange={setColor} />
      {name.trim() && (
        <div>
          <LabelChip label={name.trim().toLowerCase()} color={color} size="sm" />
        </div>
      )}
    </div>
  );
}

export function LabelsSettings() {
  const { data: labels, isLoading } = useLabels();

  return (
    <SettingsSection
      title="Labels"
      description="Tag your notes. Each label has a colour you choose — consistent everywhere it appears."
    >
      {isLoading ? (
        <div className="px-4 py-6 text-[13px] text-ink-muted">Loading…</div>
      ) : (
        <>
          {(labels ?? []).length > 0 && (
            <div className="divide-y divide-line-subtle">
              {labels!.map((l) => (
                <EditableLabelRow key={l.id} label={l} />
              ))}
            </div>
          )}
          {(labels ?? []).length > 0 && <div className="h-px bg-line-subtle" />}
          <CreateLabelRow />
        </>
      )}
    </SettingsSection>
  );
}
