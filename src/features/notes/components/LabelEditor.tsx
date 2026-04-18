import { useState, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { HugeiconsIcon, Delete01Icon, PlusSignIcon } from '@/shared/lib/icons';
import { LabelChip } from './LabelChip';
import { labelColor } from '../labelColor';

type Props = {
  labels: string[];
  onChange: (next: string[]) => void;
  className?: string;
};

export function LabelEditor({ labels, onChange, className }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  function commit() {
    const value = draft.trim().replace(/^#/, '').toLowerCase();
    if (value && !labels.includes(value)) {
      onChange([...labels, value]);
    }
    setDraft('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      setDraft('');
      setEditing(false);
    } else if (e.key === 'Backspace' && draft === '' && labels.length > 0) {
      onChange(labels.slice(0, -1));
    }
  }

  function remove(label: string) {
    onChange(labels.filter((l) => l !== label));
  }

  return (
    <div className={cn('flex items-center flex-wrap gap-1.5', className)}>
      {labels.map((label) => {
        const c = labelColor(label);
        return (
          <LabelChip key={label} label={label} size="sm" className="pr-0.5">
            <button
              type="button"
              onClick={() => remove(label)}
              aria-label={`Remove label ${label}`}
              className="h-4 w-4 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors"
              style={{ color: c.text }}
            >
              <HugeiconsIcon icon={Delete01Icon} size={10} />
            </button>
          </LabelChip>
        );
      })}

      {editing ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            commit();
            setEditing(false);
          }}
          placeholder="label, label…"
          className="h-6 w-[140px] bg-transparent text-[12px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-ink-subtle hover:bg-surface-muted hover:text-ink-strong transition-colors border border-dashed border-line-default"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={11} />
          {labels.length === 0 ? 'Add label' : 'Add'}
        </button>
      )}
    </div>
  );
}
