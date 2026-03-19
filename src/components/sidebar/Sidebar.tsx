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
    <div className="flex flex-col h-full bg-bg-sidebar overflow-hidden">
      <SidebarHeader />

      <div className="px-3 pt-1 pb-2">
        <SearchBar />
      </div>

      <div className="px-3 pb-1.5">
        <QuickCreateButton />
      </div>

      <Separator className="mx-4 my-1.5 opacity-60" />

      <FilterNav />

      <Separator className="mx-4 my-1.5 opacity-60" />

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-1">
        <PageTree />
      </div>

      <TagSection />

      <Separator className="mx-4 opacity-60" />

      <SidebarFooter />
    </div>
  )
}
