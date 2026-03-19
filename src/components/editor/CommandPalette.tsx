import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Search } from 'lucide-react'
import { useWorkspace } from '../../context/workspace-context'
import { useCommands } from '../../hooks/use-commands'
import { filterCommands, groupCommands } from '../../lib/command-registry'
import type { Command } from '../../lib/command-registry'

export function CommandPalette() {
  const { state, dispatch } = useWorkspace()
  const commands = useCommands()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [selectedIdx, setSelectedIdx] = useState(0)

  const isOpen = state.ui.commandMenuOpen

  // Filter and group
  const filtered = useMemo(() => filterCommands(commands, query), [commands, query])
  const grouped = useMemo(() => groupCommands(filtered, !!query.trim()), [filtered, query])

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => grouped.flatMap((g) => g.items), [grouped])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIdx(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // Reset selection on query change
  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

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

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIdx])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[selectedIdx]) {
      e.preventDefault()
      flatItems[selectedIdx].run()
    }
  }, [flatItems, selectedIdx])

  if (!isOpen) return null

  // Track flat index across groups for rendering
  let flatIdx = 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] sm:pt-[12vh]"
      onClick={() => dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[560px] mx-4 bg-bg-overlay backdrop-blur-xl border border-border/40 rounded-[var(--radius-xl)] shadow-float overflow-hidden animate-[scaleIn_0.15s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Search className="w-[18px] h-[18px] text-text-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-placeholder outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 text-[10px] font-medium text-text-muted bg-bg-inset rounded-[var(--radius-sm)]">
            ESC
          </kbd>
        </div>

        {/* Separator */}
        <div className="h-px bg-separator/60" />

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] sm:max-h-[380px] overflow-y-auto py-1">
          {flatItems.length === 0 ? (
            <div className="px-5 py-10 text-center text-[13px] text-text-muted">
              No matching commands
            </div>
          ) : (
            grouped.map((group) => (
              <div key={group.group}>
                {/* Group label */}
                <div className="px-4 pt-2.5 pb-1">
                  <span className="text-[11px] font-semibold text-text-muted/70 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>

                {/* Items */}
                {group.items.map((cmd) => {
                  const idx = flatIdx++
                  const isSelected = idx === selectedIdx
                  return (
                    <CommandItem
                      key={cmd.id}
                      command={cmd}
                      isSelected={isSelected}
                      onSelect={() => cmd.run()}
                      onHover={() => setSelectedIdx(idx)}
                    />
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="h-px bg-separator/60" />
        <div className="flex items-center gap-4 px-5 py-2 text-[11px] text-text-muted/70">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center w-4 h-4 text-[9px] bg-bg-inset rounded-[3px]">↑</kbd>
            <kbd className="inline-flex items-center justify-center w-4 h-4 text-[9px] bg-bg-inset rounded-[3px]">↓</kbd>
            <span className="ml-0.5">Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1 text-[9px] bg-bg-inset rounded-[3px]">↵</kbd>
            <span className="ml-0.5">Run</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex items-center justify-center h-4 px-1 text-[9px] bg-bg-inset rounded-[3px]">Esc</kbd>
            <span className="ml-0.5">Close</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function CommandItem({
  command,
  isSelected,
  onSelect,
  onHover,
}: {
  command: Command
  isSelected: boolean
  onSelect: () => void
  onHover: () => void
}) {
  return (
    <button
      data-selected={isSelected}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={`
        flex items-center gap-3 w-[calc(100%-8px)] mx-1 px-3 py-2 text-left
        rounded-[var(--radius-md)] transition-colors duration-75
        ${isSelected ? 'bg-bg-hover' : 'hover:bg-bg-hover/50'}
      `}
    >
      {/* Icon */}
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-text-muted">
        {command.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <span className="text-[13px] text-text-primary truncate block leading-snug">
          {command.title}
        </span>
        {command.subtitle && (
          <span className="text-[11px] text-text-muted truncate block leading-snug">
            {command.subtitle}
          </span>
        )}
      </div>

      {/* Shortcut */}
      {command.shortcut && (
        <kbd className="flex-shrink-0 text-[10px] font-medium text-text-muted/70 bg-bg-inset rounded-[3px] px-1.5 py-0.5">
          {command.shortcut}
        </kbd>
      )}
    </button>
  )
}
