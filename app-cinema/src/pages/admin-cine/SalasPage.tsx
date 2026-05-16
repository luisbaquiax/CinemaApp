import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import type { CompaniaResponse, SalaRequest, SalaResponse } from '../../types/CinemaCore.types'
import { resolveSelectedCompania, setStoredSelectedCompaniaId } from '../../utils/adminCineSelection'

type SalaFormState = {
    nombre: string
    filas: string
    columnas: string
    aceptaComentarios: boolean
    visible: boolean
}

type PendingAction =
    | { type: 'update'; sala: SalaResponse }
    | { type: 'toggle-visibilidad'; sala: SalaResponse; activar: boolean }
    | { type: 'toggle-comentarios'; sala: SalaResponse; permitir: boolean }

const emptyForm: SalaFormState = {
    nombre: '',
    filas: '',
    columnas: '',
    aceptaComentarios: true,
    visible: true,
}

const SalasPage = () => {
    const { auth } = useAuth()
    const [selectedCompaniaId, setSelectedCompaniaId] = useState<number | null>(null)
    const [form, setForm] = useState<SalaFormState>(emptyForm)
    const [editingSala, setEditingSala] = useState<SalaResponse | null>(null)
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

    const { data: companias = [], isLoading: companiasLoading } = useQuery<CompaniaResponse[]>({
        queryKey: ['admin-cine-companias-salas', auth?.idUsuario],
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

    const {
        data: salas = [],
        isLoading: salasLoading,
        refetch: refetchSalas,
    } = useQuery<SalaResponse[]>({
        queryKey: ['admin-cine-salas', selectedCompaniaId],
        queryFn: () => cinemaAdminCineService.getSalasByCompania(selectedCompaniaId as number),
        enabled: !!selectedCompaniaId,
    })

    const createMutation = useMutation({
        mutationFn: (payload: SalaRequest) => cinemaAdminCineService.createSala(payload),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Sala creada correctamente.' })
            setForm(emptyForm)
            await refetchSalas()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo crear la sala.' }),
    })

    const updateMutation = useMutation({
        mutationFn: ({ idSala, payload }: { idSala: number; payload: SalaRequest }) =>
            cinemaAdminCineService.updateSala(idSala, payload),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Sala actualizada correctamente.' })
            setEditingSala(null)
            setForm(emptyForm)
            await refetchSalas()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo actualizar la sala.' }),
    })

    const toggleVisibilidadMutation = useMutation({
        mutationFn: ({ idSala, activar }: { idSala: number; activar: boolean }) =>
            cinemaAdminCineService.toggleSalaVisibilidad(idSala, activar),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Visibilidad actualizada.' })
            await refetchSalas()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo actualizar visibilidad.' }),
    })

    const toggleComentariosMutation = useMutation({
        mutationFn: ({ idSala, permitir }: { idSala: number; permitir: boolean }) =>
            cinemaAdminCineService.toggleSalaComentarios(idSala, permitir),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Permisos de comentarios actualizados.' })
            await refetchSalas()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo actualizar comentarios.' }),
    })

    const confirmConfig = useMemo(() => {
        if (!pendingAction) return null
        if (pendingAction.type === 'update') {
            return {
                title: 'Actualizar sala',
                message: `¿Deseas actualizar la sala "${pendingAction.sala.nombre}"?`,
                confirmText: 'Actualizar',
            }
        }
        if (pendingAction.type === 'toggle-visibilidad') {
            return {
                title: pendingAction.activar ? 'Activar visibilidad' : 'Ocultar sala',
                message: pendingAction.activar
                    ? `¿Deseas volver visible la sala "${pendingAction.sala.nombre}"?`
                    : `¿Deseas ocultar la sala "${pendingAction.sala.nombre}"?`,
                confirmText: pendingAction.activar ? 'Activar' : 'Ocultar',
            }
        }
        return {
            title: pendingAction.permitir ? 'Activar comentarios' : 'Desactivar comentarios',
            message: pendingAction.permitir
                ? `¿Permitir comentarios en la sala "${pendingAction.sala.nombre}"?`
                : `¿Desactivar comentarios en la sala "${pendingAction.sala.nombre}"?`,
            confirmText: pendingAction.permitir ? 'Permitir' : 'Desactivar',
        }
    }, [pendingAction])

    const executePendingAction = () => {
        if (!pendingAction || !selectedCompaniaId) return

        if (pendingAction.type === 'update') {
            updateMutation.mutate({
                idSala: pendingAction.sala.salaId,
                payload: {
                    idCompania: selectedCompaniaId,
                    nombre: form.nombre.trim(),
                    filas: Number(form.filas),
                    columnas: Number(form.columnas),
                    aceptaComentarios: form.aceptaComentarios,
                    visible: form.visible,
                },
            })
        }

        if (pendingAction.type === 'toggle-visibilidad') {
            toggleVisibilidadMutation.mutate({
                idSala: pendingAction.sala.salaId,
                activar: pendingAction.activar,
            })
        }

        if (pendingAction.type === 'toggle-comentarios') {
            toggleComentariosMutation.mutate({
                idSala: pendingAction.sala.salaId,
                permitir: pendingAction.permitir,
            })
        }

        setPendingAction(null)
    }

    const submitCreate = () => {
        if (!selectedCompaniaId) return
        createMutation.mutate({
            idCompania: selectedCompaniaId,
            nombre: form.nombre.trim(),
            filas: Number(form.filas),
            columnas: Number(form.columnas),
            aceptaComentarios: form.aceptaComentarios,
            visible: form.visible,
        })
    }

    const isBusy = createMutation.isPending || updateMutation.isPending || toggleComentariosMutation.isPending || toggleVisibilidadMutation.isPending

    if (companiasLoading) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando compañías...</div>
    }

    if (!companias.length) {
        return (
            <div style={{ color: '#94a3b8', padding: '2rem' }}>
                Aún no tiene un cine para administrar.
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <h1 style={{ color: '#f1f5f9', marginBottom: '.25rem' }}>Salas</h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Administra salas por compañía.</p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '.82rem', display: 'block', marginBottom: '.35rem' }}>Compañía</label>
                <select
                    value={selectedCompaniaId ?? ''}
                    onChange={e => {
                        const id = Number(e.target.value)
                        setSelectedCompaniaId(id)
                        setStoredSelectedCompaniaId(id)
                        setEditingSala(null)
                        setForm(emptyForm)
                    }}
                    style={{ width: '100%', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
                >
                    {companias.map(c => (
                        <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania}</option>
                    ))}
                </select>
            </div>

            {msg && (
                <div style={{ marginBottom: '1rem', color: msg.type === 'ok' ? '#4ade80' : '#f87171', fontSize: '.85rem' }}>
                    {msg.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1rem' }}>
                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.1)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>{editingSala ? 'Editar sala' : 'Crear sala'}</h3>
                    <div style={{ display: 'grid', gap: '.6rem' }}>
                        <InputGroup
                            label="Nombre"
                            value={form.nombre}
                            onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                            placeholder="Nombre"
                            required
                        />
                        <InputGroup
                            label="Filas"
                            type="number"
                            value={form.filas}
                            onChange={e => setForm(prev => ({ ...prev, filas: e.target.value }))}
                            minValue={1}
                            maxValue={26}
                            placeholder="Filas"
                            required
                        />
                        <InputGroup
                            label="Columnas"
                            type="number"
                            value={form.columnas}
                            onChange={e => setForm(prev => ({ ...prev, columnas: e.target.value }))}
                            minValue={1}
                            maxValue={40}
                            placeholder="Columnas"
                            required
                        />

                        <label style={{ color: '#cbd5e1', fontSize: '.82rem' }}>
                            <input type="checkbox" checked={form.visible} onChange={e => setForm(prev => ({ ...prev, visible: e.target.checked }))} style={{ marginRight: '.4rem' }} />
                            Visible
                        </label>
                        <label style={{ color: '#cbd5e1', fontSize: '.82rem' }}>
                            <input type="checkbox" checked={form.aceptaComentarios} onChange={e => setForm(prev => ({ ...prev, aceptaComentarios: e.target.checked }))} style={{ marginRight: '.4rem' }} />
                            Permitir comentarios
                        </label>
                    </div>

                    <div style={{ display: 'flex', gap: '.6rem', marginTop: '.8rem' }}>
                        {!editingSala ? (
                            <button
                                onClick={submitCreate}
                                disabled={isBusy || !form.nombre.trim() || !form.filas || !form.columnas}
                                style={{ flex: 1, padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                            >
                                Crear sala
                            </button>
                        ) : (
                            <button
                                onClick={() => setPendingAction({ type: 'update', sala: editingSala })}
                                disabled={isBusy || !form.nombre.trim() || !form.filas || !form.columnas}
                                style={{ flex: 1, padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                            >
                                Guardar cambios
                            </button>
                        )}
                        {editingSala && (
                            <button
                                onClick={() => {
                                    setEditingSala(null)
                                    setForm(emptyForm)
                                }}
                                style={{ padding: '.55rem .8rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'transparent', color: '#cbd5e1' }}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </section>

                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Listado de salas</h3>
                    {salasLoading ? (
                        <div style={{ color: '#94a3b8' }}>⏳ Cargando salas...</div>
                    ) : !salas.length ? (
                        <div style={{ color: '#94a3b8' }}>No hay salas registradas.</div>
                    ) : (
                        <div style={{ display: 'grid', gap: '.55rem' }}>
                            {salas.map(sala => (
                                <div key={sala.salaId} style={{ border: '1px solid rgba(96,165,250,0.1)', borderRadius: '10px', padding: '.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem' }}>
                                        <div>
                                            <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{sala.nombre}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                                                {sala.filas} filas × {sala.columnas} columnas · Capacidad {sala.capacidad}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '.75rem', marginTop: '.2rem' }}>
                                                Visibilidad: {sala.visible ? 'Visible' : 'Oculta'} · Comentarios: {sala.aceptaComentarios ? 'Activos' : 'Desactivados'}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => {
                                                    setEditingSala(sala)
                                                    setForm({
                                                        nombre: sala.nombre,
                                                        filas: String(sala.filas),
                                                        columnas: String(sala.columnas),
                                                        aceptaComentarios: sala.aceptaComentarios,
                                                        visible: sala.visible,
                                                    })
                                                }}
                                                style={{ padding: '.35rem .55rem', borderRadius: '8px', border: 'none', background: 'rgba(59,130,246,0.2)', color: '#bfdbfe' }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setPendingAction({ type: 'toggle-visibilidad', sala, activar: !sala.visible })}
                                                style={{ padding: '.35rem .55rem', borderRadius: '8px', border: 'none', background: 'rgba(168,85,247,0.18)', color: '#ddd6fe' }}
                                            >
                                                {sala.visible ? 'Ocultar' : 'Mostrar'}
                                            </button>
                                            <button
                                                onClick={() => setPendingAction({ type: 'toggle-comentarios', sala, permitir: !sala.aceptaComentarios })}
                                                style={{ padding: '.35rem .55rem', borderRadius: '8px', border: 'none', background: 'rgba(234,179,8,0.2)', color: '#fde68a' }}
                                            >
                                                {sala.aceptaComentarios ? 'Bloq. comentarios' : 'Permitir comentarios'}
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

export default SalasPage