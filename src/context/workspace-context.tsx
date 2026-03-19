import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import type { WorkspaceState, WorkspaceAction } from '../types'
import { storage } from '../lib/storage'

// ---- Reducer ----

function workspaceReducer(
  state: WorkspaceState,
  action: WorkspaceAction,
): WorkspaceState {
  switch (action.type) {
    // -- Pages --
    case 'PAGE_CREATE':
      return {
        ...state,
        pages: { ...state.pages, [action.payload.id]: action.payload },
      }

    case 'PAGE_UPDATE': {
      const existing = state.pages[action.payload.id]
      if (!existing) return state
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload.id]: {
            ...existing,
            ...action.payload.updates,
            updatedAt: Date.now(),
          },
        },
      }
    }

    case 'PAGE_DELETE': {
      const next = { ...state.pages }
      delete next[action.payload.id]
      // Remove from parent's childrenIds
      const deleted = state.pages[action.payload.id]
      if (deleted?.parentId && next[deleted.parentId]) {
        next[deleted.parentId] = {
          ...next[deleted.parentId],
          childrenIds: next[deleted.parentId].childrenIds.filter(
            (cid) => cid !== action.payload.id,
          ),
        }
      }
      return { ...state, pages: next }
    }

    case 'PAGE_TRASH': {
      const page = state.pages[action.payload.id]
      if (!page) return state
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload.id]: {
            ...page,
            isTrashed: true,
            trashedAt: Date.now(),
            updatedAt: Date.now(),
          },
        },
      }
    }

    case 'PAGE_RESTORE': {
      const page = state.pages[action.payload.id]
      if (!page) return state
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload.id]: {
            ...page,
            isTrashed: false,
            trashedAt: null,
            updatedAt: Date.now(),
          },
        },
      }
    }

    case 'PAGE_DUPLICATE': {
      const { original, duplicate } = action.payload
      const pages = { ...state.pages, [duplicate.id]: duplicate }
      // Add duplicate to parent's children if it has a parent
      if (original.parentId && pages[original.parentId]) {
        pages[original.parentId] = {
          ...pages[original.parentId],
          childrenIds: [
            ...pages[original.parentId].childrenIds,
            duplicate.id,
          ],
        }
      }
      return { ...state, pages }
    }

    case 'PAGE_MOVE': {
      const { id, newParentId } = action.payload
      const page = state.pages[id]
      if (!page) return state
      const pages = { ...state.pages }
      // Remove from old parent
      if (page.parentId && pages[page.parentId]) {
        pages[page.parentId] = {
          ...pages[page.parentId],
          childrenIds: pages[page.parentId].childrenIds.filter(
            (cid) => cid !== id,
          ),
        }
      }
      // Add to new parent
      if (newParentId && pages[newParentId]) {
        pages[newParentId] = {
          ...pages[newParentId],
          childrenIds: [...pages[newParentId].childrenIds, id],
        }
      }
      pages[id] = { ...page, parentId: newParentId, updatedAt: Date.now() }
      return { ...state, pages }
    }

    case 'PAGES_SET':
      return { ...state, pages: action.payload }

    // -- UI --
    case 'UI_SELECT_PAGE':
      return { ...state, ui: { ...state.ui, selectedPageId: action.payload.id } }

    case 'UI_SET_SEARCH':
      return { ...state, ui: { ...state.ui, searchQuery: action.payload.query } }

    case 'UI_SET_FILTER':
      return { ...state, ui: { ...state.ui, activeFilter: action.payload.filter, activeTag: null } }

    case 'UI_SET_TAG':
      return { ...state, ui: { ...state.ui, activeTag: action.payload.tag, activeFilter: 'all' } }

    case 'UI_SET_SORT':
      return {
        ...state,
        ui: {
          ...state.ui,
          sortField: action.payload.field,
          sortDirection: action.payload.direction,
        },
      }

    case 'UI_TOGGLE_SIDEBAR_MOBILE':
      return { ...state, ui: { ...state.ui, sidebarOpenMobile: !state.ui.sidebarOpenMobile } }

    case 'UI_TOGGLE_SETTINGS':
      return { ...state, ui: { ...state.ui, settingsOpen: !state.ui.settingsOpen } }

    case 'UI_TOGGLE_COMMAND_MENU':
      return { ...state, ui: { ...state.ui, commandMenuOpen: !state.ui.commandMenuOpen } }

    case 'UI_TOGGLE_PAGE_EXPANDED': {
      const { id } = action.payload
      const expanded = state.ui.expandedPageIds.includes(id)
        ? state.ui.expandedPageIds.filter((eid) => eid !== id)
        : [...state.ui.expandedPageIds, id]
      return { ...state, ui: { ...state.ui, expandedPageIds: expanded } }
    }

    case 'UI_SET':
      return { ...state, ui: { ...state.ui, ...action.payload } }

    // -- Settings --
    case 'SETTINGS_UPDATE':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    default:
      return state
  }
}

// ---- Context ----

interface WorkspaceContextValue {
  state: WorkspaceState
  dispatch: React.Dispatch<WorkspaceAction>
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

function loadInitialState(): WorkspaceState {
  return {
    pages: storage.loadPages(),
    settings: storage.loadSettings(),
    ui: storage.loadUIState(),
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workspaceReducer, null, loadInitialState)

  // Debounced persistence
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const s = stateRef.current
      storage.savePages(s.pages)
      storage.saveSettings(s.settings)
      storage.saveUIState(s.ui)
    }, 300)
  }, [])

  useEffect(() => {
    scheduleSave()
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [state, scheduleSave])

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
