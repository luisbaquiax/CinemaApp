import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { adsAdminService } from "../../services/microservice-ads-billing/AdsAdminAnunciosService";
import type { AnuncioResponse } from "../../types/Ads.types";

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const AdminAnunciosPage = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetAnuncio, setTargetAnuncio] = useState<AnuncioResponse | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const { data: anunciosRaw, isLoading } = useQuery<unknown>({
    queryKey: ["admin-ads-anuncios"],
    queryFn: adsAdminService.listAnuncios,
  });

  const anuncios: AnuncioResponse[] = Array.isArray(anunciosRaw)
    ? (anunciosRaw as AnuncioResponse[]).filter(
        (item): item is AnuncioResponse => !!item && typeof item.idAnuncio === "number",
      )
    : [];

  const activeCount = useMemo(
    () => anuncios.filter((anuncio) => anuncio.activo).length,
    [anuncios],
  );

  const anunciosFiltrados = useMemo(() => {
    if (statusFilter === "active") return anuncios.filter((anuncio) => anuncio.activo);
    if (statusFilter === "inactive") return anuncios.filter((anuncio) => !anuncio.activo);
    return anuncios;
  }, [anuncios, statusFilter]);

  const toggleMutation = useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? adsAdminService.activarAnuncio(id) : adsAdminService.desactivarAnuncio(id),
    onSuccess: async (res, vars) => {
      setMsg({
        type: "ok",
        text:
          res.message ||
          `Anuncio ${vars.activar ? "activado" : "desactivado"} correctamente.`,
      });
      await qc.invalidateQueries({ queryKey: ["admin-ads-anuncios"] });
    },
    onError: (err: any, vars) => {
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message ||
          `No se pudo ${vars.activar ? "activar" : "desactivar"} el anuncio.`,
      });
    },
  });

  const openConfirm = (anuncio: AnuncioResponse) => {
    setTargetAnuncio(anuncio);
    setConfirmOpen(true);
    setMsg(null);
  };

  const handleConfirm = () => {
    if (!targetAnuncio) return;

    toggleMutation.mutate({
      id: targetAnuncio.idAnuncio,
      activar: !targetAnuncio.activo,
    });

    setConfirmOpen(false);
  };

  const confirmTitle = targetAnuncio?.activo ? "Desactivar anuncio" : "Activar anuncio";
  const confirmText = targetAnuncio?.activo ? "Desactivar" : "Activar";

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.2rem", display: "flex", gap: ".8rem", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "2rem",
              letterSpacing: ".08em",
              color: "#f1f5f9",
            }}
          >
            Anuncios
          </h1>
          <p style={{ color: "#94a3b8", fontSize: ".85rem" }}>
            {anuncios.length} anuncios registrados · {activeCount} activos · {anuncios.length - activeCount} inactivos
          </p>
        </div>

        <div style={{ minWidth: 220 }}>
          <label style={{ color: "#94a3b8", fontSize: ".78rem" }}>
            Filtrar por estado
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
              style={{
                width: "100%",
                marginTop: ".35rem",
                padding: ".65rem .7rem",
                borderRadius: "8px",
                border: "1px solid rgba(96,165,250,0.2)",
                background: "rgba(15,23,42,0.55)",
                color: "#f1f5f9",
              }}
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </label>
        </div>
      </div>

      {msg && (
        <div
          style={{
            padding: ".75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1rem",
            background: msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: msg.type === "ok" ? "#4ade80" : "var(--accent2)",
            fontSize: ".84rem",
          }}
        >
          {msg.text}
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title={confirmTitle}
        message={`¿Seguro que deseas ${targetAnuncio?.activo ? "desactivar" : "activar"} el anuncio "${targetAnuncio?.titulo ?? ""}"?`}
        confirmText={confirmText}
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmOpen(false);
          setTargetAnuncio(null);
        }}
      />

      {isLoading ? (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>⏳ Cargando anuncios...</div>
      ) : anuncios.length === 0 ? (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
          No hay anuncios registrados.
        </div>
      ) : anunciosFiltrados.length === 0 ? (
        <div style={{ color: "#94a3b8", textAlign: "center", padding: "2rem" }}>
          No hay anuncios para el filtro seleccionado.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "1rem" }}>
          {anunciosFiltrados.map((anuncio) => (
            <article
              key={anuncio.idAnuncio}
              style={{
                borderRadius: "14px",
                padding: "1rem",
                border: `1px solid ${anuncio.activo ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                background: "rgba(30,64,175,0.1)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".5rem" }}>
                <strong style={{ color: "#f1f5f9", fontSize: ".92rem" }}>{anuncio.titulo || `Anuncio #${anuncio.idAnuncio}`}</strong>
                <span
                  style={{
                    fontSize: ".67rem",
                    padding: ".15rem .5rem",
                    borderRadius: 999,
                    color: anuncio.activo ? "#4ade80" : "var(--accent2)",
                    border: `1px solid ${anuncio.activo ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                    background: anuncio.activo ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  }}
                >
                  {anuncio.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              <p style={{ color: "#cbd5e1", fontSize: ".8rem", marginBottom: ".7rem", minHeight: "2.3rem" }}>
                {anuncio.contenidoTexto || "Sin contenido"}
              </p>

              <div style={{ display: "grid", gap: ".25rem", fontSize: ".75rem", color: "#94a3b8", marginBottom: ".75rem" }}>
                <span>Tipo: {anuncio.tipo?.nombre ?? "-"}</span>
                <span>Periodo: {anuncio.periodo?.nombre ?? "-"}</span>
                <span>Usuario: #{anuncio.usuarioId}</span>
                <span>Monto pagado: Q {anuncio.montoPagado ?? 0}</span>
                <span>Inicio: {formatDateTime(anuncio.fechaInicio)}</span>
                <span>Fin: {formatDateTime(anuncio.fechaFin)}</span>
              </div>

              <button
                onClick={() => openConfirm(anuncio)}
                disabled={toggleMutation.isPending}
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: "10px",
                  padding: ".55rem .8rem",
                  cursor: "pointer",
                  color: "#fff",
                  background: anuncio.activo
                    ? "linear-gradient(135deg, #b91c1c, #ef4444)"
                    : "linear-gradient(135deg, #15803d, #22c55e)",
                }}
              >
                {toggleMutation.isPending
                  ? "⏳ Procesando..."
                  : anuncio.activo
                    ? "Desactivar"
                    : "Activar"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAnunciosPage;
