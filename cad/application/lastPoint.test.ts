import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { es } from "../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What ID @ reports: LASTPOINT. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

// AutoCAD 2023's console, each command followed by ID @ (acc/lp1–lp7.txt).
describe("LASTPOINT", () => {
  it("starts at 0,0,0, and `@` at a first point is from it", () => {
    const cad = createHarness()
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
    answer(cad, "LINE", "@5,5", "@1,0", "")
    expect(cad.entities()[0]).toMatchObject({
      start: { x: 5, y: 5 },
      end: { x: 6, y: 5 },
    })
    expect(lastPoint(cad)).toBe(" X = 6.00     Y = 5.00     Z = 0.00")
  })

  it("is the last point a prompt took, picked or typed", () => {
    const cad = createHarness()
    cad.command("ID").click(p(7, 8))
    answer(cad, "LINE", "@3,0", "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify first point: @3,0",
      "Specify next point or [Undo]:",
    ])
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 8.00     Z = 0.00")
    answer(cad, "ARC", "0,0", "5,5", "10,0")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 0.00     Z = 0.00")
    answer(cad, "RECTANG", "30,30", "40,45")
    expect(lastPoint(cad)).toBe(" X = 40.00     Y = 45.00     Z = 0.00")
    answer(cad, "MIRROR", "L", "", "20,0", "20,10", "N")
    expect(lastPoint(cad)).toBe(" X = 20.00     Y = 10.00     Z = 0.00")
  })

  it("is a circle's center, not the point its radius is given by", () => {
    const cad = createHarness()
    answer(cad, "CIRCLE", "10,10", "5")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
    answer(cad, "CIRCLE", "20,20")
    cad.click(p(25, 20))
    expect(lastPoint(cad)).toBe(" X = 20.00     Y = 20.00     Z = 0.00")
    answer(cad, "CIRCLE", "2P", "50,50", "60,50")
    expect(lastPoint(cad)).toBe(" X = 60.00     Y = 50.00     Z = 0.00")
  })

  it("follows a length typed along the cursor and LINE's Undo, not its Close", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0)).type("10").enter()
    cad.enter()
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 0.00     Z = 0.00")
    answer(cad, "LINE", "0,0", "10,0", "10,10", "C")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
    answer(cad, "LINE", "20,0", "30,0", "30,10", "U", "")
    expect(lastPoint(cad)).toBe(" X = 30.00     Y = 0.00     Z = 0.00")
  })

  it("is not a window's corner, nor DIST's second point, nor a copy's", () => {
    const cad = createHarness({ entities: [lineOf(p(1, 1), p(2, 2))] })
    answer(cad, "ID", "7,8", "ZOOM", "W", "0,0", "50,50")
    expect(lastPoint(cad)).toBe(" X = 7.00     Y = 8.00     Z = 0.00")
    answer(cad, "ERASE", "W", "100,100", "200,200", "")
    expect(lastPoint(cad)).toBe(" X = 7.00     Y = 8.00     Z = 0.00")
    answer(cad, "ZOOM", "40,40", "60,60")
    expect(lastPoint(cad)).toBe(" X = 40.00     Y = 40.00     Z = 0.00")
    answer(cad, "DIST", "10,10", "20,20")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
    answer(cad, "COPY", "L", "", "3,3", "5,5", "6,6", "")
    expect(lastPoint(cad)).toBe(" X = 3.00     Y = 3.00     Z = 0.00")
    cad.escape()
    answer(cad, "MOVE", "L", "", "3,3", "4,5")
    expect(lastPoint(cad)).toBe(" X = 4.00     Y = 5.00     Z = 0.00")
  })

  it("is what Enter takes at DIST's first point, and its second", () => {
    const cad = createHarness()
    answer(cad, "ID", "7,8", "DIST", "", "10,12")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify first point:",
      "Specify second point or [Multiple points]: 10,12",
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\nDelta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00",
    ])
    answer(cad, "DIST", "1,1", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 0.00,  Angle in XY Plane = 0,  Angle from XY Plane = 0\nDelta X = 0.00,  Delta Y = 0.00,   Delta Z = 0.00"
    )
    answer(cad, "DIST", "1,1", "M", "2,2", "3,3", "")
    expect(lastPoint(cad)).toBe(" X = 3.00     Y = 3.00     Z = 0.00")
  })

  it("is kept for the command a transparent one interrupts", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "'ID", "5,6", "")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
    answer(cad, "LINE", "1,1", "'DIST", "", "4,5")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\nDelta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00",
      "Resuming LINE command.",
    ])
    answer(cad, "'ZOOM", "W", "100,100", "150,150", "@1,0", "")
    expect(cad.entities().at(-1)).toMatchObject({ end: { x: 2, y: 1 } })
  })

  it("is the new UCS's origin once the UCS changes", () => {
    const cad = createHarness()
    answer(cad, "ID", "10,0", "UCS", "5,5", "")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
    answer(cad, "ID", "3,3", "UCS", "W")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
  })

  // AutoCAD 2023's console (acc/u4, u5, u7): Previous and a restored named
  // UCS put it at the WCS's origin, read in the UCS they make current; U
  // taking back a UCS whose origin was typed puts it back there.
  it("is the WCS's origin after UCS Previous or Restore, and stays after U", () => {
    const previous = createHarness()
    answer(previous, "UCS", "0,50", "", "UCS", "100,0", "", "ID", "5,5")
    answer(previous, "UCS", "P")
    expect(lastPoint(previous)).toBe(" X = 0.00     Y = -50.00     Z = 0.00")

    const restored = createHarness()
    answer(restored, "UCS", "100,0", "", "UCS", "NA", "S", "ONE", "UCS", "W")
    answer(restored, "UCS", "0,50", "", "ID", "5,5", "UCS", "NA", "R", "ONE")
    expect(lastPoint(restored)).toBe(" X = -100.00     Y = 0.00     Z = 0.00")

    const undone = createHarness()
    answer(undone, "ID", "5,5", "UCS", "100,0", "", "U")
    expect(lastPoint(undone)).toBe(" X = 100.00     Y = 0.00     Z = 0.00")

    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "0,50", "", "SCP", "100,0", "", "ID", "5,5")
    answer(spanish, "SCP", "FOO")
    expect(spanish.commandLog().at(-1)).toBe(
      "Se requiere un punto o una opción."
    )
    spanish.escape()
    answer(spanish, "SCP", "PR")
    expect(lastPoint(spanish)).toBe(" X = 0.00     Y = -50.00     Z = 0.00")
  })

  // AutoCAD 2023's console (acc/a1–a24 of the elliptical arcs session): U
  // taking a UCS back puts it at the origin given at UCS's first prompt, and
  // at the WCS's origin after any other way; REDO where the UCS put it.
  it("goes where U and REDO of a UCS put it", () => {
    const at = (...texts: string[]) =>
      lastPoint(answer(createHarness(), ...texts))
    const origin = " X = 0.00     Y = 0.00     Z = 0.00"
    const wcsOrigin = " X = -100.00     Y = 0.00     Z = 0.00"

    expect(at("ID", "5,5", "UCS", "100,0,0", "200,50,0", "", "U")).toBe(
      " X = 100.00     Y = 0.00     Z = 0.00"
    )
    expect(at("UCS", "100,0", "", "ID", "5,5", "UCS", "50,0", "", "U")).toBe(
      " X = 50.00     Y = 0.00     Z = 0.00"
    )
    for (const way of [
      ["Z", "90"],
      ["X", "45"],
      ["ZA", "100,0,0", ""],
      ["W"],
    ]) {
      expect(at("ID", "5,5", "UCS", ...way, "U")).toBe(origin)
      expect(at("UCS", "100,0", "", "ID", "5,5", "UCS", ...way, "U")).toBe(
        wcsOrigin
      )
    }

    // World in the WCS changes nothing, and still puts it at the origin.
    expect(at("ID", "5,5", "UCS", "W")).toBe(origin)

    expect(at("ID", "5,5", "UCS", "100,0", "", "U", "REDO")).toBe(origin)
    expect(at("UCS", "100,0", "", "ID", "5,5", "UCS", "W", "U", "REDO")).toBe(
      origin
    )
    const previous = createHarness()
    answer(previous, "UCS", "100,0", "", "UCS", "50,0", "", "UCS", "P")
    answer(previous, "U", "REDO")
    expect(lastPoint(previous)).toBe(wcsOrigin)
    expect(previous.runtime.document.getSettings().ucs.origin).toEqual({
      x: 100,
      y: 0,
      z: 0,
    })

    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "100,0", "", "ID", "5,5", "SCP", "Z", "90", "H")
    expect(lastPoint(spanish)).toBe(wcsOrigin)
    answer(spanish, "SCP", "U", "H", "REHACER")
    expect(lastPoint(spanish)).toBe(origin)
  })

  it("goes back to 0,0,0 with a new drawing", () => {
    const cad = createHarness()
    answer(cad, "ID", "7,8")
    cad.runtime.newDrawing()
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")
  })

  it("takes Spanish words as English ones", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "ID", "7,8", "DIST", "", "10,12")
    expect(cad.commandLog().slice(-2, -1)).toEqual([
      "Especifique segundo punto o [puntos Múltiples]: 10,12",
    ])
    answer(cad, "LINEA", "@1,0", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise punto siguiente o [desHacer]: FOO",
      "Se requiere un punto o una opción.",
    ])
    cad.escape()
    expect(cad.entities()).toHaveLength(0)
    expect(lastPoint(cad)).toBe(" X = 8.00     Y = 8.00     Z = 0.00")
  })
})
