import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { InputGroup } from '../../components/inputs/InputGroup'
import type { CategoriaRequest, CategoriaResponse } from '../../types/CinemaCore.types'

const emptyForm: CategoriaRequest = { nombre: '' }

const AdminCategoriasPage = () => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<CategoriaRequest>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['admin-categorias'],
    queryFn: cinemaService.getCategorias,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { nombre: form.nombre.trim() }
      if (!payload.nombre) throw new Error('El nombre es obligatorio.')
      return editingId
        ? cinemaService.updateCategoria(editingId, payload)
        : cinemaService.createCategoria(payload)
    },
    onSuccess: () => {
      setMsg({ type: 'ok', text: editingId ? 'Categoría actualizada correctamente.' : 'Categoría creada correctamente.' })
      setForm(emptyForm)
      setEditingId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
    },
    onError: (error: any) => {
      setMsg({ type: 'err', text: error?.response?.data?.message || 'No se pudo guardar la categoría.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (idCategoria: number) => cinemaService.deleteCategoria(idCategoria),
    onSuccess: () => {
      setMsg({ type: 'ok', text: 'Categoría eliminada correctamente.' })
      queryClient.invalidateQueries({ queryKey: ['admin-categorias'] })
    },
    onError: (error: any) => {
      setMsg({ type: 'err', text: error?.response?.data?.message || 'No se pudo eliminar la categoría.' })
    },
  })

  const startEdit = (categoria: CategoriaResponse) => {
    setEditingId(categoria.idCategoria)
    setForm({ nombre: categoria.nombre })
    setMsg(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Administración de Categorías
        </h1>
      </div>

      {msg && (
        <div style={{
          padding: '.7rem 1rem', borderRadius: '10px', marginBottom: '1rem',
          background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)', fontSize: '.84rem',
        }}>
          {msg.type === 'ok' ? '✅' : '⚠️'} {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>{editingId ? 'Editar categoría' : 'Crear categoría'}</h2>
          <InputGroup
            label="Nombre"
            value={form.nombre}
            onChange={e => setForm({ nombre: e.target.value })}
            placeholder="Ej. Acción"
            required
          />

          <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              style={{
                padding: '.7rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff',
              }}
            >
              <Plus size={15} style={{ display: 'inline-block', marginRight: '.35rem' }} />
              {editingId ? 'Actualizar' : 'Crear'}
            </button>

            {editingId && (
              <button
                onClick={cancelEdit}
                style={{
                  padding: '.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.2)', cursor: 'pointer',
                  background: 'rgba(30,64,175,0.12)', color: '#f1f5f9',
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div style={{ borderRadius: '16px', padding: '1.25rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
          <h2 style={{ color: '#f1f5f9', marginBottom: '1rem' }}>Categorías registradas</h2>
          {isLoading ? (
            <div style={{ color: '#94a3b8' }}>⏳ Cargando categorías...</div>
          ) : categorias.length === 0 ? (
            <div style={{ color: '#94a3b8' }}>No hay categorías registradas.</div>
          ) : (
            <div style={{ display: 'grid', gap: '.75rem' }}>
              {categorias.map((categoria: CategoriaResponse) => (
                <div key={categoria.idCategoria} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.75rem', padding: '.9rem 1rem', borderRadius: '12px', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.12)' }}>
                  <div>
                    <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{categoria.nombre}</div>
                    <div style={{ color: '#94a3b8', fontSize: '.75rem' }}># {categoria.idCategoria}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '.35rem' }}>
                    <button
                      onClick={() => startEdit(categoria)}
                      style={{
                        width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'rgba(96,165,250,0.12)', color: 'var(--blue-glow)',
                      }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(categoria.idCategoria)}
                      disabled={deleteMutation.isPending}
                      style={{
                        width: '34px', height: '34px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: 'rgba(239,68,68,0.12)', color: 'var(--accent2)',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminCategoriasPage