import { useRef, useEffect } from 'react'
import { usePages } from '../../hooks/use-pages'
import { IconPicker } from './IconPicker'

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
      // Move focus to editor (Phase 6)
    }
  }

  return (
    <div className="group px-12 pt-10 pb-2 max-w-[720px] mx-auto w-full">
      {/* Page icon */}
      <div className="mb-3">
        <IconPicker
          currentIcon={selectedPage.icon}
          onSelect={(icon) => update(selectedPage.id, { icon })}
        />
      </div>

      {/* Editable title */}
      <h1
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder="Untitled"
        className="
          text-[32px] font-bold leading-tight text-text-primary
          outline-none border-none
          empty:before:content-[attr(data-placeholder)]
          empty:before:text-text-placeholder
          caret-accent
        "
      />

      {/* Metadata row */}
      <div className="flex items-center gap-3 mt-3 text-[12px] text-text-muted">
        {selectedPage.tags.length > 0 && (
          <span>{selectedPage.tags.join(', ')}</span>
        )}
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
