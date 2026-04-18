import * as React from 'react';
import { cn } from '@/shared/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'h-8 w-full rounded-md border border-line-default bg-surface-raised px-2.5 text-[13px] text-ink-strong placeholder:text-ink-placeholder',
        'transition-colors duration-150 ease-out',
        // Linear-style focus: quiet border darken, no glowing ring.
        'focus-visible:outline-none focus-visible:border-ink-default/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
