import Link from "next/link";
import { notFound } from "next/navigation";

import { CopiarEnlace } from "@/components/copiar-enlace";
import { db } from "@/lib/db";
import { resumir, veredicto, type Nota } from "@/lib/scorecard";

export const dynamic = "force-dynamic";

export default async function Rol({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Una sola llamada trae el arbol entero. Es la razon de usar Prisma aqui:
  // con un query builder esto son tres joins escritos a mano.
  const rol = await db.rol.findUnique({
    where: { id },
    include: {
      senales: { orderBy: { orden: "asc" } },
      evaluaciones: { include: { notas: true }, orderBy: { creadaEn: "desc" } },
    },
  });

  if (!rol) notFound();

  // Un scorecard por candidato: mezclar candidatos en un promedio no significa
  // nada.
  const porCandidato = new Map<string, typeof rol.evaluaciones>();
  for (const evaluacion of rol.evaluaciones) {
    const lista = porCandidato.get(evaluacion.candidato) ?? [];
    lista.push(evaluacion);
    porCandidato.set(evaluacion.candidato, lista);
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 pb-20">
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="" className="h-6 w-6" />
        <span className="text-sm font-semibold">Signal</span>
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        {rol.titulo}
      </h1>
      {rol.contexto ? (
        <p className="mt-2 leading-relaxed text-gris">{rol.contexto}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <CopiarEnlace rolId={id} />
        <Link
          href={`/r/${id}/evaluar`}
          className="rounded-lg bg-acero px-4 py-2.5 text-sm font-medium text-white transition hover:bg-pizarra"
        >
          Evaluar a alguien
        </Link>
        <Link
          href={`/r/${id}/jd`}
          className="rounded-lg border border-linea px-4 py-2.5 text-sm transition hover:border-acero"
        >
          Ver la vacante
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold">Qué se mira</h2>
        <ul className="mt-3 divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-tarjeta">
          {rol.senales.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="text-sm">{s.texto}</span>
              <span className="shrink-0 text-xs text-gris">
                {s.peso === 3
                  ? "Sin esto, no"
                  : s.peso === 2
                    ? "Importa"
                    : "Está bien tenerlo"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {rol.antiRequisitos ? (
        <section className="mt-8">
          <h2 className="font-semibold">Qué NO es este rol</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-wrap text-gris">
            {rol.antiRequisitos}
          </p>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-semibold">Candidatos</h2>

        {porCandidato.size === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-linea px-6 py-12 text-center text-sm text-gris">
            Nadie evaluado todavía. Pasa el enlace a quien vaya a entrevistar y
            que puntúe por separado, antes de que hablen entre ustedes.
          </p>
        ) : (
          <div className="mt-4 space-y-5">
            {[...porCandidato.entries()].map(([candidato, evaluaciones]) => {
              const notas: Nota[] = evaluaciones.flatMap((e) =>
                e.notas.map((n) => ({
                  senalId: n.senalId,
                  evaluador: e.evaluador,
                  puntaje: n.puntaje,
                })),
              );
              const resumen = resumir(rol.senales, notas);

              return (
                <article
                  key={candidato}
                  className="rounded-xl border border-linea bg-tarjeta p-5"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-medium">{candidato}</h3>
                    <span className="nota text-lg">
                      {resumen.total?.toFixed(1) ?? "—"}
                      <span className="text-sm text-gris"> / 4</span>
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-gris">
                    {resumen.evaluadores.join(", ")}
                  </p>

                  {/* El veredicto nunca dice contratar ni no contratar: el
                      scorecard informa una decisión, no la toma. */}
                  <p
                    className={`mt-3 rounded-lg px-3.5 py-2.5 text-sm ${
                      resumen.banderasRojas.length > 0 ||
                      resumen.enDisputa.length > 0
                        ? "bg-ambar-suave text-ambar"
                        : "bg-papel text-gris"
                    }`}
                  >
                    {veredicto(resumen)}
                  </p>

                  <ul className="mt-4 space-y-1.5">
                    {resumen.senales.map((s) => (
                      <li
                        key={s.senalId}
                        className="flex items-center justify-between gap-4 text-sm"
                      >
                        <span
                          className={
                            s.banderaRoja || s.desacuerdo >= 2
                              ? "text-ambar"
                              : ""
                          }
                        >
                          {s.texto}
                        </span>
                        <span className="nota shrink-0 text-gris">
                          {s.media?.toFixed(1) ?? "—"}
                          {s.desacuerdo >= 2 ? (
                            <span className="text-ambar"> ±{s.desacuerdo}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-12 text-center text-xs text-gris">
        Guarda este enlace. Quien lo tenga puede ver y evaluar.
      </p>
    </main>
  );
}
