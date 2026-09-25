import fc from "fast-check"
import { describe, expect, it } from "vitest"
import { V } from "./Vec2"
import {
  angleWithinSweep,
  arcFrom3Points,
  bulgeThroughPoint,
  bulgeToArc,
  chamferLines,
  circleCircleIntersection,
  circleFrom3Points,
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
  normalizeAngle,
  offsetSegment,
  polarPoint,
  projectPointOntoRay,
  segmentArcIntersection,
  segmentCircleIntersection,
  segmentSegmentIntersection,
  tangentPointsFromPoint,
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
