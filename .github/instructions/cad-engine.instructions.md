---
applyTo: "cad/**"
description: "Layering, purity and modelling rules for the DOM-free CAD engine (geometry, domain, scene, serialization, application, adapters)."
---

# CAD engine rules

## Allowed dependencies

| Layer            | May import from                                               |
| ---------------- | ------------------------------------------------------------- |
| `geometry/`      | nothing                                                       |
| `domain/`        | `geometry/`                                                   |
| `scene/`         | `geometry/`                                                   |
| `serialization/` | `geometry/`, `domain/`                                        |
| `application/`   | `geometry/`, `domain/`, `scene/`, `serialization/`, `shared/` |
| `adapters/`      | everything (this is the only browser-aware layer)             |

`cad/index.ts` is the public barrel. Anything React needs must be exported there; nothing outside
`cad/` may import a deep path.

Cross-layer contracts live in `application/ports.ts` (`EngineHost`, `DrawingStore`, `FileTransport`).
The engine asks the host to render/focus/set the cursor and to save/open a file — it never reaches
for the browser itself. **A capability the app has belongs to the engine, behind a port; only the
_mechanism_ (Blob, `<input type=file>`, localStorage) lives in `adapters/`.** Anything a consumer
would otherwise have to reimplement is not in the package.

This file covers layering and modelling. Runtime plumbing (point resolution, key routing,
snapping, command history, adapters) is in `cad-runtime.instructions.md`; writing a tool is in
`cad-tools.instructions.md`.

## Conventions

- Angles are **radians CCW from +X** inside `geometry/` and `domain/`; degrees only at the UI
  boundary (`EngineState`, dynamic-input fields). Normalise with `normalizeAngle` or
  `normalizeDegrees` from `geometry/primitives` — both guarantee the half-open range, which a
  hand-rolled `deg < 0 ? deg + 360 : deg` does not (a tiny negative angle lands on exactly 360).
- `ArcEntity` is **always CCW from `startAngle` to `endAngle`**. Any transform that reverses
  orientation (mirror) must reflect _and swap_ the angles to preserve the invariant.
- Polyline `bulges[i]` is AutoCAD's `tan(θ/4)` for segment `i`, indexed like `polylineSegments`.
  Mirroring negates them; translate/rotate/uniform-scale leave them untouched.
- `polylineSegmentGeometries()` is the single source of truth for how a polyline is shaped —
  rendering, bounds, hit-testing, explode and snapping all read it. Do not re-derive segments.
  A hatch boundary loop is the same shape (`hatchLoopSegments()`), but it **always closes**, even
  on the two vertices a circle becomes — which is why it does not borrow `polylineSegments`,
  whose closing segment needs three.
- Paint order is `entityDrawOrder()` (today only hatches move, behind everything), and
  `pickAll()` sorts by it reversed, so what is drawn on top is what a click takes: nearest first,
  then in-front-most, then most recently drawn. `pick()` is `pickAll()[0]` — selection cycling
  depends on that, so keep the two in step.
- Never compare `Vec2` with `toEqual`/`Object.is`: `-0 !== 0`. Use the custom matchers.
- Pure functions do not mutate their inputs; entity helpers return new objects and either
  preserve the id (in-place edit) or mint a fresh one (`*Copy` helpers).

## Adding an entity type

TypeScript exhaustiveness will point at most of it, but the full list is: `assignEntityLayer`,
`assignEntityLinetype`, `assignEntityLineweight`, `assignEntityColor`, `translateEntity`,
`stretchEntity`, `copyEntity`, `rotateEntity(+Copy)`, `scaleEntity(+Copy)`, `mirrorEntity(+Copy)`,
`closestOnEntity`, `entityBounds`, `entityCrossesRect`, `applyEntityProperty`, plus
`serialization/drawingFile.ts` (clone + parse + `VERSION` bump),
`SceneBuilder.entityScenePrimitive`, `snapping/providers.ts`, `EngineState.singleEntityInfo` +
`TYPE_LABELS`, and `SelectTool.selectedGrips`. The editing tools switch on the type too
(`EdgeEditTool`, `BreakTool`, `OffsetTool`, `DimensionTool`, `lastDrawnPoint`): a type they cannot
act on returns `null` explicitly rather than falling through.
Two of those are decisions, not chores. **Snapping is opt-in**: a hatch is in no provider at all
because OSOPTIONS ships at 7, whose first bit reads "Object snaps ignore hatch objects" — look up
what AutoCAD snaps to before wiring a type in. And the fast-check `entity` arbitrary in
`test/arbitraries.ts` must generate the new type, or every transform / bounds / round-trip property
silently stops covering it.

An entity that is an **area** rather than an outline (text, hatch) must hit-test as filled —
`closestOnEntity` returning the distance to its border means clicking the middle of it selects
nothing. The same even-odd rule that fills it decides what is inside, so a nested loop is a hole
for picking exactly as it is for painting.

**Store what was picked, derive what is shown.** A dimension keeps only its definition points; its
length and its label come out of `dimensionGeometry` / `dimensionText` every time they are needed.
A hatch keeps only its boundary loops and pattern settings; its line work comes out of
`hatchGeometry`. A block reference keeps only the block's name and its placement; the geometry it
draws comes out of `insertGeometry`. A stored copy of a derived value is a copy that can disagree
with the geometry.

An entity whose shape lives in a **table** rather than in itself (today only `insert`) makes the
pure helpers need that table, so `closestOnEntity`, `entityBounds`, `entityCrossesRect`,
`entityWithinRect`, `entitiesBounds` and `entityScenePrimitive` all take an optional `BlockLookup`.
Optional means a forgotten call site compiles, so the degraded answer is deliberately _visible_ —
a reference with no lookup collapses to its insertion point rather than silently vanishing. Pass
`document.blockLookup()` (tools have it as `ctx.blocks`) anywhere a real object is being measured,
picked or drawn. Expansion is capped by `MAX_BLOCK_NESTING`: a hand-edited file can nest a block
inside itself, and nothing else stops the recursion.

AutoCAD resolves a block's appearance in three modes, and the two that are real behaviour are
implemented in `insertGeometry`: objects drawn on **layer 0 inherit the reference's layer**, and
anything on another layer or carrying its own override keeps what it had. The third, **ByBlock**
("inherit individual properties first, then layer properties"), is not modelled — `resolveEntityX`
knows only ByObject and ByLayer, and adding a third mode touches all three of them.

Derived geometry is computed in **world** coordinates, never at paint time in screen ones. That is
what lets `SceneBuilder` cache a hatch's clipped pattern in a `WeakMap` keyed on the immutable
entity: the result cannot depend on the camera, so panning and zooming stay free without the scene
builder ceasing to be a pure function of its input. Anything expensive and camera-independent
belongs on the same side of that line.

## Algorithms over a set of entities

An algorithm whose input is _several_ entities rather than one — `boundary.ts`'s
`traceBoundaryLoops`, which cuts every object at its crossings and walks the faces of the resulting
graph — is still `domain/`, in **its own module** rather than another thousand lines of
`entities.ts`. Keeping it a pure `(point, entities) => result` is what lets a second command reuse
it (BOUNDARY is the same trace as HATCH's internal pick) and lets it be tested without the harness.

**Which entities it sees is the caller's decision, not the algorithm's.** AutoCAD's boundary set is
"everything visible in the current viewport", and the viewport lives in `application/` — so the
_tool_ filters and hands in a list. That keeps a view-dependent rule (which is real AutoCAD
behaviour, not an accident) out of a layer that must not know a camera exists. Give such a function
a cap on how much it will chew through, too: pairwise work is quadratic and a boundary is a local
question, so declining is better than freezing.

## Adding a dimension kind

A `DimensionKind` is not a new entity type: every kind is a `DimensionEntity` sharing the same
definition points, so transforms, grips, snapping and the file format come for free. What each new
kind owes is: a branch in `dimensionAxisAngle`, `dimensionMeasurement` and (if it carries a symbol
or a different unit) `dimensionText`; a body in `dimensionGeometry`; `parseDimensionKind` in
`drawingFile.ts`; `DIMENSION_TYPE_LABELS` for the palette.

**Every transform maps the points through `mapDimensionPoints`.** The `dimension` cases of
translate / rotate / scale / mirror / stretch and the four `*Copy` helpers all spread its result
instead of naming `first`/`second`/`linePoint` by hand. An optional point — angular's `vertex` —
is otherwise inherited from `...entity` untouched, which TypeScript cannot flag and which reads as
a dimension whose vertex stays behind when you move it. The fast-check `dimensionEntity` arbitrary
generates every kind, and `expectSameShape` compares the optional points, so the round-trip
properties catch a dropped one.

`DimensionGeometry` describes **one dimension line plus a list of other runs** (`lines`) — the two
extension lines of a linear dimension, a radial one's centre mark and arrow stub, an angular one's
extension lines. Whatever a kind draws goes in that list; there is no per-kind field, and
`dimensionSegments` (hit-testing, bounds) and `SceneBuilder` walk it without knowing which kind
produced it. A dimension line that **curves** sets `arc` instead, and then: `SceneBuilder` draws it
with `arcScenePrimitive`, `dimensionSegments` samples it (its chord runs through the vertex, where
nothing is drawn), and the grip uses `lineMidpoint` — which is the point halfway _along_ the line,
not between its ends, precisely for this.

`dimensionMeasurement` is **not always a length**: it returns radians for an angular dimension.
Ask `dimensionMeasurementUnit(kind)` before formatting it — the palette and `dimensionText` do.
Decimals likewise come from DIMADEC for an angular measurement and DIMDEC for every other, which
`angleDecimalsOf(style)` resolves (including AutoCAD's −1, "use DIMDEC").

A kind that is not linear must be **excluded from the commands that assume two extension line
origins**: `lastDimension`, `DimensionChainTool` (DIMBASELINE / DIMCONTINUE) and `DimSpaceTool` all
filter for linear and aligned. Missing one of those is silent — the chain simply starts from the
wrong object. Where AutoCAD _does_ support the kind and we do not (both of those commands accept
angular dimensions, by stepping the arc radius rather than offsetting along a normal), say so in a
comment on the filter rather than leaving it looking like an oversight.

The engine has no glyph metrics and never will (it is DOM-free), so anything text-shaped is
measured by a **nominal** metric in the domain (`TEXT_WIDTH_FACTOR`) for bounds, picking and box
selection, while the presenter renders with the real font. Do not try to plumb a measurement back
in: the approximation is what keeps `domain/` pure. It is also why dimension text sits _above_ the
dimension line (ISO's DIMTAD 1) rather than breaking it: the gap would have to be measured.

A CAD text height and offset are stated in terms of the **capital letters**, so turning one into
canvas needs two corrections, not one: the font size is divided by the family's cap-height ratio,
**and the vertical anchor is the alphabetic baseline** — canvas's `"bottom"` is the em box, whose
descender space digits never occupy, which silently makes text taller than the drawing says. It
shows up wherever the spacing has no slack: DIMTXT + DIMGAP is deliberately just under DIMDLI, so
that extra height put a baseline chain's number across its neighbour's dimension line.

## Style tables

`textStyles.ts` and `dimStyles.ts` are twins — a named record of defaults that entities reference
by id, exactly as AutoCAD's STYLE and DIMSTYLE tables do. Add one the same way: a `createDefaultX`
base that always exists, a table on `CadDocument` (`getXs` / `getX` / `getCurrentXId` /
`setCurrentX` / `addX`), a field on `DocumentTables` (`load()`'s options bag — it takes tables by
name, not by position, because eight trailing optionals was already one too many), a `reconcile`
branch remapping a dangling id onto the base, and a tolerant parser that fills missing settings
from the base. **Persist the table from the first release of the feature it serves**, even without
a manager UI, so adding the manager later never changes the file format.

The block table is the same shape with two differences: its entries hold **entities**, so it lives
beside them in `entities.ts` rather than in a leaf module, and there is no current-block or base
entry — a name that is not defined is not reconciled but **dropped at parse time**, since a
reference to nothing can draw nothing and can never be repaired.

Defaults come from AutoCAD's _metric_ initial values (the acadiso / ISO-25 template), which is what
this app's millimetre units match — look each one up rather than recalling it.

A `DIMxxx` system variable belongs on **`DimStyle`, not `DocumentSettings`**, whenever AutoCAD
keeps it in the Dimension Style Manager (DIMSCALE on the Fit tab, DIMDLI on the Lines tab). Settings
would be simpler today and wrong the day a style manager lands, which is the one thing persisting
the table early is meant to prevent. Anything that is a plotted _size, distance or offset_ is also
scaled by DIMSCALE, so fold it into `scaledDimStyle` — measurements, coordinates and angles are not.

A new style setting owes four things: the field with its metric default on the style, a branch in
`clampDimStyle` (the single gate every edit passes through), a tolerant read in the parser with a
`DRAWING_FILE_VERSION` bump, and a control in `styles-control.tsx` **under the heading AutoCAD
files it under** — Lines, Symbols and arrows, Text, Fit, Primary units. Grouping is the part of the
dialog that is behaviour rather than chrome: users look for Baseline spacing where they were taught
to. The managers' own rules are AutoCAD's: a style is created by copying another ("Start With"),
names are the identity so they must stay unique, and **a style that is current, in use, or the base
cannot be deleted**.

## Definition registries

A style _table_ is per drawing; a _registry_ is per build. `linetypes.ts` and `hatchPatterns.ts`
are the registries: AutoCAD keeps their definitions in files shipped with the product (`acad.lin`,
`acad.pat`), so an entity stores only the **name** plus whatever it scales that definition by, and
an unknown name degrades to nothing drawn rather than a failed load — which is what lets a drawing
travel between builds that ship different patterns.

Transcribe a definition from AutoCAD's documented one, quoted verbatim in a comment beside the
data, converting only what this layer's conventions require (degrees → radians). Adding a pattern
must be adding data and nothing else; if it needs code, the model is wrong.

## Editable geometry (the Properties palette)

`applyEntityProperty(entity, property, value)` is the single pure entry point for retyping a
geometry value (AutoCAD's editable Properties rows). It rebuilds the entity with a spread — never
via `createX(...)` — so the id and every ByObject override survive, and returns `null` for values
that don't apply or would degenerate the object. A row becomes typeable by giving it an `edit`
descriptor in `singleEntityInfo`; the write path is `CadRuntime.setSelectionProperty`, which parses
the text and executes one `UpdateEntityCommand`.

## Adding an entity property

Colour, linetype and lineweight are structural twins — copy the closest one instead of inventing
a new shape:

- `BaseEntity` gets an **optional** field; absent means ByLayer and nothing is stored.
- `Layer` gets a **required** field with a default.
- `Document` gets `resolveEntityX(entity)` = entity override ?? layer ?? base default, exposed on
  `DocumentReader`.
- `carryOverrides` must carry it onto copies.
- `drawingFile.ts`: bump `DRAWING_FILE_VERSION`, persist conditionally via the `overrides`
  spread, keep the reader tolerant so older files still load.
- `CadRuntime.setSelectionX(value | "ByLayer")` = one `UpdateEntityCommand` per entity (undoable),
  plus a `commonSelectionX` for `EngineState`.

## Serialization

The reader is deliberately tolerant: skip malformed entities, default missing fields, reject only
files newer than `DRAWING_FILE_VERSION`. Every schema change bumps it and keeps old files
loadable.

## State and notifications

`shared/Observable.ts` is the pub/sub used everywhere. `CadRuntime` caches its `EngineState`
snapshot (`useSyncExternalStore` depends on referential stability) and rebuilds it on model
emits — never per pointer-move. Rendering is on-demand via `host.requestRender()`.
