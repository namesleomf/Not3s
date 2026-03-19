import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-text-inverse hover:bg-accent-hover active:opacity-90 shadow-sm',
  secondary:
    'bg-bg-page text-text-primary hover:bg-bg-hover border border-border',
  ghost:
    'bg-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary active:bg-bg-active',
  danger:
    'bg-danger-soft text-danger hover:bg-danger/15 active:bg-danger/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3.5 text-[13px] gap-1.5',
  md: 'h-9 px-5 text-[13px] gap-2',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium
          rounded-[var(--radius-pill)] transition-theme
          select-none cursor-pointer whitespace-nowrap
          disabled:opacity-40 disabled:pointer-events-none
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
