import { describe, expect, it } from "vitest"
import type {
  Entity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import { createSpline, splineCurve } from "../../domain/entities"
import { bsplinePoint, periodicLoop } from "../../geometry/nurbs"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

// SPLINEDIT, as AutoCAD 2027's console asks it and leaves the spline (probes
// spline-knots/k11, k57–k146, traced, MPDUMP, en and es): each case the
// dump's control points, knots and weights, a fit spline's as its curve.

const ROOT2 = Math.SQRT2
const fit = () =>
  createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], { id: "S" })
const cv = () =>
  createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)], { id: "S" })
const cv6 = () =>
  createSpline(
    "cv",
    [p(0, 0), p(5, 15), p(20, -5), p(30, 10), p(40, 0), p(50, 10)],
    { id: "S" }
  )
const closedFit = () =>
  createSpline("fit", [p(0, 0), p(20, 0), p(20, 20), p(0, 20)], {
    id: "S",
    closed: true,
  })
const closedCv = () =>
  createSpline("cv", [p(30, 0), p(50, 0), p(50, 20), p(30, 20)], {
    id: "S",
    closed: true,
  })

function edit(...entities: Entity[]) {
  const cad = createHarness({ entities })
  cad.command("SPLINEDIT").click(p(0, 0))
  return cad
}
const editClosedCv = () => {
  const cad = createHarness({ entities: [closedCv()] })
  cad.command("SPLINEDIT").click(p(33.33333333, 3.33333333))
  return cad
}
const spline = (cad: ReturnType<typeof createHarness>) =>
  cad.byId<SplineEntity>("S")
/** The question open now, without the command's name. */
const asked = (cad: ReturnType<typeof createHarness>) =>
  cad.state().commandLine.prompt.replace(/^\S+ /, "")
const said = (cad: ReturnType<typeof createHarness>) => cad.commandLog()
const pts = (rows: readonly (readonly number[])[]) =>
  rows.map(([x, y]) => p(x, y))

/** The curve the spline draws, against a dump's control points and knots. */
function expectCurve(
  s: SplineEntity,
  points: readonly (readonly number[])[],
  knots: readonly number[],
  digits = 9
) {
  const drawn = splineCurve(s)
  const curve = s.closed ? periodicLoop(drawn) : drawn
  expect(curve.controlPoints).toBeCloseToPoints(pts(points), digits)
  expect(curve.knots).toHaveLength(knots.length)
  curve.knots.forEach((k, i) => expect(k).toBeCloseTo(knots[i], digits))
}

const FIT_POINTS = [
  [0, 0],
  [3.33333333333, 5.55555555556],
  [10, 16.6666666667],
  [20, -6.66666666667],
  [26.6666666667, 4.44444444444],
  [30, 10],
]
const FIT_KNOTS = [0, 0, 0, 0, 10 * ROOT2, 20 * ROOT2, 30 * ROOT2]
const fitKnots = [...FIT_KNOTS, 30 * ROOT2, 30 * ROOT2, 30 * ROOT2]

describe("SPLINEDIT's prompts", () => {
  it("asks AutoCAD's options, Close or Open as the spline is (k57, k59)", () => {
    const cad = edit(fit())
    cad.option("Close").option("eXit")
    expect(cad.commandLog()).toEqual([
      "SPLINEDIT",
      "Select spline:",
      "Enter an option [Close/Join/Fit data/Edit vertex/convert to Polyline/Reverse/Undo/eXit] <eXit>: C",
      "Enter an option [Open/Fit data/Edit vertex/convert to Polyline/Reverse/Undo/eXit] <eXit>: EX",
    ])
  })

  it("says what it is not given, asks again and ends at Enter (k93, k95, k118)", () => {
    const cad = createHarness({
      entities: [lineOf(p(20, -10), p(30, -10)), fit()],
    })
    cad.command("SPLINEDIT").click(p(25, -10))
    expect(said(cad)).toContain("Object selected is not a spline.")
    expect(asked(cad)).toBe("Select spline:")
    cad.click(p(0, 0))
    for (const key of "FOO") cad.press(key)
    cad.press("Enter")
    expect(said(cad)).toContain("Invalid option keyword.")
    cad.enter()
    expect(cad.state().activeToolId).toBe("select")
  })

  it("edits the spline selected before it (k121)", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.select("S").command("SPLINEDIT")
    expect(asked(cad)).toMatch(/^Enter an option \[Close\/Join/)
  })

  it("takes Spanish AutoCAD's words (k57–k146, es)", () => {
    const cad = createHarness({ entities: [cv()], locale: es })
    cad.command("EDITSPLINE").click(p(0, 0)).option("Edit vertex")
    expect(said(cad).at(-1)).toBe(
      "Indique una opción [Cerrar/Unir/Ajustar datos/Editar vértices/coNvertir en polilínea/Invertir/desHacer/Salir] <Salir>: E"
    )
    expect(asked(cad)).toBe(
      "Indique una opción de edición de vértices [Añadir/sUprimir/Elevar orden/Desplazar/Peso/Salir] <Salir>:"
    )
    cad.option("Weight")
    expect(said(cad).at(-1)).toBe("Spline no racional. Se va a convertir.")
    expect(asked(cad)).toBe(
      "Indique nuevo peso (actual = 1.00) o [siGuiente/Previo/Designar punto/Salir] <G>:"
    )
  })
})

describe("Close, Open, Reverse", () => {
  it("closes a fit spline through its fit points and opens it again (k57, k59, k100)", () => {
    const cad = edit(fit())
    cad.option("Close")
    expect(spline(cad)).toMatchObject({ method: "fit", closed: true })
    expectCurve(
      spline(cad),
      [
        [18, -8.47213595499958],
        [43.41640786499874, 25.259029213332212],
        [-13.416407864998734, -15.259029213332209],
        [12, 18.472135954999576],
      ],
      [0, 10 * ROOT2, 20 * ROOT2, 30 * ROOT2, 74.04918347287665]
    )
    cad.option("Open")
    expect(spline(cad).closed).toBe(false)
    expectCurve(spline(cad), FIT_POINTS, fitKnots)
  })

  it("opens a closed fit spline on its fit points (k59)", () => {
    const cad = edit(closedFit())
    cad.option("Open")
    expect(spline(cad).closed).toBe(false)
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [8, -2.22222222222],
        [24, -6.66666666667],
        [24, 26.6666666667],
        [8, 22.2222222222],
        [0, 20],
      ],
      [0, 0, 0, 0, 20, 40, 60, 60, 60, 60]
    )
  })

  it("closes a CV spline periodic on its vertices, whatever its knots (k58, k122)", () => {
    const cad = edit(
      createSpline("cv", cv().points, {
        id: "S",
        knotVector: [0, 0, 0, 0, 0.6, 0.6, 0.6, 0.6],
      })
    )
    cad.option("Close")
    expect(spline(cad)).toMatchObject({ closed: true, degree: 3 })
    expect(spline(cad).knotVector).toBeUndefined()
    cad.option("Open")
    expect(splineCurve(spline(cad)).knots).toEqual([0, 0, 0, 0, 1, 1, 1, 1])
  })

  it("reverses a fit spline and a weighted CV spline (k74, k126)", () => {
    const cad = edit(fit())
    cad.option("Reverse")
    expect(said(cad)).toContain("Spline has been reversed.")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [30, 10],
        [20, 0],
        [10, 10],
        [0, 0],
      ])
    )
    const weighted = edit(
      createSpline("cv", cv().points, { id: "S", weights: [1, 3, 1, 1] })
    )
    weighted.option("Reverse")
    expect(spline(weighted).weights).toEqual([1, 1, 3, 1])
  })

  it("keeps a closed spline's first point first (k141, k142)", () => {
    const cad = editClosedCv()
    cad.option("Reverse")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [30, 0],
        [30, 20],
        [50, 20],
        [50, 0],
      ])
    )
  })
})

describe("Fit data", () => {
  it("adds fit points after the one picked, Undo taking back the last (k77, k106)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Add").click(p(10, 10))
    expect(asked(cad)).toBe("Specify new fit point to add <exit>:")
    cad.click(p(15, 8)).click(p(16, 4))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [2.52216117764, 4.92903612647],
        [6.00473271855, 11.7349932914],
        [15.8419716096, 8.92388165285],
        [15.3532102095, 3.2734847736],
        [22.80317061, -3.50581042955],
        [27.0013210875, 4.37257898769],
        [30, 10],
      ],
      [
        0, 0, 0, 0, 14.1421356237, 19.5273004309, 23.6504060565, 29.307260306,
      ].concat(new Array(4).fill(43.4493959297)),
      8
    )
    cad.option("Undo")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [10, 10],
        [15, 8],
        [20, 0],
        [30, 10],
      ])
    )
  })

  it("asks After or Before at the first fit point, a point going before (k78, k105)", () => {
    const before = edit(fit())
    before.option("Fit data").option("Add").click(p(0, 0))
    expect(asked(before)).toBe("Specify new point or [After/Before] <exit>:")
    before.click(p(-5, 5))
    expect(spline(before).points[0]).toBeCloseToPoint(p(-5, 5))
    const after = edit(fit())
    after.option("Fit data").option("Add").click(p(0, 0)).option("After")
    after.click(p(5, 2))
    expect(spline(after).points[1]).toBeCloseToPoint(p(5, 2))
    expect(splineCurve(spline(after)).knots[4]).toBeCloseTo(5.38516480713, 9)
  })

  it("adds on a closed spline after its last point (k125)", () => {
    const cad = edit(closedFit())
    cad.option("Fit data").option("Add").click(p(0, 20)).click(p(-5, 10))
    expect(spline(cad).points.at(-1)).toBeCloseToPoint(p(-5, 10))
    cad.enter().enter().option("Delete").click(p(20, 20))
    expectCurve(
      spline(cad),
      [
        [1.62547578089, 30.1550563457],
        [-6.76577181678, 9.50255240399],
        [-0.403912642992, -4.00219566182],
        [34.165188557, -5.30172170122],
      ],
      [0, 20, 48.2842712475, 59.464611135, 70.6449510225]
    )
  })

  it("deletes fit points down to two, then says so (k62, k103, k128)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Delete").click(p(14, 6))
    expect(said(cad)).toContain("Not a fit point.")
    cad.click(p(10, 10))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [7.23857625085, -1.38071187458],
        [19.5955988548, -3.73773447853],
        [26.9526214588, 5.97631072938],
        [30, 10],
      ],
      [
        0, 0, 0, 0, 20, 34.1421356237, 34.1421356237, 34.1421356237,
        34.1421356237,
      ]
    )
    cad.click(p(20, 0))
    expect(said(cad).at(-1)).toBe("Cannot delete beyond this.")
    expect(asked(cad)).toBe(
      "Enter a fit data option [Add/Close/Delete/Move/Purge/Tangents/eXit] <eXit>:"
    )
  })

  it("moves the fit point it steps to, Enter stepping on (k64, k80)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Move").enter().click(p(12, 12))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [4.30982784482, 7.12895745073],
        [12.2823050698, 20.3163637603],
        [19.2328828675, -7.14647723303],
        [26.434497908, 4.32198984259],
        [30, 10],
      ],
      [0, 0, 0, 0, 16.9705627485, 31.3927678503].concat(
        new Array(4).fill(45.5349034741)
      )
    )
    cad.click(p(25, 5)).option("Previous").option("Previous")
    cad.option("Select point").click(p(20, 0)).click(p(22, -2))
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [25, 5],
        [22, -2],
        [30, 10],
      ])
    )
  })

  it("takes the start tangent from the point to the start, the end's from the end (k66, k82, k110)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Tangents").click(p(0, 10)).click(p(40, 10))
    expect(spline(cad).startTangent).toBeCloseToPoint(p(0, -1))
    expect(spline(cad).endTangent).toBeCloseToPoint(p(1, 0))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [0, -4.71404520791],
        [11.3714606389, 22.1998877637],
        [20.1998877637, -10.6285393611],
        [25.2859547921, 10],
        [30, 10],
      ],
      fitKnots
    )
    cad.option("Tangents").click(p(0, 10)).option("System default")
    expect(spline(cad).startTangent).toBeUndefined()
    expect(spline(cad).endTangent).toBeUndefined()
    cad.option("Tangents").enter().click(p(40, 10))
    expect(spline(cad).startTangent).toBeUndefined()
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [3.28022903046, 5.76923076923],
        [9.84068709139, 17.3076923077],
        [20.6372516344, -9.23076923077],
        [25.2859547921, 10],
        [30, 10],
      ],
      fitKnots
    )
  })

  it("keeps the tangents through Add, Delete and Move (k135–k137)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Tangents").click(p(0, 10)).click(p(40, 10))
    cad.option("Delete").click(p(10, 10))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [0, -6.66666666667],
        [23.3333333333, -4.71404520791],
        [25.2859547921, 10],
        [30, 10],
      ],
      [0, 0, 0, 0, 20].concat(new Array(4).fill(34.1421356237))
    )
  })

  it("purges the fit data, back at the first prompt (k65, k101)", () => {
    const cad = edit(fit())
    cad.option("Fit data").option("Purge")
    expect(spline(cad).method).toBe("cv")
    expect(spline(cad).knotVector).toEqual(
      fitKnots.map((k) => expect.closeTo(k, 9))
    )
    expect(asked(cad)).toMatch(/^Enter an option \[Close/)
  })

  it("gives a CV spline fit data, Uniform on knots 1 apart (k76, k97)", () => {
    const cad = edit(cv())
    cad.option("Fit data")
    const s = spline(cad)
    expect(s).toMatchObject({ method: "fit", knots: "uniform" })
    expect(s.points).toBeCloseToPoints(
      pts([
        [0, 0],
        [40, 10],
      ])
    )
    expect(s.startTangent).toBeCloseToPoint(p(15, 45))
    expect(s.endTangent).toBeCloseToPoint(p(60, 45))
    expectCurve(
      s,
      [
        [0, 0],
        [5, 15],
        [20, -5],
        [40, 10],
      ],
      [0, 0, 0, 0, 1, 1, 1, 1]
    )
    cad.option("Move").enter().click(p(12, 12))
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [5, 15],
        [-8, -3],
        [12, 12],
      ],
      [0, 0, 0, 0, 1, 1, 1, 1]
    )
  })

  it("adds on knots of its own at the middle of the span, the tangents dropped (k114)", () => {
    const own = [
      0, 0, 0, 0, 0.627718676731, 0.627718676731, 0.627718676731,
      0.627718676731,
    ]
    const cad = edit(
      createSpline(
        "cv",
        pts([
          [0, 0],
          [3.13859338365, 9.41578015096],
          [10.2174941385, 5.04048450284],
          [20, 4.18794475822],
        ]),
        { id: "S", knotVector: own }
      )
    )
    cad.option("Fit data")
    expect(spline(cad).startTangent).toBeCloseToPoint(p(15, 45), 6)
    cad.option("Add").click(p(0, 0)).option("After").click(p(2, 3))
    expect(spline(cad).startTangent).toBeUndefined()
    expectCurve(
      spline(cad),
      [
        [0, 0],
        [-0.666666666667, 1.15100460348],
        [-2, 3.45301381044],
        [12.6666666667, 3.94296777563],
        [20, 4.18794475822],
      ],
      [0, 0, 0, 0, 0.313859338365].concat(new Array(4).fill(0.627718676731))
    )
  })

  it("gives a closed CV spline fit points at its knots (k115)", () => {
    const cad = editClosedCv()
    cad.option("Fit data")
    expect(spline(cad)).toMatchObject({ method: "fit", closed: true })
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [46.6666666667, 16.6666666667],
        [33.3333333333, 16.6666666667],
        [33.3333333333, 3.33333333333],
        [46.6666666667, 3.33333333333],
      ])
    )
    expect(spline(cad).knotVector).toEqual([0, 1, 2, 3, 4])
  })
})

describe("Edit vertex", () => {
  it("adds the point as a vertex at the knot nearest it (k83, k84, k68)", () => {
    const onCurve = edit(cv())
    onCurve.option("Edit vertex").option("Add").click(p(14.375, 5))
    expect(spline(onCurve).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [5, 15],
        [14.375, 5],
        [20, -5],
        [40, 10],
      ])
    )
    expect(spline(onCurve).knotVector![4]).toBeCloseTo(0.5, 6)
    const off = edit(cv())
    off.option("Edit vertex").option("Add").click(p(30, 0))
    expect(spline(off).points[3]).toBeCloseToPoint(p(30, 0))
    expect(spline(off).knotVector![4]).toBeCloseTo(0.805555538603, 6)
    const twice = edit(cv())
    twice.option("Edit vertex").option("Add").click(p(5, 15)).click(p(10, 8))
    expect(spline(twice).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [5, 15],
        [5, 15],
        [10, 8],
        [20, -5],
        [40, 10],
      ])
    )
    expect(spline(twice).knotVector!.slice(4, 6)).toEqual([
      expect.closeTo(0.269279348971, 5),
      expect.closeTo(0.475290333922, 5),
    ])
  })

  it("adds nothing at an end (k129) and adds round a closed one (k124)", () => {
    const cad = edit(cv())
    cad.option("Edit vertex").option("Add").click(p(50, 30))
    expect(spline(cad).points).toHaveLength(4)
    const closed = editClosedCv()
    closed.option("Edit vertex").option("Add").click(p(46.66666667, 3.33333333))
    expect(spline(closed).points[1]).toBeCloseToPoint(
      p(46.66666667, 3.33333333)
    )
    expect(spline(closed).knotVector).toEqual([
      0,
      1,
      2,
      expect.closeTo(3, 6),
      3,
      4,
    ])
  })

  it("deletes a vertex with the knot nearest it, the degree dropping with none (k85, k111–k113, k130, k69, k104)", () => {
    const knotsAfter = (at: readonly number[]) => {
      const cad = edit(cv6())
      cad.option("Edit vertex").option("Delete").click(p(at[0], at[1]))
      return spline(cad).knotVector
    }
    expect(knotsAfter([20, -5])).toEqual([0, 0, 0, 0, 2, 3, 3, 3, 3])
    expect(knotsAfter([5, 15])).toEqual([0, 0, 0, 0, 2, 3, 3, 3, 3])
    expect(knotsAfter([0, 0])).toEqual([0, 0, 0, 0, 2, 3, 3, 3, 3])
    expect(knotsAfter([40, 0])).toEqual([0, 0, 0, 0, 1, 3, 3, 3, 3])
    expect(knotsAfter([30, 10])).toEqual([0, 0, 0, 0, 1, 3, 3, 3, 3])
    const cad = edit(cv())
    cad.option("Edit vertex").option("Delete").click(p(9, 11))
    expect(said(cad)).toContain("Not a control vertex.")
    cad.click(p(5, 15))
    expect(spline(cad)).toMatchObject({
      degree: 2,
      knotVector: [0, 0, 0, 1, 1, 1],
    })
    cad.click(p(20, -5))
    expect(spline(cad)).toMatchObject({ degree: 1, knotVector: [0, 0, 1, 1] })
    expect(said(cad).at(-1)).toBe("Cannot delete beyond this.")
  })

  it("elevates the order between the current one and 26 (k70, k86, k123)", () => {
    const cad = edit(cv())
    cad.option("Edit vertex").option("Elevate order")
    expect(asked(cad)).toBe("Enter new order <4>:")
    cad.type("3").enter()
    expect(said(cad)).toContain("Requires an integer between 4 and 26.")
    cad.type("5").enter()
    expect(spline(cad)).toMatchObject({ degree: 4 })
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [3.75, 11.25],
        [12.5, 5],
        [25, -1.25],
        [40, 10],
      ])
    )
    cad.option("Elevate order").type("26").enter()
    expect(spline(cad).degree).toBe(25)
    expect(spline(cad).points).toHaveLength(26)
    const closed = editClosedCv()
    closed.option("Edit vertex").option("Elevate order").type("5").enter()
    expect(spline(closed)).toMatchObject({ closed: true, degree: 4 })
    expect(spline(closed).knotVector).toEqual([
      0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 4,
    ])
    expect(spline(closed).points[0]).toBeCloseToPoint(
      p(46.6666666667, 16.6666666667)
    )
  })

  it("moves the vertex it steps to, staying at either end (k71, k107, k108)", () => {
    const cad = edit(cv())
    cad.option("Edit vertex").option("Move").option("Previous").click(p(5, 20))
    expect(spline(cad).points[0]).toBeCloseToPoint(p(5, 20))
    cad.option("Next").option("Next").option("Next")
    expect(asked(cad)).toBe(
      "Specify new location or [Next/Previous/Select point/eXit] <P>:"
    )
    cad.option("Next").click(p(45, 15))
    expect(spline(cad).points[3]).toBeCloseToPoint(p(45, 15))
  })

  it("weighs the vertex it steps to, making the spline rational (k11, k87, k109)", () => {
    const cad = edit(cv())
    cad.option("Edit vertex").option("Weight")
    expect(said(cad)).toContain("Spline is not rational. Will make it so.")
    cad
      .option("Next")
      .option("Next")
      .option("Next")
      .option("Next")
      .type("2")
      .enter()
    cad
      .option("Previous")
      .option("Previous")
      .option("Previous")
      .option("Previous")
    cad.option("Previous").type("3").enter()
    expect(spline(cad).weights).toEqual([3, 1, 1, 2])
    cad.type("0").enter()
    expect(said(cad)).toContain("Value must be positive and nonzero.")
    cad.option("Select point").click(p(20, -5)).type("2.5").enter()
    expect(spline(cad).weights).toEqual([3, 1, 2.5, 2])
  })

  it("takes a fit spline's fit data away at its first edit (k75, k102, k127)", () => {
    const cad = edit(fit())
    cad.option("Edit vertex").option("eXit")
    expect(spline(cad).method).toBe("fit")
    cad.option("Edit vertex").option("Move").option("Next").click(p(12, 12))
    expect(spline(cad).method).toBe("cv")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [12, 12],
        [10, 16.6666666667],
        [20, -6.66666666667],
        [26.6666666667, 4.44444444444],
        [30, 10],
      ])
    )
  })
})

describe("Join, convert to Polyline", () => {
  it("joins as JOIN does onto the spline, back at the first prompt (k72, k117)", () => {
    const cad = edit(cv(), lineOf(p(40, 10), p(50, 10)))
    cad.option("Join").click(p(45, 10)).enter()
    expect(said(cad)).toContain("1 object joined to source")
    expect(asked(cad)).toMatch(/^Enter an option \[Close\/Join/)
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [5, 15],
        [20, -5],
        [40, 10],
        [43.3333333333, 10],
        [46.6666666667, 10],
        [50, 10],
      ])
    )
    expect(spline(cad).knotVector).toEqual([0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2])
    expect(cad.typeCounts().line ?? 0).toBe(0)
  })

  it("replaces the spline by a polyline along it and ends (k73, k95)", () => {
    const cad = edit(cv())
    cad.option("convert to Polyline")
    expect(asked(cad)).toBe("Specify a precision <10>:")
    cad.type("100").enter()
    expect(said(cad)).toContain("Requires an integer between 0 and 99.")
    cad.enter()
    const polyline = cad.latest() as PolylineEntity
    expect(polyline.type).toBe("polyline")
    expect(cad.typeCounts().spline ?? 0).toBe(0)
    expect(cad.state().activeToolId).toBe("select")
    // AutoCAD's: 866 vertices on 2⁻¹⁰ of the span.
    expect(polyline.vertices.length).toBeGreaterThan(800)
    expect(polyline.vertices.length).toBeLessThan(950)
    const curve = splineCurve(cv())
    expect(polyline.vertices[1]).toBeCloseToPoint(
      bsplinePoint(curve, 1 / 1024),
      9
    )
  })
})

describe("Undo", () => {
  it("takes back a step of the first prompt at a time, then says so (k88, k98, k116)", () => {
    const cad = edit(cv())
    cad.option("Undo")
    expect(said(cad)).toContain("Command has been completely undone.")
    cad.option("Edit vertex").option("Move").option("Next").click(p(5, 20))
    cad.option("Next").click(p(25, -5)).option("eXit").option("eXit")
    cad.option("Close").option("Undo")
    expect(spline(cad).closed).toBe(false)
    cad.option("Undo")
    expect(spline(cad).points).toBeCloseToPoints(
      cv().points.map((q) => p(q.x, q.y))
    )
  })

  it("is one step for U after the command (k89)", () => {
    const cad = edit(cv())
    cad.option("Edit vertex").option("Move").option("Next").click(p(5, 20))
    cad.option("eXit").option("eXit").option("Close").option("eXit")
    cad.undo()
    expect(spline(cad)).toMatchObject({ closed: false })
    expect(spline(cad).points[1]).toBeCloseToPoint(p(5, 15))
  })
})
