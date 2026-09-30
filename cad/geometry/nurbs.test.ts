import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { V, type Vec2 } from "./Vec2"
import {
  besselStartDerivative,
  bsplineDerivative,
  bsplineDomain,
  bsplinePoint,
  bsplineTessellation,
  clampedUniformCurve,
  fitParameters,
  interpolateCubic,
  interpolatePeriodicCubic,
  periodicUniformCurve,
} from "./nurbs"
import { p } from "../../test/builders"
import { point } from "../../test/arbitraries"

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

  it("step by one on the uniform method, with a closing value when closed", () => {
    expect(fitParameters([p(0, 0), p(4, 0), p(4, 9)], "uniform", true)).toEqual(
      [0, 1, 2, 3]
    )
  })
})

describe("cubic interpolation", () => {
  it("passes through every fit point with n + 2 control points", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(
      ZIGZAG,
      params,
      besselStartDerivative(ZIGZAG, params),
      p(1, 0)
    )
    expect(curve.degree).toBe(3)
    expect(curve.controlPoints).toHaveLength(ZIGZAG.length + 2)
    ZIGZAG.forEach((q, i) => {
      expect(bsplinePoint(curve, params[i])).toBeCloseToPoint(q, 6)
    })
  })

  it("leaves along the given start derivative", () => {
    const params = fitParameters(ZIGZAG, "chord", false)
    const curve = interpolateCubic(ZIGZAG, params, p(0, 1), p(1, 0))
    const d = bsplineDerivative(curve, params[0])
    expect(V.normalize(d)).toBeCloseToPoint(p(0, 1), 6)
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
        const curve = interpolateCubic(
          points,
          params,
          besselStartDerivative(points, params),
          V.sub(points[points.length - 1], points[points.length - 2])
        )
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
    const curve = interpolateCubic(
      ZIGZAG,
      params,
      besselStartDerivative(ZIGZAG, params),
      p(1, 0)
    )
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

function distanceToSegment(q: Vec2, a: Vec2, b: Vec2): number {
  const ab = V.sub(b, a)
  const t = Math.max(0, Math.min(1, V.dot(V.sub(q, a), ab) / V.lengthSq(ab)))
  return V.distance(q, V.add(a, V.scale(ab, t)))
}
