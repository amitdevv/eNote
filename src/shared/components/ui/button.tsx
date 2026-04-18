import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

// Linear-aligned button styles. Key principles:
//   • `chip` / `ghost` / `outline` are all flat — no borders, no shadows.
//   • Visual weight comes from background fill, not stroke.
//   • `default` is the one heavy CTA (solid dark). Use it sparingly.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong/20 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-panel disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // The primary CTA — brand green. Reserve for one action per surface.
        default: 'bg-brand text-brand-fg hover:brightness-[1.08] active:brightness-95 shadow-xs',
        // Softer filled — use for secondary actions.
        secondary: 'bg-surface-muted text-ink-strong hover:bg-surface-active',
        // Fully transparent until hover. Default for icon buttons, nav items.
        ghost: 'bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
        // Flat "outline" — no border, subtle fill. Linear-style.
        outline: 'bg-surface-muted/50 text-ink-default hover:bg-surface-muted',
        // For property-style rows: icon + label, flat, no container.
        chip: 'bg-transparent text-ink-default hover:bg-surface-muted px-2 -mx-1 rounded-md',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'bg-transparent text-brand underline-offset-4 hover:underline',
        // Deprecated: same as default now. Keeping the name so existing call sites compile.
        brand: 'bg-brand text-brand-fg hover:brightness-[1.08] active:brightness-95 shadow-xs',
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
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
