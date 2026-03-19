import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type IconButtonSize = 'sm' | 'md' | 'lg'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize
  active?: boolean
  children: ReactNode
  label: string
}

const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'w-7 h-7 [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-8 h-8 [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-9 h-9 [&_svg]:w-5 [&_svg]:h-5',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = 'md', active = false, className = '', children, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={`
          inline-flex items-center justify-center
          rounded-full transition-all duration-200
          select-none cursor-pointer
          disabled:opacity-40 disabled:pointer-events-none
          ${active
            ? 'bg-bg-selected text-accent'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active active:scale-95'
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
