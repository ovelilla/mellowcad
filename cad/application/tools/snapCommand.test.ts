import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function snapUnit(cad: CadHarness) {
  return cad.state().snapSpacing
}

// AutoCAD 2027's console, in the probes of line/ each test names.
describe("SNAP", () => {
  // p38, p158
  it("asks the spacing, which sets SNAPUNIT and turns snap mode on", () => {
    const cad = answer(createHarness(), "SNAP")
    expect(cad.state().commandLine.prompt).toBe(
      "SNAP Specify snap spacing or [ON/OFF/Aspect] <10.00>:"
    )
    answer(cad, "5")
    expect(cad.commandLog().slice(-2)).toEqual([
      "SNAP",
      "Specify snap spacing or [ON/OFF/Aspect] <10.00>: 5",
    ])
    expect(cad.state().snapModeActive).toBe(true)
    expect(snapUnit(cad)).toEqual({ x: 5, y: 5 })
    expect(cad.activeToolId()).toBe("select")
  })

  // p158: `Requires numeric distance, two points, or option keyword.`
  it("takes the spacing as two points", () => {
    const cad = answer(createHarness(), "SN")
    cad.click(p(0, 0)).click(p(3, 4))
    expect(snapUnit(cad)).toEqual({ x: 5, y: 5 })
    expect(cad.state().snapModeActive).toBe(true)
  })

  // p38, p158
  it("turns it off with OFF, on with ON or Enter, the spacing kept", () => {
    const cad = answer(createHarness(), "SNAP", "4", "SNAP", "OFF")
    expect(cad.state().snapModeActive).toBe(false)
    answer(cad, "SNAP", "ON")
    expect(cad.state().snapModeActive).toBe(true)
    answer(cad, "SNAP", "OFF", "SNAP", "")
    expect(cad.state().snapModeActive).toBe(true)
    expect(snapUnit(cad)).toEqual({ x: 4, y: 4 })
  })

  // p158
  it("refuses a word, zero and a negative in the console's words", () => {
    const cad = answer(createHarness(), "SNAP", "FOO", "0", "-5")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify snap spacing or [ON/OFF/Aspect] <10.00>: FOO",
      "Requires numeric distance, two points, or option keyword.",
      "Specify snap spacing or [ON/OFF/Aspect] <10.00>: 0",
      "Value must be positive and nonzero.",
      "Specify snap spacing or [ON/OFF/Aspect] <10.00>: -5",
      "Value must be positive and nonzero.",
    ])
    expect(cad.activeToolId()).toBe("snap")
    expect(cad.state().snapModeActive).toBe(false)
  })

  // p158, p212: Aspect turns snap on; `<A>` (table 25931) opens it at Enter
  it("asks Aspect's two spacings, then offers Aspect as the default", () => {
    const cad = answer(createHarness(), "SNAP", "A", "5", "10")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify snap spacing or [ON/OFF/Aspect] <10.00>: A",
      "Specify horizontal spacing <10.00>: 5",
      "Specify vertical spacing <10.00>: 10",
    ])
    expect(snapUnit(cad)).toEqual({ x: 5, y: 10 })
    expect(cad.state().snapModeActive).toBe(true)

    answer(cad, "SNAP", "OFF", "SNAP")
    expect(cad.state().commandLine.prompt).toBe(
      "SNAP Specify snap spacing or [ON/OFF/Aspect] <A>:"
    )
    answer(cad, "", "7", "8")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify snap spacing or [ON/OFF/Aspect] <A>:",
      "Specify horizontal spacing <5.00>: 7",
      "Specify vertical spacing <10.00>: 8",
    ])
    expect(snapUnit(cad)).toEqual({ x: 7, y: 8 })
    expect(cad.state().snapModeActive).toBe(true)

    answer(cad, "SNAP", "3")
    expect(snapUnit(cad)).toEqual({ x: 3, y: 3 })
  })

  // p213
  it("refuses at Aspect's spacings and keeps one at Enter", () => {
    const cad = answer(createHarness(), "SNAP", "A", "FOO", "0", "", "0", "4")
    expect(cad.commandLog().slice(-8)).toEqual([
      "Specify horizontal spacing <10.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify horizontal spacing <10.00>: 0",
      "Value must be positive and nonzero.",
      "Specify horizontal spacing <10.00>:",
      "Specify vertical spacing <10.00>: 0",
      "Value must be positive and nonzero.",
      "Specify vertical spacing <10.00>: 4",
    ])
    expect(snapUnit(cad)).toEqual({ x: 10, y: 4 })
  })

  // p158, p212 (es)
  it("is worded as Spanish AutoCAD words it", () => {
    const cad = answer(createHarness({ locale: es }), "FC")
    expect(cad.state().commandLine.prompt).toBe(
      "FORZCURSOR Precise distancia de resolución o [ACT/DES/asPecto] <10.00>:"
    )
    answer(cad, "FOO", "P", "5", "10", "FORZCURSOR")
    expect(cad.commandLog()).toContain(
      "Requiere una distancia numérica, dos puntos o una opción."
    )
    expect(cad.commandLog()).toContain(
      "Precise intervalo horizontal <10.00>: 5"
    )
    expect(cad.commandLog()).toContain("Precise intervalo vertical <10.00>: 10")
    expect(cad.state().commandLine.prompt).toBe(
      "FORZCURSOR Precise distancia de resolución o [ACT/DES/asPecto] <asP>:"
    )
    answer(cad, "DES")
    expect(cad.state().snapModeActive).toBe(false)
  })
})
