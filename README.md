# KnowledgeBaseSIEBEL

> Base de conocimiento interna para documentación y gestión de contenidos relacionados con Siebel CRM.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Desarrollo Local](#desarrollo-local)
  - [Docker Compose (Producción)](#docker-compose-producción)
- [Variables de Entorno](#variables-de-entorno)
- [API Reference](#api-reference)
- [Rutas del Frontend](#rutas-del-frontend)
- [Roles y Permisos](#roles-y-permisos)
- [Gestión de Archivos](#gestión-de-archivos)
- [Asistentes de IA](#asistentes-de-ia)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Notas de Seguridad](#notas-de-seguridad)

---

## Descripción General

**KnowledgeBaseSIEBEL** es una aplicación web full-stack para gestionar y consultar una base de conocimiento interna. Permite a los equipos centralizar documentación en formato Markdown, con soporte para adjuntos (imágenes, PDF, DOCX), búsqueda en tiempo real, filtrado por categorías y control de acceso por roles.

Está diseñada para entornos con volumen moderado de documentación y no requiere base de datos externa: toda la persistencia se gestiona en un archivo JSON mediante LowDB.

---

## Arquitectura

```
KnowledgeBaseSIEBEL/
├── client/          # SPA React + TypeScript (Vite + Tailwind)
├── server/          # API REST Node.js + Express + TypeScript
├── docker-compose.yml
└── .env             # Variables de entorno globales
```

```
┌──────────────────────┐         ┌─────────────────────────┐
│  Frontend (React)    │ ──HTTP──▶  Backend (Express API)  │
│  Puerto: 5173 (dev)  │         │  Puerto: 4000 (dev)     │
│  Puerto: 80   (prod) │         │  Puerto: 3000 (Docker)  │
└──────────────────────┘         └─────────────────────────┘
                                          │
                                  ┌───────┴────────┐
                                  │  data/db.json  │  (LowDB)
                                  │  uploads/      │  (Archivos)
                                  └────────────────┘
```

En producción con Docker Compose, el backend permanece en la red interna y solo el frontend es accesible desde el exterior (puerto 80).

---

## Tecnologías

### Frontend
| Tecnología     | Versión mínima | Uso                            |
|----------------|----------------|--------------------------------|
| React          | 18+            | Framework UI                   |
| TypeScript     | 5+             | Tipado estático                |
| Vite           | 5+             | Bundler y servidor de dev      |
| Tailwind CSS   | 3+             | Estilos utilitarios            |
| Axios          | —              | Cliente HTTP con interceptores |
| docx-preview   | —              | Visualizador de archivos DOCX  |
| Nginx          | —              | Servidor estático (producción) |

### Backend
| Tecnología  | Versión mínima | Uso                              |
|-------------|----------------|----------------------------------|
| Node.js     | 20+            | Runtime                          |
| TypeScript  | 5+             | Tipado estático                  |
| Express     | —              | Framework REST API               |
| LowDB       | —              | Base de datos JSON               |
| JWT         | —              | Autenticación stateless          |
| bcryptjs    | —              | Hash de contraseñas              |
| Zod         | —              | Validación de schemas            |
| multer      | —              | Subida de archivos (máx. 20 MB)  |

### Infraestructura
| Tecnología     | Uso                    |
|----------------|------------------------|
| Docker         | Contenedores           |
| Docker Compose | Orquestación local     |

---

## Requisitos Previos

- **Node.js** 20 o superior
- **npm** (incluido con Node.js)
- **Docker** y **Docker Compose** (solo para despliegue en contenedores)

---

## Instalación y Configuración

### Desarrollo Local

#### 1. Clonar el repositorio

```bash
git clone https://github.com/GeanluisGL/KnowledgeBaseSIEBEL.git
cd KnowledgeBaseSIEBEL
```

#### 2. Configurar y arrancar el backend

```bash
cd server
npm install
cp .env.example .env    # En Windows: copy .env.example .env
npm run dev
```

El servidor arranca en `http://localhost:4000`. La base de datos `data/db.json` se crea automáticamente con datos de ejemplo en el primer arranque.

#### 3. Configurar y arrancar el frontend

```bash
cd ../client
npm install
cp .env.example .env    # En Windows: copy .env.example .env
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

> **Nota:** El frontend requiere que el backend esté corriendo. Asegúrate de arrancar el servidor antes que el cliente.

---

### Docker Compose (Producción)

```bash
# Copiar y configurar las variables de entorno
cp .env.example .env

# Construir y levantar los servicios
docker compose up --build -d
```

La aplicación quedará disponible en `http://localhost`.

Para detener los servicios:

```bash
docker compose down
```

---

## Variables de Entorno

### Backend (`server/.env`)

| Variable        | Valor por defecto   | Descripción                                      |
|-----------------|---------------------|--------------------------------------------------|
| `PORT`          | `4000`              | Puerto del servidor Express                      |
| `JWT_SECRET`    | *(requerido)*       | Clave secreta para firmar tokens JWT             |
| `JWT_EXPIRES_IN`| `8h`                | Duración del token JWT                           |
| `CORS_ORIGIN`   | `*`                 | Origen permitido para CORS                       |
| `DB_PATH`       | `./data/db.json`    | Ruta al archivo de base de datos                 |
| `UPLOAD_DIR`    | `./uploads`         | Directorio para archivos subidos                 |

### Frontend (`client/.env`)

| Variable       | Valor por defecto         | Descripción                    |
|----------------|---------------------------|--------------------------------|
| `VITE_API_URL` | `http://localhost:4000`   | URL base de la API del backend |

### Docker Compose (`.env` raíz)

| Variable     | Descripción                       |
|--------------|-----------------------------------|
| `JWT_SECRET` | Clave JWT inyectada al contenedor |

> **Importante:** En producción, `JWT_SECRET` debe ser una cadena aleatoria larga y segura. El servidor rechazará el arranque si `NODE_ENV=production` y no está definida.

---

## API Reference

**URL base:** `http://localhost:4000/api`

### Autenticación

| Método | Endpoint         | Acceso  | Descripción                                  |
|--------|------------------|---------|----------------------------------------------|
| POST   | `/auth/register` | Público | Registro (solo si no existe ningún usuario)  |
| POST   | `/auth/login`    | Público | Login. Devuelve JWT.                         |
| GET    | `/auth/me`       | Auth    | Devuelve el usuario autenticado actual       |
| GET    | `/health`        | Público | Health check del servidor                    |

### Contenidos

| Método | Endpoint          | Acceso | Descripción                                       |
|--------|-------------------|--------|---------------------------------------------------|
| GET    | `/contents`       | Auth   | Listado con filtros por texto y categoría         |
| GET    | `/contents/:id`   | Auth   | Detalle de un contenido                           |
| POST   | `/contents`       | Admin  | Crear nuevo contenido                             |
| PUT    | `/contents/:id`   | Admin  | Editar contenido existente                        |
| DELETE | `/contents/:id`   | Admin  | Eliminar contenido                                |

### Usuarios

| Método | Endpoint    | Acceso | Descripción                |
|--------|-------------|--------|----------------------------|
| GET    | `/users`    | Admin  | Listado de usuarios        |
| POST   | `/users`    | Admin  | Crear nuevo usuario        |

### Archivos

| Método | Endpoint    | Acceso | Descripción                                              |
|--------|-------------|--------|----------------------------------------------------------|
| POST   | `/uploads`  | Admin  | Sube un archivo. Devuelve la URL pública del archivo.    |

**Autenticación en peticiones:**
```
Authorization: Bearer <token>
```

**Formato de error estándar:**
```json
{ "error": "Mensaje descriptivo del error" }
```

Códigos de error posibles: `400`, `401`, `403`, `404`, `409`, `413`, `500`.

---

## Rutas del Frontend

| Ruta                 | Acceso  | Descripción                                           |
|----------------------|---------|-------------------------------------------------------|
| `/login`             | Público | Inicio de sesión con email y contraseña               |
| `/`                  | Auth    | Dashboard: resumen, búsqueda y cuadrícula de contenidos |
| `/content/:id`       | Auth    | Detalle del contenido en Markdown                     |
| `/admin/contents`    | Admin   | Gestión de contenidos (crear, editar, eliminar)       |
| `/admin/users`       | Admin   | Gestión de usuarios                                   |
| `*`                  | Público | Página 404                                            |

Los usuarios con rol `viewer` que intenten acceder a rutas de admin son redirigidos automáticamente a `/`.

---

## Roles y Permisos

| Acción                          | viewer | admin |
|---------------------------------|--------|-------|
| Ver contenidos                  | ✅     | ✅    |
| Buscar y filtrar                | ✅     | ✅    |
| Ver detalle de contenido        | ✅     | ✅    |
| Crear / editar / eliminar contenido | ❌ | ✅    |
| Subir archivos                  | ❌     | ✅    |
| Gestionar usuarios              | ❌     | ✅    |

El rol se valida en el servidor en cada petición, no solo en el frontend.

---

## Gestión de Archivos

Desde el editor de contenidos, los administradores pueden adjuntar archivos de tres formas:

- **Botón "Insertar archivo":** abre el selector de archivos del sistema.
- **Ctrl + V:** pega una imagen desde el portapapeles.
- **Arrastrar y soltar** *(si está habilitado en el editor).*

**Tipos aceptados:** imágenes (PNG, JPG, GIF, WebP), PDF, DOCX, Markdown y TXT.
**Tamaño máximo:** 20 MB por archivo.

Los archivos se almacenan en `server/uploads/` con un nombre UUID y son accesibles públicamente por URL. En el detalle de contenido:

- **PDF:** se renderiza con el visor nativo del navegador.
- **DOCX:** se renderiza con `docx-preview`.
- **Imágenes:** se insertan como `![alt](url)` en el Markdown.

---

## Asistentes de IA

El repositorio incluye configuraciones de asistentes virtuales para **CodeMie** (`.codemie/virtual_assistants/`), orientados a acelerar el desarrollo del propio proyecto:

| Asistente               | Especialidad                        |
|-------------------------|-------------------------------------|
| `api_developer`         | Diseño y desarrollo de APIs REST    |
| `code_debugger`         | Depuración y resolución de errores  |
| `code_documenter`       | Generación de documentación técnica |
| `code_reviewer`         | Revisión de calidad del código      |
| `code_security_auditor` | Auditoría de seguridad              |
| `codemie_coder`         | Programación general con CodeMie    |
| `frontend_developer`    | Desarrollo frontend React/TS        |
| `python_developer`      | Desarrollo en Python                |

---

## Credenciales de Prueba

> Estas credenciales corresponden a los datos de ejemplo generados automáticamente al crear la base de datos. **No usar en producción.**

| Rol    | Email                  | Contraseña  |
|--------|------------------------|-------------|
| Admin  | admin@empresa.com      | Admin123!   |
| Viewer | viewer@empresa.com     | Viewer123!  |

El seed también incluye tres contenidos de ejemplo en las categorías **RRHH**, **TI** y **Ventas**.

---

## Estructura del Proyecto

```
KnowledgeBaseSIEBEL/
├── .claude/                        # Configuración Claude Code
├── .codemie/
│   └── virtual_assistants/         # Asistentes IA (YAML)
├── .vscode/                        # Configuración del editor
├── client/                         # Frontend
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                         # Backend
│   └── src/
│       ├── config/                 # Configuración (DB, multer, etc.)
│       ├── controllers/            # Lógica de cada endpoint
│       ├── middlewares/            # Auth, manejo de errores
│       ├── routes/                 # Definición de rutas Express
│       ├── schemas/                # Validación con Zod
│       ├── services/               # Lógica de negocio
│       ├── utils/                  # Utilidades
│       ├── app.ts                  # Configuración de Express
│       └── server.ts               # Punto de entrada
│   ├── data/                       # db.json (generado en runtime)
│   ├── uploads/                    # Archivos subidos (generado en runtime)
│   ├── Dockerfile
│   └── tsconfig.json
├── docker-compose.yml
└── .env
```

---

## Notas de Seguridad

- **`JWT_SECRET`:** Cambiar el valor por defecto antes de cualquier despliegue. En modo producción, el servidor no arranca si no está definido.
- **`.env` en el repositorio:** Los archivos `.env` están versionados con valores de ejemplo. En un entorno real, añadir `.env` al `.gitignore` y gestionar secretos mediante un vault o variables de entorno del sistema.
- **LowDB:** Adecuado para desarrollo y volúmenes pequeños de datos. No está diseñado para alta concurrencia ni para entornos de producción con múltiples instancias.
- **Uploads públicos:** Los archivos subidos son accesibles sin autenticación por URL directa. Evaluar añadir un middleware de autorización si el contenido es sensible.
- **CORS:** `CORS_ORIGIN=*` permite peticiones desde cualquier origen. Restringirlo al dominio del frontend en producción.

---

## Scripts Disponibles

### Backend

```bash
npm run dev        # Servidor con recarga automática (tsx watch)
npm run start      # Servidor sin recarga
npm run typecheck  # Verificación de tipos TypeScript
```

### Frontend

```bash
npm run dev        # Servidor de desarrollo (Vite)
npm run build      # Verificación de tipos + build de producción
npm run preview    # Sirve el build generado localmente
npm run typecheck  # Verificación de tipos TypeScript
```

---

## Licencia

Este proyecto no especifica licencia. Contactar con el autor para más información.

---

*Documentación generada para el repositorio [GeanluisGL/KnowledgeBaseSIEBEL](https://github.com/GeanluisGL/KnowledgeBaseSIEBEL).*
