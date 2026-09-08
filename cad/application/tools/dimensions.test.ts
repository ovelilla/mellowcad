import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import { lineOf, p, polylineOf, circleOf } from "../../../test/builders"
import {
  DimensionEntity,
  dimensionGeometry,
  dimensionMeasurement,
  dimensionText,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"

/** Places a linear/aligned dimension over two points by clicking three times. */
function dimension(
  command: string,
  first: { x: number; y: number },
  second: { x: number; y: number },
  location: { x: number; y: number }
) {
  const cad = createHarness()
  cad.command(command).click(first).click(second).click(location)
  return cad
}

describe("DIMLINEAR", () => {
  it("measures horizontally when the dimension line is dragged vertically", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 40), p(50, 90))
    const dim = cad.only<DimensionEntity>("dimension")

    expect(dim.kind).toBe("linear")
    expect(dim.rotation).toBeCloseTo(0)
    expect(dimensionMeasurement(dim)).toBeCloseTo(100)
  })

  it("measures vertically when the dimension line is dragged sideways", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 40), p(180, 20))
    const dim = cad.only<DimensionEntity>("dimension")

    expect(dim.rotation).toBeCloseTo(Math.PI / 2)
    expect(dimensionMeasurement(dim)).toBeCloseTo(40)
  })

  it("measures a vertical pair as soon as the location leaves it sideways", () => {
    // The origins span no width at all, so even a small sideways drag can only
    // mean "measure the height" — comparing against their midpoint instead read
    // the zero width until the drag passed half the line.
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 100))
      .click(p(0, -100))
      // Beside the lower end: barely out sideways, far from the midpoint.
      .moveTo(p(15, -90))

    const preview = cad.scene().primitives.find((prim) => prim.kind === "text")
    expect(preview && preview.kind === "text" && preview.text).toBe("200.00")

    cad.click(p(15, -90))
    expect(
      dimensionMeasurement(cad.only<DimensionEntity>("dimension"))
    ).toBeCloseTo(200)
  })

  it("measures a horizontal pair as soon as the location leaves it upwards", () => {
    const cad = dimension("DIMLINEAR", p(-100, 0), p(100, 0), p(-90, 15))
    expect(
      dimensionMeasurement(cad.only<DimensionEntity>("dimension"))
    ).toBeCloseTo(200)
  })

  it("ends after the dimension line location, like AutoCAD", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 40))
    expect(cad.activeToolId()).toBe("select")
  })

  it("offers AutoCAD's keywords only at the location prompt", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR")
    expect(cad.optionKeys()).toEqual([])

    cad.click(p(0, 0)).click(p(100, 0)).moveTo(p(50, 40))
    expect(cad.optionKeys()).toEqual(["T", "A", "H", "V", "R"])
  })

  it("Horizontal and Vertical override the direction the drag implies", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 40))
      // Dragged sideways, which would otherwise measure vertically.
      .moveTo(p(180, 20))
      .option("h")
      .click(p(180, 20))

    expect(
      dimensionMeasurement(cad.only<DimensionEntity>("dimension"))
    ).toBeCloseTo(100)
  })

  it("Rotated measures along a typed angle", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 100))
      .moveTo(p(50, 150))
      .option("r")
      .type("45")
      .enter()
      .click(p(50, 150))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.rotation).toBeCloseTo(Math.PI / 4)
    // The full diagonal, since it now measures along it.
    expect(dimensionMeasurement(dim)).toBeCloseTo(Math.hypot(100, 100))
  })

  it("Text replaces the measurement, and <> stands in for it", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 0))
      .moveTo(p(50, 40))
      .option("t")
      .type("approx <>")
      .enter()
      .click(p(50, 40))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.text).toBe("approx <>")
    expect(dimensionText(dim)).toBe("approx 100.00")
  })

  it("Angle sets the text angle without touching the measurement", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 0))
      .moveTo(p(50, 40))
      .option("a")
      .type("30")
      .enter()
      .click(p(50, 40))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dimensionGeometry(dim).textAngle).toBeCloseTo(Math.PI / 6)
    expect(dimensionMeasurement(dim)).toBeCloseTo(100)
  })

  it("takes both origins from an object when Enter picks one", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    cad
      .command("DIMLINEAR")
      .enter() // <select object>
      .click(p(40, 0))
      .click(p(40, 50))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.first).toBeCloseToPoint(p(0, 0))
    expect(dim.second).toBeCloseToPoint(p(80, 0))
  })

  it("dimensions the picked segment of a polyline", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(60, 0), p(60, 90)])],
    })
    cad.command("DIMLINEAR").enter().click(p(60, 45)).click(p(120, 45))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.first).toBeCloseToPoint(p(60, 0))
    expect(dim.second).toBeCloseToPoint(p(60, 90))
  })

  it("uses the diameter through the pick point of a circle", () => {
    const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })
    cad.command("DIMLINEAR").enter().click(p(50, 0)).click(p(0, 90))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dimensionMeasurement(dim)).toBeCloseTo(100)
  })

  it("highlights the object it would measure while hovering", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    cad.command("DIMLINEAR").enter().moveTo(p(40, 0))

    const highlighted = cad
      .scene()
      .primitives.filter(
        (prim) => "stroke" in prim && prim.stroke?.color === THEME.selected
      )
    expect(highlighted.length).toBeGreaterThan(0)
  })

  it("is one undo step", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 40))
    expect(cad.entityCount).toBe(1)
    cad.undo()
    expect(cad.entityCount).toBe(0)
  })

  it("Escape before the location leaves nothing behind", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0)).escape()
    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("DIMALIGNED", () => {
  it("measures the true distance between the origins", () => {
    const cad = dimension("DIMALIGNED", p(0, 0), p(60, 80), p(-40, 60))
    const dim = cad.only<DimensionEntity>("dimension")

    expect(dim.kind).toBe("aligned")
    expect(dimensionMeasurement(dim)).toBeCloseTo(100)
  })

  it("offers only Text and Angle — it has no Horizontal/Vertical/Rotated", () => {
    const cad = createHarness()
    cad.command("DIMALIGNED").click(p(0, 0)).click(p(60, 80)).moveTo(p(-40, 60))
    expect(cad.optionKeys()).toEqual(["T", "A"])
  })

  it("keeps measuring the origins even when they are moved", () => {
    const cad = dimension("DIMALIGNED", p(0, 0), p(60, 80), p(-40, 60))
    const dim = cad.only<DimensionEntity>("dimension")
    const moved: DimensionEntity = { ...dim, second: p(30, 40) }
    expect(dimensionMeasurement(moved)).toBeCloseTo(50)
  })
})

describe("dimension geometry", () => {
  const style = DEFAULT_DIM_STYLE

  it("projects the origins onto the dimension line", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 40), p(50, 90))
    const g = dimensionGeometry(cad.only<DimensionEntity>("dimension"), style)

    expect(g.lineStart).toBeCloseToPoint(p(0, 90))
    expect(g.lineEnd).toBeCloseToPoint(p(100, 90))
  })

  it("offsets each extension line from its origin and past the line", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    const g = dimensionGeometry(cad.only<DimensionEntity>("dimension"), style)

    expect(g.lines[0][0]).toBeCloseToPoint(p(0, style.extensionOffset))
    expect(g.lines[0][1]).toBeCloseToPoint(p(0, 50 + style.extensionBeyond))
  })

  it("puts the text above the dimension line, kept readable", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    const g = dimensionGeometry(cad.only<DimensionEntity>("dimension"), style)

    expect(g.textPosition).toBeCloseToPoint(p(50, 50 + style.textGap))
    expect(g.textAngle).toBeCloseTo(0)
    expect(g.text).toBe("100.00")
  })

  it("anchors the text on its baseline, not the em box", () => {
    // DIMGAP is a gap to the glyphs. Anchoring on canvas's "bottom" adds the
    // descender space digits never use, which pushed the number of a baseline
    // chain across the neighbouring dimension line — DIMTXT + DIMGAP is only
    // just under DIMDLI, so there is nothing to spare.
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    const text = cad.scene().primitives.find((prim) => prim.kind === "text")

    expect(text && text.kind === "text" && text.baseline).toBe("alphabetic")
  })

  it("never reads upside down", () => {
    // Measuring right-to-left would give a 180° baseline; it folds back to 0.
    const cad = dimension("DIMLINEAR", p(100, 0), p(0, 0), p(50, 50))
    const g = dimensionGeometry(cad.only<DimensionEntity>("dimension"), style)
    expect(Math.abs(g.textAngle)).toBeLessThanOrEqual(Math.PI / 2 + 1e-9)
  })

  it("draws extension lines, the dimension line, two filled arrows and the text", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    // Away from the dimension: hovering it would add a rollover preview of the
    // very primitives being counted.
    cad.moveTo(p(400, 400))
    const arrows = cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "path" && prim.fill !== undefined
      )
    expect(arrows).toHaveLength(2)
    // Fill only: an outline round so sharp a point spikes past the tip, by a
    // screen-pixel amount that would not shrink when zooming out.
    expect(arrows.every((arrow) => !("stroke" in arrow) || !arrow.stroke)).toBe(
      true
    )
    expect(
      cad.scene().primitives.filter((prim) => prim.kind === "text")
    ).toHaveLength(1)
  })
})

describe("DIMSCALE", () => {
  /** A 100-wide dimension read back through the current style. */
  function measured(scale: number) {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    cad.runtime.setDimScale(scale)
    const dim = cad.only<DimensionEntity>("dimension")
    const style = cad.runtime.document.getDimStyle(dim.styleId)!
    return { cad, dim, geometry: dimensionGeometry(dim, style) }
  }

  it("starts at 1, AutoCAD's initial value", () => {
    const cad = createHarness()
    expect(cad.state().dimScale).toBe(1)
  })

  it("scales the text, arrows and offsets", () => {
    const plain = measured(1).geometry
    const big = measured(10).geometry

    expect(big.textHeight).toBeCloseTo(plain.textHeight * 10)
    // The extension line starts ten times further from the measured point.
    expect(big.lines[0][0].y).toBeCloseTo(plain.lines[0][0].y * 10)
    // And the arrowhead is ten times longer along the dimension line.
    const armOf = (g: typeof plain) =>
      Math.abs(g.arrows[0][1].x - g.arrows[0][0].x)
    expect(armOf(big)).toBeCloseTo(armOf(plain) * 10)
  })

  it("never touches the measurement — DIMSCALE is not a unit factor", () => {
    const { dim, geometry } = measured(50)
    expect(dimensionMeasurement(dim)).toBeCloseTo(100)
    expect(geometry.text).toBe("100.00")
    // The dimension line still spans the real distance.
    expect(geometry.lineEnd.x - geometry.lineStart.x).toBeCloseTo(100)
  })

  it("folds an unusable factor back to 1, as AutoCAD does without paper space", () => {
    const cad = createHarness()
    // DIMSCALE 0 means "derive it from the viewport", which AutoCAD defines as
    // exactly 1 when there is no paper space.
    cad.runtime.setDimScale(0)
    expect(cad.state().dimScale).toBe(1)
    cad.runtime.setDimScale(-5)
    expect(cad.state().dimScale).toBe(1)
  })

  it("survives a save and reload", () => {
    const cad = createHarness()
    cad.runtime.setDimScale(25)
    const reopened = parseDrawingFile(cad.runtime.serializeDrawing())
    expect(reopened.dimStyles[0].scale).toBe(25)
  })
})

describe("dimension grips", () => {
  /** A 100-wide horizontal dimension with its line 50 above the origins. */
  function placed() {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    const dim = cad.only<DimensionEntity>("dimension")
    cad.tool("select").select(dim.id)
    return { cad, dim }
  }

  it("shows a grip on each origin and on the dimension line", () => {
    const { cad } = placed()
    // Three square grips: the two origins and the dimension line's midpoint.
    const grips = cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "rect" && prim.fill === THEME.grip
      )
    expect(grips).toHaveLength(3)
  })

  it("dragging an origin restates the measurement", () => {
    const { cad, dim } = placed()
    cad.drag(p(100, 0), p(160, 0))

    const edited = cad.byId<DimensionEntity>(dim.id)
    expect(edited.second).toBeCloseToPoint(p(160, 0))
    expect(dimensionMeasurement(edited)).toBeCloseTo(160)
  })

  it("dragging the dimension line slides it without changing the measurement", () => {
    const { cad, dim } = placed()
    cad.drag(p(50, 50), p(50, 90))

    const edited = cad.byId<DimensionEntity>(dim.id)
    expect(dimensionGeometry(edited).lineStart).toBeCloseToPoint(p(0, 90))
    expect(dimensionMeasurement(edited)).toBeCloseTo(100)
    expect(edited.first).toBeCloseToPoint(dim.first)
  })

  it("a grip edit is one undo step and keeps the id", () => {
    const { cad, dim } = placed()
    cad.drag(p(100, 0), p(160, 0))
    cad.undo()

    const restored = cad.byId<DimensionEntity>(dim.id)
    expect(restored.second).toBeCloseToPoint(p(100, 0))
  })
})

describe("dimension properties palette", () => {
  it("shows the measurement read-only and the direction editable", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    cad.tool("select").select(cad.only<DimensionEntity>("dimension").id)

    const rows = cad
      .state()
      .selectionInfo!.groups.flatMap((group) => group.rows)
    const measurement = rows.find((row) => row.label === "Measurement")!
    expect(measurement.value).toContain("100.00")
    expect(measurement.edit).toBeUndefined()
    expect(rows.find((row) => row.label === "Rotation")?.edit?.property).toBe(
      "dimensionRotation"
    )
  })

  it("has no editable direction when it is aligned", () => {
    const cad = dimension("DIMALIGNED", p(0, 0), p(60, 80), p(-40, 60))
    cad.tool("select").select(cad.only<DimensionEntity>("dimension").id)

    const rows = cad
      .state()
      .selectionInfo!.groups.flatMap((group) => group.rows)
    expect(rows.find((row) => row.label === "Rotation")).toBeUndefined()
  })
})
