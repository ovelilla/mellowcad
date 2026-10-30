import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { p } from "../../test/builders"
import { point } from "../../test/arbitraries"
import { V, type Vec2 } from "../geometry/Vec2"
import {
  type BSplineCurve,
  bsplineDerivative,
  bsplineDerivativeCurve,
  bsplineDomain,
  bsplinePoint,
} from "../geometry/nurbs"
import {
  type SplineOptions,
  closestPointOnSpline,
  createSpline,
  splineArea,
  splineCurve,
  splineEndPoint,
  splineLength,
  splineMidpoint,
  splineStartPoint,
} from "./splines"
import {
  mirrorEntity,
  rotateEntity,
  scaleEntity,
  translateEntity,
} from "./entityTransforms"
import type { SplineEntity } from "./entityTypes"

/** What AutoCAD's console prints, to its decimals: the comparison is the printout. */
const printed = (value: number, decimals: number) =>
  (value + 0).toFixed(decimals)

// Every open fit spline the review drew in AutoCAD 2027, its fit points and
// stored tangents as MPDUMP read them, and the control points AutoCAD solved:
// natural free ends (C″ = 0), a given tangent the derivative at the raw knot
// parameter (probes spline/p01, p300, p301, p302, p306, p308).
const OPEN_FITS: [string, Vec2[], SplineOptions, Vec2[]][] = [
  [
    "p01#0",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    {},
    [
      p(0, 0),
      p(3.333333333, 5.555555556),
      p(10, 16.666666667),
      p(20, -6.666666667),
      p(26.666666667, 4.444444444),
      p(30, 10),
    ],
  ],
  [
    "p300#0",
    [p(0, 0), p(10, 5)],
    {},
    [
      p(0, 0),
      p(3.333333333, 1.666666667),
      p(6.666666667, 3.333333333),
      p(10, 5),
    ],
  ],
  [
    "p300#1",
    [p(0, 0), p(10, 10), p(20, 0)],
    {},
    [p(0, 0), p(3.333333333, 5), p(10, 15), p(16.666666667, 5), p(20, 0)],
  ],
  [
    "p300#2",
    [p(0, 0), p(3, 4), p(20, 4), p(25, -8), p(40, 0)],
    {},
    [
      p(0, 0),
      p(0.868406105, 1.426583893),
      p(4.689392969, 7.703553024),
      p(22.927511563, 9.073288539),
      p(22.966333149, -14.603130659),
      p(33.838886458, -5.28198343),
      p(40, 0),
    ],
  ],
  [
    "p300#3",
    [p(0, 0), p(1, 7), p(15, 9), p(16, 0)],
    {},
    [
      p(0, 0),
      p(-0.154928142, 2.553044092),
      p(-0.61971257, 10.212176369),
      p(17.527676021, 12.67630634),
      p(16.428913127, 3.559023066),
      p(16, 0),
    ],
  ],
  [
    "p300#4",
    [p(0, 0), p(4, 8), p(20, 0), p(40, 10)],
    {},
    [
      p(0, 0),
      p(1.093333333, 3.493333333),
      p(4.373333333, 13.973333333),
      p(22.266666667, -7.733333333),
      p(33.666666667, 3.666666667),
      p(40, 10),
    ],
  ],
  [
    "p301#0",
    [p(0, 0), p(3, 4), p(20, 4), p(25, -8), p(40, 0)],
    { knots: "sqrtChord" },
    [
      p(0, 0),
      p(0.46611666, 1.405931881),
      p(1.791709972, 5.40427406),
      p(24.167378265, 8.909383864),
      p(22.064112065, -14.355047485),
      p(33.76029006, -4.993972577),
      p(40, 0),
    ],
  ],
  [
    "p301#1",
    [p(0, 0), p(3, 4), p(20, 4), p(25, -8), p(40, 0)],
    { knots: "uniform" },
    [
      p(0, 0),
      p(-0.595238095, 1.285714286),
      p(-1.785714286, 3.857142857),
      p(25.142857143, 8.571428571),
      p(21.214285714, -14.142857143),
      p(33.738095238, -4.714285714),
      p(40, 0),
    ],
  ],
  [
    "p301#2",
    [p(0, 0), p(10, 10), p(20, 0)],
    { knots: "sqrtChord" },
    [p(0, 0), p(3.333333333, 5), p(10, 15), p(16.666666667, 5), p(20, 0)],
  ],
  [
    "p301#3",
    [p(0, 0), p(1, 7), p(15, 9), p(16, 0)],
    { knots: "uniform" },
    [
      p(0, 0),
      p(-1.111111111, 2.533333333),
      p(-3.333333333, 7.6),
      p(19.333333333, 11.6),
      p(17.111111111, 3.866666667),
      p(16, 0),
    ],
  ],
  [
    "p302#0",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { startTangent: p(1, 0) },
    [
      p(0, 0),
      p(4.714045208, 0),
      p(9.362748366, 19.230769231),
      p(20.159312909, -7.307692308),
      p(26.71977097, 4.230769231),
      p(30, 10),
    ],
  ],
  [
    "p302#1",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { startTangent: p(100, 0) },
    [
      p(0, 0),
      p(471.404520791, 0),
      p(-206.03285575, 19.230769231),
      p(74.008213937, -7.307692308),
      p(44.669404646, 4.230769231),
      p(30, 10),
    ],
  ],
  [
    "p302#2",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { endTangent: p(1, 0) },
    [
      p(0, 0),
      p(3.28022903, 5.769230769),
      p(9.840687091, 17.307692308),
      p(20.637251634, -9.230769231),
      p(25.285954792, 10),
      p(30, 10),
    ],
  ],
  [
    "p302#3",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { startTangent: p(0, 5), endTangent: p(0, 1) },
    [
      p(0, 0),
      p(0, 23.57022604),
      p(12, 8.37202182),
      p(18, -4.657415431),
      p(30, 5.285954792),
      p(30, 10),
    ],
  ],
  [
    "p302#4",
    [p(0, 0), p(3, 4), p(20, 4), p(25, -8), p(40, 0)],
    { startTangent: p(3, 4) },
    [
      p(0, 0),
      p(5, 6.666666667),
      p(-2.138989711, -0.956855373),
      p(24.849382614, 11.51078933),
      p(22.382908009, -15.343086257),
      p(33.627860344, -5.549626944),
      p(40, 0),
    ],
  ],
  [
    "p306#1",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { knots: "uniform", startTangent: p(1, 0), endTangent: p(0, 1) },
    [
      p(0, 0),
      p(0.333333333, 0),
      p(11.844444444, 19.955555556),
      p(18.044444444, -9.844444444),
      p(30, 9.666666667),
      p(30, 10),
    ],
  ],
  [
    "p306#2",
    [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
    { knots: "sqrtChord", startTangent: p(2, 0), endTangent: p(0, -1) },
    [
      p(0, 0),
      p(2.507068729, 0),
      p(10.830034593, 20.167137915),
      p(18.33427583, -10.584982703),
      p(30, 11.253534364),
      p(30, 10),
    ],
  ],
  [
    "p308#0",
    [p(10, 10), p(20, 20), p(30, 10), p(40, 20)],
    { startTangent: p(1, 0) },
    [
      p(10, 10),
      p(14.714045208, 10),
      p(19.362748366, 29.230769231),
      p(30.159312909, 2.692307692),
      p(36.71977097, 14.230769231),
      p(40, 20),
    ],
  ],
  [
    "p308#1",
    [p(10, 10), p(20, 20), p(30, 10), p(40, 20)],
    { startTangent: p(0, 5), endTangent: p(0, 1) },
    [
      p(10, 10),
      p(10, 33.57022604),
      p(22, 18.37202182),
      p(28, 5.342584569),
      p(40, 15.285954792),
      p(40, 20),
    ],
  ],
]

describe("a fit spline's curve is AutoCAD's", () => {
  it.each(OPEN_FITS)(
    "solves %s's control points",
    (_, points, options, controlPoints) => {
      const curve = splineCurve(createSpline("fit", points, options))
      expect(curve.controlPoints).toBeCloseToPoints(controlPoints, 8)
    }
  )

  // probe spline/p01: knots the raw chord sums, 0 · 14.142136 · 28.284271 ·
  // 42.426407, clamped.
  it("keeps the raw knots LIST reports", () => {
    const curve = splineCurve(
      createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)])
    )
    const r = Math.SQRT2 * 10
    expect(curve.knots).toEqual([
      0,
      0,
      0,
      0,
      expect.closeTo(r, 12),
      expect.closeTo(2 * r, 12),
      ...Array(4).fill(expect.closeTo(3 * r, 12)),
    ])
  })

  it("has no curvature at a free end and the stored tangent at a given one", () => {
    fc.assert(
      fc.property(
        fc.array(point, { minLength: 3, maxLength: 6 }),
        point,
        (raw, tangent) => {
          const points = raw.filter(
            (q, i) => i === 0 || V.distance(q, raw[i - 1]) > 1
          )
          fc.pre(points.length >= 3 && V.length(tangent) > 1e-3)
          const curve = splineCurve(
            createSpline("fit", points, { startTangent: tangent })
          )
          const { start, end } = bsplineDomain(curve)
          const scale = Math.max(1, V.length(tangent))
          const d = bsplineDerivative(curve, start)
          expect(V.distance(d, tangent) / scale).toBeLessThan(1e-6)
          const second = bsplineDerivative(bsplineDerivativeCurve(curve), end)
          const size = Math.max(...curve.controlPoints.map((q) => V.length(q)))
          expect(V.length(second) / Math.max(1, size)).toBeLessThan(1e-6)
        }
      )
    )
  })

  // probes spline/p303, p307, p311: a closed fit spline is periodic on n
  // control points, its knots the raw chords round the loop, and starts on
  // its first fit point: the curve AutoCAD's CVs and knots make.
  it.each([
    [
      "p303",
      [p(0, 0), p(10, 10), p(20, 0)],
      {},
      [0, 14.142135623730951, 28.284271247461902, 48.2842712474619],
      [
        p(29.428090416, -5.224077499),
        p(-9.428090416, -5.224077499),
        p(10, 16.306019375),
      ],
    ],
    [
      "p307#0",
      [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
      {},
      [
        0, 14.142135623730951, 28.284271247461902, 42.42640687119285,
        74.04918347287665,
      ],
      [
        p(18, -8.472135955),
        p(43.416407865, 25.259029213),
        p(-13.416407865, -15.259029213),
        p(12, 18.472135955),
      ],
    ],
    [
      "p307#1",
      [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
      { knots: "uniform" as const },
      [0, 1, 2, 3, 4],
      [p(15, -10), p(45, 20), p(-15, -10), p(15, 20)],
    ],
    [
      "p307#2",
      [p(0, 0), p(3, 4), p(20, 4), p(25, -8), p(40, 0)],
      { knots: "sqrtChord" as const },
      [
        0, 2.23606797749979, 6.3591736031174495, 9.964724878581439,
        14.0878305041991, 20.41238582453586,
      ],
      [
        p(24.537632042, 9.044596405),
        p(19.178124332, -15.289388151),
        p(59.508333013, 7.879881096),
        p(-6.912322184, -4.340571636),
        p(3.548702547, 5.914421335),
      ],
    ],
    [
      "p311",
      [p(0, 0), p(20, 0), p(20, 20), p(0, 20)],
      {},
      [0, 20, 40, 60, 80],
      [p(25, 25), p(-5, 25), p(-5, -5), p(25, -5)],
    ],
  ])("closes %s as AutoCAD does", (_, points, options, knots, cvs) => {
    const spline = createSpline("fit", points, { ...options, closed: true })
    const curve = splineCurve(spline)
    const n = cvs.length
    const period = knots[n]
    const theirs: BSplineCurve = {
      degree: 3,
      knots: Array.from({ length: n + 7 }, (_, i) => {
        const j = i - 3
        const turns = Math.floor(j / n)
        return knots[j - turns * n] + turns * period
      }),
      // Its CV i is the one whose basis starts at knot i, three past ours.
      controlPoints: Array.from({ length: n + 3 }, (_, i) => ({
        ...cvs[(i - 3 + 3 * n) % n],
        z: 0,
      })),
    }
    expect(bsplineDomain(curve)).toEqual({
      start: 0,
      end: expect.closeTo(period, 9),
    })
    for (let k = 0; k <= 20; k++) {
      const u = (period * k) / 20
      expect(bsplinePoint(curve, u)).toBeCloseToPoint(
        bsplinePoint(theirs, u),
        8
      )
    }
    expect(splineStartPoint(spline)).toBeCloseToPoint(points[0], 9)
  })

  // probe spline/p307#3: SPLINE drops a start tangent at Close; a file may
  // still hold one, and the loop then leaves and returns along it.
  it("closes a filed spline with a start tangent along it", () => {
    const spline = createSpline("fit", [p(0, 0), p(10, 10), p(20, 0)], {
      closed: true,
      startTangent: p(0, 3),
    })
    const curve = splineCurve(spline)
    const { start, end } = bsplineDomain(curve)
    expect(bsplineDerivative(curve, start)).toBeCloseToPoint(p(0, 3), 9)
    expect(bsplineDerivative(curve, end)).toBeCloseToPoint(p(0, 3), 9)
    expect(splineEndPoint(spline)).toBeCloseToPoint(p(0, 0), 9)
  })
})

describe("a CV spline's degree and start", () => {
  // probe spline/p304: an open one drops to vertices − 1.
  it.each([
    [10, 3, 2],
    [4, 2, 1],
    [5, 5, 4],
  ])("open, degree %i on %i vertices is %i", (degree, count, lowered) => {
    const points = [p(0, 0), p(10, 10), p(20, 0), p(30, 10), p(40, 0)]
    const spline = createSpline("cv", points.slice(0, count), { degree })
    expect(spline.degree).toBe(lowered)
    expect(splineCurve(spline).degree).toBe(lowered)
  })

  // probes spline/p305, p129, p146: a closed one drops to the vertex count.
  it.each([
    [3, 3, 3],
    [5, 4, 4],
  ])("closed, degree %i on %i vertices is %i", (degree, count, lowered) => {
    const points = [p(0, 0), p(10, 10), p(20, 0), p(30, 10)]
    const spline = createSpline("cv", points.slice(0, count), {
      degree,
      closed: true,
    })
    expect(spline.degree).toBe(lowered)
    expect(splineCurve(spline).degree).toBe(lowered)
  })

  // probe spline/p305: MPDUMP's StartPoint of five closed CV splines; p311
  // the square's `_END`, 46.66666667,16.66666667.
  it.each([
    [3, 4, p(20, 3.333333333)],
    [3, 3, p(10, 6.666666667)],
    [2, 4, p(25, 5)],
    [1, 3, p(20, 0)],
    [5, 4, p(15, 5)],
  ])(
    "closed, degree %i on %i vertices starts where AutoCAD's does",
    (degree, count, start) => {
      const points = [p(0, 0), p(10, 10), p(20, 0), p(30, 10)]
      const spline = createSpline("cv", points.slice(0, count), {
        degree,
        closed: true,
      })
      expect(spline.points).toBeCloseToPoints(points.slice(0, count))
      expect(splineStartPoint(spline)).toBeCloseToPoint(start, 8)
      expect(splineEndPoint(spline)).toBeCloseToPoint(start, 8)
    }
  )

  it("starts the closed square of p311 at its End snap", () => {
    const square = createSpline(
      "cv",
      [p(30, 0), p(50, 0), p(50, 20), p(30, 20)],
      { closed: true }
    )
    expect(splineStartPoint(square)).toBeCloseToPoint(
      p(46.66666667, 16.66666667),
      8
    )
  })
})

describe("a transformed fit spline keeps AutoCAD's curve", () => {
  const WITH_TANGENTS = (options: SplineOptions = {}) =>
    createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
      startTangent: p(3, 4),
      ...options,
    })

  // probe spline/p321: ROTATE 90 about 0,0, SCALE 2 about 0,0 and MOVE 5,5
  // of a spline with a start tangent 3,4 (and, scaled, an end one 0,1):
  // AutoCAD's control points afterwards.
  it("rotates, scales and moves as p321", () => {
    const rotated = rotateEntity(WITH_TANGENTS(), p(0, 0), Math.PI / 2)
    expect(
      splineCurve(rotated as SplineEntity).controlPoints
    ).toBeCloseToPoints(
      [
        p(0, 0),
        p(-18.856180832, 14.142135624),
        p(-10.527916539, 5.01132202),
        p(5.131979135, 21.247169495),
        p(-4.956006955, 27.082389832),
        p(-10, 30),
      ],
      8
    )
    const scaled = scaleEntity(
      WITH_TANGENTS({ endTangent: p(0, 1) }),
      p(0, 0),
      2
    )
    expect(splineCurve(scaled as SplineEntity).controlPoints).toBeCloseToPoints(
      [
        p(0, 0),
        p(28.284271247, 37.712361663),
        p(10.800673418, 21.143819168),
        p(39.771236166, -10.571909584),
        p(60, 10.571909584),
        p(60, 20),
      ],
      8
    )
    const moved = translateEntity(WITH_TANGENTS(), p(5, 5))
    expect(splineCurve(moved as SplineEntity).controlPoints).toBeCloseToPoints(
      [
        p(5, 5),
        p(19.142135624, 23.856180832),
        p(10.01132202, 15.527916539),
        p(26.247169495, -0.131979135),
        p(32.082389832, 9.956006955),
        p(35, 15),
      ],
      8
    )
  })

  it.each(["chord", "sqrtChord", "uniform"] as const)(
    "scaled with %s knots, its curve is the scaled curve",
    (knots) => {
      const spline = WITH_TANGENTS({ knots, endTangent: p(0, -1) })
      const base = p(7, -3)
      const factor = 2.5
      const scaled = scaleEntity(spline, base, factor) as SplineEntity
      const before = splineCurve(spline)
      const after = splineCurve(scaled)
      const from = bsplineDomain(before)
      const to = bsplineDomain(after)
      for (const f of [0, 0.13, 0.4, 0.77, 1]) {
        const at = bsplinePoint(
          before,
          from.start + f * (from.end - from.start)
        )
        expect(
          bsplinePoint(after, to.start + f * (to.end - to.start))
        ).toBeCloseToPoint(V.add(base, V.scale(V.sub(at, base), factor)), 8)
      }
    }
  )

  it("mirrors its tangents as vectors", () => {
    const spline = WITH_TANGENTS({ endTangent: p(0, 1) })
    const mirrored = mirrorEntity(spline, p(50, 0), p(50, 10)) as SplineEntity
    expect(mirrored.startTangent).toBeCloseToPoint(p(-3, 4))
    expect(mirrored.endTangent).toBeCloseToPoint(p(0, 1))
  })
})

describe("a spline's measures", () => {
  const CV_OPEN = () =>
    createSpline("cv", [p(0, -5), p(5, 10), p(20, -10), p(40, 5)])
  const BOWTIE = () =>
    createSpline("cv", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
      closed: true,
    })
  const FIT_SQUARE = () =>
    createSpline("fit", [p(0, 0), p(20, 0), p(20, 20), p(0, 20)], {
      closed: true,
    })

  // probe spline/p327: AREA Object `Area = 85.84165405, Length = 44.39570038`
  // (LIST the same length): the two loops the chord cuts off, added. The
  // length is the curve's own, 44.39441982 by a quadrature of a thousand
  // pieces outside the engine: AutoCAD's runs long by its integrator's error,
  // which grows as the cube of the range — p332's straight CV spline 30 long
  // measures 30.00062816 there.
  it("sums the loops an open spline makes with its chord", () => {
    expect(printed(splineArea(CV_OPEN()), 8)).toBe("85.84165405")
    expect(printed(splineLength(CV_OPEN()), 10)).toBe("44.3944198167")
  })

  // probe spline/p332: a straight CV spline, its length the distance.
  it("measures a straight spline as the distance it spans", () => {
    const straight = createSpline("cv", [p(0, 0), p(1, 0), p(2, 0), p(30, 0)])
    expect(splineLength(straight)).toBeCloseTo(30, 12)
  })

  // probe spline/p317: `Area = 39.7222, Perimeter = 42.5520` for the closed
  // bowtie, whose two loops cancel in a signed sum.
  it("sums the loops a closed spline makes crossing itself", () => {
    expect(printed(splineArea(BOWTIE()), 4)).toBe("39.7222")
    expect(printed(splineLength(BOWTIE()), 4)).toBe("42.5520")
  })

  // probe spline/p327: `Area = 610.00000000, Perimeter = 87.61720462`; the
  // curve's perimeter is 87.6172046000 (quadrature outside the engine).
  it("measures a closed fit spline on its curve", () => {
    expect(printed(splineArea(FIT_SQUARE()), 8)).toBe("610.00000000")
    expect(printed(splineLength(FIT_SQUARE()), 7)).toBe("87.6172046")
  })

  // probes spline/p311 (the closed squares): `_MID` halfway along from the
  // start; p310 (the open CV spline 0,0 5,15 20,-5 40,10) and p312 (the fit
  // spline 0,0 4,8 20,0 40,10) give 19.15356356,4.27082073 and
  // 18.25785084,0.77956010, halfway along by AutoCAD's long measure (p332):
  // the curve's halfway points are these, found outside the engine.
  it.each([
    [
      "p310",
      createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)]),
      p(19.1531153726, 4.2708692909),
    ],
    [
      "p312",
      createSpline("fit", [p(0, 0), p(4, 8), p(20, 0), p(40, 10)]),
      p(18.2578183056, 0.7795770953),
    ],
    ["p311 fit", FIT_SQUARE(), p(20, 20)],
    [
      "p311 CV",
      createSpline("cv", [p(30, 0), p(50, 0), p(50, 20), p(30, 20)], {
        closed: true,
      }),
      p(33.33333333, 3.33333333),
    ],
  ])("finds %s's midpoint halfway along", (_, spline, mid) => {
    expect(splineMidpoint(spline)).toBeCloseToPoint(mid, 8)
  })

  // probes spline/p310 `_NEA to 15,5.3`, p312 `_NEA to 20.1,0.2`.
  it.each([
    [
      "p310",
      createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)]),
      p(15, 5.3),
      p(14.9287054, 4.90021635),
    ],
    [
      "p312",
      createSpline("fit", [p(0, 0), p(4, 8), p(20, 0), p(40, 10)]),
      p(20.1, 0.2),
      p(20.02458355, -0.00890712),
    ],
  ])("finds %s's nearest point on the curve", (_, spline, from, nearest) => {
    expect(closestPointOnSpline(spline, from).point).toBeCloseToPoint(
      nearest,
      8
    )
  })

  it("never returns a point nearer than the curve comes", () => {
    fc.assert(
      fc.property(
        fc.array(point, { minLength: 3, maxLength: 5 }),
        point,
        (points, from) => {
          const spline = createSpline("cv", points)
          const found = closestPointOnSpline(spline, from)
          const curve = splineCurve(spline)
          const { start, end } = bsplineDomain(curve)
          const u = start + found.t * (end - start)
          expect(found.point).toBeCloseToPoint(bsplinePoint(curve, u), 9)
        }
      )
    )
  })
})
