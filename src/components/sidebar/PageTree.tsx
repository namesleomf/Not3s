import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import { PageTreeItem } from './PageTreeItem'
import { usePages } from '../../hooks/use-pages'
import { useSearch } from '../../hooks/use-search'
import { getRootPageIds } from '../../lib/page-utils'

export function PageTree() {
  const { pages } = usePages()
  const { filteredPages, searchQuery } = useSearch()

  // When searching, show flat filtered results
  // When not searching, show tree structure
  const rootIds = useMemo(() => getRootPageIds(pages), [pages])

  if (searchQuery.trim()) {
    // Flat search results
    return (
      <div className="flex flex-col gap-0.5">
        {filteredPages.length === 0 ? (
          <div className="px-2.5 py-6 text-center">
            <p className="text-[12px] text-text-muted">No pages found</p>
          </div>
        ) : (
          filteredPages.map((page) => (
            <PageTreeItem key={page.id} pageId={page.id} depth={0} />
          ))
        )}
      </div>
    )
  }

  // Tree view — show root pages
  const activeRootIds = rootIds.filter((id) => {
    const p = pages[id]
    return p && !p.isTrashed && !p.isArchived
  })

  if (activeRootIds.length === 0) {
    return (
      <div className="px-2.5 py-8 text-center">
        <FileText className="w-8 h-8 text-text-muted mx-auto mb-2 stroke-[1.25]" />
        <p className="text-[12px] text-text-muted">No pages yet</p>
        <p className="text-[11px] text-text-placeholder mt-0.5">Create one to get started</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="px-2.5 py-1.5">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
          Pages
        </span>
      </div>
      {activeRootIds.map((id) => (
        <PageTreeItem key={id} pageId={id} depth={0} />
      ))}
    </div>
  )
}
