import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cinemaService } from "../../services/microservice-cinema/CinemaService";
import type { FuncionResponse } from "../../types/CinemaCore.types";

type TickerItem = {
  id: number;
  titulo: string;
  detalle: string;
  horarios: string;
};

const formatHour = (value: string) => {
  const fecha = new Date(value);
  if (Number.isNaN(fecha.getTime())) return value;
  return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const NowPlayingTicker = () => {
  const {
    data: funcionesRaw,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["funciones-activas"],
    queryFn: cinemaService.getFuncionesActivas,
  });

  const funciones: FuncionResponse[] = Array.isArray(funcionesRaw)
    ? funcionesRaw
    : [];

  const items = useMemo<TickerItem[]>(() => {
    return funciones
      .slice()
      .sort(
        (a, b) =>
          new Date(a.fechaHoraInicio).getTime() -
          new Date(b.fechaHoraInicio).getTime(),
      )
      .map((funcion) => ({
        id: funcion.id,
        titulo: funcion.pelicula?.titulo ?? "Película sin título",
        detalle: funcion.sala?.nombre
          ? `Sala ${funcion.sala.nombre}`
          : "Sala sin nombre",
        horarios: `${formatHour(funcion.fechaHoraInicio)} - ${formatHour(funcion.fechaHoraFin)}`,
      }));
  }, [funciones]);

  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="flex items-center gap-3 overflow-hidden px-6 py-2"
      style={{
        background: "rgba(30,64,175,0.12)",
        borderTop: "1px solid rgba(96,165,250,0.08)",
        borderBottom: "1px solid rgba(96,165,250,0.08)",
      }}
    >
      <span
        className="text-xs font-medium tracking-widest uppercase whitespace-nowrap pr-3"
        style={{
          color: "var(--accent)",
          borderRight: "1px solid rgba(245,158,11,0.3)",
        }}
      >
        🎞 En cartelera
      </span>

      <div className="flex gap-6 whitespace-nowrap animate-scroll-left">
        {isLoading ? (
          <span className="text-xs" style={{ color: "#94a3b8" }}>
            Cargando funciones...
          </span>
        ) : isError ? (
          <span className="text-xs" style={{ color: "#f87171" }}>
            No se pudieron cargar las funciones.
          </span>
        ) : doubled.length === 0 ? (
          <span className="text-xs" style={{ color: "#94a3b8" }}>
            No hay funciones activas en este momento.
          </span>
        ) : (
          doubled.map((item, index) => (
            <span
              key={`${item.id}-${index}`}
              className="text-xs"
              style={{ color: "#94a3b8" }}
            >
              <strong style={{ color: "var(--blue-glow)" }}>
                {item.titulo}
              </strong>{" "}
              — {item.detalle} · {item.horarios}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

export default NowPlayingTicker;
