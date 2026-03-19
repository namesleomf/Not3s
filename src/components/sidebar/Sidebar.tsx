import { SidebarHeader } from './SidebarHeader'
import { SearchBar } from './SearchBar'
import { QuickCreateButton } from './QuickCreateButton'
import { FilterNav } from './FilterNav'
import { TagSection } from './TagSection'
import { PageTree } from './PageTree'
import { SidebarFooter } from './SidebarFooter'
import { Separator } from '../ui/Separator'

export function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-bg-sidebar border-r border-separator overflow-hidden">
      <SidebarHeader />

      <div className="px-2 pt-1 pb-2">
        <SearchBar />
      </div>

      <div className="px-2 pb-1">
        <QuickCreateButton />
      </div>

      <Separator className="mx-3 my-1" />

      <FilterNav />

      <Separator className="mx-3 my-1" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">
        <PageTree />
      </div>

      <TagSection />

      <Separator className="mx-3" />

      <SidebarFooter />
    </div>
  )
}
