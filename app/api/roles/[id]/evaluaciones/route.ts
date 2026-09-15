import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { id as nuevoId } from "@/lib/id";

export const runtime = "nodejs";

const evaluacionSchema = z.object({
  candidato: z.string().trim().min(2, "¿A quién evaluaste?").max(80),
  evaluador: z.string().trim().min(2, "¿Quién eres?").max(80),
  notas: z
    .array(
      z.object({
        senalId: z.string().min(1),
        puntaje: z.number().int().min(1).max(4),
        comentario: z.string().trim().max(400).optional(),
      }),
    )
    .min(1, "Puntúa al menos una señal"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rolId } = await params;

  const rol = await db.rol.findUnique({
    where: { id: rolId },
    select: { id: true, senales: { select: { id: true } } },
  });

  if (!rol) {
    return NextResponse.json({ error: "Ese rol no existe." }, { status: 404 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = evaluacionSchema.safeParse(cuerpo);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisa los datos." },
      { status: 400 },
    );
  }

  // Solo se aceptan notas de senales que pertenecen a este rol: sin esto, un
  // POST a mano podria colar notas de otro rol y ensuciar su scorecard.
  const validas = new Set(rol.senales.map((s) => s.id));
  const notas = parsed.data.notas.filter((n) => validas.has(n.senalId));

  if (notas.length === 0) {
    return NextResponse.json(
      { error: "Ninguna de esas señales pertenece a este rol." },
      { status: 400 },
    );
  }

  await db.evaluacion.create({
    data: {
      id: nuevoId(),
      rolId,
      candidato: parsed.data.candidato,
      evaluador: parsed.data.evaluador,
      notas: {
        create: notas.map((n) => ({
          id: nuevoId(),
          senalId: n.senalId,
          puntaje: n.puntaje,
          comentario: n.comentario ?? "",
        })),
      },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
