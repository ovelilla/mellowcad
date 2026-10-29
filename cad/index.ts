/**
 * Public entry point for the framework-agnostic CAD system: what a host needs
 * to drive the engine, render its state and name its data, and nothing else.
 * Every name here is a semver promise, so the tools, the commands, the
 * runtime's parts and the geometry kernel stay behind it; a name joins only
 * when a host has a use for it.
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
 * (`@mellowcad/engine/locales/es`). English is built in; any other is passed
 * explicitly (`new CadEngine(canvas, { locale: es })`), and `extendLocale`
 * lays a host's own words over one. Nothing else under `cad/` is public, and
 * `cad/entryPoints.test.ts` holds the app to that.
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
export {
  createLocalStorageDrawingStore,
  readSavedDrawingSummary,
} from "./adapters/localStorageDrawingStore"
export { createMemoryDrawingStore } from "./adapters/memoryDrawingStore"
export type {
  DrawingStore,
  FileTransport,
  Clipboard,
} from "./application/ports"

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
  ObjectType,
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
export type {
  CommandLineEntry,
  CommandLineEntryKind,
  CommandSuggestion,
} from "./application/CommandLine"
export type { SaveState } from "./application/Autosave"
export type { DynamicFieldKind } from "./application/input/DynamicInput"
export type { SnapModeType } from "./application/SnapMode"
export { SnapType } from "./application/snapping/types"
export { ConstraintType } from "./application/constraints/types"
export { VIEW_MENU, type ViewPreset } from "./application/tools/viewPresets"
export type {
  CompassLetter,
  ViewCubeFace,
  ViewCubePart,
  ViewCubeRoll,
  ViewCubeSide,
  ViewCubeUi,
} from "./application/viewCube"

export { matchCommands } from "./application/CommandLine"
export type { CommandInfo } from "./application/CommandLine"
export { commandCatalog } from "./application/commandCatalog"
export { engineText, type EngineText } from "./application/EngineText"
export type { EngineNames, PromptSegment } from "./application/EngineText"
export type {
  CommandCatalog,
  CommandName,
  EngineCatalog,
  EngineLocale,
  InterfaceCatalog,
} from "./locales/types"
export { extendLocale } from "./locales/extend"
export type { LocaleOverrides } from "./locales/extend"

export { CadDriver } from "./application/CadDriver"
export type {
  CadDriverOptions,
  PointerModifiers,
} from "./application/CadDriver"
export {
  DemoScript,
  demo,
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
export { buildDrawingPreview } from "./application/drawingPreview"
export type { DrawingPreviewOptions } from "./application/drawingPreview"

export type {
  Scene,
  ScenePrimitive,
  StrokeStyle,
  CameraTransform,
  TextAlign,
} from "./scene/types"
export { THEME } from "./scene/theme"

export type {
  EntityId,
  EntityType,
  Entity,
  EntityProperty,
  BlockDefinition,
  Bounds,
} from "./domain/entities"
export { entityDrawOrder } from "./domain/entities"
export {
  DEFAULT_LAYER_ID,
  INVALID_LAYER_NAME_CHARACTERS,
} from "./domain/layers"
export type { Layer, LayerId, LayerNameRefusal } from "./domain/layers"
export { STANDARD_COLORS, COLOR_BYLAYER, normalizeColor } from "./domain/colors"
export type { EntityColor, ColorDef } from "./domain/colors"
export { LINETYPES, LINETYPE_BYLAYER } from "./domain/linetypes"
export type { LinetypeId, LinetypeDef } from "./domain/linetypes"
export { HATCH_PATTERNS } from "./domain/hatchPatterns"
export type {
  HatchPatternId,
  HatchPatternDef,
  HatchPatternLine,
} from "./domain/hatchPatterns"
export {
  LINEWEIGHTS,
  LINEWEIGHT_BYLAYER,
  lineweightLabel,
  lineweightPixels,
} from "./domain/lineweights"
export type { Lineweight } from "./domain/lineweights"
export type { TextStyle, TextStyleId } from "./domain/textStyles"
export type { DimStyle, DimStyleId } from "./domain/dimStyles"
export {
  LengthUnit,
  LENGTH_UNITS,
  formatLength,
  formatAngle,
  unitsSampleOutput,
} from "./domain/units"
export type { Vec2 } from "./geometry/Vec2"
export type { Vec3 } from "./geometry/Vec3"
export type { DrawingSummary } from "./serialization/drawingSummary"
