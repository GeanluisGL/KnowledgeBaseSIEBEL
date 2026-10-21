import { z } from "zod";

const email = z
  .string({ required_error: "El email es obligatorio" })
  .trim()
  .toLowerCase()
  .email("Email inválido");

const name = z
  .string({ required_error: "El nombre es obligatorio" })
  .trim()
  .min(1, "El nombre es obligatorio")
  .max(100, "El nombre no puede superar 100 caracteres");

const newPassword = z
  .string({ required_error: "La contraseña es obligatoria" })
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(72, "La contraseña no puede superar 72 caracteres");

export const registerSchema = z.object({
  name,
  email,
  password: newPassword,
});

export const loginSchema = z.object({
  identifier: z
    .string({ required_error: "El nombre de usuario es obligatorio" })
    .trim()
    .min(1, "El nombre de usuario es obligatorio"),
  password: z.string({ required_error: "La contraseña es obligatoria" }).min(1, "La contraseña es obligatoria"),
});

export const createUserSchema = z.object({
  name,
  email,
  password: newPassword,
  role: z.enum(["viewer", "admin"], { errorMap: () => ({ message: 'El rol debe ser "viewer" o "admin"' }) }).default("viewer"),
});

export const updateUserSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  password: newPassword.optional(),
  role: z.enum(["viewer", "admin"], { errorMap: () => ({ message: 'El rol debe ser "viewer" o "admin"' }) }).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
