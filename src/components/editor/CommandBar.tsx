import {
  Undo2,
  Redo2,
  Plus,
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
  AlertCircle,
  Code,
} from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { Separator } from '../ui/Separator'
import { Tooltip } from '../ui/Tooltip'
import { useEditorContext } from '../../context/editor-context'
import type { BlockType } from '../../types'

interface ToolbarAction {
  icon: React.ReactNode
  label: string
  shortcut?: string
  action: () => void
  active?: boolean
  disabled?: boolean
}

export function CommandBar({ className = '' }: { className?: string }) {
  const editor = useEditorContext()

  if (!editor) return null

  const { focusedBlockId, blocks } = editor
  const focusedBlock = focusedBlockId ? blocks.find((b) => b.id === focusedBlockId) : null

  const addBlockAfterFocused = (type: BlockType) => {
    if (focusedBlockId) {
      editor.addBlock(type, focusedBlockId)
    } else {
      editor.addBlock(type)
    }
  }

  const transformOrAdd = (type: BlockType) => {
    if (focusedBlockId) {
      editor.transformBlock(focusedBlockId, type)
    } else {
      editor.addBlock(type)
    }
  }

  const execFormat = (command: string) => {
    document.execCommand(command, false)
  }

  const wrapInlineCode = () => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    let parent = range.commonAncestorContainer as HTMLElement
    if (parent.nodeType === Node.TEXT_NODE) {
      if (!parent.parentElement) return
      parent = parent.parentElement
    }
    if (parent.tagName === 'CODE') {
      const text = parent.textContent || ''
      const textNode = document.createTextNode(text)
      parent.replaceWith(textNode)
    } else {
      const code = document.createElement('code')
      code.className = 'bg-bg-code px-1 py-0.5 rounded text-[0.9em] font-mono'
      const fragment = range.extractContents()
      code.appendChild(fragment)
      range.insertNode(code)
    }
  }

  const undoRedo: ToolbarAction[] = [
    { icon: <Undo2 />, label: 'Undo', shortcut: '⌘Z', action: () => editor.undo(), disabled: !editor.canUndo },
    { icon: <Redo2 />, label: 'Redo', shortcut: '⇧⌘Z', action: () => editor.redo(), disabled: !editor.canRedo },
  ]

  const insertActions: ToolbarAction[] = [
    { icon: <Plus />, label: 'Add block', action: () => addBlockAfterFocused('paragraph') },
  ]

  const blockTypes: ToolbarAction[] = [
    { icon: <Heading1 />, label: 'Heading 1', action: () => transformOrAdd('heading1'), active: focusedBlock?.type === 'heading1' },
    { icon: <Heading2 />, label: 'Heading 2', action: () => transformOrAdd('heading2'), active: focusedBlock?.type === 'heading2' },
    { icon: <Heading3 />, label: 'Heading 3', action: () => transformOrAdd('heading3'), active: focusedBlock?.type === 'heading3' },
    { icon: <List />, label: 'Bullet list', action: () => transformOrAdd('bullet-list'), active: focusedBlock?.type === 'bullet-list' },
    { icon: <ListOrdered />, label: 'Numbered list', action: () => transformOrAdd('numbered-list'), active: focusedBlock?.type === 'numbered-list' },
    { icon: <CheckSquare />, label: 'To-do list', action: () => transformOrAdd('todo'), active: focusedBlock?.type === 'todo' },
  ]

  const formatting: ToolbarAction[] = [
    { icon: <Bold />, label: 'Bold', shortcut: '⌘B', action: () => execFormat('bold') },
    { icon: <Italic />, label: 'Italic', shortcut: '⌘I', action: () => execFormat('italic') },
    { icon: <Code />, label: 'Inline code', shortcut: '⌘E', action: () => wrapInlineCode() },
  ]

  const extras: ToolbarAction[] = [
    { icon: <Quote />, label: 'Quote', action: () => transformOrAdd('quote'), active: focusedBlock?.type === 'quote' },
    { icon: <Minus />, label: 'Divider', action: () => addBlockAfterFocused('divider') },
    { icon: <AlertCircle />, label: 'Callout', action: () => transformOrAdd('callout'), active: focusedBlock?.type === 'callout' },
  ]

  const renderGroup = (actions: ToolbarAction[]) =>
    actions.map((a) => (
      <Tooltip key={a.label} content={a.shortcut ? `${a.label} (${a.shortcut})` : a.label} side="bottom">
        <IconButton
          size="sm"
          label={a.label}
          active={a.active}
          onClick={a.action}
          disabled={a.disabled}
        >
          {a.icon}
        </IconButton>
      </Tooltip>
    ))

  return (
    <div className={`flex items-center justify-center py-2 px-4 flex-shrink-0 ${className}`}>
      <div className="relative max-w-full">
        <div
          className="
            inline-flex items-center gap-0.5 px-2 h-12 sm:h-11
            bg-bg-overlay border border-border
            rounded-[var(--radius-pill)]
            shadow-float backdrop-blur-sm
          "
        >
          {renderGroup(undoRedo)}
          <Separator orientation="vertical" className="mx-1.5 h-5" />
          {renderGroup(insertActions)}
          <Separator orientation="vertical" className="mx-1.5 h-5" />
          {/* Block types: show first 4 on mobile, all on sm+ */}
          <span className="sm:hidden flex items-center gap-0.5">
            {renderGroup(blockTypes.slice(0, 4))}
          </span>
          <span className="hidden sm:flex items-center gap-0.5">
            {renderGroup(blockTypes)}
          </span>
          <Separator orientation="vertical" className="mx-1.5 h-5 hidden sm:block" />
          <span className="hidden sm:flex items-center gap-0.5">
            {renderGroup(formatting)}
          </span>
          <Separator orientation="vertical" className="mx-1.5 h-5 hidden sm:block" />
          <span className="hidden sm:flex items-center gap-0.5">
            {renderGroup(extras)}
          </span>
        </div>
      </div>
    </div>
  )
}
