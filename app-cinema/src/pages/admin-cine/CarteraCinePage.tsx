import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import type { CompaniaResponse } from '../../types/CinemaCore.types'
import { resolveSelectedCompania, setStoredSelectedCompaniaId } from '../../utils/adminCineSelection'

const CarteraCinePage = () => {
    const { auth } = useAuth()
    const [selectedCompaniaId, setSelectedCompaniaId] = useState<number | null>(null)
    const [monto, setMonto] = useState('')
    const [agregarFondos, setAgregarFondos] = useState(true)
    const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

    const { data: companias = [], isLoading: companiasLoading } = useQuery<CompaniaResponse[]>({
        queryKey: ['admin-cine-companias-cartera', auth?.idUsuario],
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
        data: cartera,
        isLoading: carteraLoading,
        refetch: refetchCartera,
    } = useQuery({
        queryKey: ['admin-cine-cartera', selectedCompaniaId],
        queryFn: () => cinemaAdminCineService.getCarteraByCompania(selectedCompaniaId as number),
        enabled: !!selectedCompaniaId,
    })

    const transaccionMutation = useMutation({
        mutationFn: () =>
            cinemaAdminCineService.addRemoveFunds(selectedCompaniaId as number, {
                monto: Number(monto),
                agregarFondos: true,
            }),
        onSuccess: async res => {
            setMsg({ type: 'ok', text: res.message || 'Transacción realizada correctamente.' })
            setMonto('')
            await refetchCartera()
        },
        onError: () => setMsg({ type: 'err', text: 'No se pudo realizar la transacción.' }),
    })

    if (companiasLoading) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando compañías...</div>
    }

    if (!companias.length) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>Aún no tiene un cine para administrar.</div>
    }

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <h1 style={{ color: '#f1f5f9', marginBottom: '.25rem' }}>Cartera de Cine</h1>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Consulta saldo e historial, y registra transacciones manuales.</p>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ color: '#cbd5e1', fontSize: '.82rem', display: 'block', marginBottom: '.35rem' }}>Compañía</label>
                <select
                    value={selectedCompaniaId ?? ''}
                    onChange={e => {
                        const id = Number(e.target.value)
                        setSelectedCompaniaId(id)
                        setStoredSelectedCompaniaId(id)
                    }}
                    style={{ width: '100%', padding: '.65rem .7rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.2)', background: 'rgba(15,23,42,0.55)', color: '#f1f5f9' }}
                >
                    {companias.map(c => (
                        <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania}</option>
                    ))}
                </select>
            </div>

            {msg && <div style={{ marginBottom: '1rem', color: msg.type === 'ok' ? '#4ade80' : '#f87171', fontSize: '.85rem' }}>{msg.text}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1rem' }}>
                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(30,64,175,0.1)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Nueva transacción</h3>
                    <div style={{ display: 'grid', gap: '.6rem' }}>
                        <InputGroup
                            label="Monto"
                            type="number"
                            minValue={0.01}
                            value={monto}
                            onChange={e => setMonto(e.target.value)}
                            placeholder="Monto"
                            required
                        />

                        <button
                            onClick={() => transaccionMutation.mutate()}
                            disabled={transaccionMutation.isPending || !monto || Number(monto) <= 0 || !selectedCompaniaId}
                            style={{ padding: '.55rem .8rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                        >
                            Aplicar transacción
                        </button>
                    </div>
                </section>

                <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Estado de cartera</h3>
                    {carteraLoading ? (
                        <div style={{ color: '#94a3b8' }}>⏳ Cargando cartera...</div>
                    ) : !cartera ? (
                        <div style={{ color: '#94a3b8' }}>No hay información de cartera disponible.</div>
                    ) : (
                        <>
                            <div style={{ color: '#e2e8f0', marginBottom: '.8rem' }}>
                                <strong>Saldo actual:</strong>{' '}
                                <span style={{ color: '#4ade80' }}>Q {Number(cartera.saldo).toFixed(2)}</span>
                            </div>

                            {!cartera.transacciones?.length ? (
                                <div style={{ color: '#94a3b8' }}>Sin transacciones registradas.</div>
                            ) : (
                                <div style={{ display: 'grid', gap: '.55rem', maxHeight: '440px', overflowY: 'auto' }}>
                                    {cartera.transacciones.map(t => (
                                        <div key={t.idTransaccion} style={{ border: '1px solid rgba(96,165,250,0.1)', borderRadius: '10px', padding: '.7rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f1f5f9', fontSize: '.85rem' }}>
                                                <span>{t.tipo}</span>
                                                <span>{Number(t.monto).toFixed(2)}</span>
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '.76rem', marginTop: '.2rem' }}>
                                                {t.descripcion || 'Sin descripción'} · {new Date(t.fechaTransaccion).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    )
}

export default CarteraCinePage