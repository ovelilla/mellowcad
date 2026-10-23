import { describe, expect, it } from "vitest"

import { createHarness, type CadHarness } from "../../../test/harness"
import { es } from "../../locales/es"

/**
 * LTSCALE sets the global linetype scale factor, saved in the drawing: `Enter
 * new linetype scale factor <1.0000>:`, offering the current one, which
 * "cannot equal zero". Changing it regenerates the drawing. Probes
 * properties/p230–p243 (AutoCAD 2027's console).
 */

function ltScale(cad: CadHarness): number {
  return cad.runtime.document.getSettings().ltScale
}

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

describe("LTSCALE", () => {
  it("asks the new factor, offering the current one", () => {
    const cad = createHarness()

    cad.command("LTSCALE")
    expect(cad.state().dynamicInput?.fields[0]).toMatchObject({
      label: "Enter new linetype scale factor",
      placeholder: "1",
    })
    cad.type("2.5").enter()

    expect(ltScale(cad)).toBe(2.5)
    expect(cad.state().ltScale).toBe(2.5)
    expect(cad.state().activeToolId).toBe("select")
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")

    cad.command("LTS")
    expect(cad.state().dynamicInput?.fields[0].placeholder).toBe("2.5")
  })

  it("offers the factor with four decimals whatever the drawing's precision (probe properties/p234)", () => {
    const cad = createHarness()
    expect(answer(cad, "LTSCALE").state().commandLine.prompt).toBe(
      "LTSCALE Enter new linetype scale factor <1.0000>:"
    )
    answer(cad, "1.23456789")
    expect(ltScale(cad)).toBe(1.23456789)

    for (const precision of [2, 6]) {
      cad.runtime.setDocumentPrecision(precision)
      answer(cad, "LTSCALE")
      expect(cad.state().commandLine.prompt, `${precision}`).toBe(
        "LTSCALE Enter new linetype scale factor <1.2346>:"
      )
      cad.escape()
    }
  })

  it("keeps the factor answered with Enter, and says nothing", () => {
    const cad = createHarness()
    cad.command("LTSCALE").type("4").enter()
    const lines = cad.commandLog().length

    cad.command("LTSCALE").enter()

    expect(ltScale(cad)).toBe(4)
    expect(cad.state().activeToolId).toBe("select")
    expect(cad.commandLog().slice(lines)).toEqual([
      "LTSCALE",
      "Enter new linetype scale factor <4.0000>:",
    ])
  })

  it.each(["0", "-1"])("refuses %s and asks again", (typed) => {
    const cad = createHarness()

    cad.command("LTSCALE").type(typed).enter()

    expect(cad.commandLog().at(-1)).toBe("Value must be positive and nonzero.")
    expect(ltScale(cad)).toBe(1)
    expect(cad.state().activeToolId).toBe("ltscale")
    cad.type("3").enter()
    expect(ltScale(cad)).toBe(3)
  })

  it("refuses a word, 0 and -1 in the console's words, and takes 1e3 (probe properties/p231)", () => {
    const cad = createHarness()

    expect(written(cad, "LTSCALE", "FOO", "0", "-1", "1e3")).toEqual([
      "LTSCALE",
      "Enter new linetype scale factor <1.0000>: FOO",
      "Requires numeric value.",
      "Enter new linetype scale factor <1.0000>: 0",
      "Value must be positive and nonzero.",
      "Enter new linetype scale factor <1.0000>: -1",
      "Value must be positive and nonzero.",
      "Enter new linetype scale factor <1.0000>: 1e3",
      "Regenerating model.",
    ])
    expect(ltScale(cad)).toBe(1000)
  })

  it("refuses in Spanish words (probe properties/p231)", () => {
    const cad = createHarness({ locale: es })

    expect(
      written(cad, "ESCALATL", "FOO", "0").filter((line) => line.endsWith("."))
    ).toEqual([
      "Requiere un valor numérico.",
      "El valor debe ser positivo y diferente de cero.",
    ])
  })

  it("takes 1/2 as 0.5 (probe properties/p233)", () => {
    const cad = answer(createHarness(), "LTSCALE", "1/2")

    expect(ltScale(cad)).toBe(0.5)
  })

  it("is one undo step", () => {
    const cad = createHarness()

    cad.command("LTSCALE").type("10").enter().undo()

    expect(ltScale(cad)).toBe(1)
  })

  it("is taken back by U and put back by REDO, each naming it and regenerating (probe properties/p236)", () => {
    const cad = answer(createHarness(), "LTSCALE", "2")

    expect(written(cad, "U")).toEqual(["U", "LTSCALE Regenerating model."])
    expect(ltScale(cad)).toBe(1)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "LTSCALE",
      "Everything has been redone",
      "Regenerating model.",
    ])
    expect(ltScale(cad)).toBe(2)

    const sp = answer(createHarness({ locale: es }), "ESCALATL", "2")
    expect(written(sp, "H")).toEqual(["H", "ESCALATL Regenerando modelo."])
  })

  it("is a step U names when Enter kept the factor, with no regeneration (probe properties/p237)", () => {
    const cad = answer(createHarness(), "LTSCALE", "")

    expect(written(cad, "U")).toEqual(["U", "LTSCALE"])
  })

  it("queues the regeneration run inside LINE, and regenerates when LINE ends (probe properties/p235)", () => {
    const cad = answer(createHarness(), "LINE", "0,0")

    expect(written(cad, "'LTSCALE", "2", "10,0", "")).toEqual([
      "Specify next point or [Undo]: 'LTSCALE",
      ">>Enter new linetype scale factor <1.0000>: 2",
      "Regen queued.",
      "Resuming LINE command.",
      "Specify next point or [Undo]: 10,0",
      "Specify next point or [Undo]:",
      "Regenerating model.",
    ])
    expect(ltScale(cad)).toBe(2)
  })

  it("is saved with the drawing", () => {
    const cad = createHarness()
    cad.command("LTSCALE").type("0.5").enter()

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(ltScale(copy)).toBe(0.5)
  })

  it.each(["ESCALATL", "EC", "_LTSCALE"])("runs as %s in Spanish", (name) => {
    const cad = createHarness({ locale: es })

    cad.command(name)
    expect(cad.state().dynamicInput?.fields[0].label).toBe(
      "Indique nuevo factor de escala del tipo de línea"
    )
    cad.type("2").enter()

    expect(ltScale(cad)).toBe(2)
  })
})
