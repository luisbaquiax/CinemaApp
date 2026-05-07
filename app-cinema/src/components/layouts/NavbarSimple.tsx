import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'

const roleLabel: Record<string, string> = {
  ROLE_ADMIN_SISTEMA: '⚙️ Admin Sistema',
  ROLE_ADMIN_CINE:    '🎬 Admin Cine',
  ROLE_ANUNCIANTE:    '📢 Anunciante',
  ROLE_USUARIO:       '🎟️ Usuario',
}

const NavbarSimple = () => {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const primaryRole  = auth?.roles?.[0]
  const primaryLabel = primaryRole ? roleLabel[primaryRole] : ''

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 1.5rem', height: '60px',
      background: 'rgba(15,23,42,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(96,165,250,0.1)'
    }}>

      {/* Brand */}
      <Link to="/dashboard" style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.4rem', letterSpacing: '.12em',
        color: 'var(--blue-glow)',
        textShadow: '0 0 16px rgba(96,165,250,0.4)',
        textDecoration: 'none'
      }}>
        🎬 CINE<span style={{ color: 'var(--accent)' }}>MAX</span>
      </Link>

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>

        {/* Vista pública */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: '.35rem',
          padding: '.38rem .85rem', borderRadius: '8px',
          fontSize: '.8rem', color: '#94a3b8',
          textDecoration: 'none', transition: 'all .2s',
          border: '1px solid transparent'
        }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(96,165,250,0.08)'
            e.currentTarget.style.color = 'var(--blue-glow)'
            e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#94a3b8'
            e.currentTarget.style.borderColor = 'transparent'
          }}
        >
          <Globe size={14} /> Vista pública
        </Link>

        {/* Separador */}
        <div style={{ width: '1px', height: '24px', background: 'rgba(96,165,250,0.12)' }} />

        {/* Usuario */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.82rem', fontWeight: 600, color: '#fff', flexShrink: 0
          }}>
            {auth?.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '.8rem', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.2 }}>
              {auth?.username}
            </div>
            <div style={{ fontSize: '.62rem', color: 'var(--blue-glow)' }}>
              {primaryLabel}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '.35rem',
            padding: '.38rem .75rem', borderRadius: '8px',
            fontSize: '.8rem', fontWeight: 500,
            color: 'var(--accent2)', background: 'transparent',
            border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
            transition: 'all .2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
        >
          <LogOut size={14} /> Salir
        </button>
      </div>
    </nav>
  )
}

export default NavbarSimple