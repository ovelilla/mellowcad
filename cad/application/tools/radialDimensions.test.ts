import { describe, expect, it } from "vitest"
import { createHarness, CadHarness } from "../../../test/harness"
import { arcOf, circleOf, lineOf, p, polylineOf } from "../../../test/builders"
import {
  DimensionEntity,
  dimensionGeometry,
  dimensionMeasurement,
  dimensionText,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"

/** A circle of radius 50 at the origin, the object both commands measure. */
function ring() {
  return circleOf(p(0, 0), 50, { id: "C1" })
}

/** Runs a radial command: pick the circle at its rim, then place the text. */
function radial(
  command: string,
  location: { x: number; y: number },
  entities = [ring()]
): CadHarness {
  const cad = createHarness({ entities })
  cad.command(command).click(p(50, 0)).click(location)
  return cad
}

function dim(cad: CadHarness): DimensionEntity {
  return cad.only<DimensionEntity>("dimension")
}

describe("DIMRADIUS", () => {
  it("measures the radius and marks it with an R", () => {
    const cad = radial("DIMRADIUS", p(30, 0))
    const radius = dim(cad)

    expect(radius.kind).toBe("radius")
    expect(dimensionMeasurement(radius)).toBeCloseTo(50)
    expect(dimensionText(radius)).toBe("R50")
  })

  it("takes the direction of the dimension line from the location", () => {
    const cad = radial("DIMRADIUS", p(0, 30))
    // The measured point is where the radius meets the circle, straight up.
    expect(dim(cad).second).toBeCloseToPoint(p(0, 50))
  })

  it("runs the dimension line from the centre when placed inside", () => {
    const g = dimensionGeometry(dim(radial("DIMRADIUS", p(30, 0))))

    expect(g.lineStart).toBeCloseToPoint(p(0, 0))
    expect(g.lineEnd).toBeCloseToPoint(p(50, 0))
    expect(g.arrows).toHaveLength(1)
    // No centre mark: the dimension line already reaches the centre.
    expect(g.lines).toHaveLength(0)
  })

  it("becomes a leader with a centre mark when placed outside", () => {
    const g = dimensionGeometry(dim(radial("DIMRADIUS", p(80, 0))))
    const size = DEFAULT_DIM_STYLE.centerMark

    expect(g.lineStart).toBeCloseToPoint(p(80, 0))
    expect(g.lineEnd).toBeCloseToPoint(p(50, 0))
    expect(g.lines).toEqual([
      [p(-size, 0), p(size, 0)],
      [p(0, -size), p(0, size)],
    ])
  })

  it("points the arrowhead at the circle either way round", () => {
    const inside = dimensionGeometry(dim(radial("DIMRADIUS", p(30, 0))))
    const outside = dimensionGeometry(dim(radial("DIMRADIUS", p(80, 0))))

    // The tip is on the rim in both, but the head lies on the drawn side of it.
    expect(inside.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(outside.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(inside.arrows[0][1].x).toBeLessThan(50)
    expect(outside.arrows[0][1].x).toBeGreaterThan(50)
  })

  it("puts the text where it was placed, above the dimension line", () => {
    const g = dimensionGeometry(dim(radial("DIMRADIUS", p(30, 0))))
    expect(g.textPosition).toBeCloseToPoint(p(30, DEFAULT_DIM_STYLE.textGap))
  })
})

describe("DIMDIAMETER", () => {
  it("measures the diameter and marks it with a diameter symbol", () => {
    const cad = radial("DIMDIAMETER", p(30, 0))
    const diameter = dim(cad)

    expect(diameter.kind).toBe("diameter")
    expect(dimensionMeasurement(diameter)).toBeCloseTo(100)
    expect(dimensionText(diameter)).toBe("\u00d8100")
  })

  it("draws right across the circle, with an arrow at each end", () => {
    const g = dimensionGeometry(dim(radial("DIMDIAMETER", p(30, 0))))

    expect(g.lineStart).toBeCloseToPoint(p(-50, 0))
    expect(g.lineEnd).toBeCloseToPoint(p(50, 0))
    expect(g.arrows).toHaveLength(2)
    expect(g.lines).toHaveLength(0)
  })

  it("keeps both arrowheads on the circle when placed outside", () => {
    const g = dimensionGeometry(dim(radial("DIMDIAMETER", p(80, 0))))

    expect(g.lineStart).toBeCloseToPoint(p(80, 0))
    expect(g.arrows).toHaveLength(2)
    expect(g.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(g.arrows[1][0]).toBeCloseToPoint(p(-50, 0))
    // A stub for the far arrowhead, plus the two runs of the centre mark.
    expect(g.lines).toHaveLength(3)
  })
})

describe("radial dimensions", () => {
  it("measures an arc, keeping the arrowhead within its sweep", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "A1" })],
    })
    // Picked on the arc, but the text placed well below it, off the sweep.
    cad.command("DIMRADIUS").click(p(35.36, 35.36)).click(p(30, -30))

    expect(dim(cad).second).toBeCloseToPoint(p(50, 0))
  })

  it("measures an arc segment of a polyline", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, 0), p(0, 0), p(100, 0)], {
          bulges: [0, 1],
          id: "P1",
        }),
      ],
    })
    // The second segment bulges into a semicircle of radius 50 at (50,0).
    cad.command("DIMRADIUS").click(p(50, -50)).click(p(50, -30))

    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(50)
    expect(dim(cad).first).toBeCloseToPoint(p(50, 0))
  })

  it("ignores objects with no circle to measure", () => {
    const cad = createHarness({ entities: [lineOf(p(-50, 0), p(50, 0))] })
    cad.command("DIMRADIUS").click(p(0, 0)).click(p(30, 30))

    expect(cad.typeCounts().dimension).toBeUndefined()
    expect(cad.activeToolId()).toBe("dimradius")
  })

  it("highlights the object under the cursor while selecting", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMDIAMETER")

    const amber = () =>
      cad
        .scene()
        .primitives.filter(
          (prim) => "stroke" in prim && prim.stroke?.color === THEME.selected
        ).length

    cad.moveTo(p(300, 300))
    expect(amber()).toBe(0)
    cad.moveTo(p(50, 0))
    expect(amber()).toBeGreaterThan(0)
  })

  it("offers Text and Angle only at the location prompt", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS")
    expect(cad.optionAbbreviations()).toEqual([])

    cad.click(p(50, 0))
    expect(cad.optionAbbreviations()).toEqual(["T", "A"])
  })

  it("Text replaces the measurement, and <> stands in for the bare number", () => {
    const cad = createHarness({ entities: [ring()] })
    cad
      .command("DIMRADIUS")
      .click(p(50, 0))
      .option("Text")
      .type("R<> TYP")
      .enter()
      .click(p(30, 0))

    expect(dimensionText(dim(cad))).toBe("R50 TYP")
  })

  it("Angle turns the text", () => {
    const cad = createHarness({ entities: [ring()] })
    cad
      .command("DIMRADIUS")
      .click(p(50, 0))
      .option("Angle")
      .type("30")
      .enter()
      .click(p(30, 0))

    expect(dimensionGeometry(dim(cad)).textAngle).toBeCloseTo(Math.PI / 6)
  })

  it("accepts a typed location", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS").click(p(50, 0)).type("#0,30").enter()

    expect(dim(cad).second).toBeCloseToPoint(p(0, 50))
  })

  it("previews the dimension before the location is picked", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMDIAMETER").click(p(50, 0)).moveTo(p(30, 0))

    const preview = cad.scene().primitives.find((prim) => prim.kind === "text")
    expect(preview && preview.kind === "text" && preview.text).toBe("Ø100")
    expect(cad.typeCounts().dimension).toBeUndefined()
  })

  it("ends after the location, and adds the dimension in one undo step", () => {
    const cad = radial("DIMRADIUS", p(30, 0))
    expect(cad.activeToolId()).toBe("select")

    cad.undo()
    expect(cad.typeCounts().dimension).toBeUndefined()
  })

  it("draws nothing on Escape", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS").click(p(50, 0)).escape()

    expect(cad.typeCounts().dimension).toBeUndefined()
    expect(cad.activeToolId()).toBe("select")
  })

  it("scales the centre mark with DIMSCALE, being a plotted size", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.runtime.setDimScale(10)
    cad.command("DIMRADIUS").click(p(50, 0)).click(p(80, 0))

    const style = cad.runtime.document.getDimStyle(dim(cad).styleId)!
    const g = dimensionGeometry(dim(cad), style)
    expect(g.lines[0][1].x).toBeCloseTo(10 * DEFAULT_DIM_STYLE.centerMark)
  })

  it("names the kind in the properties palette", () => {
    const cad = radial("DIMDIAMETER", p(30, 0))
    cad.select(dim(cad).id)

    // In the title, as AutoCAD's (desktop dimensions/d04-5), with the centre
    // mark among the lines and arrows.
    expect(cad.state().properties.info?.title).toBe("Diametric Dimension")
    const rows = cad.state().properties.info?.groups[1].rows ?? []
    expect(rows.map((row) => row.label)).toContain("Center mark size")
  })

  it("survives a save and reload", () => {
    const cad = radial("DIMDIAMETER", p(30, 0))
    const parsed = parseDrawingFile(cad.runtime.serializeDrawing())
    const restored = parsed.entities.find(
      (entity): entity is DimensionEntity => entity.type === "dimension"
    )!

    expect(restored.kind).toBe("diameter")
    expect(dimensionMeasurement(restored)).toBeCloseTo(100)
    expect(parsed.dimStyles[0].centerMark).toBe(DEFAULT_DIM_STYLE.centerMark)
  })

  it("cannot be used as the base of a chain or of DIMSPACE", () => {
    const cad = radial("DIMRADIUS", p(80, 0))
    const location = p(80, 0)

    cad.command("DIMBASELINE").click(location)
    // Still asking for a base: a radius has no second extension line origin.
    expect(cad.optionAbbreviations()).toEqual([])

    cad.escape()
    cad.command("DIMSPACE").click(location)
    expect(cad.optionAbbreviations()).toEqual([])
  })
})
