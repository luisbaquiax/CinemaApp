import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { reportesAdminCineService } from "../../../services/microservice-cinema/ReportesAdminCineService";
import type { ReporteSalasMasComentadas } from "../../../types/CinemaCoreAdminReports.types";

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const ReporteSalasMasComentadasPage = () => {
  const { auth } = useAuth();
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: reporteData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-reportes-salas-comentadas", inicio, fin, auth?.token, shouldFetch],
    queryFn: () =>
      reportesAdminCineService.reporteSalasMasComentadas(inicio, fin),
    enabled: !!auth?.token && shouldFetch,
  });

  const reporte: ReporteSalasMasComentadas[] = Array.isArray(reporteData)
    ? reporteData
    : [];

  const totalComentarios = useMemo(() => {
    return reporte.reduce((sum, sala) => sum + (sala.totalComentarios || 0), 0);
  }, [reporte]);

  const promedioGeneral = useMemo(() => {
    if (reporte.length === 0) return 0;
    const sum = reporte.reduce(
      (acc, sala) => acc + (sala.promedioCalificacion || 0),
      0,
    );
    return (sum / reporte.length).toFixed(2);
  }, [reporte]);

  const handleConsultar = () => {
    setShouldFetch(true);
  };

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
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
          <InputGroup
            label="Fecha Fin"
            type="datetime-local"
            value={fin}
            onChange={(e) => setFin(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem", flexWrap: "wrap" }}>
          <button
            onClick={handleConsultar}
            style={{
              padding: ".55rem .8rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🔍 Consultar
          </button>
          <button
            style={{
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
            gap: ".75rem",
            flexWrap: "wrap",
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginBottom: 0 }}>
            Salas Más Comentadas
          </h3>
          <div style={{ color: "#93c5fd", fontSize: ".9rem" }}>
            Total comentarios: {totalComentarios} | Promedio calificación: ⭐{" "}
            {promedioGeneral}
          </div>
        </div>

        {!shouldFetch ? (
          <div style={{ color: "#94a3b8" }}>Presiona "Consultar" para cargar el reporte.</div>
        ) : isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : isError ? (
          <div style={{ color: "#f87171" }}>No se pudo cargar el reporte.</div>
        ) : reporte.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>
            No hay salas para los filtros seleccionados.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 760,
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
                    Compañía
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Total comentarios
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Promedio
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
                      {sala.nombreSala}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.nombreCompania}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {sala.totalComentarios}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      ⭐ {sala.promedioCalificacion.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "1.5rem" }}>
              <h4 style={{ color: "#93c5fd", marginBottom: "1rem" }}>
                Listado de comentarios
              </h4>
              <div style={{ display: "grid", gap: "1rem" }}>
                {reporte.map((sala) => (
                  <div
                    key={sala.salaId}
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
                        gap: ".75rem",
                        flexWrap: "wrap",
                        marginBottom: ".75rem",
                      }}
                    >
                      <strong style={{ color: "#93c5fd" }}>
                        {sala.nombreSala}
                      </strong>
                      <span style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                        Comentarios: {sala.totalComentarios}
                      </span>
                    </div>
                    {!sala.comentarios?.length ? (
                      <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                        Sin comentarios registrados.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: ".75rem" }}>
                        {sala.comentarios.map((comentario) => (
                          <div
                            key={comentario.idComentarioSala}
                            style={{
                              padding: ".85rem",
                              background: "rgba(30,41,59,0.8)",
                              borderRadius: "8px",
                              border: "1px solid rgba(96,165,250,0.08)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: ".75rem",
                                flexWrap: "wrap",
                                marginBottom: ".35rem",
                              }}
                            >
                              <span
                                style={{ color: "#93c5fd", fontSize: ".8rem" }}
                              >
                                Usuario #{comentario.idUsuario}
                              </span>
                              <span
                                style={{ color: "#94a3b8", fontSize: ".8rem" }}
                              >
                                {formatDateTime(comentario.createdAt)}
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#e2e8f0",
                                marginBottom: ".35rem",
                              }}
                            >
                              {comentario.comentario}
                            </div>
                            <div
                              style={{ color: "#94a3b8", fontSize: ".8rem" }}
                            >
                              ⭐ Calificación: {comentario.calificacion}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteSalasMasComentadasPage;
