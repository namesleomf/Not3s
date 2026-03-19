import type { Block } from '../types'
import { createBlock } from './page-utils'

// ============================================================
// Import Parsers — Markdown, HTML, PDF
// ============================================================

export interface ParsedPage {
  title: string
  blocks: Block[]
  tags: string[]
}

// ---- Inline formatting ----

function formatInline(text: string): string {
  return (
    text
      // Bold: **text** or __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_ (but not inside words with underscores)
      .replace(/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '<em>$1</em>')
      .replace(/(?<!\w)_(?!\s)(.+?)(?<!\s)_(?!\w)/g, '<em>$1</em>')
      // Strikethrough: ~~text~~
      .replace(/~~(.+?)~~/g, '<s>$1</s>')
      // Inline code: `text`
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Images inline: ![alt](url) — convert to text reference
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[$1]')
      // Obsidian wikilinks: [[Page Name]] or [[Page Name|Display]]
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<strong>$2</strong>')
      .replace(/\[\[([^\]]+)\]\]/g, '<strong>$1</strong>')
  )
}

// ---- YAML frontmatter parser ----

interface Frontmatter {
  title?: string
  tags?: string[]
}

function parseFrontmatter(text: string): { frontmatter: Frontmatter; body: string } {
  if (!text.startsWith('---')) {
    return { frontmatter: {}, body: text }
  }

  const endIdx = text.indexOf('\n---', 3)
  if (endIdx === -1) {
    return { frontmatter: {}, body: text }
  }

  const yamlBlock = text.slice(4, endIdx)
  const body = text.slice(endIdx + 4).trimStart()
  const frontmatter: Frontmatter = {}

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim()

    // title: value
    const titleMatch = trimmed.match(/^title:\s*["']?(.+?)["']?\s*$/)
    if (titleMatch) {
      frontmatter.title = titleMatch[1]
    }

    // tags: [tag1, tag2] (inline array)
    const tagsInlineMatch = trimmed.match(/^tags:\s*\[(.+)\]\s*$/)
    if (tagsInlineMatch) {
      frontmatter.tags = tagsInlineMatch[1]
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    }

    // tags: single value or start of list
    if (trimmed.match(/^tags:\s*$/)) {
      frontmatter.tags = []
    }

    // - tag (list item under tags)
    if (frontmatter.tags && trimmed.match(/^-\s+/)) {
      const tag = trimmed.replace(/^-\s+/, '').replace(/^["']|["']$/g, '').trim()
      if (tag) frontmatter.tags.push(tag)
    }
  }

  return { frontmatter, body }
}

// ---- Extract inline #tags (Obsidian) ----

function extractInlineTags(text: string): { cleaned: string; tags: string[] } {
  const tags: string[] = []
  const cleaned = text.replace(/(?:^|\s)#([a-zA-Z][\w-/]*)/g, (match, tag) => {
    tags.push(tag)
    return match.startsWith(' ') ? ' ' : ''
  })
  return { cleaned: cleaned.trim(), tags }
}

// ============================================================
// Markdown Parser
// ============================================================

export function parseMarkdown(text: string, filename: string): ParsedPage {
  const { frontmatter, body } = parseFrontmatter(text)
  const lines = body.split('\n')
  const blocks: Block[] = []
  const tags: string[] = [...(frontmatter.tags ?? [])]
  let firstHeading: string | null = null
  let order = 0

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    const codeMatch = line.match(/^```(\w*)/)
    if (codeMatch) {
      const language = codeMatch[1] || ''
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // skip closing ```
      blocks.push({
        ...createBlock('code', codeLines.join('\n'), { language }),
        order: order++,
      })
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3
      const type = (`heading${level}` as const)
      const rawText = headingMatch[2]
      const { cleaned, tags: inlineTags } = extractInlineTags(rawText)
      tags.push(...inlineTags)
      if (!firstHeading && level === 1) firstHeading = cleaned
      blocks.push({
        ...createBlock(type, formatInline(cleaned)),
        order: order++,
      })
      i++
      continue
    }

    // Divider
    if (line.match(/^---+\s*$/) || line.match(/^\*\*\*+\s*$/) || line.match(/^___+\s*$/)) {
      blocks.push({ ...createBlock('divider', ''), order: order++ })
      i++
      continue
    }

    // Todo items
    const todoMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)/)
    if (todoMatch) {
      const checked = todoMatch[1] !== ' '
      const { cleaned, tags: inlineTags } = extractInlineTags(todoMatch[2])
      tags.push(...inlineTags)
      blocks.push({
        ...createBlock('todo', formatInline(cleaned), { checked }),
        order: order++,
      })
      i++
      continue
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*]\s+(.+)/)
    if (bulletMatch) {
      const { cleaned, tags: inlineTags } = extractInlineTags(bulletMatch[1])
      tags.push(...inlineTags)
      blocks.push({
        ...createBlock('bullet-list', formatInline(cleaned)),
        order: order++,
      })
      i++
      continue
    }

    // Numbered list
    const numberedMatch = line.match(/^\d+\.\s+(.+)/)
    if (numberedMatch) {
      const { cleaned, tags: inlineTags } = extractInlineTags(numberedMatch[1])
      tags.push(...inlineTags)
      blocks.push({
        ...createBlock('numbered-list', formatInline(cleaned)),
        order: order++,
      })
      i++
      continue
    }

    // Blockquote (accumulate consecutive > lines)
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      const quoteText = quoteLines.join('\n')
      const { cleaned, tags: inlineTags } = extractInlineTags(quoteText)
      tags.push(...inlineTags)
      blocks.push({
        ...createBlock('quote', formatInline(cleaned)),
        order: order++,
      })
      continue
    }

    // Image
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imageMatch) {
      blocks.push({
        ...createBlock('image', '', { src: imageMatch[2], alt: imageMatch[1] }),
        order: order++,
      })
      i++
      continue
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Paragraph (default)
    const { cleaned, tags: inlineTags } = extractInlineTags(line)
    tags.push(...inlineTags)
    blocks.push({
      ...createBlock('paragraph', formatInline(cleaned)),
      order: order++,
    })
    i++
  }

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push({ ...createBlock('paragraph', ''), order: 0 })
  }

  // Deduplicate tags
  const uniqueTags = [...new Set(tags)]

  // Title priority: frontmatter > first # heading > filename
  const title =
    frontmatter.title ||
    firstHeading ||
    filename.replace(/\.\w+$/, '')

  return { title, blocks, tags: uniqueTags }
}

// ============================================================
// HTML Parser
// ============================================================

const SAFE_INLINE_TAGS = new Set(['STRONG', 'B', 'EM', 'I', 'CODE', 'A', 'S', 'U', 'DEL', 'MARK', 'SUB', 'SUP'])

function sanitizeInlineHTML(el: Element): string {
  let html = ''
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      html += node.textContent ?? ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element
      if (SAFE_INLINE_TAGS.has(child.tagName)) {
        const tag = child.tagName.toLowerCase()
        // Map <b> to <strong>, <i> to <em>, <del> to <s>
        const mapped = tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag === 'del' ? 's' : tag
        if (child.tagName === 'A') {
          const href = child.getAttribute('href') ?? ''
          html += `<a href="${href}">${sanitizeInlineHTML(child)}</a>`
        } else {
          html += `<${mapped}>${sanitizeInlineHTML(child)}</${mapped}>`
        }
      } else {
        // Unwrap: keep text content
        html += sanitizeInlineHTML(child)
      }
    }
  }
  return html
}

function getTextContent(el: Element): string {
  return el.textContent?.trim() ?? ''
}

function walkDOMToBlocks(elements: Element[], blocks: Block[], orderRef: { value: number }) {
  for (const el of elements) {
    const tag = el.tagName

    // Headings
    if (tag === 'H1' || tag === 'H2' || tag === 'H3') {
      const level = parseInt(tag[1]) as 1 | 2 | 3
      blocks.push({
        ...createBlock(`heading${level}` as const, sanitizeInlineHTML(el)),
        order: orderRef.value++,
      })
      continue
    }
    if (tag === 'H4' || tag === 'H5' || tag === 'H6') {
      blocks.push({
        ...createBlock('heading3', sanitizeInlineHTML(el)),
        order: orderRef.value++,
      })
      continue
    }

    // Paragraph
    if (tag === 'P') {
      const content = sanitizeInlineHTML(el)
      if (content.trim()) {
        blocks.push({
          ...createBlock('paragraph', content),
          order: orderRef.value++,
        })
      }
      continue
    }

    // Lists
    if (tag === 'UL') {
      for (const li of Array.from(el.children)) {
        if (li.tagName === 'LI') {
          // Check for Notion-style todo (checkbox input)
          const checkbox = li.querySelector('input[type="checkbox"]')
          if (checkbox) {
            const checked = (checkbox as HTMLInputElement).checked
            // Remove the checkbox from content
            const clone = li.cloneNode(true) as Element
            clone.querySelector('input[type="checkbox"]')?.remove()
            blocks.push({
              ...createBlock('todo', sanitizeInlineHTML(clone), { checked }),
              order: orderRef.value++,
            })
          } else {
            blocks.push({
              ...createBlock('bullet-list', sanitizeInlineHTML(li)),
              order: orderRef.value++,
            })
          }
        }
      }
      continue
    }

    if (tag === 'OL') {
      for (const li of Array.from(el.children)) {
        if (li.tagName === 'LI') {
          blocks.push({
            ...createBlock('numbered-list', sanitizeInlineHTML(li)),
            order: orderRef.value++,
          })
        }
      }
      continue
    }

    // Blockquote
    if (tag === 'BLOCKQUOTE') {
      blocks.push({
        ...createBlock('quote', sanitizeInlineHTML(el)),
        order: orderRef.value++,
      })
      continue
    }

    // Code block
    if (tag === 'PRE') {
      const codeEl = el.querySelector('code')
      const content = codeEl ? codeEl.textContent ?? '' : el.textContent ?? ''
      const langClass = codeEl?.className.match(/language-(\w+)/)
      blocks.push({
        ...createBlock('code', content, { language: langClass?.[1] ?? '' }),
        order: orderRef.value++,
      })
      continue
    }

    // Horizontal rule
    if (tag === 'HR') {
      blocks.push({ ...createBlock('divider', ''), order: orderRef.value++ })
      continue
    }

    // Image
    if (tag === 'IMG') {
      const src = el.getAttribute('src') ?? ''
      const alt = el.getAttribute('alt') ?? ''
      if (src) {
        blocks.push({
          ...createBlock('image', '', { src, alt }),
          order: orderRef.value++,
        })
      }
      continue
    }

    // Figure (common in Notion exports)
    if (tag === 'FIGURE') {
      const img = el.querySelector('img')
      if (img) {
        blocks.push({
          ...createBlock('image', '', {
            src: img.getAttribute('src') ?? '',
            alt: img.getAttribute('alt') ?? '',
          }),
          order: orderRef.value++,
        })
      }
      continue
    }

    // Table — serialize as text
    if (tag === 'TABLE') {
      const rows: string[] = []
      for (const tr of Array.from(el.querySelectorAll('tr'))) {
        const cells = Array.from(tr.querySelectorAll('th, td')).map(
          (c) => c.textContent?.trim() ?? '',
        )
        rows.push(cells.join(' | '))
      }
      if (rows.length > 0) {
        blocks.push({
          ...createBlock('paragraph', rows.join('<br>')),
          order: orderRef.value++,
        })
      }
      continue
    }

    // Div — Notion uses divs extensively; check for todo pattern then recurse
    if (tag === 'DIV' || tag === 'SECTION' || tag === 'ARTICLE' || tag === 'MAIN') {
      // Notion to-do: div with class containing "to_do" or with checkbox
      const checkbox = el.querySelector(':scope > input[type="checkbox"], :scope > label > input[type="checkbox"]')
      if (checkbox) {
        const checked = (checkbox as HTMLInputElement).checked ||
          el.classList.contains('to-do-checked') ||
          el.getAttribute('data-checked') === 'true'
        const clone = el.cloneNode(true) as Element
        clone.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.remove())
        const content = sanitizeInlineHTML(clone).trim()
        if (content) {
          blocks.push({
            ...createBlock('todo', content, { checked }),
            order: orderRef.value++,
          })
          continue
        }
      }

      // Recurse into children
      walkDOMToBlocks(Array.from(el.children), blocks, orderRef)
      continue
    }

    // Fallback: if element has text, make a paragraph
    const text = getTextContent(el)
    if (text) {
      blocks.push({
        ...createBlock('paragraph', sanitizeInlineHTML(el)),
        order: orderRef.value++,
      })
    }
  }
}

export function parseHTML(html: string, filename: string): ParsedPage {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Title: <title> > first <h1> > filename
  const titleEl = doc.querySelector('title')
  const firstH1 = doc.querySelector('h1')
  const title =
    titleEl?.textContent?.trim() ||
    firstH1?.textContent?.trim() ||
    filename.replace(/\.\w+$/, '')

  // Find content container: Notion uses <article> or specific classes
  const contentRoot =
    doc.querySelector('article') ??
    doc.querySelector('.page-body') ??
    doc.querySelector('[class*="notion"]') ??
    doc.body

  const blocks: Block[] = []
  const orderRef = { value: 0 }

  walkDOMToBlocks(Array.from(contentRoot.children), blocks, orderRef)

  // If first heading matches title, remove it to avoid duplication
  if (
    blocks.length > 0 &&
    blocks[0].type.startsWith('heading') &&
    blocks[0].content.replace(/<[^>]*>/g, '').trim().toLowerCase() === title.toLowerCase()
  ) {
    blocks.shift()
    blocks.forEach((b, i) => (b.order = i))
  }

  if (blocks.length === 0) {
    blocks.push({ ...createBlock('paragraph', ''), order: 0 })
  }

  return { title, blocks, tags: [] }
}

// ============================================================
// PDF Parser
// ============================================================

export async function parsePDF(
  arrayBuffer: ArrayBuffer,
  filename: string,
): Promise<ParsedPage> {
  const pdfjsLib = await import('pdfjs-dist')

  // Set worker source to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const blocks: Block[] = []
  let order = 0

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    // Group text items into lines based on y-position
    const lines: { y: number; text: string; fontSize: number }[] = []
    let currentLine = { y: -1, text: '', fontSize: 0 }

    for (const item of textContent.items) {
      if (!('str' in item)) continue
      const y = Math.round(item.transform[5])
      const fontSize = Math.abs(item.transform[0])

      if (Math.abs(y - currentLine.y) < 2 && currentLine.y !== -1) {
        currentLine.text += item.str
        currentLine.fontSize = Math.max(currentLine.fontSize, fontSize)
      } else {
        if (currentLine.text.trim()) {
          lines.push({ ...currentLine })
        }
        currentLine = { y, text: item.str, fontSize }
      }
    }
    if (currentLine.text.trim()) {
      lines.push({ ...currentLine })
    }

    // Determine median font size to detect headings
    const fontSizes = lines.map((l) => l.fontSize).filter((f) => f > 0)
    const medianFontSize = fontSizes.length > 0
      ? fontSizes.sort((a, b) => a - b)[Math.floor(fontSizes.length / 2)]
      : 12

    // Convert lines to blocks
    let paragraph = ''
    for (const line of lines) {
      if (line.fontSize > medianFontSize * 1.3) {
        // Flush paragraph
        if (paragraph.trim()) {
          blocks.push({ ...createBlock('paragraph', paragraph.trim()), order: order++ })
          paragraph = ''
        }
        // This looks like a heading
        const headingType = line.fontSize > medianFontSize * 1.6 ? 'heading1' : 'heading2'
        blocks.push({
          ...createBlock(headingType, line.text.trim()),
          order: order++,
        })
      } else if (line.text.trim() === '') {
        // Empty line — flush paragraph
        if (paragraph.trim()) {
          blocks.push({ ...createBlock('paragraph', paragraph.trim()), order: order++ })
          paragraph = ''
        }
      } else {
        paragraph += (paragraph ? ' ' : '') + line.text.trim()
      }
    }

    // Flush remaining
    if (paragraph.trim()) {
      blocks.push({ ...createBlock('paragraph', paragraph.trim()), order: order++ })
    }
  }

  if (blocks.length === 0) {
    blocks.push({ ...createBlock('paragraph', ''), order: 0 })
  }

  const title = filename.replace(/\.\w+$/, '')
  return { title, blocks, tags: [] }
}

// ============================================================
// File Dispatcher
// ============================================================

// ============================================================
// CSV Parser
// ============================================================

export function parseCSV(text: string, filename: string): ParsedPage {
  const blocks: Block[] = []
  let order = 0

  // Simple CSV parsing: handle quoted fields
  function parseLine(line: string): string[] {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    fields.push(current.trim())
    return fields
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length === 0) {
    blocks.push(createBlock('paragraph', '', { order: order++ }))
    return {
      title: filename.replace(/\.csv$/i, ''),
      blocks,
      tags: [],
    }
  }

  // First row as heading
  const headers = parseLine(lines[0])
  blocks.push(createBlock('heading2', headers.join(' | '), { order: order++ }))

  // Remaining rows as bullet list items
  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i])
    const content = fields.join(' | ')
    blocks.push(createBlock('bullet-list', content, { order: order++ }))
  }

  return {
    title: filename.replace(/\.csv$/i, ''),
    blocks,
    tags: [],
  }
}

export async function parseFile(file: File): Promise<ParsedPage> {
  const name = file.name
  const ext = name.split('.').pop()?.toLowerCase() ?? ''

  switch (ext) {
    case 'md':
    case 'markdown': {
      const text = await file.text()
      return parseMarkdown(text, name)
    }
    case 'html':
    case 'htm': {
      const text = await file.text()
      return parseHTML(text, name)
    }
    case 'pdf': {
      const buffer = await file.arrayBuffer()
      return parsePDF(buffer, name)
    }
    case 'csv': {
      const text = await file.text()
      return parseCSV(text, name)
    }
    default:
      throw new Error(`Unsupported file type: .${ext}`)
  }
}
