import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import NowPlayingTicker from "../../components/ui/NowPlayingTicker";
import SearchBar from "../../components/ui/SearchBar";
import CategoryPills from "../../components/ui/CategoryPills";
import MovieCard from "../../components/ui/MovieCard";
import { cinemaService } from "../../services/microservice-cinema/CinemaService";
import type { Movie } from "../../types/Movie.types";
import type {
  CategoriaResponse,
  ClasificacionResponse,
  CompaniaResponse,
  PeliculaResponse,
} from "../../types/CinemaCore.types";
import AdsAside from "../../components/ui/AdsAside";

const POSTER_BACKGROUNDS = [
  "linear-gradient(160deg,#1e3a5f,#0c1f3a 50%,#1a2f1a)",
  "linear-gradient(160deg,#3b1c6e,#0f172a 50%,#1c1c0f)",
  "linear-gradient(160deg,#5c1a1a,#0f172a 60%,#1a1a2e)",
  "linear-gradient(160deg,#1a4a2e,#0f172a 55%,#2e1a0f)",
  "linear-gradient(160deg,#2e1a0f,#0f172a 50%,#1a2e4a)",
  "linear-gradient(160deg,#0f2a4a,#1a0f2e 50%,#2a1a0f)",
  "linear-gradient(160deg,#1a1a4a,#0f172a 50%,#2e0f1a)",
  "linear-gradient(160deg,#0f3a2a,#0f172a 50%,#3a2a0f)",
];

// Componente principal
const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [clasificacionActiva, setClasificacionActiva] = useState("Todas");
  const [companiaActiva, setCompaniaActiva] = useState("Todas");
  const navigate = useNavigate();

  const { data: peliculas = [], isLoading: peliculasLoading } = useQuery<
    PeliculaResponse[]
  >({
    queryKey: ["peliculas-publicas"],
    queryFn: cinemaService.getPeliculasActivas,
  });

  const { data: categorias = [] } = useQuery<CategoriaResponse[]>({
    queryKey: ["categorias-publicas"],
    queryFn: cinemaService.getCategorias,
  });

  const { data: clasificaciones = [] } = useQuery<ClasificacionResponse[]>({
    queryKey: ["clasificaciones-publicas"],
    queryFn: cinemaService.getClasificaciones,
  });

  const { data: companias = [] } = useQuery<CompaniaResponse[]>({
    queryKey: ["companias-publicas"],
    queryFn: cinemaService.getCompaniasActivas,
  });

  const categoriasPills = useMemo(
    () => ["Todas", ...categorias.map((cat) => cat.nombre)],
    [categorias],
  );

  const peliculasBase = useMemo(() => {
    return peliculas.filter((pelicula) => {
      const matchTitle = pelicula.titulo
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCategoria =
        categoriaActiva === "Todas" ||
        pelicula.categorias.some((cat) => cat.nombre === categoriaActiva);
      const matchClasificacion =
        clasificacionActiva === "Todas" ||
        pelicula.clasificacion.codigo === clasificacionActiva;
      return matchTitle && matchCategoria && matchClasificacion;
    });
  }, [peliculas, searchQuery, categoriaActiva, clasificacionActiva]);

  const peliculasCineQueries = useQueries({
    queries: peliculasBase.map((pelicula) => ({
      queryKey: ["pelicula-cines-home", pelicula.idPelicula],
      queryFn: () => cinemaService.getCinesPorPelicula(pelicula.idPelicula),
      enabled: companiaActiva !== "Todas",
      staleTime: 5 * 60 * 1000,
    })),
  });

  const peliculasFiltradas = useMemo(() => {
    if (companiaActiva === "Todas") return peliculasBase;

    return peliculasBase.filter((_, index) => {
      const cines = peliculasCineQueries[index]?.data ?? [];
      const companiaId = Number(companiaActiva);
      return cines.some((cine) => cine.idCompania === companiaId);
    });
  }, [peliculasBase, peliculasCineQueries, companiaActiva]);

  const peliculasParaCards: Movie[] = useMemo(() => {
    return peliculasFiltradas.map((pelicula, index) => ({
      id: pelicula.idPelicula,
      titulo: pelicula.titulo,
      anio: pelicula.fechaEstreno
        ? new Date(pelicula.fechaEstreno).getFullYear()
        : new Date().getFullYear(),
      duracionMin: pelicula.duracionMin,
      clasificacion: pelicula.clasificacion.codigo,
      calificacion: pelicula.calificacionPromedio ?? 0,
      categorias: pelicula.categorias.map((cat) => cat.nombre),
      badge:
        pelicula.calificacionPromedio && pelicula.calificacionPromedio >= 8
          ? "popular"
          : index % 2 === 0
            ? "estreno"
            : "nuevo",
      posterBg:
        POSTER_BACKGROUNDS[pelicula.idPelicula % POSTER_BACKGROUNDS.length],
    }));
  }, [peliculasFiltradas]);

  const handleVerCines = (movieId: number) => {
    navigate(`/peliculas/${movieId}`);
  };

  return (
    <div className="min-h-screen relative">
      <NowPlayingTicker />

      {/* Hero */}
      <div className="relative z-10 text-center px-8 pt-14 pb-4">
        <span
          className="inline-block text-xs font-medium tracking-widest uppercase px-4 py-1 rounded-full mb-4 animate-fade-up"
          style={{
            color: "var(--accent)",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          🍿 Cartelera Guatemala 2026
        </span>
        <h1
          className="animate-fade-up"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(2.6rem,6vw,4.5rem)",
            letterSpacing: ".06em",
            lineHeight: 1,
            background:
              "linear-gradient(135deg, #f1f5f9 30%, var(--blue-glow) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animationDelay: ".1s",
          }}
        >
          Tu próxima película
          <br />
          favorita te espera
        </h1>
        <p
          className="mt-3 mx-auto max-w-md text-sm font-light animate-fade-up"
          style={{ color: "#94a3b8", animationDelay: ".2s" }}
        >
          Compra boletos en línea, elige tu sala y disfruta la mejor experiencia
          de cine.
        </p>
      </div>

      <div
        className="px-8 pt-5 animate-fade-up"
        style={{ maxWidth: "1220px", margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: ".75rem",
          }}
        >
          <select
            value={companiaActiva}
            onChange={(e) => setCompaniaActiva(e.target.value)}
            style={{
              padding: ".75rem .9rem",
              borderRadius: "14px",
              border: "1px solid rgba(96,165,250,0.2)",
              background: "rgba(30,64,175,0.22)",
              color: "#f1f5f9",
              outline: "none",
            }}
          >
            <option value="Todas">Todas las compañías</option>
            {companias.map((compania) => (
              <option key={compania.idCompania} value={compania.idCompania}>
                {compania.nombreCompania}
              </option>
            ))}
          </select>

          <select
            value={categoriaActiva}
            onChange={(e) => setCategoriaActiva(e.target.value)}
            style={{
              padding: ".75rem .9rem",
              borderRadius: "14px",
              border: "1px solid rgba(96,165,250,0.2)",
              background: "rgba(30,64,175,0.22)",
              color: "#f1f5f9",
              outline: "none",
            }}
          >
            {categoriasPills.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>

          <select
            value={clasificacionActiva}
            onChange={(e) => setClasificacionActiva(e.target.value)}
            style={{
              padding: ".75rem .9rem",
              borderRadius: "14px",
              border: "1px solid rgba(96,165,250,0.2)",
              background: "rgba(30,64,175,0.22)",
              color: "#f1f5f9",
              outline: "none",
            }}
          >
            <option value="Todas">Todas las clasificaciones</option>
            {clasificaciones.map((clasificacion) => (
              <option
                key={clasificacion.idClasificacion}
                value={clasificacion.codigo}
              >
                {clasificacion.codigo} · {clasificacion.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SearchBar onSearch={setSearchQuery} />
      <CategoryPills
        categorias={categoriasPills}
        activa={categoriaActiva}
        onSelect={setCategoriaActiva}
      />

      {/* 3 columnas */}
      <div
        className="relative z-10 grid gap-5 px-5 py-6 mx-auto"
        style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "180px 1fr 180px",
          gap: "1.25rem",
          padding: "1.5rem",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Anuncios izquierda */}
        <AdsAside position="left" />

        {/* Películas */}
        <main>
          <div className="flex items-baseline justify-between mb-4">
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.35rem",
                letterSpacing: ".08em",
              }}
            >
              Películas en Cartelera
            </span>
            <span className="text-xs" style={{ color: "#94a3b8" }}>
              {peliculasParaCards.length} película
              {peliculasParaCards.length !== 1 ? "s" : ""} disponible
              {peliculasParaCards.length !== 1 ? "s" : ""}
            </span>
          </div>

          {peliculasLoading ? (
            <div style={{ color: "#94a3b8", padding: "2rem 0" }}>
              ⏳ Cargando películas...
            </div>
          ) : peliculasParaCards.length === 0 ? (
            <div className="text-center py-20" style={{ color: "#94a3b8" }}>
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-sm">
                No se encontraron películas para "
                <strong>{searchQuery || categoriaActiva}</strong>"
              </p>
            </div>
          ) : (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              }}
            >
              {peliculasParaCards.map((movie, i) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  delay={i * 0.05}
                  onVerCines={handleVerCines}
                />
              ))}
            </div>
          )}
        </main>

        {/* Anuncios derecha */}
        <AdsAside position="right" />
      </div>
    </div>
  );
};

export default HomePage;
