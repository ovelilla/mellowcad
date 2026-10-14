import { describe, expect, it } from "vitest"

import { p } from "../../test/builders"
import { type CadHarness, createHarness } from "../../test/harness"
import { es } from "../locales/es"

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

const camera = (cad: CadHarness) => cad.runtime.viewport.getCamera()

const LINE = ["L", "0,0", "10,0", ""]
const CIRCLE = ["C", "5,5", "2"]

// AutoCAD 2023's console (acc/z1–z38 of the MREDO session).
describe("the view as an undo step", () => {
  it("a ZOOM is one, which REDO does again", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "ZOOM", "W", "0,0", "5,5")
    const after = camera(cad)
    expect(after).not.toEqual(before)
    expect(written(cad, "U")).toEqual(["U", "ZOOM"])
    expect(camera(cad)).toEqual(before)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "ZOOM",
      "Everything has been redone",
    ])
    expect(camera(cad)).toEqual(after)
    expect(cad.entities()).toHaveLength(1)
  })

  it("joins consecutive ZOOMs, regenerating as the view goes back", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "ZOOM", "E", "ZOOM", "2X", "ZOOM", "0.5X")
    const after = camera(cad)
    expect(written(cad, "U")).toEqual([
      "U",
      "ZOOM ZOOM ZOOM Regenerating model.",
    ])
    expect(camera(cad)).toEqual(before)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "ZOOM ZOOM ZOOM",
      "Everything has been redone",
    ])
    expect(camera(cad)).toEqual(after)
    const two = answer(createHarness(), ...LINE, "ZOOM", "2X", "ZOOM", "2X")
    expect(written(two, "UNDO", "2").slice(-1)).toEqual(["ZOOM ZOOM LINE"])

    // Back where they started, nothing regenerates (acc/z4).
    const back = answer(createHarness(), ...LINE, "ZOOM", "E", "ZOOM", "P")
    expect(written(back, "U")).toEqual(["U", "ZOOM ZOOM"])
  })

  it("names a ZOOM typed with an apostrophe so, last first", () => {
    const cad = answer(createHarness(), ...LINE, "'ZOOM", "2X", "ZOOM", "2X")
    expect(written(cad, "U", "U")).toEqual(["U", "ZOOM 'ZOOM", "U", "LINE"])
  })

  it("keeps ZOOMs apart that another command or a mark parts", () => {
    for (const between of [CIRCLE, ["ID", "0,0"], ["UNDO", "M"]]) {
      const cad = answer(createHarness(), ...LINE, "ZOOM", "2X", ...between)
      answer(cad, "ZOOM", "2X")
      expect(written(cad, "U")).toEqual(["U", "ZOOM"])
    }
    // The navigation bar's are a menu's, never joined.
    const bar = answer(createHarness(), ...LINE, "ZOOM", "2X")
    bar.runtime.navigate("ZOOM", "Window")
    bar.click(p(0, 0)).click(p(5, 5))
    expect(written(bar, "U", "U")).toEqual(["U", "'ZOOM", "U", "ZOOM"])
  })

  it("puts ZOOM Previous's list back with it", () => {
    const cad = answer(createHarness(), ...LINE, "ZOOM", "E", "ZOOM", "2X")
    expect(written(cad, "U", "ZOOM", "P").slice(-1)).toEqual([
      "No previous view saved.",
    ])
  })

  it("-VIEW, VPOINT and PLAN are steps that regenerate both ways", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "-VIEW", "SWISO")
    const after = camera(cad)
    expect(written(cad, "U")).toEqual(["U", "-VIEW Regenerating model."])
    expect(camera(cad)).toEqual(before)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "-VIEW",
      "Everything has been redone",
      "Regenerating model.",
    ])
    expect(camera(cad)).toEqual(after)

    const vpoint = answer(createHarness(), ...LINE, "VPOINT", "1,1,1")
    answer(vpoint, "PLAN", "W")
    const plan = camera(vpoint)
    expect(written(vpoint, "U")).toEqual(["U", "PLAN Regenerating model."])
    expect(camera(vpoint)).not.toEqual(plan)
    expect(written(vpoint, "U")).toEqual(["U", "VPOINT Regenerating model."])
  })

  it("a ZOOM inside a command goes with it", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "LINE", "0,0", "'ZOOM", "2X", "5,5", "")
    expect(camera(cad)).not.toEqual(before)
    expect(written(cad, "U")).toEqual(["U", "LINE"])
    expect(camera(cad)).toEqual(before)
    expect(cad.entities()).toHaveLength(1)
  })

  it("the wheel is no command, and stays out of it", () => {
    const cad = answer(createHarness(), ...LINE)
    answer(cad, "LINE", "0,0")
    cad.wheel(p(0, 0), -100)
    const wheeled = camera(cad)
    answer(cad, "5,5", "", "U")
    expect(camera(cad)).toEqual(wheeled)
  })

  it("speaks Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "", "ZOOM", "E", "ZOOM", "2X")
    expect(written(cad, "H")).toEqual(["H", "ZOOM ZOOM Regenerando modelo."])
  })
})
