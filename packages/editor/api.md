# @mellowcad/editor — API report

Written by `packages/editor/api.test.ts`; a change to it is a change to the public API.

## .

```ts
export { CadWorkspace }
export declare function CadWorkspace({ editorLocale, dir, ...props }: WorkspaceProps & {
    editorLocale?: EditorLocale;
    dir?: "ltr" | "rtl";
}): ReactElement;

export type { EditorLocale }
export interface EditorLocale {
    readonly tag: string;
    readonly messages: DeepPartial<EditorMessages>;
}

export { paletteLayoutScript }
export declare const paletteLayoutScript: (key: string) => string;
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
// src/cad-workspace.tsx
export interface LayoutStorage {
    readonly palette?: string;
    readonly statusBar?: string;
}

// src/cad-workspace.tsx
export interface SheetTransition {
    readonly id: string;
    readonly name: string;
}

// src/cad-workspace.tsx
interface WorkspaceProps {
    engineLocale?: EngineLocale;
    mark?: React.ReactNode;
    languages?: readonly LanguageLink[];
    layoutStorage?: LayoutStorage;
    sheet?: SheetTransition;
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
