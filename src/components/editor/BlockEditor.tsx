import { useEffect } from 'react'
import { BlockItem } from './BlockItem'
import { useBlockEditor } from '../../hooks/use-block-editor'

export function BlockEditor() {
  const editor = useBlockEditor()

  // Focus first block on mount if none focused
  useEffect(() => {
    if (!editor.focusedBlockId && editor.blocks.length > 0) {
      editor.setFocusedBlockId(editor.blocks[0].id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (editor.blocks.length === 0) return null

  return (
    <div className="flex flex-col">
      {editor.blocks.map((block) => (
        <BlockItem key={block.id} block={block} editor={editor} />
      ))}

      {/* Click below blocks to add a new one */}
      <div
        className="min-h-[200px] cursor-text"
        onClick={() => {
          const lastBlock = editor.blocks[editor.blocks.length - 1]
          if (lastBlock && lastBlock.content === '' && lastBlock.type === 'paragraph') {
            // Focus existing empty last block
            editor.setFocusedBlockId(lastBlock.id)
          } else {
            // Add new block
            editor.addBlock('paragraph', lastBlock?.id)
          }
        }}
      />
    </div>
  )
}
