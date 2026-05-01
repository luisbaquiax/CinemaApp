import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const AuthLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout