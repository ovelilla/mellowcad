import { describe, expect, it } from "vitest"
import { traceBoundaryLoops } from "./boundary"
import {
  createHatch,
  createMText,
  hatchGeometry,
  hatchLoopSegments,
  pointInsideHatch,
} from "./entities"
import {
  arcOf,
  circleOf,
  deg,
  hatchOf,
  lineOf,
  loopOf,
  p,
  rectOf,
  textOf,
} from "../../test/builders"

/** The area a set of loops covers, sampled through the hatch's own parity rule. */
function covers(
  loops: ReturnType<typeof traceBoundaryLoops>,
  point: { x: number; y: number }
): boolean {
  expect(loops).not.toBeNull()
  return pointInsideHatch(createHatch(loops ?? []), point)
}

/** Four separate lines drawn corner to corner, overshooting by `overhang`. */
function looseSquare(size: number, overhang = 0) {
  const lo = -overhang
  const hi = size + overhang
  return [
    lineOf(p(lo, 0), p(hi, 0)),
    lineOf(p(size, lo), p(size, hi)),
    lineOf(p(hi, size), p(lo, size)),
    lineOf(p(0, hi), p(0, lo)),
  ]
}

describe("traceBoundaryLoops", () => {
  it("closes a square drawn as four separate lines", () => {
    const loops = traceBoundaryLoops(p(50, 50), looseSquare(100))

    expect(loops).toHaveLength(1)
    expect(loops![0].vertices).toHaveLength(4)
    expect(covers(loops, p(50, 50))).toBe(true)
    expect(covers(loops, p(150, 50))).toBe(false)
  })

  it("stops at the corners when the lines overshoot", () => {
    const loops = traceBoundaryLoops(p(50, 50), looseSquare(100, 40))

    expect(loops).toHaveLength(1)
    // The overhangs are loose ends, so the boundary is the middle square only.
    const xs = loops![0].vertices.map((v) => v.x)
    const ys = loops![0].vertices.map((v) => v.y)
    expect(Math.min(...xs)).toBeCloseTo(0, 9)
    expect(Math.max(...xs)).toBeCloseTo(100, 9)
    expect(Math.min(...ys)).toBeCloseTo(0, 9)
    expect(Math.max(...ys)).toBeCloseTo(100, 9)
  })

  it("finds no boundary outside the geometry", () => {
    expect(traceBoundaryLoops(p(500, 500), looseSquare(100))).toBeNull()
  })

  it("finds no boundary when the outline has a gap", () => {
    const open = [
      lineOf(p(0, 0), p(100, 0)),
      lineOf(p(100, 0), p(100, 100)),
      lineOf(p(100, 100), p(0, 100)),
      lineOf(p(0, 100), p(0, 20)), // 20 units short of the start
    ]
    expect(traceBoundaryLoops(p(50, 50), open)).toBeNull()
  })

  it("takes only the half of a divided area that was clicked", () => {
    const divided = [...looseSquare(100), lineOf(p(50, 0), p(50, 100))]

    expect(covers(traceBoundaryLoops(p(25, 50), divided), p(25, 50))).toBe(true)
    expect(covers(traceBoundaryLoops(p(25, 50), divided), p(75, 50))).toBe(
      false
    )
  })

  it("returns an enclosed area as an island, leaving it unfilled", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      rectOf(p(0, 0), p(100, 100)),
      rectOf(p(40, 40), p(60, 60)),
    ])

    expect(loops).toHaveLength(2)
    expect(covers(loops, p(10, 10))).toBe(true)
    expect(covers(loops, p(50, 50))).toBe(false)
  })

  it("hatches the island itself when the point is inside it", () => {
    const loops = traceBoundaryLoops(p(50, 50), [
      rectOf(p(0, 0), p(100, 100)),
      rectOf(p(40, 40), p(60, 60)),
    ])

    expect(loops).toHaveLength(1)
    expect(covers(loops, p(50, 50))).toBe(true)
    expect(covers(loops, p(10, 10))).toBe(false)
  })

  it("leaves an island within an island blank (HPISLANDDETECTION 1, Outer)", () => {
    const loops = traceBoundaryLoops(p(5, 5), [
      rectOf(p(0, 0), p(100, 100)),
      rectOf(p(20, 20), p(80, 80)),
      rectOf(p(40, 40), p(60, 60)),
    ])

    expect(loops).toHaveLength(2)
    expect(covers(loops, p(5, 5))).toBe(true)
    expect(covers(loops, p(30, 30))).toBe(false)
    // Normal island detection would hatch this one; Outer is the initial value.
    expect(covers(loops, p(50, 50))).toBe(false)
  })

  it("keeps a curved edge curved", () => {
    // Upper half of a circle, closed by its own diameter.
    const loops = traceBoundaryLoops(p(0, 40), [
      circleOf(p(0, 0), 80),
      lineOf(p(-200, 0), p(200, 0)),
    ])

    expect(loops).toHaveLength(1)
    const arcs = hatchLoopSegments(loops![0]).filter((s) => s.kind === "arc")
    expect(arcs.length).toBeGreaterThan(0)
    for (const arc of arcs) {
      if (arc.kind !== "arc") continue
      expect(arc.radius).toBeCloseTo(80, 6)
      expect(arc.center).toBeCloseToPoint(p(0, 0))
    }
    expect(covers(loops, p(0, 40))).toBe(true)
    expect(covers(loops, p(0, -40))).toBe(false)
    expect(covers(loops, p(70, 40))).toBe(false)
  })

  it("closes an area made of an arc and two lines", () => {
    const loops = traceBoundaryLoops(p(0, 30), [
      arcOf(p(0, 0), 50, 0, deg(180)),
      lineOf(p(-50, 0), p(0, 0)),
      lineOf(p(0, 0), p(50, 0)),
    ])

    expect(loops).toHaveLength(1)
    expect(covers(loops, p(0, 30))).toBe(true)
    expect(covers(loops, p(0, -30))).toBe(false)
  })

  it("fills the whole traced area with pattern lines", () => {
    const loops = traceBoundaryLoops(p(50, 50), looseSquare(100))
    const geometry = hatchGeometry(createHatch(loops!, { patternId: "ANSI31" }))

    expect(geometry.lines.length).toBeGreaterThan(10)
    for (const [a, b] of geometry.lines) {
      for (const point of [a, b]) {
        expect(point.x).toBeGreaterThanOrEqual(-1e-6)
        expect(point.x).toBeLessThanOrEqual(100 + 1e-6)
        expect(point.y).toBeGreaterThanOrEqual(-1e-6)
        expect(point.y).toBeLessThanOrEqual(100 + 1e-6)
      }
    }
  })

  it("ignores objects that are not boundary geometry", () => {
    // An existing hatch bounds nothing (probe hatch/p159).
    const square = [loopOf(p(0, 0), p(100, 100))]
    expect(traceBoundaryLoops(p(50, 50), [hatchOf(square)])).toBeNull()
  })
})

describe("traceBoundaryLoops: text islands (probes hatch/p123, p125, p127)", () => {
  const ROOM = rectOf(p(0, 0), p(200, 100))

  it("boxes a TEXT inside the area as AutoCAD's text-box loop (p125)", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      ROOM,
      textOf(p(80, 45), "ABC", { height: 10 }),
    ])

    expect(loops).toHaveLength(2)
    expect(loops![1].vertices).toBeCloseToPoints(
      [
        p(77.3943, 42.2442),
        p(111.31, 42.2442),
        p(111.31, 57.7558),
        p(77.3943, 57.7558),
      ],
      3
    )
    expect(covers(loops, p(10, 10))).toBe(true)
    expect(covers(loops, p(95, 50))).toBe(false)
  })

  it("scales the margin with the height (p123: ABC at 20)", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      ROOM,
      textOf(p(80, 45), "ABC", { height: 20 }),
    ])

    expect(loops![1].vertices).toBeCloseToPoints(
      [
        p(74.7885, 39.4884),
        p(142.619, 39.4884),
        p(142.619, 70.5116),
        p(74.7885, 70.5116),
      ],
      3
    )
  })

  it("gives each text its own box", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      ROOM,
      textOf(p(20, 45), "ABC", { height: 10 }),
      textOf(p(120, 45), "ABC", { height: 10 }),
    ])

    expect(loops).toHaveLength(3)
  })

  it("boxes an MTEXT by its lines' ascent and descent (p127)", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      ROOM,
      createMText(p(80, 60), "ABC", { width: 60 }),
    ])

    expect(loops).toHaveLength(2)
    expect(loops![1].vertices).toBeCloseToPoints(
      [
        p(79.3699, 56.0923),
        p(87.8061, 56.0923),
        p(87.8061, 61.244),
        p(79.3699, 61.244),
      ],
      3
    )
  })

  it("leaves out a text outside the area, or inside one of its islands", () => {
    const loops = traceBoundaryLoops(p(10, 10), [
      ROOM,
      rectOf(p(100, 20), p(190, 80)),
      textOf(p(120, 45), "ABC", { height: 10 }),
      textOf(p(300, 45), "ABC", { height: 10 }),
    ])

    expect(loops).toHaveLength(2)
  })
})
