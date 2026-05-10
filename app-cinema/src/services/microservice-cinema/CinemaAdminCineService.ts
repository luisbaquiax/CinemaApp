import { cinemaPrivateClient } from "../../lib/httpClient"
import type { CarteraCineResponse, CompaniaResponse, MessageSuccess, TransaccionRequest } from "../../types/CinemaCore.types"

export const cinemaAdminCineService = {
    // Funciones del admin cine
	getMisCompanias: async (idUsuario: number): Promise<CompaniaResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/companias/${idUsuario}`)
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