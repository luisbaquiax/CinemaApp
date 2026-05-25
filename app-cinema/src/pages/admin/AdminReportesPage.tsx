import { useState } from "react";
import { BarChart3, MessageSquareText, TrendingUp } from "lucide-react";
import ReporteSalasMasPopularesPage from "./reportes/ReporteSalasMasPopularesPage";
import ReporteSalasMasComentadasPage from "./reportes/ReporteSalasMasComentadasPage";
import ReporteAnunciosCompradosPage from "./reportes/ReporteAnunciosCompradosPage";
import ReporteGananciasAnunciantePage from "./reportes/ReporteGananciasAnunciantePage";
import ReporteGananciasPage from "./reportes/ReporteGananciasPage";

type ReporteAdminSistema =
  | "populares"
  | "comentadas"
  | "anuncios-comprados"
  | "ganancias-anunciante"
  | "ganancias";

const cardStyle: React.CSSProperties = {
  borderRadius: "14px",
  border: "1px solid rgba(96,165,250,0.15)",
  background: "rgba(30,64,175,0.1)",
  padding: "1rem",
};

const AdminReportesPage = () => {
  const [tipoReporte, setTipoReporte] =
    useState<ReporteAdminSistema>("populares");

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: ".08em",
            color: "#f1f5f9",
            marginBottom: ".35rem",
          }}
        >
          Reportes del Sistema
        </h1>
        <p style={{ fontSize: ".9rem", color: "#94a3b8" }}>
          Analítica general con el estilo visual de los reportes
          administrativos.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <BarChart3 size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Reporte de Ganancias
            </h3>
          </div>
          <button
            onClick={() => setTipoReporte("ganancias")}
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Ver reporte
          </button>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <TrendingUp size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Salas Más Populares
            </h3>
          </div>
          <button
            onClick={() => setTipoReporte("populares")}
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Ver reporte
          </button>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <MessageSquareText size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Salas Más Comentadas
            </h3>
          </div>
          <button
            onClick={() => setTipoReporte("comentadas")}
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Ver reporte
          </button>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <BarChart3 size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Exportación
            </h3>
          </div>
          <button
            disabled
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "1px solid rgba(148,163,184,0.35)",
              background: "transparent",
              color: "#94a3b8",
            }}
          >
            Próximamente PDF
          </button>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <BarChart3 size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Anuncios Comprados
            </h3>
          </div>
          <button
            onClick={() => setTipoReporte("anuncios-comprados")}
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Ver reporte
          </button>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: ".5rem",
              marginBottom: ".7rem",
            }}
          >
            <BarChart3 size={16} color="#93c5fd" />
            <h3 style={{ color: "#f1f5f9", fontSize: ".95rem" }}>
              Ganancias por Anunciante
            </h3>
          </div>
          <button
            onClick={() => setTipoReporte("ganancias-anunciante")}
            style={{
              marginTop: ".6rem",
              padding: ".5rem .85rem",
              borderRadius: "8px",
              border: "none",
              background:
                "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Ver reporte
          </button>
        </section>
      </div>

      <div>
        {tipoReporte === "populares" ? (
          <ReporteSalasMasPopularesPage />
        ) : tipoReporte === "comentadas" ? (
          <ReporteSalasMasComentadasPage />
        ) : tipoReporte === "anuncios-comprados" ? (
          <ReporteAnunciosCompradosPage />
        ) : tipoReporte === "ganancias" ? (
          <ReporteGananciasPage />
        ) : (
          <ReporteGananciasAnunciantePage />
        )}
      </div>
    </div>
  );
};

export default AdminReportesPage;
