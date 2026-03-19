import { nanoid } from 'nanoid'
import type { Block, Page } from '../types'

export function createBlock(
  type: Block['type'] = 'paragraph',
  content = '',
  metadata: Record<string, unknown> = {},
): Block {
  return {
    id: nanoid(),
    type,
    content,
    metadata,
    children: [],
    order: 0,
  }
}

export function createPage(overrides: Partial<Page> = {}): Page {
  const now = Date.now()
  return {
    id: nanoid(),
    title: '',
    icon: null,
    coverImage: null,
    parentId: null,
    childrenIds: [],
    blocks: [createBlock('paragraph')],
    tags: [],
    linkedPageIds: [],
    backlinks: [],
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    trashedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function duplicatePage(page: Page): Page {
  const now = Date.now()
  const newId = nanoid()
  return {
    ...page,
    id: newId,
    title: `${page.title || 'Untitled'} (copy)`,
    childrenIds: [], // don't deep-copy children
    backlinks: [],
    isPinned: false,
    isFavorite: false,
    isTrashed: false,
    trashedAt: null,
    createdAt: now,
    updatedAt: now,
    blocks: page.blocks.map((block) => ({
      ...block,
      id: nanoid(),
      children: block.children.map((child) => ({ ...child, id: nanoid() })),
    })),
  }
}

/** Build a flat list of root page IDs (pages with no parent or whose parent doesn't exist) */
export function getRootPageIds(pages: Record<string, Page>): string[] {
  return Object.values(pages)
    .filter((p) => !p.isTrashed && (!p.parentId || !pages[p.parentId]))
    .map((p) => p.id)
}

/** Get all unique tags across all pages */
export function getAllTags(pages: Record<string, Page>): string[] {
  const tagSet = new Set<string>()
  for (const page of Object.values(pages)) {
    if (!page.isTrashed) {
      for (const tag of page.tags) {
        tagSet.add(tag)
      }
    }
  }
  return Array.from(tagSet).sort()
}

/** Extract plain text from blocks for search */
export function getPagePlainText(page: Page): string {
  const texts: string[] = [page.title]
  for (const block of page.blocks) {
    texts.push(stripHtml(block.content))
    for (const child of block.children) {
      texts.push(stripHtml(child.content))
    }
  }
  return texts.join(' ').toLowerCase()
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}
