import { createApp } from "./app";
import { initDb } from "./config/db";
import { env } from "./config/env";

async function main(): Promise<void> {
  await initDb();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`API corriendo en http://localhost:${env.port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`El puerto ${env.port} ya está en uso. Cambia PORT en el archivo .env.`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
}

main().catch((error) => {
  console.error("No se pudo iniciar el servidor:", error instanceof Error ? error.message : error);
  process.exit(1);
});
