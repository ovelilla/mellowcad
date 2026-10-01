# Usabilidad 3D: rastreo en Z, ViewCube y vistas a un clic — brief

> **Estado:** propuesto, pendiente de aprobar. Hay que fijarse sobre todo en D5, D9, D10 y D14. Sigue la convención de
> `docs/next-*.md`: se borra cuando la feature esté en main, y lo que deba perdurar se promueve a
> `.github/instructions/` (§8).
>
> **Para quién:** quien implemente (tú o un agente). Ante un hueco, se elige lo que haga AutoCAD 2026
> y, si no está documentado, lo más estándar; se anota aquí y se sigue. Lo que quede sin verificar se
> marca **unverified** en `docs/autocad-coverage.md`.

## 0. Resumen

1. **Alcance:** las tres cosas que faltan para trabajar en una vista 3D sin teclear coordenadas:
   - **trazar en Z con el ratón**: la guía `+Z` / `-Z` del rastreo polar, de Ortho y (V1) del rastreo
     de referencias, con la longitud tecleada sobre ella;
   - **el ViewCube**: caras, aristas y esquinas, arrastre, flechas, Inicio, brújula, menú del cubo,
     menú SCP y NAVVCUBE;
   - **las vistas predefinidas a un clic** desde la barra de arriba, junto con 3DORBIT.
2. **Fuera:** la perspectiva y todo lo que cuelga de ella, el cuadro Parámetros de ViewCube,
   SteeringWheels, ShowMotion, los estilos visuales, las vistas con nombre y el SCP dinámico.
3. **Regla dura:** en planta nada cambia. La guía en Z solo existe cuando la Z del SCP no apunta a la
   línea de mira, así que en planta (la del SCU o un PLAN) no hay guía nueva y se sigue el código de
   hoy. Las instantáneas SVG de la landing salen idénticas byte a byte. El ViewCube es cromo del
   editor y la landing no lo monta.
4. **Idea central:** el motor decide y la interfaz pinta.
   - El rastreo en Z es una dirección más del pipeline de precisión. Se mide en píxeles de pantalla,
     como ya se miden la designación y las referencias fuera de la planta.
   - El ViewCube es un modelo puro en `cad/application/` (partes, direcciones, giro, cara adyacente,
     brújula, Inicio) que expone su geometría ya proyectada en `EngineState`. Un componente React la
     dibuja en SVG y devuelve ids de parte.

## 1. Lo que dice AutoCAD 2026 (verificado)

GUID: `help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/GUID-….htm` (`ESP` para el español;
los GUID son los mismos). Las capturas son del propio producto, tomadas de las páginas de la ayuda
(`…/AutoCAD-Core/images/GUID-….png`).

### Rastreo en Z

| Tema                   | Hecho                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | GUID                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| POLARMODE              | Bits de medida polar (0 absoluta / 1 relativa), de rastreo de referencias (0 solo ortogonal / 2 con los ángulos polares), de ángulos adicionales (4) y de adquisición (8 con Mayús). Nota: «In an AutoCAD 3D environment, a tracking vector parallel to the Z axis of the UCS is also displayed, and the tooltip displays +Z and -Z for the angle depending on the direction along the Z axis.» es: «también se muestra un vector de rastreo paralelo al eje Z del SCP… indica +Z y -Z para el ángulo». | D91628CC-9975-4DBF-8D02-10B23A6F3ED5 |
| Rastreo polar          | «In 3D views, polar tracking additionally provides an alignment path in the up and down directions. In that case, the tooltip displays a +Z or -Z for the angle.» es: «En las vistas 3D, el rastreo polar proporciona además una trayectoria de alineación en las direcciones arriba y abajo… +Z o -Z». Ortho y Polar no pueden estar a la vez; PolarSnap y la referencia a rejilla tampoco.                                                                                                            | 7EC3C63D-EA4E-4E65-A676-C3A3627E3F19 |
| Ortho                  | «In 3D views, Ortho mode additionally restricts the cursor to the up and down directions. In that case, the tooltip displays a +Z or -Z for the angle.» Se ignora al teclear coordenadas o con una referencia a objetos. es: «limita adicionalmente el cursor a las direcciones arriba y abajo».                                                                                                                                                                                                        | C3B5D7B3-8057-4D8B-A3A2-0F5F0778BF37 |
| Opciones › Dibujo      | «Display Polar Tracking Vector… In a 3D view, a polar tracking vector parallel to the Z axis of the UCS is also displayed, and the tooltip displays +Z or -Z». TRACKPATH: 2 oculta el vector polar y 1 el de pantalla completa.                                                                                                                                                                                                                                                                         | 33A0F8E8-9981-4111-AD73-128B20D7975C |
| Rastreo de referencias | Trayectorias horizontales, verticales o polares desde los puntos adquiridos; «use direct distance to specify points at precise distances along alignment paths from the acquired object snap point». **No menciona la Z.**                                                                                                                                                                                                                                                                              | 665DC37F-8C3E-414A-9369-72A13C0BE07A |
| Pestaña Rastreo polar  | «Track Using All Polar Angle Settings: …the cursor tracks along polar alignment angles from acquired object snap points». Medida absoluta (SCP) o relativa al último segmento.                                                                                                                                                                                                                                                                                                                          | D7CBB7B0-9140-4C53-88EF-08EAA09FA9D7 |
| Distancia directa      | «The direct distance that you enter is measured along the path from the last point to the current location of the cursor.» No está disponible mientras se mantiene pulsada la tecla de anulación temporal de Ortho, del rastreo polar o del de referencias.                                                                                                                                                                                                                                             | BF4A06D8-2D66-427D-9460-B62A479B22B4 |
| Distancias y ángulos   | «When the cursor is locked to an angle with Ortho mode or polar tracking is on, this method is an efficient way…». Una anulación de ángulo `<30` se impone a la rejilla, a Ortho y a PolarSnap; las coordenadas y las referencias se imponen a ella.                                                                                                                                                                                                                                                    | 92BDE481-49D0-4AED-A6C5-0B78051EAE99 |
| Entrada dinámica       | En el segundo punto y los siguientes, la entrada de puntero es polar relativa por defecto (`#` para la absoluta).                                                                                                                                                                                                                                                                                                                                                                                       | 3EBD4C17-F0A5-49FA-B131-4AABE2E727DB |

Fuera de la ayuda:

- El artículo de soporte «Ortho mode or Polar tracking do not draw lines correctly» (2026-09-18) dice:
  «With Ortho Mode enabled, lines may be drawn toward the negative Z-axis instead of remaining on the
  XY plane». Confirma que Ortho va a Z.
- En el foro, el hilo «Lock axis when moving objects» (2022) dice: «Ortho mode doesn't work for this—
  when my reference point is too high, it thinks I want to move my object vertically». Ortho elige Z
  según dónde esté el cursor en pantalla.

### ViewCube

| Tema                    | Hecho                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | GUID                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| NAVVCUBE                | «Indicates the current viewing direction. Dragging or clicking the ViewCube rotates the scene.» Al hacer clic, «rotate and fill the window with the entire model or an object selected in the view». El botón Inicio lleva a una vista de tres cuartos o a la definida, con ajuste a la ventana. Solicitud: `Enter an option [ON/OFF/Properties] <ON>:`. es: `Indique una opción [ACT/DES/Propiedades] <ACT>:`. Properties abre el cuadro Parámetros.                                                                                                                                    | 3889B35C-790A-4C95-9DF2-174CB956D227                                       |
| Acerca del ViewCube     | Está en una esquina, sobre el modelo, inactivo (semitransparente) hasta que el cursor pasa por encima. Se puede pulsar, arrastrar, elegir una vista predefinida, girar la vista o ir a Inicio. La brújula, debajo, marca el Norte: «click a cardinal direction letter… to rotate the model, or click and drag the compass ring to interactively rotate the model around the pivot point».                                                                                                                                                                                                | E6D3896C-AF39-4F5C-A57C-CACE2A1117F9                                       |
| Reorientar la vista     | **26 partes**: 6 caras (vistas ortogonales), 8 esquinas (vistas de tres cuartos sobre tres lados) y 12 aristas (media vista sobre dos lados). El contorno es discontinuo fuera de las 26 y continuo en una de ellas. El arrastre lleva a una vista libre y, con «snap to closest view», salta a la predefinida más cercana. El pivote es el centro de la vista, el del objeto designado o el de la extensión de los designados. En una vista de cara: **dos flechas de giro** (90° en cada sentido alrededor del centro de la vista) y **cuatro triángulos** hacia las caras adyacentes. | A90F5F1C-B338-4BDE-9D05-F26BFFE3B3A5                                       |
| Girar una vista de cara | «A face view must be currently displayed or the roll arrows are not available.» Las flechas están arriba a la derecha del cubo.                                                                                                                                                                                                                                                                                                                                                                                                                                                          | FE48272A-16DE-4A26-8815-6BB10E9D12BB                                       |
| Cara adyacente          | «Click one of the triangles displayed near the edges of the ViewCube tool.» Solo en una vista de cara.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | E31F60D9-D01F-4956-B302-FE031540C5EE                                       |
| Menú del ViewCube       | Home, Parallel, Perspective, Perspective with Ortho Faces, Set Current View as Home, ViewCube Settings, Help. es: Inicio, Paralelo, Perspectiva, Perspectiva con caras ortogonales, Definir vista actual como inicio, Parámetros de ViewCube, Ayuda. Se abre con el botón derecho sobre el cubo, la brújula o el botón Inicio (D5915037-962E-48BC-A1B7-0C6BC28682F3).                                                                                                                                                                                                                    | 3CE31F02-64A5-4BB8-9461-4C4F659C63B7                                       |
| Vista Inicio            | Una vista especial **guardada con el modelo**. Los dibujos posteriores a 2008 la definen con «Top/Left/Front orientation». El botón Inicio está **sobre** el cubo. Para cambiarla: botón derecho › Set Current View As Home (55926AF1-68DE-4F22-97D0-512381D22682). Para restaurar la de fábrica: Opciones › Thumbnail Preview Settings › Reset Home To Default (9106759E-7F4C-4F52-B7DC-F7C2F44431DA).                                                                                                                                                                                  | 6EC30815-871F-4E2A-B95E-78C239B83370                                       |
| Menú SCP del cubo       | Debajo del cubo, con el nombre del SCP actual. Permite restaurar un SCP con nombre, pasar al SCU o crear uno nuevo («rotate the current UCS based on one, two, or three points»), que se llama **Unnamed** / **Sin nombre**. Solo se listan los SCP con nombre (FAQ 4E83F0C5-C237-4494-8E36-6238DDFA9BCA). El cubo se orienta con el SCP actual o con el SCU. Captura: `WCS ▾` › ✓WCS / UCS1 / New UCS.                                                                                                                                                                                  | 00815EB6-B218-410D-AF53-A5241BB53AA0                                       |
| Cuadro Parámetros       | Posición en pantalla (NAVVCUBELOCATION), tamaño (NAVVCUBESIZE, Automático), opacidad inactiva (NAVVCUBEOPACITY) y mostrar el menú SCP. Al arrastrar: forzar a la vista más cercana. Al pulsar: zoom a la extensión tras el cambio, transiciones suaves y orientar al SCP actual (NAVVCUBEORIENT). También: mantener la escena vertical y mostrar la brújula (Norte = NORTHDIRECTION). **Captura: todo marcado por defecto, «Top Right», 50 %.**                                                                                                                                          | 78043EE2-114B-4F08-BFD7-7E5E429708A9                                       |
| NAVVCUBEDISPLAY         | Entero, **guardado en el dibujo**, valor inicial 3. 0: oculto. 1: solo en estilos 3D. 2: solo en estilos 2D. 3: en ambos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 0D362177-000F-4722-83D8-0B808F4A4C97                                       |
| NAVVCUBELOCATION        | Registro, inicial 0: 0 arriba a la derecha, 1 arriba a la izquierda, 2 abajo a la izquierda, 3 abajo a la derecha.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 37832360-B7F4-4C03-8FDD-54C21D2383E2                                       |
| NAVVCUBEORIENT          | Registro, inicial **1**: el cubo refleja el SCP actual (0, el SCU).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 34A9363D-2578-4CBF-B9CC-3B4452DE8FB3                                       |
| NAVVCUBEOPACITY / SIZE  | Registro. La opacidad inicial es 50 (0 la oculta hasta pasar el cursor). El tamaño inicial es 4, Automático (0 pequeño, 1 normal, 2 grande, 3 diminuto).                                                                                                                                                                                                                                                                                                                                                                                                                                 | 629F5CDF-9266-4614-AC67-A022181CFF1B, 775F24B6-7044-43DF-8967-A5C6EE930758 |
| Proyecciones            | Paralela, Perspectiva y Perspectiva con caras ortogonales. Al cambiar de vista se conserva la proyección.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | D0A753CB-5A5A-48E2-AA28-5DC8DCCE2093                                       |
| UCSORTHO                | Registro, inicial 1: alinea el SCP «when an orthographic view is restored».                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | A8E18ED4-F2FA-4D8D-9FEA-7F19DA3D3B43                                       |

¿Sigue el ViewCube a UCSORTHO? **Las fuentes se contradicen** (V5):

- **Sí.** El artículo de soporte «Polylines disappear or draw on the wrong plane in a 3D view»
  (2026-08-06) dice: «set UCSORTHO to 1 so orthographic ViewCube views align the UCS automatically». Lo
  matiza en la misma página: «When UCSORTHO is off, an orthographic ViewCube view _may not_ align the
  UCS».
- **No.** Kent Cooper, en el hilo «Can you turn on a grid for side views/elevations» (2024), responde a
  quien gira la vista con el cubo: «setting the UCS to the View option… you would need to do so every
  time you change direction… change your point of view by way of the UCS, rather than the view cube,
  and the grid will come along». Y en «Polyline command acting up when drawing on rotated UCS via the
  viewcube» (2021) describen unas vistas «created by clicking on the view cube. Enter UCS > View >
  … Save»: el clic no había tocado el SCP.

### Acceso visual a las vistas

| Tema                         | Hecho                                                                                                                                                                                                                                                                                                                                                                                  | GUID                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Controles de ventana gráfica | Arriba a la izquierda de cada ventana, tres etiquetas: `[+] [Top] [2D Wireframe]` (es `[+] [Superior] [Estructura alámbrica 2D]`). «Click Top to choose between several standard and custom views». El `+` maximiza la ventana, cambia la configuración y muestra u oculta las herramientas de navegación. Lo controla VPCONTROL (registro, 1) (61017FE1-B409-4DCA-948F-4B09903992C7). | 69482C47-5BF4-4AEE-9AB8-3904F4300C20 |
| Vistas predefinidas          | Top, Bottom, Front, Left, Right, Back y SW / SE / NE / NW Isometric. es: Superior, Inferior, Frontal, Izquierda, Derecha, Posterior e Isométrico SO / SE / NE / NO. Están en View tab › Views panel («The View tab is not displayed by default»), en VIEW y en el ViewCube.                                                                                                            | 232D690A-BA50-4E73-8EA1-E5A0812310D3 |
| Vistas paralelas             | Para elegir una vista predefinida: «View Manager (VIEW), the controls in the upper-left corner of each viewport, the right-click menu of the 3DORBIT command, and the View toolbar»; -VPOINT; PLAN; 3DORBIT.                                                                                                                                                                           | C0FF94FC-8565-4528-93F3-8262FB781AF2 |
| Barra de navegación          | Flota sobre un lado del área de dibujo, enlazada al ViewCube por defecto (encima o debajo de él). Tiene ViewCube, SteeringWheels, ShowMotion, 3Dconnexion, **Pan**, **Zoom** y **Orbit** (botones con desplegable). Comando NAVBAR (90981580-5028-4E74-A117-21EFA734017F).                                                                                                             | 17225A0F-7A50-41B9-8404-7D415518DEFB |
| Menú contextual de 3DORBIT   | Modos de navegación, zoom, Parallel / Perspective, Reset View, **Preset Views**, Named Views, Visual Styles y Visual Aids.                                                                                                                                                                                                                                                             | 3677ED1F-112A-45E5-A7BD-59EFDE849A34 |

## 2. Punto de partida en el código

- **El pipeline de precisión.** `PointResolver.resolve(world: Vec2, snap, anchor: Vec2 | null, forceOrtho,
allowSnapMode)` sigue el orden referencia → rastreo → rejilla → restricciones, y después devuelve la Z
  con `withZ(…, snap.z o ucs.origin.z + ELEVATION)`. Las restricciones trabajan en `Vec2`
  (`ConstraintContext`). `getConstraintAnchor()` está tipado `Vec2`, aunque varios tools devuelven un
  `Vec3` (`toolAnchor` ya lee `zOf(anchor)`).
- **`PolarConstraint`.** Elige el ángulo más cercano a partir del cursor crudo. Engancha si la
  distancia perpendicular sobre el plano por `viewport.scale` es de 12 px o menos. Fuera de la planta
  esa medida está escorzada.
- **`OrthoConstraint`.** Compara `|local.x| ≥ |local.y|` en el SCP. No tiene tolerancia.
- **El rastreo de referencias.** `tracking/guides.ts` y `ObjectSnapTrackingEngine`: `TrackingGuide.dir`
  y `TrackingResult.direction` son `Vec2` y llevan `kind: horizontal | vertical | polar`.
- **El dibujo de las guías.** `CadRuntime.buildPolarGuide` dibuja con `aidCamera` la guía polar y
  `commands.feedback.polar`, `Polar: {distance}{unit} < {angle}°`. El rastreo de referencias no tiene
  rótulo.
- **La longitud tecleada.** `withZOf(V.add(start, V.scale(directionFromUcsHeading(ucs, angle),
distance)), start)` está repetido en `LineTool` (×2), `PolylineTool` (×2), `SplineTool` (×2) y
  `PlacementTool` (MOVE, COPY, STRETCH…), y hay una variante en `SelectTool` (alargar con un pinzamiento).
  Los campos de la entrada dinámica tienen un valor vivo `number | null`
  (`DynamicInputController.setLive`), y `resolveValues` lo usa cuando no hay nada tecleado.
- **La vista.** `Viewport` es una base ortonormal (`right`, `up`, `direction`) con `setView(direction,
right)` y `pushHistory()`. `orbit.ts › orbitView(viewport, drag, target)` mantiene la Z arriba.
  `viewPresets.ts` tiene `VIEW_PRESETS` (10, en el SCU) y `lookFrom` (ajusta la extensión con un
  margen de 40 px). `ViewTool` (-VIEW) alinea el SCP en las ortogonales (UCSORTHO 1 fijo). También
  están `OrbitTool` (3DORBIT), `PlanTool` y `VPointTool`.
- **La interfaz.** `CommandBar` (arriba, en el centro) tiene Guardar, Abrir, Zoom ventana, Pan,
  Acercar, Alejar, Zoom previo, Ajustar, Restablecer vista y Línea de comandos.
  - Arriba a la izquierda están la barra de herramientas, Capas, Estilos y Bloques.
  - Arriba a la derecha está `PropertiesPanel`, que solo aparece con una designación.
  - `EngineState` no expone la vista (dirección, vista predefinida) ni la lista de SCP con nombre.
  - `CadEngine` tiene `runCommand(name)` e `invokeToolOption(input)`.
- **El SCP y el fichero.** UCSICON ya tiene ON / OFF con sus letras (es: ACT / DES).
  `DRAWING_FILE_VERSION = 23`.

## 3. Decisiones

**D1. La guía `+Z` / `-Z` del rastreo polar.**

- **Cuándo existe:** solo fuera de la planta del SCP, es decir, cuando la Z del SCP proyectada en
  pantalla mide más de un umbral. En la planta del SCU y en un PLAN no existe, y se sigue el camino de
  hoy.
- **Qué es:** la recta por el ancla a lo largo de la Z del SCP.
- **Cómo engancha:** se mide en pantalla, como cualquier designación fuera de la planta. Si la
  distancia del cursor a la recta proyectada es de 12 px o menos (la misma apertura de hoy), el punto
  es el de la recta más cercano al cursor en pantalla: su posición en planta es la del ancla y su Z,
  la del ancla más `t`.
- **Si engancha también un ángulo del plano,** gana la guía que esté más cerca en pantalla (V2).
- **Rótulo:** `Polar: {distance}{unit} < +Z` (o `-Z`), con una entrada nueva del catálogo (V11).
- **La cruz del cursor no se mueve:** es una restricción, como la polar de hoy.
- **Alternativa descartada:** un ángulo vertical más en la lista polar, con un incremento. No lo hace
  AutoCAD: es una sola guía por eje.

**D2. Ortho en una vista 3D: X, Y o Z.** Fuera de la planta, Ortho bloquea en la recta del SCP (X, Y o
Z por el ancla) que pasa más cerca del cursor en pantalla. En la planta esa regla da lo mismo que
`|x| ≥ |y|`, pero se conserva el código de hoy para que no cambie ni un bit. Lo que vea el usuario es
lo de D1 (`+Z` en la entrada dinámica, D6). Así se reproduce «when my reference point is too high, it
thinks I want to move my object vertically». La regla exacta de AutoCAD no está publicada (V2).

**D3. El rastreo de referencias también tiene guía en Z** desde cada punto adquirido, en 3D (V1).

- **A favor:** la nota de POLARMODE habla de «a tracking vector», y esa variable gobierna a la vez el
  rastreo polar y el de referencias.
- **En contra:** la página de AutoTrack no lo menciona.
- **Cómo funciona:** la Z del punto rastreado es la del adquirido más `t`. Si se cruza con una guía
  del plano de otro punto adquirido, se da la intersección en pantalla, que es la que ve el usuario.
- **Alternativa descartada:** dejar el rastreo de referencias en el plano. Obligaría a teclear `@0,0,h`
  justo en el caso más común en 3D, que es subir desde un extremo.

**D4. Las restricciones devuelven un punto con altura.**

- `ConstraintManager.apply` y `activeRay` aceptan un ancla `Vec3` y devuelven una altura sobre el
  ancla cuando la guía es la Z. El resolvedor la respeta y deja de imponer la del plano de trabajo.
- `getConstraintAnchor()` pasa a tiparse `Vec3 | Vec2`, y la Z del ancla es `zOf(anchor)`.
- Las restricciones reciben la cámara del marco (`frame.viewport`) para medir en pantalla.
- `TrackingGuide` gana `kind: "z"` y `dir` pasa a ser un `Vec3`. `TrackingResult.direction` también
  pasa a `Vec3`: la Z es una dirección del marco.
- Todo sigue en el marco del SCP (`cad-runtime.instructions.md`): allí la Z del SCP es la Z.

**D5. La longitud tecleada sobre la guía** es la distancia directa de AutoCAD: «measured along the path
from the last point to the current location of the cursor».

- **Qué hace:** con el cursor en la guía Z, una distancia `d` da `base + d·(±Z)`, con el signo del lado
  del cursor.
- **Dónde vive:** las seis copias de §2 pasan a un único ayudante,
  `tools/directDistance.ts › pointAlongCursor(ctx, base: Vec3, cursor: Vec3, typed: { distance, angle })`.
  - Si el cursor está en la vertical de la base (misma posición en planta y otra Z: la guía o una
    referencia justo encima), el resultado es `±Z`.
  - Si no, es el rumbo en planta de hoy, conservando la Z de la base (como `@dist<ang`). Esto ya lo
    prueba `elevation.test.ts`.
  - Un ángulo tecleado manda siempre: devuelve el rumbo en planta y descarta la Z (una anulación de
    ángulo se impone a Ortho).
- **El rastreo de referencias tecleado** (`LineTool.commitOffsetStart`) usa la dirección `Vec3` de D4.
- **Consecuencias:** LINE traza la vertical. PLINE y SPLINE proyectan sobre su plano, como hoy
  cualquier punto fuera de él. MOVE, COPY y STRETCH desplazan en Z.
- **Alternativa descartada:** que el runtime convierta la distancia en un clic sintético
  (`placePoint`). Tendría que saber qué campos «distance» son distancia directa y cuáles no (un radio),
  y saltarse la lógica de cada tool.

**D6. La entrada dinámica sobre la guía Z.**

- El campo de distancia muestra en vivo `|t|`.
- El campo de ángulo muestra `+Z` o `-Z` como texto vivo (V3). Para ello `FieldState` gana
  `liveText`, que `resolveValues` no lee como número.
- Al confirmar con el ángulo sin teclear, la dirección es la Z (D5). Si se teclea un ángulo, se vuelve
  al plano.
- La distancia directa sigue sin estar disponible con la tecla de anulación temporal pulsada (lo que
  ya pasa con Mayús).

**D7. La rejilla y PolarSnap sobre la guía Z.**

- La rejilla vive en el plano XY del SCP y no tiene paso en Z, así que no redondea a lo largo de la
  guía (V4). Se decide sobre el cursor crudo, como hoy decide el ángulo polar.
- PolarSnap redondea `|t|` con POLARDIST, igual que en cualquier trayectoria polar
  (`applyPolarSnap`).

**D8. ¿Dónde vive el ViewCube?** Se divide en tres partes:

- **Modelo, en `cad/application/viewCube.ts`.** Es puro, sin DOM y con pruebas en el harness. Contiene:
  - las 26 partes con su id (`top`, `front`, `top-front`, `top-left-front`…) y la dirección de cada
    una en el marco del cubo;
  - la parte actual (para el contorno continuo o discontinuo), el giro de 90°, la cara adyacente,
    Inicio, la brújula y el arrastre (con `orbitView` y forzando a la vista más cercana al soltar).
- **Runtime.**
  - Métodos públicos: `viewCubePick(part)`, `viewCubeRoll(dir)`, `viewCubeAdjacent(side)`,
    `viewCubeHome()`, `setHomeFromCurrentView()`, `viewCubeDrag(start | move | end)` y
    `compassPick(letter)`. `CadEngine` los delega uno a uno.
  - `EngineState.viewCube` lleva:
    - para cada cara visible, sus nueve zonas (cara, aristas y esquinas) ya proyectadas como polígonos
      en una caja de 0 a 1, con su id de parte;
    - la afinidad 2×3 de cada cara, para su rótulo;
    - la elipse de la brújula y la posición de sus letras;
    - la parte actual, si hay flechas de giro o triángulos, y si está visible (NAVVCUBE).
  - Se recalcula solo cuando cambia la base de la cámara o el SCP, nunca por un zoom o un pan.
- **Interfaz, en `components/cad/view-cube.tsx`.** Dibuja esos datos en SVG, resalta la zona bajo el
  cursor (estado visual local), devuelve ids y abre los menús con Base UI. No hace ningún cálculo
  geométrico.
- **Por qué:**
  - `AGENTS.md` y `cad-engine.instructions.md` exigen que `cad/` siga sin DOM y sin estética: el
    motor da números y la interfaz pone píxeles y colores.
  - `ui.instructions.md` pone los controles en React y prohíbe la lógica CAD allí. La proyección de un
    cubo con la cámara es lógica CAD, así que la calcula el motor.
  - Los dos menús del cubo (contextual y SCP) son controles de Base UI, como el menú de referencias a
    objetos, que el runtime gobierna por estado.
- **Alternativas descartadas:**
  - Dibujarlo en el lienzo con `SceneBuilder`, como el icono del SCP. Metería cromo en la escena que
    leen las pruebas, la selección cíclica y la landing (`CadDriver` tendría que ocultarlo, como hace
    con el icono). Además habría que comprobar si el clic cae en el cubo antes de pasarlo al tool, un
    paso nuevo en el orden de los punteros, y los menús tendrían que ser React igualmente.
  - Que React proyecte el cubo: sería geometría en la capa de presentación.

**D9. Qué parte del ViewCube es fiel y viable sin perspectiva.**

| Función                                        | Decisión                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Clic en caras, aristas y esquinas              | **Sí.** Dirección de la parte en el marco del cubo, que es el **SCP actual** (NAVVCUBEORIENT 1). Arriba queda la Z del marco; en las caras Superior e Inferior, la Y del marco, como en PLAN. Ajusta la extensión, o la de lo designado si hay algo («or an object selected»). Cada clic es un paso de ZOOM Previo. **No cambia el SCP** (D10). |
| Arrastrar para orbitar                         | **Sí.** Como 3DORBIT, con la escena siempre vertical («Keep scene upright», marcado por defecto) y el pivote en el centro de la vista o de lo designado. Al soltar cerca de una de las 26 vistas, salta a ella («Snap to closest view», marcado; el umbral es V7). Todo el arrastre es un solo paso de ZOOM Previo. No ajusta la extensión.     |
| Flechas de giro                                | **Sí,** solo en una vista de cara: ±90° alrededor de la línea de mira (VIEWTWIST). La interacción con «mantener vertical» está en V8.                                                                                                                                                                                                           |
| Triángulos de cara adyacente                   | **Sí,** solo en una vista de cara: los cuatro vecinos en pantalla.                                                                                                                                                                                                                                                                              |
| Botón Inicio (encima del cubo) y menú › Inicio | **Sí.** La vista Inicio se guarda en el dibujo (D11) y ajusta la extensión.                                                                                                                                                                                                                                                                     |
| Brújula                                        | **Sí.** N, E, S y O alrededor del cubo, con el Norte en la Y del SCU (NORTHDIRECTION 0 fijo). Al pulsar una letra se mira desde ese punto cardinal conservando la elevación (V6). Al arrastrar el anillo se gira solo el azimut.                                                                                                                |
| Menú del cubo                                  | **Inicio**, **Paralelo** (marcado, la única proyección) y **Definir vista actual como inicio**. Faltan Perspectiva, Perspectiva con caras ortogonales, Parámetros de ViewCube y Ayuda, y se anotan.                                                                                                                                             |
| Menú SCP                                       | **Sí.** Muestra el nombre del SCP actual (`*NO NAME*` se ve como Unnamed / Sin nombre). Las entradas son SCU, los SCP con nombre y **Nuevo SCP**, que lanza `UCS`. Al elegir uno se ejecuta `UCS` › NAmed › Restore, o World, con eco en la solicitud: es un cambio deshacible, como el de hoy.                                                 |
| Inactivo / activo                              | **Sí,** es solo CSS: 50 % de opacidad (NAVVCUBEOPACITY por defecto), opaco con el cursor encima.                                                                                                                                                                                                                                                |
| Contorno continuo o discontinuo                | **Sí,** es un dato del estado (la parte actual o ninguna).                                                                                                                                                                                                                                                                                      |
| Transiciones suaves                            | **No.** Es presentación y requiere animar la cámara; se anota.                                                                                                                                                                                                                                                                                  |
| Perspectiva                                    | **No.** El motor solo proyecta en paralelo.                                                                                                                                                                                                                                                                                                     |
| Variables de colocación                        | Fijas en sus valores por defecto: arriba a la derecha, tamaño automático (uno fijo aquí), 50 % y orientado al SCP. No hay SETVAR.                                                                                                                                                                                                               |

**D10. El ViewCube no aplica UCSORTHO; la barra (D12), sí.**

- **Por qué:** con el cubo orientado al SCP actual (NAVVCUBEORIENT 1, por defecto), alinear el SCP al
  pulsar Frontal haría que el cubo pasara a mostrar SUPERIOR delante. Y un segundo clic en «Frontal»
  miraría desde abajo. Los dos hilos del foro describen ese cubo que no toca el SCP.
- **La otra fuente:** el artículo de 2026 dice lo contrario, con un «may not» (V5).
- **Consecuencia:** después de pulsar Frontal con el SCU, el plano de trabajo se ve de canto y señalar
  da `Pointing in edge-on UCS is prohibited.`, igual que con `-VPOINT 0,-1,0` hoy.
- **Cómo trabajar ahí:** el menú de vistas (D12) ejecuta `-VIEW`, que sí alinea el SCP.

**D11. NAVVCUBE y la vista Inicio en el dibujo.**

- **NAVVCUBE** (alias `CUBE`, V9) responde `Enter an option [ON/OFF] <ON>:`. es: `NAVVCUBE`,
  `[ACT/DES] <ACT>`.
  - Las palabras ON y OFF reutilizan las de UCSICON.
  - Properties se omite porque el cuadro no existe; se anota, como se anotó el cuadro de VPOINT.
  - Se guarda en el dibujo como NAVVCUBEDISPLAY (3 o 0, inicial 3).
- **La vista Inicio:** dirección y arriba en el SCU, guardadas en el dibujo. Por defecto es la de
  «Top/Left/Front», que es SW Isometric (V12). Al restaurarla se ajusta la extensión.
- **Fichero:** `DRAWING_FILE_VERSION` 24. Los dibujos anteriores cargan con el cubo visible y la Inicio
  por defecto.
- **Deshacer:** ni NAVVCUBE ni Definir vista actual como inicio se pueden deshacer, porque son ajustes
  de presentación y no está verificado que U los deshaga (V9).

**D12. Acceso visual a las vistas: lo mínimo fiel en la barra de arriba.**

- **Qué se añade:** dos controles en `CommandBar`, el sitio que `ui.instructions.md` reserva a las vistas
  («file, view and palette visibility»).
  - **Un desplegable de vista.** Equivale al `[Top]` de los controles de ventana gráfica, a la
    galería de la pestaña Vista y a Preset Views de 3DORBIT.
    - La etiqueta es la vista actual: Superior… Isométrico SO, o **Vista personalizada** cuando la
      cámara no coincide con ninguna (V10). Se calcula en el motor (`EngineState.view.preset`).
    - Tiene las diez vistas predefinidas en el orden de la ayuda.
    - Cada entrada ejecuta `-VIEW` con la opción, como las macros de los menús de AutoCAD
      (`_-VIEW _SWISO`): se ve el eco en la solicitud y las ortogonales alinean el SCP (UCSORTHO).
      Va por un único método, `CadEngine.applyViewPreset(id)`, para no componer macros en React.
  - **Un botón Órbita (3DORBIT)** junto a Pan y Zoom ventana. Es la herramienta Orbit de la barra de
    navegación; Pan y Zoom ya están en `CommandBar`.
- **Alternativas descartadas:**
  - **Los controles `[+][Top][2D Wireframe]` arriba a la izquierda.** Esa esquina es de la barra de
    herramientas, y `[+]` y el estilo visual no tendrían nada detrás.
  - **La pestaña Vista de la cinta.** Aquí no hay cinta.
  - **La barra de navegación como franja aparte junto al cubo.** Duplicaría Pan y Zoom, y
    SteeringWheels y ShowMotion no existen.

**D13. Colocación.** El ViewCube va arriba a la derecha (NAVVCUBELOCATION 0), con el botón Inicio
encima, la brújula alrededor y el menú SCP debajo. `PropertiesPanel` baja a la misma columna, bajo el
cubo, con su altura máxima recortada. En AutoCAD la paleta va acoplada fuera del área de dibujo y el
cubo queda en la esquina de esa área: aquí la columna derecha hace de borde.

**D14. Textos.**

- **Motor (`cad/locales/en.json` y `es.json`, después `npm run locales`):**
  - el rótulo polar en Z (`polarZ`, con `{axis}`);
  - `+Z` y `-Z` para la entrada dinámica;
  - NAVVCUBE: su nombre, el alias, la solicitud y las palabras clave (en y es).
- **Interfaz (`messages/en.json` y `es.json`, `Editor.ViewCube` y `Editor.CommandBar`):**
  - los rótulos de las caras en mayúsculas: TOP / SUPERIOR… (V10);
  - las letras de la brújula: N E S W / N E S O;
  - el menú del cubo: Home / Inicio, Parallel / Paralelo, Set Current View as Home / Definir vista
    actual como inicio;
  - el menú SCP: WCS / SCU, New UCS / Nuevo SCP, Unnamed / Sin nombre;
  - las diez vistas y Vista personalizada;
  - el botón Órbita.
- **Las demás lenguas:** se siguen las reglas de `i18n.instructions.md` para el resto de catálogos al
  implementar.

## 4. Fases (un commit en main por fase; cada una con `typecheck`, `lint` y `test` en verde y Prettier fichero a fichero)

**F1. Rastreo en Z (motor) — D1 a D7.** Restricciones y rastreo con la guía Z, el resolvedor, el rótulo,
el ayudante de distancia directa en los seis sitios y el texto vivo de la entrada dinámica. Pruebas con
el harness en SE Isometric:

- Polar y Ortho:
  - LINE con Polar sube a lo largo de `+Z` y una longitud tecleada da `(x, y, z + d)`; lo mismo con
    `-Z`;
  - Ortho elige Z con el cursor alto en pantalla;
  - si engancha un ángulo del plano, gana la guía más cercana.
- Rastreo de referencias: con OTRACK se sube desde un extremo adquirido.
- MOVE y COPY: desplazan en Z con una distancia tecleada.
- Rejilla y PolarSnap: PolarSnap redondea en Z y la rejilla no.
- Cuándo no hay guía:
  - en planta, y en PLAN de un SCP inclinado;
  - en un SCP inclinado, la guía es su Z.
- Sin regresiones: las instantáneas de la landing y `englishSurface` no cambian, salvo la entrada
  nueva del rótulo.

**F2. Vistas desde la barra — D12.** `EngineState.view` (la vista predefinida actual o ninguna),
`CadEngine.applyViewPreset` y el botón 3DORBIT en `CommandBar`, con sus mensajes en y es.

- **Harness:** la vista detectada tras cada preset, tras -VPOINT y tras orbitar; el eco y UCSORTHO.
- **Playwright** (contexto aparte): el desplegable, su etiqueta y que cambia la vista.

**F3. ViewCube, motor — D8 a D11.** `viewCube.ts`, los métodos del runtime, `EngineState.viewCube`,
NAVVCUBE, la vista Inicio en el dibujo y el fichero v24 (migración y pruebas de serialización).
Pruebas con el harness:

- las 26 direcciones respecto al SCU y a un SCP inclinado;
- la parte actual tras -VIEW y después de orbitar;
- el giro y las caras adyacentes, que solo existen en una vista de cara;
- Inicio y Definir;
- arrastrar y soltar cerca de una vista;
- el ajuste a lo designado;
- que el cubo no cambia el SCP;
- la brújula;
- NAVVCUBE ON/OFF, en en y es.

**F4. ViewCube, interfaz — D8, D9 y D13.** `view-cube.tsx`, los dos menús, el botón Inicio, las
flechas, la brújula y la columna derecha. Los mensajes en y es. **Playwright** (`browser.newContext()`
aparte, sin tocar el autosave):

- clic en cara, arista y esquina;
- arrastre;
- menús;
- convivencia con el panel de propiedades;
- el aspecto inactivo y el activo.

**F5. Cierre** (§8).

## 5. Pendientes de verificar (con la opción elegida mientras tanto)

| #   | Duda                                                                                                             | Opción elegida                                                                                                                     | Fase   |
| --- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ |
| V1  | ¿El rastreo de referencias (OTRACK) da trayectorias `+Z` / `-Z` desde los puntos adquiridos?                     | Sí (D3)                                                                                                                            | F1     |
| V2  | Regla exacta con la que Ortho elige Z y con la que Polar desempata entre el plano y Z                            | La recta más cercana en pantalla                                                                                                   | F1     |
| V3  | Qué muestra el campo de ángulo de la entrada dinámica en la guía Z; qué hace un ángulo tecleado                  | `+Z` / `-Z` como texto vivo; un ángulo tecleado vuelve al plano                                                                    | F1     |
| V4  | ¿La rejilla redondea a lo largo de la guía Z?                                                                    | No; PolarSnap sí                                                                                                                   | F1     |
| V5  | ¿Un clic en una cara del ViewCube aplica UCSORTHO? (el artículo de 2026 dice sí; el foro, no)                    | No (D10)                                                                                                                           | F3     |
| V6  | Qué hace un clic en una letra de la brújula                                                                      | Mira desde ese punto cardinal conservando la elevación                                                                             | F3     |
| V7  | Umbral de «Snap to closest view» al soltar el arrastre                                                           | 10° entre la dirección final y la de la vista                                                                                      | F3     |
| V8  | Las flechas de giro en una cara lateral con «Keep scene upright»                                                 | Disponibles en todas las caras, como dice la ayuda                                                                                 | F3     |
| V9  | Alias `CUBE`, nombre español de NAVVCUBE, ¿U deshace NAVVCUBE y Definir Inicio?                                  | `CUBE`; `NAVVCUBE` en es; no se deshacen                                                                                           | F3     |
| V10 | Entradas y orden del menú de vista de los controles de ventana; «Custom View» en/es; rótulos del cubo en español | Diez vistas en el orden de la ayuda; Custom View / Vista personalizada; SUPERIOR, INFERIOR, FRONTAL, POSTERIOR, IZQUIERDA, DERECHA | F2, F4 |
| V11 | Texto exacto del rótulo polar en Z                                                                               | `Polar: 50.0000 < +Z`                                                                                                              | F1     |
| V12 | ¿«Top/Left/Front» es SW Isometric? ¿La Inicio guarda también el encuadre?                                        | SW Isometric; solo la orientación, y ajusta la extensión al restaurar                                                              | F3     |
| V13 | Al pulsar el cubo con objetos designados, ¿se ajusta a ellos?                                                    | Sí («or an object selected in the view»)                                                                                           | F3     |

## 6. Fuera de alcance (se anota en la cobertura)

- **Perspectiva:** PERSPECTIVE y las entradas Perspectiva y Perspectiva con caras ortogonales.
- **Configuración del cubo:** el cuadro Parámetros de ViewCube, NAVVCUBELOCATION, NAVVCUBEOPACITY,
  NAVVCUBESIZE y NAVVCUBEORIENT como variables, y las transiciones suaves.
- **Navegación:** SteeringWheels, ShowMotion, 3Dconnexion, NAVBAR y la barra de navegación como
  elemento propio.
- **Controles de ventana:** VPCONTROL, y los menús `[+]` y de estilo visual.
- **Vistas y SCP:** las vistas con nombre (Custom Model Views, View Manager), el SCP dinámico
  (UCSDETECT), UCSFOLLOW y TRACKPATH.
- **Órbita:** la órbita libre y la continua, y el menú contextual de 3DORBIT.
- **Rastreo:** el rótulo del rastreo de referencias (no existe hoy tampoco), POLARMODE como variable
  y los ángulos adicionales.

## 7. Riesgos

- **Regresión en planta.** La guía Z no existe en planta y Ortho conserva su rama de planta. Se
  mitiga con las instantáneas de la landing, `englishSurface` y las pruebas de LINE y Ortho de hoy.
- **El ayudante de distancia directa** toca seis caminos de cinco tools. Las pruebas actuales de
  longitud y ángulo tecleados (`elevation.test.ts`, `LineTool.test.ts`) deben seguir en verde sin
  cambios.
- **Coste del estado:** si `EngineState.viewCube` se reconstruyera en cada zoom o pan, React
  redibujaría a ritmo de rueda. Se recalcula solo cuando cambia la base de la cámara o el SCP, y se
  cachea.
- **Orden de los punteros:** el cubo es DOM sobre el lienzo, así que sus eventos no llegan al runtime
  y no se toca `keyDown` ni el orden de los punteros. Hay que comprobar con clics reales (Playwright)
  que un arrastre que empieza en el cubo no inicia una ventana de designación.
- **D10:** si V5 resulta ser «sí», cambiar el clic de cara a `-VIEW` es una línea, pero obliga a
  resolver cómo se orienta el cubo con un SCP alineado.

## 8. Cierre

- **Filas de `docs/autocad-coverage.md`:**
  - Polar tracking, Ortho, OTRACK y Dynamic input (la guía Z y la longitud sobre ella);
  - en View, filas nuevas para NAVVCUBE / ViewCube y para el menú de vista y el botón de órbita;
  - la nota de View «none of these has a toolbar button», que deja de ser cierta;
  - Snap mode;
  - el roadmap.
- **`cad-runtime.instructions.md`:** la guía Z en el pipeline (D1, D2, D4) y el modelo del ViewCube en
  `EngineState` (D8).
- **`cad-tools.instructions.md`:** la distancia directa va por `pointAlongCursor` y nunca se reescribe
  en un tool (D5).
- **`ui.instructions.md`:** el ViewCube y la columna derecha en «Where a control belongs», el
  desplegable de vista y el botón de órbita en `CommandBar`, y la regla de que el cubo no calcula
  geometría.
- Borrar este documento.
