import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { ThemeMode } from '../types'
import { useWorkspace } from './workspace-context'

interface ThemeContextValue {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useWorkspace()
  const theme = state.settings.theme

  // Apply data-theme attribute to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      dispatch({ type: 'SETTINGS_UPDATE', payload: { theme: newTheme } })
    },
    [dispatch],
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'paper-white' ? 'oled-black' : 'paper-white')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider')
  return ctx
}
