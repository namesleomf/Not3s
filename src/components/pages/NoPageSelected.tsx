import { FileText, Plus } from 'lucide-react'
import { EmptyState } from '../ui/EmptyState'
import { Button } from '../ui/Button'
import { usePages } from '../../hooks/use-pages'

export function NoPageSelected() {
  const { create } = usePages()

  return (
    <div className="flex-1 flex items-center justify-center">
      <EmptyState
        icon={<FileText />}
        title="Select a page"
        description="Choose a page from the sidebar or create a new one to get started."
        action={
          <Button variant="primary" size="md" onClick={() => create()}>
            <Plus className="w-4 h-4" />
            New page
          </Button>
        }
      />
    </div>
  )
}
