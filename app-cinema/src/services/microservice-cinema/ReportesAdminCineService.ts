import { cinemaPrivateClient } from "../../lib/httpClient";
import type {
    ReporteComentariosSala,
    ReportePeliculasSala,
    ReporteSalasMasGustadas,
    ReporteBoletosPorCompania,
} from "../../types/CinemaCoreReports";
import type {
    ReporteSalasMasComentadas,
    ReporteSalasMasPopulares,
    ReporteSalasMasPopularesRequest,
} from "../../types/CinemaCoreAdminReports.types";

interface ReportesParams {
    fechaInicio?: Date | string | null;
    fechaFin?: Date | string | null;
    idSala?: number;
}

const normalizeLocalDateTime = (value?: Date | string | null) => {
    if (value === undefined || value === null || value === "") {
        return undefined;
    }

    if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        const hours = String(value.getHours()).padStart(2, "0");
        const minutes = String(value.getMinutes()).padStart(2, "0");
        const seconds = String(value.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    return value.replace(/\.\d{3}Z$/, "").replace(/Z$/, "");
};

export const reportesAdminCineService = {

    /**
     * Obtiene el reporte de comentarios por sala para una compañía y usuario
     */
    reporteComentariosSala: async (
        idCompania: number,
        idUsuario: number,
        params?: ReportesParams
    ): Promise<ReporteComentariosSala[]> => {
        const { data } = await cinemaPrivateClient.get(
            `/v1/cinema/admin-cine/reportes/comentarios-sala/companias/${idCompania}/usuarios/${idUsuario}`,
            { params }
        );
        return data;
    },

    /**
     * Obtiene el reporte de películas por sala para una compañía y usuario
     */
    reportePeliculasSala: async (
        idCompania: number,
        idUsuario: number,
        params?: ReportesParams
    ): Promise<ReportePeliculasSala[]> => {
        const { data } = await cinemaPrivateClient.get(
            `/v1/cinema/admin-cine/reportes/peliculas-sala/companias/${idCompania}/usuarios/${idUsuario}`,
            { params }
        );
        return data;
    },

    /**
     * Obtiene el reporte de salas más gustadas para una compañía y usuario
     */
    reporteSalasMasGustadas: async (
        idCompania: number,
        idUsuario: number,
        params?: ReportesParams
    ): Promise<ReporteSalasMasGustadas[]> => {
        const { data } = await cinemaPrivateClient.get(
            `/v1/cinema/admin-cine/reportes/salas-mas-gustadas/companias/${idCompania}/usuarios/${idUsuario}`,
            { params }
        );
        return data;
    },

    /**
     * Obtiene el reporte de boletos vendidos para una compañía y usuario
     */
    reporteBoletoVendidos: async (
        idCompania: number,
        idUsuario: number,
        params?: ReportesParams
    ): Promise<ReporteBoletosPorCompania> => {
        const { data } = await cinemaPrivateClient.get(
            `/v1/cinema/admin-cine/reportes/boletos-vendidos/companias/${idCompania}/usuarios/${idUsuario}`,
            { params }
        );
        return data;
    },

    /**
     * Obtiene el reporte de las 5 salas más populares
     */
    reporteSalasMasPopulares: async (
        request: ReporteSalasMasPopularesRequest
    ): Promise<ReporteSalasMasPopulares[]> => {
        const inicio = normalizeLocalDateTime(request.inicio);
        const fin = normalizeLocalDateTime(request.fin);
        const { data } = await cinemaPrivateClient.post(
            "/v1/cinema/admin/reportes/salas-mas-populares",
            {
                ...request,
                ...(inicio ? { inicio } : {}),
                ...(fin ? { fin } : {}),
            }
        );
        return data;
    },

    /**
     * Obtiene el reporte de las 5 salas más comentadas
     */
    reporteSalasMasComentadas: async (
        inicio?: Date | string | null,
        fin?: Date | string | null
    ): Promise<ReporteSalasMasComentadas[]> => {
        const safeInicio = normalizeLocalDateTime(inicio);
        const safeFin = normalizeLocalDateTime(fin);
        const { data } = await cinemaPrivateClient.get(
            "/v1/cinema/admin/reportes/salas-mas-comentadas",
            {
                params: {
                    ...(safeInicio ? { inicio: safeInicio } : {}),
                    ...(safeFin ? { fin: safeFin } : {}),
                },
            }
        );
        return data;
    },
};
