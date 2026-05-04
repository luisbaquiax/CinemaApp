const items = [
    { titulo: 'Sinners', genero: 'Acción', horarios: '18:30, 21:00' },
    { titulo: 'Minecraft: La Película', genero: 'Aventura', horarios: '15:00, 17:30, 20:00' },
    { titulo: 'The Alto Knights', genero: 'Drama', horarios: '19:00, 21:30' },
    { titulo: 'A Working Man', genero: 'Thriller', horarios: '16:00, 18:30' },
    { titulo: 'Paddington en Perú', genero: 'Familiar', horarios: '14:00, 16:30' },
]

const NowPlayingTicker = () => {
    // duplicar para loop infinito
    const doubled = [...items, ...items]

    return (
        <div className="flex items-center gap-3 overflow-hidden px-6 py-2"
            style={{
                background: 'rgba(30,64,175,0.12)',
                borderTop: '1px solid rgba(96,165,250,0.08)',
                borderBottom: '1px solid rgba(96,165,250,0.08)',
            }}>

            <span className="text-xs font-medium tracking-widest uppercase whitespace-nowrap pr-3"
                style={{
                    color: 'var(--accent)',
                    borderRight: '1px solid rgba(245,158,11,0.3)'
                }}>
                🎞 En cartelera
            </span>

            <div className="flex gap-6 whitespace-nowrap animate-scroll-left">
                {doubled.map((item, i) => (
                    <span key={i} className="text-xs" style={{ color: '#94a3b8' }}>
                        <strong style={{ color: 'var(--blue-glow)' }}>{item.titulo}</strong>
                        {' '}— {item.genero} · {item.horarios}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default NowPlayingTicker