---
"@mellowcad/engine": minor
---

SPLINE keeps each point's Z, as AutoCAD does: a spline may now lie in no plane. `SplineEntity`'s `points`, `startTangent` and `endTangent` are `Vec3`s (in the object coordinates of its normal; a spline has no `elevation` of its own), so a host that builds one by hand gives them a `z`. One whose points lie in a tilted plane is kept in that plane, its normal that plane's. Drawing files are version 37; older ones load as they were.
