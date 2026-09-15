import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { id, idRol } from "@/lib/id";

export const runtime = "nodejs";

const nuevoSchema = z.object({
  titulo: z.string().trim().min(2, "¿Qué rol es?").max(90),
  contexto: z.string().trim().max(600).optional(),
  antiRequisitos: z.string().trim().max(600).optional(),
  senales: z
    .array(
      z.object({
        texto: z.string().trim().min(3, "Las señales no pueden ir vacías").max(160),
        peso: z.number().int().min(1).max(3),
      }),
    )
    .min(3, "Con menos de 3 señales el scorecard no discrimina")
    .max(6, "Con más de 6 nadie las puntúa bien"),
});

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = nuevoSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos." },
      { status: 400 },
    );
  }

  const rolId = idRol();

  // Una transaccion: un rol sin sus senales no sirve para nada, y dejarlo a
  // medias en la base seria peor que fallar.
  await db.rol.create({
    data: {
      id: rolId,
      titulo: parsed.data.titulo,
      contexto: parsed.data.contexto ?? "",
      antiRequisitos: parsed.data.antiRequisitos ?? "",
      senales: {
        create: parsed.data.senales.map((s, orden) => ({
          id: id(),
          texto: s.texto,
          peso: s.peso,
          orden,
        })),
      },
    },
  });

  return NextResponse.json({ id: rolId }, { status: 201 });
}
