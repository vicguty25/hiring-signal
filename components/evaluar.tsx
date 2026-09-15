"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { NIVELES } from "@/lib/scorecard";

interface SenalProp {
  id: string;
  texto: string;
  peso: number;
}

export function Evaluar({
  rolId,
  senales,
}: {
  rolId: string;
  senales: SenalProp[];
}) {
  const router = useRouter();
  const [notas, setNotas] = useState<Record<string, number>>({});
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const puntuadas = Object.keys(notas).length;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (puntuadas === 0) {
      setError("Puntúa al menos una señal.");
      return;
    }

    setEnviando(true);
    const datos = new FormData(event.currentTarget);

    try {
      const res = await fetch(`/api/roles/${rolId}/evaluaciones`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          candidato: String(datos.get("candidato")),
          evaluador: String(datos.get("evaluador")),
          notas: Object.entries(notas).map(([senalId, puntaje]) => ({
            senalId,
            puntaje,
            comentario: comentarios[senalId] ?? "",
          })),
        }),
      });

      const cuerpo = await res.json();
      if (!res.ok) {
        setError(cuerpo.error ?? "No se pudo guardar.");
        setEnviando(false);
        return;
      }

      router.push(`/r/${rolId}`);
    } catch {
      setError("No se pudo conectar.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="candidato" className="mb-1.5 block text-sm text-gris">
            ¿A quién evaluaste?
          </label>
          <input
            id="candidato"
            name="candidato"
            required
            maxLength={80}
            className="campo"
          />
        </div>
        <div>
          <label htmlFor="evaluador" className="mb-1.5 block text-sm text-gris">
            ¿Quién eres?
          </label>
          <input
            id="evaluador"
            name="evaluador"
            required
            maxLength={80}
            className="campo"
          />
        </div>
      </div>

      <div className="space-y-5">
        {senales.map((senal) => (
          <fieldset
            key={senal.id}
            className="rounded-xl border border-linea bg-tarjeta p-5"
          >
            <legend className="sr-only">{senal.texto}</legend>

            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium">{senal.texto}</p>
              {senal.peso === 3 ? (
                <span className="shrink-0 text-xs text-ambar">
                  Sin esto, no
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {NIVELES.map((nivel) => {
                const activo = notas[senal.id] === nivel.valor;
                return (
                  <label
                    key={nivel.valor}
                    title={nivel.detalle}
                    className={`cursor-pointer rounded-lg border px-3 py-2.5 text-center text-sm transition ${
                      activo
                        ? "border-acero bg-acero text-white"
                        : "border-linea hover:border-acero"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`senal-${senal.id}`}
                      value={nivel.valor}
                      className="sr-only"
                      onChange={() =>
                        setNotas((p) => ({ ...p, [senal.id]: nivel.valor }))
                      }
                    />
                    {nivel.etiqueta}
                  </label>
                );
              })}
            </div>

            <input
              value={comentarios[senal.id] ?? ""}
              onChange={(e) =>
                setComentarios((p) => ({ ...p, [senal.id]: e.target.value }))
              }
              maxLength={400}
              placeholder="¿Qué viste? (opcional)"
              className="campo mt-3 text-sm"
            />
          </fieldset>
        ))}
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-ambar/35 bg-ambar-suave px-4 py-3 text-sm text-ambar"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-acero px-5 py-3.5 font-medium text-white transition hover:bg-pizarra disabled:opacity-60"
      >
        {enviando
          ? "Guardando..."
          : `Guardar (${puntuadas} de ${senales.length} puntuadas)`}
      </button>
    </form>
  );
}
