import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  arcSweepAngle,
  createBlockDefinition,
  createInsert,
  createMText,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  hatchOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"
import { es } from "../../locales/es"

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
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "BREAK Specify second break point:"
    )
    expect(cad.optionIds()).toEqual([])
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

// AutoCAD 2023's console, each ellipse's handle and DXF 41/42 read after
// the break (acc/be1–be21).
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
      answer(cad, command, "20,5", "20,105", "250,0", last)
      expect(cad.commandLog().slice(1)).toEqual([
        `${prompt} 20,5`,
        cannot,
        `${prompt} 20,105`,
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
