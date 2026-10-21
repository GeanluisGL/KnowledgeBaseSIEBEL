import { useCallback, useEffect, useState, type FormEvent } from "react";
import { usersApi } from "../api/users.api";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import FormField, { inputClass } from "../components/FormField";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import RoleBadge from "../components/RoleBadge";
import { useAuth } from "../hooks/useAuth";
import type { Role, User, UserInput, UserUpdateInput } from "../types";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../utils/errors";
import { formatDate } from "../utils/formatDate";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY_CREATE: UserInput = { name: "", email: "", password: "", role: "viewer" };

// ── Create modal ──────────────────────────────────────────────────────────────

function CreateUserModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<UserInput>(EMPTY_CREATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof UserInput>(key: K, value: UserInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v: FieldErrors = {};
    if (form.name.trim().length < 2) v.name = "El nombre debe tener al menos 2 caracteres";
    if (!EMAIL_RE.test(form.email.trim())) v.email = "Ingresa un email válido";
    if (form.password.length < 8) v.password = "La contraseña debe tener al menos 8 caracteres";
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSaving(true);
    try {
      await usersApi.create({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
      onSaved();
    } catch (err) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) setErrors(fe);
      setSubmitError(getErrorMessage(err, "No se pudo crear el usuario"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Nombre" htmlFor="uf-name" error={errors.name}>
          <input id="uf-name" value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} />
        </FormField>
        <FormField label="Email" htmlFor="uf-email" error={errors.email}>
          <input id="uf-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass(!!errors.email)} />
        </FormField>
        <FormField label="Contraseña" htmlFor="uf-password" error={errors.password}>
          <input id="uf-password" type="password" autoComplete="new-password" value={form.password} onChange={(e) => set("password", e.target.value)} className={inputClass(!!errors.password)} />
        </FormField>
        <FormField label="Rol" htmlFor="uf-role" error={errors.role}>
          <select id="uf-role" value={form.role} onChange={(e) => set("role", e.target.value as Role)} className={inputClass(!!errors.role)}>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{submitError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditUserModal({ user, onClose, onSaved }: { user: User; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<UserUpdateInput>({ name: user.name, email: user.email, role: user.role, password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = <K extends keyof UserUpdateInput>(key: K, value: UserUpdateInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v: FieldErrors = {};
    if (!form.name || form.name.trim().length < 2) v.name = "El nombre debe tener al menos 2 caracteres";
    if (!form.email || !EMAIL_RE.test(form.email.trim())) v.email = "Ingresa un email válido";
    if (form.password && form.password.length < 8) v.password = "La contraseña debe tener al menos 8 caracteres";
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload: UserUpdateInput = { name: form.name?.trim(), email: form.email?.trim(), role: form.role };
    if (form.password) payload.password = form.password;

    setSaving(true);
    try {
      await usersApi.update(String(user.id), payload);
      onSaved();
    } catch (err) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) setErrors(fe);
      setSubmitError(getErrorMessage(err, "No se pudo actualizar el usuario"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Editar usuario" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormField label="Nombre" htmlFor="eu-name" error={errors.name}>
          <input id="eu-name" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} className={inputClass(!!errors.name)} />
        </FormField>
        <FormField label="Email" htmlFor="eu-email" error={errors.email}>
          <input id="eu-email" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className={inputClass(!!errors.email)} />
        </FormField>
        <FormField label="Nueva contraseña" htmlFor="eu-password" error={errors.password}>
          <input id="eu-password" type="password" autoComplete="new-password" placeholder="Dejar vacío para no cambiar" value={form.password ?? ""} onChange={(e) => set("password", e.target.value)} className={inputClass(!!errors.password)} />
        </FormField>
        <FormField label="Rol" htmlFor="eu-role" error={errors.role}>
          <select id="eu-role" value={form.role ?? "viewer"} onChange={(e) => set("role", e.target.value as Role)} className={inputClass(!!errors.role)}>
            <option value="viewer">Viewer</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
        {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{submitError}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    usersApi
      .list()
      .then((data) => { if (!cancelled) setUsers(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, "No se pudieron cargar los usuarios")); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [tick]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await usersApi.remove(String(deleteTarget.id));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(getErrorMessage(err, "No se pudo eliminar el usuario"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Nuevo usuario
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading && users.length === 0 ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState title="No hay usuarios" actionLabel="Nuevo usuario" onAction={() => setCreateOpen(true)} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-600">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Creado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatDate(u.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditTarget(u)}
                      className="mr-2 rounded px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      disabled={u.id === me?.id}
                      onClick={() => { setDeleteError(null); setDeleteTarget(u); }}
                      className="rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      title={u.id === me?.id ? "No puedes eliminar tu propia cuenta" : undefined}
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

      {createOpen && (
        <CreateUserModal onClose={() => setCreateOpen(false)} onSaved={() => { setCreateOpen(false); refetch(); }} />
      )}

      {editTarget && (
        <EditUserModal user={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); refetch(); }} />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={
          deleteError
            ? deleteError
            : `¿Eliminar a "${deleteTarget?.name}"? Esta acción no se puede deshacer.`
        }
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
      />
    </div>
  );
}
