import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "./config/env";
import { UPLOAD_DIR } from "./config/upload";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import contentRoutes from "./routes/content.routes";
import uploadsRoutes from "./routes/uploads.routes";
import usersRoutes from "./routes/users.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Archivos subidos. Son públicos (necesario para <img> y enlaces dentro del Markdown),
  // pero sus nombres son UUID aleatorios imposibles de adivinar.
  app.use(
    "/uploads",
    express.static(UPLOAD_DIR, {
      index: false,
      dotfiles: "deny",
      setHeaders: (res) => {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      },
    })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/content", contentRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/uploads", uploadsRoutes);

  // 404 para rutas /api/* no reconocidas
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
  });

  if (env.isProduction) {
    // Sirve el build del frontend y delega el enrutado SPA a index.html
    app.use(express.static(env.frontendDist, { index: false }));
    app.get("/{*path}", (_req, res, next) => {
      res.sendFile(path.join(env.frontendDist, "index.html"), (err) => {
        if (err) next(err);
      });
    });
  } else {
    app.use((req, res) => {
      res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
    });
  }

  app.use(errorHandler);

  return app;
}
