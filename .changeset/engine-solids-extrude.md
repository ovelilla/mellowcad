---
"@mellowcad/engine": minor
---

EXTRUDE, as AutoCAD 2027 asks it: the set of closed profiles (circles, ellipses, closed polylines and splines, regions; what it cannot sweep sifted out as Enter closes it), MOde, then the height or Direction, Taper angle and Expression; each profile becomes a solid of the current layer, its sides the faces ACIS makes (planes, cylinders, cones, elliptical cylinders, extrusions of splines), exact in volume and MASSPROP; DELOBJ erases, keeps or asks about the profiles. A solid now carries what swept it (`Solid3dEntity.sweep`, `SolidSweep`), which LIST shows as `Solid type = Extrusion` with its height, taper and box; the kernel's B-rep gains spline edges, extrusion and revolution surfaces and a face's domain (file version 47).
