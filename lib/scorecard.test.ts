import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  NIVELES,
  UMBRAL_DESACUERDO,
  aMarkdown,
  resumir,
  veredicto,
  type Nota,
  type Senal,
} from "./scorecard.ts";

const SENALES: Senal[] = [
  { id: "s1", texto: "Ha montado un canal de cero", peso: 3 },
  { id: "s2", texto: "Escribe sin que haya que reescribirlo", peso: 2 },
  { id: "s3", texto: "Sabe SQL basico", peso: 1 },
];

const nota = (senalId: string, evaluador: string, puntaje: number): Nota => ({
  senalId,
  evaluador,
  puntaje,
});

describe("la escala", () => {
  it("tiene cuatro niveles y no cinco", () => {
    // Sin punto medio hay que mojarse. Una escala impar hace que la mitad de
    // las notas caigan en el centro y el scorecard deje de discriminar.
    assert.equal(NIVELES.length, 4);
  });
});

describe("resumir", () => {
  it("promedia por senal y detecta cuantos evaluaron", () => {
    const r = resumir(SENALES, [nota("s1", "ana", 4), nota("s1", "luis", 2)]);
    const s1 = r.senales.find((s) => s.senalId === "s1")!;
    assert.equal(s1.media, 3);
    assert.equal(s1.evaluadores, 2);
  });

  it("marca en disputa lo que difiere dos puntos o mas", () => {
    // 4 y 1 no dan un 2,5: dan una conversacion pendiente.
    const r = resumir(SENALES, [nota("s2", "ana", 4), nota("s2", "luis", 1)]);
    assert.equal(r.enDisputa.length, 1);
    assert.equal(r.enDisputa[0]!.desacuerdo, 3);
    assert.ok(r.enDisputa[0]!.desacuerdo >= UMBRAL_DESACUERDO);
  });

  it("no marca disputa por un punto de diferencia", () => {
    const r = resumir(SENALES, [nota("s2", "ana", 3), nota("s2", "luis", 2)]);
    assert.equal(r.enDisputa.length, 0);
  });

  it("solo los imprescindibles levantan bandera roja", () => {
    // Un "esta bien tenerlo" con nota baja no es un problema: es exactamente
    // lo que se acepto al ponerle peso 1.
    const r = resumir(SENALES, [nota("s3", "ana", 1), nota("s3", "luis", 1)]);
    assert.equal(r.banderasRojas.length, 0);

    const r2 = resumir(SENALES, [nota("s1", "ana", 2), nota("s1", "luis", 2)]);
    assert.equal(r2.banderasRojas.length, 1);
  });

  it("pondera por peso: un imprescindible cuenta el triple", () => {
    // s1 (peso 3) en 4 y s3 (peso 1) en 1 => (4*3 + 1*1) / 4 = 3,25
    const r = resumir(SENALES, [nota("s1", "ana", 4), nota("s3", "ana", 1)]);
    assert.equal(r.total, 3.3);
  });

  it("ignora las senales sin puntuar en vez de contarlas como cero", () => {
    // Contar un cero por lo que nadie miro hundiria el total sin motivo.
    const r = resumir(SENALES, [nota("s1", "ana", 4)]);
    assert.equal(r.total, 4);
    assert.equal(r.senales.find((s) => s.senalId === "s2")!.media, null);
  });

  it("devuelve null y no cero sin ninguna nota", () => {
    const r = resumir(SENALES, []);
    assert.equal(r.total, null);
    assert.deepEqual(r.evaluadores, []);
  });

  it("lista los evaluadores sin repetir", () => {
    const r = resumir(SENALES, [
      nota("s1", "ana", 3),
      nota("s2", "ana", 3),
      nota("s1", "luis", 3),
    ]);
    assert.deepEqual(r.evaluadores, ["ana", "luis"]);
  });
});

describe("veredicto", () => {
  it("las banderas rojas pesan mas que el promedio", () => {
    const r = resumir(SENALES, [
      nota("s1", "ana", 2),
      nota("s2", "ana", 4),
      nota("s3", "ana", 4),
    ]);
    assert.match(veredicto(r), /imprescindible/);
  });

  it("senala el desacuerdo antes de dar por bueno el promedio", () => {
    const r = resumir(SENALES, [nota("s2", "ana", 4), nota("s2", "luis", 1)]);
    assert.match(veredicto(r), /No están viendo lo mismo/);
  });

  it("pide una segunda opinion cuando solo evaluo uno", () => {
    const r = resumir(SENALES, [nota("s1", "ana", 4)]);
    assert.match(veredicto(r), /alguien más/);
  });

  it("nunca dice contratar ni no contratar", () => {
    // El scorecard informa una decision, no la toma.
    const casos = [
      resumir(SENALES, []),
      resumir(SENALES, [nota("s1", "ana", 4), nota("s1", "luis", 4)]),
      resumir(SENALES, [nota("s1", "ana", 1), nota("s1", "luis", 1)]),
    ];
    for (const r of casos) {
      assert.doesNotMatch(veredicto(r), /contrat/i);
    }
  });
});

describe("aMarkdown", () => {
  it("pone los anti-requisitos al final y con su propio titulo", () => {
    // Es lo que la gente busca para autodescartarse: esconderlo desperdicia
    // su unico trabajo.
    const md = aMarkdown({
      titulo: "Primer growth",
      contexto: "Duplicar el inbound",
      antiRequisitos: "No es un puesto de community manager",
      senales: SENALES,
    });
    assert.ok(md.includes("## Qué NO es este rol"));
    assert.ok(md.indexOf("Qué NO es este rol") > md.indexOf("Qué buscamos"));
  });

  it("marca los imprescindibles en la lista", () => {
    const md = aMarkdown({
      titulo: "X",
      contexto: "",
      antiRequisitos: "",
      senales: SENALES,
    });
    assert.ok(md.includes("**(imprescindible)**"));
  });

  it("omite las secciones vacias en vez de dejar titulos huerfanos", () => {
    const md = aMarkdown({
      titulo: "X",
      contexto: "",
      antiRequisitos: "",
      senales: [],
    });
    assert.equal(md.trim(), "# X");
  });
});
