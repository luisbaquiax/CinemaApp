import type { ComentarioSalaResponse } from './CinemaCore.types'

export interface UsuarioBoletoResponse {
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  boletosComprados: number;
  totalGastado: number;
}

export interface UserEmailResponse {
  id: number;
  username: string;
  email: string;
  nombres: string;
  apellidos: string;
}

export interface ReporteSalasMasPopularesRequest {
  inicio?: string;
  fin?: string;
  token: string;
}

export interface ReporteSalasMasPopulares {
  salaId: number;
  nombreSala: string;
  nombreCompania: string;
  promedioCalificacion: number;
  totalCalificaciones: number;
  totalBoletosVendidos: number;
  usuarios: UsuarioBoletoResponse[];
}

export interface ReporteSalasMasComentadas {
  salaId: number;
  nombreSala: string;
  nombreCompania: string;
  totalComentarios: number;
  promedioCalificacion: number;
  comentarios: ComentarioSalaResponse[];
}
