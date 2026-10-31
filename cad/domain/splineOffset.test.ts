import { describe, expect, it } from "vitest"
import { p } from "../../test/builders"
import type { Vec2 } from "../geometry/Vec2"
import { OFFSET_CURVE_TOLERANCE, offsetOnKnots } from "../geometry/curveOffset"
import { type BSplineCurve, bsplinePoint } from "../geometry/nurbs"
import { createEllipse } from "./ellipses"
import { createSpline } from "./splines"
import {
  type CurveOffsetShape,
  offsetCurveEntity,
  offsetsCurve,
  planarCurve,
} from "./splineOffset"
import type { EllipseEntity, SplineEntity } from "./entityTypes"

// OFFSET of an ellipse or a spline as AutoCAD 2027 leaves it, as MPDUMP read
// it (probes offset/p196–p198, spline-knots/k38–k56): a CV spline of degree 3
// on the source's parameter, every inner knot double, within 0.001 of the
// exact offset; the cuts where it crosses itself to the dumps' digits.

const ELLIPSE = createEllipse(p(0, 0), p(50, 0), 0.5)
const QUARTER = createEllipse(p(0, 0), p(50, 0), 0.5, {
  startParam: 0,
  endParam: Math.PI / 2,
})
const FIT = createSpline("fit", [p(0, 0), p(50, 30), p(100, 0)])
const CV = createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)])

function splinesOf(shapes: readonly CurveOffsetShape[]) {
  return shapes.map((shape) => {
    if (shape.kind !== "spline") throw new Error("not a spline")
    return shape
  })
}

/** The distinct knots: where the spans meet. */
const spanKnots = (curve: BSplineCurve) =>
  curve.knots.filter((k, i) => i === 0 || k > curve.knots[i - 1])
const range = (curve: BSplineCurve) => [
  curve.knots[0],
  curve.knots[curve.knots.length - 1],
]

/** How far the copy strays from `distance` off the source, 40 points a span. */
function strayOf(
  source: SplineEntity | EllipseEntity,
  curve: BSplineCurve,
  distance: number
): number {
  const exact = planarCurve(source)
  const knots = spanKnots(curve)
  let stray = 0
  for (let i = 1; i < knots.length; i++) {
    for (let k = 1; k < 40; k++) {
      const u = knots[i - 1] + ((knots[i] - knots[i - 1]) * k) / 40
      const off = Math.abs(exact.distance(bsplinePoint(curve, u)) - distance)
      stray = Math.max(stray, off)
    }
  }
  return stray
}

describe("an offset spline's construction", () => {
  it("is AutoCAD's on AutoCAD's knots: each span the Hermite cubic of the exact offset (p197, p198)", () => {
    // The quarter ellipse offset 10 out (to its right), p197's knots.
    const quarter = offsetOnKnots(
      planarCurve(QUARTER),
      -10,
      [
        0, 0.10170331442856355, 0.2034066288571271, 0.30510994328569063,
        0.4068132577142542, 0.6041879296056794, 0.8015626014971046,
        0.9989372733885298, 1.1963119452799549, 1.5707963267948966,
      ]
    )
    expect(quarter.knots.slice(0, 6)).toEqual([
      0, 0, 0, 0, 0.10170331442856355, 0.10170331442856355,
    ])
    expect(quarter.controlPoints).toBeCloseToPoints(
      [
        p(60, 0),
        p(60, 1.525549716428453),
        p(59.843242466211564, 3.050531022438058),
        p(59.23599391979868, 6.025622836619386),
        p(58.786304268491996, 7.4751471079003515),
        p(57.640758934359944, 10.252104022260454),
        p(56.94560898574997, 11.579790816153608),
        p(55.35846819355206, 14.099509297966444),
        p(54.466676126408316, 15.292048299058475),
        p(51.60874912970649, 18.608680826828518),
        p(49.42447847428881, 20.555293165008695),
        p(44.604023040930876, 24.04684573375507),
        p(41.96456852679979, 25.59285022002703),
        p(36.308355972521284, 28.33097368376008),
        p(33.29057555052982, 29.5223808626902),
        p(26.955595056645787, 31.560960202425566),
        p(23.638297847138347, 32.40757597818088),
        p(13.728313912596457, 34.35504235429028),
        p(6.865546994440601, 35),
        p(0, 35),
      ],
      9
    )

    // The fit spline offset 10 up (to its left), p198's knots: the first
    // and last spans' control points.
    const fit = offsetOnKnots(
      planarCurve(FIT),
      10,
      [
        0, 9.755578977400681, 21.868088027019503, 33.980597076638325,
        42.67092570788637, 51.36125433913441, 55.16396565795854,
        57.79162445111727, 59.88062389402084, 61.969623336924414,
        66.14762222273156, 73.81678424953425, 81.48594627633695,
        89.15510830313964, 101.16728770049633, 113.17946709785302,
        116.61903789690601,
      ]
    )
    expect(fit.controlPoints).toHaveLength(34)
    expect(fit.controlPoints.slice(0, 3)).toBeCloseToPoints(
      [
        p(-6.689647316224498, 7.432941462471662),
        p(-3.901200663107465, 9.942543450276993),
        p(-1.0789394508247092, 12.483046277971049),
      ],
      9
    )
    expect(fit.controlPoints.slice(-3)).toBeCloseToPoints(
      [
        p(104.71909882285317, 9.20644188174599),
        p(105.7065114403327, 8.31776375077427),
        p(106.6896473162245, 7.432941462471657),
      ],
      9
    )
  })
})

describe("OFFSET of an ellipse", () => {
  it("is a closed CV spline on its parameter, within 0.001, as many spans as AutoCAD's near enough (p196, k38, k39, k41)", () => {
    // [source, distance, side, AutoCAD's spans]
    const cases: [EllipseEntity, number, Vec2, number][] = [
      [ELLIPSE, 10, p(70, 0), 33],
      [ELLIPSE, 1, p(70, 0), 25],
      [ELLIPSE, 10, p(0, 0), 37],
      [createEllipse(p(0, 0), p(500, 0), 0.5), 100, p(700, 0), 60],
      [createEllipse(p(0, 0), p(50, 0), 0.1), 2, p(80, 0), 47],
    ]
    for (const [source, distance, side, acad] of cases) {
      const [copy, ...rest] = splinesOf(
        offsetCurveEntity(source, distance, side)
      )
      expect(rest).toEqual([])
      expect(copy.closed).toBe(true)
      expect(copy.curve.degree).toBe(3)
      expect(range(copy.curve)).toEqual([0, 2 * Math.PI])
      const points = copy.curve.controlPoints
      expect(points[points.length - 1]).toEqual(points[0])
      expect(strayOf(source, copy.curve, distance)).toBeLessThanOrEqual(
        OFFSET_CURVE_TOLERANCE
      )
      const spans = spanKnots(copy.curve).length - 1
      expect(spans).toBeGreaterThanOrEqual(Math.floor(acad * 0.75))
      expect(spans).toBeLessThanOrEqual(Math.ceil(acad * 1.25))
    }
  })

  it("starts and ends an elliptical arc's where its parameters do (p197, k40)", () => {
    const arc = createEllipse(p(0, 0), p(50, 0), 0.5, {
      startParam: 0.8570719478501309,
      endParam: 3.770825540178867,
    })
    for (const side of [p(0, 60), p(0, 0)]) {
      const [copy] = splinesOf(offsetCurveEntity(arc, 5, side))
      expect(copy.closed).toBe(false)
      expect(range(copy.curve)).toEqual([0.8570719478501309, 3.770825540178867])
      expect(strayOf(arc, copy.curve, 5)).toBeLessThanOrEqual(1e-3)
    }
    const [quarter] = splinesOf(offsetCurveEntity(QUARTER, 10, p(70, 0)))
    // p197's 9 spans, 20 control points.
    expect(quarter.curve.controlPoints).toHaveLength(20)
  })

  it("cuts out where an inward offset past its curvature crosses itself, the last piece first (k38)", () => {
    // 20 in, past the radius of curvature at the ends of the major axis
    // (12.5): the dumps' pieces, from 3.946996154164319 to 5.477781806605144
    // and from 0.8054035005744429 to 2.3361891530152676.
    const pieces = splinesOf(offsetCurveEntity(ELLIPSE, 20, p(0, 0)))
    expect(pieces.map((piece) => piece.closed)).toEqual([false, false])
    const [first, second] = pieces.map((piece) => range(piece.curve))
    expect(first[0]).toBeCloseTo(3.946996154164319, 11)
    expect(first[1]).toBeCloseTo(5.477781806605144, 11)
    expect(second[0]).toBeCloseTo(0.8054035005744429, 11)
    expect(second[1]).toBeCloseTo(2.3361891530152676, 11)
    // Each piece of 6 spans, as AutoCAD's 18 control points.
    expect(pieces.map((piece) => piece.curve.controlPoints.length)).toEqual([
      18, 18,
    ])
    for (const piece of pieces) {
      expect(strayOf(ELLIPSE, piece.curve, 20)).toBeLessThanOrEqual(1e-3)
    }
  })

  it("has none past its minor semi-axis inward (k38: Cannot offset that object.)", () => {
    expect(offsetCurveEntity(ELLIPSE, 30, p(0, 0))).toEqual([])
  })

  it("offsets a round one into an ellipse, an arc into its arc (k41, k56)", () => {
    expect(
      offsetCurveEntity(createEllipse(p(0, 0), p(50, 0), 1), 10, p(0, 90))
    ).toEqual([
      { kind: "ellipse", center: p(0, 0), majorAxis: p(60, 0), ratio: 1 },
    ])
    const arc = createEllipse(p(0, 0), p(40, 0), 1, {
      startParam: 0,
      endParam: Math.PI / 2,
    })
    expect(offsetCurveEntity(arc, 5, p(0, 0))).toEqual([
      {
        kind: "ellipse",
        center: p(0, 0),
        majorAxis: p(35, 0),
        ratio: 1,
        startParam: 0,
        endParam: Math.PI / 2,
      },
    ])
    expect(offsetCurveEntity(arc, 40, p(0, 0))).toEqual([])
  })
})

describe("OFFSET of a spline", () => {
  it("follows a fit, a CV, a rational and a closed one within 0.001, on its knots' parameter (p198, k42–k45)", () => {
    const rational = createSpline(
      "cv",
      [p(0, 0), p(5, 15), p(20, -5), p(40, 10)],
      { weights: [3, 1, 1, 1] }
    )
    const square = createSpline(
      "cv",
      [p(30, 30), p(50, 30), p(50, 50), p(30, 50)],
      { closed: true }
    )
    const closedFit = createSpline(
      "fit",
      [p(30, 30), p(50, 30), p(50, 50), p(30, 50)],
      { closed: true }
    )
    // [source, distance, side, its parameters, closed]
    const cases: [SplineEntity, number, Vec2, number[], boolean][] = [
      [FIT, 1, p(50, 80), [0, 116.61903789690601], false],
      [FIT, 10, p(50, 0), [0, 116.61903789690601], false],
      [CV, 2, p(-5, 5), [0, 1], false],
      [rational, 2, p(-5, 5), [0, 1], false],
      [square, 2, p(60, 20), [0, 4], true],
      [square, 2, p(40, 40), [0, 4], true],
      [closedFit, 2, p(0, 0), [0, 80], true],
    ]
    for (const [source, distance, side, params, closed] of cases) {
      const [copy, ...rest] = splinesOf(
        offsetCurveEntity(source, distance, side)
      )
      expect(rest).toEqual([])
      expect(copy.closed).toBe(closed)
      expect(copy.curve.weights).toBeUndefined()
      expect(range(copy.curve)[0]).toBeCloseTo(params[0], 9)
      expect(range(copy.curve)[1]).toBeCloseTo(params[1], 9)
      expect(strayOf(source, copy.curve, distance)).toBeLessThanOrEqual(1e-3)
    }
  })

  it("cuts an open one where it crosses itself, in order (k42)", () => {
    const pieces = splinesOf(offsetCurveEntity(FIT, 40, p(50, 0)))
    const ranges = pieces.map((piece) => range(piece.curve))
    expect(ranges[0][0]).toBe(0)
    expect(ranges[0][1]).toBeCloseTo(35.079531589498, 9)
    expect(ranges[1][0]).toBeCloseTo(81.53950630732395, 9)
    expect(ranges[1][1]).toBeCloseTo(116.61903789690601, 9)
  })

  it("cuts a closed one at its seam too, the last piece first (k52)", () => {
    const lens = createSpline("fit", [p(30, -5), p(60, 0), p(30, 5), p(0, 0)], {
      closed: true,
    })
    const ranges = splinesOf(offsetCurveEntity(lens, 3, p(30, 0))).map(
      (piece) => range(piece.curve)
    )
    const dumps = [
      [103.87508326600746, 121.6552506059644],
      [0, 17.780167339956893],
      [43.0474579630253, 78.60779264293912],
    ]
    expect(ranges).toHaveLength(3)
    ranges.forEach(([from, to], i) => {
      expect(from).toBeCloseTo(dumps[i][0], 9)
      expect(to).toBeCloseTo(dumps[i][1], 9)
    })
  })

  it("has none of one with a corner: degree 1, or a tripled vertex (k51, k54)", () => {
    const zigzag = [p(0, 0), p(10, 10), p(20, 0), p(30, 10)]
    expect(
      offsetCurveEntity(createSpline("cv", zigzag, { degree: 1 }), 2, p(-5, 5))
    ).toEqual([])
    const tripled = createSpline("cv", [
      p(0, 0),
      p(10, 10),
      p(20, 0),
      p(20, 0),
      p(20, 0),
      p(30, 10),
      p(40, 0),
    ])
    expect(offsetCurveEntity(tripled, 2, p(-5, 5))).toEqual([])
  })

  it("takes one lying in a plane, not one out of every plane (k46)", () => {
    expect(offsetsCurve(FIT)).toBe(true)
    expect(
      offsetsCurve(
        createSpline("fit", [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 10, z: 5 },
          { x: 20, y: 0, z: 10 },
          { x: 30, y: 10, z: 0 },
        ])
      )
    ).toBe(false)
  })
})
