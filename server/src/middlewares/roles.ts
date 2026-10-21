import type { NextFunction, Request, Response } from "express";
import type { Role } from "../config/db";
import { HttpError } from "../utils/httpError";

/** Debe usarse después de `authenticate`. Responde 403 si el rol no está permitido. */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, "No autenticado");
    }
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "No tienes permisos para realizar esta acción");
    }
    next();
  };
}
