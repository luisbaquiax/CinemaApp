import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, MessageCircle, PencilLine, Ticket, Trash2 } from 'lucide-react'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { cinemaUsuarioService } from '../../services/microservice-cinema/CinemaUsuarioService'
import type { CompaniaResponse, ComentarioSalaRequest, ComentarioSalaResponse, FuncionResponse, SalaResponse } from '../../types/CinemaCore.types'

type CommentFormState = {
  comentario: string
  calificacion: string
}

type PendingAction =
  | { type: 'update'; comentario: ComentarioSalaResponse }
  | { type: 'delete'; comentario: ComentarioSalaResponse }

type FuncionCompraState = {
  funcion: FuncionResponse
  cine: CompaniaResponse
  sala: SalaResponse
}

const emptyCommentForm: CommentFormState = {
  comentario: '',
  calificacion: '5',
}

const PeliculaCinesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { auth } = useAuth()
  const qc = useQueryClient()
  const peliculaId = Number(id)
  const [cineSeleccionadoId, setCineSeleccionadoId] = useState<number | null>(null)
  const [salaSeleccionadaId, setSalaSeleccionadaId] = useState<number | null>(null)
  const [commentForm, setCommentForm] = useState<CommentFormState>(emptyCommentForm)
  const [editingComment, setEditingComment] = useState<ComentarioSalaResponse | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: pelicula, isLoading: peliculaLoading } = useQuery({
    queryKey: ['pelicula-cines', id],
    queryFn: () => cinemaService.getPeliculaById(peliculaId),
    enabled: !!id,
  })

  const { data: cines = [], isLoading: cinesLoading } = useQuery({
    queryKey: ['pelicula-cines-lista', id],
    queryFn: () => cinemaService.getCinesPorPelicula(peliculaId),
    enabled: !!id,
  })

  useEffect(() => {
    if (!cineSeleccionadoId && cines.length) {
      setCineSeleccionadoId(cines[0].idCompania)
    }
  }, [cines, cineSeleccionadoId])

  const cineSeleccionado = useMemo(
    () => cines.find(cine => cine.idCompania === cineSeleccionadoId) ?? null,
    [cines, cineSeleccionadoId],
  )

  const { data: funciones = [], isLoading: funcionesLoading } = useQuery({
    queryKey: ['pelicula-funciones-cine', id, cineSeleccionadoId],
    queryFn: () => cinemaService.getFuncionesByPeliculaYCine(peliculaId, cineSeleccionadoId as number),
    enabled: !!id && !!cineSeleccionadoId,
  })

  const funcionesPorSala = useMemo(() => {
    return funciones.reduce<Record<number, FuncionResponse[]>>((acc, funcion) => {
      const salaId = funcion.sala.salaId
      if (!acc[salaId]) acc[salaId] = []
      acc[salaId].push(funcion)
      return acc
    }, {})
  }, [funciones])

  const salasOrdenadas = useMemo(() => {
    return Object.entries(funcionesPorSala).map(([salaId, listaFunciones]) => ({
      salaId: Number(salaId),
      sala: listaFunciones[0].sala,
      funciones: [...listaFunciones].sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)),
    }))
  }, [funcionesPorSala])

  useEffect(() => {
    if (!salasOrdenadas.length) {
      setSalaSeleccionadaId(null)
      return
    }
    setSalaSeleccionadaId(prev => prev ?? salasOrdenadas[0].salaId)
  }, [salasOrdenadas])

  const salaSeleccionada = useMemo(
    () => salasOrdenadas.find(sala => sala.salaId === salaSeleccionadaId) ?? null,
    [salasOrdenadas, salaSeleccionadaId],
  )

  const { data: comentariosSala = [], isLoading: comentariosSalaLoading } = useQuery({
    queryKey: ['comentarios-sala-publicos', salaSeleccionadaId],
    queryFn: () => cinemaService.getComentariosBySala(salaSeleccionadaId as number),
    enabled: !!salaSeleccionadaId,
  })

  useEffect(() => {
    setCommentForm(emptyCommentForm)
    setEditingComment(null)
    setPendingAction(null)
    setMsg(null)
  }, [cineSeleccionadoId, salaSeleccionadaId, id])

  const createMutation = useMutation({
    mutationFn: (payload: ComentarioSalaRequest) => cinemaUsuarioService.crearComentarioSala(salaSeleccionadaId as number, payload),
    onSuccess: res => {
      setMsg({ type: 'ok', text: res.message || 'Comentario agregado correctamente.' })
      setCommentForm(emptyCommentForm)
      qc.invalidateQueries({ queryKey: ['comentarios-sala-publicos', salaSeleccionadaId] })
    },
    onError: (err: any) => setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo agregar el comentario.' }),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: ComentarioSalaRequest) => cinemaUsuarioService.actualizarComentarioSala(editingComment!.idComentarioSala, payload),
    onSuccess: res => {
      setMsg({ type: 'ok', text: res.message || 'Comentario actualizado correctamente.' })
      setEditingComment(null)
      setCommentForm(emptyCommentForm)
      qc.invalidateQueries({ queryKey: ['comentarios-sala-publicos', salaSeleccionadaId] })
    },
    onError: (err: any) => setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo actualizar el comentario.' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (comentario: ComentarioSalaResponse) => cinemaUsuarioService.eliminarComentarioSala(comentario.idComentarioSala, auth!.idUsuario),
    onSuccess: res => {
      setMsg({ type: 'ok', text: res.message || 'Comentario eliminado correctamente.' })
      setEditingComment(null)
      qc.invalidateQueries({ queryKey: ['comentarios-sala-publicos', salaSeleccionadaId] })
    },
    onError: (err: any) => setMsg({ type: 'err', text: err?.response?.data?.message || 'No se pudo eliminar el comentario.' }),
  })

  const handleCreate = () => {
    if (!auth?.idUsuario || !salaSeleccionadaId) return
    createMutation.mutate({
      idSala: salaSeleccionadaId,
      idUsuario: auth.idUsuario,
      comentario: commentForm.comentario.trim(),
      calificacion: Number(commentForm.calificacion),
      token: auth.token,
    })
  }

  const handleConfirm = () => {
    if (!pendingAction || !salaSeleccionadaId) return

    setPendingAction(null)

    const payload: ComentarioSalaRequest = {
      idSala: salaSeleccionadaId,
      idUsuario: auth!.idUsuario,
      comentario: commentForm.comentario.trim(),
      calificacion: Number(commentForm.calificacion),
      token: auth!.token,
    }

    if (pendingAction.type === 'update') {
      updateMutation.mutate(payload)
      return
    }

    deleteMutation.mutate(pendingAction.comentario)
  }

  const handleSeleccionarFuncion = (funcion: FuncionResponse, sala: SalaResponse) => {
    if (!cineSeleccionado) return

    const state: FuncionCompraState = {
      funcion,
      cine: cineSeleccionado,
      sala,
    }

    navigate(`/peliculas/${id}/cines/${funcion.id}`, { state })
  }

  const confirmTitle = pendingAction?.type === 'update' ? 'Actualizar comentario' : 'Eliminar comentario'
  const confirmMessage = pendingAction?.type === 'update'
    ? '¿Confirmas que deseas guardar los cambios de tu comentario?'
    : '¿Confirmas que deseas eliminar este comentario?'

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginBottom: '1rem', padding: '.45rem .75rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.15)', background: 'rgba(15,23,42,0.35)', color: '#cbd5e1' }}
      >
        ← Volver
      </button>

      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9', marginBottom: '.5rem' }}>
        Cines de la película
      </h1>
      <p style={{ fontSize: '.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        Selecciona un cine para ver sus salas, funciones disponibles y comentarios por sala.
      </p>

      <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)', marginBottom: '1rem' }}>
        {peliculaLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando película...</div>
        ) : (
          <>
            <div style={{ color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '.35rem' }}>{pelicula?.pelicula.titulo}</div>
            <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>
              Selecciona un cine, una función y luego abre la pantalla de asientos.
            </div>
          </>
        )}
      </div>

      <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
          <MapPin size={16} />
          <span>Cines disponibles</span>
        </div>

        {cinesLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando cines...</div>
        ) : cines.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>No hay cines disponibles para esta película.</div>
        ) : (
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
            {cines.map(cine => (
              <button
                key={cine.idCompania}
                onClick={() => setCineSeleccionadoId(cine.idCompania)}
                style={{
                  padding: '.5rem .8rem',
                  borderRadius: '999px',
                  border: cineSeleccionadoId === cine.idCompania ? '1px solid var(--blue-glow)' : '1px solid rgba(96,165,250,0.15)',
                  background: cineSeleccionadoId === cine.idCompania ? 'rgba(37,99,235,0.28)' : 'rgba(30,41,59,0.45)',
                  color: cineSeleccionadoId === cine.idCompania ? '#f1f5f9' : '#cbd5e1',
                  cursor: 'pointer',
                }}
              >
                {cine.nombreCompania}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
          <Ticket size={16} />
          <span>Salas y funciones</span>
        </div>

        {funcionesLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando funciones...</div>
        ) : salasOrdenadas.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>No hay funciones registradas para el cine seleccionado.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {salasOrdenadas.map(({ salaId, sala, funciones: funcionesSala }) => (
              <div key={salaId} style={{ borderRadius: '14px', padding: '1rem', background: salaSeleccionadaId === salaId ? 'rgba(37,99,235,0.16)' : 'rgba(30,64,175,0.12)', border: `1px solid ${salaSeleccionadaId === salaId ? 'rgba(96,165,250,0.4)' : 'rgba(96,165,250,0.12)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '.7rem' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{sala.nombre}</div>
                    <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                      Capacidad {sala.capacidad} · {sala.filas} filas · {sala.columnas} columnas
                    </div>
                  </div>
                  <div style={{ color: sala.visible ? '#86efac' : '#fca5a5', fontSize: '.8rem' }}>
                    {sala.visible ? 'Visible' : 'Oculta'}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '.55rem' }}>
                  {funcionesSala.map(funcion => (
                    <button
                      key={funcion.id}
                      onClick={() => handleSeleccionarFuncion(funcion, sala)}
                      style={{ padding: '.75rem', borderRadius: '10px', background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(96,165,250,0.08)', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{ color: '#f1f5f9', fontWeight: 500 }}>
                        {new Date(funcion.fechaHoraInicio).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                        Hasta {new Date(funcion.fechaHoraFin).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })} · Q {Number(funcion.precio).toFixed(2)}
                      </div>
                      <div style={{ color: 'var(--blue-glow)', fontSize: '.75rem', marginTop: '.25rem' }}>
                        Ver asientos y comprar boleto
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '.8rem' }}>
                  <button
                    onClick={() => setSalaSeleccionadaId(salaId)}
                    style={{ padding: '.45rem .7rem', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontSize: '.78rem' }}
                  >
                    Ver comentarios de esta sala
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
          <MessageCircle size={16} />
          <span>Comentarios de la sala</span>
        </div>

        {msg && (
          <div style={{
            padding: '.75rem 1rem', borderRadius: '10px', marginBottom: '1rem',
            background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
            fontSize: '.84rem'
          }}>
            {msg.text}
          </div>
        )}

        {!salaSeleccionada ? (
          <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>Selecciona una sala para ver y comentar sus opiniones.</div>
        ) : (
          <>
            <div style={{ color: '#f1f5f9', marginBottom: '.85rem' }}>
              Sala seleccionada: <strong>{salaSeleccionada.sala.nombre}</strong>
            </div>

            {auth?.idUsuario ? (
              <div style={{ display: 'grid', gap: '.9rem', marginBottom: '1.25rem' }}>
                <InputGroup
                  label="Calificación"
                  type="number"
                  minValue={1}
                  maxValue={5}
                  value={commentForm.calificacion}
                  onChange={e => setCommentForm(prev => ({ ...prev, calificacion: e.target.value }))}
                  required
                />
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '.78rem', display: 'block', marginBottom: '.4rem' }}>Comentario *</label>
                  <textarea
                    value={commentForm.comentario}
                    onChange={e => setCommentForm(prev => ({ ...prev, comentario: e.target.value }))}
                    rows={4}
                    placeholder="Escribe tu opinión sobre la sala..."
                    style={{
                      width: '100%',
                      resize: 'vertical',
                      padding: '.75rem .9rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(96,165,250,0.2)',
                      background: 'rgba(30,64,175,0.15)',
                      color: '#f1f5f9',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !commentForm.comentario.trim()}
                    style={{
                      padding: '.6rem .9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff'
                    }}
                  >
                    {createMutation.isPending ? '⏳ Publicando...' : 'Publicar comentario'}
                  </button>

                  {editingComment && (
                    <button
                      onClick={() => setPendingAction({ type: 'update', comentario: editingComment })}
                      disabled={updateMutation.isPending || !commentForm.comentario.trim()}
                      style={{
                        padding: '.6rem .9rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'rgba(59,130,246,0.18)', color: '#bfdbfe'
                      }}
                    >
                      {updateMutation.isPending ? '⏳ Actualizando...' : 'Guardar cambios'}
                    </button>
                  )}

                  {editingComment && (
                    <button
                      onClick={() => {
                        setEditingComment(null)
                        setCommentForm(emptyCommentForm)
                      }}
                      style={{ padding: '.6rem .9rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.15)', background: 'transparent', color: '#cbd5e1' }}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '1rem' }}>
                Inicia sesión para comentar y calificar esta sala.
              </div>
            )}

            {comentariosSalaLoading ? (
              <div style={{ color: '#94a3b8' }}>⏳ Cargando comentarios...</div>
            ) : comentariosSala.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>Todavía no hay comentarios para esta sala.</div>
            ) : (
              <div style={{ display: 'grid', gap: '.75rem' }}>
                {comentariosSala.map(comentario => {
                  const esMio = comentario.idUsuario === auth?.idUsuario
                  return (
                    <div key={comentario.idComentarioSala} style={{ borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.12)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '.5rem' }}>
                        <div>
                          <div style={{ color: '#f1f5f9', fontWeight: 600 }}>
                            ⭐ {comentario.calificacion}/5 {esMio && <span style={{ color: 'var(--blue-glow)', fontSize: '.75rem' }}>· Tu comentario</span>}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '.76rem' }}>
                            {new Date(comentario.createdAt).toLocaleString('es-ES')}
                          </div>
                        </div>
                        {esMio && (
                          <div style={{ display: 'flex', gap: '.4rem' }}>
                            <button
                              onClick={() => {
                                setEditingComment(comentario)
                                setCommentForm({ comentario: comentario.comentario, calificacion: String(comentario.calificacion) })
                              }}
                              style={{ padding: '.35rem .55rem', borderRadius: '8px', border: 'none', background: 'rgba(59,130,246,0.2)', color: '#bfdbfe', cursor: 'pointer' }}
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              onClick={() => setPendingAction({ type: 'delete', comentario })}
                              style={{ padding: '.35rem .55rem', borderRadius: '8px', border: 'none', background: 'rgba(239,68,68,0.16)', color: '#fca5a5', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p style={{ color: '#cbd5e1', fontSize: '.9rem', lineHeight: 1.6 }}>{comentario.comentario}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        open={!!pendingAction}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={pendingAction?.type === 'update' ? 'Actualizar' : 'Eliminar'}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}

export default PeliculaCinesPage
