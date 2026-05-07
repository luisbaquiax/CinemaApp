import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { MapPin, Ticket } from 'lucide-react'
import { cinemaService } from '../../services/microservice-cinema/CinemaService'

const PeliculaCinesPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['pelicula-cines', id],
    queryFn: () => cinemaService.getPeliculaById(Number(id)),
    enabled: !!id,
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9', marginBottom: '.5rem' }}>
        Cines de la película
      </h1>
      <p style={{ fontSize: '.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
        Vista preparada para conectar con el flujo de compra.
      </p>

      <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(30,64,175,0.12)', border: '1px solid rgba(96,165,250,0.15)', marginBottom: '1rem' }}>
        {isLoading ? (
          <div style={{ color: '#94a3b8' }}>⏳ Cargando película...</div>
        ) : (
          <>
            <div style={{ color: '#f1f5f9', fontSize: '1.2rem', marginBottom: '.35rem' }}>{data?.pelicula.titulo}</div>
            <div style={{ color: '#94a3b8', fontSize: '.85rem' }}>
              Todavía no existe un endpoint específico en `CinemaService` para cines por película.
            </div>
          </>
        )}
      </div>

      <div style={{ borderRadius: '16px', padding: '1.5rem', background: 'rgba(15,23,42,0.35)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#f1f5f9', marginBottom: '.75rem' }}>
          <MapPin size={16} />
          <span>Cines disponibles</span>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '.85rem', lineHeight: 1.6 }}>
          Esta pantalla queda lista para integrarse con un endpoint futuro que devuelva salas o funciones por película.
        </div>
        <button
          onClick={() => navigate(`/peliculas/${id}`)}
          style={{ marginTop: '1rem', padding: '.6rem 1rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}
        >
          <Ticket size={16} style={{ display: 'inline-block', marginRight: '.35rem' }} />
          Volver al detalle
        </button>
      </div>
    </div>
  )
}

export default PeliculaCinesPage