import { afterEach, describe, expect, it, vi } from "vitest"
import type { CircleEntity, LineEntity } from "../../domain/entities"
import {
  entityElevation,
  lineEndZ,
  lineStartZ,
  withElevation,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"

function seIsometric(cad: CadHarness): CadHarness {
  cad.command("-VIEW")
  for (const char of "_SEISO") cad.press(char)
  cad.press("Enter")
  return cad
}

function drawnLine(cad: CadHarness): LineEntity {
  const line = cad.latest()
  if (line.type !== "line") throw new Error(`expected a line, got ${line.type}`)
  return line
}

function labels(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.flatMap((primitive) =>
      primitive.kind === "label" ? [primitive.text] : []
    )
}

function angleField(cad: CadHarness) {
  return cad.state().dynamicInput?.fields.find((field) => field.id === "angle")
}

afterEach(() => {
  vi.useRealTimers()
})

describe("the polar +Z / -Z guide", () => {
  it("draws LINE up the UCS's Z, and a typed length runs along it", () => {
    const cad = seIsometric(createHarness())
    cad.press("F10")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 0, y: 0, z: 80 })

    expect(labels(cad)).toContain("Polar: 80.00mm < +Z")
    expect(angleField(cad)?.placeholder).toBe("+Z")
    expect(angleField(cad)?.unitSuffix).toBe("")
    cad.type("50").enter().escape()

    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineStartZ(line)).toBeCloseTo(0, 9)
    expect(lineEndZ(line)).toBeCloseTo(50, 9)
  })

  it("runs down it as -Z", () => {
    const cad = seIsometric(createHarness())
    cad.press("F10")

    cad.command("LINE").click({ x: 10, y: 20, z: 0 })
    cad.moveTo({ x: 10, y: 20, z: -60 })

    expect(labels(cad)).toContain("Polar: 60.00mm < -Z")
    cad.type("25").enter().escape()

    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(10, 20), 9)
    expect(lineEndZ(line)).toBeCloseTo(-25, 9)
  })

  it("is clicked to like any polar path", () => {
    const cad = seIsometric(createHarness())
    cad.press("F10")

    cad
      .command("LINE")
      .click({ x: 0, y: 0, z: 0 })
      .click({ x: 0, y: 0, z: 70 })
      .escape()

    expect(drawnLine(cad).end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(70, 9)
  })

  it("gives way to a polar angle of the plane drawn nearer the cursor", () => {
    const cad = seIsometric(createHarness())
    cad.runtime.constraints.setPolarAngleStep(90)
    cad.press("F10")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 }).click({ x: 10, y: 0, z: 2 })
    expect(drawnLine(cad).end).toBeCloseToPoint(p(8, 0), 9)
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(0, 9)

    cad.escape().command("LINE").click({ x: 0, y: 0, z: 0 })
    cad.click({ x: 2, y: 0, z: 10 }).escape()
    expect(drawnLine(cad).end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(9, 9)
  })

  it("rounds the height with PolarSnap, and the grid leaves it be", () => {
    const cad = seIsometric(createHarness())
    cad.press("F10")
    cad.runtime.snapMode.setType("polar")
    cad.runtime.snapMode.setPolarDistance(25)
    cad.runtime.snapMode.setActive(true)

    cad
      .command("LINE")
      .click({ x: 0, y: 0, z: 0 })
      .click({ x: 0, y: 0, z: 80 })
      .escape()
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(75, 9)

    cad.runtime.snapMode.setType("grid")
    cad.runtime.setSnapSpacing(25)
    cad
      .command("LINE")
      .click({ x: 0, y: 0, z: 0 })
      .click({ x: 0, y: 0, z: 80 })
      .escape()
    expect(drawnLine(cad).end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineEndZ(drawnLine(cad))).toBeCloseTo(80, 9)
  })
})

describe("Ortho in a 3D view", () => {
  it("locks to the UCS's Z when the cursor is high on the screen", () => {
    const cad = seIsometric(createHarness())
    cad.press("F8")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 6, y: 0, z: 40 })
    expect(angleField(cad)?.placeholder).toBe("+Z")
    cad.type("30").enter().escape()

    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineEndZ(line)).toBeCloseTo(30, 9)
  })

  it("locks to X or Y when the cursor is beside them", () => {
    const cad = seIsometric(createHarness())
    cad.press("F8")

    cad
      .command("LINE")
      .click({ x: 0, y: 0, z: 0 })
      .click({ x: 60, y: 0, z: 4 })
      .escape()

    const line = drawnLine(cad)
    expect(line.end.y).toBeCloseTo(0, 9)
    expect(lineEndZ(line)).toBeCloseTo(0, 9)
  })
})

describe("object snap tracking in a 3D view", () => {
  it("rises from an acquired endpoint, and a typed offset runs up it", () => {
    vi.useFakeTimers()
    const cad = seIsometric(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 0))], snap: true })
    )

    cad.command("LINE").moveTo({ x: 100, y: 0, z: 0 })
    vi.advanceTimersByTime(500)
    cad.moveTo({ x: 100, y: 0, z: 60 })

    const tracking = cad.state().dynamicInput?.fields[0]
    expect(tracking?.id).toBe("distance")
    expect(tracking?.placeholder).toBe("60.00")
    cad.type("40").enter().type("@10,0").enter().escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(100, 0), 9)
    expect(lineStartZ(line)).toBeCloseTo(40, 9)
    expect(lineEndZ(line)).toBeCloseTo(40, 9)
  })

  it("reads a guide of the plane on its point's plane, at its height", () => {
    vi.useFakeTimers()
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 50)
    const cad = seIsometric(createHarness({ entities: [raised], snap: true }))

    cad.command("LINE").moveTo({ x: 100, y: 0, z: 50 })
    vi.advanceTimersByTime(500)
    cad.moveTo({ x: 170, y: 0.5, z: 50 }).type("40").enter()
    cad.type("@0,10").enter().escape()

    const line = drawnLine(cad)
    expect(line.start).toBeCloseToPoint(p(140, 0), 9)
    expect(lineStartZ(line)).toBeCloseTo(50, 9)
  })
})

describe("a typed distance on the Z guide", () => {
  it("moves the selection up with MOVE", () => {
    const cad = seIsometric(
      createHarness({ entities: [circleOf(p(0, 0), 20, { id: "C" })] })
    )
    cad.press("F10")

    cad.select("C").command("MOVE").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 0, y: 0, z: 90 }).type("35").enter()

    const circle = cad.byId<CircleEntity>("C")
    expect(circle.center).toBeCloseToPoint(p(0, 0), 9)
    expect(entityElevation(circle)).toBeCloseTo(35, 9)
  })

  it("copies it down with COPY", () => {
    const cad = seIsometric(
      createHarness({ entities: [circleOf(p(0, 0), 20, { id: "C" })] })
    )
    cad.press("F10")

    cad.select("C").command("COPY").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 0, y: 0, z: -50 }).type("15").enter().escape()

    const copy = cad.latest()
    expect(copy.id).not.toBe("C")
    expect(entityElevation(copy)).toBeCloseTo(-15, 9)
    expect(entityElevation(cad.byId<CircleEntity>("C"))).toBe(0)
  })
})

describe("where there is no Z guide", () => {
  it("offers none in plan", () => {
    const cad = createHarness()
    cad.press("F10")

    cad.command("LINE").click(p(0, 0)).moveTo(p(0.5, 80))

    expect(labels(cad).some((label) => label.includes("Z"))).toBe(false)
    expect(angleField(cad)?.placeholder).toBe("90")
  })

  it("offers none in the plan of a tilted UCS", () => {
    const cad = createHarness()
    cad.command("-VIEW").option("Orthographic").option("Front")
    cad.press("F10")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 0.5, y: 0, z: 80 })

    expect(labels(cad).some((label) => label.includes("Z"))).toBe(false)
    cad.click({ x: 0.5, y: 0, z: 80 }).escape()
    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(0, 0), 9)
    expect(lineEndZ(line)).toBeCloseTo(80, 9)
  })

  it("follows a tilted UCS's own Z in a 3D view", () => {
    const cad = createHarness()
    cad.command("UCS").option("X").type("90").enter()
    cad.command("VPOINT").type("1,-1,1").enter()
    cad.runtime.constraints.setPolarAngleStep(90)
    cad.press("F10")

    cad.command("LINE").click({ x: 0, y: 0, z: 0 })
    cad.moveTo({ x: 0, y: -70, z: 0 })
    expect(labels(cad)).toContain("Polar: 70.00mm < +Z")
    cad.type("40").enter().escape()

    const line = drawnLine(cad)
    expect(line.end).toBeCloseToPoint(p(0, -40), 9)
    expect(lineEndZ(line)).toBeCloseTo(0, 9)
  })
})
