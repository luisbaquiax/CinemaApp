import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { InputGroup } from "../../../components/inputs/InputGroup";
import { useAuth } from "../../../hooks/UseAuth";
import { getStoredSelectedCompaniaId } from "../../../utils/adminCineSelection";
import { reportesAdminCineService } from "../../../services/microservice-cinema/ReportesAdminCineService";
import { cinemaService } from "../../../services/microservice-cinema/CinemaService";
import { authService } from "../../../services/microservice-users/authService";
import type { ReporteBoletosPorCompania } from "../../../types/CinemaCoreReports";
import type { SalaResponse } from "../../../types/CinemaCore.types";
import type { UsuarioComunResponse } from "../../../types/Usuario.type";

const ReporteBoletoVendidosPage: React.FC = () => {
  const { auth } = useAuth();
  const idCompania = getStoredSelectedCompaniaId();
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");
  const [salaId, setSalaId] = useState<string>("all");
  const [usuariosCache, setUsuariosCache] = useState<
    Map<number, UsuarioComunResponse | null>
  >(new Map());

  const { data: salasRaw } = useQuery({
    queryKey: ["reportes-salas-list", idCompania],
    queryFn: () => cinemaService.getSalasByCompania(idCompania || 0),
    enabled: !!idCompania,
  });

  const salas: SalaResponse[] = Array.isArray(salasRaw) ? salasRaw : [];

  const { data: reporteData, isLoading } = useQuery({
    queryKey: ["reporte-boletos", fechaInicio, fechaFin, salaId, idCompania],
    queryFn: () =>
      reportesAdminCineService.reporteBoletoVendidos(
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

  const reporte: ReporteBoletosPorCompania | undefined = reporteData;

  // Cargar información de usuarios
  useEffect(() => {
    if (!reporte) return;

    const usuariosIdsUnicos = new Set<number>();
    reporte.salas?.forEach((sala) => {
      sala.boletos?.forEach((boleto) => {
        usuariosIdsUnicos.add(boleto.idUsuario);
      });
    });

    const idsParaCargar = Array.from(usuariosIdsUnicos).filter(
      (id) => !usuariosCache.has(id),
    );

    idsParaCargar.forEach((idUsuario) => {
      authService
        .getProfileById(idUsuario)
        .then((usuario) => {
          setUsuariosCache((prev) => new Map(prev).set(idUsuario, usuario));
        })
        .catch(() => {
          // Si no encuentra el usuario, guardamos null
          setUsuariosCache((prev) => new Map(prev).set(idUsuario, null));
        });
    });
  }, [reporte, usuariosCache]);

  const getNombreUsuario = (idUsuario: number) => {
    const usuario = usuariosCache.get(idUsuario);
    if (usuario) {
      return `${usuario.nombres} ${usuario.apellidos} (@${usuario.username})`;
    }
    if (usuariosCache.has(idUsuario) && usuario === null) {
      return `ID: ${idUsuario}`;
    }
    return `ID: ${idUsuario} (Cargando...)`;
  };

  const totalDinero = useMemo(() => {
    return reporte?.totalDineroGeneral || 0;
  }, [reporte]);

  const totalBoletos = useMemo(() => {
    return reporte?.totalBoletosGeneral || 0;
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
            Boletos Vendidos
          </h3>
          <div style={{ color: "#93c5fd", fontSize: ".9rem" }}>
            Boletos: {totalBoletos} | Total: Q {totalDinero.toFixed(2)}
          </div>
        </div>

        {isLoading ? (
          <div style={{ color: "#94a3b8" }}>⏳ Cargando reporte...</div>
        ) : !reporte || (reporte.salas && reporte.salas.length === 0) ? (
          <div style={{ color: "#94a3b8" }}>
            No hay boletos para los filtros seleccionados.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {reporte.salas?.map((sala) => (
              <div key={sala.salaId}>
                <div
                  style={{
                    color: "#93c5fd",
                    fontWeight: "600",
                    marginBottom: ".8rem",
                  }}
                >
                  {sala.nombreSala} - Capacity: {sala.capacidad} | Total: Q{" "}
                  {sala.totalDinero.toFixed(2)} ({sala.totalBoletos} boletos)
                </div>

                {!sala.boletos || sala.boletos.length === 0 ? (
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".85rem",
                      marginLeft: "1rem",
                    }}
                  >
                    Sin boletos
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", marginLeft: "1rem" }}>
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
                            Usuario
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Fila
                          </th>
                          <th
                            style={{
                              padding: ".5rem .6rem",
                              borderBottom: "1px solid rgba(96,165,250,0.15)",
                            }}
                          >
                            Columna
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
                            Fecha Pago
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sala.boletos.map((boleto) => (
                          <tr
                            key={`${sala.salaId}-${boleto.idBoleto}`}
                            style={{ color: "#e2e8f0", fontSize: ".84rem" }}
                          >
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {getNombreUsuario(boleto.idUsuario)}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {boleto.filaAsiento}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {boleto.columnaAsiento}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              Q {boleto.monto.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: ".55rem .6rem",
                                borderBottom: "1px solid rgba(96,165,250,0.08)",
                              }}
                            >
                              {new Date(boleto.fechaPago).toLocaleString()}
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

export default ReporteBoletoVendidosPage;
