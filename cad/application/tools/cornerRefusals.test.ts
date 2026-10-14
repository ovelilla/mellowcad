import { describe, expect, it } from "vitest"
import type { Entity } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function run(entities: Entity[], command: string, ...texts: string[]) {
  const cad = createHarness({ entities })
  cad.command(command)
  return answer(cad, ...texts)
}

/** Two lines crossing at 30,0. */
const cross = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "L1" }),
  lineOf(p(30, -20), p(30, 60), { id: "L2" }),
]

/** Five segments: 0 along the bottom, 3 up the left, 4 along the top. */
const zigzag = (): Entity[] => [
  polylineOf(
    [p(0, 0), p(100, 0), p(100, 50), p(0, 50), p(0, 100), p(100, 100)],
    { id: "P" }
  ),
]

const APART =
  "Lines belonging to polylines must be consecutive or separated by one segment"

// Every expectation below is AutoCAD 2023's console answering the same input:
// acc/i*, j6, k1–k5, l1, l2 in the research notes.
describe("FILLET and CHAMFER refuse a second pick that makes no corner", () => {
  it("ends saying so where the first object is picked again, in Multiple too", () => {
    for (const multiple of [[], ["M"]]) {
      const cad = run(cross(), "FILLET", ...multiple, "30,40", "30,50")
      expect(cad.commandLog().slice(-2)).toEqual([
        "Select second object or shift-select to apply corner or [Radius]: 30,50",
        "Cannot fillet an entity with itself.",
      ])
      expect(cad.activeToolId()).toBe("select")

      const chamfer = run(cross(), "CHAMFER", ...multiple, "30,40", "30,50")
      expect(chamfer.commandLog().at(-1)).toBe(
        "Cannot chamfer an entity with itself."
      )
      expect(chamfer.activeToolId()).toBe("select")
    }
  })

  it("takes a polyline's segment picked again, an arc and a circle, as the same object", () => {
    const segment = run(zigzag(), "FILLET", "50,0", "60,0")
    expect(segment.commandLog().at(-1)).toBe(
      "Cannot fillet an entity with itself."
    )
    expect(segment.activeToolId()).toBe("select")
    const chamfer = run(zigzag(), "CHAMFER", "50,0", "60,0")
    expect(chamfer.commandLog().at(-1)).toBe(
      "Cannot chamfer an entity with itself."
    )

    const round = (entity: Entity, a: string, b: string) => {
      const cad = run([entity, lineOf(p(0, 0), p(100, 0))], "FILLET", "M", a, b)
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet an entity with itself."
      )
      expect(cad.activeToolId()).toBe("select")
    }
    round(circleOf(p(50, 50), 20), "70,50", "50,70")
    round(arcOf(p(50, 50), 20, deg(0), deg(180)), "70,50", "30,50")
  })

  it("refuses segments of one polyline two or more apart: *Invalid*, or in Multiple the first prompt", () => {
    for (const [a, b] of [
      ["50,0", "0,75"],
      ["100,25", "50,100"],
    ]) {
      const cad = run(zigzag(), "FILLET", a, b)
      expect(cad.commandLog().slice(-2)).toEqual([APART, "*Invalid*"])
      expect(cad.activeToolId()).toBe("select")
    }
    const multiple = run(zigzag(), "FILLET", "M", "50,0", "0,75", "FOO")
    expect(multiple.commandLog().slice(-4)).toEqual([
      APART,
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])

    const chamfer = run(zigzag(), "CHAMFER", "50,0", "0,75")
    expect(chamfer.commandLog().slice(-2)).toEqual([APART, "*Invalid*"])
    const again = run(zigzag(), "CHAMFER", "M", "50,0", "0,75")
    expect(again.commandLog().at(-1)).toBe(APART)
    expect(again.activeToolId()).toBe("chamfer")
  })

  it("still makes the corner of an open polyline's first and last segments", () => {
    const cad = run(
      [polylineOf([p(0, 0), p(100, 0), p(100, 50), p(0, 50), p(0, 100)])],
      "FILLET",
      "50,0",
      "0,80"
    )
    expect(cad.commandLog().slice(-2)).toEqual(["Lines diverge", "*Invalid*"])
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: zigzag() })
    cad.command("EMPALME")
    answer(cad, "50,0", "0,75")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Las líneas pertenecientes a polilíneas tienen que ser consecutivas o estar separadas por un segmento",
      "*No válido*",
    ])
    const itself = createHarness({ locale: es, entities: cross() })
    itself.command("CHAFLAN")
    answer(itself, "30,40", "30,50")
    expect(itself.commandLog().at(-1)).toBe(
      "No se puede achaflanar un objeto consigo mismo."
    )
  })
})

describe("FILLET's and CHAMFER's Polyline say what is no 2D polyline", () => {
  it("asks again saying so, for a pick and for what a mode finds", () => {
    const cad = run(cross(), "FILLET", "P", "30,40", "FOO")
    expect(cad.commandLog().slice(-5, -1)).toEqual([
      "Select 2D polyline or [Radius]: 30,40",
      "Object selected is not a 2D polyline",
      "Select 2D polyline or [Radius]: FOO",
      "*Invalid selection*",
    ])
    expect(cad.activeToolId()).toBe("fillet")

    const circle = run([circleOf(p(50, 50), 20)], "FILLET", "P", "70,50")
    expect(circle.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )

    // The newest found, a line, though the window holds a polyline too.
    const window = run(
      [...zigzag(), lineOf(p(20, 20), p(80, 20), { id: "L" })],
      "FILLET",
      "P",
      "W",
      "-10,-10",
      "110,110"
    )
    expect(window.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )
    expect(window.activeToolId()).toBe("fillet")
    const last = run(
      [...zigzag(), lineOf(p(20, 20), p(80, 20), { id: "L" })],
      "CHAMFER",
      "P",
      "L"
    )
    expect(last.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )
  })

  it("goes back to the first prompt on Enter in Multiple, else ends", () => {
    const cad = run(cross(), "FILLET", "M", "P", "", "FOO")
    expect(cad.commandLog().slice(-4, -1)).toEqual([
      "Select 2D polyline or [Radius]:",
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
      "*Invalid selection*",
    ])
    const chamfer = run(cross(), "CHAMFER", "M", "P", "")
    expect(chamfer.activeToolId()).toBe("chamfer")
    expect(run(cross(), "FILLET", "P", "").activeToolId()).toBe("select")
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    cad.command("CHAFLAN")
    answer(cad, "P", "30,40")
    expect(cad.commandLog().at(-1)).toBe(
      "El objeto designado no es una polilínea 2D."
    )
  })
})

// AutoCAD 2023's console, acc/u1–u3 of 2026-10-14.
describe("FILLET's and CHAMFER's second prompt on Enter", () => {
  it("is asked again without a word, in Multiple or not", () => {
    for (const multiple of [[], ["M"]]) {
      const cad = run(cross(), "FILLET", ...multiple, "30,40", "", "FOO")
      expect(cad.commandLog().slice(-4)).toEqual([
        "Select second object or shift-select to apply corner or [Radius]:",
        "Select second object or shift-select to apply corner or [Radius]: FOO",
        "*Invalid selection*",
        "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
      ])
      expect(cad.activeToolId()).toBe("fillet")

      const chamfer = run(cross(), "CHAMFER", ...multiple, "30,40", "", "80,0")
      expect(chamfer.commandLog().slice(-2)).toEqual([
        "Select second line or shift-select to apply corner or [Distance]:",
        "Select second line or shift-select to apply corner or [Distance]: 80,0",
      ])
    }
  })

  it("is asked again in Spanish too", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    cad.command("EMPALME")
    answer(cad, "30,40", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]:"
    )
    expect(cad.activeToolId()).toBe("fillet")
  })
})

// AutoCAD 2023's console, acc/u4–u9 of 2026-10-14.
describe("CHAMFER of two parallel lines", () => {
  const parallel = (): Entity[] => [
    lineOf(p(0, 0), p(100, 0)),
    lineOf(p(0, 10), p(100, 10)),
  ]
  const collinear = (): Entity[] => [
    lineOf(p(0, 0), p(40, 0)),
    lineOf(p(60, 0), p(100, 0)),
  ]

  it("says they are parallel: *Invalid*, or in Multiple the first prompt", () => {
    const cad = run(parallel(), "CHAMFER", "20,0", "80,10")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select second line or shift-select to apply corner or [Distance]: 80,10",
      "Lines are parallel",
      "*Invalid*",
    ])
    expect(cad.activeToolId()).toBe("select")

    const multiple = run(parallel(), "CHAMFER", "M", "20,0", "80,10", "FOO")
    expect(multiple.commandLog().slice(-4)).toEqual([
      "Lines are parallel",
      "Select first line or [Undo/Polyline/Distance/Multiple]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Distance",
    ])
  })

  it("says collinear ones cannot be chamfered, with no *Invalid*, by a pick or a mode", () => {
    for (const second of [["80,0"], ["C", "50,-5", "90,5"]]) {
      const cad = run(collinear(), "CHAMFER", "D", "5", "5", "20,0", ...second)
      expect(cad.commandLog().at(-1)).toBe(
        "Collinear lines connot be chamfered."
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entities().map((e) => e.type)).toEqual(["line", "line"])
    }

    const multiple = run(collinear(), "CHAMFER", "M", "20,0", "80,0", "FOO")
    expect(multiple.commandLog().slice(-4, -2)).toEqual([
      "Collinear lines connot be chamfered.",
      "Select first line or [Undo/Polyline/Distance/Multiple]: FOO",
    ])
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: collinear() })
    cad.command("CHAFLAN")
    answer(cad, "20,0", "80,0")
    expect(cad.commandLog().at(-1)).toBe(
      "Las líneas colineales no pueden ser unidos con chaflán."
    )
    const parallelEs = createHarness({ locale: es, entities: parallel() })
    parallelEs.command("CHAFLAN")
    answer(parallelEs, "20,0", "80,10")
    expect(parallelEs.commandLog().slice(-2)).toEqual([
      "Las líneas son paralelas",
      "*No válido*",
    ])
  })
})

// AutoCAD 2023's console, acc/v1–v8 of 2026-10-14.
describe("FILLET and CHAMFER refuse a mode's find at the second prompt as a pick", () => {
  const same = [
    ["C", "40,-5", "60,5"],
    ["F", "50,-5", "50,5", ""],
  ]
  const far = [
    ["C", "-5,70", "5,80"],
    ["F", "-5,75", "5,75", ""],
  ]

  it("the first segment again ends saying so, in Multiple too", () => {
    for (const mode of same) {
      for (const multiple of [[], ["M"]]) {
        const cad = run(zigzag(), "FILLET", ...multiple, "50,0", ...mode)
        expect(cad.commandLog().at(-1)).toBe(
          "Cannot fillet an entity with itself."
        )
        expect(cad.activeToolId()).toBe("select")
      }
    }
    const chamfer = run(zigzag(), "CHAMFER", "50,0", ...same[0])
    expect(chamfer.commandLog().at(-1)).toBe(
      "Cannot chamfer an entity with itself."
    )
    expect(chamfer.activeToolId()).toBe("select")
  })

  it("a segment two or more away: *Invalid*, or in Multiple the first prompt", () => {
    for (const mode of far) {
      const cad = run(zigzag(), "FILLET", "50,0", ...mode)
      expect(cad.commandLog().slice(-2)).toEqual([APART, "*Invalid*"])
      expect(cad.activeToolId()).toBe("select")
    }
    const multiple = run(zigzag(), "FILLET", "M", "50,0", ...far[0], "FOO")
    expect(multiple.commandLog().slice(-4, -2)).toEqual([
      APART,
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
    ])
    const chamfer = run(zigzag(), "CHAMFER", "M", "50,0", ...far[0], "FOO")
    expect(chamfer.commandLog().slice(-4, -2)).toEqual([
      APART,
      "Select first line or [Undo/Polyline/Distance/Multiple]: FOO",
    ])
  })

  it("a segment next to it still makes the corner", () => {
    const cad = run(zigzag(), "FILLET", "50,0", "C", "95,20", "105,30")
    expect(cad.commandLog().at(-1)).toBe("Specify opposite corner: 105,30")
    expect(cad.activeToolId()).toBe("select")
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: zigzag() })
    cad.command("EMPALME")
    answer(cad, "50,0", "C", "40,-5", "60,5")
    expect(cad.commandLog().at(-1)).toBe(
      "No se puede empalmar un objeto consigo mismo."
    )
    const far = createHarness({ locale: es, entities: zigzag() })
    far.command("CHAFLAN")
    answer(far, "50,0", "B", "-5,75", "5,75", "")
    expect(far.commandLog().slice(-2)).toEqual([
      "Las líneas pertenecientes a polilíneas tienen que ser consecutivas o estar separadas por un segmento",
      "*No válido*",
    ])
  })
})

// AutoCAD 2023's console, acc/w1–w6 of 2026-10-14.
describe("FILLET of an ARC or a CIRCLE out of the other's plane", () => {
  const NON_COPLANAR = "Two entities are non coplanar."
  const drawn = (command: string, ...texts: string[]) => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command(command)
    return answer(cad, ...texts)
  }
  const fillet = (cad: CadHarness, ...texts: string[]) => {
    cad.command("FILLET")
    return answer(cad, "R", "5", ...texts)
  }

  it("says they are not coplanar and ends, picked either way round", () => {
    for (const picks of [
      ["50,0", "50,30"],
      ["50,30", "50,0"],
    ]) {
      const cad = fillet(drawn("CIRCLE", "50,50,10", "20"), ...picks)
      expect(cad.commandLog().at(-1)).toBe(NON_COPLANAR)
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entities()).toHaveLength(2)
    }
  })

  it("asks the first prompt again in Multiple", () => {
    const cad = drawn("CIRCLE", "50,50,10", "20")
    cad.command("FILLET")
    answer(cad, "M", "R", "5", "50,0", "50,30", "FOO")
    expect(cad.commandLog().slice(-4, -2)).toEqual([
      NON_COPLANAR,
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
    ])
  })

  it("takes a circle upright in the WCS, and two circles at two heights", () => {
    const upright = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    for (const [command, ...rest] of [
      ["UCS", "X", "90"],
      ["CIRCLE", "50,30,-40", "20"],
      ["UCS", "W"],
    ]) {
      upright.command(command)
      answer(upright, ...rest)
    }
    for (const picks of [
      ["50,0", "60,40"],
      ["60,40", "50,0"],
    ]) {
      const cad = createHarness({ entities: upright.entities() })
      expect(
        fillet(cad, ...picks)
          .commandLog()
          .at(-1)
      ).toBe(NON_COPLANAR)
    }

    const two = createHarness({
      entities: [
        circleOf(p(20, 50), 20),
        { ...circleOf(p(80, 50), 20), elevation: 10 },
      ],
    })
    expect(fillet(two, "40,50", "60,50").commandLog().at(-1)).toBe(NON_COPLANAR)
  })

  // WHY: the console rounds them in that plane (acc/w7, w9), not built here.
  it("takes nothing in a tilted plane the two share", () => {
    const cad = createHarness()
    for (const [command, ...rest] of [
      ["UCS", "X", "45"],
      ["LINE", "0,0", "100,0", ""],
      ["CIRCLE", "50,40", "20"],
      ["UCS", "W"],
    ]) {
      cad.command(command)
      answer(cad, ...rest)
    }
    const drawing = cad.entities()
    for (const [first, second] of [
      ["50,0", "50,14.1421"],
      ["50,14.1421", "50,0"],
    ]) {
      const tried = fillet(createHarness({ entities: drawing }), first, second)
      // The first pick took its object: the second prompt was asked.
      expect(tried.commandLog().at(-1)).toBe(
        "Select second object or shift-select to apply corner or [Radius]: " +
          second
      )
      expect(tried.activeToolId()).toBe("fillet")
    }
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(100, 0)),
        { ...circleOf(p(50, 50), 20), elevation: 10 },
      ],
    })
    cad.command("EMPALME")
    answer(cad, "RA", "5", "50,0", "50,30")
    expect(cad.commandLog().at(-1)).toBe("Los dos objetos no son coplanares.")
  })
})
