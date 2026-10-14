import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { CircleEntity, LineEntity } from "../domain/entities"
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

  // AutoCAD 2023's console (acc/u1–u30, p1–p33, q1–q24 of the hidden UCS
  // words session), each read with ID @ at LUPREC 4.
  it("goes where UCS's unlisted words put it", () => {
    const at = (...texts: string[]) => {
      const cad = createHarness()
      cad.runtime.setDocumentPrecision(4)
      return lastPoint(answer(cad, ...texts))
    }
    const origin = " X = 0.0000     Y = 0.0000     Z = 0.0000"
    const wcsOrigin = " X = -100.0000     Y = 0.0000     Z = 0.0000"
    const at100 = ["UCS", "O", "100,0", "ID", "5,5"]

    expect(at("ID", "5,5", "UCS", "O", "100,50")).toBe(origin)
    expect(at(...at100, "UCS", "M", "100,50")).toBe(origin)
    expect(at(...at100, "UCS", "G", "F")).toBe(origin)
    expect(at(...at100, "UCS", "N", "")).toBe(origin)
    expect(at(...at100, "UCS", "3", "", "", "")).toBe(origin)
    expect(at("ID", "5,5", "UCS", "3", "100,0", "200,50", "")).toBe(origin)
    // Nothing changed, or Zdepth: the WCS's origin.
    for (const way of [
      ["O", ""],
      ["M", ""],
      ["M", "Z", ""],
      ["S", "AA"],
      ["R", ""],
      ["NA", "R", ""],
      ["D", ""],
    ]) {
      expect(at(...at100, "UCS", ...way)).toBe(wcsOrigin)
    }
    expect(at(...at100, "UCS", "M", "Z", "10")).toBe(
      " X = -100.0000     Y = 0.0000     Z = -10.0000"
    )
    // The third point: 3point's where it was given, the first prompt's at
    // the numbers it was typed in, read in the new UCS.
    const third = " X = 44.7214     Y = 89.4427     Z = 0.0000"
    expect(at("UCS", "3", "100,0", "200,50", "100,100")).toBe(third)
    expect(at("UCS", "N", "3", "100,0", "200,50", "100,100")).toBe(third)
    expect(at("UCS", "100,0", "200,50", "100,100")).toBe(
      " X = 100.0000     Y = 100.0000     Z = 0.0000"
    )

    // U: the WCS's origin; REDO: where the UCS put it.
    expect(at("UCS", "3", "100,0", "200,50", "100,100", "U")).toBe(origin)
    expect(at("UCS", "3", "100,0", "200,50", "100,100", "U", "REDO")).toBe(
      third
    )
    expect(at("UCS", "M", "100,50", "U", "REDO")).toBe(origin)
    expect(at(...at100, "UCS", "M", "Z", "10", "U")).toBe(wcsOrigin)
    expect(at(...at100, "UCS", "M", "Z", "10", "U", "REDO")).toBe(
      " X = -100.0000     Y = 0.0000     Z = -10.0000"
    )
    expect(at("UCS", "O", "100,50", "ID", "5,5", "UCS", "G", "F", "U")).toBe(
      " X = -100.0000     Y = -50.0000     Z = 0.0000"
    )
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

// AutoCAD 2023's console (acc/dd1–dd23): a number typed for a point is a
// direct distance from LASTPOINT, or the prompt's base, towards the cursor.
// The console's cursor stands where `100` from 10,0 gives 102.3493,38.3614.
describe("A number typed for a point", () => {
  const CURSOR = p(102.3493, 38.3614)
  const AHEAD = p(14.6175, 1.9181)
  const BACK = p(5.3825, -1.9181)

  /** LASTPOINT at 10,0 and the cursor where the console's stands. */
  function fromTen(locale?: typeof es): CadHarness {
    const cad = answer(createHarness({ locale }), "ID", "10,0")
    cad.moveTo(CURSOR)
    return cad
  }

  it("is that far from LASTPOINT towards the cursor at a first point, the other way when negative", () => {
    for (const [
      locale,
      asked,
      line,
      circle,
      pan,
      invalid,
      required,
      twoPoints,
    ] of [
      [
        undefined,
        "Specify point:",
        "LINE",
        "CIRCLE",
        "-PAN",
        "Invalid point.",
        "Point or option keyword required.",
        "Requires two points, or a displacement followed by ENTER.",
      ],
      [
        es,
        "Precise punto:",
        "LINEA",
        "CIRCULO",
        "-ENCUADRE",
        "Punto no válido.",
        "Se requiere un punto o una opción.",
        "Requiere dos puntos o un desplazamiento seguido por INTRO.",
      ],
    ] as const) {
      const id = answer(fromTen(locale), "ID", "5")
      expect(id.commandLog().at(-1)).toMatch(/14[.,]62 .* 1[.,]92 /)
      answer(id, "ID", "FOO", "-5")
      expect(id.commandLog().slice(-4, -1)).toEqual([
        `${asked} FOO`,
        invalid,
        `${asked} -5`,
      ])
      // Back from where the 5 left LASTPOINT.
      expect(id.commandLog().at(-1)).toMatch(/10[.,]00 .* 0[.,]00 /)

      const drawn = answer(fromTen(locale), line, "FOO", "5", "20,20", "")
      expect(drawn.commandLog()).toContain(invalid)
      expect(drawn.entities()[0]).toMatchObject({ end: { x: 20, y: 20 } })
      expect((drawn.entities()[0] as LineEntity).start).toBeCloseToPoint(
        AHEAD,
        4
      )

      const round = answer(fromTen(locale), circle, "FOO", "-5", "1")
      expect(round.commandLog()).toContain(required)
      expect((round.entities()[0] as CircleEntity).center).toBeCloseToPoint(
        BACK,
        4
      )

      const panned = fromTen(locale)
      const before = panned.runtime.viewport.worldCenter()
      answer(panned, pan, "FOO", "5", "")
      expect(panned.commandLog()).toContain(twoPoints)
      expect(panned.runtime.viewport.worldCenter()).toBeCloseToPoint(
        p(before.x - AHEAD.x, before.y - AHEAD.y),
        4
      )
      // -PAN's points never become LASTPOINT.
      expect(lastPoint(panned)).toMatch(/10[.,]00 .* 0[.,]00 /)
    }
  })

  it("becomes LASTPOINT, which 0 gives itself", () => {
    const cad = answer(fromTen(), "LINE", "5", "@10,0", "")
    expect(cad.entities()[0]).toMatchObject({
      start: { x: expect.closeTo(14.6175, 4) },
      end: { x: expect.closeTo(24.6175, 4), y: expect.closeTo(1.9181, 4) },
    })
    expect(lastPoint(cad)).toBe(" X = 24.62     Y = 1.92     Z = 0.00")
    answer(cad, "ID", "10,0", "LINE", "0", "20,20", "")
    expect(cad.entities()[1]).toMatchObject({ start: { x: 10, y: 0 } })
  })

  it("is measured from the prompt's own base point", () => {
    const cad = answer(createHarness(), "ID", "10,0")
    cad.moveTo(p(46.407, 18.612))
    answer(cad, "CIRCLE", "2P", "0,0", "5")
    const circle = cad.entities()[0] as CircleEntity
    expect(circle.center).toBeCloseToPoint(p(2.3203, 0.9306), 4)
    expect(circle.radius).toBeCloseTo(2.5)
  })

  it("keeps the cursor's heading off the drawing, and runs along X from a cursor on LASTPOINT", () => {
    const off = fromTen()
    off.runtime.pointerLeave()
    expect(answer(off, "ID", "5").commandLog().at(-1)).toBe(
      " X = 14.62     Y = 1.92     Z = 0.00"
    )
    const on = answer(createHarness(), "ID", "10,0")
    on.moveTo(p(10, 0))
    expect(answer(on, "ID", "5").commandLog().at(-1)).toBe(
      " X = 15.00     Y = 0.00     Z = 0.00"
    )
  })

  it("is ZOOM's factor at its first prompt, no point", () => {
    const cad = createHarness()
    answer(cad, "ZOOM", "2")
    expect(cad.runtime.viewport.scale).toBeCloseTo(2)
    expect(cad.activeToolId()).toBe("select")
  })
})
