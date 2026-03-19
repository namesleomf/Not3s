import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-9 px-4 text-[13px] w-full
            bg-bg-inset text-text-primary
            placeholder:text-text-placeholder
            border border-border
            rounded-[var(--radius-lg)]
            transition-theme
            focus:outline-none focus:border-accent focus:ring-2 focus:ring-focus-ring
            disabled:opacity-40 disabled:pointer-events-none
            ${error ? 'border-danger focus:border-danger focus:ring-danger/30' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger">{error}</span>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
