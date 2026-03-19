import { useState, useRef, useEffect, type ReactNode, type ReactElement } from 'react'

interface DropdownProps {
  trigger: ReactElement
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'left', className = '' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-flex">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`
            absolute z-50 top-full mt-1
            min-w-[180px] py-1
            bg-bg-overlay border border-border
            rounded-[var(--radius-lg)]
            shadow-lg
            animate-[fadeIn_0.1s_ease,scaleIn_0.1s_ease]
            ${align === 'right' ? 'right-0' : 'left-0'}
            ${className}
          `}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
  icon?: ReactNode
  shortcut?: string
  disabled?: boolean
}

export function DropdownItem({
  children,
  onClick,
  danger = false,
  icon,
  shortcut,
  disabled = false,
}: DropdownItemProps) {
  return (
    <button
      className={`
        w-full flex items-center gap-2 px-3 h-8 text-[13px] text-left
        transition-theme rounded-[var(--radius-sm)] mx-1
        disabled:opacity-40 disabled:pointer-events-none
        ${danger
          ? 'text-danger hover:bg-danger-soft'
          : 'text-text-primary hover:bg-bg-hover'
        }
      `}
      style={{ width: 'calc(100% - 8px)' }}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="text-text-muted [&_svg]:w-4 [&_svg]:h-4">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="text-[11px] text-text-muted font-mono">{shortcut}</span>
      )}
    </button>
  )
}
