import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Shield, UserPlus } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { authService } from '../../services/microservice-users/authService'
import type { CompaniaAdminRequest } from '../../types/CinemaCore.types'

const CompaniaAdminsPage = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [idUsuario, setIdUsuario] = useState<number | ''>('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const companiaId = Number(id)

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['compania-admins', companiaId],
    queryFn: () => cinemaService.getAdminsByCompania(companiaId),
    enabled: !!companiaId,
  })

  const { data: usuariosAdmin = [] } = useQuery({
    queryKey: ['usuarios-admin-cine'],
    queryFn: () => authService.getAllUsers(true, 'ROLE_ADMIN_CINE'),
  })

  const addAdminMutation = useMutation({
    mutationFn: (payload: CompaniaAdminRequest) => cinemaService.agregarAdminACompania(payload),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Administrador asignado correctamente.' })
      setIdUsuario('')
      queryClient.invalidateQueries({ queryKey: ['compania-admins', companiaId] })
    },
    onError: (error: any) => {
      setMsg({ type: 'err', text: error?.response?.data?.message || 'No se pudo asignar el administrador.' })
    },
  })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Administradores de la compañía
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Asigna o revisa los administradores de cine para esta compañía.
        </p>
      </div>

      {msg && (
        <div style={{
          padding: '.7rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
          fontSize: '.84rem',
        }}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <label style={{ display: 'block', fontSize: '.75rem', color: '#94a3b8', marginBottom: '.35rem' }}>
              Seleccionar administrador
            </label>
            <select
              value={idUsuario}
              onChange={e => setIdUsuario(e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%', padding: '.7rem 1rem', borderRadius: '12px',
                background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(96,165,250,0.2)',
                color: '#f1f5f9', outline: 'none'
              }}
            >
              <option value="">Selecciona un usuario...</option>
              {usuariosAdmin.map((usuario: any) => (
                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                  @{usuario.username} — {usuario.nombres} {usuario.apellidos}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => idUsuario && addAdminMutation.mutate({ idCompania: companiaId, idUsuario })}
            disabled={!idUsuario || addAdminMutation.isPending}
            style={{
              padding: '.7rem 1rem', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff',
            }}
          >
            <UserPlus size={16} style={{ display: 'inline-block', marginRight: '.35rem' }} />
            Asignar
          </button>
        </div>
      </div>

      <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>
          <Shield size={18} style={{ display: 'inline-block', marginRight: '.35rem' }} />
          Administradores actuales
        </h2>

        {isLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando administradores...</div>
        ) : admins.length ? (
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {admins.map((admin: any) => (
              <div key={admin.idCompaniaAdmin} style={{ padding: '.9rem 1rem', borderRadius: '12px', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.12)' }}>
                <div style={{ color: '#f1f5f9', fontWeight: 500 }}>Usuario #{admin.idUsuario}</div>
                <div style={{ color: '#94a3b8', fontSize: '.8rem' }}>
                  Asignado el {new Date(admin.fechaAsignacion).toLocaleDateString('es-GT')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8' }}>Todavía no hay administradores asignados.</div>
        )}
      </div>
    </div>
  )
}

export default CompaniaAdminsPage