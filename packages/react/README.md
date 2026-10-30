# MellowCAD for React

React bindings for [`@mellowcad/engine`](../../cad/README.md): the drawing's `<canvas>` with the
engine that owns it, the engine's state as React state, and the DOM wiring of the controls AutoCAD
users type into. No styles and no chrome: for the whole editor, see
[`@mellowcad/editor`](../editor/README.md).

It is the package `@mellowcad/react`, ESM only, not published yet. `@mellowcad/engine` and React 19
are peers: a page has one engine, its own.

## Entry point

`@mellowcad/react` is the only one. What it exports, signature by signature, is
[`api.md`](api.md).

## A canvas and your own chrome

```tsx
import { useState } from "react"
import { createRoot } from "react-dom/client"
import type { CadEngine } from "@mellowcad/engine"
import {
  CadCanvas,
  useCommandLineInput,
  useEditorState,
} from "@mellowcad/react"

function Prompt({ engine }: { engine: CadEngine }) {
  return <input aria-label="Command" {...useCommandLineInput(engine)} />
}

function App() {
  const [engine, setEngine] = useState<CadEngine | null>(null)
  const state = useEditorState(engine)
  return (
    <main style={{ display: "grid", height: "100svh" }}>
      <CadCanvas onEngine={setEngine} aria-label="Drawing" />
      <p>{state?.commandLine.prompt}</p>
      {engine && <Prompt engine={engine} />}
    </main>
  )
}

createRoot(document.getElementById("root")!).render(<App />)
```

## `CadCanvas`

It renders a `<canvas>` with the attributes it is given, builds a `CadEngine` on it once it is
mounted and disposes it when it unmounts. The engine arrives through `onEngine(engine)`, and
`onEngine(null)` once it is gone; until then there is none, also on the server, where the canvas
renders empty.

Its engine options are read once, when the engine is built, as the engine's own are:

- `store` makes the drawing's store (`createMemoryDrawingStore`, or a `DrawingStore` of the host's);
  none, nothing is saved.
- `scope` is what the engine takes keys, the wheel and the right-click from: a ref to an element
  that also holds the host's controls, or `"document"` for the whole page; none, its canvas.
- `locale` is the engine's language (`@mellowcad/engine/locales/<tag>`); none, English.
- `paletteOpen` says whether a palette panel starts open, for a host that lays one out before the
  engine exists.

The engine draws and takes the pointer and the keys; everything else is a call to it.

## State

- `useEditorState(engine)` is the engine's state for the chrome, `null` until there is an engine.
  It leaves out what changes with every pointer move (the cursor's coordinates and the dynamic
  input), so a component that renders from it renders when the drawing or a mode changes, not when
  the mouse moves.
- `useEngineSelector(engine, select)` reads one value, the pointer's ones included, and renders
  when that value changes: use it in the smallest component that shows the coordinates.

## The controls AutoCAD users type into

The hooks are the DOM's side of the engine's keys, with no markup or styles of their own:

- `useCommandLineInput(engine)` gives a command line's `<input>` its value and keys (Space as
  Enter, the arrows through the commands already run, Tab to complete a name, Escape back to the
  drawing).
- `useDynamicInput(engine)` gives the dynamic input's box its marker and each field its props: the
  keys the engine takes, focus after a Tab, and focus taken back where the engine allows it.
- `useViewCubeDrag(engine)` turns presses on a ViewCube into the engine's clicks and orbits: its
  `surface` ref captures the pointer, `press(target)` starts on a face, edge or corner.

The editor's own pieces are built on these; read `@mellowcad/editor`'s source for a whole one.

## License

MIT ([LICENSE](LICENSE)): the code, not the MellowCAD name or logo.

AutoCAD is a registered trademark of Autodesk, Inc. MellowCAD is an independent project, not
affiliated with or endorsed by Autodesk; AutoCAD is named only to describe what it is compatible
with.
