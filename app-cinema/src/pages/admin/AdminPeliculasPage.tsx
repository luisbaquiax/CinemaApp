import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Film, PencilLine, Power, Plus, X } from "lucide-react";
import ConfirmModal from "../../components/modal/ConfirmModal";
import { cinemaService } from "../../services/microservice-cinema/CinemaService";
import { InputGroup } from "../../components/inputs/InputGroup";
import type {
  CategoriaResponse,
  ClasificacionResponse,
  PeliculaActoresResponse,
  PeliculaRequest,
  PeliculaResponse,
  PelicualUpdateRequest,
  PeliculaCastRequest,
} from "../../types/CinemaCore.types";

type FiltroEstado = "todas" | "activas" | "inactivas";

type MovieFormState = {
  titulo: string;
  portadaUrl: string;
  sinopsis: string;
  duracionMin: string;
  director: string;
  fechaEstreno: string;
  idClasificacion: string;
  activo: boolean;
};

const emptyMovieForm: MovieFormState = {
  titulo: "",
  portadaUrl: "",
  sinopsis: "",
  duracionMin: "",
  director: "",
  fechaEstreno: "",
  idClasificacion: "",
  activo: true,
};

const mapMovieToForm = (movie: PeliculaResponse): MovieFormState => ({
  titulo: movie.titulo ?? "",
  portadaUrl: movie.portadaUrl ?? "",
  sinopsis: movie.sinopsis ?? "",
  duracionMin: movie.duracionMin?.toString() ?? "",
  director: movie.director ?? "",
  fechaEstreno: movie.fechaEstreno ?? "",
  idClasificacion: movie.clasificacion?.idClasificacion?.toString() ?? "",
  activo: movie.activo,
});

const RequiredTag = ({ text = "Campo obligatorio" }: { text?: string }) => (
  <span
    style={{
      display: "block",
      marginTop: ".35rem",
      fontSize: ".72rem",
      color: "#f87171",
    }}
  >
    {text}
  </span>
);

type TouchedFields = {
  titulo: boolean;
  sinopsis: boolean;
  duracionMin: boolean;
  director: boolean;
  fechaEstreno: boolean;
  idClasificacion: boolean;
  categorias: boolean;
};

const emptyTouchedFields: TouchedFields = {
  titulo: false,
  sinopsis: false,
  duracionMin: false,
  director: false,
  fechaEstreno: false,
  idClasificacion: false,
  categorias: false,
};

type RelationModalMode = "categorias" | "actores" | "agregar-categoria";

const AdminPeliculasPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todas");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<PeliculaResponse | null>(
    null,
  );
  const [form, setForm] = useState<MovieFormState>(emptyMovieForm);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [actorForm, setActorForm] = useState({ actor: "", personaje: "" });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPrincipal, setPosterPrincipal] = useState(true);
  const [touchedFields, setTouchedFields] =
    useState<TouchedFields>(emptyTouchedFields);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmActorId, setConfirmActorId] = useState<number | null>(null);
  const [confirmActorName, setConfirmActorName] = useState("");
  const [relationModalOpen, setRelationModalOpen] = useState(false);
  const [relationModalMode, setRelationModalMode] =
    useState<RelationModalMode>("categorias");
  const [relationMovie, setRelationMovie] = useState<PeliculaResponse | null>(
    null,
  );

  const queryFn = useMemo(() => {
    if (filtroEstado === "activas")
      return () => cinemaService.getPeliculasByEstado(true);
    if (filtroEstado === "inactivas")
      return () => cinemaService.getPeliculasByEstado(false);
    return cinemaService.getAllPeliculas;
  }, [filtroEstado]);

  const { data: peliculas = [], isLoading } = useQuery({
    queryKey: ["admin-peliculas", filtroEstado],
    queryFn,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-publicas"],
    queryFn: cinemaService.getCategorias,
  });

  const { data: clasificaciones = [] } = useQuery({
    queryKey: ["clasificaciones-publicas"],
    queryFn: cinemaService.getClasificaciones,
  });

  const relationDetailQuery = useQuery({
    queryKey: ["detalle-pelicula-relacion", relationMovie?.idPelicula],
    queryFn: () => cinemaService.getPeliculaById(relationMovie!.idPelicula),
    enabled:
      relationModalOpen &&
      relationModalMode === "actores" &&
      !!relationMovie?.idPelicula,
  });

  const detalleQuery = useQuery({
    queryKey: ["detalle-pelicula-admin", editingMovie?.idPelicula],
    queryFn: () => cinemaService.getPeliculaById(editingMovie!.idPelicula),
    enabled: !!editingMovie?.idPelicula,
  });

  const peliculaDetalle = detalleQuery.data as
    | PeliculaActoresResponse
    | undefined;

  useEffect(() => {
    if (!editingMovie) return;
    setForm(mapMovieToForm(editingMovie));
    setSelectedCategories(
      editingMovie.categorias?.map((c) => c.idCategoria) ?? [],
    );
    setActorForm({ actor: "", personaje: "" });
    setTouchedFields(emptyTouchedFields);
  }, [editingMovie]);

  const markTouched = (field: keyof TouchedFields) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const openConfirm = (id: number, name: string) => {
    setConfirmActorId(id);
    setConfirmActorName(name);
    setConfirmOpen(true);
  };

  const openRelationModal = (
    movie: PeliculaResponse,
    mode: RelationModalMode,
  ) => {
    setRelationMovie(movie);
    setRelationModalMode(mode);
    setRelationModalOpen(true);
  };

  const closeRelationModal = () => {
    setRelationModalOpen(false);
    setRelationMovie(null);
  };

  const handleConfirmRemove = () => {
    if (confirmActorId != null) removeActorMutation.mutate(confirmActorId);
    setConfirmOpen(false);
    setConfirmActorId(null);
    setConfirmActorName("");
  };

  const isMovieTitleInvalid = touchedFields.titulo && !form.titulo.trim();
  const isSinopsisInvalid = touchedFields.sinopsis && !form.sinopsis.trim();
  const isDuracionInvalid =
    touchedFields.duracionMin &&
    (!form.duracionMin.trim() || Number(form.duracionMin) < 1);
  const isDirectorInvalid =
    touchedFields.director && form.director.trim().length < 2;
  const isFechaInvalid = touchedFields.fechaEstreno && !form.fechaEstreno;
  const isClasificacionInvalid =
    touchedFields.idClasificacion && !form.idClasificacion;
  const isCategoriasInvalid =
    touchedFields.categorias && selectedCategories.length === 0;

  const closeModal = () => {
    setModalOpen(false);
    setEditingMovie(null);
    setForm(emptyMovieForm);
    setSelectedCategories([]);
    setActorForm({ actor: "", personaje: "" });
    setTouchedFields(emptyTouchedFields);
  };

  const openCreateModal = () => {
    setEditingMovie(null);
    setForm(emptyMovieForm);
    setSelectedCategories([]);
    setTouchedFields(emptyTouchedFields);
    setModalOpen(true);
    setMsg(null);
  };

  const openEditModal = (movie: PeliculaResponse) => {
    setEditingMovie(movie);
    setModalOpen(true);
    setMsg(null);
  };

  const syncMovieCategories = async (
    idPelicula: number,
    currentCategoryIds: number[],
    nextCategoryIds: number[],
  ) => {
    const toAdd = nextCategoryIds.filter(
      (id) => !currentCategoryIds.includes(id),
    );
    const toRemove = currentCategoryIds.filter(
      (id) => !nextCategoryIds.includes(id),
    );

    await Promise.all([
      ...toAdd.map((idCategoria) =>
        cinemaService.addCategoriaToPelicula({ idPelicula, idCategoria }),
      ),
      ...toRemove.map((idCategoria) =>
        cinemaService.removeCategoriaFromPelicula(idPelicula, idCategoria),
      ),
    ]);
  };

  const relationMovieCategories = relationMovie?.categorias ?? [];
  const relationMovieActors = relationDetailQuery.data?.actores ?? [];
  const missingRelationCategories = categorias.filter(
    (categoria) =>
      !relationMovieCategories.some(
        (movieCategory) => movieCategory.idCategoria === categoria.idCategoria,
      ),
  );

  const addCategoryToRelationMovie = useMutation({
    mutationFn: (idCategoria: number) => {
      if (!relationMovie) throw new Error("Selecciona una película primero.");
      return cinemaService.addCategoriaToPelicula({
        idPelicula: relationMovie.idPelicula,
        idCategoria,
      });
    },
    onSuccess: (_, idCategoria) => {
      if (relationMovie) {
        const category = categorias.find(
          (categoria) => categoria.idCategoria === idCategoria,
        );
        if (category) {
          setRelationMovie((prev) =>
            prev
              ? {
                  ...prev,
                  categorias: [...prev.categorias, category],
                }
              : prev,
          );
        }
      }
      queryClient.invalidateQueries({ queryKey: ["admin-peliculas"] });
      setMsg({ type: "ok", text: "Categoría agregada correctamente." });
    },
    onError: (error: any) => {
      setMsg({
        type: "err",
        text:
          error?.response?.data?.message || "No se pudo agregar la categoría.",
      });
    },
  });

  const saveMovieMutation = useMutation({
    mutationFn: async () => {
      const payloadBase = {
        titulo: form.titulo.trim(),
        portadaUrl: form.portadaUrl.trim() || undefined,
        sinopsis: form.sinopsis.trim() || undefined,
        duracionMin: Number(form.duracionMin),
        director: form.director.trim() || undefined,
        fechaEstreno: form.fechaEstreno || undefined,
        idClasificacion: Number(form.idClasificacion),
        activo: form.activo,
      };

      if (editingMovie) {
        const updatePayload: PelicualUpdateRequest = payloadBase;
        const movieUpdated = await cinemaService.updatePelicula(
          editingMovie.idPelicula,
          updatePayload,
        );

        const currentCategoryIds =
          editingMovie.categorias?.map((c) => c.idCategoria) ?? [];
        await syncMovieCategories(
          movieUpdated.idPelicula,
          currentCategoryIds,
          selectedCategories,
        );

        return movieUpdated;
      }

      const createPayload: PeliculaRequest = {
        ...payloadBase,
        categorias: selectedCategories,
      };

      return cinemaService.createPelicula(createPayload);
    },
    onSuccess: () => {
      setMsg({
        type: "ok",
        text: editingMovie
          ? "Película actualizada correctamente."
          : "Película creada correctamente.",
      });
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin-peliculas"] });
    },
    onError: (error: any) => {
      closeModal();
      setMsg({
        type: "err",
        text:
          error?.response?.data?.message || "No se pudo guardar la película.",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      idPelicula,
      estado,
    }: {
      idPelicula: number;
      estado: boolean;
    }) => cinemaService.togglePeliculaEstado(idPelicula, estado),
    onSuccess: () => {
      setMsg({ type: "ok", text: "Estado de la película actualizado." });
      queryClient.invalidateQueries({ queryKey: ["admin-peliculas"] });
    },
    onError: (error: any) => {
      setMsg({
        type: "err",
        text:
          error?.response?.data?.message ||
          "No se pudo actualizar la película.",
      });
    },
  });

  const addActorMutation = useMutation({
    mutationFn: () => {
      if (!editingMovie) throw new Error("Selecciona una película primero.");
      const payload: PeliculaCastRequest = {
        actor: actorForm.actor.trim(),
        personaje: actorForm.personaje.trim(),
      };
      return cinemaService.addActoresToPelicula(
        editingMovie.idPelicula,
        payload,
      );
    },
    onSuccess: () => {
      setMsg({ type: "ok", text: "Actor agregado correctamente." });
      setActorForm({ actor: "", personaje: "" });
      queryClient.invalidateQueries({
        queryKey: ["detalle-pelicula-admin", editingMovie?.idPelicula],
      });
    },
    onError: (error: any) => {
      setMsg({
        type: "err",
        text: error?.response?.data?.message || "No se pudo agregar el actor.",
      });
    },
  });

  const agregarPosterMutation = useMutation({
    mutationFn: () => {
      if (!editingMovie) throw new Error("Selecciona una película primero.");
      if (!posterFile) throw new Error("Selecciona un archivo de poster.");
      const payload = {
        idPelicula: editingMovie.idPelicula,
        esPrincipal: posterPrincipal,
        archivo: posterFile,
      };
      return cinemaService.agregarPosterPelicula(payload);
    },
    onSuccess: () => {
      setMsg({ type: "ok", text: "Poster subido correctamente." });
      setPosterFile(null);
      setPosterPrincipal(true);
      queryClient.invalidateQueries({
        queryKey: ["detalle-pelicula-admin", editingMovie?.idPelicula],
      });
    },
    onError: (error: any) => {
      setMsg({
        type: "err",
        text: error?.response?.data?.message || "No se pudo subir el poster.",
      });
    },
  });

  const removeActorMutation = useMutation({
    mutationFn: (idPeliculaCast: number) => {
      if (!editingMovie) throw new Error("Selecciona una película primero.");
      return cinemaService.removeActorFromPelicula(
        editingMovie.idPelicula,
        idPeliculaCast,
      );
    },
    onSuccess: () => {
      setMsg({ type: "ok", text: "Actor eliminado correctamente." });
      queryClient.invalidateQueries({
        queryKey: ["detalle-pelicula-admin", editingMovie?.idPelicula],
      });
    },
    onError: (error: any) => {
      setMsg({
        type: "err",
        text: error?.response?.data?.message || "No se pudo eliminar el actor.",
      });
    },
  });

  const syncCategorySelection = (idCategoria: number) => {
    setSelectedCategories((prev) =>
      prev.includes(idCategoria)
        ? prev.filter((id) => id !== idCategoria)
        : [...prev, idCategoria],
    );
  };

  return (
    <div
      style={{ maxWidth: "1100px", margin: "0 auto", padding: "2rem 1.5rem" }}
    >
      <ConfirmModal
        open={confirmOpen}
        title="Eliminar actor"
        message={`¿Confirma eliminar a ${confirmActorName}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmRemove}
        onCancel={() => setConfirmOpen(false)}
      />

      {relationModalOpen && relationMovie && (
        <div
          onClick={closeRelationModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 210,
            background: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            overflowY: "auto",
            padding: "2rem 1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "840px",
              borderRadius: "20px",
              padding: "1.5rem",
              background: "rgba(15,23,42,0.97)",
              border: "1px solid rgba(96,165,250,0.18)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                alignItems: "flex-start",
                marginBottom: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "1.5rem",
                    letterSpacing: ".08em",
                    color: "#f1f5f9",
                  }}
                >
                  {relationModalMode === "actores" &&
                    `Actores de ${relationMovie.titulo}`}
                  {relationModalMode === "categorias" &&
                    `Categorías de ${relationMovie.titulo}`}
                  {relationModalMode === "agregar-categoria" &&
                    `Agregar categoría a ${relationMovie.titulo}`}
                </h2>
                <p style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                  {relationModalMode === "actores" &&
                    "Listado de actores registrados para esta película."}
                  {relationModalMode === "categorias" &&
                    "Categorías asignadas a esta película."}
                  {relationModalMode === "agregar-categoria" &&
                    "Selecciona una categoría que la película aún no tenga."}
                </p>
              </div>

              <button
                onClick={closeRelationModal}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  background: "rgba(239,68,68,0.12)",
                  color: "var(--accent2)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gap: ".75rem" }}>
              {relationModalMode === "actores" &&
                (relationMovieActors.length ? (
                  relationMovieActors.map((actor) => (
                    <div
                      key={actor.idPeliculaCast}
                      style={{
                        padding: ".75rem 1rem",
                        borderRadius: "12px",
                        background: "rgba(30,64,175,0.12)",
                        border: "1px solid rgba(96,165,250,0.12)",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ color: "#f1f5f9", fontWeight: 500 }}>
                          {actor.actor}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                          Personaje: {actor.personaje}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8" }}>
                    No hay actores registrados.
                  </div>
                ))}

              {relationModalMode === "categorias" &&
                (relationMovieCategories.length ? (
                  relationMovieCategories.map((categoria) => (
                    <div
                      key={categoria.idCategoria}
                      style={{
                        padding: ".75rem 1rem",
                        borderRadius: "12px",
                        background: "rgba(30,64,175,0.12)",
                        border: "1px solid rgba(96,165,250,0.12)",
                      }}
                    >
                      <div style={{ color: "#f1f5f9", fontWeight: 500 }}>
                        {categoria.nombre}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8" }}>
                    No hay categorías asignadas.
                  </div>
                ))}

              {relationModalMode === "agregar-categoria" &&
                (missingRelationCategories.length ? (
                  missingRelationCategories.map((categoria) => (
                    <div
                      key={categoria.idCategoria}
                      style={{
                        padding: ".75rem 1rem",
                        borderRadius: "12px",
                        background: "rgba(30,64,175,0.12)",
                        border: "1px solid rgba(96,165,250,0.12)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <div style={{ color: "#f1f5f9", fontWeight: 500 }}>
                          {categoria.nombre}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          addCategoryToRelationMovie.mutate(
                            categoria.idCategoria,
                          )
                        }
                        disabled={addCategoryToRelationMovie.isPending}
                        style={{
                          padding: ".45rem .85rem",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background: "rgba(34,197,94,0.15)",
                          color: "#4ade80",
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#94a3b8" }}>
                    La película ya tiene todas las categorías disponibles.
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2rem",
            letterSpacing: ".08em",
            color: "#f1f5f9",
          }}
        >
          Administración de Películas
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: ".75rem",
          flexWrap: "wrap",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={openCreateModal}
          style={{
            padding: ".6rem 1rem",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            background:
              "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
            color: "#fff",
          }}
        >
          <Plus
            size={15}
            style={{ display: "inline-block", marginRight: ".35rem" }}
          />
          Nueva película
        </button>
        <button
          onClick={() => {
            setModalOpen(false);
            setEditingMovie(null);
          }}
          style={{
            padding: ".6rem 1rem",
            borderRadius: "10px",
            border: "1px solid rgba(96,165,250,0.2)",
            cursor: "pointer",
            background: "rgba(30,64,175,0.12)",
            color: "#f1f5f9",
          }}
        >
          <Film
            size={15}
            style={{ display: "inline-block", marginRight: ".35rem" }}
          />
          Vista catálogo
        </button>
      </div>

      {msg && (
        <div
          style={{
            padding: ".7rem 1rem",
            borderRadius: "10px",
            marginBottom: "1rem",
            background:
              msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: msg.type === "ok" ? "#4ade80" : "var(--accent2)",
            fontSize: ".84rem",
          }}
        >
          {msg.type === "ok" ? "" : "⚠️"} {msg.text}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: ".5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "activas" },
          { label: "Inactivas", value: "inactivas" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroEstado(f.value as FiltroEstado)}
            style={{
              padding: ".35rem .8rem",
              borderRadius: "999px",
              border: "1px solid rgba(96,165,250,0.2)",
              background:
                filtroEstado === f.value
                  ? "rgba(37,99,235,0.35)"
                  : "rgba(30,64,175,0.16)",
              color: filtroEstado === f.value ? "#fff" : "#94a3b8",
              cursor: "pointer",
              fontSize: ".78rem",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid rgba(96,165,250,0.15)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 2fr 1.5fr 1fr",
            padding: ".7rem 1rem",
            background: "rgba(30,64,175,0.25)",
            fontSize: ".72rem",
            fontWeight: 500,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            color: "#94a3b8",
          }}
        >
          <span>Película</span>
          <span>Clasificación</span>
          <span>Categorías</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {isLoading ? (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}
          >
            ⏳ Cargando películas...
          </div>
        ) : peliculas.length === 0 ? (
          <div
            style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}
          >
            No hay películas para mostrar.
          </div>
        ) : (
          peliculas.map((pelicula: any, index: number) => (
            <div
              key={pelicula.idPelicula}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 2fr 1.5fr 1fr",
                padding: ".9rem 1rem",
                alignItems: "center",
                background:
                  index % 2 === 0
                    ? "rgba(15,23,42,0.4)"
                    : "rgba(30,64,175,0.06)",
                borderTop: "1px solid rgba(96,165,250,0.07)",
                fontSize: ".82rem",
              }}
            >
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 500 }}>
                  {pelicula.titulo}
                </div>
                <div style={{ color: "#94a3b8", fontSize: ".72rem" }}>
                  {pelicula.duracionMin} min ·{" "}
                  {pelicula.calificacionPromedio ?? "—"} ⭐
                </div>
              </div>

              <div style={{ color: "#cbd5e1" }}>
                {pelicula.clasificacion?.codigo ??
                  pelicula.clasificacion?.nombre ??
                  "—"}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: ".3rem" }}>
                {pelicula.categorias?.map((cat: any) => (
                  <span
                    key={cat.idCategoria}
                    style={{
                      fontSize: ".65rem",
                      padding: ".15rem .45rem",
                      borderRadius: "5px",
                      background: "rgba(96,165,250,0.12)",
                      color: "var(--blue-glow)",
                    }}
                  >
                    {cat.nombre}
                  </span>
                ))}
              </div>

              <div>
                <span
                  style={{
                    fontSize: ".68rem",
                    fontWeight: 500,
                    padding: ".2rem .55rem",
                    borderRadius: "999px",
                    background: pelicula.activo
                      ? "rgba(34,197,94,0.12)"
                      : "rgba(239,68,68,0.12)",
                    color: pelicula.activo ? "#4ade80" : "var(--accent2)",
                    border: `1px solid ${pelicula.activo ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                  }}
                >
                  {pelicula.activo ? "Activa" : "Inactiva"}
                </span>
              </div>

              <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    toggleMutation.mutate({
                      idPelicula: pelicula.idPelicula,
                      estado: !pelicula.activo,
                    })
                  }
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: pelicula.activo
                      ? "rgba(239,68,68,0.15)"
                      : "rgba(34,197,94,0.15)",
                    color: pelicula.activo ? "var(--accent2)" : "#4ade80",
                  }}
                >
                  <Power size={14} />
                </button>
                <button
                  onClick={() => openEditModal(pelicula)}
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(96,165,250,0.12)",
                    color: "var(--blue-glow)",
                  }}
                >
                  <PencilLine size={14} />
                </button>
                <button
                  onClick={() => openRelationModal(pelicula, "categorias")}
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(96,165,250,0.12)",
                    color: "#cbd5e1",
                    fontSize: ".72rem",
                  }}
                >
                  Ver categorías
                </button>
                <button
                  onClick={() => openRelationModal(pelicula, "actores")}
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(96,165,250,0.12)",
                    color: "#cbd5e1",
                    fontSize: ".72rem",
                  }}
                >
                  Ver actores
                </button>
                <button
                  onClick={() =>
                    openRelationModal(pelicula, "agregar-categoria")
                  }
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(34,197,94,0.15)",
                    color: "#4ade80",
                    fontSize: ".72rem",
                  }}
                >
                  Agregar categoría
                </button>
                <button
                  onClick={() =>
                    navigate(`/admin/peliculas/${pelicula.idPelicula}/posters`)
                  }
                  style={{
                    padding: ".3rem .6rem",
                    borderRadius: "7px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(168,85,247,0.15)",
                    color: "#d8b4fe",
                    fontSize: ".72rem",
                  }}
                >
                  Administrar Pósters
                </button>
              </div>
            </div>
          ))
        )}

        {modalOpen && (
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(15,23,42,0.85)",
              backdropFilter: "blur(6px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflowY: "auto",
              padding: "2rem 1rem",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "1080px",
                borderRadius: "20px",
                padding: "1.5rem",
                background: "rgba(15,23,42,0.97)",
                border: "1px solid rgba(96,165,250,0.18)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "1.5rem",
                      letterSpacing: ".08em",
                      color: "#f1f5f9",
                    }}
                  >
                    {editingMovie
                      ? `Editar película #${editingMovie.idPelicula}`
                      : "Nueva película"}
                  </h2>
                  <p style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                    Crea o actualiza la película, y luego sincroniza categorías
                    y actores.
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    background: "rgba(239,68,68,0.12)",
                    color: "var(--accent2)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr .9fr",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    borderRadius: "16px",
                    padding: "1rem",
                    background: "rgba(30,64,175,0.12)",
                    border: "1px solid rgba(96,165,250,0.15)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div style={{ gridColumn: "1 / -1" }}>
                      <InputGroup
                        label="Título"
                        value={form.titulo}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            titulo: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("titulo")}
                        required
                      />
                      {isMovieTitleInvalid && <RequiredTag />}
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: ".75rem",
                          color: "#94a3b8",
                          marginBottom: ".35rem",
                        }}
                      >
                        Sinopsis <span style={{ color: "#f87171" }}>*</span>
                      </label>
                      <textarea
                        value={form.sinopsis}
                        required
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            sinopsis: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("sinopsis")}
                        rows={4}
                        style={{
                          width: "100%",
                          padding: ".75rem 1rem",
                          borderRadius: "12px",
                          resize: "vertical",
                          background: "rgba(30,64,175,0.15)",
                          border: "1px solid rgba(96,165,250,0.2)",
                          color: "#f1f5f9",
                          outline: "none",
                        }}
                      />
                      {isSinopsisInvalid && <RequiredTag />}
                    </div>
                    <div>
                      <InputGroup
                        label="Duración (min)"
                        required
                        minValue={1}
                        type="number"
                        value={form.duracionMin}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            duracionMin: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("duracionMin")}
                      />
                      {isDuracionInvalid && (
                        <RequiredTag text="Ingresa un valor mayor o igual a 1" />
                      )}
                    </div>
                    <div>
                      <InputGroup
                        label="Director"
                        required
                        minLength={2}
                        value={form.director}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            director: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("director")}
                      />
                      {isDirectorInvalid && (
                        <RequiredTag text="Ingresa al menos 2 caracteres" />
                      )}
                    </div>
                    <div>
                      <InputGroup
                        label="Fecha de estreno"
                        required
                        type="date"
                        value={form.fechaEstreno}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fechaEstreno: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("fechaEstreno")}
                      />
                      {isFechaInvalid && (
                        <RequiredTag text="Selecciona una fecha" />
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: ".75rem",
                          color: "#94a3b8",
                          marginBottom: ".35rem",
                        }}
                      >
                        Clasificación{" "}
                        <span style={{ color: "#f87171" }}>*</span>
                      </label>
                      <select
                        value={form.idClasificacion}
                        required
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            idClasificacion: e.target.value,
                          }))
                        }
                        onBlur={() => markTouched("idClasificacion")}
                        style={{
                          width: "100%",
                          padding: ".75rem 1rem",
                          borderRadius: "12px",
                          background: "rgba(30,64,175,0.15)",
                          border: "1px solid rgba(96,165,250,0.2)",
                          color: "#6991baff",
                          outline: "none",
                        }}
                      >
                        <option value="">Selecciona una clasificación</option>
                        {clasificaciones.map(
                          (clasificacion: ClasificacionResponse) => (
                            <option
                              key={clasificacion.idClasificacion}
                              value={clasificacion.idClasificacion}
                            >
                              {clasificacion.codigo} — {clasificacion.nombre}
                            </option>
                          ),
                        )}
                      </select>
                      {isClasificacionInvalid && <RequiredTag />}
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "1rem",
                      display: "flex",
                      gap: ".5rem",
                      alignItems: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".45rem",
                        color: "#cbd5e1",
                        fontSize: ".85rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        required
                        checked={form.activo}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            activo: e.target.checked,
                          }))
                        }
                      />
                      Activa
                    </label>
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <button
                      onClick={() => saveMovieMutation.mutate()}
                      disabled={saveMovieMutation.isPending}
                      style={{
                        width: "100%",
                        padding: ".75rem 1rem",
                        borderRadius: "12px",
                        border: "none",
                        cursor: "pointer",
                        background:
                          "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                        color: "#fff",
                      }}
                    >
                      {saveMovieMutation.isPending
                        ? "⏳ Guardando..."
                        : editingMovie
                          ? "Actualizar película"
                          : "Crear película"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "1rem" }}>
                  <div
                    style={{
                      borderRadius: "16px",
                      padding: "1rem",
                      background: "rgba(30,64,175,0.12)",
                      border: "1px solid rgba(96,165,250,0.15)",
                    }}
                  >
                    <h3 style={{ color: "#f1f5f9", marginBottom: ".35rem" }}>
                      Categorías
                    </h3>
                    {isCategoriasInvalid && (
                      <RequiredTag text="Selecciona al menos una categoría" />
                    )}
                    <div
                      style={{
                        display: "grid",
                        gap: ".5rem",
                        maxHeight: "220px",
                        overflowY: "auto",
                      }}
                    >
                      {categorias.map((categoria: CategoriaResponse) => (
                        <label
                          key={categoria.idCategoria}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                            color: "#cbd5e1",
                            fontSize: ".85rem",
                          }}
                        >
                          <input
                            type="checkbox"
                            required
                            checked={selectedCategories.includes(
                              categoria.idCategoria,
                            )}
                            onChange={() => {
                              setTouchedFields((prev) => ({
                                ...prev,
                                categorias: true,
                              }));
                              syncCategorySelection(categoria.idCategoria);
                            }}
                          />
                          {categoria.nombre}
                        </label>
                      ))}
                    </div>
                  </div>

                  {editingMovie && (
                    <div
                      style={{
                        borderRadius: "16px",
                        padding: "1rem",
                        background: "rgba(15,23,42,0.4)",
                        border: "1px solid rgba(96,165,250,0.15)",
                      }}
                    >
                      <h3 style={{ color: "#f1f5f9", marginBottom: ".75rem" }}>
                        Actores
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gap: ".6rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {peliculaDetalle?.actores?.length ? (
                          peliculaDetalle.actores.map((actor) => (
                            <div
                              key={actor.idPeliculaCast}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: ".65rem .75rem",
                                borderRadius: "10px",
                                background: "rgba(30,64,175,0.12)",
                                color: "#cbd5e1",
                                fontSize: ".85rem",
                              }}
                            >
                              <div>
                                <div
                                  style={{ fontWeight: 500, color: "#f1f5f9" }}
                                >
                                  {actor.actor}
                                </div>
                                <div>Personaje: {actor.personaje}</div>
                              </div>
                              <div>
                                <button
                                  onClick={() =>
                                    openConfirm(
                                      actor.idPeliculaCast,
                                      actor.actor,
                                    )
                                  }
                                  disabled={removeActorMutation.isPending}
                                  style={{
                                    padding: ".35rem .6rem",
                                    borderRadius: "8px",
                                    border: "none",
                                    cursor: "pointer",
                                    background: "rgba(239,68,68,0.12)",
                                    color: "var(--accent2)",
                                  }}
                                >
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                            No hay actores registrados.
                          </div>
                        )}
                      </div>

                      <div style={{ display: "grid", gap: ".75rem" }}>
                        <InputGroup
                          label="Actor"
                          value={actorForm.actor}
                          onChange={(e) =>
                            setActorForm((prev) => ({
                              ...prev,
                              actor: e.target.value,
                            }))
                          }
                          placeholder="Nombre del actor"
                        />
                        <InputGroup
                          label="Personaje"
                          value={actorForm.personaje}
                          onChange={(e) =>
                            setActorForm((prev) => ({
                              ...prev,
                              personaje: e.target.value,
                            }))
                          }
                          placeholder="Nombre del personaje"
                        />
                        <button
                          onClick={() => addActorMutation.mutate()}
                          disabled={
                            addActorMutation.isPending ||
                            !actorForm.actor ||
                            !actorForm.personaje
                          }
                          style={{
                            padding: ".65rem 1rem",
                            borderRadius: "10px",
                            border: "none",
                            cursor: "pointer",
                            background: "rgba(34,197,94,0.15)",
                            color: "#4ade80",
                          }}
                        >
                          Agregar actor
                        </button>
                      </div>
                      <div
                        style={{
                          borderTop: "1px solid rgba(96,165,250,0.12)",
                          paddingTop: ".75rem",
                          marginTop: ".75rem",
                        }}
                      >
                        <h4 style={{ color: "#f1f5f9", marginBottom: ".5rem" }}>
                          Posters
                        </h4>
                        {!editingMovie ? (
                          <div style={{ color: "#94a3b8", fontSize: ".85rem" }}>
                            Guarda la película primero para subir posters.
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: ".5rem" }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setPosterFile(e.target.files?.[0] ?? null)
                              }
                              style={{ color: "#f1f5f9" }}
                            />
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: ".5rem",
                                color: "#cbd5e1",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={posterPrincipal}
                                onChange={(e) =>
                                  setPosterPrincipal(e.target.checked)
                                }
                              />
                              Establecer como poster principal
                            </label>
                            <button
                              onClick={() => agregarPosterMutation.mutate()}
                              disabled={
                                agregarPosterMutation.isPending || !posterFile
                              }
                              style={{
                                padding: ".65rem 1rem",
                                borderRadius: "10px",
                                border: "none",
                                cursor: "pointer",
                                background:
                                  "linear-gradient(135deg, var(--blue-mid), var(--blue-light))",
                                color: "#fff",
                              }}
                            >
                              {agregarPosterMutation.isPending
                                ? "⏳ Subiendo..."
                                : "Subir poster"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPeliculasPage;
