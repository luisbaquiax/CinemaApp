import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { resolveSelectedCompania, setStoredSelectedCompaniaId } from '../../utils/adminCineSelection'
import type {
    CompaniaResponse,
    FuncionRequest,
    FuncionResponse,
    FuncionUpdateRequest,
    PeliculaResponse,
    SalaResponse,
} from '../../types/CinemaCore.types'

type CreateFormState = {
    idSala: string
    idPelicula: string
    fechaHoraInicio: string
    precio: string
}

type UpdateFormState = {
    idPelicula: string
    fechaHoraInicio: string
    precio: string
    activo: boolean
}

type PendingAction =
    | { type: 'update'; funcion: FuncionResponse }
    | { type: 'toggle'; funcion: FuncionResponse; activar: boolean }

const emptyCreateForm: CreateFormState = {
    idSala: '',
    idPelicula: '',
    fechaHoraInicio: '',
    precio: '',
}

const emptyUpdateForm: UpdateFormState = {
    idPelicula: '',
    fechaHoraInicio: '',
    precio: '',
    activo: true,
}

const FuncionesPage = () => {
    const { auth } = useAuth()
    const [selectedCompaniaId, setSelectedCompaniaId] = useState<number | null>(null)
    const [selectedSalaId, setSelectedSalaId] = useState<number | null>(null)
    const [createForm, setCreateForm] = useState<CreateFormState>(emptyCreateForm)
    const [editingFuncion, setEditingFuncion] = useState<FuncionResponse | null>(null)
    const [updateForm, setUpdateForm] = useState<UpdateFormState>(emptyUpdateForm)
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

    const { data: companias = [], isLoading: companiasLoading } = useQuery<CompaniaResponse[]>({
        queryKey: ['admin-cine-companias-funciones', auth?.idUsuario],
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

    const { data: salas = [], isLoading: salasLoading } = useQuery<SalaResponse[]>({
        queryKey: ['admin-cine-funciones-salas', selectedCompaniaId],
        queryFn: () => cinemaAdminCineService.getSalasByCompania(selectedCompaniaId as number),
        enabled: !!selectedCompaniaId,
    })

    useEffect(() => {
        if (!salas.length) {
            setSelectedSalaId(null)
            setCreateForm(prev => ({ ...prev, idSala: '' }))
            return
        }
        setSelectedSalaId(prev => prev ?? salas[0].salaId)
        setCreateForm(prev => ({ ...prev, idSala: prev.idSala || String(salas[0].salaId) }))
    }, [salas])

    const {
        data: funciones = [],
        isLoading: funcionesLoading,
        refetch: refetchFunciones,
    } = useQuery<FuncionResponse[]>({
        queryKey: ['admin-cine-funciones-by-sala', selectedSalaId],
        queryFn: () => cinemaAdminCineService.getFuncionesBySala(selectedSalaId as number),
        enabled: !!selectedSalaId,
    })

    const { data: peliculasActivas = [] } = useQuery<PeliculaResponse[]>({
        queryKey: ['peliculas-activas-funciones-admin-cine'],
        queryFn: () => cinemaService.getPeliculasActivas(),
    })

    const createMutation = useMutation({
        mutationFn: (payload: FuncionRequest) => cinemaAdminCineService.createFuncion(payload),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Función creada correctamente.' })
            setCreateForm(prev => ({ ...emptyCreateForm, idSala: prev.idSala }))
            await refetchFunciones()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo crear la función.' }),
    })

    const updateMutation = useMutation({
        mutationFn: ({ idFuncion, payload }: { idFuncion: number; payload: FuncionUpdateRequest }) =>
            cinemaAdminCineService.updateFuncion(idFuncion, payload),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Función actualizada correctamente.' })
            setEditingFuncion(null)
            setUpdateForm(emptyUpdateForm)
            await refetchFunciones()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo actualizar la función.' }),
    })

    const toggleMutation = useMutation({
        mutationFn: ({ idFuncion, activar }: { idFuncion: number; activar: boolean }) =>
            cinemaAdminCineService.toggleFuncionVisibilidad(idFuncion, activar),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Estado de función actualizado.' })
            await refetchFunciones()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo cambiar el estado de la función.' }),
    })

    const confirmConfig = useMemo(() => {
        if (!pendingAction) return null
        if (pendingAction.type === 'update') {
            return {
                title: 'Actualizar función',
                message: `¿Deseas actualizar la función #${pendingAction.funcion.id}?`,
                confirmText: 'Actualizar',
            }
        }
        return {
            title: pendingAction.activar ? 'Activar función' : 'Desactivar función',
            message: pendingAction.activar
                ? `¿Deseas activar la función #${pendingAction.funcion.id}?`
                : `¿Deseas desactivar la función #${pendingAction.funcion.id}?`,
            confirmText: pendingAction.activar ? 'Activar' : 'Desactivar',
        }
    }, [pendingAction])

    const executePendingAction = () => {
        if (!pendingAction) return

        if (pendingAction.type === 'update') {
            updateMutation.mutate({
                idFuncion: pendingAction.funcion.id,
                payload: {
                    idPelicula: Number(updateForm.idPelicula),
                    fechaHoraInicio: updateForm.fechaHoraInicio,
                    precio: Number(updateForm.precio),
                    activo: updateForm.activo,
                },
            })
        }

        if (pendingAction.type === 'toggle') {
            toggleMutation.mutate({ idFuncion: pendingAction.funcion.id, activar: pendingAction.activar })
        }

        setPendingAction(null)
    }

    const submitCreate = () => {
        createMutation.mutate({
            idSala: Number(createForm.idSala),
            idPelicula: Number(createForm.idPelicula),
            fechaHoraInicio: createForm.fechaHoraInicio,
            precio: Number(createForm.precio),
            activo: true,
        })
    }

    if (companiasLoading) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando compañías...</div>
    }

    if (!companias.length) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>Aún no tiene un cine para administrar.</div>
    }

    return (
        <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <h1 style={{ color: '#f1f5f9', marginBottom: '.25rem' }}>Funciones</h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Crea, actualiza y cambia estado de funciones por sala.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.8rem', marginBottom: '1rem' }}>
                <div>
                    <label style={{ color: '#cbd5e1', fontSize: '.82rem', display: 'block', marginBottom: '.35rem' }}>Compañía</label>
                    <select
                        value={selectedCompaniaId ?? ''}
                        onChange={e => {
                            const id = Number(e.target.value)
                            setSelectedCompaniaId(id)
                            setStoredSelectedCompaniaId(id)
                            setSelectedSalaId(null)
                            setCreateForm(emptyCreateForm)
                            setEditingFuncion(null)
                        }}
                        style={{ width: '100%', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
                    >
                        {companias.map(c => (
                            <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ color: '#cbd5e1', fontSize: '.82rem', display: 'block', marginBottom: '.35rem' }}>Sala para listar funciones</label>
                    <select
                        value={selectedSalaId ?? ''}
                        onChange={e => {
                            const next = Number(e.target.value)
                            setSelectedSalaId(next)
                            setCreateForm(prev => ({ ...prev, idSala: String(next) }))
                        }}
                        style={{ width: '100%', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
                        disabled={salasLoading || !salas.length}
                    >
                        {salas.map(s => (
                            <option key={s.salaId} value={s.salaId}>{s.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {msg && <div style={{ marginBottom: '1rem', color: msg.type === 'ok' ? '#4ade80' : '#f87171', fontSize: '.85rem' }}>{msg.text}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem', alignItems: 'start' }}>
                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.1)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>{editingFuncion ? 'Editar función' : 'Crear función'}</h3>

                    {!editingFuncion ? (
                        <div style={{ display: 'grid', gap: '.6rem' }}>
                            <select
                                value={createForm.idSala}
                                onChange={e => setCreateForm(prev => ({ ...prev, idSala: e.target.value }))}
                                style={{ padding: '.6rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.6)', color: '#f1f5f9' }}
                            >
                                <option value="">Seleccione sala</option>
                                {salas.map(s => <option key={s.salaId} value={s.salaId}>{s.nombre}</option>)}
                            </select>

                            <select
                                value={createForm.idPelicula}
                                onChange={e => setCreateForm(prev => ({ ...prev, idPelicula: e.target.value }))}
                                style={{ padding: '.6rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.6)', color: '#f1f5f9' }}
                            >
                                <option value="">Seleccione película</option>
                                {peliculasActivas.map(p => <option key={p.idPelicula} value={p.idPelicula}>{p.titulo}</option>)}
                            </select>

                            <InputGroup
                                label="Fecha y hora inicio"
                                type="datetime-local"
                                value={createForm.fechaHoraInicio}
                                onChange={e => setCreateForm(prev => ({ ...prev, fechaHoraInicio: e.target.value }))}
                                required
                            />

                            <InputGroup
                                label="Precio"
                                type="number"
                                minValue={0}
                                value={createForm.precio}
                                onChange={e => setCreateForm(prev => ({ ...prev, precio: e.target.value }))}
                                placeholder="Precio"
                                required
                            />

                            <button
                                onClick={submitCreate}
                                disabled={createMutation.isPending || !createForm.idSala || !createForm.idPelicula || !createForm.fechaHoraInicio || !createForm.precio}
                                style={{ padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                            >
                                Crear función
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '.6rem' }}>
                            <select
                                value={updateForm.idPelicula}
                                onChange={e => setUpdateForm(prev => ({ ...prev, idPelicula: e.target.value }))}
                                style={{ padding: '.6rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.6)', color: '#f1f5f9' }}
                            >
                                {peliculasActivas.map(p => <option key={p.idPelicula} value={p.idPelicula}>{p.titulo}</option>)}
                            </select>

                            <InputGroup
                                label="Fecha y hora inicio"
                                type="datetime-local"
                                value={updateForm.fechaHoraInicio}
                                onChange={e => setUpdateForm(prev => ({ ...prev, fechaHoraInicio: e.target.value }))}
                                required
                            />

                            <InputGroup
                                label="Precio"
                                type="number"
                                minValue={0}
                                value={updateForm.precio}
                                onChange={e => setUpdateForm(prev => ({ ...prev, precio: e.target.value }))}
                                placeholder="Precio"
                                required
                            />

                            <label style={{ color: '#cbd5e1', fontSize: '.82rem' }}>
                                <input type="checkbox" checked={updateForm.activo} onChange={e => setUpdateForm(prev => ({ ...prev, activo: e.target.checked }))} style={{ marginRight: '.4rem' }} />
                                Activa
                            </label>

                            <div style={{ display: 'flex', gap: '.6rem' }}>
                                <button
                                    onClick={() => setPendingAction({ type: 'update', funcion: editingFuncion })}
                                    disabled={updateMutation.isPending || !updateForm.idPelicula || !updateForm.fechaHoraInicio || !updateForm.precio}
                                    style={{ flex: 1, padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                                >
                                    Guardar cambios
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingFuncion(null)
                                        setUpdateForm(emptyUpdateForm)
                                    }}
                                    style={{ padding: '.55rem .8rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'transparent', color: '#cbd5e1' }}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Funciones por sala</h3>
                    {funcionesLoading ? (
                        <div style={{ color: '#94a3b8' }}>⏳ Cargando funciones...</div>
                    ) : !funciones.length ? (
                        <div style={{ color: '#94a3b8' }}>No hay funciones registradas para esta sala.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '.7rem' }}>
                            {funciones.map(fn => (
                                <div key={fn.id} style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '10px', padding: '.9rem', background: 'rgba(30,41,59,0.4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.4rem' }}>
                                                <div style={{ color: '#bfdbfe', fontWeight: 700, fontSize: '1rem' }}>
                                                    {fn.pelicula.titulo}
                                                </div>
                                                <span style={{ color: '#64748b', fontSize: '.75rem' }}>#{fn.id}</span>
                                            </div>
                                            <div style={{ color: '#cbd5e1', fontSize: '.85rem', marginBottom: '.3rem' }}>
                                                📽️ {fn.sala.nombre} · 🎬 {fn.pelicula.titulo}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '.8rem', marginBottom: '.4rem' }}>
                                                🕒 Inicio: {new Date(fn.fechaHoraInicio).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '.8rem', marginBottom: '.3rem' }}>
                                                🕐 Fin: {new Date(fn.fechaHoraFin).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem', marginTop: '.5rem' }}>
                                                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                                                    💰 Q {Number(fn.precio).toFixed(2)}
                                                </span>
                                                <span style={{ 
                                                    color: fn.activo ? '#86efac' : '#fb7185', 
                                                    fontWeight: 500,
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '4px',
                                                    background: fn.activo ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)'
                                                }}>
                                                    {fn.activo ? '✓ Activa' : '✗ Inactiva'}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    setEditingFuncion(fn)
                                                    setUpdateForm({
                                                        idPelicula: String(fn.pelicula.idPelicula),
                                                        fechaHoraInicio: fn.fechaHoraInicio.slice(0, 16),
                                                        precio: String(fn.precio),
                                                        activo: fn.activo,
                                                    })
                                                }}
                                                style={{ padding: '.35rem .65rem', borderRadius: '6px', border: 'none', background: 'rgba(59,130,246,0.2)', color: '#bfdbfe', cursor: 'pointer', fontSize: '.8rem', fontWeight: 500 }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setPendingAction({ type: 'toggle', funcion: fn, activar: !fn.activo })}
                                                style={{ padding: '.35rem .65rem', borderRadius: '6px', border: 'none', background: fn.activo ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)', color: fn.activo ? '#fca5a5' : '#86efac', cursor: 'pointer', fontSize: '.8rem', fontWeight: 500 }}
                                            >
                                                {fn.activo ? '🔒 Desactivar' : '🔓 Activar'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>

            <ConfirmModal
                open={!!pendingAction}
                title={confirmConfig?.title}
                message={confirmConfig?.message}
                confirmText={confirmConfig?.confirmText}
                cancelText="Cancelar"
                onConfirm={executePendingAction}
                onCancel={() => setPendingAction(null)}
            />
        </div>
    )
}

export default FuncionesPage