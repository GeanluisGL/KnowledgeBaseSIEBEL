import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { contentApi } from "../api/content.api";
import ConfirmDialog from "../components/ConfirmDialog";
import ContentFormModal from "../components/ContentFormModal";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import Loading from "../components/Loading";
import { useContents } from "../hooks/useContents";
import type { Content } from "../types";
import { getErrorMessage } from "../utils/errors";
import { formatDate } from "../utils/formatDate";

export default function AdminContents() {
  const { contents, loading, error, refetch } = useContents("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Content | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const editId = searchParams.get("edit");
  const modalOpen = creating || !!editId;

  const openEdit = (id: string | number) => setSearchParams({ edit: String(id) });

  const closeModal = () => {
    setCreating(false);
    if (editId) setSearchParams({}, { replace: true });
  };

  const handleSaved = () => {
    closeModal();
    refetch();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await contentApi.remove(toDelete.id);
      setToDelete(null);
      refetch();
    } catch (err) {
      setDeleteError(getErrorMessage(err, "No se pudo eliminar el contenido"));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Contenidos</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Nuevo contenido
        </button>
      </div>

      {deleteError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {deleteError}
        </p>
      )}

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading && contents.length === 0 ? (
        <Loading />
      ) : contents.length === 0 ? (
        <EmptyState
          title="Aún no hay contenidos"
          message="Crea el primer contenido para tu equipo."
          actionLabel="Nuevo contenido"
          onAction={() => setCreating(true)}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Actualizado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contents.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link to={`/content/${c.id}`} className="hover:text-indigo-600">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{c.authorName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(c.updatedAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(c.id)}
                      className="mr-3 font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(c)}
                      className="font-medium text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ContentFormModal
          key={editId ?? "new"}
          contentId={editId}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar contenido"
        message={`¿Seguro que deseas eliminar "${toDelete?.title ?? ""}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
