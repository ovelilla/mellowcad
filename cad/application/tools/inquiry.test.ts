import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { withElevation } from "../../domain/entities"
import type { ScenePrimitive } from "../../scene/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { deg, lineOf, p } from "../../../test/builders"

/**
 * The inquiry and distribution commands. MEASURE creates no geometry at all —
 * its whole output is the on-screen readout — so the scene's label primitives
 * are its observable contract. ARRAYPATH is the opposite: it consumes the
 * source objects and redistributes them along a curve.
 */

function readout(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.filter(
      (primitive): primitive is Extract<ScenePrimitive, { kind: "label" }> =>
        primitive.kind === "label"
    )
    .map((label) => label.text)
}

describe("DIST", () => {
  it("reports distance, angle and the deltas between two picks", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+300\.00 mm/.test(line))).toBe(true)
    expect(lines.some((line) => /Angle\s+0\.00°/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔX\s+300\.00/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔY\s+0\.00/.test(line))).toBe(true)
  })

  it("measures a diagonal", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 400))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+500\.00 mm/.test(line))).toBe(true)
    expect(
      lines.some((line) => new RegExp(`Angle\\s+53\\.13°`).test(line))
    ).toBe(true)
  })

  it("creates no geometry", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(cad.entityCount).toBe(0)
  })

  it("follows the document's unit and precision", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(0)

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(readout(cad).some((line) => /Dist\s+300 mm/.test(line))).toBe(true)
  })

  it("keeps measuring until Escape", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))
    expect(cad.activeToolId()).toBe("measure")

    cad.escape()
    expect(cad.activeToolId()).toBe("select")
  })

  it("writes AutoCAD's report at the command prompt", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 400))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 500.00,  Angle in XY Plane = 53.13,  Angle from XY Plane = 0.00\n" +
        "Delta X = 300.00,  Delta Y = 400.00,   Delta Z = 0.00"
    )
  })

  it("measures in 3D, putting a typed point without a Z at the elevation", () => {
    const cad = createHarness()
    cad.command("ELEV").type("5").enter().type("0").enter()

    cad.command("DIST").type("0,0,-7").enter().type("3,4").enter()

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 13.00,  Angle in XY Plane = 53.13,  Angle from XY Plane = 67.38\n" +
        "Delta X = 3.00,  Delta Y = 4.00,   Delta Z = 12.00"
    )
    expect(readout(cad)).toContain("ΔZ    12.00")
  })

  it("takes a snapped point's Z from the object", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("DIST").click(p(100, 0)).click(p(100, 50))

    // Below the XY plane the angle reads the way AutoCAD's do, from 0 to 360.
    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 50.99,  Angle in XY Plane = 90.00,  Angle from XY Plane = 348.69\n" +
        "Delta X = 0.00,  Delta Y = 50.00,   Delta Z = -10.00"
    )
  })

  it("reads the deltas and the angle in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("90").enter()

    cad.command("DIST").click(p(0, 0)).click(p(0, 100))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 100.00,  Angle in XY Plane = 0.00,  Angle from XY Plane = 0.00\n" +
        "Delta X = 100.00,  Delta Y = 0.00,   Delta Z = 0.00"
    )
  })

  it("ends on Enter at the first point", () => {
    const cad = createHarness()

    cad.command("DIST").enter()

    expect(cad.activeToolId()).toBe("select")
  })
})

describe("ID", () => {
  it("reports a typed point's X, Y and Z in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,3").enter().enter()

    cad.command("ID").type("1,2,3").enter()

    expect(cad.commandLog().at(-1)).toBe("X = 1.00     Y = 2.00     Z = 3.00")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(0)
  })

  it("takes the Z of the object snapped to, and the elevation otherwise", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("ID").click(p(100, 0))
    expect(cad.commandLog().at(-1)).toBe(
      "X = 100.00     Y = 0.00     Z = 10.00"
    )

    cad.command("ELEV").type("4").enter().type("0").enter()
    cad.command("ID").click(p(50, 80))
    expect(cad.commandLog().at(-1)).toBe("X = 50.00     Y = 80.00     Z = 4.00")
  })
})

describe("AREA", () => {
  it("reports the area and perimeter of the picked polygon", () => {
    const cad = createHarness()

    cad
      .command("AREA")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .click(p(0, 100))
      .enter()

    const lines = readout(cad)
    expect(lines.some((line) => /Area\s+10000\.00 mm²/.test(line))).toBe(true)
    expect(lines.some((line) => /Perim\s+400\.00 mm/.test(line))).toBe(true)
  })

  it("offers an Undo keyword while collecting points", () => {
    const cad = createHarness()

    cad.command("AREA").click(p(0, 0)).click(p(100, 0))
    expect(cad.optionAbbreviations()).toEqual(["U"])

    // Step back over the mistaken vertex and replace it.
    cad
      .option("Undo")
      .click(p(200, 0))
      .click(p(200, 100))
      .click(p(0, 100))
      .enter()

    expect(readout(cad).some((line) => /Area\s+20000\.00 mm²/.test(line))).toBe(
      true
    )
  })

  it("needs at least three points to close a shape", () => {
    const cad = createHarness()

    cad.command("AREA").click(p(0, 0)).click(p(100, 0)).enter()

    expect(cad.activeToolId()).toBe("select")
    expect(readout(cad).some((line) => /Area/.test(line))).toBe(false)
  })
})

describe("ARRAYPATH", () => {
  const path = lineOf(p(0, 0), p(200, 0), { id: "PATH" })
  const source = lineOf(p(400, -25), p(400, 25), { id: "SRC" })

  it("divides the path into evenly spaced items", () => {
    const cad = createHarness({ entities: [path, source] })

    cad
      .select("SRC")
      .command("ARRAYPATH")
      .click(p(100, 0)) // pick the path curve
      .type("5")
      .enter()

    // Five items plus the path itself; the source has been redistributed.
    expect(cad.entityCount).toBe(6)
    expect(cad.runtime.document.has("SRC")).toBe(false)
    expect(cad.runtime.document.has("PATH")).toBe(true)

    const centres = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line" && e.id !== "PATH")
      .map((line) => (line.start.x + line.end.x) / 2)
      .sort((a, b) => a - b)
    expect(centres).toHaveLength(5)
    for (const [index, x] of centres.entries()) {
      expect(x).toBeCloseTo(index * 50, 5)
    }
  })

  it("places items at a fixed spacing under the Measure method", () => {
    const cad = createHarness({ entities: [path, source] })

    cad
      .select("SRC")
      .command("ARRAYPATH")
      .click(p(100, 0))
      .option("Method") // Method: Divide → Measure
      .type("40")
      .enter()

    // 0, 40, 80, 120, 160, 200 → six items, plus the path.
    expect(cad.entityCount).toBe(7)
  })

  it("restores the source in a single undo step", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0)).type("5").enter()
    cad.undo()

    expect(cad.entityCount).toBe(2)
    expect(cad.runtime.document.has("SRC")).toBe(true)
  })

  it("aligns items to the curve's tangent, unless told not to", () => {
    const arcPath = {
      id: "PATH",
      type: "arc" as const,
      layerId: "0",
      center: p(0, 0),
      radius: 150,
      startAngle: 0,
      endAngle: deg(180),
    }
    const aligned = createHarness({ entities: [arcPath, source] })

    aligned
      .select("SRC")
      .command("ARRAYPATH")
      .click(p(150, 0))
      .type("3")
      .enter()

    const orientations = aligned
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
      .map((line) => Math.abs(line.end.x - line.start.x) < 1e-6)
    // Following a semicircle, the items cannot all keep one orientation.
    expect(new Set(orientations).size).toBeGreaterThan(1)

    const free = createHarness({ entities: [arcPath, source] })
    free
      .select("SRC")
      .command("ARRAYPATH")
      .click(p(150, 0))
      .option("Align items") // Align items: Yes → No
      .type("3")
      .enter()

    const unrotated = free
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(unrotated).toHaveLength(3)
    for (const line of unrotated) {
      expect(line.start.x).toBeCloseTo(line.end.x, 6)
    }
  })

  it("cancels without touching the drawing", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(2)
    expect(cad.runtime.document.has("SRC")).toBe(true)
  })
})
