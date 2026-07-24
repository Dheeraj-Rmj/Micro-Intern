'use client';

import { cn } from '@/lib/utils';

/**
 * Badge component — status indicators and labels.
 */
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[oklch(0.55_0.24_264_/_0.1)] text-[oklch(0.55_0.24_264)] border-[oklch(0.55_0.24_264_/_0.2)]',
  success: 'bg-[oklch(0.527_0.154_162_/_0.1)] text-[oklch(0.396_0.127_162)] border-[oklch(0.527_0.154_162_/_0.2)]',
  warning: 'bg-[oklch(0.769_0.188_70_/_0.1)] text-[oklch(0.555_0.163_48)] border-[oklch(0.769_0.188_70_/_0.2)]',
  error: 'bg-[oklch(0.637_0.237_25_/_0.1)] text-[oklch(0.505_0.213_27)] border-[oklch(0.637_0.237_25_/_0.2)]',
  info: 'bg-[oklch(0.60_0.15_230_/_0.1)] text-[oklch(0.42_0.15_230)] border-[oklch(0.60_0.15_230_/_0.2)]',
  outline: 'bg-transparent text-[--color-muted-foreground] border-[--color-border]',
};

export type BadgeProps = {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
};

export function Badge({ variant = 'default', className, children, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5',
        'text-xs font-medium',
        badgeVariantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-[oklch(0.55_0.24_264)]': variant === 'default',
            'bg-[oklch(0.527_0.154_162)]': variant === 'success',
            'bg-[oklch(0.769_0.188_70)]': variant === 'warning',
            'bg-[oklch(0.637_0.237_25)]': variant === 'error',
            'bg-[oklch(0.60_0.15_230)]': variant === 'info',
            'bg-[--color-muted-foreground]': variant === 'outline',
          })}
        />
      )}
      {children}
    </span>
  );
}

/**
 * Map application status strings to badge variants.
 */
export function statusToBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    ACTIVE: 'success',
    PUBLISHED: 'success',
    PASSED: 'success',
    COMPLETED: 'success',
    INVITED: 'info',
    IN_PROGRESS: 'info',
    PENDING: 'warning',
    PENDING_VERIFICATION: 'warning',
    UNDER_REVIEW: 'warning',
    FAILED: 'error',
    SUSPENDED: 'error',
    REJECTED: 'error',
    ARCHIVED: 'outline',
    DRAFT: 'outline',
    CLOSED: 'outline',
  };
  return statusMap[status] ?? 'default';
}
