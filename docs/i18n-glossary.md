# i18n glossary

The CAD vocabulary of MellowCAD's interface in each language, and where each term comes from. The
Spanish column is Autodesk's own Spanish localization of AutoCAD 2026, never a translation of ours:
someone who works in Spanish AutoCAD must find the words they already know. Arabic is filled in with
its phase (`docs/next-i18n.md` §11) and reviewed by a native speaker.

This file covers the **interface language** — palettes, menus, tooltips, the landing. The **command
language** (command names, aliases, prompts, keywords) is Spanish AutoCAD's own and is recorded per
command in `docs/autocad-coverage.md` when it lands; until then `es` uses the global one.

## Sources

Autodesk's Spanish help uses the same GUIDs as the English one. `C` below is
`https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/GUID-<id>.htm`; `GS`, `DYK`, `CU`
and `MAC` are the same URL with `AutoCAD-GettingStarted`, `AutoCAD-DidYouKnow`,
`AutoCAD-Customization` or `AutoCAD-MAC-Core` in place of `AutoCAD-Core`. A term marked
**partial** was read in prose or an older release; **no** means not confirmed anywhere yet — settle
it from a screenshot of the Spanish product before relying on it.

## Never translated

- **Drawing data:** layer, block and style names (`0`, `Standard`, `ISO-25`), linetype names
  (`Continuous`, `Dashed`…) and hatch pattern names (`SOLID`, `ANSI31`). They are the drawing's, as
  in AutoCAD, so `cad/locales/es.json` leaves `interface.linetype` and `interface.hatchPattern` out.
- **Technical values:** a point for decimals, a comma between coordinates, latin digits, in every
  language.
- **Brand and notation:** MellowCAD, AutoCAD, DWG, DXF, the axis names X and Y.

## Interface terms

| Area | English | Spanish | Arabic | Source | Verified |
| --- | --- | --- | --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Intersection, Apparent intersection | Punto final, Punto medio, Centro, Intersección, Intersección ficticia | | C 50383F73-4F23-4F70-B4FC-52D5748D80AF | yes |
| | Perpendicular, Tangent, Insertion, Extension, Parallel, Quadrant, Nearest | Perpendicular, Tangente, Inserción, Extensión, Paralelo, Cuadrante, Cercano | | same | yes |
| | None | Ninguno | | C CF5780AD-D1AB-4526-9608-83D7952749E7 | partial |
| | From (snap menu) | Desde | | C A2F8FFFB-EEC4-40A5-AFA5-A44C41E281E5 | yes |
| Status bar | Object snap | Referencia a objetos | | C ACAA0279-047D-458E-889F-60BBFDD40489 | yes |
| | Object snap tracking, Polar tracking | Rastreo de referencia a objetos, Rastreo polar | | C E3B34B0A-EA98-45E9-937A-BF5FEF4152DB | yes |
| | Ortho mode, Grid | Modo Orto, Rejilla | | same | yes |
| | Snap mode | Modo Forzcursor | | C 8AA3D979-2636-4C9D-BEFF-528E572B8FF4 | yes |
| | Show lineweight | Mostrar grosor de línea | | C DB74CB64-2083-4285-92B9-653DEBAFEDDE | yes |
| | Selection cycling; its list box | Ciclo de selección; cuadro de lista Selección | | C 6BD7F1F7-477E-43C4-B6AE-680F5FE6CB0D, C BD08721C-A2BB-472E-B706-B3E6DC8FCEC7 | yes |
| | Dynamic input | Entrada dinámica | | C C5381B8D-FAE1-437D-BC08-6D279073A61C | yes |
| Ribbon | Home; Draw, Modify, Annotation panels; the ribbon | Inicio; Dibujo, Modificar, Anotación; la cinta de opciones | | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc | Línea, Polilínea, Círculo, Arco, Elipse, Arco elíptico | | C 57CDDB6C-B12B-46CE-B9C5-22EFC17258FF, C A3E54913-3813-407D-9283-19EC6610D4F3 | yes |
| | Center, Radius · Center, Diameter · 2-Point · 3-Point | Centro, Radio · Centro, Diámetro · 2 puntos · 3 puntos | | GS 6B8B7254-94CD-42DB-8F27-1339CAECE9ED | yes |
| | Start, Center, End · Center, Start, End | Inicio, Centro, Fin · Centro, Inicio, Fin | | C C78378FD-4704-4D0A-9D86-82FCBB118097 | yes |
| | Rectangle, Polygon, Hatch | Rectángulo, Polígono, Sombreado | | C 377C261F-EEF1-4438-A80D-6760CAE37B81 | yes |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale | Desplazar, Copiar, Estirar, Girar, Simetría, Escala | | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E | yes |
| | Offset, Trim, Extend, Fillet, Chamfer | Desfase, Recortar, Alargar, Empalme, Chaflán | | same, C 696681C1-4B8B-4995-8903-CCE6686179EA | yes |
| | Explode, Join, Break, Break at point | Descomponer, Juntar, Partir, Partir en punto | | C 4DC59885-3B10-4CEE-854B-4B5ADCD1A4EF, MAC D175DCD2-2050-4DA9-9965-1E94462718CA | yes (Partir en punto partial) |
| | Match properties | Igualar propiedades | | C F1EB0CCC-49E4-4798-A12E-709795CAD1C2 | yes |
| | Rectangular, Polar, Path array | Matriz rectangular, Matriz polar, Matriz de camino | | C 181BF535-D6F4-4B90-B04D-EB99C5488DAB | yes |
| Annotate | Single line text, Edit | Texto en una línea, Editar | | C 8739509C-15A7-4582-BF7C-3D83ED2A23B5 | yes |
| | Linear, Aligned, Angular, Radius, Diameter, Baseline, Continue, Adjust space | Lineal, Alineada, Angular, Radio, Diámetro, Línea base, Continuar, Ajustar espacio | | C DEB94C8F-064F-4E44-AB7A-D157DA166581, C 7CE4EF2B-93C6-423A-9401-664F3FE0829A | yes (Alineada… partial) |
| Block | Create block, Insert, Purge | Crear bloque, Insertar, Limpiar | | C 7625417C-BFA4-4BEB-8A19-109778AA1E30, C D68BA47B-A79D-4F58-9715-0569CC24BCEF | yes |
| View | Zoom, Pan; Window, Previous, Extents | Zoom, Encuadre; Ventana, Previo, Extensión | | C 66E7DB72-B2A7-4166-9970-9E19CC06F739 | yes |
| Inquiry | Measure, Area | Medir, Área | | C 4C31CB59-338C-4812-991D-29414329611E | yes |
| Edit | Undo, Redo, Erase | Deshacer, Rehacer, Borrar | | C BC96A2AA-2AEE-47C0-B1F2-85F8B60663D6 | yes |
| Clipboard | Copy, Cut, Paste, Copy with base point | Copiar, Cortar, Pegar, Copiar con punto base | | C 345B759D-D758-488A-9E85-542A30A901C4, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Selection | Window, Crossing | Ventana, Captura | | C 50383F73-4F23-4F70-B4FC-52D5748D80AF | partial |
| Properties | General, Geometry | General, Geometría | | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
| | Color, Layer, Linetype, Lineweight, Dim style | Color, Capa, Tipo de línea, Grosor de línea, Estilo de cota | | C 99AFB412-CEE2-4C12-B7AD-E11E9389BBF9 | yes |
| | ByLayer, ByBlock | PorCapa, PorBloque | | same | yes |
| | \*VARIES\* | \*VARIOS\* | | DYK 94C065AB-FF9E-4752-B778-23D2FBB87E18 | yes |
| | Start X, End X, Closed, Vertex X | Inicio X, Fin X, Cerrado, Vértice X | | same | partial |
| | Height, Rotation, Scale, Pattern | Altura, Rotación, Escala, Patrón | | C AAD65B06-E480-49EA-B97D-57DDEA36783C | yes |
| | Justify; Middle center | Justificar; Medio centro | | C D1C664DD-63D9-467E-8EC1-2F5A1777A924 | partial |
| | Measurement, Text override | Medidas, Modificar texto | | a-cad-emia.blogspot.com/2013/10/acotacion20.html (AutoCAD 2013) | partial |
| | Length, Angle, Delta X, Radius, Diameter, Circumference, Area, Start/End angle, Major/Minor radius, Radius ratio, Contents | Longitud, Ángulo, Delta X, Radio, Diámetro, Circunferencia, Área, Ángulo inicial/final, Radio mayor/menor, Relación de radios, Contenido | | — | no |
| Colours | Red, Yellow, Green, Cyan, Blue, Magenta, White | Rojo, Amarillo, Verde, Cian, Azul, Magenta, Blanco | | C 14BC039D-238D-4D9E-921B-F4015F96CB54 | yes |
| Layers | Layer Properties Manager; New layer, Set current, Delete layer, Current layer | Administrador de propiedades de capas; Nueva capa, Definir actual, Suprimir capa, Capa actual | | C B297EBD9-D68C-47E1-87CE-1B3798496599 | yes |
| Dimension styles | Lines, Symbols and arrows, Text, Fit, Primary units | Líneas, Símbolos y flechas, Texto, Ajustar, Unidades principales | | C 60840416-5E03-4CCC-ACEE-1E92D078BDB5 | yes |
| | Baseline spacing, Extend beyond dim lines, Offset from origin | Intervalo de línea base, Ampliar líneas de cota, Desfase desde origen | | C 8EA3CEFF-F842-4EFD-B7D8-3D9BA6AFBBCF | yes |
| | Arrow size, Center marks | Tamaño de flecha, Marcas de centro | | C E063AF30-6F14-42D6-B0AB-0CF5C47B5897 | yes |
| | Text height, Offset from dim line | Altura de texto, Desfase de línea cota | | C 38DAEEF0-AB44-4C58-8D0E-955BFCFF71A7 | yes (the second partial) |
| | Use overall scale of; Precision | Usar escala general; Precisión | | C 17FAE4A5-34C7-4D87-BFC5-E3791C083E73, C 2D1177AB-3130-4522-A631-AA28493529DC | yes |
| Text styles | Height, Set current, New, Delete | Altura, Definir actual, Nuevo, Suprimir | | C 1ED81E98-6463-4574-875F-183C8280C4AC | yes |
| Blocks palette | Current drawing, Filter | Dibujo actual, Filtro | | C E3413A03-8EEF-44D5-B5C7-8B345A9257FE | yes |
| Drawing aids | Linetype scale (global scale factor), Drawing units, Precision | Factor de escala global, Unidades de dibujo, Precisión | | C 47B3793A-37BF-45FC-94CB-670433ADD366, C 75419F91-18B8-47EE-9272-3196ACC95977 | yes |
| Keys | Enter, Esc, Del, Ctrl, Shift, Tab, Spacebar | Intro, Esc, Supr, Ctrl, Mayús, Tab, barra espaciadora | | GS 29B2169B-01D9-429B-9DCD-5D3552E5E68E, CU B6A9C126-230D-47F5-8973-464BC80E3736 | yes |
| Command line | Type a command | Escriba un comando | | DYK 363A3BFA-CAF2-469E-9F35-0BF64139811C | yes |
| Search | 2D CAD online, free, no sign-up, AutoCAD commands, aliases | CAD 2D online, gratis, sin registro, comandos de AutoCAD, alias | | Spanish Google autocomplete and ranking titles, 27/09/2026 (`docs/next-i18n.md` §15) | yes |

## Register

- **Landing:** tú, short sentences, the English tone («Escribe L. Pulsa Intro. Dibuja.»).
- **Editor:** Autodesk's register — labels as infinitives and nouns («Guardar dibujo», «Definir
  actual»), sentences in usted («Escriba un comando»).
- **Neutral Spanish:** no vosotros or voseo; «equipo» or «dispositivo», «archivo», «ratón» (as
  Autodesk's help writes it); «» in prose, em dashes attached to the aside.
