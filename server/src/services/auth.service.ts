import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { HttpError } from "../utils/httpError";
import { signToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { createUser, findUserByEmail, findUserByName, findUserById, toPublicUser } from "./users.service";
import type { PublicUser } from "./users.service";

export interface AuthResult {
  token: string;
  user: PublicUser;
}

// Hash de relleno: se compara contra él cuando el email no existe, para que el
// tiempo de respuesta no revele si el usuario existe o no.
const dummyHashPromise = hashPassword("contraseña-de-relleno");

export async function register(input: RegisterInput): Promise<AuthResult> {
  const user = await createUser(
    { name: input.name, email: input.email, password: input.password, role: "admin" },
    { onlyIfDbEmpty: true }
  );
  return { token: signToken(user), user: toPublicUser(user) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = findUserByName(input.identifier) ?? findUserByEmail(input.identifier);
  const hash = user ? user.passwordHash : await dummyHashPromise;
  const passwordOk = await verifyPassword(input.password, hash);

  if (!user || !passwordOk) {
    throw new HttpError(401, "Credenciales inválidas");
  }

  return { token: signToken(user), user: toPublicUser(user) };
}

export function getMe(userId: string): PublicUser {
  const user = findUserById(userId);
  if (!user) {
    throw new HttpError(401, "El usuario ya no existe");
  }
  return toPublicUser(user);
}
