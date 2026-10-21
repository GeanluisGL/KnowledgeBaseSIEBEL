import type { NextFunction, Request, Response } from "express";
import type { Role } from "../config/db";
import { getDb } from "../config/db";
import { HttpError } from "../utils/httpError";
import { verifyToken } from "../utils/jwt";

export interface AuthUser {
  id: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verifica el JWT del header "Authorization: Bearer <token>" y adjunta req.user = { id, role }.
 * El rol se lee de la base de datos (no del token) para que un cambio de rol o la
 * eliminación de un usuario surta efecto de inmediato.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header) {
    throw new HttpError(401, "Token no proporcionado. Usa el header Authorization: Bearer <token>");
  }

  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new HttpError(401, "Formato de Authorization inválido. Usa: Bearer <token>");
  }

  let userId: string;
  try {
    userId = verifyToken(token).userId;
  } catch {
    throw new HttpError(401, "Token inválido o expirado");
  }

  const user = getDb().data.users.find((u) => u.id === userId);
  if (!user) {
    throw new HttpError(401, "El usuario del token ya no existe");
  }

  req.user = { id: user.id, role: user.role };
  next();
}
