import { useCallback } from 'react'
import { useWorkspace } from '../context/workspace-context'
import { createPage, duplicatePage } from '../lib/page-utils'
import type { Page } from '../types'

export function usePages() {
  const { state, dispatch } = useWorkspace()
  const { pages } = state

  const create = useCallback(
    (overrides: Partial<Page> = {}) => {
      const page = createPage(overrides)
      dispatch({ type: 'PAGE_CREATE', payload: page })
      // If page has a parent, add to parent's childrenIds
      if (page.parentId && pages[page.parentId]) {
        dispatch({
          type: 'PAGE_UPDATE',
          payload: {
            id: page.parentId,
            updates: {
              childrenIds: [...pages[page.parentId].childrenIds, page.id],
            },
          },
        })
      }
      dispatch({ type: 'UI_SELECT_PAGE', payload: { id: page.id } })
      return page
    },
    [dispatch, pages],
  )

  const update = useCallback(
    (id: string, updates: Partial<Page>) => {
      dispatch({ type: 'PAGE_UPDATE', payload: { id, updates } })
    },
    [dispatch],
  )

  const rename = useCallback(
    (id: string, title: string) => {
      dispatch({ type: 'PAGE_UPDATE', payload: { id, updates: { title } } })
    },
    [dispatch],
  )

  const duplicate = useCallback(
    (id: string) => {
      const original = pages[id]
      if (!original) return null
      const dupe = duplicatePage(original)
      dispatch({ type: 'PAGE_DUPLICATE', payload: { original, duplicate: dupe } })
      dispatch({ type: 'UI_SELECT_PAGE', payload: { id: dupe.id } })
      return dupe
    },
    [dispatch, pages],
  )

  const trash = useCallback(
    (id: string) => {
      dispatch({ type: 'PAGE_TRASH', payload: { id } })
      // If trashed page is selected, deselect
      if (state.ui.selectedPageId === id) {
        dispatch({ type: 'UI_SELECT_PAGE', payload: { id: null } })
      }
    },
    [dispatch, state.ui.selectedPageId],
  )

  const restore = useCallback(
    (id: string) => {
      dispatch({ type: 'PAGE_RESTORE', payload: { id } })
    },
    [dispatch],
  )

  const permanentDelete = useCallback(
    (id: string) => {
      dispatch({ type: 'PAGE_DELETE', payload: { id } })
      if (state.ui.selectedPageId === id) {
        dispatch({ type: 'UI_SELECT_PAGE', payload: { id: null } })
      }
    },
    [dispatch, state.ui.selectedPageId],
  )

  const togglePin = useCallback(
    (id: string) => {
      const page = pages[id]
      if (page) update(id, { isPinned: !page.isPinned })
    },
    [pages, update],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      const page = pages[id]
      if (page) update(id, { isFavorite: !page.isFavorite })
    },
    [pages, update],
  )

  const toggleArchive = useCallback(
    (id: string) => {
      const page = pages[id]
      if (page) update(id, { isArchived: !page.isArchived })
    },
    [pages, update],
  )

  const select = useCallback(
    (id: string | null) => {
      dispatch({ type: 'UI_SELECT_PAGE', payload: { id } })
      // Auto-close mobile sidebar on selection
      if (id && state.ui.sidebarOpenMobile) {
        dispatch({ type: 'UI_TOGGLE_SIDEBAR_MOBILE' })
      }
    },
    [dispatch, state.ui.sidebarOpenMobile],
  )

  const move = useCallback(
    (id: string, newParentId: string | null) => {
      dispatch({ type: 'PAGE_MOVE', payload: { id, newParentId } })
    },
    [dispatch],
  )

  const selectedPage = state.ui.selectedPageId
    ? pages[state.ui.selectedPageId] ?? null
    : null

  return {
    pages,
    selectedPage,
    selectedPageId: state.ui.selectedPageId,
    create,
    update,
    rename,
    duplicate,
    trash,
    restore,
    permanentDelete,
    togglePin,
    toggleFavorite,
    toggleArchive,
    select,
    move,
  }
}
