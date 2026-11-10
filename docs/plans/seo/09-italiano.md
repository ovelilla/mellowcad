# Sesión 09 — El italiano

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con razonamiento alto (no el máximo: lo que más pesa es repetir lo que el francés dejó escrito),
> cuando el francés (sesión 08) esté `live`.

Eres la sesión 09 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro), la skill `add-language` y lo que dejó el francés, el idioma
anterior: su plan (`docs/plans/fr-language.md`) y su página (`docs/i18n/fr.md`).
Responde en español; el código, los comentarios y el conocimiento del repo, en inglés. Decide sin
preguntar.

## Contexto

La auditoría de idiomas del 5/11/2026 (`~/seo-data/audit-2026-11-05/languages.md`):

- **AutoCAD 2027 en italiano traduce los nombres de comando** (LINEA…): un idioma `localized`.
- **La demanda**: la mayor proporción de búsquedas de AutoCAD entre los grandes mercados de la UE;
  «comandi autocad» y las listas bilingües («comandi autocad inglese italiano»).
- **La competencia**: media-alta; KulmanLab es n.º 1 para «cad online gratis» en Italia (la consulta
  se escribe igual que en español).

## Lo que dejó el francés (sesión 08, 9/11/2026)

- **El presupuesto de la landing, al límite**: `/fr` pesa 255.870 bytes, 130 por debajo de
  250 KiB, y `/es` y `/pt-br`, unos 249. Nombrar el italiano en cada portada cuesta bytes en
  todas: mide la primera carga de cada idioma antes y después (build de producción en un
  worktree, Brotli q11) y recorta antes de pasar a `live` si alguna se pasa.
- **El paquete de idioma italiano** se instala en el AutoCAD del dueño (pídelo antes; él acepta
  el UAC) y después otra vez la actualización 2027.1 (skill `autocad-research`).
- **El escritorio, en la misma sesión**: las líneas de los conmutadores (F3, F7, F8, F9, F10,
  F11, Ctrl+W) y las lecturas junto al cursor no están en ninguna tabla; en francés, seis de
  siete supuestas estaban mal. Pide al dueño unos minutos de su ratón.
- **Lo que el idioma redacta por comando** y el inglés comparte (`console-pair.mjs`, sus
  `several`): ids de prompt, etiquetas y respuestas propias, como hizo el francés.
- **Sin revisión de un nativo**: el dueño no conoce a ninguno. Al final, la relectura de un
  modelo de lo que Autodesk no escribió (skill `add-language`), con cada cambio leído antes del
  commit.
- **Lo que nombra o cuenta los idiomas a mano**: el README, los paquetes y sus guías (la
  descripción del editor dice «five languages»), los formularios de issues, `docs/i18n/README.md`,
  el kit de lanzamiento, la sección de comandos de la landing. Los catálogos nuevos son un
  changeset `minor` de cada paquete.
- **Después de publicar**: `gsc-prioritize.mjs` (en ~/seo-data/scripts) necesita el peso de
  `/it`; IndexNow, la indexación en Bing y las fichas de AlternativeTo y SaaSHub con el
  italiano (kit §6) van con la publicación («Qué hacer»).

## Objetivo

El italiano `live` en `/it` con el sistema entero, como el francés.

## Qué hacer

La skill `add-language`, fase a fase, con su plan en `docs/plans/<tag>-language.md`; los títulos y
descripciones con los términos que se buscan en italiano.

Al final, con todo verificado, publica tú: aterriza en `main` (skill `finish-feature`), push desde
el árbol principal (el hook te pedirá mi confirmación: dala por pedida con este encargo, y yo la
aceptaré), comprobación en producción, IndexNow, la cola de Google y las fichas; pídeme lo que
necesite mi llave o mi ratón.

## Qué no tocar

Los demás idiomas, salvo lo que el sistema pida para todos.

## Terminado cuando

- El italiano `live` (o la fase alcanzada, escrita en su plan) con el gate verde, un commit por
  fase (skill `finish-feature`), publicado y comprobado en producción, y la línea de la sesión 09
  en `docs/next-seo.md` §8 actualizada, con el siguiente idioma propuesto según §4 L7 y los datos
  de Search Console de entonces.

## Cómo trabajar

Trabaja en tu propio worktree desde el principio (`EnterWorktree`, `AGENTS.md`), con tu servidor de
desarrollo en otro puerto; aterriza en `main` al cerrar cada fase, como dice `finish-feature`, para
que una sesión que siga encuentre tu trabajo. Puedes usar subagentes
para investigación independiente, con moderación: el dueño lo pidió por el coste. Las traducciones
en bloque (notas de comandos, ejercicios, guías y catálogos), con subagentes del modelo Sonnet; tú
revisas cada cambio antes del commit.
