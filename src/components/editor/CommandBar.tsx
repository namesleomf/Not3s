import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Code,
} from 'lucide-react'
import { Separator } from '../ui/Separator'

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  action: () => void
  active?: boolean
}

export function CommandBar() {
  const noop = () => {}

  const blockTypes: ToolbarAction[] = [
    { icon: <Type className="w-4 h-4" strokeWidth={1.5} />, label: 'Paragraph', action: noop },
    { icon: <Heading1 className="w-4 h-4" strokeWidth={1.5} />, label: 'Heading 1', action: noop },
    { icon: <Heading2 className="w-4 h-4" strokeWidth={1.5} />, label: 'Heading 2', action: noop },
    { icon: <Heading3 className="w-4 h-4" strokeWidth={1.5} />, label: 'Heading 3', action: noop },
  ]

  const listTypes: ToolbarAction[] = [
    { icon: <List className="w-4 h-4" strokeWidth={1.5} />, label: 'Bullet list', action: noop },
    { icon: <ListOrdered className="w-4 h-4" strokeWidth={1.5} />, label: 'Numbered list', action: noop },
    { icon: <CheckSquare className="w-4 h-4" strokeWidth={1.5} />, label: 'To-do list', action: noop },
  ]

  const extras: ToolbarAction[] = [
    { icon: <Quote className="w-4 h-4" strokeWidth={1.5} />, label: 'Quote', action: noop },
    { icon: <Code className="w-4 h-4" strokeWidth={1.5} />, label: 'Code', action: noop },
    { icon: <Minus className="w-4 h-4" strokeWidth={1.5} />, label: 'Divider', action: noop },
  ]

  const renderGroup = (actions: ToolbarAction[]) =>
    actions.map((a) => (
      <button
        key={a.label}
        onClick={a.action}
        title={a.label}
        className={`
          inline-flex items-center justify-center w-8 h-8
          rounded-full transition-all duration-200 active:scale-95
          ${a.active
            ? 'bg-bg-active text-text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'}
        `}
      >
        {a.icon}
      </button>
    ))

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="pill-toolbar overflow-x-auto scrollbar-none" onMouseDown={(e) => e.preventDefault()}>
        {renderGroup(blockTypes)}
        <Separator orientation="vertical" className="mx-1 h-4" />
        {renderGroup(listTypes)}
        <Separator orientation="vertical" className="mx-1 h-4" />
        {renderGroup(extras)}
      </div>
    </div>
  )
}
