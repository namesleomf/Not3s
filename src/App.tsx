import { WorkspaceProvider } from './context/workspace-context'
import { ThemeProvider } from './context/theme-context'
import { AppShell } from './components/app-shell/AppShell'
import { TopBar } from './components/pages/TopBar'
import { PageHeader } from './components/pages/PageHeader'
import { CommandBar } from './components/editor/CommandBar'
import { NoPageSelected } from './components/pages/NoPageSelected'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { usePages } from './hooks/use-pages'

function MainContent() {
  const { selectedPage } = usePages()

  if (!selectedPage) {
    return (
      <>
        <TopBar />
        <NoPageSelected />
      </>
    )
  }

  return (
    <>
      <TopBar />
      <CommandBar />
      <div className="flex-1 overflow-y-auto bg-bg-page">
        <PageHeader />
        {/* Phase 6: BlockEditor will render here */}
        <div className="px-12 pb-32 max-w-[720px] mx-auto w-full">
          <p className="text-[13px] text-text-placeholder">
            Start typing or press / for commands...
          </p>
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    <WorkspaceProvider>
      <ThemeProvider>
        <AppShell>
          <MainContent />
        </AppShell>
        <SettingsPanel />
      </ThemeProvider>
    </WorkspaceProvider>
  )
}
