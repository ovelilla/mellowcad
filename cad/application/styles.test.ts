import { describe, expect, it } from "vitest"
import { createHarness } from "../../test/harness"
import { circleOf, p } from "../../test/builders"
import {
  createDimension,
  createText,
  DimensionEntity,
  dimensionGeometry,
  dimensionText,
  TextEntity,
} from "../domain/entities"
import { DEFAULT_DIM_STYLE } from "../domain/dimStyles"
import { parseDrawingFile } from "../serialization/drawingFile"

/** A drawing holding one dimension and one text, so styles have users. */
function annotated() {
  return createHarness({
    entities: [
      createDimension("linear", p(0, 0), p(100, 0), p(50, -40), { id: "D1" }),
      createText(p(0, 50), "NOTE", { id: "T1" }),
    ],
  })
}

describe("dimension style table", () => {
  it("ships with the base ISO-25 style current", () => {
    const cad = createHarness()
    expect(cad.state().currentDimStyleId).toBe("ISO-25")
    expect(cad.state().dimStyles.map((s) => s.id)).toEqual(["ISO-25"])
  })

  it("counts the dimensions wearing each style", () => {
    const cad = annotated()
    expect(cad.state().dimStyles[0].entityCount).toBe(1)
  })

  it("creates a style copied from another and makes it current", () => {
    const cad = createHarness()
    cad.runtime.updateDimStyle("ISO-25", { textHeight: 7 })
    const id = cad.runtime.createDimStyle("Plans")

    expect(id).toBe("Plans")
    expect(cad.state().currentDimStyleId).toBe("Plans")
    // "Start With sets a style to use as a basis for the new one."
    expect(cad.state().dimStyles.find((s) => s.id === id)?.textHeight).toBe(7)
  })

  it("names a new style after the one it copies", () => {
    const cad = createHarness()
    expect(cad.runtime.createDimStyle()).toBe("Copy of ISO-25")
  })

  it("never lets two styles share a name", () => {
    const cad = createHarness()
    cad.runtime.createDimStyle("Plans")
    expect(cad.runtime.createDimStyle("Plans")).toBe("Plans (2)")
    expect(cad.state().dimStyles).toHaveLength(3)
  })

  it("edits a style through a patch, leaving the rest alone", () => {
    const cad = createHarness()
    cad.runtime.updateDimStyle("ISO-25", { textHeight: 5, decimals: 0 })
    const style = cad.state().dimStyles[0]

    expect(style.textHeight).toBe(5)
    expect(style.decimals).toBe(0)
    expect(style.arrowSize).toBe(DEFAULT_DIM_STYLE.arrowSize)
  })

  it("folds unusable values back into range", () => {
    const cad = createHarness()
    cad.runtime.updateDimStyle("ISO-25", {
      textHeight: -3,
      decimals: 99,
      angleDecimals: -7,
      scale: 0,
    })
    const style = cad.state().dimStyles[0]

    expect(style.textHeight).toBe(DEFAULT_DIM_STYLE.textHeight)
    expect(style.decimals).toBe(8)
    // DIMADEC's floor is −1, the value that defers to DIMDEC.
    expect(style.angleDecimals).toBe(-1)
    // DIMSCALE 0 means "derive from the viewport", which is 1 without layouts.
    expect(style.scale).toBe(1)
  })

  it("redraws every dimension on the style when it changes", () => {
    const cad = annotated()
    const before = dimensionGeometry(
      cad.byId<DimensionEntity>("D1"),
      cad.state().dimStyles[0]
    )
    cad.runtime.updateDimStyle("ISO-25", { textHeight: 25 })
    const after = dimensionGeometry(
      cad.byId<DimensionEntity>("D1"),
      cad.state().dimStyles[0]
    )

    expect(before.textHeight).toBe(2.5)
    expect(after.textHeight).toBe(25)
  })

  it("shows whole degrees or decimals per DIMADEC", () => {
    const cad = createHarness()
    const angular = createDimension(
      "angular",
      p(100, 0),
      p(0, 100),
      p(60, 60),
      {
        vertex: p(0, 0),
      }
    )

    expect(dimensionText(angular, cad.state().dimStyles[0])).toBe("90°")
    cad.runtime.updateDimStyle("ISO-25", { angleDecimals: 2 })
    expect(dimensionText(angular, cad.state().dimStyles[0])).toBe("90.00°")
  })

  it("refuses to delete the base style, the current one or one in use", () => {
    const cad = annotated()
    expect(cad.runtime.removeDimStyle("ISO-25")).toBe(false)

    cad.runtime.createDimStyle("Plans")
    // Current: refused.
    expect(cad.runtime.removeDimStyle("Plans")).toBe(false)

    cad.runtime.setCurrentDimStyle("ISO-25")
    expect(cad.runtime.removeDimStyle("Plans")).toBe(true)
    expect(cad.state().dimStyles).toHaveLength(1)
  })

  it("refuses to delete a style a dimension still wears", () => {
    const cad = annotated()
    cad.runtime.createDimStyle("Plans")
    cad.select("D1")
    cad.runtime.setSelectionDimStyle("Plans")
    cad.runtime.setCurrentDimStyle("ISO-25")

    expect(cad.runtime.removeDimStyle("Plans")).toBe(false)
  })

  it("new dimensions take the current style", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 50, { id: "C1" })],
    })
    cad.runtime.createDimStyle("Plans")
    cad.command("DIMRADIUS").click(p(50, 0)).click(p(30, 0))

    expect(cad.only<DimensionEntity>("dimension").styleId).toBe("Plans")
  })

  it("puts the selected dimensions on another style, undoably", () => {
    const cad = annotated()
    cad.runtime.createDimStyle("Plans", undefined, false)
    cad.select("D1")
    cad.runtime.setSelectionDimStyle("Plans")

    expect(cad.byId<DimensionEntity>("D1").styleId).toBe("Plans")
    cad.undo()
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe("ISO-25")
  })

  it("reports the style shared by the selection, or nothing when mixed", () => {
    const cad = annotated()
    cad.runtime.createDimStyle("Plans", undefined, false)
    cad.select("D1")
    expect(cad.state().selectionDimStyleId).toBe("ISO-25")

    const second = createDimension("linear", p(0, 0), p(50, 0), p(25, -80))
    cad.runtime.document.add(second)
    cad.select("D1", second.id)
    cad.runtime.setSelectionDimStyle("Plans")
    // Both moved, so they agree again.
    expect(cad.state().selectionDimStyleId).toBe("Plans")
  })

  it("survives a save and reload", () => {
    const cad = createHarness()
    cad.runtime.createDimStyle("Plans")
    cad.runtime.updateDimStyle("Plans", { textHeight: 12, angleDecimals: 3 })
    const reloaded = parseDrawingFile(cad.runtime.serializeDrawing())
    const style = reloaded.dimStyles.find((s) => s.id === "Plans")

    expect(style?.textHeight).toBe(12)
    expect(style?.angleDecimals).toBe(3)
    expect(reloaded.currentDimStyleId).toBe("Plans")
  })
})

describe("text style table", () => {
  it("ships with Standard current and its height free", () => {
    const cad = createHarness()
    expect(cad.state().currentTextStyleId).toBe("Standard")
    // 0 = not fixed, so TEXT prompts for a height.
    expect(cad.state().textStyles[0].height).toBe(0)
  })

  it("creates, renames and counts styles", () => {
    const cad = annotated()
    const id = cad.runtime.createTextStyle("Titles")
    cad.runtime.updateTextStyle(id, { name: "Headings" })

    expect(cad.state().textStyles.map((s) => s.name)).toEqual([
      "Standard",
      "Headings",
    ])
    expect(cad.state().textStyles[0].entityCount).toBe(1)
  })

  it("keeps a height of 0 meaningful and rejects a negative one", () => {
    const cad = createHarness()
    cad.runtime.updateTextStyle("Standard", { height: 5 })
    expect(cad.state().textStyles[0].height).toBe(5)

    cad.runtime.updateTextStyle("Standard", { height: 0 })
    expect(cad.state().textStyles[0].height).toBe(0)

    cad.runtime.updateTextStyle("Standard", { height: -2 })
    expect(cad.state().textStyles[0].height).toBe(0)
  })

  it("only deletes unused styles", () => {
    const cad = annotated()
    expect(cad.runtime.removeTextStyle("Standard")).toBe(false)

    const id = cad.runtime.createTextStyle("Titles")
    cad.select("T1")
    cad.runtime.setSelectionTextStyle(id)
    cad.runtime.setCurrentTextStyle("Standard")
    expect(cad.runtime.removeTextStyle(id)).toBe(false)

    cad.runtime.setSelectionTextStyle("Standard")
    expect(cad.runtime.removeTextStyle(id)).toBe(true)
  })

  it("puts the selected text on another style, undoably", () => {
    const cad = annotated()
    const id = cad.runtime.createTextStyle("Titles", undefined, false)
    cad.select("T1")
    cad.runtime.setSelectionTextStyle(id)

    expect(cad.byId<TextEntity>("T1").styleId).toBe("Titles")
    expect(cad.state().selectionTextStyleId).toBe("Titles")
    cad.undo()
    expect(cad.byId<TextEntity>("T1").styleId).toBe("Standard")
  })

  it("a style with a fixed height skips the TEXT height prompt", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("Titles")
    cad.runtime.updateTextStyle("Titles", { height: 8 })
    cad.command("TEXT").click(p(0, 0))

    // Straight to the rotation prompt, with no height asked for.
    expect(cad.state().dynamicInput?.fields[0].label).toContain("rotation")
    cad.enter().type("HI").enter().escape()
    expect(cad.only<TextEntity>("text").height).toBe(8)
  })
})

describe("the style managers", () => {
  it("open from the DIMSTYLE and STYLE commands", () => {
    const cad = createHarness()
    expect(cad.state().stylesPanel).toBeNull()

    cad.command("DIMSTYLE")
    expect(cad.state().stylesPanel).toBe("dimension")

    cad.command("STYLE")
    expect(cad.state().stylesPanel).toBe("text")

    cad.runtime.setStylesPanel(null)
    expect(cad.state().stylesPanel).toBeNull()
  })

  it("toggles a tab shut when it is already showing", () => {
    const cad = createHarness()
    cad.runtime.toggleStylesPanel("text")
    expect(cad.state().stylesPanel).toBe("text")
    cad.runtime.toggleStylesPanel("text")
    expect(cad.state().stylesPanel).toBeNull()
  })

  it("DIMSCALE still edits the current style's overall scale", () => {
    const cad = createHarness()
    cad.runtime.createDimStyle("Plans")
    cad.runtime.setDimScale(50)

    expect(cad.state().dimScale).toBe(50)
    expect(cad.state().dimStyles.find((s) => s.id === "Plans")?.scale).toBe(50)
    // The base style is untouched: DIMSCALE belongs to the current style.
    expect(cad.state().dimStyles.find((s) => s.id === "ISO-25")?.scale).toBe(1)
  })
})
