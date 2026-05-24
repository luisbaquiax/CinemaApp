import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Armchair, Clock, Wallet, BarChart3, Building2 } from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import { resolveSelectedCompania, setStoredSelectedCompaniaId } from '../../utils/adminCineSelection'

const cardStyle: React.CSSProperties = {
  borderRadius: '14px',
  border: '1px solid rgba(96,165,250,0.15)',
  background: 'rgba(30,64,175,0.1)',
  padding: '1rem',
}

const AdminCineOpcionesPage = () => {
  const { auth } = useAuth()
  const navigate = useNavigate()
  const { idCompania } = useParams()

  const { data: companias = [], isLoading } = useQuery({
    queryKey: ['admin-cine-mis-companias', auth?.idUsuario],
    queryFn: () => cinemaAdminCineService.getMisCompanias(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  const companiaSeleccionada = useMemo(() => {
    const idFromRoute = idCompania ? Number(idCompania) : null
    return resolveSelectedCompania(companias, Number.isNaN(idFromRoute ?? NaN) ? null : idFromRoute)
  }, [companias, idCompania])

  useEffect(() => {
    if (companiaSeleccionada) {
      setStoredSelectedCompaniaId(companiaSeleccionada.idCompania)
    }
  }, [companiaSeleccionada])

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando cines...</div>
  }

  if (!companias.length) {
    return (
      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <Building2 size={44} style={{ margin: '0 auto .9rem', color: '#64748b' }} />
        <h1 style={{ color: '#f1f5f9', marginBottom: '.5rem' }}>Aún no tiene un cine para administrar</h1>
        <p style={{ color: '#94a3b8', fontSize: '.9rem' }}>
          Cuando el administrador del sistema le asigne uno, podrá ver salas, funciones y cartera desde aquí.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Panel Admin Cine
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '.88rem' }}>
          Selecciona el cine que quieres administrar y navega por sus módulos.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: '1rem' }}>
        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '.4rem', fontSize: '.82rem' }}>
          Cine a administrar
        </label>
        <select
          value={companiaSeleccionada?.idCompania ?? ''}
          onChange={e => {
            const id = Number(e.target.value)
            setStoredSelectedCompaniaId(id)
            navigate(`/cine/opciones/${id}`)
          }}
          style={{
            width: '100%',
            padding: '.65rem .7rem',
            borderRadius: '8px',
            border: '1px solid rgba(96,165,250,0.2)',
            background: 'rgba(15,23,42,0.55)',
            color: '#f1f5f9',
          }}
        >
          {companias.map(c => (
            <option key={c.idCompania} value={c.idCompania}>
              {c.nombreCompania}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1rem' }}>
        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
            <Armchair size={16} color="#93c5fd" />
            <h3 style={{ color: '#f1f5f9', fontSize: '.95rem' }}>Salas</h3>
          </div>
          
          <button
            onClick={() => navigate('/cine/salas')}
            style={{ marginTop: '.6rem', padding: '.5rem .85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', cursor: 'pointer' }}
          >
            Ir a Salas
          </button>
        </section>

        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
            <Clock size={16} color="#93c5fd" />
            <h3 style={{ color: '#f1f5f9', fontSize: '.95rem' }}>Funciones</h3>
          </div>
          
          <button
            onClick={() => navigate('/cine/funciones')}
            style={{ marginTop: '.6rem', padding: '.5rem .85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', cursor: 'pointer' }}
          >
            Ir a Funciones
          </button>
        </section>

        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
            <Wallet size={16} color="#93c5fd" />
            <h3 style={{ color: '#f1f5f9', fontSize: '.95rem' }}>Cartera</h3>
          </div>
         
          <button
            onClick={() => navigate('/cine/cartera')}
            style={{ marginTop: '.6rem', padding: '.5rem .85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', cursor: 'pointer' }}
          >
            Ir a Cartera
          </button>
        </section>

        <section style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.7rem' }}>
            <BarChart3 size={16} color="#93c5fd" />
            <h3 style={{ color: '#f1f5f9', fontSize: '.95rem' }}>Reportes</h3>
          </div>

          <button
            onClick={() => navigate('/cine/reportes')}
            style={{ marginTop: '.6rem', padding: '.5rem .85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', cursor: 'pointer' }}
          >
            Ir a reportes
          </button>
        </section>
      </div>
    </div>
  )
}

export default AdminCineOpcionesPage
