import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Circle } from 'lucide-react'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { cinemaUsuarioService } from '../../services/microservice-cinema/CinemaUsuarioService'
import type { AsientoResponse, BoletoRequest, CompaniaResponse, FuncionResponse, SalaResponse } from '../../types/CinemaCore.types'

type CompraState = {
  funcion: FuncionResponse
  cine: CompaniaResponse
  sala: SalaResponse
}

const toDatetimeLocal = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const CompraBoletoPage = () => {
  const { id, funcionId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuth()
  const qc = useQueryClient()
  const state = location.state as CompraState | undefined
  const [asientoSeleccionadoId, setAsientoSeleccionadoId] = useState<number | null>(null)
  const [fechaPago, setFechaPago] = useState(() => toDatetimeLocal(new Date()))
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const funcionSeleccionada = state?.funcion ?? null
  const cineSeleccionado = state?.cine ?? null
  const salaSeleccionada = state?.sala ?? funcionSeleccionada?.sala ?? null

  const { data: pelicula, isLoading: peliculaLoading } = useQuery({
    queryKey: ['compra-boleto-pelicula', id],
    queryFn: () => cinemaService.getPeliculaById(Number(id)),
    enabled: !!id,
  })

  const { data: asientos = [], isLoading: asientosLoading } = useQuery({
    queryKey: ['asientos-funcion', funcionId],
    queryFn: () => cinemaService.getAsientosDisponiblesOcupadosPorFuncion(Number(funcionId)),
    enabled: !!funcionId,
  })

  const asientosPorFila = useMemo(() => {
    return asientos.reduce<Record<string, AsientoResponse[]>>((acc, asiento) => {
      if (!acc[asiento.fila]) acc[asiento.fila] = []
      acc[asiento.fila].push(asiento)
      return acc
    }, {})
  }, [asientos])

  const filasOrdenadas = useMemo(() => {
    return Object.entries(asientosPorFila)
      .map(([fila, listaAsientos]) => ({
        fila,
        asientos: [...listaAsientos].sort((a, b) => a.columna - b.columna),
      }))
      .sort((a, b) => a.fila.localeCompare(b.fila, 'es', { numeric: true }))
  }, [asientosPorFila])

  const asientoSeleccionado = useMemo(
    () => asientos.find(asiento => asiento.idAsiento === asientoSeleccionadoId) ?? null,
    [asientos, asientoSeleccionadoId],
  )

  useEffect(() => {
    if (!asientos.length) {
      setAsientoSeleccionadoId(null)
      return
    }

    setAsientoSeleccionadoId(prev => {
      if (prev && asientos.some(asiento => asiento.idAsiento === prev && asiento.disponible)) return prev
      return null
    })
  }, [asientos])

  const comprarMutation = useMutation({
    mutationFn: () => {
      if (!auth?.idUsuario || !auth?.token || !funcionSeleccionada || !asientoSeleccionado) {
        throw new Error('Faltan datos para comprar el boleto.')
      }

      const payload: BoletoRequest = {
        idFuncion: funcionSeleccionada.id,
        idAsiento: asientoSeleccionado.idAsiento,
        idUsuario: auth.idUsuario,
        monto: Number(funcionSeleccionada.precio),
        fechaPago,
        token: auth.token,
      }

      return cinemaUsuarioService.comprarBoleto(payload)
    },
    onSuccess: res => {
      setMsg({ type: 'ok', text: 'Boleto comprado correctamente.' })
      qc.invalidateQueries({ queryKey: ['mis-boletos', auth?.idUsuario] })
      setTimeout(() => {
        navigate('/mis-boletos')
      }, 500)
    },
    onError: (err: any) => setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo comprar el boleto.' }),
  })

  const handleConfirmarCompra = () => {
    if (!auth?.idUsuario || !funcionSeleccionada || !asientoSeleccionado || !fechaPago) return
    asientoSeleccionado.disponible = false
    comprarMutation.mutate()
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button
        onClick={() => navigate(`/peliculas/${id}/cines`)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginBottom: '1rem', padding: '.45rem .75rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.15)', background: 'rgba(15,23,42,0.35)', color: '#cbd5e1' }}
      >
        <ChevronLeft size={16} />
        Volver a funciones
      </button>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9', marginBottom: '.35rem' }}>
        Compra de boleto
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '1.5rem' }}>
        Elige un asiento disponible y completa la fecha de pago antes de confirmar.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr .9fr', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
            {peliculaLoading ? (
              <div style={{ color: '#94a3b8' }}>⏳ Cargando película...</div>
            ) : (
              <>
                <div style={{ color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '.35rem' }}>{pelicula?.pelicula.titulo}</div>
                <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>
                  {cineSeleccionado?.nombreCompania ?? 'Cine'} · {salaSeleccionada?.nombre ?? 'Sala'}
                </div>
              </>
            )}
          </div>

          <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
              <Circle size={16} />
              <span>Asientos disponibles</span>
            </div>

            {asientosLoading ? (
              <div style={{ color: '#94a3b8' }}>⏳ Cargando asientos...</div>
            ) : filasOrdenadas.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>No hay asientos para esta función.</div>
            ) : (
              <div style={{ display: 'grid', gap: '.9rem' }}>
                {filasOrdenadas.map(({ fila, asientos: asientosFila }) => (
                  <div key={fila} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: '.75rem', alignItems: 'center' }}>
                    <div style={{ color: '#bfdbfe', fontWeight: 700, textAlign: 'center' }}>{fila}</div>
                    <div style={{ display: 'flex', gap: '.45rem', flexWrap: 'wrap' }}>
                      {asientosFila.map(asiento => {
                        const isSelected = asientoSeleccionadoId === asiento.idAsiento
                        return (
                          <button
                            key={asiento.idAsiento}
                            disabled={!asiento.disponible}
                            onClick={() => setAsientoSeleccionadoId(asiento.idAsiento)}
                            style={{
                              width: '56px',
                              height: '48px',
                              borderRadius: '10px',
                              border: `1px solid ${isSelected ? 'rgba(96,165,250,0.8)' : asiento.disponible ? 'rgba(96,165,250,0.15)' : 'rgba(148,163,184,0.18)'}`,
                              background: isSelected ? 'rgba(37,99,235,0.3)' : asiento.disponible ? 'rgba(30,41,59,0.45)' : 'rgba(71,85,105,0.35)',
                              color: asiento.disponible ? '#f1f5f9' : '#94a3b8',
                              cursor: asiento.disponible ? 'pointer' : 'not-allowed',
                              opacity: asiento.disponible ? 1 : 0.55,
                            }}
                          >
                            <div style={{ fontSize: '.82rem', fontWeight: 700 }}>{asiento.columna}</div>
                            <div style={{ fontSize: '.68rem' }}>{asiento.disponible ? 'Disp.' : 'Ocup.'}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '.75rem' }}>Resumen de compra</div>
            <div style={{ display: 'grid', gap: '.45rem', color: '#cbd5e1', fontSize: '.86rem' }}>
              <div><strong style={{ color: '#f1f5f9' }}>Película:</strong> {pelicula?.pelicula.titulo ?? '—'}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Cine:</strong> {cineSeleccionado?.nombreCompania ?? '—'}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Sala:</strong> {salaSeleccionada?.nombre ?? '—'}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Función:</strong> {funcionSeleccionada ? new Date(funcionSeleccionada.fechaHoraInicio).toLocaleString('es-ES') : '—'}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Asiento:</strong> {asientoSeleccionado ? `${asientoSeleccionado.fila}${asientoSeleccionado.columna}` : '—'}</div>
              <div><strong style={{ color: '#f1f5f9' }}>Monto:</strong> Q {funcionSeleccionada ? Number(funcionSeleccionada.precio).toFixed(2) : '0.00'}</div>
            </div>
          </div>

          <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '.75rem' }}>Fecha de pago</div>
            <InputGroup
              label="Fecha de pago"
              type="datetime-local"
              value={fechaPago}
              onChange={e => setFechaPago(e.target.value)}
              required
            />
          </div>

          {msg && (
            <div style={{
              padding: '.75rem 1rem', borderRadius: '10px',
              background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
              fontSize: '.84rem'
            }}>
              {msg.text}
            </div>
          )}

          <button
            onClick={handleConfirmarCompra}
            disabled={!auth?.idUsuario || !funcionSeleccionada || !asientoSeleccionado || !fechaPago || comprarMutation.isPending}
            style={{
              padding: '.15rem 1rem',
              borderRadius: '12px',
              border: 'none',
              cursor: !auth?.idUsuario || !funcionSeleccionada || !asientoSeleccionado || !fechaPago || comprarMutation.isPending ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
              color: '#fff',
              fontWeight: 100,
            }}
          >
            {comprarMutation.isPending ? '⏳ Confirmando compra...' : 'Confirmar compra'}
          </button>

          <div style={{ color: '#94a3b8', fontSize: '.78rem' }}>
            Los asientos ocupados aparecen deshabilitados y no pueden seleccionarse.
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompraBoletoPage