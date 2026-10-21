import { randomUUID } from "node:crypto";
import type { Role, User } from "../config/db";
import { getDb } from "../config/db";
import { HttpError } from "../utils/httpError";
import { hashPassword } from "../utils/password";

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return getDb().data.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserByName(name: string): User | undefined {
  const normalized = name.trim().toLowerCase();
  return getDb().data.users.find((u) => u.name.toLowerCase() === normalized);
}

export function findUserById(id: string): User | undefined {
  return getDb().data.users.find((u) => u.id === id);
}

export function listUsers(): PublicUser[] {
  return getDb().data.users.map(toPublicUser);
}

interface NewUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

/**
 * Crea un usuario. El hash se calcula ANTES de las comprobaciones, y las comprobaciones
 * y el push se hacen sin ningún `await` en medio, para que dos peticiones simultáneas
 * no puedan duplicar el email ni crear dos "primeros usuarios".
 */
export async function createUser(
  input: NewUserInput,
  options: { onlyIfDbEmpty?: boolean } = {}
): Promise<User> {
  const db = getDb();
  const passwordHash = await hashPassword(input.password);

  if (options.onlyIfDbEmpty && db.data.users.length > 0) {
    throw new HttpError(403, "El registro público está deshabilitado: ya existe al menos un usuario");
  }
  if (findUserByEmail(input.email)) {
    throw new HttpError(409, "Ya existe un usuario con ese email");
  }

  const user: User = {
    id: randomUUID(),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash,
    role: input.role,
    createdAt: new Date().toISOString(),
  };

  db.data.users.push(user);
  await db.write();
  return user;
}

export async function updateUser(id: string, input: Partial<NewUserInput>): Promise<User> {
  const db = getDb();
  const idx = db.data.users.findIndex((u) => u.id === id);
  if (idx === -1) throw new HttpError(404, "Usuario no encontrado");

  if (input.email) {
    const normalized = input.email.trim().toLowerCase();
    const conflict = db.data.users.find((u) => u.email.toLowerCase() === normalized && u.id !== id);
    if (conflict) throw new HttpError(409, "Ya existe un usuario con ese email");
  }

  const existing = db.data.users[idx];
  const passwordHash = input.password ? await hashPassword(input.password) : existing.passwordHash;

  db.data.users[idx] = {
    ...existing,
    name: input.name?.trim() ?? existing.name,
    email: input.email?.trim().toLowerCase() ?? existing.email,
    role: input.role ?? existing.role,
    passwordHash,
  };

  await db.write();
  return db.data.users[idx];
}

export async function deleteUser(id: string, requesterId: string): Promise<void> {
  const db = getDb();
  if (id === requesterId) throw new HttpError(400, "No puedes eliminar tu propia cuenta");

  const admins = db.data.users.filter((u) => u.role === "admin");
  const target = db.data.users.find((u) => u.id === id);
  if (!target) throw new HttpError(404, "Usuario no encontrado");
  if (target.role === "admin" && admins.length <= 1) {
    throw new HttpError(400, "No puedes eliminar el último administrador");
  }

  db.data.users = db.data.users.filter((u) => u.id !== id);
  await db.write();
}
