import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { THEME } from "../../scene/theme"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/**
 * The modify commands, driven end-to-end. They share a lot of machinery
 * (PlacementTool, the box-selection helper, the keyword prompts), so these
 * tests double as a regression net for that shared base: a change to
 * PlacementTool that breaks COPY will also fail MOVE and STRETCH here.
 */

const HORIZONTAL = lineOf(p(0, 0), p(200, 0), { id: "L1" })

function sorted(entities: readonly LineEntity[]): LineEntity[] {
  return [...entities].sort(
    (a, b) => a.start.x - b.start.x || a.start.y - b.start.y
  )
}

function linesOf(entities: readonly Entity[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

describe("MOVE", () => {
  it("writes what each pick at Select objects found", () => {
    const cad = createHarness({
      entities: [HORIZONTAL, lineOf(p(0, 50), p(200, 50), { id: "L2" })],
    })

    cad.command("MOVE").click(p(100, 0)).click(p(100, 0))
    cad.mouseDown(p(-10, -10)).moveTo(p(210, 60)).mouseUp(p(210, 60))
    cad.click(p(100, 50), { shiftKey: true })
    cad.press(" ")
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify base point or [Displacement] <Displacement>:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify second point or <use first point as displacement>:"
    )
    cad.click(p(0, 30))

    expect(cad.commandLog()).toEqual([
      "MOVE",
      "Select objects: 1 found",
      "Select objects: 1 found, 1 total",
      "Select objects: Specify opposite corner: 2 found, 2 total",
      "Select objects: 1 found, 1 removed, 1 total",
      "Select objects:",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify second point or <use first point as displacement>:",
    ])
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 30))
    expect(cad.byId<LineEntity>("L2").start).toBeCloseToPoint(p(0, 50))
  })

  it("counts the objects selected before it starts", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE")

    expect(cad.commandLog()).toEqual(["MOVE 1 found"])
  })

  it("moves by a Displacement typed, or Enter's last one", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").option("Displacement")
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify displacement <0.00, 0.00, 0.00>:"
    )
    cad.type("10,5").enter()
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(10, 5))
    expect(cad.activeToolId()).toBe("select")

    cad.select("L1").command("MOVE").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify displacement <10.00, 5.00, 0.00>:"
    )
    cad.enter()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(20, 10))
    expect(cad.commandLog().slice(-3)).toEqual([
      "MOVE 1 found",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify displacement <10.00, 5.00, 0.00>:",
    ])
  })

  it("ends at an empty Select objects on Space, as on Enter", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.command("MOVE").press(" ")

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual(["MOVE", "Select objects:"])
  })

  it("displaces the pre-selected objects and keeps their ids", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).click(p(50, 30))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(50, 30))
    expect(line.end).toBeCloseToPoint(p(250, 30))
    expect(cad.entityCount).toBe(1)
  })

  it("ends after a single placement", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).click(p(50, 0))

    expect(cad.activeToolId()).toBe("select")
  })

  it("accepts a typed distance and angle for the displacement", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("MOVE")
      .click(p(0, 0))
      .type("100", "distance")
      .type("90", "angle")
      .enter()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 100), 6)
  })

  it("moves a whole multi-object selection as one undoable step", () => {
    const cad = createHarness({
      entities: [HORIZONTAL, circleOf(p(0, 100), 20, { id: "C1" })],
    })

    cad.select("L1", "C1").command("MOVE").click(p(0, 0)).click(p(10, 10))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(10, 10))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(10, 110))

    cad.undo()
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    expect(cad.byId<CircleEntity>("C1").center).toBeCloseToPoint(p(0, 100))
  })

  it("selects objects first when nothing was pre-selected", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .command("MOVE")
      .click(p(100, 0)) // pick the line
      .enter() // confirm the selection set
      .click(p(0, 0))
      .click(p(0, 40))

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 40))
  })

  it("leaves the drawing untouched when cancelled", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("MOVE").click(p(0, 0)).moveTo(p(80, 80)).escape()

    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("COPY", () => {
  it("reports its mode, then offers Exit and Undo once a copy is placed", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("COPY").click(p(0, 0)).click(p(0, 100))
    expect(cad.state().commandLine.prompt).toBe(
      "COPY Specify second point or [Exit/Undo] <Exit>:"
    )
    cad.click(p(0, 200)).option("Undo")
    expect(cad.entityCount).toBe(2)
    cad.option("Exit")

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual([
      "COPY 1 found",
      "Current settings:  Copy mode = Multiple",
      "Specify base point or [Displacement] <Displacement>:",
      "Specify second point or <use first point as displacement>:",
      "Specify second point or [Exit/Undo] <Exit>:",
      "Specify second point or [Exit/Undo] <Exit>: U",
      "Specify second point or [Exit/Undo] <Exit>: E",
    ])
  })

  it("keeps the original and drops a duplicate at each destination", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(0, 100))
      .click(p(0, 200))
      .escape()

    expect(cad.entityCount).toBe(3)
    const ys = linesOf(cad.entities())
      .map((line) => line.start.y)
      .sort((a, b) => a - b)
    expect(ys).toEqual([0, 100, 200])
  })

  it("measures every copy from the same fixed base point", () => {
    // AutoCAD's Multiple mode does not chain: each destination is measured from
    // the original, not from the previously placed copy.
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(10, 0))
      .click(p(20, 0))
      .escape()

    const xs = sorted(linesOf(cad.entities())).map((line) => line.start.x)
    expect(xs).toEqual([0, 10, 20])
  })

  it("gives each copy a fresh id, and one U undoes the whole COPY", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .select("L1")
      .command("COPY")
      .click(p(0, 0))
      .click(p(0, 100))
      .click(p(0, 200))
      .escape()

    expect(new Set(cad.entities().map((e) => e.id)).size).toBe(3)
    cad.undo()
    expect(cad.entityCount).toBe(1)
    cad.redo()
    expect(cad.entityCount).toBe(3)
  })
})

describe("ROTATE", () => {
  it("turns the selection about the picked pivot", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("ROTATE").click(p(0, 0)).type("90").enter()

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0), 6)
    expect(line.end).toBeCloseToPoint(p(0, 100), 6)
  })

  it("rotates an arc's angles, not just its centre", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, 0, deg(90), { id: "A1" })],
    })

    cad.select("A1").command("ROTATE").click(p(0, 0)).type("90").enter()

    const arc = cad.byId<ArcEntity>("A1")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(deg(180))
  })

  it("leaves the original in place under the Copy option", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ROTATE")
      .click(p(0, 0))
      .option("Copy")
      .type("90")
      .enter()

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("rotates by the difference under the Reference option", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ROTATE")
      .click(p(0, 0))
      .option("Reference")
      .type("30")
      .enter()
      .type("100")
      .enter()

    // New angle 100° measured from reference 30° = a 70° turn.
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(
      p(100 * Math.cos(deg(70)), 100 * Math.sin(deg(70))),
      5
    )
  })
})

describe("SCALE", () => {
  it("scales about the picked base point", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("SCALE").click(p(0, 0)).type("2").enter()

    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(200, 0))
  })

  it("scales a circle's radius too", () => {
    const cad = createHarness({
      entities: [circleOf(p(100, 0), 50, { id: "C1" })],
    })

    cad.select("C1").command("SCALE").click(p(0, 0)).type("3").enter()

    const circle = cad.byId<CircleEntity>("C1")
    expect(circle.center).toBeCloseToPoint(p(300, 0))
    expect(circle.radius).toBeCloseTo(150)
  })

  it("derives the factor from a reference length", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("SCALE")
      .click(p(0, 0))
      .option("Reference")
      .type("50")
      .enter()
      .type("150")
      .enter()

    // 150 / 50 = ×3.
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(300, 0))
  })

  it("refuses a non-positive factor", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("SCALE").click(p(0, 0)).type("-2").enter()

    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("MIRROR", () => {
  it("adds the reflection and keeps the source by default", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("MIRROR")
      .click(p(0, 0))
      .click(p(100, 0)) // mirror line = the X axis
      .enter() // accept the default: do not erase the source

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 50))
    const reflection = linesOf(cad.entities()).find((line) => line.id !== "L1")
    expect(reflection?.end).toBeCloseToPoint(p(100, -50))
  })

  it("flips the source in place when Erase is chosen", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("MIRROR")
      .click(p(0, 0))
      .click(p(100, 0))
      .option("Yes")

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, -50))
  })

  it("offers the Yes/No prompt as keywords with no numeric field", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad.select("L1").command("MIRROR").click(p(0, 0)).click(p(100, 0))

    expect(cad.optionAbbreviations()).toEqual(["Y", "N"])
    expect(cad.hasFocusedField()).toBe(false)
  })

  it("cancels without committing anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 50), { id: "L1" })],
    })

    cad.select("L1").command("MIRROR").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 50))
  })
})

describe("ARRAYRECT", () => {
  it("fills a grid, leaving the source in cell (0, 0)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ARRAYRECT")
      .type("3", "columns")
      .type("2", "rows")
      .type("100", "colSpacing")
      .type("50", "rowSpacing")
      .enter()

    expect(cad.entityCount).toBe(6)
    const starts = linesOf(cad.entities())
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toEqual(
      ["0,0", "0,50", "100,0", "100,50", "200,0", "200,50"].sort()
    )
  })

  it("undoes the whole array in one step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ARRAYRECT")
      .type("3", "columns")
      .type("2", "rows")
      .type("100", "colSpacing")
      .type("50", "rowSpacing")
      .enter()
    cad.undo()

    expect(cad.entityCount).toBe(1)
  })

  it("cancels without creating anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").escape()

    expect(cad.entityCount).toBe(1)
  })
})

describe("ARRAYPOLAR", () => {
  it("spreads the items evenly around the centre", () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad
      .select("L1")
      .command("ARRAYPOLAR")
      .click(p(0, 0))
      .type("4", "items")
      .type("360", "fill")
      .enter()

    expect(cad.entityCount).toBe(4)
    // Rotating items keeps them radial: every start stays 100 from the centre.
    for (const line of linesOf(cad.entities())) {
      expect(Math.hypot(line.start.x, line.start.y)).toBeCloseTo(100, 5)
    }
  })
})

describe("STRETCH", () => {
  it("drags only the vertices caught by the crossing box", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad
      .command("STRETCH")
      .drag(p(250, 50), p(150, -50)) // right→left crossing over the far end
      .enter()
      .click(p(200, 0))
      .click(p(300, 0))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(300, 0))
  })

  it("bends a polyline instead of moving it whole", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(200, 0), p(200, 200)], { id: "P1" })],
    })

    cad
      .command("STRETCH")
      .drag(p(250, 250), p(150, 150))
      .enter()
      .click(p(200, 200))
      .click(p(320, 200))

    const poly = cad.byId<PolylineEntity>("P1")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(200, 0), p(320, 200)])
  })

  it("moves a pre-selected object whole, since it has no frame", () => {
    const cad = createHarness({ entities: [HORIZONTAL] })

    cad.select("L1").command("STRETCH").click(p(0, 0)).click(p(0, 50))

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 50))
    expect(line.end).toBeCloseToPoint(p(200, 50))
  })
})

describe("EXPLODE and JOIN", () => {
  const rectangle = polylineOf([p(0, 0), p(200, 0), p(200, 120), p(0, 120)], {
    id: "P1",
    closed: true,
  })

  it("EXPLODE turns a closed polyline into its four segments", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")

    expect(cad.entityCount).toBe(4)
    expect(cad.typeCounts()).toEqual({ line: 4 })
    // The closing segment becomes a line too.
    const closing = linesOf(cad.entities()).find(
      (line) =>
        Math.abs(line.start.x) < 1e-9 && Math.abs(line.start.y - 120) < 1e-9
    )
    expect(closing?.end).toBeCloseToPoint(p(0, 0))
  })

  it("JOIN rebuilds the polyline from the exploded segments", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    cad.selectAll().command("JOIN")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("each is a single undo step", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    cad.selectAll().command("JOIN")
    expect(cad.entityCount).toBe(1)

    cad.undo()
    expect(cad.entityCount).toBe(4)
    cad.undo()
    expect(cad.entityCount).toBe(1)
    expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)
  })

  it("EXPLODE emits an arc for a bulged segment", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], {
          id: "P1",
          bulges: [0, 1],
        }),
      ],
    })

    cad.select("P1").command("EXPLODE")

    expect(cad.typeCounts()).toEqual({ line: 1, arc: 1 })
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(100, 50))
    expect(arc.radius).toBeCloseTo(50)
  })

  it("JOIN keeps an arc's curvature as a bulge", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        arcOf(p(0, 0), 100, 0, deg(90), { id: "A1" }),
      ],
    })

    cad.selectAll().command("JOIN")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(100, 0), p(0, 100)], 5)
    // A 90° arc is tan(90°/4) = tan(22.5°).
    expect(poly.bulges?.[1]).toBeCloseTo(Math.tan(deg(22.5)), 6)
  })

  it("JOIN leaves unrelated objects alone", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(500, 500), p(600, 500), { id: "L2" }),
      ],
    })

    cad.selectAll().command("JOIN")

    expect(cad.entityCount).toBe(2)
    expect(cad.typeCounts()).toEqual({ line: 2 })
  })

  it("the pieces and the joined polyline keep colour, plane and thickness", () => {
    const raised: PolylineEntity = {
      ...rectangle,
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    }
    const cad = createHarness({ entities: [raised] })

    cad.select("P1").command("EXPLODE")
    for (const piece of linesOf(cad.entities())) {
      expect(piece).toMatchObject({
        color: "#ff0000",
        elevation: 12,
        thickness: 3,
      })
    }

    cad.selectAll().command("JOIN")
    expect(cad.only<PolylineEntity>("polyline")).toMatchObject({
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    })
  })

  it("previews the object under the cursor while selecting", () => {
    const cad = createHarness({ entities: [rectangle] })
    const previews = () =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            "stroke" in primitive &&
            primitive.stroke?.color === THEME.entityHover
        )

    cad.command("EXPLODE").moveTo(p(1000, 1000))
    expect(previews()).toHaveLength(0)

    cad.moveTo(p(100, 0))
    expect(previews()).toHaveLength(1)

    cad.moveTo(p(1000, 1000))
    expect(previews()).toHaveLength(0)
  })

  it("EXPLODE says so when an object cannot be exploded", () => {
    const cad = createHarness({
      entities: [rectangle, lineOf(p(-500, 0), p(-400, 0), { id: "L1" })],
    })

    cad.select("L1").command("EXPLODE")

    expect(cad.commandLog()).toContain("1 was not able to be exploded.")
    expect(cad.entityCount).toBe(2) // the line is left alone

    cad.select("P1", "L1").command("EXPLODE")

    expect(cad.commandLog()).toContain("1 was not able to be exploded.")
    expect(cad.typeCounts()).toEqual({ line: 5 }) // 4 segments + the untouched line
  })
})
