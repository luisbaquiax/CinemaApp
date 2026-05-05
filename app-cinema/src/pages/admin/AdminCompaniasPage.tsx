import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Power, DollarSign, Users } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { authService }   from '../../services/microservice-users/authService'
import { InputGroup }    from '../../components/inputs/InputGroup'
import type { CompaniaRequest, CompaniaCostoUpdateRequest } from '../../types/CinemaCore.types'
import { useAuth } from '../../hooks/UseAuth'

type ModalType = 'crear' | 'costo' | null

const AdminCompaniasPage = () => {
  const qc = useQueryClient()
  const [modal, setModal]       = useState<ModalType>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [msg, setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [form, setForm] = useState<CompaniaRequest>({
    nombreCompania: '', descripcionCompania: '', idUsuarioAdmin: 0
  })
  const [costoForm, setCostoForm] = useState<CompaniaCostoUpdateRequest>({
    idCompania: 0, nuevoCosto: 0, fechaCambio: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const { data: companias = [], isLoading } = useQuery({
    queryKey: ['admin-companias'],
    queryFn:  cinemaService.getAllCompanias,
  })

  const { data: adminesCine = [] } = useQuery({
    queryKey: ['usuarios-admin-cine'],
    queryFn:  () => authService.getAllUsers(true, 'ROLE_ADMIN_CINE'),
  })

  const crearMutation = useMutation({
    mutationFn: () => cinemaService.createCompania(form),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Compañía creada correctamente.' })
      setModal(null)
      setForm({ nombreCompania: '', descripcionCompania: '', idUsuarioAdmin: 0 })
      qc.invalidateQueries({ queryKey: ['admin-companias'] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al crear compañía.' })
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      cinemaService.toggleCompaniaEstado(id, activar),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Estado actualizado.' })
      qc.invalidateQueries({ queryKey: ['admin-companias'] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al cambiar estado.' })
    }
  })

  const costoMutation = useMutation({
    mutationFn: () => cinemaService.updateCostoCompania(selected!, costoForm),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Costo actualizado correctamente.' })
      setModal(null)
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['admin-companias'] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al actualizar costo.' })
    }
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
            Compañías de Cine
          </h1>
          <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
            {companias.length} compañía{companias.length !== 1 ? 's' : ''} registrada{companias.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setModal('crear'); setMsg(null) }}
          style={{
            display: 'flex', alignItems: 'center', gap: '.4rem',
            padding: '.6rem 1.2rem', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
            color: '#fff', fontSize: '.85rem', fontWeight: 500, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
          }}
        >
          <Plus size={15} /> Nueva Compañía
        </button>
      </div>

      {/* Mensaje */}
      {msg && (
        <div style={{
          padding: '.7rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)', fontSize: '.84rem'
        }}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      {/* Grid de compañías */}
      {isLoading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>⏳ Cargando...</div>
      ) : companias.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#475569', padding: '3rem' }}>
          <Building2 size={40} style={{ margin: '0 auto .75rem', opacity: .3 }} />
          <p style={{ fontSize: '.9rem' }}>No hay compañías registradas aún.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {companias.map(c => (
            <div key={c.idCompania} style={{
              borderRadius: '16px', padding: '1.25rem',
              background: 'rgba(30,64,175,0.12)',
              border: `1px solid ${c.activo ? 'rgba(96,165,250,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
              {/* Header card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: 'rgba(37,99,235,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Building2 size={18} style={{ color: 'var(--blue-glow)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '.9rem', fontWeight: 500, color: '#f1f5f9' }}>{c.nombreCompania}</div>
                    <span style={{
                      fontSize: '.65rem', fontWeight: 500, padding: '.15rem .45rem', borderRadius: '999px',
                      background: c.activo ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: c.activo ? '#4ade80' : 'var(--accent2)',
                      border: `1px solid ${c.activo ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`
                    }}>
                      {c.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              {c.descripcionCompania && (
                <p style={{ fontSize: '.78rem', color: '#94a3b8', marginBottom: '.75rem', lineHeight: 1.5 }}>
                  {c.descripcionCompania}
                </p>
              )}

              {/* Acciones */}
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => toggleMutation.mutate({ id: c.idCompania, activar: !c.activo })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.3rem',
                    padding: '.35rem .7rem', borderRadius: '8px', border: 'none',
                    fontSize: '.72rem', cursor: 'pointer',
                    background: c.activo ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                    color: c.activo ? 'var(--accent2)' : '#4ade80',
                  }}
                >
                  <Power size={12} /> {c.activo ? 'Desactivar' : 'Activar'}
                </button>

                <button
                  onClick={() => { setSelected(c.idCompania); setModal('costo'); setMsg(null) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.3rem',
                    padding: '.35rem .7rem', borderRadius: '8px', border: 'none',
                    fontSize: '.72rem', cursor: 'pointer',
                    background: 'rgba(245,158,11,0.12)', color: '#fcd34d',
                  }}
                >
                  <DollarSign size={12} /> Costo
                </button>

                <button
                  onClick={() => window.location.href = `/admin/companias/${c.idCompania}/admins`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.3rem',
                    padding: '.35rem .7rem', borderRadius: '8px', border: 'none',
                    fontSize: '.72rem', cursor: 'pointer',
                    background: 'rgba(96,165,250,0.12)', color: 'var(--blue-glow)',
                  }}
                >
                  <Users size={12} /> Admins
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear compañía */}
      {modal === 'crear' && (
        <div onClick={() => setModal(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '480px', borderRadius: '20px', padding: '2rem',
            background: 'rgba(15,23,42,0.97)',
            border: '1px solid rgba(96,165,250,0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem',
              letterSpacing: '.08em', color: '#f1f5f9', marginBottom: '1.5rem'
            }}>
              Nueva Compañía
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputGroup label="Nombre" name="nombreCompania" value={form.nombreCompania}
                onChange={handleChange} placeholder="Cinépolis Guatemala" required />

              <InputGroup label="Descripción" name="descripcionCompania" value={form.descripcionCompania ?? ''}
                onChange={handleChange} placeholder="Descripción de la compañía" />

              {/* Select admin cine */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                <label style={{ fontSize: '.75rem', color: '#94a3b8' }}>
                  Admin de cine asignado <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <select
                  value={form.idUsuarioAdmin}
                  onChange={e => setForm(prev => ({ ...prev, idUsuarioAdmin: Number(e.target.value) }))}
                  style={{
                    padding: '.65rem 1rem', borderRadius: '12px',
                    background: 'rgba(30,64,175,0.15)',
                    border: '1px solid rgba(96,165,250,0.2)',
                    color: form.idUsuarioAdmin ? '#f1f5f9' : '#64748b',
                    fontSize: '.9rem', outline: 'none'
                  }}
                >
                  <option value={0}>Seleccionar admin de cine...</option>
                  {adminesCine.map(u => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      @{u.username} — {u.nombres} {u.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              {msg && modal === 'crear' && (
                <div style={{
                  padding: '.6rem 1rem', borderRadius: '10px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: 'var(--accent2)', fontSize: '.82rem'
                }}>
                  ⚠️ {msg.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem' }}>
                <button
                  onClick={() => crearMutation.mutate()}
                  disabled={crearMutation.isPending || !form.nombreCompania || !form.idUsuarioAdmin}
                  style={{
                    flex: 1, padding: '.75rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                    color: '#fff', fontSize: '.9rem', cursor: 'pointer',
                    opacity: !form.nombreCompania || !form.idUsuarioAdmin ? 0.5 : 1
                  }}
                >
                  {crearMutation.isPending ? '⏳ Creando...' : 'Crear Compañía'}
                </button>
                <button onClick={() => setModal(null)} style={{
                  padding: '.75rem 1rem', borderRadius: '12px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal actualizar costo */}
      {modal === 'costo' && (
        <div onClick={() => setModal(null)} style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '380px', borderRadius: '20px', padding: '2rem',
            background: 'rgba(15,23,42,0.97)',
            border: '1px solid rgba(96,165,250,0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.3rem',
              letterSpacing: '.08em', color: '#f1f5f9', marginBottom: '1.25rem'
            }}>
              Actualizar Costo Operación
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputGroup
                label="Costo por día (GTQ)" name="nuevoCosto" type="number"
                value={costoForm.nuevoCosto}
                onChange={e => setCostoForm(prev => ({ ...prev, nuevoCosto: Number(e.target.value) }))}
                placeholder="0.00" required
              />
              <InputGroup
                label="Vigente desde" name="fechaCambio" type="date"
                value={costoForm.fechaCambio}
                onChange={e => setCostoForm(prev => ({ ...prev, fechaCambio: e.target.value }))}
                required
              />

              <div style={{ display: 'flex', gap: '.5rem', marginTop: '.25rem' }}>
                <button
                  onClick={() => costoMutation.mutate()}
                  disabled={costoMutation.isPending}
                  style={{
                    flex: 1, padding: '.7rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                    color: '#fff', fontSize: '.88rem', cursor: 'pointer'
                  }}
                >
                  {costoMutation.isPending ? '⏳...' : 'Actualizar'}
                </button>
                <button onClick={() => { setModal(null); setSelected(null) }} style={{
                  padding: '.7rem 1rem', borderRadius: '12px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCompaniasPage