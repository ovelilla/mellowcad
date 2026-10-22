import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  HatchEntity,
  InsertEntity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import {
  createDimension,
  entityElevation,
  entityNormal,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
  withNormal,
  withThickness,
} from "../../domain/entities"
import { SnapType } from "../snapping/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p, polylineOf, rectOf } from "../../../test/builders"

/**
 * The Z a point carries into what a command makes: a snap takes the object's,
 * a typed point its own or the plane's, and a flat object lies in the plane of
 * the first point that fixed it.
 */

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function drawnLine(cad: CadHarness): LineEntity {
  return cad
    .entities()
    .find((e): e is LineEntity => e.type === "line" && !e.id.startsWith("REF"))!
}

function drawnDimension(cad: CadHarness): DimensionEntity {
  return cad
    .entities()
    .find(
      (e): e is DimensionEntity =>
        e.type === "dimension" && !e.id.startsWith("REF")
    )!
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
    cad.runtime.setSnapEnabled(SnapType.Midpoint, true)

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
    cad.click(p(52, 2))

    // probe line/p211: an override that finds nothing refuses the pick.
    expect(cad.commandLog().slice(-2)).toEqual([
      "No Intersection found for specified point.",
      "Invalid point.",
    ])
    expect(cad.typeCounts()).toEqual({ line: 2 })
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
    // probe circle/p190: ends snapped at Z 5 and 0 make (5,5,5) r7.0711.
    const cad = createHarness()
    for (const typed of [
      "LINE",
      "0,0,5",
      "10,0,5",
      "",
      "LINE",
      "0,10,0",
      "5,5,0",
      "",
    ]) {
      cad.runtime.setCommandLineText(typed)
      cad.runtime.submitCommandLine()
    }
    for (const typed of ["CIRCLE", "2P", "END", "10,0", "END", "0,10"]) {
      cad.runtime.setCommandLineText(typed)
      cad.runtime.submitCommandLine()
    }

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(5, 5))
    expect(circle.radius).toBeCloseTo(Math.sqrt(50), 9)
    expect(entityElevation(circle)).toBe(5)
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

describe("MOVE and COPY", () => {
  it("displaces by a typed 3D offset (move/p206)", () => {
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

  it.each([
    ["MOVE from 0,0,0 to @0,0,5 (move/p206)", ["_MOVE", "0,0,0", "@0,0,5"], 0],
    ["COPY's Displacement 0,0,5 (move/p205)", ["_COPY", "_D", "0,0,5"], 3],
  ])("%s lifts each object to Z 5, flat", (_, [name, ...texts], from) => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 10),
        polylineOf([p(20, 0), p(40, 0), p(40, 20)]),
        lineOf(p(50, 0), p(60, 0)),
      ],
    })
    answer(cad, name, "_ALL", "", ...texts)

    const placed = cad.entities().slice(from)
    expect(placed).toHaveLength(3)
    for (const entity of placed) {
      expect(entityElevation(entity)).toBe(5)
      expect(entity.normal).toBeUndefined()
    }
    expect(lineEndZ(placed[2] as LineEntity)).toBe(5)
  })

  it("copies a tilted circle along X, its normal kept (move/p220)", () => {
    const normal = { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 }
    const tilted = withNormal(circleOf(p(0, 0), 5), normal)
    const cad = answer(
      createHarness({ entities: [tilted] }),
      "_COPY",
      "_ALL",
      "",
      "_D",
      "10,0,0"
    )

    const copy = cad.latest() as CircleEntity
    const moved = entityPointToWorld(copy, copy.center)
    const from = entityPointToWorld(tilted, tilted.center)
    expect([moved.x - from.x, moved.y - from.y, moved.z - from.z]).toEqual([
      expect.closeTo(10, 12),
      expect.closeTo(0, 12),
      expect.closeTo(0, 12),
    ])
    expect(entityNormal(copy)).toEqual(normal)
  })

  it("reads a point after a transparent 'ELEV on its new plane (move/p225)", () => {
    const cad = answer(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })] }),
      "_MOVE",
      "_ALL",
      "",
      "0,0",
      "'_ELEV",
      "5",
      "",
      "10,0"
    )

    const line = cad.byId<LineEntity>("A")
    expect(line.start).toBeCloseToPoint(p(10, 0))
    expect(lineStartZ(line)).toBe(5)
  })

  it("reads a Displacement typed without a Z at the ELEVATION, and keeps it as the default (move/p241)", () => {
    const cad = answer(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })] }),
      "_ELEV",
      "5",
      "",
      "_MOVE",
      "_ALL",
      "",
      "_D",
      "10,5"
    )
    expect(cad.byId<LineEntity>("A").start).toBeCloseToPoint(p(10, 5))
    expect(lineStartZ(cad.byId<LineEntity>("A"))).toBe(5)

    answer(cad, "_MOVE", "_ALL", "", "", "")
    expect(cad.byId<LineEntity>("A").start).toBeCloseToPoint(p(20, 10))
    expect(lineStartZ(cad.byId<LineEntity>("A"))).toBe(10)
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

describe("dimensions", () => {
  it("DIMLINEAR lies at the height of its dimension line, not of its origins", () => {
    const cad = createHarness({ entities: [RAISED], snap: true })

    cad.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0)).click(p(50, -30))

    expect(entityElevation(drawnDimension(cad))).toBe(0)
  })

  it("DIMLINEAR on a picked object lies at the elevation of the location", () => {
    const cad = createHarness({ entities: [RAISED] })

    cad.command("ELEV").type("3").enter().type("0").enter()
    cad.command("DIMLINEAR").enter().click(p(50, 0)).click(p(50, -30))

    expect(entityElevation(drawnDimension(cad))).toBe(3)
  })

  it("DIMLINEAR takes the height of a location snapped to an object", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "REF-A" }),
        withElevation(lineOf(p(0, -40), p(100, -40), { id: "REF-B" }), 7),
      ],
      snap: true,
    })

    cad.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0)).click(p(0, -40))

    expect(entityElevation(drawnDimension(cad))).toBe(7)
  })

  it("DIMRADIUS lies at the height of its location, not of the circle", () => {
    const cad = createHarness({
      entities: [withElevation(circleOf(p(0, 0), 20, { id: "REF-C" }), 12)],
    })

    cad.command("DIMRADIUS").click(p(20, 0)).click(p(40, 40))

    expect(entityElevation(drawnDimension(cad))).toBe(0)
  })

  it("DIMANGULAR lies at the height of its arc's location", () => {
    const cad = createHarness({
      entities: [
        RAISED,
        withElevation(lineOf(p(0, 0), p(0, 100), { id: "REF-V" }), 10),
      ],
    })

    cad.command("DIMANGULAR").click(p(50, 0)).click(p(0, 50)).click(p(30, 30))

    expect(entityElevation(drawnDimension(cad))).toBe(0)
  })

  it("DIMCONTINUE lies in the plane of the dimension it continues", () => {
    const base = withElevation(
      createDimension("linear", p(0, 0), p(100, 0), p(50, -30), {
        rotation: 0,
        id: "REF-D",
      }),
      6
    )
    const cad = createHarness({ entities: [base] })

    cad.command("DIMCONTINUE").click(p(180, 0))

    expect(entityElevation(drawnDimension(cad))).toBe(6)
  })
})

/** A line that climbs from Z 0 at x = -200 to Z 40 at x = 200. */
const SLOPING = withDeltaZ(lineOf(p(-200, 0), p(200, 0), { id: "A" }), 40)

function lineZ(line: LineEntity): [number, number] {
  return line.start.x <= line.end.x
    ? [lineStartZ(line), lineEndZ(line)]
    : [lineEndZ(line), lineStartZ(line)]
}

function pieces(cad: CadHarness, ...edges: string[]): LineEntity[] {
  return cad
    .entities()
    .filter((e): e is LineEntity => e.type === "line" && !edges.includes(e.id))
    .sort((a, b) => Math.min(a.start.x, a.end.x) - Math.min(b.start.x, b.end.x))
}

describe("editing commands", () => {
  it("TRIM gives each piece of a sloping line its Z where it was cut", () => {
    const cad = createHarness({
      entities: [
        SLOPING,
        lineOf(p(-100, -100), p(-100, 100), { id: "V1" }),
        lineOf(p(100, -100), p(100, 100), { id: "V2" }),
      ],
    })

    cad.command("TRIM").click(p(0, 0))

    const [left, right] = pieces(cad, "V1", "V2")
    expect(lineZ(left)).toEqual([0, 10])
    expect(lineZ(right)).toEqual([30, 40])
  })

  it("EXTEND carries a sloping line on up its own slope", () => {
    const cad = createHarness({
      entities: [
        withDeltaZ(lineOf(p(-200, 0), p(-100, 0), { id: "T" }), 10),
        lineOf(p(0, -100), p(0, 100), { id: "B" }),
      ],
    })

    cad.command("EXTEND").click(p(-110, 0))

    const line = cad.byId<LineEntity>("T")
    expect(line.end).toBeCloseToPoint(p(0, 0))
    expect(lineZ(line)[0]).toBe(0)
    expect(lineZ(line)[1]).toBeCloseTo(20)
  })

  it("BREAK gives each piece of a sloping line its Z where it was broken", () => {
    const cad = createHarness({ entities: [SLOPING] })

    cad.command("BREAK").click(p(-100, 0)).click(p(100, 0))

    const [left, right] = pieces(cad)
    expect(lineZ(left)).toEqual([0, 10])
    expect(lineZ(right)).toEqual([30, 40])
  })

  // probe transforms/p214 (MPDUMP).
  it("SCALE scales the elevation, the thickness and a line's rise about a base with a Z", () => {
    const cad = createHarness({
      entities: [
        withThickness(withElevation(circleOf(p(0, 0), 10, { id: "C" }), 10), 5),
        withDeltaZ(lineOf(p(0, 0), p(100, 0), { id: "L" }), 20),
      ],
    })
    answer(cad, "_SCALE", "_ALL", "", "0,0,4", "2")

    expect(cad.byId<CircleEntity>("C")).toMatchObject({
      elevation: 16,
      thickness: 10,
      radius: 20,
    })
    const line = cad.byId<LineEntity>("L")
    expect(lineZ(line)).toEqual([-4, 36])
    expect(line.end.x).toBeCloseTo(200)
  })

  it("OFFSET keeps the elevation, the rise and the thickness", () => {
    const cad = createHarness({
      entities: [{ ...SLOPING, elevation: 8, thickness: 2 }],
    })

    cad.command("OFFSET").type("20").enter().click(p(0, 0)).click(p(0, 50))

    const copy = pieces(cad, "A")[0]
    expect(copy).toMatchObject({ elevation: 8, deltaZ: 40, thickness: 2 })
  })

  describe("FILLET and CHAMFER", () => {
    const corner = (secondElevation: number) => [
      withThickness(
        withElevation(lineOf(p(-50, 0), p(200, 0), { id: "L1" }), 6),
        2
      ),
      withThickness(
        withElevation(
          lineOf(p(0, -50), p(0, 200), { id: "L2" }),
          secondElevation
        ),
        5
      ),
    ]

    it("FILLET refuses two lines at different heights, with AutoCAD's words", () => {
      const cad = createHarness({ entities: corner(9) })

      cad.command("FILLET").option("Radius").type("50").enter()
      cad.click(p(100, 0)).click(p(0, 100))

      // probe line/p61: AutoCAD 2027 writes "non coplanar", without the hyphen.
      expect(cad.commandLog()).toContain("Lines are non coplanar.")
      expect(cad.typeCounts()).toEqual({ line: 2 })
      expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(-50, 0))
      // Back at the first prompt, as AutoCAD's is.
      expect(cad.activeToolId()).toBe("fillet")
      cad.click(p(100, 0))
      expect(cad.typeCounts()).toEqual({ line: 2 })
    })

    it("FILLET refuses a rising line", () => {
      const [first, second] = corner(6)
      const cad = createHarness({ entities: [first, withDeltaZ(second, 3)] })

      cad.command("FILLET").click(p(100, 0)).click(p(0, 100))

      // probe line/p61: AutoCAD 2027 writes "non coplanar", without the hyphen.
      expect(cad.commandLog()).toContain("Lines are non coplanar.")
    })

    // probe corners/p334: lines at Z 10, thickness 3 then 5 — the arc and the
    // bevel at Z 10, thickness 5.
    it("FILLET puts the arc at the lines' height, with the second's thickness", () => {
      const cad = createHarness({ entities: corner(6) })

      cad.command("FILLET").option("Radius").type("50").enter()
      cad.click(p(100, 0)).click(p(0, 100))

      expect(cad.only<ArcEntity>("arc")).toMatchObject({
        elevation: 6,
        thickness: 5,
      })
    })

    it("CHAMFER refuses two lines at different heights", () => {
      const cad = createHarness({ entities: corner(9) })

      cad
        .command("CHAMFER")
        .option("Distance")
        .type("40")
        .enter()
        .type("60")
        .enter()
        .click(p(100, 0))
        .click(p(0, 100))

      // probe line/p61: AutoCAD 2027 writes "non coplanar", without the hyphen.
      expect(cad.commandLog()).toContain("Lines are non coplanar.")
      expect(cad.typeCounts()).toEqual({ line: 2 })
    })

    it("CHAMFER puts the bevel at the lines' height, with the second's thickness", () => {
      const cad = createHarness({ entities: corner(6) })

      cad
        .command("CHAMFER")
        .option("Distance")
        .type("40")
        .enter()
        .type("60")
        .enter()
        .click(p(100, 0))
        .click(p(0, 100))

      const bevel = pieces(cad, "L1", "L2")[0]
      expect(bevel).toMatchObject({ elevation: 6, thickness: 5 })
      expect(bevel.deltaZ).toBeUndefined()
    })
  })

  describe("JOIN", () => {
    it("joins touching objects in one plane into a polyline at that height", () => {
      const cad = createHarness({
        entities: [
          withElevation(lineOf(p(0, 0), p(100, 0), { id: "J1" }), 7),
          withElevation(lineOf(p(100, 0), p(100, 100), { id: "J2" }), 7),
        ],
      })

      cad.selectAll().command("JOIN")

      expect(entityElevation(cad.only<PolylineEntity>("polyline"))).toBe(7)
    })

    it("does not join objects that touch in plan at different heights", () => {
      const cad = createHarness({
        entities: [
          withElevation(lineOf(p(0, 0), p(100, 0), { id: "J1" }), 7),
          lineOf(p(100, 0), p(100, 100), { id: "J2" }),
        ],
      })

      cad.selectAll().command("JOIN")

      expect(cad.typeCounts()).toEqual({ line: 2 })
      expect(cad.commandLog()).toContain(
        "0 objects joined, 2 objects discarded from the operation"
      )
    })

    it("leaves a rising line out", () => {
      const cad = createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "J1" }),
          withDeltaZ(lineOf(p(100, 0), p(100, 100), { id: "J2" }), 5),
        ],
      })

      cad.selectAll().command("JOIN")

      expect(cad.typeCounts()).toEqual({ line: 2 })
    })
  })

  describe("STRETCH", () => {
    it("moves a caught line end in Z and leaves the other where it was", () => {
      const cad = createHarness({
        entities: [lineOf(p(0, 0), p(200, 0), { id: "L1" })],
      })

      cad
        .command("STRETCH")
        .drag(p(250, 50), p(150, -50))
        .enter()
        .click(p(200, 0))
        .type("@100,0,5")
        .enter()

      const line = cad.byId<LineEntity>("L1")
      expect(line.end).toBeCloseToPoint(p(300, 0))
      expect([lineStartZ(line), lineEndZ(line)]).toEqual([0, 5])
    })

    it("moves a polyline wholly inside the window up, but not one caught in part", () => {
      const cad = createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, 0), p(50, 50)], { id: "IN" }),
          polylineOf([p(0, 200), p(300, 200)], { id: "PART" }),
        ],
      })

      cad
        .command("STRETCH")
        .click(p(100, 250))
        .click(p(-50, -50))
        .enter()
        .click(p(0, 0))
        .type("@10,0,5")
        .enter()

      const inside = cad.byId<PolylineEntity>("IN")
      expect(inside.vertices[0]).toBeCloseToPoint(p(10, 0))
      expect(entityElevation(inside)).toBe(5)
      const part = cad.byId<PolylineEntity>("PART")
      expect(part.vertices).toBeCloseToPoints([p(10, 200), p(300, 200)])
      expect(entityElevation(part)).toBe(0)
    })
  })

  describe("HATCH", () => {
    const square = (z: number) =>
      [
        lineOf(p(0, 0), p(100, 0)),
        lineOf(p(100, 0), p(100, 100)),
        lineOf(p(100, 100), p(0, 100)),
        lineOf(p(0, 100), p(0, 0)),
      ].map((line) => withElevation(line, z))

    it("traces only objects at the height of the nearest, and lies there", () => {
      const cad = createHarness({
        entities: [...square(5), lineOf(p(50, -50), p(50, 150))],
      })

      cad.command("HATCH").click(p(20, 50)).enter()

      const hatch = cad.only<HatchEntity>("hatch")
      expect(entityElevation(hatch)).toBe(5)
      // The line at Z 0 crossing the square does not split it.
      expect(hatch.loops[0].vertices).toHaveLength(4)
    })

    it("finds no boundary when the nearest object's plane encloses nothing", () => {
      const cad = createHarness({
        entities: [...square(5), lineOf(p(50, -50), p(50, 150))],
      })

      cad.command("HATCH").click(p(45, 50))

      expect(cad.commandLog()).toContain("Valid hatch boundary not found.")
    })

    it("Select objects takes only objects at the first one's height", () => {
      const cad = createHarness({
        entities: [
          withElevation(rectOf(p(0, 0), p(100, 100), { id: "R1" }), 3),
          rectOf(p(200, 0), p(300, 100), { id: "R2" }),
        ],
      })

      cad
        .command("HATCH")
        .option("Select objects")
        .click(p(50, 0))
        .click(p(250, 0))
        .enter()
        .enter()

      const hatch = cad.only<HatchEntity>("hatch")
      expect(hatch.loops).toHaveLength(1)
      expect(entityElevation(hatch)).toBe(3)
    })
  })

  describe("grips", () => {
    it("drag a line's end to the elevation plane, the other end kept", () => {
      const cad = createHarness({ entities: [RAISED] })
      cad.select("REF-L")

      cad.drag(p(100, 0), p(150, 0))

      const line = cad.byId<LineEntity>("REF-L")
      expect(line.end).toBeCloseToPoint(p(150, 0))
      expect([lineStartZ(line), lineEndZ(line)]).toEqual([10, 0])
    })

    it("take the Z of the object a line's end snaps to", () => {
      const cad = createHarness({
        entities: [
          RAISED,
          withElevation(lineOf(p(150, 0), p(150, 100), { id: "REF-B" }), 7),
        ],
        snap: true,
      })
      cad.select("REF-L")

      cad.drag(p(100, 0), p(150, 0))

      expect(lineEndZ(cad.byId<LineEntity>("REF-L"))).toBe(7)
    })

    it("move an object from its grip down to the elevation plane", () => {
      const cad = createHarness({
        entities: [withElevation(circleOf(p(0, 0), 20, { id: "C1" }), 12)],
      })
      cad.select("C1")

      cad.drag(p(0, 0), p(50, 50))

      const circle = cad.byId<CircleEntity>("C1")
      expect(circle.center).toBeCloseToPoint(p(50, 50))
      expect(entityElevation(circle)).toBe(0)
    })

    it("keep a polyline in its plane", () => {
      const cad = createHarness({
        entities: [
          withElevation(polylineOf([p(0, 0), p(100, 0)], { id: "P1" }), 4),
        ],
      })
      cad.select("P1")

      cad.drag(p(100, 0), p(100, 50))

      const poly = cad.byId<PolylineEntity>("P1")
      expect(poly.vertices[1]).toEqual({ x: 100, y: 50 })
      expect(entityElevation(poly)).toBe(4)
    })
  })
})
