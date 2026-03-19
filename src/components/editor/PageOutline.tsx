import { X } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { usePages } from '../../hooks/use-pages'
import { useWorkspace } from '../../context/workspace-context'

interface HeadingEntry {
  id: string
  level: number
  text: string
}

function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

export function PageOutline() {
  const { state, dispatch } = useWorkspace()
  const { selectedPage } = usePages()

  if (!state.ui.outlineOpen || !selectedPage) return null

  const headings: HeadingEntry[] = selectedPage.blocks
    .filter((b) => b.type === 'heading1' || b.type === 'heading2' || b.type === 'heading3')
    .map((b) => ({
      id: b.id,
      level: b.type === 'heading1' ? 1 : b.type === 'heading2' ? 2 : 3,
      text: stripHtml(b.content) || 'Untitled',
    }))

  if (headings.length === 0) {
    return (
      <div className="w-56 flex-shrink-0 border-l border-border/40 bg-bg-page overflow-y-auto">
        <div className="flex items-center justify-between h-12 px-4">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Outline
          </span>
          <IconButton
            size="sm"
            label="Close outline"
            onClick={() => dispatch({ type: 'UI_SET', payload: { outlineOpen: false } })}
          >
            <X />
          </IconButton>
        </div>
        <p className="px-4 text-[12px] text-text-muted">No headings found.</p>
      </div>
    )
  }

  const scrollToBlock = (blockId: string) => {
    const el = document.querySelector(`[data-block-id="${blockId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="w-56 flex-shrink-0 border-l border-border/40 bg-bg-page overflow-y-auto">
      <div className="flex items-center justify-between h-12 px-4">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Outline
        </span>
        <IconButton
          size="sm"
          label="Close outline"
          onClick={() => dispatch({ type: 'UI_SET', payload: { outlineOpen: false } })}
        >
          <X />
        </IconButton>
      </div>
      <nav className="px-2 pb-4 flex flex-col gap-0.5">
        {headings.map((h) => (
          <button
            key={h.id}
            onClick={() => scrollToBlock(h.id)}
            className="text-left px-2 py-1 rounded-[var(--radius-md)] text-[12px] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-theme truncate"
            style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
            title={h.text}
          >
            {h.text}
          </button>
        ))}
      </nav>
    </div>
  )
}
