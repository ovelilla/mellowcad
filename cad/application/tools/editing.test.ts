import { describe, expect, it } from "vitest"
import {
  createAttributeDefinition,
  createDimension,
  createInsert,
  createMText,
  createSpline,
  createText,
  ellipseEndPoint,
  ellipseStartPoint,
  lineEndZ,
  lineStartZ,
  mtextCorners,
  textCorners,
  withElevation,
  withNormal,
  type ArcEntity,
  type CircleEntity,
  type EllipseEntity,
  type Entity,
  type LineEntity,
  type PolylineEntity,
} from "../../domain/entities"
import type { Layer } from "../../domain/layers"
import { ellipseParamFromAngle } from "../../geometry/primitives"
import type { Vec2 } from "../../geometry/Vec2"
import { THEME } from "../../scene/theme"
import { fadedColor } from "../SceneBuilder"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import { parseDrawingFile } from "../../serialization/drawingFile"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  layerOf,
  hatchOf,
  lineOf,
  loopOf,
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
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:"
    )
    expect(cad.state().dynamicInput).toBeNull()
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    cad.click(p(0, 50), { shiftKey: true }).enter()

    expect(cad.commandLog()).toEqual([
      "TRIM",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:",
      "Path does not intersect with the bounding edge.",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:",
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
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:"
    )
    // With the command's own edits gone, Undo is no longer offered.
    expect(cad.optionIds()).toEqual(["cuTting", "Crossing", "mOde", "eRase"])
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

  // Probes trim/p170, p174, p178, p229–p231: the piece from the object's
  // start is the object kept — its handle, its place —, the other is new and
  // Last finds it; U puts the object back whole.
  it("keeps the object as the piece from its start, the other new", () => {
    for (const [start, end, kept, added] of [
      [p(0, 0), p(100, 0), [p(0, 0), p(30, 0)], [p(70, 0), p(100, 0)]],
      [p(100, 0), p(0, 0), [p(100, 0), p(70, 0)], [p(30, 0), p(0, 0)]],
    ] as const) {
      const cad = createHarness({
        entities: [
          lineOf(start, end, { id: "A" }),
          lineOf(p(30, -10), p(30, 10), { id: "V1" }),
          lineOf(p(70, -10), p(70, 10), { id: "V2" }),
        ],
      })
      cad.command("TRIM").click(p(50, 0)).enter()
      const [line, , , piece] = cad.entities() as LineEntity[]
      expect(cad.entities().map((entity) => entity.id)).toEqual([
        "A",
        "V1",
        "V2",
        piece.id,
      ])
      expect([line.start, line.end]).toBeCloseToPoints(kept)
      expect([piece.start, piece.end]).toBeCloseToPoints(added)

      for (const text of ["ERASE", "L", ""]) {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
      expect(cad.entities().map((entity) => entity.id)).toEqual([
        "A",
        "V1",
        "V2",
      ])
      cad.undo().undo()
      expect(cad.entities()).toHaveLength(3)
      expect(cad.entities()[0]).toMatchObject({ id: "A", start, end })
    }

    const arc = createHarness({
      entities: [
        arcOf(p(0, 0), 50, deg(0), deg(180), { id: "R" }),
        lineOf(p(-20, 0), p(-20, 60)),
        lineOf(p(20, 0), p(20, 60)),
      ],
    })
    arc.command("TRIM").click(p(0, 50)).enter()
    const [kept, , , other] = arc.entities() as ArcEntity[]
    expect(kept.id).toBe("R")
    expect(kept.endAngle).toBeCloseToAngle(deg(66.4218))
    expect(other.startAngle).toBeCloseToAngle(deg(113.5782))

    const polyline = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], { id: "P" }),
        lineOf(p(90, 30), p(110, 30)),
        lineOf(p(90, 70), p(110, 70)),
      ],
    })
    polyline.command("TRIM").click(p(100, 50)).enter()
    const [first, , , second] = polyline.entities() as PolylineEntity[]
    expect(first.id).toBe("P")
    expect(first.vertices).toBeCloseToPoints([p(0, 0), p(100, 0), p(100, 30)])
    expect(second.vertices).toBeCloseToPoints([
      p(100, 70),
      p(100, 100),
      p(0, 100),
    ])

    const ellipse = createHarness({
      entities: [
        ellipseOf(p(50, 0), p(-50, 0), 0.5, {
          id: "E",
          startParam: 0,
          endParam: Math.PI,
        }),
        lineOf(p(30, -40), p(30, 40)),
        lineOf(p(70, -40), p(70, 40)),
      ],
    })
    ellipse.command("TRIM").click(p(50, -25)).enter()
    const [from, , , to] = ellipse.entities() as EllipseEntity[]
    expect(from.id).toBe("E")
    expect(ellipseStartPoint(from)).toBeCloseToPoint(p(0, 0))
    expect(ellipseEndPoint(from)).toBeCloseToPoint(p(30, -22.9129), 4)
    expect(ellipseStartPoint(to)).toBeCloseToPoint(p(70, -22.9129), 4)
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

  // Probe trim/p176: a circle one edge crosses once is not
  // deleted, and Undo counts the pick.
  it("leaves a circle cut once as it is, saying it must be cut twice", () => {
    for (const [locale, name, asked, said, undone] of [
      [
        undefined,
        "TRIM",
        "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:",
        "Circle must intersect twice.",
        "Command has been completely undone.",
      ],
      [
        es,
        "RECORTA",
        "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]:",
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
      expect(cad.state().commandLine.prompt).toMatch(/\/(Undo|desHacer)\]:$/)
      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toBe(undone)
      expect(cad.optionIds()).toEqual(["cuTting", "Crossing", "mOde", "eRase"])
    }
  })

  // Probe trim/p177 (and AutoCAD 2023's console, acc/o6, o7, not probed
  // again): a polyline is its own edge, so a segment is trimmed back to its vertices and
  // the crossings on it; a closed one opens from the cut's far end round to
  // its near one, keeping its handle and direction.
  it("trims a polyline's segment between its vertices and the crossings on it", () => {
    for (const [locale, name, asked] of [
      [
        undefined,
        "TRIM",
        "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:",
      ],
      [
        es,
        "RECORTA",
        "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]:",
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

  // Probes trim/p180, p183: an open polyline too, split in two
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

  // Probe trim/p207: EXTEND still refuses a closed one, the pick counted for
  // Undo, Spanish in table 54's words.
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
        "Este objeto no se puede ALARGAR.",
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
      "EXTEND Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]:"
    )
    cad.click(p(-110, 0)).escape()

    expect(cad.commandLog()).toEqual([
      "EXTEND",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]:",
      "Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde/Undo]: *Cancel*",
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

  // probe trim/p143: the other end's boundary is named so.
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
    expect(cad.commandLog().at(-1)).toBe("No edge in that direction.")
  })

  // Probes trim/p195, p204–p208, p388: each object EXTEND cannot reach an
  // edge with has its words, a closed polyline's and a circle's Spanish two
  // tables'; Undo is listed after each, and takes back the edit before it.
  it("says why an object reaches no edge, listing Undo", () => {
    const boundary = lineOf(p(100, -50), p(100, 50), { id: "B" })
    for (const [locale, name, said] of [
      [
        undefined,
        "EXTEND",
        [
          "Path does not intersect with the bounding edge.",
          "Object does not intersect an edge.",
          "Cannot EXTEND this object.",
          "Cannot EXTEND this object.",
        ],
      ],
      [
        es,
        "ALARGA",
        [
          "La trayectoria no se interseca con la arista de contorno.",
          "El objeto no se interseca con ninguna arista.",
          "Este objeto no se puede ALARGAR.",
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
      expect(counted).toMatch(/\/(Undo|desHacer)\]:$/)

      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toMatch(/^(Command|Todos)/)
      cad.click(p(10, 20))
      expect(cad.commandLog().at(-1)).toBe(said[1])
      cad.click(p(25, 60))
      expect(cad.commandLog().at(-1)).toBe(said[2])
      cad.option("Undo")

      cad.click(p(40, -40))
      expect(cad.commandLog().at(-1)).toBe(said[3])
      expect(cad.optionIds()).toEqual(["Boundary", "Crossing", "mOde", "Undo"])
      expect(cad.entities()).toEqual(entities)

      cad.click(p(40, 0)).click(p(40, 0))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      expect(cad.byId<LineEntity>("L").end).toEqual(p(100, 0))
      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toMatch(/^(Command|Todos)/)
      expect(cad.byId<LineEntity>("L").end).toEqual(p(50, 0))
    }
  })

  // Probes trim/p212, p232: the end the pick lies nearer in the polyline's parameter grows — not the one
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

// AutoCAD 2027's console (probes trim/p105, p240–p242, p289–p299).
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
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: @75,-5",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: 80,80",
    ])
    cad.enter()
    typed(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 80.00     Y = 80.00     Z = 0.00"
    )

    const extend = typed(drawing(), "EXTEND", "80,20")
    expect(extend.commandLog().slice(-2)).toEqual([
      "Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]: 80,20",
      "Path does not intersect with the bounding edge.",
    ])
    expect(extend.state().commandLine.prompt).toBe(
      "EXTEND Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde/Undo]:"
    )
  })

  // probes trim/p241, p248, p297–p299: its "pick two empty locations".
  it("starts a fence on nothing, which its next point closes, as one step", () => {
    const cad = typed(drawing(), "ID", "1,1", "TRIM", "70,30", "70,-20")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 70,30",
      "Specify next fence point or [Undo]: 70,-20",
    ])
    for (const id of ["A", "B"]) {
      expect(endpoints(cad.byId<LineEntity>(id))[1]).toEqual(
        p(50, id === "A" ? 0 : 20)
      )
    }
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    typed(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(endpoints(cad.byId<LineEntity>("A"))[1]).toEqual(p(100, 0))
    expect(endpoints(cad.byId<LineEntity>("B"))[1]).toEqual(p(100, 20))
    cad.enter()
    // LASTPOINT is the fence's first point.
    typed(cad, "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 70.00     Y = 30.00     Z = 0.00"
    )

    // Clicked, the same.
    const clicked = drawing()
    clicked.command("TRIM").click(p(70, 30)).click(p(70, -20))
    expect(endpoints(clicked.byId<LineEntity>("A"))[1]).toEqual(p(50, 0))
  })

  it("asks the fence's next point as AutoCAD does", () => {
    const cad = typed(drawing(), "TRIM", "70,30", "FOO", "U", "70,30")
    typed(cad, "@0,-50")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 70,30",
      "Specify next fence point or [Undo]: FOO",
      "Invalid response.",
      "Specify next fence point or [Undo]: U",
      "Specify next fence point or [Undo]: 70,30",
      "Invalid point, polygon segment is zero length.",
      "Specify next fence point or [Undo]: @0,-50",
    ])
    expect(endpoints(cad.byId<LineEntity>("A"))[1]).toEqual(p(50, 0))

    // Enter there ends the command, nothing trimmed.
    const ended = typed(drawing(), "TRIM", "70,30")
    ended.enter()
    expect(ended.activeToolId()).toBe("select")
    expect(endpoints(ended.byId<LineEntity>("A"))[1]).toEqual(p(100, 0))

    // A second point on an object is the fence's (probe trim/p404).
    const onto = typed(drawing(), "TRIM", "70,10", "50,5")
    expect(endpoints(onto.byId<LineEntity>("V"))).toEqual([
      p(50, -50),
      p(50, 0),
    ])

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
    })
    typed(spanish, "RECORTA", "70,30", "FOO", "70,30")
    expect(spanish.commandLog().slice(-4)).toEqual([
      "Precise punto del borde o [desHacer]: FOO",
      "Respuesta no válida.",
      "Precise punto del borde o [desHacer]: 70,30",
      "Punto no válido: el segmento del polígono tiene una longitud cero.",
    ])
  })

  it("extends what EXTEND's fence crosses", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(40, 0), { id: "S" }),
        lineOf(p(50, -50), p(50, 50)),
      ],
    })
    typed(cad, "EXTEND", "30,20", "30,-20")
    expect(endpoints(cad.byId<LineEntity>("S"))).toEqual([p(0, 0), p(50, 0)])
  })

  // WHY Fence: the console names its unlisted word first, then the words
  // declared but the last, Project the last before Undo (probes trim/p105,
  // p113).
  it("refuses anything else with *Invalid selection* and the words it expects", () => {
    const cad = typed(drawing(), "TRIM", "FOO", "80,0", "FOO")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: FOO",
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 80,0",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: FOO",
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde/eRase",
    ])
    cad.escape()
    typed(cad, "EXTEND", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]: FOO",
      "*Invalid selection*",
      "Expects a point or Fence/Boundary edges/Crossing/mOde",
    ])

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
    })
    typed(spanish, "RECORTA", "80,0", "FOO")
    expect(spanish.commandLog().slice(-4)).toEqual([
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]: 80,0",
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]: FOO",
      "*Designación no válida*",
      "Requiere un punto o Borde/aristas de COrte/Captura/MOdo/bOrrar",
    ])
  })
})

// AutoCAD 2027's console (probes trim/p240–p264): the object prompt's every
// point form, LASTPOINT after each answer, locked and Off layers, two objects
// in the pick box, typed object snaps.
describe("TRIM and EXTEND's picks", () => {
  const drawing = (locale?: typeof es, ...more: Entity[]) =>
    createHarness({
      locale,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(50, -50), p(50, 50), { id: "V" }),
        lineOf(p(0, 20), p(100, 20), { id: "B" }),
        ...more,
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const lastPoint = (cad: CadHarness) => {
    if (cad.activeToolId() !== "select") cad.escape()
    typed(cad, "ID", "@")
    return cad.commandLog().at(-1)
  }
  const onLayer = (layer: Partial<Layer>, ...more: Entity[]) => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(50, -50), p(50, 50), { id: "V" }),
        ...more,
      ],
      { layers: [layerOf("0"), layerOf("LK", layer)] }
    )
    return cad
  }

  it("takes `@`, a polar point, `*x,y` and a number as points, and refuses `#` (p243–p247)", () => {
    const at = typed(drawing(), "ID", "80,0", "TRIM", "@")
    expect(endpoints(at.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    expect(lastPoint(at)).toBe(" X = 80.00     Y = 0.00     Z = 0.00")

    const polar = typed(drawing(), "ID", "50,0", "TRIM", "@30<0", "20<90")
    expect(endpoints(polar.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    expect(endpoints(polar.byId<LineEntity>("B"))).toEqual([
      p(50, 20),
      p(100, 20),
    ])
    expect(lastPoint(polar)).toBe(" X = 0.00     Y = 20.00     Z = 0.00")

    // In a UCS turned 30°, `*80,0` is the WCS's 80,0, and LASTPOINT reads
    // 69.282,-40 in the UCS (p245).
    const world = typed(drawing(), "UCS", "Z", "30", "TRIM", "*80,0")
    expect(endpoints(world.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    expect(lastPoint(world)).toBe(" X = 69.28     Y = -40.00     Z = 0.00")

    const tooltip = typed(drawing(), "TRIM", "#80,0")
    expect(tooltip.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
    ])

    // A number: its direct distance from LASTPOINT towards the cursor (p247).
    const distance = typed(drawing(), "ID", "80,10")
    distance.moveTo(p(80, -100))
    typed(distance, "TRIM", "10")
    expect(endpoints(distance.byId<LineEntity>("A"))).toEqual([
      p(0, 0),
      p(50, 0),
    ])
    expect(lastPoint(distance)).toBe(" X = 80.00     Y = 0.00     Z = 0.00")
  })

  it("leaves LASTPOINT at the pick after a hit, a miss and a refusal (p240, p248–p250)", () => {
    const hit = typed(drawing(), "ID", "5,5", "TRIM", "80,0")
    expect(lastPoint(hit)).toBe(" X = 80.00     Y = 0.00     Z = 0.00")

    const miss = typed(drawing(), "ID", "1,1", "TRIM", "70,30", "")
    expect(miss.activeToolId()).toBe("select")
    expect(lastPoint(miss)).toBe(" X = 70.00     Y = 30.00     Z = 0.00")

    const extend = typed(drawing(), "ID", "1,1", "EXTEND", "50,40")
    expect(extend.commandLog().at(-1)).toBe(
      "Path does not intersect with the bounding edge."
    )
    expect(lastPoint(extend)).toBe(" X = 50.00     Y = 40.00     Z = 0.00")

    const standard = typed(
      drawing(undefined, lineOf(p(200, 0), p(300, 0))),
      "ID",
      "1,1",
      "TRIM",
      "O",
      "S",
      "250,0"
    )
    expect(standard.commandLog().at(-1)).toBe(
      "Does not intersect with the cutting edge."
    )
    expect(lastPoint(standard)).toBe(" X = 250.00     Y = 0.00     Z = 0.00")
  })

  it("says a locked object picked was on a locked layer, then starts the fence (p251)", () => {
    const locked = lineOf(p(0, -10), p(100, -10), { id: "K", layerId: "LK" })
    const cad = typed(onLayer({ locked: true }, locked), "ID", "1,1")
    typed(cad, "TRIM", "80,-10")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 80,-10",
      "1 was on a locked layer.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Specify next fence point or [Undo]:"
    )
    expect(lastPoint(cad)).toBe(" X = 80.00     Y = -10.00     Z = 0.00")

    const spanish = createHarness({ locale: es })
    spanish.runtime.document.load([locked], {
      layers: [layerOf("0"), layerOf("LK", { locked: true })],
    })
    typed(spanish, "RECORTA", "80,-10")
    expect(spanish.commandLog().at(-1)).toBe("1 estaba en una capa bloqueada.")
  })

  it("starts the fence in silence at an object on an Off layer, which is no edge (p252–p254)", () => {
    const off = typed(
      onLayer(
        { visible: false },
        lineOf(p(0, -10), p(100, -10), { id: "K", layerId: "LK" })
      ),
      "TRIM",
      "80,-10"
    )
    expect(off.commandLog().at(-1)).toBe(
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: 80,-10"
    )
    expect(off.state().commandLine.prompt).toBe(
      "TRIM Specify next fence point or [Undo]:"
    )

    const edge = lineOf(p(80, -50), p(80, 50), { id: "K", layerId: "LK" })
    const noEdge = typed(onLayer({ visible: false }, edge), "TRIM", "90,0")
    expect(endpoints(noEdge.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    // A locked one cuts (p255).
    const lockedEdge = typed(onLayer({ locked: true }, edge), "TRIM", "90,0")
    expect(endpoints(lockedEdge.byId<LineEntity>("A"))).toEqual([
      p(0, 0),
      p(80, 0),
    ])
  })

  it("takes the newer of two objects in the pick box, though the older is nearer (p256, p257, p402)", () => {
    const pair = (older: number, newer: number) =>
      createHarness({
        entities: [
          lineOf(p(0, older), p(100, older), { id: "OLDER" }),
          lineOf(p(0, newer), p(100, newer), { id: "NEWER" }),
          lineOf(p(50, -50), p(50, 50), { id: "V" }),
        ],
      })
    const below = typed(pair(0, 2), "TRIM", "80,0.3")
    expect(endpoints(below.byId<LineEntity>("OLDER"))[1]).toEqual(p(100, 0))
    expect(endpoints(below.byId<LineEntity>("NEWER"))[1]).toEqual(p(50, 2))
    const above = typed(pair(2, 0), "TRIM", "80,1.7")
    expect(endpoints(above.byId<LineEntity>("OLDER"))[1]).toEqual(p(100, 2))
    expect(endpoints(above.byId<LineEntity>("NEWER"))[1]).toEqual(p(50, 0))
  })

  it("takes a typed object snap's point as the pick and LASTPOINT (p259–p263)", () => {
    const end = typed(drawing(), "ID", "5,5", "TRIM", "_END", "99,1")
    expect(end.commandLog().at(-1)).toBe(
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: _END of 99,1"
    )
    expect(endpoints(end.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    expect(end.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    expect(lastPoint(end)).toBe(" X = 100.00     Y = 0.00     Z = 0.00")

    // Midpoint finds the line under 80,-30's midpoint, which Quick deletes.
    const mid = typed(
      drawing(undefined, lineOf(p(60, -30), p(100, -30), { id: "M" })),
      "TRIM",
      "_MID",
      "90,-29"
    )
    expect(mid.runtime.document.has("M")).toBe(false)
    expect(lastPoint(mid)).toBe(" X = 80.00     Y = -30.00     Z = 0.00")

    // Intersection's point is on V, the newer, and its own crossing there
    // no bound: V goes from its end up to B (p261).
    const int = typed(drawing(), "TRIM", "_INT", "51,1")
    expect(endpoints(int.byId<LineEntity>("V"))).toEqual([p(50, 20), p(50, 50)])
    expect(endpoints(int.byId<LineEntity>("A"))).toEqual([p(0, 0), p(100, 0)])
    expect(lastPoint(int)).toBe(" X = 50.00     Y = 0.00     Z = 0.00")

    const near = typed(drawing(), "TRIM", "_NEA", "80,1")
    expect(near.commandLog().at(-1)).toBe(
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: _NEA to 80,1"
    )
    expect(endpoints(near.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
    expect(lastPoint(near)).toBe(" X = 80.00     Y = 0.00     Z = 0.00")

    // Perpendicular from LASTPOINT: 5,0 on A, whose left piece goes.
    const per = typed(drawing(), "ID", "5,5", "TRIM", "_PER", "80,1")
    expect(endpoints(per.byId<LineEntity>("A"))).toEqual([p(50, 0), p(100, 0)])
    expect(lastPoint(per)).toBe(" X = 5.00     Y = 0.00     Z = 0.00")

    const spanish = typed(drawing(es), "RECORTA", "FIN", "99,1")
    expect(spanish.commandLog().at(-1)).toBe(
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]: FIN de 99,1"
    )
    expect(endpoints(spanish.byId<LineEntity>("A"))).toEqual([
      p(0, 0),
      p(50, 0),
    ])
  })

  it("takes Enter at an override's `of` as the prompt's own Enter (p264)", () => {
    const cad = typed(drawing(), "TRIM", "_END", "")
    expect(cad.activeToolId()).toBe("trim")
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    typed(cad, "")
    expect(cad.activeToolId()).toBe("select")
    typed(cad, "ID", "40,40")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 40.00     Y = 40.00     Z = 0.00"
    )
    // A click after it is a plain pick again, running snaps or not.
    const after = typed(drawing(), "TRIM", "_END", "", "")
    after.command("TRIM").click(p(80, 1))
    expect(endpoints(after.byId<LineEntity>("A"))).toEqual([p(0, 0), p(50, 0)])
  })

  // probe trim/p140: nothing is left selected, in either mode.
  it("leaves nothing selected", () => {
    const quick = typed(drawing(), "TRIM", "80,0", "")
    expect(quick.selectedIds()).toEqual([])
    const standard = typed(drawing(), "TRIM", "O", "S", "")
    typed(standard, "TRIM", "50,30", "", "80,0", "")
    expect(standard.selectedIds()).toEqual([])
  })

  // Desktop trim/d07, probe p265: Ortho has no base point there.
  it("lets Ortho leave an implied fence's next point alone", () => {
    const cad = drawing()
    cad.press("F8")
    cad.command("TRIM").click(p(70, 30)).click(p(40, -10))
    expect(endpoints(cad.byId<LineEntity>("B"))).toEqual([p(0, 20), p(50, 20)])
    expect(endpoints(cad.byId<LineEntity>("A"))).toEqual([p(50, 0), p(100, 0)])
    expect(endpoints(cad.byId<LineEntity>("V"))).toEqual([p(50, -50), p(50, 0)])
  })

  // Desktop trim/d02-2: Shift's trim inside EXTEND is TRIM's, Quick's delete
  // too.
  it("deletes under Shift in EXTEND a line no edge crosses", () => {
    const cad = drawing(undefined, lineOf(p(200, 0), p(300, 0), { id: "F" }))
    cad.command("EXTEND").click(p(250, 0), { shiftKey: true })
    expect(cad.runtime.document.has("F")).toBe(false)
  })
})

// AutoCAD 2027's console: what Enter does at the object prompt, when Undo is
// listed and what it takes back, and the objects selected before the command.
describe("TRIM and EXTEND's Enter, Undo and preselection", () => {
  const drawing = (locale?: typeof es, ...more: Entity[]) =>
    createHarness({
      locale,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 10), p(100, 10), { id: "B" }),
        lineOf(p(30, -20), p(30, 20), { id: "V1" }),
        lineOf(p(70, -20), p(70, 20), { id: "V2" }),
        ...more,
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const prompt = (cad: CadHarness) => cad.state().commandLine.prompt
  const QUICK =
    "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:"
  const QUICK_UNDO =
    "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
  const STANDARD =
    "Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase]:"
  const STANDARD_UNDO =
    "Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase/Undo]:"
  const ends = (cad: CadHarness) => {
    typed(cad, "")
    return cad.activeToolId() === "select"
  }

  // probes trim/p100, p116, p118, p120: the old `TR ⏎ ⏎` still trims.
  it("takes Quick's first Enter at the object prompt once, as an answer", () => {
    const cad = typed(drawing(), "TRIM", "")
    expect(cad.activeToolId()).toBe("trim")
    expect(prompt(cad)).toBe(`TRIM ${QUICK_UNDO}`)
    typed(cad, "50,0")
    expect(cad.entityCount).toBe(5)
    expect(ends(cad)).toBe(true)

    const undone = typed(drawing(), "TRIM", "", "U")
    expect(undone.commandLog().slice(-2)).toEqual([
      `${QUICK_UNDO} U`,
      "Command has been completely undone.",
    ])
    expect(prompt(undone)).toBe(`TRIM ${QUICK}`)
    expect(ends(undone)).toBe(true)

    const extend = typed(drawing(), "EXTEND", "")
    expect(prompt(extend)).toBe(
      "EXTEND Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde/Undo]:"
    )
    expect(ends(extend)).toBe(true)
  })

  it("ends at the first Enter once the run has its edges", () => {
    // After an edit (p117), cuTting edges chosen (p152), a typed fence (p290),
    // a U (p158) and in Standard mode (p119, p273), Enter ends.
    expect(ends(typed(drawing(), "TRIM", "50,0"))).toBe(true)
    expect(ends(typed(drawing(), "TRIM", "T", "30,15", ""))).toBe(true)
    expect(ends(typed(drawing(), "TRIM", "F", ""))).toBe(true)
    expect(ends(typed(drawing(), "TRIM", "O", "S", "O", "Q", "U"))).toBe(true)
    expect(ends(typed(drawing(), "TRIM", "O", "S"))).toBe(true)
    expect(ends(typed(drawing(), "TRIM", "", "TRIM"))).toBe(true)
    // A refused answer or a mode leaves it to take (p246, p271, p107, p284).
    expect(ends(typed(drawing(), "TRIM", "FOO"))).toBe(false)
    expect(ends(typed(drawing(), "TRIM", "O", ""))).toBe(false)
    const fromEdges = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "O", "Q")
    expect(prompt(fromEdges)).toBe(`TRIM ${QUICK}`)
    expect(ends(fromEdges)).toBe(false)
  })

  // probes trim/p114, p115, p135: the prompt's own words, as for FOO.
  it("refuses Undo until the run has an answer", () => {
    const cad = typed(drawing(), "TRIM", "U")
    expect(cad.commandLog().slice(-3)).toEqual([
      `${QUICK} U`,
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
    ])
    typed(cad, "50,0", "50,10", "U")
    expect(prompt(cad)).toBe(`TRIM ${QUICK_UNDO}`)
    typed(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.entityCount).toBe(4)
    typed(cad, "U")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
    ])

    const spanish = typed(drawing(es), "RECORTA", "H")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "*Designación no válida*",
      "Requiere un punto o Borde/aristas de COrte/Captura/MOdo",
    ])
  })

  // probes trim/p107, p136, p157–p162: listed after any answer there, U then
  // completely undone, the mode kept and EDGEMODE back.
  it("lists Undo after a mode or Edge answer, which it takes back saying all is", () => {
    const mode = typed(drawing(), "TRIM", "O", "S")
    expect(prompt(mode)).toBe(`TRIM ${STANDARD_UNDO}`)
    typed(mode, "U")
    expect(mode.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(prompt(mode)).toBe(`TRIM ${STANDARD}`)
    typed(mode, "O", "")
    expect(prompt(mode)).toBe(`TRIM ${STANDARD_UNDO}`)

    const kept = typed(drawing(), "TRIM", "O", "")
    expect(prompt(kept)).toBe(`TRIM ${QUICK_UNDO}`)

    const edge = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "", "E", "")
    expect(prompt(edge)).toBe(`TRIM ${STANDARD_UNDO}`)

    const alone = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "", "E", "E")
    typed(alone, "U")
    expect(alone.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    typed(alone, "U")
    expect(alone.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde/Edge",
    ])
    typed(alone, "E")
    expect(prompt(alone)).toContain("<No extend>:")
  })

  // probes trim/p380–p383, p388, p301, p303: only an edit is a step, and what
  // changes nothing lists Undo and goes back with the edit before it.
  it("takes back the last edit whatever answers followed it", () => {
    const fence = typed(drawing(), "TRIM", "80,0", "200,200", "210,210")
    expect(prompt(fence)).toBe(`TRIM ${QUICK_UNDO}`)
    typed(fence, "U")
    expect(fence.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    expect(fence.byId<LineEntity>("A").end).toEqual(p(100, 0))
    expect(fence.optionIds()).not.toContain("Undo")

    const empty = typed(drawing(), "TRIM", "200,200", "210,210")
    expect(prompt(empty)).toBe(`TRIM ${QUICK_UNDO}`)

    const refused = typed(
      drawing(undefined, lineOf(p(200, 0), p(300, 0), { id: "F" })),
      "TRIM",
      "O",
      "S",
      "",
      "TRIM",
      "",
      "80,0",
      "250,0"
    )
    expect(refused.commandLog().at(-1)).toBe(
      "Does not intersect with the cutting edge."
    )
    expect(prompt(refused)).toBe(`TRIM ${STANDARD_UNDO}`)
    typed(refused, "U")
    expect(refused.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    expect(refused.byId<LineEntity>("A").end).toEqual(p(100, 0))

    const window = typed(drawing(), "TRIM", "C", "200,200", "210,210")
    expect(window.commandLog().slice(-2)).toEqual([
      `${QUICK_UNDO} Specify opposite corner: 210,210`,
      "No objects crossed by crossing window.",
    ])
    expect(prompt(window)).toBe(`TRIM ${QUICK_UNDO}`)
    typed(window, "U")
    expect(window.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )

    // Standard's window started on nothing (p382).
    const implied = typed(
      drawing(),
      "TRIM",
      "O",
      "S",
      "",
      "TRIM",
      "",
      "200,200",
      "210,210"
    )
    expect(implied.commandLog().slice(-2)).toEqual([
      `${STANDARD_UNDO} Specify opposite corner: 210,210`,
      "No objects crossed by crossing window.",
    ])
  })

  // probes trim/p163, p164: U takes the trim and LTSCALE back.
  it("takes a transparent command back with the edit before it", () => {
    const cad = typed(drawing(), "TRIM", "50,0", "'LTSCALE", "2", "U")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Command has been completely undone.",
      "Regenerating model.",
    ])
    expect(cad.entityCount).toBe(4)
    expect(cad.state().ltScale).toBe(1)
  })

  // probes trim/p141–p144: the only edges, Standard's prompt skipped, nothing
  // left selected.
  it("makes the objects selected before it the only edges", () => {
    const cad = drawing()
    cad.select("V1")
    typed(cad, "TRIM")
    expect(cad.commandLog()).toEqual([
      "TRIM",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select cutting edges ...",
      "1 found",
    ])
    expect(cad.selectedIds()).toEqual([])
    expect(prompt(cad)).toBe(`TRIM ${QUICK}`)
    typed(cad, "50,0")
    expect(endpoints(cad.byId<LineEntity>("A"))).toEqual([p(0, 0), p(30, 0)])
    expect(cad.entityCount).toBe(4)
    expect(ends(cad)).toBe(true)

    const standard = typed(drawing(), "TRIM", "O", "S", "")
    standard.select("V1")
    typed(standard, "TRIM")
    expect(standard.commandLog().slice(-3)).toEqual([
      "Current settings: Projection=UCS, Edge=None, Mode=Standard",
      "Select cutting edges ...",
      "1 found",
    ])
    expect(prompt(standard)).toBe(`TRIM ${STANDARD}`)

    const extend = drawing(
      undefined,
      lineOf(p(40, -10), p(60, -10), { id: "S" })
    )
    extend.select("V1")
    typed(extend, "EXTEND", "58,-10")
    expect(extend.commandLog().slice(2)).toEqual([
      "Select boundary edges ...",
      "1 found",
      "Select object to extend or shift-select to trim or [Boundary edges/Crossing/mOde]: 58,-10",
      "No edge in that direction.",
    ])
    expect(extend.byId<LineEntity>("S").end).toEqual(p(60, -10))

    const spanish = drawing(es)
    spanish.select("V1")
    typed(spanish, "ALARGA")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "Seleccione las aristas de contorno...",
      "1 encontrados",
    ])
  })
})

// AutoCAD 2027's console (probes trim/p289–p307, p380–p382).
describe("TRIM and EXTEND's Fence and Crossing", () => {
  const drawing = () =>
    createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(30, -50), p(30, 50), { id: "L" }),
        lineOf(p(70, -50), p(70, 50), { id: "R" }),
      ],
    })
  const short = (...more: Entity[]) =>
    createHarness({
      entities: [
        lineOf(p(0, 0), p(20, 0), { id: "S" }),
        lineOf(p(30, -50), p(30, 50)),
        lineOf(p(-30, -50), p(-30, 50)),
        ...more,
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const at = (v: Vec2) => `${+v.x.toFixed(4)},${+v.y.toFixed(4)}`
  /** The drawing's objects, those not named `ids` as `new`. */
  const drawn = (cad: CadHarness, ...ids: string[]) =>
    cad.entities().map((e) => {
      const name = ids.includes(e.id) ? e.id : "new"
      if (e.type === "line") return `${name} ${at(e.start)} ${at(e.end)}`
      if (e.type === "arc") {
        return `${name} arc ${at(e.center)} ${e.radius} ${+e.startAngle.toFixed(4)} ${+e.endAngle.toFixed(4)}`
      }
      return `${name} ${e.type}`
    })

  it("trims at every place Fence crosses, as one step", () => {
    const cad = typed(
      drawing(),
      "TRIM",
      "F",
      "20,20",
      "20,-20",
      "80,-20",
      "80,20",
      ""
    )
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: F",
      "Specify first fence point or pick/drag cursor: 20,20",
      "Specify next fence point or [Undo]: 20,-20",
      "Specify next fence point or [Undo]: 80,-20",
      "Specify next fence point or [Undo]: 80,20",
      "Specify next fence point or [Undo]:",
    ])
    expect(drawn(cad, "A", "L", "R")).toEqual([
      "A 30,0 70,0",
      "L 30,0 30,50",
      "R 70,0 70,50",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    typed(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(drawn(cad, "A", "L", "R")).toEqual([
      "A 0,0 100,0",
      "L 30,-50 30,50",
      "R 70,-50 70,50",
    ])
  })

  it("asks Fence's points as AutoCAD does", () => {
    const cad = typed(drawing(), "TRIM", "F", "U", "FOO", "20,20", "U")
    expect(cad.commandLog().slice(3)).toEqual([
      "Specify first fence point or pick/drag cursor: U",
      "Invalid response.",
      "Specify first fence point or pick/drag cursor: FOO",
      "Invalid response.",
      "Specify first fence point or pick/drag cursor: 20,20",
      "Specify next fence point or [Undo]: U",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Specify first fence point or pick/drag cursor:"
    )

    // Undo drops the last point; `@` is from the one before.
    const undone = typed(
      drawing(),
      "TRIM",
      "F",
      "20,20",
      "20,-20",
      "U",
      "80,20",
      "@0,-40",
      "@",
      ""
    )
    expect(undone.commandLog().slice(-3)).toEqual([
      "Specify next fence point or [Undo]: @",
      "Invalid point, polygon segment is zero length.",
      "Specify next fence point or [Undo]:",
    ])
    expect(drawn(undone, "A", "L", "R")).toEqual([
      "A 0,0 70,0",
      "L 30,-50 30,0",
      "R 70,-50 70,0",
    ])

    // Enter with no point or one is a step that changed nothing.
    for (const points of [[], ["50,20"]]) {
      const short = typed(drawing(), "TRIM", "F", ...points, "")
      expect(short.state().commandLine.prompt).toBe(
        "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
      )
      expect(drawn(short, "A", "L", "R")[0]).toBe("A 0,0 100,0")
    }

    // Its points leave LASTPOINT.
    const last = typed(drawing(), "ID", "5,5", "TRIM", "F", "20,20", "20,-20")
    typed(last, "", "", "ID", "@")
    expect(last.commandLog().at(-1)).toBe(" X = 5.00     Y = 5.00     Z = 0.00")

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
    })
    typed(spanish, "RECORTA", "B", "FOO", "70,20", "70,-20", "")
    expect(spanish.commandLog().slice(2)).toEqual([
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar]: B",
      "Precise primer punto del borde o designe/arrastre cursor: FOO",
      "Respuesta no válida.",
      "Precise primer punto del borde o designe/arrastre cursor: 70,20",
      "Precise punto del borde o [desHacer]: 70,-20",
      "Precise punto del borde o [desHacer]:",
    ])
  })

  it("trims what Crossing's window crosses, round it clockwise", () => {
    const cad = typed(drawing(), "TRIM", "C", "75,10", "95,-10")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: C",
      "Specify first corner: 75,10",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: Specify opposite corner: 95,-10",
    ])
    expect(drawn(cad, "A", "L", "R")[0]).toBe("A 0,0 70,0")
    typed(cad, "U")
    expect(drawn(cad, "A", "L", "R")[0]).toBe("A 0,0 100,0")

    for (const [first, opposite, left] of [
      // Every piece it meets, an object no edge crosses then deleted.
      ["60,10", "90,-10", ["A 0,0 30,0", "L 30,-50 30,50"]],
      ["90,-10", "60,10", ["A 0,0 30,0", "L 30,-50 30,50"]],
      [
        "35,10",
        "65,-10",
        ["A 0,0 30,0", "L 30,-50 30,50", "R 70,-50 70,50", "new 70,0 100,0"],
      ],
      // From the top left corner the middle piece goes first, splitting
      // the line: what is left is the new piece.
      ["20,10", "40,-10", ["R 70,-50 70,50", "new 70,0 100,0"]],
      ["40,10", "20,-10", ["R 70,-50 70,50", "new 70,0 100,0"]],
      // From the bottom ones, the end piece: the line is kept.
      ["20,-10", "40,10", ["A 70,0 100,0", "R 70,-50 70,50"]],
      ["40,-10", "20,10", ["A 70,0 100,0", "R 70,-50 70,50"]],
    ] as const) {
      const window = typed(drawing(), "TRIM", "C", first, opposite)
      expect(drawn(window, "A", "L", "R")).toEqual(left)
    }

    // An object inside the window is no object it crosses.
    const inside = typed(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "A" }),
          lineOf(p(30, -50), p(30, 50), { id: "L" }),
          lineOf(p(70, -50), p(70, 50), { id: "R" }),
          lineOf(p(45, -5), p(45, 5), { id: "I" }),
        ],
      }),
      "TRIM",
      "C",
      "35,10",
      "65,-10"
    )
    expect(drawn(inside, "A", "L", "R", "I")).toEqual([
      "A 0,0 30,0",
      "L 30,-50 30,50",
      "R 70,-50 70,50",
      "I 45,-5 45,5",
      "new 70,0 100,0",
    ])

    // A circle loses the arc in the window (AutoCAD 2023's console, not
    // probed again).
    const circle = typed(
      createHarness({
        entities: [
          circleOf(p(50, 0), 20, { id: "O" }),
          lineOf(p(0, 0), p(100, 0), { id: "A" }),
        ],
      }),
      "TRIM",
      "C",
      "45,25",
      "55,15"
    )
    expect(drawn(circle, "O", "A")).toEqual([
      "O arc 50,0 20 3.1416 0",
      "A 0,0 100,0",
    ])
  })

  it("asks Crossing's corners as AutoCAD does", () => {
    const cad = typed(drawing(), "TRIM", "C", "FOO", "60,10", "FOO")
    typed(cad, "", "90,-10")
    expect(cad.commandLog().slice(3)).toEqual([
      "Specify first corner: FOO",
      "*Invalid selection*",
      "Expects a point or Fence/cuTting/Crossing/mOde/eRase",
      "Specify first corner: 60,10",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: Specify opposite corner: FOO",
      "Invalid window specification.",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: Specify opposite corner:",
      "Invalid window specification.",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: Specify opposite corner: 90,-10",
    ])
    expect(drawn(cad, "A", "L", "R")[0]).toBe("A 0,0 30,0")
    // Its first corner is LASTPOINT.
    typed(cad, "", "ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 60.00     Y = 10.00     Z = 0.00"
    )

    // Enter at the first corner ends the command; a window that crosses
    // nothing says so, and is no step, Undo listed (probes trim/p302, p303).
    const ended = typed(drawing(), "TRIM", "C", "")
    expect(ended.activeToolId()).toBe("select")
    const empty = typed(drawing(), "TRIM", "C", "200,200", "210,210")
    expect(empty.commandLog().slice(-2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: Specify opposite corner: 210,210",
      "No objects crossed by crossing window.",
    ])
    expect(empty.optionIds()).toEqual([
      "cuTting",
      "Crossing",
      "mOde",
      "eRase",
      "Undo",
    ])

    // The first corner takes the prompt's words.
    const words = typed(drawing(), "TRIM", "75,0", "C", "U", "F")
    expect(words.commandLog().slice(-4)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]: C",
      "Specify first corner: U",
      "Command has been completely undone.",
      "Specify first corner: F",
    ])
    expect(words.state().commandLine.prompt).toBe(
      "TRIM Specify first fence point or pick/drag cursor:"
    )
    expect(drawn(words, "A", "L", "R")[0]).toBe("A 0,0 100,0")

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(50, -50), p(50, 50))],
    })
    // WHY desHacer listed: as the English console (p301); the Spanish runs
    // disagree among themselves (p241, p382 list it, p298, p301 do not).
    typed(spanish, "RECORTA", "C", "FOO", "60,10", "FOO", "300,300")
    expect(spanish.commandLog().slice(3)).toEqual([
      "Designe primera esquina: FOO",
      "*Designación no válida*",
      "Requiere un punto o Borde/COrte/Captura/MOdo/bOrrar",
      "Designe primera esquina: 60,10",
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]: Designe esquina opuesta: FOO",
      "Designación de ventana no válida.",
      "Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]: Designe esquina opuesta: 300,300",
      "No hay objetos intersecados en la ventana de captura.",
    ])
  })

  it("extends an object at the first place Fence or Crossing meets it", () => {
    const fence = typed(
      short(),
      "EXTEND",
      "F",
      "2,5",
      "18,5",
      "18,-5",
      "2,-5",
      "2,5",
      ""
    )
    expect(fence.commandLog().slice(-2)).toEqual([
      "Specify next fence point or [Undo]:",
      "No edge in that direction.",
    ])
    expect(drawn(fence, "S")[0]).toBe("S 0,0 30,0")

    // Not again, though another edge lies further on.
    const further = typed(
      short(lineOf(p(50, -50), p(50, 50))),
      "EXTEND",
      "F",
      "18,5",
      "18,-5",
      "2,-5",
      "2,5",
      ""
    )
    expect(drawn(further, "S")[0]).toBe("S 0,0 30,0")
    const backwards = typed(short(), "EXTEND", "F", "2,-5", "2,5", "18,5")
    typed(backwards, "18,-5", "")
    expect(drawn(backwards, "S")[0]).toBe("S -30,0 20,0")

    // Each object it extended says so once.
    const two = typed(
      short(lineOf(p(0, 10), p(20, 10), { id: "T" })),
      "EXTEND",
      "F",
      "18,15",
      "18,-5",
      "2,-5",
      "2,15",
      ""
    )
    expect(two.commandLog().slice(-2)).toEqual([
      "No edge in that direction.",
      "No edge in that direction.",
    ])
    expect(drawn(two, "S", "T").filter((l) => !l.startsWith("new"))).toEqual([
      "S 0,0 30,0",
      "T 0,10 30,10",
    ])

    // One it could not extend says why, and nothing more (AutoCAD 2023's
    // console, not probed again).
    const none = typed(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(20, 0), { id: "S" }),
          lineOf(p(-30, -50), p(-30, 50)),
        ],
      }),
      "EXTEND",
      "F",
      "18,5",
      "18,-5",
      "2,-5",
      "2,5",
      ""
    )
    expect(none.commandLog().slice(-2)).toEqual([
      "Specify next fence point or [Undo]:",
      "Path does not intersect with the bounding edge.",
    ])
    expect(drawn(none, "S")[0]).toBe("S 0,0 20,0")

    const window = typed(short(), "EXTEND", "C", "2,5", "18,-5")
    expect(window.commandLog().at(-1)).toBe("No edge in that direction.")
    expect(drawn(window, "S")[0]).toBe("S 0,0 30,0")
    const right = typed(short(), "EXTEND", "C", "12,5", "18,-5")
    expect(drawn(right, "S")[0]).toBe("S 0,0 30,0")
    const left = typed(short(), "EXTEND", "C", "2,-5", "18,5")
    expect(drawn(left, "S")[0]).toBe("S -30,0 20,0")

    const spanish = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(20, 0)),
        lineOf(p(30, -50), p(30, 50)),
        lineOf(p(-30, -50), p(-30, 50)),
      ],
    })
    typed(spanish, "ALARGA", "C", "2,5", "18,-5")
    expect(spanish.commandLog().at(-1)).toBe("No hay límite en esta dirección.")
  })

  // AutoCAD 2023's console, not probed again.
  it("says once why a fence leaves an object", () => {
    const cad = typed(
      createHarness({
        entities: [
          circleOf(p(50, 0), 20, { id: "O" }),
          lineOf(p(50, -50), p(50, 10)),
        ],
      }),
      "TRIM",
      "F",
      "40,30",
      "40,-30",
      ""
    )
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next fence point or [Undo]:",
      "Circle must intersect twice.",
    ])
    expect(cad.byId<CircleEntity>("O").type).toBe("circle")
  })
})
// AutoCAD 2027's console (probes trim/p111, p112, p153).
describe("TRIM's eRase", () => {
  const drawing = (locale?: typeof es) =>
    createHarness({
      locale,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(30, -50), p(30, 50), { id: "L" }),
        lineOf(p(70, -50), p(70, 50), { id: "R" }),
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const ids = (cad: CadHarness) => cad.entities().map((entity) => entity.id)

  it("erases a set as one step of the command's", () => {
    const cad = typed(drawing(), "TRIM", "R", "W", "-10,-60", "40,60", "")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: R",
      "Select objects to erase or <exit>: W",
      "Specify first corner: -10,-60",
      "Specify opposite corner: 40,60",
      "1 found",
      "Select objects to erase:",
    ])
    expect(ids(cad)).toEqual(["A", "R"])
    expect(cad.state().commandLine.prompt).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase/Undo]:"
    )
    typed(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(ids(cad).sort()).toEqual(["A", "L", "R"])

    const picked = typed(drawing(), "TRIM", "R", "30,10", "70,10", "")
    expect(picked.commandLog().slice(3)).toEqual([
      "Select objects to erase or <exit>: 30,10",
      "1 found",
      "Select objects to erase: 70,10",
      "1 found, 2 total",
      "Select objects to erase:",
    ])
    expect(ids(picked)).toEqual(["A"])

    // Each erase a step: U takes back the last.
    const twice = typed(drawing(), "TRIM", "R", "L", "", "R", "30,10", "", "U")
    expect(ids(twice)).toEqual(["A", "L"])
  })

  it("asks its set as Select objects asks it", () => {
    const cad = typed(drawing(), "TRIM", "R", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select objects to erase or <exit>: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
    ])
    // Enter with nothing in it ends the command.
    typed(cad, "")
    expect(cad.activeToolId()).toBe("select")
    expect(ids(cad)).toEqual(["A", "L", "R"])

    const undone = typed(drawing(), "TRIM", "R", "L", "U")
    expect(undone.state().commandLine.prompt).toBe(
      "TRIM Select objects to erase or <exit>:"
    )

    // EXTEND has none (probe trim/p113).
    const extend = typed(drawing(), "EXTEND", "R")
    expect(extend.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/Boundary edges/Crossing/mOde",
    ])

    const spanish = typed(drawing(es), "RECORTA", "O", "LT", "")
    expect(spanish.commandLog()[3]).toBe(
      "Designe objetos que borrar o <salir>: LT"
    )
    expect(spanish.state().commandLine.prompt).toBe(
      "RECORTA Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Captura/MOdo/bOrrar/desHacer]:"
    )
    expect(ids(spanish)).toEqual(["A", "L"])
  })
})
// AutoCAD 2027's console (probes trim/p107, p109, p136).
describe("TRIM and EXTEND's mOde and cuTting edges", () => {
  const drawing = (locale?: typeof es, ...more: Entity[]) =>
    createHarness({
      locale,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(30, -50), p(30, 50), { id: "L" }),
        lineOf(p(70, -50), p(70, 50), { id: "R" }),
        lineOf(p(200, 0), p(300, 0), { id: "F" }),
        ...more,
      ],
    })
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const at = (v: Vec2) => `${+v.x.toFixed(4)},${+v.y.toFixed(4)}`
  const drawn = (cad: CadHarness, ...ids: string[]) =>
    cad.entities().map((e) => {
      const name = ids.includes(e.id) ? e.id : "new"
      if (e.type === "line") return `${name} ${at(e.start)} ${at(e.end)}`
      if (e.type === "polyline") {
        return `${name} ${e.vertices.map(at).join(" ")}`
      }
      return `${name} ${e.type}`
    })
  const prompt = (cad: CadHarness) => cad.state().commandLine.prompt

  it("asks the mode, which Standard keeps for both commands", () => {
    const cad = typed(drawing(), "TRIM", "O", "FOO", "")
    expect(cad.commandLog().slice(2)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: O",
      "Enter a trim mode option [Quick/Standard] <Quick>: FOO",
      "Invalid option keyword.",
      "Enter a trim mode option [Quick/Standard] <Quick>:",
    ])
    // Standard now, every object an edge, as none was chosen.
    typed(cad, "O", "S")
    expect(prompt(cad)).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase/Undo]:"
    )
    typed(cad, "50,0")
    expect(drawn(cad, "A", "L", "R", "F")).toEqual([
      "A 0,0 30,0",
      "L 30,-50 30,50",
      "R 70,-50 70,50",
      "F 200,0 300,0",
      "new 70,0 100,0",
    ])

    // The next TRIM asks its cutting edges; EXTEND its boundary edges.
    typed(cad, "", "TRIM")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Current settings: Projection=UCS, Edge=None, Mode=Standard",
      "Select cutting edges ...",
    ])
    expect(prompt(cad)).toBe("TRIM Select objects or [mOde] <select all>:")
    typed(cad, "", "")
    typed(cad, "EXTEND")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Current settings: Projection=UCS, Edge=None, Mode=Standard",
      "Select boundary edges ...",
    ])
    typed(cad, "")
    expect(prompt(cad)).toBe(
      "EXTEND Select object to extend or shift-select to trim or [Boundary edges/Fence/Crossing/mOde/Edge]:"
    )
    typed(cad, "FOO", "O")
    expect(cad.commandLog().slice(-3)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/Boundary edges/Crossing/mOde",
      "Select object to extend or shift-select to trim or [Boundary edges/Fence/Crossing/mOde/Edge]: O",
    ])
    expect(prompt(cad)).toBe(
      "EXTEND Enter an extend mode option [Quick/Standard] <Standard>:"
    )
    typed(cad, "Q", "", "TRIM")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Projection=UCS, Edge=None, Mode=Quick"
    )
  })

  it("cuts with the edges chosen alone, saying what none crosses", () => {
    const cad = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select objects or [mOde] <select all>: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
    ])
    typed(cad, "30,10", "")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select objects or [mOde] <select all>: 30,10",
      "1 found",
      "Select objects:",
    ])
    // Standard deletes nothing, Undo listed (probes trim/p273, p383).
    typed(cad, "250,0")
    expect(cad.commandLog().at(-1)).toBe(
      "Does not intersect with the cutting edge."
    )
    expect(cad.optionIds()).toContain("Undo")
    typed(cad, "50,0")
    expect(drawn(cad, "A", "L", "R", "F")[0]).toBe("A 0,0 30,0")

    // A pick on nothing starts a crossing window, either way, Undo listed
    // (probes trim/p308, p382).
    for (const [first, opposite] of [
      ["85,10", "95,-10"],
      ["95,-10", "85,10"],
    ]) {
      const window = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "")
      typed(window, first, opposite)
      expect(window.commandLog().slice(-2)).toEqual([
        `Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase]: ${first}`,
        `Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase/Undo]: Specify opposite corner: ${opposite}`,
      ])
      expect(drawn(window, "A", "L", "R", "F")[0]).toBe("A 0,0 70,0")
    }

    // An edge's pieces are edges.
    const pieces = typed(
      drawing(undefined, lineOf(p(85, -50), p(85, 50), { id: "V" })),
      "TRIM",
      "O",
      "S",
      "",
      "TRIM",
      "50,0",
      "30,10",
      "70,10",
      "",
      "50,0",
      "85,20"
    )
    expect(drawn(pieces, "V")).toContain("V 85,-50 85,0")
  })

  it("chooses cutting edges in Quick mode, which stays", () => {
    const cad = typed(drawing(), "TRIM", "T")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: T",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select cutting edges ...",
    ])
    expect(prompt(cad)).toBe("TRIM Select objects or <select all>:")
    typed(cad, "30,10", "", "50,0", "250,0")
    // Only L cuts; what it does not cross is deleted, as Quick mode does.
    expect(drawn(cad, "A", "L", "R", "F")).toEqual([
      "A 0,0 30,0",
      "L 30,-50 30,50",
      "R 70,-50 70,50",
    ])

    // Enter there takes every object.
    const all = typed(drawing(), "TRIM", "T", "", "50,0")
    expect(drawn(all, "A")[0]).toBe("A 0,0 30,0")
    expect(drawn(all, "A").at(-1)).toBe("new 70,0 100,0")

    // The edges chosen outlast the mode.
    const kept = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "30,10", "")
    typed(kept, "O", "Q", "50,0")
    expect(drawn(kept, "A", "L", "R", "F")).toEqual([
      "A 0,0 30,0",
      "L 30,-50 30,50",
      "R 70,-50 70,50",
      "F 200,0 300,0",
    ])

    // mOde at the edges' prompt: Standard asks them again, Quick takes all.
    const again = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "O", "S")
    expect(prompt(again)).toBe("TRIM Select objects or [mOde] <select all>:")
    typed(again, "O", "Q")
    expect(prompt(again)).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]:"
    )

    // Once the set holds something mOde is `*Invalid*`, and nothing more
    // (probes trim/p283, p389).
    const held = typed(drawing(), "TRIM", "O", "S", "", "TRIM", "30,10", "O")
    expect(held.commandLog().slice(-2)).toEqual([
      "Select objects: O",
      "*Invalid*",
    ])
    expect(prompt(held)).toBe("TRIM Select objects:")
    const spanish = typed(drawing(es), "RECORTA", "MO", "E", "", "RECORTA")
    typed(spanish, "30,10", "MO")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "Designe objetos: MO",
      "*No válido*",
    ])

    const extend = typed(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(20, 0), { id: "S" }),
          lineOf(p(30, -50), p(30, 50)),
          lineOf(p(-30, -50), p(-30, 50)),
        ],
      }),
      "EXTEND",
      "B"
    )
    expect(extend.commandLog().at(-1)).toBe("Select boundary edges ...")
    typed(extend, "30,10", "", "18,0")
    expect(drawn(extend, "S")[0]).toBe("S 0,0 30,0")
  })

  it("trims a polyline at its own vertices only when it is an edge", () => {
    const corner = () =>
      createHarness({
        entities: [
          polylineOf([p(0, 40), p(100, 40), p(100, 80)], { id: "P" }),
          lineOf(p(30, -50), p(30, 50), { id: "L" }),
          lineOf(p(70, -50), p(70, 50), { id: "R" }),
        ],
      })
    const own = typed(corner(), "TRIM", "O", "S", "", "TRIM", "", "100,60")
    expect(drawn(own, "P")[0]).toBe("P 0,40 100,40")
    const path = typed(corner(), "TRIM", "T", "30,10", "", "100,60")
    expect(drawn(path, "P")[0]).toBe("P 0,40 30,40")
  })

  it("asks them in Spanish AutoCAD's words", () => {
    const cad = typed(drawing(es), "RECORTA", "MO")
    expect(prompt(cad)).toBe(
      "RECORTA Introduzca una opción de modo de recorte [Rápido/Estándar] <Rápido>:"
    )
    typed(cad, "E", "", "RECORTA")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Parámetros actuales: Proyección=SCP, Arista=Ninguno, Modo=Estándar",
      "Seleccione aristas de corte...",
    ])
    expect(prompt(cad)).toBe(
      "RECORTA Seleccione objetos o [MOdo] <seleccionar todo>:"
    )
    typed(cad, "30,10", "", "250,0")
    expect(cad.commandLog().at(-1)).toBe(
      "No se interseca con la arista de corte."
    )
    expect(prompt(cad)).toBe(
      "RECORTA Seleccione un objeto que recortar o use la tecla Mayús y seleccione para alargar, o [aristas de COrte/Borde/Captura/MOdo/Arista/bOrrar/desHacer]:"
    )
    typed(cad, "", "ALARGA")
    expect(cad.commandLog().at(-1)).toBe(
      "Seleccione las aristas de contorno..."
    )
  })
})
// AutoCAD 2027's console (probes trim/p125, p135, p137, p138, p146).
describe("TRIM and EXTEND's Edge", () => {
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  /** Standard mode, every object an edge. */
  const standard = (cad: CadHarness, command = "TRIM") =>
    typed(cad, "TRIM", "O", "S", "", command, "")
  const short = (...more: Entity[]) =>
    createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(30, 10), p(30, 50), { id: "L" }),
        ...more,
      ],
    })
  const at = (v: Vec2) => `${+v.x.toFixed(4)},${+v.y.toFixed(4)}`
  /** The lines `id` and those new, start and end. */
  const lines = (cad: CadHarness, id = "A") =>
    cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
      .filter((e) => e.id === id || !["L", "R", "M"].includes(e.id))
      .map((e) => `${at(e.start)} ${at(e.end)}`)
  const prompt = (cad: CadHarness) => cad.state().commandLine.prompt

  it("asks the implied edge extension mode, Standard's alone", () => {
    const cad = standard(short(lineOf(p(70, -50), p(70, 50), { id: "R" })))
    typed(cad, "E", "FOO", "")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase]: E",
      "Enter an implied edge extension mode [Extend/No extend] <No extend>: FOO",
      "Invalid option keyword.",
      "Enter an implied edge extension mode [Extend/No extend] <No extend>:",
    ])
    // Its Enter lists Undo (probe trim/p161).
    expect(cad.optionIds()).toContain("Undo")
    // A choice joins the next edit; the short edge now cuts as if it ran on.
    typed(cad, "E", "E")
    expect(prompt(cad)).toBe(
      "TRIM Select object to trim or shift-select to extend or [cuTting edges/Fence/Crossing/mOde/Edge/eRase/Undo]:"
    )
    typed(cad, "50,0")
    expect(lines(cad)).toEqual(["0,0 30,0", "70,0 100,0"])
    typed(cad, "", "TRIM")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Current settings: Projection=UCS, Edge=Extend, Mode=Standard",
      "Select cutting edges ...",
    ])
    typed(cad, "", "E")
    expect(prompt(cad)).toBe(
      "TRIM Enter an implied edge extension mode [Extend/No extend] <Extend>:"
    )

    // Quick mode lets no edge run on, and says None.
    typed(cad, "N", "O", "Q", "", "TRIM", "E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
    ])
    // Quick from the edges' prompt takes its first Enter (probe trim/p284).
    const quick = standard(short(lineOf(p(70, -50), p(70, 50), { id: "R" })))
    typed(quick, "E", "E", "", "TRIM", "O", "Q", "", "", "TRIM")
    expect(quick.commandLog().at(-1)).toBe(
      "Current settings: Projection=UCS, Edge=None, Mode=Quick"
    )
    typed(quick, "50,0")
    expect(lines(quick)).toEqual(["70,0 100,0"])

    const extend = standard(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(20, 0), { id: "A" }),
          lineOf(p(30, 10), p(30, 50), { id: "L" }),
        ],
      }),
      "EXTEND"
    )
    typed(extend, "E", "E", "18,0")
    expect(lines(extend)).toEqual(["0,0 30,0"])

    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(30, 10), p(30, 50))],
    })
    typed(spanish, "RECORTA", "MO", "E", "", "RECORTA", "", "A")
    expect(prompt(spanish)).toBe(
      "RECORTA Indique modo de alargamiento de arista implícito [Alargar/No alargar] <No alargar>:"
    )
    typed(spanish, "A", "", "RECORTA")
    expect(spanish.commandLog().at(-2)).toBe(
      "Parámetros actuales: Proyección=SCP, Arista=Alargar, Modo=Estándar"
    )
  })

  // probes trim/p125, p151: declared `Noextend` (es `No`), listed `No extend`.
  it("takes No extend by its declared word", () => {
    const cad = standard(short())
    typed(cad, "E", "E", "E", "Noextend", "E")
    expect(prompt(cad)).toBe(
      "TRIM Enter an implied edge extension mode [Extend/No extend] <No extend>:"
    )
    const spanish = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(30, 10), p(30, 50))],
    })
    typed(spanish, "RECORTA", "MO", "E", "", "RECORTA", "", "A", "A")
    typed(spanish, "A", "No", "A")
    expect(prompt(spanish)).toBe(
      "RECORTA Indique modo de alargamiento de arista implícito [Alargar/No alargar] <No alargar>:"
    )
  })

  it("runs an edge on as AutoCAD does", () => {
    const extended = (...edges: Entity[]) => {
      const cad = standard(
        createHarness({
          entities: [lineOf(p(0, 0), p(100, 0), { id: "A" }), ...edges],
        })
      )
      return typed(cad, "E", "E", "50,0")
    }
    // An arc and an elliptical arc round their whole curve.
    expect(lines(extended(arcOf(p(50, 0), 20, deg(30), deg(150))))).toEqual([
      "0,0 30,0",
      "70,0 100,0",
    ])
    const ellipse = ellipseOf(p(50, 0), p(20, 0), 0.5, {
      startParam: ellipseParamFromAngle(0.5, deg(30)),
      endParam: ellipseParamFromAngle(0.5, deg(150)),
    })
    expect(lines(extended(ellipse))).toEqual(["0,0 30,0", "70,0 100,0"])
    // An open polyline on from its ends, along its end segments.
    expect(
      lines(extended(polylineOf([p(30, 50), p(30, 10)], { id: "M" })))
    ).toEqual(["0,0 30,0"])
    expect(
      lines(
        extended(polylineOf([p(40, 10), p(30, 30), p(30, 50)], { id: "M" }))
      )
    ).toEqual(["0,0 45,0"])
    const corner = extended(
      polylineOf([p(20, 10), p(30, 10), p(30, 50)], { id: "M" })
    )
    expect(corner.commandLog().at(-1)).toBe(
      "Does not intersect with the cutting edge."
    )
  })

  // WHY refused: AutoCAD 2027's console asks `Enter a projection option
  // [None/Ucs/View] <Ucs>:` (probes trim/p106, p127), whose None and View
  // are not built.
  it("refuses Project, an option not built", () => {
    const cad = typed(short(), "TRIM", "P")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: P",
      "*Invalid selection*",
      "Expects a point or Fence/cuTting edges/Crossing/mOde",
    ])
    cad.escape()
    standard(cad, "EXTEND")
    typed(cad, "P")
    expect(cad.commandLog().at(-3)).toBe(
      "Select object to extend or shift-select to trim or [Boundary edges/Fence/Crossing/mOde/Edge]: P"
    )
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Fence/Boundary edges/Crossing/mOde"
    )
  })

  it("takes an Edge choice back with the step after it, or before", () => {
    const drawing = () =>
      standard(
        short(
          lineOf(p(50, -50), p(50, 50), { id: "M" }),
          lineOf(p(70, -50), p(70, 50), { id: "R" })
        )
      )
    const alone = typed(drawing(), "E", "E", "U")
    expect(alone.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    typed(alone, "E")
    expect(prompt(alone)).toContain("<No extend>:")

    const after = typed(drawing(), "E", "E", "40,0", "60,0", "U")
    expect(lines(after)).toEqual(["0,0 30,0", "50,0 100,0"])
    typed(after, "U")
    expect(after.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    expect(lines(after)).toEqual(["0,0 100,0"])
    typed(after, "E")
    expect(prompt(after)).toContain("<No extend>:")

    const between = typed(drawing(), "60,0", "E", "E", "40,0", "U", "E")
    expect(lines(between)).toEqual(["0,0 50,0", "70,0 100,0"])
    expect(prompt(between)).toContain("<No extend>:")

    const before = typed(drawing(), "60,0", "E", "E", "U")
    expect(before.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    expect(lines(before)).toEqual(["0,0 100,0"])
  })
})
// Probes trim/p209, p210, p213, p229, p230; the rest AutoCAD 2023's console
// (acc/e1–e7, w1, c1–c4, t1–t9, o4 of the elliptical arcs session, read with
// LIST at AUPREC 4), not probed again.
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

  it("says why it reaches no edge, and Undo takes it back", () => {
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
          "Este objeto no se puede ALARGAR.",
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
      cad.option("Undo")
      expect(cad.commandLog().at(-1)).toMatch(/^(Command|Todos)/)
      expect(cad.optionIds()).toEqual(["Boundary", "Crossing", "mOde"])
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
      expect(cad.state().commandLine.prompt).toMatch(/\/(Undo|desHacer)\]:$/)
    }
  })
})

// Probes trim/p187, p188, p211; the rest AutoCAD 2023's console (acc/b1, p1,
// p4, q1–q6, c3, s4, t6, o3 of the elliptical arcs session, read with LIST at
// AUPREC 4), not probed again. The values are the CV spline's, the one that
// session measured.
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
    expect(cut.optionIds()).toEqual([
      "cuTting",
      "Crossing",
      "mOde",
      "eRase",
      "Undo",
    ])
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
          "Este objeto no se puede ALARGAR.",
        ],
      ],
    ] as const) {
      const entities = [closed, lineOf(p(50, 0), p(50, 100))]
      const cad = createHarness({ locale, entities })
      cad.command(trim).click(p(100, 0))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      expect(cad.state().commandLine.prompt).toMatch(/\/(Undo|desHacer)\]:$/)
      cad.escape().command(extend).click(p(0, 0))
      expect(cad.commandLog().at(-1)).toBe(said[1])
      expect(cad.state().commandLine.prompt).toMatch(/\/(Undo|desHacer)\]:$/)
      expect(cad.entities()).toEqual(entities)
    }
  })
})

// AutoCAD 2027's console (probes trim/p170–p239, p410–p413): what TRIM and
// EXTEND take as an edge, what they refuse and in which words, and the
// objects they leave.
describe("TRIM and EXTEND's edges, refusals and pieces", () => {
  const typed = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      if (text === "") cad.enter()
      else {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    return cad
  }
  const said = (cad: CadHarness) => cad.commandLog().at(-1)
  const ends = (line: LineEntity) => [line.start, line.end]
  const B1 = {
    id: "B1",
    name: "B1",
    basePoint: p(0, 0),
    entities: [lineOf(p(0, -50), p(0, 50))],
  }

  describe("a polyline's arc segment as an edge", () => {
    const slot = () =>
      polylineOf([p(0, 0), p(100, 0)], { id: "P", bulges: [1] })

    it("cuts a line where the arc crosses it, not at its chord (probe trim/p171)", () => {
      const cad = createHarness({
        entities: [slot(), lineOf(p(50, 100), p(50, -100), { id: "L" })],
      })
      typed(cad, "TRIM", "50,80")
      expect(ends(cad.byId<LineEntity>("L"))).toBeCloseToPoints([
        p(50, -50),
        p(50, -100),
      ])
    })

    it("bounds a line grown to it (probe trim/p172)", () => {
      const cad = createHarness({
        entities: [slot(), lineOf(p(50, -200), p(50, -150), { id: "L" })],
      })
      typed(cad, "EXTEND", "50,-160")
      expect(cad.byId<LineEntity>("L").end).toBeCloseToPoint(p(50, -50))
    })

    it("cuts a circle it crosses twice, which Quick no longer deletes (probe trim/p173)", () => {
      const cad = createHarness({
        entities: [slot(), circleOf(p(50, -50), 30, { id: "C" })],
      })
      typed(cad, "TRIM", "50,-80")
      const arc = cad.byId<ArcEntity>("C")
      expect(arc.type).toBe("arc")
      expect(arc.startAngle).toBeCloseTo(0.304693, 5)
      expect(arc.endAngle).toBeCloseTo(2.8369, 4)
    })
  })

  describe("blocks and text as edges", () => {
    it("takes a block reference's objects as edges (probe trim/p237)", () => {
      const cad = createHarness({
        entities: [
          createInsert("B1", p(50, 0)),
          lineOf(p(0, 0), p(100, 0), { id: "L" }),
        ],
        blocks: [B1],
      })
      typed(cad, "TRIM", "75,0")
      expect(ends(cad.byId<LineEntity>("L"))).toBeCloseToPoints([
        p(0, 0),
        p(50, 0),
      ])

      // A reference nested in the block's objects is an edge too.
      const nested = createHarness({
        entities: [
          createInsert("B2", p(50, 0)),
          lineOf(p(0, 0), p(100, 0), { id: "L" }),
        ],
        blocks: [
          B1,
          {
            id: "B2",
            name: "B2",
            basePoint: p(0, 0),
            entities: [createInsert("B1", p(10, 0))],
          },
        ],
      })
      typed(nested, "TRIM", "75,0")
      expect(ends(nested.byId<LineEntity>("L"))).toBeCloseToPoints([
        p(0, 0),
        p(60, 0),
      ])
    })

    it("takes the box of a TEXT or an MTEXT as edges, an attribute definition's not (probes trim/p238, p412, p413)", () => {
      const text = createText(p(40, -5), "HOLA", { height: 10 })
      const cut = typed(
        createHarness({
          entities: [text, lineOf(p(0, 0), p(100, 0), { id: "L" })],
        }),
        "TRIM",
        "95,0"
      )
      expect(ends(cut.byId<LineEntity>("L"))).toBeCloseToPoints([
        p(0, 0),
        p(textCorners(text)[1].x, 0),
      ])

      const mtext = createMText(p(40, 10), "HOLA", { height: 10, width: 100 })
      const right = Math.max(...mtextCorners(mtext).map((corner) => corner.x))
      const boxed = typed(
        createHarness({
          entities: [mtext, lineOf(p(0, 5), p(200, 5), { id: "L" })],
        }),
        "TRIM",
        "195,5"
      )
      expect(ends(boxed.byId<LineEntity>("L"))).toBeCloseToPoints([
        p(0, 5),
        p(right, 5),
      ])

      const attdef = createAttributeDefinition(p(40, -5), "TAG", {
        height: 10,
      })
      const quick = typed(
        createHarness({
          entities: [attdef, lineOf(p(0, 0), p(100, 0), { id: "L" })],
        }),
        "TRIM",
        "95,0"
      )
      expect(quick.entities()).toEqual([attdef])
    })

    it("takes no hatch as an edge: Quick deletes what only it crosses (probe trim/p203)", () => {
      const cad = createHarness({
        entities: [
          hatchOf([loopOf(p(0, 0), p(100, 50))]),
          lineOf(p(-50, 25), p(150, 25), { id: "L" }),
        ],
      })
      typed(cad, "TRIM", "-40,25")
      expect(cad.entities().map((e) => e.type)).toEqual(["hatch"])
    })
  })

  describe("what they refuse", () => {
    const edge = () => lineOf(p(50, -50), p(50, 50), { id: "V" })
    const run = (
      entity: Entity,
      command: string,
      pick: string,
      locale?: typeof es
    ) =>
      typed(
        createHarness({
          locale,
          entities: [entity, edge()],
          blocks: [{ ...B1, entities: [lineOf(p(0, 0), p(100, 0))] }],
        }),
        command,
        pick
      )

    it("refuses text, MTEXT, attribute definitions, block references and hatches in each table's words, listing Undo (probes trim/p190–p193, p198, p199, p202, p410)", () => {
      const hatch = hatchOf([loopOf(p(0, 0), p(100, 50))])
      for (const [entity, pick, trim, extend] of [
        [
          createText(p(0, 0), "HOLA", { height: 10 }),
          "3,3",
          "Objeto no procesado por RECORTA.",
          "Objeto no procesado por ALARGA.",
        ],
        [
          createAttributeDefinition(p(0, 30), "TAG", { height: 10 }),
          "3,33",
          "Objeto no procesado por RECORTA.",
          "Objeto no procesado por ALARGA.",
        ],
        [
          createMText(p(0, 10), "HOLA", { height: 10, width: 100 }),
          "3,5",
          "Este objeto no se puede RECORTAR.",
          "Este objeto no se puede ALARGAR.",
        ],
        [
          createInsert("B1", p(0, 0)),
          "25,0",
          "Objeto no procesado por RECORTA.",
          "Objeto no procesado por ALARGA.",
        ],
        [
          hatch,
          "0,25",
          "Este objeto no se puede RECORTAR.",
          "Este objeto no se puede ALARGAR.",
        ],
      ] as const) {
        const results = [
          run(entity, "TRIM", pick),
          run(entity, "RECORTA", pick, es),
          run(entity, "EXTEND", pick),
          run(entity, "ALARGA", pick, es),
        ]
        expect(results.map(said)).toEqual([
          "Cannot TRIM this object.",
          trim,
          "Cannot EXTEND this object.",
          extend,
        ])
        for (const cad of results) {
          expect(cad.state().commandLine.prompt).toMatch(
            /\/(Undo|desHacer)\]:$/
          )
          expect(cad.entities()).toHaveLength(2)
        }
      }
    })

    it("deletes a dimension in Quick mode, says it does not intersect in Standard (probes trim/p194, p239, p195)", () => {
      const dimension = () =>
        createDimension("linear", p(0, 0), p(100, 0), p(50, 20))
      const quick = run(dimension(), "TRIM", "25,20")
      expect(quick.entities().map((e) => e.type)).toEqual(["line"])
      const standard = typed(
        createHarness({ entities: [dimension(), edge()] }),
        "TRIM",
        "_O",
        "_S",
        "25,20"
      )
      expect(said(standard)).toBe("Does not intersect with the cutting edge.")
      expect(standard.entities()).toHaveLength(2)
      expect(said(run(dimension(), "EXTEND", "25,20"))).toBe(
        "Path does not intersect with the bounding edge."
      )
    })

    it("words EXTEND's refusal of a closed object by its table (probes trim/p207–p211)", () => {
      const far = lineOf(p(250, 250), p(280, 250))
      const refused = (entity: Entity, pick: string) =>
        said(
          typed(
            createHarness({ locale: es, entities: [far, entity] }),
            "ALARGA",
            pick
          )
        )
      expect([
        refused(
          polylineOf([p(0, 60), p(50, 60), p(50, 80)], { closed: true }),
          "25,60"
        ),
        refused(ellipseOf(p(0, 0), p(100, 0), 0.5), "-100,0"),
        refused(
          createSpline("fit", [p(0, 0), p(50, 30), p(100, 0), p(50, -30)], {
            closed: true,
          }),
          "0,0"
        ),
        refused(circleOf(p(30, -40), 10), "40,-40"),
      ]).toEqual([
        "Este objeto no se puede ALARGAR.",
        "Este objeto no se puede ALARGAR.",
        "Este objeto no se puede ALARGAR.",
        "Objeto no procesado por ALARGA.",
      ])
    })
  })

  describe("the plane", () => {
    const FRONT = { x: 0, y: -1, z: 0 }
    const upright = () => withNormal(circleOf(p(50, 0), 20, { id: "C" }), FRONT)

    it("refuses an object perpendicular to the UCS, and keeps what only one crosses (probes trim/p220, p221, p411)", () => {
      for (const [locale, trim, extend, object, crossed] of [
        [
          undefined,
          "TRIM",
          "EXTEND",
          "Object is perpendicular to UCS XY plane.",
          "Edge is perpendicular to UCS XY plane.",
        ],
        [
          es,
          "RECORTA",
          "ALARGA",
          "El objeto es perpendicular al plano XY del SCP.",
          "La arista es perpendicular al plano XY del SCP.",
        ],
      ] as const) {
        const across = [upright(), lineOf(p(50, -50), p(50, 50), { id: "L" })]
        const picked = typed(
          createHarness({ locale, entities: across }),
          trim,
          "35,0"
        )
        expect(said(picked)).toBe(object)
        expect(picked.state().commandLine.prompt).toMatch(
          /\/(Undo|desHacer)\]:$/
        )
        const kept = typed(
          createHarness({ locale, entities: across }),
          trim,
          "50,30"
        )
        expect(said(kept)).toBe(crossed)
        expect(kept.entities()).toEqual(across)

        const short = [upright(), lineOf(p(50, -100), p(50, -50), { id: "L" })]
        const grown = typed(
          createHarness({ locale, entities: short }),
          extend,
          "35,0",
          "50,-55"
        )
        expect(
          grown.commandLog().filter((line) => line === object)
        ).toHaveLength(1)
        expect(said(grown)).toBe(crossed)
        expect(grown.entities()).toEqual(short)
      }
    })

    it("trims a circle whose normal is -Z in its plane, and takes it as an edge (probe trim/p175)", () => {
      const cad = createHarness({
        entities: [
          withElevation(
            withNormal(circleOf(p(0, 0), 100, { id: "C" }), {
              x: 0,
              y: 0,
              z: -1,
            }),
            10
          ),
          lineOf(p(0, -200), p(0, 200)),
          lineOf(p(-150, 50), p(150, 50), { id: "H" }),
        ],
      })
      typed(cad, "TRIM", "-100,0", "-120,50")
      const arc = cad.byId<ArcEntity>("C")
      expect(arc).toMatchObject({
        type: "arc",
        normal: { x: 0, y: 0, z: -1 },
        elevation: 10,
      })
      expect(arc.startAngle).toBeCloseToAngle(deg(30))
      expect(arc.endAngle).toBeCloseToAngle(deg(270))
      expect(ends(cad.byId<LineEntity>("H"))).toBeCloseToPoints(
        [p(-86.60254, 50), p(150, 50)],
        5
      )
    })

    it("reads a typed pick in a turned UCS (probe trim/p222)", () => {
      const cad = createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "A" }),
          lineOf(p(30, -50), p(30, 50)),
          lineOf(p(70, -50), p(70, 50)),
        ],
      })
      typed(cad, "UCS", "Z", "30", "TRIM", "43.30127,-25")
      expect(ends(cad.byId<LineEntity>("A"))).toBeCloseToPoints([
        p(0, 0),
        p(30, 0),
      ])
      expect(cad.entities()).toHaveLength(4)
    })

    it("cuts a line at another Z by an edge at Z 0, keeping its Z (probe trim/p223)", () => {
      const cad = createHarness({
        entities: [
          withElevation(lineOf(p(0, 0), p(100, 0), { id: "A" }), 20),
          lineOf(p(50, -50), p(50, 50)),
        ],
      })
      typed(cad, "TRIM", "75,0")
      const a = cad.byId<LineEntity>("A")
      expect(ends(a)).toBeCloseToPoints([p(0, 0), p(50, 0)])
      expect([lineStartZ(a), lineEndZ(a)]).toEqual([20, 20])
    })
  })

  describe("polylines", () => {
    it("opens a closed one with widths, the cut segment's width read at the cut (probe trim/p177)", () => {
      const cad = createHarness({
        entities: [
          polylineOf([p(-50, -50), p(50, -50), p(50, 50), p(-50, 50)], {
            id: "P",
            closed: true,
            widths: [
              [0, 2],
              [2, 4],
              [4, 6],
              [6, 8],
            ],
          }),
          lineOf(p(0, 0), p(0, 100)),
        ],
      })
      typed(cad, "TRIM", "25,50")
      const poly = cad.byId<PolylineEntity>("P")
      expect(poly.vertices).toBeCloseToPoints([
        p(0, 50),
        p(-50, 50),
        p(-50, -50),
        p(50, -50),
        p(50, 50),
      ])
      expect(
        poly.widths?.map(([s, e]) => [+s.toFixed(6), +e.toFixed(6)])
      ).toEqual([
        [5, 6],
        [6, 8],
        [0, 2],
        [2, 4],
      ])
    })

    it("splits an open one at a straight or an arc segment, the bulges kept or refitted (probes trim/p178, p179)", () => {
      const drawing = (a: number, b: number) =>
        createHarness({
          entities: [
            polylineOf([p(0, 0), p(100, 0), p(200, 0), p(300, 0)], {
              id: "P",
              bulges: [0, 0.5, 0],
            }),
            lineOf(p(a, -50), p(a, 50)),
            lineOf(p(b, -50), p(b, 50)),
          ],
        })
      const straight = typed(drawing(40, 60), "TRIM", "50,0")
      const [kept, , , other] = straight.entities() as PolylineEntity[]
      expect(kept.id).toBe("P")
      expect(kept.vertices).toBeCloseToPoints([p(0, 0), p(40, 0)])
      expect(other.vertices).toBeCloseToPoints([
        p(60, 0),
        p(100, 0),
        p(200, 0),
        p(300, 0),
      ])
      expect(other.bulges).toEqual([0, 0.5, 0])

      const arc = typed(drawing(130, 170), "TRIM", "150,-25")
      const [from, , , to] = arc.entities() as PolylineEntity[]
      expect(from.id).toBe("P")
      expect(from.vertices).toBeCloseToPoints(
        [p(0, 0), p(100, 0), p(130, -21.713596)],
        5
      )
      expect(from.bulges?.[1]).toBeCloseTo(0.151536, 5)
      expect(to.vertices).toBeCloseToPoints(
        [p(170, -21.713596), p(200, 0), p(300, 0)],
        5
      )
      expect(to.bulges?.[0]).toBeCloseTo(0.151536, 5)
    })

    it("refuses a closed one cut once in Standard mode, no edge itself (probe trim/p184)", () => {
      for (const [locale, name, words] of [
        [
          undefined,
          "TRIM",
          "Curve must intersect cutting edges at least twice.",
        ],
        [
          es,
          "RECORTA",
          "La curva debe intersecar las aristas de corte al menos dos veces.",
        ],
      ] as const) {
        const entities = [
          polylineOf([p(-50, -50), p(50, -50), p(50, 50), p(-50, 50)], {
            id: "P",
            closed: true,
          }),
          lineOf(p(0, 0), p(0, 100), { id: "L" }),
        ]
        const cad = createHarness({ locale, entities })
        typed(cad, name, "_O", "_S", "_T", "_L", "", "-50,0")
        expect(said(cad)).toBe(words)
        expect(cad.entities()).toEqual(entities)
      }
    })

    it("grows an open one to its own other segments, not to the neighbour of the end it grows (probe trim/p236)", () => {
      const cad = typed(
        createHarness({
          entities: [
            polylineOf([p(0, 50), p(100, 50), p(100, 0), p(50, 0), p(50, 20)], {
              id: "P",
            }),
          ],
        }),
        "EXTEND",
        "50,18"
      )
      expect(cad.byId<PolylineEntity>("P").vertices.at(-1)).toBeCloseToPoint(
        p(50, 50)
      )
      const hook = typed(
        createHarness({
          entities: [polylineOf([p(0, 0), p(100, 0), p(100, 20)], { id: "P" })],
        }),
        "EXTEND",
        "100,18"
      )
      expect(said(hook)).toBe("Object does not intersect an edge.")
    })
  })

  describe("ends and tangents", () => {
    it("grows an end already on a boundary to the next one, or says the path's words (probes trim/p214, p215)", () => {
      const next = typed(
        createHarness({
          entities: [
            lineOf(p(0, 0), p(100, 0), { id: "A" }),
            lineOf(p(100, -50), p(100, 50)),
            lineOf(p(150, -50), p(150, 50)),
          ],
        }),
        "EXTEND",
        "90,0"
      )
      expect(next.byId<LineEntity>("A").end).toBeCloseToPoint(p(150, 0))
      const only = typed(
        createHarness({
          entities: [
            lineOf(p(0, 0), p(100, 0), { id: "A" }),
            lineOf(p(100, -50), p(100, 50)),
          ],
        }),
        "EXTEND",
        "90,0"
      )
      expect(said(only)).toBe("Path does not intersect with the bounding edge.")
    })

    it("deletes a line an edge meets at its end only, and cuts once at two edges through one point (probes trim/p216, p217)", () => {
      const end = typed(
        createHarness({
          entities: [
            lineOf(p(0, 0), p(100, 0), { id: "A" }),
            lineOf(p(100, -50), p(100, 50)),
          ],
        }),
        "TRIM",
        "50,0"
      )
      expect(end.entities().map((e) => e.id)).not.toContain("A")
      const two = typed(
        createHarness({
          entities: [
            lineOf(p(0, 0), p(100, 0), { id: "A" }),
            lineOf(p(50, -50), p(50, 50)),
            lineOf(p(25, -50), p(75, 50)),
          ],
        }),
        "TRIM",
        "75,0"
      )
      expect(two.entities()).toHaveLength(3)
      expect(ends(two.byId<LineEntity>("A"))).toBeCloseToPoints([
        p(0, 0),
        p(50, 0),
      ])
    })

    it("cuts a line at a circle's tangent point and grows one to it (probes trim/p218, p219)", () => {
      const cut = typed(
        createHarness({
          entities: [
            lineOf(p(-100, 50), p(100, 50), { id: "A" }),
            circleOf(p(0, 0), 50),
          ],
        }),
        "TRIM",
        "50,50"
      )
      expect(ends(cut.byId<LineEntity>("A"))).toBeCloseToPoints([
        p(-100, 50),
        p(0, 50),
      ])
      const grown = typed(
        createHarness({
          entities: [
            lineOf(p(-100, 50), p(-60, 50), { id: "A" }),
            circleOf(p(0, 0), 50),
          ],
        }),
        "EXTEND",
        "-65,50"
      )
      expect(grown.byId<LineEntity>("A").end).toBeCloseToPoint(p(0, 50))
    })
  })

  it("puts the object back whole, its id, at Undo and at U after the command (probes trim/p227, p228)", () => {
    const drawing = () => [
      lineOf(p(0, 0), p(100, 0), { id: "A" }),
      lineOf(p(30, -50), p(30, 50), { id: "V1" }),
      lineOf(p(70, -50), p(70, 50), { id: "V2" }),
    ]
    const inside = typed(
      createHarness({ entities: drawing() }),
      "TRIM",
      "50,0",
      "_U"
    )
    expect(inside.entities()).toEqual(drawing())
    const after = typed(
      createHarness({ entities: drawing() }),
      "TRIM",
      "50,0",
      "",
      "U"
    )
    expect(after.entities()).toEqual(drawing())
  })

  it("saves and opens what it trimmed as it was", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(200, 0), p(300, 0)], {
          id: "P",
          bulges: [0, 0.5, 0],
          widths: [
            [0, 2],
            [2, 4],
            [4, 6],
          ],
        }),
        lineOf(p(130, -50), p(130, 50)),
        lineOf(p(170, -50), p(170, 50)),
        ellipseOf(p(0, 200), p(100, 0), 0.5, { id: "E" }),
        lineOf(p(0, 100), p(0, 300)),
        withElevation(circleOf(p(300, 200), 50, { id: "C" }), 7),
        lineOf(p(300, 100), p(300, 300)),
      ],
    })
    typed(cad, "TRIM", "150,-25", "-100,200", "250,200", "")
    expect(cad.entities().map((e) => e.type)).toEqual([
      "polyline",
      "line",
      "line",
      "ellipse",
      "line",
      "arc",
      "line",
      "polyline",
    ])
    expect(parseDrawingFile(cad.runtime.serializeDrawing()).entities).toEqual(
      cad.entities()
    )
  })
})

describe("TRIM and EXTEND's look", () => {
  const RED = "#ff0000"
  // The desktop drawing of trim/d01–d07, at 10×.
  const drawing = (...more: Entity[]) =>
    createHarness({
      entities: [
        { ...lineOf(p(100, 250), p(900, 250), { id: "H" }), color: RED },
        lineOf(p(300, 50), p(300, 450), { id: "V1" }),
        lineOf(p(600, 50), p(600, 450), { id: "V2" }),
        { ...lineOf(p(400, 380), p(500, 380), { id: "S" }), color: RED },
        ...more,
      ],
    })
  /** The strokes of the segments drawn between `a` and `b`, either way round. */
  function strokesAt(cad: CadHarness, a: Vec2, b: Vec2) {
    const near = (q: Vec2, r: Vec2) => Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
    const [sa, sb] = [cad.toScreen(a), cad.toScreen(b)]
    return cad
      .scene()
      .primitives.flatMap((prim) =>
        prim.kind === "segment" &&
        ((near(prim.a, sa) && near(prim.b, sb)) ||
          (near(prim.a, sb) && near(prim.b, sa)))
          ? [prim.stroke]
          : []
      )
  }
  /** The ✕'s strokes and the circle-and-slash's rings. */
  const badges = (cad: CadHarness) => {
    const { primitives } = cad.scene()
    return {
      trim: primitives.filter(
        (prim) =>
          prim.kind === "segment" && prim.stroke.color === THEME.trimBadge
      ).length,
      refused: primitives.filter(
        (prim) =>
          prim.kind === "circle" && prim.stroke?.color === THEME.refusedBadge
      ).length,
    }
  }
  const plain = { color: RED, width: 1.25 }
  const faded = { color: fadedColor(RED), width: 1.25 }
  const glow = { color: THEME.selected, width: 5.25 }
  const looks = (cad: CadHarness) =>
    cad
      .scene()
      .primitives.flatMap((prim) =>
        "stroke" in prim && prim.stroke ? [prim.stroke.color] : []
      )

  it("draws the piece a click trims faded in place, solid and thin, the rest as it is, and the ✕ (desktop trim/d01-1)", () => {
    const cad = drawing().command("TRIM").moveTo(p(450, 251))

    expect(strokesAt(cad, p(300, 250), p(600, 250))).toEqual([faded])
    expect(strokesAt(cad, p(100, 250), p(300, 250))).toEqual([plain])
    expect(strokesAt(cad, p(600, 250), p(900, 250))).toEqual([plain])
    expect(strokesAt(cad, p(100, 250), p(900, 250))).toEqual([])
    expect(looks(cad)).not.toContain(THEME.entityHover)
    expect(looks(cad)).not.toContain(THEME.gripHot)
    expect(badges(cad)).toEqual({ trim: 2, refused: 0 })
  })

  it("fades a line no edge crosses whole, Quick's delete, with the ✕ (desktop trim/d01-2)", () => {
    const cad = drawing().command("TRIM").moveTo(p(480, 381))

    expect(strokesAt(cad, p(400, 380), p(500, 380))).toEqual([faded])
    expect(badges(cad)).toEqual({ trim: 2, refused: 0 })
  })

  it("draws the extension as the object would be, whole, solid, in the selection's glow, with no badge (desktop trim/d01-3, d02-1)", () => {
    for (const cad of [
      drawing().command("TRIM").moveTo(p(480, 381), { shiftKey: true }),
      drawing().command("EXTEND").moveTo(p(480, 381)),
    ]) {
      expect(strokesAt(cad, p(400, 380), p(600, 380))).toEqual([plain, glow])
      expect(strokesAt(cad, p(400, 380), p(500, 380))).toEqual([])
      expect(badges(cad)).toEqual({ trim: 0, refused: 0 })
    }
  })

  it("shows TRIM's faded ghost and the ✕ under Shift in EXTEND (desktop trim/d02-2)", () => {
    const cad = drawing().command("EXTEND").moveTo(p(450, 251), {
      shiftKey: true,
    })

    expect(strokesAt(cad, p(300, 250), p(600, 250))).toEqual([faded])
    expect(badges(cad)).toEqual({ trim: 2, refused: 0 })
  })

  it("previews what a running fence trims, the drawing untouched, and trims it so (desktop trim/d03-1, d04-1)", () => {
    const cad = drawing().command("TRIM").click(p(700, 400)).moveTo(p(701, 120))

    expect(strokesAt(cad, p(600, 250), p(900, 250))).toEqual([faded])
    expect(strokesAt(cad, p(100, 250), p(600, 250))).toEqual([plain])
    expect(cad.byId("H")).toMatchObject({ end: p(900, 250) })
    expect(badges(cad)).toEqual({ trim: 2, refused: 0 })

    cad.click(p(701, 120))
    expect(cad.byId("H")).toMatchObject({
      start: p(100, 250),
      end: p(600, 250),
    })
  })

  it("previews Fence's path through its points and the cursor, Undo dropping one", () => {
    const cad = drawing()
      .command("TRIM")
      .option("Fence")
      .click(p(700, 400))
      .moveTo(p(701, 120))

    expect(strokesAt(cad, p(600, 250), p(900, 250))).toEqual([faded])
    cad.option("Undo")
    expect(strokesAt(cad, p(600, 250), p(900, 250))).toEqual([])
    expect(strokesAt(cad, p(100, 250), p(900, 250))).toEqual([plain])
  })

  it("previews EXTEND's fence as the objects would be, glowing, with no badge", () => {
    const cad = drawing()
      .command("EXTEND")
      .click(p(480, 420))
      .moveTo(p(480, 330))

    expect(strokesAt(cad, p(400, 380), p(600, 380))).toEqual([plain, glow])
    expect(badges(cad)).toEqual({ trim: 0, refused: 0 })
  })

  it("previews each piece a fence takes away, Quick's delete whole, as its cursor moves", () => {
    const cad = drawing().command("TRIM").click(p(450, 420)).moveTo(p(450, 100))

    // Through S, deleted whole, and through H between the edges.
    expect(strokesAt(cad, p(400, 380), p(500, 380))).toEqual([faded])
    expect(strokesAt(cad, p(300, 250), p(600, 250))).toEqual([faded])
    expect(strokesAt(cad, p(100, 250), p(300, 250))).toEqual([plain])
    cad.moveTo(p(450, 300))
    expect(strokesAt(cad, p(300, 250), p(600, 250))).toEqual([])
    expect(strokesAt(cad, p(100, 250), p(900, 250))).toEqual([plain])
  })

  it("previews what a running Crossing window trims (desktop trim/d06-2)", () => {
    const cad = drawing().command("TRIM").option("Crossing").click(p(650, 300))
    cad.moveTo(p(750, 200))

    expect(strokesAt(cad, p(600, 250), p(900, 250))).toEqual([faded])
    expect(cad.byId("H")).toMatchObject({ end: p(900, 250) })
    expect(badges(cad)).toEqual({ trim: 2, refused: 0 })
  })

  it("shows the circle-and-slash where EXTEND refuses, as TRIM's refusals (unverified)", () => {
    const cad = drawing().command("EXTEND").moveTo(p(301, 440))

    expect(badges(cad)).toEqual({ trim: 0, refused: 1 })
    cad.click(p(301, 440))
    expect(cad.commandLog().at(-1)).toBe(
      "Path does not intersect with the bounding edge."
    )
  })

  it("shows the circle-and-slash where the pick is refused: a circle cut once, a text (desktop trim/d09-1, d09-2)", () => {
    const circle = createHarness({
      entities: [
        circleOf(p(450, 150), 50, { id: "C" }),
        lineOf(p(450, 150), p(600, 150), { id: "L" }),
      ],
    })
    circle.command("TRIM").moveTo(p(400, 150))
    expect(badges(circle)).toEqual({ trim: 0, refused: 1 })

    const text = createHarness({
      entities: [
        createText(p(0, 0), "HOLA", { height: 10 }),
        lineOf(p(50, -50), p(50, 50)),
      ],
    })
    text.command("TRIM").moveTo(p(3, 3))
    expect(badges(text)).toEqual({ trim: 0, refused: 1 })
    text.moveTo(p(200, 200))
    expect(badges(text)).toEqual({ trim: 0, refused: 0 })
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
    // FILLETRAD is the drawing's (rectang/p316); re-picking the command
    // should not silently reset it to zero.
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
      const right = fillet([line(), circle()], "5", p(90, 0), p(20, 20))
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

// AutoCAD 2027's console answering the same input (probes corners/p100–p169):
// its drawing B, two lines meeting at 100,0.
describe("FILLET's and CHAMFER's command line", () => {
  const B = (): Entity[] => [
    lineOf(p(0, 0), p(80, 0), { id: "L1" }),
    lineOf(p(100, 20), p(100, 100), { id: "L2" }),
  ]
  const B2 = (): Entity[] => [
    ...B(),
    lineOf(p(200, 0), p(280, 0), { id: "L3" }),
    lineOf(p(300, 20), p(300, 100), { id: "L4" }),
  ]
  const FIRST = "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
  const RADIUS = "FILLET Specify fillet radius <0.00>:"

  /** Typed at the command line and confirmed, as the console reads it. */
  function answer(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  function run(entities: Entity[], ...texts: string[]): CadHarness {
    return answer(createHarness({ entities }), ...texts)
  }
  function inSpanish(entities: Entity[], ...texts: string[]): CadHarness {
    return answer(createHarness({ entities, locale: es }), ...texts)
  }
  const ends = (cad: CadHarness, id: string) => {
    const { start, end } = cad.byId<LineEntity>(id)
    return [start, end]
  }

  it("refuses a negative radius in the console's words and asks it again; 0 is taken (p116)", () => {
    const cad = run(B(), "_FILLET", "_R", "FOO", "-5")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify fillet radius <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify fillet radius <0.00>: -5",
      "Value must be positive.",
    ])
    expect(cad.state().commandLine.prompt).toBe(RADIUS)
    const zero = run(B(), "_FILLET", "_R", "5", "_R", "0")
    expect(zero.state().commandLine.prompt).toBe(FIRST)
    expect(zero.runtime.document.getSettings().filletRadius).toBe(0)

    const spanish = inSpanish(B(), "_FILLET", "_R", "-5")
    expect(spanish.commandLog().at(-1)).toBe("El valor debe ser positivo.")
  })

  it("refuses a negative chamfer distance at either prompt; 0 is taken (p119)", () => {
    const cad = run(B(), "_CHAMFER", "_D", "FOO", "-5")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify first chamfer distance <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify first chamfer distance <0.00>: -5",
      "Value must be positive.",
    ])
    answer(cad, "0", "FOO", "-5")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Specify first chamfer distance <0.00>: 0",
      "Specify second chamfer distance <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify second chamfer distance <0.00>: -5",
      "Value must be positive.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Specify second chamfer distance <0.00>:"
    )
    answer(cad, "0,0", "10,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second chamfer distance <0.00>: 0,0",
      " Specify second point: 10,0",
    ])
    expect(cad.runtime.document.getSettings()).toMatchObject({
      chamferDistance1: 0,
      chamferDistance2: 10,
    })
  })

  it("defaults the second distance to the first typed, else to CHAMFERB (p110, p111, p137)", () => {
    const cad = run(B(), "_CHAMFER", "_D", "10", "5", "_D", "")
    expect(cad.state().commandLine.prompt).toBe(
      "CHAMFER Specify second chamfer distance <5.00>:"
    )
    answer(cad, "")
    expect(cad.runtime.document.getSettings()).toMatchObject({
      chamferDistance1: 10,
      chamferDistance2: 5,
    })
    const again = run(B(), "_CHAMFER", "_D", "10", "5", "_D", "7")
    expect(again.state().commandLine.prompt).toBe(
      "CHAMFER Specify second chamfer distance <7.00>:"
    )
  })

  it("takes back a transparent 'LTSCALE with the fillet or chamfer before it (p156)", () => {
    for (const name of ["_FILLET", "_CHAMFER"]) {
      const cad = run(B(), name, "_M", "40,0", "100,60", "'_LTSCALE", "2")
      answer(cad, "_U")
      expect(ends(cad, "L1")).toBeCloseToPoints([p(0, 0), p(80, 0)])
      expect(ends(cad, "L2")).toBeCloseToPoints([p(100, 20), p(100, 100)])
      expect(cad.runtime.document.getSettings().ltScale).toBe(1)
      expect(cad.commandLog().slice(-2)).toEqual([
        "Command has been completely undone.",
        "Regenerating model.",
      ])
    }
  })

  it("reads Spanish R at EMPALME's first prompt as Recortar, refused here, and RA as RAdio (p165, p168)", () => {
    const cad = inSpanish(B(), "EMPALME", "R")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Designación no válida*",
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Deshacer/Polilínea/RAdio",
    ])
    answer(cad, "RA")
    expect(cad.state().commandLine.prompt).toBe(
      "EMPALME Precise radio de empalme <0.00>:"
    )
    const english = run(B(), "_FILLET", "T")
    expect(english.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])
    expect(english.state().commandLine.prompt).toBe(FIRST)
  })

  it("says Undo with nothing to take back has undone it all, and goes on (p148, p149, p165)", () => {
    for (const name of ["_FILLET", "_CHAMFER"]) {
      const cad = run(B(), name, "_U", "_U")
      expect(cad.commandLog().slice(-4)).toEqual([
        expect.stringMatching(/: _U$/),
        "Command has been completely undone.",
        expect.stringMatching(/: _U$/),
        "Command has been completely undone.",
      ])
      answer(cad, "40,0", "100,60")
      expect(ends(cad, "L1")).toBeCloseToPoints([p(0, 0), p(100, 0)])
    }
    for (const [name, undo] of [
      ["EMPALME", "D"],
      ["CHAFLAN", "H"],
    ]) {
      expect(inSpanish(B(), name, undo).commandLog().at(-1)).toBe(
        "Todos los efectos del comando han sido deshechos."
      )
    }
  })

  it("counts no refusal, miss or Multiple as a step (p152)", () => {
    const cad = run(B(), "_FILLET", "FOO", "_U", "50,50", "_U", "_M", "_U")
    const undone = "Command has been completely undone."
    expect(cad.commandLog().filter((line) => line === undone)).toHaveLength(3)
    answer(cad, "40,0", "100,60")
    expect(cad.activeToolId()).toBe("fillet")
  })

  it("takes back a radius or the distances given in the command (p150, p154)", () => {
    const cad = run(B(), "_FILLET", "_R", "5", "_U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.runtime.document.getSettings().filletRadius).toBe(0)
    answer(cad, "_R")
    expect(cad.state().commandLine.prompt).toBe(RADIUS)

    const chamfer = run(B(), "_CHAMFER", "_D", "10", "5", "_U")
    expect(chamfer.commandLog().at(-1)).toBe(
      "Command has been completely undone."
    )
    expect(chamfer.runtime.document.getSettings()).toMatchObject({
      chamferDistance1: 0,
      chamferDistance2: 0,
    })
  })

  it("takes back a Polyline run in Multiple, then the radius before it (p153)", () => {
    const cad = run(
      [
        polylineOf([p(0, 200), p(100, 200), p(100, 260), p(0, 260)], {
          id: "PL",
          closed: true,
        }),
      ],
      "_FILLET",
      "_R",
      "5",
      "_M",
      "_P",
      "50,200"
    )
    expect(cad.commandLog().at(-1)).toBe("4 lines were filleted")
    expect(cad.byId<PolylineEntity>("PL").vertices).toHaveLength(8)
    answer(cad, "_U")
    expect(cad.byId<PolylineEntity>("PL").vertices).toHaveLength(4)
    expect(cad.commandLog().at(-1)).toMatch(/: _U$/)
    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
  })

  it("counts Enter at the radius as a step of its own (p169)", () => {
    const cad = run(B2(), "_FILLET", "_M", "_R", "5", "40,0", "100,60")
    answer(cad, "_R", "2", "240,0", "300,60", "_U")
    answer(cad, "_R", "", "_U", "_R", "", "_U", "_R", "", "_U", "_U", "")
    expect(cad.runtime.document.getSettings().filletRadius).toBe(5)
    expect(ends(cad, "L1")).toBeCloseToPoints([p(0, 0), p(95, 0)])
    expect(ends(cad, "L3")).toBeCloseToPoints([p(200, 0), p(280, 0)])
    expect(cad.commandLog()).not.toContain(
      "Command has been completely undone."
    )
  })

  it("picks at a number's distance from LASTPOINT at the object prompts, a negative too (p120)", () => {
    const cad = run(
      [lineOf(p(0, 0), p(80, 0), { id: "L1" })],
      "_LINE",
      "100,20",
      "100,100",
      "",
      "_FILLET",
      "0"
    )
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    const l2 = cad.entities().find((entity) => entity.id !== "L1")!.id
    // A negative one picks on nothing there: asked again, nothing said.
    answer(cad, "-5")
    expect(cad.commandLog().at(-1)).toBe(
      "Select second object or shift-select to apply corner or [Radius]: -5"
    )
    answer(cad, "40,0")
    expect(ends(cad, "L1")).toBeCloseToPoints([p(0, 0), p(100, 0)])
    expect(ends(cad, l2)).toBeCloseToPoints([p(100, 0), p(100, 100)])
  })

  it("repeats on an empty line, the name echoed, and is no transparent command (p105, p106)", () => {
    for (const [name, echoed] of [
      ["_FILLET", "FILLET"],
      ["_CHAMFER", "CHAMFER"],
    ]) {
      const cad = run(B2(), name, "40,0", "100,60", "")
      expect(cad.commandLog().at(-2)).toBe(echoed)
      answer(cad, "240,0", "300,60")
      expect(ends(cad, "L3")).toBeCloseToPoints([p(200, 0), p(300, 0)])

      const line = run(B(), "_LINE", "0,150", `'${name}`)
      expect(line.commandLog().slice(-2)).toEqual([
        "** That command may not be invoked transparently **",
        "Point or option keyword required.",
      ])
      expect(line.activeToolId()).toBe("line")
    }
  })

  it("refuses a command or a transparent 'LINE typed at an object prompt as a selection (p138, p139, p144, p147)", () => {
    const cad = run(B(), "_FILLET", "_LINE")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])
    expect(cad.activeToolId()).toBe("fillet")
    answer(cad, "40,0", "'_LINE")
    expect(cad.commandLog().slice(-3)).toEqual([
      "** That command may not be invoked transparently **",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
    ])

    const chamfer = run(B(), "_CHAMFER", "40,0", "_LINE")
    expect(chamfer.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Distance",
    ])
    answer(chamfer, "100,60")
    expect(ends(chamfer, "L1")).toBeCloseToPoints([p(0, 0), p(100, 0)])
  })

  it("resumes its prompt after 'ZOOM, '-PAN and '-OSNAP (p140, p141, p143, p145, p146)", () => {
    const cad = run(B(), "_FILLET", "_R", "'_-PAN", "0,0", "0,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      ">> Specify second point: 0,0",
      "Resuming FILLET command.",
    ])
    expect(cad.state().commandLine.prompt).toBe(RADIUS)
    const osnap = run(B(), "_FILLET", "'_-OSNAP", "_END", "40,0")
    answer(osnap, "'_-OSNAP", "_NONE", "100,60")
    expect(osnap.commandLog()).toContain("Resuming FILLET command.")
    expect(ends(osnap, "L1")).toBeCloseToPoints([p(0, 0), p(100, 0)])
    const chamfer = run(B(), "_CHAMFER", "_D", "10", "'_ZOOM", "_E")
    expect(chamfer.commandLog().at(-1)).toBe("Resuming CHAMFER command.")
    expect(chamfer.state().commandLine.prompt).toBe(
      "CHAMFER Specify second chamfer distance <10.00>:"
    )
  })

  it("drops a preselection and leaves nothing selected (p162–p164)", () => {
    for (const name of ["_FILLET", "_CHAMFER"]) {
      const cad = createHarness({ entities: B() })
      cad.select("L1", "L2")
      answer(cad, name)
      expect(cad.selectedIds()).toEqual([])
      expect(cad.state().commandLine.prompt).toMatch(
        /Select first (object|line) or/
      )
      answer(cad, "40,0", "100,60")
      expect(cad.selectedIds()).toEqual([])
      expect(ends(cad, "L1")).toBeCloseToPoints([p(0, 0), p(100, 0)])
    }
  })

  it("is one step of U, REDO, UNDO and MREDO, named as echoed (p157, p158, p161)", () => {
    const cad = run(B2(), "_FILLET", "40,0", "100,60")
    answer(cad, "_CHAMFER", "240,0", "300,60", "_U", "_REDO")
    answer(cad, "_UNDO", "2", "_MREDO", "2")
    expect(cad.commandLog().slice(-13)).toEqual([
      "U",
      "CHAMFER",
      "REDO",
      "CHAMFER",
      "Everything has been redone",
      "UNDO",
      "Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes",
      "Enter the number of operations to undo or [Auto/Control/BEgin/End/Mark/Back] <1>: 2",
      "CHAMFER FILLET",
      "MREDO",
      "Enter number of actions or [All/Last]: 2",
      "FILLET CHAMFER",
      "Everything has been redone",
    ])

    const multiple = run(B2(), "_FILLET", "_M", "40,0", "100,60", "_U")
    answer(multiple, "240,0", "300,60", "", "_U")
    expect(ends(multiple, "L1")).toBeCloseToPoints([p(0, 0), p(80, 0)])
    expect(ends(multiple, "L3")).toBeCloseToPoints([p(200, 0), p(280, 0)])
  })

  it("is a step of U though the run changed nothing (p159, p160)", () => {
    for (const texts of [
      ["_FILLET", ""],
      ["_FILLET", "FOO", ""],
      ["_CHAMFER", ""],
    ]) {
      const cad = run(B(), ...texts, "_U")
      expect(cad.commandLog().slice(-2)).toEqual(["U", texts[0].slice(1)])
    }
    const radius = run(B(), "_FILLET", "_R", "5", "", "_U")
    expect(radius.commandLog().slice(-2)).toEqual(["U", "FILLET"])
    expect(radius.runtime.document.getSettings().filletRadius).toBe(0)
  })
})

describe("OFFSET", () => {
  /** The console's line (offset/p100–p298). */
  const L1 = () => lineOf(p(0, 0), p(100, 0), { id: "L1" })
  const SELECT = "Select object to offset or [Exit/Undo] <Exit>:"

  function answer(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const copyOf = (cad: CadHarness) =>
    linesOf(cad.entities()).find((line) => !/^L\d$/.test(line.id))
  function lastPoint(cad: CadHarness): string {
    answer(cad, "ID", "@")
    return cad.commandLog().at(-1)!.trim()
  }

  it("keeps the source's colour, plane and thickness", () => {
    // probes offset/p171, p218.
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
    // probe offset/p170.
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
    // probe offset/p177.
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
    // probe offset/p172.
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
    // probe offset/p178.
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

  it("will not offset an ellipse or a spline, and does not even highlight one", () => {
    // AutoCAD offsets them into a spline (probes offset/p196–p198), which is
    // not built: neither is picked, in silence (OFFSET-D11).
    const spline = createSpline("fit", [p(0, 50), p(50, 80), p(100, 50)], {
      id: "S1",
    })
    const cad = createHarness({
      entities: [ellipseOf(p(0, 0), p(100, 0), 0.5, { id: "E1" }), spline],
    })
    const lit = () =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            "stroke" in primitive &&
            (primitive.stroke?.color === THEME.selected ||
              primitive.stroke?.color === THEME.entityHover)
        )

    cad.command("OFFSET").type("20").enter()
    for (const at of [p(100, 0), p(0, 50)]) {
      cad.moveTo(at)
      expect(lit()).toHaveLength(0)
      cad.click(at)
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    }
    cad.click(p(200, 0)).escape()
    expect(cad.entityCount).toBe(2)
    expect(cad.commandLog()).not.toContain("Cannot offset that object.")
  })

  describe("its look", () => {
    /** The strokes of the segments drawn from `a` to `b` on the screen. */
    function segmentsAt(cad: CadHarness, a: Vec2, b: Vec2) {
      const near = (q: Vec2, r: Vec2) => Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
      const [sa, sb] = [cad.toScreen(a), cad.toScreen(b)]
      return cad
        .scene()
        .primitives.flatMap((prim) =>
          prim.kind === "segment" && near(prim.a, sa) && near(prim.b, sb)
            ? [prim.stroke]
            : []
        )
    }
    const red = () =>
      createHarness({
        entities: [
          { ...lineOf(p(-100, 0), p(100, 0), { id: "L1" }), color: "#ff0000" },
        ],
      })
    const source = (cad: CadHarness) =>
      segmentsAt(cad, p(-100, 0), p(100, 0)).map((stroke) => stroke.color)

    it("rolls over the object at Select object to offset with the plain glow", () => {
      // desktop offset/d01-4 (OFFSET-D30).
      const cad = red()
      cad.command("OFFSET").type("20").enter().moveTo(p(0, 0))

      expect(segmentsAt(cad, p(-100, 0), p(100, 0))).toContainEqual({
        color: THEME.entityHover,
        width: 2,
      })
      expect(source(cad)).not.toContain(THEME.selected)
    })

    it("drags the copy as the object, in its colour, the source selected", () => {
      // desktop offset/d01-5: the side's copy; d02-1: Through's.
      const cad = red()
      cad.command("OFFSET").type("20").enter().click(p(0, 0)).moveTo(p(0, 50))

      expect(segmentsAt(cad, p(-100, 20), p(100, 20))).toEqual([
        { color: "#ff0000", width: 1 },
      ])
      expect(source(cad)).toContain(THEME.selected)

      cad.escape().escape().command("OFFSET").option("Through")
      cad.click(p(0, 0)).moveTo(p(0, -40))
      expect(segmentsAt(cad, p(-100, -40), p(100, -40))).toEqual([
        { color: "#ff0000", width: 1 },
      ])
      expect(source(cad)).toContain(THEME.selected)
    })
  })

  it("Through places the copy on a picked point", () => {
    // probe offset/p208.
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
    // probe offset/p213.
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
    // probe offset/p159.
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
    // probes offset/p100, p106 (the last distance at the next OFFSET).
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
    // probes offset/p119, p122.
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

  it("Undo in Multiple takes back the last copy and asks for the object", () => {
    // probe offset/p157: two copies in Multiple, then three `_U`.
    const cad = answer(
      createHarness({ entities: [L1()] }),
      "OFFSET",
      "10",
      "50,0",
      "_M",
      "50,50",
      "50,50",
      "_U"
    )
    expect(cad.entityCount).toBe(2)
    expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    answer(cad, "_U")
    expect(cad.entityCount).toBe(1)
    answer(cad, "_U")
    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog().slice(-9)).toEqual([
      "Specify offset distance or [Through/Erase/Layer] <Through>: 10",
      `${SELECT} 50,0`,
      "Specify point on side to offset or [Exit/Multiple/Undo] <Exit>: _M",
      "Specify point on side to offset or [Exit/Undo] <next object>: 50,50",
      "Specify point on side to offset or [Exit/Undo] <next object>: 50,50",
      "Specify point on side to offset or [Exit/Undo] <next object>: _U",
      `${SELECT} _U`,
      `${SELECT} _U`,
      "Command has been completely undone.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
  })

  it("asks Through's point, and Multiple through further points", () => {
    // probes offset/p112 (Enter at <Through>), p137.
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
    // probe offset/p139.
    const cad = createHarness({
      entities: [lineOf(p(-80, 0), p(80, 0), { id: "L1" })],
    })

    cad.command("OFFSET").click(p(0, 100))
    expect(cad.state().commandLine.prompt).toBe("OFFSET Specify second point:")
    cad.click(p(30, 140)).click(p(0, 0)).click(p(0, 10)).enter()

    const copy = linesOf(cad.entities()).find((line) => line.id !== "L1")!
    expect(copy.start.y).toBeCloseTo(50)
  })

  describe("its picks and points", () => {
    const C1 = () => circleOf(p(200, 100), 30, { id: "C1" })
    /** The console's drawing: the line, two more, the circle (offset/p263). */
    const drawing = () => [
      L1(),
      lineOf(p(110, 1), p(110, 5), { id: "L2" }),
      lineOf(p(60, 30), p(100, -10), { id: "L3" }),
      C1(),
    ]

    it("picks the object at a point typed, and on nothing asks again in silence", () => {
      // probes offset/p240, p241: `50,30` asks again, LASTPOINT 50,30; `50,0`
      // picks the line and goes on to its side.
      const cad = answer(createHarness({ entities: [L1()] }), "OFFSET", "10")
      answer(cad, "50,30")
      expect(cad.commandLog().slice(-2)).toEqual([
        "Specify offset distance or [Through/Erase/Layer] <Through>: 10",
        `${SELECT} 50,30`,
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      answer(cad, "50,0")
      expect(cad.state().commandLine.prompt).toBe(
        "OFFSET Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:"
      )
      cad.escape()
      expect(lastPoint(cad)).toBe("X = 50.00     Y = 0.00     Z = 0.00")
    })

    it("picks with `@` from LASTPOINT", () => {
      // probe offset/p298: `@50,-50` after `ID 0,50` picks the line at 50,0.
      const cad = createHarness({ entities: [L1()] })
      answer(cad, "ID", "0,50", "OFFSET", "10", "@50,-50", "50,50", "")
      expect(copyOf(cad)?.start.y).toBeCloseTo(10)
    })

    it("puts LASTPOINT at the object's pick, hit or miss", () => {
      // probes offset/p240, p241 (typed; a click is taken alike, OFFSET-D23).
      const cad = createHarness({ entities: [L1()] })
      answer(cad, "ID", "0,50", "OFFSET", "10")
      cad.click(p(50, 30))
      cad.escape()
      expect(lastPoint(cad)).toBe("X = 50.00     Y = 30.00     Z = 0.00")
      answer(cad, "OFFSET", "10")
      cad.click(p(50, 0)).enter()
      expect(lastPoint(cad)).toBe("X = 50.00     Y = 0.00     Z = 0.00")
    })

    it("takes a side point typed, absolute or from the pick", () => {
      // probe offset/p253: `30,20` puts the copy at y=10.
      const cad = createHarness({ entities: [L1()] })
      answer(cad, "OFFSET", "10")
      cad.click(p(50, 0))
      answer(cad, "30,20")
      expect(copyOf(cad)?.start.y).toBeCloseTo(10)
      // probe offset/p255: `@0,-20` is from the object's pick, 50,0, and
      // LASTPOINT is the side point.
      const below = createHarness({ entities: [L1()] })
      answer(below, "ID", "0,50", "OFFSET", "10")
      below.click(p(50, 0))
      answer(below, "@0,-20", "")
      expect(copyOf(below)?.start.y).toBeCloseTo(-10)
      expect(lastPoint(below)).toBe("X = 50.00     Y = -20.00     Z = 0.00")
    })

    it("takes a through point typed: absolute, from the pick, polar", () => {
      // probe offset/p270: `30,20` → y=20.
      const cad = answer(createHarness({ entities: [L1()] }), "OFFSET", "T")
      cad.click(p(50, 0))
      answer(cad, "30,20", "")
      expect(copyOf(cad)?.start.y).toBeCloseTo(20)
      // probe offset/p272: `@0,-20` after `ID 0,50` is from the pick → y=-20.
      const from = createHarness({ entities: [L1()] })
      answer(from, "ID", "0,50", "OFFSET", "T")
      from.click(p(50, 0))
      answer(from, "@0,-20", "")
      expect(copyOf(from)?.start.y).toBeCloseTo(-20)
      // probe offset/p274: `20<90` → y=20.
      const polar = answer(createHarness({ entities: [L1()] }), "OFFSET", "T")
      polar.click(p(50, 0))
      answer(polar, "20<90", "")
      expect(copyOf(polar)?.start.y).toBeCloseTo(20)
    })

    it("shows X and Y at the side and through points", () => {
      // desktop offset/d01-5, d02-1: the cursor's X and Y in the tooltip.
      const cad = createHarness({ entities: [L1()] })
      cad.command("OFFSET").type("10").enter().click(p(50, 0))
      const kinds = () =>
        cad.state().dynamicInput?.fields.map((field) => field.kind)
      expect(kinds()).toEqual(["coordinate"])
      cad.escape().command("OFFSET").option("Through").click(p(50, 0))
      expect(kinds()).toEqual(["coordinate"])
    })

    it("refuses an object on a locked layer in words", () => {
      // probe offset/p250: `The object is on a locked layer.`, then the
      // prompt again and no copy.
      const cad = createHarness()
      const locked = cad.runtime.createLayer("LK")
      cad.runtime.document.load([
        lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: locked }),
      ])
      cad.runtime.updateLayer(locked, { locked: true })
      answer(cad, "OFFSET", "10")
      cad.click(p(50, 0))
      expect(cad.commandLog().slice(-2)).toEqual([
        SELECT,
        "The object is on a locked layer.",
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      answer(cad, "50,0")
      expect(cad.commandLog().slice(-2)).toEqual([
        `${SELECT} 50,0`,
        "The object is on a locked layer.",
      ])
      answer(cad, "")
      expect(cad.entityCount).toBe(1)
    })

    it("refuses a through point on the object, and asks for the next object", () => {
      // probe offset/p277: `30,0` on the line; LASTPOINT 30,0.
      const cad = answer(createHarness({ entities: [L1()] }), "OFFSET", "T")
      cad.click(p(50, 0))
      answer(cad, "30,0")
      expect(cad.commandLog().slice(-2)).toEqual([
        "Specify through point or [Exit/Multiple/Undo] <Exit>: 30,0",
        "Invalid through point.",
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      cad.escape()
      expect(lastPoint(cad)).toBe("X = 30.00     Y = 0.00     Z = 0.00")
      // probes offset/p273, p278: `@` (the pick) and the line's extension.
      for (const at of ["@", "150,0"]) {
        const again = answer(createHarness({ entities: [L1()] }), "OFFSET", "T")
        again.click(p(50, 0))
        answer(again, at)
        expect(again.commandLog().at(-1)).toBe("Invalid through point.")
        expect(again.entityCount).toBe(1)
      }
    })

    it("refuses a through point on a circle's rim, and at its centre cannot offset", () => {
      // probe offset/p296: on the rim, `Invalid through point.`, no copy.
      const rim = answer(createHarness({ entities: [C1()] }), "OFFSET", "T")
      rim.click(p(230, 100)).click(p(200, 130))
      expect(rim.commandLog().at(-1)).toBe("Invalid through point.")
      expect(rim.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      expect(rim.entityCount).toBe(1)
      // probe offset/p295: at the centre, `Cannot offset that object.`.
      const centre = answer(createHarness({ entities: [C1()] }), "OFFSET", "T")
      centre.click(p(230, 100)).click(p(200, 100))
      expect(centre.commandLog().at(-1)).toBe("Cannot offset that object.")
      // Still in Through: the next object goes on to its through point.
      centre.click(p(230, 100))
      expect(centre.state().commandLine.prompt).toBe(
        "OFFSET Specify through point or [Exit/Multiple/Undo] <Exit>:"
      )
    })

    it("snaps the side point", () => {
      // probe offset/p263: `_END of 110,-1` is 110,1, so the copy goes up
      // though the raw point is below; LASTPOINT 110,1.
      const cad = answer(createHarness({ entities: drawing() }), "OFFSET", "10")
      cad.click(p(50, 0))
      answer(cad, "_END", "110,-1", "")
      expect(copyOf(cad)?.start.y).toBeCloseTo(10)
      expect(lastPoint(cad)).toBe("X = 110.00     Y = 1.00     Z = 0.00")
    })

    it("measures Perpendicular at the through point from the pick", () => {
      // probe offset/p285: `_PER to 99,-9` finds 70,20 on the slanted line,
      // perpendicular from the pick at 50,0.
      const cad = answer(createHarness({ entities: drawing() }), "OFFSET", "T")
      cad.click(p(50, 0))
      answer(cad, "_PER", "99,-9", "")
      expect(copyOf(cad)?.start.y).toBeCloseTo(20)
      expect(lastPoint(cad)).toBe("X = 70.00     Y = 20.00     Z = 0.00")
    })

    it("leaves no override behind when Enter answers it", () => {
      // probe offset/p294: `_END`, Enter at `of` ends OFFSET; `ID 40,40` is
      // 40,40.
      const cad = answer(createHarness({ entities: drawing() }), "OFFSET", "T")
      cad.click(p(50, 0))
      answer(cad, "_END", "")
      expect(cad.activeToolId()).toBe("select")
      answer(cad, "ID", "40,40")
      expect(cad.commandLog().at(-1)!.trim()).toBe(
        "X = 40.00     Y = 40.00     Z = 0.00"
      )
    })
  })

  describe("its command line", () => {
    const SIDE =
      "Specify point on side to offset or [Exit/Multiple/Undo] <Exit>:"
    const THROUGH = "Specify through point or [Exit/Multiple/Undo] <Exit>:"

    it("goes on to the side of the one object selected before it", () => {
      // probes offset/p165, p251: nothing left selected once it starts, the
      // side asked at once, the copy made at y=10.
      const cad = createHarness({ entities: [L1()] }).select("L1")
      answer(cad, "_OFFSET")
      expect(cad.selectedIds()).toEqual([])
      answer(cad, "10")
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SIDE}`)
      answer(cad, "50,50")
      expect(copyOf(cad)?.start.y).toBeCloseTo(10)
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      // probe offset/p290: Through asks its through point at once.
      const through = createHarness({ entities: [L1()] }).select("L1")
      answer(through, "_OFFSET", "_T")
      expect(through.state().commandLine.prompt).toBe(`OFFSET ${THROUGH}`)
      answer(through, "30,20")
      expect(copyOf(through)?.start.y).toBeCloseTo(20)
    })

    it("keeps the object selected before it through Erase and Layer", () => {
      const cad = createHarness({ entities: [L1()] }).select("L1")
      answer(cad, "_OFFSET", "_E", "_N", "_L", "_S", "10")
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SIDE}`)
    })

    it("asks for the object when several were selected before it", () => {
      // probes offset/p167, p287: two lines, both left unselected.
      const cad = createHarness({
        entities: [L1(), lineOf(p(0, 40), p(100, 40), { id: "L2" })],
      }).select("L1", "L2")
      answer(cad, "_OFFSET", "10")
      expect(cad.selectedIds()).toEqual([])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    })

    it("leaves nothing selected", () => {
      // probe offset/p252: LASTPOINT at the side point.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "10",
        "50,0",
        "50,50",
        ""
      )
      expect(cad.selectedIds()).toEqual([])
      expect(lastPoint(cad)).toBe("X = 50.00     Y = 50.00     Z = 0.00")
    })

    it("Undo at the next object's point takes back the copy before", () => {
      // probe offset/p158: the side point.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "10",
        "50,0",
        "50,50",
        "50,0",
        "_U"
      )
      expect(cad.entityCount).toBe(1)
      expect(cad.commandLog().at(-1)).toBe(`${SIDE} _U`)
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      // probe offset/p166: Through's point.
      const through = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "_T",
        "50,0",
        "50,30",
        "50,0",
        "_U"
      )
      expect(through.entityCount).toBe(1)
      expect(through.commandLog().at(-1)).toBe(`${THROUGH} _U`)
      expect(through.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    })

    it("Undo puts back the source Erase took", () => {
      // probe offset/p159.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "_E",
        "_Y",
        "10",
        "50,0",
        "50,50",
        "_U"
      )
      expect(cad.entities()).toHaveLength(1)
      expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    })

    it("says Undo has nothing left, and asks for the object", () => {
      // probe offset/p125: at the object.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "10",
        "_U"
      )
      expect(cad.commandLog().slice(-2)).toEqual([
        `${SELECT} _U`,
        "Command has been completely undone.",
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      // probes offset/p132, p138: at the side and through points.
      for (const [distance, prompt] of [
        ["10", SIDE],
        ["_T", THROUGH],
      ]) {
        const at = answer(
          createHarness({ entities: [L1()] }),
          "_OFFSET",
          distance,
          "50,0",
          "_U"
        )
        expect(at.commandLog().slice(-2)).toEqual([
          `${prompt} _U`,
          "Command has been completely undone.",
        ])
        expect(at.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      }
    })

    it("says Undo has nothing left in Spanish, in table 22415's words", () => {
      // probe offset/p125: not 13314's `Todos los efectos del comando…`.
      const cad = answer(
        createHarness({ entities: [L1()], locale: es }),
        "_OFFSET",
        "10",
        "_U"
      )
      expect(cad.commandLog().slice(-2)).toEqual([
        "Designe objeto a desplazar o [Salir/Deshacer] <Salir>: _U",
        "Comando deshecho totalmente.",
      ])
    })

    it("takes Multiple again in Multiple in silence", () => {
      // probes offset/p131, p137: the same prompt again, no refusal.
      for (const [distance, prompt] of [
        ["10", "Specify point on side to offset or [Exit/Undo] <next object>:"],
        ["_T", "Specify through point or [Exit/Undo] <next object>:"],
      ]) {
        const cad = answer(
          createHarness({ entities: [L1()] }),
          "_OFFSET",
          distance,
          "50,0",
          "_M",
          "_M"
        )
        expect(cad.commandLog().at(-1)).toBe(`${prompt} _M`)
        expect(cad.state().commandLine.prompt).toBe(`OFFSET ${prompt}`)
        answer(cad, "")
        expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      }
    })

    it("is DESFASE's DF and EQ in Spanish, and Enter repeats it", () => {
      // probes offset/p101, p102.
      for (const alias of ["DF", "EQ"]) {
        const cad = answer(createHarness({ locale: es }), alias)
        expect(cad.commandLog()[0]).toBe(`${alias} DESFASE`)
      }
      // probe offset/p106: repeated with the last distance as its default.
      const cad = answer(createHarness({ entities: [L1()] }), "_OFFSET", "10")
      cad.enter().enter()
      expect(cad.state().commandLine.prompt).toBe(
        "OFFSET Specify offset distance or [Through/Erase/Layer] <10.00>:"
      )
    })

    it("takes Enter at the second point as Through", () => {
      // probe offset/p04: `0,10`, Enter, then `50,50` through the line.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "0,10",
        ""
      )
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      answer(cad, "50,0")
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${THROUGH}`)
      answer(cad, "50,50")
      expect(copyOf(cad)?.start.y).toBeCloseTo(50)
    })

    it("keeps the copies at Escape, which U takes back as one", () => {
      // desktop offset/d06.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "10",
        "50,0",
        "50,50",
        "50,0",
        "50,-50"
      )
      cad.escape()
      expect(cad.entityCount).toBe(3)
      cad.undo()
      expect(cad.entityCount).toBe(1)
    })
  })

  describe("what it produces", () => {
    const QUARTER = 0.41421356237309503
    const polylines = (cad: CadHarness) =>
      cad
        .entities()
        .filter(
          (e): e is PolylineEntity => e.type === "polyline" && e.id !== "P1"
        )
    const offset = (
      entity: Entity,
      distance: string,
      pick: string,
      side: string
    ): CadHarness =>
      answer(
        createHarness({ entities: [entity] }),
        "_OFFSET",
        distance,
        pick,
        side
      )
    const said = (cad: CadHarness) => cad.commandLog().at(-1)

    it("rounds a vertex the offset segments no longer meet at", () => {
      // probe offset/p183: arcs of radius 10 on (100,100) and (0,100).
      const concave = polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], {
        id: "P1",
        closed: true,
        bulges: [0, 0, -0.5, 0],
      })
      const [copy] = polylines(offset(concave, "10", "50,0", "50,-50"))
      expect(copy.vertices).toBeCloseToPoints(
        [
          p(-10, -10),
          p(110.00000000000001, -10),
          p(110, 100),
          p(92, 106),
          p(8.00000000000001, 105.99999999999997),
          p(-10, 100),
        ],
        12
      )
      expect(copy.bulges![2]).toBeCloseTo(0.7207592200561265, 12)
      expect(copy.bulges![3]).toBeCloseTo(-0.5000000000000002, 12)
      expect(copy.bulges![4]).toBeCloseTo(0.7207592200561265, 12)
    })

    it("drops a segment the offset reverses", () => {
      // probe offset/p187: the trapezoid's copy is a triangle.
      const trapezoid = polylineOf([p(0, 0), p(100, 0), p(55, 40), p(45, 40)], {
        id: "P1",
        closed: true,
      })
      const copies = polylines(offset(trapezoid, "15", "50,0", "50,10"))
      expect(copies).toHaveLength(1)
      expect(copies[0].vertices).toBeCloseToPoints(
        [
          p(39.452989835235556, 15),
          p(60.547010164764444, 15),
          p(50, 24.37512014645729),
        ],
        12
      )
    })

    it("splits a pinched outline in two, the left first, one step for Undo", () => {
      // probe offset/p188: two LWPOLYLINEs, 2D8 from (10,10) before 2D9.
      const dumbbell = polylineOf(
        [
          p(0, 0),
          p(90, 0),
          p(90, 45),
          p(110, 45),
          p(110, 0),
          p(200, 0),
          p(200, 100),
          p(110, 100),
          p(110, 55),
          p(90, 55),
          p(90, 100),
          p(0, 100),
        ],
        { id: "P1", closed: true }
      )
      const cad = offset(dumbbell, "10", "50,0", "50,50")
      const copies = polylines(cad)
      expect(copies).toHaveLength(2)
      expect(copies[0].vertices).toBeCloseToPoints(
        [p(10, 10), p(80, 10), p(80, 55), p(80, 90), p(10, 90)],
        12
      )
      expect(copies[1].vertices).toBeCloseToPoints(
        [p(120, 45), p(120, 10), p(190, 10), p(190, 90), p(120, 90)],
        12
      )
      answer(cad, "_U")
      expect(cad.entityCount).toBe(1)
    })

    it("drops the rounded corners that collapse inward", () => {
      // probes offset/p230 (15, past the radius), p231 (10, to it).
      const rounded = () =>
        polylineOf(
          [
            p(10, 0),
            p(90, 0),
            p(100, 10),
            p(100, 90),
            p(90, 100),
            p(10, 100),
            p(0, 90),
            p(0, 10),
          ],
          {
            id: "P1",
            closed: true,
            bulges: [0, QUARTER, 0, QUARTER, 0, QUARTER, 0, QUARTER],
          }
        )
      const [past] = polylines(offset(rounded(), "15", "50,0", "50,50"))
      expect(past.vertices).toBeCloseToPoints(
        [p(15, 15), p(85, 15), p(85, 85), p(15, 85)],
        12
      )
      expect(past.bulges).toBeUndefined()
      const [to] = polylines(offset(rounded(), "10", "50,0", "50,50"))
      expect(to.vertices).toBeCloseToPoints(
        [p(10, 10), p(90, 10), p(90, 90), p(10, 90)],
        12
      )
    })

    it("takes the side inside an arc segment's bulge as inside", () => {
      // probe offset/p226: as p181's inward copy.
      const d = polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], {
        id: "P1",
        bulges: [0, 1, 0],
      })
      const [copy] = polylines(offset(d, "10", "50,0", "140,50"))
      expect(copy.vertices).toBeCloseToPoints([
        p(0, 10),
        p(100, 10),
        p(100, 90),
        p(0, 90),
      ])
      expect(copy.bulges![1]).toBeCloseTo(1, 12)
    })

    it("leaves a zero-length segment out", () => {
      // probe offset/p194.
      const doubled = polylineOf([p(0, 0), p(100, 0), p(100, 0), p(100, 100)], {
        id: "P1",
      })
      const [copy] = polylines(offset(doubled, "10", "50,0", "50,50"))
      expect(copy.vertices).toBeCloseToPoints([p(0, 10), p(90, 10), p(90, 100)])
    })

    it("cannot offset a closed polyline on one line; a bulged one it can", () => {
      // probes offset/p192, p193.
      const flat = offset(
        polylineOf([p(0, 0), p(100, 0)], { id: "P1", closed: true }),
        "10",
        "50,0",
        "50,50"
      )
      expect(flat.entityCount).toBe(1)
      expect(said(flat)).toBe("Cannot offset that object.")
      expect(flat.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      const round = offset(
        polylineOf([p(0, 0), p(100, 0)], {
          id: "P1",
          closed: true,
          bulges: [1, 1],
        }),
        "10",
        "50,50",
        "50,10"
      )
      expect(polylines(round)[0].vertices).toBeCloseToPoints(
        [p(10, 0), p(90, 0)],
        12
      )
    })

    it("cannot offset an arc or a circle to its centre or past", () => {
      // probes offset/p174 (past), p175 (to it), p176 (a circle): said,
      // then the next object.
      const arc = () => arcOf(p(0, 0), 50, 0, deg(90), { id: "A1" })
      for (const [entity, distance, side] of [
        [arc(), "60", "10,10"],
        [arc(), "50", "10,10"],
        [circleOf(p(0, 0), 50, { id: "C1" }), "60", "10,0"],
      ] as const) {
        const cad = offset(entity, distance, "50,0", side)
        expect(cad.entityCount).toBe(1)
        expect(said(cad)).toBe("Cannot offset that object.")
        expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      }
    })

    it("refuses text, MTEXT, a block, a dimension and a hatch at the pick", () => {
      // probes offset/p201–p205: said, `Select object to offset` again.
      const objects: [Entity, string][] = [
        [createText(p(0, 0), "Hola", { height: 10 }), "5,5"],
        [createMText(p(0, 0), "Hola", { height: 10, width: 100 }), "5,-5"],
        [createInsert("B1", p(0, 0)), "50,0"],
        [createDimension("linear", p(0, 0), p(100, 0), p(50, -20)), "50,-20"],
        [hatchOf([loopOf(p(0, 0), p(100, 100))]), "50,50"],
        [createAttributeDefinition(p(0, 0), "TAG", { height: 10 }), "5,5"],
      ]
      for (const [entity, pick] of objects) {
        const cad = answer(
          createHarness({
            entities: [entity],
            blocks: [
              {
                id: "B1",
                name: "B1",
                basePoint: p(0, 0),
                entities: [lineOf(p(0, 0), p(100, 0))],
              },
            ],
          }),
          "_OFFSET",
          "10",
          pick
        )
        expect(cad.commandLog().at(-1)).toBe("Cannot offset that object.")
        expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
        expect(cad.entityCount).toBe(1)
      }
    })

    it("measures Through past an open polyline's end to its last segment drawn on", () => {
      // probes offset/p211 (30), p212 (36.0555127546399, to the corner).
      const l = () =>
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P1" })
      const [beyond] = polylines(offset(l(), "_T", "50,0", "130,150"))
      expect(beyond.vertices).toBeCloseToPoints(
        [p(0, -30), p(130, -30), p(130, 100)],
        12
      )
      const [corner] = polylines(offset(l(), "_T", "50,0", "130,-20"))
      const d = 36.0555127546399
      expect(corner.vertices).toBeCloseToPoints(
        [p(0, -d), p(100 + d, -d), p(100 + d, 100)],
        12
      )
    })

    it("cannot offset an arc through a point outside its span", () => {
      // probe offset/p209.
      const cad = offset(
        arcOf(p(0, 0), 50, 0, deg(90), { id: "A1" }),
        "_T",
        "50,0",
        "-80,-60"
      )
      expect(cad.entityCount).toBe(1)
      expect(said(cad)).toBe("Cannot offset that object.")
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
    })

    it("gives a circle's and an arc's copy no thickness, a polyline's its own", () => {
      // probes offset/p219, p233 (a circle), p232 (an arc): thickness 3 at
      // Z 7 → none, Z 7, the colour kept; p225: a polyline keeps its 2.
      const thick = <T extends Entity>(entity: T, thickness: number) =>
        ({ ...entity, elevation: 7, thickness, color: "#ff0000" }) as T
      const circle = offset(
        thick(circleOf(p(0, 0), 50, { id: "C1" }), 3),
        "10",
        "50,0",
        "100,0"
      )
      const arc = offset(
        thick(arcOf(p(0, 0), 50, 0, deg(90), { id: "A1" }), 3),
        "10",
        "50,0",
        "100,100"
      )
      for (const cad of [circle, arc]) {
        const copy = cad.entities()[1]
        expect(copy).toMatchObject({ elevation: 7, color: "#ff0000" })
        expect("thickness" in copy).toBe(false)
      }
      const poly = offset(
        thick(polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P1" }), 2),
        "10",
        "50,0",
        "50,50"
      )
      expect(polylines(poly)[0]).toMatchObject({ elevation: 7, thickness: 2 })
    })

    it("erases the source with Multiple when the object is left", () => {
      // probe offset/p216: two copies, the line erased at `<next object>`.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "_E",
        "_Y",
        "10",
        "50,0",
        "_M",
        "50,50"
      )
      expect(cad.entityCount).toBe(2)
      answer(cad, "50,50", "")
      expect(cad.entities().map((e) => (e as LineEntity).start.y)).toEqual([
        10, 20,
      ])
      expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      // Undo takes back the last copy with the erase (unverified).
      answer(cad, "_U")
      expect(cad.entities().map((e) => e.id)).toContain("L1")
      expect(cad.entityCount).toBe(2)
      answer(cad, "")
      cad.undo()
      expect(cad.entities().map((e) => e.id)).toEqual(["L1"])
    })

    it("erases the source with Multiple Through at Exit, the copies through it", () => {
      // probe offset/p224: copies at y=10 and y=30, the line erased.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "_E",
        "_Y",
        "_T",
        "50,0",
        "_M",
        "50,10",
        "50,30"
      )
      expect(cad.entityCount).toBe(3)
      answer(cad, "_E")
      expect(cad.entities().map((e) => (e as LineEntity).start.y)).toEqual([
        10, 30,
      ])
    })

    it("keeps the source at Escape with Erase in Multiple", () => {
      // Unverified: the run so far is kept (desktop offset/d06), the erase
      // AutoCAD makes on leaving the object never comes.
      const cad = answer(
        createHarness({ entities: [L1()] }),
        "_OFFSET",
        "_E",
        "_Y",
        "10",
        "50,0",
        "_M",
        "50,50"
      )
      cad.escape()
      expect(cad.entities().map((e) => e.id)[0]).toBe("L1")
      expect(cad.entityCount).toBe(2)
    })

    it("offsets an object tilted to the UCS in its own plane, keeping its normal", () => {
      // probe offset/p239: a circle of normal (0,-.707,.707), UCS World, the
      // top view: the side taken along the view, the copy r60 in its plane.
      const tilted = answer(
        createHarness(),
        "_UCS",
        "_X",
        "45",
        "_CIRCLE",
        "0,0",
        "50",
        "_UCS",
        "_W"
      )
      tilted.command("OFFSET").type("10").enter()
      tilted.click({ x: 50, y: 0, z: 0 }).click({ x: 100, y: 0, z: 0 })
      const [source, copy] = tilted.entities() as CircleEntity[]
      expect(copy.radius).toBeCloseTo(60, 12)
      expect(copy.normal).toEqual(source.normal)
      // probe offset/p235: a WCS circle, the UCS turned _X 90, the top view.
      const level = answer(
        createHarness(),
        "_CIRCLE",
        "0,0",
        "50",
        "_UCS",
        "_X",
        "90",
        "_OFFSET",
        "10",
        "50,0",
        "100,0"
      )
      const [, flat] = level.entities() as CircleEntity[]
      expect(flat.radius).toBeCloseTo(60, 12)
      expect(flat.normal).toBeUndefined()
    })

    it("offsets in an isometric view, the side taken onto the object's plane", () => {
      // probe offset/p237 (at Z 0; at Z 7 the same, unprobed).
      const cad = answer(
        createHarness(),
        "_CIRCLE",
        "0,0,7",
        "50",
        "_-VIEW",
        "_SEISO"
      )
      cad.command("OFFSET").type("10").enter()
      cad.click({ x: 50, y: 0, z: 7 }).click({ x: 100, y: 0, z: 7 })
      const [, copy] = cad.entities() as CircleEntity[]
      expect(copy).toMatchObject({ radius: 60, elevation: 7 })
    })

    it("cannot offset an object edge-on to the view, in the UCS or not", () => {
      // probes offset/p234 (in the UCS turned _X 90), p207 (back in World):
      // said at the pick, `Select object to offset` again.
      for (const back of [[], ["_UCS", "_W"]]) {
        const cad = answer(
          createHarness(),
          "_UCS",
          "_X",
          "90",
          "_CIRCLE",
          "0,0",
          "50",
          ...back,
          "_OFFSET",
          "10"
        )
        cad.click({ x: 10, y: 0, z: 0 })
        expect(cad.commandLog().at(-1)).toBe(
          "Cannot offset that object at current view direction."
        )
        expect(cad.state().commandLine.prompt).toBe(`OFFSET ${SELECT}`)
      }
    })

    it("steps on in Multiple from the first piece of a polyline that fell apart", () => {
      // Unverified: which piece AutoCAD steps from is unprobed.
      const dumbbell = polylineOf(
        [
          p(0, 0),
          p(90, 0),
          p(90, 45),
          p(110, 45),
          p(110, 0),
          p(200, 0),
          p(200, 100),
          p(110, 100),
          p(110, 55),
          p(90, 55),
          p(90, 100),
          p(0, 100),
        ],
        { id: "P1", closed: true }
      )
      const cad = answer(
        createHarness({ entities: [dumbbell] }),
        "_OFFSET",
        "10",
        "50,0",
        "_M",
        "50,50",
        "50,50"
      )
      const copies = polylines(cad)
      expect(copies).toHaveLength(3)
      expect(copies[2].vertices).toBeCloseToPoints([
        p(20, 20),
        p(70, 20),
        p(70, 55),
        p(70, 80),
        p(20, 80),
      ])
    })
  })
})
