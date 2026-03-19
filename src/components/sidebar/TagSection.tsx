import { useState } from 'react'
import { Tag, ChevronRight } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'
import { useSearch } from '../../hooks/use-search'
import { getAllTags } from '../../lib/page-utils'
import { Badge } from '../ui/Badge'

export function TagSection() {
  const [expanded, setExpanded] = useState(false)
  const { pages } = usePages()
  const { activeTag, setTag } = useSearch()
  const tags = getAllTags(pages)

  if (tags.length === 0) return null

  return (
    <div className="px-2 py-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full h-7 px-2.5 text-[11px] font-medium text-text-muted uppercase tracking-wider hover:text-text-secondary transition-theme"
      >
        <ChevronRight className={`w-3 h-3 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`} />
        <Tag className="w-3 h-3" />
        <span>Tags</span>
        <span className="ml-auto text-[10px] font-normal normal-case tracking-normal">{tags.length}</span>
      </button>
      {expanded && (
        <div className="flex flex-wrap gap-1 px-2.5 py-1.5">
          {tags.map((tag) => (
            <button key={tag} onClick={() => setTag(activeTag === tag ? null : tag)}>
              <Badge variant={activeTag === tag ? 'accent' : 'default'}>
                {tag}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
