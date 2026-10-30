---
"@mellowcad/engine": patch
---

A spline may carry knots of its own and, on control vertices, weights: `SplineEntity` gains the optional `knotVector` (DXF 40, as AutoCAD holds it, never normalised) and `weights` (DXF 41), which the editing of splines will leave on its pieces. A fit spline with a `knotVector` reads Knot parameterization Custom; a CV spline with `weights` is rational and the palette shows each vertex's Weight. Drawing files are version 38; older ones load as they were.
