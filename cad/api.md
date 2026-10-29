# @mellowcad/engine — API report

Written by `cad/api.test.ts`; a change to it is a change to the public API.

## .

```ts
export type { BlockDefinition }
export interface BlockDefinition {
    readonly id: BlockId;
    readonly name: string;
    readonly basePoint: Vec2;
    readonly baseElevation?: number;
    readonly entities: readonly Entity[];
}

export type { BlockInfo }
export interface BlockInfo {
    readonly id: BlockId;
    readonly name: string;
    readonly referenceCount: number;
}

export type { Bounds }
export interface Bounds {
    readonly min: Vec2;
    readonly max: Vec2;
}

export { buildDrawingPreview }
export declare function buildDrawingPreview(document: DocumentReader, options: DrawingPreviewOptions): Scene | null;

export { CadDriver }
export declare class CadDriver {
    constructor(options?: CadDriverOptions);
    dispose(): void;
    toScreen(world: WorldPoint): Vec2;
    toWorld(screen: Vec2): Vec2;
    moveTo(world: WorldPoint, modifiers?: PointerModifiers): this;
    click(world: WorldPoint, modifiers?: PointerModifiers): this;
    rightClick(world: WorldPoint, modifiers?: Omit<PointerModifiers, "button">): this;
    mouseDown(world: WorldPoint, modifiers?: PointerModifiers): this;
    mouseUp(world: WorldPoint, modifiers?: PointerModifiers): this;
    doubleClick(world: WorldPoint, modifiers?: PointerModifiers): this;
    drag(from: WorldPoint, to: WorldPoint, modifiers?: PointerModifiers): this;
    lasso(path: readonly WorldPoint[], modifiers?: PointerModifiers): this;
    wheel(world: WorldPoint, deltaY: number): this;
    press(key: string, modifiers?: Omit<PointerModifiers, "button">): boolean;
    release(key: string): this;
    hasFocusedField(): boolean;
    type(text: string, fieldId?: string): this;
    arrow(direction: "up" | "down"): this;
    enter(): this;
    escape(): this;
    option(id: string): this;
    optionAnswer(id: string): string;
    command(text: string): this;
    tool(id: string): this;
    activeToolId(): string;
    undo(): this;
    redo(): this;
    select(...ids: EntityId[]): this;
    selectAll(): this;
    selectedIds(): EntityId[];
    entities(): Entity[];
    get entityCount(): number;
    latest(): Entity;
    only<T extends Entity>(type: Entity["type"]): T;
    byId<T extends Entity>(id: EntityId): T;
    typeCounts(): Record<string, number>;
    state(): EngineState;
    scene(): Scene;
    optionAbbreviations(): string[];
    optionIds(): string[];
    commandLog(): string[];
}

export type { CadDriverOptions }
export interface CadDriverOptions {
    readonly width?: number;
    readonly height?: number;
    readonly entities?: readonly Entity[];
    readonly blocks?: readonly BlockDefinition[];
    readonly snap?: boolean;
    readonly polar?: boolean;
    readonly ucsIcon?: boolean;
    readonly store?: DrawingStore | null;
    readonly locale?: EngineLocale;
    readonly files?: FileTransport | null;
    readonly clipboard?: Clipboard | null;
}

export { CadEngine }
export declare class CadEngine {
    constructor(canvas: HTMLCanvasElement, options?: CadEngineOptions);
    subscribe(listener: Listener): () => void;
    getState(): EngineState;
    setLocale(locale: EngineLocale): void;
    setActiveTool(id: string): void;
    deleteSelection(): void;
    newDrawing(): void;
    undo(): void;
    redo(): void;
    runUndoMacro(): void;
    zoomIn(): void;
    zoomOut(): void;
    resetView(): void;
    zoomToFit(padding?: number): void;
    zoomToBounds(bounds: Bounds, padding?: number): void;
    zoomPrevious(): boolean;
    toggleSnap(): void;
    setSnapEnabled(type: SnapType, enabled: boolean): void;
    setSnapOverride(override: SnapType | "none"): void;
    closeSnapOverrideMenu(): void;
    closeShortcutMenu(): void;
    chooseShortcutMenuAction(action: ShortcutMenuAction): void;
    chooseShortcutMenuOption(id: string): void;
    chooseShortcutMenuDimStyle(id: string): void;
    toggleSelectionCycling(): void;
    setSelectionCyclingList(showList: boolean): void;
    setUcsIconShown(shown: boolean): void;
    chooseCyclingCandidate(id: EntityId): void;
    previewCyclingCandidate(id: EntityId): void;
    closeCyclingList(): void;
    toggleOrtho(): void;
    togglePolar(): void;
    setPolarAngleStep(step: number): void;
    choosePolarAngle(step: number): void;
    toggleObjectSnapTracking(): void;
    clearTracking(): void;
    toggleGrid(): void;
    toggleSnapMode(): void;
    setSnapModeType(type: SnapModeType): void;
    setSnapSpacing(x: number, y?: number): void;
    setSnapPolarDistance(distance: number): void;
    setConstraintEnabled(type: ConstraintType, enabled: boolean): void;
    createLayer(name?: string, color?: string, makeCurrent?: boolean): string;
    newLayer(like?: string): string;
    updateLayer(id: string, patch: Partial<Pick<Layer, "name" | "color" | "linetype" | "lineweight" | "visible" | "locked">>): LayerNameRefusal | null;
    setCurrentLayer(id: string, from?: "control" | "manager"): void;
    removeLayer(id: string): boolean;
    setSelectionLayer(id: string, scope?: SelectionScope): void;
    applyLayerControl(id: string): void;
    setSelectionColor(color: string, scope?: SelectionScope): void;
    startFrom(): boolean;
    setSelectionLinetype(linetype: string, scope?: SelectionScope): void;
    setSelectionLineweight(lineweight: number | "ByLayer", scope?: SelectionScope): void;
    setCurrentColor(color: string): void;
    setCurrentLinetype(linetype: string): void;
    setCurrentLineweight(lineweight: number | "ByLayer"): void;
    applyColorControl(color: string): void;
    applyLinetypeControl(linetype: string): void;
    applyLineweightControl(lineweight: number | "ByLayer"): void;
    setPropertiesFilter(type: ObjectType | null): void;
    setSelectionProperty(property: EntityProperty, text: string): boolean;
    setDynamicInputText(text: string, fieldId?: string): void;
    setActiveDynamicField(fieldId: string): void;
    commitDynamicInput(): void;
    invokeToolOption(input: string): boolean;
    cycleSnap(): boolean;
    dynamicOptionKey(key: string): boolean;
    cancelDynamicInput(): void;
    setCommandLineText(text: string): void;
    runCommand(name: string): boolean;
    applyViewPreset(preset: ViewPreset): boolean;
    navigate(command: "PAN" | "3DORBIT"): boolean;
    zoom(option: ZoomOption): boolean;
    viewCubePick(part: ViewCubePart): void;
    viewCubeRoll(turn: ViewCubeRoll): void;
    viewCubeAdjacent(side: ViewCubeSide): void;
    viewCubeHome(): void;
    setHomeFromCurrentView(): void;
    compassPick(letter: CompassLetter): void;
    viewCubeDrag(phase: "start" | "move" | "end", screen: Vec2, ring?: boolean): void;
    setViewCubeVisible(visible: boolean): void;
    restoreUcs(name: string | null): boolean;
    commandLineKey(key: string): boolean;
    toggleCommandLine(): void;
    toggleCommandHistory(): void;
    setCleanScreen(on: boolean): void;
    toggleCleanScreen(): void;
    clientFromScreen(screen: Vec2): Vec2;
    focusSurface(): void;
    mayTakeFocus(from: Element | null): boolean;
    setDocumentUnit(unit: LengthUnit): void;
    setDocumentPrecision(precision: number): void;
    applyDrawingUnits(unit: LengthUnit, precision: number): void;
    setLtScale(ltScale: number): void;
    setDimScale(scale: number): void;
    createDimStyle(name?: string, basedOn?: string, makeCurrent?: boolean): string;
    updateDimStyle(id: string, patch: Partial<Omit<DimStyle, "id">>): void;
    setCurrentDimStyle(id: string): void;
    removeDimStyle(id: string): boolean;
    setSelectionDimStyle(id: string): void;
    createTextStyle(name?: string, basedOn?: string, makeCurrent?: boolean): string;
    updateTextStyle(id: string, patch: Partial<Omit<TextStyle, "id">>): void;
    setCurrentTextStyle(id: string): void;
    removeTextStyle(id: string): boolean;
    setSelectionTextStyle(id: string): void;
    setStylesTable(table: StylesPanelTab): void;
    showPalette(tab: PaletteTab): void;
    closePalette(tab?: PaletteTab): void;
    togglePalette(tab: PaletteTab): void;
    setPaletteOpen(open: boolean): void;
    setUnitsDialog(open: boolean): void;
    openDrawingUnits(): void;
    openDrawingUnitsFromMenu(): void;
    runFileButton(bar: "quickAccess" | "applicationMenu", button: "new" | "open" | "save" | "saveAs"): void;
    closeLockedObjectsDialog(): void;
    answerUnsavedText(answer: "yes" | "no" | "cancel"): void;
    insertBlock(id: string): void;
    purgeBlocks(ids?: readonly string[]): number;
    buildBlockPreview(id: string, width: number, height: number): Scene | null;
    toggleLineweightDisplay(): void;
    serializeDrawing(): string;
    suggestedFileName(): string;
    loadDrawing(text: string): void;
    saveDrawingToFile(): void;
    openDrawingFromFile(): Promise<void>;
    pasteFromClipboard(): Promise<void>;
    selectAll(): void;
    dispose(): void;
}

export type { CadEngineOptions }
export interface CadEngineOptions {
    readonly store?: DrawingStore | null;
    readonly scope?: HTMLElement | "document";
    readonly locale?: EngineLocale;
    readonly paletteOpen?: boolean;
}

export type { CameraTransform }
export interface CameraTransform {
    readonly width: number;
    readonly height: number;
    readonly scale: number;
    readonly twist: number;
    readonly isPlan: boolean;
    worldToScreen(p: Vec2 | Vec3): Vec2;
    screenToWorld(p: Vec2): Vec2;
    worldToScreenDistance(distance: number): number;
}

export { CanvasScenePresenter }
export declare class CanvasScenePresenter {
    draw(ctx: CanvasRenderingContext2D, scene: Scene, dpr: number): void;
}

export type { CleanScreenUi }
export interface CleanScreenUi {
    readonly active: boolean;
    readonly palette: boolean;
}

export type { Clipboard }
export interface Clipboard {
    write(text: string): Promise<void>;
    read(): Promise<string | null>;
}

export { COLOR_BYLAYER }
export declare const COLOR_BYLAYER = "ByLayer";

export type { ColorDef }
export interface ColorDef {
    readonly value: EntityColor;
    readonly id: string;
}

export { commandCatalog }
export declare function commandCatalog(locale?: EngineLocale): CommandInfo[];

export type { CommandCatalog }
export type CommandCatalog = Compiled<Omit<Commands, "names" | "keywords" | "promptKeywords">> & {
    readonly names: {
        readonly [C in CommandName]: readonly string[];
    };
    readonly keywords?: {
        readonly [C in keyof Commands["keywords"]]?: {
            readonly [K in keyof Commands["keywords"][C]]?: string;
        };
    };
    readonly promptKeywords?: {
        readonly [P in keyof Commands["promptKeywords"]]?: {
            readonly [K in keyof Commands["promptKeywords"][P]]?: string;
        };
    };
};

export type { CommandInfo }
export interface CommandInfo {
    readonly id: string;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly description: string;
}

export type { CommandLineEntry }
export interface CommandLineEntry {
    readonly kind: CommandLineEntryKind;
    readonly text: string;
}

export type { CommandLineEntryKind }
export type CommandLineEntryKind = "command" | "prompt" | "info" | "error";

export type { CommandLineUi }
export interface CommandLineUi {
    readonly visible: boolean;
    readonly historyOpen: boolean;
    readonly recent: ReadonlyArray<CommandLineEntry>;
    readonly prompt: string;
    readonly promptSegments: ReadonlyArray<PromptSegment>;
    readonly command: string | null;
    readonly question: ReadonlyArray<PromptSegment> | null;
    readonly idlePrompt: string;
    readonly buffer: string;
    readonly takesSpaces: boolean;
    readonly lines: ReadonlyArray<CommandLineEntry>;
    readonly suggestions: ReadonlyArray<CommandSuggestion>;
    readonly lang: string;
}

export type { CommandName }
export type CommandName = keyof Commands["names"];

export type { CommandOptionUi }
export interface CommandOptionUi {
    readonly id: string;
    readonly keyword: string;
    readonly abbreviation: string;
    readonly label: string;
}

export type { CommandSuggestion }
export interface CommandSuggestion {
    readonly name: string;
    readonly description: string;
}

export type { CompassLetter }
export type CompassLetter = "N" | "E" | "S" | "W";

export { ConstraintType }
export declare enum ConstraintType {
    Ortho = "ortho",
    Polar = "polar"
}

export { createLocalStorageDrawingStore }
export declare function createLocalStorageDrawingStore(): DrawingStore | null;

export { createMemoryDrawingStore }
export declare function createMemoryDrawingStore(initial?: string | null): DrawingStore;

export { DEFAULT_LAYER_ID }
export declare const DEFAULT_LAYER_ID: LayerId;

export { demo }
export declare function demo(options?: DemoOptions): DemoScript;

export type { DemoAction }
export type DemoAction = {
    readonly kind: "command";
    readonly text: string;
} | {
    readonly kind: "type";
    readonly text: string;
} | {
    readonly kind: "enter";
} | {
    readonly kind: "escape";
} | {
    readonly kind: "option";
    readonly id: string;
} | {
    readonly kind: "click";
    readonly at: Vec2;
} | {
    readonly kind: "moveTo";
    readonly at: Vec2;
} | {
    readonly kind: "hover";
    readonly at: Vec2;
} | {
    readonly kind: "down";
    readonly at: Vec2;
} | {
    readonly kind: "up";
    readonly at: Vec2;
} | {
    readonly kind: "press";
    readonly key: string;
} | {
    readonly kind: "osnap";
    readonly type: SnapType;
} | {
    readonly kind: "layer";
    readonly name: string;
};

export type { DemoLayer }
export interface DemoLayer {
    readonly name: string;
    readonly color?: string;
    readonly linetype?: LinetypeId;
    readonly lineweight?: Lineweight;
}

export type { DemoOptions }
export interface DemoOptions {
    readonly width?: number;
    readonly height?: number;
    readonly snap?: boolean;
    readonly layers?: readonly DemoLayer[];
    readonly dimScale?: number;
    readonly polarAngle?: number;
    readonly view?: Bounds;
    readonly viewPadding?: number;
}

export type { DemoPrompt }
export interface DemoPrompt {
    readonly command: string | null;
    readonly field: string | null;
    readonly fieldKind: DynamicFieldKind | null;
    readonly options: readonly string[];
    readonly echo: readonly PromptSegment[] | null;
}

export type { DemoRecording }
export interface DemoRecording {
    readonly locale?: EngineLocale;
    readonly steps: readonly DemoStep[];
    readonly document: DocumentReader;
    readonly scene: Scene;
}

export { DemoScript }
export declare class DemoScript {
    readonly options: DemoOptions;
    readonly actions: readonly DemoAction[];
    static create(options?: DemoOptions): DemoScript;
    command(text: string): DemoScript;
    type(text: string): DemoScript;
    enter(): DemoScript;
    escape(): DemoScript;
    option(id: string): DemoScript;
    click(x: number, y: number): DemoScript;
    moveTo(x: number, y: number): DemoScript;
    hover(x: number, y: number): DemoScript;
    down(x: number, y: number): DemoScript;
    up(x: number, y: number): DemoScript;
    press(key: string): DemoScript;
    osnap(type: SnapType): DemoScript;
    layer(name: string): DemoScript;
}

export type { DemoStep }
export interface DemoStep {
    readonly action: DemoAction;
    readonly prompt: DemoPrompt;
    readonly answer?: string;
    readonly output: readonly CommandLineEntry[];
    readonly added: readonly EntityId[];
    readonly removed: readonly EntityId[];
}

export type { DimStyle }
export interface DimStyle {
    readonly id: DimStyleId;
    readonly name: string;
    readonly textHeight: number;
    readonly arrowSize: number;
    readonly extensionOffset: number;
    readonly extensionBeyond: number;
    readonly textGap: number;
    readonly baselineSpacing: number;
    readonly centerMark: number;
    readonly decimals: number;
    readonly angleDecimals: number;
    readonly decimalSeparator: string;
    readonly suppressTrailingZeros: boolean;
    readonly forceLineInside: boolean;
    readonly scale: number;
}

export type { DimStyleId }
export type DimStyleId = string;

export type { DimStyleInfo }
export interface DimStyleInfo extends DimStyle {
    readonly entityCount: number;
}

export type { DocumentReader }
export interface DocumentReader {
    readonly size: number;
    getSettings(): DocumentSettings;
    getEntities(): Entity[];
    get(id: EntityId): Entity | undefined;
    has(id: EntityId): boolean;
    pick(point: Vec2, tolerance: number): Entity | null;
    pickAll(point: Vec2, tolerance: number): Entity[];
    pickAllBy(distanceOf: (entity: Entity) => number, tolerance: number, locked?: boolean): Entity[];
    getLayers(): Layer[];
    getLayer(id: LayerId): Layer | undefined;
    getCurrentLayerId(): LayerId;
    getTextStyles(): TextStyle[];
    getTextStyle(id: TextStyleId): TextStyle | undefined;
    getCurrentTextStyleId(): TextStyleId;
    getDimStyles(): DimStyle[];
    getDimStyle(id: DimStyleId): DimStyle | undefined;
    getCurrentDimStyleId(): DimStyleId;
    getBlocks(): BlockDefinition[];
    getBlock(id: BlockId): BlockDefinition | undefined;
    blockLookup(): BlockLookup;
    resolveEntityColor(entity: Entity): string;
    resolveEntityLinetype(entity: Entity): LinetypeId;
    resolveEntityLineweight(entity: Entity): Lineweight;
    isEntityVisible(entity: Entity): boolean;
    isEntitySelectable(entity: Entity): boolean;
    isEntityEditable(entity: Entity): boolean;
}

export type { DrawingPreviewOptions }
export interface DrawingPreviewOptions {
    readonly width: number;
    readonly height: number;
    readonly padding?: number;
    readonly entities?: readonly Entity[];
    readonly frame?: Bounds;
    readonly lwDisplay?: boolean;
}

export type { DrawingStore }
export interface DrawingStore {
    read(): string | null;
    write(text: string): void;
}

export type { DrawingSummary }
export interface DrawingSummary {
    readonly objects: number;
    readonly layers: number;
}

export type { DynamicFieldKind }
export type DynamicFieldKind = "distance" | "length" | "angle" | "number" | "coordinate" | "text" | "word" | "paragraphs";

export type { DynamicInputFieldUi }
export interface DynamicInputFieldUi {
    readonly id: string;
    readonly label: string;
    readonly kind: DynamicFieldKind;
    readonly value: string;
    readonly placeholder: string;
    readonly unitSuffix: string;
    readonly active: boolean;
}

export type { DynamicInputUi }
export interface DynamicInputUi {
    readonly screen: Vec2;
    readonly prompt: string | null;
    readonly fields: ReadonlyArray<DynamicInputFieldUi>;
    readonly clearance: number;
}

export type { EngineCatalog }
export interface EngineCatalog {
    readonly tag: string;
    readonly interface: InterfaceCatalog;
    readonly commands: CommandCatalog;
}

export type { EngineLocale }
export interface EngineLocale {
    readonly tag: string;
    readonly interface: DeepPartial<InterfaceCatalog>;
    readonly commands?: DeepPartial<CommandCatalog>;
}

export type { EngineNames }
export interface EngineNames {
    readonly snaps: Readonly<Record<SnapType, string>>;
    readonly colors: Readonly<Record<string, string>>;
    readonly byLayer: string;
    readonly linetypes: Readonly<Record<string, string>>;
    readonly views: Readonly<Record<ViewPreset | "custom", string>>;
    readonly viewCubeFaces: Readonly<Record<ViewCubeFace, string>>;
    readonly compass: Readonly<Record<CompassLetter, string>>;
}

export type { EngineState }
export interface EngineState {
    readonly activeToolId: string;
    readonly tools: ReadonlyArray<{
        id: string;
        label: string;
        shortcut?: string;
    }>;
    readonly entityCount: number;
    readonly selectionCount: number;
    readonly scale: number;
    readonly view: {
        readonly preset: ViewPreset | null;
    };
    readonly viewCube: ViewCubeUi;
    readonly ucsMenu: {
        readonly world: boolean;
        readonly name: string | null;
        readonly named: readonly string[];
    };
    readonly cursorUcs: Vec3 | null;
    readonly coordinates: string | null;
    readonly snap: {
        type: SnapType;
        point: Vec3;
    } | null;
    readonly snapActive: boolean;
    readonly snapEnabled: Readonly<Record<SnapType, boolean>>;
    readonly snapOverride: SnapType | "none" | null;
    readonly snapOverrideMenu: Vec2 | null;
    readonly shortcutMenu: ShortcutMenuUi | null;
    readonly orthoActive: boolean;
    readonly polarActive: boolean;
    readonly polarAngleStep: number;
    readonly objectSnapTrackingActive: boolean;
    readonly acquiredTrackingPoints: number;
    readonly selectionCycling: SelectionCyclingUi;
    readonly rollover: RolloverUi | null;
    readonly gridVisible: boolean;
    readonly snapModeActive: boolean;
    readonly snapModeType: SnapModeType;
    readonly snapSpacing: Vec2;
    readonly snapPolarDistance: number;
    readonly dynamicInput: DynamicInputUi | null;
    readonly documentUnit: LengthUnit;
    readonly documentPrecision: number;
    readonly documentAnglePrecision: number;
    readonly ltScale: number;
    readonly dimScale: number;
    readonly lwDisplay: boolean;
    readonly layers: ReadonlyArray<LayerInfo>;
    readonly currentLayerId: LayerId;
    readonly currentColor: EntityColor | "ByLayer";
    readonly currentLinetype: LinetypeId | "ByLayer";
    readonly currentLineweight: Lineweight | "ByLayer";
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    readonly saveState: SaveState;
    readonly lastSavedAt: number | null;
    readonly properties: PropertiesUi;
    readonly selectionLayerId: LayerId | null;
    readonly selectionColor: EntityColor | "ByLayer" | null;
    readonly selectionLinetype: LinetypeId | "ByLayer" | null;
    readonly selectionLineweight: Lineweight | "ByLayer" | null;
    readonly textStyles: ReadonlyArray<TextStyleInfo>;
    readonly currentTextStyleId: TextStyleId;
    readonly dimStyles: ReadonlyArray<DimStyleInfo>;
    readonly currentDimStyleId: DimStyleId;
    readonly stylesTable: StylesPanelTab;
    readonly blocks: ReadonlyArray<BlockInfo>;
    readonly palette: PaletteUi;
    readonly unitsDialog: boolean;
    readonly lockedObjectsDialog: {
        readonly removed: number;
    } | null;
    readonly unsavedTextDialog: boolean;
    readonly cleanScreen: CleanScreenUi;
    readonly commandOptions: ReadonlyArray<CommandOptionUi>;
    readonly commandOptionList: {
        readonly marked: string | null;
    } | null;
    readonly commandLine: CommandLineUi;
    readonly names: EngineNames;
}

export { engineText }
export declare function engineText(locale?: EngineLocale): EngineText;

export type { EngineText }
export declare class EngineText {
    readonly locale: EngineLocale;
    readonly tag: string;
    readonly commandTag: string;
    constructor(locale?: EngineLocale);
    tool(id: string): string;
    description(command: string): string | null;
    entity(type: EntityType, count: number): string;
    entityName(entity: Entity): string;
    propertyTitle(id: keyof Property["title"], count?: number): string;
    propertiesFilter(type: ObjectType | null, count: number): string;
    propertyGroup(id: keyof Property["group"]): string;
    propertyRow(id: keyof Property["row"]): string;
    propertyValue(id: keyof Property["value"]): string;
    justify(justify: TextJustify): string;
    dimensionKind(kind: DimensionKind): string;
    hatchPattern(id: string): string;
    names(): EngineNames;
    commandNames(command: string): readonly string[];
    resolveCommand(text: string): string | null;
    keywords(command: string | null, ids: readonly string[], prompt?: PromptId | null): Keyword[];
    keyword(command: string | null, id: string, prompt?: PromptId | null): string;
    keywordLabel(command: string | null, id: string): string | null;
    abbreviation(command: string | null, id: string): string;
    prompt(id: PromptId, values?: MessageValues): string;
    message(id: MessageId, values?: MessageValues): string;
    fileError(code: FileErrorCode): string;
    feedback(id: FeedbackId, values?: MessageValues): string;
    snapFeedback(type: SnapType): string;
    hatchPatternListing(id: string): string;
    dimVariableListing(name: string, value: string | boolean): string;
    defaultLayerName(n: number): string;
    defaultTextStyleName(n: number): string;
    copyName(name: string): string;
    fileName(date: string): string;
    coordinateLabel(polar: boolean): string;
    optionValue(keyword: string, value: string): string;
    keywordList(words: readonly string[]): string;
    keywordOr(): string;
    idleHead(): string;
    idlePrompt(): string;
    commandQuestion(command: string, question: string): string;
    transparentCommand(command: string): string;
    transparentPrompt(question: string): string;
    snapOverride(snap: string, to: boolean | null): string;
    answered(prompt: string, answer: string): string;
    composePrompt(head: string, keywords: readonly string[], fallback?: string | null, form?: PromptForm): PromptSegment[];
}

export type { Entity }
export type Entity = LineEntity | CircleEntity | ArcEntity | EllipseEntity | SplineEntity | PolylineEntity | TextEntity | MTextEntity | AttributeDefinitionEntity | DimensionEntity | HatchEntity | InsertEntity;

export type { EntityColor }
export type EntityColor = string;

export { entityDrawOrder }
export declare function entityDrawOrder(entity: Entity): number;

export type { EntityId }
export type EntityId = string;

export type { EntityProperty }
export type EntityProperty = "startX" | "startY" | "endX" | "endY" | "radius" | "diameter" | "circumference" | "area" | "majorRadius" | "minorRadius" | "radiusRatio" | "centerX" | "centerY" | "startAngle" | "endAngle" | "totalAngle" | "positionX" | "positionY" | "textHeight" | "rotation" | "definedWidth" | "lineSpaceFactor" | "lineSpaceDistance" | "dimensionRotation" | "dimensionTextRotation" | "textPositionX" | "textPositionY" | "dimensionText" | "patternScale" | "patternAngle" | "originX" | "originY" | "insertScaleX" | "insertScaleY" | "vertex" | "vertexX" | "vertexY" | "startSegmentWidth" | "endSegmentWidth" | "globalWidth" | "closed" | "arrayColumns" | "arrayColumnSpacing" | "arrayRows" | "arrayRowSpacing" | "arrayRowElevation" | "arrayClockwise" | "arrayItems" | "arrayAngleBetween" | "arrayFillAngle" | "arrayRotateItems" | "arrayMethod" | "arrayItemSpacing" | "arrayAlignItems" | ZProperty;

export type { EntityType }
export type EntityType = "line" | "circle" | "arc" | "ellipse" | "spline" | "polyline" | "text" | "mtext" | "attdef" | "dimension" | "hatch" | "insert";

export { extendLocale }
export declare function extendLocale(base: EngineLocale, overrides: LocaleOverrides): EngineLocale;

export type { FileTransport }
export interface FileTransport {
    save(text: string, fileName: string): void;
    open(): Promise<string | null>;
}

export { formatAngle }
export declare function formatAngle(degrees: number, settings: DocumentSettings): string;

export { formatLength }
export declare function formatLength(value: number, settings: DocumentSettings): string;

export { HATCH_PATTERNS }
export declare const HATCH_PATTERNS: readonly HatchPatternDef[];

export type { HatchPatternDef }
export interface HatchPatternDef {
    readonly id: HatchPatternId;
    readonly lines: readonly HatchPatternLine[];
}

export type { HatchPatternId }
export type HatchPatternId = string;

export type { HatchPatternLine }
export interface HatchPatternLine {
    readonly angle: number;
    readonly origin: Vec2;
    readonly deltaX: number;
    readonly deltaY: number;
    readonly dashes: readonly number[];
}

export type { InterfaceCatalog }
export type InterfaceCatalog = Omit<Compiled<Source["interface"]>, "linetype" | "hatchPattern"> & {
    readonly linetype: Partial<Compiled<Source["interface"]["linetype"]>>;
    readonly hatchPattern: Partial<Compiled<Source["interface"]["hatchPattern"]>>;
};

export { INVALID_LAYER_NAME_CHARACTERS }
export declare const INVALID_LAYER_NAME_CHARACTERS = "<>/\\\":;?*|,=`";

export type { Layer }
export interface Layer {
    readonly id: LayerId;
    readonly name: string;
    readonly color: string;
    readonly linetype: LinetypeId;
    readonly lineweight: Lineweight;
    readonly visible: boolean;
    readonly locked: boolean;
}

export type { LayerId }
export type LayerId = string;

export type { LayerInfo }
export interface LayerInfo extends Layer {
    readonly entityCount: number;
}

export type { LayerNameRefusal }
export type LayerNameRefusal = "base" | "inUse" | "invalid";

export { LENGTH_PRECISIONS }
export declare const LENGTH_PRECISIONS: readonly string[];

export { LENGTH_UNITS }
export declare const LENGTH_UNITS: LengthUnit[];

export { LengthUnit }
export declare enum LengthUnit {
    Millimeter = "mm",
    Centimeter = "cm",
    Meter = "m"
}

export { LINETYPE_BYLAYER }
export declare const LINETYPE_BYLAYER = "ByLayer";

export type { LinetypeDef }
export interface LinetypeDef {
    readonly id: LinetypeId;
    readonly pattern: readonly number[];
}

export type { LinetypeId }
export type LinetypeId = string;

export { LINETYPES }
export declare const LINETYPES: readonly LinetypeDef[];

export type { Lineweight }
export type Lineweight = number;

export { LINEWEIGHT_BYLAYER }
export declare const LINEWEIGHT_BYLAYER = "ByLayer";

export { lineweightLabel }
export declare function lineweightLabel(lineweight: Lineweight): string;

export { lineweightPixels }
export declare function lineweightPixels(lineweight: Lineweight, minimum: number): number;

export { LINEWEIGHTS }
export declare const LINEWEIGHTS: readonly Lineweight[];

export type { LocaleOverrides }
export interface LocaleOverrides {
    readonly interface?: DeepPartial<InterfaceCatalog>;
    readonly commands?: DeepPartial<CommandCatalog>;
}

export { matchCommands }
export declare function matchCommands(commands: readonly Pick<CommandInfo, "name" | "aliases" | "description">[], text: string, limit?: number): CommandSuggestion[];

export { matchesWildcard }
export declare function matchesWildcard(name: string, pattern: string): boolean;

export { normalizeColor }
export declare function normalizeColor(value: string): EntityColor | null;

export type { ObjectType }
export type ObjectType = EntityType | `${ArrayKind}Array` | `${DimensionKind}Dimension`;

export { PALETTE_TABS }
export declare const PALETTE_TABS: readonly [
    "properties",
    "layers",
    "blocks",
    "styles"
];

export type { PaletteTab }
export type PaletteTab = (typeof PALETTE_TABS)[number];

export type { PaletteUi }
export interface PaletteUi {
    readonly open: boolean;
    readonly tab: PaletteTab;
}

export type { PointerModifiers }
export interface PointerModifiers {
    readonly shiftKey?: boolean;
    readonly ctrlKey?: boolean;
    readonly altKey?: boolean;
    readonly button?: number;
}

export { POLAR_ANGLE_MENU }
export declare const POLAR_ANGLE_MENU: readonly {
    readonly step: number;
    readonly label: string;
}[];

export { primitiveLength }
export declare function primitiveLength(p: ScenePrimitive): number;

export type { PromptSegment }
export interface PromptSegment {
    readonly text: string;
    readonly keywords: boolean;
}

export type { PropertiesFilterOption }
export interface PropertiesFilterOption {
    readonly type: ObjectType | null;
    readonly label: string;
}

export type { PropertiesUi }
export interface PropertiesUi {
    readonly filter: ObjectType | null;
    readonly filters: ReadonlyArray<PropertiesFilterOption>;
    readonly info: SelectionInfo | null;
    readonly layerId: LayerId | null;
    readonly color: EntityColor | "ByLayer" | null;
    readonly linetype: LinetypeId | "ByLayer" | null;
    readonly lineweight: Lineweight | "ByLayer" | null;
    readonly textStyleId: TextStyleId | null;
    readonly dimStyleId: DimStyleId | null;
}

export type { PropertyEdit }
export interface PropertyEdit {
    readonly property: EntityProperty;
    readonly text: string;
    readonly unit: string;
    readonly choices?: ReadonlyArray<{
        readonly value: string;
        readonly label: string;
    }>;
}

export type { PropertyGroup }
export interface PropertyGroup {
    readonly id: string;
    readonly title: string;
    readonly rows: ReadonlyArray<PropertyRow>;
}

export type { PropertyRow }
export interface PropertyRow {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly edit?: PropertyEdit;
}

export { readSavedDrawingSummary }
export declare function readSavedDrawingSummary(): DrawingSummary | null;

export { recordDemo }
export declare function recordDemo(script: DemoScript, { locale }?: RecordOptions): Promise<DemoRecording>;

export type { RecordOptions }
export interface RecordOptions {
    readonly locale?: EngineLocale;
}

export type { RolloverUi }
export interface RolloverUi {
    readonly id: EntityId;
    readonly at: Vec2;
    readonly title: string;
    readonly color: string;
    readonly swatch: string;
    readonly layer: string;
    readonly linetype: string;
}

export type { SaveState }
export type SaveState = "idle" | "saving" | "saved";

export type { Scene }
export interface Scene {
    readonly width: number;
    readonly height: number;
    readonly background: string;
    readonly primitives: readonly ScenePrimitive[];
    readonly lang?: string;
}

export type { ScenePrimitive }
export type ScenePrimitive = {
    readonly kind: "segment";
    readonly a: Vec2;
    readonly b: Vec2;
    readonly stroke: StrokeStyle;
} | {
    readonly kind: "circle";
    readonly center: Vec2;
    readonly radius: number;
    readonly stroke?: StrokeStyle;
    readonly fill?: string;
} | {
    readonly kind: "arc";
    readonly center: Vec2;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly counterclockwise: boolean;
    readonly stroke: StrokeStyle;
} | {
    readonly kind: "ellipse";
    readonly center: Vec2;
    readonly radiusX: number;
    readonly radiusY: number;
    readonly rotation: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly counterclockwise: boolean;
    readonly stroke: StrokeStyle;
} | {
    readonly kind: "rect";
    readonly min: Vec2;
    readonly width: number;
    readonly height: number;
    readonly stroke?: StrokeStyle;
    readonly fill?: string;
} | {
    readonly kind: "path";
    readonly points: readonly Vec2[];
    readonly closed?: boolean;
    readonly subpaths?: readonly (readonly Vec2[])[];
    readonly stroke?: StrokeStyle;
    readonly fill?: string;
} | {
    readonly kind: "label";
    readonly at: Vec2;
    readonly text: string;
    readonly color: string;
    readonly font?: string;
} | {
    readonly kind: "text";
    readonly at: Vec2;
    readonly text: string;
    readonly height: number;
    readonly rotation: number;
    readonly matrix?: readonly [
        number,
        number,
        number,
        number
    ];
    readonly align: TextAlign;
    readonly color: string;
    readonly font?: string;
};

export type { SelectionCandidateUi }
export interface SelectionCandidateUi {
    readonly id: EntityId;
    readonly label: string;
}

export type { SelectionCyclingUi }
export interface SelectionCyclingUi {
    readonly active: boolean;
    readonly showList: boolean;
    readonly candidates: ReadonlyArray<SelectionCandidateUi>;
    readonly currentId: EntityId | null;
    readonly listAt: Vec2 | null;
}

export type { SelectionInfo }
export interface SelectionInfo {
    readonly title: string;
    readonly count: number;
    readonly general: ReadonlyArray<PropertyRow>;
    readonly groups: ReadonlyArray<PropertyGroup>;
}

export type { SelectionScope }
export type SelectionScope = "selection" | "properties";

export type { ShortcutMenuAction }
export type ShortcutMenuAction = "repeat" | "cut" | "copy" | "copyBase" | "paste" | "undo" | "redo" | "pan" | "erase" | "move" | "copySelection" | "scale" | "rotate" | "deselectAll" | "properties" | "enter" | "cancel";

export type { ShortcutMenuEntry }
export type ShortcutMenuEntry = {
    readonly kind: "action";
    readonly action: ShortcutMenuAction;
} | {
    readonly kind: "option";
    readonly option: CommandOptionUi;
} | {
    readonly kind: "submenu";
    readonly submenu: "clipboard";
    readonly entries: ReadonlyArray<ShortcutMenuEntry>;
} | {
    readonly kind: "snapOverrides";
} | {
    readonly kind: "dimensionStyle";
    readonly styles: ReadonlyArray<{
        readonly id: DimStyleId;
        readonly name: string;
    }>;
    readonly current: DimStyleId | null;
};

export type { ShortcutMenuMode }
export type ShortcutMenuMode = "default" | "edit" | "command";

export type { ShortcutMenuUi }
export interface ShortcutMenuUi {
    readonly mode: ShortcutMenuMode;
    readonly at: Vec2;
    readonly groups: ReadonlyArray<ReadonlyArray<ShortcutMenuEntry>>;
    readonly repeat: string | null;
}

export type { SnapModeType }
export type SnapModeType = "grid" | "polar";

export { SnapType }
export declare enum SnapType {
    Endpoint = "endpoint",
    Midpoint = "midpoint",
    Center = "center",
    Intersection = "intersection",
    ApparentIntersection = "apparentIntersection",
    Perpendicular = "perpendicular",
    Tangent = "tangent",
    Insertion = "insertion",
    Extension = "extension",
    Parallel = "parallel",
    Quadrant = "quadrant",
    Nearest = "nearest"
}

export { STANDARD_COLORS }
export declare const STANDARD_COLORS: readonly ColorDef[];

export type { StrokeStyle }
export interface StrokeStyle {
    readonly color: string;
    readonly width: number;
    readonly dash?: readonly number[];
    readonly dashOffset?: number;
}

export type { StylesPanelTab }
export type StylesPanelTab = "dimension" | "text";

export type { SvgDecorator }
export type SvgDecorator = (primitive: ScenePrimitive, index: number) => Readonly<Record<string, string | number>> | undefined;

export type { SvgDocumentOptions }
export interface SvgDocumentOptions {
    readonly title?: string;
    readonly description?: string;
    readonly background?: boolean;
    readonly attributes?: Readonly<Record<string, string | number>>;
}

export { SvgScenePresenter }
export declare class SvgScenePresenter {
    constructor(options?: SvgScenePresenterOptions);
    render(scene: Scene, options?: SvgDocumentOptions): string;
    elements(primitives: readonly ScenePrimitive[], decorate?: SvgDecorator): string;
}

export type { SvgScenePresenterOptions }
export interface SvgScenePresenterOptions {
    readonly lang?: string;
    readonly palette?: (color: string) => string;
    readonly precision?: number;
    readonly fontFamily?: string;
    readonly capHeightRatio?: number;
    readonly plot?: boolean;
    readonly frame?: {
        readonly width: number;
        readonly height: number;
    };
}

export type { TextAlign }
export type TextAlign = "left" | "center" | "right";

export type { TextStyle }
export interface TextStyle {
    readonly id: TextStyleId;
    readonly name: string;
    readonly height: number;
}

export type { TextStyleId }
export type TextStyleId = string;

export type { TextStyleInfo }
export interface TextStyleInfo extends TextStyle {
    readonly entityCount: number;
}

export { THEME }
export declare const THEME: {
    readonly background: "#0b0f14";
    readonly gridMinor: "rgba(148, 163, 184, 0.08)";
    readonly gridMajor: "rgba(148, 163, 184, 0.16)";
    readonly axisX: "rgba(248, 113, 113, 0.55)";
    readonly axisY: "rgba(74, 222, 128, 0.55)";
    readonly ucsIcon: "#ffffff";
    readonly ucsIconX: "#f87171";
    readonly ucsIconY: "#4ade80";
    readonly entity: "#e2e8f0";
    readonly entityHover: "#cbd5e1";
    readonly selected: "rgba(59, 130, 246, 0.45)";
    readonly grip: "#3b82f6";
    readonly gripHot: "#ef4444";
    readonly arrayRing: "#8a8f96";
    readonly trimBadge: "#eb5555";
    readonly refusedBadge: "#ffffff";
    readonly lockedBadge: "#ffffff";
    readonly paintBadge: "#ffffff";
    readonly snap: "#00a500";
    readonly snapTooltipBg: "#999999";
    readonly snapTooltipBorder: "#000000";
    readonly snapTooltipText: "#000000";
    readonly crosshair: "#e4e5e6";
    readonly tracking: "#049606";
    readonly trackingSolid: "#049606";
    readonly polar: "#049606";
    readonly rubberBand: "#e2e8f0";
    readonly measureAreaFill: "rgba(0, 255, 0, 0.24)";
    readonly dashedRubberBand: "#d7a320";
    readonly preview: "#38bdf8";
    readonly selectionWindowFill: "rgba(64, 140, 255, 0.12)";
    readonly selectionWindowStroke: "#ffffff";
    readonly selectionCrossingFill: "rgba(74, 222, 128, 0.12)";
    readonly selectionCrossingStroke: "#ffffff";
};

export { themeCustomProperties }
export declare function themeCustomProperties(prefix?: string): string;

export { themePalette }
export declare function themePalette(prefix?: string): (color: string) => string;

export { transcript }
export declare function transcript(recording: DemoRecording): TranscriptLine[];

export type { TranscriptLine }
export interface TranscriptLine {
    readonly kind: "command" | "input" | "info" | "error";
    readonly prompt: string;
    readonly segments: readonly PromptSegment[];
    readonly text: string;
    readonly step: number;
}

export { unitsSampleOutput }
export declare function unitsSampleOutput(settings: Pick<DocumentSettings, "precision" | "anglePrecision">): readonly [
    string,
    string
];

export type { Vec2 }
export interface Vec2 {
    readonly x: number;
    readonly y: number;
}

export type { Vec3 }
export interface Vec3 extends Vec2 {
    readonly z: number;
}

export { VIEW_MENU }
export declare const VIEW_MENU: readonly ViewPreset[];

export type { ViewCubeFace }
export type ViewCubeFace = "top" | "bottom" | "front" | "back" | "left" | "right";

export type { ViewCubePart }
export type ViewCubePart = string;

export type { ViewCubeRoll }
export type ViewCubeRoll = "clockwise" | "counterclockwise";

export type { ViewCubeSide }
export type ViewCubeSide = "up" | "down" | "left" | "right";

export type { ViewCubeUi }
export interface ViewCubeUi {
    readonly visible: boolean;
    readonly faces: readonly ViewCubeFaceUi[];
    readonly compass: ViewCubeCompassUi;
    readonly current: ViewCubePart | null;
    readonly faceView: boolean;
}

export type { ViewPreset }
export type ViewPreset = keyof typeof VIEW_PRESETS;

export { ZOOM_MENU }
export declare const ZOOM_MENU: readonly ZoomOption[];

export type { ZoomOption }
export type ZoomOption = "extents" | "window" | "previous" | "in" | "out";
```

## ./locales/en

```ts
export { en }
export declare const en: EngineCatalog;
```

## ./locales/es

```ts
export { es }
export declare const es: EngineLocale;
```

## ./locales/ar

```ts
export { ar }
export declare const ar: EngineLocale;
```

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// application/CadDriver.ts
type WorldPoint = Vec2 | Vec3;

// application/EngineText.ts
export type FeedbackId = Exclude<keyof CommandCatalog["feedback"], "snap">;

// application/EngineText.ts
export type FileErrorCode = keyof Messages["fileError"];

// application/EngineText.ts
export type MessageId = Exclude<keyof Messages, "fileError">;

// application/EngineText.ts
export type PromptForm = "spaced" | "tight" | "open";

// application/EngineText.ts
type Messages = CommandCatalog["messages"];

// application/EngineText.ts
type Property = InterfaceCatalog["property"];

// application/tools/viewPresets.ts
export declare const VIEW_PRESETS: {
    readonly Top: {
        readonly x: 0;
        readonly y: 0;
        readonly z: 1;
    };
    readonly Bottom: {
        readonly x: 0;
        readonly y: 0;
        readonly z: -1;
    };
    readonly Front: {
        readonly x: 0;
        readonly y: -1;
        readonly z: 0;
    };
    readonly BAck: {
        readonly x: 0;
        readonly y: 1;
        readonly z: 0;
    };
    readonly Left: {
        readonly x: -1;
        readonly y: 0;
        readonly z: 0;
    };
    readonly Right: {
        readonly x: 1;
        readonly y: 0;
        readonly z: 0;
    };
    readonly SWiso: {
        readonly x: -1;
        readonly y: -1;
        readonly z: 1;
    };
    readonly SEiso: {
        readonly x: 1;
        readonly y: -1;
        readonly z: 1;
    };
    readonly NEiso: {
        readonly x: 1;
        readonly y: 1;
        readonly z: 1;
    };
    readonly NWiso: {
        readonly x: -1;
        readonly y: 1;
        readonly z: 1;
    };
};

// application/viewCube.ts
export interface ViewCubeCompassUi {
    readonly center: Vec2;
    readonly rx: number;
    readonly ry: number;
    readonly rotation: number;
    readonly letters: readonly {
        letter: CompassLetter;
        at: Vec2;
    }[];
}

// application/viewCube.ts
export interface ViewCubeFaceUi {
    readonly face: ViewCubeFace;
    readonly zones: readonly ViewCubeZone[];
    readonly label: readonly [
        number,
        number,
        number,
        number,
        number,
        number
    ];
}

// application/viewCube.ts
export interface ViewCubeZone {
    readonly part: ViewCubePart;
    readonly points: readonly Vec2[];
}

// domain/entityProperties.ts
export type ZProperty = "thickness" | "startZ" | "endZ" | "centerZ" | "positionZ" | "elevation";

// domain/entityTypes.ts
export interface ArcEntity extends BaseEntity, Thick {
    readonly type: "arc";
    readonly center: Vec2;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
}

// domain/entityTypes.ts
export interface ArrayPath {
    readonly pieces: readonly ArrayPathPiece[];
    readonly length: number;
    readonly closed: boolean;
}

// domain/entityTypes.ts
export interface AttributeDefinitionEntity extends BaseEntity {
    readonly type: "attdef";
    readonly position: Vec2;
    readonly height: number;
    readonly rotation: number;
    readonly justify: TextJustify;
    readonly styleId: TextStyleId;
    readonly tag: string;
    readonly prompt: string;
    readonly value: string;
    readonly modes: AttributeModes;
}

// domain/entityTypes.ts
export interface AttributeModes {
    readonly invisible: boolean;
    readonly constant: boolean;
    readonly verify: boolean;
    readonly preset: boolean;
    readonly lockPosition: boolean;
}

// domain/entityTypes.ts
export interface BlockAttribute {
    readonly tag: string;
    readonly value: string;
    readonly position: Vec2;
    readonly elevation?: number;
    readonly height: number;
    readonly rotation: number;
    readonly justify: TextJustify;
    readonly styleId: TextStyleId;
    readonly invisible: boolean;
    readonly layerId: LayerId;
    readonly color?: EntityColor;
    readonly linetype?: LinetypeId;
    readonly lineweight?: Lineweight;
}

// domain/entityTypes.ts
export interface BlockLookup {
    (id: BlockId): BlockDefinition | undefined;
    readonly attributeDisplay?: AttributeDisplay;
}

// domain/entityTypes.ts
export interface CircleEntity extends BaseEntity, Thick {
    readonly type: "circle";
    readonly center: Vec2;
    readonly radius: number;
}

// domain/entityTypes.ts
export interface DimensionEntity extends BaseEntity {
    readonly type: "dimension";
    readonly kind: DimensionKind;
    readonly first: Vec2;
    readonly second: Vec2;
    readonly linePoint: Vec2;
    readonly vertex?: Vec2;
    readonly textPoint?: Vec2;
    readonly rotation: number;
    readonly text?: string;
    readonly textAngle?: number;
    readonly styleId: DimStyleId;
}

// domain/entityTypes.ts
export interface EllipseEntity extends BaseEntity {
    readonly type: "ellipse";
    readonly center: Vec2;
    readonly majorAxis: Vec2;
    readonly ratio: number;
    readonly startParam?: number;
    readonly endParam?: number;
}

// domain/entityTypes.ts
export interface HatchEntity extends BaseEntity {
    readonly type: "hatch";
    readonly loops: readonly HatchLoop[];
    readonly patternId: HatchPatternId;
    readonly patternScale: number;
    readonly patternAngle: number;
    readonly origin: Vec2;
    readonly patternFrame?: Linear2;
}

// domain/entityTypes.ts
export interface HatchLoop {
    readonly vertices: readonly Vec2[];
    readonly bulges?: readonly number[];
}

// domain/entityTypes.ts
export interface InsertEntity extends BaseEntity {
    readonly type: "insert";
    readonly blockId: BlockId;
    readonly position: Vec2;
    readonly scaleX: number;
    readonly scaleY: number;
    readonly rotation: number;
    readonly attributes?: readonly BlockAttribute[];
    readonly array?: ArrayParameters;
}

// domain/entityTypes.ts
export interface LineEntity extends BaseEntity, Thick {
    readonly type: "line";
    readonly start: Vec2;
    readonly end: Vec2;
    readonly deltaZ?: number;
}

// domain/entityTypes.ts
export interface MTextEntity extends BaseEntity {
    readonly type: "mtext";
    readonly position: Vec2;
    readonly contents: string;
    readonly height: number;
    readonly width: number;
    readonly rotation: number;
    readonly attachment: MTextAttachment;
    readonly lineSpacingStyle: LineSpacingStyle;
    readonly lineSpacingFactor: number;
    readonly styleId: TextStyleId;
}

// domain/entityTypes.ts
export interface PathLayout {
    readonly method: "divide" | "measure";
    readonly items: number;
    readonly spacing: number;
    readonly align: boolean;
}

// domain/entityTypes.ts
export interface PolarArray {
    readonly center: Vec2;
    readonly basePoint: Vec2;
    readonly items: number;
    readonly fill: number;
    readonly clockwise: boolean;
    readonly rotate: boolean;
    readonly sourceBase?: Vec2;
}

// domain/entityTypes.ts
export interface PolylineEntity extends BaseEntity, Thick {
    readonly type: "polyline";
    readonly vertices: readonly Vec2[];
    readonly closed: boolean;
    readonly bulges?: readonly number[];
    readonly widths?: readonly PolylineWidth[];
}

// domain/entityTypes.ts
export interface RectangularArray {
    readonly columns: number;
    readonly rows: number;
    readonly colSpacing: number;
    readonly rowSpacing: number;
    readonly rowElevation: number;
    readonly axis: Vec2;
}

// domain/entityTypes.ts
export interface SplineEntity extends BaseEntity {
    readonly type: "spline";
    readonly method: SplineMethod;
    readonly points: readonly Vec2[];
    readonly degree: number;
    readonly knots: KnotParameterization;
    readonly closed: boolean;
    readonly startTangent?: Vec2;
    readonly endTangent?: Vec2;
}

// domain/entityTypes.ts
export interface TextEntity extends BaseEntity {
    readonly type: "text";
    readonly position: Vec2;
    readonly value: string;
    readonly height: number;
    readonly rotation: number;
    readonly justify: TextJustify;
    readonly styleId: TextStyleId;
}

// domain/entityTypes.ts
export type ArrayKind = ArrayParameters["kind"];

// domain/entityTypes.ts
export type ArrayParameters = (RectangularArray & {
    readonly kind: "rectangular";
}) | (PolarArray & {
    readonly kind: "polar";
}) | (PathLayout & {
    readonly kind: "path";
    readonly path: ArrayPath;
    readonly pathId: EntityId;
});

// domain/entityTypes.ts
export type ArrayPathPiece = {
    readonly kind: "line";
    readonly a: Vec2;
    readonly b: Vec2;
} | {
    readonly kind: "arc";
    readonly center: Vec2;
    readonly radius: number;
    readonly start: number;
    readonly sweep: number;
};

// domain/entityTypes.ts
export type AttributeDisplay = "normal" | "on" | "off";

// domain/entityTypes.ts
export type BlockId = string;

// domain/entityTypes.ts
export type DimensionKind = "linear" | "aligned" | "angular" | "radius" | "diameter";

// domain/entityTypes.ts
export type LineSpacingStyle = "atLeast" | "exactly";

// domain/entityTypes.ts
export type MTextAttachment = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

// domain/entityTypes.ts
export type PolylineWidth = readonly [
    start: number,
    end: number
];

// domain/entityTypes.ts
export type SplineMethod = "fit" | "cv";

// domain/entityTypes.ts
export type TextJustify = "left" | "center" | "right" | "middle" | "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

// domain/entityTypes.ts
interface BaseEntity {
    readonly id: EntityId;
    readonly type: EntityType;
    readonly layerId: LayerId;
    readonly color?: EntityColor;
    readonly linetype?: LinetypeId;
    readonly lineweight?: Lineweight;
    readonly elevation?: number;
    readonly normal?: Vec3;
}

// domain/entityTypes.ts
interface Thick {
    readonly thickness?: number;
}

// domain/ucs.ts
export interface NamedUcs {
    readonly name: string;
    readonly ucs: Ucs;
}

// domain/ucs.ts
export interface Ucs {
    readonly origin: Vec3;
    readonly xAxis: Vec3;
    readonly yAxis: Vec3;
    readonly wcs?: Ucs;
}

// domain/ucs.ts
export type OrthographicUcs = "top" | "bottom" | "front" | "back" | "left" | "right";

// domain/units.ts
export interface DocumentSettings {
    readonly unit: LengthUnit;
    readonly precision: number;
    readonly anglePrecision: number;
    readonly ltScale: number;
    readonly lwDisplay: boolean;
    readonly attributeDisplay: AttributeDisplay;
    readonly ucs: Ucs;
    readonly ucsName: string | null;
    readonly ucsOrthographic: OrthographicUcs | null;
    readonly namedUcs: readonly NamedUcs[];
    readonly ucsIcon: UcsIconSetting;
    readonly elevation: number;
    readonly thickness: number;
    readonly viewCube: ViewCubeSetting;
    readonly currentColor: EntityColor | typeof COLOR_BYLAYER;
    readonly currentLinetype: LinetypeId | typeof LINETYPE_BYLAYER;
    readonly currentLineweight: Lineweight | typeof LINEWEIGHT_BYLAYER;
    readonly fillMode: boolean;
    readonly polylineWidth: number;
    readonly filletRadius: number;
    readonly chamferDistance1: number;
    readonly chamferDistance2: number;
    readonly textSize: number;
    readonly textJustify: TextJustify;
    readonly textRotation: number;
    readonly hatchPatternName: string;
    readonly hatchPatternScale: number;
    readonly hatchPatternAngle: number;
    readonly orthoMode: boolean;
    readonly snapMode: boolean;
    readonly snapUnit: Vec2;
    readonly gridMode: boolean;
}

// domain/units.ts
export interface SavedView {
    readonly direction: Vec3;
    readonly up: Vec3;
}

// domain/units.ts
export interface UcsIconSetting {
    readonly visible: boolean;
    readonly atOrigin: boolean;
}

// domain/units.ts
export interface ViewCubeSetting {
    readonly visible: boolean;
    readonly home: SavedView | null;
}

// geometry/linear.ts
export type Linear2 = readonly [
    number,
    number,
    number,
    number
];

// geometry/nurbs.ts
export type KnotParameterization = "chord" | "sqrtChord" | "uniform";

// i18n/keywords.ts
export interface Keyword {
    readonly id: string;
    readonly word: string;
    readonly global: string;
}

// i18n/types.ts
export type DeepPartial<T> = T extends string | number | boolean ? T : T extends readonly unknown[] ? T : {
    readonly [K in keyof T]?: DeepPartial<T[K]>;
};

// i18n/types.ts
export type MessageValues = Readonly<Record<string, string | number>>;

// locales/types.ts
export type PromptId = keyof Commands["prompts"];

// locales/types.ts
type Commands = Source["commands"];

// locales/types.ts
type Compiled<T> = T extends string ? CompiledMessage : {
    readonly [K in keyof T]: Compiled<T[K]>;
};

// locales/types.ts
type Source = typeof source;

// shared/Observable.ts
export type Listener = () => void;
```
