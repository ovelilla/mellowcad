---
"@mellowcad/engine": minor
---

Construction lines and rays (`XlineEntity`, `RayEntity`, among `Entity`'s types): XLINE with its Hor, Ver, Ang (and Reference), Bisect and Offset (Through) options, and RAY, in every language; drawn across the view however it is panned or zoomed, the model never clipped; left out of the extents; picked, windowed (by what the view shows of them) and snapped (END at a ray's start, MID at an xline's base, NEA, PER, INT); their grips and the Properties palette's Basepoint, Second point and Direction vector rows; TRIM, BREAK, EXTEND, FILLET and CHAMFER leave rays and lines of them as AutoCAD does; OFFSET, MOVE, COPY, ROTATE, SCALE, MIRROR, STRETCH, LIST and HATCH take them; EXPLODE, DIVIDE and AREA refuse them in AutoCAD's words. A DXF opens and saves its XLINE and RAY objects. Drawing file version 62.
