import { describe, expect, it } from "vitest"
import { createHarness, CadHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import {
  createDimension,
  DimensionEntity,
  dimensionMeasurement,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { THEME } from "../../scene/theme"

/** AutoCAD's Auto spacing: twice the base style's text height. */
const AUTO = 2 * DEFAULT_DIM_STYLE.textHeight

/**
 * Three horizontal dimensions over a common datum, their dimension lines
 * unevenly stacked below it — the situation DIMSPACE exists to tidy up.
 */
function stack(): DimensionEntity[] {
  return [
    createDimension("linear", p(0, 0), p(100, 0), p(50, -40), { id: "D1" }),
    createDimension("linear", p(0, 0), p(200, 0), p(100, -60), { id: "D2" }),
    createDimension("linear", p(0, 0), p(300, 0), p(150, -100), { id: "D3" }),
  ]
}

/** Picks D1 as the base, then D2 and D3 as the set, and confirms it. */
function spacing(cad: CadHarness): CadHarness {
  return cad
    .command("DIMSPACE")
    .click(p(50, -40))
    .click(p(150, -60))
    .click(p(250, -100))
    .enter()
}

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function typed(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function lineY(cad: CadHarness, id: string): number {
  return cad.byId<DimensionEntity>(id).linePoint.y
}

describe("DIMSPACE", () => {
  it("makes the spacing between parallel dimension lines equal", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.type("10").enter()

    expect(lineY(cad, "D1")).toBeCloseTo(-40)
    expect(lineY(cad, "D2")).toBeCloseTo(-50)
    expect(lineY(cad, "D3")).toBeCloseTo(-60)
  })

  it("ranks the dimensions by how far out they already are", () => {
    // D3 starts furthest from the base, so it stays furthest after spacing.
    const cad = createHarness({
      entities: [
        createDimension("linear", p(0, 0), p(100, 0), p(50, -40), { id: "D1" }),
        createDimension("linear", p(0, 0), p(200, 0), p(100, -300), {
          id: "D2",
        }),
        createDimension("linear", p(0, 0), p(300, 0), p(150, -80), {
          id: "D3",
        }),
      ],
    })
    cad
      .command("DIMSPACE")
      .click(p(50, -40))
      .click(p(150, -300))
      .click(p(250, -80))
      .enter()
      .type("20")
      .enter()

    expect(lineY(cad, "D3")).toBeCloseTo(-60)
    expect(lineY(cad, "D2")).toBeCloseTo(-80)
  })

  it("lines the series up with the base when the value is 0", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.type("0").enter()

    expect(lineY(cad, "D2")).toBeCloseTo(-40)
    expect(lineY(cad, "D3")).toBeCloseTo(-40)
  })

  it("spaces each side of the base independently", () => {
    const cad = createHarness({
      entities: [
        createDimension("linear", p(0, 0), p(100, 0), p(50, -40), { id: "D1" }),
        createDimension("linear", p(0, 0), p(200, 0), p(100, -60), {
          id: "D2",
        }),
        createDimension("linear", p(0, 0), p(300, 0), p(150, 30), { id: "D3" }),
      ],
    })
    cad
      .command("DIMSPACE")
      .click(p(50, -40))
      .click(p(150, -60))
      .click(p(250, 30))
      .enter()
      .type("10")
      .enter()

    expect(lineY(cad, "D2")).toBeCloseTo(-50)
    expect(lineY(cad, "D3")).toBeCloseTo(-30)
  })

  it("takes Auto — twice the text height — as the Enter default", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.enter()

    expect(AUTO).toBe(5)
    expect(lineY(cad, "D2")).toBeCloseTo(-40 - AUTO)
    expect(lineY(cad, "D3")).toBeCloseTo(-40 - 2 * AUTO)
  })

  it("offers the Auto keyword only at the value prompt", () => {
    const cad = createHarness({ entities: stack() })
    cad.command("DIMSPACE")
    expect(cad.optionAbbreviations()).toEqual([])

    cad.click(p(50, -40)).click(p(150, -60))
    expect(cad.optionAbbreviations()).toEqual([])

    cad.enter()
    expect(cad.optionAbbreviations()).toEqual(["A"])
  })

  it("applies Auto through its keyword too", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.option("Auto")

    expect(lineY(cad, "D2")).toBeCloseTo(-40 - AUTO)
    expect(cad.activeToolId()).toBe("select")
  })

  it("scales the Auto spacing with DIMSCALE, as the drawn text is scaled", () => {
    const cad = createHarness({ entities: stack() })
    cad.runtime.setDimScale(10)
    spacing(cad).enter()

    expect(lineY(cad, "D2")).toBeCloseTo(-40 - 10 * AUTO)
  })

  it("moves nothing but the dimension lines", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.type("10").enter()

    const d2 = cad.byId<DimensionEntity>("D2")
    expect(d2.first).toBeCloseToPoint(p(0, 0))
    expect(d2.second).toBeCloseToPoint(p(200, 0))
    expect(dimensionMeasurement(d2)).toBeCloseTo(200)
  })

  it("adjusts the whole set in one undo step", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.type("10").enter()
    cad.undo()

    expect(lineY(cad, "D2")).toBeCloseTo(-60)
    expect(lineY(cad, "D3")).toBeCloseTo(-100)
  })

  it("ends after the value, leaving the drawing alone on Escape", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.escape()

    expect(lineY(cad, "D2")).toBeCloseTo(-60)
    expect(cad.activeToolId()).toBe("select")
  })

  it("ignores a dimension that is not parallel to the base", () => {
    const cad = createHarness({
      entities: [
        ...stack(),
        createDimension("linear", p(0, 0), p(0, 100), p(-40, 50), {
          rotation: Math.PI / 2,
          id: "V1",
        }),
      ],
    })
    cad
      .command("DIMSPACE")
      .click(p(50, -40))
      .click(p(-40, 50))
      .click(p(150, -60))
      .enter()
      .type("10")
      .enter()

    expect(cad.byId<DimensionEntity>("V1").linePoint).toBeCloseToPoint(
      p(-40, 50)
    )
    expect(lineY(cad, "D2")).toBeCloseTo(-50)
  })

  // probe dimensions/p246, p239: a set selected before the command is the
  // set, counted with the base after its pick; the value is asked next.
  it("spaces a preselected set, counted after the base", () => {
    const cad = createHarness({ entities: stack() })
    cad.select("D1", "D2", "D3")
    typed(cad.command("DIMSPACE"), "50,-40")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select base dimension:50,-40",
      "3 found",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Enter value or [Auto] <Auto>:"
    )
    typed(cad, "10")
    expect(["D1", "D2", "D3"].map((id) => lineY(cad, id))).toEqual([
      -40, -50, -60,
    ])

    const auto = createHarness({ entities: stack() })
    auto.select("D1", "D2", "D3")
    typed(auto.command("DIMSPACE"), "50,-40")
    auto.enter()
    expect(lineY(auto, "D3")).toBeCloseTo(-40 - 2 * AUTO)
    expect(auto.selectedIds()).toEqual([])
  })

  // probe dimensions/p258, p259: a base that is no dimension, or nothing, is
  // said and asked again.
  it("says why a pick is no base dimension", () => {
    const cad = createHarness({
      entities: [...stack(), lineOf(p(0, 300), p(100, 300), { id: "L" })],
    })
    typed(cad.command("DIMSPACE"), "50,300")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select base dimension:50,300",
      "Selected object is not a dimension.",
    ])
    cad.click(p(50, 300))
    expect(cad.commandLog().at(-1)).toBe("Selected object is not a dimension.")
    typed(cad, "50,50")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select base dimension:50,50",
      "No object selected.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Select base dimension:"
    )
  })

  // probe dimensions/p251, p268, p225: the value is a keyword prompt read by
  // its leading number, so `FOO` lines the set up.
  it("reads the value by its leading number", () => {
    for (const [answer, ys] of [
      ["FOO", [-40, -40]],
      ["7FOO", [-47, -54]],
      ["12,10", [-52, -64]],
    ] as const) {
      const cad = spacing(createHarness({ entities: stack() }))
      typed(cad, answer)
      expect([lineY(cad, "D2"), lineY(cad, "D3")]).toEqual(ys)
      expect(cad.activeToolId()).toBe("select")
    }
  })

  it("takes no point at the value", () => {
    const cad = spacing(createHarness({ entities: stack() }))
    cad.click(p(500, 500))
    expect(cad.state().commandLine.prompt).toBe(
      "DIMSPACE Enter value or [Auto] <Auto>:"
    )
    expect(lineY(cad, "D2")).toBeCloseTo(-60)
  })

  // probe dimensions/p262: Enter on an empty set ends, no value asked.
  it("ends on Enter with nothing to space", () => {
    const cad = createHarness({ entities: stack() })
    typed(cad.command("DIMSPACE"), "50,-40")
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    expect(lineY(cad, "D1")).toBeCloseTo(-40)
  })

  // probe dimensions/p256: aligned dimensions at 30° are spaced along their
  // normal.
  it("spaces aligned dimensions along their own normal", () => {
    const u = { x: Math.cos(Math.PI / 6), y: Math.sin(Math.PI / 6) }
    const n = { x: -u.y, y: u.x }
    const at = (a: number, b: number) => p(u.x * a + n.x * b, u.y * a + n.y * b)
    const cad = createHarness({
      entities: [
        createDimension("aligned", p(0, 0), at(100, 0), at(0, -10), {
          id: "A1",
        }),
        createDimension("aligned", p(0, 0), at(200, 0), at(0, -30), {
          id: "A2",
        }),
      ],
    })
    cad.command("DIMSPACE").click(at(50, -10)).click(at(150, -30)).enter()
    typed(cad, "10")
    const a2 = cad.byId<DimensionEntity>("A2").linePoint
    expect(a2.x * n.x + a2.y * n.y).toBeCloseTo(-20)
  })

  // probe dimensions/p263: an aligned dimension among rotated ones on the
  // same axis is spaced with them.
  it("spaces an aligned dimension among rotated ones", () => {
    const cad = spacing(
      createHarness({
        entities: [
          createDimension("linear", p(0, 0), p(100, 0), p(50, -40), {
            id: "D1",
          }),
          createDimension("aligned", p(0, 0), p(200, 0), p(100, -60), {
            id: "D2",
          }),
          createDimension("linear", p(0, 0), p(300, 0), p(150, -100), {
            id: "D3",
          }),
        ],
      })
    )
    typed(cad, "10")
    expect([lineY(cad, "D2"), lineY(cad, "D3")]).toEqual([-50, -60])
  })

  it("rolls over the dimension a pick at the base would take", () => {
    const cad = createHarness({ entities: stack() })
    cad.command("DIMSPACE").moveTo(p(50, -40))
    expect(
      cad
        .scene()
        .primitives.some(
          (prim) =>
            "stroke" in prim &&
            prim.stroke?.color === THEME.entityHover &&
            prim.stroke.width === 2
        )
    ).toBe(true)
  })

  /** The probes' drawing: a line under two horizontal dimensions and a vertical one. */
  const probed = () => [
    lineOf(p(0, 0), p(100, 0), { id: "A" }),
    createDimension("linear", p(0, 0), p(100, 0), p(50, -10), { id: "H1" }),
    createDimension("linear", p(0, 0), p(100, 0), p(50, -20), { id: "H2" }),
    createDimension("linear", p(0, 0), p(0, 50), p(-10, 25), {
      rotation: Math.PI / 2,
      id: "V",
    }),
  ]

  // dimspace in erase/p244, p256: what is no dimension is counted `0 found`,
  // and that find starts the total.
  it("says 0 found for an object that is no dimension, and totals after it", () => {
    const cad = createHarness({ entities: probed() })
    typed(cad.command("DIMSPACE"), "50,-10", "50,0", "50,0", "50,-20", "50,0")

    expect(cad.commandLog().slice(1)).toEqual([
      "Select base dimension:50,-10",
      "Select dimensions to space:50,0",
      "0 found",
      "Select dimensions to space:50,0",
      "0 found, 0 total",
      "Select dimensions to space:50,-20",
      "1 found, 1 total",
      "Select dimensions to space:50,0",
      "0 found, 1 total",
    ])
  })

  // erase/p221: a point typed at the base prompt picks there, and a dimension
  // at an angle to the base is found, then left where it is.
  it("takes a typed point as the base's pick, and finds a dimension at an angle to it", () => {
    const cad = createHarness({ entities: probed() })
    typed(cad.command("DIMSPACE"), "50,-10", "-10,25", "50,-20")
    cad.enter().type("10").enter()

    expect(cad.commandLog().slice(1, 6)).toEqual([
      "Select base dimension:50,-10",
      "Select dimensions to space:-10,25",
      "1 found",
      "Select dimensions to space:50,-20",
      "1 found, 2 total",
    ])
    expect(cad.byId<DimensionEntity>("V").linePoint).toBeCloseToPoint(
      p(-10, 25)
    )
    expect(lineY(cad, "H2")).toBeCloseTo(-20)
  })

  it("selects the set with a crossing box as well as by clicking", () => {
    const cad = createHarness({ entities: stack() })
    cad
      .command("DIMSPACE")
      .click(p(50, -40))
      .drag(p(400, -200), p(-50, 20))
      .enter()
      .type("10")
      .enter()

    expect(lineY(cad, "D2")).toBeCloseTo(-50)
    expect(lineY(cad, "D3")).toBeCloseTo(-60)
    // The base is never part of its own set.
    expect(lineY(cad, "D1")).toBeCloseTo(-40)
  })

  it("highlights the base, and previews the result before it is applied", () => {
    const cad = createHarness({ entities: stack() })
    const coloured = (color: string) =>
      cad
        .scene()
        .primitives.filter(
          (prim) => "stroke" in prim && prim.stroke?.color === color
        ).length

    cad.command("DIMSPACE").click(p(50, -40))
    expect(coloured(THEME.selected)).toBeGreaterThan(0)

    cad.click(p(150, -60)).enter().type("10")
    expect(coloured(THEME.preview)).toBeGreaterThan(0)
    // Still only a preview: nothing has moved yet.
    expect(lineY(cad, "D2")).toBeCloseTo(-60)
  })
})
