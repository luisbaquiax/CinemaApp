import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { adsAdminReportesService } from "../../../services/microservice-ads-billing/AdsAdminReportesService";
import type { ReporteGanancias } from "../../../types/Ads.types";

const ReporteGananciasPage = () => {
  const { auth } = useAuth();
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const request = auth?.token
    ? {
        ...(inicio ? { inicio } : {}),
        ...(fin ? { fin } : {}),
        token: auth.token,
      }
    : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-reportes-ganancias", inicio, fin, auth?.token, shouldFetch],
    queryFn: () => adsAdminReportesService.getReporteGanancias(request!),
    enabled: !!request && shouldFetch,
  });

  const reporte: ReporteGanancias | null = data ?? null;

  const handleConsultar = () => setShouldFetch(true);

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
          <InputGroup label="Fecha Inicio" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          <InputGroup label="Fecha Fin" type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} />
        </div>

        <div style={{ display: "flex", gap: ".75rem", marginTop: ".85rem", flexWrap: "wrap" }}>
          <button
            onClick={handleConsultar}
            style={{
              padding: ".55rem .8rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            🔍 Consultar
          </button>
          <button
            disabled
            style={{
              padding: ".55rem .8rem",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
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
        <h3 style={{ color: "#f1f5f9", marginBottom: ".75rem" }}>Ganancias (Ads)</h3>

        {!shouldFetch ? (
          <div style={{ color: "#94a3b8" }}>Presiona "Consultar" para cargar el reporte.</div>
        ) : isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : isError || !reporte ? (
          <div style={{ color: "#f87171" }}>No se pudo cargar el reporte.</div>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ padding: '.75rem 1rem', background: 'rgba(15,23,42,0.6)', borderRadius: 8 }}>
                <div style={{ color: '#93c5fd', fontWeight: 600 }}>Total Ingresos</div>
                <div style={{ color: '#e2e8f0' }}>${Number(reporte.totalIngresos).toFixed(2)}</div>
              </div>
              <div style={{ padding: '.75rem 1rem', background: 'rgba(15,23,42,0.6)', borderRadius: 8 }}>
                <div style={{ color: '#93c5fd', fontWeight: 600 }}>Total Costos</div>
                <div style={{ color: '#e2e8f0' }}>${Number(reporte.totalCostos).toFixed(2)}</div>
              </div>
              <div style={{ padding: '.75rem 1rem', background: 'rgba(15,23,42,0.6)', borderRadius: 8 }}>
                <div style={{ color: '#93c5fd', fontWeight: 600 }}>Total Ganancias</div>
                <div style={{ color: '#e2e8f0' }}>${Number(reporte.totalGanancias).toFixed(2)}</div>
              </div>
            </div>

            {reporte.cines.map((c) => (
              <div key={c.idCompania} style={{ padding: '1rem', background: 'rgba(15,23,42,0.55)', borderLeft: '4px solid var(--blue-mid)', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
                  <strong style={{ color: '#93c5fd' }}>{c.nombreCompania}</strong>
                  <span style={{ color: '#94a3b8', fontSize: '.9rem' }}>Costo total: ${Number(c.costoTotal).toFixed(2)} | Ingreso bloqueos: ${Number(c.ingresoBloqueos).toFixed(2)}</span>
                </div>

                <div style={{ display: 'grid', gap: '.6rem' }}>
                  <div>
                    <div style={{ color: '#cbd5e1', fontSize: '.88rem', marginBottom: '.35rem' }}>Tramos</div>
                    {!c.tramos?.length ? (
                      <div style={{ color: '#94a3b8' }}>No hay tramos.</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                        <thead>
                          <tr style={{ color: '#93c5fd', fontSize: '.8rem', textAlign: 'left' }}>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Costo/Día</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Desde</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Hasta</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Días</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Costo Tramo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.tramos.map((t, i) => (
                            <tr key={i} style={{ color: '#e2e8f0', fontSize: '.84rem' }}>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>${Number(t.costoDia).toFixed(2)}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{t.desde}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{t.hasta}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{t.diasEfectivos}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>${Number(t.costoTramo).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div>
                    <div style={{ color: '#cbd5e1', fontSize: '.88rem', marginBottom: '.35rem' }}>Bloqueos</div>
                    {!c.bloqueos?.length ? (
                      <div style={{ color: '#94a3b8' }}>No hay bloqueos.</div>
                    ) : (
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                        <thead>
                          <tr style={{ color: '#93c5fd', fontSize: '.8rem', textAlign: 'left' }}>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>ID</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Días</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Monto</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Inicio</th>
                            <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Fin</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.bloqueos.map((b) => (
                            <tr key={b.idBloqueo} style={{ color: '#e2e8f0', fontSize: '.84rem' }}>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{b.idBloqueo}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{b.dias}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>${Number(b.montoPagado).toFixed(2)}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{b.fechaInicio}</td>
                              <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>{b.fechaFin}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReporteGananciasPage;
