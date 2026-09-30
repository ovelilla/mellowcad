# UCS — brief

> **Estado:** decidido (2026-09-30; el usuario delegó las decisiones «como lo hace AutoCAD» y «lo que
> menos deuda deje»). Fase 1 hecha salvo PLAN y el giro de la vista (§2, último punto); lo que
> hace cada comando está en `docs/autocad-coverage.md` (Coordinate systems) y las reglas en
> `.github/instructions/`. Se borra cuando PLAN esté en `main`; las fases 2 y 3 ya están en el
> roadmap de la cobertura.
>
> **Fuentes:** ayuda de AutoCAD 2026 ENU/ESP, `https://help.autodesk.com/view/ACD/2026/ENU/?guid=` + GUID:
> UCS `GUID-0BE49DA1-B323-4758-B49B-4C497D194C7A` (la de Mac, `AutoCAD-MAC-Core`, trae la solicitud
> literal), PLAN `GUID-3779DF52-AA24-47D2-B72C-018D4A9011DD`, UCSICON `GUID-EA2D8ACA-336A-4656-BFD3-43BC371C6171`,
> ELEV `GUID-EE3D7937-2CD7-4F0F-BC8F-0AA0DC306EAE`, ELEVATION `GUID-E0FE35FA-841A-40D0-8282-1639F9A47107`,
> THICKNESS `GUID-525A7B6F-414C-4EF7-A208-B79D9524DB66`, About Adding 3D Thickness `GUID-65C72A8C-2B2E-4CCD-B596-5D14B3742035`,
> About the UCS `GUID-E658D5E7-EE5C-4A06-BF34-F71CDB363A71`, About Coordinate Entry `GUID-0A0135DB-3216-482B-81DD-74E6DB8CA3E3`,
> WCS con `*` `GUID-8389803D-0B43-49A1-B829-0A794D3E06DD` y `GUID-AE225073-2ECD-41CC-9B8A-61743E8CFBA9`,
> 3D Cartesian `GUID-AABA8FE7-0E86-4046-96D5-CF5464D5FAC6`, Polar Tracking `GUID-7EC3C63D-EA4E-4E65-A676-C3A3627E3F19`,
> To Display a View of the XY Plane `GUID-224DFABD-0FC9-4932-88D5-A99AFC521E5B`, UCSICON (variable)
> `GUID-BCC7DA63-7F74-4F61-8605-E36A010FD33A`, UCSAXISANG `GUID-C370B5F1-9A62-4394-9973-939BD2071904`,
> UCSFOLLOW `GUID-C07B8F08-8854-4A84-94A6-98C5B9A2522A`, UCSORG `GUID-E74F3E89-C887-44EE-9369-F0ED67607169`.
> Capturas del producto en español: aCADemia «Sistemas de coordenadas» 1.ª–12.ª parte
> (a-cad-emia.blogspot.com, 2014). Paleta Propiedades en SCP: foro de Autodesk «Display properties in
> UCS» (2020) y «Rotate blocks relative to current UCS» (2026).

## 0. La decisión: 2.5D, empezando por el SCP plano; sólidos no

Tres caminos hacia el 3D, medidos por lo que cuesta **cada comando o entidad que se añada después**:

| Camino                                             | Qué toca                                                                                                                          | ¿Crece su coste con cada comando nuevo?                                                                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SCP plano** (origen + giro sobre Z)              | cada punto tecleado, cada ángulo absoluto, Orto/polar/rastreo/rejilla, los valores por defecto de TEXT, INSERT, HATCH, DIMLINEAL… | **Sí, y es la deuda real**: cada herramienta nueva que lee `x,y` o un ángulo es otra que habría que revisar. Hoy son 29 ficheros con `parseCoordinate` y 8 con ángulos absolutos. |
| **Z en el modelo** (ELEVATION + THICKNESS, 2.5D)   | un campo `elevation` y otro `thickness` en `BaseEntity`, el fichero, la paleta, MOVE con Z                                        | Poco: son campos de la base, una entidad nueva los hereda. Pero **no se ven** sin una vista no en planta.                                                                         |
| **Sólidos 3D** (ACIS: B-rep, booleanas, sombreado) | un núcleo aparte (tipo de entidad nuevo, vista 3D, sombreado)                                                                     | **No**: no toca las entidades 2D. Es una decisión de producto, no de deuda; y es un proyecto del tamaño de todo lo hecho.                                                         |

Decisión:

1. **Fase 1 — SCP plano.** Es lo que un delineante 2D usa a diario (girar el SCP a la parcela, dibujar,
   volver a Universal), es visible sin 3D y es donde está la deuda. El SCP es un marco rígido en el
   plano: origen y eje X; su Z es siempre la Z universal.
2. **Fase 2 — Z en el modelo (2.5D)**, con el modelo de DXF: cada entidad plana guarda **una**
   elevación (grupo 38) y un espesor (39) con la normal fija en +Z (el 210 por defecto, que es cuando
   el SCO coincide con el SCU). ELEV, `x,y,z`, filas Elevación y Altura de objeto en la paleta. Una
   LINE con Z distinta en cada extremo no cabe (anotado como hueco).
3. **Fase 3 — vistas** (VPOINT/-VIEW en paralelo), que es lo que hace visibles la elevación y el espesor.
4. **Sólidos: fuera del roadmap.** Ni reutilizan ni abaratan nada de lo anterior.

Las opciones del comando UCS que **inclinan** el plano (Face, X, Y, ZAxis, y un tercer punto que
voltee el eje Z) necesitan las fases 2–3: no se ofrecen, como MTEXT no ofrece Columns.

## 1. El contrato de AutoCAD (lo verificado)

**Qué define el SCP** (About the UCS): el plano de trabajo; las direcciones horizontal y vertical de
Orto, el rastreo polar y el rastreo de referencias; la alineación y el ángulo de la rejilla, los
patrones de sombreado, el texto y las cotas; el origen y la orientación de la entrada de
coordenadas y de los ángulos absolutos. Todas las entidades se guardan en el SCU.

**Entrada de coordenadas:** `x,y` y `d<a` absolutos respecto del origen del SCP, `@` relativo en
ejes del SCP, `#` absoluto en la entrada dinámica, **`*` en el SCU** (`*2,0`, `@*2,0`). Los ángulos
polares son relativos al eje X del SCP.

**`UCS`** (es `SCP`; sin alias en ninguno de los dos `acad.pgp`):

```
Command: UCS
Current ucs name:  *WORLD*
Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:
Specify point on X-axis or <Accept>:
Specify point on the XY plane or <Accept>:
```

```
Comando: SCP
Nombre de scp actual: *UNIVERSAL*
Indique origen de SCP o
   [Cara/gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:
Precise punto en eje X o <Aceptar>:
Precise punto en plano XY o <Aceptar>:
Precise ángulo de rotación sobre eje Z <90>:
Indique una opción [Rest/Guardar/Supr/?]:
Indique nombre para guardar SCP actual o [?]:
Indique nombre de SCP para restaurarlo o [?]:
Indique el nombre del SCP que se suprimirá <ninguno>:
Indique nombre(s) del SCP que enumerar <*>:
Designe el objeto a alinear con el SCP:
```

- Un punto mueve el origen; un segundo gira el eje X hasta él; un tercero orienta el plano XY.
  Enter acepta en cada paso.
- **Z** gira sobre Z (UCSAXISANG, 90 por defecto).
- **NAmed** → Restore / Save / Delete / `?`; los cuatro valen también directamente en la solicitud
  principal. Borrar el actual lo deja como `*NO NAME*`. `?` lista origen y ejes relativos al SCP actual.
- **OBject** (tabla de aCADemia): arco → centro, X hacia el extremo más próximo al punto de
  designación; círculo o elipse → centro, X hacia el punto de designación; línea → extremo más
  próximo, X hacia el otro; tramo recto de polilínea → vértice más próximo, X hacia el otro extremo
  del tramo; arco de polilínea → centro, X hacia el extremo más próximo; spline abierta → extremo más
  próximo, X hacia el otro; spline cerrada → punto de cierre, X hacia la designación; texto, texto
  de líneas múltiples, referencia de bloque → punto de inserción, X por su rotación.
- **Previous**: las 10 últimas de la sesión. **World**. **View**: X horizontal en la vista, mismo origen.
- ELEV «se restablece en 0 cada vez que se cambia al SCU» (fase 2).

**`PLAN`** (es `PLANTA`): `Enter an option [Current ucs/Ucs/World] <Current>:`; ajusta la extensión
del dibujo a la ventana. «PLAN cambia la dirección de la vista, no el SCP.»

**`UCSICON`** (es `SIMBSCP`): `Enter an option [ON/OFF/All/Noorigin/ORigin/Selectable/Properties] <ON>:`
/ `Indique una opción [ACT/DES/Todas/Sin origen/Origen/SEleccionable/Propiedades]:`. UCSICON = 3
(activado, en el origen si se ve; si no, en la esquina inferior izquierda). El icono 3D lleva un
cuadrado en el origen cuando el SCP es el SCU.

**Paleta Propiedades:** en Windows muestra las coordenadas en el SCP actual (en Mac, en el SCU: un
fallo conocido). Las rotaciones de TEXT e INSERT siguen en el SCU; la de MTEXT, en el SCP (2026).

**Deshacer:** H/U deshace un cambio de SCP.

## 2. Diseño (fase 1)

- `domain/ucs.ts`: `Ucs = { origin, xAxis }` (un vector unitario, la regla de «dirección como
  vector»), `WORLD_UCS`, `ucsToWorld` / `worldToUcs` para puntos y direcciones, `ucsAngle`. Puro.
- El documento guarda el SCP actual, su nombre y la tabla de SCP guardados (UCSORG/UCSXDIR y la tabla
  UCS de DXF se guardan en el dibujo); se cambian con un comando deshacible. Previous es de sesión.
- **Un único punto de paso:** `parseCoordinate` recibe el SCP como dato obligatorio (un opcional
  olvidado compilaría), y los ángulos absolutos de la entrada dinámica pasan por un conversor del
  contexto. Los relativos (giros, ángulos incluidos) no cambian.
- Orto, polar, rastreo y rejilla (dibujo y forzado) giran con el SCP; la rejilla y el forzado parten
  de su origen. La lectura de coordenadas es en el SCP.
- Icono SCP dibujado por el `SceneBuilder`; los ejes tintados de la rejilla siguen al SCP.
- Valores por defecto en el SCP: rotación de TEXT, MTEXT, ATTDEF e INSERT; ángulo y origen del
  sombreado; horizontal/vertical de DIMLINEAR; RECTANG; filas y columnas de ARRAYRECT.
- PLAN y la opción View necesitan girar la vista (twist), que toca la selección por ventana y el
  ZOOM: van al final de la fase. **Pendiente.** Lo que pide: `Viewport` con un ángulo de giro
  (`worldToScreen` rota antes de escalar; `Camera` lo guarda para ZOOM Previous); la ventana y la
  captura dejan de ser un rectángulo del SCU alineado (un polígono de cuatro vértices, o probar en
  el marco de la vista); ZOOM Extensión/Ventana en el marco de la vista; la rejilla ya dibuja en el
  SCP y los arcos y elipses se resuelven en pantalla, así que siguen solos; el texto sí necesita
  sumar el giro a su rotación en pantalla. PLAN: `[Current ucs/Ucs/World] <Current>`, ajusta la
  extensión del dibujo; en español `PLANTA`, `[SCP actual/SCP/Univ]` (sin captura: sin verificar).

## 3. Fuera de alcance (a la cobertura)

Face, X, Y, ZAxis y el volteo del eje Z; Apply; las opciones ocultas ORigin, Move, 3point y
orthoGraphic; UCSMAN; el icono seleccionable con pinzamientos (UCSSELECTMODE) y UCSICON All /
Selectable / Properties; UCSFOLLOW; UCSVP; UCSDETECT (SCP dinámico); el `Current ucs name` en paper
space; las rotaciones de la paleta en el SCP para MTEXT.
