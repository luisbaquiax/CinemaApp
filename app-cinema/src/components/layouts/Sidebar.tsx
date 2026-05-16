import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Film, Users, Building2,
  Wallet, Megaphone, Ticket, BarChart3,
  Armchair, Clock, DollarSign, User, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/UseAuth'
import { useState, useEffect } from 'react'
import { cinemaAdminCineService } from '../../services/microservice-cinema/CinemaAdminCineService'
import {
  ADMIN_CINE_COMPANY_CHANGED_EVENT,
  getStoredSelectedCompaniaId,
  resolveSelectedCompania,
} from '../../utils/adminCineSelection'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavSection {
  title: string
  items: NavItem[]
}

const roleNavConfig: Record<string, NavSection[]> = {
  ROLE_ADMIN_SISTEMA: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
      ]
    },
    {
      title: 'Gestión',
      items: [
        { label: 'Usuarios', path: '/admin/usuarios', icon: <Users size={16} /> },
        { label: 'Compañías', path: '/admin/companias', icon: <Building2 size={16} /> },
        { label: 'Películas', path: '/admin/peliculas', icon: <Film size={16} /> },
        { label: 'Categorías', path: '/admin/categorias', icon: <Film size={16} /> },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { label: 'Costo Global', path: '/admin/costo-global', icon: <DollarSign size={16} /> },
      ]
    },
    {
      title: 'Analítica',
      items: [
        { label: 'Reportes', path: '/admin/reportes', icon: <BarChart3 size={16} /> },
      ]
    }
  ],

  ROLE_ADMIN_CINE: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
      ]
    },
    {
      title: 'Operación',
      items: [
        { label: 'Mis Compañías', path: '/cine/companias', icon: <Building2 size={16} /> },
        { label: 'Panel Cine', path: '/cine/opciones', icon: <Building2 size={16} /> },
        { label: 'Salas', path: '/cine/salas', icon: <Armchair size={16} /> },
        { label: 'Funciones', path: '/cine/funciones', icon: <Clock size={16} /> },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { label: 'Cartera Cine', path: '/cine/cartera', icon: <Wallet size={16} /> },
      ]
    },
    {
      title: 'Analítica',
      items: [
        { label: 'Reportes', path: '/cine/reportes', icon: <BarChart3 size={16} /> },
      ]
    }
  ],

  ROLE_ANUNCIANTE: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
      ]
    },
    {
      title: 'Publicidad',
      items: [
        { label: 'Mis Anuncios', path: '/anunciante/anuncios', icon: <Megaphone size={16} /> },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { label: 'Cartera Anunciante', path: '/anunciante/cartera', icon: <Wallet size={16} /> },
      ]
    }
  ],

  ROLE_USUARIO: [
    {
      title: 'General',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
      ]
    },
    {
      title: 'Actividad',
      items: [
        { label: 'Mis Boletos', path: '/mis-boletos', icon: <Ticket size={16} /> },
      ]
    },
    {
      title: 'Finanzas',
      items: [
        { label: 'Cartera personal', path: '/cartera', icon: <Wallet size={16} /> },
      ]
    }
  ]
}

export default function Sidebar() {
  const { auth } = useAuth()
  const location = useLocation()
  const isAdminCine = auth?.roles?.includes('ROLE_ADMIN_CINE') ?? false
  const [selectedCompaniaId, setSelectedCompaniaId] = useState<number | null>(() => getStoredSelectedCompaniaId())

  //estado colapsado persistente
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    if (!isAdminCine) return

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'admin-cine-selected-company-id') return
      setSelectedCompaniaId(getStoredSelectedCompaniaId())
    }

    const onCompanyChanged = (event: Event) => {
      const custom = event as CustomEvent<{ idCompania?: number }>
      if (custom.detail?.idCompania != null) {
        setSelectedCompaniaId(custom.detail.idCompania)
        return
      }
      setSelectedCompaniaId(getStoredSelectedCompaniaId())
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(ADMIN_CINE_COMPANY_CHANGED_EVENT, onCompanyChanged)

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(ADMIN_CINE_COMPANY_CHANGED_EVENT, onCompanyChanged)
    }
  }, [isAdminCine])

  const { data: misCompanias = [] } = useQuery({
    queryKey: ['sidebar-admin-cine-companias', auth?.idUsuario],
    queryFn: () => cinemaAdminCineService.getMisCompanias(auth!.idUsuario),
    enabled: isAdminCine && !!auth?.idUsuario,
  })

  const companiaActiva = isAdminCine
    ? resolveSelectedCompania(misCompanias, selectedCompaniaId)
    : null

  //construir secciones combinadas
  const sections: NavSection[] = []
  const seen = new Set<string>()

  auth?.roles?.forEach(role => {
    roleNavConfig[role]?.forEach(section => {
      const existing = sections.find(s => s.title === section.title)

      if (existing) {
        section.items.forEach(item => {
          if (!seen.has(item.path)) {
            seen.add(item.path)
            existing.items.push(item)
          }
        })
      } else {
        const items = section.items.filter(i => {
          if (seen.has(i.path)) return false
          seen.add(i.path)
          return true
        })
        if (items.length > 0) {
          sections.push({ title: section.title, items })
        }
      }
    })
  })

  return (
    <div style={{
      width: collapsed ? '72px' : '240px',
      transition: 'width .2s',
      minHeight: '100vh',
      background: 'rgba(15,23,42,0.95)',
      borderRight: '1px solid rgba(96,165,250,0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '1rem'
      }}>
        {!collapsed && (
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: 'var(--blue-glow)',
            fontSize: '1.4rem'
          }}>
            🎬 CINE MAX
          </span>
        )}

        <button
          onClick={() => setCollapsed(p => !p)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8'
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* NAV */}
      <nav style={{ flex: 1, padding: '.5rem' }}>
        {!collapsed && isAdminCine && companiaActiva && (
          <div
            style={{
              margin: '.15rem .25rem .75rem',
              padding: '.6rem .7rem',
              borderRadius: '10px',
              border: '1px solid rgba(96,165,250,0.15)',
              background: 'rgba(30,64,175,0.12)',
            }}
          >
            <div style={{ fontSize: '.63rem', color: '#93c5fd', textTransform: 'uppercase', marginBottom: '.2rem' }}>
              Cine Activo
            </div>
            <div
              style={{
                color: '#e2e8f0',
                fontSize: '.8rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={companiaActiva.nombreCompania}
            >
              {companiaActiva.nombreCompania}
            </div>
          </div>
        )}

        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: '1rem' }}>

            {!collapsed && (
              <div style={{
                fontSize: '.65rem',
                color: '#64748b',
                textTransform: 'uppercase',
                padding: '0 .6rem',
                marginBottom: '.3rem'
              }}>
                {section.title}
              </div>
            )}

            {section.items.map(item => {
              const isActive = location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: '.6rem',
                    padding: '.6rem',
                    borderRadius: '10px',
                    marginBottom: '.2rem',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(37,99,235,0.25)' : 'transparent',
                    color: isActive ? 'var(--blue-glow)' : '#94a3b8'
                  }}
                >
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div style={{ padding: '.5rem' }}>
        <Link
          to="/perfil"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '.6rem',
            padding: '.6rem',
            borderRadius: '10px',
            textDecoration: 'none',
            color: '#94a3b8'
          }}
        >
          <User size={16} />
          {!collapsed && 'Mi Perfil'}
        </Link>
      </div>
    </div>
  )
}