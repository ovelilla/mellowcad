# Rediseño del editor — brief

> **Estado:** fases 0, 1 y 2 hechas; sigue la 3. En la 0, la barra de comandos pasó a seguir a los
> disparadores de Capas, Estilos y Bloques en la misma fila (centrada volvía a chocar con ellos) y
> «Borrar todo», junto a Abrir hasta que Nuevo lo sustituya. En la 1, cada zona tiene su tamaño en
> CSS antes de que monte el motor, para que el lienzo nazca con su caja final. El panel ocupa ya sus
> 280 px aunque no se pliegue hasta la fase 4: Propiedades se queda con «Sin selección», porque un
> panel que aparece al seleccionar haría cambiar de tamaño el lienzo. La línea de comandos acoplada
> guarda las tres líneas de historial de AutoCAD hasta la fase 5. Los menús en el cursor pasan las
> coordenadas del lienzo a la ventana con `engine.clientFromScreen`. En la 2, la paleta mide 76 px y
> no oculta nada: 16 filas caben a 720 px y, por debajo de 700, Anotación, Bloque y Utilidades se
> pliegan con una variante CSS (`short:`), sin esperar al motor. Borrar es ahora el comando ERASE,
> una herramienta con «Designe objetos» como la de AutoCAD, y no el antiguo «Borrar la selección».
> Seleccionar, Deshacer, Rehacer e Igualar propiedades esperan en la CommandBar a la barra superior.
> Editar atributos es un botón suelto: de su desplegable (Uno, Varios) solo existe uno. Sigue la
> convención de `docs/next-*.md`: se borra cuando la
> última fase esté hecha, y lo que deba durar pasa antes a `.github/instructions/ui.instructions.md`
> y a `docs/autocad-coverage.md`. Versión visual, con las figuras de antes y después:
> https://claude.ai/artifact/BddNdia3MSJnwA4AuXi5Bt (privada; se lee con la herramienta Artifact).

## 1. Por qué

El editor (`/draw`) monta el lienzo a pantalla completa y le pone encima nueve paneles flotantes con
coordenadas fijas (`CadWorkspace`). Medido en Chrome sobre main @ 41f96e9:

| Medida                                                       | 1280×720 | 1366×768 | 1440×900 | 1920×1080 |
| ------------------------------------------------------------ | -------: | -------: | -------: | --------: |
| Casillas del rail fuera de vista (de 36)                     |       20 |       19 |       15 |        10 |
| Solapes entre paneles («Bloques» sobre la barra de comandos) |       sí |       sí |       sí |        no |
| Lienzo cubierto por la interfaz                              |   14,4 % |   12,9 % |   10,9 % |     7,3 % |

En `/es/draw` el solape aparece también a 1440. La cobertura baja dice que el problema no es el área,
sino la dispersión: nueve sitios a los que mirar, cuatro en mitad del dibujo.

Fallos de fondo, por orden de lo que estorban a un usuario diario de AutoCAD:

1. **El rail no cabe.** 36 casillas en una columna miden 1300 px y se desplazan sin indicarlo.
   Deshacer y Rehacer están al final. `RAIL_LAYOUT` tiene grupos, pero se pintan sin separador.
2. **El botón derecho hace encuadre** (`CadRuntime`, «Middle or right button starts a pan»). En
   AutoCAD es Intro o menú contextual. No figura como desviación en `autocad-coverage.md`.
3. **Faltan `LAYER`/`LA` y `PROPERTIES`/`PR`/`CH`/`MO`.** Solo `DIMSTYLE`, `STYLE` y `BLOCKSPALETTE`
   abren su paleta. Ctrl+1 lo reserva el navegador, así que el alias tecleado es el único camino.
4. **Las paletas son popovers**: el primer clic en el lienzo las cierra. No se puede dibujar con
   Capas abierta ni insertar varios bloques seguidos.
5. **ZOOM Extensión encuadra bajo los paneles**, porque el lienzo mide toda la ventana.
6. **Cambiar la capa actual** son tres pasos. Mover la selección de capa es pulsar el nombre en el
   gestor, un gesto que AutoCAD no tiene.
7. **No hay color, tipo de línea ni grosor actuales** (CECOLOR, CELTYPE, CELWEIGHT): todo nace
   PorCapa.
8. **Los desplegables del rail son glifos sin nombre**: Cota abre ocho iconos casi iguales.
9. **El estado activo es `bg-primary`** (casi blanco), la deslumbrante que `ui.instructions.md`
   desaconseja.
10. **Detalles.** La barra de comandos tiene 13 botones sin agrupar. Zoom previo usa el icono de
    Deshacer. «Borrar todo» está junto a «Borrar la selección». Las coordenadas usan `toFixed(3)` en
    vez de la precisión del dibujo, y el factor «1.64×» no existe en AutoCAD. No hay
    `role="toolbar"`, así que recorrer la interfaz con Tab son unas 70 paradas. El lienzo es azul
    noche (`#0b0f14`) y los paneles, gris neutro.

## 2. La disposición acordada

Seis zonas acopladas en una rejilla CSS. El lienzo ocupa el hueco y nada flota sobre él, salvo lo
que AutoCAD pone ahí.

| Zona                   | Tamaño                      | Contenido                                                                                                                                                                                                                                                                                            |
| ---------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barra superior         | 40 px, ancho completo       | menú de la aplicación (Nuevo, Abrir, Guardar, Guardar como, Unidades del dibujo, Idioma) · nombre del dibujo y estado de guardado · Deshacer/Rehacer · desplegable de capa actual + gestor · color, tipo de línea y grosor + Igualar propiedades · conmutadores de paletas y de la línea de comandos |
| Paleta de herramientas | 76 px, dos columnas, inicio | solo comandos contra el lienzo, en cinco secciones (§3)                                                                                                                                                                                                                                              |
| Lienzo                 | el resto                    | encima: la etiqueta de vista «[Superior ▾]» arriba a la izquierda (controles de ventana gráfica), el ViewCube y, debajo, la barra de navegación (Encuadre, Zoom ▾, Órbita); la entrada dinámica, las fichas de opciones y los menús                                                                  |
| Panel de paletas       | 280 px, fin, plegable a 36  | pestañas Propiedades, Capas, Bloques, Estilos; sin modo                                                                                                                                                                                                                                              |
| Línea de comandos      | 28 px                       | una línea; el historial se despliega hacia arriba hasta 12 líneas con F2                                                                                                                                                                                                                             |
| Barra de estado        | 28 px, ancho completo       | coordenadas a la izquierda; modos a la derecha (§4)                                                                                                                                                                                                                                                  |

- El ViewCube sigue visible por defecto, pero más pequeño y a media opacidad hasta que el cursor se
  acerca.
- Restablecer vista desaparece (lo hace la casa del ViewCube). Acercar, Alejar y Zoom previo pasan a
  ser miembros del desplegable de Zoom.
- Comportamiento según la ventana:
  - El panel se abre por defecto a partir de 1600 px de ancho; por debajo empieza plegado.
  - Por debajo de 700 px de alto, Anotación, Bloque y Utilidades se pliegan en un desplegable cada
    una (el precedente es el estado «Minimizar a botones de panel» de la cinta).
- Táctil y móvil quedan fuera de alcance.
- Descartado:
  - Una cinta completa: cuesta 70–150 px de alto y en panorámica escasea el alto.
  - Barras arrastrables o espacios de trabajo: solo se recuerdan el ancho y el plegado del panel.
  - Un tema claro y una paleta tipo Ctrl+K: la línea de comandos ya cumple ese papel.

## 3. Paleta de herramientas

Dos columnas, 16 filas, unos 600 px con separadores; caben en los ~624 px libres a 1280×720. Un
desplegable abre una lista con icono, nombre y alias, no una tira de glifos. «▾ más» es el panel
ampliado de la cinta.

| Sección    | Casillas (▾ = desplegable)                                                                                                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dibujo     | Línea · Polilínea · Círculo ▾ · Arco ▾ · Rectángulo/Polígono ▾ · Elipse ▾ · Sombreado · Spline                                                                                                  |
| Modificar  | Desplazar · Girar · Recortar/Alargar ▾ · Borrar (`ERASE`) · Copiar · Simetría · Empalme/Chaflán ▾ · Descomponer · Estirar · Escala · Matriz ▾ · Desfase · ▾ más (Partir en punto, Unir, Partir) |
| Anotación  | Texto ▾ (MTEXT, TEXT) · Cota ▾ · Continua/Línea base ▾ · ▾ más (Editar texto, Ajustar espacio)                                                                                                  |
| Bloque     | Insertar · Crear · Editar atributos · ▾ más (Definir atributos, Visualización de atributos)                                                                                                     |
| Utilidades | Medir ▾ · Localizar punto (`ID`)                                                                                                                                                                |

Salen del rail:

- Seleccionar: es el estado de reposo y se vuelve con Esc. Si se echa de menos, vuelve como casilla
  suelta encima de Dibujo.
- Deshacer y Rehacer: a la barra superior.
- Igualar propiedades: junto a las propiedades de la barra superior.
- Borrar todo: se convierte en Nuevo, en el menú de la aplicación.

`RAIL_EXCLUDED` debe seguir cubriendo lo que vive en otra zona.

## 4. Barra de estado, paletas e interacción

- **Barra de estado.** Orden de la referencia de 2026: Coordenadas · Modelo · Rejilla · Forzcursor ▾
  · Orto · Polar ▾ · Rastreo · Referencia a objetos ▾ · Grosor · Ciclo de selección ▾ · Unidades
  («mm») · Pantalla limpia · Personalización (≡, el último).
  - La flecha de ajustes es un medio botón pegado de 14 px. El clic derecho sobre el modo abre el
    mismo menú.
  - El estado activo es un fondo azul tenue con el icono en azul.
  - Personalización elige qué modos se ven y si se ven las coordenadas. AutoCAD las oculta por
    defecto desde 2015; aquí siguen visibles (COORDS 1, ya decidido en `autocad-coverage.md`).
  - Las coordenadas usan la precisión del dibujo.
  - Unidades, precisión, LTSCALE y DIMSCALE salen del popover de la barra a un diálogo «Unidades del
    dibujo» (`UNITS`/`UN`).
- **Propiedades.**
  - Sin selección muestra «Sin selección» y General con las propiedades actuales.
  - Con selección tiene el desplegable de tipo de objeto («Todo (6)», «Línea (5)»…) que filtra lo
    que se edita.
  - No aparece ni desaparece: solo cambia su contenido.
- **Capas.**
  - El gestor actual, como pestaña, con encabezados de columna.
  - La capa actual se fija con doble clic en la fila o con «Establecer actual».
  - Se retira el gesto de pulsar el nombre para mover la selección: lo hace el desplegable de la
    barra superior.
- **Bloques y Estilos.** Los de hoy, en el panel. Como ya no se cierran, el comentario sobre Repeat
  Placement de `blocks-control.tsx` deja de aplicar.
- **Comandos.** `LAYER`/`LA`, `LAYERCLOSE`, `PROPERTIES`/`PR`/`CH`/`MO`, `PROPERTIESCLOSE`,
  `CLEANSCREENON`/`CLEANSCREENOFF`.
  - Pantalla limpia también con Ctrl+0, si el navegador deja interceptarlo; hay que comprobarlo. Si
    no, una tecla de función, con su `WHY`.
  - Pantalla limpia oculta la paleta de herramientas, el panel y los grupos de capa y propiedades.
    Conserva el menú, Deshacer/Rehacer, la línea de comandos y la barra de estado, igual que AutoCAD.
- **Teclado.** Cada zona es un `role="toolbar"` con flechas dentro y Tab entre zonas. Tras actuar en
  una paleta, el foco vuelve al lienzo (`engine.focusSurface()`), como ya hace Propiedades.
- **Sistema visual.**
  - Superficies teñidas del azul del lienzo, en tres escalones.
  - Un solo acento: el azul de los pinzamientos (`THEME.grip`, `#3b82f6`), para activo, actual,
    foco y fila seleccionada. `--primary` deja de ser fondo de estado.
  - Barras acopladas sin radio ni sombra; el radio, solo en menús.
  - Botones de 30 × 28 px con icono de 16 px.
  - Texto: mínimo 12 px para etiquetas y 11 px solo para cifras tabulares.

## 5. Fidelidad: verificado y pendiente

Verificado en la ayuda de AutoCAD 2026:

- **Desplegables de la cinta.** Círculo, Arco, Rectángulo/Polígono, Recortar/Alargar,
  Empalme/Chaflán y Matriz son desplegables. Línea, Polilínea y Sombreado son botones sueltos.
- **Panel Modificar ampliado.** Partir en punto y Unir.
- **Panel Propiedades.** Ahí está Igualar propiedades.
- **Desplegables de capa y propiedades.** Sin selección muestran los valores actuales; con
  selección, los de los objetos. Elegir una capa con objetos seleccionados los mueve a ella.
- **Paleta Propiedades.** Sin selección muestra las propiedades actuales. QPMODE está desactivado
  por defecto (−1), así que no hay Propiedades rápidas.
- **Barra de estado.** El orden de §4. La Personalización es el último botón. Las coordenadas están
  ocultas por defecto.
- **Pantalla limpia.** Ctrl+0 conserva la barra de acceso rápido, la ventana de comandos y la barra
  de estado.
- **Atajos.** Ctrl+0 Pantalla limpia, Ctrl+1 Propiedades, Ctrl+9 línea de comandos.
- **Barra de navegación.** Activa por defecto (NAVBARDISPLAY 1), con Encuadre, Zoom y Órbita, junto
  al ViewCube.
- **Cinta.** Existen los estados de minimizado (a pestañas, a títulos de panel, a botones de panel).
- **Elipse** es un desplegable de la fila principal del panel Dibujo, junto a Rectángulo y Sombreado.
  La ayuda cita Eje, Fin y Arco elíptico; Centro solo se deduce de la opción de ELLIPSE, así que el
  orden de sus miembros no cambia. **Spline** está en el panel Dibujo ampliado; aquí conserva su
  casilla, porque cabe y un desplegable de uno solo añadiría un clic.
- **Partir, Partir en punto y Unir** están en el panel Modificar ampliado, como dice §3. La fila
  principal es Desplazar/Copiar/Estirar, Girar/Simetría/Escala, Recortar▾/Empalme▾/Matriz▾ y
  Borrar/Descomponer/Desfase.
- **Cota.** El panel Anotación de Inicio tiene Texto (dividido), Cota (`DIM`, que no existe aquí) y un
  desplegable «Lineal▾»; ninguna página de 2025 ni 2026 enumera sus miembros. Las rutas de 2026 van
  todas a la pestaña Anotar: su desplegable Cotas lleva Lineal, Alineada, Angular, Radio y Diámetro,
  que son los miembros de la casilla; faltan Longitud de arco, Recodo y Por coordenadas, que no
  existen. Continua/Línea base («Continue/Baseline drop-down») y Ajustar espacio (`DIMSPACE`) son
  solo de Anotar.
- **Bloque.** Insertar, Crear, Editar y Editar atributos▾ (Uno es `EATTEDIT`; Varios no se ha podido
  verificar). Definir atributos está en el panel Bloque. Ni `ATTDISP` ni `TEXTEDIT` tienen sitio
  documentado en la cinta, así que quedan en «▾ más».
- **Utilidades.** Medir▾ (Distancia y Área citados en 2026) e ID de punto.

**Comprobar antes de usarlo:**
- En qué lado acopla AutoCAD la paleta Propiedades por defecto. Aquí va a la derecha, junto al
  ViewCube.
- El clic derecho por defecto (SHORTCUTMENU, clic derecho temporizado) y el contenido de los menús
  contextuales con y sin comando.
- Que `LAYER` abre el Administrador de propiedades de capas como paleta.
- Si Chrome deja interceptar Ctrl+0.

Fuentes (todas en `help.autodesk.com/cloudhelp/2026/ENU/`):

- `AutoCAD-OnBoarding/files/ACD_FOUNDATIONS_MAIN7.html` (Modificar)
- `ACD_FOUNDATIONS_MAIN8.html` (capas y propiedades)
- `AutoCAD-Core/files/GUID-81585857-F1B1-44F4-B7D0-B707386CA721.htm` (Object Properties Tools)
- `GUID-E3B34B0A-EA98-45E9-937A-BF5FEF4152DB.htm` (barra de estado)
- `GUID-8FBF7BAA-4A34-4171-A7B5-A6E28B8EC4CE.htm` (Clean Screen)
- `GUID-1803CDBC-C0C9-4AB9-B76B-FF6AB214D97B.htm` (QPMODE)
- `GUID-17225A0F-7A50-41B9-8404-7D415518DEFB.htm` (Navigation Bar)
- `GUID-627FCA86-38B1-404B-BB09-9FC3348B54F2.htm` (estados de la cinta)
- `GUID-A3E54913-3813-407D-9283-19EC6610D4F3.htm` (elipses), `AutoCAD-GettingStarted/files/GUID-6B8B7254-94CD-42DB-8F27-1339CAECE9ED.htm`
  y `GUID-9810D35D-E975-49E2-88EA-51FE4ACC92DB.htm` (capturas de los paneles Dibujo y Anotación)
- `AutoCAD-DidYouKnow/files/GUID-73B7DEA8-309E-4823-9F65-DB0A2E1FBC75.htm` (Partir y Partir en punto),
  `GUID-1823FF63-6952-47DD-89F8-29E4AA5B2582.htm` (Spline en el panel ampliado),
  `GUID-7B14AAA4-3208-4384-A444-8A29231C4A02.htm` (DIM en el panel Anotación)
- `AutoCAD-OnBoarding/files/ACD_FOUNDATIONS_MAIN10.html` y `acd_foundations_main2/ACD_FOUNDATIONS_MAIN2B.html`
  (desplegables Cotas y Continua/Línea base de Anotar)
- `GUID-ECF7FC17-…` (Editar atributo único), `GUID-F26C676B-BF70-4538-A31F-4FBA07DC19D6.htm` (Medir ▾ Distancia),
  `GUID-27F11419-81E7-428A-972E-561F5809FBCD.htm` (ID de punto)
- `AutoCAD-Customization/files/GUID-B6A9C126-230D-47F5-8973-464BC80E3736.htm` (atajos)

## 6. Fases

Cada fase va en su propio commit, con `typecheck`, `lint` y `test:coverage` en verde. Las reglas que
cambie se actualizan en el mismo cambio, sobre todo «Where a control belongs» y «Palettes that show
drawing content» de `ui.instructions.md`. Todo texto nuevo va a los tres catálogos (`messages/en|es|ar.json`;
los del motor en `cad/locales/`, con `npm run locales`). Las clases son lógicas, y RTL se comprueba en
`/ar/draw`.

0. **Arreglos sin mover la disposición.**
   - Capas, Estilos y Bloques en un único contenedor flex: se acaba el solape.
   - Separadores entre los grupos de `RAIL_LAYOUT`.
   - Desplegables como lista con icono, nombre y alias.
   - Estado activo en azul tenue en el rail, la barra de comandos y la de estado.
   - Coordenadas con la precisión del dibujo.
   - Icono propio para Zoom previo.
   - «Borrar todo» fuera del rail.
1. **Esqueleto acoplado.**
   - `CadWorkspace` pasa a una rejilla de áreas con nombre.
   - **Riesgo principal:** la entrada dinámica, las fichas de opciones, el menú de referencia a
     objetos y la lista del ciclo de selección se colocan hoy respecto a `<main>`, que coincide con el
     lienzo. Deben vivir en una celda `relative` que tenga exactamente la caja del lienzo.
   - El motor ya redimensiona el lienzo con `ResizeObserver`, así que Extensión encuadrará el área
     visible sin tocarlo.
   - La transición de vista desde la landing sigue apuntando al lienzo (`SHEET_TRANSITION`).
2. **Paleta de herramientas de §3,** con el plegado por alto.
3. **Barra superior de §2.**
   - El desplegable de capa mueve la selección.
   - Los de propiedades actúan sobre la selección hasta la fase 5.
   - La vista pasa a la esquina del lienzo y a la barra de navegación.
   - En el motor, si se quieren en el menú: `NEW`/`QNEW` y `SAVEAS`.
4. **Panel de paletas sin modo.**
   - El estado del panel vive en el motor, como hoy `stylesPanel` y `blocksPanel`, para que los
     comandos lo abran.
   - Comandos de §4, con sus filas en `autocad-coverage.md`.
5. **Barra de estado, línea de comandos y propiedades actuales.**
   - La barra de estado y el diálogo de Unidades del dibujo.
   - El historial con F2 y Pantalla limpia.
   - CECOLOR, CELTYPE y CELWEIGHT en el documento, en el formato de archivo (con su versión) y en
     cada herramienta que crea entidades. Es la pieza más cara; puede retrasarse sin bloquear lo
     demás.
6. **Botón derecho y menú contextual.**
   - Intro o menú según el estado, verificado antes en la ayuda de AutoCAD.
   - Encuadre solo con el botón central y la rueda.
   - El menú, con Base UI, como `SnapOverrideMenu`.
   - En el arnés de Vitest: el clic derecho termina LINE, confirma una selección y repite el último
     comando.

## 7. Cómo se comprueba

Objetivos al terminar:

- 0 casillas ocultas a 1280×720 y a 1920×1080.
- 0 solapes en 4 tamaños × 3 idiomas.
- Ningún panel sobre el lienzo salvo el ViewCube, la barra de navegación y la etiqueta de vista.
- Nada tapado tras ZOOM Extensión.
- Cambiar la capa actual en 2 pasos.
- 7 de 7 alias de paleta funcionando.
- 6 zonas de tabulador.

La medición es de Playwright, porque el arnés no ve el DOM. Sigue `local-verification-setup`:
playwright-core en el scratchpad y Chrome del sistema. Por cada tamaño y en `/draw`, `/es/draw` y
`/ar/draw`:

- Toma los descendientes de `main` con `.pointer-events-auto` que no tengan otro ancestro igual (las
  zonas, cuando estén acopladas).
- Comprueba que no se solapan entre sí y que ninguno corta el rectángulo del lienzo, salvo los
  permitidos.
- En la paleta de herramientas, cuenta los botones cuyo `getBoundingClientRect().bottom` supera el
  del contenedor.
- Dibuja unas entidades, ejecuta `ZOOM` `E`, comprueba que sus extremos en pantalla caen dentro de
  la caja del lienzo y haz una captura de cada caso.
