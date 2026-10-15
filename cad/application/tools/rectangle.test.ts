import { describe, expect, it } from "vitest"
import type { PolylineEntity } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"

/** Typed at the command line and confirmed, as AutoCAD's console reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A quarter circle's bulge, counter-clockwise. */
const QUARTER = Math.tan(Math.PI / 8)

function rectangle(cad: CadHarness): PolylineEntity {
  return cad.latest() as PolylineEntity
}

describe("RECTANG", () => {
  it("asks for the first corner, the option's value and the other corner", () => {
    const cad = createHarness()

    cad.command("RECTANG").option("Elevation")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify the elevation for rectangles <0.00>:"
    )
    cad.type("5").enter().click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify other corner point or [Area/Dimensions/Rotation]:"
    )
    cad.click(p(20, 10))

    expect(cad.commandLog()).toEqual([
      "RECTANG",
      "Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]: E",
      "Specify the elevation for rectangles <0.00>: 5",
      "Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:",
      "Specify other corner point or [Area/Dimensions/Rotation]:",
    ])
  })

  it("draws a closed polyline from two corners", () => {
    const cad = createHarness()

    cad.command("RECTANG").click(p(0, 0)).click(p(200, 120))

    const rect = cad.only<PolylineEntity>("polyline")
    expect(rect.closed).toBe(true)
    expect(rect.vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("accepts relative dimensions for the second corner", () => {
    const cad = createHarness()

    cad.command("RECTANG").type("0,0").enter().type("@200,120").enter()

    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("ignores a degenerate rectangle", () => {
    const cad = createHarness()

    cad.command("RECTANG").click(p(0, 0)).click(p(200, 0))

    expect(cad.entityCount).toBe(0)
  })

  it("takes no Enter at either corner (acc/r2, r3)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "")
    cad.click(p(0, 0))
    answer(cad, "", "FOO")

    expect(cad.commandLog()).toEqual([
      "RECTANG",
      "Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:",
      "Point or option keyword required.",
      "Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:",
      "Specify other corner point or [Area/Dimensions/Rotation]:",
      "Point or option keyword required.",
      "Specify other corner point or [Area/Dimensions/Rotation]: FOO",
      "Point or option keyword required.",
    ])
    expect(cad.activeToolId()).toBe("rectangle")
  })
})

describe("RECTANG Chamfer and Fillet", () => {
  it("cuts each corner, the first distance on the side reaching it (acc/r1)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "C", "10")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify second chamfer distance for rectangles <10.00>:"
    )
    answer(cad, "5", "0,0", "100,50")

    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 10),
      p(5, 0),
      p(90, 0),
      p(100, 5),
      p(100, 40),
      p(95, 50),
      p(10, 50),
      p(0, 45),
    ])
    expect(rectangle(cad).bulges).toBeUndefined()
  })

  it("cuts a clockwise rectangle the same way round (acc/r3)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "C", "7", "", "0,50", "100,0")

    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 43),
      p(7, 50),
      p(93, 50),
      p(100, 43),
      p(100, 7),
      p(93, 0),
      p(7, 0),
      p(0, 7),
    ])
  })

  it("rounds each corner, Fillet offering Chamfer's first distance (acc/r1)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "C", "10", "5", "0,0", "100,50")
    cad.command("RECTANG")
    answer(cad, "F")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify fillet radius for rectangles <10.00>:"
    )
    answer(cad, "", "0,100", "100,150")

    expect(cad.commandLog()).toContain(
      "Current rectangle modes:  Chamfer=10.00 x 5.00"
    )
    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 110),
      p(10, 100),
      p(90, 100),
      p(100, 110),
      p(100, 140),
      p(90, 150),
      p(10, 150),
      p(0, 140),
    ])
    const bulges = rectangle(cad).bulges!
    expect(bulges.filter((_, i) => i % 2 === 0)).toEqual(
      Array(4).fill(expect.closeTo(QUARTER, 9))
    )
    expect(bulges.filter((_, i) => i % 2 === 1)).toEqual([0, 0, 0, 0])
  })

  it("doubles the corners, plain, when the cuts do not fit (acc/r4)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "F", "10", "0,0", "15,15")

    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 0),
      p(0, 0),
      p(15, 0),
      p(15, 0),
      p(15, 15),
      p(15, 15),
      p(0, 15),
      p(0, 15),
    ])
    expect(rectangle(cad).bulges).toBeUndefined()
  })

  it("offers the last second distance, or the first with none (acc/r3, r5)", () => {
    const cad = createHarness()
    const offered = () => cad.state().commandLine.prompt

    cad.command("RECTANG")
    answer(cad, "C", "10", "3", "C", "5")
    expect(offered()).toBe(
      "RECTANG Specify second chamfer distance for rectangles <3.00>:"
    )
    answer(cad, "", "F", "2", "C")
    expect(offered()).toBe(
      "RECTANG Specify first chamfer distance for rectangles <2.00>:"
    )
    answer(cad, "")
    expect(offered()).toBe(
      "RECTANG Specify second chamfer distance for rectangles <2.00>:"
    )
  })

  it("lists the modes in AutoCAD's order, a chamfer of 0 x 0 none (acc/r5)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "C", "0", "3", "E", "5", "T", "2", "0,0", "R", "30")
    answer(cad, "10,10")
    cad.command("RECTANG")
    answer(cad, "C", "0", "0", "0,0", "@10,10")
    cad.command("RECTANG")

    expect(cad.commandLog()).toContain(
      "Current rectangle modes:  Chamfer=0.00 x 3.00  Elevation=5.00  Thickness=2.00  Rotation=30"
    )
    expect(cad.commandLog().at(-1)).toBe(
      "Current rectangle modes:  Elevation=5.00  Thickness=2.00  Rotation=30"
    )
  })
})

describe("RECTANG Area, Dimensions and Rotation", () => {
  it("makes the area from a length, fillets included (acc/r7)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "F", "5", "0,0", "R", "30", "A", "800")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Calculate rectangle dimensions based on [Length/Width] <Length>:"
    )
    answer(cad, "L", "40")

    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(-2.5, 4.3301),
      p(4.3301, 2.5),
      p(30.3109, 17.5),
      p(32.141, 24.3301),
      p(26.8728, 33.455),
      p(20.0426, 35.2851),
      p(-5.9381, 20.2851),
      p(-7.7683, 13.455),
    ], 3)
    expect(cad.activeToolId()).toBe("select")

    cad.command("RECTANG")
    answer(cad, "100,0", "A", "", "W")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Enter rectangle width <20.54>:"
    )
    answer(cad, "20")
    cad.command("RECTANG")
    answer(cad, "200,0", "D")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify length for rectangles <41.07>:"
    )
  })

  it("leaves out chamfers that do not fit (acc/r9)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "C", "4", "2", "0,0", "A", "300", "", "20")
    expect(rectangle(cad).vertices.at(-1)).toBeCloseToPoint(p(0, 13.8))

    cad.command("RECTANG")
    answer(cad, "0,0", "A", "100", "", "20")
    expect(rectangle(cad).vertices.at(-1)).toBeCloseToPoint(p(0, 5))
  })

  it("refuses an area or a side it cannot take (acc/r6)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "0,0", "A", "FOO", "0", "-10", "800", "FOO", "L", "FOO")

    expect(cad.commandLog().slice(3)).toEqual([
      "Enter area of rectangle in current units <100.00>: FOO",
      "Requires numeric value.",
      "Enter area of rectangle in current units <100.00>: 0",
      "Value must be positive and nonzero.",
      "Enter area of rectangle in current units <100.00>: -10",
      "Value must be positive and nonzero.",
      "Enter area of rectangle in current units <100.00>: 800",
      "Calculate rectangle dimensions based on [Length/Width] <Length>: FOO",
      "Invalid option keyword.",
      "Calculate rectangle dimensions based on [Length/Width] <Length>: L",
      "Enter rectangle length <10.00>: FOO",
      "Requires numeric distance or two points.",
    ])
  })

  it("lays the dimensions in the corner's quadrant (acc/r2)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "400,0", "D", "80", "40")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify other corner point or [Area/Dimensions/Rotation]:"
    )
    answer(cad, "500,100")
    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(400, 0),
      p(480, 0),
      p(480, 40),
      p(400, 40),
    ])

    cad.command("RECTANG")
    answer(cad, "400,200", "D", "", "", "300,100")
    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(400, 200),
      p(320, 200),
      p(320, 160),
      p(400, 160),
    ])
  })

  it("reads the quadrant along the UCS, not the turned sides (acc/r8)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "0,0", "R", "45", "D", "-30", "5", "-10,50")

    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 0),
      p(-21.2132, -21.2132),
      p(-24.7487, -17.6777),
      p(-3.5355, 3.5355),
    ], 3)
  })

  it("turns the rectangle, by an angle or two points (acc/r2, r6, r7)", () => {
    const cad = createHarness()

    cad.command("RECTANG")
    answer(cad, "0,300", "R", "30", "100,350")
    expect(rectangle(cad).vertices).toBeCloseToPoints([
      p(0, 300),
      p(96.6506, 355.8013),
      p(100, 350),
      p(3.3494, 294.1987),
    ], 3)

    cad.command("RECTANG")
    answer(cad, "100,0", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify rotation angle or [Pick points] <30>:"
    )
    answer(cad, "P", "", "FOO", "10,10", "20,20", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify rotation angle or [Pick points] <45>:"
    )
    answer(cad, "110,-10", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify rotation angle or [Pick points] <315>:"
    )
    answer(cad, "FOO")

    expect(cad.commandLog().slice(-12)).toEqual([
      "Specify rotation angle or [Pick points] <30>: P",
      "Specify first point:",
      "Invalid point.",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: 10,10",
      "Specify second point: 20,20",
      "Specify other corner point or [Area/Dimensions/Rotation]: R",
      "Specify rotation angle or [Pick points] <45>: 110,-10",
      "Specify other corner point or [Area/Dimensions/Rotation]: R",
      "Specify rotation angle or [Pick points] <315>: FOO",
      "Requires valid numeric angle, second point, or option keyword.",
    ])
  })
})
