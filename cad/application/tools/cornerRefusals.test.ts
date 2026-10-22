import { describe, expect, it } from "vitest"
import {
  createAttributeDefinition,
  createBlockDefinition,
  createDimension,
  createInsert,
  createMText,
  createSpline,
  type Entity,
  type LineEntity,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  hatchOf,
  layerOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  rectOf,
  textOf,
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

  it("says an open polyline's first and last diverge where they cross before the last (corners/p388)", () => {
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

  // probes corners/p134, p135.
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

// AutoCAD 2027's console, probes corners/p129, p130, p133.
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

  it("is asked again on Space too", () => {
    const cad = run(cross(), "FILLET", "30,40")
    cad.press(" ")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    answer(cad, "10,0")
    expect(cad.typeCounts()).toEqual({ line: 2 })
    expect(cad.activeToolId()).toBe("select")
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

// AutoCAD 2027's console (probes corners/p183, p184); Multiple and a mode's
// find, AutoCAD 2023's (acc/u4–u9 of 2026-10-14).
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

  it("a segment next to it is taken: at radius 0, the corner it already has", () => {
    const cad = run(zigzag(), "FILLET", "50,0", "C", "95,20", "105,30")
    expect(cad.commandLog().at(-1)).toBe("Specify opposite corner: 105,30")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entities()).toEqual(zigzag())
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

// AutoCAD 2027's console, probes corners/p121, p122: the second prompt
// declares the modes and Radius (CHAMFER's Distance, Angle and Method) alone,
// so every first-prompt word is refused there; `M` at CHAMFER's is Method,
// not built here, so it is not typed.
describe("FILLET's and CHAMFER's second prompt takes no first-prompt word", () => {
  it("refuses Polyline, Multiple, Undo and Trim as any answer, in Multiple too", () => {
    for (const word of [
      "P",
      "POLYLINE",
      "U",
      "MULTIPLE",
      "N",
      "UNDO",
      "T",
      "TRIM",
    ]) {
      for (const multiple of [[], ["M"]]) {
        const cad = run(cross(), "FILLET", ...multiple, "30,40", word)
        expect(cad.commandLog().slice(-3)).toEqual([
          `Select second object or shift-select to apply corner or [Radius]: ${word}`,
          "*Invalid selection*",
          "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
        ])
      }
      const chamfer = run(cross(), "CHAMFER", "30,40", word)
      expect(chamfer.commandLog().slice(-2)).toEqual([
        "*Invalid selection*",
        "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Distance",
      ])
      expect(chamfer.activeToolId()).toBe("chamfer")
    }
  })
})

/** {@link cross} with its second line on layer K, as `-LAYER` left it. */
function onK(layer: Parameters<typeof layerOf>[1], locale?: typeof es) {
  const cad = createHarness({ locale })
  const [l1, l2] = cross()
  cad.runtime.document.load([l1, { ...l2, layerId: "K" }], {
    layers: [layerOf("0"), layerOf("K", layer)],
  })
  return cad
}

/** What `ID @` says LASTPOINT is. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

// AutoCAD 2027's console, en-US and es-ES (probes corners/p270–p276): a pick
// on a locked object alone is said, and the same prompt asked again;
// LASTPOINT is the pick, as on nothing.
describe("FILLET and CHAMFER refuse an object on a locked layer picked", () => {
  const LOCKED = "The object is on a locked layer."

  it("says so at the first prompt and asks it again (p270, p275)", () => {
    for (const [command, prompt] of [
      [
        "FILLET",
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:",
      ],
      [
        "CHAMFER",
        "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:",
      ],
    ]) {
      const cad = onK({ locked: true })
      answer(cad, "ID", "5,5", command, "30,40")
      expect(cad.commandLog().at(-1), command).toBe(LOCKED)
      expect(cad.state().commandLine.prompt).toBe(prompt)
      cad.enter()
      expect(lastPoint(cad)).toBe(" X = 30.00     Y = 40.00     Z = 0.00")
      expect(cad.byId<LineEntity>("L2").start).toBeCloseToPoint(p(30, -20), 6)
    }
  })

  it("says so at the second prompt and asks it again (p271)", () => {
    const cad = onK({ locked: true })
    cad.command("FILLET")
    answer(cad, "80,0", "30,40")
    expect(cad.commandLog().at(-1)).toBe(LOCKED)
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    answer(cad, "80,0")
    expect(cad.commandLog().at(-1)).toBe("Cannot fillet an entity with itself.")
  })

  it("says so at Polyline's prompt and asks it again (p276)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], {
          id: "P",
          layerId: "K",
        }),
      ],
      { layers: [layerOf("0"), layerOf("K", { locked: true })] }
    )
    cad.command("FILLET")
    answer(cad, "P", "50,0")
    expect(cad.commandLog().at(-1)).toBe(LOCKED)
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select 2D polyline or [Radius]:"
    )
  })

  it("says nothing of a line on a layer that is off (p272)", () => {
    const cad = onK({ visible: false })
    answer(cad, "ID", "5,5", "FILLET", "30,40")
    expect(cad.commandLog().at(-1)).toBe(
      "Select first object or [Undo/Polyline/Radius/Multiple]: 30,40"
    )
    cad.enter()
    expect(lastPoint(cad)).toBe(" X = 30.00     Y = 40.00     Z = 0.00")
  })

  it("is said in Autodesk's Spanish", () => {
    for (const command of ["EMPALME", "CHAFLAN"]) {
      const cad = onK({ locked: true }, es)
      answer(cad, command, "30,40")
      expect(cad.commandLog().at(-1), command).toBe(
        "El objeto está en una capa bloqueada."
      )
    }
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes corners/p231–p239,
// p310–p318, p371–p378, p381, p382): each type is said in its words; at the
// second prompt an MTEXT or a HATCH ends the command, the rest ask again.
describe("FILLET and CHAMFER say what they make no corner of", () => {
  const block = createBlockDefinition("B1", p(0, 0), [
    lineOf(p(-10, -10), p(10, 10)),
  ])
  const harness = (entity: Entity, spanish = false) =>
    createHarness({
      entities: [
        entity,
        lineOf(p(200, -100), p(200, 100), { id: "L8" }),
        lineOf(p(150, 150), p(250, 150), { id: "L9" }),
        rectOf(p(200, 200), p(250, 250), { id: "P9" }),
      ],
      blocks: [block],
      ...(spanish ? { locale: es } : {}),
    })
  const TEXT = () => textOf(p(0, 0), "HOLA", { height: 10, id: "T" })
  const ATTDEF = () =>
    createAttributeDefinition(p(0, 0), "TAG", { height: 10, id: "T" })
  const MTEXT = () =>
    createMText(p(0, 10), "HOLA", { height: 10, width: 100, id: "T" })
  const INSERT = () => createInsert("B1", p(0, 0), { id: "T" })
  const HATCH = () => hatchOf([loopOf(p(-50, -25), p(50, 25))], { id: "T" })
  const DIMENSION = () =>
    createDimension("linear", p(-50, 0), p(50, 0), p(0, -20), { id: "T" })
  const FILLET_ANY = [
    "Fillet requires 2 lines, arcs, or circles.",
    "Empalme requiere 2 líneas, arcos o círculos.",
  ]
  const FILLET_BLOCKS = [
    "Fillet requires 2 lines, arcs, or circles (not block references).",
    "Empalme requiere 2 líneas, arcos o círculos (no referencias a bloque).",
  ]
  const FILLET_DIMENSIONS = [
    "Fillet requires 2 lines, arcs, or circles (not dimensions).",
    "Empalme requiere 2 líneas, arcos o círculos (no cotas).",
  ]
  const CHAMFER_ANY = [
    "Chamfer requires 2 lines.",
    "Chaflán requiere 2 líneas.",
  ]
  const CHAMFER_BLOCKS = [
    "Chamfer requires 2 lines (not block references).",
    "Chaflán requiere 2 líneas (no referencias a bloque).",
  ]
  const CHAMFER_DIMENSIONS = [
    "Chamfer requires 2 lines (not dimensions).",
    "Chaflán requiere 2 líneas (no cotas).",
  ]
  const FILLET_BETWEEN = [
    "Cannot fillet between these two entities.",
    "Imposible empalmar estos dos objetos.",
  ]
  const CHAMFER_BETWEEN = [
    "Cannot chamfer between these two entities.",
    "Imposible hacer un chaflán entre estas dos entidades.",
  ]

  it.each([
    ["p231 TEXT", TEXT, "3,3", FILLET_ANY],
    ["p381 ATTDEF", ATTDEF, "3,3", FILLET_ANY],
    ["p232 MTEXT", MTEXT, "3,5", FILLET_ANY],
    ["p234 HATCH", HATCH, "0,0", FILLET_ANY],
    ["p233 INSERT", INSERT, "5,5", FILLET_BLOCKS],
    ["p235 DIMENSION", DIMENSION, "0,-20", FILLET_DIMENSIONS],
  ])(
    "%s at FILLET's first prompt is said and asked again",
    (_, make, pick, [en, sp]) => {
      const cad = answer(harness(make()), "FILLET", pick)
      expect(cad.commandLog().at(-1)).toBe(en)
      expect(cad.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )
      expect(
        answer(harness(make(), true), "EMPALME", pick).commandLog().at(-1)
      ).toBe(sp)
    }
  )

  it.each([
    ["p238 TEXT", TEXT, "3,3", FILLET_ANY, true],
    ["p310 INSERT", INSERT, "5,5", FILLET_BLOCKS, true],
    ["p311 DIMENSION", DIMENSION, "0,-20", FILLET_DIMENSIONS, true],
    ["p239 HATCH", HATCH, "0,0", FILLET_BETWEEN, false],
    ["p312 MTEXT", MTEXT, "3,5", FILLET_BETWEEN, false],
  ])("%s at FILLET's second prompt", (_, make, pick, [en, sp], asksAgain) => {
    const cad = answer(harness(make()), "FILLET", "200,50", pick)
    expect(cad.commandLog().at(-1)).toBe(en)
    expect(cad.activeToolId()).toBe(asksAgain ? "fillet" : "select")
    expect(cad.entities()).toHaveLength(4)
    const spanish = answer(harness(make(), true), "EMPALME", "200,50", pick)
    expect(spanish.commandLog().at(-1)).toBe(sp)
  })

  it.each([
    ["p316 TEXT", TEXT, "3,3", CHAMFER_ANY],
    ["p382 ATTDEF", ATTDEF, "3,3", CHAMFER_ANY],
    ["p376 MTEXT", MTEXT, "3,5", CHAMFER_ANY],
    ["p318 HATCH", HATCH, "0,0", CHAMFER_ANY],
    ["p317 INSERT", INSERT, "5,5", CHAMFER_BLOCKS],
    ["p377 DIMENSION", DIMENSION, "0,-20", CHAMFER_DIMENSIONS],
  ])(
    "%s at CHAMFER's first prompt is said and asked again",
    (_, make, pick, [en, sp]) => {
      const cad = answer(harness(make()), "CHAMFER", pick)
      expect(cad.commandLog().at(-1)).toBe(en)
      expect(cad.state().commandLine.prompt).toBe(
        "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:"
      )
      expect(
        answer(harness(make(), true), "CHAFLAN", pick).commandLog().at(-1)
      ).toBe(sp)
    }
  )

  it.each([
    ["p371 TEXT", TEXT, "3,3", CHAMFER_ANY, true],
    ["p373 INSERT", INSERT, "5,5", CHAMFER_BLOCKS, true],
    ["p375 DIMENSION", DIMENSION, "0,-20", CHAMFER_DIMENSIONS, true],
    ["p372 HATCH", HATCH, "0,0", CHAMFER_BETWEEN, false],
    ["p374 MTEXT", MTEXT, "3,5", CHAMFER_BETWEEN, false],
  ])("%s at CHAMFER's second prompt", (_, make, pick, [en, sp], asksAgain) => {
    const cad = answer(harness(make()), "CHAMFER", "200,50", pick)
    expect(cad.commandLog().at(-1)).toBe(en)
    expect(cad.activeToolId()).toBe(asksAgain ? "chamfer" : "select")
    expect(cad.entities()).toHaveLength(4)
    const spanish = answer(harness(make(), true), "CHAFLAN", "200,50", pick)
    expect(spanish.commandLog().at(-1)).toBe(sp)
  })

  it("says it of what a mode finds too (p378)", () => {
    const cad = answer(harness(TEXT()), "FILLET", "W", "-5,-5", "80,20")
    expect(cad.commandLog().at(-1)).toBe(FILLET_ANY[0])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
    )
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes corners/p228, p230, p236,
// p237, p314, p315, p319, p324–p327, p366–p370, p379, p380, p383–p385).
describe("FILLET and CHAMFER of an ellipse or a spline", () => {
  const ELLIPSE = () => ellipseOf(p(0, 0), p(50, 0), 0.5, { id: "E" })
  const HALF = () =>
    ellipseOf(p(0, 0), p(50, 0), 0.5, {
      id: "E",
      startParam: 0,
      endParam: Math.PI,
    })
  const SPLINE = () =>
    createSpline("fit", [p(0, 0), p(50, 30), p(100, 0), p(150, 30)], {
      id: "S",
    })
  const across = () => lineOf(p(30, -40), p(30, 60), { id: "L1" })
  const UNABLE = ["Unable to fillet curves.", "No se pueden empalmar curvas."]
  const BETWEEN = [
    "Cannot chamfer between these two entities.",
    "Imposible hacer un chaflán entre estas dos entidades.",
  ]
  /** The same answers in English and in Spanish, as `_FILLET`, `_R`. */
  const both = (entities: () => Entity[], ...texts: string[]) => {
    const global = texts.map((text) =>
      /^[A-Z]+$/.test(text) ? `_${text}` : text
    )
    return [
      answer(createHarness({ entities: entities() }), ...global),
      answer(createHarness({ entities: entities(), locale: es }), ...global),
    ]
  }

  it("FILLET at a radius says it cannot fillet a closed ellipse with a line, either first, crossing or not (p325, p366, p383)", () => {
    const apart = () => [
      ELLIPSE(),
      lineOf(p(200, -100), p(200, 100), { id: "L1" }),
    ]
    for (const [entities, picks] of [
      [() => [ELLIPSE(), across()], ["30,40", "50,0"]],
      [() => [ELLIPSE(), across()], ["50,0", "30,40"]],
      [apart, ["200,50", "50,0"]],
    ] as const) {
      const [en, sp] = both(entities, "FILLET", "R", "5", ...picks)
      expect(en.commandLog().at(-1)).toBe(UNABLE[0])
      expect(sp.commandLog().at(-1)).toBe(UNABLE[1])
      expect(en.activeToolId()).toBe("select")
      expect(en.entities()).toEqual(entities())
    }
  })

  it("FILLET says it of two closed ellipses (p384)", () => {
    const two = () => [
      ELLIPSE(),
      ellipseOf(p(60, 0), p(50, 0), 0.5, { id: "E2" }),
    ]
    const [en, sp] = both(two, "FILLET", "R", "5", "50,0", "10,0")
    expect(en.commandLog().at(-1)).toBe(UNABLE[0])
    expect(sp.commandLog().at(-1)).toBe(UNABLE[1])
  })

  it("FILLET cannot fillet a closed ellipse with a polyline's segment, at any radius (p367, p385)", () => {
    const pair = () => [
      ELLIPSE(),
      polylineOf([p(30, -40), p(30, 60)], { id: "P1" }),
    ]
    for (const radius of ["5", "0"]) {
      const [en, sp] = both(pair, "FILLET", "R", radius, "30,40", "50,0")
      expect(en.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
      expect(sp.commandLog().at(-1)).toBe(
        "Imposible empalmar estos dos objetos."
      )
      expect(en.activeToolId()).toBe("select")
    }
  })

  it("FILLET at radius 0 makes nothing of a line that misses the ellipse, and says nothing (p236)", () => {
    const cad = run(
      [ELLIPSE(), lineOf(p(200, -100), p(200, 100), { id: "L1" })],
      "FILLET",
      "R",
      "0",
      "200,50",
      "50,0"
    )
    expect(cad.commandLog().at(-1)).toBe(
      "Select second object or shift-select to apply corner or [Radius]: 50,0"
    )
    expect(cad.activeToolId()).toBe("select")
  })

  // WHY asked again: AutoCAD trims the line to the ellipse at radius 0
  // (p324), fillets a closed ellipse with an arc (p368) and an elliptical arc
  // or a spline with a line (p369, p326), which is not built: the coverage
  // entry's Missing.
  it("FILLET takes no corner it does not build: asked again, nothing said (p324, p368, p369, p237)", () => {
    const meets = run(
      [ELLIPSE(), across()],
      "FILLET",
      "R",
      "0",
      "30,40",
      "50,0"
    )
    expect(meets.activeToolId()).toBe("fillet")
    expect(meets.byId<LineEntity>("L1").start).toBeCloseToPoint(p(30, -40))
    const arc = run(
      [ELLIPSE(), arcOf(p(60, 0), 20, deg(180), deg(270), { id: "A1" })],
      "FILLET",
      "R",
      "5",
      "60,-20",
      "50,0"
    )
    expect(arc.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    for (const [entity, pick] of [
      [HALF(), "0,25"],
      [SPLINE(), "0,0"],
    ] as const) {
      const cad = run([entity, across()], "FILLET", "R", "5", pick)
      expect(cad.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )
    }
  })

  it("CHAMFER takes an ellipse, an elliptical arc or a spline, and with a line says it cannot, either first (p314, p315, p319, p327, p370, p380)", () => {
    for (const [make, pick] of [
      [ELLIPSE, "50,0"],
      [HALF, "0,25"],
      [SPLINE, "100,0"],
    ] as const) {
      const first = run([make(), across()], "CHAMFER", pick)
      expect(first.state().commandLine.prompt).toBe(
        "CHAMFER Select second line or shift-select to apply corner or [Distance]:"
      )
      for (const picks of [
        [pick, "30,40"],
        ["30,40", pick],
      ]) {
        const [en, sp] = both(() => [make(), across()], "CHAMFER", ...picks)
        expect(en.commandLog().at(-1)).toBe(BETWEEN[0])
        expect(sp.commandLog().at(-1)).toBe(BETWEEN[1])
        expect(en.activeToolId()).toBe("select")
        expect(en.entities()).toHaveLength(2)
      }
    }
  })

  it("CHAMFER's Polyline says an ellipse is no 2D polyline (p379)", () => {
    const cad = run([ELLIPSE()], "CHAMFER", "P", "50,0")
    expect(cad.commandLog().at(-1)).toBe("Object selected is not a 2D polyline")
  })
})
