import type { Request, Response } from "express";
import type { CreateUserInput, UpdateUserInput } from "../schemas/auth.schema";
import * as usersService from "../services/users.service";

export function list(_req: Request, res: Response): void {
  res.json(usersService.listUsers());
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = await usersService.createUser(req.body as CreateUserInput);
  res.status(201).json(usersService.toPublicUser(user));
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = await usersService.updateUser(req.params.id, req.body as UpdateUserInput);
  res.json(usersService.toPublicUser(user));
}

export async function remove(req: Request, res: Response): Promise<void> {
  await usersService.deleteUser(req.params.id, req.user!.id);
  res.status(204).end();
}
