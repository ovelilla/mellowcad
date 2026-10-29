# @mellowcad/react — API report

Written by `packages/react/api.test.ts`; a change to it is a change to the public API.

## .

```ts
export type { EditorState }
export type EditorState = Omit<EngineState, (typeof POINTER_KEYS)[number]>;

export { useCadEngine }
export declare function useCadEngine(options?: UseCadEngineOptions): {
    canvasRef: RefObject<HTMLCanvasElement | null>;
    engine: CadEngine | null;
    state: EditorState | null;
};

export type { UseCadEngineOptions }
export interface UseCadEngineOptions {
    readonly store?: () => DrawingStore | null;
    readonly scope?: RefObject<HTMLElement | null> | "document";
    readonly locale?: EngineLocale;
    readonly paletteOpen?: () => boolean;
}

export { useEngineSelector }
export declare function useEngineSelector<T>(engine: CadEngine, select: (state: EngineState) => T): T;
```

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// src/useCadEngine.ts
declare const POINTER_KEYS: readonly [
    "cursorUcs",
    "coordinates",
    "dynamicInput"
];
```
