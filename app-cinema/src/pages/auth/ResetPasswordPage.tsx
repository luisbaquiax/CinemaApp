import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { InputGroup } from '../../components/inputs/InputGroup'
import { authService } from '../../services/microservice-users/authService'

const ResetPasswordPage = () => {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => authService.resetPassword(email),
    onSuccess: () => setSent(true),
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'No se pudo enviar el correo.')
    }
  })

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--navy)' }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(37,99,235,0.25) 0%, transparent 60%)'
      }} />

      <div className="relative z-10 w-full max-w-md animate-fade-up">

        <div className="text-center mb-8">
          <Link to="/" style={{
            fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem',
            letterSpacing: '.12em', color: 'var(--blue-glow)',
            textShadow: '0 0 20px rgba(96,165,250,0.5)', textDecoration: 'none'
          }}>
            🎬 CINE<span style={{ color: 'var(--accent)' }}>MAX</span>
          </Link>
        </div>

        <div style={{
          borderRadius: '20px', padding: '2rem',
          background: 'rgba(30,64,175,0.12)',
          border: '1px solid rgba(96,165,250,0.15)',
          backdropFilter: 'blur(16px)'
        }}>
          {sent ? (
            <div className="text-center py-6">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.4rem', letterSpacing: '.08em',
                color: '#f1f5f9', marginBottom: '.5rem'
              }}>
                ¡Correo enviado!
              </h2>
              <p style={{ fontSize: '.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Revisa tu bandeja de entrada y sigue el enlace para restablecer tu contraseña.
                El enlace expira en <strong style={{ color: 'var(--blue-glow)' }}>15 minutos</strong>.
              </p>
              <Link to="/login">
                <button style={{
                  marginTop: '1.5rem', padding: '.65rem 1.5rem',
                  borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                  color: '#fff', fontSize: '.85rem', cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  Ir al login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.4rem', letterSpacing: '.08em',
                color: '#f1f5f9', marginBottom: '.4rem'
              }}>
                Restablecer contraseña
              </h2>
              <p style={{ fontSize: '.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                Ingresa el correo asociado a tu cuenta y te enviaremos un enlace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InputGroup
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null) }}
                  placeholder="tu@correo.com"
                  required
                  error={error ?? undefined}
                />

                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !email}
                  style={{
                    width: '100%', padding: '.75rem', borderRadius: '12px',
                    border: 'none', fontSize: '.9rem', fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                    color: '#fff', cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                    opacity: !email ? 0.6 : 1
                  }}
                >
                  {mutation.isPending ? '⏳ Enviando...' : 'Enviar enlace de restablecimiento'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link to="/login" style={{ fontSize: '.75rem', color: '#475569', textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage