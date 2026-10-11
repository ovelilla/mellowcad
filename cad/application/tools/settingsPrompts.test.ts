import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

// Each transcript is AutoCAD 2023's console answering the same input, with
// the drawing's precision (2 here, 4 in AutoCAD's template) and the options
// this build has (no Create or Load, no COlorbook).
describe("the settings commands ask as AutoCAD 2026", () => {
  it("LTSCALE offers the current factor and refuses what is no positive number", () => {
    const cad = createHarness()
    cad.command("LTSCALE")
    answer(cad, "FOO", "-1", "0", "2")
    expect(cad.commandLog()).toEqual([
      "LTSCALE",
      "Enter new linetype scale factor <1.00>: FOO",
      "Requires numeric value.",
      "Enter new linetype scale factor <1.00>: -1",
      "Value must be positive and nonzero.",
      "Enter new linetype scale factor <1.00>: 0",
      "Value must be positive and nonzero.",
      "Enter new linetype scale factor <1.00>: 2",
      "Regenerating model.",
    ])
  })

  it("-LINETYPE says the current one, refuses a keyword it lacks and a name it cannot find", () => {
    const cad = createHarness()
    cad.command("-LINETYPE")
    answer(cad, "FOO", "S", "FOO")
    expect(cad.commandLog()).toEqual([
      "-LINETYPE",
      'Current line type:  "ByLayer"',
      "Enter an option [?/Set]: FOO",
      "Invalid option keyword.",
      "Enter an option [?/Set]: S",
      "Specify linetype name or [?] <ByLayer>: FOO",
      'Linetype "FOO" not found in acad.lin.\nYou can use the "Load" option to load it from another file.',
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter an option [?/Set]:"
    )
  })

  it("-LWEIGHT rounds to a valid lineweight and refuses what is none", () => {
    const cad = createHarness()
    cad.command("-LWEIGHT")
    answer(cad, "FOO", "0.33")
    cad.command("-LWEIGHT")
    expect(cad.commandLog()).toEqual([
      "-LWEIGHT",
      "Current lineweight: BYLAYER",
      "Enter default lineweight for new objects or [?]: FOO",
      "A weight in lineweight units is required.",
      "Enter default lineweight for new objects or [?]: 0.33",
      "Lineweight rounded to nearest valid value of 0.35 mm",
      "-LWEIGHT",
      "Current lineweight: 0.35 mm",
    ])
  })

  it("-COLOR offers the current colour and refuses a number past 255", () => {
    const cad = createHarness()
    cad.command("-COLOR")
    answer(cad, "FOO", "300", "T", "FOO", "1,2,3")
    cad.command("-COLOR")
    expect(cad.commandLog()).toEqual([
      "-COLOR",
      "Enter default object color [Truecolor] <BYLAYER>: FOO",
      "A color number or standard color name is required.",
      "Enter default object color [Truecolor] <BYLAYER>: 300",
      "Invalid color number.",
      "Enter default object color [Truecolor] <BYLAYER>: T",
      "Red,Green,Blue: FOO",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue: 1,2,3",
      "-COLOR",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "COLOR Enter default object color [Truecolor] <1,2,3>:"
    )
  })

  it("-OSNAP says the running modes and refuses a list it cannot read", () => {
    const cad = createHarness()
    cad.command("-OSNAP")
    answer(cad, "FOO", "END,FOO", "END,MID")
    cad.command("-OSNAP")
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "-OSNAP",
      "Current osnap modes: End,Cen,Int,Ext",
      "Enter list of object snap modes: FOO",
      "Invalid object snap modes.",
      "Enter list of object snap modes: END,FOO",
      "Invalid object snap modes.",
      "Enter list of object snap modes: END,MID",
      "-OSNAP",
      "Current osnap modes: End,Mid",
      "Enter list of object snap modes:",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("ESCALATL")
    expect(cad.state().commandLine.prompt).toBe(
      "ESCALATL Indique nuevo factor de escala del tipo de línea <1.00>:"
    )
    cad.escape()
    cad.command("-TIPOLIN")
    answer(cad, "D", "FOO")
    expect(cad.commandLog().slice(-4)).toEqual([
      'Tipo de línea actual: "PorCapa"',
      "Indique una opción [?/Definir]: D",
      "Precise nombre de tipo de línea o [?] <PorCapa>: FOO",
      'Tipo de línea "FOO" no encontrado en acad.lin.\nPuede utilizar la opción "Cargar" para cargarlo desde otro archivo.',
    ])
    cad.escape()
    cad.command("-GROSORLIN")
    expect(cad.state().commandLine.prompt).toBe(
      "GROSORLIN Indique el grosor de línea por defecto para los nuevos objetos o [?]:"
    )
    cad.escape()
    cad.command("-COLOR")
    answer(cad, "300")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Indique el color de objeto por defecto [COlorverdadero] <PORCAPA>: 300",
      "Número de color no válido.",
    ])
  })
})

// AutoCAD 2023's console answering the same input.
describe("ELEV asks as AutoCAD 2026", () => {
  it("offers the current values and refuses what is no distance", () => {
    const cad = createHarness()
    cad.command("ELEV")
    answer(cad, "FOO", "5", "FOO", "2")
    cad.command("ELEV")
    answer(cad, "", "")
    expect(cad.commandLog()).toEqual([
      "ELEV",
      "Specify new default elevation <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify new default elevation <0.00>: 5",
      "Specify new default thickness <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify new default thickness <0.00>: 2",
      "ELEV",
      "Specify new default elevation <5.00>:",
      "Specify new default thickness <2.00>:",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("ELEV")
    answer(cad, "FOO", "5")
    expect(cad.commandLog().slice(1)).toEqual([
      "Precise nueva elevación por defecto <0.00>: FOO",
      "Requiere una distancia numérica o dos puntos.",
      "Precise nueva elevación por defecto <0.00>: 5",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ELEV Precise nueva altura de objeto por defecto <0.00>:"
    )
  })
})
