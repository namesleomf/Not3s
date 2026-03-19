import { useEffect } from 'react'
import { usePages } from './use-pages'
import { useWorkspace } from '../context/workspace-context'

interface ShortcutDef {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const { create, duplicate, trash, selectedPage, select } = usePages()
  const { dispatch, state } = useWorkspace()

  useEffect(() => {
    const shortcuts: ShortcutDef[] = [
      {
        key: 'n',
        ctrl: true,
        description: 'New page',
        action: () => create(),
      },
      {
        key: 'd',
        ctrl: true,
        shift: true,
        description: 'Duplicate page',
        action: () => {
          if (selectedPage) duplicate(selectedPage.id)
        },
      },
      {
        key: 'Backspace',
        ctrl: true,
        shift: true,
        description: 'Move to trash',
        action: () => {
          if (selectedPage) trash(selectedPage.id)
        },
      },
      {
        key: 'k',
        ctrl: true,
        description: 'Toggle command menu',
        action: () => dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' }),
      },
      {
        key: '\\',
        ctrl: true,
        description: 'Toggle sidebar',
        action: () =>
          dispatch({
            type: 'SETTINGS_UPDATE',
            payload: { sidebarCollapsed: !state.settings.sidebarCollapsed },
          }),
      },
      {
        key: ',',
        ctrl: true,
        description: 'Toggle settings',
        action: () => dispatch({ type: 'UI_TOGGLE_SETTINGS' }),
      },
      {
        key: 'Escape',
        description: 'Deselect page / close panels',
        action: () => {
          if (state.ui.settingsOpen) {
            dispatch({ type: 'UI_TOGGLE_SETTINGS' })
          } else if (state.ui.commandMenuOpen) {
            dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })
          } else if (selectedPage) {
            select(null)
          }
        },
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/contentEditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow Escape to pass through
        if (e.key !== 'Escape') return
      }

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey
        const altMatch = shortcut.alt ? e.altKey : !e.altKey

        if (e.key === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.action()
          return
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [create, duplicate, trash, selectedPage, select, dispatch, state.settings.sidebarCollapsed, state.ui.settingsOpen, state.ui.commandMenuOpen])
}
