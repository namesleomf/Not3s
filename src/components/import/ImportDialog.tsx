import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, FileText, FileCode, File as FileIcon, Loader2 } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { IconButton } from '../ui/IconButton'
import { parseFile } from '../../lib/import-parsers'
import { createPage } from '../../lib/page-utils'
import { useWorkspace } from '../../context/workspace-context'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

const ACCEPTED_EXTENSIONS = ['.md', '.markdown', '.html', '.htm', '.pdf', '.csv']
const ACCEPT_STRING = '.md,.markdown,.html,.htm,.pdf,.csv'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'md' || ext === 'markdown') return <FileText className="w-4 h-4 text-accent" />
  if (ext === 'html' || ext === 'htm') return <FileCode className="w-4 h-4 text-success" />
  if (ext === 'pdf') return <FileIcon className="w-4 h-4 text-danger" />
  if (ext === 'csv') return <FileIcon className="w-4 h-4 text-accent" />
  return <FileIcon className="w-4 h-4 text-text-muted" />
}

function isValidFile(file: File): boolean {
  const ext = '.' + (file.name.split('.').pop()?.toLowerCase() ?? '')
  return ACCEPTED_EXTENSIONS.includes(ext)
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { dispatch } = useWorkspace()
  const [files, setFiles] = useState<File[]>([])
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current)
    }
  }, [])

  const reset = useCallback(() => {
    setFiles([])
    setImporting(false)
    setDragOver(false)
    setResults(null)
    if (autoCloseTimer.current) {
      clearTimeout(autoCloseTimer.current)
      autoCloseTimer.current = null
    }
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(isValidFile)
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name))
      const unique = valid.filter((f) => !existingNames.has(f.name))
      return [...prev, ...unique]
    })
    setResults(null)
  }, [])

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const handleImport = useCallback(async () => {
    if (files.length === 0) return
    setImporting(true)
    setResults(null)

    let success = 0
    const errors: string[] = []
    let firstPageId: string | null = null

    for (const file of files) {
      try {
        const parsed = await parseFile(file)
        const page = createPage({
          title: parsed.title,
          blocks: parsed.blocks,
          tags: parsed.tags,
        })
        dispatch({ type: 'PAGE_CREATE', payload: page })
        if (!firstPageId) firstPageId = page.id
        success++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${file.name}: ${msg}`)
      }
    }

    // Select first imported page
    if (firstPageId) {
      dispatch({ type: 'UI_SELECT_PAGE', payload: { id: firstPageId } })
    }

    setImporting(false)
    setResults({ success, errors })

    // Auto-close after success with no errors
    if (errors.length === 0 && success > 0) {
      autoCloseTimer.current = setTimeout(() => {
        handleClose()
      }, 800)
    }
  }, [files, dispatch, handleClose])

  return (
    <Dialog open={open} onClose={handleClose} className="w-full max-w-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-separator">
        <h2 className="text-[16px] font-semibold text-text-primary">Import pages</h2>
        <IconButton size="sm" label="Close" onClick={handleClose}>
          <X />
        </IconButton>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col gap-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-3
            h-[160px] rounded-[var(--radius-xl)]
            border-2 border-dashed cursor-pointer
            transition-theme
            ${dragOver
              ? 'border-accent bg-accent-soft'
              : 'border-border hover:border-text-muted hover:bg-bg-hover'
            }
          `}
        >
          <div className={`w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center ${dragOver ? 'bg-accent/10' : 'bg-bg-inset'}`}>
            <Upload
              className={`w-5 h-5 ${dragOver ? 'text-accent' : 'text-text-muted'}`}
            />
          </div>
          <div className="text-center">
            <p className="text-[13px] text-text-primary font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-[12px] text-text-muted mt-0.5">
              Supports .md, .html, .pdf, .csv — Notion &amp; Obsidian compatible
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT_STRING}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-lg)] bg-bg-inset"
              >
                {getFileIcon(file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <IconButton
                  size="sm"
                  label="Remove file"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.name)
                  }}
                >
                  <X />
                </IconButton>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="flex flex-col gap-1">
            {results.success > 0 && (
              <p className="text-[13px] text-success font-medium">
                {results.success} page{results.success !== 1 ? 's' : ''} imported successfully
              </p>
            )}
            {results.errors.map((err, i) => (
              <p key={i} className="text-[12px] text-danger">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5 px-6 py-5 border-t border-separator">
        <Button variant="ghost" size="md" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={files.length === 0 || importing}
          onClick={handleImport}
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing…
            </>
          ) : (
            `Import ${files.length} file${files.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </div>
    </Dialog>
  )
}
