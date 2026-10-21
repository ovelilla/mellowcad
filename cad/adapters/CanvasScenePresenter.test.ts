import { describe, expect, it } from "vitest"
import { p } from "../../test/builders"
import type { ScenePrimitive } from "../scene/types"
import { CanvasScenePresenter } from "./CanvasScenePresenter"

/** The stroked segments a frame drew, with the dash phase each started at. */
function strokedSegments(primitives: ScenePrimitive[]) {
  const strokes: {
    from: [number, number]
    to: [number, number]
    offset: number
  }[] = []
  let from: [number, number] = [0, 0]
  let to: [number, number] = [0, 0]
  const ctx = {
    lineDashOffset: 0,
    setTransform() {},
    clearRect() {},
    fillRect() {},
    setLineDash() {},
    beginPath() {},
    moveTo(x: number, y: number) {
      from = [x, y]
    },
    lineTo(x: number, y: number) {
      to = [x, y]
    },
    stroke() {
      strokes.push({ from, to, offset: ctx.lineDashOffset })
    },
  }
  new CanvasScenePresenter().draw(
    ctx as unknown as CanvasRenderingContext2D,
    { width: 200, height: 100, background: "#000", primitives },
    1
  )
  return strokes
}

const stroke = { color: "#fff", width: 1 }

describe("CanvasScenePresenter", () => {
  it("clips a guide to the frame, keeping its dashes where they were", () => {
    // A guide a hair off the axis: Chrome culls the off-screen dashes only
    // of an exactly horizontal or vertical line, so it must not see 4e6 px.
    const [guide] = strokedSegments([
      {
        kind: "segment",
        a: p(-2_000_005, 50),
        b: p(2_000_000, 50.001),
        stroke: { ...stroke, dash: [7, 5] },
      },
    ])
    expect(guide.from[0]).toBeCloseTo(-8)
    expect(guide.to[0]).toBeCloseTo(208)
    // 1 999 997 px of the pattern were skipped: 166 666 periods of 12, and 5.
    expect(guide.offset).toBeCloseTo(5, 3)
  })

  it("starts a line's pattern at the scene's phase, across the clip too", () => {
    // probe line/p207: the builder centres the pattern; the canvas only applies it.
    const dashed = { ...stroke, dash: [6.35, 3.175], dashOffset: 0.8 }
    const [inside, clipped] = strokedSegments([
      { kind: "segment", a: p(10, 10), b: p(100, 10), stroke: dashed },
      { kind: "segment", a: p(-20, 50), b: p(100, 50), stroke: dashed },
    ])
    expect(inside.offset).toBeCloseTo(0.8, 9)
    // 12 px clipped off (to the 8 px margin): 0.8 + 12 − 9.525.
    expect(clipped.offset).toBeCloseTo(3.275, 9)
  })

  it("draws a linetype's dot as a run as long as the stroke is wide", () => {
    // probe line/p202: DASHDOT's dot is a dash of 0, which a butt-capped
    // canvas would not draw at all.
    const dashes: number[][] = []
    const ctx = {
      lineDashOffset: 0,
      setTransform() {},
      clearRect() {},
      fillRect() {},
      setLineDash(dash: number[]) {
        dashes.push(dash)
      },
      beginPath() {},
      moveTo() {},
      lineTo() {},
      stroke() {},
    }
    new CanvasScenePresenter().draw(
      ctx as unknown as CanvasRenderingContext2D,
      {
        width: 200,
        height: 100,
        background: "#000",
        primitives: [
          {
            kind: "segment",
            a: p(0, 10),
            b: p(100, 10),
            stroke: { color: "#fff", width: 1.25, dash: [12.7, 6.35, 0, 6.35] },
          },
        ],
      },
      1
    )
    expect(dashes[0]).toEqual([12.7, 6.35, 1.25, 5.1])
  })

  it("draws a segment inside the frame as is, and none outside it", () => {
    const strokes = strokedSegments([
      { kind: "segment", a: p(10, 10), b: p(20, 20), stroke },
      { kind: "segment", a: p(-50, -50), b: p(-20, -40), stroke },
    ])
    expect(strokes).toEqual([{ from: [10, 10], to: [20, 20], offset: 0 }])
  })
})
