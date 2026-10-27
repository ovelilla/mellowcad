import { describe, expect, it } from "vitest"
import { createHarness, CadHarness } from "../../../test/harness"
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
import {
  DimensionEntity,
  dimensionGeometry,
  dimensionMeasurement,
  dimensionText,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"

function answer(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

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

/** The style's arrow length: AutoCAD's runs end at an arrowhead's base. */
const ARROW = DEFAULT_DIM_STYLE.arrowSize

/** The geometry a radial command drew, in its own style. */
function drawnGeometry(cad: CadHarness) {
  const d = dim(cad)
  return dimensionGeometry(d, cad.runtime.document.getDimStyle(d.styleId))
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

  it("inside, runs one line from the far end of the text to the arrowhead (probe dimensions/p300)", () => {
    const g = drawnGeometry(radial("DIMRADIUS", p(30, 0)))

    // LINE 26.3924→47.5, the text R50 centred at 30, one SOLID tipped at 50.
    expect(g.lineStart).toBeCloseToPoint(p(26.3924, 0), 4)
    expect(g.lineEnd).toBeCloseToPoint(p(50 - ARROW, 0))
    expect(g.arrows).toHaveLength(1)
    expect(g.lines).toHaveLength(0)
    expect(g.textPoint).toBeCloseToPoint(p(30, 0))
  })

  it("outside, draws DIMTOFL's line from the centre and no centre mark (probe dimensions/p301)", () => {
    const g = drawnGeometry(radial("DIMRADIUS", p(80, 0)))

    // The leader 83.6076→52.5, the line 0→50, one arrow outside the rim.
    expect(g.lineStart).toBeCloseToPoint(p(83.6076, 0), 4)
    expect(g.lineEnd).toBeCloseToPoint(p(50 + ARROW, 0))
    expect(g.lines).toHaveLength(1)
    expect(g.lines[0][0]).toBeCloseToPoint(p(0, 0))
    expect(g.lines[0][1]).toBeCloseToPoint(p(50, 0))
    expect(g.arrows).toHaveLength(1)
  })

  it("outside with DIMTOFL off, marks the centre instead (probe dimensions/p306)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.runtime.updateDimStyle("ISO-25", { forceLineInside: false })
    cad.command("DIMRADIUS").click(p(50, 0)).click(p(80, 0))
    const g = drawnGeometry(cad)
    const size = DEFAULT_DIM_STYLE.centerMark

    expect(g.lineStart).toBeCloseToPoint(p(83.6076, 0), 4)
    expect(g.lines).toEqual([
      [p(-size, 0), p(size, 0)],
      [p(0, -size), p(0, size)],
    ])
  })

  it("points the arrowhead at the circle either way round", () => {
    const inside = drawnGeometry(radial("DIMRADIUS", p(30, 0)))
    const outside = drawnGeometry(radial("DIMRADIUS", p(80, 0)))

    // The tip is on the rim in both, but the head lies on the drawn side of it.
    expect(inside.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(outside.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(inside.arrows[0][1].x).toBeLessThan(50)
    expect(outside.arrows[0][1].x).toBeGreaterThan(50)
  })

  it("puts the text where it was placed, above the dimension line", () => {
    const g = drawnGeometry(radial("DIMRADIUS", p(30, 0)))
    expect(g.textPosition).toBeCloseToPoint(p(30, DEFAULT_DIM_STYLE.textGap))
  })

  it("under an Angle, sits the text on the line and stops the line at it (probe dimensions/p321)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad
      .command("DIMRADIUS")
      .click(p(50, 0))
      .option("Angle")
      .type("30")
      .enter()
      .click(p(80, 0))
    const g = drawnGeometry(cad)

    // LINE 76.1971→52.5; the MTEXT's middle at (80,0), turned 30°.
    expect(g.lineStart).toBeCloseToPoint(p(76.1971, 0), 3)
    expect(g.lineEnd).toBeCloseToPoint(p(50 + ARROW, 0))
    expect(g.textAngle).toBeCloseTo(Math.PI / 6)
    expect(g.textPoint).toBeCloseToPoint(p(80, 0))
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

  it("inside, draws one run to one arrowhead (probe dimensions/p302)", () => {
    const g = drawnGeometry(radial("DIMDIAMETER", p(30, 0)))

    // LINE 25.2575→47.5 under ∅100, one SOLID: Ø's ink is AutoCAD's box.
    expect(g.lineStart).toBeCloseToPoint(p(25.2575, 0), 4)
    expect(g.lineEnd).toBeCloseToPoint(p(50 - ARROW, 0))
    expect(g.arrows).toHaveLength(1)
    expect(g.lines).toHaveLength(0)
  })

  it("outside, draws the line across and both arrowheads outside the rim (probe dimensions/p303)", () => {
    const g = drawnGeometry(radial("DIMDIAMETER", p(80, 0)))

    expect(g.lineStart).toBeCloseToPoint(p(84.7425, 0), 4)
    expect(g.lineEnd).toBeCloseToPoint(p(50 + ARROW, 0))
    expect(g.arrows).toHaveLength(2)
    expect(g.arrows[0][0]).toBeCloseToPoint(p(50, 0))
    expect(g.arrows[1][0]).toBeCloseToPoint(p(-50, 0))
    expect(g.arrows[1][1].x).toBeLessThan(-50)
    // The far arrow's stub −52.5→−55 and the line −50→50; no centre mark.
    expect(g.lines).toHaveLength(2)
    expect(g.lines[0][0]).toBeCloseToPoint(p(-50 - ARROW, 0))
    expect(g.lines[0][1]).toBeCloseToPoint(p(-50 - 2 * ARROW, 0))
    expect(g.lines[1][0]).toBeCloseToPoint(p(-50, 0))
    expect(g.lines[1][1]).toBeCloseToPoint(p(50, 0))
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

  it("refuses an object with no circle to measure in AutoCAD's words, and asks again (probes dimensions/p309, p311, p312)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-50, -60), p(50, -60), { id: "L" }),
        ellipseOf(p(0, -80), p(50, 0), 0.4, { id: "E" }),
        textOf(p(-20, -100), "ABC", { id: "T", height: 5 }),
      ],
    })
    cad.command("DIMRADIUS").click(p(0, -60))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a circle or arc."
    )
    cad.click(p(50, -80))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a circle or arc."
    )
    cad.click(p(-19, -99))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a circle or arc."
    )
    expect(cad.state().commandLine.prompt).toBe(
      "DIMRADIUS Select arc or circle:"
    )
    expect(cad.typeCounts().dimension).toBeUndefined()
  })

  it("refuses a polyline's straight segment, takes its arc (probes dimensions/p313, p314)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(-100, 0), p(0, 0), p(100, 0)], {
          bulges: [0, 1],
          id: "P1",
        }),
      ],
    })
    cad.command("DIMRADIUS").click(p(-50, 0))
    expect(cad.commandLog().at(-1)).toBe(
      "Object selected is not a circle or arc."
    )
    cad.click(p(50, -50)).click(p(50, -30))
    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(50)
  })

  it("asks again in silence on nothing (probe dimensions/p310)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS").click(p(30, 30))

    expect(cad.commandLog().join("\n")).not.toContain("Object selected")
    expect(cad.state().commandLine.prompt).toBe(
      "DIMRADIUS Select arc or circle:"
    )
  })

  it("takes a circle on a locked layer (probe dimensions/p315)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [circleOf(p(0, 0), 50, { id: "C1", layerId: "K" })],
      { layers: [layerOf("0"), layerOf("K", { locked: true })] }
    )
    cad.command("DIMRADIUS").click(p(50, 0)).click(p(80, 0))

    expect(dimensionMeasurement(dim(cad))).toBeCloseTo(50)
  })

  it("picks with a point typed at Select arc or circle (probe dimensions/p300)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS")
    answer(cad, "50,0")

    expect(cad.state().commandLine.prompt).toBe(
      "DIMRADIUS Specify dimension line location or [Text/Angle]:"
    )
  })

  it("reads @ at the location from the pick, and leaves LASTPOINT there (probes dimensions/p318, p336, p300)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS")
    answer(cad, "50.2,0")
    answer(cad, "@10,0")
    expect(dim(cad).linePoint).toBeCloseToPoint(p(60.2, 0))

    const clicked = radial("DIMRADIUS", p(80, 0))
    answer(clicked, "ID")
    answer(clicked, "@")
    expect(clicked.commandLog().at(-1)).toBe(
      " X = 80.00     Y = 0.00     Z = 0.00"
    )
  })

  it("Enter at the location places the dimension at the cursor (probes dimensions/p317, p333; desktop d06)", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS").click(p(50, 0)).moveTo(p(0, 80)).enter()

    expect(dim(cad).second).toBeCloseToPoint(p(0, 50))
    expect(cad.activeToolId()).toBe("select")
  })

  it("highlights the object under the cursor while selecting", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMDIAMETER")

    const hovered = () =>
      cad
        .scene()
        .primitives.filter(
          (prim) =>
            "stroke" in prim &&
            prim.stroke?.color === THEME.entityHover &&
            prim.stroke.width === 2
        ).length

    cad.moveTo(p(300, 300))
    expect(hovered()).toBe(0)
    cad.moveTo(p(50, 0))
    expect(hovered()).toBeGreaterThan(0)
  })

  it("offers Text and Angle only at the location prompt", () => {
    const cad = createHarness({ entities: [ring()] })
    cad.command("DIMRADIUS")
    expect(cad.optionAbbreviations()).toEqual([])

    cad.click(p(50, 0))
    expect(cad.optionAbbreviations()).toEqual(["T", "A"])
  })

  it("Text replaces the measurement, <> standing in for it with its symbol (probes dimensions/p320, p329)", () => {
    const typed = (command: string) => {
      const cad = createHarness({ entities: [ring()] })
      cad
        .command(command)
        .click(p(50, 0))
        .option("Text")
        .type("<> TYP")
        .enter()
        .click(p(80, 0))
      return cad
    }
    const radius = typed("DIMRADIUS")
    const diameter = typed("DIMDIAMETER")

    expect(dimensionText(dim(radius))).toBe("R50 TYP")
    expect(dimensionText(dim(diameter))).toBe("\u00d8100 TYP")
    // The leader runs under the longer text: 87.4966 and 88.6315.
    expect(drawnGeometry(radius).lineStart).toBeCloseToPoint(p(87.4966, 0), 4)
    expect(drawnGeometry(diameter).lineStart).toBeCloseToPoint(p(88.6315, 0), 3)
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
    cad.runtime.updateDimStyle("ISO-25", { forceLineInside: false })
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
