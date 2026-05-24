import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { adsAdminService } from '../../services/microservice-ads-billing/AdsAdminAnunciosService'
import { authService } from '../../services/microservice-users/authService'
import type { AnuncioResponse, MessageSuccess } from '../../types/Ads.types'
import type { UsuarioComunResponse } from '../../types/Usuario.type'

const OwnerName = ({ idUsuario }: { idUsuario: number }) => {
  const { data, isPending } = useQuery<UsuarioComunResponse | null>({
    queryKey: ['user-by-id', idUsuario],
    queryFn: () => authService.getProfileById(idUsuario),
    enabled: idUsuario > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  if (isPending) return <span style={{ color: '#94a3b8' }}>Cargando...</span>
  if (!data) return <span>#{idUsuario}</span>

  return <span>{data.username || `${data.nombres} ${data.apellidos}` || `#${idUsuario}`}</span>
}

const AdminAnunciosPage = () => {
  const qc = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ anuncio?: AnuncioResponse; activate: boolean } | null>(null)
  const [filterTipo, setFilterTipo] = useState<string>('all')

  const { data: anuncios = [], isPending } = useQuery<AnuncioResponse[]>({
    queryKey: ['admin-anuncios-list'],
    queryFn: () => adsAdminService.listAnuncios(),
  })

  const tiposUnicos = useMemo(() => {
    const tipos = new Map<number, string>()
    anuncios.forEach(a => {
      if (a.tipo?.idTipoAnuncio) {
        tipos.set(a.tipo.idTipoAnuncio, a.tipo.nombre || `Tipo #${a.tipo.idTipoAnuncio}`)
      }
    })
    return Array.from(tipos.entries())
  }, [anuncios])

  const anunciosFiltrados = useMemo(() => {
    if (filterTipo === 'all') return anuncios
    const id = Number(filterTipo)
    if (!Number.isFinite(id)) return anuncios
    return anuncios.filter(a => a.tipo?.idTipoAnuncio === id)
  }, [anuncios, filterTipo])

  const activarMutation = useMutation<MessageSuccess, any, number>({
    mutationFn: (id: number) => adsAdminService.activarAnuncio(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-anuncios-list'] })
      setConfirmOpen(false)
      setPendingAction(null)
    },
  })

  const desactivarMutation = useMutation<MessageSuccess, any, number>({
    mutationFn: (id: number) => adsAdminService.desactivarAnuncio(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin-anuncios-list'] })
      setConfirmOpen(false)
      setPendingAction(null)
    },
  })

  const handleToggle = (anuncio: AnuncioResponse, activate: boolean) => {
    setPendingAction({ anuncio, activate })
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!pendingAction?.anuncio) return
    const id = pendingAction.anuncio.idAnuncio
    if (pendingAction.activate) activarMutation.mutate(id)
    else desactivarMutation.mutate(id)
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
      <h2 style={{ color: '#f1f5f9', marginBottom: '.8rem', fontSize: '1.5rem' }}>Anuncios - Administración</h2>

      <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(30,64,175,0.08)', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
          <h3 style={{ color: '#f1f5f9', marginBottom: 0 }}>Anuncios Registrados</h3>

          <div style={{ minWidth: 220 }}>
            <label style={{ color: '#94a3b8', fontSize: '.76rem' }}>
              Filtrar por tipo
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '.3rem',
                  padding: '.55rem .65rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'rgba(15,23,42,0.55)',
                  color: '#f1f5f9',
                }}
              >
                <option value="all">Todos los tipos</option>
                {tiposUnicos.map(([id, nombre]) => (
                  <option key={id} value={id}>{nombre}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isPending ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando anuncios...</div>
        ) : anuncios.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>No hay anuncios registrados.</div>
        ) : anunciosFiltrados.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>No hay anuncios para el tipo seleccionado.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr style={{ color: '#93c5fd', fontSize: '.8rem', textAlign: 'left' }}>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>ID</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Título</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Usuario</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Tipo</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Periodo</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Monto</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Activo</th>
                  <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {anunciosFiltrados.map(a => (
                  <tr key={a.idAnuncio} style={{ color: '#e2e8f0', fontSize: '.84rem' }}>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{a.idAnuncio}</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{a.titulo}</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}><OwnerName idUsuario={a.usuarioId} /></td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{a.tipo?.nombre ?? '-'}</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{a.periodo?.nombre ?? '-'} ({a.periodo?.dias ?? '-'}d)</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>Q {Number(a.montoPagado).toFixed(2)}</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{a.activo ? 'Sí' : 'No'}</td>
                    <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                      {a.activo ? (
                        <button
                          onClick={() => handleToggle(a, false)}
                          disabled={desactivarMutation.isPending || activarMutation.isPending}
                          style={{
                            padding: '.35rem .6rem',
                            borderRadius: 8,
                            border: '1px solid rgba(249,115,22,0.2)',
                            background: 'transparent',
                            color: '#fb923c',
                            cursor: 'pointer',
                            fontSize: '.8rem',
                          }}
                        >
                          {desactivarMutation.isPending ? '⏳' : 'Desactivar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(a, true)}
                          disabled={activarMutation.isPending || desactivarMutation.isPending}
                          style={{
                            padding: '.35rem .6rem',
                            borderRadius: 8,
                            border: '1px solid rgba(16,185,129,0.2)',
                            background: 'transparent',
                            color: '#6ee7b7',
                            cursor: 'pointer',
                            fontSize: '.8rem',
                          }}
                        >
                          {activarMutation.isPending ? '⏳' : 'Activar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        title={pendingAction?.activate ? 'Confirmar activación' : 'Confirmar desactivación'}
        message={pendingAction ? (pendingAction.activate ? `¿Activar el anuncio "${pendingAction.anuncio?.titulo}"?` : `¿Desactivar el anuncio "${pendingAction.anuncio?.titulo}"?`) : ''}
        confirmText={pendingAction?.activate ? 'Activar' : 'Desactivar'}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingAction(null) }}
      />
    </div>
  )
}

export default AdminAnunciosPage

