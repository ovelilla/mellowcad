import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  entityElevation,
  entityThickness,
  lineEndZ,
  lineStartZ,
  withElevation,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"

/**
 * ELEV sets ELEVATION and THICKNESS, saved in the drawing: a point without a Z
 * lies ELEVATION above the UCS's XY plane, and LINE, CIRCLE, ARC, PLINE and
 * POLYGON extrude what they draw by THICKNESS. RECTANG has options of its own.
 */

function settings(cad: CadHarness) {
  return cad.runtime.document.getSettings()
}

function elev(cad: CadHarness, elevation: string, thickness: string) {
  return cad.command("ELEV").type(elevation).enter().type(thickness).enter()
}

describe("ELEV", () => {
  it("asks the elevation, then the thickness, offering the current values", () => {
    const cad = createHarness()

    cad.command("ELEV")
    expect(cad.state().dynamicInput?.fields[0]).toMatchObject({
      label: "Specify new default elevation",
      placeholder: "0.00",
    })
    cad.type("5").enter()
    expect(cad.state().dynamicInput?.fields[0]).toMatchObject({
      label: "Specify new default thickness",
      placeholder: "0.00",
    })
    cad.type("-2").enter()

    expect(settings(cad)).toMatchObject({ elevation: 5, thickness: -2 })
    expect(cad.state().activeToolId).toBe("select")

    cad.command("ELEV")
    expect(cad.state().dynamicInput?.fields[0].placeholder).toBe("5.00")
  })

  it("keeps a value answered with Enter", () => {
    const cad = createHarness()
    elev(cad, "5", "2")

    cad.command("ELEV").enter().type("3").enter()

    expect(settings(cad)).toMatchObject({ elevation: 5, thickness: 3 })
  })

  it("is one undo step", () => {
    const cad = createHarness()

    elev(cad, "5", "2").undo()

    expect(settings(cad)).toMatchObject({ elevation: 0, thickness: 0 })
  })

  it("changes nothing when cancelled at the thickness", () => {
    const cad = createHarness()

    cad.command("ELEV").type("5").enter().escape()

    expect(settings(cad).elevation).toBe(0)
  })

  it("is saved with the drawing", () => {
    const cad = createHarness()
    elev(cad, "5", "2")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(settings(copy)).toMatchObject({ elevation: 5, thickness: 2 })
  })
})

describe("ELEVATION", () => {
  it("is where a picked or typed point without a Z lies", () => {
    const cad = createHarness()
    elev(cad, "5", "0")

    cad.command("LINE").click(p(0, 0)).type("#100,0").enter().escape()

    const line = cad.only<LineEntity>("line")
    expect(lineStartZ(line)).toBe(5)
    expect(lineEndZ(line)).toBe(5)
  })

  it("is measured from the UCS's XY plane", () => {
    const cad = createHarness()
    cad.command("UCS").type("0,0,3").enter().enter()
    elev(cad, "5", "0")

    cad.command("CIRCLE").type("0,0").enter().type("10").enter()

    expect(entityElevation(cad.only<CircleEntity>("circle"))).toBe(8)
  })

  it("does not move a point snapped to an object or typed with a Z", () => {
    const cad = createHarness({
      entities: [withElevation(lineOf(p(0, 0), p(100, 0), { id: "R" }), 10)],
      snap: true,
    })
    elev(cad, "5", "0")

    cad.command("LINE").click(p(100, 0)).type("#200,0,1").enter().escape()

    const line = cad
      .entities()
      .find((e): e is LineEntity => e.type === "line" && e.id !== "R")!
    expect(lineStartZ(line)).toBe(10)
    expect(lineEndZ(line)).toBe(1)
  })

  it("goes back to 0 when the UCS changes to the WCS, and with it on undo", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,0").enter().enter()
    elev(cad, "5", "0")

    cad.command("UCS").option("World")
    expect(settings(cad).elevation).toBe(0)

    cad.undo()
    expect(settings(cad).elevation).toBe(5)
    expect(settings(cad).ucs.origin.x).toBe(10)
  })

  it("stays when the UCS changes to another that is not the WCS", () => {
    const cad = createHarness()
    elev(cad, "5", "0")

    cad.command("UCS").type("10,0").enter().enter()

    expect(settings(cad).elevation).toBe(5)
  })
})

describe("THICKNESS", () => {
  it("extrudes what LINE, CIRCLE, ARC, PLINE and POLYGON draw", () => {
    const cad = createHarness()
    elev(cad, "0", "4")

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()
    cad.command("CIRCLE").click(p(0, 50)).type("10").enter()
    // probe arc/p150: THICKNESS 3 on an arc.
    cad.command("ARC").click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))
    cad.command("PLINE").click(p(0, 0)).click(p(50, 50)).enter()
    // probe polygon/p136: THICKNESS 3 on both of POLYGON's modes.
    cad.command("POLYGON").enter().click(p(200, 0)).enter().type("20").enter()

    expect(entityThickness(cad.only<LineEntity>("line"))).toBe(4)
    expect(entityThickness(cad.only<CircleEntity>("circle"))).toBe(4)
    expect(entityThickness(cad.only<ArcEntity>("arc"))).toBe(4)
    const polylines = cad
      .entities()
      .filter((e): e is PolylineEntity => e.type === "polyline")
    expect(polylines.map(entityThickness)).toEqual([4, 4])
  })

  it("is not used by RECTANG", () => {
    const cad = createHarness()
    elev(cad, "0", "4")

    cad.command("RECTANG").click(p(0, 0)).click(p(100, 50))

    expect(entityThickness(cad.only<PolylineEntity>("polyline"))).toBe(0)
  })
})

describe("ELEVATION and a LINE's points", () => {
  it("puts a 2D point typed after a 3D one back at the elevation", () => {
    // probe line/p31: ELEVATION 5; 0,0 @10,0 @0,0,3 10,10 gives
    // [0,0,5]-[10,0,5], [10,0,5]-[10,0,8], [10,0,8]-[10,10,5]; `#` because
    // dynamic input reads a bare 10,10 there as relative
    const cad = createHarness()
    elev(cad, "5", "0")

    cad.command("LINE").type("0,0").enter().type("@10,0").enter()
    cad.type("@0,0,3").enter().type("#10,10").enter().enter()

    const lines = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(lines.map((l) => [lineStartZ(l), lineEndZ(l)])).toEqual([
      [5, 5],
      [5, 8],
      [8, 5],
    ])
    expect(lines[2].end).toBeCloseToPoint(p(10, 10))
  })
})

describe("RECTANG Elevation and Thickness", () => {
  it("are offered at the first corner, in AutoCAD's order", () => {
    const cad = createHarness()

    cad.command("RECTANG")

    expect(cad.optionIds()).toEqual([
      "Chamfer",
      "Elevation",
      "Fillet",
      "Thickness",
      "Width",
    ])
    expect(cad.optionAbbreviations()).toEqual(["C", "E", "F", "T", "W"])
  })

  it("set the rectangle's plane and extrusion, whatever the corners' Z", () => {
    // probe rectang/p145: the Elevation is the polyline's own, as typed,
    // wherever the UCS's origin lies; ELEVATION, the variable, is not (p170).
    const cad = createHarness()
    cad.command("UCS").type("0,0,3").enter().enter()

    cad.command("RECTANG").option("Elevation").type("5").enter()
    cad.option("Thickness").type("2").enter()
    cad.type("0,0,40").enter().click(p(100, 50))

    const rectangle = cad.only<PolylineEntity>("polyline")
    expect(entityElevation(rectangle)).toBe(5)
    expect(entityThickness(rectangle)).toBe(2)
  })

  it("is the polyline's elevation in a turned UCS too (p145)", () => {
    const cad = createHarness()
    for (const text of ["UCS", "X", "90", "UCS", "0,0,3", "", "RECTANG"]) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.option("Elevation").type("2").enter()
    cad.type("5,5").enter().type("@10,5").enter()

    const rectangle = cad.only<PolylineEntity>("polyline")
    expect(entityElevation(rectangle)).toBeCloseTo(2, 9)
    expect(rectangle.normal?.y).toBeCloseTo(-1, 9)
  })

  it("are kept for the next RECTANG, which reports them", () => {
    const cad = createHarness()
    cad.command("RECTANG").option("Elevation").type("5").enter().escape()

    cad.command("RECTANG")

    expect(cad.state().commandLine.lines.at(-1)?.text).toBe(
      "Current rectangle modes:  Elevation=5.00"
    )
    cad.click(p(0, 0)).click(p(100, 50))
    expect(entityElevation(cad.only<PolylineEntity>("polyline"))).toBe(5)
  })

  it("leave ELEVATION and THICKNESS alone", () => {
    const cad = createHarness()

    cad.command("RECTANG").option("Elevation").type("5").enter()
    cad.option("Thickness").type("2").enter()

    expect(settings(cad)).toMatchObject({ elevation: 0, thickness: 0 })
  })

  it("at 0, the first corner fixes the plane", () => {
    const cad = createHarness()
    elev(cad, "6", "0")

    cad.command("RECTANG").click(p(0, 0)).click(p(100, 50))

    expect(entityElevation(cad.only<PolylineEntity>("polyline"))).toBe(6)
  })
})
