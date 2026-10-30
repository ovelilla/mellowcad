import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import type { SplineEntity } from "../../domain/entities"
import {
  createSpline,
  entityPointToWorld,
  isLevelSpline,
  splineCurve,
  splineOnItsPlane,
  splinePolyline,
} from "../../domain/entities"
import { bsplineDomain } from "../../geometry/nurbs"
import { parseDrawingFile } from "../../serialization/drawingFile"

// AutoCAD 2027's console is the reference for every point below: the same
// answers there, read back with MPDUMP and entget (probes spline/p200–p269
// and spline3d/s01–s14).

function typed(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...answers: string[]): string[] {
  const from = cad.commandLog().length
  typed(cad, ...answers)
  return cad.commandLog().slice(from)
}

const round = (n: number) => Math.round(n * 1e6) / 1e6 + 0

function spline(cad: CadHarness): SplineEntity {
  return cad.only<SplineEntity>("spline")
}

/** Its fit points or control vertices in the WCS, as MPDUMP lists them. */
function worldPoints(entity: SplineEntity): number[][] {
  return entity.points.map((q) => {
    const w = entityPointToWorld(entity, q)
    return [round(w.x), round(w.y), round(w.z)]
  })
}

/** The control points of the curve it draws, in the WCS. */
function controlPoints(entity: SplineEntity): number[][] {
  return splineCurve(entity).controlPoints.map((q) => {
    const w = entityPointToWorld(entity, q)
    return [round(w.x), round(w.y), round(w.z)]
  })
}

function normal(entity: SplineEntity): number[] {
  const n = entity.normal ?? { x: 0, y: 0, z: 1 }
  return [round(n.x), round(n.y), round(n.z)]
}

/** p200's fit spline, in no plane, its view zoomed to it. */
const RISING = ["SPLINE", "0,0,5", "10,10,5", "20,0,8", "30,10,-3", ""]
const ZOOMED = [...RISING, "ZOOM", "W", "-5,-10", "35,20"]

describe("SPLINE in space", () => {
  it("keeps each fit point's Z, its knots the chords in space (p200)", () => {
    const cad = typed(createHarness(), ...RISING)
    const drawn = spline(cad)
    expect(worldPoints(drawn)).toEqual([
      [0, 0, 5],
      [10, 10, 5],
      [20, 0, 8],
      [30, 10, -3],
    ])
    expect(drawn.normal).toBeUndefined()
    expect(isLevelSpline(drawn)).toBe(false)
    expect(bsplineDomain(splineCurve(drawn)).end).toBeCloseTo(
      46.51544078570083,
      9
    )
    expect(controlPoints(drawn)).toEqual([
      [0, 0, 5],
      [3.315507, 5.40596, 4.517095],
      [10.020299, 16.338176, 3.540538],
      [21.281175, -7.238906, 11.588284],
      [26.893791, 3.858386, 2.197291],
      [30, 10, -3],
    ])
  })

  it("lays a point without Z at ELEVATION as it then is (p265, p231)", () => {
    const cad = typed(createHarness(), "ELEV", "5", "0", "SPLINE")
    typed(cad, "0,0,7", "10,10", "20,0", "")
    expect(worldPoints(spline(cad))).toEqual([
      [0, 0, 7],
      [10, 10, 5],
      [20, 0, 5],
    ])
    expect(controlPoints(spline(cad))[1]).toEqual([3.325, 5.016584, 6.165842])
  })

  it("keeps one whose points lie in a tilted plane in that plane (p223, s05)", () => {
    const cad = typed(createHarness(), "ELEV", "5", "0")
    typed(cad, "SPLINE", "0,0", "10,10", "20,0,3", "")
    const drawn = spline(cad)
    expect(normal(drawn)).toEqual([0.099015, -0.099015, 0.990148])
    expect(isLevelSpline(drawn)).toBe(true)
    expect(worldPoints(drawn)).toEqual([
      [0, 0, 5],
      [10, 10, 5],
      [20, 0, 3],
    ])
    expect(controlPoints(drawn)[2]).toEqual([10.057759, 15.000327, 5.494257])
  })

  it("stands one on a line upright, its normal Z × the line (s07, s08)", () => {
    const two = typed(createHarness(), "SPLINE", "0,0,0", "10,10,5", "")
    expect(normal(spline(two))).toEqual([-0.707107, 0.707107, 0])
    const three = typed(createHarness(), "SPLINE", "0,0,0", "10,10,5")
    typed(three, "20,20,10", "")
    expect(normal(spline(three))).toEqual([-0.707107, 0.707107, 0])
    expect(worldPoints(spline(three))[2]).toEqual([20, 20, 10])
  })

  it("keeps a CV spline's vertices in space, or in their plane (p216, s09)", () => {
    const free = typed(createHarness(), "SPLINE", "M", "CV", "0,0,5")
    typed(free, "10,10,9", "@10,-10", "30,10", "")
    expect(worldPoints(spline(free))).toEqual([
      [0, 0, 5],
      [10, 10, 9],
      [20, 0, 9],
      [30, 10, 0],
    ])
    expect(spline(free).normal).toBeUndefined()
    const tilted = typed(createHarness(), "SPLINE", "M", "CV", "0,0,0")
    typed(tilted, "10,0,0", "10,10,10", "0,10,10", "")
    expect(normal(spline(tilted))).toEqual([0, -0.707107, 0.707107])
  })

  it("closes three points in their plane (s11, s15)", () => {
    const cad = typed(createHarness(), "SPLINE", "0,0,0", "10,0,5")
    typed(cad, "10,10,0", "C", "ZOOM", "W", "-5,-5", "15,15")
    expect(normal(spline(cad))).toEqual([-0.408248, 0.408248, 0.816497])
    expect(written(cad, "AREA", "O", "10,10")).toContain(
      "Area = 130.79, Perimeter = 41.30"
    )
  })

  it("takes a tangent in space, and so lies in no plane (s10, s12)", () => {
    const start = typed(createHarness(), "SPLINE", "0,0,0", "T", "@1,0,1")
    typed(start, "10,0,0", "20,5,0", "")
    expect(spline(start).startTangent).toEqual({ x: 1, y: 0, z: 1 })
    expect(spline(start).normal).toBeUndefined()
    expect(isLevelSpline(spline(start))).toBe(false)
    const end = typed(createHarness(), "SPLINE", "0,0,0", "10,0,0")
    typed(end, "20,5,0", "T", "@0,1,1")
    const tangent = spline(end).endTangent!
    expect([tangent.x, round(tangent.y), round(tangent.z)]).toEqual([
      0, 0.707107, 0.707107,
    ])
  })

  it("has no area in no plane, and one in its tilted plane (s01, s02)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    expect(written(cad, "AREA", "O", "10,10")).toEqual([
      "AREA",
      "Specify first corner point or [Object/Add area/Subtract area] <Object>: O",
      "Select objects: 10,10",
      "Selected object does not have an area",
    ])
    typed(cad, "")
    const tilted = typed(createHarness(), "SPLINE", "0,0", "10,10,7", "20,0")
    typed(tilted, "", "ZOOM", "W", "-5,-5", "25,15")
    expect(written(tilted, "AREA", "O", "10,10")).toContain(
      "Area = 152.58, Length = 32.55"
    )
  })

  it("is snapped to at its ends, middle and nearest points in space (s03)", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    const id = (snap: string, at: string) => written(cad, "ID", snap, at).at(-1)
    expect(id("_END", "29.9,9.9")).toBe(
      " X = 30.00     Y = 10.00     Z = -3.00"
    )
    expect(id("_END", "0.1,0.1")).toBe(" X = 0.00     Y = 0.00     Z = 5.00")
    expect(id("_MID", "10,10")).toBe(" X = 16.44     Y = 3.70     Z = 7.54")
    expect(id("_NEA", "20,0")).toBe(" X = 20.00     Y = 0.00     Z = 8.00")
  })

  it("aligns UCS OBject from its nearer end to the other in space (s04)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "UCS", "OB", "0.2,0.2")
    const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
    expect([origin.x, origin.y, origin.z]).toEqual([0, 0, 5])
    expect([xAxis.x, xAxis.y, xAxis.z].map(round)).toEqual([
      0.919709, 0.30657, -0.245256,
    ])
    expect([yAxis.x, yAxis.y, yAxis.z].map(round)).toEqual([
      -0.316228, 0.948683, 0,
    ])
  })

  it("lays UCS ZAxis Object's Z along its end in space (s16)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "UCS", "ZA", "O", "29.9,9.9")
    const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
    expect([origin.x, origin.y, origin.z].map(round)).toEqual([30, 10, -3])
    expect([xAxis.x, xAxis.y, xAxis.z].map(round)).toEqual([
      -0.89236, 0.451324, 0,
    ])
    expect([yAxis.x, yAxis.y, yAxis.z].map(round)).toEqual([
      0.271981, 0.537762, 0.798022,
    ])
  })

  it("aligns UCS OBject with a tilted plane's (s05)", () => {
    const cad = typed(createHarness(), "SPLINE", "0,0", "10,10,7", "20,0")
    typed(cad, "", "ZOOM", "W", "-5,-5", "25,15", "UCS", "OB", "0.2,0.2")
    const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
    expect([origin.x, origin.y, origin.z].map(round)).toEqual([0, 0, 0])
    expect([xAxis.x, xAxis.y, xAxis.z].map(round)).toEqual([1, 0, 0])
    expect([yAxis.x, yAxis.y, yAxis.z].map(round)).toEqual([
      0, 0.819232, 0.573462,
    ])
  })

  it("stretches the points the window catches, Z and all (s06)", () => {
    const cad = typed(createHarness(), ...ZOOMED, "STRETCH", "C", "19,-1")
    typed(cad, "31,11", "", "0,0", "0,0,10")
    expect(worldPoints(spline(cad))).toEqual([
      [0, 0, 5],
      [10, 10, 5],
      [20, 0, 18],
      [30, 10, 7],
    ])
  })

  it("moves in space, its points' Z with it", () => {
    const cad = typed(createHarness(), ...ZOOMED, "MOVE", "L", "", "0,0,0")
    typed(cad, "1,2,3")
    expect(worldPoints(spline(cad))[3]).toEqual([31, 12, 0])
  })

  it("shows its points' Z, and No for Planar, in the Properties palette (desktop spline/d10-1)", () => {
    const cad = typed(createHarness(), ...RISING)
    cad.select(spline(cad).id)
    const rows = () =>
      cad
        .state()
        .properties.info!.groups.flatMap((g) => g.rows)
        .map((r) => [r.label, r.value])
    expect(rows()).toContainEqual(["Fit point Z", "5.00"])
    expect(rows()).toContainEqual(["Planar", "No"])
    cad.runtime.setSelectionProperty("vertex", "4")
    cad.runtime.setSelectionProperty("vertexZ", "8")
    expect(worldPoints(spline(cad))[3]).toEqual([30, 10, 8])
  })

  it("moves a grip's point to the one given, Z and all", () => {
    const cad = typed(createHarness(), ...ZOOMED)
    cad.select(spline(cad).id)
    cad.drag({ x: 30, y: 10 }, { x: 30, y: 15 })
    expect(worldPoints(spline(cad))[3]).toEqual([30, 15, 0])
  })
})

describe("a spline in space", () => {
  it("is drawn through its points' Z off the plan (front view)", () => {
    const cad = typed(createHarness(), ...RISING, "ZOOM", "E")
    cad.command("-VPOINT").type("0,-1,0").enter()
    typed(cad, "ZOOM", "E")
    const [path] = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "path")
    const ys = path.kind === "path" ? path.points.map((q) => q.y) : []
    const xs = path.kind === "path" ? path.points.map((q) => q.x) : []
    const tall = Math.max(...ys) - Math.min(...ys)
    const wide = Math.max(...xs) - Math.min(...xs)
    // In front, X runs across and Z up, at one scale.
    const curve = splinePolyline(spline(cad))
    const span = (values: number[]) => Math.max(...values) - Math.min(...values)
    expect(tall / wide).toBeCloseTo(
      span(curve.map((q) => q.z)) / span(curve.map((q) => q.x)),
      3
    )
    expect(tall / wide).toBeGreaterThan(0.3)
  })

  it("is saved with its points' Z, and read back as it was", () => {
    const cad = typed(createHarness(), ...RISING)
    const [loaded] = parseDrawingFile(cad.runtime.serializeDrawing()).entities
    expect(loaded).toEqual(spline(cad))
  })

  it("reads an older file's points at the elevation it gave them", () => {
    const cad = typed(createHarness(), "SPLINE", "0,0", "10,10", "20,0", "")
    const file = JSON.parse(cad.runtime.serializeDrawing())
    file.version = 36
    const [entity] = file.entities
    entity.elevation = 5
    entity.points = entity.points.map((q: { x: number; y: number }) => ({
      x: q.x,
      y: q.y,
    }))
    const [loaded] = parseDrawingFile(JSON.stringify(file)).entities
    expect(worldPoints(loaded as SplineEntity)).toEqual([
      [0, 0, 5],
      [10, 10, 5],
      [20, 0, 5],
    ])
  })

  it("is kept in no plane when its points lie in none", () => {
    const free = createSpline("fit", [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 0 },
      { x: 10, y: 10, z: 0 },
      { x: 0, y: 10, z: 5 },
    ])
    expect(splineOnItsPlane(free)).toBe(free)
  })
})
