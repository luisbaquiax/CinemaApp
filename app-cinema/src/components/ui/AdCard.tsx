import type { AnuncioResponse } from "../../types/Ads.types";

interface Props {
  ad: AnuncioResponse;
  delay?: number;
}

const formatDate = (value?: string) => {
  if (!value) return "";
  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdCard = ({ ad, delay = 0 }: Props) => {
  const tipo = ad.tipo?.nombre ?? "ANUNCIO";
  const esVideo = tipo === "VIDEO_TEXTO" && !!ad.videoUrl;
  const esImagen = tipo === "TEXTO_IMAGEN" && !!ad.imagenUrl;

  return (
    <div
      className="animate-fade-up"
      style={{
        borderRadius: "14px",
        overflow: "hidden",
        background: "rgba(30,64,175,0.15)",
        border: "1px solid rgba(96,165,250,0.14)",
        padding: ".9rem",
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          width: "100%",
          minHeight: esImagen ? "120px" : "80px",
          borderRadius: "9px",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.28), rgba(15,23,42,0.92))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          marginBottom: ".6rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {esImagen ? (
          <img
            src={ad.imagenUrl}
            alt={ad.titulo}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", padding: ".75rem" }}>
            <div
              style={{
                fontSize: ".7rem",
                letterSpacing: ".12em",
                textTransform: "uppercase",
                color: "#bfdbfe",
              }}
            >
              {tipo}
            </div>
            <div
              style={{
                fontSize: ".9rem",
                fontWeight: 600,
                color: "#f1f5f9",
                marginTop: ".25rem",
              }}
            >
              {ad.activo ? "Activo" : "Inactivo"}
            </div>
            {esVideo && (
              <div
                style={{
                  fontSize: ".65rem",
                  color: "#93c5fd",
                  marginTop: ".25rem",
                }}
              >
                ▶ Contenido en video disponible
              </div>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: ".6rem",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: ".25rem",
        }}
      >
        {tipo}
      </div>
      <div
        style={{
          fontSize: ".72rem",
          fontWeight: 600,
          color: "#f1f5f9",
          lineHeight: 1.3,
        }}
      >
        {ad.titulo}
      </div>
      <div
        style={{
          fontSize: ".62rem",
          color: "#94a3b8",
          marginTop: ".2rem",
          lineHeight: 1.4,
        }}
      >
        {ad.contenidoTexto}
      </div>
      {esVideo && ad.videoUrl && (
        <a
          href={ad.videoUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: ".62rem",
            fontWeight: 600,
            color: "var(--accent2)",
            marginTop: ".35rem",
            display: "inline-block",
          }}
        >
          ▶ Ver video
        </a>
      )}
    </div>
  );
};

export default AdCard;
