import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../../services/microservice-users/authService'

const roleColors: Record<string, { bg: string; color: string }> = {
  ROLE_ADMIN_SISTEMA: { bg: 'rgba(245,158,11,0.15)', color: '#fcd34d' },
  ROLE_ADMIN_CINE:    { bg: 'rgba(96,165,250,0.15)', color: 'var(--blue-glow)' },
  ROLE_ANUNCIANTE:    { bg: 'rgba(167,139,250,0.15)', color: '#c4b5fd' },
  ROLE_USUARIO:       { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80' },
}

const AdminUsuariosPage = () => {
  const qc = useQueryClient()
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined)
  const [filtroRol, setFiltroRol]       = useState('')
  const [modalRol, setModalRol]         = useState<{ idUsuario: number; username: string } | null>(null)
  const [rolSeleccionado, setRolSeleccionado] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['admin-usuarios', filtroActivo, filtroRol],
    queryFn:  () => authService.getAllUsers(filtroActivo, filtroRol),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn:  authService.getAllRoles,
  })

  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      authService.cambiarEstadoUsuario(id, activar),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Estado actualizado.' })
      qc.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al cambiar estado.' })
    }
  })

  const asignarRolMutation = useMutation({
    mutationFn: () => authService.asignarRol(modalRol!.idUsuario, rolSeleccionado!),
    onSuccess: () => {
      setMsg({ type: 'ok', text: `Rol asignado a ${modalRol?.username}.` })
      setModalRol(null)
      setRolSeleccionado(null)
      qc.invalidateQueries({ queryKey: ['admin-usuarios'] })
    },
    onError: (err: any) => {
      setModalRol(null)
      setRolSeleccionado(null)
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al asignar rol.' })
    }
  })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9'
        }}>
          Gestión de Usuarios
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          padding: '.65rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
          fontSize: '.82rem'
        }}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: '.75rem', flexWrap: 'wrap',
        marginBottom: '1.25rem'
      }}>
        {[
          { label: 'Todos',    value: undefined },
          { label: 'Activos',  value: true },
          { label: 'Inactivos', value: false },
        ].map(f => (
          <button key={String(f.value)} onClick={() => setFiltroActivo(f.value)}
            style={{
              padding: '.35rem .85rem', borderRadius: '999px', fontSize: '.78rem',
              fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
              background: filtroActivo === f.value ? 'rgba(37,99,235,0.35)' : 'rgba(30,64,175,0.2)',
              border: `1px solid ${filtroActivo === f.value ? 'var(--blue-glow)' : 'rgba(96,165,250,0.18)'}`,
              color: filtroActivo === f.value ? 'var(--blue-glow)' : '#94a3b8',
            }}
          >
            {f.label}
          </button>
        ))}

        <select
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
          style={{
            padding: '.35rem .85rem', borderRadius: '999px', fontSize: '.78rem',
            background: 'rgba(30,64,175,0.2)',
            border: '1px solid rgba(96,165,250,0.18)',
            color: '#94a3b8', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="">Todos los roles</option>
          {roles.map(r => (
            <option key={r.idRol} value={r.nombre}>{r.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div style={{
        borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(96,165,250,0.15)'
      }}>
        {/* Encabezado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr',
          padding: '.7rem 1.25rem',
          background: 'rgba(30,64,175,0.25)',
          fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.08em', textTransform: 'uppercase',
          color: '#94a3b8'
        }}>
          <span>Usuario</span>
          <span>Email</span>
          <span>Roles</span>
          <span>Teléfono</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>
            ⏳ Cargando usuarios...
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>
            No se encontraron usuarios.
          </div>
        ) : (
          usuarios.map((u, i) => (
            <div key={u.idUsuario} style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr 1fr 1fr',
              padding: '.85rem 1.25rem',
              alignItems: 'center',
              background: i % 2 === 0 ? 'rgba(15,23,42,0.4)' : 'rgba(30,64,175,0.06)',
              borderTop: '1px solid rgba(96,165,250,0.07)',
              fontSize: '.82rem'
            }}>
              {/* Usuario */}
              <div>
                <div style={{ fontWeight: 500, color: '#f1f5f9' }}>
                  {u.nombres} {u.apellidos}
                </div>
                <div style={{ fontSize: '.7rem', color: '#94a3b8' }}>@{u.username}</div>
              </div>

              {/* Email */}
              <div style={{ color: '#cbd5e1', fontSize: '.78rem' }}>{u.email}</div>

              {/* Roles */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                {u.roles?.map(r => (
                  <span key={r.idRol} style={{
                    fontSize: '.65rem', padding: '.15rem .45rem', borderRadius: '5px',
                    background: roleColors[r.nombre]?.bg || 'rgba(96,165,250,0.12)',
                    color: roleColors[r.nombre]?.color || 'var(--blue-glow)'
                  }}>
                    {r.nombre}
                  </span>
                ))}
              </div>

              {/* Teléfono */}
              <div style={{ color: '#94a3b8', fontSize: '.78rem' }}>
                {u.telefono || '—'}
              </div>

              {/* Estado */}
              <div>
                <span style={{
                  fontSize: '.68rem', fontWeight: 500, padding: '.2rem .55rem',
                  borderRadius: '999px',
                  background: u.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: u.activo ? '#4ade80' : 'var(--accent2)',
                  border: `1px solid ${u.activo ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
                }}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '.4rem' }}>
                <button
                  onClick={() => toggleEstadoMutation.mutate({ id: u.idUsuario, activar: !u.activo })}
                  title={u.activo ? 'Desactivar' : 'Activar'}
                  style={{
                    padding: '.3rem .6rem', borderRadius: '7px', border: 'none',
                    fontSize: '.72rem', cursor: 'pointer',
                    background: u.activo ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                    color: u.activo ? 'var(--accent2)' : '#4ade80',
                  }}
                >
                  {u.activo ? '🔒' : '🔓'}
                </button>
                <button
                  onClick={() => { setModalRol({ idUsuario: u.idUsuario, username: u.username }); setMsg(null) }}
                  title="Asignar rol"
                  style={{
                    padding: '.3rem .6rem', borderRadius: '7px', border: 'none',
                    fontSize: '.72rem', cursor: 'pointer',
                    background: 'rgba(96,165,250,0.12)',
                    color: 'var(--blue-glow)',
                  }}
                >
                  🎭
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal asignar rol */}
      {modalRol && (
        <div
          onClick={() => setModalRol(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(15,23,42,0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '380px', borderRadius: '20px', padding: '1.75rem',
            background: 'rgba(15,23,42,0.97)',
            border: '1px solid rgba(96,165,250,0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '1.2rem', letterSpacing: '.06em',
              color: '#f1f5f9', marginBottom: '.4rem'
            }}>
              Asignar rol
            </h3>
            <p style={{ fontSize: '.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Usuario: <strong style={{ color: 'var(--blue-glow)' }}>@{modalRol.username}</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.25rem' }}>
              {roles.map(r => (
                <button key={r.idRol}
                  onClick={() => setRolSeleccionado(r.idRol)}
                  style={{
                    padding: '.65rem 1rem', borderRadius: '10px', textAlign: 'left',
                    fontSize: '.84rem', cursor: 'pointer', transition: 'all .15s',
                    background: rolSeleccionado === r.idRol 
                      ? 'rgba(37,99,235,0.3)' : 'rgba(30,64,175,0.15)',
                    border: `1px solid ${rolSeleccionado === r.idRol ? 'var(--blue-glow)' : 'rgba(96,165,250,0.15)'}`,
                    color: rolSeleccionado === r.idRol ? 'var(--blue-glow)' : '#cbd5e1',
                  }}
                >
                  {roleColors[r.nombre] ? (
                    <span style={{
                      fontSize: '.68rem', padding: '.15rem .45rem', borderRadius: '5px',
                      background: roleColors[r.nombre].bg,
                      color: roleColors[r.nombre].color,
                      marginRight: '.5rem'
                    }}>
                      {r.nombre}
                    </span>
                  ) : r.nombre}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button
                onClick={() => asignarRolMutation.mutate()}
                disabled={!rolSeleccionado || asignarRolMutation.isPending}
                style={{
                  flex: 1, padding: '.7rem', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                  color: '#fff', fontSize: '.85rem', cursor: 'pointer',
                  opacity: !rolSeleccionado ? 0.5 : 1
                }}
              >
                {asignarRolMutation.isPending ? '⏳...' : 'Asignar'}
              </button>
              <button
                onClick={() => { setModalRol(null); setRolSeleccionado(null) }}
                style={{
                  padding: '.7rem 1rem', borderRadius: '10px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'transparent', color: '#94a3b8',
                  fontSize: '.85rem', cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsuariosPage