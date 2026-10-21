import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import type { CircleEntity, Entity, LineEntity } from "../domain/entities"
import { es } from "../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function lines(cad: CadHarness): LineEntity[] {
  return cad.entities().filter((e): e is LineEntity => e.type === "line")
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
    // probes arc/p141 (3P), p142 (SCE), p143 (CSE): an arc's end point.
    answer(cad, "ARC", "0,0", "5,5", "10,0")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 0.00     Z = 0.00")
    answer(cad, "ARC", "10,0", "C", "0,0", "0,20")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 20.00     Z = 0.00")
    answer(cad, "ARC", "C", "0,0", "10,0", "0,20")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 20.00     Z = 0.00")
    answer(cad, "RECTANG", "30,30", "40,45")
    expect(lastPoint(cad)).toBe(" X = 40.00     Y = 45.00     Z = 0.00")
    answer(cad, "MIRROR", "L", "", "20,0", "20,10", "N")
    expect(lastPoint(cad)).toBe(" X = 20.00     Y = 10.00     Z = 0.00")
  })

  it("is a circle's center, not the point its radius is given by", () => {
    // probes circle/p143, p144 (the radius), p138 (2P), p145 (3P's third).
    const cad = createHarness()
    answer(cad, "CIRCLE", "10,10", "5")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
    answer(cad, "CIRCLE", "20,20")
    cad.click(p(25, 20))
    expect(lastPoint(cad)).toBe(" X = 20.00     Y = 20.00     Z = 0.00")
    answer(cad, "CIRCLE", "2P", "50,50", "60,50")
    expect(lastPoint(cad)).toBe(" X = 60.00     Y = 50.00     Z = 0.00")
    answer(cad, "CIRCLE", "3P", "0,0", "10,0", "0,10")
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 10.00     Z = 0.00")
  })

  it("is the point CIRCLE's 2P and 3P box reads from the point before", () => {
    // probe circle/p164: LASTPOINT is the point given, however it was typed.
    const two = answer(createHarness(), "CIRCLE", "2P", "10,0")
    two.type("5,5").enter()
    expect(two.only<CircleEntity>("circle").center).toBeCloseToPoint(
      p(12.5, 2.5)
    )
    expect(lastPoint(two)).toBe(" X = 15.00     Y = 5.00     Z = 0.00")

    const three = answer(createHarness(), "CIRCLE", "3P", "0,0")
    three.type("@10,0").enter()
    answer(three, "'ID", "@")
    expect(three.commandLog().at(-2)).toBe(
      " X = 10.00     Y = 0.00     Z = 0.00"
    )
    three.type("-10,10").enter()
    expect(three.only<CircleEntity>("circle").center).toBeCloseToPoint(p(5, 5))
    expect(lastPoint(three)).toBe(" X = 0.00     Y = 10.00     Z = 0.00")
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

  // AutoCAD 2023's console (acc/bk59–bk63, ul1–ul36), from a UCS at 30,0
  // with LASTPOINT at 35,5: UCS puts it at the WCS's origin as it starts,
  // and only a point given moves it; -VIEW and PLAN leave it.
  it("is the WCS's origin as UCS starts, until a point is given", () => {
    const at = (...texts: string[]) => {
      const cad = createHarness({ entities: [lineOf(p(20, 10), p(80, 40))] })
      cad.runtime.setDocumentPrecision(4)
      answer(cad, "UCS", "O", "30,0", "ID", "5,5", ...texts)
      return lastPoint(cad)
    }
    const reads = (x: string, y: string, z = "0.0000") =>
      ` X = ${x}     Y = ${y}     Z = ${z}`
    const origin = reads("0.0000", "0.0000")
    const wcsOrigin = reads("-30.0000", "0.0000")

    expect(at("UCS", "Z", "30")).toBe(reads("-25.9808", "15.0000"))
    expect(at("UCS", "X", "90")).toBe(wcsOrigin)
    expect(at("UCS", "V")).toBe(wcsOrigin)
    expect(at("UCS", "OB", "L")).toBe(reads("-22.3607", "0.0000"))
    // A point at Z's angle turns the UCS and is no point given (ul32).
    expect(at("UCS", "Z", "40,10")).toBe(reads("-29.1043", "7.2761"))
    // ZAxis' Z point is given, its origin too, Enter there the current one.
    expect(at("UCS", "ZA", "50,0", "50,0,10")).toBe(
      reads("0.0000", "0.0000", "10.0000")
    )
    expect(at("UCS", "ZA", "50,0", "")).toBe(origin)
    expect(at("UCS", "ZA", "", "")).toBe(origin)
    // A point on X is not (ul9, ul27, ul28).
    expect(at("UCS", "50,0", "60,10", "")).toBe(origin)
    expect(at("UCS", "3", "", "60,10", "")).toBe(origin)
    expect(at("UCS", "3", "50,0", "60,10", "")).toBe(origin)
    expect(at("-VIEW", "O", "T")).toBe(reads("35.0000", "5.0000"))
    expect(at("-VIEW", "O", "B")).toBe(reads("-35.0000", "5.0000"))
    expect(at("PLAN", "")).toBe(reads("5.0000", "5.0000"))

    // U: the WCS's origin, but where a UCS made at the first prompt left
    // it; REDO: where the UCS left it. -VIEW's U leaves it.
    expect(at("UCS", "Z", "30", "U")).toBe(wcsOrigin)
    expect(at("UCS", "Z", "30", "U", "REDO")).toBe(reads("-25.9808", "15.0000"))
    expect(at("UCS", "ZA", "50,0", "50,0,10", "U")).toBe(wcsOrigin)
    expect(at("UCS", "ZA", "50,0", "50,0,10", "U", "REDO")).toBe(
      reads("0.0000", "0.0000", "10.0000")
    )
    expect(at("UCS", "50,0", "", "U")).toBe(reads("50.0000", "0.0000"))
    expect(at("UCS", "50,0", "", "U", "REDO")).toBe(origin)
    expect(at("UCS", "N", "50,0", "U")).toBe(wcsOrigin)
    expect(at("-VIEW", "O", "T", "U")).toBe(reads("5.0000", "5.0000"))
  })

  // AutoCAD 2023's console (acc/q6, ul31, ul35): New's Enter is World.
  it("is the WCS's origin after New's Enter, which is World", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "30,0", "UCS", "Z", "30", "ID", "5,5")
    answer(cad, "UCS", "N", "")
    expect(cad.runtime.document.getSettings().ucs).toMatchObject({
      origin: { x: 0, y: 0, z: 0 },
      xAxis: { x: 1, y: 0, z: 0 },
    })
    expect(lastPoint(cad)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")

    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "OR", "30,0", "ID", "5,5", "SCP", "X", "90")
    expect(lastPoint(spanish)).toBe(" X = -30.00     Y = 0.00     Z = 0.00")
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

// AutoCAD 2023's console (acc/dd1–dd23), LINE's first point again in 2027's
// (probe line/p159): a number typed for a point is a direct distance from
// LASTPOINT, or the prompt's base, towards the cursor. The console's cursor
// stands where `100` from 10,0 gives 102.3493,38.3614; p159 to p161 put it at
// 289.98397,116.30379.
describe("A number typed for a point", () => {
  const CURSOR = p(102.3493, 38.3614)
  const CONSOLE = p(289.98397, 116.30379)
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
    // probe line/p159
    const cad = answer(createHarness(), "LINE", "10,0", "")
    cad.moveTo(CONSOLE)
    answer(cad, "LINE", "5", "@0,10", "")
    expect(lastPoint(cad)).toBe(" X = 14.62     Y = 11.92     Z = 0.00")
    answer(cad, "LINE", "-5", "@0,10", "", "LINE", "0", "@0,10", "")
    const starts = lines(cad).map((line) => line.start)
    expect(starts[0]).toBeCloseToPoint(p(14.617467, 1.91807), 5)
    expect(starts[1]).toBeCloseToPoint(p(9.942122, 10.145744), 5)
    expect(starts[2]).toBeCloseToPoint(p(9.942122, 20.145744), 5)
  })

  it("is not bent by Ortho at LINE's first point, nor is a typed point", () => {
    // probe line/p160
    const cad = answer(createHarness(), "LINE", "0,0", "")
    cad.press("F8")
    cad.moveTo(CONSOLE)
    answer(cad, "LINE", "5", "@0,10", "", "LINE", "0,0", "@10,10", "")
    const [first, typed] = lines(cad)
    expect(first.start).toBeCloseToPoint(p(4.64067, 1.861232), 5)
    expect(typed.end).toBeCloseToPoint(p(10, 10))
  })

  it("reads 1/2 and 1e1, and refuses 0x10", () => {
    // probe line/p165: its cursor lies towards -93.0322,-36.6744 from 0,0
    const cad = createHarness()
    cad.moveTo(p(-93.0322, -36.6744))
    answer(cad, "LINE", "0,0", "1/2", "", "LINE", "0,0", "1e1", "")
    answer(cad, "LINE", "0,0", "0x10")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: 0x10",
      "Point or option keyword required.",
    ])
    const [half, ten] = lines(cad)
    expect(half.end).toBeCloseToPoint(p(-0.465161, -0.183372), 5)
    expect(ten.end).toBeCloseToPoint(p(-9.30322, -3.66744), 5)
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

// AutoCAD 2023's console (acc/wn1–wn57): a number is a direct distance at a
// window's corner too, and where objects are picked. Its cursor stands
// where `5` gives 14.6175,1.91807 from 10,0 and 104.9817,100.4275 from 100,100.
describe("A number typed at a window's corner or where objects are picked", () => {
  const CURSOR = p(289.985, 116.3034)

  function fromTen(locale?: typeof es, entities: Entity[] = []): CadHarness {
    const cad = answer(createHarness({ locale, entities }), "ID", "10,0")
    cad.moveTo(CURSOR)
    return cad
  }

  it("is ZOOM's corner: the first from LASTPOINT, the opposite from the first", () => {
    for (const [locale, window, first, opposite, invalid] of [
      [
        undefined,
        "W",
        "Specify first corner:",
        "Specify opposite corner:",
        "Invalid window specification.",
      ],
      [
        es,
        "V",
        "Designe primera esquina:",
        "Designe esquina opuesta:",
        "Designación de ventana no válida.",
      ],
    ] as const) {
      const ahead = answer(fromTen(locale), "ZOOM", window, "FOO", "5", "20,20")
      expect(ahead.commandLog().slice(-4)).toEqual([
        `${first} FOO`,
        invalid,
        `${first} 5`,
        `${opposite} 20,20`,
      ])
      expect(ahead.runtime.viewport.worldCenter()).toBeCloseToPoint(
        p(17.3087, 10.959),
        3
      )
      // The corners leave LASTPOINT where it was.
      expect(lastPoint(ahead)).toMatch(/10[.,]00 .* 0[.,]00 /)

      const back = answer(fromTen(locale), "ZOOM", window, "100,100", "FOO")
      answer(back, "100,100", "-5")
      expect(back.commandLog().slice(-5)).toEqual([
        `${first} 100,100`,
        `${opposite} FOO`,
        invalid,
        `${first} 100,100`,
        `${opposite} -5`,
      ])
      expect(back.runtime.viewport.worldCenter()).toBeCloseToPoint(
        p(97.5092, 99.7862),
        3
      )

      const implied = answer(fromTen(locale), "ZOOM", "100,100", "FOO", "5")
      expect(implied.commandLog().slice(-3)).toEqual([
        `${opposite} FOO`,
        invalid,
        `${opposite} 5`,
      ])
      expect(implied.runtime.viewport.worldCenter()).toBeCloseToPoint(
        p(102.491, 100.214),
        3
      )
      expect(lastPoint(implied)).toMatch(/100[.,]00 .* 100[.,]00 /)

      // `@` at the opposite corner is from the first too (wn42).
      const relative = answer(fromTen(locale), "ZOOM", window, "100,100")
      answer(relative, "@5,5")
      expect(relative.runtime.viewport.worldCenter()).toBeCloseToPoint(
        p(102.5, 102.5),
        6
      )
    }
  })

  // 50 along the console's heading: 56.17,19.18 from 10,0, 149.82,104.28
  // from 100,100 — where a window can hold a circle away from the picks.
  it("is a point at Select objects, which becomes LASTPOINT, and a window's corner there", () => {
    const drawing = () => [
      circleOf(p(80, 30), 2, { id: "A" }),
      circleOf(p(140, 102), 1, { id: "B" }),
      lineOf(p(0, -20), p(200, -20), { id: "L" }),
    ]
    const left = (cad: CadHarness) => cad.entities().map((entity) => entity.id)
    for (const [locale, erase, window, select, invalid] of [
      [undefined, "ERASE", "W", "Select objects:", "*Invalid selection*"],
      [es, "BORRA", "V", "Designe objetos:", "*Designación no válida*"],
    ] as const) {
      const ahead = answer(fromTen(locale, drawing()), erase, "FOO", "50")
      answer(ahead, "100,40", "")
      expect(ahead.commandLog()).toContain(`${select} FOO`)
      expect(ahead.commandLog()).toContain(invalid)
      expect(ahead.commandLog()).toContain(`${select} 50`)
      expect(left(ahead)).toEqual(["B", "L"])
      expect(lastPoint(ahead)).toMatch(/56[.,]17 .* 19[.,]18 /)

      const back = answer(fromTen(locale, drawing()), erase, "-50", "100,40")
      answer(back, "")
      expect(left(back)).toEqual(["B", "L"])
      expect(lastPoint(back)).toMatch(/-36[.,]17 .* -19[.,]18 /)

      const corner = answer(
        fromTen(locale, drawing()),
        erase,
        window,
        "100,100"
      )
      answer(corner, "50", "")
      expect(left(corner)).toEqual(["A", "L"])
      // Window's corners leave LASTPOINT.
      expect(lastPoint(corner)).toMatch(/10[.,]00 .* 0[.,]00 /)

      const first = answer(fromTen(locale, drawing()), erase, window, "-50")
      answer(first, "100,40", "")
      expect(left(first)).toEqual(["B", "L"])

      const implied = answer(fromTen(locale, drawing()), erase, "100,100")
      answer(implied, "50", "")
      expect(left(implied)).toEqual(["A", "L"])
      expect(lastPoint(implied)).toMatch(/100[.,]00 .* 100[.,]00 /)

      const picked = answer(fromTen(locale, drawing()), erase, "100,-20", "")
      expect(left(picked)).toEqual(["A", "B"])
      expect(lastPoint(picked)).toMatch(/100[.,]00 .* -20[.,]00 /)

      const relative = answer(fromTen(locale, drawing()), erase, "@5,0")
      answer(relative, "20,20", "")
      expect(lastPoint(relative)).toMatch(/15[.,]00 .* 0[.,]00 /)
    }
  })

  it("is a pick where TRIM and FILLET pick objects", () => {
    for (const [locale, trim, fillet] of [
      [undefined, "TRIM", "FILLET"],
      [es, "RECORTA", "EMPALME"],
    ] as const) {
      const cad = fromTen(locale, [
        lineOf(p(0, 1.9181), p(30, 1.9181), { id: "H" }),
        lineOf(p(5, -10), p(5, 10)),
        lineOf(p(25, -10), p(25, 10)),
      ])
      answer(cad, trim, "5", "")
      const ends = cad
        .entities()
        .filter((entity): entity is LineEntity => entity.type === "line")
        .filter((line) => line.start.y === line.end.y)
        .map((line) => [line.start.x, line.end.x])
      expect(ends).toEqual([
        [0, 5],
        [25, 30],
      ])
      expect(lastPoint(cad)).toMatch(/14[.,]62 .* 1[.,]92 /)

      const nothing = answer(fromTen(locale), fillet, "5")
      const prompt = nothing.state().commandLine.prompt
      expect(nothing.commandLog().at(-1)).toBe(
        `${prompt.slice(prompt.indexOf(" ") + 1)} 5`
      )
      nothing.escape()
      expect(lastPoint(nothing)).toMatch(/14[.,]62 .* 1[.,]92 /)
    }
  })

  // acc/fn1–fn7: the first point from LASTPOINT, the next from the point
  // before, `@` too; LASTPOINT as it was once the set is closed. A line
  // crossed only where each point stands tells where it is.
  it("is a fence's or a polygon's point: the first from LASTPOINT, the next from the point before", () => {
    for (const [locale, erase, fence, polygon] of [
      [undefined, "ERASE", "F", "WP"],
      [es, "BORRA", "B", "OV"],
    ] as const) {
      const drawing = () => [
        lineOf(p(20, 0), p(20, 20), { id: "first" }),
        lineOf(p(102, 99), p(102, 102), { id: "next" }),
        circleOf(p(102, 99.6), 0.2, { id: "inside" }),
      ]
      const left = (cad: CadHarness) =>
        cad.entities().map((entity) => entity.id)
      const fenced = answer(fromTen(locale, drawing()), erase, fence, "5")
      answer(fenced, "100,100", "5", "", "")
      expect(left(fenced)).toEqual(["inside"])
      expect(lastPoint(fenced)).toMatch(/10[.,]00 .* 0[.,]00 /)

      const relative = answer(fromTen(locale, drawing()), erase, fence)
      answer(relative, "98,100", "@6,0", "", "")
      expect(left(relative)).toEqual(["first", "inside"])

      const enclosed = answer(fromTen(locale, drawing()), erase, polygon, "5")
      answer(enclosed, "100,100", "5", "200,0", "", "")
      expect(left(enclosed)).toEqual(["first", "next"])
      expect(lastPoint(enclosed)).toMatch(/10[.,]00 .* 0[.,]00 /)
    }
  })

  // acc/fn1: a fence's point on the one before is refused as a polygon's is.
  it("refuses a fence's point on the point before", () => {
    const cad = answer(fromTen(), "ERASE", "F", "100,100", "100,100")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next fence point or [Undo]: 100,100",
      "Invalid point, polygon segment is zero length.",
    ])
    cad.escape()
  })

  // acc/wn53, bk36–bk38: BREAK's `Select object:` picks the line there.
  it("is a pick at BREAK's Select object, its first break point", () => {
    for (const [locale, command, distance, at] of [
      [undefined, "BREAK", "5", p(14.6175, 1.9181)],
      [es, "PARTE", "-5", p(5.3825, -1.9181)],
      [undefined, "BREAK", "0", p(10, 0)],
    ] as const) {
      const ray = lineOf(p(-269.985, -116.3034), CURSOR, { id: "R" })
      const cad = answer(fromTen(locale, [ray]), command, distance, "@")
      const [kept, other] = cad.entities() as LineEntity[]
      expect(kept.id).toBe("R")
      expect(kept.end).toBeCloseToPoint(at, 3)
      expect(other.start).toBeCloseToPoint(at, 3)
    }

    const nothing = answer(fromTen(), "BREAK", "5")
    expect(nothing.commandLog().slice(-2)).toEqual([
      "Select object: 5",
      "No object found",
    ])
    nothing.escape()
    expect(lastPoint(nothing)).toMatch(/14[.,]62 .* 1[.,]92 /)
  })
})
