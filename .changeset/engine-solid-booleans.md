---
"@mellowcad/engine": minor
---

UNION, SUBTRACT and INTERSECT of 3D solids, as AutoCAD 2027 combines them: a set's solids become its first (its object and properties kept), regions alongside them plane by plane; SUBTRACT joins the first set's solids and takes the second's out; solids apart unite into one of several shells; an empty result says `Null solid created - deleted` and erases them; one undo step. The combined solid has no history: LIST shows `History = None`, `Show History = No` and its bounding box. The engine's own B-rep kernel intersects planes, cylinders, cones, spheres, tori and the swept surfaces in their closed forms, and measures every face exactly, a curved one by Green's theorem over its loops; a pair it has no closed form for is refused with AutoCAD's `1 boolean operation(s) failed.`, the solids left as they were. New catalog keys: the `nullSolid` and `booleanFailed` messages.
