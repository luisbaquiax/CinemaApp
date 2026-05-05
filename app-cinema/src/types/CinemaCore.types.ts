export interface ActorResponse {
  actor: string;
  personaje: string;
}

export interface AddCategoriaPeliculaDTO {
  idPelicula: number;
  idCategoria: number;
}

// Asientos
export interface AsientoRequest {
  idSala: number;
  fila: string;
  columna: number;
}

export interface AsientoResponse {
  idAsiento: number;
  idSala: number;
  fila: string;
  columna: number;
}

// Categorías
export interface CategoriaRequest {
  nombre: string;
}

export interface CategoriaResponse {
  idCategoria: number;
  nombre: string;
}

// Cartera (nested)
export interface CarteraCineRequest {
  idCompania: number;
  saldo: number;
}

export interface CarteraCineResponse {
  idCarteraCine: number;
  idCompania: number;
  saldo: number;
  updatedAt: string;
  transacciones: TransaccionCarteraResponse[];
}

// Clasificación
export interface ClasificacionRequest {
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface ClasificacionResponse {
  idClasificacion: number;
  codigo: string;
  nombre: string;
  descripcion: string;
}

// Comentarios
export interface ComentarioPeliculaRequest {
  idPelicula: number;
  idUsuario: number;
  comentario: string;
  calificacion: number;
}

export interface ComentarioPeliculaResponse {
  idComentarioPelicula: number;
  idPelicula: number;
  idUsuario: number;
  comentario: string;
  calificacion: number;
  createdAt: string;
}

export interface ComentarioSalaRequest {
  idSala: number;
  idUsuario: number;
  comentario: string;
  calificacion: number;
}

export interface ComentarioSalaResponse {
  idComentarioSala: number;
  idSala: number;
  idUsuario: number;
  comentario: string;
  calificacion: number;
  createdAt: string;
}

// Compañías
export interface CompaniaAdminRequest {
  idCompania: number;
  idUsuario: number;
}

export interface CompaniaAdminResponse {
  idCompaniaAdmin: number;
  idCompania: number;
  idUsuario: number;
  fechaAsignacion: string;
}

export interface CompaniaRequest {
  nombreCompania: string;
  descripcionCompania?: string;
  createdAt?: string;
  idUsuarioAdmin?: number;
}

export interface CompaniaResponse {
  idCompania: number;
  nombreCompania: string;
  descripcionCompania: string;
  logoUrl?: string;
  activo: boolean;
  createdAt: string;
}

export interface CompaniaUpdateRequest {
  nombreCompania?: string;
  descripcionCompania?: string;
}


export interface CompaniaCostoUpdateRequest {
  idCompania: number;
  nuevoCosto: number;
  fechaCambio: string;
}

// Costos
export interface CostoCineRequest {
  idCompania: number;
  costoDia: number;
  desde?: string;
  hasta?: string;
  activo?: boolean;
}

export interface CostoCineResponse {
  idCostoCine: number;
  idCompania: number;
  costoDia: number;
  desde: string;
  hasta: string;
  activo: boolean;
}

export interface CostoGlobalRequest {
  costoDia: number;
}

export interface CostoGlobalResponse {
  idCostoGlobal: number;
  costoDia: number;
  createdAt: string;
  updatedAt: string;
}

// Funciones
export interface FuncionRequest {
  idSala: number;
  idPelicula: number;
  fechaHora: string;
  precio: number;
  activo?: boolean;
}

export interface FuncionResponse {
  id: number;
  idSala: number;
  idPelicula: number;
  fechaHora: string;
  precio: number;
  activo: boolean;
}

// Películas
export interface PeliculaRequest {
  titulo: string;
  portadaUrl?: string;
  sinopsis?: string;
  duracionMin: number;
  director?: string;
  fechaEstreno?: string;
  idClasificacion: number;
  activo: boolean;
  categorias: number[];
}

export interface PelicualUpdateRequest {
  titulo: string;
  portadaUrl?: string;
  sinopsis?: string;
  duracionMin: number;
  director?: string;
  fechaEstreno?: string;
  idClasificacion: number;
  activo: boolean;
}

export interface PeliculaResponse {
  idPelicula: number;
  titulo: string;
  portadaUrl?: string;
  sinopsis?: string;
  duracionMin: number;
  director?: string;
  fechaEstreno?: string;
  activo: boolean;
  createdAt?: string;
  calificacionPromedio?: number;
  clasificacion: ClasificacionResponse;
  categorias: CategoriaResponse[];
}

export interface PeliculaActoresResponse {
  pelicula: PeliculaResponse;
  actores: ActorResponse[];
}

export interface PeliculaCastRequest {
  actor: string;
  personaje: string;
}

export interface PeliculaCastResponse {
  idPeliculaCast: number;
  actor: string;
  personaje: string;
}

export interface PeliculaComentariosDTO {
  pelicula: PeliculaResponse;
  comentario: ComentarioPeliculaResponse;
}

// Posters
export interface PeliculaPostersRequest {
  idPelicula: number;
  esPrincipal: boolean;
  archivo: File;
}

export interface PeliculaPosterUpdateRequest {
  idPelicula?: number;
  esPrincipal?: boolean;
  file?: File;
}

export interface PeliculaPosterResponse {
  idPoster: number;
  urlPoster: string;
  esPrincipal: boolean;
}

export interface PeliculaPostersResponse {
  idPoster: number;
  idPelicula: number;
  url: string;
  esPrincipal: boolean;
}

// Salas
export interface SalaRequest {
  idCompania: number;
  nombre: string;
  filas: number;
  columnas: number;
  aceptaComentarios?: boolean;
  visible?: boolean;
}

export interface SalaResponse {
  salaId: number;
  idCompania: number;
  nombre: string;
  filas: number;
  columnas: number;
  aceptaComentarios: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transacciones
export interface TransaccionCarteraRequest {
  idCarteraCine: number;
  tipo: string;
  monto: number;
  descripcion?: string;
}

export interface TransaccionCarteraResponse {
  idTransaccion: number;
  tipo: string;
  monto: number;
  descripcion?: string;
  fechaTransaccion: string;
}

export interface TransaccionRequest {
  monto: number;
  agregarFondos: boolean;
}

export interface MessageSuccess {
  message: string;
}
