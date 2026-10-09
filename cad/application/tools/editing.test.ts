import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import type { Vec2 } from "../../geometry/Vec2"
import { THEME } from "../../scene/theme"
import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
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
    cad.click(p(100, 0)).click(p(0, 50), { shiftKey: true }).enter()

    expect(cad.commandLog()).toEqual([
      "TRIM",
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to trim or shift-select to extend:",
      "Select object to trim or shift-select to extend:",
      "Select object to trim or shift-select to extend:",
    ])
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

  it("does nothing when the object crosses nothing", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "A" })],
    })

    cad.command("TRIM").click(p(100, 0))

    expect(endpoints(cad.byId<LineEntity>("A"))).toBeCloseToPoints([
      p(-200, 0),
      p(200, 0),
    ])
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
      "Select object to extend or shift-select to trim: *Cancel*",
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
    const cad = createHarness({ entities: [ell, lineOf(p(200, 0), p(300, 0))] })

    cad.command("FILLET").option("Radius").type("20").enter().click(p(0, 50))
    expect(cad.byId<PolylineEntity>("P1").vertices).toHaveLength(3)
    // A line is no corner for a polyline segment here: it is not taken.
    cad.click(p(250, 0))
    expect(cad.activeToolId()).toBe("fillet")
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
      "FILLET Select first object or [Undo/Polyline/Radius]:"
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
      "Select first object or [Undo/Polyline/Radius]: U",
      "Select first object or [Undo/Polyline/Radius]: U",
      "Command has been completely undone.",
      "Select first object or [Undo/Polyline/Radius]: U",
      "Command has been completely undone.",
      "Select first object or [Undo/Polyline/Radius]:",
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
      "CHAMFER Select first line or [Undo/Polyline/Distance]:"
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
