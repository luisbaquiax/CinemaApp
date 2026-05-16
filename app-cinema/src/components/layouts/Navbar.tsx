import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/UseAuth'

const roleLabel: Record<string, string> = {
  ROLE_ADMIN_SISTEMA: '⚙️ Admin Sistema',
  ROLE_ADMIN_CINE:    '🎬 Admin Cine',
  ROLE_ANUNCIANTE:    '📢 Anunciante',
  ROLE_USUARIO:       '🎟️ Usuario',
}

const roleMenus: Record<string, { label: string; path: string }[]> = {
  ROLE_ADMIN_SISTEMA: [
    { label: '🎬 Cartelera pública', path: '/' }, 
    { label: 'Usuarios',  path: '/admin/usuarios' },
    { label: 'Películas', path: '/admin/peliculas' },
    { label: 'Reportes',  path: '/admin/reportes' },
  ],
  ROLE_ADMIN_CINE: [
    { label: 'Mis Salas',  path: '/cine/salas' },
    { label: 'Funciones',  path: '/cine/funciones' },
    { label: 'Reportes',   path: '/cine/reportes' },
  ],
  ROLE_ANUNCIANTE: [
    { label: 'Mis Anuncios', path: '/anunciante/anuncios' },
    { label: 'Cartera',      path: '/anunciante/cartera' },
  ],
  ROLE_USUARIO: [
    { label: 'Mis Boletos', path: '/mis-boletos' },
  ],
}

const Navbar = () => {
  const { auth, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al clickear fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Obtener el primer rol del usuario para mostrar label
  const primaryRole = auth?.roles?.[0]
  const primaryLabel = primaryRole ? roleLabel[primaryRole] : ''

  // Construir links de navegación según todos los roles del usuario
  const navLinks = auth?.roles?.flatMap(r => roleMenus[r] ?? []) ?? []

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '64px',
      background: 'rgba(15,23,42,0.9)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(96,165,250,0.12)'
    }}>

      {/* Brand */}
      <Link to="/" style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '1.7rem', letterSpacing: '.12em',
        color: 'var(--blue-glow)',
        textShadow: '0 0 20px rgba(96,165,250,0.5)',
        textDecoration: 'none'
      }}>
        🎬 CINE<span style={{ color: 'var(--accent)' }}>MAX</span>
      </Link>

      {/* Nav links, solo usuarios autenticados */}
      {isAuthenticated && navLinks.length > 0 && (
        <div style={{ display: 'flex', gap: '.25rem', alignItems: 'center' }}>
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '.4rem .85rem', borderRadius: '8px',
              fontSize: '.82rem', color: '#94a3b8',
              textDecoration: 'none', transition: 'all .2s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(96,165,250,0.08)'
                e.currentTarget.style.color = 'var(--blue-glow)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94a3b8'
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* Acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>

        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <button style={{
                padding: '.42rem 1.1rem', borderRadius: '8px',
                fontSize: '.85rem', fontWeight: 500,
                color: 'var(--blue-glow)',
                border: '1px solid rgba(96,165,250,0.3)',
                background: 'transparent', cursor: 'pointer'
              }}>
                Iniciar sesión
              </button>
            </Link>
            <Link to="/register">
              <button style={{
                padding: '.42rem 1.2rem', borderRadius: '8px',
                fontSize: '.85rem', fontWeight: 500,
                color: '#fff', border: 'none',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.4)'
              }}>
                Registrarme
              </button>
            </Link>
          </>
        ) : (

          /* Menú usuario autenticado */
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuOpen(p => !p)}
              style={{
                display: 'flex', alignItems: 'center', gap: '.6rem',
                padding: '.4rem .85rem', borderRadius: '10px',
                background: menuOpen ? 'rgba(96,165,250,0.1)' : 'rgba(30,64,175,0.2)',
                border: '1px solid rgba(96,165,250,0.2)',
                cursor: 'pointer', transition: 'all .2s'
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.8rem', fontWeight: 600, color: '#fff'
              }}>
                {auth?.username?.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '.8rem', fontWeight: 500, color: '#f1f5f9' }}>
                  {auth?.username}
                </div>
                <div style={{ fontSize: '.65rem', color: 'var(--blue-glow)' }}>
                  {primaryLabel}
                </div>
              </div>
              <span style={{
                fontSize: '.65rem', color: '#94a3b8',
                transform: menuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform .2s'
              }}>▼</span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 'calc(100% + .5rem)',
                width: '200px', borderRadius: '14px', overflow: 'hidden',
                background: 'rgba(15,23,42,0.97)',
                border: '1px solid rgba(96,165,250,0.18)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
              }}>

                {/* Info usuario */}
                <div style={{
                  padding: '.85rem 1rem',
                  borderBottom: '1px solid rgba(96,165,250,0.1)'
                }}>
                  <div style={{ fontSize: '.8rem', fontWeight: 500, color: '#f1f5f9' }}>
                    {auth?.username}
                  </div>
                  <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.15rem' }}>
                    {auth?.roles?.map(r => roleLabel[r]).join(' · ')}
                  </div>
                </div>

                {/* Opciones fijas */}
                {[
                  { label: '👤 Mi perfil',   path: '/perfil' },
                  { label: '🏠 Dashboard',   path: '/dashboard' },
                  { label: '🎬 Vista al público',   path: '/' },
                  { label: '💳 Cartera',   path: '/cartera' },
                ].map(item => (
                  <Link key={item.path} to={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block', padding: '.6rem 1rem',
                      fontSize: '.82rem', color: '#cbd5e1',
                      textDecoration: 'none', transition: 'all .15s'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(96,165,250,0.08)'
                      e.currentTarget.style.color = '#f1f5f9'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = '#cbd5e1'
                    }}
                  >
                    {item.label}
                  </Link>
                ))}

                {/* Separador */}
                <div style={{ height: '1px', background: 'rgba(96,165,250,0.1)', margin: '.25rem 0' }} />

                {/* Cerrar sesión */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', padding: '.65rem 1rem',
                    textAlign: 'left', fontSize: '.82rem',
                    color: 'var(--accent2)', background: 'transparent',
                    border: 'none', cursor: 'pointer', transition: 'all .15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar