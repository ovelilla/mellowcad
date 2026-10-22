import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  arcSweepAngle,
  createBlockDefinition,
  createInsert,
  createMText,
  ellipseEndPoint,
  ellipseStartPoint,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
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
  textOf,
} from "../../../test/builders"
import { es } from "../../locales/es"
import { SnapType } from "../snapping/types"

/**
 * BREAK removes the piece of an object between two picked points;
 * BREAKATPOINT splits it in place. Both are one undo step, and a break that
 * leaves a single piece keeps the original object's id.
 */

describe("BREAK", () => {
  it("removes the piece between the two picks, leaving two lines", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "l1" })],
    })

    cad.command("BREAK").click(p(-50, 0)).click(p(50, 0))

    const lines = cad.entities() as LineEntity[]
    expect(lines).toHaveLength(2)
    expect(lines[0].start).toBeCloseToPoint(p(-200, 0))
    expect(lines[0].end).toBeCloseToPoint(p(-50, 0))
    expect(lines[1].start).toBeCloseToPoint(p(50, 0))
    expect(lines[1].end).toBeCloseToPoint(p(200, 0))
    expect(cad.activeToolId()).toBe("select")
  })

  it("shortens the object when the break runs off one end", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "l1" })],
    })

    cad.command("BREAK").click(p(0, 0)).click(p(400, 0))

    const line = cad.only<LineEntity>("line")
    expect(line.id).toBe("l1") // one surviving piece keeps the id
    expect(line.start).toBeCloseToPoint(p(-200, 0))
    expect(line.end).toBeCloseToPoint(p(0, 0))
  })

  it("pulls a second point that misses the object onto its nearest point", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAK").click(p(-50, 0)).click(p(50, -30))

    const lines = cad.entities() as LineEntity[]
    expect(lines[0].end).toBeCloseToPoint(p(-50, 0))
    expect(lines[1].start).toBeCloseToPoint(p(50, 0))
  })

  it("erases the object when the break spans all of it", () => {
    const cad = createHarness({ entities: [lineOf(p(-100, 0), p(100, 0))] })

    cad.command("BREAK").click(p(-100, 0)).click(p(400, 0))

    expect(cad.entityCount).toBe(0)
  })

  it("keeps the object's colour override on both pieces", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "l1" })],
    })
    cad.select("l1")
    cad.runtime.setSelectionColor("#ff0000")

    cad.command("BREAK").click(p(-50, 0)).click(p(50, 0))

    expect(cad.entities().map((entity) => entity.color)).toEqual([
      "#ff0000",
      "#ff0000",
    ])
  })

  it("undoes the whole break in one step", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "l1" })],
    })

    cad.command("BREAK").click(p(-50, 0)).click(p(50, 0))
    cad.undo()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(-200, 0))
    expect(line.end).toBeCloseToPoint(p(200, 0))
  })

  // AutoCAD 2027's console, en-US and es-ES (probes pieces/p100, p117,
  // p150, p171).
  it("asks AutoCAD's questions and writes them with their answers", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAK")
    expect(cad.state().commandLine.prompt).toBe("BREAK Select object:")
    cad.click(p(0, 100))
    expect(cad.commandLog().at(-1)).toBe("No object found")
    cad.click(p(-50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "BREAK Specify second break point or [First point]:"
    )
    cad.option("First point")
    expect(cad.state().commandLine.prompt).toBe(
      "BREAK Specify first break point:"
    )
    cad.click(p(20, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "BREAK Specify second break point:"
    )
    expect(cad.optionIds()).toEqual([])
    // Absolute in the box, not from the first point (desktop pieces/d10-2).
    cad.type("100,0").enter()

    expect(cad.commandLog()).toEqual([
      "BREAK",
      "Select object:",
      "No object found",
      "Select object:",
      "Specify second break point or [First point]: F",
      "Specify first break point:",
      "Specify second break point: 100,0",
    ])
    const lines = cad.entities() as LineEntity[]
    expect(lines[1].start).toBeCloseToPoint(p(100, 0))
  })

  it("splits at the first point with @ at the second", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAK").click(p(-50, 0)).type("@").enter()

    const lines = cad.entities() as LineEntity[]
    expect(lines).toHaveLength(2)
    expect(lines[0].end).toBeCloseToPoint(p(-50, 0))
    expect(lines[1].start).toBeCloseToPoint(p(-50, 0))
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("PARTE")
    expect(cad.state().commandLine.prompt).toBe("PARTE Designe objeto:")
    cad.click(p(0, 100))
    expect(cad.commandLog().at(-1)).toBe("No se ha encontrado ningún objeto")
    cad.click(p(-50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "PARTE Precise segundo punto de ruptura o [Primer punto]:"
    )
    cad.option("First point")
    expect(cad.state().commandLine.prompt).toBe(
      "PARTE Precise primer punto de ruptura:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "PARTE Precise segundo punto de ruptura:"
    )
    cad.escape().command("PARTIRENPUNTO").click(p(-50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "PARTIRENPUNTO Especifique el punto de interrupción:"
    )
    // pieces/p140: P, the alias, in AutoCAD 2027's Spanish console.
    answer(cad.escape(), "P")
    expect(cad.state().commandLine.prompt).toBe("PARTE Designe objeto:")
  })

  it("re-specifies the first point with the First point keyword", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAK").click(p(-50, 0))
    expect(cad.optionAbbreviations()).toEqual(["F"])

    cad.option("First point").click(p(0, 0)).click(p(100, 0))

    const lines = cad.entities() as LineEntity[]
    expect(lines[0].end).toBeCloseToPoint(p(0, 0))
    expect(lines[1].start).toBeCloseToPoint(p(100, 0))
  })

  it("turns a circle into the arc that survives the cut", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 100, { id: "c1" })],
    })

    // Counter-clockwise from the first pick to the second is what goes away,
    // so picking east then north removes the north-east quadrant.
    cad.command("BREAK").click(p(100, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.id).toBe("c1")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(deg(0))
    expect(arcSweepAngle(arc)).toBeCloseTo(deg(270))
  })

  it("breaks an arc into two arcs", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, deg(0), deg(180))],
    })

    cad.command("BREAK").click(p(70.71, 70.71)).click(p(-70.71, 70.71))

    const arcs = cad.entities() as ArcEntity[]
    expect(arcs).toHaveLength(2)
    expect(arcSweepAngle(arcs[0])).toBeCloseTo(deg(45))
    expect(arcSweepAngle(arcs[1])).toBeCloseTo(deg(45))
  })

  // AutoCAD 2023's console (acc/hd9–hd13, hd16–hd18): the piece from the
  // object's start is the object kept — its handle, its place —, the other
  // is new and Last finds it; U puts the object back whole.
  it("keeps the object as the piece from its start, the other new", () => {
    for (const [start, end, second, kept, added] of [
      [p(0, 0), p(100, 0), "70,0", [p(0, 0), p(50, 0)], [p(70, 0), p(100, 0)]],
      [p(0, 0), p(100, 0), "@", [p(0, 0), p(50, 0)], [p(50, 0), p(100, 0)]],
      [p(100, 0), p(0, 0), "70,0", [p(100, 0), p(70, 0)], [p(50, 0), p(0, 0)]],
    ] as const) {
      const cad = createHarness({
        entities: [
          lineOf(start, end, { id: "l1" }),
          lineOf(p(0, 50), p(100, 50), { id: "l2" }),
        ],
      })
      cad.command("BREAK").click(p(50, 0))
      cad.runtime.setCommandLineText(second)
      cad.runtime.submitCommandLine()
      const [line, , piece] = cad.entities() as LineEntity[]
      expect(cad.entities().map((entity) => entity.id)).toEqual([
        "l1",
        "l2",
        piece.id,
      ])
      expect([line.start, line.end]).toBeCloseToPoints(kept)
      expect([piece.start, piece.end]).toBeCloseToPoints(added)

      for (const text of ["ERASE", "L", ""]) {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
      expect(cad.entities().map((entity) => entity.id)).toEqual(["l1", "l2"])
      cad.undo().undo()
      expect(cad.entities()).toHaveLength(2)
      expect(cad.entities()[0]).toMatchObject({ id: "l1", start, end })
    }

    const cad = createHarness({
      entities: [arcOf(p(0, 0), 50, deg(0), deg(180), { id: "a1" })],
    })
    cad.command("BREAK").click(p(0, 50))
    cad.runtime.setCommandLineText("@")
    cad.runtime.submitCommandLine()
    const [kept, other] = cad.entities() as ArcEntity[]
    expect(kept).toMatchObject({ id: "a1", startAngle: 0 })
    expect(kept.endAngle).toBeCloseToAngle(deg(90))
    expect(other.startAngle).toBeCloseToAngle(deg(90))
    expect(other.endAngle).toBeCloseToAngle(deg(180))
  })

  it("refuses to split a circle in place, as AutoCAD says", () => {
    for (const [locale, command, atPoint, refusal] of [
      [undefined, "BREAK", "BREAKATPOINT", "Arc cannot be full 360 degrees"],
      [es, "PARTE", "PARTIRENPUNTO", "Un arco no puede tener 360 grados"],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [circleOf(p(0, 0), 50, { id: "c1" })],
      })
      answer(cad, command, "50,0", "@")
      expect(cad.commandLog().at(-1)).toBe(refusal)
      answer(cad, atPoint, "50,0", "50,0")
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.only<CircleEntity>("circle").id).toBe("c1")
      expect(cad.activeToolId()).toBe("select")
    }
  })
})

/** Each answer typed at the command line and confirmed. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The polylines left, in drawing order, their vertices to four places. */
function pieces(cad: CadHarness): { id: string; vertices: string }[] {
  const round = (value: number) => Math.round(value * 1e4) / 1e4
  return (cad.entities() as PolylineEntity[]).map((poly) => ({
    id: poly.id,
    vertices: poly.vertices.map((v) => round(v.x) + "," + round(v.y)).join(" "),
  }))
}

const SQUARE = [p(0, 0), p(100, 0), p(100, 100), p(0, 100)]

// AutoCAD 2023's console's LIST after each break (acc/pb1–pb11, pc1–pc12,
// pa1–pa4, pk1–pk9): the piece from the polyline's start keeps its handle.
describe("BREAK of a polyline", () => {
  it("keeps what lies before and after on an open one, the first piece the object", () => {
    for (const [first, second, kept, added] of [
      ["20,0", "60,0", "0,0 20,0", "60,0 100,0 100,100 0,100"],
      ["50,0", "50,100", "0,0 50,0", "50,100 0,100"],
      ["50,100", "50,0", "0,0 50,0", "50,100 0,100"],
      ["100,0", "100,50", "0,0 100,0", "100,50 100,100 0,100"],
      ["0,0", "50,0", "50,0 100,0 100,100 0,100", null],
      ["50,100", "0,100", "0,0 100,0 100,100 50,100", null],
      ["100,0", "@", "0,0 100,0", "100,0 100,100 0,100"],
      ["50,0", "@", "0,0 50,0", "50,0 100,0 100,100 0,100"],
      ["0,0", "@", "0,0 100,0 100,100 0,100", null],
      ["0,100", "@", "0,0 100,0 100,100 0,100", null],
    ] as const) {
      const cad = createHarness({ entities: [polylineOf(SQUARE, { id: "P" })] })
      answer(cad, "BREAK", first, second)
      const left = pieces(cad)
      expect(left[0]).toEqual({ id: "P", vertices: kept })
      expect(left.slice(1).map((piece) => piece.vertices)).toEqual(
        added ? [added] : []
      )
    }

    const whole = createHarness({ entities: [polylineOf(SQUARE)] })
    answer(whole, "BREAK", "0,0", "0,100")
    expect(whole.entityCount).toBe(0)
  })

  it("keeps a closed one open from the later point round to the earlier", () => {
    const cw = [p(0, 0), p(0, 100), p(100, 100), p(100, 0)]
    for (const [shape, first, second, kept, added] of [
      [SQUARE, "50,0", "100,50", "100,50 100,100 0,100 0,0 50,0", null],
      [SQUARE, "100,50", "50,0", "100,50 100,100 0,100 0,0 50,0", null],
      [SQUARE, "50,0", "50,100", "50,100 0,100 0,0 50,0", null],
      [SQUARE, "0,50", "50,0", "0,50 0,0 50,0", null],
      [cw, "50,0", "100,50", "50,0 0,0 0,100 100,100 100,50", null],
      [cw, "100,50", "50,0", "50,0 0,0 0,100 100,100 100,50", null],
      [SQUARE, "100,0", "100,50", "100,50 100,100 0,100 0,0 100,0", null],
      [SQUARE, "0,0", "100,50", "100,50 100,100 0,100 0,0", null],
      [SQUARE, "50,0", "@", "0,0 50,0", "50,0 100,0 100,100 0,100 0,0"],
      [SQUARE, "100,0", "@", "0,0 100,0", "100,0 100,100 0,100 0,0"],
    ] as const) {
      const cad = createHarness({
        entities: [polylineOf(shape, { id: "P", closed: true })],
      })
      answer(cad, "BREAK", first, second)
      const left = pieces(cad)
      expect(left[0]).toEqual({ id: "P", vertices: kept })
      expect(left.slice(1).map((piece) => piece.vertices)).toEqual(
        added ? [added] : []
      )
      const closed = (cad.entities() as PolylineEntity[]).map(
        (poly) => poly.closed
      )
      expect(closed).not.toContain(true)
    }

    const atStart = createHarness({
      entities: [polylineOf(SQUARE, { id: "P", closed: true })],
    })
    answer(atStart, "BREAK", "0,0", "@")
    expect(atStart.only<PolylineEntity>("polyline")).toMatchObject({
      id: "P",
      closed: true,
    })
  })

  it("cuts an arc segment on its own circle", () => {
    // 0,0 → 100,0, a half circle bulging east to 100,100, → 0,100.
    for (const [first, second, kept, keptBulges, added, addedBulges] of [
      [
        "150,50",
        "135.3553,85.3553",
        "0,0 100,0 150,50",
        [0, 0.4142],
        "135.3553,85.3553 100,100 0,100",
        [0.1989, 0],
      ],
      ["50,0", "150,50", "0,0 50,0", [0], "150,50 100,100 0,100", [0.4142, 0]],
      [
        "150,50",
        "@",
        "0,0 100,0 150,50",
        [0, 0.4142],
        "150,50 100,100 0,100",
        [0.4142, 0],
      ],
    ] as const) {
      const cad = createHarness({
        entities: [polylineOf(SQUARE, { id: "P", bulges: [0, 1, 0] })],
      })
      answer(cad, "BREAK", first, second)
      const [poly, piece] = cad.entities() as PolylineEntity[]
      expect(pieces(cad).map((left) => left.vertices)).toEqual([kept, added])
      const bulges = (line: PolylineEntity) =>
        line.vertices
          .slice(1)
          .map((_, i) => Math.round((line.bulges?.[i] ?? 0) * 1e4) / 1e4)
      expect(poly.id).toBe("P")
      expect(bulges(poly)).toEqual(keptBulges)
      expect(bulges(piece)).toEqual(addedBulges)
    }
  })

  it("leaves the new piece Last, and U puts the polyline back whole", () => {
    const cad = createHarness({ entities: [polylineOf(SQUARE, { id: "P" })] })
    answer(cad, "BREAK", "50,0", "50,100", "ERASE", "L", "")
    expect(pieces(cad)).toEqual([{ id: "P", vertices: "0,0 50,0" }])
    cad.undo().undo()
    expect(pieces(cad)).toEqual([
      { id: "P", vertices: "0,0 100,0 100,100 0,100" },
    ])

    // One piece left: it is the polyline, and Last finds it (pk9).
    const closed = createHarness({
      entities: [polylineOf(SQUARE, { id: "P", closed: true })],
    })
    answer(closed, "BREAK", "50,0", "100,50", "ERASE", "L", "")
    expect(closed.entityCount).toBe(0)
  })

  it("splits it at BREAKATPOINT's point, a closed one at its start too", () => {
    for (const [locale, command, closed, at, kept, added] of [
      [
        undefined,
        "BREAKATPOINT",
        false,
        "50,0",
        "0,0 50,0",
        "50,0 100,0 100,100 0,100",
      ],
      [es, "PARTIRENPUNTO", false, "100,0", "0,0 100,0", "100,0 100,100 0,100"],
      [
        undefined,
        "BREAKATPOINT",
        true,
        "50,0",
        "0,0 50,0",
        "50,0 100,0 100,100 0,100 0,0",
      ],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [polylineOf(SQUARE, { id: "P", closed })],
      })
      answer(cad, command, at, at)
      expect(pieces(cad)).toEqual([
        { id: "P", vertices: kept },
        { id: expect.any(String), vertices: added },
      ])
      cad.undo()
      expect(cad.only<PolylineEntity>("polyline")).toMatchObject({ closed })
    }
  })

  it("is asked in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [polylineOf(SQUARE, { id: "P" })],
    })
    answer(cad, "PARTE", "20,0", "60,0")
    expect(cad.commandLog()).toEqual([
      "PARTE",
      "Designe objeto: 20,0",
      "Precise segundo punto de ruptura o [Primer punto]: 60,0",
    ])
    expect(pieces(cad).map((piece) => piece.vertices)).toEqual([
      "0,0 20,0",
      "60,0 100,0 100,100 0,100",
    ])
  })
})

// AutoCAD 2023's console, LWPOLYLINE vertices read in the WCS (acc/bz6–bz10):
// in a UCS at 10,0 turned 30°, the points typed in the WCS with `*`.
describe("BREAK of a polyline in a turned UCS", () => {
  const turned = (...entities: PolylineEntity[]) =>
    answer(createHarness({ entities }), "UCS", "O", "10,0", "UCS", "Z", "30")
  const square = () => polylineOf(SQUARE, { closed: true, id: "p1" })
  const arched = () =>
    polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], {
      bulges: [0, 1, 0],
      id: "p1",
    })

  it("cuts it as in the WCS", () => {
    for (const [polyline, command, first, second, kept] of [
      [
        square,
        "BREAK",
        "*50,0",
        "*100,50",
        ["p1 100,50 100,100 0,100 0,0 50,0"],
      ],
      [
        square,
        "BREAK",
        "*100,50",
        "*50,0",
        ["p1 100,50 100,100 0,100 0,0 50,0"],
      ],
      [
        square,
        "BREAK",
        "*50,0",
        "@",
        ["p1 0,0 50,0", "new 50,0 100,0 100,100 0,100 0,0"],
      ],
      [
        arched,
        "BREAK",
        "*50,0",
        "*150,50",
        ["p1 0,0 50,0", "new 150,50 100,100 0,100"],
      ],
      [
        arched,
        "BREAKATPOINT",
        "*150,50",
        "*150,50",
        ["p1 0,0 100,0 150,50", "new 150,50 100,100 0,100"],
      ],
    ] as const) {
      const cad = answer(turned(polyline()), command, first, second)
      expect(
        pieces(cad).map(
          ({ id, vertices }) => `${id === "p1" ? "p1" : "new"} ${vertices}`
        )
      ).toEqual(kept)
    }
    // The arc's pieces keep its circle: a quarter each (bulge tan 22.5°).
    const cad = answer(turned(arched()), "BREAKATPOINT", "*150,50", "*150,50")
    const [before, after] = cad.entities() as PolylineEntity[]
    expect(before.bulges?.[1]).toBeCloseTo(0.414214, 6)
    expect(after.bulges?.[0]).toBeCloseTo(0.414214, 6)
  })
})

// AutoCAD 2023's console (acc/bz1–bz5): at a line's or an arc's end, `@`
// and BREAKATPOINT leave it as it was, saying nothing.
describe("BREAK at an end", () => {
  it("does nothing to a line or an arc, silently", () => {
    for (const [command, first, second] of [
      ["BREAK", "100,0", "@"],
      ["BREAK", "0,0", "@"],
      ["BREAKATPOINT", "50,0", "100,0"],
    ]) {
      const cad = answer(
        createHarness({ entities: [lineOf(p(0, 0), p(100, 0), { id: "l1" })] }),
        command,
        first,
        second
      )
      expect(cad.only<LineEntity>("line")).toMatchObject({
        id: "l1",
        end: { x: 100, y: 0 },
      })
      expect(cad.commandLog().at(-1)).toMatch(/break point/)
      expect(cad.activeToolId()).toBe("select")
    }
    for (const first of ["100,0", "0,100"]) {
      const cad = answer(
        createHarness({
          entities: [arcOf(p(0, 0), 100, 0, deg(90), { id: "a1" })],
        }),
        "BREAK",
        first,
        "@"
      )
      expect(cad.only<ArcEntity>("arc").endAngle).toBeCloseToAngle(deg(90))
      expect(cad.commandLog().at(-1)).toBe(
        "Specify second break point or [First point]: @"
      )
    }
  })
})

/** The ellipses left, in drawing order: the object's or a new one, and its parameters. */
function ellipsePieces(cad: CadHarness): string[] {
  const round = (value: number) => Math.round(value * 1e4) / 1e4
  return (cad.entities() as EllipseEntity[]).map((ellipse) =>
    [
      ellipse.id === "e1" ? "e1" : "new",
      round(ellipse.startParam ?? 0),
      round(ellipse.endParam ?? 2 * Math.PI),
    ].join(" ")
  )
}

// Centre 50,50, 50 along X and 25 along Y: t = 0 at 100,50, 45° at
// 85.3553,67.6777, 90° at 50,75, 180° at 0,50, 270° at 50,25.
const WHOLE = () => ellipseOf(p(50, 50), p(50, 0), 0.5, { id: "e1" })
const ARC = () =>
  ellipseOf(p(50, 50), p(50, 0), 0.5, {
    id: "e1",
    startParam: 0,
    endParam: deg(270),
  })
const T45 = "85.3553,67.6777"

// Each ellipse's handle and DXF 41/42 read after the break (AutoCAD 2023's
// console, acc/be1–be21; 2027 keeps the whole ellipse's rule, ellipse/p334).
describe("BREAK of an ellipse", () => {
  it("takes from a whole one what runs counter-clockwise from the first point to the second", () => {
    for (const [first, second, kept] of [
      ["100,50", "50,75", "e1 1.5708 6.2832"],
      ["50,75", "100,50", "e1 0 1.5708"],
      [T45, "0,50", "e1 3.1416 7.0686"],
    ]) {
      const cad = answer(
        createHarness({ entities: [WHOLE()] }),
        "BREAK",
        first,
        second
      )
      expect(ellipsePieces(cad)).toEqual([kept])
    }
  })

  // probe ellipse/p334: the ellipse 0,0 → @50<30, 25 broken from its axis
  // end to its 120° point keeps π/2 → 2π, Start −12.5,21.650635.
  it("keeps three quarters of a turned ellipse broken a quarter round", () => {
    const cad = answer(
      createHarness(),
      ...["ELLIPSE", "C", "0,0", "@50<30", "25"],
      ...["BREAK", "43.30127,25", "-12.5,21.650635"]
    )
    const kept = cad.entities()[0] as EllipseEntity
    expect(kept.startParam).toBeCloseTo(Math.PI / 2, 6)
    expect(kept.endParam).toBeCloseTo(2 * Math.PI, 6)
    expect(ellipseStartPoint(kept)).toBeCloseToPoint(p(-12.5, 21.650635), 5)
    expect(ellipseEndPoint(kept)).toBeCloseToPoint(p(43.30127, 25), 5)
  })

  it("refuses to split a whole one in place", () => {
    for (const [locale, command, atPoint, refusal] of [
      [
        undefined,
        "BREAK",
        "BREAKATPOINT",
        "Cannot break a closed, periodic curve at only one point.",
      ],
      [
        es,
        "PARTE",
        "PARTIRENPUNTO",
        "No es posible partir una curva periódica cerrada en un solo punto.",
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: [WHOLE()] })
      answer(cad, command, T45, "@")
      expect(cad.commandLog().at(-1)).toBe(refusal)
      answer(cad, atPoint, "0,50", "0,50")
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(ellipsePieces(cad)).toEqual(["e1 0 6.2832"])
      expect(cad.activeToolId()).toBe("select")
    }
  })

  it("breaks an elliptical arc in its parameter, the piece from its start the object", () => {
    for (const [command, first, second, kept] of [
      ["BREAK", T45, "0,50", ["e1 0 0.7854", "new 3.1416 4.7124"]],
      ["BREAK", "0,50", T45, ["e1 0 0.7854", "new 3.1416 4.7124"]],
      ["BREAK", T45, "@", ["e1 0 0.7854", "new 0.7854 4.7124"]],
      ["BREAKATPOINT", T45, T45, ["e1 0 0.7854", "new 0.7854 4.7124"]],
      ["BREAK", "100,50", "@", ["e1 0 4.7124"]],
      ["BREAK", T45, "50,25", ["e1 0 0.7854"]],
      // In the arc's gap, nearer its start.
      ["BREAK", T45, "85.3553,32.3223", ["e1 0.7854 4.7124"]],
    ] as const) {
      const cad = answer(
        createHarness({ entities: [ARC()] }),
        command,
        first,
        second
      )
      expect(ellipsePieces(cad)).toEqual(kept)
    }
  })

  it("says what it cannot break, and asks again", () => {
    const entities = () => [
      textOf(p(0, 0), "ABCDEF", { height: 10 }),
      createMText(p(0, 100), "ABCDEF", { height: 10 }),
      createInsert("B", p(200, 0)),
      hatchOf([loopOf(p(300, 0), p(400, 50))]),
    ]
    const blocks = [
      createBlockDefinition("B", p(0, 0), [lineOf(p(0, 0), p(100, 0))]),
    ]
    for (const [locale, command, cannot, block, prompt, last] of [
      [
        undefined,
        "BREAK",
        "Object can't be broken",
        "Can't break a block",
        "Select object:",
        "L",
      ],
      [
        es,
        "PARTE",
        "Imposible partir este objeto",
        "Imposible partir un bloque",
        "Designe objeto:",
        "LT",
      ],
    ] as const) {
      const cad = createHarness({ locale, blocks, entities: entities() })
      answer(cad, command, "20,5", "20,95", "250,0", last)
      expect(cad.commandLog().slice(1)).toEqual([
        `${prompt} 20,5`,
        cannot,
        `${prompt} 20,95`,
        cannot,
        `${prompt} 250,0`,
        block,
        `${prompt} ${last}`,
        cannot,
      ])
      expect(cad.state().commandLine.prompt).toBe(`${command} ${prompt}`)
      expect(cad.entityCount).toBe(4)
    }

    const dimension = answer(
      createHarness(),
      "DIMLINEAR",
      "0,0",
      "100,0",
      "0,-20",
      "BREAK",
      "50,-20"
    )
    expect(dimension.commandLog().at(-1)).toBe("Object can't be broken")
  })
})

describe("BREAKATPOINT", () => {
  it("splits a line in two without a gap", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAKATPOINT").click(p(-100, 0)).click(p(0, 0))

    const lines = cad.entities() as LineEntity[]
    expect(lines).toHaveLength(2)
    expect(lines[0].end).toBeCloseToPoint(p(0, 0))
    expect(lines[1].start).toBeCloseToPoint(p(0, 0))
  })

  it("offers no keywords: the break point is the whole prompt", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAKATPOINT")
    expect(cad.state().commandLine.prompt).toBe("BREAKATPOINT Select object:")
    cad.click(p(-100, 0))

    expect(cad.state().commandLine.prompt).toBe(
      "BREAKATPOINT Specify break point:"
    )
    expect(cad.optionAbbreviations()).toEqual([])
  })

  it("does nothing when the point falls on an endpoint", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "l1" })],
    })

    cad.command("BREAKATPOINT").click(p(0, 0)).click(p(-200, 0))

    expect(cad.only<LineEntity>("line").id).toBe("l1")
    expect(cad.entityCount).toBe(1)
  })
})

/** The lines left, `id start end` in drawing order, a new piece's id `*`. */
function lineList(cad: CadHarness, ...ids: string[]): string[] {
  const round = (value: number) => Math.round(value * 1e4) / 1e4 + 0
  return cad.entities().map((entity) => {
    const id = ids.includes(entity.id) ? entity.id : "*"
    if (entity.type !== "line") return `${id} ${entity.type}`
    const { start, end } = entity
    return `${id} ${round(start.x)},${round(start.y)} ${round(end.x)},${round(end.y)}`
  })
}

/** LASTPOINT, as `ID @` says it, the running command ended first. */
function lastPointOf(cad: CadHarness): string | undefined {
  if (cad.activeToolId() !== "select") cad.escape()
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

const lineA = () => lineOf(p(0, 0), p(100, 0), { id: "A" })

/** The keyboard's Enter, the command line's and the right button's. */
const ENTERS: ReadonlyArray<[string, (cad: CadHarness) => void]> = [
  ["the keyboard", (cad) => cad.enter()],
  ["the command line", (cad) => answer(cad, "")],
  [
    "the right button",
    (cad) => {
      cad.rightClick(p(300, 300))
      if (cad.state().shortcutMenu) {
        cad.runtime.chooseShortcutMenuAction("enter")
      }
    },
  ],
]

// AutoCAD 2027's console, en-US and es-ES, and the desktop through COM alone
// (probes pieces/p146, p149–p151, d15): every break point refuses Enter in
// its own words and is asked again.
describe.each(ENTERS)("Enter from %s at BREAK's break points", (_, enter) => {
  it("is refused, and each prompt asked again", () => {
    for (const [locale, command, atPoint, required, invalid] of [
      [
        undefined,
        "BREAK",
        "BREAKATPOINT",
        "Point or option keyword required.",
        "Invalid point.",
      ],
      [
        es,
        "PARTE",
        "PARTIRENPUNTO",
        "Se requiere un punto o una opción.",
        "Punto no válido.",
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: [lineA()] })
      answer(cad, command, "30,0")
      const second = cad.state().commandLine.prompt
      enter(cad)
      expect(cad.commandLog().at(-1)).toBe(required)
      expect(cad.state().commandLine.prompt).toBe(second)

      cad.option("First point")
      const first = cad.state().commandLine.prompt
      enter(cad)
      expect(cad.commandLog().at(-1)).toBe(invalid)
      expect(cad.state().commandLine.prompt).toBe(first)

      answer(cad, "50,0")
      const again = cad.state().commandLine.prompt
      enter(cad)
      expect(cad.commandLog().at(-1)).toBe(required)
      expect(cad.state().commandLine.prompt).toBe(again)
      answer(cad, "80,0")
      expect(lineList(cad, "A")).toEqual(["A 0,0 50,0", "* 80,0 100,0"])

      answer(cad, atPoint, "20,0")
      const point = cad.state().commandLine.prompt
      enter(cad)
      expect(cad.commandLog().at(-1)).toBe(invalid)
      expect(cad.state().commandLine.prompt).toBe(point)
      answer(cad, "10,0")
      expect(lineList(cad, "A")).toEqual([
        "A 0,0 10,0",
        "* 80,0 100,0",
        "* 10,0 50,0",
      ])
    }
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes pieces/p150, p171): First
// point is still declared at the second break point it asks, unlisted, and
// typed there ends BREAK, changing nothing, U naming it.
describe("First point typed again after First point", () => {
  it("ends BREAK, changing nothing", () => {
    for (const [locale, command, first, undo] of [
      [undefined, "BREAK", "F", "U"],
      [es, "PARTE", "P", "H"],
    ] as const) {
      const cad = createHarness({ locale, entities: [lineA()] })
      answer(cad, "ID", "5,5", command, "30,0", first, "50,0")
      expect(cad.optionIds()).toEqual([])
      answer(cad, first)
      expect(cad.activeToolId()).toBe("select")
      expect(lineList(cad, "A")).toEqual(["A 0,0 100,0"])
      answer(cad, undo)
      expect(cad.commandLog().at(-1)).toBe(command)
      expect(lastPointOf(cad)).toMatch(/50[.,]00 .* 0[.,]00 /)
    }
    const global = answer(
      createHarness({ entities: [lineA()] }),
      "BREAK",
      "30,0",
      "_F",
      "50,0",
      "_F"
    )
    expect(global.activeToolId()).toBe("select")
  })
})

// AutoCAD 2027's desktop (pieces/d10-2, d10-4): the break points' pointer
// input shows the cursor's absolute X and Y, and their prompts have no base
// point (UseBasePoint false in the trace of p117), so a point typed in the box
// is absolute there, `@` from LASTPOINT — which the first point set.
describe("A point typed in the box at a break point", () => {
  it("is absolute, @ from the first point", () => {
    const box = createHarness({ entities: [lineA()] })
    box.command("BREAK").click(p(30, 0)).type("60,0").enter()
    expect(lineList(box, "A")).toEqual(["A 0,0 30,0", "* 60,0 100,0"])

    const relative = createHarness({ entities: [lineA()] })
    relative.command("BREAK").click(p(30, 0)).type("@20,0").enter()
    expect(lineList(relative, "A")).toEqual(["A 0,0 30,0", "* 50,0 100,0"])

    const after = createHarness({ entities: [lineA()] })
    after.command("BREAK").click(p(10, 0)).option("First point")
    after.type("40,0").enter().type("70,0").enter()
    expect(lineList(after, "A")).toEqual(["A 0,0 40,0", "* 70,0 100,0"])

    const atPoint = createHarness({ entities: [lineA()] })
    atPoint.command("BREAKATPOINT").click(p(30, 0)).type("60,0").enter()
    expect(lineList(atPoint, "A")).toEqual(["A 0,0 60,0", "* 60,0 100,0"])
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes pieces/p108–p115, p177): an
// object snap typed at `Select object:` picks at the point it finds, which is
// BREAK's first break point and LASTPOINT; one finding nothing says so, and
// the prompt refuses it, LASTPOINT kept.
describe("An object snap typed at BREAK's Select object", () => {
  const breaks = (entities: Entity[], ...answers: string[]) =>
    answer(createHarness({ entities }), "ID", "5,5", "BREAK", ...answers)

  it("picks at the point found, the first break point and LASTPOINT", () => {
    const end = breaks([lineA()], "_END", "99,1")
    expect(lastPointOf(end)).toMatch(/100[.,]00 .* 0[.,]00 /)
    const ended = breaks([lineA()], "_END", "99,1", "50,0")
    expect(lineList(ended, "A")).toEqual(["A 0,0 50,0"])

    const mid = breaks([lineA()], "_MID", "60,1", "80,0")
    expect(lineList(mid, "A")).toEqual(["A 0,0 50,0", "* 80,0 100,0"])

    const near = breaks([lineA()], "_NEA", "30,2", "@")
    expect(lineList(near, "A")).toEqual(["A 0,0 30,0", "* 30,0 100,0"])
    expect(lastPointOf(near)).toMatch(/30[.,]00 .* 0[.,]00 /)

    const quadrant = breaks([circleOf(p(0, 0), 50, { id: "C" })], "_QUA")
    answer(quadrant, "1,49", "-50,0")
    const arc = quadrant.only<ArcEntity>("arc")
    expect(arc.startAngle).toBeCloseToAngle(Math.PI)
    expect(arc.endAngle).toBeCloseToAngle(Math.PI / 2)
  })

  it("measures Perpendicular from LASTPOINT (p113)", () => {
    const cad = answer(
      createHarness({ entities: [lineA()] }),
      "ID",
      "50,40",
      "BREAK",
      "_PER",
      "30,1",
      "80,0"
    )
    expect(lineList(cad, "A")).toEqual(["A 0,0 50,0", "* 80,0 100,0"])
  })

  it("picks the newer object at an intersection (p111)", () => {
    const cad = breaks(
      [lineA(), lineOf(p(30, -20), p(30, 60), { id: "V" })],
      "_INT",
      "31,1",
      "60,0"
    )
    // The second point, off V, is pulled onto it at its end 30,0.
    expect(lineList(cad, "A", "V")).toEqual([
      "A 0,0 100,0",
      "V 30,-20 30,0",
      "* 30,0 30,60",
    ])
  })

  it("finds no object at a circle's centre, LASTPOINT there (p112)", () => {
    const cad = breaks([circleOf(p(0, 0), 50, { id: "C" })], "_CEN", "49,1")
    expect(cad.commandLog().at(-1)).toBe("No object found")
    expect(cad.state().commandLine.prompt).toBe("BREAK Select object:")
    expect(lastPointOf(cad)).toMatch(/ 0[.,]00 .* 0[.,]00 /)
  })

  it("says what it does not find, and the prompt refuses it (p115)", () => {
    for (const [locale, command, lines] of [
      [
        undefined,
        "BREAK",
        [
          "No Center found for specified point.",
          "*Invalid selection*",
          "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
        ],
      ],
      [
        es,
        "PARTE",
        [
          "No se ha encontrado CENtro para el punto designado.",
          "*Designación no válida*",
          "Requiere un punto o Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC",
        ],
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: [lineA()] })
      answer(cad, "ID", "5,5", command, "_CEN", "50,1")
      expect(cad.commandLog().slice(-3)).toEqual(lines)
      expect(lastPointOf(cad)).toMatch(/ 5[.,]00 .* 5[.,]00 /)
    }
  })

  it("is BREAKATPOINT's pick too, which asks its break point (p177)", () => {
    const cad = answer(
      createHarness({ entities: [lineA()] }),
      "BREAKATPOINT",
      "_MID",
      "60,1"
    )
    expect(cad.commandLog()).not.toContain("*Invalid selection*")
    expect(cad.state().commandLine.prompt).toBe(
      "BREAKATPOINT Specify break point:"
    )
    answer(cad, "80,0")
    expect(lineList(cad, "A")).toEqual(["A 0,0 80,0", "* 80,0 100,0"])
  })

  it("picks where a clicked override finds its point", () => {
    const cad = createHarness({ entities: [lineA()] })
    cad.command("BREAK").moveTo(p(60, 1))
    cad.runtime.setSnapOverride(SnapType.Midpoint)
    cad.click(p(60, 1)).click(p(80, 0))
    expect(lineList(cad, "A")).toEqual(["A 0,0 50,0", "* 80,0 100,0"])
  })
})

// AutoCAD 2027's console, en-US and es-ES, and the desktop (probes
// pieces/p100–p107, p124, p178, d06): the newest object under the pick box is
// tested, locked or not, and each object on a locked layer a pick or a mode
// finds is said; with nothing else found, `No object found` and the prompt
// again, else the oldest unlocked object is taken.
describe("Objects on a locked layer at BREAK's Select object", () => {
  const locked = (entities: Entity[], locale?: typeof es) => {
    const cad = createHarness({ locale })
    cad.runtime.document.load(entities, {
      layers: [layerOf("0"), layerOf("LK", { locked: true })],
    })
    return answer(cad, "ID", "5,5")
  }
  const lockedLine = (id = "K", x = 30) =>
    lineOf(p(x, -20), p(x, 60), { id, layerId: "LK" })

  it("refuses a pick on one, LASTPOINT moved there (p100, p106)", () => {
    for (const [locale, command, atPoint, lines] of [
      [
        undefined,
        "BREAK",
        "BREAKATPOINT",
        ["The object is on a locked layer.", "No object found"],
      ],
      [
        es,
        "PARTE",
        "PARTIRENPUNTO",
        [
          "El objeto está en una capa bloqueada.",
          "No se ha encontrado ningún objeto",
        ],
      ],
    ] as const) {
      const cad = locked([lineA(), lockedLine()], locale)
      answer(cad, command, "30,40")
      expect(cad.commandLog().slice(-2)).toEqual(lines)
      expect(cad.state().commandLine.prompt).toMatch(/:$/)
      expect(lastPointOf(cad)).toMatch(/30[.,]00 .* 40[.,]00 /)

      const clicked = locked([lineA(), lockedLine()], locale)
      clicked.command(atPoint).click(p(30, 40))
      expect(clicked.commandLog().slice(-2)).toEqual(lines)
    }
  })

  it("tests the newest under the pick box, locked or not (p105, p124)", () => {
    const newer = locked([lineA(), lockedLine()])
    answer(newer, "BREAK", "30,0")
    expect(newer.commandLog().slice(-2)).toEqual([
      "The object is on a locked layer.",
      "No object found",
    ])
    answer(newer, "60,0")
    expect(newer.state().commandLine.prompt).toBe(
      "BREAK Specify second break point or [First point]:"
    )

    const older = locked([lockedLine(), lineA()])
    answer(older, "BREAK", "30,0", "60,0")
    expect(older.commandLog()).not.toContain("The object is on a locked layer.")
    expect(lineList(older, "A", "K")).toEqual([
      "K 30,-20 30,60",
      "A 0,0 30,0",
      "* 60,0 100,0",
    ])
  })

  it("says each one a mode finds, then takes the oldest unlocked (p102, p103, p107, p178)", () => {
    for (const [probe, entities, mode] of [
      ["p102", [lineA(), lockedLine()], ["W", "-10,-30", "110,70"]],
      ["p103", [lockedLine(), lineA()], ["W", "-10,-30", "110,70"]],
      ["p107", [lineA(), lockedLine()], ["C", "25,-5", "35,5"]],
    ] as const) {
      const cad = locked([...entities])
      answer(cad, "BREAK", ...mode)
      expect(cad.commandLog().at(-1), probe).toBe(
        "The object is on a locked layer."
      )
      answer(cad, "60,0", "80,0")
      expect(lineList(cad, "A", "K"), probe).toContain("A 0,0 60,0")
    }

    const two = locked([lineA(), lockedLine(), lockedLine("K2", 60)])
    answer(two, "BREAK", "W", "-10,-30", "110,70")
    expect(two.commandLog().slice(-3)).toEqual([
      "Specify opposite corner: 110,70",
      "The object is on a locked layer.",
      "The object is on a locked layer.",
    ])
    expect(two.state().commandLine.prompt).toBe(
      "BREAK Specify first break point:"
    )
  })

  it("says No object found where a mode finds only locked ones (p101, p104)", () => {
    for (const mode of [["W", "20,-30", "40,70"], ["L"]]) {
      const cad = locked([lineA(), lockedLine()])
      answer(cad, "BREAK", ...mode)
      expect(cad.commandLog().slice(-2)).toEqual([
        "The object is on a locked layer.",
        "No object found",
      ])
      expect(cad.state().commandLine.prompt).toBe("BREAK Select object:")
      expect(lastPointOf(cad)).toMatch(/ 5[.,]00 .* 5[.,]00 /)
    }
  })
})

// AutoCAD 2027's console, the default figure: line A 0,0 → 100,0 and
// LASTPOINT at 5,5 before BREAK (probes pieces/p116–p121, p147, p148,
// p153–p157, p160, p161).
describe("The points of BREAK's prompts", () => {
  const breaks = (...answers: string[]) =>
    answer(createHarness({ entities: [lineA()] }), "ID", "5,5", ...answers)

  it("take object snaps and FROM at each break point (p116–p118, p121)", () => {
    // M2P (p119) is not built: drafting-aids.md's Missing.
    const end = breaks("BREAK", "30,0", "_END", "99,1")
    expect(lineList(end, "A")).toEqual(["A 0,0 30,0"])
    expect(lastPointOf(end)).toMatch(/100[.,]00 .* 0[.,]00 /)
    const first = breaks("BREAK", "30,0", "_F", "_MID", "60,1", "80,0")
    expect(lineList(first, "A")).toEqual(["A 0,0 50,0", "* 80,0 100,0"])
    const from = breaks("BREAK", "30,0", "_FRO", "100,0", "@-20,0")
    expect(lineList(from, "A")).toEqual(["A 0,0 30,0", "* 80,0 100,0"])
    const atPoint = breaks("BREAKATPOINT", "30,0", "_MID", "60,1")
    expect(lineList(atPoint, "A")).toEqual(["A 0,0 50,0", "* 50,0 100,0"])
  })

  it("is not bent by Ortho where typed (p120)", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })
    cad.press("F8")
    answer(cad, "BREAK", "50,0", "-10,40")
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.startAngle).toBeCloseTo(1.81577, 4)
    expect(arc.endAngle).toBeCloseToAngle(0)
  })

  it("read a number from the pick towards the cursor (p147, p148)", () => {
    for (const [distance, kept] of [
      ["10", ["A 0,0 21.1336,0", "* 30,0 100,0"]],
      ["-5", ["A 0,0 30,0", "* 34.4332,0 100,0"]],
    ] as const) {
      const cad = createHarness({ entities: [lineA()] })
      // Where the console's cursor stood: LASTPOINT 21.1336,-4.62466 after 10.
      cad.moveTo(p(-58.664, -46.2466))
      answer(cad, "BREAK", "30,0", distance)
      expect(lineList(cad, "A"), distance).toEqual(kept)
    }
  })

  it("keep a Z typed, read @ and polar points from the pick (p153–p155)", () => {
    const z = breaks("BREAK", "30,0,5", "60,0,5")
    expect(lineList(z, "A")).toEqual(["A 0,0 30,0", "* 60,0 100,0"])
    expect(lastPointOf(z)).toMatch(/60[.,]00 .* 0[.,]00 .* 5[.,]00/)
    for (const run of [
      ["@25,-5", "@30,0"],
      ["30<0", "@30<0"],
    ]) {
      const cad = breaks("BREAK", ...run)
      expect(lineList(cad, "A"), run[0]).toEqual(["A 0,0 30,0", "* 60,0 100,0"])
    }
  })

  it("are read in the UCS, `*` in the WCS, `#` refused at the pick (p156, p157)", () => {
    const cad = answer(
      createHarness({ entities: [lineA()] }),
      "UCS",
      "Z",
      "30",
      "BREAK",
      "#30,0"
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
    ])
    answer(cad, "*30,0", "60,0")
    expect(lineList(cad, "A")).toEqual(["A 0,0 30,0", "* 51.9615,0 100,0"])
  })

  it("take @ as the pick at the first break point and BREAKATPOINT's (p160, p161)", () => {
    const first = breaks("BREAK", "30,0", "_F", "@", "@20,0")
    expect(lineList(first, "A")).toEqual(["A 0,0 30,0", "* 50,0 100,0"])
    const atPoint = breaks("BREAKATPOINT", "30,0", "@")
    expect(lineList(atPoint, "A")).toEqual(["A 0,0 30,0", "* 30,0 100,0"])
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes pieces/p166–p171): a run
// of BREAK is one step, named as the command was, even one that changed
// nothing.
describe("BREAK and U", () => {
  it("undoes and redoes the break in one step (p166, p167)", () => {
    for (const [locale, command, undo, redo] of [
      [undefined, "BREAK", "U", "REDO"],
      [es, "PARTE", "H", "REHACER"],
    ] as const) {
      const cad = createHarness({ locale, entities: [lineA()] })
      answer(cad, command, "30,0", "60,0", undo)
      expect(cad.commandLog().at(-1)).toBe(command)
      expect(lineList(cad, "A")).toEqual(["A 0,0 100,0"])
      answer(cad, redo)
      expect(lineList(cad, "A")).toEqual(["A 0,0 30,0", "* 60,0 100,0"])
    }
    const two = answer(
      createHarness({ entities: [lineA()] }),
      "_BREAK",
      "30,0",
      "60,0",
      "_LINE",
      "0,10",
      "100,10",
      "",
      "_UNDO",
      "2",
      "_MREDO",
      "1"
    )
    expect(lineList(two, "A")).toEqual(["A 0,0 30,0", "* 60,0 100,0"])
  })

  it("names a run that changed nothing (p168–p171)", () => {
    for (const [locale, gap, atPoint] of [
      [undefined, "BREAK", "BREAKATPOINT"],
      [es, "PARTE", "PARTIRENPUNTO"],
    ] as const) {
      for (const [command, name, ...run] of [
        ["_BREAK", gap, "0,0", "@"],
        ["_BREAK", gap, ""],
        ["_BREAKATPOINT", atPoint, "30,0", "30,0"],
        ["_BREAK", gap, "30,0", "_F", "50,0", "_F"],
      ]) {
        const cad = createHarness({ locale, entities: [lineA()] })
        answer(cad, command, ...run, "_U")
        expect(cad.commandLog().at(-1), run.join(" ")).toBe(name)
        expect(lineList(cad, "A")).toEqual(["A 0,0 100,0"])
      }
    }
  })
})

// AutoCAD 2027's console (probes pieces/p172–p175): BREAK asks its object
// whatever is selected, and leaves nothing selected nor a Previous set.
describe("BREAK and the selection", () => {
  it("asks its object over a preselection, which it drops (p172, p173)", () => {
    const cad = createHarness({
      entities: [lineA(), lineOf(p(0, 50), p(100, 50), { id: "B" })],
    })
    cad.select("B").command("BREAK")
    expect(cad.state().commandLine.prompt).toBe("BREAK Select object:")
    answer(cad, "30,0", "60,0")
    expect(lineList(cad, "A", "B")).toEqual([
      "A 0,0 30,0",
      "B 0,50 100,50",
      "* 60,0 100,0",
    ])
    expect(cad.selectedIds()).toEqual([])
  })

  it("leaves no Previous set, found by a mode or ended by Enter (p174, p175)", () => {
    const cad = answer(
      createHarness({ entities: [lineA()] }),
      "BREAK",
      "W",
      "-10,-10",
      "110,10",
      "20,0",
      "40,0",
      "ERASE",
      "P"
    )
    expect(cad.commandLog().at(-1)).toBe("No previous selection set.")
    const ended = answer(createHarness({ entities: [lineA()] }), "BREAK", "")
    expect(ended.selectedIds()).toEqual([])
    expect(ended.activeToolId()).toBe("select")
  })
})
