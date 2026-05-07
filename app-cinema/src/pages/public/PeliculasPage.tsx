import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Film } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'

const PeliculasPage = () => {
  const navigate = useNavigate()

  const { data: peliculas = [], isLoading } = useQuery({
    queryKey: ['peliculas-activas'],
    queryFn: cinemaService.getPeliculasActivas,
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9' }}>
          Películas en cartelera
        </h1>
        <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
          Información pública obtenida desde `CinemaService`.
        </p>
      </div>

      {isLoading ? (
        <div style={{ color: '#94a3b8' }}>⏳ Cargando películas...</div>
      ) : peliculas.length === 0 ? (
        <div style={{ color: '#94a3b8' }}>No hay películas activas por ahora.</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {peliculas.map((pelicula: any) => (
            <div key={pelicula.idPelicula} style={{ borderRadius: '16px', padding: '1rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(37,99,235,0.2)' }}>
                  <Film size={18} color='var(--blue-glow)' />
                </div>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 500 }}>{pelicula.titulo}</div>
                  <div style={{ color: '#94a3b8', fontSize: '.78rem' }}>{pelicula.clasificacion?.codigo ?? pelicula.clasificacion?.nombre}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginBottom: '.75rem' }}>
                {pelicula.categorias?.map((cat: any) => (
                  <span key={cat.idCategoria} style={{ fontSize: '.65rem', padding: '.15rem .45rem', borderRadius: '5px', background: 'rgba(96,165,250,0.12)', color: 'var(--blue-glow)' }}>
                    {cat.nombre}
                  </span>
                ))}
              </div>

              <div style={{ color: '#94a3b8', fontSize: '.78rem', marginBottom: '1rem' }}>
                {pelicula.duracionMin} min · ⭐ {pelicula.calificacionPromedio ?? '—'}
              </div>

              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button
                  onClick={() => navigate(`/peliculas/${pelicula.idPelicula}`)}
                  style={{ flex: 1, padding: '.55rem .8rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
                >
                  Ver detalle
                </button>
                <button
                  onClick={() => navigate(`/peliculas/${pelicula.idPelicula}/cines`)}
                  style={{ padding: '.55rem .8rem', borderRadius: '10px', border: '1px solid rgba(96,165,250,0.2)', cursor: 'pointer', background: 'rgba(30,64,175,0.12)', color: '#f1f5f9' }}
                >
                  Cines
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PeliculasPage