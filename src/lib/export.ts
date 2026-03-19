import type { Block, Page } from '../types'

// ---- Minimal ZIP builder (no external deps) ----

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function buildZip(files: { name: string; content: string }[]): Blob {
  const encoder = new TextEncoder()
  const entries: { name: Uint8Array; data: Uint8Array; crc: number; offset: number }[] = []
  const parts: Uint8Array[] = []
  let offset = 0

  for (const file of files) {
    const nameBytes = encoder.encode(file.name)
    const dataBytes = encoder.encode(file.content)
    const crc = crc32(dataBytes)

    // Local file header (30 + nameLen + dataLen)
    const header = new ArrayBuffer(30 + nameBytes.length)
    const hv = new DataView(header)
    hv.setUint32(0, 0x04034b50, true)    // signature
    hv.setUint16(4, 20, true)             // version needed
    hv.setUint16(6, 0, true)              // flags
    hv.setUint16(8, 0, true)              // compression (store)
    hv.setUint16(10, 0, true)             // mod time
    hv.setUint16(12, 0, true)             // mod date
    hv.setUint32(14, crc, true)           // crc32
    hv.setUint32(18, dataBytes.length, true) // compressed size
    hv.setUint32(22, dataBytes.length, true) // uncompressed size
    hv.setUint16(26, nameBytes.length, true) // name length
    hv.setUint16(28, 0, true)             // extra field length
    new Uint8Array(header).set(nameBytes, 30)

    const headerArr = new Uint8Array(header)
    parts.push(headerArr, dataBytes)
    entries.push({ name: nameBytes, data: dataBytes, crc, offset })
    offset += headerArr.length + dataBytes.length
  }

  // Central directory
  const cdStart = offset
  for (const entry of entries) {
    const cd = new ArrayBuffer(46 + entry.name.length)
    const cv = new DataView(cd)
    cv.setUint32(0, 0x02014b50, true)     // signature
    cv.setUint16(4, 20, true)              // version made by
    cv.setUint16(6, 20, true)              // version needed
    cv.setUint16(8, 0, true)              // flags
    cv.setUint16(10, 0, true)             // compression
    cv.setUint16(12, 0, true)             // mod time
    cv.setUint16(14, 0, true)             // mod date
    cv.setUint32(16, entry.crc, true)     // crc32
    cv.setUint32(20, entry.data.length, true) // compressed
    cv.setUint32(24, entry.data.length, true) // uncompressed
    cv.setUint16(28, entry.name.length, true) // name length
    cv.setUint16(30, 0, true)             // extra length
    cv.setUint16(32, 0, true)             // comment length
    cv.setUint16(34, 0, true)             // disk start
    cv.setUint16(36, 0, true)             // internal attrs
    cv.setUint32(38, 0, true)             // external attrs
    cv.setUint32(42, entry.offset, true)  // local header offset
    new Uint8Array(cd).set(entry.name, 46)
    const cdArr = new Uint8Array(cd)
    parts.push(cdArr)
    offset += cdArr.length
  }

  // End of central directory
  const eocd = new ArrayBuffer(22)
  const ev = new DataView(eocd)
  ev.setUint32(0, 0x06054b50, true)      // signature
  ev.setUint16(4, 0, true)               // disk number
  ev.setUint16(6, 0, true)               // cd disk
  ev.setUint16(8, entries.length, true)   // entries on disk
  ev.setUint16(10, entries.length, true)  // total entries
  ev.setUint32(12, offset - cdStart, true) // cd size
  ev.setUint32(16, cdStart, true)         // cd offset
  ev.setUint16(20, 0, true)              // comment length
  parts.push(new Uint8Array(eocd))

  return new Blob(parts as BlobPart[], { type: 'application/zip' })
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

function htmlToMarkdownInline(html: string): string {
  return html
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<s>(.*?)<\/s>/g, '~~$1~~')
    .replace(/<u>(.*?)<\/u>/g, '$1')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, '')
}

function blockToMarkdown(block: Block, indent = ''): string {
  const text = htmlToMarkdownInline(block.content)

  switch (block.type) {
    case 'heading1':
      return `# ${text}`
    case 'heading2':
      return `## ${text}`
    case 'heading3':
      return `### ${text}`
    case 'bullet-list':
      return `${indent}- ${text}`
    case 'numbered-list':
      return `${indent}1. ${text}`
    case 'todo': {
      const checked = block.metadata.checked ? 'x' : ' '
      return `${indent}- [${checked}] ${text}`
    }
    case 'toggle':
      return `<details>\n<summary>${text}</summary>\n\n${block.children.map((c) => blockToMarkdown(c, indent)).join('\n')}\n</details>`
    case 'quote':
      return `> ${text}`
    case 'callout':
      return `> **Note:** ${text}`
    case 'divider':
      return '---'
    case 'code': {
      const lang = (block.metadata.language as string) || ''
      return `\`\`\`${lang}\n${stripHtml(block.content)}\n\`\`\``
    }
    case 'image': {
      const src = (block.metadata.src as string) || ''
      const alt = (block.metadata.alt as string) || ''
      return `![${alt}](${src})`
    }
    default:
      return text
  }
}

export function pageToMarkdown(page: Page): string {
  const lines: string[] = []

  // Title
  if (page.title) {
    lines.push(`# ${page.title}`)
    lines.push('')
  }

  // Tags as frontmatter-style
  if (page.tags.length > 0) {
    lines.push(`Tags: ${page.tags.join(', ')}`)
    lines.push('')
  }

  // Blocks
  for (const block of page.blocks) {
    lines.push(blockToMarkdown(block))
    lines.push('')
  }

  return lines.join('\n').trim() + '\n'
}

function blockToHTML(block: Block): string {
  const content = block.content || ''

  switch (block.type) {
    case 'heading1':
      return `<h1>${content}</h1>`
    case 'heading2':
      return `<h2>${content}</h2>`
    case 'heading3':
      return `<h3>${content}</h3>`
    case 'bullet-list':
      return `<ul><li>${content}</li></ul>`
    case 'numbered-list':
      return `<ol><li>${content}</li></ol>`
    case 'todo': {
      const checked = block.metadata.checked ? ' checked' : ''
      return `<div><input type="checkbox"${checked} disabled /> ${content}</div>`
    }
    case 'toggle':
      return `<details><summary>${content}</summary>${block.children.map(blockToHTML).join('')}</details>`
    case 'quote':
      return `<blockquote>${content}</blockquote>`
    case 'callout':
      return `<div style="padding:12px;background:#fff8e1;border-left:4px solid #ffc107;border-radius:4px;margin:8px 0">${content}</div>`
    case 'divider':
      return '<hr />'
    case 'code': {
      const lang = (block.metadata.language as string) || ''
      return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${stripHtml(content)}</code></pre>`
    }
    case 'image': {
      const src = (block.metadata.src as string) || ''
      const alt = (block.metadata.alt as string) || ''
      return `<figure><img src="${src}" alt="${alt}" style="max-width:100%;border-radius:8px" /></figure>`
    }
    default:
      return content ? `<p>${content}</p>` : ''
  }
}

export function pageToHTML(page: Page): string {
  const title = page.title || 'Untitled'
  const bodyParts: string[] = []

  bodyParts.push(`<h1>${title}</h1>`)

  if (page.tags.length > 0) {
    bodyParts.push(`<p><em>Tags: ${page.tags.join(', ')}</em></p>`)
  }

  for (const block of page.blocks) {
    const html = blockToHTML(block)
    if (html) bodyParts.push(html)
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
h1 { font-size: 2em; margin-bottom: 0.5em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.25em; }
blockquote { border-left: 3px solid #2563eb; margin: 12px 0; padding: 4px 16px; color: #6b6b6b; }
pre { background: #f5f5f5; padding: 16px; border-radius: 8px; overflow-x: auto; }
code { font-family: "SF Mono", "JetBrains Mono", monospace; }
hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
</style>
</head>
<body>
${bodyParts.join('\n')}
</body>
</html>`
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportPageAsMarkdown(page: Page) {
  const md = pageToMarkdown(page)
  const filename = `${page.title || 'Untitled'}.md`
  downloadFile(md, filename, 'text/markdown')
}

export function exportPageAsHTML(page: Page) {
  const html = pageToHTML(page)
  const filename = `${page.title || 'Untitled'}.html`
  downloadFile(html, filename, 'text/html')
}

export function exportWorkspace(pages: Record<string, Page>) {
  const activePages = Object.values(pages).filter((p) => !p.isTrashed)
  if (activePages.length === 0) return

  const files = activePages.map((page) => {
    const safeName = (page.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-')
    return { name: `${safeName}.md`, content: pageToMarkdown(page) }
  })

  const blob = buildZip(files)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'Not3s-workspace.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
