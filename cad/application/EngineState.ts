import { V, Vec2 } from "../geometry/Vec2"
import { Vec3, sub3 } from "../geometry/Vec3"
import { isUpright, worldDirectionToUcs, worldPointToUcs } from "../domain/ucs"
import { ellipseAngleFromParam, normalizeDegrees } from "../geometry/primitives"
import { axesToWorld } from "../geometry/ocs"
import {
  DocumentSettings,
  LengthUnit,
  formatAngle,
  formatLength,
  unitSuffix,
} from "../domain/units"
import {
  ArrayKind,
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
  arcEndPoint,
  arcLength,
  arcStartPoint,
  arcSweepAngle,
  circleArea,
  circleCircumference,
  ellipseEndPoint,
  ellipseMinorAxis,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseStartPoint,
  ellipseSweepParams,
  isFullEllipse,
  lineAngleDegrees,
  polylineArea,
  polylineLength,
  polyline3dLength,
  polylineSegments,
  polylineConstantWidth,
  polylineWidth,
  splineArea,
  entityAxes,
  isLevelSpline,
  splineDataPoints,
  dimensionGeometry,
  dimensionMeasurementText,
  entityElevation,
  entityNormal,
  entityPointToWorld,
  entityThickness,
  hasThickness,
  isAnonymousBlock,
  lineEndZ,
  lineLength3d,
  lineStartZ,
  mtextLinePitch,
  mtextPlainText,
  planeAxes,
  textInsertionPoint,
  insertReflects,
} from "../domain/entities"
import { objectArea } from "../domain/objectArea"
import type {
  ArrayParameters,
  BlockLookup,
  DimensionKind,
  InsertEntity,
} from "../domain/entities"
import {
  arrayPlacement,
  pathArrayCount,
  pathArraySpacing,
  placeArrayPoint,
  placedLength,
} from "../domain/arrayEdits"
import { polarAngleBetween } from "../domain/arrays"
import { SnapType } from "./snapping/types"
import { SnapModeType } from "./SnapMode"
import type { ViewPreset } from "./tools/viewPresets"
import type { ViewCubeUi } from "./viewCube"
import {
  DynamicFieldKind,
  DynamicInputController,
  isContentField,
} from "./input/DynamicInput"
import { isCoordinateExpression } from "./input/coordinateInput"
import { CommandLineEntry, CommandSuggestion } from "./CommandLine"
import { SaveState } from "./Autosave"
import { EngineNames, EngineText, PromptSegment } from "./EngineText"
import {
  compareLayerNames,
  DEFAULT_LAYER_COLOR,
  Layer,
  LayerId,
} from "../domain/layers"
import { EntityColor, STANDARD_COLORS } from "../domain/colors"
import { LinetypeId } from "../domain/linetypes"
import { Lineweight } from "../domain/lineweights"
import { TextStyle, TextStyleId } from "../domain/textStyles"
import { DEFAULT_DIM_STYLE, DimStyle, DimStyleId } from "../domain/dimStyles"

/** Which of the two style tables the manager is showing. */
export type StylesPanelTab = "dimension" | "text"

/** The palette panel's tabs, in their order. */
export const PALETTE_TABS = [
  "properties",
  "layers",
  "blocks",
  "styles",
] as const

export type PaletteTab = (typeof PALETTE_TABS)[number]

/**
 * The docked palette panel: which palette it shows and whether it is open or
 * folded to its strip. Modeless, as AutoCAD's palettes are: nothing on the
 * drawing closes it, only its own button, its tab's trigger or a CLOSE command.
 */
export interface PaletteUi {
  readonly open: boolean
  readonly tab: PaletteTab
}

/**
 * An object type of the Properties palette's drop-down: an entity's, but an
 * array is a type of its own, its kind's, apart from the block references
 * (`Array (Rectangular)`, desktop properties/d06-2).
 */
export type ObjectType =
  EntityType | `${ArrayKind}Array` | `${DimensionKind}Dimension`

/**
 * The type the Properties palette's drop-down files `entity` under: an array
 * by its kind, and a dimension by its kind, as AutoCAD's objects are of
 * different classes (`Rotated Dimension`, `Radial Dimension`, desktop d04).
 */
export function objectType(entity: Entity): ObjectType {
  if (entity.type === "insert" && entity.array)
    return `${entity.array.kind}Array`
  if (entity.type === "dimension") return `${entity.kind}Dimension`
  return entity.type
}

/** One entry of the Properties palette's object type drop-down. */
export interface PropertiesFilterOption {
  /** The type it narrows the palette to; null is All. */
  readonly type: ObjectType | null
  /** `All (6)`, `Line (5)`, `Array (Rectangular) (1)`. */
  readonly label: string
}

/**
 * What the Properties palette shows and edits: the selection, narrowed to one
 * object type when its drop-down picks one ("modify the properties of a single
 * object type at a time"). Every value is the narrowed objects'; the ribbon's
 * drop-downs read the whole selection (`selectionLayerId` and its siblings).
 */
export interface PropertiesUi {
  /**
   * The drop-down's entry: the type picked, the only type when the selection
   * has one, or null for All.
   */
  readonly filter: ObjectType | null
  /**
   * All first when the selection mixes types, then each type, most objects
   * first; empty with nothing selected.
   */
  readonly filters: ReadonlyArray<PropertiesFilterOption>
  /** Geometric properties of the objects edited, or null with nothing selected. */
  readonly info: SelectionInfo | null
  /** As `selectionLayerId`, over the objects edited. */
  readonly layerId: LayerId | null
  readonly color: EntityColor | "ByLayer" | null
  readonly linetype: LinetypeId | "ByLayer" | null
  readonly lineweight: Lineweight | "ByLayer" | null
  /** The style shared by every edited text object, else null. */
  readonly textStyleId: TextStyleId | null
  /** The style shared by every edited dimension, else null. */
  readonly dimStyleId: DimStyleId | null
}

/**
 * What a selection edit applies to: the whole selection (the ribbon's
 * drop-downs) or the objects the Properties palette's type filter leaves.
 */
export type SelectionScope = "selection" | "properties"

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
  /**
   * The dynamic prompt: the running command's question without its name,
   * `Specify first point:`; null when it names none. A line a command shows
   * above the question comes first, after it a `\n` (DIST's `Distance = …`).
   */
  readonly prompt: string | null
  readonly fields: ReadonlyArray<DynamicInputFieldUi>
  /**
   * How far below its place the box starts (CSS pixels): it clears the
   * tooltips the scene stacks under the cursor, a snap's name and Polar's
   * reading, which take AutoCAD's place there.
   */
  readonly clearance: number
}

/** Makes a property row typeable, the way AutoCAD's Properties palette is. */
export interface PropertyEdit {
  readonly property: EntityProperty
  /** Bare number to seed the input with (no unit). */
  readonly text: string
  /** Unit shown after the input, e.g. `mm` or `°`. */
  readonly unit: string
  /**
   * A value picked from a list (a polyline's Closed) rather than typed: each
   * choice's `value` is the text handed back, `text` the current one.
   */
  readonly choices?: ReadonlyArray<{
    readonly value: string
    readonly label: string
  }>
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
  /** What the chip and the prompt show, e.g. `Close` or `Erase: Yes`. */
  readonly label: string
}

/** Clean Screen: what it hides is the host's chrome, so the host hides it. */
export interface CleanScreenUi {
  /** CLEANSCREENSTATE: the tool palette, the palette panel and the ribbon hidden. */
  readonly active: boolean
  /** A palette was opened while it is on: the palette panel shows again. */
  readonly palette: boolean
}

/** Snapshot of the command line (AutoCAD's `Command:` prompt) for the UI. */
export interface CommandLineUi {
  /** Whether the prompt is shown (AutoCAD's Ctrl+9). */
  readonly visible: boolean
  /** Whether the command history is expanded above the prompt (F2). */
  readonly historyOpen: boolean
  /**
   * The temporary prompt history: the last lines of the most recent command,
   * shown above the one-line prompt (CLIPROMPTLINES, 3).
   */
  readonly recent: ReadonlyArray<CommandLineEntry>
  /**
   * Text before the input: `Command:`, the running command's name and its
   * question, `LINE Specify next point or [Undo]:`, or its name alone when
   * it names no question, `PLINE [Close/Undo]:`.
   */
  readonly prompt: string
  /**
   * The same prompt in spans, the keyword list set apart, so a host can style
   * it without taking the text apart.
   */
  readonly promptSegments: ReadonlyArray<PromptSegment>
  /** The running command's name as the prompt shows it; null at rest. */
  readonly command: string | null
  /**
   * The question alone, as the history writes it once answered —
   * `Specify next point or [Undo]:` — in spans; null when there is none.
   */
  readonly question: ReadonlyArray<PromptSegment> | null
  /** The neutral prompt, `Command:`, which also heads each echoed command. */
  readonly idlePrompt: string
  /** What the user has typed so far, whether on the canvas or in the box. */
  readonly buffer: string
  /**
   * Whether Space types a space after what is typed rather than answering:
   * a prompt whose answer holds spaces (UCS's names). Elsewhere the command
   * line's Space is Enter.
   */
  readonly takesSpaces: boolean
  /** Scrollback: commands echoed, results and errors. */
  readonly lines: ReadonlyArray<CommandLineEntry>
  /** Autocomplete matches for the current buffer; empty when nothing typed. */
  readonly suggestions: ReadonlyArray<CommandSuggestion>
  /**
   * The command language's BCP 47 tag, for the `lang` of whatever shows the
   * prompts — English on an Arabic page, whose command language is global.
   */
  readonly lang: string
}

/** One of the overlapping objects offered by selection cycling. */
export interface SelectionCandidateUi {
  readonly id: EntityId
  /** Object type, as AutoCAD's Selection list box names them ("Line"). */
  readonly label: string
}

/**
 * AutoCAD's rollover tooltip (ROLLOVERTIPS 1): the object under the cursor at
 * `Command:`, its type and its Color, Layer and Linetype (desktop d20).
 */
export interface RolloverUi {
  readonly id: EntityId
  /** Where the cursor stood as it came over the object, in canvas pixels. */
  readonly at: Vec2
  /** The object's type, as the palette titles it ("Line"). */
  readonly title: string
  /** Its colour's name (ByLayer, Red, or the colour as stored). */
  readonly color: string
  /** The colour it shows, for the swatch. */
  readonly swatch: string
  readonly layer: string
  readonly linetype: string
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

/**
 * AutoCAD's three shortcut menus of the drawing area (SHORTCUTMENU 11): Default
 * with no command and nothing selected, Edit with objects selected, Command
 * while a command offers options.
 */
export type ShortcutMenuMode = "default" | "edit" | "command"

/** A fixed entry of a shortcut menu; the host words it by this id. */
export type ShortcutMenuAction =
  | "repeat"
  | "cut"
  | "copy"
  | "copyBase"
  | "paste"
  | "undo"
  | "redo"
  | "pan"
  | "erase"
  | "move"
  | "copySelection"
  | "scale"
  | "rotate"
  | "deselectAll"
  | "properties"
  | "enter"
  | "cancel"

export type ShortcutMenuEntry =
  | { readonly kind: "action"; readonly action: ShortcutMenuAction }
  /** A keyword of the prompt, as its brackets show it. */
  | { readonly kind: "option"; readonly option: CommandOptionUi }
  | {
      readonly kind: "submenu"
      readonly submenu: "clipboard"
      readonly entries: ReadonlyArray<ShortcutMenuEntry>
    }
  /** Osnap Overrides: the object-snap menu Shift+right-click opens. */
  | { readonly kind: "snapOverrides" }
  /**
   * Dimension Style ▸ over a selection of dimensions: the table's styles, the
   * one they share marked (null when they differ).
   */
  | {
      readonly kind: "dimensionStyle"
      readonly styles: ReadonlyArray<{
        readonly id: DimStyleId
        readonly name: string
      }>
      readonly current: DimStyleId | null
    }

/** The shortcut menu a right-click opened on the drawing. */
export interface ShortcutMenuUi {
  readonly mode: ShortcutMenuMode
  /** Where it opened, in the canvas's pixels. */
  readonly at: Vec2
  /** Its entries in AutoCAD's order, in the groups a separator parts. */
  readonly groups: ReadonlyArray<ReadonlyArray<ShortcutMenuEntry>>
  /** The command Repeat runs, as the command line names it. */
  readonly repeat: string | null
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
   * The view the viewport control names: the preset the camera looks along
   * (in the WCS, as -VIEW sets it), or `null` for a custom view.
   */
  readonly view: { readonly preset: ViewPreset | null }
  /** The ViewCube, already projected for the current camera and UCS. */
  readonly viewCube: ViewCubeUi
  /**
   * The ViewCube's UCS menu: the current UCS (the WCS, a saved one by name, or
   * neither — `*NO NAME*`) and the saved UCSs it can restore.
   */
  readonly ucsMenu: {
    readonly world: boolean
    readonly name: string | null
    readonly named: readonly string[]
  }
  /**
   * The cursor as the status bar reads it: in the current UCS, on the
   * elevation plane (AutoCAD's COORDS shows X, Y and Z).
   */
  readonly cursorUcs: Vec3 | null
  /**
   * `cursorUcs` as the status bar writes it, `1.5000, 2.0039, 0.0000`: each
   * value at LUPREC, a zero unsigned (Absolute, COORDS 1).
   */
  readonly coordinates: string | null
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
  /** The shortcut menu a right-click opened, or null when it is closed. */
  readonly shortcutMenu: ShortcutMenuUi | null
  readonly orthoActive: boolean
  /** Polar tracking (AutoCAD's POLAR / F10) on/off. */
  readonly polarActive: boolean
  /** Polar tracking angle increment in degrees (e.g. 45). */
  readonly polarAngleStep: number
  readonly objectSnapTrackingActive: boolean
  readonly acquiredTrackingPoints: number
  /** Selection cycling: the badge, the candidate list and its settings. */
  readonly selectionCycling: SelectionCyclingUi
  /** The rollover tooltip, or null when the cursor is over no object at `Command:`. */
  readonly rollover: RolloverUi | null
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
  /** AUPREC: the decimal places angles are written with. */
  readonly documentAnglePrecision: number
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
  /** CECOLOR: the colour new objects take, a hex value or `"ByLayer"`. */
  readonly currentColor: EntityColor | "ByLayer"
  /** CELTYPE: the linetype new objects take, a linetype's id or `"ByLayer"`. */
  readonly currentLinetype: LinetypeId | "ByLayer"
  /** CELWEIGHT: the lineweight new objects take, in millimetres, or `"ByLayer"`. */
  readonly currentLineweight: Lineweight | "ByLayer"
  readonly canUndo: boolean
  readonly canRedo: boolean
  /** Transparent auto-save lifecycle, drives the save button's spinner. */
  readonly saveState: SaveState
  /** Epoch millis of the last successful auto-save, or null if never saved. */
  readonly lastSavedAt: number | null
  /** The Properties palette: its type filter and what it edits. */
  readonly properties: PropertiesUi
  /**
   * The layer shared by every selected entity, or null when the selection is
   * empty or spans multiple layers. Drives the ribbon's layer drop-down.
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
  /** Every dimension style with its usage count (the DIMSTYLE table). */
  readonly dimStyles: ReadonlyArray<DimStyleInfo>
  /** The style new dimensions are created with. */
  readonly currentDimStyleId: DimStyleId
  /** Which style table the Styles palette shows. */
  readonly stylesTable: StylesPanelTab
  /** Every block defined in the drawing (the Blocks palette's Current tab). */
  readonly blocks: ReadonlyArray<BlockInfo>
  /** The palette panel: open or folded, and the palette it shows. */
  readonly palette: PaletteUi
  /** Whether the Drawing Units dialog (UNITS) is showing. */
  readonly unitsDialog: boolean
  /**
   * The task dialog `Properties - Locked objects`, with how many objects on a
   * locked layer an edit left out of the selection, or null while it is not
   * showing (desktop properties/d03-6).
   */
  readonly lockedObjectsDialog: { readonly removed: number } | null
  /**
   * The task dialog `Multiline Text - Unsaved Changes`: Escape in MTEXT's
   * editor, or TEXTEDIT's on an MTEXT, found changes (desktop text/d05-5).
   * Answered with `answerUnsavedText`.
   */
  readonly unsavedTextDialog: boolean
  /** Clean Screen (CLEANSCREENON / CLEANSCREENOFF, Ctrl+0). */
  readonly cleanScreen: CleanScreenUi
  /**
   * Command options (keywords) the active tool currently offers — AutoCAD's
   * `[Close/Undo]` prompt. The UI renders these as hint chips near the dynamic
   * input; empty when the tool exposes none.
   */
  readonly commandOptions: ReadonlyArray<CommandOptionUi>
  /**
   * The dynamic prompt's option list, opened by the Down arrow: null while
   * shut. `marked` is the option Enter picks (AutoCAD's dot), the id of one of
   * `commandOptions`, or null before a second Down marks the first.
   */
  readonly commandOptionList: { readonly marked: string | null } | null
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
 * entities living on it, sorted by name as AutoCAD's Layer Properties
 * Manager and Layers drop-down list them (`compareLayerNames`).
 */
export function buildLayerInfos(
  layers: ReadonlyArray<Layer>,
  entities: ReadonlyArray<Entity>
): LayerInfo[] {
  const counts = new Map<LayerId, number>()
  for (const entity of entities) {
    counts.set(entity.layerId, (counts.get(entity.layerId) ?? 0) + 1)
  }
  return [...layers].sort(compareLayerNames).map((layer) => ({
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
  return blocks
    .filter((block) => !isAnonymousBlock(block.name))
    .map((block) => ({
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

/** The rollover tooltip of `entity`, worded in the interface language. */
export function buildRolloverUi(
  entity: Entity,
  at: Vec2,
  layers: ReadonlyArray<Layer>,
  text: EngineText
): RolloverUi {
  const names = text.names()
  const layer = layers.find((candidate) => candidate.id === entity.layerId)
  const standard = STANDARD_COLORS.find((color) => color.value === entity.color)
  return {
    id: entity.id,
    at,
    title: text.entityName(entity),
    color:
      entity.color === undefined
        ? names.byLayer
        : standard
          ? names.colors[standard.id]
          : entity.color,
    swatch: entity.color ?? layer?.color ?? DEFAULT_LAYER_COLOR,
    layer: layer?.name ?? "",
    linetype:
      entity.linetype === undefined
        ? names.byLayer
        : (names.linetypes[entity.linetype] ?? entity.linetype),
  }
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
    label: text.entityName(entity),
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
  text: EngineText,
  prompt: string | null = null,
  clearance = 0
): DynamicInputUi | null {
  const session = controller.getSession()
  const screen = controller.getScreen()
  if (!session || !screen) return null

  const fields = session.fields.map((field) => {
    const live = controller.getLive(field.id)
    const liveText = controller.getLiveText(field.id)
    return {
      id: field.id,
      label:
        field.label ??
        (field.prompt === undefined ? "" : text.prompt(field.prompt)),
      kind: field.kind,
      value: controller.getText(field.id),
      placeholder:
        liveText ??
        (live !== null ? formatFieldValue(field.kind, live, settings) : ""),
      unitSuffix:
        liveText !== null && controller.getText(field.id) === ""
          ? ""
          : fieldUnitSuffix(field.kind, settings),
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
      prompt,
      clearance,
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

  return { screen, prompt, clearance, fields }
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
    case "word":
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
    case "word":
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
  text: EngineText,
  vertex = 0,
  blocks?: BlockLookup,
  dimStyles?: (id: DimStyleId) => DimStyle | undefined
): SelectionInfo | null {
  if (entities.length === 0) return null
  if (entities.length === 1) {
    return {
      ...singleEntityInfo(
        entities[0],
        settings,
        text,
        vertex,
        blocks,
        dimStyles
      ),
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
  text: EngineText,
  vertex: number,
  blocks?: BlockLookup,
  dimStyles?: (id: DimStyleId) => DimStyle | undefined
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

  const countRow = (
    id: RowId,
    property: EntityProperty,
    value: number
  ): PropertyRow => ({
    ...row(id, String(value)),
    edit: { property, text: String(value), unit: "" },
  })
  const choiceRow = (
    id: RowId,
    property: EntityProperty,
    on: boolean,
    labels: readonly [off: string, on: string]
  ): PropertyRow => ({
    ...row(id, labels[on ? 1 : 0]),
    edit: {
      property,
      text: on ? "1" : "0",
      unit: "",
      choices: [
        { value: "0", label: labels[0] },
        { value: "1", label: labels[1] },
      ],
    },
  })
  const noYes = [text.propertyValue("no"), text.propertyValue("yes")] as const
  // An array's rows, as AutoCAD's palette shows them (desktop arrays/d13,
  // d07): no Block group; its base point read-only, moved alone by the
  // Base point option, which is not built (ARRAYS-D75); the rows of options
  // not built (Levels, a ring's or a path's Rows, Start offset, Fill entire
  // path) left out. Lengths in the drawing's units, the reference's scale in.
  const arrayGroups = (
    insert: InsertEntity,
    array: ArrayParameters
  ): PropertyGroup[] => {
    const place = arrayPlacement(insert, blocks?.(insert.blockId))
    const scaled = (value: number) => placedLength(place, value)
    const base = at(
      array.kind === "polar"
        ? placeArrayPoint(place, array.basePoint)
        : insert.position
    )
    const geometry: PropertyRow[] = [
      row("baseX", coord(base.x)),
      row("baseY", coord(base.y)),
      row("baseZ", coord(base.z)),
    ]
    switch (array.kind) {
      case "rectangular":
        return [
          group("geometry", geometry),
          group("misc", [
            countRow("columns", "arrayColumns", array.columns),
            lengthRow(
              "columnSpacing",
              "arrayColumnSpacing",
              scaled(array.colSpacing)
            ),
            countRow("rows", "arrayRows", array.rows),
            lengthRow(
              "rowSpacing",
              "arrayRowSpacing",
              scaled(array.rowSpacing)
            ),
            lengthRow(
              "rowElevationIncrement",
              "arrayRowElevation",
              scaled(array.rowElevation)
            ),
            // The angle between the columns and the rows, 90 while the grid
            // has no Axis Angle grip to skew it (ARRAYS-D75).
            row("includedAxisAngle", degrees(90)),
          ]),
        ]
      case "polar": {
        const center = at(placeArrayPoint(place, array.center))
        return [
          group("geometry", [
            ...geometry,
            row("centerX", coord(center.x)),
            row("centerY", coord(center.y)),
            row("centerZ", coord(center.z)),
            lengthRow(
              "radius",
              "radius",
              scaled(V.distance(array.basePoint, array.center))
            ),
          ]),
          group("misc", [
            choiceRow(
              "direction",
              "arrayClockwise",
              array.clockwise !== insertReflects(insert),
              [
                text.propertyValue("counterClockwise"),
                text.propertyValue("clockwise"),
              ]
            ),
            countRow("items", "arrayItems", array.items),
            angleRow(
              "angleBetweenItems",
              "arrayAngleBetween",
              polarAngleBetween(array)
            ),
            angleRow("fillAngle", "arrayFillAngle", array.fill),
            choiceRow("rotateItems", "arrayRotateItems", array.rotate, noYes),
          ]),
        ]
      }
      case "path": {
        const measure = array.method === "measure"
        const spacing = scaled(pathArraySpacing(array))
        return [
          group("geometry", [
            ...geometry,
            row("pathLength", length(scaled(array.path.length))),
          ]),
          group("misc", [
            choiceRow("method", "arrayMethod", measure, [
              text.propertyValue("divide"),
              text.propertyValue("measure"),
            ]),
            countRow("items", "arrayItems", pathArrayCount(array)),
            // Divide's spacing is its even share of the path, derived
            // (**unverified** whether AutoCAD's palette takes it there).
            measure
              ? lengthRow("itemSpacing", "arrayItemSpacing", spacing)
              : row("itemSpacing", length(spacing)),
            choiceRow("alignItems", "arrayAlignItems", array.align, noYes),
          ]),
        ]
      }
    }
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
          // AutoCAD's one Geometry group, in its order; the deltas, Length and
          // Angle are read-only, greyed there (desktop line/d16).
          group("geometry", [
            coordRow("startX", "startX", from.x),
            coordRow("startY", "startY", from.y),
            coordRow("startZ", "startZ", from.z),
            coordRow("endX", "endX", to.x),
            coordRow("endY", "endY", to.y),
            coordRow("endZ", "endZ", to.z),
            row("deltaX", length(delta.x)),
            row("deltaY", length(delta.y)),
            row("deltaZ", length(delta.z)),
            row("length", length(lineLength3d(entity))),
            row("angle", degrees(lineAngleDegrees(entity))),
          ]),
        ],
      }
    }
    case "circle": {
      const surface = circleArea(entity)
      return {
        title: title("circle"),
        count: 1,
        groups: [
          // AutoCAD's one Geometry group, in its order; Circumference and
          // Area set the radius, only the normal is greyed (desktop circle/d10).
          group("geometry", [
            coordRow("centerX", "centerX", at(entity.center).x),
            coordRow("centerY", "centerY", at(entity.center).y),
            coordRow("centerZ", "centerZ", at(entity.center).z),
            lengthRow("radius", "radius", entity.radius),
            lengthRow("diameter", "diameter", entity.radius * 2),
            lengthRow(
              "circumference",
              "circumference",
              circleCircumference(entity)
            ),
            {
              ...row("area", area(surface)),
              edit: {
                property: "area",
                text: formatLength(surface, settings),
                unit: `${unitSuffix(settings.unit)}²`,
              },
            },
            ...normalRows(),
          ]),
        ],
      }
    }
    case "arc": {
      const deg = (radians: number) =>
        normalizeDegrees((radians * 180) / Math.PI)
      const sweep = arcSweepAngle(entity)
      const start = at(arcStartPoint(entity))
      const end = at(arcEndPoint(entity))
      // The segment its chord closes: the sector less the triangle.
      const surface = (entity.radius ** 2 / 2) * (sweep - Math.sin(sweep))
      return {
        title: title("arc"),
        count: 1,
        groups: [
          // AutoCAD's one Geometry group, in its order; the ends, Total
          // angle, Arc length, Area and the normal greyed (desktop arc/d09).
          group("geometry", [
            row("startX", coord(start.x)),
            row("startY", coord(start.y)),
            row("startZ", coord(start.z)),
            coordRow("centerX", "centerX", at(entity.center).x),
            coordRow("centerY", "centerY", at(entity.center).y),
            coordRow("centerZ", "centerZ", at(entity.center).z),
            row("endX", coord(end.x)),
            row("endY", coord(end.y)),
            row("endZ", coord(end.z)),
            lengthRow("radius", "radius", entity.radius),
            angleRow("startAngle", "startAngle", deg(entity.startAngle)),
            angleRow("endAngle", "endAngle", deg(entity.endAngle)),
            row("totalAngle", degrees((sweep * 180) / Math.PI)),
            row("arcLength", length(arcLength(entity))),
            row("area", area(surface)),
            ...normalRows(),
          ]),
        ],
      }
    }
    case "ellipse": {
      const { start, sweep } = ellipseSweepParams(entity)
      const full = isFullEllipse(entity)
      const from = at(ellipseStartPoint(entity))
      const to = at(ellipseEndPoint(entity))
      // The axes as directions in the UCS, from the centre to their ends.
      const vector = (axis: Vec2) =>
        worldDirectionToUcs(
          settings.ucs,
          sub3(
            entityPointToWorld(entity, V.add(entity.center, axis)),
            entityPointToWorld(entity, entity.center)
          )
        )
      const major = vector(entity.majorAxis)
      const minor = vector(ellipseMinorAxis(entity))
      // Measured from the major axis, the frame the stored parameters live in.
      const axisAngle = (param: number) =>
        normalizeDegrees(
          (ellipseAngleFromParam(entity.ratio, param) * 180) / Math.PI
        )
      const surface = objectArea(entity)?.area ?? 0
      return {
        title: full ? title("ellipse") : text.propertyTitle("ellipticalArc"),
        count: 1,
        groups: [
          // AutoCAD's one Geometry group, for an ellipse and an arc alike, in
          // its order; the ends, the axis vectors and Area greyed (desktop
          // ellipse/d08). A whole ellipse's angles are read-only here: what
          // retyping one does there is unprobed.
          group("geometry", [
            row("startX", coord(from.x)),
            row("startY", coord(from.y)),
            row("startZ", coord(from.z)),
            coordRow("centerX", "centerX", at(entity.center).x),
            coordRow("centerY", "centerY", at(entity.center).y),
            coordRow("centerZ", "centerZ", at(entity.center).z),
            row("endX", coord(to.x)),
            row("endY", coord(to.y)),
            row("endZ", coord(to.z)),
            lengthRow("majorRadius", "majorRadius", ellipseSemiMajor(entity)),
            lengthRow("minorRadius", "minorRadius", ellipseSemiMinor(entity)),
            coordRow("radiusRatio", "radiusRatio", entity.ratio),
            ...(full
              ? [row("startAngle", degrees(0)), row("endAngle", degrees(360))]
              : [
                  angleRow("startAngle", "startAngle", axisAngle(start)),
                  angleRow("endAngle", "endAngle", axisAngle(start + sweep)),
                ]),
            row("majorAxisVectorX", coord(major.x + 0)),
            row("majorAxisVectorY", coord(major.y + 0)),
            row("majorAxisVectorZ", coord(major.z + 0)),
            row("minorAxisVectorX", coord(minor.x + 0)),
            row("minorAxisVectorY", coord(minor.y + 0)),
            row("minorAxisVectorZ", coord(minor.z + 0)),
            row("area", area(surface)),
          ]),
        ],
      }
    }
    case "polyline": {
      // AutoCAD's rows and groups (desktop pline/d08): the current vertex, its
      // point and the segment it starts; Area and Length read-only, greyed
      // there; Closed a Yes / No choice under Misc.
      const current = Math.min(vertex, entity.vertices.length - 1)
      const segments = polylineSegments(entity).length
      const [start, end] = polylineWidth(entity, current)
      const constant = polylineConstantWidth(entity)
      const yesNo = (closed: boolean) =>
        text.propertyValue(closed ? "yes" : "no")
      return {
        title: title("polyline"),
        count: 1,
        groups: [
          group("geometry", [
            {
              ...row("vertex", String(current + 1)),
              label: text.propertyRow("currentVertex"),
              edit: { property: "vertex", text: String(current + 1), unit: "" },
            },
            coordRow("vertexX", "vertexX", at(entity.vertices[current]).x),
            coordRow("vertexY", "vertexY", at(entity.vertices[current]).y),
            ...(current < segments
              ? [
                  lengthRow("startSegmentWidth", "startSegmentWidth", start),
                  lengthRow("endSegmentWidth", "endSegmentWidth", end),
                ]
              : []),
            // WHY blank where the widths vary: one value would be a lie
            // (**unverified** what AutoCAD's palette shows there).
            constant === null
              ? {
                  ...row("globalWidth", ""),
                  edit: {
                    property: "globalWidth",
                    text: "",
                    unit: unitSuffix(settings.unit),
                  },
                }
              : lengthRow("globalWidth", "globalWidth", constant),
            planeRow("elevation", "elevation"),
            // An open one's too, as if closed (d08: 104.8748 for an open one).
            row("area", area(polylineArea(entity))),
            row("length", length(polylineLength(entity))),
          ]),
          group("misc", [
            {
              ...row("closed", yesNo(entity.closed)),
              edit: {
                property: "closed",
                text: entity.closed ? "1" : "0",
                unit: "",
                choices: [
                  { value: "1", label: yesNo(true) },
                  { value: "0", label: yesNo(false) },
                ],
              },
            },
          ]),
        ],
      }
    }
    case "polyline3d": {
      // AutoCAD's rows (desktop 3dpoly/d02): the current vertex and its point,
      // Length in space read-only; Fit/Smooth (PEDIT's Spline, not built:
      // always None, read-only here) and Closed under Misc.
      const current = Math.min(vertex, entity.vertices.length - 1)
      const point = worldPointToUcs(settings.ucs, entity.vertices[current])
      const yesNo = (closed: boolean) =>
        text.propertyValue(closed ? "yes" : "no")
      return {
        title: title("polyline3d"),
        count: 1,
        groups: [
          group("geometry", [
            {
              ...row("vertex", String(current + 1)),
              label: text.propertyRow("currentVertex"),
              edit: { property: "vertex", text: String(current + 1), unit: "" },
            },
            coordRow("vertexX", "vertexX", point.x),
            coordRow("vertexY", "vertexY", point.y),
            coordRow("vertexZ", "vertexZ", point.z),
            row("length", length(polyline3dLength(entity))),
          ]),
          group("misc", [
            row("fitSmooth", text.propertyValue("fitNone")),
            {
              ...row("closed", yesNo(entity.closed)),
              edit: {
                property: "closed",
                text: entity.closed ? "1" : "0",
                unit: "",
                choices: [
                  { value: "1", label: yesNo(true) },
                  { value: "0", label: yesNo(false) },
                ],
              },
            },
          ]),
        ],
      }
    }
    case "spline": {
      // AutoCAD's two groups and rows, in its order (desktop spline/d10-1 to
      // d10-3). Only the current point moves, X, Y and Z, as a 3D polyline's
      // vertex does: the method, degree, knots, closure and frame are
      // SPLINEDIT's and CVSHOW's, not built; no toLerance and no weights are,
      // so Fit tolerance reads 0 and Weight −1, as d10 shows them.
      const fit = entity.method === "fit"
      const points = splineDataPoints(entity)
      const current = Math.min(vertex, points.length - 1)
      const point = at(points[current])
      const yesNo = (yes: boolean) => text.propertyValue(yes ? "yes" : "no")
      const axes = entityAxes(entity)
      const vector = (v: Vec3 | undefined) =>
        v
          ? worldDirectionToUcs(settings.ucs, axesToWorld(axes, v))
          : { x: 0, y: 0, z: 0 }
      const planar = isLevelSpline(entity)
      const tangentRows = (): PropertyRow[] => {
        const start = vector(entity.startTangent)
        const end = vector(entity.endTangent)
        return [
          row("startTangentVectorX", coord(start.x + 0)),
          row("startTangentVectorY", coord(start.y + 0)),
          row("startTangentVectorZ", coord(start.z + 0)),
          row("endTangentVectorX", coord(end.x + 0)),
          row("endTangentVectorY", coord(end.y + 0)),
          row("endTangentVectorZ", coord(end.z + 0)),
        ]
      }
      return {
        title: title("spline"),
        count: 1,
        groups: [
          group("dataPoints", [
            row(
              fit ? "numberOfFitPoints" : "numberOfControlPoints",
              String(points.length)
            ),
            {
              ...row(
                fit ? "currentFitPoint" : "currentControlPoint",
                String(current + 1)
              ),
              edit: { property: "vertex", text: String(current + 1), unit: "" },
            },
            coordRow(fit ? "fitPointX" : "controlPointX", "vertexX", point.x),
            coordRow(fit ? "fitPointY" : "controlPointY", "vertexY", point.y),
            coordRow(fit ? "fitPointZ" : "controlPointZ", "vertexZ", point.z),
            fit
              ? row("knotParameterization", text.propertyValue(entity.knots))
              : row("weight", "-1"),
            row("cvFrame", text.propertyValue("hide")),
          ]),
          group("misc", [
            row(
              "method",
              text.propertyValue(fit ? "fitPoints" : "controlVertices")
            ),
            row("degree", String(entity.degree)),
            row("closed", yesNo(entity.closed)),
            // A closed fit spline a file gave a closure tangent is not periodic.
            row("periodic", yesNo(entity.closed && !entity.startTangent)),
            row("planar", yesNo(planar)),
            ...(fit && !entity.closed ? tangentRows() : []),
            ...(fit ? [row("fitTolerance", coord(0))] : []),
            // One in no plane has no area (spline3d/s14).
            ...(entity.closed && planar
              ? [row("area", area(splineArea(entity)))]
              : []),
          ]),
        ],
      }
    }
    case "text": {
      // A justified text's point is its Text alignment, editable; Position
      // is then DXF 10, the baseline's left end, greyed (desktop text/d04-1).
      // A Left text shows Position alone, editable: whether AutoCAD greys
      // Text alignment rows for it was not seen.
      const justified = entity.justify !== "left"
      const insertion = at(textInsertionPoint(entity))
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
            ...(justified
              ? [
                  coordRow(
                    "textAlignmentX",
                    "positionX",
                    at(entity.position).x
                  ),
                  coordRow(
                    "textAlignmentY",
                    "positionY",
                    at(entity.position).y
                  ),
                  {
                    ...planeRowAt("positionZ", entity.position),
                    id: "textAlignmentZ",
                    label: text.propertyRow("textAlignmentZ"),
                  },
                ]
              : []),
          ]),
          group(
            "position",
            justified
              ? [
                  row("x", coord(insertion.x)),
                  row("y", coord(insertion.y)),
                  row("z", coord(insertion.z)),
                ]
              : [
                  coordRow("x", "positionX", at(entity.position).x),
                  coordRow("y", "positionY", at(entity.position).y),
                  planeRowAt("positionZ", entity.position),
                ]
          ),
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
            lengthRow("textHeight", "textHeight", entity.height),
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
      // AutoCAD's title per kind and its groups, with the rows the model has
      // (desktop d04-1 to d04-7); no definition point is a row there. The
      // style's values are read-only: an edit there is an override AutoCAD
      // keeps on the object, and overrides are not modelled (DIMS-D3). The Dim
      // style row is the General section's picker, as the text's style is.
      const style = dimStyles?.(entity.styleId) ?? DEFAULT_DIM_STYLE
      const g = dimensionGeometry(entity, style)
      const textAt = at(g.textPoint)
      const plain = (value: number) => String(Number(value.toFixed(8)))
      const radial = entity.kind === "radius" || entity.kind === "diameter"
      return {
        title: text.propertyTitle(`${entity.kind}Dimension`),
        count: 1,
        groups: [
          group("misc", [row("annotative", text.propertyValue("no"))]),
          group("linesArrows", [
            row("arrowSize", plain(style.arrowSize)),
            ...(radial ? [row("centerMarkSize", plain(style.centerMark))] : []),
            row("extLineExt", plain(style.extensionBeyond)),
            row("extLineOffset", plain(style.extensionOffset)),
          ]),
          group("text", [
            row("textHeight", plain(style.textHeight)),
            row("textOffset", plain(style.textGap)),
            coordRow("textPositionX", "textPositionX", textAt.x),
            coordRow("textPositionY", "textPositionY", textAt.y),
            angleRow(
              "textRotation",
              "dimensionTextRotation",
              normalizeDegrees(((entity.textAngle ?? 0) * 180) / Math.PI)
            ),
            // Derived from the definition points, so greyed in AutoCAD's
            // palette too; it reads as the dimension draws it (d04-2: `40`).
            row("measurement", dimensionMeasurementText(entity, style)),
            {
              ...row("textOverride", entity.text ?? ""),
              edit: {
                property: "dimensionText",
                text: entity.text ?? "",
                unit: "",
              },
            },
          ]),
          group("fit", [row("dimScaleOverall", plain(style.scale))]),
          group("primaryUnits", [
            row("decimalSeparator", style.decimalSeparator),
            row(
              "suppressTrailingZeros",
              text.propertyValue(style.suppressTrailingZeros ? "yes" : "no")
            ),
            row("precision", (0).toFixed(style.decimals)),
          ]),
        ],
      }
    }
    case "hatch": {
      // AutoCAD's rows for a predefined, non-associative hatch, in its order
      // (desktop hatch/d05-1). Spacing, ISO pen width, Double and Background
      // color, greyed there for a predefined pattern, are not built.
      const no = text.propertyValue("no")
      const surface = objectArea(entity)?.area ?? 0
      const origin = at(entity.origin)
      return {
        title: title("hatch"),
        count: 1,
        groups: [
          group("pattern", [
            row("type", text.propertyValue("predefined")),
            // The pattern name is a picker in AutoCAD's palette, not a number,
            // so it stays read-only until there is one here.
            row("patternName", text.hatchPattern(entity.patternId)),
            row("annotative", no),
            angleRow(
              "angle",
              "patternAngle",
              normalizeDegrees((entity.patternAngle * 180) / Math.PI)
            ),
            coordRow("scale", "patternScale", entity.patternScale),
            coordRow("originX", "originX", origin.x),
            coordRow("originY", "originY", origin.y),
            row("associative", no),
            row("islandDetectionStyle", text.propertyValue("outer")),
          ]),
          group("geometry", [
            planeRow("elevation", "elevation"),
            row("area", area(surface)),
            // One hatch: its own area (AutoCAD's sums a selection's).
            row("cumulativeArea", area(surface)),
          ]),
        ],
      }
    }
    case "insert": {
      if (entity.array) {
        return {
          title: text.entityName(entity),
          count: 1,
          groups: arrayGroups(entity, entity.array),
        }
      }
      // AutoCAD's sections and order (desktop blocks/d03-2, d03-3): Scale Z
      // is |X| here, never stored, so it reads but takes nothing; Annotative,
      // Block Unit and Unit factor are not built.
      const position = at(entity.position)
      return {
        title: text.entityName(entity),
        count: 1,
        groups: [
          group("geometry", [
            coordRow("positionX", "positionX", position.x),
            coordRow("positionY", "positionY", position.y),
            coordRow("positionZ", "positionZ", position.z),
            coordRow("scaleX", "insertScaleX", entity.scaleX),
            coordRow("scaleY", "insertScaleY", entity.scaleY),
            row("scaleZ", coord(Math.abs(entity.scaleX))),
          ]),
          // The block is chosen when the reference is inserted; swapping one
          // for another is BREPLACE, not a palette row.
          group("misc", [
            row("name", entity.blockId),
            angleRow(
              "rotation",
              "rotation",
              normalizeDegrees((entity.rotation * 180) / Math.PI)
            ),
          ]),
          ...(entity.attributes
            ? [
                // Labelled by tag, which is the drawing's data, as AutoCAD's
                // Attributes section is; read-only (ATTEDIT's Missing).
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
