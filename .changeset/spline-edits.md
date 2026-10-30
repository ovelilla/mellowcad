---
"@mellowcad/engine": patch
---

TRIM, EXTEND, BREAK and BREAKATPOINT edit a spline as AutoCAD 2027 does, on its own parameter: TRIM's piece is a CV spline on the knots and control points it had there, a broken or extended fit spline stays a fit spline, a closed one opens into one piece across its seam, and a spline in space or at an angle to the UCS is cut in plan. Each edit is one undo step and keeps the spline's properties.
