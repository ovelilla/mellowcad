import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import {
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"
import { SnapType } from "../snapping/types"

function isometric(cad: CadHarness): CadHarness {
  cad.command("VPOINT").type("1,-1,1").enter()
  return cad
}

function drawnLine(cad: CadHarness): LineEntity {
  const line = cad.latest()
  if (line.type !== "line") throw new Error(`expected a line, got ${line.type}`)
  return line
}

describe("pointing off the plan", () => {
  it("lands the cursor on the work plane under it", () => {
    const cad = isometric(createHarness())

    cad
      .command("LINE")
      .click({ x: 0, y: 0, z: 0 })
      .click({ x: 100, y: 50, z: 0 })
    cad.escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(0, 0), 6)
    expect(line.end).toBeCloseToPoint(p(100, 50), 6)
    expect(lineEndZ(line)).toBeCloseTo(0, 9)
  })

  it("lands it ELEVATION above the UCS's XY plane", () => {
    const cad = isometric(createHarness())
    cad.command("ELEV").type("50").enter().type("0").enter()

    cad
      .command("LINE")
      .click({ x: 10, y: 10, z: 50 })
      .click({ x: 60, y: 10, z: 50 })
    cad.escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(10, 10), 6)
    expect(lineStartZ(line)).toBeCloseTo(50, 9)
  })

  it("reads the status bar's X, Y and Z on the work plane", () => {
    const cad = isometric(createHarness())

    cad.moveTo({ x: 30, y: 40, z: 0 })

    const cursor = cad.state().cursorUcs!
    expect(cursor.x).toBeCloseTo(30, 6)
    expect(cursor.y).toBeCloseTo(40, 6)
    expect(cursor.z).toBeCloseTo(0, 9)
  })

  it("refuses a pick on a work plane seen edge-on, but takes a typed point", () => {
    const cad = createHarness()
    cad.command("-VIEW").option("Orthographic").option("Front")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 })

    expect(cad.commandLog().at(-1)).toBe(
      "Pointing in edge-on UCS is prohibited."
    )
    cad.type("0,0,0").enter().type("@100,0,50").enter().escape()
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(50, 9)
  })
})

describe("picking off the plan", () => {
  it("selects a raised object where it is drawn", () => {
    const circle = withElevation(circleOf(p(0, 0), 50, { id: "HIGH" }), 100)
    const cad = isometric(createHarness({ entities: [circle] }))

    cad.click({ x: 50, y: 0, z: 100 })

    expect(cad.selectedIds()).toEqual(["HIGH"])
  })

  it("misses it where it would be on the work plane", () => {
    const circle = withElevation(circleOf(p(0, 0), 50, { id: "HIGH" }), 100)
    const cad = isometric(createHarness({ entities: [circle] }))

    cad.click({ x: 50, y: 0, z: 0 })

    expect(cad.selectedIds()).toEqual([])
  })

  it("windows what the box encloses on screen", () => {
    const circle = withElevation(circleOf(p(0, 0), 50, { id: "HIGH" }), 100)
    const low = circleOf(p(400, 0), 50, { id: "LOW" })
    const cad = isometric(createHarness({ entities: [circle, low] }))
    const viewport = cad.runtime.viewport
    const around = [
      viewport.worldToScreen({ x: -60, y: -60, z: 100 }),
      viewport.worldToScreen({ x: 60, y: 60, z: 100 }),
      viewport.worldToScreen({ x: -60, y: 60, z: 100 }),
      viewport.worldToScreen({ x: 60, y: -60, z: 100 }),
    ]
    const left = Math.min(...around.map((s) => s.x)) - 5
    const right = Math.max(...around.map((s) => s.x)) + 5
    const top = Math.min(...around.map((s) => s.y)) - 5
    const bottom = Math.max(...around.map((s) => s.y)) + 5

    cad.drag(
      viewport.screenToFacing({ x: left, y: top }),
      viewport.screenToFacing({ x: right, y: bottom })
    )

    expect(cad.selectedIds()).toEqual(["HIGH"])
  })

  it("puts a raised object's grips at its height", () => {
    const circle = withElevation(circleOf(p(0, 0), 50, { id: "HIGH" }), 100)
    const cad = isometric(createHarness({ entities: [circle] }))
    cad.select("HIGH")

    const center = cad.runtime.viewport.worldToScreen({ x: 0, y: 0, z: 100 })
    const grips = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "rect")
      .map((rect) =>
        rect.kind === "rect"
          ? { x: rect.min.x + rect.width / 2, y: rect.min.y + rect.height / 2 }
          : null
      )

    expect(
      grips.some(
        (at) => at !== null && Math.hypot(at.x - center.x, at.y - center.y) < 1
      )
    ).toBe(true)
  })
})

describe("3DORBIT", () => {
  it("turns the camera about the world's Z, the drawing's middle kept in place", () => {
    const circle = circleOf(p(0, 0), 50)
    const cad = createHarness({ entities: [circle] })
    const viewport = cad.runtime.viewport
    const before = viewport.worldToScreen({ x: 0, y: 0, z: 0 })

    cad
      .command("3DORBIT")
      .drag(
        viewport.screenToFacing({ x: 500, y: 400 }),
        viewport.screenToFacing({ x: 400, y: 300 })
      )

    expect(viewport.isPlan).toBe(false)
    const up = viewport.worldToScreen({ x: 0, y: 0, z: 10 })
    const origin = viewport.worldToScreen({ x: 0, y: 0, z: 0 })
    expect(up.x).toBeCloseTo(origin.x, 6)
    expect(up.y).toBeLessThan(origin.y)
    expect(origin).toBeCloseToPoint(before, 6)
    cad.command("ZOOM").option("Previous")
    expect(viewport.isPlan).toBe(true)
  })

  it("orbits with Shift and the wheel button held, inside a command", () => {
    const cad = createHarness()
    cad.command("LINE").click({ x: 0, y: 0, z: 0 })

    const middle = { button: 1, shiftKey: true }
    cad.runtime.pointerDown({
      screen: { x: 500, y: 400 },
      ctrlKey: false,
      altKey: false,
      ...middle,
    })
    cad.runtime.pointerMove({
      screen: { x: 450, y: 350 },
      ctrlKey: false,
      altKey: false,
      ...middle,
    })
    cad.runtime.pointerUp({
      screen: { x: 450, y: 350 },
      ctrlKey: false,
      altKey: false,
      ...middle,
    })

    expect(cad.runtime.viewport.isPlan).toBe(false)
    expect(cad.activeToolId()).toBe("line")
  })
})

describe("object snaps off the plan", () => {
  it("snap to a raised endpoint where it is drawn, with its Z", () => {
    const line = withElevation(lineOf(p(0, 0), p(100, 0)), 80)
    const cad = isometric(createHarness({ entities: [line], snap: true }))

    cad.command("LINE").click({ x: 100.2, y: 0.2, z: 80 }).type("@0,50").enter()
    cad.escape()

    const drawn = drawnLine(cad)
    expect(drawn.start).toBeCloseToPoint(p(100, 0), 9)
    expect(lineStartZ(drawn)).toBeCloseTo(80, 9)
  })

  it("find the nearest point along a sloping line as it is seen", () => {
    const sloping = withDeltaZ(lineOf(p(0, 0), p(100, 0)), 100)
    const cad = createHarness({ entities: [sloping], snap: true })
    cad.command("-VIEW").option("Orthographic").option("Front")
    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Nearest)

    cad.moveTo({ x: 50.3, y: 0, z: 49.7 })

    const snap = cad.state().snap
    expect(snap?.type).toBe(SnapType.Nearest)
    expect(snap!.point.x).toBeCloseTo(50, 6)
    expect(snap!.point.z).toBeCloseTo(50, 6)
  })

  it("take an apparent intersection on screen, at the first object's height", () => {
    const low = lineOf(p(0, 0), p(100, 0))
    const high = withElevation(lineOf(p(50, -50), p(50, -10)), 60)
    const cad = isometric(createHarness({ entities: [low, high], snap: true }))
    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.ApparentIntersection)
    const viewport = cad.runtime.viewport
    const a = viewport.worldToScreen({ x: 0, y: 0, z: 0 })
    const b = viewport.worldToScreen({ x: 100, y: 0, z: 0 })
    const c = viewport.worldToScreen({ x: 50, y: -50, z: 60 })
    const d = viewport.worldToScreen({ x: 50, y: -10, z: 60 })
    const t =
      ((c.x - a.x) * (d.y - c.y) - (c.y - a.y) * (d.x - c.x)) /
      ((b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x))
    const crossing = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }

    cad.moveTo(viewport.screenToFacing(crossing))

    const snap = cad.state().snap
    expect(snap?.type).toBe(SnapType.ApparentIntersection)
    expect(snap!.point.y).toBeCloseTo(0, 6)
    expect(snap!.point.z).toBeCloseTo(0, 9)
  })
})
