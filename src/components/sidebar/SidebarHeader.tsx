import { PanelLeftClose, PanelLeft } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useSettings } from '../../hooks/use-settings'
import { useResponsive } from '../../hooks/use-responsive'
import { useWorkspace } from '../../context/workspace-context'

export function SidebarHeader() {
  const { settings, updateSettings } = useSettings()
  const { isMobile } = useResponsive()
  const { dispatch } = useWorkspace()

  const handleToggle = () => {
    if (isMobile) {
      dispatch({ type: 'UI_TOGGLE_SIDEBAR_MOBILE' })
    } else {
      updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed })
    }
  }

  return (
    <div className="flex items-center justify-between h-14 px-4 flex-shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-[var(--radius-md)] bg-text-primary flex items-center justify-center flex-shrink-0">
          <span className="text-[12px] font-bold text-text-inverse">N</span>
        </div>
        <span className="text-[14px] font-semibold text-text-primary truncate tracking-tight">
          Not3s
        </span>
      </div>
      <IconButton
        size="sm"
        label={settings.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={handleToggle}
      >
        {settings.sidebarCollapsed ? <PanelLeft /> : <PanelLeftClose />}
      </IconButton>
    </div>
  )
}
