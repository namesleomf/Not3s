import { Trash2, RotateCcw, X } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { usePages } from '../../hooks/use-pages'
import { useSearch } from '../../hooks/use-search'
import { useSettings } from '../../hooks/use-settings'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { useState } from 'react'

export function TrashView() {
  const { pages, restore, permanentDelete } = usePages()
  const { filteredPages } = useSearch()
  const { settings } = useSettings()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const trashedPages = filteredPages.filter((p) => p.isTrashed)

  const handleDelete = (id: string) => {
    if (settings.confirmBeforeDelete) {
      setConfirmDeleteId(id)
    } else {
      permanentDelete(id)
    }
  }

  const handleEmptyTrash = () => {
    const allTrashed = Object.values(pages).filter((p) => p.isTrashed)
    allTrashed.forEach((p) => permanentDelete(p.id))
  }

  if (trashedPages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          icon={<Trash2 />}
          title="Trash is empty"
          description="Pages you delete will appear here. You can restore or permanently delete them."
        />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[640px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Trash</h2>
            <p className="text-[12px] text-text-muted mt-0.5">
              {trashedPages.length} page{trashedPages.length !== 1 ? 's' : ''} in trash
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleEmptyTrash}>
            Empty trash
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {trashedPages.map((page) => (
            <div
              key={page.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-bg-hover transition-theme group"
            >
              <span className="text-[14px] flex-shrink-0">
                {page.icon || <Trash2 className="w-4 h-4 text-text-muted" />}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[13px] text-text-primary truncate block">
                  {page.title || 'Untitled'}
                </span>
                {page.trashedAt && (
                  <span className="text-[11px] text-text-muted">
                    Deleted {new Date(page.trashedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => restore(page.id)}
                  title="Restore"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(page.id)}
                  title="Delete permanently"
                >
                  <X className="w-3.5 h-3.5 text-danger" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmDeleteId && (
        <ConfirmDialog
          open
          title="Delete permanently?"
          description="This page will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => {
            permanentDelete(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          onClose={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}
