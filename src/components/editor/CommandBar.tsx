import {
  Undo2,
  Redo2,
  Plus,
  Link,
  Tag,
  Paperclip,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  ChevronDown,
  Quote,
  Minus,
  AlertCircle,
  Code,
  Image,
} from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { Separator } from '../ui/Separator'
import { Tooltip } from '../ui/Tooltip'

interface CommandBarProps {
  className?: string
}

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  shortcut?: string
  action: () => void
  active?: boolean
}

export function CommandBar({ className = '' }: CommandBarProps) {
  // Phase 6 will wire these to the block editor
  const noop = () => {}

  const undoRedo: ToolbarAction[] = [
    { icon: <Undo2 />, label: 'Undo', shortcut: '⌘Z', action: noop },
    { icon: <Redo2 />, label: 'Redo', shortcut: '⇧⌘Z', action: noop },
  ]

  const insertActions: ToolbarAction[] = [
    { icon: <Plus />, label: 'Add block', action: noop },
    { icon: <Link />, label: 'Insert link', shortcut: '⌘K', action: noop },
    { icon: <Tag />, label: 'Add tag', action: noop },
    { icon: <Paperclip />, label: 'Attach file', action: noop },
  ]

  const blockTypes: ToolbarAction[] = [
    { icon: <Heading1 />, label: 'Heading 1', action: noop },
    { icon: <Heading2 />, label: 'Heading 2', action: noop },
    { icon: <List />, label: 'Bullet list', action: noop },
    { icon: <ListOrdered />, label: 'Numbered list', action: noop },
    { icon: <CheckSquare />, label: 'To-do list', action: noop },
    { icon: <ChevronDown />, label: 'Toggle', action: noop },
  ]

  const formatting: ToolbarAction[] = [
    { icon: <Bold />, label: 'Bold', shortcut: '⌘B', action: noop },
    { icon: <Italic />, label: 'Italic', shortcut: '⌘I', action: noop },
    { icon: <Code />, label: 'Inline code', shortcut: '⌘E', action: noop },
  ]

  const extras: ToolbarAction[] = [
    { icon: <Quote />, label: 'Quote', action: noop },
    { icon: <Minus />, label: 'Divider', action: noop },
    { icon: <AlertCircle />, label: 'Callout', action: noop },
    { icon: <Image />, label: 'Image', action: noop },
  ]

  const renderGroup = (actions: ToolbarAction[]) =>
    actions.map((a) => (
      <Tooltip key={a.label} content={a.shortcut ? `${a.label} (${a.shortcut})` : a.label} side="bottom">
        <IconButton
          size="sm"
          label={a.label}
          active={a.active}
          onClick={a.action}
        >
          {a.icon}
        </IconButton>
      </Tooltip>
    ))

  return (
    <div
      className={`
        flex items-center gap-0.5 px-2 h-10 flex-shrink-0
        bg-bg-page border-b border-separator
        overflow-x-auto scrollbar-none
        ${className}
      `}
    >
      {renderGroup(undoRedo)}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {renderGroup(insertActions)}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {renderGroup(blockTypes)}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {renderGroup(formatting)}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {renderGroup(extras)}
    </div>
  )
}
