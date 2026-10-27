import { describe, expect, it } from "vitest"

import { lineOf, p } from "../../test/builders"
import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec2 } from "../geometry/Vec2"
import { es } from "../locales/es"
import { THEME } from "../scene/theme"

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

/** Where `point` shows on the screen. */
const shown = (cad: CadHarness, point: Vec2) =>
  cad.runtime.viewport.worldToScreen(point)

const LINE = ["L", "0,0", "10,0", ""]
const BASE = "Specify base point or displacement:"
const SECOND = " Specify second point:"
const REFUSED = "Requires two points, or a displacement followed by ENTER."

// AutoCAD 2027's console: probes view/p204–p220 (the points, Enter, FOO,
// LASTPOINT, transparency), p338 (U, REDO), p354–p356, p368 (its steps).
describe("-PAN", () => {
  it("moves the drawing from the base point to the second", () => {
    const cad = answer(createHarness(), ...LINE)
    const target = shown(cad, p(5, 5))
    expect(written(cad, "-PAN")).toEqual(["-PAN"])
    expect(cad.state().commandLine.prompt).toBe(`-PAN ${BASE}`)
    expect(written(cad, "0,0")).toEqual([`${BASE} 0,0`])
    expect(cad.state().commandLine.prompt).toBe("-PAN Specify second point:")
    expect(written(cad, "5,5")).toEqual([`${SECOND} 5,5`])
    expect(shown(cad, p(0, 0))).toBeCloseToPoint(target)
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes the first point as a displacement at Enter, and refuses Enter first", () => {
    const cad = answer(createHarness(), ...LINE)
    const target = shown(cad, p(5, 5))
    expect(written(cad, "-PAN", "", "FOO", "5,5", "FOO", "")).toEqual([
      "-PAN",
      BASE,
      REFUSED,
      `${BASE} FOO`,
      REFUSED,
      `${BASE} 5,5`,
      `${SECOND} FOO`,
      REFUSED,
      SECOND,
    ])
    expect(shown(cad, p(0, 0))).toBeCloseToPoint(target)
  })

  it("reads @ from LASTPOINT and from the base point, and leaves LASTPOINT", () => {
    const cad = answer(createHarness(), ...LINE)
    const target = shown(cad, p(15, 5))
    answer(cad, "-PAN", "@", "@5,5")
    expect(shown(cad, p(10, 0))).toBeCloseToPoint(target)
    answer(cad, "-PAN", "1,2", "@3,5")
    expect(written(cad, "ID", "@").at(-1)).toBe(
      " X = 10.00     Y = 0.00     Z = 0.00"
    )
  })

  it("reads the displacement in the UCS", () => {
    const cad = answer(createHarness(), ...LINE, "UCS", "Z", "90")
    const target = shown(cad, p(0, 5))
    answer(cad, "-PAN", "0,0", "5,0")
    expect(shown(cad, p(0, 0))).toBeCloseToPoint(target)
  })

  it("is an undo step of its own, by nothing too", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = cad.runtime.viewport.getCamera()
    answer(cad, "-PAN", "0,0", "")
    expect(written(cad, "U", "U")).toEqual(["U", "-PAN", "U", "LINE"])

    const moved = answer(createHarness(), ...LINE, "-PAN", "0,0", "5,5")
    const after = moved.runtime.viewport.getCamera()
    expect(written(moved, "REDO", "U")).toEqual([
      "REDO",
      "Nothing to redo",
      "U",
      "-PAN",
    ])
    expect(moved.runtime.viewport.getCamera()).toEqual(before)
    expect(written(moved, "REDO")).toEqual([
      "REDO",
      "-PAN",
      "Everything has been redone",
    ])
    expect(moved.runtime.viewport.getCamera()).toEqual(after)

    const zooms = answer(createHarness(), ...LINE, "ZOOM", "2X", "-PAN", "0,0")
    answer(zooms, "5,5", "ZOOM", "2X", "ZOOM", "2X", "-PAN", "0,0", "5,5")
    expect(written(zooms, "U", "U", "U", "U")).toEqual([
      "U",
      "-PAN",
      "U",
      "ZOOM ZOOM",
      "U",
      "-PAN",
      "U",
      "ZOOM",
    ])
  })

  it("runs transparently, and goes with the command it ran in", () => {
    const cad = answer(createHarness(), ...LINE)
    const before = cad.runtime.viewport.getCamera()
    answer(cad, "LINE", "0,0", "'-PAN", "0,0", "5,5")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify next point or [Undo]: '-PAN",
      `>>${BASE} 0,0`,
      `>>${SECOND} 5,5`,
      "Resuming LINE command.",
    ])
    expect(written(cad, "5,5", "", "U")).toEqual([
      "Specify next point or [Undo]: 5,5",
      "Specify next point or [Undo]:",
      "U",
      "LINE",
    ])
    expect(cad.runtime.viewport.getCamera()).toEqual(before)

    const named = answer(createHarness(), ...LINE, "'-PAN", "0,0", "5,5")
    expect(written(named, "U")).toEqual(["U", "'-PAN"])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "")
    expect(written(cad, "-ENCUADRE", "FOO", "0,0", "5,5")).toEqual([
      "-ENCUADRE",
      "Precise punto base de desplazamiento: FOO",
      "Requiere dos puntos o un desplazamiento seguido por INTRO.",
      "Precise punto base de desplazamiento: 0,0",
      " Designe segundo punto: 5,5",
    ])
  })
})

/** How far the centre of the view moved (AutoCAD's VIEWCTR after less before). */
function panned(cad: CadHarness, ...texts: string[]): Vec2 {
  const before = cad.runtime.viewport.worldCenter()
  answer(cad, ...texts)
  const after = cad.runtime.viewport.worldCenter()
  return p(after.x - before.x, after.y - before.y)
}

describe("-PAN against AutoCAD 2027's console", () => {
  // probe view/p217: VIEWCTR 2630.05,1440.68 → 2620.77,1436.96.
  it("reads a bare number at the second point from the base towards the cursor", () => {
    const cad = answer(createHarness(), "ID", "7,8")
    cad.moveTo(p(289.98397, 116.30379))
    expect(panned(cad, "-PAN", "0,0", "10")).toBeCloseToPoint(
      p(-9.28, -3.72),
      1
    )
    expect(written(cad, "ID", "@").at(-1)).toBe(
      " X = 7.00     Y = 8.00     Z = 0.00"
    )
  })

  // probe view/p219
  it("refuses FOO at the second point and asks it again", () => {
    const cad = createHarness()
    expect(written(cad, "-PAN", "0,0", "FOO")).toEqual([
      "-PAN",
      `${BASE} 0,0`,
      `${SECOND} FOO`,
      REFUSED,
    ])
    expect(panned(cad, "1,1")).toBeCloseToPoint(p(-1, -1))
  })

  // probe view/p221
  it("refuses a transparent ZOOM Extents with nothing drawn, and resumes", () => {
    const cad = createHarness()
    expect(written(cad, "-PAN", "'ZOOM", "E")).toEqual([
      "-PAN",
      `${BASE} 'ZOOM`,
      ">>Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: E",
      "** Requires a regen, cannot be transparent.",
      "Resuming -PAN command.",
    ])
    expect(written(cad, "0,0", "1,1")).toEqual([`${BASE} 0,0`, `${SECOND} 1,1`])
  })

  // probe view/p222
  it("runs real-time PAN transparently at the base point", () => {
    const cad = createHarness()
    expect(written(cad, "-PAN", "'PAN")).toEqual([
      "-PAN",
      `${BASE} 'PAN`,
      ">>Press ESC or ENTER to exit, or right-click to display shortcut menu.",
    ])
    expect(cad.activeToolId()).toBe("pan")
  })

  // probe view/p224
  it("takes an object snap typed at the base point", () => {
    const cad = createHarness({ entities: [lineOf(p(3, 4), p(20, 4))] })
    expect(panned(cad, "-PAN", "END", "20.2,4.1", "0,0")).toBeCloseToPoint(
      p(20, 4)
    )
  })

  // probe view/p225
  it("leaves a typed second point unbent by Ortho", () => {
    const cad = createHarness()
    cad.press("F8")
    expect(cad.state().orthoActive).toBe(true)
    cad.moveTo(p(289.98397, 116.30379))
    expect(panned(cad, "-PAN", "0,0", "10,5")).toBeCloseToPoint(p(-10, -5))
  })

  // probe view/p226
  it("drops a preselection", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "A" })],
    })
    cad.click(p(50, 25))
    expect(cad.selectedIds()).toEqual(["A"])
    answer(cad, "-PAN", "0,0", "1,1")
    expect(cad.selectedIds()).toEqual([])
  })
})

// AutoCAD 2027's desktop (research/probes/view d08-1, d09-2, VWD-15).
describe("the bands -PAN and ZOOM draw", () => {
  it("-PAN's is amber and dashed, as MOVE's displacement", () => {
    const cad = answer(createHarness(), "-PAN", "0,0").moveTo(p(30, 20))
    const base = shown(cad, p(0, 0))
    const band = cad
      .scene()
      .primitives.find(
        (q) => q.kind === "segment" && q.a.x === base.x && q.a.y === base.y
      )
    expect(band?.kind === "segment" && band.stroke).toEqual({
      color: THEME.dashedRubberBand,
      width: 1,
      dash: [2, 3],
    })
  })

  it("ZOOM's window is a solid white rectangle", () => {
    const cad = answer(createHarness(), "ZOOM", "0,0").moveTo(p(30, 20))
    const window = cad.scene().primitives.find((q) => q.kind === "rect")
    expect(window?.kind === "rect" && window.stroke).toEqual({
      color: THEME.rubberBand,
      width: 1,
    })
  })
})
