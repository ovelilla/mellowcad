# Sesión 08 — El francés

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo. Un idioma son varias fases: esta sesión llega hasta donde la skill
> `add-language` y el tiempo permitan, y deja el plan del idioma al día para la siguiente.

Eres la sesión 08 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro) y la skill `add-language`, que es el procedimiento entero.
Responde en español; el código, los comentarios y el conocimiento del repo, en inglés. Decide sin
preguntar.

## Contexto

La auditoría de idiomas del 5/11/2026 (`~/seo-data/audit-2026-11-05/languages.md`, con sus datos
`languages-*`) eligió los idiomas nuevos por demanda de búsqueda y porque AutoCAD 2027 exista en ese
idioma, el criterio del dueño:

- **AutoCAD 2027 en francés traduce los nombres de comando** (LIGNE…): un idioma `localized`, como
  el español y el portugués de Brasil, y la ventaja que ningún competidor del navegador ofrece.
- **La demanda**: Francia más Argelia, Marruecos y Túnez (más Bélgica, Suiza, Canadá y el África
  occidental, sin medir). En el Magreb se busca AutoCAD con palabras francesas, no en árabe: `/ar`
  no lo alcanza. «autocad gratuit» es la mayor consulta «gratis» no inglesa después de «autocad
  gratis»; «autocad en ligne» tuvo 746 búsquedas en Bing en tres meses (Francia 286). En los idiomas
  con AutoCAD traducido se buscan las listas de comandos bilingües («commandes autocad francais
  anglais»), que los nombres localizados responden directamente.
- **La competencia**: Autodesk tiene «autocad en ligne»; KulmanLab es n.º 7 para «cao en ligne
  gratuit». Ninguna herramienta del navegador usa los nombres franceses de AutoCAD.

## Objetivo

El francés `live` en `/fr` con el sistema entero: el sitio, el editor, las páginas «Use» (y las de
cada comando, si la sesión 03 ya las hizo), el lenguaje de comandos del motor copiado de AutoCAD
2027 en francés, su `docs/i18n/<tag>.md`, y las palabras clave francesas en sus títulos.

## Qué hacer

La skill `add-language`, fase a fase, con su plan en `docs/plans/<tag>-language.md` como el de
`docs/plans/pt-BR-language.md`: el paquete de idioma francés de AutoCAD 2027 (sus tablas y su
consola), el borrador (`draft`, `noindex`), las traducciones revisadas, el lenguaje de comandos,
y `live` solo cuando esté completo y verificado. Los títulos y descripciones del francés, con los
términos que se buscan en francés (investígalos con el método de los estudios de la auditoría:
autocompletado, Trends, resultados), igual que la sesión 02 hizo en los demás idiomas.

## Qué no tocar

Los demás idiomas, salvo lo que el sistema de idiomas pida para todos. Nada de push ni de
publicaciones.

## Terminado cuando

- El francés `live` (o la fase alcanzada, escrita en su plan) con `i18n/languages.test.ts` y el
  gate verdes, un commit por fase (skill `finish-feature`), y la línea de la sesión 08 en
  `docs/next-seo.md` §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación (pocos a la vez y sin que lancen otros): el dueño
lo pidió por el coste.
