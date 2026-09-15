import { NuevoRol } from "@/components/nuevo-rol";

export default function Inicio() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-14">
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="" className="h-7 w-7" />
        <span className="font-semibold">Signal</span>
      </div>

      <h1 className="mt-10 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
        La primera contratación<br />se decide antes de la entrevista
      </h1>

      <p className="mt-5 leading-relaxed text-gris">
        Cuando no está escrito qué buscas, la entrevista la gana quien cae mejor.
        Dos socios salen con impresiones distintas del mismo candidato y ninguno
        sabe por qué, porque nunca acordaron qué estaban mirando.
      </p>

      <p className="mt-4 leading-relaxed text-gris">
        Escribe las señales antes de ver a nadie. Que cada quien puntúe por
        separado. Y después hablen — sobre todo de donde no coinciden.
      </p>

      <div className="mt-10 rounded-xl border border-linea bg-tarjeta p-6">
        <NuevoRol />
      </div>

      <ul className="mt-12 space-y-3 border-t border-linea pt-8 text-sm leading-relaxed text-gris">
        <li>
          <span className="font-medium text-pizarra">Anti-requisitos.</span> Lo
          que el rol NO es. Es el campo que más entrevistas ahorra, porque deja
          que la gente se autodescarte antes de aplicar.
        </li>
        <li>
          <span className="font-medium text-pizarra">Cuatro niveles, no cinco.</span>{" "}
          Sin punto medio hay que mojarse.
        </li>
        <li>
          <span className="font-medium text-pizarra">El desacuerdo es el dato.</span>{" "}
          Un 4 y un 1 en la misma señal no dan un 2,5: dan una conversación
          pendiente, y ésa es la que evita la contratación equivocada.
        </li>
      </ul>
    </main>
  );
}
