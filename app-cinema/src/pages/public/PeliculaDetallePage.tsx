import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, PencilLine, Star, Trash2 } from "lucide-react";
import { cinemaService } from "../../services/microservice-cinema/CinemaService";
import { cinemaUsuarioService } from "../../services/microservice-cinema/CinemaUsuarioService";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { InputGroup } from "../../components/inputs/InputGroup";
import { useAuth } from "../../hooks/UseAuth";
import PosterCarousel from "../../components/ui/PosterCarousel";
import type {
  ComentarioPeliculaRequest,
  ComentarioPeliculaResponse,
  PeliculaPostersResponse,
} from "../../types/CinemaCore.types";

type CommentFormState = {
  comentario: string;
  calificacion: string;
};

type PendingAction =
  | { type: "update"; comentario: ComentarioPeliculaResponse }
  | { type: "delete"; comentario: ComentarioPeliculaResponse };

const emptyCommentForm: CommentFormState = {
  comentario: "",
  calificacion: "5",
};

const PeliculaDetallePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const qc = useQueryClient();
  const peliculaId = Number(id);

  const [commentForm, setCommentForm] =
    useState<CommentFormState>(emptyCommentForm);
  const [editingComment, setEditingComment] =
    useState<ComentarioPeliculaResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["pelicula-detalle", id],
    queryFn: () => cinemaService.getPeliculaById(peliculaId),
    enabled: !!id,
  });

  const { data: postersData, isLoading: postersLoading } = useQuery({
    queryKey: ["posters-pelicula", id],
    queryFn: () => cinemaService.getPostersByPelicula(peliculaId),
    enabled: !!id,
  });

  const { data: comentarios = [], isLoading: comentariosLoading } = useQuery({
    queryKey: ["comentarios-pelicula", id],
    queryFn: () => cinemaService.getComentariosByPelicula(peliculaId),
    enabled: !!id,
  });

  useEffect(() => {
    setCommentForm(emptyCommentForm);
    setEditingComment(null);
    setPendingAction(null);
    setMsg(null);
  }, [id]);

  const createMutation = useMutation({
    mutationFn: (payload: ComentarioPeliculaRequest) =>
      cinemaUsuarioService.crearComentarioPelicula(peliculaId, payload),
    onSuccess: (res) => {
      setMsg({
        type: "ok",
        text: res.message || "Comentario agregado correctamente.",
      });
      setCommentForm(emptyCommentForm);
      qc.invalidateQueries({ queryKey: ["comentarios-pelicula", id] });
    },
    onError: (err: any) =>
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message || "No se pudo agregar el comentario.",
      }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: ComentarioPeliculaRequest) =>
      cinemaUsuarioService.actualizarComentarioPelicula(
        editingComment!.idComentarioPelicula,
        payload,
      ),
    onSuccess: (res) => {
      setMsg({
        type: "ok",
        text: res.message || "Comentario actualizado correctamente.",
      });
      setEditingComment(null);
      setCommentForm(emptyCommentForm);
      qc.invalidateQueries({ queryKey: ["comentarios-pelicula", id] });
    },
    onError: (err: any) =>
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message ||
          "No se pudo actualizar el comentario.",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (comentario: ComentarioPeliculaResponse) =>
      cinemaUsuarioService.eliminarComentarioPelicula(
        comentario.idComentarioPelicula,
        auth!.idUsuario,
      ),
    onSuccess: (res) => {
      setMsg({
        type: "ok",
        text: res.message || "Comentario eliminado correctamente.",
      });
      setEditingComment(null);
      qc.invalidateQueries({ queryKey: ["comentarios-pelicula", id] });
    },
    onError: (err: any) =>
      setMsg({
        type: "err",
        text:
          err?.response?.data?.message || "No se pudo eliminar el comentario.",
      }),
  });

  const handleCreate = () => {
    if (!auth?.idUsuario) return;
    createMutation.mutate({
      idPelicula: peliculaId,
      idUsuario: auth.idUsuario,
      comentario: commentForm.comentario.trim(),
      calificacion: Number(commentForm.calificacion),
      token: auth.token,
    });
  };

  const handleConfirm = () => {
    if (!pendingAction) return;

    setPendingAction(null);

    const payload: ComentarioPeliculaRequest = {
      idPelicula: peliculaId,
      idUsuario: auth!.idUsuario,
      comentario: commentForm.comentario.trim(),
      calificacion: Number(commentForm.calificacion),
      token: auth!.token,
    };

    if (pendingAction.type === "update") {
      updateMutation.mutate(payload);
      return;
    }

    deleteMutation.mutate(pendingAction.comentario);
  };

  if (isLoading) {
    return (
      <div style={{ color: "#94a3b8", padding: "2rem" }}>
        ⏳ Cargando detalle...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ color: "var(--accent2)", padding: "2rem" }}>
        No se encontró la película.
      </div>
    );
  }

  const { pelicula, actores } = data;
  const posters: PeliculaPostersResponse[] = postersData || [];
  const confirmTitle =
    pendingAction?.type === "update"
      ? "Actualizar comentario"
      : "Eliminar comentario";
  const confirmMessage =
    pendingAction?.type === "update"
      ? "¿Confirmas que deseas guardar los cambios de tu comentario?"
      : "¿Confirmas que deseas eliminar este comentario?";

  return (
    <div
      style={{ maxWidth: "980px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: ".08em",
            color: "#f1f5f9",
          }}
        >
          {pelicula.titulo}
        </h1>
        <p style={{ fontSize: ".85rem", color: "#94a3b8" }}>
          {pelicula.clasificacion?.codigo ?? pelicula.clasificacion?.nombre} ·{" "}
          {pelicula.duracionMin} min
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: ".8fr 1.2fr",
          gap: "2rem",
        }}
      >
        <div>
          <PosterCarousel posters={posters} isLoading={postersLoading} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            style={{
              borderRadius: "16px",
              padding: "1.5rem",
              background: "rgba(30,64,175,0.12)",
              border: "1px solid rgba(96,165,250,0.15)",
            }}
          >
            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.7,
                marginBottom: "1rem",
              }}
            >
              {pelicula.sinopsis || "Sinopsis no disponible."}
            </p>

            <div
              style={{
                display: "flex",
                gap: ".4rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              {pelicula.categorias?.map((cat) => (
                <span
                  key={cat.idCategoria}
                  style={{
                    fontSize: ".65rem",
                    padding: ".2rem .5rem",
                    borderRadius: "999px",
                    background: "rgba(96,165,250,0.12)",
                    color: "var(--blue-glow)",
                  }}
                >
                  {cat.nombre}
                </span>
              ))}
            </div>

            <button
              onClick={() =>
                navigate(`/peliculas/${pelicula.idPelicula}/cines`)
              }
              style={{
                padding: ".6rem 1rem",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                color: "#fff",
                width: "100%",
              }}
            >
              Ver cines disponibles
            </button>
          </div>

          <div
            style={{
              borderRadius: "16px",
              padding: "1.5rem",
              background: "rgba(15,23,42,0.35)",
              border: "1px solid rgba(96,165,250,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                color: "#f1f5f9",
                marginBottom: ".75rem",
              }}
            >
              <MessageCircle size={16} />
              <span>Comentarios de la película</span>
            </div>

            {msg && (
              <div
                style={{
                  padding: ".75rem 1rem",
                  borderRadius: "10px",
                  marginBottom: "1rem",
                  background:
                    msg.type === "ok"
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(239,68,68,0.1)",
                  border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: msg.type === "ok" ? "#4ade80" : "var(--accent2)",
                  fontSize: ".84rem",
                }}
              >
                {msg.text}
              </div>
            )}

            {auth?.idUsuario ? (
              <div
                style={{
                  display: "grid",
                  gap: ".9rem",
                  marginBottom: "1.25rem",
                }}
              >
                <InputGroup
                  label="Calificación"
                  type="number"
                  minValue={1}
                  maxValue={5}
                  value={commentForm.calificacion}
                  onChange={(e) =>
                    setCommentForm((prev) => ({
                      ...prev,
                      calificacion: e.target.value,
                    }))
                  }
                  required
                />
                <div>
                  <label
                    style={{
                      color: "#94a3b8",
                      fontSize: ".78rem",
                      display: "block",
                      marginBottom: ".4rem",
                    }}
                  >
                    Comentario *
                  </label>
                  <textarea
                    value={commentForm.comentario}
                    onChange={(e) =>
                      setCommentForm((prev) => ({
                        ...prev,
                        comentario: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Escribe tu opinión..."
                    style={{
                      width: "100%",
                      resize: "vertical",
                      padding: ".75rem .9rem",
                      borderRadius: "12px",
                      border: "1px solid rgba(96,165,250,0.2)",
                      background: "rgba(30,64,175,0.15)",
                      color: "#f1f5f9",
                      outline: "none",
                    }}
                  />
                </div>

                <div
                  style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}
                >
                  <button
                    onClick={handleCreate}
                    disabled={
                      createMutation.isPending || !commentForm.comentario.trim()
                    }
                    style={{
                      padding: ".6rem .9rem",
                      borderRadius: "10px",
                      border: "none",
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                      color: "#fff",
                    }}
                  >
                    {createMutation.isPending
                      ? "⏳ Publicando..."
                      : "Publicar comentario"}
                  </button>

                  {editingComment && (
                    <button
                      onClick={() =>
                        setPendingAction({
                          type: "update",
                          comentario: editingComment,
                        })
                      }
                      disabled={
                        updateMutation.isPending ||
                        !commentForm.comentario.trim()
                      }
                      style={{
                        padding: ".6rem .9rem",
                        borderRadius: "10px",
                        border: "none",
                        cursor: "pointer",
                        background: "rgba(59,130,246,0.18)",
                        color: "#bfdbfe",
                      }}
                    >
                      {updateMutation.isPending
                        ? "⏳ Actualizando..."
                        : "Guardar cambios"}
                    </button>
                  )}

                  {editingComment && (
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setCommentForm(emptyCommentForm);
                      }}
                      style={{
                        padding: ".6rem .9rem",
                        borderRadius: "10px",
                        border: "1px solid rgba(96,165,250,0.15)",
                        background: "transparent",
                        color: "#cbd5e1",
                      }}
                    >
                      Cancelar edición
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: ".85rem",
                  marginBottom: "1rem",
                }}
              >
                Inicia sesión para comentar y calificar esta película.
              </div>
            )}

            {comentariosLoading ? (
              <div style={{ color: "#94a3b8" }}>⏳ Cargando comentarios...</div>
            ) : comentarios.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                Todavía no hay comentarios para esta película.
              </div>
            ) : (
              <div style={{ display: "grid", gap: ".75rem" }}>
                {comentarios.map((comentario) => {
                  const esMio = comentario.idUsuario === auth?.idUsuario;
                  return (
                    <div
                      key={comentario.idComentarioPelicula}
                      style={{
                        borderRadius: "12px",
                        padding: "1rem",
                        background: "rgba(30,64,175,0.12)",
                        border: "1px solid rgba(96,165,250,0.12)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "1rem",
                          marginBottom: ".5rem",
                        }}
                      >
                        <div>
                          <div style={{ color: "#f1f5f9", fontWeight: 600 }}>
                            ⭐ {comentario.calificacion}/5{" "}
                            {esMio && (
                              <span
                                style={{
                                  color: "var(--blue-glow)",
                                  fontSize: ".75rem",
                                }}
                              >
                                · Tu comentario
                              </span>
                            )}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: ".76rem" }}>
                            {new Date(comentario.createdAt).toLocaleString(
                              "es-ES",
                            )}
                          </div>
                        </div>
                        {esMio && (
                          <div style={{ display: "flex", gap: ".4rem" }}>
                            <button
                              onClick={() => {
                                setEditingComment(comentario);
                                setCommentForm({
                                  comentario: comentario.comentario,
                                  calificacion: String(comentario.calificacion),
                                });
                              }}
                              style={{
                                padding: ".35rem .55rem",
                                borderRadius: "8px",
                                border: "none",
                                background: "rgba(59,130,246,0.2)",
                                color: "#bfdbfe",
                                cursor: "pointer",
                              }}
                            >
                              <PencilLine size={14} />
                            </button>
                            <button
                              onClick={() =>
                                setPendingAction({ type: "delete", comentario })
                              }
                              style={{
                                padding: ".35rem .55rem",
                                borderRadius: "8px",
                                border: "none",
                                background: "rgba(239,68,68,0.16)",
                                color: "#fca5a5",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      <p
                        style={{
                          color: "#cbd5e1",
                          fontSize: ".9rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {comentario.comentario}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              borderRadius: "16px",
              padding: "1.5rem",
              background: "rgba(15,23,42,0.35)",
              border: "1px solid rgba(96,165,250,0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: ".5rem",
                color: "#f1f5f9",
                marginBottom: ".75rem",
              }}
            >
              <Star size={16} color="#fcd34d" />
              <span>Calificación: {pelicula.calificacionPromedio ?? "—"}</span>
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: ".85rem",
                marginBottom: ".75rem",
              }}
            >
              <strong style={{ color: "#f1f5f9" }}>Director:</strong>{" "}
              {pelicula.director || "—"}
            </div>

            <div
              style={{
                color: "#94a3b8",
                fontSize: ".85rem",
                marginBottom: ".75rem",
              }}
            >
              <strong style={{ color: "#f1f5f9" }}>Estreno:</strong>{" "}
              {pelicula.fechaEstreno || "—"}
            </div>

            <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
              <strong style={{ color: "#f1f5f9" }}>Actores:</strong>
              <div
                style={{
                  marginTop: ".5rem",
                  display: "grid",
                  gap: ".5rem",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                {actores?.length ? (
                  actores.map((actor, index) => (
                    <div
                      key={`${actor.actor}-${index}`}
                      style={{
                        padding: ".65rem .75rem",
                        borderRadius: "10px",
                        background: "rgba(30,64,175,0.12)",
                      }}
                    >
                      <div style={{ color: "#f1f5f9", fontSize: ".85rem" }}>
                        {actor.actor}
                      </div>
                      <div style={{ fontSize: ".75rem", color: "#94a3b8" }}>
                        Personaje: {actor.personaje}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      marginTop: ".5rem",
                      color: "#94a3b8",
                      fontSize: ".85rem",
                    }}
                  >
                    Sin reparto registrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!pendingAction}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={
          pendingAction?.type === "update" ? "Actualizar" : "Eliminar"
        }
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
};

export default PeliculaDetallePage;
