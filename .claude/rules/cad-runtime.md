---
paths:
  - "cad/application/*.ts"
  - "cad/application/commands/**"
  - "cad/application/constraints/**"
  - "cad/application/input/**"
  - "cad/application/snapping/**"
  - "cad/application/tracking/**"
  - "cad/adapters/**"
---

# Runtime and interaction plumbing

`CadRuntime` is the DOM-free orchestrator; `CadEngine` (adapters) is the composition root that owns
the browser. Geometry and modelling are in `cad-engine.md`; the tool-facing parts of the runtime
(answering a prompt from a tool, the UCS frame's `inWorld`, typed numbers as points, transparent
behaviour, previews) are in `cad-tools.md`.

## The `CadRuntime` class

`CadEngine` delegates to `CadRuntime` one method at a time, so **the class's public names and
signatures are a hard contract**. The class is kept small by hollowing methods out, never by
renaming them: the method stays as a one-line delegation to a free function in a `runtime*.ts`
sibling. **A sibling takes the collaborators it needs (`document`, `selection`, `history`, …),
never the runtime**; wanting many private fields means the code belongs in the class.
`registerCommands` is the one exception (a command _is_ a call into the public API): it receives the
runtime plus `startTool` and `registerCommand`, and imports `CadRuntime` as a **type only**, so no
import cycle exists at runtime (`cad/entryPoints.test.ts` fails on a value import from any sibling).

`drawingPreview.ts` is the one way to draw objects **without** the editor: `buildDrawingPreview`
frames a drawing with every aid off, and parts of one drawing share a camera by default so they
overlay to the pixel (block thumbnails, the landing's figures). `commandCatalog()` reads the command
table off a headless runtime (`CadRuntime.listCommands()`), so nothing outside the engine restates
it.

## The precision pipeline (`PointResolver`)

```
object snap  →  object-snap tracking  →  snap mode (lattice)  →  constraints (Ortho/Polar)
```

- A direct snap **wins** over tracking, the lattice, Ortho and Polar and is returned untouched —
  "Ortho is ignored when you … specify an object snap"; never feed a snap point to a constraint. A
  line's Extension comes back with a `TrackingResult` too (`extensionPath`), so a typed distance
  runs along it as along an OTRACK guide.
- A typed `<angle` (`setAngleOverride`, set by `pointModifier` while the tool has an anchor) comes
  right after the snap: the point slides on the line through the anchor at that heading, at the
  anchor's Z, over tracking, the lattice, Ortho and Polar. `resetTracking` drops it: it holds for
  one point.
- When tracking engages, its point already accounts for the active Ortho ray: returned as-is,
  constraints skipped.
- Shift held is `orthoOverride`: it **toggles** Ortho and Polar yields to it either way;
  `ConstraintManager` and `aidState` both read it so. While picking, Shift removes from the
  selection and the runtime draws AutoCAD's minus badge (`shiftRemoves`): with no command and
  wherever `questionInput` says the question takes a set, never at a single pick. `pointerShift`
  follows the Shift key too (`keyDown` / `keyUp`), so the badge shows before the mouse moves. The
  cursor's badges are one `SceneInput` field each (`cyclingBadge`, `removeBadge`); a third badge
  turns them into one `badges` list the scene lays out, never another placement flag.
- `allowSnapMode` is false while a tool is merely picking objects (`wantsSnap()` false): rounding
  the cursor would make objects hard to hit. Polar snap only rounds along an alignment path.

**Horizontal and vertical are the UCS's.** `ConstraintContext.ucs` and `DrawingAidState.ucs` are
required and `SnapMode.snapPoint` takes the UCS: Ortho locks to its axes, polar angles and OTRACK
guides count from its X axis, the lattice starts at its origin. The resolver reads it through a
`() => Ucs`. A new aid with a direction takes the UCS the same way; one that assumes world X is a
bug that only shows once the UCS turns.

**Only snapping and tracking may move the crosshair.** Constraints bend the _point_ a tool receives,
never the cursor. `updateSnap` picks `snap.point` → `tracking.point` → raw screen — but a snap found
through its object with its point beyond the release radius (the centre from the rim, a
perpendicular foot) leaves the crosshair on the pointer.

**The point carries a Z** (`ResolvedPoint.point`, `PointerInput.point` are `Vec3`), in the same
order: a snap's is the object's there (providers build it with `on(entity, point)`, which reads
`entityZAt`), a tracked point's is the acquired point's, otherwise the elevation plane
(`ucs.origin.z` + ELEVATION). Constraints and the lattice work in plan and the resolver puts the Z
back after them. Intersection is 3D (`meetingPoint`: two objects that cross in plan at different
heights do not meet); Apparent Intersection is where two edges, extended, cross on the screen, on
the first at its height. `input.world` is the unsnapped cursor on the work plane: it is for picking.

**The `+Z` / `-Z` guide** (`constraints/zGuide.ts`) exists only where the UCS's Z shows on the
screen (`zOnScreen`: never in a plan, so the 2D arithmetic is untouched and the landing's snapshots
guard it). It is the Z through the anchor, measured on the screen (`ConstraintContext.view`, and
`world` the work-plane cursor). Polar engages it within its aperture and prefers it on a tie; Ortho
locks to whichever of X, Y and Z is drawn nearest. Locked to it, a constraint returns a
`PointAlongZ` (`isAlongZ`), which the resolver keeps instead of the work plane's height; `ray()` is
`null` and `alongZ()` / `activeAlongZ()` give the point. OTRACK adds a `kind: "z"` guide per
acquired point (`TrackingGuide.dir`, `TrackingResult.direction` are `Vec3`). Off the plan every
OTRACK guide is measured where it is drawn (`nearestOnScreen`), and two guides cross where they are
drawn crossing. The anchor keeps its Z (`getConstraintAnchor()` may give a `Vec3`).

## The view (`Viewport`)

`Viewport` owns the camera _and_ ZOOM Previous's history. **Call `pushHistory()` once per user
gesture, before changing the view**: a wheel burst (`WHEEL_BURST_MS`) and a pan drag are one entry
each. `zoomToBounds` is the single "frame this world rectangle" operation.

**The camera is an orthonormal base** (`right`, `up`, `direction` towards the viewer, plus scale and
translation); `setView(direction, right)` aims it and ZOOM Previous restores the whole base.
`isPlan` keeps the 2D arithmetic bit-identical (the landing's SVG snapshots guard it). In plan the
view can be turned (PLAN, VIEWTWIST), so a screen rectangle is upright in the **view frame**
(`worldToView`), not in the world: `objectsInWindow` tests `entityInView`, ZOOM Window / Extents /
Object and PLAN frame `entitiesViewBounds` with `zoomToViewBounds`, and a visible-area query maps
all four screen corners — two corners through `screenToWorld` only bound an untwisted view.

**Off the plan a screen point is a line of sight.** The cursor is where it meets the work plane
(`screenToPlane`); edge-on there is none (`pointingEdgeOn`, `screenToFacing` stands in for
picking). Picking and snapping measure **on the screen**: `viewPick.ts` takes the cursor into each
object's plane, asks the 2D query and measures the answer in pixels; snap providers use
`SnapContext.cursorOn(entity)`, `isNear(point, px)` and `view`, never a world tolerance. In plan a
tilted object is measured by its outline on the screen (`planDistanceToEntity`, `drawsTilted`).

## The UCS frame (`UcsFrame`)

Tools and the pointer pipeline work in the frame of the UCS's XY plane (`ucsFrame.ts`,
`CadRuntime.frame`, remade when the UCS changes): `frame.document` reads every object there
(cached), `frame.viewport` is `Viewport.inFrame(axes)`, `frame.ucs` the UCS as the frame sees it.
With an upright UCS the frame is the identity.

- The resolver, snaps, tracking, picking, the cursor, the polar guide and the scene's aids read
  `this.frame`; reading `this.viewport`, `this.document` or the UCS directly for anything the cursor
  touches is a bug that only shows with a tilted UCS. What the user reads leaves the frame on the
  way out (`cursorUcs`, `snap.point`).
- Tracking points acquired in one UCS are dropped when it changes; a snap's `direction`
  (Extension, Parallel) is a frame direction, drawn with the aid camera.

## Keys and buttons

The routing order is the comments in `CadRuntime.keyDown` and `CadRuntime.pointerDown` /
`pointerUp`: a step inserted above the value box steals keys from running commands, one above the
command line steals them from typing, and no key runs a keyword on its own (it is typed and
confirmed). The right button is answered on its release and never reaches a tool.

**Ctrl+Z is acad.cuix's `_u` typed at the running prompt** (`runUndoMacro`, no `^C^C`): a keyword
where Undo is offered, else that prompt's refusal, and the command goes on; at `Command:` it is U.
The top bar's Undo ends the running command first; the Default menu's is `^C^C_u`.

**A right-click's Enter is `pressEnter`, and so is the Command menu's Enter**: one path with the
keyboard's. `rightClickResponse` (SHORTCUTMENU 11) picks the menu. Every entry runs through
`chooseShortcutMenuAction` / `chooseShortcutMenuOption`, which close the menu first; a fixed entry
that is a command runs it by its global name (`SHORTCUT_MENU_COMMANDS`) so it echoes, repeats and
undoes as typed, and an option goes through `invokeToolOption`. A new entry is an action there, a
case in the host's `ShortcutMenu` and its entry in `docs/coverage/`; an entry whose command
does not exist here is left out, never faked.

## Answering a prompt

- **Every way input answers the running command goes through `answering(answer, run)`**, which reads
  the question before `run` and writes `question answer` in the history once `run` says it was
  taken. Only the outermost call writes. A new way to answer must go through it, or the history
  loses that step.
- **Every way of answering checks `clarifyingWords()` first** (set after `Ambiguous response, please
clarify...`): a keyword answers, Enter writes `Invalid option keyword.`, anything else goes to
  `unclarified`. A new way to answer must check it too, or it answers the prompt behind the
  question.
- **A wrong answer is refused, never run**: what the question does not take goes through
  `answering` to `refuse()` (`promptRefusal`, AutoCAD's console words) and the question stays. A box
  commit that cannot parse the typed text **returns `false`** so the refusal runs; reading the
  cursor instead is a bug.

## Transparent commands

A command typed with an apostrophe runs **inside** the running one, which is suspended, never ended.
Add one to `TRANSPARENT_COMMANDS` (`runtimeCommands.ts`) **only after typing it so at LINE's prompt
in AutoCAD's console** (`>>` prompts, or `** That command may not be invoked transparently **`). A
new "end everything" path calls `endCommands`, not `returnToNeutralTool`, which only resumes. A
change AutoCAD regenerates for is `ctx.regenerate()`, never a `regeneratingModel` report: run
transparently it is `Regen queued.`. A button whose macro starts with an apostrophe runs through
`navigate` (the same `runTransparently`), never `setActiveTool`, which ends the running command.

## Selection cycling

`SelectionCycling` mirrors SELECTIONCYCLING: sign = on/off, magnitude = badge only vs badge plus
Selection list box. Candidates are re-observed in `updateSnap` **only while the active tool picks
objects** (`wantsSnap()` false). Tools reach it through `ToolContext.pick`.

With the list box on, a click over a stack is **deferred**: the press is held and the list opens on
the **release** (a menu opened on the press is dismissed by that release), and its modal backdrop
fires `pointerleave`, so `pointerLeave` must not clear the candidates while it is open. Moving past
`DRAG_THRESHOLD_PX` hands the press to the tool. Choosing a candidate replays press and release
(`dispatchPointerDown` / `dispatchPointerUp`): reuse that pair, and `placePoint`, for any "the
runtime picks for the tool" feature.

## Snapping

- **The snap nearest the cursor wins**, by tier: a point inside `pixelTolerance` (APERTURE, 10px)
  → the point already held, within `releaseTolerance` (13px: keep release ≥ capture) → Extension / Parallel →
  Nearest → a notable point of an object the aperture crosses. Provider order in
  `defaultSnapProviders` only breaks ties.
- **Some snaps are found from anywhere over their object**: `notable(type, entity, point, touch)`
  sets `SnapCandidate.touch` from `SnapContext.touch(entity)`, and the engine honours it only for
  `FOUND_FROM_AFAR` (running Center, Perpendicular, Tangent) or under an override. A running
  Endpoint or Midpoint engages only near its point: from the whole line, every line drawn across
  another jumped to its ends, a magnet AutoCAD does not have.
- Tab cycles the engaged snaps (`cycleNext`); it takes Tab only with something to cycle and nothing
  typed.
- **The rubber band is not an object.** The only construction geometry is the alignment paths the
  cursor is on (`alignmentPaths`: the engaged polar path, `PointResolver.engagedGuides`, the
  Extensions under the cursor), which Intersection and Apparent Intersection cross with objects,
  never with one another. Their candidates are `transient`, never acquired, and keep their paths
  drawn. Never cross a tool's preview.
- **A provider that pairs shapes drops the far ones first** (`mayReachCursor`). The filter must stay
  exact: only in plan and for shapes in the world's XY, an arc judged by its circle. Apparent
  Intersection is not filtered: an edge prolonged to the polar path can be far from the cursor.
- **Acquired points are one set** (`ObjectSnapTrackingEngine`, up to seven): OTRACK's guides and
  Extension both read them; with OTRACK off `acquireEndpoints` still acquires endpoints for
  Extension (through `SnapEngine.endpointUnder`). Only a snap under the aperture is acquired, never
  one found from afar. OTRACK's guides are orthogonal whatever Polar's increment.
- **Where paths cross, the crossing wins.** A line's Extension from an acquired end is also a
  `kind: "extension"` guide (`SnapEngine.extensionLines`), and `updateSnap` drops a sliding snap
  (`SnapEngine.slides`) when `resolver.crossing` finds a crossing under the cursor.
- An object snap typed at a point prompt (`pointModifier`) is a one-shot override read with
  -OSNAP's table (`OSNAP_MODES`), before the prompt's own keywords (`CEN` at PLINE's arc prompt is
  the snap). The `override` runs a single provider, ignoring the running set, and is cleared once
  a point is given or refused.
- **An override that finds nothing refuses the point** (`overrideMissed`): `snapNotFound`, then
  the prompt's own refusal, never the cursor's point. A point typed under one is found as a pick
  there (`pickTyped`), never handed to the tool as typed. Only a Tangent or Perpendicular with no
  base yet is let through, for the tool to defer.
- **FROM asks in the place of the tool** (`asking()` gives `questionInstead`): its prompts, no
  keywords, its box over the tool's. A point given while it asks reaches it through `pickAnswer`
  and `placePoint`; a new way to give a point goes through them, or FROM is skipped.
- Providers read `SnapContext.entities`, **not** `document.getEntities()`: the drawing with every
  block reference expanded (AutoCAD snaps inside a block), built once per resolve.
  `insertionProvider` is the exception: it offers the reference's own insertion point.

## Commands and history

**Every entity mutation goes through a `Command`** (`history.execute`). **A command is one undo
step**, as AutoCAD's U undoes "the effects of the last command": `setActiveTool` opens a group
(`history.beginGroup`) for every tool but Select and closes it after the old tool's `onDeactivate`,
which may still commit. Inside the group each command stays its own entry, so a tool's Undo keyword
steps back one; on close they fold into one. A transparent command's change is an entry of the
group it interrupts, so a tool's Undo takes back to the depth it marked before its commit
(`CommandHistory.undoTo`), and a regeneration that change queued is done then. A change set from a
palette mid-command joins it. `loadDrawing` clears the history.

Settings are split on purpose. What AutoCAD's U undoes goes through a command
(`UpdateSettingsCommand`, which restores exactly the keys it patched; a patch that changes nothing
executes nothing): ATTMODE, the UCS and its table, UCSICON, ELEVATION, THICKNESS, LTSCALE, AUPREC,
UNITS (`applyDrawingUnits`), CECOLOR / CELTYPE / CELWEIGHT (`setCurrentProperties`). A setting
another implies belongs in the same patch (the WCS puts ELEVATION to 0). A host's own setters
(`setDocumentUnit`, `setDocumentPrecision`, `setLtScale`, the style and layer table edits in
`runtimeStyles.ts` / `runtimeLayers.ts`) write the document directly and are not undoable. A
setting AutoCAD saves but no U undoes (NAVVCUBE) is a `CadDocument` setter, reached by a tool
through a `ToolContext` method (`setViewCubeVisible`), never a command that leaves an empty step.

A command that adds **table entries alongside geometry** (BLOCK's definition, PASTECLIP's layers,
styles and blocks) carries them through the history and undoes them in reverse order (the tables
refuse to drop an entry in use). Work the result out **once**, before the command runs: a redo must
re-add the very same ids.

## Waiting on the host

**Bound every wait on an asynchronous port.** A browser may leave `navigator.clipboard.readText()`
pending forever behind an unanswered permission prompt: race it against a timeout
(`CLIPBOARD_READ_TIMEOUT_MS`), fall back, and keep a session-local copy of anything the host might
refuse to hand back.

## EngineState

The single UI contract, built in `buildState` on model emits and cached (`useSyncExternalStore`
needs referential stability). `invalidateState` shares it with the last snapshot
(`shareStructure`): a part a change left equal keeps its identity, a rebuild that changed nothing is
not announced, and a pointer move changes only `cursorUcs` and `dynamicInput`
(`shareStructure.test.ts`). Anything in `buildState` that is not a plain object or array (a `Map`, a
class instance, a fresh closure) is new on every rebuild and breaks the sharing; a field that moves
with the cursor is also declared to the host's hook (`ui.md`). Rendering is on demand
(`host.requestRender()`).

- All user-facing formatting (lengths, angles, property rows, dynamic-input labels) belongs here,
  not in React, with words from `runtime.text`. React keys rows, groups and chips by **id**.
- The prompt is also given in spans (`commandLine.promptSegments`) with the command's name
  (`commandLine.command`), so no host takes the text apart. One `commandPrompt` builds the prompt
  line, the question as the history writes it (`commandLine.question`) and `dynamicInput.prompt`,
  so they never disagree. `setLocale` swaps the text and rebuilds; the scrollback stays as written.
- Coordinates the user reads are **UCS** coordinates: `cursorUcs` (its Z the elevation plane's) and
  the palette's X/Y/Z rows, converted in `singleEntityInfo`. A retyped X or Y is read in the UCS
  (`runtimeProperties.ts`); a retyped Z (`isZProperty`) gets `ucs.origin.z` added, except
  Thickness. With a tilted UCS or object the position rows are points in space (`applyOffPlane`).
  Rotations stay in the WCS. Rows AutoCAD files under **General** go in `SelectionInfo.general`.
- **The ViewCube is the engine's, drawn by the host.** `viewCube.ts` is its model and
  `buildViewCubeUi` projects it into a 0–1 box for `EngineState.viewCube`, oriented to the current
  UCS (`cubeAxes`, read with `Viewport.inFrame`, not `UcsFrame`) and cached on the camera's axes,
  the UCS and the setting, so zooming or panning never rebuilds it. `runtimeViewCube.ts` holds what
  a click, a drag or a letter does. A host hands back part ids, sides, letters and drag phases and
  computes nothing; a choice that is a command (`applyViewPreset`, `restoreUcs`) runs as that
  command's macro, never composed in React.

## Double-click

`CadRuntime.doubleClick` is AutoCAD's DBLCLKEDIT, only at the neutral prompt: a text, multiline
text or attribute definition opens TEXTEDIT, a block reference with attributes opens EATTEDIT.
Extend that one method for each newly editable type rather than adding another adapter listener.

## Adapters

`CadEngine` owns the canvas, DOM listeners, `ResizeObserver`, rAF scheduling and device-pixel ratio,
and delegates the rest to `CadRuntime`. It is also the **composition root**: it builds the port
implementations (`createLocalStorageDrawingStore`, `createBrowserFileTransport`), each `null` outside
the browser, and the runtime reports the missing capability rather than crashing.

Listeners on `canvas.ownerDocument`, not the canvas: `keydown` and `keyup`, `contextmenu`, and, with
a `scope`, a capture `pointerdown` and a `focusin`.

- `keydown`, so Escape and shortcuts work wherever focus is. It ignores events from
  `input/textarea/select/[contenteditable]` — **except function keys and the global Ctrl
  shortcuts** (`isGlobalShortcut`: Ctrl+S, Ctrl+O, Ctrl+9, Ctrl+0, Ctrl+1), swallowed so the
  browser's own action never runs (Chrome hands Ctrl+<digit> to the page first; Ctrl+N, Ctrl+T and
  Ctrl+W it keeps). Other Ctrl combos stay unforwarded: a global undo from a focused field desyncs
  the running tool, and Ctrl+C/X/V/A in a box or a layer name belong to that **text** — never
  widen `isGlobalShortcut` to the clipboard keys. Nothing inside a modal dialog
  (`[role="dialog"][aria-modal="true"]`) or an open menu (`[role="menu"]`) reaches the runtime:
  the Enter that chooses an item would repeat the last command, the arrows would recall commands.
  For the same reason `mayTakeFocus` never takes focus from a menu or a modal dialog. **A Ctrl
  combo is read by its physical key** (`shortcutKey`): under Ctrl a key that is not a latin letter
  or digit is taken from `e.code`. Typed text never is.
- `contextmenu`, because it fires on the button's _release_, when a portalled backdrop may be the
  target. It is always prevented over the editor but in editable fields.

**A shortcut belongs in `CadRuntime.keyDown`, never in a React `useEffect`**: a second
document-level listener bypasses the routing order and cannot `preventDefault` in step with it
(ESLint fails on a `keydown` / `keyup` listener in `components/`, `app/` or `hooks/`).

### Embedding (`CadEngineOptions`)

Four options: the editor passes `locale` and `paletteOpen`; `store` and `scope` let the same
composition root live inside a page it does not own.

- `store` replaces the autosave's `DrawingStore` — `createMemoryDrawingStore()` for one that lasts
  as long as the page, `null` for none. **Anything embedding the engine beside the editor must pass
  one**: the default is this device's store, which holds the user's drawing.
- `scope` embeds it. The engine is **active** from a press or a focus inside the scope until the next
  one outside. Inactive, it hears no keys, lets the wheel scroll the page and the host's
  `focusSurface` does nothing (a command ending late must not pull focus back). Active, it hears
  keys aimed at the canvas, the scope or the body (where focus falls when a focused field unmounts);
  fields in the scope keep the editable rule; other controls keep their keys; and the scroll keys
  the runtime passes on are prevented.
- The filter sits in the adapter **before** `runtime.keyDown`, like the editable rule. Never make
  the runtime scope-aware.
- `mayTakeFocus(from)` is what the dynamic-input box asks before reclaiming focus after a render:
  yes from anywhere in the editor but an open menu or modal dialog, only from the canvas, the scope
  or the active body for an embed — or an autosave finishing would yank focus from where the user
  tabbed.

`CadRuntime.zoomToBounds` is ZOOM Window for a host that knows the rectangle. What the editor refuses
to restore (no objects, only the base layer) is `isBlankDrawing()`, the same rule a page uses to
overwrite an autosave without asking; change it there, once.
