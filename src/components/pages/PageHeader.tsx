import { useRef, useEffect } from 'react'
import { Smile } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { IconPicker } from './IconPicker'
import { TagManager } from './TagManager'

export function PageHeader() {
  const { selectedPage, rename, update } = usePages()
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Sync title content when page changes
  useEffect(() => {
    if (titleRef.current && selectedPage) {
      if (titleRef.current.textContent !== selectedPage.title) {
        titleRef.current.textContent = selectedPage.title || ''
      }
    }
  }, [selectedPage?.id]) // Only re-sync when page changes, not on every title update

  if (!selectedPage) return null

  const handleInput = () => {
    if (titleRef.current && selectedPage) {
      rename(selectedPage.id, titleRef.current.textContent || '')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  return (
    <div className="px-4 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-3 max-w-[720px] mx-auto w-full">
      {/* Chip controls row — visible on hover or when no icon set */}
      <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
        style={{ opacity: !selectedPage.icon ? 1 : undefined }}
      >
        <IconPicker
          currentIcon={selectedPage.icon}
          onSelect={(icon) => update(selectedPage.id, { icon })}
        />
        {!selectedPage.icon && (
          <button
            onClick={() => update(selectedPage.id, { icon: '📄' })}
            className="
              inline-flex items-center gap-2 h-7 px-3
              text-[12px] text-text-muted font-medium
              bg-bg-inset border-none
              rounded-[var(--radius-md)]
              hover:bg-bg-hover hover:text-text-secondary
              shadow-sm hover:shadow-md
              transition-theme
            "
          >
            <Smile className="w-3.5 h-3.5" />
            Add page icon
          </button>
        )}
      </div>

      {/* Page icon — shown when set */}
      {selectedPage.icon && (
        <div className="mb-3">
          <IconPicker
            currentIcon={selectedPage.icon}
            onSelect={(icon) => update(selectedPage.id, { icon })}
          />
        </div>
      )}

      {/* Editable title */}
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Untitled"
        className="
          text-[26px] sm:text-[30px] md:text-[34px] font-bold leading-tight text-text-primary
          outline-none border-none tracking-tight
          empty:before:content-[attr(data-placeholder)]
          empty:before:text-text-placeholder
          caret-accent
        "
      />

      {/* Tags */}
      <div className="mt-4">
        <TagManager />
      </div>

      {/* Date metadata */}
      <div className="flex items-center gap-3 mt-2 text-[12px] text-text-muted">
        {selectedPage.createdAt && (
          <span>
            {new Date(selectedPage.updatedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  )
}
