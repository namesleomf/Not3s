import { useCallback, useRef, useState } from 'react'
import type { Block } from '../types'

export interface BlockDragState {
  isDragging: boolean
  dragId: string | null
  dragOverId: string | null
  dropPosition: 'before' | 'after' | null
}

export interface BlockDragAPI {
  state: BlockDragState
  handleDragStart: (e: React.DragEvent, blockId: string) => void
  handleDragOver: (e: React.DragEvent, blockId: string) => void
  handleDragLeave: () => void
  handleDrop: (e: React.DragEvent, blocks: Block[], reorder: (fromId: string, toId: string, position: 'before' | 'after') => void) => void
  handleDragEnd: () => void
}

export function useBlockDrag(): BlockDragAPI {
  const [dragState, setDragState] = useState<BlockDragState>({
    isDragging: false,
    dragId: null,
    dragOverId: null,
    dropPosition: null,
  })
  const dragIdRef = useRef<string | null>(null)

  const handleDragStart = useCallback((e: React.DragEvent, blockId: string) => {
    dragIdRef.current = blockId
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', blockId)
    // Slight delay so the dragged element renders before state update
    requestAnimationFrame(() => {
      setDragState({ isDragging: true, dragId: blockId, dragOverId: null, dropPosition: null })
    })
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, blockId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (blockId === dragIdRef.current) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position: 'before' | 'after' = e.clientY < midY ? 'before' : 'after'

    setDragState((prev) => ({
      ...prev,
      dragOverId: blockId,
      dropPosition: position,
    }))
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragState((prev) => ({ ...prev, dragOverId: null, dropPosition: null }))
  }, [])

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      _blocks: Block[],
      reorder: (fromId: string, toId: string, position: 'before' | 'after') => void,
    ) => {
      e.preventDefault()
      const fromId = dragIdRef.current
      const { dragOverId, dropPosition } = dragState

      if (fromId && dragOverId && dropPosition && fromId !== dragOverId) {
        reorder(fromId, dragOverId, dropPosition)
      }

      setDragState({ isDragging: false, dragId: null, dragOverId: null, dropPosition: null })
      dragIdRef.current = null
    },
    [dragState],
  )

  const handleDragEnd = useCallback(() => {
    setDragState({ isDragging: false, dragId: null, dragOverId: null, dropPosition: null })
    dragIdRef.current = null
  }, [])

  return {
    state: dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  }
}
