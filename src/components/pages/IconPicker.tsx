import { useState, useEffect, useRef } from 'react'
import { Smile, X } from 'lucide-react'

interface IconPickerProps {
  currentIcon: string | null
  onSelect: (icon: string | null) => void
}

// Common emoji categories for page icons
const emojiSections: { label: string; emojis: string[] }[] = [
  {
    label: 'Smileys',
    emojis: ['😀', '😊', '🥰', '😎', '🤔', '😴', '🤯', '🥳', '😈', '👻', '🤖', '👽'],
  },
  {
    label: 'Objects',
    emojis: ['📝', '📄', '📋', '📌', '📎', '🔖', '📚', '💡', '🔑', '🔒', '🛠️', '⚙️'],
  },
  {
    label: 'Symbols',
    emojis: ['⭐', '🌟', '💫', '✨', '🔥', '❤️', '💎', '🎯', '🚀', '⚡', '🏆', '🎉'],
  },
  {
    label: 'Nature',
    emojis: ['🌱', '🌿', '🍀', '🌸', '🌻', '🌈', '🌙', '☀️', '🌊', '🏔️', '🌍', '🍃'],
  },
  {
    label: 'Work',
    emojis: ['💼', '📊', '📈', '💰', '🏢', '📱', '💻', '🖥️', '🗂️', '📁', '🗃️', '📂'],
  },
  {
    label: 'Food',
    emojis: ['☕', '🍕', '🍔', '🍎', '🍓', '🧁', '🍩', '🎂', '🍿', '🥤', '🍷', '🍣'],
  },
]

export function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setSearch('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  const handleSelect = (emoji: string) => {
    onSelect(emoji)
    setIsOpen(false)
  }

  const handleRemove = () => {
    onSelect(null)
    setIsOpen(false)
  }

  return (
    <div ref={pickerRef} className="relative">
      {/* Trigger */}
      {currentIcon ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-[40px] leading-none hover:bg-bg-hover rounded-[var(--radius-md)] p-1 -ml-1 transition-theme"
          title="Change icon"
        >
          {currentIcon}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1 -ml-2 text-[12px] text-text-muted hover:bg-bg-hover rounded-[var(--radius-md)] opacity-0 group-hover:opacity-100 transition-all"
          title="Add icon"
        >
          <Smile className="w-3.5 h-3.5" />
          <span>Add icon</span>
        </button>
      )}

      {/* Picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-40 mt-1 w-[280px] max-w-[calc(100vw-2rem)] bg-bg-overlay border border-separator rounded-[var(--radius-lg)] shadow-lg animate-[scaleIn_0.1s_ease] overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-separator">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter..."
              className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-placeholder outline-none"
            />
            {currentIcon && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-text-muted hover:text-danger hover:bg-bg-hover rounded transition-theme"
                title="Remove icon"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            )}
          </div>

          {/* Emoji grid */}
          <div className="max-h-[240px] overflow-y-auto p-2">
            {emojiSections.map((section) => {
              const filtered = search
                ? section.emojis.filter(() => {
                    // Simple: show all when searching (real impl would use emoji names)
                    return section.label.toLowerCase().includes(search.toLowerCase())
                  })
                : section.emojis
              if (filtered.length === 0) return null
              return (
                <div key={section.label} className="mb-2">
                  <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider px-1 mb-1">
                    {section.label}
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-0.5">
                    {filtered.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleSelect(emoji)}
                        className={`
                          flex items-center justify-center w-10 h-10 sm:w-8 sm:h-8 text-[18px] rounded-[var(--radius-sm)] hover:bg-bg-hover transition-theme
                          ${currentIcon === emoji ? 'bg-accent/20 ring-1 ring-accent' : ''}
                        `}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
