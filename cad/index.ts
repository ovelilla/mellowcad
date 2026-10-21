/**
 * Public entry point for the framework-agnostic CAD system. Anything the React
 * layer (or any other host) needs is re-exported here so UI code never reaches
 * deep into internal folders.
 *
 * Layering (dependencies only point downwards):
 *
 *   adapters      → browser tech: canvas presenter, DOM events, localStorage
 *   application   → orchestration: runtime, tools, commands, snapping, aids
 *   scene         → neutral render description (display list)
 *   serialization → versioned drawing file format (plain data)
 *   domain        → CAD model: entities, document, units
 *   geometry      → pure math kernel
 *
 * The other public entry points are the languages, one module each
 * (`@/cad/locales/es`, tomorrow `@mellowcad/engine/locales/es`). English is
 * built in; any other is passed explicitly (`new CadEngine(canvas, { locale:
 * es })`), and `extendLocale` lays a host's own words over one. Nothing else
 * under `cad/` is public, and `cad/entryPoints.test.ts` holds the app to that.
 * How a language is shaped, and what a host may leave out, is in
 * `cad/README.md`.
 */

export { CadEngine } from "./adapters/CadEngine"
export type { CadEngineOptions } from "./adapters/CadEngine"
export { CanvasScenePresenter } from "./adapters/CanvasScenePresenter"
export {
  SvgScenePresenter,
  primitiveLength,
  themeCustomProperties,
  themePalette,
} from "./adapters/SvgScenePresenter"
export type {
  SvgDecorator,
  SvgDocumentOptions,
  SvgScenePresenterOptions,
} from "./adapters/SvgScenePresenter"
export { matchesWildcard } from "./shared/wildcard"
export { createBrowserFileTransport } from "./adapters/browserFileTransport"
export { createBrowserClipboard } from "./adapters/browserClipboard"
export {
  createLocalStorageDrawingStore,
  readSavedDrawingSummary,
} from "./adapters/localStorageDrawingStore"
export { createMemoryDrawingStore } from "./adapters/memoryDrawingStore"

export { CadRuntime } from "./application/CadRuntime"
export type {
  PointerEventData,
  WheelEventData,
  KeyEventData,
} from "./application/CadRuntime"
export type {
  EngineState,
  CommandOptionUi,
  DynamicInputUi,
  DynamicInputFieldUi,
  CommandLineUi,
  LayerInfo,
  TextStyleInfo,
  DimStyleInfo,
  BlockInfo,
  StylesPanelTab,
  PaletteTab,
  PaletteUi,
  CleanScreenUi,
  PropertiesUi,
  PropertiesFilterOption,
  SelectionScope,
  SelectionInfo,
  PropertyGroup,
  PropertyRow,
  PropertyEdit,
  RolloverUi,
  SelectionCandidateUi,
  SelectionCyclingUi,
  ShortcutMenuAction,
  ShortcutMenuEntry,
  ShortcutMenuMode,
  ShortcutMenuUi,
} from "./application/EngineState"
export { PALETTE_TABS } from "./application/EngineState"
export { TOOL_COMMANDS, matchCommands } from "./application/CommandLine"
export { EngineText, engineText } from "./application/EngineText"
export type {
  EngineNames,
  FeedbackId,
  FileErrorCode,
  MessageId,
  PromptSegment,
} from "./application/EngineText"
export type {
  CommandCatalog,
  CommandName,
  EngineCatalog,
  EngineLocale,
  InterfaceCatalog,
} from "./locales/types"
export { extendLocale } from "./locales/extend"
export type { LocaleOverrides } from "./locales/extend"
export type { CadRuntimeOptions } from "./application/CadRuntime"
export { commandCatalog } from "./application/commandCatalog"
export type {
  CommandDefinition,
  CommandInfo,
  CommandLineEntry,
  CommandLineEntryKind,
  CommandSuggestion,
} from "./application/CommandLine"
export type { SaveState } from "./application/Autosave"
export type {
  EngineHost,
  DrawingStore,
  FileTransport,
  Clipboard,
} from "./application/ports"

export { CadDriver, createRecordingHost } from "./application/CadDriver"
export type {
  CadDriverOptions,
  PointerModifiers,
  RecordingHost,
} from "./application/CadDriver"
export {
  DemoScript,
  demo,
  promptSegments,
  promptText,
  recordDemo,
  transcript,
} from "./application/DemoScript"
export type {
  DemoAction,
  DemoLayer,
  DemoOptions,
  DemoPrompt,
  DemoRecording,
  DemoStep,
  RecordOptions,
  TranscriptLine,
} from "./application/DemoScript"
export {
  buildDrawingPreview,
  previewCamera,
} from "./application/drawingPreview"
export type { DrawingPreviewOptions } from "./application/drawingPreview"

export { clipboardSnapshot, planPaste } from "./application/clipboard"
export { documentSnapshot } from "./application/runtimeFiles"
export type { PastePlan } from "./application/clipboard"

export { Viewport } from "./application/Viewport"
export type { Camera } from "./application/Viewport"
export { Selection } from "./application/Selection"
export { SnapMode } from "./application/SnapMode"
export type { SnapModeType } from "./application/SnapMode"
export { SelectionCycling } from "./application/SelectionCycling"

export { CommandHistory } from "./application/commands/Command"
export type { Command } from "./application/commands/Command"
export {
  AddEntityCommand,
  RemoveEntitiesCommand,
  ClearDocumentCommand,
} from "./application/commands/entityCommands"
export { CreateBlockCommand } from "./application/commands/blockCommands"

export { DynamicInputController } from "./application/input/DynamicInput"
export type {
  DynamicField,
  DynamicFieldKind,
  DynamicInputSession,
} from "./application/input/DynamicInput"
export {
  isCoordinateExpression,
  parseCoordinate,
} from "./application/input/coordinateInput"
export type { CoordinateContext } from "./application/input/coordinateInput"

export { SnapEngine } from "./application/snapping/SnapEngine"
export { SnapType } from "./application/snapping/types"
export type {
  SnapResult,
  SnapProvider,
  SnapCandidate,
} from "./application/snapping/types"

export { ConstraintManager } from "./application/constraints/ConstraintManager"
export { ConstraintType } from "./application/constraints/types"
export type {
  Constraint,
  ConstraintContext,
} from "./application/constraints/types"
export { OrthoConstraint } from "./application/constraints/OrthoConstraint"
export { PolarConstraint } from "./application/constraints/PolarConstraint"

export { ObjectSnapTrackingEngine } from "./application/tracking/ObjectSnapTrackingEngine"
export type {
  TrackingPoint,
  TrackingGuide,
  TrackingResult,
  TrackingHitKind,
  DrawingAidState,
} from "./application/tracking/types"

export type {
  Tool,
  ToolContext,
  ToolText,
  PointerInput,
  KeyInput,
  CommandOption,
  CommandOptionOutcome,
  ToolQuestion,
  RibbonMacro,
} from "./application/tools/Tool"
export { SelectTool } from "./application/tools/SelectTool"
export { LineTool } from "./application/tools/LineTool"
export { PolylineTool } from "./application/tools/PolylineTool"
export { CircleTool } from "./application/tools/CircleTool"
export type { CircleMode } from "./application/tools/CircleTool"
export { ArcTool } from "./application/tools/ArcTool"
export type { ArcMode } from "./application/tools/ArcTool"
export { EllipseTool } from "./application/tools/EllipseTool"
export type { EllipseMode } from "./application/tools/EllipseTool"
export { SplineTool } from "./application/tools/SplineTool"
export { RectangleTool } from "./application/tools/RectangleTool"
export { PolygonTool } from "./application/tools/PolygonTool"
export { HatchTool } from "./application/tools/HatchTool"
export { BlockTool } from "./application/tools/BlockTool"
export { InsertTool } from "./application/tools/InsertTool"
export { TextTool } from "./application/tools/TextTool"
export { MTextTool } from "./application/tools/MTextTool"
export { TextEditTool } from "./application/tools/TextEditTool"
export { DimensionTool } from "./application/tools/DimensionTool"
export {
  DimensionChainTool,
  type DimensionChainMode,
} from "./application/tools/DimensionChainTool"
export { DimSpaceTool } from "./application/tools/DimSpaceTool"
export {
  RadialDimensionTool,
  type RadialDimensionKind,
} from "./application/tools/RadialDimensionTool"
export { AngularDimensionTool } from "./application/tools/AngularDimensionTool"
export { lastDimension } from "./application/tools/lastDimension"
export { OffsetTool } from "./application/tools/OffsetTool"
export { MoveTool } from "./application/tools/MoveTool"
export { CopyTool } from "./application/tools/CopyTool"
export { RotateTool } from "./application/tools/RotateTool"
export { ScaleTool } from "./application/tools/ScaleTool"
export { MirrorTool } from "./application/tools/MirrorTool"
export { ArrayTool } from "./application/tools/ArrayTool"
export { ArrayPolarTool } from "./application/tools/ArrayPolarTool"
export { ArrayPathTool } from "./application/tools/ArrayPathTool"
export { EdgeEditTool } from "./application/tools/EdgeEditTool"
export { TrimTool } from "./application/tools/TrimTool"
export { ExtendTool } from "./application/tools/ExtendTool"
export { FilletTool } from "./application/tools/FilletTool"
export { ChamferTool } from "./application/tools/ChamferTool"
export { StretchTool } from "./application/tools/StretchTool"
export { SelectionActionTool } from "./application/tools/SelectionActionTool"
export { EraseTool } from "./application/tools/EraseTool"
export { ExplodeTool } from "./application/tools/ExplodeTool"
export { JoinTool } from "./application/tools/JoinTool"
export { BreakTool } from "./application/tools/BreakTool"
export type { BreakMode } from "./application/tools/BreakTool"
export { MatchPropTool } from "./application/tools/MatchPropTool"
export { CopyClipTool } from "./application/tools/CopyClipTool"
export type { ClipboardCopyMode } from "./application/tools/CopyClipTool"
export { PasteTool } from "./application/tools/PasteTool"
export { MeasureTool } from "./application/tools/MeasureTool"
export type { MeasureMode } from "./application/tools/MeasureTool"
export { IdTool } from "./application/tools/IdTool"
export { ZoomTool } from "./application/tools/ZoomTool"
export { PanTool } from "./application/tools/PanTool"
export { DashPanTool } from "./application/tools/DashPanTool"
export { UcsTool } from "./application/tools/UcsTool"
export {
  UcsIconTool,
  UcsIconVariableTool,
} from "./application/tools/UcsIconTool"
export { PlanTool } from "./application/tools/PlanTool"
export { ElevTool } from "./application/tools/ElevTool"
export { VPointTool } from "./application/tools/VPointTool"
export { ViewTool } from "./application/tools/ViewTool"
export { VIEW_MENU, type ViewPreset } from "./application/tools/viewPresets"
export { OrbitTool } from "./application/tools/OrbitTool"
export { NavVCubeTool } from "./application/tools/NavVCubeTool"
export { FillTool } from "./application/tools/FillTool"
export { LtScaleTool } from "./application/tools/LtScaleTool"
export { AuPrecTool } from "./application/tools/AuPrecTool"
export { SystemVariableTool } from "./application/tools/SystemVariableTool"
export { OsnapTool } from "./application/tools/OsnapTool"
export { ColorTool } from "./application/tools/ColorTool"
export { LinetypeTool } from "./application/tools/LinetypeTool"
export { LweightTool } from "./application/tools/LweightTool"
export {
  VIEW_CUBE_PARTS,
  type CompassLetter,
  type ViewCubeFace,
  type ViewCubePart,
  type ViewCubeRoll,
  type ViewCubeSide,
  type ViewCubeUi,
} from "./application/viewCube"

export type {
  Scene,
  ScenePrimitive,
  StrokeStyle,
  CameraTransform,
  TextAlign,
  TextBaseline,
} from "./scene/types"
export { THEME } from "./scene/theme"
export { buildScene } from "./application/SceneBuilder"
export type { SceneInput } from "./application/SceneBuilder"

export { CadDocument } from "./domain/Document"
export type { DocumentReader, DocumentTables } from "./domain/Document"
export * from "./domain/entities"
export {
  DEFAULT_LAYER_ID,
  DEFAULT_LAYER_COLOR,
  createLayer,
  createDefaultLayer,
  nextLayerId,
} from "./domain/layers"
export type { Layer, LayerId } from "./domain/layers"
export { STANDARD_COLORS, COLOR_BYLAYER, normalizeColor } from "./domain/colors"
export type { EntityColor, ColorDef } from "./domain/colors"
export {
  LINETYPES,
  DEFAULT_LINETYPE_ID,
  LINETYPE_BYLAYER,
  linetypePattern,
} from "./domain/linetypes"
export type { LinetypeId, LinetypeDef } from "./domain/linetypes"
export {
  HATCH_PATTERNS,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
  DEFAULT_HATCH_ANGLE,
  SOLID_HATCH_PATTERN_ID,
  hatchPattern,
  hatchPatternLines,
  isSolidHatchPattern,
  resolveHatchPatternId,
} from "./domain/hatchPatterns"
export type {
  HatchPatternId,
  HatchPatternDef,
  HatchPatternLine,
} from "./domain/hatchPatterns"
export {
  LINEWEIGHTS,
  DEFAULT_LINEWEIGHT,
  LINEWEIGHT_BYLAYER,
  clampLineweight,
  lineweightLabel,
  lineweightPixels,
} from "./domain/lineweights"
export type { Lineweight } from "./domain/lineweights"
export {
  DEFAULT_TEXT_STYLE_ID,
  DEFAULT_TEXT_HEIGHT,
  createTextStyle,
  createDefaultTextStyle,
} from "./domain/textStyles"
export type { TextStyle, TextStyleId } from "./domain/textStyles"
export {
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  angleDecimalsOf,
  clampDimStyle,
  createDimStyle,
  createDefaultDimStyle,
} from "./domain/dimStyles"
export type { DimStyle, DimStyleId } from "./domain/dimStyles"
export {
  LengthUnit,
  LENGTH_UNITS,
  DEFAULT_DOCUMENT_SETTINGS,
  formatLength,
  formatAngle,
  parseNumber,
  unitSuffix,
  unitsSampleOutput,
} from "./domain/units"
export type { DocumentSettings, UcsIconSetting } from "./domain/units"
export {
  WORLD_UCS,
  isWorldUcs,
  ucsPointToWorld,
  worldPointToUcs,
} from "./domain/ucs"
export type { NamedUcs, Ucs } from "./domain/ucs"

export { V, vec2 } from "./geometry/Vec2"
export type { Vec2 } from "./geometry/Vec2"
export * from "./geometry/primitives"

export {
  DRAWING_FILE_TYPE,
  DRAWING_FILE_VERSION,
  DRAWING_FILE_MIME_TYPE,
  DRAWING_FILE_ACCEPT,
  toDrawingFile,
  serializeDrawing,
  parseDrawingFile,
  DrawingFileError,
} from "./serialization/drawingFile"
export type {
  DrawingFileErrorCode,
  DrawingFile,
  DrawingSnapshot,
  ParsedDrawing,
} from "./serialization/drawingFile"
export {
  isBlankDrawing,
  summarizeDrawing,
} from "./serialization/drawingSummary"
export type { DrawingSummary } from "./serialization/drawingSummary"
export {
  CLIPBOARD_FILE_TYPE,
  CLIPBOARD_FILE_VERSION,
  serializeClipboard,
  parseClipboard,
} from "./serialization/clipboardFile"
export type { ClipboardFragment } from "./serialization/clipboardFile"
