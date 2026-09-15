import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Registra que se paso el enlace del rol. Es el denominador de la metrica
 * norte: scorecards compartidos sobre roles creados.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await db.rol
    .update({
      where: { id },
      data: { vecesCompartido: { increment: 1 } },
    })
    .catch(() => {
      // Un rol borrado entre el clic y la peticion no es un error que el
      // usuario deba ver: ya copio el enlace.
    });

  return new NextResponse(null, { status: 204 });
}
