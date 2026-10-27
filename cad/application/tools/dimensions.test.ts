import { describe, expect, it } from "vitest"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"
import { V } from "../../geometry/Vec2"
import {
  createBlockDefinition,
  createDimension,
  createInsert,
  createSpline,
  DimensionEntity,
  dimensionGeometry,
  dimensionMeasurement,
  dimensionText,
  entityElevation,
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

/** The console's fixed cursor in its initial view (`console.md`). */
const CONSOLE_CURSOR = p(289.98397, 116.30379)

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
    expect(preview && preview.kind === "text" && preview.text).toBe("200")

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
    expect(cad.optionAbbreviations()).toEqual([])

    cad.click(p(0, 0)).click(p(100, 0)).moveTo(p(50, 40))
    expect(cad.optionAbbreviations()).toEqual(["T", "A", "H", "V", "R"])
  })

  it("Horizontal and Vertical override the direction the drag implies", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 40))
      // Dragged sideways, which would otherwise measure vertically.
      .moveTo(p(180, 20))
      .option("Horizontal")
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
      .option("Rotated")
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
      .option("Text")
      .type("approx <>")
      .enter()
      .click(p(50, 40))

    const dim = cad.only<DimensionEntity>("dimension")
    expect(dim.text).toBe("approx <>")
    expect(dimensionText(dim)).toBe("approx 100")
  })

  it("Angle sets the text angle without touching the measurement", () => {
    const cad = createHarness()
    cad
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(100, 0))
      .moveTo(p(50, 40))
      .option("Angle")
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

  // The pick at 45° (p109): a diameter through it would measure 70.71.
  it("measures a circle's diameter along the direction it settles on (probes dimensions/p109, p114, p115)", () => {
    const placed = (...answers: string[]) => {
      const cad = createHarness({ entities: [circleOf(p(0, 0), 50)] })
      cad.command("DIMLINEAR").enter().moveTo(CONSOLE_CURSOR)
      answer(cad, "35.35534,35.35534", ...answers)
      return cad.only<DimensionEntity>("dimension")
    }
    const above = placed("0,90")
    expect([above.first, above.second]).toBeCloseToPoints([p(50, 0), p(-50, 0)])
    expect(dimensionMeasurement(above)).toBeCloseTo(100)
    const beside = placed("90,0")
    expect([beside.first, beside.second]).toBeCloseToPoints([
      p(0, 50),
      p(0, -50),
    ])
    const rotated = placed("R", "30", "0,90")
    expect([rotated.first, rotated.second]).toBeCloseToPoints([
      p(43.30127, 25),
      p(-43.30127, -25),
    ])
    expect(dimensionMeasurement(rotated)).toBeCloseTo(100)
  })

  it("rolls the object it would measure over in the hover glow (DLN-16)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    cad.command("DIMLINEAR").enter().moveTo(p(40, 0))

    const strokes = cad
      .scene()
      .primitives.flatMap((prim) =>
        "stroke" in prim && prim.stroke ? [prim.stroke] : []
      )
    expect(strokes).toContainEqual({ color: THEME.entityHover, width: 2 })
    expect(strokes.some((s) => s.color === THEME.selected)).toBe(false)
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
    expect(cad.optionAbbreviations()).toEqual(["T", "A"])
  })

  it("keeps a circle's diameter through the pick (probes dimensions/p147, p167)", () => {
    const cad = createHarness({ entities: [circleOf(p(200, 0), 50)] })
    cad.command("DIMALIGNED").enter()
    answer(cad, "235.35534,35.35534", "250,100")
    const dim = cad.only<DimensionEntity>("dimension")
    expect([dim.first, dim.second]).toBeCloseToPoints(
      [p(235.35534, 35.35534), p(164.64466, -35.35534)],
      4
    )
    expect(dimensionGeometry(dim).lineEnd).toBeCloseToPoint(
      p(139.64466, -10.35534),
      4
    )
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
    expect(g.text).toBe("100")
  })

  it("anchors the text on its baseline, not the em box", () => {
    // DIMGAP is a gap to the glyphs. Anchoring on canvas's "bottom" adds the
    // descender space digits never use, which pushed the number of a baseline
    // chain across the neighbouring dimension line — DIMTXT + DIMGAP is only
    // just under DIMDLI, so there is nothing to spare.
    const cad = dimension("DIMLINEAR", p(0, 0), p(100, 0), p(50, 50))
    const g = dimensionGeometry(cad.only<DimensionEntity>("dimension"), style)
    const text = cad.scene().primitives.find((prim) => prim.kind === "text")

    // A text primitive's point is on its alphabetic baseline.
    expect(text?.kind === "text" && text.at).toBeCloseToPoint(
      cad.runtime.viewport.worldToScreen(g.textPosition)
    )
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
    expect(geometry.text).toBe("100")
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

  /** The world points of the grips drawn, read back from their squares. */
  function gripsOf(cad: ReturnType<typeof createHarness>) {
    return cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "rect" && prim.fill === THEME.grip
      )
      .map((prim) =>
        prim.kind === "rect"
          ? cad.toWorld({
              x: prim.min.x + prim.width / 2,
              y: prim.min.y + prim.height / 2,
            })
          : p(0, 0)
      )
  }

  /** Points as sorted text to a thousandth, comparable whatever the order. */
  function keyed(points: readonly { x: number; y: number }[]): string[] {
    const at = (v: number) => (Math.round(v * 1000) / 1000 + 0).toFixed(3)
    return points.map((q) => `${at(q.x)},${at(q.y)}`).sort()
  }

  /** One dimension, selected, as the desktop pass drew them (d01). */
  function selected(dim: DimensionEntity) {
    const cad = createHarness({ entities: [dim] })
    cad.tool("select").select(dim.id)
    return cad
  }

  it("are the origins, the dimension line's ends and the text (desktop dimensions/d01-1)", () => {
    const { cad } = placed()
    // The text's grip is its middle: DIMGAP and half DIMTXT over the line
    // (d04-2: Text position Y 11.875 over a line at 10).
    expect(keyed(gripsOf(cad))).toEqual(
      keyed([p(0, 0), p(100, 0), p(0, 50), p(100, 50), p(50, 51.875)])
    )
  })

  it("are a radius's centre, rim point and text (desktop dimensions/d01-1)", () => {
    const toward = V.normalize(p(20, 5))
    const radius = createDimension(
      "radius",
      p(20, 40),
      V.add(p(20, 40), V.scale(toward, 10)),
      p(40, 45),
      { id: "R" }
    )
    expect(keyed(gripsOf(selected(radius)))).toEqual(
      keyed([p(20, 40), radius.second, p(40, 45)])
    )
  })

  it("are a diameter's two rim points and text (desktop dimensions/d01-1)", () => {
    const diameter = createDimension(
      "diameter",
      p(70, 40),
      p(80, 40),
      p(75, 40),
      { id: "D" }
    )
    expect(keyed(gripsOf(selected(diameter)))).toEqual(
      keyed([p(80, 40), p(60, 40), p(75, 40)])
    )
  })

  it("are an angular one's vertex, endpoints, arc and text (desktop dimensions/d01-1)", () => {
    const angular = createDimension(
      "angular",
      p(30, -20),
      p(20, -5),
      p(30, -10),
      { id: "A", vertex: p(0, -20) }
    )
    const g = dimensionGeometry(angular)
    const grips = gripsOf(selected(angular))
    expect(grips).toHaveLength(5)
    expect(keyed(grips)).toEqual(
      keyed([p(0, -20), p(30, -20), p(20, -5), g.lineMidpoint, g.textPoint])
    )
  })

  it("dragging an origin restates the measurement", () => {
    const { cad, dim } = placed()
    cad.drag(p(100, 0), p(160, 0))

    const edited = cad.byId<DimensionEntity>(dim.id)
    expect(edited.second).toBeCloseToPoint(p(160, 0))
    expect(dimensionMeasurement(edited)).toBeCloseTo(160)
  })

  it("dragging an end of the dimension line moves the line through it", () => {
    const { cad, dim } = placed()
    cad.drag(p(0, 50), p(0, 90))

    const edited = cad.byId<DimensionEntity>(dim.id)
    expect(dimensionGeometry(edited).lineStart).toBeCloseToPoint(p(0, 90))
    expect(dimensionMeasurement(edited)).toBeCloseTo(100)
    expect(edited.first).toBeCloseToPoint(dim.first)
  })

  it("dragging the text moves it with its line, where it was put (desktop dimensions/d03-1)", () => {
    const cad = dimension("DIMLINEAR", p(0, 0), p(40, 0), p(20, 10))
    const dim = cad.only<DimensionEntity>("dimension")
    cad.tool("select").select(dim.id)
    cad.drag(p(20, 11.875), p(30, 20))

    const edited = cad.byId<DimensionEntity>(dim.id)
    const g = dimensionGeometry(edited)
    // The line goes through the point and the text stays there, above it.
    expect(g.lineStart).toBeCloseToPoint(p(0, 20))
    expect(edited.textPoint).toBeCloseToPoint(p(30, 20))
    expect(g.textPosition).toBeCloseToPoint(p(30, 20.625))
    expect(dimensionMeasurement(edited)).toBeCloseTo(40)
    expect(keyed(gripsOf(cad))).toContain(keyed([p(30, 20)])[0])

    // A later move of the line keeps the text at its place along it.
    cad.drag(p(40, 20), p(40, 30))
    const again = cad.byId<DimensionEntity>(dim.id)
    expect(dimensionGeometry(again).textPosition).toBeCloseToPoint(
      p(30, 30.625)
    )

    cad.undo().undo()
    expect(cad.byId<DimensionEntity>(dim.id).textPoint).toBeUndefined()
  })

  it("dragging a radial one's text swings its leader round to it", () => {
    const radius = createDimension("radius", p(0, 0), p(10, 0), p(20, 0), {
      id: "R",
    })
    const cad = selected(radius)
    cad.drag(p(20, 0), p(0, 30))

    const edited = cad.byId<DimensionEntity>("R")
    expect(edited.second).toBeCloseToPoint(p(0, 10))
    expect(edited.linePoint).toBeCloseToPoint(p(0, 30))
    expect(dimensionMeasurement(edited)).toBeCloseTo(10)
  })

  it("dragging a diameter's rim point turns its line about the centre", () => {
    const diameter = createDimension("diameter", p(0, 0), p(10, 0), p(5, 0), {
      id: "D",
    })
    const cad = selected(diameter)
    cad.drag(p(-10, 0), p(0, -30))

    const edited = cad.byId<DimensionEntity>("D")
    expect(edited.second).toBeCloseToPoint(p(0, 10))
    expect(edited.linePoint).toBeCloseToPoint(p(0, 5))
    expect(dimensionMeasurement(edited)).toBeCloseTo(20)
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
  /** The DIMLINEAR of the desktop pass (d04), selected. */
  function palette(command = "DIMLINEAR") {
    const cad = dimension(command, p(0, 0), p(40, 0), p(20, 10))
    const dim = cad.only<DimensionEntity>("dimension")
    cad.tool("select").select(dim.id)
    return { cad, dim }
  }

  const groupsOf = (cad: ReturnType<typeof createHarness>) =>
    cad.state().properties.info!.groups

  const rowOf = (cad: ReturnType<typeof createHarness>, label: string) =>
    groupsOf(cad)
      .flatMap((group) => group.rows)
      .find((row) => row.label === label)

  it("files its rows under AutoCAD's title and groups (desktop dimensions/d04-1 to d04-3)", () => {
    const { cad } = palette()
    expect(cad.state().properties.info!.title).toBe("Rotated Dimension")
    expect(
      groupsOf(cad).map(
        (group) =>
          `${group.title}: ${group.rows.map((row) => `${row.label}=${row.value}`).join(", ")}`
      )
    ).toEqual([
      "Misc: Annotative=No",
      "Lines & Arrows: Arrow size=2.5, Ext line ext=1.25, Ext line offset=0.625",
      `Text: Text height=2.5, Text offset=0.625, Text position X=${rowOf(cad, "Text position X")!.value}, Text position Y=${rowOf(cad, "Text position Y")!.value}, Text rotation=${rowOf(cad, "Text rotation")!.value}, Measurement=40, Text override=`,
      "Fit: Dim scale overall=1",
      "Primary Units: Decimal separator=,, Suppress trailing zeros=Yes, Precision=0.00",
    ])
    // The text's middle, as d04-2 reads it: 20 and 11.875.
    expect(Number(rowOf(cad, "Text position X")!.edit!.text)).toBeCloseTo(20)
    expect(Number(rowOf(cad, "Text position Y")!.edit!.text)).toBeCloseTo(
      11.875,
      1
    )
    expect(rowOf(cad, "Measurement")!.edit).toBeUndefined()
  })

  it("names each kind as AutoCAD's title does (desktop dimensions/d04-4 to d04-7)", () => {
    const titled = (dim: DimensionEntity) => {
      const cad = createHarness({ entities: [dim] })
      cad.tool("select").select(dim.id)
      return cad.state().properties.info!.title
    }
    expect(
      titled(createDimension("aligned", p(0, 0), p(30, 20), p(10, 25)))
    ).toBe("Aligned Dimension")
    expect(titled(createDimension("radius", p(0, 0), p(10, 0), p(20, 0)))).toBe(
      "Radial Dimension"
    )
    expect(
      titled(createDimension("diameter", p(0, 0), p(10, 0), p(5, 0)))
    ).toBe("Diametric Dimension")
    expect(
      titled(
        createDimension("angular", p(30, 0), p(0, 30), p(20, 20), {
          vertex: p(0, 0),
        })
      )
    ).toBe("Angular Dimension")
  })

  it("puts the text, and the line with it, where Text position is typed", () => {
    const { cad, dim } = palette()
    cad.runtime.setSelectionProperty("textPositionY", "20")

    const edited = cad.byId<DimensionEntity>(dim.id)
    expect(dimensionGeometry(edited).lineStart).toBeCloseToPoint(p(0, 20))
    expect(edited.textPoint).toBeCloseToPoint(p(20, 20))
    cad.undo()
    expect(cad.byId<DimensionEntity>(dim.id).textPoint).toBeUndefined()
  })

  it("takes a Text override and gives the measurement back when emptied", () => {
    const { cad, dim } = palette()
    cad.runtime.setSelectionProperty("dimensionText", "<> mm")
    expect(dimensionText(cad.byId<DimensionEntity>(dim.id))).toBe("40 mm")

    cad.runtime.setSelectionProperty("dimensionText", "")
    expect(cad.byId<DimensionEntity>(dim.id).text).toBeUndefined()
  })

  it("turns the text by Text rotation, 0 being its own direction", () => {
    const { cad, dim } = palette()
    cad.runtime.setSelectionProperty("dimensionTextRotation", "30")
    expect(cad.byId<DimensionEntity>(dim.id).textAngle).toBeCloseTo(Math.PI / 6)
    cad.runtime.setSelectionProperty("dimensionTextRotation", "0")
    expect(cad.byId<DimensionEntity>(dim.id).textAngle).toBeUndefined()
  })
})

describe("the measurement's format", () => {
  /** A DIMLINEAR from 0,0 to `x`,0, placed at 6,10 as the probe's was. */
  function measured(x: number) {
    const cad = createHarness()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(x, 0)).click(p(6, 10))
    return cad
  }

  it("draws ISO-25's decimal comma with the trailing zeros dropped (probe dimensions/p02)", () => {
    const drawn = (x: number) =>
      dimensionText(measured(x).only<DimensionEntity>("dimension"))
    expect(drawn(12.5)).toBe("12,5")
    expect(drawn(100)).toBe("100")
    expect(drawn(0.004)).toBe("0")
    expect(drawn(0.5)).toBe("0,5")
    expect(drawn(1234.567)).toBe("1234,57")
  })

  it("reports it with a point and no trailing zeros (probe dimensions/p01)", () => {
    expect(measured(12.5).commandLog().at(-1)).toBe("Dimension text = 12.5")
    expect(measured(100).commandLog().at(-1)).toBe("Dimension text = 100")
    expect(measured(33.333).commandLog().at(-1)).toBe("Dimension text = 33.33")
  })

  it("offers it so at Text, and <> draws it as the dimension does (probe dimensions/p15)", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(12.5, 0)).option("Text")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Enter dimension text <12.5>:"
    )
    cad.type("<> mm").enter().click(p(6, 10))
    expect(dimensionText(cad.only<DimensionEntity>("dimension"))).toBe(
      "12,5 mm"
    )
  })

  it("keeps an angle's trailing zeros, DIMAZIN being 0 (probe dimensions/p366)", () => {
    const cad = createHarness()
    cad.runtime.updateDimStyle("ISO-25", { angleDecimals: 2 })
    const polar = (r: number, degrees: number) =>
      p(
        r * Math.cos((degrees * Math.PI) / 180),
        r * Math.sin((degrees * Math.PI) / 180)
      )
    cad
      .command("DIMANGULAR")
      .enter()
      .click(p(0, 0))
      .click(p(10, 0))
      .click(polar(10, 22.5))
      .click(polar(20, 10))
    const dim = cad.only<DimensionEntity>("dimension")
    expect(dimensionText(dim, cad.state().dimStyles[0])).toBe("22,50°")
    expect(cad.commandLog().at(-1)).toMatch(/^Dimension text = 22\.5\b/)
  })

  it("follows a style's own separator and zeros", () => {
    const dim = createHarness()
      .command("DIMLINEAR")
      .click(p(0, 0))
      .click(p(12.5, 0))
      .click(p(6, 10))
      .only<DimensionEntity>("dimension")
    const style = {
      ...DEFAULT_DIM_STYLE,
      decimalSeparator: ".",
      suppressTrailingZeros: false,
    }
    expect(dimensionText(dim, style)).toBe("12.50")
  })
})

/** LASTPOINT, as `ID @` reports it. */
function lastPointOf(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

describe("DIMLINEAR and DIMALIGNED against AutoCAD 2027's console", () => {
  const rotationOf = (
    first: string,
    second: string,
    location: string
  ): number => {
    const cad = createHarness()
    answer(cad, "DIMLINEAR", first, second)
    cad.moveTo(CONSOLE_CURSOR)
    answer(cad, location)
    return Math.round(
      (cad.only<DimensionEntity>("dimension").rotation * 180) / Math.PI
    )
  }

  // The console's cursor stands beside the first pair, in a corner, so the
  // first direction holds; beside the second, in its horizontal band, so a
  // corner or the box keeps measuring vertically.
  it("measures horizontally or vertically by the bands, a corner keeping the last (probes dimensions/p139, p141, p142)", () => {
    const first = [
      ["5,2", 0],
      ["5,30", 0],
      ["50,20", 0],
      ["95,2", 0],
      ["95,38", 0],
      ["120,60", 0],
      ["130,50", 0],
      ["150,45", 0],
      ["-30,-10", 0],
      ["200,41", 0],
      ["50,-5", 0],
      ["50,45", 0],
      ["-5,20", 90],
      ["105,20", 90],
    ] as const
    for (const [location, rotation] of first) {
      expect(rotationOf("0,0", "100,40", location), location).toBe(rotation)
    }
    const second = [
      ["300,141", 90],
      ["130,150", 90],
      ["-50,99", 90],
      ["110,145", 90],
      ["50,120", 90],
      ["10,130", 90],
      ["-5,120", 90],
      ["105,120", 90],
      ["50,141", 0],
      ["50,99", 0],
    ] as const
    for (const [location, rotation] of second) {
      expect(rotationOf("0,100", "100,140", location), location).toBe(rotation)
    }
    expect(rotationOf("0,200", "100,240", "90,205")).toBe(0)
  })

  it("keeps the last band's direction while the cursor crosses a corner (desktop dimensions/d06-1 to d06-3)", () => {
    const cad = createHarness()
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(40, 20))
    const measured = () =>
      cad
        .scene()
        .primitives.flatMap((prim) => (prim.kind === "text" ? [prim.text] : []))
    cad.moveTo(p(60, 30))
    expect(measured()).toEqual(["40"])
    cad.moveTo(p(20, 35)).moveTo(p(60, 30))
    expect(measured()).toEqual(["40"])
    cad.moveTo(p(60, 10)).moveTo(p(60, 30))
    expect(measured()).toEqual(["20"])
    cad.click(p(60, 30))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 20")
  })

  it("leaves the location to Ortho, which has no base point there (probe dimensions/p01's trace)", () => {
    const cad = createHarness()
    cad.press("F8")
    cad.command("DIMLINEAR").click(p(0, 0)).click(p(100, 40)).click(p(60, 55))
    expect(
      dimensionGeometry(cad.only<DimensionEntity>("dimension")).lineStart
    ).toBeCloseToPoint(p(0, 55))
  })

  it("picks with a point typed at the object prompt (probes dimensions/p104, p106)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    answer(cad, "DIMLINEAR", "", "500,500", "FOO", "40,0", "40,50")
    expect(cad.commandLog()).toEqual([
      "DIMLINEAR",
      "Specify first extension line origin or <select object>:",
      "Select object to dimension: 500,500",
      "No object selected.",
      "Select object to dimension: FOO",
      "*Invalid selection*",
      "Expects a single object.",
      "Select object to dimension: 40,0",
      "Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]: 40,50",
      "Dimension text = 80",
    ])
  })

  it("takes an object on a locked layer (probe dimensions/p121)", () => {
    const cad = createHarness()
    cad.runtime.document.load([lineOf(p(0, 0), p(80, 0), { layerId: "K" })], {
      layers: [layerOf("0"), layerOf("K", { locked: true })],
    })
    cad.command("DIMLINEAR").enter().click(p(40, 0)).click(p(40, 50))
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 80")
  })

  it("takes a line inside a block reference (probe dimensions/p148)", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(0, 0), p(80, 0)),
    ])
    const cad = createHarness({
      entities: [createInsert(block.id, p(100, 100), { scale: 2, id: "I" })],
      blocks: [block],
    })
    cad.command("DIMLINEAR").enter()
    answer(cad, "180,100", "180,150")
    const dim = cad.only<DimensionEntity>("dimension")
    expect([dim.first, dim.second]).toBeCloseToPoints([
      p(100, 100),
      p(260, 100),
    ])
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 160")
  })

  it("says an ellipse, a spline or a dimension is no line, arc or circle (probes dimensions/p116–p118, p120)", () => {
    const refused = [
      [ellipseOf(p(50, 0), p(50, 0), 0.4), "100,0"],
      [createSpline("fit", [p(0, 0), p(50, 30), p(100, 0)]), "100,0"],
      [
        createDimension("linear", p(0, 0), p(100, 0), p(50, 20), {
          rotation: 0,
        }),
        "50,20",
      ],
    ] as const
    for (const [entity, at] of refused) {
      const cad = createHarness({ entities: [entity] })
      answer(cad, "DIMLINEAR", "", at)
      expect(cad.commandLog().slice(-1), entity.type).toEqual([
        "Object selected is not a line, arc or circle.",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "DIMLINEAR Select object to dimension:"
      )
    }
    const text = createHarness({
      entities: [textOf(p(0, 0), "ABCDEF", { height: 10 })],
    })
    answer(text, "DIMLINEAR", "", "10,5")
    expect(text.commandLog().at(-1)).toBe("No object selected.")
    const spanish = createHarness({
      locale: es,
      entities: [ellipseOf(p(50, 0), p(50, 0), 0.4)],
    })
    answer(spanish, "ACOLINEAL", "", "100,0")
    expect(spanish.commandLog().at(-1)).toBe(
      "El objeto designado no es ni una línea ni un círculo."
    )
  })

  it("leaves LASTPOINT at the location (probe dimensions/p140)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    answer(cad, "DIMLINEAR", "0,0", "100,0", "50,10")
    expect(lastPointOf(cad)).toBe(" X = 50.00     Y = 10.00     Z = 0.00")
    answer(cad, "DIMLINEAR", "", "40,0", "40,50")
    expect(lastPointOf(cad)).toBe(" X = 40.00     Y = 50.00     Z = 0.00")
  })

  it("lies at the current ELEVATION, whatever the location's Z (probes dimensions/p158, p169)", () => {
    const cad = createHarness()
    answer(cad, "ELEV", "5", "0")
    answer(cad, "DIMLINEAR", "0,100,30", "100,100", "50,110,7")
    expect(entityElevation(cad.only<DimensionEntity>("dimension"))).toBe(5)
  })

  it("ends with nothing made at Enter after the first prompt (probes dimensions/p105, p123, p124)", () => {
    const select = createHarness({ entities: [lineOf(p(0, 0), p(80, 0))] })
    answer(select, "DIMLINEAR", "", "")
    const second = answer(createHarness(), "DIMLINEAR", "0,0", "")
    const location = answer(createHarness(), "DIMLINEAR", "0,0", "100,0", "")
    for (const cad of [select, second, location]) {
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entities().filter((e) => e.type === "dimension")).toEqual([])
    }
    expect(location.commandLog().at(-1)).toBe(
      "Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:"
    )
  })

  it("drops a preselection and leaves nothing selected (probes dimensions/p149–p153)", () => {
    const runs = [
      (c: CadHarness) => c.command("DIMLINEAR").enter().click(p(0, 50)),
      (c: CadHarness) => c.command("DIMALIGNED").enter().click(p(0, 50)),
      (c: CadHarness) => c.command("DIMRADIUS").click(p(50, 0)),
      (c: CadHarness) => c.command("DIMDIAMETER").click(p(50, 0)),
      (c: CadHarness) => c.command("DIMANGULAR").click(p(35.35534, 35.35534)),
    ]
    for (const run of runs) {
      const cad = createHarness({
        entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "C" })],
      })
      cad.select("C")
      run(cad)
      expect(cad.selectedIds()).toEqual([])
      cad.click(p(80, 80))
      expect(cad.activeToolId()).toBe("select")
      expect(cad.selectedIds()).toEqual([])
    }
  })

  it("stores no text angle for Angle 0, or Enter with none set (probes dimensions/p132, p163)", () => {
    for (const angle of ["0", ""]) {
      const cad = createHarness()
      answer(cad, "DIMLINEAR", "0,0", "0,100", "A", angle, "-20,50")
      const dim = cad.only<DimensionEntity>("dimension")
      expect(dim.textAngle, angle).toBeUndefined()
      expect(dimensionGeometry(dim).textAngle).toBeCloseTo(Math.PI / 2)
    }
  })

  it("keeps the text angle at Enter once one is set (probe dimensions/p143)", () => {
    const cad = createHarness()
    answer(cad, "DIMALIGNED", "0,0", "60,80", "A", "30", "A", "", "-40,60")
    expect(cad.only<DimensionEntity>("dimension").textAngle).toBeCloseTo(
      Math.PI / 6
    )
  })

  it("takes <30 at Angle as 30 (probe dimensions/p130)", () => {
    const cad = createHarness()
    answer(cad, "DIMLINEAR", "0,0", "100,0", "A", "<30", "50,10")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]: A",
      "Specify angle of dimension text: <30",
      "Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]: 50,10",
      "Dimension text = 100",
    ])
    expect(cad.only<DimensionEntity>("dimension").textAngle).toBeCloseTo(
      Math.PI / 6
    )
  })

  it("clears a Text override at a second Text's Enter (probe dimensions/p164)", () => {
    const typed = createHarness()
    answer(typed, "DIMLINEAR", "0,0", "100,0", "T", "ABC", "T", "", "50,10")
    expect(typed.only<DimensionEntity>("dimension").text).toBeUndefined()
    const box = createHarness()
    box.command("DIMLINEAR").click(p(0, 0)).click(p(100, 0)).moveTo(p(50, 10))
    box.option("Text").type("ABC").enter().option("Text").enter()
    box.click(p(50, 10))
    expect(box.only<DimensionEntity>("dimension").text).toBeUndefined()
  })

  it("offers <0> at a second Rotated, and Enter keeps the rotation (probe dimensions/p165)", () => {
    const cad = createHarness()
    answer(cad, "DIMLINEAR", "0,0", "100,0", "R", "30", "R")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMLINEAR Specify angle of dimension line <0>:"
    )
    answer(cad, "", "50,40")
    expect(cad.only<DimensionEntity>("dimension").rotation).toBeCloseTo(
      Math.PI / 6
    )
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 86.6")
  })
})

describe("DIMHORIZONTAL, DIMVERTICAL and DIMROTATED", () => {
  it("measure along their own direction, offering Text and Angle (probes dimensions/p100, p113)", () => {
    const cad = createHarness()
    answer(cad, "DIMHORIZONTAL", "0,100", "100,140")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMHORIZONTAL Specify dimension line location or [Text/Angle]:"
    )
    answer(cad, "150,120")
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 100")
    answer(cad, "DIMVERTICAL", "0,200", "100,240", "50,300")
    expect(cad.commandLog().at(-1)).toBe("Dimension text = 40")
    const [horizontal, vertical] = cad
      .entities()
      .filter((e): e is DimensionEntity => e.type === "dimension")
    expect(horizontal.rotation).toBeCloseTo(0)
    expect(vertical.rotation).toBeCloseTo(Math.PI / 2)
  })

  it("DIMROTATED asks its angle first (probes dimensions/p100, p112)", () => {
    const cad = createHarness()
    answer(cad, "DIMROTATED")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMROTATED Specify angle of dimension line <0>:"
    )
    answer(cad, "30", "0,0", "100,0")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMROTATED Specify dimension line location or [Text/Angle]:"
    )
    answer(cad, "50,40")
    expect(cad.commandLog()).toEqual([
      "DIMROTATED",
      "Specify angle of dimension line <0>: 30",
      "Specify first extension line origin or <select object>: 0,0",
      "Specify second extension line origin: 100,0",
      "Non-associative dimension created.",
      "Specify dimension line location or [Text/Angle]: 50,40",
      "Dimension text = 86.6",
    ])
    const twoPoints = createHarness()
    answer(twoPoints, "DIMROTATED", "0,400")
    expect(twoPoints.state().commandLine.prompt).toBe(
      "DIMROTATED Specify second point:"
    )
    answer(twoPoints, "100,400", "0,500", "100,500", "50,510")
    expect(twoPoints.only<DimensionEntity>("dimension").rotation).toBeCloseTo(0)
  })

  it("are named in Spanish (probe dimensions/p101)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "ACOHORIZONTAL", "0,100", "100,140")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOHORIZONTAL Especifique una ubicación de línea de cota o [Texto/ángUlo]:"
    )
    answer(cad, "150,120", "ACOVERTICAL", "0,200", "100,240", "50,300")
    expect(cad.commandLog().at(-1)).toBe("Texto de cota = 40")
    answer(cad, "ACOGIRADA")
    expect(cad.state().commandLine.prompt).toBe(
      "ACOGIRADA Designe ángulo de línea de cota <0>:"
    )
  })
})
