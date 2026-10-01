import { describe, expect, it } from "vitest"
import type { Vec3 } from "../../geometry/Vec3"
import {
  entityNormal,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  withNormal,
  type Entity,
  type LineEntity,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, p, polylineOf } from "../../../test/builders"

// Its OCS X is the world's X and its OCS Y the world's Z.
const FACING_FRONT = { x: 0, y: -1, z: 0 }

function standing<T extends Entity>(entity: T): T {
  return withNormal(entity, FACING_FRONT)
}

const CIRCLE = standing(circleOf(p(100, 50), 50, { id: "C" }))

function ellipses(cad: CadHarness) {
  return cad
    .scene()
    .primitives.filter((primitive) => primitive.kind === "ellipse")
}

function rows(cad: CadHarness) {
  return (cad.state().properties.info?.groups ?? []).flatMap((group) =>
    group.rows.map((row) => [row.id, row.value] as const)
  )
}

function ends(line: LineEntity) {
  return [
    { ...line.start, z: lineStartZ(line) },
    { ...line.end, z: lineEndZ(line) },
  ]
}

function expectAt(actual: Vec3 | undefined, expected: Vec3) {
  expect(actual?.x).toBeCloseTo(expected.x, 9)
  expect(actual?.y).toBeCloseTo(expected.y, 9)
  expect(actual?.z).toBeCloseTo(expected.z, 9)
}

describe("an object with a normal of its own", () => {
  it("is drawn in its plane: edge-on in plan, round from the front", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    const [plan] = ellipses(cad)
    if (plan?.kind !== "ellipse") throw new Error("no ellipse")
    expect(Math.min(plan.radiusX, plan.radiusY)).toBeLessThan(0.02)
    expect(plan.center).toBeCloseToPoint(
      cad.toScreen({ x: 100, y: 0, z: 50 }),
      6
    )

    cad.command("-VIEW").option("Orthographic").option("Front")
    const [front] = ellipses(cad)
    if (front?.kind !== "ellipse") throw new Error("no ellipse")
    expect(front.radiusY / front.radiusX).toBeCloseTo(1, 6)
  })

  it("is picked in plan where it is drawn, not where its points read", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    cad.click(p(60, 0))
    expect(cad.selectedIds()).toEqual(["C"])

    const flat = createHarness({ entities: [CIRCLE] })
    flat.click(p(100, 100))
    expect(flat.selectedIds()).toEqual([])
  })

  it("is window-selected by its outline on screen", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    cad.drag(p(40, -10), p(160, 10))

    expect(cad.selectedIds()).toEqual(["C"])
  })

  it("offers its center in space, in plan and off it", () => {
    const cad = createHarness({ entities: [CIRCLE], snap: true })
    cad.command("LINE").moveTo(p(100, 0))
    expect(cad.state().snap?.type).toBe("center")
    expectAt(cad.state().snap?.point, { x: 100, y: 0, z: 50 })
    cad.escape()

    cad.command("VPOINT").type("1,-1,1").enter()
    cad.command("LINE").moveTo({ x: 100, y: 0, z: 50 })
    expect(cad.state().snap?.type).toBe("center")
    expectAt(cad.state().snap?.point, { x: 100, y: 0, z: 50 })
  })

  it("turns its normal with ROTATE", () => {
    const cad = createHarness({ entities: [CIRCLE] })
    cad.select("C")

    cad.command("ROTATE").click(p(0, 0)).type("90").enter()

    const rotated = cad.latest()
    const normal = entityNormal(rotated)
    expect(normal.x).toBeCloseTo(1, 12)
    expect(normal.y).toBeCloseTo(0, 12)
    expect(normal.z).toBeCloseTo(0, 12)
    if (rotated.type !== "circle") throw new Error("not a circle")
    expectAt(entityPointToWorld(rotated, rotated.center), {
      x: 0,
      y: 100,
      z: 50,
    })
  })

  it("explodes, as a polyline, into lines in the WCS", () => {
    const polyline = standing(
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P" })
    )
    const cad = createHarness({ entities: [polyline] })
    cad.select("P")

    cad.command("EXPLODE")

    const lines = cad
      .entities()
      .filter((entity): entity is LineEntity => entity.type === "line")
    expect(lines.map(ends)).toEqual([
      [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 0, z: 0 },
      ],
      [
        { x: 100, y: 0, z: 0 },
        { x: 100, y: 0, z: 50 },
      ],
    ])
  })

  it("shows its center in the UCS and its normal in the palette", () => {
    const cad = createHarness({ entities: [CIRCLE] })
    cad.select("C")

    expect(rows(cad)).toEqual(
      expect.arrayContaining([
        ["normalX", "0.00"],
        ["normalY", "-1.00"],
        ["normalZ", "0.00"],
        ["x", "100.00"],
        ["y", "0.00"],
        ["z", "50.00"],
      ])
    )

    expect(cad.runtime.setSelectionProperty("centerZ", "80")).toBe(true)
    const moved = cad.latest()
    if (moved.type !== "circle") throw new Error("not a circle")
    expectAt(entityPointToWorld(moved, moved.center), { x: 100, y: 0, z: 80 })
    expect(entityNormal(moved)).toEqual(FACING_FRONT)
  })
})
