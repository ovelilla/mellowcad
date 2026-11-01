---
description: The CAD engine's layers and model — what each layer may import, entities, the document, purity and ids
paths:
  - "cad/**"
---

# CAD engine rules

Layering and modelling of the DOM-free engine. Runtime plumbing: `cad-runtime.md`; the scene and
its presenters: `cad-scene.md`; writing a tool: `cad-tools.md`; the catalogs: `cad-catalogs.md`.
Adding an entity type, a dimension kind, a property, a style table or a snap type: skill
`extend-model`.

## Allowed dependencies

| Layer            | May import from                                                                       |
| ---------------- | ------------------------------------------------------------------------------------- |
| `geometry/`      | nothing                                                                               |
| `shared/`        | nothing (`Observable`, `wildcard`)                                                    |
| `domain/`        | `geometry/`, `shared/` (`Document.ts` is an `Observable`)                             |
| `scene/`         | `geometry/`                                                                           |
| `serialization/` | `geometry/`, `domain/`                                                                |
| `i18n/`          | nothing but `icu-minify/format` (formatter, keyword and name rules; no catalog shape) |
| `locales/`       | `i18n/` (the catalogs: `en.json`, the generated `en.ts`, `EngineLocale`)              |
| `application/`   | `geometry/`, `domain/`, `scene/`, `serialization/`, `shared/`, `i18n/`, `locales/`    |
| `adapters/`      | everything (the only browser-aware layer)                                             |

`cad/entryPoints.test.ts` checks the table and the packages for product code; tests may import
any layer, `test/` and `scripts/`. The public entry points are the `exports` of `cad/package.json`
(`@mellowcad/engine`): `cad/index.ts` and the language modules `cad/locales/<tag>`. The app
imports nothing else, not even `@mellowcad/engine/locales/types` (that test). `cad/README.md` and
the guides in `cad/docs/` are what an integrator reads: keep them true. Exports carry their types: `engine-package.md`.

## Ids, not display names

- **Every word the engine shows is in `cad/locales/en.json`**: a tool names prompts and keywords by
  id and reads them through `ctx.text`; displayed text is read only through `EngineText` (the
  compiled `cad/locales/en.ts`). Product code imports `en.json` only as a type: a value ships raw.
- **`domain/` exposes ids, never display names** (colours, linetypes, hatch patterns, `ByLayer`);
  data names stay data (layer, style and block names). A failure a user reads is a code
  (`DrawingFileError.code`). Lengths and angles never go through `Intl`: `formatLength` /
  `formatAngle`. The rest: `cad-catalogs.md`.

## No import-time side effects

`cad/package.json` declares `"sideEffects": false`, so a page imports one helper from the barrel
(`readSavedDrawingSummary`, `matchCommands`) without the engine. A top-level registration, patch or
global write is silently dropped from a bundle not using the module's exports. The locale is passed
explicitly, never held in a module-level registry.

## Ports

Cross-layer contracts live in `application/ports.ts` (`EngineHost`, `DrawingStore`,
`FileTransport`, `Clipboard`): the engine asks the host, it never reaches for the browser. **A
capability the app has belongs to the engine, behind a port; only the _mechanism_ (Blob,
`<input type=file>`, `navigator.clipboard`, localStorage) lives in `adapters/`.**

## Conventions

- `geometry/` and `domain/` are pure: no I/O, no mutation of inputs, no hidden state — **except
  the id counters** (`nextEntityId`, `nextLayerId`) and the memos of `hatchGeometry` and
  `polylineCurve`. Entity helpers
  return new objects and either keep the id (in-place edit) or mint one (`*Copy` helpers).
- Angles are **radians CCW from +X** in `geometry/` and `domain/`; degrees only at the UI boundary.
  Normalise with `normalizeAngle` / `normalizeDegrees` (`geometry/primitives`): a hand-rolled
  `deg + 360` lands a tiny negative angle on exactly 360 (ESLint).
- `ArcEntity` is **always CCW from `startAngle` to `endAngle`**: a transform that reverses
  orientation (mirror) reflects _and swaps_ the angles.
- Polyline `bulges[i]` is AutoCAD's `tan(θ/4)` for segment `i`; mirroring negates them.
- Polyline `widths[i]` is segment `i`'s start and end width (DXF 40 / 41), none at all is no array;
  a constant width is derived (`polylineConstantWidth`). SCALE scales widths. **Anything that
  rebuilds a polyline from another carries them** (`createPolyline`'s sixth argument; spreads; a
  cut takes the width where it is cut, `polylineSpan`'s `widths`; a new corner segment runs from
  the width before it to the width after, `cornerObjects.ts`' `joinAtCut`). A wide polyline is an area:
  `polylineOutline` gives its bands, which drawing, bounds, window crossing and `closestOnEntity`
  read. Never derive the edges in a caller.
- A polyline's `linetypeGeneration` (PEDIT's Ltype gen) goes with it into what is made of it
  through `carryOverrides`, as its plane does: `createPolyline` alone drops it.
- `polylineSegmentGeometries()` is the single source of how a polyline is shaped; a closed one
  closes from two vertices too (pline/p227): count segments with `polylineSegments`.
- **A fitted polyline (PEDIT's Fit or Spline, `fit`) is two things** (`domain/polylineFits.ts`):
  its `vertices` are the frame Edit vertex, the grips, STRETCH and the palette edit; what it draws
  is `polylineCurve` (`entityShape` for any entity), which `polylineSegmentGeometries`, length,
  area, the queries, the scene and the snaps read. A Spline's curve is derived; a Fit keeps its
  arcs (`fit.arcs`), as AutoCAD keeps them through a vertex moved (pedit/p152), and is refitted
  only where AutoCAD refits (`polylineRefitted`: Close, Open, a tangent, STRETCH). A command that
  cuts or copies a shape (OFFSET, TRIM, BREAK, EXPLODE) takes `polylineCurve` and makes a polyline
  fitted no more; a frame edit that splices vertices splices `fit.arcs` and `fit.tangents` too
  (`withFitParts`); a transform maps them (`mappedFit`), and a piece built through
  `carryOverrides` never carries `fit`.
- Paint order is `entityDrawOrder()` (only hatches move, behind, HPDRAWORDER 3); `pickAll()`
  sorts by it reversed, then newest first, never nearest (trim/p400): what is on top is what a
  click takes. `pick()` is `pickAll()[0]`; selection cycling relies on it. A type set behind
  another changes that function only.
- **The UCS is only how points and angles are read; it never changes what is stored.** A `Ucs`
  can tilt; `isUpright` guards the 2D formulas, which stay bit-identical for it. Convert at the
  boundary (`ucsPointToWorld` / `worldPointToUcs` and their twins); nothing in `domain/` reads the
  current UCS.

## The entity modules

`domain/entities.ts` is a **barrel of explicit re-exports** over its siblings. They **import each
other directly, never through the barrel** (a cycle), and the list is **explicit**, not
`export *`, so a new public symbol is invisible until named there — which keeps shared helpers
(`hatchLoopRing`, `segmentGeometries`) out of `domain/index.ts` and the package's API.
Dependencies run types → per-type modules → overrides → transforms → queries, with `blocks.ts` and
`hatch.ts` above `entityTransforms.ts`.

## Modelling

- **Locked: drawn, snapped, selected, never edited** (`isEntityEditable`).
- An **area** (a text's box, a SOLID hatch) hit-tests as filled, by the even-odd rule that fills
  it (a nested loop is a hole); a pattern hatch by its lines (`hatchGeometry`).
- **Store a direction-and-size as one vector** (an ellipse's vector to the major-axis endpoint):
  it transforms exactly like a point.
- **A pair of optional fields is a trap TypeScript cannot see.** An elliptical arc's `startParam`
  / `endParam` are present together or not at all, so only the factory decides: spread its result,
  never write them from a transform; `expectSameShape` asserts that _presence_ round-trips.
- **A query with no closed form gets a documented cap, not an open loop**
  (`closestPointOnEllipse`, `MAX_BOUNDARY_CURVES`, `MAX_BLOCK_NESTING`): name the constants and say
  in a comment why the cheap answer is wrong.
- **Store what was picked, derive what is shown**: a dimension's definition points
  (`dimensionGeometry`, `dimensionText`), a hatch's loops (`hatchGeometry`), a reference's block and
  placement (`insertGeometry`), a spline's picks (`splineCurve`). A stored derived value can
  disagree.
- **A spline's own knots and weights are AutoCAD's** (`knotVector`, `weights`: DXF 40 / 41 as its
  NurbsData holds them, a periodic one's one period, never normalised: a piece keeps the
  parameters it had). An edit AutoCAD leaves without fit data goes through `splineWithoutFitData`;
  TRIM's, BREAK's and EXTEND's pieces through `domain/splineEdits.ts` (knot insertion on
  `splineRun`); SPLINEDIT's edits of its fit points, vertices, knots and weights through
  `domain/splineEditing.ts`; OFFSET's copy of a spline or an ellipse through `domain/splineOffset.ts` (Hermite
  spans on the source's parameter, `geometry/curveOffset.ts`, whose exact offset a fillet's centre
  lies on too); JOIN's spline through `domain/splineJoin.ts` (each object's own curve, `joinCurve`,
  joined end to end by `bsplineJoined`, raised by `bsplineElevated`, never refitted). Many nearest
  points on one spline take `splineNearest` once:
  `closestPointOnSpline` tessellates it at every call. A kernel curve may be rational: its derivatives come from `bsplineDifferentials`, never from the
  hodograph of a weighted curve (`bsplineDerivativeCurve` ignores the weights).
- **A region and a solid are the kernel's** (`planarRegions.ts`, `solids.ts`; one tolerance
  `MODEL_TOLERANCE`), drawn, picked and snapped as their edges (`regionLevelEdgeEntities`,
  `regionEdgeEntities`, `solidEdgeEntities`); a solid's isolines (`solidWireEntities`) are drawn
  and picked, never snapped, an apex snapped through `SnapContext.solidPoints`. A boolean is
  `regionBoolean`, never a tool's cut. A solid's points are the WCS's; it moves only by
  `transformEntity` and holds no -0 (`unsigned0`).
- **MTEXT keeps AutoCAD's contents string**, `\P` and escapes included: `mtextPlainText` reads it
  (codes it does not draw vanish from the reading, never from the object), `mtextContents` writes
  it, nothing else parses or builds it.
- **Text is measured by the engine, not a font**: Arial's widths, descent and TEXT's line (not
  MTEXT's 5/3) and the ink in `domain/textFontMetrics.ts`, read from Arimo (SIL OFL, Arial's
  metrics) by `scripts/fonts/metrics.ts`, with AutoCAD's scale (H = 1466 units, text/p301);
  never hand-edited, never from `arial.ttf`: the package ships no number measured from Arial. The
  ink is Arimo's outlines', so boxes differ a little from AutoCAD's (`measureTextInk`'s WHY);
  `measureTextInk` sets TEXT (`textBox`) and MTEXT (`mtextLayout`). Presenters: `cad-scene.md`.

## Blocks

- A reference's shape lives in a **table**, so every query that measures, picks or draws it
  (`entityBounds`, `entityScenePrimitive`…) takes an optional `BlockLookup`: pass
  `document.blockLookup()` (`ctx.blocks`) for every real object. A forgotten one compiles and
  degrades _visibly_, to the insertion point.
- Objects on layer 0 **inherit the reference's layer**; others keep what they had. **ByBlock is not
  modelled**: `resolveEntityColor` and its twins know ByObject and ByLayer, and a third mode
  touches all three.
- `insertGeometry` is what EXPLODE returns, attribute definitions included; what a reference
  **shows** is `insertFlatGeometry` (values for definitions, ATTMODE applied). Attributes and an
  array's parameters (`arrayItems`) are in the **block's** coordinates, so no transform knows
  them; what needs one in the drawing (`insertAttributePoints`, `placeArrayPoint`) places it so.
- A reference scales X and Y apart (Z is |X|); one negative reflects (`insertReflects`). Unequal
  ones place through `linearEntity` (text at X's size); a hatch shown reflected or stretched
  wears `patternFrame`, never stored.

## Algorithms over a set of entities

An algorithm over several entities (`traceBoundaryLoops`) is `domain/`, in **its own module**, a
pure `(point, entities) => result`, so a second command reuses it and it is tested without the
harness. **Which entities it sees is the caller's decision** (AutoCAD's boundary set is what is
visible in the viewport, so the _tool_ filters). Give it a cap: pairwise work is quadratic.

## Dimensions

- **Every transform maps the points through `mapDimensionPoints`**: an optional point (`vertex`,
  `textPoint`) is otherwise inherited untouched, which TypeScript cannot flag.
- `DimensionGeometry` is **one dimension line plus a list of other runs** (`lines`), no per-kind
  field; a line that **curves** sets `arc`, and its grip is `lineMidpoint`, halfway _along_ it.
- `dimensionMeasurement` is **not always a length** (radians for angular): write it through
  `dimensionMeasurementText`, `drawn` or `reported`.
- **Only linear and aligned dimensions are chained or spaced** (`isChainable`, `isSpaceable`;
  `lastDimension` stops at an angular one); where AutoCAD takes another kind, say so on the filter.

## Style tables and registries

- A style _table_ is per drawing: **persist it from the first release of its feature**, even
  without a manager UI, so the manager never changes the file format. A dangling id is remapped onto
  the base (`reconcile`); an undefined block name is **dropped at parse time**.
- Defaults are AutoCAD's _metric_ initial values (acadiso / ISO-25): look each one up.
- A `DIMxxx` variable the Dimension Style Manager holds belongs on **`DimStyle`, not
  `DocumentSettings`**; a plotted size, distance or offset is folded into `scaledDimStyle`;
  `clampDimStyle` is the single gate every edit passes.
- A new style copies another, names are the identity (case-blind; blocks: `findBlockNamed`), and
  **one that is current, in use (a block's is transitive, `blocksInUse`) or the base cannot be
  deleted**.
- A **fragment** (the clipboard, tomorrow WBLOCK) carries every table entry its objects reference,
  through block definitions, as a one-off drawing (`clipboardFile.ts`). Landing it (`planPaste`): **a
  name the target already has wins**, and **only layers and anonymous or other-case blocks are
  remapped** (a layer's id is not its name).
- A _registry_ is per build (`linetypes.ts`, `hatchPatterns.ts`): an entity stores the **name**,
  and an unknown one draws nothing rather than failing the load. Transcribe a definition from
  AutoCAD's, quoted verbatim beside the data; adding one is data only, or the model is wrong.

## Editable geometry (the Properties palette)

`applyEntityProperty` is the single pure entry for retyping a geometry value: it rebuilds with a
spread — never `createX(...)` — so the id and every override survive, and returns `null` for a value
that does not apply or would degenerate the object. A row is typeable by an `edit` descriptor in
`singleEntityInfo`; Z rows are `ZProperty` values in world Z, and `PLANE_ROWS` says which types show
one.

## Z and the normal

Every object but a line and a 3D polyline keeps its points in the **OCS of its normal**
(`domain/elevation.ts`); a spline's carry their own Z in it.
`normal`, `elevation`, `deltaZ` and `thickness` are optional, absent means +Z or 0, and the default
is never stored (`withNormal`, `withElevation`), so a flat drawing's file is unchanged.

- **A 3D transform is `transformEntity(entity, similarity3)`**; a +Z object under a transform that
  keeps Z takes the 2D path. Give a line's ends their Z explicitly (`lineStartZ` / `lineEndZ`): in
  plan a vertical line's ends are one point.
- **Transforms take `Vec2 | Vec3`**, a 2D delta or base being Z = 0. `stretchEntity` moves whole an
  object whose every point is caught, else the Z of a rigid object, of a line's caught end and of
  a spline's or 3D polyline's caught points — nothing else caught in part can tilt. A tilted object
  goes to `transformEntity`.
- **Rebuilding an object from another goes through `carryOverrides`** (overrides _and_ plane and
  thickness; `carryPlane` for a new object sharing only the plane). `createX(..., source.layerId,
source.id)` alone is the bug: it drops colour, linetype, lineweight and Z.
- **A piece cut from a line or grown out of it goes through `carryPiece`** (TRIM, EXTEND, BREAK),
  which re-reads each end with `entityZAt`; a spline's or a 3D polyline's piece is spread from its
  object instead (`splineEdits.ts`), as `carryPlane` would set a 3D piece's Z to its start's; a line
  end moved to a point (a grip) takes its Z with `withLineZ`.
- **Coplanar means `coplanar(a, b)`**, AutoCAD's own test (FILLET, CHAMFER, JOIN, HATCH);
  two lines in a tilted plane are `linesPlaneNormal`.
- **An entity's points are planar; the Z lives only in its fields.** Factories copy `{ x, y }` and
  a spread writing a picked point takes `planar(point)`. `entityZAt` is the one reader of an
  object's Z at a point in plan. **The exceptions are a 3D polyline and a spline.** A 3D
  polyline's vertices (`domain/polylines3d.ts`) are WCS `Vec3`s and it has no plane —
  `withElevation`, `withNormal` and `carryPlane` must never touch it (`shiftEntityZ`,
  `scaleEntityZ` and `entityElevation`, its first vertex's Z, know it); the snaps see it as its
  segments, lines of its id (`snapEntities`). A spline's points and tangents are `Vec3`s in the
  OCS of its normal, with no elevation of its own (`withElevation` shifts them, `entityElevation`
  is its start's Z); a point of its curve carries its Z, which `entityPointToWorld` reads. **Every
  edit that moves one of its points ends in `splineOnItsPlane`**, which keeps one with a plane in
  it (a grip, STRETCH, the palette, SPLINE), so `isLevel` is "lies in a plane". Where a vertical
  segment makes the plan ambiguous, read a point's own Z, never `entityZAt`.
- **The domain's 2D queries read one plane** (`readsInPlan`); drawing, picking, bounds and snapping
  project every object through its plane in `application/` (`planeCamera`, `viewPick.ts`). Objects
  in different planes have no intersection yet.

## Serialization

The reader is deliberately tolerant: skip malformed entities, default missing fields, reject only
files newer than `DRAWING_FILE_VERSION`. Every schema change bumps it and keeps old files loadable.
