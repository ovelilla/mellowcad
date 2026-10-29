import { describe, expect, it, vi } from "vitest"
import type { CadEngine } from "@mellowcad/engine"

import { renderHook } from "../../../test/renderHook"
import { useViewCubeDrag } from "./useViewCubeDrag"

function setup() {
  const engine = {
    viewCubePress: vi.fn(),
    viewCubeMove: vi.fn(),
    viewCubeRelease: vi.fn(),
  }
  const drag = renderHook(() => useViewCubeDrag(engine as unknown as CadEngine))
  const svg = { setPointerCapture: vi.fn() }
  drag.surface(svg as unknown as Element)
  return { engine, drag, svg }
}

function pointer(button: number, x: number, y: number) {
  return {
    button,
    pointerId: 7,
    clientX: x,
    clientY: y,
    stopPropagation: vi.fn(),
  }
}

describe("useViewCubeDrag", () => {
  it("hands a left press its target and point, keeping the pointer on the surface", () => {
    const { engine, drag, svg } = setup()
    const event = pointer(0, 1700, 90)
    drag.press({ part: "top" } as never)(event as never)
    expect(event.stopPropagation).toHaveBeenCalled()
    expect(svg.setPointerCapture).toHaveBeenCalledWith(7)
    expect(engine.viewCubePress).toHaveBeenCalledWith(
      { part: "top" },
      { x: 1700, y: 90 }
    )
  })

  it("leaves any other button to the page", () => {
    const { engine, drag, svg } = setup()
    const event = pointer(2, 1700, 90)
    drag.press({ ring: true })(event as never)
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(svg.setPointerCapture).not.toHaveBeenCalled()
    expect(engine.viewCubePress).not.toHaveBeenCalled()
  })

  it("follows the drag and its release in the page's pixels, and a lost pointer as null", () => {
    const { engine, drag } = setup()
    drag.move(pointer(0, 1712, 90) as never)
    drag.release(pointer(0, 1720, 95) as never)
    drag.cancel()
    expect(engine.viewCubeMove).toHaveBeenCalledWith({ x: 1712, y: 90 })
    expect(engine.viewCubeRelease.mock.calls).toEqual([
      [{ x: 1720, y: 95 }],
      [null],
    ])
  })
})
