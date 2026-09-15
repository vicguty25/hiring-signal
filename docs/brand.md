# Sistema visual — Signal

## La decisión de fondo

Este producto se usa **en mitad de una conversación incómoda**: dos socios
discutiendo si contratan a alguien, con la pantalla entre los dos.

Eso descarta dos extremos. No puede ser alegre —nadie quiere una app animada
mientras decide sobre la vida laboral de otra persona— y no puede ser
intimidante, porque entonces la gente deja de escribir comentarios honestos.

El resultado es deliberadamente sobrio: gris pizarra, tipografía de sistema
técnica, y un solo ámbar que aparece **únicamente donde hay desacuerdo**. El
color no decora: señala dónde hay que mirar.

## Nombre

**Signal** — señal frente a ruido. Una entrevista produce muchísimo ruido
(simpatía, nervios, un currículum bonito); el scorecard existe para separar lo
que de verdad predice de lo que solo impresiona.

## Tipografía

| Uso | Familia | Por qué |
|-----|---------|---------|
| Todo | **IBM Plex Sans** | Neutral e industrial. Diseñada para documentación técnica: se lee sin tener opinión sobre lo que dice |
| Notas | **IBM Plex Mono** | Las puntuaciones se alinean en rejilla y se comparan entre evaluadores de un vistazo |

## Paleta

| Token | Hex | Uso |
|-------|-----|-----|
| `--pizarra` | `#0F172A` | Texto |
| `--papel` | `#F8FAFC` | Fondo |
| `--tarjeta` | `#FFFFFF` | Tarjetas |
| `--ambar` | `#B45309` | Desacuerdo y banderas rojas. Nada más |
| `--ambar-suave` | `#FEF3C7` | Fondo de esos mismos avisos |
| `--acero` | `#334155` | Acción primaria |
| `--linea` | `#E2E8F0` | Bordes |
| `--gris` | `#64748B` | Texto secundario |

El ámbar está reservado. Si apareciera en un botón o en un encabezado, dejaría
de querer decir «aquí hay algo que resolver».

## Marca

`public/logo.svg` — cuatro barras verticales de altura distinta, la tercera en
ámbar. Las señales de un scorecard; la que discrepa, marcada.

## Tono de voz

- **Nunca se dice «contratar» ni «no contratar».** El scorecard informa una
  decisión, no la toma, y escribirlo en imperativo sería mentir sobre lo que
  hace una herramienta que solo ha visto cuatro notas.
- El desacuerdo se enuncia como trabajo pendiente, no como error:
  *«no están viendo lo mismo — hablen de eso antes de decidir»*.
- Al candidato se le nombra por su nombre. Nunca «el perfil» ni «el recurso».
- Los anti-requisitos se escriben en segunda persona hacia quien lee la vacante.

## Lo que no se hace

- Rankings de candidatos. Ordenar personas por un número sugiere una precisión
  que estas cuatro notas no tienen.
- Porcentajes de «match».
- Barras de progreso de colores por competencia.
- Cualquier cosa que sugiera que la decisión la toma el software.
