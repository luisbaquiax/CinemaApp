import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Building2, Users, Wallet } from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'

const CompaniaDetallePage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { auth } = useAuth()
    const esAdminSistema = auth?.roles.includes('ROLE_ADMIN_SISTEMA') ?? false

    const companiasQuery = useQuery({
        queryKey: ['mis-companias', auth?.idUsuario],
        queryFn: () => cinemaService.getMisCompanias(auth!.idUsuario),
        enabled: !!auth?.idUsuario,
    })

    const compania = useMemo(
        () => companiasQuery.data?.find(c => c.idCompania === Number(id)),
        [companiasQuery.data, id]
    )

    const adminsQuery = useQuery({
        queryKey: ['compania-admins', id],
        queryFn: () => cinemaService.getAdminsByCompania(Number(id)),
        enabled: !!id,
    })

    const carteraQuery = useQuery({
        queryKey: ['compania-cartera', id],
        queryFn: () => cinemaService.getCarteraByCompania(Number(id)),
        enabled: !!id,
    })

    if (companiasQuery.isLoading) {
        return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando compañía...</div>
    }

    if (!compania) {
        return <div style={{ color: 'var(--accent2)', padding: '2rem' }}>No se encontró la compañía.</div>
    }

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
                    {compania.nombreCompania}
                </h1>
                <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
                    Vista general de la compañía y sus administradores.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                        <Building2 color='var(--blue-glow)' />
                        <div>
                            <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{compania.nombreCompania}</div>
                            <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                                {compania.activo ? 'Activa' : 'Inactiva'}
                            </div>
                        </div>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '.9rem', lineHeight: 1.5 }}>
                        {compania.descripcionCompania || 'Sin descripción registrada.'}
                    </p>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                        {esAdminSistema && (
                            <button
                                onClick={() => navigate(`/admin/companias/${compania.idCompania}/admins`)}
                                style={{ padding: '.55rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                            >
                                Ver admins
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/cine/cartera')}
                            style={{ padding: '.55rem 1rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.2)', cursor: 'pointer', background: 'rgba(30,64,175,0.12)', color: '#f1f5f9' }}
                        >
                            Ir a cartera
                        </button>
                    </div>
                </div>

                <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                        <Wallet color='#fcd34d' />
                        <div style={{ color: '#f1f5f9', fontWeight: 500 }}>Cartera</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', color: '#f1f5f9', marginBottom: '.25rem' }}>
                        Q{carteraQuery.data?.saldo?.toFixed?.(2) ?? '0.00'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                        {carteraQuery.isLoading ? 'Cargando saldo...' : 'Saldo disponible de la compañía'}
                    </div>
                </div>
            </div>

            <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)', marginBottom: '1rem' }}>
                <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Administradores asignados</h2>
                {adminsQuery.isLoading ? (
                    <div style={{ color: '#94a3b8' }}>⏳ Cargando admins...</div>
                ) : adminsQuery.data?.length ? (
                    <div style={{ display: 'grid', gap: '.75rem' }}>
                        {adminsQuery.data.map(admin => (
                            <div key={admin.idCompaniaAdmin} style={{ padding: '.9rem 1rem', borderRadius: '12px', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.12)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9' }}>
                                    <Users size={16} />
                                    <span>Usuario #{admin.idUsuario}</span>
                                </div>
                                <div style={{ fontSize: '.78rem', color: '#94a3b8', marginTop: '.2rem' }}>
                                    Asignado el {new Date(admin.fechaAsignacion).toLocaleDateString('es-GT')}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ color: '#94a3b8' }}>No hay administradores asignados.</div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/cine/salas')} style={{ padding: '.55rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(96,165,250,0.12)', color: '#f1f5f9' }}>Ir a salas</button>
                <button onClick={() => navigate('/cine/funciones')} style={{ padding: '.55rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'rgba(96,165,250,0.12)', color: '#f1f5f9' }}>Ir a funciones</button>
            </div>
        </div>
    )
}

export default CompaniaDetallePage