import axios from "axios";

export type FieldErrors = Record<string, string>;

export function getErrorMessage(
  err: unknown,
  fallback = "Ocurrió un error inesperado"
): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: unknown } | undefined;
    if (data && typeof data.error === "string") return data.error;
    if (!err.response) return "No se pudo conectar con el servidor";
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function getStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/**
 * Extrae errores por campo devueltos por Zod en el backend.
 * Soporta: { details: { fieldErrors: { campo: [msg] } } },
 * { details: [{ path: ["campo"], message }] } y { errors: { campo: msg } }.
 */
export function getFieldErrors(err: unknown): FieldErrors {
  const out: FieldErrors = {};
  if (!axios.isAxiosError(err)) return out;
  const data = err.response?.data as Record<string, unknown> | undefined;
  if (!data) return out;

  const add = (key: string, value: unknown) => {
    const msg = Array.isArray(value) ? value[0] : value;
    if (key && typeof msg === "string" && !out[key]) out[key] = msg;
  };

  const walk = (src: unknown) => {
    if (!src) return;
    if (Array.isArray(src)) {
      src.forEach((item) => {
        if (item && typeof item === "object") {
          const i = item as { path?: unknown; message?: unknown };
          const key = Array.isArray(i.path)
            ? String(i.path[0] ?? "")
            : typeof i.path === "string"
            ? i.path
            : "";
          add(key, i.message);
        }
      });
    } else if (typeof src === "object") {
      const o = src as Record<string, unknown>;
      if (o.fieldErrors && typeof o.fieldErrors === "object") {
        walk(o.fieldErrors);
        return;
      }
      Object.entries(o).forEach(([k, v]) => add(k, v));
    }
  };

  walk(data.details ?? data.errors ?? data.fieldErrors);
  return out;
}
