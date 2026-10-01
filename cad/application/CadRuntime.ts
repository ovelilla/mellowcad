import { Observable } from "../shared/Observable"
import { Vec2, V } from "../geometry/Vec2"
import { Vec3, planar, withZ, zOf } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { CadDocument } from "../domain/Document"
import {
  BlockId,
  Bounds,
  Entity,
  EntityId,
  EntityProperty,
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
import { Ucs, isWorldUcs, worldPointToUcs } from "../domain/ucs"
import {
  formatAngle,
  formatLength,
  LengthUnit,
  unitSuffix,
  ViewCubeSetting,
} from "../domain/units"
import {
  DrawingFileError,
  parseDrawingFile,
} from "../serialization/drawingFile"
import { isBlankDrawing } from "../serialization/drawingSummary"
import { Scene } from "../scene/types"
import { Viewport, entitiesViewBounds } from "./Viewport"
import { UcsFrame } from "./ucsFrame"
import { planDistanceToEntity, screenDistanceToEntity } from "./viewPick"
import { orbitTarget, orbitView } from "./orbit"
import { Selection } from "./Selection"
import { SnapMode, SnapModeType } from "./SnapMode"
import { SelectionCycling } from "./SelectionCycling"
import { SnapEngine } from "./snapping/SnapEngine"
import { ConstructionGeometry, SnapResult, SnapType } from "./snapping/types"
import { ParallelReferenceEngine } from "./snapping/ParallelReference"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintType } from "./constraints/types"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { TrackingResult } from "./tracking/types"
import {
  DynamicInputController,
  DynamicInputSession,
  isContentField,
} from "./input/DynamicInput"
import { parseCoordinate } from "./input/coordinateInput"
import {
  CommandDefinition,
  CommandInfo,
  CommandLineController,
  TOOL_COMMANDS,
  matchCommands,
  shortestName,
} from "./CommandLine"
import { keywordForKey, resolveKeyword } from "../i18n/keywords"
import type { EngineLocale } from "../locales/types"
import { EngineText, engineText, promptString } from "./EngineText"
import { CommandHistory } from "./commands/Command"
import {
  ClearDocumentCommand,
  RemoveEntitiesCommand,
} from "./commands/entityCommands"
import { PointerInput, Tool, ToolContext } from "./tools/Tool"
import { InsertTool } from "./tools/InsertTool"
import { TextEditTool } from "./tools/TextEditTool"
import { AttEditTool } from "./tools/AttEditTool"
import { PasteTool } from "./tools/PasteTool"
import { headingInUcs } from "./tools/ucsHeading"
import { ViewPreset, currentViewPreset } from "./tools/viewPresets"
import {
  CompassLetter,
  ViewCubePart,
  ViewCubeRoll,
  ViewCubeSide,
  ViewCubeUi,
} from "./viewCube"
import {
  CubeContext,
  CubeDrag,
  endCubeDrag,
  goHome,
  homeFromView,
  moveCubeDrag,
  pickCompass,
  pickPart,
  rollCube,
  startCubeDrag,
  turnToAdjacent,
  viewCubeUi,
} from "./runtimeViewCube"
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
import {
  commandPrompt,
  offerOptions,
  registerCommands,
  toolCommand,
} from "./runtimeCommands"
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

export interface CadRuntimeOptions {
  /**
   * The language the engine speaks; English, built in, when left out. Passed
   * explicitly rather than read from anywhere global, so one process can run
   * engines in several languages side by side (the landing's build does).
   */
  readonly locale?: EngineLocale
}

/** Wheel events closer together than this belong to the same zoom gesture. */
const WHEEL_BURST_MS = 400

/** Movement past this (screen px) makes a press a drag rather than a click. */
const DRAG_THRESHOLD_PX = 4

/** What a tool's context gives in the UCS plane's frame or in the WCS. */
type FramedPart =
  | "document"
  | "ucs"
  | "elevation"
  | "viewport"
  | "execute"
  | "pick"
  | "copyToClipboard"

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
  /** What a tool working in the UCS plane's frame sees; see {@link toolContext}. */
  private readonly frameContext: ToolContext
  /** What a tool working in the WCS sees. */
  private readonly worldContext: ToolContext
  private frameCache: UcsFrame | null = null

  private readonly tools = new Map<string, Tool>()
  private activeTool: Tool

  /** Every command by its global name, in registration order. */
  private readonly commands = new Map<string, CommandDefinition>()
  /** The commands as the command language lists them (drives autocomplete). */
  private commandInfos: CommandInfo[] = []

  private language: EngineText

  private currentSnap: SnapResult | null = null
  private lastTracking: TrackingResult | null = null
  private cursorWorld: Vec3 | null = null

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
  /** Whether this host shows the UCS icon at all; UCSICON decides where. */
  private ucsIconShown = true
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
  /** A transparent orbit under way (Shift + the wheel button held). */
  private orbiting: { last: Vec2; target: Vec3 } | null = null
  /** A drag on the ViewCube or its compass ring under way. */
  private cubeDrag: CubeDrag | null = null
  /** The ViewCube as last projected, kept until the camera's axes or the UCS change. */
  private viewCubeCache: {
    readonly direction: Vec3
    readonly right: Vec3
    readonly settings: ViewCubeSetting
    readonly ucs: Ucs
    readonly ui: ViewCubeUi
  } | null = null
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
  private fromBase: Vec3 | null = null
  private fromParkedSession: DynamicInputSession | null = null

  private stateSnapshot: EngineState

  // Held as a field so a double-click can hand it the object directly.
  private readonly textEdit = new TextEditTool()
  // Held as a field so a double-click can hand it the block reference.
  private readonly attEdit = new AttEditTool()
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
    clipboard: Clipboard | null = null,
    options: CadRuntimeOptions = {}
  ) {
    super()
    this.language = engineText(options.locale)
    this.host = host
    this.files = files
    this.clipboard = clipboard
    this.resolver = new PointResolver(
      () => this.frame.viewport,
      this.snapping,
      this.constraints,
      this.tracking,
      this.snapMode,
      () => this.frame.ucs,
      () => this.document.getSettings().elevation
    )
    this.autosave = new AutosaveService(store, () => this.serializeDrawing())

    // The single surface tools may touch: read-only document + command bus.
    const doc = this.document
    const frame = () => this.frame
    const shared: Omit<ToolContext, FramedPart> = {
      selection: this.selection,
      dynamicInput: this.dynamicInput,
      blocks: this.document.blockLookup(),
      undo: () => this.history.undo(),
      pickTolerance: () =>
        this.viewport.screenToWorldDistance(this.snapping.pixelTolerance),
      requestRender: () => this.host.requestRender(),
      setCursor: (cursor) => this.host.setCursor(cursor),
      report: (text, kind = "info") => this.commandLine.write(kind, text),
      setViewCubeVisible: (visible) => this.setViewCubeVisible(visible),
      text: {
        message: (id, values) => this.text.message(id, values),
        feedback: (id, values) => this.text.feedback(id, values),
        hatchPatternListing: (id) => this.text.hatchPatternListing(id),
        resolveKeyword: (input, ids) =>
          resolveKeyword(
            input,
            this.text.keywords(toolCommand(this.activeTool), ids)
          ),
        keywordList: (ids) =>
          this.text.keywordList(
            ids.map((id) => this.text.keyword(toolCommand(this.activeTool), id))
          ),
        abbreviation: (id) =>
          this.text.abbreviation(toolCommand(this.activeTool), id),
      },
      endCommand: () => {
        this.resetTracking()
        this.returnToNeutralTool()
      },
    }
    this.frameContext = {
      ...shared,
      get document() {
        return frame().document
      },
      get ucs() {
        return frame().ucs
      },
      get elevation() {
        return doc.getSettings().elevation
      },
      get viewport() {
        return frame().viewport
      },
      execute: (command) =>
        this.history.execute(
          command.mapEntities((entity) => this.frame.entityToWorld(entity))
        ),
      pick: (world, tolerance) => this.pickEntity(world, tolerance),
      copyToClipboard: (entities, basePoint) =>
        this.copyToClipboard(
          entities.map((entity) => this.frame.entityToWorld(entity)),
          this.frame.pointToWorld(withZ(basePoint, zOf(basePoint)))
        ),
    }
    this.worldContext = {
      ...shared,
      document: this.document,
      get ucs() {
        return doc.getSettings().ucs
      },
      get elevation() {
        return doc.getSettings().elevation
      },
      viewport: this.viewport,
      execute: (command) => this.history.execute(command),
      pick: (world, tolerance) => {
        const hit = this.pickEntity(
          this.frame.pointToFrame(withZ(world, zOf(world))),
          tolerance
        )
        return hit && this.frame.entityToWorld(hit)
      },
      copyToClipboard: (entities, basePoint) =>
        this.copyToClipboard(entities, basePoint),
    }

    for (const tool of defaultTools(
      this.textEdit,
      this.insert,
      this.paste,
      this.attEdit
    )) {
      this.registerTool(tool)
    }
    this.activeTool = this.tools.get("select")!

    this.registerCommands()
    this.refreshCommandInfos()

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
    // Acquired tracking points are in the frame of the UCS they were taken in.
    let ucs = this.document.getSettings().ucs
    this.document.subscribe(() => {
      const next = this.document.getSettings().ucs
      if (next === ucs) return
      ucs = next
      this.resetTracking()
    })
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

  /**
   * The frame the pointer pipeline and the tools work in: the UCS plane's,
   * remade whenever the UCS changes.
   */
  private get frame(): UcsFrame {
    const ucs = this.document.getSettings().ucs
    let frame = this.frameCache
    if (!frame || frame.source !== ucs) {
      frame = new UcsFrame(ucs, this.viewport, this.document)
      this.frameCache = frame
    }
    return frame
  }

  /** The context the active tool works in: the UCS plane's frame, or the WCS. */
  private get toolContext(): ToolContext {
    return this.activeTool.inWorld ? this.worldContext : this.frameContext
  }

  /** The language the engine speaks: its catalog, laid over English. */
  get text(): EngineText {
    return this.language
  }

  /**
   * Switches the language. The prompt, the keywords, the palettes and what is
   * drawn on the canvas follow at once; what the command line already shows
   * stays as it was written, as a scrollback does.
   */
  setLocale(locale: EngineLocale): void {
    this.language = engineText(locale)
    this.refreshCommandInfos()
    this.invalidateState()
    this.host.requestRender()
  }

  /** Every command the prompt accepts, in registration order. */
  listCommands(): CommandInfo[] {
    return [...this.commandInfos]
  }

  private refreshCommandInfos(): void {
    this.commandInfos = [...this.commands.values()].map((command) => {
      const [name, ...aliases] = this.text.commandNames(command.id)
      return {
        id: command.id,
        name,
        aliases,
        description:
          command.tool !== undefined
            ? this.text.tool(command.tool)
            : (this.text.description(command.id) ?? ""),
      }
    })
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
    this.commands.set(definition.id, definition)
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
   * is how AutoCAD users chain repeated operations with Enter/Space. While a
   * command runs, what was typed answers its prompt first: a keyword on offer
   * — its abbreviation, its word, or `_` and the global one — is taken as such
   * and only anything else is read as a command name.
   */
  submitCommandLine(): void {
    const text = this.commandLine.getBuffer().trim()
    this.commandLine.setBuffer("")
    if (text === "") {
      this.repeatLastCommand()
      return
    }
    if (this.invokeToolOption(text)) return
    this.runCommand(text)
  }

  /**
   * Runs a command by name or alias in the command language, or by `_` and
   * its global name in any language (case-insensitive), reporting whether it
   * existed. Unknown names are echoed to the prompt rather than thrown, like a
   * real command line.
   */
  runCommand(text: string): boolean {
    const typed = text.trim().toUpperCase()
    if (typed === "") return false
    const id = this.text.resolveCommand(typed)
    const command = id === null ? undefined : this.commands.get(id)
    if (!command) {
      this.commandLine.write(
        "error",
        this.text.message("unknownCommand", { name: typed })
      )
      this.invalidateState()
      return false
    }
    const [name] = this.text.commandNames(command.id)
    this.commandLine.write("command", name)
    this.commandLine.pushHistory(name)
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

  /**
   * A preset view chosen from the view menu, run the way AutoCAD's own menus
   * run it (`_-VIEW _SWISO`): echoed at the prompt, fitting the extents, and an
   * orthographic one aligning the UCS (UCSORTHO).
   */
  applyViewPreset(preset: ViewPreset): boolean {
    return this.runCommand("_-VIEW") && this.invokeToolOption(`_${preset}`)
  }

  /** A click on a face, an edge or a corner of the ViewCube. */
  viewCubePick(part: ViewCubePart): void {
    pickPart(this.cubeContext, part)
  }

  /** A roll arrow of the ViewCube, offered in a face view. */
  viewCubeRoll(turn: ViewCubeRoll): void {
    rollCube(this.cubeContext, turn)
  }

  /** A triangle of the ViewCube: the face next to the one viewed. */
  viewCubeAdjacent(side: ViewCubeSide): void {
    turnToAdjacent(this.cubeContext, side)
  }

  /** The ViewCube's Home button (and its menu's Home). */
  viewCubeHome(): void {
    goHome(this.cubeContext)
  }

  /** The ViewCube menu's Set Current View as Home. */
  setHomeFromCurrentView(): void {
    homeFromView(this.cubeContext)
  }

  /** A letter of the ViewCube's compass. */
  compassPick(letter: CompassLetter): void {
    pickCompass(this.cubeContext, letter)
  }

  /**
   * A drag on the ViewCube (an orbit, snapping to the nearest of its views
   * when let go) or, with `ring`, on its compass (the azimuth alone). One
   * step of ZOOM Previous for the whole drag.
   */
  viewCubeDrag(
    phase: "start" | "move" | "end",
    screen: Vec2,
    ring = false
  ): void {
    if (phase === "start") {
      this.cubeDrag = startCubeDrag(this.cubeContext, screen, ring)
      return
    }
    if (!this.cubeDrag) return
    this.cubeDrag = moveCubeDrag(this.cubeContext, this.cubeDrag, screen)
    if (phase === "end") {
      endCubeDrag(this.cubeContext, this.cubeDrag)
      this.cubeDrag = null
    }
  }

  /** NAVVCUBE: shows or hides the ViewCube; saved in the drawing, never undone. */
  setViewCubeVisible(visible: boolean): void {
    const viewCube = this.document.getSettings().viewCube
    this.document.setViewCube({ ...viewCube, visible })
  }

  /**
   * The ViewCube's UCS menu: the WCS (`null`) or a saved UCS by name, run as
   * UCS World or UCS NAmed Restore, echoed and undone like them.
   */
  restoreUcs(name: string | null): boolean {
    if (!this.runCommand("_UCS")) return false
    if (name === null) return this.invokeToolOption("_World")
    if (!this.invokeToolOption("_NAmed")) return false
    if (!this.invokeToolOption("_Restore")) return false
    this.dynamicInput.setText("name", name)
    this.commitDynamicInput()
    return true
  }

  private get cubeContext(): CubeContext {
    return {
      viewport: this.viewport,
      document: this.document,
      selection: this.selection,
    }
  }

  /** The ViewCube's projection, rebuilt only when the camera's axes or the UCS change. */
  private viewCubeState(): ViewCubeUi {
    const { direction, right } = this.viewport
    const { ucs, viewCube } = this.document.getSettings()
    const cached = this.viewCubeCache
    if (
      cached &&
      cached.direction === direction &&
      cached.right === right &&
      cached.ucs === ucs &&
      cached.settings === viewCube
    ) {
      return cached.ui
    }
    const ui = viewCubeUi(this.cubeContext)
    this.viewCubeCache = { direction, right, ucs, settings: viewCube, ui }
    return ui
  }

  /** Completes the prompt to the best autocomplete match (Tab). */
  completeCommandLine(): void {
    const [best] = matchCommands(
      this.commandInfos,
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
    const bounds = entitiesViewBounds(
      this.document.getEntities(),
      this.viewport,
      this.document.blockLookup()
    )
    if (!bounds) {
      this.viewport.reset()
      return
    }
    this.viewport.zoomToViewBounds(bounds.min, bounds.max, padding)
  }

  /** Frames a world rectangle: ZOOM Window, given its corners. */
  zoomToBounds(bounds: Bounds, padding = 0): void {
    this.viewport.pushHistory()
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
    this.commandLine.write("info", this.text.message("fromBase"))
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
    return true
  }

  private beginFromOffset(base: Vec3): void {
    this.fromPending = false
    this.fromBase = base
    this.fromParkedSession = this.dynamicInput.getSession()
    this.dynamicInput.open({
      fields: [{ id: "offset", kind: "coordinate" }],
      commit: () => {},
      commitRaw: () => this.commitFromOffset(),
    })
    if (this.lastPointerScreen) {
      this.dynamicInput.setPosition(this.lastPointerScreen)
    }
    this.commandLine.write("info", this.text.message("fromOffset"))
  }

  private commitFromOffset(): boolean {
    const base = this.fromBase
    if (!base) return false
    const point = parseCoordinate(this.dynamicInput.getText("offset").trim(), {
      lastPoint: base,
      relativeByDefault: true,
      ucs: this.frame.ucs,
      elevation: this.document.getSettings().elevation,
    })
    if (!point) return false
    this.endFrom()
    this.placePoint(point)
    return true
  }

  /** Feeds a point to the active tool as if it had been picked there. */
  private placePoint(point: Vec3): void {
    this.activeTool.onPointerDown?.(
      this.forTool({
        screen: this.frame.viewport.worldToScreen(point),
        world: point,
        snap: null,
        tracking: null,
        point,
        button: 0,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
      }),
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
   * Hides the UCS icon for a host that draws its own chrome (the landing's
   * sketch) or none (a headless recording), leaving the drawing's UCSICON as is.
   */
  setUcsIconShown(shown: boolean): void {
    this.ucsIconShown = shown
    this.host.requestRender()
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
   * The object a pick at `world`, a point of the frame, resolves to, as the
   * frame reads it. The topmost under the pick box unless the user cycled to
   * another of the objects it covers.
   */
  private pickEntity(world: Vec2, tolerance?: number): Entity | null {
    const worldTolerance =
      tolerance ??
      this.viewport.screenToWorldDistance(this.snapping.pixelTolerance)
    const hits = this.pickAllAt(world, worldTolerance)
    return this.cycling.isEnabled()
      ? this.cycling.choose(hits)
      : (hits[0] ?? null)
  }

  /**
   * Every object under the pick box at `world` (a point of the work plane, in
   * the frame), topmost first, as the frame reads it. Off the plan the box is
   * on the screen, where the objects are drawn at their own heights.
   */
  private pickAllAt(world: Vec2 | Vec3, worldTolerance: number): Entity[] {
    const { document, viewport } = this.frame
    const blocks = document.blockLookup()
    if (viewport.isPlan) {
      return document.pickAllBy(
        (entity) => planDistanceToEntity(viewport, entity, world, blocks),
        worldTolerance
      )
    }
    const screen = viewport.worldToScreen(
      "z" in world ? world : withZ(world, this.workPlaneZ())
    )
    return document.pickAllBy(
      (entity) => screenDistanceToEntity(viewport, entity, screen, blocks),
      viewport.worldToScreenDistance(worldTolerance)
    )
  }

  /**
   * The Z of the plane a point without one lies on, in the frame: ELEVATION
   * above the UCS's XY plane.
   */
  private workPlaneZ(): number {
    return this.frame.ucs.origin.z + this.document.getSettings().elevation
  }

  /**
   * The point of the work plane under a screen point, in the frame. Off the
   * plan it is where the line of sight meets the plane; seen edge-on there is
   * none, and the point of the plane facing the viewer stands in, for picking.
   */
  private screenToWork(screen: Vec2): Vec3 {
    const z = this.workPlaneZ()
    const { viewport } = this.frame
    const onPlane = viewport.screenToPlane(screen, z)
    if (onPlane) return withZ(onPlane, z)
    return viewport.screenToFacing(screen)
  }

  /** True when the view sees the work plane edge-on, so a point cannot be pointed on it. */
  private workPlaneEdgeOn(): boolean {
    return (
      this.frame.viewport.screenToPlane(
        this.viewportCenterScreen(),
        this.workPlaneZ()
      ) === null
    )
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
    this.cycling.observe(this.pickAllAt(this.cursorWorld, tolerance))
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
    const layer = createLayer(
      name ??
        nextLayerName(this.document, (n) => this.text.defaultLayerName(n)),
      color
    )
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
    // A keyword typed into a value box answers the prompt, exactly as it does
    // at the command line. A free-text box holds content, never a keyword.
    const field = session.fields.find(
      (f) => f.id === this.dynamicInput.getActiveFieldId()
    )
    if (field && !isContentField(field.kind)) {
      const keyword = resolveKeyword(
        this.dynamicInput.getText(field.id),
        this.offeredKeywords()
      )
      if (keyword !== null) {
        this.dynamicInput.setText(field.id, "")
        this.invokeOption(keyword)
        return
      }
    }
    const values = this.dynamicInput.resolveValues()
    if (values) {
      session.commit(values, this.toolContext)
    } else if (!session.commitRaw?.(this.toolContext)) {
      // The numeric fields don't resolve and the session has no raw handler (or
      // it rejected the text, e.g. an incomplete coordinate): nothing to do.
      return
    }
    // A tool that opened its next question in the commit may have filled it
    // (a default in the box), so only the session just answered is cleared.
    if (this.dynamicInput.getSession() === session) {
      this.dynamicInput.clearTexts()
    }
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
   * AutoCAD's `[Close/Undo]` prompt — named as a user types it: its
   * abbreviation or its word in the command language, or `_` and the global
   * one. The tool performs the action and reports whether the command continues
   * or has ended; on end we drop back to the neutral Select tool, like any
   * other completion. Returns whether it named an option, so callers can decide
   * whether to swallow it.
   */
  invokeToolOption(input: string): boolean {
    const id = resolveKeyword(input, this.offeredKeywords())
    return id !== null && this.invokeOption(id)
  }

  /** The keywords the active tool offers, in both of their languages. */
  private offeredKeywords() {
    const options = this.activeTool.commandOptions?.() ?? []
    return this.text.keywords(
      toolCommand(this.activeTool),
      options.map((option) => option.id)
    )
  }

  private invokeOption(id: string): boolean {
    const outcome =
      this.activeTool.invokeOption?.(id, this.toolContext) ?? "unhandled"
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
    return createDimStyle(this.document, name, basedOn, makeCurrent, (base) =>
      this.text.copyName(base)
    )
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
    return createTextStyle(this.document, name, basedOn, makeCurrent, (base) =>
      this.text.copyName(base)
    )
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
    return suggestedFileName((date) => this.text.fileName(date))
  }

  /** Writes the drawing out through the file transport (AutoCAD's QSAVE). */
  saveDrawingToFile(): void {
    if (!this.files) {
      this.reportFileError(this.text.message("saveUnavailable"))
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
      this.reportFileError(this.text.message("openUnavailable"))
      return
    }
    try {
      const text = await this.files.open()
      if (text === null) return
      this.loadDrawing(text)
    } catch (error) {
      // A file this build cannot read is worded by the catalog; any other
      // failure is the host's own report, passed on as it came.
      this.reportFileError(
        error instanceof DrawingFileError
          ? this.text.fileError(error.code)
          : error instanceof Error
            ? error.message
            : this.text.message("openFailed")
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
  private copyToClipboard(
    entities: readonly Entity[],
    basePoint: Vec2 | Vec3
  ): void {
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
      // this paste does not do yet); phrased like ERASE's "Nothing selected.".
      this.commandLine.write("info", this.text.message("clipboardEmpty"))
      this.commandLineVisible = true
      this.invalidateState()
      return
    }
    this.startTool("paste")
    const { frame } = this
    this.paste.begin(
      {
        basePoint: frame.pointToFrame(fragment.basePoint),
        drawing: {
          ...fragment.drawing,
          entities: fragment.drawing.entities.map((entity) =>
            frame.entityToFrame(entity)
          ),
        },
      },
      this.toolContext
    )
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
      const summary = {
        objects: parsed.entities.length,
        layers: parsed.layers.length,
      }
      if (isBlankDrawing(summary)) return
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
    const settings = this.document.getSettings()
    const { frame } = this
    return buildScene({
      camera: this.viewport,
      lang: this.text.commandTag,
      aidCamera: frame.viewport,
      entities: this.document.getEntities(),
      layers: this.document.getLayers(),
      dimStyles: this.document.getDimStyles(),
      blocks: this.document.blockLookup(),
      selectedIds: new Set(this.selection.toArray()),
      hiddenIds: new Set(this.activeTool.hiddenEntityIds?.() ?? []),
      gridVisible: this.gridVisible,
      gridSpacing: this.snapMode.displaySpacing(),
      ucs: frame.ucs,
      ucsIcon:
        this.ucsIconShown && settings.ucsIcon.visible
          ? {
              atOrigin: settings.ucsIcon.atOrigin,
              world: isWorldUcs(settings.ucs),
              xLabel: this.text.feedback("ucsIconX"),
              yLabel: this.text.feedback("ucsIconY"),
            }
          : null,
      ltScale: settings.ltScale,
      lwDisplay: settings.lwDisplay,
      attributeDisplay: settings.attributeDisplay,
      snap: this.currentSnap,
      snapLabel: this.currentSnap
        ? this.text.snapFeedback(this.currentSnap.type)
        : "",
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
    const anchor = this.toolAnchor()
    if (anchor === null) return null

    const settings = this.document.getSettings()
    const { ucs, viewport: view } = this.frame
    const context = {
      anchor,
      world: this.cursorWorld,
      snapPoint: null,
      point: this.cursorWorld,
      ucs,
      view,
    }
    const up = this.constraints.polarAlongZ(context)
    if (up) {
      const rise = up.z - zOf(anchor)
      const label = this.text.feedback("polarZ", {
        distance: formatLength(Math.abs(rise), settings),
        unit: unitSuffix(settings.unit),
        axis: this.text.feedback(rise > 0 ? "zPositive" : "zNegative"),
      })
      return {
        origin: withZ(anchor, zOf(anchor)),
        point: withZ(up, up.z),
        label,
        alongZ: true,
      }
    }
    const ray = this.constraints.polarGuideRay(context)
    if (!ray) return null

    const point = this.constraints.apply(context)
    const length = V.length(V.sub(point, anchor))
    const deg = headingInUcs(ucs, ray.dir)
    const label = this.text.feedback("polar", {
      distance: formatLength(length, settings),
      unit: unitSuffix(settings.unit),
      angle: formatAngle(deg, settings),
    })
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

    // Shift and the wheel button held orbit the view from inside any command,
    // AutoCAD's transparent 3DORBIT; the wheel button alone pans.
    if (e.button === 1 && e.shiftKey) {
      this.viewport.pushHistory()
      this.orbiting = {
        last: e.screen,
        target: orbitTarget(
          this.viewport,
          this.document.getEntities(),
          this.document.blockLookup()
        ),
      }
      this.crosshairScreen = null
      this.host.setCursor("move")
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

    // Seen edge-on the work plane has no point under the cursor: AutoCAD
    // refuses the pick unless an object snap supplies the point.
    if (
      (this.activeTool.wantsSnap?.() ?? true) &&
      this.currentSnap === null &&
      this.workPlaneEdgeOn()
    ) {
      this.commandLine.write("error", this.text.message("pointingEdgeOn"))
      this.invalidateState()
      this.host.requestRender()
      return
    }

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
    if (this.orbiting) {
      orbitView(
        this.viewport,
        {
          x: e.screen.x - this.orbiting.last.x,
          y: e.screen.y - this.orbiting.last.y,
        },
        this.orbiting.target
      )
      this.orbiting = { ...this.orbiting, last: e.screen }
      return
    }
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
    if (this.orbiting && e.button === 1) {
      this.orbiting = null
      this.activeTool.onActivate?.(this.toolContext) // restore tool cursor
      return
    }
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
   * AutoCAD's DBLCLKEDIT opens the object for editing: a text, multiline text
   * or loose attribute definition opens for retyping, and a block reference
   * with attributes opens EATTEDIT. Returns whether the double-click was
   * consumed.
   */
  doubleClick(e: PointerEventData): boolean {
    if (this.activeTool.id !== "select") return false
    const hit = this.pickEntity(this.screenToWork(e.screen))
    if (hit?.type === "insert" && (hit.attributes?.length ?? 0) > 0) {
      this.setActiveTool(this.attEdit.id)
      this.attEdit.beginEdit(hit, this.toolContext)
    } else if (
      hit?.type === "text" ||
      hit?.type === "mtext" ||
      hit?.type === "attdef"
    ) {
      this.setActiveTool(this.textEdit.id)
      this.textEdit.beginEdit(hit, this.toolContext)
    } else {
      return false
    }
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
    //
    // Only a keyword whose abbreviation is that one letter, and the start of no
    // other, runs on its key — and only on an empty prompt, so `_C`, a word or
    // a longer abbreviation (`SIZ`) can still be typed and confirmed.
    if (
      !e.ctrlKey &&
      !e.altKey &&
      e.key.length === 1 &&
      this.commandLine.getBuffer() === ""
    ) {
      const option = keywordForKey(
        e.key,
        offerOptions(this.activeTool, this.text)
      )
      if (option && this.invokeOption(option.id)) return true
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
    const world = this.screenToWork(e.screen)
    const snap = this.currentSnap
    const anchor = this.toolAnchor()
    const resolved = this.resolver.resolve(
      world,
      snap,
      anchor,
      e.shiftKey,
      this.activeTool.wantsSnap?.() ?? true
    )
    this.lastTracking = resolved.tracking
    return this.forTool({
      screen: e.screen,
      world,
      snap,
      tracking: resolved.tracking,
      point: resolved.point,
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    })
  }

  /**
   * Pointer input of the frame as the active tool reads it: as it is, or with
   * its points in the WCS for a tool that works there. A tracking guide's
   * direction stays in the UCS's plane.
   */
  private forTool(input: PointerInput): PointerInput {
    const { frame } = this
    if (!this.activeTool.inWorld || !frame.axes) return input
    const toWorld = (point: Vec3) => frame.pointToWorld(point)
    return {
      ...input,
      world: toWorld(input.world),
      point: toWorld(input.point),
      snap: input.snap && {
        ...input.snap,
        point: toWorld(input.snap.point),
        ...(input.snap.pickPoint
          ? { pickPoint: toWorld(input.snap.pickPoint) }
          : {}),
      },
      tracking: input.tracking && {
        ...input.tracking,
        point: toWorld(input.tracking.point),
      },
    }
  }

  /** The active tool's constraint anchor, in the frame, with its Z when it has one. */
  private toolAnchor(): Vec2 | Vec3 | null {
    const anchor = this.activeTool.getConstraintAnchor?.() ?? null
    if (anchor === null || !this.activeTool.inWorld) return anchor
    return this.frame.pointToFrame(withZ(anchor, zOf(anchor)))
  }

  /** The active tool's construction geometry, in the frame. */
  private toolSnapGeometry(cursor: Vec3): readonly ConstructionGeometry[] {
    const tool = this.activeTool
    const { frame } = this
    if (!tool.inWorld || !frame.axes) {
      return tool.getSnapGeometry?.(cursor) ?? []
    }
    const toFrame = (point: Vec2) =>
      planar(frame.pointToFrame(withZ(point, zOf(point))))
    return (tool.getSnapGeometry?.(frame.pointToWorld(cursor)) ?? []).map(
      (geometry) => ({
        ...geometry,
        a: toFrame(geometry.a),
        b: toFrame(geometry.b),
      })
    )
  }

  /** Clears acquired references and the cached guide so nothing lingers. */
  private resetTracking(): void {
    this.tracking.clear()
    this.parallelRefs.clear()
    this.lastTracking = null
  }

  private updateSnap(screen: Vec2): void {
    const cursor = this.screenToWork(screen)
    this.cursorWorld = cursor
    this.refreshCycling()
    const { frame } = this

    // Object snaps and snap-tracking only run while the active tool is actually
    // acquiring a point (AutoCAD shows running osnaps only during a point
    // prompt). While merely selecting, no snap is computed, so its marker can
    // never overlap a selection grip.
    if (this.activeTool.wantsSnap?.() ?? true) {
      const construction = this.toolSnapGeometry(cursor)
      // Perpendicular/Tangent snaps measure from the point the tool is drawing
      // from, so hand the current constraint anchor to the snap engine.
      const anchor = this.toolAnchor()
      // Parallel osnap: acquire the line under the cursor (by dwell) so only
      // lines the user points at are offered as parallels — AutoCAD's workflow.
      this.updateParallelAcquisition(anchor)
      this.currentSnap = this.snapping.resolve(
        screen,
        frame.document,
        frame.viewport,
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
      this.tracking.removeFarFrom(cursor, maxWorld)
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
        this.crosshairScreen = frame.viewport.worldToScreen(
          this.currentSnap.point
        )
      } else {
        const resolved = this.resolver.resolve(
          cursor,
          this.currentSnap,
          this.toolAnchor(),
          this.pointerShift
        )
        if (resolved.tracking) {
          this.crosshairScreen = frame.viewport.worldToScreen(
            resolved.tracking.point
          )
        } else if (this.snapMode.isRectangular()) {
          // Snap mode moves the cursor itself onto the lattice, the way
          // AutoCAD's crosshair visibly jumps from increment to increment.
          this.crosshairScreen = frame.viewport.worldToScreen(
            this.snapMode.snapPoint(cursor, frame.ucs)
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
    const { document, viewport } = this.frame
    const screen = viewport.isPlan
      ? null
      : viewport.worldToScreen(withZ(cursor, this.workPlaneZ()))
    let bestId: EntityId | null = null
    let bestDist = screen
      ? viewport.worldToScreenDistance(worldTolerance)
      : worldTolerance
    for (const entity of document.getEntities()) {
      if (entity.type !== "line") continue
      if (!document.isEntityVisible(entity)) continue
      const d = screen
        ? screenDistanceToEntity(viewport, entity, screen)
        : closestPointOnSegment(entity.start, entity.end, cursor).distance
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
    const options = offerOptions(this.activeTool, this.text)
    const prompt = commandPrompt(this.activeTool, this.text, options)
    return {
      activeToolId: this.activeTool.id,
      tools: this.listTools().map((t) => ({
        id: t.id,
        label: this.text.tool(t.id),
        // The typed alias is the real shortcut now, so that is what the UI
        // advertises ("L", "AR", "TR"), falling back to the tool's own hint.
        shortcut:
          (TOOL_COMMANDS[t.id] !== undefined
            ? shortestName(this.text.commandNames(TOOL_COMMANDS[t.id]))
            : undefined) ?? t.shortcut,
      })),
      entityCount: this.document.size,
      selectionCount: this.selection.size,
      scale: this.viewport.scale,
      view: { preset: currentViewPreset(this.viewport) },
      viewCube: this.viewCubeState(),
      ucsMenu: {
        world: isWorldUcs(settings.ucs),
        name: settings.ucsName,
        named: settings.namedUcs.map((entry) => entry.name),
      },
      cursorUcs: this.cursorWorld
        ? worldPointToUcs(
            this.frame.ucs,
            withZ(this.cursorWorld, this.workPlaneZ())
          )
        : null,
      snap: this.currentSnap
        ? {
            type: this.currentSnap.type,
            point: this.frame.pointToWorld(this.currentSnap.point),
          }
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
        candidates: buildSelectionCandidates(
          this.cycling.getCandidates(),
          this.text
        ),
        currentId: this.cycling.getCurrentId(),
        listAt: this.cyclingList?.screen ?? null,
      },
      gridVisible: this.gridVisible,
      snapModeActive: this.snapMode.isActive(),
      snapModeType: this.snapMode.getType(),
      snapSpacing: this.snapMode.getSpacing(),
      snapPolarDistance: this.snapMode.getPolarDistance(),
      dynamicInput: buildDynamicInputUi(this.dynamicInput, settings, this.text),
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
      selectionInfo: buildSelectionInfo(selectedEntities, settings, this.text),
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
      commandOptions: options,
      commandLine: {
        visible: this.commandLineVisible,
        prompt: promptString(prompt.segments),
        promptSegments: prompt.segments,
        command: prompt.command,
        idlePrompt: this.text.idlePrompt(),
        buffer: this.commandLine.getBuffer(),
        lines: this.commandLine.getLines(),
        suggestions: matchCommands(
          this.commandInfos,
          this.commandLine.getBuffer()
        ),
      },
      names: this.text.names(),
    }
  }
}
