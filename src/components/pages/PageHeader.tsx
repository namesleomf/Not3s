import { useRef, useEffect, useState } from 'react'
import { Smile, ImageIcon, X } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { IconPicker } from './IconPicker'
import { TagManager } from './TagManager'

const COVER_PRESETS = [
  { key: 'gradient-blue', label: 'Blue', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { key: 'gradient-sunset', label: 'Sunset', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { key: 'gradient-ocean', label: 'Ocean', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { key: 'gradient-forest', label: 'Forest', style: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { key: 'gradient-warm', label: 'Warm', style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { key: 'gradient-night', label: 'Night', style: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)' },
  { key: 'solid-stone', label: 'Stone', style: '#e7e5e4' },
  { key: 'solid-slate', label: 'Slate', style: '#cbd5e1' },
  { key: 'solid-amber', label: 'Amber', style: '#fde68a' },
  { key: 'solid-emerald', label: 'Emerald', style: '#a7f3d0' },
]

function getCoverStyle(coverImage: string): React.CSSProperties {
  const preset = COVER_PRESETS.find((p) => p.key === coverImage)
  if (preset) {
    return preset.style.startsWith('linear-gradient')
      ? { background: preset.style }
      : { backgroundColor: preset.style }
  }
  // URL fallback
  return { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

export function PageHeader() {
  const { selectedPage, rename, update } = usePages()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showCoverPicker, setShowCoverPicker] = useState(false)

  // Sync title content when page changes
  useEffect(() => {
    if (titleRef.current && selectedPage) {
      if (titleRef.current.textContent !== selectedPage.title) {
        titleRef.current.textContent = selectedPage.title || ''
      }
    }
  }, [selectedPage?.id]) // Only re-sync when page changes, not on every title update

  // Close cover picker when page changes
  useEffect(() => {
    setShowCoverPicker(false)
  }, [selectedPage?.id])

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

  const hasCover = !!selectedPage.coverImage

  return (
    <>
      {/* Page cover — full width */}
      {hasCover && (
        <div className="relative group/cover w-full h-[140px] sm:h-[180px] md:h-[220px]" style={getCoverStyle(selectedPage.coverImage!)}>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium text-white/90 bg-black/30 backdrop-blur-sm rounded-[var(--radius-md)] hover:bg-black/50 transition-theme"
            >
              Change cover
            </button>
            <button
              onClick={() => { update(selectedPage.id, { coverImage: null }); setShowCoverPicker(false) }}
              className="inline-flex items-center justify-center w-7 h-7 text-white/90 bg-black/30 backdrop-blur-sm rounded-[var(--radius-md)] hover:bg-black/50 transition-theme"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[720px] mx-auto w-full">
        {/* Cover picker dropdown */}
        {showCoverPicker && (
          <div className="px-4 sm:px-8 md:px-12">
            <div className="bg-bg-overlay border border-border rounded-[var(--radius-lg)] shadow-lg p-3 mt-2">
              <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">Cover presets</div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {COVER_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => { update(selectedPage.id, { coverImage: preset.key }); setShowCoverPicker(false) }}
                    className={`h-10 rounded-[var(--radius-md)] border-2 transition-theme cursor-pointer ${
                      selectedPage.coverImage === preset.key ? 'border-accent' : 'border-transparent hover:border-border'
                    }`}
                    style={getCoverStyle(preset.key)}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={`px-4 sm:px-8 md:px-12 ${hasCover ? 'pt-4' : 'pt-8 sm:pt-12'} pb-3`}>
        {/* Chip controls row — visible on hover or when no icon set */}
        <div className="flex items-center gap-2 mb-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
          style={{ opacity: (!selectedPage.icon || !hasCover) ? 1 : undefined }}
        >
          <IconPicker
            currentIcon={selectedPage.icon}
            onSelect={(icon) => update(selectedPage.id, { icon })}
          />
          {!selectedPage.icon && (
            <button
              onClick={() => update(selectedPage.id, { icon: '📄' })}
              className="
                inline-flex items-center gap-2 h-9 sm:h-7 px-3
                text-[13px] sm:text-[12px] text-text-muted font-medium
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
          {!hasCover && (
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="
                inline-flex items-center gap-2 h-9 sm:h-7 px-3
                text-[13px] sm:text-[12px] text-text-muted font-medium
                bg-bg-inset border-none
                rounded-[var(--radius-md)]
                hover:bg-bg-hover hover:text-text-secondary
                shadow-sm hover:shadow-md
                transition-theme
              "
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Add page cover
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
          text-[20px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-bold leading-tight text-text-primary
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
      </div>
    </>
  )
}
