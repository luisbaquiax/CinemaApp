export interface Movie {
  id: number
  titulo: string
  anio: number
  duracionMin: number
  clasificacion: string
  calificacion: number
  categorias: string[]
  badge?: 'estreno' | 'popular' | 'nuevo'
  posterBg: string
}

export interface AdItem {
  id: number
  tipo: 'TEXTO' | 'TEXTO_IMAGEN' | 'VIDEO_TEXTO'
  titulo: string
  subtitulo: string
  emoji: string
  posterBg: string
  tag: string
}