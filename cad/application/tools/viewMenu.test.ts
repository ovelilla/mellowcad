import { describe, expect, it } from "vitest"
import { VIEW_MENU } from "./viewPresets"
import { isWorldUcs } from "../../domain/ucs"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

describe("the view menu", () => {
  it("lists the presets in the viewport control's order", () => {
    expect(VIEW_MENU).toEqual([
      "Top",
      "Bottom",
      "Left",
      "Right",
      "Front",
      "BAck",
      "SWiso",
      "SEiso",
      "NEiso",
      "NWiso",
    ])
  })

  it("names the preset each entry runs, as -VIEW", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] })

    for (const preset of VIEW_MENU) {
      expect(cad.runtime.applyViewPreset(preset)).toBe(true)
      expect(cad.state().view.preset).toBe(preset)
      expect(cad.commandLog().slice(-3)).toEqual([
        "-VIEW",
        `Enter an option [Orthographic]: _${preset}`,
        "Regenerating model.",
      ])
      expect(cad.activeToolId()).toBe("select")
    }
  })

  it("aligns the UCS with an orthographic view, not with an isometric one", () => {
    const cad = createHarness()

    cad.runtime.applyViewPreset("Front")
    const front = cad.runtime.document.getSettings().ucs
    expect(isWorldUcs(front)).toBe(false)
    expect(front.yAxis.z).toBeCloseTo(1, 12)

    cad.runtime.applyViewPreset("SEiso")
    expect(cad.runtime.document.getSettings().ucs).toBe(front)

    cad.runtime.applyViewPreset("Top")
    expect(isWorldUcs(cad.runtime.document.getSettings().ucs)).toBe(true)
  })

  it("fits the extents, which ZOOM Previous steps back from", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(2000, 0))] })

    cad.runtime.applyViewPreset("SWiso")
    expect(cad.state().scale).toBeLessThan(1)

    cad.command("ZOOM").option("Previous")
    expect(cad.state().view.preset).toBe("Top")
  })

  it("reads the preset VPOINT looks along, and a custom view otherwise", () => {
    const cad = createHarness()
    expect(cad.state().view.preset).toBe("Top")

    cad.command("-VPOINT").type("0,-1,0").enter()
    expect(cad.state().view.preset).toBe("Front")

    cad.command("VPOINT").type("1,1,1").enter()
    expect(cad.state().view.preset).toBe("NEiso")

    cad.command("VPOINT").type("1,2,3").enter()
    expect(cad.state().view.preset).toBeNull()
  })

  it("calls an orbited view custom", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.applyViewPreset("SEiso")

    cad.command("3DORBIT").drag(p(0, 0), p(40, 10)).escape()

    expect(cad.state().view.preset).toBeNull()
  })

  it("calls a turned plan custom", () => {
    const cad = createHarness()

    cad.command("UCS").option("Z").type("30").enter()
    cad.command("PLAN").enter()

    expect(cad.runtime.viewport.isPlan).toBe(true)
    expect(cad.state().view.preset).toBeNull()
  })

  it("runs in the command language, echoing its name", () => {
    const cad = createHarness({ locale: es })

    expect(cad.runtime.applyViewPreset("NWiso")).toBe(true)

    expect(cad.state().view.preset).toBe("NWiso")
    expect(cad.commandLog().slice(-3)).toEqual([
      cad.runtime.text.commandNames("-VIEW")[0],
      "Indique una opción [Ortogonal]: _NWiso",
      "Regenerando modelo.",
    ])
  })
})
