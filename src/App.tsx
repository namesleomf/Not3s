'use client'

import { WorkspaceProvider } from './context/workspace-context'
import { ThemeProvider } from './context/theme-context'
import { EditorProvider } from './context/editor-context'
import { AppShell } from './components/app-shell/AppShell'
import { TopBar } from './components/pages/TopBar'
import { PageHeader } from './components/pages/PageHeader'
import { CommandBar } from './components/editor/CommandBar'
import { BlockEditor } from './components/editor/BlockEditor'
import { NoPageSelected } from './components/pages/NoPageSelected'
import { TrashView } from './components/pages/TrashView'
import { ArchiveView } from './components/pages/ArchiveView'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { CommandPalette } from './components/editor/CommandPalette'
import { usePages } from './hooks/use-pages'
import { useSearch } from './hooks/use-search'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { useBlockEditor } from './hooks/use-block-editor'
import { BacklinksPanel } from './components/editor/BacklinksPanel'
import { PageOutline } from './components/editor/PageOutline'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

function EditorView() {
  const editor = useBlockEditor()

  return (
    <EditorProvider value={editor}>
      <CommandBar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-bg-page">
          <PageHeader />
          <div className="px-3 sm:px-8 md:px-12 pb-16 sm:pb-32 max-w-[720px] mx-auto w-full">
            <ErrorBoundary fallbackMessage="Editor encountered an error">
              <BlockEditor />
            </ErrorBoundary>
            <BacklinksPanel />
          </div>
        </div>
        <PageOutline />
      </div>
    </EditorProvider>
  )
}

function MainContent() {
  const { selectedPage } = usePages()
  const { activeFilter } = useSearch()
  useKeyboardShortcuts()

  // Trash view
  if (activeFilter === 'trash') {
    return (
      <>
        <TopBar />
        <TrashView />
      </>
    )
  }

  // Archive view
  if (activeFilter === 'archived') {
    return (
      <>
        <TopBar />
        <ArchiveView />
      </>
    )
  }

  // No page selected
  if (!selectedPage) {
    return (
      <>
        <TopBar />
        <NoPageSelected />
      </>
    )
  }

  // Page editor view
  return (
    <>
      <TopBar />
      <EditorView />
    </>
  )
}

export default function App() {
  return (
    <WorkspaceProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <AppShell>
            <MainContent />
          </AppShell>
        </ErrorBoundary>
        <SettingsPanel />
        <CommandPalette />
      </ThemeProvider>
    </WorkspaceProvider>
  )
}
