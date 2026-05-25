import { cinemaPrivateClient } from "../../lib/httpClient"
import type {
	CarteraCineResponse,
	CompaniaResponse,
	FuncionRequest,
	FuncionResponse,
	FuncionUpdateRequest,
	MessageSuccess,
	SalaRequest,
	SalaResponse,
	TransaccionRequest,
} from "../../types/CinemaCore.types"

export const cinemaAdminCineService = {
    // Funciones del admin cine
	getMisCompanias: async (idUsuario: number): Promise<CompaniaResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/companias/${idUsuario}`)
		return data
	},

	// Salas admin cine
	createSala: async (request: SalaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin-cine/salas', request)
		return data
	},

	updateSala: async (idSala: number, request: SalaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin-cine/salas/${idSala}`, request)
		return data
	},

	toggleSalaVisibilidad: async (idSala: number, activar: boolean): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.patch(`/v1/cinema/admin-cine/salas/${idSala}/visibilidad`, null, {
			params: { activar },
		})
		return data
	},

	toggleSalaComentarios: async (idSala: number, permitir: boolean): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.patch(`/v1/cinema/admin-cine/salas/${idSala}/comentarios`, null, {
			params: { permitir },
		})
		return data
	},

	getSalasByCompania: async (idCompania: number): Promise<SalaResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/salas/companias/${idCompania}`)
		return data
	},

	// Funciones admin cine
	createFuncion: async (request: FuncionRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin-cine/funciones', request)
		return data
	},

	updateFuncion: async (idFuncion: number, request: FuncionUpdateRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin-cine/funciones/${idFuncion}`, request)
		return data
	},

	toggleFuncionVisibilidad: async (idFuncion: number, activar: boolean): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.patch(`/v1/cinema/admin-cine/funciones/${idFuncion}/visibilidad`, null, {
			params: { activar },
		})
		return data
	},

	getFuncionesBySala: async (idSala: number): Promise<FuncionResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/funciones/salas/${idSala}`)
		return data
	},

	// Wallet admin cine
	addRemoveFunds: async (idCompania: number, transaccionRequest: TransaccionRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin-cine/wallet/${idCompania}/transacciones`, transaccionRequest)
		return data
	},

	getCarteraByCompania: async (idCompania: number): Promise<CarteraCineResponse> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/wallet/${idCompania}`)
		return data
	},
}