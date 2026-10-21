import { z } from "zod";

const title = z
  .string({ required_error: "El título es obligatorio" })
  .trim()
  .min(1, "El título es obligatorio")
  .max(200, "El título no puede superar 200 caracteres");

const category = z
  .string({ required_error: "La categoría es obligatoria" })
  .trim()
  .min(1, "La categoría es obligatoria")
  .max(100, "La categoría no puede superar 100 caracteres");

const summary = z
  .string({ required_error: "El resumen es obligatorio" })
  .trim()
  .min(1, "El resumen es obligatorio")
  .max(500, "El resumen no puede superar 500 caracteres");

const body = z
  .string({ required_error: "El contenido es obligatorio" })
  .trim()
  .min(1, "El contenido es obligatorio");

export const createContentSchema = z.object({ title, category, summary, body });

export const updateContentSchema = createContentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Envía al menos un campo para actualizar (title, category, summary o body)",
  });

export const listContentQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ListContentQuery = z.infer<typeof listContentQuerySchema>;
