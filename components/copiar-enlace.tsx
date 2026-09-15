"use client";

import { useState } from "react";

/**
 * Copiar el enlace es la metrica norte: un scorecard que no se comparte no
 * evita ninguna contratacion equivocada, porque el punto entero es que otra
 * persona puntue por separado.
 */
export function CopiarEnlace({ rolId }: { rolId: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const enlace = `${window.location.origin}/r/${rolId}`;
    try {
      await navigator.clipboard.writeText(enlace);
    } catch {
      // Sin permiso de portapapeles el enlace sigue en la barra de direcciones.
    }
    setCopiado(true);
    void fetch(`/api/roles/${rolId}/compartido`, {
      method: "POST",
      keepalive: true,
    });
  }

  return (
    <button
      onClick={copiar}
      className="rounded-lg border border-linea px-4 py-2.5 text-sm transition hover:border-acero"
    >
      {copiado ? "Enlace copiado" : "Copiar el enlace"}
    </button>
  );
}
