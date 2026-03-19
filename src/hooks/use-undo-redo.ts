import { useCallback, useRef } from 'react'
import type { Block } from '../types'

interface HistoryEntry {
  blocks: Block[]
}

const MAX_HISTORY = 50

export interface UndoRedoAPI {
  canUndo: boolean
  canRedo: boolean
  undo: () => Block[] | null
  redo: () => Block[] | null
  push: (blocks: Block[]) => void
}

export function useUndoRedo(): UndoRedoAPI {
  const pastRef = useRef<HistoryEntry[]>([])
  const futureRef = useRef<HistoryEntry[]>([])
  const lastPushRef = useRef<number>(0)

  const push = useCallback((blocks: Block[]) => {
    // Debounce: don't push if less than 300ms since last push
    const now = Date.now()
    if (now - lastPushRef.current < 300) {
      // Replace the last entry instead
      if (pastRef.current.length > 0) {
        pastRef.current[pastRef.current.length - 1] = { blocks: structuredClone(blocks) }
      }
      return
    }
    lastPushRef.current = now

    pastRef.current = [...pastRef.current, { blocks: structuredClone(blocks) }]
    if (pastRef.current.length > MAX_HISTORY) {
      pastRef.current = pastRef.current.slice(-MAX_HISTORY)
    }
    // Clear future on new action
    futureRef.current = []
  }, [])

  const undo = useCallback((): Block[] | null => {
    if (pastRef.current.length <= 1) return null
    const current = pastRef.current.pop()!
    futureRef.current = [...futureRef.current, current]
    const prev = pastRef.current[pastRef.current.length - 1]
    return prev ? structuredClone(prev.blocks) : null
  }, [])

  const redo = useCallback((): Block[] | null => {
    if (futureRef.current.length === 0) return null
    const next = futureRef.current.pop()!
    pastRef.current = [...pastRef.current, next]
    return structuredClone(next.blocks)
  }, [])

  return {
    canUndo: pastRef.current.length > 1,
    canRedo: futureRef.current.length > 0,
    undo,
    redo,
    push,
  }
}
