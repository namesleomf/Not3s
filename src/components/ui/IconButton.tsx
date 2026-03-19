import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize
  active?: boolean
  children: ReactNode
  label: string
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-6 h-6 [&_svg]:w-3.5 [&_svg]:h-3.5',
  md: 'w-7 h-7 [&_svg]:w-4 [&_svg]:h-4',
  lg: 'w-8 h-8 [&_svg]:w-[18px] [&_svg]:h-[18px]',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', active = false, className = '', children, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={`
          inline-flex items-center justify-center
          rounded-[var(--radius-md)] transition-theme
          select-none cursor-pointer
          disabled:opacity-40 disabled:pointer-events-none
          ${active
            ? 'bg-bg-selected text-accent'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-hover active:bg-bg-active'
          }
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

IconButton.displayName = 'IconButton'
