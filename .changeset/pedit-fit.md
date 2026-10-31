---
"@mellowcad/engine": minor
---

PEDIT fits polylines as AutoCAD 2027 does: Fit (two arcs between each pair of vertices, through any tangent Edit vertex gave), Spline (the quadratic or cubic B-spline of the vertices, SPLINETYPE and SPLINESEGS, negative for arcs) and its 3D Spline curve, and Decurve. A polyline and a 3D polyline gain `fit`: their vertices are then the frame, and they draw as the curve. SPLINE's Object turns a spline-fit polyline into a spline, and SPLINEDIT takes one. SPLINETYPE and SPLINESEGS are system variables saved in the drawing.
