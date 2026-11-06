---
"@mellowcad/engine": patch
---

Conceptual cuts a planar face's cells to the face exactly at its edges: a round edge or a hole is no longer stepped past, and the cells stay small along the edges, so the painter's order keeps a hole's walls behind the face round it. A cell is a polygon now, with the holes an edge leaves in it (`path` with `subpaths`), and the mesh has half the cells it had.
