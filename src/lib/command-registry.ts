import type { ReactNode } from 'react'

export type CommandGroup = 'pages' | 'actions' | 'insert' | 'navigation' | 'settings'

export interface Command {
  id: string
  group: CommandGroup
  title: string
  subtitle?: string
  keywords: string[]
  icon?: ReactNode
  shortcut?: string
  run: () => void
}

export const GROUP_LABELS: Record<CommandGroup, string> = {
  pages: 'Pages',
  actions: 'Actions',
  insert: 'Insert',
  navigation: 'Navigation',
  settings: 'Settings',
}

export const GROUP_ORDER: CommandGroup[] = ['pages', 'actions', 'insert', 'navigation', 'settings']

export function filterCommands(commands: Command[], query: string): Command[] {
  if (!query.trim()) return commands
  const q = query.toLowerCase()
  return commands.filter((cmd) => {
    if (cmd.title.toLowerCase().includes(q)) return true
    if (cmd.subtitle?.toLowerCase().includes(q)) return true
    return cmd.keywords.some((kw) => kw.includes(q))
  })
}

export function groupCommands(commands: Command[], hasQuery: boolean): { group: CommandGroup; label: string; items: Command[] }[] {
  const grouped: { group: CommandGroup; label: string; items: Command[] }[] = []
  for (const g of GROUP_ORDER) {
    let items = commands.filter((c) => c.group === g)
    // Limit page results when browsing (no query) to keep the palette compact
    if (g === 'pages' && !hasQuery) {
      items = items.slice(0, 8)
    }
    if (items.length > 0) {
      grouped.push({ group: g, label: GROUP_LABELS[g], items })
    }
  }
  return grouped
}
