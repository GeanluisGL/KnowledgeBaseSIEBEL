import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import type { Role } from "../config/db";

export function signToken(user: { id: string; role: Role }): string {
  return jwt.sign({ role: user.role }, env.jwtSecret, {
    algorithm: "HS256",
    subject: user.id,
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  });
}

/** Verifica firma y expiración. Lanza si el token no es válido. Devuelve el id del usuario (claim "sub"). */
export function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  if (typeof decoded === "string" || typeof decoded.sub !== "string") {
    throw new Error("Formato de token inválido");
  }
  return { userId: decoded.sub };
}
