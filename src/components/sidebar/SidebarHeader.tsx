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
    <div className="flex items-center justify-between h-12 px-3 flex-shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-text-inverse">N</span>
        </div>
        <span className="text-[13px] font-semibold text-text-primary truncate">
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
