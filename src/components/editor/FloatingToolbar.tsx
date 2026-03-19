import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
} from 'lucide-react'
import type { TextSelection } from '../../hooks/use-text-selection'

interface FloatingToolbarProps {
  selection: TextSelection
}

type FormatCommand = 'bold' | 'italic' | 'underline' | 'strikeThrough'

const formatButtons: { command: FormatCommand; icon: typeof Bold; label: string; shortcut: string }[] = [
  { command: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B' },
  { command: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I' },
  { command: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U' },
  { command: 'strikeThrough', icon: Strikethrough, label: 'Strikethrough', shortcut: 'Ctrl+Shift+S' },
]

const highlightColors = [
  { color: 'var(--color-accent)', label: 'Accent' },
  { color: '#f59e0b', label: 'Yellow' },
  { color: '#10b981', label: 'Green' },
  { color: '#ef4444', label: 'Red' },
  { color: '#8b5cf6', label: 'Purple' },
]

export function FloatingToolbar({ selection }: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  // Position the toolbar above the selection
  useEffect(() => {
    if (!selection.isActive || !selection.rect) {
      setPosition(null)
      setShowHighlightPicker(false)
      return
    }

    const { rect } = selection
    const toolbarWidth = toolbarRef.current?.offsetWidth ?? 280
    const toolbarHeight = toolbarRef.current?.offsetHeight ?? 36

    let left = rect.left + rect.width / 2 - toolbarWidth / 2
    const top = rect.top - toolbarHeight - 8

    // Keep within viewport
    left = Math.max(8, Math.min(left, window.innerWidth - toolbarWidth - 8))

    setPosition({ top: Math.max(8, top), left })
  }, [selection])

  const execFormat = useCallback((command: FormatCommand) => {
    document.execCommand(command, false)
  }, [])

  const execCode = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)

    // Check if already wrapped in <code>
    let parent = range.commonAncestorContainer as HTMLElement
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!

    if (parent.tagName === 'CODE') {
      // Unwrap
      const text = parent.textContent || ''
      const textNode = document.createTextNode(text)
      parent.replaceWith(textNode)
    } else {
      // Wrap in <code> — use extractContents to avoid surroundContents crash on partial nodes
      const code = document.createElement('code')
      code.className = 'bg-bg-code px-1 py-0.5 rounded text-[0.9em] font-mono'
      const fragment = range.extractContents()
      code.appendChild(fragment)
      range.insertNode(code)
    }
  }, [])

  const execLink = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    let parent = range.commonAncestorContainer as HTMLElement
    if (parent.nodeType === Node.TEXT_NODE) parent = parent.parentElement!

    if (parent.tagName === 'A') {
      // Unwrap link
      document.execCommand('unlink', false)
    } else {
      const url = prompt('Enter URL:')
      if (url) {
        document.execCommand('createLink', false, url)
      }
    }
  }, [])

  const execHighlight = useCallback((color: string) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return

    const range = sel.getRangeAt(0)
    const mark = document.createElement('mark')
    mark.style.backgroundColor = color
    mark.style.borderRadius = '2px'
    mark.style.padding = '0 2px'
    const fragment = range.extractContents()
    mark.appendChild(fragment)
    range.insertNode(mark)
    setShowHighlightPicker(false)
  }, [])

  // Check if a format is currently active
  const isActive = useCallback((command: string): boolean => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }, [])

  if (!position) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 flex items-center gap-0.5 px-1 py-0.5 bg-bg-overlay border border-separator rounded-[var(--radius-lg)] shadow-lg animate-[fadeIn_0.1s_ease]"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing selection
    >
      {formatButtons.map(({ command, icon: Icon, label, shortcut }) => (
        <button
          key={command}
          onClick={() => execFormat(command)}
          title={`${label} (${shortcut})`}
          className={`
            flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] transition-theme
            ${isActive(command)
              ? 'bg-accent/20 text-accent'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}
          `}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}

      <span className="w-px h-4 bg-separator mx-0.5" />

      {/* Inline code */}
      <button
        onClick={execCode}
        title="Inline Code"
        className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-theme"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      {/* Link */}
      <button
        onClick={execLink}
        title="Link"
        className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-theme"
      >
        <Link className="w-3.5 h-3.5" />
      </button>

      {/* Highlight */}
      <div className="relative">
        <button
          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
          title="Highlight"
          className={`
            flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] transition-theme
            ${showHighlightPicker
              ? 'bg-accent/20 text-accent'
              : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'}
          `}
        >
          <Highlighter className="w-3.5 h-3.5" />
        </button>

        {showHighlightPicker && (
          <div
            className="absolute top-full mt-1 right-0 flex items-center gap-1 p-1.5 bg-bg-overlay border border-separator rounded-[var(--radius-md)] shadow-lg"
            onMouseDown={(e) => e.preventDefault()}
          >
            {highlightColors.map(({ color, label }) => (
              <button
                key={label}
                onClick={() => execHighlight(color)}
                title={label}
                className="w-5 h-5 rounded-full border border-separator hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
