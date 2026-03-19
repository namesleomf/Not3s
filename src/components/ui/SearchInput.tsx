import { forwardRef, type InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { IconButton } from './IconButton'

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string
  onValueChange: (value: string) => void
  compact?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onValueChange, compact = false, className = '', ...props }, ref) => {
    return (
      <div className={`relative flex items-center ${className}`}>
        <Search className="absolute left-3 w-4 h-4 text-text-muted pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className={`
            w-full pl-9 pr-9 text-[13px]
            bg-bg-hover text-text-primary
            placeholder:text-text-placeholder
            border border-transparent
            rounded-[var(--radius-pill)]
            transition-theme
            focus:outline-none focus:bg-bg-page focus:border-border
            ${compact ? 'h-8' : 'h-9'}
          `}
          {...props}
        />
        {value && (
          <div className="absolute right-1">
            <IconButton
              size="sm"
              label="Clear search"
              onClick={() => onValueChange('')}
            >
              <X />
            </IconButton>
          </div>
        )}
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
