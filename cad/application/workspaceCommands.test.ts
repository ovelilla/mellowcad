import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { p } from "../../test/builders"
import { LengthUnit } from "../domain/units"
import { type CommandLineEntryKind, temporaryPromptLines } from "./CommandLine"
import { es } from "../locales/es"

/** What `texts`, typed at the command line and confirmed, wrote in the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

/** A harness with one line drawn, LINE ended. */
function withLine(locale?: typeof es): CadHarness {
  const cad = createHarness({ locale })
  written(cad, "_LINE", "0,0", "10,0", "")
  return cad
}

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

  // The Spanish names: string tables 52590 (LIMPIAPANTACT) and 52589
  // (LIMPIAPANTDES).
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

  // probe workspace/p306: `_CLEANSCREENON`, `_U` writes `CLEANSCREENON` (es
  // `LIMPIAPANTACT`); then `_CLEANSCREENOFF`, already off, is a step too
  it.each([
    ["CLEANSCREENON", "CLEANSCREENOFF", undefined],
    ["LIMPIAPANTACT", "LIMPIAPANTDES", es],
  ])(
    "%s and %s are each a step U names, the line before kept",
    (on, off, locale) => {
      const cad = withLine(locale)

      expect(written(cad, "_CLEANSCREENON", "_U").at(-1)).toBe(on)
      expect(cad.state().cleanScreen.active).toBe(false)
      expect(cad.entityCount).toBe(1)

      expect(written(cad, "_CLEANSCREENOFF", "_U").at(-1)).toBe(off)
      expect(cad.state().cleanScreen.active).toBe(false)
      expect(cad.entityCount).toBe(1)
    }
  )

  // probe workspace/p316: after U CLEANSCREENSTATE is 0, REDO
  // (`CLEANSCREENON`) sets it to 1
  it("REDO turns it on again", () => {
    const cad = createHarness()
    written(cad, "CLEANSCREENON", "U")

    expect(written(cad, "REDO")).toContain("CLEANSCREENON")
    expect(cad.state().cleanScreen.active).toBe(true)
  })

  it("leaves the drawing unchanged, so the autosave does not run", () => {
    const cad = createHarness()

    written(cad, "CLEANSCREENON", "U", "REDO")

    expect(cad.state().saveState).toBe("idle")
  })

  // probe workspace/p305
  it("'CLEANSCREENON inside LINE is refused and LINE goes on", () => {
    const cad = createHarness()
    written(cad, "LINE", "0,0")

    expect(written(cad, "'CLEANSCREENON")).toEqual([
      "Specify next point or [Undo]: 'CLEANSCREENON",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
    expect(cad.activeToolId()).toBe("line")
    expect(cad.state().cleanScreen.active).toBe(false)
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
  // acad.pgp en:417 `UN`, en:505 `DDUNITS`; es:284 `UNS`, es:513 `DDUNITS`
  // (probe workspace/p311)
  it.each([
    [undefined, "UNITS"],
    [undefined, "UN"],
    [undefined, "DDUNITS"],
    [es, "UNIDADES"],
    [es, "UNS"],
    [es, "DDUNITS"],
    [es, "_UNITS"],
  ])("%s %s opens the Drawing Units dialog", (locale, name) => {
    const cad = createHarness({ locale })

    cad.command(name)

    expect(cad.state().unitsDialog).toBe(true)
    cad.runtime.setUnitsDialog(false)
    expect(cad.state().unitsDialog).toBe(false)
  })

  // probes workspace/p307 (`_UNITS`, `_U` writes `UNITS`, es `UNIDADES`) and
  // p308 (-UNITS' precision put back by U)
  it.each([
    ["UNITS", undefined],
    ["UNIDADES", es],
  ])("OK's change is the run's step, U names %s", (name, locale) => {
    const cad = withLine(locale)
    written(cad, "_UNITS")

    cad.runtime.applyDrawingUnits(LengthUnit.Meter, 4)
    cad.runtime.setUnitsDialog(false)
    expect(cad.state()).toMatchObject({
      documentUnit: "m",
      documentPrecision: 4,
    })

    expect(written(cad, "_U").at(-1)).toBe(name)
    expect(cad.state()).toMatchObject({
      documentUnit: "mm",
      documentPrecision: 2,
    })
    expect(cad.entityCount).toBe(1)
  })

  // probe workspace/p309: -UNITS answered with every default is still a
  // step; UNITS' OK with nothing changed taken so. Cancel's step is
  // unverified (the desktop's, WSD d05): a run is a step whatever it did.
  it.each([
    ["OK", () => true],
    ["Cancel", () => false],
  ])("closed by %s with nothing changed is still a step", (_, ok) => {
    const cad = withLine()
    written(cad, "UNITS")

    if (ok()) cad.runtime.applyDrawingUnits(LengthUnit.Millimeter, 2)
    cad.runtime.setUnitsDialog(false)

    expect(written(cad, "U").at(-1)).toBe("UNITS")
    expect(cad.entityCount).toBe(1)
  })

  // probe workspace/p303: `'_UNITS` at LINE's prompt, `Resuming LINE
  // command.` once the (modal) dialog has closed
  it("'UNITS inside LINE resumes LINE when its dialog closes", () => {
    const cad = createHarness()
    written(cad, "LINE", "0,0")

    expect(written(cad, "'UNITS")).toEqual([
      "Specify next point or [Undo]: 'UNITS",
    ])
    expect(cad.state().unitsDialog).toBe(true)

    cad.runtime.applyDrawingUnits(LengthUnit.Meter, 4)
    const from = cad.commandLog().length
    cad.runtime.setUnitsDialog(false)
    expect(cad.commandLog().slice(from)).toEqual(["Resuming LINE command."])
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )

    // The change is an entry of LINE's step.
    written(cad, "10,0", "", "U")
    expect(cad.entityCount).toBe(0)
    expect(cad.state().documentPrecision).toBe(2)
  })

  // acad.cuix ID_Units (MM_0578, MM_1470): `'_units `
  it("the menus' Units runs the macro '_units, inside LINE too", () => {
    const idle = createHarness()
    const from = idle.commandLog().length
    idle.runtime.openDrawingUnits()
    expect(idle.commandLog().slice(from)).toEqual(["'_units"])
    expect(idle.state().unitsDialog).toBe(true)

    const cad = createHarness()
    written(cad, "LINE", "0,0")
    const mark = cad.commandLog().length
    cad.runtime.openDrawingUnits()
    expect(cad.state().unitsDialog).toBe(true)
    cad.runtime.setUnitsDialog(false)
    expect(cad.commandLog().slice(mark)).toEqual([
      "Specify next point or [Undo]: '_units",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")
  })

  // probe workspace/p300: `Enter number of digits to right of decimal point
  // (0 to 8) <4>:`
  it("keeps the precision AutoCAD offers, 0 to 8 places", () => {
    const cad = createHarness()
    written(cad, "UNITS")

    cad.runtime.applyDrawingUnits(LengthUnit.Millimeter, 12)
    expect(cad.state().documentPrecision).toBe(8)
  })
})
