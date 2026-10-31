import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { V, type Vec2 } from "./Vec2"
import { type Vec3 } from "./Vec3"
import {
  bsplineDerivative,
  bsplineDerivativeCurve,
  bsplineDifferentials,
  bsplineDomain,
  bsplineElevated,
  bsplineJoined,
  bsplineLength,
  bsplineLengthTable,
  bsplineParamAtLength,
  bsplinePoint,
  bsplineReversed,
  bsplineSweptArea,
  bsplineTessellation,
  bsplinesMeeting,
  clampedUniformCurve,
  conicArcCurve,
  fitParameters,
  interpolateCubic,
  interpolatePeriodicCubic,
  periodicCurve,
  periodicLoop,
  periodicUniformCurve,
} from "./nurbs"
import { point as point2 } from "../../test/arbitraries"

/** A point of the kernel, which holds a Z: 0 unless given. */
const p = (x: number, y: number, z = 0): Vec3 => ({ x, y, z })
const point = point2.map((q) => p(q.x, q.y))

const ZIGZAG = [p(0, 0), p(100, 50), p(200, -20), p(300, 40), p(400, 0)]

describe("fit parameters", () => {
  it("are cumulative chord lengths, not normalised — LIST's parameter range", () => {
    expect(fitParameters([p(0, 0), p(3, 4), p(3, 10)], "chord", false)).toEqual(
      [0, 5, 11]
    )
  })

  it("take the square root of each chord for the centripetal method", () => {
    expect(
      fitParameters([p(0, 0), p(4, 0), p(4, 9)], "sqrtChord", false)
    ).toEqual([0, 2, 5])
  })

  it("measure the chords in space (spline/p200)", () => {
    const params = fitParameters(
      [p(0, 0, 5), p(10, 10, 5), p(20, 0, 8), p(30, 10, -3)],
      "chord",
      false
    )
    expect(params[3]).toBeCloseTo(46.51544078570083, 12)
  })

  it("step by one on the uniform method, with a closing value when closed", () => {
    expect(fitParameters([p(0, 0), p(4, 0), p(4, 9)], "uniform", true)).toEqual(
      [0, 1, 2, 3]
    )
  })
})

describe("cubic interpolation", () => {
  it("passes through every fit point with n + 2 control points", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(ZIGZAG, params, null, p(1, 0))
    expect(curve.degree).toBe(3)
    expect(curve.controlPoints).toHaveLength(ZIGZAG.length + 2)
    ZIGZAG.forEach((q, i) => {
      expect(bsplinePoint(curve, params[i])).toBeCloseToPoint(q, 6)
    })
  })

  it("takes each given derivative as it is, length and all", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(ZIGZAG, params, p(0, 3), p(2, -1))
    expect(bsplineDerivative(curve, params[0])).toBeCloseToPoint(p(0, 3), 9)
    expect(
      bsplineDerivative(curve, params[ZIGZAG.length - 1])
    ).toBeCloseToPoint(p(2, -1), 9)
  })

  it("has no curvature at an end given no derivative", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(ZIGZAG, params, null, null)
    const second = bsplineDerivativeCurve(bsplineDerivativeCurve(curve))
    const { start, end } = bsplineDomain(curve)
    expect(bsplinePoint(second, start)).toBeCloseToPoint(p(0, 0), 9)
    expect(bsplinePoint(second, end)).toBeCloseToPoint(p(0, 0), 9)
  })

  // probe spline/p300 (and d03): two fit points are a straight cubic at an
  // even pace, its control points a third of the way apart.
  it("is a line through two points, run at an even pace", () => {
    const points = [p(0, 0), p(10, 5)]
    const params = fitParameters(points, "chord", false)
    const curve = interpolateCubic(points, params, null, null)
    expect(curve.controlPoints).toBeCloseToPoints(
      [p(0, 0), p(10 / 3, 5 / 3), p(20 / 3, 10 / 3), p(10, 5)],
      12
    )
  })

  it("is a straight line through two points with the chord as both derivatives", () => {
    const points = [p(0, 0), p(100, 0)]
    const params = fitParameters(points, "chord", false)
    const curve = interpolateCubic(points, params, p(1, 0), p(1, 0))
    expect(bsplinePoint(curve, 37)).toBeCloseToPoint(p(37, 0), 6)
  })

  it("passes through any well-spread fit points", () => {
    fc.assert(
      fc.property(fc.array(point, { minLength: 2, maxLength: 7 }), (raw) => {
        const points = raw.filter(
          (q, i) => i === 0 || V.distance(q, raw[i - 1]) > 1
        )
        fc.pre(points.length >= 2)
        const params = fitParameters(points, "chord", false)
        const curve = interpolateCubic(points, params, null, {
          ...V.sub(points[points.length - 1], points[points.length - 2]),
          z: 0,
        })
        points.forEach((q, i) => {
          expect(bsplinePoint(curve, params[i])).toBeCloseToPoint(q, 4)
        })
      })
    )
  })
})

describe("periodic interpolation", () => {
  const loop = [p(0, 0), p(100, 0), p(120, 80), p(20, 90)]
  const params = fitParameters(loop, "chord", true)
  const curve = interpolatePeriodicCubic(loop, params)

  it("passes through every point and closes on the first", () => {
    loop.forEach((q, i) => {
      expect(bsplinePoint(curve, params[i])).toBeCloseToPoint(q, 6)
    })
    const { start, end } = bsplineDomain(curve)
    expect(bsplinePoint(curve, end)).toBeCloseToPoint(
      bsplinePoint(curve, start),
      6
    )
  })

  it("has the same tangent on both sides of the closure (SPLPERIODIC 1)", () => {
    const { start, end } = bsplineDomain(curve)
    expect(bsplineDerivative(curve, end)).toBeCloseToPoint(
      bsplineDerivative(curve, start),
      5
    )
  })
})

describe("control-vertex curves", () => {
  const cvs = [p(0, 0), p(50, 100), p(150, 100), p(200, 0), p(260, 60)]

  it("start and end on the first and last vertex when open", () => {
    const curve = clampedUniformCurve(cvs, 3)
    const { start, end } = bsplineDomain(curve)
    expect(bsplinePoint(curve, start)).toBeCloseToPoint(cvs[0])
    expect(bsplinePoint(curve, end)).toBeCloseToPoint(cvs[cvs.length - 1])
  })

  it("is the control polygon itself at degree 1", () => {
    const curve = clampedUniformCurve(cvs, 1)
    expect(bsplinePoint(curve, 1.5)).toBeCloseToPoint(
      V.midpoint(cvs[1], cvs[2])
    )
  })

  it("closes smoothly when periodic", () => {
    const curve = periodicUniformCurve(cvs, 3)
    const { start, end } = bsplineDomain(curve)
    expect(bsplinePoint(curve, end)).toBeCloseToPoint(
      bsplinePoint(curve, start)
    )
    expect(bsplineDerivative(curve, end)).toBeCloseToPoint(
      bsplineDerivative(curve, start)
    )
  })

  it("is a parabola through the midpoint of its three vertices' chords at degree 2", () => {
    const curve = clampedUniformCurve([p(0, 0), p(50, 100), p(100, 0)], 2)
    expect(bsplinePoint(curve, 0.5)).toBeCloseToPoint(p(50, 50))
  })
})

describe("tessellation", () => {
  it("keeps every chord within the tolerance of the curve", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(ZIGZAG, params, null, p(1, 0))
    const tolerance = 0.01
    const { params: us, points } = bsplineTessellation(curve, tolerance)
    for (let i = 1; i < points.length; i++) {
      const mid = bsplinePoint(curve, (us[i - 1] + us[i]) / 2)
      expect(distanceToSegment(mid, points[i - 1], points[i])).toBeLessThan(
        tolerance * 1.5
      )
    }
  })
})

describe("measures by quadrature", () => {
  // A parabola: its speed is no polynomial, its length has a closed form.
  const ARCH = clampedUniformCurve([p(0, 0), p(1, 2), p(2, 0)], 2)

  it("measures a parabola's length to the closed form", () => {
    // C′(t) = (2, 4 − 8t): |C′| = 2√(1 + (2 − 4t)²), integrated exactly.
    const half = (x: number) => (x * Math.sqrt(1 + x * x) + Math.asinh(x)) / 2
    const exact = (2 * (half(2) - half(-2))) / 4
    expect(bsplineLength(ARCH)).toBeCloseTo(exact, 13)
    expect(bsplineLength(ARCH, 0, 0.5)).toBeCloseTo(exact / 2, 13)
  })

  it("finds the parameter at a length, the inverse of the length", () => {
    const total = bsplineLength(ARCH)
    for (const f of [0, 0.1, 0.5, 0.9, 1]) {
      const u = bsplineParamAtLength(ARCH, f * total)
      expect(bsplineLength(ARCH, 0, u)).toBeCloseTo(f * total, 12)
    }
    expect(bsplineParamAtLength(ARCH, -1)).toBe(0)
    expect(bsplineParamAtLength(ARCH, 2 * total)).toBe(1)
  })

  it("sweeps a closed curve's area exactly", () => {
    const square = [p(0, 0), p(10, 0), p(10, 10), p(0, 10)]
    const loop = periodicUniformCurve(square, 1)
    const { start, end } = bsplineDomain(loop)
    expect(bsplineSweptArea(loop, start, end)).toBeCloseTo(100, 12)
    expect(bsplineSweptArea(loop, end, start)).toBeCloseTo(-100, 12)
  })

  it("meets another curve where they cross", () => {
    const line = clampedUniformCurve([p(0, 0.5), p(2, 0.5)], 1)
    const met = bsplinesMeeting(ARCH, 0.1, line, 0.1)
    expect(met).not.toBeNull()
    expect(bsplinePoint(ARCH, met!.u)).toBeCloseToPoint(
      bsplinePoint(line, met!.v),
      12
    )
    const above = clampedUniformCurve([p(0, 5), p(2, 5)], 1)
    expect(bsplinesMeeting(ARCH, 0.5, above, 0.5)).toBeNull()
  })
})

describe("a curve's length table", () => {
  // The dashes of a linetype are laid by it: each distance where the one
  // search finds it, the whole length the quadrature's.
  it("finds every distance where the one search does", () => {
    const curve = clampedUniformCurve(ZIGZAG, 3)
    const table = bsplineLengthTable(curve)
    expect(table.length).toBeCloseTo(bsplineLength(curve), 9)
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (f) => {
        const distance = f * table.length
        expect(table.paramAt(distance)).toBeCloseTo(
          bsplineParamAtLength(curve, distance),
          9
        )
      })
    )
    const { start, end } = bsplineDomain(curve)
    expect(table.paramAt(-1)).toBe(start)
    expect(table.paramAt(table.length + 1)).toBe(end)
  })
})

function distanceToSegment(q: Vec2, a: Vec2, b: Vec2): number {
  const ab = V.sub(b, a)
  const t = Math.max(0, Math.min(1, V.dot(V.sub(q, a), ab) / V.lengthSq(ab)))
  return V.distance(q, V.add(a, V.scale(ab, t)))
}

describe("rational curves", () => {
  // A quarter of the unit circle: the rational quadratic a circle is made of.
  const QUARTER = {
    degree: 2,
    knots: [0, 0, 0, 1, 1, 1],
    controlPoints: [p(1, 0), p(1, 1), p(0, 1)],
    weights: [1, Math.SQRT1_2, 1],
  }

  it("lies on the circle its weights make", () => {
    for (const u of [0, 0.1, 0.25, 0.5, 0.8, 1]) {
      expect(V.length(bsplinePoint(QUARTER, u))).toBeCloseTo(1, 14)
    }
  })

  it("differentiates as the quotient of its homogeneous form", () => {
    const { first, second } = bsplineDifferentials(QUARTER)
    const h = 1e-5
    for (const u of [0.1, 0.4, 0.7]) {
      const ahead = bsplinePoint(QUARTER, u + h)
      const behind = bsplinePoint(QUARTER, u - h)
      expect(first(u)).toBeCloseToPoint(
        V.scale(V.sub(ahead, behind), 0.5 / h),
        6
      )
      const d1Ahead = first(u + h)
      const d1Behind = first(u - h)
      expect(second(u)).toBeCloseToPoint(
        V.scale(V.sub(d1Ahead, d1Behind), 0.5 / h),
        5
      )
    }
  })

  it("measures its length and sweeps its sector", () => {
    expect(bsplineLength(QUARTER)).toBeCloseTo(Math.PI / 2, 12)
    expect(bsplineSweptArea(QUARTER, 0, 1)).toBeCloseTo(Math.PI / 4, 12)
    const half = bsplineParamAtLength(QUARTER, Math.PI / 4)
    expect(bsplinePoint(QUARTER, half)).toBeCloseToPoint(
      p(Math.SQRT1_2, Math.SQRT1_2),
      10
    )
  })

  it("is its control polygon's curve when every weight is 1", () => {
    const plain = clampedUniformCurve(ZIGZAG, 3)
    const weighed = { ...plain, weights: ZIGZAG.map(() => 1) }
    for (const u of [0, 0.3, 1.2, 1.9]) {
      expect(bsplinePoint(weighed, u)).toBeCloseToPoint(
        bsplinePoint(plain, u),
        12
      )
      expect(bsplineDerivative(weighed, u)).toBeCloseToPoint(
        bsplineDerivative(plain, u),
        10
      )
    }
  })
})

describe("periodic curves as AutoCAD holds them", () => {
  const loop = [p(0, 0), p(50, 100), p(150, 100), p(200, 0), p(260, 60)]

  it("runs one period of its knots, closing smoothly on any spacing", () => {
    const curve = periodicCurve(loop, 3, [2, 3, 7, 8, 12, 15])
    expect(bsplineDomain(curve)).toEqual({ start: 2, end: 15 })
    expect(bsplinePoint(curve, 15)).toBeCloseToPoint(bsplinePoint(curve, 2))
    expect(bsplineDerivative(curve, 15)).toBeCloseToPoint(
      bsplineDerivative(curve, 2)
    )
  })

  it("gives back its loop and period unwrapped", () => {
    const knots = [2, 3, 7, 8, 12, 15]
    const weights = [1, 2, 3, 4, 5]
    expect(periodicLoop(periodicCurve(loop, 3, knots, weights))).toEqual({
      degree: 3,
      knots,
      controlPoints: loop,
      weights,
    })
  })
})

describe("JOIN's curves", () => {
  const near = (a: Vec3, b: Vec3) => {
    expect(a.x).toBeCloseTo(b.x, 9)
    expect(a.y).toBeCloseTo(b.y, 9)
    expect(a.z).toBeCloseTo(b.z, 9)
  }

  it("raises a degree-2 curve to 3, each knot once more (pieces/p433)", () => {
    const curve = clampedUniformCurve(
      [p(50, 0), p(60, -20), p(75, -20), p(90, -20), p(100, 0)],
      2
    )
    const raised = bsplineElevated(curve, 3)
    expect(raised.knots).toEqual([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 3, 3])
    const expected = [
      p(50, 0),
      p(56.66666667, -13.33333333),
      p(62.5, -20),
      p(72.5, -20),
      p(77.5, -20),
      p(87.5, -20),
      p(93.33333333, -13.33333333),
      p(100, 0),
    ]
    raised.controlPoints.forEach((q, i) => {
      expect(q.x).toBeCloseTo(expected[i].x, 7)
      expect(q.y).toBeCloseTo(expected[i].y, 7)
    })
  })

  it("keeps the curve it raises, a rational one too", () => {
    fc.assert(
      fc.property(
        fc.array(point, { minLength: 4, maxLength: 7 }),
        fc.array(fc.double({ min: 0.2, max: 3, noNaN: true }), {
          minLength: 7,
          maxLength: 7,
        }),
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 2 }),
        (points, w, degree, t) => {
          const curve = {
            ...clampedUniformCurve(points, degree),
            weights: w.slice(0, points.length),
          }
          const raised = bsplineElevated(curve, degree + t)
          const { start, end } = bsplineDomain(curve)
          for (let i = 0; i <= 8; i++) {
            const u = start + ((end - start) * i) / 8
            near(bsplinePoint(raised, u), bsplinePoint(curve, u))
          }
        }
      )
    )
  })

  it("runs a curve backwards on the same interval", () => {
    const curve = clampedUniformCurve(
      [p(0, 0), p(10, 20), p(40, 20), p(50, 0), p(60, 5)],
      3
    )
    const back = bsplineReversed(curve)
    near(bsplinePoint(back, 0.5), bsplinePoint(curve, 1.5))
  })

  it("makes an arc's spline in quarter turns, a knot of 2 between (p375, p424)", () => {
    const arc = conicArcCurve(p(0, 0), p(50, 0), p(0, 50), 0, Math.PI / 2)
    expect(arc.knots).toEqual([0, 0, 0, Math.PI / 2, Math.PI / 2, Math.PI / 2])
    expect(arc.weights).toEqual([1, Math.SQRT1_2, 1])
    near(arc.controlPoints[1], p(50, 50))
    const long = conicArcCurve(
      p(75, 0),
      p(25, 0),
      p(0, 25),
      Math.PI,
      (100 * Math.PI) / 180
    )
    expect(
      long.knots.filter((k) => k > 0 && k < long.knots.at(-1)!)
    ).toHaveLength(2)
    expect(long.weights![1]).toBeCloseTo(Math.cos((25 * Math.PI) / 180), 12)
    near(
      bsplinePoint(long, (50 * Math.PI) / 180),
      p(
        75 + 25 * Math.cos((230 * Math.PI) / 180),
        25 * Math.sin((230 * Math.PI) / 180)
      )
    )
  })

  it("joins pieces from 0, each its own length, a knot of the degree between (p375)", () => {
    const ellipse = conicArcCurve(
      p(0, 75),
      p(0, -25),
      p(10, 0),
      Math.PI,
      Math.PI
    )
    const arc = bsplineReversed(
      conicArcCurve(p(0, 0), p(50, 0), p(0, 50), 0, Math.PI / 2)
    )
    const joined = bsplineJoined([ellipse, arc])
    expect(joined.degree).toBe(2)
    const h = Math.PI / 2
    joined.knots.forEach((k, i) =>
      expect(k).toBeCloseTo(
        [0, 0, 0, h, h, 2 * h, 2 * h, 3 * h, 3 * h, 3 * h][i],
        12
      )
    )
    expect(joined.weights).toEqual([
      1,
      Math.SQRT1_2,
      1,
      Math.SQRT1_2,
      1,
      Math.SQRT1_2,
      1,
    ])
    near(joined.controlPoints[0], p(0, 100))
    near(joined.controlPoints[5], p(50, 50))
  })
})
