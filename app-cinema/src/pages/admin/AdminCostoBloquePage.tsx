import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InputGroup } from "../../components/inputs/InputGroup";
import { useAuth } from "../../hooks/UseAuth";
import { cinemaService } from "../../services/microservice-cinema/CinemaService";
import { adsAdminService } from "../../services/microservice-ads-billing/AdsAdminAnunciosService";
import type {
    CostoBloqueoAnuncioResponse,
    CostoBloqueoAnuncioRequest,
    CostoBloqueoAnuncioUpdateRequest,
    MessageSuccess,
} from "../../types/Ads.types";
import type { CompaniaResponse } from "../../types/CinemaCore.types";

const AdminCostoBloquePage: React.FC = () => {
    const qc = useQueryClient();
    const { auth } = useAuth();
    const [companiaId, setCompaniaId] = useState<string>("");
    const [costoDia, setCostoDia] = useState<string>("");
    const [editingCostoId, setEditingCostoId] = useState<number | null>(null);
    const [filterCompaniaId, setFilterCompaniaId] = useState<string>("all");
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const { data: companiasRaw, isLoading: companiasLoading } = useQuery({
        queryKey: ["admin-costo-bloque-companias"],
        queryFn: cinemaService.getCompaniasActivas,
    });

    const companias: CompaniaResponse[] = Array.isArray(companiasRaw)
        ? (companiasRaw as CompaniaResponse[]).filter(c => !!c && typeof c.idCompania === 'number') : [];

    const { data: costosRaw, isLoading: costosLoading } = useQuery<unknown>({
        queryKey: ["admin-costo-bloque-list"],
        queryFn: adsAdminService.listCostosBloqueo,
    });

    const costos: CostoBloqueoAnuncioResponse[] = Array.isArray(costosRaw)
        ? (costosRaw as CostoBloqueoAnuncioResponse[]).filter(
            (item): item is CostoBloqueoAnuncioResponse =>
                !!item
                && typeof item.idCostoBloqueoAnuncio === "number"
                && typeof item.companiaId === "number",
        )
        : [];

    const companiasById = useMemo(() => {
        return new Map(companias.map(compania => [compania.idCompania, compania.nombreCompania]));
    }, [companias]);

    const costosFiltrados = useMemo(() => {
        if (filterCompaniaId === "all") return costos;
        const id = Number(filterCompaniaId);
        if (!Number.isFinite(id)) return costos;
        return costos.filter(item => item.companiaId === id);
    }, [costos, filterCompaniaId]);

    const createMutation = useMutation({
        mutationFn: (payload: CostoBloqueoAnuncioRequest) => adsAdminService.createCostoBloque(payload),
        onSuccess: async (res: MessageSuccess) => {
            setMsg({ type: "ok", text: res.message || "Costo creado correctamente." });
            setCompaniaId("");
            setCostoDia("");
            setEditingCostoId(null);
            await qc.invalidateQueries({ queryKey: ["admin-costo-bloque-companias"] });
            await qc.invalidateQueries({ queryKey: ["admin-costo-bloque-list"] });
        },
        onError: (err: any) => {
            setMsg({ type: "err", text: err?.response?.data?.message || "No se pudo crear el costo." });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }:
            { id: number; payload: CostoBloqueoAnuncioUpdateRequest }) => adsAdminService.updateCostoBloque(id, payload),
        onSuccess: async (res: MessageSuccess) => {
            setMsg({ type: "ok", text: res.message || "Costo actualizado correctamente." });
            setEditingCostoId(null);
            setCompaniaId("");
            setCostoDia("");
            await qc.invalidateQueries({ queryKey: ["admin-costo-bloque-companias"] });
            await qc.invalidateQueries({ queryKey: ["admin-costo-bloque-list"] });
        },
        onError: (err: any) => {
            setMsg({ type: "err", text: err?.response?.data?.message || "No se pudo actualizar el costo." });
        },
    });

    const canCreate = useMemo(() => {
        return !editingCostoId && !!companiaId && !!costoDia && Number(costoDia) > 0 && !!auth?.token;
    }, [companiaId, costoDia, auth?.token]);

    const canUpdate = useMemo(() => {
        return !!editingCostoId && !!costoDia && Number(costoDia) > 0 && !!auth?.token;
    }, [editingCostoId, costoDia, auth?.token]);

    const handleCreate = () => {
        if (!canCreate) return;
        const payload: CostoBloqueoAnuncioRequest = {
            companiaId: Number(companiaId),
            costoDia: Number(costoDia),
            token: auth!.token,
        };
        createMutation.mutate(payload);
    };

    const handleUpdate = () => {
        if (!canUpdate) return;
        updateMutation.mutate({ id: editingCostoId!, payload: { costoDia: Number(costoDia), token: auth!.token } });
    };

    const handleEditFromList = (item: CostoBloqueoAnuncioResponse) => {
        setEditingCostoId(item.idCostoBloqueoAnuncio);
        setCompaniaId(String(item.companiaId));
        setCostoDia(String(item.costoDia));
        setMsg(null);
    };

    const resetForm = () => {
        setEditingCostoId(null);
        setCompaniaId("");
        setCostoDia("");
    };

    return (
        <div>
            <h2 style={{ color: '#f1f5f9', marginBottom: '.8rem' }}>Costo Bloqueo - Administración</h2>

            <div style={{ padding: '1rem', background: 'rgba(30,64,175,0.08)', borderRadius: 8 }}>
                <div style={{ display: 'grid', gap: '.7rem' }}>
                    <label style={{ color: '#94a3b8', fontSize: '.78rem' }}>
                        Compañía
                        <select
                            value={companiaId}
                            onChange={(e) => setCompaniaId(e.target.value)}
                            disabled={companiasLoading}
                            style={{
                                width: '100%',
                                marginTop: '.35rem',
                                padding: '.65rem .7rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(96,165,250,0.2)',
                                background: 'rgba(15,23,42,0.55)',
                                color: '#f1f5f9',
                            }}
                        >
                            <option value="">Selecciona una compañía</option>
                            {companias.map(c => (
                                <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania ?? `Compañía #${c.idCompania}`}</option>
                            ))}
                        </select>
                    </label>

                    <InputGroup
                        label="Costo por día (GTQ)"
                        type="number"
                        value={costoDia}
                        onChange={(e) => setCostoDia(e.target.value)}
                        placeholder="0.00"
                        required
                    />

                    {editingCostoId && (
                        <div style={{ color: '#93c5fd', fontSize: '.82rem' }}>
                            Editando costo #{editingCostoId}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '.6rem' }}>
                        <button
                            onClick={handleCreate}
                            disabled={createMutation.isPending || !canCreate}
                            style={{
                                padding: '.55rem .8rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                                color: '#fff',
                            }}
                        >
                            {createMutation.isPending ? '⏳ Enviando...' : 'Crear Costo'}
                        </button>

                        <button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending || !canUpdate}
                            style={{
                                padding: '.55rem .8rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(96,165,250,0.15)',
                                background: 'transparent',
                                color: '#f1f5f9',
                            }}
                        >
                            {updateMutation.isPending ? '⏳ Actualizando...' : 'Actualizar Costo'}
                        </button>

                        <button
                            onClick={resetForm}
                            style={{
                                padding: '.55rem .8rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(96,165,250,0.15)',
                                background: 'transparent',
                                color: '#94a3b8',
                            }}
                        >
                            Limpiar
                        </button>
                    </div>

                    {msg && (
                        <div style={{ marginTop: '.6rem', color: msg.type === 'ok' ? 'var(--green)' : 'var(--accent2)' }}>
                            {msg.text}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(30,64,175,0.08)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.8rem', flexWrap: 'wrap', marginBottom: '.8rem' }}>
                    <h3 style={{ color: '#f1f5f9', marginBottom: 0 }}>Costos de Bloqueo Registrados</h3>

                    <div style={{ minWidth: 220 }}>
                        <label style={{ color: '#94a3b8', fontSize: '.76rem' }}>
                            Filtrar por compañía
                            <select
                                value={filterCompaniaId}
                                onChange={(e) => setFilterCompaniaId(e.target.value)}
                                style={{
                                    width: '100%',
                                    marginTop: '.3rem',
                                    padding: '.55rem .65rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(96,165,250,0.2)',
                                    background: 'rgba(15,23,42,0.55)',
                                    color: '#f1f5f9',
                                }}
                            >
                                <option value="all">Todas las compañías</option>
                                {companias.map((c) => (
                                    <option key={c.idCompania} value={c.idCompania}>{c.nombreCompania ?? `Compañía #${c.idCompania}`}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {costosLoading ? (
                    <div style={{ color: '#94a3b8' }}>⏳ Cargando costos...</div>
                ) : costos.length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>No hay costos de bloqueo registrados.</div>
                ) : costosFiltrados.length === 0 ? (
                    <div style={{ color: '#94a3b8' }}>No hay costos para la compañía seleccionada.</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
                            <thead>
                                <tr style={{ color: '#93c5fd', fontSize: '.8rem', textAlign: 'left' }}>
                                    <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>ID</th>
                                    <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Compañía</th>
                                    <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Costo/Día</th>
                                    <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Actualizado</th>
                                    <th style={{ padding: '.5rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.15)' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costosFiltrados.map((item) => (
                                    <tr key={item.idCostoBloqueoAnuncio} style={{ color: '#e2e8f0', fontSize: '.84rem' }}>
                                        <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                                            {item.idCostoBloqueoAnuncio}
                                        </td>
                                        <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                                            {companiasById.get(item.companiaId) ?? `Compañía #${item.companiaId}`}
                                        </td>
                                        <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                                            Q {item.costoDia}
                                        </td>
                                        <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
                                        </td>
                                        <td style={{ padding: '.55rem .6rem', borderBottom: '1px solid rgba(96,165,250,0.08)' }}>
                                            <button
                                                onClick={() => handleEditFromList(item)}
                                                style={{
                                                    padding: '.35rem .6rem',
                                                    borderRadius: 8,
                                                    border: '1px solid rgba(96,165,250,0.15)',
                                                    background: 'transparent',
                                                    color: '#93c5fd',
                                                }}
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCostoBloquePage;
