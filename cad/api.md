# @mellowcad/engine — API report

Every export with its signature and its documentation, grouped by topic, then the types they reach. Generated from the source by `cad/api.test.ts`: a change to it is a change to the public API.

## .

### Engine

```ts
export { CadEngine }
/**
 * The engine on a page. It owns its `<canvas>`: sizes the backing store to
 * the canvas's CSS box and the device's pixel ratio, draws a frame whenever
 * something changed, and takes the pointer, the wheel and the keys (from its
 * `scope`). Everything else is the host's: it shows {@link getState} in its
 * own chrome and calls the methods below. `CadDriver` is the same engine with
 * no browser.
 */
export declare class CadEngine {
    constructor(canvas: HTMLCanvasElement, options?: CadEngineOptions);
    /**
     * Calls `listener` after every change to the state, once per change, with
     * nothing: read the new state with {@link getState}. Returns the unsubscribe.
     */
    subscribe(listener: Listener): () => void;
    /**
     * The engine's state, an immutable snapshot: the same object until something
     * changes, and a changed one keeps every part that did not, so a host can
     * compare by identity (`useSyncExternalStore` takes it as it is).
     */
    getState(): EngineState;
    /** Switches the language; what the command line already shows stays. */
    setLocale(locale: EngineLocale): void;
    /**
     * Starts a tool as its button would, by its id in `state.tools` (`"line"`):
     * the running command ends, the tool's command starts and the command line
     * echoes it. `"select"` goes back to the Command prompt.
     */
    setActiveTool(id: string): void;
    /**
     * The Delete key: ERASE on what is selected at the Command prompt, one undo
     * step. Nothing happens while a command runs.
     */
    deleteSelection(): void;
    /**
     * NEW: an empty drawing in place of this one, the running command ended. It
     * is one undo step, so U brings the old drawing back.
     */
    newDrawing(): void;
    /**
     * U: takes back the last step, a whole command or gesture, and writes what
     * it took back on the command line.
     */
    undo(): void;
    /**
     * REDO: does again what the last undo took back.
     */
    redo(): void;
    zoomIn(): void;
    zoomOut(): void;
    resetView(): void;
    /**
     * ZOOM Extents: frames every object, `padding` screen pixels in from the
     * edges; the default view on an empty drawing.
     */
    zoomToFit(padding?: number): void;
    zoomToBounds(bounds: Bounds, padding?: number): void;
    zoomPrevious(): boolean;
    toggleSnap(): void;
    /**
     * Turns one running object snap on or off (OSNAP's checkboxes); {@link toggleSnap}
     * switches them all, as F3 does.
     */
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
    /**
     * Whether snap mode steps on the rectangular lattice or by polar distance.
     */
    setSnapModeType(type: SnapModeType): void;
    setSnapSpacing(x: number, y?: number): void;
    setSnapPolarDistance(distance: number): void;
    /**
     * Turns Ortho or Polar tracking on or off; the two exclude each other.
     */
    setConstraintEnabled(type: ConstraintType, enabled: boolean): void;
    /**
     * A new layer, current unless `makeCurrent` is false, as -LAYER's Make
     * does: one undo step. Unnamed, it is the next `Layer<n>`. Returns its id.
     */
    createLayer(name?: string, color?: string, makeCurrent?: boolean): string;
    /**
     * The Layer Properties Manager's New Layer: the next `Layer<n>`, with the
     * colour, linetype and lineweight of `like` or the defaults, the current
     * layer kept. Returns its id.
     */
    newLayer(like?: string): string;
    updateLayer(id: string, patch: Partial<Pick<Layer, "name" | "color" | "linetype" | "lineweight" | "visible" | "locked">>): LayerNameRefusal | null;
    /**
     * Makes a layer current, as the Layers drop-down does (CLAYER), or as the
     * Layer Properties Manager does with `"manager"`, which names the undo step
     * after it.
     */
    setCurrentLayer(id: string, from?: "control" | "manager"): void;
    /**
     * Deletes a layer, one undo step, unless it is layer `0`, the current layer
     * or holds an object (in a block definition too). Returns whether it went.
     */
    removeLayer(id: string): boolean;
    /**
     * The selection edits take a scope: the whole selection, as the ribbon's
     * drop-downs edit it, or `"properties"`, the objects the Properties
     * palette's type filter leaves.
     */
    setSelectionLayer(id: string, scope?: SelectionScope): void;
    applyLayerControl(id: string): void;
    /**
     * Gives the selected objects a colour, a hex value or `"ByLayer"`, in one
     * undo step.
     */
    setSelectionColor(color: string, scope?: SelectionScope): void;
    /** Starts the FROM point modifier (pick a base, then type an offset). */
    startFrom(): boolean;
    /**
     * Types a point filter at the running point prompt (`.X`, `.XY`…), as the
     * Point Filters menu does: the next point gives those coordinates, and
     * `(need …)` asks for the rest.
     */
    choosePointFilter(filter: PointFilterName): void;
    /**
     * Gives the selected objects a linetype, an id of `LINETYPES` or
     * `"ByLayer"`, in one undo step.
     */
    setSelectionLinetype(linetype: string, scope?: SelectionScope): void;
    setSelectionLineweight(lineweight: number | "ByLayer", scope?: SelectionScope): void;
    /** CECOLOR, CELTYPE and CELWEIGHT: what new objects take. */
    setCurrentColor(color: string): void;
    setCurrentLinetype(linetype: string): void;
    setCurrentLineweight(lineweight: number | "ByLayer"): void;
    /**
     * The top bar's property drop-downs: the selection when there is one, else
     * the current property, as {@link applyLayerControl} does with the layer.
     */
    applyColorControl(color: string): void;
    applyLinetypeControl(linetype: string): void;
    applyLineweightControl(lineweight: number | "ByLayer"): void;
    /** Narrows the Properties palette to one object type, or to all with null. */
    setPropertiesFilter(type: ObjectType | null): void;
    /** Retypes one geometry value of the one object the Properties palette edits. */
    setSelectionProperty(property: EntityProperty, text: string): boolean;
    /**
     * The text of a field of the dynamic input (`state.dynamicInput.fields`),
     * the active one unless `fieldId` names another, as the user types it.
     */
    setDynamicInputText(text: string, fieldId?: string): void;
    /**
     * Moves the dynamic input to another of its fields, as Tab does.
     */
    setActiveDynamicField(fieldId: string): void;
    /**
     * Answers the prompt's `[Close/Undo]` with a keyword typed as a user types
     * it: its letters or word in the command language, or `_` and the global word.
     * Returns whether the prompt offered it.
     */
    invokeToolOption(input: string): boolean;
    /**
     * A key in a field of the host's dynamic input, by the field's id: whether
     * the engine took it (prevent the browser's). After a Tab the host moves
     * focus to the field now active.
     */
    dynamicInputKey(fieldId: string, key: string, modifiers?: Omit<PointerModifiers, "button">): boolean;
    /**
     * Replaces what is typed at the prompt; what is typed on the drawing goes
     * there too. {@link commandLineKey} sends the keys that act on it.
     */
    setCommandLineText(text: string): void;
    /**
     * Runs a command as typed at the prompt and confirmed: its name or alias in
     * the command language, or `_` and its global name in any (`_LINE`). Returns
     * false, writing the error on the command line, when no command has the name.
     */
    runCommand(name: string): boolean;
    /** A preset view from the viewport controls, run as `'_-view _<preset>`. */
    applyViewPreset(preset: ViewPreset): boolean;
    /** The navigation bar's Pan and Orbit, run as their macros. Transparent mid-command. */
    navigate(command: "PAN" | "3DORBIT"): boolean;
    /** A member of the navigation bar's Zoom, run as its macro (`'_zoom 2x`). Transparent mid-command. */
    zoom(option: ZoomOption): boolean;
    /**
     * A press on the ViewCube, by what it landed on; its moves and release
     * follow, in the same pixels. The engine tells a click from a drag.
     */
    viewCubePress(target: ViewCubeTarget, screen: Vec2): void;
    viewCubeMove(screen: Vec2): void;
    /** The press let go, at `screen`; `null` when the pointer was lost (cancelled). */
    viewCubeRelease(screen: Vec2 | null): void;
    viewCubeRoll(turn: ViewCubeRoll): void;
    viewCubeAdjacent(side: ViewCubeSide): void;
    viewCubeHome(): void;
    setHomeFromCurrentView(): void;
    setViewCubeVisible(visible: boolean): void;
    /** The WCS (`null`) or a saved UCS, from the ViewCube's UCS menu. */
    restoreUcs(name: string | null): boolean;
    /** A key in the host's command-line field: whether the engine took it (prevent the browser's). */
    commandLineKey(key: string): boolean;
    toggleCommandLine(): void;
    toggleCommandHistory(): void;
    setCleanScreen(on: boolean): void;
    toggleCleanScreen(): void;
    /**
     * A point of the state's screen space (the canvas's own pixels: the cursor,
     * the snap override menu, the cycling list) in the page's viewport, where a
     * popup anchored to it is positioned. The canvas does not start at the
     * page's corner, so the two differ.
     */
    clientFromScreen(screen: Vec2): Vec2;
    /** Returns keyboard focus to the drawing surface. */
    focusSurface(): void;
    /**
     * Whether the engine's own UI (the dynamic-input box) may take keyboard
     * focus away from `from`. The editor owns the page, so from anywhere but an
     * open menu or modal dialog, which keep their keys (an Escape there taken by
     * the box would end the command), or another field being typed in — the
     * command line, a palette's value: the next render took the rest of what
     * was typed there into the box. An embedded engine only while active, and
     * only from its canvas, its scope or the body — never from the rest of the
     * page, nor from a control beside the canvas that the user tabbed to.
     */
    mayTakeFocus(from: Element | null): boolean;
    /**
     * The drawing's unit, which lengths are written in (`10.00 mm`): one
     * drawing unit is one of it, so nothing is rescaled.
     */
    setDocumentUnit(unit: LengthUnit): void;
    /**
     * How many decimal places lengths are written with.
     */
    setDocumentPrecision(precision: number): void;
    applyDrawingUnits(unit: LengthUnit, precision: number): void;
    setLtScale(ltScale: number): void;
    setDimScale(scale: number): void;
    createDimStyle(name?: string, basedOn?: string, makeCurrent?: boolean): string;
    updateDimStyle(id: string, patch: Partial<Omit<DimStyle, "id">>): void;
    /**
     * Makes a dimension style the one new dimensions take.
     */
    setCurrentDimStyle(id: string): void;
    removeDimStyle(id: string): boolean;
    setSelectionDimStyle(id: string): void;
    createTextStyle(name?: string, basedOn?: string, makeCurrent?: boolean): string;
    updateTextStyle(id: string, patch: Partial<Omit<TextStyle, "id">>): void;
    /**
     * Makes a text style the one new text takes.
     */
    setCurrentTextStyle(id: string): void;
    removeTextStyle(id: string): boolean;
    setSelectionTextStyle(id: string): void;
    setStylesTable(table: StylesPanelTab): void;
    /** Opens the palette panel on one of its palettes. */
    showPalette(tab: PaletteTab): void;
    /** Folds the palette panel; with a tab, only while that palette shows. */
    closePalette(tab?: PaletteTab): void;
    /** A palette's trigger: opens the panel on it, or folds it if it shows. */
    togglePalette(tab: PaletteTab): void;
    setPaletteOpen(open: boolean): void;
    setUnitsDialog(open: boolean): void;
    openDrawingUnits(): void;
    openDrawingUnitsFromMenu(): void;
    runFileButton(bar: "quickAccess" | "applicationMenu", button: "new" | "open" | "save" | "saveAs"): void;
    closeLockedObjectsDialog(): void;
    answerUnsavedText(answer: "yes" | "no" | "cancel"): void;
    insertBlock(id: string): void;
    /**
     * Deletes the block definitions named, or every one, that nothing in the
     * drawing uses: PURGE's Blocks, one undo step. Returns how many went.
     */
    purgeBlocks(ids?: readonly string[]): number;
    /**
     * A block's thumbnail, framed in `width`×`height` pixels, as a scene for a
     * presenter. Null for an unknown or empty block.
     */
    buildBlockPreview(id: string, width: number, height: number): Scene | null;
    toggleLineweightDisplay(): void;
    /**
     * The drawing as the text of a drawing file: versioned JSON, in world
     * coordinates, what SAVE writes and {@link loadDrawing} reads.
     */
    serializeDrawing(): string;
    /**
     * The name SAVE gives the file, `drawing-<date>.ecad.json` with `drawing`
     * in the command language (`dibujo-` in Spanish).
     */
    suggestedFileName(): string;
    /**
     * Replaces the drawing with a drawing file's text, framed in the view, with
     * an empty undo history; the store is written at once. Throws an `Error`
     * whose message is for the user when the text is no drawing or is from a
     * newer version.
     */
    loadDrawing(text: string): void;
    /**
     * SAVE: hands the drawing file to the file transport, a download in the
     * browser.
     */
    saveDrawingToFile(): void;
    /**
     * OPEN: asks the file transport for a file, a file picker in the browser,
     * and loads it. Never rejects: a cancelled pick does nothing and a bad file is
     * reported on the command line.
     */
    openDrawingFromFile(): Promise<void>;
    /**
     * PASTECLIP: reads the clipboard and starts placing what was copied there.
     */
    pasteFromClipboard(): Promise<void>;
    /**
     * Ctrl+A: selects every object that can be, the running command ended.
     */
    selectAll(): void;
    /**
     * Stops listening to the page and drawing, and writes a change still
     * waiting for the store. Call it when the canvas goes away.
     */
    dispose(): void;
}

export type { CadEngineOptions }
export interface CadEngineOptions {
    /**
     * Where the transparent autosave goes, and what the engine restores when it
     * starts. None by default: an engine never writes a drawing it was not given
     * a store for. The editor passes this device's,
     * `createLocalStorageDrawingStore()`; `null` is the same as leaving it out.
     */
    readonly store?: DrawingStore | null;
    /**
     * What part of the page the engine may take keys, the wheel and the context
     * menu from. By default its canvas: the engine is **active** from a press or
     * a focus inside the scope until the next one outside it. Inactive, it hears
     * no keys, leaves the wheel to scroll the page and never takes focus. Active,
     * it hears keys aimed at the canvas or at the page body, and none of them
     * scrolls the page; fields inside the scope keep the editor's rule for
     * fields, and any other control there keeps its own keys. A host whose own
     * controls sit beside the canvas passes the element holding both.
     *
     * `"document"` gives the engine the whole page, as the editor needs: every
     * key reaches it wherever focus sits, the wheel always zooms and the native
     * context menu never opens.
     */
    readonly scope?: HTMLElement | "document";
    /**
     * The language the engine speaks — its prompts, keywords, palettes and what
     * it draws on the canvas. English, built in, when left out.
     */
    readonly locale?: EngineLocale;
    /**
     * Whether the palette panel starts open, so the engine agrees with what the
     * host laid out before it existed. Folded when left out.
     */
    readonly paletteOpen?: boolean;
    /**
     * Shows a command's help, AutoCAD's F1: the global name of the command
     * running, or `null` for the help's start. Without it F1 is the browser's.
     */
    readonly onHelp?: (command: string | null) => void;
}
```

### Headless

```ts
export { CadDriver }
export declare class CadDriver {
    constructor(options?: CadDriverOptions);
    dispose(): void;
    /** World → screen through the live viewport (survives zoom/pan). */
    toScreen(world: WorldPoint): Vec2;
    toWorld(screen: Vec2): Vec2;
    moveTo(world: WorldPoint, modifiers?: PointerModifiers): this;
    /** A full press-and-release at one point: the ordinary "pick". */
    click(world: WorldPoint, modifiers?: PointerModifiers): this;
    /**
     * A press and release of the right button: Enter, or one of AutoCAD's
     * shortcut menus, as the prompt decides; with Shift at a point prompt, the
     * object-snap override menu.
     */
    rightClick(world: WorldPoint, modifiers?: Omit<PointerModifiers, "button">): this;
    /** The press half of a gesture, left held until {@link mouseUp}. */
    mouseDown(world: WorldPoint, modifiers?: PointerModifiers): this;
    mouseUp(world: WorldPoint, modifiers?: PointerModifiers): this;
    /**
     * Two picks followed by the double-click the browser then fires — the order
     * the real adapter delivers, so the tool sees the selection the clicks made.
     */
    doubleClick(world: WorldPoint, modifiers?: PointerModifiers): this;
    /**
     * A press-move-release gesture. Two intermediate moves are sent so tools that
     * only start dragging past a pixel threshold (box selection, grips) see the
     * motion they expect.
     */
    drag(from: WorldPoint, to: WorldPoint, modifiers?: PointerModifiers): this;
    /**
     * A press at the path's first point, the cursor dragged through the rest
     * and released at its last: AutoCAD's lasso, drawn along that path.
     */
    lasso(path: readonly WorldPoint[], modifiers?: PointerModifiers): this;
    wheel(world: WorldPoint, deltaY: number): this;
    /** Sends a key to the drawing surface. Returns whether it was consumed. */
    press(key: string, modifiers?: Omit<PointerModifiers, "button">): boolean;
    /** Lets go of a key held on the drawing surface. */
    release(key: string): this;
    /**
     * True when a dynamic-input *field* is on screen. This mirrors focus in the
     * real UI: a session with fields auto-focuses its input (so keys go to the
     * box), whereas a keyword-only prompt renders chips and leaves focus on the
     * canvas. Routing scripted keystrokes the same way keeps them honest.
     */
    hasFocusedField(): boolean;
    /** Types into a dynamic-input field (the active one unless `fieldId` given). */
    type(text: string, fieldId?: string): this;
    /**
     * The Down or Up arrow, routed as the UI routes it: the box's own key when a
     * field is focused, else the drawing's. Down opens the prompt's option list.
     */
    arrow(direction: "up" | "down"): this;
    /**
     * Enter: the focused box's, else the drawing's. A paragraphs box takes
     * Enter as a line break, so it gets Ctrl+Enter, which closes it.
     */
    enter(): this;
    /** Escape: the focused box's, else the drawing's. */
    escape(): this;
    /**
     * Answers a keyword prompt (AutoCAD's `[Close/Undo]`) with the keyword whose
     * global id is `id` — `option("Close")` in every language — typed as a
     * user of the command language would: its abbreviation, then Enter. Routed
     * like the UI does: through the focused input when there is one, else on
     * the drawing surface. An id the running command does not have is a mistake
     * in the script, and throws.
     */
    option(id: string): this;
    /**
     * What a user types to answer with keyword `id` at the current prompt: its
     * abbreviation in the command language.
     */
    optionAnswer(id: string): string;
    /** Runs a command by name or alias, as typing it at the prompt would. */
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
    /** The most recently added entity — what a draw command just produced. */
    latest(): Entity;
    /**
     * The single entity of `type` in the drawing, failing loudly otherwise. Makes
     * a wrong entity count fail with a useful message instead of a `undefined`
     * property access three lines later.
     */
    only<T extends Entity>(type: Entity["type"]): T;
    byId<T extends Entity>(id: EntityId): T;
    typeCounts(): Record<string, number>;
    state(): EngineState;
    scene(): Scene;
    /** The abbreviations the keyword chips the active tool offers show. */
    optionAbbreviations(): string[];
    /** The global ids of the keywords the active tool currently offers. */
    optionIds(): string[];
    /** Everything written to the command prompt, in order. */
    commandLog(): string[];
}

export type { CadDriverOptions }
export interface CadDriverOptions {
    /** Viewport size in CSS pixels. The default keeps world→screen trivial. */
    readonly width?: number;
    readonly height?: number;
    /** Geometry present before the script starts (loaded outside the undo stack). */
    readonly entities?: readonly Entity[];
    /** Block definitions present before the script starts. */
    readonly blocks?: readonly BlockDefinition[];
    /**
     * Running object snaps. Off by default so a click lands exactly where the
     * script asked; turn it on for scripts that are *about* snapping.
     */
    readonly snap?: boolean;
    /**
     * Polar tracking (F10), which a fresh AutoCAD has on. Off by default for the
     * same reason as {@link snap}: near an angle it would bend a click.
     */
    readonly polar?: boolean;
    /**
     * The UCS icon. Off by default so a frame holds only what the script drew;
     * turn it on for scripts that are *about* the icon.
     */
    readonly ucsIcon?: boolean;
    readonly store?: DrawingStore | null;
    /** The language the engine speaks; English when left out. */
    readonly locale?: EngineLocale;
    /** File save/open. Absent means the host offers none (SSR, headless). */
    readonly files?: FileTransport | null;
    readonly clipboard?: Clipboard | null;
    /** Shows a command's help on F1 (`EngineHost.showHelp`); F1 does nothing without it. */
    readonly help?: (command: string | null) => void;
}

export type { PointerModifiers }
export interface PointerModifiers {
    readonly shiftKey?: boolean;
    readonly ctrlKey?: boolean;
    readonly altKey?: boolean;
    readonly button?: number;
}
```

### State

```ts
export type { BlockInfo }
/** A block definition as the Blocks palette lists it. */
export interface BlockInfo {
    readonly id: BlockId;
    readonly name: string;
    /** How many references to it the drawing currently holds. */
    readonly referenceCount: number;
}

export type { CleanScreenUi }
/** Clean Screen: what it hides is the host's chrome, so the host hides it. */
export interface CleanScreenUi {
    /** CLEANSCREENSTATE: the tool palette, the palette panel and the ribbon hidden. */
    readonly active: boolean;
    /** A palette was opened while it is on: the palette panel shows again. */
    readonly palette: boolean;
}

export type { CommandLineEntry }
/**
 * One line of the command-line scrollback: a command started (`command`), a
 * prompt with its answer (`prompt`), or what a command reported.
 */
export interface CommandLineEntry {
    readonly kind: CommandLineEntryKind;
    readonly text: string;
}

export type { CommandLineEntryKind }
/**
 * AutoCAD's command line: the keyboard-first way to run commands by name or
 * alias, with a scrollback of what happened and recall of what was typed.
 *
 * This controller owns only the *text* side of it (buffer, log, history). What
 * a command name means is decided by the runtime, which registers a
 * {@link CommandDefinition} per command.
 */
export type CommandLineEntryKind = "command" | "prompt" | "info" | "error";

export type { CommandLineUi }
/** Snapshot of the command line (AutoCAD's `Command:` prompt) for the UI. */
export interface CommandLineUi {
    /** Whether the prompt is shown (AutoCAD's Ctrl+9). */
    readonly visible: boolean;
    /** Whether the command history is expanded above the prompt (F2). */
    readonly historyOpen: boolean;
    /**
     * The temporary prompt history: the last lines of the most recent command,
     * shown above the one-line prompt (CLIPROMPTLINES, 3).
     */
    readonly recent: ReadonlyArray<CommandLineEntry>;
    /**
     * Text before the input: `Command:`, the running command's name and its
     * question, `LINE Specify next point or [Undo]:`, or its name alone when
     * it names no question, `PLINE [Close/Undo]:`.
     */
    readonly prompt: string;
    /**
     * The same prompt in spans, the keyword list set apart, so a host can style
     * it without taking the text apart.
     */
    readonly promptSegments: ReadonlyArray<PromptSegment>;
    /** The running command's name as the prompt shows it; null at rest. */
    readonly command: string | null;
    /**
     * The question alone, as the history writes it once answered —
     * `Specify next point or [Undo]:` — in spans; null when there is none.
     */
    readonly question: ReadonlyArray<PromptSegment> | null;
    /** The neutral prompt, `Command:`, which also heads each echoed command. */
    readonly idlePrompt: string;
    /** What the user has typed so far, whether on the canvas or in the box. */
    readonly buffer: string;
    /**
     * Whether Space types a space after what is typed rather than answering:
     * a prompt whose answer holds spaces (UCS's names). Elsewhere the command
     * line's Space is Enter.
     */
    readonly takesSpaces: boolean;
    /** Scrollback: commands echoed, results and errors. */
    readonly lines: ReadonlyArray<CommandLineEntry>;
    /** Autocomplete matches for the current buffer; empty when nothing typed. */
    readonly suggestions: ReadonlyArray<CommandSuggestion>;
    /**
     * The command language's BCP 47 tag, for the `lang` of whatever shows the
     * prompts — English on an Arabic page, whose command language is global.
     */
    readonly lang: string;
}

export type { CommandOptionUi }
/**
 * A keyword the running command offers, resolved into the command language:
 * AutoCAD's `[Close/Undo]`, one entry per word.
 */
export interface CommandOptionUi {
    /** The global keyword the tool receives, whatever was typed. */
    readonly id: string;
    /** The word in the command language, its abbreviation in capitals. */
    readonly keyword: string;
    readonly abbreviation: string;
    /** What the chip and the prompt show, e.g. `Close` or `Erase: Yes`. */
    readonly label: string;
}

export type { CommandSuggestion }
/** A command offered by autocomplete while typing. */
export interface CommandSuggestion {
    readonly name: string;
    readonly description: string;
}

export type { CompassLetter }
export type CompassLetter = "N" | "E" | "S" | "W";

export { ConstraintType }
/**
 * Drawing constraints ("aids") that restrict where a point can land, such as
 * AutoCAD's Ortho or Polar tracking. They are deliberately kept separate from
 * object snaps: snaps *attract* the cursor to existing geometry, while
 * constraints *restrict* the cursor relative to a base point. The two compose
 * in a pipeline (snap first, then constraints) so, for example, an Ortho line
 * can still lock onto the X of a snapped endpoint.
 */
export declare enum ConstraintType {
    Ortho = "ortho",
    Polar = "polar"
}

export type { DimStyleInfo }
export interface DimStyleInfo extends DimStyle {
    readonly entityCount: number;
}

export type { DynamicFieldKind }
/**
 * Dynamic input is AutoCAD's floating "type a value near the cursor" mechanism.
 * It is deliberately part of the engine's tool system rather than a React
 * widget: a tool opens a *session* describing one or more typed fields (a
 * distance today; radius, angle, coordinates or offsets tomorrow) and provides
 * a `commit` callback. React merely renders whatever fields the session
 * exposes and forwards keystrokes back through the engine.
 *
 * This keeps the semantics (what a value means, how it is applied) with the
 * tool, and makes the whole feature reusable for any future measurement input.
 */
export type DynamicFieldKind = "distance" | "length" | "angle" | "number"
/** A whole point typed as an AutoCAD coordinate (e.g. `@30,0`, `100<45`). */
 | "coordinate"
/**
 * Free text — the content of an annotation. Never resolves to a number, so a
 * session using one is committed through {@link DynamicInputSession.commitRaw}.
 */
 | "text"
/**
 * A word typed as text that answers like a value — the prompt's keywords
 * and a transparent command are read from it, as from a number: SETVAR's
 * variable name and a string variable's value (desktop workspace/d07-4).
 * Never read as a number: {@link DynamicInputSession.commitRaw} takes it.
 */
 | "word"
/** Free text over several lines (MTEXT): Enter breaks a line, Ctrl+Enter commits. */
 | "paragraphs";

export type { DynamicInputFieldUi }
/** One dynamic-input field, formatted for display by the UI. */
export interface DynamicInputFieldUi {
    readonly id: string;
    readonly label: string;
    readonly kind: DynamicFieldKind;
    /** The text the user has typed (controlled by the UI). */
    readonly value: string;
    /** Formatted live value shown as a placeholder when nothing is typed. */
    readonly placeholder: string;
    /** Unit label shown after the field, e.g. `mm` or `°`. */
    readonly unitSuffix: string;
    readonly active: boolean;
}

export type { DynamicInputUi }
/** Snapshot of the active dynamic-input session for the UI. */
export interface DynamicInputUi {
    /** Screen (CSS-pixel) position to anchor the floating input near. */
    readonly screen: Vec2;
    /**
     * The dynamic prompt: the running command's question without its name,
     * `Specify first point:`; null when it names none. A line a command shows
     * above the question comes first, after it a `\n` (DIST's `Distance = …`).
     */
    readonly prompt: string | null;
    readonly fields: ReadonlyArray<DynamicInputFieldUi>;
    /**
     * How far below its place the box starts (CSS pixels): it clears the
     * tooltips the scene stacks under the cursor, a snap's name and Polar's
     * reading, which take AutoCAD's place there.
     */
    readonly clearance: number;
}

export type { EngineNames }
/**
 * What the engine names, in the interface language (`EngineState.names`): a
 * host draws these words and never keeps a copy of its own, so a menu and the
 * engine cannot disagree and a language changes them all at once. Each table
 * is keyed by the id the engine hands the host elsewhere in its state.
 *
 * Tool labels and aliases are `EngineState.tools`, a command's name and
 * description `commandCatalog()`, property rows `properties.info`; everything
 * else the host's own chrome says is the host's.
 */
export interface EngineNames {
    /** Object snaps, by `SnapType`: the snap menus and the status bar's list. */
    readonly snaps: Readonly<Record<SnapType, string>>;
    /** The standard colours, by `STANDARD_COLORS[].id`. */
    readonly colors: Readonly<Record<string, string>>;
    /** ByLayer, for the colour, linetype and lineweight pickers. */
    readonly byLayer: string;
    /**
     * Linetypes, by `LINETYPES[].id`. One without an entry shows its id: a
     * linetype's name is the drawing's data, the same in every language.
     */
    readonly linetypes: Readonly<Record<string, string>>;
    /** The preset views (`state.view.preset`), and `custom` for any other. */
    readonly views: Readonly<Record<ViewPreset | "custom", string>>;
    /** The ViewCube's face labels, by the faces of `state.viewCube`. */
    readonly viewCubeFaces: Readonly<Record<ViewCubeFace, string>>;
    /** The ViewCube's compass letters, by `state.viewCube`'s compass. */
    readonly compass: Readonly<Record<CompassLetter, string>>;
}

export type { EngineState }
/** Immutable snapshot of engine state consumed by the React UI. */
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
    /**
     * The view the viewport control names: the preset the camera looks along
     * (in the WCS, as -VIEW sets it), or `null` for a custom view.
     */
    readonly view: {
        readonly preset: ViewPreset | null;
    };
    /** The ViewCube, already projected for the current camera and UCS. */
    readonly viewCube: ViewCubeUi;
    /**
     * The ViewCube's UCS menu: the current UCS (the WCS, a saved one by name, or
     * neither — `*NO NAME*`) and the saved UCSs it can restore.
     */
    readonly ucsMenu: {
        readonly world: boolean;
        readonly name: string | null;
        readonly named: readonly string[];
    };
    /**
     * The cursor as the status bar reads it: in the current UCS, on the
     * elevation plane (AutoCAD's COORDS shows X, Y and Z).
     */
    readonly cursorUcs: Vec3 | null;
    /**
     * `cursorUcs` as the status bar writes it, `1.5000, 2.0039, 0.0000`: each
     * value at LUPREC, a zero unsigned (Absolute, COORDS 1).
     */
    readonly coordinates: string | null;
    readonly snap: {
        type: SnapType;
        point: Vec3;
    } | null;
    readonly snapActive: boolean;
    readonly snapEnabled: Readonly<Record<SnapType, boolean>>;
    /**
     * The one-shot object-snap override forced for the next point (AutoCAD's
     * Shift+right-click), `"none"` to suppress snapping for it, or null when the
     * running snaps apply.
     */
    readonly snapOverride: SnapType | "none" | null;
    /**
     * Screen position at which to pop the object-snap override menu, or null when
     * it is closed.
     */
    readonly snapOverrideMenu: Vec2 | null;
    /** The shortcut menu a right-click opened, or null when it is closed. */
    readonly shortcutMenu: ShortcutMenuUi | null;
    readonly orthoActive: boolean;
    /** Polar tracking (AutoCAD's POLAR / F10) on/off. */
    readonly polarActive: boolean;
    /** Polar tracking angle increment in degrees (e.g. 45). */
    readonly polarAngleStep: number;
    readonly objectSnapTrackingActive: boolean;
    readonly acquiredTrackingPoints: number;
    /** Selection cycling: the badge, the candidate list and its settings. */
    readonly selectionCycling: SelectionCyclingUi;
    /** The rollover tooltip, or null when the cursor is over no object at `Command:`. */
    readonly rollover: RolloverUi | null;
    readonly gridVisible: boolean;
    /** Snap mode (AutoCAD's SNAP / F9): the cursor is forced onto increments. */
    readonly snapModeActive: boolean;
    /** Whether snap uses the rectangular lattice or polar distance increments. */
    readonly snapModeType: SnapModeType;
    /** Snap lattice spacing in drawing units (AutoCAD's SNAPUNIT). */
    readonly snapSpacing: Vec2;
    /** Polar snap distance increment (AutoCAD's POLARDIST). */
    readonly snapPolarDistance: number;
    readonly dynamicInput: DynamicInputUi | null;
    readonly documentUnit: LengthUnit;
    readonly documentPrecision: number;
    /** AUPREC: the decimal places angles are written with. */
    readonly documentAnglePrecision: number;
    /** Global linetype scale (AutoCAD's LTSCALE). */
    readonly ltScale: number;
    /** The current dimension style's overall scale (AutoCAD's DIMSCALE). */
    readonly dimScale: number;
    /** Whether lineweights are drawn at real thickness (AutoCAD's LWDISPLAY). */
    readonly lwDisplay: boolean;
    /** All layers with live entity counts, for the layer manager. */
    readonly layers: ReadonlyArray<LayerInfo>;
    /** The layer new geometry is drawn on. */
    readonly currentLayerId: LayerId;
    /** CECOLOR: the colour new objects take, a hex value or `"ByLayer"`. */
    readonly currentColor: EntityColor | "ByLayer";
    /** CELTYPE: the linetype new objects take, a linetype's id or `"ByLayer"`. */
    readonly currentLinetype: LinetypeId | "ByLayer";
    /** CELWEIGHT: the lineweight new objects take, in millimetres, or `"ByLayer"`. */
    readonly currentLineweight: Lineweight | "ByLayer";
    readonly canUndo: boolean;
    readonly canRedo: boolean;
    /** Transparent auto-save lifecycle, drives the save button's spinner. */
    readonly saveState: SaveState;
    /** Epoch millis of the last successful auto-save, or null if never saved. */
    readonly lastSavedAt: number | null;
    /** The Properties palette: its type filter and what it edits. */
    readonly properties: PropertiesUi;
    /**
     * The layer shared by every selected entity, or null when the selection is
     * empty or spans multiple layers. Drives the ribbon's layer drop-down.
     */
    readonly selectionLayerId: LayerId | null;
    /**
     * The colour shared by every selected entity for the properties picker:
     * `"ByLayer"` when they all inherit their layer, a hex value when they share
     * one override, or null when the selection is empty or mixed.
     */
    readonly selectionColor: EntityColor | "ByLayer" | null;
    /**
     * The linetype shared by every selected entity for the properties picker:
     * `"ByLayer"` when they all inherit their layer, a concrete id when they share
     * one override, or null when the selection is empty or mixed.
     */
    readonly selectionLinetype: LinetypeId | "ByLayer" | null;
    /**
     * The lineweight shared by every selected entity, as
     * {@link selectionLinetype}: `"ByLayer"`, a millimetre value, or null.
     */
    readonly selectionLineweight: Lineweight | "ByLayer" | null;
    /** Every text style with the number of objects using it (the STYLE table). */
    readonly textStyles: ReadonlyArray<TextStyleInfo>;
    /** The style new text is created with. */
    readonly currentTextStyleId: TextStyleId;
    /** Every dimension style with its usage count (the DIMSTYLE table). */
    readonly dimStyles: ReadonlyArray<DimStyleInfo>;
    /** The style new dimensions are created with. */
    readonly currentDimStyleId: DimStyleId;
    /** Which style table the Styles palette shows. */
    readonly stylesTable: StylesPanelTab;
    /** Every block defined in the drawing (the Blocks palette's Current tab). */
    readonly blocks: ReadonlyArray<BlockInfo>;
    /** The palette panel: open or folded, and the palette it shows. */
    readonly palette: PaletteUi;
    /** Whether the Drawing Units dialog (UNITS) is showing. */
    readonly unitsDialog: boolean;
    /**
     * The task dialog `Properties - Locked objects`, with how many objects on a
     * locked layer an edit left out of the selection, or null while it is not
     * showing (desktop properties/d03-6).
     */
    readonly lockedObjectsDialog: {
        readonly removed: number;
    } | null;
    /**
     * The task dialog `Multiline Text - Unsaved Changes`: Escape in MTEXT's
     * editor, or TEXTEDIT's on an MTEXT, found changes (desktop text/d05-5).
     * Answered with `answerUnsavedText`.
     */
    readonly unsavedTextDialog: boolean;
    /** Clean Screen (CLEANSCREENON / CLEANSCREENOFF, Ctrl+0). */
    readonly cleanScreen: CleanScreenUi;
    /**
     * Command options (keywords) the active tool currently offers — AutoCAD's
     * `[Close/Undo]` prompt. The UI renders these as hint chips near the dynamic
     * input; empty when the tool exposes none.
     */
    readonly commandOptions: ReadonlyArray<CommandOptionUi>;
    /**
     * The dynamic prompt's option list, opened by the Down arrow: null while
     * shut. `marked` is the option Enter picks (AutoCAD's dot), the id of one of
     * `commandOptions`, or null before a second Down marks the first.
     */
    readonly commandOptionList: {
        readonly marked: string | null;
    } | null;
    /** The command prompt: what is typed, what it suggests and what it logged. */
    readonly commandLine: CommandLineUi;
    /**
     * The engine's vocabulary for a host's menus and pickers — object snaps,
     * colours, ByLayer, linetypes — in the interface language. The same object
     * until the language changes.
     */
    readonly names: EngineNames;
}

export type { LayerInfo }
/** A layer plus its live entity count, ready for the layer manager UI. */
export interface LayerInfo extends Layer {
    /** How many entities currently live on this layer. */
    readonly entityCount: number;
}

export type { ObjectType }
/**
 * An object type of the Properties palette's drop-down: an entity's, but an
 * array is a type of its own, its kind's, apart from the block references
 * (`Array (Rectangular)`, desktop properties/d06-2).
 */
export type ObjectType = EntityType | `${ArrayKind}Array` | `${DimensionKind}Dimension`;

export { PALETTE_TABS }
/** The palette panel's tabs, in their order. */
export declare const PALETTE_TABS: readonly [
    "properties",
    "layers",
    "blocks",
    "styles"
];

export type { PaletteTab }
export type PaletteTab = (typeof PALETTE_TABS)[number];

export type { PaletteUi }
/**
 * The docked palette panel: which palette it shows and whether it is open or
 * folded to its strip. Modeless, as AutoCAD's palettes are: nothing on the
 * drawing closes it, only its own button, its tab's trigger or a CLOSE command.
 */
export interface PaletteUi {
    readonly open: boolean;
    readonly tab: PaletteTab;
}

export { POINT_FILTERS }
/**
 * The point filters AutoCAD's Point Filters menu lists, in its order, with a
 * separator before `.XY` (acad.cuix's `ID_MnPointFi`).
 */
export declare const POINT_FILTERS: readonly [
    ".X",
    ".Y",
    ".Z",
    ".XY",
    ".XZ",
    ".YZ"
];

export type { PointFilterName }
/** A point filter as the Point Filters menu types it. */
export type PointFilterName = (typeof POINT_FILTERS)[number];

export { POLAR_ANGLE_MENU }
/**
 * POLARANG's increments as the status bar's Polar ▾ offers them (desktop
 * workspace/d01-m), each written with its first four multiples rounded:
 * `90, 180, 270, 360...`, 22.5 as `23, 45, 68, 90...` (e01-4). Choosing one
 * is `choosePolarAngle(step)`.
 */
export declare const POLAR_ANGLE_MENU: readonly {
    readonly step: number;
    readonly label: string;
}[];

export type { PromptSegment }
/** A span of a prompt: text, or the bracketed keyword list. */
export interface PromptSegment {
    readonly text: string;
    /** The `[Close/Undo]` span, which a host may set apart. */
    readonly keywords: boolean;
}

export type { PropertiesFilterOption }
/** One entry of the Properties palette's object type drop-down. */
export interface PropertiesFilterOption {
    /** The type it narrows the palette to; null is All. */
    readonly type: ObjectType | null;
    /** `All (6)`, `Line (5)`, `Array (Rectangular) (1)`. */
    readonly label: string;
}

export type { PropertiesUi }
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
    readonly filter: ObjectType | null;
    /**
     * All first when the selection mixes types, then each type, most objects
     * first; empty with nothing selected.
     */
    readonly filters: ReadonlyArray<PropertiesFilterOption>;
    /** Geometric properties of the objects edited, or null with nothing selected. */
    readonly info: SelectionInfo | null;
    /** As `selectionLayerId`, over the objects edited. */
    readonly layerId: LayerId | null;
    readonly color: EntityColor | "ByLayer" | null;
    readonly linetype: LinetypeId | "ByLayer" | null;
    readonly lineweight: Lineweight | "ByLayer" | null;
    /** The style shared by every edited text object, else null. */
    readonly textStyleId: TextStyleId | null;
    /** The style shared by every edited dimension, else null. */
    readonly dimStyleId: DimStyleId | null;
}

export type { PropertyEdit }
/** Makes a property row typeable, the way AutoCAD's Properties palette is. */
export interface PropertyEdit {
    readonly property: EntityProperty;
    /** Bare number to seed the input with (no unit). */
    readonly text: string;
    /** Unit shown after the input, e.g. `mm` or `°`. */
    readonly unit: string;
    /**
     * A value picked from a list (a polyline's Closed) rather than typed: each
     * choice's `value` is the text handed back, `text` the current one.
     */
    readonly choices?: ReadonlyArray<{
        readonly value: string;
        readonly label: string;
    }>;
}

export type { PropertyGroup }
/** A titled group of related properties (e.g. "Geometry"). */
export interface PropertyGroup {
    readonly id: string;
    readonly title: string;
    readonly rows: ReadonlyArray<PropertyRow>;
}

export type { PropertyRow }
/** A single label/value line shown in the properties panel. */
export interface PropertyRow {
    /** Stable across languages, unlike the label: a React key. */
    readonly id: string;
    readonly label: string;
    readonly value: string;
    /** Present when the value can be retyped to change the geometry. */
    readonly edit?: PropertyEdit;
}

export type { RolloverUi }
/**
 * AutoCAD's rollover tooltip (ROLLOVERTIPS 1): the object under the cursor at
 * `Command:`, its type and its Color, Layer and Linetype (desktop d20).
 */
export interface RolloverUi {
    readonly id: EntityId;
    /** Where the cursor stood as it came over the object, in canvas pixels. */
    readonly at: Vec2;
    /** The object's type, as the palette titles it ("Line"). */
    readonly title: string;
    /** Its colour's name (ByLayer, Red, or the colour as stored). */
    readonly color: string;
    /** The colour it shows, for the swatch. */
    readonly swatch: string;
    readonly layer: string;
    readonly linetype: string;
}

export type { SelectionCandidateUi }
/** One of the overlapping objects offered by selection cycling. */
export interface SelectionCandidateUi {
    readonly id: EntityId;
    /** Object type, as AutoCAD's Selection list box names them ("Line"). */
    readonly label: string;
}

export type { SelectionCyclingUi }
/** Snapshot of selection cycling (AutoCAD's SELECTIONCYCLING) for the UI. */
export interface SelectionCyclingUi {
    readonly active: boolean;
    /** Whether a click over a stack offers the Selection list box (value 2). */
    readonly showList: boolean;
    /** Objects under the pick box, topmost first; the badge shows when > 1. */
    readonly candidates: ReadonlyArray<SelectionCandidateUi>;
    /** The candidate a pick resolves to right now (Shift+Space walks these). */
    readonly currentId: EntityId | null;
    /** Screen position of the open Selection list box, or null when closed. */
    readonly listAt: Vec2 | null;
}

export type { SelectionInfo }
/**
 * Description of the current selection for the properties panel, modelled on
 * AutoCAD's Properties palette. `null` when nothing is selected.
 */
export interface SelectionInfo {
    /** Heading, e.g. "Line", "Circle" or "3 objects". */
    readonly title: string;
    readonly count: number;
    /** Rows of the palette's General section after its pickers (Thickness). */
    readonly general: ReadonlyArray<PropertyRow>;
    readonly groups: ReadonlyArray<PropertyGroup>;
}

export type { SelectionScope }
/**
 * What a selection edit applies to: the whole selection (the ribbon's
 * drop-downs) or the objects the Properties palette's type filter leaves.
 */
export type SelectionScope = "selection" | "properties";

export type { ShortcutMenuAction }
/** A fixed entry of a shortcut menu; the host words it by this id. */
export type ShortcutMenuAction = "repeat" | "cut" | "copy" | "copyBase" | "paste" | "undo" | "redo" | "pan" | "erase" | "move" | "copySelection" | "scale" | "rotate" | "deselectAll" | "properties" | "enter" | "cancel";

export type { ShortcutMenuEntry }
export type ShortcutMenuEntry = {
    readonly kind: "action";
    readonly action: ShortcutMenuAction;
}
/** A keyword of the prompt, as its brackets show it. */
 | {
    readonly kind: "option";
    readonly option: CommandOptionUi;
} | {
    readonly kind: "submenu";
    readonly submenu: "clipboard";
    readonly entries: ReadonlyArray<ShortcutMenuEntry>;
}
/** Osnap Overrides: the object-snap menu Shift+right-click opens. */
 | {
    readonly kind: "snapOverrides";
}
/**
 * Dimension Style ▸ over a selection of dimensions: the table's styles, the
 * one they share marked (null when they differ).
 */
 | {
    readonly kind: "dimensionStyle";
    readonly styles: ReadonlyArray<{
        readonly id: DimStyleId;
        readonly name: string;
    }>;
    readonly current: DimStyleId | null;
};

export type { ShortcutMenuMode }
/**
 * AutoCAD's three shortcut menus of the drawing area (SHORTCUTMENU 11): Default
 * with no command and nothing selected, Edit with objects selected, Command
 * while a command offers options.
 */
export type ShortcutMenuMode = "default" | "edit" | "command";

export type { ShortcutMenuUi }
/** The shortcut menu a right-click opened on the drawing. */
export interface ShortcutMenuUi {
    readonly mode: ShortcutMenuMode;
    /** Where it opened, in the canvas's pixels. */
    readonly at: Vec2;
    /** Its entries in AutoCAD's order, in the groups a separator parts. */
    readonly groups: ReadonlyArray<ReadonlyArray<ShortcutMenuEntry>>;
    /** The command Repeat runs, as the command line names it. */
    readonly repeat: string | null;
}

export type { SnapModeType }
/**
 * How the cursor is forced onto an increment: onto a rectangular lattice of
 * X/Y spacings, or onto distance increments measured along the engaged
 * Ortho/Polar alignment path (AutoCAD's SNAPTYPE).
 */
export type SnapModeType = "grid" | "polar";

export { SnapType }
/**
 * The kinds of snap the engine understands. Only a subset is implemented today,
 * but the type is exhaustive so new providers can be added without touching the
 * rest of the system. This mirrors the object-snap ("OSNAP") vocabulary of
 * classic CAD tools.
 */
export declare enum SnapType {
    Endpoint = "endpoint",
    Midpoint = "midpoint",
    Center = "center",
    Intersection = "intersection",
    /**
     * The point where two entities *would* meet if one or both were extended —
     * AutoCAD's "Apparent Intersection". Distinct from {@link Intersection},
     * which requires the geometries to actually cross.
     */
    ApparentIntersection = "apparentIntersection",
    Perpendicular = "perpendicular",
    Tangent = "tangent",
    /** The point a text object hangs off — AutoCAD's "Insertion". */
    Insertion = "insertion",
    /**
     * A point on the imaginary prolongation of a line, beyond its endpoints —
     * AutoCAD's "Extension". Lets a new point land on the line's extension.
     */
    Extension = "extension",
    /**
     * A point that keeps the segment being drawn *parallel* to an existing line —
     * AutoCAD's "Parallel". Needs a base point (the anchor), so it only offers
     * candidates while a point is pending.
     */
    Parallel = "parallel",
    /** The 0°/90°/180°/270° cardinal points of a circle. */
    Quadrant = "quadrant",
    Nearest = "nearest"
}

export type { StylesPanelTab }
/** Which of the two style tables the manager is showing. */
export type StylesPanelTab = "dimension" | "text";

export type { TextStyleInfo }
/**
 * A style plus how many objects wear it, for the style managers. The count is
 * what lets the UI grey out a delete AutoCAD would refuse ("you cannot delete a
 * style that is current or in use").
 */
export interface TextStyleInfo extends TextStyle {
    readonly entityCount: number;
}

export { VIEW_MENU }
/** The preset views as the viewport controls' view menu lists them. */
export declare const VIEW_MENU: readonly ViewPreset[];

export type { ViewCubeFace }
/**
 * AutoCAD's ViewCube as a model: its 26 parts, the view each one shows, and
 * what the cube looks like from the current camera, already projected, so a
 * host draws it without a line of geometry. Everything is in the frame of the
 * current UCS, which the cube is oriented to (NAVVCUBEORIENT 1).
 */
export type ViewCubeFace = "top" | "bottom" | "front" | "back" | "left" | "right";

export type { ViewCubePart }
/**
 * A face, an edge or a corner, named by the faces it touches: the top or the
 * bottom first, then the left or the right, then the front or the back
 * (`top`, `top-front`, `left-front`, `top-left-front`).
 */
export type ViewCubePart = string;

export type { ViewCubeRoll }
/** Which way the roll arrows turn the scene on the screen. */
export type ViewCubeRoll = "clockwise" | "counterclockwise";

export type { ViewCubeSide }
/** The neighbour a face view's triangles turn to, by where it is on the screen. */
export type ViewCubeSide = "up" | "down" | "left" | "right";

export type { ViewCubeTarget }
/**
 * What a press on the ViewCube landed on: a part, a compass letter (a drag
 * from it turns the ring), or the ring itself.
 */
export type ViewCubeTarget = {
    readonly part: ViewCubePart;
} | {
    readonly letter: CompassLetter;
} | {
    readonly ring: true;
};

export type { ViewCubeUi }
/** What `EngineState` gives a host to draw the ViewCube with. */
export interface ViewCubeUi {
    /** NAVVCUBE. */
    readonly visible: boolean;
    /** The faces turned to the viewer, farthest first. */
    readonly faces: readonly ViewCubeFaceUi[];
    readonly compass: ViewCubeCompassUi;
    /** The part the view looks along (a solid outline), or `null` (dashed). */
    readonly current: ViewCubePart | null;
    /** A face view: the roll arrows and the four triangles are on offer. */
    readonly faceView: boolean;
}

export type { ViewPreset }
export type ViewPreset = keyof typeof VIEW_PRESETS;

export { ZOOM_MENU }
/**
 * The Zoom drop-down's members that exist here, in the ribbon's order
 * (Extents, Window, Previous, …, In, Out); Realtime, All, Dynamic, Scale,
 * Center and Object are not offered. Each runs as `zoom(option)`.
 */
export declare const ZOOM_MENU: readonly ZoomOption[];

export type { ZoomOption }
/** A member of the navigation bar's Zoom drop-down. */
export type ZoomOption = "extents" | "window" | "previous" | "in" | "out";
```

### Commands

```ts
export { commandCatalog }
/**
 * Every command the prompt accepts — name, aliases and description, in
 * `locale`'s command language — read off a headless runtime rather than
 * restated, so a list built from it (the landing's catalogue, its counts) is
 * exactly the table the editor registers.
 */
export declare function commandCatalog(locale?: EngineLocale): CommandInfo[];

export type { CommandInfo }
/** A command as it is listed: the name, what else can be typed, what it does. */
export interface CommandInfo {
    /** The global name, the same in every language, e.g. `"LINE"`. */
    readonly id: string;
    /** The name in the command language, e.g. `"LINE"`. */
    readonly name: string;
    /** Extra uppercase forms that run it, e.g. `["L"]`. */
    readonly aliases: readonly string[];
    /** One-line description shown in the autocomplete list. */
    readonly description: string;
}

export { matchCommands }
/**
 * Autocomplete: commands whose name or any alias starts with what has been
 * typed, best match first (an exact alias beats a name prefix), like AutoCAD's
 * suggestion list.
 */
export declare function matchCommands(commands: readonly Pick<CommandInfo, "name" | "aliases" | "description">[], text: string, limit?: number): CommandSuggestion[];
```

### Storage and files

```ts
export type { Clipboard }
/**
 * The system clipboard, behind COPYCLIP / CUTCLIP / PASTECLIP. Both halves are
 * asynchronous because the browser's is: a write can be refused and a read can
 * prompt for permission or not exist at all. Neither is an error the user needs
 * to hear about — the runtime keeps what it last copied, so copy and paste go
 * on working inside the session whatever the host answers.
 */
export interface Clipboard {
    /** Puts `text` on the clipboard. Rejects when the host refuses. */
    write(text: string): Promise<void>;
    /** The clipboard's text, or `null` when there is none. */
    read(): Promise<string | null>;
}

export { createLocalStorageDrawingStore }
/**
 * localStorage implementation of the {@link DrawingStore} port. Returns `null`
 * outside the browser (SSR) so the application core stays environment-safe.
 * Failures are swallowed by contract: storage may be full or blocked (private
 * mode); manual file save still works.
 */
export declare function createLocalStorageDrawingStore(): DrawingStore | null;

export { createMemoryDrawingStore }
/**
 * A {@link DrawingStore} that lives only as long as the page: what an engine
 * embedded beside the editor autosaves to, so it can never write over the
 * drawing this device keeps for the editor. `initial` is what it restores.
 */
export declare function createMemoryDrawingStore(initial?: string | null): DrawingStore;

export type { DrawingStore }
/**
 * Key/value persistence for the transparent auto-save. Implemented by
 * localStorage in the browser; could be a file or IndexedDB elsewhere.
 */
export interface DrawingStore {
    /** Returns the stored drawing text, or `null` when none exists / unreadable. */
    read(): string | null;
    /** Persists the drawing text. Failures must not throw (fail quietly). */
    write(text: string): void;
}

export type { DrawingSummary }
/** What a page needs to know about a drawing without loading it. */
export interface DrawingSummary {
    /** Top-level objects in the drawing (block contents are not counted). */
    readonly objects: number;
    /** Entries in its layer table, the base layer included. */
    readonly layers: number;
}

export type { FileTransport }
/**
 * Explicit file save/open, the counterpart of {@link DrawingStore}'s implicit
 * auto-save. Implemented by a download + file picker in the browser; a host
 * embedding the engine can point it at its own backend instead.
 */
export interface FileTransport {
    /** Hands the drawing text to the user as a named file. */
    save(text: string, fileName: string): void;
    /**
     * Asks the user for a drawing file. Resolves with its text, or with `null`
     * when the pick was cancelled. Rejects only when the file cannot be read.
     */
    open(): Promise<string | null>;
}

export { readSavedDrawingSummary }
/**
 * What is auto-saved on this device, without loading it — so a page outside the
 * editor can offer to continue a drawing without knowing where it is kept. Null
 * when there is none, it is unreadable, or there is no browser storage.
 */
export declare function readSavedDrawingSummary(): DrawingSummary | null;

export type { SaveState }
/** Lifecycle of the transparent auto-save, surfaced to the UI save button. */
export type SaveState = "idle" | "saving" | "saved";
```

### Rendering

```ts
export { buildDrawingPreview }
/**
 * The drawing, or part of it, as a neutral scene with nothing but the objects:
 * no grid, cursor, snap markers or selection. It is built by the very scene
 * builder the editor draws with, so a preview can never disagree with how the
 * drawing looks. Null when there is nothing to frame.
 */
export declare function buildDrawingPreview(document: DocumentReader, options: DrawingPreviewOptions): Scene | null;

export type { CameraTransform }
/**
 * The world↔screen mapping the scene builder needs. The application layer's
 * `Viewport` satisfies it structurally; keeping the scene layer typed against
 * this minimal interface avoids a dependency on the application layer.
 */
export interface CameraTransform {
    readonly width: number;
    readonly height: number;
    readonly scale: number;
    /** A plan view's twist: radians CCW from world X to the direction drawn pointing right. */
    readonly twist: number;
    /** True when the view looks straight down the world Z axis, so a point's Z does not show. */
    readonly isPlan: boolean;
    worldToScreen(p: Vec2 | Vec3): Vec2;
    screenToWorld(p: Vec2): Vec2;
    worldToScreenDistance(distance: number): number;
}

export { CanvasScenePresenter }
/**
 * Canvas 2D render adapter: walks the neutral {@link Scene} display list and
 * draws it. This is the only place in the system that talks to
 * `CanvasRenderingContext2D`; an SVG or WebGL presenter could replace it
 * without touching the core.
 */
export declare class CanvasScenePresenter {
    /**
     * Draws a full frame. `dpr` scaling is applied here so the scene stays in
     * CSS pixels.
     */
    draw(ctx: CanvasRenderingContext2D, scene: Scene, dpr: number): void;
}

export type { DrawingPreviewOptions }
export interface DrawingPreviewOptions {
    /** Frame size in screen pixels. */
    readonly width: number;
    readonly height: number;
    /** Breathing room around the framed rectangle, in screen pixels. */
    readonly padding?: number;
    /** What to draw: the whole drawing by default. */
    readonly entities?: readonly Entity[];
    /**
     * What the camera frames: the whole drawing by default. Because the default
     * does not depend on `entities`, previews of different parts of one drawing
     * share a camera and overlay each other to the pixel.
     */
    readonly frame?: Bounds;
    /**
     * Draw lineweights (LWDISPLAY). Off by default: a thumbnail is a shape, not a
     * plot, and real lineweights would blot a small one out.
     */
    readonly lwDisplay?: boolean;
}

export { primitiveLength }
/**
 * How far a primitive's outline runs on screen — what a plotter would travel —
 * so an animation can give long strokes more time than short ones.
 */
export declare function primitiveLength(p: ScenePrimitive): number;

export type { Scene }
export interface Scene {
    /** Frame size in CSS pixels. */
    readonly width: number;
    readonly height: number;
    readonly background: string;
    readonly primitives: readonly ScenePrimitive[];
    /**
     * The BCP 47 tag of the command language its labels are in. A presenter
     * sets it on its text so that the page's own language — Arabic around an
     * English command language — never changes the fonts a generic family
     * (`monospace`) resolves to: the drawing looks the same in every page.
     */
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
    /**
     * A circular arc. Angles are in *screen* space (already transformed);
     * `counterclockwise` matches the Canvas 2D `arc()` sweep flag, so the
     * builder resolves the world→screen orientation once.
     */
    readonly kind: "arc";
    readonly center: Vec2;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
    readonly counterclockwise: boolean;
    readonly stroke: StrokeStyle;
} | {
    /**
     * An ellipse or elliptical arc. Like `arc`, everything here is already in
     * *screen* space: `rotation` and the two parameters are the arguments the
     * Canvas 2D `ellipse()` call takes, so the builder resolves the camera's
     * Y flip once instead of every renderer repeating it.
     */
    readonly kind: "ellipse";
    readonly center: Vec2;
    readonly radiusX: number;
    readonly radiusY: number;
    /** Major-axis direction in screen radians (clockwise-positive). */
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
    /** A polyline / polygon, e.g. triangle and diamond markers. */
    readonly kind: "path";
    readonly points: readonly Vec2[];
    readonly closed?: boolean;
    /**
     * Further closed rings filled together with `points` under the even-odd
     * rule, so a ring inside another punches a hole — a hatch's islands. The
     * same rule decides where a hatch's pattern lines are drawn, so the two
     * fill types agree about what is inside.
     */
    readonly subpaths?: readonly (readonly Vec2[])[];
    /**
     * Omit on a solid shape. A stroke around a very sharp corner spikes far
     * past the vertex through its mitre join — and by a screen-pixel amount,
     * so the spike never shrinks with the zoom (see dimension arrowheads).
     */
    readonly stroke?: StrokeStyle;
    /** Solid fill for a closed path, e.g. a dimension arrowhead. */
    readonly fill?: string;
} | {
    readonly kind: "label";
    readonly at: Vec2;
    readonly text: string;
    readonly color: string;
    readonly font?: string;
} | {
    /**
     * A *world-space* text object: unlike {@link ScenePrimitive} `label`,
     * which is chrome pinned to the screen at a fixed size, this one carries
     * the size and angle the drawing gives it, so it zooms and rotates with
     * the geometry.
     *
     * The presenter draws it with a transform, aligned along the baseline
     * by the renderer; where the baseline lies is the engine's, which
     * places a drawing text by Arial's metrics, not the font's em box.
     */
    readonly kind: "text";
    /** Screen position of the point on the alphabetic baseline it is aligned to. */
    readonly at: Vec2;
    readonly text: string;
    /** Capital-letter height in screen pixels. */
    readonly height: number;
    /** Baseline rotation in *screen* radians (clockwise-positive). */
    readonly rotation: number;
    /**
     * In a view off the plan, the text's own frame (X along the baseline, Y
     * down, the capitals `height` pixels tall) mapped to the screen as the
     * canvas's `transform(a, b, c, d)` takes it, in place of `rotation`.
     */
    readonly matrix?: readonly [
        number,
        number,
        number,
        number
    ];
    readonly align: TextAlign;
    readonly color: string;
    /** Font family; the presenter supplies a default. */
    readonly font?: string;
};

export type { StrokeStyle }
/**
 * A renderer-agnostic description of one frame: a flat display list of styled
 * primitives in *screen* (CSS-pixel) coordinates.
 *
 * The application layer builds a {@link Scene} from the document, viewport,
 * selection and transient interaction state; a concrete adapter (Canvas 2D
 * today — SVG, WebGL or a test serialiser tomorrow) merely walks the list and
 * draws. Nothing in here references the DOM, Canvas or React.
 */
export interface StrokeStyle {
    readonly color: string;
    readonly width: number;
    /** Dash pattern in pixels; omitted/empty means solid. A run of 0 is a dot. */
    readonly dash?: readonly number[];
    /** How far into {@link dash} the stroke starts, in pixels; 0 when absent. */
    readonly dashOffset?: number;
}

export type { SvgDecorator }
/** Extra attributes for one element, e.g. the timing of its animation. */
export type SvgDecorator = (primitive: ScenePrimitive, index: number) => Readonly<Record<string, string | number>> | undefined;

export type { SvgDocumentOptions }
export interface SvgDocumentOptions {
    /** Accessible name, emitted as `<title>` with `role="img"`. */
    readonly title?: string;
    /** Longer accessible description, emitted as `<desc>`. */
    readonly description?: string;
    /** Paint the scene's background; off when the page behind is the sheet. */
    readonly background?: boolean;
    /** Extra attributes for the root `<svg>`. */
    readonly attributes?: Readonly<Record<string, string | number>>;
}

export { SvgScenePresenter }
/**
 * SVG render adapter: the twin of `CanvasScenePresenter`, walking the same
 * neutral {@link Scene} but returning markup instead of drawing. It runs
 * anywhere — at build time on a server, in a test — because it touches no DOM.
 * A primitive kind added to the scene needs a branch here as well.
 */
export declare class SvgScenePresenter {
    constructor(options?: SvgScenePresenterOptions);
    /** A standalone `<svg>` document for the whole scene. */
    render(scene: Scene, options?: SvgDocumentOptions): string;
    /** Just the elements, for a caller that groups or times them itself. */
    elements(primitives: readonly ScenePrimitive[], decorate?: SvgDecorator): string;
}

export type { SvgScenePresenterOptions }
export interface SvgScenePresenterOptions {
    /**
     * The command language its labels are in (`Scene.lang`), set on every text
     * so the page's language never changes the font a generic family picks.
     */
    readonly lang?: string;
    /**
     * Maps a scene colour to what the SVG writes — {@link themePalette} turns
     * `THEME`'s into CSS custom properties, so a page can restyle the drawing
     * without rendering it again. Colours it does not know pass through.
     */
    readonly palette?: (color: string) => string;
    /** Decimals kept in coordinates; one is invisible at any sane zoom. */
    readonly precision?: number;
    /** Family for `text` primitives that name none. */
    readonly fontFamily?: string;
    /** Cap height ÷ em of {@link fontFamily}. */
    readonly capHeightRatio?: number;
    /**
     * Prepares every solid stroke to be plotted — `pathLength="1"`, so a CSS
     * `stroke-dashoffset` from 1 to 0 draws it along its length whatever its
     * size. Dashed strokes and fills are left alone: their dash array is taken.
     */
    readonly plot?: boolean;
    /**
     * The frame the elements will be shown in. Segments are clipped to it (see
     * {@link clipSegment}). {@link SvgScenePresenter.render} uses the scene's
     * own size.
     */
    readonly frame?: {
        readonly width: number;
        readonly height: number;
    };
}

export type { TextAlign }
/** Horizontal alignment of a `text` primitive around its point. */
export type TextAlign = "left" | "center" | "right";

export { THEME }
/**
 * Colour palette for the technical-drawing look. Pure data — usable by any
 * render backend and by tools composing overlay primitives.
 */
export declare const THEME: {
    readonly background: "#0b0f14";
    readonly gridMinor: "rgba(148, 163, 184, 0.08)";
    readonly gridMajor: "rgba(148, 163, 184, 0.16)";
    readonly axisX: "rgba(248, 113, 113, 0.55)";
    readonly axisY: "rgba(74, 222, 128, 0.55)";
    /**
     * The UCS icon, AutoCAD 2027's 3D one: White in model space, its arms and
     * letters alike (desktop ucs/d07-1, d01-2).
     */
    readonly ucsIcon: "#ffffff";
    /**
     * The 2D icon's axis colours, which the scene no longer draws (the 3D icon
     * is one colour); kept as THEME is public.
     */
    readonly ucsIconX: "#f87171";
    readonly ucsIconY: "#4ade80";
    readonly entity: "#e2e8f0";
    readonly entityHover: "#cbd5e1";
    /**
     * The selection's glow, laid over the object as AutoCAD's selection effect
     * does: blue at the edges, the object's colour paled beneath (desktop d15).
     */
    readonly selected: "rgba(59, 130, 246, 0.45)";
    /** Cold selection grip (unselected handle) — AutoCAD's blue square. */
    readonly grip: "#3b82f6";
    /** Hot grip currently being dragged — AutoCAD's red square. */
    readonly gripHot: "#ef4444";
    /** A selected polar array's ring through its base point, grey (desktop arrays/d11-2). */
    readonly arrayRing: "#8a8f96";
    /** TRIM's ✕ beside the cursor (desktop trim/d01-1z). */
    readonly trimBadge: "#eb5555";
    /** The circle-and-slash beside the cursor where a pick is refused (desktop trim/d09-1). */
    readonly refusedBadge: "#ffffff";
    /** The padlock beside the cursor over a locked layer's object (desktop properties/d01-1). */
    readonly lockedBadge: "#ffffff";
    /** MATCHPROP's paintbrush beside the pick box (desktop properties/d07-1). */
    readonly paintBadge: "#ffffff";
    /** The AutoSnap marker, AutoCAD's green as its dark theme draws it (desktop d05, d21). */
    readonly snap: "#00a500";
    /** The cursor's tooltips (a snap's name, Polar's reading): AutoCAD's light grey box. */
    readonly snapTooltipBg: "#999999";
    readonly snapTooltipBorder: "#000000";
    readonly snapTooltipText: "#000000";
    /** The crosshair drawn in place of the OS cursor, and the tracked point's ✕. */
    readonly crosshair: "#e4e5e6";
    /** OTRACK's paths and acquired points, green as Polar's (desktop d13). */
    readonly tracking: "#049606";
    readonly trackingSolid: "#049606";
    /** Polar tracking's path (desktop d12). */
    readonly polar: "#049606";
    /**
     * The rubber-band line drawn from the last point to the cursor while a draw
     * command is active. AutoCAD renders this in the object/layer colour as a
     * solid line — it looks just like the segment about to be committed — so it
     * matches {@link THEME.entity} rather than a distinct highlight colour.
     */
    readonly rubberBand: "#e2e8f0";
    /**
     * AREA's corners: AutoCAD's translucent green, sampled (25,91,37) over
     * (33,40,48) (desktop inquiry/d03-1).
     */
    readonly measureAreaFill: "rgba(0, 255, 0, 0.24)";
    /**
     * The dashed line PLINE draws from its last vertex at the width prompts and
     * along its arc's chord: amber beside a white polyline, so not the object's
     * colour (desktop pline/d03, d06).
     */
    readonly dashedRubberBand: "#d7a320";
    readonly preview: "#38bdf8";
    readonly selectionWindowFill: "rgba(64, 140, 255, 0.12)";
    /**
     * The window's outline, white over its blue as AutoCAD draws it, solid; the
     * crossing's dashed over its green, and a fence's (desktop erase/d02-1,
     * d03-1, d04-2).
     */
    readonly selectionWindowStroke: "#ffffff";
    readonly selectionCrossingFill: "rgba(74, 222, 128, 0.12)";
    readonly selectionCrossingStroke: "#ffffff";
};

export { themeCustomProperties }
/** The declarations {@link themePalette} refers to, e.g. `--cad-entity:#e2e8f0;`. */
export declare function themeCustomProperties(prefix?: string): string;

export { themePalette }
/**
 * `THEME`'s colours as CSS custom properties: a palette for
 * {@link SvgScenePresenter} that writes `var(--cad-entity)` instead of a hex.
 * Where two roles share a value the first one named in `THEME` wins.
 */
export declare function themePalette(prefix?: string): (color: string) => string;
```

### Drawing model

```ts
export type { BlockDefinition }
/**
 * A block definition: named geometry that can be placed any number of times by
 * an {@link InsertEntity}. Its {@link entities} are stored in the definition's
 * own coordinates and {@link basePoint} is the insertion base point — "the
 * point specified as the base point is used for subsequent insertions of the
 * block", and the point a reference rotates about.
 *
 * The name is the identity (there is no separate id), so redefining a block is
 * replacing the entry under the same name and every reference follows.
 */
export interface BlockDefinition {
    readonly id: BlockId;
    readonly name: string;
    readonly basePoint: Vec2;
    /** The base point's Z; absent means 0. */
    readonly baseElevation?: number;
    readonly entities: readonly Entity[];
}

export type { Bounds }
export interface Bounds {
    readonly min: Vec2;
    readonly max: Vec2;
}

export { COLOR_BYLAYER }
/**
 * The sentinel an entity's colour picker uses for "inherit the layer's colour"
 * — AutoCAD's ByLayer. An entity stores no `color` field in that case; this
 * value only ever travels through the UI/engine API.
 */
export declare const COLOR_BYLAYER = "ByLayer";

export type { ColorDef }
export interface ColorDef {
    readonly value: EntityColor;
    /** What names it: the key of its display name in the engine's catalog. */
    readonly id: string;
}

export { DEFAULT_LAYER_ID }
/** The always-present base layer, matching AutoCAD's layer `0`. */
export declare const DEFAULT_LAYER_ID: LayerId;

export type { DimStyle }
export interface DimStyle {
    readonly id: DimStyleId;
    readonly name: string;
    /** Height of the measurement text, in drawing units (DIMTXT). */
    readonly textHeight: number;
    /** Length of an arrowhead (DIMASZ). */
    readonly arrowSize: number;
    /** Gap between the measured point and where its extension line starts (DIMEXO). */
    readonly extensionOffset: number;
    /** How far an extension line runs past the dimension line (DIMEXE). */
    readonly extensionBeyond: number;
    /** Gap between the dimension line and its text (DIMGAP). */
    readonly textGap: number;
    /**
     * Distance each dimension line of a baseline chain is offset from the
     * previous one (DIMDLI), so DIMBASELINE never draws one over another.
     */
    readonly baselineSpacing: number;
    /**
     * Size of the centre mark a radial dimension draws (DIMCEN) — "the distance
     * from the center of the circle or arc to the end of the center mark". Drawn
     * only when the dimension line is placed outside the circle or arc, and not
     * at all when 0. AutoCAD's negative branch (centrelines instead of a mark) is
     * not modelled.
     */
    readonly centerMark: number;
    /** Decimal places shown in the measurement (DIMDEC). */
    readonly decimals: number;
    /**
     * Decimal places shown in an *angular* measurement (DIMADEC), independent of
     * {@link DimStyle.decimals}. AutoCAD's initial value is 0 — a fresh angular
     * dimension reads whole degrees — and a negative value means "display the
     * number of decimal places specified by DIMDEC".
     */
    readonly angleDecimals: number;
    /**
     * The character written for the decimal point in the drawn measurement
     * (DIMDSEP). ISO-25's is a comma, so a fresh dimension reads `12,5`; the
     * command line's `Dimension text =` still writes a point (p02).
     */
    readonly decimalSeparator: string;
    /**
     * Whether a length drops its trailing zeros (DIMZIN's 8): ISO-25 sets it, so
     * 100 reads `100` and 12.5 `12,5`. Angles keep theirs, DIMAZIN being 0
     * (p366: `22,50°` at DIMADEC 2).
     */
    readonly suppressTrailingZeros: boolean;
    /**
     * Whether the dimension line is drawn between the measured points even when
     * the text and arrowheads are outside them (DIMTOFL). ISO-25 sets it: a
     * radial dimension placed outside draws its line from the centre to the rim
     * and no centre mark (p301, p303); off, the centre mark instead (p306).
     */
    readonly forceLineInside: boolean;
    /**
     * Overall scale factor applied to every *size* above (DIMSCALE) — never to the
     * measurement, which always reports the true distance.
     *
     * This is how a drawing made at 1:1 in model space gets annotation that reads
     * at its plotted size: a 50 m building plotted at 1:100 wants a scale of 100,
     * so 2.5 mm of text becomes 250 drawing units tall. AutoCAD's alternative,
     * annotative dimensions scaled by the viewport, needs layouts and viewports
     * that this app does not have — which is also why the `0` DIMSCALE branch is
     * not modelled: without paper space AutoCAD defines it as exactly 1.
     */
    readonly scale: number;
}

export type { DimStyleId }
/**
 * Dimension styles name a reusable set of dimension settings, exactly as
 * AutoCAD's DIMSTYLE table does: dimension objects reference a style by id and
 * take their sizes from it.
 *
 * The table is deliberately minimal — the handful of variables that decide what
 * a linear dimension looks like — but it is persisted from the start so richer
 * settings (arrowhead blocks, tolerances, alternate units) can be added without
 * changing the shape of the drawing file, the way {@link TextStyle} did.
 *
 * Every default below is AutoCAD's own *metric* initial value (the acadiso /
 * ISO-25 template), which is the one that matches this app's millimetre units.
 */
export type DimStyleId = string;

export type { DocumentReader }
/**
 * Read-only view of the document. Tools, snapping providers and the scene
 * builder receive this interface instead of the mutable class, so the compiler
 * guarantees they cannot change the drawing behind the command layer's back.
 */
export interface DocumentReader {
    readonly size: number;
    getSettings(): DocumentSettings;
    getEntities(): Entity[];
    get(id: EntityId): Entity | undefined;
    has(id: EntityId): boolean;
    pick(point: Vec2, tolerance: number): Entity | null;
    /** Every pickable entity under the pick box, topmost first. */
    pickAll(point: Vec2, tolerance: number): Entity[];
    /**
     * {@link pickAll} with the distance measured by `distanceOf` (a view off
     * the plan measures on screen) and `tolerance` in the same units; with
     * `locked`, a locked layer's objects too, as a pick at `Command:` takes them.
     */
    pickAllBy(distanceOf: (entity: Entity) => number, tolerance: number, locked?: boolean): Entity[];
    /** All layers in creation order (the base layer `0` first). */
    getLayers(): Layer[];
    getLayer(id: LayerId): Layer | undefined;
    /** The layer new geometry is drawn on. */
    getCurrentLayerId(): LayerId;
    /** All text styles in creation order (the base style `Standard` first). */
    getTextStyles(): TextStyle[];
    getTextStyle(id: TextStyleId): TextStyle | undefined;
    /** The style new text is created with. */
    getCurrentTextStyleId(): TextStyleId;
    /** All dimension styles in creation order (the base `ISO-25` first). */
    getDimStyles(): DimStyle[];
    getDimStyle(id: DimStyleId): DimStyle | undefined;
    /** The style new dimensions are created with. */
    getCurrentDimStyleId(): DimStyleId;
    /** All block definitions, in creation order. */
    getBlocks(): BlockDefinition[];
    getBlock(id: BlockId): BlockDefinition | undefined;
    /**
     * The block table as a plain function, for the pure helpers that have to look
     * inside a block reference (bounds, hit-testing, the scene builder).
     */
    blockLookup(): BlockLookup;
    /** Resolves an entity's effective colour: its own override, else ByLayer. */
    resolveEntityColor(entity: Entity): string;
    /** Resolves an entity's effective linetype: its own override, else ByLayer. */
    resolveEntityLinetype(entity: Entity): LinetypeId;
    /** Resolves an entity's effective lineweight: its own override, else ByLayer. */
    resolveEntityLineweight(entity: Entity): Lineweight;
    /** True when the entity's layer is on (visible). */
    isEntityVisible(entity: Entity): boolean;
    /**
     * True when the entity can be selected at `Command:`: its layer is on. A
     * locked layer's objects are selected too (desktop properties/d02-1).
     */
    isEntitySelectable(entity: Entity): boolean;
    /** True when the entity can be edited: selectable, its layer not locked. */
    isEntityEditable(entity: Entity): boolean;
}

export type { Entity }
export type Entity = LineEntity | CircleEntity | ArcEntity | EllipseEntity | SplineEntity | PolylineEntity | Polyline3dEntity | TextEntity | MTextEntity | AttributeDefinitionEntity | DimensionEntity | HatchEntity | InsertEntity;

export type { EntityColor }
/**
 * Colour is the first of the three "ByLayer" appearance properties, next to
 * linetype and lineweight: a layer carries the colour its entities inherit and
 * an entity may override it with its own ("ByObject").
 *
 * A colour is stored as a CSS hex string. The standard palette below mirrors
 * AutoCAD's first seven index colours, which is what its colour picker offers
 * as quick choices; any other hex value is still valid, so a custom colour
 * needs no special case.
 */
export type EntityColor = string;

export { entityDrawOrder }
/**
 * Where an entity sits in the paint order: lower is drawn first, and therefore
 * further back. Only hatches move — HPDRAWORDER's initial value is 3, "send
 * behind boundary", so a fill never paints over the outline it was traced from
 * and a click on that outline picks the outline. There is no per-object draw
 * order here, so "behind its boundary" is approximated by "behind everything",
 * which is the same thing for every drawing a single hatch appears in.
 */
export declare function entityDrawOrder(entity: Entity): number;

export type { EntityId }
/**
 * Entities are the CAD domain model: real geometry in world coordinates, never
 * screen pixels, so a drawing is resolution- and zoom-independent. They are
 * immutable plain data operated on by the pure functions in this module.
 */
export type EntityId = string;

export type { EntityProperty }
/** A geometry value that can be retyped directly on a selected entity. */
export type EntityProperty = "startX" | "startY" | "endX" | "endY" | "radius" | "diameter"
/** A circle's, which set its radius (desktop circle/d10). */
 | "circumference" | "area" | "majorRadius" | "minorRadius"
/** An ellipse's minor radius over its major, the major kept. */
 | "radiusRatio" | "centerX" | "centerY" | "startAngle" | "endAngle" | "totalAngle" | "positionX" | "positionY" | "textHeight" | "rotation" | "definedWidth" | "lineSpaceFactor" | "lineSpaceDistance" | "dimensionRotation"
/** A dimension's Text rotation (DXF 53): 0 is the default orientation. */
 | "dimensionTextRotation"
/**
 * A dimension's Text position X / Y (DXF 11) and Text override (DXF 1):
 * the runtime's, since where the text stands depends on its style, and an
 * override is text, not a number.
 */
 | "textPositionX" | "textPositionY" | "dimensionText" | "patternScale" | "patternAngle"
/** A hatch's pattern origin (DXF 43, 44), where its lines start. */
 | "originX" | "originY"
/** A reference's Scale X and Scale Y (desktop blocks/d03-2); its Z is |X|, read-only. */
 | "insertScaleX" | "insertScaleY"
/** The palette's current vertex of a polyline, or point of a spline, 1-based: the runtime's, no geometry. */
 | "vertex" | "vertexX" | "vertexY"
/** A 3D polyline's vertex Z, in the WCS here like the Z rows. */
 | "vertexZ" | "startSegmentWidth" | "endSegmentWidth" | "globalWidth"
/** A polyline's Closed, a choice: 1 Yes, 0 No. */
 | "closed"
/** An array's rows (desktop arrays/d13); its Radius is `radius`. */
 | "arrayColumns" | "arrayColumnSpacing" | "arrayRows" | "arrayRowSpacing" | "arrayRowElevation" | "arrayLevels" | "arrayLevelSpacing"
/** A ring's Direction, a choice: 1 Clockwise, 0 Counter-clockwise. */
 | "arrayClockwise" | "arrayItems" | "arrayAngleBetween" | "arrayFillAngle"
/** A ring's Rotate items, a choice: 1 Yes, 0 No. */
 | "arrayRotateItems"
/** A path array's Method, a choice: 1 Measure, 0 Divide. */
 | "arrayMethod" | "arrayItemSpacing"
/** A path array's Align items, a choice: 1 Yes, 0 No. */
 | "arrayAlignItems" | ZProperty;

export type { EntityType }
export type EntityType = "line" | "circle" | "arc" | "ellipse" | "spline" | "polyline" | "polyline3d" | "text" | "mtext" | "attdef" | "dimension" | "hatch" | "insert";

export { formatAngle }
export declare function formatAngle(degrees: number, settings: DocumentSettings): string;

export { formatLength }
export declare function formatLength(value: number, settings: DocumentSettings): string;

export { HATCH_PATTERNS }
/**
 * The patterns of acadiso.pat, the file a metric drawing reads (AutoCAD 2027,
 * `R26.0/enu/Support`), each `.pat` line quoted beside its data; generated
 * from them line for line they draw what EXPLODE leaves of AutoCAD's hatch
 * (probes hatch/p300–p307). The file's other ~60 patterns are not shipped.
 * In the file's order, which `?` lists them in (p221).
 */
export declare const HATCH_PATTERNS: readonly HatchPatternDef[];

export type { HatchPatternDef }
export interface HatchPatternDef {
    /** The `.pat` name, which a drawing stores; its display name and its `?`
     * description are the engine catalog's. */
    readonly id: HatchPatternId;
    readonly lines: readonly HatchPatternLine[];
}

export type { HatchPatternId }
/**
 * Hatch patterns, modelled exactly as AutoCAD's `.pat` files define them
 * (acad.pat / acadiso.pat). A pattern is a header plus one or more *descriptor
 * lines*:
 *
 * ```
 * *pattern-name, description
 * angle, x-origin,y-origin, delta-x,delta-y, dash-1,dash-2, …
 * ```
 *
 * Each descriptor line is the first member of an **infinite family of parallel
 * lines**: `delta-y` is the spacing measured perpendicular to them, `delta-x`
 * the displacement between members *along* the line (which only matters to a
 * dashed pattern, where it slides the dash phase). A dash run is pen-down when
 * positive and pen-up when negative, cycling from the line's own origin.
 *
 * SOLID is not a line family at all — AutoCAD lists it beside the predefined
 * patterns as a separate fill type — so it carries no descriptor lines and is
 * recognised by {@link isSolidHatchPattern}.
 *
 * Adding a pattern is adding data here: transcribe its `.pat` definition
 * through `family`, which turns the angle to radians (this layer's
 * convention).
 */
export type HatchPatternId = string;

export type { HatchPatternLine }
/** One descriptor line of a pattern: an infinite family of parallel lines. */
export interface HatchPatternLine {
    /** Direction of the family, radians CCW from +X (`.pat` states degrees). */
    readonly angle: number;
    /** Base point of the first member, in pattern units. */
    readonly origin: Vec2;
    /** Displacement between members *along* the line; only dashes see it. */
    readonly deltaX: number;
    /** Spacing between members, measured perpendicular to them. Never zero. */
    readonly deltaY: number;
    /**
     * Dash runs in pattern units: positive draws, negative skips, `0` is a dot.
     * Empty means a continuous line.
     */
    readonly dashes: readonly number[];
}

export { INVALID_LAYER_NAME_CHARACTERS }
/**
 * What a layer name may not hold, as AutoCAD's Layer Properties Manager lists
 * it (desktop d04-13, the string in `AcLayer.resources.dll`).
 */
export declare const INVALID_LAYER_NAME_CHARACTERS = "<>/\\\":;?*|,=`";

export type { Layer }
/**
 * A drawing layer. `visible` maps to AutoCAD's On/Off; `locked` maps to
 * Lock/Unlock (locked geometry is drawn faded, snappable and selectable at
 * `Command:`, never edited).
 */
export interface Layer {
    readonly id: LayerId;
    readonly name: string;
    /** Hex colour applied to entities that live on this layer. */
    readonly color: string;
    /** Default linetype id for entities on this layer (their "ByLayer" dash). */
    readonly linetype: LinetypeId;
    /** Default lineweight in mm for entities on this layer (their "ByLayer" thickness). */
    readonly lineweight: Lineweight;
    /** On/Off — hidden layers are neither drawn, picked nor snapped. */
    readonly visible: boolean;
    /** Locked: drawn faded and snappable, selectable, never edited. */
    readonly locked: boolean;
}

export type { LayerId }
export type LayerId = string;

export type { LayerNameRefusal }
/**
 * Why a layer cannot take a name: it is layer 0 (`base`, d04-16, p319),
 * another layer has it in any case (`inUse`, d04-11, d04-14, p320), or it
 * holds a character AutoCAD refuses (`invalid`, d04-13, p321).
 */
export type LayerNameRefusal = "base" | "inUse" | "invalid";

export { LENGTH_PRECISIONS }
/**
 * LUPREC's choices as the Drawing Units dialog lists them in Decimal units,
 * indexed by the places they stand for: `0`, `0.0` … `0.00000000`.
 */
export declare const LENGTH_PRECISIONS: readonly string[];

export { LENGTH_UNITS }
export declare const LENGTH_UNITS: LengthUnit[];

export { LengthUnit }
/**
 * Document-level unit configuration. One *world unit* equals one *document
 * unit*, so geometry is stored unit-agnostically and the unit is used for
 * display and for interpreting typed input (dynamic input, dimensions, ...).
 * The decimal precision controls how measurements are formatted.
 */
export declare enum LengthUnit {
    Millimeter = "mm",
    Centimeter = "cm",
    Meter = "m"
}

export { LINETYPE_BYLAYER }
/**
 * The sentinel an entity's linetype picker uses for "inherit the layer's
 * linetype" — AutoCAD's ByLayer. An entity stores no `linetype` field in that
 * case; this value only ever travels through the UI/engine API.
 */
export declare const LINETYPE_BYLAYER = "ByLayer";

export type { LinetypeDef }
export interface LinetypeDef {
    /** The name a drawing stores, and the key of its display name. */
    readonly id: LinetypeId;
    /** Dash/gap run lengths in world units; empty means a solid line. */
    readonly pattern: readonly number[];
}

export type { LinetypeId }
/**
 * Linetypes give geometry a dash pattern ("Continuous", "Dashed", "Center", …)
 * exactly the way {@link Layer} colours give it a colour. A layer carries a
 * default linetype (an entity's "ByLayer" appearance) and an entity may
 * override it with its own ("ByObject").
 *
 * A pattern is a list of dash/gap lengths in *world units* (positive = dash,
 * the next = gap, alternating), matching AutoCAD's linetype definition. The
 * global `ltScale` (AutoCAD's LTSCALE) multiplies every length so the same
 * pattern reads well at any drawing size. `Continuous` has an empty pattern
 * (solid).
 */
export type LinetypeId = string;

export { LINETYPES }
/**
 * The built-in linetypes, in the order shown by the pickers. Each is
 * acadiso.lin's, the file a metric drawing (MEASUREMENT 1) loads from: probe
 * line/p202 reads them back with `tblsearch`. A dash of 0 is a dot. WHY all
 * six loaded in every drawing, where AutoCAD's new one holds Continuous alone
 * (properties/p221) and loads the rest from the file: there is no Load option
 * or Linetype Manager here to load one.
 */
export declare const LINETYPES: readonly LinetypeDef[];

export type { Lineweight }
/** A lineweight in millimetres. */
export type Lineweight = number;

export { LINEWEIGHT_BYLAYER }
/**
 * The sentinel an entity's lineweight picker uses for "inherit the layer's
 * lineweight" — AutoCAD's ByLayer. An entity stores no `lineweight` field in
 * that case; this value only ever travels through the UI/engine API.
 */
export declare const LINEWEIGHT_BYLAYER = "ByLayer";

export { lineweightLabel }
/** A lineweight's display text, e.g. `"0.25 mm"`. */
export declare function lineweightLabel(lineweight: Lineweight): string;

export { lineweightPixels }
/**
 * The screen width in pixels used to draw a lineweight. Zoom is deliberately
 * ignored (AutoCAD's model-space behaviour) and `minimum` keeps the thinnest
 * weights — including 0.00 mm, which means "as thin as possible" — visible.
 */
export declare function lineweightPixels(lineweight: Lineweight, minimum: number): number;

export { LINEWEIGHTS }
/** AutoCAD's standard lineweight values, in millimetres. */
export declare const LINEWEIGHTS: readonly Lineweight[];

export { matchesWildcard }
/**
 * AutoCAD's wild-card name matching, as the Blocks palette's Filter documents
 * it: "`?` for a single character and `*` for multiple characters".
 * Case-insensitive, and an empty pattern matches everything.
 */
export declare function matchesWildcard(name: string, pattern: string): boolean;

export { normalizeColor }
/**
 * Validates a hex colour and returns it in canonical `#rrggbb` lowercase form
 * (expanding the `#rgb` shorthand), or null when it is not a hex colour.
 */
export declare function normalizeColor(value: string): EntityColor | null;

export { STANDARD_COLORS }
/** AutoCAD's index colours 1-7, the quick choices of its colour picker. */
export declare const STANDARD_COLORS: readonly ColorDef[];

export type { TextStyle }
export interface TextStyle {
    readonly id: TextStyleId;
    readonly name: string;
    /**
     * Fixed capital-letter height in drawing units. **Zero means "not fixed"**
     * (AutoCAD's convention): the TEXT command then prompts for a height each
     * time, instead of forcing the style's own.
     */
    readonly height: number;
}

export type { TextStyleId }
/**
 * Text styles name a reusable set of text settings, exactly as AutoCAD's STYLE
 * table does: text objects reference a style by id and inherit its defaults.
 *
 * The table is deliberately minimal for now — a name and a fixed height — but
 * it is persisted from the start so richer settings (font, width factor,
 * oblique angle) can be added without changing the shape of the drawing file.
 */
export type TextStyleId = string;

export { unitsSampleOutput }
/**
 * The Drawing Units dialog's Sample Output ("an example of the current
 * settings for units and angles"): a point typed as X,Y,Z and one as
 * distance<angle,Z, written as the drawing writes them.
 */
export declare function unitsSampleOutput(settings: Pick<DocumentSettings, "precision" | "anglePrecision">): readonly [
    string,
    string
];

export type { Vec2 }
/** Immutable, dependency-free 2D vector shared across the CAD system. */
export interface Vec2 {
    readonly x: number;
    readonly y: number;
}

export type { Vec3 }
/**
 * A point or displacement with a Z. Most of the kernel's curves stay in
 * `Vec2`: a planar object's Z is one number beside its points rather than a
 * third coordinate on each of them. A spline's and a 3D polyline's points
 * carry their own.
 */
export interface Vec3 extends Vec2 {
    readonly z: number;
}
```

### Languages

```ts
export type { CommandCatalog }
/**
 * The command language. `names` and `keywords` are vocabulary, not messages: a
 * keyword marks its abbreviation in capitals (`desHacer`), as `initget` does.
 */
export type CommandCatalog = Compiled<Omit<Commands, "names" | "keywords" | "promptKeywords" | "promptForms" | "answerForms">> & {
    readonly names: {
        readonly [C in CommandName]: readonly string[];
    };
    /**
     * A keyword's global word is its id, so English ships none of these: its
     * source lists them as the inventory other languages translate.
     */
    readonly keywords?: {
        readonly [C in keyof Commands["keywords"]]?: {
            readonly [K in keyof Commands["keywords"][C]]?: string;
        };
    };
    /**
     * A keyword one prompt spells otherwise than its command's table, as each
     * AutoCAD prompt declares its own (`initget`): EMPALME's `[RAdio]`, but
     * `Designe polilínea 2D o [Radio]:`.
     */
    readonly promptKeywords?: {
        readonly [P in keyof Commands["promptKeywords"]]?: {
            readonly [K in keyof Commands["promptKeywords"][P]]?: string;
        };
    };
    /**
     * The form of a prompt's default, as each language's string writes it: a
     * prompt left out is `spaced`. The same prompt can differ by language
     * (`[Zdepth]<0,0,0>:`, pt-BR `[profundidadeZ] <0,0,0>:`).
     */
    readonly promptForms: {
        readonly [P in keyof Commands["prompts"]]?: PromptForm;
    };
    /**
     * How the history writes an answer after a prompt, as each language's
     * string ends: a prompt left out is `spaced`. DIMSPACE's are `tight` in
     * every language, PEDIT's first only in pt-BR.
     */
    readonly answerForms: {
        readonly [P in keyof Commands["prompts"]]?: AnswerForm;
    };
};

export type { CommandName }
/** A command's global (English, language-independent) name. */
export type CommandName = keyof Commands["names"];

export type { EngineCatalog }
/** A complete catalog: the English one built into the engine. */
export interface EngineCatalog {
    readonly tag: string;
    readonly interface: InterfaceCatalog;
    readonly commands: CommandCatalog;
}

export type { EngineLocale }
/**
 * A language the engine is handed explicitly (`new CadEngine(canvas, { locale
 * })`), never registered: one process can draw in several at once.
 *
 * `interface` may leave out any key, and that key is English's. `commands` is
 * the command language and is complete or absent: without it the command
 * language is the global one, as in an English AutoCAD; with it, every command
 * it does not name is reached by its global name alone (`ERASE`, never `E`),
 * while a missing keyword is its global word and any other missing message is
 * English's. Every message is compiled (`icu-minify/compile`) — `names` and
 * `keywords` are words, not messages. The shape follows `en.json`: changing
 * it is a breaking change of the engine.
 */
export interface EngineLocale {
    /** BCP 47, what `Intl` receives (plurals, and digits pinned to latin). */
    readonly tag: string;
    readonly interface: DeepPartial<InterfaceCatalog>;
    readonly commands?: DeepPartial<CommandCatalog>;
}

export { engineText }
/**
 * The engine's text in `locale` (English by default), shared by everything
 * that renders in that language: a build that records many demos in several
 * languages formats each once.
 */
export declare function engineText(locale?: EngineLocale): EngineText;

export type { EngineText }
/**
 * One language as the engine speaks it: the locale laid over English key by
 * key, formatted with latin digits. Everything the engine says goes through
 * here — the interface (palettes, pickers) and the command language (names,
 * prompts, keywords, messages, what is drawn on the canvas) — so no text lives
 * anywhere else in the engine.
 */
export declare class EngineText {
    readonly locale: EngineLocale;
    readonly tag: string;
    /** The command language's tag: the locale's own, or English's for the global one. */
    readonly commandTag: string;
    constructor(locale?: EngineLocale);
    /** A tool's label in the rail; a tool the catalog does not know shows its id. */
    tool(id: string): string;
    /** What a command that is not a tool does, for the autocomplete list. */
    description(command: string): string | null;
    entity(type: EntityType, count: number): string;
    /** One object's name: an array's is its kind's (`Array (Rectangular)`), not a reference's. */
    entityName(entity: Entity): string;
    propertyTitle(id: keyof Property["title"], count?: number): string;
    /**
     * An entry of the Properties palette's object type drop-down: `All (6)`,
     * `Line (5)`, `Array (Rectangular) (1)`.
     */
    propertiesFilter(type: ObjectType | null, count: number): string;
    propertyGroup(id: keyof Property["group"]): string;
    propertyRow(id: keyof Property["row"]): string;
    propertyValue(id: keyof Property["value"]): string;
    justify(justify: TextJustify): string;
    dimensionKind(kind: DimensionKind): string;
    /** A hatch pattern as the palette names it; data it does not know shows its id. */
    hatchPattern(id: string): string;
    /** The names a host's menus and pickers show, built once per language. */
    names(): EngineNames;
    /** A command's name first, then its aliases, in the command language. */
    commandNames(command: string): readonly string[];
    /**
     * The global name of the command `text` names: a name or alias of the
     * command language, or `_` and a global name.
     */
    resolveCommand(text: string): string | null;
    /** The keywords `ids` of `command`, as the command language and `_` spell them. */
    keywords(command: string | null, ids: readonly string[], prompt?: PromptId | null): Keyword[];
    /** How `command` spells keyword `id`, at `prompt` when it spells it its way. */
    keyword(command: string | null, id: string, prompt?: PromptId | null): string;
    /**
     * How a prompt lists a keyword whose word AutoCAD follows with a note —
     * `Ttr (tan tan radius)` — or null for one listed as its word. At `prompt`,
     * its own label comes first (pt-BR UCS New lists `EIxo z`, declared
     * `EIxoz`; ucs/p225), and a label that only repeats the command's word
     * gives way to the word that prompt spells otherwise (pt-BR SPLINEDIT lists
     * `saIr` at its options, `Sair` at Weight's; inquiry/p429).
     */
    keywordLabel(command: string | null, id: string, prompt?: PromptId | null): string | null;
    /** A keyword's abbreviation in the command language (`U` for Undo). */
    abbreviation(command: string | null, id: string): string;
    /** How prompt `id` writes its default in the command language. */
    promptForm(id: PromptId): PromptForm;
    /** How the history writes an answer after prompt `id` in the command language. */
    answerForm(id: PromptId): AnswerForm;
    prompt(id: PromptId, values?: MessageValues): string;
    message(id: MessageId, values?: MessageValues): string;
    fileError(code: FileErrorCode): string;
    feedback(id: FeedbackId, values?: MessageValues): string;
    /** The object snap tooltip drawn beside a marker. */
    snapFeedback(type: SnapType): string;
    /** One line of the HATCH `?` listing. */
    hatchPatternListing(id: string): string;
    /**
     * One line of -DIMSTYLE's STatus and Variables: the name in 12 columns, the
     * value in 21, the description (probes dimensions/p06, p07). A name longer
     * runs into its value, as `DIMTXTDIRECTIONOff` does there. A switch is
     * worded in the command language (`On`, es `ACT`).
     */
    dimVariableListing(name: string, value: string | boolean): string;
    defaultLayerName(n: number): string;
    /** The Text Style dialog's New…, `style1` (table 9391). */
    defaultTextStyleName(n: number): string;
    copyName(name: string): string;
    fileName(date: string): string;
    /** The label a dynamic-input box shows once it holds a point. */
    coordinateLabel(polar: boolean): string;
    /** `Erase: Yes` — a keyword and the value it is set to. */
    optionValue(keyword: string, value: string): string;
    keywordList(words: readonly string[]): string;
    /** What joins the keywords AutoCAD asks to choose from: `CEnter or CLose?`. */
    keywordOr(): string;
    /** The word the neutral prompt is headed with (`Command`). */
    idleHead(): string;
    /** The neutral prompt, `Command:`. */
    idlePrompt(): string;
    /** `LINE Specify first point`: the head of a running command's prompt. */
    commandQuestion(command: string, question: string): string;
    /** A command run transparently, as typed and echoed: `'ZOOM`. */
    transparentCommand(command: string): string;
    /** A transparent command's question, `>>Specify first corner`. */
    transparentPrompt(question: string): string;
    /** An object snap given at a point prompt, as answered: `_endp of`. */
    snapOverride(snap: string, to: boolean | null): string;
    /**
     * A prompt as the history keeps it once answered: `Specify next point or
     * [Undo]: 100`, or `tight`, against its colon (pt-BR `…[Múltiplo]:M`).
     */
    answered(prompt: string, answer: string, form?: AnswerForm): string;
    /**
     * A prompt from its parts: what is asked (a command name, a field, or the
     * neutral `Command`), the keywords on offer and the one Enter keeps, e.g.
     * `LINE [Close/Undo]:` or `UCSICON [ON/OFF/Noorigin/ORigin] <ON>:`;
     * `tight`, the default written against them (`[Zdepth]<0,0,0>:`); `open`,
     * a default with no colon after it (`OK? <Y>`).
     */
    composePrompt(head: string, keywords: readonly string[], fallback?: string | null, form?: PromptForm): PromptSegment[];
}

export { extendLocale }
/**
 * `base` with the host's own words laid over it, key by key: each entry given
 * replaces the base's and everything else is kept. A message is a compiled one
 * (`icu-minify/compile`, in the host's build); a string without arguments
 * already is one. A list of names is replaced whole.
 *
 * Giving `commands` to a language that has none (Arabic) gives it a command
 * language of its own, with the rules of one: a command it leaves out is
 * reached by its global name only.
 */
export declare function extendLocale(base: EngineLocale, overrides: LocaleOverrides): EngineLocale;

export type { InterfaceCatalog }
/**
 * The interface language. A linetype or hatch pattern whose display name is its
 * id is left out of the English module, which falls back to the id.
 */
export type InterfaceCatalog = Omit<Compiled<Source["interface"]>, "linetype" | "hatchPattern"> & {
    readonly linetype: Partial<Compiled<Source["interface"]["linetype"]>>;
    readonly hatchPattern: Partial<Compiled<Source["interface"]["hatchPattern"]>>;
};

export type { LocaleOverrides }
/** What a host replaces in a language: any message, name list or keyword. */
export interface LocaleOverrides {
    readonly interface?: DeepPartial<InterfaceCatalog>;
    readonly commands?: DeepPartial<CommandCatalog>;
}
```

### Demos

```ts
export { demo }
/** Starts a script; each call returns a new script, so scripts can share a prefix. */
export declare function demo(options?: DemoOptions): DemoScript;

export type { DemoAction }
/**
 * A scripted drafting session, written in the same chained style as the test
 * harness and replayed through {@link CadDriver}. Replaying it yields every
 * step's prompt, what the engine printed and which objects appeared — the raw
 * material for an animated transcript that cannot drift from the product.
 */
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
/** A layer the session starts with, as a drawing template would provide. */
export interface DemoLayer {
    readonly name: string;
    readonly color?: string;
    readonly linetype?: LinetypeId;
    readonly lineweight?: Lineweight;
}

export type { DemoOptions }
export interface DemoOptions {
    /** View size the session runs at (and the final scene is framed in). */
    readonly width?: number;
    readonly height?: number;
    /** Running object snaps; off unless the script is about them. */
    readonly snap?: boolean;
    readonly layers?: readonly DemoLayer[];
    /** DIMSCALE of the current dimension style, as a template sets it. */
    readonly dimScale?: number;
    /** POLARANG, the polar tracking increment in degrees. */
    readonly polarAngle?: number;
    /** Frame this rectangle before the first action (ZOOM Window). */
    readonly view?: Bounds;
    /** Screen padding around {@link view}. */
    readonly viewPadding?: number;
}

export type { DemoPrompt }
/** What the engine was asking when an action was taken. */
export interface DemoPrompt {
    /** The running command's name, or null at the neutral `Command:` prompt. */
    readonly command: string | null;
    /** The dynamic-input field being asked for, e.g. `Radius`. */
    readonly field: string | null;
    readonly fieldKind: DynamicFieldKind | null;
    /** The keywords offered, as the command line lists them. */
    readonly options: readonly string[];
    /**
     * The question the command asks as the history writes it, `Specify next
     * point or [Undo]:` — null when it names none.
     */
    readonly echo: readonly PromptSegment[] | null;
}

export type { DemoRecording }
export interface DemoRecording {
    /** The language it was recorded in; English when left out. */
    readonly locale?: EngineLocale;
    readonly steps: readonly DemoStep[];
    /** The drawing as the session left it. */
    readonly document: DocumentReader;
    /**
     * The editor's own frame at the end of the session — overlays, markers and
     * tooltips included, since those are what a precision demo is about.
     */
    readonly scene: Scene;
}

export { DemoScript }
export declare class DemoScript {
    readonly options: DemoOptions;
    readonly actions: readonly DemoAction[];
    static create(options?: DemoOptions): DemoScript;
    /** Runs a command by name or alias, as typed at the `Command:` prompt. */
    command(text: string): DemoScript;
    /** Types into the prompt's input; {@link enter} commits it. */
    type(text: string): DemoScript;
    enter(): DemoScript;
    escape(): DemoScript;
    /**
     * Answers a `[Keyword]` prompt with the keyword whose global id is `id`
     * (`"Close"`), typed as the recording's command language spells it.
     */
    option(id: string): DemoScript;
    click(x: number, y: number): DemoScript;
    moveTo(x: number, y: number): DemoScript;
    /**
     * Rests the cursor on a point long enough for object snap tracking to
     * acquire it — the engine's own dwell, elapsed at once rather than timed.
     */
    hover(x: number, y: number): DemoScript;
    /** Presses the mouse button and holds it, as a selection box starts. */
    down(x: number, y: number): DemoScript;
    up(x: number, y: number): DemoScript;
    /** A key on the drawing surface, e.g. `F10` for Polar. */
    press(key: string): DemoScript;
    /** A one-shot object snap, picked from the Shift+right-click menu. */
    osnap(type: SnapType): DemoScript;
    /**
     * Makes a template layer current, as picking it in the Layer control does —
     * a click in the UI, so it prints nothing on the command line.
     */
    layer(name: string): DemoScript;
}

export type { DemoStep }
export interface DemoStep {
    readonly action: DemoAction;
    readonly prompt: DemoPrompt;
    /** For an option, what was typed to answer it (its key, or abbreviation). */
    readonly answer?: string;
    /** Lines the engine wrote to its scrollback while the action ran. */
    readonly output: readonly CommandLineEntry[];
    readonly added: readonly EntityId[];
    readonly removed: readonly EntityId[];
}

export { recordDemo }
/**
 * Replays `script` on a fresh headless engine. Asynchronous because a command
 * may wait on a host port (PASTECLIP reads the clipboard), never on the clock:
 * a recording is the same however loaded the machine that makes it.
 */
export declare function recordDemo(script: DemoScript, recordOptions?: RecordOptions): Promise<DemoRecording>;

export type { RecordOptions }
export interface RecordOptions {
    /**
     * The language to record in, so a build can record the same script in every
     * language it publishes without any state shared between them.
     */
    readonly locale?: EngineLocale;
}

export { transcript }
/**
 * Folds a recording into command-line history: `Command: NAME` for each command
 * started, `<prompt>: <answer>` for each prompt answered — a typed value, an
 * option letter, or nothing for a pick or a bare Enter — and whatever the
 * engine reported. Moving the cursor, cancelling, switching layers or picking
 * from a menu answer nothing, so they leave no line.
 */
export declare function transcript(recording: DemoRecording): TranscriptLine[];

export type { TranscriptLine }
/** One line of a session's command-line history, as AutoCAD would scroll it. */
export interface TranscriptLine {
    /** `command`: a command started; `input`: a prompt answered; else a report. */
    readonly kind: "command" | "input" | "info" | "error";
    /** For an answered prompt, the question; empty otherwise. */
    readonly prompt: string;
    /** The same question in spans, its keyword list set apart. */
    readonly segments: readonly PromptSegment[];
    /** The command's name, what was typed (empty for a pick), or the report. */
    readonly text: string;
    /** Which step produced the line. */
    readonly step: number;
}
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

## ./locales/pt-BR

```ts
export { ptBR }
export declare const ptBR: EngineLocale;
```

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// application/CadDriver.ts
/** A point to point at: one with a Z is drawn at that height in a view off the plan. */
type WorldPoint = Vec2 | Vec3;

// application/EngineText.ts
export type FeedbackId = Exclude<keyof CommandCatalog["feedback"], "snap">;

// application/EngineText.ts
export type FileErrorCode = keyof Messages["fileError"];

// application/EngineText.ts
export type MessageId = Exclude<keyof Messages, "fileError">;

// application/EngineText.ts
type Messages = CommandCatalog["messages"];

// application/EngineText.ts
type Property = InterfaceCatalog["property"];

// application/tools/viewPresets.ts
/**
 * AutoCAD's preset views: where the viewer stands, looking back at the origin.
 * An isometric one looks down at a box from one of its upper corners (SW is
 * the lower-left one seen from the top).
 */
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
/** One of the nine zones a face shows, in the 0–1 box the cube is drawn in (Y down). */
export interface ViewCubeZone {
    readonly part: ViewCubePart;
    readonly points: readonly Vec2[];
}

// application/viewCube.ts
export interface ViewCubeCompassUi {
    /** The ring round the cube's foot: an ellipse, its rotation in degrees. */
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
    /** The face itself, its four edges and four corners, as the screen shows them. */
    readonly zones: readonly ViewCubeZone[];
    /**
     * The affine `[a, b, c, d, e, f]` (an SVG `matrix`) taking the face's own
     * square, `(0, 0)` its top-left as read from outside and `(1, 1)` its
     * bottom-right, into the box: where its name is written.
     */
    readonly label: readonly [
        number,
        number,
        number,
        number,
        number,
        number
    ];
}

// domain/entityProperties.ts
/** The rows that write an object's Z, all in the WCS here. */
export type ZProperty = "thickness" | "startZ" | "endZ" | "centerZ" | "positionZ" | "elevation";

// domain/entityTypes.ts
/**
 * A 3D polyline (3DPOLY; DXF POLYLINE flag 8): straight segments through
 * `vertices`, world points each at its own Z, so it need not lie in a plane.
 * The one object whose stored points carry their Z: it has no plane, so no
 * normal, elevation or thickness. AutoCAD keeps one with a single vertex
 * (3DPOLY ended at its second prompt, 3dpoly/p05).
 */
export interface Polyline3dEntity extends BaseEntity {
    readonly type: "polyline3d";
    readonly vertices: readonly Vec3[];
    readonly closed: boolean;
    /** PEDIT's Spline curve: `vertices` the frame, the curve `polyline3dCurve`'s. */
    readonly fit?: Polyline3dFit;
}

// domain/entityTypes.ts
/**
 * A block reference (AutoCAD's INSERT object): one placement of a
 * {@link BlockDefinition}, positioned, scaled and rotated as a whole.
 *
 * AutoCAD stores an X, a Y and a Z scale; -INSERT makes the Z |X| (probes
 * blocks/p203, p205: `(41 . -1.0) (42 . -1.0) (43 . 1.0)`), and with no 3D
 * here the Z is derived, never stored. A negative factor is a reflected axis:
 * one negative reflects the block (MIRROR negates X, `insertReflects`), two
 * turn it half round. Unequal magnitudes draw through the affine map
 * (`insertFlatGeometry`).
 */
export interface InsertEntity extends BaseEntity {
    readonly type: "insert";
    readonly blockId: BlockId;
    /** Where the definition's base point lands. */
    readonly position: Vec2;
    /** The block's X scale (DXF 41), never 0. */
    readonly scaleX: number;
    /** The block's Y scale (DXF 42), never 0. */
    readonly scaleY: number;
    /** Rotation about the insertion point, radians CCW from +X. */
    readonly rotation: number;
    /** The values given to the block's attribute definitions, in prompt order. */
    readonly attributes?: readonly BlockAttribute[];
    /**
     * Present on an associative array (AutoCAD's ARRAY object, probe
     * arrays/p400): the block holds the source, item 1, and the other items are
     * derived from these parameters (`domain/arrays.ts`).
     */
    readonly array?: ArrayParameters;
}

// domain/entityTypes.ts
/**
 * A circular arc: the portion of a circle that sweeps *counter-clockwise* from
 * `startAngle` to `endAngle` (radians, measured from the positive X axis). The
 * CCW convention (AutoCAD's) keeps every operation orientation-consistent, so
 * arithmetic never has to worry about which way the arc turns.
 */
export interface ArcEntity extends BaseEntity, Thick {
    readonly type: "arc";
    readonly center: Vec2;
    readonly radius: number;
    readonly startAngle: number;
    readonly endAngle: number;
}

// domain/entityTypes.ts
/**
 * A curve ARRAYPATH runs along, from the end it starts at: its pieces in
 * that order and its length.
 */
export interface ArrayPath {
    readonly pieces: readonly ArrayPathPiece[];
    readonly length: number;
    readonly closed: boolean;
}

// domain/entityTypes.ts
/**
 * A dimension: one object that draws its line work, arrowheads and the
 * measurement.
 *
 * Only the *definition points* are stored — the geometry, and the measurement
 * itself, are derived from them by {@link dimensionGeometry}. That keeps the
 * text honest (it can never disagree with the points) and is why nothing here
 * is a length.
 *
 * **Not associative.** AutoCAD's DIMASSOC defaults to 2, where the dimension
 * follows the geometry it was taken from; these points are independent copies,
 * so editing the measured object does not update the dimension.
 */
export interface DimensionEntity extends BaseEntity {
    readonly type: "dimension";
    readonly kind: DimensionKind;
    /** Origin of the first extension line; the centre for a radial dimension. */
    readonly first: Vec2;
    /**
     * Origin of the second extension line; for a radial dimension a point on the
     * measured circle or arc, which fixes both the radius and the direction the
     * dimension line runs in.
     */
    readonly second: Vec2;
    /**
     * A point the dimension line passes through (where the user placed it); for a
     * radial dimension, where the measurement text goes, and for an angular one a
     * point on the dimension arc, which fixes its radius.
     */
    readonly linePoint: Vec2;
    /**
     * The angle vertex of an `angular` dimension, about which `first` and
     * `second` become the two angle endpoints. Absent for every other kind.
     */
    readonly vertex?: Vec2;
    /**
     * Where the user put the measurement text with its grip (DXF 11 with flag
     * 70's 128, desktop d03-1); absent while the text keeps its default place.
     * A linear or aligned dimension draws it above its line at this point's
     * projection, an angular one at its bearing; a radial one's text follows
     * `linePoint` and never stores one.
     */
    readonly textPoint?: Vec2;
    /**
     * Direction measured along, radians CCW from +X. Ignored by every kind but
     * `linear`; the others take their direction from `first`→`second`.
     */
    readonly rotation: number;
    /** Replacement for the derived measurement (AutoCAD's Text option). */
    readonly text?: string;
    /**
     * Absolute text angle in radians CCW (AutoCAD's Angle option). When absent
     * the text follows the dimension line, as a dimension normally reads.
     */
    readonly textAngle?: number;
    readonly styleId: DimStyleId;
}

// domain/entityTypes.ts
/**
 * A hatch: an area filled with a pattern or a solid colour.
 *
 * The boundary is stored as its own {@link loops} — copies of the points, not
 * references to the objects they were traced from — for the same reason a
 * dimension stores its definition points: **not associative** (AutoCAD's
 * HPASSOC defaults to 1, where the fill follows its boundary objects), so a
 * reference would buy nothing and could only go stale.
 *
 * Several loops make one hatch (HPSEPARATE's initial value is 0), and they are
 * filled under the even-odd rule, so a loop inside another is a hole — the
 * island behaviour of AutoCAD's Normal style.
 */
export interface HatchEntity extends BaseEntity {
    readonly type: "hatch";
    readonly loops: readonly HatchLoop[];
    /** Pattern name (HPNAME); `SOLID` means a solid fill. */
    readonly patternId: HatchPatternId;
    /** HPSCALE: multiplies every length in the pattern definition. */
    readonly patternScale: number;
    /** HPANG: rotates the whole pattern, radians CCW from +X. */
    readonly patternAngle: number;
    /** Where pattern generation starts (HPORIGIN); the UCS origin by default. */
    readonly origin: Vec2;
    /**
     * The linear map (`[a, b, c, d]`: x' = a·x + c·y, y' = b·x + d·y) laid over
     * the pattern about {@link origin}: what a reference that reflects or
     * stretches its block shows of a hatch inside it (probe blocks/p230). Set
     * only on what `insertFlatGeometry` gives, never stored.
     */
    readonly patternFrame?: Linear2;
}

// domain/entityTypes.ts
/**
 * A multiline text object (AutoCAD's MTEXT): paragraphs that wrap to a width,
 * as one object. Only what AutoCAD stores is kept; the lines as wrapped and the
 * size of the box come out of `mtextLayout`.
 */
export interface MTextEntity extends BaseEntity {
    readonly type: "mtext";
    readonly position: Vec2;
    /**
     * AutoCAD's contents string (DXF 1/3): `\P` ends a paragraph and `\\`, `\{`
     * and `\}` are literal, so inline format codes fit the same field.
     */
    readonly contents: string;
    /** Capital-letter height in drawing units. */
    readonly height: number;
    /** Wrapping width (DXF 41); 0 turns word wrap off. */
    readonly width: number;
    /** Radians CCW from +X. */
    readonly rotation: number;
    readonly attachment: MTextAttachment;
    readonly lineSpacingStyle: LineSpacingStyle;
    /** Multiple of single spacing (DXF 44), 0.25 to 4. */
    readonly lineSpacingFactor: number;
    readonly styleId: TextStyleId;
}

// domain/entityTypes.ts
/**
 * A polyline: a single connected chain of segments through an ordered list of
 * `vertices` (at least two). When `closed`, an extra segment joins the last
 * vertex back to the first, so the outline forms a loop.
 *
 * Segments are straight by default. A non-zero `bulges[i]` turns the segment
 * that *starts* at vertex `i` into a circular arc — the value is AutoCAD's
 * bulge, `tan(θ/4)` for the signed included angle θ (positive = CCW). The array
 * is optional and, when present, is indexed like {@link polylineSegments}
 * (entry `i` = segment `i`; the closing segment is the last entry). A missing
 * or all-zero array means every segment is straight.
 *
 * `widths` is indexed the same way: each segment's starting and ending width
 * (DXF 40 / 41 of the vertex it starts at), absent or all zero for none. A
 * constant width (DXF 43) is not stored apart: it is every segment's one width,
 * read with `polylineConstantWidth`.
 */
export interface PolylineEntity extends BaseEntity, Thick {
    readonly type: "polyline";
    readonly vertices: readonly Vec2[];
    readonly closed: boolean;
    readonly bulges?: readonly number[];
    readonly widths?: readonly PolylineWidth[];
    /**
     * PEDIT's Ltype gen (DXF 70 flag 128): its linetype laid in one pattern
     * along its whole length, not anew on each segment. Absent means off.
     */
    readonly linetypeGeneration?: true;
    /**
     * PEDIT's Fit or Spline (DXF 70 flags 2 and 4, 75): `vertices` stay the
     * frame Edit vertex walks and the grips hold, the curve is
     * `polylineCurve`'s. Absent, the polyline is as drawn.
     */
    readonly fit?: PolylineFit;
}

// domain/entityTypes.ts
/**
 * A single line of text (AutoCAD's TEXT / DTEXT object). `position` is the
 * justification point the text hangs off — which for left-justified text is
 * also its insertion point — and `height` is the capital-letter height in
 * drawing units, so text scales with the drawing rather than the zoom.
 */
export interface TextEntity extends BaseEntity {
    readonly type: "text";
    readonly position: Vec2;
    readonly value: string;
    /** Capital-letter height in drawing units. */
    readonly height: number;
    /** Baseline rotation, radians CCW from +X. */
    readonly rotation: number;
    readonly justify: TextJustify;
    readonly styleId: TextStyleId;
}

// domain/entityTypes.ts
/**
 * A spline — AutoCAD's NURBS curve. It keeps what was picked: the fit points
 * or the control vertices (`points`, read by `method`), and the settings the
 * curve is derived from. A fit spline's control vertices and knots come out of
 * `splineCurve` every time, as a dimension's measurement does. One an edit
 * left on knots of its own carries them (`knotVector`), and a CV spline its
 * weights: AutoCAD leaves a fit spline it trims a CV spline on its control
 * points and knots (`splineWithoutFitData`), and one it breaks a fit spline on
 * knots of its own (probes spline-knots/k01–k08, desktop d01, d02).
 *
 * Its points carry their own Z (spline/p200, p216), in the object coordinates
 * of {@link BaseEntity.normal}: the curve need not lie in a plane, and has no
 * elevation of its own (its start's Z is it). One that does lie in a plane is
 * kept in it, its normal that plane's and every Z the same, as AutoCAD keeps
 * it (DXF 210 and flag 8, spline/p223, spline3d/s07–s11): `splineOnItsPlane`.
 */
export interface SplineEntity extends BaseEntity {
    readonly type: "spline";
    readonly method: SplineMethod;
    readonly points: readonly Vec3[];
    /** 3 for a fit spline; for a CV spline, already lowered to `points.length − 1` when fewer (`points.length` closed), or its own knots'. */
    readonly degree: number;
    /** How a fit spline spaces its knots; ignored by a CV spline. */
    readonly knots: KnotParameterization;
    /** Closed splines are periodic (SPLPERIODIC 1) unless a fit spline was given a closure tangent or a CV spline open knots. */
    readonly closed: boolean;
    /**
     * A fit spline's derivative at its start by the raw knot parameter, as typed
     * from the first point, in space (spline3d/s10); absent, the end is free (no
     * curvature). On a closed fit spline, which only a file holds, the one
     * tangent at the closure.
     */
    readonly startTangent?: Vec3;
    /** An open fit spline's derivative at its end, unit as SPLINE gives it (spline3d/s12); absent, free. */
    readonly endTangent?: Vec3;
    /**
     * Its own knots (DXF 40), as AutoCAD holds them, never normalised
     * (spline-knots/k01–k08): a CV spline's `points.length + degree + 1`, or,
     * closed and periodic, the `points.length + 1` of one period; a fit
     * spline's are its curve's, whose distinct values are the parameters of its
     * fit points (Knot parameterization Custom, desktop d02), a closed one's
     * one period of them. Absent, they are derived: a fit spline's from `knots`,
     * a CV spline's 1 apart.
     */
    readonly knotVector?: readonly number[];
    /** A CV spline's weight at each control vertex (DXF 41), each above 0; absent, it is not rational. */
    readonly weights?: readonly number[];
}

// domain/entityTypes.ts
/**
 * An attribute definition (AutoCAD's ATTDEF): a single line of text laid out
 * like a {@link TextEntity}, which a block definition turns into a question
 * asked at every insertion. Loose in the drawing it shows its {@link tag}.
 */
export interface AttributeDefinitionEntity extends BaseEntity {
    readonly type: "attdef";
    readonly position: Vec2;
    readonly height: number;
    readonly rotation: number;
    readonly justify: TextJustify;
    readonly styleId: TextStyleId;
    /** Uppercase, with no spaces or `!`; names the attribute in each reference. */
    readonly tag: string;
    /** What INSERT asks; empty means the tag is asked instead. */
    readonly prompt: string;
    /** The default value, or the value itself when the attribute is constant. */
    readonly value: string;
    readonly modes: AttributeModes;
}

// domain/entityTypes.ts
/**
 * An ellipse, and — with {@link EllipseEntity.startParam} — an elliptical arc.
 *
 * The model is AutoCAD's own (the DXF ELLIPSE entity): a centre, the **vector**
 * from it to the endpoint of the major axis, and the ratio of the minor axis to
 * the major one. That vector carries size and orientation together and so
 * translates, rotates, scales and mirrors exactly like a point, which is what
 * keeps the transforms trivial; loose semi-axis lengths plus an angle would
 * need a reflection to be unpicked and reassembled.
 *
 * A full ellipse and an elliptical arc are **one type**, as they are one class
 * in AutoCAD and one entity in DXF: trimming an ellipse only narrows the
 * parameter range, where trimming a circle has to produce a different object.
 */
export interface EllipseEntity extends BaseEntity {
    readonly type: "ellipse";
    readonly center: Vec2;
    /** Centre → endpoint of the major axis; its length is the semi-major axis. */
    readonly majorAxis: Vec2;
    /** Minor axis ÷ major axis, in `(0, 1]`. */
    readonly ratio: number;
    /**
     * Start of the swept parameter range, absent on a full ellipse. The
     * parameter is DXF's: `p(t) = c + a·cos t + b·sin t`, **not** the angle the
     * point subtends at the centre. Present exactly when {@link endParam} is.
     */
    readonly startParam?: number;
    /** End of the swept parameter range; the sweep runs CCW from `startParam`. */
    readonly endParam?: number;
}

// domain/entityTypes.ts
/**
 * DXF 73. "At least" grows a line to fit its tallest character, "Exactly" never
 * does; with no inline height changes the two space lines identically.
 */
export type LineSpacingStyle = "atLeast" | "exactly";

// domain/entityTypes.ts
/**
 * How a polyline is fitted. **Fit** keeps each segment's two arcs as it laid
 * them — `arcs[i]` segment `i`'s, null where straight —, as AutoCAD keeps
 * its curve-fit vertices (DXF 70 flag 1 on the VERTEX) through a vertex
 * moved, inserted or straightened, which refits nothing (pedit/p152, p153,
 * p155); its frame's bulges are 0. **Spline** keeps what was chosen
 * (SPLINETYPE, SPLINESEGS) and its curve is derived from the frame, which
 * AutoCAD refits at every edit (p58, p157, p159). `tangents` are Edit
 * vertex's (DXF 50), one per vertex, null where none is given.
 */
export type PolylineFit = {
    readonly kind: "curve";
    readonly arcs: readonly (FitArcs | null)[];
    readonly tangents?: readonly (number | null)[];
} | {
    readonly kind: "quadratic" | "cubic";
    /** SPLINESEGS when it was fitted: points per span, arcs through them when negative. */
    readonly segments: number;
    readonly tangents?: readonly (number | null)[];
};

// domain/entityTypes.ts
/**
 * How a pure function reaches the block table, which lives on the document.
 * Every helper that has to look inside a block reference takes one; without it
 * an insert degrades to its insertion point rather than pretending to be empty.
 */
export interface BlockLookup {
    (id: BlockId): BlockDefinition | undefined;
    /** ATTMODE, so every expansion of a reference shows what the drawing does. */
    readonly attributeDisplay?: AttributeDisplay;
}

// domain/entityTypes.ts
/**
 * One attribute of a block reference (AutoCAD's ATTRIB): a value for one of
 * the definition's tags, with the text geometry it was given at insertion.
 *
 * The geometry is kept in the **block definition's** coordinates, like the
 * definition's own entities, so the reference's placement carries it and no
 * transform has to know it exists. It is a copy, not a link: redefining the
 * block leaves existing attributes as they were, as AutoCAD does.
 */
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
/**
 * One closed ring of a hatch boundary, shaped exactly like a closed polyline:
 * an ordered list of vertices, implicitly closed, where a non-zero `bulges[i]`
 * turns the segment starting at vertex `i` into a circular arc (AutoCAD's
 * bulge, `tan(θ/4)`). A circular boundary is two semicircle bulges.
 */
export interface HatchLoop {
    readonly vertices: readonly Vec2[];
    readonly bulges?: readonly number[];
}

// domain/entityTypes.ts
/**
 * The objects AutoCAD extrudes by a thickness (DXF 39): "lines, arcs, circles,
 * polylines" among the ones modelled here. Absent means 0; negative extrudes
 * down.
 */
interface Thick {
    readonly thickness?: number;
}

// domain/entityTypes.ts
/**
 * What a dimension measures, and therefore how it is drawn:
 *
 * - `linear` measures along its own {@link DimensionEntity.rotation} (AutoCAD's
 *   DIMLINEAR, whose Horizontal / Vertical / Rotated options set that angle);
 * - `aligned` measures along the two origins themselves (DIMALIGNED);
 * - `angular` measures the angle the two origins subtend at a
 *   {@link DimensionEntity.vertex} (DIMANGULAR), drawing its dimension line as
 *   an arc;
 * - `radius` and `diameter` measure a circle or arc (DIMRADIUS, DIMDIAMETER),
 *   drawing a radial line or a leader instead of extension lines.
 */
export type DimensionKind = "linear" | "aligned" | "angular" | "radius" | "diameter";

// domain/entityTypes.ts
/**
 * What an array reference derives its items from, in its block's own
 * coordinates, so whatever moves, turns, scales or mirrors the reference
 * carries the array with it. A path array keeps the path's geometry as it was
 * and the id of the object it was (ARRAYS-D9).
 */
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
/**
 * Where a multiline text object's box hangs off its
 * {@link MTextEntity.position} (DXF 71). The column also aligns every line in
 * the box, and the row decides which way the box grows as lines are added.
 */
export type MTextAttachment = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

// domain/entityTypes.ts
/**
 * Where a text object hangs off its {@link TextEntity.position} — AutoCAD's
 * justification. `left`/`center`/`right` sit on the baseline; `middle` centres
 * on the whole text; the two-letter codes combine a vertical (Top / Middle /
 * Bottom) and a horizontal (Left / Center / Right) alignment.
 *
 * AutoCAD's Align and Fit are absent: both are defined by *two* points rather
 * than one, so they need a different model and prompt sequence.
 */
export type TextJustify = "left" | "center" | "right" | "middle" | "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

// domain/entityTypes.ts
/** A 3D polyline's PEDIT Spline curve: straight runs, |SPLINESEGS| per span (pedit/p55, p198). */
export interface Polyline3dFit {
    readonly kind: "quadratic" | "cubic";
    readonly segments: number;
}

// domain/entityTypes.ts
/** A 3D segment: it starts at {@link BaseEntity.elevation} and rises by {@link deltaZ}. */
export interface LineEntity extends BaseEntity, Thick {
    readonly type: "line";
    readonly start: Vec2;
    readonly end: Vec2;
    /** End Z minus start Z, kept as a difference so it transforms like a vector. */
    readonly deltaZ?: number;
}

// domain/entityTypes.ts
/** A block definition's name, which is also its identity, as in AutoCAD. */
export type BlockId = string;

// domain/entityTypes.ts
/** A Fit segment's arcs: to `joint` with the first bulge, on to the next vertex with the second. */
export interface FitArcs {
    readonly joint: Vec2;
    readonly bulges: readonly [
        first: number,
        second: number
    ];
}

// domain/entityTypes.ts
/** A polyline segment's starting and ending width, never negative. */
export type PolylineWidth = readonly [
    start: number,
    end: number
];

// domain/entityTypes.ts
/** AFLAGS: how an attribute behaves when its block is inserted. */
export interface AttributeModes {
    /** Not shown in a reference, unless ATTDISP overrides it. */
    readonly invisible: boolean;
    /** A fixed value, never asked for; the reference draws the definition's. */
    readonly constant: boolean;
    /** Asked for a second time before the insertion is accepted. */
    readonly verify: boolean;
    /** Takes its default without asking. */
    readonly preset: boolean;
    /** Cannot be moved relative to the rest of the block. */
    readonly lockPosition: boolean;
}

// domain/entityTypes.ts
/** ARRAYPATH's layout: how the items are spaced along the path. */
export interface PathLayout {
    readonly method: "divide" | "measure";
    readonly items: number;
    /** Measure's distance between items. */
    readonly spacing: number;
    readonly align: boolean;
}

// domain/entityTypes.ts
/** ARRAYPOLAR's ring, its angles in degrees. */
export interface PolarArray {
    readonly center: Vec2;
    /** The point carried round when the items are not turned. */
    readonly basePoint: Vec2;
    readonly items: number;
    /** The angle the items fill, in (0, 360]. */
    readonly fill: number;
    readonly clockwise: boolean;
    readonly rotate: boolean;
    /**
     * Where the base point stood when the source went into the block: absent,
     * the base point itself. The radius grip moves the base point along its
     * ray without touching the block (a copied array shares it), so every
     * item, the source's too, is placed from here (ARRAYS-D73).
     */
    readonly sourceBase?: Vec2;
}

// domain/entityTypes.ts
/** ARRAYRECT's grid: columns along `axis`, rows square to it, counter-clockwise. */
export interface RectangularArray {
    readonly columns: number;
    readonly rows: number;
    readonly colSpacing: number;
    readonly rowSpacing: number;
    /** How far each row rises above the one before it. */
    readonly rowElevation: number;
    /** The levels stacked along the block's Z, the UCS's when it was made (arrays/p439). */
    readonly levels: number;
    readonly levelSpacing: number;
    /** The columns' direction, a unit vector: the UCS's X when it was made. */
    readonly axis: Vec2;
}

// domain/entityTypes.ts
/** ATTMODE: whether references show their attributes. */
export type AttributeDisplay = "normal" | "on" | "off";

// domain/entityTypes.ts
/** How a spline was made (SPLMETHOD): through fit points, or on control vertices. */
export type SplineMethod = "fit" | "cv";

// domain/entityTypes.ts
/** One run of a path: a straight piece, or an arc swept from `start` by `sweep` (signed). */
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
export interface CircleEntity extends BaseEntity, Thick {
    readonly type: "circle";
    readonly center: Vec2;
    readonly radius: number;
}

// domain/entityTypes.ts
export type ArrayKind = ArrayParameters["kind"];

// domain/entityTypes.ts
interface BaseEntity {
    readonly id: EntityId;
    readonly type: EntityType;
    /** The layer this entity belongs to; supplies its "ByLayer" appearance. */
    readonly layerId: LayerId;
    /**
     * Per-object colour override (AutoCAD's ByObject). When absent the entity
     * inherits its layer's colour (ByLayer).
     */
    readonly color?: EntityColor;
    /**
     * Per-object linetype override (AutoCAD's ByObject). When absent the entity
     * inherits its layer's linetype (ByLayer), mirroring how colour is resolved.
     */
    readonly linetype?: LinetypeId;
    /**
     * Per-object lineweight override in mm (ByObject). When absent the entity
     * inherits its layer's lineweight (ByLayer), like {@link linetype}.
     */
    readonly lineweight?: Lineweight;
    /**
     * The plane the object lies in, as DXF keeps it: `elevation` is its distance
     * from the origin along {@link normal}, and the object's own points are in
     * that plane's object coordinate system (the arbitrary axis algorithm's
     * axes for the normal). With the normal on +Z that system is the WCS and
     * the elevation is a world Z. Absent means 0. A line is the exception: its
     * points are in the WCS, and this is its start's Z.
     */
    readonly elevation?: number;
    /**
     * DXF 210: the unit normal of the object's plane, or a line's extrusion
     * direction. Absent means +Z, the only one the plan draws as it is stored.
     */
    readonly normal?: Vec3;
}

// domain/ucs.ts
/**
 * A user coordinate system: an origin and the directions of its X and Y axes,
 * all in the WCS. The axes are unit and square to each other, and Z is X × Y,
 * so the frame is rigid and right-handed; its XY plane may lie at any angle.
 */
export interface Ucs {
    readonly origin: Vec3;
    /** Unit vectors: kept as directions, not angles, so they map like points. */
    readonly xAxis: Vec3;
    readonly yAxis: Vec3;
    /**
     * The WCS as the frame this UCS is given in reads it, when that frame is
     * not the WCS itself (the tools' frame of a tilted UCS): what `*` reads a
     * typed point in.
     */
    readonly wcs?: Ucs;
}

// domain/ucs.ts
/**
 * One of the six orthographic UCSs (UCS orthoGraphic, and -VIEW's orthographic
 * views with UCSORTHO 1), which AutoCAD names the current UCS by (`*TOP*`).
 */
export type OrthographicUcs = "top" | "bottom" | "front" | "back" | "left" | "right";

// domain/ucs.ts
/** A UCS saved by name (UCS Named Save), kept in the drawing's UCS table. */
export interface NamedUcs {
    readonly name: string;
    readonly ucs: Ucs;
}

// domain/units.ts
/** A view's orientation in the WCS: where it looks from and what it draws up. */
export interface SavedView {
    /** Unit vector from the target towards the viewer. */
    readonly direction: Vec3;
    /** Unit vector square to it, drawn pointing up. */
    readonly up: Vec3;
}

// domain/units.ts
export interface DocumentSettings {
    readonly unit: LengthUnit;
    readonly precision: number;
    /** AUPREC: the decimal places angles are written with, apart from lengths'. */
    readonly anglePrecision: number;
    /** Global linetype scale (AutoCAD's LTSCALE): multiplies every dash pattern. */
    readonly ltScale: number;
    /** Whether lineweights are drawn at their real thickness (AutoCAD's LWDISPLAY). */
    readonly lwDisplay: boolean;
    /** ATTMODE, which AutoCAD saves in the drawing. */
    readonly attributeDisplay: AttributeDisplay;
    /** The current UCS (UCSORG, UCSXDIR), saved in the drawing. */
    readonly ucs: Ucs;
    /** UCSNAME: the saved UCS the current one was restored from, until it changes. */
    readonly ucsName: string | null;
    /** The orthographic UCS the current one was set as (`*TOP*`), until it changes. */
    readonly ucsOrthographic: OrthographicUcs | null;
    /** The UCS table: every UCS saved by name. */
    readonly namedUcs: readonly NamedUcs[];
    /** UCSICON: bit 1 shows the icon, bit 2 puts it at the origin when in view. */
    readonly ucsIcon: UcsIconSetting;
    /** ELEVATION: the Z above the UCS's XY plane of a point given without one. */
    readonly elevation: number;
    /** THICKNESS: the extrusion LINE, CIRCLE, ARC, PLINE and POLYGON give what they draw. */
    readonly thickness: number;
    /** NAVVCUBEDISPLAY and the ViewCube's Home view, both saved in the drawing. */
    readonly viewCube: ViewCubeSetting;
    /** CECOLOR: the colour new objects take, a hex value or ByLayer. */
    readonly currentColor: EntityColor | typeof COLOR_BYLAYER;
    /** CELTYPE: the linetype new objects take, a linetype's name or ByLayer. */
    readonly currentLinetype: LinetypeId | typeof LINETYPE_BYLAYER;
    /** CELWEIGHT: the lineweight new objects take, in millimetres, or ByLayer. */
    readonly currentLineweight: Lineweight | typeof LINEWEIGHT_BYLAYER;
    /** FILLMODE: whether wide polylines are drawn filled or as their outline. */
    readonly fillMode: boolean;
    /** PLINEWID: the width PLINE starts with, the last one it was left at. */
    readonly polylineWidth: number;
    /** FILLETRAD: the radius FILLET rounds with. */
    readonly filletRadius: number;
    /** SPLINETYPE: PEDIT Spline's curve, 5 quadratic or 6 cubic. */
    readonly splineType: 5 | 6;
    /** SPLINESEGS: PEDIT Spline's points per span, arcs through them when negative, never 0. */
    readonly splineSegments: number;
    /** CHAMFERA: CHAMFER's first distance. */
    readonly chamferDistance1: number;
    /** CHAMFERB: CHAMFER's second distance. */
    readonly chamferDistance2: number;
    /** TEXTSIZE: the height TEXT, MTEXT and ATTDEF offer, the last one given. */
    readonly textSize: number;
    /** TEXT's justification, the last one chosen, which AutoCAD saves too (rectang/p311). */
    readonly textJustify: TextJustify;
    /**
     * TEXT's last rotation, the next one's `<default>`, in radians from the UCS
     * X axis. Per drawing and never saved (rectang/p311), but U takes it back
     * (text/p127), so it lives here and the file leaves it out.
     */
    readonly textRotation: number;
    /**
     * HATCH's HPNAME as typed (`_ANSI31`, probe hatch/p248), HPSCALE and HPANG
     * (radians from the UCS X axis), which the next hatch takes. Per drawing and
     * never saved (rectang/p303), but U takes them back with the run that set
     * them (hatch/p242, p243), so they live here and the file leaves them out.
     */
    readonly hatchPatternName: string;
    readonly hatchPatternScale: number;
    readonly hatchPatternAngle: number;
    /** ORTHOMODE (F8). */
    readonly orthoMode: boolean;
    /** SNAPMODE (F9). */
    readonly snapMode: boolean;
    /** SNAPUNIT: the snap lattice's X and Y spacing. */
    readonly snapUnit: Vec2;
    /** GRIDMODE (F7). */
    readonly gridMode: boolean;
}

// domain/units.ts
export interface UcsIconSetting {
    readonly visible: boolean;
    readonly atOrigin: boolean;
}

// domain/units.ts
export interface ViewCubeSetting {
    /**
     * NAVVCUBEDISPLAY 3 shown. Its bits are per kind of visual style, and OFF
     * clears the current one's: 2027 writes 1 under 2D Wireframe (view/p262).
     * With no visual styles here, one flag.
     */
    readonly visible: boolean;
    /** The Home view, in the WCS, or `null` for the default "Top/Left/Front" one. */
    readonly home: SavedView | null;
}

// geometry/linear.ts
/** A linear map of the plane, `[a, b, c, d]`: x' = a·x + c·y, y' = b·x + d·y. */
export type Linear2 = readonly [
    number,
    number,
    number,
    number
];

// geometry/nurbs.ts
/** AutoCAD's knot parameterizations (SPLKNOTS 0, 1, 2). */
export type KnotParameterization = "chord" | "sqrtChord" | "uniform";

// i18n/keywords.ts
/** A keyword on offer: its global id, and the word in the command language. */
export interface Keyword {
    readonly id: string;
    /** The command language's word, with its abbreviation in capitals. */
    readonly word: string;
    /** The global word (the English one), which `_` selects. */
    readonly global: string;
}

// i18n/types.ts
/**
 * A catalog with any key left out. A compiled message is an array, and so is a
 * list of command names, so arrays are leaves: a locale replaces one whole.
 */
export type DeepPartial<T> = T extends string | number | boolean ? T : T extends readonly unknown[] ? T : {
    readonly [K in keyof T]?: DeepPartial<T[K]>;
};

// i18n/types.ts
/** Values a message is formatted with. Technical numbers arrive pre-formatted. */
export type MessageValues = Readonly<Record<string, string | number>>;

// locales/types.ts
/**
 * How a prompt writes its default: `<1>:`, against what precedes it
 * (`[Zdepth]<0,0,0>:`), or with no colon (`OK? <Y>`).
 */
export type PromptForm = "spaced" | "tight" | "open";

// locales/types.ts
/**
 * How the history writes an answer after a prompt: past its colon's space
 * (`Select polyline or [Multiple]: M`), or against the colon where the
 * language's string ends without one (pt-BR `…[Múltiplo]:M`).
 */
export type AnswerForm = "spaced" | "tight";

// locales/types.ts
/**
 * The shape of an engine catalog, read off the English source: English is the
 * fallback key by key and the type every other language is checked against.
 */
type Source = typeof source;

// locales/types.ts
/** Every ICU leaf of the source, as the generated module holds it. */
type Compiled<T> = T extends string ? CompiledMessage : {
    readonly [K in keyof T]: Compiled<T[K]>;
};

// locales/types.ts
export type PromptId = keyof Commands["prompts"];

// locales/types.ts
type Commands = Source["commands"];

// shared/Observable.ts
/**
 * Minimal typed observable used across layers so React (or anything else) can
 * subscribe to state changes without coupling the system to any framework.
 * It is the only piece of shared infrastructure; it has zero dependencies.
 */
export type Listener = () => void;
```
