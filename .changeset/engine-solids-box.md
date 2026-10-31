---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

BOX, as AutoCAD 2027 asks it — two corners, Center, Cube, Length, the height or 2Point, its defaults and refusals — making the engine's first 3D solid. A new entity type, `Solid3dEntity` (`"solid3d"` in `EntityType`): a B-rep of the engine's own kernel (vertices, edges with their curve, faces with their surface and loops of coedges) in the WCS, keeping the box it was made as (`BoxPrimitive`); drawn in 2D Wireframe as its edges, picked and snapped by them, carried by MOVE, COPY, ROTATE, SCALE, MIRROR and STRETCH, listed by LIST, measured by AREA, exploded into regions. The palette shows its Geometry and Solid History (`solidType`, `width`, `history`, `showHistory` rows; the `solidHistory` group). `DocumentSettings.isolines` (ISOLINES, saved with the drawing). Drawing file version 43. The editor's tool palette gains Box in Draw.
