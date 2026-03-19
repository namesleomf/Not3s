import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize
  active?: boolean
  children: ReactNode
  label: string
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-9 h-9 sm:w-7 sm:h-7 rounded-[var(--radius-sm)] [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 sm:w-8 sm:h-8 [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-11 h-11 sm:w-9 sm:h-9 [&_svg]:w-5 [&_svg]:h-5',
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
