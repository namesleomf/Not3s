import { useState, useRef, useCallback } from 'react'
import { ChevronRight, FileText, Star, Pin, Plus, GripVertical } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { useWorkspace } from '../../context/workspace-context'

interface PageTreeItemProps {
  pageId: string
  depth: number
}

export function PageTreeItem({ pageId, depth }: PageTreeItemProps) {
  const { pages, selectedPageId, select, create, move } = usePages()
  const { state, dispatch } = useWorkspace()
  const page = pages[pageId]
  const [dragOver, setDragOver] = useState<'above' | 'on' | 'below' | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', pageId)
      e.dataTransfer.setData('application/x-page-id', pageId)
    },
    [pageId],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const sourceId = e.dataTransfer.types.includes('application/x-page-id')
        ? true
        : false
      if (!sourceId) return

      e.dataTransfer.dropEffect = 'move'
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const y = e.clientY - rect.top
      const third = rect.height / 3

      if (y < third) {
        setDragOver('above')
      } else if (y > third * 2) {
        setDragOver('below')
      } else {
        setDragOver('on') // Drop as child
      }
    },
    [],
  )

  const handleDragLeave = useCallback(() => {
    setDragOver(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const sourceId = e.dataTransfer.getData('application/x-page-id')
      if (!sourceId || sourceId === pageId) {
        setDragOver(null)
        return
      }

      // Prevent dropping a parent onto its own child
      if (isDescendant(sourceId, pageId, pages)) {
        setDragOver(null)
        return
      }

      if (dragOver === 'on') {
        // Make it a child of this page
        move(sourceId, pageId)
        // Auto-expand to show dropped page
        if (!state.ui.expandedPageIds.includes(pageId)) {
          dispatch({ type: 'UI_TOGGLE_PAGE_EXPANDED', payload: { id: pageId } })
        }
      } else if (dragOver === 'above' || dragOver === 'below') {
        // Move to same parent level as this page
        move(sourceId, page.parentId)
      }

      setDragOver(null)
    },
    [pageId, page?.parentId, dragOver, pages, move, state.ui.expandedPageIds, dispatch],
  )

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

  const dropIndicator =
    dragOver === 'above'
      ? 'border-t-2 border-t-accent'
      : dragOver === 'below'
        ? 'border-b-2 border-b-accent'
        : dragOver === 'on'
          ? 'ring-1 ring-accent ring-inset bg-accent/10'
          : ''

  return (
    <div>
      <div
        ref={rowRef}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={dropIndicator}
      >
        <button
          onClick={() => select(pageId)}
          className={`
            group flex items-center gap-1 w-full h-[38px] pr-2 text-left relative
            text-[13px] rounded-[var(--radius-lg)] transition-theme
            ${isSelected
              ? 'bg-bg-selected text-text-primary font-medium'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }
          `}
          style={{ paddingLeft: `${10 + depth * 16}px` }}
        >
          {/* Selected accent indicator */}
          {isSelected && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent rounded-full" />
          )}

          {/* Drag handle */}
          <span className="flex items-center justify-center w-3 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-text-muted">
            <GripVertical className="w-3 h-3" />
          </span>

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
          <span className="flex items-center gap-0.5 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <span
              onClick={handleCreateChild}
              className="flex items-center justify-center w-7 h-7 sm:w-4 sm:h-4 rounded-[var(--radius-sm)] hover:bg-bg-active text-text-muted hover:text-text-primary cursor-pointer"
              title="Add sub-page"
            >
              <Plus className="w-3 h-3" />
            </span>
            {page.isPinned && <Pin className="w-3 h-3 text-text-muted" />}
            {page.isFavorite && <Star className="w-3 h-3 text-warning fill-warning" />}
          </span>
        </button>
      </div>

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

/** Check if candidateChildId is a descendant of parentId */
function isDescendant(
  parentId: string,
  candidateChildId: string,
  pages: Record<string, { childrenIds: string[] }>,
): boolean {
  const page = pages[parentId]
  if (!page) return false
  if (page.childrenIds.includes(candidateChildId)) return true
  return page.childrenIds.some((cid) => isDescendant(cid, candidateChildId, pages))
}
