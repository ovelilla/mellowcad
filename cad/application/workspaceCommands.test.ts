import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { p } from "../../test/builders"
import { LengthUnit } from "../domain/units"
import { type CommandLineEntryKind, temporaryPromptLines } from "./CommandLine"
import { es } from "../locales/es"

/**
 * What AutoCAD's window shortcuts and commands do to the workspace: the
 * command window (Ctrl+9, F2 and its temporary prompt lines), Clean Screen
 * (Ctrl+0, CLEANSCREENON / CLEANSCREENOFF), Properties (Ctrl+1) and the
 * Drawing Units dialog (UNITS).
 */

describe("the command window", () => {
  it("Ctrl+9 hides and shows it", () => {
    const cad = createHarness()

    expect(cad.press("9", { ctrlKey: true })).toBe(true)
    expect(cad.state().commandLine.visible).toBe(false)
    cad.press("9", { ctrlKey: true })
    expect(cad.state().commandLine.visible).toBe(true)
  })

  it("F2 expands the history, and shows a hidden command line", () => {
    const cad = createHarness()
    cad.press("9", { ctrlKey: true })

    expect(cad.press("F2")).toBe(true)
    expect(cad.state().commandLine).toMatchObject({
      historyOpen: true,
      visible: true,
    })
    cad.press("F2")
    expect(cad.state().commandLine.historyOpen).toBe(false)
  })

  it("collapses the history on Escape, which still cancels the command", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    cad.press("F2")

    cad.press("Escape")

    expect(cad.state().commandLine.historyOpen).toBe(false)
    expect(cad.state().activeToolId).toBe("select")
  })

  it("collapses the history on a press on the drawing", () => {
    const cad = createHarness()
    cad.press("F2")

    cad.click(p(10, 10))

    expect(cad.state().commandLine.historyOpen).toBe(false)
  })

  it("keeps the last command's lines as the temporary prompt history", () => {
    const cad = createHarness()
    cad.command("ID").click(p(3, 4))

    expect(cad.state().commandLine.recent).toEqual([
      { kind: "command", text: "ID" },
      { kind: "prompt", text: "Specify point:" },
      { kind: "info", text: " X = 3.00     Y = 4.00     Z = 0.00" },
    ])

    cad.command("LTSCALE")
    expect(cad.state().commandLine.recent).toEqual([
      { kind: "command", text: "LTSCALE" },
    ])
  })

  it("shows at most CLIPROMPTLINES (3) of them", () => {
    const line = (kind: CommandLineEntryKind, text: string) => ({ kind, text })

    expect(
      temporaryPromptLines([
        line("command", "DIST"),
        line("info", "a"),
        line("info", "b"),
        line("error", "c"),
      ])
    ).toEqual([line("info", "a"), line("info", "b"), line("error", "c")])
    expect(temporaryPromptLines([])).toEqual([])
  })
})

describe("Clean Screen", () => {
  it("Ctrl+0 turns it on and off", () => {
    const cad = createHarness()

    expect(cad.state().cleanScreen).toEqual({ active: false, palette: false })
    expect(cad.press("0", { ctrlKey: true })).toBe(true)
    expect(cad.state().cleanScreen.active).toBe(true)
    cad.press("0", { ctrlKey: true })
    expect(cad.state().cleanScreen.active).toBe(false)
  })

  it.each([
    [undefined, "CLEANSCREENON", "CLEANSCREENOFF"],
    [es, "LIMPIAPANTACT", "LIMPIAPANTDES"],
    [es, "_CLEANSCREENON", "_CLEANSCREENOFF"],
  ])("%s %s and %s set it", (locale, on, off) => {
    const cad = createHarness({ locale })

    cad.command(on)
    expect(cad.state().cleanScreen.active).toBe(true)
    cad.command(on)
    expect(cad.state().cleanScreen.active).toBe(true)
    cad.command(off)
    expect(cad.state().cleanScreen.active).toBe(false)
  })

  it("shows the palette panel again when a palette is opened", () => {
    const cad = createHarness()
    cad.command("CLEANSCREENON")

    cad.command("LAYER")
    expect(cad.state().cleanScreen).toEqual({ active: true, palette: true })

    cad.command("LAYERCLOSE")
    expect(cad.state().cleanScreen).toEqual({ active: true, palette: false })

    cad.command("PROPERTIES")
    cad.command("CLEANSCREENOFF")
    cad.command("CLEANSCREENON")
    expect(cad.state().cleanScreen.palette).toBe(false)
    expect(cad.state().palette.open).toBe(true)
  })

  it("is not saved with the drawing", () => {
    const cad = createHarness()
    cad.command("CLEANSCREENON")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.state().cleanScreen.active).toBe(false)
  })
})

describe("Ctrl+1", () => {
  it("shows and hides the Properties palette", () => {
    const cad = createHarness()

    expect(cad.press("1", { ctrlKey: true })).toBe(true)
    expect(cad.state().palette).toEqual({ open: true, tab: "properties" })
    cad.press("1", { ctrlKey: true })
    expect(cad.state().palette.open).toBe(false)

    cad.command("LAYER")
    cad.press("1", { ctrlKey: true })
    expect(cad.state().palette).toEqual({ open: true, tab: "properties" })
  })
})

describe("UNITS", () => {
  it.each([
    [undefined, "UNITS"],
    [undefined, "UN"],
    [es, "UNIDADES"],
    [es, "UNS"],
    [es, "_UNITS"],
  ])("%s %s opens the Drawing Units dialog", (locale, name) => {
    const cad = createHarness({ locale })

    cad.command(name)

    expect(cad.state().unitsDialog).toBe(true)
    cad.runtime.setUnitsDialog(false)
    expect(cad.state().unitsDialog).toBe(false)
  })

  it("applies the unit and the precision as one undo step", () => {
    const cad = createHarness()

    cad.runtime.applyDrawingUnits(LengthUnit.Meter, 4)
    expect(cad.state()).toMatchObject({
      documentUnit: "m",
      documentPrecision: 4,
    })

    cad.undo()
    expect(cad.state()).toMatchObject({
      documentUnit: "mm",
      documentPrecision: 2,
    })
  })

  it("leaves no undo step when nothing changes", () => {
    const cad = createHarness()

    cad.runtime.applyDrawingUnits(LengthUnit.Millimeter, 2)

    expect(cad.state().canUndo).toBe(false)
  })

  it("keeps the precision AutoCAD offers, 0 to 8 places", () => {
    const cad = createHarness()

    cad.runtime.applyDrawingUnits(LengthUnit.Millimeter, 12)
    expect(cad.state().documentPrecision).toBe(8)
  })
})
