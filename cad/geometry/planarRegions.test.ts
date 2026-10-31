import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V } from "./Vec2"
import { PlanarCurve, curveAffine, curveEnd, curveStart } from "./planarCurves"
import {
  RegionFace,
  facesArea,
  facesPerimeter,
  loopArea,
  loopSelfIntersects,
  loopsFromCurves,
  regionBoolean,
} from "./planarRegions"
import { regionFace } from "../../test/arbitraries"

const sq = (x0: number, y0: number, x1: number, y1: number): RegionFace => ({
  loops: [
    [
      { kind: "line", start: { x: x0, y: y0 }, end: { x: x1, y: y0 } },
      { kind: "line", start: { x: x1, y: y0 }, end: { x: x1, y: y1 } },
      { kind: "line", start: { x: x1, y: y1 }, end: { x: x0, y: y1 } },
      { kind: "line", start: { x: x0, y: y1 }, end: { x: x0, y: y0 } },
    ],
  ],
})
const circle = (x: number, y: number, r: number): RegionFace => ({
  loops: [
    [
      {
        kind: "arc",
        center: { x, y },
        radius: r,
        startAngle: 0,
        sweep: Math.PI * 2,
      },
    ],
  ],
})
describe("the region booleans, against AutoCAD 2027's figures (region/b01–b11)", () => {
  it("b01 union", () => {
    const r = regionBoolean("union", [sq(0, 0, 10, 10)], [sq(5, 5, 15, 15)])
    expect(facesArea(r)).toBeCloseTo(175)
    expect(facesPerimeter(r)).toBeCloseTo(60)
    expect(r.length).toBe(1)
  })
  it("b02 subtract hole", () => {
    const r = regionBoolean("subtract", [sq(0, 0, 20, 20)], [circle(10, 10, 5)])
    expect(facesArea(r)).toBeCloseTo(321.4602, 3)
    expect(facesPerimeter(r)).toBeCloseTo(111.4159, 3)
    expect(r.length).toBe(1)
    expect(r[0].loops.length).toBe(2)
  })
  it("b03 intersect", () => {
    const r = regionBoolean(
      "intersect",
      [circle(0, 0, 10)],
      [circle(10, 0, 10)]
    )
    expect(facesArea(r)).toBeCloseTo(122.837, 3)
    expect(facesPerimeter(r)).toBeCloseTo(41.8879, 3)
  })
  it("b06 split & null", () => {
    const r = regionBoolean(
      "subtract",
      [sq(20, 0, 40, 10)],
      [sq(28, -5, 32, 15)]
    )
    expect(facesArea(r)).toBeCloseTo(160)
    expect(facesPerimeter(r)).toBeCloseTo(72)
    expect(r.length).toBe(2)
    expect(
      regionBoolean("subtract", [sq(0, 0, 10, 10)], [sq(-5, -5, 15, 15)])
    ).toEqual([])
    expect(
      regionBoolean("intersect", [sq(0, 0, 10, 10)], [sq(20, 0, 30, 10)])
    ).toEqual([])
  })
  it("b11 touching + ring", () => {
    const r = regionBoolean("union", [sq(0, 0, 10, 10)], [sq(10, 0, 20, 10)])
    expect(facesArea(r)).toBeCloseTo(200)
    expect(facesPerimeter(r)).toBeCloseTo(60)
    let ring = [sq(0, 0, 30, 2)]
    for (const s of [sq(0, 28, 30, 30), sq(0, 0, 2, 30), sq(28, 0, 30, 30)])
      ring = regionBoolean("union", ring, [s])
    expect(facesArea(ring)).toBeCloseTo(224)
    expect(facesPerimeter(ring)).toBeCloseTo(224)
    expect(ring.length).toBe(1)
  })
  it("b10 three circles", () => {
    let r = regionBoolean("intersect", [circle(0, 0, 10)], [circle(10, 0, 10)])
    r = regionBoolean("intersect", r, [circle(5, 8, 10)])
    expect(facesArea(r)).toBeCloseTo(77.069747, 4)
    expect(facesPerimeter(r)).toBeCloseTo(32.71121, 4)
  })
  it("ellipse", () => {
    const e: RegionFace = {
      loops: [
        [
          {
            kind: "ellipse",
            center: { x: 0, y: 0 },
            majorAxis: { x: 10, y: 0 },
            ratio: 0.5,
            startParam: 0,
            sweep: Math.PI * 2,
          },
        ],
      ],
    }
    const r = regionBoolean("union", [e], [circle(10, 0, 3)])
    const lens = regionBoolean("intersect", [e], [circle(10, 0, 3)])
    expect(facesArea(r) + facesArea(lens)).toBeCloseTo(
      facesArea([e]) + Math.PI * 9,
      6
    )
  })
  it("p10/p13 loops", () => {
    const L = (a: number[], b: number[]): PlanarCurve => ({
      kind: "line",
      start: { x: a[0], y: a[1] },
      end: { x: b[0], y: b[1] },
    })
    const ri = loopsFromCurves([
      L([0, 0], [10, 0]),
      L([10, 0], [10, 10]),
      L([10, 10], [0, 10]),
      L([0, 10], [0, 0]),
      L([10, 0], [20, 0]),
      L([20, 0], [20, 10]),
      L([20, 10], [10, 10]),
    ])!.loops
    expect(ri.length).toBe(3)
    const segs = [
      ["0,0", "10,0"],
      ["10,0", "20,0"],
      ["0,10", "10,10"],
      ["10,10", "20,10"],
      ["0,20", "10,20"],
      ["10,20", "20,20"],
      ["0,0", "0,10"],
      ["0,10", "0,20"],
      ["10,0", "10,10"],
      ["10,10", "10,20"],
      ["20,0", "20,10"],
      ["20,10", "20,20"],
    ]
    const g = loopsFromCurves(
      segs.map(([a, b]) =>
        L(a.split(",").map(Number), b.split(",").map(Number))
      )
    )!.loops
    expect(g.length).toBe(5)
    const p4 = loopsFromCurves([
      L([0, 0], [20, 0]),
      L([20, 0], [20, 10]),
      L([20, 10], [0, 10]),
      L([0, 10], [0, 0]),
      L([10, 0], [10, 10]),
      L([20, 10], [30, 20]),
    ])!.loops
    expect(p4.length).toBe(1)
    expect(
      loopSelfIntersects([
        L([40, 0], [50, 10]),
        L([50, 10], [50, 0]),
        L([50, 0], [40, 10]),
        L([40, 10], [40, 0]),
      ])
    ).toBe(true)
    expect(loopSelfIntersects([L([0, 0], [10, 0]), L([10, 0], [0, 0])])).toBe(
      true
    )
    expect(loopSelfIntersects(sq(0, 0, 1, 1).loops[0])).toBe(false)
  })
})

/** Every loop closed end to end, outlines counter-clockwise and holes clockwise. */
function expectWellFormed(faces: readonly RegionFace[]): void {
  for (const face of faces) {
    face.loops.forEach((loop, i) => {
      loop.forEach((edge, k) => {
        const next = loop[(k + 1) % loop.length]
        expect(V.distance(curveEnd(edge), curveStart(next))).toBeLessThan(1e-5)
      })
      if (i === 0) expect(loopArea(loop)).toBeGreaterThan(0)
      else expect(loopArea(loop)).toBeLessThan(0)
    })
  }
}

/** Two faces near enough to overlap more often than not. */
const pair = fc
  .tuple(regionFace, regionFace)
  .filter(([a, b]) =>
    [a, b].every((face) =>
      face.loops[0].every((edge) => edge.kind !== "spline")
    )
  )

describe("the region booleans' invariants", () => {
  it("area(A ∪ B) = area(A) + area(B) − area(A ∩ B)", () => {
    fc.assert(
      fc.property(pair, ([a, b]) => {
        const union = regionBoolean("union", [a], [b])
        const both = regionBoolean("intersect", [a], [b])
        const size = Math.max(facesArea([a]), facesArea([b]), 1)
        expect(
          Math.abs(
            facesArea(union) -
              (facesArea([a]) + facesArea([b]) - facesArea(both))
          ) / size
        ).toBeLessThan(1e-6)
      }),
      { numRuns: 120 }
    )
  })

  it("area(A − B) = area(A) − area(A ∩ B)", () => {
    fc.assert(
      fc.property(pair, ([a, b]) => {
        const less = regionBoolean("subtract", [a], [b])
        const both = regionBoolean("intersect", [a], [b])
        const size = Math.max(facesArea([a]), 1)
        expect(
          Math.abs(facesArea(less) - (facesArea([a]) - facesArea(both))) / size
        ).toBeLessThan(1e-6)
      }),
      { numRuns: 120 }
    )
  })

  it("leaves closed loops, outlines counter-clockwise, holes clockwise", () => {
    fc.assert(
      fc.property(
        pair,
        fc.constantFrom("union", "intersect", "subtract" as const),
        ([a, b], op) => {
          expectWellFormed(regionBoolean(op, [a], [b]))
        }
      ),
      { numRuns: 120 }
    )
  })

  it("leaves A as it was united with itself", () => {
    fc.assert(
      fc.property(regionFace, (a) => {
        const size = Math.max(facesArea([a]), 1)
        expect(
          Math.abs(
            facesArea(regionBoolean("union", [a], [a])) - facesArea([a])
          ) / size
        ).toBeLessThan(1e-6)
      }),
      { numRuns: 60 }
    )
  })
})

describe("a region's edges under an affine map", () => {
  it("turns a circle stretched apart in X and Y into an ellipse of the stretched area", () => {
    const stretched = (xx: number, yy: number) => ({
      loops: circle(0, 0, 1).loops.map((loop) =>
        loop.map((edge) =>
          curveAffine(edge, {
            linear: { xx, xy: 0, yx: 0, yy },
            translation: { x: 3, y: 4 },
          })
        )
      ),
    })
    const wide = stretched(2, 1)
    expect(wide.loops[0][0].kind).toBe("ellipse")
    expect(facesArea([wide])).toBeCloseTo(2 * Math.PI, 12)
    const tall = stretched(1, 3)
    expect(facesArea([tall])).toBeCloseTo(3 * Math.PI, 12)
    // A reflection runs the edge the other way round.
    expect(facesArea([stretched(-2, 1)])).toBeCloseTo(-2 * Math.PI, 12)
  })

  it("keeps a line's ends and a spline's control points mapped", () => {
    const mapped = curveAffine(
      { kind: "line", start: { x: 1, y: 1 }, end: { x: 2, y: 3 } },
      { linear: { xx: 2, xy: 0, yx: 0, yy: 1 }, translation: { x: 0, y: 0 } }
    )
    expect(mapped).toEqual({
      kind: "line",
      start: { x: 2, y: 1 },
      end: { x: 4, y: 3 },
    })
  })
})
