import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import {
  createDimension,
  DimensionEntity,
  dimensionMeasurement,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"

const SPACING = DEFAULT_DIM_STYLE.baselineSpacing

/**
 * A horizontal linear dimension over (0,0)–(100,0) with its dimension line
 * below the measured points, so a baseline chain has to step further down.
 */
function base(): DimensionEntity {
  return createDimension("linear", p(0, 0), p(100, 0), p(50, -30), {
    rotation: 0,
    id: "D1",
  })
}

function chained(command: string, ...points: { x: number; y: number }[]) {
  const cad = createHarness({ entities: [base()] })
  cad.command(command)
  for (const point of points) cad.click(point)
  return cad
}

/** Every dimension the run added, in creation order. */
function added(cad: ReturnType<typeof createHarness>): DimensionEntity[] {
  return cad
    .entities()
    .filter((e): e is DimensionEntity => e.type === "dimension")
    .filter((dim) => dim.id !== "D1")
}

/** Measurement text on screen: the drawn dimensions plus any live preview. */
function dimensionTexts(cad: ReturnType<typeof createHarness>): string[] {
  return cad
    .scene()
    .primitives.flatMap((prim) => (prim.kind === "text" ? [prim.text] : []))
}

describe("DIMBASELINE", () => {
  it("keeps the base's first extension line origin", () => {
    const cad = chained("DIMBASELINE", p(180, 0))
    const [dim] = added(cad)

    expect(dim.first).toBeCloseToPoint(p(0, 0))
    expect(dim.second).toBeCloseToPoint(p(180, 0))
    expect(dimensionMeasurement(dim)).toBeCloseTo(180)
  })

  it("offsets the dimension line by DIMDLI, further out on each link", () => {
    const cad = chained("DIMBASELINE", p(180, 0), p(260, 0))
    const [first, second] = added(cad)

    expect(first.linePoint.y).toBeCloseTo(-30 - SPACING)
    expect(second.linePoint.y).toBeCloseTo(-30 - 2 * SPACING)
    // The datum never moves: every link measures from the same origin.
    expect(second.first).toBeCloseToPoint(p(0, 0))
  })

  it("steps away from the measured geometry, not across it", () => {
    // Same drawing mirrored: the base's line sits above what it measures.
    const cad = createHarness({
      entities: [
        createDimension("linear", p(0, 0), p(100, 0), p(50, 30), { id: "D1" }),
      ],
    })
    cad.command("DIMBASELINE").click(p(180, 0))

    expect(added(cad)[0].linePoint.y).toBeCloseTo(30 + SPACING)
  })

  it("inherits the base's kind, direction and style", () => {
    const cad = createHarness({
      entities: [
        createDimension("linear", p(0, 0), p(0, 100), p(-30, 50), {
          rotation: Math.PI / 2,
          id: "D1",
        }),
      ],
    })
    cad.command("DIMBASELINE").click(p(0, 180))
    const [dim] = added(cad)

    expect(dim.kind).toBe("linear")
    expect(dim.rotation).toBeCloseTo(Math.PI / 2)
    expect(dim.styleId).toBe("ISO-25")
    expect(dimensionMeasurement(dim)).toBeCloseTo(180)
  })

  it("chains an aligned base as aligned dimensions", () => {
    const cad = createHarness({
      entities: [
        createDimension("aligned", p(0, 0), p(60, 80), p(-40, 60), {
          id: "D1",
        }),
      ],
    })
    cad.command("DIMBASELINE").click(p(120, 160))

    expect(added(cad)[0].kind).toBe("aligned")
    expect(dimensionMeasurement(added(cad)[0])).toBeCloseTo(200)
  })
})

describe("DIMCONTINUE", () => {
  it("starts from the base's second extension line origin", () => {
    const cad = chained("DIMCONTINUE", p(180, 0))
    const [dim] = added(cad)

    expect(dim.first).toBeCloseToPoint(p(100, 0))
    expect(dim.second).toBeCloseToPoint(p(180, 0))
    expect(dimensionMeasurement(dim)).toBeCloseTo(80)
  })

  it("keeps every link on the base's dimension line", () => {
    const cad = chained("DIMCONTINUE", p(180, 0), p(260, 0))
    const [first, second] = added(cad)

    expect(first.linePoint.y).toBeCloseTo(-30)
    expect(second.linePoint.y).toBeCloseTo(-30)
  })

  it("hands each second origin on to the next link", () => {
    const cad = chained("DIMCONTINUE", p(180, 0), p(260, 0))
    const [, second] = added(cad)

    expect(second.first).toBeCloseToPoint(p(180, 0))
    expect(dimensionMeasurement(second)).toBeCloseTo(80)
  })
})

describe("dimension chain prompts", () => {
  it("opens at the Select prompt when the drawing has no dimension", () => {
    const cad = createHarness()
    cad.command("DIMBASELINE")

    // No coordinate field: the keyword-only Select prompt keeps canvas focus.
    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    cad.click(p(200, 200))
    expect(cad.typeCounts().dimension ?? 0).toBe(0)
  })

  it("starts the chain from a dimension picked at the Select prompt", () => {
    const cad = createHarness({ entities: [base()] })
    cad
      .command("DIMCONTINUE")
      .option("Select")
      .click(p(95, -30))
      .click(p(180, 0))

    expect(added(cad)).toHaveLength(1)
    expect(added(cad)[0].first).toBeCloseToPoint(p(100, 0))
  })

  it("highlights the dimension under the cursor while selecting a base", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").option("Select")

    const amber = () =>
      cad
        .scene()
        .primitives.filter(
          (prim) => "stroke" in prim && prim.stroke?.color === THEME.selected
        ).length

    cad.moveTo(p(400, 400))
    expect(amber()).toBe(0)
    cad.moveTo(p(50, -30))
    expect(amber()).toBeGreaterThan(0)
  })

  it("takes the extension line nearest the pick when a base is selected", () => {
    const cad = createHarness({ entities: [base()] })
    // DIMBASELINE defaults to the first origin; picking near the far end of the
    // base overrides it, which is what AutoCAD's explicit selection is for.
    cad
      .command("DIMBASELINE")
      .option("Select")
      .click(p(95, -30))
      .click(p(180, 0))

    expect(added(cad)[0].first).toBeCloseToPoint(p(100, 0))
  })

  it("offers Select at the origin prompt, and Undo only once one was placed", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE")

    expect(cad.optionKeys()).toEqual(["S"])
    cad.click(p(180, 0))
    expect(cad.optionKeys()).toEqual(["U", "S"])
  })

  it("returns to the Select prompt on Enter, the <Select> default", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").enter()

    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    expect(cad.activeToolId()).toBe("dimbaseline")
  })

  it("ends the command on Enter at the Select prompt", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").enter().enter()

    expect(cad.activeToolId()).toBe("select")
  })

  it("places a link from a typed relative coordinate", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMCONTINUE").type("@80,0").enter()

    expect(added(cad)[0].second).toBeCloseToPoint(p(180, 0))
  })

  it("ends on Escape without placing anything", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").escape()

    expect(added(cad)).toHaveLength(0)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("dimension chain Undo keyword", () => {
  it("removes the last link and resumes where it left off", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").click(p(180, 0)).click(p(260, 0)).option("Undo")

    expect(added(cad)).toHaveLength(1)

    // The chain is back one step, so the next link lands on the freed level.
    cad.click(p(300, 0))
    const last = added(cad)[1]
    expect(last.second).toBeCloseToPoint(p(300, 0))
    expect(last.linePoint.y).toBeCloseTo(-30 - 2 * SPACING)
  })

  it("does nothing when the run has placed nothing", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").option("Undo")

    expect(cad.typeCounts().dimension).toBe(1)
  })

  it("makes each link its own undo step", () => {
    const cad = chained("DIMCONTINUE", p(180, 0), p(260, 0))
    expect(added(cad)).toHaveLength(2)

    cad.undo()
    expect(added(cad)).toHaveLength(1)
    cad.undo()
    expect(added(cad)).toHaveLength(0)
    expect(cad.typeCounts().dimension).toBe(1)
  })
})

describe("dimension chain preview", () => {
  it("previews exactly what the click commits", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").moveTo(p(180, 0))

    expect(dimensionTexts(cad)).toContain("180.00")

    cad.click(p(180, 0))
    expect(dimensionMeasurement(added(cad)[0])).toBeCloseTo(180)
  })

  it("draws nothing while the cursor sits on the chain origin", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMCONTINUE").moveTo(p(100, 0))

    // A zero-length link would read "0.00": the base's own text is the only one.
    expect(dimensionTexts(cad)).toEqual(["100.00"])
  })
})

describe("DIMDLI", () => {
  it("starts at AutoCAD's metric initial value", () => {
    expect(DEFAULT_DIM_STYLE.baselineSpacing).toBe(3.75)
  })

  it("is scaled by DIMSCALE, like every other dimension size", () => {
    const cad = createHarness({ entities: [base()] })
    cad.runtime.setDimScale(10)
    cad.command("DIMBASELINE").click(p(180, 0))

    expect(added(cad)[0].linePoint.y).toBeCloseTo(-30 - 10 * SPACING)
  })

  it("survives a save and reload", () => {
    const cad = createHarness()
    cad.runtime.document.updateDimStyle({
      ...DEFAULT_DIM_STYLE,
      baselineSpacing: 12,
    })

    const parsed = parseDrawingFile(cad.runtime.serializeDrawing())
    expect(parsed.dimStyles[0].baselineSpacing).toBe(12)
  })

  it("fills in the default for a drawing written before it existed", () => {
    const legacy = JSON.stringify({
      type: "easycad-drawing",
      version: 10,
      entities: [],
      dimStyles: [{ id: "ISO-25", name: "ISO-25", textHeight: 2.5 }],
    })

    expect(parseDrawingFile(legacy).dimStyles[0].baselineSpacing).toBe(SPACING)
  })
})
