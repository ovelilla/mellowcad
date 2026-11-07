# Sesión 07b — Abrir un DXF online: las páginas

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, después de la sesión 07.

Eres la sesión 07b del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro: L7, §7 y §8), `docs/next-dxf.md` (el brief del DXF: lo que hace
la fase 1 y lo que no), la entrada de DXFIN en `docs/coverage/clipboard-and-files.md`,
`.claude/rules/marketing.md` («The site exists to be found»), `.claude/rules/docs.md` y
`.claude/rules/i18n.md` («Claims and copy»). Responde en español; el código, los comentarios y el
conocimiento del repo, en inglés. Decide sin preguntar.

## Contexto

La sesión 07 (7/11/2026) hizo que OPEN y DXFIN abran un DXF como en AutoCAD 2027: ASCII y binario, de
R12 a 2018, el texto en su página de códigos, lo que el modelo no tiene contado en la línea de
comandos. La auditoría (`~/seo-data/audit-2026-11-05/competitors.md` §2.3 y las tablas de «abrir
dxf online», «dxf viewer online» y «editor dxf online»; `keywords-en.md` y `keywords-es-pt.md`, su
familia `files_dxf_dwg`) dejó esas familias cerradas hasta que existiera la importación: son de
herramientas (7,5 visores por top 10 de Google), con dominios de 2025–2026 dentro, y las grandes
(Aspose, GroupDocs, filestash) las cubren con una página por formato y por idioma. En Bing, tres
meses: «dxf viewer online» 1,6K; «dwg viewer online» 6,5K, que no abrimos. Las tres competidoras
probadas en la sesión 07 fallan en el texto, el binario o las capas (`docs/next-dxf.md` §3).

## Objetivo

Una página por idioma vivo que responda a quien busca abrir, ver o editar un DXF en el navegador, y
que lo haga ahí: el producto a un clic o en la misma página, con lo que abre y lo que no dicho con
exactitud.

## Qué decidir

- **La página**: dónde vive (una página «Use» de la documentación como las guías, o una del sitio),
  su slug (inglés salvo que los datos pidan otro, `i18n.md`), su título y su H1 con las palabras de
  cada idioma («abrir DXF online», «visor DXF online», «abrir arquivo DXF online», «dxf viewer
  online»; regístralas en «Search texts» de `docs/i18n/<tag>.md`), sus preguntas (`faq`) y sus
  enlaces desde la landing, la documentación y las páginas de OPEN y DXFIN si las tienen.
- **Cómo llega el fichero al editor**: como mínimo, a `/draw` y Ctrl+O; mejor, un botón o una zona
  para soltarlo en la propia página que lo abra en `/draw` sin subirlo a ningún sitio, con el
  mecanismo de los dibujos de los ejercicios (`components/draw-editor.tsx`, `ui.md`) o uno propio
  igual de privado. Es la expectativa de quien llega de un visor.
- **Qué afirma**: lo que la entrada de DXFIN dice que abre, y lo que no (puntos, directrices,
  tablas, presentaciones, sólidos 3D, los patrones y tipos de línea que no tiene), contado como
  lo cuenta la línea de comandos. Nada de DWG ni de guardar como DXF hasta que existan.
- **La landing**: si su Estado, la FAQ y la sección de archivos bastan o el DXF merece un sitio más
  visible (el H2 de esa sección, la descripción), dentro de los presupuestos de títulos y
  descripciones de `i18n/messages.test.ts`.
- **Una página de comando de OPEN o DXFIN** (skill `command-page`), solo si lo que la entrada de
  cobertura dice llena una.

## Antes de escribir

Abre en el editor DXF reales y anota lo que se queda fuera, para que la página diga la verdad y la
fase 4 del brief sepa por dónde empezar: los dibujos de muestra de AutoCAD 2027 (la carpeta
`Sample` del programa, guardados como DXF por la consola, skill `autocad-research`) y los de otros
programas que encuentres con licencia libre. Lo que falte y sea solo datos (un patrón de
`acadiso.pat`, un tipo de línea de `acadiso.lin`, ambos registros del motor) puede entrar en su
propio commit con su test; lo demás se apunta en la fase 4 de `docs/next-dxf.md`.

## Qué no tocar

DWG, guardar como DXF (fase 2 del brief), PDF. Nada en Search Console ni en Bing; ni push ni
publicaciones. Las URLs nuevas van al final de la cola de indexación de `docs/next-seo.md` §7 antes
del push, como en las sesiones 03 y 06.

## Terminado cuando

- La página en los idiomas vivos, en el sitemap con hreflang, enlazada, que abre un DXF en `/draw`
  verificado en un navegador real (skill `browser-verify`) con un DXF de AutoCAD y uno de otro
  programa.
- El gate verde, las reglas al día, un commit por bloque (skill `finish-feature`), y las líneas de
  las sesiones 07 y 07b en `docs/next-seo.md` §8 actualizadas.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación: el dueño lo pidió por el coste.
