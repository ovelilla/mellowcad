import { afterEach, describe, expect, it, vi } from "vitest"

import { lineOf, p } from "../../test/builders"
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
    bar.runtime.zoom("window")
    bar.click(p(0, 0)).click(p(5, 5))
    expect(written(bar, "U", "U")).toEqual(["U", "'ZOOM GROUP", "U", "ZOOM"])
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

// The desktop's gestures (research/probes/view d01–d04, VWD): each is an undo
// step of its own at the Command prompt, and an entry of the running command
// inside one.
const scale = (cad: CadHarness) => cad.runtime.viewport.scale
const direction = (cad: CadHarness) => {
  const d = cad.runtime.viewport.direction
  return [d.x, d.y, d.z].map((n) => +n.toFixed(6) + 0)
}

/** The desktop probes' drawing: a line there, and one LINE run before the gesture. */
function drawing(): CadHarness {
  return answer(
    createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] }),
    "_LINE",
    "200,200",
    "210,200",
    ""
  )
}

let now = 1_000_000
function clock(): void {
  vi.spyOn(Date, "now").mockImplementation(() => now)
}

describe("the wheel (desktop view/d01)", () => {
  afterEach(() => vi.restoreAllMocks())

  it("one notch zooms 1.5978× about the cursor", () => {
    const cad = drawing()
    const before = scale(cad)
    cad.wheel(p(50, 25), -100)
    expect(scale(cad) / before).toBeCloseTo(120 / 75.102, 3)
  })

  it("U takes a wheel zoom back as INTELLIZOOM, the line kept", () => {
    clock()
    const cad = drawing()
    const before = scale(cad)
    cad.wheel(p(50, 25), -100)
    now += 1200
    cad.wheel(p(50, 25), -100)
    expect(written(cad, "U")).toEqual(["U", "INTELLIZOOM INTELLIZOOM"])
    expect(scale(cad)).toBeCloseTo(before, 9)
    expect(cad.entities()).toHaveLength(2)
  })

  it("joins a typed ZOOM before it", () => {
    const cad = answer(drawing(), "ZOOM", "2X")
    cad.wheel(p(50, 25), -100)
    expect(written(cad, "U")).toEqual(["U", "INTELLIZOOM ZOOM"])
  })

  it("notches under a second apart are one ZOOM Previous step", () => {
    clock()
    const cad = drawing()
    const before = scale(cad)
    cad.wheel(p(50, 25), -100)
    now += 900
    cad.wheel(p(50, 25), -100)
    answer(cad, "ZOOM", "P")
    expect(scale(cad)).toBeCloseTo(before, 9)
  })

  it("LINE's Undo takes a wheel zoom back with the segment", () => {
    const cad = drawing()
    answer(cad, "_LINE", "0,0", "10,0")
    const before = scale(cad)
    cad.wheel(p(50, 25), -100)
    answer(cad, "_U")
    expect(scale(cad)).toBeCloseTo(before, 9)
  })
})

describe("a wheel burst", () => {
  // Its later notches widen its step only while nothing else came between.
  it("parts at a segment drawn between its notches", () => {
    const cad = answer(drawing(), "_LINE", "0,0", "10,0")
    cad.wheel(p(50, 25), -100)
    const first = scale(cad)
    answer(cad, "20,0")
    cad.wheel(p(50, 25), -100)
    answer(cad, "_U")
    expect(scale(cad)).toBeCloseTo(first, 9)
    expect(cad.entities()).toHaveLength(3)
  })
})

describe("the wheel button (desktop view/d02)", () => {
  afterEach(() => vi.restoreAllMocks())

  it("a drag's pan is INTELLIPAN, joined with ZOOMs", () => {
    const cad = answer(drawing(), "ZOOM", "2X")
    cad.drag(p(50, 25), p(30, 15), { button: 1 })
    expect(written(cad, "U")).toEqual(["U", "INTELLIPAN ZOOM"])
  })

  it("a click without a move is a step too", () => {
    const cad = drawing()
    cad.click(p(50, 25), { button: 1 })
    expect(written(cad, "U")).toEqual(["U", "INTELLIPAN"])
  })

  it("a double-click is ZOOM Extents, echoed, and U names it", () => {
    const cad = drawing()
    const from = cad.commandLog().length
    cad.click(p(50, 25), { button: 1 })
    cad.click(p(50, 25), { button: 1 })
    expect(cad.commandLog().slice(from)).toEqual([
      "'_.zoom",
      "Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: _e",
    ])
    expect(written(cad, "U")).toEqual(["U", "'.ZOOM INTELLIPAN"])
  })

  it("Shift + drag orbits, regenerates, and U names a menu group", () => {
    const cad = drawing()
    const from = cad.commandLog().length
    cad.drag(p(50, 25), p(60, 22), { button: 1, shiftKey: true })
    expect(cad.commandLog().slice(from)).toEqual([REGEN])
    expect(written(cad, "U")).toEqual(["U", `GROUP menu item ${REGEN}`])
    expect(direction(cad)).toEqual([0, 0, 1])
  })
})

describe("real-time PAN (desktop view/d03)", () => {
  it("joins the ZOOMs round it", () => {
    const cad = answer(drawing(), "ZOOM", "2X", "PAN")
    cad.drag(p(50, 25), p(40, 20))
    answer(cad, "", "ZOOM", "0.5X")
    expect(written(cad, "U")).toEqual(["U", "ZOOM PAN ZOOM"])
  })

  it("is a step without a drag, joined", () => {
    const cad = answer(drawing(), "ZOOM", "2X", "PAN")
    cad.escape()
    expect(written(cad, "U")).toEqual(["U", "PAN ZOOM"])
  })
})

describe("3DORBIT's step (desktop view/d04)", () => {
  it("says Regenerating model. as it ends, and U too, with no drag", () => {
    const cad = answer(drawing(), "ZOOM", "2X")
    expect(written(cad, "3DORBIT", "")).toEqual([
      "3DORBIT",
      "Press ESC or ENTER to exit, or right-click to display shortcut-menu.",
      REGEN,
    ])
    expect(written(cad, "U")).toEqual(["U", `3DORBIT ${REGEN}`])
  })
})

describe("the gestures' steps in Spanish (desktop view/e01)", () => {
  it("keep INTELLIZOOM, INTELLIPAN and '.VIEWCUBEACTION, and say GRUPO and 3DORBITA", () => {
    const cad = () =>
      answer(createHarness({ locale: es }), "_LINE", "0,0", "100,50", "")
    const wheeled = cad()
    wheeled.wheel(p(50, 25), -100)
    expect(written(wheeled, "H")).toEqual(["H", "INTELLIZOOM"])
    const panned = cad()
    panned.drag(p(50, 25), p(30, 15), { button: 1 })
    expect(written(panned, "H")).toEqual(["H", "INTELLIPAN"])
    const cubed = cad()
    cubed.runtime.viewCubePick("front")
    expect(written(cubed, "H")).toEqual([
      "H",
      "'.VIEWCUBEACTION Regenerando modelo.",
    ])
    const orbited = cad()
    orbited.drag(p(50, 25), p(60, 22), { button: 1, shiftKey: true })
    expect(written(orbited, "H")).toEqual([
      "H",
      "GRUPO menu item Regenerando modelo.",
    ])
    const orbit = answer(cad(), "3DORBITA", "")
    expect(written(orbit, "H")).toEqual(["H", "3DORBITA Regenerando modelo."])
  })
})
