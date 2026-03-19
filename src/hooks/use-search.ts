import { useMemo, useCallback } from 'react'
import { useWorkspace } from '../context/workspace-context'
import { getPagePlainText } from '../lib/page-utils'
import type { SidebarFilter, SortField, SortDirection } from '../types'

export function useSearch() {
  const { state, dispatch } = useWorkspace()
  const { pages } = state
  const { searchQuery, activeFilter, activeTag, sortField, sortDirection } = state.ui

  const setSearch = useCallback(
    (query: string) => dispatch({ type: 'UI_SET_SEARCH', payload: { query } }),
    [dispatch],
  )

  const setFilter = useCallback(
    (filter: SidebarFilter) => dispatch({ type: 'UI_SET_FILTER', payload: { filter } }),
    [dispatch],
  )

  const setTag = useCallback(
    (tag: string | null) => dispatch({ type: 'UI_SET_TAG', payload: { tag } }),
    [dispatch],
  )

  const setSort = useCallback(
    (field: SortField, direction: SortDirection) =>
      dispatch({ type: 'UI_SET_SORT', payload: { field, direction } }),
    [dispatch],
  )

  const filteredPages = useMemo(() => {
    let result = Object.values(pages)

    // Filter by sidebar filter
    switch (activeFilter) {
      case 'favorites':
        result = result.filter((p) => p.isFavorite && !p.isTrashed)
        break
      case 'pinned':
        result = result.filter((p) => p.isPinned && !p.isTrashed)
        break
      case 'archived':
        result = result.filter((p) => p.isArchived && !p.isTrashed)
        break
      case 'trash':
        result = result.filter((p) => p.isTrashed)
        break
      default:
        result = result.filter((p) => !p.isTrashed && !p.isArchived)
    }

    // Filter by tag
    if (activeTag) {
      result = result.filter((p) => p.tags.includes(activeTag))
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => {
        const text = getPagePlainText(p)
        return text.includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))
      })
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'title':
          cmp = (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
          break
        case 'createdAt':
          cmp = a.createdAt - b.createdAt
          break
        case 'updatedAt':
          cmp = a.updatedAt - b.updatedAt
          break
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })

    return result
  }, [pages, activeFilter, activeTag, searchQuery, sortField, sortDirection])

  return {
    searchQuery,
    activeFilter,
    activeTag,
    sortField,
    sortDirection,
    filteredPages,
    setSearch,
    setFilter,
    setTag,
    setSort,
  }
}
