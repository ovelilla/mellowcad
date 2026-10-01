# Rediseño del editor — brief

> **Estado:** fases 0 a 5b hechas; sigue la 5c (CECOLOR, CELTYPE y CELWEIGHT) y después la 6. En la
> 5b, todo lo que se pulsa mide 28 px (los botones de icono, cuadrados de 28 × 28 con icono de 16), y
> las barras de controles, 36: la superior y la de estado; la línea de comandos es una fila de 28. Se
> eligió 28 frente a 32 por densidad: a 32 la paleta ya no cabe a 720 px, la ganancia de Fitts es de
> un 5 % y los dos cumplen el 2.5.8 de WCAG 2.2 (24 × 24). `lib/control-size.test.ts` lo hace
> cumplir, y las reglas están en «Size» de `ui.instructions.md`. En la
> 5, la barra de estado (28 px) sigue el orden de AutoCAD 2026, con sus flechas de ajustes de 14 px,
> el clic derecho que abre el mismo menú y una Personalización que se recuerda en el dispositivo;
> MODEL es una etiqueta, porque aquí no hay presentaciones. La línea de comandos es de una línea
> (28 px), con las líneas temporales del comando (CLIPROMPTLINES 3) que se desvanecen y el historial
> de hasta 12 líneas con F2. Chrome deja a la página Ctrl+9, Ctrl+0 y Ctrl+1 (medido con pulsaciones
> reales del sistema), así que son los de AutoCAD: línea de comandos, Pantalla limpia y Propiedades,
> sin desviación. UNITS abre el diálogo Unidades de dibujo (longitud, escala de inserción y muestra
> de salida) en un paso de deshacer; LTSCALE es un comando; DIMSCALE vive solo en Estilos. Pantalla
> limpia (CLEANSCREENON/OFF) vive en el motor y oculta las zonas por CSS; no se guarda, como en
> AutoCAD. En la 4b, todo texto del editor es uno de dos
> roles de 12 px (`text-ui`, `text-title`), con monoespaciado solo para lo tecleado y las cifras, y
> uno de tres escalones de color; las reglas están en «Type» de `ui.instructions.md` y
> `lib/type-scale.test.ts` las hace cumplir. La barra de estado, el diálogo de Unidades, el
> historial y el menú contextual de las fases 5 y 6 nacen con ellas. En la 0, la barra de comandos pasó a seguir a los disparadores de Capas, Estilos y
> Bloques en la misma fila (centrada volvía a chocar con ellos) y
> «Borrar todo», junto a Abrir hasta que Nuevo lo sustituya. En la 1, cada zona tiene su tamaño en
> CSS antes de que monte el motor, para que el lienzo nazca con su caja final. El panel ocupa ya sus
> 280 px aunque no se pliegue hasta la fase 4: Propiedades se queda con «Sin selección», porque un
> panel que aparece al seleccionar haría cambiar de tamaño el lienzo. La línea de comandos acoplada
> guarda las tres líneas de historial de AutoCAD hasta la fase 5. Los menús en el cursor pasan las
> coordenadas del lienzo a la ventana con `engine.clientFromScreen`. En la 2, la paleta mide 76 px y
> no oculta nada: 17 filas caben a 720 px y, por debajo de 700, Anotación, Bloque y Utilidades se
> pliegan con una variante CSS (`short:`), sin esperar al motor. Borrar es ahora el comando ERASE,
> una herramienta con «Designe objetos» como la de AutoCAD, y no el antiguo «Borrar la selección».
> Seleccionar, Deshacer, Rehacer e Igualar propiedades esperan en la CommandBar a la barra superior.
> Las casillas se agrupan solo por semántica (variantes de un comando o comandos sobre un mismo
> objeto), nunca para ahorrar sitio: el «▾ más» de §3 se descartó, Partir en punto entra en Partir ▾,
> Unir, Editar texto y Ajustar espacio son casillas, y los tres comandos de atributos forman
> Atributos ▾. En la 3, la barra superior (`TopBar`) sustituye a la CommandBar: el menú de la
> aplicación, la barra de acceso rápido en el orden de AutoCAD, el estado del autoguardado, Capas y
> el desplegable de capa, Igualar propiedades con color, grosor y tipo de línea, y al final Estilos,
> Bloques y la línea de comandos. NEW, QNEW y SAVEAS son comandos del motor; Nuevo es un paso de
> deshacer porque aquí no hay pestaña a la que volver. Cambiar capa o propiedades desde un
> desplegable es ahora un solo paso de deshacer (antes, uno por objeto). La etiqueta `[Superior]` y
> la barra de navegación van sobre el lienzo; Restablecer vista desaparece. Seleccionar no tiene
> casilla. Unidades del dibujo abre el popover de la barra de estado hasta el diálogo de la fase 5.
> El nombre del dibujo queda pendiente: el puerto de archivos no sabe cómo se llama el archivo
> abierto. El ViewCube solo atrapa el puntero donde está dibujado, pero en `/ar/draw` su brújula
> sigue cayendo sobre una esquina del dibujo de prueba tras ZOOM E, como el de AutoCAD tapa la
> vista: ZOOM E no lo esquiva. En la 4, Propiedades, Capas, Bloques y Estilos son pestañas de un
> panel sin modo de 280 px (se ensancha hasta 480 por su borde; más estrecho, los nombres de las
> pestañas no caben en español) que se pliega a 36 px; su
> estado vive en el motor (`state.palette`) y lo abren LAYER, PROPERTIES, DIMSTYLE, STYLE y
> BLOCKSPALETTE. Como el panel es uno, LAYERCLOSE y PROPERTIESCLOSE lo pliegan solo si su pestaña es
> la visible. Para que el lienzo nazca con su caja final, un script en el `<head>`
> (`lib/palette-layout.ts`) escribe en `<html>` el plegado y el ancho recordados antes de que se
> analice el cuerpo, con una media query de 1600 px como respaldo, y el motor recibe la misma
> respuesta al construirse: medido con los bundles bloqueados frente a la caja tras montar, y con la
> transición desde la landing, también con el plegado recordado al revés del de por defecto.
> Propiedades edita lo que deja su filtro de tipo con el ámbito `"properties"`; los desplegables de
> la barra siguen sobre toda la selección. En el gestor de capas, F2 no renombra (es la línea de
> comandos): se renombra pulsando otra vez el nombre de la fila designada. Sigue la convención de `docs/next-*.md`: se borra cuando la
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

| Zona                   | Tamaño                      | Contenido                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barra superior         | 36 px, ancho completo       | menú de la aplicación (Nuevo, Abrir, Guardar, Guardar como, Unidades del dibujo, Idioma) · barra de acceso rápido (Nuevo, Abrir, Guardar, Guardar como, Deshacer, Rehacer) · estado de guardado · gestor de capas + desplegable de capa actual · Igualar propiedades + color, grosor y tipo de línea · conmutadores de paletas y de la línea de comandos |
| Paleta de herramientas | 67 px, dos columnas, inicio | solo comandos contra el lienzo, en cinco secciones (§3)                                                                                                                                                                                                                                                                                                  |
| Lienzo                 | el resto                    | encima: la etiqueta de vista «[Superior ▾]» arriba a la izquierda (controles de ventana gráfica), el ViewCube y, debajo, la barra de navegación (Encuadre, Zoom ▾, Órbita); la entrada dinámica, las fichas de opciones y los menús                                                                                                                      |
| Panel de paletas       | 280 px, fin, plegable a 36  | pestañas Propiedades, Capas, Bloques, Estilos; sin modo                                                                                                                                                                                                                                                                                                  |
| Línea de comandos      | una fila de 28 px           | una línea; el historial se despliega hacia arriba hasta 12 líneas con F2                                                                                                                                                                                                                                                                                 |
| Barra de estado        | 36 px, ancho completo       | coordenadas a la izquierda; modos a la derecha (§4)                                                                                                                                                                                                                                                                                                      |

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

Dos columnas, 17 filas, 576 px con separadores; caben en los 619 px libres a 1280×720. Un
desplegable abre una lista con icono, nombre y alias, no una tira de glifos, y agrupa solo variantes
de un comando o comandos sobre un mismo objeto: nada se esconde en un «▾ más» por falta de sitio.

| Sección    | Casillas (▾ = desplegable)                                                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dibujo     | Línea · Polilínea · Círculo ▾ · Arco ▾ · Rectángulo/Polígono ▾ · Elipse ▾ · Sombreado · Spline                                                                            |
| Modificar  | Desplazar · Girar · Recortar/Alargar ▾ · Borrar (`ERASE`) · Copiar · Simetría · Empalme/Chaflán ▾ · Descomponer · Estirar · Escala · Matriz ▾ · Desfase · Partir ▾ · Unir |
| Anotación  | Texto ▾ (MTEXT, TEXT) · Cota ▾ · Continua/Línea base ▾ · Editar texto · Ajustar espacio                                                                                   |
| Bloque     | Insertar · Crear · Atributos ▾ (Editar, Definir, Visualización)                                                                                                           |
| Utilidades | Medir ▾ · Localizar punto (`ID`)                                                                                                                                          |

Salen del rail:

- Seleccionar: sin casilla (decidido en la fase 3). Es el estado de reposo y se vuelve con Esc, como
  en AutoCAD. `RAIL_EXCLUDED` lo sigue listando.
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
  - Unidades y precisión salen del popover de la barra al diálogo «Unidades de dibujo»
    (`UNITS`/`UN`); LTSCALE pasa a ser comando, y DIMSCALE queda en la paleta Estilos («Usar escala
    general»), su sitio en AutoCAD.
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
  - Pantalla limpia también con Ctrl+0: Chrome deja interceptarlo (comprobado en la fase 5).
  - Pantalla limpia oculta la paleta de herramientas, el panel y los grupos de capa y propiedades.
    Conserva el menú, Deshacer/Rehacer, la línea de comandos y la barra de estado, igual que AutoCAD.
- **Teclado.** Cada zona es un `role="toolbar"` con flechas dentro y Tab entre zonas. Tras actuar en
  una paleta, el foco vuelve al lienzo (`engine.focusSurface()`), como ya hace Propiedades.
- **Sistema visual.**
  - Superficies teñidas del azul del lienzo, en tres escalones.
  - Un solo acento: el azul de los pinzamientos (`THEME.grip`, `#3b82f6`), para activo, actual,
    foco y fila seleccionada. `--primary` deja de ser fondo de estado.
  - Barras acopladas sin radio ni sombra; el radio, solo en menús.
  - Todo control mide 28 px: botones de icono de 28 × 28 con icono de 16, y desplegables, campos,
    pestañas y filas de 28 de alto. Las barras de controles, 36 (fase 5b).
  - Texto: 12 px en todo, con la jerarquía en el peso y el color; la escala es la de la fase 4b
    («Type» en `ui.instructions.md`).

## 5. Fidelidad: verificado y pendiente

Verificado en la ayuda de AutoCAD 2026:

- **Desplegables de la cinta.** Círculo, Arco, Rectángulo/Polígono, Recortar/Alargar,
  Empalme/Chaflán y Matriz son desplegables. Línea, Polilínea y Sombreado son botones sueltos.
- **Panel Modificar ampliado.** Partir en punto y Unir.
- **Panel Propiedades.** Ahí está Igualar propiedades.
- **Desplegables de capa y propiedades.** Sin selección muestran los valores actuales; con
  selección, los de los objetos («If no objects are selected, the drop-down lists … display the
  current settings for the drawing»). Elegir una capa con objetos seleccionados los mueve a ella; sin
  selección, la hace actual. Con una selección mixta solo está documentado `*VARIES*` en la paleta
  Propiedades; aquí el desplegable queda vacío.
- **Menú de la aplicación.** Crea, abre y guarda; Unidades está en Utilidades de dibujo > Unidades;
  la página de NEW enlaza con él.
- **Barra de acceso rápido.** Nuevo, Abrir, Guardar y Guardar como, y Deshacer y Rehacer, que son
  botones divididos con una lista de lo que deshacen; aquí son botones simples.
- **NEW, QNEW y SAVEAS.** QNEW usa la plantilla por defecto, que de fábrica es Ninguna, y entonces
  muestra Seleccionar plantilla como NEW: sin plantillas, los dos hacen lo mismo. El dibujo nuevo
  («Dibujo1») se abre en otra pestaña y el actual sigue abierto. SAVEAS siempre pide nombre y el
  nuevo pasa a ser el dibujo actual. En español, NUEVO, RNUEVO y GUARDARCOMO. Un asterisco en la
  pestaña marca los cambios sin guardar.
- **Controles de ventana gráfica.** VPCONTROL vale 1: `[+] [Top] [2D Wireframe]`
  arriba a la izquierda de cada ventana; aquí solo existe el control de vista.
- **Paleta Propiedades.** Sin selección muestra las propiedades actuales. QPMODE está desactivado
  por defecto (−1), así que no hay Propiedades rápidas.
- **Barra de estado.** El orden de §4. La Personalización es el último botón. Las coordenadas están
  ocultas por defecto.
- **Lado del panel.** La ayuda de 2026 no documenta un lado por defecto: Propiedades se acopla «to
  either side of the drawing window» y no se muestra al primer arranque («not displayed by
  default»); su posición persiste entre sesiones. Aquí va al final (inline-end), junto al ViewCube.
- **LAYER (CAPA, alias LA / CA)** abre el Administrador de propiedades de capas como paleta sin
  modo: LAYERDLGMODE vale 1, «It can remain open as you work» («Puede permanecer abierto mientras se
  trabaja»). **LAYERCLOSE (CERRARCAPA)** «Closes the Layer Properties Manager».
- **PROPERTIES (PROPIEDADES)** muestra la paleta Propiedades; PR en las dos lenguas y Ctrl+1, que la
  muestra u oculta. CH y MO están en la guía de atajos de Autodesk, no en la ayuda de 2026; en
  español CH es CHAFLAN, así que PROPIEDADES solo lleva PR. **PROPERTIESCLOSE (CERPROP)** «Closes
  the Properties palette».
- **Filtro de tipo de objeto.** «Use the object type filter drop-down list when you select multiple
  types of objects, and want to modify the properties of a single object type at a time». Sin
  selección «only the current settings of general properties are displayed». Los textos «All (n)»,
  «Line (5)» y «No selection» solo aparecen en capturas, no en el texto de ninguna página.
- **Columnas del administrador**, en el orden de la página de referencia: Estado, Nombre, Act,
  Inutilizar, Bloquear, Color, Tipo de línea, Grosor de línea, Transparencia, Estilo de trazado,
  Trazar, Inutilizar en las ventanas nuevas y Descripción (se pueden reordenar arrastrándolas). La
  capa actual se fija con «Set Current» («Definir actual» en español, no «Establecer actual»), o con
  doble clic en el nombre de la capa (guía de iniciación); la marca de verificación señala la actual.
- **Repetir colocación** de la paleta Bloques sigue pidiendo puntos de inserción hasta Esc; aquí no
  existe, pero como el panel ya no se cierra, cada bloque es un clic.
- **Pantalla limpia.** Ctrl+0 conserva la barra de acceso rápido, la ventana de comandos y la barra
  de estado.
- **Atajos.** Ctrl+0 Pantalla limpia, Ctrl+1 Propiedades, Ctrl+9 línea de comandos.
- **Barra de navegación.** Activa por defecto (NAVBARDISPLAY 1; NAVBAR la activa y desactiva).
  Vinculada al ViewCube, va en vertical encima o debajo de él. Sus herramientas: SteeringWheels,
  Encuadre, Zoom, Órbita y ShowMotion; aquí, las tres centrales. Los botones divididos abren la lista
  desde su parte pequeña, y la de Zoom incluye Zoom extensión.
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
  documentado en la cinta; Editar texto es casilla y Visualización entra en Atributos ▾.
- **Utilidades.** Medir▾ (Distancia y Área citados en 2026) e ID de punto.
- **Ventana de comandos.** F2 «Expands the Command Line history when the Command Line window is
  floating, or displays the Text window when the Command Line window is docked»; Ctrl+9 «Toggles
  the Command Line window». CLIPROMPTLINES vale 3: «A temporary prompt history displays above the
  command window while a command is in progress». La ayuda no da el número de líneas del historial
  ampliado ni el tiempo del desvanecido: los 12 y los 6 s son nuestros.
- **Pantalla limpia.** CLEANSCREENON (LIMPIAPANTACT) y CLEANSCREENOFF (LIMPIAPANTDES); el botón es
  «Clean Screen» / «Limpiar pantalla»; CLEANSCREENSTATE no se guarda. CLEANSCREENOPTIONS no existe
  en AutoCAD (es de BricsCAD).
- **Barra de estado (fase 5).** MODEL, en el espacio modelo, «display[s] the most recently accessed
  layout»; Unidades muestra el formato (LUNITS) y el clic derecho lo cambia; la flecha y el clic
  derecho abren el mismo menú; los incrementos de Polar son 90, 60, 45, 30, 22.5, 18, 15, 10 y 5.
- **Unidades de dibujo.** Grupos Longitud (Tipo, Precisión), Ángulo (Tipo, Precisión, En el sentido
  horario), Escala de inserción, Muestra de salida, Iluminación y el botón Dirección; UNITS / UN,
  UNIDADES / UNS† (transcripción del pgp). LTSCALE (ESCALATL, EC†) vale 1.0000 y se guarda en el
  dibujo; su solicitud exacta no está en la ayuda.
- **Atajos en Chrome.** Ctrl+9, Ctrl+0 y Ctrl+1 llegan antes a la página y solo cambian de pestaña o
  restablecen el zoom si no se anulan (pulsaciones reales con SendKeys, Chrome en Windows,
  01/10/2026).

**Comprobar antes de usarlo:**

- El orden completo del menú de la aplicación y de la barra de acceso rápido, los miembros y el orden
  de la lista de Zoom de la barra de navegación y si su botón recuerda el último zoom. Aquí: Extensión,
  Ventana, Previo, Ampliar y Reducir, y el botón muestra el último usado.
- Qué muestran los desplegables de la cinta con una selección mixta.
- El clic derecho por defecto (SHORTCUTMENU, clic derecho temporizado) y el contenido de los menús
  contextuales con y sin comando.

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
- Fase 5: `AutoCAD-Customization/files/GUID-B6A9C126-230D-47F5-8973-464BC80E3736.htm` (F2, Ctrl+9, Ctrl+0),
  `GUID-06F6A6E9-C355-43F5-8706-49F0E5E552BF.htm` y `GUID-C9DB1661-36D0-4E5B-99A0-43A6ACA46110.htm` (historial),
  `GUID-8B14D930-2B19-497D-B61E-EFD95296221C.htm` (CLIPROMPTLINES), `GUID-1D51E778-88BF-4614-9711-D7890B4E79F7.htm`,
  `GUID-7C9CDCC6-8B1E-471D-9F6F-E1160F9AC3A8.htm` y `GUID-ADC0D08A-3E48-404A-B0B1-75E479182FF3.htm` (Pantalla limpia),
  `GUID-5FD72B72-1FFF-44BF-97B3-938552FD6C51.htm` (MODEL), `GUID-F780BFA4-F711-43CB-A9B9-9D08683FA2CF.htm` (Unidades),
  `GUID-9B416455-D3C9-4799-9433-AC1384F43138.htm` (Personalización), `GUID-7EC3C63D-EA4E-4E65-A676-C3A3627E3F19.htm`
  (ángulos polares), `GUID-1DAE2080-84E4-413E-BB4E-F5D2A96CB14A.htm` (UNITS), `GUID-75419F91-18B8-47EE-9272-3196ACC95977.htm`
  (Unidades de dibujo), `GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm` (INSUNITS), `GUID-47B3793A-37BF-45FC-94CB-670433ADD366.htm`
  y `GUID-88787AE5-957B-483C-9EEF-51564114181F.htm` (LTSCALE), y las páginas ESP con los mismos GUID
- `GUID-ECF7FC17-…` (Editar atributo único), `GUID-F26C676B-BF70-4538-A31F-4FBA07DC19D6.htm` (Medir ▾ Distancia),
  `GUID-27F11419-81E7-428A-972E-561F5809FBCD.htm` (ID de punto)
- `AutoCAD-Customization/files/GUID-B6A9C126-230D-47F5-8973-464BC80E3736.htm` (atajos)
- `AutoCAD-Core/files/GUID-D976938F-5EE4-4B63-81C6-51175D8B4C34.htm` (menú de la aplicación),
  `AutoCAD-OnBoarding/files/ACD_FOUNDATIONS_MAIN3.html` (Unidades, barra de acceso rápido, Zoom
  extensión), `GUID-BC96A2AA-2AEE-47C0-B1F2-85F8B60663D6.htm` (Deshacer y Rehacer divididos)
- `GUID-90BE41A2-7FFD-44DB-A927-B7A9277C75C2.htm` (NEW), `GUID-CF3C039B-CF22-4933-928A-93A3AA71C4FA.htm`
  (QNEW), `GUID-1FF801F9-7FEE-4494-854D-4704A7784232.htm` (SAVEAS), y las páginas ESP con los
  mismos GUID (NUEVO, RNUEVO, GUARDARCOMO); `AutoCAD-GettingStarted/files/GUID-5B6347C1-B458-4336-AB2A-C16AF161B755.htm`
  (pestañas de archivo)
- `GUID-61017FE1-B409-4DCA-948F-4B09903992C7.htm` (VPCONTROL), `GUID-69482C47-5BF4-4AEE-9AB8-3904F4300C20.htm`
  (controles de ventana gráfica), `GUID-96CA70D4-A86A-4BEE-BBB3-BFF1C28799A2.htm` (NAVBARDISPLAY),
  `GUID-90981580-5028-4E74-A117-21EFA734017F.htm` (NAVBAR), `AutoCAD-OnBoarding/files/ACD_FOUNDATIONS_MAIN1.html`
  (herramientas de la barra de navegación), `AutoCAD-GettingStarted/files/GUID-FA005756-B8F5-4A78-988F-31335A68D77C.htm`
  (capa actual sin selección)
- Fase 4: `GUID-9123091A-2DCB-4DE8-983C-F7CA38FA67BE.htm` (LAYER / CAPA),
  `GUID-E3DD4E11-E47D-4ABA-8D6C-F61D2E16532F.htm` (LAYERDLGMODE), `GUID-9D0D75C7-3717-4358-9987-66B90DA1F093.htm`
  (LAYERCLOSE / CERRARCAPA), `GUID-DC3674C5-A4C7-4CF6-9148-9B124DF29B78.htm` (PROPERTIES / PROPIEDADES),
  `GUID-6F265AEA-496D-43B6-8643-D1528E8AF0E6.htm` (PROPERTIESCLOSE / CERPROP),
  `GUID-0AA644F1-1165-492F-A4D1-3EDA8598C644.htm` (paleta Propiedades), `GUID-893A3C0A-C735-49E4-878E-C8641DEAD618.htm`
  (acoplar), `GUID-B297EBD9-D68C-47E1-87CE-1B3798496599.htm` (Administrador de propiedades de capas),
  `GUID-28E52FA3-248E-4F65-94DD-7C47BE761D58.htm` (Set Current), `GUID-E3413A03-8EEF-44D5-B5C7-8B345A9257FE.htm`
  (Repetir colocación), `AutoCAD-DidYouKnow/files/GUID-94C065AB-FF9E-4752-B778-23D2FBB87E18.htm`
  (filtro de tipo, Ctrl+1), `AutoCAD-GettingStarted/files/GUID-0621F211-3587-4932-BB3D-4D92ECB58042.htm`
  (PR), la guía de atajos de Autodesk (CH, MO) y las páginas ESP con los mismos GUID

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
3. **Barra superior de §2.** Hecha.
   - El desplegable de capa mueve la selección.
   - Los de propiedades actúan sobre la selección hasta la fase 5.
   - La vista pasa a la esquina del lienzo y a la barra de navegación.
   - En el motor, si se quieren en el menú: `NEW`/`QNEW` y `SAVEAS`.
4. **Panel de paletas sin modo.**
   - El estado del panel vive en el motor, como hoy `stylesPanel` y `blocksPanel`, para que los
     comandos lo abran.
   - Comandos de §4, con sus filas en `autocad-coverage.md`.

- **4b. Sistema tipográfico y textos.** Hecha. Va antes de la 5 porque las fases 5 y 6 crean interfaz nueva
  (barra de estado, diálogo de Unidades, historial, menú contextual), que debe nacer con el sistema.
  Merece una sesión propia: primero se audita y después se decide.
  - **Punto de partida** (main @ f440332, `components/cad` y `components/ui`): tamaños `text-xs`
    ×38, `text-[11px]` ×28, `text-sm` ×11, `text-[10px]` ×5, con 10 y 11 px en 12 archivos; pesos
    `font-semibold` ×12, `font-medium` ×3, `font-normal` ×3; ningún `leading-*`;
    `muted-foreground` con cinco opacidades (sin opacidad, /40, /50, /60, /70); títulos de sección
    en `uppercase` + `tracking-wide` a 10 px (Propiedades, Estilos). La regla de §4 (mínimo 12 px
    salvo cifras) no se cumple.
  - **Auditoría.** Inventario medido en Chrome, no solo por clases: cada texto visible de las seis
    zonas, los menús, los tooltips, los popovers y las paletas, con su tamaño, peso, interlineado,
    color y fondo calculados, en `/draw`, `/es/draw` y `/ar/draw`. Agrupado por papel (título de
    sección, etiqueta, valor, valor tabular, ayuda, atajo, mensaje de la línea de comandos…) para
    ver dónde un mismo papel lleva estilos distintos.
  - **Sistema.**
    - Una escala corta de roles con nombre, cada uno con tamaño, peso, interlineado y color, como
      tokens en `globals.css` y reglas en `ui.instructions.md`.
    - Tres escalones de color de texto (principal, secundario, desactivado) en lugar de opacidades
      sueltas; contraste WCAG AA sobre cada superficie de §4.
    - Jerarquía y espaciado: el mismo ritmo vertical y la misma sangría en paletas, barras y menús.
    - Fuentes: Inter, Geist Mono y Readex Pro siguen salvo que la auditoría lo desaconseje; el
      monoespaciado, solo para lo que se teclea o se lee como cifra (línea de comandos,
      coordenadas, valores).
    - Árabe: el interlineado que necesita Readex Pro; sin mayúsculas ni espaciado de letras (ya
      resuelto en `globals.css`).
    - Un test que rechace `text-[Npx]` y las opacidades de texto fuera de los tokens, como el de
      clases lógicas (`i18n/logical-properties.test.ts`).
  - **Textos.** Revisión de `messages/en|es|ar.json` (`Editor.*`) y de lo que la interfaz lee de
    `cad/locales/`: terminología contra `docs/i18n-glossary.md` y los nombres de AutoCAD, uso de
    mayúsculas (los nombres de comando y de paleta como en AutoCAD; el resto, en frase), tono y
    puntuación de ayudas y tooltips, y nada truncado en español, el idioma más largo.
  - **Fidelidad.** Es presentación, así que puede diferir de AutoCAD (Segoe UI a 9 pt); lo que
    debe coincidir son las palabras: nombres de comandos, paletas, opciones y columnas.
  - **Resultado de la auditoría** (main @ f440332, Chrome, `getComputedStyle` sobre cada texto
    visible en 34 estados: las seis zonas, 9 menús, 5 popovers, 7 listas de desplegable, dos
    tooltips, las cuatro pestañas con y sin selección, la línea de comandos con sugerencias, la
    entrada dinámica y el menú de referencia en el cursor; `/draw`, `/es/draw` y `/ar/draw` a
    1280×720 y 1920×1080; 9 897 textos):
    - **Siete tamaños**: 10, 11, 12 y 14 px más los del ViewCube (sus letras de la brújula, a
      9,4 px). El 34 % de los textos está por debajo de 12 px sin ser cifra tabular.
    - **Un mismo papel, varios estilos.** Etiqueta: 11 px Geist Mono (filas de Propiedades,
      entrada dinámica), 11 px Inter (General) y 12 px Inter (Estilos, popovers). Título de
      sección: 10 px/600 en mayúsculas al 70 % (paletas), 11 px/600 en mayúsculas (popovers) y
      12 px/400 (encabezados de menú). Valor de desplegable: 12 px en la barra y el filtro, 11 px
      en la paleta; sus listas, igual. Elemento de menú: 14 px/20 frente a 11–12 px/16 de las
      listas. Botón con texto: 12/500, 12/400, 11/400 (referencias a objetos) y 14/500 mono («mm»).
      Valor editable: 12 px Inter (Estilos), 11 px mono (Propiedades) y 12 px mono (popovers).
      Atajo: 10 px mono en el tooltip, 12 px mono en los menús; la tecla de opción, 10/600.
      Historial de la línea de comandos: 11 px/13,75; su solicitud y su entrada, 12/16.
    - **Pesos** 400, 500 (botones y conmutadores) y 600 (títulos, sugerencias, teclas).
    - **Colores**: `foreground`, `muted-foreground` y sus fracciones /70 (títulos), /60
      (marcador de la línea de comandos), /50 (marcador de la entrada dinámica) y /40
      (referencias no disponibles), además de `active` y `destructive`.
    - **Contraste**: 738 textos activos bajo AA, de cuatro clases. El azul activo
      (`text-active` sobre `bg-active/15`) da 4,09–4,15 en pestañas, conmutadores y botones de
      los popovers; los títulos al 70 %, 4,05; el marcador de la línea de comandos, 3,33; el de la
      entrada dinámica, 2,69. Lo desactivado (opacidad 50 %) da 5,1.
    - **Recortes**: «Auto-saving…», «Guardando automáticamente…» y «جارٍ الحفظ التلقائي…»
      se truncan a 1280 en los tres idiomas; «PorCapa» se corta en el desplegable de color de
      Propiedades (120 px menos el botón de color). Los nombres largos de capa y las columnas del
      administrador, que se desplaza de lado, son datos y disposición, no recortes.
    - **Monoespaciado de más**: los nombres de las filas de Propiedades y las etiquetas de la
      entrada dinámica van en Geist Mono, y en `/ar/draw` caen en Readex Pro detrás de ella.
    - **Árabe**: a 12 px, Readex Pro llega a 14 px sobre la línea base y 6 por debajo con
      ل/ي/ج (unos 20 px de tinta), frente a la caja de 16 px que deja el interlineado actual: un
      texto que se trunca (`overflow: hidden`) corta los trazos.
    - **Ritmo**: las filas miden 18, 24, 28, 32 y 36 px según la paleta; la sangría, 8 o 12 px.
  - **Decisión.** AutoCAD trabaja a un solo cuerpo (9 pt), y la auditoría muestra que los
    tamaños distintos no marcaban jerarquía sino descuido; la jerarquía la dan el peso y el color.
    - Dos roles de tamaño: `text-ui` (12/400/16) y `text-title` (12/600/16); el monoespaciado es
      `text-ui` con `font-mono`, solo para lo que se teclea o se lee como cifra (línea de comandos,
      entrada dinámica, coordenadas, valores, alias y atajos). Nada a 11 px: ninguna cifra tabular
      lo necesitaba.
    - Tres escalones de color: `foreground`, `muted-foreground` (sube a L 0,75) y
      `faint-foreground` (nuevo, L 0,65); más `active-foreground` (el azul de los pinzamientos
      aclarado al 30 %) para el texto de lo activo y `destructive`. Todos ≥ 4,5 sobre `card`,
      `background`, `accent`, el lienzo y el azul activo.
    - Filas de 28 px en paletas, menús y listas; sangría de 12 px desde el borde de la superficie
      (`px-3`, o `p-1` + `ps-2` en un menú).
    - En árabe, 20 px de interlineado para los dos roles.
  - **Textos revisados** contra el glosario, que ya los tenía verificados en la ayuda de 2026:
    «New» de Capas es «New layer» / «Nueva capa» / «طبقة جديدة»; «Set as current», «Set current»;
    «Ortho», «Ortho mode»; «Varies», `*VARIES*` / `*VARIOS*` (en árabe sigue «متنوع»); la
    herramienta de `DIMSPACE`, «Adjust space» (era «Space»); «Document units», «Drawing units».
    «Colour» pasa a «Color», la grafía de AutoCAD, que las columnas ya usaban. El estado del
    autoguardado es «Saving…» / «Guardando…» / «جارٍ الحفظ…», porque la forma larga se truncaba
    en los tres idiomas. Los títulos de sección van en frase, ya no en mayúsculas. Se queda «Command
    line» / «Línea de comandos»: `COMMANDLINE` («LINEACOM») dice «Command window» («ventana de
    comandos»), pero es la zona, no un nombre de comando o de paleta.

5. **Barra de estado y línea de comandos.** Hecha.
   - La barra de estado y el diálogo de Unidades de dibujo.
   - La línea de una línea, el historial con F2 y Pantalla limpia.
   - LTSCALE como comando.

- **5b. Sistema de tamaños.** Hecha. Antes medían 32 × 32 los botones de la barra superior, 30 × 28
  los de la paleta y 28 × 24 los de la barra de estado; había siete tamaños de botón de icono y cuatro
  alturas de control. Criterios:
  - accesibilidad: WCAG 2.2, 2.5.8 AA (24 × 24);
  - comodidad: con la ley de Fitts, 32 frente a 28 ahorra un 5 % en un recorrido de 400 px con ratón;
  - densidad: a 32 la paleta necesitaría unos 650 px de los 619 libres a 720, y la barra superior
    perdería margen a 1280 en español;
  - coherencia: 28 ya era la fila de la 4b.

  Resultado: 28 para todo control, 36 para las barras de controles (el control y 4 px a cada lado) y
  una fila de 28 para la línea de comandos. La paleta pasa de 76 a 67 px: una rejilla de 58 (28 + 2 + 28) con 4 px de relleno y su borde.
  Cada zona mide su contenido y deja el borde fuera; un borde dentro de la caja dejaba los botones
  en medio píxel (la rejilla medía 59 y las columnas 28,5). Las partes de texto de una barra
  (conmutadores, estado del guardado, Unidades) tienen ancho entero. Fuera del sistema: el
  ViewCube (24, a su escala) y la etiqueta `[Superior]`.

- **5c. Propiedades actuales.** CECOLOR, CELTYPE y CELWEIGHT, la pieza más cara, en su propia fase
  entre la 5b y la 6:
  - en el documento y en el formato de archivo, con su versión;
  - en cada herramienta que crea entidades;
  - en los desplegables de color, grosor y tipo de línea de la barra superior y en General de
    Propiedades, cuando no hay selección.
  - Hasta entonces sigue la regla de `ui.instructions.md`: sin selección, esos desplegables
    muestran PorCapa desactivado.

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
- Tipografía (fase 4b): ningún texto de interfaz por debajo de 12 px salvo cifras tabulares (11 px),
  cada texto con un rol de la escala, contraste AA en todas las combinaciones de texto y fondo, y 0
  textos truncados en los tres idiomas a 1280×720. Medido al cerrar la 4b sobre los mismos 9 897
  textos de la auditoría: 0 por debajo de 12 px, 0 fuera de un rol y de un escalón de color, 0
  bajo 4,5:1 (lo desactivado incluido), 0 truncados y 0 partidos en dos líneas a 1280×720. Las
  únicas excepciones son los nombres de las caras del ViewCube, dibujados a la escala de la cara
  (12 px o más en la vista en planta), y los nombres largos de capa, que son datos.
- Fase 5, medido al cerrarla (Chrome, `/draw`, `/es/draw` y `/ar/draw`):
  - Zonas en 7 tamaños × 3 idiomas: barra superior 40, `command` 28 y `status` 28; 0 solapes, 0
    casillas ocultas y nada sobre el lienzo salvo lo permitido. A 1920×1080 el lienzo gana 64 px
    de alto (984 frente a 920).
  - Primer pintado con los bundles bloqueados y transición desde la landing: la caja del lienzo es
    la final en todos los casos, también con el panel recordado al revés y con 400 px de ancho.
  - ZOOM E sin nada tapado; solo las cuatro notas del ViewCube en `/ar/draw` (es la superposición de
    AutoCAD).
  - Interacción, en los tres idiomas:
    - el ID deja 2 líneas temporales, que a los 6 s están a opacidad 0;
    - F2 despliega 196 px (12 líneas), al final del desplazamiento, y se pliega con F2, la flecha o
      Esc;
    - Ctrl+9 devuelve 28 px al lienzo, también desde la línea de comandos;
    - Ctrl+0 deja el lienzo a todo el ancho y conserva Deshacer, y LAYER vuelve a mostrar el panel;
    - Ctrl+1 abre Propiedades;
    - el clic derecho abre el menú de referencias, que sigue abierto al marcar una;
    - Polar lista 9 ángulos con 60, y elegir uno lo activa;
    - la flecha mide 14 × 24 px;
    - ocultar las coordenadas se recuerda al recargar;
    - Unidades, el menú y UN abren el diálogo, donde las teclas no llegan a la línea de comandos;
    - Aceptar aplica 0.0000 y metros, devuelve el foco al lienzo y Ctrl+Z lo deshace.
  - Tipografía: 10 025 textos en 40 estados, con los menús de la barra, el popover de forzcursor,
    Personalización, el diálogo y sus dos listas, las líneas temporales, el historial y Pantalla
    limpia. Los cinco objetivos dan 0. Las líneas temporales captadas a mitad de su desvanecido
    (54, en otros estados) no se miden contra AA, porque son una transición; a opacidad plena, sí.
- Fase 5b, medido al cerrarla:
  - Inventario de cada botón, desplegable, campo y pestaña por zona, en Chrome:
    - botones de icono de 28 × 28 en todas las zonas;
    - controles de texto de 28 de alto;
    - flechas de 14 × 28 y 28 × 14.
    - Fuera de la escala, solo el ViewCube (24), `[Superior]` (20) y el selector de color nativo
      (26, dentro de su recuadro de 28).
  - Zonas, por su contenido: barra superior 36, rejilla de la paleta 58, `command` 28 y `status` 36,
    cada una con su borde fuera. A 1280×720 la paleta usa 576 px de los 609 libres. A 1920×1080 el
    lienzo mide 1572 × 977.
  - Todos los botones de icono de las cinco zonas empiezan en un píxel entero (`/draw`,
    `/es/draw`, `/ar/draw`). Solo queda en fracciones el texto: pestañas, `[Superior]`, el menú SCU
    del cubo y el campo de la línea de comandos.
  - `phase4.mjs` sin fallos en 7 tamaños × 3 idiomas: 0 solapes, 0 casillas ocultas, barra superior
    a 1280 en español con la capa de 50 caracteres, primer pintado, plegado y ZOOM E. Solo quedan las
    cuatro notas del ViewCube en `/ar/draw`.
  - Transición, ViewCube, menú de la aplicación y `phase5.mjs` sin fallos.
  - Tipografía: 10 029 textos en 40 estados, 0 en los cinco objetivos.

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
