import type { Movie } from '../../types/Movie.types'

interface Props {
  movie: Movie
  delay?: number
  onVerCines: (movieId: number) => void
}

const badgeConfig = {
  estreno: { label: 'Estreno',    bg: 'var(--accent)',           color: '#000' },
  popular: { label: '🔥 Popular', bg: 'var(--accent2)',          color: '#fff' },
  nuevo:   { label: 'Nuevo',      bg: 'rgba(96,165,250,0.9)',    color: '#000' },
}

const MovieCard = ({ movie, delay = 0, onVerCines }: Props) => {
  return (
    <div
      className="animate-fade-up"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        cursor: 'pointer',
        animationDelay: `${delay}s`,
        transition: 'transform .22s, box-shadow .22s, border-color .22s'
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-6px) scale(1.02)'
        el.style.boxShadow = '0 16px 40px rgba(37,99,235,0.3)'
        el.style.borderColor = 'rgba(96,165,250,0.4)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = ''
        el.style.borderColor = 'var(--card-border)'
      }}
    >
      {/* Poster */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '145%' }}>

        {/* Fondo del poster */}
        <div style={{
          position: 'absolute', inset: 0,
          background: movie.posterBg,
          display: 'flex', alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '0.5rem',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1rem',
          letterSpacing: '.06em',
          color: 'rgba(255,255,255,0.15)'
        }}>
          {movie.titulo.toUpperCase()}
        </div>

        {/* Overlay degradado */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,.95) 0%, rgba(15,23,42,.2) 60%, transparent 100%)'
        }} />

        {/* Badge tipo */}
        {movie.badge && (
          <span style={{
            position: 'absolute', top: '0.55rem', left: '0.55rem',
            fontSize: '.58rem', fontWeight: 600, letterSpacing: '.1em',
            textTransform: 'uppercase', padding: '.2rem .5rem',
            borderRadius: '6px',
            background: badgeConfig[movie.badge].bg,
            color: badgeConfig[movie.badge].color
          }}>
            {badgeConfig[movie.badge].label}
          </span>
        )}

        {/* Rating */}
        <span style={{
          position: 'absolute', top: '0.55rem', right: '0.55rem',
          display: 'flex', alignItems: 'center', gap: '.2rem',
          fontSize: '.65rem', fontWeight: 600,
          background: 'rgba(15,23,42,0.75)',
          border: '1px solid rgba(245,158,11,0.4)',
          color: 'var(--accent)',
          padding: '.18rem .45rem', borderRadius: '6px',
          backdropFilter: 'blur(4px)'
        }}>
          ⭐ {movie.calificacion}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: '.65rem .7rem .75rem' }}>
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '.98rem', letterSpacing: '.05em',
          color: '#f1f5f9', lineHeight: 1.15, marginBottom: '.25rem'
        }}>
          {movie.titulo}
        </h3>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          flexWrap: 'wrap', fontSize: '.65rem', color: '#94a3b8',
          marginBottom: '.5rem'
        }}>
          <span>{movie.anio}</span>
          <span style={{ color: 'rgba(96,165,250,0.3)' }}>·</span>
          <span>{movie.duracionMin > 0 ? `${movie.duracionMin} min` : '—'}</span>
          <span style={{ color: 'rgba(96,165,250,0.3)' }}>·</span>
          <span>{movie.clasificacion}</span>
        </div>

        <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.6rem' }}>
          {movie.categorias.map(cat => (
            <span key={cat} style={{
              fontSize: '.58rem', fontWeight: 500,
              padding: '.15rem .45rem', borderRadius: '5px',
              background: 'rgba(37,99,235,0.22)',
              border: '1px solid rgba(96,165,250,0.18)',
              color: 'var(--blue-glow)'
            }}>
              {cat}
            </span>
          ))}
        </div>

        <button
          onClick={() => onVerCines(movie.id)}
          style={{
            width: '100%', padding: '.42rem', borderRadius: '9px',
            border: 'none', fontSize: '.75rem', fontWeight: 500,
            fontFamily: "'DM Sans', sans-serif",
            background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
            color: '#fff', cursor: 'pointer',
            boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
            transition: 'all .2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 5px 18px rgba(37,99,235,0.5)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 3px 10px rgba(37,99,235,0.3)'
            e.currentTarget.style.transform = ''
          }}
        >
          Ver Cines
        </button>
      </div>
    </div>
  )
}

export default MovieCard