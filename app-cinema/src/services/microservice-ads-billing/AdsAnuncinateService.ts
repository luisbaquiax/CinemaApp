import { adsPrivateClient } from "../../lib/httpClient";
import type {
    AnuncioRequest,
    AnuncioResponse,
    MessageSuccess,
    TransaccionAnuncianteResponse,
    TransaccionAnuncianteRequest,
    FileAdsRequest,
} from "../../types/Ads.types";

export const adsAnuncianteService = {

    // Anuncios
    comprarAnuncio: async (request: AnuncioRequest): Promise<AnuncioResponse> => {
        const { data } = await adsPrivateClient.post('/v1/ads/anunciante/anuncios', request);
        return data;
    },

    misAnuncios: async (idAnunciante: number): Promise<AnuncioResponse[]> => {
        const { data } = await adsPrivateClient.get(`/v1/ads/anunciante/anuncios/${idAnunciante}`);
        return data;
    },

    updateStatusAnuncio: async (id: number, activo: boolean): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.patch(`/v1/ads/anunciante/anuncios/${id}/status`, null, {
            params: { activo },
        });
        return data;
    },

    subirArchivoAnuncio: async (request: FileAdsRequest): Promise<MessageSuccess> => {
        const anuncioId = request.idAnuncio ?? request.id;
        if (!anuncioId) {
            throw new Error('idAnuncio es requerido para subir archivo del anuncio.');
        }
        const formData = new FormData();
        formData.append('id', String(anuncioId));
        formData.append('file', request.file);

        const { data } = await adsPrivateClient.post(`/v1/ads/anunciante/anuncios/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    subirAarchivoAnuncio: async (request: FileAdsRequest): Promise<MessageSuccess> => {
        return adsAnuncianteService.subirArchivoAnuncio(request);
    },

    actualizarArchivoAnuncio: async (request: FileAdsRequest): Promise<MessageSuccess> => {
        const anuncioId = request.idAnuncio ?? request.id;
        if (!anuncioId) {
            throw new Error('idAnuncio es requerido para actualizar archivo del anuncio.');
        }
        const formData = new FormData();
        formData.append('id', String(anuncioId));
        formData.append('file', request.file);

        const { data } = await adsPrivateClient.patch(`/v1/ads/anunciante/anuncios/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    eliminarArchivoAnuncio: async (idAnuncio: number): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.delete(`/v1/ads/anunciante/anuncios/files/${idAnuncio}`);
        return data;
    },

    // Transacciones Anunciante
    relizarTransaccion: async (idAnunciante: number, request: TransaccionAnuncianteRequest): Promise<MessageSuccess> => {
        const { data } = await adsPrivateClient.post(`/v1/ads/anunciante/wallet/${idAnunciante}/funds`, request);
        return data;
    },

    realizarTransaccion: async (idAnunciante: number, request: TransaccionAnuncianteRequest): Promise<MessageSuccess> => {
        return adsAnuncianteService.relizarTransaccion(idAnunciante, request);
    },

    obtenerTransacciones: async (idAnunciante: number): Promise<TransaccionAnuncianteResponse[]> => {
        const { data } = await adsPrivateClient.get(`/v1/ads/anunciante/wallet/${idAnunciante}/transactions`);
        return data;
    },

    obtenerSaldo: async (idAnunciante: number): Promise<number> => {
        const { data } = await adsPrivateClient.get(`/v1/ads/anunciante/wallet/${idAnunciante}/funds`);
        return data;
    }

}
