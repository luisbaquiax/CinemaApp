import { adsPrivateClient } from "../../lib/httpClient";
import type { BloqueoAnuncioRequest, BloqueoAnuncioResponse, CostoBloqueAnuncioDTO, CostoBloqueoAnuncioResponse } from "../../types/Ads.types";

export const adsAdminCineService = {
    // Bloqueo de anuncios
    pagarBloqueAnuncios: async (request: BloqueoAnuncioRequest): Promise<BloqueoAnuncioResponse> => {
        const { data } = await adsPrivateClient.post("/v1/ads/admin-cine/bloqueos", request);
        return data;
    },

    obtenerBloqueoActivoPorCompania: async (idCompania: number, token: string): Promise<BloqueoAnuncioResponse | null> => {
        const { data } = await adsPrivateClient.post(`/v1/ads/admin-cine/bloqueos/${idCompania}`, { token });
        return data ?? null;
    },

    obtenerCostoBloqueoPorCompania: async (payload: CostoBloqueAnuncioDTO): Promise<CostoBloqueoAnuncioResponse | null> => {
        const { data } = await adsPrivateClient.post(`/v1/ads/admin-cine/bloqueos/companias/costos`, payload);
        return data ?? null;
    },

}