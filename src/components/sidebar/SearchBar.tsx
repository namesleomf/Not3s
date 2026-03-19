import { SearchInput } from '../ui/SearchInput'
import { useSearch } from '../../hooks/use-search'

export function SearchBar() {
  const { searchQuery, setSearch } = useSearch()

  return (
    <SearchInput
      value={searchQuery}
      onValueChange={setSearch}
      placeholder="Search pages..."
      compact
      data-sidebar-search
    />
  )
}
