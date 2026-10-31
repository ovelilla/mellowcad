# @mellowcad/engine

## 0.2.0

### Minor Changes

- f480eac: 3DPOLY draws a 3D polyline, a new entity type (`Polyline3dEntity`, `type: "polyline3d"`) whose vertices each keep their own Z: a host switching over `Entity["type"]` gains a case. The editor's palette offers it beside the splines, as the ribbon's expanded Draw panel does.
- 118bbdb: F1 is AutoCAD's Help: the engine asks its host for the help of the running command, by its global name, or for the help's start with none (`CadEngineOptions.onHelp`, `CadDriverOptions.help`); `CadCanvas` hands `onHelp` on, and `CadEditor` opens its `help` links in a new tab. Without a help to show, F1 stays the browser's.
- 8cbb6b6: SPLINE keeps each point's Z, as AutoCAD does: a spline may now lie in no plane. `SplineEntity`'s `points`, `startTangent` and `endTangent` are `Vec3`s (in the object coordinates of its normal; a spline has no `elevation` of its own), so a host that builds one by hand gives them a `z`. One whose points lie in a tilted plane is kept in that plane, its normal that plane's. Drawing files are version 37; older ones load as they were.
- eda1bd1: SPLINEDIT (SPE) edits a spline as AutoCAD 2027 does: Close / Open, Join, Fit data (Add, Close / Open, Delete, Move, Purge, Tangents), Edit vertex (Add, Delete, Elevate order up to 26, Move, Weight), convert to Polyline, Reverse and an Undo of its own per step, each run one undo step. The editor's rail gains Edit Spline in the Modify panel.

### Patch Changes

- a9d7383: The engine's documentation: a README to start from and five guides beside it (`docs/concepts.md`, `host.md`, `drawings.md`, `headless.md`, `languages.md`), and the public methods of `CadEngine` documented for an integrator, as an editor's hover shows them.
- 3755cc8: TRIM, EXTEND, BREAK and BREAKATPOINT edit a spline as AutoCAD 2027 does, on its own parameter: TRIM's piece is a CV spline on the knots and control points it had there, a broken or extended fit spline stays a fit spline, a closed one opens into one piece across its seam, and a spline in space or at an angle to the UCS is cut in plan. Each edit is one undo step and keeps the spline's properties.
- d673436: JOIN joins splines and elliptical arcs as AutoCAD 2027 does: a spline with lines, arcs, polylines, other splines or elliptical arcs that meet its ends becomes one CV spline on each object's own curve, in space too; elliptical arcs of one ellipse become one arc, or the whole ellipse; an arc and an elliptical arc become a new spline. A spline or an elliptical arc picked alone is a source the next objects join, and cLose closes an elliptical arc into its ellipse. Each JOIN is one undo step.
- c22ccae: A spline may carry knots of its own and, on control vertices, weights: `SplineEntity` gains the optional `knotVector` (DXF 40, as AutoCAD holds it, never normalised) and `weights` (DXF 41), which the editing of splines will leave on its pieces. A fit spline with a `knotVector` reads Knot parameterization Custom; a CV spline with `weights` is rational and the palette shows each vertex's Weight. Drawing files are version 38; older ones load as they were.
- 11e075f: OFFSET takes an ellipse, an elliptical arc and a spline lying in a plane, as AutoCAD 2027 does: the copy is a CV spline on the source's own parameter within 0.001 of the exact offset, cut where an inward offset crosses itself, and a round ellipse's a concentric ellipse. Through, Erase, Layer and Multiple work as with any object; each offset is one undo step, and the copy keeps the source's layer, colour and linetype but, as in AutoCAD, not its lineweight.

## 0.1.2

### Patch Changes

- ab2fe60: The package's homepage is its documentation, https://mellowcad.com/docs/engine: the README and the API report, with the examples, on the site.

## 0.1.1

### Patch Changes

- The package's npm page: a description and keywords to be found by, its homepage the engine's
  README rather than the repo's, and where to report a bug.

## 0.1.0

### Minor Changes

- First release: the 2D drafting engine modelled on AutoCAD, its `CadEngine` for a canvas,
  `CadDriver` without one, and its English, Spanish and Arabic catalogs.
