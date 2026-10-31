import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import {
  type CircleEntity,
  type LineEntity,
  type PolylineEntity,
  lineEndZ,
  lineStartZ,
} from "../domain/entities"
import { es } from "../locales/es"
import { filterAxesNamed } from "./pointFilter"

/**
 * AutoCAD's point filters, `.X` to `.YZ`: at a point prompt, `of` and then
 * `(need …)`, until the point is whole. Each case is a probe of AutoCAD 2027,
 * scripts/research/probes/filters (f…, the console; d…, the desktop).
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

/** A line's ends with their Z, rounded as the console prints them. */
function ends(line: LineEntity): number[][] {
  // `+ 0`: -0 is not 0 to toEqual.
  const round = (value: number) => Math.round(value * 1e5) / 1e5 + 0
  return [
    [line.start.x, line.start.y, lineStartZ(line)].map(round),
    [line.end.x, line.end.y, lineEndZ(line)].map(round),
  ]
}

describe("a point filter's name", () => {
  it("is a dot and X, Y and Z, each once, in any order and case", () => {
    // probes filters/f13–f17, f44.
    expect(filterAxesNamed(".X")).toEqual(["x"])
    expect(filterAxesNamed(".xy")).toEqual(["x", "y"])
    expect(filterAxesNamed(".ZX")).toEqual(["z", "x"])
    expect(filterAxesNamed(".XYZ")).toEqual(["x", "y", "z"])
    expect(filterAxesNamed(".XX")).toBeNull()
    expect(filterAxesNamed(".Q")).toBeNull()
    expect(filterAxesNamed(".")).toBeNull()
  })
})

describe("point filters", () => {
  it("take X from one point and Y and Z from the next", () => {
    // probe filters/f01.
    const cad = answer(createHarness(), "LINE", ".X")
    expect(cad.state().commandLine.prompt).toBe("LINE of")
    answer(cad, "10,20")
    expect(cad.state().commandLine.prompt).toBe("LINE (need YZ):")
    answer(cad, "30,40", "@5,0", "")

    expect(ends(drawn(cad)[0])).toEqual([
      [10, 40, 0],
      [15, 40, 0],
    ])
    expect(cad.commandLog().slice(-4, -2)).toEqual([
      "Specify first point: .X of 10,20",
      "(need YZ): 30,40",
    ])
  })

  it("take a number at (need Z) as the Z, or a point's", () => {
    // probes filters/f02, f03.
    const number = answer(createHarness(), "LINE", ".XY", "10,20", "5")
    answer(number, "@5,0", "")
    const point = answer(createHarness(), "LINE", ".XY", "10,20", "1,2,7")
    answer(point, "@5,0", "")

    expect(ends(drawn(number)[0])[0]).toEqual([10, 20, 5])
    expect(ends(drawn(point)[0])[0]).toEqual([10, 20, 7])
  })

  it("take Z first, then X and Y", () => {
    // probe filters/f04.
    const cad = answer(createHarness(), "LINE", ".Z", "1,2,7", "3,4")
    answer(cad, "@5,0", "")

    expect(ends(drawn(cad)[0])).toEqual([
      [3, 4, 7],
      [8, 4, 7],
    ])
  })

  it("ask what each filter leaves, at any point prompt", () => {
    // probe filters/f05.
    const cad = answer(createHarness(), "LINE", ".Y", "1,2,3")
    expect(cad.state().commandLine.prompt).toBe("LINE (need XZ):")
    answer(cad, "4,5,6", ".XZ", "1,2,3")
    expect(cad.state().commandLine.prompt).toBe("LINE (need Y):")
    answer(cad, "4,5,6", "", "LINE", ".YZ", "1,2,3", "4,5,6", "@1,0", "")

    expect(ends(drawn(cad)[0])).toEqual([
      [4, 2, 6],
      [1, 5, 3],
    ])
    expect(ends(drawn(cad)[1])[0]).toEqual([4, 2, 3])
  })

  it("take another filter at (need …), which replaces the last", () => {
    // probes filters/f06, f57.
    const cad = answer(
      createHarness(),
      "LINE",
      ".X",
      "10,20,30",
      ".Y",
      "1,2,3",
      "4,5,6",
      "@1,0",
      ""
    )
    const again = answer(createHarness(), "LINE", ".X", "1,2", ".X", "5,6")
    answer(again, "7,8", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([10, 2, 6])
    expect(cad.commandLog().slice(-5, -2)).toEqual([
      "Specify first point: .X of 10,20,30",
      "(need YZ): .Y of 1,2,3",
      "(need Z): 4,5,6",
    ])
    expect(ends(drawn(again)[0])[0]).toEqual([5, 8, 0])
  })

  it("take `@` from LASTPOINT, which their points leave", () => {
    // probes filters/f07, f26.
    const first = answer(createHarness(), "LINE", "100,100,0", "@1,0", "")
    answer(first, "LINE", ".X", "@5,0", "7,8", "@1,0", "")
    const next = answer(createHarness(), "LINE", "100,100", ".X", "10,0")
    answer(next, "@0,5", "")

    expect(ends(drawn(first)[1])[0]).toEqual([106, 8, 0])
    expect(ends(drawn(next)[0])[1]).toEqual([10, 105, 0])
  })

  it("take a number at of, and at a (need …) of two, as a direct distance", () => {
    // probes filters/f08, f27: from the base towards the cursor.
    const atOf = answer(createHarness(), "LINE", "100,100")
    atOf.moveTo(p(200, 100))
    answer(atOf, ".X", "10", "7,8", "")
    const atNeed = answer(createHarness(), "LINE", "100,100")
    atNeed.moveTo(p(100, 200))
    answer(atNeed, ".X", "10,0", "10", "")

    expect(ends(drawn(atOf)[0])[1]).toEqual([110, 8, 0])
    expect(ends(drawn(atNeed)[0])[1]).toEqual([10, 110, 0])
  })

  it("take a number at a (need …) of one as that coordinate", () => {
    // probes filters/f28, f49.
    const cad = answer(createHarness(), "LINE", "100,100", ".XZ", "1,2,3", "4")
    answer(cad, "")

    expect(ends(drawn(cad)[0])[1]).toEqual([1, 4, 3])
  })

  it("give Enter to the prompt", () => {
    // probes filters/f09, f10: LINE's Continue from 2,1.
    for (const typed of [[".X"], [".X", "5,5"]]) {
      const cad = answer(createHarness(), "LINE", "1,1", "@1,0", "", "LINE")
      answer(cad, ...typed, "")
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      answer(cad, "@1,0", "")
      expect(ends(drawn(cad)[1])[0]).toEqual([2, 1, 0])
    }
  })

  it("are gone after the prompt's refusal, in its words", () => {
    // probes filters/f11, f12, f48, f60.
    const cad = answer(createHarness(), "LINE", ".X", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify first point: .X of FOO",
      "Invalid point.",
    ])
    expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
    answer(cad, "0,0", ".X", "1,2", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify next point or [Undo]: .X of 1,2",
      "(need YZ): FOO",
      "Point or option keyword required.",
    ])
    answer(cad, "5,5", "")
    expect(ends(drawn(cad)[0])[1]).toEqual([5, 5, 0])
  })

  it("leave the prompt's keywords on offer", () => {
    // probes filters/f45, f46; es f50.
    const atOf = answer(createHarness(), "LINE", "0,0", "1,0", ".X", "_U")
    answer(atOf, "5,5", "")
    const atNeed = answer(createHarness(), "LINE", "0,0", "1,0", ".X", "4,4")
    answer(atNeed, "_U", "5,5", "")
    const spanish = answer(
      createHarness({ locale: es }),
      "LINEA",
      "0,0",
      "1,0",
      ".X",
      "H"
    )
    answer(spanish, "5,5", "")

    for (const cad of [atOf, atNeed, spanish]) {
      expect(drawn(cad).map(ends)).toEqual([
        [
          [0, 0, 0],
          [5, 5, 0],
        ],
      ])
    }
    expect(atOf.commandLog()).toContain(
      "Specify next point or [Undo]: .X of _U"
    )
    expect(atNeed.commandLog()).toContain("(need YZ): _U")
  })

  it("read the coordinates in the UCS", () => {
    // probe filters/f19: UCS turned 30° about Z.
    const cad = answer(createHarness(), "UCS", "_Z", "30", "LINE", ".X")
    answer(cad, "10,0", "0,5", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([6.16025, 9.33013, 0])
  })

  it("take Z in the UCS, a 2D point's on its XY plane", () => {
    // probe filters/f20: UCS origin at 0,0,10.
    const cad = answer(createHarness(), "UCS", "_O", "0,0,10", "LINE", ".XY")
    answer(cad, "1,2", "3", ".X", "4,5", "6,7", "")

    expect(ends(drawn(cad)[0])).toEqual([
      [1, 2, 13],
      [4, 7, 10],
    ])
  })

  it("take a 2D point's Z from the elevation, and a number's as given", () => {
    // probes filters/f21, f22: ELEV 5.
    const cad = answer(createHarness(), "ELEV", "5", "0", "LINE", ".X", "1,2")
    answer(cad, "3,4", ".XY", "1,2", "3", "", "LINE", ".Z", "1,2", "3,4")
    answer(cad, "@1,0", "")

    expect(drawn(cad).map(ends)).toEqual([
      [
        [1, 4, 5],
        [1, 2, 3],
      ],
      [
        [3, 4, 5],
        [4, 4, 5],
      ],
    ])
  })

  it("take an object snap at of and at (need …)", () => {
    // probes filters/f23, f24; desktop d05: `.X`, `de _END`, `de 99,1`.
    const atOf = answer(
      createHarness({ entities: [REFERENCE] }),
      "LINE",
      ".X",
      "_END",
      "99,1",
      "30,40",
      "@1,0",
      ""
    )
    const atNeed = answer(
      createHarness({ entities: [REFERENCE] }),
      "LINE",
      ".X",
      "30,40",
      "_MID",
      "40,1",
      "@1,0",
      ""
    )

    expect(ends(drawn(atOf)[0])[0]).toEqual([100, 40, 0])
    expect(atOf.commandLog()).toContain(
      "Specify first point: .X of _END of 99,1"
    )
    expect(ends(drawn(atNeed)[0])[0]).toEqual([30, 0, 0])
    expect(atNeed.commandLog()).toContain("(need YZ): _MID of 40,1")
  })

  it("take a pick", () => {
    const cad = answer(createHarness(), "LINE", ".X")
    cad.click(p(10, 20))
    answer(cad, "30,40", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([10, 40, 0])
    expect(cad.commandLog()).toContain("Specify first point: .X of")
  })

  it("refuse a filter or FROM at a filter's of, and a filter at a snap's", () => {
    // desktop filters/d05: `Punto no válido.`, and neither holds after it.
    for (const typed of [
      [".X", ".Y"],
      [".X", "_FRO"],
      ["_END", ".X"],
    ]) {
      const cad = answer(
        createHarness({ entities: [REFERENCE] }),
        "LINE",
        ...typed
      )
      expect(cad.commandLog().slice(-2)).toEqual([
        `Specify first point: ${typed[0]} of ${typed[1]}`,
        "Invalid point.",
      ])
      expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
      answer(cad, "1,2", "3,4", "")
      expect(ends(drawn(cad)[0])[0]).toEqual([1, 2, 0])
    }
  })

  it("are refused under an angle override, which goes with them", () => {
    // probes filters/f42, f47: `10` then runs towards the cursor.
    const cad = answer(createHarness(), "LINE", "0,0", "<45", ".X")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: .X",
      "Point or option keyword required.",
    ])
    cad.moveTo(p(100, 0))
    answer(cad, "10", "")

    expect(ends(drawn(cad)[0])[1]).toEqual([10, 0, 0])
  })

  it("ask X and Y alone at a 2D point's prompt, and refuse Z there", () => {
    // probes filters/f38, f52, f53.
    const cad = answer(createHarness(), "PLINE", "0,0", ".X", "5,9")
    expect(cad.state().commandLine.prompt).toBe("PLINE (need Y):")
    answer(cad, "0,3", ".Z")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: .Z",
      "Z coordinates not allowed here.",
      "2D point or option keyword required.",
    ])
    answer(cad, "")

    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(5, 3),
    ])
  })
})

describe("point filters and FROM", () => {
  it("build FROM's base point", () => {
    // probe filters/f30; desktop `Punto base: .X`, `de 10,0`.
    const cad = answer(createHarness(), "LINE", "_FRO", ".X", "10,0", "0,20")
    expect(cad.state().commandLine.prompt).toBe("LINE <Offset>:")
    answer(cad, "@1,1", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([11, 21, 0])
    expect(cad.commandLog()).toEqual(
      expect.arrayContaining([
        "Base point: .X of 10,0",
        "(need YZ): 0,20",
        "<Offset>: @1,1",
      ])
    )
  })

  it("build FROM's offset, `@` from its base", () => {
    // probe filters/f31.
    const cad = answer(createHarness(), "LINE", "_FRO", "10,10", ".X", "@5,0")
    answer(cad, "0,0", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([15, 0, 0])
  })

  it("take FROM's point at (need …)", () => {
    // probe filters/f55.
    const cad = answer(createHarness(), "LINE", ".X", "1,2", "_FRO", "10,10")
    expect(cad.state().commandLine.prompt).toBe("LINE <Offset>:")
    answer(cad, "@0,5", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([1, 15, 0])
    expect(cad.commandLog()).toContain("(need YZ): _FRO")
  })
})

describe("point filters at other prompts", () => {
  it("give MOVE its displacement", () => {
    // probe filters/f33.
    const cad = answer(createHarness(), "LINE", "0,0", "1,0", "", "MOVE", "_L")
    answer(cad, "", "_D", ".X", "5,0", "0,3")

    expect(ends(drawn(cad)[0])).toEqual([
      [5, 3, 0],
      [6, 3, 0],
    ])
  })

  it("give CIRCLE's radius its point", () => {
    // probe filters/f36.
    const cad = answer(createHarness(), "CIRCLE", "0,0", ".X", "5,9", "0,0")

    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(5)
  })

  it("run in a transparent command, headed >>", () => {
    // probe filters/f35: ` X = 5.0000     Y = 8.0000     Z = 0.0000`.
    const cad = answer(createHarness(), "LINE", "0,0", "'ID", ".X")
    expect(cad.state().commandLine.prompt).toBe("'ID >>of")
    answer(cad, "5,6")
    expect(cad.state().commandLine.prompt).toBe("'ID >>(need YZ):")
    answer(cad, "7,8")

    expect(cad.commandLog().slice(-4)).toEqual([
      ">>Specify point: .X of 5,6",
      ">>(need YZ): 7,8",
      " X = 5.00     Y = 8.00     Z = 0.00",
      "Resuming LINE command.",
    ])
  })
})

describe("the filter's prompts", () => {
  it("show in the tooltip after the question, its keywords on offer", () => {
    // desktop filters/d01, d02.
    const cad = answer(createHarness(), "LINE", "0,0", ".X")
    expect(cad.state().dynamicInput?.prompt).toBe("Specify next point or of")
    expect(cad.optionIds()).toEqual(["Undo"])
    answer(cad, "4,4")
    expect(cad.state().dynamicInput?.prompt).toBe(
      "Specify next point or (need YZ):"
    )
  })

  it("are worded in Spanish", () => {
    // probe filters/f01 es-ES: `de 10,20`, `(falta YZ): 30,40`.
    const cad = answer(createHarness({ locale: es }), "LINEA", ".X", "10,20")
    expect(cad.state().commandLine.prompt).toBe("LINEA (falta YZ):")
    answer(cad, "30,40", "@5,0", "")

    expect(cad.commandLog().slice(-4, -2)).toEqual([
      "Precise primer punto: .X de 10,20",
      "(falta YZ): 30,40",
    ])
  })

  it("are typed by the Point Filters menu", () => {
    // desktop filters/d04: `Precise primer punto: .XY de 1,2`, `(falta Z): 5`.
    const cad = answer(createHarness(), "LINE")
    cad.runtime.choosePointFilter(".XY")
    answer(cad, "1,2", "5", "@1,0", "")

    expect(ends(drawn(cad)[0])[0]).toEqual([1, 2, 5])
    expect(cad.commandLog()).toEqual(
      expect.arrayContaining(["Specify first point: .XY of 1,2", "(need Z): 5"])
    )
  })

  it("are cancelled with their command by Escape", () => {
    // desktop filters/d05: `de *Cancelado*`, `(falta YZ): *Cancelado*`.
    for (const typed of [[".X"], [".X", "4,4"], ["_FRO"]]) {
      const cad = answer(createHarness(), "LINE", "0,0", "1,0", ...typed)
      cad.escape()

      expect(cad.state().commandLine.prompt).toBe("Command:")
      expect(drawn(cad)).toHaveLength(1)
    }
  })
})
