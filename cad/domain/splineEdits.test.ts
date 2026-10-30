import { describe, expect, it } from "vitest"
import { p } from "../../test/builders"
import { bsplineDomain, bsplinePoint } from "../geometry/nurbs"
import { closestPointOnSpline, createSpline, splinePolyline } from "./splines"
import {
  splineBreakPiece,
  splineCutPiece,
  splineGrowth,
  splineGrown,
  splineInPlaneOf,
  splineInWorld,
  splineParamAt,
  splineRun,
} from "./splineEdits"
import type { SplineEntity } from "./entityTypes"

// The pieces AutoCAD 2027 leaves of a spline it trims, breaks or extends, as
// MPDUMP read them (probes spline-knots/k01–k37): the cuts at the parameters
// the dumps give, the knots and control points to their digits.

const ROOT200 = Math.hypot(10, 10)
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

const knots = (spline: SplineEntity) => spline.knotVector ?? []

/** Where the growth meets the line x = `x`, by bisection on its parameter. */
function growthTo(spline: SplineEntity, atEnd: boolean, x: number): number {
  const growth = splineGrowth(spline, atEnd)
  const from = growth.at(0).x
  let lo = 0
  let hi = growth.reach(1000)
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (Math.sign(growth.at(mid).x - x) === Math.sign(from - x)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

describe("TRIM's piece of a spline", () => {
  it("is a CV spline on the knots it had, a fit spline's too (k01, k02)", () => {
    const fit = splineCutPiece(OPEN_FIT, 0, 1.5 * ROOT200)
    expect(fit).toMatchObject({ method: "cv", degree: 3, closed: false })
    expect(fit.startTangent).toBeUndefined()
    expect(fit.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(3.333333333333333, 5.5555555555555545),
        p(8.333333333333334, 13.888888888888888),
        p(13.333333333333334, 7.2222222222222205),
        p(15, 4.999999999999998),
      ],
      12
    )
    expect(knots(fit)).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      1.5 * ROOT200,
      1.5 * ROOT200,
      1.5 * ROOT200,
      1.5 * ROOT200,
    ])

    const cv = splineCutPiece(OPEN_CV, 0, 0.6277186767309857)
    expect(cv.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(3.1385933836549285, 9.415780150964785),
        p(10.217494138478854, 5.040484502838081),
        p(20.000000000000004, 4.187944758224749),
      ],
      12
    )
    expect(knots(cv)).toEqual([
      0, 0, 0, 0, 0.6277186767309857, 0.6277186767309857, 0.6277186767309857,
      0.6277186767309857,
    ])
  })

  it("runs a closed one across its seam on a knot of three there (k03, k04, k36)", () => {
    const fit = splineCutPiece(CLOSED_FIT, 50, 90)
    expect(fit.closed).toBe(false)
    expect(knots(fit)).toEqual([50, 50, 50, 50, 60, 80, 80, 80, 90, 90, 90, 90])
    expect(fit.points).toBeCloseToPoints(
      [
        p(10, 23.75),
        p(6.25, 23.75),
        p(-5, 20),
        p(-5, 5),
        p(0, 0),
        p(2.5, -2.5),
        p(6.25, -3.75),
        p(10, -3.75),
      ],
      12
    )

    const cv = splineCutPiece(CLOSED_CV, 0.5, 2.5)
    expect(knots(cv)).toEqual([0.5, 0.5, 0.5, 0.5, 1, 2, 2.5, 2.5, 2.5, 2.5])
    expect(cv.points).toBeCloseToPoints(
      [
        p(40, 19.166666666666664),
        p(37.5, 19.166666666666664),
        p(30, 16.666666666666668),
        p(30, 3.3333333333333326),
        p(37.5, 0.8333333333333331),
        p(40, 0.8333333333333333),
      ],
      12
    )

    const across = splineCutPiece(CLOSED_CV, 2.5, 4.5)
    expect(knots(across)).toEqual([
      2.5, 2.5, 2.5, 2.5, 3, 4, 4, 4, 4.5, 4.5, 4.5, 4.5,
    ])
    expect(across.points).toBeCloseToPoints(
      [
        p(40, 0.833333),
        p(42.5, 0.833333),
        p(50, 3.333333),
        p(50, 13.333333),
        p(46.666667, 16.666667),
        p(45, 18.333333),
        p(42.5, 19.166667),
        p(40, 19.166667),
      ],
      6
    )
  })
})

describe("BREAK's piece of a spline", () => {
  it("keeps a fit spline one, the cut ends new fit points (k05, k21)", () => {
    const first = splineBreakPiece(OPEN_FIT, 0, 18.9073719484528)
    expect(first).toMatchObject({ method: "fit", closed: false })
    expect(first.points).toBeCloseToPoints(
      [p(0, 0), p(10, 10), p(13.369530919167282, 7.116165614727937)],
      12
    )
    expect(knots(first)).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      18.9073719484528,
      18.9073719484528,
      18.9073719484528,
      18.9073719484528,
    ])
    expect(first.startTangent).toBeCloseToPoint(
      p(0.7071067811865475, 1.1785113019775788),
      12
    )
    expect(first.endTangent).toBeCloseToPoint(
      p(0.7071067811865496, -0.8676173026740982),
      12
    )
    // Its curve, fitted again through its points, is the cut one.
    for (const point of splinePolyline(first)) {
      expect(closestPointOnSpline(OPEN_FIT, point).distance).toBeLessThan(1e-9)
    }

    const second = splineBreakPiece(OPEN_FIT, ROOT200, 3 * ROOT200)
    expect(second.points).toBeCloseToPoints(
      [p(10, 10), p(20, 0), p(30, 10)],
      12
    )
    expect(knots(second)).toEqual([
      ROOT200,
      ROOT200,
      ROOT200,
      ROOT200,
      2 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
    ])
    expect(second.startTangent).toBeCloseToPoint(p(0.707107, -0.235702), 6)
  })

  it("breaks a closed fit spline into one fit spline across its seam (k07)", () => {
    const piece = splineBreakPiece(CLOSED_FIT, 50, 110)
    expect(knots(piece)).toEqual([
      50, 50, 50, 50, 60, 80, 80, 80, 100, 110, 110, 110, 110,
    ])
    expect(piece.points).toBeCloseToPoints(
      [p(10, 23.75), p(0, 20), p(0, 0), p(20, 0), p(23.75, 10)],
      12
    )
    expect(piece.startTangent).toBeCloseToPoint(p(-1.125, 0), 12)
    expect(piece.endTangent).toBeCloseToPoint(p(0, 1.125), 12)
    for (const point of splinePolyline(piece)) {
      expect(closestPointOnSpline(CLOSED_FIT, point).distance).toBeLessThan(
        1e-9
      )
    }
  })

  it("breaks a CV spline into CV pieces, weights and all (k06, k08, k29)", () => {
    const end = splineBreakPiece(OPEN_CV, 0.7, 1)
    expect(knots(end)).toEqual([0.7, 0.7, 0.7, 0.7, 1, 1, 1, 1])
    expect(end.points).toBeCloseToPoints(
      [p(23.485, 4.06), p(28.45, 4.15), p(34, 5.5), p(40, 10)],
      12
    )
    const closed = splineBreakPiece(CLOSED_CV, 0, 3)
    expect(knots(closed)).toEqual([0, 0, 0, 0, 1, 2, 3, 3, 3, 3])
    expect(closed.points).toBeCloseToPoints(
      [
        p(46.66666666666667, 16.666666666666664),
        p(43.333333333333336, 20),
        p(30, 20),
        p(30, 0),
        p(43.33333333333333, 0),
        p(46.666666666666664, 3.333333333333333),
      ],
      12
    )

    const weighed = createSpline("cv", OPEN_CV.points, {
      weights: [3, 1, 1, 1],
    })
    const piece = splineBreakPiece(weighed, 0, 0.3950206663223277)
    expect(piece.weights).toEqual([
      expect.closeTo(3, 6),
      expect.closeTo(2.209959, 6),
      expect.closeTo(1.732, 6),
      expect.closeTo(1.442845, 6),
    ])
    expect(piece.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(0.893729, 2.681186),
        p(3.181651, 3.688899),
        p(7.137532, 3.954936),
      ],
      6
    )
  })

  it("finds the break point's parameter on a knot it lies on (k21)", () => {
    expect(splineParamAt(OPEN_FIT, p(10, 10))).toBe(ROOT200)
    expect(splineParamAt(OPEN_CV, p(7.065, 5.94))).toBeCloseTo(0.3, 12)
  })
})

describe("EXTEND's growth of a spline", () => {
  it("grows a CV spline by its end's Taylor polynomial (k10, k18, k31)", () => {
    // WHY to five digits: AutoCAD's last control point lies on the edge to
    // the digit and its knot off the polynomial's crossing in the sixth
    // significant figure (k10 1.16024840 against 1.16024690), its own
    // crossing search; the knot and the points before are the polynomial's.
    const t = growthTo(OPEN_CV, true, 50)
    expect(1 + t).toBeCloseTo(1.1602483961185157, 5)
    const grown = splineGrown(OPEN_CV, true, t)
    expect(knots(grown)).toEqual([
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1 + t,
      1 + t,
      1 + t,
      1 + t,
    ])
    expect(grown.points.slice(0, -1)).toBeCloseToPoints(
      [
        p(0, 0),
        p(5, 15),
        p(20, -5),
        p(40, 10),
        p(43.204967922370315, 12.403725941777736),
        p(46.538333587033414, 15.706236079604958),
      ],
      3
    )
    // On the edge, the polynomial's end 5.6e-4 above AutoCAD's 19.906851.
    expect(grown.points.at(-1)).toBeCloseToPoint(p(50, 19.907413), 6)

    const weighed = createSpline("cv", OPEN_CV.points, {
      weights: [3, 1, 1, 1],
    })
    const rational = splineGrown(weighed, true, growthTo(weighed, true, 50))
    expect(rational.weights).toEqual([3, 1, 1, 1, 1, 1, 1])
    expect(rational.points.at(-1)).toBeCloseToPoint(p(50, 19.907413), 6)

    const straight = createSpline("cv", [p(0, 0), p(1, 0), p(2, 0), p(30, 0)])
    const ended = splineGrown(straight, true, growthTo(straight, true, 35))
    const started = splineGrown(ended, false, growthTo(ended, false, -5))
    expect(knots(started)).toEqual([
      expect.closeTo(-5 / 3, 9),
      expect.closeTo(-5 / 3, 9),
      expect.closeTo(-5 / 3, 9),
      expect.closeTo(-5 / 3, 9),
      0,
      0,
      0,
      1,
      1,
      1,
      expect.closeTo(1.0564512365675944, 6),
      expect.closeTo(1.0564512365675944, 6),
      expect.closeTo(1.0564512365675944, 6),
      expect.closeTo(1.0564512365675944, 6),
    ])
    expect(started.points).toBeCloseToPoints(
      [
        p(-5, 0),
        p(-10 / 3, 0),
        p(-5 / 3, 0),
        p(0, 0),
        p(1, 0),
        p(2, 0),
        p(30, 0),
        p(31.580635, 0),
        p(33.247311, 0),
        p(35, 0),
      ],
      4
    )
  })

  it("grows a fit spline straight on from a free end, still a fit spline (k17, k19)", () => {
    const t = growthTo(OPEN_FIT, true, 40)
    const grown = splineGrown(OPEN_FIT, true, t)
    expect(grown.method).toBe("fit")
    expect(knots(grown)).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      2 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      3 * ROOT200,
      expect.closeTo(4 * ROOT200, 12),
      expect.closeTo(4 * ROOT200, 12),
      expect.closeTo(4 * ROOT200, 12),
      expect.closeTo(4 * ROOT200, 12),
    ])
    expect(grown.points).toBeCloseToPoints(
      [p(0, 0), p(10, 10), p(20, 0), p(30, 10), p(40, 26.666667)],
      6
    )
    expect(grown.startTangent).toBeCloseToPoint(p(0.707107, 1.178511), 6)
    expect(grown.endTangent).toBeCloseToPoint(p(0.707107, 1.178511), 6)

    const back = splineGrown(OPEN_FIT, false, growthTo(OPEN_FIT, false, -10))
    expect(knots(back)[0]).toBeCloseTo(-ROOT200, 12)
    expect(back.points[0]).toBeCloseToPoint(p(-10, -16.666667), 6)
  })

  it("eases a fit spline's curvature off before it runs straight (k32, k35)", () => {
    const piece = splineBreakPiece(OPEN_FIT, 0, 18.9073719484528)
    const grown = splineGrown(piece, true, growthTo(piece, true, 18))
    expect(knots(grown)).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      18.9073719484528,
      18.9073719484528,
      18.9073719484528,
      expect.closeTo(18.972590712, 8),
      expect.closeTo(18.972590712, 8),
      expect.closeTo(18.972590712, 8),
      expect.closeTo(25.455844123, 8),
      expect.closeTo(25.455844123, 8),
      expect.closeTo(25.455844123, 8),
      expect.closeTo(25.455844123, 8),
    ])
    expect(grown.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(10, 10),
        p(13.369531, 7.116166),
        p(13.415648, 7.059488),
        p(18, 1.420717),
      ],
      6
    )
    expect(grown.endTangent).toBeCloseToPoint(p(0.707107, -0.869744), 6)
  })
})

describe("a spline at an angle to the UCS", () => {
  it("is cut in plan on its own parameter and put back in its plane (k26)", () => {
    const tilted = {
      ...createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)]),
      normal: { x: -Math.SQRT1_2, y: 0, z: Math.SQRT1_2 },
    }
    const world = splineInWorld(tilted)
    expect(world.normal).toBeUndefined()
    const run = splineRun(world)
    const curve = splineRun(tilted).curve
    expect(bsplineDomain(run.curve)).toEqual(bsplineDomain(curve))
    const piece = splineInPlaneOf(splineCutPiece(world, 0, 10), tilted)
    expect(piece.normal).toEqual(tilted.normal)
    const end = bsplinePoint(splineRun(piece).curve, 10)
    expect(end).toBeCloseToPoint(bsplinePoint(curve, 10), 9)
  })
})
