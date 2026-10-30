---
"@mellowcad/engine": minor
"@mellowcad/editor": patch
---

3DPOLY draws a 3D polyline, a new entity type (`Polyline3dEntity`, `type: "polyline3d"`) whose vertices each keep their own Z: a host switching over `Entity["type"]` gains a case. The editor's palette offers it beside the splines, as the ribbon's expanded Draw panel does.
