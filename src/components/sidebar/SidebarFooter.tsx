import { Settings } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useSettings } from '../../hooks/use-settings'

export function SidebarFooter() {
  const { toggleSettingsPanel } = useSettings()

  return (
    <div className="flex items-center justify-between h-11 px-3 flex-shrink-0">
      <IconButton
        size="md"
        label="Open settings"
        onClick={toggleSettingsPanel}
      >
        <Settings />
      </IconButton>
    </div>
  )
}
