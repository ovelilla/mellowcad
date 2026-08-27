import { describe, expect, it } from "vitest"
import { V } from "../../geometry/Vec2"
import {
  HatchEntity,
  createHatch,
  hatchGeometry,
  hatchLoopFromEntity,
  mirrorEntity,
  translateEntity,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_PATTERN_ID,
  SOLID_HATCH_PATTERN_ID,
} from "../../domain/hatchPatterns"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import {
  circleOf,
  deg,
  lineOf,
  loopOf,
  p,
  rectOf,
} from "../../../test/builders"
import { createHarness } from "../../../test/harness"

/** The square boundary most of these tests hatch. */
const SQUARE = rectOf(p(0, 0), p(100, 100), { id: "sq" })

function hatchOnly(entities: readonly { type: string }[]): HatchEntity {
  const hatch = entities.find((e) => e.type === "hatch")
  expect(hatch).toBeDefined()
  return hatch as unknown as HatchEntity
}

describe("HATCH boundary by Select objects", () => {
  it("fills one selected closed polyline with the default pattern", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").click(p(50, 0)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(hatch.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
    // HPNAME / HPSCALE / HPANG initial values.
    expect(hatch.patternId).toBe(DEFAULT_HATCH_PATTERN_ID)
    expect(hatch.patternScale).toBe(1)
    expect(hatch.patternAngle).toBe(0)
    expect(h.activeToolId()).toBe("select")
  })

  it("turns a circle into a two-vertex loop of semicircle bulges", () => {
    const h = createHarness({ entities: [circleOf(p(0, 0), 50, { id: "c" })] })
    h.command("HATCH").click(p(50, 0)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops[0].vertices).toBeCloseToPoints([p(50, 0), p(-50, 0)])
    expect(hatch.loops[0].bulges).toEqual([1, 1])
    // The ring closes: its extent is the whole circle, not just the top half.
    const ring = hatchGeometry(hatch).rings[0]
    const ys = ring.map((v) => v.y)
    expect(Math.min(...ys)).toBeCloseTo(-50, 1)
    expect(Math.max(...ys)).toBeCloseTo(50, 1)
  })

  it("makes one hatch out of several boundaries (HPSEPARATE 0)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH").click(p(50, 0)).click(p(250, 0)).enter()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("picks boundaries with a crossing box too", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH").drag(p(400, 50), p(-50, 50)).enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("ignores objects that do not close an area", () => {
    const h = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    h.command("HATCH").click(p(50, 0)).enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })

  it("only rolls over objects it can hatch", () => {
    const h = createHarness({
      entities: [SQUARE, lineOf(p(0, 200), p(100, 200), { id: "l" })],
    })
    h.command("HATCH")
    const hovers = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.entityHover
      }).length

    h.moveTo(p(50, 200))
    expect(hovers()).toBe(0)
    h.moveTo(p(50, 0))
    expect(hovers()).toBeGreaterThan(0)
  })

  it("previews the fill while the boundary set is being built", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
    const previews = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.preview
      }).length

    expect(previews()).toBe(0)
    h.click(p(50, 0))
    expect(previews()).toBeGreaterThan(0)
  })

  it("stays behind its boundary (HPDRAWORDER 3), for the eye and for the pick", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p").type("SOLID").enter()
    h.click(p(50, 0)).enter()

    // Painted first, so the fill never covers the outline it was traced from.
    const kinds = h.scene().primitives.map((prim) => prim.kind)
    expect(kinds.indexOf("path")).toBeLessThan(kinds.lastIndexOf("path"))
    const filled = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && prim.fill)
    const outline = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && !prim.fill)
    expect(filled).toBeLessThan(outline)

    // And a click on the boundary still takes the boundary, not the fill.
    h.click(p(50, 0))
    expect(h.selectedIds()).toEqual(["sq"])
  })

  it("undoes the whole hatch in one step", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").click(p(50, 0)).enter()
    expect(h.typeCounts().hatch).toBe(1)

    h.undo()
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.typeCounts().polyline).toBe(1)
  })

  it("creates nothing when Escape ends the command", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").click(p(50, 0)).escape()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })
})

describe("HATCH Properties", () => {
  it("asks for the pattern name preloaded with the current one", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p")

    const fields = h.state().dynamicInput?.fields ?? []
    expect(fields).toHaveLength(1)
    expect(fields[0].value).toBe("ANSI31")
  })

  it("skips the scale and angle prompts for a solid fill", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p").type("SOLID").enter()

    // Back at the keyword-only Select prompt: no field, the Properties chip.
    expect(h.state().dynamicInput?.fields ?? []).toHaveLength(0)
    expect(h.optionKeys()).toEqual(["P"])

    h.click(p(50, 0)).enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternId).toBe(SOLID_HATCH_PATTERN_ID)
    expect(hatchGeometry(hatch).solid).toBe(true)
  })

  it("asks for a scale then an angle for a real pattern", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p").type("ANSI31").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify a scale for pattern"
    )

    h.type("20").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify an angle for pattern"
    )

    h.type("30").enter().click(p(50, 0)).enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternScale).toBe(20)
    expect(hatch.patternAngle).toBeCloseToAngle(deg(30))
  })

  it("keeps the settings for the next hatch (HPNAME/HPSCALE/HPANG last a session)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("p")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("0")
      .enter()
      .click(p(50, 0))
      .enter()

    h.command("HATCH").click(p(250, 0)).enter()
    const hatches = h.entities().filter((e) => e.type === "hatch")
    expect(hatches).toHaveLength(2)
    expect((hatches[1] as HatchEntity).patternScale).toBe(20)
  })

  it("re-asks and reports an unknown pattern name", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p").type("NOPE").enter()

    expect(h.commandLog().some((line) => line.includes("NOPE"))).toBe(true)
    expect(h.state().dynamicInput?.fields[0].label).toBe("Enter a pattern name")
  })

  it("lists the patterns for ?", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("p").type("?").enter()

    expect(h.commandLog().some((line) => line.includes("ANSI31"))).toBe(true)
    expect(h.state().dynamicInput?.fields[0].label).toBe("Enter a pattern name")
  })
})

describe("hatch pattern geometry", () => {
  const hatchAt = (
    scale: number,
    angle = 0,
    loops = [loopOf(p(0, 0), p(100, 100))]
  ) =>
    hatchGeometry(
      createHatch(loops, { patternScale: scale, patternAngle: angle })
    )

  it("draws ANSI31 as a family of 45° lines spaced by 0.125 × the scale", () => {
    const g = hatchAt(20)
    expect(g.solid).toBe(false)
    expect(g.lines.length).toBeGreaterThan(10)

    for (const [a, b] of g.lines) {
      const dir = V.normalize(V.sub(b, a))
      expect(Math.abs(dir.x - dir.y)).toBeLessThan(1e-9) // 45°
      for (const point of [a, b]) {
        expect(point.x).toBeGreaterThanOrEqual(-1e-9)
        expect(point.x).toBeLessThanOrEqual(100 + 1e-9)
        expect(point.y).toBeGreaterThanOrEqual(-1e-9)
        expect(point.y).toBeLessThanOrEqual(100 + 1e-9)
      }
    }

    // Perpendicular spacing between neighbouring lines = 0.125 × 20.
    const normal = { x: -Math.SQRT1_2, y: Math.SQRT1_2 }
    const offsets = g.lines.map(([a]) => V.dot(a, normal)).sort((x, y) => x - y)
    const gaps = offsets
      .slice(1)
      .map((value, i) => value - offsets[i])
      .filter((gap) => gap > 1e-6)
    expect(Math.min(...gaps)).toBeCloseTo(2.5, 6)
  })

  it("halving the scale doubles the number of lines", () => {
    expect(hatchAt(10).lines.length).toBeGreaterThan(
      hatchAt(20).lines.length * 1.8
    )
  })

  it("rotates the whole family with HPANG", () => {
    for (const [a, b] of hatchAt(20, deg(45)).lines) {
      const dir = V.normalize(V.sub(b, a))
      // 45° pattern line + 45° HPANG = vertical.
      expect(Math.abs(dir.x)).toBeLessThan(1e-9)
    }
  })

  it("leaves an island unfilled (the even-odd rule)", () => {
    const g = hatchAt(20, 0, [
      loopOf(p(0, 0), p(100, 100)),
      loopOf(p(40, 40), p(60, 60)),
    ])
    for (const [a, b] of g.lines) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const point = V.lerp(a, b, t)
        const insideHole =
          point.x > 40 + 1e-6 &&
          point.x < 60 - 1e-6 &&
          point.y > 40 + 1e-6 &&
          point.y < 60 - 1e-6
        expect(insideHole).toBe(false)
      }
    }
  })

  it("reports a solid fill with no line work", () => {
    const g = hatchGeometry(
      createHatch([loopOf(p(0, 0), p(10, 10))], {
        patternId: SOLID_HATCH_PATTERN_ID,
      })
    )
    expect(g.solid).toBe(true)
    expect(g.lines).toHaveLength(0)
    expect(g.rings[0]).toHaveLength(4)
  })

  it("gives up past the line budget instead of generating forever", () => {
    // 0.125 × 0.0005 spacing over a 100-unit square: far past HPMAXLINES.
    const g = hatchAt(0.0005)
    expect(g.truncated).toBe(true)
  })

  it("refuses to create a hatch that is too dense, and says so", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
      .option("p")
      .type("ANSI31")
      .enter()
      .type("0.0005")
      .enter()
      .type("0")
      .enter()
      .click(p(50, 0))
      .enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.commandLog().some((line) => line.includes("too dense"))).toBe(true)
  })
})

describe("hatch as an object", () => {
  it("picks anywhere inside the area, not just on its boundary", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").click(p(50, 0)).enter()
    const hatch = hatchOnly(h.entities())

    // The command has already dropped back to Select.
    h.click(p(50, 50))
    expect(h.selectedIds()).toContain(hatch.id)
  })

  it("carries its pattern origin along when it moves", () => {
    const hatch = createHatch([loopOf(p(0, 0), p(10, 10))])
    const moved = translateEntity(hatch, p(5, 7)) as HatchEntity
    expect(moved.origin).toBeCloseToPoint(p(5, 7))
  })

  it("flips its bulges and pattern angle when mirrored", () => {
    const loop = hatchLoopFromEntity(circleOf(p(0, 0), 10))!
    const hatch = createHatch([loop], { patternAngle: deg(30) })
    const flipped = mirrorEntity(hatch, p(0, 0), p(1, 0)) as HatchEntity
    expect(flipped.loops[0].bulges).toEqual([-1, -1])
    expect(flipped.patternAngle).toBeCloseToAngle(deg(-30))
  })

  it("survives a save and reload", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
      .option("p")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("30")
      .enter()
      .click(p(50, 0))
      .enter()

    const parsed = parseDrawingFile(
      serializeDrawing({
        settings: h.runtime.document.getSettings(),
        layers: h.runtime.document.getLayers(),
        currentLayerId: h.runtime.document.getCurrentLayerId(),
        textStyles: h.runtime.document.getTextStyles(),
        currentTextStyleId: h.runtime.document.getCurrentTextStyleId(),
        dimStyles: h.runtime.document.getDimStyles(),
        currentDimStyleId: h.runtime.document.getCurrentDimStyleId(),
        entities: h.entities(),
      })
    )
    const reloaded = hatchOnly(parsed.entities)
    expect(reloaded.patternScale).toBe(20)
    expect(reloaded.patternAngle).toBeCloseToAngle(deg(30))
    expect(reloaded.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
  })

  it("shows its pattern in the Properties palette, scale and angle editable", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").click(p(50, 0)).enter()
    h.click(p(50, 50))

    const rows = h.state().selectionInfo?.groups[0].rows ?? []
    expect(h.state().selectionInfo?.title).toBe("Hatch")
    expect(rows.find((row) => row.label === "Pattern")?.value).toBe("ANSI31")
    expect(rows.find((row) => row.label === "Scale")?.edit?.property).toBe(
      "patternScale"
    )
    expect(rows.find((row) => row.label === "Angle")?.edit?.property).toBe(
      "patternAngle"
    )
  })
})

describe("hatch in the scene", () => {
  it("draws a solid fill as one filled path with the islands as subpaths", () => {
    const h = createHarness({
      entities: [
        createHatch(
          [loopOf(p(0, 0), p(100, 100)), loopOf(p(40, 40), p(60, 60))],
          {
            patternId: SOLID_HATCH_PATTERN_ID,
          }
        ),
      ],
    })
    const paths = h
      .scene()
      .primitives.filter((prim) => prim.kind === "path" && prim.fill)
    expect(paths).toHaveLength(1)
    expect(paths[0].kind === "path" && paths[0].subpaths).toHaveLength(1)
  })

  it("draws a pattern as ordinary segments, so nothing downstream needs a clip", () => {
    const h = createHarness({
      entities: [
        createHatch([loopOf(p(0, 0), p(100, 100))], { patternScale: 20 }),
      ],
    })
    const segments = h
      .scene()
      .primitives.filter((prim) => prim.kind === "segment")
    expect(segments.length).toBeGreaterThan(10)
    expect(
      h.scene().primitives.some((prim) => prim.kind === "path" && prim.fill)
    ).toBe(false)
  })
})
