# Vistas 3D y plano inclinado — brief

> **Estado:** aprobado para ejecución (el autor delega D1 y D11 en lo más fiel y mantenible). Sigue la convención de
> `docs/next-*.md`: se borra cuando la feature esté en main; lo que deba perdurar se promueve a
> `.github/instructions/` (§8).
>
> **Para quién:** quien implemente (tú o un agente). Ante un hueco, se elige lo que haga AutoCAD 2026
> y, si no está documentado, lo más estándar (DXF); se anota aquí y se sigue. Lo que quede sin
> verificar se marca así en `docs/autocad-coverage.md`.

## 0. Resumen

1. **Alcance:** ver el modelo desde cualquier dirección en proyección paralela (-VPOINT, -VIEW con
   las vistas predefinidas, PLAN, 3DORBIT y Mayús + rueda), dibujar la elevación y la altura de objeto, trabajar en esas
   vistas (designar, referencias, dibujar sobre el plano de trabajo), la normal por entidad (DXF 210)
   y el UCS inclinado (X, Y, ZAxis, 3 puntos, View, OBject, UCSORTHO).
2. **Fuera:** perspectiva, cámaras, el resto de la navegación 3D (3DFORBIT, 3DCORBIT, 3DWALK…),
   ViewCube, estilos visuales y ocultación (HIDE), vistas guardadas, 3DPOLY, sólidos.
3. **Regla dura:** en planta nada cambia. La vista en planta sigue el camino de código de hoy (camino
   rápido) y las figuras de la landing salen idénticas byte a byte.
4. **Idea central:** una proyección paralela lleva cada plano a la pantalla por una **afinidad**.
   Una entidad plana se dibuja, se designa y se referencia con su geometría 2D de siempre, pasada por
   la afinidad de su plano. El núcleo sigue siendo `Vec2`.

## 1. Lo que dice AutoCAD 2026 (verificado en la ayuda)

GUID: `help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/GUID-….htm` (ESP para español;
`AutoCAD-DXF` para las páginas de DXF).

| Tema                 | Hecho                                                                                                                                                                                                                                                                                                                   | GUID                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| -VPOINT              | Un punto de vista: «as if the viewer is looking from the point back at the origin». Rotate: `Enter angle in XY plane from X axis` y `Enter angle from XY plane`. Por defecto, brújula y trípode. es `-PTOVISTA`: Punto de vista, Girar, Brújula y trípode.                                                              | 1E89B0D5-BFE2-4D2C-8396-07929A9416E8                                       |
| VPOINT               | **En 2026 abre el cuadro Viewpoint Presets** (Absolute to WCS / Relative to UCS, ángulo desde X y desde el plano XY, Set to Plan View). es `PTOVISTA`.                                                                                                                                                                  | 82771983-982A-4F34-886E-FDAC966DF16D, CED8024D-3594-4F09-825F-0E8BD7CE33EB |
| WORLDVIEW            | Entero, en el dibujo, **inicial 1**: la entrada de VPOINT es relativa al WCS.                                                                                                                                                                                                                                           | 10E07536-F859-4253-B393-44DAF3E41D26                                       |
| VIEWDIR              | Vector 3D de solo lectura, en el dibujo, inicial `0,0,1`, **expresado en el UCS**: la cámara como desplazamiento desde el objetivo.                                                                                                                                                                                     | 30ED47BF-A7B7-4331-B1AF-976FCCD0FBCB                                       |
| VIEWTWIST            | Real de solo lectura: el giro de la vista respecto al WCS.                                                                                                                                                                                                                                                              | 5357731F-8FC6-4413-A7B2-3E152CD3127B                                       |
| -VIEW                | `?`, Delete, **Orthographic** («restores the predefined orthographic view… based on UCSBASE», WCS por defecto, «zooms to the extents»), Restore, Save, sEttings, Window. es `-VISTA`, Ortogonal.                                                                                                                        | 21738F8B-82B0-4911-A215-227EB54FCE5D                                       |
| Vistas predefinidas  | Top, Bottom, Front, Left, Right, Back y SW / SE / NE / NW Isometric («mirando la caja desde arriba, hacia la esquina inferior izquierda: SW»). es Superior, Inferior, Frontal, Izquierda, Derecha, Posterior; Isométrico SO/SE/NE/NO.                                                                                   | 232D690A-BA50-4E73-8EA1-E5A0812310D3                                       |
| UCSORTHO             | Entero, **en el registro, inicial 1**: al restituir una vista ortogonal, el plano XY del UCS se alinea con la vista.                                                                                                                                                                                                    | A8E18ED4-F2FA-4D8D-9FEA-7F19DA3D3B43                                       |
| PLAN                 | Vista ortogonal del plano XY del UCS actual, de uno guardado o del WCS. «PLAN changes the viewing direction; it does not change the current UCS».                                                                                                                                                                       | 3779DF52-AA24-47D2-B72C-018D4A9011DD, 224DFABD-0FC9-4932-88D5-A99AFC521E5B |
| UCS                  | 3 puntos: origen, eje X, plano XY; sin Z, la Z actual. X / Y / Z: giro por la regla de la mano derecha. **ZAxis**: origen y un punto del Z positivo; Object: Z tangente en el extremo más cercano, apuntando fuera. **View**: XY perpendicular a la línea de mira, X e Y horizontal y vertical. Face: caras de sólidos. | 0BE49DA1-B323-4758-B49B-4C497D194C7A                                       |
| Alambre 3D           | «The XY plane of the current UCS operates as a work plane… also determines the plane of operation for trimming and extending, and offsetting. **The Z axis of the UCS determines the axis direction for rotating objects about a point.**»                                                                              | 84E193D7-A18D-4EE2-B978-19E4AFBCAEEC                                       |
| Altura de objeto     | «The orientation of the UCS when the object was created determines the Z direction.» La altura va en la dirección de la normal.                                                                                                                                                                                         | 65C72A8C-2B2E-4CCD-B596-5D14B3742035                                       |
| OCS (DXF)            | Línea y punto en WCS (su 210 es solo la dirección de extrusión); círculo, arco, texto, atributo, inserción, polilínea 2D, LWPOLYLINE, sombreado: puntos en el OCS + elevación; cota, mezcla. El OCS de una normal es único.                                                                                             | AutoCAD-DXF D99F1509-E4E4-47A3-8691-92EA07DC88F5                           |
| 3DORBIT              | «If you drag the cursor horizontally, the camera moves parallel to the XY plane of the WCS. If you drag the cursor vertically, the camera moves along the Z axis.» No se editan objetos mientras dura. Temporal: Mayús + rueda pulsada y mover. Clic derecho: menú de opciones.                                         | 85CE824C-0AF4-4890-8487-ADBC92BF08F1                                       |
| Arbitrary Axis (DXF) | Si `abs(Nx) < 1/64` y `abs(Ny) < 1/64`, `Ax = Wy × N`; si no, `Ax = Wz × N`; normalizar. `Ay = N × Ax`.                                                                                                                                                                                                                 | AutoCAD-DXF E19E5B42-0CC7-4EBA-B29F-5E1D595149EE                           |

Capturas: `Current view direction: VIEWDIR=0.0000,0.0000,1.0000` /
`Specify a view point or [Rotate] <display compass and tripod>:` y, tras responder,
`Regenerating model.` (manual de 3D del Hartnell College; foro de Autodesk, documento del CAL).

## 2. Punto de partida en el código

- `Camera` = `scale` + `translation` + `xAxis` (`application/Viewport.ts`); `CameraTransform`
  (`scene/types.ts`) con `worldToScreen(Vec2)`. PLAN ya gira la vista (VIEWTWIST). La vista no se
  guarda en el dibujo.
- `worldToScreen` tiene ~160 llamadas (85 en `SceneBuilder`, 50 en tools); no hay un único punto de
  proyección. `screenToWorld` ~24, `worldToView` 9.
- Designación y referencias en planta: `closestOnEntity(entity, worldPoint)`, `entityInView` para la
  ventana.
- Z 2.5D terminada: `elevation`, `deltaZ`, `thickness`, `entityZAt`, `onPlaneOf`, `carryPlane`,
  `coplanar`; `Ucs` = origen `Vec3` + `xAxis` `Vec2`. `Vec3` solo tiene `sub3`, `withZ`, `planar`.
- `DRAWING_FILE_VERSION = 22`.

## 3. Decisiones

**D1. Solo proyección paralela y comandos de línea.**

- `-VPOINT`: punto de vista y Rotate (dos ángulos). WORLDVIEW 1 fijo: la entrada es relativa al WCS.
  El `<display compass and tripod>` no se ofrece (Intro deja la vista), desviación anotada.
- `VPOINT` ejecuta la secuencia de `-VPOINT`, como ATTDEF y BLOCK con sus cuadros no construidos.
- `-VIEW`: solo Orthographic y las isométricas. `?`, Delete, Restore, Save, sEttings y Window
  esperan a las vistas guardadas. `VIEW` (el View Manager) igual que VPOINT: su línea de comandos.
- PLAN pone la línea de mira en la Z del UCS elegido (hoy solo gira).
- **3DORBIT** (`3DO`, `ORBIT`) entra: es cómo se mueve la vista a diario, y Mayús + rueda es memoria
  muscular. Arrastre horizontal: gira alrededor de la Z del WCS; vertical: sube o baja la cámara;
  la Z sigue vertical en pantalla. El objetivo, el centro de lo visible. Proyección paralela (la
  perspectiva no entra). Sin el menú contextual ni la limitación a lo designado (anotados).
- Fuera: PERSPECTIVE, CAMERA, DVIEW, 3DFORBIT, 3DCORBIT y el resto de la navegación, ViewCube,
  estilos visuales, HIDE.

**D2. La cámara es una base ortonormal**, no un ángulo: `right`, `up` y `dir` (hacia el observador)
en el WCS, más `scale` y `translation`. `xAxis` pasa a ser `right`. La planta del WCS es
`right = X`, `up = Y`, `dir = Z`. Con `dir ≠ ±Z`, `up` es la proyección de la Z del WCS (VIEWTWIST
0); mirando por ±Z, la de hoy (PLAN fija `right`). ZOOM Previous guarda la base entera. La vista
sigue sin guardarse en el dibujo.

**D3. Una afinidad por plano.** `planeProjection(camera, normal, elevation)` devuelve la afinidad
2×3 del OCS de ese plano a la pantalla. `SceneBuilder` dibuja cada entidad plana con la de su plano:

- línea y polilínea: sus puntos por la afinidad;
- círculo → primitiva elipse; arco → arco elíptico (la imagen afín de un círculo);
- texto: la primitiva `text` gana una matriz lineal opcional (inclinación), en los dos presentadores
  (`setTransform` en canvas, `transform` en SVG);
- sombreado y cota: sus trozos por la afinidad.

LINE, que no es plana, proyecta cada extremo con su Z. Si la afinidad es una semejanza (planta,
girada o no), se sigue el código de hoy: **las instantáneas SVG de la landing no cambian** (criterio
de aceptación de F2). El grosor de línea no se transforma: las primitivas siguen en pantalla.

**D4. La altura de objeto se dibuja**: la entidad a su elevación y a elevación + altura, a lo largo
de su normal, más las aristas que las unen: LINE, un cuadrilátero; PLINE, una arista por vértice;
ARC, las dos de sus extremos; CIRCLE, dos círculos (las generatrices de contorno, sin verificar: V4).

**D5. El cursor en una vista 3D** es el rayo de la línea de mira cortado con el plano de trabajo (el
XY del UCS a ELEVATION). Si ese plano se ve de canto, no se puede señalar y se dice con el mensaje
de AutoCAD (V5); lo tecleado sigue funcionando. Ortho, Polar, rejilla y OTRACK siguen en el plano
del UCS (lo que ya hacen). La cruz del cursor sigue derecha en pantalla (desviación que ya existe).

**D6. Designar y referenciar en una vista 3D, en pantalla.** Para una entidad plana, el cursor se
lleva a su plano con la inversa de su afinidad, se usa la consulta 2D de siempre
(`closestOnEntity`, cada proveedor de referencias) y el resultado vuelve a la pantalla para medir en
píxeles. Una entidad vista de canto (afinidad singular) se mide sobre su contorno teselado en
pantalla. La ventana y la captura prueban ese contorno contra el rectángulo; ZOOM Extensión / Objeto
usan sus límites en la vista. Apparent Intersection pasa a ser lo que su nombre dice: la
intersección en pantalla. En planta, el código de hoy.

**D7. La rejilla y el icono del UCS en una vista 3D.** La rejilla, en el plano XY del UCS, por su
afinidad; de canto no se dibuja. El icono 2D, con sus brazos X e Y proyectados, y el lápiz roto
cuando el plano XY se ve de canto (V3).

**D8. Normal por entidad** (`normal?: Vec3`, ausente = +Z, como DXF 210). Las entidades planas
guardan sus puntos en el OCS de su normal (algoritmo del eje arbitrario, en `geometry/`) más la
elevación, como DXF. ELLIPSE y SPLINE también (DXF las guarda en el WCS; se convierte al exportar).
LINE sigue en el WCS; su normal es solo la dirección de la altura de objeto. `carryOverrides` /
`carryPlane` llevan la normal; `coplanar` compara normal y elevación.

**D9. Una transformación 3D genérica** `transformEntity(entity, similarity3)`: la nueva normal es la
rotación de la vieja, y lo que pasa dentro del plano es una semejanza 2D (el OCS nuevo frente al
viejo), que se aplica con las funciones 2D de hoy. Camino rápido: normal +Z y transformación que
conserva Z → las funciones actuales. MOVE / COPY / STRETCH desplazan en 3D; SCALE, uniforme en 3D;
**ROTATE gira alrededor de un eje paralelo a la Z del UCS** y **MIRROR refleja en el plano que
contiene la línea y la Z del UCS** (hoy, con el UCS horizontal, es lo mismo).

**D10. El UCS inclinado**: `Ucs` = origen + `xAxis` + `yAxis` (`Vec3`, Z = X × Y).

- Opciones nuevas: X, Y (giros, como Z), ZAxis (origen y punto del Z positivo; Object), los 3
  puntos con Z (se quita la desviación de hoy), View que inclina en una vista 3D, OBject con la
  normal del objeto. Face no: no hay sólidos.
- UCSORTHO 1 fijo: `-VIEW` Front, Left… alinea el UCS con la vista (UCSBASE = WCS, fijo).
- ELEVATION sigue siendo relativa al UCS; vuelve a 0 al pasar al WCS.

**D11. Los tools trabajan en el marco del plano del UCS.** Con el UCS inclinado, el runtime presenta
a los tools el mundo expresado en el OCS de la Z del UCS (una transformación rígida `F`): los puntos,
las entidades del documento, la designación, las referencias, el UCS y la cámara del overlay. Lo que un
tool ejecuta vuelve al WCS con `F⁻¹` en `ctx.execute`. Con el UCS horizontal `F` es la identidad y
nada cambia.

- Una entidad cuya normal es la Z del UCS tiene en ese marco **exactamente sus coordenadas OCS**: es
  una entidad 2.5D corriente, sin conversión. Las demás se convierten con D9 (en caché por versión
  del documento y UCS).
- Así las reglas 2.5D valen respecto al plano del UCS sin tocar cada tool: TRIM / EXTEND proyectan
  al XY del UCS (PROJMODE 1), OFFSET trabaja en él, FILLET / CHAMFER / JOIN exigen coplanaridad,
  los objetos nuevos llevan la normal del UCS.
- Los tools con geometría plana (TRIM, EXTEND, BREAK, OFFSET, FILLET, CHAMFER, JOIN, HATCH, cotas,
  grips que no son de mover) filtran los objetos no paralelos al plano del UCS: no se iluminan
  (AutoCAD proyecta algunos con PROJMODE; desviación anotada).
- **Por qué este marco y no el UCS mismo:** AutoCAD pide los puntos en el UCS y guarda cada objeto
  en el OCS de su normal (`acdbUcs2Ent`); dibujar en el OCS de la Z del UCS es escribir ya en esas
  coordenadas. En ese marco el UCS queda horizontal (origen y eje X girados en el plano), que es
  justo el caso que todo el código de hoy ya resuelve.
- **Alternativa descartada:** convertir punto a punto dentro de cada tool (~40 tools, y cada uno una
  ocasión de olvidar la conversión; el error solo se ve con el UCS inclinado).

**D12. Las desviaciones 2.5D que se levantan:** CIRCLE 3P y ARC por tres puntos a distinta Z, en el
plano de los tres puntos (con su normal); CIRCLE 2P, a verificar (V7); FILLET y CHAMFER de dos
líneas inclinadas coplanarias en 3D, en su plano. **JOIN sigue sin la polilínea 3D** (3DPOLY queda
fuera): se corrige el roadmap.

**D13. Fichero:** `DRAWING_FILE_VERSION` 23 con `normal` y los ejes 3D de los UCS (actual, con nombre).
Los anteriores cargan con normal +Z y UCS horizontales.

## 4. Fases (un commit en main por fase, cada una con typecheck + lint + test en verde)

**F1. Matemática y cámara, sin cambio visible** — hecha (`Camera` = `direction` + `right`,
`Viewport.setView`, `isPlan` guarda la aritmética 2D de hoy; `geometry/ocs.ts` con
`arbitraryAxis`). `Vec3` (`dot3`, `cross`, `normalize3`…),
`arbitraryAxis(normal)`, semejanzas 3D; la cámara como base (D2) y `worldToScreen(Vec2 | Vec3)`.
Aceptación: todo igual, instantáneas incluidas.

**F2. Ver.** `-VPOINT` / `VPOINT`, `-VIEW` Orthographic e isométricas (sin UCSORTHO aún), PLAN con
línea de mira; la afinidad por plano (D3), la primitiva de texto con matriz, la altura de objeto
(D4), la rejilla y el icono (D7), ZOOM Extensión en la vista. Pruebas con el harness sobre las
primitivas; comprobación en el navegador.

**F3. Trabajar en una vista 3D.** El cursor en el plano de trabajo (D5) y el mensaje de canto;
designar, iluminar, ventana y captura, referencias y OTRACK, grips (D6); 3DORBIT y Mayús + rueda. Pruebas: una LINE dibujada
en SE Isometric da los mismos puntos que en planta; se designa un círculo elevado.

**F4. Normal por entidad.** Modelo y fichero (D8, D13), `transformEntity` (D9), arbitrario `entity`
con normales y `expectSameShape` que las compara; escena, designación y referencias ya generales
desde F2–F3. Filas del palette (Normal X/Y/Z, V8).

**F5. UCS inclinado.** D10 y D11 (el marco en `ToolContext`), UCSORTHO en `-VIEW`, ROTATE y MIRROR
respecto al UCS, D12. Pruebas: CIRCLE en el UCS Front, TRIM en él, ROTATE alrededor de su Z.

**F6. Cierre** (§8).

## 5. Pendientes de verificar (con la opción ya elegida)

| #   | Duda                                                                                 | Opción elegida mientras tanto                                                               | Fase  |
| --- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | ----- |
| V1  | Texto de `-VIEW` Orthographic y cómo se teclean las isométricas (`_SWISO` en macros) | `Enter an option [Top/Bottom/Front/BAck/Left/Right]`; las isométricas como opciones ocultas | F2    |
| V2  | Valores por defecto de -VPOINT Rotate                                                | Los ángulos de la vista actual entre `< >`                                                  | F2    |
| V3  | Icono 2D en una vista 3D (lápiz roto de canto, visto desde abajo)                    | Brazos proyectados; lápiz roto de canto                                                     | F2    |
| V4  | Círculo con altura de objeto: ¿generatrices de contorno?                             | Dos círculos, sin generatrices                                                              | F2    |
| V5  | Mensaje al señalar con el plano de canto (EN / ES)                                   | `Pointing in edge-on UCS is prohibited.` (de memoria: sin fuente todavía)                   | F3    |
| V6  | Solicitudes de UCS X / Y / ZAxis                                                     | `Specify rotation angle about X axis <90>`, como la de Z; ZAxis con su Object               | F5    |
| V7  | CIRCLE 2P con puntos a distinta Z                                                    | En el plano del UCS que pasa por el primer punto                                            | F5    |
| V8  | Filas del palette para la normal                                                     | `Normal X`, `Normal Y`, `Normal Z` en Geometry de los tipos planos                          | F4    |
| V9  | Español de todo lo anterior                                                          | Nombres de la ayuda ESP (`-PTOVISTA`, `-VISTA`, `Ortogonal`); solicitudes sin verificar     | F2–F5 |

## 6. Fuera de alcance (se anota en la cobertura)

Perspectiva, CAMERA, DVIEW, el resto de la navegación 3D (3DFORBIT, 3DCORBIT, 3DWALK…) y el menú
de 3DORBIT, ViewCube, estilos visuales, HIDE y la
ocultación; vistas guardadas (VIEW Save / Restore, UCSVIEW); la brújula y el trípode; WORLDVIEW,
UCSORTHO y UCSBASE como variables; UCS Face y Apply; UCSFOLLOW; varias ventanas gráficas; 3DPOLY y
SPLINE 3D; ROTATE3D, MIRROR3D, 3DMOVE y los gizmos.

## 7. Riesgos

- **Regresión en planta.** Se mitiga con el camino rápido (D3, D6, D9) y las instantáneas SVG de la
  landing, que no pueden cambiar.
- **Puntos sin Z en los overlays** (`V.add` devuelve `Vec2`): en planta no se ve y en una vista 3D
  dibuja a Z 0. Se mitiga con la regla `withZOf` que ya existe y una prueba de harness que compara el
  overlay en SE Isometric con lo ejecutado.
- **Coste de D11**: convertir el documento con el UCS inclinado. En caché, y la mayoría de las
  entidades (las del plano del UCS) no se convierten.
- **Rendimiento de la escena en 3D**: una afinidad por entidad, sin teselar salvo de canto.

## 8. Cierre

- Filas de `docs/autocad-coverage.md`: PLAN, UCS, ZOOM, ROTATE, MIRROR, CIRCLE, ARC, FILLET, CHAMFER,
  referencias, rejilla, UCSICON y las nuevas (VPOINT, -VIEW); el roadmap (punto 2 hecho).
- `cad-engine.instructions.md`: la normal y el OCS, `transformEntity`, la afinidad por plano.
- `cad-runtime.instructions.md`: la cámara como base, el cursor en el plano de trabajo, designar en
  pantalla, el marco del UCS.
- `cad-tools.instructions.md`: los tools trabajan en el marco del plano del UCS; qué filtran.
- Borrar este documento.
