import { Vec2 } from "../geometry/Vec2"
import { ellipseAngleFromParam, normalizeDegrees } from "../geometry/primitives"
import {
  DocumentSettings,
  LengthUnit,
  formatAngle,
  formatLength,
  unitSuffix,
} from "../domain/units"
import {
  BlockDefinition,
  BlockId,
  Entity,
  EntityId,
  EntityProperty,
  EntityType,
  arcLength,
  arcSweepAngle,
  circleArea,
  circleCircumference,
  ellipseArea,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseSweepParams,
  isFullEllipse,
  lineAngleDegrees,
  lineLength,
  polylineArea,
  polylineLength,
  polylineSegments,
  dimensionMeasurement,
  dimensionMeasurementUnit,
  DimensionKind,
  TextJustify,
} from "../domain/entities"
import { SnapType } from "./snapping/types"
import { SnapResult } from "./snapping/types"
import { SnapEngine } from "./snapping/SnapEngine"
import { SnapModeType, SnapMode } from "./SnapMode"
import { DynamicFieldKind, DynamicInputController } from "./input/DynamicInput"
import { isCoordinateExpression } from "./input/coordinateInput"
import { CommandOption, Tool } from "./tools/Tool"
import {
  CommandDefinition,
  CommandLineController,
  CommandLineEntry,
  CommandSuggestion,
  matchCommands,
  toolCommandAlias,
} from "./CommandLine"
import { SaveState, AutosaveService } from "./Autosave"
import { CadDocument } from "../domain/Document"
import { Viewport } from "./Viewport"
import { Selection } from "./Selection"
import { SelectionCycling } from "./SelectionCycling"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ConstraintType } from "./constraints/types"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { CommandHistory } from "./commands/Command"
import { commandPrompt } from "./runtimeCommands"
import {
  commonSelectionColor,
  commonSelectionLayer,
  commonSelectionLinetype,
  commonSelectionLineweight,
} from "./runtimeProperties"
import { Layer, LayerId } from "../domain/layers"
import { EntityColor } from "../domain/colors"
import { LinetypeId } from "../domain/linetypes"
import { Lineweight } from "../domain/lineweights"
import { TextStyle, TextStyleId } from "../domain/textStyles"
import { DimStyle, DimStyleId } from "../domain/dimStyles"
import { hatchPatternName } from "../domain/hatchPatterns"

/** Which of the two style tables the manager is showing. */
export type StylesPanelTab = "dimension" | "text"

/** A layer plus its live entity count, ready for the layer manager UI. */
export interface LayerInfo extends Layer {
  /** How many entities currently live on this layer. */
  readonly entityCount: number
}

/**
 * A style plus how many objects wear it, for the style managers. The count is
 * what lets the UI grey out a delete AutoCAD would refuse ("you cannot delete a
 * style that is current or in use").
 */
export interface TextStyleInfo extends TextStyle {
  readonly entityCount: number
}

export interface DimStyleInfo extends DimStyle {
  readonly entityCount: number
}

/** A block definition as the Blocks palette lists it. */
export interface BlockInfo {
  readonly id: BlockId
  readonly name: string
  /** How many references to it the drawing currently holds. */
  readonly referenceCount: number
}

/** One dynamic-input field, formatted for display by the UI. */
export interface DynamicInputFieldUi {
  readonly id: string
  readonly label: string
  readonly kind: DynamicFieldKind
  /** The text the user has typed (controlled by the UI). */
  readonly value: string
  /** Formatted live value shown as a placeholder when nothing is typed. */
  readonly placeholder: string
  /** Unit label shown after the field, e.g. `mm` or `°`. */
  readonly unitSuffix: string
  readonly active: boolean
}

/** Snapshot of the active dynamic-input session for the UI. */
export interface DynamicInputUi {
  /** Screen (CSS-pixel) position to anchor the floating input near. */
  readonly screen: Vec2
  readonly fields: ReadonlyArray<DynamicInputFieldUi>
}

/** Makes a property row typeable, the way AutoCAD's Properties palette is. */
export interface PropertyEdit {
  readonly property: EntityProperty
  /** Bare number to seed the input with (no unit). */
  readonly text: string
  /** Unit shown after the input, e.g. `mm` or `°`. */
  readonly unit: string
}

/** A single label/value line shown in the properties panel. */
export interface PropertyRow {
  readonly label: string
  readonly value: string
  /** Present when the value can be retyped to change the geometry. */
  readonly edit?: PropertyEdit
}

/** A titled group of related properties (e.g. "Geometry"). */
export interface PropertyGroup {
  readonly title: string
  readonly rows: ReadonlyArray<PropertyRow>
}

/**
 * Description of the current selection for the properties panel, modelled on
 * AutoCAD's Properties palette. `null` when nothing is selected.
 */
export interface SelectionInfo {
  /** Heading, e.g. "Line", "Circle" or "3 objects". */
  readonly title: string
  readonly count: number
  readonly groups: ReadonlyArray<PropertyGroup>
}

/** Snapshot of the command line (AutoCAD's `Command:` prompt) for the UI. */
export interface CommandLineUi {
  /** Whether the prompt is shown (AutoCAD's Ctrl+9 / our F2 toggle). */
  readonly visible: boolean
  /** Text before the input, e.g. `Command:` or `PLINE [Close/Undo]:`. */
  readonly prompt: string
  /** What the user has typed so far, whether on the canvas or in the box. */
  readonly buffer: string
  /** Scrollback: commands echoed, results and errors. */
  readonly lines: ReadonlyArray<CommandLineEntry>
  /** Autocomplete matches for the current buffer; empty when nothing typed. */
  readonly suggestions: ReadonlyArray<CommandSuggestion>
}

/** One of the overlapping objects offered by selection cycling. */
export interface SelectionCandidateUi {
  readonly id: EntityId
  /** Object type, as AutoCAD's Selection list box names them ("Line"). */
  readonly label: string
}

/** Snapshot of selection cycling (AutoCAD's SELECTIONCYCLING) for the UI. */
export interface SelectionCyclingUi {
  readonly active: boolean
  /** Whether a click over a stack offers the Selection list box (value 2). */
  readonly showList: boolean
  /** Objects under the pick box, topmost first; the badge shows when > 1. */
  readonly candidates: ReadonlyArray<SelectionCandidateUi>
  /** The candidate a pick resolves to right now (Shift+Space walks these). */
  readonly currentId: EntityId | null
  /** Screen position of the open Selection list box, or null when closed. */
  readonly listAt: Vec2 | null
}

/** Immutable snapshot of engine state consumed by the React UI. */
export interface EngineState {
  readonly activeToolId: string
  readonly tools: ReadonlyArray<{
    id: string
    label: string
    shortcut?: string
  }>
  readonly entityCount: number
  readonly selectionCount: number
  readonly scale: number
  readonly cursorWorld: Vec2 | null
  readonly snap: { type: SnapType; point: Vec2 } | null
  readonly snapActive: boolean
  readonly snapEnabled: Readonly<Record<SnapType, boolean>>
  /**
   * The one-shot object-snap override forced for the next point (AutoCAD's
   * Shift+right-click), `"none"` to suppress snapping for it, or null when the
   * running snaps apply.
   */
  readonly snapOverride: SnapType | "none" | null
  /**
   * Screen position at which to pop the object-snap override menu, or null when
   * it is closed.
   */
  readonly snapOverrideMenu: Vec2 | null
  readonly orthoActive: boolean
  /** Polar tracking (AutoCAD's POLAR / F10) on/off. */
  readonly polarActive: boolean
  /** Polar tracking angle increment in degrees (e.g. 45). */
  readonly polarAngleStep: number
  readonly objectSnapTrackingActive: boolean
  readonly acquiredTrackingPoints: number
  /** Selection cycling: the badge, the candidate list and its settings. */
  readonly selectionCycling: SelectionCyclingUi
  readonly gridVisible: boolean
  /** Snap mode (AutoCAD's SNAP / F9): the cursor is forced onto increments. */
  readonly snapModeActive: boolean
  /** Whether snap uses the rectangular lattice or polar distance increments. */
  readonly snapModeType: SnapModeType
  /** Snap lattice spacing in drawing units (AutoCAD's SNAPUNIT). */
  readonly snapSpacing: Vec2
  /** Polar snap distance increment (AutoCAD's POLARDIST). */
  readonly snapPolarDistance: number
  readonly dynamicInput: DynamicInputUi | null
  readonly documentUnit: LengthUnit
  readonly documentPrecision: number
  /** Global linetype scale (AutoCAD's LTSCALE). */
  readonly ltScale: number
  /** The current dimension style's overall scale (AutoCAD's DIMSCALE). */
  readonly dimScale: number
  /** Whether lineweights are drawn at real thickness (AutoCAD's LWDISPLAY). */
  readonly lwDisplay: boolean
  /** All layers with live entity counts, for the layer manager. */
  readonly layers: ReadonlyArray<LayerInfo>
  /** The layer new geometry is drawn on. */
  readonly currentLayerId: LayerId
  readonly canUndo: boolean
  readonly canRedo: boolean
  /** Transparent auto-save lifecycle, drives the save button's spinner. */
  readonly saveState: SaveState
  /** Epoch millis of the last successful auto-save, or null if never saved. */
  readonly lastSavedAt: number | null
  /** Geometric properties of the current selection, or null when empty. */
  readonly selectionInfo: SelectionInfo | null
  /**
   * The layer shared by every selected entity, or null when the selection is
   * empty or spans multiple layers. Drives the properties panel's Layer picker.
   */
  readonly selectionLayerId: LayerId | null
  /**
   * The colour shared by every selected entity for the properties picker:
   * `"ByLayer"` when they all inherit their layer, a hex value when they share
   * one override, or null when the selection is empty or mixed.
   */
  readonly selectionColor: EntityColor | "ByLayer" | null
  /**
   * The linetype shared by every selected entity for the properties picker:
   * `"ByLayer"` when they all inherit their layer, a concrete id when they share
   * one override, or null when the selection is empty or mixed.
   */
  readonly selectionLinetype: LinetypeId | "ByLayer" | null
  /**
   * The lineweight shared by every selected entity, as
   * {@link selectionLinetype}: `"ByLayer"`, a millimetre value, or null.
   */
  readonly selectionLineweight: Lineweight | "ByLayer" | null
  /** Every text style with the number of objects using it (the STYLE table). */
  readonly textStyles: ReadonlyArray<TextStyleInfo>
  /** The style new text is created with. */
  readonly currentTextStyleId: TextStyleId
  /** The style shared by every selected text object, else null. */
  readonly selectionTextStyleId: TextStyleId | null
  /** Every dimension style with its usage count (the DIMSTYLE table). */
  readonly dimStyles: ReadonlyArray<DimStyleInfo>
  /** The style new dimensions are created with. */
  readonly currentDimStyleId: DimStyleId
  /** The style shared by every selected dimension, else null. */
  readonly selectionDimStyleId: DimStyleId | null
  /** Which style table the manager is showing, or null while it is closed. */
  readonly stylesPanel: StylesPanelTab | null
  /** Every block defined in the drawing (the Blocks palette's Current tab). */
  readonly blocks: ReadonlyArray<BlockInfo>
  /** Whether the Blocks palette is showing. */
  readonly blocksPanel: boolean
  /**
   * Command options (keywords) the active tool currently offers — AutoCAD's
   * `[Close/Undo]` prompt. The UI renders these as hint chips near the dynamic
   * input; empty when the tool exposes none.
   */
  readonly commandOptions: ReadonlyArray<CommandOption>
  /** The command prompt: what is typed, what it suggests and what it logged. */
  readonly commandLine: CommandLineUi
}

/** The runtime state `buildEngineState` reads, passed explicitly. */
export interface EngineStateInput {
  readonly document: CadDocument
  readonly viewport: Viewport
  readonly selection: Selection
  readonly snapping: SnapEngine
  readonly snapMode: SnapMode
  readonly cycling: SelectionCycling
  readonly constraints: ConstraintManager
  readonly tracking: ObjectSnapTrackingEngine
  readonly dynamicInput: DynamicInputController
  readonly commandLine: CommandLineController
  readonly history: CommandHistory
  readonly autosave: AutosaveService
  readonly activeTool: Tool
  readonly tools: ReadonlyArray<Tool>
  readonly commandList: ReadonlyArray<CommandDefinition>
  readonly cursorWorld: Vec2 | null
  readonly snap: SnapResult | null
  readonly snapOverrideMenu: Vec2 | null
  /** Screen position of the open Selection list box, or null when closed. */
  readonly cyclingListAt: Vec2 | null
  readonly gridVisible: boolean
  readonly stylesPanel: StylesPanelTab | null
  readonly blocksPanel: boolean
  readonly commandLineVisible: boolean
}

/** Builds the UI snapshot. Cached by the runtime; never rebuilt per frame. */
export function buildEngineState(input: EngineStateInput): EngineState {
  const { document, selection, snapping, activeTool } = input
  const snapEnabled = {} as Record<SnapType, boolean>
  for (const type of Object.values(SnapType)) {
    snapEnabled[type] = snapping.isEnabled(type)
  }
  const settings = document.getSettings()
  const selectedEntities = selection
    .toArray()
    .map((id) => document.get(id))
    .filter((entity): entity is Entity => entity !== undefined)
  return {
    activeToolId: activeTool.id,
    tools: input.tools.map((t) => ({
      id: t.id,
      label: t.label,
      // The typed alias is the real shortcut now, so that is what the UI
      // advertises ("L", "AR", "TR"), falling back to the tool's own hint.
      shortcut: toolCommandAlias(t.id) ?? t.shortcut,
    })),
    entityCount: document.size,
    selectionCount: selection.size,
    scale: input.viewport.scale,
    cursorWorld: input.cursorWorld,
    snap: input.snap
      ? { type: input.snap.type, point: input.snap.point }
      : null,
    snapActive: snapping.isActive(),
    snapEnabled,
    snapOverride: snapping.getOverride(),
    snapOverrideMenu: input.snapOverrideMenu,
    orthoActive: input.constraints.isEnabled(ConstraintType.Ortho),
    polarActive: input.constraints.isEnabled(ConstraintType.Polar),
    polarAngleStep: input.constraints.getPolarAngleStep(),
    objectSnapTrackingActive: input.tracking.isActive(),
    acquiredTrackingPoints: input.tracking.getAcquired().length,
    selectionCycling: {
      active: input.cycling.isEnabled(),
      showList: input.cycling.showsList(),
      candidates: buildSelectionCandidates(input.cycling.getCandidates()),
      currentId: input.cycling.getCurrentId(),
      listAt: input.cyclingListAt,
    },
    gridVisible: input.gridVisible,
    snapModeActive: input.snapMode.isActive(),
    snapModeType: input.snapMode.getType(),
    snapSpacing: input.snapMode.getSpacing(),
    snapPolarDistance: input.snapMode.getPolarDistance(),
    dynamicInput: buildDynamicInputUi(input.dynamicInput, settings),
    documentUnit: settings.unit,
    documentPrecision: settings.precision,
    ltScale: settings.ltScale,
    dimScale: document.getDimStyle(document.getCurrentDimStyleId())?.scale ?? 1,
    lwDisplay: settings.lwDisplay,
    layers: buildLayerInfos(document.getLayers(), document.getEntities()),
    currentLayerId: document.getCurrentLayerId(),
    canUndo: input.history.canUndo(),
    canRedo: input.history.canRedo(),
    saveState: input.autosave.getState(),
    lastSavedAt: input.autosave.getLastSavedAt(),
    selectionInfo: buildSelectionInfo(selectedEntities, settings),
    selectionLayerId: commonSelectionLayer(selectedEntities),
    selectionColor: commonSelectionColor(selectedEntities),
    selectionLinetype: commonSelectionLinetype(selectedEntities),
    selectionLineweight: commonSelectionLineweight(selectedEntities),
    textStyles: buildTextStyleInfos(
      document.getTextStyles(),
      document.getEntities()
    ),
    currentTextStyleId: document.getCurrentTextStyleId(),
    selectionTextStyleId: commonStyleId(selectedEntities, "text"),
    dimStyles: buildDimStyleInfos(
      document.getDimStyles(),
      document.getEntities()
    ),
    currentDimStyleId: document.getCurrentDimStyleId(),
    selectionDimStyleId: commonStyleId(selectedEntities, "dimension"),
    stylesPanel: input.stylesPanel,
    blocks: buildBlockInfos(document.getBlocks(), document.getEntities()),
    blocksPanel: input.blocksPanel,
    commandOptions: activeTool.commandOptions?.() ?? [],
    commandLine: {
      visible: input.commandLineVisible,
      prompt: commandPrompt(activeTool),
      buffer: input.commandLine.getBuffer(),
      lines: input.commandLine.getLines(),
      suggestions: matchCommands(
        input.commandList,
        input.commandLine.getBuffer()
      ),
    },
  }
}

/**
 * Builds the layer manager view-model: every layer paired with the number of
 * entities living on it (so the UI can warn before deleting a used layer, etc.).
 */
export function buildLayerInfos(
  layers: ReadonlyArray<Layer>,
  entities: ReadonlyArray<Entity>
): LayerInfo[] {
  const counts = new Map<LayerId, number>()
  for (const entity of entities) {
    counts.set(entity.layerId, (counts.get(entity.layerId) ?? 0) + 1)
  }
  return layers.map((layer) => ({
    ...layer,
    entityCount: counts.get(layer.id) ?? 0,
  }))
}

/** Counts how many objects of `type` wear each style id. */
function styleCounts(
  entities: ReadonlyArray<Entity>,
  type: "text" | "dimension"
): Map<string, number> {
  const counts = new Map<string, number>()
  for (const entity of entities) {
    if (entity.type !== type) continue
    counts.set(entity.styleId, (counts.get(entity.styleId) ?? 0) + 1)
  }
  return counts
}

export function buildTextStyleInfos(
  styles: ReadonlyArray<TextStyle>,
  entities: ReadonlyArray<Entity>
): TextStyleInfo[] {
  const counts = styleCounts(entities, "text")
  return styles.map((style) => ({
    ...style,
    entityCount: counts.get(style.id) ?? 0,
  }))
}

export function buildDimStyleInfos(
  styles: ReadonlyArray<DimStyle>,
  entities: ReadonlyArray<Entity>
): DimStyleInfo[] {
  const counts = styleCounts(entities, "dimension")
  return styles.map((style) => ({
    ...style,
    entityCount: counts.get(style.id) ?? 0,
  }))
}

/** The block catalogue, each entry with how many references the drawing holds. */
export function buildBlockInfos(
  blocks: ReadonlyArray<BlockDefinition>,
  entities: ReadonlyArray<Entity>
): BlockInfo[] {
  const counts = new Map<BlockId, number>()
  for (const entity of entities) {
    if (entity.type !== "insert") continue
    counts.set(entity.blockId, (counts.get(entity.blockId) ?? 0) + 1)
  }
  return blocks.map((block) => ({
    id: block.id,
    name: block.name,
    referenceCount: counts.get(block.id) ?? 0,
  }))
}

/**
 * The style shared by every selected object of `type`, or null when the
 * selection holds none of them or spans several styles — the same "or null when
 * mixed" rule the layer and colour pickers use.
 */
export function commonStyleId(
  entities: ReadonlyArray<Entity>,
  type: "text" | "dimension"
): string | null {
  let shared: string | null = null
  for (const entity of entities) {
    if (entity.type !== type) continue
    if (shared === null) shared = entity.styleId
    else if (shared !== entity.styleId) return null
  }
  return shared
}

/**
 * Names the objects under the pick box for the Selection list box, the way
 * AutoCAD lists them: by object type, in pick order (topmost first).
 */
export function buildSelectionCandidates(
  entities: ReadonlyArray<Entity>
): SelectionCandidateUi[] {
  return entities.map((entity) => ({
    id: entity.id,
    label: TYPE_LABELS[entity.type].one,
  }))
}

/**
 * Presentation helpers: format the current dynamic-input session for the UI
 * (applying document units/precision). Kept apart from the runtime so
 * formatting policy never leaks into interaction logic.
 */
export function buildDynamicInputUi(
  controller: DynamicInputController,
  settings: DocumentSettings
): DynamicInputUi | null {
  const session = controller.getSession()
  const screen = controller.getScreen()
  if (!session || !screen) return null

  const fields = session.fields.map((field) => {
    const live = controller.getLive(field.id)
    return {
      id: field.id,
      label: field.label,
      kind: field.kind,
      value: controller.getText(field.id),
      placeholder:
        live !== null ? formatFieldValue(field.kind, live, settings) : "",
      unitSuffix: fieldUnitSuffix(field.kind, settings),
      active: controller.getActiveFieldId() === field.id,
    }
  })

  // Coordinate mode — one unified box, consistent everywhere. The pre-start
  // point field is always a coordinate; while drawing, the Length/Angle display
  // collapses to a single "X,Y" box the moment the user types a coordinate
  // (comma / < / @ / #), exactly like AutoCAD's dimension-to-coordinate switch.
  // Showing the same single coordinate box for the first point and for the next
  // ones keeps the experience predictable: what you see before you start is what
  // you see while you draw.
  //
  // A free-text field is exempt: a comma is ordinary content there, not the
  // separator of a point.
  const typeable = fields.filter((f) => f.kind !== "text")
  const coordinate =
    typeable.find((f) => isCoordinateExpression(f.value)) ??
    typeable.find((f) => f.kind === "coordinate")
  if (coordinate) {
    return {
      screen,
      fields: [
        {
          ...coordinate,
          label: coordinateLabel(coordinate.value),
          unitSuffix: "",
          // The "X,Y" / "Dist<Ang" label is the affordance; a placeholder
          // repeating it would only add visual noise.
          placeholder: "",
          active: true,
        },
      ],
    }
  }

  return { screen, fields }
}

/**
 * Label for the unified coordinate box, reflecting whether the user is typing a
 * cartesian point (`X,Y`) or a polar one (`Dist<Ang`), so the box always says
 * what it currently accepts.
 */
function coordinateLabel(text: string): string {
  return text.includes("<") ? "Dist<Ang" : "X,Y"
}

function formatFieldValue(
  kind: DynamicFieldKind,
  value: number,
  settings: DocumentSettings
): string {
  switch (kind) {
    case "angle":
      return formatAngle(value, settings)
    case "distance":
    case "length":
      return formatLength(value, settings)
    case "number":
    case "coordinate":
    case "text":
      return String(value)
  }
}

function fieldUnitSuffix(
  kind: DynamicFieldKind,
  settings: DocumentSettings
): string {
  switch (kind) {
    case "angle":
      return "°"
    case "distance":
    case "length":
      return unitSuffix(settings.unit)
    case "number":
    case "coordinate":
    case "text":
      return ""
  }
}

/**
 * Builds the properties-panel description of the current selection, applying
 * the document's unit/precision so the UI stays a dumb renderer. Returns `null`
 * when nothing is selected. A single entity shows its full geometry; multiple
 * entities show a summary count broken down by type.
 */
export function buildSelectionInfo(
  entities: ReadonlyArray<Entity>,
  settings: DocumentSettings
): SelectionInfo | null {
  if (entities.length === 0) return null
  if (entities.length === 1) return singleEntityInfo(entities[0], settings)
  return multiEntityInfo(entities)
}

function singleEntityInfo(
  entity: Entity,
  settings: DocumentSettings
): SelectionInfo {
  const length = (value: number) =>
    `${formatLength(value, settings)} ${unitSuffix(settings.unit)}`
  const area = (value: number) =>
    `${formatLength(value, settings)} ${unitSuffix(settings.unit)}²`
  const coord = (value: number) => formatLength(value, settings)

  const lengthRow = (
    label: string,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    label,
    value: length(value),
    edit: {
      property,
      text: formatLength(value, settings),
      unit: unitSuffix(settings.unit),
    },
  })
  const coordRow = (
    label: string,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    label,
    value: coord(value),
    edit: { property, text: formatLength(value, settings), unit: "" },
  })
  const angleRow = (
    label: string,
    property: EntityProperty,
    degrees: number
  ): PropertyRow => ({
    label,
    value: `${formatAngle(degrees, settings)}°`,
    edit: { property, text: formatAngle(degrees, settings), unit: "°" },
  })

  switch (entity.type) {
    case "line": {
      return {
        title: "Line",
        count: 1,
        groups: [
          {
            title: "Geometry",
            rows: [
              lengthRow("Length", "length", lineLength(entity)),
              angleRow("Angle", "angle", lineAngleDegrees(entity)),
              { label: "Δ X", value: length(entity.end.x - entity.start.x) },
              { label: "Δ Y", value: length(entity.end.y - entity.start.y) },
            ],
          },
          {
            title: "Endpoints",
            rows: [
              coordRow("Start X", "startX", entity.start.x),
              coordRow("Start Y", "startY", entity.start.y),
              coordRow("End X", "endX", entity.end.x),
              coordRow("End Y", "endY", entity.end.y),
            ],
          },
        ],
      }
    }
    case "circle": {
      return {
        title: "Circle",
        count: 1,
        groups: [
          {
            title: "Geometry",
            rows: [
              lengthRow("Radius", "radius", entity.radius),
              lengthRow("Diameter", "diameter", entity.radius * 2),
              {
                label: "Circumference",
                value: length(circleCircumference(entity)),
              },
              { label: "Area", value: area(circleArea(entity)) },
            ],
          },
          {
            title: "Center",
            rows: [
              coordRow("X", "centerX", entity.center.x),
              coordRow("Y", "centerY", entity.center.y),
            ],
          },
        ],
      }
    }
    case "arc": {
      const deg = (radians: number) =>
        normalizeDegrees((radians * 180) / Math.PI)
      return {
        title: "Arc",
        count: 1,
        groups: [
          {
            title: "Geometry",
            rows: [
              lengthRow("Radius", "radius", entity.radius),
              { label: "Length", value: length(arcLength(entity)) },
              angleRow(
                "Angle",
                "totalAngle",
                (arcSweepAngle(entity) * 180) / Math.PI
              ),
              angleRow("Start angle", "startAngle", deg(entity.startAngle)),
              angleRow("End angle", "endAngle", deg(entity.endAngle)),
            ],
          },
          {
            title: "Center",
            rows: [
              coordRow("X", "centerX", entity.center.x),
              coordRow("Y", "centerY", entity.center.y),
            ],
          },
        ],
      }
    }
    case "ellipse": {
      const { start, sweep } = ellipseSweepParams(entity)
      const full = isFullEllipse(entity)
      const axisAngle = (param: number) =>
        normalizeDegrees(
          (ellipseAngleFromParam(entity.ratio, param) * 180) / Math.PI
        )
      return {
        title: full ? "Ellipse" : "Elliptical arc",
        count: 1,
        groups: [
          {
            title: "Geometry",
            rows: [
              lengthRow(
                "Major radius",
                "majorRadius",
                ellipseSemiMajor(entity)
              ),
              lengthRow(
                "Minor radius",
                "minorRadius",
                ellipseSemiMinor(entity)
              ),
              // Derived from the two radii, so retyping it would be a third way
              // to say the same thing; AutoCAD's own ratio row is a gap here.
              {
                label: "Radius ratio",
                value: formatLength(entity.ratio, settings),
              },
              ...(full
                ? [{ label: "Area", value: area(ellipseArea(entity)) }]
                : [
                    // Measured from the major axis, which is the frame the
                    // stored parameters live in.
                    {
                      label: "Start angle",
                      value: `${formatAngle(axisAngle(start), settings)}°`,
                    },
                    {
                      label: "End angle",
                      value: `${formatAngle(
                        axisAngle(start + sweep),
                        settings
                      )}°`,
                    },
                  ]),
            ],
          },
          {
            title: "Center",
            rows: [
              coordRow("X", "centerX", entity.center.x),
              coordRow("Y", "centerY", entity.center.y),
            ],
          },
        ],
      }
    }
    case "polyline": {
      const vertexCount = entity.vertices.length
      const segmentCount = polylineSegments(entity).length
      return {
        title: "Polyline",
        count: 1,
        groups: [
          {
            title: "Geometry",
            rows: [
              { label: "Length", value: length(polylineLength(entity)) },
              ...(entity.closed
                ? [{ label: "Area", value: area(polylineArea(entity)) }]
                : []),
              { label: "Vertices", value: String(vertexCount) },
              { label: "Segments", value: String(segmentCount) },
              { label: "Closed", value: entity.closed ? "Yes" : "No" },
            ],
          },
        ],
      }
    }
    case "text": {
      return {
        title: "Text",
        count: 1,
        groups: [
          {
            title: "Text",
            rows: [
              // Editing the contents belongs to an in-place editor, not a
              // numeric field, so it stays read-only here. The style is a
              // picker in the palette's General section, not a row.
              { label: "Contents", value: entity.value },
              { label: "Justify", value: JUSTIFY_LABELS[entity.justify] },
              lengthRow("Height", "textHeight", entity.height),
              angleRow(
                "Rotation",
                "rotation",
                normalizeDegrees((entity.rotation * 180) / Math.PI)
              ),
            ],
          },
          {
            title: "Position",
            rows: [
              coordRow("X", "positionX", entity.position.x),
              coordRow("Y", "positionY", entity.position.y),
            ],
          },
        ],
      }
    }
    case "dimension": {
      return {
        title: "Dimension",
        count: 1,
        groups: [
          {
            title: "Dimension",
            rows: [
              // The measurement is derived from the definition points, so it is
              // read-only here exactly as it is in AutoCAD's palette.
              {
                label: "Measurement",
                value:
                  dimensionMeasurementUnit(entity.kind) === "angle"
                    ? `${formatAngle(
                        (dimensionMeasurement(entity) * 180) / Math.PI,
                        settings
                      )}°`
                    : length(dimensionMeasurement(entity)),
              },
              {
                label: "Text override",
                value: entity.text ?? "\u2014",
              },
              { label: "Type", value: DIMENSION_TYPE_LABELS[entity.kind] },
              ...(entity.kind === "linear"
                ? [
                    angleRow(
                      "Rotation",
                      "dimensionRotation",
                      normalizeDegrees((entity.rotation * 180) / Math.PI)
                    ),
                  ]
                : []),
            ],
          },
          {
            title: "Definition points",
            rows: [
              ...(entity.vertex
                ? [
                    { label: "Vertex X", value: coord(entity.vertex.x) },
                    { label: "Vertex Y", value: coord(entity.vertex.y) },
                  ]
                : []),
              { label: "First X", value: coord(entity.first.x) },
              { label: "First Y", value: coord(entity.first.y) },
              { label: "Second X", value: coord(entity.second.x) },
              { label: "Second Y", value: coord(entity.second.y) },
            ],
          },
        ],
      }
    }
    case "hatch": {
      return {
        title: "Hatch",
        count: 1,
        groups: [
          {
            title: "Pattern",
            rows: [
              // The pattern name is a picker in AutoCAD's palette, not a number,
              // so it stays read-only until there is one here.
              { label: "Pattern", value: hatchPatternName(entity.patternId) },
              coordRow("Scale", "patternScale", entity.patternScale),
              angleRow(
                "Angle",
                "patternAngle",
                normalizeDegrees((entity.patternAngle * 180) / Math.PI)
              ),
              {
                label: "Boundaries",
                value: String(entity.loops.length),
              },
            ],
          },
        ],
      }
    }
    case "insert": {
      return {
        title: "Block reference",
        count: 1,
        groups: [
          {
            title: "Block",
            // The block is chosen when the reference is inserted; swapping one
            // for another is BREPLACE, not a palette row.
            rows: [
              { label: "Name", value: entity.blockId },
              coordRow("Scale", "insertScale", entity.scale),
              angleRow(
                "Rotation",
                "rotation",
                normalizeDegrees((entity.rotation * 180) / Math.PI)
              ),
            ],
          },
          {
            title: "Position",
            rows: [
              coordRow("X", "positionX", entity.position.x),
              coordRow("Y", "positionY", entity.position.y),
            ],
          },
        ],
      }
    }
  }
}

/** Justification names, as AutoCAD's Properties palette shows them. */
const JUSTIFY_LABELS: Record<TextJustify, string> = {
  left: "Left",
  center: "Center",
  right: "Right",
  middle: "Middle",
  tl: "Top left",
  tc: "Top center",
  tr: "Top right",
  ml: "Middle left",
  mc: "Middle center",
  mr: "Middle right",
  bl: "Bottom left",
  bc: "Bottom center",
  br: "Bottom right",
}

/** What the palette calls each dimension kind, as AutoCAD's Type row does. */
const DIMENSION_TYPE_LABELS: Record<DimensionKind, string> = {
  linear: "Linear",
  aligned: "Aligned",
  angular: "Angular",
  radius: "Radius",
  diameter: "Diameter",
}

const TYPE_LABELS: Record<EntityType, { one: string; many: string }> = {
  line: { one: "Line", many: "Lines" },
  circle: { one: "Circle", many: "Circles" },
  arc: { one: "Arc", many: "Arcs" },
  ellipse: { one: "Ellipse", many: "Ellipses" },
  polyline: { one: "Polyline", many: "Polylines" },
  text: { one: "Text", many: "Texts" },
  dimension: { one: "Dimension", many: "Dimensions" },
  hatch: { one: "Hatch", many: "Hatches" },
  insert: { one: "Block reference", many: "Block references" },
}

function multiEntityInfo(entities: ReadonlyArray<Entity>): SelectionInfo {
  const counts = new Map<EntityType, number>()
  for (const entity of entities) {
    counts.set(entity.type, (counts.get(entity.type) ?? 0) + 1)
  }

  const rows: PropertyRow[] = []
  for (const [type, count] of counts) {
    const labels = TYPE_LABELS[type]
    rows.push({
      label: count === 1 ? labels.one : labels.many,
      value: String(count),
    })
  }

  return {
    title: `${entities.length} objects`,
    count: entities.length,
    groups: [{ title: "Selection", rows }],
  }
}
