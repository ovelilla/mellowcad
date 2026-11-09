# La interfaz de AutoCAD — brief

> **Estado:** acordado el 7/11/2026 por el dueño, nada empezado; va después de la visibilidad
> (`docs/next-seo.md`) salvo que el dueño lo adelante. Se borra cuando la última fase esté hecha;
> hasta entonces cada fase cerrada se marca aquí.

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
  (`TopBar`, `ToolRail`, `packages/editor/src/index.ts`) cambian o desaparecen sin miramientos
  por compatibilidad. Solo se exige que la guía (`packages/editor/docs/customizing.md`) y el README
  digan la verdad en el mismo commit.

## 4. Fases

Cada fase se cierra con la skill `finish-feature`: el gate, la cobertura, las reglas, las guías,
y las figuras de la landing y de la documentación que muestren la interfaz vieja.

### Fase 0 — inventario y plan

Con la skill `autocad-research` (escritorio de AutoCAD 2027, espacio de trabajo «Drafting &
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

### Fase 1 — el ribbon

Las pestañas que tengan herramientas construidas, empezando por Home, con sus paneles en el
orden de 2027, sus botones grandes y pequeños, los desplegables que recuerdan el último miembro
usado, los paneles expandidos, los estados de minimizar y su botón, el plegado de paneles al
estrechar la ventana, RIBBON y RIBBONCLOSE (y CLEANSCREENON, que ya los nombra). Sustituye a la
paleta de herramientas y a los grupos Layers y Properties de la barra superior. El paso 9 de la
skill `new-command` («the rail») pasa a describir el ribbon.

### Fase 2 — menú de la aplicación, acceso rápido y título

El orden completo del menú de la aplicación, Undo y Redo como botones divididos con su lista, y
el nombre del dibujo en el título y en las pestañas de archivo si la fase 0 las pide. Send
Feedback, que la sesión 05b dejó al final del menú de la aplicación con su WHY, va a la pestaña
Inicio (su panel Connect) cuando la haya, o donde la fase 0 lo encuentre fuera de ella (el menú
Ayuda lo tiene: acad.cuix `ID_SendFeedback`).

### Fase 3 — las paletas

Properties, Layer Properties Manager, Blocks y los estilos como paletas propias de AutoCAD:
dónde se abren, acopladas o flotantes, auto-ocultar, y lo que el navegador permita.

### Fase 4 — el resto del inventario

La barra de estado, la línea de comandos, las pestañas Model/Layout y lo que quede en la tabla
de la fase 0.

Pedido por el dueño (10/11/2026): **cambiar el estilo visual desde la interfaz**. Hoy solo se
puede tecleando VSCURRENT (`VS`, es `EVA`), y un usuario de AutoCAD busca la etiqueta de los
controles del viewport (`[2D Wireframe]`, arriba a la izquierda) y su lista de estilos; también
la galería de estilos visuales del ribbon, donde la fase 0 la sitúe (si cae en una pestaña de la
fase 1, va con ella). La lista ofrece solo los estilos construidos (2D Wireframe, Hidden,
Conceptual: `docs/coverage/view.md`, VSCURRENT) y ejecuta VSCURRENT, como la de AutoCAD; quita
`vscurrent` de la lista de comandos sin botón de `packages/editor/src/tool-rail.tsx` (o de la que
la sustituya) y la fila «the viewport controls' style menu» de su Missing.
