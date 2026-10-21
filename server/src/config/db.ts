import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Low } from "lowdb";
import { JSONFilePreset } from "lowdb/node";
import bcrypt from "bcryptjs";
import { env } from "./env";

export type Role = "admin" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Content {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface Schema {
  users: User[];
  contents: Content[];
}

let db: Low<Schema> | undefined;

/** Devuelve la instancia de LowDB ya inicializada (ver initDb). */
export function getDb(): Low<Schema> {
  if (!db) {
    throw new Error("La base de datos no está inicializada. Llama a initDb() antes de usarla.");
  }
  return db;
}

function buildSeed(): Schema {
  const now = new Date().toISOString();
  const adminId = randomUUID();
  const viewerId = randomUUID();

  const users: User[] = [
    {
      id: adminId,
      name: "Administrador",
      email: "admin@empresa.com",
      passwordHash: bcrypt.hashSync("Admin123!", 10),
      role: "admin",
      createdAt: now,
    },
    {
      id: viewerId,
      name: "Usuario Lector",
      email: "viewer@empresa.com",
      passwordHash: bcrypt.hashSync("Viewer123!", 10),
      role: "viewer",
      createdAt: now,
    },
  ];

  const contents: Content[] = [
    {
      id: randomUUID(),
      title: "Política de vacaciones y permisos",
      category: "RRHH",
      summary: "Cómo solicitar vacaciones, permisos remunerados y licencias especiales.",
      body:
        "Todos los empleados tienen derecho a 15 días hábiles de vacaciones por año trabajado.\n\n" +
        "Para solicitarlas, registra la petición en el portal de RRHH con al menos 15 días de anticipación " +
        "y espera la aprobación de tu jefe directo.\n\n" +
        "Los permisos por motivos personales (trámites, citas médicas) deben comunicarse con 48 horas de " +
        "anticipación salvo emergencias.",
      createdAt: now,
      updatedAt: now,
      authorId: adminId,
    },
    {
      id: randomUUID(),
      title: "Guía de acceso a la VPN corporativa",
      category: "TI",
      summary: "Pasos para instalar y configurar la VPN desde un equipo personal o corporativo.",
      body:
        "1. Descarga el cliente VPN desde el portal de TI.\n" +
        "2. Instálalo con permisos de administrador.\n" +
        "3. Ingresa con tu usuario corporativo y el segundo factor de autenticación.\n\n" +
        "Si tienes problemas de conexión, abre un ticket en la mesa de ayuda indicando tu sistema operativo " +
        "y el mensaje de error exacto.",
      createdAt: now,
      updatedAt: now,
      authorId: adminId,
    },
    {
      id: randomUUID(),
      title: "Proceso de cotización y cierre de ventas",
      category: "Ventas",
      summary: "Etapas del embudo comercial, plantillas de cotización y criterios de aprobación de descuentos.",
      body:
        "El embudo comercial tiene cinco etapas: prospección, calificación, propuesta, negociación y cierre.\n\n" +
        "Toda cotización debe generarse desde la plantilla oficial y registrarse en el CRM.\n\n" +
        "Los descuentos de hasta 10% pueden aprobarse por el ejecutivo de cuenta; mayores a 10% requieren " +
        "autorización del gerente comercial.",
      createdAt: now,
      updatedAt: now,
      authorId: adminId,
    },
  ];

  return { users, contents };
}

/**
 * Inicializa LowDB. Si el archivo JSON no existe lo crea con datos seed;
 * si existe, lo carga tal cual.
 */
export async function initDb(): Promise<Low<Schema>> {
  const file = env.dbPath;
  fs.mkdirSync(path.dirname(file), { recursive: true });

  const isNewFile = !fs.existsSync(file);

  try {
    db = await JSONFilePreset<Schema>(file, { users: [], contents: [] });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `No se pudo leer ${file} (${reason}). Corrige el JSON o borra el archivo para regenerar los datos seed.`
    );
  }

  if (isNewFile) {
    db.data = buildSeed();
    await db.write();
    console.log(`Base de datos creada con datos seed en ${file}`);
  } else {
    // Tolera archivos antiguos o editados a mano a los que les falte alguna colección.
    db.data.users ??= [];
    db.data.contents ??= [];
  }

  return db;
}
