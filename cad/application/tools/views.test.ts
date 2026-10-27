import { describe, expect, it } from "vitest"
import { withDeltaZ, withElevation, withThickness } from "../../domain/entities"
import type { Vec3 } from "../../geometry/Vec3"
import type { ScenePrimitive } from "../../scene/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p, textOf } from "../../../test/builders"
import { entityScreenOutline } from "../viewOutline"

const ROOT3 = Math.sqrt(3)

function direction(cad: CadHarness) {
  return cad.runtime.viewport.direction
}

/** `v` against x, y, z coordinate by coordinate, so a -0 reads as 0. */
function expectVector(v: Vec3, x: number, y: number, z: number): void {
  expect(v.x).toBeCloseTo(x, 12)
  expect(v.y).toBeCloseTo(y, 12)
  expect(v.z).toBeCloseTo(z, 12)
}

function screenOf(cad: CadHarness, x: number, y: number, z: number) {
  return cad.runtime.viewport.worldToScreen({ x, y, z })
}

function kinds(cad: CadHarness): ScenePrimitive["kind"][] {
  return cad
    .scene()
    .primitives.filter((primitive) => primitive.kind !== "label")
    .map((primitive) => primitive.kind)
}

describe("VPOINT", () => {
  it("looks from the view point back at the origin, the world's Z up", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    cad.command("VPOINT").type("1,-1,1").enter()

    expect(direction(cad).x).toBeCloseTo(1 / ROOT3, 12)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).z).toBeCloseTo(1 / ROOT3, 12)
    const origin = screenOf(cad, 0, 0, 0)
    const up = screenOf(cad, 0, 0, 10)
    expect(up.x).toBeCloseTo(origin.x, 9)
    expect(up.y).toBeLessThan(origin.y)
    expect(cad.commandLog()).toContain(
      "Current view direction:  VIEWDIR=0.00,0.00,1.00"
    )
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
    expect(cad.activeToolId()).toBe("select")
  })

  it("reads the view point in the WCS whatever the UCS (WORLDVIEW 1)", () => {
    const cad = createHarness()
    cad.command("UCS").type("50,50,20").enter().enter()

    cad.command("-VPOINT").type("0,-1,0").enter()

    expect(direction(cad).y).toBeCloseTo(-1, 12)
  })

  it("takes Rotate's two angles, and 270 / 90 is the plan", () => {
    const cad = createHarness()

    cad.command("VPOINT").option("Rotate").type("225").enter()
    cad.type("35.2644").enter()
    expect(direction(cad).x).toBeCloseTo(-1 / ROOT3, 5)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 5)

    cad.command("VPOINT").option("Rotate").type("270").enter()
    cad.type("90").enter()
    expect(cad.runtime.viewport.isPlan).toBe(true)
  })

  it("asks again for a zero view point, and Enter leaves the view", () => {
    const cad = createHarness()

    cad.command("VPOINT").type("0,0,0").enter()
    expect(cad.activeToolId()).toBe("vpoint")
    cad.type("").enter()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.runtime.viewport.isPlan).toBe(true)
  })

  it("is stepped back through by ZOOM Previous", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,1,1").enter()

    cad.command("ZOOM").option("Previous")

    expect(cad.runtime.viewport.isPlan).toBe(true)
  })
})

describe("-VIEW", () => {
  it("restores an orthographic view and fits the extents", () => {
    const line = withElevation(lineOf(p(0, 0), p(100, 0)), 50)
    const cad = createHarness({ entities: [line] })

    cad.command("-VIEW").option("Orthographic").option("Front")

    expect(direction(cad).y).toBeCloseTo(-1, 12)
    const start = screenOf(cad, 0, 0, 50)
    const end = screenOf(cad, 100, 0, 50)
    expect(start.y).toBeCloseTo(end.y, 9)
    expect(end.x).toBeGreaterThan(start.x)
    for (const point of [start, end]) {
      expect(point.x).toBeGreaterThanOrEqual(0)
      expect(point.x).toBeLessThanOrEqual(1000)
    }
  })

  it("takes Enter at Orthographic as Top, the plan of the WCS", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,1,1").enter()

    cad.command("VIEW").option("Orthographic").enter()

    expect(cad.runtime.viewport.isPlan).toBe(true)
    expectVector(cad.runtime.viewport.right, 1, 0, 0)
  })

  // AutoCAD 2023's console (acc/v1, y1 of the hidden UCS words session):
  // -VIEW Bottom, then UCSXDIR / UCSYDIR, and VPOINT then UCS View, read the
  // screen's horizontal — twist 0 is the line of sight's arbitrary-axis X.
  it("shows Bottom with the X to the left, as twist 0 does", () => {
    const cad = createHarness()
    cad.command("-VIEW").option("Orthographic").option("Bottom")
    expectVector(cad.runtime.viewport.right, -1, 0, 0)
    const { xAxis, yAxis } = cad.runtime.document.getSettings().ucs
    expect([xAxis, yAxis]).toEqual([
      { x: -1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ])
    expect(cad.state().view.preset).toBe("Bottom")

    const vpoint = createHarness()
    vpoint.command("VPOINT").type("0,0,-1").enter()
    expectVector(vpoint.runtime.viewport.right, -1, 0, 0)
    vpoint.command("VPOINT").type("0.01,0,-1").enter()
    const right = vpoint.runtime.viewport.right
    expect([right.x, right.y, right.z].map((v) => +v.toFixed(4) + 0)).toEqual([
      -1, 0, -0.01,
    ])
  })

  it("answers the preset names AutoCAD's menus type without listing them", () => {
    const cad = createHarness()

    cad.command("-VIEW")
    expect(cad.state().commandOptions.map((option) => option.id)).toEqual([
      "Orthographic",
    ])
    for (const char of "_SWISO") cad.press(char)
    cad.press("Enter")

    expect(direction(cad).x).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).y).toBeCloseTo(-1 / ROOT3, 12)
    expect(direction(cad).z).toBeCloseTo(1 / ROOT3, 12)
  })
})

describe("PLAN", () => {
  it("brings a view off the plan back to the plan", () => {
    const cad = createHarness()
    cad.command("VPOINT").type("1,-1,1").enter()

    cad.command("PLAN").option("World")

    expect(cad.runtime.viewport.isPlan).toBe(true)
  })
})

describe("the scene off the plan", () => {
  it("draws a circle as the ellipse its plane shows", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })

    cad.command("-VIEW").option("Orthographic").option("Front")
    const edgeOn = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "ellipse")
    expect(edgeOn?.kind === "ellipse" && edgeOn.radiusY).toBeLessThan(0.02)

    cad.command("VPOINT").type("1,-1,1").enter()
    const ellipse = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "ellipse")
    if (ellipse?.kind !== "ellipse") throw new Error("no ellipse")
    expect(ellipse.radiusY / ellipse.radiusX).toBeCloseTo(1 / ROOT3, 6)
  })

  it("draws an object's thickness: two faces and the edges between", () => {
    const line = withThickness(lineOf(p(0, 0), p(100, 0)), 30)
    const circle = withThickness(circleOf(p(300, 0), 40), 30)
    const cad = createHarness({ entities: [line, circle] })
    cad.press("F7")
    cad.command("VPOINT").type("1,-1,1").enter()

    const primitives = kinds(cad)
    const segments = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "segment")
    const joins = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      segments.some(
        (segment) =>
          segment.kind === "segment" &&
          Math.hypot(segment.a.x - a.x, segment.a.y - a.y) < 1e-6 &&
          Math.hypot(segment.b.x - b.x, segment.b.y - b.y) < 1e-6
      )

    expect(joins(screenOf(cad, 0, 0, 0), screenOf(cad, 100, 0, 0))).toBe(true)
    expect(joins(screenOf(cad, 0, 0, 30), screenOf(cad, 100, 0, 30))).toBe(true)
    expect(joins(screenOf(cad, 0, 0, 0), screenOf(cad, 0, 0, 30))).toBe(true)
    expect(joins(screenOf(cad, 100, 0, 0), screenOf(cad, 100, 0, 30))).toBe(
      true
    )
    expect(primitives.filter((kind) => kind === "ellipse").length).toBe(2)
  })

  it("draws a sloping line from end to end at their heights", () => {
    const line = withDeltaZ(lineOf(p(0, 0), p(100, 0)), 100)
    const cad = createHarness({ entities: [line] })
    cad.press("F7")
    cad.command("-VIEW").option("Orthographic").option("Front")

    const segment = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "segment")
    if (segment?.kind !== "segment") throw new Error("no segment")
    expect(segment.a).toBeCloseToPoint(screenOf(cad, 0, 0, 0), 9)
    expect(segment.b).toBeCloseToPoint(screenOf(cad, 100, 0, 100), 9)
  })

  it("leans a text with its plane", () => {
    const cad = createHarness({
      entities: [textOf(p(0, 0), "ABC", { height: 10 })],
    })
    cad.command("VPOINT").type("1,-1,1").enter()

    const text = cad
      .scene()
      .primitives.find((primitive) => primitive.kind === "text")
    if (text?.kind !== "text") throw new Error("no text")
    expect(text.matrix).toBeDefined()
    const [a, b] = text.matrix!
    const baseline = {
      x: screenOf(cad, 1, 0, 0).x - screenOf(cad, 0, 0, 0).x,
      y: screenOf(cad, 1, 0, 0).y - screenOf(cad, 0, 0, 0).y,
    }
    expect(Math.atan2(b, a)).toBeCloseTo(Math.atan2(baseline.y, baseline.x), 9)
  })

  it("keeps the plan's primitives, with no matrix on a text", () => {
    const cad = createHarness({
      entities: [
        withThickness(circleOf(p(0, 0), 40), 30),
        textOf(p(0, 0), "ABC", { height: 10 }),
      ],
    })

    const primitives = cad.scene().primitives
    expect(primitives.some((primitive) => primitive.kind === "circle")).toBe(
      true
    )
    const text = primitives.find((primitive) => primitive.kind === "text")
    expect(text?.kind === "text" && text.matrix).toBeUndefined()
  })

  it("outlines a raised object where the scene draws it", () => {
    const circle = withElevation(circleOf(p(0, 0), 50), 100)
    const cad = createHarness({ entities: [circle] })
    cad.command("VPOINT").type("1,-1,1").enter()

    const outline = entityScreenOutline(cad.runtime.viewport, circle).flat()
    const top = screenOf(cad, 0, 0, 100)
    const xs = outline.map((point) => point.x)
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(top.x, 6)
  })
})
