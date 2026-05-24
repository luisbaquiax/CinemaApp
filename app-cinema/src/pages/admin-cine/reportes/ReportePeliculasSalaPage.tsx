import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { getStoredSelectedCompaniaId } from "../../../utils/adminCineSelection";
import { reportesAdminCineService } from "../../../services/microservice-cinema/ReportesAdminCineService";
import { cinemaService } from "../../../services/microservice-cinema/CinemaService";
import type { ReportePeliculasSala } from "../../../types/CinemaCoreReports";
import type { SalaResponse } from "../../../types/CinemaCore.types";

const ReportePeliculasSalaPage: React.FC = () => {
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
      "reporte-peliculas-sala",
      fechaInicio,
      fechaFin,
      salaId,
      idCompania,
    ],
    queryFn: () =>
      reportesAdminCineService.reportePeliculasSala(
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

  const reporte: ReportePeliculasSala[] = Array.isArray(reporteData)
    ? reporteData
    : [];

  const totalPeliculas = useMemo(() => {
    return reporte.reduce(
      (sum, sala) => sum + (sala.peliculas?.length || 0),
      0,
    );
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
            Películas Proyectadas
          </h3>
          <div style={{ color: "#93c5fd", fontSize: ".9rem" }}>
            Películas: {totalPeliculas} | Salas: {reporte.length}
          </div>
        </div>

        {isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : reporte.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>
            No hay películas para los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {reporte.map((sala) => (
              <div key={sala.salaId}>
                <div
                  style={{
                    color: "#93c5fd",
                    fontWeight: "600",
                    marginBottom: ".8rem",
                  }}
                >
                  {sala.nombreSala} (Capacidad: {sala.capacidad})
                </div>

                {!sala.peliculas || sala.peliculas.length === 0 ? (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".85rem",
                      marginLeft: "1rem",
                    }}
                  >
                    Sin películas
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", marginLeft: "1rem" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 600,
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
                            Película
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Director
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Duración
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Clasificación
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Precio
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sala.peliculas.map((pelicula) => (
                          <tr
                            key={`${sala.salaId}-${pelicula.idPelicula}`}
                            style={{ color: "#e2e8f0", fontSize: ".84rem" }}
                          >
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {pelicula.titulo}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {pelicula.director || "-"}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {pelicula.duracionMin} min
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {pelicula.clasificacion}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              Q {pelicula.precio.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportePeliculasSalaPage;
