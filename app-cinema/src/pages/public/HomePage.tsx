import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/layouts/Navbar'
import NowPlayingTicker from '../../components/ui/NowPlayingTicker'
import SearchBar from '../../components/ui/SearchBar'
import CategoryPills from '../../components/ui/CategoryPills'
import MovieCard from '../../components/ui/MovieCard'
import AdCard from '../../components/ui/AdCard'
import type { Movie, AdItem } from '../../types/Movie.types'

const CATEGORIAS = ['Todas', 'Acción', 'Drama', 'Comedia', 'Anime', 'Terror', 'Familiar', 'Ciencia Ficción', 'Thriller']

const MOVIES: Movie[] = [
    { id: 1, titulo: 'Sinners', anio: 2025, duracionMin: 137, clasificacion: 'C', calificacion: 8.4, categorias: ['Acción', 'Drama'], badge: 'estreno', posterBg: 'linear-gradient(160deg,#1e3a5f,#0c1f3a 50%,#1a2f1a)' },
    { id: 2, titulo: 'Minecraft: La Película', anio: 2025, duracionMin: 101, clasificacion: 'A', calificacion: 7.1, categorias: ['Aventura', 'Familiar'], badge: 'popular', posterBg: 'linear-gradient(160deg,#3b1c6e,#0f172a 50%,#1c1c0f)' },
    { id: 3, titulo: 'The Alto Knights', anio: 2025, duracionMin: 117, clasificacion: 'B15', calificacion: 6.8, categorias: ['Drama', 'Crimen'], posterBg: 'linear-gradient(160deg,#5c1a1a,#0f172a 60%,#1a1a2e)' },
    { id: 4, titulo: 'A Working Man', anio: 2025, duracionMin: 116, clasificacion: 'C', calificacion: 6.5, categorias: ['Thriller', 'Acción'], badge: 'nuevo', posterBg: 'linear-gradient(160deg,#1a4a2e,#0f172a 55%,#2e1a0f)' },
    { id: 5, titulo: 'Paddington en Perú', anio: 2024, duracionMin: 106, clasificacion: 'A', calificacion: 7.9, categorias: ['Familiar', 'Comedia'], badge: 'popular', posterBg: 'linear-gradient(160deg,#2e1a0f,#0f172a 50%,#1a2e4a)' },
    { id: 6, titulo: 'Demon Slayer: Castillo Infinito', anio: 2025, duracionMin: 0, clasificacion: 'B15', calificacion: 9.1, categorias: ['Anime', 'Acción'], badge: 'estreno', posterBg: 'linear-gradient(160deg,#0f2a4a,#1a0f2e 50%,#2a1a0f)' },
    { id: 7, titulo: 'Novocaine', anio: 2025, duracionMin: 110, clasificacion: 'C', calificacion: 7.2, categorias: ['Acción', 'Comedia'], posterBg: 'linear-gradient(160deg,#1a1a4a,#0f172a 50%,#2e0f1a)' },
    { id: 8, titulo: 'Black Bag', anio: 2025, duracionMin: 93, clasificacion: 'B15', calificacion: 7.0, categorias: ['Thriller', 'Espionaje'], badge: 'nuevo', posterBg: 'linear-gradient(160deg,#0f3a2a,#0f172a 50%,#3a2a0f)' },
]

const ADS_LEFT: AdItem[] = [
    { id: 1, tipo: 'TEXTO_IMAGEN', titulo: 'Banco Industrial — Tu crédito listo', subtitulo: 'Tasas desde 8% anual', emoji: '🏦', posterBg: 'linear-gradient(135deg,#1d4ed8,#0f172a)', tag: '📢 Anuncio' },
    { id: 2, tipo: 'TEXTO_IMAGEN', titulo: "Domino's — 2x1 en pizzas grandes", subtitulo: 'Solo hoy en tu pedido online', emoji: '🍕', posterBg: 'linear-gradient(135deg,#b45309,#0f172a)', tag: '🍔 Promoción' },
    { id: 3, tipo: 'VIDEO_TEXTO', titulo: 'PS5 Pro — Ya disponible', subtitulo: 'Llévalo a cuotas sin interés', emoji: '🎮', posterBg: 'linear-gradient(135deg,#065f46,#0f172a)', tag: '🎮 Gaming' },
]

const ADS_RIGHT: AdItem[] = [
    { id: 4, tipo: 'TEXTO_IMAGEN', titulo: 'Mango — Nueva colección otoño', subtitulo: '30% off esta semana', emoji: '🛍️', posterBg: 'linear-gradient(135deg,#6d28d9,#0f172a)', tag: '🛍️ Oferta' },
    { id: 5, tipo: 'VIDEO_TEXTO', titulo: 'Toyota RAV4 2026 — Llega a GT', subtitulo: 'Cotiza sin compromisos', emoji: '🚗', posterBg: 'linear-gradient(135deg,#be123c,#0f172a)', tag: '🚘 Autos' },
    { id: 6, tipo: 'TEXTO_IMAGEN', titulo: 'Samsung Galaxy S25 Ultra', subtitulo: 'Cámara de 200MP · Nuevo', emoji: '📱', posterBg: 'linear-gradient(135deg,#0e7490,#0f172a)', tag: '📱 Tech' },
]

// Componente principal
const HomePage = () => {
    const [categoriaActiva, setCategoriaActiva] = useState('Todas')
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    const peliculasFiltradas = MOVIES.filter(m => {
        const matchCat = categoriaActiva === 'Todas' || m.categorias.includes(categoriaActiva)
        const matchSearch = m.titulo.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCat && matchSearch
    })

    const handleVerCines = (movieId: number) => {
        // TODO: navegar a detalle de cines cuando MS2 esté listo
        navigate(`/peliculas/${movieId}/cines`)
    }

    return (
        <div className="min-h-screen relative">

            <Navbar />
            <NowPlayingTicker />

            {/* Hero */}
            <div className="relative z-10 text-center px-8 pt-14 pb-4">
                <span className="inline-block text-xs font-medium tracking-widest uppercase px-4 py-1 rounded-full mb-4 animate-fade-up"
                    style={{ color: 'var(--accent)', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
                    🍿 Cartelera Guatemala 2026
                </span>
                <h1 className="animate-fade-up"
                    style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(2.6rem,6vw,4.5rem)',
                        letterSpacing: '.06em',
                        lineHeight: 1,
                        background: 'linear-gradient(135deg, #f1f5f9 30%, var(--blue-glow) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animationDelay: '.1s'
                    }}>
                    Tu próxima película<br />favorita te espera
                </h1>
                <p className="mt-3 mx-auto max-w-md text-sm font-light animate-fade-up"
                    style={{ color: '#94a3b8', animationDelay: '.2s' }}>
                    Compra boletos en línea, elige tu sala y disfruta la mejor experiencia de cine.
                </p>
            </div>

            <SearchBar onSearch={setSearchQuery} />
            <CategoryPills categorias={CATEGORIAS} activa={categoriaActiva} onSelect={setCategoriaActiva} />

            {/* 3 columnas */}
            <div className="relative z-10 grid gap-5 px-5 py-6 mx-auto"
                style={{
                    position: 'relative',
                    zIndex: 10,
                    display: 'grid',
                    gridTemplateColumns: '180px 1fr 180px',
                    gap: '1.25rem',
                    padding: '1.5rem',
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>

                {/* Anuncios izquierda */}
                <aside className="flex flex-col gap-3">
                    {ADS_LEFT.map((ad, i) => <AdCard key={ad.id} ad={ad} delay={i * 0.1} />)}
                </aside>

                {/* Películas */}
                <main>
                    <div className="flex items-baseline justify-between mb-4">
                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', letterSpacing: '.08em' }}>
                            Películas en Cartelera
                        </span>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>
                            {peliculasFiltradas.length} película{peliculasFiltradas.length !== 1 ? 's' : ''} disponible{peliculasFiltradas.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {peliculasFiltradas.length === 0 ? (
                        <div className="text-center py-20" style={{ color: '#94a3b8' }}>
                            <div className="text-4xl mb-3">🎬</div>
                            <p className="text-sm">No se encontraron películas para "<strong>{searchQuery || categoriaActiva}</strong>"</p>
                        </div>
                    ) : (
                        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
                            {peliculasFiltradas.map((movie, i) => (
                                <MovieCard key={movie.id} movie={movie} delay={i * 0.05} onVerCines={handleVerCines} />
                            ))}
                        </div>
                    )}
                </main>

                {/* Anuncios derecha */}
                <aside className="flex flex-col gap-3">
                    {ADS_RIGHT.map((ad, i) => <AdCard key={ad.id} ad={ad} delay={i * 0.1} />)}
                </aside>
            </div>
        </div>
    )
}

export default HomePage