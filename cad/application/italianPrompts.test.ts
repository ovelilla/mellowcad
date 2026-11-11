import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { it as italian } from "../locales/it"

// What Italian AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, it-IT; docs/i18n/it.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inItalian = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: italian, entities })

describe("Italian AutoCAD's command language", () => {
  it("asks LINEA's points as the console does (names/p03)", () => {
    const cad = answer(inItalian(), "LINEA")
    expect(asked(cad)).toBe("LINEA Specificare primo punto:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "LINEA Specificare punto successivo o [Annulla]:"
    )
  })

  it("runs OFFSET by its alias OF, with Punto for Through (offset, 22470)", () => {
    expect(asked(answer(inItalian(), "OF"))).toBe(
      "OFFSET Specificare distanza di offset o [Punto/Cancella/Layer] <Punto>:"
    )
  })

  it("gives E to ESPLODI, S to SPOSTA and CA to CANCELLA, as Italian acad.pgp does", () => {
    expect(asked(answer(inItalian(), "E"))).toMatch(/^ESPLODI /)
    expect(asked(answer(inItalian(), "S"))).toMatch(/^SPOSTA /)
    expect(asked(answer(inItalian(), "CA"))).toMatch(/^CANCELLA /)
  })

  it("reads -OSNAP's words by their three capitals: FIN is Endpoint, EST Extension (names/p07)", () => {
    const modes = answer(inItalian(), "-OSNAP", "FIN,EST,VIC,APP", "-OSNAP")
    expect(asked(modes)).toBe(
      "-OSNAP Digitare elenco di modalità di snap ad oggetto:"
    )
    expect(modes.commandLog().join("\n")).toContain(
      "Modalità osnap correnti: Fine,Vic,App,Est"
    )
  })

  it("takes MED at a point prompt as Midpoint and refuses M (names/p09)", () => {
    const cad = answer(inItalian(), "LINEA", "MED", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Punto non valido.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toEqual({ x: 5, y: 0 })
    const refused = answer(inItalian(), "LINEA", "M")
    expect(refused.commandLog().join("\n")).toContain("Punto non valido.")
  })

  it("asks DA's base point and offset (names/p03)", () => {
    const cad = answer(inItalian(), "LINEA", "DA")
    expect(asked(cad)).toBe("LINEA Punto base:")
    expect(asked(answer(cad, "0,0"))).toBe("LINEA <Offset>:")
  })
})
