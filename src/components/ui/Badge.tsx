import type { ReactNode, HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'accent' | 'danger' | 'success'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-bg-hover text-text-secondary',
  accent: 'bg-accent-soft text-accent',
  danger: 'bg-danger-soft text-danger',
  success: 'bg-[rgba(22,163,74,0.08)] text-success',
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center h-6 px-2.5
        text-[12px] font-medium leading-none
        rounded-[var(--radius-pill)]
        select-none whitespace-nowrap
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  )
}
