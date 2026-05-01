import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { InputGroup } from '../../components/inputs/InputGroup'
import { authService } from '../../services/microservice-users/authService'

interface RegisterForm {
  nombres: string
  apellidos: string
  username: string
  email: string
  password: string
  confirmar: string,
  telefono: string,
  fechaNacimiento: string
}

const INITIAL: RegisterForm = {
  nombres: '', apellidos: '', username: '',
  email: '', password: '', confirmar: '', telefono: '', fechaNacimiento: ''
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>(INITIAL)
  const [errors, setErrors] = useState<Partial<RegisterForm>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setApiError(null)
  }

  const validate = (): boolean => {
    const e: Partial<RegisterForm> = {}
    if (!form.nombres.trim()) e.nombres = 'El nombre es requerido'
    if (form.nombres.length > 80) e.nombres = 'Máximo 80 caracteres'
    if (!form.apellidos.trim()) e.apellidos = 'El apellido es requerido'
    if (form.apellidos.length > 80) e.apellidos = 'Máximo 80 caracteres'
    if (!form.username.trim()) e.username = 'El usuario es requerido'
    if (!form.email.includes('@')) e.email = 'Correo inválido'
    if (!form.telefono.trim()) e.telefono = 'El teléfono es requerido'
    else if (!/^\d{8}$/.test(form.telefono)) e.telefono = 'El teléfono debe tener 8 dígitos'
    if (form.password.length < 4) e.password = 'Mínimo 4 caracteres'
    if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const mutation = useMutation({
    mutationFn: () => authService.register({
      nombres: form.nombres,
      apellidos: form.apellidos,
      username: form.username,
      email: form.email,
      password: form.password,
      telefono: form.telefono,
      fechaNacimiento: form.fechaNacimiento
    }),
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    },
    onError: (err: any) => {
      setApiError(err?.response?.data?.message || 'Error al registrarse. Intenta de nuevo.')
    }
  })

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (validate()) mutation.mutate()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative"
      style={{ background: 'var(--navy)' }}>

      {/* BG glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 60% 50% at 70% 20%, rgba(37,99,235,0.28) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 25% 80%, rgba(30,64,175,0.22) 0%, transparent 55%)
        `
      }} />

      <div className="relative z-10 w-full max-w-lg animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-7">
          <Link to="/" style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '2rem',
            letterSpacing: '.12em',
            color: 'var(--blue-glow)',
            textShadow: '0 0 20px rgba(96,165,250,0.5)',
            textDecoration: 'none'
          }}>
            🎬 CINE<span style={{ color: 'var(--accent)' }}>MAX</span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
            Crea tu cuenta gratis y empieza a comprar boletos
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{
          background: 'rgba(30,64,175,0.12)',
          border: '1px solid rgba(96,165,250,0.15)',
          backdropFilter: 'blur(16px)'
        }}>

          {/* Success */}
          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🎉</div>
              <h3 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '1.4rem',
                color: 'var(--blue-glow)',
                letterSpacing: '.06em'
              }}>
                ¡Cuenta creada!
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
                Redirigiendo al login...
              </p>
            </div>
          ) : (
            <>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '.08em',
                color: '#f1f5f9',
                fontSize: '1.4rem',
                marginBottom: '1.5rem'
              }}>
                Crear cuenta
              </h2>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Fila 1 */}
                <div className="grid grid-cols-2 gap-3">
                  <InputGroup
                    label="Nombres"
                    name="nombres"
                    value={form.nombres}
                    onChange={handleChange}
                    placeholder="Juan"
                    required
                    maxLength={80}
                    error={errors.nombres}
                  />
                  <InputGroup
                    label="Apellidos"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    placeholder="Pérez"
                    required
                    maxLength={80}
                    error={errors.apellidos}
                  />
                </div>


                <div className="grid grid-cols-2 gap-3">
                  <InputGroup
                    label="Nombre de usuario"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="juan_perez"
                    required
                    error={errors.username}
                  />

                  <InputGroup
                    label="Telefono"
                    name="telefono"
                    type="tel"
                    value={form.telefono || ''}
                    onChange={handleChange}
                    placeholder=""
                    maxLength={8}
                    minLength={8}
                    required
                    error={errors.telefono}
                  />


                </div>

                <InputGroup
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="juan@correo.com"
                  required
                  error={errors.email}
                />


                <InputGroup
                  label="Fecha de nacimiento"
                  name="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento || ''}
                  onChange={handleChange}
                  placeholder=""
                  required
                  error={errors.fechaNacimiento}
                />

                {/* Fila 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <InputGroup
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    minLength={4}
                    error={errors.password}
                  />
                  <InputGroup
                    label="Confirmar contraseña"
                    name="confirmar"
                    type="password"
                    value={form.confirmar}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    error={errors.confirmar}
                  />
                </div>

                {/* Error API */}
                {apiError && (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'var(--accent2)'
                  }}>
                    ⚠️ {apiError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-3 rounded-xl text-sm font-medium text-white mt-1 transition-all"
                  style={{
                    background: mutation.isPending
                      ? 'rgba(37,99,235,0.5)'
                      : 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
                    cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '.03em'
                  }}
                >
                  {mutation.isPending ? '⏳ Creando cuenta...' : 'Crear cuenta'}
                </button>

              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.12)' }} />
                <span className="text-xs" style={{ color: '#475569' }}>¿Ya tienes cuenta?</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(96,165,250,0.12)' }} />
              </div>

              <Link to="/login">
                <button className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(96,165,250,0.25)',
                    color: 'var(--blue-glow)',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(96,165,250,0.08)'
                    e.currentTarget.style.borderColor = 'var(--blue-glow)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.borderColor = 'rgba(96,165,250,0.25)'
                  }}
                >
                  Iniciar sesión
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Back */}
        <div className="text-center mt-5">
          <Link to="/" className="text-xs transition-colors"
            style={{ color: '#475569', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--blue-glow)')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}
          >
            ← Volver a la cartelera
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage