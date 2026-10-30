import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { p } from "../../test/builders"
import { splineEntity } from "../../test/arbitraries"
import { type Vec2 } from "../geometry/Vec2"
import { bsplineDomain, bsplinePoint } from "../geometry/nurbs"
import {
  closestPointOnSpline,
  createSpline,
  isPeriodicSpline,
  splineArea,
  splineCurve,
  splineEndPoint,
  splineKnotParameterization,
  splineLength,
  splineMidpoint,
  splinePolyline,
  splineStartPoint,
  splineWithPoint,
  splineWithoutFitData,
} from "./splines"
import { rotateEntity, rotatePoint, scaleEntity } from "./entityTransforms"
import type { SplineEntity } from "./entityTypes"

// The knots, control points and weights AutoCAD 2027 leaves on a spline it
// trims, breaks or weighs, as MPDUMP read them (probes spline-knots/k01–k16).

const knots = (spline: SplineEntity) => spline.knotVector ?? []
const ROOT200 = Math.hypot(10, 10)

/** The four fit points every open fit spline of the probes was drawn through. */
const OPEN_FIT = createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)])
const CLOSED_FIT = createSpline(
  "fit",
  [p(0, 0), p(20, 0), p(20, 20), p(0, 20)],
  { closed: true }
)
const OPEN_CV = createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)])
const CLOSED_CV = createSpline(
  "cv",
  [p(30, 0), p(50, 0), p(50, 20), p(30, 20)],
  { closed: true }
)

/** Every point of `piece` lies on `whole`, to the probes' six decimals. */
function expectOnCurve(piece: SplineEntity, whole: SplineEntity) {
  for (const point of splinePolyline(piece)) {
    expect(closestPointOnSpline(whole, point).distance).toBeLessThan(2e-6)
  }
}

describe("a spline's own knots", () => {
  it("lose a fit spline's fit data onto AutoCAD's control points and knots", () => {
    // k09 (EXTEND reaching nothing) dumps the open one's, p311 the closed one's.
    const open = splineWithoutFitData(OPEN_FIT)
    expect(open).toMatchObject({ method: "cv", degree: 3, closed: false })
    expect(open.startTangent).toBeUndefined()
    expect(open.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(3.333333, 5.555556),
        p(10, 16.666667),
        p(20, -6.666667),
        p(26.666667, 4.444444),
        p(30, 10),
      ],
      6
    )
    expect(knots(open)).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      2 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
    ])
    const closed = splineWithoutFitData(CLOSED_FIT)
    expect(closed).toMatchObject({ method: "cv", degree: 3, closed: true })
    expect(isPeriodicSpline(closed)).toBe(true)
    expect(closed.points).toBeCloseToPoints(
      [p(25, 25), p(-5, 25), p(-5, -5), p(25, -5)],
      9
    )
    expect(knots(closed)).toEqual([0, 20, 40, 60, 80])
    for (const [whole, own] of [
      [OPEN_FIT, open],
      [CLOSED_FIT, closed],
    ]) {
      expect(splinePolyline(own)).toBeCloseToPoints(splinePolyline(whole), 9)
    }
  })

  it("make a CV spline's knots its own, 1 apart, its weights kept", () => {
    const weighed = createSpline("cv", CLOSED_CV.points, {
      closed: true,
      weights: [3, 1, 1, 1],
    })
    const own = splineWithoutFitData(weighed)
    expect(own.points).toEqual(weighed.points)
    expect(knots(own)).toEqual([0, 1, 2, 3, 4])
    expect(own.weights).toEqual([3, 1, 1, 1])
    expect(splinePolyline(own)).toBeCloseToPoints(splinePolyline(weighed), 12)
  })

  // What TRIM leaves: a CV spline on knots of its own, its parameters the
  // ones it had there, never normalised (desktop d01 lists it Method Control
  // Vertices; d04-2 Closed and Periodic No).
  const TRIMMED: [string, SplineEntity, Vec2[], number[]][] = [
    [
      "an open fit spline (k01)",
      OPEN_FIT,
      [p(0, 0), p(3.333333, 5.555556), p(8.333333, 13.888889)].concat([
        p(13.333333, 7.222222),
        p(15, 5),
      ]),
      [0, 0, 0, 0, ROOT200, 1.5 * ROOT200, 1.5 * ROOT200].concat([
        1.5 * ROOT200,
        1.5 * ROOT200,
      ]),
    ],
    [
      "an open CV spline (k02)",
      OPEN_CV,
      [p(0, 0), p(3.138593, 9.41578), p(10.217494, 5.040485)].concat([
        p(20, 4.187945),
      ]),
      [0, 0, 0, 0, 0.627719, 0.627719, 0.627719, 0.627719],
    ],
    [
      "a closed fit spline, a triple knot at its seam (k03)",
      CLOSED_FIT,
      [p(10, 23.75), p(6.25, 23.75), p(-5, 20), p(-5, 5), p(0, 0)].concat([
        p(2.5, -2.5),
        p(6.25, -3.75),
        p(10, -3.75),
      ]),
      [50, 50, 50, 50, 60, 80, 80, 80, 90, 90, 90, 90],
    ],
    [
      "a closed CV spline, from parameter 0.5 to 2.5 (k04)",
      CLOSED_CV,
      [p(40, 19.166667), p(37.5, 19.166667), p(30, 16.666667)].concat([
        p(30, 3.333333),
        p(37.5, 0.833333),
        p(40, 0.833333),
      ]),
      [0.5, 0.5, 0.5, 0.5, 1, 2, 2.5, 2.5, 2.5, 2.5],
    ],
  ]

  it.each(TRIMMED)(
    "draw the piece TRIM leaves of %s on its curve",
    (_, whole, points, knotVector) => {
      const piece = createSpline("cv", points, { knotVector })
      expect(piece.degree).toBe(3)
      expect(knots(piece)).toEqual(knotVector)
      expect(bsplineDomain(splineCurve(piece))).toEqual({
        start: knotVector[0],
        end: knotVector[knotVector.length - 1],
      })
      expect(splineStartPoint(piece)).toBeCloseToPoint(points[0], 9)
      expect(splineEndPoint(piece)).toBeCloseToPoint(points.at(-1)!, 9)
      expectOnCurve(piece, whole)
    }
  )

  it("draw the open piece BREAK leaves of a closed CV spline (k08)", () => {
    const piece = createSpline(
      "cv",
      [p(46.666667, 16.666667), p(43.333333, 20), p(30, 20)].concat([
        p(30, 0),
        p(43.333333, 0),
        p(46.666667, 3.333333),
      ]),
      { knotVector: [0, 0, 0, 0, 1, 2, 3, 3, 3, 3] }
    )
    expect(isPeriodicSpline(piece)).toBe(false)
    expectOnCurve(piece, CLOSED_CV)
  })

  // What BREAK leaves of a fit spline: fit splines on knots of their own,
  // the cut ends' tangents the curve's derivatives there (desktop d02:
  // Knot parameterization Custom, Start tangent vector 0.7071, 1.1785).
  const FIRST_PIECE = createSpline(
    "fit",
    [p(0, 0), p(10, 10), p(13.369531, 7.116166)],
    {
      knotVector: [0, 0, 0, 0, ROOT200, 18.907372, 18.907372].concat([
        18.907372, 18.907372,
      ]),
      startTangent: p(0.707107, 1.178511),
      endTangent: p(0.707107, -0.867617),
    }
  )

  it("fit the pieces BREAK leaves of a fit spline at their own parameters (k05)", () => {
    expect(splineKnotParameterization(FIRST_PIECE)).toBe("custom")
    expect(splineCurve(FIRST_PIECE).controlPoints).toBeCloseToPoints(
      [
        p(0, 0),
        p(3.333333, 5.555556),
        p(7.789844, 12.983073),
        p(12.246354, 8.494299),
        p(13.369531, 7.116166),
      ],
      5
    )
    expect(splineCurve(FIRST_PIECE).knots).toEqual(FIRST_PIECE.knotVector)
    expectOnCurve(FIRST_PIECE, OPEN_FIT)
    const last = createSpline("fit", [p(23.621319, 1.099085), p(30, 10)], {
      knotVector: [33.40559, 33.40559, 33.40559, 33.40559].concat([
        3 * ROOT200,
        3 * ROOT200,
        3 * ROOT200,
        3 * ROOT200,
      ]),
      startTangent: p(0.707107, 0.603102),
      endTangent: p(0.707107, 1.178511),
    })
    expect(splineCurve(last).controlPoints).toBeCloseToPoints(
      [
        p(23.621319, 1.099085),
        p(25.747546, 2.912577),
        p(27.873773, 6.456288),
        p(30, 10),
      ],
      5
    )
  })

  it("read a triple knot at a closed fit spline's seam as one parameter (k07)", () => {
    const piece = createSpline(
      "fit",
      [p(10, 23.75), p(0, 20), p(0, 0), p(20, 0), p(23.75, 10)],
      {
        knotVector: [50, 50, 50, 50, 60, 80, 80, 80, 100, 110, 110, 110, 110],
        startTangent: p(-1.125, 0),
        endTangent: p(0, 1.125),
      }
    )
    expect(piece.knotVector).toBeDefined()
    expectOnCurve(piece, CLOSED_FIT)
  })

  it("stay as they were when SCALE grows the tangents (k13)", () => {
    const scaled = scaleEntity(FIRST_PIECE, p(0, 0), 2) as SplineEntity
    expect(scaled.knotVector).toEqual(FIRST_PIECE.knotVector)
    expect(scaled.startTangent).toBeCloseToPoint(p(1.414214, 2.357023), 5)
    expect(scaled.endTangent).toBeCloseToPoint(p(1.414214, -1.735235), 5)
    expect(splineCurve(scaled).controlPoints[3]).toBeCloseToPoint(
      p(24.492708, 16.988599),
      5
    )
  })

  it("stay as they were when a fit point moves (k14)", () => {
    const moved = splineWithPoint(FIRST_PIECE, 0, { x: 0, y: -5, z: 0 })
    expect(moved.knotVector).toEqual(FIRST_PIECE.knotVector)
    expect(splineCurve(moved).controlPoints).toBeCloseToPoints(
      [
        p(0, -5),
        p(3.333333, 0.555556),
        p(7.789844, 13.825455),
        p(12.246354, 8.494299),
        p(13.369531, 7.116166),
      ],
      5
    )
  })

  it("are dropped when they do not fit the points", () => {
    const points = OPEN_CV.points
    for (const knotVector of [
      [0, 0, 1, 1],
      [0, 0, 0, 0, 2, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, NaN, 1, 1, 1],
    ]) {
      expect(createSpline("cv", points, { knotVector }).knotVector).toBe(
        undefined
      )
    }
    // Degree 2 on four vertices, from the knots' count.
    const quadratic = createSpline("cv", points, {
      knotVector: [0, 0, 0, 1, 2, 2, 2],
    })
    expect(quadratic.degree).toBe(2)
    expect(
      createSpline("fit", OPEN_FIT.points, { knotVector: [0, 0, 0, 0, 1, 1] })
        .knotVector
    ).toBeUndefined()
  })
})

describe("a spline's weights", () => {
  // SPLINEDIT's Edit vertex Weight made k15's second vertex 3 and k16's
  // first; desktop d03's palette reads Weight 3 there.
  const RATIONAL = createSpline("cv", OPEN_CV.points, {
    weights: [1, 3, 1, 1],
  })
  const CLOSED_RATIONAL = createSpline("cv", CLOSED_CV.points, {
    closed: true,
    weights: [3, 1, 1, 1],
  })

  it("pull the curve to their vertex, its ends where they were", () => {
    expect(splineStartPoint(RATIONAL)).toBeCloseToPoint(p(0, 0), 12)
    expect(splineEndPoint(RATIONAL)).toBeCloseToPoint(p(40, 10), 12)
    const curve = splineCurve(RATIONAL)
    // The middle's basis is 1/8, 3/8, 3/8, 1/8; the weights make it 1, 9, 3, 1 over 14.
    expect(bsplinePoint(curve, 0.5)).toBeCloseToPoint(
      p((45 + 60 + 40) / 14, (135 - 15 + 10) / 14),
      12
    )
  })

  it("sweep AutoCAD's area, the length by a truer quadrature (k15, k16)", () => {
    // The area is AutoCAD's to its last decimal, so the curve is; its
    // integrator's length runs off in the fourth significant figure on a
    // rational spline, long here and short closed, where a sum of a hundred
    // thousand chords agrees with ours to the tenth decimal (47.4958388714).
    expect(splineArea(RATIONAL)).toBeCloseTo(126.18152044, 6)
    expect(splineArea(CLOSED_RATIONAL)).toBeCloseTo(249.09265361, 6)
    expect(splineLength(RATIONAL)).toBeCloseTo(47.4958388714, 9)
    expect(splineLength(RATIONAL)).toBeCloseTo(47.50408029, 1)
    expect(splineLength(CLOSED_RATIONAL)).toBeCloseTo(57.53346423, 3)
    expect(splineMidpoint(RATIONAL)).toBeCloseToPoint(
      p(17.06187596, 7.34503156),
      2
    )
  })

  it("belong to a CV spline, one above 0 per vertex", () => {
    const points = OPEN_CV.points
    expect(createSpline("cv", points, { weights: [1, 3, 1] }).weights).toBe(
      undefined
    )
    expect(
      createSpline("cv", points, { weights: [1, 0, 1, 1] }).weights
    ).toBeUndefined()
    expect(
      createSpline("fit", points, { weights: [1, 3, 1, 1] }).weights
    ).toBeUndefined()
  })
})

describe("a spline on knots or weights of its own, transformed", () => {
  // A NURBS moves by its control points: the knots and weights stay, and the
  // curve is the transformed curve, point for point at each parameter.
  it("turns and scales its curve with it", () => {
    fc.assert(
      fc.property(splineEntity, (spline) => {
        const pivot = p(3, -2)
        const turned = scaleEntity(
          rotateEntity(spline, pivot, 0.7),
          pivot,
          1.5
        ) as SplineEntity
        expect(turned.knotVector).toEqual(spline.knotVector)
        expect(turned.weights).toEqual(spline.weights)
        const before = splineCurve(spline)
        const after = splineCurve(turned)
        const { start, end } = bsplineDomain(before)
        expect(bsplineDomain(after).start).toBeCloseTo(start, 9)
        const scale = Math.max(
          1,
          ...before.controlPoints.map((q) => Math.hypot(q.x, q.y))
        )
        for (const f of [0, 0.3, 0.75, 1]) {
          const u = start + f * (end - start)
          const moved = rotatePoint(bsplinePoint(before, u), pivot, 0.7)
          const expected = p(
            pivot.x + (moved.x - pivot.x) * 1.5,
            pivot.y + (moved.y - pivot.y) * 1.5
          )
          const domain = bsplineDomain(after)
          const v = domain.start + f * (domain.end - domain.start)
          const got = bsplinePoint(after, v)
          expect(
            Math.hypot(got.x - expected.x, got.y - expected.y)
          ).toBeLessThan(1e-7 * scale)
        }
      })
    )
  })
})
