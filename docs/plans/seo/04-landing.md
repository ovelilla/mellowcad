# Sesión 04 — Rediseño de la landing

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo. Puede ocupar más de una sesión: la investigación y el diseño en
> una, la construcción en la siguiente.

Eres la sesión 04 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro) y `.claude/rules/marketing.md`, `.claude/rules/i18n.md`
(«Claims and copy», los presupuestos), `.claude/rules/ui.md` y `.claude/rules/cad-scene.md`.
Responde en español; el código, los comentarios y el conocimiento del repo, en inglés. Decide sin
preguntar.

## Contexto

La visibilidad es la prioridad del proyecto (decisión del dueño, 5/11/2026), y la landing es lo
que ve quien llega de Google sin conocernos. La auditoría de ese día
(`~/seo-data/audit-2026-11-05/landing.md`, con capturas de MellowCAD y de 17 landings del sector
en `~/seo-data/audit-2026-11-05/landing/`; empieza por `benchmark-folds-desktop.jpg`) concluyó:

1. **El H1 visible es un acertijo** para quien no usa AutoCAD: «Type L. Press Enter. Draw.» a 86 px,
   sin categoría, beneficio ni término de búsqueda. Lo que busca quien escribe «cad online gratis»
   está en un lead gris de 20 px o en la línea más pequeña y apagada de la página («Free · No sign-up
   · Nothing to install», 12 px). El lead inglés no dice «free».
2. **Decía 2D en todas partes** y los sólidos 3D bajo «Todavía no», cuando el tablero de comandos de
   la misma página muestra unos 30 comandos de 3D y de vista. La sesión de auditoría corrigió
   Estado (`4c6094db`) y la sesión 02 el texto de posicionamiento; el diseño es tuyo.
3. **El hero muestra un dibujo, no el producto**: la brida es bonita, única y honesta, pero no dice
   «qué voy a usar», y a los cinco segundos está a medio dibujar (la animación dura unos 11,5 s).
   En el móvil empieza bajo el pliegue. Las herramientas pequeñas que convierten (Photopea,
   KulmanLab, Excalidraw, tldraw) muestran su interfaz, o son la interfaz.
4. **Ninguna prueba en la primera pantalla**: 0 usuarios, 0 testimonios, 0 estrellas en GitHub; la
   prueba real (los comandos, las más de 5.800 pruebas, las solicitudes de AutoCAD, las figuras del
   motor, el código MIT) está entre los 1.300 y los 8.600 px.
5. **Larga y repetida**: 11,7 pantallas de escritorio y 19,3 de móvil; los 140 comandos dos veces;
   una sección para desarrolladores («imports point down»); las respuestas que deciden (DWG/DXF,
   impresión) al 78–88 % del scroll.
6. **Los H2 son eslóganes** («Precision you can feel under the cursor.»): ninguno lleva un término
   que alguien busque. KulmanLab alinea title, H1 y H2 con «free CAD online / DXF editor / 2D
   drafting».

La auditoría recomienda el **concepto A, «CAD online gratis, al estilo AutoCAD»**: H1 con la
categoría en palabras llanas («Free online CAD with AutoCAD commands» / «CAD online gratis con
comandos de AutoCAD»), el subtítulo con los alias del visitante en su idioma (L para LINEA, DF para
DESFASE…) y «2D y sólidos 3D», el botón «Empieza a dibujar, gratis» junto a una caja de comando
real con el eslogan antiguo como instrucción, un hero dibujado por el motor con forma de editor
(línea de comandos, ViewCube, barra de estado) que muestre la pieza en 2D y en sólido Conceptual,
una franja de pruebas calculadas por el motor, secciones «comandos en tu idioma», «2D con
precisión», «sólidos 3D, nuevo, con lo que hace y lo que no», «gratis y privado (DWG: todavía no)»,
«para quién» (estudiantes primero), Estado, FAQ, llamada final; fuera la sección del motor y las
listas duplicadas; 6–8 pantallas. Toma del concepto B el hero con forma de editor y del C la
sección «para quién». La viabilidad está probada: el motor compilado ya dibuja un sólido por la
cadena de figuras de la landing en alámbrico, oculto y sombreado (prototipo en el informe); el
sombreado necesita pulido (costuras, agujeros facetados) y el ViewCube es un componente del editor,
así que dibujarlo pide decidir una regla.

## Objetivo

Una landing que en cinco segundos diga qué es, que es gratis y sin instalar, que trabaja como
AutoCAD en tu idioma y que hace 2D y 3D (parcial), y que lleve a dibujar; que cada sección
responda a una búsqueda real y enlace las páginas que posicionan (la referencia de comandos, la
práctica, la documentación).

## Qué investigar y decidir

Las 12 preguntas abiertas de `landing.md` §5.3: los volúmenes por idioma (están en los estudios
de palabras clave de la auditoría, `keywords-*.md`, y en `~/seo-data/raw-2026-11-05/`); la marca
(cómo nombrar AutoCAD en el H1 según las directrices de marcas de Autodesk: uso nominativo, sin su
logotipo ni sus colores); la duración de la animación (el test de figuras la sujeta a 8–12 s); qué
figuras 3D dibuja el motor (`landing.md` §5.1) y cómo, sin capturas; las pruebas sin usuarios
(§5.2); el móvil. Mira de nuevo las landings del sector que más convierten (Photopea, KulmanLab,
Onshape, Excalidraw, tldraw) si algo de las capturas no basta.

Escribe el plan en docs/plans/seo/04-landing-plan.md (concepto, estructura, textos en inglés,
figuras, lo que se quita, las reglas que cambian) antes de construir.

## Qué entregar

La landing nueva en los cuatro idiomas vivos (`.claude/rules/i18n.md`: cada idioma, traducido y
revisado con `npm run locales -- --reviewed`), figuras dibujadas por el motor (nunca capturas, nunca
SVG a mano: `.claude/rules/marketing.md`, «Figures»), la imagen OG acorde, `content/figures.test.ts`
y los tests al día, y `.claude/rules/marketing.md` reescrita donde el diseño nuevo la contradiga
(«a rule that is now wrong is worse than no rule»).

## Qué no tocar

El motor más allá de lo que una figura necesite (y entonces, con sus invariantes de `AGENTS.md`);
los títulos y descripciones que fijó la sesión 02, salvo que el diseño exija otros (entonces,
razónalo en el plan); las páginas por comando (sesión 03). Nada de push ni de publicaciones.

## Terminado cuando

- La página nueva publicada en los cuatro idiomas, con su H1 y sus H2 con términos de búsqueda,
  6–8 pantallas de escritorio, la prueba en la primera pantalla, el 3D presentado con exactitud.
- La primera carga dentro del presupuesto (≤ 250 KB Brotli; 275 con la fuente de un alfabeto),
  sin regresión de Lighthouse medida en la misma sesión; nada del motor en `/` salvo lo permitido
  (`.claude/rules/marketing.md`, «Rendering»).
- Un test de cinco segundos con las tres personas de la auditoría (estudiante español con «autocad
  online gratis», delineante estadounidense con «free online cad», ingeniero con «cad 3d online»)
  escrito en el plan, antes y después.
- El gate verde, un commit por bloque (skill `finish-feature`), la línea de la sesión 04 en
  `docs/next-seo.md` §8 actualizada.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Verifica en un
navegador real lo que el harness no ve (skill `browser-verify`). Puedes usar subagentes para
investigación independiente, con moderación (pocos a la vez y sin que lancen otros): el dueño lo
pidió por el coste.
