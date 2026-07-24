import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button component — the most-used UI primitive.
 *
 * Variants: default, secondary, outline, ghost, destructive, link
 * Sizes: sm, md (default), lg, icon
 *
 * Design: Uses CVA for type-safe variant composition.
 * All hover/focus states use Tailwind utility classes.
 */

const buttonVariants = cva(
  // Base styles — applied to every button
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg',
    'text-sm font-semibold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none',
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'gradient-brand text-white shadow-[--shadow-sm]',
          'hover:opacity-90 hover:shadow-[--shadow-glow]',
          'active:scale-[0.98]',
        ].join(' '),
        secondary: [
          'bg-[--color-muted] text-[--color-foreground-default]',
          'hover:bg-[--color-border]',
        ].join(' '),
        outline: [
          'border border-[--color-border] bg-transparent text-[--color-foreground-default]',
          'hover:bg-[--color-muted]',
        ].join(' '),
        ghost: [
          'text-[--color-foreground-default]',
          'hover:bg-[--color-muted]',
        ].join(' '),
        destructive: [
          'bg-[--color-error-500] text-white shadow-[--shadow-sm]',
          'hover:bg-[--color-error-700]',
        ].join(' '),
        link: [
          'text-[oklch(0.55_0.24_264)] underline-offset-4',
          'hover:underline',
          'h-auto p-0',
        ].join(' '),
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4',
        lg: 'h-12 px-8 text-base rounded-xl',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export { buttonVariants };
