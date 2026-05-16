import { useState } from 'react'
import { Upload, Trash2, Star, AlertCircle } from 'lucide-react'
import type { PeliculaPostersResponse, PeliculaPostersRequest } from '../../types/CinemaCore.types'
import { ConfirmModal } from '../modal/ConfirmModal'

interface PosterManagementPanelProps {
  idPelicula: number
  posters: PeliculaPostersResponse[]
  onAddPoster: (payload: PeliculaPostersRequest) => void
  onRemovePoster: (idPoster: number, posterUrl: string) => void
  onSetMainPoster: (idPoster: number, posterUrl: string) => void
  isAddingPoster?: boolean
  isRemovingPoster?: boolean
  isSettingMain?: boolean
}

export const PosterManagementPanel = ({
  idPelicula,
  posters,
  onAddPoster,
  onRemovePoster,
  onSetMainPoster,
  isAddingPoster = false,
  isRemovingPoster = false,
  isSettingMain = false,
}: PosterManagementPanelProps) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isMainPoster, setIsMainPoster] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{ type: 'remove' | 'setMain'; idPoster: number; posterUrl: string } | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe exceder 5MB')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = e => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmitPoster = () => {
    if (!selectedFile) {
      alert('Selecciona un archivo')
      return
    }

    onAddPoster({
      idPelicula,
      archivo: selectedFile,
      esPrincipal: isMainPoster,
    })

    setSelectedFile(null)
    setPreviewUrl(null)
    setIsMainPoster(false)
    setShowAddForm(false)
  }

  const executeAction = () => {
    if (!pendingAction) return

    if (pendingAction.type === 'remove') {
      onRemovePoster(pendingAction.idPoster, pendingAction.posterUrl)
    } else if (pendingAction.type === 'setMain') {
      onSetMainPoster(pendingAction.idPoster, pendingAction.posterUrl)
    }

    setPendingAction(null)
  }

  return (
    <div style={{ borderRadius: '16px', border: '1px solid rgba(96,165,250,0.15)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'rgba(30,64,175,0.12)', padding: '1rem', borderBottom: '1px solid rgba(96,165,250,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#f1f5f9', margin: 0 }}>Gestión de Pósters</h3>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.5rem',
                padding: '.5rem 1rem',
                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '.85rem',
              }}
            >
              <Upload size={16} />
              Agregar Póster
            </button>
          )}
        </div>
      </div>

      {/* Formulario agregar póster */}
      {showAddForm && (
        <div style={{ background: 'rgba(30,64,175,0.08)', padding: '1.5rem', borderBottom: '1px solid rgba(96,165,250,0.1)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '.5rem', fontSize: '.85rem' }}>
              Selecciona una imagen (máx 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isAddingPoster}
              style={{
                display: 'block',
                width: '100%',
                padding: '.5rem',
                borderRadius: '8px',
                border: '1px solid rgba(96,165,250,0.2)',
                background: 'rgba(15,23,42,0.5)',
                color: '#cbd5e1',
              }}
            />
          </div>

          {previewUrl && (
            <div style={{ marginBottom: '1rem' }}>
              <img
                src={previewUrl}
                alt="preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid rgba(96,165,250,0.2)',
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <input
              type="checkbox"
              id="isMain"
              checked={isMainPoster}
              onChange={e => setIsMainPoster(e.target.checked)}
              disabled={isAddingPoster}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="isMain" style={{ color: '#cbd5e1', fontSize: '.85rem', cursor: 'pointer' }}>
              Establecer como póster principal
            </label>
          </div>

          <div style={{ display: 'flex', gap: '.5rem' }}>
            <button
              onClick={handleSubmitPoster}
              disabled={!selectedFile || isAddingPoster}
              style={{
                flex: 1,
                padding: '.6rem 1rem',
                background: selectedFile && !isAddingPoster ? 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))' : 'rgba(96,165,250,0.2)',
                border: 'none',
                color: '#f1f5f9',
                borderRadius: '8px',
                cursor: selectedFile && !isAddingPoster ? 'pointer' : 'not-allowed',
                fontSize: '.85rem',
              }}
            >
              {isAddingPoster ? '⏳ Subiendo...' : 'Subir Póster'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setSelectedFile(null)
                setPreviewUrl(null)
                setIsMainPoster(false)
              }}
              disabled={isAddingPoster}
              style={{
                flex: 1,
                padding: '.6rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(96,165,250,0.2)',
                color: '#cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '.85rem',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de pósters */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '.85rem',
          }}
        >
          <thead>
            <tr style={{ background: 'rgba(30,64,175,0.08)', borderBottom: '1px solid rgba(96,165,250,0.1)' }}>
              <th style={{ padding: '.75rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>Previsualización</th>
              <th style={{ padding: '.75rem', textAlign: 'left', color: '#cbd5e1', fontWeight: 600 }}>URL</th>
              <th style={{ padding: '.75rem', textAlign: 'center', color: '#cbd5e1', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '.75rem', textAlign: 'center', color: '#cbd5e1', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posters.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  <AlertCircle size={20} style={{ display: 'inline-block', marginRight: '.5rem' }} />
                  No hay pósters registrados
                </td>
              </tr>
            ) : (
              posters.map(poster => (
                <tr key={poster.idPoster} style={{ borderBottom: '1px solid rgba(96,165,250,0.05)', transition: 'background 0.2s ease' }}>
                  <td style={{ padding: '.75rem' }}>
                    <img
                      src={poster.url}
                      alt={`Poster ${poster.idPoster}`}
                      style={{
                        width: '40px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid rgba(96,165,250,0.2)',
                        cursor: 'pointer',
                      }}
                    />
                  </td>
                  <td style={{ padding: '.75rem', color: '#cbd5e1' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        maxWidth: '200px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {poster.url}
                    </span>
                  </td>
                  <td style={{ padding: '.75rem', textAlign: 'center' }}>
                    {poster.esPrincipal ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '.25rem',
                          background: 'rgba(96,165,250,0.2)',
                          border: '1px solid var(--blue-glow)',
                          color: 'var(--blue-glow)',
                          padding: '.25rem .5rem',
                          borderRadius: '4px',
                          fontSize: '.75rem',
                        }}
                      >
                        <Star size={12} />
                        Principal
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '.75rem' }}>Secundario</span>
                    )}
                  </td>
                  <td style={{ padding: '.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center' }}>
                      {!poster.esPrincipal && (
                        <button
                          onClick={() => setPendingAction({ type: 'setMain', idPoster: poster.idPoster, posterUrl: poster.url })}
                          disabled={isSettingMain}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '.25rem',
                            padding: '.4rem .6rem',
                            background: 'rgba(96,165,250,0.1)',
                            border: '1px solid rgba(96,165,250,0.3)',
                            color: 'var(--blue-glow)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '.75rem',
                          }}
                        >
                          <Star size={14} />
                          Principal
                        </button>
                      )}
                      <button
                        onClick={() => setPendingAction({ type: 'remove', idPoster: poster.idPoster, posterUrl: poster.url })}
                        disabled={isRemovingPoster}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '.25rem',
                          padding: '.4rem .6rem',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '.75rem',
                        }}
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        open={!!pendingAction}
        title={pendingAction?.type === 'remove' ? 'Eliminar Póster' : 'Establecer como Principal'}
        message={
          pendingAction?.type === 'remove'
            ? '¿Estás seguro de que deseas eliminar este póster? Esta acción no se puede deshacer.'
            : '¿Deseas establecer este póster como el póster principal de la película?'
        }
        confirmText={pendingAction?.type === 'remove' ? 'Eliminar' : 'Establecer'}
        cancelText="Cancelar"
        onConfirm={executeAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  )
}
