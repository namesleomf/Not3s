import { Archive, RotateCcw } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { usePages } from '../../hooks/use-pages'
import { useSearch } from '../../hooks/use-search'

export function ArchiveView() {
  const { toggleArchive, select } = usePages()
  const { filteredPages } = useSearch()

  const archivedPages = filteredPages.filter((p) => p.isArchived && !p.isTrashed)

  if (archivedPages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<Archive />}
          title="No archived pages"
          description="Pages you archive will appear here. Archive pages to keep them out of your workspace without deleting them."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-[18px] font-semibold text-text-primary">Archive</h2>
          <p className="text-[12px] text-text-muted mt-0.5">
            {archivedPages.length} archived page{archivedPages.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {archivedPages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-bg-hover transition-theme group cursor-pointer"
              onClick={() => {
                select(page.id)
              }}
            >
              <span className="text-[14px] flex-shrink-0">
                {page.icon || <Archive className="w-4 h-4 text-text-muted" />}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-text-primary truncate block">
                  {page.title || 'Untitled'}
                </span>
                <span className="text-[11px] text-text-muted">
                  Archived {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleArchive(page.id)
                  }}
                  title="Unarchive"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
