import { describe, expect, it } from "vitest"
import type { ArcEntity, LineEntity } from "../../domain/entities"
import { arcSweepAngle } from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

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

  it("re-specifies the first point with the First point keyword", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0))],
    })

    cad.command("BREAK").click(p(-50, 0))
    expect(cad.optionKeys()).toEqual(["F"])

    cad.option("f").click(p(0, 0)).click(p(100, 0))

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

  it("leaves polylines alone (they are not breakable yet)", () => {
    const cad = createHarness({
      entities: [polylineOf([p(-100, 0), p(100, 0), p(100, 100)])],
    })

    cad.command("BREAK").click(p(-50, 0)).click(p(50, 0))

    expect(cad.entityCount).toBe(1)
    expect(cad.activeToolId()).toBe("break") // still waiting for a valid object
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

    cad.command("BREAKATPOINT").click(p(-100, 0))

    expect(cad.optionKeys()).toEqual([])
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
