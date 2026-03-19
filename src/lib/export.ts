import type { Block, Page } from '../types'

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
