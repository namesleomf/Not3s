import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, FileText, Star, Pin, Archive } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { useWorkspace } from '../../context/workspace-context'
import type { Page } from '../../types'

export function CommandPalette() {
  const { state, dispatch } = useWorkspace()
  const { pages, select } = usePages()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const isOpen = state.ui.commandMenuOpen

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, dispatch])

  // Filter pages
  const results = useMemo(() => {
    const allPages = Object.values(pages).filter((p) => !p.isTrashed)
    if (!query.trim()) {
      // Show recent pages sorted by updatedAt
      return allPages.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 10)
    }
    const q = query.toLowerCase()
    return allPages
      .filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 15)
  }, [pages, query])

  const handleSelect = (page: Page) => {
    select(page.id)
    dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })
  }

  // Keyboard navigation
  const [selectedIdx, setSelectedIdx] = useState(0)

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault()
      handleSelect(results[selectedIdx])
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] sm:pt-[15vh]"
      onClick={() => dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[520px] mx-4 bg-bg-overlay border border-separator rounded-[var(--radius-xl)] shadow-2xl overflow-hidden animate-[scaleIn_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-separator">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages..."
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-placeholder outline-none"
          />
        </div>

        {/* Results */}
        <div className="max-h-[60vh] sm:max-h-[320px] overflow-y-auto py-1">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px] text-text-muted">
              No pages found
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5">
                <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                  {query.trim() ? 'Results' : 'Recent pages'}
                </span>
              </div>
              {results.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => handleSelect(page)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`
                    flex items-center gap-3 w-full px-4 py-2 text-left transition-theme
                    ${idx === selectedIdx ? 'bg-bg-hover' : ''}
                  `}
                >
                  <span className="flex-shrink-0 text-[16px]">
                    {page.icon || <FileText className="w-4 h-4 text-text-muted" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] text-text-primary truncate block">
                      {page.title || 'Untitled'}
                    </span>
                    {page.tags.length > 0 && (
                      <span className="text-[11px] text-text-muted truncate block">
                        {page.tags.join(', ')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {page.isFavorite && <Star className="w-3 h-3 text-warning" />}
                    {page.isPinned && <Pin className="w-3 h-3 text-accent" />}
                    {page.isArchived && <Archive className="w-3 h-3 text-text-muted" />}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-separator text-[11px] text-text-muted">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
