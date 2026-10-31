---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

REGION, UNION, SUBTRACT and INTERSECT of regions, as AutoCAD 2027 asks and reports them, on the engine's own planar kernel (exact edges: lines, circular and elliptical arcs, NURBS pieces; one tolerance, 1e-6). A new entity type, `RegionEntity` (`"region"` in `EntityType`): faces of loops of edges in the plane of its normal, drawn, picked and snapped by its edges, with grips at its corners and a whole loop's centre; the palette shows Area and Perimeter (`perimeter`), LIST and AREA report it, EXPLODE breaks it up. Drawing file version 42. The editor's tool palette gains Region in Draw and the Solid Editing drop-down (Union, Subtract, Intersect) in Modify.
