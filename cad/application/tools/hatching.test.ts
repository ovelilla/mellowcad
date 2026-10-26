import { describe, expect, it } from "vitest"
import { V, type Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  HatchEntity,
  MAX_HATCH_LINES,
  createHatch,
  createMText,
  hatchGeometry,
  hatchLoopFromEntity,
  mirrorEntity,
  pointInsideHatch,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_PATTERN_ID,
  HATCH_PATTERNS,
  SOLID_HATCH_PATTERN_ID,
  hatchPattern,
} from "../../domain/hatchPatterns"
import { objectArea } from "../../domain/objectArea"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import {
  arcOf,
  circleOf,
  deg,
  layerOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  rectOf,
  textOf,
} from "../../../test/builders"
import { createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import { EXPLODED_LINES } from "./hatching.probes"

/** The square boundary most of these tests hatch. */
const SQUARE = rectOf(p(0, 0), p(100, 100), { id: "sq" })

function hatchOnly(entities: readonly { type: string }[]): HatchEntity {
  const hatch = entities.find((e) => e.type === "hatch")
  expect(hatch).toBeDefined()
  return hatch as unknown as HatchEntity
}

/** Four separate lines drawn corner to corner: an area nothing encloses alone. */
function looseSquare(min: number, max: number) {
  return [
    lineOf(p(min, min), p(max, min)),
    lineOf(p(max, min), p(max, max)),
    lineOf(p(max, max), p(min, max)),
    lineOf(p(min, max), p(min, min)),
  ]
}

// The internal point against AutoCAD 2027's console, probes hatch/p100–p168:
// -HATCH, whose prompt HATCH keeps here (HATCH-D31).
describe("HATCH boundary by Pick internal point", () => {
  it("is the prompt the command opens with (p100)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")

    expect(h.optionAbbreviations()).toEqual(["P", "S"])
  })

  it("fills an area enclosed by loose lines (p135)", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(50, 50)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(hatch.loops[0].vertices).toHaveLength(4)
    expect(hatchGeometry(hatch).lines.length).toBeGreaterThan(0)
    expect(h.activeToolId()).toBe("select")
  })

  it("leaves an enclosed island unfilled", () => {
    const h = createHarness({
      entities: [...looseSquare(0, 100), ...looseSquare(40, 60)],
    })
    h.command("HATCH").click(p(10, 10)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(2)
    expect(pointInsideHatch(hatch, p(10, 10))).toBe(true)
    expect(pointInsideHatch(hatch, p(50, 50))).toBe(false)
  })

  it("makes one hatch out of several internal points (p158)", () => {
    const h = createHarness({
      entities: [...looseSquare(0, 100), ...looseSquare(200, 300)],
    })
    h.command("HATCH").click(p(50, 50)).click(p(250, 250)).enter()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("takes a typed coordinate as the internal point", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").type("50,50").enter().enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(1)
  })

  it("says so when the point is not enclosed, and keeps prompting", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(300, 300))

    expect(h.commandLog()).toContain("Valid hatch boundary not found.")
    expect(h.activeToolId()).toBe("hatch")
    expect(h.typeCounts().hatch).toBeUndefined()
  })

  it("only traces what is visible, as AutoCAD's boundary set does (p146)", () => {
    // The default 1000×800 viewport shows x/y within ±500/±400 at scale 1.
    const h = createHarness({ entities: looseSquare(2000, 2100) })
    h.command("HATCH").click(p(2050, 2050))

    expect(h.commandLog()).toContain("Valid hatch boundary not found.")
  })

  it("ends without creating anything when nothing was picked (p100)", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })

  it("undoes the whole hatch in one step", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(50, 50)).enter()
    h.undo()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.typeCounts().line).toBe(4)
  })
})

// -HATCH declares Undo at its internal point (table 25032) without listing it;
// 2027's console takes it so (probes hatch/p103, p104, p106, p107, p124, p162,
// p164).
describe("HATCH's unlisted Undo", () => {
  const SMALL = rectOf(p(200, 0), p(250, 50), { id: "small" })
  const filled = (h: ReturnType<typeof createHarness>) => {
    const hatch = hatchOnly(h.entities())
    return [p(50, 50), p(225, 25)].map((at) => pointInsideHatch(hatch, at))
  }

  it("takes back the last internal point's boundary, silently (p104, p162)", () => {
    const h = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      "50,50",
      "225,25",
      "U"
    )
    expect(h.commandLog().slice(-2)).toEqual([
      "Specify internal point or [Properties/Select objects]: U",
      "Current hatch pattern:  ANGLE",
    ])
    typed(h, "UNDO", "U")
    expect(h.commandLog().slice(-3)).toEqual([
      "Specify internal point or [Properties/Select objects]: U",
      "No boundary to Undo.",
      "Current hatch pattern:  ANGLE",
    ])
    typed(h, "225,25", "")
    expect(filled(h)).toEqual([false, true])
  })

  it("leaves what Select objects took (p106, p107, p164)", () => {
    const window = ["S", "W", "190,-10", "260,60", ""]
    const picked = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      "50,50",
      ...window,
      "U",
      ""
    )
    expect(filled(picked)).toEqual([false, true])

    const selected = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      ...window,
      "U"
    )
    expect(selected.commandLog().at(-2)).toBe("No boundary to Undo.")
    typed(selected, "")
    expect(filled(selected)).toEqual([false, true])
  })

  it("refuses anything else, and is answered in Autodesk's Spanish (p101, p124)", () => {
    const h = typed(createHarness({ entities: [SQUARE] }), "HATCH", "FOO")
    expect(h.commandLog().slice(-2)).toEqual([
      "Specify internal point or [Properties/Select objects]: FOO",
      "2D point or option keyword required.",
    ])

    const spanish = typed(
      createHarness({ locale: es, entities: [SQUARE, SMALL] }),
      "SOMBREA",
      "50,50",
      "H",
      "DESHACER",
      "FOO"
    )
    expect(spanish.commandLog().slice(-5)).toEqual([
      "Precise punto interno o [Propiedades/Designar objetos]: DESHACER",
      "Ningún contorno por deshacer.",
      "Patrón de sombreado actual:  ANGLE",
      "Precise punto interno o [Propiedades/Designar objetos]: FOO",
      "Se requiere un punto 2D o una opción.",
    ])
  })
})

/** The rectangle of the internal point's probes, hatch/p100–p168. */
const ROOM = rectOf(p(0, 0), p(100, 50), { id: "room" })
const PROMPT = "Specify internal point or [Properties/Select objects]:"

/** The lines `texts`, typed and confirmed one by one, add to the history. */
function written(h: ReturnType<typeof createHarness>, ...texts: string[]) {
  const from = h.commandLog().length
  typed(h, ...texts)
  return h.commandLog().slice(from)
}

/** LASTPOINT, as `ID @` reports it at the console's LUPREC 4. */
function lastPointOf(h: ReturnType<typeof createHarness>): Vec2 {
  h.runtime.setDocumentPrecision(4)
  const line = written(h, "ID", "@").at(-1) ?? ""
  const match = /X = (\S+)\s+Y = (\S+)/.exec(line)
  expect(match).not.toBeNull()
  return { x: Number(match![1]), y: Number(match![2]) }
}

describe("HATCH's internal point against AutoCAD 2027 (probes hatch/p100–p168)", () => {
  it("gathers the boundary set once per run, and analyses islands only for an area found (p104, p119, p144)", () => {
    const h = typed(
      createHarness({ entities: [ROOM, rectOf(p(200, 0), p(300, 50))] }),
      "HATCH"
    )
    expect(written(h, "150,25")).toEqual([
      `${PROMPT} 150,25`,
      "Selecting everything...",
      "Selecting everything visible...",
      "Analyzing the selected data...",
      "Valid hatch boundary not found.",
      "Current hatch pattern:  ANGLE",
    ])
    expect(written(h, "50,25")).toEqual([
      `${PROMPT} 50,25`,
      "Analyzing internal islands...",
      "Current hatch pattern:  ANGLE",
    ])
    // Not gathered again after Undo took every point back (p104).
    typed(h, "U")
    expect(written(h, "250,25")).toEqual([
      `${PROMPT} 250,25`,
      "Analyzing internal islands...",
      "Current hatch pattern:  ANGLE",
    ])
  })

  it("says an area picked twice is specified already, and gathers nothing (p157)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "HATCH", "50,25")
    expect(written(h, "60,30")).toEqual([
      `${PROMPT} 60,30`,
      "This area has already been specified.",
      "Current hatch pattern:  ANGLE",
    ])
    typed(h, "")
    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(pointInsideHatch(hatch, p(50, 25))).toBe(true)
    expect(hatchGeometry(hatch).lines.length).toBeGreaterThan(0)

    const spanish = typed(
      createHarness({ locale: es, entities: [ROOM] }),
      "SOMBREA",
      "50,25",
      "60,30"
    )
    expect(spanish.commandLog()).toContain("Esta área ya se ha especificado.")
  })

  it("takes a click in an island of an area picked as a new area (HATCH-D1: even-odd)", () => {
    const h = createHarness({ entities: [ROOM, rectOf(p(40, 10), p(60, 40))] })
    h.command("HATCH").click(p(10, 10)).click(p(50, 25)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(3)
  })

  it("refuses a point on an object, after the gathering lines (p143, p122)", () => {
    const h = typed(
      createHarness({ entities: [ROOM, rectOf(p(100, 0), p(300, 50))] }),
      "HATCH"
    )
    expect(written(h, "100,25")).toEqual([
      `${PROMPT} 100,25`,
      "Selecting everything...",
      "Selecting everything visible...",
      "Analyzing the selected data...",
      "Point is directly on an object.",
      "Current hatch pattern:  ANGLE",
    ])
    typed(h, "")
    expect(h.typeCounts().hatch).toBeUndefined()

    const spanish = typed(
      createHarness({ locale: es, entities: [ROOM] }),
      "SOMBREA",
      "100,25"
    )
    expect(spanish.commandLog()).toContain(
      "El punto está directamente sobre un objeto."
    )
  })

  it("honours a typed object snap override (p120)", () => {
    const h = typed(
      createHarness({
        entities: [
          ROOM,
          rectOf(p(100, 0), p(300, 50)),
          lineOf(p(50, 10), p(99.5, 10)),
        ],
      }),
      "HATCH",
      "_END",
      "100.5,10"
    )
    expect(h.commandLog()).toContain("Point is directly on an object.")
    typed(h, "")
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(lastPointOf(h)).toBeCloseToPoint(p(99.5, 10))
  })

  it("leaves the running snaps off a click (desktop d09)", () => {
    const h = createHarness({ entities: [ROOM], snap: true })
    h.command("HATCH").click(p(98, 48)).enter()

    expect(h.typeCounts().hatch).toBe(1)
  })

  it("reads a bare number as direct distance from LASTPOINT (p102, p117)", () => {
    const zero = typed(createHarness({ entities: [ROOM] }), "ID", "10,10")
    typed(zero, "HATCH", "0", "")
    expect(zero.typeCounts().hatch).toBe(1)
    expect(lastPointOf(zero)).toBeCloseToPoint(p(10, 10))

    const ten = typed(createHarness({ entities: [ROOM] }), "ID", "50,25")
    // Where the console's cursor stood: 10 from 50,25 lands on 41.2971,20.0745.
    ten.moveTo(p(50 - 87.029, 25 - 49.255))
    typed(ten, "HATCH", "10", "")
    expect(ten.typeCounts().hatch).toBe(1)
    expect(lastPointOf(ten)).toBeCloseToPoint(p(41.2971, 20.0745), 3)
  })

  it("leaves a TEXT and an MTEXT in the area clear (p166, p134)", () => {
    const h = createHarness({
      entities: [
        rectOf(p(0, 0), p(200, 100)),
        textOf(p(20, 45), "ABC", { height: 10 }),
        createMText(p(120, 60), "ABC", { width: 60 }),
      ],
    })
    h.command("HATCH").click(p(10, 10)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(3)
    expect(pointInsideHatch(hatch, p(35, 50))).toBe(false)
    expect(pointInsideHatch(hatch, p(123, 58))).toBe(false)
    expect(pointInsideHatch(hatch, p(10, 10))).toBe(true)
  })

  it("leaves a TEXT that Select objects took with the boundary clear (p228)", () => {
    const h = createHarness({
      entities: [ROOM, textOf(p(10, 10), "ABC", { height: 5 })],
    })
    typed(h, "HATCH", "S", "ALL", "", "")

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(2)
    expect(pointInsideHatch(hatch, p(12, 12))).toBe(false)
  })

  it("reads the point forms the console reads (p110–p116)", () => {
    const hatched = (...texts: string[]) => {
      const h = typed(createHarness({ entities: [ROOM] }), ...texts, "")
      return h.typeCounts().hatch ?? 0
    }
    const refused = (text: string, ...before: string[]) => {
      const h = typed(createHarness({ entities: [ROOM] }), ...before, "HATCH")
      return written(h, text).at(-1)
    }
    expect(refused("50,25,7")).toBe("2D point or option keyword required.")
    expect(hatched("ID", "10,10", "HATCH", "@40,15")).toBe(1)
    expect(hatched("ID", "50,25", "HATCH", "@")).toBe(1)
    expect(hatched("HATCH", "30<20")).toBe(1)
    expect(refused("#50,25")).toBe("2D point or option keyword required.")
    expect(refused("*90,10", "UCS", "Z", "30")).toBe(
      "2D point or option keyword required."
    )
    const turned = typed(
      createHarness({ entities: [ROOM] }),
      "UCS",
      "Z",
      "30",
      "HATCH"
    )
    expect(written(turned, "90,10")).toContain(
      "Valid hatch boundary not found."
    )
  })

  it("sets LASTPOINT to the internal point (p111, p113, p118)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "ID", "7,7")
    typed(h, "HATCH", "50,25", "")
    expect(lastPointOf(h)).toBeCloseToPoint(p(50, 25))

    const polar = typed(
      createHarness({ entities: [ROOM] }),
      "HATCH",
      "30<20",
      ""
    )
    expect(lastPointOf(polar)).toBeCloseToPoint(p(28.1908, 10.2606), 3)

    const clicked = typed(createHarness({ entities: [ROOM] }), "ID", "7,7")
    clicked.command("HATCH").click(p(50, 25)).enter()
    expect(lastPointOf(clicked)).toBeCloseToPoint(p(50, 25))
  })

  it("traces an island on a locked layer, not one on a layer turned off (p151, p152)", () => {
    const traced = (patch: { visible?: boolean; locked?: boolean }) => {
      const h = createHarness()
      h.runtime.document.load(
        [ROOM, rectOf(p(40, 10), p(60, 40), { layerId: "F" })],
        { layers: [layerOf("F", patch)] }
      )
      typed(h, "HATCH", "10,10", "")
      return hatchOnly(h.entities()).loops.length
    }
    expect(traced({ visible: false })).toBe(1)
    expect(traced({ locked: true })).toBe(2)
  })

  it("does not take an existing hatch as a boundary (p159)", () => {
    const h = typed(
      createHarness({ entities: [ROOM] }),
      "HATCH",
      "50,25",
      "",
      "HATCH",
      "50,25",
      ""
    )
    const hatches = h.entities().filter((e) => e.type === "hatch")
    expect(hatches.map((e) => (e as HatchEntity).loops.length)).toEqual([1, 1])
  })

  it("traces circles, arcs and arc segments (p136, p137, p142)", () => {
    const area = (entities: Entity[], at: string) => {
      const h = typed(createHarness({ entities }), "HATCH", at, "")
      return objectArea(hatchOnly(h.entities()))?.area
    }
    expect(
      area(
        [arcOf(p(0, 0), 50, 0, Math.PI), lineOf(p(-60, 0), p(60, 0))],
        "0,20"
      )
    ).toBeCloseTo(3926.9908, 3)
    expect(area([circleOf(p(0, 0), 50)], "0,0")).toBeCloseTo(7853.9816, 3)
    expect(
      area(
        [
          polylineOf([p(0, 0), p(100, 0), p(100, 50), p(0, 50)], {
            closed: true,
            bulges: [0, 1, 0, 0],
          }),
        ],
        "50,25"
      )
    ).toBeCloseTo(5981.7477, 3)
  })

  it("is undone by one U, which echoes the name typed (p128, p160)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "HATCH", "50,25", "")
    expect(written(h, "U").at(-1)).toBe("HATCH")
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(written(h, "REDO")).toContain("HATCH")
    expect(h.typeCounts().hatch).toBe(1)

    const spanish = typed(
      createHarness({ locale: es, entities: [ROOM] }),
      "SOMBREA",
      "50,25",
      ""
    )
    expect(written(spanish, "H").at(-1)).toBe("SOMBREA")
  })
})

// Select objects against AutoCAD 2027's console (probes hatch/p222–p228,
// p245, p246; -hatch in erase/p222).
describe("HATCH boundary by Select objects", () => {
  it("fills one selected closed polyline with the default pattern (p00, p222)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(hatch.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
    // HPNAME / HPSCALE / HPANG initial values.
    expect(hatch.patternId).toBe(DEFAULT_HATCH_PATTERN_ID)
    expect(hatch.patternScale).toBe(1)
    expect(hatch.patternAngle).toBe(0)
    expect(h.activeToolId()).toBe("select")
  })

  it("turns a circle into a two-vertex loop of semicircle bulges", () => {
    const h = createHarness({ entities: [circleOf(p(0, 0), 50, { id: "c" })] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops[0].vertices).toBeCloseToPoints([p(50, 0), p(-50, 0)])
    expect(hatch.loops[0].bulges).toEqual([1, 1])
    // The ring closes: its extent is the whole circle, not just the top half.
    const ring = hatchGeometry(hatch).rings[0]
    const ys = ring.map((v) => v.y)
    expect(Math.min(...ys)).toBeCloseTo(-50, 1)
    expect(Math.max(...ys)).toBeCloseTo(50, 1)
  })

  it("makes one hatch out of several boundaries (HPSEPARATE 0)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Select objects")
      .click(p(50, 0))
      .click(p(250, 0))
      .enter()
      .enter()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("picks boundaries with a crossing box too", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Select objects")
      .drag(p(400, 50), p(-50, 50))
      .enter()
      .enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  // -hatch in erase/p222: Select objects finds an open line as it finds the
  // circle; tracing leaves it out.
  it("finds an object that closes no area, and leaves it out of the hatch", () => {
    const h = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        circleOf(p(250, 250), 10, { id: "C" }),
      ],
    })
    h.command("HATCH").option("Select objects")
    for (const text of ["50,0", "260,250"]) {
      h.runtime.setCommandLineText(text)
      h.runtime.submitCommandLine()
    }
    expect(h.commandLog().slice(-4)).toEqual([
      "Select objects: 50,0",
      "1 found",
      "Select objects: 260,250",
      "1 found, 2 total",
    ])
    h.enter().enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(1)
    expect(h.typeCounts().line).toBe(1)
  })

  it("makes nothing of objects that close no area, and says so (p223)", () => {
    const h = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    expect(h.commandLog().at(-1)).toBe("Unable to hatch the boundary.")
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })

  it("rolls over what Select objects finds, as any set prompt does", () => {
    const h = createHarness({
      entities: [SQUARE, lineOf(p(0, 200), p(100, 200), { id: "l" })],
    })
    h.command("HATCH").option("Select objects")
    const hovers = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.entityHover
      }).length

    h.moveTo(p(500, 500))
    expect(hovers()).toBe(0)
    h.moveTo(p(50, 200))
    expect(hovers()).toBe(1)
    h.moveTo(p(50, 0))
    expect(hovers()).toBe(1)
    // Not once it is in the set.
    h.click(p(50, 0))
    expect(hovers()).toBe(0)
  })

  // HATCH draws the hatch as objects are selected, -HATCH leaves them to glow
  // as the selection (desktop d01-2, d02-2).
  it("draws the hatch as the boundary set is built under HATCH, not under -HATCH", () => {
    const drawn = (name: string) => {
      const h = createHarness({ entities: [SQUARE] })
      h.moveTo(p(300, 300))
      typed(h, name, "S")
      const bare = segments(h)
      h.click(p(50, 0)).moveTo(p(300, 300))
      return segments(h) - bare
    }
    const hatch = createHatch([hatchLoopFromEntity(SQUARE)!])
    expect(drawn("HATCH")).toBe(hatchGeometry(hatch).lines.length)
    expect(drawn("-HATCH")).toBe(0)
  })

  it("stays behind its boundary (HPDRAWORDER 3), for the eye and for the pick", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("SOLID").enter()
    h.option("Select objects").click(p(50, 0)).enter().enter()

    // Painted first, so the fill never covers the outline it was traced from.
    const kinds = h.scene().primitives.map((prim) => prim.kind)
    expect(kinds.indexOf("path")).toBeLessThan(kinds.lastIndexOf("path"))
    const filled = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && prim.fill)
    const outline = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && !prim.fill)
    expect(filled).toBeLessThan(outline)

    // And a click on the boundary still takes the boundary, not the fill.
    h.click(p(50, 0))
    expect(h.selectedIds()).toEqual(["sq"])
  })

  it("lies on the current layer, not its boundary's (p246)", () => {
    const h = createHarness({ entities: [SQUARE] })
    const current = h.runtime.createLayer("L2", undefined, true)
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    expect(hatchOnly(h.entities()).layerId).toBe(current)
    expect(SQUARE.layerId).not.toBe(current)
  })

  it("undoes the whole hatch in one step", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()
    expect(h.typeCounts().hatch).toBe(1)

    h.undo()
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.typeCounts().polyline).toBe(1)
  })

  it("makes the hatch when Escape ends HATCH, nothing when it ends -HATCH (desktop d01-3, d02)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).escape()
    expect(h.typeCounts().hatch).toBe(1)
    expect(h.activeToolId()).toBe("select")

    const dash = typed(createHarness({ entities: [SQUARE] }), "-HATCH", "S")
    dash.click(p(50, 0)).escape()
    expect(dash.typeCounts().hatch).toBeUndefined()
  })
})

// Properties against AutoCAD 2027's console (probes hatch/p03, p206–p219,
// p263).
describe("HATCH Properties", () => {
  it("asks -HATCH's questions and writes them answered (p206, p208)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
    expect(h.commandLog().at(-1)).toBe("Current hatch pattern:  ANGLE")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify internal point or [Properties/Select objects]:"
    )
    h.option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Enter a pattern name or [?/Solid] <ANGLE>:"
    )
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify a scale for the pattern <1.0000>:"
    )
    h.type("0").enter().type("2").enter()
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify an angle for the pattern <0>:"
    )
    h.type("45").enter().click(p(50, 50))
    h.option("Select objects")
    expect(h.state().commandLine.prompt).toBe("HATCH Select objects:")
    h.enter().enter()

    expect(h.commandLog()).toEqual([
      "HATCH",
      "Current hatch pattern:  ANGLE",
      "Specify internal point or [Properties/Select objects]: P",
      "Enter a pattern name or [?/Solid] <ANGLE>:",
      "Specify a scale for the pattern <1.0000>: 0",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.0000>: 2",
      "Specify an angle for the pattern <0>: 45",
      "Current hatch pattern:  ANGLE",
      "Specify internal point or [Properties/Select objects]:",
      "Selecting everything...",
      "Selecting everything visible...",
      "Analyzing the selected data...",
      "Analyzing internal islands...",
      "Current hatch pattern:  ANGLE",
      "Specify internal point or [Properties/Select objects]: S",
      "Select objects:",
      "Current hatch pattern:  ANGLE",
      "Specify internal point or [Properties/Select objects]:",
    ])
    expect(hatchOnly(h.entities()).patternScale).toBe(2)
  })

  it("asks in the words of Autodesk's Spanish table (p206, p208 es-ES)", () => {
    const h = createHarness({ locale: es, entities: [SQUARE] })
    h.command("SOMBREA")
    expect(h.commandLog().at(-1)).toBe("Patrón de sombreado actual:  ANGLE")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise punto interno o [Propiedades/Designar objetos]:"
    )
    h.option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Indique nombre de patrón o [?/Sólido] <ANGLE>:"
    )
    h.type("NADA").enter()
    expect(h.commandLog().at(-1)).toBe("Nombre de patrón desconocido.")
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise escala del patrón <1.0000>:"
    )
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise ángulo del patrón <0>:"
    )
    h.enter().click(p(50, 50))
    expect(h.commandLog().slice(-5)).toEqual([
      "Seleccionándolo todo...",
      "Designando todo lo visible...",
      "Analizando los datos designados...",
      "Analizando islas internas...",
      "Patrón de sombreado actual:  ANGLE",
    ])
    h.option("Properties").option("Solid").option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Indique nombre de patrón o [?/Sólido] <Sólido>:"
    )
  })

  it("takes Solid by its keyword and offers it back as the keyword (p215, p263)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").option("Solid")
    h.command("HATCH").option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Enter a pattern name or [?/Solid] <Solid>:"
    )
  })

  it("skips the scale and angle prompts for a solid fill (p216)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("SOLID").enter()

    // Back at the internal point, its keywords offered again.
    expect(h.optionAbbreviations()).toEqual(["P", "S"])

    h.option("Select objects").click(p(50, 0)).enter().enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternId).toBe(SOLID_HATCH_PATTERN_ID)
    expect(hatchGeometry(hatch).solid).toBe(true)
  })

  it("asks for a scale then an angle for a real pattern (p208, p210)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("ANSI31").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify a scale for the pattern"
    )

    h.type("20").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify an angle for the pattern"
    )

    h.type("30").enter().option("Select objects").click(p(50, 0))
    h.enter().enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternScale).toBe(20)
    expect(hatch.patternAngle).toBeCloseToAngle(deg(30))
  })

  it("keeps the settings for the next hatch in the drawing (HPNAME/HPSCALE/HPANG, rectang/p303)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Properties")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("0")
      .enter()
      .option("Select objects")
      .click(p(50, 0))
      .enter()
      .enter()

    h.command("HATCH").option("Select objects").click(p(250, 0)).enter().enter()
    const hatches = h.entities().filter((e) => e.type === "hatch")
    expect(hatches).toHaveLength(2)
    expect((hatches[1] as HatchEntity).patternScale).toBe(20)
  })

  it("re-asks and reports an unknown pattern name (p03)", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("NOPE").enter()

    expect(h.commandLog().slice(-2)).toEqual([
      "Enter a pattern name or [?/Solid] <ANGLE>: NOPE",
      "Unknown pattern name.",
    ])
    expect(h.state().dynamicInput?.fields[0].label).toBe("Enter a pattern name")
  })
})

/** p221's `?` listing, the lines of the patterns shipped, in acadiso.pat's order. */
const LISTED = {
  en: [
    "SOLID           -  Solid fill",
    "ANGLE           - Angle steel",
    "ANSI31          - ANSI Iron, Brick, Stone masonry",
    "ANSI32          - ANSI Steel",
    "ANSI33          - ANSI Bronze, Brass, Copper",
    "ANSI34          - ANSI Plastic, Rubber",
    "ANSI35          - ANSI Fire brick, Refractory material",
    "ANSI36          - ANSI Marble, Slate, Glass",
    "ANSI37          - ANSI Lead, Zinc, Magnesium, Sound/Heat/Elec Insulation",
    "ANSI38          - ANSI Aluminum",
    "AR-CONC         -  random dot and stone pattern",
    "AR-SAND         -  random dot pattern",
    "BRICK           - Brick or masonry-type surface",
    "CROSS           - A series of crosses",
    "DASH            - Dashed lines",
    "DOTS            - A series of dots",
    "EARTH           - Earth or ground (subterranean)",
    "HONEY           - Honeycomb pattern",
    "LINE            - Parallel horizontal lines",
    "NET             - Horizontal / vertical grid",
    "NET3            - Network pattern 0-60-120",
    "SQUARE          - Small aligned squares",
    "STEEL           - Steel material",
    "ZIGZAG          - Staircase effect",
  ],
  es: [
    "SOLID           -  Relleno sólido",
    "ANGLE           -  acero angular",
    "ANSI31          -  ANSI albañilería de acero, ladrillo, piedra",
    "ANSI32          -  ANSI acero",
    "ANSI33          -  ANSI bronce, latón, cobre",
    "ANSI34          -  ANSI plástico, goma",
    "ANSI35          -  ANSI ladrillo o material refractario",
    "ANSI36          -  ANSI mármol, esquisto, vidrio",
    "ANSI37          -  ANSI plomo, cinc, magnesio, aislamiento térmico/fónico/eléct",
    "ANSI38          -  ANSI aluminio",
    "AR-CONC         -  patrón aleatorio de puntos y piedras",
    "AR-SAND         -  patrón aleatorio de puntos",
    "BRICK           - superficie de ladrillos o albañilería",
    "CROSS           - serie de cruces",
    "DASH            - líneas de trazos",
    "DOTS            - serie de puntos",
    "EARTH           - tierra o subsuelo",
    "HONEY           - panal",
    "LINE            - líneas paralelas horizontales",
    "NET             - rejilla",
    "NET3            - rejilla triangular 0-60-120",
    "SQUARE          -  pequeños cuadrados alineados",
    "STEEL           - acero",
    "ZIGZAG          - efecto de escalera",
  ],
}

const DASH_PROMPT =
  "-HATCH Specify internal point or [Properties/Select objects]:"

/** The segments of the scene: a pattern's lines, the crosshair's. */
function segments(h: ReturnType<typeof createHarness>): number {
  return h.scene().primitives.filter((prim) => prim.kind === "segment").length
}

/** The primitives drawn in `color`. */
function strokedIn(h: ReturnType<typeof createHarness>, color: string): number {
  return h.scene().primitives.filter((prim) => {
    const stroke = "stroke" in prim ? prim.stroke : undefined
    return stroke?.color === color
  }).length
}

// HATCH and -HATCH against AutoCAD 2027's console (probes hatch/p200–p263) and
// its desktop (d01: the ribbon's HATCH, d02: -HATCH).
describe("HATCH and -HATCH, the command", () => {
  it.each(["-HATCH", "-H", "-BH", "-BHATCH"])(
    "runs -HATCH as %s, its prompts headed with its name (p200, p201, p255)",
    (name) => {
      const h = typed(createHarness({ entities: [ROOM] }), name)
      expect(h.activeToolId()).toBe("hatch")
      expect(h.commandLog().at(-1)).toBe("Current hatch pattern:  ANGLE")
      expect(h.state().commandLine.prompt).toBe(DASH_PROMPT)
    }
  )

  it("runs HATCH as BHATCH (p255)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "BHATCH")
    expect(h.state().commandLine.prompt).toBe(`HATCH ${PROMPT}`)
  })

  it("runs -HATCH as -SOMBREA and SOMBREA as SB, SMB and -SMB in Spanish (p202)", () => {
    const prompt = (name: string) =>
      typed(createHarness({ locale: es, entities: [ROOM] }), name).state()
        .commandLine.prompt
    const asked = "Precise punto interno o [Propiedades/Designar objetos]:"
    expect(prompt("-SOMBREA")).toBe(`-SOMBREA ${asked}`)
    for (const name of ["SB", "SMB", "-SMB"]) {
      expect(prompt(name)).toBe(`SOMBREA ${asked}`)
    }
  })

  it("repeats by Enter under the name it ran as (p204)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", "")
    expect(written(h, "").slice(0, 2)).toEqual([
      "-HATCH",
      "Current hatch pattern:  ANGLE",
    ])
    expect(h.state().commandLine.prompt).toBe(DASH_PROMPT)
  })

  it("is not run transparently, by either name (p205)", () => {
    for (const name of ["'HATCH", "'-HATCH"]) {
      const h = typed(createHarness(), "LINE")
      expect(written(h, name)).toEqual([
        `Specify first point: ${name}`,
        "** That command may not be invoked transparently **",
        "Invalid point.",
      ])
    }
  })

  it("is one step U and REDO name as it ran, a run that made nothing too (p239, p240, p241, p247)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", "50,25", "")
    expect(written(h, "U")).toEqual(["U", "-HATCH"])
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(written(h, "REDO")).toEqual([
      "REDO",
      "-HATCH",
      "Everything has been redone",
    ])
    expect(h.typeCounts().hatch).toBe(1)

    typed(h, "-HATCH", "")
    expect(written(h, "U")).toEqual(["U", "-HATCH"])
    expect(h.typeCounts().hatch).toBe(1)

    typed(h, "LINE", "200,0", "300,0", "")
    expect(written(h, "UNDO", "2").at(-1)).toBe("LINE -HATCH")
    expect(h.typeCounts().hatch).toBeUndefined()
  })

  it("makes the boundaries gathered when Escape ends HATCH, in one step (desktop d01-3, HATCH-D45)", () => {
    const h = createHarness({ entities: [ROOM, rectOf(p(200, 0), p(300, 50))] })
    h.command("HATCH").click(p(50, 25)).option("Select objects")
    h.click(p(250, 0)).escape()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
    expect(h.activeToolId()).toBe("select")
    expect(written(h, "U")).toEqual(["U", "HATCH"])
    expect(h.typeCounts().hatch).toBeUndefined()

    // At a Properties prompt too, with the settings it had then.
    h.command("HATCH").click(p(50, 25)).option("Properties").escape()
    expect(h.typeCounts().hatch).toBe(1)
  })

  it("discards them when Escape ends -HATCH (desktop d02)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", "50,25")
    h.escape()
    expect(h.typeCounts().hatch).toBeUndefined()

    typed(h, "-HATCH", "S", "50,0")
    h.escape()
    expect(h.typeCounts().hatch).toBeUndefined()
  })

  it("previews the area under the cursor before a pick, as it will be made (desktop d01-1, d02-1)", () => {
    for (const name of ["HATCH", "-HATCH"]) {
      const h = createHarness({ entities: [ROOM] })
      h.moveTo(p(300, 300))
      typed(h, name)
      const bare = segments(h)
      h.moveTo(p(50, 25))
      const previewed = segments(h) - bare
      expect(previewed).toBeGreaterThan(0)
      expect(strokedIn(h, THEME.preview)).toBe(0)
      // Nothing outside an area, and the same area while inside it.
      h.moveTo(p(300, 300))
      expect(segments(h)).toBe(bare)
      h.moveTo(p(20, 10))
      expect(segments(h) - bare).toBe(previewed)

      // Preview equals commit: the lines previewed are the hatch's.
      h.click(p(20, 10))
      typed(h, "")
      expect(hatchGeometry(hatchOnly(h.entities())).lines).toHaveLength(
        previewed
      )
    }
  })

  it("draws the hatch picked under HATCH and only highlights its boundary under -HATCH (desktop d01-2, d02-2)", () => {
    const after = (name: string) => {
      const h = createHarness({ entities: [ROOM] })
      h.moveTo(p(300, 300))
      typed(h, name)
      const bare = segments(h)
      h.click(p(50, 25)).moveTo(p(300, 300))
      return {
        pattern: segments(h) - bare,
        highlighted: strokedIn(h, THEME.selected),
      }
    }
    const made = createHatch([hatchLoopFromEntity(ROOM)!])
    expect(after("HATCH")).toEqual({
      pattern: hatchGeometry(made).lines.length,
      highlighted: 1,
    })
    expect(after("-HATCH")).toEqual({ pattern: 0, highlighted: 1 })
  })

  it("takes HPNAME, HPSCALE and HPANG back with the run that set them, and keeps them past a cancel (p242, p243, p260)", () => {
    const asked = (h: ReturnType<typeof createHarness>) => {
      const prompts = [h.state().commandLine.prompt]
      typed(h, "")
      prompts.push(h.state().commandLine.prompt)
      typed(h, "")
      prompts.push(h.state().commandLine.prompt)
      return prompts
    }
    const set = ["-HATCH", "P", "ANSI31", "5", "30"]

    const nothing = typed(createHarness({ entities: [ROOM] }), ...set, "", "U")
    typed(nothing, "-HATCH", "P")
    expect(asked(nothing)).toEqual([
      "-HATCH Enter a pattern name or [?/Solid] <ANGLE>:",
      "-HATCH Specify a scale for the pattern <1.0000>:",
      "-HATCH Specify an angle for the pattern <0>:",
    ])

    const made = typed(
      createHarness({ entities: [ROOM] }),
      ...set,
      "50,25",
      "",
      "U"
    )
    expect(made.typeCounts().hatch).toBeUndefined()
    typed(made, "-HATCH", "P")
    expect(asked(made)[0]).toBe(
      "-HATCH Enter a pattern name or [?/Solid] <ANGLE>:"
    )

    const cancelled = typed(createHarness({ entities: [ROOM] }), ...set)
    cancelled.escape()
    typed(cancelled, "-HATCH", "P")
    expect(asked(cancelled)).toEqual([
      "-HATCH Enter a pattern name or [?/Solid] <ANSI31>:",
      "-HATCH Specify a scale for the pattern <5.0000>:",
      "-HATCH Specify an angle for the pattern <30>:",
    ])
  })

  it("lists the patterns at ? and goes back to the internal point (p212, p220, p221)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", "P")
    const lines = written(h, "?")
    expect(lines[0]).toBe("Enter a pattern name or [?/Solid] <ANGLE>: ?")
    expect(lines.slice(1, -1).join("\n")).toBe(LISTED.en.join("\n"))
    expect(lines.at(-1)).toBe("Current hatch pattern:  ANGLE")
    expect(h.state().commandLine.prompt).toBe(DASH_PROMPT)

    const spanish = typed(
      createHarness({ locale: es, entities: [ROOM] }),
      "-SOMBREA",
      "P"
    )
    expect(written(spanish, "?").slice(1, -1).join("\n")).toBe(
      LISTED.es.join("\n")
    )
  })

  it("takes the scale as a distance, by two points too, and refuses the rest (p208, p209)", () => {
    const h = typed(
      createHarness({ entities: [ROOM] }),
      "-HATCH",
      "P",
      "ANSI31"
    )
    expect(written(h, "0", "-2", "FOO")).toEqual([
      "Specify a scale for the pattern <1.0000>: 0",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.0000>: -2",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.0000>: FOO",
      "Requires a distance (or numberX).",
    ])
    expect(written(h, "0,0", "10,0")).toEqual([
      "Specify a scale for the pattern <1.0000>: 0,0",
      " Specify second point: 10,0",
    ])
    typed(h, "", "50,25", "")
    expect(hatchOnly(h.entities()).patternScale).toBeCloseTo(10)
  })

  it("writes the scale's default to four places whatever LUPREC (p259)", () => {
    const h = createHarness({ entities: [ROOM] })
    h.runtime.setDocumentPrecision(2)
    typed(h, "-HATCH", "P", "ANSI31")
    expect(h.state().commandLine.prompt).toBe(
      "-HATCH Specify a scale for the pattern <1.0000>:"
    )
  })

  it("takes the angle by two points and keeps a negative one as 0–360° (p210, p211, p262)", () => {
    const two = typed(
      createHarness({ entities: [ROOM] }),
      "-HATCH",
      "P",
      "ANSI31",
      ""
    )
    expect(written(two, "0,0", "10,10")).toEqual([
      "Specify an angle for the pattern <0>: 0,0",
      " Specify second point: 10,10",
      "Current hatch pattern:  ANSI31",
    ])

    const h = typed(
      createHarness({ entities: [ROOM] }),
      "-HATCH",
      "P",
      "ANSI31",
      ""
    )
    expect(written(h, "FOO").at(-1)).toBe(
      "Requires valid numeric angle or two points."
    )
    typed(h, "-30", "50,25", "", "-HATCH", "P", "", "")
    expect(h.state().commandLine.prompt).toBe(
      "-HATCH Specify an angle for the pattern <330>:"
    )
    expect(hatchOnly(h.entities()).patternAngle).toBeCloseToAngle(deg(330))
  })

  it("reads a pattern name in any case, and a leading _ as AutoCAD keeps it (p207, p215, p217, p244, p248, p254)", () => {
    const current = (...texts: string[]) =>
      typed(createHarness({ entities: [ROOM] }), "-HATCH", "P", ...texts)
        .commandLog()
        .at(-1)
    expect(current("ansi31", "", "")).toBe("Current hatch pattern:  ANSI31")
    expect(current("_ANSI31", "", "")).toBe("Current hatch pattern:  _ANSI31")
    expect(current("_LINE", "", "")).toBe("Current hatch pattern:  _LINE")
    expect(current("S")).toBe("Current hatch pattern:  SOLID")
    expect(current("_S")).toBe("Current hatch pattern:  _SOLID")

    const h = typed(
      createHarness({ entities: [ROOM] }),
      "-HATCH",
      "P",
      "_ANSI31",
      "",
      "",
      "50,25",
      ""
    )
    expect(hatchOnly(h.entities()).patternId).toBe("ANSI31")
    const solid = typed(
      createHarness({ entities: [ROOM] }),
      "-HATCH",
      "P",
      "_S",
      "50,25",
      ""
    )
    expect(hatchOnly(solid.entities()).patternId).toBe("SOLID")
  })

  it("runs a transparent command at each prompt, and refuses a command that is not one (p233–p238)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH")
    expect(written(h, "'ZOOM", "E").at(-1)).toBe("Resuming -HATCH command.")
    expect(written(h, "'LINE").slice(1)).toEqual([
      "** That command may not be invoked transparently **",
      "2D point or option keyword required.",
    ])

    typed(h, "P")
    expect(written(h, "'-PAN", "0,0", "1,1").at(-1)).toBe(
      "Resuming -HATCH command."
    )
    expect(written(h, "'LINE").slice(1)).toEqual([
      "** That command may not be invoked transparently **",
      "Unknown pattern name.",
    ])

    typed(h, "ANSI31")
    expect(written(h, "'-PAN", "0,0", "1,1").at(-1)).toBe(
      "Resuming -HATCH command."
    )
    expect(written(h, "'LINE").slice(1)).toEqual([
      "** That command may not be invoked transparently **",
      "Requires a distance (or numberX).",
    ])

    typed(h, "")
    expect(written(h, "'-PAN", "0,0", "1,1").at(-1)).toBe(
      "Resuming -HATCH command."
    )
    expect(written(h, "'LINE").slice(1)).toEqual([
      "** That command may not be invoked transparently **",
      "Requires valid numeric angle or two points.",
    ])

    typed(h, "", "S")
    expect(written(h, "'-PAN", "0,0", "1,1").at(-1)).toBe(
      "Resuming -HATCH command."
    )
    expect(written(h, "'LINE").slice(1, 3)).toEqual([
      "** That command may not be invoked transparently **",
      "*Invalid selection*",
    ])
  })

  it("reads another command's name typed mid-prompt as that prompt's answer (p244)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH")
    expect(written(h, "LINE").at(-1)).toBe(
      "2D point or option keyword required."
    )
    typed(h, "P")
    // A pattern's name: LINE is one.
    expect(written(h, "LINE")).toEqual([
      "Enter a pattern name or [?/Solid] <ANGLE>: LINE",
    ])
    expect(written(h, "LINE").at(-1)).toBe("Requires a distance (or numberX).")
    typed(h, "")
    expect(written(h, "LINE").at(-1)).toBe(
      "Requires valid numeric angle or two points."
    )
    typed(h, "")
    expect(h.commandLog().at(-1)).toBe("Current hatch pattern:  LINE")
  })
})

describe("HATCH's Select objects against AutoCAD 2027 (probes hatch/p222–p232, p256, p257)", () => {
  it("says it cannot hatch when what was found closes no area, and nothing for an empty set (p223, p226, p227, p224)", () => {
    for (const found of [
      lineOf(p(0, 80), p(100, 80)),
      textOf(p(10, 10), "ABC", { height: 5 }),
      createMText(p(10, 30), "ABC", { width: 40 }),
    ]) {
      const h = typed(
        createHarness({ entities: [found] }),
        "-HATCH",
        "S",
        "ALL",
        ""
      )
      expect(written(h, "")).toEqual([
        "Specify internal point or [Properties/Select objects]:",
        "Unable to hatch the boundary.",
      ])
      expect(h.typeCounts().hatch).toBeUndefined()
    }
    const spanish = typed(
      createHarness({ locale: es, entities: [lineOf(p(0, 80), p(100, 80))] }),
      "-SOMBREA",
      "D",
      "TODO",
      ""
    )
    expect(written(spanish, "").at(-1)).toBe("Imposible sombrear el contorno.")

    const empty = typed(createHarness({ entities: [ROOM] }), "-HATCH", "S", "")
    expect(written(empty, "")).toEqual([
      "Specify internal point or [Properties/Select objects]:",
    ])
  })

  it("takes a window (p225)", () => {
    const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", "S", "W")
    expect(written(h, "-10,-10", "110,60").slice(-2)).toEqual([
      "Specify opposite corner: 110,60",
      "1 found",
    ])
    typed(h, "", "")
    expect(hatchOnly(h.entities()).loops).toHaveLength(1)
  })

  it("leaves the Previous set as it was (p256, p257)", () => {
    for (const run of [["S", "50,0", ""], ["50,25"]]) {
      const h = typed(createHarness({ entities: [ROOM] }), "-HATCH", ...run, "")
      typed(h, "ERASE")
      expect(written(h, "P")).toEqual([
        "Select objects: P",
        "No previous selection set.",
      ])
    }
  })

  it("ignores and drops a set selected before it, and leaves nothing selected (p229–p232)", () => {
    const h = createHarness({ entities: [ROOM] })
    h.select("room")
    typed(h, "-HATCH")
    expect(h.selectedIds()).toEqual([])
    expect(h.commandLog().at(-1)).toBe("Current hatch pattern:  ANGLE")
    typed(h, "")
    expect(h.typeCounts().hatch).toBeUndefined()

    h.select("room")
    typed(h, "-HATCH", "S")
    expect(h.commandLog().at(-1)).toBe(`${PROMPT} S`)
    typed(h, "50,0", "", "")
    expect(h.selectedIds()).toEqual([])
    expect(h.typeCounts().hatch).toBe(1)
  })
})

/** Typed at the command line, one answer after another, as -HATCH is driven. */
function typed(h: ReturnType<typeof createHarness>, ...texts: string[]) {
  for (const text of texts) {
    h.runtime.setCommandLineText(text)
    h.runtime.submitCommandLine()
  }
  return h
}

/** The rectangle of probes hatch/p300–p316, 0,0 → 100,50. */
const RECT = [loopOf(p(0, 0), p(100, 50))]

/** AutoCAD's exploded lines of `probe` (`hatching.probes.ts`). */
function probed(probe: string): [Vec2, Vec2][] {
  const n = EXPLODED_LINES[probe]
  const lines: [Vec2, Vec2][] = []
  for (let i = 0; i < n.length; i += 4) {
    lines.push([p(n[i], n[i + 1]), p(n[i + 2], n[i + 3])])
  }
  return lines
}

/**
 * `hatch` generates the very lines AutoCAD's EXPLODE left of `probe`'s, one
 * for one, either way round, to the fixture's rounding.
 */
function expectProbedLines(hatch: HatchEntity, probe: string): void {
  const near = (a: Vec2, b: Vec2) =>
    Math.abs(a.x - b.x) < 2e-6 && Math.abs(a.y - b.y) < 2e-6
  const ours = [...hatchGeometry(hatch).lines]
  const theirs = probed(probe)
  expect(ours).toHaveLength(theirs.length)
  const missing = theirs.filter(([a, b]) => {
    const i = ours.findIndex(
      ([c, d]) => (near(a, c) && near(b, d)) || (near(a, d) && near(b, c))
    )
    if (i >= 0) ours.splice(i, 1)
    return i < 0
  })
  expect(missing).toEqual([])
}

describe("hatch pattern geometry (acadiso.pat, probes hatch/p300–p307)", () => {
  it("ships acadiso.pat's patterns and starts on ANGLE (HPNAME, p00)", () => {
    expect(DEFAULT_HATCH_PATTERN_ID).toBe("ANGLE")
    expect(HATCH_PATTERNS.map((pattern) => pattern.id)).toEqual([
      "SOLID",
      "ANGLE",
      ...["ANSI31", "ANSI32", "ANSI33", "ANSI34", "ANSI35", "ANSI36"],
      ...["ANSI37", "ANSI38", "AR-CONC", "AR-SAND", "BRICK", "CROSS"],
      ...["DASH", "DOTS", "EARTH", "HONEY", "LINE", "NET", "NET3"],
      ...["SQUARE", "STEEL", "ZIGZAG"],
    ])
    // The metric spacing, `45, 0, 0, 0, 3.175`, not acad.pat's 0.125.
    expect(hatchPattern("ANSI31")?.lines[0].deltaY).toBe(3.175)
  })

  it("draws ANSI31 at scale 1 as AutoCAD explodes it (p300: 34 lines)", () => {
    expectProbedLines(createHatch(RECT, { patternId: "ANSI31" }), "p300")
  })

  it("leaves out ANGLE's members lying on the boundary (p301: 217 lines)", () => {
    const hatch = createHatch(RECT)
    expect(hatch.patternId).toBe("ANGLE")
    expectProbedLines(hatch, "p301")
    // The dashes along y = 0 and x = 0 would be 23 more (HATCH-D68).
    for (const [a, b] of hatchGeometry(hatch).lines) {
      expect(a.y === 0 && b.y === 0).toBe(false)
      expect(a.x === 0 && b.x === 0).toBe(false)
    }
  })

  it("scales and turns the pattern about its origin (p302: ANSI31 2 / 30°)", () => {
    expectProbedLines(
      createHatch(RECT, {
        patternId: "ANSI31",
        patternScale: 2,
        patternAngle: deg(30),
      }),
      "p302"
    )
  })

  it("keeps the dash phase of a turned, scaled ANGLE (p307: ANGLE 2 / 30°)", () => {
    expectProbedLines(
      createHatch(RECT, { patternScale: 2, patternAngle: deg(30) }),
      "p307"
    )
  })

  it("starts the pattern at HPORIGIN (p306: 5,3)", () => {
    expectProbedLines(
      createHatch(RECT, { patternId: "ANSI31", origin: p(5, 3) }),
      "p306"
    )
  })

  it("starts the pattern at a moved UCS's origin (p303: UCS origin 10,7)", () => {
    const h = createHarness({ entities: [rectOf(p(0, 0), p(100, 50))] })
    typed(h, "UCS", "10,7", "")
    typed(h, "HATCH", "P", "ANSI31", "1", "0", "40,18", "")
    expectProbedLines(h.only<HatchEntity>("hatch"), "p303")
  })

  it("turns the pattern with a turned UCS (p304: UCS Z 30)", () => {
    const h = createHarness({ entities: [rectOf(p(0, 0), p(100, 50))] })
    typed(h, "UCS", "Z", "30")
    typed(h, "HATCH", "P", "ANSI31", "1", "0")
    h.click(p(50, 25)).enter()
    expectProbedLines(h.only<HatchEntity>("hatch"), "p304")
  })

  // HATCH-D62: DOTS is `0, 0,0, 0.79375,1.5875, 0,-1.5875`.
  it("generates a 0 dash as a dot, a segment from a point to itself", () => {
    const { lines } = hatchGeometry(
      createHatch([loopOf(p(0, 0), p(10, 10))], { patternId: "DOTS" })
    )
    expect(lines.length).toBeGreaterThan(20)
    for (const [a, b] of lines) expect(b).toBe(a)
    const at = (x: number, y: number) =>
      lines.some(([a]) => Math.abs(a.x - x) < 1e-9 && Math.abs(a.y - y) < 1e-9)
    expect(at(0.79375, 1.5875)).toBe(true)
    expect(at(2.38125, 1.5875)).toBe(true)
    expect(at(1.5875, 3.175)).toBe(true)
    // The row on y = 0 lies on the boundary (HATCH-D68).
    expect(lines.some(([a]) => a.y === 0)).toBe(false)
  })

  it("leaves an island unfilled (the even-odd rule)", () => {
    const { lines } = hatchGeometry(
      createHatch(
        [loopOf(p(0, 0), p(100, 100)), loopOf(p(40, 40), p(60, 60))],
        {
          patternId: "ANSI31",
        }
      )
    )
    expect(lines.length).toBeGreaterThan(0)
    for (const [a, b] of lines) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const point = V.lerp(a, b, t)
        const insideHole =
          point.x > 40 + 1e-6 &&
          point.x < 60 - 1e-6 &&
          point.y > 40 + 1e-6 &&
          point.y < 60 - 1e-6
        expect(insideHole).toBe(false)
      }
    }
  })

  it("reports a solid fill with no line work", () => {
    const g = hatchGeometry(
      createHatch([loopOf(p(0, 0), p(10, 10))], {
        patternId: SOLID_HATCH_PATTERN_ID,
      })
    )
    expect(g.solid).toBe(true)
    expect(g.lines).toHaveLength(0)
    expect(g.rings[0]).toHaveLength(4)
  })

  // HATCH-D69: MAX_HATCH_LINES is a safety cap, not HPMAXLINES (p363, p364);
  // ANSI31 at 0.0001 over 100 × 100 is 445 000 members, far past it.
  it("gives up past its safety cap instead of generating forever", () => {
    const g = hatchGeometry(
      createHatch([loopOf(p(0, 0), p(100, 100))], {
        patternId: "ANSI31",
        patternScale: 0.0001,
      })
    )
    expect(g.truncated).toBe(true)
    expect(g.lines.length).toBeLessThanOrEqual(MAX_HATCH_LINES + 1)
  })

  // Probe hatch/p305: the console's words, en and es (tables 20134, 20772).
  it("refuses to create a hatch that is too dense, and says so (p305)", () => {
    const tooDense = ["P", "ANSI31", "0.0001", "0", "50,25", ""]
    const h = typed(createHarness({ entities: [SQUARE] }), "HATCH", ...tooDense)
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.commandLog()).toContain(
      "Hatch spacing too dense, or dash size too small."
    )
    const es_ = typed(
      createHarness({ locale: es, entities: [SQUARE] }),
      "SOMBREA",
      ...tooDense
    )
    expect(es_.commandLog()).toContain(
      "Intervalo de sombreado demasiado denso o trazo demasiado pequeño."
    )
  })
})

/** The grips drawn on the selection, by shape, in the world, rounded. */
function drawnGrips(h: ReturnType<typeof createHarness>) {
  const grips = {
    round: [] as Vec2[],
    square: [] as Vec2[],
    segment: [] as Vec2[],
  }
  for (const prim of h.scene().primitives) {
    const fill = "fill" in prim ? prim.fill : undefined
    if (fill !== THEME.grip && fill !== THEME.gripHot) continue
    if (prim.kind === "circle") grips.round.push(prim.center)
    if (prim.kind === "rect") {
      grips.square.push({
        x: prim.min.x + prim.width / 2,
        y: prim.min.y + prim.height / 2,
      })
    }
    if (prim.kind === "path") {
      grips.segment.push(
        V.scale(
          prim.points.reduce((sum, point) => V.add(sum, point), p(0, 0)),
          1 / prim.points.length
        )
      )
    }
  }
  const world = (points: Vec2[]) =>
    points
      .map((screen) => h.runtime.viewport.screenToWorld(screen))
      .map((w) => [+w.x.toFixed(2) + 0, +w.y.toFixed(2) + 0])
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  return {
    round: world(grips.round),
    square: world(grips.square),
    segment: world(grips.segment),
  }
}

describe("hatch as an object", () => {
  /** p322–p327's hatch: ANSI31 at 10, 45° lines 31.75 apart through 0,0. */
  const pattern = () =>
    createHatch(RECT, { patternId: "ANSI31", patternScale: 10, id: "h" })
  const solid = () =>
    createHatch(RECT, { patternId: SOLID_HATCH_PATTERN_ID, id: "h" })
  /** p310–p313's hatch: ANSI31 at scale 1. */
  const ansi31 = () => createHatch(RECT, { patternId: "ANSI31", id: "h" })
  const boundary = () => rectOf(p(0, 0), p(100, 50), { id: "r" })

  // HATCH-D64, desktop hatch/d06-1 to d06-3, probes p322, p324.
  it("is picked on its pattern lines, never between them", () => {
    const h = createHarness({ entities: [boundary(), pattern()] })
    h.click(p(30, 10))
    expect(h.selectedIds()).toEqual([])
    // The click started a window (p324's `Specify opposite corner:`).
    h.escape()
    h.click(p(20, 20))
    expect(h.selectedIds()).toEqual(["h"])
  })

  // Probe hatch/p327: its boundary erased, a pick on that edge off the lines.
  it("is not picked on its boundary off its lines", () => {
    const h = createHarness({ entities: [pattern()] })
    h.click(p(78, 0))
    expect(h.selectedIds()).toEqual([])
  })

  // Desktop hatch/d06-5: the console's nil (p323) is its own artefact.
  it("is picked anywhere inside when SOLID", () => {
    const h = createHarness({ entities: [boundary(), solid()] })
    h.click(p(30, 10))
    expect(h.selectedIds()).toEqual(["h"])
  })

  // Probes hatch/p322, p326: a crossing between the lines finds nothing.
  it("is taken by a crossing only on its lines, a SOLID anywhere inside", () => {
    const crossing = ["ERASE", "C", "25,5", "35,15", ""]
    const between = typed(
      createHarness({ entities: [boundary(), pattern()] }),
      ...crossing
    )
    expect(between.entities().map((e) => e.id)).toEqual(["r", "h"])
    const filled = typed(
      createHarness({ entities: [boundary(), solid()] }),
      ...crossing
    )
    expect(filled.entities().map((e) => e.id)).toEqual(["r"])
  })

  it("is taken by a fence that crosses its lines, not one between them", () => {
    const fence = (...points: string[]) =>
      typed(
        createHarness({ entities: [pattern()] }),
        "ERASE",
        "F",
        ...points,
        "",
        ""
      ).entities()
    expect(fence("25,5", "35,5")).toHaveLength(1)
    expect(fence("10,5", "50,5")).toHaveLength(0)
  })

  it("moves with its pattern (p310: MOVE 0,0 → 10,5)", () => {
    const h = createHarness({ entities: [boundary(), ansi31()] })
    typed(h, "MOVE", "L", "", "0,0", "10,5")
    expectProbedLines(h.only<HatchEntity>("hatch"), "p310")
  })

  it("copies with its pattern (p311: COPY 0,0 → 10,5, 34 lines each)", () => {
    const h = createHarness({ entities: [boundary(), ansi31()] })
    typed(h, "COPY", "L", "", "0,0", "10,5", "")
    const [source, copy] = h
      .entities()
      .filter((e): e is HatchEntity => e.type === "hatch")
    expect(copy.id).not.toBe(source.id)
    // The copy is where MOVE put the hatch of p310, line for line.
    expectProbedLines(copy, "p310")
    expectProbedLines(source, "p300")
  })

  it("turns its pattern with it (p312: ROTATE 30 about 20,10)", () => {
    const h = createHarness({ entities: [boundary(), ansi31()] })
    typed(h, "ROTATE", "L", "", "20,10", "30")
    expectProbedLines(h.only<HatchEntity>("hatch"), "p312")
  })

  it("scales its pattern with it (p313: SCALE 2 about 20,10)", () => {
    const h = createHarness({ entities: [boundary(), ansi31()] })
    typed(h, "SCALE", "L", "", "20,10", "2")
    const scaled = h.only<HatchEntity>("hatch")
    expect(scaled.patternScale).toBe(2)
    expectProbedLines(scaled, "p313")
  })

  // HATCH-D65, MIRRHATCH 0: only the loops reflect; angle, origin and scale
  // are kept (probes p314, p316; p350–p354 the same with other axes).
  it("mirrors its boundary and keeps its pattern (p314, p316)", () => {
    const at30 = () =>
      createHatch(RECT, { patternId: "ANSI31", patternAngle: deg(30) })
    for (const [axis, probe] of [
      ["120,10", "p314"],
      ["10,10", "p316"],
    ]) {
      const from = probe === "p314" ? "120,0" : "0,0"
      const h = createHarness({ entities: [at30()] })
      typed(h, "MIRROR", "L", "", from, axis, "N")
      const copy = h.entities()[1] as HatchEntity
      expect(copy.patternAngle).toBeCloseToAngle(deg(30))
      expect(copy.origin).toBeCloseToPoint(p(0, 0))
      expectProbedLines(copy, probe)
    }
  })

  it("flips its bulges and keeps its pattern angle when mirrored in place", () => {
    const loop = hatchLoopFromEntity(circleOf(p(0, 0), 10))!
    const hatch = createHatch([loop], { patternAngle: deg(30) })
    const flipped = mirrorEntity(hatch, p(0, 0), p(1, 0)) as HatchEntity
    expect(flipped.loops[0].bulges).toEqual([-1, -1])
    expect(flipped.patternAngle).toBeCloseToAngle(deg(30))
    expect(flipped.origin).toBeCloseToPoint(p(0, 0))
  })

  it("survives a save and reload", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
      .option("Properties")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("30")
      .enter()
      .option("Select objects")
      .click(p(50, 0))
      .enter()
      .enter()

    const parsed = parseDrawingFile(h.runtime.serializeDrawing())
    const reloaded = hatchOnly(parsed.entities)
    expect(reloaded.patternId).toBe("ANSI31")
    expect(reloaded.patternScale).toBe(20)
    expect(reloaded.patternAngle).toBeCloseToAngle(deg(30))
    expect(reloaded.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
  })

  // HATCH-D72, desktop hatch/d03-1, d03-5, d04.
  it("shows a round centre grip, a square per vertex and one per edge's middle", () => {
    const h = createHarness({ entities: [pattern()] })
    h.click(p(20, 20)).moveTo(p(400, 400))
    expect(drawnGrips(h)).toEqual({
      // The extents' centre, not the centroid (d03-5).
      round: [[50, 25]],
      square: [
        [0, 0],
        [0, 50],
        [100, 0],
        [100, 50],
      ],
      // A thin rectangle along each edge, as a polyline's (d03-1).
      segment: [
        [0, 25],
        [50, 0],
        [50, 50],
        [100, 25],
      ],
    })
  })

  it("moves by its centre grip, pattern and all (d04)", () => {
    const h = createHarness({ entities: [pattern()] })
    h.click(p(20, 20)).click(p(50, 25)).click(p(50, 35))
    const moved = h.only<HatchEntity>("hatch")
    expect(moved.loops[0].vertices[0]).toBeCloseToPoint(p(0, 10))
    expect(moved.origin).toBeCloseToPoint(p(0, 10))
  })

  it("stretches a vertex and an edge of its boundary by their grips", () => {
    const h = createHarness({ entities: [pattern()] })
    h.click(p(20, 20)).click(p(100, 50)).click(p(120, 60))
    expect(h.only<HatchEntity>("hatch").loops[0].vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(120, 60),
      p(0, 50),
    ])
    h.escape().click(p(20, 20)).click(p(50, 0)).click(p(50, -10))
    const stretched = h.only<HatchEntity>("hatch")
    expect(stretched.loops[0].vertices).toBeCloseToPoints([
      p(0, -10),
      p(100, -10),
      p(120, 60),
      p(0, 50),
    ])
    expect(stretched.origin).toBeCloseToPoint(p(0, 0))
  })

  it("bends an arc segment of a loop by its middle grip, keeping the rest", () => {
    const loop = hatchLoopFromEntity(circleOf(p(0, 0), 50))!
    const h = createHarness({
      entities: [createHatch([loop], { patternId: SOLID_HATCH_PATTERN_ID })],
    })
    h.click(p(0, 0)).moveTo(p(400, 400))
    expect(drawnGrips(h).segment).toEqual([
      [0, -50],
      [0, 50],
    ])
    h.click(p(0, 50)).click(p(0, 25))
    const bent = h.only<HatchEntity>("hatch").loops[0]
    expect(bent.vertices).toBeCloseToPoints([p(50, 0), p(-50, 0)])
    expect(bent.bulges?.[0]).toBeCloseTo(0.5, 9)
    expect(bent.bulges?.[1]).toBe(1)
  })

  // HATCH-D73, desktop hatch/d05-1.
  it("lists AutoCAD's Pattern and Geometry rows in the palette", () => {
    const h = createHarness({
      entities: [createHatch([loopOf(p(0, 0), p(40, 40))], { id: "h" })],
    })
    h.select("h")
    const groups = h.state().properties.info?.groups ?? []
    expect(h.state().properties.info?.title).toBe("Hatch")
    expect(
      groups.map((group) => [
        group.title,
        group.rows.map((row) => [row.label, row.value]),
      ])
    ).toEqual([
      [
        "Pattern",
        [
          ["Type", "Predefined"],
          ["Pattern name", "ANGLE"],
          ["Annotative", "No"],
          ["Angle", "0°"],
          ["Scale", "1.00"],
          ["Origin X", "0.00"],
          ["Origin Y", "0.00"],
          ["Associative", "No"],
          ["Island detection style", "Outer"],
        ],
      ],
      [
        "Geometry",
        [
          ["Elevation", "0.00"],
          ["Area", "1600.00 mm²"],
          ["Cumulative Area", "1600.00 mm²"],
        ],
      ],
    ])
    const editable = groups
      .flatMap((group) => group.rows)
      .filter((row) => row.edit)
      .map((row) => row.edit?.property)
    expect(editable).toEqual([
      "patternAngle",
      "patternScale",
      "originX",
      "originY",
      "elevation",
    ])
    expect(h.runtime.setSelectionProperty("originX", "5")).toBe(true)
    expect(h.runtime.setSelectionProperty("originY", "3")).toBe(true)
    expect(h.only<HatchEntity>("hatch").origin).toBeCloseToPoint(p(5, 3))
  })

  it("reads its origin in the UCS, as the palette's other coordinates", () => {
    const h = createHarness({
      entities: [createHatch([loopOf(p(0, 0), p(40, 40))], { id: "h" })],
    })
    typed(h, "UCS", "10,7", "")
    h.select("h")
    const row = (label: string) =>
      h
        .state()
        .properties.info?.groups.flatMap((group) => group.rows)
        .find((r) => r.label === label)?.value
    expect([row("Origin X"), row("Origin Y")]).toEqual(["-10.00", "-7.00"])
    h.runtime.setSelectionProperty("originX", "0")
    expect(h.only<HatchEntity>("hatch").origin).toBeCloseToPoint(p(10, 0))
  })
})

describe("hatch in the scene", () => {
  /** Drawn red, to tell its segments from the grid's and the UCS icon's. */
  const RED = "#ff0000"
  const red = (hatch: HatchEntity): HatchEntity => ({ ...hatch, color: RED })
  const segments = (h: ReturnType<typeof createHarness>) =>
    h
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "segment" && prim.stroke.color === RED
      )

  it("draws a solid fill as one filled path with the islands as subpaths", () => {
    const h = createHarness({
      entities: [
        createHatch(
          [loopOf(p(0, 0), p(100, 100)), loopOf(p(40, 40), p(60, 60))],
          {
            patternId: SOLID_HATCH_PATTERN_ID,
          }
        ),
      ],
    })
    // Away from the fill: hovering it would add a rollover preview of the very
    // path being counted.
    h.moveTo(p(400, 400))
    const paths = h
      .scene()
      .primitives.filter((prim) => prim.kind === "path" && prim.fill)
    expect(paths).toHaveLength(1)
    expect(paths[0].kind === "path" && paths[0].subpaths).toHaveLength(1)
  })

  it("draws a pattern as its lines, one segment each, so nothing needs a clip", () => {
    const h = createHarness({
      entities: [red(createHatch(RECT, { patternId: "ANSI31" }))],
    })
    h.moveTo(p(400, 400))
    expect(segments(h)).toHaveLength(probed("p300").length)
    expect(
      h.scene().primitives.some((prim) => prim.kind === "path" && prim.fill)
    ).toBe(false)
  })

  // HATCH-D66, probe hatch/p340: a DASHED hatch plots its lines continuous,
  // in its colour and lineweight.
  it("draws its pattern lines continuous whatever its linetype", () => {
    const h = createHarness({
      entities: [
        {
          ...createHatch(RECT, { patternId: "ANSI31", patternScale: 10 }),
          color: RED,
          linetype: "Dashed",
          lineweight: 0.5,
        },
      ],
    })
    h.moveTo(p(400, 400))
    const drawn = segments(h)
    expect(drawn.length).toBeGreaterThan(0)
    for (const segment of drawn) {
      if (segment.kind !== "segment") continue
      expect(segment.stroke.dash).toBeUndefined()
      expect(segment.stroke.dashOffset).toBeUndefined()
      expect(segment.stroke.width).toBeGreaterThan(1)
    }
  })

  // HATCH-D67, probe hatch/p341: FILL off hides a SOLID and a pattern alike.
  it("draws nothing with FILL off", () => {
    const h = createHarness({
      entities: [
        red(createHatch(RECT, { patternId: SOLID_HATCH_PATTERN_ID })),
        red(
          createHatch([loopOf(p(120, 0), p(220, 100))], { patternId: "ANSI31" })
        ),
      ],
    })
    const filled = () =>
      h
        .scene()
        .primitives.filter((prim) => prim.kind === "path" && prim.fill === RED)
    h.moveTo(p(400, 400))
    expect([filled().length, segments(h).length > 0]).toEqual([1, true])
    typed(h, "FILL", "OFF")
    expect([filled().length, segments(h).length]).toEqual([0, 0])
  })

  // HATCH-D62: as a linetype's dot is drawn (`drawnDash`), a run as long as
  // the stroke is wide.
  it("draws a dot as a run as long as the stroke is wide", () => {
    const h = createHarness({
      entities: [
        red(createHatch([loopOf(p(0, 0), p(10, 10))], { patternId: "DOTS" })),
      ],
    })
    h.moveTo(p(400, 400))
    const drawn = segments(h)
    expect(drawn.length).toBeGreaterThan(20)
    for (const segment of drawn) {
      if (segment.kind !== "segment") continue
      expect(V.distance(segment.a, segment.b)).toBeCloseTo(
        Math.max(segment.stroke.width, 1),
        9
      )
    }
  })
})
