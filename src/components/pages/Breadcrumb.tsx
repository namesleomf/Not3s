import { ChevronRight } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'

interface BreadcrumbProps {
  pageId: string
}

export function Breadcrumb({ pageId }: BreadcrumbProps) {
  const { pages, select } = usePages()

  // Build ancestor chain
  const ancestors: { id: string; title: string; icon: string | null }[] = []
  let current = pages[pageId]

  while (current?.parentId && pages[current.parentId]) {
    const parent = pages[current.parentId]
    ancestors.unshift({
      id: parent.id,
      title: parent.title || 'Untitled',
      icon: parent.icon,
    })
    current = parent
  }

  if (ancestors.length === 0) return null

  return (
    <nav className="flex items-center gap-0.5 min-w-0 overflow-hidden">
      {ancestors.map((ancestor, i) => (
        <span key={ancestor.id} className="flex items-center gap-0.5 min-w-0">
          {i > 0 && (
            <ChevronRight className="w-3 h-3 text-text-placeholder flex-shrink-0" />
          )}
          <button
            onClick={() => select(ancestor.id)}
            className="text-[12px] text-text-muted hover:text-text-primary truncate max-w-[120px] transition-theme"
          >
            {ancestor.icon && (
              <span className="mr-0.5">{ancestor.icon}</span>
            )}
            {ancestor.title}
          </button>
        </span>
      ))}
      <ChevronRight className="w-3 h-3 text-text-placeholder flex-shrink-0" />
    </nav>
  )
}
