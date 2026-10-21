import "dotenv/config";
import path from "node:path";

const isProduction = process.env.NODE_ENV === "production";

const DEV_FALLBACK_SECRET = "dev-only-insecure-secret-change-me";

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return secret;

  if (isProduction) {
    throw new Error("JWT_SECRET es obligatorio en producción. Defínelo en el archivo .env");
  }

  console.warn(
    "[aviso] JWT_SECRET no está definido: se usa un secreto inseguro SOLO para desarrollo. " +
      "Copia .env.example a .env y define uno propio."
  );
  return DEV_FALLBACK_SECRET;
}

function resolvePort(): number {
  const raw = process.env.PORT?.trim();
  if (!raw) return 4000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT inválido: "${raw}"`);
  }
  return port;
}

function resolveCorsOrigin(): string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw || raw === "*") return "*";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const env = {
  isProduction,
  port: resolvePort(),
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN?.trim() || "8h",
  corsOrigin: resolveCorsOrigin(),
  dbPath: path.resolve(process.cwd(), process.env.DB_PATH?.trim() || "./data/db.json"),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR?.trim() || "./uploads"),
  frontendDist: path.resolve(process.cwd(), process.env.FRONTEND_DIST?.trim() || "../client/dist"),
};
