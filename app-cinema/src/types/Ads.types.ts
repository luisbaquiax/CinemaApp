
export interface AnuncioRequest {
  usuarioId: number;
  idPrecioAnuncio: number;
  titulo: string;
  contenidoTexto: string;
  fechaInicio?: string;  // LocalDateTime
  token: string;
}

export interface AnuncioResponse {
  idAnuncio: number;
  usuarioId: number;
  tipo: TipoAnuncioResponse;
  periodo: PeriodoAnuncioResponse;
  titulo: string;
  contenidoTexto: string;
  imagenUrl?: string;
  videoUrl?: string;
  activo: boolean;
  fechaInicio: string;           // LocalDateTime
  fechaFin?: string;            // LocalDateTime
  montoPagado: number;
  createdAt: string;            // LocalDateTime
}

export interface AnuncioUpdateRequest {
  usuarioId: number;
  tipoId: number;
  periodoId: number;
  titulo: string;
  contenidoTexto: string;
  fechaInicio?: string;
  montoPagado: number;
}

// Bloqueos
export interface BloqueoAnuncioRequest {
  companiaId: number;
  dias: number;
  montoPagado: number;
  fechaInicio: string;
  fechaFin?: string;
  token?: string;
}

export interface BloqueoAnuncioResponse {
  idBloqueoAnuncio: number;
  companiaId: number;
  dias: number;
  montoPagado: number;
  fechaInicio: string;
  fechaFin?: string;
  activo?: boolean;
}

// Cartera Anunciante
export interface CarteraAnuncianteRequest {
  usuarioId: number;
  saldo: number;
}

export interface CarteraAnuncianteResponse {
  idCarteraAnunciante: number;
  usuarioId: number;
  saldo: number;
  updatedAt: string;
}

// Costo Bloqueo
export interface CostoBloqueoAnuncioRequest {
  companiaId: number;
  costoDia: number;
  token: string;
}

export interface CostoBloqueoAnuncioResponse {
  idCostoBloqueoAnuncio: number;
  companiaId: number;
  costoDia: number;
  updatedAt: string;
}

export interface CostoBloqueoAnuncioUpdateRequest {
  costoDia: number;
  token: string;
}

// Message
export interface MessageSuccess {
  message: string;
}

// Periodo Anuncio
export interface PeriodoAnuncioRequest {
  nombre: string;
  dias: number;
}

export interface PeriodoAnuncioResponse {
  idPeriodoAnuncio: number;
  nombre: string;
  dias: number;
}

// Precio Anuncio
export interface PrecioAnuncioRequest {
  tipoId: number;
  periodoId: number;
  precio: number;
}

export interface PrecioAnuncioResponse {
  idPrecioAnuncio: number;
  tipo: TipoAnuncioResponse;
  periodo: PeriodoAnuncioResponse;
  precio: number;
  updatedAt: string;
}

// Tipo Anuncio
export interface TipoAnuncioRequest {
  nombre: string;
}

export interface TipoAnuncioResponse {
  idTipoAnuncio: number;
  nombre: string;
}

// Transacciones
export interface TransaccionAnuncianteRequest {
    monto: number;
    esRecarga: boolean;
}

export interface TransaccionAnuncianteResponse {
  idTransaccionAnunciante: number;
  carteraId: number;
  tipo: string;
  monto: number;
  descripcion?: string;
  fechaTransaccion: string;
}