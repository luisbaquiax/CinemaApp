import { Outlet } from 'react-router-dom'
import Sidebar      from './Sidebar'
import NavbarSimple from './NavbarSimple'

export default function DashboardLayout() {
  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: 'var(--navy)', position: 'relative'
    }}>
      {/* BG glow sutil */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 10% 20%, rgba(37,99,235,0.18) 0%, transparent 55%),
          radial-gradient(ellipse 40% 40% at 90% 80%, rgba(30,64,175,0.12) 0%, transparent 50%)
        `
      }} />

      {/* Sidebar */}
      <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        <NavbarSimple />
        <main style={{ flex: 1, padding: '1.75rem 2rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}