interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({ className = '', orientation = 'horizontal' }: SeparatorProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-px self-stretch bg-separator opacity-60 ${className}`}
      />
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={`h-px w-full bg-separator opacity-60 ${className}`}
    />
  )
}
