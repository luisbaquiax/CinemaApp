import { useEffect, useMemo, useState } from 'react'
import type { UsuarioComunResponse } from '../../types/Usuario.type'

type CompanyAdminsModalProps = {
  open: boolean
  mode: 'view' | 'add'
  companyName: string
  admins: UsuarioComunResponse[]
  candidates: UsuarioComunResponse[]
  isLoadingAdmins?: boolean
  isLoadingCandidates?: boolean
  isSubmitting?: boolean
  onClose: () => void
  onAddAdmin: (idUsuario: number) => void
  onRemoveAdmin: (idUsuario: number, adminName: string) => void
}

const CompanyAdminsModal = ({
  open,
  mode,
  companyName,
  admins,
  candidates,
  isLoadingAdmins = false,
  isLoadingCandidates = false,
  isSubmitting = false,
  onClose,
  onAddAdmin,
  onRemoveAdmin,
}: CompanyAdminsModalProps) => {
  const [selectedAdminId, setSelectedAdminId] = useState<number | ''>('')

  useEffect(() => {
    if (open) setSelectedAdminId('')
  }, [open, mode, companyName])

  const title = useMemo(() => {
    if (mode === 'add') return `Agregar admin a ${companyName}`
    return `Admins de ${companyName}`
  }, [mode, companyName])

  if (!open) return null

  const availableCandidates = candidates.filter(candidate => !admins.some(admin => admin.idUsuario === candidate.idUsuario))

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 260,
        background: 'rgba(15,23,42,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto',
        padding: '2rem 1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '860px',
          borderRadius: '20px',
          padding: '1.5rem',
          background: 'rgba(15,23,42,0.97)',
          border: '1px solid rgba(96,165,250,0.18)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
              {title}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>
              {mode === 'add' ? 'Selecciona un admin disponible para asignarlo a la compañía.' : 'Revisa los administradores actualmente asignados.'}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: 'rgba(239,68,68,0.12)',
              color: 'var(--accent2)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: mode === 'add' ? '1.1fr .9fr' : '1fr', gap: '1rem' }}>
          <section style={{ borderRadius: '16px', padding: '1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '.75rem' }}>Administradores actuales</h3>

            {isLoadingAdmins ? (
              <div style={{ color: '#94a3b8' }}>⏳ Cargando administradores...</div>
            ) : admins.length === 0 ? (
              <div style={{ color: '#94a3b8' }}>No hay administradores asignados.</div>
            ) : (
              <div style={{ display: 'grid', gap: '.5rem' }}>
                {admins.map(admin => (
                  <div
                    key={admin.idUsuario}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '.75rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(15,23,42,0.35)',
                      border: '1px solid rgba(96,165,250,0.12)',
                    }}
                  >
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{admin.nombres} {admin.apellidos}</div>
                      <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>@{admin.username} · {admin.email}</div>
                    </div>
                    <button
                      onClick={() => onRemoveAdmin(admin.idUsuario, `${admin.nombres} ${admin.apellidos}`)}
                      style={{
                        padding: '.45rem .75rem',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        background: 'rgba(239,68,68,0.12)',
                        color: 'var(--accent2)',
                        fontSize: '.75rem',
                      }}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {mode === 'add' && (
            <section style={{ borderRadius: '16px', padding: '1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '.75rem' }}>Agregar admin</h3>

              {isLoadingCandidates ? (
                <div style={{ color: '#94a3b8' }}>⏳ Cargando admins disponibles...</div>
              ) : availableCandidates.length === 0 ? (
                <div style={{ color: '#94a3b8' }}>No hay admins disponibles para agregar.</div>
              ) : (
                <div style={{ display: 'grid', gap: '.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '.75rem', color: '#94a3b8', marginBottom: '.35rem' }}>
                      Selecciona un admin
                    </label>
                    <select
                      value={selectedAdminId}
                      onChange={e => setSelectedAdminId(e.target.value ? Number(e.target.value) : '')}
                      style={{
                        width: '100%',
                        padding: '.75rem 1rem',
                        borderRadius: '12px',
                        background: 'rgba(30,64,175,0.15)',
                        border: '1px solid rgba(96,165,250,0.2)',
                        color: '#7bade0ff',
                        outline: 'none',
                      }}
                    >
                      <option value="">Selecciona un admin</option>
                      {availableCandidates.map(admin => (
                        <option key={admin.idUsuario} value={admin.idUsuario}>
                          @{admin.username} — {admin.nombres} {admin.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => selectedAdminId && onAddAdmin(selectedAdminId)}
                    disabled={!selectedAdminId || isSubmitting}
                    style={{
                      padding: '.75rem 1rem',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: !selectedAdminId || isSubmitting ? 'not-allowed' : 'pointer',
                      background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                      color: '#fff',
                    }}
                  >
                    {isSubmitting ? '⏳ Agregando...' : 'Agregar admin'}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyAdminsModal
