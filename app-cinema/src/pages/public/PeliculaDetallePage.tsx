import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { Star } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'
import PosterCarousel from '../../components/ui/PosterCarousel'
import type { PeliculaPostersResponse } from '../../types/CinemaCore.types'

const PeliculaDetallePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['pelicula-detalle', id],
    queryFn: () => cinemaService.getPeliculaById(Number(id)),
    enabled: !!id,
  })

  const { data: postersData, isLoading: postersLoading } = useQuery({
    queryKey: ['posters-pelicula', id],
    queryFn: () => cinemaService.getPostersByPelicula(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '2rem' }}>⏳ Cargando detalle...</div>
  }

  if (!data) {
    return <div style={{ color: 'var(--accent2)', padding: '2rem' }}>No se encontró la película.</div>
  }

  const { pelicula, actores } = data
  const posters: PeliculaPostersResponse[] = postersData || []

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          {pelicula.titulo}
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          {pelicula.clasificacion?.codigo ?? pelicula.clasificacion?.nombre} · {pelicula.duracionMin} min
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '.8fr 1.2fr', gap: '2rem' }}>
        <div>
          <PosterCarousel posters={posters} isLoading={postersLoading} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <p style={{ color: '#cbd5e1', lineHeight: 1.7, marginBottom: '1rem' }}>
              {pelicula.sinopsis || 'Sinopsis no disponible.'}
            </p>

            <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {pelicula.categorias?.map(cat => (
                <span key={cat.idCategoria} style={{ fontSize: '.65rem', padding: '.2rem .5rem', borderRadius: '999px', background: 'rgba(96,165,250,0.12)', color: 'var(--blue-glow)' }}>
                  {cat.nombre}
                </span>
              ))}
            </div>

            <button
              onClick={() => navigate(`/peliculas/${pelicula.idPelicula}/cines`)}
              style={{ padding: '.6rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff', width: '100%' }}
            >
              Ver cines disponibles
            </button>
          </div>

          <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
              <Star size={16} color="#fcd34d" />
              <span>Calificación: {pelicula.calificacionPromedio ?? '—'}</span>
            </div>

            <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '.75rem' }}>
              <strong style={{ color: '#f1f5f9' }}>Director:</strong> {pelicula.director || '—'}
            </div>

            <div style={{ color: '#94a3b8', fontSize: '.85rem', marginBottom: '.75rem' }}>
              <strong style={{ color: '#f1f5f9' }}>Estreno:</strong> {pelicula.fechaEstreno || '—'}
            </div>

            <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>
              <strong style={{ color: '#f1f5f9' }}>Actores:</strong>
              <div style={{ marginTop: '.5rem', display: 'grid', gap: '.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {actores?.length ? (
                  actores.map((actor, index) => (
                    <div key={`${actor.actor}-${index}`} style={{ padding: '.65rem .75rem', borderRadius: '10px', background: 'rgba(30,64,175,0.12)' }}>
                      <div style={{ color: '#f1f5f9', fontSize: '.85rem' }}>{actor.actor}</div>
                      <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Personaje: {actor.personaje}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ marginTop: '.5rem', color: '#94a3b8', fontSize: '.85rem' }}>Sin reparto registrado.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PeliculaDetallePage