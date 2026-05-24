import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import ConfirmModal from '../../components/modal/ConfirmModal'
import { useAuth } from '../../hooks/UseAuth'
import { adsAnuncianteService } from '../../services/microservice-ads-billing/AdsAnuncinateService'
import type { AnuncioResponse } from '../../types/Ads.types'

const isTipoTexto = (anuncio: AnuncioResponse) => {
  const nombre = anuncio.tipo?.nombre?.toLowerCase() ?? ''
  return nombre.includes('texto')
}

const AnuncianteArchivosAnunciosPage = () => {
  const { auth } = useAuth()
  const qc = useQueryClient()
  const [selectedAdId, setSelectedAdId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const { data: misAnuncios = [], isLoading } = useQuery<AnuncioResponse[]>({
    queryKey: ['anunciante-mis-anuncios', auth?.idUsuario],
    queryFn: () => adsAnuncianteService.misAnuncios(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  })

  const anunciosGestionables = useMemo(
    () => misAnuncios.filter(anuncio => !isTipoTexto(anuncio)),
    [misAnuncios],
  )

  const selectedAd = useMemo(
    () => anunciosGestionables.find(anuncio => anuncio.idAnuncio === Number(selectedAdId)) ?? null,
    [anunciosGestionables, selectedAdId],
  )

  const mediaUrl = selectedAd?.videoUrl || selectedAd?.imagenUrl || ''
  const hasMedia = !!mediaUrl

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedAd || !selectedFile) {
        throw new Error('Selecciona anuncio y archivo antes de subir.')
      }

      return adsAnuncianteService.subirArchivoAnuncio({
        idAnuncio: selectedAd.idAnuncio,
        file: selectedFile,
      })
    },
    onSuccess: async (res) => {
      setMsg({ type: 'ok', text: res?.message || 'Archivo subido correctamente.' })
      setSelectedFile(null)
      await qc.invalidateQueries({ queryKey: ['anunciante-mis-anuncios', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || err?.message || 'No se pudo subir el archivo.' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!selectedAd || !selectedFile) {
        throw new Error('Selecciona anuncio y archivo antes de actualizar.')
      }

      return adsAnuncianteService.actualizarArchivoAnuncio({
        idAnuncio: selectedAd.idAnuncio,
        file: selectedFile,
      })
    },
    onSuccess: async (res) => {
      setMsg({ type: 'ok', text: res?.message || 'Archivo actualizado correctamente.' })
      setSelectedFile(null)
      await qc.invalidateQueries({ queryKey: ['anunciante-mis-anuncios', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || err?.message || 'No se pudo actualizar el archivo.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!selectedAd) {
        throw new Error('Selecciona anuncio antes de eliminar archivo.')
      }
      return adsAnuncianteService.eliminarArchivoAnuncio(selectedAd.idAnuncio)
    },
    onSuccess: async (res) => {
      setMsg({ type: 'ok', text: res?.message || 'Archivo eliminado correctamente.' })
      setConfirmDeleteOpen(false)
      await qc.invalidateQueries({ queryKey: ['anunciante-mis-anuncios', auth?.idUsuario] })
    },
    onError: (err: any) => {
      setMsg({ type: 'err', text: err?.response?.data?.message || err?.message || 'No se pudo eliminar el archivo.' })
      setConfirmDeleteOpen(false)
    },
  })

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (!file) {
      setSelectedFile(null)
      return
    }

    const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/')
    if (!isImageOrVideo) {
      setMsg({ type: 'err', text: 'Solo se permiten archivos de imagen o video.' })
      event.currentTarget.value = ''
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setMsg(null)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Archivos de anuncios
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>
          Sube, actualiza o elimina imagen/video para tus anuncios. Los anuncios de tipo texto no aparecen aquí.
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: '.75rem 1rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: msg.type === 'ok' ? '#4ade80' : '#fda4af',
            fontSize: '.84rem',
          }}
        >
          {msg.text}
        </div>
      )}

      <section style={{ border: '1px solid rgba(96,165,250,0.15)', borderRadius: '12px', padding: '1rem', background: 'rgba(15,23,42,0.45)' }}>
        {isLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando tus anuncios...</div>
        ) : anunciosGestionables.length === 0 ? (
          <div style={{ color: '#94a3b8' }}>
            No hay anuncios de imagen/video disponibles para gestionar archivos.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '.8rem' }}>
            <label style={{ color: '#94a3b8', fontSize: '.78rem' }}>
              Selecciona anuncio
              <select
                value={selectedAdId}
                onChange={(e) => setSelectedAdId(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '.35rem',
                  padding: '.65rem .7rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'rgba(15,23,42,0.55)',
                  color: '#f1f5f9',
                }}
              >
                <option value="">Selecciona un anuncio</option>
                {anunciosGestionables.map(anuncio => (
                  <option key={anuncio.idAnuncio} value={anuncio.idAnuncio}>
                    #{anuncio.idAnuncio} · {anuncio.titulo} · {anuncio.tipo?.nombre ?? 'Tipo'}
                  </option>
                ))}
              </select>
            </label>

            {selectedAd && (
              <div style={{ border: '1px solid rgba(96,165,250,0.12)', borderRadius: '10px', padding: '.8rem', background: 'rgba(30,41,59,0.45)' }}>
                <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{selectedAd.titulo}</div>
                <div style={{ marginTop: '.2rem', color: '#94a3b8', fontSize: '.8rem' }}>
                  Tipo: {selectedAd.tipo?.nombre ?? '-'} · Estado: {selectedAd.activo ? 'Activo' : 'Inactivo'}
                </div>
                <div style={{ marginTop: '.5rem', color: '#cbd5e1', fontSize: '.8rem' }}>
                  Archivo actual: {hasMedia ? 'Disponible' : 'No tiene archivo cargado'}
                </div>

                {hasMedia && (
                  <div style={{ marginTop: '.6rem' }}>
                    {selectedAd.videoUrl ? (
                      <video controls src={selectedAd.videoUrl} style={{ width: '100%', maxWidth: 460, borderRadius: '8px' }} />
                    ) : (
                      <img src={selectedAd.imagenUrl} alt={selectedAd.titulo} style={{ width: '100%', maxWidth: 460, borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                  </div>
                )}
              </div>
            )}

            <label style={{ color: '#94a3b8', fontSize: '.78rem' }}>
              Archivo (imagen o video)
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                disabled={!selectedAd}
                style={{
                  width: '100%',
                  marginTop: '.35rem',
                  padding: '.6rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'rgba(15,23,42,0.55)',
                  color: '#f1f5f9',
                }}
              />
            </label>

            {selectedFile && (
              <div style={{ color: '#93c5fd', fontSize: '.8rem' }}>
                Archivo seleccionado: {selectedFile.name}
              </div>
            )}

            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => uploadMutation.mutate()}
                disabled={!selectedAd || !selectedFile || uploadMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '.55rem .8rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                  color: '#fff',
                }}
              >
                {uploadMutation.isPending ? '⏳ Subiendo...' : 'Subir archivo'}
              </button>

              <button
                onClick={() => updateMutation.mutate()}
                disabled={!selectedAd || !selectedFile || uploadMutation.isPending || updateMutation.isPending}
                style={{
                  padding: '.55rem .8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(96,165,250,0.2)',
                  background: 'transparent',
                  color: '#bfdbfe',
                }}
              >
                {updateMutation.isPending ? '⏳ Actualizando...' : 'Actualizar archivo'}
              </button>

              <button
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={!selectedAd || !hasMedia || deleteMutation.isPending}
                style={{
                  padding: '.55rem .8rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(248,113,113,0.2)',
                  background: 'transparent',
                  color: '#fda4af',
                }}
              >
                {deleteMutation.isPending ? '⏳ Eliminando...' : 'Eliminar archivo'}
              </button>
            </div>
          </div>
        )}
      </section>

      <ConfirmModal
        open={confirmDeleteOpen}
        title="Eliminar archivo del anuncio"
        message={selectedAd ? `¿Seguro que deseas eliminar el archivo de "${selectedAd.titulo}"?` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </div>
  )
}

export default AnuncianteArchivosAnunciosPage
