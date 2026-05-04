import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/UseAuth'
import { authService } from '../../services/microservice-users/authService'
import type { TransaccionCarteraDTO } from '../../types/Wallet.types'

const tipoConfig: Record<string, { color: string; bg: string; icono: string; signo: string }> = {
  RECARGA: { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',  icono: '⬆️', signo: '+' },
  PAGO:    { color: 'var(--accent2)', bg: 'rgba(239,68,68,0.1)', icono: '⬇️', signo: '-' },
}

const formatFecha = (fecha: string) => {
  const d = new Date(fecha)
  return d.toLocaleDateString('es-GT', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatMonto = (monto: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(monto)

const CarteraPage = () => {
  const { auth }  = useAuth()
  const qc        = useQueryClient()

  const [monto, setMonto]   = useState('')
  const [msg, setMsg]       = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [filtro, setFiltro] = useState<'TODOS' | 'RECARGA' | 'PAGO'>('TODOS')

  const { data: cartera, isLoading } = useQuery({
    queryKey: ['cartera', auth?.idUsuario],
    queryFn:  () => authService.getWallet(auth!.idUsuario),
    enabled:  !!auth?.idUsuario,
  })

  const rechargeMutation = useMutation({
    mutationFn: () => authService.updateWallet(auth!.idUsuario, 'ADD', parseFloat(monto)),
    onSuccess: (data) => {
      setMsg({ type: 'ok', text: `Se acreditaron ${formatMonto(parseFloat(monto))} a tu cartera.` })
      setMonto('')
      qc.setQueryData(['cartera', auth?.idUsuario], data)
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al recargar.' })
    }
  })

  const handleRecargar = () => {
    setMsg(null)
    const val = parseFloat(monto)
    if (!monto || isNaN(val) || val <= 0) {
      setMsg({ type: 'err', text: 'Ingresa un monto válido mayor a 0.' })
      return
    }
    rechargeMutation.mutate()
  }

  const transaccionesFiltradas: TransaccionCarteraDTO[] = (cartera?.transacciones ?? [])
    .filter(t => filtro === 'TODOS' || t.tipo === filtro)
    .sort((a, b) => new Date(b.fechaTransaccion).getTime() - new Date(a.fechaTransaccion).getTime())

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <span style={{ color: '#94a3b8' }}>⏳ Cargando cartera...</span>
    </div>
  )

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9'
        }}>
          Mi Cartera
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Administra tu saldo para comprar boletos y servicios
        </p>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
          fontSize: '.84rem'
        }}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Balance card */}
      <div style={{
        borderRadius: '20px', padding: '2rem',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(30,64,175,0.2) 100%)',
        border: '1px solid rgba(96,165,250,0.25)',
        marginBottom: '1.25rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Decoración */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(96,165,250,0.07)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', right: '60px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'rgba(96,165,250,0.05)', pointerEvents: 'none'
        }} />

        <div style={{ fontSize: '.78rem', color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.4rem' }}>
          Saldo disponible
        </div>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '3rem', letterSpacing: '.05em',
          color: '#f1f5f9', lineHeight: 1,
          marginBottom: '1.5rem'
        }}>
          {formatMonto(cartera?.saldo ?? 0)}
        </div>

        {/* Stats rápidos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            {
              label: 'Total recargado',
              value: formatMonto(
                (cartera?.transacciones ?? [])
                  .filter(t => t.tipo === 'RECARGA')
                  .reduce((acc, t) => acc + t.monto, 0)
              ),
              color: '#4ade80'
            },
            {
              label: 'Total gastado',
              value: formatMonto(
                (cartera?.transacciones ?? [])
                  .filter(t => t.tipo === 'PAGO')
                  .reduce((acc, t) => acc + t.monto, 0)
              ),
              color: 'var(--accent2)'
            },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '.75rem 1rem', borderRadius: '12px',
              background: 'rgba(15,23,42,0.35)',
              border: '1px solid rgba(96,165,250,0.1)'
            }}>
              <div style={{ fontSize: '.7rem', color: '#94a3b8', marginBottom: '.2rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recarga */}
      <div style={{
        borderRadius: '16px', padding: '1.5rem',
        background: 'rgba(30,64,175,0.12)',
        border: '1px solid rgba(96,165,250,0.15)',
        marginBottom: '1.25rem'
      }}>
        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.15rem', letterSpacing: '.06em',
          color: '#f1f5f9', marginBottom: '1rem'
        }}>
          Recargar saldo
        </h2>

        {/* Montos rápidos */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {[50, 100, 200, 500].map(m => (
            <button key={m}
              onClick={() => setMonto(String(m))}
              style={{
                padding: '.35rem .85rem', borderRadius: '999px', fontSize: '.8rem',
                fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                background: monto === String(m) ? 'rgba(37,99,235,0.35)' : 'rgba(30,64,175,0.2)',
                border: `1px solid ${monto === String(m) ? 'var(--blue-glow)' : 'rgba(96,165,250,0.18)'}`,
                color: monto === String(m) ? 'var(--blue-glow)' : '#94a3b8',
              }}
            >
              Q{m}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '.75rem', color: '#94a3b8', display: 'block', marginBottom: '.4rem' }}>
              Monto a recargar (GTQ)
            </label>
            <input
              type="number"
              min="1"
              value={monto}
              onChange={e => { setMonto(e.target.value); setMsg(null) }}
              placeholder="0.00"
              style={{
                width: '100%', padding: '.65rem 1rem',
                borderRadius: '12px', border: '1px solid rgba(96,165,250,0.2)',
                background: 'rgba(30,64,175,0.15)', color: '#f1f5f9',
                fontSize: '.9rem', outline: 'none',
                fontFamily: "'DM Sans', sans-serif"
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--blue-glow)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)'}
            />
          </div>
          <button
            onClick={handleRecargar}
            disabled={rechargeMutation.isPending || !monto}
            style={{
              padding: '.65rem 1.5rem', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
              color: '#fff', fontSize: '.88rem', fontWeight: 500,
              cursor: rechargeMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: !monto ? 0.5 : 1, whiteSpace: 'nowrap',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
            }}
          >
            {rechargeMutation.isPending ? '⏳...' : '+ Recargar'}
          </button>
        </div>
      </div>

      {/* Historial */}
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(96,165,250,0.15)',
      }}>
        {/* Header historial */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          background: 'rgba(30,64,175,0.2)',
          borderBottom: '1px solid rgba(96,165,250,0.12)'
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.1rem', letterSpacing: '.06em', color: '#f1f5f9'
          }}>
            Historial de transacciones
          </h2>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '.4rem' }}>
            {(['TODOS', 'RECARGA', 'PAGO'] as const).map(f => (
              <button key={f}
                onClick={() => setFiltro(f)}
                style={{
                  padding: '.28rem .7rem', borderRadius: '999px', fontSize: '.7rem',
                  fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                  background: filtro === f ? 'rgba(37,99,235,0.35)' : 'transparent',
                  border: `1px solid ${filtro === f ? 'var(--blue-glow)' : 'rgba(96,165,250,0.18)'}`,
                  color: filtro === f ? 'var(--blue-glow)' : '#94a3b8',
                }}
              >
                {f === 'TODOS' ? 'Todos' : f === 'RECARGA' ? '⬆ Recargas' : '⬇ Pagos'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {transaccionesFiltradas.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#475569', fontSize: '.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🪙</div>
            No hay transacciones {filtro !== 'TODOS' ? `de tipo ${filtro}` : ''} aún.
          </div>
        ) : (
          transaccionesFiltradas.map((t, i) => {
            const cfg = tipoConfig[t.tipo] ?? tipoConfig['PAGO']
            return (
              <div key={t.idTransaccion} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '.9rem 1.25rem',
                background: i % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(30,64,175,0.06)',
                borderTop: '1px solid rgba(96,165,250,0.07)',
                transition: 'background .15s'
              }}>
                {/* Icono */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: cfg.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0
                }}>
                  {cfg.icono}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.84rem', fontWeight: 500, color: '#f1f5f9' }}>
                    {t.descripcion || (t.tipo === 'RECARGA' ? 'Recarga de saldo' : 'Pago realizado')}
                  </div>
                  <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: '.1rem' }}>
                    {formatFecha(t.fechaTransaccion)}
                  </div>
                </div>

                {/* Monto */}
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '1.1rem', letterSpacing: '.04em',
                  color: cfg.color, flexShrink: 0
                }}>
                  {cfg.signo}{formatMonto(t.monto)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CarteraPage