import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { aMarkdown } from "@/lib/scorecard";

export const dynamic = "force-dynamic";

export default async function Vacante({
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

  const markdown = aMarkdown(rol);

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 pb-20">
      <Link href={`/r/${id}`} className="text-sm text-gris hover:text-pizarra">
        ← Volver al scorecard
      </Link>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        La vacante
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-gris">
        Sale de las mismas señales que van a puntuarse en la entrevista. Si lo
        que publicas y lo que evalúas no coinciden, el scorecard no sirve de
        nada.
      </p>

      <pre className="mt-8 overflow-x-auto rounded-xl border border-linea bg-tarjeta p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap">
        {markdown}
      </pre>

      <p className="mt-4 text-sm text-gris">
        Markdown, para pegar donde publiques. Sin PDF a propósito: un PDF invita
        a tratar la vacante como algo cerrado, y esto se corrige.
      </p>
    </main>
  );
}
