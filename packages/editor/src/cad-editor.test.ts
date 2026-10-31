import { createElement, type ComponentType } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  type CadEngine,
  createLocalStorageDrawingStore,
  createMemoryDrawingStore,
} from "@mellowcad/engine"
import type { CadCanvasProps, EditorState } from "@mellowcad/react"
import {
  CadEditor,
  type CadEditorComponents,
  EditorZones,
  helpUrl,
} from "./cad-editor"
import type { PieceProps } from "./piece"
import type { StatusBarProps } from "./status-bar"
import type { TopBarProps } from "./top-bar"

/**
 * The slots, in Node through the server renderer (no jsdom). It never runs
 * the effect that builds the engine, so `CadEditor` shows the first paint, the
 * zones alone; what fills them is `EditorZones`, handed a stand-in engine.
 * What `CadEditor` hands the canvas is read off a stand-in `CadCanvas`, whose
 * own lifecycle is `@mellowcad/react`'s test.
 */

const canvases = vi.hoisted(() => [] as CadCanvasProps[])

vi.mock("@mellowcad/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mellowcad/react")>()),
  CadCanvas: (props: CadCanvasProps) => {
    canvases.push(props)
    return null
  },
}))

/** The props `CadEditor` hands its canvas on the first render. */
function canvasOf(props: Parameters<typeof CadEditor>[0] = {}) {
  canvases.length = 0
  renderToString(createElement(CadEditor, props))
  return canvases[0]
}

const ZONES = ["top", "tools", "canvas", "panel", "command", "status"]

/** The grid areas a render lays out, in document order. */
const zones = (html: string) =>
  [...html.matchAll(/\[grid-area:(\w+)\]/g)].map((match) => match[1])

const engine = {} as CadEngine
const state = {
  cleanScreen: { active: false, palette: false },
  commandLine: { visible: true, buffer: "" },
  rollover: null,
} as unknown as EditorState

/** Every piece turned off, so only what a test puts back renders. */
const NONE: Required<CadEditorComponents> = {
  TopBar: null,
  ToolRail: null,
  PalettePanel: null,
  CommandLine: null,
  StatusBar: null,
  ViewportControls: null,
  ViewCube: null,
  NavigationBar: null,
  DynamicInput: null,
}

/** A replacement that renders its name and keeps the props it was handed. */
function stand<P extends PieceProps>(
  name: string,
  seen: P[]
): ComponentType<P> {
  return function Replacement(props: P) {
    seen.push(props)
    return createElement("output", null, name)
  }
}

function renderZones(components: CadEditorComponents) {
  return renderToString(
    createElement(EditorZones, {
      components,
      ready: { engine, state },
      mark: "M",
      languages: [],
      statusBarKey: "status-key",
      canvas: createElement("canvas"),
      paletteHandle: null,
    })
  )
}

describe("CadEditor's components", () => {
  it("lays out every zone before the engine exists", () => {
    expect(zones(renderToString(createElement(CadEditor)))).toEqual(ZONES)
  })

  it("takes a turned-off piece's zone away from the first paint", () => {
    const html = renderToString(
      createElement(CadEditor, {
        components: { TopBar: null, ToolRail: null, StatusBar: null },
      })
    )
    expect(zones(html)).toEqual(["canvas", "panel", "command"])
    expect(
      zones(renderToString(createElement(CadEditor, { components: NONE })))
    ).toEqual(["canvas"])
  })

  it("renders a replacement in its piece's place, handed what the piece is", () => {
    const pieces: PieceProps[] = []
    const tops: TopBarProps[] = []
    const statuses: StatusBarProps[] = []
    const html = renderZones({
      ...NONE,
      TopBar: stand("top", tops),
      StatusBar: stand("status", statuses),
      ViewCube: stand("cube", pieces),
      DynamicInput: stand("input", pieces),
    })

    expect(zones(html)).toEqual(["top", "canvas", "status"])
    expect(
      [...html.matchAll(/<output>(\w+)<\/output>/g)].map((m) => m[1])
    ).toEqual(["top", "input", "cube", "status"])
    for (const props of [...pieces, ...tops, ...statuses]) {
      expect(props.engine).toBe(engine)
      expect(props.state).toBe(state)
    }
    expect(tops[0]).toMatchObject({ mark: "M", languages: [] })
    expect(statuses[0]).toMatchObject({ storageKey: "status-key" })
  })

  it("keeps the editor's piece where the host says nothing", () => {
    const html = renderToString(
      createElement(CadEditor, { components: { ...NONE, TopBar: undefined } })
    )
    expect(zones(html)).toEqual(["top", "canvas"])
  })
})

describe("CadEditor's engine", () => {
  it("keeps the drawing in this browser's localStorage by default, taking every key", () => {
    expect(canvasOf()).toMatchObject({
      store: createLocalStorageDrawingStore,
      scope: "document",
    })
  })

  it("builds the engine with the host's store", () => {
    const store = () => createMemoryDrawingStore()
    expect(canvasOf({ store }).store).toBe(store)
  })

  it("hands the host the engine once it is built, and null once it is disposed", () => {
    const onEngine = vi.fn()
    const canvas = canvasOf({ onEngine })
    canvas.onEngine?.(engine)
    canvas.onEngine?.(null)
    expect(onEngine.mock.calls).toEqual([[engine], [null]])
  })

  it("needs no onEngine of the host's", () => {
    expect(() => canvasOf().onEngine?.(engine)).not.toThrow()
  })
})

describe("CadEditor's help", () => {
  const help = {
    index: "/docs/getting-started",
    command: "/es/docs/commands#{command}",
  }

  it("opens the running command's entry, by its global name", () => {
    expect(helpUrl(help, "LINE")).toBe("/es/docs/commands#line")
    expect(helpUrl(help, "-HATCH")).toBe("/es/docs/commands#-hatch")
  })

  it("opens the index with no command running", () => {
    expect(helpUrl(help, null)).toBe("/docs/getting-started")
  })
})
