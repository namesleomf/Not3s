import { useEffect, useRef, type ReactNode } from 'react'

interface MobileSidebarDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function MobileSidebarDrawer({ open, onClose, children }: MobileSidebarDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="relative z-10 h-full w-[280px] max-w-[85vw] animate-[slideInFromLeft_0.2s_ease-out]"
      >
        {children}
      </div>
    </div>
  )
}
