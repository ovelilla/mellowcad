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

// The probes' drawing (research/probes/view, p336–p369): a line, then ZOOM
// Extents; the circle every probe draws before the command it undoes.
const D = ["_LINE", "0,0", "100,50", "", "_ZOOM", "_E"]
const C = ["_CIRCLE", "50,25", "10"]
const REGEN = "Regenerating model."

describe("the view as an undo step", () => {
  // AutoCAD 2027's console (probe view/p336).
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

  // Probes view/p345, p347, p348.
  it("joins consecutive ZOOMs", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "ZOOM", "E", "ZOOM", "2X", "ZOOM", "0.5X")
    const after = camera(cad)
    expect(written(cad, "U")).toEqual(["U", "ZOOM ZOOM ZOOM"])
    expect(camera(cad)).toEqual(before)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "ZOOM ZOOM ZOOM",
      "Everything has been redone",
    ])
    expect(camera(cad)).toEqual(after)
    const two = answer(createHarness(), ...LINE, "ZOOM", "2X", "ZOOM", "2X")
    expect(written(two, "UNDO", "2").slice(-1)).toEqual(["ZOOM ZOOM LINE"])

    const after3 = answer(createHarness(), ...D, ...C, "_ZOOM", "2X")
    answer(after3, "_ZOOM", "2X")
    expect(written(after3, "_U", "_U")).toEqual([
      "U",
      "ZOOM ZOOM",
      "U",
      "CIRCLE",
    ])
  })

  // Probe view/p361.
  it("names a ZOOM typed with an apostrophe so, last first", () => {
    const cad = answer(createHarness(), ...LINE, "'ZOOM", "2X", "ZOOM", "2X")
    expect(written(cad, "U", "U")).toEqual(["U", "ZOOM 'ZOOM", "U", "LINE"])
  })

  // Probes view/p347 (CIRCLE), p357 (ID); the mark is unprobed in 2027.
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

  // Probes view/p362, p363.
  it("puts ZOOM Previous's list back with it", () => {
    const cad = answer(createHarness(), ...LINE, "ZOOM", "E", "ZOOM", "2X")
    expect(written(cad, "U", "ZOOM", "P").slice(-1)).toEqual([
      "No previous view saved.",
    ])
  })

  // Probes view/p340–p343, p349: each turns the line of sight.
  it("-VIEW, VPOINT and PLAN turning the view regenerate both ways", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "-VIEW", "SWISO")
    const after = camera(cad)
    expect(written(cad, "U")).toEqual(["U", `-VIEW ${REGEN}`])
    expect(camera(cad)).toEqual(before)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "-VIEW",
      "Everything has been redone",
      REGEN,
    ])
    expect(camera(cad)).toEqual(after)

    const vpoint = answer(createHarness(), ...LINE, "VPOINT", "1,1,1")
    answer(vpoint, "PLAN", "W")
    const plan = camera(vpoint)
    expect(written(vpoint, "U")).toEqual(["U", `PLAN ${REGEN}`])
    expect(camera(vpoint)).not.toEqual(plan)
    expect(written(vpoint, "U")).toEqual(["U", `VPOINT ${REGEN}`])
  })

  // Probe view/p358: the zoom is part of LINE's step.
  it("a ZOOM inside a command goes with it", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = camera(cad)
    answer(cad, "LINE", "0,0", "'ZOOM", "2X", "5,5", "")
    expect(camera(cad)).not.toEqual(before)
    expect(written(cad, "U")).toEqual(["U", "LINE"])
    expect(camera(cad)).toEqual(before)
    expect(cad.entities()).toHaveLength(1)
  })

  // Probe view/p360.
  it("LINE's Undo takes back a 'ZOOM made after its segment with it", () => {
    const cad = answer(createHarness(), ...D, ...C)
    const before = camera(cad)
    answer(cad, "_LINE", "0,0", "10,0", "'_ZOOM", "2X")
    expect(camera(cad)).not.toEqual(before)
    answer(cad, "_U", "")
    expect(camera(cad)).toEqual(before)
    expect(cad.entities()).toHaveLength(2)
    expect(written(cad, "_U")).toEqual(["U", "LINE"])
    expect(cad.entities()).toHaveLength(2)
    expect(camera(cad)).toEqual(before)
  })

  it("the wheel is no command, and stays out of it", () => {
    const cad = answer(createHarness(), ...LINE)
    answer(cad, "LINE", "0,0")
    cad.wheel(p(0, 0), -100)
    const wheeled = camera(cad)
    answer(cad, "5,5", "", "U")
    expect(camera(cad)).toEqual(wheeled)
  })

  // Probe view/p347 (es-ES).
  it("speaks Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "", "ZOOM", "E", "ZOOM", "2X")
    expect(written(cad, "H")).toEqual(["H", "ZOOM ZOOM"])
  })
})

// AutoCAD 2027's console, each after the probes' drawing and its circle. A
// view step says `Regenerating model.` on U, REDO and MREDO only when its
// line of sight turned, whatever the run itself said (VIEW-D41).
describe("U, REDO, MREDO and UNDO 2 after each view command", () => {
  // Probe, what runs, the name U writes, whether its U regenerates.
  const cases: [string, string[], string, boolean][] = [
    ["p336", ["_ZOOM", "2X"], "ZOOM", false],
    ["p337", ["_ZOOM", "_E"], "ZOOM", false],
    ["p338", ["_-PAN", "0,0", "10,10"], "-PAN", false],
    ["p339", ["_PLAN", ""], "PLAN", false],
    ["p340", ["_-VPOINT", "1,1,1"], "-VPOINT", true],
    ["p341", ["_VPOINT", "1,1,1"], "VPOINT", true],
    ["p342", ["_-VIEW", "_SWISO"], "-VIEW", true],
    ["p343", ["_-VIEW", "_FRONT"], "-VIEW", true],
    ["p344", ["_NAVVCUBE", "_OFF"], "NAVVCUBE", false],
  ]

  for (const [probe, run, name, regenerates] of cases) {
    it(`${run.join(" ").trim()} (probe view/${probe})`, () => {
      const zoomed = name === "ZOOM" ? ["_ZOOM", "2X"] : []
      const cad = answer(createHarness(), ...D, ...zoomed, ...C, ...run)
      const regen = regenerates ? [REGEN] : []
      expect(written(cad, "_U")).toEqual([
        "U",
        regenerates ? `${name} ${REGEN}` : name,
      ])
      expect(written(cad, "_REDO")).toEqual([
        "REDO",
        name,
        "Everything has been redone",
        ...regen,
      ])
      answer(cad, "_U")
      expect(written(cad, "_MREDO", "1").slice(-2 - regen.length)).toEqual([
        name,
        "Everything has been redone",
        ...regen,
      ])
      // UNDO 2 stops inside the joined ZOOM pair in AutoCAD (VUN-05).
      if (name === "ZOOM") return
      expect(written(cad, "_UNDO", "2").at(-1)).toBe(
        regenerates ? `${name} CIRCLE ${REGEN}` : `${name} CIRCLE`
      )
    })
  }

  // The run says it; its U does not (probe view/p339).
  it("PLAN in plan regenerates as it runs, not on U", () => {
    const cad = answer(createHarness(), ...D, ...C)
    expect(written(cad, "_PLAN", "").at(-1)).toBe(REGEN)
    expect(written(cad, "_U")).toEqual(["U", "PLAN"])
  })

  it("names them in Spanish (probes view/p338, p340–p342 es-ES)", () => {
    const run = (...texts: string[]) => {
      const cad = answer(createHarness({ locale: es }), ...D, ...C, ...texts)
      return written(cad, "_U").at(-1)
    }
    expect(run("_-PAN", "0,0", "10,10")).toBe("-ENCUADRE")
    expect(run("_-VPOINT", "1,1,1")).toBe("-PTOVISTA Regenerando modelo.")
    expect(run("_VPOINT", "1,1,1")).toBe("PTOVISTA Regenerando modelo.")
    expect(run("_-VIEW", "_SWISO")).toBe("-VISTA Regenerando modelo.")
  })
})

// AutoCAD 2027's console: U takes back the view command, never the one
// before it (VIEW-D40).
describe("a view command that leaves the view where it was is still a step", () => {
  it("ZOOM Previous with none saved (probe view/p364)", () => {
    const cad = answer(createHarness(), "_LINE", "0,0", "100,50", "")
    expect(written(cad, "_ZOOM", "_P").at(-1)).toBe("No previous view saved.")
    expect(written(cad, "_U")).toEqual(["U", "ZOOM"])
    expect(cad.entities()).toHaveLength(1)
  })

  it("ZOOM Extents at the extents (probe view/p365)", () => {
    const cad = answer(createHarness(), ...D, ...C, "_ZOOM", "_E")
    expect(written(cad, "_U")).toEqual(["U", "ZOOM"])
    expect(cad.entities()).toHaveLength(2)
    expect(written(cad, "_REDO")).toEqual([
      "REDO",
      "ZOOM",
      "Everything has been redone",
    ])
  })

  it("-VIEW ended with Enter (probe view/p366)", () => {
    const cad = answer(createHarness(), ...D, ...C, "_-VIEW", "")
    expect(written(cad, "_U")).toEqual(["U", "-VIEW"])
    expect(cad.entities()).toHaveLength(2)
  })

  it("NAVVCUBE ended with Enter (probe view/p367)", () => {
    const cad = answer(createHarness(), ...D, ...C, "_NAVVCUBE", "")
    expect(written(cad, "_U")).toEqual(["U", "NAVVCUBE"])
    expect(cad.entities()).toHaveLength(2)
  })

  it("-PAN by a zero displacement (probe view/p368)", () => {
    const cad = answer(createHarness(), ...D, ...C, "_-PAN", "0,0", "")
    expect(written(cad, "_U")).toEqual(["U", "-PAN"])
    expect(cad.entities()).toHaveLength(2)
  })

  it("-VIEW Top in Top says it as it runs, not on U or REDO (probe view/p350)", () => {
    const cad = answer(createHarness(), ...D, ...C)
    expect(written(cad, "_-VIEW", "_TOP").at(-1)).toBe(REGEN)
    expect(written(cad, "_U")).toEqual(["U", "-VIEW"])
    expect(written(cad, "_REDO")).toEqual([
      "REDO",
      "-VIEW",
      "Everything has been redone",
    ])
  })

  it("-VIEW SWISO in SW Isometric (probe view/p369)", () => {
    const cad = answer(createHarness(), ...D, "_-VIEW", "_SWISO", ...C)
    expect(written(cad, "_-VIEW", "_SWISO").at(-1)).toBe(REGEN)
    expect(written(cad, "_U")).toEqual(["U", "-VIEW"])
    expect(cad.entities()).toHaveLength(2)
  })
})
