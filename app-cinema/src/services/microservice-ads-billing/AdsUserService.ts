import { adsPublicClient } from '../../lib/httpClient'
import type { AnuncioResponse } from '../../types/Ads.types'

export const adsUserService = {
  anunciosActivos: async (): Promise<AnuncioResponse[]> => {
    const { data } = await adsPublicClient.get('/v1/ads/publicos')
    return data
  },

  anunciosAleatorios: async (cantidad: number): Promise<AnuncioResponse[]> => {
    const { data } = await adsPublicClient.get('/v1/ads/publicos/aleatorios', {
      params: { cantidad },
    })
    return data
  },
}
