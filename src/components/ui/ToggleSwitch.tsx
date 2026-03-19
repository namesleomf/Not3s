interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, label, disabled = false }: ToggleSwitchProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`
          relative w-9 h-5 rounded-full transition-colors duration-150
          focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2
          disabled:opacity-40 disabled:pointer-events-none
          ${checked ? 'bg-accent' : 'bg-bg-active'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5
            w-4 h-4 rounded-full
            bg-white shadow-sm
            transition-transform duration-150 ease-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      </button>
      {label && (
        <span className="text-[13px] text-text-primary">{label}</span>
      )}
    </label>
  )
}
