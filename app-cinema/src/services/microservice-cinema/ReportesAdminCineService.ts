import { cinemaPrivateClient } from "../../lib/httpClient";
import type {
    ReporteComentariosSala,
    ReportePeliculasSala,
    ReporteSalasMasGustadas,
    ReporteBoletosPorCompania,
} from "../../types/CinemaCoreReports";

interface ReportesParams {
    fechaInicio?: Date | string;
    fechaFin?: Date | string;
    idSala?: number;
}

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
};
