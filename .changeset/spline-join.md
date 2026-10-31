---
"@mellowcad/engine": patch
---

JOIN joins splines and elliptical arcs as AutoCAD 2027 does: a spline with lines, arcs, polylines, other splines or elliptical arcs that meet its ends becomes one CV spline on each object's own curve, in space too; elliptical arcs of one ellipse become one arc, or the whole ellipse; an arc and an elliptical arc become a new spline. A spline or an elliptical arc picked alone is a source the next objects join, and cLose closes an elliptical arc into its ellipse. Each JOIN is one undo step.
