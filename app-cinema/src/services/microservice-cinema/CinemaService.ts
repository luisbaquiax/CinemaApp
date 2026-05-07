import { cinemaPrivateClient, cinemaPublicClient } from '../../lib/httpClient'
import type {
	AddCategoriaPeliculaDTO,
	CategoriaRequest,
	CategoriaResponse,
	ClasificacionResponse,
	CarteraCineResponse,
	CompaniaAdminResponse,
	CompaniaCostoUpdateRequest,
	CompaniaRequest,
	CompaniaResponse,
	CompaniaUpdateRequest,
	CostoGlobalRequest,
	CostoGlobalResponse,
	MessageSuccess,
	PelicualUpdateRequest,
	PeliculaActoresResponse,
	PeliculaCastRequest,
	PeliculaRequest,
	PeliculaResponse,
	TransaccionRequest,
	CompaniaAdminRequest,
	PeliculaPostersRequest,
} from '../../types/CinemaCore.types'

export const cinemaService = {
	// Público
	getCategorias: async (): Promise<CategoriaResponse[]> => {
		const { data } = await cinemaPublicClient.get('/v1/cinema/categorias')
		return data
	},

	getClasificaciones: async (): Promise<ClasificacionResponse[]> => {
		const { data } = await cinemaPublicClient.get('/v1/cinema/clasificaciones')
		return data
	},

	getCompaniasActivas: async (): Promise<CompaniaResponse[]> => {
		const { data } = await cinemaPublicClient.get('/v1/cinema/companias')
		return data
	},

	getPeliculasActivas: async (): Promise<PeliculaResponse[]> => {
		const { data } = await cinemaPublicClient.get('/v1/cinema/peliculas')
		return data
	},

	getPeliculaById: async (idPelicula: number): Promise<PeliculaActoresResponse> => {
		const { data } = await cinemaPublicClient.get(`/v1/cinema/peliculas/${idPelicula}`)
		return data
	},

	getPostersByPelicula: async (idPelicula: number): Promise<string[]> => {
		const { data } = await cinemaPublicClient.get(`/v1/cinema/peliculas/posters/${idPelicula}`)
		return data
	},

	//ADMIN SISTEMA
	// Categorías admin
	createCategoria: async (payload: CategoriaRequest): Promise<CategoriaResponse> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin/categorias', payload)
		return data
	},

	updateCategoria: async (idCategoria: number, payload: CategoriaRequest): Promise<CategoriaResponse> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin/categorias/${idCategoria}`, payload)
		return data
	},

	deleteCategoria: async (idCategoria: number): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete(`/v1/cinema/admin/categorias/${idCategoria}`)
		return data
	},

	// Compañías admin
	createCompania: async (payload: CompaniaRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin/companias', payload)
		return data
	},

	agregarAdminACompania: async (payload: CompaniaAdminRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin/companias/admins`, payload)
		return data
	},

	quitarAdminDeCompania: async (payload: CompaniaAdminRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete(`/v1/cinema/admin/companias/admins`, { data: payload })
		return data
	},

	updateCompania: async (idCompania: number, payload: CompaniaUpdateRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin/companias/${idCompania}`, payload)
		return data
	},

	toggleCompaniaEstado: async (idCompania: number, activar: boolean): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.patch(`/v1/cinema/admin/companias/${idCompania}/estado`, null, {
			params: { activar },
		})
		return data
	},

	updateCostoCompania: async (idCompania: number, payload: CompaniaCostoUpdateRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin/companias/${idCompania}/costo`, payload)
		return data
	},

	getAllCompanias: async (): Promise<CompaniaResponse[]> => {
		const { data } = await cinemaPrivateClient.get('/v1/cinema/admin/companias')
		return data
	},

	getAdminsByCompania: async (idCompania: number): Promise<CompaniaAdminResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin/companias/${idCompania}/admins`)
		return data
	},

	// Costos globales
	createCostoGlobal: async (payload: CostoGlobalRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin/costo-global', payload)
		return data
	},

	updateCostoGlobal: async (id: number, payload: CostoGlobalRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin/costo-global/${id}`, payload)
		return data
	},

	getCostoGlobal: async (): Promise<CostoGlobalResponse> => {
		const { data } = await cinemaPrivateClient.get('/v1/cinema/admin/costo-global')
		return data
	},

	// Películas admin
	getAllPeliculas: async (): Promise<PeliculaResponse[]> => {
		const { data } = await cinemaPrivateClient.get('/v1/cinema/admin/peliculas')
		return data
	},

	getPeliculasByEstado: async (estado: boolean): Promise<PeliculaResponse[]> => {
		const { data } = await cinemaPrivateClient.get('/v1/cinema/admin/peliculas/estados', {
			params: { estado },
		})
		return data
	},

	createPelicula: async (payload: PeliculaRequest): Promise<PeliculaResponse> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin/peliculas', payload)
		return data
	},

	updatePelicula: async (idPelicula: number, payload: PelicualUpdateRequest): Promise<PeliculaResponse> => {
		const { data } = await cinemaPrivateClient.put(`/v1/cinema/admin/peliculas/${idPelicula}`, payload)
		return data
	},

	togglePeliculaEstado: async (idPelicula: number, estado: boolean): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.patch(`/v1/cinema/admin/peliculas/${idPelicula}/estado`, null, {
			params: { estado },
		})
		return data
	},

	addCategoriaToPelicula: async (payload: AddCategoriaPeliculaDTO): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post('/v1/cinema/admin/peliculas/categorias', payload)
		return data
	},

	removeCategoriaFromPelicula: async (idPelicula: number, idCategoria: number): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete('/v1/cinema/admin/peliculas/categorias', {
			params: { idPelicula, idCategoria },
		})
		return data
	},

	addActoresToPelicula: async (idPelicula: number, payload: PeliculaCastRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin/peliculas/actores/${idPelicula}`, payload)
		return data
	},

	removeActorFromPelicula: async (idPelicula: number, idActor: number): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.delete(`/v1/cinema/admin/peliculas/actores/${idPelicula}`, {
			params: { idActor },
		})
		return data
	},

	agregarPosterPelicula: async (poster:PeliculaPostersRequest): Promise<MessageSuccess> => {
		const formData = new FormData()
		formData.append('archivo', poster.archivo)
		formData.append('idPelicula', String(poster.idPelicula))
		formData.append('esPrincipal', String(poster.esPrincipal))

		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin/peliculas/posters`, formData)
		return data
	},

	// Funciones del admin cine
	getMisCompanias: async (idUsuario: number): Promise<CompaniaResponse[]> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/companias/${idUsuario}`)
		return data
	},

	// Wallet admin cine
	addRemoveFunds: async (idCompania: number, payload: TransaccionRequest): Promise<MessageSuccess> => {
		const { data } = await cinemaPrivateClient.post(`/v1/cinema/admin-cine/wallet/${idCompania}/transacciones`, payload)
		return data
	},

	getCarteraByCompania: async (idCompania: number): Promise<CarteraCineResponse> => {
		const { data } = await cinemaPrivateClient.get(`/v1/cinema/admin-cine/wallet/${idCompania}`)
		return data
	},
}
