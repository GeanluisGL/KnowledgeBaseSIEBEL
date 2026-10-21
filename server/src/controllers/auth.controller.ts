import type { Request, Response } from "express";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import * as authService from "../services/auth.service";
import { HttpError } from "../utils/httpError";

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body as RegisterInput);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as LoginInput);
  res.json(result);
}

export function me(req: Request, res: Response): void {
  if (!req.user) throw new HttpError(401, "No autenticado");
  res.json(authService.getMe(req.user.id));
}
