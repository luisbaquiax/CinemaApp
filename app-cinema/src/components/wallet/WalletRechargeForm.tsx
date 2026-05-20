import { InputGroup } from '../inputs/InputGroup'

type WalletRechargeFormProps = {
  title: string
  amountLabel?: string
  amount: string
  onAmountChange: (value: string) => void
  onSubmit: () => void
  isSubmitting?: boolean
  submitLabel?: string
  helperText?: string
  quickAmounts?: number[]
}

const WalletRechargeForm = ({
  title,
  amountLabel = 'Monto',
  amount,
  onAmountChange,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Aplicar transacción',
  helperText,
  quickAmounts = [50, 100, 200, 500],
}: WalletRechargeFormProps) => {
  return (
    <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.1)' }}>
      <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>{title}</h3>

      {quickAmounts.length > 0 && (
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {quickAmounts.map(monto => (
            <button
              key={monto}
              type="button"
              onClick={() => onAmountChange(String(monto))}
              style={{
                padding: '.35rem .85rem',
                borderRadius: '999px',
                fontSize: '.8rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all .2s',
                background: amount === String(monto) ? 'rgba(37,99,235,0.35)' : 'rgba(30,64,175,0.2)',
                border: `1px solid ${amount === String(monto) ? 'var(--blue-glow)' : 'rgba(96,165,250,0.18)'}`,
                color: amount === String(monto) ? 'var(--blue-glow)' : '#94a3b8',
              }}
            >
              Q{monto}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gap: '.6rem' }}>
        <InputGroup
          label={amountLabel}
          type="number"
          minValue={0.01}
          value={amount}
          onChange={e => onAmountChange(e.target.value)}
          placeholder="Monto"
          required
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !amount || Number(amount) <= 0}
          style={{ padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
        >
          {isSubmitting ? '⏳...' : submitLabel}
        </button>
      </div>

      {helperText && (
        <p style={{ color: '#94a3b8', fontSize: '.78rem', marginTop: '.75rem', lineHeight: 1.5 }}>
          {helperText}
        </p>
      )}
    </section>
  )
}

export default WalletRechargeForm
