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

| Sibling                | Holds                                                                   |
| ---------------------- | ----------------------------------------------------------------------- |
| `runtimeTools.ts`      | `defaultTools` — every tool the constructor registers, in toolbar order |
| `runtimeCommands.ts`   | the command table (`registerCommands`), `offerOptions`, `commandPrompt` |
| `runtimeLayers.ts`     | layer table edits (`updateLayer`, `nextLayerName`)                      |
| `runtimeStyles.ts`     | the dimension and text style tables                                     |
| `runtimeProperties.ts` | `setSelection*` overrides and the `commonSelection*` readers            |
| `runtimeBlocks.ts`     | `purgeBlocks`, `buildBlockPreview` (on `drawingPreview.ts`)             |
| `runtimeFiles.ts`      | serialize/load, the clipboard read-with-timeout, `selectAll`            |

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

- A direct snap **wins** over tracking and over the lattice: geometry beats an increment.
- When tracking engages, its point already accounts for the active Ortho ray, so it is returned
  as-is and constraints are skipped.
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
drawing blind. `updateSnap` picks `snap.point` → `tracking.point` → raw screen, in that order.

**The point carries a Z** (`ResolvedPoint.point` and `PointerInput.point` are `Vec3`), taken in
the same order: a snap's is the object's there (`SnapCandidate.point` is a `Vec3`; providers build
it with `on(entity, point)`, which reads `entityZAt`), a tracked point's is the acquired point's,
and otherwise the elevation plane (`ucs.origin.z` + ELEVATION; the resolver reads both through
getters). Constraints and the lattice work in plan and the resolver puts the Z back after them.
Intersection is 3D (`meetingHeight`: two objects that cross in plan at different heights do not
meet; the rubber band meets anything); Apparent Intersection takes the first object's. `input.world`
stays 2D: it is for picking.

A tool returning `usesCrosshair() === false` (PAN) opts out entirely: no crosshair is drawn and
`updateSnap` leaves the cursor the tool set, instead of forcing `"none"`.

## The view (`Viewport`)

`Viewport` owns the camera _and_ the view history that ZOOM Previous walks. **Call
`pushHistory()` once per user gesture, before changing the view** — a wheel burst
(`WHEEL_BURST_MS`) and a pan drag are each one entry, not one per event. `zoomToBounds` is the
single "frame this rectangle" operation; use it rather than composing `zoomAt` + `centerOn`.

**The view can be turned** (PLAN, VIEWTWIST): `xAxis` is the world direction drawn pointing right,
kept as a unit vector like a UCS axis, and part of the `Camera` ZOOM Previous restores. A screen
rectangle is therefore upright in the **view frame** (`worldToView`), not in the world. Anything
that tests or frames one works there: `boxSelect` tests `entityInView`, ZOOM Window / Extents /
Object and PLAN frame `entitiesViewBounds` with `zoomToViewBounds` (`zoomToBounds` is for a
_world_ rectangle, which a turned view fits by its bounding box), and a visible-area query maps all
four screen corners, never two. Two opposite corners through `screenToWorld` only bound the view
while it is untwisted — the bug stays invisible until someone runs PLAN in a turned UCS.

## Key routing (`CadRuntime.keyDown`) — order is load-bearing

1. Escape closes an open snap-override menu or Selection list box, or cancels the FROM modifier,
   without ending the command.
2. Function keys: F2 command prompt, F3 osnap, F7 grid, F8 Ortho, F9 snap mode, F10 Polar,
   F11 OTRACK, F4 selection cycling (AutoCAD's Ctrl+W, which browsers keep, is accepted too).
3. Ctrl combos (undo/redo, Ctrl+9, Ctrl+S save, Ctrl+O open, Ctrl+C/X/V copy-cut-paste,
   Ctrl+Shift+C copy with base point, Ctrl+A select all), then Shift+Space (selection
   cycling) — a global aid, like the function keys, and it must beat the command prompt, which
   reads a bare space as Enter.
4. **The active tool's keywords, by their single key** — a keyword beats a global command alias,
   because in AutoCAD an alias only starts a command at the neutral prompt. Only a one-letter
   abbreviation no other keyword starts with, and only on an empty prompt, so `_C` and `SIZ` can
   be typed.
5. Everything else feeds the **command-line buffer** (this is why multi-character aliases work and
   why no tool may claim a bare letter in `onKeyDown`). Submitted, it is read first as a keyword
   of the running command (abbreviation, word, or `_` and the global one), then as a command name
   (the command language's names and aliases, or `_` and a global name).
6. Tail: Escape/Enter → `returnToNeutralTool`, then `activeTool.onKeyDown`.

Inserting anything above step 4 steals keys from running commands; inserting between 4 and 5
steals them from typing. Prefer exposing behaviour as a command option or a command.

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

- Provider order in `defaultSnapProviders` **is** the priority order.
- Hysteresis: capture within `pixelTolerance` (8px), hold until the cursor leaves
  `releaseTolerance` (11px) — that is the "tacky" feel; keep release ≥ capture.
- `SnapCandidate.pickDistance` overrides the engagement distance, so a snap whose _point_ is far
  away (perpendicular foot, tangent) can still engage while hovering the object.
- `transient` candidates come from tool construction geometry (rubber band). They snap and render
  but are **never acquired** by OTRACK — AutoCAD never tracks a moving point.
- The one-shot `override` runs a single provider, ignoring the enabled running set, then is
  cleared once the pick is consumed.
- Providers read `SnapContext.entities`, **not** `document.getEntities()`: that list is the drawing
  with every block reference already expanded into the geometry it draws (AutoCAD snaps inside a
  block), built once per resolve rather than ten times. `document` is still there for the
  visibility check, since the layers are real. `insertionProvider` is the exception — it offers the
  reference's own insertion point, so it reads the document.

Adding a snap type touches: `SnapType`, a provider, `defaultSnapProviders` (position = priority),
the `TRACKABLE` set, a `SceneBuilder` marker, its name in `interface.snap` (menus, read by React
from `state.names`) and `commands.feedback.snap` (the canvas tooltip), `IMPLEMENTED_SNAPS` in
`drawing-aids.tsx`, the menu order in `snap-override-menu.tsx`, and the default enabled/disabled
call in the `CadRuntime` constructor.

## Commands and history

`history.execute(command)` is the only write path to the document. `loadDrawing` clears the
history (a loaded file is a fresh baseline). Document _settings_ changes (unit, precision,
ltScale, layer table edits) are deliberately not undoable; anything touching entities is. The
exceptions are the settings AutoCAD's U undoes — ATTMODE, the UCS and its table, UCSICON, ELEVATION
and THICKNESS — which go through a command (`UpdateSettingsCommand` restores exactly the keys it
patched). A settings change another one implies belongs in the same patch: changing to the WCS puts
ELEVATION to 0.

A command that adds **table entries alongside geometry** (BLOCK's definition, PASTECLIP's layers,
styles and blocks) carries them through the history too, and undoes them in reverse order — those
tables all refuse to drop an entry still in use, so the geometry has to go first. Work the result
out **once**, before the command runs, and store it: a redo must re-add the very same ids.

## Waiting on the host

**Bound every wait on an asynchronous port.** A browser may leave `navigator.clipboard.readText()`
pending indefinitely behind an unanswered permission prompt, which made Ctrl+V do nothing at all —
not even report. Race the call against a timeout and fall back (`CLIPBOARD_READ_TIMEOUT_MS`), and
keep a session-local copy of anything the host might refuse to hand back, so the capability
degrades instead of disappearing.

## EngineState

The single UI contract, built once in `buildState` and cached — `useSyncExternalStore` needs a
stable reference, so never rebuild it per pointer move, only on model emits. All user-facing
formatting (lengths, angles, property rows, dynamic-input labels) belongs here, not in React, and
all its words come from `runtime.text` (`EngineText`, the locale laid over English). React keys
rows, groups and chips by **id**, never by a label two translations could share. The prompt is
also given in spans (`commandLine.promptSegments`, the keyword list set apart) with the running
command's name (`commandLine.command`), so no host takes the text apart. `setLocale` swaps the
text and rebuilds the state; the scrollback stays as it was written.

Coordinates the user reads are **UCS** coordinates: the status readout is `cursorUcs` (a `Vec3`,
its Z the elevation plane's), and the Properties palette's X/Y/Z rows (and a line's deltas) are
converted in `singleEntityInfo`. A retyped X or Y is read in the UCS too (`runtimeProperties.ts`),
which in a turned UCS moves the point along that axis and so rewrites both world coordinates; a
retyped Z (`isZProperty`) gets `ucs.origin.z` added, except Thickness, which is a length. Rotations
stay in the WCS, as AutoCAD's do. Rows AutoCAD files under **General** go in
`SelectionInfo.general` (the palette renders them after its pickers), never in a group.

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
Glyph metrics — alignment, cap height, font size — are the presenter's job: the scene describes
_what_ to align to, not where the pixels land.

The grid lies on the UCS (`SceneInput.ucs`) and the UCS icon is drawn by the scene
(`SceneInput.ucsIcon`, its letters from the catalog). A host with chrome of its own hides it with
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
drawing is geometry and never mirrors. It is also the **composition root**: it builds the
port implementations (`createLocalStorageDrawingStore`, `createBrowserFileTransport`) and hands
them to the runtime. Each returns `null` outside the browser, and the runtime reports the missing
capability rather than crashing.

Two listeners are deliberately on `canvas.ownerDocument`, not the canvas:

- `keydown`, so Escape and shortcuts work regardless of which element holds focus. It ignores
  events from `input/textarea/select/[contenteditable]` — **except function keys and Ctrl+S/Ctrl+O**,
  which are global and must also be swallowed so the browser's own dialogs never open. Other Ctrl
  combos stay unforwarded on purpose: a global undo from a focused field desyncs the running tool,
  and Ctrl+C/X/V/A inside a dynamic-input box or a layer name belong to that **text**. Never widen
  `isFileShortcut` to the clipboard keys.
- `contextmenu`, because the event fires on button _release_, by which time a portalled modal
  backdrop may be the target.

**A shortcut belongs in `CadRuntime.keyDown`, never in a React `useEffect`.** A second
document-level listener bypasses the routing order above and cannot `preventDefault` in step with
it.

### Embedding (`CadEngineOptions`)

The editor passes no options, and everything above is its behaviour. Two options let the same
composition root live inside a page it does not own (the landing's live sketch):

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
  yes from anywhere in the editor, only from the canvas, the scope or the active body for an
  embed. Without it an autosave finishing would yank focus back from wherever the user tabbed.

`CadRuntime.zoomToBounds` is ZOOM Window for a host that knows the rectangle (one history entry,
then `Viewport.zoomToBounds`). What the editor refuses to restore — no objects and only the base
layer — is `isBlankDrawing()`, the same rule a page uses to decide it may overwrite an autosave
without asking; change it there, once.
