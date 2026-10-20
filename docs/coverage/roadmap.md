# Roadmap

Agreed ordering. The rule behind it: **close model gaps before command gaps**, because every new
entity type multiplies the "Adding an entity type" checklist that a normal per entity would force
us to walk again, whereas a command costs the same before or after it.

1. **Z in the model (2.5D)** — done: Z along the world's Z with the normal fixed at +Z, stored as
   DXF stores it (what each command does with it is in its entry and under "Where a point's Z comes
   from"). 3D solids (ACIS: B-rep, booleans, shading) are off the roadmap: a separate kernel the
   size
   of everything built so far, which neither reuses nor cheapens any of this — a product decision,
   not a debt.
2. **Views and the tilted plane** — done: parallel views from any direction (-VPOINT, `-VIEW`'s
   presets, PLAN, 3DORBIT) that draw elevation and thickness, a normal per entity with its points
   in their OCS (DXF 210), and the tilted UCS the commands work in (X, Y, ZAxis, three points, View,
   OBject, UCSORTHO). It lifted the 2.5D deviations of CIRCLE 3P, ARC and FILLET / CHAMFER of
   sloping lines. Left, each a gap of its own: perspective and the rest of 3D navigation, saved
   views, UCS Face (no solids) and Apply, grips other than move on a tilted object, the Normal rows
   on types other than circle and arc, Intersection between objects in different planes, PROJMODE's
   projection of objects at an angle to the UCS, and JOIN's 3D polyline (it waits for 3DPOLY).
3. **3D usability** — done: the `+Z` / `-Z` guide of Polar, Ortho and OTRACK with a typed length
   along it, the ViewCube (parts, drag, roll, triangles, Home, compass, its two menus, NAVVCUBE)
   the viewport controls' view menu and the navigation bar (Pan, Zoom, Orbit). Left, each a gap of
   its own: perspective,
   the ViewCube Settings dialog and its variables, SteeringWheels and
   ShowMotion, named views, the dynamic UCS (UCSDETECT), UCSFOLLOW, and the tracking label of
   OTRACK.

Left out of the 2.5D model, each a gap of its own: SPLINE 3D (a 3D NURBS kernel) and 3DPOLY, LIST,
the `.X` / `.XY` point filters, OSNAPZ as a variable, ARRAYRECT's Levels, CHPROP, and POINT's
thickness (with POINT, below).

Editing a spline — OFFSET (which is also what the ellipse's OFFSET and FILLET wait for), TRIM /
EXTEND of one an edge reaches (its own knots), BREAK / JOIN, SPLINEDIT — is a command gap, so it
queues behind the model gap above.

Deferrable indefinitely at no extra cost: PASTEBLOCK/PASTEORIG/CUTBASE, DIMARC, DIMORDINATE, the
modern `DIM` command, POINT with DIVIDE/MEASURE, XLINE/RAY, GROUP, LENGTHEN, ALIGN, per-object
ltscale, isometric drafting mode.

Blocks family, not on the near-term path: ByBlock resolution, non-uniform scale (the ellipse exists
now; what is left is a per-axis scale vocabulary), inserting external drawing files + INSUNITS,
`-BLOCK` Mode keywords, `-INSERT` Basepoint/Corner/XYZ/Explode/Repeat, BASE, WBLOCK, BEDIT, MINSERT,
XREF, BREPLACE, dynamic blocks, DIVIDE/MEASURE with a block, a block table manager, ATTSYNC,
BATTMAN, ATTEXT / DATAEXTRACTION, multiline attributes.

DXF import/export and plot-to-PDF remain end-of-roadmap and unscheduled.
