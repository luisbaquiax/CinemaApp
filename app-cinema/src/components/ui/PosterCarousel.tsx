import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PeliculaPostersResponse } from '../../types/CinemaCore.types'

interface PosterCarouselProps {
  posters: PeliculaPostersResponse[]
  isLoading?: boolean
}

const PosterCarousel = ({ posters, isLoading = false }: PosterCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMultiple = posters.length > 1

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? posters.length - 1 : prev - 1))
    setImageLoaded(false)
  }

  const handleNext = () => {
    setCurrentIndex(prev => (prev === posters.length - 1 ? 0 : prev + 1))
    setImageLoaded(false)
  }

  useEffect(() => {
    if (!containerRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }

    containerRef.current.addEventListener('keydown', handleKeyDown)
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading) {
    return (
      <div
        style={{
          borderRadius: '16px',
          aspectRatio: '2/3',
          background: 'rgba(30,64,175,0.08)',
          border: '1px solid rgba(96,165,250,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
        }}
      >
        ⏳ Cargando posters...
      </div>
    )
  }

  if (!posters.length) {
    return (
      <div
        style={{
          borderRadius: '16px',
          aspectRatio: '2/3',
          background: 'rgba(30,64,175,0.08)',
          border: '1px solid rgba(96,165,250,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94a3b8',
        }}
      >
        No hay posters disponibles.
      </div>
    )
  }

  const currentPoster = posters[currentIndex]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        aspectRatio: '2/3',
        background: 'rgba(15,23,42,0.5)',
        border: '1px solid rgba(96,165,250,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Imagen principal */}
      <img
        src={currentPoster.url}
        alt={`Poster ${currentIndex + 1}`}
        onLoad={() => setImageLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: imageLoaded ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Overlay inferior con info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(15,23,42,0.95), transparent)',
          padding: '1rem',
          color: '#f1f5f9',
          fontSize: '.85rem',
        }}
      >
        {currentPoster.esPrincipal && (
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(96,165,250,0.2)',
              border: '1px solid var(--blue-glow)',
              color: 'var(--blue-glow)',
              padding: '.25rem .5rem',
              borderRadius: '4px',
              fontSize: '.7rem',
              marginBottom: '.5rem',
            }}
          >
            Póster Principal
          </span>
        )}
        <div style={{ marginTop: '.5rem' }}>
          {currentIndex + 1} de {posters.length}
        </div>
      </div>

      {/* Botones de navegación - Solo si hay múltiples posters */}
      {hasMultiple && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(30,64,175,0.7)',
              border: '1px solid rgba(96,165,250,0.3)',
              color: '#f1f5f9',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.background = 'rgba(30,64,175,0.95)'
              btn.style.borderColor = 'var(--blue-glow)'
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.background = 'rgba(30,64,175,0.7)'
              btn.style.borderColor = 'rgba(96,165,250,0.3)'
            }}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(30,64,175,0.7)',
              border: '1px solid rgba(96,165,250,0.3)',
              color: '#f1f5f9',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.background = 'rgba(30,64,175,0.95)'
              btn.style.borderColor = 'var(--blue-glow)'
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget as HTMLButtonElement
              btn.style.background = 'rgba(30,64,175,0.7)'
              btn.style.borderColor = 'rgba(96,165,250,0.3)'
            }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Indicadores de puntos */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              gap: '.5rem',
              zIndex: 10,
            }}
          >
            {posters.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setImageLoaded(false)
                }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: idx === currentIndex ? 'var(--blue-glow)' : 'rgba(96,165,250,0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (idx !== currentIndex) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,165,250,0.5)'
                }}
                onMouseLeave={e => {
                  if (idx !== currentIndex) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(96,165,250,0.3)'
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default PosterCarousel
