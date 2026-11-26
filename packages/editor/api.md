# @mellowcad/editor — API report

Every export with its signature and its documentation, grouped by topic, then the types they reach. Generated from the source by `packages/editor/api.test.ts`: a change to it is a change to the public API.

## .

### The editor

```ts
export { CadEditor }
/**
 * The editor's docked workspace: a grid of named areas round the canvas, which
 * takes what is left. The engine resizes its drawing with the canvas, so ZOOM
 * Extents frames what is visible; nothing but the viewport controls, the
 * ViewCube with the navigation bar, the dynamic input and the menus at the
 * cursor sits on the drawing.
 */
export declare function CadEditor(cadEditorProps: CadEditorProps): ReactElement;

export type { CadEditorComponents }
/**
 * The pieces a host may replace with its own component, each by its default's
 * name, or turn off with `null`: its zone goes with it and the canvas takes
 * the room. A replacement is handed what the default is (`PieceProps`, and
 * the host's props for the title bar and the status bar) and renders inside the
 * editor's root, where its tokens, catalog and popups' container reach it;
 * its classes are the host's to compile. The menus and dialogs the engine
 * opens are not pieces: the engine waits on their answer.
 */
export interface CadEditorComponents {
    readonly TitleBar?: ComponentType<TitleBarProps> | null;
    readonly Ribbon?: ComponentType<PieceProps> | null;
    /**
     * What each palette holds, handed which one (`palette`); its frame is the
     * editor's. `null` turns the palettes off, their columns too.
     */
    readonly PaletteContent?: ComponentType<PaletteProps> | null;
    readonly CommandLine?: ComponentType<PieceProps> | null;
    readonly StatusBar?: ComponentType<StatusBarProps> | null;
    readonly ViewportControls?: ComponentType<PieceProps> | null;
    readonly ViewCube?: ComponentType<PieceProps> | null;
    readonly NavigationBar?: ComponentType<PieceProps> | null;
    readonly DynamicInput?: ComponentType<PieceProps> | null;
}

export type { CadEditorProps }
export interface CadEditorProps {
    /** The page language's catalog for the engine; English when absent. */
    engineLocale?: EngineLocale;
    /** The page language's catalog for the editor's own words; English when absent. */
    editorLocale?: EditorLocale;
    /** The page's direction: the shell mirrors in `rtl`, the drawing never. */
    dir?: "ltr" | "rtl";
    /** The host's product mark, the application menu's glyph. */
    mark?: ReactNode;
    /** The page in each language the host offers, for the application menu. */
    languages?: readonly LanguageLink[];
    /** Where this device's layout is kept; nothing is, without it. */
    layoutStorage?: LayoutStorage;
    /** The canvas cell's name for a page that transitions into it. */
    sheet?: SheetTransition;
    /**
     * Where F1 and the title bar's Help open help; without it F1 is the
     * browser's and the title bar has no Help button.
     */
    help?: HelpLinks;
    /**
     * The page the title bar's Help list's Send Feedback opens, in a tab of its
     * own: where the host's users report a problem. Without it, no Send Feedback.
     */
    feedback?: string;
    /** The pieces the host replaces or turns off; the rest are the editor's. */
    components?: CadEditorComponents;
    /**
     * Makes the store the drawing is restored from when the editor starts and
     * autosaved to after every change; `null` from it keeps nothing. Called
     * once, when the engine is built. Without it, this browser's
     * `localStorage` (`createLocalStorageDrawingStore`), whose one key every
     * page of the site that keeps the default shares.
     */
    store?: () => DrawingStore | null;
    /**
     * Handed the engine once it is built, and `null` once it is disposed, for
     * the host's own code to save, open or run commands with. Read once, like
     * `store`.
     */
    onEngine?: (engine: CadEngine | null) => void;
}

export type { HelpLinks }
/**
 * Where F1 opens help, as AutoCAD's does: `command` while one runs, its
 * `{command}` replaced by the command's global name in lower case, and
 * `index` with none. Strings, so a server page can hand them over.
 */
export interface HelpLinks {
    readonly index: string;
    readonly command: string;
    /**
     * The commands with a help page of their own, by global name in lower case
     * (`offset`): F1 opens that page rather than `command`'s.
     */
    readonly commands?: Readonly<Record<string, string>>;
}

export { paletteLayoutScript }
/**
 * The `<head>` script for the layout kept under `key` (`layoutStorage.palette`):
 * each docked column's and anchored strip's width, from the palettes open when
 * the page was left, in plain ES5, as it runs before any bundle: the widths
 * the workspace lays out once the editor has mounted, the same. The root
 * does not exist yet, so a MutationObserver waits for the parser to insert it:
 * its callback is a microtask, which runs before the frame that could paint
 * the root. Without the script (storage blocked, a script error) no column is
 * laid out until the editor's scripts run.
 */
export declare const paletteLayoutScript: (key: string) => string;

export { ribbonLayoutScript }
/**
 * The `<head>` script that lays out the ribbon's minimize state kept under
 * `key` (`layoutStorage.ribbon`) as the page is parsed, so the drawing's
 * first box is its final one: plain ES5, run before any bundle, it marks the
 * editor's root as the parser inserts it, as `paletteLayoutScript` does.
 * Without it the ribbon shows whole until the editor's scripts run.
 */
export declare const ribbonLayoutScript: (key: string) => string;
```

### Pieces

```ts
export { CommandLine }
/**
 * AutoCAD's command line as it starts: one prompt line, with the temporary
 * prompt history of the running command above it (CLIPROMPTLINES, 3), and the
 * whole history expanded upwards over the drawing with F2 or the arrow at its
 * end. The engine owns the prompt, the history and the suggestions, so typing
 * on the drawing and typing in this field feed the same buffer.
 */
export declare function CommandLine(pieceProps: PieceProps): ReactElement | null;

export { DynamicInput }
/**
 * AutoCAD's dynamic input: the tooltip of fields at the cursor, with the
 * prompt's options beside it. It renders the fields the running command asks
 * for (`state.dynamicInput`) and hands every key back to the engine, which
 * reads units, parses what is typed and decides what a value does.
 */
export declare function DynamicInput(pieceProps: PieceProps): ReactElement | null;

export { NavigationBar }
/**
 * AutoCAD's navigation bar (NAVBARDISPLAY 1), linked to the ViewCube: a
 * vertical strip under it with Pan, the Zoom split button and Orbit. The
 * SteeringWheels and ShowMotion do not exist here. Its menus open towards the
 * middle of the drawing, the bar's inline start.
 */
export declare function NavigationBar(pieceProps: PieceProps): ReactElement;

export { PaletteContent }
/**
 * What a palette holds: Properties, the Layer Properties Manager or Blocks.
 * The frame round it — its title bar, floating or docked, its size — is the
 * editor's, as a zone is.
 */
export declare function PaletteContent(paletteProps: PaletteProps): ReactElement;

export type { PaletteProps }
/** What a palette's content is handed: a piece's props and which palette. */
export interface PaletteProps extends PieceProps {
    readonly palette: PaletteId;
}

export type { PieceProps }
/**
 * What a piece of the editor is handed, and so a host's replacement for it
 * (`CadEditorComponents`): the engine to call and the chrome's state. A
 * pointer field is not in `state` (`POINTER_KEYS`): read it with
 * `useEngineSelector(engine, …)` in the smallest component that shows it.
 */
export interface PieceProps {
    readonly engine: CadEngine;
    readonly state: EditorState;
}

export { Ribbon }
/**
 * AutoCAD's ribbon (docs/plans/autocad-ui.md, §2.3): its tab row, 24, with
 * the minimize button after the last tab, and under it the tab in front in
 * the state this device left it in — its panels (100), one button per panel
 * (62), one title per panel (21) or nothing. Each panel is acad.cuix's rows
 * at AutoCAD's sizes, with its title bar, the slide-out under it and their
 * push pin; the panels shed text and fold from the right as the window
 * narrows; the drop-downs keep the member last used in the engine
 * (`state.ribbon.members`), for the session.
 */
export declare function Ribbon(pieceProps: PieceProps): ReactElement;

export type { RibbonLayout }
/** The ribbon's minimize state, and what its minimize button does. */
export interface RibbonLayout {
    readonly state: RibbonState;
    readonly mode: RibbonMinimizeMode;
}

export type { RibbonLayoutControl }
/** The ribbon's minimize state on this device, and the way to change it. */
export interface RibbonLayoutControl {
    readonly layout: RibbonLayout;
    /** Takes the new layout and keeps it, under the host's key if it gave one. */
    readonly setLayout: (layout: RibbonLayout) => void;
}

export type { RibbonMinimizeMode }
export type RibbonMinimizeMode = (typeof RIBBON_MINIMIZE_MODES)[number];

export type { RibbonState }
export type RibbonState = (typeof RIBBON_STATES)[number];

export { StatusBar }
/**
 * AutoCAD's status bar, in the order of its 2026 reference: the coordinates,
 * MODEL, the drafting modes, Units, Clean Screen and, right-most,
 * Customization, which picks what shows. A mode with settings has its arrow
 * beside it, and a right-click on the mode opens the same menu.
 */
export declare function StatusBar(statusBarProps: StatusBarProps): ReactElement;

export type { StatusBarProps }
/** The status bar's props: a piece's, and where the host keeps its layout. */
export interface StatusBarProps extends PieceProps {
    /** Where Customization is kept on this device; none, it is not kept. */
    readonly storageKey?: string;
}

export { TitleBar }
/**
 * AutoCAD's title bar: the application button and the Quick Access Toolbar at
 * AutoCAD's sizes, the auto-save's state, the drawing's name centred, and
 * InfoCenter's Help ▾ at the end. Every part has a fixed width, so the row
 * never grows.
 */
export declare function TitleBar(titleBarProps: TitleBarProps): ReactElement;

export type { TitleBarProps }
/** The title bar's props: a piece's, and what the host gives `CadEditor` for it. */
export interface TitleBarProps extends PieceProps {
    /** The application menu's glyph, the host's product mark. */
    readonly mark?: ReactNode;
    /** The application menu's languages; none, no Language submenu. */
    readonly languages?: readonly LanguageLink[];
    /**
     * Whether the host shows Help (`CadEditor`'s `help`), which the Help button
     * asks for as F1 does; neither it nor `feedback`, no Help ▾.
     */
    readonly help?: boolean;
    /** The page the Help list's Send Feedback opens; none, no Send Feedback. */
    readonly feedback?: string;
}

export { useRibbonLayout }
/**
 * The ribbon's minimize state and its setter, for the `Ribbon` piece or one a
 * host puts in its place: the zone's height follows it.
 */
export declare function useRibbonLayout(): RibbonLayoutControl;

export { ViewCube }
/**
 * AutoCAD's ViewCube, top right of the drawing: Home above, the compass round
 * its foot and the UCS menu below. The engine projects it
 * (`state.viewCube`); this only draws the zones it is given, highlights the
 * one under the cursor and hands back which was clicked or dragged.
 */
export declare function ViewCube(pieceProps: PieceProps): React.ReactElement | null;

export { ViewportControls }
/**
 * The viewport controls at the drawing's top left (VPCONTROL 1), of which
 * only the view control exists: `[Top]`, naming the view the engine says the
 * camera shows, opens the preset views and runs the one chosen as AutoCAD's
 * `'_-view _swiso`.
 */
export declare function ViewportControls(pieceProps: PieceProps): ReactElement;
```

### Languages

```ts
export type { EditorLocale }
/**
 * A language the editor is handed (`<CadEditor editorLocale={es}>`). Any
 * message may be left out, and that message is English's. Every message is
 * compiled (`icu-minify/compile`).
 */
export interface EditorLocale {
    /** BCP 47, what `Intl` receives (plurals, numbers), and the editor's `lang`. */
    readonly tag: string;
    readonly messages: DeepPartial<EditorMessages>;
}
```

## ./locales/en

```ts
export { en }
export declare const en: EditorCatalog;
```

## ./locales/es

```ts
export { es }
export declare const es: EditorLocale;
```

## ./locales/ar

```ts
export { ar }
export declare const ar: EditorLocale;
```

## ./locales/pt-BR

```ts
export { ptBR }
export declare const ptBR: EditorLocale;
```

## ./locales/fr

```ts
export { fr }
export declare const fr: EditorLocale;
```

## ./locales/it

```ts
export { it }
export declare const it: EditorLocale;
```

## ./locales/de

```ts
export { de }
export declare const de: EditorLocale;
```

## ./locales/ru

```ts
export { ru }
export declare const ru: EditorLocale;
```

## ./locales/pl

```ts
export { pl }
export declare const pl: EditorLocale;
```

## ./locales/cs

```ts
export { cs }
export declare const cs: EditorLocale;
```

## ./locales/hu

```ts
export { hu }
export declare const hu: EditorLocale;
```

## ./locales/ja

```ts
export { ja }
export declare const ja: EditorLocale;
```

## ./locales/ko

```ts
export { ko }
export declare const ko: EditorLocale;
```

## ./locales/zh-CN

```ts
export { zhCN }
export declare const zhCN: EditorLocale;
```

## ./locales/zh-TW

```ts
export { zhTW }
export declare const zhTW: EditorLocale;
```

## ./styles.css

Scoped to `[data-mellowcad-editor]`: its rules match the editor's root and what is inside it, or an element by one of its classes.

Cascade layers, in order: `properties`, `theme`, `base`, `components`, `utilities`.

The host sets, on the root or above it: `--font-mono`, `--font-sans`.

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// src/cad-editor.tsx
/**
 * The localStorage keys this device's layout is kept under, each part's own;
 * a part with no key is not remembered. A key is the host's promise to its
 * users: renaming it orphans what they saved.
 */
export interface LayoutStorage {
    /**
     * Where each palette shows (floating, docked or anchored), its size, the
     * columns' widths and which palettes were open, also read by the `<head>`
     * script.
     */
    readonly palette?: string;
    /** The status bar's Customization. */
    readonly statusBar?: string;
    /** The Properties palette's folded categories, per object type. */
    readonly properties?: string;
    /**
     * The ribbon's minimize state and what its button does, also read by the
     * `<head>` script.
     */
    readonly ribbon?: string;
}

// src/cad-editor.tsx
/**
 * What names the canvas cell for a host's view transition into the editor:
 * the element's id (for `<link rel="expect">`) and its `view-transition-name`.
 */
export interface SheetTransition {
    readonly id: string;
    readonly name: string;
}

// src/locales/types.ts
/**
 * The shape of an editor catalog, read off the English source: English is the
 * fallback key by key and the type every other language is checked against.
 * The keys are API: adding one is a minor version, renaming or removing one,
 * or changing what a message takes (`values.ts`), a major.
 */
type Source = typeof source;

// src/locales/types.ts
/** A catalog with any key left out. A compiled message is a leaf. */
export type DeepPartial<T> = T extends string | readonly unknown[] ? T : {
    readonly [K in keyof T]?: DeepPartial<T[K]>;
};

// src/locales/types.ts
/** A complete catalog: the English one built into the editor. */
export interface EditorCatalog {
    readonly tag: string;
    readonly messages: EditorMessages;
}

// src/locales/types.ts
export type EditorMessages = Compiled<Source>;

// src/locales/types.ts
type Compiled<T> = T extends string ? CompiledMessage : {
    readonly [K in keyof T]: Compiled<T[K]>;
};

// src/ribbon-layout.ts
/**
 * The four states, in the order Cycle through All steps through them (the
 * help's "full ribbon, minimize to panel buttons, minimize to panel titles,
 * and minimize to tabs"): the panels; one button per panel; one title per
 * panel; the tab row alone.
 */
export declare const RIBBON_STATES: readonly [
    "full",
    "panelButtons",
    "panelTitles",
    "tabs"
];

// src/ribbon-layout.ts
/**
 * What the minimize button does, as its arrow's menu sets it: toggle between
 * the full ribbon and one minimized state, or step through all four.
 */
export declare const RIBBON_MINIMIZE_MODES: readonly [
    "tabs",
    "panelTitles",
    "panelButtons",
    "cycle"
];

// src/title-bar.tsx
/**
 * The page in one language, for the application menu. A plain link: a switch
 * is a full page load, since the language changes `lang`, `dir` and the
 * engine's catalog.
 */
export interface LanguageLink {
    readonly locale: string;
    readonly href: string;
    /** The language named in itself. */
    readonly name: string;
    readonly current: boolean;
}
```
