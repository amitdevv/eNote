import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-ink-strong text-surface-raised hover:bg-ink-default',
        secondary: 'bg-surface-muted text-ink-strong hover:bg-surface-active',
        ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
        outline:
          'bg-surface-raised text-ink-default border border-line-default hover:bg-surface-muted shadow-xs',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'bg-transparent text-brand underline-offset-4 hover:underline',
        brand: 'bg-brand text-brand-fg hover:brightness-110 shadow-xs',
      },
      size: {
        sm: 'h-7 px-2.5 text-[12px] rounded-md',
        md: 'h-8 px-3 text-[13px] rounded-lg',
        lg: 'h-10 px-4 text-sm rounded-lg',
        icon: 'h-7 w-7 rounded-full p-0',
        'icon-sq': 'h-8 w-8 rounded-lg p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
