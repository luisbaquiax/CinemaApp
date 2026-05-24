import { useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { getStoredSelectedCompaniaId } from "../../utils/adminCineSelection";
import ReporteComentariosSalaPage from "./reportes/ReporteComentariosSalaPage";
import ReportePeliculasSalaPage from "./reportes/ReportePeliculasSalaPage";
import ReporteSalasMasGustadasPage from "./reportes/ReporteSalasMasGustadasPage";
import ReporteBoletoVendidosPage from "./reportes/ReporteBoletoVendidosPage";

type ReportType = "comentarios" | "peliculas" | "salas-gustadas" | "boletos";

const ReportesPage: React.FC = () => {
    const { auth } = useAuth();
    const [reportType, setReportType] = useState<ReportType>("comentarios");
    const idCompania = getStoredSelectedCompaniaId();

    if (!idCompania || !auth?.idUsuario) {
        return (
            <div style={{ padding: "2rem", color: "#94a3b8" }}>
                No tienes acceso a esta página.
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1 style={{ color: "#f1f5f9", marginBottom: "1.5rem" }}>Reportes de Administrador de Cine</h1>

            <div style={{ display: "flex", gap: "0.8rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <button
                    onClick={() => setReportType("comentarios")}
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: reportType === "comentarios" ? "2px solid var(--blue-light)" : "1px solid rgba(96,165,250,0.2)",
                        background: reportType === "comentarios" ? "rgba(96,165,250,0.15)" : "transparent",
                        color: reportType === "comentarios" ? "#93c5fd" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: reportType === "comentarios" ? "600" : "400",
                    }}
                >
                    📝 Comentarios de Salas
                </button>

                <button
                    onClick={() => setReportType("peliculas")}
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: reportType === "peliculas" ? "2px solid var(--blue-light)" : "1px solid rgba(96,165,250,0.2)",
                        background: reportType === "peliculas" ? "rgba(96,165,250,0.15)" : "transparent",
                        color: reportType === "peliculas" ? "#93c5fd" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: reportType === "peliculas" ? "600" : "400",
                    }}
                >
                    🎬 Películas Proyectadas
                </button>

                <button
                    onClick={() => setReportType("salas-gustadas")}
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: reportType === "salas-gustadas" ? "2px solid var(--blue-light)" : "1px solid rgba(96,165,250,0.2)",
                        background: reportType === "salas-gustadas" ? "rgba(96,165,250,0.15)" : "transparent",
                        color: reportType === "salas-gustadas" ? "#93c5fd" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: reportType === "salas-gustadas" ? "600" : "400",
                    }}
                >
                    ⭐ Salas Más Gustadas
                </button>

                <button
                    onClick={() => setReportType("boletos")}
                    style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "8px",
                        border: reportType === "boletos" ? "2px solid var(--blue-light)" : "1px solid rgba(96,165,250,0.2)",
                        background: reportType === "boletos" ? "rgba(96,165,250,0.15)" : "transparent",
                        color: reportType === "boletos" ? "#93c5fd" : "#94a3b8",
                        cursor: "pointer",
                        fontWeight: reportType === "boletos" ? "600" : "400",
                    }}
                >
                    🎫 Boletos Vendidos
                </button>
            </div>

            <div>
                {reportType === "comentarios" && <ReporteComentariosSalaPage />}
                {reportType === "peliculas" && <ReportePeliculasSalaPage />}
                {reportType === "salas-gustadas" && <ReporteSalasMasGustadasPage />}
                {reportType === "boletos" && <ReporteBoletoVendidosPage />}
            </div>
        </div>
    );
};

export default ReportesPage;
