import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../test/harness"

/**
 * What is drawn in a UCS turned upside down (`_UCS _X 180`, its Z the WCS's
 * -Z) keeps -Z as its normal, as AutoCAD 2027 stores it (probe list/p126),
 * and is still filled and picked as a plane seen square on: AutoCAD fills a
 * 2D solid or a wide polyline "parallel to the current viewing direction",
 * either way along it.
 */

function run(...texts: string[]): CadHarness {
  const cad = createHarness()
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function filled(cad: CadHarness): number {
  cad.moveTo({ x: 500, y: 500 })
  return cad
    .scene()
    .primitives.filter((p) => p.kind === "path" && p.fill !== undefined).length
}

describe("an object drawn in a UCS turned upside down", () => {
  it("keeps -Z as its normal (list/p126)", () => {
    const cad = run("_UCS", "_X", "180", "_CIRCLE", "0,0", "5")
    const normal = cad.latest()?.normal
    expect(normal?.z).toBe(-1)
    expect(Math.abs(normal?.x ?? 1)).toBeLessThan(1e-12)
    expect(Math.abs(normal?.y ?? 1)).toBeLessThan(1e-12)
  })

  it("fills a 2D solid and picks it inside, in that UCS and in the WCS", () => {
    const cad = run(
      "_UCS",
      "_X",
      "180",
      "_SOLID",
      "0,0",
      "100,0",
      "0,50",
      "100,50",
      ""
    )
    cad.escape()
    expect(filled(cad)).toBe(1)
    cad.click({ x: 50, y: -20 })
    expect(cad.selectedIds()).toHaveLength(1)
    cad.escape()
    cad.runtime.setCommandLineText("_UCS")
    cad.runtime.submitCommandLine()
    cad.runtime.setCommandLineText("_W")
    cad.runtime.submitCommandLine()
    expect(filled(cad)).toBe(1)
    cad.click({ x: 50, y: -20 })
    expect(cad.selectedIds()).toHaveLength(1)
  })

  it("fills a wide polyline", () => {
    const cad = run(
      "_UCS",
      "_X",
      "180",
      "_PLINE",
      "0,0",
      "_W",
      "20",
      "20",
      "100,0",
      ""
    )
    cad.escape()
    expect(filled(cad)).toBeGreaterThan(0)
  })
})
