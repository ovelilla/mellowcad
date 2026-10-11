import { describe, expect, it } from "vitest"

import { createHarness, type CadHarness } from "../../../test/harness"
import { es } from "../../locales/es"

/**
 * LTSCALE sets the global linetype scale factor, saved in the drawing: `Enter
 * new linetype scale factor <1.0000>:`, offering the current one, which
 * "cannot equal zero". Changing it regenerates the drawing.
 */

function ltScale(cad: CadHarness): number {
  return cad.runtime.document.getSettings().ltScale
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

  it("keeps the factor answered with Enter, and says nothing", () => {
    const cad = createHarness()
    cad.command("LTSCALE").type("4").enter()
    const lines = cad.commandLog().length

    cad.command("LTSCALE").enter()

    expect(ltScale(cad)).toBe(4)
    expect(cad.state().activeToolId).toBe("select")
    expect(cad.commandLog().slice(lines)).toEqual([
      "LTSCALE",
      "Enter new linetype scale factor <4.00>:",
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

  it("is one undo step", () => {
    const cad = createHarness()

    cad.command("LTSCALE").type("10").enter().undo()

    expect(ltScale(cad)).toBe(1)
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
