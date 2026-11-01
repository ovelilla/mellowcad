---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

WEDGE and PYRAMID, as AutoCAD 2027 asks them. WEDGE asks BOX's prompts, its slope down from the first corner, its cube and length along the UCS's X; PYRAMID asks its sides, Edge, Inscribed or Circumscribed, Top radius, Axis endpoint and 2Point, says its sides and Type first and turns its base towards the cursor. The primitives share their defaults (length, width, height, radius, top radius), and a negative cube or length from BOX's or WEDGE's centre is twice as long, as AutoCAD makes it. A solid's primitive is now a union by kind, `SolidPrimitive` (`BoxPrimitive`, `WedgePrimitive`, `PyramidPrimitive`), which LIST and the palette read; LIST's `listSolidType` message takes the kind. Drawing file version 44. The editor's tool palette gains a Modeling drop-down with Box, Pyramid and Wedge.
