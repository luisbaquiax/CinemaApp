import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { InputGroup } from '../../components/inputs/InputGroup'
import { authService } from '../../services/microservice-users/authService'

const ConfirmResetPasswordPage = () => {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const token           = searchParams.get('token') ?? ''

  const [form, setForm]   = useState({ newPassword: '', confirm: '' })
  const [errors, setErrors] = useState<{ newPassword?: string; confirm?: string }>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const validate = () => {
    const e: typeof errors = {}
    if (form.newPassword.length < 8) e.newPassword = 'Mínimo 8 caracteres'
    if (form.newPassword !== form.confirm) e.confirm = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () => authService.confirmResetPassword(token, form.newPassword),
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    },
    onError: (err: any) => {
      setErrors({ newPassword: err?.response?.data?.message || 'El enlace expiró o es inválido.' })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) mutation.mutate()
  }

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
          {success ? (
            <div className="text-center py-6">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.4rem', letterSpacing: '.08em', color: '#f1f5f9'
              }}>
                ¡Contraseña restablecida!
              </h2>
              <p style={{ fontSize: '.85rem', color: '#94a3b8', marginTop: '.5rem' }}>
                Redirigiendo al login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.4rem', letterSpacing: '.08em',
                color: '#f1f5f9', marginBottom: '.4rem'
              }}>
                Nueva contraseña
              </h2>
              <p style={{ fontSize: '.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                Ingresa tu nueva contraseña. Debe tener al menos 8 caracteres.
              </p>

              <form onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InputGroup
                  label="Nueva contraseña"
                  name="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.newPassword}
                />
                <InputGroup
                  label="Confirmar contraseña"
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.confirm}
                />
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  style={{
                    width: '100%', padding: '.75rem', borderRadius: '12px',
                    border: 'none', fontSize: '.9rem', fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                    color: '#fff', cursor: mutation.isPending ? 'not-allowed' : 'pointer'
                  }}
                >
                  {mutation.isPending ? '⏳ Guardando...' : 'Restablecer contraseña'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmResetPasswordPage