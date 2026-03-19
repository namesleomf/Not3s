import {
  Menu,
  MoreHorizontal,
  Star,
  Pin,
  Copy,
  Archive,
  Trash2,
  PanelLeft,
} from 'lucide-react'
import { IconButton } from '../ui/IconButton'
import { Dropdown, DropdownItem } from '../ui/Dropdown'
import { Separator } from '../ui/Separator'
import { usePages } from '../../hooks/use-pages'
import { useSettings } from '../../hooks/use-settings'
import { useResponsive } from '../../hooks/use-responsive'
import { useWorkspace } from '../../context/workspace-context'
import { Breadcrumb } from './Breadcrumb'

export function TopBar() {
  const { selectedPage, togglePin, toggleFavorite, toggleArchive, duplicate, trash } = usePages()
  const { settings, updateSettings } = useSettings()
  const { isMobile } = useResponsive()
  const { dispatch } = useWorkspace()

  return (
    <div className="flex items-center h-12 px-3 flex-shrink-0 border-b border-separator">
      {/* Left side */}
      <div className="flex items-center gap-1">
        {isMobile ? (
          <IconButton
            size="md"
            label="Open sidebar"
            onClick={() => dispatch({ type: 'UI_TOGGLE_SIDEBAR_MOBILE' })}
          >
            <Menu />
          </IconButton>
        ) : settings.sidebarCollapsed ? (
          <IconButton
            size="md"
            label="Expand sidebar"
            onClick={() => updateSettings({ sidebarCollapsed: false })}
          >
            <PanelLeft />
          </IconButton>
        ) : null}

        {selectedPage && (
          <div className="flex items-center gap-1 ml-1 min-w-0">
            {selectedPage.parentId && <Breadcrumb pageId={selectedPage.id} />}
            {selectedPage.icon && (
              <span className="text-[14px]">{selectedPage.icon}</span>
            )}
            <span className="text-[13px] text-text-secondary truncate max-w-[200px]">
              {selectedPage.title || 'Untitled'}
            </span>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side — page actions */}
      {selectedPage && (
        <div className="flex items-center gap-0.5">
          <IconButton
            size="sm"
            label={selectedPage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            active={selectedPage.isFavorite}
            onClick={() => toggleFavorite(selectedPage.id)}
          >
            <Star className={selectedPage.isFavorite ? 'fill-current' : ''} />
          </IconButton>

          <IconButton
            size="sm"
            label={selectedPage.isPinned ? 'Unpin' : 'Pin'}
            active={selectedPage.isPinned}
            onClick={() => togglePin(selectedPage.id)}
          >
            <Pin className={selectedPage.isPinned ? 'fill-current' : ''} />
          </IconButton>

          <Dropdown
            trigger={
              <IconButton size="sm" label="More actions">
                <MoreHorizontal />
              </IconButton>
            }
            align="right"
          >
            <DropdownItem
              icon={<Copy />}
              onClick={() => duplicate(selectedPage.id)}
            >
              Duplicate
            </DropdownItem>
            <DropdownItem
              icon={<Archive />}
              onClick={() => toggleArchive(selectedPage.id)}
            >
              Archive
            </DropdownItem>
            <Separator className="my-1" />
            <DropdownItem
              icon={<Trash2 />}
              danger
              onClick={() => trash(selectedPage.id)}
            >
              Move to trash
            </DropdownItem>
          </Dropdown>
        </div>
      )}
    </div>
  )
}
