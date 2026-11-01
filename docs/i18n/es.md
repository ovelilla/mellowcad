# Spanish (`es`)

> **Command language:** `localized`, Spanish AutoCAD's. **Status:** `live` since 27/09/2026.
> **Review:** every word is Autodesk's own, so no native reader is pending; reviewed on 31/10/2026
> against AutoCAD 2027.1 (26.0.118, its `es-ES` resources 26.0.116: console, tables, interface DLLs,
> `acad.cuix` and desktop). What no source settled yet is marked **no** or **unverified** below.

The Spanish words are Autodesk's own Spanish localization of AutoCAD, never a translation of ours:
someone who works in Spanish AutoCAD must find the words they already know.

## Sources

Autodesk's Spanish help uses the same GUIDs as the English one. `C` below is
`https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/GUID-<id>.htm` (2027's answers the
same); `GS`, `DYK`, `CU` and `MAC` are the same URL with `AutoCAD-GettingStarted`,
`AutoCAD-DidYouKnow`, `AutoCAD-Customization` or `AutoCAD-MAC-Core` in place of `AutoCAD-Core`.

The installed product's own interface outranks the help, as in `pt-BR.md`: `P <dll> <id>` is a
string table of the installed `es-ES/` resource DLL (`strtable.mjs`), `D <dll> <dialog>` a
dialog's control, `X <uid>` an element of `UserDataCache/es-es/Support/acad.cuix`, each paired by
id with its `en-US` twin.

For the command line the best source is the product's own string table: Autodesk's public AutoCAD
2027 Spanish language pack (`Autodesk_AutoCAD_2027_Spanish_Language_Pack.exe`, linked from the
forum thread "2027 Product download links") holds `es-ES/acadres.dll`, which 7-Zip extracts without
running anything. It is also the language installed with the owner's AutoCAD, so its console,
desktop and tables answer in Spanish (skill `autocad-research`); `console-pair.mjs --lang es` pairs
the 5,124 probes run in `es-ES` with their English twins (`research/console/es.md`).

## Interface terms

| Area | English | Spanish | Source | Verified |
| --- | --- | --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Intersection, Apparent intersection | Punto final, Punto medio, Centro, Intersección, Intersección ficticia | C 50383F73-4F23-4F70-B4FC-52D5748D80AF | yes |
|  | Perpendicular, Tangent, Insertion, Extension, Parallel, Quadrant, Nearest | Perpendicular, Tangente, Inserción, Extensión, Paralelo, Cuadrante, Cercano | same | yes |
|  | None | Ninguno | X ACAD_14 (the snap menu) | yes |
|  | From (snap menu) | Desde | C A2F8FFFB-EEC4-40A5-AFA5-A44C41E281E5 | yes |
|  | Point Filters (snap menu) | Filtros para puntos | es-es acad.cuix, `ACAD_1863`; desktop filters/d03 | yes |
| Status bar | Object snap | Referencia a objetos | C ACAA0279-047D-458E-889F-60BBFDD40489 | yes |
|  | Object snap tracking, Polar tracking | Rastreo de referencia a objetos, Rastreo polar | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB | yes |
|  | Ortho mode, Grid | Modo Orto, Rejilla | same | yes |
|  | Snap mode | Modo Forzcursor | C 8AA3D979-2636-4C9D-BEFF-528E572B8FF4 | yes |
|  | Show lineweight | Mostrar grosor de línea | C DB74CB64-2083-4285-92B9-653DEBAFEDDE | yes |
|  | Snap X spacing, Snap Y spacing | Distancia resolución X, Distancia resolución Y | D dwgaidsRes 130 (Parámetros de dibujo) | yes |
|  | Selection cycling; its list box, its None | Ciclo de selección; cuadro de lista Selección, su Ninguna (desktop erase/d12) | C 6BD7F1F7-477E-43C4-B6AE-680F5FE6CB0D, C BD08721C-A2BB-472E-B706-B3E6DC8FCEC7 | yes |
|  | Dynamic input | Entrada dinámica | C C5381B8D-FAE1-437D-BC08-6D279073A61C | yes |
|  | Coordinates; Model space, its label MODEL; Customization | Coordenadas; Espacio modelo, MODELO; Personalización | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB, C 5FD72B72-1FFF-44BF-97B3-938552FD6C51 | yes |
|  | Units; Clean screen | Unidades; Limpiar pantalla | C F780BFA4-F711-43CB-A9B9-9D08683FA2CF, C 8FBF7BAA-4A34-4171-A7B5-A6E28B8EC4CE | yes |
| Drawing units | Drawing Units; Length, Type, Precision, Decimal; Insertion scale; Sample output | Unidades de dibujo; Longitud, Tipo, Precisión, Decimales; Escala de inserción; Muestra de salida | C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
|  | Millimeters, Centimeters, Meters | Milímetros, Centímetros, Metros | C A58A87BB-482B-4042-A00A-EEF55A2B4FD8 | yes |
|  | Units to scale inserted content | Unidades de escala del contenido insertado | D unitsRes 500 | yes |
|  | OK, Cancel | Aceptar, Cancelar | D AcDimRes 102 (and every dialog's buttons) | yes |
| Ribbon | Home; Draw, Modify, Annotation panels; the ribbon | Inicio; Dibujo, Modificar, Anotación; la cinta de opciones | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc | Línea, Polilínea, Círculo, Arco, Elipse, Arco elíptico | C 57CDDB6C-B12B-46CE-B9C5-22EFC17258FF, C A3E54913-3813-407D-9283-19EC6610D4F3 | yes |
|  | Center, Radius · Center, Diameter · 2-Point · 3-Point | Centro, Radio · Centro, Diámetro · 2 puntos · 3 puntos | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
|  | Start, Center, End · Center, Start, End | Inicio, Centro, Fin · Centro, Inicio, Fin | C C78378FD-4704-4D0A-9D86-82FCBB118097 | yes |
|  | Rectangle, Polygon, Hatch | Rectángulo, Polígono, Sombreado | C 377C261F-EEF1-4438-A80D-6760CAE37B81 | yes |
|  | Spline, Spline Fit, Spline CV | Spline, Ajuste de spline, VC de spline | the ribbon's tooltips, acad.cuix (Home > Draw) | yes |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale | Desplazar, Copiar, Estirar, Girar, Simetría, Escala | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E | yes |
|  | Offset, Trim, Extend, Fillet, Chamfer | Desfase, Recortar, Alargar, Empalme, Chaflán | same, C 696681C1-4B8B-4995-8903-CCE6686179EA | yes |
|  | Explode, Join, Break, Break at point | Descomponer, Juntar, Partir, Partir en un punto | C 4DC59885-3B10-4CEE-854B-4B5ADCD1A4EF; X ID_RBN_CMDBTN_BREAKSELE, TBB_0075 | yes |
|  | Region; Union, Subtract, Intersect; Solid Editing | Región; Unión, Diferencia, Intersección; Editar sólidos | es-es acad.cuix, `ID_Region`, `ID_Union`, `ID_Subtract`, `ID_Intersect`, `ID_PanelSolidEdit` | yes |
|  | Box; 3D Solid; Solid type, Box; History, None, Show History; Solid History | Prisma rectangular; Sólido 3D; Tipo de sólido, Prisma; Historial, Ninguno, Mostrar historial; Historial de sólido | es-es acad.cuix `ID_Box`'s menu item (ACAD_297, `Pri&sma rectangular`) and help (ACAD_1412); the ribbon and toolbars say `De textura cuadrada` (`ID_RBN_CMDBTN_BOX`, TBB_0179), the material mapping's string (XLS_1817) reused by Autodesk's mistake, not copied; LIST's lines (solid/p01); 3D Solid and Solid History, ours | partly |
|  | Wedge, Pyramid; Modeling; Solid type Wedge, Pyramid; Base radius, Top radius, Sides, Type, Inscribed, Circumscribed | Cuña, Pirámide; Modelado; Tipo de sólido Cuña, Pirámide; Radio de base, Radio superior, Lados, Tipo, Inscrito, Circunscrito | es-es acad.cuix `ID_Wedge`, `ID_Pyramid`, `ID_Panel3D_Modeling`; LIST's lines and the keywords (solid/w01, y01, y02); the palette's rows not seen in Spanish | partly |
|  | Cylinder, Cone; Elliptical, Major radius, Minor radius, Base/Top major and minor radius | Cilindro, Cono; Elíptico, Radio mayor, Radio menor, Radio mayor/menor de base, Radio mayor/menor superior | es-es acad.cuix `ID_Cylinder`, `ID_Cone`; LIST's lines and the keywords (solid/c01, c04, k01, k03); `Radio menor superior` and the palette's rows, ours | partly |
|  | Sphere, Torus; Torus radius, Tube radius | Esfera, Toroide; Radio de toroide, Radio de sección | es-es acad.cuix `ID_Sphere`, `ID_Torus`; LIST's lines (solid/h01, r01); the palette's rows, ours | partly |
|  | Match properties | Igualar propiedades | C F1EB0CCC-49E4-4798-A12E-709795CAD1C2 | yes |
|  | Array; Rectangular, Polar, Path array | Matriz; Matriz rectangular, Matriz polar, Matriz de camino | C 181BF535-D6F4-4B90-B04D-EB99C5488DAB; P ax26res 1186, X XLS_00021865 | yes |
| Annotate | Single line text, Edit | Texto en una línea, Editar | C 8739509C-15A7-4582-BF7C-3D83ED2A23B5 | yes |
|  | Linear, Aligned, Angular, Radius, Diameter, Baseline, Continue, Adjust space | Lineal, Alineada, Angular, Radio, Diámetro, Línea base, Continuar, Ajustar espacio | C DEB94C8F-064F-4E44-AB7A-D157DA166581, C 7CE4EF2B-93C6-423A-9401-664F3FE0829A; X TBB_0002 | yes |
| Block | Create block, Insert, Purge | Crear bloque, Insertar, Limpiar | C 7625417C-BFA4-4BEB-8A19-109778AA1E30, C D68BA47B-A79D-4F58-9715-0569CC24BCEF | yes |
|  | Define attributes, Edit attributes | Definir atributos, Editar atributos | C 19B6B720-B40B-42B6-A521-888C1A383F34, C AB03D5EE-6B27-492A-8147-671D0F536CB5 | yes |
|  | Attribute display; Attribute definition | Visualizar atributos; Definición de atributo | X ACAD_147 (the menu); X XLS_0011 (Quick Properties) | yes |
| View | Zoom, Pan; Window, Previous, Extents | Zoom, Encuadre; Ventana, Previo, Extensión | C 66E7DB72-B2A7-4166-9970-9E19CC06F739 | yes |
| Inquiry | Measure, Area | Medir, Área | C 4C31CB59-338C-4812-991D-29414329611E | yes |
| Edit | Undo, Redo, Erase | Deshacer, Rehacer, Borrar | C BC96A2AA-2AEE-47C0-B1F2-85F8B60663D6 | yes |
| Clipboard | Copy, Cut, Paste, Copy with base point | Copiar, Cortar, Pegar, Copiar con punto base | C 345B759D-D758-488A-9E85-542A30A901C4, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Selection | Window, Crossing | Ventana, Captura | P acadres 63424 (the lasso's tooltip, filled with the keywords of `Designar objetos`, the console's) | yes |
| Properties | General, Geometry | General, Geometría | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
|  | Color, Layer, Linetype, Lineweight, Dim style | Color, Capa, Tipo de línea, Grosor de línea, Estilo de cota | C 99AFB412-CEE2-4C12-B7AD-E11E9389BBF9 | yes |
|  | ByLayer, ByBlock | PorCapa, PorBloque | same | yes |
|  | Object color; No selection | Color de objeto; No hay selección | P gridres 109, X XLS_00021912; P acopmRes 177 | yes |
|  | \*VARIES\* | \*VARIOS\* | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
|  | Start X, End X, Closed, Vertex X, Current Vertex | Inicio X, Fin X, Cerrado, Vértice X, Vértice actual | P ax26res 7, 10, 251, 1, 18 | yes |
|  | Center X | Centro X | P ax26res 14 | yes |
|  | Height, Rotation, Scale, Pattern | Altura, Rotación, Escala, Patrón | C AAD65B06-E480-49EA-B97D-57DDEA36783C | yes |
|  | Justify; Middle center | Justificar; Medio centro | P ax26res 54, 116 | yes |
|  | Line space factor, Line space distance, Line space style (At least, Exactly), Defined width (an MTEXT's) | Factor de espacio de línea, Distancia de espacio de línea, Estilo de espacio de línea (Mínimo, Exactamente), Anchura definida | P ax26res 120, 330, 121, 122, 732 | yes |
|  | Measurement, Text override | Medidas, Modificar texto | P ax26res 154, 211 | yes |
|  | Rotated, Aligned, Radial, Diametric, Angular Dimension; Lines & Arrows, Fit, Primary Units; Arrow size, Center mark size, Ext line ext, Ext line offset, Text offset, Text position X, Text rotation, Dim scale overall, Decimal separator, Suppress trailing zeros, Precision (a dimension's) | Cota girada, Cota alineada, Cota radial, Cota diamétrica, Cota angular; Líneas y flechas, Ajustar, Unidades principales; Tamaño de flecha, Tamaño de marca de centro, Ext de línea de extensión, Desfase de línea de extensión, Desfase de texto, Posición de texto X, Rotación de texto, Escala de cota general, Separador decimal, Suprimir ceros a la derecha, Precisión | P ax26res 287–292, 141–143, 174, 176, 217, 182, 186, 223, 210, 169, 149, 235, 156 | yes |
|  | Invisible, Constant, Verify, Preset, Lock position | Invisible, Constante, Verificar, Prestablecer, Bloquear posición (the palette); Verificable, Predefinido (ATRDEF's modes) | P ax26res 257–260, 359; C 5C99524B-B5BB-4067-AE18-BD3575F29DBF and the console (blocks/p03) | yes |
|  | Attributes; Tag, Prompt, Value; Misc | Atributos; Identificador, Solicitud, Valor; Varios | P ax26res 1500, 34, 33, 35, 25 | yes |
|  | Delta X, Length, Angle (a line's Geometry) | Incremento X, Longitud, Ángulo | desktop line/d16 | yes |
|  | Radius, Diameter, Circumference, Area, Start/End angle, Major/Minor radius, Contents | Radio, Diámetro, Circunferencia, Área, Ángulo inicial/final, Radio mayor/menor, Contenido | P ax26res 252, 262, 263, 253, 87, 88, 103, 104, 57 | yes |
|  | Radius ratio, Major axis vector X, Minor axis vector X (an ellipse's Geometry) | Relación del radio, Vector de radio mayor X, Vector de eje menor X | P ax26res 105, 47, 46; desktop ellipse/d08 | yes |
|  | Data Points; Number of fit points, Current Fit point, Fit point X; Number of control points, Current Control point, Control point X, Weight; CV frame; Show, Hide (a spline's) | Puntos auxiliares; Número de puntos de ajuste, Punto de ajuste actual, Punto de ajuste X; Número de puntos de apoyo, Punto de apoyo actual, Punto de apoyo X, Peso; Marco de vértices de control; Mostrar, Ocultar | P ax26res 74, 69, 101, 72, 71, 73, 70, 912, 913 (the CV frame 912, not 1248's `Mostrar marco…`: desktop spline/d10 cuts it at `Marco de vértices d…`) | yes |
|  | Method, Degree, Periodic, Planar, Start / End tangent vector X, Fit tolerance; Fit, Control Vertices; Chord, SqrtChord, Uniform, Custom (a spline's Misc and values) | Método, Grado, Periódica, Plana, Inicio vector de tangente X / Vector de tangente final X, Ajustar tolerancia; Ajustar, Vértices de control; Cuerda, RaízcuadradaCuerda, Uniforme, Personalizado | P ax26res 914, 278, 916, 96, 75, 76, 99, 915, 911, 84; desktop spline/d10, spline-knots/d02 | yes |
|  | Total angle, Arc length (an arc's Geometry) | Ángulo total, Longitud de arco | P ax26res 89, 90 | yes |
|  | Type, Predefined, Pattern name, Annotative, Origin X, Associative, Island detection style, Outer; Cumulative Area (a hatch's) | Tipo, Predefinido, Nombre de patrón, Anotativo, Origen X, Asociativo, Estilo de detección de islas, Exterior; Área acumulada | P ax26res 83, 84, 85, 925, 358, 113, 114, 928; AcOpmExtRes 105 | yes |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White | Rojo, Amarillo, Verde, Cián, Azul, Magenta, Blanco | C 14BC039D-238D-4D9E-921B-F4015F96CB54 | yes |
| Layers | Layer Properties Manager; New layer, Set current, Delete layer, Current layer | Administrador de propiedades de capas; Nueva capa, Definir actual, Suprimir capa, Capa actual | C B297EBD9-D68C-47E1-87CE-1B3798496599 | yes |
|  | Layer - Not Deleted, Layer - Current Layer Off, Layer - Name Already Exists, Layer - Rename (the manager's task dialogs) | Capa - Sin suprimir, Capa - Capa actual desactivada, Capa - El nombre ya existe, Capa - Cambiar nombre | `AcTaskDialogs.resources.dll`, `AcLayer.resources.dll` (2027, en-US and es-ES) | yes; partial (`Capa` for `%ObjectName%`) |
| Dimension styles | Lines, Symbols and arrows, Text, Fit, Primary units | Líneas, Símbolos y flechas, Texto, Ajustar, Unidades principales | C 60840416-5E03-4CCC-ACEE-1E92D078BDB5 | yes |
|  | Baseline spacing, Extend beyond dim lines, Offset from origin | Intervalo de línea base, Ampliar líneas de cota, Desfase desde origen | C 8EA3CEFF-F842-4EFD-B7D8-3D9BA6AFBBCF | yes |
|  | Arrow size, Center marks | Tamaño de flecha, Marcas de centro | C E063AF30-6F14-42D6-B0AB-0CF5C47B5897 | yes |
|  | Text height, Offset from dim line | Altura de texto, Desfase de línea cota | C 38DAEEF0-AB44-4C58-8D0E-955BFCFF71A7; D AcDimRes 303 | yes |
|  | Use overall scale of; Precision | Usar escala general; Precisión | C 17FAE4A5-34C7-4D87-BFC5-E3791C083E73, C 2D1177AB-3130-4522-A631-AA28493529DC | yes |
|  | Decimal separator: ',' (Comma), '.' (Period), ' ' (Space); Suppress trailing zeros | Separador decimal: ',' (Coma), '.' (Periodo), ' ' (Espacio); Suprimir ceros a la derecha | P acdb26res 6150–6152, ax26res 149, 235 | yes |
|  | Draw dim line between ext lines (the Fit tab's DIMTOFL) | Dibujar línea de cota entre líneas de referencia | D AcDimRes 305 | yes |
| Text styles | Height, Set current, New, Delete | Altura, Definir actual, Nuevo, Suprimir | C 1ED81E98-6463-4574-875F-183C8280C4AC | yes |
| Blocks palette | Current drawing, Filter | Dibujo actual, Filtro | C E3413A03-8EEF-44D5-B5C7-8B345A9257FE | yes |
| Drawing aids | Linetype scale (global scale factor), Drawing units, Precision | Factor de escala global, Unidades de dibujo, Precisión | C 47B3793A-37BF-45FC-94CB-670433ADD366, C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
| Keys | Enter, Esc, Del, Ctrl, Shift, Tab, Spacebar | Intro, Esc, Supr, Ctrl, Mayús, Tab, barra espaciadora | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Command line | Type a command | Escriba un comando | DYK 363A3BFA-CAF2-469E-9F35-0BF64139811C | yes |
|  | Command line; Command history | Línea de comando; Historial de comandos | X ACAD_2669, P dwgaidsRes 1204; P dwgaidsRes 1328, 1330 | yes |
| Shortcut menu | Shortcut menu; Repeat ‹command›, Enter, Cancel | Menú contextual; Repetir ‹comando›, Intro, Cancelar | C D4A2C069-3AAD-492D-84C2-4134C7031B2F; X ACAD_1897, ACAD_1758, ACAD_1923 | yes |
|  | Clipboard; Osnap Overrides; Properties | Portapapeles; Modificaciones de REFENT; Propiedades | C D4A2C069-3AAD-492D-84C2-4134C7031B2F, DYK 18389CD1-2F81-4185-A459-F59AE311D637; Osnap Overrides acad.cuix's CMCOMMAND (ACAD_2602); Modificaciones de REFENT the 2027 desktop's Command menu (probe line/d07: the help's "submenú Modificaciones de referencias", C 8F5E5431-9EFB-414E-BC6D-2C65EFB2DAC3, is not what it shows) | yes |
|  | Dimension Style (the Edit menu over dimensions) | Estilo de cota | X ACAD_2000 | yes |
|  | Copy Selection, Deselect All; Copy with Base Point (Clipboard ▸) | Copiar selección, Anular selección; Copiar con punto base | acad.cuix's CMEDIT (PM_0007) and Clipboard ▸ (PM_0114), en-US and es-ES | yes |
| View | Top, Bottom, Front, Back, Left, Right (view menu, -VIEW) | Superior, Inferior, Frontal, Posterior, Izquierda, Derecha | desktop view/e01-3; X TBB_0301–0305 | yes |
|  | SW / SE / NE / NW Isometric | Isométrica SO / SE / NE / NO | desktop view/e01-3 | yes |
|  | Custom View | Vista personalizada | P acadres 40867 | yes |
|  | Orbit; 3D Orbit | Órbita; Órbita 3D | P AcVMToolsRes 47091; C 85CE824C-0AF4-4890-8487-ADBC92BF08F1 | yes |
|  | Plan view, View point, Preset views, UCS icon, Elevation (tool names) | Vista en planta, Punto de vista, Vistas predefinidas, Icono SCP, Elevación | X ACAD_112, P acrenderRes 2085; X ID_TbViewpoi; P AcSceneRes 5143; P AcVMToolsRes 4115; P ax26res 59 | yes |
| ViewCube | ViewCube; Home; Parallel; Set Current View as Home | ViewCube; Inicio; Paralelo; Definir vista actual como inicio | C E6D3896C-AF39-4F5C-A57C-CACE2A1117F9, C 3CE31F02-64A5-4BB8-9461-4C4F659C63B7 | yes |
|  | TOP, FRONT, LEFT; BOTTOM, BACK, RIGHT (faces); N, E, S, W | SUPERIOR, FRONTAL, IZQUIERDA; INFERIOR, POSTERIOR, DERECHA; N, E, S, O | desktop view/e01-1 and names/e01 (each face in the WCS; AcVMToolsRes 629–634, `Atrás` for Back, are not the cube's); the help's captures | yes |
|  | Rotate clockwise / counterclockwise; View the face above… | Girar en sentido horario / antihorario; Ver la cara de arriba… | C A90F5F1C-B338-4BDE-9D05-F26BFFE3B3A5 (prose: «en el sentido de las agujas del reloj o en el sentido inverso»); no table holds the tooltips, and reading them on the desktop needs the mouse | no |
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

`/es/draw` speaks Spanish AutoCAD 2027's command language, as its language pack does: Spanish
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
  deshacer 1"), `REDO` `REHACER`, `SNAP` `FORZCURSOR` / `FC`, `FROM` `DESDE`,
  `BLOCKSPALETTE` `PALETABLOQUES`.
- **Workspace:** `UNIDADES`, `ESCALATL`, `LIMPIAPANTACT` and `LIMPIAPANTDES` from the Spanish pages
  with the English GUIDs (1DAE2080, 47B3793A, 1D51E778, 7C9CDCC6); the dialog's
  `Unidades de dibujo`, `Longitud`, `Tipo`, `Precisión`, `Decimales`, `Escala de inserción`,
  `Muestra de salida` and INSUNITS' `Milímetros`, `Centímetros`, `Metros` from 75419F91 and
  A58A87BB, the status bar's `Limpiar pantalla`, `Personalización`, `Espacio modelo` and
  `MODELO` from E3B34B0A and 5FD72B72.
  `UNS`, `DDUNITS` and `EC` are the 2027 `acad.pgp`'s; ESCALATL's prompt is the console's
  (blocks/p218, corners/p156).
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
  console print it, its space missing; CHAMFER's refusal as the console words it (names/p17).
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
  `Ajuste de spline` and `VC de spline` are the ribbon's tooltips (acad.cuix), the palette's
  `Parametrización de nudos` ax26res 910.
- **SPLINEDIT:** `EDITSPLINE` (table 52827) and `SPE` from the 2027 Spanish `acad.pgp`; every
  prompt, keyword and message from 2027's console (spline-knots/k57–k146.es), whose `initget`
  spells some words per prompt (`añaDIr` and `dEsplazar` at Fit data, `Añadir` and `Desplazar` at
  Edit vertex, `Polilínea` at a closed spline's first prompt, eXit's hidden `SA` or `S`).
  The rail's `Editar spline` is the ribbon's (X ID_RBN_CMDBTN_SPLINEDIT).
- **PEDIT:** `EDITPOL` and `PE` from the 2027 Spanish `acad.pgp`; every prompt, keyword and
  message from 2027's console (pedit/p01–p146.es), whose `initget` spells Join `Juntar` at a 2D
  polyline's prompt and `Unir` at a 3D one's, eXit `Salir` at Edit vertex and the hidden `SAlir`
  beside `SA` at the first prompt, and the default of Next `<U>`; Fit `curVar`, Decurve
  `anularcuRVatura` and its hidden twin `ELiminarcurva`, a 3D polyline's `Spline` listed `curva
  Spline` (p51.es, p55.es, p198.es). **Deviation:** Multiple's prompts list Spline `SPline` and a 3D
  polyline's `curvaB`, and declare `Eliminarcurva` (p196.es, p197.es): here as the single prompts
  spell them, a keyword's label being one per command. The rail's `Editar polilínea` is the
  ribbon's (X ID_RBN_CMDBTN_PEDIT). **Unverified:** Jointype's default `<Ambos>`, worded as the
  console words `<Alargar>` and `<Añadir>` (pedit/p105–p108); no probe left it at Both.
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
  `interface.view`), the menus' the editor's (`ViewCube`). The cube's INFERIOR, POSTERIOR and
  DERECHA are the 2027 desktop's (names/e01, each view set in the WCS: the cube turns with the
  UCS, which -VISTA's orthographic views change), Vista personalizada table 40867.
  **Unverified:** the roll and triangle tooltips (no table holds them).
- **Aliases:** every one is the installed 2027 `acad.pgp`'s (`research/strings/acad_es.pgp`), which
  the console loads: `L`, `C`, `A`, `REC`, `CP`, `DI`, `AA`, `Z`, `B`, `H`, `MP`, `CH` (corners/p103),
  `P` (pieces/p140), `DP` (pieces/p243), `BQ` and `-BQ` (blocks/p151), `IN` and `-IN` (blocks/p200),
  `MODBLQ`, `BMAKE`, `BMOD` and `ACADBLOCKDIALOG` for BLOQUE, `LINEWEIGHT` for GROSORLIN (names/p24),
  and those once marked † from transcriptions of older files: `ACOLIN`, `DIMLIN`, `ACOALI`,
  `ACOLINE`, `ACOCONT`, `ACORAD`, `ACODIA`, `ACOANG`, `PL`, `EL`, `U`, `FC` and `EC` (the language
  review of 31/10/2026). The 2026 Spanish "Hitchhiker's Guide" uses some
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
  (table 21789, text/p249). The 2027 console settles what was once worded in Autodesk's style:
  CIRCULO's `Diámetro` and its prompt (circle/p105), ELLIPSE's `Incluido` and its centre and arc
  prompts (ellipse/p06), OFFSET's keywords and settings line (offset/p01, p119), SNAP's `ACT`/`DES`,
  HATCH's pattern name, scale and angle prompts (blocks/p220), the reference prompts of ROTATE and
  SCALE (transforms/p105, p172), the clipboard's base point (clipboard/p106) and SCP's replace
  question (ucs/p231); the palette rows of TEXTOM and SPLINE are `ax26res`'s (Interface terms).
  **Unverified** (no source found; worded in Autodesk's style): POLYGON's `Tipo` switch (ours), the
  title and question of TEXTOM's Unsaved Changes dialog (`Texto de líneas múltiples - Cambios sin
  guardar`; the tables hold only 25268, `TEXTOM – Cambios sin guardar`), the prompts of POL,
  CIRCULO and ARCO their coverage rows mark, and every dynamic-input label (Spanish AutoCAD's box
  shows the prompt and unlabelled fields; the labels are the nouns of its prompts).
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
  `El círculo no existe.` (circle/p317), `Nombre de patrón desconocido.` (hatch/p03), `Radio de
  empalme es demasiado grande` (corners/p166), `Distancia de chaflán es demasiado grande`
  (corners/p182) and `Todos los efectos del comando han sido deshechos.` (3dpoly/p40) are the 2027
  console's, `Copia de {name}` the tables' (AcDimRes 155, acdb26res 10211). POLYGON's refusals are
  the 2027 console's (polygon/p02, p08). **Unverified:** the file errors, the clipboard and FROM
  notes (ours), block and dimension style not found (`blockUndefined`, `noMatchingDimStyles`: no
  transcript pairs them) and `Capa{n}` (partial).
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
  «Precise punto siguiente o [Cerrar/desHacer]»), all read before the Spanish product was
  installed; its console, tables and desktop now outrank them.
- **Z readouts:** `Altura de objeto` (the palette's General row, acopmRes 175), ID's
  `Precise punto` and the ribbon's `Coordenadas punto` from the 2026 Spanish help; DIST's and ID's
  reports the 2027 console's (inquiry/p104); the palette's `Inicio Z`, `Fin Z`, `Incremento Z` and
  `Elevación` ax26res 9, 12, 52 and 59.
