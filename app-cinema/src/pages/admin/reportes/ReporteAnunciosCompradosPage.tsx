import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { adsAdminReportesService } from "../../../services/microservice-ads-billing/AdsAdminReportesService";
import { adsAdminService } from "../../../services/microservice-ads-billing/AdsAdminAnunciosService";
import type { ReporteAnunciosComprados } from "../../../types/Ads.types";

const ReporteAnunciosCompradosPage = () => {
  const { auth } = useAuth();
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [idTipo, setIdTipo] = useState<number | undefined>(undefined);
  const [idPeriodo, setIdPeriodo] = useState<number | undefined>(undefined);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch tipos y periodos
  const { data: tipos = [] } = useQuery({
    queryKey: ["admin-tipos"],
    queryFn: () => adsAdminService.listTipos(),
    enabled: !!auth?.token,
  });

  const { data: periodos = [] } = useQuery({
    queryKey: ["admin-periodos"],
    queryFn: () => adsAdminService.listPeriodos(),
    enabled: !!auth?.token,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "admin-reportes-anuncios-comprados",
      inicio,
      fin,
      idTipo,
      idPeriodo,
      auth?.token,
      shouldFetch,
    ],
    queryFn: () =>
      adsAdminReportesService.getReporteAnunciosComprados({
        ...(inicio ? { inicio } : {}),
        ...(fin ? { fin } : {}),
        idTipo,
        idPeriodo,
      }),
    enabled: !!auth?.token && shouldFetch,
  });

  const reporte: ReporteAnunciosComprados | null = data ?? null;

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
                color: "#e2e8f0",
                fontSize: ".9rem",
                marginBottom: ".35rem",
              }}
            >
              Tipo Anuncio
            </label>
            <select
              value={idTipo ?? ""}
              onChange={(e) =>
                setIdTipo(e.target.value ? Number(e.target.value) : undefined)
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
              <option value="">-- Todos --</option>
              {tipos.map((t) => (
                <option key={t.idTipoAnuncio} value={t.idTipoAnuncio}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                color: "#e2e8f0",
                fontSize: ".9rem",
                marginBottom: ".35rem",
              }}
            >
              Período Anuncio
            </label>
            <select
              value={idPeriodo ?? ""}
              onChange={(e) =>
                setIdPeriodo(
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
              <option value="">-- Todos --</option>
              {periodos.map((p) => (
                <option key={p.idPeriodoAnuncio} value={p.idPeriodoAnuncio}>
                  {p.nombre} ({p.dias} días)
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
              fontSize: ".9rem",
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
              fontSize: ".9rem",
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
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginBottom: 0 }}>
            Anuncios Comprados
          </h3>
          {reporte && (
            <div style={{ color: "#93c5fd", fontSize: ".9rem" }}>
              Total anuncios: {reporte.totalAnuncios} | Total recaudado: $
              {Number(reporte.totalRecaudado).toFixed(2)}
            </div>
          )}
        </div>

        {!shouldFetch ? (
          <div style={{ color: "#94a3b8" }}>
            Presiona "Consultar" para cargar el reporte.
          </div>
        ) : isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : isError ? (
          <div style={{ color: "#f87171" }}>No se pudo cargar el reporte.</div>
        ) : !reporte || !reporte.anuncios?.length ? (
          <div style={{ color: "#94a3b8" }}>
            No hay anuncios para los filtros seleccionados.
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
                    Periodo
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Dias
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
                    Fecha Inicio
                  </th>
                  <th
                    style={{
                      padding: ".5rem .6rem",
                      borderBottom: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    Fecha Fin
                  </th>
                </tr>
              </thead>
              <tbody>
                {reporte.anuncios.map((a) => (
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
                      {a.periodoAnuncio}
                    </td>
                    <td
                      style={{
                        padding: ".55rem .6rem",
                        borderBottom: "1px solid rgba(96,165,250,0.08)",
                      }}
                    >
                      {a.diasVigencia}
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
    </div>
  );
};

export default ReporteAnunciosCompradosPage;
