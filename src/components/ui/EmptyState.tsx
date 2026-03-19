import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-text-muted [&_svg]:w-10 [&_svg]:h-10 [&_svg]:stroke-[1.5]">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-medium text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-text-muted max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
