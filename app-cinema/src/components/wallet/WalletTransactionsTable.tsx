export type WalletTransactionRow = {
  idTransaccion: number
  tipo: string
  monto: number
  descripcion?: string
  fechaTransaccion: string
}

type WalletTransactionsTableProps = {
  title?: string
  transactions: WalletTransactionRow[]
  loading?: boolean
  emptyMessage?: string
  positiveTypes?: string[]
  negativeTypes?: string[]
}

const formatFecha = (fecha: string) => {
  const d = new Date(fecha)
  return d.toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMonto = (monto: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(monto)

const WalletTransactionsTable = ({
  title,
  transactions,
  loading = false,
  emptyMessage = 'Sin transacciones registradas.',
  positiveTypes = ['RECARGA', 'ADD', 'ABONO', 'INGRESO'],
  negativeTypes = ['PAGO', 'REMOVE', 'RETIRO', 'SALIDA'],
}: WalletTransactionsTableProps) => {
  const transaccionesOrdenadas = [...transactions].sort(
    (a, b) => new Date(b.fechaTransaccion).getTime() - new Date(a.fechaTransaccion).getTime(),
  )

  const resolveTone = (tipo: string) => {
    if (positiveTypes.includes(tipo)) {
      return { color: '#4ade80', bg: 'rgba(34,197,94,0.1)', signo: '+' }
    }

    if (negativeTypes.includes(tipo)) {
      return { color: 'var(--accent2)', bg: 'rgba(239,68,68,0.1)', signo: '-' }
    }

    return { color: '#bfdbfe', bg: 'rgba(37,99,235,0.1)', signo: '•' }
  }

  return (
    <section style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(96,165,250,0.15)' }}>
      {title && (
        <div style={{ padding: '1rem 1.25rem', background: 'rgba(30,64,175,0.2)', borderBottom: '1px solid rgba(96,165,250,0.12)' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '.06em', color: '#f1f5f9' }}>
            {title}
          </h2>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', color: '#94a3b8' }}>⏳ Cargando transacciones...</div>
      ) : transaccionesOrdenadas.length === 0 ? (
        <div style={{ padding: '2.5rem', textAlign: 'center', color: '#475569', fontSize: '.85rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}></div>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'grid' }}>
          {transaccionesOrdenadas.map((t, i) => {
            const tone = resolveTone(t.tipo)
            return (
              <div key={t.idTransaccion} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.9rem 1.25rem', background: i % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(30,64,175,0.06)', borderTop: '1px solid rgba(96,165,250,0.07)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: tone.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0, color: tone.color }}>
                  {tone.signo}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.84rem', fontWeight: 500, color: '#f1f5f9' }}>
                    {t.descripcion || (tone.signo === '+' ? 'Recarga de saldo' : 'Movimiento de cartera')}
                  </div>
                  <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: '.1rem' }}>
                    {formatFecha(t.fechaTransaccion)}
                  </div>
                </div>

                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '.04em', color: tone.color, flexShrink: 0 }}>
                  {tone.signo}{formatMonto(t.monto)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default WalletTransactionsTable
