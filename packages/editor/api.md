# @mellowcad/editor — API report

Written by `packages/editor/api.test.ts`; a change to it is a change to the public API.

## .

```ts
export { CadEditor }
export declare function CadEditor(cadEditorProps: CadEditorProps): ReactElement;

export type { CadEditorComponents }
export interface CadEditorComponents {
    readonly TopBar?: ComponentType<TopBarProps> | null;
    readonly ToolRail?: ComponentType<PieceProps> | null;
    readonly PalettePanel?: ComponentType<PieceProps> | null;
    readonly CommandLine?: ComponentType<PieceProps> | null;
    readonly StatusBar?: ComponentType<StatusBarProps> | null;
    readonly ViewportControls?: ComponentType<PieceProps> | null;
    readonly ViewCube?: ComponentType<PieceProps> | null;
    readonly NavigationBar?: ComponentType<PieceProps> | null;
    readonly DynamicInput?: ComponentType<PieceProps> | null;
}

export type { CadEditorProps }
export interface CadEditorProps {
    engineLocale?: EngineLocale;
    editorLocale?: EditorLocale;
    dir?: "ltr" | "rtl";
    mark?: ReactNode;
    languages?: readonly LanguageLink[];
    layoutStorage?: LayoutStorage;
    sheet?: SheetTransition;
    help?: HelpLinks;
    components?: CadEditorComponents;
}

export { CommandLine }
export declare function CommandLine(pieceProps: PieceProps): ReactElement | null;

export { DynamicInput }
export declare function DynamicInput(pieceProps: PieceProps): ReactElement | null;

export type { EditorLocale }
export interface EditorLocale {
    readonly tag: string;
    readonly messages: DeepPartial<EditorMessages>;
}

export type { HelpLinks }
export interface HelpLinks {
    readonly index: string;
    readonly command: string;
}

export { NavigationBar }
export declare function NavigationBar(pieceProps: PieceProps): ReactElement;

export { paletteLayoutScript }
export declare const paletteLayoutScript: (key: string) => string;

export { PalettePanel }
export declare function PalettePanel(pieceProps: PieceProps): ReactElement;

export type { PieceProps }
export interface PieceProps {
    readonly engine: CadEngine;
    readonly state: EditorState;
}

export { StatusBar }
export declare function StatusBar(statusBarProps: StatusBarProps): ReactElement;

export type { StatusBarProps }
export interface StatusBarProps extends PieceProps {
    readonly storageKey?: string;
}

export { ToolRail }
export declare function ToolRail(pieceProps: PieceProps): ReactElement;

export { TopBar }
export declare function TopBar(topBarProps: TopBarProps): ReactElement;

export type { TopBarProps }
export interface TopBarProps extends PieceProps {
    readonly mark?: ReactNode;
    readonly languages?: readonly LanguageLink[];
}

export { ViewCube }
export declare function ViewCube(pieceProps: PieceProps): React.ReactElement | null;

export { ViewportControls }
export declare function ViewportControls(pieceProps: PieceProps): ReactElement;
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

## ./styles.css

Scoped to `[data-mellowcad-editor]`: its rules match the editor's root and what is inside it, or an element by one of its classes.

Cascade layers, in order: `properties`, `theme`, `base`, `components`, `utilities`.

The host sets, on the root or above it: `--font-mono`, `--font-sans`.

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// src/cad-editor.tsx
export interface LayoutStorage {
    readonly palette?: string;
    readonly statusBar?: string;
}

// src/cad-editor.tsx
export interface SheetTransition {
    readonly id: string;
    readonly name: string;
}

// src/locales/types.ts
export interface EditorCatalog {
    readonly tag: string;
    readonly messages: EditorMessages;
}

// src/locales/types.ts
export type DeepPartial<T> = T extends string | readonly unknown[] ? T : {
    readonly [K in keyof T]?: DeepPartial<T[K]>;
};

// src/locales/types.ts
export type EditorMessages = Compiled<Source>;

// src/locales/types.ts
type Compiled<T> = T extends string ? CompiledMessage : {
    readonly [K in keyof T]: Compiled<T[K]>;
};

// src/locales/types.ts
type Source = typeof source;

// src/top-bar.tsx
export interface LanguageLink {
    readonly locale: string;
    readonly href: string;
    readonly name: string;
    readonly current: boolean;
}
```
