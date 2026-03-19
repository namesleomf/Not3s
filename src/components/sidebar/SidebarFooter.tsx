import { useState } from 'react'
import { Settings, Upload } from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { useSettings } from '../../hooks/use-settings'
import { ImportDialog } from '../import/ImportDialog'

export function SidebarFooter() {
  const { toggleSettingsPanel } = useSettings()
  const [importOpen, setImportOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between h-12 px-4 flex-shrink-0">
        <IconButton
          size="md"
          label="Import pages"
          onClick={() => setImportOpen(true)}
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

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}
