import { Vec2 } from "../geometry/Vec2"
import { Vec3, sub3 } from "../geometry/Vec3"
import { isUpright, worldDirectionToUcs, worldPointToUcs } from "../domain/ucs"
import { ellipseAngleFromParam, normalizeDegrees } from "../geometry/primitives"
import {
  DocumentSettings,
  LengthUnit,
  formatAngle,
  formatLength,
  unitSuffix,
} from "../domain/units"
import {
  AttributeDefinitionEntity,
  BlockDefinition,
  BlockId,
  DimensionEntity,
  Entity,
  EntityId,
  EntityProperty,
  EntityType,
  MTextEntity,
  TextEntity,
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
  polylineArea,
  polylineLength,
  polylineSegments,
  splineArea,
  dimensionMeasurement,
  dimensionMeasurementUnit,
  entityElevation,
  entityNormal,
  entityPointToWorld,
  entityThickness,
  hasThickness,
  lineEndZ,
  lineLength3d,
  lineStartZ,
  mtextLinePitch,
  mtextPlainText,
  planeAxes,
} from "../domain/entities"
import { SnapType } from "./snapping/types"
import { SnapModeType } from "./SnapMode"
import {
  DynamicFieldKind,
  DynamicInputController,
  isContentField,
} from "./input/DynamicInput"
import { isCoordinateExpression } from "./input/coordinateInput"
import { CommandLineEntry, CommandSuggestion } from "./CommandLine"
import { SaveState } from "./Autosave"
import { EngineNames, EngineText, PromptSegment } from "./EngineText"
import { Layer, LayerId } from "../domain/layers"
import { EntityColor } from "../domain/colors"
import { LinetypeId } from "../domain/linetypes"
import { Lineweight } from "../domain/lineweights"
import { TextStyle, TextStyleId } from "../domain/textStyles"
import { DimStyle, DimStyleId } from "../domain/dimStyles"

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
  /** Stable across languages, unlike the label: a React key. */
  readonly id: string
  readonly label: string
  readonly value: string
  /** Present when the value can be retyped to change the geometry. */
  readonly edit?: PropertyEdit
}

/** A titled group of related properties (e.g. "Geometry"). */
export interface PropertyGroup {
  readonly id: string
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
  /** Rows of the palette's General section after its pickers (Thickness). */
  readonly general: ReadonlyArray<PropertyRow>
  readonly groups: ReadonlyArray<PropertyGroup>
}

/**
 * A keyword the running command offers, resolved into the command language:
 * AutoCAD's `[Close/Undo]`, one entry per word.
 */
export interface CommandOptionUi {
  /** The global keyword the tool receives, whatever was typed. */
  readonly id: string
  /** The word in the command language, its abbreviation in capitals. */
  readonly keyword: string
  readonly abbreviation: string
  /**
   * The key that runs it at once, or null when it must be typed and confirmed
   * (an abbreviation of several letters, or one another keyword starts with).
   */
  readonly key: string | null
  /** What the chip and the prompt show, e.g. `Close` or `Erase: Yes`. */
  readonly label: string
}

/** Snapshot of the command line (AutoCAD's `Command:` prompt) for the UI. */
export interface CommandLineUi {
  /** Whether the prompt is shown (AutoCAD's Ctrl+9 / our F2 toggle). */
  readonly visible: boolean
  /** Text before the input, e.g. `Command:` or `PLINE [Close/Undo]:`. */
  readonly prompt: string
  /**
   * The same prompt in spans, the keyword list set apart, so a host can style
   * it without taking the text apart.
   */
  readonly promptSegments: ReadonlyArray<PromptSegment>
  /** The running command's name as the prompt shows it; null at rest. */
  readonly command: string | null
  /** The neutral prompt, `Command:`, which also heads each echoed command. */
  readonly idlePrompt: string
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
  /**
   * The cursor as the status bar reads it: in the current UCS, on the
   * elevation plane (AutoCAD's COORDS shows X, Y and Z).
   */
  readonly cursorUcs: Vec3 | null
  readonly snap: { type: SnapType; point: Vec3 } | null
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
  readonly commandOptions: ReadonlyArray<CommandOptionUi>
  /** The command prompt: what is typed, what it suggests and what it logged. */
  readonly commandLine: CommandLineUi
  /**
   * The engine's vocabulary for a host's menus and pickers — object snaps,
   * colours, ByLayer, linetypes — in the interface language. The same object
   * until the language changes.
   */
  readonly names: EngineNames
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
    if (!hasStyleOf(entity, type)) continue
    counts.set(entity.styleId, (counts.get(entity.styleId) ?? 0) + 1)
  }
  return counts
}

/** Whether `entity` takes a style from the table `type` names. */
function hasStyleOf(
  entity: Entity,
  type: "text" | "dimension"
): entity is
  TextEntity | MTextEntity | AttributeDefinitionEntity | DimensionEntity {
  return type === "text"
    ? entity.type === "text" ||
        entity.type === "mtext" ||
        entity.type === "attdef"
    : entity.type === "dimension"
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
    if (!hasStyleOf(entity, type)) continue
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
  entities: ReadonlyArray<Entity>,
  text: EngineText
): SelectionCandidateUi[] {
  return entities.map((entity) => ({
    id: entity.id,
    label: text.entity(entity.type, 1),
  }))
}

/**
 * Presentation helpers: format the current dynamic-input session for the UI
 * (applying document units/precision). Kept apart from the runtime so
 * formatting policy never leaks into interaction logic.
 */
export function buildDynamicInputUi(
  controller: DynamicInputController,
  settings: DocumentSettings,
  text: EngineText
): DynamicInputUi | null {
  const session = controller.getSession()
  const screen = controller.getScreen()
  if (!session || !screen) return null

  const fields = session.fields.map((field) => {
    const live = controller.getLive(field.id)
    return {
      id: field.id,
      label:
        field.label ??
        (field.prompt === undefined ? "" : text.prompt(field.prompt)),
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
  const typeable = fields.filter((f) => !isContentField(f.kind))
  const coordinate =
    typeable.find((f) => isCoordinateExpression(f.value)) ??
    typeable.find((f) => f.kind === "coordinate")
  if (coordinate) {
    return {
      screen,
      fields: [
        {
          ...coordinate,
          // The box says what it currently accepts: a cartesian point (`X,Y`)
          // or a polar one (`Dist<Ang`).
          label: text.coordinateLabel(coordinate.value.includes("<")),
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
    case "paragraphs":
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
    case "paragraphs":
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
  settings: DocumentSettings,
  text: EngineText
): SelectionInfo | null {
  if (entities.length === 0) return null
  if (entities.length === 1) {
    return {
      ...singleEntityInfo(entities[0], settings, text),
      general: generalRows(entities[0], settings, text),
    }
  }
  return multiEntityInfo(entities, text)
}

type RowId = Parameters<EngineText["propertyRow"]>[0]
type GroupId = Parameters<EngineText["propertyGroup"]>[0]

/** Thickness, which AutoCAD lists under General for the types that have one. */
function generalRows(
  entity: Entity,
  settings: DocumentSettings,
  text: EngineText
): PropertyRow[] {
  if (!hasThickness(entity)) return []
  const thickness = formatLength(entityThickness(entity), settings)
  const unit = unitSuffix(settings.unit)
  return [
    {
      id: "thickness",
      label: text.propertyRow("thickness"),
      value: `${thickness} ${unit}`,
      edit: { property: "thickness", text: thickness, unit },
    },
  ]
}

function singleEntityInfo(
  entity: Entity,
  settings: DocumentSettings,
  text: EngineText
): Omit<SelectionInfo, "general"> {
  const length = (value: number) =>
    `${formatLength(value, settings)} ${unitSuffix(settings.unit)}`
  const area = (value: number) =>
    `${formatLength(value, settings)} ${unitSuffix(settings.unit)}²`
  const coord = (value: number) => formatLength(value, settings)
  const degrees = (value: number) => `${formatAngle(value, settings)}°`
  // Coordinates read in the current UCS, as AutoCAD's palette shows them:
  // where the point is in space, whatever plane its object lies in.
  const at = (point: Vec2) =>
    worldPointToUcs(settings.ucs, entityPointToWorld(entity, point))

  const group = (id: GroupId, rows: PropertyRow[]): PropertyGroup => ({
    id,
    title: text.propertyGroup(id),
    rows,
  })
  const row = (id: RowId, value: string): PropertyRow => ({
    id,
    label: text.propertyRow(id),
    value,
  })
  const lengthRow = (
    id: RowId,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    ...row(id, length(value)),
    edit: {
      property,
      text: formatLength(value, settings),
      unit: unitSuffix(settings.unit),
    },
  })
  const coordRow = (
    id: RowId,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    ...row(id, coord(value)),
    edit: { property, text: formatLength(value, settings), unit: "" },
  })
  const angleRow = (
    id: RowId,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    ...row(id, degrees(value)),
    edit: { property, text: formatAngle(value, settings), unit: "°" },
  })
  const title = (type: EntityType) => text.entity(type, 1)
  // An elevation along a normal of the object's own is its OCS one (DXF 38);
  // so is a level object's when the UCS is tilted, its plane then being no
  // height above the UCS's. Otherwise it is read above the UCS's XY plane.
  const planeRow = (id: RowId, property: EntityProperty) =>
    coordRow(
      id,
      property,
      planeAxes(entity) || !isUpright(settings.ucs)
        ? entityElevation(entity)
        : entityElevation(entity) - settings.ucs.origin.z
    )
  const planeRowAt = (property: EntityProperty, point: Vec2) =>
    coordRow("z", property, at(point).z)
  const normalRows = (): PropertyRow[] => {
    const normal = entityNormal(entity)
    return [
      row("normalX", coord(normal.x)),
      row("normalY", coord(normal.y)),
      row("normalZ", coord(normal.z)),
    ]
  }

  switch (entity.type) {
    case "line": {
      // Its ends by their own heights: a vertical line's plan cannot tell them apart.
      const start: Vec3 = { ...entity.start, z: lineStartZ(entity) }
      const end: Vec3 = { ...entity.end, z: lineEndZ(entity) }
      const from = worldPointToUcs(settings.ucs, start)
      const to = worldPointToUcs(settings.ucs, end)
      const delta = worldDirectionToUcs(settings.ucs, sub3(end, start))
      return {
        title: title("line"),
        count: 1,
        groups: [
          group("geometry", [
            lengthRow("length", "length", lineLength3d(entity)),
            angleRow("angle", "angle", lineAngleDegrees(entity)),
            row("deltaX", length(delta.x)),
            row("deltaY", length(delta.y)),
            // Read-only, like Delta X and Y: the ends are what is retyped.
            row("deltaZ", length(delta.z)),
          ]),
          group("endpoints", [
            coordRow("startX", "startX", from.x),
            coordRow("startY", "startY", from.y),
            coordRow("startZ", "startZ", from.z),
            coordRow("endX", "endX", to.x),
            coordRow("endY", "endY", to.y),
            coordRow("endZ", "endZ", to.z),
          ]),
        ],
      }
    }
    case "circle": {
      return {
        title: title("circle"),
        count: 1,
        groups: [
          group("geometry", [
            lengthRow("radius", "radius", entity.radius),
            lengthRow("diameter", "diameter", entity.radius * 2),
            row("circumference", length(circleCircumference(entity))),
            row("area", area(circleArea(entity))),
            ...normalRows(),
          ]),
          group("center", [
            coordRow("x", "centerX", at(entity.center).x),
            coordRow("y", "centerY", at(entity.center).y),
            coordRow("z", "centerZ", at(entity.center).z),
          ]),
        ],
      }
    }
    case "arc": {
      const deg = (radians: number) =>
        normalizeDegrees((radians * 180) / Math.PI)
      return {
        title: title("arc"),
        count: 1,
        groups: [
          group("geometry", [
            lengthRow("radius", "radius", entity.radius),
            row("length", length(arcLength(entity))),
            angleRow(
              "angle",
              "totalAngle",
              (arcSweepAngle(entity) * 180) / Math.PI
            ),
            angleRow("startAngle", "startAngle", deg(entity.startAngle)),
            angleRow("endAngle", "endAngle", deg(entity.endAngle)),
            ...normalRows(),
          ]),
          group("center", [
            coordRow("x", "centerX", at(entity.center).x),
            coordRow("y", "centerY", at(entity.center).y),
            coordRow("z", "centerZ", at(entity.center).z),
          ]),
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
        title: full ? title("ellipse") : text.propertyTitle("ellipticalArc"),
        count: 1,
        groups: [
          group("geometry", [
            lengthRow("majorRadius", "majorRadius", ellipseSemiMajor(entity)),
            lengthRow("minorRadius", "minorRadius", ellipseSemiMinor(entity)),
            // Derived from the two radii, so retyping it would be a third way
            // to say the same thing; AutoCAD's own ratio row is a gap here.
            row("radiusRatio", formatLength(entity.ratio, settings)),
            ...(full
              ? [row("area", area(ellipseArea(entity)))]
              : [
                  // Measured from the major axis, which is the frame the
                  // stored parameters live in.
                  row("startAngle", degrees(axisAngle(start))),
                  row("endAngle", degrees(axisAngle(start + sweep))),
                ]),
          ]),
          group("center", [
            coordRow("x", "centerX", at(entity.center).x),
            coordRow("y", "centerY", at(entity.center).y),
            coordRow("z", "centerZ", at(entity.center).z),
          ]),
        ],
      }
    }
    case "polyline": {
      return {
        title: title("polyline"),
        count: 1,
        groups: [
          group("geometry", [
            row("length", length(polylineLength(entity))),
            ...(entity.closed ? [row("area", area(polylineArea(entity)))] : []),
            row("vertices", String(entity.vertices.length)),
            row("segments", String(polylineSegments(entity).length)),
            row("closed", text.propertyValue(entity.closed ? "yes" : "no")),
            planeRow("elevation", "elevation"),
          ]),
        ],
      }
    }
    case "spline": {
      // Read-only: retyping the degree or closing it is SPLINEDIT's work, and
      // SPLINEDIT is not built.
      return {
        title: title("spline"),
        count: 1,
        groups: [
          group("misc", [
            row(
              "method",
              text.propertyValue(
                entity.method === "fit" ? "fitPoints" : "controlVertices"
              )
            ),
            row("degree", String(entity.degree)),
            ...(entity.method === "fit"
              ? [row("knotParameterization", text.propertyValue(entity.knots))]
              : []),
            row("closed", text.propertyValue(entity.closed ? "yes" : "no")),
            ...(entity.closed ? [row("area", area(splineArea(entity)))] : []),
          ]),
        ],
      }
    }
    case "text": {
      return {
        title: title("text"),
        count: 1,
        groups: [
          group("text", [
            // Editing the contents belongs to an in-place editor, not a
            // numeric field, so it stays read-only here. The style is a
            // picker in the palette's General section, not a row.
            row("contents", entity.value),
            row("justify", text.justify(entity.justify)),
            lengthRow("height", "textHeight", entity.height),
            angleRow(
              "rotation",
              "rotation",
              normalizeDegrees((entity.rotation * 180) / Math.PI)
            ),
          ]),
          group("position", [
            coordRow("x", "positionX", at(entity.position).x),
            coordRow("y", "positionY", at(entity.position).y),
            planeRowAt("positionZ", entity.position),
          ]),
        ],
      }
    }
    case "mtext": {
      return {
        title: title("mtext"),
        count: 1,
        groups: [
          group("text", [
            row("contents", mtextPlainText(entity.contents)),
            row("justify", text.justify(entity.attachment)),
            lengthRow("height", "textHeight", entity.height),
            angleRow(
              "rotation",
              "rotation",
              normalizeDegrees((entity.rotation * 180) / Math.PI)
            ),
            {
              ...row("lineSpaceFactor", `${entity.lineSpacingFactor}x`),
              edit: {
                property: "lineSpaceFactor",
                text: String(entity.lineSpacingFactor),
                unit: "x",
              },
            },
            lengthRow(
              "lineSpaceDistance",
              "lineSpaceDistance",
              mtextLinePitch(entity)
            ),
            row("lineSpaceStyle", text.propertyValue(entity.lineSpacingStyle)),
            lengthRow("definedWidth", "definedWidth", entity.width),
          ]),
          group("position", [
            coordRow("x", "positionX", at(entity.position).x),
            coordRow("y", "positionY", at(entity.position).y),
            planeRowAt("positionZ", entity.position),
          ]),
        ],
      }
    }
    case "attdef": {
      const yesNo = (value: boolean) => text.propertyValue(value ? "yes" : "no")
      return {
        title: title("attdef"),
        count: 1,
        groups: [
          group("text", [
            row("tag", entity.tag),
            row("prompt", entity.prompt),
            row("value", entity.value),
            row("justify", text.justify(entity.justify)),
            lengthRow("height", "textHeight", entity.height),
            angleRow(
              "rotation",
              "rotation",
              normalizeDegrees((entity.rotation * 180) / Math.PI)
            ),
          ]),
          group("position", [
            coordRow("x", "positionX", at(entity.position).x),
            coordRow("y", "positionY", at(entity.position).y),
            planeRowAt("positionZ", entity.position),
          ]),
          group("misc", [
            row("invisible", yesNo(entity.modes.invisible)),
            row("constant", yesNo(entity.modes.constant)),
            row("verify", yesNo(entity.modes.verify)),
            row("preset", yesNo(entity.modes.preset)),
            row("lockPosition", yesNo(entity.modes.lockPosition)),
          ]),
        ],
      }
    }
    case "dimension": {
      return {
        title: title("dimension"),
        count: 1,
        groups: [
          group("dimension", [
            // The measurement is derived from the definition points, so it is
            // read-only here exactly as it is in AutoCAD's palette.
            row(
              "measurement",
              dimensionMeasurementUnit(entity.kind) === "angle"
                ? degrees((dimensionMeasurement(entity) * 180) / Math.PI)
                : length(dimensionMeasurement(entity))
            ),
            row("textOverride", entity.text ?? text.propertyValue("none")),
            row("type", text.dimensionKind(entity.kind)),
            ...(entity.kind === "linear"
              ? [
                  angleRow(
                    "rotation",
                    "dimensionRotation",
                    normalizeDegrees((entity.rotation * 180) / Math.PI)
                  ),
                ]
              : []),
          ]),
          group("definitionPoints", [
            ...(entity.vertex
              ? [
                  row("vertexX", coord(at(entity.vertex).x)),
                  row("vertexY", coord(at(entity.vertex).y)),
                ]
              : []),
            row("firstX", coord(at(entity.first).x)),
            row("firstY", coord(at(entity.first).y)),
            row("secondX", coord(at(entity.second).x)),
            row("secondY", coord(at(entity.second).y)),
          ]),
        ],
      }
    }
    case "hatch": {
      return {
        title: title("hatch"),
        count: 1,
        groups: [
          group("pattern", [
            // The pattern name is a picker in AutoCAD's palette, not a number,
            // so it stays read-only until there is one here.
            row("pattern", text.hatchPattern(entity.patternId)),
            coordRow("scale", "patternScale", entity.patternScale),
            angleRow(
              "angle",
              "patternAngle",
              normalizeDegrees((entity.patternAngle * 180) / Math.PI)
            ),
            row("boundaries", String(entity.loops.length)),
          ]),
          group("geometry", [planeRow("elevation", "elevation")]),
        ],
      }
    }
    case "insert": {
      return {
        title: title("insert"),
        count: 1,
        groups: [
          // The block is chosen when the reference is inserted; swapping one
          // for another is BREPLACE, not a palette row.
          group("block", [
            row("name", entity.blockId),
            coordRow("scale", "insertScale", entity.scale),
            angleRow(
              "rotation",
              "rotation",
              normalizeDegrees((entity.rotation * 180) / Math.PI)
            ),
          ]),
          group("position", [
            coordRow("x", "positionX", at(entity.position).x),
            coordRow("y", "positionY", at(entity.position).y),
            planeRowAt("positionZ", entity.position),
          ]),
          ...(entity.attributes
            ? [
                // Labelled by tag, which is the drawing's data, as AutoCAD's
                // Attributes section is.
                group(
                  "attributes",
                  entity.attributes.map((attribute, index) => ({
                    id: `attribute-${index}`,
                    label: attribute.tag,
                    value: attribute.value,
                  }))
                ),
              ]
            : []),
        ],
      }
    }
  }
}

function multiEntityInfo(
  entities: ReadonlyArray<Entity>,
  text: EngineText
): SelectionInfo {
  const counts = new Map<EntityType, number>()
  for (const entity of entities) {
    counts.set(entity.type, (counts.get(entity.type) ?? 0) + 1)
  }

  const rows: PropertyRow[] = []
  for (const [type, count] of counts) {
    rows.push({
      id: type,
      label: text.entity(type, count),
      value: String(count),
    })
  }

  return {
    title: text.propertyTitle("objects", entities.length),
    count: entities.length,
    general: [],
    groups: [{ id: "selection", title: text.propertyGroup("selection"), rows }],
  }
}
