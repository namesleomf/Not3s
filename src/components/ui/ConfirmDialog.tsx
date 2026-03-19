import { Dialog } from './Dialog'
import { Button } from './Button'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="w-[400px] max-w-[calc(100vw-2rem)]">
      <div className="p-4 sm:p-6">
        <h3 className="text-[16px] font-semibold text-text-primary mb-2">
          {title}
        </h3>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 pb-4 sm:pb-5">
        <Button variant="ghost" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  )
}
