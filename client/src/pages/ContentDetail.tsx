import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { contentApi } from "../api/content.api";
import ConfirmDialog from "../components/ConfirmDialog";
import DocumentViewer from "../components/DocumentViewer";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import type { Content } from "../types";
import { getErrorMessage, getStatus } from "../utils/errors";
import { formatDate } from "../utils/formatDate";
import { splitBody } from "../utils/splitBody";

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tick, setTick] = useState(0);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const retry = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);

    contentApi
      .get(id)
      .then((c) => {
        if (!cancelled) setContent(c);
      })
      .catch((err) => {
        if (cancelled) return;
        if (getStatus(err) === 404) setNotFound(true);
        else setError(getErrorMessage(err, "No se pudo cargar el contenido"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await contentApi.remove(id);
      navigate("/", { replace: true });
    } catch (err) {
      setDeleteError(getErrorMessage(err, "No se pudo eliminar el contenido"));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const backButton = (
    <Link
      to="/"
      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Volver
    </Link>
  );

  if (loading) return <Loading />;

  if (notFound) {
    return (
      <div className="space-y-4">
        <div>{backButton}</div>
        <EmptyState
          title="Contenido no encontrado"
          message="El contenido que buscas no existe o fue eliminado."
          actionLabel="Ir al inicio"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="space-y-4">
        <div>{backButton}</div>
        <ErrorState message={error ?? "No se pudo cargar el contenido"} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {backButton}
        {isAdmin && (
          <div className="ml-auto flex gap-3">
            <Link
              to={`/admin/contents?edit=${content.id}`}
              className="rounded-lg border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Editar
            </Link>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {deleteError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      )}

      <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {content.category}
        </span>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">{content.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          Por <span className="font-medium text-gray-700">{content.authorName}</span> · Actualizado{" "}
          {formatDate(content.updatedAt)}
        </p>

        <hr className="my-6 border-gray-200" />

        {content.body ? (
          <div className="space-y-6">
            {splitBody(content.body).map((seg, i) =>
              seg.type === "markdown" ? (
                <div key={i} className="markdown">
                  <ReactMarkdown>{seg.text}</ReactMarkdown>
                </div>
              ) : (
                <DocumentViewer key={`${i}-${seg.url}`} url={seg.url} name={seg.name} />
              )
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Este contenido no tiene cuerpo.</p>
        )}
      </article>

      <ConfirmDialog
        open={confirmOpen}
        title="Eliminar contenido"
        message={`¿Seguro que deseas eliminar "${content.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
