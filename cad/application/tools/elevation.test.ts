import { describe, expect, it } from "vitest"
import type {
  CircleEntity,
  InsertEntity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  entityElevation,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
} from "../../domain/entities"
import { SnapType } from "../snapping/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"

/**
 * The Z a point carries into what a command makes: a snap takes the object's,
 * a typed point its own or the plane's, and a flat object lies in the plane of
 * the first point that fixed it.
 */

function drawnLine(cad: CadHarness): LineEntity {
  return cad
    .entities()
    .find((e): e is LineEntity => e.type === "line" && !e.id.startsWith("REF"))!
}

const RAISED = withElevation(lineOf(p(0, 0), p(100, 0), { id: "REF-L" }), 10)

function ucsOrigin(cad: CadHarness) {
  return cad.runtime.document.getSettings().ucs.origin
}

describe("LINE", () => {
  it("starts at the height of the endpoint it snaps to", () => {
    const cad = createHarness({ entities: [RAISED], snap: true })

    cad.command("LINE").click(p(100, 0)).type("#200,50").enter().escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(100, 0))
    expect(lineStartZ(line)).toBe(10)
    // An absolute point typed without a Z lies on the XY plane of the UCS.
    expect(lineEndZ(line)).toBe(0)
  })

  it("keeps the last point's height for a relative point typed without a Z", () => {
    const cad = createHarness({ entities: [RAISED], snap: true })

    cad.command("LINE").click(p(100, 0)).type("@50,0").enter().escape()

    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(150, 0))
    expect(lineStartZ(line)).toBe(10)
    expect(lineEndZ(line)).toBe(10)
  })

  it("keeps the last point's height for a typed length and angle", () => {
    const cad = createHarness({ entities: [RAISED], snap: true })

    cad
      .command("LINE")
      .click(p(100, 0))
      .type("50", "distance")
      .type("90", "angle")
      .enter()
      .escape()

    expect(lineEndZ(drawnLine(cad))).toBe(10)
  })

  it("reads x,y,z, and draws a line straight up", () => {
    const cad = createHarness()

    cad.command("LINE").type("10,20,5").enter().type("@0,0,30").enter()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(10, 20))
    expect(line.end).toBeCloseToPoint(p(10, 20))
    expect(lineStartZ(line)).toBe(5)
    expect(lineEndZ(line)).toBe(35)
  })
})

describe("object snaps", () => {
  it("read a sloping line's height where they land on it", () => {
    const sloping = withDeltaZ(lineOf(p(0, 0), p(100, 0), { id: "REF-S" }), 20)
    const cad = createHarness({ entities: [sloping], snap: true })

    cad.command("LINE").click(p(50, 0)).type("@0,50").enter().escape()

    expect(lineStartZ(drawnLine(cad))).toBeCloseTo(10, 9)
  })

  it("find no intersection where two objects cross in plan at different heights", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "REF-A" }),
        withElevation(lineOf(p(50, -50), p(50, 50), { id: "REF-B" }), 10),
      ],
      snap: true,
    })

    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Intersection)
    cad.click(p(52, 2)).type("@0,50").enter().escape()

    expect(drawnLine(cad).start).toBeCloseToPoint(p(52, 2))
  })

  it("find the intersection of two objects at the same height, at that height", () => {
    const cad = createHarness({
      entities: [
        withElevation(lineOf(p(0, 0), p(100, 0), { id: "REF-A" }), 10),
        withElevation(lineOf(p(50, -50), p(50, 50), { id: "REF-B" }), 10),
      ],
      snap: true,
    })

    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Intersection)
    cad.click(p(52, 2)).type("@0,50").enter().escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(50, 0))
    expect(lineStartZ(line)).toBe(10)
  })
})

describe("flat objects", () => {
  it("PLINE lies in the plane of its first vertex and projects the rest", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .type("0,0,5")
      .enter()
      .type("#100,0,40")
      .enter()
      .type("@0,100")
      .enter()
      .enter()

    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 100),
    ])
    expect(entityElevation(polyline)).toBe(5)
  })

  it("CIRCLE 2P lies in the plane of its first point", () => {
    const cad = createHarness()

    cad.command("CIRCLE2P").type("0,0,7").enter().type("#100,0,50").enter()

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(50, 0))
    expect(entityElevation(circle)).toBe(7)
  })

  it("CIRCLE takes the height of the centre it snaps to", () => {
    const cad = createHarness({
      entities: [withElevation(circleOf(p(0, 0), 20, { id: "REF-C" }), 12)],
      snap: true,
    })

    cad.command("CIRCLE")
    cad.runtime.setSnapOverride(SnapType.Center)
    cad.click(p(1, 1)).type("5").enter()

    const circle = cad
      .entities()
      .find((e): e is CircleEntity => e.type === "circle" && e.id !== "REF-C")!
    expect(circle.center).toBeCloseToPoint(p(0, 0))
    expect(entityElevation(circle)).toBe(12)
  })
})

describe("MOVE", () => {
  it("displaces by a typed 3D offset", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1").command("MOVE").click(p(0, 0)).type("@0,0,5").enter()

    const line = cad.byId<LineEntity>("L1")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
    expect(lineStartZ(line)).toBe(5)
    expect(lineEndZ(line)).toBe(5)
  })

  it("moves an object up to the height of the point it snaps to", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(0, 100), { id: "L1" }), RAISED],
      snap: true,
    })

    cad.select("L1").command("MOVE").click(p(0, 100)).click(p(100, 0))

    expect(lineStartZ(cad.byId<LineEntity>("L1"))).toBe(10)
  })
})

describe("UCS", () => {
  it("takes an origin with a Z, and a point typed without one lies on it", () => {
    const cad = createHarness()

    cad.command("UCS").type("0,0,3").enter().enter()
    expect(ucsOrigin(cad)).toEqual({ x: 0, y: 0, z: 3 })

    cad.command("LINE").type("1,1").enter().type("@4,0").enter().escape()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(1, 1))
    expect(lineStartZ(line)).toBe(3)
    expect(lineEndZ(line)).toBe(3)
  })

  it("OBject puts the origin at the object's height", () => {
    const cad = createHarness({ entities: [RAISED] })

    cad.command("UCS").option("OBject").click(p(10, 0))

    expect(ucsOrigin(cad)).toEqual({ x: 0, y: 0, z: 10 })
  })

  it("World puts it back on Z = 0", () => {
    const cad = createHarness()

    cad.command("UCS").type("5,5,3").enter().enter()
    cad.command("UCS").option("World")

    expect(ucsOrigin(cad)).toEqual({ x: 0, y: 0, z: 0 })
  })
})

describe("BLOCK and INSERT", () => {
  it("keep the definition's heights relative to a 3D base point", () => {
    const cad = createHarness({ entities: [RAISED] })

    cad
      .command("BLOCK")
      .type("RAISED")
      .enter()
      .type("0,0,4")
      .enter()
      .click(p(50, 0))
      .enter()

    const reference = cad.only<InsertEntity>("insert")
    expect(entityElevation(reference)).toBe(4)

    cad.select(reference.id).command("EXPLODE")
    expect(lineStartZ(cad.only<LineEntity>("line"))).toBe(10)
  })
})
