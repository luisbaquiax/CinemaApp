import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { adsAdminCineService } from '../../services/microservice-ads-billing/AdsAdminCineService'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import type { BloqueoAnuncioRequest, BloqueoAnuncioResponse, CostoBloqueoAnuncioResponse } from '../../types/Ads.types'
import type { CompaniaResponse } from '../../types/CinemaCore.types'
import { resolveSelectedCompania, setStoredSelectedCompaniaId } from '../../utils/adminCineSelection'

const toLocalInputValue = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const addDaysToLocalInput = (value: string, days: number) => {
  if (!value || !days || days <= 0) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  date.setDate(date.getDate() + days)
  return toLocalInputValue(date)
}

const BloqueoAnunciosPage = () => {
  const { auth } = useAuth()
  const qc = useQueryClient()
  const [selectedCompaniaId, setSelectedCompaniaId] = useState<number | null>(null)
  const [dias, setDias] = useState('7')
  const [fechaInicio, setFechaInicio] = useState(toLocalInputValue())
  const [fechaFin, setFechaFin] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: companias = [], isLoading: companiasLoading } = useQuery<CompaniaResponse[]>({
    queryKey: ['admin-cine-companias-bloqueo', auth?.idUsuario],
    queryFn: () => cinemaAdminCineService.getMisCompanias(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  useEffect(() => {
    if (!companias.length) {
      setSelectedCompaniaId(null)
      return
    }
    const resolved = resolveSelectedCompania(companias, selectedCompaniaId)
    const nextId = resolved?.idCompania ?? null
    setSelectedCompaniaId(nextId)
    if (nextId) setStoredSelectedCompaniaId(nextId)
  }, [companias])

  const companiaSeleccionada = useMemo(
    () => companias.find(c => c.idCompania === selectedCompaniaId) ?? null,
    [companias, selectedCompaniaId],
  )

  const { data: bloqueoActivo, isLoading: bloqueoLoading } = useQuery<BloqueoAnuncioResponse | null>({
    queryKey: ['admin-cine-bloqueo-activo', selectedCompaniaId],
    queryFn: async () => {
      try {
        return await adsAdminCineService.obtenerBloqueoActivoPorCompania(selectedCompaniaId as number, auth!.token)
      } catch (error: any) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    enabled: !!selectedCompaniaId,
    retry: false,
  })

  const { data: costoBloqueo } = useQuery<CostoBloqueoAnuncioResponse | null>({
    queryKey: ['admin-cine-costo-bloqueo', selectedCompaniaId],
    queryFn: async () => {
      try {
        return await adsAdminCineService.obtenerCostoBloqueoPorCompania({
          companiaId: selectedCompaniaId as number,
          token: auth!.token,
        })
      } catch (error: any) {
        if (error?.response?.status === 404) return null
        throw error
      }
    },
    enabled: !!selectedCompaniaId && !!auth?.token,
    retry: false,
  })

  const montoCalculado = useMemo(() => {
    const diasNum = Number(dias)
    const costoDia = costoBloqueo?.costoDia

    if (!diasNum || diasNum <= 0 || !costoDia) {
      return ''
    }

    return (costoDia * diasNum).toFixed(2)
  }, [costoBloqueo?.costoDia, dias])

  useEffect(() => {
    setMsg(null)
  }, [selectedCompaniaId])

  useEffect(() => {
    if (!dias || Number(dias) <= 0) {
      setFechaFin('')
      return
    }
    setFechaFin(addDaysToLocalInput(fechaInicio, Number(dias)))
  }, [dias, fechaInicio])

  const montoPagado = montoCalculado

  const canSubmit = !!selectedCompaniaId && !!auth?.token && Number(dias) > 0 && !!montoPagado && Number(montoPagado) > 0 && !!fechaInicio && !bloqueoActivo && !!costoBloqueo
  const pagarMutation = useMutation({
    mutationFn: (payload: BloqueoAnuncioRequest) => adsAdminCineService.pagarBloqueAnuncios(payload),
    onSuccess: async () => {
        setMsg({ type: 'ok', text: 'Bloqueo de anuncios pagado correctamente.' })
        setDias('7')
        setFechaInicio(toLocalInputValue())
        setFechaFin('')
        setConfirmOpen(false)
        await qc.invalidateQueries({ queryKey: ['admin-cine-bloqueo-activo', selectedCompaniaId] })
    },
    onError: (err: any) => {
        setConfirmOpen(false)
        setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo pagar el bloqueo de anuncios.' })
    },
  })

  const handleSubmit = () => {
    if (!canSubmit || !selectedCompaniaId) return

    pagarMutation.mutate({
      companiaId: selectedCompaniaId,
      dias: Number(dias),
      montoPagado: Number(montoPagado),
      fechaInicio,
      fechaFin: fechaFin || undefined,
      token: auth!.token,
    })
  }

  if (companiasLoading) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando compañías...</div>
  }

  if (!companias.length) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>Aún no tiene un cine para administrar.</div>
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Bloqueo de Anuncios
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '.88rem' }}>
          Paga el bloqueo para evitar anuncios en páginas públicas y marca el cine como bloqueado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)', gap: '1rem' }}>
        <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.1)' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Nuevo bloqueo</h3>

          <div style={{ display: 'grid', gap: '.7rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '.78rem' }}>
              Cine / compañía
              <select
                value={selectedCompaniaId ?? ''}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  setSelectedCompaniaId(id)
                  setStoredSelectedCompaniaId(id)
                }}
                style={{ width: '100%', marginTop: '.35rem', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
              >
                {companias.map(c => (
                  <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania}</option>
                ))}
              </select>
            </label>

            <InputGroup
              label="Días de bloqueo"
              type="number"
              minValue={1}
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              required
            />

            <InputGroup
              label="Fecha inicio"
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />

            <InputGroup
              label="Fecha fin"
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              placeholder="Se calcula automáticamente"
            />

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSubmit || pagarMutation.isPending}
              style={{
                padding: '.7rem .9rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                color: '#fff',
                cursor: 'pointer',
                opacity: !canSubmit ? 0.55 : 1,
              }}
            >
              {pagarMutation.isPending ? '⏳ Procesando...' : 'Pagar bloqueo'}
            </button>

            {!canSubmit && bloqueoActivo && (
              <div style={{ color: '#fca5a5', fontSize: '.82rem' }}>
                Este cine ya tiene un bloqueo activo.
              </div>
            )}

            {msg && (
              <div style={{ color: msg.type === 'ok' ? '#4ade80' : '#fca5a5', fontSize: '.84rem' }}>
                {msg.text}
              </div>
            )}
          </div>
        </section>

        <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Resumen del pago</h3>

          {!companiaSeleccionada ? (
            <div style={{ color: '#94a3b8' }}>Selecciona un cine para ver el desglose.</div>
          ) : (
            <>
              {!costoBloqueo ? (
                <div style={{ color: '#fca5a5' }}>
                  No hay costo configurado para esta compañía.
                </div>
              ) : (
                <div style={{ borderRadius: '12px', padding: '1rem', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(96,165,250,0.25)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', color: '#e2e8f0', fontSize: '.9rem' }}>
                    <span>Costo por día:</span>
                    <span style={{ fontWeight: 500 }}>Q {Number(costoBloqueo.costoDia).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.75rem', color: '#e2e8f0', fontSize: '.9rem' }}>
                    <span>Cantidad de días:</span>
                    <span style={{ fontWeight: 500 }}>{Number(dias) || 0}</span>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(96,165,250,0.2)', paddingTop: '.75rem', display: 'flex', justifyContent: 'space-between', color: '#d1fae5', fontSize: '1rem', fontWeight: 600 }}>
                    <span>Total a pagar:</span>
                    <span>Q {montoPagado}</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '.85rem' }}>
                Si el bloqueo está activo, los anuncios laterales se ocultarán en la página pública de cines de la película.
              </div>

              {bloqueoLoading ? (
                <div style={{ color: '#94a3b8', marginTop: '1rem' }}>⏳ Verificando bloqueo activo...</div>
              ) : bloqueoActivo ? (
                <div style={{ marginTop: '1rem', borderRadius: '12px', padding: '1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#d1fae5' }}>
                  <div style={{ fontWeight: 600, marginBottom: '.35rem' }}>✓ Bloqueo activo</div>
                  <div style={{ fontSize: '.85rem' }}>Días: {bloqueoActivo.dias}</div>
                  <div style={{ fontSize: '.85rem' }}>Monto: Q {Number(bloqueoActivo.montoPagado).toFixed(2)}</div>
                  <div style={{ fontSize: '.85rem' }}>Inicio: {new Date(bloqueoActivo.fechaInicio).toLocaleString()}</div>
                  <div style={{ fontSize: '.85rem' }}>Fin: {bloqueoActivo.fechaFin ? new Date(bloqueoActivo.fechaFin).toLocaleString() : '-'}</div>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '.85rem' }}>
                  No hay bloqueo activo para este cine.
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar pago"
        message={`¿Deseas pagar el bloqueo de anuncios para ${companiaSeleccionada?.nombreCompania ?? 'esta compañía'} por ${dias} días?`}
        confirmText="Pagar"
        cancelText="Cancelar"
        onConfirm={handleSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default BloqueoAnunciosPage
