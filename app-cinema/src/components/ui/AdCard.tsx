// AdCard.tsx
import type { AdItem } from '../../types/Movie.types'

interface Props {
  ad: AdItem
  delay?: number
}

const AdCard = ({ ad, delay = 0 }: Props) => (
  <div
    className="animate-fade-up"
    style={{
      borderRadius: '14px', overflow: 'hidden',
      background: 'rgba(30,64,175,0.15)',
      border: '1px solid rgba(96,165,250,0.14)',
      padding: '.9rem',
      animationDelay: `${delay}s`
    }}
  >
    <div style={{
      width: '100%', height: '80px', borderRadius: '9px',
      background: ad.posterBg,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '1.8rem',
      marginBottom: '.6rem'
    }}>
      {ad.emoji}
    </div>

    <div style={{ fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '.25rem' }}>
      {ad.tag}
    </div>
    <div style={{ fontSize: '.72rem', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.3 }}>
      {ad.titulo}
    </div>
    <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.2rem' }}>
      {ad.subtitulo}
    </div>
    {ad.tipo === 'VIDEO_TEXTO' && (
      <div style={{ fontSize: '.6rem', fontWeight: 500, color: 'var(--accent2)', marginTop: '.3rem' }}>
        ▶ Ver video
      </div>
    )}
  </div>
)

export default AdCard