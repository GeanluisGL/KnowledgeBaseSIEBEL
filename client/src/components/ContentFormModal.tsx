import { useEffect, useRef, useState, type FormEvent } from "react";
import { contentApi } from "../api/content.api";
import { ACCEPT, isAllowedFile, isImageFile, uploadFile } from "../api/uploads.api";
import type { ContentInput } from "../types";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../utils/errors";
import FormField, { inputClass } from "./FormField";
import Loading from "./Loading";
import Modal from "./Modal";

interface ContentFormModalProps {
  /** null = crear; id = editar */
  contentId: string | number | null;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY: ContentInput = { title: "", category: "", summary: "", body: "" };

function validate(form: ContentInput): FieldErrors {
  const e: FieldErrors = {};
  if (form.title.trim().length < 3) e.title = "El título debe tener al menos 3 caracteres";
  if (!form.category.trim()) e.category = "La categoría es obligatoria";
  if (!form.summary.trim()) e.summary = "El resumen es obligatorio";
  if (!form.body.trim()) e.body = "El contenido es obligatorio";
  return e;
}

export default function ContentFormModal({ contentId, onClose, onSaved }: ContentFormModalProps) {
  const isEdit = contentId !== null;
  const [form, setForm] = useState<ContentInput>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contentId === null) return;
    let cancelled = false;
    contentApi
      .get(contentId)
      .then((c) => {
        if (cancelled) return;
        setForm({
          title: c.title,
          category: c.category,
          summary: c.summary,
          body: c.body ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(getErrorMessage(err, "No se pudo cargar el contenido"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const set = (key: keyof ContentInput, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const insertFile = async (file: File) => {
    setUploading(true);
    setSubmitError(null);
    try {
      const url = await uploadFile(file);
      const label = file.name.replace(/[\[\]]/g, "");
      const md = isImageFile(file)
        ? `\n![${label}](${url})\n`
        : `\n\n[${label}](${url})\n\n`;
      const pos = bodyRef.current?.selectionStart ?? form.body.length;
      set("body", form.body.slice(0, pos) + md + form.body.slice(pos));
    } catch (err) {
      setSubmitError(getErrorMessage(err, "No se pudo subir el archivo"));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    const payload: ContentInput = {
      title: form.title.trim(),
      category: form.category.trim(),
      summary: form.summary.trim(),
      body: form.body,
    };

    setSaving(true);
    try {
      if (isEdit) await contentApi.update(contentId, payload);
      else await contentApi.create(payload);
      onSaved();
    } catch (err) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) setErrors(fe);
      setSubmitError(getErrorMessage(err, "No se pudo guardar el contenido"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? "Editar contenido" : "Nuevo contenido"} onClose={onClose} wide>
      {loading ? (
        <Loading />
      ) : loadError ? (
        <p className="py-6 text-center text-sm text-red-600">{loadError}</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <FormField label="Título" htmlFor="cf-title" error={errors.title}>
            <input
              id="cf-title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className={inputClass(!!errors.title)}
            />
          </FormField>

          <FormField label="Categoría" htmlFor="cf-category" error={errors.category}>
            <input
              id="cf-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass(!!errors.category)}
            />
          </FormField>

          <FormField label="Resumen" htmlFor="cf-summary" error={errors.summary}>
            <textarea
              id="cf-summary"
              rows={2}
              value={form.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={inputClass(!!errors.summary)}
            />
          </FormField>

          <FormField label="Contenido (Markdown)" htmlFor="cf-body" error={errors.body}>
            <div className="mb-1 flex justify-end">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                {uploading ? "Subiendo..." : "Insertar archivo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void insertFile(f);
                  e.target.value = "";
                }}
              />
            </div>
            <textarea
              id="cf-body"
              ref={bodyRef}
              onPaste={(e) => {
                const f = Array.from(e.clipboardData.files).find((x) =>
                  isAllowedFile(x)
                );
                if (f) {
                  e.preventDefault();
                  void insertFile(f);
                }
              }}
              rows={10}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              className={`${inputClass(!!errors.body)} font-mono`}
            />
          </FormField>

          {submitError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
