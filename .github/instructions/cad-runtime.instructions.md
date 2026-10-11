---
applyTo: "cad/application/*.ts,cad/application/commands/**,cad/application/constraints/**,cad/application/input/**,cad/application/snapping/**,cad/application/tracking/**,cad/adapters/**"
description: "Runtime and interaction plumbing: the point-resolution pipeline, key routing order, snapping/tracking engines, command history, EngineState and the browser adapters."
---

# Runtime and interaction plumbing

`CadRuntime` is the DOM-free orchestrator; `CadEngine` (adapters) is the composition root that
owns the browser. Everything here is interaction machinery — geometry and modelling rules live in
the engine instructions, tool authoring in the tools instructions.

## Where a `CadRuntime` method lives

`CadEngine` delegates to `CadRuntime` one method at a time, so **the class's public names and
signatures are a hard contract**: the adapter and the React layer break if one moves. The class is
kept small by hollowing methods out, never by renaming them — the method stays and becomes a
one-line delegation to a free function in a `runtime*.ts` sibling.

| Sibling                  | Holds                                                                   |
| ------------------------ | ----------------------------------------------------------------------- |
| `runtimeTools.ts`        | `defaultTools` — every tool the constructor registers, in toolbar order |
| `runtimeCommands.ts`     | the command table (`registerCommands`), `offerOptions`, `commandPrompt` |
| `runtimeLayers.ts`       | layer table edits (`updateLayer`, `nextLayerName`)                      |
| `runtimeStyles.ts`       | the dimension and text style tables                                     |
| `runtimeProperties.ts`   | `setSelection*` overrides and the `commonSelection*` readers            |
| `runtimeBlocks.ts`       | `purgeBlocks`, `buildBlockPreview` (on `drawingPreview.ts`)             |
| `runtimeFiles.ts`        | serialize/load, the clipboard read-with-timeout, `selectAll`            |
| `runtimeShortcutMenu.ts` | what a right-click does (`rightClickResponse`), the menus' entries      |

**A sibling takes the collaborators it needs (`document`, `selection`, `history`, …), never the
runtime.** Wanting many private fields is the signal that the code belongs in the class — which is
why the pointer pipeline, `keyDown`, `updateSnap`, selection cycling, the FROM modifier and
`buildState` are still in it. `registerCommands` is the one exception: a command _is_ a call into
the public API, so it receives the runtime plus the two private entry points it cannot reach
(`startTool`, `registerCommand`), and imports `CadRuntime` as a **type only** so no import cycle
exists at runtime.

`drawingPreview.ts` is the one way to draw objects **without** the editor: `buildDrawingPreview`
frames a drawing (or part of it) with every aid off, and parts of one drawing share a camera by
default so they overlay to the pixel. Block thumbnails and the landing's figures both use it.
`commandCatalog()` reads the registered command table off a headless runtime
(`CadRuntime.listCommands()`), so nothing outside the engine restates it.

## The precision pipeline (`PointResolver`)

```
object snap  →  object-snap tracking  →  snap mode (lattice)  →  constraints (Ortho/Polar)
```

- A direct snap **wins** over tracking, the lattice, Ortho and Polar and is returned untouched —
  "Ortho is ignored when you … specify an object snap"; never feed a snap point to a constraint.
  A line's Extension comes back with a `TrackingResult` too (`extensionPath`), so a typed
  distance runs along it from the acquired end as along an OTRACK guide.
- A typed `<angle` (`setAngleOverride`, set by `pointModifier` while the tool has an anchor)
  comes right after the snap: the point slides on the line through the anchor at that heading,
  at the anchor's Z, over tracking, the lattice, Ortho and Polar ("coordinates and object snaps
  take precedence"). `resetTracking` drops it with the acquired points: it holds for one point.
- When tracking engages, its point already accounts for the active Ortho ray, so it is returned
  as-is and constraints are skipped.
- Shift held is `orthoOverride`: it **toggles** Ortho (off when it is on, on when it is off) and
  Polar yields to it either way; `ConstraintManager` and `aidState` both read it so.
- `allowSnapMode` is false while a tool is merely picking objects (`wantsSnap()` false) — rounding
  the cursor would make objects hard to hit.
- Polar snap only rounds when Ortho/Polar provides an alignment path to measure along.

**Horizontal and vertical are the UCS's.** `ConstraintContext.ucs` and `DrawingAidState.ucs` are
required, and `SnapMode.snapPoint` takes the UCS: Ortho locks to its axes, polar angles and OTRACK
guides count from its X axis, and the snap lattice starts at its origin. The resolver reads it
through a `() => Ucs` so a UCS change needs no rewiring. A new aid that has a direction takes the
UCS the same way; one that assumes world X is a bug that only shows once the UCS turns.

**Only snapping and tracking may move the crosshair.** Constraints bend the _point_ a tool
receives, never the cursor: the crosshair must keep following the physical mouse, or the user is
drawing blind. `updateSnap` picks `snap.point` → `tracking.point` → raw screen, in that order —
but a snap found through its object, its point beyond the release radius (the centre from the
rim, a perpendicular foot), leaves the crosshair on the pointer: only the marker and the rubber band go.

**The point carries a Z** (`ResolvedPoint.point` and `PointerInput.point` are `Vec3`), taken in
the same order: a snap's is the object's there (`SnapCandidate.point` is a `Vec3`; providers build
it with `on(entity, point)`, which reads `entityZAt`), a tracked point's is the acquired point's,
and otherwise the elevation plane (`ucs.origin.z` + ELEVATION; the resolver reads both through
getters). Constraints and the lattice work in plan and the resolver puts the Z back after them,
but for the `+Z` / `-Z` guide below.
Intersection is 3D (`meetingHeight`: two objects that cross in plan at different heights do not
meet; the rubber band meets anything); Apparent Intersection is where two edges, extended, cross
on the screen, on the first one at its height. `input.world` is the unsnapped cursor on the work
plane: it is for picking.

**The `+Z` / `-Z` guide** (`constraints/zGuide.ts`) exists only where the UCS's Z shows on the
screen (`zOnScreen`: never in a plan, nor in the PLAN of a tilted UCS, so the 2D arithmetic there
is untouched and the landing's snapshots guard it). It is the Z through the anchor, measured on the
screen: `ConstraintContext.view` is the frame's camera and `world` the work-plane cursor it draws
where the pointer is. Polar engages it within its aperture and keeps it against a polar angle drawn
farther from the cursor (the Z on a tie); Ortho locks to whichever of X, Y and Z is drawn nearest.
Locked to it, a constraint returns a `PointAlongZ` (`isAlongZ`) — the anchor in plan at its own
height, which the resolver keeps instead of the work plane's (PolarSnap rounds the rise, the
lattice does not) — `ray()` is `null` and `alongZ()` / `activeAlongZ()` give the point. OTRACK
adds a `kind: "z"` guide per acquired point (`TrackingGuide.dir` and `TrackingResult.direction`
are `Vec3`); a crossing with a Z line, a guide's or the anchor's (`anchorUp`), is taken on the
screen and lifted onto that line. Off the plan every OTRACK guide is measured where it is drawn, at
its point's height (`nearestOnScreen`), and two guides of the plane cross where they are drawn
crossing, on the first — the rule Apparent Intersection follows. The anchor keeps its Z
(`getConstraintAnchor()` may give a `Vec3`, `toolAnchor` passes it on): it is where the guide
starts.

A tool returning `usesCrosshair() === false` (PAN) opts out entirely: no crosshair is drawn and
`updateSnap` leaves the cursor the tool set, instead of forcing `"none"`.

## The view (`Viewport`)

`Viewport` owns the camera _and_ the view history that ZOOM Previous walks. **Call
`pushHistory()` once per user gesture, before changing the view** — a wheel burst
(`WHEEL_BURST_MS`) and a pan drag are each one entry, not one per event. `zoomToBounds` is the
single "frame this rectangle" operation; use it rather than composing `zoomAt` + `centerOn`.

**The camera is an orthonormal base**: `right`, `up` and `direction` (towards the viewer) in the
WCS, plus scale and translation; `setView(direction, right)` aims it and ZOOM Previous restores the
whole base. `isPlan` (looking down Z) keeps the 2D arithmetic, so the plan's output does not move
by a bit — the landing's SVG snapshots guard it. In plan the view can be turned (PLAN,
VIEWTWIST: `right` is the world direction drawn pointing right). A screen rectangle is therefore
upright in the **view frame** (`worldToView`), not in the world. Anything
that tests or frames one works there: `objectsInWindow` tests `entityInView`, ZOOM Window / Extents /
Object and PLAN frame `entitiesViewBounds` with `zoomToViewBounds` (`zoomToBounds` is for a
_world_ rectangle, which a turned view fits by its bounding box), and a visible-area query maps all
four screen corners, never two. Two opposite corners through `screenToWorld` only bound the view
while it is untwisted — the bug stays invisible until someone runs PLAN in a turned UCS.

**Off the plan a screen point is a line of sight.** The cursor is where it meets the work plane
(the UCS's XY plane at ELEVATION, `screenToPlane`); seen edge-on there is none, pointing says
`pointingEdgeOn` and `screenToFacing` stands in for picking. Picking and snapping measure **on the
screen**: `viewPick.ts` takes the cursor into each object's plane through the inverse of its
affinity, asks the 2D query and measures the answer in pixels (an object seen edge-on, on its
outline); snap providers use `SnapContext.cursorOn(entity)`, `isNear(point, px)` and `view`, never
a world tolerance. In plan the 2D queries run as before, and a tilted object is measured by its
outline on the screen (`planDistanceToEntity`, `drawsTilted`).

## The UCS frame (`UcsFrame`)

**Tools and the pointer pipeline work in the frame of the UCS's XY plane** (`ucsFrame.ts`,
`CadRuntime.frame`, remade when the UCS changes): the world read in the OCS of the UCS's Z, where
that plane is level and the UCS an ordinary level one. `frame.document` reads every object there
(cached), `frame.viewport` is `Viewport.inFrame(axes)` — the same camera and history in rotated
axes — and `frame.ucs` is the UCS as the frame sees it. With an upright UCS the frame is the
identity: the same document, viewport and objects.

- The resolver, snaps, tracking, picking, the cursor, the polar guide and the scene's aids read
  `this.frame`; reading `this.viewport`, `this.document` or the UCS directly for anything the
  cursor touches is a bug that only shows with a tilted UCS. What the user reads leaves the frame
  on the way out (`cursorUcs`, `snap.point`).
- `ctx.execute` takes what a tool commits back to the WCS with `Command.mapEntities`, which every
  command implements (one that carries no entities returns itself). An object the tool did not
  touch comes back as the very original, so undo is exact.
- **A tool that sets the WCS or the view declares `inWorld`** (UCS, PLAN, VPOINT, -VIEW, 3DORBIT):
  it gets the real document, viewport and UCS, and its pointer input converted back (`forTool`).
- Tracking points acquired in one UCS are dropped when it changes; a snap's `direction`
  (Extension, Parallel) is a frame direction, drawn with the aid camera.

## Key routing (`CadRuntime.keyDown`) — order is load-bearing

1. Escape closes an open snap-override menu, shortcut menu or Selection list box, or cancels the
   FROM modifier, without ending the command. It also collapses the expanded command history, and
   that one goes on: the same Escape still cancels. (On the page an open menu keeps its keys —
   "Adapters" — so this is the harness's and a host's path.)
2. Function keys: F2 command history, F3 osnap, F7 grid, F8 Ortho, F9 snap mode, F10 Polar,
   F11 OTRACK, F4 selection cycling (AutoCAD's Ctrl+W, which browsers keep, is accepted too).
3. Ctrl combos (undo/redo — Ctrl+Z is the running command's Undo keyword when it offers one,
   else `undo()`, which ends a running command first so it goes whole —, AutoCAD's window
   shortcuts Ctrl+9 command line, Ctrl+0 Clean Screen and Ctrl+1 Properties, Ctrl+S save, Ctrl+O open, Ctrl+C/X/V copy-cut-paste, Ctrl+Shift+C copy
   with base point, Ctrl+A select all), then Shift+Space (selection
   cycling) — a global aid, like the function keys, and it must beat the command prompt, which
   reads a bare space as Enter.
4. **No key runs a keyword on its own**: as at AutoCAD's prompt it is typed and confirmed (step 6).
   Run on its letter, `C` Enter closed LINE and its Enter then repeated LINE.
5. **With a value box up** (`typingField`: a session with a field that is not content, nothing at
   the command line, no menu open) a printable key goes into the box's active field, Backspace
   edits it and Enter or Space (not Shift+Space) is `pressEnter`. The box takes focus back only
   after a render, and a first key that reached the command line split `100` into `1` there and
   `00` in the box. `commitDynamicInput` hands an unanswered Enter on to the drawing under
   `enterFromBox`, which this step lets through.
6. Everything else feeds the **command-line buffer** (this is why multi-character aliases work and
   why no tool may claim a bare letter in `onKeyDown`). Submitted, it is read first as a keyword
   of the running command (abbreviation, word, or `_` and the global one), then as a point
   modifier (an object snap, FROM, `<angle`), then as a transparent command (`'ZOOM`, below), then — with a value box up — as the prompt's answer
   (`answerPrompt`: put in the box and committed, a coordinate without `@`/`#`/`*` given its
   `#`, because the relative default is the tooltip's, DYNPICOORDS); mid-command anything else is
   a wrong answer, refused (below, "Answering a prompt") and never run as a command. Only at the
   neutral prompt is it a command name (the command language's names and aliases, or `_` and a
   global name). Empty, it is the prompt's Enter mid-command and repeats the last command at the
   neutral prompt, as Enter and Space on the drawing do.
7. Tail: Space (not Shift+Space) is Enter mid-command, as at AutoCAD's prompt — so no tool handles
   `" "` itself; Escape/Enter → the tool's `onEnter`, else `returnToNeutralTool`; anything else →
   `activeTool.onKeyDown`.

Inserting anything above step 4 steals keys from running commands; inserting between 4 and 6
steals them from typing. Prefer exposing behaviour as a command option or a command.

## Answering a prompt — the history writes it

Every way input answers the running command's question goes through `answering(answer, run)`: a
pick (`dispatchPointerDown`), the box (`commitDynamicInput`, its keyword and value), a keyword
(`invokeToolOption`, the menus and Ctrl+Z included), the command line (`answerPrompt`), `<angle`,
FROM (`startFrom`, `_from` from the menu), Enter and Escape (`keyDown`'s tail, `cancelDynamicInput`
— `*Cancel*`). It reads the question **before** `run` (`commandPrompt(...).echo`) and, once `run`
says the answer was taken, writes `question answer` at the mark it took, ahead of whatever answering
it reported (`CommandLineController.mark` / `writeAt`). Only the outermost call writes: the command
line's answer reaches the box, the box a keyword or the drawing's Enter. A new way to answer must go
through it, or the history loses that step. An object snap is not an answer: `setSnapOverride`
keeps it as `answerPrefix` (`_endp of`, typed `end of`), which the next answer writes on its line —
a pick, a typed point or `*Cancel*` — and a pick FROM takes as its base, or a tool switch, drops. `ctx.answer` completes a line after the
fact (`amendLast`), but only one written since the running command started (`commandStart`, its
echo included): it never lands on the previous command's last prompt.

**A pick answers on its prompt's line** (`answering(…, picked)` from `dispatchPointerDown`): what it
found (`ctx.answer`) follows the bare prompt, whether the press knows it (`pickFound`) or only the
release does (`openLine`, while nothing else has been written); after a typed answer or Enter it
goes on a line of its own, as AutoCAD's Enter ends the line. A prompt AutoCAD prints without a
new line (`continuesLine`: `Specify opposite corner:`) is written on the line a pick left bare:
`Select objects: Specify opposite corner: 2 found`. Add one to `continuesLine` only from its
string in Autodesk's table (no leading new line).

**A wrong answer is refused, never run.** What is typed at a prompt with no box goes to the tool's
`answerTyped` (a point at `Select objects:`). What is neither a keyword, a point modifier nor what
the question takes — at the command line, or in the box when its commit returns `false` — goes
through `answering` to `refuse()`: the history writes `question answer`, then the lines
`promptRefusal` composes for the input function behind the question, in AutoCAD 2023's console's
words (`Point or option keyword required.`, `Requires numeric distance, two points, or option
keyword.`, `*Invalid selection*` + `Expects a point or …`), and the question stays. What the
question takes is the tool's `takes()` or, without one, read from the asked prompt and its box
(`cad-tools.instructions.md`, "What a question takes"). A commit that reads typed text it cannot
parse off the cursor instead ("no number typed, so the cursor's angle") is a bug: it must return
`false` so the refusal runs.

## Transparent commands — the running one is suspended, never ended

A command typed with an apostrophe mid-command (`'ZOOM`, `'Z`), at the command line or in a
box that is not content, runs **inside** the running one when its `CommandDefinition` is
`transparent` (`TRANSPARENT_COMMANDS` in `runtimeCommands.ts`: add a command only after typing it
so at LINE's prompt in AutoCAD's console — `>>` prompts, or `** That command may not be invoked
transparently **`; `'AREA` reads a system variable, not the command). One with no tool (SNAP's
toggle, UNITS' dialog) runs in place and `Resuming LINE command.` follows at once. `suspend`
keeps the running tool as it stands — its state, `startedAs`, `commandStart`, the box
(`DynamicInputController.save` / `restore`, typed text cleared), the selection set and Previous
set, its cursor, LASTPOINT (what the transparent command gives it is gone on resuming) — and makes the transparent tool the active one **without `setActiveTool`**: no
`onDeactivate` of the running tool, no undo group closed or opened (a transparent change joins the
running command's step, as AutoCAD undoes it). While one is suspended `commandPrompt(…,
transparent)` heads every question `>>` (and the prompt line `'ZOOM`), and a tool's own prompt
written with `ctx.report(text, "prompt")` (PAN's) gets it too; plain reports do not (`No previous
view saved.`). A tool asks `ctx.runsTransparently()` only for what AutoCAD does differently then:
ZOOM's `Regenerating model.` is left out, as a transparent zoom cannot regenerate, and -VIEW's
views are refused (`** Requires a regen, cannot be transparent.`). A change AutoCAD regenerates
for is said with `ctx.regenerate()`, never a report of `regeneratingModel`: transparently it is
`Regen queued.`, and `setActiveTool` writes `Regenerating model.` once the interrupted command
ends. Ending it — `endCommand`, Escape, an option's `"end"`, anything that returns to
neutral — reaches `setActiveTool("select")`, which **resumes** instead (`Resuming LINE command.`)
and replays the pointer through the resumed tool. Starting another tool ends both; `undo()`,
`newDrawing()` and the Command menu's Cancel (^C^C, two cancels) end both through
`endCommands`/`cancelOnce` — a new "end everything" path must call `endCommands`, not
`returnToNeutralTool`, or it only resumes. A command that is not transparent, typed so, says
`** That command may not be invoked transparently **` before the prompt's own refusal (at the
Command prompt, instead of running); one inside a transparent one, or inside itself (`'ZOOM` at ZOOM's prompt: the tool is the running
one), is refused as any answer.
A button whose AutoCAD macro starts with an apostrophe (the navigation bar's `'_pan`,
`'_zoom _W`) runs through `navigate` — the same `runTransparently` as typed, at any prompt and
keeping the box's text, since a button types nothing there; never `setActiveTool`, which ends the
running command.

## The pointer's buttons (`pointerDown` / `pointerUp`) — order is load-bearing

1. A press while the shortcut menu is open only closes it, as its backdrop does on the page.
2. Shift+right at a point prompt opens the object-snap override menu, **on the press**, before
   anything else reads the right button; elsewhere it is a plain right-click.
3. Shift+wheel button orbits (transparent 3DORBIT); the wheel button alone pans (MBUTTONPAN 1).
   One ZOOM Previous step per drag, pushed when the view first moves, so a click leaves none; a
   release within `DRAG_THRESHOLD_PX` of its press is a click, and two within `DOUBLE_CLICK_MS`
   (500, Windows' default — the browser tells no double-click time and fires `dblclick` for the
   primary button only) are ZOOM Extents (`zoomToFit`).
4. The right button is held on the press and answered on the **release** — where Windows opens a
   shortcut menu, and for the reason the Selection list box opens there: a menu opened on the press
   is taken by its own release. `rightClickResponse` (SHORTCUTMENU 11) decides: the Default menu
   with no command and nothing selected, the Edit menu with a selection, the Command menu while the
   prompt offers options (`offerOptions`), otherwise **Enter**. A grip edit counts as a command
   (Select with `wantsSnap()` true). The right button never reaches a tool.
5. Only then the left button, with the Selection list box's deferred click (below).

**A right-click's Enter is `pressEnter`, and so is the Command menu's Enter**: the keyboard's
Enter, `commitDynamicInput` when the box has a field and `keyDown` otherwise — one path, whose
nothing-typed rule (defaults, then `commitRaw` on the empty text, then `keyDown`) is in
`cad-tools.instructions.md`, "Dynamic input (DYN)". `keyDown` repeats the last command only with
no command running and no grip edit hot (`wantsSnap()`), as the right button decides. Cancel is
`cancelCommand` (AutoCAD's ^C^C: FROM, the typed text and the command go together). Every entry
runs through `chooseShortcutMenuAction` / `chooseShortcutMenuOption`, which close the menu first;
a fixed entry that is a command runs it by its global name (`SHORTCUT_MENU_COMMANDS`, `_ERASE`), so
it echoes, repeats and undoes as typed, and an option goes through `invokeToolOption("_Close")`.
A new entry is an action there, a case in the host's `ShortcutMenu`, and its row in
`docs/autocad-coverage.md`; an entry whose command does not exist here is left out, never faked.

## Selection cycling

`SelectionCycling` mirrors AutoCAD's SELECTIONCYCLING: sign = on/off, magnitude = badge only vs
badge plus Selection list box, so turning it off keeps the display preference. Candidates are
re-observed in `updateSnap`, but **only while the active tool is picking objects**
(`wantsSnap()` false) — during a point prompt the badge would be noise. Tools reach it through
`ToolContext.pick`, which is `document.pick` until the user cycles.

With the list box on, a click over a stack is **deferred**: the press is held and the list opens on
the **release** — a menu opened on the press is dismissed by that very release, and its modal
backdrop makes the canvas fire `pointerleave`, so `pointerLeave` must not clear the candidates
while it is open. Moving past `DRAG_THRESHOLD_PX` first hands the press to the tool instead, so a
box drag started on a stack still works. Choosing a candidate replays press and release
(`dispatchPointerDown`/`dispatchPointerUp`) — reuse that pair, and `placePoint`, for any future
"the runtime picks for the tool" feature.

## Snapping

- **The snap nearest the cursor wins**, by tier ("a point closest to the center of the aperture
  box"): a point inside `pixelTolerance` (8px) → the point already held, within
  `releaseTolerance` (11px: the magnet; keep release ≥ capture) → Extension / Parallel → Nearest →
  a notable point of an object the aperture crosses. Provider order in `defaultSnapProviders` only
  breaks ties (a line's end on another line is an Endpoint).
- **Some snaps are found from anywhere over their object**: a provider builds a notable point with
  `notable(type, entity, point, touch)`, which sets `SnapCandidate.touch` from
  `SnapContext.touch(entity)` (the object's point nearest the cursor, cached per resolve, boxed out
  in plan), and the engine honours it only for `FOUND_FROM_AFAR` — running Center (from the
  rim), Perpendicular and Tangent — or for any snap under an override (`_mid of` picks the
  object). A running Endpoint or Midpoint engages only near its point: offering it from the whole
  line made every line drawn across another jump to its ends (a magnet AutoCAD does not have).
- Tab cycles the engaged snaps (`cycleNext`, distinct points, the choice held while the same ones
  stay engaged); it only takes Tab when there is something to cycle and nothing typed.
- **The rubber band is not an object.** The only construction geometry is the alignment paths the
  cursor is on (`alignmentPaths`): the engaged polar path, the OTRACK guides
  (`PointResolver.engagedGuides`) and the Extensions under the cursor, which Intersection and
  Apparent Intersection cross with objects — never with one another (that crossing is tracking's).
  Their candidates are `transient`, **never acquired** by OTRACK, and keep their paths drawn
  (`sceneTracking`). Never cross a tool's preview.
- Running Apparent Intersection is the visual crossing of two objects at different heights; an edge
  is prolonged only to meet the polar path.
- **A provider that pairs shapes drops the far ones first.** Intersection keeps only shapes that
  pass within its reach of the cursor (`mayReachCursor`) before crossing them pairwise — every
  pair of the drawing on each move was 13 ms at 300 lines. The filter must stay exact: only in
  plan and for shapes in the world's XY, where `isNear` measures the same distance; an arc is
  judged by its circle. Apparent Intersection is not filtered: an edge prolonged to the polar path
  can be far from the cursor.
- **Acquired points are one set** (`ObjectSnapTrackingEngine`, up to seven): OTRACK's guides and
  Extension both read them, and with OTRACK off `acquireEndpoints` still acquires endpoints for
  Extension — through `SnapEngine.endpointUnder` when Endpoint is not what is engaged (its
  override, or END off). Only a snap under the aperture is acquired, never one found from afar.
  OTRACK's guides are orthogonal whatever Polar's increment (POLARMODE's default).
- **Where paths cross, the crossing wins.** A line's Extension from an acquired end is also a
  `kind: "extension"` guide (`SnapEngine.extensionLines`, fed to `PointResolver`): it crosses OTRACK
  guides, the Ortho / Polar line and other extensions (outwards only), OTRACK off too, but sliding
  along it alone stays the Extension snap's. `updateSnap` drops a sliding snap (`SnapEngine.slides`:
  Extension, Parallel, Nearest) when `resolver.crossing` finds a crossing under the cursor — else
  following one acquired point's path to where another's crosses lands on the extension instead.
- An object snap typed at a point prompt (`pointModifier`, from the dynamic-input box or the
  command line) is a one-shot override, read with -OSNAP's keyword table (`OSNAP_MODES`); the
  prompt's own keywords are tried first.
- The one-shot `override` runs a single provider, ignoring the enabled running set, then is
  cleared once the pick is consumed.
- Providers read `SnapContext.entities`, **not** `document.getEntities()`: that list is the drawing
  with every block reference already expanded into the geometry it draws (AutoCAD snaps inside a
  block), built once per resolve rather than ten times. `document` is still there for the
  visibility check, since the layers are real. `insertionProvider` is the exception — it offers the
  reference's own insertion point, so it reads the document.

Adding a snap type touches: `SnapType`, a provider (`notable` for a point of an object),
`defaultSnapProviders` (position = tie-break), its word in `OSNAP_MODES` and
`commands.keywords.-OSNAP` of every catalog,
the `TRACKABLE` set, a `SceneBuilder` marker, its name in `interface.snap` (menus, read by React
from `state.names`) and `commands.feedback.snap` (the canvas tooltip), `IMPLEMENTED_SNAPS` in
`status-bar.tsx`, the menu order in `snap-override-menu.tsx`, and the default enabled/disabled
call in the `CadRuntime` constructor.

## Commands and history

`history.execute(command)` is the only write path to the document. **A command is one undo step**,
as AutoCAD's U undoes "the effects of the last command": `setActiveTool` opens a group
(`history.beginGroup`) for every tool but Select and closes it (`endGroup`) after the old tool's
`onDeactivate`, which may still commit. Inside the group each command stays its own entry, so a
tool's Undo keyword (`ctx.undo()`) steps back one; on close they fold into one. What the user sets
from a palette mid-command joins it, as AutoCAD undoes transparent changes with the command.
`loadDrawing` clears the history (a loaded file is a fresh baseline). Document _settings_ changes made by a host's own
setters (`setDocumentUnit`, `setDocumentPrecision`, `setLtScale`, layer table edits) are
deliberately not undoable; anything touching entities is. What a command sets is what AutoCAD's U
undoes — ATTMODE, the UCS and its table, UCSICON, ELEVATION and THICKNESS, LTSCALE, AUPREC, UNITS'
unit and precision (`applyDrawingUnits`), and CECOLOR, CELTYPE and CELWEIGHT, whether -COLOR,
-LINETYPE, -LWEIGHT or the Properties drop-downs set them (`setCurrentProperties`; UNDO "displays
the command or system variable name" it steps past) — and goes through a command (`UpdateSettingsCommand`
restores exactly the keys it patched; one that changes nothing executes nothing). A settings
change another one implies belongs in the same patch: changing to the WCS puts ELEVATION to 0.

A command that adds **table entries alongside geometry** (BLOCK's definition, PASTECLIP's layers,
styles and blocks) carries them through the history too, and undoes them in reverse order — those
tables all refuse to drop an entry still in use, so the geometry has to go first. Work the result
out **once**, before the command runs, and store it: a redo must re-add the very same ids.

A setting AutoCAD saves in the drawing but no U undoes (NAVVCUBE, the ViewCube's Home view) is a
`CadDocument` setter the runtime calls, and a tool reaches it through a `ToolContext` method
(`setViewCubeVisible`) rather than a command that would leave an empty undo step.

## Waiting on the host

**Bound every wait on an asynchronous port.** A browser may leave `navigator.clipboard.readText()`
pending indefinitely behind an unanswered permission prompt, which made Ctrl+V do nothing at all —
not even report. Race the call against a timeout and fall back (`CLIPBOARD_READ_TIMEOUT_MS`), and
keep a session-local copy of anything the host might refuse to hand back, so the capability
degrades instead of disappearing.

## EngineState

The single UI contract, built in `buildState` on model emits and cached. `invalidateState` shares
it with the last snapshot (`shareStructure`), so a part a change left equal keeps its identity; a
pointer move changes only `cursorUcs` and `dynamicInput` (`shareStructure.test.ts` holds that).
A new field that moves with the cursor goes in the hook's `POINTER_KEYS` (`ui.instructions.md`);
anything in `buildState` that is not a plain object or array (a `Map`, a class instance, a fresh
closure) is new on every rebuild and breaks the sharing. All user-facing
formatting (lengths, angles, property rows, dynamic-input labels) belongs here, not in React, and
all its words come from `runtime.text` (`EngineText`, the locale laid over English). React keys
rows, groups and chips by **id**, never by a label two translations could share. The prompt is
also given in spans (`commandLine.promptSegments`, the keyword list set apart) with the running
command's name (`commandLine.command`), so no host takes the text apart. One `commandPrompt` builds
the prompt line, the question as the history writes it (`commandLine.question`, which the demo
transcripts read too) and the dynamic prompt (`dynamicInput.prompt`), so they never disagree. `setLocale` swaps the
text and rebuilds the state; the scrollback stays as it was written.

Coordinates the user reads are **UCS** coordinates: the status readout is `cursorUcs` (a `Vec3`,
its Z the elevation plane's), and the Properties palette's X/Y/Z rows (and a line's deltas) are
converted in `singleEntityInfo`. A retyped X or Y is read in the UCS too (`runtimeProperties.ts`),
which in a turned UCS moves the point along that axis and so rewrites both world coordinates; a
retyped Z (`isZProperty`) gets `ucs.origin.z` added, except Thickness, which is a length. With a
tilted UCS or object the position rows are read and retyped as points in space
(`applyOffPlane`). Rotations
stay in the WCS, as AutoCAD's do. Rows AutoCAD files under **General** go in
`SelectionInfo.general` (the palette renders them after its pickers), never in a group.

**The ViewCube is the engine's, drawn by the host.** `viewCube.ts` is its model — the 26 parts and
the view each shows, roll, adjacent face, compass, nearest part — and `buildViewCubeUi` projects it
into a 0–1 box for `EngineState.viewCube`: each visible face's nine zones as polygons with their
part id, its label's affine, the compass ellipse and letters, the current part, whether it is a
face view. It is oriented to the current UCS (`cubeAxes`, read with `Viewport.inFrame`; not
`UcsFrame`, whose frame stays the WCS for an upright UCS) and cached on the camera's axes (their
identity), the UCS and the setting, so zooming or panning never rebuilds it. `runtimeViewCube.ts`
holds what a click, a drag or a letter does. A host hands back part ids, sides, letters and drag
phases and computes nothing. Choices that are commands a user types — a preset view
(`applyViewPreset`), a UCS from the cube's menu (`restoreUcs`) — run as that command's macro,
echoed and undone like it; never compose the macro in React.

## Scene

`SceneBuilder` emits **screen-space** primitives. `entityScenePrimitive` and `arcScenePrimitive`
are the single source of truth for how an entity draws — use them for overlays and ghosts so new
entity types render correctly everywhere for free. Previews that need an entity object must reuse
a fixed id, never mint one per frame (it burns entity ids).

**One flat display list.** `entityScenePrimitive` returns `ScenePrimitive[]`: most entities are a
single primitive, a dimension is an assembly of lines, filled arrowheads and text. Do **not**
introduce a nesting "group" primitive to keep the count at one — the scene is read back by tests,
selection cycling and pixel checks, all of which filter it by `kind`, and a wrapper would hide a
dimension's parts from every one of them. A new multi-primitive type therefore costs nothing at the
call sites, which all spread.

A tool editing an object **in place** lists it in `hiddenEntityIds()` so the scene stops drawing
it and the overlay is the only copy on screen — otherwise the new state is painted on top of the
old one.

The `label` primitive is chrome: screen-space, fixed size, never rotated. Anything that belongs to
the **drawing** uses the `text` primitive instead, which carries a world-derived size and angle.
A world angle becomes a screen rotation through `screenRotation(camera, radians)`, which accounts
for both the Y flip and the view's twist (`CameraTransform.twist`); positions, arcs and ellipses
are resolved from projected points and need nothing.
**Each planar object is drawn through its plane's affinity** (`planeCamera(camera, elevation,
axes)`): a circle becomes an ellipse (`affineEllipse`) and text gets a matrix. When the affinity
is a similarity (the plan) the old code path runs. Thickness draws the object at both heights along its normal and the edges joining them.
Glyph metrics — alignment, cap height, font size — are the presenter's job: the scene describes
_what_ to align to, not where the pixels land.

The grid lies on the UCS (`SceneInput.ucs`, the frame's) and the UCS icon is drawn by the scene
(`SceneInput.ucsIcon`, its letters from the catalog; `world` — the WCS square — is decided on the
drawing's UCS, since a tilted one reads level in its frame). The grid, the icon, tracking, the
snap marker and the guides are drawn with `SceneInput.aidCamera` (the frame's viewport), the
objects with `camera`. A host with chrome of its own hides it with
`setUcsIconShown(false)` (the landing's sketch), which leaves the drawing's UCSICON alone;
`CadDriver` hides it unless given `ucsIcon: true`, so a recorded frame holds only what was drawn.

Entities are drawn in `entityDrawOrder()` order, not document order, and `pick`/`pickAll` sort by
the same function reversed — so what a click takes is what is on top. A type that must sit behind
another (a hatch behind the boundary it was traced from, HPDRAWORDER 3) changes that one function
and nothing else.

The display list has no clipping and no patterned fill, and it should stay that way: work out
_what_ is drawn in world coordinates in `domain/` (a hatch's pattern arrives here as ordinary
segments already clipped to its boundary) and let the scene carry only styled shapes. The one
concession is `path.subpaths`, filled even-odd, because a solid fill and a line pattern have to
agree about which side of a nested loop is inside.

## Double-click

`CadRuntime.doubleClick` is AutoCAD's DBLCLKEDIT: it acts only at the neutral prompt and opens
whatever object is under the cursor for editing (today, text and multiline text → TEXTEDIT). Extend that one method
for each newly editable type rather than adding another adapter listener.

## Adapters

`CadEngine` owns the canvas, DOM listeners, `ResizeObserver`, rAF scheduling and device-pixel
ratio, and delegates the rest to `CadRuntime`. Both presenters draw left to right whatever the page
around them (`ctx.direction`, `direction="ltr"` on every SVG text, anchors spelled out): the
drawing is geometry and never mirrors. And in the command language: `Scene.lang`
(`EngineText.commandTag`, English's for a locale without one) becomes `ctx.lang` and every SVG
text's `lang`, because the page's language picks the font a generic family resolves to. It is also the **composition root**: it builds the
port implementations (`createLocalStorageDrawingStore`, `createBrowserFileTransport`) and hands
them to the runtime. Each returns `null` outside the browser, and the runtime reports the missing
capability rather than crashing.

Two listeners are deliberately on `canvas.ownerDocument`, not the canvas:

- `keydown`, so Escape and shortcuts work regardless of which element holds focus. It ignores
  events from `input/textarea/select/[contenteditable]` — **except function keys and the global
  Ctrl shortcuts** (`isGlobalShortcut`: Ctrl+S, Ctrl+O, Ctrl+9, Ctrl+0, Ctrl+1), which must also
  be swallowed so the browser's own action never runs — its Save/Open dialogs, switching to a tab,
  resetting the zoom. Chrome hands Ctrl+<digit> to the page first and acts only when it is not
  prevented (measured with real keystrokes, Chrome on Windows, 01/10/2026); Ctrl+N, Ctrl+T and
  Ctrl+W it keeps. Other Ctrl combos stay unforwarded on purpose: a global undo from a focused field
  desyncs the running tool, and Ctrl+C/X/V/A inside a dynamic-input box or a layer name belong to
  that **text**. Never widen `isGlobalShortcut` to the clipboard keys. Nothing inside a modal
  dialog (`[role="dialog"][aria-modal="true"]`, the Drawing Units dialog) reaches the runtime at
  all: AutoCAD's dialogs keep their keys, and its lists' arrows and letters must not feed the
  prompt. Nor does anything inside an open menu (`[role="menu"]`): the Enter that chooses an item
  would also repeat the last command, and the arrows that walk it would recall commands at the
  neutral prompt. For the same reason `mayTakeFocus` never takes focus from a menu or a modal
  dialog — the dynamic-input box once took an open menu's Escape and ended the command. **A Ctrl combo is read by its physical key** (`shortcutKey`): an Arabic, Greek or
  Cyrillic layout sends its own letter in `e.key`, so under Ctrl a key that is not a latin letter
  or digit is taken from `e.code`. Typed text never is.
- `contextmenu`, because the event fires on button _release_, by which time a portalled modal
  backdrop may be the target. It is always prevented over the editor but in editable fields: the
  right button is Enter or AutoCAD's shortcut menu there, never the browser's.

**A shortcut belongs in `CadRuntime.keyDown`, never in a React `useEffect`.** A second
document-level listener bypasses the routing order above and cannot `preventDefault` in step with
it.

### Embedding (`CadEngineOptions`)

The editor passes no options, and everything above is its behaviour. Two options let the same
composition root live inside a page it does not own:

- `store` replaces the autosave's `DrawingStore` — `createMemoryDrawingStore()` for one that lasts
  as long as the page, `null` for none. **Anything embedding the engine beside the editor must pass
  one**: the default is this device's store, which holds the user's drawing.
- `scope` embeds it. The engine is **active** from a press or a focus inside the scope until the
  next one outside (a capture `pointerdown` and a `focusin`, both on the document). Inactive, it
  hears no keys, lets the wheel scroll the page and the host's `focusSurface` does nothing — a
  command ending late must not pull focus back into it. Active, it hears keys aimed at the canvas,
  the scope or the body (where focus falls when a focused field unmounts, as the dynamic-input box
  does between OFFSET's distance and its object prompt); fields in the scope keep the editable
  rule above; any other control there keeps its own keys; and the scroll keys the runtime passes on
  (Space confirming a selection, arrows) are prevented, because the page around it can scroll.
- The filter sits in the adapter **before** `runtime.keyDown`, exactly like the editable rule. Never
  make the runtime scope-aware: its routing order is untouched and must stay so.
- `mayTakeFocus(from)` is what the dynamic-input box asks before reclaiming focus after a render:
  yes from anywhere in the editor but an open menu or modal dialog, only from the canvas, the
  scope or the active body for an embed. Without it an autosave finishing would yank focus back from wherever the user tabbed.

`CadRuntime.zoomToBounds` is ZOOM Window for a host that knows the rectangle (one history entry,
then `Viewport.zoomToBounds`). What the editor refuses to restore — no objects and only the base
layer — is `isBlankDrawing()`, the same rule a page uses to decide it may overwrite an autosave
without asking; change it there, once.
