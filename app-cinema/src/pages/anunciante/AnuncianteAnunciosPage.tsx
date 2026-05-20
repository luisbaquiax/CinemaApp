import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Power } from 'lucide-react'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { InputGroup } from '../../components/inputs/InputGroup'
import AdCard from '../../components/ui/AdCard'
import { useAuth } from '../../hooks/UseAuth'
import { adsAnuncianteService } from '../../services/microservice-ads-billing/AdsAnuncinateService'
import { adsAdminService } from '../../services/microservice-ads-billing/AdsAdminAnunciosService'
import type { AnuncioRequest, AnuncioResponse, PrecioAnuncioResponse } from '../../types/Ads.types'

type FormState = {
  idPrecioAnuncio: string
  titulo: string
  contenidoTexto: string
  fechaInicio: string
}

type PendingAction =
  | { type: 'buy' }
  | { type: 'toggle'; anuncio: AnuncioResponse; activar: boolean }

const toDatetimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const formatMonto = (monto: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(monto)

const AnuncianteAnunciosPage = () => {
  const { auth } = useAuth()
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>({
    idPrecioAnuncio: '',
    titulo: '',
    contenidoTexto: '',
    fechaInicio: toDatetimeLocal(new Date()),
  })
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)

  const { data: precios = [], isLoading: preciosLoading } = useQuery<PrecioAnuncioResponse[]>({
    queryKey: ['anunciante-precios-anuncio'],
    queryFn: adsAdminService.listPrecios,
  })

  const { data: misAnuncios = [], isLoading: anunciosLoading } = useQuery<AnuncioResponse[]>({
    queryKey: ['anunciante-mis-anuncios', auth?.idUsuario],
    queryFn: () => adsAnuncianteService.misAnuncios(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  const precioSeleccionado = useMemo(
    () => precios.find(precio => precio.idPrecioAnuncio === Number(form.idPrecioAnuncio)) ?? null,
    [form.idPrecioAnuncio, precios],
  )

  const comprarMutation = useMutation({
    mutationFn: () => {
      if (!auth?.idUsuario || !auth?.token || !form.idPrecioAnuncio) {
        throw new Error('Faltan datos para comprar el anuncio.')
      }

      const payload: AnuncioRequest = {
        usuarioId: auth.idUsuario,
        idPrecioAnuncio: Number(form.idPrecioAnuncio),
        titulo: form.titulo.trim(),
        contenidoTexto: form.contenidoTexto.trim(),
        fechaInicio: form.fechaInicio,
        token: auth.token,
      }

      return adsAnuncianteService.comprarAnuncio(payload)
    },
    onSuccess: async () => {
      setMsg({ type: 'ok', text: 'Anuncio comprado correctamente.' })
      setForm({
        idPrecioAnuncio: '',
        titulo: '',
        contenidoTexto: '',
        fechaInicio: toDatetimeLocal(new Date()),
      })
      await qc.invalidateQueries({ queryKey: ['anunciante-mis-anuncios', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo comprar el anuncio.' })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ anuncio, activar }: { anuncio: AnuncioResponse; activar: boolean }) =>
      adsAnuncianteService.updateStatusAnuncio(anuncio.idAnuncio, activar),
    onSuccess: async () => {
      setMsg({ type: 'ok', text: 'Estado del anuncio actualizado correctamente.' })
      await qc.invalidateQueries({ queryKey: ['anunciante-mis-anuncios', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo cambiar el estado del anuncio.' })
    },
  })

  const handleConfirm = () => {
    if (!pendingAction) return

    setPendingAction(null)

    if (pendingAction.type === 'buy') {
      comprarMutation.mutate()
      return
    }

    statusMutation.mutate({ anuncio: pendingAction.anuncio, activar: pendingAction.activar })
  }

  const totalActivos = misAnuncios.filter(anuncio => anuncio.activo).length
  const totalInactivos = misAnuncios.length - totalActivos

  const confirmTitle = pendingAction?.type === 'buy' ? 'Confirmar compra' : pendingAction?.activar ? 'Activar anuncio' : 'Desactivar anuncio'
  const confirmMessage = pendingAction?.type === 'buy'
    ? `Vas a comprar "${form.titulo || 'tu anuncio'}" por ${precioSeleccionado ? formatMonto(precioSeleccionado.precio) : 'el precio seleccionado'}. ¿Deseas continuar?`
    : `¿Confirmas que deseas ${pendingAction?.activar ? 'activar' : 'desactivar'} este anuncio?`

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Mis Anuncios
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>
          Compra anuncios, revisa los que ya tienes y cambia su estado cuando lo necesites.
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

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div style={{ borderRadius: '16px', padding: '1.1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <div style={{ color: '#94a3b8', fontSize: '.75rem', marginBottom: '.25rem' }}>Total anuncios</div>
          <div style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 600 }}>{misAnuncios.length}</div>
        </div>
        <div style={{ borderRadius: '16px', padding: '1.1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <div style={{ color: '#94a3b8', fontSize: '.75rem', marginBottom: '.25rem' }}>Activos</div>
          <div style={{ color: '#4ade80', fontSize: '1.4rem', fontWeight: 600 }}>{totalActivos}</div>
        </div>
        <div style={{ borderRadius: '16px', padding: '1.1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <div style={{ color: '#94a3b8', fontSize: '.75rem', marginBottom: '.25rem' }}>Inactivos</div>
          <div style={{ color: 'var(--accent2)', fontSize: '1.4rem', fontWeight: 600 }}>{totalInactivos}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(320px, .85fr)' }}>
        <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '.85rem' }}>
            <Megaphone size={16} style={{ display: 'inline-block', marginRight: '.35rem' }} />
            Comprar anuncio
          </h3>

          {preciosLoading ? (
            <div style={{ color: '#94a3b8' }}>⏳ Cargando precios...</div>
          ) : precios.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>No hay precios disponibles para anuncios.</div>
          ) : (
            <div style={{ display: 'grid', gap: '.7rem' }}>
              <label style={{ color: '#94a3b8', fontSize: '.78rem' }}>
                Precio / tipo / periodo
                <select
                  value={form.idPrecioAnuncio}
                  onChange={e => setForm(prev => ({ ...prev, idPrecioAnuncio: e.target.value }))}
                  style={{ width: '100%', marginTop: '.35rem', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
                >
                  <option value="">Selecciona un precio</option>
                  {precios.map(precio => (
                    <option key={precio.idPrecioAnuncio} value={precio.idPrecioAnuncio}>
                      {precio.tipo.nombre} · {precio.periodo.nombre} · {formatMonto(precio.precio)}
                    </option>
                  ))}
                </select>
              </label>

              <InputGroup
                label="Título"
                value={form.titulo}
                onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                required
                placeholder="Título del anuncio"
              />

              <div>
                <label style={{ color: '#94a3b8', fontSize: '.78rem', display: 'block', marginBottom: '.4rem' }}>Contenido *</label>
                <textarea
                  value={form.contenidoTexto}
                  onChange={e => setForm(prev => ({ ...prev, contenidoTexto: e.target.value }))}
                  rows={5}
                  placeholder="Escribe el contenido del anuncio..."
                  style={{ width: '100%', resize: 'vertical', padding: '.75rem .9rem', borderRadius: '12px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(30,64,175,0.15)', color: '#f1f5f9', outline: 'none' }}
                />
              </div>

              <InputGroup
                label="Fecha de inicio"
                type="datetime-local"
                value={form.fechaInicio}
                onChange={e => setForm(prev => ({ ...prev, fechaInicio: e.target.value }))}
                required
              />

              <button
                type="button"
                onClick={() => setPendingAction({ type: 'buy' })}
                disabled={!form.idPrecioAnuncio || !form.titulo.trim() || !form.contenidoTexto.trim() || comprarMutation.isPending}
                style={{ padding: '.6rem .95rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', cursor: 'pointer' }}
              >
                {comprarMutation.isPending ? '⏳ Comprando...' : 'Comprar anuncio'}
              </button>
            </div>
          )}
        </section>

        <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: '.85rem' }}>Resumen del precio</h3>
          {!precioSeleccionado ? (
            <div style={{ color: '#94a3b8' }}>Selecciona un precio para ver el resumen.</div>
          ) : (
            <div style={{ display: 'grid', gap: '.5rem', color: '#cbd5e1', fontSize: '.85rem' }}>
              <div><strong style={{ color: '#f1f5f9' }}>Tipo:</strong> {precioSeleccionado.tipo.nombre}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Periodo:</strong> {precioSeleccionado.periodo.nombre}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Duración:</strong> {precioSeleccionado.periodo.dias} días</div>
              <div><strong style={{ color: '#f1f5f9' }}>Precio:</strong> <span style={{ color: '#4ade80' }}>{formatMonto(precioSeleccionado.precio)}</span></div>
              <div style={{ color: '#94a3b8', fontSize: '.78rem', lineHeight: 1.5 }}>
                El anuncio quedará asociado a tu usuario y podrás activarlo o desactivarlo desde la lista.
              </div>
            </div>
          )}
        </section>
      </div>

      <section style={{ borderRadius: '16px', padding: '1rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '.9rem', flexWrap: 'wrap' }}>
          <h3 style={{ color: '#f1f5f9' }}>Mis anuncios</h3>
          {anunciosLoading && <span style={{ color: '#94a3b8' }}>⏳ Cargando anuncios...</span>}
        </div>

        {!misAnuncios.length ? (
          <div style={{ color: '#94a3b8' }}>Aún no has comprado anuncios.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {misAnuncios.map(anuncio => (
              <div key={anuncio.idAnuncio} style={{ display: 'grid', gap: '.75rem' }}>
                <AdCard ad={anuncio} delay={0} />
                <button
                  type="button"
                  onClick={() => setPendingAction({ type: 'toggle', anuncio, activar: !anuncio.activo })}
                  style={{
                    justifySelf: 'start',
                    padding: '.45rem .75rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    background: anuncio.activo ? 'rgba(239,68,68,0.16)' : 'rgba(34,197,94,0.16)',
                    color: anuncio.activo ? '#fca5a5' : '#86efac',
                  }}
                >
                  <Power size={14} style={{ display: 'inline-block', marginRight: '.35rem' }} />
                  {anuncio.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        open={!!pendingAction}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={pendingAction?.type === 'buy' ? 'Comprar' : pendingAction?.activar ? 'Activar' : 'Desactivar'}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}

export default AnuncianteAnunciosPage
