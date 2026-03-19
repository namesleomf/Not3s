import { WorkspaceProvider } from './context/workspace-context'
import { ThemeProvider } from './context/theme-context'

export default function App() {
  return (
    <WorkspaceProvider>
      <ThemeProvider>
        <div className="h-screen w-screen">
          {/* Phase 4: AppShell will render here */}
          <div className="flex h-full items-center justify-center text-[var(--color-text-secondary)]">
            <p className="text-sm">Not3s — workspace loading...</p>
          </div>
        </div>
      </ThemeProvider>
    </WorkspaceProvider>
  )
}
