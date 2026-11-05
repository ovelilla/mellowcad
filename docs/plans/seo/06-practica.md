# Sesión 06 — Practicar AutoCAD online, y las guías por tarea

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, después de la sesión 03.

Eres la sesión 06 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro), `.claude/rules/marketing.md` («The site exists to be found»,
«Figures»), `.claude/rules/docs.md` y `.claude/rules/i18n.md`. Responde en español; el código, los
comentarios y el conocimiento del repo, en inglés. Decide sin preguntar.

## Contexto

La auditoría del 5/11/2026 (`~/seo-data/audit-2026-11-05/`: `keywords-en.md`, `keywords-es-pt.md`,
`competitors.md`) encontró dos familias donde el producto encaja como en ninguna otra y ninguna
herramienta compite:

- **Practicar AutoCAD**: «autocad practice drawings / exercises (pdf)», «practice autocad online»,
  «ejercicios autocad 2d / 3d», «planos para practicar autocad», «simulador de autocad online»,
  «exercícios autocad», «projetos autocad para treinar». Hoy los tienen PDFs de Scribd, Google Drive
  y SlideShare, un blogspot de ejercicios, cursos y YouTube; Google pregunta «¿Dónde puedo encontrar
  ejercicios de AutoCAD para practicar?». En Bing, tres meses: «autocad exercises» 363, «autocad
  practice» 192. La demanda es mayor en la India. MellowCAD es el único sitio donde se practican
  los comandos, las solicitudes y las opciones de AutoCAD, con los nombres de tu idioma, gratis y
  sin licencia.
- **Guías por tarea**: «fazer planta baixa» (Trends 3,6 en Brasil), «planta baixa online» 1,7,
  «dibujar planos online gratis sin registro», «how to X in AutoCAD». Los planos son la única
  familia cuyos usuarios escriben solo palabras locales (`keywords-es-pt.md` §B.8).

El brief de lanzamiento anterior decía «los ejercicios, si llegan, irán dentro del editor y no como
páginas»: decayó con la decisión del dueño de poner la visibilidad primero (`docs/next-seo.md` §3).

## Objetivo

Una biblioteca de ejercicios dibujados por el motor, cada uno en su página indexable y con un
«ábrelo en el editor» que cargue el dibujo de partida en `/draw`, y las primeras guías por tarea,
en los idiomas vivos.

## Qué decidir

- **El ejercicio**: la figura terminada dibujada por el motor (un `DemoScript`, nunca una captura),
  el enunciado, los comandos que practica (enlazados a sus páginas de la sesión 03), una solución
  paso a paso (la transcripción del motor), versión imprimible, y cómo llega al editor (un dibujo
  inicial cargado por URL: una funcionalidad del editor; sin tocar el autoguardado de quien ya
  dibuja). Por disciplinas (mecánica, arquitectura) y niveles, en 2D, isométrico y 3D (con lo que el
  3D hace hoy).
- **Las guías**: cuáles primero, con los datos de la auditoría (planta baixa en Brasil, planos en
  español, «how to X in AutoCAD» en inglés); slugs locales solo si el enrutado por idioma es barato
  (`.claude/rules/i18n.md`: los slugs se localizan cuando los datos lo piden; regístralo allí).
- **El índice** «Practicar AutoCAD online» / «Practice AutoCAD online» y su lugar en la navegación
  y en la landing.

## Qué no tocar

El motor más allá de cargar un dibujo por URL; las páginas por comando (sesión 03), salvo
enlazarlas. Nada en Search Console ni en Bing; ni push ni publicaciones.

## Terminado cuando

- Al menos 12 ejercicios (2D y 3D, varios niveles) y 3 guías, en los idiomas vivos, en el sitemap
  con hreflang, enlazados desde la documentación y la landing; cada ejercicio abre en `/draw` con
  su dibujo, verificado en un navegador real (skill `browser-verify`).
- El gate verde, las reglas al día, un commit por bloque (skill `finish-feature`), y la línea de
  la sesión 06 en `docs/next-seo.md` §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación: el dueño lo pidió por el coste.
