import { useCallback, useEffect, useRef, useState } from 'react'
import { usePages } from './use-pages'
import { useUndoRedo } from './use-undo-redo'
import { createBlock } from '../lib/page-utils'
import type { Block, BlockType } from '../types'

export interface BlockEditorAPI {
  blocks: Block[]
  addBlock: (type?: BlockType, afterId?: string) => Block
  updateBlock: (id: string, updates: Partial<Block>) => void
  deleteBlock: (id: string) => string | null // returns ID of block to focus
  transformBlock: (id: string, newType: BlockType) => void
  moveBlock: (id: string, direction: 'up' | 'down') => void
  reorderBlock: (fromId: string, toId: string, position: 'before' | 'after') => void
  duplicateBlock: (id: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  focusedBlockId: string | null
  setFocusedBlockId: (id: string | null) => void
  blockRefs: React.MutableRefObject<Map<string, HTMLElement>>
}

export function useBlockEditor(): BlockEditorAPI {
  const { selectedPage, update } = usePages()
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const blockRefs = useRef<Map<string, HTMLElement>>(new Map())
  const history = useUndoRedo()

  const blocks = selectedPage?.blocks ?? []

  // Push initial state when page changes
  const lastPageId = useRef<string | null>(null)
  useEffect(() => {
    if (selectedPage && selectedPage.id !== lastPageId.current) {
      lastPageId.current = selectedPage.id
      history.push(selectedPage.blocks)
    }
  }, [selectedPage?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const setBlocks = useCallback(
    (newBlocks: Block[]) => {
      if (!selectedPage) return
      const ordered = newBlocks.map((b, i) => ({ ...b, order: i }))

      // Extract linked page IDs from block content
      const pageIdRegex = /data-page-id="([^"]+)"/g
      const linkedIds = new Set<string>()
      for (const b of ordered) {
        let match
        while ((match = pageIdRegex.exec(b.content)) !== null) {
          linkedIds.add(match[1])
        }
      }

      update(selectedPage.id, { blocks: ordered, linkedPageIds: Array.from(linkedIds) })
      history.push(ordered)
    },
    [selectedPage, update, history],
  )

  const undoAction = useCallback(() => {
    const prev = history.undo()
    if (prev && selectedPage) {
      update(selectedPage.id, { blocks: prev })
    }
  }, [history, selectedPage, update])

  const redoAction = useCallback(() => {
    const next = history.redo()
    if (next && selectedPage) {
      update(selectedPage.id, { blocks: next })
    }
  }, [history, selectedPage, update])

  const addBlock = useCallback(
    (type: BlockType = 'paragraph', afterId?: string) => {
      const block = createBlock(type)
      if (!afterId || blocks.length === 0) {
        setBlocks([...blocks, block])
      } else {
        const idx = blocks.findIndex((b) => b.id === afterId)
        const newBlocks = [...blocks]
        newBlocks.splice(idx + 1, 0, block)
        setBlocks(newBlocks)
      }
      setFocusedBlockId(block.id)
      return block
    },
    [blocks, setBlocks],
  )

  const updateBlock = useCallback(
    (id: string, updates: Partial<Block>) => {
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    },
    [blocks, setBlocks],
  )

  const deleteBlock = useCallback(
    (id: string): string | null => {
      if (blocks.length <= 1) {
        // Don't delete the last block, just clear it
        setBlocks([{ ...blocks[0], content: '', type: 'paragraph', metadata: {} }])
        return blocks[0].id
      }
      const idx = blocks.findIndex((b) => b.id === id)
      const focusTarget = idx > 0 ? blocks[idx - 1].id : blocks[idx + 1]?.id ?? null
      setBlocks(blocks.filter((b) => b.id !== id))
      setFocusedBlockId(focusTarget)
      return focusTarget
    },
    [blocks, setBlocks],
  )

  const transformBlock = useCallback(
    (id: string, newType: BlockType) => {
      setBlocks(
        blocks.map((b) =>
          b.id === id ? { ...b, type: newType, metadata: newType === 'todo' ? { checked: false } : {} } : b,
        ),
      )
    },
    [blocks, setBlocks],
  )

  const moveBlock = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const idx = blocks.findIndex((b) => b.id === id)
      if (idx === -1) return
      if (direction === 'up' && idx === 0) return
      if (direction === 'down' && idx === blocks.length - 1) return

      const newBlocks = [...blocks]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      ;[newBlocks[idx], newBlocks[swapIdx]] = [newBlocks[swapIdx], newBlocks[idx]]
      setBlocks(newBlocks)
    },
    [blocks, setBlocks],
  )

  const reorderBlock = useCallback(
    (fromId: string, toId: string, position: 'before' | 'after') => {
      const fromIdx = blocks.findIndex((b) => b.id === fromId)
      const toIdx = blocks.findIndex((b) => b.id === toId)
      if (fromIdx === -1 || toIdx === -1) return

      const newBlocks = blocks.filter((b) => b.id !== fromId)
      const insertIdx = newBlocks.findIndex((b) => b.id === toId)
      const finalIdx = position === 'before' ? insertIdx : insertIdx + 1
      newBlocks.splice(finalIdx, 0, blocks[fromIdx])
      setBlocks(newBlocks)
    },
    [blocks, setBlocks],
  )

  const duplicateBlock = useCallback(
    (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id)
      if (idx === -1) return
      const dupe = createBlock(blocks[idx].type, blocks[idx].content, { ...blocks[idx].metadata })
      const newBlocks = [...blocks]
      newBlocks.splice(idx + 1, 0, dupe)
      setBlocks(newBlocks)
      setFocusedBlockId(dupe.id)
    },
    [blocks, setBlocks],
  )

  return {
    blocks,
    addBlock,
    updateBlock,
    deleteBlock,
    transformBlock,
    moveBlock,
    reorderBlock,
    duplicateBlock,
    undo: undoAction,
    redo: redoAction,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    focusedBlockId,
    setFocusedBlockId,
    blockRefs,
  }
}
