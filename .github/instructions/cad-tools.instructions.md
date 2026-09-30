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
   then aliases), its keywords in `commands.keywords.<NAME>`, its prompts in `commands.prompts`,
   its label in `interface.tool.<id>` — then `npm run locales`. Dispatch comes from here;
   `Tool.shortcut` is display-only.
4. Export the class from `cad/index.ts`.
5. `TOOL_ICONS` and `RAIL_LAYOUT` in `components/cad/tool-rail.tsx` (unlisted tools fall into
   the trailing "More" group, so nothing silently disappears).
6. Tests in the matching `cad/application/tools/*.test.ts` file using the harness.

## Reuse before writing

- `PlacementTool` — select → base point → second point with ghost preview (Move, Copy, Stretch).
  Override `place()`, `continuesAfterPlace()`, optionally `transformEntity()` / `onSelectionAdded()`.
- `EdgeEditTool` — hover-preview-click editing against implicit boundaries (Trim, Extend).
- `SelectionActionTool` — one action over a selection set, supporting both noun-verb and
  verb-noun invocation (Explode, Join, COPYCLIP). A command that must ask something **before** the
  set — COPYBASE's base point — overrides `onActivate` and calls `begin(ctx)` once it has the
  answer, rather than forking the base class.
- `boxSelection.ts` — window/crossing box selection. Never re-implement it. `boxSelect` takes
  `ctx.viewport`, because the box is upright on the screen, which a turned view (PLAN) does not
  line up with the world.
- `SelectTool` is split so a new entity type rarely needs the tool itself: `selectToolState.ts`
  holds the state union, `selectToolGrips.ts` enumerates and hit-tests grips (**the file to edit
  when an entity type gains grips**), `selectToolOverlay.ts` draws each edit's preview, and
  `selectToolEdits.ts` holds the pure geometry helpers. `SelectTool.ts` keeps only the state
  machine. Add a grip kind in all four, never by growing the tool class. A type whose points drag
  like a polyline's vertices (a spline's fit points or control vertices) reuses the `vertex` role
  through `withVertexAt` in `selectToolEdits.ts` rather than adding a kind.
- `dimensionTextOptions.ts` — the Text and Angle keywords shared by every dimension command, so
  each of them asks with the same words. When two commands offer the same AutoCAD keyword, the
  prompt belongs in a shared helper: identical wording is part of the fidelity, not a nicety.
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
string, leave the message out rather than inventing one.

**A tool holds no text.** A dynamic-input field names its prompt by id (`{ id, prompt: "length",
kind }`), which the runtime words when it builds the state — so switching language rewords an open
prompt too. Anything the tool writes (`ctx.text.message`) or draws (`ctx.text.feedback`) comes
from the catalog; user data (a block name in a `?` listing) is the only text a tool passes on as is.

A tool never touches an adapter. Anything outside the document it needs — writing the clipboard
(`ctx.copyToClipboard`) — is a method on `ToolContext` that the runtime wires to the port.

When the answer is "that object is not eligible at all", **filter the pick instead**: an object
that never highlights has already answered the question, needs no wording to verify, and is what
DIMSPACE (non-parallel dimensions) and HATCH (objects that do not close an area) both do.

A system variable AutoCAD saves "Not-saved" — i.e. for the session — is a **private field on the
tool instance**, which the runtime owns for exactly that long: FILLET's radius, CHAMFER's two
distances, HATCH's HPNAME / HPSCALE / HPANG. Do not reset it in `onActivate`; the next run of the
command starting from the last one's settings is the behaviour. One saved in the drawing belongs
on the document instead (LTSCALE) or on a style table (DIMSCALE).

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
  `UpdateEntitiesCommand` so a single Ctrl+Z undoes the whole operation.
- A tool offering its own **Undo keyword** must count its own edits and refuse when there are
  none: `ctx.undo()` pops the history, which otherwise backs out an unrelated earlier command.
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
  focus on the canvas (Mirror's Erase Yes/No, Fillet's radius prompt).
- **Multi-field form** — several fields with `setLive(default)` so placeholders show the defaults
  and Enter commits them all (Array, Chamfer distances). Tab cycles fields.
- **Free-text prompt** — one field of kind `"text"` (TEXT's content, its Justify/Style keywords).
  Its content is never a value: `resolveValues` refuses it so `commitRaw` sees the raw string, the
  coordinate collapse skips it, and **no keyword is dispatched from it** — a letter there is
  content. A prompt whose keywords the tool reads itself (TEXT's `TL`, `MC`) resolves the typed
  text with `ctx.text.resolveKeyword(typed, ids)`, which applies the same abbreviation, word and
  `_` rules as every other prompt, and echoes the list with `ctx.text.keywordList(ids)` so the
  command line still shows AutoCAD's prompt. Editing an existing value preloads the field with `setText` after
  `open`, and the tool hides the object it is editing (`hiddenEntityIds`). A question opened from
  inside a `commitRaw` may preload its default the same way: the runtime clears only the session
  that was answered. A field the drawing words rather than the catalog (an attribute's own prompt)
  sets `label` instead of `prompt`.
- **Multi-line text** — one field of kind `"paragraphs"` (MTEXT's editor): a content field like
  `"text"` (`isContentField` is the test; never compare the kind with `"text"` alone), rendered as
  a textarea where Enter breaks a line and Ctrl+Enter reaches `commitRaw`. In the harness `type`
  writes the newlines and `enter()` is that Ctrl+Enter.

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
(`MTextTool.useCommandLine()`), so the prompts and keywords stay the plain command's.

A command that **creates a block reference** (INSERT, BLOCK's Convert) asks its attribute values
through `AttributeValuePrompts` (`tools/attributeValues.ts`) and adds the reference only in its
`onDone`, so the values, Verify and Preset behave the same everywhere and the whole insertion stays
one undo step that Escape cancels.

A bracketed `<Default>` is implemented in the prompt's `commitRaw`: **empty text means Enter, so
take the default** (DIMLINEAR's `<select object>`, DIMBASELINE's `<Select>`). Never spend a keyword
letter on something Enter already does.

A command that continues from what was drawn before it — LINE's Continue, DIMBASELINE and
DIMCONTINUE — reads the drawing through a `lastDrawnPoint`-style helper next to the tools, not
through runtime state. AutoCAD scopes those to the current session; document order is the
deliberate deviation, and it is the one that survives a reload.

**Options are named by their global keyword, never by a letter.** `commandOptions()` returns
`{ id: "Close" }` — the id is AutoCAD's language-independent word — plus `value` when the chip
shows a state (`{ id: "Erase", value: "Yes" }` reads `Erase: Yes`; the value is a keyword of the
same command, as AutoCAD's sub-prompt offers it). `invokeOption(id)` switches on ids and returns
`"continue"` or `"end"`. The word, its abbreviation (its capitals: `Close` → `C`, `desHacer` →
`H`) and the key that runs it belong to the command language and are resolved by the runtime
from `commands.keywords.<NAME>`; comparing `key.toLowerCase()` with a letter would break the day
the language changes. Every keyword a tool offers must be in its command's table.

A keyword is answered by its abbreviation or its whole word, or by `_` and the global one, typed
and confirmed — at the prompt or in a value box. A single key runs it at once only when its
abbreviation is that one letter, no other keyword on offer starts with it, and nothing has been
typed yet. Key routing has two paths, and the difference matters:

- **A DYN field is focused** → `dynamic-input.tsx` intercepts that key while the field is empty;
  anything else typed there and confirmed with Enter is resolved as a keyword before a value.
- **The canvas has focus** → `CadRuntime.keyDown` runs the keyword on its key _before_ the
  command-line buffer, mirroring AutoCAD (an alias only starts a command at the neutral prompt);
  a submitted prompt is read as a keyword before a command name.

Any tool that used to read raw letters in `onKeyDown` must expose them as command options
instead, or the command-line buffer will swallow them.

## Points, snapping, constraints

- **Everything typed is read in the UCS.** `parseCoordinate` requires `ucs: ctx.ucs` (it is not
  optional, so no call site can forget it); `*` reads the numbers in the WCS instead. An
  **absolute** angle — a heading field fed from the cursor, a typed direction — goes through
  `headingInUcs` / `directionFromUcsHeading` (`tools/ucsHeading.ts`); a **relative** one (a
  rotation, an included angle, a sweep) is the same in every UCS and is left alone.
- **A point has a Z; keep it.** `input.point` and `parseCoordinate` give a `Vec3`: `x,y` absolute
  lies on the UCS's XY plane, `@x,y` keeps `lastPoint`'s Z. A point a tool _computes_ from another
  (`V.add(start, dir * length)` for a typed length or angle, a tracking offset) is `@dist<angle`
  and keeps the base's Z: wrap it in `withZOf(point, base)`, because every `V` helper returns a
  `Vec2`. Type a state field that feeds `lastPoint` or a creation as `Vec3`, so a dropped Z fails
  to compile. A displacement is `sub3(to, from)` (MOVE, COPY, STRETCH, PASTECLIP); SCALE's base is
  a `Vec3`; ROTATE and MIRROR ignore the Z.
- **A flat object lies in the plane of the first point that fixed it** (the first vertex of PLINE
  and SPLINE, a CIRCLE's centre or first 2P/3P point, RECTANG's first corner, the insertion point
  of TEXT, MTEXT, ATTDEF and INSERT, BLOCK's base point, a dimension's first origin — or, picked
  from an object, that object's plane; chained, the base dimension's): `onPlaneOf(createX(...), first)`, and
  project the later points (`withZOf(point, first)`) rather than keep their Z. A point computed
  from the first (an ellipse's centre, MTEXT's attachment point) takes its Z the same way.
  `createLine` is the exception: a line has a Z at each end, so it reads its two points' Z itself.
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
- `getConstraintAnchor()` — the base point Ortho/Polar restrict against. Return it in every phase
  where a direction is being defined.
- `getSnapGeometry(cursor)` — expose in-progress geometry (rubber band, ghost) so intersection
  snaps engage against it.
- `retainsTrackingAfterPointerDown()` — true when a click _begins_ an edit rather than placing a
  point, so acquired tracking references survive the drag.
- `usesCrosshair()` — false only for view tools that own the cursor (PAN's hand).
- `endCommand()` for single-shot commands; `onEnter()` returning `true` to consume Enter and keep
  the command running.
