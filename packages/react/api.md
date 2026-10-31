# @mellowcad/react — API report

Every export with its signature and its documentation, grouped by topic, then the types they reach. Generated from the source by `packages/react/api.test.ts`: a change to it is a change to the public API.

## .

```ts
export { CadCanvas }
/**
 * The drawing's `<canvas>` and the {@link CadEngine} that owns it: built once
 * the canvas is mounted, disposed when it unmounts. The engine does all the
 * drawing and interaction; the host renders its chrome from
 * `useEditorState(engine)` and calls the engine's methods.
 */
export declare function CadCanvas(props: CadCanvasProps): ReactElement;

export type { CadCanvasProps }
/**
 * The engine's options, read once, when it is built — like the engine's own,
 * they are not reactive — and the canvas's own attributes, which are.
 */
export interface CadCanvasProps extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
    /** Makes the engine's store when it is built; see `CadEngineOptions.store`. */
    readonly store?: () => DrawingStore | null;
    /**
     * What the engine may take keys from; see `CadEngineOptions.scope`. An
     * element by its ref, since it exists only once mounted.
     */
    readonly scope?: RefObject<HTMLElement | null> | "document";
    /** The engine's language; English when absent. */
    readonly locale?: EngineLocale;
    /**
     * Whether the palette panel starts open, asked when the engine is built:
     * by then the page knows what it laid out before the engine existed.
     */
    readonly paletteOpen?: () => boolean;
    /** Shows a command's help on F1; see `CadEngineOptions.onHelp`. */
    readonly onHelp?: (command: string | null) => void;
    /** Handed the engine once it is built, and `null` once it is disposed. */
    readonly onEngine?: (engine: CadEngine | null) => void;
}

export type { EditorState }
/** The engine's state as the editor's chrome renders it. */
export type EditorState = Omit<EngineState, (typeof POINTER_KEYS)[number]>;

export { useCommandLineInput }
/**
 * The command line's field, wired to the engine's buffer: what is typed there
 * and on the drawing is the same text. Its keys are the engine's
 * (`commandLineKey`: Space as Enter, the arrows' history, Tab's completion),
 * and the browser's action is prevented for every key the engine takes.
 */
export declare function useCommandLineInput(engine: CadEngine): CommandLineInputProps;

export { useDynamicInput }
/**
 * AutoCAD's dynamic input box, wired to the engine: the box it shows (`null`
 * when none), what its element is spread with, and each field's props. A
 * field's keys are the engine's (`dynamicInputKey`; the Mac's Command is
 * Ctrl there), the browser's action is prevented for each key it takes, and
 * after a Tab focus follows the field now active. After every render the
 * active field takes focus back where `engine.mayTakeFocus` allows, so a
 * value can be typed right after a point is placed.
 */
export declare function useDynamicInput(engine: CadEngine): {
    readonly dynamicInput: DynamicInputUi | null;
    readonly box: {
        readonly "data-dynamic-input": "";
    };
    field(field: DynamicInputFieldUi): DynamicInputFieldProps;
};

export { useEditorState }
/**
 * The engine's state snapshot, through `useSyncExternalStore`, without what a
 * pointer move changes ({@link EditorState}): moving the cursor would
 * otherwise re-render the whole editor on every event. `null` until the
 * engine exists (`CadCanvas`'s `onEngine`) and on the server.
 *
 * React components render the UI chrome (toolbar, status bar) from it and
 * issue commands by calling methods on the engine.
 */
export declare function useEditorState(engine: CadEngine | null): EditorState | null;

export { useEngineSelector }
/**
 * A part of the engine's state, re-rendering only when it changes — by
 * identity, which the engine keeps for whatever a change did not touch. For
 * what {@link EditorState} leaves out.
 */
export declare function useEngineSelector<T>(engine: CadEngine, select: (state: EngineState) => T): T;

export { useViewCubeDrag }
/**
 * A press on the ViewCube and its drag, handed to the engine in the page's
 * pixels; the engine tells a click from a drag (`viewCubePress`). `surface`
 * is the ref of the element holding the cube's parts, which takes the moves
 * and the release: a press captures the pointer there, so a drag that leaves
 * the cube still reaches it. Destructure what it returns: React Compiler's
 * lint takes an object with a member passed as `ref` for a ref, and fails
 * every read of it during render.
 */
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
/** What the command line's `<input>` is spread with. */
interface CommandLineInputProps {
    readonly value: string;
    readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    readonly autoComplete: "off";
    readonly spellCheck: false;
}

// src/useDynamicInput.ts
/** What a field's `<input>` (or a `paragraphs` field's `<textarea>`) is spread with. */
interface DynamicInputFieldProps {
    /** Only on the active field: the one the box keeps focused. */
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
/**
 * What changes on every pointer move. The editor's chrome never reads it, so
 * {@link useEditorState} leaves it out of the state it re-renders with; the
 * two components that show it read it with {@link useEngineSelector}.
 */
declare const POINTER_KEYS: readonly [
    "cursorUcs",
    "coordinates",
    "dynamicInput"
];
```
