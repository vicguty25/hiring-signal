/**
 * El calculo del scorecard.
 *
 * La parte util no es la nota media: es el desacuerdo. Dos evaluadores que
 * puntuan 4 y 1 la misma senal no dan un 2,5 — dan una conversacion pendiente,
 * y esa conversacion es lo que evita la contratacion equivocada.
 */

export const PUNTAJE_MINIMO = 1;
export const PUNTAJE_MAXIMO = 4;

/**
 * Cuatro niveles y no cinco, a proposito: sin punto medio hay que mojarse.
 * Una escala impar hace que la mitad de las notas caigan en el centro y el
 * scorecard deje de discriminar.
 */
export const NIVELES = [
  { valor: 1, etiqueta: "No", detalle: "No vi evidencia de esto" },
  { valor: 2, etiqueta: "Flojo", detalle: "Algo, pero no me convence" },
  { valor: 3, etiqueta: "Sí", detalle: "Lo tiene" },
  { valor: 4, etiqueta: "Claramente", detalle: "Es de lo mejor que he visto" },
] as const;

export interface Senal {
  id: string;
  texto: string;
  /** 1 = está bien tenerlo, 2 = importa, 3 = sin esto no hay contratación. */
  peso: number;
}

export interface Nota {
  senalId: string;
  evaluador: string;
  puntaje: number;
}

export interface ResumenSenal {
  senalId: string;
  texto: string;
  peso: number;
  /** Media simple de los evaluadores. null si nadie la puntuó. */
  media: number | null;
  /** Diferencia entre la nota más alta y la más baja. */
  desacuerdo: number;
  evaluadores: number;
  /** Un imprescindible (peso 3) puntuado por debajo de 3 es una bandera roja. */
  banderaRoja: boolean;
}

export interface Resumen {
  senales: ResumenSenal[];
  /** Media ponderada por el peso de cada señal, de 1 a 4. null sin notas. */
  total: number | null;
  /** Señales donde los evaluadores difieren en 2 puntos o más. */
  enDisputa: ResumenSenal[];
  banderasRojas: ResumenSenal[];
  evaluadores: string[];
}

/** A partir de esta diferencia, dos evaluadores no están viendo lo mismo. */
export const UMBRAL_DESACUERDO = 2;

export function resumir(senales: Senal[], notas: Nota[]): Resumen {
  const evaluadores = [...new Set(notas.map((n) => n.evaluador))].sort();

  const resumenes: ResumenSenal[] = senales.map((senal) => {
    const suyas = notas.filter((n) => n.senalId === senal.id);

    if (suyas.length === 0) {
      return {
        senalId: senal.id,
        texto: senal.texto,
        peso: senal.peso,
        media: null,
        desacuerdo: 0,
        evaluadores: 0,
        banderaRoja: false,
      };
    }

    const puntajes = suyas.map((n) => n.puntaje);
    const media = puntajes.reduce((s, p) => s + p, 0) / puntajes.length;

    return {
      senalId: senal.id,
      texto: senal.texto,
      peso: senal.peso,
      media: Math.round(media * 10) / 10,
      desacuerdo: Math.max(...puntajes) - Math.min(...puntajes),
      evaluadores: suyas.length,
      // Solo los imprescindibles levantan bandera. Un "está bien tenerlo"
      // puntuado bajo no es un problema: es exactamente lo que se aceptó al
      // ponerle peso 1.
      banderaRoja: senal.peso === 3 && media < 3,
    };
  });

  const conNota = resumenes.filter((r) => r.media !== null);

  // Media ponderada: una señal de peso 3 cuenta el triple que una de peso 1.
  const pesoTotal = conNota.reduce((s, r) => s + r.peso, 0);
  const total =
    pesoTotal === 0
      ? null
      : Math.round(
          (conNota.reduce((s, r) => s + r.media! * r.peso, 0) / pesoTotal) * 10,
        ) / 10;

  return {
    senales: resumenes,
    total,
    enDisputa: conNota.filter((r) => r.desacuerdo >= UMBRAL_DESACUERDO),
    banderasRojas: conNota.filter((r) => r.banderaRoja),
    evaluadores,
  };
}

/**
 * Qué decir sobre el candidato. Nunca "contratar" o "no contratar": el
 * scorecard informa una decisión, no la toma.
 */
export function veredicto(resumen: Resumen): string {
  if (resumen.total === null) return "Nadie ha evaluado todavía.";

  if (resumen.banderasRojas.length > 0) {
    const cuantas = resumen.banderasRojas.length;
    return `Falla ${cuantas} ${cuantas === 1 ? "imprescindible" : "imprescindibles"}. Eso pesa más que el promedio.`;
  }

  if (resumen.enDisputa.length > 0) {
    return `No están viendo lo mismo en ${resumen.enDisputa.length} ${
      resumen.enDisputa.length === 1 ? "señal" : "señales"
    }. Hablen de eso antes de decidir.`;
  }

  if (resumen.evaluadores.length < 2) {
    return "Una sola opinión. Que lo vea alguien más antes de decidir.";
  }

  return "Coinciden y no hay imprescindibles fallando.";
}

/** El JD en Markdown, para pegarlo donde se publique la vacante. */
export function aMarkdown(rol: {
  titulo: string;
  contexto: string;
  antiRequisitos: string;
  senales: Senal[];
}): string {
  const bloques = [`# ${rol.titulo.trim() || "Rol sin título"}`];

  if (rol.contexto.trim()) {
    bloques.push("## Qué tiene que estar resuelto en seis meses", rol.contexto.trim());
  }

  if (rol.senales.length > 0) {
    bloques.push(
      "## Qué buscamos",
      rol.senales
        .map((s) => `- ${s.texto}${s.peso === 3 ? " **(imprescindible)**" : ""}`)
        .join("\n"),
    );
  }

  if (rol.antiRequisitos.trim()) {
    // Va al final y con su propio título: es lo que la gente busca para
    // autodescartarse, y esconderlo desperdicia su único trabajo.
    bloques.push("## Qué NO es este rol", rol.antiRequisitos.trim());
  }

  return bloques.join("\n\n") + "\n";
}
