import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { InputGroup } from '../../components/inputs/InputGroup'
import { useAuth } from '../../hooks/UseAuth'
import { authService } from '../../services/microservice-users/authService'
import VerifyModal from '../../components/modals/VerifyModal'

const LoginPage = () => {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm]           = useState({ username: '', password: '' })
  const [error, setError]         = useState<string | null>(null)
  const [showVerify, setShowVerify] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const mutation = useMutation({
    mutationFn: () => authService.login(form.username, form.password),
    onSuccess: (data) => {
      if (data.requireDobleFactorAuth) {
        // Mostrar modal de verificación
        setShowVerify(true)
      } else {
        login(data)
        navigate('/dashboard')
      }
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Credenciales incorrectas')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Completa todos los campos')
      return
    }
    mutation.mutate()
  }

  return (
    <>
      {/* Modal 2FA */}
      {showVerify && (
        <VerifyModal
          username={form.username}
          onClose={() => setShowVerify(false)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center px-4 relative"
        style={{ background: 'var(--navy)' }}>

        <div className="fixed inset-0 pointer-events-none" style={{
          background: `
            radial-gradient(ellipse 60% 50% at 30% 20%, rgba(37,99,235,0.3) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 75% 75%, rgba(30,64,175,0.25) 0%, transparent 55%)
          `
        }} />

        <div className="relative z-10 w-full max-w-md animate-fade-up">

          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '2rem', letterSpacing: '.12em',
              color: 'var(--blue-glow)',
              textShadow: '0 0 20px rgba(96,165,250,0.5)',
              textDecoration: 'none'
            }}>
              🎬 CINE<span style={{ color: 'var(--accent)' }}>MAX</span>
            </Link>
            <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
              Inicia sesión para comprar boletos
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8" style={{
            background: 'rgba(30,64,175,0.12)',
            border: '1px solid rgba(96,165,250,0.15)',
            backdropFilter: 'blur(16px)'
          }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '.08em', color: '#f1f5f9',
              fontSize: '1.4rem', marginBottom: '1.5rem'
            }}>
              Bienvenido de nuevo
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <InputGroup
                label="Usuario"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Nombre de usuario"
                required
              />
              <InputGroup
                label="Contraseña"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />

              {error && (
                <div style={{
                  padding: '.6rem 1rem', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--accent2)', fontSize: '.84rem'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={mutation.isPending}
                style={{
                  width: '100%', padding: '.75rem', borderRadius: '12px',
                  border: 'none', fontSize: '.9rem', fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  background: mutation.isPending
                    ? 'rgba(37,99,235,0.5)'
                    : 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                  color: '#fff',
                  cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                  marginTop: '.25rem'
                }}
              >
                {mutation.isPending ? '⏳ Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.12)' }} />
              <span style={{ fontSize: '.75rem', color: '#475569' }}>¿No tienes cuenta?</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.12)' }} />
            </div>

            <Link to="/register">
              <button style={{
                width: '100%', padding: '.65rem', borderRadius: '12px',
                border: '1px solid rgba(96,165,250,0.25)',
                background: 'transparent', fontSize: '.85rem',
                color: 'var(--blue-glow)', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                Crear una cuenta
              </button>
            </Link>
          </div>

          <div className="text-center mt-5">
            <Link to="/" style={{ fontSize: '.75rem', color: '#475569', textDecoration: 'none' }}>
              ← Volver a la cartelera
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage