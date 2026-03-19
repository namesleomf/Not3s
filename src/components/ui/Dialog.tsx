import { useEffect, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className = '' }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease]" />

      {/* Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative z-10
          bg-bg-overlay border border-border
          rounded-[var(--radius-xl)]
          shadow-lg
          animate-[scaleIn_0.15s_ease]
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  )
}
