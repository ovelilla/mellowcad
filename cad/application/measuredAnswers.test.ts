import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { CircleEntity, LineEntity } from "../domain/entities"
import { es } from "../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const aLine = () => [lineOf(p(0, 0), p(100, 0), { id: "A" })]

// AutoCAD's distance and angle input take a point as well as a number: from
// the prompt's base point (CIRCLE's centre), or, with none, as the first of
// two points, after which it asks ` Specify second point:` (AutoCAD 2023's
// console). A point typed there is the same as one picked.
describe("a point at a distance or an angle prompt", () => {
  it("is a point on CIRCLE's circumference, typed or picked", () => {
    // probes circle/p140 (`@5<0`), p163 (`@`, from the centre), p146.
    const cad = createHarness()
    cad.command("CIRCLE")
    answerLine(cad, "0,0", "25,20")
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(32.0156, 4)
    expect(cad.commandLog().slice(-1)).toEqual([
      "Specify radius of circle or [Diameter]: 25,20",
    ])

    const relative = createHarness()
    relative.command("CIRCLE")
    answerLine(relative, "10,0", "@3,4")
    expect(relative.only<CircleEntity>("circle").radius).toBeCloseTo(5)

    const diameter = createHarness()
    diameter.command("CIRCLE")
    answerLine(diameter, "0,0", "D", "@30,40")
    expect(diameter.only<CircleEntity>("circle").radius).toBeCloseTo(25)
  })

  it("is CIRCLE's radius or diameter measured in space from the centre", () => {
    // probes circle/p17 (`3,4,12` → r13), p148 (the diameter → r6.5), p184
    // (an end snapped at Z 5 → r11.1803): the radius is no 2D prompt.
    const typed = answerLine(createHarness(), "CIRCLE", "0,0,0", "3,4,12")
    expect(typed.only<CircleEntity>("circle").radius).toBeCloseTo(13, 9)

    const diameter = answerLine(createHarness(), "CIRCLE", "0,0,0", "D")
    answerLine(diameter, "3,4,12")
    expect(diameter.only<CircleEntity>("circle").radius).toBeCloseTo(6.5, 9)

    const snapped = createHarness()
    answerLine(snapped, "LINE", "0,10,5", "5,5,5", "", "CIRCLE", "0,0")
    answerLine(snapped, "END", "0,10")
    const circle = snapped.latest() as CircleEntity
    expect(circle.radius).toBeCloseTo(Math.sqrt(125), 9)
    expect(circle.elevation).toBeUndefined()
  })

  it("is read from the centre in the box, as the dynamic input's second point", () => {
    const cad = createHarness()
    cad.command("CIRCLE").click(p(10, 0)).type("3,4").enter()
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(5)
  })

  it("must leave CIRCLE a size", () => {
    // probe circle/p113: `0` and `-5` are `Value must be positive and nonzero.`
    const cad = createHarness()
    cad.command("CIRCLE")
    answerLine(cad, "0,0", "0", "-3", "0,0")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify radius of circle or [Diameter]: 0",
      "Value must be positive and nonzero.",
      "Specify radius of circle or [Diameter]: -3",
      "Value must be positive and nonzero.",
      "Specify radius of circle or [Diameter]: 0,0",
      "Value must be positive and nonzero.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle or [Diameter]:"
    )
    expect(cad.entityCount).toBe(0)
  })

  it("starts two points where the prompt has no base point", () => {
    const cad = createHarness({ entities: aLine() })
    cad.command("FILLET")
    answerLine(cad, "R", "0,0")
    expect(cad.state().commandLine.prompt).toBe("FILLET Specify second point:")
    answerLine(cad, "FOO", "6,8")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify fillet radius <0.00>: 0,0",
      " Specify second point: FOO",
      "Requires numeric distance or two points.",
      " Specify second point: 6,8",
    ])
    cad.escape().command("FILLET")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Mode = TRIM, Radius = 10.00"
    )
  })

  it("takes the distance itself at the second point", () => {
    const cad = createHarness({ entities: aLine() })
    cad.command("FILLET")
    answerLine(cad, "R", "0,0", "5")
    cad.escape().command("FILLET")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Mode = TRIM, Radius = 5.00"
    )
  })

  it("is measured from picks too, with a rubber band to the second", () => {
    const cad = createHarness({ entities: aLine() })
    cad.command("FILLET").option("Radius").click(p(0, 0)).moveTo(p(3, 4))
    expect(cad.state().commandLine.prompt).toBe("FILLET Specify second point:")
    expect(cad.state().dynamicInput?.fields[0]?.placeholder).toBe("5.00")
    expect(
      cad.scene().primitives.some((primitive) => primitive.kind === "segment")
    ).toBe(true)
    cad.click(p(6, 8))
    // The string has no new line: after a pick it follows on the bare line.
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: R",
      "Specify fillet radius <0.00>:  Specify second point:",
    ])
    cad.escape().command("FILLET")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Mode = TRIM, Radius = 10.00"
    )
  })

  it("writes the second point on a line of its own after a typed first", () => {
    const cad = createHarness({ entities: aLine() })
    cad.command("FILLET").option("Radius")
    answerLine(cad, "0,0")
    cad.click(p(6, 8))
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify fillet radius <0.00>: 0,0",
      " Specify second point:",
    ])
  })

  it("keeps the question's own refusal and keywords at the second point", () => {
    // probe offset/p144.
    const cad = createHarness({ entities: aLine() })
    cad.command("OFFSET")
    answerLine(cad, "10,0", "FOO", "20,5")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify offset distance or [Through/Erase/Layer] <Through>: 10,0",
      " Specify second point: FOO",
      "Requires numeric distance, two points, or option keyword.",
      " Specify second point: 20,5",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
    )
    cad.escape().command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <11.18>:"
    )
  })

  it("keeps the first point when the command refuses what the two measure", () => {
    // probe offset/p140: `@` is the first point again, a distance of zero;
    // a number is then the distance.
    const cad = createHarness({ entities: aLine() })
    cad.command("OFFSET")
    answerLine(cad, "10,10", "@")
    expect(cad.commandLog().slice(-2)).toEqual([
      " Specify second point: @",
      "Value must be positive and nonzero.",
    ])
    expect(cad.state().commandLine.prompt).toBe("OFFSET Specify second point:")
    answerLine(cad, "10")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
    )
    cad.escape().command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <10.00>:"
    )
    // From the same first point: `10,40` is 30 from 10,10.
    const again = createHarness({ entities: aLine() })
    again.command("OFFSET")
    answerLine(again, "10,10", "@", "10,40")
    again.escape().command("OFFSET")
    expect(again.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <30.00>:"
    )
  })

  it("leaves LASTPOINT where it was", () => {
    // probe offset/p139: `0,0`, `@30,40` is 50 from the first; LASTPOINT
    // is still the line's end, 100,0.
    const cad = createHarness()
    answerLine(cad, "LINE", "0,0", "100,0", "", "OFFSET", "0,0", "@30,40")
    cad.escape()
    answerLine(cad, "ID", "@")
    expect(cad.commandLog().at(-1)!.trim()).toBe(
      "X = 100.00     Y = 0.00     Z = 0.00"
    )
    cad.command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <50.00>:"
    )
  })

  it("sets RECTANG's elevation and thickness, and ELEV's", () => {
    const cad = createHarness()
    cad.command("RECTANG")
    answerLine(cad, "E", "0,0", "0,7", "T", "0,0", "@0,2", "E")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify the elevation for rectangles <7.00>:"
    )
    cad.escape().command("ELEV")
    answerLine(cad, "0,0", "0,4", "0,0", "@0,3")
    const settings = cad.runtime.document.getSettings()
    expect([settings.elevation, settings.thickness]).toEqual([4, 3])
  })

  it("is an angle measured by two points, or from the base point", () => {
    // probe arrays/p265: Fill by 0,0 and 0,10 is 90°, 18° between 6 items.
    const cad = createHarness({ entities: aLine() })
    cad.command("ARRAYPOLAR")
    answerLine(cad, "L", "", "0,0", "F", "0,0", "0,10", "A")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <18>:"
    )
    cad.escape()

    // probe transforms/p118: ROTATE's angle is the point's bearing from the
    // base.
    const rotate = createHarness({ entities: aLine() })
    rotate.select("A").command("ROTATE")
    answerLine(rotate, "0,0", "10,10")
    const half = 100 / Math.SQRT2
    expect(rotate.byId<LineEntity>("A").end).toBeCloseToPoint(p(half, half))
  })

  it("is VPOINT's angle from the origin, by one point", () => {
    const cad = createHarness()
    cad.command("VPOINT")
    answerLine(cad, "R", "10,10", "10,0")
    cad.command("VPOINT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current view direction:  VIEWDIR=0.71,0.71,0.00"
    )
  })

  it("turns DIMLINEAR's dimension line by two points", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR")
    answerLine(cad, "0,0", "100,0", "R", "FOO", "10,10", "50,-20", "0,30")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify angle of dimension line <0>: FOO",
      "Invalid Input.",
      "Specify angle of dimension line <0>: 10,10",
      " Specify second point: 50,-20",
      "Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]: 0,30",
      "Dimension text = 80",
    ])
  })

  it("is asked and refused in Spanish", () => {
    const cad = createHarness({ locale: es, entities: aLine() })
    cad.command("CIRCULO")
    answerLine(cad, "0,0", "0", "25,20")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Precise radio de círculo o [Diámetro]: 0",
      "El valor debe ser positivo y diferente de cero.",
      "Precise radio de círculo o [Diámetro]: 25,20",
    ])
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(32.0156, 4)

    cad.command("EMPALME")
    answerLine(cad, "RA", "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Designe segundo punto:"
    )
    answerLine(cad, "FOO", "6,8")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Precise radio de empalme <0.00>: 0,0",
      " Designe segundo punto: FOO",
      "Requiere una distancia numérica o dos puntos.",
      " Designe segundo punto: 6,8",
    ])
  })
})
