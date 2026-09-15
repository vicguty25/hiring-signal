"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Fila {
  texto: string;
  peso: number;
}

const PESOS = [
  { valor: 1, etiqueta: "Está bien tenerlo" },
  { valor: 2, etiqueta: "Importa" },
  { valor: 3, etiqueta: "Sin esto, no" },
];

export function NuevoRol() {
  const router = useRouter();
  const [senales, setSenales] = useState<Fila[]>([
    { texto: "", peso: 3 },
    { texto: "", peso: 2 },
    { texto: "", peso: 2 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function cambiar(i: number, parcial: Partial<Fila>) {
    setSenales((prev) =>
      prev.map((s, k) => (k === i ? { ...s, ...parcial } : s)),
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setEnviando(true);

    const datos = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          titulo: String(datos.get("titulo")),
          contexto: String(datos.get("contexto") ?? ""),
          antiRequisitos: String(datos.get("antiRequisitos") ?? ""),
          senales: senales.filter((s) => s.texto.trim().length > 0),
        }),
      });
      const cuerpo = await res.json();
      if (!res.ok) {
        setError(cuerpo.error ?? "No se pudo crear.");
        setEnviando(false);
        return;
      }
      router.push(`/r/${cuerpo.id}`);
    } catch {
      setError("No se pudo conectar.");
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="titulo" className="mb-1.5 block text-sm text-gris">
          ¿Qué rol es?
        </label>
        <input
          id="titulo"
          name="titulo"
          required
          maxLength={90}
          placeholder="Primer growth"
          className="campo"
        />
      </div>

      <div>
        <label htmlFor="contexto" className="mb-1.5 block text-sm text-gris">
          ¿Qué tiene que estar resuelto en seis meses?
        </label>
        <textarea
          id="contexto"
          name="contexto"
          maxLength={600}
          rows={3}
          placeholder="Que el inbound traiga la mitad de los leads sin que yo escriba nada"
          className="campo"
        />
      </div>

      <div>
        <p className="mb-2 text-sm text-gris">
          Señales — entre 3 y 6. Qué vas a mirar en la entrevista.
        </p>
        <div className="space-y-2.5">
          {senales.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.texto}
                onChange={(e) => cambiar(i, { texto: e.target.value })}
                maxLength={160}
                placeholder={
                  i === 0 ? "Ha montado un canal desde cero" : "Otra señal"
                }
                className="campo flex-1"
              />
              <select
                value={s.peso}
                onChange={(e) => cambiar(i, { peso: Number(e.target.value) })}
                className="campo w-44 shrink-0"
                aria-label="Peso de la señal"
              >
                {PESOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {senales.length < 6 ? (
          <button
            type="button"
            onClick={() => setSenales((p) => [...p, { texto: "", peso: 2 }])}
            className="mt-2.5 text-sm text-gris underline underline-offset-4 hover:text-pizarra"
          >
            Añadir otra
          </button>
        ) : (
          <p className="mt-2.5 text-sm text-gris">
            Seis es el máximo. Con más, nadie las puntúa bien.
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="antiRequisitos"
          className="mb-1.5 block text-sm text-gris"
        >
          ¿Qué NO es este rol?
        </label>
        <textarea
          id="antiRequisitos"
          name="antiRequisitos"
          maxLength={600}
          rows={3}
          placeholder="No es community manager. No vas a diseñar piezas. No hay equipo a cargo todavía."
          className="campo"
        />
        <p className="mt-1.5 text-xs text-gris">
          Es el campo que más entrevistas ahorra. Va al final de la vacante, para
          que la gente se autodescarte antes de aplicar.
        </p>
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
        {enviando ? "Creando..." : "Crear el scorecard"}
      </button>
    </form>
  );
}
