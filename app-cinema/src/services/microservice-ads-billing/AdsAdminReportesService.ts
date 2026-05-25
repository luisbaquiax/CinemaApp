import { adsPrivateClient } from "../../lib/httpClient";
import type {
  ReporteAnunciosComprados,
  ReporteGananciaAnuncianteRequest,
  ReporteGananciasAnunciante,
} from "../../types/Ads.types";

const normalizeLocalDateTime = (value?: string) => {
  if (!value) return value;
  try {
    return value.replace(/\.\d{3}Z$/, "").replace(/Z$/, "").replace(/\.\d{3}$/, "");
  } catch (e) {
    return value;
  }
};

export const adsAdminReportesService = {
  getReporteAnunciosComprados: async (params: {
    inicio?: string;
    fin?: string;
    idTipo?: number;
    idPeriodo?: number;
  }): Promise<ReporteAnunciosComprados> => {
    const safeParams = {
      ...params,
      inicio: normalizeLocalDateTime(params.inicio),
      fin: normalizeLocalDateTime(params.fin),
    };

    const { data } = await adsPrivateClient.get(
      "/v1/ads/admin/reportes/anuncios-comprados",
      { params: safeParams }
    );
    return data;
  },

  getReporteGananciasPorAnunciante: async (
    request: ReporteGananciaAnuncianteRequest,
  ): Promise<ReporteGananciasAnunciante[]> => {
    const safeRequest = {
      ...request,
      inicio: normalizeLocalDateTime(request.inicio),
      fin: normalizeLocalDateTime(request.fin),
    } as ReporteGananciaAnuncianteRequest;

    const { data } = await adsPrivateClient.post(
      "/v1/ads/admin/reportes/ganancias-por-anunciante",
      safeRequest,
    );
    return data;
  },
};

export default adsAdminReportesService;
