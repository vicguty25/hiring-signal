import Link from "next/link";
import { notFound } from "next/navigation";

import { Evaluar } from "@/components/evaluar";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PaginaEvaluar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rol = await db.rol.findUnique({
    where: { id },
    include: { senales: { orderBy: { orden: "asc" } } },
  });

  if (!rol) notFound();

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 pb-20">
      <Link href={`/r/${id}`} className="text-sm text-gris hover:text-pizarra">
        ← Volver al scorecard
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {rol.titulo}
      </h1>

      <p className="mt-2 text-sm leading-relaxed text-gris">
        Puntúa por tu cuenta, antes de hablarlo con nadie. Si primero comentan
        entre ustedes, las dos notas acaban siendo la misma y el desacuerdo
        —que es lo útil— desaparece.
      </p>

      <div className="mt-8">
        <Evaluar rolId={id} senales={rol.senales} />
      </div>
    </main>
  );
}
