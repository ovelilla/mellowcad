import { describe, expect, it } from "vitest"
import { createHarness, CadHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"
import {
  DimensionEntity,
  dimensionGeometry,
  dimensionMeasurement,
  dimensionMeasurementUnit,
  dimensionText,
  entityBounds,
  mirrorEntity,
  rotateEntity,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"

function answer(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

/** The point `r` from the origin at `degrees`. */
function polar(r: number, degrees: number) {
  return p(r * Math.cos(deg(degrees)), r * Math.sin(deg(degrees)))
}

/** L1 along X through the origin, L2 at 30° through it (p344–p350). */
function crossing() {
  return [
    lineOf(p(-100, 0), p(100, 0), { id: "L1" }),
    lineOf(p(-86.60254, -50), p(86.60254, 50), { id: "L2" }),
  ]
}

function dim(cad: CadHarness): DimensionEntity {
  return cad.only<DimensionEntity>("dimension")
}

/** The three-point form: Enter at the object prompt, then vertex and endpoints. */
function threePoint(
  vertex: { x: number; y: number },
  first: { x: number; y: number },
  second: { x: number; y: number },
  location: { x: number; y: number }
): CadHarness {
  const cad = createHarness()
  cad
    .command("DIMANGULAR")
    .enter()
    .click(vertex)
    .click(first)
    .click(second)
    .click(location)
  return cad
}

/** A right angle at the origin, opening between +X and +Y. */
function quarter(location = p(60, 60)): CadHarness {
  return threePoint(p(0, 0), p(100, 0), p(0, 100), location)
}

describe("DIMANGULAR three-point form", () => {
  it("measures the angle the endpoints subtend at the vertex", () => {
    const angular = dim(quarter())

    expect(angular.kind).toBe("angular")
    expect(angular.vertex).toBeCloseToPoint(p(0, 0))
    expect(angular.first).toBeCloseToPoint(p(100, 0))
    expect(angular.second).toBeCloseToPoint(p(0, 100))
    expect(dimensionMeasurement(angular)).toBeCloseToAngle(deg(90))
  })

  it("reports the measurement in radians and says so", () => {
    expect(dimensionMeasurementUnit("angular")).toBe("angle")
    expect(dimensionMeasurement(dim(quarter()))).toBeCloseTo(Math.PI / 2)
  })

  it("writes the measurement in whole degrees by default (DIMADEC 0)", () => {
    expect(dimensionText(dim(quarter()))).toBe("90°")
  })

  it("counts angular decimals with DIMADEC, falling back to DIMDEC at −1", () => {
    const angular = dim(quarter())
    const oneEighth = { ...DEFAULT_DIM_STYLE, angleDecimals: 3 }
    const inherited = { ...DEFAULT_DIM_STYLE, angleDecimals: -1 }

    expect(dimensionText(angular, oneEighth)).toBe("90,000°")
    // DIMDEC is 2, and −1 means "display the places specified by DIMDEC".
    expect(dimensionText(angular, inherited)).toBe("90,00°")
  })

  it("measures the reflex angle when the arc is placed on the other side", () => {
    // Same two rays, but the location now sits in the far sweep.
    const angular = dim(quarter(p(-60, -60)))
    expect(dimensionMeasurement(angular)).toBeCloseTo((3 * Math.PI) / 2)
    expect(dimensionText(angular)).toBe("270°")
  })

  it("ends the command once the location is picked", () => {
    expect(quarter().activeToolId()).toBe("select")
  })

  it("creates the dimension in a single undo step", () => {
    const cad = quarter()
    cad.undo()
    expect(cad.entityCount).toBe(0)
  })

  it("takes typed coordinates at every prompt", () => {
    const cad = createHarness()
    cad
      .command("DAN")
      .enter()
      .type("#0,0")
      .enter()
      .type("#100,0")
      .enter()
      .type("#0,100")
      .enter()
      .type("#60,60")
      .enter()

    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(Math.PI / 2)
  })

  it("leaves the drawing untouched on Escape", () => {
    const cad = createHarness()
    cad.command("DIMANGULAR").enter().click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("angular dimension geometry", () => {
  it("draws its dimension line as an arc about the vertex", () => {
    const g = dimensionGeometry(dim(quarter(p(80, 0))))

    expect(g.arc).toBeDefined()
    expect(g.arc!.center).toBeCloseToPoint(p(0, 0))
    // The radius is however far out the location was placed.
    expect(g.arc!.radius).toBeCloseTo(80)
    expect(g.arc!.startAngle).toBeCloseToAngle(0)
    expect(g.arc!.endAngle).toBeCloseToAngle(deg(90))
    expect(g.lineStart).toBeCloseToPoint(p(80, 0))
    expect(g.lineEnd).toBeCloseToPoint(p(0, 80))
  })

  it("grabs the dimension line halfway around the arc, not across its chord", () => {
    const g = dimensionGeometry(dim(quarter(p(100, 0))))
    const diagonal = 100 / Math.SQRT2

    expect(g.lineMidpoint).toBeCloseToPoint(p(diagonal, diagonal))
  })

  it("runs an extension line out to an arc beyond its endpoint (probe dimensions/p340)", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 50, 0, deg(60), { id: "A" })],
    })
    cad.command("DIMANGULAR").click(polar(50, 30)).click(p(60.621778, 35))
    const g = dimensionGeometry(dim(cad))

    // LINE 50.625→71.25 to the arc at 70.
    expect(g.lines[0][0]).toBeCloseToPoint(p(50.625, 0))
    expect(g.lines[0][1]).toBeCloseToPoint(p(71.25, 0))
  })

  it("runs an extension line in to an arc short of its endpoint (probe dimensions/p342)", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 50, { id: "C" })],
    })
    cad.command("DIMANGULAR").click(p(50, 0)).click(p(0, 40)).click(p(30, 30))
    const g = dimensionGeometry(dim(cad))

    // Two LINEs 49.375→41.1764 to the arc at 42.4264.
    expect(g.lines).toHaveLength(2)
    expect(g.lines[0][0]).toBeCloseToPoint(p(49.375, 0))
    expect(g.lines[0][1]).toBeCloseToPoint(p(41.1764, 0), 4)
    expect(g.lines[1][0]).toBeCloseToPoint(p(0, 49.375))
    expect(g.lines[1][1]).toBeCloseToPoint(p(0, 41.1764), 4)
  })

  it("puts an arrowhead tangent to each end of the arc", () => {
    const g = dimensionGeometry(dim(quarter(p(100, 0))))

    expect(g.arrows).toHaveLength(2)
    expect(g.arrows[0][0]).toBeCloseToPoint(p(100, 0))
    expect(g.arrows[1][0]).toBeCloseToPoint(p(0, 100))
    // The first head lies along the arc, so its body is above its tip, not
    // radially inside or outside it.
    expect(g.arrows[0][1].y).toBeGreaterThan(0)
    expect(g.arrows[0][1].x).toBeCloseTo(100, 0)
  })

  it("puts the text outside the arc, at its midpoint", () => {
    const g = dimensionGeometry(dim(quarter(p(100, 0))))
    const outward = Math.hypot(g.textPosition.x, g.textPosition.y)

    expect(outward).toBeGreaterThan(100)
    // Along the bisector of the quarter turn.
    expect(g.textPosition.x).toBeCloseTo(g.textPosition.y)
  })

  it("keeps the text clear of the arc even when it reads the other way", () => {
    // A sweep centred on +X: keeping the number readable turns its "up" inwards,
    // so the baseline has to move a text height further out.
    const cad = threePoint(p(0, 0), p(100, -100), p(100, 100), p(100, 0))
    const g = dimensionGeometry(dim(cad))
    const style = DEFAULT_DIM_STYLE

    expect(g.textPosition.x).toBeCloseTo(
      g.arc!.radius + style.textGap + style.textHeight
    )
    expect(g.textPosition.y).toBeCloseTo(0)
  })

  it("is picked along the arc rather than along its chord", () => {
    // A half turn: the chord runs straight through the vertex, which is the one
    // place the dimension is emphatically not drawn.
    const cad = threePoint(p(0, 0), p(100, 0), p(-100, 0), p(0, 100))
    const dimension = dim(cad)
    cad.select(dimension.id)

    // The apex of the arc is on the object; the vertex is not.
    expect(cad.runtime.document.pick(p(0, 100), 5)?.id).toBe(dimension.id)
    expect(cad.runtime.document.pick(p(0, 0), 5)).toBeNull()
  })

  it("bounds the arc, not just its ends", () => {
    // A half turn: the two ends are level, so only the arc reaches upwards.
    const cad = threePoint(p(0, 0), p(100, 0), p(-100, 0), p(0, 100))
    const bounds = entityBounds(dim(cad))

    expect(bounds.max.y).toBeGreaterThanOrEqual(100)
    expect(bounds.min.x).toBeLessThanOrEqual(-100)
    expect(bounds.max.x).toBeGreaterThanOrEqual(100)
  })
})

describe("DIMANGULAR object selection", () => {
  it("takes an arc's centre as the vertex and its ends as the endpoints", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, 0, deg(60), { id: "A1" })],
    })
    cad.command("DIMANGULAR").click(p(100, 0)).click(p(130, 40))
    const angular = dim(cad)

    expect(angular.vertex).toBeCloseToPoint(p(0, 0))
    expect(dimensionMeasurement(angular)).toBeCloseTo(deg(60))
  })

  it("takes an arc segment of a polyline the same way", () => {
    // A semicircular bulge from (0,0) to (100,0): centre (50,0), radius 50.
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(100, 0)], { bulges: [1], id: "P1" })],
    })
    cad.command("DIMANGULAR").click(p(50, -50)).click(p(50, -80))

    expect(dim(cad).vertex).toBeCloseToPoint(p(50, 0))
    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(Math.PI)
  })

  it("uses a circle's pick as the first endpoint, and takes the second onto the circle (probes dimensions/p342, p343)", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 50, { id: "C1" })],
    })
    // Picked off the rim at 50.2, then an endpoint inside: DXF 13 (50,0) and
    // 14 (0,50).
    cad.command("DIMANGULAR").click(p(50.2, 0)).click(p(0, 40)).click(p(30, 30))
    const angular = dim(cad)

    expect(angular.vertex).toBeCloseToPoint(p(0, 0))
    expect(angular.first).toBeCloseToPoint(p(50, 0))
    expect(angular.second).toBeCloseToPoint(p(0, 50))
    expect(dimensionMeasurement(angular)).toBeCloseTo(Math.PI / 2)
  })

  it("takes two lines, using their intersection as the vertex", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(200, 0), { id: "L1" }),
        lineOf(p(0, 0), p(0, 200), { id: "L2" }),
      ],
    })
    cad.command("DIMANGULAR").click(p(100, 0)).click(p(0, 100)).click(p(60, 60))
    const angular = dim(cad)

    expect(angular.vertex).toBeCloseToPoint(p(0, 0))
    expect(dimensionMeasurement(angular)).toBeCloseTo(Math.PI / 2)
  })

  it("keeps the two-line arc under 180° whichever quadrant is chosen", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-200, 0), p(200, 0), { id: "L1" }),
        lineOf(p(0, -200), p(0, 200), { id: "L2" }),
      ],
    })
    // A crossing pair spans four quadrants; the location picks one, and each
    // line's ray is taken towards it.
    cad
      .command("DIMANGULAR")
      .click(p(100, 0))
      .click(p(0, -100))
      .click(p(-60, -60))
    const angular = dim(cad)

    expect(dimensionMeasurement(angular)).toBeCloseTo(Math.PI / 2)
    expect(angular.first.x).toBeLessThan(0)
    expect(angular.second.y).toBeLessThan(0)
  })

  it("asks again in silence on nothing", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.command("DIMANGULAR").click(p(500, 500))

    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog().join("\n")).not.toContain("Object selected")
    expect(cad.activeToolId()).toBe("dimangular")
  })

  it("refuses a text or an ellipse in AutoCAD's words (probes dimensions/p354, p355)", () => {
    const cad = createHarness({
      entities: [
        textOf(p(-20, -80), "ABC", { id: "T", height: 5 }),
        ellipseOf(p(0, -150), p(50, 0), 0.4, { id: "E" }),
      ],
    })
    cad.command("DIMANGULAR").click(p(-19, -79))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a line, arc or circle."
    )
    cad.click(p(50, -150))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a line, arc or circle."
    )
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Select arc, circle, line, or <specify vertex>:"
    )
  })

  it("refuses a circle as the second line and asks again (probe dimensions/p358)", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, -200), 50, { id: "C" }), ...crossing()],
    })
    cad.command("DIMANGULAR").click(p(60, 0)).click(p(50, -200))
    expect(cad.commandLog().at(-1)).toBe("Object selected is not a line.")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Select second line:"
    )
    cad.click(polar(60, 30)).click(polar(40, 15))
    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(deg(30))
  })

  it("says the same line twice is parallel and ends (probe dimensions/p349)", () => {
    const cad = createHarness({ entities: crossing() })
    cad.command("DIMANGULAR").click(p(60, 0)).click(p(-60, 0))

    expect(cad.commandLog().at(-1)).toBe("Lines are parallel.")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts().dimension).toBeUndefined()
  })

  it("says parallel lines are parallel and ends (probe dimensions/p350)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "L1" }),
        lineOf(p(-100, 20), p(100, 20), { id: "L3" }),
      ],
    })
    cad.command("DIMANGULAR").click(p(60, 0)).click(p(60, 20))

    expect(cad.commandLog().at(-1)).toBe("Lines are parallel.")
    expect(cad.activeToolId()).toBe("select")
  })

  it("pairs two straight segments of one polyline (probe dimensions/p367)", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P" })],
    })
    cad.command("DIMANGULAR").click(p(50, 0)).click(p(100, 50)).click(p(80, 20))

    expect(dim(cad).vertex).toBeCloseToPoint(p(100, 0))
    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(Math.PI / 2)
  })

  it("takes the sector of a line pair the location is in (probes dimensions/p344–p348)", () => {
    for (const [bearing, expected] of [
      [15, 30],
      [100, 150],
      [160, 150],
      [195, 30],
      [280, 150],
    ] as const) {
      const cad = createHarness({ entities: crossing() })
      cad
        .command("DIMANGULAR")
        .click(p(60, 0))
        .click(polar(60, 30))
        .click(polar(40, bearing))
      expect(dimensionMeasurement(dim(cad))).toBeCloseTo(deg(expected))
    }
  })

  it("draws no extension line where its arc crosses the lines (probes dimensions/p344, p346)", () => {
    const cad = createHarness({ entities: crossing() })
    cad
      .command("DIMANGULAR")
      .click(p(60, 0))
      .click(polar(60, 30))
      .click(p(38.637033, 10.352762))
    const g = dimensionGeometry(dim(cad))

    // The exploded dimension: an ARC at 40, two SOLIDs, the MTEXT, no LINE.
    expect(g.arc!.radius).toBeCloseTo(40)
    expect(g.lines).toHaveLength(0)
  })

  it("takes lines on a locked layer, and points typed at both object prompts (probes dimensions/p315, p335)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      crossing().map((line) => ({ ...line, layerId: "K" })),
      { layers: [layerOf("0"), layerOf("K", { locked: true })] }
    )
    cad.command("DIMANGULAR")
    answer(cad, "60,0")
    answer(cad, "51.961524,30")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMANGULAR Specify dimension arc line location or [Text/Angle]:"
    )
    // @ from the second pick (p335: 150 at 56.96,35).
    answer(cad, "@5,5")
    expect(dim(cad).linePoint).toBeCloseToPoint(p(56.961524, 35))
    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(deg(150))
  })

  it("reads @ at the location from the last endpoint, and leaves LASTPOINT there (probe dimensions/p362)", () => {
    const cad = createHarness()
    answer(cad, "POINT")
    answer(cad, "7,8")
    answer(cad, "DIMANGULAR")
    answer(cad, "")
    for (const point of ["0,0", "10,0", "0,10", "@5,5"]) answer(cad, point)
    expect(dim(cad).linePoint).toBeCloseToPoint(p(5, 15))
    answer(cad, "ID")
    answer(cad, "@")
    expect(cad.commandLog().at(-1)).toBe(" X = 5.00     Y = 15.00     Z = 0.00")
  })

  it("ends with nothing at Enter at the location (probe dimensions/p369)", () => {
    const cad = createHarness({ entities: crossing() })
    cad
      .command("DIMANGULAR")
      .click(p(60, 0))
      .click(polar(60, 30))
      .moveTo(polar(40, 15))
      .enter()

    // The console appends no DIMENSION there, where DIMRADIUS's Enter does.
    expect(cad.typeCounts().dimension).toBeUndefined()
    expect(cad.activeToolId()).toBe("select")
  })

  it("highlights the object under the cursor while picking", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, 0, deg(60), { id: "A1" })],
    })
    cad.command("DIMANGULAR")
    const highlights = () =>
      cad
        .scene()
        .primitives.filter(
          (primitive) =>
            "stroke" in primitive &&
            primitive.stroke?.color === THEME.entityHover &&
            primitive.stroke.width === 2
        ).length

    cad.moveTo(p(500, 500))
    expect(highlights()).toBe(0)
    cad.moveTo(p(100, 0))
    expect(highlights()).toBeGreaterThan(0)
  })
})

describe("DIMANGULAR keywords", () => {
  const start = (): CadHarness => {
    const cad = createHarness()
    cad
      .command("DIMANGULAR")
      .enter()
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(0, 100))
    return cad
  }

  it("offers only Text and Angle at the location prompt", () => {
    expect(start().optionAbbreviations()).toEqual(["T", "A"])
  })

  it("offers nothing at the object prompt", () => {
    const cad = createHarness()
    cad.command("DIMANGULAR")
    expect(cad.optionAbbreviations()).toEqual([])
  })

  it("substitutes the measurement into a Text override", () => {
    const cad = start()
    cad.option("Text").type("<> TYP").enter().click(p(60, 60))

    expect(dimensionText(dim(cad))).toBe("90° TYP")
  })

  it("sets the text angle with Angle", () => {
    const cad = start()
    cad.option("Angle").type("30").enter().click(p(60, 60))

    expect(dimensionGeometry(dim(cad)).textAngle).toBeCloseToAngle(deg(30))
  })
})

describe("angular dimensions elsewhere in the app", () => {
  it("draws its dimension line as an arc primitive", () => {
    const cad = quarter(p(100, 0))
    // Away from the dimension: hovering it would add a rollover preview of the
    // very primitives being counted.
    cad.moveTo(p(600, 600))
    const arcs = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "arc")

    expect(arcs).toHaveLength(1)
    // Filled arrowheads, never stroked, plus the measurement.
    expect(
      cad.scene().primitives.filter((primitive) => primitive.kind === "path")
    ).toHaveLength(2)
  })

  it("previews exactly what it commits", () => {
    const cad = createHarness()
    cad
      .command("DIMANGULAR")
      .enter()
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(0, 100))
    cad.moveTo(p(60, 60))
    const preview = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "text")
      .map((primitive) => (primitive as { text: string }).text)

    cad.click(p(60, 60))
    expect(preview).toContain(dimensionText(dim(cad)))
  })

  it("carries the vertex through a rotation and a reflection", () => {
    const angular = dim(quarter())
    const turned = rotateEntity(angular, p(0, 0), deg(90)) as DimensionEntity
    const flipped = mirrorEntity(angular, p(0, 0), p(0, 100)) as DimensionEntity

    expect(turned.vertex).toBeCloseToPoint(p(0, 0))
    expect(flipped.vertex).toBeCloseToPoint(p(0, 0))
    // Reflection reverses the turn, so the same sweep is still measured.
    expect(dimensionMeasurement(flipped)).toBeCloseTo(Math.PI / 2)
  })

  it("survives a save and reload with its vertex", () => {
    const cad = threePoint(p(10, 20), p(110, 20), p(10, 120), p(70, 80))
    const reloaded = parseDrawingFile(cad.runtime.serializeDrawing())
    const angular = reloaded.entities.find(
      (entity) => entity.type === "dimension"
    ) as DimensionEntity

    expect(angular.kind).toBe("angular")
    expect(angular.vertex).toBeCloseToPoint(p(10, 20))
    expect(dimensionMeasurement(angular)).toBeCloseTo(Math.PI / 2)
  })

  it("shows the measurement as an angle in the properties palette", () => {
    const cad = quarter()
    cad.select(dim(cad).id)
    const rows = cad
      .state()
      .properties.info!.groups.flatMap((group) => group.rows)

    expect(rows.find((row) => row.label === "Measurement")?.value).toBe("90°")
    // AutoCAD names the kind in the title and has no definition point row
    // (desktop dimensions/d04-7).
    expect(cad.state().properties.info!.title).toBe("Angular Dimension")
    expect(rows.find((row) => row.label === "Vertex X")).toBeUndefined()
  })

  it("cannot serve as the base of a dimension chain", () => {
    // DIMBASELINE opens straight at its second-point prompt (which offers
    // Select) when there is something to chain from, and at its own Select
    // prompt (which offers nothing) when there is not.
    const chainable = createHarness()
    chainable
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(0, -40))
    chainable.command("DIMBASELINE")
    expect(chainable.optionAbbreviations()).toEqual(["S", "U"])

    const cad = quarter()
    cad.command("DIMBASELINE")
    expect(cad.optionAbbreviations()).toEqual([])
  })
})
