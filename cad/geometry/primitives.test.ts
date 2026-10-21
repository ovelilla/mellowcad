import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V } from "./Vec2"
import {
  angleWithinSweep,
  arcFrom3Points,
  bulgeThroughPoint,
  bulgeToArc,
  capParallelLines,
  chamferLines,
  circleCircleIntersection,
  circleFrom3Points,
  circleOnDiameter,
  circlesMeetingThree,
  circlesTangentToBoth,
  type CircleConstraint,
  closestPointOnArc,
  closestPointOnCircle,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  ellipseAngleFromParam,
  ellipseParamFromAngle,
  filletLines,
  infiniteLineIntersection,
  intersectRays,
  lineCircleIntersectionParams,
  nearestToPicks,
  normalizeAngle,
  offsetSegment,
  polarPoint,
  projectPointOntoRay,
  segmentArcIntersection,
  segmentCircleIntersection,
  segmentSegmentIntersection,
  signChanges,
  tangentPointsFromPoint,
  tangentLinesOfCircles,
  type TangentTarget,
} from "./primitives"
import {
  angle,
  bulge,
  distinctPoints,
  nonCollinearPoints,
  point,
  positiveLength,
} from "../../test/arbitraries"
import { deg, p } from "../../test/builders"

/**
 * The geometry kernel is the layer every tool, snap and constraint ultimately
 * calls, so a defect here surfaces as a dozen unrelated-looking bugs. Each
 * function is pinned with worked examples (readable, and they document the sign
 * and winding conventions) plus the invariants that must hold for *any* input.
 */

const ORIGIN = p(0, 0)

/** Perpendicular distance from a point to the infinite line through a→b. */
function distanceToLine(a: Vec2Like, b: Vec2Like, q: Vec2Like): number {
  return Math.abs(V.cross(V.normalize(V.sub(b, a)), V.sub(q, a)))
}

type Vec2Like = { readonly x: number; readonly y: number }

describe("closestPointOnSegment", () => {
  it("drops a perpendicular onto the segment", () => {
    const result = closestPointOnSegment(p(0, 0), p(10, 0), p(4, 7))
    expect(result.point).toBeCloseToPoint(p(4, 0))
    expect(result.distance).toBeCloseTo(7)
    expect(result.t).toBeCloseTo(0.4)
  })

  it("clamps past either end", () => {
    expect(closestPointOnSegment(p(0, 0), p(10, 0), p(-5, 0)).t).toBe(0)
    expect(closestPointOnSegment(p(0, 0), p(10, 0), p(50, 0)).t).toBe(1)
  })

  it("degrades to the start point for a zero-length segment", () => {
    const result = closestPointOnSegment(p(3, 3), p(3, 3), p(0, 0))
    expect(result.point).toBeCloseToPoint(p(3, 3))
    expect(result.distance).toBeCloseTo(Math.hypot(3, 3))
  })

  it("always lands on the segment and is never farther than an endpoint", () => {
    fc.assert(
      fc.property(distinctPoints, point, ([a, b], q) => {
        const result = closestPointOnSegment(a, b, q)
        expect(result.t).toBeGreaterThanOrEqual(0)
        expect(result.t).toBeLessThanOrEqual(1)
        expect(distanceToLine(a, b, result.point)).toBeLessThan(1e-6)
        expect(result.distance).toBeLessThanOrEqual(
          Math.min(V.distance(a, q), V.distance(b, q)) + 1e-9
        )
        expect(result.distance).toBeCloseTo(V.distance(result.point, q), 6)
      })
    )
  })
})

describe("closestPointOnInfiniteLine", () => {
  it("does not clamp, unlike the segment version", () => {
    const result = closestPointOnInfiniteLine(p(0, 0), p(10, 0), p(50, 4))
    expect(result.point).toBeCloseToPoint(p(50, 0))
    expect(result.t).toBeCloseTo(5)
  })

  it("meets the line at a right angle", () => {
    fc.assert(
      fc.property(distinctPoints, point, ([a, b], q) => {
        const result = closestPointOnInfiniteLine(a, b, q)
        const along = V.normalize(V.sub(b, a))
        const toQuery = V.sub(q, result.point)
        expect(V.dot(along, toQuery)).toBeCloseTo(0, 6)
      })
    )
  })
})

describe("closestPointOnCircle", () => {
  it("projects radially onto the outline", () => {
    const result = closestPointOnCircle(ORIGIN, 10, p(30, 0))
    expect(result.point).toBeCloseToPoint(p(10, 0))
    expect(result.distance).toBeCloseTo(20)
    expect(result.t).toBeCloseToAngle(0)
  })

  it("measures from inside the circle too", () => {
    expect(closestPointOnCircle(ORIGIN, 10, p(4, 0)).distance).toBeCloseTo(6)
  })

  it("picks an arbitrary but finite point at the centre", () => {
    // Degenerate input must stay finite so callers can carry on.
    const result = closestPointOnCircle(p(5, 5), 3, p(5, 5))
    expect(result.point).toBeCloseToPoint(p(8, 5))
    expect(result.distance).toBe(3)
  })

  it("returns a point exactly on the outline", () => {
    fc.assert(
      fc.property(point, positiveLength, point, (center, radius, q) => {
        const result = closestPointOnCircle(center, radius, q)
        expect(V.distance(center, result.point)).toBeCloseTo(radius, 6)
      })
    )
  })
})

describe("offsetSegment", () => {
  it("shifts towards the side the cursor is on", () => {
    const above = offsetSegment(p(0, 0), p(100, 0), 20, p(50, 5))
    expect(above?.a).toBeCloseToPoint(p(0, 20))
    expect(above?.b).toBeCloseToPoint(p(100, 20))

    const below = offsetSegment(p(0, 0), p(100, 0), 20, p(50, -5))
    expect(below?.a).toBeCloseToPoint(p(0, -20))
    expect(below?.b).toBeCloseToPoint(p(100, -20))
  })

  it("rejects a degenerate segment", () => {
    expect(offsetSegment(p(1, 1), p(1, 1), 10, p(5, 5))).toBeNull()
  })

  it("stays parallel, keeps its length and honours the distance", () => {
    fc.assert(
      fc.property(
        distinctPoints,
        positiveLength,
        point,
        ([a, b], distance, side) => {
          const result = offsetSegment(a, b, distance, side)
          expect(result).not.toBeNull()
          if (!result) return

          const originalDir = V.normalize(V.sub(b, a))
          const offsetDir = V.normalize(V.sub(result.b, result.a))
          expect(V.cross(originalDir, offsetDir)).toBeCloseTo(0, 6)
          expect(V.distance(result.a, result.b)).toBeCloseTo(
            V.distance(a, b),
            6
          )
          expect(distanceToLine(a, b, result.a)).toBeCloseTo(distance, 6)
        }
      )
    )
  })
})

describe("infiniteLineIntersection", () => {
  it("crosses the axes at the origin", () => {
    const result = infiniteLineIntersection(
      p(-10, 0),
      p(10, 0),
      p(0, -10),
      p(0, 10)
    )
    expect(result?.point).toBeCloseToPoint(ORIGIN)
    expect(result?.t).toBeCloseTo(0.5)
    expect(result?.u).toBeCloseTo(0.5)
  })

  it("reports parameters outside 0..1 when the meeting point needs extending", () => {
    const result = infiniteLineIntersection(
      p(0, 0),
      p(10, 0),
      p(50, -10),
      p(50, 10)
    )
    expect(result?.point).toBeCloseToPoint(p(50, 0))
    expect(result?.t).toBeCloseTo(5)
  })

  it("returns null for parallel lines", () => {
    expect(
      infiniteLineIntersection(p(0, 0), p(10, 0), p(0, 5), p(10, 5))
    ).toBeNull()
  })

  it("treats near-parallel lines as parallel", () => {
    // The crossing of two lines a nanometre-per-metre apart in slope sits a
    // billion units away. Every caller — fillet, chamfer, trim/extend, offset
    // corners — would build geometry from it, so it is rejected instead.
    expect(
      infiniteLineIntersection(p(0, 0), p(1000, 0), p(0, 1), p(1000, 1 + 1e-9))
    ).toBeNull()
  })

  it("uses a scale-invariant parallel test", () => {
    // The same shape scaled up a thousandfold must give the same verdict, so
    // the tolerance cannot be an absolute distance.
    const angled = (scale: number) =>
      infiniteLineIntersection(
        p(0, 0),
        p(scale, 0),
        p(0, scale),
        p(scale, scale * 1.01)
      )
    expect(angled(1)).not.toBeNull()
    expect(angled(1000)).not.toBeNull()
  })

  it("returns a point that lies on both lines", () => {
    fc.assert(
      fc.property(distinctPoints, distinctPoints, ([a1, a2], [b1, b2]) => {
        const result = infiniteLineIntersection(a1, a2, b1, b2)
        fc.pre(result !== null)
        // Near-parallel lines put the crossing far away, where the residual
        // scales with the distance; compare relatively.
        const scale = Math.max(
          1,
          V.length(V.sub(result!.point, a1)),
          V.length(V.sub(result!.point, b1))
        )
        expect(distanceToLine(a1, a2, result!.point) / scale).toBeLessThan(1e-6)
        expect(distanceToLine(b1, b2, result!.point) / scale).toBeLessThan(1e-6)
      })
    )
  })

  it("never returns a non-finite crossing", () => {
    fc.assert(
      fc.property(distinctPoints, distinctPoints, ([a1, a2], [b1, b2]) => {
        const result = infiniteLineIntersection(a1, a2, b1, b2)
        if (!result) return
        expect(Number.isFinite(result.point.x)).toBe(true)
        expect(Number.isFinite(result.point.y)).toBe(true)
      })
    )
  })
})

describe("segmentSegmentIntersection", () => {
  it("finds a crossing inside both segments", () => {
    expect(
      segmentSegmentIntersection(p(-5, 0), p(5, 0), p(0, -5), p(0, 5))
    ).toBeCloseToPoint(ORIGIN)
  })

  it("returns null when the segments only meet once extended", () => {
    expect(
      segmentSegmentIntersection(p(0, 0), p(10, 0), p(50, -5), p(50, 5))
    ).toBeNull()
  })

  it("returns null for collinear segments", () => {
    // Overlapping collinear segments have no single intersection point; the
    // snapping providers rely on this to avoid spurious self-intersections.
    expect(
      segmentSegmentIntersection(p(0, 0), p(10, 0), p(5, 0), p(20, 0))
    ).toBeNull()
  })
})

describe("capParallelLines", () => {
  it("caps from the first line's end nearer the pick, moving the second's end there", () => {
    const left = capParallelLines(
      p(0, 0),
      p(100, 0),
      p(30, 10),
      p(150, 10),
      p(20, 0)
    )
    expect(left).toMatchObject({ moved: "start", radius: 5 })
    if (!left || typeof left === "string") throw new Error("no cap")
    expect(left.end).toBeCloseToPoint(p(0, 0))
    expect(left.across).toBeCloseToPoint(p(0, 10))
    expect(left.startAngle).toBeCloseTo(Math.PI / 2)
    expect(normalizeAngle(left.endAngle)).toBeCloseTo((3 * Math.PI) / 2)
    const right = capParallelLines(
      p(0, 10),
      p(100, 10),
      p(0, 0),
      p(150, 0),
      p(90, 10)
    )
    if (!right || typeof right === "string") throw new Error("no cap")
    expect(right.moved).toBe("end")
    expect(right.center).toBeCloseToPoint(p(100, 5))
    expect(normalizeAngle(right.startAngle)).toBeCloseTo((3 * Math.PI) / 2)
    expect(right.endAngle).toBeCloseTo(Math.PI / 2)
  })

  it("takes the end point on a tie", () => {
    const tie = capParallelLines(
      p(0, 0),
      p(100, 0),
      p(0, 10),
      p(100, 10),
      p(50, 0)
    )
    expect(tie).toMatchObject({ end: p(100, 0) })
  })

  it("tells collinear, turned back and not parallel apart", () => {
    expect(
      capParallelLines(p(0, 0), p(100, 0), p(120, 0), p(200, 0), p(80, 0))
    ).toBe("collinear")
    expect(
      capParallelLines(p(0, 0), p(100, 0), p(120, 10), p(200, 10), p(80, 0))
    ).toBe("turnsBack")
    expect(
      capParallelLines(p(0, 0), p(100, 0), p(0, 10), p(100, 20), p(80, 0))
    ).toBeNull()
    expect(
      capParallelLines(p(0, 0), p(0, 0), p(0, 10), p(100, 10), p(0, 0))
    ).toBeNull()
  })
})

describe("filletLines", () => {
  const horizontal = [p(-50, 0), p(200, 0)] as const
  const vertical = [p(0, -50), p(0, 200)] as const

  it("rounds the corner selected by the two picks", () => {
    const result = filletLines(
      horizontal[0],
      horizontal[1],
      vertical[0],
      vertical[1],
      p(100, 0),
      p(0, 100),
      50
    )
    expect(result).not.toBeNull()
    expect(result!.corner).toBeCloseToPoint(ORIGIN)
    expect(result!.center).toBeCloseToPoint(p(50, 50))
    expect(result!.tangent1).toBeCloseToPoint(p(50, 0))
    expect(result!.tangent2).toBeCloseToPoint(p(0, 50))
    // CCW start→end, and the minor arc: π → −π/2 sweeps a quarter turn.
    expect(result!.startAngle).toBeCloseToAngle(Math.PI)
    expect(result!.endAngle).toBeCloseToAngle(-Math.PI / 2)
    expect(normalizeAngle(result!.endAngle - result!.startAngle)).toBeCloseTo(
      Math.PI / 2
    )
  })

  it("rounds the opposite corner when the picks move", () => {
    const result = filletLines(
      horizontal[0],
      horizontal[1],
      vertical[0],
      vertical[1],
      p(-20, 0),
      p(0, 100),
      50
    )
    expect(result!.center).toBeCloseToPoint(p(-50, 50))
    expect(result!.tangent1).toBeCloseToPoint(p(-50, 0))
  })

  it("collapses to a plain corner join at radius 0", () => {
    const result = filletLines(
      horizontal[0],
      horizontal[1],
      vertical[0],
      vertical[1],
      p(100, 0),
      p(0, 100),
      0
    )
    expect(result!.radius).toBe(0)
    expect(result!.center).toBeCloseToPoint(ORIGIN)
    expect(result!.tangent1).toBeCloseToPoint(ORIGIN)
    expect(result!.tangent2).toBeCloseToPoint(ORIGIN)
  })

  it("returns null for parallel lines", () => {
    expect(
      filletLines(p(0, 0), p(10, 0), p(0, 5), p(10, 5), p(5, 0), p(5, 5), 2)
    ).toBeNull()
  })

  it("returns null when the picked rays are collinear", () => {
    // Same line picked twice on opposite sides: no wedge to inscribe an arc in.
    expect(
      filletLines(
        p(-10, 0),
        p(10, 0),
        p(-10, 1e-12),
        p(10, 1e-12),
        p(5, 0),
        p(-5, 0),
        2
      )
    ).toBeNull()
  })

  it("keeps the arc tangent to both lines", () => {
    fc.assert(
      fc.property(fc.tuple(angle, angle, positiveLength), (input) => {
        const [angleA, spread, radius] = input
        // Two lines through the origin with a guaranteed non-degenerate wedge.
        const angleB = angleA + Math.PI / 6 + (spread % (Math.PI / 2))
        const a2 = polarPoint(ORIGIN, 100, angleA)
        const b2 = polarPoint(ORIGIN, 100, angleB)
        const result = filletLines(
          ORIGIN,
          a2,
          ORIGIN,
          b2,
          a2,
          b2,
          Math.min(radius, 50)
        )
        fc.pre(result !== null)

        const effectiveRadius = Math.min(radius, 50)
        // Tangency: the centre sits exactly `radius` from each line, and each
        // tangent point is exactly `radius` from the centre.
        expect(distanceToLine(ORIGIN, a2, result!.center)).toBeCloseTo(
          effectiveRadius,
          5
        )
        expect(distanceToLine(ORIGIN, b2, result!.center)).toBeCloseTo(
          effectiveRadius,
          5
        )
        expect(V.distance(result!.center, result!.tangent1)).toBeCloseTo(
          effectiveRadius,
          5
        )
        expect(V.distance(result!.center, result!.tangent2)).toBeCloseTo(
          effectiveRadius,
          5
        )
        // The rounded corner is always the minor arc.
        expect(
          normalizeAngle(result!.endAngle - result!.startAngle)
        ).toBeLessThanOrEqual(Math.PI + 1e-9)
      })
    )
  })
})

describe("chamferLines", () => {
  it("cuts each line at its own distance from the corner", () => {
    const result = chamferLines(
      p(-100, -200),
      p(100, -200),
      p(-200, -100),
      p(-200, 100),
      p(-100, -200),
      p(-200, -100),
      40,
      60
    )
    expect(result!.corner).toBeCloseToPoint(p(-200, -200))
    expect(result!.point1).toBeCloseToPoint(p(-160, -200))
    expect(result!.point2).toBeCloseToPoint(p(-200, -140))
  })

  it("collapses to the corner when both distances are zero", () => {
    const result = chamferLines(
      p(-50, 0),
      p(200, 0),
      p(0, -50),
      p(0, 200),
      p(100, 0),
      p(0, 100),
      0,
      0
    )
    expect(result!.point1).toBeCloseToPoint(ORIGIN)
    expect(result!.point2).toBeCloseToPoint(ORIGIN)
  })

  it("returns null for parallel lines", () => {
    expect(
      chamferLines(p(0, 0), p(10, 0), p(0, 5), p(10, 5), p(5, 0), p(5, 5), 1, 1)
    ).toBeNull()
  })
})

describe("circleCircleIntersection", () => {
  it("finds both crossings of two overlapping circles", () => {
    const points = circleCircleIntersection(ORIGIN, 5, p(8, 0), 5)
    expect(points).toHaveLength(2)
    expect(points.map((q) => q.y).sort((a, b) => a - b)).toEqual([-3, 3])
    for (const q of points) expect(q.x).toBeCloseTo(4)
  })

  it("returns a single point for tangent circles", () => {
    const points = circleCircleIntersection(ORIGIN, 5, p(10, 0), 5)
    expect(points).toHaveLength(1)
    expect(points[0]).toBeCloseToPoint(p(5, 0))
  })

  it("returns nothing when the circles cannot meet", () => {
    expect(circleCircleIntersection(ORIGIN, 1, p(50, 0), 1)).toEqual([])
    expect(circleCircleIntersection(ORIGIN, 10, p(1, 0), 2)).toEqual([])
    expect(circleCircleIntersection(ORIGIN, 5, ORIGIN, 5)).toEqual([])
  })

  it("returns points that lie on both circles", () => {
    fc.assert(
      fc.property(
        point,
        positiveLength,
        point,
        positiveLength,
        (c0, r0, c1, r1) => {
          for (const q of circleCircleIntersection(c0, r0, c1, r1)) {
            expect(V.distance(c0, q)).toBeCloseTo(r0, 4)
            expect(V.distance(c1, q)).toBeCloseTo(r1, 4)
          }
        }
      )
    )
  })
})

describe("circlesTangentToBoth", () => {
  const xAxis: TangentTarget = { kind: "line", a: p(-1, 0), b: p(1, 0) }
  const yAxis: TangentTarget = { kind: "line", a: p(0, -1), b: p(0, 1) }

  it("finds the four circles in the corners of two crossing lines", () => {
    const centres = circlesTangentToBoth(xAxis, yAxis, 2).map((c) => c.center)
    expect(centres).toHaveLength(4)
    for (const centre of centres) {
      expect(Math.abs(centre.x)).toBeCloseTo(2)
      expect(Math.abs(centre.y)).toBeCloseTo(2)
    }
  })

  it("touches a circle from outside and from inside", () => {
    const circle: TangentTarget = { kind: "circle", center: ORIGIN, radius: 5 }
    const line: TangentTarget = { kind: "line", a: p(-9, 0), b: p(9, 0) }
    const fits = circlesTangentToBoth(circle, line, 1)
    const touching = fits.filter((fit) => fit.center.x > 0 && fit.center.y > 0)
    expect(touching.map((fit) => fit.center.x).sort()).toEqual([
      expect.closeTo(Math.sqrt(15), 9),
      expect.closeTo(Math.sqrt(35), 9),
    ])
  })

  it("finds none between parallels further apart than the diameter", () => {
    const above: TangentTarget = { kind: "line", a: p(-1, 10), b: p(1, 10) }
    expect(circlesTangentToBoth(xAxis, above, 2)).toEqual([])
  })

  it("returns circles at the radius from both, touching each", () => {
    const target = fc.oneof(
      fc
        .tuple(point, point)
        .filter(([a, b]) => V.distance(a, b) > 1e-3)
        .map(([a, b]): TangentTarget => ({ kind: "line", a, b })),
      fc
        .tuple(point, positiveLength)
        .map(([center, radius]): TangentTarget => ({
          kind: "circle",
          center,
          radius,
        }))
    )
    const gap = (t: TangentTarget, q: typeof ORIGIN) =>
      t.kind === "line"
        ? closestPointOnInfiniteLine(t.a, t.b, q).distance
        : closestPointOnCircle(t.center, t.radius, q).distance
    fc.assert(
      fc.property(target, target, positiveLength, (first, second, r) => {
        for (const fit of circlesTangentToBoth(first, second, r)) {
          expect(V.distance(fit.center, fit.touchFirst)).toBeCloseTo(r, 3)
          expect(V.distance(fit.center, fit.touchSecond)).toBeCloseTo(r, 3)
          expect(gap(first, fit.touchFirst)).toBeCloseTo(0, 3)
          expect(gap(second, fit.touchSecond)).toBeCloseTo(0, 3)
        }
      })
    )
  })
})

/**
 * CIRCLE's tangent constructions against AutoCAD 2027's console (probes
 * circle/p01–p10, p330–p337, p370–p379). Setup of most: circle A (0,0) r10,
 * circle B (40,0) r10, line L (−20,−15)–(60,−15).
 */
const A: TangentTarget = { kind: "circle", center: p(0, 0), radius: 10 }
const B: TangentTarget = { kind: "circle", center: p(40, 0), radius: 10 }
const L: TangentTarget = { kind: "line", a: p(-20, -15), b: p(60, -15) }
const ON_L: CircleConstraint = {
  kind: "centerOn",
  a: p(-20, -15),
  b: p(60, -15),
}
const at = (x: number, y: number): CircleConstraint => ({
  kind: "point",
  point: p(x, y),
})

/** The constraints' circle AutoCAD draws for these picks (CIRCLE-D30). */
function chosen(
  constraints: [CircleConstraint, CircleConstraint, CircleConstraint],
  picks: readonly Vec2Like[]
) {
  return nearestToPicks(
    circlesMeetingThree(constraints),
    picks,
    (fit) => fit.touches
  )
}

describe("circlesMeetingThree", () => {
  const C: TangentTarget = { kind: "circle", center: p(20, 30), radius: 10 }
  const T1: TangentTarget = { kind: "line", a: p(-40, 0), b: p(100, 0) }
  const T2: TangentTarget = { kind: "line", a: p(-15, -20), b: p(45, 60) }
  const T3: TangentTarget = { kind: "line", a: p(75, -20), b: p(15, 60) }
  const s = Math.SQRT1_2 * 10

  it("draws AutoCAD's Tan, Tan, Tan circle for the picks", () => {
    const cases: [
      string,
      [CircleConstraint, CircleConstraint, CircleConstraint],
      Vec2Like[],
      [number, number, number],
    ][] = [
      ["p01", [A, B, L], [p(0, 10), p(40, 10), p(20, -15)], [20, -4.5, 10.5]],
      [
        "p330a",
        [A, B, L],
        [p(0, -10), p(40, -10), p(20, -15)],
        [20, 37.5, 52.5],
      ],
      [
        "p330d",
        [A, B, L],
        [p(-10, 0), p(30, 0), p(20, -15)],
        [9.364916731, 6.2701665379, 21.2701665379],
      ],
      [
        "p331a",
        [A, B, L],
        [p(0, 10), p(40, 10), p(-15, -15)],
        [-29.364916731, 83.7298334621, 98.7298334621],
      ],
      ["p331c", [L, A, B], [p(20, -15), p(0, 10), p(40, 10)], [20, -4.5, 10.5]],
      [
        "p331d",
        [A, B, L],
        [p(-s, s), p(40 + s, s), p(20, -15)],
        [20, 37.5, 52.5],
      ],
      ["p332a", [T1, T2, T3], [p(30, 0), p(15, 20), p(45, 20)], [30, 15, 15]],
      [
        "p332b",
        [T1, T2, T3],
        [p(-20, 0), p(-9, -12), p(45, 20)],
        [-20, 40, 40],
      ],
      [
        "p333a",
        [A, B, C],
        [p(8.9442719, 4.472136), p(31.0557281, 4.472136), p(20, 20)],
        [20, 8.3333333333, 11.6666666667],
      ],
      [
        "p333b",
        [A, B, C],
        [p(-8.9442719, -4.472136), p(48.9442719, -4.472136), p(20, 40)],
        [20, 8.3333333333, 31.6666666667],
      ],
      ["p333c", [A, B, C], [p(0, 10), p(40, 10), p(20, 20)], [20, -15, 35]],
    ]
    for (const [probe, constraints, picks, [x, y, r]] of cases) {
      const circle = chosen(constraints, picks)
      expect(circle?.center, probe).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius, probe).toBeCloseTo(r, 6)
    }
  })

  it("takes points and a centre on a line among the three", () => {
    const cases: [
      string,
      [CircleConstraint, CircleConstraint, CircleConstraint],
      Vec2Like[],
      [number, number, number],
    ][] = [
      [
        "p03",
        [A, at(60, 20), at(70, 0)],
        [p(0, 10), p(60, 20), p(70, 0)],
        [29.882351152901, -7.558824423549, 40.82354192969],
      ],
      [
        "p337a",
        [A, at(60, 20), at(70, 0)],
        [p(0, -10), p(60, 20), p(70, 0)],
        [40.0129368052, -2.4935315974, 30.0905576365],
      ],
      [
        "p04",
        [at(20, 20), at(25, 25), B],
        [p(20, 20), p(25, 25), p(40, 10)],
        [28.840374726443, 16.159625273557, 9.638501094228],
      ],
      [
        "p336a",
        [A, B, at(20, 30)],
        [p(0, 10), p(40, 10), p(20, 30)],
        [20, 15, 15],
      ],
      [
        "p336c",
        [at(20, 30), A, B],
        [p(20, 30), p(0, 10), p(40, 10)],
        [20, 15, 15],
      ],
      [
        "p337c",
        [at(20, 20), at(25, 25), ON_L],
        [p(20, 20), p(25, 25), p(20, -15)],
        [60, -15, 53.1507290637],
      ],
      [
        "p337d",
        [ON_L, at(0, 20), at(40, 20)],
        [p(20, -15), p(0, 20), p(40, 20)],
        [20, -15, 40.3112887415],
      ],
      [
        "p337e",
        [A, ON_L, at(20, 30)],
        [p(0, 10), p(20, -15), p(20, 30)],
        [33.9444872454, -15, 47.1110255093],
      ],
      ["p10", [ON_L, A, B], [p(20, -15), p(0, 10), p(40, 10)], [20, -15, 35]],
      [
        "p371",
        [L, at(60, 20), at(70, 20)],
        [p(20, -15), p(60, 20), p(70, 20)],
        [65, 2.8571428571, 17.8571428571],
      ],
    ]
    for (const [probe, constraints, picks, [x, y, r]] of cases) {
      const circle = chosen(constraints, picks)
      expect(circle?.center, probe).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius, probe).toBeCloseTo(r, 6)
    }
  })

  it("finds the eight circles of three apart, the four of a triangle", () => {
    expect(circlesMeetingThree([A, B, C])).toHaveLength(8)
    expect(circlesMeetingThree([T1, T2, T3])).toHaveLength(4)
    expect(circlesMeetingThree([A, B, L])).toHaveLength(6)
  })

  it("is the circumscribed circle of three points, none on one line", () => {
    const [circle] = circlesMeetingThree([at(100, 0), at(0, 100), at(-100, 0)])
    expect(circle.center).toBeCloseToPoint(ORIGIN)
    expect(circle.radius).toBeCloseTo(100)
    expect(circlesMeetingThree([at(0, 0), at(1, 0), at(2, 0)])).toEqual([])
  })

  it("finds none touching three parallels", () => {
    const parallel = (y: number): TangentTarget => ({
      kind: "line",
      a: p(0, y),
      b: p(1, y),
    })
    expect(
      circlesMeetingThree([parallel(0), parallel(10), parallel(30)])
    ).toEqual([])
  })

  it("returns circles meeting every constraint where they say", () => {
    const constraint: fc.Arbitrary<CircleConstraint> = fc.oneof(
      point.map((q): CircleConstraint => ({ kind: "point", point: q })),
      fc
        .tuple(point, point)
        .filter(([a, b]) => V.distance(a, b) > 1)
        .map(([a, b]): CircleConstraint => ({ kind: "line", a, b })),
      fc
        .tuple(point, positiveLength)
        .map(([center, radius]): CircleConstraint => ({
          kind: "circle",
          center,
          radius,
        })),
      fc
        .tuple(point, point)
        .filter(([a, b]) => V.distance(a, b) > 1)
        .map(([a, b]): CircleConstraint => ({ kind: "centerOn", a, b }))
    )
    const meets = (
      c: CircleConstraint,
      fit: { center: Vec2Like; radius: number },
      touch: Vec2Like
    ): void => {
      const size = Math.max(1, fit.radius, V.length(fit.center))
      const near = (value: number) =>
        expect(Math.abs(value) / size).toBeLessThan(1e-6)
      switch (c.kind) {
        case "point":
          near(V.distance(fit.center, c.point) - fit.radius)
          near(V.distance(touch, c.point))
          return
        case "line":
          near(distanceToLine(c.a, c.b, fit.center) - fit.radius)
          near(distanceToLine(c.a, c.b, touch))
          near(V.distance(fit.center, touch) - fit.radius)
          return
        case "circle": {
          const apart = V.distance(fit.center, c.center)
          near(
            Math.min(
              Math.abs(apart - (c.radius + fit.radius)),
              Math.abs(apart - Math.abs(c.radius - fit.radius))
            )
          )
          near(V.distance(touch, c.center) - c.radius)
          near(V.distance(fit.center, touch) - fit.radius)
          return
        }
        case "centerOn":
          near(distanceToLine(c.a, c.b, fit.center))
          return
      }
    }
    fc.assert(
      fc.property(constraint, constraint, constraint, (a, b, c) => {
        for (const fit of circlesMeetingThree([a, b, c])) {
          expect(fit.radius).toBeGreaterThan(0)
          ;[a, b, c].forEach((each, i) => meets(each, fit, fit.touches[i]))
        }
      })
    )
  })
})

describe("nearestToPicks", () => {
  it("takes the least sum of squared distances, as Ttr in AutoCAD", () => {
    // probes circle/p378c, p379b, p379c: overlapping circles (0,0) r10 and
    // (15,0) r10, where the plain sum of distances chooses another circle.
    const left: TangentTarget = { kind: "circle", center: p(0, 0), radius: 10 }
    const right: TangentTarget = {
      kind: "circle",
      center: p(15, 0),
      radius: 10,
    }
    const ttr = (first: Vec2Like, second: Vec2Like, r: number) =>
      nearestToPicks(
        circlesTangentToBoth(left, right, r),
        [first, second],
        (fit) => [fit.touchFirst, fit.touchSecond]
      )?.center
    expect(ttr(p(9.6824584, 2.5), p(25, 0), 2)).toBeCloseToPoint(
      p(10.1666666667, 6.374863833),
      6
    )
    expect(ttr(p(-8.6602540378, 5), p(6.3397459622, -5), 3)).toBeCloseToPoint(
      p(3.5, 6.0621778265),
      6
    )
    expect(
      ttr(p(8.6602540378, -5), p(5.3407417371, -2.588190451), 6)
    ).toBeCloseToPoint(p(7.5, -14.1332940251), 6)
  })

  it("is null with nothing to choose", () => {
    expect(nearestToPicks([], [ORIGIN], () => [ORIGIN])).toBeNull()
  })
})

describe("circleOnDiameter", () => {
  const end = (constraint: CircleConstraint, pick: Vec2Like) => ({
    constraint,
    pick,
  })
  const s = Math.SQRT1_2 * 10

  it("ends each diameter where the line of the centres crosses its circle", () => {
    // probes circle/p334a–d: of the two crossings, the one nearer the pick.
    const cases: [Vec2Like, Vec2Like, [number, number, number]][] = [
      [p(-s, s), p(40 - s, s), [10, 0, 20]],
      [p(s, s), p(40 + s, s), [30, 0, 20]],
      [p(s, s), p(40 - s, s), [20, 0, 10]],
      [p(-s, s), p(40 + s, s), [20, 0, 30]],
    ]
    for (const [first, second, [x, y, r]] of cases) {
      const circle = circleOnDiameter(end(A, first), end(B, second))
      expect(circle?.center).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius).toBeCloseTo(r, 6)
    }
  })

  it("turns counter-clockwise from the pick between two crossings as near", () => {
    // probes circle/p02, p334e, p334f: picks square to the line of centres.
    const cases: [
      CircleConstraint,
      Vec2Like,
      CircleConstraint,
      Vec2Like,
      [number, number, number],
    ][] = [
      [A, p(0, 10), B, p(40, 10), [10, 0, 20]],
      [A, p(0, -10), B, p(40, -10), [30, 0, 20]],
      [B, p(40, 10), A, p(0, 10), [10, 0, 20]],
    ]
    for (const [first, a, second, b, [x, y, r]] of cases) {
      const circle = circleOnDiameter(end(first, a), end(second, b))
      expect(circle?.center).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius).toBeCloseTo(r, 6)
    }
  })

  it("ends on a line at the foot from the other end's centre", () => {
    // probes circle/p374a, p374b, p370.
    const cases: [
      CircleConstraint,
      Vec2Like,
      CircleConstraint,
      Vec2Like,
      [number, number, number],
    ][] = [
      [L, p(20, -15), A, p(0, -10), [0, -12.5, 2.5]],
      [L, p(20, -15), A, p(0, 10), [0, -2.5, 12.5]],
      [A, p(0, 10), L, p(20, -15), [0, -2.5, 12.5]],
      [L, p(20, -15), at(60, 20), p(60, 20), [60, 2.5, 17.5]],
    ]
    for (const [first, a, second, b, [x, y, r]] of cases) {
      const circle = circleOnDiameter(end(first, a), end(second, b))
      expect(circle?.center).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius).toBeCloseTo(r, 6)
    }
  })

  it("ends on a circle toward or away from a point, nearer the pick", () => {
    // probes circle/p08, p09, p335c.
    const cases: [
      CircleConstraint,
      Vec2Like,
      CircleConstraint,
      Vec2Like,
      [number, number, number],
    ][] = [
      [
        A,
        p(0, 10),
        at(60, 20),
        p(60, 20),
        [34.743416490253, 11.581138830084, 26.622776601684],
      ],
      [
        at(20, 20),
        p(20, 20),
        B,
        p(40, 10),
        [26.464466094067, 13.535533905933, 9.142135623731],
      ],
      [
        at(60, 20),
        p(60, 20),
        A,
        p(0, -10),
        [25.2565835097, 8.4188611699, 36.6227766017],
      ],
    ]
    for (const [first, a, second, b, [x, y, r]] of cases) {
      const circle = circleOnDiameter(end(first, a), end(second, b))
      expect(circle?.center).toBeCloseToPoint(p(x, y), 6)
      expect(circle?.radius).toBeCloseTo(r, 6)
    }
  })

  it("is null for two lines, concentric circles or one point twice", () => {
    expect(circleOnDiameter(end(L, ORIGIN), end(L, ORIGIN))).toBeNull()
    expect(
      circleOnDiameter(
        end(A, p(10, 0)),
        end({ kind: "circle", center: ORIGIN, radius: 5 }, p(5, 0))
      )
    ).toBeNull()
    expect(
      circleOnDiameter(end(at(1, 1), ORIGIN), end(at(1, 1), ORIGIN))
    ).toBeNull()
  })
})

describe("circleFrom3Points", () => {
  it("circumscribes three points", () => {
    const circle = circleFrom3Points(p(100, 0), p(0, 100), p(-100, 0))
    expect(circle!.center).toBeCloseToPoint(ORIGIN)
    expect(circle!.radius).toBeCloseTo(100)
  })

  it("returns null for collinear points", () => {
    expect(circleFrom3Points(p(0, 0), p(1, 0), p(2, 0))).toBeNull()
  })

  it("passes through all three points", () => {
    fc.assert(
      fc.property(nonCollinearPoints, ([a, b, c]) => {
        const circle = circleFrom3Points(a, b, c)
        fc.pre(circle !== null)
        for (const q of [a, b, c]) {
          expect(V.distance(circle!.center, q)).toBeCloseTo(circle!.radius, 4)
        }
      })
    )
  })
})

describe("polarPoint", () => {
  it("walks the cardinal directions", () => {
    expect(polarPoint(ORIGIN, 10, 0)).toBeCloseToPoint(p(10, 0))
    expect(polarPoint(ORIGIN, 10, deg(90))).toBeCloseToPoint(p(0, 10))
    expect(polarPoint(ORIGIN, 10, deg(180))).toBeCloseToPoint(p(-10, 0))
  })

  it("inverts closestPointOnCircle's angle", () => {
    fc.assert(
      fc.property(point, positiveLength, angle, (center, radius, theta) => {
        const q = polarPoint(center, radius, theta)
        expect(V.distance(center, q)).toBeCloseTo(radius, 6)
        expect(closestPointOnCircle(center, radius, q).t).toBeCloseToAngle(
          theta,
          5
        )
      })
    )
  })
})

describe("bulge conversion", () => {
  it("treats a bulge of 1 as a semicircle below the chord", () => {
    const arc = bulgeToArc(p(0, 0), p(100, 0), 1)
    expect(arc.center).toBeCloseToPoint(p(50, 0))
    expect(arc.radius).toBeCloseTo(50)
    // CCW from π to 0 sweeps through 3π/2, i.e. under the chord.
    expect(arc.startAngle).toBeCloseToAngle(Math.PI)
    expect(arc.endAngle).toBeCloseToAngle(0)
  })

  it("mirrors the arc when the bulge is negated", () => {
    const negative = bulgeToArc(p(0, 0), p(100, 0), -1)
    expect(negative.center).toBeCloseToPoint(p(50, 0))
    expect(negative.startAngle).toBeCloseToAngle(0)
    expect(negative.endAngle).toBeCloseToAngle(Math.PI)
  })

  it("encodes a quarter turn as tan(θ/4)", () => {
    const arc = bulgeToArc(p(0, 0), p(100, 100), Math.tan(Math.PI / 8))
    expect(arc.radius).toBeCloseTo(100, 4)
  })

  it("requires a non-zero bulge — straight segments never reach it", () => {
    // Documents the precondition: polylineSegmentGeometries filters zero bulges
    // out, and the formula divides by the bulge.
    const arc = bulgeToArc(p(0, 0), p(100, 0), 0)
    expect(Number.isFinite(arc.radius)).toBe(false)
  })

  it("round-trips through the arc's midpoint", () => {
    fc.assert(
      fc.property(distinctPoints, bulge, ([p0, p1], b) => {
        fc.pre(Math.abs(b) > 1e-3)
        const arc = bulgeToArc(p0, p1, b)
        const sweep = normalizeAngle(arc.endAngle - arc.startAngle)
        const middle = polarPoint(
          arc.center,
          arc.radius,
          arc.startAngle + sweep / 2
        )
        expect(bulgeThroughPoint(p0, p1, middle)).toBeCloseTo(b, 5)
      })
    )
  })

  it("puts both chord ends on the resulting circle", () => {
    fc.assert(
      fc.property(distinctPoints, bulge, ([p0, p1], b) => {
        fc.pre(Math.abs(b) > 1e-3)
        const arc = bulgeToArc(p0, p1, b)
        expect(V.distance(arc.center, p0)).toBeCloseTo(arc.radius, 4)
        expect(V.distance(arc.center, p1)).toBeCloseTo(arc.radius, 4)
      })
    )
  })

  it("reports a zero bulge for a degenerate chord", () => {
    expect(bulgeThroughPoint(p(5, 5), p(5, 5), p(9, 9))).toBe(0)
  })
})

describe("normalizeAngle", () => {
  it("maps into [0, 2π)", () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2)
    expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0)
    expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI)
  })

  it("keeps a vanishingly small negative angle inside the range", () => {
    // `r + 2π` cannot represent 2π minus a denormal, so the naive form lands on
    // exactly 2π — outside the half-open range every caller assumes.
    expect(normalizeAngle(-Number.MIN_VALUE)).toBe(0)
    expect(normalizeAngle(-1e-18)).toBeLessThan(2 * Math.PI)
  })

  it("stays in range and differs by whole turns", () => {
    fc.assert(
      fc.property(fc.double({ min: -100, max: 100, noNaN: true }), (theta) => {
        const normalized = normalizeAngle(theta)
        expect(normalized).toBeGreaterThanOrEqual(0)
        expect(normalized).toBeLessThan(2 * Math.PI)
        const turns = (theta - normalized) / (2 * Math.PI)
        expect(turns).toBeCloseTo(Math.round(turns), 6)
      })
    )
  })
})

describe("angleWithinSweep", () => {
  it("covers the counter-clockwise span only", () => {
    expect(angleWithinSweep(0, Math.PI, Math.PI / 2)).toBe(true)
    expect(angleWithinSweep(0, Math.PI, (3 * Math.PI) / 2)).toBe(false)
  })

  it("handles a sweep that wraps past zero", () => {
    expect(angleWithinSweep(deg(270), deg(90), 0)).toBe(true)
    expect(angleWithinSweep(deg(270), deg(90), deg(180))).toBe(false)
  })

  it("treats a zero sweep as a full circle", () => {
    // An arc whose ends coincide is a circle; every angle is inside it.
    expect(angleWithinSweep(1, 1, 5)).toBe(true)
  })
})

describe("closestPointOnArc", () => {
  it("uses the perpendicular foot when it falls inside the sweep", () => {
    const result = closestPointOnArc(ORIGIN, 100, 0, Math.PI, p(0, 200))
    expect(result.point).toBeCloseToPoint(p(0, 100))
  })

  it("falls back to the nearer endpoint outside the sweep", () => {
    const result = closestPointOnArc(ORIGIN, 100, 0, Math.PI, p(50, -200))
    expect(result.point).toBeCloseToPoint(p(100, 0))
    expect(result.t).toBeCloseToAngle(0)
  })
})

describe("arcFrom3Points", () => {
  it("sweeps counter-clockwise through the middle point", () => {
    const arc = arcFrom3Points(p(100, 0), p(0, 100), p(-100, 0))
    expect(arc!.center).toBeCloseToPoint(ORIGIN)
    expect(arc!.radius).toBeCloseTo(100)
    expect(arc!.startAngle).toBeCloseToAngle(0)
    expect(arc!.endAngle).toBeCloseToAngle(Math.PI)
  })

  it("swaps the ends when the natural order runs clockwise", () => {
    const arc = arcFrom3Points(p(100, 0), p(0, -100), p(-100, 0))
    expect(arc!.startAngle).toBeCloseToAngle(Math.PI)
    expect(arc!.endAngle).toBeCloseToAngle(0)
  })

  it("returns null for collinear points", () => {
    expect(arcFrom3Points(p(0, 0), p(5, 5), p(10, 10))).toBeNull()
  })

  it("always contains the middle point in its sweep", () => {
    fc.assert(
      fc.property(nonCollinearPoints, ([a, b, c]) => {
        const arc = arcFrom3Points(a, b, c)
        fc.pre(arc !== null)
        const angleOf = (q: Vec2Like) =>
          Math.atan2(q.y - arc!.center.y, q.x - arc!.center.x)
        expect(
          angleWithinSweep(arc!.startAngle, arc!.endAngle, angleOf(b))
        ).toBe(true)
      })
    )
  })
})

describe("tangentPointsFromPoint", () => {
  it("finds both tangents from outside the circle", () => {
    const points = tangentPointsFromPoint(p(2, 0), ORIGIN, 1)
    expect(points).toHaveLength(2)
    for (const q of points) {
      expect(V.length(q)).toBeCloseTo(1)
      expect(Math.abs(q.y)).toBeCloseTo(Math.sqrt(3) / 2)
    }
  })

  it("has no tangent from on or inside the circle", () => {
    expect(tangentPointsFromPoint(p(1, 0), ORIGIN, 1)).toEqual([])
    expect(tangentPointsFromPoint(ORIGIN, ORIGIN, 1)).toEqual([])
  })

  it("meets the radius at a right angle", () => {
    fc.assert(
      fc.property(point, positiveLength, angle, (center, radius, theta) => {
        const from = polarPoint(center, radius * 3, theta)
        for (const q of tangentPointsFromPoint(from, center, radius)) {
          const radial = V.sub(q, center)
          const toPoint = V.sub(from, q)
          expect(V.dot(V.normalize(radial), V.normalize(toPoint))).toBeCloseTo(
            0,
            5
          )
        }
      })
    )
  })
})

describe("segmentCircleIntersection", () => {
  it("finds the crossings inside the segment", () => {
    const points = segmentCircleIntersection(
      p(-200, 50),
      p(200, 50),
      ORIGIN,
      100
    )
    expect(points).toHaveLength(2)
    for (const q of points) {
      expect(q.y).toBeCloseTo(50)
      expect(Math.abs(q.x)).toBeCloseTo(Math.sqrt(100 * 100 - 50 * 50))
    }
  })

  it("ignores crossings beyond the segment's ends", () => {
    expect(
      segmentCircleIntersection(p(-200, 0), p(-150, 0), ORIGIN, 100)
    ).toEqual([])
  })

  it("returns nothing when the line misses the circle", () => {
    expect(
      segmentCircleIntersection(p(-200, 500), p(200, 500), ORIGIN, 100)
    ).toEqual([])
  })

  it("returns points on both the circle and the segment", () => {
    fc.assert(
      fc.property(
        distinctPoints,
        point,
        positiveLength,
        ([a, b], center, radius) => {
          for (const q of segmentCircleIntersection(a, b, center, radius)) {
            expect(V.distance(center, q)).toBeCloseTo(radius, 4)
            expect(closestPointOnSegment(a, b, q).distance).toBeLessThan(1e-6)
          }
        }
      )
    )
  })
})

describe("segmentArcIntersection", () => {
  it("keeps only the crossings inside the arc's sweep", () => {
    // A vertical line crosses the full circle twice, but the upper arc once.
    const full = segmentCircleIntersection(p(50, -200), p(50, 200), ORIGIN, 100)
    expect(full).toHaveLength(2)

    const onArc = segmentArcIntersection(
      p(50, -200),
      p(50, 200),
      ORIGIN,
      100,
      0,
      Math.PI
    )
    expect(onArc).toHaveLength(1)
    expect(onArc[0].y).toBeGreaterThan(0)
  })
})

describe("lineCircleIntersectionParams", () => {
  it("reports parameters past the segment's ends", () => {
    const params = lineCircleIntersectionParams(
      p(-200, 0),
      p(-150, 0),
      ORIGIN,
      100
    )
    expect(params).toHaveLength(2)
    // t = 1 is (-150,0); the circle is crossed at ±100, i.e. further along.
    expect(params.map((t) => -200 + t * 50).sort((a, b) => a - b)).toEqual([
      -100, 100,
    ])
  })

  it("returns a single parameter for a tangent line", () => {
    const params = lineCircleIntersectionParams(
      p(-200, 100),
      p(200, 100),
      ORIGIN,
      100
    )
    expect(params).toHaveLength(1)
  })

  it("returns nothing for a degenerate direction", () => {
    expect(lineCircleIntersectionParams(p(5, 5), p(5, 5), ORIGIN, 100)).toEqual(
      []
    )
  })
})

describe("rays", () => {
  it("intersects two rays", () => {
    const result = intersectRays(
      { origin: p(0, 0), dir: p(1, 0) },
      { origin: p(30, -10), dir: p(0, 1) }
    )
    expect(result).toBeCloseToPoint(p(30, 0))
  })

  it("returns null for parallel rays", () => {
    expect(
      intersectRays(
        { origin: p(0, 0), dir: p(1, 0) },
        { origin: p(0, 5), dir: p(1, 0) }
      )
    ).toBeNull()
  })

  it("projects a point perpendicularly onto a ray", () => {
    expect(
      projectPointOntoRay(p(30, 40), { origin: ORIGIN, dir: p(1, 0) })
    ).toBeCloseToPoint(p(30, 0))
  })

  it("keeps the projection on the ray", () => {
    fc.assert(
      fc.property(point, angle, point, (origin, theta, q) => {
        const ray = { origin, dir: polarPoint(ORIGIN, 1, theta) }
        const projected = projectPointOntoRay(q, ray)
        expect(V.cross(ray.dir, V.sub(projected, origin))).toBeCloseTo(0, 5)
        expect(V.dot(ray.dir, V.sub(q, projected))).toBeCloseTo(0, 5)
      })
    )
  })
})

describe("ellipse angle and parameter", () => {
  const ratio = fc.double({ min: 0.05, max: 1, noNaN: true })

  it("converts a parameter to the angle of its point, and back", () => {
    fc.assert(
      fc.property(ratio, angle, (r, t) => {
        const theta = ellipseAngleFromParam(r, t)
        // The point at parameter t lies on the ray leaving the centre at theta.
        const x = Math.cos(t)
        const y = r * Math.sin(t)
        expect(Math.atan2(y, x)).toBeCloseTo(theta, 9)
        expect(
          normalizeAngle(ellipseParamFromAngle(r, theta) - t + Math.PI)
        ).toBeCloseTo(Math.PI, 6)
      })
    )
  })

  it("agrees with the angle on the axes, where the two coincide", () => {
    expect(ellipseAngleFromParam(0.5, 0)).toBeCloseTo(0)
    expect(ellipseAngleFromParam(0.5, deg(90))).toBeCloseTo(deg(90))
    expect(ellipseAngleFromParam(0.5, deg(45))).toBeCloseTo(Math.atan(0.5))
  })
})

describe("tangentLinesOfCircles", () => {
  it("gives the two outer and the two crossing tangents of apart circles", () => {
    const lines = tangentLinesOfCircles(p(0, 0), 1, p(10, 0), 1)
    expect(lines).toHaveLength(4)
    const outer = lines.slice(0, 2).map(([a, b]) => [a.y, b.y].map(Math.round))
    expect(outer).toEqual(
      expect.arrayContaining([
        [1, 1],
        [-1, -1],
      ])
    )
    for (const [a, b] of lines) {
      const dir = V.normalize(V.sub(b, a))
      // Each touches both circles at a right angle to the radius.
      expect(V.dot(dir, a)).toBeCloseTo(0, 9)
      expect(V.dot(dir, V.sub(b, p(10, 0)))).toBeCloseTo(0, 9)
    }
  })

  it("keeps only the outer ones for overlapping circles", () => {
    expect(tangentLinesOfCircles(p(0, 0), 2, p(3, 0), 2)).toHaveLength(2)
  })

  it("gives none when one circle holds the other", () => {
    expect(tangentLinesOfCircles(p(0, 0), 5, p(1, 0), 1)).toEqual([])
  })
})

describe("signChanges", () => {
  it("bisects each sign change to full precision", () => {
    const roots = signChanges(Math.cos, 0, 2 * Math.PI, 7)
    expect(roots).toHaveLength(2)
    expect(roots[0]).toBeCloseTo(Math.PI / 2, 12)
    expect(roots[1]).toBeCloseTo((3 * Math.PI) / 2, 12)
  })

  it("takes a zero that falls on a sample, the last one too", () => {
    expect(signChanges((t) => t * (t - 1) * (t - 2), 0, 2, 4)).toEqual([
      0, 1, 2,
    ])
  })

  it("misses a touch that does not change sign", () => {
    expect(signChanges((t) => (t - 0.3) ** 2, 0, 1, 4)).toEqual([])
  })
})
