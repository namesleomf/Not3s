import { type ReactNode } from 'react'
import { useResponsive } from '../../hooks/use-responsive'
import { useWorkspace } from '../../context/workspace-context'
import { MobileSidebarDrawer } from '../ui/MobileSidebarDrawer'
import { Sidebar } from '../sidebar/Sidebar'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { state, dispatch } = useWorkspace()
  const { isMobile } = useResponsive()
  const collapsed = state.settings.sidebarCollapsed

  return (
    <div className="flex h-full w-full overflow-hidden bg-bg-app">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className="h-full flex-shrink-0 transition-[width] duration-200 ease-out overflow-hidden"
          style={{ width: collapsed ? 0 : 260 }}
        >
          <div className="h-full w-[260px]">
            <Sidebar />
          </div>
        </aside>
      )}

      {/* Mobile sidebar drawer */}
      {isMobile && (
        <MobileSidebarDrawer
          open={state.ui.sidebarOpenMobile}
          onClose={() => dispatch({ type: 'UI_TOGGLE_SIDEBAR_MOBILE' })}
        >
          <Sidebar />
        </MobileSidebarDrawer>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
    </div>
  )
}
