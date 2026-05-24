import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { getStoredSelectedCompaniaId } from "../../../utils/adminCineSelection";
import { reportesAdminCineService } from "../../../services/microservice-cinema/ReportesAdminCineService";
import { cinemaService } from "../../../services/microservice-cinema/CinemaService";
import type { ReporteComentariosSala } from "../../../types/CinemaCoreReports";
import type { SalaResponse } from "../../../types/CinemaCore.types";

const ReporteComentariosSalaPage: React.FC = () => {
  const { auth } = useAuth();
  const idCompania = getStoredSelectedCompaniaId();
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("all");

  const { data: salasRaw } = useQuery({
    queryKey: ["reportes-salas-list", idCompania],
    queryFn: () => cinemaService.getSalasByCompania(idCompania || 0),
    enabled: !!idCompania,
  });

  const salas: SalaResponse[] = Array.isArray(salasRaw) ? salasRaw : [];

  const { data: reporteData, isLoading } = useQuery({
    queryKey: [
      "reporte-comentarios-sala",
      fechaInicio,
      fechaFin,
      salaId,
      idCompania,
    ],
    queryFn: () =>
      reportesAdminCineService.reporteComentariosSala(
        idCompania || 0,
        auth?.idUsuario || 0,
        {
          fechaInicio: fechaInicio
            ? new Date(fechaInicio).toISOString()
            : undefined,
          fechaFin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
          idSala: salaId !== "all" ? Number(salaId) : undefined,
        },
      ),
    enabled: !!idCompania && !!auth?.idUsuario,
  });

  const reporte: ReporteComentariosSala[] = Array.isArray(reporteData)
    ? reporteData
    : [];

  const totalComentarios = useMemo(() => {
    return reporte.reduce(
      (sum, sala) => sum + (sala.comentarios?.length || 0),
      0,
    );
  }, [reporte]);

  const promedioCalificacion = useMemo(() => {
    if (reporte.length === 0) return 0;
    const sum = reporte.reduce(
      (acc, sala) => acc + sala.promedioCalificacion,
      0,
    );
    return (sum / reporte.length).toFixed(2);
  }, [reporte]);

  return (
    <div>
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem",
          background: "rgba(30,64,175,0.08)",
          borderRadius: 8,
        }}
      >
        <h3 style={{ color: "#f1f5f9", marginBottom: "1rem" }}>Filtros</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <InputGroup
            label="Fecha Inicio"
            type="datetime-local"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />

          <InputGroup
            label="Fecha Fin"
            type="datetime-local"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />

          <label style={{ color: "#94a3b8", fontSize: ".76rem" }}>
            Sala
            <select
              value={salaId}
              onChange={(e) => setSalaId(e.target.value)}
              style={{
                width: "100%",
                marginTop: ".3rem",
                padding: ".55rem .65rem",
                borderRadius: "8px",
                border: "1px solid rgba(96,165,250,0.2)",
                background: "rgba(15,23,42,0.55)",
                color: "#f1f5f9",
              }}
            >
              <option value="all">Todas las salas</option>
              {salas.map((sala) => (
                <option key={sala.salaId} value={sala.salaId}>
                  {sala.nombre}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          style={{
            marginTop: "1rem",
            padding: ".55rem .8rem",
            borderRadius: "8px",
            border: "none",
            background:
              "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          📥 Descargar PDF
        </button>
      </div>

      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "rgba(30,64,175,0.08)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginBottom: 0 }}>
            Reporte de Comentarios
          </h3>
          <div style={{ color: "#93c5fd", fontSize: ".9rem" }}>
            Total: {totalComentarios} | Promedio calificación:{" "}
            {promedioCalificacion}
          </div>
        </div>

        {isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : reporte.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>
            No hay comentarios para los filtros seleccionados.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 640,
              }}
            >
              <thead>
                <tr
                  style={{
                    color: "#93c5fd",
                    fontSize: ".8rem",
                    textAlign: "left",
                  }}
                >
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Sala
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Filas
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Columnas
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Capacidad
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Promedio Calificación
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    # Comentarios
                  </th>
                </tr>
              </thead>
              <tbody>
                {reporte.map((sala) => (
                  <tr
                    key={sala.salaId}
                    style={{ color: "#e2e8f0", fontSize: ".84rem" }}
                  >
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.nombre}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.filas}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.columnas}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.capacidad}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      ⭐ {sala.promedioCalificacion.toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.comentarios?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {reporte.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <h4 style={{ color: "#93c5fd", marginBottom: "1rem" }}>
                  Comentarios Detallados
                </h4>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {reporte.map((sala) =>
                    sala.comentarios?.map((comentario) => (
                      <div
                        key={`${sala.salaId}-${comentario.idComentario}`}
                        style={{
                          padding: "1rem",
                          background: "rgba(15,23,42,0.55)",
                          borderLeft: "4px solid var(--blue-mid)",
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: ".5rem",
                          }}
                        >
                          <div style={{ color: "#93c5fd", fontWeight: "600" }}>
                            {sala.nombre}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                            ID Usuario: {comentario.idUsuario}
                          </div>
                        </div>
                        <div
                          style={{ color: "#e2e8f0", marginBottom: ".5rem" }}
                        >
                          {comentario.comentario}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: "#94a3b8",
                            fontSize: ".8rem",
                          }}
                        >
                          <span>
                            ⭐ Calificación: {comentario.calificacion}
                          </span>
                          <span>
                            {new Date(comentario.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteComentariosSalaPage;
