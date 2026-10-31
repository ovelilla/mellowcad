import { describe, expect, it } from "vitest"
import {
  type EllipseEntity,
  type Entity,
  type SplineEntity,
  createSpline,
  isFullEllipse,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  deg,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"
import { es } from "../../locales/es"

// JOIN of splines and elliptical arcs, as AutoCAD 2027's console leaves them
// (probes pieces/p331, p332, p369, p374, p375, p396–p440, MPDUMP): each
// object a curve on its own parameter, joined end to end from 0.

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const CROSSING = ["_C", "-120,-120", "120,120", ""]
const joined = (cad: CadHarness, ...answers: string[]) =>
  answer(cad, "_JOIN", ...answers)

const harness = (...entities: Entity[]) =>
  createHarness({ entities: entities.map((entity) => ({ ...entity })) })

/** The probes' fit splines: through 0,0 25,20 50,0, and on to 100,0 below. */
const fitA = (id = "A") =>
  createSpline("fit", [p(0, 0), p(25, 20), p(50, 0)], { id })
const fitB = (id = "B") =>
  createSpline("fit", [p(50, 0), p(75, -20), p(100, 0)], { id })
/** The probes' CV spline on 0,0 10,20 40,20 50,0. */
const cvA = (id = "A") =>
  createSpline("cv", [p(0, 0), p(10, 20), p(40, 20), p(50, 0)], { id })
/** The ellipse of 50 by 25 at the origin, between two of its parameters. */
const quarter = (id: string, from: number, to: number) =>
  ellipseOf(p(0, 0), p(50, 0), 0.5, { id, startParam: from, endParam: to })

/** The parameter of the point at `angle` round an ellipse of 50 by 25 at the origin. */
const paramAt = (angle: number) =>
  Math.atan2(Math.sin(angle), 0.5 * Math.cos(angle))

const CHORD = Math.hypot(25, 20)
const W3 = (1 + Math.SQRT2) / 3

function expectCurve(
  spline: SplineEntity,
  points: readonly (readonly number[])[],
  knots: readonly number[],
  weights?: readonly number[]
): void {
  expect(spline).toMatchObject({ method: "cv", closed: false })
  expect(spline.points).toHaveLength(points.length)
  spline.points.forEach((q, i) => {
    expect(q.x).toBeCloseTo(points[i][0], 7)
    expect(q.y).toBeCloseTo(points[i][1], 7)
    expect(q.z).toBeCloseTo(points[i][2] ?? 0, 7)
  })
  expect(spline.knotVector).toHaveLength(knots.length)
  spline.knotVector!.forEach((k, i) => expect(k).toBeCloseTo(knots[i], 7))
  if (!weights) expect(spline.weights).toBeUndefined()
  else spline.weights!.forEach((w, i) => expect(w).toBeCloseTo(weights[i], 9))
}

const splines = (cad: CadHarness) =>
  cad.entities().filter((e): e is SplineEntity => e.type === "spline")

describe("JOIN with splines", () => {
  it("joins two fit splines into the first picked, a CV spline (p396)", () => {
    const cad = joined(harness(fitA(), fitB()), "25,20", "75,-20", "")
    expect(cad.commandLog().at(-1)).toBe("2 objects joined into 1 spline")
    expect(cad.entityCount).toBe(1)
    expectCurve(
      cad.byId<SplineEntity>("A"),
      [
        [0, 0],
        [8.333333333, 10],
        [25, 30],
        [41.66666667, 10],
        [50, 0],
        [58.33333333, -10],
        [75, -30],
        [91.66666667, -10],
        [100, 0],
      ],
      [
        0,
        0,
        0,
        0,
        CHORD,
        2 * CHORD,
        2 * CHORD,
        2 * CHORD,
        3 * CHORD,
        4 * CHORD,
        4 * CHORD,
        4 * CHORD,
        4 * CHORD,
      ]
    )
    expect(cad.byId<SplineEntity>("A").startTangent).toBeUndefined()
  })

  it("runs the source's way, the other turned round (p397, p331)", () => {
    const back = createSpline("fit", [p(100, 0), p(75, -20), p(50, 0)], {
      id: "B",
    })
    const cad = joined(harness(fitA(), back), "75,-20", "25,20", "")
    const spline = cad.byId<SplineEntity>("B")
    expect(spline.points[0]).toMatchObject({ x: 100, y: 0 })
    expect(spline.points.at(-1)!.x).toBeCloseTo(0, 9)

    // A crossing finds the newest first, the source (p331).
    const crossing = joined(harness(fitA(), fitB()), ...CROSSING)
    expect(crossing.runtime.document.get("A")).toBeUndefined()
    expect(crossing.byId<SplineEntity>("B").points[0]).toMatchObject({
      x: 0,
      y: 0,
    })
  })

  it("raises a line before it on [0, 1], weighted (p374, p399)", () => {
    const cad = joined(
      harness(lineOf(p(-50, 0), p(0, 0), { id: "L" }), fitA("S")),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe("2 objects joined into 1 spline")
    expectCurve(
      cad.byId<SplineEntity>("S"),
      [
        [-50, 0],
        [-33.33333333, 0],
        [-16.66666667, 0],
        [0, 0],
        [8.333333333, 10],
        [25, 30],
        [41.66666667, 10],
        [50, 0],
      ],
      [
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1 + CHORD,
        1 + 2 * CHORD,
        1 + 2 * CHORD,
        1 + 2 * CHORD,
        1 + 2 * CHORD,
      ],
      new Array(8).fill(1)
    )

    // The line picked first, and drawn the other way: the spline is the source.
    const first = joined(
      harness(fitA("S"), lineOf(p(100, 0), p(50, 0), { id: "L" })),
      "75,0",
      "25,20",
      ""
    )
    expect(first.runtime.document.get("L")).toBeUndefined()
    expect(first.byId<SplineEntity>("S").points.at(-1)).toMatchObject({
      x: 100,
      y: 0,
    })
  })

  it("raises an arc's quarters, their weights too (p400)", () => {
    const cad = joined(
      harness(cvA("S"), arcOf(p(75, 0), 25, deg(180), deg(360), { id: "R" })),
      ...CROSSING
    )
    expectCurve(
      cad.byId<SplineEntity>("S"),
      [
        [0, 0],
        [10, 20],
        [40, 20],
        [50, 0],
        [50, -14.64466094],
        [60.35533906, -25],
        [75, -25],
        [89.64466094, -25],
        [100, -14.64466094],
        [100, 0],
      ],
      [
        0, 0, 0, 0, 1, 1, 1, 2.570796327, 2.570796327, 2.570796327, 4.141592654,
        4.141592654, 4.141592654, 4.141592654,
      ],
      [1, 1, 1, 1, W3, W3, 1, W3, W3, 1]
    )
  })

  it("splits an arc in equal spans of a quarter turn or less (p424)", () => {
    const cad = joined(
      harness(
        fitA("S"),
        arcOf(p(75, 0), 25, deg(180), deg(280), { id: "R" }),
        arcOf(p(0, -60), 60, deg(250), deg(90), { id: "Q" })
      ),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe("3 objects joined into 1 spline")
    const spline = cad.byId<SplineEntity>("S")
    expect(spline.points[0].x).toBeCloseTo(-20.5212086, 6)
    expect(spline.points[0].y).toBeCloseTo(-116.3815572, 6)
    const third = deg(200) / 3
    expect(spline.knotVector!.slice(3, 13)).toEqual(
      [
        0,
        third,
        third,
        third,
        2 * third,
        2 * third,
        2 * third,
        3 * third,
        3 * third,
        3 * third,
      ].map((k) => expect.closeTo(k, 9))
    )
    expect(spline.knotVector!.at(-1)).toBeCloseTo(69.26723013, 7)
    expect(spline.weights![1]).toBeCloseTo(0.8903252076, 9)
    expect(spline.weights!.at(-2)).toBeCloseTo(0.9375385247, 9)
  })

  it("takes a polyline segment by segment (p401, p431)", () => {
    const cad = joined(
      harness(
        cvA("S"),
        polylineOf([p(50, 0), p(70, 0), p(90, 20)], {
          id: "P",
          bulges: [0, Math.tan(Math.PI / 8)],
        })
      ),
      ...CROSSING
    )
    expectCurve(
      cad.byId<SplineEntity>("S"),
      [
        [0, 0],
        [10, 20],
        [40, 20],
        [50, 0],
        [56.66666667, 0],
        [63.33333333, 0],
        [70, 0],
        [81.71572875, 0],
        [90, 8.284271247],
        [90, 20],
      ],
      [
        0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 3.570796327, 3.570796327, 3.570796327,
        3.570796327,
      ],
      [1, 1, 1, 1, 1, 1, 1, W3, W3, 1]
    )

    // A polyline picked first is no source beside a spline (p431).
    const first = joined(
      harness(
        fitA("S"),
        polylineOf([p(-50, 0), p(0, 0)], { id: "P" }),
        lineOf(p(-50, 0), p(-50, -30), { id: "L" })
      ),
      "-25,0",
      "-50,-15",
      "25,20",
      ""
    )
    expect(first.commandLog().at(-1)).toBe("3 objects joined into 1 spline")
    expect(first.byId<SplineEntity>("S").points[0]).toMatchObject({
      x: -50,
      y: -30,
    })
    expect(first.byId<SplineEntity>("S").knotVector!.slice(4, 10)).toEqual([
      1, 1, 1, 2, 2, 2,
    ])
  })

  it("raises a lower degree, each knot once more, unweighted (p402, p433)", () => {
    const cad = joined(
      harness(
        fitA("S"),
        createSpline(
          "cv",
          [p(50, 0), p(60, -20), p(75, -20), p(90, -20), p(100, 0)],
          { id: "C", degree: 2 }
        )
      ),
      ...CROSSING
    )
    const k = 2 * CHORD
    expectCurve(
      cad.byId<SplineEntity>("C"),
      [
        [0, 0],
        [8.333333333, 10],
        [25, 30],
        [41.66666667, 10],
        [50, 0],
        [56.66666667, -13.33333333],
        [62.5, -20],
        [72.5, -20],
        [77.5, -20],
        [87.5, -20],
        [93.33333333, -13.33333333],
        [100, 0],
      ],
      [
        0,
        0,
        0,
        0,
        CHORD,
        k,
        k,
        k,
        k + 1,
        k + 1,
        k + 2,
        k + 2,
        k + 3,
        k + 3,
        k + 3,
        k + 3,
      ]
    )
  })

  it("joins nothing with a gap (p403), and counts what it leaves (p404)", () => {
    const gap = createSpline("fit", [p(51, 0), p(75, -20), p(100, 0)])
    const cad = joined(harness(fitA(), gap), ...CROSSING)
    expect(cad.commandLog().at(-1)).toBe(
      "0 objects joined, 2 objects discarded from the operation"
    )
    expect(splines(cad).every((s) => s.method === "fit")).toBe(true)

    const counted = joined(
      harness(
        fitA("S"),
        lineOf(p(50, 0), p(100, 0)),
        lineOf(p(0, 50), p(50, 50))
      ),
      ...CROSSING
    )
    expect(counted.commandLog().at(-1)).toBe(
      "2 objects joined into 1 spline, 1 object discarded from the operation"
    )
    expect(counted.typeCounts()).toEqual({ spline: 1, line: 1 })
  })

  it("closes a loop, clamped, from the head it grew to (p405)", () => {
    const cad = joined(
      harness(
        fitA("S"),
        lineOf(p(50, 0), p(50, -30)),
        lineOf(p(50, -30), p(0, 0))
      ),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe("3 objects joined into 1 spline")
    const spline = cad.byId<SplineEntity>("S")
    expect(spline.closed).toBe(true)
    expect(spline.points).toHaveLength(11)
    expect(spline.points[0]).toMatchObject({ x: 50, y: -30 })
    expect(spline.points[10]).toMatchObject({ x: 50, y: -30 })
    expect(spline.knotVector!.at(-1)).toBeCloseTo(2 + 2 * CHORD, 9)
  })

  it("joins a spline rising in space (p419)", () => {
    const rising = createSpline(
      "cv",
      [
        { x: 50, y: 0, z: 0 },
        { x: 60, y: -10, z: 10 },
        { x: 90, y: -10, z: 20 },
        { x: 100, y: 0, z: 30 },
      ],
      { id: "R" }
    )
    const cad = joined(harness(fitA(), rising), ...CROSSING)
    const spline = cad.byId<SplineEntity>("R")
    expect(spline.points.at(-1)).toMatchObject({ x: 100, y: 0, z: 30 })
    expect(spline.weights).toBeUndefined()
    expect(spline.knotVector!.slice(-4)).toEqual(
      new Array(4).fill(expect.closeTo(1 + 2 * CHORD, 9))
    )
  })

  it("starts a piece off 0 at 0 (p423, p432)", () => {
    const cad = harness(
      createSpline(
        "fit",
        [p(0, 0), p(25, 20), p(50, 0), p(75, -20), p(100, 0)],
        { id: "S" }
      ),
      lineOf(p(100, 0), p(150, 0), { id: "L" })
    )
    answer(cad, "_BREAK", "25,20", "_F", "25,20", "50,0")
    const piece = splines(cad).find((s) => s.id !== "S")!
    expect(piece.knotVector![0]).toBeCloseTo(2 * CHORD, 9)
    joined(cad, "75,-20", "125,0", "")
    expect(cad.commandLog().at(-1)).toBe("2 objects joined into 1 spline")
    const spline = cad.byId<SplineEntity>(piece.id)
    expect(spline.knotVector!.slice(0, 5)).toEqual(
      [0, 0, 0, 0, CHORD].map((k) => expect.closeTo(k, 9))
    )
    expect(spline.knotVector!.at(-1)).toBeCloseTo(2 * CHORD + 1, 9)
  })

  it("makes a polyline of the lines a far spline does not meet (p434)", () => {
    const cad = joined(
      harness(
        createSpline("fit", [p(0, 50), p(25, 70), p(50, 50)]),
        lineOf(p(0, 0), p(50, 0)),
        lineOf(p(50, 0), p(50, -30))
      ),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe(
      "2 objects converted to 1 polyline, 1 object discarded from the operation"
    )
    expect(cad.typeCounts()).toEqual({ spline: 1, polyline: 1 })
  })

  it("makes a spline per chain, a line per kind of result (p435–p438)", () => {
    const two = joined(
      harness(
        fitA("S"),
        lineOf(p(50, 0), p(50, -30)),
        createSpline("fit", [p(0, 50), p(25, 70), p(50, 50)], { id: "T" }),
        lineOf(p(50, 50), p(100, 50))
      ),
      ...CROSSING
    )
    expect(two.commandLog().at(-1)).toBe("4 objects joined into 2 splines")
    expect(two.typeCounts()).toEqual({ spline: 2 })

    const kinds = joined(
      harness(
        fitA("S"),
        lineOf(p(50, 0), p(50, -30)),
        lineOf(p(0, 50), p(50, 50)),
        lineOf(p(50, 50), p(50, 80))
      ),
      ...CROSSING
    )
    expect(kinds.commandLog().slice(-2)).toEqual([
      "2 objects joined into 1 spline",
      "2 objects converted to 1 polyline",
    ])

    const made = joined(
      harness(
        ellipseOf(p(0, 50), p(50, 0), 0.5, {
          startParam: 0,
          endParam: Math.PI / 2,
        }),
        lineOf(p(0, 75), p(-50, 75)),
        fitA("S"),
        lineOf(p(50, 0), p(50, -30))
      ),
      ...CROSSING
    )
    expect(made.commandLog().slice(-2)).toEqual([
      "2 objects joined into 1 spline",
      "2 objects converted to 1 spline",
    ])
  })
})

describe("JOIN with elliptical arcs", () => {
  it("makes an arc and an elliptical arc a new spline of degree 2 (p375, p421)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "R", layerId: "A" }),
        {
          ...ellipseOf(p(0, 75), p(0, -25), 0.4, {
            id: "E",
            layerId: "B",
            startParam: Math.PI,
            endParam: 2 * Math.PI,
          }),
          color: "#ff0000",
        },
      ],
      { layers: [layerOf("0"), layerOf("A"), layerOf("B")] }
    )
    joined(cad, "35.35534,35.35534", "-10,75", "")
    expect(cad.commandLog().at(-1)).toBe("2 objects converted to 1 spline")
    const [spline] = splines(cad)
    expect(cad.entityCount).toBe(1)
    expect(spline).toMatchObject({ degree: 2, layerId: "B", color: "#ff0000" })
    const h = Math.PI / 2
    expectCurve(
      spline,
      [
        [0, 100],
        [-10, 100],
        [-10, 75],
        [-10, 50],
        [0, 50],
        [50, 50],
        [50, 0],
      ],
      [0, 0, 0, h, h, 2 * h, 2 * h, 3 * h, 3 * h, 3 * h],
      [1, Math.SQRT1_2, 1, Math.SQRT1_2, 1, Math.SQRT1_2, 1]
    )
  })

  it("joins arcs of two ellipses, and an arc and a line (p409, p410, p428)", () => {
    const cad = joined(
      harness(
        quarter("E", 0, Math.PI / 2),
        ellipseOf(p(0, 50), p(0, -25), 0.4, {
          id: "F",
          startParam: 0,
          endParam: Math.PI / 2,
        })
      ),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe("2 objects converted to 1 spline")
    const h = Math.PI / 2
    expectCurve(
      splines(cad)[0],
      [
        [50, 0],
        [50, 25],
        [0, 25],
        [10, 25],
        [10, 50],
      ],
      [0, 0, 0, h, h, 2 * h, 2 * h, 2 * h],
      [1, Math.SQRT1_2, 1, Math.SQRT1_2, 1]
    )

    const line = joined(
      harness(quarter("E", 0, h), lineOf(p(0, 25), p(-50, 25))),
      ...CROSSING
    )
    expectCurve(
      splines(line)[0],
      [
        [50, 0],
        [50, 25],
        [0, 25],
        [-25, 25],
        [-50, 25],
      ],
      [0, 0, 0, h, h, h + 1, h + 1, h + 1],
      [1, Math.SQRT1_2, 1, 1, 1]
    )

    // Two arcs of one ellipse with a line are a spline, not an arc (p428).
    const mixed = joined(
      harness(
        quarter("E", 0, h),
        quarter("F", h, Math.PI),
        lineOf(p(-50, 0), p(-50, -40))
      ),
      ...CROSSING
    )
    expect(mixed.commandLog().at(-1)).toBe("3 objects converted to 1 spline")
    expect(splines(mixed)[0].points[0]).toMatchObject({ x: 50, y: 0 })
    expect(splines(mixed)[0].knotVector!.at(-1)).toBeCloseTo(Math.PI + 1, 9)
  })

  it("is a new spline when an elliptical arc comes before the spline (p415, p422)", () => {
    const arc = () =>
      ellipseOf(p(75, 0), p(25, 0), 0.4, {
        id: "E",
        startParam: Math.PI,
        endParam: 2 * Math.PI,
      })
    const crossing = joined(harness(fitA("S"), arc()), ...CROSSING)
    expect(crossing.commandLog().at(-1)).toBe("2 objects converted to 1 spline")
    expect(crossing.runtime.document.get("S")).toBeUndefined()
    const [made] = splines(crossing)
    expect(made.degree).toBe(3)
    expect(made.points[0]).toMatchObject({ x: 0, y: 0 })
    expect(made.weights![5]).toBeCloseTo(W3, 9)

    const picked = joined(harness(fitA("S"), arc()), "25,20", "75,-10", "")
    expect(picked.commandLog().at(-1)).toBe("2 objects joined into 1 spline")
    expect(picked.byId<SplineEntity>("S").points).toHaveLength(11)
  })

  it("joins arcs of one ellipse counter-clockwise from the source (p407, p408)", () => {
    const parts = () => [
      quarter("E", 0, paramAt(deg(60))),
      quarter("F", paramAt(deg(120)), paramAt(deg(200)) + 2 * Math.PI),
    ]
    const cad = joined(
      harness(...parts()),
      "43.30127,12.5",
      "-46.98463,8.5505",
      ""
    )
    expect(cad.commandLog().at(-1)).toBe("2 elliptical arcs joined into 1 arc")
    expect(cad.byId<EllipseEntity>("E")).toMatchObject({ startParam: 0 })
    expect(cad.byId<EllipseEntity>("E").endParam).toBeCloseTo(3.77082554, 7)

    const later = joined(
      harness(...parts()),
      "-46.98463,8.5505",
      "43.30127,12.5",
      ""
    )
    const arc = later.byId<EllipseEntity>("F")
    expect(arc.startParam).toBeCloseTo(1.851831228, 8)
    expect(arc.endParam).toBeCloseTo(7.572946732, 8)
  })

  it("makes them a whole ellipse when they go round, asking nothing (p332, p413)", () => {
    const cad = joined(
      harness(quarter("E", 0, Math.PI / 2), quarter("F", Math.PI / 2, Math.PI)),
      ...CROSSING
    )
    expect(cad.commandLog().at(-1)).toBe("2 elliptical arcs joined into 1 arc")
    expect(cad.state().commandLine.command).toBeNull()
    expect(isFullEllipse(cad.byId<EllipseEntity>("F"))).toBe(true)

    const overlap = joined(
      harness(
        quarter("E", 0, Math.PI / 2),
        quarter("F", paramAt(deg(45)), Math.PI)
      ),
      ...CROSSING
    )
    expect(isFullEllipse(overlap.byId<EllipseEntity>("F"))).toBe(true)
  })

  it("is one step U takes back", () => {
    const cad = joined(harness(fitA(), fitB()), ...CROSSING)
    answer(cad, "_U")
    expect(splines(cad).map((s) => s.method)).toEqual(["fit", "fit"])
    expect(cad.commandLog().slice(-2)).toEqual(["U", "JOIN"])
  })
})

describe("JOIN's source alone", () => {
  it("asks for open curves to join a spline (p406, p426, p440)", () => {
    const cad = harness(
      fitA("S"),
      lineOf(p(0, 80), p(50, 80), { id: "F" }),
      arcOf(p(75, 0), 25, deg(180), deg(360), { id: "R" })
    )
    joined(cad, "25,20", "")
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Select any open curves to join to source:"
    )
    answer(cad, "25,80", "75,-25", "")
    expect(cad.commandLog().at(-1)).toBe(
      "1 object joined to source, 1 object discarded from the operation"
    )
    expect(cad.typeCounts()).toEqual({ spline: 1, line: 1 })
    expect(cad.byId<SplineEntity>("S").points.at(-1)!.x).toBeCloseTo(100, 9)

    const none = joined(
      harness(fitA("S"), lineOf(p(0, 80), p(50, 80))),
      "25,20",
      "",
      "25,80",
      ""
    )
    expect(none.commandLog().at(-1)).toBe(
      "0 objects joined to source, 1 object discarded from the operation"
    )
    expect(none.byId<SplineEntity>("S").method).toBe("fit")
  })

  it("asks for arcs of an elliptical arc's ellipse, or cLose (p411, p420, p439)", () => {
    const cad = harness(
      quarter("E", 0, Math.PI / 2),
      quarter("F", Math.PI, 1.5 * Math.PI),
      ellipseOf(p(0, 0), p(80, 0), 25 / 80, {
        id: "G",
        startParam: Math.PI,
        endParam: 1.5 * Math.PI,
      }),
      lineOf(p(0, 25), p(-50, 25), { id: "L" })
    )
    joined(cad, "35.35534,17.67767", "")
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Select elliptical arcs to join to source or [cLose]:"
    )
    // Only its ellipse's arcs are found (p420, p439).
    answer(cad, "-25,25", "-80,0")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Select elliptical arcs to join to source or [cLose]: -25,25",
      "0 found",
      "Select elliptical arcs to join to source or [cLose]: -80,0",
      "0 found, 0 total",
    ])
    expect(cad.runtime.selection.isEmpty()).toBe(true)
    answer(cad, "-35.35534,-17.67767")
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Select elliptical arcs to join to source:"
    )
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("1 elliptical arc joined to source")
    expect(cad.byId<EllipseEntity>("E").endParam).toBeCloseTo(1.5 * Math.PI, 12)
    expect(cad.runtime.document.get("F")).toBeUndefined()
  })

  it("closes the ellipse at cLose, ends at Enter (p369, p412, p430)", () => {
    const cad = joined(harness(quarter("E", 0, Math.PI / 2)), "_L", "", "_L")
    expect(cad.commandLog().at(-1)).toBe("Ellipse successfully closed.")
    expect(isFullEllipse(cad.byId<EllipseEntity>("E"))).toBe(true)
    answer(cad, "_U")
    expect(isFullEllipse(cad.byId<EllipseEntity>("E"))).toBe(false)

    const enter = joined(harness(quarter("E", 0, Math.PI / 2)), "_L", "", "")
    expect(enter.state().commandLine.command).toBeNull()
    expect(enter.commandLog().at(-1)).toBe(
      "Select elliptical arcs to join to source or [cLose]:"
    )
    expect(isFullEllipse(enter.byId<EllipseEntity>("E"))).toBe(false)
  })

  it("speaks Spanish (p406, p411, p369, p435)", () => {
    const cad = createHarness({
      locale: es,
      entities: [quarter("E", 0, Math.PI / 2)],
    })
    joined(cad, "_L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "UNIR Designe arcos elípticos que unir al origen o [cErrar]:"
    )
    // cErrar's capital is its E (pieces/p369 es).
    answer(cad, "e")
    expect(cad.commandLog().at(-1)).toBe("Elipse cerrada correctamente.")

    const spline = createHarness({
      locale: es,
      entities: [fitA("S"), lineOf(p(50, 0), p(100, 0))],
    })
    joined(spline, "25,20", "")
    expect(spline.state().commandLine.prompt).toBe(
      "UNIR Designe cualesquiera curvas abiertas para unir al origen:"
    )
    answer(spline, "75,0", "")
    expect(spline.commandLog().at(-1)).toBe("1 objeto unido al origen")

    const two = joined(
      createHarness({
        locale: es,
        entities: [
          fitA("S"),
          lineOf(p(50, 0), p(50, -30)),
          createSpline("fit", [p(0, 50), p(25, 70), p(50, 50)]),
          lineOf(p(50, 50), p(100, 50)),
        ],
      }),
      ...CROSSING
    )
    expect(two.commandLog().at(-1)).toBe("4 objetos unidos en 2 splines")
  })
})
