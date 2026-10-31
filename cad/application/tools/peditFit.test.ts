import { describe, expect, it } from "vitest"
import type {
  Entity,
  PolylineEntity,
  Polyline3dEntity,
  SplineEntity,
} from "../../domain/entities"
import {
  createLine,
  createPolyline3d,
  polyline3dCurve,
  polylineCurve,
  polylineFitted,
  polylineSplined,
} from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { p, polylineOf } from "../../../test/builders"
import { es } from "../../locales/es"

// PEDIT's Fit, Spline and Decurve, as AutoCAD 2027's console leaves the
// polyline (probes pedit/p50–p62, p147–p199, traced, MPDUMP, en and es):
// each curve below is MPDUMP's to the ninth decimal.

type Harness = ReturnType<typeof createHarness>
const poly = (cad: Harness, id = "P") => cad.byId<PolylineEntity>(id)
const asked = (cad: Harness) =>
  cad.state().commandLine.prompt.replace(/^\S+ /, "")
const typeAnswer = (cad: Harness, text: string) => {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}
const setvar = (cad: Harness, name: string, value: string) =>
  typeAnswer(typeAnswer(cad, name), value)

/** p147's frame, and p51's. */
const FIVE = [p(0, 0), p(7, 3), p(12, 11), p(20, 9), p(26, 1)]
const FOUR = [p(0, 0), p(10, 10), p(20, 0), p(30, 10)]

function edit(entity: Entity, locale?: typeof es) {
  const cad = createHarness({ entities: [entity], locale })
  cad.select(entity.id).command(locale ? "EDITPOL" : "PEDIT")
  return cad
}

/** The polyline's curve, vertex by vertex: x, y and the bulge after it. */
function curveOf(poly: PolylineEntity): number[][] {
  const curve = polylineCurve(poly)
  return curve.vertices.map((v, i) => [v.x, v.y, curve.bulges?.[i] ?? 0])
}

function expectCurve(poly: PolylineEntity, expected: readonly number[][]) {
  const got = curveOf(poly)
  expect(got).toHaveLength(expected.length)
  got.forEach((row, i) =>
    row.forEach((value, k) => expect(value).toBeCloseTo(expected[i][k], 9))
  )
}

const P147 = [
  [0, 0, 0.067665424],
  [3.757002689, 1.038838344, 0.069614023],
  [7, 3, 0.200292227],
  [9.578448935, 7.80462086, -0.2828516],
  [12, 11, -0.155223974],
  [14.770599726, 11.174810678, -0.074710151],
  [20, 9, -0.096303598],
  [23.732997551, 5.623609359, -0.094093932],
  [26, 1, 0],
]

describe("PEDIT's Fit", () => {
  it("lays two arcs between each pair of vertices, the frame kept (p147)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit")
    expectCurve(poly(cad), P147)
    expect(poly(cad).vertices).toEqual(FIVE)
    expect(asked(cad)).toBe(
      "Enter an option [Close/Join/Width/Edit vertex/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:"
    )
  })

  it("fits a closed one round (p148)", () => {
    const cad = edit(
      polylineOf([p(0, 0), p(12, 2), p(14, 9), p(3, 7)], {
        id: "P",
        closed: true,
      })
    )
    cad.option("Fit")
    expectCurve(poly(cad), [
      [0, 0, 0.400983226],
      [3.856705977, -2.624715466, 0.177502884],
      [12, 2, 0.106564513],
      [14.25958712, 6.229897637, 0.188038947],
      [14, 9, 0.332909248],
      [10.297861053, 10.84753782, 0.153861118],
      [3, 7, 0.094125315],
      [0.290044876, 2.975189201, 0.155081103],
    ])
  })

  it("leaves straight what runs straight, and drops the frame's arcs (p149, p151)", () => {
    const cad = edit(
      polylineOf([p(0, 0), p(10, 0), p(20, 0), p(25, 5), p(30, 0)], {
        id: "P",
      })
    )
    cad.option("Fit")
    expectCurve(poly(cad), [
      [0, 0, 0],
      [10, 0, 0],
      [20, 0, 0.388303902],
      [22.479162368, 2.26718243, -0.340184006],
      [25, 5, -0.243476095],
      [28.372995466, 3.927936413, -0.198912367],
      [30, 0, 0],
    ])
  })

  it("runs a segment's widths on through its joint by length (p151)", () => {
    const fitted = polylineFitted(
      polylineOf([p(0, 0), p(10, 0), p(20, 10), p(30, 0)], {
        id: "P",
        bulges: [0, -1, 0],
        widths: [
          [1, 2],
          [2, 2],
          [0, 3],
        ],
      })
    )
    expectCurve(fitted, [
      [0, 0, 0.080611572],
      [5, -0.811388301, 0.080611572],
      [10, 0, 0.254907377],
      [15.130182633, 5.50839889, -0.295746597],
      [20, 10, -0.243476095],
      [26.745990931, 7.855872826, -0.198912367],
      [30, 0, 0],
    ])
    const widths = polylineCurve(fitted).widths!
    expect(widths[0][1]).toBeCloseTo(1.5, 9)
    expect(widths[4][1]).toBeCloseTo(1.3721482259666615, 9)
  })

  it("keeps the tangents Edit vertex gave, before Fit or after it (p59, p150)", () => {
    const cad = edit(polylineOf(FOUR, { id: "P" }))
    cad.option("Edit vertex").option("Tangent").type("0").enter()
    cad.option("Next").option("Next").option("Next")
    cad.option("Tangent").type("90").enter()
    cad.option("eXit").option("Fit")
    expectCurve(poly(cad), [
      [0, 0, 0.414213562],
      [5, 5, -0.414213562],
      [10, 10, -0.414213562],
      [15, 5, 0.414213562],
      [20, 0, 0.198912367],
      [27.071067812, 2.928932188, 0.198912367],
      [30, 10, 0],
    ])

    const after = edit(polylineOf(FIVE, { id: "P" }))
    after.option("Edit vertex").option("Next").option("Next")
    after.option("Tangent").type("30").enter().option("eXit").option("Fit")
    after.option("Edit vertex").option("Next").option("Next").option("Next")
    after.option("Tangent").type("0").enter().option("eXit")
    expectCurve(poly(after), [
      [0, 0, 0.067665424],
      [3.757002689, 1.038838344, 0.069614023],
      [7, 3, 0.18477156],
      [9.57456634, 7.470873144, -0.22628378],
      [12, 11, -0.311427212],
      [15.076892934, 10.752654207, 0.172694222],
      [20, 9, -0.236067977],
      [22.752246117, 7.623876942, -0.094093932],
      [26, 1, 0],
    ])
  })

  it("leaves its arcs where Move, Insert and Straighten change the frame (p152, p153, p155)", () => {
    const moved = edit(polylineOf(FIVE, { id: "P" }))
    moved.option("Fit").option("Edit vertex").option("Next")
    moved.option("Move").click(p(8, 6)).option("eXit")
    expectCurve(
      poly(moved),
      P147.map((row, i) => (i === 2 ? [8, 6, row[2]] : row))
    )

    const inserted = edit(polylineOf(FIVE, { id: "P" }))
    inserted.option("Fit").option("Edit vertex").option("Next")
    inserted.option("Insert").click(p(9, 8)).option("eXit")
    expectCurve(poly(inserted), [
      ...P147.slice(0, 2),
      [7, 3, 0],
      [9, 8, 0],
      ...P147.slice(4),
    ])

    const straight = edit(polylineOf(FIVE, { id: "P" }))
    straight.option("Fit").option("Edit vertex").option("Next")
    straight.option("Straighten").option("Next").option("Next").option("Go")
    straight.option("eXit")
    expectCurve(poly(straight), [
      ...P147.slice(0, 2),
      [7, 3, 0],
      ...P147.slice(6),
    ])
  })

  it("breaks into its curve's start as a polyline and a fitted rest (p154)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit").option("Edit vertex").option("Next")
    cad.option("Break").option("Next").option("Next").option("Go")
    const [first, second] = cad
      .entities()
      .filter((e): e is PolylineEntity => e.type === "polyline")
    expect(first.fit).toBeUndefined()
    expectCurve(
      first,
      P147.slice(0, 3).map((r, i) => (i === 2 ? [7, 3, 0] : r))
    )
    expect(second.fit?.kind).toBe("curve")
    expectCurve(second, P147.slice(6))
  })

  it("widens a fitted segment through its joint (p156)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit").option("Edit vertex").option("Next").option("Width")
    cad.type("1").enter().type("2").enter()
    const widths = polylineCurve(poly(cad)).widths!
    expect(widths[2][0]).toBe(1)
    expect(widths[2][1]).toBeCloseTo(1.5701642216940626, 9)
    expect(widths[3]).toEqual([widths[2][1], 2])
  })

  it("is fitted again closed and open, and reversed arc by arc (p166)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit").option("Close")
    expectCurve(poly(cad), [
      [0, 0, -0.050220659],
      [3.893166585, 1.618923613, 0.06236439],
      [7, 3, 0.260301433],
      [9.503607494, 7.386531731, -0.306725563],
      [12, 11, -0.155223974],
      [14.983805045, 11.188262844, -0.083379104],
      [20, 9, -0.087615619],
      [25.082106908, 4.241641567, -0.185881253],
      [26, 1, -0.376608356],
      [5.128366769, -18.789958988, -0.79453302],
    ])
    cad.option("Open").option("Reverse")
    expectCurve(poly(cad), [
      [26, 1, 0.094093932],
      [23.732997551, 5.623609359, 0.096303598],
      [20, 9, 0.074710151],
      [14.770599726, 11.174810678, 0.155223974],
      [12, 11, 0.2828516],
      [9.578448935, 7.80462086, -0.200292227],
      [7, 3, -0.069614023],
      [3.757002689, 1.038838344, -0.067665424],
      [0, 0, 0],
    ])
  })

  it("is refitted by STRETCH, its arcs carried by MOVE and MIRROR (p176, p191)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit").enter()
    typeAnswer(cad.command("STRETCH"), "C")
    cad.click(p(11, 10)).click(p(13, 12)).enter()
    cad.click(p(0, 0)).click(p(2, 3))
    expectCurve(poly(cad), [
      [0, 0, 0.054721759],
      [3.674557238, 1.118811167, 0.055016402],
      [7, 3, 0.299173725],
      [9.987699609, 10.826604391, -0.625802428],
      [14, 14, -0.06146819],
      [15.92871806, 12.758422158, -0.025366976],
      [20, 9, -0.032789442],
      [23.256695003, 5.203829086, -0.032671261],
      [26, 1, 0],
    ])

    const moved = edit(polylineOf(FIVE, { id: "P" }))
    moved.option("Fit").enter()
    moved.select("P").command("MIRROR").enter()
    moved.click(p(0, -10)).click(p(10, -10)).option("Yes")
    expectCurve(
      poly(moved),
      P147.map(([x, y, b]) => [x, -20 - y, -b])
    )
  })

  it("keeps a tangent typed as -0 as the 0 a file holds", () => {
    const cad = edit(polylineOf(FOUR, { id: "P" }))
    cad.option("Edit vertex").option("Tangent").type("-0").enter()
    cad.option("eXit").option("Fit")
    expect(poly(cad).fit?.tangents?.[0]).toBe(0)
  })
})

describe("PEDIT's Spline", () => {
  it("puts SPLINESEGS points a span on the cubic B-spline of its frame (p52)", () => {
    const cad = edit(polylineOf(FOUR, { id: "P" }))
    cad.option("Spline")
    expectCurve(poly(cad), [
      [0, 0, 0],
      [3.75, 2.890625, 0],
      [7.5, 4.375, 0],
      [11.25, 4.921875, 0],
      [15, 5, 0],
      [18.75, 5.078125, 0],
      [22.5, 5.625, 0],
      [26.25, 7.109375, 0],
      [30, 10, 0],
    ])
    expect(poly(cad).vertices).toEqual(FOUR)
    expect(poly(cad).fit).toEqual({ kind: "cubic", segments: 8 })
  })

  it("is quadratic at SPLINETYPE 5, and arcs at a negative SPLINESEGS (p53, p54)", () => {
    const cad = createHarness({ entities: [polylineOf(FOUR, { id: "P" })] })
    setvar(cad, "SPLINETYPE", "5")
    cad.select("P").command("PEDIT").option("Spline").enter()
    expect(curveOf(poly(cad))).toHaveLength(17)
    expectCurve(poly(cad), [
      [0, 0, 0],
      [2.421875, 2.265625, 0],
      [4.6875, 4.0625, 0],
      [6.796875, 5.390625, 0],
      [8.75, 6.25, 0],
      [10.546875, 6.640625, 0],
      [12.1875, 6.5625, 0],
      [13.671875, 6.015625, 0],
      [15, 5, 0],
      [16.328125, 3.984375, 0],
      [17.8125, 3.4375, 0],
      [19.453125, 3.359375, 0],
      [21.25, 3.75, 0],
      [23.203125, 4.609375, 0],
      [25.3125, 5.9375, 0],
      [27.578125, 7.734375, 0],
      [30, 10, 0],
    ])
    setvar(cad, "SPLINETYPE", "6")
    setvar(cad, "SPLINESEGS", "-4")
    cad.select("P").command("PEDIT").option("Spline").enter()
    expectCurve(poly(cad), [
      [0, 0, -0.059723187],
      [4.559418212, 3.447271618, -0.111694344],
      [7.5, 4.375, 0],
      [15, 5, 0],
      [22.5, 5.625, 0.111694344],
      [25.440581788, 6.552728382, 0.059723187],
      [30, 10, 0],
    ])
    setvar(cad, "SPLINESEGS", "1")
    cad.select("P").command("PEDIT").option("Spline").enter()
    expectCurve(poly(cad), [
      [0, 0, 0],
      [30, 10, 0],
    ])
  })

  it("is periodic round a closed frame (p56)", () => {
    const cad = edit(polylineOf(FOUR, { id: "P", closed: true }))
    cad.option("Spline")
    const curve = curveOf(poly(cad))
    expect(curve).toHaveLength(32)
    expect(curve[0][0]).toBeCloseTo(10, 9)
    expect(curve[0][1]).toBeCloseTo(6.666666667, 9)
    expect(curve[9][0]).toBeCloseTo(21.236979167, 9)
    expect(curve[31][0]).toBeCloseTo(8.763020833, 9)
    expect(curve[31][1]).toBeCloseTo(6.5234375, 9)
  })

  it("follows its frame through Move, Insert, Straighten and Break (p58, p157, p158, p159)", () => {
    const moved = edit(polylineOf(FOUR, { id: "P" }))
    moved.option("Spline").option("Edit vertex").option("Next").option("Next")
    moved.option("Move").click(p(12, 12)).option("eXit")
    expectCurve(poly(moved), [
      [0, 0, 0],
      [3.421875, 3.3828125, 0],
      [6.375, 6.0625, 0],
      [9.140625, 8.0859375, 0],
      [12, 9.5, 0],
      [15.234375, 10.3515625, 0],
      [19.125, 10.6875, 0],
      [23.953125, 10.5546875, 0],
      [30, 10, 0],
    ])

    const straight = edit(polylineOf(FIVE, { id: "P" }))
    straight.option("Spline").option("Edit vertex").option("Next")
    straight.option("Straighten").option("Next").option("Next").option("Go")
    straight.option("eXit")
    expectCurve(poly(straight), [
      [0, 0, 0],
      [2.880859375, 1.232421875, 0],
      [6.171875, 2.546875, 0],
      [9.720703125, 3.744140625, 0],
      [13.375, 4.625, 0],
      [16.982421875, 4.990234375, 0],
      [20.390625, 4.640625, 0],
      [23.447265625, 3.376953125, 0],
      [26, 1, 0],
    ])

    const inserted = edit(polylineOf(FIVE, { id: "P" }))
    inserted.option("Spline").option("Edit vertex").option("Next")
    inserted.option("Width").type("1").enter().type("2").enter()
    inserted.option("Next").option("Insert").click(p(15, 12)).option("eXit")
    const curve = curveOf(poly(inserted))
    expect(curve).toHaveLength(25)
    expect(curve[8][0]).toBeCloseTo(11.25, 9)
    expect(curve[8][1]).toBeCloseTo(9.166666667, 9)
    // The frame's widths but its first and last reach no point of the curve.
    expect(polylineCurve(poly(inserted)).widths).toBeUndefined()

    const broken = edit(polylineOf(FIVE, { id: "P" }))
    broken.option("Spline").option("Edit vertex").option("Next")
    broken.option("Break").option("Next").option("Go")
    const [first, second] = broken
      .entities()
      .filter((e): e is PolylineEntity => e.type === "polyline")
    expect(first.fit).toBeUndefined()
    expect(first.vertices).toEqual([p(0, 0), p(7, 3)])
    // Three vertices, cubic: the Bézier on the middle one twice (p190).
    expectCurve(second, [
      [12, 11, 0],
      [14.65234375, 10.32421875, 0],
      [16.71875, 9.71875, 0],
      [18.36328125, 9.06640625, 0],
      [19.75, 8.25, 0],
      [21.04296875, 7.15234375, 0],
      [22.40625, 5.65625, 0],
      [24.00390625, 3.64453125, 0],
      [26, 1, 0],
    ])
  })

  it("runs its width by length from the first to the last (p163, p60)", () => {
    const splined = polylineSplined(
      polylineOf(FOUR, {
        id: "P",
        bulges: [0, 0, 1],
        widths: [
          [0, 2],
          [2, 4],
          [4, 4],
        ],
      }),
      "cubic",
      8
    )!
    const widths = polylineCurve(splined).widths!
    expect(widths[0][1]).toBeCloseTo(0.5806575555691341, 9)
    expect(widths[3][1]).toBeCloseTo(2, 9)
    expect(widths[7][1]).toBeCloseTo(4, 9)

    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Spline").option("Width").type("2").enter()
    expect(new Set(polylineCurve(poly(cad)).widths!.flat())).toEqual(
      new Set([2])
    )
  })

  it("leaves a polyline of two vertices as it is (p190)", () => {
    const line = polylineOf([p(0, 20), p(10, 30)], { id: "P" })
    const cad = edit(line)
    cad.option("Spline")
    expect(poly(cad)).toEqual(line)
  })

  it("keeps Edit vertex's tangents for a Fit after it, through Decurve (p188, p192)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Spline").option("Edit vertex").option("Tangent")
    cad.type("45").enter().option("eXit").option("Fit")
    expectCurve(poly(cad), [
      [0, 0, -0.178328549],
      [3.197398976, 1.475891106, 0.152003491],
      ...P147.slice(2),
    ])
    cad.option("Spline").option("Decurve").option("Fit")
    expect(curveOf(poly(cad))[0][2]).toBeCloseTo(-0.178328549, 9)
  })
})

describe("PEDIT's Decurve", () => {
  it("straightens every segment, fitted or not, Defit too (p50, p182, p198)", () => {
    const arcs = edit(
      polylineOf([p(0, 0), p(10, 0), p(10, 10), p(20, 10), p(30, 0)], {
        id: "P",
        bulges: [0, 0, -1, 0],
      })
    )
    arcs.option("Decurve")
    expect(poly(arcs).bulges).toBeUndefined()

    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Spline").option("Decurve")
    expect(poly(cad)).toEqual(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit")
    typeAnswer(cad, "DEFIT")
    expect(poly(cad)).toEqual(polylineOf(FIVE, { id: "P" }))
  })

  it("takes back each as a step, then the whole run (p62, p167)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }))
    cad.option("Fit").option("Spline").option("Fit")
    cad.option("Undo").option("Undo")
    expectCurve(poly(cad), P147)
    cad.enter()
    cad.select("P").command("PEDIT").option("Spline").enter()
    cad.command("U")
    expectCurve(poly(cad), P147)
  })
})

describe("a 3D polyline's Spline curve", () => {
  const rising = () =>
    createPolyline3d(
      [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 5 },
        { x: 20, y: 0, z: 0 },
        { x: 30, y: 10, z: 3 },
      ],
      false,
      undefined,
      "Q"
    )
  const q = (cad: Harness) => cad.byId<Polyline3dEntity>("Q")

  it("is the B-spline of its frame in space, and Decurve its frame (p55)", () => {
    const cad = edit(rising())
    cad.option("Spline curve")
    const curve = polyline3dCurve(q(cad)).vertices
    expect(curve).toHaveLength(9)
    expect(curve[1].x).toBeCloseTo(3.75, 9)
    expect(curve[1].y).toBeCloseTo(2.890625, 9)
    expect(curve[1].z).toBeCloseTo(1.44140625, 9)
    expect(curve[4].z).toBeCloseTo(2.25, 9)
    cad.option("Decurve")
    expect(q(cad)).toEqual(rising())
  })

  it("runs straight at a negative SPLINESEGS (p198)", () => {
    const cad = createHarness({ entities: [rising()] })
    setvar(cad, "SPLINESEGS", "-4")
    cad.select("Q").command("PEDIT").option("Spline curve")
    const curve = polyline3dCurve(q(cad)).vertices
    expect(curve.map((v) => [v.x, v.y, v.z])).toEqual([
      [0, 0, 0],
      [7.5, 4.375, 2.15625],
      [15, 5, 2.25],
      [22.5, 5.625, 1.96875],
      [30, 10, 3],
    ])
  })

  it("is offered as Multiple's with a 3D polyline in the set (p196, p197)", () => {
    const cad = createHarness({
      entities: [polylineOf(FIVE.slice(0, 3), { id: "P" }), rising()],
    })
    typeAnswer(cad.command("PEDIT").option("Multiple"), "ALL").enter()
    expect(asked(cad)).toBe(
      "Enter an option [Close/Open/Spline curve/Decurve/Reverse/Undo]:"
    )
    cad.option("Spline curve")
    expect(poly(cad).fit?.kind).toBe("cubic")
    expect(q(cad).fit?.kind).toBe("cubic")

    const flat = createHarness({
      entities: [
        polylineOf(FIVE.slice(0, 3), { id: "P" }),
        createLine(p(30, 0), p(30, 10)),
      ],
    })
    typeAnswer(flat.command("PEDIT").option("Multiple"), "ALL").enter()
    flat.enter()
    expect(asked(flat)).toBe(
      "Enter an option [Close/Open/Join/Width/Fit/Spline/Decurve/Ltype gen/Reverse/Undo]:"
    )
  })
})

describe("Fit, Spline and Decurve in Spanish", () => {
  it("takes Spanish AutoCAD's words (p51, p55, es)", () => {
    const cad = edit(polylineOf(FIVE, { id: "P" }), es)
    expect(asked(cad)).toBe(
      "Indique una opción [Cerrar/Juntar/Grosor/Editar vértices/curVar/Spline/anularcuRVatura/generarTlínea/Invertir/desHacer]:"
    )
    typeAnswer(cad, "V")
    expectCurve(poly(cad), P147)
    typeAnswer(cad, "RV")
    expect(poly(cad).fit).toBeUndefined()
  })
})

describe("what other commands make of a fitted polyline", () => {
  const splined = () =>
    polylineSplined(polylineOf(FIVE, { id: "P" }), "cubic", 8)!
  const fitted = () => polylineFitted(polylineOf(FIVE, { id: "P" }))

  it("OFFSET copies its curve, a polyline fitted no more (p169)", () => {
    const cad = createHarness({ entities: [fitted()] })
    cad.command("OFFSET").type("1").enter().click(p(0, 0)).click(p(10, -10))
    cad.enter()
    const copy = cad.latest() as PolylineEntity
    expect(copy.fit).toBeUndefined()
    expect(copy.vertices).toHaveLength(9)
    expect(copy.vertices[0].x).toBeCloseTo(0.134235602, 6)
    expect(copy.vertices[0].y).toBeCloseTo(-0.990949445, 6)
    expect(copy.bulges![3]).toBeCloseTo(-0.2828516, 6)
  })

  it("EXPLODE gives its curve's lines and arcs (p173, p174)", () => {
    const lines = createHarness({ entities: [splined()] })
    lines.select("P").command("EXPLODE")
    expect(lines.typeCounts()).toEqual({ line: 16 })
    const arcs = createHarness({ entities: [fitted()] })
    arcs.select("P").command("EXPLODE")
    expect(arcs.typeCounts()).toEqual({ arc: 8 })
  })

  it("TRIM leaves its curve, a polyline fitted no more (p170)", () => {
    const cad = createHarness({
      entities: [splined(), createLine(p(15, -5), p(15, 20))],
    })
    typeAnswer(cad.command("TRIM"), "C").click(p(18, -5)).click(p(30, 15))
    cad.enter()
    const left = poly(cad)
    expect(left.fit).toBeUndefined()
    expect(left.vertices).toHaveLength(11)
    expect(left.vertices.at(-1)!.x).toBeCloseTo(15, 9)
    expect(left.vertices.at(-1)!.y).toBeCloseTo(9.047210593, 6)
  })

  it("FILLET refuses one in AutoCAD's words (p194)", () => {
    const cad = createHarness({
      entities: [fitted(), createLine(p(-10, -5), p(-10, 10))],
    })
    cad.command("FILLET").click(p(-10, 0)).click(p(0, 0))
    expect(cad.commandLog()).toContain(
      "Fillet requires 2 lines, arcs, or circles."
    )
  })

  it("SPLINE's Object turns a spline-fit one into its spline, a Fit one not (p57, p178, p189)", () => {
    const cad = createHarness({ entities: [splined()] })
    cad.command("SPLINE").option("Object").click(p(0, 0)).enter()
    const spline = cad.latest() as SplineEntity
    expect(spline.type).toBe("spline")
    expect(spline.method).toBe("cv")
    expect(spline.points.map((v) => [v.x, v.y])).toEqual(
      FIVE.map((v) => [v.x, v.y])
    )
    expect(spline.knotVector).toEqual([0, 0, 0, 0, 1, 2, 2, 2, 2])
    expect(cad.entities()).toHaveLength(1)

    const refused = createHarness({ entities: [fitted()] })
    refused.command("SPLINE").option("Object").click(p(0, 0)).enter()
    expect(refused.commandLog().slice(-2)).toEqual([
      "Only spline fitted polylines can be converted to splines.",
      "Unable to convert the selected object.",
    ])
    expect(refused.latest().type).toBe("polyline")

    const loop = createHarness({
      entities: [
        polylineSplined(
          polylineOf(FOUR, { id: "P", closed: true }),
          "quadratic",
          8
        )!,
      ],
    })
    loop.select("P").command("SPLINE").option("Object")
    loop.click(p(15, 5)).enter()
    const closed = loop.latest() as SplineEntity
    expect(closed.closed).toBe(true)
    expect(closed.knotVector).toEqual([0, 0, 0, 1, 2, 3, 4, 4, 4])
    expect(closed.points.map((v) => [v.x, v.y])).toEqual([
      [5, 5],
      [10, 10],
      [20, 0],
      [30, 10],
      [0, 0],
      [5, 5],
    ])
  })

  it("SPLINEDIT turns a spline-fit one into its spline as it is picked (p180)", () => {
    const cad = createHarness({ entities: [splined()] })
    cad.command("SPLINEDIT").click(p(0, 0))
    expect(cad.latest().type).toBe("spline")
    expect(asked(cad)).toBe(
      "Enter an option [Close/Join/Fit data/Edit vertex/convert to Polyline/Reverse/Undo/eXit] <eXit>:"
    )
  })

  it("SPLINESEGS and SPLINETYPE refuse what AutoCAD refuses (p161, p199)", () => {
    const cad = createHarness()
    setvar(cad, "SPLINESEGS", "0")
    setvar(cad, "SPLINETYPE", "4")
    expect(cad.commandLog()).toEqual([
      "SPLINESEGS",
      "Enter new value for SPLINESEGS <8>: 0",
      "Cannot set SPLINESEGS to that value.",
      "*Invalid*",
      "SPLINETYPE",
      "Enter new value for SPLINETYPE <6>: 4",
      "Cannot set SPLINETYPE to that value.",
      "*Invalid*",
    ])
  })
})
