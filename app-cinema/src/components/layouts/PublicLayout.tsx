import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const PublicLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', position: 'relative' }}>
      {/* BG glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(37,99,235,0.35) 0%, transparent 60%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(30,64,175,0.28) 0%, transparent 55%)
        `
      }} />
      <Navbar />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </div>
    </div>
  )
}

export default PublicLayout