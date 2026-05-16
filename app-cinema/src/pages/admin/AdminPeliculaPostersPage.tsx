import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Star } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import { PosterManagementPanel } from '../../components/ui/PosterManagementPanel'
import type { PeliculaPostersRequest } from '../../types/CinemaCore.types'

const AdminPeliculaPostersPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const movieId = Number(id)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pelicula-posters-detalle', id],
    queryFn: () => cinemaService.getPeliculaById(movieId),
    enabled: !!id,
  })

  const { data: postersData, isLoading: postersLoading } = useQuery({
    queryKey: ['admin-posters-pelicula', id],
    queryFn: () => cinemaService.getPostersByPelicula(movieId),
    enabled: !!id,
  })

  const addPosterMutation = useMutation({
    mutationFn: (payload: PeliculaPostersRequest) => cinemaService.agregarPosterPelicula(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posters-pelicula', id] })
    },
  })

  const removePosterMutation = useMutation({
    mutationFn: (idPoster: number) => cinemaService.removePosterFromPelicula(idPoster),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posters-pelicula', id] })
    },
  })

  const setMainPosterMutation = useMutation({
    mutationFn: (idPoster: number) => cinemaService.setMainPosterPelicula(movieId, idPoster),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posters-pelicula', id] })
    },
  })

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando detalle...</div>
  }

  if (!data) {
    return <div style={{ color: 'var(--accent2)', padding: '2rem' }}>No se encontró la película.</div>
  }

  const { pelicula, actores } = data
  const posters = postersData || []

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9', margin: 0 }}>
            Administrar Pósters
          </h1>
          <p style={{ fontSize: '.85rem', color: '#94a3b8', marginTop: '.35rem' }}>
            {pelicula.titulo} · {pelicula.clasificacion?.codigo ?? pelicula.clasificacion?.nombre} · {pelicula.duracionMin} min
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/peliculas')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.65rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(96,165,250,0.2)',
            background: 'rgba(30,64,175,0.12)',
            color: '#e2e8f0',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Volver a películas
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
        <div>
          <div style={{ marginBottom: '1.5rem', borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '.95rem' }}>Información</h3>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1rem', fontSize: '.85rem' }}>
              {pelicula.sinopsis || 'Sinopsis no disponible.'}
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <strong style={{ color: '#cbd5e1', fontSize: '.85rem' }}>Categorías:</strong>
              <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                {pelicula.categorias?.length ? (
                  pelicula.categorias.map(cat => (
                    <span
                      key={cat.idCategoria}
                      style={{
                        fontSize: '.65rem',
                        padding: '.2rem .5rem',
                        borderRadius: '999px',
                        background: 'rgba(96,165,250,0.12)',
                        color: 'var(--blue-glow)',
                      }}
                    >
                      {cat.nombre}
                    </span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '.85rem' }}>Sin categorías</span>
                )}
              </div>
            </div>

            <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '.75rem' }}>
              <strong style={{ color: '#f1f5f9' }}>Director:</strong> {pelicula.director || '—'}
            </div>

            <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '.75rem' }}>
              <strong style={{ color: '#f1f5f9' }}>Estreno:</strong> {pelicula.fechaEstreno || '—'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginTop: '1rem' }}>
              <Star size={16} color="#fcd34d" />
              <span>Calificación: {pelicula.calificacionPromedio ?? '—'}</span>
            </div>
          </div>

          <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '.95rem' }}>Reparto</h3>
            <div style={{ display: 'grid', gap: '.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {actores?.length ? (
                actores.map((actor, index) => (
                  <div key={`${actor.actor}-${index}`} style={{ padding: '.65rem .75rem', borderRadius: '8px', background: 'rgba(30,64,175,0.12)' }}>
                    <div style={{ color: '#f1f5f9', fontSize: '.85rem' }}>{actor.actor}</div>
                    <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Personaje: {actor.personaje}</div>
                  </div>
                ))
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>Sin reparto registrado.</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <PosterManagementPanel
            idPelicula={pelicula.idPelicula}
            posters={posters}
            onAddPoster={poster => addPosterMutation.mutate(poster)}
            onRemovePoster={(idPoster, _) => removePosterMutation.mutate(idPoster)}
            onSetMainPoster={(idPoster, _) => setMainPosterMutation.mutate(idPoster)}
            isAddingPoster={addPosterMutation.isPending}
            isRemovingPoster={removePosterMutation.isPending}
            isSettingMain={setMainPosterMutation.isPending}
          />
          {postersLoading && (
            <div style={{ color: '#94a3b8', marginTop: '.75rem', fontSize: '.85rem' }}>⏳ Cargando pósters...</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPeliculaPostersPage
