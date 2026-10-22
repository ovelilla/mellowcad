---
paths:
  - "cad/application/tools/**"
---

# Tool authoring

A tool is an explicit state machine for one AutoCAD command. It owns a discriminated-union
`state`, previews through `buildOverlay(ctx): ScenePrimitive[]`, and commits through
`ctx.execute(command)`. The port is `Tool.ts`. Registering a new command: skill `new-command`.
How prompts, keywords and messages are worded and named: `cad-catalogs.md`.

## Reuse before writing

- `PlacementTool` — select → base point → second point or Displacement (MOVE, COPY, STRETCH); its
  hooks are in its class JSDoc.
- `EdgeEditTool` — TRIM and EXTEND; its modes, edges, fences and eRase are in its class JSDoc.
  Where no closed form gives a crossing (an ellipse with a circle, anything with a spline),
  `curveCrossings.ts` scans one curve's parameter (`parametricCurve`) for the sign changes of the
  other's implicit function (`implicitEdges`; a spline's chords) with `signChanges`
  (`geometry/primitives.ts`), bisected to full precision — the one root finder; never write
  another scan. A new type that is an edge gets its implicit function there. Cut a polyline with
  `polylineSpan` (`domain/polylines.ts`, between two `polylineParamAt` parameters, round a closed
  one past its start, arc bulges refitted) and an ellipse with `ellipseCut` (`domain/ellipses.ts`):
  never walk the vertices to cut one in a tool. A fence's objects are planned one by one against
  the drawing as it then is, never as it was: the console cuts them in turn.
- `ObjectSelector` (`objectSelection.ts`) — AutoCAD's `Select objects:`, which every command
  taking a set asks: picks, the window a pick on nothing starts, the lasso a drag draws, every
  mode typed there, each counted as AutoCAD does. A tool holds one and, in its select
  phase, hands it `question`, `takes`, `commandOptions`, `invokeOption`, `answerTyped`, the pointer
  handlers, `onEnter`, `cycleLasso`, `wantsSnap` and `buildOverlay`. It passes `done`, `takes` when
  the set takes no sub-objects (`takes: () => "wholeObjects"`: what its refusal lists, and so which
  modes it offers), and where needed `question`, `accept` (a silent filter), `refuse` and
  `noneFound` (EXPLODE's lines) and `onAdded` (STRETCH's frames); a preselection goes through
  `preselect`. Never re-implement a pick, a box or a mode. A **single object's pick** that takes the
  modes (BREAK's `Select object:`, UCS OBject's, ARRAYPATH's path) holds one too, with `modes`
  (`ONE_OBJECT_MODES`) and `one` (`take`, told how the mode found it — `ModeFind`; `newest`,
  `pair`, `silent`, `locked`; never a locked find): it keeps its pick and Enter, the rest to the
  selector while `inMode()`. A typed point reaches `one.pick` through `typedPick`, as a click; where
  the prompt takes AUto, nothing under it starts a window (`startWindow`).
- `SelectionActionTool` — one action over a set, noun-verb and verb-noun (Erase, Explode, Join,
  COPYCLIP). A command that asks something **before** the set (COPYBASE's base point) overrides
  `onActivate` and calls `begin(ctx)` once it has the answer, rather than forking the class.
- `boxSelection.ts` — what a window, lasso, fence or polygon takes (`objectsInWindow`,
  `lassoSelect`, `objectsOnFence`, `objectsInPolygon`) and their previews; never re-implement it.
  Each takes `ctx.viewport`: the box is upright on the screen, which a turned view is not.
- `SelectTool` is split so a new entity type rarely needs the tool: `selectToolState.ts` (the
  union), `selectToolGrips.ts` (**the file to edit when a type gains grips**),
  `selectToolOverlay.ts` (each edit's preview), `selectToolEdits.ts` (pure helpers). Add a grip
  kind in all four, never by growing the class. Points that drag like a polyline's vertices (a
  spline's) reuse the `vertex` role through `withVertexAt`.
- FILLET and CHAMFER — `cornerObjects.ts` (the objects, their picks, refusals and planes),
  `polylineCorners.ts` (polyline corners, `cutBetweenSegments`, `cutPolylineCorners`),
  `curveFillets.ts` (arc segments and whole curves), `roundFillets.ts` (ARC and CIRCLE objects).
  The rules: a corner-cutting command passes its cut, never walks a polyline itself; it carries
  the widths, and so does any tool that makes a polyline out of another's pieces (OFFSET, JOIN,
  TRIM, BREAK). An arc segment, an ARC or CIRCLE and a `CurveObject` follow different console
  rules (`curveCrossing` / `keptEnd`, `filletRound` / `wholeFillet`, refused): never send one kind
  through another's path. What a mode found is read by `foundFilletObject`: never invent a pick
  point in the tool. A second object that makes no corner is said and refused
  (`cornerPairRefusal`, `foundPairRefusal`), never filtered out; click and ghost share one
  `CornerOutcome`. A tilted polyline is cut in its OCS (`cornerPlane`, `roundPlane`): never cut its
  points against plan picks. `bulgeThroughPoint` reads its point as the arc's middle: beside an arc
  pass the bisector of the radii.
- `ArcSegmentInput` (`arcSegmentInput.ts`) — the prompts a polyline's arc options open, for any
  command drawing a polyline's arcs (PLINE; DIST's Arc). The tool lists `ARC_SEGMENT_OPTIONS` among
  its keywords in AutoCAD's order, calls `begin`, and while `active` hands it the question, input,
  options, pointer, `onEnter`, `wantsSnap` and `anchor`, drawing its `preview`. The arc geometry
  is `geometry/bulgeArcs.ts`; never solve a bulge in a tool.
- `dimensionTextOptions.ts` — the Text and Angle keywords every dimension command shares. When two
  commands offer the same AutoCAD keyword, the prompt belongs in a shared helper: identical wording
  is fidelity. `measurementOf` (`DimensionTool.ts`) is the measurement at Text's `<default>` and in
  the report after placing. TEXT's `POINT_PROMPT` and `listTextStyles` are ATTDEF's too.
- **Ghosts and overlays draw through `SceneBuilder.entityScenePrimitive`**, the single source of
  truth for how an entity draws, so a new type renders everywhere for free. It returns a
  **list**: spread it, and never add a nesting "group" primitive — tests, selection cycling and
  pixel checks filter the scene by `kind`. Pass `{ blocks: ctx.blocks }` wherever the entity can
  be one the user selected, or a block reference ghosts as nothing. A preview that needs an entity
  reuses a fixed id (`"circle-preview"`), never one minted per frame (it burns entity ids).
- A tool editing an object **in place** lists it in `hiddenEntityIds()`, or the new state is
  painted over the old one.

## Pick feedback

**Pick through `ctx.pick(world)`, never `document.pick`**: it is where selection cycling
chooses among overlapping objects.

A prompt that asks "which object?" owes a rollover highlight in `buildOverlay` (update the state
only when the hovered id changes): a **set** prompt → `THEME.entityHover`, width 2, skipping
objects already in the set (ERASE's fades it and the set instead, `fadedEntityIds`); a **single
prominent** pick (path curve, break target) → `THEME.selected`, width 2–2.5 (`entityHover`
is too near the entity colour; OFFSET's is a set's, offset/d01-4); under an implied Tangent
(Ttr), a marker (`snapMarker`).

**A set prompt counts all it finds**: refuse under the count (`refuse`) or leave it out when
acting (HATCH's open objects); `accept` only where AutoCAD's prompt filters too (DIMSPACE,
erase/p244).

A tool never touches an adapter: what it needs outside the document (`ctx.copyToClipboard`) is a
`ToolContext` method the runtime wires to the port.

## What a question takes

`takes()`, a `QuestionInput`, is how the runtime refuses a wrong answer. Leave it out where the
default reads right: `selectObjects` / `removeObjects` are a set with sub-objects; a box with a
coordinate field (or a distance and an angle) a point, a lone distance or angle field that, a
number field a number; with no box, a point when `wantsSnap()`, else a keyword. Declare what the box
cannot tell: a single object's pick (`"object"`), a 2D point (MIRROR's, ARC's and PLINE's later
points, CIRCLE's 2P and 3P ones), a keyword prompt that keeps snaps on, a set of whole objects,
STRETCH's crossing set or BREAK's one object (`"oneObject"`; UCS OBject's `"singleSet"`), a count
(`"integer"`), and a command's own words (`{ refusal: "requiresRadius" }`; with `values`; a list of ids for several
lines; `keywords` by id; at a point prompt it refuses a Z and says `setsLastPoint()`, ARC's
centre end). Type `FOO` there in AutoCAD's console before declaring one: the words differ
per input function, and per command at `Select objects:`.

## Answering, numbers and transparency

- Every answer goes through the runtime's `answering`, which writes `question answer` in the
  history. `ctx.answer(text)` completes the answered line after the fact (what a `Select
  objects:` pick found), only a line written since the running command started.
- **A tool never reads a bare number in its point box.** A number typed at a lone `coordinate`
  box is direct distance from `toolAnchor()`, else LASTPOINT, towards the cursor, given to the
  tool as a pick wherever it `wantsSnap()` or its box says where from
  (`DynamicInputSession.directDistance`). Where the tool picks no point, the number reaches its
  `commitRaw` (ZOOM's factor); a box whose number is no point says `"typed"`. With no box
  (`Select objects:`, a single object's pick), `typedPick` reads it through `ctx.pointAtDistance`.
- Run transparently (`'ZOOM`), a tool's own prompt written with `ctx.report(text, "prompt")` gets
  the `>>` head; plain reports do not. Ask `ctx.runsTransparently()` only for what AutoCAD does
  differently then (ZOOM leaves out `Regenerating model.`, -VIEW refuses views). A change AutoCAD
  regenerates for is said with `ctx.regenerate()`, never by reporting `regeneratingModel`: the
  runtime writes `Regen queued.` or `Regenerating model.` and marks the undo step, which U and
  REDO repeat.

## System variables

A system variable typed as a command (AUPREC) extends `SystemVariableTool`: it asks
`enterNewValueFor`, refuses in the console's words (`requiresIntegerBetween`), heads the prompt with
its name in every language, resumes as SETVAR and sets the settings through
`UpdateSettingsCommand`. It is in `TRANSPARENT_COMMANDS`, as every AutoCAD system variable is. One
whose name is a non-transparent command's ('AREA, 'UCSICON) is a `variable(…)` in
`registerCommands`, never a command; a read-only one says `readOnlyVariable`. An angle is written
with `formatAngle` (AUPREC), a length with `formatLength` (LUPREC): never one precision for both.

Where a value lives is the console's OPEN test, never the help's "Saved in:" (RECTANG-D40).
**Saved in the drawing** (FILLETRAD): a `DocumentSettings` field, set in the run by
`setCommandSettings` so U undoes it. **Per drawing, unsaved** (CIRCLERAD): a tool field
`onNewDrawing` resets. **Program-wide** or **registry** (OSMODE): a tool field for the session,
noted in the coverage entry. `onActivate` resets none AutoCAD keeps; a shared one is one object
`defaultTools` hands each.

## What a new object wears

"All objects are created using the current color", linetype and lineweight (CECOLOR, CELTYPE,
CELWEIGHT; ByLayer by default, which stores nothing). Every creating command has a row in
`FROM_SCRATCH` or `DERIVED` of `currentProperties.test.ts`, which pins which it is:

- **Drawn from scratch**: wrap it in `withCurrentProperties(entity, ctx)`
  (`tools/currentProperties.ts`), on the current layer; one added at its end wears its start's
  `currentProperties` (PLINE, pline/p39; CIRCLE the end's, circle/p11). DIMBASELINE and
  DIMCONTINUE use the base dimension's layer and style.
- **Made from another**: the source's, through `carryOverrides` / `carryPiece` / the copy helpers;
  never the current ones.
- **FILLET's arc and CHAMFER's bevel**: the lines' shared layer or the current one, ByLayer, the
  second object's lineweight and thickness (`cornerPiece`).

The jigs of LINE, PLINE, CIRCLE, ARC, RECTANG, POLYGON, ELLIPSE and SPLINE wear `currentColor`
(line/d04, rectang/d02, ellipse/d01–d02, else d01). No HPLAYER, DIMLAYER or TEXTLAYER: the current
layer.

## Ordering and undo

- **Update the tool's own state _before_ `ctx.execute(...)`**: executing synchronously rebuilds
  `EngineState`, `commandOptions()` included, so state bumped afterwards lags by one action.
- **Never clear accumulated state in `onKeyDown`** when `onDeactivate` is the commit point: the
  runtime calls `onKeyDown` first, so Escape would discard it. Exceptions, on purpose: an
  editor whose Escape _is_ discard (MTEXT's, TEXTEDIT on an MTEXT) and SPLINE, whose Escape
  cancels the whole curve.
- **One commit, one command.** A split or a multi-entity edit is one `ReplaceEntitiesCommand` /
  `UpdateEntitiesCommand`. A split keeps the object as the piece from its start (AutoCAD's handle
  stays on it): give that piece the object's id, and only a piece that is no part of it a new id.
- **A whole run of a command is one undo step, even one that does nothing (move/p07), and the
  runtime makes it**: `setActiveTool` opens a group and closes it after `onDeactivate`. A tool
  never batches across its own loop; inside the run each commit stays its own entry, which is what
  lets its Undo keyword take back one. The step is named as the command was echoed
  (`history.nameCommand`), which U and REDO write.
- `ctx.execute` takes the result back to the WCS with `Command.mapEntities`: a new `Command`
  implements it (one carrying no entities returns itself), and returns an untouched object as the
  very original so undo is exact.
- UNDO's marks, groups and settings (UNDOCTL) are `CommandHistory`'s, reached only by `UndoTool`
  and `MredoTool` through `ctx.undoHistory`; what each does is in their JSDoc and in
  `commands/Command.ts`. Any command but U, UNDO, REDO and MREDO drops the redo stack, even one
  that changes nothing.
- **The view is undone with the command that changed it.** A tool that changes the view says
  `changesView`: the runtime saves the view as it starts and puts the change into the step
  (`ViewChangeCommand`), so a tool never records a view change; a view left where it was makes no
  step unless `viewStep()` says so (-PAN). The wheel, the wheel button's pan and the ViewCube are
  no command and stay out.
- A tool offering its own **Undo keyword** counts its own edits and refuses when there are none
  (SPLINE's at one point does nothing, spline/p125; TRIM's says all undone after any answer,
  trim/p380), or `ctx.undo()` backs out an earlier command. Offer it from the first point a prompt
  holds. A transparent command run since a step ('LTSCALE) goes back with it: mark
  `ctx.historyDepth()` per step, take back with `ctx.undoTo(mark)`. A looping command restores
  its state **whatever the undo returns**: under UNDO Control None it pops nothing and LINE still
  steps back, while PLINE, which commits at its end, keeps its chain (pline/p42).
- **Preview must equal commit**: one resolver shared by `buildOverlay` and the pointer / Enter
  paths, so a typed value locks the click as it locks the rubber band. An expensive preview (a
  hatch's pattern) is built into the state when its inputs change, never per frame.

## Dynamic input (DYN)

One session at a time:

- **Coordinate prompt** — one `"coordinate"` field, collapsed to an `X,Y` / `Dist<Ang` box. Typed
  expressions (`@30,0`, `100<45`, `#x,y`) arrive via `session.commitRaw`, not `resolveValues`;
  the runtime refuses `#` typed at the command line before it reaches the box (`answerPrompt`).
- **Keyword-only prompt** — `fields: []`: the option chips, focus left on the canvas (MIRROR's
  Erase, FILLET's and OFFSET's object prompts); a test answers it as `testing.md` says.
- **One value at a time** — a box holds one value (a point's two aside, LINE's and RECTANG's):
  ARRAYRECT's values are prompts its keywords open, CHAMFER's distances two prompts. The offered
  value is the question's `enter`, taken in `commitRaw` when nothing is typed.
- **Free-text prompt** — one `"text"` field: never a value (`resolveValues` refuses it), skipped by
  the coordinate collapse, and **no keyword is dispatched from it**. A name prompt that also offers
  keywords lists them in `commandOptions()` and reads the box with `ctx.text.resolveKeyword(typed,
ids)`; a prompt that takes keywords alone (TEXT's Justify) is keyword-only, never a text field.
  Editing a value preloads it with `setText` after `open` and hides the object
  (`hiddenEntityIds`); a question opened inside a `commitRaw` may preload its default too. A field
  the drawing words (an attribute's prompt) sets `label` instead of `prompt`.
- **Multi-line text** — one `"paragraphs"` field (MTEXT's editor): a content field like `"text"`
  (test with `isContentField`, never `kind === "text"`); Enter breaks a line, Ctrl+Enter reaches
  `commitRaw`.

**After a commit the runtime replays the cursor through the tool** (`replayPointerMove`), so the
rubber band, Ortho and Polar measure from the new base at once; a reading the commit sets is
overwritten by the cursor's.

**A direction prompt's angle field shows it acute** ("all angles are displayed as 180 degrees or
less"): feed it `acuteHeading(headingInUcs(...))`, and `pointAlongCursor` reads a typed angle on the
cursor's side (`headingOnCursorSide`, `tools/ucsHeading.ts`).

**A length typed on an alignment path runs from the acquired point**: keep `input.tracking` from
the last move; for a `projection` with only the length typed, the point is
`origin + direction × length` (LINE's `pointAt`).

**A live value is a reading or a default, and Enter tells them apart.** `setLive` is a reading of
the cursor, `setDefault` the prompt's `<default>`. Enter with nothing typed (keyboard or right
button, `commitDynamicInput`): the defaults if every field holds one, else `commitRaw` on the empty
text, else the drawing's Enter. A reading never commits on its own. So a prompt whose default is
not what the box shows (MTEXT's height, CIRCLERAD, ROTATE's last angle) takes it in `commitRaw` when
`!ctx.dynamicInput.hasTypedText()`; `true` on empty text swallows Enter. A point prompt the console
asks again at Enter (RECTANG's corners, -PAN's base point) reports its refusal there and
returns `true`; `false` ends the command.

## Command shape

- A command surfaced as several rail entries (CIRCLE, ARC, ELLIPSE) is **one class parameterised
  by a mode, registered once per mode**. When AutoCAD's first prompt switches modes
  (`ELLIPSE … [Arc/Center]`), keep the constructed mode and a private `active` one that
  `invokeOption` changes and `onActivate` / Escape reset. Dropping the keywords because the rail
  offers the variants is a fidelity bug.
- A **dash command** that only takes its input differently (`-MTEXT`) is no tool: `runtimeCommands`
  starts the tool and switches its entry (`MTextTool.useCommandLine()`); the runtime heads the
  prompts with the name typed (`startedAs`). One that asks otherwise (-PAN) is a tool of its own:
  a transparent command starts its tool by id and never runs its definition's `run`.
- A command that **creates a block reference** (INSERT, BLOCK's Convert) asks attribute values
  through `AttributeValuePrompts` (`tools/attributeValues.ts`) and adds the reference only in its
  `onDone`: one undo step that Escape cancels.
- A bracketed `<Default>` is taken in the prompt's `commitRaw`: **empty text means Enter**. Never
  spend a keyword letter on what Enter does.
- A command that continues from what was drawn (LINE's Continue, DIMBASELINE, DIMCONTINUE) reads
  the drawing through a `lastDrawnPoint`-style helper, not runtime state: document order is the
  deliberate deviation from AutoCAD's session scope, the one that survives a reload. Only which end
  of an arc was drawn last is read off LASTPOINT (`continuePoint`, `lastDrawnDirection`), before
  the first point's answer moves it: an arc is stored counter-clockwise.
- `endCommand()` for single-shot commands; `onEnter()` returning `true` consumes Enter and keeps
  the command running.

## Points, snapping, constraints

- **A tool works in the frame of the UCS's XY plane** (`cad-runtime.md`): `ctx.document`,
  `ctx.viewport`, `ctx.ucs`, `ctx.pick` and every point are given there, where that plane is level,
  and `ctx.execute` takes the result back. Write a tool as if the UCS were level; never convert to
  the WCS yourself. A tool that sets the WCS or the view (UCS, PLAN, VPOINT, -VIEW, 3DORBIT)
  declares `readonly inWorld = true` and gets the real document, viewport and UCS; one that sets the
  UCS builds the patch with `ucsChange(settings, ucs, name)` (`UcsTool.ts`) as one
  `UpdateSettingsCommand`.
- **A tool with flat geometry acts only on `readsInPlan` objects** (level in the frame, and lines):
  BREAK, JOIN, HATCH, ARRAYPATH's path, the dimensions and their picks (TRIM / EXTEND: ±Z).
  Filter at the pick. FILLET and CHAMFER cut a polyline in its OCS instead.
- **Everything typed is read in the UCS.** `parseCoordinate` requires `ucs` and `elevation`; `*`
  reads WCS numbers, and without a Z lies at the WCS's Z 0, ELEVATION left out. A typed number is
  `parseNumber` / `parseDecimalNumber`, an angle `parseAngleDegrees`, never `Number()`. An
  **absolute** angle goes through `headingInUcs` / `directionFromUcsHeading`
  (`tools/ucsHeading.ts`); a **relative** one (rotation, included angle, sweep) is left alone.
- **LASTPOINT is the runtime's, never a tool's.** A typed first point passes `lastPoint:
ctx.lastPoint` with `relativeByDefault: false`; one with a base passes `base ?? ctx.lastPoint`.
  The runtime sets it after every answer whose question takes a point; a question the console shows
  keeping it, or setting it though its refusal is its own, says so with `setsLastPoint()` — check
  with `ID @` after the command in the console. A tool moves it with no point given, or keeps it
  at its own refusal, only through `ctx.setLastPoint`, which wins. UCS puts it at the WCS's origin
  as it starts (`UcsTool.onActivate`).
- **A point has a Z; keep it.** `input.point` and `parseCoordinate` give a `Vec3`. A point computed
  in the plane from another (`V.add(start, dir * length)`) keeps the base's Z: `withZOf(point,
base)`, because every `V` helper returns a `Vec2`. Type a state field that feeds `lastPoint` or a
  creation as `Vec3`, so a dropped Z fails to compile. A displacement is `sub3(to, from)`.
- **A flat object lies in the plane of the first point that fixed it**: `onPlaneOf(createX(...),
first)`, later points projected (`withZOf(point, first)`); SPLINE by limitation (spline/p200).
  `createLine` reads both ends' Z. A dimension lies at the height of the point placing its
  dimension line, whatever its origins'. Three points too (arc/p06, circle/p189). FILLET and
  CHAMFER resolve two lines with `lineCorner` (`lineCorner.ts`).
- **A grip drags to a point like any click**; only a line's end grip writes that Z into the
  object, every other grip stores `planar(point)`.
- **An edit that needs coplanar objects refuses with AutoCAD's message** (`coplanar`,
  `linesNonCoplanar`). JOIN chains one plane; HATCH takes the plane of the first boundary it finds.
- **THICKNESS is given by LINE, CIRCLE, ARC, PLINE and POLYGON only** (`withCurrentThickness`);
  RECTANG has its own, TEXT none, a rebuilt object carries the source's (not OFFSET's of a circle
  or arc).
- **A default AutoCAD aligns with the UCS is kept relative to it** (TEXT, MTEXT, ATTDEF, INSERT
  rotation via `ucsAngleToWorld`; HATCH's angle and origin; DIMLINEAR's axes; RECTANG's sides;
  ARRAYRECT's rows). A new orientation default starts at the UCS X axis.
- `wantsSnap()` — true only while prompting for a point. False for an **area** prompt (HATCH's
  internal pick): read `input.world` there, since a snapped point lands on the boundary.
- **A distance or an angle takes a point too.** A lone `distance` / `length` / `angle` box gets it
  one of two ways, and `wantsSnap()` says which. True: the tool measures its own pick
  (CIRCLE's radius, POLYGON's, TEXT's height; SCALE's factor is the distance over half the set's
  extents). False: the runtime measures it (`runtimeMeasure.ts`) from `getConstraintAnchor()` or
  asks ` Specify second point:` itself, and answers the box as if typed. Never write a two-point
  distance or angle in a tool; the console tells which a prompt is (`0,0` then `ID @`, or its
  ` Specify second point:`).
- **A typed length is direct distance: `pointAlongCursor`** (`tools/directDistance.ts`), never
  rebuilt from `directionFromUcsHeading`. Feed the live fields with `showRise(ctx, base, point)`
  first: on the `+Z` / `-Z` guide `resolveValues` leaves the angle out, so a commit passes
  `angle: null`.
- `getConstraintAnchor()` — the base Ortho/Polar restrict against, in every phase defining a
  direction, with its Z; none where Ortho leaves the pick alone, whatever `UseBasePoint` says
  (circle/d12, arc/d06).
- No hook exposes a preview to the snaps: ghosts are not objects.
- **A Tangent or Perpendicular that finds nothing** reaches the tool where `defersSnap(kind,
entity)` says so: it reads `ctx.snapOverride()` and `ctx.pick`, as LINE (`tools/deferredSnap.ts`)
  and CIRCLE (`circlesMeetingThree`, `circleOnDiameter`) do.
- `retainsTrackingAfterPointerDown()` — true when a click _begins_ an edit, so tracking survives
  the drag.
