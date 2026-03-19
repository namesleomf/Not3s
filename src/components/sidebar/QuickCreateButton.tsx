import { Plus } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'

export function QuickCreateButton() {
  const { create } = usePages()

  return (
    <button
      onClick={() => create()}
      className="
        w-full flex items-center gap-2.5 h-9 px-3
        text-[13px] font-medium text-text-secondary
        rounded-[var(--radius-lg)] transition-theme
        hover:bg-bg-hover hover:text-text-primary
        active:bg-bg-active
      "
    >
      <Plus className="w-4 h-4" />
      <span>New page</span>
    </button>
  )
}
