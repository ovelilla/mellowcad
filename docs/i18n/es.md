# Spanish (`es`)

> **Command language:** `localized`, Spanish AutoCAD's. **Status:** `live` since 27/09/2026.
> **Review:** every word is Autodesk's own; what no source settled yet is marked **partial**,
> **no**, **†** or **unverified** below.

The Spanish words are Autodesk's own Spanish localization of AutoCAD, never a translation of ours:
someone who works in Spanish AutoCAD must find the words they already know.

## Sources

Autodesk's Spanish help uses the same GUIDs as the English one. `C` below is
`https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/GUID-<id>.htm`; `GS`, `DYK`, `CU`
and `MAC` are the same URL with `AutoCAD-GettingStarted`, `AutoCAD-DidYouKnow`,
`AutoCAD-Customization` or `AutoCAD-MAC-Core` in place of `AutoCAD-Core`.

For the command line the best source is the product's own string table: Autodesk's public AutoCAD
2027 Spanish language pack (`Autodesk_AutoCAD_2027_Spanish_Language_Pack.exe`, linked from the
forum thread "2027 Product download links") holds `es-ES/acadres.dll`, which 7-Zip extracts without
running anything. It is also the language installed with the owner's AutoCAD, so its console,
desktop and tables answer in Spanish (skill `autocad-research`).

## Interface terms

| Area | English | Spanish | Source | Verified |
| --- | --- | --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Intersection, Apparent intersection | Punto final, Punto medio, Centro, Intersección, Intersección ficticia | C 50383F73-4F23-4F70-B4FC-52D5748D80AF | yes |
|  | Perpendicular, Tangent, Insertion, Extension, Parallel, Quadrant, Nearest | Perpendicular, Tangente, Inserción, Extensión, Paralelo, Cuadrante, Cercano | same | yes |
|  | None | Ninguno | C CF5780AD-D1AB-4526-9608-83D7952749E7 | partial |
|  | From (snap menu) | Desde | C A2F8FFFB-EEC4-40A5-AFA5-A44C41E281E5 | yes |
|  | Point Filters (snap menu) | Filtros para puntos | es-es acad.cuix, `ACAD_1863`; desktop filters/d03 | yes |
| Status bar | Object snap | Referencia a objetos | C ACAA0279-047D-458E-889F-60BBFDD40489 | yes |
|  | Object snap tracking, Polar tracking | Rastreo de referencia a objetos, Rastreo polar | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB | yes |
|  | Ortho mode, Grid | Modo Orto, Rejilla | same | yes |
|  | Snap mode | Modo Forzcursor | C 8AA3D979-2636-4C9D-BEFF-528E572B8FF4 | yes |
|  | Show lineweight | Mostrar grosor de línea | C DB74CB64-2083-4285-92B9-653DEBAFEDDE | yes |
|  | Selection cycling; its list box, its None | Ciclo de selección; cuadro de lista Selección, su Ninguna (desktop erase/d12) | C 6BD7F1F7-477E-43C4-B6AE-680F5FE6CB0D, C BD08721C-A2BB-472E-B706-B3E6DC8FCEC7 | yes |
|  | Dynamic input | Entrada dinámica | C C5381B8D-FAE1-437D-BC08-6D279073A61C | yes |
|  | Coordinates; Model space, its label MODEL; Customization | Coordenadas; Espacio modelo, MODELO; Personalización | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB, C 5FD72B72-1FFF-44BF-97B3-938552FD6C51 | yes |
|  | Units; Clean screen | Unidades; Limpiar pantalla | C F780BFA4-F711-43CB-A9B9-9D08683FA2CF, C 8FBF7BAA-4A34-4171-A7B5-A6E28B8EC4CE | yes |
| Drawing units | Drawing Units; Length, Type, Precision, Decimal; Insertion scale; Sample output | Unidades de dibujo; Longitud, Tipo, Precisión, Decimales; Escala de inserción; Muestra de salida | C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
|  | Millimeters, Centimeters, Meters | Milímetros, Centímetros, Metros | C A58A87BB-482B-4042-A00A-EEF55A2B4FD8 | yes |
|  | OK, Cancel | Aceptar, Cancelar | C 410E4A05-F789-4416-9D63-3D24A46DD740 ("Haga clic en Aceptar") | partial (Cancelar no) |
| Ribbon | Home; Draw, Modify, Annotation panels; the ribbon | Inicio; Dibujo, Modificar, Anotación; la cinta de opciones | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc | Línea, Polilínea, Círculo, Arco, Elipse, Arco elíptico | C 57CDDB6C-B12B-46CE-B9C5-22EFC17258FF, C A3E54913-3813-407D-9283-19EC6610D4F3 | yes |
|  | Center, Radius · Center, Diameter · 2-Point · 3-Point | Centro, Radio · Centro, Diámetro · 2 puntos · 3 puntos | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
|  | Start, Center, End · Center, Start, End | Inicio, Centro, Fin · Centro, Inicio, Fin | C C78378FD-4704-4D0A-9D86-82FCBB118097 | yes |
|  | Rectangle, Polygon, Hatch | Rectángulo, Polígono, Sombreado | C 377C261F-EEF1-4438-A80D-6760CAE37B81 | yes |
|  | Spline, Spline Fit, Spline CV | Spline, Ajuste de spline, VC de spline | the ribbon's tooltips, acad.cuix (Home > Draw) | yes |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale | Desplazar, Copiar, Estirar, Girar, Simetría, Escala | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E | yes |
|  | Offset, Trim, Extend, Fillet, Chamfer | Desfase, Recortar, Alargar, Empalme, Chaflán | same, C 696681C1-4B8B-4995-8903-CCE6686179EA | yes |
|  | Explode, Join, Break, Break at point | Descomponer, Juntar, Partir, Partir en punto | C 4DC59885-3B10-4CEE-854B-4B5ADCD1A4EF, MAC D175DCD2-2050-4DA9-9965-1E94462718CA | yes (Partir en punto partial) |
|  | Match properties | Igualar propiedades | C F1EB0CCC-49E4-4798-A12E-709795CAD1C2 | yes |
|  | Array; Rectangular, Polar, Path array | Matriz; Matriz rectangular, Matriz polar, Matriz de camino | C 181BF535-D6F4-4B90-B04D-EB99C5488DAB; Matriz: the command's Spanish name, MATRIZ (console arrays/p103) | yes (Matriz partial) |
| Annotate | Single line text, Edit | Texto en una línea, Editar | C 8739509C-15A7-4582-BF7C-3D83ED2A23B5 | yes |
|  | Linear, Aligned, Angular, Radius, Diameter, Baseline, Continue, Adjust space | Lineal, Alineada, Angular, Radio, Diámetro, Línea base, Continuar, Ajustar espacio | C DEB94C8F-064F-4E44-AB7A-D157DA166581, C 7CE4EF2B-93C6-423A-9401-664F3FE0829A | yes (Alineada… partial) |
| Block | Create block, Insert, Purge | Crear bloque, Insertar, Limpiar | C 7625417C-BFA4-4BEB-8A19-109778AA1E30, C D68BA47B-A79D-4F58-9715-0569CC24BCEF | yes |
|  | Define attributes, Edit attributes | Definir atributos, Editar atributos | C 19B6B720-B40B-42B6-A521-888C1A383F34, C AB03D5EE-6B27-492A-8147-671D0F536CB5 | yes |
|  | Attribute display; Attribute definition | Visualización de atributos; Definición de atributo | C BCFF32DB-6860-4812-BEF1-3BB658126B26 (ATRVIS "controla las modificaciones de visibilidad") | partial |
| View | Zoom, Pan; Window, Previous, Extents | Zoom, Encuadre; Ventana, Previo, Extensión | C 66E7DB72-B2A7-4166-9970-9E19CC06F739 | yes |
| Inquiry | Measure, Area | Medir, Área | C 4C31CB59-338C-4812-991D-29414329611E | yes |
| Edit | Undo, Redo, Erase | Deshacer, Rehacer, Borrar | C BC96A2AA-2AEE-47C0-B1F2-85F8B60663D6 | yes |
| Clipboard | Copy, Cut, Paste, Copy with base point | Copiar, Cortar, Pegar, Copiar con punto base | C 345B759D-D758-488A-9E85-542A30A901C4, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Selection | Window, Crossing | Ventana, Captura | C 50383F73-4F23-4F70-B4FC-52D5748D80AF | partial |
| Properties | General, Geometry | General, Geometría | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
|  | Color, Layer, Linetype, Lineweight, Dim style | Color, Capa, Tipo de línea, Grosor de línea, Estilo de cota | C 99AFB412-CEE2-4C12-B7AD-E11E9389BBF9 | yes |
|  | ByLayer, ByBlock | PorCapa, PorBloque | same | yes |
|  | \*VARIES\* | \*VARIOS\* | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
|  | Start X, End X, Closed, Vertex X, Current Vertex | Inicio X, Fin X, Cerrado, Vértice X, Vértice actual | same | partial |
|  | Center X | Centro X | autodesk.com/es/support, "Centro X y Centro Y dentro de la vista aparecen atenuados en AutoCAD" (the View rows) | partial |
|  | Height, Rotation, Scale, Pattern | Altura, Rotación, Escala, Patrón | C AAD65B06-E480-49EA-B97D-57DDEA36783C | yes |
|  | Justify; Middle center | Justificar; Medio centro | C D1C664DD-63D9-467E-8EC1-2F5A1777A924 | partial |
|  | Measurement, Text override | Medidas, Modificar texto | a-cad-emia.blogspot.com/2013/10/acotacion20.html (AutoCAD 2013) | partial |
|  | Rotated, Aligned, Radial, Diametric, Angular Dimension; Lines & Arrows, Fit, Primary Units; Arrow size, Center mark size, Ext line ext, Ext line offset, Text offset, Text position X, Text rotation, Dim scale overall, Decimal separator, Suppress trailing zeros, Precision (a dimension's) | Cota girada, Cota alineada, Cota radial, Cota diametral, Cota angular; Líneas y flechas, Ajustar, Unidades principales; Tamaño de flecha, Tamaño de marca de centro, Ampliación de línea de ref., Desfase de línea de ref., Desfase de texto, Posición X de texto, Rotación de texto, Escala global de cota, Separador decimal, Suprimir ceros finales, Precisión | the English desktop dimensions/d04 | no |
|  | Invisible, Constant, Verify, Preset, Lock position | Invisible, Constante, Verificable, Predefinido, Bloquear posición | C 5C99524B-B5BB-4067-AE18-BD3575F29DBF | yes |
|  | Attributes; Tag, Prompt, Value; Misc | Atributos; Identificador, Solicitud, Valor; Varios | same ("identificador de atributo", "solicitud de atributo") | partial (Varios no) |
|  | Delta X, Length, Angle (a line's Geometry) | Incremento X, Longitud, Ángulo | desktop line/d16 | yes |
|  | Radius, Diameter, Circumference, Area, Start/End angle, Major/Minor radius, Contents | Radio, Diámetro, Circunferencia, Área, Ángulo inicial/final, Radio mayor/menor, Contenido | — | no |
|  | Radius ratio, Major axis vector X, Minor axis vector X (an ellipse's Geometry) | Relación del radio, Vector de radio mayor X, Vector de eje menor X | desktop ellipse/d08 (the vectors' labels cut off after `may…` and `menor…`; the English unseen) | partial |
|  | Data Points; Number of fit points, Current Fit point, Fit point X; Number of control points, Current Control point, Control point X, Weight; CV frame; Show, Hide (a spline's) | Puntos auxiliares; Número de puntos de ajuste, Punto de ajuste actual, Punto de ajuste X; Número de puntos de apoyo, Punto de apoyo actual, Punto de apoyo X, Peso; Marco de vértices de control; Mostrar, Ocultar | desktop spline/d10 (labels cut there: the full Spanish and the English from `ax26res.dll` by id, 69–74, 912, 913) | partial (CV frame's id) |
|  | Method, Degree, Periodic, Planar, Start / End tangent vector X, Fit tolerance; Fit, Control Vertices; Chord, SqrtChord, Uniform, Custom (a spline's Misc and values) | Método, Grado, Periódica, Plana, Inicio vector de tangente X / Vector de tangente final X, Ajustar tolerancia; Ajustar, Vértices de control; Cuerda, RaízcuadradaCuerda, Uniforme, Personalizado | desktop spline/d10, spline-knots/d02; `ax26res.dll` 75, 76, 96, 99, 911, 914–916 | partial (RaízcuadradaCuerda the table's only) |
|  | Total angle, Arc length (an arc's Geometry) | Ángulo total, Longitud de arco | the console's `ángulo total` (table 20981), DIMARC's `longitud de arco` (AcDimRes 5345) | no |
|  | Type, Predefined, Pattern name, Annotative, Origin X, Associative, Island detection style, Outer; Cumulative Area (a hatch's) | Tipo, Predefinido, Nombre de patrón, Anotativo, Origen X, Asociativo, Estilo de detección de islas, Exterior; Área acumulativa | Predefinido: table 20087; Anotativo, Asociativo, estilo de detección de islas, Exterior: C B3FF6503-8FFB-4F1A-A603-52A6408F0D66, C 410ECEBF-7CC2-4000-A45E-18F1F6BEE423 (Nombre de patrón); the English desktop hatch/d05-1 | partial (Origen X, Área acumulativa no) |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White | Rojo, Amarillo, Verde, Cián, Azul, Magenta, Blanco | C 14BC039D-238D-4D9E-921B-F4015F96CB54 | yes |
| Layers | Layer Properties Manager; New layer, Set current, Delete layer, Current layer | Administrador de propiedades de capas; Nueva capa, Definir actual, Suprimir capa, Capa actual | C B297EBD9-D68C-47E1-87CE-1B3798496599 | yes |
|  | Layer - Not Deleted, Layer - Current Layer Off, Layer - Name Already Exists, Layer - Rename (the manager's task dialogs) | Capa - Sin suprimir, Capa - Capa actual desactivada, Capa - El nombre ya existe, Capa - Cambiar nombre | `AcTaskDialogs.resources.dll`, `AcLayer.resources.dll` (2027, en-US and es-ES) | yes; partial (`Capa` for `%ObjectName%`) |
| Dimension styles | Lines, Symbols and arrows, Text, Fit, Primary units | Líneas, Símbolos y flechas, Texto, Ajustar, Unidades principales | C 60840416-5E03-4CCC-ACEE-1E92D078BDB5 | yes |
|  | Baseline spacing, Extend beyond dim lines, Offset from origin | Intervalo de línea base, Ampliar líneas de cota, Desfase desde origen | C 8EA3CEFF-F842-4EFD-B7D8-3D9BA6AFBBCF | yes |
|  | Arrow size, Center marks | Tamaño de flecha, Marcas de centro | C E063AF30-6F14-42D6-B0AB-0CF5C47B5897 | yes |
|  | Text height, Offset from dim line | Altura de texto, Desfase de línea cota | C 38DAEEF0-AB44-4C58-8D0E-955BFCFF71A7 | yes (the second partial) |
|  | Use overall scale of; Precision | Usar escala general; Precisión | C 17FAE4A5-34C7-4D87-BFC5-E3791C083E73, C 2D1177AB-3130-4522-A631-AA28493529DC | yes |
|  | Decimal separator: ',' (Comma), '.' (Period), ' ' (Space); Suppress trailing zeros | Separador decimal: ',' (Coma), '.' (Punto), ' ' (Espacio); Suprimir ceros finales | — | no |
|  | Draw dim line between ext lines (the Fit tab's DIMTOFL) | Dibujar línea de cota entre líneas de referencia | — (the Spanish -DIMSTYLE's `Forzar línea dentro de las líneas de referencia`, dimensions/p06, names the variable, not the box) | no |
| Text styles | Height, Set current, New, Delete | Altura, Definir actual, Nuevo, Suprimir | C 1ED81E98-6463-4574-875F-183C8280C4AC | yes |
| Blocks palette | Current drawing, Filter | Dibujo actual, Filtro | C E3413A03-8EEF-44D5-B5C7-8B345A9257FE | yes |
| Drawing aids | Linetype scale (global scale factor), Drawing units, Precision | Factor de escala global, Unidades de dibujo, Precisión | C 47B3793A-37BF-45FC-94CB-670433ADD366, C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
| Keys | Enter, Esc, Del, Ctrl, Shift, Tab, Spacebar | Intro, Esc, Supr, Ctrl, Mayús, Tab, barra espaciadora | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Command line | Type a command | Escriba un comando | DYK 363A3BFA-CAF2-469E-9F35-0BF64139811C | yes |
|  | Command history | Historial de comandos | C 06F6A6E9-C355-43F5-8706-49F0E5E552BF ("historial de comandos ampliado") | partial |
| Shortcut menu | Shortcut menu; Repeat ‹command›, Enter, Cancel | Menú contextual; Repetir ‹comando›, Intro, Cancelar | C D4A2C069-3AAD-492D-84C2-4134C7031B2F, C 7C6AE349-DDF0-40DF-9D1E-FA9702BE88BB ("Repetir último comando"), C 945C8F74-064C-4EA6-99E1-232E6003CE27 ("seleccione Intro") | yes (Cancelar partial: «Cancelar el comando actual») |
|  | Clipboard; Osnap Overrides; Properties | Portapapeles; Modificaciones de REFENT; Propiedades | C D4A2C069-3AAD-492D-84C2-4134C7031B2F, DYK 18389CD1-2F81-4185-A459-F59AE311D637; Osnap Overrides acad.cuix's CMCOMMAND (ACAD_2602); Modificaciones de REFENT the 2027 desktop's Command menu (probe line/d07: the help's "submenú Modificaciones de referencias", C 8F5E5431-9EFB-414E-BC6D-2C65EFB2DAC3, is not what it shows) | yes |
|  | Dimension Style (the Edit menu over dimensions) | Estilo de cota | the English desktop dimensions/d07-1; the Spanish the palette's Dim style row | partial |
|  | Copy Selection, Deselect All; Copy with Base Point (Clipboard ▸) | Copiar selección, Anular selección; Copiar con punto base | acad.cuix's CMEDIT (PM_0007) and Clipboard ▸ (PM_0114), en-US and es-ES | yes |
| View | Top, Bottom, Front, Back, Left, Right (view menu, -VIEW) | Superior, Inferior, Frontal, Posterior, Izquierda, Derecha | DYK C0EBD080-D074-4AD5-A508-51F208827E97, C 69482C47-5BF4-4AEE-9AB8-3904F4300C20 | partial (Superior yes) |
|  | SW / SE / NE / NW Isometric | Isométrica SO / SE / NE / NO | same (Isométrica SE) | partial |
|  | Custom View | Vista personalizada | DYK C0EBD080-D074-4AD5-A508-51F208827E97 shows only `[Personalizada]` | no |
|  | Orbit; 3D Orbit | Órbita; Órbita 3D | C 85CE824C-0AF4-4890-8487-ADBC92BF08F1 | partial; yes |
|  | Plan view, View point, Preset views, UCS icon, Elevation (tool names) | Vista en planta, Punto de vista, Vistas predefinidas, Icono SCP, Elevación | — | no |
| ViewCube | ViewCube; Home; Parallel; Set Current View as Home | ViewCube; Inicio; Paralelo; Definir vista actual como inicio | C E6D3896C-AF39-4F5C-A57C-CACE2A1117F9, C 3CE31F02-64A5-4BB8-9461-4C4F659C63B7 | yes |
|  | TOP, FRONT, LEFT; BOTTOM, BACK, RIGHT (faces); N, E, S, W | SUPERIOR, FRONTAL, IZQUIERDA; INFERIOR, POSTERIOR, DERECHA; N, E, S, O | the help's captures of the cube | yes; no (the second three) |
|  | Rotate clockwise / counterclockwise; View the face above… | Girar en sentido horario / antihorario; Ver la cara de arriba… | C A90F5F1C-B338-4BDE-9D05-F26BFFE3B3A5 (prose: «en el sentido de las agujas del reloj o en el sentido inverso») | no |
| UCS menu | WCS; New UCS; Unnamed | SCU; Nuevo SCP; S-nombre | C 00815EB6-B218-410D-AF53-A5241BB53AA0; S-nombre the 2027 desktop's menu (probe ucs/e01-8) | yes |
| Open source | Open source; the code; MIT licence | Código abierto; el código; licencia MIT | the landing's own words, no AutoCAD term (`.claude/rules/i18n.md`, «Claims and copy») | — |
| Docs | Docs; Documentation; Build with MellowCAD; API reference; Not published yet | Documentación; Construir con MellowCAD; Referencia de la API; Aún no publicado | the site's own words, no AutoCAD term; «Build» is written in English only (`.claude/rules/docs.md`) | — |
| Search | 2D CAD online, free, no sign-up, AutoCAD commands, aliases | CAD 2D online, gratis, sin registro, comandos de AutoCAD, alias | Spanish Google autocomplete and ranking titles, 27/09/2026 (see Search texts, below) | yes |

## Register

- **Landing:** tú, short sentences, the English tone («Escribe L. Pulsa Intro. Dibuja.»).
- **Editor:** Autodesk's register — labels as infinitives and nouns («Guardar dibujo», «Definir
  actual»), sentences in usted («Escriba un comando»).
- **Neutral Spanish:** no vosotros or voseo; «equipo» or «dispositivo», «archivo», «ratón» (as
  Autodesk's help writes it); «» in prose, em dashes attached to the aside.

## Search texts

- **Spanish** (Google's suggestions in Spain, Mexico, Argentina, Colombia and Chile, and the titles
  ranking there, 27/09/2026; no volumes, Trends could not be read): «gratis» goes with every query
  («cad online gratis», «cad 2d online gratis»); «CAD online» is said so, not «en línea», which
  finds file viewers; «sin registro» is how _no sign-up_ is said; «comandos de AutoCAD» is common.
  Never «AutoCAD online gratis», which would read as if this were AutoCAD. Title: «CAD 2D online
  gratis con comandos de AutoCAD — MellowCAD» (56); description: «CAD 2D gratis en tu navegador con
  los comandos, alias y referencias a objetos de AutoCAD. Sin instalación ni registro; tus dibujos
  no salen de tu equipo.» (153). The lead carries the terms the H1 lacks.

## Command language

`/es/draw` speaks Spanish AutoCAD 2026's command language, as its language pack does: Spanish
command
names and aliases, prompts and keywords, with `_` plus the global name or keyword in every language
(`_LINE`, `_C`). Each command's entry carries its Spanish name after `· es`. Sources and the
state of each piece (`cad/locales/es.json`; each GUID resolves as "Sources",
above, explains):

- **Names:** every one from the title of Autodesk's 2026 Spanish help page with the English page's
  GUID — verified. `DIMANGULAR` is ACOANGULAR, ACOANG its alias: AutoCAD 2027's console answers
  ACOANGULO, which older transcripts gave, as an unknown command (dimensions/p334, p363). Our own
  commands take the Spanish base name and the initials of their Spanish construction: `CIRCULOD`,
  `CIRCULO2P`, `CIRCULO3P`, `ARCOICF` (Inicio, Centro, Fin), `ARCOCIF`, `ELIPSEC`, `ELIPSEARCO`.
  Rows without their own line: `UNDO` `DESHACER`, `U` → `H` (a command of its own in Spanish, "equivale a
  deshacer 1"), `REDO` `REHACER`, `SNAP` `FORZCURSOR` / `FC`†, `FROM` `DESDE`,
  `BLOCKSPALETTE` `PALETABLOQUES`.
- **Workspace:** `UNIDADES`, `ESCALATL`, `LIMPIAPANTACT` and `LIMPIAPANTDES` from the Spanish pages
  with the English GUIDs (1DAE2080, 47B3793A, 1D51E778, 7C9CDCC6); the dialog's
  `Unidades de dibujo`, `Longitud`, `Tipo`, `Precisión`, `Decimales`, `Escala de inserción`,
  `Muestra de salida` and INSUNITS' `Milímetros`, `Centímetros`, `Metros` from 75419F91 and
  A58A87BB, the status bar's `Limpiar pantalla`, `Personalización`, `Espacio modelo` and
  `MODELO` from E3B34B0A and 5FD72B72.
  `UNS` and `DDUNITS` are the 2027 `acad.pgp`'s (:284, :513); `EC`† comes from a transcription of
  the Spanish `acad.pgp` (datech.es), as no 2026 source lists it; ESCALATL's prompt is
  **unverified**.
- **Palettes:** `CAPA` / `CA`, `CERRARCAPA`, `PROPIEDADES` / `PR` and `CERPROP` from the Spanish
  pages with the English GUIDs (9123091A, 9D0D75C7, DC3674C5, 6F265AEA) and the 2026 Spanish
  getting-started pages (`CAPA o CA`, `escriba PR`); the manager's `Estado`, `Nombre`, `Act`,
  `Bloquear`, `Color`, `Tipo de línea`, `Grosor de línea` and `Definir actual` from its reference
  page
  (B297EBD9), the drop-down's `Todo` from the predefined filter of the same name. `CH` and `MO`
  stay English: the Spanish file gives `CH` to CHAFLAN.
- **Attributes:** `ATRDEF`, `-ATRDEF`, `ATREDIT`, `EDITATR` and `ATRVIS` from the Spanish pages with
  the English GUIDs, as are the keywords Invisible, Constante, Verificable, Predefinido and Bloquear
  posición. The aliases `AT`, `-AT`, `ATR` and `DDATTE` are the 2027 `acad.pgp`'s (`-ATR` is
  -ATREDIT's, not built). -ATRDEF's prompts, the modes line with `S`/`N` and its two spaces,
  INSERT's `Indique valores de atributo` and ATRVIS's `[Normal/ACT/DES] <Normal>` are 2027's console's
  (blocks/p03, p311, p335); ATREDIT's and EDITATR's question and refusals are atteditRes.dll's and
  AcEAtteditRes.dll's (es-ES). **Unverified:** the Edit Attribute Definition labels.
- **3DPOLY:** `3DPOL` and `3P` from the 2027 `acad.pgp`; its prompts, `[Cerrar/desHacer]`, `Ya se
  han deshecho todos los segmentos.` and the other commands' words of a 3D polyline (`polilínea
  3D`) from 2027's console (3dpoly/p01–p29.es) and tables 20170, 20288, 20635 and 25596; the
  palette's `Polilínea 3D`, `Vértice Z`, `Ajustar/Suavizar` and `Ninguna` from the Spanish desktop
  (3dpoly/d03); TRIM's, EXTEND's and JOIN's words of one from 2027's console (3dpoly/p30–p78.es)
  and tables 1127, 46864 and 20624, `segmentos unidos en2 polilíneas 3D` as table 295 and the
  console print it, its space missing. **Unverified:** CHAMFER's refusal, composed from table 20635.
- **SPLINE:** the name from the Spanish page with the English GUID (`SPLINE`; SPLINEDIT is
  `EDITSPLINE`); `SPL`, the keywords `Método`, `Nudos`, `Grado`, `Ajustar`, `VC`,
  `iniciar Tangencia`,
  `finalizar Tangencia`, `Cerrar`, `desHacer` and the prompts `Precise tangente inicial`,
  `Precise tangente final` and `Indique grado de spline` from aCADemia's 2011 captures of the
  Spanish
  product; every prompt, keyword capital (`[Cuerda/raíz cuaDrada/Uniforme]`), refusal and the
  settings line are 2027's console's (spline/p01.es, p02.es, p108, p111.es, p113.es, p125.es,
  p155.es), which asks no `Precise tangente` at the closure (p124.es); Object's `Objeto`, `Designe
  polilínea de ajuste de spline` and `No se ha encontrado ninguno.` (spline/p114.es, pedit/p178.es),
  not EXPLODE's `No hallada.`. The rail's
  `Ajuste de spline` and `VC de spline` are the ribbon's tooltips (acad.cuix). **Unverified:** the
  palette's `Parametrización de nudos`.
- **SPLINEDIT:** `EDITSPLINE` (table 52827) and `SPE` from the 2027 Spanish `acad.pgp`; every
  prompt, keyword and message from 2027's console (spline-knots/k57–k146.es), whose `initget`
  spells some words per prompt (`añaDIr` and `dEsplazar` at Fit data, `Añadir` and `Desplazar` at
  Edit vertex, `Polilínea` at a closed spline's first prompt, eXit's hidden `SA` or `S`).
  **Unverified:** the rail's `Editar spline`.
- **PEDIT:** `EDITPOL` and `PE` from the 2027 Spanish `acad.pgp`; every prompt, keyword and
  message from 2027's console (pedit/p01–p146.es), whose `initget` spells Join `Juntar` at a 2D
  polyline's prompt and `Unir` at a 3D one's, eXit `Salir` at Edit vertex and the hidden `SAlir`
  beside `SA` at the first prompt, and the default of Next `<U>`; Fit `curVar`, Decurve
  `anularcuRVatura` and its hidden twin `ELiminarcurva`, a 3D polyline's `Spline` listed `curva
  Spline` (p51.es, p55.es, p198.es). **Deviation:** Multiple's prompts list Spline `SPline` and a 3D
  polyline's `curvaB`, and declare `Eliminarcurva` (p196.es, p197.es): here as the single prompts
  spell them, a keyword's label being one per command. **Unverified:** the rail's `Editar
  polilínea`, Jointype's default `<Ambos>`.
- **UCS:** `SCP` and `SIMBSCP` from the Spanish pages with the English GUIDs, as is `PLANTA`;
  the keywords `gUArdado`, `oBjeto`, `PRev`, `Vista`, `Univ`, `X`, `Y`, `Z`, `ejEZ`, `Objeto`,
  `Rest`,
  `Guardar`, `Supr`, the
  prompts `Indique origen de SCP`, `Precise punto en eje X o <Aceptar>`, `Precise punto en plano XY
o <Aceptar>`, the Named ones and `Nombre de scp actual: *UNIVERSAL*` from aCADemia's 2014 captures
  of the Spanish product, as are ejEZ's `Precise nuevo punto de origen` and `Precise punto en parte
positiva del eje Z` and Y's `Precise ángulo de rotación sobre eje Y`; `ACT/DES/Sin
origen/Origen` from the 2026 help and the same captures;
  PLANTA's `[scp Actual/SCP/Universal]` and `Indique nombre de SCP o [?]` from aCADemia's 2014
  capture ("Entorno de trabajo en 3D", 1.ª parte), whose Universal differs from SCP's Univ.
  AutoCAD 2027's Spanish console settles `Precise ángulo de rotación sobre eje X` and `…eje Z`
  (ucs/p124, p125), `*SIN NOMBRE*` in the prompt line, the `?` listing and Restore's
  `No se puede encontrar SCP "NOMBRE".`, PLANTA's words (ucs/p231, p234, p243, p253). Neither
  language's `acad.pgp` has an alias for UCS.
- **Views:** `PTOVISTA`, `-PTOVISTA`, `VISTA`, `-VISTA` and `3DORBITA` from the Spanish pages with
  the English GUIDs. From aCADemia's 2014 captures of the Spanish product ("Entorno de trabajo en
  3D", 1.ª parte; "Coordenadas", 9.ª parte), which beat the help where they differ: -PTOVISTA's
  `Dirección de vista actual:  VIEWDIR=…`, `Precise un punto de vista o [Rotación]` (the help says
  Girar), `Ángulo a partir del eje X en el plano XY`, `Ángulo a partir del plano XY`. AutoCAD
  2027's Spanish console settles the rest (view/p230, p236, p253, p300, p329): the orthographic
  list `[sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<sUperior>`, the isometric keywords
  the first prompt declares unlisted, `SOIso` / `SEIso` / `NEIso` / `NOIso`,
  `Regenerando modelo.`, `*** Cambiando al SCU ***` / `*** Volviendo al SCP ***` (the table's other
  string says `Conmutando a SCU`), PLANTA's `No se puede encontrar SCP "NOMBRE".` (the table's
  `Imposible encontrar el SCP` is what neither PLANTA nor SCP's Restore writes, ucs/p234) and 3DORBITA's
  `Pulse ESC o INTRO para salir…`, in capitals where ENCUADRE's says `Esc o Intro`. Its installed
  `acad.pgp` and console give the aliases `-PV`, `PV` and `DDVPOINT` (PTOVISTA, p201, p260), `-VI`
  and `VI` (-VISTA and VISTA, p335), `3DO` and `ORBIT` (3DORBITA), `CUBE` (NAVVCUBE, p265), `E`
  and `-E` (ENCUADRE and -ENCUADRE, p201, p269). **Unverified:** the edge-on message. `NAVVCUBE`
  keeps its English name, with `[ACT/DES] <ACT>` (the console lists
  `Indique una opción [ACT/DES/Parámetros] <ACT>:`, p265; Parámetros is not built). From the
  Spanish help's captures: the view menu (Superior, Inferior, Izquierda, Derecha, Frontal, Posterior, Isométrica
  SO / SE / NE / NO), the cube's SUPERIOR, FRONTAL and IZQUIERDA and its compass's `O`; the menus
  (Inicio, Paralelo, Definir vista actual como inicio, SCU, Nuevo SCP, Sin nombre) from its pages.
  The cube's faces and compass and the preset views are the engine's words (`interface.viewCube`,
  `interface.view`), the menus' the editor's (`ViewCube`). **Unverified:** INFERIOR, POSTERIOR
  and DERECHA on the cube, the roll and triangle tooltips, and Vista personalizada (the only
  Spanish source, a 2026 "¿Ha probado…?" page, shows `[Personalizada]`).
- **Aliases:** verified in Autodesk's 2026 Spanish material: `L`, `C`, `A`, `REC`, `CP`, `DI`, `AA`,
  `Z`, `B`, `H`; in AutoCAD 2027's Spanish console: `MP`, `CH` (corners/p103), `P` (pieces/p140), `DP` (pieces/p243), `BQ` and `-BQ` (blocks/p151), `IN` and `-IN` (blocks/p200); in the 2027 `acad.pgp` (the
  install's): `MODBLQ`, `BMAKE`, `BMOD` and `ACADBLOCKDIALOG` for BLOQUE. **† = unverified
  for 2026:** the Spanish `acad.pgp` ships only with the language pack; these come from three
  transcriptions of it (2012–2021) that agree with each other and with
  a screenshot of the file's start in the 2026 help. The 2026 Spanish "Hitchhiker's Guide" uses some
  English letters instead (M, O, TR, EX, MI, S, F, X); not followed, since the file maps them to
  other commands (`EX` is EXPORTAR). In Spanish `U` is UNIR and `H` undoes. `TEXTOM`'s aliases are
  `acad.pgp`'s `TXM` and `MTEXT` (`-TXM` for -TEXTOM): the Spanish shortcut guide gives it `T` and
  `MT`, but that page is a translation of the English one (it also lists `DT` for TEXTO), and the
  file keeps `T` on TEXTO, as the 2027 console does (`MT` is no command there), with `TEXTODIN`
  (text/p149, p150, p259, p260).
- **Prompts and keywords:** where a default touches the list, and where the answer is written
  against the colon, are the language's (`promptForms`, `answerForms`): Spanish spaces the arrays'
  main prompt, and writes the unit cell's answer against its colon (`…celda de unidad:0,0`,
  AcArrayRes 5717, arrays/p157), as DIMSPACE's in every language (`Designar cota base:50,-40`). From
  Spanish product captures (2012–2020) and the 2011–2026 Spanish
  help;
  where the help and the product disagree on capitals, the product wins (`punto a Atravesar`,
  `RAdio`, `jUstificar`, `ángUlo`, `EScala`). TEXTOM's corner prompts,
  `[Altura/Justificar/Interlineado/Rotación/Estilo/aNchura]`, `[Al menos/Exactamente]` (declared
  `Almenos`) and `textoM:` are the 2027 console's (text/p200, p202, p215), EDITARTEXTO's `[Simple/Múltiple]` too
  (table 21789, text/p249). **Unverified** (no source found; worded in
  Autodesk's style): CIRCULO's `Diámetro`, ELLIPSE's `ángulo Incluido` and its centre/arc prompts,
  POLYGON's `Tipo` switch
  (ours), OFFSET's Yes/No, Current/Source
  (`Actual`/`Origen`),
  On/Off (`ACT`/`DES`, as SNAP prints them) and `Distancia`, HATCH's pattern name, scale and angle
  prompts, the reference sub-prompts of ROTATE and SCALE,
  the clipboard base-point prompt, the title and question of TEXTOM's Unsaved Changes dialog
  (`Texto de líneas múltiples - Cambios sin guardar`; the tables hold only 25268, `TEXTOM – Cambios
  sin guardar`), SCP's
  `Sí`/`No` before replacing a saved UCS, the palette rows of TEXTOM and SPLINE (`Factor de
interlineado`, `Anchura definida`, `Método`, `Grado`…), the prompts of POL, CIRCULO and ARCO their
  rows mark,
  and every dynamic-input label (Spanish AutoCAD's box shows the
  prompt and unlabelled fields; the labels are the nouns of its prompts).
- **Messages:** verified `Comando:`, `*Cancelar*` at `Comando:` and `*Cancelado*` inside a
  command (the 2027 desktop, probe line/d08, d19),
  `Comando "X" desconocido. Pulse F1 para obtener ayuda.` (the 2027 console),
  the snap tooltips, the hatch
  density message (partial) and `Las líneas no son coplanares.` (Autodesk's Spanish support article
  on it); FILLET's, CHAMFER's, TRIM's, POLYGON's, ELLIPSE's and SPLINE's prompts and reports,
  `*No válido*`, from the string table of Autodesk's AutoCAD 2027 Spanish language pack
  (`es-ES/acadres.dll`, read without installing it), paired with AutoCAD 2023's English by id;
  EXPLODE's `1 no se ha podido descomponer.` and `No hallada.` (the 2027 console, erase/p216,
  p328, p329); JOIN's prompts, `Convert to circle?` and its counts (the 2027 console,
  pieces/p300–p387, p396–p440). ERASE says no count, and an empty set nothing (erase/p00, p304).
  PURGE's prompts and reports (the 2027 console, blocks/p04, p141, erase/p326).
  **Unverified:** the file errors, the clipboard and
  FROM notes, `El círculo no existe.`, block, pattern and style not found, `Capa{n}`
  (partial), `Copia de {name}`, `Radio de empalme es demasiado grande`,
  `Distancia de chaflán es demasiado grande` and
  `Todos los efectos del comando han sido deshechos.`. POLYGON's refusals are the 2027 console's (polygon/p02, p08).
- **Sources beyond the help pages:** the Spanish alias guides
  ([2022 Product
  Insights](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-Product-Insights/files/GUID-DB0E87C4-2223-49ED-84F9-FBB3B6BA65A9.htm),
  [Did You
  Know](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-DidYouKnow/files/GUID-D2B4BF16-B1F7-4EF2-89AF-88ACE85FAD73.htm)),
  `initget` for local and global keywords and capitals anywhere
  ([2025](https://help.autodesk.com/view/ACD/2025/ENU/?guid=GUID-9ED8841B-5C1D-4B3F-9F3B-84A4408A6BBF)),
  the `_` and `.` prefixes ([CADforum](https://www.cadforum.cz/en/qaID.asp?tip=2425),
  [Autodesk's blog](https://blog.autodesk.io/working-with-non-english-version-of-autocad/)) and
  the University of Granada's transcript of the Spanish product
  ([PDF](https://www.ugr.es/~ega3/Unidad%20didactica%2001%20Sintaxis%20vectorial%202D.pdf),
  «Precise punto siguiente o [Cerrar/desHacer]»). To settle every † and **unverified** below, a
  capture of AutoCAD 2026 with the Spanish language pack (the 30-day trial is enough).
- **Z readouts:** `Altura de objeto` (the palette's General row, help 99AFB412), ID's
  `Precise punto` and the ribbon's `Coordenadas punto` from the 2026 Spanish help. **Unverified:**
  DIST's and ID's reports and the palette's `Inicio Z`, `Fin Z`, `Delta Z` and `Elevación` (worded
  as the X and Y rows already published).
