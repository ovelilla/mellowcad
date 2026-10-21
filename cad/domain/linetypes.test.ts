import { describe, expect, it } from "vitest"
import fc from "fast-check"
import {
  LINETYPES,
  centredPattern,
  linetypePattern,
  loopPattern,
} from "./linetypes"

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

describe("loopPattern", () => {
  // probes circle/p230–p232, measured on the plot: n = max(2, round(L / P))
  // whole periods, stretched; under one period solid.
  it("stretches a circle's pattern to whole periods, two at least", () => {
    const dashed = linetypePattern("Dashed")
    expect(loopPattern(dashed, 0.98 * 19.05)).toBeNull()
    expect(loopPattern(dashed, 19.05)?.periods).toBe(2)
    expect(loopPattern(dashed, 2.6 * 19.05)?.periods).toBe(3)
    const fitted = loopPattern(dashed, 62.83185307179586)
    expect(fitted?.periods).toBe(3)
    expect(fitted!.runs[0] * 3 + fitted!.runs[1] * 3).toBeCloseTo(
      62.83185307179586,
      9
    )
    expect(loopPattern([], 100)).toBeNull()
  })
})
