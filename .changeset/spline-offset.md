---
"@mellowcad/engine": patch
---

OFFSET takes an ellipse, an elliptical arc and a spline lying in a plane, as AutoCAD 2027 does: the copy is a CV spline on the source's own parameter within 0.001 of the exact offset, cut where an inward offset crosses itself, and a round ellipse's a concentric ellipse. Through, Erase, Layer and Multiple work as with any object; each offset is one undo step, and the copy keeps the source's layer, colour and linetype but, as in AutoCAD, not its lineweight.
