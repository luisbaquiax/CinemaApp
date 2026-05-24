export interface BoletoVendidoResponse {
  idBoleto: number;
  idUsuario: number;
  filaAsiento: string;
  columnaAsiento: number;
  monto: number;
  fechaPago: string; // LocalDateTime
}

export interface CalificacionSalaResponse {
  idComentario: number;
  idUsuario: number;
  calificacion: number;
  comentario: string;
  createdAt: string; // LocalDateTime
}

export interface PeliculaProyectadaResponse {
  idPelicula: number;
  titulo: string;
  portadaUrl: string;
  director: string;
  duracionMin: number;
  clasificacion: string;
  fechaHoraInicio: string; // LocalDateTime
  fechaHoraFin: string; // LocalDateTime
  precio: number;
  activo: boolean;
}

// Reportes

export interface ReporteBoletosPorCompania {
  totalDineroGeneral: number;
  totalBoletosGeneral: number;
  salas: ReporteBoletosSala[];
}

export interface ReporteBoletosSala {
  salaId: number;
  nombreSala: string;
  capacidad: number;
  totalBoletos: number;
  totalDinero: number;
  boletos: BoletoVendidoResponse[];
}

export interface ReporteComentariosSala {
  salaId: number;
  nombre: string;
  filas: number;
  columnas: number;
  capacidad: number;
  promedioCalificacion: number;
  comentarios: CalificacionSalaResponse[];
}

export interface ReportePeliculasSala {
  salaId: number;
  nombreSala: string;
  filas: number;
  columnas: number;
  capacidad: number;
  peliculas: PeliculaProyectadaResponse[];
}

export interface ReporteSalasMasGustadas {
  salaId: number;
  nombreSala: string;
  filas: number;
  columnas: number;
  capacidad: number;
  promedioCalificacion: number;
  totalCalificaciones: number;
  calificaciones: CalificacionSalaResponse[];
}