import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DollarSign, TrendingUp } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { InputGroup }    from '../../components/inputs/InputGroup'

const AdminCostoGlobalPage = () => {
  const qc = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [costo, setCosto]       = useState('')
  const [msg, setMsg]           = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: costoGlobal, isLoading } = useQuery({
    queryKey: ['costo-global'],
    queryFn:  cinemaService.getCostoGlobal,
  })

  const updateMutation = useMutation({
    mutationFn: () => cinemaService.updateCostoGlobal(
      costoGlobal!.idCostoGlobal,
      { costoDia: parseFloat(costo) }
    ),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Costo global actualizado correctamente.' })
      setEditMode(false)
      qc.invalidateQueries({ queryKey: ['costo-global'] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al actualizar.' })
    }
  })

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Costo Global de Operación
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Este costo se asigna automáticamente a cada cine al momento de crearlo.
        </p>
      </div>

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

      <div style={{
        borderRadius: '20px', padding: '2rem',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(30,64,175,0.15))',
        border: '1px solid rgba(96,165,250,0.2)', marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <DollarSign size={24} style={{ color: '#fcd34d' }} />
          </div>
          <div>
            <div style={{ fontSize: '.75rem', color: '#94a3b8', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Costo diario actual
            </div>
            {isLoading ? (
              <div style={{ fontSize: '2rem', color: '#475569' }}>...</div>
            ) : (
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '2.5rem', letterSpacing: '.05em', color: '#f1f5f9'
              }}>
                Q{costoGlobal?.costoDia?.toFixed(2) ?? '0.00'}
              </div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: '#94a3b8'
        }}>
          <TrendingUp size={13} />
          Última actualización: {costoGlobal?.updatedAt
            ? new Date(costoGlobal.updatedAt).toLocaleDateString('es-GT')
            : '—'}
        </div>
      </div>

      {/* Editar */}
      <div style={{
        borderRadius: '16px', padding: '1.5rem',
        background: 'rgba(30,64,175,0.12)',
        border: '1px solid rgba(96,165,250,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', letterSpacing: '.06em', color: '#f1f5f9' }}>
            Actualizar costo
          </h2>
          <button
            onClick={() => { setEditMode(p => !p); setCosto(''); setMsg(null) }}
            style={{
              padding: '.3rem .75rem', borderRadius: '8px', fontSize: '.75rem',
              fontWeight: 500, cursor: 'pointer',
              background: editMode ? 'rgba(239,68,68,0.12)' : 'rgba(96,165,250,0.1)',
              border: `1px solid ${editMode ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.25)'}`,
              color: editMode ? 'var(--accent2)' : 'var(--blue-glow)',
            }}
          >
            {editMode ? 'Cancelar' : '✏️ Editar'}
          </button>
        </div>

        {editMode && (
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
            <InputGroup
              label="Nuevo costo por día (GTQ)"
              name="costo" type="number"
              value={costo}
              onChange={e => setCosto(e.target.value)}
              placeholder="0.00" required
              className="flex-1"
            />
            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending || !costo}
              style={{
                padding: '.65rem 1.2rem', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                color: '#fff', fontSize: '.85rem', cursor: 'pointer',
                opacity: !costo ? 0.5 : 1, whiteSpace: 'nowrap',
                marginBottom: '0'
              }}
            >
              {updateMutation.isPending ? '⏳...' : 'Guardar'}
            </button>
          </div>
        )}

        {!editMode && (
          <p style={{ fontSize: '.82rem', color: '#64748b', lineHeight: 1.6 }}>
            Al actualizar el costo global, los nuevos cines creados tendrán este costo asignado automáticamente.
            Los cines existentes no se ven afectados a menos que se actualice su costo individualmente.
          </p>
        )}
      </div>
    </div>
  )
}

export default AdminCostoGlobalPage