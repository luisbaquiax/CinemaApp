import { useEffect, useState } from 'react'
import type { AnuncioResponse } from '../../types/Ads.types'

type MediaKind = 'image' | 'video'

type AdMediaModalProps = {
  open: boolean
  anuncio: AnuncioResponse | null
  mediaKind: MediaKind
  isPending?: boolean
  onClose: () => void
  onSubmit: (file: File) => void
}

const AdMediaModal = ({ open, anuncio, mediaKind, isPending = false, onClose, onSubmit }: AdMediaModalProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setFile(null)
      setError(null)
    }
  }, [open])

  if (!open || !anuncio) return null

  const accept = mediaKind === 'video' ? 'video/*' : 'image/*'
  const mediaLabel = mediaKind === 'video' ? 'video' : 'imagen'

  const currentUrl = mediaKind === 'video' ? anuncio.videoUrl : anuncio.imagenUrl
  const hasCurrentMedia = !!currentUrl

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    if (!nextFile) {
      setFile(null)
      return
    }

    const isValid = mediaKind === 'video'
      ? nextFile.type.startsWith('video/')
      : nextFile.type.startsWith('image/')

    if (!isValid) {
      setError(`Debes seleccionar un archivo de ${mediaLabel}.`)
      event.currentTarget.value = ''
      setFile(null)
      return
    }

    setError(null)
    setFile(nextFile)
  }

  const handleSubmit = () => {
    if (!file) {
      setError(`Selecciona un archivo de ${mediaLabel}.`)
      return
    }
    onSubmit(file)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 320,
        background: 'rgba(15,23,42,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '620px',
          borderRadius: '12px',
          padding: '1.1rem',
          background: 'rgba(15,23,42,0.98)',
          border: '1px solid rgba(96,165,250,0.12)',
        }}
      >
        <h3 style={{ color: '#f1f5f9', marginBottom: '.5rem' }}>
          {hasCurrentMedia ? `Actualizar ${mediaLabel}` : `Agregar ${mediaLabel}`}
        </h3>

        <p style={{ color: '#94a3b8', marginBottom: '.9rem', fontSize: '.84rem' }}>
          Anuncio: <span style={{ color: '#cbd5e1' }}>{anuncio.titulo}</span>
        </p>

        {hasCurrentMedia && (
          <div style={{ marginBottom: '.8rem' }}>
            {mediaKind === 'video' ? (
              <video controls src={currentUrl} style={{ width: '100%', maxHeight: 280, borderRadius: '8px' }} />
            ) : (
              <img src={currentUrl} alt={anuncio.titulo} style={{ width: '100%', maxHeight: 280, borderRadius: '8px', objectFit: 'cover' }} />
            )}
          </div>
        )}

        <label style={{ color: '#94a3b8', fontSize: '.8rem', display: 'block' }}>
          Selecciona {mediaLabel}
          <input
            type="file"
            accept={accept}
            onChange={onFileChange}
            style={{
              marginTop: '.4rem',
              width: '100%',
              padding: '.6rem',
              borderRadius: '8px',
              border: '1px solid rgba(96,165,250,0.2)',
              background: 'rgba(15,23,42,0.55)',
              color: '#f1f5f9',
            }}
          />
        </label>

        {file && (
          <div style={{ marginTop: '.5rem', color: '#93c5fd', fontSize: '.8rem' }}>
            Archivo: {file.name}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '.5rem', color: '#fda4af', fontSize: '.8rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '.5rem .8rem',
              borderRadius: '8px',
              border: '1px solid rgba(96,165,250,0.12)',
              background: 'transparent',
              color: '#94a3b8',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              padding: '.5rem .9rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
              color: '#fff',
            }}
          >
            {isPending ? '⏳ Guardando...' : hasCurrentMedia ? `Actualizar ${mediaLabel}` : `Subir ${mediaLabel}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdMediaModal
