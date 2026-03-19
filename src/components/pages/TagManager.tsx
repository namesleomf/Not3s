import { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { getAllTags } from '../../lib/page-utils'

export function TagManager() {
  const { selectedPage, update, pages } = usePages()
  const [isAdding, setIsAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus()
    }
  }, [isAdding])

  if (!selectedPage) return null

  const allTags = getAllTags(pages)
  const currentTags = selectedPage.tags

  const suggestions = inputValue.trim()
    ? allTags.filter(
        (t) => t.toLowerCase().includes(inputValue.toLowerCase()) && !currentTags.includes(t),
      )
    : allTags.filter((t) => !currentTags.includes(t))

  const addTag = (tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed || currentTags.includes(trimmed)) return
    update(selectedPage.id, { tags: [...currentTags, trimmed] })
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tag: string) => {
    update(selectedPage.id, { tags: currentTags.filter((t) => t !== tag) })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addTag(inputValue)
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setInputValue('')
      setShowSuggestions(false)
    }
    if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1])
    }
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Tag className="w-3 h-3 text-text-muted flex-shrink-0" />

      {/* Existing tags */}
      {currentTags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-1 sm:px-1.5 sm:py-0.5 text-[12px] sm:text-[11px] bg-bg-hover text-text-secondary rounded-[var(--radius-sm)] group/tag"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="opacity-0 group-hover/tag:opacity-100 transition-opacity hover:text-danger"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}

      {/* Add tag */}
      {isAdding ? (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onBlur={(e) => {
              // If focus moved to a suggestion button (within the same container), don't close
              const relatedTarget = e.relatedTarget as HTMLElement | null
              if (relatedTarget && e.currentTarget.parentElement?.contains(relatedTarget)) return
              setIsAdding(false)
              setInputValue('')
              setShowSuggestions(false)
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tag name..."
            className="w-24 sm:w-[80px] px-2 py-1.5 sm:py-0.5 text-[13px] sm:text-[11px] bg-transparent text-text-primary border border-separator rounded-[var(--radius-sm)] outline-none focus:border-accent"
          />

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 top-full z-30 mt-1 w-[140px] bg-bg-overlay border border-separator rounded-[var(--radius-md)] shadow-lg py-0.5 max-h-[120px] overflow-y-auto">
              {suggestions.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    addTag(tag)
                  }}
                  className="flex w-full px-2 py-1 text-[11px] text-text-secondary hover:bg-bg-hover hover:text-text-primary text-left transition-theme"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-0.5 px-2 py-1 sm:px-1 sm:py-0.5 text-[12px] sm:text-[11px] text-text-muted hover:text-text-secondary hover:bg-bg-hover rounded-[var(--radius-sm)] transition-theme"
        >
          <Plus className="w-2.5 h-2.5" />
          Add tag
        </button>
      )}
    </div>
  )
}
