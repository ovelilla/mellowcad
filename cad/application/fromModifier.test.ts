import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { LineEntity } from "../domain/entities"
import { es } from "../locales/es"

/**
 * AutoCAD's FROM: at a point prompt, `Base point:` and then `<Offset>:`, whose
 * point answers the prompt. Each case is a console probe of AutoCAD 2027.
 */

const REFERENCE = lineOf(p(0, 0), p(100, 0), { id: "REF" })

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function drawn(cad: CadHarness): LineEntity[] {
  return cad
    .entities()
    .filter((e): e is LineEntity => e.type === "line" && e.id !== "REF")
}

describe("FROM's prompts", () => {
  it("asks Base point: and <Offset>:, each answered in the history", () => {
    // probe line/p34, p154.
    const cad = answer(createHarness(), "LINE", "_FRO", "20,20")
    expect(cad.state().commandLine.prompt).toBe("LINE <Offset>:")
    expect(cad.optionIds()).toEqual([])
    answer(cad, "@5,0")

    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify first point: _FRO",
      "Base point: 20,20",
      "<Offset>: @5,0",
    ])
  })

  it("asks Base point: with no keywords", () => {
    const cad = answer(createHarness(), "LINE", "0,0", "FROM")

    expect(cad.state().commandLine.prompt).toBe("LINE Base point:")
    expect(cad.optionIds()).toEqual([])
  })

  it("is worded in Spanish", () => {
    // probe line/p154 es.
    const cad = answer(
      createHarness({ locale: es }),
      "LINEA",
      "_FRO",
      "20,20",
      "@5,0"
    )

    expect(cad.commandLog().slice(-2)).toEqual([
      "Punto base: 20,20",
      "<Desfase>: @5,0",
    ])
  })

  it("refuses what is no point at either, a keyword of the prompt too", () => {
    // probe line/p211: FOO and U, `Invalid point.` each time.
    const cad = answer(
      createHarness(),
      "LINE",
      "0,0",
      "@100,0",
      "",
      "LINE",
      "_FRO",
      "FOO",
      "U",
      "20,20",
      "FOO",
      "U"
    )

    expect(cad.commandLog().slice(-9)).toEqual([
      "Base point: FOO",
      "Invalid point.",
      "Base point: U",
      "Invalid point.",
      "Base point: 20,20",
      "<Offset>: FOO",
      "Invalid point.",
      "<Offset>: U",
      "Invalid point.",
    ])
    expect(drawn(cad)).toHaveLength(1)
  })
})

describe("FROM's base point", () => {
  it("is typed at the command line", () => {
    // probe line/p154: `Base point: 20,20`, `<Offset>: @5,0` is 25,20.
    const cad = answer(createHarness(), "LINE", "FROM", "20,20", "@5,0")
    answer(cad, "@0,5", "")

    expect(drawn(cad)[0].start).toBeCloseToPoint(p(25, 20))
  })

  it("is found by an object snap override", () => {
    // probe line/p154: `Base point: _END of 99,1`, `<Offset>: @0,10`.
    const cad = answer(
      createHarness({ entities: [REFERENCE] }),
      "LINE",
      "_FRO",
      "_END",
      "99,1",
      "@0,10",
      "@5,0",
      ""
    )

    expect(drawn(cad)[0].start).toBeCloseToPoint(p(100, 10))
    expect(cad.commandLog()).toContain("Base point: _END of 99,1")
  })

  it("gives Enter to the prompt", () => {
    // probe line/p211: Enter at `Base point:` is LINE's Continue.
    const cad = answer(
      createHarness(),
      "LINE",
      "0,0",
      "@100,0",
      "",
      "LINE",
      "_FRO",
      ""
    )

    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
    answer(cad, "@0,5", "")
    expect(drawn(cad)[1].start).toBeCloseToPoint(p(100, 0))
  })
})

describe("FROM's offset", () => {
  it("reads a bare x,y at the command line as absolute", () => {
    // probe line/p154: `<Offset>: 5,0` (LINE-D10).
    const cad = answer(createHarness(), "LINE", "FROM", "20,20", "5,0")
    answer(cad, "@0,5", "")

    expect(drawn(cad)[0].start).toBeCloseToPoint(p(5, 0))
  })

  it("reads a bare x,y in the tooltip from the base", () => {
    // LINE-D10: the tooltip's relative default.
    const cad = answer(createHarness(), "LINE", "FROM", "20,20")
    cad.type("5,0").enter()
    answer(cad, "@0,5", "")

    expect(drawn(cad)[0].start).toBeCloseToPoint(p(25, 20))
  })

  it("runs a bare number from the base towards the cursor", () => {
    // probe line/p154: `<Offset>: 5` lands 5 from the base point.
    const cad = answer(createHarness(), "LINE", "0,0", "FROM", "20,20")
    cad.moveTo(p(20, 100))
    answer(cad, "5", "")

    expect(drawn(cad)[0].end).toBeCloseToPoint(p(20, 25))
  })

  it("takes an object snap override", () => {
    // probe line/p211: `<Offset>: _END of 99,1`.
    const cad = answer(
      createHarness({ entities: [REFERENCE] }),
      "LINE",
      "_FRO",
      "20,20",
      "_END",
      "99,1",
      "@0,5",
      ""
    )

    expect(drawn(cad)[0].start).toBeCloseToPoint(p(100, 0))
    expect(cad.commandLog()).toContain("<Offset>: _END of 99,1")
  })

  it("is from the base at LINE's next point", () => {
    // probe line/p154: `0,-10`, then `_FRO`, `50,50`, `@10,0`.
    const cad = answer(
      createHarness(),
      "LINE",
      "0,-10",
      "_FRO",
      "50,50",
      "@10,0",
      ""
    )

    expect(drawn(cad)[0].end).toBeCloseToPoint(p(60, 50))
  })

  it("gives Enter to the prompt: LINE's Continue at the first point", () => {
    // probe line/p34.
    const cad = answer(createHarness(), "LINE", "0,0", "@10,10", "@5,0", "")
    answer(cad, "LINE", "_FRO", "20,20", "", "@5,0", "")

    const continued = drawn(cad)[2]
    expect(continued.start).toBeCloseToPoint(p(15, 10))
    expect(continued.end).toBeCloseToPoint(p(20, 10))
  })

  it("gives Enter to the prompt: the end of LINE, LASTPOINT the base", () => {
    // probe line/p164.
    const cad = answer(createHarness(), "LINE", "0,0", "_FRO", "50,50", "")

    expect(cad.activeToolId()).toBe("select")
    expect(drawn(cad)).toEqual([])
    answer(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 50.00     Y = 50.00     Z = 0.00"
    )
  })
})

describe("FROM at Command:", () => {
  it("is an unknown command, by its name and its global word", () => {
    // probe line/p211.
    const cad = answer(createHarness(), "FROM", "_FRO")

    expect(cad.commandLog()).toEqual([
      'Unknown command "FROM".  Press F1 for help.',
      'Unknown command "FRO".  Press F1 for help.',
    ])
  })
})
