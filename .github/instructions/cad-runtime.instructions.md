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
| `runtimeCommands.ts`   | the command table (`registerCommands`) and `commandPrompt`              |
| `runtimeLayers.ts`     | layer table edits (`updateLayer`, `nextLayerName`)                      |
| `runtimeStyles.ts`     | the dimension and text style tables                                     |
| `runtimeProperties.ts` | `setSelection*` overrides and the `commonSelection*` readers            |
| `runtimeBlocks.ts`     | `purgeBlocks`, `buildBlockPreview`                                      |
| `runtimeFiles.ts`      | serialize/load, the clipboard read-with-timeout, `selectAll`            |

**A sibling takes the collaborators it needs (`document`, `selection`, `history`, …), never the
runtime.** Wanting many private fields is the signal that the code belongs in the class — which is
why the pointer pipeline, `keyDown`, `updateSnap`, selection cycling, the FROM modifier and
`buildState` are still in it. `registerCommands` is the one exception: a command _is_ a call into
the public API, so it receives the runtime plus the two private entry points it cannot reach
(`startTool`, `registerCommand`), and imports `CadRuntime` as a **type only** so no import cycle
exists at runtime.

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

**Only snapping and tracking may move the crosshair.** Constraints bend the _point_ a tool
receives, never the cursor: the crosshair must keep following the physical mouse, or the user is
drawing blind. `updateSnap` picks `snap.point` → `tracking.point` → raw screen, in that order.

A tool returning `usesCrosshair() === false` (PAN) opts out entirely: no crosshair is drawn and
`updateSnap` leaves the cursor the tool set, instead of forcing `"none"`.

## The view (`Viewport`)

`Viewport` owns the camera _and_ the view history that ZOOM Previous walks. **Call
`pushHistory()` once per user gesture, before changing the view** — a wheel burst
(`WHEEL_BURST_MS`) and a pan drag are each one entry, not one per event. `zoomToBounds` is the
single "frame this rectangle" operation; use it rather than composing `zoomAt` + `centerOn`.

## Key routing (`CadRuntime.keyDown`) — order is load-bearing

1. Escape closes an open snap-override menu or Selection list box, or cancels the FROM modifier,
   without ending the command.
2. Function keys: F2 command prompt, F3 osnap, F7 grid, F8 Ortho, F9 snap mode, F10 Polar,
   F11 OTRACK, F4 selection cycling (AutoCAD's Ctrl+W, which browsers keep, is accepted too).
3. Ctrl combos (undo/redo, Ctrl+9, Ctrl+S save, Ctrl+O open, Ctrl+C/X/V copy-cut-paste,
   Ctrl+Shift+C copy with base point, Ctrl+A select all), then Shift+Space (selection
   cycling) — a global aid, like the function keys, and it must beat the command prompt, which
   reads a bare space as Enter.
4. **The active tool's `commandOptions()`** — a keyword beats a global command alias, because in
   AutoCAD an alias only starts a command at the neutral prompt.
5. Everything else feeds the **command-line buffer** (this is why multi-character aliases work and
   why no tool may claim a bare letter in `onKeyDown`).
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
the `TRACKABLE` set, a `SceneBuilder` marker + `SNAP_LABEL`, `drawing-aids.tsx`
(`SNAP_LABELS` / `IMPLEMENTED_SNAPS`), `snap-override-menu.tsx`, and the default enabled/disabled
call in the `CadRuntime` constructor.

## Commands and history

`history.execute(command)` is the only write path to the document. `loadDrawing` clears the
history (a loaded file is a fresh baseline). Document _settings_ changes (unit, precision,
ltScale, layer table edits) are deliberately not undoable; anything touching entities is.

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
formatting (lengths, angles, property rows, dynamic-input labels) belongs here, not in React.

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
Glyph metrics — alignment, cap height, font size — are the presenter's job: the scene describes
_what_ to align to, not where the pixels land.

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
whatever object is under the cursor for editing (today, text → TEXTEDIT). Extend that one method
for each newly editable type rather than adding another adapter listener.

## Adapters

`CadEngine` owns the canvas, DOM listeners, `ResizeObserver`, rAF scheduling and device-pixel
ratio, and delegates the rest to `CadRuntime`. It is also the **composition root**: it builds the
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
