import { Plus } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'

export function QuickCreateButton() {
  const { create } = usePages()

  return (
    <button
      onClick={() => create()}
      className="
        w-full flex items-center gap-2.5 h-9 px-3
        text-[13px] font-medium text-accent
        rounded-[var(--radius-lg)] transition-theme
        bg-accent/[0.06] hover:bg-accent/[0.1]
        active:bg-accent/[0.14]
      "
    >
      <Plus className="w-4 h-4" />
      <span>New page</span>
    </button>
  )
}
