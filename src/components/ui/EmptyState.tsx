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
    <div className={`flex flex-col items-center justify-center py-20 px-8 text-center ${className}`}>
      {icon && (
        <div className="mb-5 text-text-muted/60 [&_svg]:w-12 [&_svg]:h-12 [&_svg]:stroke-[1.25]">
          {icon}
        </div>
      )}
      <h3 className="text-[16px] font-semibold text-text-primary mb-1.5">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-text-muted max-w-[300px] leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}
