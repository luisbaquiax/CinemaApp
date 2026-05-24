import type { AnuncioResponse } from "../../types/Ads.types";

interface Props {
  ad: AnuncioResponse;
  delay?: number;
}

const AdCard = ({ ad, delay = 0 }: Props) => {
  const esVideo = !!ad.videoUrl;
  const esImagen = !!ad.imagenUrl && !esVideo;

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
      {(esImagen || esVideo) && (
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
            <video
              src={ad.videoUrl ?? undefined}
              controls
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      )}
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
    </div>
  );
};

export default AdCard;
