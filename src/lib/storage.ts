import type { Page, Settings, UIState } from '../types'

const KEYS = {
  pages: 'not3s-pages',
  settings: 'not3s-settings',
  ui: 'not3s-ui',
} as const

export const DEFAULT_SETTINGS: Settings = {
  theme: 'paper-white',
  uiDensity: 'default',
  fontScale: 1,
  sidebarCollapsed: false,
  showSidebarMetadata: true,
  defaultLandingView: 'recent',
  confirmBeforeDelete: true,
  translucentSidebar: false,
}

export const DEFAULT_UI_STATE: UIState = {
  selectedPageId: null,
  searchQuery: '',
  activeFilter: 'all',
  activeTag: null,
  sortField: 'updatedAt',
  sortDirection: 'desc',
  sidebarOpenMobile: false,
  settingsOpen: false,
  commandMenuOpen: false,
  expandedPageIds: [],
}

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

export const storage = {
  loadPages(): Record<string, Page> {
    return safeJsonParse(localStorage.getItem(KEYS.pages), {})
  },

  savePages(pages: Record<string, Page>): void {
    localStorage.setItem(KEYS.pages, JSON.stringify(pages))
  },

  loadSettings(): Settings {
    const stored = safeJsonParse<Partial<Settings>>(
      localStorage.getItem(KEYS.settings),
      {},
    )
    return { ...DEFAULT_SETTINGS, ...stored }
  },

  saveSettings(settings: Settings): void {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings))
  },

  loadUIState(): UIState {
    const stored = safeJsonParse<Partial<UIState>>(
      localStorage.getItem(KEYS.ui),
      {},
    )
    return { ...DEFAULT_UI_STATE, ...stored }
  },

  saveUIState(ui: UIState): void {
    localStorage.setItem(KEYS.ui, JSON.stringify(ui))
  },
}
