import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { CadCanvas, mountEngine } from "./CadCanvas"

/**
 * The lifecycle in Node: `mountEngine` is what the component's effect runs,
 * driven here with a stand-in engine (the engine's own wiring is
 * `cad/adapters/CadEngine.test.ts`'s); what the component renders, through
 * the server renderer. No jsdom.
 */

const built = vi.hoisted(() => [] as { canvas: unknown; options: object }[])

vi.mock("@mellowcad/engine", () => ({
  CadEngine: class {
    readonly dispose = vi.fn()
    constructor(canvas: unknown, options: object) {
      built.push({ canvas, options })
    }
  },
}))

const canvas = {} as HTMLCanvasElement

describe("CadCanvas", () => {
  it("renders the canvas with its own attributes and none of the engine's", () => {
    const html = renderToString(
      createElement(CadCanvas, {
        className: "absolute",
        dir: "ltr",
        "aria-label": "Drawing",
        scope: "document",
        paletteOpen: () => true,
        onEngine: () => {},
      })
    )
    expect(html).toBe(
      '<canvas class="absolute" dir="ltr" aria-label="Drawing"></canvas>'
    )
  })

  it("builds the engine on the canvas with safe defaults and hands it out", () => {
    built.length = 0
    const onEngine = vi.fn()
    mountEngine(canvas, { onEngine })
    expect(built).toEqual([{ canvas, options: {} }])
    expect(onEngine).toHaveBeenCalledExactlyOnceWith(expect.any(Object))
  })

  it("asks for the store and the palette's fold when it builds", () => {
    built.length = 0
    const store = { load: () => null }
    mountEngine(canvas, {
      store: () => store as never,
      scope: "document",
      locale: { tag: "es" } as never,
      paletteOpen: () => false,
    })
    expect(built[0].options).toEqual({
      store,
      scope: "document",
      locale: { tag: "es" },
      paletteOpen: false,
    })
  })

  it("scopes the engine to the element its ref holds by then", () => {
    built.length = 0
    const element = {} as HTMLElement
    mountEngine(canvas, { scope: { current: element } })
    mountEngine(canvas, { scope: { current: null } })
    expect(built.map((engine) => engine.options)).toEqual([
      { scope: element },
      {},
    ])
  })

  it("disposes the engine and takes it back on cleanup", () => {
    const onEngine = vi.fn()
    const cleanup = mountEngine(canvas, { onEngine })
    const engine = onEngine.mock.calls[0][0] as { dispose: () => void }
    cleanup()
    expect(engine.dispose).toHaveBeenCalledOnce()
    expect(onEngine).toHaveBeenLastCalledWith(null)
  })
})
