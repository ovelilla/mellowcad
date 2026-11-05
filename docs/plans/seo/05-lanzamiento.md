# Sesión 05 — El lanzamiento: el kit al día y los materiales

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, cuando las sesiones 02, 03 y 04 estén publicadas (push hecho). Los
> directorios del kit (AlternativeTo, SaaSHub) no esperan a esta sesión: puedes darlos de alta ya.

Eres la sesión 05 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro: la autoridad es la causa de más peso, el 40 %),
docs/plans/seo/launch-kit.md (los textos preparados el 5/11/2026) y `.claude/rules/i18n.md`
(«Claims and copy»: todo lo que se publique la sigue). Responde en español; el conocimiento del
repo, en inglés (el plan y el kit, como se escribieron). Decide sin preguntar.

## Contexto

La auditoría del 5/11/2026 (`~/seo-data/audit-2026-11-05/`: `authority.md`, `kulmanlab.md` §6,
`competitors.md` §3.3 y §6) midió:

- **MellowCAD tiene 0 enlaces externos** (Search Console y Bing) y nunca se lanzó.
- **El listón de KulmanLab es bajo**: Product Hunt con 7 y 1 votos, 0 menciones en Hacker News,
  50 estrellas en GitHub, 13 suscriptores en YouTube, posts en DEV (9) y Medium (4) y tres foros:
  unos 12–15 dominios, casi todos suyos. Aun así, con cinco meses más, es n.º 1 en las consultas de
  cabeza.
- **Dónde está la puerta**: AlternativeTo es n.º 1–2 en Bing para «free autocad alternative»
  (CADCraft, de 24 días, ya está tercero en su página); los hilos de Reddit traducidos
  automáticamente son n.º 1 en Google para «cad 2d online» (es), «free autocad alternative» y
  «alternativa autocad gratis», y dos son posts «he hecho un CAD 2D web»; ninguno de los 52
  listados de «mejores CAD gratis» nombra una herramienta del navegador independiente.
- **El ángulo propio**: los nombres de comando de AutoCAD en tu idioma (LINEA, DESFASE, RECORTA…),
  que ningún competidor muestra; el código abierto (MIT) y un motor sin dependencias con su núcleo
  B-rep; las figuras dibujadas por el propio motor; el 3D parcial pero real.

## Objetivo

Dejar el lanzamiento listo para que el dueño lo ejecute: el kit al día con el producto y la landing
publicados, los materiales hechos, y un calendario con fechas. **Ninguna publicación, alta, voto,
comentario ni mensaje la haces tú.**

## Qué hacer

- **Verifica las reglas vigentes** de cada sitio del kit (Show HN, Product Hunt, AlternativeTo,
  SaaSHub, cada subreddit: autopromoción, días, formato) y corrige el kit donde hayan cambiado.
- **Reescribe los textos** del kit con el producto de ese día (lo que publicaron 02–04, el 3D, el
  DXF si ya existe) y la política de afirmaciones; en inglés y en español donde el sitio lo pida.
- **Los materiales**: una galería para Product Hunt y los directorios con imágenes que dibuja el
  motor (nunca capturas de AutoCAD ni su logotipo), un vídeo de 30–45 s del editor dibujando (una
  grabación de pantalla con la API de screencast de Chrome, skill `browser-verify`, «Navigation and
  view transitions»), el logotipo en los tamaños que pidan; guárdalos fuera del repo, en
  `~/seo-data/launch/`.
- **El outreach**: un correo por artículo de `~/seo-data/audit-2026-11-05/authority-listicles.csv`
  (los contactos no entran en el repo, que es público), corto, específico y honesto, listo para que
  el dueño lo envíe.
- **El calendario** en `docs/next-seo.md` L5: qué se publica cada día, quién, con qué texto, y qué
  mirar después en Search Console, Bing y Vercel Analytics.

## Terminado cuando

- El kit verificado y al día, los materiales en `~/seo-data/launch/`, los correos escritos, el
  calendario en el plan, y la línea de la sesión 05 en `docs/next-seo.md` §8 actualizada; un commit
  `docs:` con solo eso; sin push.

## Qué no tocar

El código y la landing (si algo de ellos frena el lanzamiento, anótalo en el plan para su sesión).
Nada en Search Console ni en Bing. Nada se publica.
