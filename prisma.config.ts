import { defineConfig } from "prisma/config";

/**
 * Desde Prisma 7 la cadena de conexion sale del esquema y vive aqui: el
 * esquema describe la forma de los datos, no donde estan.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
