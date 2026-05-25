import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { authService } from "../../../services/microservice-users/authService";
import { useAuth } from "../../../hooks/UseAuth";
import { adsAdminReportesService } from "../../../services/microservice-ads-billing/AdsAdminReportesService";
import type { ReporteGananciasAnunciante } from "../../../types/Ads.types";

const ReporteGananciasAnunciantePage = () => {
  const { auth } = useAuth();
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [idAnunciante, setIdAnunciante] = useState<number | undefined>(
    undefined,
  );
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: anunciantes = [] } = useQuery({
    queryKey: ["admin-anunciantes"],
    queryFn: () => authService.getAllUsers(undefined, "ROLE_ANUNCIANTE"),
  });

  const request = auth?.token
    ? {
        ...(inicio ? { inicio } : {}),
        ...(fin ? { fin } : {}),
        idAnunciante,
        token: auth.token,
      }
    : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "admin-reportes-ganancias-anunciante",
      inicio,
      fin,
      idAnunciante,
      auth?.token,
      shouldFetch,
    ],
    queryFn: () =>
      adsAdminReportesService.getReporteGananciasPorAnunciante(request!),
    enabled: !!request && shouldFetch,
  });

  const reporte: ReporteGananciasAnunciante[] = Array.isArray(data) ? data : [];

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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
          <div>
            <label
              style={{
                display: "block",
                marginBottom: ".4rem",
                color: "#94a3b8",
              }}
            >
              Anunciante (opcional)
            </label>
            <select
              value={idAnunciante ?? ""}
              onChange={(e) =>
                setIdAnunciante(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              style={{
                padding: ".75rem .9rem",
                borderRadius: "14px",
                border: "1px solid rgba(96,165,250,0.2)",
                background: "rgba(15,23,42,0.96)",
                color: "#f1f5f9",
                outline: "none",
              }}
            >
              <option value="">Todos los anunciantes</option>
              {anunciantes.map((u: any) => (
                <option key={u.idUsuario} value={u.idUsuario}>
                  {u.nombres} {u.apellidos} @{u.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: ".75rem",
            marginTop: ".85rem",
            flexWrap: "wrap",
          }}
        >
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
        <h3 style={{ color: "#f1f5f9", marginBottom: ".75rem" }}>
          Ganancias por Anunciante
        </h3>

        {!shouldFetch ? (
          <div style={{ color: "#94a3b8" }}>
            Presiona "Consultar" para cargar el reporte.
          </div>
        ) : isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : isError ? (
          <div style={{ color: "#f87171" }}>No se pudo cargar el reporte.</div>
        ) : reporte.length === 0 ? (
          <div style={{ color: "#94a3b8" }}>
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {reporte.map((r) => (
              <div
                key={r.idAnunciante}
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
                    marginBottom: ".5rem",
                  }}
                >
                  <strong style={{ color: "#93c5fd" }}>
                    {r.nombreCompleto}
                  </strong>
                  <span style={{ color: "#94a3b8", fontSize: ".9rem" }}>
                    Total anuncios: {r.totalAnuncios} | Gastado: $
                    {Number(r.totalGastado).toFixed(2)}
                  </span>
                </div>

                {!r.anuncios?.length ? (
                  <div style={{ color: "#94a3b8" }}>
                    Sin anuncios registrados.
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: 700,
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
                            ID
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Título
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Tipo
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Monto
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Inicio
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Fin
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.anuncios.map((a) => (
                          <tr
                            key={a.idAnuncio}
                            style={{ color: "#e2e8f0", fontSize: ".84rem" }}
                          >
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {a.idAnuncio}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {a.titulo}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {a.tipoAnuncio}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {Number(a.montoPagado).toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {a.fechaInicio}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {a.fechaFin}
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

export default ReporteGananciasAnunciantePage;
