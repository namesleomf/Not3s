import { Plus } from 'lucide-react'
import { usePages } from '../../hooks/use-pages'

export function QuickCreateButton() {
  const { create } = usePages()

  return (
    <button
      onClick={() => create()}
      className="
        w-full flex items-center justify-center gap-2 h-9 px-3
        text-[13px] font-medium text-text-inverse
        bg-text-primary rounded-[var(--radius-md)]
        transition-all duration-200
        hover:opacity-90 active:scale-95
      "
    >
      <Plus className="w-4 h-4" />
      <span>New page</span>
    </button>
  )
}
