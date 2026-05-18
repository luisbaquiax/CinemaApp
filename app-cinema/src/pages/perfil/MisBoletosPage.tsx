import { useQuery } from "@tanstack/react-query";
import { Calendar, Film, MapPin, Wallet, Armchair } from "lucide-react";
import { useAuth } from "../../hooks/UseAuth";
import { cinemaUsuarioService } from "../../services/microservice-cinema/CinemaUsuarioService";

const MisBoletosPage = () => {
  const { auth } = useAuth();

  const { data: boletos = [], isLoading } = useQuery({
    queryKey: ["mis-boletos", auth?.idUsuario],
    queryFn: () => cinemaUsuarioService.getBoletosPorUsuario(auth!.idUsuario),
    enabled: !!auth?.idUsuario,
  });

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: ".08em",
            color: "#f1f5f9",
          }}
        >
          Mis boletos
        </h1>
        <p style={{ fontSize: ".85rem", color: "#94a3b8" }}>
          Historial de compras y entradas emitidas.
        </p>
      </div>

      {isLoading ? (
        <div style={{ color: "#94a3b8" }}>⏳ Cargando boletos...</div>
      ) : boletos.length === 0 ? (
        <div style={{ color: "#94a3b8" }}>
          No tienes boletos comprados todavía.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {boletos.map((boleto) => (
            <div
              key={boleto.idBoleto}
              style={{
                borderRadius: "16px",
                padding: "1.25rem",
                background: "rgba(30,64,175,0.12)",
                border: "1px solid rgba(96,165,250,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: ".9rem",
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#f1f5f9",
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    {boleto.titulo}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: ".82rem" }}>
                    {boleto.clasificacion.nombre} · {boleto.duracionMin} min ·
                    ⭐ {boleto.calificacionPromedio}
                  </div>
                </div>
                <div style={{ color: "#f1f5f9", fontWeight: 600 }}>
                  Q {Number(boleto.monto).toFixed(2)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: ".75rem",
                }}
              >
                <div
                  style={{
                    padding: ".85rem",
                    borderRadius: "12px",
                    background: "rgba(15,23,42,0.35)",
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".75rem",
                      marginBottom: ".25rem",
                    }}
                  >
                    <Film
                      size={14}
                      style={{ display: "inline-block", marginRight: ".3rem" }}
                    />
                    Sala
                  </div>
                  <div style={{ color: "#f1f5f9" }}>{boleto.nombre}</div>
                  <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                    Capacidad {boleto.capacidad} · {boleto.filas} filas ·{" "}
                    {boleto.columnas} columnas
                  </div>
                </div>

                <div
                  style={{
                    padding: ".85rem",
                    borderRadius: "12px",
                    background: "rgba(15,23,42,0.35)",
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".75rem",
                      marginBottom: ".25rem",
                    }}
                  >
                    <Calendar
                      size={14}
                      style={{ display: "inline-block", marginRight: ".3rem" }}
                    />
                    Función
                  </div>
                  <div style={{ color: "#f1f5f9" }}>
                    {boleto.fechaHoraInicio}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                    Fin {boleto.fechaHoraFin}
                  </div>
                </div>

                <div
                  style={{
                    padding: ".85rem",
                    borderRadius: "12px",
                    background: "rgba(15,23,42,0.35)",
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".75rem",
                      marginBottom: ".25rem",
                    }}
                  >
                    <Armchair
                      size={14}
                      style={{ display: "inline-block", marginRight: ".3rem" }}
                    />
                    Asiento
                  </div>
                  <div style={{ color: "#f1f5f9" }}>
                    Fila {boleto.asiento.fila} · Columna{" "}
                    {boleto.asiento.columna}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                    Asiento #{boleto.asiento.idAsiento}
                  </div>
                </div>

                <div
                  style={{
                    padding: ".85rem",
                    borderRadius: "12px",
                    background: "rgba(15,23,42,0.35)",
                  }}
                >
                  <div
                    style={{
                      color: "#94a3b8",
                      fontSize: ".75rem",
                      marginBottom: ".25rem",
                    }}
                  >
                    <Wallet
                      size={14}
                      style={{ display: "inline-block", marginRight: ".3rem" }}
                    />
                    Pago
                  </div>
                  <div style={{ color: "#f1f5f9" }}>
                    Q {Number(boleto.monto).toFixed(2)}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: ".8rem" }}>
                    {new Date(boleto.fechaPago).toLocaleString("es-ES")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem", color: "#94a3b8", fontSize: ".8rem" }}>
        <MapPin
          size={14}
          style={{ display: "inline-block", marginRight: ".3rem" }}
        />
        Los boletos se muestran tal como fueron emitidos por el sistema.
      </div>
    </div>
  );
};

export default MisBoletosPage;
