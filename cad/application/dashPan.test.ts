import { describe, expect, it } from "vitest"

import { p } from "../../test/builders"
import { type CadHarness, createHarness } from "../../test/harness"
import type { Vec2 } from "../geometry/Vec2"
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

/** Where `point` shows on the screen. */
const shown = (cad: CadHarness, point: Vec2) =>
  cad.runtime.viewport.worldToScreen(point)

const LINE = ["L", "0,0", "10,0", ""]
const BASE = "Specify base point or displacement:"
const SECOND = " Specify second point:"
const REFUSED = "Requires two points, or a displacement followed by ENTER."

// AutoCAD 2023's console (acc/z6, z16, z17, g1–g25, k15, k16 of the -PAN
// session).
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
