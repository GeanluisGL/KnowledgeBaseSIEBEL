import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { env } from "./env";

export const UPLOAD_DIR = env.uploadDir;
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Tipos permitidos. Se exige que la EXTENSIÓN y el MIME coincidan con uno de estos grupos.
 * Los .md/.txt aceptan también "application/octet-stream" porque muchos navegadores y
 * clientes (Windows, Postman) no conocen el MIME de Markdown y lo envían así.
 * SVG queda fuera a propósito: puede contener scripts (XSS) al abrirse desde el servidor.
 */
const FILE_TYPES: { extensions: string[]; mimes: string[] }[] = [
  { extensions: [".png"], mimes: ["image/png"] },
  { extensions: [".jpg", ".jpeg"], mimes: ["image/jpeg", "image/jpg"] },
  { extensions: [".gif"], mimes: ["image/gif"] },
  { extensions: [".webp"], mimes: ["image/webp"] },
  { extensions: [".pdf"], mimes: ["application/pdf"] },
  {
    extensions: [".docx"],
    mimes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
  {
    extensions: [".md", ".markdown", ".txt"],
    mimes: ["text/markdown", "text/x-markdown", "text/plain", "application/octet-stream"],
  },
];

export const ALLOWED_DESCRIPTION = "imagen (PNG, JPG, GIF, WEBP), PDF, DOCX o Markdown/TXT";

export function isAllowedFile(originalName: string, mimetype: string): boolean {
  const ext = path.extname(originalName).toLowerCase();
  return FILE_TYPES.some((type) => type.extensions.includes(ext) && type.mimes.includes(mimetype.toLowerCase()));
}

/**
 * Comprobación del contenido real (firma de bytes) para que un archivo no se haga pasar
 * por otro cambiando solo la extensión o el MIME. Devuelve true si el contenido es coherente.
 */
export function hasValidSignature(filePath: string, ext: string): boolean {
  const fd = fs.openSync(filePath, "r");
  try {
    const head = Buffer.alloc(12);
    const read = fs.readSync(fd, head, 0, 12, 0);
    const buf = head.subarray(0, read);
    const startsWith = (bytes: number[]) => bytes.every((byte, i) => buf[i] === byte);

    switch (ext) {
      case ".png":
        return startsWith([0x89, 0x50, 0x4e, 0x47]);
      case ".jpg":
      case ".jpeg":
        return startsWith([0xff, 0xd8, 0xff]);
      case ".gif":
        return startsWith([0x47, 0x49, 0x46, 0x38]); // GIF8
      case ".webp":
        return buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
      case ".pdf":
        return buf.subarray(0, 4).toString("ascii") === "%PDF";
      case ".docx":
        return startsWith([0x50, 0x4b]); // "PK" (un .docx es un ZIP)
      case ".md":
      case ".markdown":
      case ".txt":
        return !buf.includes(0); // texto: sin bytes nulos
      default:
        return false;
    }
  } finally {
    fs.closeSync(fd);
  }
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => cb(null, randomUUID() + path.extname(file.originalname).toLowerCase()),
  }),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  // Si no es válido se descarta sin error: el controlador responde 400 al no haber req.file.
  fileFilter: (_req, file, cb) => cb(null, isAllowedFile(file.originalname, file.mimetype)),
});
