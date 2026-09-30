# SPLINE — brief

> **Estado:** implementado (2026-09-30; el usuario delegó las decisiones «como lo hace AutoCAD»). Las
> reglas ya están en `.github/instructions/` y la capacidad en la fila de `docs/autocad-coverage.md`;
> este fichero se borra cuando SPLINE esté en `main`.
>
> **Fuentes:** ayuda de AutoCAD 2026 ENU/ESP, `https://help.autodesk.com/view/ACD/2026/ENU/?guid=` + GUID:
> SPLINE `GUID-5E7D51E2-1595-4E0C-85F8-2D7CBD166A08`, SPLINEDIT `GUID-5530922C-6828-48B1-804C-EDD9053535BD`,
> About Splines `GUID-58316136-30EB-499C-ACAD-31D0C653B2B2`, About Modifying Splines
> `GUID-71F69647-809E-42BA-B65B-357F3FFD0CAA`, To Work With Splines `GUID-2ED701EF-4089-47CF-BEEC-F08DC31B27C2`,
> SPLMETHOD `GUID-300EB1EF-E101-421C-A8B8-6D91E2873787`, SPLKNOTS `GUID-134FD0A1-4396-4748-9FF4-C82B7BC24E28`,
> SPLDEGREE `GUID-40B00336-C1EB-47A4-8773-FFB22B8C931C`, SPLPERIODIC `GUID-60D7953C-E22D-4CF3-B779-F776592A5F23`,
> Object Snap tab `GUID-50383F73-4F23-4F70-B4FC-52D5748D80AF`, EXPLODE `GUID-E98BCEF4-DED6-48A6-87EB-10FE87188083`.
> DXF SPLINE `GUID-E1F884F8-AA90-4864-A215-3182D47A9C74` (`/view/OARX/2026/ENU/`).
> Capturas del producto: foro de Autodesk «Spline, Detailed explanation on How to draw» (2019, ENU);
> aCADemia «Splines» 1.ª–3.ª parte (a-cad-emia.blogspot.com, 2011, ESP).

## 0. Resumen

1. Entidad `spline` con el modelo de AutoCAD reducido a lo que se elige: **método** (ajuste o vértices de
   control), sus **puntos**, grado, parametrización de nudos, cerrada y las tangentes de los extremos. Los
   vértices de control y el vector de nudos de un spline de ajuste se **derivan** (interpolación cúbica);
   no se guardan.
2. Comando `SPLINE` / `SPL` (es `SPLINE` / `SPL`) con Method (Fit/CV), Knots (Chord/Square root/Uniform),
   Degree (1–10), start/end Tangency, Undo y Close.
3. Pinzamientos en los puntos de ajuste o en los vértices de control (y su marco); estirarlos rehace la curva.
4. Referencias: Endpoint, Midpoint, Nearest e Intersection. Paleta: Method, Degree, Knot parameterization,
   Closed, Area. EXPLODE no lo descompone.
5. Fuera de alcance, anotado en la cobertura (§4).

## 1. El contrato de AutoCAD (lo verificado)

**Nombre y alias.** `SPLINE`, alias `SPL` (aCADemia; guía de atajos). En español `SPLINE` (título de la
página ESP con el mismo GUID) y `SPL`. SPLINEDIT es `EDITSPLINE` en español.

**Solicitudes (ENU, captura de 2019):**

```
Command: SPLINE
Current settings: Method=Fit   Knots=Chord
Specify first point or [Method/Knots/Object]:
Enter next point or [start Tangency/toLerance]: t
Specify start tangent:
Enter next point or [start Tangency/toLerance]:
Enter next point or [end Tangency/toLerance/Undo]:
Enter next point or [end Tangency/toLerance/Undo/Close]: t
Specify end tangent:            (y el comando termina)
```

**Solicitudes (ESP, capturas de 2011):**

```
Parámetros actuales: Método=Ajustar   Nudos=Cuerda
Precise primer punto o [Método/Nudos/Objeto]: Método
Introduzca método de creación de spline [Ajustar/VC] <Ajustar>: VC
Parámetros actuales: Método=VC   Grado=3
Precise primer punto o [Método/Grado/Objeto]: Grado
Indique grado de spline <3>: 2
Precise primer punto o [Método/Grado/Objeto]:
Especifique punto siguiente:
Especifique punto siguiente o [Cerrar/desHacer]:
---
Especifique punto siguiente o [iniciar Tangencia/toLerancia]: Tangencia
Precise tangente inicial: @1<0
Especifique punto siguiente o [finalizar Tangencia/…/Cerrar]: Tangencia
Precise tangente final: @1<90
```

Lo que dicen las fuentes de cada opción:

- **Fit** crea siempre un B-spline **cúbico** que pasa por los puntos. LIST da «rango de parámetros» de 0 a
  la suma de las cuerdas y **n + 2** vértices de control para n puntos de ajuste: interpolación global con
  derivadas en los extremos y nudos sin normalizar.
- **Knots**: Chord (proporcional a la distancia), Square root (a su raíz; «centrípeto»), Uniform (iguales).
  SPLKNOTS y SPLMETHOD vuelven a 0 al arrancar (Not-saved): son de la sesión.
- **Tangencias**: se dan con un punto (no con un ángulo); sin ellas «se establecen automáticamente». La de
  inicio solo se ofrece tras el primer punto; la de fin termina el comando.
- **Close** cierra haciendo coincidir el último punto con el primero; por defecto **periódico** (C2 en el
  cierre, SPLPERIODIC = 1). En ajuste, AutoCAD pide entonces una sola tangente para el cierre (aCADemia).
- **CV**: grados 1 a 10; nudos equiespaciados de 1 en 1 (aCADemia). Con menos vértices que grado + 1 el grado
  baja a vértices − 1 (aCADemia; foro 2015: «2 CVs»). Close se ofrece desde el segundo punto.
- **Undo** quita el último punto. Enter termina.
- **Pinzamientos**: cuadrados en los puntos de ajuste o en los vértices de control con el marco; un
  triangular alterna la visualización (y pasar de CV a ajuste lo vuelve de grado 3).
- **Referencias**: Tangent y Nearest citan «spline»; Geometric Center, los splines cerrados.
- **Paleta** (aCADemia): Grado, Tolerancia de ajuste, Plana, Cerrada, Área (sin longitud); y (ayuda) la
  parametrización de nudos y el peso de cada vértice.
- **EXPLODE** no lista el spline entre lo que descompone.
- **DXF**: flags 1 cerrado, 2 periódico, 4 racional, 8 plano; grado, nudos, vértices, pesos, puntos de ajuste,
  tolerancia de ajuste, tangentes de inicio y fin.

## 2. Decisiones

- **Modelo** `SplineEntity { method: "fit" | "cv", points, degree, knots, closed, startTangent?, endTangent? }`.
  `points` son los de ajuste o los vértices de control según `method`, así las transformaciones son un
  `map` y las tangentes se transforman como vectores. `degree` es 3 en ajuste; en CV, el efectivo (ya
  rebajado). `knots` solo cuenta en ajuste. Cerrado en ajuste con tangente: `startTangent` es la del cierre.
- **Curva derivada** (`geometry/nurbs.ts`, puro): nudos de ajuste por cuerda/raíz/uniforme sin normalizar;
  interpolación cúbica con derivadas en los extremos (n + 2 vértices, como LIST); cerrado sin tangente =
  interpolación periódica; cerrado con tangente = abierto de Q0 a Q0 con esa derivada en ambos extremos.
  Derivada por defecto en un extremo sin tangente: la de la parábola por los tres primeros (últimos) puntos
  (Bessel) — AutoCAD no documenta la suya. Módulo de la derivada = longitud de las cuerdas ÷ rango de
  parámetros, así la forma no depende de la escala. CV abierto: nudos 0…0, 1, 2…, k…k (sujetos); CV cerrado:
  periódico uniforme envolviendo los primeros `degree` vértices.
- **Dibujo**: polilínea teselada en coordenadas del mundo (como los arcos de una polilínea con bulges): el
  lienzo no tiene NURBS y un grado > 3 no cabe en un Bézier.
- **Referencias**: Endpoint (inicio y fin; también en un cerrado, su punto de cierre), Midpoint (a mitad de
  longitud), Nearest, Intersection (con segmentos, círculos, arcos y otros splines). Perpendicular y Tangent,
  no (como la elipse).
- **Pinzamientos**: uno por punto de ajuste o vértice; arrastrarlo es un `UpdateEntityCommand`. En CV se
  dibuja el marco del objeto seleccionado. Sin el triangular ni los menús multifunción.
- **toLerance** y **Object** no se ofrecen: la tolerancia > 0 es un ajuste aproximado que Autodesk no
  documenta, y aquí no hay polilíneas de ajuste de spline que convertir. Como las Columns de MTEXT.

## 3. Prompts de la entrada dinámica

`firstPoint`, `nextPoint`, `startTangent`, `endTangent`, `closeTangent` (ENU «Specify tangent», sin verificar),
`splineDegree`. Method y Knots son solicitudes solo de palabras clave con su valor actual por defecto.

## 4. Fuera de alcance (a la cobertura)

toLerance, Object, SPLINEDIT/EDITSPLINE, CVSHOW/CVHIDE, el pinzamiento triangular y los menús multifunción
(añadir/quitar punto, tangente, refinar), pesos (racionales), TRIM/EXTEND/BREAK/JOIN/OFFSET/FILLET/HATCH sobre
un spline, OFFSET y FILLET de la elipse (necesitan OFFSET de spline), Perpendicular/Tangent/Geometric Center,
la línea `Current settings`, BLEND, PEDIT Spline.
