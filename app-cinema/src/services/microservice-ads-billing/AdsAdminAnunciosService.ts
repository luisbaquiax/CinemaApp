import { adsPrivateClient } from "../../lib/httpClient";
import type {
    AnuncioResponse,
    MessageSuccess,
    CostoBloqueoAnuncioRequest,
    PeriodoAnuncioRequest,
    PeriodoAnuncioResponse,
    PrecioAnuncioRequest,
    PrecioAnuncioResponse,
    TipoAnuncioResponse,
    CostoBloqueoAnuncioUpdateRequest,
    CostoBloqueoAnuncioResponse,
} from "../../types/Ads.types";

export const adsAdminService = {
    // Anuncios
    updateAnuncioStatus: async (
        id: number,
        activo: boolean,
    ): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.patch(`/v1/ads/admin/anuncios/${id}/status`,
            null,
            { params: { activo } },
        );
        return data;
    },

    listAnuncios: async (): Promise<AnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get("/v1/ads/admin/anuncios");
        return data;
    },

    activarAnuncio: async (id: number): Promise<MessageSuccess> => {
        return adsAdminService.updateAnuncioStatus(id, true);
    },

    desactivarAnuncio: async (id: number): Promise<MessageSuccess> => {
        return adsAdminService.updateAnuncioStatus(id, false);
    },

    // Costo Bloqueo
    createCostoBloque: async (
        payload: CostoBloqueoAnuncioRequest,
    ): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.post("/v1/ads/admin/costo-bloqueo", payload,);
        return data;
    },

    updateCostoBloque: async (
        id: number,
        payload: CostoBloqueoAnuncioUpdateRequest,
    ): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.put(`/v1/ads/admin/costo-bloqueo/${id}`, payload,);
        return data;
    },

    getCostoBloquePorCompania: async (idCompania: number): Promise<CostoBloqueoAnuncioResponse | null> => {
        const { data } = await adsPrivateClient.get(`/v1/ads/admin/costo-bloqueo/compania/${idCompania}`)
        return data ?? null
    },

    listCostosBloqueo: async (): Promise<CostoBloqueoAnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get("/v1/ads/admin/costo-bloqueo");
        return data;
    },


    // Periodos de Anuncio
    createPeriodo: async (
        payload: PeriodoAnuncioRequest,
    ): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.post("/v1/ads/admin/periodos-anuncio", payload,);
        return data;
    },

    updatePeriodo: async (id: number, payload: PeriodoAnuncioRequest,):
        Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.put(`/v1/ads/admin/periodos-anuncio/${id}`, payload);
        return data;
    },

    listPeriodos: async (): Promise<PeriodoAnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get("/v1/ads/admin/periodos-anuncio");
        return data;
    },

    // Precios de Anuncio
    createPrecio: async (payload: PrecioAnuncioRequest): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.post("/v1/ads/admin/precios-anuncio", payload,);
        return data;
    },

    updatePrecio: async (
        id: number,
        payload: PrecioAnuncioRequest,
    ): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.put(`/v1/ads/admin/precios-anuncio/${id}`, payload,);
        return data;
    },

    listPrecios: async (): Promise<PrecioAnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get("/v1/ads/admin/precios-anuncio");
        return data;
    },

    // Tipos de Anuncio
    listTipos: async (): Promise<TipoAnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get("/v1/ads/admin/tipos");
        return data;
    },
};
