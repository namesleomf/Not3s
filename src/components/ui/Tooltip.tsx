import { useState, useRef, type ReactElement } from 'react'

interface TooltipProps {
  content: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactElement
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export function Tooltip({ content, side = 'top', children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = () => {
    timeout.current = setTimeout(() => setVisible(true), 400)
  }

  const hide = () => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(false)
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={`
            absolute z-50 pointer-events-none
            px-2 py-1 text-[11px] font-medium leading-tight
            text-text-inverse bg-text-primary
            rounded-[var(--radius-sm)]
            shadow-md whitespace-nowrap
            animate-[fadeIn_0.1s_ease]
            ${positionClasses[side]}
          `}
        >
          {content}
        </div>
      )}
    </div>
  )
}
