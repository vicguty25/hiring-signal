import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * Cliente compartido en globalThis.
 *
 * Next crea una copia del grafo de modulos por route handler y otra en cada
 * recarga en caliente. Un PrismaClient por copia abre su propio pool y agota
 * el pooler de Supabase; cuando eso pasa los queries no fallan, se cuelgan.
 */
const global_ = globalThis as unknown as { __signalPrisma?: PrismaClient };

function crear(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Copia .env.example a .env.local y completa la cadena.",
    );
  }

  // Desde Prisma 7 la conexion entra por un driver adapter explicito. Contra el
  // transaction pooler de Supabase el pool se mantiene pequeno a proposito:
  // cada instancia serverless suma, y el limite es del proyecto, no del proceso.
  const adapter = new PrismaPg({ connectionString: url, max: 3 });

  return new PrismaClient({ adapter });
}

/**
 * Perezoso a proposito: Next importa cada route handler durante el build para
 * recolectar sus datos, y crear el cliente ahi haria fallar el despliegue por
 * una variable que solo hace falta en tiempo de ejecucion.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const instancia = (global_.__signalPrisma ??= crear());
    return Reflect.get(instancia, prop, instancia);
  },
});
