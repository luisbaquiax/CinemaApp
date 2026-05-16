import { cinemaPrivateClient } from '../../lib/httpClient'
import type {
	BoletoRequest,
	BoletoResponse,
	ComentarioPeliculaRequest,
	ComentarioSalaRequest,
	MessageSuccess,
} from '../../types/CinemaCore.types'

export const cinemaUsuarioService = {
	comprarBoleto: async (payload: BoletoRequest): Promise<BoletoResponse> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/common/boletos', payload)
		return data
	},

	getBoletosPorUsuario: async (idUsuario: number): Promise<BoletoResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/common/boletos/${idUsuario}/boletos`)
		return data
	},

	crearComentarioPelicula: async (idPelicula: number, payload: ComentarioPeliculaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/common/peliculas/${idPelicula}/comentarios`, payload)
		return data
	},

	actualizarComentarioPelicula: async (idComentario: number, payload: ComentarioPeliculaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/common/peliculas/comentarios/${idComentario}`, payload)
		return data
	},

	eliminarComentarioPelicula: async (idComentario: number, idUsuario: number): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete(`/v1/cinema/common/peliculas/comentarios/${idComentario}`, {
			params: { idUsuario },
		})
		return data
	},

	crearComentarioSala: async (idSala: number, payload: ComentarioSalaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/common/salas/${idSala}/comentarios`, payload)
		return data
	},

	actualizarComentarioSala: async (idComentario: number, payload: ComentarioSalaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/common/salas/comentarios/${idComentario}`, payload)
		return data
	},

	eliminarComentarioSala: async (idComentario: number, idUsuario: number): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete(`/v1/cinema/common/salas/comentarios/${idComentario}`, {
			params: { idUsuario },
		})
		return data
	},
}