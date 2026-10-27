import { describe, expect, it } from "vitest"
import { VIEW_MENU } from "./viewPresets"
import { isWorldUcs } from "../../domain/ucs"
import { type CadHarness, createHarness } from "../../../test/harness"
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
        "'_-view",
        `Enter an option [Orthographic]: _${preset.toLowerCase()}`,
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

  it("runs in the command language, echoing its macro", () => {
    const cad = createHarness({ locale: es })

    expect(cad.runtime.applyViewPreset("NWiso")).toBe(true)

    expect(cad.state().view.preset).toBe("NWiso")
    expect(cad.commandLog().slice(-3)).toEqual([
      "'_-view",
      "Indique una opción [Ortogonal]: _nwiso",
      "Regenerando modelo.",
    ])
  })
})

// AutoCAD 2027's desktop (research/probes/view d06, d07, e01, VWD).
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

const scale = (cad: CadHarness) => cad.runtime.viewport.scale
const REGEN = "Regenerating model."

function drawing(): CadHarness {
  return answer(
    createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] }),
    "_LINE",
    "200,200",
    "210,200",
    ""
  )
}

describe("the viewport controls and the navigation bar (desktop view/d06, d07, e01)", () => {
  it("a preset echoes AutoCAD's lowercase macro and U names '-VIEW", () => {
    const cad = drawing()
    const from = cad.commandLog().length
    cad.runtime.applyViewPreset("SWiso")
    expect(cad.commandLog().slice(from).join(" ")).toBe(
      `'_-view Enter an option [Orthographic]: _swiso ${REGEN}`
    )
    expect(written(cad, "U")).toEqual(["U", `'-VIEW ${REGEN}`])
    const spanish = answer(
      createHarness({ locale: es }),
      "_LINE",
      "0,0",
      "1,1",
      ""
    )
    spanish.runtime.applyViewPreset("SWiso")
    expect(written(spanish, "H")).toEqual(["H", "'-VISTA Regenerando modelo."])
  })

  // The bar's In runs acad.cuix's `'_zoom 2x`.
  it("Zoom In doubles, a menu step 'ZOOM GROUP never joined", () => {
    const cad = answer(drawing(), "ZOOM", "0.5X")
    const before = scale(cad)
    cad.runtime.navigate("ZOOM", "2x")
    expect(scale(cad) / before).toBeCloseTo(2, 9)
    cad.runtime.navigate("ZOOM", "2x")
    expect(written(cad, "U")).toEqual(["U", "'ZOOM GROUP"])
    expect(scale(cad) / before).toBeCloseTo(2, 9)
  })

  // acad.cuix's `'_zoom .5x`, `'_zoom _e`, `'_zoom _p`, each a menu's step.
  it("Out halves, Extents and Previous answer ZOOM's prompt, never joined", () => {
    const cad = drawing()
    const before = scale(cad)
    cad.runtime.navigate("ZOOM", ".5x")
    expect(scale(cad) / before).toBeCloseTo(0.5, 9)
    cad.runtime.navigate("ZOOM", "_e")
    cad.runtime.navigate("ZOOM", "_p")
    expect(scale(cad) / before).toBeCloseTo(0.5, 9)
    expect(cad.commandLog().slice(-2)).toEqual([
      "'ZOOM",
      "Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: _p",
    ])
    expect(written(cad, "U", "U", "U")).toEqual([
      "U",
      "'ZOOM GROUP",
      "U",
      "'ZOOM GROUP",
      "U",
      "'ZOOM GROUP",
    ])
    expect(scale(cad)).toBeCloseTo(before, 9)
  })

  // acad.cuix's `'_3dorbit`: transparent, as `'3DORBIT` typed (VWD-08).
  it("Orbit runs inside the running command", () => {
    const cad = answer(drawing(), "_LINE", "0,0")
    cad.runtime.navigate("3DORBIT")
    expect(cad.activeToolId()).toBe("orbit")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      REGEN,
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
  })

  it("Pan is 'PAN GROUP", () => {
    const cad = drawing()
    cad.runtime.navigate("PAN")
    cad.escape()
    expect(written(cad, "U")).toEqual(["U", "'PAN GROUP"])
  })
})
