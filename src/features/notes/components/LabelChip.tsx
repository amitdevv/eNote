import { labelColor } from '../labelColor';
import { cn } from '@/shared/lib/cn';

type Size = 'xs' | 'sm' | 'md';

const SIZE_CLASSES: Record<Size, { pill: string; dot: string; text: string }> = {
  xs: { pill: 'h-5 gap-1 pl-1.5 pr-2 text-[10px]', dot: 'size-1.5', text: '' },
  sm: { pill: 'h-6 gap-1.5 pl-2 pr-2.5 text-[11px]', dot: 'size-2', text: '' },
  md: { pill: 'h-7 gap-2 pl-2.5 pr-3 text-[12px]', dot: 'size-2', text: '' },
};

/**
 * A Linear-style label pill: tinted background + colored dot + text.
 * Deterministic color per label string.
 */
export function LabelChip({
  label,
  size = 'sm',
  className,
  children,
}: {
  label: string;
  size?: Size;
  className?: string;
  /** Optional extra (e.g. an X button) appended inside the pill. */
  children?: React.ReactNode;
}) {
  const c = labelColor(label);
  const sz = SIZE_CLASSES[size];
  return (
    <span
      className={cn('inline-flex items-center rounded-full font-medium', sz.pill, className)}
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      <span className={cn('rounded-full shrink-0', sz.dot)} style={{ backgroundColor: c.dot }} />
      <span className="truncate">{label}</span>
      {children}
    </span>
  );
}

/** Just the dot — for use in pickers where the text sits beside it separately. */
export function LabelDot({
  label,
  className,
  size = 8,
}: {
  label: string;
  className?: string;
  size?: number;
}) {
  const c = labelColor(label);
  return (
    <span
      className={cn('rounded-full shrink-0 inline-block', className)}
      style={{ backgroundColor: c.dot, width: size, height: size }}
    />
  );
}
