import { Settings, Upload } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useSettings } from '../../hooks/use-settings'
import { useWorkspace } from '../../context/workspace-context'
import { ImportDialog } from '../import/ImportDialog'

export function SidebarFooter() {
  const { toggleSettingsPanel } = useSettings()
  const { state, dispatch } = useWorkspace()

  return (
    <>
      <div className="flex items-center justify-between h-12 px-4 flex-shrink-0">
        <IconButton
          size="md"
          label="Import pages"
          onClick={() => dispatch({ type: 'UI_SET', payload: { importDialogOpen: true } })}
        >
          <Upload />
        </IconButton>
        <IconButton
          size="md"
          label="Open settings"
          onClick={toggleSettingsPanel}
        >
          <Settings />
        </IconButton>
      </div>

      <ImportDialog open={state.ui.importDialogOpen} onClose={() => dispatch({ type: 'UI_SET', payload: { importDialogOpen: false } })} />
    </>
  )
}
