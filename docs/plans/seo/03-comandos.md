# Sesión 03 — La referencia de comandos: una página por comando

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo, después de las sesiones 01 y 02. Si no cabe en una, que la primera
> deje la mecánica y la primera tanda hechas y el resto escrito en su plan.

Eres la sesión 03 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro), `.claude/rules/docs.md` (las páginas «Use», las generadas,
las anclas que abre F1, las sesiones dibujadas por el motor), `.claude/rules/marketing.md`
(«Figures») y `.claude/rules/i18n.md`. Responde en español; el código, los comentarios y el
conocimiento del repo, en inglés. Decide sin preguntar.

## Contexto

La visibilidad es la prioridad del proyecto (decisión del dueño, 5/11/2026). La auditoría de ese
día (`~/seo-data/audit-2026-11-05/`: `keywords-en.md`, `keywords-es-pt.md`, `competitors.md`,
`kulmanlab.md`, `technical.md` §3) mostró que **la referencia de comandos es la familia de
búsquedas donde MellowCAD puede ganar antes**:

- **La demanda está en los comandos sueltos**, más que en «autocad online»: en EE. UU. (Trends,
  «autocad» = 100) block 4,4, text 4,3, scale 2,7, layer 2,5, hatch 1,8, dimension 1,7, polyline 1,2,
  frente a «autocad online» 2,2. Google sugiere unas 1.700 consultas distintas de un solo comando en
  español y unas 1.500 en portugués; 3.226 en inglés. En Bing, tres meses: «autocad commands» 1,3K,
  «autocad shortcuts» 792, «comandos de autocad» 601, «comandos autocad» 581.
- **Los resultados son débiles**: Autodesk Help es n.º 1 (a menudo de una versión vieja), y del 3.º
  al 10.º hay plantillas finas, PDFs de Scribd y SlideShare, vídeos, un AulaFácil de AutoCAD 2008.
  cadmastercoach.com llega con 664 palabras, una caja de atajo y 7 preguntas. **Ninguna página
  junta la secuencia completa de solicitudes de AutoCAD 2027, sus opciones explicadas, una figura
  por opción y una forma de probarlo.** Las 2.442 páginas de comando de KulmanLab describen su
  propia herramienta y no posicionan en ninguna de las consultas probadas.
- **Hoy**: `/docs/commands` pone los 140 comandos en una sola URL por idioma («Commands ·
  MellowCAD»), unas 21 palabras cada uno (nombre, alias, primera solicitud y un enlace al detalle
  en inglés en GitHub); en español no aparece el nombre inglés (OFFSET). La landing no la enlaza.
  Google la indexó el 4/11.
- **Cómo se busca un comando** (`keywords-es-pt.md` §B.5): en España, la palabra de uso diario en
  español y en verbo («recortar», «escala», «polilínea», «sombreado»), rara vez el nombre truncado
  (RECORTA); en México, el resto de América Latina y Brasil, el nombre inglés para la jerga
  («offset», «fillet», «trim», «array», «hatch» en México), salvo escala, hachura, polilinha y cotas
  en Brasil. Se busca en las dos direcciones («desfase autocad inglés», «offset en español»). En
  inglés: «offset in autocad» > «how to offset in autocad» > «offset command in autocad»; en la
  India, «X command in autocad».
- **Estacionalidad**: en España «comandos autocad» cae en verano y sube de enero a marzo y de
  septiembre a noviembre: las páginas deben estar indexadas antes de mediados de enero.

## Objetivo

Una página por comando, en los cuatro idiomas vivos, generada del catálogo del motor y de
`docs/coverage/` para que se mantenga sola, mejor que cualquier resultado actual, y un índice
`/docs/commands` que gane «lista de comandos de AutoCAD (español e inglés)» y «AutoCAD commands
list».

## Qué decidir e investigar

- **La página**: el nombre en el idioma del comando y el global, los alias, la secuencia de
  solicitudes del motor y cada opción con su letra y lo que hace (de las solicitudes y palabras
  clave del catálogo y de la entrada de `docs/coverage/`), lo que aún falta respecto a AutoCAD
  (dicho con exactitud), una figura dibujada por el motor (una sesión de `DOCS_SESSIONS`; una por
  opción donde aporte), un «pruébalo» que abra `/draw`, los comandos relacionados, migas y datos
  estructurados, y unas preguntas reales (las de «Otras preguntas de los usuarios» de cada
  comando). Nada de páginas finas: si un comando no da para una página propia, se queda en el
  índice.
- **Títulos**: llevan los dos nombres («Recortar en AutoCAD: comando RECORTA (TRIM)», «Comando
  OFFSET (DESLOCAMENTO) no AutoCAD», «OFFSET in AutoCAD: command, options and alias»); la palabra
  que se busca, primero. Verifica antes en 5–10 resultados de Google por idioma.
- **Slugs**: en inglés (`/es/docs/commands/offset`), como recomiendan los datos; las palabras
  locales van en el title, el H1, la description, las migas, el texto alternativo y el JSON-LD.
- **F1**: el editor abre la ayuda del comando con la plantilla que le pasa el anfitrión
  (`app/[locale]/(app)/draw/page.tsx`); hoy `…/docs/commands#{command}`. Que lleve a la página del
  comando, sin romper las anclas que ya existen.
- **El orden**, si hay que hacerlo por tandas: primero BLOCK/INSERT, TEXT/MTEXT, SCALE, LAYER,
  HATCH (con una galería de patrones dibujada por el motor), las cotas, PLINE, FILLET, OFFSET,
  TRIM, ARRAY; después el 3D (EXTRUDE, UNION/SUBTRACT, BOX, PRESSPULL, SLICE, REVOLVE); después
  el resto.
- **Los comandos que se buscan y no tenemos** (XLINE, OVERKILL, MEASURE, DIVIDE, ALIGN, MLINE,
  XCLIP, XREF, PLOT): sin página; anótalos en `docs/next-seo.md` como entrada para el roadmap.
- **`/docs/shortcuts`**: su título y su H1 para «atajos de teclado de AutoCAD» / «AutoCAD
  shortcut keys».

## Qué entregar

La mecánica (generación por test de instantánea, como `lib/docs/generate.test.ts`; rutas,
sitemap con hreflang, enlaces internos desde el índice, la landing y los comandos relacionados) y
las páginas, en los cuatro idiomas; `.claude/rules/docs.md` reescrita donde cambie («A generated
page is a file snapshot», las anclas de F1); `docs:check` cubriendo las páginas nuevas.

## Qué no tocar

El motor, salvo lo que una figura necesite. La landing más allá de enlazar la referencia (sesión
04). Nada en Search Console ni en Bing; ni push ni publicaciones.

## Terminado cuando

- Cada comando con página propia en en, es, pt-BR y ar (o la tanda alcanzada, con el resto en el
  plan), en el sitemap con su hreflang, enlazado desde el índice, sin dos títulos iguales, y F1
  llevando a ella.
- Cada página con contenido propio (solicitudes, opciones, figura) y sin afirmar lo que el comando
  no hace.
- Lighthouse de una página de comando ≥ 95; el gate verde; un commit por bloque (skill
  `finish-feature`); la línea de la sesión 03 en `docs/next-seo.md` §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación (pocos a la vez y sin que lancen otros): el dueño
lo pidió por el coste.
