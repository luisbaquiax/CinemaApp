import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'

const MisCompaniasPage = () => {
  const { auth }   = useAuth()
  const navigate   = useNavigate()

  const { data: companias = [], isLoading } = useQuery({
    queryKey: ['mis-companias', auth?.idUsuario],
    queryFn:  () => cinemaService.getMisCompanias(auth!.idUsuario),
    enabled:  !!auth?.idUsuario,
  })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Mis Compañías
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Selecciona una compañía para administrar sus salas, funciones y cartera.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>⏳ Cargando...</div>
      ) : companias.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>
          <Building2 size={40} style={{ margin: '0 auto .75rem', opacity: .3 }} />
          <p style={{ fontSize: '.9rem' }}>No tenés compañías asignadas aún.</p>
          <p style={{ fontSize: '.8rem', color: '#475569', marginTop: '.4rem' }}>
            Contactá al administrador del sistema.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {companias.map(c => (
            <div
              key={c.idCompania}
              onClick={() => navigate(`/cine/companias/${c.idCompania}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.25rem 1.5rem', borderRadius: '16px', cursor: 'pointer',
                background: 'rgba(30,64,175,0.12)',
                border: '1px solid rgba(96,165,250,0.15)',
                transition: 'all .2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(96,165,250,0.15)'
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              {/* Icono */}
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: 'rgba(37,99,235,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Building2 size={22} style={{ color: 'var(--blue-glow)' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '.95rem', fontWeight: 500, color: '#f1f5f9', marginBottom: '.2rem' }}>
                  {c.nombreCompania}
                </div>
                {c.descripcionCompania && (
                  <div style={{ fontSize: '.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.descripcionCompania}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '.75rem', marginTop: '.4rem' }}>
                  <span style={{
                    fontSize: '.65rem', fontWeight: 500, padding: '.15rem .45rem', borderRadius: '999px',
                    background: c.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: c.activo ? '#4ade80' : 'var(--accent2)',
                  }}>
                    {c.activo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              <ChevronRight size={18} style={{ color: '#475569', flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MisCompaniasPage