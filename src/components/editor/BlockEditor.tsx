import { useEffect, useRef } from 'react'
import { BlockItem } from './BlockItem'
import { FloatingToolbar } from './FloatingToolbar'
import { useEditorContext } from '../../context/editor-context'
import { useTextSelection } from '../../hooks/use-text-selection'
import { useBlockDrag } from '../../hooks/use-block-drag'
import { useWorkspace } from '../../context/workspace-context'

export function BlockEditor() {
  const editor = useEditorContext()
  const { dispatch } = useWorkspace()
  const containerRef = useRef<HTMLDivElement>(null)
  const selection = useTextSelection(containerRef)
  const drag = useBlockDrag()

  // Handle clicks on inline page links
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('page-link-inline') || target.closest('.page-link-inline')) {
        e.preventDefault()
        const link = target.classList.contains('page-link-inline') ? target : target.closest('.page-link-inline')
        const pageId = link?.getAttribute('data-page-id')
        if (pageId) {
          dispatch({ type: 'UI_SELECT_PAGE', payload: { id: pageId } })
        }
      }
    }
    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [dispatch])

  // Stable refs to avoid listener churn
  const undoRef = useRef<(() => void) | null>(null)
  const redoRef = useRef<(() => void) | null>(null)
  if (editor) {
    undoRef.current = editor.undo
    redoRef.current = editor.redo
  }

  // Focus first block on mount if none focused
  useEffect(() => {
    if (editor && !editor.focusedBlockId && editor.blocks.length > 0) {
      editor.setFocusedBlockId(editor.blocks[0].id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Undo/Redo keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoRef.current?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redoRef.current?.()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  if (!editor || editor.blocks.length === 0) return null

  return (
    <div ref={containerRef} className="flex flex-col">
      <FloatingToolbar selection={selection} />

      {editor.blocks.map((block) => (
        <BlockItem key={block.id} block={block} editor={editor} drag={drag} />
      ))}

      {/* Click below blocks to add a new one */}
      <div
        className="min-h-[80px] sm:min-h-[200px] cursor-text"
        onClick={() => {
          const lastBlock = editor.blocks[editor.blocks.length - 1]
          if (lastBlock && lastBlock.content === '' && lastBlock.type === 'paragraph') {
            editor.setFocusedBlockId(lastBlock.id)
          } else {
            editor.addBlock('paragraph', lastBlock?.id)
          }
        }}
      />
    </div>
  )
}
