import { FileText, Star, Pin, Archive, Trash2 } from 'lucide-react'
import { useSearch } from '../../hooks/use-search'
import type { SidebarFilter } from '../../types'

const filters: { id: SidebarFilter; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Pages', icon: <FileText /> },
  { id: 'favorites', label: 'Favorites', icon: <Star /> },
  { id: 'pinned', label: 'Pinned', icon: <Pin /> },
  { id: 'archived', label: 'Archived', icon: <Archive /> },
  { id: 'trash', label: 'Trash', icon: <Trash2 /> },
]

export function FilterNav() {
  const { activeFilter, setFilter } = useSearch()

  return (
    <nav className="px-2 py-1 flex flex-col gap-0.5">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`
            flex items-center gap-2.5 h-8 px-2.5 w-full
            text-[13px] font-medium
            rounded-[var(--radius-md)] transition-theme text-left
            ${activeFilter === f.id
              ? 'bg-bg-selected text-text-primary'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }
          `}
        >
          <span className="[&_svg]:w-4 [&_svg]:h-4 [&_svg]:stroke-[1.75] flex-shrink-0 text-text-muted">
            {f.icon}
          </span>
          <span className="truncate">{f.label}</span>
        </button>
      ))}
    </nav>
  )
}
