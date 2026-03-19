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
    <nav className="px-3 py-1 flex flex-col gap-0.5">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => setFilter(f.id)}
          className={`
            flex items-center gap-3 h-9 px-3 w-full
            text-[13px] font-medium
            rounded-[var(--radius-sm)] transition-all duration-200 text-left active:scale-[0.98]
            ${activeFilter === f.id
              ? 'bg-bg-selected text-text-primary'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
            }
          `}
        >
          <span className="[&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-[1.5] flex-shrink-0 text-text-muted">
            {f.icon}
          </span>
          <span className="truncate">{f.label}</span>
        </button>
      ))}
    </nav>
  )
}
