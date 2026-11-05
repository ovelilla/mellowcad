# Sesión 01 — Técnica y rastreo

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo.

Eres la sesión 01 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md` y
`docs/next-seo.md` (el plan maestro: el diagnóstico, el orden de las sesiones y la medición), y
`.claude/rules/marketing.md`, `.claude/rules/docs.md` y `.claude/rules/i18n.md`, que gobiernan
lo que vas a tocar. Responde en español; el código, los comentarios y el conocimiento del repo, en
inglés. Decide sin preguntar: el dueño no contesta preguntas técnicas.

## Contexto

La visibilidad es la prioridad del proyecto (decisión del dueño, 5/11/2026). La auditoría de ese
día midió el sitio en producción (informe completo: `~/seo-data/audit-2026-11-05/technical.md`,
con sus datos crudos `technical-*` en la misma carpeta; los de Search Console y Bing, en
`~/seo-data/raw-2026-11-05/`). La base está sana: las 43 URLs del sitemap dan 200 con canónica
propia, el hreflang con `x-default` es recíproco en todas, robots está abierto a todos los
rastreadores, Lighthouse móvil da 97–100 y el LCP 1,1–1,2 s. Lo que falla, por impacto:

1. **La documentación inglesa servida cuatro veces.** Las páginas «Build» (motor, react, editor)
   se sirven también bajo `/es`, `/ar` y `/pt-br`, en inglés con el marco del idioma y canónicas
   a la inglesa (`.claude/rules/docs.md`, «Languages»): 45 copias, que reciben 2.364 enlaces
   internos (el 33 % del sitio) y pesan 37 MB; con los originales son 60 de las 92 URLs HTML y el
   89 % de los bytes. 15 de los 19 enlaces de cada barra lateral localizada apuntan a ellas. Gastan
   el rastreo de un dominio nuevo (Google tardó del 26/9 al 4/11 en rastrear la documentación) y
   Google desaconseja la navegación traducida alrededor de contenido en otro idioma.
2. **`/docs/engine/api` pesa 9,1 MB de HTML** (en cuatro URLs): Google solo lee los primeros 2 MB
   (ve el 54 % del texto y 9 de 16 encabezados) y Bing recomienda menos de 1 MB. La causa es el
   resaltado de código token a token, repetido en la carga RSC (5,1 MB).
3. **Títulos y descripciones de la documentación**, genéricos o repetidos («Commands · MellowCAD»,
   «Languages · MellowCAD» en dos páginas) y con hechos caducados («Spanish and Arabic», «three
   languages»: hay cuatro idiomas vivos).
4. **Datos estructurados**: la documentación no tiene ninguno (ni `BreadcrumbList`); la
   organización no tiene `sameAs` (GitHub, npm); `softwareVersion` dice 0.1.0.
5. **Enlazado interno**: la landing enlaza 7 URLs internas; «Ver los comandos» y los dos enlaces
   «Comandos» son anclas de la propia página, la FAQ dice «la lista completa está más arriba», y
   `/docs/commands` no recibe ningún enlace de ninguna landing (está a dos clics).
6. **Bing e IndexNow**: Bing tiene indexadas 5 URLs y `/docs/commands` y `/pt-br` «descubiertas
   pero no rastreadas». No hay IndexNow (Bing, Yandex, Seznam, Naver; el índice de Bing alimenta
   Copilot y es fuente de ChatGPT search).
7. **`llms.txt`** solo lista páginas inglesas, dice «2D», no enlaza `/draw` ni la landing, no
   nombra los otros idiomas ni que el español y el portugués usan los nombres de comando de su
   AutoCAD, que es lo más distintivo del producto.
8. **Menores**: `http://www` y `/en/` hacen dos saltos de redirección; `/pt-BR` da 404; 31 URLs de
   la documentación sin `lastmod`; el enlace «Markdown» de una página localizada lleva al fichero
   inglés (`app/[locale]/(marketing)/docs/[[...slug]]/page.tsx`, donde se construye con
   `canonicalPath(page)`); el nombre accesible del botón principal incluye un «Continue drawing ·
   999 objects» oculto; el logo precarga la home en cada página (28 KB) y la barra lateral de la
   documentación 402 KB; `vercel.json` omite el despliegue de los commits que solo tocan `*.md`,
   pero los README de los paquetes son páginas del sitio; `/apple-touch-icon.png` da 404.

## Objetivo

Que cada URL indexable sea única, ligera y bien descrita, que la landing lleve a la documentación
que puede posicionar, y que Google y Bing descubran lo nuevo en días, no en semanas.

## Qué hacer

- **Las copias**: deja de servir la documentación inglesa bajo otros prefijos como páginas
  propias. Lo estándar es una redirección 308 de cada copia a la URL inglesa y que las barras
  laterales localizadas enlacen directamente las páginas inglesas (marcadas como en inglés); valora
  la alternativa y decide. Reescribe la sección «Languages» de `.claude/rules/docs.md` y sus tests
  (`i18n/rewrites.test.ts` y los de `lib/docs/`) en el mismo cambio.
- **La página de API**: por debajo de 1 MB de HTML por URL, sin perder lo que la búsqueda de la
  documentación indexa (dividirla por grupos de exportaciones, aligerar el resaltado o ambos).
- **Títulos y descripciones** únicos y descriptivos en cada página y en cada idioma; los hechos
  caducados, corregidos en su fuente (los README y guías de los paquetes: `.claude/rules/docs.md`,
  «One source»). Los de la landing no: son de la sesión 02.
- **Datos estructurados**: `BreadcrumbList` en la documentación, `sameAs` en la organización,
  la versión correcta; valida con el validador de schema.org y la prueba de resultados enriquecidos
  (sin valoraciones inventadas, nunca).
- **Enlaces**: la landing enlaza `/docs/commands` donde un usuario lo espera (el tablero de
  comandos, la respuesta de la FAQ sobre los comandos, el pie), con texto de enlace descriptivo y
  `prefetch={false}` (`.claude/rules/docs.md`); migas en la documentación.
- **IndexNow**: la clave servida desde el sitio y un script (`npm run …`) que envía las URLs del
  sitemap, que el dueño ejecuta tras cada despliegue o que se engancha al despliegue si decides que
  es mejor; enviar URLs es una acción hacia fuera, así que **no lo ejecutes tú**: déjalo listo y
  escrito en `docs/next-seo.md` §7.
- **`llms.txt`**: los cuatro idiomas, el 3D parcial, los hechos (gratis, sin cuenta, código MIT,
  comandos y alias desde `lib/facts.ts`), el enlace a `/draw`; valora `llms-full.txt`.
- **Los menores** de la lista.

## Qué no tocar

El texto de posicionamiento de la landing (title, description, eyebrow, lead, imagen OG: sesión
02), la estructura de la landing (sesión 04), las páginas por comando (sesión 03). Nada en Search
Console ni en Bing: solo lectura, y las acciones van a §7 del plan. Ni push ni publicaciones.

## Terminado cuando

- Un rastreo de todas las URLs del sitemap (y de las que enlazan) da: ninguna copia indexable, cada
  título único, ninguna página por encima de 1 MB de HTML.
- La clave de IndexNow responde en producción tras el push y el script de envío está escrito y
  probado en seco.
- El JSON-LD de la landing y de la documentación valida sin errores.
- Lighthouse en `/`, `/es`, `/docs/commands` y `/draw` no empeora (mide antes y después en la misma
  sesión, nunca contra cifras de otra: skill `browser-verify`, «Performance»).
- Las reglas al día (`docs.md`, `marketing.md`, `i18n.md` si toca), el gate verde, un commit por
  bloque (skill `finish-feature`), y la línea de la sesión 01 en `docs/next-seo.md` §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Verifica con un build
de producción en un worktree limpio (skill `browser-verify`) y con `curl` contra él. Puedes usar
subagentes para investigación independiente, con moderación (pocos a la vez y sin que lancen
otros): el dueño lo pidió por el coste.
