import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DollarSign, AlertTriangle } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { InputGroup } from '../../components/inputs/InputGroup'

const AdminCostoGlobalPage = () => {
  const qc = useQueryClient()

  const [editMode, setEditMode] = useState(false)
  const [costo, setCosto] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // 🔍 QUERY
  const {
    data: costoGlobal,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['costo-global'],
    queryFn: cinemaService.getCostoGlobal,
    retry: false
  })

  const noExiste =
    isError &&
    (error as any)?.response?.status === 409

  const createMutation = useMutation({
    mutationFn: () => {
      const value = parseFloat(costo)
      if (isNaN(value) || value <= 0) {
        throw new Error('El costo debe ser mayor a 0.')
      }
      return cinemaService.createCostoGlobal({ costoDia: value })
    },
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Costo global creado correctamente.' })
      setCosto('')
      qc.invalidateQueries({ queryKey: ['costo-global'] })
    },
    onError: (err: any) => {
      setMsg({
        type: 'err',
        text: err?.message || err?.response?.data?.message || 'Error al crear.'
      })
    }
  })

  // ✏️ UPDATE
  const updateMutation = useMutation({
    mutationFn: () => {
      const value = parseFloat(costo)
      if (isNaN(value) || value <= 0) {
        throw new Error('El costo debe ser mayor a 0.')
      }

      return cinemaService.updateCostoGlobal(
        costoGlobal!.idCostoGlobal,
        { costoDia: value }
      )
    },
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Costo global actualizado correctamente.' })
      setEditMode(false)
      qc.invalidateQueries({ queryKey: ['costo-global'] })
    },
    onError: (err: any) => {
      setMsg({
        type: 'err',
        text: err?.message || err?.response?.data?.message || 'Error al actualizar.'
      })
    }
  })

  // ⏳ LOADING
  if (isLoading) {
    return (
      <div style={{ padding: '2rem', color: '#94a3b8' }}>
        Cargando costo global...
      </div>
    )
  }

  // 🚨 ERROR REAL (no 409)
  if (isError && !noExiste) {
    return (
      <div style={{ padding: '2rem', color: 'var(--accent2)' }}>
        ⚠️ Error al obtener el costo global.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '2rem',
          letterSpacing: '.08em',
          color: '#f1f5f9'
        }}>
          Costo Global de Operación
        </h1>
      </div>

      {/* MENSAJES */}
      {msg && (
        <div style={{
          padding: '.7rem 1rem',
          borderRadius: '10px',
          marginBottom: '1rem',
          background: msg.type === 'ok'
            ? 'rgba(34,197,94,0.1)'
            : 'rgba(239,68,68,0.1)',
          border: `1px solid ${
            msg.type === 'ok'
              ? 'rgba(34,197,94,0.3)'
              : 'rgba(239,68,68,0.3)'
          }`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
          fontSize: '.84rem'
        }}>
          {msg.type === 'ok' ? '' : '⚠️'} {msg.text}
        </div>
      )}

      {/* 🚫 NO EXISTE COSTO */}
      {noExiste ? (
        <div style={{
          borderRadius: '20px',
          padding: '2rem',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)'
        }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1rem' }}>
            <AlertTriangle color="#f87171" />
            <h2 style={{ color: '#f1f5f9' }}>
              No hay costo global configurado
            </h2>
          </div>

          <p style={{ fontSize: '.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Debes registrar un costo global para que los nuevos cines puedan operar correctamente.
          </p>

          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-end' }}>
            <InputGroup
              label="Costo por día (GTQ)"
              type="number"
              value={costo}
              onChange={e => setCosto(e.target.value)}
              placeholder="0.00"
            />

            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !costo}
              style={{
                padding: '.65rem 1.2rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              {createMutation.isPending ? '⏳...' : 'Crear'}
            </button>
          </div>
        </div>
      ) : (

        <>
          {/* INFO ACTUAL */}
          <div style={{
            borderRadius: '20px',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.25), rgba(30,64,175,0.15))',
            border: '1px solid rgba(96,165,250,0.2)',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <DollarSign size={24} style={{ color: '#fcd34d' }} />
              <div>
                <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>
                  Costo diario actual
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  color: '#f1f5f9'
                }}>
                  Q{costoGlobal?.costoDia?.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.5rem' }}>
              Última actualización:{' '}
              {costoGlobal?.updatedAt
                ? new Date(costoGlobal.updatedAt).toLocaleDateString('es-GT')
                : '—'}
            </div>
          </div>

          {/* EDITAR */}
          <div style={{
            borderRadius: '16px',
            padding: '1.5rem',
            background: 'rgba(30,64,175,0.12)',
            border: '1px solid rgba(96,165,250,0.15)'
          }}>

            <button
              onClick={() => {
                setEditMode(p => !p)
                setCosto(costoGlobal?.costoDia.toString() ?? '')
                setMsg(null)
              }}
            >
              {editMode ? 'Cancelar' : 'Editar'}
            </button>

            {editMode && (
              <div style={{ marginTop: '1rem' }}>
                <InputGroup
                  label="Nuevo costo"
                  type="number"
                  value={costo}
                  onChange={e => setCosto(e.target.value)}
                />

                <button onClick={() => updateMutation.mutate()}>
                  Guardar
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default AdminCostoGlobalPage