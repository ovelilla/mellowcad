import { describe, expect, it } from "vitest"
import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import {
  createDimension,
  createText,
  DimensionEntity,
  dimensionGeometry,
  MTextEntity,
  dimensionText,
  TextEntity,
} from "../domain/entities"
import { DEFAULT_DIM_STYLE } from "../domain/dimStyles"
import { parseDrawingFile } from "../serialization/drawingFile"
import { es } from "../locales/es"

/** What typing `texts` at the prompt adds to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

/** The text styles' names, in the table's order. */
function textStyleNames(cad: CadHarness): string[] {
  return cad.state().textStyles.map((style) => style.name)
}

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

  it("compares names case-blind: a new iso-25 is a copy, a rename onto one refused", () => {
    const cad = createHarness()
    expect(cad.runtime.createDimStyle("iso-25")).toBe("iso-25 (2)")
    const from = cad.commandLog().length
    cad.runtime.updateDimStyle("iso-25 (2)", { name: "ISO-25", textHeight: 9 })

    // Table 21392 with 26367, as text/p323 words it for a text style.
    expect(cad.commandLog().slice(from)).toEqual([
      'A dimension style named "ISO-25" already exists.',
      "*Invalid*",
    ])
    const style = cad.state().dimStyles.find((s) => s.id === "iso-25 (2)")
    expect([style?.name, style?.textHeight]).toEqual(["iso-25 (2)", 2.5])
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
      decimalSeparator: "12",
    })
    const style = cad.state().dimStyles[0]

    expect(style.textHeight).toBe(DEFAULT_DIM_STYLE.textHeight)
    expect(style.decimals).toBe(8)
    // DIMADEC's floor is −1, the value that defers to DIMDEC.
    expect(style.angleDecimals).toBe(-1)
    // DIMSCALE 0 means "derive from the viewport", which is 1 without layouts.
    expect(style.scale).toBe(1)
    // DIMDSEP is one character, never a digit.
    expect(style.decimalSeparator).toBe(",")
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
    expect(dimensionText(angular, cad.state().dimStyles[0])).toBe("90,00°")
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

  it("puts two dimensions on another style in one step (TEXT-D46)", () => {
    const cad = annotated()
    cad.runtime.document.add(
      createDimension("linear", p(0, 0), p(50, 0), p(25, -80), { id: "D2" })
    )
    cad.runtime.createDimStyle("Plans", undefined, false)
    cad.select("D1", "D2")
    cad.runtime.setSelectionDimStyle("Plans")
    cad.escape()

    expect(written(cad, "_U")).toEqual(["U", "Modify Property"])
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe("ISO-25")
    expect(cad.byId<DimensionEntity>("D2").styleId).toBe("ISO-25")
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
    expect(cad.state().properties.dimStyleId).toBe("ISO-25")

    const second = createDimension("linear", p(0, 0), p(50, 0), p(25, -80))
    cad.runtime.document.add(second)
    cad.select("D1", second.id)
    cad.runtime.setSelectionDimStyle("Plans")
    // Both moved, so they agree again.
    expect(cad.state().properties.dimStyleId).toBe("Plans")
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
    expect(cad.state().properties.textStyleId).toBe("Titles")
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
  it("a style with a fixed height gives MTEXT its height (p321: <3>)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2")
    cad.runtime.updateTextStyle("S2", { height: 3 })
    cad.command("-MTEXT").type("0,0").enter().type("20,-10").enter()
    cad.type("A").enter().enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect([mtext.styleId, mtext.height]).toEqual(["S2", 3])
  })
})

describe("the text style table through the history (STY-01, TEXT-D45)", () => {
  // AutoCAD's U takes back a style the Text Style dialog made and puts
  // TEXTSTYLE back, naming STYLE (desktop d07; -STYLE's U, text/p320).
  it("U takes back a new style and the current style it set (d07, p320)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2")
    expect(cad.state().currentTextStyleId).toBe("S2")

    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(textStyleNames(cad)).toEqual(["Standard"])
    expect(cad.state().currentTextStyleId).toBe("Standard")

    expect(written(cad, "_REDO")).toEqual([
      "REDO",
      "STYLE",
      "Everything has been redone",
    ])
    expect(textStyleNames(cad)).toEqual(["Standard", "S2"])
    expect(cad.state().currentTextStyleId).toBe("S2")
  })

  it("U takes back a height edit (p320: 7 back to 0)", () => {
    const cad = createHarness()
    cad.runtime.updateTextStyle("Standard", { height: 7 })
    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(cad.state().textStyles[0].height).toBe(0)
  })

  it("U after LINE and a new style takes back the style, not the LINE (p320)", () => {
    const cad = createHarness()
    cad.command("LINE").type("0,0").enter().type("10,0").enter().enter()
    cad.runtime.createTextStyle("S2")

    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(cad.entities()).toHaveLength(1)
    expect(textStyleNames(cad)).toEqual(["Standard"])
  })

  it("U takes back a current-style change and a rename", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    cad.runtime.setCurrentTextStyle("S2")
    cad.runtime.updateTextStyle("S2", { name: "Titles" })

    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(textStyleNames(cad)).toEqual(["Standard", "S2"])
    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(cad.state().currentTextStyleId).toBe("Standard")
  })

  it("U puts a deleted style back in its place", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("A", undefined, false)
    cad.runtime.createTextStyle("B", undefined, false)
    expect(cad.runtime.removeTextStyle("A")).toBe(true)

    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
    expect(textStyleNames(cad)).toEqual(["Standard", "A", "B"])
  })

  it("an edit that changes nothing makes no step", () => {
    const cad = createHarness()
    cad.runtime.setCurrentTextStyle("Standard")
    cad.runtime.updateTextStyle("Standard", { height: 0 })
    expect(written(cad, "_U")).toEqual(["U", "Everything has been undone"])
  })

  it("a style made mid-command joins that command's step", () => {
    const cad = createHarness()
    cad.command("LINE").type("0,0").enter()
    cad.runtime.createTextStyle("S2")
    cad.type("10,0").enter().enter()

    expect(written(cad, "_U")).toEqual(["U", "LINE"])
    expect(cad.entities()).toHaveLength(0)
    expect(textStyleNames(cad)).toEqual(["Standard"])
  })

  // es unverified: d07 was the English profile; U names a command by its
  // Spanish name (BORRA, erase/p320).
  it("names the step ESTILO in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.createTextStyle("S2")
    expect(written(cad, "H")).toEqual(["H", "ESTILO"])
  })
})

describe("text style names (STY-03, STY-08)", () => {
  it("are case-blind: a new STANDARD is a copy, never a second Standard (p324)", () => {
    const cad = createHarness()
    expect(cad.runtime.createTextStyle("STANDARD")).toBe("STANDARD (2)")
    expect(textStyleNames(cad)).toEqual(["Standard", "STANDARD (2)"])
  })

  it("refuse a rename onto a name in use, any case, with AutoCAD's words (p323, p336)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2")
    const from = cad.commandLog().length
    cad.runtime.updateTextStyle("S2", { name: "standard", height: 3 })

    expect(cad.commandLog().slice(from)).toEqual([
      'A text style named "standard" already exists.',
      "*Invalid*",
    ])
    expect(textStyleNames(cad)).toEqual(["Standard", "S2"])
    expect(cad.state().textStyles[1].height).toBe(0)
    // Nothing was done, so U takes back the new style.
    expect(written(cad, "_U")).toEqual(["U", "STYLE"])
  })

  it("refuse it in Spanish AutoCAD's words (p336; tables 21392, 26363)", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.createTextStyle("S2")
    const from = cad.commandLog().length
    cad.runtime.updateTextStyle("S2", { name: "STANDARD" })
    expect(cad.commandLog().slice(from)).toEqual([
      'Ya existe un estilo de texto con el nombre "STANDARD".',
      "*No válido*",
    ])
  })

  it("let a style change its own name's case", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("Titles")
    cad.runtime.updateTextStyle("Titles", { name: "TITLES" })
    expect(textStyleNames(cad)).toEqual(["Standard", "TITLES"])
  })

  it("give a name freed by a rename back, under an id of its own", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("Titles")
    cad.runtime.updateTextStyle("Titles", { name: "Headings" })
    const id = cad.runtime.createTextStyle("Titles")

    expect(id).not.toBe("Titles")
    expect(textStyleNames(cad)).toEqual(["Standard", "Headings", "Titles"])
  })

  it("New proposes style1, style2…, the first free, as the dialog does (d07-2)", () => {
    const cad = createHarness()
    cad.runtime.updateTextStyle("Standard", { height: 4 })
    const first = cad.runtime.createTextStyle(undefined, "Standard")
    cad.runtime.createTextStyle("STYLE2")
    const third = cad.runtime.createTextStyle()

    expect([first, third]).toEqual(["style1", "style3"])
    // A copy of the selected style, made current (d07-2, d07-3).
    expect(cad.state().textStyles.find((s) => s.id === "style1")?.height).toBe(
      4
    )
    expect(cad.state().currentTextStyleId).toBe("style3")
  })

  it("New proposes Estilo1 in Spanish (table 9391)", () => {
    const cad = createHarness({ locale: es })
    expect(cad.runtime.createTextStyle()).toBe("Estilo1")
  })
})

describe("the text style drop-down (STY-02, TEXT-D46)", () => {
  it("puts two texts on a style in one step (scratch c/styledrop)", () => {
    const cad = createHarness({
      entities: [
        createText(p(0, 0), "A", { id: "A" }),
        createText(p(0, 50), "B", { id: "B" }),
      ],
    })
    cad.runtime.createTextStyle("S2", undefined, false)
    cad.select("A", "B")
    cad.runtime.setSelectionTextStyle("S2")
    cad.escape()

    expect(written(cad, "_U")).toEqual(["U", "Modify Property"])
    expect(cad.byId<TextEntity>("A").styleId).toBe("Standard")
    expect(cad.byId<TextEntity>("B").styleId).toBe("Standard")
  })
})

describe("the style managers", () => {
  it("open from the DIMSTYLE and STYLE commands, each on its table", () => {
    const cad = createHarness()
    expect(cad.state().palette.open).toBe(false)

    cad.command("DIMSTYLE")
    expect(cad.state().palette).toEqual({ open: true, tab: "styles" })
    expect(cad.state().stylesTable).toBe("dimension")

    cad.command("STYLE")
    expect(cad.state().palette).toEqual({ open: true, tab: "styles" })
    expect(cad.state().stylesTable).toBe("text")
  })

  it("answer to acad.pgp's DST, DIMSTY, DDIM and DDSTYLE, es DCOTA and ESTILODD", () => {
    for (const [locale, table, names] of [
      [undefined, "dimension", ["DST", "DIMSTY", "DDIM"]],
      [undefined, "text", ["DDSTYLE"]],
      [es, "dimension", ["DCOTA"]],
      [es, "text", ["ESTILODD"]],
    ] as const) {
      for (const name of names) {
        const cad = createHarness({ locale })
        cad.runtime.setStylesTable(table === "text" ? "dimension" : "text")
        cad.command(name)
        expect([name, cad.state().stylesTable]).toEqual([name, table])
        expect(cad.state().palette.open).toBe(true)
      }
    }
  })

  it("STYLE drops the preselection, as the Text Style dialog does (p160, d07)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1")
    cad.command("STYLE")
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().palette).toEqual({ open: true, tab: "styles" })
  })

  it("fold when their trigger is pressed while they show", () => {
    const cad = createHarness()
    cad.runtime.togglePalette("styles")
    expect(cad.state().palette).toEqual({ open: true, tab: "styles" })
    cad.runtime.togglePalette("styles")
    expect(cad.state().palette).toEqual({ open: false, tab: "styles" })
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
