# PEDIT Fit, Spline y Decurve — brief

> **Estado:** pendiente; la primera entrega de PEDIT (todo menos Fit, Spline y Decurve) está hecha
> (`docs/coverage/modify.md`, PEDIT). Se borra cuando esta entrega esté hecha.

## 1. Objetivo

Que PEDIT ajuste una polilínea como AutoCAD 2027: **Fit** (curva por sus vértices, de arcos),
**Spline** (curva B-spline sobre sus vértices como marco de control) y **Decurve** (deshace los
dos y endereza los arcos), en la 2D y en la 3D (`Spline curve`, `Decurve`). Con ellas llegan las
polilíneas ajustadas que otras entradas dejan en Missing: SPLINE Object (`Select spline-fit
polyline:`), SPLINEDIT de una polilínea ajustada, el Fit/Smooth de la paleta de una 3D (Quadratic,
Cubic) y el Tangent de Edit vertex, que hoy no deja nada.

## 2. Lo que dice la consola (sondas `scripts/research/probes/pedit/`, MPDUMP con vértices)

MPDUMP vuelca ahora los vértices de una polilínea pesada (POLYLINE): posición, bulge, anchos, tipo
de vértice y tangente.

- **Decurve en una polilínea sin ajustar endereza todos sus arcos** (p50): bulges a 0. Con un
  ajuste, quita los vértices añadidos y vuelve al marco, recto (p51, p52, p55).
- **Fit** (p51, p59): la polilínea pasa a POLYLINE `FitCurvePoly`; entre cada par de vértices
  (`SimpleVertex`) inserta uno `CurveFitVertex`, y cada tramo es un par de arcos (bulges): un
  biarco tangente en cada vértice. Las tangentes de Edit vertex Tangent (DXF 50, flag 2) fijan la
  dirección en su vértice (p59: 0° en el primero, 90° en el último); sin ellas, la que AutoCAD
  calcula (por medir: la de la circunferencia por tres vértices, a comprobar con p51).
- **Spline** (p52–p56, p60, p62): `CubicSplinePoly` con SPLINETYPE 6 (por defecto),
  `QuadSplinePoly` con 5 (p53). Los vértices originales quedan como `SplineControlVertex` (el
  marco, que no se dibuja salvo SPLFRAME 1) y se añaden `SplineFitVertex` sobre la B-spline
  uniforme y sujeta del marco: SPLINESEGS (8) por tramo de nudo (p52: 4 vértices, un tramo cúbico,
  9 puntos en 0, 1/8, …, 1 del parámetro; p53: dos tramos cuadráticos, 17). SPLINESEGS negativo
  ajusta arcos en vez de rectas (p54: −4); 2, dos rectas por tramo. Cerrada, periódica (p56).
- **3D** (p55): `Spline curve` igual, con `ControlVertex` / `FitVertex`; Decurve vuelve al marco.
- **Edit vertex en una ajustada** recorre y mueve el marco, y la curva se recalcula (p58: mover el
  vértice 1 a 12,12 rehace los nueve puntos). Width se aplica al marco y a la curva (p60). Join
  de una ajustada no añade nada (p60: `0 segments added to polyline`).
- **SPLINE Object** (p57) convierte la ajustada en una SPLINE de control: los puntos de control son
  el marco y los nudos los uniformes sujetos (`0 0 0 0 1 1 1 1`); es la misma curva.
- Undo de PEDIT deshace el ajuste como cualquier paso (p62).

Falta medir antes de construir: los arcos de Fit sin tangentes (qué tangente elige en cada vértice
interior y en los extremos), SPLINESEGS negativo (cómo ajusta los arcos), Fit de una cerrada, Width
y Edit vertex Insert / Break / Straighten de una ajustada, OFFSET, TRIM, BREAK, EXPLODE, STRETCH y
los grips de una ajustada, y LIST.

## 3. El cambio de modelo (skill `extend-model`, una propiedad)

`PolylineEntity` y `Polyline3dEntity` ganan un campo opcional, ausente en una sin ajustar:

```ts
readonly fit?:
  | { readonly kind: "curve"; readonly tangents?: readonly (number | null)[] }
  | { readonly kind: "quadratic" | "cubic"; readonly segments: number }
```

- **Se guarda lo que se eligió y se deriva lo que se ve** (`cad-engine.md`): `vertices` sigue
  siendo el marco (los vértices que Edit vertex recorre) y la curva se deriva (`polylineFitted`,
  en `domain/`), con los arcos de Fit como bulges y los puntos de Spline sobre la B-spline del
  marco (`geometry/nurbs.ts`, nudos uniformes sujetos). SPLINESEGS se guarda en el objeto, como
  AutoCAD fija los puntos al ajustar (cambiar la variable no rehace las existentes).
- `polylineSegmentGeometries` (la única forma de una polilínea) lee la curva derivada cuando hay
  `fit`: dibujar, designar, medir, enganchar y el contorno ancho la heredan sin tocarlos. Lo que
  edita (Edit vertex, los grips del marco, la paleta) lee `vertices`.
- Las tangentes de Fit son por vértice (DXF 50): Edit vertex Tangent las escribe, Decurve y Spline
  las borran.
- `drawingFile.ts`: versión nueva, lectura tolerante (un `fit` desconocido se ignora). Las
  arbitrarias generan los tres tipos.
- SPLINETYPE y SPLINESEGS, variables de sistema (`SYSTEM_VARIABLES`), guardadas en el dibujo
  (comprobar con OPEN en la consola, `cad-tools.md`).
- Las operaciones que AutoCAD no admite sobre una ajustada (Join, p60) lo dicen como él; las que
  la deshacen (EXPLODE, TRIM: por medir) la reciben ya derivada.

## 4. Fuera de esta entrega

PLINECONVERTMODE (arcos al convertir una spline), PEDITACCEPT, la tolerancia de SPLINE y las
mallas 3D (PEDIT de una malla).
