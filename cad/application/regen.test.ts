import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

/**
 * REGEN and REGENALL, as AutoCAD 2027's console runs them (probe
 * primitives/p502): `Regenerating model.`, a step U names and takes nothing
 * back with, never transparent.
 */

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

describe("REGEN and REGENALL", () => {
  it.each(["REGEN", "REGENALL"])(
    "%s says Regenerating model., and its U names it alone (p502)",
    (command) => {
      const cad = answer(createHarness(), "LINE", "0,0", "10,0", "")
      expect(written(cad, `_${command}`)).toEqual([
        command,
        "Regenerating model.",
      ])
      expect(cad.activeToolId()).toBe("select")
      expect(written(cad, "_U")).toEqual(["U", command])
      expect(cad.entities()).toHaveLength(1)
    }
  )

  it("answers to RE and REA (acad.pgp)", () => {
    const cad = createHarness()
    expect(written(cad, "RE")).toEqual(["RE REGEN", "Regenerating model."])
    expect(written(cad, "REA")).toEqual(["REA REGENALL", "Regenerating model."])
  })

  it.each(["'_REGEN", "'_REGENALL"])(
    "%s is refused at LINE's first prompt (p502)",
    (typed) => {
      const cad = answer(createHarness(), "LINE")
      expect(written(cad, typed)).toEqual([
        `Specify first point: ${typed.replace("_", "")}`,
        "** That command may not be invoked transparently **",
        "Invalid point.",
      ])
      expect(cad.activeToolId()).toBe("line")
      expect(written(cad, "0,0", "5,5", "")).toHaveLength(3)
      expect(written(cad, "_U")).toEqual(["U", "LINE"])
    }
  )

  it.each([
    [es, "H", "REGENT", "RGT", "Regenerando modelo."],
    [ptBR, "D", "REGENTUDO", "RGT", "Regenerando modelo."],
  ])(
    "is worded by the language's AutoCAD (p502 es, pt-BR)",
    (locale, undo, all, alias, regenerating) => {
      const cad = createHarness({ locale })
      expect(written(cad, "_REGEN")).toEqual(["REGEN", regenerating])
      expect(written(cad, "_U")).toEqual([undo, "REGEN"])
      expect(written(cad, "_REGENALL")).toEqual([all, regenerating])
      expect(written(cad, "_U")).toEqual([undo, all])
      expect(written(cad, "RG")).toEqual(["RG REGEN", regenerating])
      expect(written(cad, alias)).toEqual([`${alias} ${all}`, regenerating])
    }
  )
})
