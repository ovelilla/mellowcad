---
"@mellowcad/engine": minor
"@mellowcad/editor": patch
---

PEDIT (PE) edits polylines as AutoCAD 2027 does: a line, an arc or a spline turned into one, Close / Open, Join, Width, Edit vertex (Next, Previous, Break, Insert, Move, Regen, Straighten, Tangent, Width), Ltype gen, Reverse, its own Undo per step, and Multiple with Join's fuzz distance and join types; a double-click on a polyline opens it. A polyline gains `linetypeGeneration`, its linetype laid along all of it. The editor's rail gains Edit Polyline, with Edit Spline in its drop-down.
