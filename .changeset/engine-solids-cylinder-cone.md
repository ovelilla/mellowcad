---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

CYLINDER and CONE, as AutoCAD 2027 asks them: the base by its centre and radius or diameter, 3P, 2P, Ttr or Elliptical, the height, 2Point or Axis endpoint, CONE's Top radius, with their refusals and shared defaults. The solid kernel gains curved geometry: an edge's `BrepCurve` may be a `circle`, an `ellipse` or an apex's `point`, a face's `BrepSurface` a `cylinder` or a `cone`; area and volume are exact for them, and `brepMapped` takes the map's scale. `CylinderPrimitive` and `ConePrimitive` join `SolidPrimitive`. A solid draws ISOLINES' rulings on its curved faces and is picked and windowed by them; it snaps at its circles' centres and quadrants and a cone's apex. EXPLODE refuses a solid with a curved face (no surface object yet). Drawing file version 45. The editor's Modeling drop-down gains Cylinder and Cone.
