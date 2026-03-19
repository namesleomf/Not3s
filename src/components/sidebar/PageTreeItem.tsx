import { ChevronRight, FileText, Star, Pin, Plus } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { useWorkspace } from '../../context/workspace-context'

interface PageTreeItemProps {
  pageId: string
  depth: number
}

export function PageTreeItem({ pageId, depth }: PageTreeItemProps) {
  const { pages, selectedPageId, select, create } = usePages()
  const { state, dispatch } = useWorkspace()
  const page = pages[pageId]

  if (!page || page.isTrashed) return null

  const isSelected = selectedPageId === pageId
  const isExpanded = state.ui.expandedPageIds.includes(pageId)
  const hasChildren = page.childrenIds.length > 0

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch({ type: 'UI_TOGGLE_PAGE_EXPANDED', payload: { id: pageId } })
  }

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation()
    create({ parentId: pageId })
    // Auto-expand parent to show the new child
    if (!isExpanded) {
      dispatch({ type: 'UI_TOGGLE_PAGE_EXPANDED', payload: { id: pageId } })
    }
  }

  return (
    <div>
      <button
        onClick={() => select(pageId)}
        className={`
          group flex items-center gap-1 w-full h-8 pr-2 text-left
          text-[13px] rounded-[var(--radius-md)] transition-theme
          ${isSelected
            ? 'bg-bg-selected text-text-primary font-medium'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
          }
        `}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
      >
        {/* Expand/collapse arrow */}
        <span
          onClick={hasChildren ? handleToggleExpand : undefined}
          className={`
            flex items-center justify-center w-4 h-4 flex-shrink-0
            ${hasChildren ? 'cursor-pointer text-text-muted hover:text-text-secondary' : 'invisible'}
          `}
        >
          <ChevronRight
            className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </span>

        {/* Icon */}
        <span className="flex-shrink-0 text-text-muted">
          {page.icon ? (
            <span className="text-[14px] leading-none">{page.icon}</span>
          ) : (
            <FileText className="w-4 h-4 stroke-[1.5]" />
          )}
        </span>

        {/* Title */}
        <span className="flex-1 truncate ml-1">
          {page.title || 'Untitled'}
        </span>

        {/* Action buttons — visible on hover */}
        <span className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            onClick={handleCreateChild}
            className="flex items-center justify-center w-4 h-4 rounded-[var(--radius-sm)] hover:bg-bg-active text-text-muted hover:text-text-primary cursor-pointer"
            title="Add sub-page"
          >
            <Plus className="w-3 h-3" />
          </span>
          {page.isPinned && <Pin className="w-3 h-3 text-text-muted" />}
          {page.isFavorite && <Star className="w-3 h-3 text-warning fill-warning" />}
        </span>
      </button>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {page.childrenIds.map((childId) => (
            <PageTreeItem key={childId} pageId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
