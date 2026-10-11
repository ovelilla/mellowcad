import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const MODES =
  "Enter an option to change [Invisible/Constant/Verify/Preset/Lock position] <done>:"
const modesLine = (verify: "Y" | "N") =>
  `Current attribute modes:\nInvisible=N  Constant=N  Verify=${verify}  Preset=N  Lock position=Y  Annotative=N  Multiple line=N`

// Each transcript is AutoCAD 2023's console answering the same input, with
// the options this build offers (no Annotative or Multiple lines, no
// Basepoint, X, Y, Z, Explode or REpeat) and the drawing's precision.
describe("ATTDEF, BLOCK and INSERT ask as AutoCAD 2026", () => {
  it("ATTDEF asks the modes, the tag, prompt and default, then TEXT's prompts", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    answer(cad, "FOO", "V")
    cad.enter().enter()
    answer(cad, "TAG1", "Prompt one", "def1", "FOO", "0,5", "FOO", "2.5")
    answer(cad, "FOO", "0")

    expect(cad.commandLog()).toEqual([
      "ATTDEF",
      modesLine("N"),
      `${MODES} FOO`,
      "Invalid option keyword.",
      `${MODES} V`,
      modesLine("Y"),
      MODES,
      "Enter attribute tag name:",
      "Tag cannot be null",
      "Enter attribute tag name: TAG1",
      "Enter attribute prompt: Prompt one",
      "Enter default attribute value: def1",
      'Current text style:  "Standard"  Text height:  2.50  Justify:  Left',
      "Specify start point of text or [Justify/Style]: FOO",
      "Point or option keyword required.",
      "Specify start point of text or [Justify/Style]: 0,5",
      "Specify height <2.50>: FOO",
      "Requires numeric distance or second point.",
      "Specify height <2.50>: 2.5",
      "Specify rotation angle of text <0>: FOO",
      "Requires valid numeric angle or second point.",
      "Specify rotation angle of text <0>: 0",
    ])
    expect(cad.typeCounts().attdef).toBe(1)
  })

  it("ATTDEF asks a constant attribute's value, and a justification's point", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    answer(cad, "C")
    cad.enter()
    answer(cad, "T1", "FOO", "MC")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Enter attribute value: FOO",
      'Current text style:  "Standard"  Text height:  2.50  Justify:  Left',
      "Specify start point of text or [Justify/Style]: MC",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ATTDEF Specify middle point of text:"
    )
  })

  it("BLOCK says its conversion, refuses a bad name and asks Select objects", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    cad.command("BLOCK")
    answer(cad, "a<b", "B1", "FOO", "0,0", "L")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "BLOCK",
      "Current settings: Object conversion=Convert",
      "Enter block name or [?]: a<b",
      "Invalid block name.",
      "Enter block name or [?]: B1",
      "Specify insertion base point: FOO",
      "Invalid point.",
      "Specify insertion base point: 0,0",
      "Select objects: L",
      "1 found",
      "Select objects:",
    ])
    expect(cad.typeCounts().insert).toBe(1)
  })

  it("INSERT offers the last block, sets Scale and Rotate, then asks the attribute values", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    cad.enter()
    answer(cad, "TAG1", "Prompt one", "def1", "0,5")
    cad.enter().enter()
    cad.command("BLOCK")
    answer(cad, "B1", "0,0", "L")
    cad.enter().enter()
    const lines = cad.commandLog().length

    cad.command("INSERT")
    answer(cad, "B1", "FOO", "S", "FOO", "2", "R", "FOO", "30", "5,5", "val1")
    expect(cad.commandLog().slice(lines)).toEqual([
      "INSERT",
      "Enter block name or [?] <B1>: B1",
      "Specify insertion point or [Scale/Rotate]: FOO",
      "Point or option keyword required.",
      "Specify insertion point or [Scale/Rotate]: S",
      "Specify scale factor for XYZ axes <1.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify scale factor for XYZ axes <1.00>: 2",
      "Specify insertion point or [Scale/Rotate]: R",
      "Specify rotation angle <0>: FOO",
      "Requires valid numeric angle or two points.",
      "Specify rotation angle <0>: 30",
      "Specify insertion point or [Scale/Rotate]: 5,5",
      "Enter attribute values",
      "Prompt one <def1>: val1",
    ])
    expect(cad.typeCounts().insert).toBe(2)
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(10, 0))],
    })
    cad.command("BLOQUE")
    answer(cad, "B1", "0,0")
    expect(cad.commandLog()).toEqual([
      "BLOQUE",
      "Parámetros actuales: conversión de objetos=Convertir",
      "Indique nombre de bloque o [?]: B1",
      "Especifique un punto base de inserción: 0,0",
    ])
    cad.escape()
    cad.command("ATRDEF")
    expect(cad.state().commandLine.prompt).toBe(
      "ATRDEF Indique una opción para modificar [Invisible/Constante/Verificable/Predefinido/Bloquear posición] <terminado>:"
    )
    cad.enter()
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("El identificador no puede ser nulo")
  })
})
