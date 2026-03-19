import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import type { Page } from '../../types'

interface PageLinkPickerProps {
  position: { top: number; left: number }
  initialQuery: string
  onSelect: (page: Page) => void
  onClose: () => void
}

export function PageLinkPicker({ position, initialQuery, onSelect, onClose }: PageLinkPickerProps) {
  const { pages } = usePages()
  const [query, setQuery] = useState(initialQuery)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const allPages = Object.values(pages).filter((p) => !p.isTrashed && !p.isArchived)
    if (!query.trim()) {
      return allPages.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8)
    }
    const q = query.toLowerCase()
    return allPages
      .filter((p) => p.title.toLowerCase().includes(q))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 8)
  }, [pages, query])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault()
      onSelect(results[selectedIdx])
    }
  }

  return (
    <div
      className="fixed z-50 w-[280px] bg-bg-overlay border border-border rounded-[var(--radius-xl)] shadow-float overflow-hidden animate-[fadeIn_0.1s_ease]"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-separator">
        <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search pages…"
          className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-placeholder outline-none"
        />
      </div>
      <div className="max-h-[240px] overflow-y-auto py-1">
        {results.length === 0 ? (
          <div className="px-3 py-4 text-center text-[12px] text-text-muted">
            No pages found
          </div>
        ) : (
          results.map((page, idx) => (
            <button
              key={page.id}
              onClick={() => onSelect(page)}
              onMouseEnter={() => setSelectedIdx(idx)}
              className={`
                flex items-center gap-2.5 w-full px-3 py-2 text-left transition-theme
                ${idx === selectedIdx ? 'bg-bg-hover' : ''}
              `}
            >
              <span className="flex-shrink-0 text-[14px]">
                {page.icon || <FileText className="w-3.5 h-3.5 text-text-muted" />}
              </span>
              <span className="text-[13px] text-text-primary truncate">
                {page.title || 'Untitled'}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
