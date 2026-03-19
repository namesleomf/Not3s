import { X, Sun, Moon } from 'lucide-react'
import { useSettings } from '../../hooks/use-settings'
import { useTheme } from '../../hooks/use-theme'
import { IconButton } from '../ui/IconButton'
import { ToggleSwitch } from '../ui/ToggleSwitch'
import { Separator } from '../ui/Separator'
import type { UIDensity } from '../../types'

export function SettingsPanel() {
  const { settings, updateSettings, settingsOpen, toggleSettingsPanel } = useSettings()
  const { theme, setTheme } = useTheme()

  if (!settingsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 animate-[fadeIn_0.15s_ease]"
        onClick={toggleSettingsPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[360px] max-w-[90vw] bg-bg-overlay border-l border-separator shadow-lg animate-[slideInFromRight_0.2s_ease-out] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-5 border-b border-separator flex-shrink-0">
          <h2 className="text-[15px] font-semibold text-text-primary">Settings</h2>
          <IconButton size="md" label="Close settings" onClick={toggleSettingsPanel}>
            <X />
          </IconButton>
        </div>

        <div className="p-5 flex flex-col gap-6">
          {/* Theme */}
          <SettingsSection title="Appearance">
            <SettingsRow label="Theme">
              <div className="flex gap-2">
                <ThemeOption
                  label="Paper White"
                  icon={<Sun className="w-4 h-4" />}
                  active={theme === 'paper-white'}
                  onClick={() => setTheme('paper-white')}
                />
                <ThemeOption
                  label="OLED Black"
                  icon={<Moon className="w-4 h-4" />}
                  active={theme === 'oled-black'}
                  onClick={() => setTheme('oled-black')}
                />
              </div>
            </SettingsRow>

            <SettingsRow label="UI Density">
              <div className="flex gap-1">
                {(['compact', 'default', 'comfortable'] as UIDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateSettings({ uiDensity: d })}
                    className={`
                      h-7 px-3 text-[12px] font-medium capitalize
                      rounded-[var(--radius-md)] transition-theme
                      ${settings.uiDensity === d
                        ? 'bg-bg-selected text-accent'
                        : 'text-text-secondary hover:bg-bg-hover'
                      }
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </SettingsRow>

            <SettingsRow label="Font scale">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={settings.fontScale}
                  onChange={(e) => updateSettings({ fontScale: parseFloat(e.target.value) })}
                  className="flex-1 accent-accent h-1"
                />
                <span className="text-[12px] text-text-muted w-10 text-right font-mono">
                  {Math.round(settings.fontScale * 100)}%
                </span>
              </div>
            </SettingsRow>
          </SettingsSection>

          <Separator />

          {/* Sidebar */}
          <SettingsSection title="Sidebar">
            <SettingsRow label="Show metadata">
              <ToggleSwitch
                checked={settings.showSidebarMetadata}
                onChange={(v) => updateSettings({ showSidebarMetadata: v })}
              />
            </SettingsRow>
            <SettingsRow label="Translucent sidebar">
              <ToggleSwitch
                checked={settings.translucentSidebar}
                onChange={(v) => updateSettings({ translucentSidebar: v })}
              />
            </SettingsRow>
          </SettingsSection>

          <Separator />

          {/* Behavior */}
          <SettingsSection title="Behavior">
            <SettingsRow label="Confirm before delete">
              <ToggleSwitch
                checked={settings.confirmBeforeDelete}
                onChange={(v) => updateSettings({ confirmBeforeDelete: v })}
              />
            </SettingsRow>
            <SettingsRow label="Default view">
              <div className="flex gap-1">
                {(['recent', 'favorites', 'all'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => updateSettings({ defaultLandingView: v })}
                    className={`
                      h-7 px-3 text-[12px] font-medium capitalize
                      rounded-[var(--radius-md)] transition-theme
                      ${settings.defaultLandingView === v
                        ? 'bg-bg-selected text-accent'
                        : 'text-text-secondary hover:bg-bg-hover'
                      }
                    `}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </SettingsRow>
          </SettingsSection>
        </div>
      </div>
    </>
  )
}

// --- Sub-components ---

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[13px] text-text-primary">{label}</span>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function ThemeOption({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 h-9 px-4
        text-[13px] font-medium
        rounded-[var(--radius-lg)] transition-theme border
        ${active
          ? 'bg-bg-selected border-accent/30 text-accent'
          : 'bg-bg-hover border-transparent text-text-secondary hover:text-text-primary'
        }
      `}
    >
      {icon}
      {label}
    </button>
  )
}
