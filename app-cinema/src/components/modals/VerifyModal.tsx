import { useState, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/microservice-users/authService'
import { useAuth } from '../../hooks/UseAuth'

interface Props {
  username: string
  onClose:  () => void
}

const VerifyModal = ({ username, onClose }: Props) => {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [code, setCode] = useState(['', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // foco en primer input al abrir
  useEffect(() => { inputs.current[0]?.focus() }, [])

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...code]
    next[i] = val
    setCode(next)
    setError(null)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)
    if (pasted.length === 4) {
      setCode(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const mutation = useMutation({
    mutationFn: () => authService.verify(username, code.join('')),
    onSuccess: (data) => {
      login(data)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Código inválido o expirado')
      setCode(['', '', '', ''])
      inputs.current[0]?.focus()
    }
  })

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (code.join('').length < 4) {
      setError('Ingresa el código completo de 4 dígitos')
      return
    }
    mutation.mutate()
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Card — stopPropagation para no cerrar al clickear adentro */}
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: '100%', maxWidth: '400px',
          borderRadius: '20px', padding: '2rem',
          background: 'rgba(15,23,42,0.95)',
          border: '1px solid rgba(96,165,250,0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>📧</div>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.5rem', letterSpacing: '.08em',
            color: '#f1f5f9', marginBottom: '.4rem'
          }}>
            Verificación en dos pasos
          </h2>
          <p style={{ fontSize: '.82rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Enviamos un código de 4 dígitos al correo asociado a{' '}
            <strong style={{ color: 'var(--blue-glow)' }}>{username}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Inputs del código */}
          <div style={{
            display: 'flex', gap: '.5rem',
            justifyContent: 'center', marginBottom: '1.25rem'
          }}
            onPaste={handlePaste}
          >
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputs.current[i] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: '48px', height: '56px',
                  textAlign: 'center', fontSize: '1.4rem', fontWeight: 600,
                  borderRadius: '12px',
                  background: 'rgba(30,64,175,0.2)',
                  border: `1px solid ${error ? 'var(--accent2)' : digit ? 'var(--blue-glow)' : 'rgba(96,165,250,0.2)'}`,
                  color: '#f1f5f9', outline: 'none',
                  transition: 'border-color .15s',
                  fontFamily: "'DM Sans', sans-serif"
                }}
                onFocus={e => {
                  if (!error) e.currentTarget.style.borderColor = 'var(--blue-glow)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(96,165,250,0.15)'
                }}
                onBlur={e => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '.6rem 1rem', borderRadius: '10px', marginBottom: '1rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--accent2)', fontSize: '.82rem', textAlign: 'center'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Botón verificar */}
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{
              width: '100%', padding: '.8rem', borderRadius: '12px',
              border: 'none', fontSize: '.9rem', fontWeight: 500,
              fontFamily: "'DM Sans', sans-serif",
              background: mutation.isPending
                ? 'rgba(37,99,235,0.5)'
                : 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
              color: '#fff', cursor: mutation.isPending ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              transition: 'all .2s', marginBottom: '.75rem'
            }}
          >
            {mutation.isPending ? '⏳ Verificando...' : 'Verificar código'}
          </button>

          {/* Cancelar */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%', padding: '.7rem', borderRadius: '12px',
              border: '1px solid rgba(96,165,250,0.2)',
              background: 'transparent', fontSize: '.85rem',
              color: '#94a3b8', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all .2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'
              e.currentTarget.style.color = 'var(--blue-glow)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)'
              e.currentTarget.style.color = '#94a3b8'
            }}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}

export default VerifyModal