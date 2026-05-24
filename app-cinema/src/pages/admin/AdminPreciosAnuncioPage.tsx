import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { InputGroup } from "../../components/inputs/InputGroup";
import { adsAdminService } from "../../services/microservice-ads-billing/AdsAdminAnunciosService";
import type {
  PeriodoAnuncioResponse,
  PrecioAnuncioRequest,
  PrecioAnuncioResponse,
  TipoAnuncioResponse,
} from "../../types/Ads.types";

type PrecioFormState = {
  tipoId: string;
  periodoId: string;
  precio: string;
};

const emptyForm: PrecioFormState = {
  tipoId: "",
  periodoId: "",
  precio: "",
};

const AdminPreciosAnuncioPage = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState<PrecioFormState>(emptyForm);
  const [editingPrecio, setEditingPrecio] =
    useState<PrecioAnuncioResponse | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const { data: tiposRaw, isLoading: tiposLoading } = useQuery<unknown>({
    queryKey: ["admin-ads-tipos"],
    queryFn: adsAdminService.listTipos,
  });

  const { data: periodosRaw, isLoading: periodosLoading } = useQuery<unknown>({
    queryKey: ["admin-ads-periodos"],
    queryFn: adsAdminService.listPeriodos,
  });

  const { data: preciosRaw, isLoading: preciosLoading } = useQuery<unknown>({
    queryKey: ["admin-ads-precios"],
    queryFn: adsAdminService.listPrecios,
  });

  const tipos: TipoAnuncioResponse[] = Array.isArray(tiposRaw)
    ? (tiposRaw as TipoAnuncioResponse[]).filter(
        (item): item is TipoAnuncioResponse =>
          !!item && typeof item.idTipoAnuncio === "number",
      )
    : [];
  const periodos: PeriodoAnuncioResponse[] = Array.isArray(periodosRaw)
    ? (periodosRaw as PeriodoAnuncioResponse[]).filter(
        (item): item is PeriodoAnuncioResponse =>
          !!item && typeof item.idPeriodoAnuncio === "number",
      )
    : [];
  const precios: PrecioAnuncioResponse[] = Array.isArray(preciosRaw)
    ? (preciosRaw as PrecioAnuncioResponse[]).filter(
        (item): item is PrecioAnuncioResponse =>
          !!item && typeof item.idPrecioAnuncio === "number",
      )
    : [];

  const createMutation = useMutation({
    mutationFn: (payload: PrecioAnuncioRequest) =>
      adsAdminService.createPrecio(payload),
    onSuccess: async (res) => {
      setMsg({
        type: "ok",
        text: res.message || "Precio creado correctamente.",
      });
      setForm(emptyForm);
      await qc.invalidateQueries({ queryKey: ["admin-ads-precios"] });
    },
    onError: (err: any) => {
      setMsg({
        type: "err",
        text: err?.response?.data?.message || "No se pudo crear el precio.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: PrecioAnuncioRequest;
    }) => adsAdminService.updatePrecio(id, payload),
    onSuccess: async (res) => {
      setMsg({
        type: "ok",
        text: res.message || "Precio actualizado correctamente.",
      });
      setEditingPrecio(null);
      setForm(emptyForm);
      await qc.invalidateQueries({ queryKey: ["admin-ads-precios"] });
    },
    onError: (err: any) => {
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message || "No se pudo actualizar el precio.",
      });
    },
  });

  const canSubmit = useMemo(
    () =>
      !!form.tipoId &&
      !!form.periodoId &&
      !!form.precio &&
      Number(form.precio) > 0,
    [form],
  );

  const handleCreate = () => {
    if (!canSubmit) return;

    createMutation.mutate({
      tipoId: Number(form.tipoId),
      periodoId: Number(form.periodoId),
      precio: Number(form.precio),
    });
  };

  const prepareEdit = (precio: PrecioAnuncioResponse) => {
    const tipoId = precio?.tipo?.idTipoAnuncio;
    const periodoId = precio?.periodo?.idPeriodoAnuncio;

    if (!tipoId || !periodoId) {
      setMsg({
        type: "err",
        text: "Este precio no tiene tipo/periodo válido para editar.",
      });
      return;
    }

    setEditingPrecio(precio);
    setMsg(null);
    setForm({
      tipoId: String(tipoId),
      periodoId: String(periodoId),
      precio: String(precio.precio),
    });
  };

  const handleConfirmUpdate = () => {
    if (!editingPrecio || !canSubmit) {
      setConfirmOpen(false);
      return;
    }

    updateMutation.mutate({
      id: editingPrecio.idPrecioAnuncio,
      payload: {
        tipoId: Number(form.tipoId),
        periodoId: Number(form.periodoId),
        precio: Number(form.precio),
      },
    });

    setConfirmOpen(false);
  };

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
          Precios de anuncios
        </h1>
        <p style={{ fontSize: ".85rem", color: "#94a3b8" }}>
          Configura los precios según tipo y periodo de anuncio.
        </p>
      </div>

      {msg && (
        <div
          style={{
            padding: ".75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1rem",
            background:
              msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: msg.type === "ok" ? "#4ade80" : "var(--accent2)",
            fontSize: ".84rem",
          }}
        >
          {msg.text}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 360px) minmax(0, 1fr)",
          gap: "1rem",
        }}
      >
        <section
          style={{
            border: "1px solid rgba(96,165,250,0.15)",
            borderRadius: "12px",
            padding: "1rem",
            background: "rgba(30,64,175,0.1)",
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginBottom: ".8rem" }}>
            {editingPrecio ? "Editar precio" : "Crear precio"}
          </h3>

          <div style={{ display: "grid", gap: ".7rem" }}>
            <label style={{ color: "#94a3b8", fontSize: ".78rem" }}>
              Tipo de anuncio
              <select
                value={form.tipoId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tipoId: e.target.value }))
                }
                disabled={tiposLoading}
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
                <option value="">Selecciona un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.idTipoAnuncio} value={tipo.idTipoAnuncio}>
                    {tipo.nombre ?? `Tipo #${tipo.idTipoAnuncio}`}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ color: "#94a3b8", fontSize: ".78rem" }}>
              Periodo de anuncio
              <select
                value={form.periodoId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, periodoId: e.target.value }))
                }
                disabled={periodosLoading}
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
                <option value="">Selecciona un periodo</option>
                {periodos.map((periodo) => (
                  <option
                    key={periodo.idPeriodoAnuncio}
                    value={periodo.idPeriodoAnuncio}
                  >
                    {periodo.nombre ?? `Periodo #${periodo.idPeriodoAnuncio}`} ·{" "}
                    {periodo.dias ?? 0} días
                  </option>
                ))}
              </select>
            </label>

            <InputGroup
              label="Precio (GTQ)"
              type="number"
              minValue={0.01}
              value={form.precio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, precio: e.target.value }))
              }
              placeholder="0.00"
              required
            />

            {!editingPrecio ? (
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending || !canSubmit}
                style={{
                  padding: ".55rem .8rem",
                  borderRadius: "8px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                  color: "#fff",
                }}
              >
                {createMutation.isPending ? "⏳ Creando..." : "Crear precio"}
              </button>
            ) : (
              <div style={{ display: "flex", gap: ".6rem" }}>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={updateMutation.isPending || !canSubmit}
                  style={{
                    flex: 1,
                    padding: ".55rem .8rem",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                    color: "#fff",
                  }}
                >
                  {updateMutation.isPending
                    ? "⏳ Guardando..."
                    : "Guardar cambios"}
                </button>
                <button
                  onClick={() => {
                    setEditingPrecio(null);
                    setForm(emptyForm);
                  }}
                  style={{
                    padding: ".55rem .8rem",
                    borderRadius: "8px",
                    border: "1px solid rgba(96,165,250,0.2)",
                    background: "transparent",
                    color: "#cbd5e1",
                  }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            border: "1px solid rgba(96,165,250,0.15)",
            borderRadius: "12px",
            padding: "1rem",
            background: "rgba(15,23,42,0.45)",
          }}
        >
          <h3 style={{ color: "#f1f5f9", marginBottom: ".8rem" }}>
            Listado de precios
          </h3>

          {preciosLoading ? (
            <div style={{ color: "#94a3b8" }}>⏳ Cargando precios...</div>
          ) : !precios.length ? (
            <div style={{ color: "#94a3b8" }}>
              Aún no hay precios configurados.
            </div>
          ) : (
            <div style={{ display: "grid", gap: ".6rem" }}>
              {precios.map((precio) => (
                <div
                  key={precio.idPrecioAnuncio}
                  style={{
                    border: "1px solid rgba(96,165,250,0.1)",
                    borderRadius: "10px",
                    padding: ".8rem",
                    background: "rgba(30,41,59,0.45)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ color: "#f1f5f9", fontWeight: 600 }}>
                        {precio.tipo?.nombre ?? "Tipo no definido"} ·{" "}
                        {precio.periodo?.nombre ?? "Periodo no definido"}
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: ".78rem",
                          marginTop: ".2rem",
                        }}
                      >
                        {precio.periodo?.dias ?? 0} días · Actualizado:{" "}
                        {precio.updatedAt
                          ? new Date(precio.updatedAt).toLocaleString("es-ES")
                          : "—"}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".75rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#4ade80",
                          fontWeight: 700,
                          fontSize: ".95rem",
                        }}
                      >
                        Q {Number(precio.precio).toFixed(2)}
                      </span>
                      <button
                        onClick={() => prepareEdit(precio)}
                        style={{
                          padding: ".4rem .7rem",
                          borderRadius: "8px",
                          border: "none",
                          background: "rgba(59,130,246,0.2)",
                          color: "#bfdbfe",
                          cursor: "pointer",
                        }}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Confirmar actualización"
        message="¿Deseas guardar los cambios del precio de anuncio?"
        confirmText="Guardar"
        cancelText="Cancelar"
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminPreciosAnuncioPage;
