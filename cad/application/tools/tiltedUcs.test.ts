import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"
import {
  type CircleEntity,
  type Entity,
  type LineEntity,
  entityNormal,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
  withNormal,
} from "../../domain/entities"
import { THEME } from "../../scene/theme"
import {
  type Ucs,
  ucsPointToWorld,
  ucsZAxis as ucsZAxisOf,
} from "../../domain/ucs"

const ucsOf = (cad: CadHarness): Ucs => cad.runtime.document.getSettings().ucs

/** The front view, which aligns the UCS with it: X along X, Y along Z, Z along -Y. */
function front(cad: CadHarness): CadHarness {
  cad.press("F7")
  cad.command("-VIEW").option("Orthographic").option("Front")
  return cad
}

function only<T extends Entity["type"]>(
  cad: CadHarness,
  type: T
): Extract<Entity, { type: T }>[] {
  return cad
    .entities()
    .filter(
      (entity): entity is Extract<Entity, { type: T }> => entity.type === type
    )
}

function worldOf(entity: Entity, point: { x: number; y: number }) {
  return entityPointToWorld(entity, point)
}

const FRONT_Z = { x: 0, y: -1, z: 0 }

describe("a tilted UCS", () => {
  it("is what an orthographic view aligns the UCS with", () => {
    const cad = front(createHarness())
    const ucs = ucsOf(cad)
    expect(ucs.origin).toMatchObject({ x: 0, y: 0, z: 0 })
    expect(ucs.xAxis).toMatchObject({ x: 1, y: 0, z: 0 })
    expect(ucs.yAxis).toMatchObject({ x: 0, y: 0, z: 1 })

    cad.command("-VIEW").option("Orthographic").option("Top")
    expect(cad.runtime.document.getSettings().ucs.yAxis).toMatchObject({
      x: 0,
      y: 1,
      z: 0,
    })
  })

  it("draws a circle in its XY plane, with its Z as the normal", () => {
    const cad = front(createHarness())

    cad.command("CIRCLE").click({ x: 10, y: 0, z: 20 }).type("5").enter()

    const [circle] = only(cad, "circle")
    expect(entityNormal(circle)).toBeCloseToPoint(FRONT_Z)
    expect(entityNormal(circle).z).toBeCloseTo(0, 12)
    const center = worldOf(circle, circle.center)
    expect(center).toBeCloseToPoint(p(10, 0))
    expect(center.z).toBeCloseTo(20, 9)
    expect(circle.radius).toBeCloseTo(5, 9)
  })

  it("reads typed points in the UCS", () => {
    const cad = front(createHarness())

    cad.command("LINE").type("0,0").enter().type("@30,40").enter().escape()

    const [line] = only(cad, "line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(30, 0))
    expect(lineStartZ(line)).toBeCloseTo(0, 9)
    expect(lineEndZ(line)).toBeCloseTo(40, 9)
  })

  it("trims in its XY plane", () => {
    const cad = front(createHarness())
    cad.command("LINE").type("0,0").enter().type("100,0").enter().escape()
    cad.command("LINE").type("50,-20").enter().type("@0,40").enter().escape()

    cad.command("TRIM").click({ x: 80, y: 0, z: 0 }).escape()

    const lines = only(cad, "line")
    const horizontal = lines.find((line) => lineEndZ(line) === lineStartZ(line))
    expect(horizontal).toBeDefined()
    const ends = [horizontal!.start.x, horizontal!.end.x].sort((a, b) => a - b)
    expect(ends[0]).toBeCloseTo(0, 6)
    expect(ends[1]).toBeCloseTo(50, 6)
  })

  it("rotates about its Z axis", () => {
    const cad = front(createHarness())
    cad.command("LINE").type("0,0").enter().type("100,0").enter().escape()

    cad
      .command("ROTATE")
      .click({ x: 50, y: 0, z: 0 })
      .enter()
      .type("0,0")
      .enter()
      .type("90")
      .enter()

    const [line] = only(cad, "line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(0, 0))
    expect(lineStartZ(line)).toBeCloseTo(0, 9)
    expect(lineEndZ(line)).toBeCloseTo(100, 9)
  })

  it("mirrors in a plane holding its Z axis", () => {
    const circle = withNormal(circleOf(p(30, 10), 5), FRONT_Z)
    const cad = front(createHarness({ entities: [circle] }))

    cad
      .command("MIRROR")
      .click({ x: 35, y: 0, z: 10 })
      .enter()
      .type("0,0")
      .enter()
      .type("0,10")
      .enter()
      .enter()

    const mirrored = only(cad, "circle").find((c) => c.id !== circle.id)!
    const center = worldOf(mirrored, mirrored.center)
    expect(center).toBeCloseToPoint(p(-30, 0))
    expect(center.z).toBeCloseTo(10, 9)
    expect(entityNormal(mirrored)).toBeCloseToPoint(FRONT_Z)
  })

  it("keeps what an edit leaves alone to the bit, and undoes exactly", () => {
    const tilted = withNormal(circleOf(p(30, 10), 5, { id: "C" }), FRONT_Z)
    const flat = lineOf(p(0, 0), p(100, 0), { id: "L" })
    const cad = front(createHarness({ entities: [tilted, flat] }))

    cad.command("MOVE").click({ x: 35, y: 0, z: 10 }).enter()
    cad.type("0,0").enter().type("10,0").enter()
    const moved = cad.byId("C") as CircleEntity
    expect(worldOf(moved, moved.center)).toBeCloseToPoint(p(40, 0))
    expect(cad.byId("L")).toBe(flat)

    cad.undo()
    expect(cad.byId("C")).toBe(tilted)
  })

  it("marks the WCS on the icon, and not a tilted UCS its frame reads level", () => {
    const squares = (cad: CadHarness) =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            primitive.kind === "path" &&
            primitive.closed &&
            primitive.points.length === 4 &&
            primitive.stroke?.color === THEME.crosshair
        ).length
    const cad = createHarness({ ucsIcon: true })
    expect(squares(cad)).toBe(1)
    front(cad)
    expect(squares(cad)).toBe(0)
  })

  it("shows the status bar's coordinates in the UCS", () => {
    const cad = front(createHarness())
    cad.moveTo({ x: 30, y: 0, z: 40 })
    const cursor = cad.state().cursorUcs!
    expect(cursor.x).toBeCloseTo(30, 6)
    expect(cursor.y).toBeCloseTo(40, 6)
    expect(cursor.z).toBeCloseTo(0, 9)
  })

  it("draws the rubber band where the line will go, in an isometric view", () => {
    const cad = front(createHarness())
    cad.command("VPOINT").type("1,-1,1").enter()

    cad.command("LINE").type("0,0").enter().moveTo({ x: 40, y: 0, z: 30 })
    const view = cad.runtime.viewport
    const start = view.worldToScreen({ x: 0, y: 0, z: 0 })
    const band = cad
      .scene()
      .primitives.find(
        (primitive) =>
          primitive.kind === "segment" &&
          Math.hypot(primitive.a.x - start.x, primitive.a.y - start.y) < 1e-6
      )
    cad.click({ x: 40, y: 0, z: 30 }).escape()

    const [line] = only(cad, "line") as LineEntity[]
    expect(band?.kind === "segment" && band.b).toBeCloseToPoint(
      view.worldToScreen({ ...line.end, z: lineEndZ(line) }),
      6
    )
  })
})

describe("the UCS command in 3D", () => {
  const near = (
    v: { x: number; y: number; z: number },
    x: number,
    y: number,
    z: number
  ) => {
    expect(v.x).toBeCloseTo(x, 9)
    expect(v.y).toBeCloseTo(y, 9)
    expect(v.z).toBeCloseTo(z, 9)
  }

  it("turns about X and Y by the right-hand rule, 90 by default", () => {
    const cad = createHarness()
    cad.command("UCS").option("X").enter()
    near(ucsOf(cad).yAxis, 0, 0, 1)

    cad.command("UCS").option("World")
    cad.command("UCS").option("Y").type("90").enter()
    near(ucsOf(cad).xAxis, 0, 0, -1)
    near(ucsOf(cad).yAxis, 0, 1, 0)
  })

  it("takes three points at different heights", () => {
    const cad = createHarness()
    cad.command("UCS").type("0,0,0").enter().type("#10,0,0").enter()
    cad.type("#0,0,10").enter()
    near(ucsOf(cad).xAxis, 1, 0, 0)
    near(ucsOf(cad).yAxis, 0, 0, 1)
  })

  it("keeps the new Y axis in the current XY plane when the third point is accepted", () => {
    const cad = createHarness()
    cad.command("UCS").type("0,0,0").enter().type("#10,0,10").enter().enter()
    near(ucsOf(cad).xAxis, Math.SQRT1_2, 0, Math.SQRT1_2)
    near(ucsOf(cad).yAxis, 0, 1, 0)
  })

  it("aligns Z with ZAxis, X level in the WCS", () => {
    const cad = createHarness()
    cad.command("UCS").option("ZAxis").type("5,5,0").enter()
    cad.type("@1,0,0").enter()
    const ucs = ucsOf(cad)
    near(ucs.origin, 5, 5, 0)
    near(ucs.xAxis, 0, 1, 0)
    near(ucs.yAxis, 0, 0, 1)
  })

  it("only moves the origin when ZAxis's second point is accepted", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("30").enter()
    const before = ucsOf(cad)
    cad.command("UCS").option("ZAxis").type("5,5,0").enter().enter()
    const ucs = ucsOf(cad)
    expect(ucs.xAxis).toEqual(before.xAxis)
    const origin = ucsPointToWorld(before, { x: 5, y: 5, z: 0 })
    near(ucs.origin, origin.x, origin.y, origin.z)
  })

  it("aligns Z with the end of a line under ZAxis's Object", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("UCS").option("ZAxis").option("Object")
    cad.click(p(90, 0))
    const ucs = ucsOf(cad)
    near(ucs.origin, 100, 0, 0)
    near(ucsZAxisOf(ucs), 1, 0, 0)
  })

  it("lays the XY plane on a tilted object with OBject", () => {
    const circle = withNormal(circleOf(p(30, 10), 5), FRONT_Z)
    const cad = front(createHarness({ entities: [circle] }))
    cad.command("-VIEW").option("Orthographic").option("Top")
    cad.command("VPOINT").type("1,-1,1").enter()

    cad.command("UCS").option("OBject").click({ x: 35, y: 0, z: 10 })

    const ucs = ucsOf(cad)
    near(ucs.origin, 30, 0, 10)
    near(ucsZAxisOf(ucs), 0, -1, 0)
  })

  it("lays the XY plane square to the line of sight with View", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,-1,1").enter()
    cad.command("UCS").option("View")
    const { right, up } = cad.runtime.viewport
    near(ucsOf(cad).xAxis, right.x, right.y, right.z)
    near(ucsOf(cad).yAxis, up.x, up.y, up.z)
  })

  it("looks down a tilted UCS's Z with PLAN", () => {
    const cad = front(createHarness())
    cad.command("VPOINT").type("1,-1,1").enter()
    cad.command("PLAN").enter()
    const { direction } = cad.runtime.viewport
    near(direction, 0, -1, 0)
  })

  it("leaves the UCS alone for an isometric view", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("30").enter()
    const before = ucsOf(cad)
    cad.command("-VIEW").option("SEiso")
    expect(ucsOf(cad)).toBe(before)
  })

  it("lists a tilted UCS with its three axes", () => {
    const cad = front(createHarness())
    cad.command("UCS").option("NAmed").option("Save").type("F").enter()
    cad.command("UCS").option("World")
    cad.command("UCS").option("NAmed").type("?").enter().enter().escape()
    expect(cad.commandLog().join("\n")).toContain(
      "Y Axis = <0.0000,0.0000,1.0000>, Z Axis = <0.0000,-1.0000,0.0000>"
    )
  })
})

describe("the tools in a tilted UCS", () => {
  it("leave an object at an angle to the UCS plane alone", () => {
    const tilted = withNormal(circleOf(p(50, 0), 20, { id: "C" }), FRONT_Z)
    const line = lineOf(p(0, 0), p(100, 0), { id: "L" })
    const edge = lineOf(p(10, -50), p(10, 50), { id: "E" })
    const cad = createHarness({ entities: [tilted, line, edge] })

    cad.command("TRIM").click(p(50, 0)).click(p(90, 0)).escape()

    // Cut back to the edge: the circle crossing it at 70 was no edge.
    expect(cad.byId("C")).toBe(tilted)
    const trimmed = cad.byId<LineEntity>("L")
    expect([trimmed.start, trimmed.end]).toBeCloseToPoints([p(0, 0), p(10, 0)])
  })

  it("read a typed * point in the WCS", () => {
    const cad = front(createHarness())
    cad.command("LINE").type("*10,20,30").enter().type("@0,0,5").enter()
    cad.escape()
    const [line] = only(cad, "line")
    expect(line.start).toBeCloseToPoint(p(10, 20))
    expect(lineStartZ(line)).toBeCloseTo(30, 9)
    expect(line.end).toBeCloseToPoint(p(10, 15))
  })

  it("show and take a line's ends in the UCS in the palette", () => {
    const cad = front(createHarness())
    cad.command("LINE").type("0,0").enter().type("@30,40").enter().escape()
    const [line] = only(cad, "line")
    cad.runtime.selection.set([line.id])

    const rows = new Map(
      cad
        .state()
        .properties.info!.groups.flatMap((group) => group.rows)
        .map((row) => [row.id, row.value])
    )
    expect(rows.get("endX")).toBe("30.00")
    expect(rows.get("endY")).toBe("40.00")
    expect(rows.get("endZ")).toBe("0.00")

    expect(cad.runtime.setSelectionProperty("endY", "50")).toBe(true)
    const moved = cad.byId(line.id) as LineEntity
    expect(lineEndZ(moved)).toBeCloseTo(50, 9)
    expect(moved.end).toBeCloseToPoint(p(30, 0))
  })
})

describe("FILLET and CHAMFER of lines in a tilted plane", () => {
  const level = () => lineOf(p(0, 0), p(100, 0), { id: "A" })
  const upright = () => withDeltaZ(lineOf(p(0, 0), p(0, 0), { id: "B" }), 100)

  function isometric(entities: Entity[]): CadHarness {
    const cad = createHarness({ entities })
    cad.press("F7")
    cad.command("VPOINT").type("1,-1,1").enter()
    return cad
  }

  it("rounds the corner in the plane the lines share", () => {
    const cad = isometric([level(), upright()])

    cad.command("FILLET").option("Radius").type("10").enter()
    cad.click({ x: 60, y: 0, z: 0 }).click({ x: 0, y: 0, z: 60 })

    const [arc] = only(cad, "arc")
    expect(entityNormal(arc)).toBeCloseToPoint(FRONT_Z)
    const center = worldOf(arc, arc.center)
    expect(center).toBeCloseToPoint(p(10, 0))
    expect(center.z).toBeCloseTo(10, 9)
    expect(arc.radius).toBeCloseTo(10, 9)
    const a = cad.byId("A") as LineEntity
    const b = cad.byId("B") as LineEntity
    expect([a.start.x, a.end.x].sort((x, y) => x - y)).toEqual([
      expect.closeTo(10, 9),
      expect.closeTo(100, 9),
    ])
    expect([lineStartZ(b), lineEndZ(b)].sort((x, y) => x - y)).toEqual([
      expect.closeTo(10, 9),
      expect.closeTo(100, 9),
    ])
  })

  it("bevels it there too", () => {
    const cad = isometric([level(), upright()])

    cad
      .command("CHAMFER")
      .option("Distance")
      .type("10")
      .enter()
      .type("10")
      .enter()
    cad.click({ x: 60, y: 0, z: 0 }).click({ x: 0, y: 0, z: 60 })

    const bevel = only(cad, "line").find(
      (line) => line.id !== "A" && line.id !== "B"
    )!
    const ends = [
      { ...bevel.start, z: lineStartZ(bevel) },
      { ...bevel.end, z: lineEndZ(bevel) },
    ].sort((u, v) => u.x - v.x)
    expect(ends[0]).toMatchObject({
      x: expect.closeTo(0, 9),
      y: expect.closeTo(0, 9),
      z: expect.closeTo(10, 9),
    })
    expect(ends[1]).toMatchObject({
      x: expect.closeTo(10, 9),
      y: expect.closeTo(0, 9),
      z: expect.closeTo(0, 9),
    })
  })

  it("refuses lines that share no plane", () => {
    const skew = withDeltaZ(lineOf(p(50, -50), p(50, 50), { id: "B" }), 40)
    const cad = isometric([withElevation(level(), 0), skew])

    cad.command("FILLET").click({ x: 20, y: 0, z: 0 })
    cad.click({ x: 50, y: 0, z: 20 })

    expect(cad.commandLog().at(-1)).toBe("Lines are non-coplanar.")
    expect(only(cad, "arc")).toHaveLength(0)
  })
})

describe("curves by three points at different heights", () => {
  it("lays a 3P circle in the points' own plane", () => {
    const cad = createHarness()

    cad.command("CIRCLE3P")
    cad.type("0,0,0").enter().type("#100,0,0").enter().type("#0,0,100").enter()

    const [circle] = only(cad, "circle")
    expect(entityNormal(circle)).toBeCloseToPoint(FRONT_Z)
    expect(Math.abs(entityNormal(circle).z)).toBeCloseTo(0, 12)
    const center = worldOf(circle, circle.center)
    expect(center).toBeCloseToPoint(p(50, 0))
    expect(center.z).toBeCloseTo(50, 9)
    expect(circle.radius).toBeCloseTo(50 * Math.SQRT2, 9)
  })

  it("lays a 3P arc in their plane, from the first point through the second to the third", () => {
    const cad = createHarness()
    const r = 100 * Math.SQRT1_2

    cad.command("ARC")
    cad.type("100,0,0").enter().type(`#${r},0,${r}`).enter()
    cad.type("#0,0,100").enter()

    const [arc] = only(cad, "arc")
    const center = worldOf(arc, arc.center)
    expect(center).toBeCloseToPoint(p(0, 0))
    expect(center.z).toBeCloseTo(0, 9)
    expect(arc.radius).toBeCloseTo(100, 9)
    const ends = [arc.startAngle, arc.endAngle].map((angle) =>
      worldOf(arc, {
        x: arc.center.x + 100 * Math.cos(angle),
        y: arc.center.y + 100 * Math.sin(angle),
      })
    )
    const tops = ends.map((end) => end.z).sort((a, b) => a - b)
    expect(tops[0]).toBeCloseTo(0, 9)
    expect(tops[1]).toBeCloseTo(100, 9)
    const sweep =
      (((arc.endAngle - arc.startAngle) % (2 * Math.PI)) + 2 * Math.PI) %
      (2 * Math.PI)
    const mid = arc.startAngle + sweep / 2
    const through = worldOf(arc, {
      x: arc.center.x + 100 * Math.cos(mid),
      y: arc.center.y + 100 * Math.sin(mid),
    })
    expect(through).toBeCloseToPoint(p(r, 0), 9)
    expect(through.z).toBeCloseTo(r, 9)
  })

  it("keeps a 3P circle through points at one height in the plan", () => {
    const cad = createHarness()
    cad.command("CIRCLE3P")
    cad.type("0,0,5").enter().type("#100,0,5").enter().type("#0,100,5").enter()

    const [circle] = only(cad, "circle")
    expect(circle.normal).toBeUndefined()
    expect(circle.elevation).toBe(5)
  })
})
