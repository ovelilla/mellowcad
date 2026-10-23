---
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
any layer, `test/` and `scripts/`. `cad/index.ts` and the language modules
`cad/locales/<tag>` are the public entry points (tomorrow the package's `exports`): anything React
or the landing needs is exported there, and nothing outside `cad/` imports a deep path, not even
`cad/locales/types` (`cad/entryPoints.test.ts` fails on one). `cad/README.md` is what an integrator
reads: keep it true when a public contract changes.

## Ids, not display names

- **Every word the engine shows is in `cad/locales/en.json`**: a tool names prompts and keywords by
  id and reads them through `ctx.text`; displayed text is read only through `EngineText` (the
  compiled `cad/locales/en.ts`). `CadDriver` imports `en.json` only to check that a keyword id
  exists.
- **`domain/` exposes ids, never display names** (colours, linetypes, hatch patterns, `ByLayer`);
  data names stay data (layer, style and block names). A failure a user reads is a code
  (`DrawingFileError.code`). Lengths and angles never go through `Intl`: `formatLength` /
  `formatAngle`. The rest: `cad-catalogs.md`.

## No import-time side effects

`package.json` declares `"sideEffects": ["**/*.css"]`, which lets a page import one helper from the
barrel (`readSavedDrawingSummary`, `matchCommands`) without shipping the engine. A top-level
registration, patch or global write would be silently dropped from any bundle that does not use the
module's exports. The locale, likewise, is passed explicitly, never held in a module-level registry.

## Ports

Cross-layer contracts live in `application/ports.ts` (`EngineHost`, `DrawingStore`,
`FileTransport`, `Clipboard`): the engine asks the host, it never reaches for the browser. **A
capability the app has belongs to the engine, behind a port; only the _mechanism_ (Blob,
`<input type=file>`, `navigator.clipboard`, localStorage) lives in `adapters/`.**

## Conventions

- `geometry/` and `domain/` are pure: no I/O, no mutation of inputs, no hidden state — **except
  the id counters** (`nextEntityId`, `nextLayerId`: a module-level counter plus `Date.now`). Entity
  helpers return new objects and either keep the id (in-place edit) or mint one (`*Copy` helpers).
- Angles are **radians CCW from +X** in `geometry/` and `domain/`; degrees only at the UI boundary.
  Normalise with `normalizeAngle` / `normalizeDegrees` (`geometry/primitives`): a hand-rolled
  `deg < 0 ? deg + 360 : deg` lands a tiny negative angle on exactly 360 (ESLint fails on it).
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
- `polylineSegmentGeometries()` is the single source of how a polyline is shaped; a closed one
  closes from two vertices too (pline/p227): count segments with `polylineSegments`.
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
- An entity that is an **area** (text, hatch) hit-tests as filled, by the even-odd rule that fills
  it: a nested loop is a hole for picking as for painting.
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
- **MTEXT keeps AutoCAD's contents string**, `\P` and escapes included: `mtextPlainText` reads it
  (codes it does not draw vanish from the reading, never from the object), `mtextContents` writes
  it, nothing else parses or builds it.
- **Text is measured by the engine, not a font**: `domain/textFontMetrics.ts` holds Arial's widths
  and the line TEXT steps by, not MTEXT's 5/3 (generated by `scripts/fonts/metrics.ts`, never
  hand-edited), and `measureTextWidth` is the one measure. The presenters' half: `cad-scene.md`.

## Blocks

- An entity whose shape lives in a **table** (`insert`) makes `closestOnEntity`, `entityBounds`,
  `entityCrossesRect`, `entityWithinRect`, `entitiesBounds` and `entityScenePrimitive` take an
  optional `BlockLookup`. A forgotten call site compiles, so the degraded answer is deliberately
  _visible_ (the insertion point). Pass `document.blockLookup()` (`ctx.blocks`) wherever a real
  object is measured, picked or drawn. `MAX_BLOCK_NESTING` stops a block nested in itself.
- Objects on layer 0 **inherit the reference's layer**; others keep what they had. **ByBlock is not
  modelled**: `resolveEntityColor` and its twins know ByObject and ByLayer, and a third mode
  touches all three.
- `insertGeometry` is what EXPLODE returns, attribute definitions included; what a reference
  **shows** is `insertFlatGeometry` (values in place of definitions, filtered by ATTMODE, carried
  by `document.blockLookup()`). Attributes and an array's parameters (`arrayItems`) are in the
  **block's** coordinates, so no transform knows they exist; what needs one in the drawing
  (`insertAttributePoints`, `placeArrayPoint`) places it as `insertFlatGeometry` does.

## Algorithms over a set of entities

An algorithm over several entities (`traceBoundaryLoops`) is `domain/`, in **its own module**, a
pure `(point, entities) => result`, so a second command reuses it and it is tested without the
harness. **Which entities it sees is the caller's decision** (AutoCAD's boundary set is what is
visible in the viewport, so the _tool_ filters). Give it a cap: pairwise work is quadratic.

## Dimensions

- **Every transform maps the points through `mapDimensionPoints`**: an optional point (angular's
  `vertex`) is otherwise inherited untouched, which TypeScript cannot flag.
- `DimensionGeometry` is **one dimension line plus a list of other runs** (`lines`), no per-kind
  field; a line that **curves** sets `arc`, and its grip is `lineMidpoint`, halfway _along_ it.
- `dimensionMeasurement` is **not always a length** (radians for angular): ask
  `dimensionMeasurementUnit` before formatting; decimals come from `angleDecimalsOf`.
- A kind that is not linear is **excluded where two extension-line origins are assumed**
  (`lastDimension`, `DimensionChainTool`, `DimSpaceTool`); where AutoCAD accepts it and we do not,
  say so in a comment on the filter.

## Style tables and registries

- A style _table_ is per drawing: **persist it from the first release of its feature**, even
  without a manager UI, so the manager never changes the file format. A dangling id is remapped onto
  the base (`reconcile`); an undefined block name is **dropped at parse time**.
- Defaults are AutoCAD's _metric_ initial values (acadiso / ISO-25): look each one up.
- A `DIMxxx` variable the Dimension Style Manager holds belongs on **`DimStyle`, not
  `DocumentSettings`**; a plotted size, distance or offset is folded into `scaledDimStyle`;
  `clampDimStyle` is the single gate every edit passes.
- A new style copies another, names are the identity (case-blind), and **one that is
  current, in use or the base cannot be deleted**.
- A **fragment** (the clipboard, tomorrow WBLOCK) carries every table entry its objects reference,
  through block definitions, as a one-off drawing (`clipboardFile.ts`). Landing it (`planPaste`): **a
  name the target already has wins**, and **only layers and anonymous blocks are remapped** (a
  layer's id is not its name).
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

Every object but a line keeps its points in the **OCS of its normal** (`domain/elevation.ts`).
`normal`, `elevation`, `deltaZ` and `thickness` are optional, absent means +Z or 0, and the default
is never stored (`withNormal`, `withElevation`), so a flat drawing's file is unchanged.

- **A 3D transform is `transformEntity(entity, similarity3)`**; a +Z object under a transform that
  keeps Z takes the 2D path. Give a line's ends their Z explicitly (`lineStartZ` / `lineEndZ`): in
  plan a vertical line's ends are one point.
- **Transforms take `Vec2 | Vec3`**, a 2D delta or base being Z = 0. `stretchEntity` moves whole an
  object whose every point is caught, else the Z of a rigid object and of a line's caught end —
  nothing else caught in part can tilt. A tilted object goes to `transformEntity`.
- **Rebuilding an object from another goes through `carryOverrides`** (overrides _and_ plane and
  thickness; `carryPlane` for a new object sharing only the plane). `createX(..., source.layerId,
source.id)` alone is the bug: it drops colour, linetype, lineweight and Z.
- **A piece cut from a line or grown out of it goes through `carryPiece`** (TRIM, EXTEND, BREAK),
  which re-reads each end with `entityZAt`; a line end moved to a point (a grip) takes its Z with
  `withLineZ`.
- **Coplanar means `coplanar(a, b)`**, AutoCAD's own test (FILLET, CHAMFER, JOIN, HATCH);
  two lines in a tilted plane are `linesPlaneNormal`.
- **An entity's points are planar; the Z lives only in its fields.** Factories copy `{ x, y }` and
  a spread writing a picked point takes `planar(point)`. `entityZAt` is the one reader of an
  object's Z at a point in plan.
- **The domain's 2D queries read one plane** (`readsInPlan`); drawing, picking, bounds and snapping
  project every object through its plane in `application/` (`planeCamera`, `viewPick.ts`). Objects
  in different planes have no intersection yet.

## Serialization

The reader is deliberately tolerant: skip malformed entities, default missing fields, reject only
files newer than `DRAWING_FILE_VERSION`. Every schema change bumps it and keeps old files loadable.
