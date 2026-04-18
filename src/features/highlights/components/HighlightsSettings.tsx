import { useState } from 'react';
import { toast } from 'sonner';
import {
  useHighlights,
  useCreateHighlight,
  useUpdateHighlight,
  useDeleteHighlight,
} from '../hooks';
import { PALETTE, PALETTE_KEYS, type PaletteKey } from '@/features/notes/labelColor';
import { HugeiconsIcon, Delete01Icon, PlusSignIcon, Edit02Icon } from '@/shared/lib/icons';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/cn';
import type { Highlight } from '../types';

/** Editor sample — shows how the highlight looks on real text. */
function Sample({ color }: { color: string }) {
  return (
    <span className="text-[13px] text-ink-default">
      When I wrote <mark style={{ backgroundColor: color, padding: '1px 4px', borderRadius: 3 }}>this sentence</mark> I meant it.
    </span>
  );
}

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {PALETTE_KEYS.map((k) => {
        const bg = PALETTE[k as PaletteKey].bg;
        const dot = PALETTE[k as PaletteKey].dot;
        const selected = value.toLowerCase() === bg.toLowerCase();
        return (
          <button
            key={k}
            type="button"
            aria-label={`Highlight ${k}`}
            onClick={() => onChange(bg)}
            className={cn(
              'relative size-7 rounded-md transition-transform duration-150 border',
              selected ? 'scale-110 border-ink-strong' : 'border-line-default hover:scale-105'
            )}
            style={{ backgroundColor: bg }}
          >
            {selected && (
              <span
                className="absolute inset-1 rounded-sm"
                style={{ border: `2px solid ${dot}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Row({ highlight }: { highlight: Highlight }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(highlight.name);
  const [color, setColor] = useState(highlight.color);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = useUpdateHighlight();
  const del = useDeleteHighlight();

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(highlight.name);
      setEditing(false);
      return;
    }
    try {
      await update.mutateAsync({ id: highlight.id, patch: { name: trimmed, color } });
      setEditing(false);
    } catch (e) {
      toast.error('Could not save highlight', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-3 py-3">
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
              if (e.key === 'Escape') {
                setName(highlight.name);
                setColor(highlight.color);
                setEditing(false);
              }
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={save} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
        <ColorSwatches value={color} onChange={setColor} />
        <Sample color={color} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-3 group">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="size-5 rounded-md border border-line-default shrink-0"
            style={{ backgroundColor: highlight.color }}
          />
          <span className="text-[14px] text-ink-strong truncate">{highlight.name}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit highlight"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors"
          >
            <HugeiconsIcon icon={Edit02Icon} size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Delete highlight"
            className="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-red-500/10 hover:text-red-600 transition-colors"
          >
            <HugeiconsIcon icon={Delete01Icon} size={14} />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete highlight "${highlight.name}"?`}
        description="Existing highlighted text keeps its colour; this just removes it from the picker."
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={async () => {
          await del.mutateAsync(highlight.id);
        }}
      />
    </>
  );
}

function CreateRow() {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE.yellow.bg);
  const create = useCreateHighlight();

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await create.mutateAsync({ name: trimmed, color });
      setName('');
      setColor(PALETTE.yellow.bg);
      setCreating(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(
        msg.includes('unique') || msg.includes('duplicate')
          ? `Highlight "${trimmed}" already exists`
          : 'Could not create highlight',
        { description: msg.includes('unique') ? undefined : msg }
      );
    }
  }

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="flex items-center gap-1.5 h-8 px-2 rounded-md text-[13px] font-medium text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
      >
        <HugeiconsIcon icon={PlusSignIcon} size={14} />
        New highlight
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          placeholder="Name (e.g. important, quote, todo)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
              setCreating(false);
              setName('');
            }
          }}
          className="flex-1"
        />
        <Button size="sm" onClick={submit} disabled={!name.trim() || create.isPending}>
          {create.isPending ? 'Adding…' : 'Add'}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
          Cancel
        </Button>
      </div>
      <ColorSwatches value={color} onChange={setColor} />
      <Sample color={color} />
    </div>
  );
}

export function HighlightsSettings() {
  const { data, isLoading } = useHighlights();

  return (
    <section>
      <h2 className="text-[12px] font-medium uppercase tracking-wider text-ink-subtle mb-3">
        Highlights
      </h2>
      <p className="text-[12px] text-ink-muted mb-3">
        Curated highlight colours for the editor. Select text, pick one from the bubble menu.
        Existing highlights keep their colour even if you later change or delete the definition.
      </p>

      {isLoading ? (
        <div className="py-4 text-[13px] text-ink-muted">Loading…</div>
      ) : (
        <>
          {(data ?? []).length > 0 && (
            <div className="divide-y divide-line-subtle mb-2">
              {data!.map((h) => (
                <Row key={h.id} highlight={h} />
              ))}
            </div>
          )}
          <CreateRow />
        </>
      )}
    </section>
  );
}
