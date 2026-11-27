# La interfaz de AutoCAD — brief

> **Estado:** en curso desde el 24/11/2026, agotada la cola de la visibilidad (`docs/next-seo.md`):
> la fase 0 (inventario y plan) está hecha y su plan, `docs/plans/autocad-ui.md`, manda sobre las
> fases de §4, que se corrigieron con él; la fase 1 (el marco y el ribbon) está hecha el 24/11,
> sus cinco bloques del §6 del plan (el estado del ribbon en el motor, el marco, Home, las otras
> pestañas, minimizar y plegar), el 2 y el 3 revisados ese día (la revisión corta con Fable de
> §5); el push que publique el ribbon espera la palabra del dueño. La fase 2 (la barra de título)
> está hecha el 25/11, sus cuatro bloques del §6 del plan (Ayuda ▾, el nombre del dibujo, el menú
> de la aplicación, Undo ▾ y Redo ▾; la lista Ayuda ▾ no se abrió ni con el ratón, así que sus filas
> son las del menú Ayuda de acad.cuix). La fase 3 (las paletas y los diálogos de estilos) está
> hecha el 26/11: su pasada por el escritorio, su bloque 1 del §6 del plan (STYLE y DIMSTYLE como
> diálogos), el 2a (el armazón de las paletas: cada una aparte, flotante o acoplada), el 2b
> (anclar y auto-ocultar), el 3a (el Layer Properties Manager por dentro), el 3b (Blocks por
> dentro), el 3c (Properties por dentro) y el 4 (las listas de estilos del ribbon). La fase 4 (el
> área de dibujo y la fila inferior) está hecha el 26/11, sus cinco bloques del
> §6 del plan: la fila inferior de 33, la línea de comandos flotante, la etiqueta del estilo
> visual, el ViewCube en reposo y los grips. La fase 5 (lo que le falta al ribbon) está hecha el
> 26/11, sus tres bloques del §6 del plan: los tooltips de AutoCAD con
> el extendido, el menú contextual del ribbon (Show Tabs, Show Panels, Show Panel Titles, Close;
> 3D Tools y los paneles ocultos de View empiezan ocultos, como en AutoCAD) y el Customize ▾ del
> acceso rápido. Las fases 4 y 5 quedan verificadas en el escritorio el 26/11, con la sesión de la
> fase 6 (la comparación lado a lado y sus arreglos; lo poco que no resolvió sigue en el §7 del
> plan). La fase 6 (pestañas contextuales) está hecha el 27/11, sus cinco bloques del §6 del plan: el 1 (Array Creation) y el 2
> (Hatch Creation y los prompts de HATCH con el ribbon) el 26/11, verificados en el escritorio ese
> día, el 3 (Text Editor) también, comprobado en el escritorio antes de construirlo, y el 4 (la
> pestaña Array de la selección, con el botón de Items de ARRAYPATH y Show Panels del §7) y el 5
> (-HATCHEDIT y Hatch Editor) el 27/11 sin escritorio; lo que solo el escritorio puede decir
> sigue en el §7 del plan.
> Después del rediseño, una fase 7 anotada por el dueño el 26/11 y por valorar: un
> aviso de novedades en el editor (§4).
> Acordado el 7/11/2026 por el dueño. Se borra cuando la última fase esté hecha; hasta entonces
> cada fase cerrada se marca aquí.

## 1. Objetivo

Que quien usa AutoCAD a diario reconozca el editor al verlo y encuentre cada cosa donde la busca,
también quien no teclea y sigue un tutorial («Home › Draw › Circle»). Hasta ahora la fidelidad era
el contrato de los comandos (alias, solicitudes, opciones, teclas), y la disposición de la
interfaz era propia. Desde esta decisión la disposición sigue también a AutoCAD 2027: el ribbon,
el menú de la aplicación, la barra de acceso rápido, las paletas, la barra de estado, la línea de
comandos y lo demás, en su sitio, con su orden y sus estados.

Lo que queda propio: los iconos (dibujados aquí, nunca los de Autodesk), la marca (ni el logo, ni
el nombre «AutoCAD» en la interfaz, ni nada que sugiera afiliación) y lo que el navegador no puede
reproducir. Una desviación solo se mantiene si la plataforma la impone o si falta aquí la función
que la rodea, con su WHY, como dice `AGENTS.md`.

## 2. Decisiones del dueño (7/11/2026)

- **Las desviaciones de diseño quedan revocadas.** Son las que defendían la interfaz propia por
  gusto o por espacio, no por la plataforma:
  - «una fila de 36 px en lugar del ribbon» (`docs/coverage/workspace.md`, Top bar);
  - «una paleta de herramientas en lugar del ribbon» (Tool palette);
  - «un solo panel acoplado con pestañas» (Palette panel).

  El argumento del alto lo resuelve el propio AutoCAD con los estados de minimizar del ribbon. Una
  regla, un test o una nota de cobertura que defienda la disposición actual frente a la de AutoCAD
  no bloquea este trabajo: se cambia en el mismo commit que la deja falsa.
- **Se mantienen las desviaciones que impone la plataforma**, cada una con su WHY: MODEL como
  etiqueta (no hay layouts), F1, F4 para el ciclo de selección, el doble clic de 500 ms y las
  demás que la fase 0 confirme.
- **Revisión completa, no solo el ribbon.** Cada zona se compara con AutoCAD 2027 y cada diferencia
  se clasifica (§4, fase 0).
- **El tamaño sigue a AutoCAD** donde AutoCAD tiene uno: los botones grandes del ribbon y sus
  filas no son el sistema de 28 px (`.claude/rules/ui.md`, Size); `control-size.test.ts` y la
  regla se amplían con los tamaños nuevos, argumentados desde las medidas de AutoCAD.

## 3. Lo que no cambia

- La lógica sigue en el motor y React es solo presentación (`.claude/rules/ui.md`). Un control
  nuevo que necesite estado (el último miembro usado de un desplegable, el estado de minimizado
  del ribbon) lo pide al motor o al layout del dispositivo, como `palette-layout.ts`.
- Un solo esquema de color, oscuro, el tema por defecto de AutoCAD; la escala tipográfica (Segoe
  UI a 9 pt equivale a nuestros 12 px).
- Las pestañas y los paneles muestran solo herramientas que existen aquí. Lo que falta se apunta
  en la cobertura, nunca se pone un botón muerto.
- `@mellowcad/editor` está en npm, pero nadie lo usa (el dueño, 7/11/2026): sus exportaciones
  (`TitleBar`, `ToolRail`, `packages/editor/src/index.ts`) cambian o desaparecen sin miramientos
  por compatibilidad. Solo se exige que la guía (`packages/editor/docs/customizing.md`) y el README
  digan la verdad en el mismo commit.

## 4. Fases

Cada fase se cierra con la skill `finish-feature`: el gate, la cobertura, las reglas, las guías,
y las figuras de la landing y de la documentación que muestren la interfaz vieja.

### Fase 0 — inventario y plan (hecha el 24/11/2026)

El resultado es `docs/plans/autocad-ui.md`: el inventario de AutoCAD 2027 con sus medidas, el del
editor, la tabla de diferencias y las fases. Lo que cambió respecto a lo acordado, y por qué:

- **Los estilos no son paletas en AutoCAD**: STYLE y DIMSTYLE abren cuadros de diálogo modales, y
  el ribbon ofrece cada estilo como lista. La paleta Styles pasa a ser esos dos diálogos (fase 3).
- **No habrá pestaña Inicio** (un solo dibujo, sin pestañas de archivo), así que Send Feedback va
  a la lista Ayuda ▾ de la barra de título (fase 2).
- **La línea de comandos de AutoCAD flota** sobre el dibujo, y las pestañas Model/Layout comparten
  fila con la barra de estado: la fase 4 lo iguala y devuelve esa altura al dibujo.
- **La pestaña 3D Tools**, que el espacio «Drafting & Annotation» tiene oculta, se mostraba aquí, y
  también los paneles ocultos de View (Visual Styles, Coordinates, Navigate), mientras no hubo
  menú «Show Tabs» para llegar a ellos; desde la fase 5 empiezan ocultos, como en AutoCAD, y el
  menú contextual del ribbon los muestra.
- **Dos fases nuevas**: la 5 (tooltips, el menú contextual del ribbon, personalizar el acceso
  rápido) y la 6 (pestañas contextuales: Hatch Creation, Text Editor, Array).
- **Dos pasadas por el escritorio** el mismo día: la primera sin ratón, por UI Automation, con el
  dueño trabajando en el otro monitor; la segunda con el ratón, con su palabra, para el menú de
  la aplicación, los menús contextuales, un tooltip, el cursor, los grips y los dos diálogos de
  estilos. Lo poco que queda sin capturar (la lista Ayuda ▾, que no se abrió; una paleta
  acoplada) está en el §7 del plan como el primer bloque de la fase que lo necesita.
- **El botón de un comando en marcha no se queda encendido** en AutoCAD, y el último miembro de
  un desplegable se recuerda solo durante la sesión (comprobado reiniciando): la fase 1 iguala
  las dos cosas.

Lo que se pidió, tal como se acordó: con la skill `autocad-research` (escritorio de AutoCAD 2027, espacio de trabajo «Drafting &
Annotation», tema oscuro): capturas de cada zona a 1280×720 y 1920×1080, sus medidas, el orden
y los estados (ribbon completo, minimizado, paneles que se pliegan al estrechar la ventana). La
estructura del ribbon sale de `RibbonRoot.cui` en `acad.cuix`: pestañas, paneles, filas, tamaño
de cada botón, sus desplegables y su macro. Lo mismo para el editor (skill `browser-verify`), y
una tabla de diferencias zona por zona: el ribbon, el menú de la aplicación, la barra de acceso
rápido, la barra de título y las pestañas de archivo, las paletas (Properties, Layer Properties
Manager, Blocks, estilos), la línea de comandos, la barra de estado, las pestañas Model/Layout,
el ViewCube, la barra de navegación, los controles del viewport, el cursor y los grips, los
tooltips y los menús contextuales, y los diálogos.

Cada diferencia es **revocada** (se iguala), **de plataforma** (se queda con su WHY) o **falta
la función** (se apunta en la cobertura). El resultado es el plan `docs/plans/<name>.md` de esta revisión (`autocad-ui`): el
inventario, la tabla y las fases siguientes con su orden. Si las fases de abajo no encajan con
lo que se encuentre, el plan manda.

### Fase 1 — el marco y el ribbon

La fila de título (el botón de la aplicación y el acceso rápido, con lo que tienen hoy, a los
tamaños de AutoCAD) y el ribbon: las pestañas que tengan herramientas construidas, empezando por
Home, con sus paneles en el orden de 2027, sus botones grandes y pequeños, los desplegables que
recuerdan el último miembro usado, los paneles expandidos, los estados de minimizar y su botón,
el plegado de paneles al estrechar la ventana, RIBBON y RIBBONCLOSE (y CLEANSCREENON, que ya los
nombra). Sustituye a la paleta de herramientas y a los grupos Layers y Properties de la barra
superior. El paso 9 de la skill `new-command` («the rail») pasa a describir el ribbon. Sus
bloques y lo que deja falso, en el §6 del plan.

### Fase 2 — la barra de título (hecha el 25/11/2026)

El menú de la aplicación en la disposición y el orden de AutoCAD (sus dos columnas y la página de
cada entrada, capturadas en la fase 0),
Undo y Redo como botones divididos con su lista, la lista Ayuda ▾ con Send Feedback, y el nombre
del dibujo en el título.

### Fase 3 — las paletas y los diálogos de estilos (hecha el 26/11/2026)

Properties, Layer Properties Manager y Blocks como paletas propias: flotantes dentro de la
página, acoplables a los lados, con auto-ocultar, y su sitio y tamaño guardados en el
dispositivo. STYLE y DIMSTYLE como los diálogos de AutoCAD, con las listas de estilos del ribbon.

### Fase 4 — el área de dibujo y la fila inferior (hecha el 26/11/2026)

La línea de comandos flotante, la fila inferior a los tamaños y con los valores iniciales de
AutoCAD, el ViewCube en reposo, y los grips y el resaltado comparados con sus capturas.

Pedido por el dueño (10/11/2026): **cambiar el estilo visual desde la interfaz**. Hoy solo se
puede tecleando VSCURRENT (`VS`, es `EVA`), y un usuario de AutoCAD busca la etiqueta de los
controles del viewport (`[2D Wireframe]`, arriba a la izquierda) y su lista de estilos; también
la galería de estilos visuales del ribbon. La fase 0 la sitúa en View › Visual Styles, un panel
que «Drafting & Annotation» tiene oculto (aquí se mostró hasta la fase 5, que lo oculta como
AutoCAD y lo deja al menú contextual): va con la fase 1 (su bloque 4), así
que el pedido se cumple primero por el ribbon, y la etiqueta del viewport llega en la fase 4. La
lista ofrece solo los estilos construidos (2D Wireframe, Hidden,
Conceptual: `docs/coverage/view.md`, VSCURRENT) y ejecuta VSCURRENT, como la de AutoCAD; quita
`vscurrent` de los comandos sin botón (`TYPED` en `packages/editor/src/ribbon-home.ts`) con la
galería, y la fila «the viewport controls' style menu» de su Missing con la
etiqueta.

### Fase 5 — lo que le falta al ribbon (hecha el 26/11/2026)

Los tooltips como los de AutoCAD, el menú contextual del ribbon con «Show Tabs» y «Show Panels»
(y entonces se revisa qué pestañas y paneles se muestran de entrada) y la lista «Customize» del
acceso rápido.

### Fase 6 — pestañas contextuales (hecha el 27/11/2026)

Hatch Creation, Text Editor y Array como pestañas que siguen a su comando. Cada una es la
interfaz de un comando, así que pasa por la revisión y la investigación de ese comando.

### Fase 7 — el aviso de novedades (idea del dueño, 26/11/2026; por valorar, sin acordar)

Va después de la fase 6, con el rediseño terminado. Un aviso en el editor, poco intrusivo, que
cuente en pocas líneas y sin tecnicismos lo que ha cambiado; el primero, el rediseño: que la
interfaz se parece ahora a la de AutoCAD para que quien viene de él trabaje de memoria. Escrito
con ilusión, no como una nota de versión. Quien lo cierra no lo vuelve a ver hasta que haya otra
novedad. Lo que hay que valorar antes de construirlo:

- **La forma**: una tarjeta pequeña que se cierra, en una esquina del dibujo, sin tapar la línea
  de comandos ni robar el foco ni las teclas (la primera tecla sigue escribiendo un comando), frente
  a solo una entrada «Novedades» en la lista Ayuda ▾ de la barra de título; quizá las dos: la
  tarjeta una vez y la entrada siempre.
- **A quién**: solo a quien conoció la interfaz anterior (lo que el dispositivo ya guarda: un
  dibujo autoguardado, la disposición de las paletas o del ribbon); a quien llega por primera vez
  no le dice nada.
- **Cerrado para siempre**: el id del aviso guardado en el dispositivo bajo la clave del host
  (`layoutStorage`, como el resto de la disposición); un aviso nuevo es otro id. Sin servidor ni
  dato personal, así que `/privacy` no cambia.
- **El texto**, en cada idioma vivo, en su catálogo: solo lo que sea verdad (`i18n.md`, «Claims and
  copy»): «muchas peticiones» solo si las hubo.
- **La regla que cambia**: `.claude/rules/ui.md` dice «No product or meta copy in the editor:
  that is the landing's»; el aviso es la excepción acordada y la regla se reescribe en el mismo
  commit. AutoCAD no tiene un aviso así en el dibujo (su What's New es una página de la ayuda), así
  que es una decisión de producto, no de fidelidad.

## 5. Con qué modelo

Como en `docs/next-mcp.md` §6.1, y por la misma razón (Fable agota pronto su límite semanal): lo
que pedía el modelo más capaz, decidir qué construir, ya está en el plan; lo que queda es
ejecución con AutoCAD delante, las skills y la puerta, que cazan el error.

- **Cada sesión de este brief empieza con Opus 5.5 en High**.
- **Fable 5.2 solo en dos casos**: una sesión de Opus atascada, que al cerrar dice en qué y por
  qué (no se insiste con el mismo modelo), y una revisión corta del diff del marco y de Home
  (bloques 2 y 3 del §6 del plan), una sesión de revisión, no la de construcción.
- **Al cerrar, cada sesión le dice al dueño el modelo de la siguiente** y por qué, siendo
  crítica: «Fable» pide un motivo concreto de ese bloque (qué se intentó y no salió, o qué
  decisión queda abierta que el plan no resuelve), nunca «es más difícil».
