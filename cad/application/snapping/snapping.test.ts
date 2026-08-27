import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { SnapType } from "./types"
import { createHarness } from "../../../test/harness"
import { circleOf, lineOf, p } from "../../../test/builders"

/**
 * Object snapping decides where a pick *actually* lands, so it is both the most
 * valuable feature and the easiest to break invisibly: a wrong priority or a
 * missing visibility check only shows up as "my line ended up 2 mm off".
 *
 * Every test here draws a real segment and inspects the geometry that came out,
 * rather than poking at the snap engine's internals.
 */

const REFERENCE = lineOf(p(0, 0), p(100, 0), { id: "REF" })

describe("running object snaps", () => {
  it("pulls a pick onto a nearby endpoint", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
  })

  it("pulls a pick onto a midpoint", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").click(p(52, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(50, 0))
  })

  it("pulls a pick onto a circle's centre", () => {
    const cad = createHarness({
      entities: [circleOf(p(200, 200), 80, { id: "C1" })],
      snap: true,
    })

    cad.command("LINE").click(p(202, 202)).click(p(0, 0)).escape()

    expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(200, 200))
  })

  it("pulls a pick onto an intersection", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "H" }),
        lineOf(p(0, -100), p(0, 100), { id: "V" }),
      ],
      snap: true,
    })

    cad.command("LINE").click(p(3, 3)).click(p(200, 200)).escape()

    const drawn = cad
      .entities()
      .find(
        (e) => e.type === "line" && e.id !== "H" && e.id !== "V"
      ) as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(0, 0))
  })

  it("leaves the pick alone once snapping is off", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })
    cad.press("F3")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("never snaps to geometry on a hidden layer", () => {
    const cad = createHarness({ snap: true })
    const hidden = cad.runtime.createLayer("Hidden")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "REF", layerId: hidden }),
    ])
    cad.runtime.updateLayer(hidden, { visible: false })
    cad.runtime.setCurrentLayer("0")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("still snaps to geometry on a locked layer", () => {
    // Locked objects cannot be edited, but they remain valid reference points.
    const cad = createHarness({ snap: true })
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "REF", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })
    cad.runtime.setCurrentLayer("0")

    cad.command("LINE").click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
  })

  it("ships with AutoCAD's default running set", () => {
    const cad = createHarness()
    const enabled = cad.state().snapEnabled

    expect(enabled[SnapType.Endpoint]).toBe(true)
    expect(enabled[SnapType.Midpoint]).toBe(true)
    expect(enabled[SnapType.Center]).toBe(true)
    expect(enabled[SnapType.Intersection]).toBe(true)

    // The noisy ones are opt-in, exactly as in a fresh AutoCAD.
    expect(enabled[SnapType.Nearest]).toBe(false)
    expect(enabled[SnapType.Perpendicular]).toBe(false)
    expect(enabled[SnapType.Tangent]).toBe(false)
    expect(enabled[SnapType.Quadrant]).toBe(false)
    expect(enabled[SnapType.ApparentIntersection]).toBe(false)
    expect(enabled[SnapType.Extension]).toBe(false)
    expect(enabled[SnapType.Parallel]).toBe(false)
  })
})

describe("one-shot snap override", () => {
  it("forces a snap that is not in the running set", () => {
    // Perpendicular is off by default; the override must beat both the running
    // set and the higher-priority snaps that would otherwise win.
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "REF" })],
      snap: true,
    })

    cad.command("LINE").click(p(0, -100))
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.click(p(60, 0)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    // The foot of the perpendicular from (0, −100) is (0, 0): a vertical line.
    expect(drawn.end).toBeCloseToPoint(p(0, 0), 5)
  })

  it("is consumed by the pick it applied to", () => {
    const cad = createHarness({
      entities: [lineOf(p(-200, 0), p(200, 0), { id: "REF" })],
      snap: true,
    })

    cad.command("LINE").click(p(0, -100))
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.click(p(60, 0))

    expect(cad.state().snapOverride).toBeNull()
  })

  it("suppresses snapping entirely with None", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE")
    cad.runtime.setSnapOverride("none")
    cad.click(p(102, 2)).click(p(200, 200)).escape()

    const drawn = cad.entities().find((e) => e.id !== "REF") as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(102, 2))
  })

  it("is dropped by Escape", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Perpendicular)
    cad.escape()

    expect(cad.state().snapOverride).toBeNull()
  })
})

describe("snap markers", () => {
  it("reports the engaged snap so the UI can draw its glyph", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").moveTo(p(101, 1))

    expect(cad.state().snap?.type).toBe(SnapType.Endpoint)
    expect(cad.state().snap?.point).toBeCloseToPoint(p(100, 0))
  })

  it("reports nothing when the cursor is in open space", () => {
    const cad = createHarness({ entities: [REFERENCE], snap: true })

    cad.command("LINE").moveTo(p(400, 400))

    expect(cad.state().snap).toBeNull()
  })
})
