import { useRef, useEffect, useCallback, useState } from 'react'
import {
  GripVertical,
  Plus,
  CheckSquare,
  Square,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import type { Block, BlockType } from '../../types'
import type { BlockEditorAPI } from '../../hooks/use-block-editor'
import type { BlockDragAPI } from '../../hooks/use-block-drag'

interface BlockItemProps {
  block: Block
  editor: BlockEditorAPI
  drag?: BlockDragAPI
}

// Placeholder text per block type
const placeholders: Partial<Record<BlockType, string>> = {
  paragraph: "Type '/' for commands...",
  heading1: 'Heading 1',
  heading2: 'Heading 2',
  heading3: 'Heading 3',
  'bullet-list': 'List item',
  'numbered-list': 'List item',
  todo: 'To-do',
  quote: 'Quote',
  callout: 'Type something...',
  code: 'Code',
  toggle: 'Toggle',
}

// CSS classes per block type
const typeStyles: Partial<Record<BlockType, string>> = {
  heading1: 'text-[28px] font-bold leading-tight',
  heading2: 'text-[22px] font-semibold leading-tight',
  heading3: 'text-[18px] font-semibold leading-snug',
  'bullet-list': 'text-[15px] leading-relaxed',
  'numbered-list': 'text-[15px] leading-relaxed',
  todo: 'text-[15px] leading-relaxed',
  quote: 'text-[15px] leading-relaxed italic text-text-secondary',
  callout: 'text-[14px] leading-relaxed',
  code: 'text-[13px] font-mono leading-relaxed bg-bg-code px-3 py-2 rounded-[var(--radius-md)]',
  toggle: 'text-[15px] leading-relaxed',
}

export function BlockItem({ block, editor, drag }: BlockItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const isFocused = editor.focusedBlockId === block.id

  // Register ref
  useEffect(() => {
    if (contentRef.current) {
      editor.blockRefs.current.set(block.id, contentRef.current)
    }
    return () => {
      editor.blockRefs.current.delete(block.id)
    }
  }, [block.id, editor.blockRefs])

  // Auto-focus when focusedBlockId changes
  useEffect(() => {
    if (isFocused && contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.focus()
      // Place cursor at end
      const sel = window.getSelection()
      if (sel && contentRef.current.childNodes.length > 0) {
        const range = document.createRange()
        range.selectNodeContents(contentRef.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }, [isFocused])

  // Sync content from state (only when block content changes externally)
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== block.content) {
      contentRef.current.innerHTML = block.content
    }
  }, [block.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInput = useCallback(() => {
    if (!contentRef.current) return
    const html = contentRef.current.innerHTML
    editor.updateBlock(block.id, { content: html })

    // Check for slash command
    const text = contentRef.current.textContent || ''
    if (text === '/') {
      setShowSlashMenu(true)
    } else {
      setShowSlashMenu(false)
    }
  }, [block.id, editor])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter → new block below
      if (e.key === 'Enter' && !e.shiftKey) {
        // Allow shift+enter for line breaks
        if (block.type !== 'code') {
          e.preventDefault()
          editor.addBlock('paragraph', block.id)
        }
        return
      }

      // Backspace on empty block → delete
      if (e.key === 'Backspace' && (contentRef.current?.textContent || '') === '') {
        e.preventDefault()
        editor.deleteBlock(block.id)
        return
      }

      // Tab → indent (transform to nested or change type)
      if (e.key === 'Tab') {
        e.preventDefault()
        if (e.shiftKey) {
          // Outdent: convert to paragraph
          if (block.type !== 'paragraph') {
            editor.transformBlock(block.id, 'paragraph')
          }
        } else {
          // Indent: convert paragraph to bullet list
          if (block.type === 'paragraph') {
            editor.transformBlock(block.id, 'bullet-list')
          }
        }
        return
      }

      // Arrow up at start of block → focus previous block
      if (e.key === 'ArrowUp') {
        const sel = window.getSelection()
        if (sel && isAtStart(contentRef.current, sel)) {
          e.preventDefault()
          focusAdjacentBlock('up')
        }
        return
      }

      // Arrow down at end of block → focus next block
      if (e.key === 'ArrowDown') {
        const sel = window.getSelection()
        if (sel && isAtEnd(contentRef.current, sel)) {
          e.preventDefault()
          focusAdjacentBlock('down')
        }
        return
      }

      // Ctrl+Shift+Up/Down → move block
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault()
        editor.moveBlock(block.id, e.key === 'ArrowUp' ? 'up' : 'down')
        return
      }

      // Markdown shortcuts on Space
      if (e.key === ' ' && contentRef.current) {
        const text = contentRef.current.textContent || ''
        const mdMap: Record<string, BlockType> = {
          '#': 'heading1',
          '##': 'heading2',
          '###': 'heading3',
          '-': 'bullet-list',
          '*': 'bullet-list',
          '1.': 'numbered-list',
          '[]': 'todo',
          '>': 'quote',
          '```': 'code',
          '---': 'divider',
        }

        const newType = mdMap[text.trim()]
        if (newType) {
          e.preventDefault()
          contentRef.current.innerHTML = ''
          editor.updateBlock(block.id, { content: '' })
          editor.transformBlock(block.id, newType)
        }
      }
    },
    [block.id, block.type, editor],
  )

  const focusAdjacentBlock = (direction: 'up' | 'down') => {
    const allBlocks = editor.blocks
    const idx = allBlocks.findIndex((b) => b.id === block.id)
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx >= 0 && targetIdx < allBlocks.length) {
      editor.setFocusedBlockId(allBlocks[targetIdx].id)
    }
  }

  const handleFocus = () => {
    editor.setFocusedBlockId(block.id)
  }

  const handleSlashSelect = (type: BlockType) => {
    setShowSlashMenu(false)
    if (contentRef.current) {
      contentRef.current.innerHTML = ''
    }
    editor.updateBlock(block.id, { content: '' })
    editor.transformBlock(block.id, type)
  }

  const isDragOver = drag?.state.dragOverId === block.id
  const dropPosition = drag?.state.dropPosition
  const isDragged = drag?.state.dragId === block.id

  const dragProps = drag
    ? {
        onDragOver: (e: React.DragEvent) => drag.handleDragOver(e, block.id),
        onDragLeave: drag.handleDragLeave,
        onDrop: (e: React.DragEvent) => drag.handleDrop(e, editor.blocks, editor.reorderBlock),
        onDragEnd: drag.handleDragEnd,
      }
    : {}

  const dropIndicatorClass = isDragOver
    ? dropPosition === 'before'
      ? 'border-t-2 border-t-accent'
      : 'border-b-2 border-b-accent'
    : ''

  // Divider blocks are non-editable
  if (block.type === 'divider') {
    return (
      <div className={`group relative flex items-center py-2 px-1 ${dropIndicatorClass} ${isDragged ? 'opacity-30' : ''}`} {...dragProps}>
        <BlockHandle onAdd={() => editor.addBlock('paragraph', block.id)} onDragStart={drag ? (e) => drag.handleDragStart(e, block.id) : undefined} />
        <hr className="flex-1 border-separator" />
      </div>
    )
  }

  return (
    <div className={`group relative flex items-start py-0.5 px-1 ${dropIndicatorClass} ${isDragged ? 'opacity-30' : ''}`} {...dragProps}>
      <BlockHandle onAdd={() => editor.addBlock('paragraph', block.id)} onDragStart={drag ? (e) => drag.handleDragStart(e, block.id) : undefined} />

      {/* Block-type prefix */}
      <BlockPrefix block={block} editor={editor} />

      {/* ContentEditable */}
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        data-placeholder={placeholders[block.type] || ''}
        className={`
          flex-1 outline-none min-h-[1.5em] text-text-primary
          empty:before:content-[attr(data-placeholder)]
          empty:before:text-text-placeholder
          caret-accent break-words
          ${typeStyles[block.type] || 'text-[15px] leading-relaxed'}
        `}
      />

      {/* Slash command menu */}
      {showSlashMenu && (
        <SlashCommandMenu onSelect={handleSlashSelect} onClose={() => setShowSlashMenu(false)} />
      )}
    </div>
  )
}

// --- Sub-components ---

function BlockHandle({ onAdd, onDragStart }: { onAdd: () => void; onDragStart?: (e: React.DragEvent) => void }) {
  return (
    <div className="flex items-center gap-0.5 mr-1 mt-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0">
      <button
        onClick={onAdd}
        className="flex items-center justify-center w-5 h-5 rounded-[var(--radius-sm)] text-text-muted hover:bg-bg-hover hover:text-text-primary transition-theme"
        title="Add block below"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
      <span
        draggable={!!onDragStart}
        onDragStart={onDragStart}
        className="flex items-center justify-center w-5 h-5 rounded-[var(--radius-sm)] text-text-muted hover:bg-bg-hover cursor-grab active:cursor-grabbing transition-theme"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </span>
    </div>
  )
}

function BlockPrefix({ block, editor }: { block: Block; editor: BlockEditorAPI }) {
  if (block.type === 'bullet-list') {
    return <span className="mr-2 mt-[3px] text-text-muted select-none">&bull;</span>
  }

  if (block.type === 'numbered-list') {
    const idx = editor.blocks
      .filter((b) => b.type === 'numbered-list')
      .findIndex((b) => b.id === block.id)
    return <span className="mr-2 mt-[1px] text-[14px] text-text-muted select-none min-w-[1.2em] text-right">{idx + 1}.</span>
  }

  if (block.type === 'todo') {
    const checked = !!block.metadata.checked
    return (
      <button
        onClick={() => editor.updateBlock(block.id, { metadata: { ...block.metadata, checked: !checked } })}
        className="mr-2 mt-[2px] flex-shrink-0 text-text-muted hover:text-accent transition-theme"
      >
        {checked ? (
          <CheckSquare className="w-4 h-4 text-accent" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>
    )
  }

  if (block.type === 'quote') {
    return <span className="mr-2 self-stretch w-[3px] bg-accent/40 rounded-full flex-shrink-0" />
  }

  if (block.type === 'callout') {
    return (
      <span className="mr-2 mt-[2px] flex-shrink-0">
        <AlertCircle className="w-4 h-4 text-warning" />
      </span>
    )
  }

  if (block.type === 'toggle') {
    return (
      <button className="mr-1 mt-[3px] flex-shrink-0 text-text-muted hover:text-text-primary transition-theme">
        <ChevronRight className="w-4 h-4" />
      </button>
    )
  }

  return null
}

// --- Slash Command Menu ---

interface SlashMenuItem {
  type: BlockType
  label: string
  description: string
}

const slashItems: SlashMenuItem[] = [
  { type: 'paragraph', label: 'Text', description: 'Plain text block' },
  { type: 'heading1', label: 'Heading 1', description: 'Large heading' },
  { type: 'heading2', label: 'Heading 2', description: 'Medium heading' },
  { type: 'heading3', label: 'Heading 3', description: 'Small heading' },
  { type: 'bullet-list', label: 'Bullet List', description: 'Unordered list' },
  { type: 'numbered-list', label: 'Numbered List', description: 'Ordered list' },
  { type: 'todo', label: 'To-do', description: 'Checkbox item' },
  { type: 'toggle', label: 'Toggle', description: 'Collapsible content' },
  { type: 'quote', label: 'Quote', description: 'Block quote' },
  { type: 'callout', label: 'Callout', description: 'Highlighted note' },
  { type: 'divider', label: 'Divider', description: 'Horizontal rule' },
  { type: 'code', label: 'Code', description: 'Code block' },
]

function SlashCommandMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: BlockType) => void
  onClose: () => void
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="absolute left-0 sm:left-12 top-full z-30 mt-1.5 w-[240px] max-w-[calc(100vw-2rem)] bg-bg-overlay border border-border rounded-[var(--radius-xl)] shadow-float py-1.5 max-h-[340px] overflow-y-auto animate-[fadeIn_0.1s_ease]">
      <div className="px-3 py-1.5">
        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
          Basic blocks
        </span>
      </div>
      {slashItems.map((item) => (
        <button
          key={item.type}
          onClick={() => onSelect(item.type)}
          className="flex flex-col w-full px-3.5 py-2 text-left hover:bg-bg-hover rounded-[var(--radius-md)] mx-1 transition-theme"
          style={{ width: 'calc(100% - 8px)' }}
        >
          <span className="text-[13px] text-text-primary">{item.label}</span>
          <span className="text-[11px] text-text-muted">{item.description}</span>
        </button>
      ))}
    </div>
  )
}

// --- Helpers ---

function isAtStart(el: HTMLElement | null, sel: Selection): boolean {
  if (!el || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  return range.startOffset === 0 && (range.startContainer === el || range.startContainer === el.firstChild)
}

function isAtEnd(el: HTMLElement | null, sel: Selection): boolean {
  if (!el || sel.rangeCount === 0) return false
  const range = sel.getRangeAt(0)
  const textLen = (el.textContent || '').length
  if (range.endContainer === el) return range.endOffset === el.childNodes.length
  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    return range.endOffset === (range.endContainer.textContent || '').length &&
      !range.endContainer.nextSibling
  }
  return range.endOffset >= textLen
}
