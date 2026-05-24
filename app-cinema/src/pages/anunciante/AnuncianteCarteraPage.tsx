import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'
import { adsAnuncianteService } from '../../services/microservice-ads-billing/AdsAnuncinateService'
import type { TransaccionAnuncianteResponse } from '../../types/Ads.types'
import WalletRechargeForm from '../../components/wallet/WalletRechargeForm'
import WalletTransactionsTable, { type WalletTransactionRow } from '../../components/wallet/WalletTransactionsTable'

const formatMonto = (monto: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(monto)

const AnuncianteCarteraPage = () => {
  const { auth } = useAuth()
  const qc = useQueryClient()
  const [monto, setMonto] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: saldo = 0, isLoading: saldoLoading } = useQuery({
    queryKey: ['anunciante-saldo', auth?.idUsuario],
    queryFn: () => adsAnuncianteService.obtenerSaldo(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  const { data: transacciones = [], isLoading: transaccionesLoading } = useQuery<TransaccionAnuncianteResponse[]>({
    queryKey: ['anunciante-transacciones', auth?.idUsuario],
    queryFn: () => adsAnuncianteService.obtenerTransacciones(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  const recargaMutation = useMutation({
    mutationFn: () => {
      if (!auth?.idUsuario) {
        throw new Error('No hay sesión activa.')
      }

      return adsAnuncianteService.realizarTransaccion(auth.idUsuario, {
        monto: Number(monto),
        esRecarga: true,
      })
    },
    onSuccess: async res => {
      setMsg({ type: 'ok', text: res.message || 'Recarga realizada correctamente.' })
      setMonto('')
      await qc.invalidateQueries({ queryKey: ['anunciante-saldo', auth?.idUsuario] })
      await qc.invalidateQueries({ queryKey: ['anunciante-transacciones', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo realizar la recarga.' })
    },
  })

  const walletRows: WalletTransactionRow[] = transacciones.map(t => ({
    idTransaccion: t.idTransaccionAnunciante,
    tipo: t.tipo,
    monto: t.monto,
    descripcion: t.descripcion,
    fechaTransaccion: t.fechaTransaccion,
  }))

  if (saldoLoading) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando cartera...</div>
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Cartera de Anunciante
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Revisa tu saldo, recarga fondos y consulta el historial de transacciones.
        </p>
      </div>

      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)', fontSize: '.84rem'
        }}>
          {msg.text}
        </div>
      )}

      <div style={{ borderRadius: '20px', padding: '2rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.35) 0%, rgba(30,64,175,0.2) 100%)', border: '1px solid rgba(96,165,250,0.25)', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '.78rem', color: '#94a3b8', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.4rem' }}>
          Saldo disponible
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3rem', letterSpacing: '.05em', color: '#f1f5f9', lineHeight: 1 }}>
          {formatMonto(saldo ?? 0)}
        </div>
        <div style={{ color: '#94a3b8', fontSize: '.8rem', marginTop: '.5rem' }}>
          <Wallet size={14} style={{ display: 'inline-block', marginRight: '.3rem' }} />
          Tu cartera del anunciante usa el mismo patrón de recargas y transacciones.
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem', gridTemplateColumns: 'minmax(0, 360px) minmax(0, 1fr)' }}>
        <WalletRechargeForm
          title="Recargar cartera"
          amountLabel="Monto a recargar (GTQ)"
          amount={monto}
          onAmountChange={setMonto}
          onSubmit={() => recargaMutation.mutate()}
          isSubmitting={recargaMutation.isPending}
          submitLabel="Recargar"
          helperText="La recarga se registra como una transacción positiva en tu cartera."
        />

        <WalletTransactionsTable
          title="Historial de transacciones"
          transactions={walletRows}
          loading={transaccionesLoading}
          emptyMessage="No tienes transacciones registradas todavía."
        />
      </div>
    </div>
  )
}

export default AnuncianteCarteraPage
