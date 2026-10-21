import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, lineOf, p, rectOf } from "../../../test/builders"
import {
  assignEntityColor,
  createBlockDefinition,
  createDimension,
  Entity,
  lineEndZ,
  lineStartZ,
  type LineEntity,
  type PolylineEntity,
} from "../../domain/entities"

/**
 * CECOLOR, CELTYPE and CELWEIGHT: every object drawn from scratch takes the
 * current colour, linetype and lineweight; ByLayer, the default, stores none.
 */

const RED = "#ff0000"

function setCurrent(cad: CadHarness) {
  cad.runtime.setCurrentColor(RED)
  cad.runtime.setCurrentLinetype("Hidden")
  cad.runtime.setCurrentLineweight(0.5)
  return cad
}

/** What `draw` added to the drawing. */
function drawn(cad: CadHarness, draw: (cad: CadHarness) => void): Entity[] {
  const before = new Set(cad.entities().map((entity) => entity.id))
  draw(cad)
  return cad.entities().filter((entity) => !before.has(entity.id))
}

const BAR = createBlockDefinition("BAR", p(0, 0), [
  lineOf(p(0, 0), p(100, 0), { id: "bar-line" }),
])

const BASE_DIMENSION = createDimension(
  "linear",
  p(0, 0),
  p(100, 0),
  p(50, -30),
  { rotation: 0, id: "D1" }
)

/** Each command that draws from scratch, with what it needs to find in the drawing. */
const FROM_SCRATCH: ReadonlyArray<
  readonly [string, (cad: CadHarness) => void, Entity[]?]
> = [
  ["LINE", (c) => c.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()],
  ["PLINE", (c) => c.command("PLINE").click(p(0, 0)).click(p(50, 50)).enter()],
  ["CIRCLE", (c) => c.command("CIRCLE").click(p(0, 50)).type("10").enter()],
  // probes arc/p150 (3P), p151 (SCE): the current layer and properties.
  [
    "ARC",
    (c) => c.command("ARC").click(p(100, 0)).click(p(0, 100)).click(p(-100, 0)),
  ],
  [
    "ELLIPSE",
    (c) =>
      c.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0)).click(p(0, 40)),
  ],
  [
    "SPLINE",
    (c) =>
      c
        .command("SPLINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(200, 50))
        .enter(),
  ],
  ["RECTANG", (c) => c.command("RECTANG").click(p(0, 0)).click(p(100, 50))],
  // probe polygon/p136: the current layer and properties, both modes.
  [
    "POLYGON",
    (c) =>
      c.command("POLYGON").enter().click(p(200, 0)).enter().type("20").enter(),
  ],
  [
    "TEXT",
    (c) =>
      c
        .command("TEXT")
        .click(p(0, 0))
        .enter()
        .enter()
        .type("HELLO")
        .enter()
        .escape(),
  ],
  [
    "MTEXT",
    (c) =>
      c
        .command("MTEXT")
        .click(p(0, 0))
        .click(p(100, -50))
        .type("HELLO")
        .enter(),
  ],
  [
    "HATCH",
    (c) => c.command("HATCH").click(p(50, 25)).enter(),
    [rectOf(p(0, 0), p(100, 50), { id: "R" })],
  ],
  [
    "DIMLINEAR",
    (c) =>
      c.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0)).click(p(50, -30)),
  ],
  [
    "DIMALIGNED",
    (c) =>
      c.command("DIMALIGNED").click(p(0, 0)).click(p(100, 0)).click(p(50, -30)),
  ],
  [
    "DIMRADIUS",
    (c) => c.command("DIMRADIUS").click(p(20, 0)).click(p(40, 40)),
    [circleOf(p(0, 0), 20, { id: "C" })],
  ],
  [
    "DIMANGULAR",
    (c) =>
      c.command("DIMANGULAR").click(p(50, 0)).click(p(0, 50)).click(p(40, 40)),
    [
      lineOf(p(0, 0), p(100, 0), { id: "L1" }),
      lineOf(p(0, 0), p(0, 100), { id: "L2" }),
    ],
  ],
  [
    "DIMCONTINUE",
    (c) => c.command("DIMCONTINUE").click(p(200, 0)).escape(),
    [BASE_DIMENSION],
  ],
  [
    "DIMBASELINE",
    (c) => c.command("DIMBASELINE").click(p(200, 0)).escape(),
    [BASE_DIMENSION],
  ],
  ["INSERT", (c) => c.command("INSERT").type("BAR").enter().click(p(300, 0))],
  [
    "ATTDEF",
    (c) =>
      c
        .command("ATTDEF")
        .enter()
        .type("PART")
        .enter()
        .enter()
        .type("X-0")
        .enter()
        .click(p(0, 0))
        .type("5")
        .enter()
        .type("0")
        .enter(),
  ],
]

const FROM_SCRATCH_SEEDED = FROM_SCRATCH.map(
  ([name, draw, entities]) => [name, draw, entities ?? []] as const
)

const BLUE = "#0000ff"

/** A blue line along X, its colour its own and the rest ByLayer. */
const blueLine = (from: number, to: number, id: string) =>
  blue(lineOf(p(from, 0), p(to, 0), { id }))

const blue = (entity: Entity) => assignEntityColor(entity, BLUE)

/**
 * Each command that makes objects out of others, with the drawing it works
 * on: every object in it is a blue line, so whatever it makes must be too.
 */
const DERIVED: ReadonlyArray<
  readonly [string, (cad: CadHarness) => unknown, Entity[]]
> = [
  [
    "COPY",
    (c) =>
      c.select("L1").command("COPY").click(p(0, 0)).click(p(0, 100)).escape(),
    [blueLine(0, 100, "L1")],
  ],
  [
    "MIRROR",
    (c) =>
      c
        .select("L1")
        .command("MIRROR")
        .click(p(0, -10))
        .click(p(100, -10))
        .option("No"),
    [blueLine(0, 100, "L1")],
  ],
  [
    "ARRAYRECT",
    (c) =>
      c
        .select("L1")
        .command("ARRAYRECT")
        .type("3", "columns")
        .type("2", "rows")
        .type("150", "colSpacing")
        .type("50", "rowSpacing")
        .enter(),
    [blueLine(0, 100, "L1")],
  ],
  [
    "OFFSET",
    (c) =>
      c
        .command("OFFSET")
        .type("20")
        .enter()
        .click(p(50, 0))
        .click(p(50, 50))
        .escape(),
    [blueLine(0, 100, "L1")],
  ],
  [
    "EXPLODE",
    (c) => c.select("P1").command("EXPLODE"),
    [blue(rectOf(p(0, 0), p(100, 50), { id: "P1" }))],
  ],
  [
    "BREAK",
    (c) => c.command("BREAK").click(p(20, 0)).click(p(60, 0)),
    [blueLine(0, 100, "L1")],
  ],
  [
    "TRIM",
    (c) => c.command("TRIM").click(p(50, 0)).escape(),
    [
      blueLine(0, 100, "L1"),
      blue(lineOf(p(30, -50), p(30, 50), { id: "C1" })),
      blue(lineOf(p(70, -50), p(70, 50), { id: "C2" })),
    ],
  ],
  [
    "JOIN",
    (c) => c.selectAll().command("JOIN"),
    [blueLine(0, 100, "L1"), blueLine(100, 200, "L2")],
  ],
  [
    "PASTECLIP",
    async (c) => {
      c.select("L1").command("COPYCLIP")
      await c.runtime.pasteFromClipboard()
      c.click(p(0, 200))
    },
    [blueLine(0, 100, "L1")],
  ],
]

describe("CECOLOR, CELTYPE and CELWEIGHT", () => {
  it.each(DERIVED)(
    "%s makes its objects with the source's properties, not the current ones",
    async (_, derive, entities) => {
      const cad = setCurrent(createHarness({ entities }))
      const before = cad.runtime.serializeDrawing()

      await derive(cad)

      expect(cad.runtime.serializeDrawing()).not.toBe(before)
      for (const entity of cad.entities()) {
        expect(entity.color).toBe(BLUE)
        expect(entity.linetype).toBeUndefined()
        expect(entity.lineweight).toBeUndefined()
      }
    }
  )

  it.each(FROM_SCRATCH_SEEDED)(
    "%s draws with the current colour, linetype and lineweight",
    (_, draw, entities) => {
      const cad = setCurrent(createHarness({ entities, blocks: [BAR] }))

      const made = drawn(cad, draw)

      expect(made.length).toBeGreaterThan(0)
      for (const entity of made) {
        expect(entity).toMatchObject({
          color: RED,
          linetype: "Hidden",
          lineweight: 0.5,
        })
      }
    }
  )

  it.each(FROM_SCRATCH_SEEDED)(
    "%s stores nothing while they are ByLayer",
    (_, draw, entities) => {
      const cad = createHarness({ entities, blocks: [BAR] })

      const made = drawn(cad, draw)

      expect(made.length).toBeGreaterThan(0)
      for (const entity of made) {
        expect(entity.color).toBeUndefined()
        expect(entity.linetype).toBeUndefined()
        expect(entity.lineweight).toBeUndefined()
      }
    }
  )

  it("converts BLOCK's objects into a reference with the current properties", () => {
    const cad = setCurrent(
      createHarness({ entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })] })
    )

    cad.command("BLOCK").type("BAR").enter().click(p(0, 0))
    cad.click(p(50, 0)).enter()

    expect(cad.only("insert")).toMatchObject({
      color: RED,
      linetype: "Hidden",
      lineweight: 0.5,
    })
    // The definition keeps its objects as they were drawn.
    expect(cad.runtime.document.getBlock("BAR")?.entities[0].color).toBe(
      undefined
    )
  })

  it("are kept in a saved drawing", () => {
    const cad = setCurrent(createHarness())

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.state()).toMatchObject({
      currentColor: RED,
      currentLinetype: "Hidden",
      currentLineweight: 0.5,
    })
    copy.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()
    expect(copy.only("line")).toMatchObject({ color: RED, lineweight: 0.5 })
  })

  it("start ByLayer", () => {
    expect(createHarness().state()).toMatchObject({
      currentColor: "ByLayer",
      currentLinetype: "ByLayer",
      currentLineweight: "ByLayer",
    })
  })
})

describe("what a new LINE wears", () => {
  it("takes the current layer, colour, linetype, lineweight, elevation and thickness", () => {
    // probe line/p21 (en-US: Spanish acadiso.lin has no HIDDEN): Layer L1,
    // ColorIndex 1, HIDDEN, LineWeight050, StartPoint [0,0,5], EndPoint
    // [10,0,5], Thickness 3, Normal [0,0,1]. CELTSCALE is not built.
    const cad = createHarness()
    const l1 = cad.runtime.createLayer("L1", undefined, true)
    cad.command("-COLOR").type("1").enter()
    cad.command("-LINETYPE").option("Set").type("HIDDEN").enter().enter()
    cad.command("-LWEIGHT").type("0.5").enter()
    cad.command("ELEV").type("5").enter().type("3").enter()

    cad.command("LINE").type("0,0").enter().type("@10,0").enter().enter()

    const line = cad.only<LineEntity>("line")
    expect(line).toMatchObject({
      layerId: l1,
      color: RED,
      linetype: "Hidden",
      lineweight: 0.5,
      thickness: 3,
    })
    expect([lineStartZ(line), lineEndZ(line)]).toEqual([5, 5])
    expect(line.normal).toBeUndefined()
  })

  it("lies on the layer made current, ByLayer otherwise", () => {
    // probe line/p45: after -LAYER Make L2, the second line is on L2, ByLayer
    const cad = createHarness()
    cad.command("LINE").type("0,0").enter().type("@10,0").enter().enter()
    const l2 = cad.runtime.createLayer("L2", undefined, true)
    cad.command("LINE").type("0,0").enter().type("@0,10").enter().enter()

    const [first, second] = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(first.layerId).toBe("0")
    expect(second.layerId).toBe(l2)
    expect(second.color).toBeUndefined()
    expect(second.linetype).toBeUndefined()
    expect(second.lineweight).toBeUndefined()
  })

  it("is drawn on a locked current layer", () => {
    // probe line/p201: -LAYER LOck 0, then LINE draws on layer 0
    const cad = createHarness()
    cad.runtime.updateLayer("0", { locked: true })

    cad.command("LINE").type("0,0").enter().type("@10,0").enter().enter()

    expect(cad.only<LineEntity>("line").layerId).toBe("0")
  })
})

describe("what a new PLINE wears", () => {
  /** Typed at the command line and confirmed, as the console types it. */
  function answer(cad: CadHarness, ...texts: string[]): CadHarness {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }

  it("takes the current layer, colour, linetype, lineweight, elevation and thickness", () => {
    // probe pline/p181 (CELTSCALE is not built)
    const cad = createHarness()
    const l1 = cad.runtime.createLayer("L1", undefined, true)
    cad.command("-COLOR").type("1").enter()
    cad.command("-LINETYPE").option("Set").type("HIDDEN").enter().enter()
    cad.command("-LWEIGHT").type("0.5").enter()
    cad.command("ELEV").type("5").enter().type("3").enter()

    answer(cad, "PLINE", "0,0", "@10,0", "")

    expect(cad.only<PolylineEntity>("polyline")).toMatchObject({
      layerId: l1,
      color: RED,
      linetype: "Hidden",
      lineweight: 0.5,
      elevation: 5,
      thickness: 3,
    })
  })

  it("keeps those current at its start point, whatever is set after", () => {
    // probes pline/p39, p182, p183: '-COLOR, CLAYER, CELTYPE, CELWEIGHT and
    // THICKNESS set mid-PLINE leave the polyline as it started.
    const cad = createHarness()
    const l1 = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "PLINE", "0,0", "@10,0", "'-COLOR", "1")
    cad.runtime.setCurrentLayer(l1)
    answer(cad, "'-LINETYPE", "S", "HIDDEN", "", "'-LWEIGHT", "0.5")
    answer(cad, "'ELEV", "0", "3", "@0,10", "")

    const polyline = cad.only<PolylineEntity>("polyline")
    expect(polyline.layerId).toBe("0")
    expect(polyline.color).toBeUndefined()
    expect(polyline.linetype).toBeUndefined()
    expect(polyline.lineweight).toBeUndefined()
    expect(polyline.thickness).toBeUndefined()
    expect(cad.runtime.document.getSettings()).toMatchObject({
      currentColor: RED,
      currentLinetype: "Hidden",
      currentLineweight: 0.5,
      thickness: 3,
    })
  })

  it("RECTANG keeps those current at its first corner (p169, p146, p171, p147)", () => {
    const cad = createHarness()
    const l1 = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "RECTANG", "5,5", "'-COLOR", "3")
    cad.runtime.setCurrentLayer(l1)
    answer(cad, "15,10")

    const late = cad.only<PolylineEntity>("polyline")
    expect(late.layerId).toBe("0")
    expect(late.color).toBeUndefined()

    answer(cad, "RECTANG", "'-COLOR", "1", "30,30", "40,40")
    expect(cad.latest()).toMatchObject({
      layerId: l1,
      color: cad.runtime.document.getSettings().currentColor,
    })
  })
})
