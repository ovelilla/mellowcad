# Sesión 02 — Posicionamiento: de «CAD 2D» a lo que se busca, en 2D y 3D

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, después de la sesión 01.

Eres la sesión 02 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro) y `.claude/rules/i18n.md` («Claims and copy», «Messages»),
`.claude/rules/marketing.md` («Metadata and SEO», «Facts») y `docs/i18n/` del idioma que toques.
Responde en español; el código, los comentarios y el conocimiento del repo, en inglés. Decide sin
preguntar.

## Contexto

La visibilidad es la prioridad del proyecto (decisión del dueño, 5/11/2026). La auditoría de ese
día (`~/seo-data/audit-2026-11-05/`: `keywords-es-pt.md`, `keywords-en.md`, `languages.md`,
`kulmanlab.md`, `technical.md`, `landing.md`) encontró que **el sitio no dice lo que la gente
busca, y dice menos de lo que el producto es**:

- **KulmanLab gana con títulos y H1 exactos**: «CAD Online — Free Online CAD & DXF Editor in Your
  Browser», «Editor CAD Online Gratis…»; es n.º 1 en Google España y México para «cad online
  gratis», «cad gratis online», «cad 2d online gratis» y «programa cad gratis online», n.º 1 en
  Brasil para «cad online grátis» y n.º 2 para «cad online», n.º 1 en EE. UU. para «2d cad online»
  y n.º 4 para «free online cad». Su autoridad es mínima: el texto le basta.
- **Nuestros títulos y H1**: «Online 2D CAD with AutoCAD commands — MellowCAD» (sin «free»), «CAD
  2D online gratis con comandos de AutoCAD — MellowCAD»; el H1 visible es «Type L. Press Enter.
  Draw.», con la categoría solo en el eyebrow, una línea gris de 12 px que forma parte del H1.
- **La demanda relativa** (Google Trends, 12 meses, «autocad» = 100 en cada país): España «cad
  online» 2,0, «autocad web» 1,5; México «autocad web» 2,0 y «autocad en línea» frecuente; Brasil
  «cad online» 3,9 (la mayor cabeza relativa de todos los mercados), «autocad web» 2,8, «autocad
  online» 2,75, «programa cad» 1,0; EE. UU. «free cad» 16,4, «online cad» 9,2, «2d cad» 2,1. Los
  modificadores reales: «sin registro» / «sem cadastro», «2d», «en español», «en línea» (México).
  En Bing, tres meses, mundial: «online cad» 2,3K, «free online cad» 640, «cad online free» 794,
  «autocad online gratis» 1,5K.
- **Árabe**: `/ar` tiene 5 de los 8 clics del sitio; es n.º 5 en Google (Egipto) para «رسم هندسي
  اون لاين». Se escribe اوتوكاد sin hamza (la forma con hamza, la del sitio, casi no se busca;
  Google las une); «بديل أوتوكاد» sí se busca (corrige la nota de `docs/i18n/ar.md`).
- **«2D» en 21 sitios** (lista exacta con su fichero en `technical.md` §6.2): los títulos, las
  descripciones, el eyebrow y el lead, `drawDescription` y el `og:title` de `/draw`, el
  `appDescription` del JSON-LD y del manifest, el pie, el título de «Enviar a mi ordenador», las
  imágenes OG («2D CAD IN YOUR BROWSER»), el título de Herramientas, la descripción y el README del
  motor, una diferencia de `/docs/differences` («a 2D drafter does not have»), el README, la
  descripción y los temas de GitHub (sin temas), la descripción y las palabras clave de npm. El
  producto ya hace 3D, parcial: sólidos (primitivas, extrusión, revolución, presionar-tirar,
  booleanas, corte, sección, empalme y chaflán de aristas, edición de caras, propiedades físicas),
  órbita, ViewCube, estilos visuales y SCP; sin barrido, solevación, mallas ni render. La sesión de
  auditoría ya corrigió Estado y el README (`4c6094db`).

## Objetivo

Que cada idioma vivo diga, en el title, la description, el H1 y lo que se comparte, lo que la gente
busca y lo que el producto es: **CAD online gratis, con los comandos de AutoCAD de tu idioma, 2D y
3D (parcial), sin instalar ni registrarse**.

## Qué hacer

- **El mapa de palabras por idioma**: elige con los datos de la auditoría la consulta principal y
  las secundarias de la home de cada idioma (en, es, pt-BR, ar) y escríbelas en `docs/next-seo.md`
  (una tabla corta en L2) para que las demás sesiones las usen.
- **Los textos**: title (≤ 60 caracteres), description (≤ 155), el eyebrow (la parte del H1 que
  lleva la categoría), el lead, `Og.tagline`, `drawTitle` y `drawDescription`, `appDescription`,
  `Footer.tagline`, `SendToDesktop.shareTitle`, `Toolset.title`, y lo que haga falta en la FAQ
  (¿hace 3D?). El 3D se dice con exactitud (`.claude/rules/i18n.md`: «3D is claimed as what it is:
  partial»). AutoCAD solo de forma nominativa, con el aviso de marca del pie. En los cuatro idiomas,
  traducidos y revisados (`npm run locales -- --reviewed`), con `CONTENT_UPDATED`.
- **Fuera de la landing**: `llms.txt` (su resumen sale de `Metadata.description`), el README, la
  descripción y las palabras clave de `cad/package.json` y de los paquetes (salen con la próxima
  publicación: déjalo dicho en §7 del plan), la diferencia de F4 en `/docs/differences` (su `WHY`
  está en el código: `.claude/rules/docs.md`, «Each difference from AutoCAD quotes why»).
- **GitHub**: la descripción y los temas están en el comando `gh repo edit` de
  `docs/plans/seo/launch-kit.md` §0, que ejecuta el dueño (un cambio hacia fuera); ajústalo al
  texto nuevo si el dueño aún no lo ejecutó.

## Qué no tocar

La estructura de la landing, sus secciones, el hero y sus figuras (sesión 04: solo cambian
cadenas aquí). Las páginas de la documentación más allá de lo citado (sesiones 01 y 03). Nada en
Search Console ni en Bing; ni push ni publicaciones.

## Terminado cuando

- Las 21 ubicaciones de `technical.md` §6.2, reescritas o conservadas con su motivo en el commit.
- Cada title ≤ 60 caracteres y cada description ≤ 155 en los cuatro idiomas, con la consulta
  principal del idioma al principio del title; ningún «2D» que excluya el 3D.
- `i18n/freshness.test.ts`, `i18n/messages.test.ts` y el gate verdes; las imágenes OG revisadas a
  ojo en los cuatro idiomas (el árabe sobre todo: `.claude/rules/marketing.md`, «A right-to-left
  card»).
- Un commit por bloque (skill `finish-feature`) y la línea de la sesión 02 en `docs/next-seo.md`
  §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación (pocos a la vez y sin que lancen otros): el dueño
lo pidió por el coste.
