import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { env } from "../config/env";
import { MAX_FILE_SIZE } from "../config/upload";
import { HttpError } from "../utils/httpError";

/** Errores 4xx generados por Express/body-parser (p. ej. JSON malformado). */
function getClientErrorStatus(err: unknown): number | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  const status = (err as { status?: unknown }).status;
  return typeof status === "number" && status >= 400 && status < 500 ? status : undefined;
}

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `El archivo supera el tamaño máximo (${MAX_FILE_SIZE / 1024 / 1024} MB)`
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? 'Campo de archivo inesperado. Usa un único campo llamado "file"'
          : `Error al procesar el archivo (${err.code})`;
    res.status(status).json({ error: message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Datos inválidos",
      details: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
    });
    return;
  }

  const clientStatus = getClientErrorStatus(err);
  if (clientStatus) {
    const type = (err as { type?: unknown }).type;
    const message =
      type === "entity.parse.failed"
        ? "El cuerpo de la petición no es un JSON válido"
        : type === "entity.too.large"
          ? "El cuerpo de la petición es demasiado grande"
          : "Petición inválida";
    res.status(clientStatus).json({ error: message });
    return;
  }

  console.error(err);
  const payload: { error: string; stack?: string } = { error: "Error interno del servidor" };
  if (!env.isProduction && err instanceof Error) {
    payload.stack = err.stack;
  }
  res.status(500).json(payload);
}
