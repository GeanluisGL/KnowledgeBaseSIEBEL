import type { Request, Response } from "express";
import type { CreateContentInput, UpdateContentInput } from "../schemas/content.schema";
import { listContentQuerySchema } from "../schemas/content.schema";
import * as contentService from "../services/content.service";
import { HttpError } from "../utils/httpError";

export function list(req: Request, res: Response): void {
  const query = listContentQuerySchema.parse(req.query);
  res.json(contentService.listContents(query));
}

export function getById(req: Request, res: Response): void {
  res.json(contentService.getContent(String(req.params.id)));
}

export async function create(req: Request, res: Response): Promise<void> {
  if (!req.user) throw new HttpError(401, "No autenticado");
  const content = await contentService.createContent(req.body as CreateContentInput, req.user.id);
  res.status(201).json(content);
}

export async function update(req: Request, res: Response): Promise<void> {
  const content = await contentService.updateContent(String(req.params.id), req.body as UpdateContentInput);
  res.json(content);
}

export async function remove(req: Request, res: Response): Promise<void> {
  await contentService.deleteContent(String(req.params.id));
  res.status(204).send();
}
