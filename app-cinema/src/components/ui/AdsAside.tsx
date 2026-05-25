import { useQuery } from '@tanstack/react-query'
import { adsUserService } from '../../services/microservice-ads-billing/AdsUserService'
import AdCard from './AdCard'
import type { AnuncioResponse } from '../../types/Ads.types'

interface AdsAsideProps {
  position: 'left' | 'right'
}

const AdsAside = ({ position }: AdsAsideProps) => {
  const { data: anuncios, isLoading, isError } = useQuery<AnuncioResponse[]>({
    queryKey: ['anuncios-activos', position],
    queryFn: adsUserService.anunciosActivos,
  })

  if (isLoading) {
    return (
      <aside className="flex flex-col gap-3">
        <div className="text-slate-400 text-center py-4">Cargando anuncios...</div>
      </aside>
    )
  }

  if (isError || !anuncios) {
    return (
      <aside className="flex flex-col gap-3">
        <div className="text-red-400 text-center py-4">No se pudieron cargar los anuncios.</div>
      </aside>
    )
  }

  return (
    <aside className="flex flex-col gap-3">
      {anuncios.map((ad, index) => (
        <AdCard key={ad.idAnuncio} ad={ad} delay={index * 0.2} />
      ))}
    </aside>
  )
}

export default AdsAside
