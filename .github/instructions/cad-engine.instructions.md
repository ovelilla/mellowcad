---
applyTo: "cad/**"
description: "Layering, purity and modelling rules for the DOM-free CAD engine (geometry, domain, scene, serialization, application, adapters)."
---

# CAD engine rules

## Allowed dependencies

| Layer            | May import from                                                                       |
| ---------------- | ------------------------------------------------------------------------------------- |
| `geometry/`      | nothing                                                                               |
| `domain/`        | `geometry/`                                                                           |
| `scene/`         | `geometry/`                                                                           |
| `serialization/` | `geometry/`, `domain/`                                                                |
| `i18n/`          | nothing but `icu-minify/format` (formatter, keyword and name rules; no catalog shape) |
| `locales/`       | `i18n/` (the catalogs: `en.json`, the generated `en.ts`, `EngineLocale`)              |
| `application/`   | `geometry/`, `domain/`, `scene/`, `serialization/`, `shared/`, `i18n/`, `locales/`    |
| `adapters/`      | everything (this is the only browser-aware layer)                                     |

`cad/index.ts` is the public barrel, and `cad/locales/*` are the other public entry points (one
module per language, tomorrow the package's `exports` subpaths). Anything React needs must be exported
from one of those; nothing outside `cad/` may import another deep path.

## Text lives in the catalogs

**Every word the engine shows is in `cad/locales/en.json`**, and nowhere else in `cad/`: prompts,
keywords, command names, command-line messages, what is drawn on the canvas, the Properties palette.
English is built in, gives the type every other language is checked against, and is the fallback key
by key. `application/EngineText.ts` is the one place that reads it; a tool reaches it through
`ctx.text` and names a dynamic-input prompt by id.

- **`domain/` exposes ids, never display names.** Colours (`STANDARD_COLORS[].id`), linetypes, hatch
  patterns and `ByLayer` are ids; their names are `interface.*` entries, read by a host from
  `EngineState.names`. Data names stay data: layer, style and block names, `Standard`, `ISO-25`,
  `Continuous`, `ANSI31`. A default name is fixed when the object is made, in the command language
  of that moment (`Layer{n}`, `Copy of {name}`), as AutoCAD's are.
- **Two languages, one boundary.** `interface` is the palettes' and menus' language; `commands` is
  the command language — names, prompts, keywords, messages and everything drawn on the canvas.
  A locale may leave `commands` out, and then the command language is the global one (Arabic's
  case). **A command language is complete or absent**: `locales.test.ts` holds every catalog that
  has one to English's full list of names, keyword tables, prompts, messages and feedback, with no
  name or alias shared by two commands and no two keywords of one prompt on the same abbreviation
  (the prompts are read off the English surface snapshot).
- **Spanish is Spanish AutoCAD 2026's, copied, never translated** — names from the help pages
  that share the English GUIDs, aliases from its `acad.pgp`, prompts and keyword capitals from
  product captures (they beat the help when the two differ). What no source shows is worded in
  Autodesk's style and marked unverified in `docs/autocad-coverage.md`. In Spanish `H` undoes and
  `U` is UNIR.
- **A language translates the whole `interface` but for `linetype` and `hatchPattern`**, which are
  the drawing's data names and fall back to English's. `locales.test.ts` holds Spanish to that.
- **No global language state.** The locale is passed explicitly — `CadEngineOptions`, `CadRuntime`'s
  fifth argument, `CadDriverOptions` (so `createHarness`), `recordDemo(…, { locale })`,
  `commandCatalog(locale)` — and `setLocale` switches one engine. A module-level registry would be
  an import-time side effect, and one process renders several languages (the landing's build).
- **Messages are ICU MessageFormat** (next-intl's syntax): `{count, plural, …}`, never a hand-made
  plural. A `<` followed by a letter is written `'<'`, or ICU reads it as a tag. `names` and
  `keywords` are words, not messages, and are not compiled.
- **After editing a catalog (`en.json`, `es.json`), run `npm run locales`** and commit both files:
  the engine imports the compiled module (no parser ships to the browser), and `locales.test.ts`
  fails on any drift.
- **Technical values never go through `Intl`.** Lengths and angles are `formatLength` /
  `formatAngle` (`toFixed`, a point, latin digits) and enter a message already formatted. Counts do
  go through the formatter, which pins latin digits and no grouping.
- **A failure a user reads is a code.** `DrawingFileError.code` is worded by the catalog; its
  `message` stays English, for logs.

**No module in `cad/` may have an import-time side effect.** `package.json` declares
`"sideEffects": ["**/*.css"]`, which is what lets a page import one small helper from the barrel
(`readSavedDrawingSummary`, `matchCommands`) without the bundler shipping the whole engine — that
was 90 KB gzipped on the landing before it. A top-level registration, patch or global write would be
silently dropped from any bundle that does not use the module's exports.

Cross-layer contracts live in `application/ports.ts` (`EngineHost`, `DrawingStore`, `FileTransport`,
`Clipboard`).
The engine asks the host to render/focus/set the cursor, to save/open a file and to reach the
clipboard — it never reaches for the browser itself. **A capability the app has belongs to the
engine, behind a port; only the _mechanism_ (Blob, `<input type=file>`, `navigator.clipboard`,
localStorage) lives in `adapters/`.** Anything a consumer would otherwise have to reimplement is not
in the package.

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
- **Entities are stored in the WCS; the UCS is only how points and angles are read.** A `Ucs`
  (`domain/ucs.ts`) is an origin (a `Vec3`: its XY plane sits at the origin's Z) and a unit X
  axis — a direction kept as a vector, like an ellipse's axis — with Y a quarter turn CCW and Z
  the world's, so it is never tilted or mirrored.
  It lives in `DocumentSettings` with its name and the named-UCS table (UCSORG, UCSXDIR and the UCS
  table are saved in the drawing). Convert at the boundary with `ucsPointToWorld` /
  `worldPointToUcs` and the direction and angle twins; nothing in `domain/` reads the current UCS.

## The entity modules

`domain/entities.ts` is a **barrel of explicit re-exports**; the implementations live in siblings:

| Module                                                                        | Holds                                                                |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `entityTypes.ts`                                                              | the interfaces, the `Entity` union, `Bounds`                         |
| `entityFactories.ts`                                                          | `nextEntityId` and the `create*` that have no geometry of their own  |
| `text.ts` `dimensions.ts` `polylines.ts` `hatch.ts` `blocks.ts` `ellipses.ts` | one type's own geometry, its factory included                        |
| `entityOverrides.ts`                                                          | `assign*`, `carryOverrides`, `matchEntityProperties`                 |
| `elevation.ts`                                                                | the Z fields: readers, `with*`, `carryPlane`, the Z of scale/shift   |
| `entityTransforms.ts`                                                         | translate / stretch / copy / rotate / scale / mirror (+ `*Copy`)     |
| `entityQueries.ts`                                                            | `closestOnEntity`, `entityBounds`, `entityDrawOrder`, the rect tests |
| `entityMeasures.ts`                                                           | per-type readouts (`lineLength`, `arcMidpoint`, …)                   |
| `entityProperties.ts`                                                         | `EntityProperty` + `applyEntityProperty`                             |

Two rules keep that working. The modules **import each other directly, never through the barrel** —
going through `entities.ts` is a cycle. And the re-export list is **explicit**, not `export *`, so a
new public symbol is invisible until it is named there; that is what keeps helpers two modules
happen to share (`hatchLoopRing`, `segmentGeometries`, `horizontalExtent`) out of `domain/index.ts`
and out of the package's public API. Dependencies run types → per-type modules → overrides →
transforms → queries, with `blocks.ts` and `hatch.ts` above `entityTransforms.ts` because placing a
reference and rotating a pattern both transform points.

## Adding an entity type

TypeScript exhaustiveness will point at most of it, but the full list is: `assignEntityLayer`,
`assignEntityLinetype`, `assignEntityLineweight`, `assignEntityColor`, `translateEntity`,
`stretchEntity`, `copyEntity`, `rotateEntity(+Copy)`, `scaleEntity(+Copy)`, `mirrorEntity(+Copy)`,
`closestOnEntity`, `entityBounds`, `entityCrossesRect`, `applyEntityProperty` — each in the module
the table above gives it, and anything new the type exports named in the `entities.ts` barrel —
plus `serialization/drawingFile.ts` (clone + parse + `VERSION` bump; the Z fields come for free
through `planeOf` / `parsePlane`, thickness only if DXF gives the type one — then `hasThickness`),
`SceneBuilder.entityScenePrimitive`, `snapping/providers.ts`, `EngineState.singleEntityInfo` + the
type's name in `interface.entity` (and its rows in `interface.property`), and `selectedGrips` in
`tools/selectToolGrips.ts`. The editing tools switch on the
type too (`EdgeEditTool`, `BreakTool`, `OffsetTool`, `DimensionTool`, `lastDrawnPoint`): a type they
cannot act on returns `null` explicitly rather than falling through.
A type that wears a **text style** (text, mtext, attdef, and a reference's attributes) is also
named, by hand and without any compiler
help, in `assignTextStyle`, `CadDocument.textStyleInUse` and `reconcile`, `setSelectionTextStyle`,
`EngineState`'s `hasStyleOf` (style counts, the picker) and `clipboardSnapshot`; miss one and a style
in use can be deleted, or a pasted object loses its style.
Two of those are decisions, not chores. **Snapping is opt-in**: a hatch is in no provider at all
because OSOPTIONS ships at 7, whose first bit reads "Object snaps ignore hatch objects" — look up
what AutoCAD snaps to before wiring a type in. A curve whose intersections have no closed form
joins the Intersection provider as the chords of its tessellation near the cursor only
(`collectShapes`'s `near`), tagged with `curveId` so its own neighbouring chords never meet. And the
fast-check `entity` arbitrary in
`test/arbitraries.ts` must generate the new type, or every transform / bounds / round-trip property
silently stops covering it.

An entity that is an **area** rather than an outline (text, hatch) must hit-test as filled —
`closestOnEntity` returning the distance to its border means clicking the middle of it selects
nothing. The same even-odd rule that fills it decides what is inside, so a nested loop is a hole
for picking exactly as it is for painting.

**Store a direction-and-size as one vector.** An ellipse keeps DXF's centre + _vector to the
major-axis endpoint_ + ratio, not two lengths and an angle, because a vector translates, rotates,
scales and mirrors exactly like a point — which is what makes its nine transform cases one-liners.
Anything the same shape (a future axis, direction or offset) is modelled the same way.

**A pair of optional fields is a trap TypeScript cannot see.** An elliptical arc's `startParam` /
`endParam` are present together or not at all (absent = the whole ellipse), so the factory is the
only place that decides — it drops a range that sweeps a full turn, and applies the quarter-turn
parameter shift when it has to swap a too-short axis for the major one. Never write those fields
by hand from a transform: spread the factory's result, and assert in `expectSameShape` that
_presence_ round-trips, or a transform will quietly hand back a whole ellipse.

**A query with no closed form gets a documented cap, not an open loop.** The closest point on an
ellipse reduces to a quartic, so `closestPointOnEllipse` scans a fixed number of parameters and
refines the best with a bounded Newton, keeping the refinement only when it beats the sample — the
same "declare the budget" rule as `MAX_BOUNDARY_CURVES` and `MAX_BLOCK_NESTING`. Name the constants
and say in a comment why the cheap answer is wrong.

A shape the scene cannot already draw adds a **primitive** (`scene/types.ts` plus a branch in
**both presenters**: `CanvasScenePresenter`, which the editor paints with, and `SvgScenePresenter`,
which draws the landing's figures at build time), not a tessellation — but everything it carries is
**screen** space, and the camera's Y flip both reverses an angle and runs a parametrisation
backwards. Resolve that once in the builder (`arcScenePrimitive`, `ellipseScenePrimitive`) and pin
it with a test that rebuilds the renderer's own parametric formula and compares it against the
projected world endpoints — `SvgScenePresenter.test.ts` does the same for the SVG arc flags.

**A curve no renderer has is the exception: a spline.** Canvas and SVG have no NURBS and a degree
above 3 fits no Bézier, so `SceneBuilder` draws it as a `path`, tessellated in world coordinates to
a quarter of a pixel at the current zoom (`splinePolyline(spline, 0.25 / scale)`) — never a cached
world tessellation, which would facet on zooming in. The math is `geometry/nurbs.ts` (de Boor,
interpolation, adaptive tessellation with a capped depth); the entity keeps only what was picked
and `splineCurve` derives the control points and knots every time. Queries with no closed form on it
(bounds, crossing, length, area, the Intersection snap) read `splinePolyline` at its default
tolerance, a hundred-thousandth of the curve's size; the closest point refines that with a bounded
Newton. A future curve of the same kind (a helix, an offset spline) follows the same split.

The SVG presenter differs from the canvas one only where SVG does: it clips segments to the frame
(a scene draws alignment paths millions of pixels long, which a canvas clips for free but SVG would
dash end to end), it sizes text from a **fixed** cap-height ratio because it cannot measure a font,
and it places the canvas's em-box baselines arithmetically rather than with `dominant-baseline`,
which rasterisers disagree about.

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

`insertGeometry` is the block's own objects placed by the reference — what EXPLODE returns, attribute
definitions included. What a reference **shows** is `insertFlatGeometry`: the objects,
a constant definition as its value and the reference's own attributes in place of the other
definitions, filtered by ATTMODE — which `document.blockLookup()` carries (`attributeDisplay`), so
rollovers, picking, bounds and snaps see what the scene draws; a hand-made lookup shows Normal.
Those attributes are stored in the **block's** coordinates, so the reference's
placement carries them and no transform, grip or serializer path has to know they exist; anything
that needs one in the drawing (the Insertion snap's `insertAttributePoints`) places it the way
`insertFlatGeometry` does.

Derived geometry is computed in **world** coordinates, never at paint time in screen ones. That is
what lets `SceneBuilder` cache a hatch's clipped pattern in a `WeakMap` keyed on the immutable
entity: the result cannot depend on the camera, so panning and zooming stay free without the scene
builder ceasing to be a pure function of its input. Anything expensive and camera-independent
belongs on the same side of that line.

## Algorithms over a set of entities

An algorithm whose input is _several_ entities rather than one — `boundary.ts`'s
`traceBoundaryLoops`, which cuts every object at its crossings and walks the faces of the resulting
graph — is still `domain/`, in **its own module** rather than another thousand lines piled onto the
entity modules. Keeping it a pure `(point, entities) => result` is what lets a second command reuse
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
`drawingFile.ts`; its name in `interface.property.dimensionKind` for the palette.

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

The engine is DOM-free, so it cannot ask a font for its metrics: it **carries them**. Drawing text is
set in Arial, AutoCAD's Standard style, and `domain/textFontMetrics.ts` holds Arial's advance widths
(read from Arimo, which shares them, by `scripts/fonts/metrics.ts`; generated, never hand-edited).
`measureTextWidth` is the one measure — bounds, picking, box selection and anything that will wrap
a line. The presenters keep their side of that contract: `DRAWING_FONT` (Arial or a face with its
widths), **Arial's cap ratio rather than a measured one** (Liberation Sans has Arial's widths but
shorter capitals, and the widths are what must agree) and **no kerning**, which the measure does
not model. Change any of the three alone and the box stops fitting the text. A glyph outside the
table (CJK, Arabic) is drawn by a fallback face and measured as an average one. Dimension text still
sits _above_ the dimension line (ISO's DIMTAD 1) rather than breaking it.

**MTEXT keeps AutoCAD's contents string**, `\P` and escapes included, never plain text: the
format codes, DXF and a pasted formatted text then need no change of model. `mtextPlainText` reads
it (tolerantly: codes it does not draw vanish from the reading, never from the object) and
`mtextContents` writes what was typed; nothing else parses or builds the string. What an MTEXT
looks like — the wrapped lines, the box — is `mtextLayout`, derived every time, in the object's own
frame; its attachment ids are TEXT's two-letter justifications, so `horizontalExtent` /
`verticalExtent` hang both boxes. Single spacing is `TEXT_LINE_SPACING_FACTOR`, 5/3 of the height
(ObjectARX's rule; the help rounds it to 1.66), for TEXT and MTEXT alike.

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
beside them (`BlockDefinition` in `entityTypes.ts`, `createBlockDefinition` in
`entityFactories.ts`, expansion in `blocks.ts`) rather than in a leaf module, and there is no
current-block or base
entry — a name that is not defined is not reconciled but **dropped at parse time**, since a
reference to nothing can draw nothing and can never be repaired.

A **fragment** of a drawing — today the clipboard, tomorrow WBLOCK — must carry every table entry
its objects reference, followed through block definitions, or it lands somewhere pointing at things
that do not exist. Writing exactly those is what the drawing file already does, so
`clipboardFile.ts` stores a fragment as a one-off drawing plus a base point rather than as a second
schema to keep in step; `parseDrawingData` is the tolerant reader split out so a nested drawing is
read without being re-stringified. Landing it is `planPaste`'s two rules: **a name the target
already has wins** (joining it never redefines the drawing it lands in) and **layers are the one
table that needs remapping**, because a layer's id is not its name — for styles and blocks it is.

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
must be adding data and nothing else; if it needs code, the model is wrong. Its display name and its
`?` description are catalog entries (`interface.linetype`, `interface.hatchPattern`,
`commands.listing.hatchPatternDescription`), keyed by the id.

## Editable geometry (the Properties palette)

`applyEntityProperty(entity, property, value)` is the single pure entry point for retyping a
geometry value (AutoCAD's editable Properties rows). It rebuilds the entity with a spread — never
via `createX(...)` — so the id and every ByObject override survive, and returns `null` for values
that don't apply or would degenerate the object. A row becomes typeable by giving it an `edit`
descriptor in `singleEntityInfo`; the write path is `CadRuntime.setSelectionProperty`, which parses
the text and executes one `UpdateEntityCommand`. The Z rows are `ZProperty` values handled before
the per-type switch, in world Z; which types show a plane row is the `PLANE_ROWS` table.

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

## Z (2.5D)

Every object is planar with its normal on +Z, so the OCS is the WCS and the kernel stays `Vec2`:
the Z is numbers beside the points, stored as DXF stores it (`domain/elevation.ts`). `elevation`
on every entity is the Z of its plane (a line's start); a line adds `deltaZ` (end − start, a vector
like an ellipse's axis); `thickness` exists only on line, circle, arc and polyline, the types DXF
extrudes. All three are optional, absent means 0, and a 0 is never stored — `withElevation` and its
twins drop it — so a flat drawing and its file look exactly as before. A block's base point has
its own `baseElevation`, and a reference's attributes their `elevation`.

- **Transforms take `Vec2 | Vec3`.** A 2D delta or base is Z = 0: a planar move, or a scale about
  the XY plane. `translateEntity` / `copyEntity` shift the plane, `scaleEntity(+Copy)` scales
  elevation, rise and thickness about the base's Z, rotate and mirror leave the Z alone, and
  `stretchEntity` moves whole (Z included) an object whose every point is caught, and otherwise
  moves the Z of a rigid object that moves and of a line's caught end — a polyline, spline, hatch
  or dimension caught in part cannot tilt, so it ignores it.
- **Rebuilding an object from another goes through `carryOverrides`**, which carries the overrides
  _and_ the plane and thickness (`carryPlane` alone for a new object that only shares the plane,
  like FILLET's arc). `createX(..., source.layerId, source.id)` on its own is the bug: it keeps the
  id and silently drops colour, linetype, lineweight and Z. A grip edit in `domain/` rebuilds by
  spreading the source (`polylines.ts`'s `reshaped`).
- **A piece cut from a line or grown out of it goes through `carryPiece`** (TRIM, EXTEND, BREAK):
  `carryOverrides` copies the whole rise, which is wrong for a piece, so each end is re-read with
  `entityZAt` on the source — extrapolated past its ends for EXTEND. A line end moved to a point
  of its own (a grip) takes that point's Z with `withLineZ`, the other end keeping its own.
- **Coplanar means `coplanar(a, b)`**: one elevation and no line rising (`isLevel`). It is
  AutoCAD's own test — "one or more of the line vertices is not at the same elevation" — so
  FILLET, CHAMFER, JOIN and HATCH's boundary use it rather than comparing elevations by hand.
- `expectSameShape` compares the Z and the `entity` arbitrary generates it, so a transform that
  drops it fails every round-trip property.
- **An entity's points are planar; the Z lives only in its fields.** Factories copy `{ x, y }` out
  of whatever they are given, so a `Vec3` from the point channel never leaves a stray `z` on a
  vertex; a spread that writes a picked point (a grip edit) takes `planar(point)` for the same
  reason. `onPlaneOf(entity, point)` sets the plane from a point, `createLine` reads its ends' Z,
  and `entityZAt(entity, point)` is the one reader of an object's Z at a point in plan (a line's
  interpolated along it) — the snaps, UCS OBject and any future "Z of the object here" use it.

## Serialization

The reader is deliberately tolerant: skip malformed entities, default missing fields, reject only
files newer than `DRAWING_FILE_VERSION`. Every schema change bumps it and keeps old files
loadable.

## State and notifications

`shared/Observable.ts` is the pub/sub used everywhere. `CadRuntime` caches its `EngineState`
snapshot (`useSyncExternalStore` depends on referential stability) and rebuilds it on model
emits — never per pointer-move. Rendering is on-demand via `host.requestRender()`.
