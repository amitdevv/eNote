import { paletteByKey, type PaletteKey } from '../labelColor';
import { cn } from '@/shared/lib/cn';

type Size = 'xs' | 'sm' | 'md';

const SIZE_CLASSES: Record<Size, { pill: string; dot: string }> = {
  xs: { pill: 'h-5 gap-1 pl-1.5 pr-2 text-micro', dot: 'size-1.5' },
  sm: { pill: 'h-6 gap-1.5 pl-2 pr-2.5 text-micro', dot: 'size-2' },
  md: { pill: 'h-7 gap-2 pl-2.5 pr-3 text-caption', dot: 'size-2' },
};

export function LabelChip({
  label,
  color,
  size = 'sm',
  className,
  children,
}: {
  label: string;
  color: PaletteKey | string | null | undefined;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}) {
  const c = paletteByKey(color);
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

export function LabelDot({
  color,
  className,
  size = 8,
}: {
  color: PaletteKey | string | null | undefined;
  className?: string;
  size?: number;
}) {
  const c = paletteByKey(color);
  return (
    <span
      className={cn('rounded-full shrink-0 inline-block', className)}
      style={{ backgroundColor: c.dot, width: size, height: size }}
    />
  );
}
