import fs from "node:fs";
import path from "node:path";
import type { Request, Response } from "express";
import { ALLOWED_DESCRIPTION, MAX_FILE_SIZE, hasValidSignature } from "../config/upload";
import { HttpError } from "../utils/httpError";

export function uploadFile(req: Request, res: Response): void {
  const file = req.file;
  if (!file) {
    throw new HttpError(
      400,
      `Archivo inválido o ausente. Envía un campo "file" con ${ALLOWED_DESCRIPTION} (máx. ${MAX_FILE_SIZE / 1024 / 1024} MB)`
    );
  }

  // El contenido debe corresponder a la extensión; si no, se borra el archivo ya guardado.
  if (!hasValidSignature(file.path, path.extname(file.filename).toLowerCase())) {
    fs.rmSync(file.path, { force: true });
    throw new HttpError(400, "El contenido del archivo no coincide con su extensión");
  }

  res.status(201).json({
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    originalName: Buffer.from(file.originalname, "latin1").toString("utf8"),
    mimetype: file.mimetype,
    size: file.size,
  });
}
