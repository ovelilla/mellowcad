import { describe, expect, it } from "vitest"
import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import {
  createDimension,
  DimensionEntity,
  dimensionMeasurement,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

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

/** A fresh drawing with one dimension made by `command`, typed as the probes type it. */
function drawn(command: string, ...answers: string[]): CadHarness {
  const cad = createHarness()
  answer(cad.command(command), ...answers)
  return cad
}

/** Every dimension after the drawing's first, the base, in creation order. */
function added(cad: ReturnType<typeof createHarness>): DimensionEntity[] {
  return cad
    .entities()
    .filter((e): e is DimensionEntity => e.type === "dimension")
    .slice(1)
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

  it("measures along the base's direction, in its style", () => {
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

  // probe dimensions/p240, p219: an aligned base chains rotated dimensions
  // measured along its axis, DXF 50 at 233.13°.
  it("chains an aligned base as rotated dimensions along its axis", () => {
    const cad = drawn("DIMALIGNED", "0,0", "60,80", "-40,60")
    answer(cad.command("DIMBASELINE"), "200,0")
    const [dim] = added(cad)

    expect(dim.kind).toBe("linear")
    expect((dim.rotation * 180) / Math.PI).toBeCloseTo(233.13, 2)
    expect(dimensionMeasurement(dim)).toBeCloseTo(120)
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 120")

    const along = drawn("DIMALIGNED", "0,0", "60,80", "-40,60")
    answer(along.command("DIMBASELINE"), "120,160")
    expect(dimensionMeasurement(added(along)[0])).toBeCloseTo(200)
  })

  // probe dimensions/p233, p242: the spacing is the current style's DIMDLI,
  // the style the link takes the base's.
  it("spaces by the current style's DIMDLI", () => {
    const cad = createHarness()
    const s2 = cad.runtime.createDimStyle("S2", undefined, true)
    cad.runtime.updateDimStyle(s2, { baselineSpacing: 10 })
    answer(cad.command("DIMLINEAR"), "0,0", "100,0", "50,-30")
    cad.runtime.setCurrentDimStyle("ISO-25")
    answer(cad.command("DIMBASELINE"), "180,0")
    expect(added(cad)[0].styleId).toBe(s2)
    expect(added(cad)[0].linePoint.y).toBeCloseTo(-33.75)

    const current = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    const s3 = current.runtime.createDimStyle("S3", undefined, true)
    current.runtime.updateDimStyle(s3, { baselineSpacing: 10 })
    answer(current.command("DIMBASELINE"), "180,0")
    expect(added(current)[0].styleId).toBe("ISO-25")
    expect(added(current)[0].linePoint.y).toBeCloseTo(-40)
  })

  // probe dimensions/p244, p264: scaled by the base's DIMSCALE, not the
  // current one's.
  it("scales the spacing by the base's DIMSCALE", () => {
    const cad = createHarness()
    const s2 = cad.runtime.createDimStyle("S2", undefined, true)
    cad.runtime.updateDimStyle(s2, { scale: 10 })
    answer(cad.command("DIMLINEAR"), "0,0", "100,0", "50,-30")
    cad.runtime.setCurrentDimStyle("ISO-25")
    answer(cad.command("DIMBASELINE"), "180,0")
    expect(added(cad)[0].linePoint.y).toBeCloseTo(-67.5)

    const current = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    const s3 = current.runtime.createDimStyle("S3", undefined, true)
    current.runtime.updateDimStyle(s3, { scale: 10 })
    answer(current.command("DIMBASELINE"), "180,0")
    expect(added(current)[0].linePoint.y).toBeCloseTo(-33.75)
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

    const hovered = () =>
      cad
        .scene()
        .primitives.filter(
          (prim) =>
            "stroke" in prim &&
            prim.stroke?.color === THEME.entityHover &&
            prim.stroke.width === 2
        ).length

    cad.moveTo(p(400, 400))
    expect(hovered()).toBe(0)
    cad.moveTo(p(50, -30))
    expect(hovered()).toBeGreaterThan(0)
  })

  it("rolls a base over in its own style's sizes", () => {
    const cad = createHarness()
    const s2 = cad.runtime.createDimStyle("S2", undefined, true)
    cad.runtime.updateDimStyle(s2, { scale: 10 })
    answer(cad.command("DIMLINEAR"), "0,0", "100,0", "50,-30")
    cad.command("DIMBASELINE").option("Select").moveTo(p(50, -30))

    const segments = (hover: boolean) =>
      cad
        .scene()
        .primitives.flatMap((prim) =>
          prim.kind === "segment" &&
          (prim.stroke.color === THEME.entityHover) === hover
            ? [
                [prim.a, prim.b]
                  .map((q) => `${q.x.toFixed(3)},${q.y.toFixed(3)}`)
                  .join(" "),
              ]
            : []
        )
    const drawn = new Set(segments(false))
    expect(segments(true).length).toBeGreaterThan(0)
    for (const segment of segments(true)) expect(drawn).toContain(segment)
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

  // probe dimensions/p211, p212: `Select continued dimension: L` grows the chain
  // from the extension line nearer the WCS origin, as a pick there would.
  it("takes Last at the Select prompt, from the end nearer the origin", () => {
    const cad = createHarness({ entities: [base()] })
    answer(cad.command("DIMCONTINUE").option("Select"), "L")
    expect(cad.commandLog().at(-1)).toBe("Select continued dimension: L")
    cad.click(p(200, 0))
    expect(added(cad)[0].first).toBeCloseToPoint(p(0, 0))

    const reversed = createHarness({
      entities: [
        createDimension("linear", p(100, 0), p(0, 0), p(50, -30), {
          rotation: 0,
        }),
      ],
    })
    answer(reversed.command("DIMBASELINE").option("Select"), "L")
    reversed.click(p(300, 0))
    expect(added(reversed).at(-1)?.first).toBeCloseToPoint(p(0, 0))
  })

  it("says why Last is no dimension to chain from", () => {
    const cad = createHarness({
      entities: [base(), lineOf(p(0, 300), p(1, 300))],
    })
    answer(cad.command("DIMBASELINE").option("Select"), "L")
    expect(cad.commandLog().at(-1)).toBe(
      "Linear, ordinate, or angular associative dimension required."
    )
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Select base dimension:"
    )
    const empty = createHarness()
    answer(empty.command("DIMCONTINUE"), "L")
    expect(empty.commandLog().at(-1)).toBe("No object selected.")
    answer(empty, "FOO")
    expect(empty.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Last",
    ])
  })

  it("takes Spanish Last as úLTimo's LT", () => {
    const cad = createHarness({ locale: es, entities: [base()] })
    answer(cad.command("ACOCONTINUA").option("Select"), "LT")
    expect(cad.commandLog().at(-1)).toBe("Designe cota continua: LT")
    const line = createHarness({
      locale: es,
      entities: [lineOf(p(0, 300), p(1, 300))],
    })
    answer(line.command("ACOCONTINUA"), "LT")
    expect(line.commandLog().at(-1)).toBe(
      "Requiere una cota asociativa lineal, de coordenada o angular."
    )
  })

  it("asks AutoCAD's questions and writes them answered", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE")

    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Specify second extension line origin or [Select/Undo] <Select>:"
    )
    expect(cad.optionAbbreviations()).toEqual(["S", "U"])
    cad.click(p(180, 0))
    expect(cad.commandLog().at(-1)).toMatch(/^Dimension text = /)
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Select base dimension:"
    )
    cad.click(p(500, 500))
    expect(cad.commandLog().at(-1)).toBe("No object selected.")
    cad.escape().command("DIMCONTINUE").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIMCONTINUE Select continued dimension:"
    )
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({ locale: es, entities: [base()] })
    cad.command("ACOLINEABASE")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEABASE Especifique un origen de la segunda línea de referencia o [Designar/desHacer] <Designar>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ACOLINEABASE Designe cota base:"
    )
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

  // probe dimensions/p229, p230, p231: `@` is relative to LASTPOINT, the
  // DIMLINEAR's location, which the chain's points leave where it is.
  it("reads a typed relative coordinate from LASTPOINT", () => {
    const cad = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    answer(cad.command("DIMBASELINE"), "@80,0")
    expect(added(cad)[0].second).toBeCloseToPoint(p(130, -30))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 130")

    const continued = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    answer(continued.command("DIMCONTINUE"), "@80,0", "@50,0")
    expect(added(continued).map((dim) => dim.second)).toEqual([
      p(130, -30),
      p(100, -30),
    ])
  })

  it("ends on Escape without placing anything", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").escape()

    expect(added(cad)).toHaveLength(0)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("the base a chain takes", () => {
  // probe dimensions/p400: Last is the last dimension made since the drawing
  // was opened, so a drawing reopened asks for one.
  it("asks for a base in a drawing just opened", () => {
    const cad = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    cad.runtime.loadDrawing(cad.runtime.serializeDrawing())
    cad.command("DIMBASELINE")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Select base dimension:"
    )

    answer(cad.command("DIMLINEAR"), "0,50", "100,50", "50,80")
    cad.command("DIMBASELINE")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Specify second extension line origin or [Select/Undo] <Select>:"
    )
  })

  // probe dimensions/p224, p223: AutoCAD chains an angular dimension made
  // last, which is not built here, so the Select prompt asks rather than
  // chaining the linear before it; a radial made last is skipped.
  it("asks for a base after an angular dimension, skips a radial one", () => {
    const cad = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    answer(cad.command("DIMANGULAR"), "", "300,0", "310,0", "303,4", "320,20")
    cad.command("DIMBASELINE")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Select base dimension:"
    )
    answer(cad, "L")
    expect(cad.commandLog().at(-1)).toBe(
      "Linear, ordinate, or angular associative dimension required."
    )
    // p236's pick on its arc, which AutoCAD chains.
    answer(cad, "326.131,10.8239")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select base dimension: 326.131,10.8239",
      "Linear, ordinate, or angular associative dimension required.",
    ])

    const radial = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    answer(radial.command("CIRCLE"), "300,0", "50")
    answer(radial.command("DIMRADIUS"), "350,0", "380,0")
    answer(radial.command("DIMBASELINE"), "180,0")
    const link = radial
      .entities()
      .filter((e): e is DimensionEntity => e.type === "dimension")
      .at(-1)
    expect(link?.first).toBeCloseToPoint(p(0, 0))
    expect(link?.linePoint.y).toBeCloseTo(-33.75)
  })

  // probe dimensions/p208, p227: a point typed at the Select prompt picks there.
  it("takes a typed point at the Select prompt as its pick", () => {
    const cad = drawn("DIMLINEAR", "0,0", "100,0", "50,-30")
    answer(cad.command("DIMBASELINE"), "S", "95,-30", "180,0")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select base dimension: 95,-30",
      "Specify second extension line origin or [Select/Undo] <Select>: 180,0",
      "Dimension text = 80",
    ])

    const empty = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    answer(empty.command("DIMBASELINE"), "50,50")
    expect(empty.commandLog().slice(-2)).toEqual([
      "Select base dimension: 50,50",
      "No object selected.",
    ])
  })

  // probe dimensions/p401, p402: a radial dimension picked is refused in
  // AutoCAD's words and the prompt asks again.
  it("refuses a radial dimension picked as the base", () => {
    for (const [command, prompt] of [
      ["DIMBASELINE", "Select base dimension:"],
      ["DIMCONTINUE", "Select continued dimension:"],
    ]) {
      const cad = createHarness()
      answer(cad.command("CIRCLE"), "300,0", "50")
      answer(cad.command("DIMRADIUS"), "350,0", "380,0")
      answer(cad.command(command), "325,0")
      expect(cad.commandLog().slice(-2)).toEqual([
        `${prompt} 325,0`,
        "Linear, ordinate, or angular associative dimension required.",
      ])
      expect(cad.state().commandLine.prompt).toBe(`${command} ${prompt}`)
    }
    const es_ = createHarness({ locale: es })
    answer(es_.command("CIRCULO"), "300,0", "50")
    answer(es_.command("ACORADIO"), "350,0", "380,0")
    answer(es_.command("ACOLINEABASE"), "325,0")
    expect(es_.commandLog().at(-1)).toBe(
      "Requiere una cota asociativa lineal, de coordenada o angular."
    )
  })

  // probe dimensions/p222, p241: Last grows from the end nearer the WCS's
  // origin, whatever the UCS's.
  it("takes Last from the end nearer the WCS origin under an offset UCS", () => {
    const cad = drawn("DIMLINEAR", "100,0", "0,0", "50,-30")
    answer(cad.command("UCS"), "O", "-300,0")
    answer(cad.command("DIMCONTINUE"), "S", "L", "500,0")

    expect(added(cad)[0].first).toBeCloseToPoint(p(0, 0))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 200")
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

  // probe dimensions/p213, p215: with nothing left to take back it says so
  // and asks again.
  it("says all is undone when the run has placed nothing", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").option("Undo")

    expect(cad.typeCounts().dimension).toBe(1)
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMBASELINE Specify second extension line origin or [Select/Undo] <Select>:"
    )

    const once = createHarness({ entities: [base()] })
    answer(once.command("DIMBASELINE"), "180,0")
    once.option("Undo").option("Undo")
    expect(
      once
        .commandLog()
        .filter((line) => line === "Command has been completely undone.")
    ).toHaveLength(1)
    expect(once.typeCounts().dimension).toBe(1)
  })

  it("steps back a link with Ctrl+Z, and U undoes the whole run", () => {
    const cad = chained("DIMCONTINUE", p(180, 0), p(260, 0), p(340, 0))
    expect(added(cad)).toHaveLength(3)

    // Inside the command Ctrl+Z is its Undo option.
    cad.press("z", { ctrlKey: true })
    expect(added(cad)).toHaveLength(2)
    cad.escape()
    cad.undo()
    expect(added(cad)).toHaveLength(0)
    expect(cad.typeCounts().dimension).toBe(1)
  })
})

describe("dimension chain preview", () => {
  it("previews exactly what the click commits", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMBASELINE").moveTo(p(180, 0))

    expect(dimensionTexts(cad)).toContain("180")

    cad.click(p(180, 0))
    expect(dimensionMeasurement(added(cad)[0])).toBeCloseTo(180)
  })

  it("draws nothing while the cursor sits on the chain origin", () => {
    const cad = createHarness({ entities: [base()] })
    cad.command("DIMCONTINUE").moveTo(p(100, 0))

    // A zero-length link would read "0": the base's own text is the only one.
    expect(dimensionTexts(cad)).toEqual(["100"])
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
