<img src="public/logo.svg" width="34" alt="">

# Signal

**La primera contratación se decide antes de la entrevista.** Scorecard con
anti-requisitos para founders sin área de recursos humanos.

---

## El problema

Dos socios entrevistan a la misma persona. Uno sale convencido; el otro, con
dudas que no sabe nombrar. Discuten media hora y acaban contratando al que cayó
mejor, porque no hay nada escrito contra lo que contrastar.

Tres meses después el puesto no funciona. Al intentar entender qué falló,
descubren que nunca acordaron qué buscaban: uno quería a alguien que montara un
canal desde cero y el otro a alguien que ejecutara lo que ya había. Los dos
creían estar buscando "un growth".

**El problema no es entrevistar mal. Es entrevistar sin haber acordado qué se
mira.**

## Qué hace

1. Defines entre 3 y 6 **señales**, cada una con un peso, antes de ver a nadie.
2. Escribes **qué NO es el rol**. Es el campo que más entrevistas ahorra.
3. Pasas el enlace. Cada evaluador puntúa **por separado**.
4. El scorecard muestra dónde coinciden y, sobre todo, dónde no.

**Métrica norte:** scorecards compartidos sobre roles creados. Uno que solo usa
quien lo escribió no evita ninguna contratación equivocada — el punto entero es
que otra persona puntúe aparte.

## El desacuerdo es el producto

Un 4 y un 1 en la misma señal no dan un 2,5. Dan una **conversación
pendiente**, y ésa es la que evita la contratación equivocada.

Por eso la interfaz tiene un solo color de acento —ámbar— y aparece únicamente
donde hay desacuerdo o donde falla un imprescindible. El color no decora:
señala dónde hay que mirar.

## Cuatro decisiones que no son obvias

**Cuatro niveles, no cinco.** Una escala impar hace que la mitad de las notas
caigan en el centro, y un scorecard donde todo es 3 no discrimina nada. Sin
punto medio hay que mojarse.

**Solo los imprescindibles levantan bandera roja.** Un "está bien tenerlo" con
nota baja no es un problema: es exactamente lo que se aceptó al ponerle peso 1.

**Las señales sin puntuar se ignoran, no cuentan como cero.** Contar un cero por
algo que nadie miró hundiría el total sin motivo.

**El veredicto nunca dice contratar ni no contratar.** El scorecard informa una
decisión, no la toma, y escribirlo en imperativo sería mentir sobre lo que hace
una herramienta que ha visto cuatro notas. Hay un test que lo verifica.

```bash
npm test     # 16 pruebas, sin base de datos
```

## Correrlo

```bash
npm install
cp .env.example .env.local     # solo DATABASE_URL
npx prisma db push
npm run dev
```

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Estilos | Tailwind CSS v4 |
| Datos | Postgres + **Prisma 7** |
| Validación | Zod |
| Pruebas | `node --test` |

**Prisma y no Drizzle**, a diferencia del resto del portafolio. La razón es el
modelo de datos: aquí hay cuatro tablas relacionadas y casi todas las lecturas
necesitan el árbol entero (rol → señales → evaluaciones → notas). Las relaciones
anidadas de Prisma resuelven eso en una llamada legible; con un query builder
acaba en tres joins escritos a mano.

> Prisma 7 cambió dos cosas que conviene saber si vienes de la 6: la URL de
> conexión sale del `schema.prisma` y vive en `prisma.config.ts`, y el cliente
> entra por un **driver adapter** explícito (`@prisma/adapter-pg`) en lugar de
> abrir la conexión por su cuenta.

## Estructura

```
app/
├── page.tsx                  definir el rol y sus señales
├── r/[id]/
│   ├── page.tsx              el scorecard por candidato
│   ├── evaluar/page.tsx      puntuar, por separado
│   └── jd/page.tsx           la vacante en Markdown
└── api/roles/                crear rol, evaluar, registrar compartido
lib/
├── scorecard.ts              pesos, desacuerdo, veredicto y el JD
└── scorecard.test.ts         sus pruebas
prisma/schema.prisma          esquema signal
```

`lib/scorecard.ts` no importa base de datos ni React. Es donde vive la opinión
del producto sobre qué significa una entrevista.

## Lo que no hace

Está en el [anti-scope](docs/lean.md#anti-scope): no hay ranking de candidatos,
no dice si contratar, no hay login, no hay editor enriquecido —la vacante son
cinco campos cortos y TipTap añadiría doscientos kilobytes para poner algo en
negrita—, no hay PDF y no hay seguimiento del proceso. Eso último es un ATS y ya
existen.

**Lo que este MVP tampoco puede probar** es si las contrataciones salen mejor.
Haría falta seguir a la persona contratada durante meses y compararla con un
grupo de control que no existe. Lo único medible aquí es si la conversación
cambia, y está escrito así para no confundir una cosa con la otra.

## Marca

Gris pizarra, IBM Plex y un solo ámbar reservado. Se usa en mitad de una
conversación incómoda, con la pantalla entre dos socios: no puede ser alegre
—nadie quiere una app animada mientras decide sobre la vida laboral de otra
persona— ni intimidante, porque entonces la gente deja de escribir comentarios
honestos. El razonamiento está en [`docs/brand.md`](docs/brand.md).

---

Construido por [Víctor Gutiérrez](https://github.com/vicguty25).

Licencia MIT.
