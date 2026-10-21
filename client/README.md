# Base de Conocimiento — Frontend

Cliente React + TypeScript (Vite + Tailwind) para la API REST de la Base de Conocimiento Interna. Solo dependencias JS puras: no requiere node-gyp ni Visual Studio Build Tools.

## 1. Requisitos
- Node.js 20+ y npm
- Backend Express corriendo en `http://localhost:4000`

## 2. Instalación
```bash
npm install
copy .env.example .env      # Windows (en macOS/Linux: cp .env.example .env)
npm run dev
```

## 3. URL
http://localhost:5173

## 4. Credenciales de prueba
| Rol    | Email               | Contraseña  |
|--------|---------------------|-------------|
| Admin  | admin@empresa.com   | Admin123!   |
| Viewer | viewer@empresa.com  | Viewer123!  |

## 5. Rutas
| Ruta               | Acceso    | Descripción                                                        |
|--------------------|-----------|--------------------------------------------------------------------|
| `/login`           | Pública   | Inicio de sesión con email y contraseña                            |
| `/`                | Protegida | Dashboard: resumen, búsqueda (debounce 300 ms), filtro por categoría y grid de contenidos |
| `/content/:id`     | Protegida | Detalle con el body renderizado en Markdown; admin: Editar / Eliminar |
| `/admin/contents`  | Admin     | Tabla de contenidos, crear, editar (`?edit=<id>` abre el modal) y eliminar |
| `/admin/users`     | Admin     | Tabla de usuarios y creación de usuarios                           |
| `*`                | Pública   | 404 con enlace a `/`                                               |

Un usuario `viewer` que entra a una ruta de admin es redirigido a `/`.

## 6. Sesión y token
- El token JWT se guarda en `localStorage` (clave `kb_token`).
- Al cargar la app se valida con `GET /api/auth/me`. Si falla, se borra el token y se redirige a `/login`.
- Se elimina al cerrar sesión y cuando cualquier petición recibe un `401` (el interceptor de axios limpia el token y avisa al `AuthContext`, que redirige a `/login`).

## 7. Cambiar el puerto del backend
Actualiza `VITE_API_URL` en `.env` (por ejemplo `VITE_API_URL=http://localhost:5000`) y reinicia `npm run dev`.

## Scripts
- `npm run dev` — servidor de desarrollo
- `npm run build` — typecheck + build de producción
- `npm run preview` — sirve el build
- `npm run typecheck` — verifica tipos

## Archivos en el contenido
En el modal de contenido, "Insertar archivo" (o Ctrl+V) sube imágenes, PDF o DOCX a `POST /api/uploads` (campo `file`, respuesta `{ url }`) e inserta en el Markdown `![](url)` o `[nombre.pdf](url)`. En el detalle, los PDF se muestran con el visor del navegador y los DOCX con `docx-preview`; ambos se descargan con JWT y se muestran tal cual el original.
