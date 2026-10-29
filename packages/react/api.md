# @mellowcad/react — API report

Written by `packages/react/api.test.ts`; a change to it is a change to the public API.

## .

```ts
export { CadCanvas }
export declare function CadCanvas(props: CadCanvasProps): ReactElement;

export type { CadCanvasProps }
export interface CadCanvasProps extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
    readonly store?: () => DrawingStore | null;
    readonly scope?: RefObject<HTMLElement | null> | "document";
    readonly locale?: EngineLocale;
    readonly paletteOpen?: () => boolean;
    readonly onEngine?: (engine: CadEngine | null) => void;
}

export type { EditorState }
export type EditorState = Omit<EngineState, (typeof POINTER_KEYS)[number]>;

export { useCommandLineInput }
export declare function useCommandLineInput(engine: CadEngine): CommandLineInputProps;

export { useDynamicInput }
export declare function useDynamicInput(engine: CadEngine): {
    readonly dynamicInput: DynamicInputUi | null;
    readonly box: {
        readonly "data-dynamic-input": "";
    };
    field(field: DynamicInputFieldUi): DynamicInputFieldProps;
};

export { useEditorState }
export declare function useEditorState(engine: CadEngine | null): EditorState | null;

export { useEngineSelector }
export declare function useEngineSelector<T>(engine: CadEngine, select: (state: EngineState) => T): T;

export { useViewCubeDrag }
export declare function useViewCubeDrag(engine: CadEngine): {
    readonly surface: (element: Element | null) => void;
    press(target: ViewCubeTarget): (event: PointerEvent<Element>) => void;
    readonly move: (event: PointerEvent<Element>) => void;
    readonly release: (event: PointerEvent<Element>) => void;
    readonly cancel: () => void;
};
```

## Reached, not exported

What the exports' types name. A host cannot import these names, but their shape is API.

```ts
// src/useCommandLineInput.ts
interface CommandLineInputProps {
    readonly value: string;
    readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    readonly autoComplete: "off";
    readonly spellCheck: false;
}

// src/useDynamicInput.ts
interface DynamicInputFieldProps {
    readonly ref?: (element: FieldElement | null) => void;
    readonly value: string;
    readonly onFocus: (event: FocusEvent<FieldElement>) => void;
    readonly onChange: (event: ChangeEvent<FieldElement>) => void;
    readonly onKeyDown: (event: KeyboardEvent<FieldElement>) => void;
    readonly autoComplete: "off";
    readonly spellCheck: false;
}

// src/useDynamicInput.ts
type FieldElement = HTMLInputElement | HTMLTextAreaElement;

// src/useEditorState.ts
declare const POINTER_KEYS: readonly [
    "cursorUcs",
    "coordinates",
    "dynamicInput"
];
```
