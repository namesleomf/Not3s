import { X, Sun, Moon, Palette, PanelLeft, SlidersHorizontal } from 'lucide-react'
import { useSettings } from '../../hooks/use-settings'
import { useTheme } from '../../hooks/use-theme'
import { IconButton } from '../ui/IconButton'
import { ToggleSwitch } from '../ui/ToggleSwitch'
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
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] max-w-[90vw] bg-bg-overlay border-l border-border shadow-float animate-[slideInFromRight_0.2s_ease-out] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-6 border-b border-separator flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-text-primary">Settings</h2>
          <IconButton size="md" label="Close settings" onClick={toggleSettingsPanel}>
            <X />
          </IconButton>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Appearance */}
          <SettingsCard icon={<Palette className="w-4 h-4" />} title="Appearance">
            <SettingsRow label="Theme">
              <div className="flex gap-2">
                <ThemeCard
                  label="Paper White"
                  icon={<Sun className="w-4 h-4" />}
                  active={theme === 'paper-white'}
                  onClick={() => setTheme('paper-white')}
                  previewBg="#ffffff"
                  previewText="#1a1a1a"
                  previewAccent="#f2f1ef"
                />
                <ThemeCard
                  label="OLED Black"
                  icon={<Moon className="w-4 h-4" />}
                  active={theme === 'oled-black'}
                  onClick={() => setTheme('oled-black')}
                  previewBg="#111111"
                  previewText="#e8e8e8"
                  previewAccent="#1a1a1a"
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
                      h-8 px-3.5 text-[12px] font-medium capitalize
                      rounded-[var(--radius-pill)] transition-theme
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
                <span
                  className="text-text-muted w-10 text-right font-mono transition-all"
                  style={{ fontSize: `${Math.round(settings.fontScale * 12)}px` }}
                >
                  {Math.round(settings.fontScale * 100)}%
                </span>
              </div>
            </SettingsRow>
          </SettingsCard>

          {/* Sidebar */}
          <SettingsCard icon={<PanelLeft className="w-4 h-4" />} title="Sidebar">
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
          </SettingsCard>

          {/* Behavior */}
          <SettingsCard icon={<SlidersHorizontal className="w-4 h-4" />} title="Behavior">
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
                      h-8 px-3.5 text-[12px] font-medium capitalize
                      rounded-[var(--radius-pill)] transition-theme
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
          </SettingsCard>
        </div>
      </div>
    </>
  )
}

// --- Sub-components ---

function SettingsCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-inset rounded-[var(--radius-xl)] p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-text-muted">{icon}</span>
        <h3 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </h3>
      </div>
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

function ThemeCard({
  label,
  icon,
  active,
  onClick,
  previewBg,
  previewText,
  previewAccent,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  previewBg: string
  previewText: string
  previewAccent: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-3 min-w-[110px]
        text-[12px] font-medium
        rounded-[var(--radius-xl)] transition-theme border
        ${active
          ? 'border-accent/40 shadow-sm'
          : 'border-transparent hover:border-border'
        }
      `}
    >
      {/* Theme preview mini */}
      <div
        className="w-full h-[48px] rounded-[var(--radius-lg)] border border-border/50 overflow-hidden flex flex-col"
        style={{ backgroundColor: previewBg }}
      >
        <div className="h-2.5" style={{ backgroundColor: previewAccent }} />
        <div className="flex-1 flex items-center justify-center gap-1 px-2">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: previewText, opacity: 0.6 }} />
          <div className="w-5 h-1 rounded-full" style={{ backgroundColor: previewText, opacity: 0.3 }} />
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={active ? 'text-accent' : 'text-text-muted'}>{icon}</span>
        <span className={active ? 'text-accent' : 'text-text-secondary'}>{label}</span>
      </div>
    </button>
  )
}
