import { describe, expect, it } from "vitest"
import type { Vec2 } from "../geometry/Vec2"
import {
  GradientFill,
  HatchGradient,
  HatchGradientName,
  gradientFill,
  mixColors,
} from "./hatchGradients"

// What AutoCAD 2027 plots of each gradient (probes gradient/g04, g06): a
// blue-to-yellow fill (Color 1 index 5, Color 2 index 2) over a 100 × 50
// rectangle at the origin, 16 pixels a unit, read as R / 255 — the share of
// Color 2 — at the points below.

const BLUE = "#0000ff"
const YELLOW = "#ffff00"
const RECTANGLE: Vec2[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 50 },
  { x: 0, y: 50 },
]

function fillOf(
  name: HatchGradientName,
  options: Partial<HatchGradient> = {}
): GradientFill {
  const fill = gradientFill(
    { name, colors: [BLUE, YELLOW], angle: 0, centered: true, ...options },
    [RECTANGLE]
  )
  if (!fill) throw new Error("no fill")
  return fill
}

/** The share of Color 2 the fill gives at `p`, as a renderer reads its stops. */
function shareAt(fill: GradientFill, p: Vec2): number {
  const { axisX: a, axisY: b, origin: o } = fill
  const det = a.x * b.y - a.y * b.x
  const dx = p.x - o.x
  const dy = p.y - o.y
  const u = (dx * b.y - dy * b.x) / det
  const v = (a.x * dy - a.y * dx) / det
  const s = Math.min(
    Math.max(fill.kind === "linear" ? u : Math.hypot(u, v), 0),
    1
  )
  const stops = fill.stops
  let i = 0
  while (i < stops.length - 2 && s > stops[i + 1].offset) i++
  const span = stops[i + 1].offset - stops[i].offset
  const k = span > 0 ? (s - stops[i].offset) / span : 0
  const red = (color: string) => parseInt(color.slice(1, 3), 16) / 255
  return (
    red(stops[i].color) + (red(stops[i + 1].color) - red(stops[i].color)) * k
  )
}

function expectPlotted(
  fill: GradientFill,
  points: readonly (readonly [number, number, number])[]
) {
  for (const [x, y, plotted] of points) {
    expect(Math.abs(shareAt(fill, { x, y }) - plotted)).toBeLessThan(0.035)
  }
}

describe("gradientFill: AutoCAD 2027's plots", () => {
  it("LINEAR runs Color 1 to Color 2 across the extents", () => {
    expectPlotted(fillOf("LINEAR"), [
      [2.5, 27.5, 0.02],
      [47.5, 27.5, 0.47],
      [97.5, 27.5, 0.98],
    ])
  })

  it("LINEAR turned 90° runs up the extents", () => {
    expectPlotted(fillOf("LINEAR", { angle: Math.PI / 2 }), [
      [50, 5, 0.1],
      [50, 25, 0.5],
      [50, 45, 0.9],
    ])
  })

  it("CYLINDER is Color 2 along the middle, by the cosine's quarters", () => {
    const row = [0.07, 0.22, 0.38, 0.52, 0.64, 0.75, 0.85, 0.92, 0.96, 0.98]
    expectPlotted(
      fillOf("CYLINDER"),
      row.map((t, i) => [2.5 + 5 * i, 27.5, t] as const)
    )
  })

  it("INVCYLINDER is CYLINDER with its colours swapped", () => {
    const cylinder = fillOf("CYLINDER")
    const inverted = fillOf("INVCYLINDER")
    for (const x of [3, 20, 40, 50, 77]) {
      const p = { x, y: 10 }
      expect(shareAt(inverted, p)).toBeCloseTo(1 - shareAt(cylinder, p), 2)
    }
  })

  it("SPHERICAL is Color 2 at the centre out to half the longer side", () => {
    expectPlotted(fillOf("SPHERICAL"), [
      [2.5, 27.5, 0.07],
      [22.5, 27.5, 0.63],
      [47.5, 27.5, 0.98],
      [47.5, 47.5, 0.74],
      [47.5, 37.5, 0.91],
    ])
  })

  it("SPHERICAL turned is the same circle", () => {
    const plain = fillOf("SPHERICAL")
    const turned = fillOf("SPHERICAL", { angle: Math.PI / 6 })
    for (const p of [
      { x: 10, y: 10 },
      { x: 70, y: 40 },
    ]) {
      expect(shareAt(turned, p)).toBeCloseTo(shareAt(plain, p), 6)
    }
  })

  it("HEMISPHERICAL is centred below the bottom", () => {
    const column = [0.89, 0.86, 0.82, 0.77, 0.73, 0.67, 0.61, 0.55, 0.48, 0.41]
    expectPlotted(
      fillOf("HEMISPHERICAL"),
      column.map((t, i) => [47.5, 2.5 + 5 * i, t] as const)
    )
    expectPlotted(fillOf("HEMISPHERICAL"), [
      [2.5, 2.5, 0.64],
      [2.5, 47.5, 0.2],
    ])
  })

  it("CURVED runs up from the bottom's middle, lower at the sides", () => {
    expectPlotted(fillOf("CURVED"), [
      [48.75, 1.25, 0.99],
      [48.75, 26.25, 0.67],
      [48.75, 48.75, 0.04],
      [1.25, 1.25, 0.86],
      [1.25, 26.25, 0.56],
    ])
  })

  it("not centred, LINEAR turns at 5/16 of the way and SPHERICAL moves up and left", () => {
    expectPlotted(fillOf("LINEAR", { centered: false }), [
      [1.25, 25, 0.02],
      [26.25, 25, 0.42],
      [61.25, 25, 0.72],
      [98.75, 25, 0.98],
    ])
    expectPlotted(fillOf("SPHERICAL", { centered: false }), [
      [22.5, 47.5, 0.98],
      [2.5, 2.5, 0.02],
      [72.5, 47.5, 0.07],
    ])
  })

  it("bounds no area with fewer than three points", () => {
    expect(
      gradientFill(
        { name: "LINEAR", colors: [BLUE, YELLOW], angle: 0, centered: true },
        [
          [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
        ]
      )
    ).toBeNull()
  })
})

describe("mixColors", () => {
  it("blends in RGB, grey halfway from blue to yellow (g03)", () => {
    expect(mixColors(BLUE, YELLOW, 0.5)).toBe("#808080")
    expect(mixColors(BLUE, YELLOW, 0)).toBe(BLUE)
    expect(mixColors(BLUE, YELLOW, 2)).toBe(YELLOW)
  })
})
