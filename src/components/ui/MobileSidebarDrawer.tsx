import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react'

interface MobileSidebarDrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function MobileSidebarDrawer({ open, onClose, children }: MobileSidebarDrawerProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(0)
  const touchStart = useRef<{ x: number; t: number } | null>(null)

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

  // Reset translate when opened
  useEffect(() => {
    if (open) setTranslateX(0)
  }, [open])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, t: Date.now() }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return
    const dx = e.touches[0].clientX - touchStart.current.x
    // Only track leftward swipes
    if (dx < 0) {
      setTranslateX(dx)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current) return
    const elapsed = Date.now() - touchStart.current.t
    // Close if swiped far enough or fast enough
    if (translateX < -80 || (translateX < -30 && elapsed < 200)) {
      onClose()
    }
    setTranslateX(0)
    touchStart.current = null
  }, [translateX, onClose])

  if (!open) return null

  const drawerStyle: React.CSSProperties = translateX < 0
    ? { transform: `translateX(${translateX}px)`, transition: 'none' }
    : {}

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
        ref={drawerRef}
        className="relative z-10 h-full w-[75vw] max-w-[300px] animate-[slideInFromLeft_0.2s_ease-out]"
        style={drawerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
