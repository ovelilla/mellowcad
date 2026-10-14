import { describe, expect, it } from "vitest"
import {
  createSpline,
  ellipseEndPoint,
  ellipseStartPoint,
  type ArcEntity,
  type CircleEntity,
  type EllipseEntity,
  type Entity,
  type LineEntity,
  type PolylineEntity,
} from "../../domain/entities"
import { ellipseParamFromAngle } from "../../geometry/primitives"
import type { Vec2 } from "../../geometry/Vec2"
import { THEME } from "../../scene/theme"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/**
 * The editing commands that reshape existing geometry: TRIM, EXTEND, FILLET,
 * CHAMFER and OFFSET. They are the most numerically delicate tools in the app
 * (intersections, tangencies, side-of-line decisions), and the ones a user
 * notices immediately when they drift.
 */

/** Endpoints in a canonical order, since which end is "start" is incidental. */
function endpoints(line: LineEntity): Vec2[] {
  return [line.start, line.end].sort((a, b) => a.x - b.x || a.y - b.y)
}

function linesOf(entities: readonly Entity[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

describe("TRIM", () => {
  it("reports its settings and asks Quick mode's question", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
    })

    cad.command("TRIM")
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend:"
    )
    expect(cad.state().dynamicInput).toBeNull()
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [Undo]:"
    )
    cad.click(p(0, 50), { shiftKey: true }).enter()

    expect(cad.commandLog()).toEqual([
      "TRIM",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to trim or shift-select to extend:",
      "Select object to trim or shift-select to extend or [Undo]:",
      "Path does not intersect with the bounding edge.",
      "Select object to trim or shift-select to extend or [Undo]:",
    ])
  })

  it("Undo takes back the last trim, and only the command's own", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
    })
    cad.command("LINE").click(p(0, -300)).click(p(100, -300)).enter()

    cad.command("TRIM").click(p(100, 0)).click(p(0, 50))
    cad.option("Undo")
    expect(endpoints(cad.byId<LineEntity>("V"))).toBeCloseToPoints([
      p(0, -100),
      p(0, 100),
    ])
    expect(endpoints(cad.byId<LineEntity>("A"))).toBeCloseToPoints([
      p(-200, 0),
      p(0, 0),
    ])
    cad.option("Undo")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend:"
    )
    // With the command's own edits gone, Undo is no longer offered.
    expect(cad.optionIds()).toEqual([])
    expect(cad.entityCount).toBe(3)
  })

  it("cuts the picked side back to the crossing edge", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
    })

    cad.command("TRIM").click(p(100, 0))

    expect(cad.entityCount).toBe(2)
    expect(endpoints(cad.byId<LineEntity>("A"))).toBeCloseToPoints([
      p(-200, 0),
      p(0, 0),
    ])
  })

  it("splits the object in two when the cut is between two edges", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(-50, -100), p(-50, 100), { id: "V1" }),
        lineOf(p(50, -100), p(50, 100), { id: "V2" }),
      ],
    })

    cad.command("TRIM").click(p(0, 0))

    expect(cad.entityCount).toBe(4)
    const pieces = linesOf(cad.entities()).filter(
      (line) => line.id !== "V1" && line.id !== "V2"
    )
    expect(pieces).toHaveLength(2)
    const spans = pieces.map(endpoints).sort((a, b) => a[0].x - b[0].x)
    expect(spans[0]).toBeCloseToPoints([p(-200, 0), p(-50, 0)])
    expect(spans[1]).toBeCloseToPoints([p(50, 0), p(200, 0)])
  })

  it("keeps the trimmed object's colour, plane and thickness", () => {
    const cad = createHarness({
      entities: [
        {
          ...lineOf(p(-200, 0), p(200, 0), { id: "A" }),
          color: "#ff0000",
          elevation: 4,
          thickness: 1,
        },
        lineOf(p(-50, -100), p(-50, 100), { id: "V1" }),
        lineOf(p(50, -100), p(50, 100), { id: "V2" }),
      ],
    })

    cad.command("TRIM").click(p(0, 0))

    const pieces = linesOf(cad.entities()).filter(
      (line) => line.id !== "V1" && line.id !== "V2"
    )
    expect(pieces).toHaveLength(2)
    for (const piece of pieces) {
      expect(piece).toMatchObject({
        color: "#ff0000",
        elevation: 4,
        thickness: 1,
      })
    }
  })

  it("stays active so successive clicks keep trimming", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
    })

    cad.command("TRIM").click(p(100, 0))
    expect(cad.activeToolId()).toBe("trim")
    cad.escape()
    expect(cad.activeToolId()).toBe("select")
  })

  it("deletes an object no edge crosses, as Quick mode does", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        circleOf(p(0, 300), 50, { id: "C" }),
      ],
    })

    cad.command("TRIM").click(p(100, 0)).click(p(50, 300))
    expect(cad.entityCount).toBe(0)
    cad.option("Undo")
    expect(cad.entities().map((e) => e.id)).toEqual(["C"])
    // Shift extends instead, which never deletes.
    cad.click(p(50, 300), { shiftKey: true })
    expect(cad.entityCount).toBe(1)
  })

  // AutoCAD 2023's console (acc/o1): a circle one edge crosses once is not
  // deleted, and Undo counts the pick.
  it("leaves a circle cut once as it is, saying it must be cut twice", () => {
    for (const [locale, name, asked, said, undone] of [
      [
        undefined,
        "TRIM",
        "Select object to trim or shift-select to extend:",
        "Circle must intersect twice.",
        "Command has been completely undone.",
      ],
      [
        es,
        "RECORTA",
        "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar:",
        "Se requieren dos intersecciones para el círculo.",
        "Todos los efectos del comando han sido deshechos.",
      ],
    ] as const) {
      const entities = [
        circleOf(p(0, 0), 50, { id: "C" }),
        lineOf(p(0, 0), p(0, 100), { id: "V" }),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(p(-50, 0))
      expect(cad.entities()).toEqual(entities)
      expect(cad.commandLog().slice(-2)).toEqual([asked, said])
      expect(cad.state().commandLine.prompt).toMatch(/\[(Undo|desHacer)\]:$/)
      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toBe(undone)
      expect(cad.optionIds()).toEqual([])
    }
  })

  // AutoCAD 2023's console (acc/o6, o7, tp1, tp3, tq1, tp11, tp10): a
  // polyline is its own edge, so a segment is trimmed back to its vertices and
  // the crossings on it; a closed one opens from the cut's far end round to
  // its near one, keeping its handle and direction.
  it("trims a polyline's segment between its vertices and the crossings on it", () => {
    for (const [locale, name, asked] of [
      [undefined, "TRIM", "Select object to trim or shift-select to extend:"],
      [
        es,
        "RECORTA",
        "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar:",
      ],
    ] as const) {
      const square = [p(-50, -50), p(50, -50), p(50, 50), p(-50, 50)]
      const trimmed = (
        pick: Vec2,
        bulges?: readonly number[],
        edges = [lineOf(p(0, 0), p(0, 100), { id: "V" })]
      ): PolylineEntity => {
        const cad = createHarness({
          locale,
          entities: [
            polylineOf(square, { id: "P", closed: true, bulges }),
            ...edges,
          ],
        })
        cad.command(name).click(pick)
        expect(cad.commandLog().at(-1)).toBe(asked)
        const poly = cad.byId<PolylineEntity>("P")
        expect(poly.closed).toBe(false)
        return poly
      }

      expect(trimmed(p(-50, 0)).vertices).toBeCloseToPoints(square)
      expect(trimmed(p(0, -50)).vertices).toBeCloseToPoints([
        p(50, -50),
        p(50, 50),
        p(-50, 50),
        p(-50, -50),
      ])
      expect(trimmed(p(-25, 50)).vertices).toBeCloseToPoints([
        p(-50, 50),
        p(-50, -50),
        p(50, -50),
        p(50, 50),
        p(0, 50),
      ])
      expect(trimmed(p(25, 50)).vertices).toBeCloseToPoints([
        p(0, 50),
        p(-50, 50),
        p(-50, -50),
        p(50, -50),
        p(50, 50),
      ])
      // Nothing else in the drawing: its own vertices still bound the cut.
      expect(trimmed(p(-50, 0), undefined, []).vertices).toBeCloseToPoints(
        square
      )
      // An arc segment is kept whole beside the cut, or cut whole itself.
      const beside = trimmed(p(-50, 0), [0, 1, 0, 0])
      expect(beside.vertices).toBeCloseToPoints(square)
      expect(beside.bulges).toEqual([0, 1, 0])
      const arc = trimmed(p(100, 0), [0, 1, 0, 0])
      expect(arc.vertices).toBeCloseToPoints([
        p(50, 50),
        p(-50, 50),
        p(-50, -50),
        p(50, -50),
      ])
      expect(arc.bulges ?? [0, 0, 0]).toEqual([0, 0, 0])
    }
  })

  // AutoCAD 2023's console (acc/tr1–tr4): an open polyline too, split in two
  // at a middle segment; where it crosses itself is an edge; one segment
  // nothing crosses is deleted.
  it("trims an open polyline at its vertices and where it crosses itself", () => {
    const run = (vertices: readonly Vec2[], pick: Vec2): CadHarness => {
      const cad = createHarness({
        entities: [polylineOf(vertices, { id: "P" })],
      })
      cad.command("TRIM").click(pick)
      return cad
    }
    const u = [p(0, 0), p(0, 100), p(100, 100), p(100, 0)]
    const split = run(u, p(50, 100))
      .entities()
      .map((e) => (e as PolylineEntity).vertices)
    expect(split).toHaveLength(2)
    expect(split[0]).toBeCloseToPoints([p(0, 0), p(0, 100)])
    expect(split[1]).toBeCloseToPoints([p(100, 100), p(100, 0)])
    expect(
      run(u, p(0, 50)).byId<PolylineEntity>("P").vertices
    ).toBeCloseToPoints([p(0, 100), p(100, 100), p(100, 0)])
    expect(
      run(
        [p(0, 0), p(100, 100), p(100, 0), p(0, 100)],
        p(20, 20)
      ).byId<PolylineEntity>("P").vertices
    ).toBeCloseToPoints([p(50, 50), p(100, 100), p(100, 0), p(0, 100)])
    expect(run([p(0, 0), p(100, 0)], p(50, 0)).entityCount).toBe(0)
  })

  // AutoCAD 2023's console (acc/tp14): EXTEND still refuses a closed one,
  // the pick counted for Undo.
  it("cannot EXTEND a closed polyline", () => {
    for (const [locale, name, said, undone] of [
      [
        undefined,
        "EXTEND",
        "Cannot EXTEND this object.",
        "Command has been completely undone.",
      ],
      [
        es,
        "ALARGA",
        "Objeto no procesado por ALARGA.",
        "Todos los efectos del comando han sido deshechos.",
      ],
    ] as const) {
      const entities = [
        polylineOf([p(-50, -50), p(50, -50), p(50, 50), p(-50, 50)], {
          id: "P",
          closed: true,
        }),
        lineOf(p(0, 0), p(0, 100), { id: "V" }),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(p(-50, 0))
      expect(cad.commandLog().at(-1)).toBe(said)
      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toBe(undone)
      expect(cad.entities()).toEqual(entities)
    }
  })

  it("turns a circle into the complementary arc", () => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 100, { id: "C" }),
        lineOf(p(0, -200), p(0, 200), { id: "V" }),
      ],
    })

    cad.command("TRIM").click(p(-100, 0))

    // The left half is removed; the surviving arc sweeps 270° → 90° (the right).
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.id).toBe("C")
    expect(arc.startAngle).toBeCloseToAngle(deg(270))
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("reverts in a single undo step", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "A" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
    })

    cad.command("TRIM").click(p(100, 0))
    cad.undo()

    expect(endpoints(cad.byId<LineEntity>("A"))).toBeCloseToPoints([
      p(-200, 0),
      p(200, 0),
    ])
  })
})

describe("EXTEND", () => {
  it("reports its settings and asks Quick mode's question", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(-100, 0), { id: "T" }),
        lineOf(p(0, -100), p(0, 100), { id: "B" }),
      ],
    })

    cad.command("EXTEND")
    expect(cad.state().commandLine.prompt).toBe(
      "EXTEND Select object to extend or shift-select to trim:"
    )
    cad.click(p(-110, 0)).escape()

    expect(cad.commandLog()).toEqual([
      "EXTEND",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to extend or shift-select to trim:",
      "Select object to extend or shift-select to trim or [Undo]: *Cancel*",
    ])
  })

  it("grows the picked end to the nearest boundary", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(-100, 0), { id: "T" }),
        lineOf(p(0, -100), p(0, 100), { id: "B" }),
      ],
    })

    cad.command("EXTEND").click(p(-110, 0))

    expect(endpoints(cad.byId<LineEntity>("T"))).toBeCloseToPoints([
      p(-200, 0),
      p(0, 0),
    ])
  })

  it("does nothing when no boundary lies that way", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(-100, 0), { id: "T" }),
        lineOf(p(0, -100), p(0, 100), { id: "B" }),
      ],
    })

    cad.command("EXTEND").click(p(-190, 0))

    expect(endpoints(cad.byId<LineEntity>("T"))).toBeCloseToPoints([
      p(-200, 0),
      p(-100, 0),
    ])
    expect(cad.commandLog().at(-1)).toBe(
      "Path does not intersect with the bounding edge."
    )
  })

  // AutoCAD 2023's console (acc/x1, x5, x6, x8, x12, x15 of the arcs session):
  // each object EXTEND cannot reach an edge with has its words, and Undo
  // counts the pick of a line, an arc or a polyline, not a circle's.
  it("says why an object reaches no edge, and counts it as Undo does", () => {
    const boundary = lineOf(p(100, -50), p(100, 50), { id: "B" })
    for (const [locale, name, said] of [
      [
        undefined,
        "EXTEND",
        [
          "Path does not intersect with the bounding edge.",
          "Object does not intersect an edge.",
          "Cannot EXTEND this object.",
        ],
      ],
      [
        es,
        "ALARGA",
        [
          "La trayectoria no se interseca con la arista de contorno.",
          "El objeto no se interseca con ninguna arista.",
          "Objeto no procesado por ALARGA.",
        ],
      ],
    ] as const) {
      const entities = [
        boundary,
        lineOf(p(0, 0), p(50, 0), { id: "L" }),
        polylineOf([p(0, 20), p(30, 20), p(30, 30)], { id: "P" }),
        polylineOf([p(0, 60), p(50, 60), p(50, 80)], { id: "Q", closed: true }),
        circleOf(p(30, -40), 10, { id: "C" }),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(p(100, 40))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      const counted = cad.state().commandLine.prompt
      expect(counted).toMatch(/\[(Undo|desHacer)\]:$/)

      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toMatch(/^(Command|Todos)/)
      cad.click(p(10, 20))
      expect(cad.commandLog().at(-1)).toBe(said[1])
      cad.click(p(25, 60))
      expect(cad.commandLog().at(-1)).toBe(said[2])
      cad.option("Undo").option("Undo")

      cad.click(p(40, -40))
      expect(cad.commandLog().at(-1)).toBe(said[2])
      expect(cad.optionIds()).toEqual([])
      expect(cad.entities()).toEqual(entities)

      cad.click(p(40, 0)).click(p(40, 0))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      expect(cad.byId<LineEntity>("L").end).toEqual(p(100, 0))
      cad.option("Undo")
      expect(cad.byId<LineEntity>("L").end).toEqual(p(100, 0))
      cad.option("Undo")
      expect(cad.byId<LineEntity>("L").end).toEqual(p(50, 0))
    }
  })

  // AutoCAD 2023's console (acc/e1–e15 of the selection modes session): the
  // end the pick lies nearer in the polyline's parameter grows — not the one
  // nearer along it nor in a straight line —, and only that one.
  it("grows a polyline picked at a middle segment from the end nearer in its parameter", () => {
    const extend = (
      vertices: Vec2[],
      edges: [Vec2, Vec2][],
      pick: Vec2,
      bulges?: number[]
    ) => {
      const cad = createHarness({
        entities: [
          polylineOf(vertices, { id: "P", bulges }),
          ...edges.map(([a, b]) => lineOf(a, b)),
        ],
      })
      cad.command("EXTEND").click(pick)
      return cad
    }
    const vertices = (cad: CadHarness) => cad.byId<PolylineEntity>("P").vertices

    const s = [p(0, 30), p(0, 0), p(100, 0), p(100, 100), p(30, 100)]
    const sEdges: [Vec2, Vec2][] = [
      [p(-50, 150), p(250, 150)],
      [p(-50, -100), p(-50, 300)],
    ]
    expect(vertices(extend(s, sEdges, p(80, 0)))).toBeCloseToPoints(
      [p(0, 150), ...s.slice(1)],
      4
    )
    expect(vertices(extend(s, sEdges, p(100, 25)))).toBeCloseToPoints(
      [...s.slice(0, 4), p(-50, 100)],
      4
    )

    const tail = [p(0, -30), p(0, 0), p(100, 0), p(100, 10), p(90, 10)]
    const tailEdges: [Vec2, Vec2][] = [
      [p(-60, -150), p(250, -150)],
      [p(-50, -200), p(-50, 300)],
    ]
    expect(vertices(extend(tail, tailEdges, p(90, 0)))).toBeCloseToPoints(
      [p(0, -150), ...tail.slice(1)],
      4
    )
    expect(vertices(extend(tail, tailEdges, p(100, 4)))).toBeCloseToPoints(
      [...tail.slice(0, 4), p(-50, 10)],
      4
    )

    // Three segments: the middle one's halves.
    const three = [p(0, -80), p(0, 0), p(100, 0), p(100, 10)]
    const threeEdges: [Vec2, Vec2][] = [
      [p(-60, -150), p(250, -150)],
      [p(-60, 150), p(250, 150)],
    ]
    for (const [pick, grown] of [
      [p(30, 0), [p(0, -150), ...three.slice(1)]],
      [p(45, 0), [p(0, -150), ...three.slice(1)]],
      [p(70, 0), [...three.slice(0, 3), p(100, 150)]],
    ] as const) {
      expect(vertices(extend(three, threeEdges, pick))).toBeCloseToPoints(
        grown,
        4
      )
    }

    // An arc at the end grows round its circle.
    const arced = extend(
      s.slice(0, 4).concat(p(30, 100)),
      [[p(-10, 80), p(60, 80)]],
      p(100, 90),
      [0, 0, 0, 1]
    )
    const poly = arced.byId<PolylineEntity>("P")
    expect(poly.vertices).toBeCloseToPoints(
      [...s.slice(0, 4), p(36.2772, 80)],
      4
    )
    expect(poly.bulges?.[3]).toBeCloseTo(1.362, 4)

    // The other end reaching an edge does not help.
    const stuck = extend(s, [[p(-50, -100), p(-50, 300)]], p(20, 0))
    expect(vertices(stuck)).toEqual(s)
    expect(stuck.commandLog().at(-1)).toBe("Object does not intersect an edge.")
  })

  it("Shift swaps TRIM and EXTEND on the fly", () => {
    // AutoCAD's Quick mode: holding Shift runs the opposite command.
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(-100, 0), { id: "T" }),
        lineOf(p(0, -100), p(0, 100), { id: "B" }),
      ],
    })

    cad.command("TRIM").click(p(-110, 0), { shiftKey: true })

    expect(endpoints(cad.byId<LineEntity>("T"))).toBeCloseToPoints([
      p(-200, 0),
      p(0, 0),
    ])
  })
})

// AutoCAD 2023's console (acc/t1–t5, v1–v7 of the hidden UCS words session).
describe("TRIM and EXTEND answer what is typed", () => {
  const drawing = () =>
    createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(50, -50), p(50, 50), { id: "V" }),
        lineOf(p(0, 20), p(100, 20), { id: "B" }),
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }

  it("a point typed picks there, `@` from LASTPOINT, which it becomes", () => {
    const cad = typed(drawing(), "ID", "5,5", "TRIM", "@75,-5")
    expect(endpoints(cad.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    typed(cad, "80,80")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select object to trim or shift-select to extend: @75,-5",
      "Select object to trim or shift-select to extend or [Undo]: 80,80",
    ])
    cad.enter()
    typed(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 80.00     Y = 80.00     Z = 0.00"
    )

    const extend = typed(drawing(), "EXTEND", "80,20")
    expect(extend.commandLog().slice(-2)).toEqual([
      "Select object to extend or shift-select to trim: 80,20",
      "Path does not intersect with the bounding edge.",
    ])
    expect(extend.state().commandLine.prompt).toBe(
      "EXTEND Select object to extend or shift-select to trim or [Undo]:"
    )
  })

  it("refuses anything else with *Invalid selection*, Undo on offer or not", () => {
    const cad = typed(drawing(), "TRIM", "FOO", "80,0", "FOO")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend: FOO",
      "*Invalid selection*",
      "Select object to trim or shift-select to extend: 80,0",
      "Select object to trim or shift-select to extend or [Undo]: FOO",
      "*Invalid selection*",
    ])
    cad.escape()
    typed(cad, "EXTEND", "C")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select object to extend or shift-select to trim: C",
      "*Invalid selection*",
    ])

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
    })
    typed(spanish, "RECORTA", "80,0", "FOO")
    expect(spanish.commandLog().slice(-3)).toEqual([
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar: 80,0",
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [desHacer]: FOO",
      "*Designación no válida*",
    ])
  })
})

// AutoCAD 2023's console (acc/e1–e7, m1–m4, w1, c1–c4, t1–t9, x1, o4 of the
// elliptical arcs session), read with LIST at AUPREC 4.
describe("TRIM and EXTEND an ellipse", () => {
  /**
   * a = 100, b = 50 round the origin, from the angle `from` to `to`
   * (degrees), as ELLIPSE's Arc asks them.
   */
  const arcOfEllipse = (from: number, to: number) =>
    ellipseOf(p(0, 0), p(100, 0), 0.5, {
      id: "E",
      startParam: ellipseParamFromAngle(0.5, deg(from)),
      endParam: ellipseParamFromAngle(0.5, deg(to)),
    })
  /** The point at the parameter `t` (degrees). */
  const at = (t: number) => p(100 * Math.cos(deg(t)), 50 * Math.sin(deg(t)))
  const ends = (cad: CadHarness, id = "E") => {
    const ellipse = cad.byId<EllipseEntity>(id)
    return [ellipseStartPoint(ellipse), ellipseEndPoint(ellipse)]
  }
  const below = lineOf(p(-200, -30), p(200, -30))
  const left = lineOf(p(-50, -100), p(-50, 100))

  it("grows the end the pick lies nearer in the ellipse's parameter", () => {
    for (const [from, to, edges, pick, grown] of [
      [0, 90, [left, below], 80, [p(100, 0), p(-50, 43.3013)]],
      [0, 90, [left, below], 10, [p(80, -30), p(0, 50)]],
      [0, 90, [left, below], 46, [p(100, 0), p(-50, 43.3013)]],
      [0, 90, [left, below], 44, [p(80, -30), p(0, 50)]],
      [30, 150, [below], 88, [p(80, -30), p(-65.4654, 37.7964)]],
      [30, 150, [below], 92, [p(65.4654, 37.7964), p(-80, -30)]],
      // Round past the start, to the edge's other crossing.
      [0, 90, [below], 80, [p(100, 0), p(-80, -30)]],
    ] as const) {
      const cad = createHarness({
        entities: [arcOfEllipse(from, to), ...edges],
      })
      cad.command("EXTEND").click(at(pick))
      expect(ends(cad)).toBeCloseToPoints(grown, 4)
    }
  })

  it("grows to a circle, an arc or a polyline", () => {
    for (const edge of [
      circleOf(p(-80, 0), 30),
      arcOf(p(-80, 0), 30, 0, deg(90)),
      polylineOf([p(-120, 0), p(-40, 60)]),
    ]) {
      const cad = createHarness({ entities: [arcOfEllipse(0, 90), edge] })
      cad.command("EXTEND").click(at(80))
      expect(ends(cad)).toBeCloseToPoints([p(100, 0), p(-80, 30)], 4)
    }
  })

  it("says why it reaches no edge, and Undo counts the pick", () => {
    for (const [locale, name, said] of [
      [
        undefined,
        "EXTEND",
        ["Object does not intersect an edge.", "Cannot EXTEND this object."],
      ],
      [
        es,
        "ALARGA",
        [
          "El objeto no se interseca con ninguna arista.",
          "Objeto no procesado por ALARGA.",
        ],
      ],
    ] as const) {
      const entities = [
        arcOfEllipse(0, 90),
        ellipseOf(p(0, 300), p(100, 0), 0.5, { id: "F" }),
        lineOf(p(300, 300), p(400, 300)),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(at(80))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      cad.click(p(-100, 300))
      expect(cad.commandLog().at(-1)).toBe(said[1])
      cad.option("Undo").option("Undo")
      expect(cad.commandLog().at(-1)).toMatch(/^(Command|Todos)/)
      expect(cad.optionIds()).toEqual([])
      expect(cad.entities()).toEqual(entities)
    }
  })

  it("trims an elliptical arc back to the edge, or in two", () => {
    const cad = createHarness({
      entities: [arcOfEllipse(0, 180), lineOf(p(0, -100), p(0, 100))],
    })
    cad.command("TRIM").click(at(45))
    expect(ends(cad)).toBeCloseToPoints([p(0, 50), p(-100, 0)], 4)

    const split = createHarness({
      entities: [
        arcOfEllipse(0, 180),
        lineOf(p(-50, -100), p(-50, 100), { id: "L" }),
        lineOf(p(50, -100), p(50, 100), { id: "R" }),
      ],
    })
    split.command("TRIM").click(p(0, 50))
    const pieces = split
      .entities()
      .filter((e): e is EllipseEntity => e.type === "ellipse")
      .map((e) => [ellipseStartPoint(e), ellipseEndPoint(e)])
      .sort((a, b) => b[0].x - a[0].x)
    expect(pieces).toHaveLength(2)
    expect(pieces[0]).toBeCloseToPoints([p(100, 0), p(50, 43.3013)], 4)
    expect(pieces[1]).toBeCloseToPoints([p(-50, 43.3013), p(-100, 0)], 4)
  })

  it("trims a whole ellipse to the arc left between two crossings", () => {
    const full = ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E" })
    const vertical = lineOf(p(0, -100), p(0, 100))
    for (const [edges, kept] of [
      [[vertical], [p(0, -50), p(0, 50)]],
      [
        [vertical, lineOf(p(-200, 30), p(200, 30))],
        [p(0, -50), p(-80, 30)],
      ],
    ] as const) {
      const cad = createHarness({ entities: [full, ...edges] })
      cad.command("TRIM").click(p(-100, 0))
      expect(ends(cad)).toBeCloseToPoints(kept, 4)
    }

    // Turned, its major axis upright.
    const turned = createHarness({
      entities: [
        ellipseOf(p(50, 0), p(0, 40), 0.5, { id: "T" }),
        lineOf(p(-200, -30), p(200, -30)),
      ],
    })
    turned.command("TRIM").click(p(50, 40))
    expect(ends(turned, "T")).toBeCloseToPoints(
      [p(36.7712, -30), p(63.2288, -30)],
      4
    )
  })

  it("deletes one no edge crosses, and refuses a whole one cut once", () => {
    const far = lineOf(p(300, 0), p(400, 0), { id: "far" })
    for (const ellipse of [
      arcOfEllipse(0, 90),
      ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E" }),
    ]) {
      const cad = createHarness({ entities: [ellipse, far] })
      cad.command("TRIM").click(ellipseStartPoint(ellipse))
      expect(cad.entities()).toEqual([far])
    }

    for (const [locale, name, said] of [
      [undefined, "TRIM", "Curve must intersect cutting edges at least twice."],
      [
        es,
        "RECORTA",
        "La curva debe intersecar las aristas de corte al menos dos veces.",
      ],
    ] as const) {
      const entities = [
        ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E" }),
        lineOf(p(0, 0), p(0, 100)),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(p(-100, 0))
      expect(cad.commandLog().at(-1)).toBe(said)
      expect(cad.entities()).toEqual(entities)
      expect(cad.state().commandLine.prompt).toMatch(/\[(Undo|desHacer)\]:$/)
    }
  })
})

// AutoCAD 2023's console (acc/b1, p1, p4, q1–q6, c3, s4, t2, t6, o3,
// p12 of the elliptical arcs session), read with LIST at AUPREC 4. The values
// are a CV spline's: a fit spline's end tangents are not AutoCAD's here.
describe("TRIM and EXTEND with an ellipse or a spline", () => {
  const ellipse = ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E" })
  const spline = createSpline(
    "fit",
    [p(0, 0), p(50, 30), p(100, 0), p(150, 30)],
    { id: "S" }
  )
  const cv = createSpline("cv", [p(0, 0), p(50, 50), p(100, -50), p(150, 0)], {
    id: "S",
  })

  it("cuts and grows a line to them", () => {
    const trim = (edge: Entity, line: LineEntity, pick: Vec2) => {
      const cad = createHarness({ entities: [edge, line] })
      cad.command("TRIM").click(pick)
      const kept = cad.byId<LineEntity>(line.id)
      return [kept.start, kept.end]
    }
    expect(
      trim(ellipse, lineOf(p(-200, 30), p(200, 30), { id: "L" }), p(150, 30))
    ).toBeCloseToPoints([p(-200, 30), p(80, 30)], 4)
    expect(
      trim(cv, lineOf(p(-50, 10), p(200, 10), { id: "L" }), p(175, 10))
    ).toBeCloseToPoints([p(-50, 10), p(53.1439, 10)], 4)

    for (const [edge, from, to, grown] of [
      [ellipse, p(200, 0), p(150, 0), p(100, 0)],
      [cv, p(75, 100), p(75, 60), p(75, 0)],
    ] as const) {
      const cad = createHarness({
        entities: [edge, lineOf(from, to, { id: "L" })],
      })
      cad.command("EXTEND").click(to)
      const line = cad.byId<LineEntity>("L")
      expect([line.start, line.end]).toBeCloseToPoints([from, grown], 4)
    }

    const polyline = createHarness({
      entities: [cv, polylineOf([p(40, 80), p(40, 40)], { id: "P" })],
    })
    polyline.command("EXTEND").click(p(40, 40))
    expect(polyline.byId<PolylineEntity>("P").vertices).toBeCloseToPoints(
      [p(40, 80), p(40, 13.6889)],
      4
    )
  })

  it("cuts a circle and grows an arc or an elliptical arc to them", () => {
    const cut = createHarness({
      entities: [cv, circleOf(p(75, 0), 20, { id: "C" })],
    })
    cut.command("TRIM").click(p(75, -20))
    const arc = cut.byId<ArcEntity>("C")
    expect(arc.startAngle).toBeCloseTo(deg(334.7844), 5)
    expect(arc.endAngle).toBeCloseTo(deg(154.7844), 5)

    const grown = createHarness({
      entities: [ellipse, arcOf(p(0, 0), 80, 0, deg(20), { id: "A" })],
    })
    grown.command("EXTEND").click(p(75.1754, 27.3616))
    expect(grown.byId<ArcEntity>("A").endAngle).toBeCloseTo(deg(25.6589), 5)
    const toSpline = createHarness({
      entities: [cv, arcOf(p(0, 0), 100, deg(330), deg(350), { id: "A" })],
    })
    toSpline.command("EXTEND").click(p(93.9693, -34.202))
    expect(toSpline.byId<ArcEntity>("A").endAngle).toBeCloseTo(deg(353.7367), 5)

    const round = createHarness({
      entities: [
        ellipseOf(p(0, 0), p(100, 0), 0.5, {
          id: "A",
          startParam: 0,
          endParam: deg(90),
        }),
        ellipseOf(p(-80, 0), p(30, 0), 0.5),
      ],
    })
    round.command("EXTEND").click(p(17.3648, 49.2404))
    const arcOfEllipse = round.byId<EllipseEntity>("A")
    expect([
      ellipseStartPoint(arcOfEllipse),
      ellipseEndPoint(arcOfEllipse),
    ]).toBeCloseToPoints([p(100, 0), p(-96.875, 12.402)], 4)

    const backToSpline = createHarness({
      entities: [
        ellipseOf(p(0, 0), p(100, 0), 0.5, {
          id: "A",
          startParam: 0,
          endParam: deg(90),
        }),
        cv,
      ],
    })
    backToSpline.command("EXTEND").click(p(98.4808, 8.6824))
    const grownBack = backToSpline.byId<EllipseEntity>("A")
    expect([
      ellipseStartPoint(grownBack),
      ellipseEndPoint(grownBack),
    ]).toBeCloseToPoints([p(97.8309, -10.3576), p(0, 50)], 4)
  })

  it("deletes a spline no edge crosses, and leaves one an edge cuts", () => {
    const far = lineOf(p(300, 0), p(400, 0), { id: "far" })
    const deleted = createHarness({ entities: [spline, far] })
    deleted.command("TRIM").click(p(0, 0))
    expect(deleted.entities()).toEqual([far])

    // The console leaves the piece on knots a spline here cannot hold.
    const entities = [spline, lineOf(p(-50, 15), p(200, 15))]
    const cut = createHarness({ entities })
    cut.command("TRIM").click(p(0, 0))
    expect(cut.entities()).toEqual(entities)
    expect(cut.optionIds()).toEqual([])
  })

  it("refuses a closed spline cut once, or extended", () => {
    const closed = createSpline(
      "fit",
      [p(0, 0), p(50, 30), p(100, 0), p(50, -30)],
      { id: "S", closed: true }
    )
    for (const [locale, trim, extend, said] of [
      [
        undefined,
        "TRIM",
        "EXTEND",
        [
          "Curve must intersect cutting edges at least twice.",
          "Cannot EXTEND this object.",
        ],
      ],
      [
        es,
        "RECORTA",
        "ALARGA",
        [
          "La curva debe intersecar las aristas de corte al menos dos veces.",
          "Objeto no procesado por ALARGA.",
        ],
      ],
    ] as const) {
      const entities = [closed, lineOf(p(50, 0), p(50, 100))]
      const cad = createHarness({ locale, entities })
      cad.command(trim).click(p(100, 0))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      expect(cad.state().commandLine.prompt).toMatch(/\[(Undo|desHacer)\]:$/)
      cad.escape().command(extend).click(p(0, 0))
      expect(cad.commandLog().at(-1)).toBe(said[1])
      expect(cad.state().commandLine.prompt).toMatch(/\[(Undo|desHacer)\]:$/)
      expect(cad.entities()).toEqual(entities)
    }
  })
})

describe("FILLET", () => {
  const corner = [
    lineOf(p(-50, 0), p(200, 0), { id: "L1" }),
    lineOf(p(0, -50), p(0, 200), { id: "L2" }),
  ]

  it("offers its keywords with no numeric field in the way", () => {
    const cad = createHarness({ entities: corner })

    cad.command("FILLET")

    expect(cad.optionAbbreviations()).toEqual(["U", "P", "R", "M"])
    expect(cad.hasFocusedField()).toBe(false)
  })

  it("reports its settings and asks AutoCAD's questions", () => {
    const cad = createHarness({ entities: corner })

    cad.command("FILLET")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
    )
    cad.option("Radius")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Specify fillet radius <0.00>:"
    )
    cad.type("50").enter().click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    cad.click(p(0, 100))

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual([
      "FILLET",
      "Current settings: Mode = TRIM, Radius = 0.00",
      "Select first object or [Undo/Polyline/Radius/Multiple]: R",
      "Specify fillet radius <0.00>: 50",
      "Select first object or [Undo/Polyline/Radius/Multiple]:",
      "Select second object or shift-select to apply corner or [Radius]:",
    ])
    cad.command("FILLET")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Mode = TRIM, Radius = 50.00"
    )
  })

  it("applies a corner when the second line is shift-selected", () => {
    const cad = createHarness({ entities: corner })

    cad.command("FILLET").option("Radius").type("50").enter()
    cad.click(p(100, 0)).click(p(0, 100), { shiftKey: true })

    expect(cad.entityCount).toBe(2)
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
    ])
    expect(endpoints(cad.byId<LineEntity>("L2"))).toBeCloseToPoints([
      p(0, 0),
      p(0, 200),
    ])
  })

  it("rounds the picked corner and trims both lines to the tangents", () => {
    const cad = createHarness({ entities: corner })

    cad
      .command("FILLET")
      .option("Radius")
      .type("50")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    expect(cad.entityCount).toBe(3)
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(50, 0),
      p(200, 0),
    ])
    expect(endpoints(cad.byId<LineEntity>("L2"))).toBeCloseToPoints([
      p(0, 50),
      p(0, 200),
    ])

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(50, 50))
    expect(arc.radius).toBeCloseTo(50)
  })

  it("joins the lines with no arc at radius 0", () => {
    const cad = createHarness({ entities: corner })

    cad
      .command("FILLET")
      .option("Radius")
      .type("0")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    expect(cad.typeCounts()).toEqual({ line: 2 })
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
    ])
  })

  it("remembers the radius between invocations", () => {
    // AutoCAD keeps FILLETRAD for the session; re-picking the command should
    // not silently reset it to zero.
    const cad = createHarness({ entities: corner })

    cad.command("FILLET").option("Radius").type("50").enter().escape()
    cad.command("FILLET").click(p(100, 0)).click(p(0, 100))

    expect(cad.only<ArcEntity>("arc").radius).toBeCloseTo(50)
  })

  it("keeps the lines' colour and puts the arc in their plane", () => {
    const cad = createHarness({
      entities: corner.map((line) => ({
        ...line,
        color: "#ff0000",
        elevation: 6,
        thickness: 2,
      })),
    })

    cad
      .command("FILLET")
      .option("Radius")
      .type("50")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    for (const line of linesOf(cad.entities())) {
      expect(line).toMatchObject({ color: "#ff0000", elevation: 6 })
    }
    expect(cad.only<ArcEntity>("arc")).toMatchObject({
      elevation: 6,
      thickness: 2,
    })
  })

  it("reverts the whole fillet in one undo step", () => {
    const cad = createHarness({ entities: corner })

    cad
      .command("FILLET")
      .option("Radius")
      .type("50")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))
    cad.undo()

    expect(cad.entityCount).toBe(2)
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(-50, 0),
      p(200, 0),
    ])
  })

  it("Polyline rounds every corner of a 2D polyline", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, -60), p(100, -60), p(100, 60), p(-100, 60)], {
          id: "P1",
          closed: true,
        }),
      ],
    })

    cad.command("FILLET").option("Radius").type("30").enter().option("Polyline")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select 2D polyline or [Radius]:"
    )
    cad.click(p(0, -60))

    const poly = cad.byId<PolylineEntity>("P1")
    // Each square corner becomes two vertices joined by a quarter-turn bulge.
    expect(poly.vertices).toHaveLength(8)
    expect(poly.closed).toBe(true)
    const arcs = poly.bulges?.filter((b) => b !== 0) ?? []
    expect(arcs).toHaveLength(4)
    for (const b of arcs) expect(b).toBeCloseTo(Math.tan(deg(22.5)), 6)
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select 2D polyline or [Radius]:",
      "4 lines were filleted",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes a polyline's segment as an object, not the whole polyline", () => {
    const ell = polylineOf([p(0, 100), p(0, 0), p(100, 0)], { id: "P1" })
    const cad = createHarness({ entities: [ell] })

    cad.command("FILLET").option("Radius").type("20").enter().click(p(0, 50))
    expect(cad.byId<PolylineEntity>("P1").vertices).toHaveLength(3)
    cad.click(p(50, 0))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 100),
      p(0, 20),
      p(20, 0),
      p(100, 0),
    ])
    expect(poly.bulges?.[1]).toBeCloseTo(Math.tan(deg(22.5)), 6)
    expect(cad.activeToolId()).toBe("select")
  })

  // AutoCAD 2023's console (acc/f1, f5, f14, f25, f27, g1–g8, h1–h7): an arc
  // segment is rounded against its circle where it crosses the other object,
  // either extended to it, each kept on its picked side.
  describe("an arc segment", () => {
    /** 0,0 → 100,0, then a half circle bulging east to 100,50. */
    const hook = () =>
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], {
        id: "P1",
        bulges: [0, 1, 0],
      })
    const crossing = () => lineOf(p(90, 40), p(140, 40), { id: "L1" })
    const fillet = (cad: CadHarness, radius: string, ...picks: Vec2[]) => {
      cad.command("FILLET").option("Radius").type(radius).enter()
      for (const pick of picks) cad.click(pick)
      return cad.byId<PolylineEntity>("P1")
    }

    it("joins a line it crosses through the arc, the line extended to it", () => {
      for (const line of [crossing(), lineOf(p(130, 40), p(140, 40))]) {
        const cad = createHarness({ entities: [hook(), line] })
        const joined = fillet(cad, "5", p(125, 25), p(135, 40))
        expect(cad.entityCount).toBe(1)
        expect(joined.vertices).toBeCloseToPoints(
          [
            p(0, 0),
            p(100, 0),
            p(123.5702, 33.3333),
            p(128.2843, 40),
            p(140, 40),
          ],
          4
        )
        expect(joined.bulges?.[1]).toBeCloseTo(0.5176, 4)
        expect(joined.bulges?.[2]).toBeCloseTo(-0.5176, 4)
        expect(joined.bulges?.[3] ?? 0).toBe(0)
      }

      const sharp = createHarness({ entities: [hook(), crossing()] })
      const met = fillet(sharp, "0", p(125, 25), p(135, 40))
      expect(met.vertices).toBeCloseToPoints(
        [p(0, 0), p(100, 0), p(120, 40), p(140, 40)],
        4
      )
      expect(met.bulges?.[1]).toBeCloseTo(0.618, 4)
    })

    it("joins the arcs of two polylines where they cross", () => {
      const cad = createHarness({
        entities: [
          hook(),
          polylineOf([p(140, 0), p(140, 50)], { id: "P2", bulges: [-1, 0] }),
        ],
      })
      const joined = fillet(cad, "5", p(112.5, 3.3494), p(118.3494, 12.5))
      expect(cad.entityCount).toBe(1)
      expect(joined.vertices).toBeCloseToPoints(
        [
          p(0, 0),
          p(100, 0),
          p(117.1875, 6.8454),
          p(118.125, 12.8969),
          p(140, 50),
        ],
        4
      )
      expect(joined.bulges?.slice(1, 4)).toEqual([
        expect.closeTo(0.1918, 4),
        expect.closeTo(0.342, 4),
        expect.closeTo(-0.5713, 4),
      ])
    })

    it("cannot round what it does not cross, or what the arc does not reach", () => {
      for (const [radius, other, picks] of [
        ["5", lineOf(p(130, -20), p(130, 80)), [p(125, 25), p(130, 60)]],
        ["5", lineOf(p(130, -20), p(130, 80)), [p(130, 60), p(125, 25)]],
        ["5", polylineOf([p(130, -20), p(130, 80)]), [p(125, 25), p(130, 60)]],
        ["30", crossing(), [p(125, 25), p(135, 40)]],
      ] as const) {
        const cad = createHarness({ entities: [hook(), other] })
        fillet(cad, radius, ...picks)
        expect(cad.commandLog().at(-1)).toBe(
          "Cannot fillet between these two entities."
        )
        expect(cad.activeToolId()).toBe("select")
        expect(cad.entityCount).toBe(2)
      }

      const multiple = createHarness({ entities: [hook(), crossing()] })
      multiple.command("FILLET").option("Radius").type("30").enter()
      multiple.option("Multiple").click(p(125, 25)).click(p(135, 40))
      expect(multiple.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
      expect(multiple.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )
    })

    it("rounds a line and an arc of one polyline where they meet", () => {
      const turn = () =>
        polylineOf([p(0, 0), p(100, 0), p(150, 50)], {
          id: "P1",
          bulges: [0, -Math.tan(deg(22.5)), 0],
        })
      for (const picks of [
        [p(50, 0), p(114.6447, 35.3553)],
        [p(114.6447, 35.3553), p(50, 0)],
      ]) {
        const cad = createHarness({ entities: [turn()] })
        const rounded = fillet(cad, "5", ...picks)
        expect(rounded.vertices).toBeCloseToPoints(
          [p(0, 0), p(95.2277, 0), p(100.207, 4.5455), p(150, 50)],
          4
        )
        expect(rounded.bulges?.slice(1, 3)).toEqual([
          expect.closeTo(0.3878, 4),
          expect.closeTo(-0.3878, 4),
        ])
      }

      const sharp = createHarness({ entities: [turn()] })
      expect(fillet(sharp, "0", p(50, 0), p(114.6447, 35.3553))).toEqual(turn())

      const arcs = createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, -50), p(100, -100)], {
            id: "P1",
            bulges: [Math.tan(deg(22.5)), Math.tan(deg(22.5)), 0],
          }),
        ],
      })
      const met = fillet(arcs, "5", p(14.6447, -35.3553), p(64.6447, -85.3553))
      expect(met.vertices).toBeCloseToPoints(
        [p(0, 0), p(45.6446, -49.8099), p(50.1901, -54.3554), p(100, -100)],
        4
      )
      expect(met.bulges?.slice(0, 3)).toEqual([
        expect.closeTo(0.3889, 4),
        expect.closeTo(-0.364, 4),
        expect.closeTo(0.3889, 4),
      ])
    })

    it("removes the segment between a line and an arc it rounds", () => {
      const step = () =>
        polylineOf([p(0, 0), p(100, 0), p(100, 20), p(140, 60)], {
          id: "P1",
          bulges: [0, 0, -Math.tan(deg(22.5)), 0],
        })
      const cad = createHarness({ entities: [step()] })
      const rounded = fillet(cad, "5", p(50, 0), p(111.7157, 48.2843))
      expect(rounded.vertices).toBeCloseToPoints(
        [p(0, 0), p(97.5736, 0), p(102.2876, 6.6667), p(140, 60)],
        4
      )
      expect(rounded.bulges?.slice(1, 3)).toEqual([
        expect.closeTo(0.5176, 4),
        expect.closeTo(-0.5176, 4),
      ])

      const sharp = createHarness({ entities: [step()] })
      const met = fillet(sharp, "0", p(50, 0), p(111.7157, 48.2843))
      expect(met.vertices).toBeCloseToPoints(
        [p(0, 0), p(105.359, 0), p(140, 60)],
        4
      )
      expect(met.bulges?.[1]).toBeCloseTo(-0.5774, 4)
    })

    it("says a tangent arc makes no corner, on the line it is invalid", () => {
      for (const radius of ["5", "0"]) {
        const cad = createHarness({ entities: [hook()] })
        fillet(cad, radius, p(125, 25), p(50, 0))
        expect(cad.commandLog().at(-1)).toBe(
          "Cannot fillet between these two entities.*Invalid*"
        )
        expect(cad.byId<PolylineEntity>("P1")).toEqual(hook())
      }

      const spanish = createHarness({ locale: es, entities: [hook()] })
      spanish.command("EMPALME").option("Radius").type("5").enter()
      spanish.click(p(125, 25)).click(p(50, 0))
      expect(spanish.commandLog().at(-1)).toBe(
        "Imposible empalmar esos dos objetos.*No válido*"
      )
    })
  })

  // AutoCAD 2023's console (acc/f1–f17, r15): the line joins the polyline,
  // which keeps its run on the picked side of the segment and drops the rest.
  describe("a line with a polyline's segment", () => {
    const ell = () => polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P1" })
    const QUARTER = Math.tan(deg(22.5))

    it("joins the line into the polyline through the arc, in one undo step", () => {
      for (const [first, second] of [
        [p(100, 25), p(60, 80)],
        [p(60, 80), p(100, 25)],
      ]) {
        const cad = createHarness({
          entities: [ell(), lineOf(p(50, 80), p(120, 80), { id: "L1" })],
        })
        cad.command("FILLET").option("Radius").type("10").enter()
        cad.click(first).click(second)

        const poly = cad.only<PolylineEntity>("polyline")
        expect(cad.entityCount).toBe(1)
        expect(poly.id).toBe("P1")
        expect(poly.closed).toBe(false)
        expect(poly.vertices).toBeCloseToPoints([
          p(0, 0),
          p(100, 0),
          p(100, 70),
          p(90, 80),
          p(50, 80),
        ])
        expect(poly.bulges?.[2]).toBeCloseTo(QUARTER, 6)
        cad.undo()
        expect(cad.typeCounts()).toEqual({ polyline: 1, line: 1 })
      }
    })

    it("starts the polyline at the line where the run is the later one", () => {
      const cad = createHarness({
        entities: [ell(), lineOf(p(-30, 40), p(-30, -20))],
      })
      cad.command("FILLET").option("Radius").type("10").enter()
      cad.click(p(50, 0)).click(p(-30, 30))

      const poly = cad.only<PolylineEntity>("polyline")
      expect(poly.vertices).toBeCloseToPoints([
        p(-30, 40),
        p(-30, 10),
        p(-20, 0),
        p(100, 0),
        p(100, 50),
      ])
      expect(poly.bulges?.[1]).toBeCloseTo(QUARTER, 6)
    })

    it("drops the polyline past the segment, and opens a closed one", () => {
      const middle = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(100, 50), p(150, 50)]),
          lineOf(p(50, 30), p(80, 30)),
        ],
      })
      middle.command("FILLET").option("Radius").type("5").enter()
      middle.click(p(100, 25)).click(p(60, 30))
      expect(
        middle.only<PolylineEntity>("polyline").vertices
      ).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 25),
        p(95, 30),
        p(50, 30),
      ])

      const closed = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(100, 50)], { closed: true }),
          lineOf(p(120, 80), p(120, -30)),
        ],
      })
      closed.command("FILLET").option("Radius").type("5").enter()
      closed.click(p(50, 0)).click(p(120, 50))
      const opened = closed.only<PolylineEntity>("polyline")
      expect(opened.closed).toBe(false)
      expect(opened.vertices).toBeCloseToPoints([
        p(0, 0),
        p(115, 0),
        p(120, 5),
        p(120, 80),
      ])
    })

    it("turns the arc the corner's way, meets at radius 0 and refuses no size", () => {
      const across = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(100, 100)]),
          lineOf(p(50, 80), p(150, 80)),
        ],
      })
      across.command("FILLET").option("Radius").type("10").enter()
      across.click(p(100, 40)).click(p(130, 80))
      const turned = across.only<PolylineEntity>("polyline")
      expect(turned.vertices).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 70),
        p(110, 80),
        p(150, 80),
      ])
      expect(turned.bulges?.[2]).toBeCloseTo(-QUARTER, 6)

      const sharp = createHarness({
        entities: [ell(), lineOf(p(50, 80), p(120, 80))],
      })
      sharp.command("FILLET").click(p(100, 25)).click(p(60, 80))
      expect(sharp.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints(
        [p(0, 0), p(100, 0), p(100, 80), p(50, 80)]
      )

      // Past the line's kept end the polyline doubles back to it.
      const large = createHarness({
        entities: [ell(), lineOf(p(50, 80), p(120, 80))],
      })
      large.command("FILLET").option("Radius").type("60").enter()
      large.click(p(100, 25)).click(p(60, 80))
      expect(large.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints(
        [p(0, 0), p(100, 0), p(100, 20), p(40, 80), p(50, 80)]
      )
    })

    it("says when the line is not in the polyline's plane", () => {
      const raised = {
        ...lineOf(p(50, 80), p(120, 80)),
        elevation: 5,
      }
      const cad = createHarness({ entities: [ell(), raised] })
      cad.command("FILLET").click(p(100, 25)).click(p(60, 80))
      expect(cad.commandLog().at(-1)).toBe(
        "Line and polyline are non coplanar."
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.typeCounts()).toEqual({ polyline: 1, line: 1 })

      cad
        .command("FILLET")
        .option("Multiple")
        .click(p(100, 25))
        .click(p(60, 80))
      expect(cad.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )

      const spanish = createHarness({ locale: es, entities: [ell(), raised] })
      spanish.command("EMPALME").click(p(100, 25)).click(p(60, 80))
      expect(spanish.commandLog().at(-1)).toBe(
        "La línea y la polilínea no son coplanares."
      )
    })

    it("says it cannot fillet a line parallel to the segment, and ends", () => {
      const cad = createHarness({
        entities: [ell(), lineOf(p(120, 0), p(120, 50))],
      })
      cad.command("FILLET").click(p(100, 25)).click(p(120, 25))
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.typeCounts()).toEqual({ polyline: 1, line: 1 })
    })
  })

  // AutoCAD 2023's console (acc/g1–g10, r1–r4, r13): one polyline of the two,
  // the one picked first, each keeping its run on its picked side.
  describe("segments of two polylines", () => {
    const ell = () => polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P1" })
    const hook = () =>
      polylineOf([p(50, 80), p(120, 80), p(120, 150)], { id: "P2" })

    it("joins them into the one picked first, its direction kept, in one undo step", () => {
      const cad = createHarness({ entities: [ell(), hook()] })
      cad.command("FILLET").click(p(100, 25)).click(p(60, 80))
      const joined = cad.only<PolylineEntity>("polyline")
      expect(joined.id).toBe("P1")
      expect(joined.vertices).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 80),
        p(50, 80),
      ])
      cad.undo()
      expect(cad.typeCounts()).toEqual({ polyline: 2 })

      const hookFirst = createHarness({ entities: [ell(), hook()] })
      hookFirst.command("FILLET").click(p(60, 80)).click(p(100, 25))
      const other = hookFirst.only<PolylineEntity>("polyline")
      expect(other.id).toBe("P2")
      expect(other.vertices).toBeCloseToPoints([
        p(50, 80),
        p(100, 80),
        p(100, 0),
        p(0, 0),
      ])

      const rounded = createHarness({ entities: [ell(), hook()] })
      rounded.command("FILLET").option("Radius").type("10").enter()
      rounded.click(p(100, 25)).click(p(60, 80))
      const arc = rounded.only<PolylineEntity>("polyline")
      expect(arc.vertices).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 70),
        p(90, 80),
        p(50, 80),
      ])
      expect(arc.bulges?.[2]).toBeCloseTo(Math.tan(deg(22.5)), 6)
    })

    it("keeps the first one's layer and colour", () => {
      const cad = createHarness()
      cad.runtime.document.load(
        [
          polylineOf([p(0, 0), p(100, 0), p(100, 50)], {
            id: "P1",
            layerId: "L1",
          }),
          {
            ...polylineOf([p(50, 80), p(120, 80), p(120, 150)], {
              id: "P2",
              layerId: "L2",
            }),
            color: "#ff0000",
          },
        ],
        { layers: [layerOf("0"), layerOf("L1"), layerOf("L2")] }
      )
      cad.command("FILLET").click(p(60, 80)).click(p(100, 25))
      const joined = cad.only<PolylineEntity>("polyline")
      expect(joined.id).toBe("P2")
      expect(joined.layerId).toBe("L2")
      expect(joined.color).toBe("#ff0000")
    })

    it("leads with the second one's run where the first's runs on to its end", () => {
      const cad = createHarness({
        entities: [
          polylineOf([p(100, 50), p(100, 0), p(0, 0)], { id: "P1" }),
          hook(),
        ],
      })
      cad.command("FILLET").click(p(100, 25)).click(p(60, 80))
      const joined = cad.only<PolylineEntity>("polyline")
      expect(joined.id).toBe("P1")
      expect(joined.vertices).toBeCloseToPoints([
        p(50, 80),
        p(100, 80),
        p(100, 0),
        p(0, 0),
      ])
    })

    it("drops what lies past either segment, and opens a closed one", () => {
      const middle = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(100, 50), p(150, 50)]),
          polylineOf([p(30, 120), p(30, 80), p(120, 80), p(120, 150)]),
        ],
      })
      middle.command("FILLET").click(p(100, 25)).click(p(60, 80))
      expect(
        middle.only<PolylineEntity>("polyline").vertices
      ).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 80),
        p(30, 80),
        p(30, 120),
      ])

      for (const [first, second] of [
        [
          polylineOf([p(0, 0), p(100, 0), p(100, 50), p(0, 50)], {
            closed: true,
          }),
          hook(),
        ],
        [
          ell(),
          polylineOf([p(50, 80), p(120, 80), p(120, 150), p(50, 150)], {
            closed: true,
          }),
        ],
      ]) {
        const closed = createHarness({ entities: [first, second] })
        closed.command("FILLET").click(p(100, 25)).click(p(60, 80))
        const opened = closed.only<PolylineEntity>("polyline")
        expect(opened.closed).toBe(false)
        expect(opened.vertices).toBeCloseToPoints([
          p(0, 0),
          p(100, 0),
          p(100, 80),
          p(50, 80),
        ])
      }
    })

    it("refuses no radius for its size", () => {
      const cad = createHarness({ entities: [ell(), hook()] })
      cad.command("FILLET").option("Radius").type("200").enter()
      cad.click(p(100, 25)).click(p(60, 80))
      expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, -120),
        p(-100, 80),
        p(50, 80),
      ])
    })

    it("says why it cannot join them, and ends or in Multiple asks again", () => {
      const parallel = () => [
        ell(),
        polylineOf([p(120, 0), p(120, 50), p(120, 100)]),
      ]
      const cad = createHarness({ entities: parallel() })
      cad.command("FILLET").click(p(100, 25)).click(p(120, 25))
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.typeCounts()).toEqual({ polyline: 2 })

      cad
        .command("FILLET")
        .option("Multiple")
        .click(p(100, 25))
        .click(p(120, 25))
      expect(cad.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )

      const raised = () => [ell(), { ...hook(), elevation: 10 }]
      const apart = createHarness({ entities: raised() })
      apart.command("FILLET").click(p(100, 25)).click(p(60, 80))
      expect(apart.commandLog().at(-1)).toBe("Two entities are non coplanar.")
      expect(apart.activeToolId()).toBe("select")

      const spanish = createHarness({ locale: es, entities: parallel() })
      spanish.command("EMPALME").click(p(100, 25)).click(p(120, 25))
      expect(spanish.commandLog().at(-1)).toBe(
        "Imposible empalmar esos dos objetos."
      )
      const spanishApart = createHarness({ locale: es, entities: raised() })
      spanishApart.command("EMPALME").click(p(100, 25)).click(p(60, 80))
      expect(spanishApart.commandLog().at(-1)).toBe(
        "Los dos objetos no son coplanares."
      )
    })
  })

  it("removes the segment between two it fillets, and closes an open polyline's ends", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 100), p(0, 10), p(10, 0), p(100, 0)], { id: "P1" }),
        polylineOf(
          [p(300, 20), p(300, 100), p(400, 100), p(400, 0), p(320, 0)],
          { id: "P2" }
        ),
      ],
    })

    cad.command("FILLET").click(p(0, 50)).click(p(50, 0))
    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(0, 100),
      p(0, 0),
      p(100, 0),
    ])

    cad.command("FILLET").click(p(300, 50)).click(p(350, 0))
    const closed = cad.byId<PolylineEntity>("P2")
    expect(closed.closed).toBe(true)
    expect(closed.vertices).toBeCloseToPoints([
      p(300, 0),
      p(300, 100),
      p(400, 100),
      p(400, 0),
    ])
  })

  it("Polyline leaves a tangent arc and a segment too short alone", () => {
    // A slot: two lines joined by a half-circle end, then a short jog.
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 40), p(0, 40), p(0, 45)], {
          id: "P1",
          bulges: [0, 1, 0, 0],
        }),
      ],
    })

    cad.command("FILLET").option("Radius").type("10").enter().option("Polyline")
    cad.click(p(50, 40))

    // The jog at (0, 40) is 5 long: no 10 fillet fits there; the half circle
    // lies between parallel lines.
    expect(cad.byId<PolylineEntity>("P1").vertices).toHaveLength(5)
    expect(cad.commandLog().slice(-2)).toEqual([
      "0 lines were filleted",
      "1 was parallel    1 was too short",
    ])
  })

  it("Polyline rounds a corner where a line meets an arc (FILLETPOLYARC 1)", () => {
    // The line runs along +X into an arc about (150, 0) that turns up +Y.
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(150, 50)], {
          id: "P1",
          bulges: [0, -Math.tan(deg(22.5))],
        }),
      ],
    })

    cad.command("FILLET").option("Radius").type("10").enter().option("Polyline")
    cad.click(p(50, 0))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toHaveLength(4)
    expect(poly.vertices[1].y).toBeCloseTo(0)
    expect(poly.vertices[3]).toBeCloseToPoint(p(150, 50))
    expect(cad.commandLog().at(-1)).toBe("1 line was filleted")
  })

  it("Polyline replaces an arc between converging lines, and radius 0 removes it", () => {
    const rounded = polylineOf([p(0, 100), p(0, 20), p(20, 0), p(100, 0)], {
      id: "P1",
      // A quarter circle of radius 20 about (20, 20), tangent to both lines.
      bulges: [0, Math.tan(deg(22.5)), 0],
    })
    const cad = createHarness({ entities: [rounded] })

    cad.command("FILLET").option("Radius").type("40").enter().option("Polyline")
    cad.click(p(0, 60))
    let poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 100),
      p(0, 40),
      p(40, 0),
      p(100, 0),
    ])
    expect(poly.bulges?.[1]).toBeCloseTo(Math.tan(deg(22.5)), 6)

    cad.command("FILLET").option("Radius").type("0").enter().option("Polyline")
    cad.click(p(0, 60))
    poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([p(0, 100), p(0, 0), p(100, 0)])
    expect(poly.bulges).toBeUndefined()
  })

  it("Multiple keeps asking until Enter, and Undo takes back the last fillet", () => {
    const cad = createHarness({
      entities: [
        ...corner,
        lineOf(p(300, 0), p(500, 0), { id: "L3" }),
        lineOf(p(400, -50), p(400, 200), { id: "L4" }),
      ],
    })
    cad.command("LINE").click(p(0, -300)).click(p(100, -300)).enter()

    cad.command("FILLET").option("Radius").type("20").enter()
    cad.option("Multiple")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
    )
    cad.click(p(100, 0)).click(p(0, 100))
    expect(cad.activeToolId()).toBe("fillet")
    cad.click(p(450, 0)).click(p(400, 100))
    expect(cad.typeCounts()).toEqual({ line: 5, arc: 2 })

    cad.option("Undo")
    expect(cad.typeCounts()).toEqual({ line: 5, arc: 1 })
    // The radius given in the command is a step too, the last to go; Undo
    // stops there: the LINE before the command stays.
    cad.option("Undo").option("Undo").option("Undo")
    expect(cad.typeCounts()).toEqual({ line: 5 })
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: U",
      "Select first object or [Undo/Polyline/Radius/Multiple]: U",
      "Command has been completely undone.",
      "Select first object or [Undo/Polyline/Radius/Multiple]: U",
      "Command has been completely undone.",
      "Select first object or [Undo/Polyline/Radius/Multiple]:",
    ])
    cad.command("FILLET")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Mode = TRIM, Radius = 0.00"
    )
  })

  it("says why two segments of a polyline make no corner", () => {
    const cad = createHarness({
      entities: [
        // Segments 0 and 2 run apart from the one between them.
        polylineOf([p(0, 0), p(-10, 100), p(110, 100), p(100, 0)], {
          id: "P1",
        }),
        polylineOf([p(300, 0), p(300, 100), p(400, 100), p(400, 0)], {
          id: "P2",
        }),
      ],
    })

    // Outside Multiple the input is invalid and the command ends.
    cad.command("FILLET").click(p(-5, 50)).click(p(105, 50))
    expect(cad.commandLog().slice(-2)).toEqual(["Lines diverge", "*Invalid*"])
    expect(cad.activeToolId()).toBe("select")

    cad.command("FILLET").option("Multiple")
    cad.click(p(300, 50)).click(p(400, 50))
    expect(cad.commandLog().at(-1)).toBe("Lines are parallel")
    cad.option("Radius").type("120").enter()
    cad.click(p(300, 50)).click(p(350, 100))
    expect(cad.commandLog().at(-1)).toBe("Fillet radius is too large")
    expect(cad.activeToolId()).toBe("fillet")
    expect(cad.byId<PolylineEntity>("P2").vertices).toHaveLength(4)
  })

  it("Polyline counts the corners it leaves on the line after", () => {
    const cad = createHarness({
      entities: [
        // A collinear vertex at (50, 0) and a jog too short at the far end.
        polylineOf([p(0, 0), p(50, 0), p(100, 0), p(100, 100), p(105, 100)], {
          id: "P1",
        }),
        polylineOf([p(300, 0), p(400, 0), p(400, 100), p(300, 100)], {
          id: "SQ",
          closed: true,
        }),
      ],
    })

    cad.command("FILLET").option("Radius").type("10").enter().option("Polyline")
    cad.click(p(25, 0))
    expect(cad.commandLog().slice(-2)).toEqual([
      "1 line was filleted",
      "1 was parallel    1 was too short",
    ])
    // At radius 0 a square's corners are already sharp, and still counted.
    cad.command("FILLET").option("Radius").type("0").enter().option("Polyline")
    cad.click(p(350, 0))
    expect(cad.commandLog().at(-1)).toBe("4 lines were filleted")
    expect(cad.byId<PolylineEntity>("SQ").vertices).toHaveLength(4)
  })

  // AutoCAD 2023's console (acc/a*, b*, c*, d*, p*, q*, r* of this session):
  // the fillet lies on the side of each object the other was picked on; a
  // circle is never trimmed; LIST's values to 4 decimals.
  describe("arcs and circles", () => {
    const line = () => lineOf(p(0, 0), p(100, 0), { id: "L1" })
    /** The upper half of a circle round 50,-10, crossing L1 twice. */
    const half = () => arcOf(p(50, -10), 30, 0, deg(180), { id: "A1" })
    const circle = () => circleOf(p(50, 20), 30, { id: "C1" })
    const fillet = (
      entities: Entity[],
      radius: string,
      ...picks: Vec2[]
    ): CadHarness => {
      const cad = createHarness({ entities })
      cad.command("FILLET").option("Radius").type(radius).enter()
      for (const pick of picks) cad.click(pick)
      return cad
    }
    const degrees = (radians: number) => (radians * 180) / Math.PI
    const expectArc = (
      arc: ArcEntity,
      center: Vec2,
      radius: number,
      start: number,
      end: number
    ) => {
      expect(arc.center).toBeCloseToPoint(center, 4)
      expect(arc.radius).toBeCloseTo(radius, 4)
      expect(degrees(arc.startAngle)).toBeCloseTo(start, 4)
      expect(degrees(arc.endAngle)).toBeCloseTo(end, 4)
    }
    const filletArc = (cad: CadHarness) =>
      cad
        .entities()
        .find((e): e is ArcEntity => e.type === "arc" && e.radius < 20)!

    it("rounds a line and an arc where the picks say, either picked first", () => {
      for (const picks of [
        [p(10, 0), p(50, 20)],
        [p(50, 20), p(10, 0)],
      ]) {
        const cad = fillet([line(), half()], "5", ...picks)
        expect(cad.activeToolId()).toBe("select")
        expect(cad.byId<LineEntity>("L1")).toMatchObject({
          start: p(0, 0),
          end: expect.objectContaining({ y: 0 }),
        })
        expect(cad.byId<LineEntity>("L1").end.x).toBeCloseTo(18.3772, 4)
        expectArc(cad.byId<ArcEntity>("A1"), p(50, -10), 30, 0, 154.6231)
        expectArc(filletArc(cad), p(18.3772, 5), 5, 270, 334.6231)
      }

      // Below the line, where the arc is picked under it: kept beyond.
      const below = fillet([line(), half()], "5", p(10, 0), p(79.5442, -4.7906))
      expect(below.byId<LineEntity>("L1").end).toBeCloseToPoint(p(15.359, 0), 4)
      expectArc(below.byId<ArcEntity>("A1"), p(50, -10), 30, 171.7868, 180)
      expectArc(filletArc(below), p(15.359, -5), 5, 351.7868, 90)

      // Picked inside the circle: the fillet inside it, nearest the pick.
      const inside = fillet([line(), half()], "5", p(60, 0), p(50, 20))
      expect(inside.byId<LineEntity>("L1").end).toBeCloseToPoint(p(70, 0), 4)
      expectArc(inside.byId<ArcEntity>("A1"), p(50, -10), 30, 36.8699, 180)
      expectArc(filletArc(inside), p(70, 5), 5, 270, 36.8699)
    })

    it("extends a line or an arc to the fillet", () => {
      const short = fillet(
        [lineOf(p(0, 0), p(15, 0), { id: "L1" }), half()],
        "5",
        p(5, 0),
        p(50, 20)
      )
      expect(short.byId<LineEntity>("L1").end).toBeCloseToPoint(
        p(18.3772, 0),
        4
      )

      const arc = arcOf(p(50, -10), 30, deg(30), deg(150), { id: "A1" })
      const reached = fillet([line(), arc], "5", p(10, 0), p(50, 20))
      expectArc(reached.byId<ArcEntity>("A1"), p(50, -10), 30, 30, 154.6231)
    })

    it("never trims a circle, and keeps a line on the side it runs on", () => {
      const right = fillet([line(), circle()], "5", p(75, 0), p(20, 20))
      expect(right.byId<CircleEntity>("C1")).toEqual(circle())
      expect(right.byId<LineEntity>("L1")).toMatchObject({ end: p(100, 0) })
      expect(right.byId<LineEntity>("L1").start).toBeCloseToPoint(
        p(81.6228, 0),
        4
      )
      expectArc(filletArc(right), p(81.6228, 5), 5, 154.6231, 270)

      const under = fillet([line(), circle()], "5", p(10, 0), p(50, -10))
      expect(under.byId<LineEntity>("L1").end).toBeCloseToPoint(
        p(25.5051, 0),
        4
      )
      expectArc(filletArc(under), p(25.5051, -5), 5, 45.5847, 90)

      // The circle picked first: the line's pick still chooses.
      const within = fillet([line(), circle()], "5", p(20, 20), p(60, 0))
      expect(within.byId<LineEntity>("L1").end).toBeCloseToPoint(p(70, 0), 4)
      expectArc(filletArc(within), p(70, 5), 5, 270, 323.1301)
    })

    it("rounds a line and a circle that do not meet, where a fillet fits", () => {
      const apart = () => circleOf(p(50, 50), 30, { id: "C1" })
      const cad = fillet([line(), apart()], "15", p(10, 0), p(20, 50))
      expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(21.7157, 0), 4)
      expect(filletArc(cad).center).toBeCloseToPoint(p(21.7157, 15), 4)

      for (const radius of ["5", "0"]) {
        const none = fillet([line(), apart()], radius, p(10, 0), p(20, 50))
        expect(none.commandLog().at(-1)).toBe(
          `No valid fillet with radius ${radius}.00`
        )
        expect(none.activeToolId()).toBe("select")
        expect(none.entities()).toEqual([line(), apart()])
      }

      const multiple = createHarness({ entities: [line(), apart()] })
      multiple.command("FILLET").option("Radius").type("5").enter()
      multiple.option("Multiple").click(p(10, 0)).click(p(20, 50))
      expect(multiple.commandLog().at(-1)).toBe(
        "No valid fillet with radius 5.00"
      )
      expect(multiple.state().commandLine.prompt).toBe(
        "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
      )

      const spanish = createHarness({ locale: es, entities: [line(), apart()] })
      spanish.command("EMPALME").option("Radius").type("5").enter()
      spanish.click(p(10, 0)).click(p(20, 50))
      expect(spanish.commandLog().at(-1)).toBe(
        "No hay un empalme válido con el radio 5.00"
      )
    })

    it("rounds two arcs, or two circles, where the picks say", () => {
      const left = () => arcOf(p(0, 0), 30, 0, deg(180), { id: "A1" })
      const crossing = fillet(
        [left(), arcOf(p(40, 0), 30, 0, deg(180), { id: "A2" })],
        "5",
        p(-25.9808, 15),
        p(65.9808, 15)
      )
      expectArc(crossing.byId<ArcEntity>("A1"), p(0, 0), 30, 55.1501, 180)
      expectArc(crossing.byId<ArcEntity>("A2"), p(40, 0), 30, 0, 124.8499)
      expectArc(filletArc(crossing), p(20, 28.7228), 5, 235.1501, 304.8499)

      const apart = fillet(
        [left(), arcOf(p(70, 0), 30, 0, deg(180), { id: "A2" })],
        "10",
        p(-25.9808, 15),
        p(95.9808, 15)
      )
      expectArc(apart.byId<ArcEntity>("A1"), p(0, 0), 30, 28.955, 180)
      expectArc(apart.byId<ArcEntity>("A2"), p(70, 0), 30, 0, 151.045)
      expectArc(filletArc(apart), p(35, 19.3649), 10, 208.955, 331.045)

      // Picked inside the other circle: the fillet inside that one.
      const within = fillet(
        [left(), arcOf(p(40, 0), 30, 0, deg(180), { id: "A2" })],
        "5",
        p(25.9808, 15),
        p(65.9808, 15)
      )
      expectArc(within.byId<ArcEntity>("A1"), p(0, 0), 30, 0, 38.2132)
      expectArc(within.byId<ArcEntity>("A2"), p(40, 0), 30, 0, 120)
      expectArc(filletArc(within), p(27.5, 21.6506), 5, 120, 218.2132)

      const circles = () => [
        circleOf(p(0, 0), 30, { id: "C1" }),
        circleOf(p(40, 0), 30, { id: "C2" }),
      ]
      const under = fillet(circles(), "5", p(-25.9808, -15), p(70, 0))
      expect(under.entities().slice(0, 2)).toEqual(circles())
      expectArc(filletArc(under), p(20, -28.7228), 5, 55.1501, 124.8499)
    })

    it("meets at radius 0 where they cross, each kept on its picked part", () => {
      const met = fillet([line(), half()], "0", p(10, 0), p(50, 20))
      expect(met.typeCounts()).toEqual({ line: 1, arc: 1 })
      expect(met.byId<LineEntity>("L1").end).toBeCloseToPoint(p(21.7157, 0), 4)
      expectArc(met.byId<ArcEntity>("A1"), p(50, -10), 30, 0, 160.5288)

      const beyond = fillet(
        [line(), half()],
        "0",
        p(10, 0),
        p(20.4558, -4.7906)
      )
      expectArc(beyond.byId<ArcEntity>("A1"), p(50, -10), 30, 160.5288, 180)

      // Off the arc: reached from the end its pick is nearer.
      const arc = () => arcOf(p(50, -10), 30, deg(30), deg(150), { id: "A1" })
      const nearEnd = fillet([line(), arc()], "0", p(10, 0), p(35, 15.9808))
      expectArc(nearEnd.byId<ArcEntity>("A1"), p(50, -10), 30, 30, 160.5288)
      const nearStart = fillet([line(), arc()], "0", p(10, 0), p(65, 15.9808))
      expectArc(nearStart.byId<ArcEntity>("A1"), p(50, -10), 30, 160.5288, 150)

      const circled = fillet([line(), circle()], "0", p(90, 0), p(50, 50))
      expect(circled.byId<LineEntity>("L1").start).toBeCloseToPoint(
        p(72.3607, 0),
        4
      )
      expect(circled.byId<CircleEntity>("C1")).toEqual(circle())

      const arcs = fillet(
        [
          arcOf(p(0, 0), 30, 0, deg(180), { id: "A1" }),
          circleOf(p(40, 0), 30, { id: "C2" }),
        ],
        "0",
        p(-25.9808, 15),
        p(70, 0)
      )
      expectArc(arcs.byId<ArcEntity>("A1"), p(0, 0), 30, 48.1897, 180)

      // Two circles: nothing to trim, nothing said.
      const circles = [
        circleOf(p(0, 0), 30, { id: "C1" }),
        circleOf(p(40, 0), 30, { id: "C2" }),
      ]
      const untouched = fillet(circles, "0", p(-30, 0), p(70, 0))
      expect(untouched.entities()).toEqual(circles)
      expect(untouched.activeToolId()).toBe("select")
      expect(untouched.commandLog().at(-1)).toBe(
        "Select second object or shift-select to apply corner or [Radius]:"
      )
    })

    it("puts the arc on the shared layer, else the current one, in one undo step", () => {
      const cad = createHarness()
      cad.runtime.document.load([line(), { ...half(), layerId: "L2" }], {
        layers: [layerOf("0"), layerOf("L2"), layerOf("L3")],
      })
      cad.runtime.document.setCurrentLayer("L3")
      cad.command("FILLET").option("Radius").type("5").enter()
      cad.click(p(10, 0)).click(p(50, 20))
      expect(filletArc(cad).layerId).toBe("L3")
      expect(cad.byId<ArcEntity>("A1").layerId).toBe("L2")

      cad.undo()
      expect(cad.entities()).toEqual([line(), { ...half(), layerId: "L2" }])
    })

    it("cannot fillet one with a polyline", () => {
      const cad = fillet(
        [polylineOf([p(0, 0), p(100, 0)], { id: "P1" }), half()],
        "5",
        p(10, 0),
        p(50, 20)
      )
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entityCount).toBe(2)
    })

    it("refuses a word typed after an arc is picked", () => {
      for (const [locale, name, refused] of [
        [
          undefined,
          "FILLET",
          [
            "Select second object or shift-select to apply corner or [Radius]: FOO",
            "*Invalid selection*",
            "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
          ],
        ],
        [
          es,
          "EMPALME",
          [
            "Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]: FOO",
            "*Designación no válida*",
            "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Radio]:",
          ],
        ],
      ] as const) {
        const cad = createHarness({ locale, entities: [line(), half()] })
        cad.command(name).click(p(50, 20))
        cad.runtime.setCommandLineText("FOO")
        cad.runtime.submitCommandLine()
        expect(cad.commandLog().slice(-3)).toEqual(refused)
        cad.click(p(10, 0))
        expect(cad.typeCounts()).toEqual({ line: 1, arc: 1 })
        expect(cad.activeToolId()).toBe("select")
      }
    })
  })
})

describe("CHAMFER", () => {
  const corner = [
    lineOf(p(-50, 0), p(200, 0), { id: "L1" }),
    lineOf(p(0, -50), p(0, 200), { id: "L2" }),
  ]

  it("reports its settings and asks AutoCAD's questions", () => {
    const cad = createHarness({ entities: corner })

    cad.command("CHAMFER")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:"
    )
    cad.option("Distance")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Specify first chamfer distance <0.00>:"
    )
    cad.type("30").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Specify second chamfer distance <30.00>:"
    )
    cad.enter().click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Select second line or shift-select to apply corner or [Distance]:"
    )
    cad.click(p(0, 100))

    expect(endpoints(cad.byId<LineEntity>("L2"))).toBeCloseToPoints([
      p(0, 30),
      p(0, 200),
    ])
    expect(cad.commandLog()).toEqual([
      "CHAMFER",
      "(TRIM mode) Current chamfer Dist1 = 0.00, Dist2 = 0.00",
      "Select first line or [Undo/Polyline/Distance/Multiple]: D",
      "Specify first chamfer distance <0.00>: 30",
      "Specify second chamfer distance <30.00>:",
      "Select first line or [Undo/Polyline/Distance/Multiple]:",
      "Select second line or shift-select to apply corner or [Distance]:",
    ])
    cad.command("CHAMFER")
    expect(cad.commandLog().at(-1)).toBe(
      "(TRIM mode) Current chamfer Dist1 = 30.00, Dist2 = 30.00"
    )
  })

  it("applies a corner when the second line is shift-selected", () => {
    const cad = createHarness({ entities: corner })

    cad.command("CHAMFER").option("Distance").type("30").enter().enter()
    cad.click(p(100, 0)).click(p(0, 100), { shiftKey: true })

    expect(cad.entityCount).toBe(2)
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
    ])
  })

  it("cuts the corner at the two distances", () => {
    const cad = createHarness({ entities: corner })

    cad
      .command("CHAMFER")
      .option("Distance")
      .type("40")
      .enter()
      .type("60")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    expect(cad.entityCount).toBe(3)
    expect(endpoints(cad.byId<LineEntity>("L1"))).toBeCloseToPoints([
      p(40, 0),
      p(200, 0),
    ])
    expect(endpoints(cad.byId<LineEntity>("L2"))).toBeCloseToPoints([
      p(0, 60),
      p(0, 200),
    ])

    const bevel = linesOf(cad.entities()).find(
      (line) => line.id !== "L1" && line.id !== "L2"
    )
    expect(endpoints(bevel!)).toBeCloseToPoints([p(0, 60), p(40, 0)])
  })

  it("Polyline bevels every corner of a 2D polyline", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, -60), p(100, -60), p(100, 60), p(-100, 60)], {
          id: "P1",
          closed: true,
        }),
      ],
    })

    cad
      .command("CHAMFER")
      .option("Distance")
      .type("20")
      .enter()
      .type("10")
      .enter()
      .option("Polyline")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Select 2D polyline or [Distance]:"
    )
    cad.click(p(0, -60))

    const poly = cad.byId<PolylineEntity>("P1")
    // The first distance runs along the segment coming into each corner.
    expect(poly.vertices.slice(0, 2)).toBeCloseToPoints([
      p(-90, -60),
      p(80, -60),
    ])
    expect(poly.vertices).toHaveLength(8)
    // A bevel is straight: no bulges anywhere.
    expect(poly.bulges).toBeUndefined()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select 2D polyline or [Distance]:",
      "4 lines were chamfered",
    ])
  })

  // AutoCAD 2023's console (acc/f7, f18): D 10, 5, either picked first.
  it("joins a line into a polyline by the bevel, the first distance on the first picked", () => {
    const entities = () => [
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P1" }),
      lineOf(p(50, 80), p(120, 80)),
    ]
    const cad = createHarness({ entities: entities() })
    cad.command("CHAMFER").option("Distance").type("10").enter()
    cad.type("5").enter().click(p(100, 25)).click(p(60, 80))

    const poly = cad.only<PolylineEntity>("polyline")
    expect(cad.entityCount).toBe(1)
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 70),
      p(95, 80),
      p(50, 80),
    ])
    expect((poly.bulges ?? []).every((bulge) => bulge === 0)).toBe(true)

    const lineFirst = createHarness({ entities: entities() })
    lineFirst.command("CHAMFER").option("Distance").type("10").enter()
    lineFirst.type("5").enter().click(p(60, 80)).click(p(100, 25))
    expect(
      lineFirst.only<PolylineEntity>("polyline").vertices
    ).toBeCloseToPoints([p(0, 0), p(100, 0), p(100, 75), p(90, 80), p(50, 80)])
  })

  // AutoCAD 2023's console (acc/g4, r6–r10, r12, r14, r16): joined as FILLET
  // joins them; each distance must fall on its line or picked segment.
  describe("a join", () => {
    const ell = () => polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P1" })
    const hook = () =>
      polylineOf([p(50, 80), p(120, 80), p(120, 150)], { id: "P2" })

    it("joins segments of two polylines, the first distance on the first picked", () => {
      const cad = createHarness({ entities: [ell(), hook()] })
      cad.command("CHAMFER").option("Distance").type("10").enter()
      cad.type("5").enter().click(p(100, 25)).click(p(60, 80))
      const joined = cad.only<PolylineEntity>("polyline")
      expect(joined.id).toBe("P1")
      expect(joined.vertices).toBeCloseToPoints([
        p(0, 0),
        p(100, 0),
        p(100, 70),
        p(95, 80),
        p(50, 80),
      ])
    })

    it("says a distance is too large past the end of its line or segment, and ends", () => {
      for (const [d1, d2, other] of [
        ["60", "60", hook()],
        ["85", "10", hook()],
        ["60", "60", lineOf(p(50, 80), p(120, 80))],
      ] as const) {
        const cad = createHarness({ entities: [ell(), other] })
        cad.command("CHAMFER").option("Distance").type(d1).enter()
        cad.type(d2).enter().click(p(100, 25)).click(p(60, 80))
        expect(cad.commandLog().at(-1)).toBe("Chamfer distance is too large")
        expect(cad.activeToolId()).toBe("select")
        expect(cad.entityCount).toBe(2)
      }
    })

    it("says why it cannot join them, in either language", () => {
      for (const other of [
        polylineOf([p(120, 0), p(120, 50), p(120, 100)]),
        lineOf(p(120, 0), p(120, 50)),
      ]) {
        const cad = createHarness({ entities: [ell(), other] })
        cad.command("CHAMFER").click(p(100, 25)).click(p(120, 25))
        expect(cad.commandLog().at(-1)).toBe("Lines are parallel")
        expect(cad.activeToolId()).toBe("select")
      }

      const apart = createHarness({
        entities: [ell(), { ...hook(), elevation: 10 }],
      })
      apart.command("CHAMFER").click(p(100, 25)).click(p(60, 80))
      expect(apart.commandLog().at(-1)).toBe("Two entities are non coplanar.")

      const spanish = createHarness({ locale: es, entities: [ell(), hook()] })
      spanish.command("CHAFLAN").option("Distance").type("60").enter()
      spanish.type("60").enter().click(p(100, 25)).click(p(60, 80))
      expect(spanish.commandLog().at(-1)).toBe(
        "Distancia de chaflán es demasiado grande"
      )
    })
  })

  it("bevels two segments of a polyline, the first distance on the first picked", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 100), p(0, 0), p(100, 0)], { id: "P1" })],
    })

    cad.command("CHAMFER").option("Distance").type("20").enter()
    cad.type("10").enter().click(p(50, 0))
    expect(cad.byId<PolylineEntity>("P1").vertices).toHaveLength(3)
    cad.click(p(0, 50))

    expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
      p(0, 100),
      p(0, 10),
      p(20, 0),
      p(100, 0),
    ])
  })

  // AutoCAD 2023's console (acc/e1–e4 of the arcs session): an ARC or a
  // CIRCLE is said to be no line, and the same prompt is asked again.
  it("refuses an arc or a circle and asks again", () => {
    for (const [locale, name, said] of [
      [undefined, "CHAMFER", "Chamfer requires 2 lines (not arc segments)."],
      [es, "CHAFLAN", "Chaflán requiere 2 líneas (no segmentos de arco)."],
    ] as const) {
      const entities = [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        arcOf(p(50, -10), 30, 0, deg(180), { id: "A1" }),
        circleOf(p(50, 80), 20, { id: "C1" }),
      ]
      const cad = createHarness({ locale, entities })
      cad.command(name).click(p(50, 20))
      expect(cad.commandLog().at(-1)).toBe(said)
      const first = cad.state().commandLine.prompt
      expect(first).toMatch(/^(CHAMFER|CHAFLAN) /)

      cad.click(p(10, 0))
      const second = cad.state().commandLine.prompt
      cad.click(p(50, 100))
      expect(cad.commandLog().at(-1)).toBe(said)
      expect(cad.state().commandLine.prompt).toBe(second)
      expect(second).not.toBe(first)
      expect(cad.entities()).toEqual(entities)
    }
  })

  // AutoCAD 2023's console (acc/f3–f18, f23, f24, f28): an arc segment is
  // refused beside another object, and within its polyline cut as its chord,
  // what is left of it keeping its radius, turn and side of a half circle.
  describe("an arc segment", () => {
    /** 0,0 → 100,0, then a half circle bulging east to 100,50. */
    const hook = () =>
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], {
        id: "P1",
        bulges: [0, 1, 0],
      })
    const bulgesOf = (cad: CadHarness) =>
      cad.byId<PolylineEntity>("P1").bulges ?? []

    it("is cut as its chord within its polyline, keeping its radius", () => {
      const cad = createHarness({ entities: [hook()] })
      cad.command("CHAMFER").option("Distance").type("5").enter()
      cad.type("5").enter().click(p(125, 25)).click(p(50, 0))
      expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
        p(0, 0),
        p(95, 0),
        p(100, 5),
        p(100, 50),
      ])
      expect(bulgesOf(cad)[2]).toBeCloseTo(1.5954, 4)

      const second = createHarness({ entities: [hook()] })
      second.command("CHAMFER").option("Distance").type("5").enter()
      second.type("10").enter().click(p(50, 0)).click(p(125, 25))
      expect(second.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
        p(0, 0),
        p(95, 0),
        p(100, 10),
        p(100, 50),
      ])
      expect(bulgesOf(second)[2]).toBeCloseTo(2, 4)

      const quarter = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(125, 25)], {
            id: "P1",
            bulges: [0, Math.tan(Math.PI / 8), 0],
          }),
        ],
      })
      quarter.command("CHAMFER").option("Distance").type("5").enter()
      quarter.type("5").enter().click(p(50, 0)).click(p(117.6777, 7.3223))
      expect(quarter.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints(
        [p(0, 0), p(95, 0), p(103.5355, 3.5355), p(125, 25)],
        4
      )
      expect(bulgesOf(quarter)[2]).toBeCloseTo(0.3383, 4)
    })

    it("cuts one segment apart across their chords", () => {
      const step = () =>
        polylineOf([p(0, 0), p(100, 0), p(100, 20), p(140, 60)], {
          id: "P1",
          bulges: [0, 0, -Math.tan(Math.PI / 8), 0],
        })
      for (const [distance, cut, bulge] of [
        ["5", p(83.5355, 3.5355), -0.9411],
        ["2", p(81.4142, 1.4142), -1.0357],
      ] as const) {
        const cad = createHarness({ entities: [step()] })
        cad.command("CHAMFER").option("Distance").type(distance).enter()
        cad.enter().click(p(50, 0)).click(p(111.7157, 48.2843))
        const along = 80 - Number(distance)
        expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints(
          [p(0, 0), p(along, 0), cut, p(140, 60)],
          4
        )
        expect(bulgesOf(cad)[2]).toBeCloseTo(bulge, 4)
      }
    })

    it("says a distance past the chord, or parallel chords, is invalid", () => {
      const cad = createHarness({ entities: [hook()] })
      cad.command("CHAMFER").option("Distance").type("60").enter()
      cad.enter().click(p(125, 25)).click(p(50, 0))
      expect(cad.commandLog().slice(-2)).toEqual([
        "Chamfer distance is too large",
        "*Invalid*",
      ])
      expect(bulgesOf(cad)).toEqual([0, 1, 0])

      const parallel = createHarness({
        entities: [
          polylineOf([p(0, 0), p(100, 0), p(100, 50), p(150, 50)], {
            id: "P1",
            bulges: [0, 0, -1, 0],
          }),
        ],
      })
      parallel.command("CHAMFER").click(p(50, 0)).click(p(125, 75))
      expect(parallel.commandLog().slice(-2)).toEqual([
        "Lines are parallel",
        "*Invalid*",
      ])
    })

    it("cannot be chamfered with another object, in either language", () => {
      for (const other of [
        lineOf(p(50, 100), p(150, 100)),
        polylineOf([p(50, 100), p(150, 100)]),
      ]) {
        for (const picks of [
          [p(125, 25), p(100, 100)],
          [p(100, 100), p(125, 25)],
        ]) {
          const cad = createHarness({ entities: [hook(), other] })
          cad.command("CHAMFER").click(picks[0]).click(picks[1])
          expect(cad.commandLog().at(-1)).toBe(
            "Cannot chamfer polyline arc segments."
          )
          expect(cad.activeToolId()).toBe("select")
          expect(bulgesOf(cad)).toEqual([0, 1, 0])
        }
      }

      const multiple = createHarness({
        entities: [hook(), lineOf(p(50, 100), p(150, 100))],
      })
      multiple.command("CHAMFER").option("Multiple")
      multiple.click(p(125, 25)).click(p(100, 100))
      expect(multiple.commandLog().at(-1)).toBe(
        "Cannot chamfer polyline arc segments."
      )
      expect(multiple.state().commandLine.prompt).toBe(
        "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:"
      )

      const spanish = createHarness({
        locale: es,
        entities: [hook(), lineOf(p(50, 100), p(150, 100))],
      })
      spanish.command("CHAFLAN").click(p(125, 25)).click(p(100, 100))
      expect(spanish.commandLog().at(-1)).toBe(
        "Imposible unir con chaflán segmentos de arco de polilínea."
      )
    })

    it("Polyline bevels a vertex an arc meets as its chord", () => {
      const cad = createHarness({ entities: [hook()] })
      cad.command("CHAMFER").option("Distance").type("5").enter().enter()
      cad.option("Polyline").click(p(125, 25))
      expect(cad.commandLog().at(-1)).toBe("1 line was chamfered")
      expect(cad.byId<PolylineEntity>("P1").vertices).toBeCloseToPoints([
        p(0, 0),
        p(95, 0),
        p(100, 5),
        p(100, 50),
      ])
      expect(bulgesOf(cad)[2]).toBeCloseTo(1.5954, 4)
    })
  })

  it("Multiple keeps asking until Enter, and Undo takes back the last chamfer", () => {
    const cad = createHarness({
      entities: [
        ...corner,
        lineOf(p(300, 0), p(500, 0), { id: "L3" }),
        lineOf(p(400, -50), p(400, 200), { id: "L4" }),
      ],
    })

    cad.command("CHAMFER").option("Distance").type("20").enter().enter()
    cad.option("Multiple")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:"
    )
    cad.click(p(100, 0)).click(p(0, 100))
    cad.click(p(450, 0)).click(p(400, 100))
    expect(cad.entityCount).toBe(6)
    cad.option("Undo")
    expect(cad.entityCount).toBe(5)
    expect(endpoints(cad.byId<LineEntity>("L3"))).toBeCloseToPoints([
      p(300, 0),
      p(500, 0),
    ])
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    cad.undo()
    expect(cad.entityCount).toBe(4)
  })
})

describe("OFFSET", () => {
  it("keeps the source's colour, plane and thickness", () => {
    const cad = createHarness({
      entities: [
        {
          ...lineOf(p(-100, 0), p(100, 0), { id: "L1" }),
          color: "#ff0000",
          elevation: 8,
          thickness: 2,
        },
      ],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).click(p(0, 50))

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(copy).toMatchObject({ color: "#ff0000", elevation: 8, thickness: 2 })
  })
  it("copies a line parallel at the typed distance, on the picked side", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).click(p(0, 50))

    expect(cad.entityCount).toBe(2)
    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(endpoints(copy)).toBeCloseToPoints([p(-100, 20), p(100, 20)])
  })

  it("offsets to the other side when the cursor is there", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).click(p(0, -50))

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(endpoints(copy)).toBeCloseToPoints([p(-100, -20), p(100, -20)])
  })

  it("keeps running so a second object can be offset", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "L1" }),
        lineOf(p(-100, 200), p(100, 200), { id: "L2" }),
      ],
    })

    cad
      .command("OFFSET")
      .type("20")
      .enter()
      .click(p(0, 0))
      .click(p(0, 50))
      .click(p(0, 200))
      .click(p(0, 250))
      .escape()

    expect(cad.entityCount).toBe(4)
  })

  it("makes a circle concentric, outward or inward", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 80, { id: "C1" })],
    })

    cad
      .command("OFFSET")
      .type("20")
      .enter()
      .click(p(80, 0))
      .click(p(200, 0)) // outside
      .click(p(80, 0))
      .click(p(0, 0)) // inside
      .escape()

    const radii = cad
      .entities()
      .filter((e): e is CircleEntity => e.type === "circle")
      .map((circle) => circle.radius)
      .sort((a, b) => a - b)
    expect(radii).toEqual([60, 80, 100])
  })

  it("keeps an arc's angles when offsetting it", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 80, 0, deg(120), { id: "A1" })],
    })

    cad
      .command("OFFSET")
      .type("20")
      .enter()
      .click(p(80, 0))
      .click(p(200, 0))
      .escape()

    const copy = cad
      .entities()
      .find((e): e is ArcEntity => e.type === "arc" && e.id !== "A1")!
    expect(copy.radius).toBeCloseTo(100)
    expect(copy.startAngle).toBeCloseToAngle(0)
    expect(copy.endAngle).toBeCloseToAngle(deg(120))
  })

  it("offsets a polyline as a parallel chain with re-joined corners", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, 0), p(100, 0), p(100, 100)], { id: "P1" }),
      ],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).click(p(0, 40))

    const copy = cad
      .entities()
      .find((e): e is PolylineEntity => e.type === "polyline" && e.id !== "P1")!
    // The corner is extended to the intersection of the two shifted segments.
    expect(copy.vertices).toBeCloseToPoints([
      p(-100, 20),
      p(80, 20),
      p(80, 100),
    ])
  })

  it("will not offset an ellipse, and does not even highlight one", () => {
    // The parallel curve of an ellipse is a spline, which this engine has no
    // object for — so, like DIMSPACE with non-parallel dimensions, the object
    // simply never lights up as a candidate.
    const cad = createHarness({
      entities: [ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E1" })],
    })

    cad.command("OFFSET").type("20").enter().moveTo(p(100, 0))
    const highlights = cad
      .scene()
      .primitives.filter(
        (primitive) =>
          "stroke" in primitive && primitive.stroke?.color === THEME.selected
      )
    expect(highlights).toHaveLength(0)

    cad.click(p(100, 0)).click(p(200, 0)).escape()
    expect(cad.entityCount).toBe(1)
  })

  it("Through places the copy on a picked point", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad
      .command("OFFSET")
      .option("Through")
      .click(p(0, 0))
      .click(p(0, -40))
      .escape()

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(endpoints(copy)).toBeCloseToPoints([p(-80, -40), p(80, -40)])
  })

  it("Multiple steps cumulatively away from the source", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad
      .command("OFFSET")
      .type("20")
      .enter()
      .click(p(0, 0))
      .option("Multiple")
      .click(p(0, 30))
      .click(p(0, 60))
      .click(p(0, 90))
      .escape()

    const ys = linesOf(cad.entities())
      .map((line) => line.start.y)
      .sort((a, b) => a - b)
    expect(ys).toEqual([0, 20, 40, 60])
  })

  it("Erase replaces the source with the copy in one undo step", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad
      .command("OFFSET")
      .option("Erase")
      .option("Yes")
      .type("20")
      .enter()
      .click(p(0, 0))
      .click(p(0, 50))
      .escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.only<LineEntity>("line").start.y).toBeCloseTo(20)

    cad.undo()
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(-80, 0))
  })

  it("inherits the source object's layer by default", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.document.load([
      lineOf(p(-80, 0), p(80, 0), { id: "L1", layerId: walls }),
    ])
    cad.runtime.createLayer("Other")

    cad
      .command("OFFSET")
      .type("20")
      .enter()
      .click(p(0, 0))
      .click(p(0, 50))
      .escape()

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(copy.layerId).toBe(walls)
  })

  it("asks AutoCAD's questions and writes each with its answer", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })

    cad.command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <Through>:"
    )
    cad.type("20").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:"
    )
    cad.click(p(0, 50)).enter()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual([
      "OFFSET",
      "Current settings: Erase source=No  Layer=Source  OFFSETGAPTYPE=0",
      "Specify offset distance or [Through/Erase/Layer] <Through>: 20",
      "Select object to offset or [Exit/Undo] <Exit>:",
      "Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:",
      "Select object to offset or [Exit/Undo] <Exit>:",
    ])
    cad.command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <20.00>:"
    )
  })

  it("asks Erase and Layer as their own questions, and reports them next time", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0), { id: "L1" })],
    })

    cad.command("OFFSET").option("Erase")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Erase source object after offsetting? [Yes/No] <No>:"
    )
    cad.option("Yes").option("Layer")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Enter layer option for offset objects [Current/Source] <Source>:"
    )
    cad.option("Current").option("Erase").enter().escape()
    cad.command("OFFSET").option("Layer")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Enter layer option for offset objects [Current/Source] <Current>:"
    )

    expect(cad.commandLog().slice(-10)).toEqual([
      "Specify offset distance or [Through/Erase/Layer] <Through>: E",
      "Erase source object after offsetting? [Yes/No] <No>: Y",
      "Specify offset distance or [Through/Erase/Layer] <Through>: L",
      "Enter layer option for offset objects [Current/Source] <Source>: C",
      "Specify offset distance or [Through/Erase/Layer] <Through>: E",
      "Erase source object after offsetting? [Yes/No] <Yes>:",
      "Specify offset distance or [Through/Erase/Layer] <Through>: *Cancel*",
      "OFFSET",
      "Current settings: Erase source=Yes  Layer=Current  OFFSETGAPTYPE=0",
      "Specify offset distance or [Through/Erase/Layer] <Through>: L",
    ])
  })

  it("puts the copy on the current layer with Layer Current", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.document.load([
      lineOf(p(-80, 0), p(80, 0), { id: "L1", layerId: walls }),
    ])
    const other = cad.runtime.createLayer("Other")

    cad
      .command("OFFSET")
      .option("Layer")
      .option("Current")
      .type("20")
      .enter()
      .click(p(0, 0))
      .click(p(0, 50))
      .enter()

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(copy.layerId).toBe(other)
  })

  it("Multiple asks for the next object on Enter, and Undo takes a step back", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).option("Multiple")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify point on side to offset or [Exit/Undo] <next object>:"
    )
    cad.click(p(0, 30)).click(p(0, 60)).option("Undo").click(p(0, 60))
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
    )
    cad.option("Undo").enter()

    const ys = linesOf(cad.entities())
      .map((line) => line.start.y)
      .sort((a, b) => a - b)
    expect(ys).toEqual([0, 20])
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify point on side to offset or [Exit/Undo] <next object>:",
      "Specify point on side to offset or [Exit/Undo] <next object>:",
      "Select object to offset or [Exit/Undo] <Exit>: U",
      "Select object to offset or [Exit/Undo] <Exit>:",
    ])
  })

  it("asks Through's point, and Multiple through further points", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad.command("OFFSET").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Select object to offset or [Exit/Undo] <Exit>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify through point or [Exit/Multiple/Undo] <Exit>:"
    )
    cad.option("Multiple")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET Specify through point or [Exit/Undo] <next object>:"
    )
    cad.click(p(0, 10)).click(p(0, -30)).enter().enter()

    const ys = linesOf(cad.entities())
      .map((line) => line.start.y)
      .sort((a, b) => a - b)
    expect(ys).toEqual([-30, 0, 10])
    expect(cad.activeToolId()).toBe("select")
  })

  it("measures the distance between two points, asking the second", () => {
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad.command("OFFSET").click(p(0, 100))
    expect(cad.state().commandLine.prompt).toBe("OFFSET Specify second point:")
    cad.click(p(30, 140)).click(p(0, 0)).click(p(0, 10)).enter()

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(copy.start.y).toBeCloseTo(50)
  })
})
