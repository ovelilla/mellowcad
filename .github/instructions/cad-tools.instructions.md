---
applyTo: "cad/application/tools/**"
description: "How to author an AutoCAD-style tool: state machines, dynamic input, command keywords, undo granularity and the registration checklist."
---

# Tool authoring

A tool is an explicit state machine for one AutoCAD command. It owns a discriminated-union
`state`, previews through `buildOverlay(ctx): ScenePrimitive[]`, and commits through
`ctx.execute(command)`. See `Tool.ts` for the full port.

## Checklist for a new command

1. `cad/application/tools/XTool.ts` implementing `Tool` (or extending a base, below).
2. `new XTool()` in the `defaultTools` list in `cad/application/runtimeTools.ts`, in rail order.
   A tool the runtime must drive directly (it is held as a `CadRuntime` field) is passed into
   that function instead of built there.
3. `TOOL_COMMANDS` in `CommandLine.ts` — the tool id → the command's **global** name. What it is
   typed as goes in `cad/locales/en.json`: `commands.names.<NAME>` (canonical AutoCAD name first,
   then aliases), its keywords in `commands.keywords.<NAME>`, its prompts in `commands.prompts`
   (named by `question()` per state, below),
   its label in `interface.tool.<id>` — then `npm run locales`. Dispatch comes from here;
   `Tool.shortcut` is display-only.
4. Export the class from `cad/index.ts`.
5. `TOOL_ICONS` and `PALETTE` in `components/cad/tool-rail.tsx`, in the ribbon panel AutoCAD puts
   it in (unlisted tools fall into a trailing group, so nothing silently disappears; a tool that
   lives elsewhere in the chrome goes in `RAIL_EXCLUDED`).
6. A command that **creates** objects gives each the properties AutoCAD gives it (below, "What a
   new object wears"), with its row in `currentProperties.test.ts`.
7. Tests in the matching `cad/application/tools/*.test.ts` file using the harness.
8. File the command in `content/commands.ts` (`COMMAND_FILING`): the landing's catalogue test
   fails until every registered command is filed.

## Reuse before writing

- `PlacementTool` — select → base point → second point with ghost preview (Move, Copy, Stretch).
  Override `place()`, `continuesAfterPlace()`, optionally `transformEntity()` / `onSelectionAdded()`.
- `EdgeEditTool` — hover-preview-click editing against implicit boundaries (Trim, Extend).
- `ObjectSelector` (`objectSelection.ts`) — AutoCAD's `Select objects:`, the one every command
  that takes a set asks it with: picks, the window a drag or a pick on nothing starts, and the
  modes typed there (Window, Crossing, BOX, Last, ALL, Fence, WPolygon, CPolygon, Previous,
  Remove/Add, Undo, AUto, SIngle, and SUbobject/Object where the set takes sub-objects), each
  counted as AutoCAD counts it. A tool holds one and, in its
  select phase, hands it `question`, `takes`, `commandOptions`, `invokeOption`, `answerTyped` (a
  point typed there picks, or starts a window), the three pointer handlers, `onEnter`, `wantsSnap`
  and `buildOverlay`. It passes `done` (the set is closed), `takes` when the set is not one with
  sub-objects (`takes: () => "wholeObjects"`: what its refusal lists, and so which modes it
  offers — MIRROR's `S` is SIngle, MOVE's asks `SIngle or SUbobject?`) and, where
  needed, its own wording (`question`), a filter (`accept`: what it leaves out is neither counted
  nor highlighted, and a pick on it starts no window) and `onAdded` (STRETCH's frames). Never
  re-implement a pick, a box or a mode in a tool. A **single object's pick** that takes the modes
  (BREAK's `Select object:`, UCS OBject's, ARRAYPATH's path curve) holds one too, with `modes`
  (what its refusal lists and is built: `ONE_OBJECT_MODES`) and `one` (`take` the object, the
  oldest or `newest` of what a mode found — per command, as the console shows): it keeps its own
  pick and its own prompt's Enter, and hands the selector its options, and everything else while
  `inMode()` (a window's corners, a fence's points). `take` is told how the mode found it
  (`ModeFind`: a fence's points, a crossing outline, or enclosing — Window, WPolygon, Last), for
  a command that reads a pick from it; `pair` takes two found at once (FILLET's first object)
  and `silent` finds none without a word.
- `SelectionActionTool` — one action over a selection set, supporting both noun-verb and
  verb-noun invocation (Erase, Explode, Join, COPYCLIP). A command that must ask something **before** the
  set — COPYBASE's base point — overrides `onActivate` and calls `begin(ctx)` once it has the
  answer, rather than forking the base class.
- `boxSelection.ts` — what a window, a fence or a polygon takes (`objectsInWindow`,
  `objectsOnFence`, `objectsInPolygon`) and their previews. Never re-implement it. Each takes
  `ctx.viewport`, because the box is upright on the screen, which a turned view (PLAN) does not
  line up with the world; a fence and a polygon test what is drawn on screen.
- `SelectTool` is split so a new entity type rarely needs the tool itself: `selectToolState.ts`
  holds the state union, `selectToolGrips.ts` enumerates and hit-tests grips (**the file to edit
  when an entity type gains grips**), `selectToolOverlay.ts` draws each edit's preview, and
  `selectToolEdits.ts` holds the pure geometry helpers. `SelectTool.ts` keeps only the state
  machine. Add a grip kind in all four, never by growing the tool class. A type whose points drag
  like a polyline's vertices (a spline's fit points or control vertices) reuses the `vertex` role
  through `withVertexAt` in `selectToolEdits.ts` rather than adding a kind.
- `cornerObjects.ts` and `polylineCorners.ts` — FILLET's and CHAMFER's objects (a line, or a
  straight segment of a polyline, `pickCornerObject`) and the polyline corners they cut: two
  segments picked within one polyline (`cutBetweenSegments`: adjacent, one apart, an open one's
  ends closing it), a line with a segment, or segments of two polylines, joined into one
  polyline (`cornerJoin`, `joinRefusal`, `joinAtCut`; CHAMFER's `cutFits`: each object's run
  on its picked side kept, the rest dropped, the polyline picked first — or the line's — kept
  with its direction, layer and colour) and the Polyline option's every corner (`cutPolylineCorners`, FILLET's arc corners and
  replaced arcs included). A corner-cutting command passes its cut, never walks a polyline
  itself. An arc segment is an object too (`isArcSegment`, `curveOf`): FILLET rounds it
  with `curveFillets.ts` — `curveCrossing` (a line whole, an arc its circle), `keptEnd` and
  `keptSide` (kept round the circle from the corner, past the arc's end when the corner
  lies beyond it), `filletSides` (radius 0 meets there) — through `cutBetweenSegments`'
  `arcs` and a `JoinCut`'s `keeps`; CHAMFER's `chords` cut it as its chord and refit what
  is left to its radius (`refitArcBulge`, `geometry/bulgeArcs.ts`). `bulgeThroughPoint`
  reads its point as the arc's middle: beside an arc pass the bisector of the radii.
  An ARC or a CIRCLE entity is FILLET's object too (`pickFilletObject`, `FilletObject`,
  `isRound`; CHAMFER says it is no line): `roundFillets.ts`' `filletRound` rounds it with
  `curveFillets.ts`' `wholeFillet` — every circle tangent to both, on the side of each where
  the other was picked, no crossing needed — and `wholeCrossing` at radius 0. The console
  rules differ from an arc segment's (which `curveCrossing` and `keptEnd` keep, needing a
  crossing): never send one kind through the other's path. Two parallel lines are capped by
  `geometry`'s `capParallelLines`, from the first line's end nearer its pick — for a line a mode
  found (`FoundObject.stands`), nearer the origin, and of a pair the newer is first.
  Their object prompts take `CORNER_OBJECT_MODES` (a single object's, not ALL) and refuse in the
  console's words (`cornerObjectRefusal`: the prompt's words but the last, Trim, Angle and mEthod
  left out; one word ends `Radius]:`); `foundFilletObject` turns what a mode found into the
  object and the pick it stands for (a fence's crossing; a line's, an arc's or a circle's middle;
  a crossed polyline's first segment crossed, read from its first vertex; a polyline found whole
  `whole`, of which nothing is made) — never invent a pick point in the tool. A point typed
  there is a pick (`typedCornerPick`, through the tool's `answerTyped`): `@` from LASTPOINT,
  which it becomes by `ctx.setLastPoint` (a point of the tool's frame, as `ctx.lastPoint` is).
  A pick at the second prompt goes through `cornerPairRefusal` first, and a mode's find
  through `foundPairRefusal`: the first object again and a segment of its polyline two or
  more away are said and refused, never filtered out.
  `pickCornerObject` takes the pointer (`world` and `screen`), and the two objects are cut
  in `cornerPlane`: a polyline in a tilted plane (with the UCS not on it) brings the
  other and both picks into its OCS — a segment picked as it is drawn — and `back` returns
  what is built, with the polyline's own normal; never cut a tilted polyline's points
  against plan picks. An ARC or a CIRCLE goes through `roundPlane` instead: in a tilted
  plane the other shares (`sharesTiltedPlane`) both and the picks — where the line of
  sight meets the plane (`viewPick.ts`' `cursorInPlane`) — are brought into its OCS for
  `filletRound`, and `back` returns them; `null` is `Two entities are non coplanar.`
- `ArcSegmentInput` (`arcSegmentInput.ts`) — the prompts AutoCAD's polyline arc options open
  (Angle, CEnter, Direction, Radius, Second pt and their `[CEnter/Radius]`, `[Angle/Length]`,
  `[Angle]`), for any command drawing a polyline's arcs (PLINE; DIST's Arc). The tool lists
  `ARC_SEGMENT_OPTIONS` among its own keywords in AutoCAD's order, calls `begin(option, { point,
tangent })`, and while `active` hands it `question`, `takes`, `commandOptions`, `invokeOption`,
  the pointer, `onEnter`, `wantsSnap` and `anchor`, drawing its `preview`; it gets back the
  `ArcSegment` (end and bulge). The arc geometry itself — the tangent arc, the bulge of an angle,
  a centre, a chord, a radius or three points, the way a segment ends heading — is
  `geometry/bulgeArcs.ts`; never solve a bulge in a tool.
- `dimensionTextOptions.ts` — the Text and Angle keywords shared by every dimension command, so
  each of them asks with the same words. When two commands offer the same AutoCAD keyword, the
  prompt belongs in a shared helper: identical wording is part of the fidelity, not a nicety.
  `measurementOf` (`DimensionTool.ts`) is the measurement as AutoCAD offers it at Text's
  `<default>` and reports it after placing (`Dimension text = 100.00`): every dimension uses it.
  TEXT's point prompts (`POINT_PROMPT`) and Style's `?` (`listTextStyles`, `TextTool.ts`) are
  ATTDEF's too, which asks "the same prompts as the TEXT command".
- `SceneBuilder.entityScenePrimitive` — always use it to draw ghosts, so new entity types render
  correctly everywhere for free. It returns a **list**, so spread it. Its fourth argument is an
  options bag: pass `{ blocks: ctx.blocks }` wherever the entity can be one the _user_ selected,
  or a block reference ghosts as nothing.

## Pick feedback

**Pick objects through `ctx.pick(world)`, never `document.pick`** — it is the one place selection
cycling (Shift+Space, the Selection list box) can change which of the overlapping objects a prompt
takes, so a tool that hit-tests the document directly silently opts out of it.

Any prompt that asks "which object?" owes a rollover highlight, drawn in `buildOverlay` from the
hovered entity via `entityScenePrimitive` (update the state only when the hovered id changes):

- a **set** prompt ("Select objects": Explode, Join, Move…) → `THEME.entityHover`, width 2, and
  skip objects already in the set — they are drawn selected (amber) anyway;
- a **single prominent** pick (path curve, break/trim target, offset source) → `THEME.selected`
  (amber), width 2–2.5. On this dark theme `entityHover` is too close to the entity colour to
  answer "which one?" on its own.

When a command deliberately does nothing — an object it cannot act on, an empty result — say so
with `ctx.report(ctx.text.message(id, values))`, which writes to the command prompt. Silence reads
as a bug. The words live in `commands.messages`, in AutoCAD's own wording
(`"{count, plural, one {# was not able to be exploded.} …}"`); if you cannot verify the exact
string, leave the message out rather than inventing one. A report AutoCAD lays out in columns or
lines (ID, DIST, UCS `?`) is one message with its spaces and `\n` kept: the command line renders
them as written.

**A tool holds no text.** A dynamic-input field names its prompt by id (`{ id, prompt: "length",
kind }`), which the runtime words when it builds the state — so switching language rewords an open
prompt too. Anything the tool writes (`ctx.text.message`) or draws (`ctx.text.feedback`) comes
from the catalog; user data (a block name in a `?` listing) is the only text a tool passes on as is.

**A tool names the question it is asking** in `question()`, by an id in `commands.prompts` whose
text is AutoCAD's prompt up to the keyword list — `Specify next point or`, no list, no colon. The
runtime does the rest from that one answer: `LINE Specify next point or [Undo]:` at the prompt,
`Specify next point or` in the dynamic prompt, and the line the history writes once it is answered.
So never write a prompt with `ctx.report`. Return the question of every state, including the ones
that still answer the same question (LINE's tracking offset, the deferred tangent); return a
`ToolQuestion` (`{ id, enter }`) when the prompt shows what Enter keeps — a length (`<10.0000>`:
CIRCLERAD, RECTANG's elevation), a point or a phrase id (`<use first point as displacement>`,
UCS's `<accept>`), or a text as the prompt writes it (`{ name: "0,0,0" }`; a point AutoCAD writes
without spaces, UCS ZAxis's `<5.00,5.00,1.00>`); a keyword Enter keeps is `defaultOption()`'s, unless
the prompt names it short (PLAN's `<Current>`: a phrase). A prompt that names something carries
it in `values` (`UCS "{name}" already exists.  Replace it?`). AutoCAD's **yes-or-no question**
lists no keywords: hidden `Yes` and `No` options, `enter: { name: "N" }`, Enter or No ending as its
default does, and `{ refusal: "yesOrNoPlease" }`. The `or` belongs to the text, so a state that offers none of the keywords
AutoCAD lists there takes an id without it (`specifyOtherCornerPoint`); a wording no source confirms
is not invented — that state returns `null` and keeps the `NAME [keywords]:` prompt. Convert a command whole: one that names no question shows `NAME [keywords]:` and
writes no prompt lines, so a half-converted one reads inconsistently. A report the answer produces
(`Current line-width is 0.0000`) is written after the answered prompt by itself; what only the
release of a pick knows — what a `Select objects:` pick found — goes on that prompt's line with
`ctx.answer(text)`, and with nothing picked yet after the command's echo (`Command: M MOVE 1 found`);
after a typed answer the runtime puts it on a line of its own (`Select objects: L`, then `1 found`).
Every `Select objects:` is an `ObjectSelector` (below, "Reuse before writing"), and a set selected
before the command is counted by `countPreselection`, which also keeps it as the Previous set —
never on its own. A keyword AutoCAD
lists with a gloss (`Ttr (tan tan radius)`) has it in `commands.keywordLabels.<NAME>`, for every
command name that offers it (CIRCLE and CIRCLED). So does one AutoCAD **declares** otherwise than
it lists — its `initget` string in Autodesk's table: TEXT's `TLeft` listed `TL`, ATTDISP's `OFf`
listed `OFF` —, whose `commands.keywords` word is the declared one: it is what answers (`TLE`)
and what `Ambiguous response` names (`TLeft or TCenter or TRight?`), the label what the list, the
`<default>` and `ctx.text.keyword` show. Every language gives both: a language's labels can
only name what English labels (keep English's even when it equals the word, as OFFSET's
`Through` for Spanish `punto a Atravesar`), and one with no label of its own lists English's.
Spanish often declares otherwise where English does not (`Atravesar`, `Actual`, `Tangencia`):
read both tables' `initget`. The console outranks the table: PLINE's arc prompt asks `CEnter or
CLose?` although its string declares `CE`, so it keeps `CEnter`. A prompt whose declared order
is not the listed one names it in its question (`declared: ["OFF", "Normal", "ON"]`), which that
question asks in (`OFf or ON?`) — only where two words on offer can be ambiguous, since nothing
else shows the order; never a second keyword id for either. A word the `initget` declares and
the list leaves out is a hidden option, after the shown ones (OFFSET's `Thru`, ELLIPSE's
`Centre`, PLINE's `LIne` in line mode, which asks the same prompt again), only once the
console shows what it does; one opening an option not built here (VPOINT's `Tripod`) stays
refused as any answer, and is noted in the coverage row.

**What a question takes** — `takes()`, a `QuestionInput` — is how the runtime refuses a wrong
answer there (`cad-runtime.instructions.md`, "Answering a prompt"). Leave it out where the default
reads right: `selectObjects` and `removeObjects` are a selection set with sub-objects; a box with a coordinate field (or
a distance and an angle) is a point, a lone distance or angle field that, a number field a number;
with no box, a point when `wantsSnap()` and a keyword otherwise. Declare what the box cannot tell:
a single object's pick (`"object"`), a 2D point (ARC's, PLINE's, MIRROR's, ELLIPSE's and POLYGON's
Edge's later points), a keyword prompt that keeps snaps on, a selection of whole objects (MIRROR,
JOIN), STRETCH's crossing one or BREAK's set of one object (`"oneObject"`; UCS OBject's, which takes
a group, `"singleSet"`), a count (`"integer"`), and a command's own words (`{ refusal:
"requiresRadius" }`; a distance or an angle measured by two points of its own while the tool has a
base point, `{ refusal: "requiresDistance", values: { points: "two", keyword: "no" } }`; several
lines, a list of ids sharing `values`: -VPOINT's `["invalidInputTryAgain", "currentViewDirection"]`). Type
`FOO` at the prompt in AutoCAD's console before declaring one: the words differ per input
function, and per command at `Select objects:`.

A tool never touches an adapter. Anything outside the document it needs — writing the clipboard
(`ctx.copyToClipboard`) — is a method on `ToolContext` that the runtime wires to the port.

When the answer is "that object is not eligible at all", **filter the pick instead**: an object
that never highlights has already answered the question, needs no wording to verify, and is what
DIMSPACE (non-parallel dimensions) and HATCH (objects that do not close an area) both do.

A system variable typed as a command (AUPREC) extends `SystemVariableTool`, which asks
`enterNewValueFor` with its name in `values` and what Enter keeps (`Enter new value for AUPREC
<0>:`), refuses in the console's words (`requiresIntegerBetween`), heads the prompt with the
name itself in every language (`systemVariable()`), is resumed as SETVAR (`Resuming SETVAR command.`) and sets the drawing's settings through
`UpdateSettingsCommand`; it is in `TRANSPARENT_COMMANDS`, as every AutoCAD system variable is
transparent. One whose name is a command's that is not transparent ('AREA, 'UCSICON) is a
`variable(…)` in `registerCommands`, never a command: typed with an apostrophe in any language,
bare where no command has the name (es `UCSICON`); a read-only one has no tool and says
`readOnlyVariable`. An angle is written with
`formatAngle` (AUPREC, `anglePrecision`), a length with `formatLength` (LUPREC): never one
precision for both.

A system variable AutoCAD saves "Not-saved" — i.e. for the session — is a **private field on the
tool instance**, which the runtime owns for exactly that long: FILLET's radius, CHAMFER's two
distances, HATCH's HPNAME / HPSCALE / HPANG. Do not reset it in `onActivate`; the next run of the
command starting from the last one's settings is the behaviour. One saved in the drawing belongs
on the document instead (LTSCALE) or on a style table (DIMSCALE).

## What a new object wears

"All objects are created using the current color" — and linetype and lineweight: CECOLOR,
CELTYPE and CELWEIGHT (`DocumentSettings.currentColor` / `currentLinetype` /
`currentLineweight`, ByLayer by default, which stores nothing on the object). Which a creation
gets decides the call at its commit, and the harness pins each one in
`currentProperties.test.ts` (a row of `FROM_SCRATCH` or of `DERIVED`):

- **Drawn from scratch** — LINE, PLINE, CIRCLE, ARC, ELLIPSE, SPLINE, RECTANG, POLYGON, TEXT,
  MTEXT, HATCH (HPCOLOR is "use current"), ATTDEF, every dimension, INSERT and BLOCK's converted
  reference: wrap it in `withCurrentProperties(entity, ctx)` (`tools/currentProperties.ts`, beside
  `withCurrentThickness`), on the current layer. DIMBASELINE and DIMCONTINUE are drawn from
  scratch too, but on the base dimension's layer and style (DIMCONTINUEMODE 1).
- **Made from another** — COPY, MIRROR, ARRAY, OFFSET, EXPLODE, BREAK, TRIM, EXTEND, JOIN,
  PASTECLIP: the source's, through `carryOverrides` / `carryPiece` / the copy helpers; never the
  current ones.
- **FILLET's arc and CHAMFER's bevel**: on the lines' shared layer or the current one, and ByLayer
  — "The layer affects object properties including color and linetype" — so `carryPlane` alone.

A ghost is drawn in the rubber band's colour whatever it will wear, so the preview needs nothing.
The per-type layers (HPLAYER, DIMLAYER, TEXTLAYER) do not exist here: everything new is on the
current layer.

## Ordering and undo

- **Update the tool's own state _before_ `ctx.execute(...)`.** Executing emits a document change
  that synchronously rebuilds `EngineState`, including `commandOptions()`. Bumping counters
  afterwards makes the UI lag by one action.
- **Never clear accumulated state in `onKeyDown`** when `onDeactivate` is the commit point: the
  runtime calls `onKeyDown` first, so Escape would race the commit and discard the user's work.
  The one exception is an editor whose Escape _is_ "discard" (MTEXT's, and TEXTEDIT on an MTEXT),
  and SPLINE, whose Escape cancels the whole curve as AutoCAD's does:
  it resets its state there on purpose, and `onDeactivate` then finds nothing to keep.
- One gesture = one command. Splits and multi-entity edits use `ReplaceEntitiesCommand` /
  `UpdateEntitiesCommand` so a single Ctrl+Z undoes the whole operation. A whole run of a command
  (LINE's segments, COPY's copies) is one undo step too, which the runtime makes by grouping:
  a tool never batches across its own loop for that.
- A tool offering its own **Undo keyword** must count its own edits and refuse when there are
  none: `ctx.undo()` pops the history, which otherwise backs out an unrelated earlier command.
  Inside the run each commit is still its own entry, so `ctx.undo()` takes back one; Ctrl+Z runs
  the keyword. Offer it from the first point a prompt holds (LINE's `[Undo]` after its first
  point), where it takes that point back.
  For a looping command, push the tool state onto a stack before each commit and restore it on
  Undo — popping the document alone leaves the tool prompting from where the undone step left it.
- **Preview must equal commit**: share one `resolveX()` between `buildOverlay` and the pointer /
  Enter paths, so a typed value hard-locks the click exactly as it locks the rubber band. When the
  preview is expensive (a hatch clips its whole pattern), build it into the tool's state whenever
  the inputs change rather than rebuilding it per frame in `buildOverlay`.

## Dynamic input (DYN)

There is a single session at a time. Patterns in use:

- **Coordinate prompt** — one field of kind `"coordinate"`; `buildDynamicInputUi` collapses it to
  an `X,Y` / `Dist<Ang` box. Typed expressions (`@30,0`, `100<45`, `#x,y`) arrive via
  `session.commitRaw`, not `resolveValues`.
- **Keyword-only prompt** — a session with `fields: []` renders just the option chips and leaves
  focus on the canvas (MIRROR's Erase Yes/No, FILLET's and OFFSET's object prompts). What is
  typed there goes to the command line, so a harness test answers it with `press` per key and
  `Enter` (`type` only fills a field).
- **One value at a time** — AutoCAD asks a command's values in turn, so a box holds one value
  (a point's length and angle aside, Tab cycling them): ARRAYRECT's columns, rows and spacings are
  prompts its keywords open, CHAMFER's two distances two prompts, the second's `<default>` the
  first. The value the prompt offers is the question's `enter`, taken in `commitRaw` when nothing
  is typed.
- **Free-text prompt** — one field of kind `"text"` (TEXT's content, a style or pattern name).
  Its content is never a value: `resolveValues` refuses it so `commitRaw` sees the raw string, the
  coordinate collapse skips it, and **no keyword is dispatched from it** — a letter there is
  content. A name prompt that also offers keywords (`Enter style name or [?]`, HATCH's
  `[?/Solid]`) lists them in `commandOptions()` and reads the box's text with
  `ctx.text.resolveKeyword(typed, ids)`, which applies the same abbreviation, word and `_` rules as
  every other prompt; a prompt that takes keywords alone (TEXT's Justify) is keyword-only, never a
  text field. Editing an existing value preloads the field with `setText` after
  `open`, and the tool hides the object it is editing (`hiddenEntityIds`). A question opened from
  inside a `commitRaw` may preload its default the same way: the runtime clears only the session
  that was answered. A field the drawing words rather than the catalog (an attribute's own prompt)
  sets `label` instead of `prompt`.
- **Multi-line text** — one field of kind `"paragraphs"` (MTEXT's editor): a content field like
  `"text"` (`isContentField` is the test; never compare the kind with `"text"` alone), rendered as
  a textarea where Enter breaks a line and Ctrl+Enter reaches `commitRaw`. In the harness `type`
  writes the newlines and `enter()` is that Ctrl+Enter.

**After a commit the runtime replays the cursor through the tool** (`updateSnap` +
`replayPointerMove`), so the rubber band, Ortho and Polar measure from the new base at once and a
length typed next, mouse unmoved, runs towards the cursor. A reading the commit sets is
overwritten by the cursor's; a tool must not rely on it.

**A direction prompt's angle field shows it acute** — "all angles are displayed as 180 degrees or
less" — and reads a typed angle on the cursor's side: feed the field
`acuteHeading(headingInUcs(...))` and `pointAlongCursor` reads the angle it is handed on the
cursor's side (`headingOnCursorSide`, `tools/ucsHeading.ts`), the cursor's own acute reading
included. A tool still feeding 0–360 there would have its readings mirrored below the X axis.

**A length typed on an alignment path runs from the acquired point**: keep `input.tracking` from
the last move, and when it is a `projection` (an OTRACK guide, an Extension) and only the length is
typed, the point is `origin + direction × length` (LINE's `pointAt`).

**A live value is a reading or a default, and Enter tells them apart.** `setLive` is a reading of
the cursor (LINE's length, a grip's radius, a 0 / `null` placeholder); `setDefault` is the prompt's
`<default>` (a form's value, the current height, FILLET's radius). Enter with nothing typed is Enter
at the Command prompt, on the keyboard and the right button alike (`commitDynamicInput`): the
defaults if every field holds one, else `commitRaw` on the empty text, else the drawing's Enter
(`keyDown`: the tool's `onEnter`, or the command ends). A reading never commits on its own; beside a
typed field it fills the untyped one (a typed length takes the cursor's heading). So a prompt whose
default is not what the box shows — the cursor overwrites it (MTEXT's height, UCS Z's `<90>`) or the
tool remembers it (CIRCLERAD, ROTATE's last angle, SCALE's last factor, OFFSETDIST) — takes it in
`commitRaw` when `!ctx.dynamicInput.hasTypedText()`, and a `commitRaw` that returns `true` on empty
text swallows Enter.

## Command options (keywords)

Mirror AutoCAD's prompt: the same sequence of prompts, the same keywords, the same trigger letters
and the same default shown in `<angle brackets>`. A user's muscle memory is the acceptance
criterion — inventing a friendlier letter or reordering the prompts breaks it.

A command surfaced as several rail entries (CIRCLE, ARC, ELLIPSE) is **one class parameterised by a
mode and registered once per mode**. When AutoCAD's own first prompt can switch between those modes
(`ELLIPSE ... or [Arc/Center]`), keep the constructed mode and the running one apart: a private
`active` field that `invokeOption` changes and `onActivate` / Escape reset. Dropping the keywords
because the rail already offers the variants is a fidelity bug — typing `EL` then `C` is how the
command is actually used.

A **dash command** that only takes its input differently (`-MTEXT`) is not a tool or a rail entry:
`runtimeCommands` registers it against the tool's id, starts the tool and then switches its entry
(`MTextTool.useCommandLine()`), so the prompts and keywords stay the plain command's; the runtime
heads them with the name typed (`startedAs`: `-MTEXT Specify first corner:`).

A command that **creates a block reference** (INSERT, BLOCK's Convert) asks its attribute values
through `AttributeValuePrompts` (`tools/attributeValues.ts`) and adds the reference only in its
`onDone`, so the values, Verify and Preset behave the same everywhere and the whole insertion stays
one undo step that Escape cancels. In that phase the tool's `question()` is the prompts' own
(`Prompt one <def1>:`, the drawing's words through `attributeValuePrompt`).

A bracketed `<Default>` is implemented in the prompt's `commitRaw`: **empty text means Enter, so
take the default** (DIMLINEAR's `<select object>`, DIMBASELINE's `<Select>`). Never spend a keyword
letter on something Enter already does. A keyword prompt whose default is a keyword — the current
value, as UCSICON's and NAVVCUBE's `<ON>` — names it by id in `defaultOption()`, and the prompt
shows it after the list.

A command that continues from what was drawn before it — LINE's Continue, DIMBASELINE and
DIMCONTINUE — reads the drawing through a `lastDrawnPoint`-style helper next to the tools, not
through runtime state. AutoCAD scopes those to the current session; document order is the
deliberate deviation, and it is the one that survives a reload.

**Options are named by their global keyword, never by a letter.** `commandOptions()` returns
`{ id: "Close" }` — the id is AutoCAD's language-independent word — plus `value` when the chip
shows a state (`{ id: "Rotate items", value: "Yes" }` reads `Rotate items: Yes`; the value is a
keyword of the same command, as AutoCAD's sub-prompt offers it). A keyword AutoCAD answers with a
sub-prompt of its own (OFFSET's Erase and Layer: `Erase source object after offsetting? [Yes/No]
<No>:`) is a phase of the tool whose `question()` names it, with that answer as `defaultOption()`,
never a chip toggled in place. `invokeOption(id)` switches on ids and returns
`"continue"` or `"end"`. The word, its abbreviation (its capitals: `Close` → `C`, `desHacer` →
`H`; digits count as capitals, so CIRCLE's `3P` is typed whole; `?`, the listing keyword, is its own) belong to the command language and are resolved by the runtime
from `commands.keywords.<NAME>`; comparing `key.toLowerCase()` with a letter would break the day
the language changes. Every keyword a tool offers must be in its command's table. A keyword one
prompt spells otherwise — AutoCAD's `initget` is per prompt, so Spanish FILLET's `[RAdio]` is
`[Radio]` at `Designe polilínea 2D o` — goes in `commands.promptKeywords.<promptId>`, which the
runtime reads for the question the tool is asking (`askedPrompt`); never a second keyword id. Two
prompts of one command that spell a keyword apart therefore need prompt ids of their own, even
with the same words (-VIEW's `viewOption` and `viewOrthographic`, both `Enter an option`: the
first's hidden `RIght`, Orthographic's `Right`).
An option spelled at another prompt names it (`{ id: "Window", hidden: true, prompt:
"selectObjects" }`): the selection modes live once, in `promptKeywords.selectObjects`, for every
command's `Select objects:` however the command words it (JOIN's, DIMSPACE's).

A keyword is answered by its abbreviation, its whole word or the word's start as far as its first
capital and on (`OB` for `Object`, `C` for `CEnter`; not `E` for `eXit`, and no number), or by `_`
and the global one, typed and confirmed with Enter or Space — at the prompt or in a value box, as in
AutoCAD; no key runs one on its own. The runtime matches them (`matchKeywords`): an answer that
reaches past the capitals of several is the first of them (`TH` for `Through`, not `Thru`); one that
starts several, stops short of their capitals and is none's abbreviation or word asks which
(`CEnter or CLose?`), so two keywords
of one prompt may share their first letters — that is AutoCAD's own answer, never a reason to
re-letter one. `resolveKeyword` is the stricter match for words a tool reads itself (a pattern
name, `?`) and for object snaps, which need their three letters (`CE` is no snap). What is typed in a value box (or on the drawing, which feeds the box) is resolved as a
keyword before a value; a submitted prompt is read as a keyword before anything else but, at a
point prompt, an object snap's name (`CEN` at PLINE's arc prompt is Center, not `CEnter`; never
re-letter a keyword for it), and an alias only starts a command at the neutral prompt.

Any tool that used to read raw letters in `onKeyDown` must expose them as command options
instead, or the command-line buffer will swallow them.

## Points, snapping, constraints

- **A tool works in the frame of the UCS's XY plane** (`cad-runtime.instructions.md`, "The UCS
  frame"): `ctx.document`, `ctx.viewport`, `ctx.ucs`, `ctx.pick` and every point are given there,
  where that plane is level, and `ctx.execute` takes the result back to the WCS. Write a tool as
  if the UCS were level and never convert to the WCS yourself. A tool that sets the WCS or the
  view declares `readonly inWorld = true` instead; one that sets the UCS builds the settings patch
  with `ucsChange(settings, ucs, name)` (`UcsTool.ts`, which also puts ELEVATION back to 0 for the
  WCS) and executes it as one `UpdateSettingsCommand`.
- **A tool with flat geometry acts only on `readsInPlan` objects** — those level in the frame, and
  lines: TRIM / EXTEND (edges and objects), BREAK, OFFSET, JOIN, HATCH, ARRAYPATH's path, the
  dimensions and DIMBASELINE / DIMCONTINUE / DIMSPACE's picks. Filter at the pick, so an object at
  an angle to the UCS does not highlight (AutoCAD projects some with PROJMODE: a recorded gap).
  FILLET and CHAMFER of polylines need no filter: they work in the polyline's own OCS.
- **Everything typed is read in the UCS.** `parseCoordinate` requires `ucs: ctx.ucs` and
  `elevation: ctx.elevation` (neither is optional, so no call site can forget); `*` reads the
  numbers in the WCS instead. An **absolute** angle — a heading field fed from the cursor, a typed
  direction — goes through `headingInUcs` / `directionFromUcsHeading` (`tools/ucsHeading.ts`); a
  **relative** one (a rotation, an included angle, a sweep) is the same in every UCS and is left
  alone.
- **LASTPOINT is the runtime's, never a tool's.** A typed point with no base of the tool's own (a
  first point) passes `lastPoint: ctx.lastPoint` with `relativeByDefault: false`, so `@` is
  from the last point given in any command; one with a base passes `base ?? ctx.lastPoint`. The
  runtime sets it after every answer whose question takes a point (`takes()` or the box says
  `"point"` / `"point2d"`): the pick, else where the answer moved the tool's anchor
  (`getConstraintAnchor`), else the coordinate typed. A question AutoCAD's console shows keeping
  it although it takes a point (DIST's second point, COPY's), or setting it although its refusal
  is its own (ZOOM's first prompt, DIST's Multiple points), says so with `setsLastPoint()`;
  check with `ID @` after the command in the console. A UCS change puts it at the new UCS's
  origin (the runtime, not while `history.replaying`: U leaves it); a tool moves it with no
  point given only through `ctx.setLastPoint` — UCS Previous and Restore, to the WCS origin.
- **A point has a Z; keep it.** `input.point` and `parseCoordinate` give a `Vec3`: `x,y` absolute
  lies ELEVATION above the UCS's XY plane, `@x,y` keeps `lastPoint`'s Z. A point a tool
  _computes_ from another in the plane (`V.add(start, dir * length)`) is `@dist<angle` and keeps
  the base's Z: wrap it in `withZOf(point, base)`, because every `V` helper returns a `Vec2`. A
  typed length along the cursor goes through `pointAlongCursor` (below), and a tracking offset
  runs along `TrackingResult.direction`, a `Vec3` (`add3`). Type a state field that feeds
  `lastPoint` or a creation as `Vec3`, so a dropped Z fails
  to compile. A displacement is `sub3(to, from)` (MOVE, COPY, STRETCH, PASTECLIP); SCALE's base is
  a `Vec3`; ROTATE turns about the UCS's Z and MIRROR reflects in the plane holding the mirror
  line and that Z, which in the frame is a plan rotation and reflection.
- **A flat object lies in the plane of the first point that fixed it** (the first vertex of PLINE
  and SPLINE, a CIRCLE's centre or first 2P point, RECTANG's first corner, the insertion point
  of TEXT, MTEXT, ATTDEF and INSERT, BLOCK's base point): `onPlaneOf(createX(...), first)`, and
  project the later points (`withZOf(point, first)`) rather than keep their Z. A point computed
  from the first (an ellipse's centre, MTEXT's attachment point) takes its Z the same way.
  `createLine` is the exception: a line has a Z at each end, so it reads its two points' Z itself.
  **A dimension is the other exception**: it lies at the height of the point that places its
  dimension line (DIMBASELINE / DIMCONTINUE: the base dimension's), whatever its origins' —
  snapped on objects above the plane, AutoCAD's still lands on the current elevation.
- **Three points fix their own plane.** CIRCLE 3P and ARC through three points use
  `planeThrough(p1, p2, p3)` (`threePointPlane.ts`): the normal and the points in its OCS, built
  with `withNormal`; `null` (level or collinear) falls back to the plane of the first point. FILLET
  and CHAMFER resolve two lines with `lineCorner` (`lineCorner.ts`): their level plane, the tilted
  one they share (`linesPlaneNormal`), or `null` for `linesNonCoplanar`. A preview of a result
  that may be tilted is drawn with `entityScenePrimitive` under a fixed id (`"circle-preview"`),
  never as a screen-space circle.
- **A grip drags to a point like any click**: unsnapped, the elevation plane; snapped, the
  object's Z; typed as a distance, the grip's own Z. The base of a move grip is at its object's
  Z there (`entityZAt`), so a move is `sub3`. Only a line's end grip writes that Z into the object;
  every other grip is planar and stores `planar(point)`.
- **An edit that needs its objects coplanar refuses with AutoCAD's message** (`coplanar`, then
  `linesNonCoplanar` — FILLET and CHAMFER, which go back to their first prompt). JOIN only chains
  segments in one plane and leaves a rising line out (AutoCAD would make a 3D polyline); HATCH
  takes its plane from the first boundary it finds — the nearest object to an internal point,
  the first selected object — and neither traces nor highlights an object at another height.
- **THICKNESS is given by LINE, CIRCLE, ARC, PLINE and POLYGON only**: wrap what they create in
  `withCurrentThickness(entity, ctx)`. RECTANG has its own Elevation and Thickness, TEXT none, and
  an object rebuilt from another carries the source's (`carryOverrides` / `carryPlane`), never the
  variable.
- **A default AutoCAD aligns with the UCS is kept relative to it**: TEXT, MTEXT, ATTDEF and
  INSERT remember their rotation from the UCS X axis and add the UCS's own on commit
  (`ucsAngleToWorld`); HATCH does the same with its angle and starts at the UCS origin; DIMLINEAR's
  horizontal and vertical, RECTANG's sides and ARRAYRECT's rows and columns are the UCS's; BLOCK
  defines its objects in the UCS and turns the converted reference back. A tool that invents a new
  orientation default starts it at the UCS X axis.
- `wantsSnap()` — true only while prompting for a point; false while picking objects or
  box-selecting (otherwise markers and lattice snapping make objects hard to hit). False too for a
  prompt that asks for an **area** rather than a point — HATCH's internal pick — and read
  `input.world` there, not `input.point`: a point pulled onto an endpoint has landed on the very
  boundary it was meant to be inside.
- **A distance or an angle takes a point too** — AutoCAD's input measures it from the prompt's
  base point, or asks ` Specify second point:` for a second. A lone `distance` / `length` /
  `angle` box gets it one of two ways, and `wantsSnap()` says which. True: the point is the
  tool's, a pick (a typed one is given as a pick, after a move there), measured by its own
  `onPointerDown` — CIRCLE's radius from the centre, POLYGON's radius, which also turns it, TEXT's
  height. False: the runtime measures it (`runtimeMeasure.ts`) from `getConstraintAnchor()`, or,
  with none, asks the second point itself — rubber band, snaps and the box's reading included —
  and answers the box with the value as if typed, so the tool's `commit` is all it needs: FILLET's
  radius, CHAMFER's distances, OFFSET's distance, RECTANG's and ELEV's, the array spacings and
  angles, DIMLINEAR's Rotated and a dimension's text Angle, SCALE's reference and Points' new length, Ttr's radius. A
  tool whose prompt AutoCAD measures by two points returns no anchor there (VPOINT's Rotate
  angles, measured from the origin by one, return the origin). Never write a two-point distance
  in a tool; check in the console which of the two a prompt is (`0,0` then `ID @`, or the
  ` Specify second point:` it asks).
- **A typed length is direct distance: `pointAlongCursor`** (`tools/directDistance.ts`), "measured
  along the path from the last point to the current location of the cursor" — the heading in the
  plane keeping the base's Z, or up or down the UCS's Z when the cursor is straight above or below
  the base (the `+Z` / `-Z` guide); a typed angle always wins and lies in the plane. Never rebuild
  it in a tool from `directionFromUcsHeading`. Feed the live fields with `showRise(ctx, base,
point)` first: on the guide it shows the height and `+Z` / `-Z` (`setLiveText`, a reading that
  is no number), and `resolveValues` then leaves the angle out, so a commit passes `angle: null`
  and lets the cursor decide.
- `getConstraintAnchor()` — the base point Ortho/Polar restrict against. Return it in every phase
  where a direction is being defined, with its Z: a 3D view's Z guide starts there.
- No hook exposes a preview to the snaps: the rubber band and ghosts are not objects (AutoCAD
  intersects only the polar path with them, which the runtime supplies).
- `ctx.runningSnaps` reads and sets the running object snaps (OSMODE), for -OSNAP.
- **A Tangent or Perpendicular given with no point to measure from is deferred**, as AutoCAD
  defers it: the snap engine offers nothing without an anchor, so the tool reads
  `ctx.snapOverride()` at the pick and `deferredPick` (`tools/deferredSnap.ts`) takes the object;
  `deferredFrom` works the point out from the next one and `deferredPair` the line touching two.
  LINE's first point uses it; a command with a first point of its own reuses it.
- `retainsTrackingAfterPointerDown()` — true when a click _begins_ an edit rather than placing a
  point, so acquired tracking references survive the drag.
- `usesCrosshair()` — false only for view tools that own the cursor (PAN's hand).
- `endCommand()` for single-shot commands; `onEnter()` returning `true` to consume Enter and keep
  the command running.
