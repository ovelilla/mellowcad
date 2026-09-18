import { Observable } from "../shared/Observable"
import { Vec2, V } from "../geometry/Vec2"
import { closestPointOnSegment } from "../geometry/primitives"
import { CadDocument } from "../domain/Document"
import {
  BlockId,
  Entity,
  EntityId,
  EntityProperty,
  entitiesBounds,
} from "../domain/entities"
import { COLOR_BYLAYER, EntityColor } from "../domain/colors"
import {
  createLayer,
  DEFAULT_LAYER_COLOR,
  Layer,
  LayerId,
} from "../domain/layers"
import { LINETYPE_BYLAYER, LinetypeId } from "../domain/linetypes"
import { DimStyle, DimStyleId } from "../domain/dimStyles"
import { TextStyle, TextStyleId } from "../domain/textStyles"
import { LINEWEIGHT_BYLAYER, Lineweight } from "../domain/lineweights"
import {
  formatAngle,
  formatLength,
  LengthUnit,
  unitSuffix,
} from "../domain/units"
import { parseDrawingFile } from "../serialization/drawingFile"
import { Scene } from "../scene/types"
import { Viewport } from "./Viewport"
import { Selection } from "./Selection"
import { SnapMode, SnapModeType } from "./SnapMode"
import { SelectionCycling } from "./SelectionCycling"
import { SnapEngine } from "./snapping/SnapEngine"
import { SnapResult, SnapType } from "./snapping/types"
import { ParallelReferenceEngine } from "./snapping/ParallelReference"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintType } from "./constraints/types"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { TrackingResult } from "./tracking/types"
import {
  DynamicInputController,
  DynamicInputSession,
} from "./input/DynamicInput"
import { parseCoordinate } from "./input/coordinateInput"
import {
  CommandDefinition,
  CommandLineController,
  matchCommands,
  toolCommandAlias,
} from "./CommandLine"
import { CommandHistory } from "./commands/Command"
import {
  ClearDocumentCommand,
  RemoveEntitiesCommand,
} from "./commands/entityCommands"
import { PointerInput, Tool, ToolContext } from "./tools/Tool"
import { InsertTool } from "./tools/InsertTool"
import { TextEditTool } from "./tools/TextEditTool"
import { PasteTool } from "./tools/PasteTool"
import { PointResolver } from "./PointResolver"
import { AutosaveService } from "./Autosave"
import { buildScene, PolarGuideInput } from "./SceneBuilder"
import {
  buildBlockInfos,
  buildDimStyleInfos,
  buildDynamicInputUi,
  buildLayerInfos,
  buildSelectionCandidates,
  buildSelectionInfo,
  buildTextStyleInfos,
  commonStyleId,
  EngineState,
  StylesPanelTab,
} from "./EngineState"
import { Clipboard, DrawingStore, EngineHost, FileTransport } from "./ports"
import { nextLayerName, updateLayer } from "./runtimeLayers"
import { buildBlockPreview, purgeBlocks } from "./runtimeBlocks"
import { commandPrompt, registerCommands } from "./runtimeCommands"
import { defaultTools } from "./runtimeTools"
import {
  applyDrawingFile,
  copyToClipboard,
  readClipboardFragment,
  selectAll,
  serializeDrawing,
  suggestedFileName,
} from "./runtimeFiles"
import {
  commonSelectionColor,
  commonSelectionLayer,
  commonSelectionLinetype,
  commonSelectionLineweight,
  setSelectionColor,
  setSelectionLayer,
  setSelectionLinetype,
  setSelectionLineweight,
  setSelectionProperty,
} from "./runtimeProperties"
import {
  createDimStyle,
  createTextStyle,
  setSelectionDimStyle,
  setSelectionTextStyle,
  updateDimStyle,
  updateTextStyle,
} from "./runtimeStyles"

export interface PointerEventData {
  readonly screen: Vec2
  readonly button: number
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
}

export interface WheelEventData {
  readonly screen: Vec2
  readonly deltaY: number
}

export interface KeyEventData {
  readonly key: string
  readonly shiftKey: boolean
  readonly ctrlKey: boolean
  readonly altKey: boolean
}

/** Wheel events closer together than this belong to the same zoom gesture. */
const WHEEL_BURST_MS = 400

/** Movement past this (screen px) makes a press a drag rather than a click. */
const DRAG_THRESHOLD_PX = 4

/**
 * The application core of the CAD system — the imperative shell around the
 * functional pieces (geometry kernel, scene builder, commands). It contains no
 * references to React, the DOM, Canvas or localStorage — those live behind the
 * {@link EngineHost} and {@link DrawingStore} ports.
 */
export class CadRuntime extends Observable {
  readonly document = new CadDocument()
  readonly viewport = new Viewport()
  readonly selection = new Selection()
  readonly snapping = new SnapEngine()
  readonly snapMode = new SnapMode()
  readonly cycling = new SelectionCycling()
  readonly constraints = new ConstraintManager(this.viewport)
  readonly tracking = new ObjectSnapTrackingEngine()
  readonly parallelRefs = new ParallelReferenceEngine()
  readonly dynamicInput = new DynamicInputController()
  readonly commandLine = new CommandLineController()
  readonly history = new CommandHistory(this.document)

  private readonly host: EngineHost
  private readonly resolver: PointResolver
  private readonly autosave: AutosaveService
  private readonly toolContext: ToolContext

  private readonly tools = new Map<string, Tool>()
  private activeTool: Tool

  /** Every command, in registration order (drives autocomplete). */
  private readonly commandList: CommandDefinition[] = []
  /** Name *and* alias lookup, e.g. both `"LINE"` and `"L"`. */
  private readonly commands = new Map<string, CommandDefinition>()

  private currentSnap: SnapResult | null = null
  private lastTracking: TrackingResult | null = null
  private cursorWorld: Vec2 | null = null

  // Whether Shift was held on the last pointer event. AutoCAD uses Shift as a
  // temporary Ortho override while specifying a point; this feeds the resolver.
  private pointerShift = false

  // Magnetic crosshair: where to draw it (screen), positioned on the resolved
  // point so it clings to geometry. `null` means the pointer is off-canvas.
  private crosshairScreen: Vec2 | null = null

  // Last place the pointer was seen (screen), or null while it is off-canvas.
  // Lets a command started from the keyboard or a toolbar button pick up the
  // cursor's position without waiting for the next mouse move.
  private lastPointerScreen: Vec2 | null = null

  private gridVisible = true
  // Which style table the manager is showing, or null while it is closed.
  private stylesPanel: StylesPanelTab | null = null
  // Whether the Blocks palette is showing.
  private blocksPanel = false
  // Whether the command prompt is shown. Hiding it is purely visual: typing
  // still feeds the prompt, which reappears while there is text to show.
  private commandLineVisible = true

  private disposed = false
  private initializedView = false
  private pendingFit = false

  private panning = false
  private lastPanScreen: Vec2 | null = null
  /** When the last wheel event arrived, to group a scroll burst as one view. */
  private lastWheelAt = 0

  // Where to pop the object-snap override menu (screen coords), or null when it
  // is closed. Opened with Shift+right-click during a point prompt.
  private snapOverrideMenu: Vec2 | null = null

  // The click deferred while the Selection list box asks which of the
  // overlapping objects was meant; replayed once one is chosen.
  private cyclingList: PointerEventData | null = null
  // A press held back because it may become that click (see pointerUp).
  private cyclingPress: PointerEventData | null = null

  // AutoCAD's FROM modifier: the next pick becomes a base point, and the point
  // the tool actually receives is typed as an offset from it. The tool's own
  // dynamic input is parked while the offset is entered and restored after.
  private fromPending = false
  private fromBase: Vec2 | null = null
  private fromParkedSession: DynamicInputSession | null = null

  private stateSnapshot: EngineState

  // Held as a field so a double-click can hand it the object directly.
  private readonly textEdit = new TextEditTool()
  // Held as a field so the Blocks palette can name the block for it.
  private readonly insert = new InsertTool()
  // Held as a field so the runtime can hand it the fragment it read.
  private readonly paste = new PasteTool()

  private readonly files: FileTransport | null
  private readonly clipboard: Clipboard | null
  /**
   * What this session last copied. The browser clipboard may well refuse to be
   * read — not every engine exposes reading to a page, and the ones that do ask
   * the user — so copy-and-paste has to keep working from memory when the host
   * says no.
   */
  private clipboardFallback: string | null = null

  constructor(
    host: EngineHost,
    store: DrawingStore | null = null,
    files: FileTransport | null = null,
    clipboard: Clipboard | null = null
  ) {
    super()
    this.host = host
    this.files = files
    this.clipboard = clipboard
    this.resolver = new PointResolver(
      this.viewport,
      this.snapping,
      this.constraints,
      this.tracking,
      this.snapMode
    )
    this.autosave = new AutosaveService(store, () => this.serializeDrawing())

    // The single surface tools may touch: read-only document + command bus.
    this.toolContext = {
      document: this.document,
      viewport: this.viewport,
      selection: this.selection,
      dynamicInput: this.dynamicInput,
      blocks: this.document.blockLookup(),
      execute: (command) => this.history.execute(command),
      undo: () => this.history.undo(),
      pickTolerance: () =>
        this.viewport.screenToWorldDistance(this.snapping.pixelTolerance),
      pick: (world, tolerance) => this.pickEntity(world, tolerance),
      requestRender: () => this.host.requestRender(),
      setCursor: (cursor) => this.host.setCursor(cursor),
      report: (text, kind = "info") => this.commandLine.write(kind, text),
      copyToClipboard: (entities, basePoint) =>
        this.copyToClipboard(entities, basePoint),
      endCommand: () => {
        this.resetTracking()
        this.returnToNeutralTool()
      },
    }

    for (const tool of defaultTools(this.textEdit, this.insert, this.paste)) {
      this.registerTool(tool)
    }
    this.activeTool = this.tools.get("select")!

    this.registerCommands()

    // Running-snap defaults mirror AutoCAD's out-of-the-box set: the always-on
    // snaps are the notable "vertex" points — Endpoint, Midpoint, Center and
    // Intersection. Everything else is off by default and used deliberately
    // (via the Shift+right-click override or by toggling it on), matching how a
    // fresh AutoCAD ships (its default OSMODE is Endpoint/Center/Intersection/
    // Extension; we add Midpoint, which users almost always keep on).
    //
    // Apparent (extended) intersection: fires on geometry that only meets when
    // extended — noisy as a running snap.
    this.snapping.setEnabled(SnapType.ApparentIntersection, false)
    // Nearest: matches any point on an outline, so it would constantly override
    // the notable points.
    this.snapping.setEnabled(SnapType.Nearest, false)
    // Perpendicular and Tangent engage over the whole line/circle, so they are
    // best forced deliberately via the override (which ignores this set) rather
    // than firing on every line the cursor crosses while drawing.
    this.snapping.setEnabled(SnapType.Perpendicular, false)
    this.snapping.setEnabled(SnapType.Tangent, false)
    // Quadrant is off by default in AutoCAD too (it is not in the default
    // OSMODE); the four cardinal points of a circle are an occasional need.
    this.snapping.setEnabled(SnapType.Quadrant, false)
    // Insertion is likewise absent from AutoCAD's default OSMODE: it is how you
    // grab a text object's own point when you deliberately need it.
    this.snapping.setEnabled(SnapType.Insertion, false)
    // Extension and Parallel are directional alignment snaps — off by default
    // in AutoCAD as well; they are turned on deliberately when needed.
    this.snapping.setEnabled(SnapType.Extension, false)
    this.snapping.setEnabled(SnapType.Parallel, false)

    // Rebuild the UI snapshot and redraw whenever any sub-model changes.
    const onModelChange = () => {
      this.invalidateState()
      this.host.requestRender()
    }
    this.document.subscribe(onModelChange)
    this.selection.subscribe(onModelChange)
    this.viewport.subscribe(onModelChange)
    this.snapping.subscribe(onModelChange)
    this.snapMode.subscribe(onModelChange)
    this.cycling.subscribe(onModelChange)
    this.constraints.subscribe(onModelChange)
    this.tracking.subscribe(onModelChange)
    this.parallelRefs.subscribe(onModelChange)
    this.dynamicInput.subscribe(onModelChange)
    this.commandLine.subscribe(onModelChange)
    this.history.subscribe(onModelChange)
    this.autosave.subscribe(() => this.invalidateState())

    this.stateSnapshot = this.buildState()

    // Bring back the last session's drawing (transparent, per-device) before
    // the first layout so the view can frame it (`pendingFit`).
    this.restoreFromStore()

    this.activeTool.onActivate?.(this.toolContext)

    // Start auto-saving on every subsequent document change.
    this.document.subscribe(() => this.autosave.schedule())
  }

  /** Returns a stable snapshot; identity only changes when state changes. */
  getState(): EngineState {
    return this.stateSnapshot
  }

  listTools(): Tool[] {
    return Array.from(this.tools.values())
  }

  registerTool(tool: Tool): void {
    this.tools.set(tool.id, tool)
  }

  setActiveTool(id: string): void {
    const next = this.tools.get(id)
    if (!next || next === this.activeTool) return
    this.activeTool.onDeactivate?.(this.toolContext)
    this.resetTracking()
    this.activeTool = next
    next.onActivate?.(this.toolContext)
    // Commands are usually started from the keyboard or a toolbar button, with
    // the mouse standing still. Replay the cursor's last known position through
    // the new tool so its prompt box appears and the drawing crosshair takes
    // over right away, instead of the new tool's native cursor sitting on top
    // of a stale crosshair until the mouse moves.
    if (this.lastPointerScreen) {
      const resting: PointerEventData = {
        screen: this.lastPointerScreen,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      }
      this.updateSnap(resting.screen)
      next.onPointerMove?.(this.buildPointerInput(resting), this.toolContext)
      if (this.dynamicInput.isOpen()) {
        this.dynamicInput.setPosition(resting.screen)
      }
    }
    this.invalidateState()
    // Give the drawing surface keyboard focus so Escape/shortcuts reach the
    // runtime even when the tool was picked from the toolbar (otherwise focus
    // stays on the button and Escape can't cancel the command or clear any
    // acquired object-snap-tracking references).
    this.host.focusSurface()
    this.host.requestRender()
  }

  /**
   * Returns to the neutral Select tool after a command ends. AutoCAD has no
   * persistent "select" mode: pressing Escape ends the running command and
   * drops you back into picking, so the user never has to explicitly switch
   * tools to select again. A no-op when Select is already active (so aborting a
   * box drag or grip edit keeps you in Select).
   */
  private returnToNeutralTool(): void {
    this.setActiveTool("select")
  }

  /**
   * Builds the command table: one command per tool (using AutoCAD's names and
   * aliases) plus the editing/view commands that are not tools.
   */
  private registerCommands(): void {
    registerCommands(
      this,
      (id) => this.startTool(id),
      (definition) => this.registerCommand(definition)
    )
  }

  private registerCommand(definition: CommandDefinition): void {
    this.commandList.push(definition)
    this.commands.set(definition.name, definition)
    for (const alias of definition.aliases) {
      this.commands.set(alias, definition)
    }
  }

  /**
   * Starts a tool from the command line. Typing a command that is already
   * running restarts it (AutoCAD behaviour), so drop to neutral first —
   * {@link setActiveTool} ignores a switch to the tool already active.
   */
  private startTool(id: string): void {
    if (this.activeTool.id === id) this.returnToNeutralTool()
    this.setActiveTool(id)
  }

  /** Replaces the text at the command prompt (typed on the canvas or the box). */
  setCommandLineText(text: string): void {
    this.commandLine.setBuffer(text)
    this.invalidateState()
  }

  /**
   * Runs what has been typed. An empty prompt repeats the last command, which
   * is how AutoCAD users chain repeated operations with Enter/Space.
   */
  submitCommandLine(): void {
    const text = this.commandLine.getBuffer().trim()
    this.commandLine.setBuffer("")
    if (text === "") {
      this.repeatLastCommand()
      return
    }
    this.runCommand(text)
  }

  /**
   * Runs a command by name or alias (case-insensitive), reporting whether it
   * existed. Unknown names are echoed to the prompt rather than thrown, like a
   * real command line.
   */
  runCommand(text: string): boolean {
    const name = text.trim().toUpperCase()
    if (name === "") return false
    const command = this.commands.get(name)
    if (!command) {
      this.commandLine.write("error", `Unknown command "${name}".`)
      this.invalidateState()
      return false
    }
    this.commandLine.write("command", command.name)
    this.commandLine.pushHistory(command.name)
    command.run()
    this.invalidateState()
    this.host.focusSurface()
    return true
  }

  /** Repeats the last command, AutoCAD's Enter/Space at the neutral prompt. */
  repeatLastCommand(): boolean {
    const last = this.commandLine.getLastCommand()
    if (!last) return false
    return this.runCommand(last)
  }

  /** Completes the prompt to the best autocomplete match (Tab). */
  completeCommandLine(): void {
    const [best] = matchCommands(
      this.commandList,
      this.commandLine.getBuffer(),
      1
    )
    if (!best) return
    this.setCommandLineText(best.name)
  }

  /** Walks previously run commands into the prompt (Arrow Up/Down). */
  recallCommand(direction: -1 | 1): void {
    this.commandLine.recall(direction)
    this.invalidateState()
  }

  /** Shows or hides the command prompt (AutoCAD's Ctrl+9). */
  toggleCommandLine(): void {
    this.commandLineVisible = !this.commandLineVisible
    this.invalidateState()
  }

  deleteSelection(): void {
    if (this.selection.isEmpty()) return
    this.history.execute(new RemoveEntitiesCommand(this.selection.toArray()))
    this.selection.clear()
  }

  clearAll(): void {
    this.selection.clear()
    if (this.document.size === 0) return
    this.history.execute(new ClearDocumentCommand())
  }

  undo(): void {
    if (this.history.undo()) this.selection.clear()
  }

  redo(): void {
    if (this.history.redo()) this.selection.clear()
  }

  zoomIn(): void {
    this.viewport.pushHistory()
    this.viewport.zoomAt(this.viewportCenterScreen(), 1.2)
  }

  zoomOut(): void {
    this.viewport.pushHistory()
    this.viewport.zoomAt(this.viewportCenterScreen(), 1 / 1.2)
  }

  resetView(): void {
    this.viewport.pushHistory()
    this.viewport.reset()
  }

  /** AutoCAD's ZOOM Previous. Returns whether an earlier view existed. */
  zoomPrevious(): boolean {
    return this.viewport.restorePrevious()
  }

  zoomToFit(padding = 40): void {
    this.viewport.pushHistory()
    const bounds = entitiesBounds(
      this.document.getEntities(),
      this.document.blockLookup()
    )
    if (!bounds) {
      this.viewport.reset()
      return
    }
    this.viewport.zoomToBounds(bounds.min, bounds.max, padding)
  }

  toggleSnap(): void {
    this.snapping.toggleActive()
  }

  setSnapEnabled(type: SnapType, enabled: boolean): void {
    this.snapping.setEnabled(type, enabled)
  }

  /** Opens the object-snap override menu at the given screen position. */
  private openSnapOverrideMenu(screen: Vec2): void {
    this.snapOverrideMenu = screen
    this.invalidateState()
    this.host.requestRender()
  }

  /**
   * Forces a single object snap (or `"none"`) for the next point — the choice
   * made in the override menu. Closes the menu and refreshes the snap at the
   * position it was opened so the forced marker shows immediately.
   */
  setSnapOverride(override: SnapType | "none"): void {
    const at = this.snapOverrideMenu
    this.snapping.setOverride(override)
    this.snapOverrideMenu = null
    if (at) this.updateSnap(at)
    else this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /** Dismisses the override menu without forcing a snap. */
  closeSnapOverrideMenu(): void {
    if (this.snapOverrideMenu === null) return
    this.snapOverrideMenu = null
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /**
   * Starts AutoCAD's FROM modifier: the next pick sets a base point (normally
   * with an object snap) and the point after it is entered as an offset from
   * that base, e.g. `@20,0`. Only meaningful while a tool is asking for a point.
   */
  startFrom(): boolean {
    if (!(this.activeTool.wantsSnap?.() ?? true)) return false
    this.snapOverrideMenu = null
    this.fromPending = true
    this.fromBase = null
    this.commandLine.write("info", "FROM: pick the base point.")
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
    return true
  }

  private beginFromOffset(base: Vec2): void {
    this.fromPending = false
    this.fromBase = base
    this.fromParkedSession = this.dynamicInput.getSession()
    this.dynamicInput.open({
      fields: [{ id: "offset", label: "", kind: "coordinate" }],
      commit: () => {},
      commitRaw: () => this.commitFromOffset(),
    })
    if (this.lastPointerScreen) {
      this.dynamicInput.setPosition(this.lastPointerScreen)
    }
    this.commandLine.write("info", "FROM: offset from the base point.")
  }

  private commitFromOffset(): boolean {
    const base = this.fromBase
    if (!base) return false
    const point = parseCoordinate(this.dynamicInput.getText("offset").trim(), {
      lastPoint: base,
      relativeByDefault: true,
    })
    if (!point) return false
    this.endFrom()
    this.placePoint(point)
    return true
  }

  /** Feeds a point to the active tool as if it had been picked there. */
  private placePoint(point: Vec2): void {
    this.activeTool.onPointerDown?.(
      {
        screen: this.viewport.worldToScreen(point),
        world: point,
        snap: null,
        tracking: null,
        point,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      },
      this.toolContext
    )
    this.snapping.clearOverride()
    if (!(this.activeTool.retainsTrackingAfterPointerDown?.() ?? false)) {
      this.resetTracking()
    }
    this.host.requestRender()
  }

  /** Leaves FROM, giving the tool back the dynamic input it had open. */
  private endFrom(): void {
    if (!this.fromPending && !this.fromBase) return
    this.fromPending = false
    this.fromBase = null
    if (this.fromParkedSession) this.dynamicInput.open(this.fromParkedSession)
    else this.dynamicInput.close()
    this.fromParkedSession = null
  }

  toggleOrtho(): void {
    this.constraints.toggle(ConstraintType.Ortho)
  }

  /** Toggles Polar tracking (AutoCAD's POLAR / F10). */
  togglePolar(): void {
    this.constraints.toggle(ConstraintType.Polar)
  }

  /** Sets the polar tracking angle increment, in degrees. */
  setPolarAngleStep(step: number): void {
    this.constraints.setPolarAngleStep(step)
  }

  toggleObjectSnapTracking(): void {
    this.tracking.toggleActive()
  }

  /** Drops every acquired object-snap-tracking reference (UI "Clear" button). */
  clearTracking(): void {
    this.resetTracking()
    this.host.requestRender()
  }

  toggleGrid(): void {
    this.gridVisible = !this.gridVisible
    this.invalidateState()
    this.host.requestRender()
  }

  /** Toggles snap mode (AutoCAD's SNAP / F9). */
  toggleSnapMode(): void {
    this.snapMode.toggleActive()
    this.refreshSnapAtCursor()
  }

  setSnapModeType(type: SnapModeType): void {
    this.snapMode.setType(type)
    this.refreshSnapAtCursor()
  }

  /** Sets the snap lattice spacing; `y` defaults to `x`. */
  setSnapSpacing(x: number, y?: number): void {
    this.snapMode.setSpacing(x, y)
    this.refreshSnapAtCursor()
  }

  /** Sets the polar snap increment (AutoCAD's POLARDIST). */
  setSnapPolarDistance(distance: number): void {
    this.snapMode.setPolarDistance(distance)
    this.refreshSnapAtCursor()
  }

  /**
   * Re-resolves the cursor after a drafting-mode change so the crosshair jumps
   * onto (or off) the lattice right away, without waiting for a mouse move.
   */
  private refreshSnapAtCursor(): void {
    if (this.lastPointerScreen) this.updateSnap(this.lastPointerScreen)
    this.host.requestRender()
  }

  /** Toggles selection cycling (AutoCAD's SELECTIONCYCLING / Ctrl+W). */
  toggleSelectionCycling(): void {
    this.cycling.toggle()
    this.refreshCycling()
    this.refreshSnapAtCursor()
  }

  /** Whether a click over a stack offers the Selection list box (value 2). */
  setSelectionCyclingList(showList: boolean): void {
    this.cycling.setShowsList(showList)
  }

  /**
   * Highlights the next object under the pick box (Shift+Space) and replays the
   * cursor through the active tool, so its rollover preview immediately shows
   * which object a click would now take. False when there is nothing to cycle.
   */
  cycleSelection(): boolean {
    if (!this.cycling.cycle()) return false
    this.replayPointerMove()
    this.host.requestRender()
    return true
  }

  /**
   * Takes the object chosen in the Selection list box: the click that opened
   * the list is replayed, now resolving to that object.
   */
  chooseCyclingCandidate(id: EntityId): void {
    const pending = this.cyclingList
    this.cyclingList = null
    this.cycling.setCurrent(id)
    if (pending) {
      this.dispatchPointerDown(pending)
      this.dispatchPointerUp(pending)
    }
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /** Previews a candidate while the pointer hovers its row in the list box. */
  previewCyclingCandidate(id: EntityId): void {
    this.cycling.setCurrent(id)
    this.host.requestRender()
  }

  /** Dismisses the Selection list box; the click that opened it is discarded. */
  closeCyclingList(): void {
    if (this.cyclingList === null) return
    this.cyclingList = null
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /**
   * The object a pick at `world` resolves to. Identical to `document.pick`
   * unless the user cycled to another of the objects the pick box covers.
   */
  private pickEntity(world: Vec2, tolerance?: number): Entity | null {
    const worldTolerance =
      tolerance ??
      this.viewport.screenToWorldDistance(this.snapping.pixelTolerance)
    if (!this.cycling.isEnabled()) {
      return this.document.pick(world, worldTolerance)
    }
    return this.cycling.choose(this.document.pickAll(world, worldTolerance))
  }

  /**
   * Records what the pick box covers, for the badge and for Shift+Space. Only
   * while the active tool is choosing *objects*: during a point prompt the
   * badge would be noise, and AutoCAD cycles between objects, not points.
   */
  private refreshCycling(): void {
    const picking = !(this.activeTool.wantsSnap?.() ?? true)
    if (!this.cycling.isEnabled() || !picking || this.cursorWorld === null) {
      this.cycling.clear()
      return
    }
    const tolerance = this.viewport.screenToWorldDistance(
      this.snapping.pixelTolerance
    )
    this.cycling.observe(this.document.pickAll(this.cursorWorld, tolerance))
  }

  /** Feeds the cursor's last known position through the active tool again. */
  private replayPointerMove(): void {
    if (!this.lastPointerScreen) return
    const resting: PointerEventData = {
      screen: this.lastPointerScreen,
      button: 0,
      shiftKey: this.pointerShift,
      ctrlKey: false,
      altKey: false,
    }
    this.activeTool.onPointerMove?.(
      this.buildPointerInput(resting),
      this.toolContext
    )
  }

  setConstraintEnabled(type: ConstraintType, enabled: boolean): void {
    this.constraints.setEnabled(type, enabled)
  }

  /**
   * Creates a new layer and (by default) makes it the current one so the next
   * geometry lands on it, matching AutoCAD's "New Layer + Set Current" flow.
   * Returns the new layer's id.
   */
  createLayer(
    name?: string,
    color: string = DEFAULT_LAYER_COLOR,
    makeCurrent = true
  ): LayerId {
    const layer = createLayer(name ?? nextLayerName(this.document), color)
    this.document.addLayer(layer)
    if (makeCurrent) this.document.setCurrentLayer(layer.id)
    return layer.id
  }

  updateLayer(
    id: LayerId,
    patch: Partial<
      Pick<
        Layer,
        "name" | "color" | "linetype" | "lineweight" | "visible" | "locked"
      >
    >
  ): void {
    updateLayer(this.document, this.selection, id, patch)
  }

  setCurrentLayer(id: LayerId): void {
    this.document.setCurrentLayer(id)
  }

  /**
   * Removes a layer if allowed (never the base layer `0`, the current layer, or
   * a layer that still owns geometry). Returns whether it was removed.
   */
  removeLayer(id: LayerId): boolean {
    return this.document.removeLayer(id)
  }

  setSelectionLayer(id: LayerId): void {
    setSelectionLayer(this.document, this.selection, this.history, id)
  }

  setSelectionColor(color: EntityColor | typeof COLOR_BYLAYER): void {
    setSelectionColor(this.document, this.selection, this.history, color)
  }

  setSelectionLinetype(linetype: LinetypeId | typeof LINETYPE_BYLAYER): void {
    setSelectionLinetype(this.document, this.selection, this.history, linetype)
  }

  setSelectionLineweight(
    lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
  ): void {
    setSelectionLineweight(
      this.document,
      this.selection,
      this.history,
      lineweight
    )
  }

  setSelectionProperty(property: EntityProperty, text: string): boolean {
    return setSelectionProperty(
      this.document,
      this.selection,
      this.history,
      property,
      text
    )
  }

  /** Updates the text of a dynamic-input field (defaults to the active one). */
  setDynamicInputText(text: string, fieldId?: string): void {
    const id = fieldId ?? this.dynamicInput.getActiveFieldId()
    if (!id) return
    this.dynamicInput.setText(id, text)
    // A typed value hard-locks that field, so the tool's preview (rubber-band)
    // must recompute now — not only on the next pointer move — to reflect it.
    this.host.requestRender()
  }

  setActiveDynamicField(fieldId: string): void {
    this.dynamicInput.setActiveField(fieldId)
  }

  /** Commits the typed/live values to the tool that opened the session. */
  commitDynamicInput(): void {
    const session = this.dynamicInput.getSession()
    if (!session) return
    const values = this.dynamicInput.resolveValues()
    if (values) {
      session.commit(values, this.toolContext)
    } else if (!session.commitRaw?.(this.toolContext)) {
      // The numeric fields don't resolve and the session has no raw handler (or
      // it rejected the text, e.g. an incomplete coordinate): nothing to do.
      return
    }
    this.dynamicInput.clearTexts()
    // Committing a value places/edits a point, which consumes any acquired
    // object-snap-tracking references — just like a click does.
    this.resetTracking()
    this.host.requestRender()
  }

  /**
   * Cancels dynamic input; the active tool aborts its in-progress operation.
   *
   * Escape also drops any acquired object-snap-tracking references, matching
   * AutoCAD (Esc ends the command *and* clears tracking acquisition). Because
   * the floating input steals keyboard focus while open, this is the Escape the
   * user actually hits, so tracking must be reset here too — not only on the
   * canvas keydown path.
   */
  cancelDynamicInput(): void {
    // While FROM is running, Escape cancels just the modifier and hands the
    // tool back its own input, leaving the command alive.
    if (this.fromPending || this.fromBase) {
      this.endFrom()
      this.host.requestRender()
      this.host.focusSurface()
      return
    }
    this.resetTracking()
    this.snapping.clearOverride()
    this.activeTool.onKeyDown?.(
      { key: "Escape", shiftKey: false, ctrlKey: false, altKey: false },
      this.toolContext
    )
    this.returnToNeutralTool()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /**
   * Invokes a command option (keyword) the active tool currently offers —
   * AutoCAD's `[Close/Undo]` prompt. The tool performs the action and reports
   * whether the command continues or has ended; on end we drop back to the
   * neutral Select tool, like any other completion. Returns whether the key
   * matched an option, so callers can decide whether to swallow it.
   */
  invokeToolOption(key: string): boolean {
    const outcome =
      this.activeTool.invokeOption?.(key, this.toolContext) ?? "unhandled"
    if (outcome === "unhandled") return false
    if (outcome === "end") {
      this.resetTracking()
      this.returnToNeutralTool()
    }
    // Rebuild the UI state so the command-option chips reflect any toggle the
    // option flipped (e.g. Erase: No → Yes), not just the redrawn scene.
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
    return true
  }

  setDocumentUnit(unit: LengthUnit): void {
    this.document.setUnit(unit)
  }

  setDocumentPrecision(precision: number): void {
    this.document.setPrecision(precision)
  }

  /** Sets the global linetype scale (AutoCAD's LTSCALE). */
  setLtScale(ltScale: number): void {
    this.document.setLtScale(ltScale)
  }

  createDimStyle(
    name?: string,
    basedOn?: DimStyleId,
    makeCurrent = true
  ): DimStyleId {
    return createDimStyle(this.document, name, basedOn, makeCurrent)
  }

  updateDimStyle(id: DimStyleId, patch: Partial<Omit<DimStyle, "id">>): void {
    updateDimStyle(this.document, id, patch)
  }

  setCurrentDimStyle(id: DimStyleId): void {
    this.document.setCurrentDimStyle(id)
  }

  /**
   * Removes a dimension style if allowed (never the base `ISO-25`, the current
   * style, or one still in use). Returns whether it was removed.
   */
  removeDimStyle(id: DimStyleId): boolean {
    return this.document.removeDimStyle(id)
  }

  /** Puts every selected dimension on style `id` (individually undoable). */
  setSelectionDimStyle(id: DimStyleId): void {
    setSelectionDimStyle(this.document, this.selection, this.history, id)
  }

  createTextStyle(
    name?: string,
    basedOn?: TextStyleId,
    makeCurrent = true
  ): TextStyleId {
    return createTextStyle(this.document, name, basedOn, makeCurrent)
  }

  updateTextStyle(
    id: TextStyleId,
    patch: Partial<Omit<TextStyle, "id">>
  ): void {
    updateTextStyle(this.document, id, patch)
  }

  setCurrentTextStyle(id: TextStyleId): void {
    this.document.setCurrentTextStyle(id)
  }

  /** Removes an unused text style. Returns whether it was removed. */
  removeTextStyle(id: TextStyleId): boolean {
    return this.document.removeTextStyle(id)
  }

  /** Puts every selected text object on style `id` (individually undoable). */
  setSelectionTextStyle(id: TextStyleId): void {
    setSelectionTextStyle(this.document, this.selection, this.history, id)
  }

  /** Opens the style manager on one of its two tables, or closes it. */
  setStylesPanel(tab: StylesPanelTab | null): void {
    if (this.stylesPanel === tab) return
    this.stylesPanel = tab
    this.invalidateState()
    this.host.requestRender()
  }

  toggleStylesPanel(tab: StylesPanelTab): void {
    this.setStylesPanel(this.stylesPanel === tab ? null : tab)
  }

  /** Shows or hides the Blocks palette (AutoCAD's BLOCKSPALETTE). */
  setBlocksPanel(open: boolean): void {
    if (this.blocksPanel === open) return
    this.blocksPanel = open
    this.invalidateState()
    this.host.requestRender()
  }

  toggleBlocksPanel(): void {
    this.setBlocksPanel(!this.blocksPanel)
  }

  purgeBlocks(ids?: readonly BlockId[]): number {
    return purgeBlocks(this.document, this.history, ids)
  }

  /**
   * Starts INSERT with the block already chosen — the palette's "clicking and
   * placing them", which skips only the name prompt so the insertion point,
   * scale and rotation are answered exactly as they are when typed.
   */
  insertBlock(id: BlockId): void {
    if (!this.document.getBlock(id)) return
    this.startTool("insert")
    this.insert.beginInsert(id, this.toolContext)
    this.invalidateState()
    this.host.requestRender()
  }

  buildBlockPreview(id: BlockId, width: number, height: number): Scene | null {
    return buildBlockPreview(this.document, id, width, height)
  }

  /**
   * Sets the current dimension style's overall scale (AutoCAD's DIMSCALE) — how
   * much bigger than their plotted size dimensions are drawn, so annotation
   * stays readable on a drawing made at 1:1.
   */
  setDimScale(scale: number): void {
    this.updateDimStyle(this.document.getCurrentDimStyleId(), { scale })
  }

  /** Shows or hides real lineweight thickness (AutoCAD's LWDISPLAY). */
  toggleLineweightDisplay(): void {
    this.document.setLwDisplay(!this.document.getSettings().lwDisplay)
  }

  /** Serialises the current drawing to a downloadable JSON string. */
  serializeDrawing(): string {
    return serializeDrawing(this.document)
  }

  /** A sensible default download name, e.g. `drawing-2026-07-10.ecad.json`. */
  suggestedFileName(): string {
    return suggestedFileName()
  }

  /** Writes the drawing out through the file transport (AutoCAD's QSAVE). */
  saveDrawingToFile(): void {
    if (!this.files) {
      this.reportFileError("Saving to a file is not available here.")
      return
    }
    this.files.save(this.serializeDrawing(), this.suggestedFileName())
  }

  /**
   * Asks the transport for a drawing file and loads it (AutoCAD's OPEN).
   * Never rejects: a cancelled pick is a no-op and a bad file is reported at
   * the command prompt, which is where AutoCAD answers too.
   */
  async openDrawingFromFile(): Promise<void> {
    if (!this.files) {
      this.reportFileError("Opening a file is not available here.")
      return
    }
    try {
      const text = await this.files.open()
      if (text === null) return
      this.loadDrawing(text)
    } catch (error) {
      this.reportFileError(
        error instanceof Error ? error.message : "Could not open the file."
      )
    }
  }

  /**
   * Reports a file failure at the command prompt, revealing it when hidden —
   * hiding the prompt is only idle hiding, so feedback never vanishes into
   * nowhere (the same rule that makes typing bring it back).
   */
  private reportFileError(message: string): void {
    this.commandLine.write("error", message)
    this.commandLineVisible = true
    this.invalidateState()
  }

  /**
   * Puts a fragment of the drawing on the clipboard, for COPYCLIP / CUTCLIP /
   * COPYBASE. The system write is best effort: the session copy below is what
   * makes a paste work regardless of what the host allows.
   */
  private copyToClipboard(entities: readonly Entity[], basePoint: Vec2): void {
    this.clipboardFallback = copyToClipboard(
      this.clipboard,
      this.document,
      entities,
      basePoint
    )
  }

  /**
   * AutoCAD's PASTECLIP. Reading is asynchronous, so the fragment is fetched
   * first and the placement tool is started with it already in hand.
   */
  async pasteFromClipboard(): Promise<void> {
    const fragment = await readClipboardFragment(
      this.clipboard,
      this.clipboardFallback
    )
    if (!fragment) {
      // Not AutoCAD's wording (it pastes foreign text as an MTEXT object, which
      // does not exist here); phrased like ERASE's "Nothing selected.".
      this.commandLine.write("info", "Nothing on the clipboard.")
      this.commandLineVisible = true
      this.invalidateState()
      return
    }
    this.startTool("paste")
    this.paste.begin(fragment, this.toolContext)
    this.host.requestRender()
  }

  /** Ctrl+A: selects every object that can be selected. */
  selectAll(): void {
    selectAll(this.document, this.selection)
  }

  /**
   * Loads a drawing from file text, replacing the current document. Throws a
   * user-facing error when the text is not a valid MellowCAD drawing; the UI is
   * expected to surface it. On success the view frames the loaded geometry.
   */
  loadDrawing(text: string): void {
    const parsed = parseDrawingFile(text)
    this.selection.clear()
    this.resetTracking()
    applyDrawingFile(this.document, parsed)
    this.history.clear() // a loaded file is a fresh undo baseline
    this.zoomToFit()
    this.autosave.saveNow() // mirror the opened file into this device's store
  }

  /** Restores the last auto-saved drawing for this device, if any. */
  private restoreFromStore(): void {
    const text = this.autosave.restore()
    if (!text) return
    try {
      const parsed = parseDrawingFile(text)
      // Nothing worth restoring: no geometry and only the base layer.
      if (parsed.entities.length === 0 && parsed.layers.length <= 1) return
      applyDrawingFile(this.document, parsed)
      this.autosave.markRestored()
      this.pendingFit = true
      this.invalidateState()
    } catch {
      // Corrupt or foreign auto-save entry — start fresh.
    }
  }

  /**
   * Builds the neutral scene for the current frame. Called by the host when it
   * is ready to draw; the runtime never touches a rendering technology.
   */
  buildScene(): Scene {
    return buildScene({
      camera: this.viewport,
      entities: this.document.getEntities(),
      layers: this.document.getLayers(),
      dimStyles: this.document.getDimStyles(),
      blocks: this.document.blockLookup(),
      selectedIds: new Set(this.selection.toArray()),
      hiddenIds: new Set(this.activeTool.hiddenEntityIds?.() ?? []),
      gridVisible: this.gridVisible,
      gridSpacing: this.snapMode.displaySpacing(),
      ltScale: this.document.getSettings().ltScale,
      lwDisplay: this.document.getSettings().lwDisplay,
      snap: this.currentSnap,
      acquiredTrackingPoints: this.tracking.getAcquired(),
      tracking: this.lastTracking,
      parallelReferenceIds: this.parallelRefs.getAcquired(),
      toolOverlay: this.activeTool.buildOverlay?.(this.toolContext) ?? [],
      cursor: this.crosshairScreen ? { screen: this.crosshairScreen } : null,
      polar: this.buildPolarGuide(),
      fromBase: this.fromBase,
      cyclingBadge: this.cycling.hasStack() ? this.crosshairScreen : null,
      cyclingHighlight: this.cyclingHighlight(),
    })
  }

  /**
   * The object the Selection list box is currently offering, drawn amber like
   * every other prominent "which object?" pick. Only while the list is open:
   * hovering a stack merely shows the badge, as in AutoCAD, and the tool's own
   * rollover preview keeps answering which object a click would take.
   */
  private cyclingHighlight(): Entity | null {
    if (this.cyclingList === null) return null
    const id = this.cycling.getCurrentId()
    return (id !== null ? this.document.get(id) : undefined) ?? null
  }

  /**
   * The polar tracking vector to draw for the current cursor: an alignment line
   * through the tool's anchor along the engaged polar angle, plus an AutoCAD
   * "Polar: <dist> < <angle>°" readout. `null` unless polar tracking is on, the
   * active tool has a base point, and the cursor is locked to an angle. Object
   * snap and OTRACK take precedence, so it is hidden while either engages.
   */
  private buildPolarGuide(): PolarGuideInput | null {
    if (this.currentSnap || this.lastTracking) return null
    // Shift temporarily forces Ortho, which suppresses polar tracking.
    if (this.pointerShift) return null
    if (this.cursorWorld === null) return null
    const anchor = this.activeTool.getConstraintAnchor?.() ?? null
    if (anchor === null) return null

    const context = {
      anchor,
      world: this.cursorWorld,
      snapPoint: null,
      point: this.cursorWorld,
    }
    const ray = this.constraints.polarGuideRay(context)
    if (!ray) return null

    const point = this.constraints.apply(context)
    const settings = this.document.getSettings()
    const length = V.length(V.sub(point, anchor))
    let deg = (Math.atan2(ray.dir.y, ray.dir.x) * 180) / Math.PI
    if (deg < 0) deg += 360
    const label = `Polar: ${formatLength(length, settings)}${unitSuffix(
      settings.unit
    )} < ${formatAngle(deg, settings)}°`
    return { origin: anchor, point, label }
  }

  /**
   * Updates the view size (CSS pixels). On the first real layout the view is
   * initialised: either framing a restored drawing or centring the origin.
   */
  setViewSize(width: number, height: number): void {
    this.viewport.setSize(width, height)
    if (!this.initializedView && width > 1 && height > 1) {
      this.initializedView = true
      if (this.pendingFit && this.document.size > 0) {
        this.pendingFit = false
        this.zoomToFit()
      } else {
        this.viewport.reset()
      }
    }
    this.host.requestRender()
  }

  dispose(): void {
    this.disposed = true
    this.autosave.dispose()
    this.tracking.clear()
  }

  isDisposed(): boolean {
    return this.disposed
  }

  pointerDown(e: PointerEventData): void {
    // Shift+right-click during a point prompt opens the object-snap override
    // menu (AutoCAD's temporary single-snap override), instead of panning.
    if (
      e.button === 2 &&
      e.shiftKey &&
      (this.activeTool.wantsSnap?.() ?? true)
    ) {
      this.openSnapOverrideMenu(e.screen)
      return
    }

    // Middle or right button starts a pan.
    if (e.button === 1 || e.button === 2) {
      this.panning = true
      this.lastPanScreen = e.screen
      this.viewport.pushHistory()
      this.crosshairScreen = null // native grab cursor takes over while panning
      this.host.setCursor("grabbing")
      return
    }

    if (e.button !== 0) return
    this.pointerShift = e.shiftKey
    this.lastPointerScreen = e.screen
    this.updateSnap(e.screen)

    // With the Selection list box enabled, a click over a stack asks which
    // object was meant instead of picking the topmost one — AutoCAD's "click to
    // see a list of available objects, then click in the list to select". Not
    // when Shift+Space already singled one out: then the click takes it.
    // The press is only held here; the list opens on the release, or the press
    // is handed to the tool if this turns out to be a drag.
    if (this.cycling.showsList() && this.cycling.hasStack()) {
      if (this.cyclingList === null && !this.cycling.isResolved()) {
        this.cyclingPress = e
        return
      }
    }

    this.dispatchPointerDown(e)
  }

  private dispatchPointerDown(e: PointerEventData): void {
    // FROM consumes this pick as its base point; the tool will instead receive
    // the offset point entered next.
    if (this.fromPending) {
      this.beginFromOffset(this.buildPointerInput(e).point)
      this.snapping.clearOverride()
      this.invalidateState()
      this.host.requestRender()
      return
    }
    // Pointing the offset instead of typing it just places that point, so leave
    // FROM and let the click through unchanged.
    this.endFrom()

    this.activeTool.onPointerDown?.(this.buildPointerInput(e), this.toolContext)
    // A one-shot snap override applies to exactly this pick; consume it now that
    // the point has been placed so the next point uses the running snaps again.
    this.snapping.clearOverride()
    // Acquired references are consumed by the point just placed, so they don't
    // accumulate across the drawing — unless this click merely *began* an edit
    // (grabbing a grip) that will place its point later and wants the acquired
    // tracking points available during the drag.
    if (!(this.activeTool.retainsTrackingAfterPointerDown?.() ?? false)) {
      this.resetTracking()
    }
    this.host.requestRender()
  }

  pointerMove(e: PointerEventData): void {
    if (this.panning && this.lastPanScreen) {
      const delta = {
        x: e.screen.x - this.lastPanScreen.x,
        y: e.screen.y - this.lastPanScreen.y,
      }
      this.lastPanScreen = e.screen
      this.viewport.panByScreen(delta)
      return
    }

    this.pointerShift = e.shiftKey
    this.lastPointerScreen = e.screen
    this.releaseHeldPressOnDrag(e)
    this.updateSnap(e.screen)
    this.activeTool.onPointerMove?.(this.buildPointerInput(e), this.toolContext)
    this.host.requestRender()
  }

  /**
   * A press held back for the Selection list box turns out to be a drag (box
   * selection, a grip): hand it to the tool after all, so only a real click
   * ever opens the list.
   */
  private releaseHeldPressOnDrag(e: PointerEventData): void {
    const held = this.cyclingPress
    if (held === null) return
    const moved = Math.hypot(
      e.screen.x - held.screen.x,
      e.screen.y - held.screen.y
    )
    if (moved < DRAG_THRESHOLD_PX) return
    this.cyclingPress = null
    this.dispatchPointerDown(held)
  }

  pointerUp(e: PointerEventData): void {
    if (this.panning && (e.button === 1 || e.button === 2)) {
      this.panning = false
      this.lastPanScreen = null
      this.activeTool.onActivate?.(this.toolContext) // restore tool cursor
      return
    }

    if (e.button !== 0) return
    // The press was held back for the Selection list box: the release opens it
    // rather than picking. Opening on the release (not the press) matters — a
    // menu opened on the press would be dismissed by this very release.
    if (this.cyclingPress !== null) {
      this.cyclingList = this.cyclingPress
      this.cyclingPress = null
      this.invalidateState()
      this.host.requestRender()
      return
    }
    // While the list is open the click belongs to it, not to the drawing.
    if (this.cyclingList !== null) return
    this.dispatchPointerUp(e)
  }

  private dispatchPointerUp(e: PointerEventData): void {
    this.pointerShift = e.shiftKey
    this.updateSnap(e.screen)
    this.activeTool.onPointerUp?.(this.buildPointerInput(e), this.toolContext)
    this.host.requestRender()
  }

  /**
   * A double-click on the drawing. Only meaningful at the neutral prompt, where
   * AutoCAD's DBLCLKEDIT opens the object for editing: today that means a text
   * object opens for retyping. Returns whether the double-click was consumed.
   */
  doubleClick(e: PointerEventData): boolean {
    if (this.activeTool.id !== "select") return false
    const hit = this.pickEntity(this.viewport.screenToWorld(e.screen))
    if (hit?.type !== "text") return false
    this.setActiveTool(this.textEdit.id)
    this.textEdit.beginEdit(hit, this.toolContext)
    this.invalidateState()
    this.host.requestRender()
    return true
  }

  pointerLeave(): void {
    this.currentSnap = null
    this.cursorWorld = null
    this.crosshairScreen = null
    this.lastPointerScreen = null
    this.tracking.observeHover(null, 0)
    // Opening the Selection list box takes the pointer off the canvas (its
    // backdrop covers it): those candidates are exactly what the user is about
    // to choose from, so they must survive.
    if (this.cyclingList === null) this.cycling.clear()
    this.cyclingPress = null
    this.host.setCursor("default")
    this.invalidateState()
    this.host.requestRender()
  }

  wheel(e: WheelEventData): void {
    // One continuous scroll is one gesture, so ZOOM Previous steps back to
    // where the scrolling started rather than one notch at a time.
    const now = Date.now()
    if (now - this.lastWheelAt > WHEEL_BURST_MS) this.viewport.pushHistory()
    this.lastWheelAt = now

    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    this.viewport.zoomAt(e.screen, factor)
    this.updateSnap(e.screen)
    this.host.requestRender()
  }

  /**
   * Handles a key press. Returns `true` when the runtime consumed the key
   * (the host should call `preventDefault`).
   */
  keyDown(e: KeyEventData): boolean {
    // Escape first dismisses an open override menu (without cancelling the
    // command), so a single Escape closes the menu rather than ending drawing.
    if (e.key === "Escape" && this.snapOverrideMenu !== null) {
      this.closeSnapOverrideMenu()
      return true
    }

    // Escape likewise dismisses the Selection list box, leaving the command and
    // the current selection alone.
    if (e.key === "Escape" && this.cyclingList !== null) {
      this.closeCyclingList()
      return true
    }

    // Escape likewise cancels only the FROM modifier, not the running command.
    if (e.key === "Escape" && (this.fromPending || this.fromBase)) {
      this.endFrom()
      this.host.requestRender()
      return true
    }

    // F2 shows/hides the command prompt. AutoCAD uses Ctrl+9 for this, which is
    // accepted below too, but browsers reserve Ctrl+<digit> for tab switching,
    // so a function key is the shortcut we can actually promise.
    if (e.key === "F2") {
      this.toggleCommandLine()
      return true
    }

    // F3 toggles Object snap, matching AutoCAD's shortcut.
    if (e.key === "F3") {
      this.toggleSnap()
      this.host.requestRender()
      return true
    }

    // F7 toggles the grid, matching AutoCAD's shortcut.
    if (e.key === "F7") {
      this.toggleGrid()
      this.host.requestRender()
      return true
    }

    // F8 toggles Ortho, matching AutoCAD's shortcut.
    if (e.key === "F8") {
      this.toggleOrtho()
      this.host.requestRender()
      return true
    }

    // F9 toggles snap mode, matching AutoCAD's shortcut.
    if (e.key === "F9") {
      this.toggleSnapMode()
      return true
    }

    // F10 toggles Polar tracking, matching AutoCAD's shortcut.
    if (e.key === "F10") {
      this.togglePolar()
      this.host.requestRender()
      return true
    }

    // F11 toggles Object snap tracking, matching AutoCAD's shortcut.
    if (e.key === "F11") {
      this.toggleObjectSnapTracking()
      this.host.requestRender()
      return true
    }

    // Selection cycling. AutoCAD toggles it with Ctrl+W, which browsers reserve
    // for closing the tab and never deliver, so F4 is the shortcut we can
    // actually promise (F4 is free here; AutoCAD spends it on 3D object snap,
    // which does not exist in a 2D drafter). Ctrl+W is still handled for the
    // browsers that do pass it through.
    if (e.key === "F4" || (e.ctrlKey && (e.key === "w" || e.key === "W"))) {
      this.toggleSelectionCycling()
      return true
    }

    // Shift+Space walks through the objects under the pick box while the badge
    // shows. Handled before the command prompt, which would otherwise take the
    // space as an Enter.
    if (e.key === " " && e.shiftKey && this.cycleSelection()) return true

    if (e.ctrlKey && (e.key === "z" || e.key === "Z")) {
      if (e.shiftKey) this.redo()
      else this.undo()
      return true
    }
    if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
      this.redo()
      return true
    }
    if (e.ctrlKey && e.key === "9") {
      this.toggleCommandLine()
      return true
    }

    // The desktop-CAD file shortcuts (AutoCAD's QSAVE and OPEN). Routed here
    // rather than from the UI so returning true suppresses the browser's own
    // Save/Open dialogs and so file access obeys the same order as every other
    // shortcut.
    if (e.ctrlKey && !e.altKey && (e.key === "s" || e.key === "S")) {
      this.saveDrawingToFile()
      return true
    }
    if (e.ctrlKey && !e.altKey && (e.key === "o" || e.key === "O")) {
      void this.openDrawingFromFile()
      return true
    }

    // The clipboard shortcuts, all four verified in Autodesk's own guide:
    // Ctrl+C copy, Ctrl+Shift+C copy with base point, Ctrl+X cut, Ctrl+V paste,
    // Ctrl+A select all. Consuming them stops the browser acting on the page's
    // own (empty) selection instead. They are deliberately *not* forwarded from
    // a focused field — see `CadEngine.onKeyDown`.
    if (e.ctrlKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case "c":
          this.startTool(e.shiftKey ? "copybase" : "copyclip")
          return true
        case "x":
          this.startTool("cutclip")
          return true
        case "v":
          // Ctrl+Shift+V is PASTEBLOCK, which does not exist here; leave it to
          // the browser rather than quietly doing something else.
          if (e.shiftKey) break
          void this.pasteFromClipboard()
          return true
        case "a":
          this.selectAll()
          return true
      }
    }

    // A running command's keyword options take precedence over global tool
    // aliases — as in AutoCAD, where a command alias only starts a new command
    // at the neutral "Command:" prompt, while mid-command a matching letter
    // invokes the current prompt's keyword (e.g. R = Radius during FILLET, not
    // the Rotate alias). Checked before the alias loop so the two never fight.
    if (!e.ctrlKey && !e.altKey && e.key.length === 1) {
      const options = this.activeTool.commandOptions?.() ?? []
      if (
        options.some((o) => o.key.toLowerCase() === e.key.toLowerCase()) &&
        this.invokeToolOption(e.key)
      ) {
        return true
      }
    }

    // Everything else typed on the drawing surface goes to the command prompt,
    // exactly like AutoCAD: names and aliases are entered as text and run with
    // Enter/Space. This is what makes multi-character aliases possible (A is
    // Arc, AR is the rectangular array), which single-key shortcuts could not
    // express — so there are no immediate one-key tool shortcuts any more.
    if (!e.ctrlKey && !e.altKey) {
      const typed = this.commandLine.getBuffer()

      if (e.key.length === 1 && e.key !== " ") {
        this.commandLine.appendChar(e.key)
        this.invalidateState()
        return true
      }

      if (e.key === "Backspace" && typed !== "") {
        this.commandLine.backspace()
        this.invalidateState()
        return true
      }

      if (e.key === "Tab" && typed !== "") {
        this.completeCommandLine()
        return true
      }

      // History recall only at the neutral prompt, so arrow keys stay free for
      // whatever a running command may want to do with them.
      if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        this.activeTool.id === "select"
      ) {
        this.recallCommand(e.key === "ArrowUp" ? -1 : 1)
        return true
      }

      // Space is Enter at the command prompt (AutoCAD). With an empty prompt it
      // falls through, because tools use it to confirm a selection set.
      if ((e.key === "Enter" || e.key === " ") && typed.trim() !== "") {
        this.submitCommandLine()
        return true
      }

      // Repeating the last command is only offered when no command is running;
      // mid-command Enter keeps its meaning (accept/exit).
      if (
        e.key === "Enter" &&
        this.activeTool.id === "select" &&
        this.repeatLastCommand()
      ) {
        return true
      }

      // A first Escape clears a half-typed command; a second one cancels the
      // running command, so a typo never costs you the command in progress.
      if (e.key === "Escape" && typed !== "") {
        this.setCommandLineText("")
        return true
      }
    }

    // Escape also drops any acquired tracking references and the one-shot snap
    // override before the tool aborts.
    if (e.key === "Escape") {
      this.resetTracking()
      this.snapping.clearOverride()
    }

    // Enter is a command confirmation: a tool may consume it to advance its own
    // flow (e.g. MOVE confirming the selection set) and keep running. Only when
    // unhandled does it accept the default and drop to neutral, ending a
    // continuous command like OFFSET.
    if (e.key === "Enter" && this.activeTool.onEnter?.(this.toolContext)) {
      this.host.requestRender()
      return true
    }

    this.activeTool.onKeyDown?.(e, this.toolContext)
    // Escape and Enter both end the running command and drop back to neutral
    // select — Enter accepts the default "Exit" at a repeat prompt (AutoCAD's
    // OFFSET and similar continuous commands). Only reached when the canvas has
    // focus; while a dynamic-input box is focused, Enter commits its value.
    if (e.key === "Escape" || e.key === "Enter") this.returnToNeutralTool()
    this.host.requestRender()
    return false
  }

  private buildPointerInput(e: PointerEventData): PointerInput {
    const world = this.viewport.screenToWorld(e.screen)
    const snap = this.currentSnap
    const anchor = this.activeTool.getConstraintAnchor?.() ?? null
    const resolved = this.resolver.resolve(
      world,
      snap,
      anchor,
      e.shiftKey,
      this.activeTool.wantsSnap?.() ?? true
    )
    this.lastTracking = resolved.tracking
    return {
      screen: e.screen,
      world,
      snap,
      tracking: resolved.tracking,
      point: resolved.point,
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    }
  }

  /** Clears acquired references and the cached guide so nothing lingers. */
  private resetTracking(): void {
    this.tracking.clear()
    this.parallelRefs.clear()
    this.lastTracking = null
  }

  private updateSnap(screen: Vec2): void {
    this.cursorWorld = this.viewport.screenToWorld(screen)
    this.refreshCycling()

    // Object snaps and snap-tracking only run while the active tool is actually
    // acquiring a point (AutoCAD shows running osnaps only during a point
    // prompt). While merely selecting, no snap is computed, so its marker can
    // never overlap a selection grip.
    if (this.activeTool.wantsSnap?.() ?? true) {
      const construction =
        this.activeTool.getSnapGeometry?.(this.cursorWorld) ?? []
      // Perpendicular/Tangent snaps measure from the point the tool is drawing
      // from, so hand the current constraint anchor to the snap engine.
      const anchor = this.activeTool.getConstraintAnchor?.() ?? null
      // Parallel osnap: acquire the line under the cursor (by dwell) so only
      // lines the user points at are offered as parallels — AutoCAD's workflow.
      this.updateParallelAcquisition(anchor)
      this.currentSnap = this.snapping.resolve(
        screen,
        this.document,
        this.viewport,
        construction,
        anchor,
        this.parallelRefs.getAcquired()
      )

      // Feed object snap tracking: acquire by hover, drop stale references.
      const epsilon = this.viewport.screenToWorldDistance(
        this.snapping.pixelTolerance
      )
      this.tracking.observeHover(this.currentSnap, epsilon)
      const maxWorld = this.viewport.screenToWorldDistance(
        Math.hypot(this.viewport.width, this.viewport.height)
      )
      this.tracking.removeFarFrom(this.cursorWorld, maxWorld)
    } else {
      this.currentSnap = null
      this.tracking.observeHover(null, 0)
      this.parallelRefs.clear()
    }

    // A view tool drives the pointer itself (PAN's hand cursor): no crosshair,
    // and the cursor it set must survive this pass.
    if (!(this.activeTool.usesCrosshair?.() ?? true)) {
      this.crosshairScreen = null
      this.invalidateState()
      return
    }

    // Park the magnetic crosshair on real geometry so it visibly clings to it,
    // and hide the OS cursor in its favour. It attracts to an object snap
    // (osnap wins over everything) or to an engaged tracking alignment — but
    // drawing constraints (Ortho/Polar) must NOT move the crosshair: they only
    // bend the rubber-band toward the point the tool will place. Keeping the
    // crosshair on the physical mouse otherwise is what AutoCAD does, so the
    // user always sees where the pointer really is — e.g. while reaching across
    // the Ortho axis for a tracking reference. While merely selecting (no point
    // prompt) it also follows the raw cursor.
    if (this.activeTool.wantsSnap?.() ?? true) {
      if (this.currentSnap) {
        this.crosshairScreen = this.viewport.worldToScreen(
          this.currentSnap.point
        )
      } else {
        const anchor = this.activeTool.getConstraintAnchor?.() ?? null
        const resolved = this.resolver.resolve(
          this.cursorWorld,
          this.currentSnap,
          anchor,
          this.pointerShift
        )
        if (resolved.tracking) {
          this.crosshairScreen = this.viewport.worldToScreen(
            resolved.tracking.point
          )
        } else if (this.snapMode.isRectangular()) {
          // Snap mode moves the cursor itself onto the lattice, the way
          // AutoCAD's crosshair visibly jumps from increment to increment.
          this.crosshairScreen = this.viewport.worldToScreen(
            this.snapMode.snapPoint(this.cursorWorld)
          )
        } else {
          this.crosshairScreen = screen
        }
      }
    } else {
      // No point prompt (e.g. merely selecting): the crosshair follows the raw
      // cursor, but a tool may still magnetically attract it onto its own
      // handles — the SelectTool clings to the grips of the selected objects,
      // exactly like AutoCAD, so they are easy to grab.
      const magnetic =
        this.activeTool.magneticCursor?.(screen, this.toolContext) ?? null
      this.crosshairScreen = magnetic ?? screen
    }
    this.host.setCursor("none")

    this.invalidateState()
  }

  /**
   * Acquires the line under the cursor as a Parallel reference (by dwell) so
   * only lines the user deliberately points at are offered as parallels — the
   * AutoCAD workflow. Runs only while Parallel is active (running or forced via
   * the override) and a base point exists; otherwise the acquisitions clear.
   */
  private updateParallelAcquisition(anchor: Vec2 | null): void {
    const cursor = this.cursorWorld
    const override = this.snapping.getOverride()
    const active =
      anchor !== null &&
      cursor !== null &&
      (override === SnapType.Parallel ||
        (override === null && this.snapping.isEnabled(SnapType.Parallel)))
    if (!active || cursor === null) {
      this.parallelRefs.clear()
      return
    }
    const tolerance = this.viewport.screenToWorldDistance(
      this.snapping.pixelTolerance
    )
    this.parallelRefs.observeHover(this.hoveredLineId(cursor, tolerance))
  }

  /** The nearest visible line within `worldTolerance` of the cursor, or null. */
  private hoveredLineId(cursor: Vec2, worldTolerance: number): EntityId | null {
    let bestId: EntityId | null = null
    let bestDist = worldTolerance
    for (const entity of this.document.getEntities()) {
      if (entity.type !== "line") continue
      if (!this.document.isEntityVisible(entity)) continue
      const d = closestPointOnSegment(entity.start, entity.end, cursor).distance
      if (d <= bestDist) {
        bestDist = d
        bestId = entity.id
      }
    }
    return bestId
  }

  private viewportCenterScreen(): Vec2 {
    return { x: this.viewport.width / 2, y: this.viewport.height / 2 }
  }

  private invalidateState(): void {
    this.stateSnapshot = this.buildState()
    this.emit()
  }

  private buildState(): EngineState {
    const snapEnabled = {} as Record<SnapType, boolean>
    for (const type of Object.values(SnapType)) {
      snapEnabled[type] = this.snapping.isEnabled(type)
    }
    const settings = this.document.getSettings()
    const selectedEntities = this.selection
      .toArray()
      .map((id) => this.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    return {
      activeToolId: this.activeTool.id,
      tools: this.listTools().map((t) => ({
        id: t.id,
        label: t.label,
        // The typed alias is the real shortcut now, so that is what the UI
        // advertises ("L", "AR", "TR"), falling back to the tool's own hint.
        shortcut: toolCommandAlias(t.id) ?? t.shortcut,
      })),
      entityCount: this.document.size,
      selectionCount: this.selection.size,
      scale: this.viewport.scale,
      cursorWorld: this.cursorWorld,
      snap: this.currentSnap
        ? { type: this.currentSnap.type, point: this.currentSnap.point }
        : null,
      snapActive: this.snapping.isActive(),
      snapEnabled,
      snapOverride: this.snapping.getOverride(),
      snapOverrideMenu: this.snapOverrideMenu,
      orthoActive: this.constraints.isEnabled(ConstraintType.Ortho),
      polarActive: this.constraints.isEnabled(ConstraintType.Polar),
      polarAngleStep: this.constraints.getPolarAngleStep(),
      objectSnapTrackingActive: this.tracking.isActive(),
      acquiredTrackingPoints: this.tracking.getAcquired().length,
      selectionCycling: {
        active: this.cycling.isEnabled(),
        showList: this.cycling.showsList(),
        candidates: buildSelectionCandidates(this.cycling.getCandidates()),
        currentId: this.cycling.getCurrentId(),
        listAt: this.cyclingList?.screen ?? null,
      },
      gridVisible: this.gridVisible,
      snapModeActive: this.snapMode.isActive(),
      snapModeType: this.snapMode.getType(),
      snapSpacing: this.snapMode.getSpacing(),
      snapPolarDistance: this.snapMode.getPolarDistance(),
      dynamicInput: buildDynamicInputUi(this.dynamicInput, settings),
      documentUnit: settings.unit,
      documentPrecision: settings.precision,
      ltScale: settings.ltScale,
      dimScale:
        this.document.getDimStyle(this.document.getCurrentDimStyleId())
          ?.scale ?? 1,
      lwDisplay: settings.lwDisplay,
      layers: buildLayerInfos(
        this.document.getLayers(),
        this.document.getEntities()
      ),
      currentLayerId: this.document.getCurrentLayerId(),
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
      saveState: this.autosave.getState(),
      lastSavedAt: this.autosave.getLastSavedAt(),
      selectionInfo: buildSelectionInfo(selectedEntities, settings),
      selectionLayerId: commonSelectionLayer(selectedEntities),
      selectionColor: commonSelectionColor(selectedEntities),
      selectionLinetype: commonSelectionLinetype(selectedEntities),
      selectionLineweight: commonSelectionLineweight(selectedEntities),
      textStyles: buildTextStyleInfos(
        this.document.getTextStyles(),
        this.document.getEntities()
      ),
      currentTextStyleId: this.document.getCurrentTextStyleId(),
      selectionTextStyleId: commonStyleId(selectedEntities, "text"),
      dimStyles: buildDimStyleInfos(
        this.document.getDimStyles(),
        this.document.getEntities()
      ),
      currentDimStyleId: this.document.getCurrentDimStyleId(),
      selectionDimStyleId: commonStyleId(selectedEntities, "dimension"),
      stylesPanel: this.stylesPanel,
      blocks: buildBlockInfos(
        this.document.getBlocks(),
        this.document.getEntities()
      ),
      blocksPanel: this.blocksPanel,
      commandOptions: this.activeTool.commandOptions?.() ?? [],
      commandLine: {
        visible: this.commandLineVisible,
        prompt: commandPrompt(this.activeTool),
        buffer: this.commandLine.getBuffer(),
        lines: this.commandLine.getLines(),
        suggestions: matchCommands(
          this.commandList,
          this.commandLine.getBuffer()
        ),
      },
    }
  }
}
