# Z en el modelo (2.5D) — brief

> **Estado:** aprobado para ejecución. Sigue la convención de `docs/next-*.md`: se borra cuando la
> feature esté en main; lo que deba perdurar se promueve a `.github/instructions/` (§8).
>
> **Para quién:** quien implemente (tú o un agente). Las decisiones están cerradas (§3). Ante un hueco,
> se elige lo que haga AutoCAD 2026 y, si no está documentado, lo más estándar (DXF); se anota aquí y se
> sigue. Lo que quede sin verificar se marca así en `docs/autocad-coverage.md`, como ya se hace con el
> español.

## 0. Resumen

1. **Alcance: Z a lo largo de la Z del mundo.** Elevación y altura de objeto por entidad, `x,y,z`,
   ELEV, un UCS cuyo origen tiene Z e ID. La normal de toda entidad sigue fija en +Z (DXF 210 =
   0,0,1), así que el OCS coincide con el WCS y la geometría 2D del núcleo no cambia.
2. **Fuera, al punto 2 del roadmap (vistas):** inclinar el UCS (Face, X, Y, ZAxis, 3 puntos fuera del
   plano), la normal por entidad y VPOINT. Las tres necesitan proyectar 3D → pantalla; separarlas
   deja un UCS en el que no se puede dibujar nada representable.
3. **Modelo de datos: el de DXF.** Una LINE tiene una Z por extremo; las entidades planas, una
   elevación; LINE, CIRCLE, ARC y PLINE, altura de objeto.
4. **Regla dura:** ningún comando pierde la Z en silencio. Lo que solo existe por la Z (PROJMODE,
   Levels…) puede quedar pendiente; conservarla y calcularla bien no.
5. En planta nada cambia a la vista: la Z se lee en el palette, la barra de estado, DIST e ID. Verla
   dibujada es el punto 2.

## 1. Lo que dice AutoCAD 2026 (verificado en la ayuda)

GUID de cada página: `help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/GUID-….htm` (ESP para
español).

| Tema                       | Hecho                                                                                                                                                                                                                                                                                             | GUID                                                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ELEV                       | Dos prompts: `Specify new default elevation` / `Specify new default thickness`; es `Precise nueva elevación por defecto` / `Precise nueva altura de objeto por defecto`. Solo afecta a objetos nuevos. **La elevación vuelve a 0.0 cada vez que se cambia al WCS.** El grosor puede ser negativo. | EE3D7937-2CD7-4F0F-BC8F-0AA0DC306EAE                                                                                                                   |
| ELEVATION                  | Real, **guardada en el dibujo**, inicial 0. «Current elevation of new objects relative to the current UCS». Es la Z por defecto cuando se dan solo X e Y.                                                                                                                                         | E0FE35FA-841A-40D0-8282-1639F9A47107                                                                                                                   |
| THICKNESS                  | Real, **guardada en el dibujo**, inicial 0. RECTANG y TEXT **no** usan el valor por defecto. En texto de una línea solo con fuente SHX.                                                                                                                                                           | 525A7B6F-414C-4EF7-A208-B79D9524DB66                                                                                                                   |
| Tipos con altura de objeto | Sólidos 2D, arcos, círculos, líneas, polilíneas (incl. rectángulos, polígonos, contornos, arandelas), texto (solo SHX), puntos. En el resto no cambia nada. CHPROP: sin efecto en polilínea 3D, cota ni ventana.                                                                                  | 65C72A8C-2B2E-4CCD-B596-5D14B3742035                                                                                                                   |
| Coordenadas 3D             | `x,y,z`; `@x,y,z` relativo; `#x,y,z` absoluto en la entrada dinámica; `*` y `@*` en el WCS.                                                                                                                                                                                                       | AABA8FE7-0E86-4046-96D5-CF5464D5FAC6, 19456F12-A831-4364-ADEC-A712C0AD3EF0, BF012177-168B-4EC0-92F2-1D081DE6EA7C, 8389803D-0B43-49A1-B829-0A794D3E06DD |
| OSNAPZ                     | Entero, **no guardada**, inicial **0: la referencia usa la Z del punto del objeto**; 1 la sustituye por la elevación.                                                                                                                                                                             | 5A49F08E-C0FD-4B38-9253-BC60197E1A60                                                                                                                   |
| PROJMODE                   | Registro, inicial **1: TRIM/EXTEND proyectan al plano XY del UCS**; 0 = 3D real; 2 = plano de la vista.                                                                                                                                                                                           | 8735A062-2688-44A7-809A-9883761533F9                                                                                                                   |
| ID                         | Muestra X, Y, Z en el UCS del punto y lo guarda como último punto (`@`). Con referencia a objeto, la Z es la del objeto. es: `Precise punto`.                                                                                                                                                     | F258AC00-5E9F-4B6B-A670-33F7708E3FB6                                                                                                                   |
| DIST                       | En espacio modelo, distancia 3D; ΔX, ΔY, ΔZ y ángulos relativos al UCS. **Si se omite la Z de un punto, asume la elevación actual.**                                                                                                                                                              | A72EADC7-EF79-463C-B4F1-862C6139B004                                                                                                                   |
| Palette, General           | Fila `Thickness` / es `Altura de objeto`: «no se aplica a todos los objetos».                                                                                                                                                                                                                     | 99AFB412-CEE2-4C12-B7AD-E11E9389BBF9                                                                                                                   |
| RECTANG                    | `[Chamfer/Elevation/Fillet/Thickness/Width]`, es `[Chaflán/Elevación/eMpalme/Alt-objeto/Grosor]`. Elevation y Thickness: «pasa a ser el valor por defecto del dibujo activo hasta que se introduzca otro».                                                                                        | 188B2DDA-6CD8-4D37-BF26-E6CF27C34C75                                                                                                                   |
| JOIN                       | Líneas, polilíneas y arcos: «contiguos y **coplanares**»; resultado, una polilínea.                                                                                                                                                                                                               | 4D2A28C3-3E7F-4830-BE6A-7C9907C95488                                                                                                                   |
| LIST                       | Lista posición X,Y,Z en el UCS, altura de objeto si no es 0 y elevación.                                                                                                                                                                                                                          | 88FFCF22-5F25-48D9-BD43-4F248EFFCE17                                                                                                                   |
| UCS                        | Al dar el origen sin Z se usa la Z actual.                                                                                                                                                                                                                                                        | 0BE49DA1-B323-4758-B49B-4C497D194C7A                                                                                                                   |
| COORDS                     | La barra de estado muestra X, Y, Z; «Z values are always in absolute coordinates».                                                                                                                                                                                                                | 91D3C93C-9C89-4397-B855-92AFD5228422                                                                                                                   |

**Contradicción en la ayuda.** «About Entering 3D Cartesian Coordinates» dice que tras `0,0,5`, un
`3,4` hereda Z = 5 («the Z value is retained as the default»). ELEV y DIST dicen que la Z omitida es
la elevación actual. Se sigue a ELEV/DIST (dos páginas, y las de referencia, frente a una conceptual):
`x,y` absoluto → Z = elevación; `@x,y` relativo → Z del último punto (ΔZ = 0, pura aritmética).

## 2. Punto de partida en el código

- `Vec2` en todo el núcleo; las entidades guardan puntos 2D (`entityTypes.ts`).
- `Ucs` = origen 2D + eje X (`domain/ucs.ts`), ya pensado como sólido rígido sin inclinación.
- `PointResolver.resolve` → `ResolvedPoint.point: Vec2`; `PointerInput.point: Vec2`.
- `parseCoordinate` (`input/coordinateInput.ts`) lee `x,y` y `d<a` con `@`, `#`, `*`; unos 25 tools lo
  llaman con su `lastPoint`.
- `DRAWING_FILE_VERSION = 21`, lector tolerante.
- No hay variables de sistema tecleables (ni SETVAR) ni LASTPOINT global: `@` es relativo al último
  punto del propio comando.

## 3. Decisiones

**D1. Inclinar el UCS pasa al punto 2.** Se reescribe el roadmap. Aquí el UCS gana solo `origin.z`.
UCS 3 puntos con puntos a distinta Z: se proyectan al plano horizontal del origen, como hoy se
descarta el tercer punto que daría la vuelta a Z (desviación hasta el punto 2, con `WHY`).

**D2. Modelo por tipo, como DXF con normal +Z:**

| Tipo                                                                           | Z que guarda                                         | Altura de objeto |
| ------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------- |
| `line`                                                                         | `elevation` (Z del inicio) + `deltaZ` (fin − inicio) | sí               |
| `circle`, `arc`                                                                | `elevation` (Z del centro; DXF 30)                   | sí               |
| `polyline`                                                                     | `elevation` (DXF 38)                                 | sí               |
| `ellipse`, `spline`, `text`, `mtext`, `attdef`, `insert`, `hatch`, `dimension` | `elevation`                                          | no               |

- Todos los campos opcionales; ausente = 0 y no se escribe. Así los dibujos y las instantáneas de la
  landing no cambian.
- `elevation` va en `BaseEntity`: todas las transformaciones la tratan igual.
- `deltaZ` es un **vector** (la regla de «guardar dirección y tamaño como un vector»): mover no lo
  toca, escalar lo multiplica, girar y reflejar lo conservan. Es la fila `Delta Z` del palette.
- `thickness` va **solo** en las cuatro interfaces que la admiten, para que TypeScript la impida en el
  resto. TEXT/ATTDEF no la llevan: nuestra única fuente es TrueType y AutoCAD la ignora ahí.
- SPLINE queda plana (una elevación). La SPLINE 3D espera a un núcleo NURBS 3D; se anota como
  pendiente.

**D3. Un solo punto de paso, no firmas obligatorias** (revisada en F1). Con tipado estructural, un
`Vec3` pasa por `Vec2` y `V.sub` de dos `Vec3` devuelve un `Vec2`: exigir la Z en las firmas no
protege de perderla y obligaba a tocar ~240 llamadas. Lo que sí protege:

- las transformaciones aceptan `Vec2 | Vec3` (2D = plano, Z = 0);
- toda reconstrucción de un objeto a partir de otro pasa por `carryOverrides`, que ahora lleva
  también el plano y la altura de objeto (`carryPlane` para un objeto nuevo en el mismo plano);
- el arbitrario `entity` genera Z y `expectSameShape` la compara.

De paso se corrigió un fallo previo: TRIM/EXTEND, FILLET/CHAMFER, OFFSET, EXPLODE de polilínea,
JOIN y varios grips reconstruían con `createX(..., id)` y perdían color, tipo y grosor de línea.

**D4. De dónde sale la Z de un punto** (el canal de puntos la lleva junto al punto 2D):

- Cursor sin referencia: el plano Z = `ucs.origin.z` + ELEVATION.
- Referencia a objeto: la Z del objeto en ese punto (OSNAPZ = 0 fijo, sin exponer la variable). En
  una LINE se interpola a lo largo.
- Tecleado: `x,y` → elevación; `x,y,z`; `@x,y` → Z del último punto; `@x,y,z`; `d<a` y `@d<a`
  como `x,y`; distancia directa = `@d<a` (conserva la Z del último punto).
- Cilíndricas `d<a,z` y esféricas `d<a<b` (ayuda: About Entering 3D Cylindrical / Spherical
  Coordinates): el parser las admite, porque son la forma estándar de dar una Z.
- Ortho y polar actúan en el plano; no cambian la Z.
- La entrada dinámica acepta la tercera coma en el mismo campo, como AutoCAD.

**D5. Entidades planas con puntos a distinta Z:** el plano pasa por el **primer punto** que fija la
entidad (primer vértice de PLINE y SPLINE, centro de CIRCLE centro-radio, primer punto de 2P/3P,
primera esquina de RECTANG, punto de inserción de TEXT/MTEXT/INSERT, primer origen de una cota). Los
siguientes se proyectan. En PLINE es lo que hace AutoCAD; en CIRCLE/ARC 2P/3P AutoCAD construye en el
plano de los puntos, que exige normal: desviación anotada hasta el punto 2.

**D6. Transformaciones:** MOVE/COPY/STRETCH/PASTE con desplazamiento 3D; SCALE en 3D alrededor del
punto base (elevación, `deltaZ` y altura de objeto × k); ROTATE (eje paralelo a Z) y MIRROR (plano
vertical) conservan la Z; las matrices copian la Z del origen (Levels de ARRAYRECT, pendiente).
STRETCH parcial de una polilínea ignora la ΔZ (es plana, como LWPOLYLINE); en una LINE mueve la Z del
extremo capturado.

**D7. Bloques:** el punto base de BLOCK y el de inserción de INSERT son 3D; los objetos de la
definición se guardan relativos al punto base, también en Z. EXPLODE devuelve las Z compuestas. El
portapapeles guarda un punto base 3D.

**D8. Comandos de edición** (PROJMODE 1 y EDGEMODE 0 fijos, sin exponer):

- TRIM/EXTEND/BREAK calculan en planta (lo que ya hacen) e interpolan la Z del nuevo extremo de una
  LINE.
- OFFSET conserva elevación, `deltaZ` y altura de objeto.
- FILLET/CHAMFER/JOIN exigen coplanaridad (misma elevación y sin `deltaZ`; dos líneas, test 3D) y
  rechazan con el mensaje de AutoCAD. El resultado hereda la elevación y la altura de objeto del
  primero.
- Referencia Intersection: 3D, así que dos objetos que se cruzan en planta a distinta Z **no** la dan.
  Apparent Intersection sigue siendo la proyección.
- Las cotas miden en el plano XY del UCS (lo que ya hacen).

**D9. Creación con ELEVATION y THICKNESS:**

- Los tools de LINE, CIRCLE, ARC, PLINE y POLYGON ponen THICKNESS.
- RECTANG usa sus propias Elevation y Thickness (opciones nuevas, por sesión) en lugar de las
  variables del dibujo.
- TEXT no usa THICKNESS.
- ELEVATION y THICKNESS se guardan en el dibujo y se cambian con deshacer.
- ELEVATION vuelve a 0 cuando el UCS pasa a ser el WCS por cualquier camino: World, Previous, Named
  Restore de uno que coincide, o PLAN… si cambia el UCS.

**D10. Dónde se ve la Z:**

- Palette:
  - `Thickness` en General para los cuatro tipos que la llevan;
  - LINE: `Start Z`, `End Z` y `Delta Z`;
  - CIRCLE, ARC y ELLIPSE: `Center Z`;
  - PLINE y HATCH: `Elevation`;
  - TEXT, MTEXT, ATTDEF e INSERT: `Position Z`.

  Los valores se leen y se reescriben en el UCS (Z − `origin.z`).

- Barra de estado: X, Y, Z.
- DIST: ΔZ, y distancia y ángulos en 3D.
- **ID** (comando nuevo, `ID` en los dos idiomas): muestra X, Y, Z en el UCS.

LIST no entra, porque es un comando con salida por tipo. LASTPOINT global tampoco: ID todavía no
alimenta el `@` de otro comando. Las dos cosas quedan anotadas.

**D11. Fichero:** `DRAWING_FILE_VERSION` 22; se leen `elevation`, `deltaZ`, `thickness`, el
`origin.z` de los UCS (actual, con nombre, Previous si se persiste) y los ajustes `elevation` /
`thickness`. Los ficheros anteriores cargan con todo a 0.

## 4. Fases (un commit en main por fase, cada una con typecheck + lint + test en verde)

**F1. Modelo y fichero** — hecha (versión 22; MATCHPROP copia la altura de objeto).

**F2. Canal de puntos** — hecha (el `origin.z` del UCS se lee y escribe sin cambiar la versión 22;
las cotas ya van en el plano de su primer origen — el del objeto si se designa, el de la base en
DIMBASELINE/DIMCONTINUE —; HATCH sigue a Z 0 hasta F5; el helper de D5 es `onPlaneOf`).

- `ResolvedPoint`/`PointerInput` llevan la Z (D4).
- Las referencias a objeto devuelven la Z del objeto (`snapping/providers.ts`); la Intersection
  pasa a 3D.
- `parseCoordinate` 3D, con cilíndricas y esféricas.
- `CoordinateContext.lastPoint` 3D.
- `Ucs.origin` 3D (UCS Origin, OBject, Named, Previous y `?`).
- Los tools pasan la Z real a lo que crean, con la regla del primer punto (D5).
- Pruebas con el harness: LINE de un punto con Z = 10 por referencia a uno escrito sin Z; PLINE que
  proyecta; MOVE `@0,0,5`; UCS Origin `0,0,3` seguido de `1,1`.

**F3. ELEV y variables** — hecha (ELEV aplica las dos respuestas como un paso de deshacer; Escape
en la segunda no cambia nada; la puesta a 0 al pasar al WCS va en el mismo `UpdateSettingsCommand`
que el UCS; los tools usan `withCurrentThickness`; RECTANG con Elevation 0 deja que la primera
esquina fije el plano).

**F4. Visibilidad** — hecha (las filas Z viven en `EntityProperty` como `ZProperty`, en el WCS;
`runtimeProperties` suma `ucs.origin.z` salvo a `thickness`; `SelectionInfo.general` lleva la fila
`Thickness`; `Delta Z` queda de solo lectura, como `Delta X/Y` en AutoCAD; la `Length` de una LINE
pasa a ser la 3D y retecleada conserva la pendiente; DIST acepta puntos tecleados y escribe su
informe en la línea de comandos, que ahora respeta espacios y saltos; la barra de estado muestra la Z
del plano de elevación; ID se archiva en el grupo `inquiry` de la landing).

- Filas del palette (D10) editables, más `Thickness`.
- Barra de estado con X, Y, Z.
- DIST con ΔZ y la distancia 3D.
- Comando ID.
- Probar en el navegador el palette y la barra de estado.

**F5. Comandos que se topan con la Z.**

- TRIM, EXTEND, BREAK, OFFSET, FILLET, CHAMFER, JOIN, STRETCH, HATCH, cotas y grips (D6, D8).
- Hoy `carryOverrides` copia el `deltaZ` entero a los trozos de una LINE (TRIM, BREAK, grip de
  extremo) y al bisel o arco de FILLET/CHAMFER: hay que reescribir la Z interpolada.
- Arrastrar un grip sin referencia lleva el punto al plano de elevación, igual que un clic (D4).
- Una prueba de harness por comando con objetos a distinta Z.

**F6. Cierre** (§8).

## 5. Pendientes de verificar (con la opción ya elegida)

Se investigan en la fase que los usa: ayuda de 2026, foros de Autodesk con Playwright y aCADemia. Si
no aparece nada, se deja la opción elegida y se marca «unverified» en la cobertura.

| #   | Duda                                                                                          | Opción elegida mientras tanto                                                                                                                                                                                                                                                                                        | Fase |
| --- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| V1  | Texto exacto de ID y DIST (EN/ES), p. ej. `X = … Y = … Z = …`, `Delta Z = …`                  | **Resuelta en EN** (capturas en foros de Autodesk): `X = …     Y = …     Z = …` y `Distance = …,  Angle in XY Plane = …,  Angle from XY Plane = …` / `Delta X = …,  Delta Y = …,   Delta Z = …`. ES **unverified**: `Distancia`, `Ángulo en plano XY`, `Ángulo desde plano XY`; `Precise punto` sí (ayuda ESP de ID) | F4   |
| V2  | Nombres de las filas del palette en ES (`Centro Z`, `Posición Z`, `Elevación`)                | `Altura de objeto` verificada (ayuda 99AFB412); `Inicio Z`, `Fin Z`, `Delta Z`, `Elevación` **unverified** (siguen a las X/Y ya publicadas); Centro y Posición son grupos con una fila `Z`, como las X/Y                                                                                                             | F4   |
| V3  | CIRCLE/ARC 2P/3P con puntos a distinta Z                                                      | Plano del primer punto (D5)                                                                                                                                                                                                                                                                                          | F2   |
| V4  | Elevación de una cota entre puntos a distinta Z                                               | Z del primer origen                                                                                                                                                                                                                                                                                                  | F5   |
| V5  | HATCH con contorno de objetos a distinta Z                                                    | Contorno solo con objetos a la Z del primero hallado; hatch a esa Z                                                                                                                                                                                                                                                  | F5   |
| V6  | Mensajes de FILLET/CHAMFER/JOIN no coplanares                                                 | El de AutoCAD; si no aparece, el más cercano documentado                                                                                                                                                                                                                                                             | F5   |
| V7  | Z de Apparent Intersection y de un punto de OTRACK                                            | La del primer objeto / la del punto adquirido — **unverified**: la ayuda (50383F73, F556F13A) solo dice que la referencia toma la Z del objeto y que Apparent Intersection es la de dos objetos que no se cortan en 3D; los foros no dicen de cuál                                                                   | F2   |
| V8  | SCALE escala la altura de objeto                                                              | Sí (escala 3D uniforme)                                                                                                                                                                                                                                                                                              | F1   |
| V9  | RECTANG Elevation: ¿sustituye la Z del punto?, ¿línea `Current rectangle modes`?, ¿se guarda? | Sustituye si ≠ 0 (con 0, D5) — **unverified**: la ayuda solo dice «Specifies the Z-value for the rectangle»; la línea, verificada en capturas (`Current rectangle modes: Elevation=600.000`), lista solo los modos ≠ 0; por sesión                                                                                   | F3   |

## 6. Fuera de alcance (se anota en la cobertura)

Inclinar el UCS, la normal/OCS por entidad, VPOINT y las vistas (punto 2); SPLINE 3D y 3DPOLY; LIST;
LASTPOINT; filtros de coordenadas (`.X`, `.XY`); OSNAPZ, PROJMODE y EDGEMODE como variables; SETVAR y
variables tecleables; Levels de ARRAYRECT; CHPROP; POINT; ver la altura de objeto dibujada.

## 7. Riesgos

- **Pérdida silenciosa de Z** en un camino que reconstruye un objeto. Se mitiga con D3
  (`carryOverrides` como único paso), con las propiedades de fast-check y con `expectSameShape`.
- **Coste por tool:** unos 25 tools leen coordenadas tecleadas. El cambio es mecánico, pero la regla
  del primer punto (D5) tiene que ser la misma en todos: un helper compartido en lugar de 25
  versiones.
- **Rendimiento:** la Z no entra en el scene builder ni en la selección (planta), así que no hay coste
  al dibujar.

## 8. Cierre

- Filas afectadas de `docs/autocad-coverage.md`: LINE, PLINE, RECTANG, CIRCLE, ARC, MOVE, SCALE,
  TRIM, FILLET, JOIN, HATCH, UCS, DIST, ID (nueva), la entrada dinámica y el palette. Hay que quitar
  «Elevation, Thickness» de lo que le falta a RECTANG y reescribir el roadmap: el punto 1 hecho, y
  las vistas más la inclinación del UCS como siguiente.
- `cad-engine.instructions.md`: hecho en F1 (sección «Z (2.5D)», lista de tipo nuevo).
- `cad-runtime.instructions.md`: el canal de puntos lleva la Z (D4) y el orden de sus fuentes.
- `cad-tools.instructions.md`: la regla del primer punto (D5) y el helper compartido.
- Borrar este documento.
