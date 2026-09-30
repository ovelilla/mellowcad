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

  it("offers the Radius keyword with no numeric field in the way", () => {
    const cad = createHarness({ entities: corner })

    cad.command("FILLET")

    expect(cad.optionKeys()).toEqual(["R"])
    expect(cad.hasFocusedField()).toBe(false)
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

  it("rounds every corner of a polyline in one pick", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, -60), p(100, -60), p(100, 60), p(-100, 60)], {
          id: "P1",
          closed: true,
        }),
      ],
    })

    cad.command("FILLET").option("Radius").type("30").enter().click(p(0, -60))

    const poly = cad.byId<PolylineEntity>("P1")
    // Each square corner becomes two vertices joined by a quarter-turn bulge.
    expect(poly.vertices).toHaveLength(8)
    expect(poly.closed).toBe(true)
    const arcs = poly.bulges?.filter((b) => b !== 0) ?? []
    expect(arcs).toHaveLength(4)
    for (const b of arcs) expect(b).toBeCloseTo(Math.tan(deg(22.5)), 6)
  })
})

describe("CHAMFER", () => {
  const corner = [
    lineOf(p(-50, 0), p(200, 0), { id: "L1" }),
    lineOf(p(0, -50), p(0, 200), { id: "L2" }),
  ]

  it("cuts the corner at the two distances", () => {
    const cad = createHarness({ entities: corner })

    cad
      .command("CHAMFER")
      .option("Distance")
      .type("40", "dist1")
      .type("60", "dist2")
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

  it("bevels every corner of a polyline", () => {
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
      .type("20", "dist1")
      .type("20", "dist2")
      .enter()
      .click(p(0, -60))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toHaveLength(8)
    // A bevel is straight: no bulges anywhere.
    expect(poly.bulges).toBeUndefined()
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
      .option("Multiple")
      .type("20")
      .enter()
      .click(p(0, 0))
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
})
