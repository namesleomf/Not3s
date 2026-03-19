import { useMemo } from 'react'
import {
  FileText,
  FilePlus,
  FilePlus2,
  FileDown,
  Copy,
  Trash2,
  ArchiveRestore,
  Archive,
  Pin,
  Star,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Quote,
  Code,
  Minus,
  AlertCircle,
  Settings,
  PanelLeft,
  Sun,
  Moon,
  Upload,
  Search,
  Heart,
  Clock,
} from 'lucide-react'
import type { Command } from '../lib/command-registry'
import { usePages } from './use-pages'
import { useSettings } from './use-settings'
import { useWorkspace } from '../context/workspace-context'
import { useEditorContext } from '../context/editor-context'
import { exportPageAsMarkdown, exportPageAsHTML } from '../lib/export'

export function useCommands(): Command[] {
  const { pages, selectedPage, create, duplicate, trash, restore, togglePin, toggleFavorite, toggleArchive, select } = usePages()
  const { settings, updateSettings, toggleSettingsPanel } = useSettings()
  const { dispatch } = useWorkspace()
  const editor = useEditorContext()

  return useMemo(() => {
    const cmds: Command[] = []
    const close = () => dispatch({ type: 'UI_TOGGLE_COMMAND_MENU' })

    // ── Page commands ──────────────────────────────────────────
    cmds.push({
      id: 'page-new',
      group: 'actions',
      title: 'New page',
      subtitle: 'Create a blank page',
      keywords: ['create', 'new', 'page', 'add'],
      icon: <FilePlus className="w-4 h-4" />,
      shortcut: '⌘N',
      run: () => { create(); close() },
    })

    if (selectedPage) {
      cmds.push({
        id: 'page-new-child',
        group: 'actions',
        title: 'New child page',
        subtitle: `Under "${selectedPage.title || 'Untitled'}"`,
        keywords: ['create', 'child', 'subpage', 'nested'],
        icon: <FilePlus2 className="w-4 h-4" />,
        run: () => { create({ parentId: selectedPage.id }); close() },
      })

      cmds.push({
        id: 'page-duplicate',
        group: 'actions',
        title: 'Duplicate page',
        subtitle: selectedPage.title || 'Untitled',
        keywords: ['copy', 'clone', 'duplicate'],
        icon: <Copy className="w-4 h-4" />,
        shortcut: '⇧⌘D',
        run: () => { duplicate(selectedPage.id); close() },
      })

      cmds.push({
        id: 'page-trash',
        group: 'actions',
        title: 'Move to trash',
        subtitle: selectedPage.title || 'Untitled',
        keywords: ['delete', 'remove', 'trash'],
        icon: <Trash2 className="w-4 h-4" />,
        run: () => { trash(selectedPage.id); close() },
      })

      cmds.push({
        id: 'page-toggle-pin',
        group: 'actions',
        title: selectedPage.isPinned ? 'Unpin page' : 'Pin page',
        keywords: ['pin', 'unpin', 'stick'],
        icon: <Pin className="w-4 h-4" />,
        run: () => { togglePin(selectedPage.id); close() },
      })

      cmds.push({
        id: 'page-toggle-favorite',
        group: 'actions',
        title: selectedPage.isFavorite ? 'Remove from favorites' : 'Add to favorites',
        keywords: ['favorite', 'star', 'like'],
        icon: <Star className="w-4 h-4" />,
        run: () => { toggleFavorite(selectedPage.id); close() },
      })

      cmds.push({
        id: 'page-toggle-archive',
        group: 'actions',
        title: selectedPage.isArchived ? 'Unarchive page' : 'Archive page',
        keywords: ['archive', 'unarchive'],
        icon: <Archive className="w-4 h-4" />,
        run: () => { toggleArchive(selectedPage.id); close() },
      })

      cmds.push({
        id: 'page-export-md',
        group: 'actions',
        title: 'Export as Markdown',
        subtitle: selectedPage.title || 'Untitled',
        keywords: ['export', 'markdown', 'md', 'download'],
        icon: <FileDown className="w-4 h-4" />,
        run: () => { exportPageAsMarkdown(selectedPage); close() },
      })

      cmds.push({
        id: 'page-export-html',
        group: 'actions',
        title: 'Export as HTML',
        subtitle: selectedPage.title || 'Untitled',
        keywords: ['export', 'html', 'download'],
        icon: <FileDown className="w-4 h-4" />,
        run: () => { exportPageAsHTML(selectedPage); close() },
      })
    }

    // Restore trashed pages
    const trashedPages = Object.values(pages).filter((p) => p.isTrashed)
    if (trashedPages.length > 0) {
      cmds.push({
        id: 'page-restore',
        group: 'actions',
        title: 'Restore from trash',
        subtitle: `${trashedPages.length} trashed page${trashedPages.length > 1 ? 's' : ''}`,
        keywords: ['restore', 'untrash', 'recover'],
        icon: <ArchiveRestore className="w-4 h-4" />,
        run: () => {
          dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'trash' } })
          close()
        },
      })
    }

    // ── Navigation commands ────────────────────────────────────
    cmds.push({
      id: 'nav-all',
      group: 'navigation',
      title: 'Go to All Notes',
      keywords: ['all', 'notes', 'pages', 'browse'],
      icon: <FileText className="w-4 h-4" />,
      run: () => { dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'all' } }); close() },
    })

    cmds.push({
      id: 'nav-favorites',
      group: 'navigation',
      title: 'Go to Favorites',
      keywords: ['favorites', 'starred', 'liked'],
      icon: <Heart className="w-4 h-4" />,
      run: () => { dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'favorites' } }); close() },
    })

    cmds.push({
      id: 'nav-pinned',
      group: 'navigation',
      title: 'Go to Pinned',
      keywords: ['pinned', 'sticky'],
      icon: <Pin className="w-4 h-4" />,
      run: () => { dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'pinned' } }); close() },
    })

    cmds.push({
      id: 'nav-trash',
      group: 'navigation',
      title: 'Go to Trash',
      keywords: ['trash', 'deleted', 'bin'],
      icon: <Trash2 className="w-4 h-4" />,
      run: () => { dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'trash' } }); close() },
    })

    cmds.push({
      id: 'nav-archived',
      group: 'navigation',
      title: 'Go to Archive',
      keywords: ['archive', 'archived'],
      icon: <Archive className="w-4 h-4" />,
      run: () => { dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'archived' } }); close() },
    })

    // ── Editor / Insert commands ───────────────────────────────
    if (editor) {
      const insertBlock = (type: string) => () => {
        editor.addBlock(type as Parameters<typeof editor.addBlock>[0], editor.focusedBlockId ?? undefined)
        close()
      }

      cmds.push(
        { id: 'insert-paragraph', group: 'insert', title: 'Text', subtitle: 'Plain text block', keywords: ['paragraph', 'text', 'plain', 'body'], icon: <Type className="w-4 h-4" />, run: insertBlock('paragraph') },
        { id: 'insert-h1', group: 'insert', title: 'Heading 1', subtitle: 'Large section heading', keywords: ['h1', 'heading', 'title', 'large'], icon: <Heading1 className="w-4 h-4" />, run: insertBlock('heading1') },
        { id: 'insert-h2', group: 'insert', title: 'Heading 2', subtitle: 'Medium section heading', keywords: ['h2', 'heading', 'subtitle', 'medium'], icon: <Heading2 className="w-4 h-4" />, run: insertBlock('heading2') },
        { id: 'insert-h3', group: 'insert', title: 'Heading 3', subtitle: 'Small section heading', keywords: ['h3', 'heading', 'small'], icon: <Heading3 className="w-4 h-4" />, run: insertBlock('heading3') },
        { id: 'insert-bullet', group: 'insert', title: 'Bullet list', subtitle: 'Unordered list item', keywords: ['bullet', 'list', 'unordered', 'ul'], icon: <List className="w-4 h-4" />, run: insertBlock('bullet-list') },
        { id: 'insert-numbered', group: 'insert', title: 'Numbered list', subtitle: 'Ordered list item', keywords: ['numbered', 'list', 'ordered', 'ol', '1'], icon: <ListOrdered className="w-4 h-4" />, run: insertBlock('numbered-list') },
        { id: 'insert-todo', group: 'insert', title: 'Checklist', subtitle: 'To-do with checkbox', keywords: ['todo', 'checklist', 'checkbox', 'task'], icon: <CheckSquare className="w-4 h-4" />, run: insertBlock('todo') },
        { id: 'insert-quote', group: 'insert', title: 'Quote', subtitle: 'Block quotation', keywords: ['quote', 'blockquote', 'cite'], icon: <Quote className="w-4 h-4" />, run: insertBlock('quote') },
        { id: 'insert-code', group: 'insert', title: 'Code block', subtitle: 'Monospace code', keywords: ['code', 'pre', 'monospace', 'snippet'], icon: <Code className="w-4 h-4" />, run: insertBlock('code') },
        { id: 'insert-divider', group: 'insert', title: 'Divider', subtitle: 'Horizontal rule', keywords: ['divider', 'hr', 'separator', 'line'], icon: <Minus className="w-4 h-4" />, run: insertBlock('divider') },
        { id: 'insert-callout', group: 'insert', title: 'Callout', subtitle: 'Highlighted notice', keywords: ['callout', 'alert', 'notice', 'info', 'warning'], icon: <AlertCircle className="w-4 h-4" />, run: insertBlock('callout') },
      )
    }

    // ── Settings / system commands ─────────────────────────────
    cmds.push({
      id: 'settings-open',
      group: 'settings',
      title: 'Open Settings',
      keywords: ['settings', 'preferences', 'config', 'options'],
      icon: <Settings className="w-4 h-4" />,
      shortcut: '⌘,',
      run: () => { toggleSettingsPanel(); close() },
    })

    cmds.push({
      id: 'settings-toggle-sidebar',
      group: 'settings',
      title: settings.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar',
      keywords: ['sidebar', 'panel', 'toggle', 'collapse', 'expand'],
      icon: <PanelLeft className="w-4 h-4" />,
      shortcut: '⌘\\',
      run: () => { updateSettings({ sidebarCollapsed: !settings.sidebarCollapsed }); close() },
    })

    cmds.push({
      id: 'settings-theme-toggle',
      group: 'settings',
      title: settings.theme === 'paper-white' ? 'Switch to OLED Black' : 'Switch to Paper White',
      keywords: ['theme', 'dark', 'light', 'mode', 'oled', 'paper', 'appearance'],
      icon: settings.theme === 'paper-white' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />,
      run: () => {
        updateSettings({ theme: settings.theme === 'paper-white' ? 'oled-black' : 'paper-white' })
        close()
      },
    })

    cmds.push({
      id: 'settings-import',
      group: 'settings',
      title: 'Import file',
      subtitle: 'Markdown, HTML, PDF, CSV',
      keywords: ['import', 'upload', 'file', 'markdown', 'html', 'pdf', 'csv'],
      icon: <Upload className="w-4 h-4" />,
      run: () => {
        dispatch({ type: 'UI_SET', payload: { importDialogOpen: true } })
        close()
      },
    })

    cmds.push({
      id: 'nav-search',
      group: 'navigation',
      title: 'Focus sidebar search',
      keywords: ['search', 'find', 'filter', 'focus'],
      icon: <Search className="w-4 h-4" />,
      run: () => {
        close()
        requestAnimationFrame(() => {
          const el = document.querySelector<HTMLInputElement>('[data-sidebar-search]')
          el?.focus()
        })
      },
    })

    cmds.push({
      id: 'nav-recent',
      group: 'navigation',
      title: 'Go to Recent',
      keywords: ['recent', 'latest', 'last'],
      icon: <Clock className="w-4 h-4" />,
      run: () => {
        dispatch({ type: 'UI_SET_FILTER', payload: { filter: 'all' } })
        dispatch({ type: 'UI_SET_SORT', payload: { field: 'updatedAt', direction: 'desc' } })
        close()
      },
    })

    // ── Page results (as navigable commands) ───────────────────
    const allPages = Object.values(pages).filter((p) => !p.isTrashed)
    for (const page of allPages.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)) {
      cmds.push({
        id: `page-open-${page.id}`,
        group: 'pages',
        title: page.title || 'Untitled',
        subtitle: page.tags.length > 0 ? page.tags.join(', ') : undefined,
        keywords: [page.title.toLowerCase(), ...page.tags.map((t) => t.toLowerCase())],
        icon: page.icon ? <span className="text-[14px] leading-none">{page.icon}</span> : <FileText className="w-4 h-4" />,
        run: () => { select(page.id); close() },
      })
    }

    return cmds
  }, [pages, selectedPage, settings, editor, create, duplicate, trash, restore, togglePin, toggleFavorite, toggleArchive, select, dispatch, updateSettings, toggleSettingsPanel])
}
