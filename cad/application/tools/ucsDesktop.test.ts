import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import type { Entity } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive } from "../../scene/types"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The current UCS's origin and axes, as UCSORG, UCSXDIR and UCSYDIR. */
function axes(cad: CadHarness) {
  const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
  const round = (v: { x: number; y: number; z: number }) =>
    [v.x, v.y, v.z].map((n) => +n.toFixed(4) + 0)
  return { origin: round(origin), x: round(xAxis), y: round(yAxis) }
}

const labels = (cad: CadHarness) =>
  cad.state().dynamicInput?.fields.map((field) => field.label)

const ORIGIN =
  "Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:"

const band = (cad: CadHarness) =>
  cad
    .scene()
    .primitives.filter(
      (prim): prim is Extract<ScenePrimitive, { kind: "segment" }> =>
        prim.kind === "segment" &&
        prim.stroke.color === THEME.dashedRubberBand &&
        prim.stroke.dash !== undefined
    )

// AutoCAD 2027's desktop, the UCS review's block UCD (DYNMODE 3).
describe("UCS's dynamic input (desktop ucs/d04-6, d04-8)", () => {
  it("shows the length and angle from the base, a typed point read from it", () => {
    const cad = createHarness()
    cad.command("UCS").moveTo(p(60, 35))
    expect(labels(cad)).toEqual(["Length", "Angle"])
    cad.click(p(20, 10)).moveTo(p(60, 30))
    expect(labels(cad)).toEqual(["Length", "Angle"])
    // d04-8: `30,0` in the box at X's prompt is `@30,0` from the new origin.
    cad.type("30,0").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Specify point on X-axis or <accept>: @30,0"
    )
    expect(labels(cad)).toEqual(["Length", "Angle"])
    cad.enter()
    expect(axes(cad)).toEqual({
      origin: [20, 10, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
  })

  it("echoes `@30,0` at the first prompt (d04-6)", () => {
    const cad = createHarness()
    cad.command("UCS").moveTo(p(60, 35)).type("30,0").enter()
    expect(cad.commandLog().at(-1)).toBe(`${ORIGIN} @30,0`)
    cad.enter()
    expect(axes(cad).origin).toEqual([30, 0, 0])
  })

  // probe ucs/p442: in a UCS at 20,10 `@10,0` puts the origin at the WCS's
  // 10,0 and `@` at its origin — from LASTPOINT, which UCS puts at the WCS's
  // origin as it starts —, while the band and the box's reading measure from
  // the UCS's origin (d04-5, d04-6).
  it("reads `@` at the first prompt from LASTPOINT, not from the band's base", () => {
    const moved = () => answer(createHarness(), "UCS", "20,10", "", "")
    const at = moved()
    answer(at, "UCS", "@10,0", "")
    expect(axes(at).origin).toEqual([10, 0, 0])
    answer(at, "ID", "@")
    expect(at.commandLog().at(-1)).toBe(" X = 0.00     Y = 0.00     Z = 0.00")

    const bare = moved()
    answer(bare, "UCS", "@", "")
    expect(axes(bare).origin).toEqual([0, 0, 0])

    // The box's relative `10,0` is that `@10,0`.
    const box = moved()
    box.command("UCS").moveTo(p(60, 35)).type("10,0").enter()
    expect(box.commandLog().at(-1)).toBe(`${ORIGIN} @10,0`)
    box.enter()
    expect(axes(box).origin).toEqual([10, 0, 0])

    // ZAxis's origin prompt alike.
    const zAxis = moved()
    answer(zAxis, "UCS", "ZA", "@10,0", "")
    expect(axes(zAxis).origin).toEqual([10, 0, 0])
  })

  it("takes a length and an angle from the base", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "20,10")
    cad.command("UCS").moveTo(p(60, 35))
    cad.type("10", "distance").type("90", "angle").enter().enter()
    expect(axes(cad).origin).toEqual([20, 20, 0])

    // ZAxis's point on Z, `0,0,5` from its origin.
    cad.command("UCS").option("ZAxis").click(p(40, 40)).moveTo(p(60, 60))
    expect(labels(cad)).toEqual(["Length", "Angle"])
    cad.type("0,0,5").enter()
    expect(axes(cad).origin).toEqual([40, 40, 0])
    expect(axes(cad).x).toEqual([1, 0, 0])
  })

  it("keeps the command line's points absolute", () => {
    const cad = createHarness()
    answer(cad, "UCS", "ZA", "20,10", "20,10,5")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify point on positive portion of Z-axis <20.00,10.00,1.00>: 20,10,5"
    )
    expect(axes(cad)).toEqual({
      origin: [20, 10, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
  })
})

describe("UCS's jig (desktop ucs/d04-1 to d04-5)", () => {
  const from = (cad: CadHarness, world: { x: number; y: number }) => {
    const segments = band(cad)
    expect(segments).toHaveLength(1)
    expect(segments[0].a).toBeCloseToPoint(cad.toScreen(p(world.x, world.y)))
    expect(segments[0].b).toBeCloseToPoint(cad.toScreen(p(60, 35)))
  }

  it("draws a dashed band from the base at every point prompt", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "20,10")
    // The first prompt and ZAxis's origin: from the current UCS's origin.
    cad.command("UCS").moveTo(p(60, 35))
    from(cad, p(20, 10))
    // X and XY: from the new origin.
    cad.click(p(30, 20)).moveTo(p(60, 35))
    from(cad, p(30, 20))
    cad.click(p(50, 20)).moveTo(p(60, 35))
    from(cad, p(30, 20))
    cad.escape()

    cad.command("UCS").option("ZAxis").moveTo(p(60, 35))
    from(cad, p(20, 10))
    cad.click(p(40, 0)).moveTo(p(60, 35))
    from(cad, p(40, 0))
    cad.escape()

    // The rotation's angle: from the UCS's origin.
    cad.command("UCS").option("Z").moveTo(p(60, 35))
    from(cad, p(20, 10))
    cad.escape()
  })
})

describe("OBject's hover (desktop ucs/d06-1 to d06-7)", () => {
  const withLocked = (entities: Entity[]): CadHarness => {
    const cad = createHarness()
    cad.runtime.document.load(entities, {
      layers: [layerOf("0"), layerOf("LK", { locked: true })],
    })
    return cad
  }
  const drawn = (cad: CadHarness, color: string) =>
    cad
      .scene()
      .primitives.some(
        (prim) => prim.kind === "segment" && prim.stroke.color === color
      )
  const padlock = (cad: CadHarness) =>
    cad
      .scene()
      .primitives.some(
        (prim) => prim.kind === "rect" && prim.fill === THEME.lockedBadge
      )

  it("glows as the selection at OBject, a locked object with the padlock", () => {
    const cad = withLocked([
      lineOf(p(10, 30), p(60, 40), { id: "LK", layerId: "LK" }),
      lineOf(p(10, -30), p(60, -30)),
    ])
    cad.command("UCS").option("OBject").moveTo(p(150, 150))
    expect(drawn(cad, THEME.selected)).toBe(false)
    // d06-1: an unlocked line, the selection's glow.
    cad.moveTo(p(35, -30))
    expect(drawn(cad, THEME.selected)).toBe(true)
    expect(drawn(cad, THEME.entityHover)).toBe(false)
    expect(padlock(cad)).toBe(false)
    // d06-2: a locked one glows too, under the padlock.
    cad.moveTo(p(35, 35))
    expect(drawn(cad, THEME.selected)).toBe(true)
    expect(padlock(cad)).toBe(true)
    cad.escape()

    // d06-6, d06-7: ZAxis Object's is the white rollover, a locked one the
    // padlock alone.
    cad.command("UCS").option("ZAxis").option("Object").moveTo(p(35, -30))
    expect(drawn(cad, THEME.entityHover)).toBe(true)
    expect(drawn(cad, THEME.selected)).toBe(false)
    expect(padlock(cad)).toBe(false)
    cad.moveTo(p(35, 35))
    expect(drawn(cad, THEME.entityHover)).toBe(false)
    expect(padlock(cad)).toBe(true)
    cad.escape()
  })
})

describe("NAmed's names (desktop ucs/d05)", () => {
  it("takes a space typed key by key, saved and restored whole", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "5,5", "UCS", "NA", "S")
    for (const key of "AB CD") cad.press(key)
    cad.press("Enter")
    expect(
      cad.runtime.document.getSettings().namedUcs.map((entry) => entry.name)
    ).toEqual(["AB CD"])
    expect(cad.commandLog().at(-1)).toBe(
      "Enter name to save current UCS or [?]: AB CD"
    )

    answer(cad, "UCS", "W", "UCS", "NA", "R")
    for (const key of "AB CD") cad.press(key)
    cad.press(" ")
    // A space after the name is part of it until Enter, as AutoCAD's string.
    cad.press("Backspace")
    cad.press("Enter")
    expect(cad.runtime.document.getSettings().ucsName).toBe("AB CD")
    expect(cad.state().commandLine.takesSpaces).toBe(false)
  })

  it("says the command line takes a space only at those prompts", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "S")
    expect(cad.state().commandLine.takesSpaces).toBe(true)
    cad.escape()
    answer(cad, "UCS", "NA", "D")
    expect(cad.state().commandLine.takesSpaces).toBe(false)
  })
})
