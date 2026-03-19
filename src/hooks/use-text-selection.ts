import { useCallback, useEffect, useRef, useState } from 'react'

export interface TextSelection {
  isActive: boolean
  rect: DOMRect | null
  text: string
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>): TextSelection {
  const [selection, setSelection] = useState<TextSelection>({
    isActive: false,
    rect: null,
    text: '',
  })
  const isActiveRef = useRef(false)

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    if (
      !sel ||
      sel.isCollapsed ||
      !sel.rangeCount ||
      !containerRef.current
    ) {
      if (isActiveRef.current) {
        isActiveRef.current = false
        setSelection({ isActive: false, rect: null, text: '' })
      }
      return
    }

    const range = sel.getRangeAt(0)

    // Only track selections inside our container
    if (!containerRef.current.contains(range.commonAncestorContainer)) {
      if (isActiveRef.current) {
        isActiveRef.current = false
        setSelection({ isActive: false, rect: null, text: '' })
      }
      return
    }

    const text = sel.toString().trim()
    if (!text) {
      isActiveRef.current = false
      setSelection({ isActive: false, rect: null, text: '' })
      return
    }

    const rect = range.getBoundingClientRect()
    isActiveRef.current = true
    setSelection({ isActive: true, rect, text })
  }, [containerRef])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleSelectionChange])

  return selection
}
