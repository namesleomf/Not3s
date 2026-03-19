import { useState } from 'react'
import { ChevronDown, ChevronRight, ArrowUpLeft } from 'lucide-react'
import { useWorkspace } from '../../context/workspace-context'
import { usePages } from '../../hooks/use-pages'

export function BacklinksPanel() {
  const { state, dispatch } = useWorkspace()
  const { selectedPage } = usePages()
  const [isOpen, setIsOpen] = useState(true)

  if (!selectedPage) return null

  const backlinks = selectedPage.backlinks
    .map((id) => state.pages[id])
    .filter(Boolean)

  if (backlinks.length === 0) return null

  return (
    <div className="mt-8 pt-6 border-t border-border/40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-text-muted uppercase tracking-wider hover:text-text-secondary transition-theme mb-3"
      >
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
        <ArrowUpLeft className="w-3.5 h-3.5" />
        <span>{backlinks.length} Backlink{backlinks.length !== 1 ? 's' : ''}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1">
          {backlinks.map((page) => (
            <button
              key={page.id}
              onClick={() => dispatch({ type: 'UI_SELECT_PAGE', payload: { id: page.id } })}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-lg)] text-left hover:bg-bg-hover transition-theme group"
            >
              <span className="text-[14px] flex-shrink-0">
                {page.icon || '📄'}
              </span>
              <span className="text-[13px] text-text-secondary group-hover:text-text-primary truncate transition-theme">
                {page.title || 'Untitled'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
