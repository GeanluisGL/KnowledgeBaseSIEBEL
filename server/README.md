# Base de Conocimiento Interna — API REST

Backend (solo API) en **Node.js + Express + TypeScript**, con autenticación JWT propia y persistencia en un archivo JSON (LowDB). Todo el stack es JavaScript puro: **no hay Prisma, ni sqlite, ni `bcrypt` nativo, ni node-gyp**, así que `npm install` funciona en Windows sin Visual Studio Build Tools.

## 1. Requisitos

- Node.js 20 o superior
- npm

## 2. Instalación

```bash
cd server
npm install
copy .env.example .env      # en PowerShell/CMD (Windows)
# cp .env.example .env      # en macOS / Linux / Git Bash
npm run dev
```

No hay migraciones ni seeds manuales: al arrancar por primera vez se crea `data/db.json` con los datos de ejemplo.

Scripts disponibles:

| Script | Qué hace |
|---|---|
| `npm run dev` | Arranca con recarga automática (`tsx watch`) |
| `npm start` | Arranca sin recarga |
| `npm run typecheck` | Comprueba los tipos con `tsc --noEmit` |

Al arrancar verás: `API corriendo en http://localhost:4000`

## 3. URL base

```
http://localhost:4000
```

Todos los endpoints cuelgan de `/api`. Hay además un `GET /api/health` público que responde `{ "status": "ok" }`.

## 4. Variables de entorno (`.env`)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `4000` |
| `JWT_SECRET` | Secreto para firmar los JWT (**cámbialo**) | — |
| `JWT_EXPIRES_IN` | Duración del token | `8h` |
| `CORS_ORIGIN` | Orígenes permitidos, separados por coma, o `*` | `*` |
| `DB_PATH` | Ruta del archivo JSON de datos | `./data/db.json` |
| `UPLOAD_DIR` | Carpeta de los archivos subidos | `./uploads` |

## 5. Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|---|---|---|
| admin | `admin@empresa.com` | `Admin123!` |
| viewer | `viewer@empresa.com` | `Viewer123!` |

El seed incluye además 3 contenidos de ejemplo en las categorías `RRHH`, `TI` y `Ventas`.

## 6. Endpoints

Los endpoints autenticados requieren el header `Authorization: Bearer <token>`.

| # | Método | Ruta | Body | Rol requerido |
|---|---|---|---|---|
| 1 | POST | `/api/auth/register` | `{ name, email, password }` | Público (solo si no existe ningún usuario) |
| 2 | POST | `/api/auth/login` | `{ email, password }` | Público |
| 3 | GET | `/api/auth/me` | — | Cualquier usuario autenticado |
| 4 | GET | `/api/content?search=&category=` | — | Cualquier usuario autenticado |
| 5 | GET | `/api/content/:id` | — | Cualquier usuario autenticado |
| 6 | POST | `/api/content` | `{ title, category, summary, body }` | admin |
| 7 | PUT | `/api/content/:id` | Cualquiera de `title`, `category`, `summary`, `body` (al menos uno) | admin |
| 8 | DELETE | `/api/content/:id` | — | admin |
| 9 | GET | `/api/users` | — | admin |
| 10 | POST | `/api/users` | `{ name, email, password, role }` (`role`: `viewer` \| `admin`, por defecto `viewer`) | admin |
| 11 | POST | `/api/uploads` | `multipart/form-data` con un campo `file` (imagen, PDF, DOCX, Markdown/TXT; máx. 20 MB) | admin |
| 12 | GET | `/uploads/<archivo>` | — | Público (URL con nombre UUID) |

### Ejemplos de respuesta

**POST `/api/auth/login`** → `200`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "…", "name": "Administrador", "email": "admin@empresa.com", "role": "admin", "createdAt": "…" }
}
```
Credenciales incorrectas → `401 { "error": "Credenciales inválidas" }`

**POST `/api/auth/register`** → `201` con el mismo formato que login (rol `admin`).
Si ya existe algún usuario → `403 { "error": "El registro público está deshabilitado: ya existe al menos un usuario" }`

> Como el seed ya crea usuarios, `register` responde `403` en una instalación normal. Solo funciona si `data/db.json` contiene `{ "users": [], "contents": [] }`.

**GET `/api/auth/me`** → `200`
```json
{ "id": "…", "name": "Usuario Lector", "email": "viewer@empresa.com", "role": "viewer", "createdAt": "…" }
```

**GET `/api/content`** → `200` (ordenado por `updatedAt` descendente)
```json
[
  {
    "id": "…",
    "title": "Guía de acceso a la VPN corporativa",
    "category": "TI",
    "summary": "Pasos para instalar y configurar la VPN…",
    "authorName": "Administrador",
    "updatedAt": "2026-10-20T01:43:08.675Z"
  }
]
```
- `search`: texto que se busca (sin distinguir mayúsculas) en `title` y `summary`.
- `category`: coincidencia exacta (por ejemplo `?category=TI`). Ambos filtros se pueden combinar.

**GET `/api/content/:id`** → `200`
```json
{
  "id": "…",
  "title": "…",
  "category": "TI",
  "summary": "…",
  "body": "…",
  "createdAt": "…",
  "updatedAt": "…",
  "authorId": "…",
  "author": { "id": "…", "name": "Administrador", "email": "admin@empresa.com" },
  "authorName": "Administrador"
}
```
No existe → `404 { "error": "Contenido no encontrado" }`

**POST `/api/content`** → `201` con el contenido creado (mismo formato que el detalle).
**PUT `/api/content/:id`** → `200` con el contenido actualizado (actualiza `updatedAt`).
**DELETE `/api/content/:id`** → `204` sin cuerpo.

**GET `/api/users`** → `200`
```json
[ { "id": "…", "name": "Administrador", "email": "admin@empresa.com", "role": "admin", "createdAt": "…" } ]
```

**POST `/api/users`** → `201`
```json
{ "id": "…", "name": "Nuevo Lector", "email": "nuevo@empresa.com", "role": "viewer", "createdAt": "…" }
```
Email repetido → `409 { "error": "Ya existe un usuario con ese email" }`

### Subida de archivos

`POST /api/uploads` (solo admin) guarda un archivo en la carpeta `uploads/` (configurable con `UPLOAD_DIR`) y devuelve su URL, que puedes pegar en el Markdown de un contenido, por ejemplo `![logo](http://localhost:4000/uploads/<uuid>.png)` o `[Manual](http://localhost:4000/uploads/<uuid>.pdf)`.

| Tipo | Extensiones |
|---|---|
| Imágenes | `.png`, `.jpg`/`.jpeg`, `.gif`, `.webp` |
| Documentos | `.pdf`, `.docx` |
| Texto / Markdown | `.md`, `.markdown`, `.txt` (p. ej. un `README.md`) |

- Se valida que **extensión y MIME coincidan** y que el **contenido real** corresponda al tipo (un `.pdf` que en realidad es texto se rechaza y se borra).
- Los `.md`/`.txt` también se aceptan con MIME `application/octet-stream`, porque Windows y Postman suelen enviarlos así.
- SVG **no** se admite (puede contener scripts). Para subir `.doc`, `.xlsx`, etc. hay que añadirlos a la lista `FILE_TYPES` de `src/config/upload.ts`.
- El archivo se guarda con nombre `<uuid><extensión>`; el nombre original solo se devuelve en la respuesta.

**Postman:** `POST http://localhost:4000/api/uploads` → pestaña **Body → form-data** → clave `file` con tipo **File** → elige el archivo (más el Bearer token de un admin).

```bash
curl -X POST http://localhost:4000/api/uploads \
  -H "Authorization: Bearer <token-admin>" \
  -F "file=@./manual.pdf"
```

Respuesta `201`:
```json
{
  "url": "/uploads/9bba8bbc-922e-42e8-a6cd-6bc7ad5980f7.pdf",
  "filename": "9bba8bbc-922e-42e8-a6cd-6bc7ad5980f7.pdf",
  "originalName": "manual.pdf",
  "mimetype": "application/pdf",
  "size": 104857
}
```
Errores: `400` (tipo no permitido, contenido que no coincide o falta el campo `file`), `401`, `403` (no admin), `413` (supera 20 MB).

> Los archivos de `/uploads` son **públicos** (hacen falta para `<img>` y enlaces dentro del Markdown, que no pueden enviar el token), pero los nombres UUID no se pueden adivinar. No subas información realmente confidencial. Se sirven con `X-Content-Type-Options: nosniff`. No se borran al eliminar un contenido.

### Errores

Todos los errores son JSON con la forma `{ "error": "mensaje" }`.

| Código | Cuándo |
|---|---|
| 400 | Validación fallida, JSON malformado o archivo no permitido. En validación incluye `details` con `path` y `message` por campo |
| 413 | Archivo subido de más de 20 MB |
| 401 | Sin token, token inválido/expirado o credenciales incorrectas |
| 403 | Rol insuficiente, o `register` con usuarios ya existentes |
| 404 | Contenido o ruta inexistente |
| 409 | Email duplicado |
| 500 | Error inesperado (sin stack trace en producción) |

Ejemplo de `400`:
```json
{
  "error": "Datos inválidos",
  "details": [
    { "path": "title", "message": "El título es obligatorio" },
    { "path": "summary", "message": "El resumen es obligatorio" }
  ]
}
```

## 7. Cómo obtener y usar el token

### Con curl

```bash
# 1) Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empresa.com","password":"Admin123!"}'

# 2) Usar el token devuelto
curl http://localhost:4000/api/content \
  -H "Authorization: Bearer <pega-aquí-el-token>"
```

### Con Postman

1. Crea una petición `POST http://localhost:4000/api/auth/login`, pestaña **Body → raw → JSON**:
   ```json
   { "email": "admin@empresa.com", "password": "Admin123!" }
   ```
2. Envíala y copia el valor de `token` de la respuesta.
3. En las demás peticiones, abre la pestaña **Authorization**, elige **Bearer Token** y pega el token. (Equivale a enviar el header `Authorization: Bearer <token>`.)
4. Para probar el rol viewer, haz login con `viewer@empresa.com` / `Viewer123!`: `POST /api/content` devolverá `403`.

En **Thunder Client** el procedimiento es el mismo: pestaña **Auth → Bearer** y pegar el token.

El token caduca a las 8 horas (configurable con `JWT_EXPIRES_IN`); pasado ese tiempo, vuelve a hacer login.

## 8. Dónde se guardan los datos y cómo resetearlos

Los datos viven en **`data/db.json`** (o la ruta definida en `DB_PATH`), con esta forma:

```json
{
  "users":    [ { "id", "name", "email", "passwordHash", "role", "createdAt" } ],
  "contents": [ { "id", "title", "category", "summary", "body", "createdAt", "updatedAt", "authorId" } ]
}
```

- El archivo se crea automáticamente con los datos seed si no existe; si existe, se carga tal cual.
- Las contraseñas se guardan hasheadas con `bcryptjs` (10 rounds); nunca se devuelven en las respuestas.
- **Para resetear:** detén el servidor, borra `data/db.json` y vuelve a ejecutar `npm run dev`. Se regenerará con el seed original.

## 9. Estructura del proyecto

```
server/
├── src/
│   ├── config/        env.ts, db.ts (LowDB y seed), upload.ts (multer)
│   ├── middlewares/   auth.ts, roles.ts, validate.ts, errorHandler.ts
│   ├── routes/        auth, content, users, uploads (.routes.ts)
│   ├── controllers/   auth, content, users, uploads (.controller.ts)
│   ├── services/      auth.service.ts, content.service.ts, users.service.ts
│   ├── schemas/       auth.schema.ts, content.schema.ts (Zod)
│   ├── utils/         jwt.ts, password.ts, httpError.ts
│   ├── app.ts         configuración de Express
│   └── server.ts      arranque
├── data/db.json       (se genera al arrancar)
├── uploads/           (archivos subidos; se crea al arrancar)
├── .env.example
├── package.json
└── tsconfig.json
```

## 10. Notas de seguridad

- El rol del usuario se lee de la base de datos en cada petición (no del token), así que eliminar un usuario o cambiar su rol surte efecto de inmediato.
- Antes de desplegar, define un `JWT_SECRET` largo y aleatorio. Con `NODE_ENV=production` el servidor se niega a arrancar si falta.
- LowDB guarda todo en un único archivo JSON: es ideal para desarrollo y volúmenes pequeños, no para alta concurrencia.
