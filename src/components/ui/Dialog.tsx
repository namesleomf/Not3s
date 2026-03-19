import { useEffect, useRef, type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className = '' }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()

      // Focus trap: cycle Tab within dialog
      if (e.key === 'Tab' && contentRef.current) {
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handleKey)

    // Auto-focus first focusable element
    requestAnimationFrame(() => {
      if (contentRef.current) {
        const first = contentRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        first?.focus()
      }
    })

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
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative z-10
          bg-bg-overlay border border-border
          rounded-[var(--radius-xl)]
          shadow-lg
          animate-[scaleIn_0.15s_ease]
          max-w-[90vw]
          ${className}
        `}
      >
        {children}
      </div>
    </div>
  )
}
