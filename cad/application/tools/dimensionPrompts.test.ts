import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"
import { createDimension } from "../../domain/entities"
import { es } from "../../locales/es"

function answer(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

/**
 * The dimension commands' questions, as AutoCAD 2023's console asks them, in
 * English and in the words of Autodesk's Spanish table.
 */
describe("DIMLINEAR's questions", () => {
  it("are AutoCAD's, written answered", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify first extension line origin or <select object>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify second extension line origin:"
    )
    cad.click(p(100, 0))
    expect(cad.commandLog().at(-1)).toBe("Non-associative dimension created.")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:"
    )
    cad.moveTo(p(50, 30)).option("Text")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Enter dimension text <100.00>:"
    )
    cad.type("<> mm").enter().option("Angle")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify angle of dimension text:"
    )
    cad.type("0").enter().option("Rotated")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify angle of dimension line <0>:"
    )
    cad.type("0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:"
    )
    cad.click(p(50, 30))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 100.00")
  })

  // AutoCAD 2023's console: Rotated leaves every keyword on offer, Horizontal
  // and Vertical the text ones alone, through Text and Angle too; DIMALIGNED
  // offers those alone throughout.
  it("offers the text keywords alone once Horizontal or Vertical is set", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0))
    answer(cad, "H")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle]:"
    )
    answer(cad, "V")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify dimension line location or [Text/Angle]: V",
      "Invalid point input.",
    ])
    answer(cad, "T")
    answer(cad, "ABC")
    answer(cad, "A")
    answer(cad, "45")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle]:"
    )

    cad.escape().command("DIMLINEAR").click(p(0, 0)).click(p(100, 0))
    answer(cad, "R")
    answer(cad, "30")
    answer(cad, "T")
    answer(cad, "ABC")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:"
    )
    answer(cad, "V")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify dimension line location or [Text/Angle]:"
    )

    cad.escape().command("DIMALIGNED").click(p(0, 0)).click(p(100, 0))
    answer(cad, "T")
    answer(cad, "ABC")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMALIGNED Specify dimension line location or [Text/Angle]:"
    )
  })

  it("names an object it cannot find, and asks for one", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Select object to dimension:"
    )
    cad.click(p(500, 500))
    expect(cad.commandLog().at(-1)).toBe("No object selected.")
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("ACOLINEAL")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEAL Especifique el origen de la primera línea de referencia o <designar objeto>:"
    )
    cad.click(p(0, 0)).click(p(100, 0))
    expect(cad.commandLog().at(-1)).toBe("Se ha creado una cota no asociativa.")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEAL Especifique una ubicación de línea de cota o [Texto/ángUlo/Horizontal/Vertical/Girar]:"
    )
    cad.option("Angle")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEAL Designe ángulo de texto de cota:"
    )
    cad.type("0").enter().option("Rotated")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEAL Designe ángulo de línea de cota <0>:"
    )
    cad.type("0").enter().option("Horizontal")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEAL Especifique una ubicación de línea de cota o [Texto/ángUlo]:"
    )
    cad.escape().command("ACOALINEADA").click(p(0, 0)).click(p(100, 0))
    cad.option("Angle")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOALINEADA Precise ángulo de texto de cota:"
    )
  })
})

describe("DIMRADIUS's and DIMANGULAR's questions", () => {
  it("are AutoCAD's, written answered", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 50, { id: "C" })],
    })
    cad.command("DIMRADIUS")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMRADIUS Select arc or circle:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DIMRADIUS Specify dimension line location or [Text/Angle]:"
    )
    cad.click(p(80, 0))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 50.00")

    cad.command("DIMANGULAR")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Select arc, circle, line, or <specify vertex>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Specify angle vertex:"
    )
    cad.click(p(200, 0)).click(p(300, 0)).click(p(200, 100))
    expect(cad.commandLog().at(-1)).toBe("Non-associative dimension created.")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Specify dimension arc line location or [Text/Angle]:"
    )
    cad.click(p(260, 60))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 90°")
  })

  it("ask in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("ACORADIO")
    expect(cad.state().commandLine.prompt).toBe(
      "ACORADIO Designe un arco o un círculo:"
    )
    cad.escape().command("ACOANGULO")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOANGULO Designe arco, círculo, línea o <designar vértice>:"
    )
    cad.enter().click(p(0, 0)).click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ACOANGULO Designe segundo extremo:"
    )
    cad.click(p(0, 100))
    expect(cad.state().commandLine.prompt).toBe(
      "ACOANGULO Designe ubicación del arco de línea de cota o [Texto/ángUlo]:"
    )
  })
})

describe("DIMSPACE's questions", () => {
  const dims = () => [
    createDimension("linear", p(0, 0), p(100, 0), p(50, -20), {
      rotation: 0,
      id: "D1",
    }),
    createDimension("linear", p(0, 0), p(100, 0), p(50, -60), {
      rotation: 0,
      id: "D2",
    }),
  ]

  it("are AutoCAD's, written answered", () => {
    const cad = createHarness({
      entities: [...dims(), lineOf(p(0, 300), p(1, 300))],
    })
    cad.command("DIMSPACE")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Select base dimension:"
    )
    cad.click(p(50, -20))
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Select dimensions to space:"
    )
    cad.click(p(50, -60))
    expect(cad.commandLog().at(-1)).toBe("Select dimensions to space: 1 found")
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Enter value or [Auto] <Auto>:"
    )
    cad.type("-5").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Invalid spacing value, spacing value cannot be negative."
    )
  })

  it("take Last at the base dimension, as AutoCAD's console does", () => {
    const cad = createHarness({ entities: dims() })
    answer(cad.command("DIMSPACE"), "L")
    expect(cad.commandLog().at(-1)).toBe("Select base dimension: L")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Select dimensions to space:"
    )
    cad.click(p(50, -20)).enter().type("10").enter()
    // The base is the last drawn, D2, so D1 comes 10 above it.
    expect(cad.entities().find((e) => e.id === "D1")).toMatchObject({
      linePoint: p(50, -50),
    })
  })

  it("say why Last is no base dimension", () => {
    const cad = createHarness({
      entities: [...dims(), lineOf(p(0, 300), p(1, 300))],
    })
    answer(cad.command("DIMSPACE"), "L")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select base dimension: L",
      "Selected object is not a dimension.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Select base dimension:"
    )
    const empty = createHarness()
    answer(empty.command("DIMSPACE"), "L")
    expect(empty.commandLog().at(-1)).toBe("No object selected.")
  })

  it("ask in Spanish", () => {
    const cad = createHarness({ locale: es, entities: dims() })
    cad.command("ACOESPAC")
    expect(cad.state().commandLine.prompt).toBe("ACOESPAC Designar cota base:")
    cad.click(p(50, -20)).click(p(50, -60)).enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ACOESPAC Indique valor o [Auto] <Auto>:"
    )
  })
})
