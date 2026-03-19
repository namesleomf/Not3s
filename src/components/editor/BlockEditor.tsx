import { useEffect, useRef } from 'react'
import { BlockItem } from './BlockItem'
import { FloatingToolbar } from './FloatingToolbar'
import { useBlockEditor } from '../../hooks/use-block-editor'
import { useTextSelection } from '../../hooks/use-text-selection'
import { useBlockDrag } from '../../hooks/use-block-drag'

export function BlockEditor() {
  const editor = useBlockEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const selection = useTextSelection(containerRef)
  const drag = useBlockDrag()

  // Focus first block on mount if none focused
  useEffect(() => {
    if (!editor.focusedBlockId && editor.blocks.length > 0) {
      editor.setFocusedBlockId(editor.blocks[0].id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (editor.blocks.length === 0) return null

  return (
    <div ref={containerRef} className="flex flex-col">
      <FloatingToolbar selection={selection} />

      {editor.blocks.map((block) => (
        <BlockItem key={block.id} block={block} editor={editor} drag={drag} />
      ))}

      {/* Click below blocks to add a new one */}
      <div
        className="min-h-[200px] cursor-text"
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
