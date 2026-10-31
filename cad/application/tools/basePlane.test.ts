import { afterEach, describe, expect, it, vi } from "vitest"
import type { Vec3 } from "../../geometry/Vec3"
import {
  createLine,
  lineEndZ,
  lineStartZ,
  type Entity,
  type LineEntity,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"

/**
 * A drawing aid from a base point at another height than the work plane, as
 * AutoCAD 2027's desktop does it (scripts/research/probes/interaction3d/
 * dsk.sh, d01–d09): the bare cursor is on the work plane, but Ortho, Polar,
 * the grid under them and `<angle` read it where the line of sight meets the
 * base point's plane, and give the base point's Z; OTRACK reads it on the
 * acquired point's plane. The pointer is put on a world point's pixel, as the
 * desktop pass did.
 */

const BASE = "0,100,50"

function seIsometric(
  entities: readonly Entity[] = [],
  snap = false
): CadHarness {
  const cad = createHarness({ entities, snap })
  cad.command("-VIEW")
  for (const char of "_SEISO") cad.press(char)
  cad.press("Enter")
  return cad
}

function drawn(cad: CadHarness): LineEntity {
  const line = cad.latest()
  if (line.type !== "line") throw new Error(`expected a line, got ${line.type}`)
  return line
}

function endOf(cad: CadHarness): Vec3 {
  const line = drawn(cad)
  return { ...line.end, z: lineEndZ(line) }
}

function expectAt(actual: Vec3, expected: Vec3) {
  expect(actual.x).toBeCloseTo(expected.x, 6)
  expect(actual.y).toBeCloseTo(expected.y, 6)
  expect(actual.z).toBeCloseTo(expected.z, 6)
}

function labels(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.flatMap((primitive) =>
      primitive.kind === "label" ? [primitive.text] : []
    )
}

/** LINE from {@link BASE}, the pointer on `at`'s pixel, a click there. */
function fromBase(cad: CadHarness, at: Vec3, typed?: string): Vec3 {
  cad.command("LINE").type(BASE).enter()
  if (typed !== undefined) cad.type(typed).enter()
  cad.click(at).escape()
  return endOf(cad)
}

afterEach(() => {
  vi.useRealTimers()
})

describe("Polar from a base point at another height", () => {
  it("engages where its path is drawn and keeps the base point's Z (the owner's report)", () => {
    const cad = seIsometric()
    cad.press("F10")
    cad.command("LINE").type("0,0,0").enter()
    cad.type("100<90").enter()
    cad.moveTo({ x: 0, y: 100, z: 80 }).type("50").enter()

    cad.moveTo({ x: 60, y: 100, z: 50 })
    expect(labels(cad)).toContain("Polar: 60.00mm < 0°")
    cad.click({ x: 60, y: 100, z: 50 }).escape()

    expectAt(endOf(cad), { x: 60, y: 100, z: 50 })
    expect(lineStartZ(drawn(cad))).toBeCloseTo(50, 9)
  })

  it("does not engage over its image on the work plane, and the click lands there (d01, d02)", () => {
    const cad = seIsometric()
    cad.press("F10")
    cad.command("LINE").type(BASE).enter()
    cad.moveTo({ x: 60, y: 100, z: 0 })
    expect(labels(cad).some((label) => label.startsWith("Polar"))).toBe(false)
    cad.click({ x: 60, y: 100, z: 0 }).escape()
    expectAt(endOf(cad), { x: 60, y: 100, z: 0 })
  })

  it("puts the point at the foot in the base point's plane (d04)", () => {
    const cad = seIsometric()
    cad.press("F10")
    expectAt(fromBase(cad, { x: 100, y: 101, z: 50 }), {
      x: 100,
      y: 100,
      z: 50,
    })
  })

  it("keeps the base point's Z in plan (d07)", () => {
    const cad = createHarness()
    cad.press("F10")
    expectAt(fromBase(cad, { x: 60, y: 101, z: 0 }), { x: 60, y: 100, z: 50 })
  })
})

describe("Ortho from a base point at another height", () => {
  it("reads the cursor where its line of sight is at the base point's Z (d03)", () => {
    const cad = seIsometric()
    cad.press("F8")
    // 80,100,0 is drawn where 130,50,50 is: Ortho's X from there.
    expectAt(fromBase(cad, { x: 80, y: 100, z: 0 }), { x: 130, y: 100, z: 50 })
  })

  it("keeps the base point's Z in plan (d07)", () => {
    const cad = createHarness()
    cad.press("F8")
    expectAt(fromBase(cad, { x: 70, y: 115, z: 0 }), { x: 70, y: 100, z: 50 })
  })

  it("is what Shift turns on", () => {
    const cad = seIsometric()
    cad.command("LINE").type(BASE).enter()
    cad.click({ x: 80, y: 100, z: 0 }, { shiftKey: true }).escape()
    expectAt(endOf(cad), { x: 130, y: 100, z: 50 })
  })
})

describe("the grid and an angle from a base point at another height", () => {
  it("rounds the base plane's cursor under Ortho, the work plane's alone (d05)", () => {
    const cad = seIsometric()
    cad.runtime.setSnapSpacing(10)
    cad.runtime.snapMode.setActive(true)
    cad.press("F8")
    expectAt(fromBase(cad, { x: 83, y: 100, z: 0 }), { x: 130, y: 100, z: 50 })
    cad.press("F8")
    expectAt(fromBase(cad, { x: 83, y: 100, z: 0 }), { x: 80, y: 100, z: 0 })
  })

  it("reads `<0` on the base plane (d05)", () => {
    const cad = seIsometric()
    expectAt(fromBase(cad, { x: 83, y: 100, z: 0 }, "<0"), {
      x: 133,
      y: 100,
      z: 50,
    })
  })
})

describe("OTRACK from a point acquired at another height", () => {
  it("puts the point at the foot in that point's plane (d04)", () => {
    vi.useFakeTimers()
    const post = createLine(
      { x: 0, y: 100, z: 0 },
      { x: 0, y: 100, z: 50 },
      "0"
    )
    const cad = seIsometric([post], true)

    cad.command("LINE").moveTo({ x: 0, y: 100, z: 50 })
    vi.advanceTimersByTime(500)
    cad.moveTo({ x: 30, y: 100.1, z: 50 })
    cad.click({ x: 40, y: 100.25, z: 50 }).type("@10,0,0").enter().escape()

    const line = drawn(cad)
    expectAt({ ...line.start, z: lineStartZ(line) }, { x: 40, y: 100, z: 50 })
  })
})

describe("a grip dragged from a point at another height", () => {
  it("is held to Polar's path at the grip's Z", () => {
    const raised = createLine(
      { x: 200, y: 0, z: 50 },
      { x: 240, y: 0, z: 50 },
      "0",
      "R"
    )
    const cad = seIsometric([raised])
    cad.press("F10")
    cad.select("R")
    cad.click({ x: 240, y: 0, z: 50 })
    cad.click({ x: 300, y: 0.25, z: 50 }).escape()

    const line = cad.byId<LineEntity>("R")
    expectAt({ ...line.end, z: lineEndZ(line) }, { x: 300, y: 0, z: 50 })
  })
})
