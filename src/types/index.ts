// ============================================================
// Not3s — Data Models
// ============================================================

export type BlockType =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet-list'
  | 'numbered-list'
  | 'todo'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'code'
  | 'image'
  | 'page-link' // V2: internal linking

export interface Block {
  id: string
  type: BlockType
  content: string // HTML string for ContentEditable
  metadata: Record<string, unknown> // type-specific (language for code, checked for todo, etc.)
  children: Block[] // nested blocks (toggle content, nested lists)
  order: number
}

export interface Page {
  id: string
  title: string
  icon: string | null
  coverImage: string | null // gradient/color preset key or URL
  parentId: string | null
  childrenIds: string[]
  blocks: Block[]
  tags: string[]
  linkedPageIds: string[] // Populated by internal linking feature
  backlinks: string[] // V2: computed from linkedPageIds across pages
  isPinned: boolean
  isFavorite: boolean
  isArchived: boolean
  isTrashed: boolean
  trashedAt: number | null
  createdAt: number
  updatedAt: number
}

export type ThemeMode = 'paper-white' | 'oled-black'
export type UIDensity = 'compact' | 'default' | 'comfortable'
export type LandingView = 'recent' | 'favorites' | 'all'
export type SidebarFilter = 'all' | 'favorites' | 'pinned' | 'archived' | 'trash'
export type SortField = 'title' | 'createdAt' | 'updatedAt'
export type SortDirection = 'asc' | 'desc'

export interface Settings {
  theme: ThemeMode
  uiDensity: UIDensity
  fontScale: number // 0.85 - 1.15
  sidebarCollapsed: boolean
  showSidebarMetadata: boolean
  defaultLandingView: LandingView
  confirmBeforeDelete: boolean
  translucentSidebar: boolean
}

export interface UIState {
  selectedPageId: string | null
  searchQuery: string
  activeFilter: SidebarFilter
  activeTag: string | null
  sortField: SortField
  sortDirection: SortDirection
  sidebarOpenMobile: boolean
  settingsOpen: boolean
  commandMenuOpen: boolean
  importDialogOpen: boolean
  expandedPageIds: string[] // which page tree nodes are expanded
}

// State stored in WorkspaceContext
export interface WorkspaceState {
  pages: Record<string, Page>
  settings: Settings
  ui: UIState
}

// All possible workspace actions
export type WorkspaceAction =
  // Page actions
  | { type: 'PAGE_CREATE'; payload: Page }
  | { type: 'PAGE_UPDATE'; payload: { id: string; updates: Partial<Page> } }
  | { type: 'PAGE_DELETE'; payload: { id: string } }
  | { type: 'PAGE_TRASH'; payload: { id: string } }
  | { type: 'PAGE_RESTORE'; payload: { id: string } }
  | { type: 'PAGE_DUPLICATE'; payload: { original: Page; duplicate: Page } }
  | { type: 'PAGE_MOVE'; payload: { id: string; newParentId: string | null } }
  | { type: 'PAGES_SET'; payload: Record<string, Page> }
  // UI actions
  | { type: 'UI_SELECT_PAGE'; payload: { id: string | null } }
  | { type: 'UI_SET_SEARCH'; payload: { query: string } }
  | { type: 'UI_SET_FILTER'; payload: { filter: SidebarFilter } }
  | { type: 'UI_SET_TAG'; payload: { tag: string | null } }
  | { type: 'UI_SET_SORT'; payload: { field: SortField; direction: SortDirection } }
  | { type: 'UI_TOGGLE_SIDEBAR_MOBILE'; payload?: undefined }
  | { type: 'UI_TOGGLE_SETTINGS'; payload?: undefined }
  | { type: 'UI_TOGGLE_COMMAND_MENU'; payload?: undefined }
  | { type: 'UI_TOGGLE_PAGE_EXPANDED'; payload: { id: string } }
  | { type: 'UI_SET'; payload: Partial<UIState> }
  // Settings actions
  | { type: 'SETTINGS_UPDATE'; payload: Partial<Settings> }
