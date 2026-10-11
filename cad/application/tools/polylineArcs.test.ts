import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import type { PolylineEntity } from "../../domain/entities"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The polyline drawn, as `x,y` vertices and the bulge of each segment. */
function drawn(cad: CadHarness): { at: string[]; bulges: number[] } {
  const polyline = cad.only<PolylineEntity>("polyline")
  const round = (n: number) => Math.round(n * 10000) / 10000
  return {
    at: polyline.vertices.map((v) => `${round(v.x)},${round(v.y)}`),
    bulges: (polyline.bulges ?? []).map(round),
  }
}

const ARC_PROMPT =
  "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]:"

// AutoCAD 2023's console is the reference for every prompt, refusal and
// bulge below (its LIST of the polyline drawn by the same answers).
describe("PLINE's arc mode", () => {
  it("lists AutoCAD's arc options, Close once a segment exists", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Undo]:"
    )
    answerLine(cad, "10,0")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Close/Undo]:"
    )
    answerLine(cad, "A", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ARC_PROMPT} FOO`,
      "2D point or option keyword required.",
    ])
  })

  it("closes after one segment, as the console does", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "10,0", "C")
    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.closed).toBe(true)
    expect(polyline.vertices).toHaveLength(2)
  })

  it("Angle: an included angle, then an endpoint, a centre or a radius", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "A", "A", "FOO", "90", "R", "FOO", "10", "FOO", "45")
    expect(cad.commandLog().slice(2, 14)).toEqual([
      "Current line-width is 0.00",
      "Specify next point or [Arc/Undo]: A",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/Direction/Line/Radius/Second pt/Undo]: A",
      "Specify included angle: FOO",
      "Requires valid numeric angle or second point.",
      "Specify included angle: 90",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [CEnter/Radius]: R",
      "Specify radius of arc: FOO",
      "Requires numeric distance or two points.",
      "Specify radius of arc: 10",
      "Specify direction of chord for arc (hold Ctrl to switch direction) <0>: FOO",
      "Requires valid numeric angle or second point.",
    ])
    answerLine(cad, "A", "-90", "30,0", "CE", "40,0", "L", "-10", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,10", "30,0", "35,8.6603"],
      bulges: [0.4142, -0.4142, 3.7321],
    })
  })

  it("Radius: the minor arc counter-clockwise, or a chord's direction", () => {
    const left = createHarness()
    left.command("PLINE")
    answerLine(left, "0,0", "10,0", "A", "R", "10", "10,-10", "")
    expect(drawn(left).bulges).toEqual([0, 0.2679])

    const chord = createHarness()
    chord.command("PLINE")
    // Enter takes the chord's `<0>`: where the line before it heads.
    answerLine(chord, "0,0", "10,0", "A", "R", "10", "A", "60", "", "")
    expect(drawn(chord)).toEqual({
      at: ["0,0", "10,0", "20,0"],
      bulges: [0, 0.2679],
    })
  })

  it("Direction, Second pt and CEnter's endpoint", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "10,0", "A", "D", "90", "20,10")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify the tangent direction for the start point of arc: 90",
      "Specify endpoint of the arc (hold Ctrl to switch direction): 20,10",
    ])
    answerLine(cad, "S", "25,15", "30,10", "CE", "40,10", "40,-30", "")
    expect(drawn(cad)).toEqual({
      at: ["0,0", "10,0", "20,10", "30,10", "40,0"],
      bulges: [0, -0.4142, -1, 0.4142],
    })
  })

  it("CLose closes with the tangent arc, or `*Invalid*` and a line", () => {
    const arc = createHarness()
    arc.command("PLINE")
    answerLine(arc, "0,0", "10,0", "A", "20,10", "CL")
    expect(arc.only<PolylineEntity>("polyline").closed).toBe(true)
    expect(drawn(arc).bulges).toEqual([0, 0.4142, 1.618])

    const back = createHarness()
    back.command("PLINE")
    answerLine(back, "0,0", "10,0", "A", "CL")
    expect(back.commandLog().at(-1)).toBe("*Invalid*")
    expect(back.only<PolylineEntity>("polyline").closed).toBe(true)
    expect(drawn(back).bulges.some((bulge) => bulge !== 0)).toBe(false)
  })

  it("leaves the start along the last thing drawn, or refuses an end straight ahead", () => {
    const after = createHarness({
      entities: [lineOf(p(50, 50), p(60, 60))],
    })
    after.command("PLINE")
    answerLine(after, "0,0", "A", "10,0", "")
    expect(drawn(after).bulges).toEqual([-0.4142])

    const blank = createHarness()
    blank.command("PLINE")
    answerLine(blank, "0,0", "A", "10,0")
    expect(blank.commandLog().slice(-2)).toEqual([
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/Direction/Line/Radius/Second pt/Undo]: 10,0",
      "*Invalid*",
    ])
  })

  it("undoes nothing with nothing drawn, and an arc back to the line prompt", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "U")
    expect(cad.commandLog().at(-1)).toBe("All segments already undone.")
    answerLine(cad, "A", "R", "10", "10,10", "U")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify next point or [Arc/Undo]:"
    )
  })

  it("refuses Enter where the step has no default, rather than ending", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "A", "CE", "10,0", "")
    expect(cad.commandLog().at(-1)).toBe("2D point or option keyword required.")
    answerLine(cad, "A", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or second point."
    )
    expect(cad.activeToolId()).toBe("polyline")
  })

  it("is measured by picks, and Ctrl turns the arc the other way", () => {
    const cad = createHarness()
    cad.command("PLINE").click(p(0, 0)).click(p(10, 0)).option("Arc")
    cad.option("Radius").click(p(0, 0)).moveTo(p(0, 5))
    expect(cad.state().commandLine.prompt).toBe("PLINE Specify second point:")
    cad.click(p(0, 10)).click(p(10, 10))
    cad.option("Center").click(p(20, 10)).click(p(20, -30), { ctrlKey: true })
    cad.enter()
    expect(drawn(cad)).toEqual({
      // Clockwise from 180° round to the ray at 270°: three quarters.
      at: ["0,0", "10,0", "10,10", "20,0"],
      bulges: [0, 0.2679, -2.4142],
    })
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("POL")
    answerLine(cad, "0,0", "10,0", "A")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/cEntro/Cerrar/Dirección/líNea/Radio/Segundo pto./desHacer]:"
    )
    answerLine(cad, "E", "20,0", "U", "FOO")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Precise punto central del arco: 20,0",
      "Precise punto final del arco (mantenga pulsada la tecla Ctrl para cambiar de dirección) o [ángUlo/Longitud]: U",
      "Precise ángulo incluido (mantenga pulsada la tecla Ctrl para cambiar de dirección): FOO",
      "Requiere un ángulo numérico válido o un segundo punto.",
    ])
  })
})
