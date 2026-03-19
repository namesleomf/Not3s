import { useCallback } from 'react'
import { useWorkspace } from '../context/workspace-context'
import type { Settings } from '../types'

export function useSettings() {
  const { state, dispatch } = useWorkspace()

  const updateSettings = useCallback(
    (updates: Partial<Settings>) => {
      dispatch({ type: 'SETTINGS_UPDATE', payload: updates })
    },
    [dispatch],
  )

  const toggleSettingsPanel = useCallback(() => {
    dispatch({ type: 'UI_TOGGLE_SETTINGS' })
  }, [dispatch])

  return {
    settings: state.settings,
    updateSettings,
    settingsOpen: state.ui.settingsOpen,
    toggleSettingsPanel,
  }
}
