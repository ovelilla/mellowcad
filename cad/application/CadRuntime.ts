import { Observable } from "../shared/Observable"
import { Vec2, V } from "../geometry/Vec2"
import { Vec3, planar, vec3, withZ, zOf } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { CadDocument } from "../domain/Document"
import {
  BlockId,
  Bounds,
  Entity,
  EntityId,
  EntityProperty,
  EntityType,
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
  parseNumber,
  unitSuffix,
  ViewCubeSetting,
} from "../domain/units"
import {
  DrawingFileError,
  parseDrawingFile,
} from "../serialization/drawingFile"
import { isBlankDrawing } from "../serialization/drawingSummary"
import { Scene, ScenePrimitive } from "../scene/types"
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
import {
  OSNAP_MENU_ANSWERS,
  OSNAP_MODES,
  OSNAP_MODE_IDS,
} from "./snapping/osnapModes"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintType } from "./constraints/types"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { TrackingGuide, TrackingResult } from "./tracking/types"
import {
  DynamicField,
  DynamicInputController,
  DynamicInputSession,
  DynamicInputState,
  isContentField,
} from "./input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "./input/coordinateInput"
import {
  CommandDefinition,
  CommandInfo,
  CommandLineController,
  TOOL_COMMANDS,
  matchCommands,
  shortestName,
  temporaryPromptLines,
} from "./CommandLine"
import { matchKeywords, resolveKeyword } from "../i18n/keywords"
import type { EngineLocale, PromptId } from "../locales/types"
import { EngineText, engineText, promptString } from "./EngineText"
import { CommandHistory } from "./commands/Command"
import { UpdateSettingsCommand } from "./commands/settingsCommands"
import {
  NewDrawingCommand,
  RemoveEntitiesCommand,
} from "./commands/entityCommands"
import { PointerInput, Tool, ToolContext } from "./tools/Tool"
import { InsertTool } from "./tools/InsertTool"
import { TextEditTool } from "./tools/TextEditTool"
import { AttEditTool } from "./tools/AttEditTool"
import { PasteTool } from "./tools/PasteTool"
import { directionFromUcsHeading, headingInUcs } from "./tools/ucsHeading"
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
import { shareStructure } from "./shareStructure"
import { AutosaveService } from "./Autosave"
import { buildScene, PolarGuideInput } from "./SceneBuilder"
import {
  buildBlockInfos,
  buildDimStyleInfos,
  buildDynamicInputUi,
  buildLayerInfos,
  buildSelectionCandidates,
  buildTextStyleInfos,
  EngineState,
  PaletteTab,
  SelectionScope,
  ShortcutMenuAction,
  ShortcutMenuMode,
  StylesPanelTab,
} from "./EngineState"
import {
  buildShortcutMenu,
  rightClickResponse,
  SHORTCUT_MENU_COMMANDS,
} from "./runtimeShortcutMenu"
import { Clipboard, DrawingStore, EngineHost, FileTransport } from "./ports"
import { nextLayerName, updateLayer } from "./runtimeLayers"
import { buildBlockPreview, purgeBlocks } from "./runtimeBlocks"
import {
  CommandPrompt,
  commandPrompt,
  keywordChoicePrompt,
  offerOptions,
  optionKeywords,
  continuesLine,
  askedPrompt,
  registerCommands,
  toolCommand,
} from "./runtimeCommands"
import { defaultTools } from "./runtimeTools"
import {
  measuredField,
  measuredValue,
  measureOverlay,
  secondPointQuestion,
} from "./runtimeMeasure"
import { promptRefusal, questionInput } from "./promptRefusal"
import {
  applyDrawingFile,
  copyToClipboard,
  readClipboardFragment,
  selectAll,
  serializeDrawing,
  suggestedFileName,
} from "./runtimeFiles"
import {
  buildPropertiesUi,
  commonSelectionColor,
  commonSelectionLayer,
  commonSelectionLinetype,
  commonSelectionLineweight,
  filterByType,
  setCurrentProperties,
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
  /**
   * Whether the palette panel starts open. A host decides it before the
   * engine exists (from the window's width or what it remembers), so the
   * engine adopts the host's answer rather than reaching one of its own.
   */
  readonly paletteOpen?: boolean
}

/** Wheel events closer together than this belong to the same zoom gesture. */
const WHEEL_BURST_MS = 400

/** Movement past this (screen px) makes a press a drag rather than a click. */
const DRAG_THRESHOLD_PX = 4

/**
 * Two clicks of the wheel button closer than this are a double-click. WHY a
 * time of our own: a browser fires `dblclick` for the primary button only and
 * does not tell the system's double-click time, so Windows' default stands in.
 */
const DOUBLE_CLICK_MS = 500

/** A key pressed with no modifier, as the shortcut menu presses Enter and Esc. */
const plainKey = (key: string): KeyEventData => ({
  key,
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
})

/** What a tool's context gives in the UCS plane's frame or in the WCS. */
type FramedPart =
  | "document"
  | "ucs"
  | "elevation"
  | "lastPoint"
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
  /** The system variables typed by name, keyed by it (`registerCommands`). */
  private readonly variables = new Map<string, CommandDefinition>()
  /** The commands as the command language lists them (drives autocomplete). */
  private commandInfos: CommandInfo[] = []

  private language: EngineText

  private currentSnap: SnapResult | null = null
  private lastTracking: TrackingResult | null = null
  /** The tracking guides and Extensions the cursor was last on, for a snap found on them. */
  private pathGuides: readonly TrackingGuide[] = []
  private cursorWorld: Vec3 | null = null

  // Whether Shift was held on the last pointer event. AutoCAD uses Shift as a
  // temporary Ortho override while specifying a point; this feeds the resolver.
  private pointerShift = false
  /** Set while the box hands an unanswered Enter on to the drawing. */
  private enterFromBox = false
  /** Where the running command's lines start, its echo included. */
  private commandStart = 0
  /** The echo's place while `runCommand` starts the command it wrote. */
  private echoMark: number | null = null
  /** The command `runCommand` is starting, which names the tool it starts. */
  private starting: string | null = null
  /**
   * The command the running tool was started as, which heads its prompt:
   * `-LINETYPE`, not the tool's LINETYPE. Null for a tool started otherwise.
   */
  private startedAs: string | null = null
  /** Set while an answer runs, so the prompt it answers is written once. */
  private answeringPrompt = false
  /**
   * An object snap given at the prompt (`_endp of`), written before the
   * answer it qualifies, on the same line.
   */
  private answerPrefix: string | null = null
  /**
   * The log's mark just after a prompt line a pick left bare, while nothing
   * has been written since: what the pick found goes on that line, and a
   * prompt AutoCAD asks without a new line follows it there.
   */
  private openLine: number | null = null
  /** What the pick being answered found, for its prompt's line. */
  private pickFound: string[] | null = null
  /** `Select objects:`' Previous set, the last one a command was given. */
  private previousSet: readonly EntityId[] = []
  /** The cursor the running tool last asked for. */
  private toolCursor: string | null = null
  /**
   * The command a transparent one (`'ZOOM`) interrupted, kept as it stood
   * to resume once that one ends.
   */
  private suspended: SuspendedCommand | null = null
  /**
   * A transparent command changed what AutoCAD regenerates for (`Regen
   * queued.`): `Regenerating model.` once the command it interrupted ends.
   */
  private regenQueued = false
  /** LASTPOINT, in the WCS: see {@link keepLastPoint}. */
  private lastPoint: Vec3 = vec3(0, 0, 0)
  /** The point a pick or FROM gave the answer running, in the WCS. */
  private pointGiven: Vec3 | null = null
  /** The coordinate typed for the answer running, in the WCS. */
  private pointTyped: Vec3 | null = null

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
  // Which style table the Styles palette shows.
  private stylesTable: StylesPanelTab = "dimension"
  // The palette panel: open or folded, and the palette it shows.
  private paletteOpen: boolean
  private paletteTab: PaletteTab = "properties"
  // The Properties palette's object type filter; null is All.
  private propertiesFilter: EntityType | null = null
  // Whether the Drawing Units dialog (UNITS) is showing.
  private unitsDialog = false
  // Whether the command prompt is shown. Hiding it is purely visual: typing
  // still feeds the prompt, which reappears while there is text to show.
  private commandLineVisible = true
  // Whether the command history is expanded above the prompt (F2).
  private commandHistoryOpen = false
  // Clean Screen (CLEANSCREENSTATE, not saved), and whether a palette was
  // opened while it is on, which shows the palette panel again.
  private cleanScreen = false
  private cleanScreenPalette = false

  private disposed = false
  private initializedView = false
  private pendingFit = false

  private panning = false
  private panFrom: Vec2 | null = null
  private lastPanScreen: Vec2 | null = null
  /** Whether this drag of the wheel button has taken its ZOOM Previous step. */
  private panPushed = false
  /** The last click of the wheel button, which a second one makes a double. */
  private lastWheelButtonClick: { at: Vec2; time: number } | null = null
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

  // The right button's press, answered on its release (see pointerUp), and the
  // shortcut menu that answer opened.
  private rightPress: Vec2 | null = null
  private shortcutMenu: { mode: ShortcutMenuMode; at: Vec2 } | null = null

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
  /**
   * The first of the two points a distance or an angle is measured by, at a
   * question whose tool takes no point itself (FILLET's radius), in the
   * tool's coordinates: AutoCAD's input then asks ` Specify second point:`.
   * Only while that tool asks that question in that box.
   */
  private measuring: {
    readonly tool: Tool
    readonly session: DynamicInputSession
    readonly prompt: PromptId | null
    readonly first: Vec3
    cursor: Vec3
  } | null = null
  /**
   * The keywords AutoCAD asks to choose from (`CEnter or CLose?`) after an
   * answer that starts them all. Only while that tool asks that question.
   */
  private clarifying: {
    readonly tool: Tool
    readonly prompt: PromptId | null
    readonly ids: readonly string[]
  } | null = null

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
    this.paletteOpen = options.paletteOpen ?? false
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
      () => this.document.getSettings().elevation,
      () => this.extensionGuides()
    )
    this.autosave = new AutosaveService(store, () => this.serializeDrawing())

    // The single surface tools may touch: read-only document + command bus.
    const doc = this.document
    const frame = () => this.frame
    const lastPoint = () => this.lastPoint
    const shared: Omit<ToolContext, FramedPart> = {
      selection: this.selection,
      dynamicInput: this.dynamicInput,
      blocks: this.document.blockLookup(),
      undo: () => this.history.undo(),
      pickTolerance: () =>
        this.viewport.screenToWorldDistance(this.snapping.pixelTolerance),
      requestRender: () => this.host.requestRender(),
      setCursor: (cursor) => {
        this.toolCursor = cursor
        this.host.setCursor(cursor)
      },
      report: (text, kind = "info") =>
        this.commandLine.write(
          kind,
          kind === "prompt" && this.suspended !== null
            ? this.text.transparentPrompt(text)
            : text
        ),
      runsTransparently: () => this.suspended !== null,
      regenerate: () => {
        if (this.suspended === null) {
          this.commandLine.write("info", this.text.message("regeneratingModel"))
          return
        }
        this.commandLine.write("info", this.text.message("regenQueued"))
        this.regenQueued = true
      },
      answer: (text) => this.answerFound(text),
      previousSelection: () => this.previousSet,
      rememberSelection: (ids) => {
        this.previousSet = [...ids]
      },
      setViewCubeVisible: (visible) => this.setViewCubeVisible(visible),
      snapOverride: () => this.snapping.getOverride(),
      runningSnaps: {
        enabled: () => this.snapping.enabledTypes(),
        set: (types) => {
          for (const type of this.snapping.availableTypes()) {
            this.snapping.setEnabled(type, types.includes(type))
          }
          if (types.length > 0) this.snapping.setActive(true)
        },
      },
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
        keyword: (id) => this.text.keyword(toolCommand(this.activeTool), id),
        transparentPrompt: (text) => this.text.transparentPrompt(text),
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
      get lastPoint() {
        return frame().pointToFrame(lastPoint())
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
      get lastPoint() {
        return lastPoint()
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

    // The running snaps of a fresh AutoCAD: OSMODE 4133, Endpoint + Center +
    // Intersection + Extension. Everything else is turned on deliberately.
    for (const type of [
      SnapType.Midpoint,
      SnapType.Quadrant,
      SnapType.Insertion,
      SnapType.Perpendicular,
      SnapType.Tangent,
      SnapType.Nearest,
      SnapType.ApparentIntersection,
      SnapType.Parallel,
    ]) {
      this.snapping.setEnabled(type, false)
    }
    // AUTOSNAP 63 turns polar tracking on, at POLARANG's 90.
    this.constraints.setEnabled(ConstraintType.Polar, true)

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
      // WHY: AutoCAD 2023's console puts LASTPOINT at the new UCS's origin
      // after UCS Origin and UCS World alike (`ID @` then reads 0,0,0).
      this.lastPoint = next.origin
    })
    // A new selection shows every object again, as the palette's drop-down
    // starts at All.
    this.selection.subscribe(() => {
      this.propertiesFilter = null
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
    if (this.suspended !== null) {
      // Ending a transparent command resumes the one it interrupted; starting
      // another ends both.
      if (id === "select") {
        this.resume()
        return
      }
      this.restoreSuspended()
    }
    const next = this.tools.get(id)
    if (!next || next === this.activeTool) return
    this.activeTool.onDeactivate?.(this.toolContext)
    if (this.regenQueued) {
      this.regenQueued = false
      this.commandLine.write("info", this.text.message("regeneratingModel"))
    }
    // A command is one undo step, closed only once its tool has committed
    // what it holds on deactivation.
    this.history.endGroup()
    this.resetTracking()
    this.answerPrefix = null
    this.commandStart = this.echoMark ?? this.commandLine.mark()
    this.activeTool = next
    this.startedAs = this.starting
    if (next.id !== "select") this.history.beginGroup()
    next.onActivate?.(this.toolContext)
    this.replayRestingPointer()
    this.invalidateState()
    // Give the drawing surface keyboard focus so Escape/shortcuts reach the
    // runtime even when the tool was picked from the toolbar (otherwise focus
    // stays on the button and Escape can't cancel the command or clear any
    // acquired object-snap-tracking references).
    this.host.focusSurface()
    this.host.requestRender()
  }

  /**
   * Commands are usually started from the keyboard or a toolbar button, with
   * the mouse standing still. Replay the cursor's last known position through
   * the tool taking over so its prompt box appears and the drawing crosshair
   * takes over right away, instead of the new tool's native cursor sitting on
   * top of a stale crosshair until the mouse moves.
   */
  private replayRestingPointer(): void {
    if (!this.lastPointerScreen) return
    const resting: PointerEventData = {
      screen: this.lastPointerScreen,
      button: 0,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    }
    this.updateSnap(resting.screen)
    this.activeTool.onPointerMove?.(
      this.buildPointerInput(resting),
      this.toolContext
    )
    if (this.dynamicInput.isOpen()) {
      this.dynamicInput.setPosition(resting.screen)
    }
  }

  /**
   * Runs `command` transparently: the running command is kept as it stands —
   * its question, its box, its selection set and its undo step — while
   * `command`'s tool asks its own questions, headed `>>`.
   */
  private suspend(command: CommandDefinition, clear: boolean): void {
    const tool =
      command.tool === undefined ? undefined : this.tools.get(command.tool)
    if (!tool) return
    // What was typed was this answer, not the running command's.
    if (clear) this.dynamicInput.clearTexts()
    this.suspended = {
      tool: this.activeTool,
      startedAs: this.startedAs,
      commandStart: this.commandStart,
      input: this.dynamicInput.save(),
      selection: this.selection.toArray(),
      previousSet: this.previousSet,
      cursor: this.toolCursor,
      lastPoint: this.lastPoint,
    }
    // WHY a set of its own: ZOOM Object asks `>>Select objects:` and
    // AutoCAD's MOVE still moves its own set after it.
    this.selection.clear()
    this.dynamicInput.close()
    this.commandStart = this.commandLine.mark()
    this.activeTool = tool
    this.startedAs = command.id
    tool.onActivate?.(this.toolContext)
    this.replayRestingPointer()
    this.invalidateState()
    this.host.requestRender()
  }

  /**
   * The transparent command has ended: the one it interrupted asks its
   * question again, after `Resuming LINE command.`.
   */
  private resume(): void {
    this.restoreSuspended()
    this.writeResuming()
    this.replayRestingPointer()
    this.invalidateState()
    this.host.focusSurface()
    this.host.requestRender()
  }

  /**
   * `Resuming LINE command.`, named as the running command was started; a
   * system variable typed as a command is SETVAR, which AutoCAD runs for it
   * (`Resuming SETVAR command.` in its 2023 console).
   */
  private writeResuming(): void {
    if (this.activeTool.systemVariable !== undefined) {
      this.commandLine.write(
        "info",
        this.text.message("resumingCommand", {
          command: this.text.commandNames("SETVAR")[0],
        })
      )
      return
    }
    const { command } = commandPrompt(
      this.activeTool,
      this.text,
      [],
      this.document.getSettings(),
      this.startedAs
    )
    this.commandLine.write(
      "info",
      this.text.message("resumingCommand", { command: command ?? "" })
    )
  }

  /** Ends the transparent command and puts back the one it interrupted. */
  private restoreSuspended(): void {
    const suspended = this.suspended
    if (suspended === null) return
    this.suspended = null
    this.activeTool.onDeactivate?.(this.toolContext)
    this.activeTool = suspended.tool
    this.startedAs = suspended.startedAs
    this.commandStart = suspended.commandStart
    this.selection.set(suspended.selection)
    this.previousSet = suspended.previousSet
    // WHY: AutoCAD 2023's console keeps LASTPOINT across a transparent
    // command — `@` after 'ID or 'DIST is still from the point before it.
    this.lastPoint = suspended.lastPoint
    this.dynamicInput.restore(suspended.input)
    this.toolCursor = suspended.cursor
    if (suspended.cursor !== null) this.host.setCursor(suspended.cursor)
  }

  /** Ends whatever runs, a command a transparent one interrupted too. */
  private endCommands(): void {
    this.restoreSuspended()
    this.returnToNeutralTool()
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
      (definition) => this.registerCommand(definition),
      (definition) => this.variables.set(definition.id, definition)
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
    // WHY: a right-to-left page isolates each command name in its prose with
    // invisible bidi controls (FSI…PDI); a name copied from there and pasted
    // here would match nothing. No key types one.
    this.commandLine.setBuffer(text.replace(/\p{Bidi_Control}/gu, ""))
    this.invalidateState()
  }

  /**
   * Runs what has been typed. An empty prompt repeats the last command, which
   * is how AutoCAD users chain repeated operations with Enter/Space. While a
   * command runs, what was typed answers its prompt: a keyword on offer — its
   * abbreviation, its word, or `_` and the global one —, a point modifier or
   * the box's value, and anything else is a wrong answer AutoCAD refuses
   * ({@link refuse}); a command name runs only at the Command prompt.
   */
  submitCommandLine(): void {
    const text = this.commandLine.getBuffer().trim()
    this.commandLine.setBuffer("")
    if (text === "") {
      // Mid-command the command window's Enter is the prompt's Enter.
      if (this.activeTool.id !== "select") this.pressEnter()
      else this.repeatLastCommand()
      return
    }
    if (this.invokeToolOption(text)) return
    if (this.clarifyingWords() !== null) {
      this.answering(text, () => this.unclarified(false))
      return
    }
    if (this.pointModifier(text)) return
    if (this.transparentCommand(text)) return
    if (this.answering(text, () => this.answerPrompt(text))) return
    if (this.activeTool.id !== "select") {
      this.answering(text, () => this.refuse())
      return
    }
    this.runCommand(text)
  }

  /**
   * A command typed with an apostrophe mid-command (`'ZOOM`, `'Z`): one
   * AutoCAD runs transparently runs inside the running one; any other is
   * refused, saying why, and so is a second one inside a transparent one or
   * one inside itself (`'ZOOM` at ZOOM's prompt), as AutoCAD 2023's console
   * refuses them. Not at a prompt that takes text, where it is the text.
   */
  private transparentCommand(text: string): boolean {
    const typed = text.trim()
    if (!typed.startsWith("'") || this.activeTool.id === "select") return false
    if (this.takesText()) return false
    return this.runTransparently(typed, true)
  }

  /**
   * Runs `typed` (`'ZOOM`) inside the running command, or refuses it there.
   * `clear`: what was typed in the box was this answer, so it goes.
   */
  private runTransparently(typed: string, clear: boolean): boolean {
    const named = this.commandNamed(typed)
    const variable = named?.transparent ? undefined : this.variableNamed(typed)
    const command = variable ?? named
    if (!command) return false
    const echo = variable
      ? this.text.transparentCommand(variable.id)
      : this.commandEcho(typed, command)
    return this.answering(echo, () => {
      if (
        command.transparent &&
        this.suspended === null &&
        command.tool === undefined
      ) {
        // One that asks nothing here (SNAP's toggle, UNITS' dialog) runs in
        // place, and the running command resumes at once.
        if (clear) this.dynamicInput.clearTexts()
        command.run()
        this.writeResuming()
        return true
      }
      if (
        command.transparent &&
        this.suspended === null &&
        command.tool !== this.activeTool.id
      ) {
        this.suspend(command, clear)
        return true
      }
      if (!command.transparent) {
        this.commandLine.write("error", this.text.message("notTransparent"))
      }
      if (clear) this.dynamicInput.clearTexts()
      return this.refuse()
    })
  }

  /**
   * The system variable `typed` names, an apostrophe before it or not: by
   * its own name in every language, never `_` and a global one.
   */
  private variableNamed(typed: string): CommandDefinition | undefined {
    return this.variables.get(bareCommand(typed))
  }

  /** Whether the box asks for text, which takes whatever is typed. */
  private takesText(): boolean {
    return (this.dynamicInput.getSession()?.fields ?? []).some((field) =>
      isContentField(field.kind)
    )
  }

  /**
   * The command `typed` names in the command language, or by `_` and its
   * global name, an apostrophe before it or not.
   */
  private commandNamed(typed: string): CommandDefinition | undefined {
    const id = this.text.resolveCommand(bareCommand(typed))
    return id === null ? undefined : this.commands.get(id)
  }

  /**
   * How a command typed is echoed: by the command language's name, an alias
   * as typed with that name (`l LINE`, `'z 'ZOOM`). WHY a name or `_` and a
   * global one echoes the command language's name, not what was typed: the
   * landing's scripts type `_CIRCLE` so that a Spanish reader sees CIRCULO.
   */
  private commandEcho(typed: string, command: CommandDefinition): string {
    const [name] = this.text.commandNames(command.id)
    const bare = bareCommand(typed)
    const echoed = typed.startsWith("'")
      ? this.text.transparentCommand(name)
      : name
    return !bare.startsWith("_") && bare !== name.toUpperCase()
      ? `${typed} ${echoed}`
      : echoed
  }

  /**
   * Writes what AutoCAD answers to an answer the running command's question
   * cannot take — `Point or option keyword required.`, `*Invalid selection*`
   * and what it expects… —, after which the prompt asks again. Returns whether
   * it was refused, which the history writes as an answer.
   */
  private refuse(): boolean {
    const lines = promptRefusal(
      {
        tool: this.activeTool,
        prompt: askedPrompt(this.activeTool),
        session: this.dynamicInput.isOpen()
          ? this.dynamicInput.getSession()
          : null,
        keywords: offerOptions(this.activeTool, this.text).map(
          (option) => option.keyword
        ),
        // WHY the tool's: at the second of two measuring points the console
        // still requires "two points".
        hasBase: (this.activeTool.getConstraintAnchor?.() ?? null) !== null,
      },
      this.text
    )
    if (lines === null) return false
    for (const line of lines) this.commandLine.write("error", line)
    this.invalidateState()
    return true
  }

  /**
   * Runs `run` as the answer to the running command's question and, once it
   * says the answer was taken, writes that question to the history with
   * `answer` after it — `Specify next point or [Undo]: 100`, a pick leaving it
   * bare — ahead of whatever answering it reported. Only the outermost answer
   * is written: a typed one reaches the box, and the box a keyword or Enter.
   */
  private answering(
    answer: string,
    run: () => boolean,
    picked = false
  ): boolean {
    if (this.answeringPrompt) return run()
    const asking = this.asking()
    const { echo } = this.currentPrompt()
    const prefix = this.answerPrefix
    const mark = this.commandLine.mark()
    const continues =
      this.openLine === mark && continuesLine(askedPrompt(asking))
    const asked = this.setsLastPoint()
      ? {
          tool: this.activeTool,
          anchor: this.toolAnchor(),
          suspended: this.suspended,
          ucs: this.document.getSettings().ucs,
        }
      : null
    this.answeringPrompt = true
    this.pickFound = picked ? [] : null
    this.pointGiven = null
    this.pointTyped = null
    let took: boolean
    let found: readonly string[] = []
    try {
      took = run()
    } finally {
      this.answeringPrompt = false
      found = this.pickFound ?? []
      this.pickFound = null
    }
    if (!took) return false
    if (asked !== null) this.keepLastPoint(asked)
    this.answerPrefix = null
    if (echo === null) {
      for (const text of found) this.commandLine.write("info", text)
      return true
    }
    const given = [prefix, answer, ...found].filter((part) => part).join(" ")
    const line = this.text.answered(promptString(echo), given)
    if (continues) {
      this.commandLine.amendBefore(mark, (last) => `${last} ${line}`)
    } else {
      this.commandLine.writeAt(mark, "prompt", line)
    }
    const written = this.commandLine.mark()
    this.openLine =
      picked && given === "" && written === (continues ? mark : mark + 1)
        ? written
        : null
    return true
  }

  /**
   * Whether the question asked now sets LASTPOINT once answered: a point
   * does, as AutoCAD's input functions keep it, a distance, a window's
   * corner or a selection does not — unless the tool says otherwise.
   */
  private setsLastPoint(): boolean {
    const tool = this.activeTool
    const prompt = askedPrompt(tool)
    if (prompt === null) return false
    const own = tool.setsLastPoint?.() ?? null
    if (own !== null) return own
    const input = questionInput({
      tool,
      prompt,
      session: this.dynamicInput.isOpen()
        ? this.dynamicInput.getSession()
        : null,
    })
    return input === "point" || input === "point2d"
  }

  /**
   * LASTPOINT after an answer to a question that sets it: the point picked
   * (or FROM's), else where the answer moved the tool's base — a length typed
   * along the cursor, LINE's Undo stepping back to the vertex before, as
   * AutoCAD 2023's console shows —, else the coordinate typed, which is all
   * an answer that ends the command leaves. A keyword that moves no base
   * keeps it (LINE's Close: the last point given). Nothing while a
   * transparent command starts or ends, which keeps it for the one it
   * interrupts, nor once the UCS changed, which put it at its origin.
   */
  private keepLastPoint(asked: {
    readonly tool: Tool
    readonly anchor: Vec2 | Vec3 | null
    readonly suspended: SuspendedCommand | null
    readonly ucs: Ucs
  }): void {
    if (this.suspended !== asked.suspended) return
    if (this.document.getSettings().ucs !== asked.ucs) return
    const anchor = this.activeTool === asked.tool ? this.toolAnchor() : null
    const moved =
      anchor !== null &&
      (asked.anchor === null || !samePlace(anchor, asked.anchor))
        ? this.frame.pointToWorld(withZ(anchor, zOf(anchor)))
        : null
    const point = this.pointGiven ?? moved ?? this.pointTyped
    if (point !== null) this.lastPoint = point
  }

  /**
   * The coordinate typed in the box's `field`, in the WCS, read as the
   * prompt reads it: from the tool's base when it has one, from LASTPOINT
   * otherwise. Null for anything else.
   */
  private typedPoint(field: DynamicField | undefined): Vec3 | null {
    if (!field || isContentField(field.kind)) return null
    const text = this.dynamicInput.getText(field.id).trim()
    if (!isCoordinateExpression(text)) return null
    const base = this.toolAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? this.frame.pointToFrame(this.lastPoint),
      relativeByDefault: base !== null,
      ucs: this.frame.ucs,
      elevation: this.document.getSettings().elevation,
    })
    return point && this.frame.pointToWorld(point)
  }

  /**
   * The open box's field a point answers as its value — a distance or an
   * angle AutoCAD's input measures from points — or null.
   */
  private pointMeasuredField(): DynamicField | null {
    const session = this.dynamicInput.isOpen()
      ? this.dynamicInput.getSession()
      : null
    if (session === null) return null
    return measuredField(
      session,
      questionInput({
        tool: this.activeTool,
        prompt: askedPrompt(this.activeTool),
        session,
      })
    )
  }

  /**
   * Whether the runtime measures the point given at the question itself:
   * the tool takes no point there (it wants no snap), as FILLET's radius,
   * RECTANG's elevation or ARRAYPOLAR's fill angle. A tool that does takes
   * the point as a pick (CIRCLE's radius, POLYGON's, which it also turns by).
   */
  private measuresPoints(): boolean {
    return (
      !(this.activeTool.wantsSnap?.() ?? true) &&
      this.pointMeasuredField() !== null
    )
  }

  /** Whether the question takes a point: the tool's, or one measured. */
  private wantsPoint(): boolean {
    return (this.activeTool.wantsSnap?.() ?? true) || this.measuresPoints()
  }

  /** The first of two measuring points, while its question stands. */
  private measuringFrom(): Vec3 | null {
    const measuring = this.measuring
    if (measuring === null) return null
    if (
      measuring.tool !== this.activeTool ||
      measuring.session !== this.dynamicInput.getSession() ||
      measuring.prompt !== askedPrompt(this.activeTool)
    ) {
      this.measuring = null
      return null
    }
    return measuring.first
  }

  /** The question as the prompt asks it: the second point while measuring. */
  private asking(): Tool {
    return this.measuringFrom() === null
      ? this.activeTool
      : secondPointQuestion(this.activeTool)
  }

  /** The prompt as it stands: the question asked, or which keyword was meant. */
  private currentPrompt(): CommandPrompt {
    const asking = this.asking()
    const prompt = commandPrompt(
      asking,
      this.text,
      asking === this.activeTool ? offerOptions(asking, this.text) : [],
      this.document.getSettings(),
      this.startedAs,
      this.suspended !== null
    )
    const words = this.clarifyingWords()
    return words === null
      ? prompt
      : keywordChoicePrompt(prompt, this.text, words, this.suspended !== null)
  }

  /** The words of the keywords AutoCAD asks to choose from, while it asks. */
  private clarifyingWords(): string[] | null {
    const clarifying = this.clarifying
    if (clarifying === null) return null
    if (
      clarifying.tool !== this.activeTool ||
      clarifying.prompt !== askedPrompt(this.activeTool)
    ) {
      this.clarifying = null
      return null
    }
    const offered = this.offeredKeywords()
    return clarifying.ids.flatMap((id) =>
      offered.filter((keyword) => keyword.id === id).map(({ word }) => word)
    )
  }

  /**
   * The keyword `typed` names among those on offer, run; or, when it starts
   * several, AutoCAD's `Ambiguous response, please clarify...` and the
   * question which one was meant, which any keyword on offer answers.
   */
  private answerKeyword(typed: string, ids: readonly string[]): boolean {
    return this.answering(typed.trim(), () => {
      if (ids.length === 1) {
        this.clarifying = null
        return this.invokeOption(ids[0])
      }
      this.commandLine.write("error", this.text.message("ambiguousResponse"))
      this.clarifying = {
        tool: this.activeTool,
        prompt: askedPrompt(this.activeTool),
        ids,
      }
      this.invalidateState()
      return true
    })
  }

  /**
   * An answer to which keyword was meant that names none: Enter asks again
   * (`Invalid option keyword.`), anything else — a point, a pick — is the
   * prompt's own wrong answer, refused in its words, after which the prompt
   * asks again, as AutoCAD 2023's console does.
   */
  private unclarified(enter: boolean): boolean {
    if (enter) {
      this.commandLine.write("error", this.text.message("invalidOptionKeyword"))
      this.invalidateState()
      return true
    }
    this.clarifying = null
    return this.refuse()
  }

  /**
   * A point given at a question the runtime measures, in the tool's
   * coordinates: the value from the tool's base point or the first of two,
   * answered as if typed; or the first of two, after which the question asks
   * for the second.
   */
  private measurePoint(point: Vec3): boolean {
    const field = this.pointMeasuredField()
    const session = this.dynamicInput.getSession()
    if (field === null || session === null) return false
    const anchor = this.activeTool.getConstraintAnchor?.() ?? null
    const from =
      this.measuringFrom() ??
      (anchor === null ? null : withZ(anchor, zOf(anchor)))
    if (from === null) {
      this.measuring = {
        tool: this.activeTool,
        session,
        prompt: askedPrompt(this.activeTool),
        first: point,
        cursor: point,
      }
      this.dynamicInput.clearTexts()
      this.invalidateState()
      return true
    }
    this.measuring = null
    this.dynamicInput.setText(
      field.id,
      String(measuredValue(field, from, point))
    )
    return this.commitBox(session, field)
  }

  private measuringOverlay(): ScenePrimitive[] {
    const from = this.measuringFrom()
    if (from === null || this.measuring === null) return []
    return measureOverlay(
      this.toolContext.viewport,
      from,
      this.measuring.cursor
    )
  }

  /** The rubber band and the box's reading while the second point is asked. */
  private measureMove(point: Vec3): void {
    const from = this.measuringFrom()
    const field = this.pointMeasuredField()
    if (from === null || field === null || this.measuring === null) return
    this.measuring.cursor = point
    this.dynamicInput.setLive(field.id, measuredValue(field, from, point))
  }

  /** A point of the active tool's input, in the WCS. */
  private toolPointToWorld(point: Vec3): Vec3 {
    return this.activeTool.inWorld ? point : this.frame.pointToWorld(point)
  }

  /** A point of the frame as the active tool reads it. */
  private frameToTool(point: Vec3): Vec3 {
    return this.activeTool.inWorld ? this.frame.pointToWorld(point) : point
  }

  /**
   * What an answer found (`ToolContext.answer`): on the line of the prompt a
   * pick answers or left bare, after the command's echo for a set selected
   * before it (`Command: M MOVE 1 found`), else on a line of its own, as
   * after a typed answer.
   */
  private answerFound(text: string): void {
    if (this.pickFound !== null) {
      this.pickFound.push(text)
      return
    }
    // WHY only outside an answer: one being answered (a fence's Enter) found
    // it, and an earlier pick's line is no longer the one asking.
    if (!this.answeringPrompt) {
      const answered = (line: string) => this.text.answered(line, text)
      const open = this.openLine === this.commandLine.mark()
      this.openLine = null
      if (
        open &&
        this.commandLine.amendLast(["prompt"], this.commandStart, answered)
      ) {
        return
      }
      if (
        this.commandLine.amendLast(["command"], this.commandStart, answered)
      ) {
        return
      }
    }
    this.commandLine.write("info", text)
  }

  /**
   * A value typed at the command line while a prompt asks for one goes to that
   * prompt, as in AutoCAD, where a command name there is not a command but a
   * wrong answer. Coordinates typed in the command window are absolute: the
   * relative default is the dynamic-input tooltip's (DYNPICOORDS), so they
   * reach the box with its `#`.
   */
  private answerPrompt(text: string): boolean {
    if (!this.dynamicInputHasField()) {
      const taken =
        this.activeTool.answerTyped?.(text, this.toolContext) ?? false
      if (taken) this.invalidateState()
      return taken
    }
    const id = this.dynamicInput.getActiveFieldId()
    const field = this.dynamicInput
      .getSession()
      ?.fields.find((f) => f.id === id)
    if (!field) return false
    const absolute =
      !isContentField(field.kind) &&
      isCoordinateExpression(text) &&
      !/^[@#*]/.test(text)
    const answer = absolute ? `#${text}` : text
    const session = this.dynamicInput.getSession()
    this.dynamicInput.setText(field.id, answer)
    this.commitDynamicInput()
    // An answer the prompt did not take is dropped, as the command line drops
    // it, rather than left behind in the box.
    if (
      this.dynamicInput.getSession() === session &&
      this.dynamicInput.getText(field.id) === answer
    ) {
      this.dynamicInput.setText(field.id, "")
    }
    this.invalidateState()
    return true
  }

  /**
   * An object snap typed at a point prompt — END, MID, NON… or `_END` in any
   * language — forces that snap for the next point, as the Shift+right-click
   * menu does; FROM typed into the dynamic-input box starts FROM as it does at
   * the command line.
   */
  private pointModifier(text: string): boolean {
    if (!this.wantsPoint()) return false
    const mode = resolveKeyword(
      text,
      this.text.keywords("-OSNAP", OSNAP_MODE_IDS)
    )
    // Not an answer: AutoCAD writes it on the line the pick that follows
    // answers, "Specify first point: _endp of".
    if (mode !== null) {
      this.setSnapOverride(OSNAP_MODES[mode], text.trim())
      return true
    }
    return this.answering(
      text.trim(),
      () =>
        this.angleOverride(text) ||
        (this.text.resolveCommand(text.trim().toUpperCase()) === "FROM" &&
          this.startFrom())
    )
  }

  /**
   * `<angle` typed at a point prompt that has a base point: AutoCAD's angle
   * override, "Angle Override: 30", locking the next point to that heading
   * from the base point (in the UCS) until it is given.
   */
  private angleOverride(text: string): boolean {
    const match = /^<\s*(\S+)$/.exec(text.trim())
    if (!match || this.toolAnchor() === null) return false
    const degrees = parseNumber(match[1])
    if (degrees === null || !Number.isFinite(degrees)) return false
    const dir = directionFromUcsHeading(this.frame.ucs, degrees)
    this.resolver.setAngleOverride(dir)
    this.commandLine.write(
      "info",
      this.text.message("angleOverride", { angle: match[1] })
    )
    if (this.lastPointerScreen) this.updateSnap(this.lastPointerScreen)
    this.replayPointerMove()
    this.invalidateState()
    this.host.requestRender()
    return true
  }

  /**
   * Runs a command by name or alias in the command language, or by `_` and
   * its global name in any language (case-insensitive), reporting whether it
   * existed. Unknown names are echoed to the prompt rather than thrown, like a
   * real command line.
   */
  runCommand(text: string): boolean {
    const typed = text.trim()
    if (bareCommand(typed) === "") return false
    const named = this.commandNamed(typed)
    // A command of the name runs, unless typed with an apostrophe and not
    // transparent: then the system variable of the name, as AutoCAD 2023's
    // console reads 'AREA and 'UCSICON at the Command prompt.
    const variable =
      named !== undefined && (!typed.startsWith("'") || named.transparent)
        ? undefined
        : this.variableNamed(typed)
    const command = variable ?? named
    if (!command) {
      this.commandLine.write(
        "error",
        this.text.message("unknownCommand", { name: bareCommand(typed) })
      )
      this.invalidateState()
      return false
    }
    const echo = variable
      ? typed.startsWith("'")
        ? this.text.transparentCommand(variable.id)
        : variable.id
      : this.commandEcho(typed, command)
    const [name] = variable ? [echo] : this.text.commandNames(command.id)
    this.echoMark = this.commandLine.mark()
    this.commandLine.write("command", echo)
    // At the Command prompt an apostrophe runs a transparent command as any
    // other, and refuses the rest, as AutoCAD 2023's console does.
    if (typed.startsWith("'") && !command.transparent) {
      this.echoMark = null
      this.commandLine.write("error", this.text.message("notTransparent"))
      this.invalidateState()
      return false
    }
    this.commandLine.pushHistory(name)
    this.starting = command.id
    try {
      command.run()
    } finally {
      this.echoMark = null
      this.starting = null
    }
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

  /**
   * The navigation bar's Pan or Zoom Window, which run AutoCAD's macros
   * `'_pan` and `'_zoom _w`: inside the running command as if typed with the
   * apostrophe — whatever its prompt takes, as a button types no text there —
   * and as the command itself at the Command prompt.
   */
  navigate(command: "PAN" | "ZOOM", option?: string): boolean {
    const typed = `'_${command}`
    const started =
      this.activeTool.id === "select"
        ? this.runCommand(typed)
        : this.runTransparently(typed, false)
    if (started) this.host.focusSurface()
    return (
      started && (option === undefined || this.invokeToolOption(`_${option}`))
    )
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
    if (!this.commandLineVisible) this.commandHistoryOpen = false
    this.invalidateState()
  }

  /**
   * Expands or collapses the command history above the prompt (F2, or the
   * arrow at the prompt's end). Expanding shows a hidden prompt too.
   */
  setCommandHistoryOpen(open: boolean): void {
    if (this.commandHistoryOpen === open) return
    this.commandHistoryOpen = open
    if (open) this.commandLineVisible = true
    this.invalidateState()
  }

  toggleCommandHistory(): void {
    this.setCommandHistoryOpen(!this.commandHistoryOpen)
  }

  /**
   * Clean Screen (CLEANSCREENON / CLEANSCREENOFF, Ctrl+0): hides the tool
   * palette, the palette panel and the ribbon's parts of the top bar, and
   * keeps the Quick Access Toolbar, the command line and the status bar.
   */
  setCleanScreen(on: boolean): void {
    if (this.cleanScreen === on) return
    this.cleanScreen = on
    this.cleanScreenPalette = false
    this.invalidateState()
  }

  toggleCleanScreen(): void {
    this.setCleanScreen(!this.cleanScreen)
  }

  deleteSelection(): void {
    if (this.selection.isEmpty()) return
    this.history.execute(new RemoveEntitiesCommand(this.selection.toArray()))
    this.selection.clear()
  }

  /**
   * NEW and QNEW: a blank drawing in place of this one, as one undo step (see
   * `NewDrawingCommand`), seen from the default view. A running command ends
   * first, as a menu's `^C^C` ends it in AutoCAD.
   */
  newDrawing(): void {
    this.endCommands()
    this.lastPoint = vec3(0, 0, 0)
    this.selection.clear()
    this.resetTracking()
    this.history.execute(new NewDrawingCommand())
    this.viewport.pushHistory()
    this.viewport.reset()
  }

  undo(): void {
    // Undo with a command running ends it first, so what it drew goes as one
    // step: "Click Undo on the Quick Access toolbar to cancel the entire series
    // of line segments".
    if (this.activeTool.id !== "select") this.endCommands()
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
  setSnapOverride(
    override: SnapType | "none",
    typed: string = OSNAP_MENU_ANSWERS[override].macro
  ): void {
    const at =
      this.snapOverrideMenu ?? this.shortcutMenu?.at ?? this.lastPointerScreen
    this.snapping.setOverride(override)
    this.answerPrefix = this.text.snapOverride(
      typed,
      OSNAP_MENU_ANSWERS[override].to
    )
    this.snapOverrideMenu = null
    this.shortcutMenu = null
    if (at) this.updateSnap(at)
    else this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /**
   * Tab at a point prompt: the next snap the objects under the cursor offer.
   * False when there is none to move to, so Tab keeps its other jobs.
   */
  cycleSnap(): boolean {
    if (!this.wantsPoint()) return false
    const at = this.lastPointerScreen
    if (at === null || !this.snapping.cycleNext()) return false
    this.updateSnap(at)
    this.host.requestRender()
    return true
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
   * A right-click on the drawing, answered as AutoCAD's SHORTCUTMENU 11 does:
   * the Default or Edit menu with no command running, the Command menu while
   * the prompt offers options, otherwise Enter.
   */
  private rightClick(screen: Vec2): void {
    const response = rightClickResponse(
      this.activeTool.id === "select" &&
        !(this.activeTool.wantsSnap?.() ?? false),
      !this.selection.isEmpty(),
      offerOptions(this.activeTool, this.text).length
    )
    if (response === "enter") {
      this.pressEnter()
      return
    }
    this.shortcutMenu = { mode: response, at: screen }
    this.invalidateState()
    this.host.requestRender()
  }

  /** Dismisses the shortcut menu without choosing from it. */
  closeShortcutMenu(): void {
    if (this.shortcutMenu === null) return
    this.shortcutMenu = null
    this.invalidateState()
    this.host.requestRender()
    this.host.focusSurface()
  }

  /** A fixed entry of the shortcut menu, chosen: what AutoCAD's item runs. */
  chooseShortcutMenuAction(action: ShortcutMenuAction): void {
    this.closeShortcutMenu()
    const command = SHORTCUT_MENU_COMMANDS[action]
    if (command !== undefined) this.runCommand(command)
    else if (action === "repeat") this.repeatLastCommand()
    else if (action === "enter") this.pressEnter()
    // Cancel is AutoCAD's ^C^C; Deselect All is the same Escape at the
    // neutral prompt ("Press Esc to deselect all objects").
    else this.cancelCommand()
  }

  /** A keyword of the prompt, chosen from the Command menu. */
  chooseShortcutMenuOption(id: string): void {
    this.closeShortcutMenu()
    this.invokeToolOption(`_${id}`)
  }

  /**
   * Enter at the prompt — a right-click with no menu to show, or the Command
   * menu's Enter: the same Enter as the keyboard's, in the box when it has a
   * field and on the drawing otherwise.
   */
  pressEnter(): void {
    this.shortcutMenu = null
    if (this.dynamicInputHasField()) this.commitDynamicInput()
    else this.keyDown(plainKey("Enter"))
    this.invalidateState()
    this.host.requestRender()
  }

  /**
   * The Command menu's Cancel, AutoCAD's ^C^C: the whole command ends, the
   * second cancel ending one a transparent command interrupted.
   */
  cancelCommand(): void {
    this.shortcutMenu = null
    this.endFrom()
    this.commandLine.setBuffer("")
    const transparent = this.suspended !== null
    this.cancelOnce()
    if (transparent) this.cancelOnce()
    this.invalidateState()
    this.host.requestRender()
  }

  private cancelOnce(): void {
    if (this.dynamicInputHasField()) this.cancelDynamicInput()
    else this.keyDown(plainKey("Escape"))
  }

  private dynamicInputHasField(): boolean {
    const session = this.dynamicInput.getSession()
    return this.dynamicInput.isOpen() && (session?.fields.length ?? 0) > 0
  }

  /**
   * The value field keys typed on the drawing go to: the box's active field
   * while one is up and nothing waits at the command line, or null. A content
   * field (TEXT's string) is left to the box itself, whose keys are its own.
   */
  private typingField(): string | null {
    if (
      this.shortcutMenu !== null ||
      this.snapOverrideMenu !== null ||
      this.cyclingList !== null ||
      this.commandLine.getBuffer() !== "" ||
      !this.dynamicInputHasField()
    ) {
      return null
    }
    const id = this.dynamicInput.getActiveFieldId()
    const field = this.dynamicInput
      .getSession()
      ?.fields.find((f) => f.id === id)
    return field && !isContentField(field.kind) ? field.id : null
  }

  /**
   * Starts AutoCAD's FROM modifier: the next pick sets a base point (normally
   * with an object snap) and the point after it is entered as an offset from
   * that base, e.g. `@20,0`. Only meaningful while a tool is asking for a point.
   * It answers that prompt as the menu's macro does, `_from`.
   */
  startFrom(): boolean {
    if (!this.wantsPoint()) return false
    return this.answering("_from", () => this.beginFrom())
  }

  private beginFrom(): boolean {
    this.snapOverrideMenu = null
    this.shortcutMenu = null
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
    const typed = this.dynamicInput.getText("offset").trim()
    // WHY Enter places the base point itself: the `<Offset>` default is no
    // offset (unverified — the FROM page says nothing of Enter), and handing
    // Enter to the command instead would leave FROM half-run under it.
    const point =
      typed === ""
        ? base
        : parseCoordinate(typed, {
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
  private placePoint(point: Vec3, movedThere = false): void {
    this.pointGiven = this.frame.pointToWorld(point)
    const input = this.forTool({
      screen: this.frame.viewport.worldToScreen(point),
      world: point,
      snap: null,
      tracking: null,
      point,
      button: 0,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    })
    // A tool measuring a value reads it off where the pointer stands.
    if (movedThere) this.activeTool.onPointerMove?.(input, this.toolContext)
    this.activeTool.onPointerDown?.(input, this.toolContext)
    this.snapping.clearOverride()
    this.answerPrefix = null
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
    const picking = !this.wantsPoint()
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
    const input = this.buildPointerInput(resting)
    this.activeTool.onPointerMove?.(input, this.toolContext)
    this.measureMove(input.point)
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

  /**
   * The selected objects an edit applies to: all of them for the ribbon's
   * drop-downs, those the type filter leaves for the Properties palette.
   */
  private scopeIds(scope: SelectionScope): EntityId[] {
    const ids = this.selection.toArray()
    if (scope === "selection" || this.propertiesFilter === null) return ids
    const entities = ids
      .map((id) => this.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    return filterByType(entities, this.propertiesFilter).map(
      (entity) => entity.id
    )
  }

  setSelectionLayer(id: LayerId, scope: SelectionScope = "selection"): void {
    setSelectionLayer(this.document, this.scopeIds(scope), this.history, id)
  }

  /**
   * The ribbon's layer drop-down: with objects selected it moves them to the
   * layer chosen, in one undo step, and the current layer stays; with nothing
   * selected it makes that layer current.
   */
  applyLayerControl(id: LayerId): void {
    if (this.selection.isEmpty()) this.setCurrentLayer(id)
    else this.setSelectionLayer(id)
  }

  setSelectionColor(
    color: EntityColor | typeof COLOR_BYLAYER,
    scope: SelectionScope = "selection"
  ): void {
    setSelectionColor(this.document, this.scopeIds(scope), this.history, color)
  }

  setSelectionLinetype(
    linetype: LinetypeId | typeof LINETYPE_BYLAYER,
    scope: SelectionScope = "selection"
  ): void {
    setSelectionLinetype(
      this.document,
      this.scopeIds(scope),
      this.history,
      linetype
    )
  }

  setSelectionLineweight(
    lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER,
    scope: SelectionScope = "selection"
  ): void {
    setSelectionLineweight(
      this.document,
      this.scopeIds(scope),
      this.history,
      lineweight
    )
  }

  /** Sets CECOLOR, the colour new objects take: a hex value or ByLayer. */
  setCurrentColor(color: EntityColor | typeof COLOR_BYLAYER): void {
    setCurrentProperties(this.document, this.history, { currentColor: color })
  }

  /** Sets CELTYPE, the linetype new objects take: a linetype or ByLayer. */
  setCurrentLinetype(linetype: LinetypeId | typeof LINETYPE_BYLAYER): void {
    setCurrentProperties(this.document, this.history, {
      currentLinetype: linetype,
    })
  }

  /** Sets CELWEIGHT, the lineweight new objects take: a standard value or ByLayer. */
  setCurrentLineweight(
    lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
  ): void {
    setCurrentProperties(this.document, this.history, {
      currentLineweight: lineweight,
    })
  }

  /**
   * The ribbon's Object Color drop-down, as its layer drop-down: with objects
   * selected it changes them, in one undo step; with nothing selected it sets
   * the current colour ("If no objects are selected, the drop-down lists …
   * display the current settings").
   */
  applyColorControl(color: EntityColor | typeof COLOR_BYLAYER): void {
    if (this.selection.isEmpty()) this.setCurrentColor(color)
    else this.setSelectionColor(color)
  }

  /** The Linetype drop-down: as {@link applyColorControl}, with CELTYPE. */
  applyLinetypeControl(linetype: LinetypeId | typeof LINETYPE_BYLAYER): void {
    if (this.selection.isEmpty()) this.setCurrentLinetype(linetype)
    else this.setSelectionLinetype(linetype)
  }

  /** The Lineweight drop-down: as {@link applyColorControl}, with CELWEIGHT. */
  applyLineweightControl(
    lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
  ): void {
    if (this.selection.isEmpty()) this.setCurrentLineweight(lineweight)
    else this.setSelectionLineweight(lineweight)
  }

  /** Retypes a geometry value of the one object the Properties palette edits. */
  setSelectionProperty(property: EntityProperty, text: string): boolean {
    return setSelectionProperty(
      this.document,
      this.scopeIds("properties"),
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

  /**
   * Enter in the dynamic-input box. What is typed is submitted, an untyped
   * field beside it taking the cursor's reading (direct distance). With nothing
   * typed it is Enter at the Command prompt ("the actions required to complete
   * a command … are similar"): a form's defaults, else the default a session
   * reads from its empty text (LINE's Continue, CIRCLE's last radius), else the
   * drawing's Enter, which ends LINE. Never the readings alone: they only show
   * where the cursor is.
   */
  commitDynamicInput(): void {
    const session = this.dynamicInput.getSession()
    if (!session) return
    // A keyword typed into a value box answers the prompt, exactly as it does
    // at the command line. A free-text box holds content, never a keyword.
    const field = session.fields.find(
      (f) => f.id === this.dynamicInput.getActiveFieldId()
    )
    if (field && !isContentField(field.kind)) {
      const typed = this.dynamicInput.getText(field.id)
      const ids = matchKeywords(typed, this.offeredKeywords())
      if (ids.length > 0) {
        this.dynamicInput.setText(field.id, "")
        this.answerKeyword(typed, ids)
        return
      }
    }
    if (this.clarifyingWords() !== null) {
      const typed = this.dynamicInput.typedAnswer()
      this.dynamicInput.clearTexts()
      this.answering(typed, () => this.unclarified(typed === ""))
      return
    }
    if (field && !isContentField(field.kind)) {
      const typed = this.dynamicInput.getText(field.id)
      if (this.pointModifier(typed)) {
        this.dynamicInput.setText(field.id, "")
        return
      }
      if (this.transparentCommand(typed)) return
    }
    this.answering(this.dynamicInput.typedAnswer(), () =>
      this.commitBox(session, field)
    )
  }

  /** {@link commitDynamicInput}'s value, returning whether the prompt took it. */
  private commitBox(
    session: DynamicInputSession,
    field: DynamicField | undefined
  ): boolean {
    this.pointTyped = this.typedPoint(field)
    const values = this.dynamicInput.resolveValues()
    if (this.pointTyped !== null && this.pointMeasuredField() !== null) {
      // AutoCAD's distance and angle input take a point as a pick there: the
      // radius to `25,20`, OFFSET's first of two points.
      const point = this.frame.pointToFrame(this.pointTyped)
      this.dynamicInput.clearTexts()
      if (this.measuresPoints()) {
        const took = this.measurePoint(this.frameToTool(point))
        // The value was answered as typed, by the box's own commit.
        if (!took || this.measuring === null) return took
      } else {
        this.placePoint(point, true)
      }
    } else if (values) {
      session.commit(values, this.toolContext)
    } else if (!session.commitRaw?.(this.toolContext)) {
      // The numeric fields don't resolve and the session has no raw handler (or
      // it rejected the text, e.g. an incomplete coordinate): nothing to do,
      // unless nothing was typed — then the prompt has no default to give.
      if (!this.dynamicInput.hasTypedText()) {
        // The drawing's own Enter, which must not come back to the box.
        this.enterFromBox = true
        try {
          this.keyDown(plainKey("Enter"))
        } finally {
          this.enterFromBox = false
        }
        return true
      }
      if (field && !isContentField(field.kind)) {
        // A value the prompt cannot take is refused and asked again, as
        // AutoCAD's prompt refuses it, rather than left for the next keys to
        // run on from ("ndo" after U, then "_u" read as "ndo_u").
        this.dynamicInput.clearTexts()
        this.invalidateState()
        return this.refuse()
      }
      return false
    }
    // A tool that opened its next question in the commit may have filled it
    // (a default in the box), so only the session just answered is cleared.
    if (this.dynamicInput.getSession() === session) {
      this.dynamicInput.clearTexts()
    }
    // Committing a value places/edits a point, which consumes any acquired
    // object-snap-tracking references — just like a click does.
    this.resetTracking()
    // The point given is the next one's base, so the rubber band, Ortho and
    // Polar measure from it at once, where the cursor still stands: a length
    // typed next, mouse unmoved, runs towards the cursor, not on along the
    // last segment.
    if (this.lastPointerScreen && this.dynamicInput.isOpen()) {
      this.updateSnap(this.lastPointerScreen)
      this.replayPointerMove()
    }
    this.host.requestRender()
    return true
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
    this.answering(this.text.message("cancel"), () => {
      this.clarifying = null
      this.activeTool.onKeyDown?.(plainKey("Escape"), this.toolContext)
      this.returnToNeutralTool()
      return true
    })
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
    const ids = matchKeywords(input, this.offeredKeywords())
    return ids.length > 0 && this.answerKeyword(input, ids)
  }

  /** The keywords the active tool offers, in both of their languages. */
  private offeredKeywords() {
    return optionKeywords(
      this.activeTool,
      this.text,
      this.activeTool.commandOptions?.() ?? []
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

  /**
   * The Drawing Units dialog's OK: the insertion scale's unit (INSUNITS) and
   * the length precision (LUPREC), as one undo step, as AutoCAD's U undoes
   * what a command set.
   */
  applyDrawingUnits(unit: LengthUnit, precision: number): void {
    const settings = this.document.getSettings()
    const digits = Math.max(0, Math.min(8, Math.round(precision)))
    const patch: { unit?: LengthUnit; precision?: number } = {}
    if (unit !== settings.unit) patch.unit = unit
    if (digits !== settings.precision) patch.precision = digits
    if (Object.keys(patch).length > 0) {
      this.history.execute(new UpdateSettingsCommand(patch))
    }
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
  /** Puts the dimensions the Properties palette edits on style `id`. */
  setSelectionDimStyle(id: DimStyleId): void {
    setSelectionDimStyle(
      this.document,
      this.scopeIds("properties"),
      this.history,
      id
    )
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

  /** Puts the text objects the Properties palette edits on style `id`. */
  setSelectionTextStyle(id: TextStyleId): void {
    setSelectionTextStyle(
      this.document,
      this.scopeIds("properties"),
      this.history,
      id
    )
  }

  /**
   * Narrows the Properties palette to one object type of the selection, or
   * widens it to all with null ("modify the properties of a single object
   * type at a time"). The selection itself is kept.
   */
  setPropertiesFilter(type: EntityType | null): void {
    if (this.propertiesFilter === type) return
    this.propertiesFilter = type
    this.invalidateState()
  }

  /** Which style table the Styles palette shows. */
  setStylesTable(table: StylesPanelTab): void {
    if (this.stylesTable === table) return
    this.stylesTable = table
    this.invalidateState()
  }

  /**
   * Opens the palette panel on `tab` (LAYER, PROPERTIES, BLOCKSPALETTE…). With
   * Clean Screen on, the panel shows again, as a palette opened then does.
   */
  showPalette(tab: PaletteTab): void {
    if (this.cleanScreen && !this.cleanScreenPalette) {
      this.cleanScreenPalette = true
      this.invalidateState()
    }
    if (this.paletteOpen && this.paletteTab === tab) return
    this.paletteOpen = true
    this.paletteTab = tab
    this.invalidateState()
  }

  /**
   * Folds the palette panel. With a tab, only while that palette is the one
   * shown, as LAYERCLOSE closes the layer manager and leaves another palette
   * where it is.
   */
  closePalette(tab?: PaletteTab): void {
    if (!this.paletteOpen) return
    if (tab !== undefined && tab !== this.paletteTab) return
    this.paletteOpen = false
    this.cleanScreenPalette = false
    this.invalidateState()
  }

  /** A palette's trigger: opens the panel on it, or folds it if it is showing. */
  togglePalette(tab: PaletteTab): void {
    if (this.paletteOpen && this.paletteTab === tab) this.closePalette()
    else this.showPalette(tab)
  }

  /** The panel's own fold button: opens it on the palette it last showed. */
  setPaletteOpen(open: boolean): void {
    if (open) this.showPalette(this.paletteTab)
    else this.closePalette()
  }

  /** Shows or hides the Drawing Units dialog (UNITS). */
  setUnitsDialog(open: boolean): void {
    if (this.unitsDialog === open) return
    this.unitsDialog = open
    this.invalidateState()
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
    this.lastPoint = vec3(0, 0, 0)
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
      tracking: this.sceneTracking(),
      parallelReferenceIds: this.parallelRefs.getAcquired(),
      toolOverlay: [
        ...(this.activeTool.buildOverlay?.(this.toolContext) ?? []),
        ...this.measuringOverlay(),
      ],
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
   * snap and OTRACK take precedence, so it is hidden while either engages —
   * but for a snap found on the path itself (where it crosses an object),
   * whose path stays drawn up to that point.
   */
  private buildPolarGuide(): PolarGuideInput | null {
    const onPath = this.currentSnap?.transient ? this.currentSnap : null
    if ((this.currentSnap && !onPath) || this.lastTracking) return null
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

    const point = onPath
      ? planar(onPath.point)
      : this.constraints.apply(context)
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
    // A press on the drawing collapses the expanded command history.
    if (this.commandHistoryOpen) this.setCommandHistoryOpen(false)

    // An open shortcut menu takes the press that dismisses it, as its backdrop
    // does on the page: nothing reaches the drawing.
    if (this.shortcutMenu !== null) {
      this.closeShortcutMenu()
      return
    }

    // Shift+right-click during a point prompt opens the object-snap override
    // menu (AutoCAD's temporary single-snap override), instead of panning.
    if (e.button === 2 && e.shiftKey && this.wantsPoint()) {
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

    // The wheel button pans (MBUTTONPAN 1: "panning when you hold and drag
    // the button or wheel").
    if (e.button === 1) {
      this.panning = true
      this.panFrom = e.screen
      this.lastPanScreen = e.screen
      this.crosshairScreen = null // native grab cursor takes over while panning
      this.host.setCursor("grabbing")
      return
    }

    // The right button is answered on its release, where Windows opens a
    // shortcut menu: one opened on the press would take that very release.
    if (e.button === 2) {
      this.rightPress = e.screen
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
      this.answerPrefix = null
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
      this.wantsPoint() &&
      this.currentSnap === null &&
      this.workPlaneEdgeOn()
    ) {
      this.commandLine.write("error", this.text.message("pointingEdgeOn"))
      this.invalidateState()
      this.host.requestRender()
      return
    }

    const input = this.buildPointerInput(e)
    this.answering(
      "",
      () => {
        if (this.clarifyingWords() !== null) return this.unclarified(false)
        this.pointGiven = this.toolPointToWorld(input.point)
        if (this.measuresPoints()) return this.measurePoint(input.point)
        this.activeTool.onPointerDown?.(input, this.toolContext)
        return true
      },
      true
    )
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
      if (delta.x === 0 && delta.y === 0) return
      // One ZOOM Previous step per drag, taken when the view first moves: a
      // click of the wheel button that never moved it leaves none.
      if (!this.panPushed) {
        this.viewport.pushHistory()
        this.panPushed = true
      }
      this.lastPanScreen = e.screen
      this.viewport.panByScreen(delta)
      return
    }

    this.pointerShift = e.shiftKey
    this.lastPointerScreen = e.screen
    this.releaseHeldPressOnDrag(e)
    this.updateSnap(e.screen)
    const input = this.buildPointerInput(e)
    this.activeTool.onPointerMove?.(input, this.toolContext)
    this.measureMove(input.point)
    this.host.requestRender()
  }

  /**
   * A click of the wheel button; a second one close by is ZOOM Extents
   * ("Double-click the wheel button"), in any command, as AutoCAD's is.
   */
  private wheelButtonClick(screen: Vec2): void {
    const now = Date.now()
    const last = this.lastWheelButtonClick
    if (
      last !== null &&
      now - last.time <= DOUBLE_CLICK_MS &&
      Math.hypot(screen.x - last.at.x, screen.y - last.at.y) < DRAG_THRESHOLD_PX
    ) {
      this.lastWheelButtonClick = null
      this.zoomToFit()
      this.updateSnap(screen)
      this.host.requestRender()
      return
    }
    this.lastWheelButtonClick = { at: screen, time: now }
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
    if (this.panning && e.button === 1) {
      const from = this.panFrom
      this.panning = false
      this.panFrom = null
      this.lastPanScreen = null
      this.panPushed = false
      this.activeTool.onActivate?.(this.toolContext) // restore tool cursor
      const moved = from
        ? Math.hypot(e.screen.x - from.x, e.screen.y - from.y)
        : Infinity
      if (moved < DRAG_THRESHOLD_PX) this.wheelButtonClick(e.screen)
      return
    }
    if (e.button === 2) {
      if (this.rightPress !== null) {
        this.rightPress = null
        this.rightClick(e.screen)
      }
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
    if (e.key === "Escape" && this.shortcutMenu !== null) {
      this.closeShortcutMenu()
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

    // The expanded command history closes with Escape, which still goes on to
    // cancel whatever it would have cancelled.
    if (e.key === "Escape" && this.commandHistoryOpen) {
      this.setCommandHistoryOpen(false)
    }

    // F2 expands the command history above the prompt, as AutoCAD's does for
    // the one-line command window it starts with.
    if (e.key === "F2") {
      this.toggleCommandHistory()
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
      // Inside a command that offers Undo, Ctrl+Z is that option: "only the
      // previous line segment is undone because you are still in the Line
      // Command".
      if (e.shiftKey) this.redo()
      else if (!this.invokeToolOption("_Undo")) this.undo()
      return true
    }
    if (e.ctrlKey && (e.key === "y" || e.key === "Y")) {
      this.redo()
      return true
    }
    // AutoCAD's window shortcuts. Chrome hands Ctrl+<digit> to the page first
    // and switches tabs or resets the zoom only when it is not prevented.
    if (e.ctrlKey && !e.altKey && e.key === "9") {
      this.toggleCommandLine()
      return true
    }
    if (e.ctrlKey && !e.altKey && e.key === "0") {
      this.toggleCleanScreen()
      return true
    }
    if (e.ctrlKey && !e.altKey && e.key === "1") {
      this.togglePalette("properties")
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

    // A keyword is typed and confirmed, as at AutoCAD's prompt: no key runs
    // one on its own. A letter run at once broke the muscle memory of `C`
    // Enter, whose Enter then repeated LINE after Close had ended it.
    const box = this.typingField()
    // WHY: with a value box up, what is typed on the drawing goes into it, as
    // AutoCAD's dynamic input takes the keyboard wherever the cursor is. The
    // box takes focus back only after the next render, and a first key that
    // reached the command line split "100" into "1" there and "00" in the box.
    // Space and Enter are the box's Enter, which only ends the command when
    // nothing is typed and the prompt has no default to take.
    if (box !== null && !e.ctrlKey && !e.altKey) {
      const typed = this.dynamicInput.getText(box)
      const space = e.key === " " && !e.shiftKey
      if ((e.key === "Enter" || space) && !this.enterFromBox) {
        this.pressEnter()
        return true
      }
      if (e.key === "Backspace" && typed !== "") {
        this.setDynamicInputText(typed.slice(0, -1), box)
        return true
      }
      if (e.key.length === 1 && e.key !== " ") {
        this.setDynamicInputText(typed + e.key, box)
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

      if (e.key === "Tab" && typed === "" && this.cycleSnap()) return true

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

      // Repeating the last command, with Enter or Space, is only offered when
      // no command is running; mid-command Enter keeps its meaning
      // (accept/exit). A grip edit counts as a command, as it does for the
      // right button.
      if (
        (e.key === "Enter" || e.key === " ") &&
        this.activeTool.id === "select" &&
        !(this.activeTool.wantsSnap?.() ?? false) &&
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

    // Space is Enter mid-command, as at AutoCAD's prompt: it confirms a
    // selection set, takes a default or ends the command.
    const key =
      e.key === " " && !e.shiftKey && this.activeTool.id !== "select"
        ? "Enter"
        : e.key
    if (key === "Enter" && this.clarifyingWords() !== null) {
      this.answering("", () => this.unclarified(true))
      return true
    }
    if (key === "Enter" || key === "Escape") {
      let consumed = false
      this.answering(
        key === "Escape" ? this.text.message("cancel") : "",
        () => {
          this.clarifying = null
          consumed = this.endKey({ ...e, key })
          return true
        }
      )
      return consumed
    }
    this.activeTool.onKeyDown?.(e, this.toolContext)
    this.host.requestRender()
    return false
  }

  /** Enter or Escape on the drawing, returning whether the tool kept it. */
  private endKey(e: KeyEventData): boolean {
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
    // OFFSET and similar continuous commands). From a focused dynamic-input box
    // Enter arrives here only when the box has no default to give.
    this.returnToNeutralTool()
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
      this.wantsPoint()
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
        ...(input.snap.touch ? { touch: toWorld(input.snap.touch) } : {}),
      },
      tracking: input.tracking && {
        ...input.tracking,
        point: toWorld(input.tracking.point),
      },
    }
  }

  /** The active tool's constraint anchor, in the frame, with its Z when it has one. */
  private toolAnchor(): Vec2 | Vec3 | null {
    const anchor =
      this.measuringFrom() ?? this.activeTool.getConstraintAnchor?.() ?? null
    if (anchor === null || !this.activeTool.inWorld) return anchor
    return this.frame.pointToFrame(withZ(anchor, zOf(anchor)))
  }

  /**
   * The alignment paths the cursor is on, out past the edge of the view, for
   * Intersection and Apparent Intersection to cross with objects: the engaged
   * polar path ("use polar tracking with Intersection and Apparent
   * Intersection object snaps to find where a polar alignment path intersects
   * another object"), and the OTRACK guides and Extensions it follows — the
   * same AutoTrack paths (**unverified**: the help names the polar one only).
   * WHY nothing else: the rubber band is not an object, and crossing it with
   * the drawing turned every line the cursor passed over into a snap.
   */
  private alignmentPaths(
    cursor: Vec3,
    anchor: Vec2 | Vec3 | null
  ): readonly ConstructionGeometry[] {
    const { ucs, viewport: view } = this.frame
    const reach = (from: Vec2) =>
      V.distance(from, cursor) +
      view.screenToWorldDistance(Math.hypot(view.width, view.height))
    const paths: ConstructionGeometry[] = []
    const ray =
      anchor === null || this.pointerShift
        ? null
        : this.constraints.polarGuideRay({
            anchor,
            world: cursor,
            point: cursor,
            ucs,
            view,
          })
    if (ray) {
      paths.push({
        kind: "segment",
        a: planar(ray.origin),
        b: V.add(ray.origin, V.scale(ray.dir, reach(ray.origin))),
      })
    }
    const guides = [
      ...this.resolver.engagedGuides(cursor, anchor, this.pointerShift),
      ...this.extensionsUnder(cursor),
    ]
    this.pathGuides = guides
    for (const guide of guides) {
      const origin = planar(guide.point.origin)
      const { dir } = guide
      const far = reach(origin)
      paths.push({
        kind: "segment",
        a:
          guide.kind === "extension"
            ? origin
            : V.sub(origin, V.scale(dir, far)),
        b: V.add(origin, V.scale(dir, far)),
      })
    }
    return paths
  }

  /** The Extensions the cursor lies on, within the aperture, ahead of their end. */
  private extensionsUnder(cursor: Vec3): TrackingGuide[] {
    const tolerance = this.frame.viewport.screenToWorldDistance(
      this.snapping.pixelTolerance
    )
    return this.extensionGuides().filter((guide) => {
      const offset = V.sub(cursor, guide.point.origin)
      return (
        V.dot(offset, guide.dir) > 0 &&
        Math.abs(V.cross(guide.dir, offset)) <= tolerance
      )
    })
  }

  /**
   * The tracking paths to draw: the engaged ones, or with a snap found where
   * they cross an object, the paths it lies on. An Extension reads as a
   * tracking path, but draws as the snap it is.
   */
  private sceneTracking(): TrackingResult | null {
    const snap = this.currentSnap
    if (!snap) return this.lastTracking
    if (!snap.transient || this.pathGuides.length === 0) return null
    return {
      point: snap.point,
      kind: "projection",
      guides: this.pathGuides,
      direction: this.pathGuides[0].dir,
    }
  }

  /** Extension's straight paths from the acquired ends, as tracking guides. */
  private extensionGuides(): TrackingGuide[] {
    return this.snapping
      .extensionLines(this.frame.document, this.tracking.getAcquired())
      .map((line, i) => ({
        point: {
          id: `extension-${i}`,
          origin: line.origin,
          sourceType: SnapType.Endpoint,
          sourceIds: line.sourceIds,
          acquiredAt: 0,
        },
        dir: line.dir,
        angle: Math.atan2(line.dir.y, line.dir.x),
        kind: "extension",
      }))
  }

  /** Clears acquired references and the cached guide so nothing lingers. */
  private resetTracking(): void {
    // A typed `<angle` holds for one point, like the references acquired for it.
    this.resolver.setAngleOverride(null)
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
    if (this.wantsPoint()) {
      // Perpendicular/Tangent snaps measure from the point the tool is drawing
      // from, so hand the current constraint anchor to the snap engine.
      const anchor = this.toolAnchor()
      const construction = this.alignmentPaths(cursor, anchor)
      // Parallel osnap: acquire the line under the cursor (by dwell) so only
      // lines the user points at are offered as parallels — AutoCAD's workflow.
      this.updateParallelAcquisition(anchor)
      const override = this.snapping.getOverride()
      this.tracking.acquireEndpoints =
        override === SnapType.Extension ||
        (override === null &&
          this.snapping.isActive() &&
          this.snapping.isEnabled(SnapType.Extension))
      this.currentSnap = this.snapping.resolve(
        screen,
        frame.document,
        frame.viewport,
        construction,
        anchor,
        this.parallelRefs.getAcquired(),
        this.tracking.getAcquired()
      )
      // Followed along one path to where another crosses it, the crossing is
      // the point, not the snap sliding with the cursor (Extension, Nearest…).
      if (
        this.currentSnap &&
        SnapEngine.slides(this.currentSnap.type) &&
        this.resolver.crossing(cursor, anchor, this.pointerShift)
      ) {
        this.currentSnap = null
      }

      // Feed object snap tracking: acquire by hover, drop stale references.
      const epsilon = this.viewport.screenToWorldDistance(
        this.snapping.pixelTolerance
      )
      const acquiredFrom =
        this.tracking.acquireEndpoints &&
        !this.tracking.canAcquire(this.currentSnap)
          ? this.snapping.endpointUnder(screen, frame.document, frame.viewport)
          : this.currentSnap
      this.tracking.observeHover(
        acquiredFrom,
        epsilon,
        this.snapping.releaseTolerance
      )
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
    if (this.wantsPoint()) {
      if (this.currentSnap) {
        // A snap found through its object (the centre from
        // the rim) leaves the crosshair on the pointer: the magnet only pulls
        // it onto a point that is already under the aperture.
        this.crosshairScreen =
          this.currentSnap.screenDistance <= this.snapping.releaseTolerance
            ? frame.viewport.worldToScreen(this.currentSnap.point)
            : screen
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
    // WHY shared and skipped: one pointer move invalidates several sub-models,
    // and a rebuilt snapshot is new from top to bottom. Keeping what did not
    // change lets the UI re-render only the part that did — the cursor's
    // coordinates and the dynamic input — rather than the whole editor.
    const next = shareStructure(this.stateSnapshot, this.buildState())
    if (next === this.stateSnapshot) return
    this.stateSnapshot = next
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
    const options =
      this.asking() === this.activeTool
        ? offerOptions(this.activeTool, this.text)
        : []
    const prompt = this.currentPrompt()
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
      shortcutMenu:
        this.shortcutMenu &&
        buildShortcutMenu(this.shortcutMenu.mode, this.shortcutMenu.at, {
          repeat: this.commandLine.getLastCommand(),
          options,
        }),
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
      dynamicInput: buildDynamicInputUi(
        this.dynamicInput,
        settings,
        this.text,
        prompt.dynamic
      ),
      documentUnit: settings.unit,
      documentPrecision: settings.precision,
      documentAnglePrecision: settings.anglePrecision,
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
      currentColor: settings.currentColor,
      currentLinetype: settings.currentLinetype,
      currentLineweight: settings.currentLineweight,
      canUndo: this.history.canUndo(),
      canRedo: this.history.canRedo(),
      saveState: this.autosave.getState(),
      lastSavedAt: this.autosave.getLastSavedAt(),
      properties: buildPropertiesUi(
        selectedEntities,
        this.propertiesFilter,
        settings,
        this.text
      ),
      selectionLayerId: commonSelectionLayer(selectedEntities),
      selectionColor: commonSelectionColor(selectedEntities),
      selectionLinetype: commonSelectionLinetype(selectedEntities),
      selectionLineweight: commonSelectionLineweight(selectedEntities),
      textStyles: buildTextStyleInfos(
        this.document.getTextStyles(),
        this.document.getEntities()
      ),
      currentTextStyleId: this.document.getCurrentTextStyleId(),
      dimStyles: buildDimStyleInfos(
        this.document.getDimStyles(),
        this.document.getEntities()
      ),
      currentDimStyleId: this.document.getCurrentDimStyleId(),
      stylesTable: this.stylesTable,
      blocks: buildBlockInfos(
        this.document.getBlocks(),
        this.document.getEntities()
      ),
      palette: { open: this.paletteOpen, tab: this.paletteTab },
      unitsDialog: this.unitsDialog,
      cleanScreen: {
        active: this.cleanScreen,
        palette: this.cleanScreenPalette,
      },
      commandOptions: options,
      commandLine: {
        visible: this.commandLineVisible,
        historyOpen: this.commandHistoryOpen,
        recent: temporaryPromptLines(this.commandLine.getLines()),
        prompt: promptString(prompt.segments),
        promptSegments: prompt.segments,
        command: prompt.command,
        question: prompt.echo,
        idlePrompt: this.text.idlePrompt(),
        buffer: this.commandLine.getBuffer(),
        lines: this.commandLine.getLines(),
        suggestions: matchCommands(
          this.commandInfos,
          this.commandLine.getBuffer()
        ),
        lang: this.text.commandTag,
      },
      names: this.text.names(),
    }
  }
}

/** A command as typed, without the apostrophe that asks for it transparently. */
function bareCommand(typed: string): string {
  return typed.replace(/^'/, "").trim().toUpperCase()
}

/** Whether two of a tool's anchors are one point. */
function samePlace(a: Vec2 | Vec3, b: Vec2 | Vec3): boolean {
  return a.x === b.x && a.y === b.y && zOf(a) === zOf(b)
}

/** What a transparent command keeps of the one it interrupted. */
interface SuspendedCommand {
  readonly tool: Tool
  readonly startedAs: string | null
  readonly commandStart: number
  readonly input: DynamicInputState
  readonly selection: readonly EntityId[]
  readonly previousSet: readonly EntityId[]
  readonly cursor: string | null
  readonly lastPoint: Vec3
}
