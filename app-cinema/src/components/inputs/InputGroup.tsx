interface InputGroupProps {
  label: string
  name?: string
  pattern?: string
  type?: string
  required?: boolean
  value: string | number | undefined
  minLength?: number
  maxLength?: number
  minValue?: number
  maxValue?: number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  onkeyUpCapture?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  readOnly?: boolean
  error?: string
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  name,
  pattern,
  type = 'text',
  required = false,
  value,
  minLength,
  maxLength,
  minValue,
  maxValue,
  onChange,
  onkeyUpCapture,
  placeholder = '',
  className = '',
  disabled = false,
  readOnly = false,
  error,
}) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-medium mb-1.5 tracking-wide"
      style={{ color: '#94a3b8' }}>
      {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
    </label>

    <input
      type={type}
      name={name}
      pattern={pattern}
      required={required}
      value={value}
      minLength={minLength}
      maxLength={maxLength}
      min={minValue}
      max={maxValue}
      onChange={onChange}
      onKeyUpCapture={onkeyUpCapture}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className="px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
      style={{
        background: 'rgba(30,64,175,0.15)',
        border: `1px solid ${error ? 'var(--accent2)' : 'rgba(96,165,250,0.2)'}`,
        color: '#f1f5f9',
        fontFamily: "'DM Sans', sans-serif",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
      }}
      onFocus={e => {
        if (!error) e.currentTarget.style.border = '1px solid var(--blue-glow)'
        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.12)'
      }}
      onBlur={e => {
        e.currentTarget.style.border = `1px solid ${error ? 'var(--accent2)' : 'rgba(96,165,250,0.2)'}`
        e.currentTarget.style.boxShadow = 'none'
      }}
    />

    {error && (
      <span className="mt-1 text-xs" style={{ color: 'var(--accent2)' }}>
        {error}
      </span>
    )}
  </div>
)