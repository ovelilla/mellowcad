import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { fr } from "../locales/fr"

// What French AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, fr-FR; docs/i18n/fr.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const french = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: fr, entities })

describe("French AutoCAD's command language", () => {
  it("asks LIGNE's points as the console does (names/p03)", () => {
    const cad = answer(french(), "LIGNE")
    expect(asked(cad)).toBe("LIGNE Spécifiez le premier point:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "LIGNE Spécifiez le point suivant ou [annUler]:"
    )
  })

  it("runs DECALER by its alias DC, with Par for Through (offset, 22470)", () => {
    expect(asked(answer(french(), "DC"))).toBe(
      "DECALER Spécifiez la distance de décalage ou [Par/Effacer/Calque] <Par>:"
    )
  })

  it("gives E to ETIRER and EF to EFFACER, as French acad.pgp does", () => {
    expect(asked(answer(french(), "E"))).toMatch(/^ETIRER /)
    expect(asked(answer(french(), "EF"))).toMatch(/^EFFACER /)
  })

  it("reads -ACCROBJ's words by their three capitals: EXT is Endpoint, EXTE Extension (names/p07)", () => {
    const modes = answer(french(), "-ACCROBJ", "EXT,EXTE,PRO,PROJ", "-ACCROBJ")
    expect(asked(modes)).toBe(
      "-ACCROBJ Entrez la liste des modes d'accrochage aux objets:"
    )
    expect(modes.commandLog().join("\n")).toContain(
      "Modes accrobj courants: Extr,Pro,Proj,Exte"
    )
  })

  it("takes MIL at a point prompt as Midpoint and refuses M (names/p09)", () => {
    const cad = answer(french(), "LIGNE", "MIL", "5,0.1")
    expect(asked(cad)).toBe("LIGNE Spécifiez le point suivant ou [annUler]:")
    expect(cad.commandLog().join("\n")).toContain(
      "Spécifiez le premier point: MIL"
    )
    const refused = answer(french(), "LIGNE", "M")
    expect(refused.commandLog().join("\n")).toContain("Point incorrect.")
  })

  it("asks DEPUIS's base point and offset (names/p03)", () => {
    const cad = answer(french(), "LIGNE", "DEPUIS")
    expect(asked(cad)).toBe("LIGNE Point de base:")
    expect(asked(answer(cad, "0,0"))).toBe("LIGNE <Décalage>:")
  })
})
