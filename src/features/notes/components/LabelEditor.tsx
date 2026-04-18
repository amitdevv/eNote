import { useState, useRef, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/cn';
import { HugeiconsIcon, Delete01Icon, PlusSignIcon } from '@/shared/lib/icons';

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
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex h-6 items-center gap-1 rounded-full bg-surface-muted pl-2 pr-0.5 text-[11px] font-medium text-ink-default"
        >
          <span className="size-1.5 rounded-full bg-brand/70" />
          <span>{label}</span>
          <button
            type="button"
            onClick={() => remove(label)}
            aria-label={`Remove label ${label}`}
            className="h-5 w-5 flex items-center justify-center text-ink-subtle hover:text-ink-strong rounded-full transition-colors"
          >
            <HugeiconsIcon icon={Delete01Icon} size={10} />
          </button>
        </span>
      ))}

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
          className="h-6 w-[120px] bg-transparent text-[11px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
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
