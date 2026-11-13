import { describe, expect, it } from "vitest"
import type {
  Entity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import {
  createPolyline3d,
  createSpline,
  splineCurve,
} from "../../domain/entities"
import { splineInWorld } from "../../domain/splineEdits"
import { bsplinePoint, periodicLoop } from "../../geometry/nurbs"
import { createHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import { ptBR } from "../../locales/pt-BR"

// SPLINEDIT, as AutoCAD 2027's console asks it and leaves the spline (probes
// spline-knots/k11, k57–k146 and splinedit/p100–p166, traced, MPDUMP, en, es
// and pt-BR): each case the dump's control points, knots and weights, a fit
// spline's as its curve.

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
/** Answers typed at the command line, one after another. */
function answer(cad: ReturnType<typeof createHarness>, ...texts: string[]) {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}
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
    // AutoCAD's are 866 vertices on 2⁻¹⁰ of the span (k92); the tolerance
    // that rule is read by gives 871 here, the known gap.
    expect(polyline.vertices).toHaveLength(871)
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

const closedCv5 = () =>
  createSpline("cv", [p(30, 0), p(50, 0), p(55, 10), p(50, 20), p(30, 20)], {
    id: "S",
    closed: true,
  })
const closedFit5 = () =>
  createSpline("fit", [p(0, 0), p(20, 0), p(25, 10), p(20, 20), p(0, 20)], {
    id: "S",
    closed: true,
  })
/** SPLINEDIT on the only spline, by Last. */
const editLast = (s: SplineEntity) =>
  answer(createHarness({ entities: [s] }), "_SPLINEDIT", "_L")

describe("starting it (splinedit/p100, p145–p147, p158)", () => {
  it("repeats at Enter and echoes the rail's start (p100)", () => {
    const cad = edit(fit())
    cad.option("eXit").enter()
    expect(asked(cad)).toBe("Select spline:")
    const rail = createHarness({ entities: [fit()] }).tool("splinedit")
    expect(said(rail)[0]).toBe("_splinedit")
  })

  it("opens on a spline double-clicked, as `^C^C^R_splinedit` (DoubleClickRoot.cui)", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.doubleClick(p(10, 10))
    expect(said(cad)).toEqual(["_splinedit"])
    expect(cad.activeToolId()).toBe("splinedit")
    expect(asked(cad)).toMatch(/^Enter an option \[Close\/Join/)
  })

  it("edits the newest of the splines selected before it (p145, p158)", () => {
    const cad = createHarness({
      entities: [
        fit(),
        createSpline("fit", [p(0, 20), p(10, 30), p(20, 20)], { id: "T" }),
      ],
    })
    cad.select("T", "S").command("SPLINEDIT")
    expect(asked(cad)).toMatch(/^Enter an option \[Close\/Join/)
    cad.option("Close").option("eXit")
    expect(cad.byId<SplineEntity>("T").closed).toBe(true)
    expect(spline(cad).closed).toBe(false)
  })

  it("says a line selected before it is no spline and asks (p146)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 10))] })
    cad.select(cad.entities()[0].id).command("SPLINEDIT")
    expect(said(cad).slice(-2)).toEqual([
      "SPLINEDIT",
      "Object selected is not a spline.",
    ])
    expect(asked(cad)).toBe("Select spline:")
  })

  it("leaves nothing selected (p147)", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.select("S").command("SPLINEDIT").option("Close").option("eXit")
    expect(cad.selectedIds()).toEqual([])
  })

  it("says a Fit polyline is no spline (p103)", () => {
    const cad = createHarness({})
    answer(cad, "_PLINE", "0,0", "10,10", "20,0", "30,10", "")
    answer(cad, "_PEDIT", "0,0", "_F", "_X", "_SPLINEDIT", "0,0")
    expect(said(cad).at(-1)).toBe("Object selected is not a spline.")
    expect(asked(cad)).toBe("Select spline:")
  })

  it("takes a spline-fit 3D polyline as the CV spline on its frame (p165)", () => {
    const frame = [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 10, z: 5 },
      { x: 20, y: 0, z: 0 },
      { x: 30, y: 10, z: 5 },
    ]
    const cad = createHarness({ entities: [createPolyline3d(frame)] })
    answer(cad, "_PEDIT", "_L", "_S", "_X", "_SPLINEDIT", "_L", "_X")
    const made = cad.latest() as SplineEntity
    expect(made).toMatchObject({ type: "spline", method: "cv" })
    expect(made.knotVector).toEqual([0, 0, 0, 0, 1, 1, 1, 1])
    const points = splineInWorld(made).points
    frame.forEach((q, i) => {
      expect(points[i].x).toBeCloseTo(q.x, 9)
      expect(points[i].y).toBeCloseTo(q.y, 9)
      expect(points[i].z).toBeCloseTo(q.z, 9)
    })
  })
})

describe("a closed spline's edits (splinedit/p104–p112, p153–p156, p161)", () => {
  /** A fit spline cut by BREAK, so its knots are its own. */
  const ownKnotsPiece = () => {
    const cad = createHarness({})
    answer(cad, "_SPLINE", "0,0", "10,10", "20,0", "30,10", "")
    answer(cad, "_BREAK", "0,0", "_F", "12,6", "22,3")
    const piece = cad
      .entities()
      .find(
        (e): e is SplineEntity =>
          e.type === "spline" && Math.abs(e.points[0].x) < 1e-9
      )!
    return { cad, id: piece.id }
  }

  it("closes and opens a fit spline on knots of its own on chord knots, its tangents dropped (p104, p105)", () => {
    const { cad, id } = ownKnotsPiece()
    answer(cad, "_SPLINEDIT", "0,0", "_C")
    const closed = cad.byId<SplineEntity>(id)
    expect(closed.startTangent).toBeUndefined()
    expectCurve(
      closed,
      [
        [18.00967051234051, 4.112092843116738],
        [-9.326750735407735, -7.111327918333692],
        [6.996659776828878, 13.722095953082112],
      ],
      [0, 14.14213562373095, 18.577249982673884, 33.72268394987358],
      6
    )
    answer(cad, "_O", "_X")
    expectCurve(
      cad.byId<SplineEntity>(id),
      [
        [0, 0],
        [3.2388942153613174, 5.768811354802938],
        [7.4935378637532075, 13.346779314693622],
        [12.237065745826257, 8.316975921549409],
        [13.369530919167282, 7.116165614727936],
      ],
      [
        0, 0, 0, 0, 14.14213562373095, 18.577249982673884, 18.577249982673884,
        18.577249982673884, 18.577249982673884,
      ],
      6
    )
  })

  it("adds on a closed spline's uniform knots keeping them uniform (p106)", () => {
    const cad = editClosedCv()
    answer(cad, "_F", "_A", "33.33333333,16.66666667", "40,25", "", "")
    answer(cad, "_X", "_X")
    expectCurve(
      spline(cad),
      [
        [47.272727272727266, 35.90909090909091],
        [25.454545454545453, -4.090909090909092],
        [50.909090909090914, 0.454545454545456],
        [50.909090909090885, 22.27272727272727],
        [25.454545454545432, 10.454545454545464],
      ],
      [0, 1, 2, 3, 4, 5],
      6
    )
  })

  it("deletes a closed spline's fit points down to three, then says so (p107, p156, p154)", () => {
    const cad = editClosedCv()
    answer(cad, "_F", "_D", "33.33333333,16.66666667")
    expect(said(cad).at(-1)).toBe("Cannot delete beyond this.")
    expect(asked(cad)).toMatch(/^Enter a fit data option \[Add\/Open/)
    // Its uniform knots stay uniform (p107).
    expectCurve(
      spline(cad),
      [
        [51.11111111111111, -1.1111111111111092],
        [51.11111111111109, 25.555555555555554],
        [24.444444444444436, -1.1111111111111214],
      ],
      [0, 1, 2, 3],
      6
    )
    const four = editLast(closedFit())
    answer(four, "_F", "_D", "20,20")
    expect(said(four).at(-1)).toBe("Cannot delete beyond this.")
    expect(asked(four)).toMatch(/^Enter a fit data option/)
    expect(spline(four).points).toBeCloseToPoints(
      pts([
        [0, 0],
        [20, 0],
        [0, 20],
      ])
    )
    expectCurve(
      spline(four),
      [
        [-4.204012916545805, 34.652167915095475],
        [-6.306019374818705, -6.306019374818708],
        [34.65216791509545, -4.2040129165458024],
      ],
      [0, 20, 48.28427124746189, 68.28427124746189],
      6
    )
    const five = editLast(closedFit5())
    answer(five, "_F", "_D", "25,10")
    expect(said(five)).not.toContain("Cannot delete beyond this.")
    answer(five, "20,20")
    expect(said(five).at(-1)).toBe("Cannot delete beyond this.")
    expect(spline(five).points).toHaveLength(3)
  })

  it("deletes a closed CV spline's vertices down to three with AutoCAD's knot (p108, p153)", () => {
    const cad = editClosedCv()
    answer(cad, "_E", "_D", "50,20")
    expect(said(cad).at(-1)).toBe("Cannot delete beyond this.")
    expect(asked(cad)).toMatch(/^Enter a vertex editing option/)
    expectCurve(
      spline(cad),
      [
        [30, 0],
        [50, 0],
        [30, 20],
      ],
      [0, 1, 3, 4]
    )
    const five = editLast(closedCv5())
    answer(five, "_E", "_D", "55,10")
    expect(said(five)).not.toContain("Cannot delete beyond this.")
    answer(five, "50,20")
    expect(said(five).at(-1)).toBe("Cannot delete beyond this.")
    expectCurve(
      spline(five),
      [
        [30, 0],
        [50, 0],
        [30, 20],
      ],
      [0, 1, 4, 5]
    )
  })

  it("reverses a closed one on knots of its own to uniform knots (p109)", () => {
    const cad = editClosedCv()
    answer(cad, "_F", "_X", "_R", "_X")
    expectCurve(
      spline(cad),
      [
        [30, 0],
        [30, 20],
        [50, 20],
        [50, 0],
      ],
      [0, 1, 2, 3, 4],
      6
    )
  })

  it("walks a closed fit spline round to its closing point, the first again (p111, p112)", () => {
    const cad = edit(closedFit())
    answer(cad, "_F", "_M", "_P")
    // Previous at the first stays there (p111).
    expect(asked(cad)).toMatch(/<N>:$/)
    answer(cad, "_N", "_N", "_N")
    expect(asked(cad)).toMatch(/<N>:$/)
    answer(cad, "_N")
    expect(asked(cad)).toMatch(/<P>:$/)
    answer(cad, "-5,25", "_X", "_X", "_X")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [-5, 25],
        [20, 0],
        [20, 20],
        [0, 20],
      ])
    )
  })

  it("stops at a closed CV spline's last vertex (p161)", () => {
    const cad = editLast(closedCv5())
    answer(cad, "_E", "_M", "_N", "_N", "_N", "_N")
    expect(asked(cad)).toMatch(/<P>:$/)
    answer(cad, "_N", "35,25", "_X", "_X", "_X")
    expect(spline(cad).points).toBeCloseToPoints(
      pts([
        [30, 0],
        [50, 0],
        [55, 10],
        [50, 20],
        [35, 25],
      ])
    )
  })
})

describe("its prompts' answers (splinedit/p110, p113–p140, p149, p155, p160, p166)", () => {
  it("says a Select point that finds nothing, and asks again (p110, p160)", () => {
    const cad = edit(fit())
    answer(cad, "_F", "_M", "_S", "50,30")
    expect(said(cad).slice(-2)).toEqual([
      "Specify existing fit point on spline <exit>: 50,30",
      "Not a fit point.",
    ])
    expect(asked(cad)).toBe("Specify existing fit point on spline <exit>:")
    cad.enter()
    expect(asked(cad)).toMatch(/^Specify new location or/)
    const vertex = edit(cv())
    answer(vertex, "_E", "_M", "_S", "50,30")
    expect(said(vertex).at(-1)).toBe("Not a control vertex.")
    expect(asked(vertex)).toBe("Specify existing fit point on spline <exit>:")
  })

  it("says Undo at After or Before undoes all, and asks a fit point (p113)", () => {
    const cad = edit(fit())
    answer(cad, "_F", "_A", "0,0", "_U")
    expect(said(cad).at(-1)).toBe("All the additions are undone.")
    expect(asked(cad)).toBe("Specify new fit point to add <exit>:")
    cad.enter()
    expect(asked(cad)).toBe("Specify existing fit point on spline <exit>:")
    const spanish = createHarness({ entities: [fit()], locale: es })
    answer(spanish, "_SPLINEDIT", "0,0", "_F", "_A", "0,0", "_U")
    expect(said(spanish).at(-1)).toBe("Se ha deshecho todo lo que se añadió.")
  })

  it("reads `@`, a number, `*` and a polar point at Move, and `@` at Add from the point (p114, p115, p118, p119, p166)", () => {
    const at = edit(fit())
    answer(at, "_F", "_M", "@5,5", "_X", "_X", "_X")
    expect(spline(at).points[0]).toBeCloseToPoint(p(5, 5))
    const along = edit(fit())
    answer(along, "_F", "_M")
    along.moveTo(p(-4.2760177096543535 * 4, -2.5914614692721822 * 4))
    answer(along, "5", "_X", "_X", "_X")
    expect(spline(along).points[0]).toBeCloseToPoint(
      p(-4.2760177096543535, -2.5914614692721822),
      6
    )
    const world = createHarness({ entities: [cv()] })
    answer(world, "_UCS", "_Z", "30", "_SPLINEDIT", "0,0", "_E", "_M")
    answer(world, "*1,2", "_X", "_X", "_X")
    expect(spline(world).points[0]).toBeCloseToPoint(p(1, 2))
    const polar = edit(cv())
    answer(polar, "_E", "_M", "10<45", "_X", "_X", "_X")
    expect(spline(polar).points[0]).toBeCloseToPoint(
      p(7.0710678118654755, 7.0710678118654755)
    )
    const add = edit(fit())
    answer(add, "_F", "_A", "10.05,10.05", "@5,0", "", "", "_X", "_X")
    expect(spline(add).points[2]).toBeCloseToPoint(p(15, 10))
  })

  it("keeps a Z typed at Edit vertex's Move, off the spline's plane (p120)", () => {
    const cad = edit(cv())
    answer(cad, "_E", "_M", "1,2,7", "_X", "_X", "_X")
    const points = splineInWorld(spline(cad)).points
    expect(points[0].x).toBeCloseTo(1, 9)
    expect(points[0].y).toBeCloseTo(2, 9)
    expect(points[0].z).toBeCloseTo(7, 9)
    expect(points[1].z).toBeCloseTo(0, 9)
  })

  it("takes an object snap and leaves a typed point to Ortho (p116, p117)", () => {
    const snapped = createHarness({
      entities: [lineOf(p(-10, 20), p(-5, 25)), fit()],
    })
    answer(snapped, "_SPLINEDIT", "0,0", "_F", "_M", "_END", "-5.2,24.8")
    answer(snapped, "_X", "_X", "_X")
    expect(spline(snapped).points[0]).toBeCloseToPoint(p(-5, 25))
    const ortho = createHarness({ entities: [fit()] })
    answer(ortho, "ORTHOMODE", "1", "_SPLINEDIT", "0,0", "_F", "_M", "3,7")
    answer(ortho, "_X", "_X", "_X")
    expect(spline(ortho).points[0]).toBeCloseToPoint(p(3, 7))
  })

  it("refuses at each prompt as AutoCAD does (p133–p138, p140)", () => {
    const cad = edit(fit())
    for (const typed of ["0", "-1", "_A", "_LINE"]) {
      answer(cad, typed)
      expect(said(cad).at(-1)).toBe("Invalid option keyword.")
    }
    answer(cad, "_F", "_U")
    expect(said(cad).at(-1)).toBe("Invalid option keyword.")
    answer(cad, "_M")
    for (const typed of ["_U", "_LINE"]) {
      answer(cad, typed)
      expect(said(cad).at(-1)).toBe("Point or option keyword required.")
    }
    answer(cad, "_X", "_X", "_E")
    for (const typed of ["_U", "_C"]) {
      answer(cad, typed)
      expect(said(cad).at(-1)).toBe("Invalid option keyword.")
    }
  })

  it("takes E, and `_E` in any language, as Fit data's eXit (p139, p155)", () => {
    const cad = edit(fit())
    answer(cad, "_F", "E")
    expect(asked(cad)).toMatch(/^Enter an option \[Close\/Join/)
    const spanish = createHarness({ entities: [fit()], locale: es })
    answer(spanish, "_SPLINEDIT", "0,0", "_F", "_E")
    expect(asked(spanish)).toMatch(/^Indique una opción \[Cerrar\/Unir/)
  })

  it("offers the current order at Elevate order (p149)", () => {
    const cad = edit(cv())
    answer(cad, "_E", "_O", "6", "_X", "_X", "_SPLINEDIT", "0,0", "_E", "_O")
    expect(asked(cad)).toBe("Enter new order <6>:")
  })
})

describe("transparency and undo (splinedit/p121–p132)", () => {
  it("runs 'ZOOM at every prompt and resumes; refuses 'LINE (p121–p129)", () => {
    const steps: [string[], RegExp][] = [
      [["_SPLINEDIT"], /^Select spline:/],
      [["0,0"], /^Enter an option/],
      [["_F"], /^Enter a fit data option/],
      [["_M"], /^Specify new location/],
      [["_X", "_T"], /^Specify start tangent/],
      [["", "", "_X", "_E", "_W"], /^Enter new weight/],
      [["_X", "_O"], /^Enter new order/],
      [["", "_X", "_P"], /^Specify a precision/],
    ]
    const cad = createHarness({ entities: [fit()] })
    for (const [answers, prompt] of steps) {
      answer(cad, ...answers)
      expect(asked(cad)).toMatch(prompt)
      answer(cad, "'_ZOOM", "_E")
      expect(asked(cad)).toMatch(prompt)
      expect(said(cad).at(-1)).toBe("Resuming SPLINEDIT command.")
    }
    const line = edit(fit())
    answer(line, "'_LINE")
    expect(said(line).slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Invalid option keyword.",
    ])
  })

  it("is named for U, REDO, MREDO and UNDO (p130–p132)", () => {
    const cad = edit(fit())
    answer(cad, "_C", "_X", "_U")
    expect(said(cad).at(-1)).toBe("SPLINEDIT")
    answer(cad, "_REDO")
    expect(said(cad).slice(-2)).toEqual([
      "SPLINEDIT",
      "Everything has been redone",
    ])
    answer(cad, "_MREDO", "1")
    expect(said(cad).at(-1)).toBe("Nothing to redo")
    const spanish = createHarness({ entities: [fit()], locale: es })
    answer(spanish, "_SPLINEDIT", "0,0", "_C", "_X", "_U")
    expect(said(spanish).at(-1)).toBe("EDITSPLINE")
    // A run that changed nothing is a step too (p131).
    const nothing = edit(fit())
    answer(nothing, "_X", "_U")
    expect(said(nothing).at(-1)).toBe("SPLINEDIT")
    const two = createHarness({})
    answer(two, "_SPLINE", "0,0", "10,10", "20,0", "30,10", "")
    answer(two, "_SPLINEDIT", "0,0", "_C", "_R", "_X", "_UNDO", "2")
    expect(said(two).at(-1)).toBe("SPLINEDIT SPLINE")
  })
})

describe("convert to Polyline (splinedit/p142–p152, p157, p159, p163, p164)", () => {
  it("carries the spline's properties (p142)", () => {
    const cad = createHarness({
      entities: [
        {
          ...fit(),
          color: "#ff0000",
          linetype: "DASHED",
          lineweight: 0.5,
        },
      ],
    })
    answer(cad, "_SPLINEDIT", "0,0", "_P", "")
    expect(cad.latest()).toMatchObject({
      type: "polyline",
      color: "#ff0000",
      linetype: "DASHED",
      lineweight: 0.5,
    })
  })

  it("makes a 3D polyline of a tilted spline, in both commands (p143, p157, p164)", () => {
    const tilted = () => {
      const cad = createHarness({})
      answer(cad, "_UCS", "_X", "90")
      answer(cad, "_SPLINE", "0,0", "10,10", "20,0", "30,10", "")
      return cad
    }
    const world = answer(tilted(), "_UCS", "_W", "_SPLINEDIT", "_L", "_P", "")
    expect(world.latest().type).toBe("polyline3d")
    const inIts = answer(tilted(), "_SPLINEDIT", "_L", "_P", "")
    const made = inIts.latest() as Polyline3dEntity
    expect(made.type).toBe("polyline3d")
    expect(made.vertices.at(-1)!.x).toBeCloseTo(30, 9)
    expect(made.vertices.at(-1)!.z).toBeCloseTo(10, 9)
    const pedit = answer(tilted(), "_UCS", "_W", "_PEDIT", "_L", "", "", "_X")
    expect(pedit.latest().type).toBe("polyline3d")
  })

  it("makes a 2D polyline at the elevation of a spline lying level (p144)", () => {
    const cad = createHarness({})
    answer(cad, "_SPLINE", "0,0,5", "10,10,5", "20,0,5", "30,10,5", "")
    answer(cad, "_UCS", "_Z", "30", "_SPLINEDIT", "_L", "_P", "")
    expect(cad.latest()).toMatchObject({ type: "polyline", elevation: 5 })
  })

  it("keeps its precision for the session, shared with PEDIT, not with the drawing (p148, p150–p152, p159, p163)", () => {
    const cad = createHarness({ entities: [cv()] })
    answer(cad, "_SPLINEDIT", "0,0", "_P", "5")
    answer(cad, "_SPLINE", "_M", "_CV", "0,20", "5,35", "20,15", "40,30", "")
    answer(cad, "_SPLINEDIT", "_L", "_P")
    expect(asked(cad)).toBe("Specify a precision <5>:")
    answer(cad, "")
    // PEDIT asks the same value and sets it for both (p152).
    answer(cad, "_SPLINE", "_M", "_CV", "0,-20", "5,-5", "20,-25", "40,-10", "")
    answer(cad, "_PEDIT", "_L", "")
    expect(asked(cad)).toBe("Specify a precision <5>:")
    answer(cad, "4", "_X")
    answer(cad, "_SPLINE", "_M", "_CV", "0,40", "5,55", "20,35", "40,50", "")
    answer(cad, "_PEDIT", "_M", "_L", "", "")
    expect(asked(cad)).toBe("Specify a precision for spline conversion <4>:")
    answer(cad, "3", "_X")
    // Through NEW and OPEN, kept (p159, p163).
    const file = cad.runtime.serializeDrawing()
    cad.runtime.newDrawing()
    cad.runtime.loadDrawing(file)
    answer(cad, "_SPLINE", "_M", "_CV", "0,60", "5,75", "20,55", "40,70", "")
    answer(cad, "_SPLINEDIT", "_L", "_P")
    expect(asked(cad)).toBe("Specify a precision <3>:")
  })

  it("refuses a precision out of range, in both commands (p141, p150, p151)", () => {
    const cad = edit(cv())
    answer(cad, "_P")
    for (const typed of ["FOO", "-1", "5.5", "100"]) {
      answer(cad, typed)
      expect(said(cad).at(-1)).toBe("Requires an integer between 0 and 99.")
    }
    const pedit = createHarness({ entities: [cv()] })
    answer(pedit, "_PEDIT", "0,0", "")
    for (const typed of ["FOO", "100", "-1", "5.5"]) {
      answer(pedit, typed)
      expect(said(pedit).at(-1)).toBe("Requires an integer between 0 and 99.")
    }
    const multiple = createHarness({ entities: [cv()] })
    answer(multiple, "_PEDIT", "_M", "0,0", "", "")
    for (const typed of ["FOO", "100"]) {
      answer(multiple, typed)
      expect(said(multiple).at(-1)).toBe(
        "Requires an integer between 0 and 99."
      )
    }
  })
})

describe("SPLINEDIT in Brazilian Portuguese (splinedit/p102, p108, p110, p113 pt-BR)", () => {
  it("lists Reverse as the open and the closed prompt list it", () => {
    const cad = createHarness({ entities: [fit()], locale: ptBR })
    answer(cad, "_SPLINEDIT", "0,0")
    expect(asked(cad)).toBe(
      "Insira uma opção [Fechar/Unir/AJustar dados/Editar vértice/converter para Polilinha/REverter/Desfazer/saIr] <saIr>:"
    )
    answer(cad, "_C")
    expect(asked(cad)).toBe(
      "Insira uma opção [Abrir/AJustar dados/Editar vértice/converter para Polilinha/Reverter/Desfazer/saIr] <saIr>:"
    )
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes pedit/p320–p338):
// LASTPOINT after `Select spline:` and each point SPLINEDIT asks, as `ID @`
// says it once SPLINEDIT ends.
describe("SPLINEDIT's LASTPOINT and its pick", () => {
  type Harness = ReturnType<typeof createHarness>
  /** p320's fit spline, LASTPOINT moved off it first. */
  const fitted = () =>
    answer(
      createHarness(),
      ...["_SPLINE", "0,0", "50,30", "100,0", "", "_ID", "99,99"]
    )
  /** p324's CV spline. */
  const byVertices = () =>
    answer(
      createHarness(),
      ...["_SPLINE", "_M", "_CV", "0,0", "30,40", "70,40", "100,0", ""],
      ...["_ID", "99,99"]
    )
  const lastPoint = (cad: Harness) =>
    answer(cad, "_ID", "@").commandLog().at(-1)
  const at = (x: number, y: number) =>
    ` X = ${x.toFixed(2)}     Y = ${y.toFixed(2)}     Z = 0.00`
  const only = (cad: Harness) => cad.only<SplineEntity>("spline")

  it("is the point a pick typed or clicked, on the plane off the plan too (p320, LPT-04)", () => {
    expect(lastPoint(answer(fitted(), "_SPLINEDIT", "0,0", ""))).toBe(at(0, 0))
    const clicked = fitted()
    clicked.command("SPLINEDIT").click(p(0, 0))
    expect(lastPoint(answer(clicked, ""))).toBe(at(0, 0))
    // Seen from 1,-1,1, the pixel of 0,0,20 is that of -20,20,0 on the work
    // plane, where a click that picks leaves LASTPOINT (solid-inquiry/d10).
    const off = answer(
      createHarness(),
      ...["_SPLINE", "0,0,20", "50,30,20", "100,0,20", ""],
      ...["VPOINT", "1,-1,1", "_ID", "7,7,7", "_SPLINEDIT"]
    )
    off.click({ x: 0, y: 0, z: 20 })
    expect(asked(off)).toMatch(/^Enter an option/)
    expect(lastPoint(answer(off, ""))).toBe(at(-20, 20))
  })

  it("is the point an object snap override found at the pick (p327)", () => {
    const cad = answer(fitted(), "_SPLINEDIT", "_END", "1,1")
    expect(asked(cad)).toMatch(/^Enter an option/)
    expect(lastPoint(answer(cad, ""))).toBe(at(0, 0))
  })

  it("says a locked spline and asks again, no window (p328)", () => {
    for (const [locale, lines] of [
      [
        undefined,
        [
          "Select spline: 0,0",
          "1 was on a locked layer.",
          "Select spline: 0,40",
        ],
      ],
      [
        es,
        [
          "Designe spline: 0,0",
          "1 estaba en una capa bloqueada.",
          "Designe spline: 0,40",
        ],
      ],
    ] as const) {
      const cad = createHarness({ locale })
      cad.runtime.document.load(
        [
          createSpline("fit", [p(0, 0), p(50, 30), p(100, 0)], {
            id: "K",
            layerId: "L1",
          }),
          createSpline("fit", [p(0, 40), p(50, 70), p(100, 40)], { id: "S" }),
        ],
        { layers: [layerOf("0"), layerOf("L1", { locked: true })] }
      )
      answer(cad, "_SPLINEDIT", "0,0", "0,40")
      expect(cad.commandLog().slice(-3)).toEqual(lines)
      answer(cad, "_C", "")
      expect(spline(cad).closed).toBe(true)
      expect(cad.byId<SplineEntity>("K").closed).toBe(false)
      expect(lastPoint(cad)).toMatch(/ 0[.,]00 .* 40[.,]00 /)
    }
  })

  it("is the point fit data's and Edit vertex's Move give, `@` from it (p321, p325, p335, p336)", () => {
    const fit = answer(fitted(), "_SPLINEDIT", "0,0", "_F", "_M", "10,10")
    expect(lastPoint(answer(fit, "_X", "_X", ""))).toBe(at(10, 10))
    const cv = answer(byVertices(), "_SPLINEDIT", "0,0", "_E", "_M", "10,10")
    expect(lastPoint(answer(cv, "_X", "_X", ""))).toBe(at(10, 10))
    const fitAt = answer(fitted(), "_SPLINEDIT", "0,0", "_F", "_M", "10,10")
    answer(fitAt, "@5,0", "_X", "_X")
    expect(only(fitAt).points[0]).toEqual({ x: 15, y: 10, z: 0 })
    const cvAt = answer(byVertices(), "_SPLINEDIT", "0,0", "_E", "_M", "10,10")
    answer(cvAt, "@5,0", "_X", "_X")
    expect(only(cvAt).points[0]).toEqual({ x: 15, y: 10, z: 0 })
  })

  it("is fit Add's new point, else the existing one picked (p329, p338)", () => {
    const added = answer(fitted(), "_SPLINEDIT", "0,0", "_F", "_A", "50,30")
    answer(added, "70,25", "", "", "_X", "")
    expect(lastPoint(added)).toBe(at(70, 25))
    const none = answer(fitted(), "_SPLINEDIT", "0,0", "_F", "_A", "50,30")
    expect(lastPoint(answer(none, "", "", "_X", ""))).toBe(at(50, 30))
  })

  it("is the end fit point after Tangents (p323, p330, p334)", () => {
    for (const answers of [
      ["10,10", "20,0"],
      ["10,10", ""],
      ["_S", "20,0"],
    ]) {
      const cad = answer(fitted(), "_SPLINEDIT", "0,0", "_F", "_T", ...answers)
      expect(lastPoint(answer(cad, "_X", ""))).toBe(at(100, 0))
    }
  })

  it("is kept by Edit vertex's Add and Delete and fit data's Delete (p324, p331, p337)", () => {
    const add = answer(byVertices(), "_SPLINEDIT", "0,0", "_E", "_A", "50,30")
    expect(lastPoint(answer(add, "", "_X", ""))).toBe(at(0, 0))
    const del = answer(byVertices(), "_SPLINEDIT", "0,0", "_E", "_D", "30,40")
    expect(lastPoint(answer(del, "", "_X", ""))).toBe(at(0, 0))
    const fitDelete = answer(
      createHarness(),
      ...["_SPLINE", "0,0", "50,30", "70,10", "100,0", "", "_ID", "99,99"],
      ...["_SPLINEDIT", "0,0", "_F", "_D", "50,30", "", "_X", ""]
    )
    expect(lastPoint(fitDelete)).toBe(at(0, 0))
  })
})

// The desktop's SPLINEDIT (es-ES, desktop splinedit/d01, d02).
describe("SPLINEDIT's look", () => {
  const big = () =>
    createSpline("fit", [p(0, 0), p(100, 100), p(200, 0), p(300, 100)], {
      id: "S",
    })
  type H = ReturnType<typeof createHarness>
  const near = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y) < 1
  /** A solid path starting or ending at `world`: the ghost of the spline moved there. */
  const ghostThrough = (cad: H, world: { x: number; y: number }) => {
    const at = cad.runtime.viewport.worldToScreen(world)
    return cad
      .scene()
      .primitives.some(
        (q) =>
          q.kind === "path" &&
          !q.stroke?.dash &&
          q.points.length > 2 &&
          (near(q.points[0], at) || near(q.points.at(-1)!, at))
      )
  }
  const band = (cad: H) =>
    cad
      .scene()
      .primitives.find(
        (q) => q.kind === "segment" && q.stroke.color === THEME.dashedRubberBand
      )
  const frame = (cad: H) =>
    cad
      .scene()
      .primitives.filter(
        (q) => q.kind === "path" && q.stroke?.color === THEME.splineEditFrame
      )

  it("drags a ghost of the curve and an amber band at Fit data's Move (d01-4, d02-2, d02-3)", () => {
    const cad = answer(edit(big()), "_F", "_M")
    cad.moveTo(p(40, 120))
    expect(ghostThrough(cad, p(40, 120))).toBe(true)
    const line = band(cad)
    expect(line?.kind === "segment" && line.stroke.dash).toEqual([2, 3])
  })

  it("drags a ghost and an amber band at Edit vertex's Move (d01-6)", () => {
    const cad = answer(edit(big()), "_E", "_M")
    cad.moveTo(p(40, 120))
    expect(ghostThrough(cad, p(40, 120))).toBe(true)
    expect(band(cad)).toBeDefined()
  })

  it("draws the control frame dashed while Edit vertex runs, not before (d01-5)", () => {
    const cad = edit(big())
    expect(frame(cad)).toHaveLength(0)
    answer(cad, "_F")
    expect(frame(cad)).toHaveLength(0)
    answer(cad, "_X", "_E")
    const [path] = frame(cad)
    expect(path?.kind === "path" && path.stroke?.dash).toEqual([2, 3])
    expect(path?.kind === "path" && path.points.length).toBe(6)
    answer(cad, "_M")
    expect(frame(cad)).toHaveLength(1)
  })
})
