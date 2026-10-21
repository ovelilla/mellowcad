import { describe, expect, it } from "vitest"
import fc from "fast-check"
import { LINETYPES, centredPattern, linetypePattern } from "./linetypes"

describe("centredPattern", () => {
  // probe line/p207, measured on the plot of five lines.
  it("ends a line on two equal dashes, as AutoCAD lays it", () => {
    const hidden = linetypePattern("Hidden")
    expect(centredPattern(hidden, 100)?.offset).toBeCloseTo(6.35 - 5.55, 9)
    expect(centredPattern(hidden, 20)?.offset).toBeCloseTo(6.35 - 3.65, 9)
    // CELTSCALE 2: 8.725 at each end of a 100-unit line.
    const doubled = hidden.map((run) => run * 2)
    expect(centredPattern(doubled, 100)?.offset).toBeCloseTo(12.7 - 8.725, 9)
    // DASHDOT: 18.25, longer than its 12.7 dash.
    expect(centredPattern(linetypePattern("DashDot"), 100)).toEqual({
      offset: 0,
      lead: expect.closeTo(18.25 - 12.7, 9),
    })
  })

  it("leaves a line shorter than one period solid", () => {
    // probe line/p207: a 5-unit HIDDEN line.
    expect(centredPattern(linetypePattern("Hidden"), 5)).toBeNull()
    expect(centredPattern(linetypePattern("Hidden"), 9.525)).not.toBeNull()
    expect(centredPattern([], 100)).toBeNull()
  })

  it("is symmetric: the run ends on the dash it began with", () => {
    const patterned = LINETYPES.filter((linetype) => linetype.pattern.length)
    fc.assert(
      fc.property(
        fc.constantFrom(...patterned),
        fc.double({ min: 0.1, max: 2000, noNaN: true }),
        ({ pattern }, length) => {
          const layout = centredPattern(pattern, length)
          const period = pattern.reduce((sum, run) => sum + run, 0)
          if (length < period * (1 - 1e-9)) return layout === null
          if (!layout) return false
          const first = layout.lead + pattern[0] - layout.offset
          const into = (layout.offset + length - 2 * layout.lead) % period
          const last = into + layout.lead
          return (
            Math.abs(first - last) < 1e-6 &&
            first >= pattern[0] / 2 - 1e-9 &&
            first <= (period + pattern[0]) / 2 + 1e-9
          )
        }
      )
    )
  })
})
