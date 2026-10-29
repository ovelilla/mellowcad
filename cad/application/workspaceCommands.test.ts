import { describe, expect, it } from "vitest"

import {
  type CadHarness,
  createHarness,
  MemoryFileTransport,
} from "../../test/harness"
import { lineOf, p } from "../../test/builders"
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
function withLine(locale?: typeof es, files?: MemoryFileTransport): CadHarness {
  const cad = createHarness({ locale, files })
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

/**
 * acad.cuix's AcceleratorRoot: each key is a macro that starts `^C^C`, so the
 * running command is cancelled first, then the command runs echoed as the
 * macro writes it (desktop workspace/d04).
 */
describe("the accelerators' macros", () => {
  /** LINE running, one line drawn, at its next point. */
  function inLine(files?: MemoryFileTransport): CadHarness {
    const cad = createHarness({ files })
    written(cad, "LINE", "0,0", "10,0")
    return cad
  }

  /** What `key` with Ctrl wrote in the history. */
  function pressed(cad: CadHarness, key: string, shiftKey = false): string[] {
    const from = cad.commandLog().length
    expect(cad.press(key, { ctrlKey: true, shiftKey })).toBe(true)
    return cad.commandLog().slice(from)
  }

  const CANCEL = "Specify next point or [Undo]: *Cancel*"

  // ID_CleanScreen: `$M=$(if,$(and,$(getvar,CleanScreenState),1),
  // ^C^C_CleanScreenOFF,^C^C_CleanScreenON)`
  // desktop workspace/d04: U names the macro's group `CLEANSCREENON GROUP`.
  it("Ctrl+0 ends LINE, then runs CLEANSCREENON or OFF: a group U names", () => {
    const cad = inLine()

    expect(pressed(cad, "0")).toEqual([CANCEL, "_CleanScreenON"])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().cleanScreen.active).toBe(true)
    expect(pressed(cad, "0")).toEqual(["_CleanScreenOFF"])
    expect(cad.state().cleanScreen.active).toBe(false)

    expect(written(cad, "U").at(-1)).toBe("CLEANSCREENOFF GROUP")
    expect(cad.state().cleanScreen.active).toBe(true)
    expect(written(cad, "U").at(-1)).toBe("CLEANSCREENON GROUP")
    expect(cad.state().cleanScreen.active).toBe(false)
    expect(cad.entityCount).toBe(1)
  })

  // ID_Modify: `$M=$(if,$(and,$(>,$(getvar,opmstate),0)),
  // ^C^C_propertiesclose,^C^C_properties)`
  it("Ctrl+1 ends LINE, then runs PROPERTIES or PROPERTIESCLOSE", () => {
    const cad = inLine()
    cad.runtime.setPaletteOpen(false)

    expect(pressed(cad, "1")).toEqual([CANCEL, "_properties"])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().palette).toEqual({ open: true, tab: "properties" })
    expect(pressed(cad, "1")).toEqual(["_propertiesclose"])
    expect(cad.state().palette.open).toBe(false)
  })

  // ID_CmdLine: `$M=$(if,$(and,$(>,$(getvar,clistate),0)),
  // ^C^C_commandlinehide,^C^C_commandline)`
  it("Ctrl+9 ends LINE, then hides or shows the command window", () => {
    const cad = inLine()

    expect(pressed(cad, "9")).toEqual([CANCEL, "_commandlinehide"])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().commandLine.visible).toBe(false)
    expect(pressed(cad, "9")).toEqual(["_commandline"])
    expect(cad.state().commandLine.visible).toBe(true)
  })

  // ID_Save `^C^C_qsave `, ID_Saveas `^C^C_saveas `, ID_Open `^C^C_open `
  it.each([
    ["s", false, "_qsave"],
    ["s", true, "_saveas"],
  ])("Ctrl+%s (Shift %s) ends LINE, then saves: %s", (key, shift, echo) => {
    const files = new MemoryFileTransport()
    const cad = inLine(files)

    expect(pressed(cad, key, shift)).toEqual([CANCEL, echo])
    expect(cad.activeToolId()).toBe("select")
    expect(files.saved).toHaveLength(1)
    expect(cad.entityCount).toBe(1)
  })

  it("Ctrl+O ends LINE, then opens", () => {
    const files = new MemoryFileTransport(null)
    const cad = inLine(files)

    expect(pressed(cad, "o")).toEqual([CANCEL, "_open"])
    expect(cad.activeToolId()).toBe("select")
    expect(files.openCalls).toBe(1)
  })

  it("cancels a transparent command and the one it interrupted", () => {
    const cad = inLine(new MemoryFileTransport())
    written(cad, "'ZOOM")

    cad.press("s", { ctrlKey: true })

    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog().at(-1)).toBe("_qsave")
  })

  it("keeps the selection at the Command prompt, which a macro acts on", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    cad.selectAll()

    expect(pressed(cad, "1")).toEqual(["_properties"])
    expect(cad.selectedIds()).toHaveLength(1)
  })
})

describe("the tool palette's macros", () => {
  // acad.cuix ID_AttdispNo/On/Of `'_attdisp _n` / `_on` / `_off`; probe
  // workspace/p313: `'_attdisp` at LINE's prompt asks `>>Enter attribute
  // visibility setting [Normal/ON/OFF] <Normal>:` and resumes LINE
  it("Attribute display runs '_attdisp inside LINE, which resumes", () => {
    const cad = createHarness()
    written(cad, "LINE", "0,0")

    cad.tool("attdisp")
    expect(cad.activeToolId()).toBe("attdisp")
    expect(cad.state().commandLine.prompt).toBe(
      "'ATTDISP >>Enter attribute visibility setting [Normal/ON/OFF] <Normal>:"
    )
    expect(written(cad, "_N")).toEqual([
      ">>Enter attribute visibility setting [Normal/ON/OFF] <Normal>: _N",
      "Resuming LINE command.",
    ])
    expect(cad.activeToolId()).toBe("line")

    cad.escape()
    cad.tool("attdisp")
    expect(cad.commandLog().at(-1)).toBe("'_attdisp")
  })

  // RibbonRoot, Home › Block, Edit Attributes ▸ Single: ID_EAttEdit
  // `^C^C_eattedit ` (Multiple, ID_AtteditGlo, is `^C^C_-attedit `)
  it("Edit attributes runs EATTEDIT, as the ribbon's Single", () => {
    const cad = createHarness()
    written(cad, "LINE", "0,0")

    cad.tool("attedit")
    expect(cad.commandLog().at(-1)).toBe("_eattedit")
    expect(cad.activeToolId()).toBe("attedit")
    expect(cad.state().commandLine.prompt).toMatch(/^EATTEDIT /)
    expect(
      cad.state().tools.find((tool) => tool.id === "attedit")?.shortcut
    ).toBe("EATTEDIT")

    cad.escape()
    expect(written(cad, "ATTEDIT")).toEqual(["ATTEDIT"])
    expect(cad.state().commandLine.prompt).toMatch(/^ATTEDIT /)
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

/**
 * The drafting aids' keys and status-bar buttons (desktop workspace/d01,
 * e01): each echoes ` <Grid on>`, and its change is recorded into the last
 * undo step, as AutoCAD records the variable.
 */
describe("the drafting toggles", () => {
  /** What `toggle` wrote in the history. */
  function toggled(cad: CadHarness, toggle: () => void): string[] {
    const from = cad.commandLog().length
    toggle()
    return cad.commandLog().slice(from)
  }

  // string tables 16646 and 4743; es e01
  it.each([
    [" <Grid on>", " <Grid off>", " <Selection Cycling on>", undefined],
    [
      " <Rejilla activado>",
      " <Rejilla desactivado>",
      " <Ciclo de selección activado>",
      es,
    ],
  ])(
    "F7 and F4 echo %s, %s, %s at Command:",
    (gridOn, gridOff, cycling, locale) => {
      const cad = createHarness({ locale })

      expect(toggled(cad, () => cad.press("F7"))).toEqual([gridOff])
      expect(toggled(cad, () => cad.press("F7"))).toEqual([gridOn])
      expect(toggled(cad, () => cad.press("F4"))).toEqual([cycling])
    }
  )

  // desktop workspace/d01, d01-2, d01-3: the buttons write as their keys,
  // after the running prompt inside a command
  it("the status bar's buttons echo as their keys, at Command: and in LINE", () => {
    const cad = createHarness()
    const { runtime } = cad

    expect(toggled(cad, () => runtime.toggleGrid())).toEqual([" <Grid off>"])
    expect(toggled(cad, () => runtime.toggleOrtho())).toEqual([" <Ortho on>"])
    expect(toggled(cad, () => runtime.togglePolar())).toEqual([" <Polar on>"])
    expect(toggled(cad, () => runtime.toggleSnapMode())).toEqual([" <Snap on>"])
    expect(toggled(cad, () => runtime.toggleSnap())).toEqual([" <Osnap on>"])
    expect(toggled(cad, () => runtime.toggleObjectSnapTracking())).toEqual([
      " <Object Snap Tracking off>",
    ])
    expect(toggled(cad, () => runtime.toggleSelectionCycling())).toEqual([
      " <Selection Cycling on>",
    ])

    written(cad, "_LINE", "0,0")
    expect(toggled(cad, () => runtime.toggleOrtho())).toEqual([
      "Specify next point or [Undo]:  <Ortho on>",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
  })

  // acad.cuix's `^O` (MM_0005): Ctrl+L toggles Ortho as F8, echoing as it
  // and joining the step before (desktop workspace/d01; MAC-09)
  it("Ctrl+L toggles Ortho as F8 does", () => {
    const cad = withLine()

    expect(toggled(cad, () => cad.press("l", { ctrlKey: true }))).toEqual([
      " <Ortho on>",
    ])
    expect(cad.state().orthoActive).toBe(true)
    expect(written(cad, "_U")).toEqual(["U", "LINE"])
    expect(cad.state().orthoActive).toBe(false)
  })

  // desktop workspace/d01-m: 45 chosen writes nothing and turns Polar on
  it("choosing a Polar angle writes nothing and turns Polar on", () => {
    const cad = createHarness()

    expect(toggled(cad, () => cad.runtime.choosePolarAngle(45))).toEqual([])
    expect(cad.state().polarActive).toBe(true)
    expect(cad.state().polarAngleStep).toBe(45)
  })

  // desktop workspace/d01: LINE, F7 → U writes `LINE`, the line and the grid
  // gone; LINE, F7, F8, Ctrl+W → U puts the three back with the line
  it("U takes a toggle back with the step before it", () => {
    const cad = withLine()
    cad.press("F7")
    cad.press("F8")
    cad.press("F4")

    expect(written(cad, "_U")).toEqual(["U", "LINE"])
    expect(cad.entityCount).toBe(0)
    expect(cad.state()).toMatchObject({
      gridVisible: true,
      orthoActive: false,
      selectionCycling: { active: false },
    })

    written(cad, "_REDO")
    expect(cad.entityCount).toBe(1)
    expect(cad.state()).toMatchObject({
      gridVisible: false,
      orthoActive: true,
      selectionCycling: { active: true },
    })
  })

  // desktop workspace/d01: LINE, Grid, LINE → U the second line only, U
  // again the first and the grid
  it("the status bar's Grid joins the step before, not the one after", () => {
    const cad = withLine()
    cad.runtime.toggleGrid()
    written(cad, "_LINE", "0,10", "10,10", "")

    written(cad, "_U")
    expect(cad.entityCount).toBe(1)
    expect(cad.state().gridVisible).toBe(false)
    written(cad, "_U")
    expect(cad.entityCount).toBe(0)
    expect(cad.state().gridVisible).toBe(true)
  })

  it("inside a command joins its step, Polar's turning Ortho off too", () => {
    const cad = createHarness()
    cad.press("F8")
    written(cad, "_LINE", "0,0")
    cad.press("F10")
    written(cad, "10,0", "")
    expect(cad.state()).toMatchObject({ orthoActive: false, polarActive: true })

    expect(written(cad, "_U")).toEqual(["U", "LINE"])
    expect(cad.entityCount).toBe(0)
    expect(cad.state()).toMatchObject({ orthoActive: true, polarActive: false })
  })

  it("is no step with nothing to undo", () => {
    const cad = createHarness()
    cad.press("F7")

    written(cad, "_U")
    expect(cad.state().gridVisible).toBe(false)
  })
})

/**
 * What the chrome starts runs as a menu macro: one undo group U names after
 * it, `GROUP` first when the group made no step of its own (desktop
 * workspace/d01–d05).
 */
describe("the chrome's undo groups", () => {
  // desktop workspace/d04: Ctrl+1 twice, then U, U. Ctrl+S's save is a step
  // of the group, `QSAVE GROUP` (CLIPBOARD-D2: d04's `GROUP QSAVE` was the
  // dialog cancelled, which a download never is)
  it("Ctrl+1 is a group that changed nothing and Ctrl+S one that saved, the line kept", () => {
    const cad = withLine(undefined, new MemoryFileTransport())

    cad.press("1", { ctrlKey: true })
    cad.press("1", { ctrlKey: true })
    cad.press("s", { ctrlKey: true })
    expect(written(cad, "_U", "_U", "_U")).toEqual([
      "U",
      "QSAVE GROUP Regenerating model.",
      "U",
      "GROUP PROPERTIESCLOSE",
      "U",
      "GROUP PROPERTIES",
    ])
    expect(cad.entityCount).toBe(1)
  })

  // desktop workspace/d01: no echo; U names CLEANSCREENON (with RIBBON and
  // RIBBONCLOSE, the ribbon's own commands, not built)
  it("the status bar's Clean Screen writes nothing and is a step", () => {
    const cad = withLine()
    const from = cad.commandLog().length
    cad.runtime.toggleCleanScreen()
    expect(cad.commandLog().slice(from)).toEqual([])
    expect(cad.state().cleanScreen.active).toBe(true)

    expect(written(cad, "_U")).toEqual(["U", "CLEANSCREENON"])
    expect(cad.state().cleanScreen.active).toBe(false)
    expect(cad.entityCount).toBe(1)
  })

  // desktop workspace/d05-4: the application menu's Units during LINE
  it("the application menu's Units cancels LINE, runs _UNITS, a group U names", () => {
    const cad = createHarness()
    written(cad, "_LINE", "0,0")
    const from = cad.commandLog().length

    cad.runtime.openDrawingUnitsFromMenu()
    expect(cad.commandLog().slice(from)).toEqual([
      "Specify next point or [Undo]: *Cancel*",
      "_UNITS",
    ])
    expect(cad.state().unitsDialog).toBe(true)
    cad.runtime.setUnitsDialog(false)
    expect(cad.activeToolId()).toBe("select")

    expect(written(cad, "_U")).toEqual(["U", "UNITS GROUP"])
  })

  // desktop workspace/d02: the ribbon's Line; a typed LINE stays `LINE`
  it("a rail start is named LINE GROUP, a typed one LINE", () => {
    const cad = createHarness()
    cad.tool("line")
    written(cad, "0,0", "10,0", "")
    written(cad, "_LINE", "0,10", "10,10", "")

    expect(written(cad, "_U", "_U")).toEqual(["U", "LINE", "U", "LINE GROUP"])
  })
})

// `AB CD` typed key by key at the command line is one answer at every name
// or string prompt, Space a character and Enter its end (desktop
// workspace/d06; UCS's Save and Restore names, ucs/d05).
describe("the name prompts take spaces", () => {
  it.each([
    [["_UCS", "_NA", "_D"], "Enter UCS name(s) to delete <none>: AB CD"],
    [["_UCS", "_NA", "?"], "Enter UCS name(s) to list <*>: AB CD"],
    [["_PLAN", "_U"], "Enter name of UCS or [?]: AB CD"],
    [["-BLOCK"], "Enter block name or [?]: AB CD"],
    [["-BLOCK", "?"], "Enter block(s) to list <*>: AB CD"],
    [["-INSERT"], "Enter block name or [?]: AB CD"],
    [["-PURGE", "_B"], "Enter name(s) to purge <*>: AB CD"],
    [["_TEXT", "_S"], "Enter style name or [?] <Standard>: AB CD"],
    [["-DIMSTYLE", "_S"], "Enter name for new dimension style or [?]: AB CD"],
    [
      ["-DIMSTYLE", "_R"],
      "Enter a dimension style name, [?] or <select dimension>: AB CD",
    ],
    [["-LINETYPE", "_S"], "Specify linetype name or [?] <ByLayer>: AB CD"],
    [
      ["_SETVAR", "INSNAME"],
      'Enter new value for INSNAME, or . for none <"">: AB CD',
    ],
  ])("at %j (d06)", (texts, line) => {
    const cad = createHarness()
    written(cad, ...texts)
    expect(cad.state().commandLine.takesSpaces).toBe(true)
    for (const key of "AB CD") cad.press(key)
    cad.press("Enter")
    expect(cad.commandLog()).toContain(line)
  })

  it("sets a string variable whole (d06)", () => {
    const cad = createHarness()
    written(cad, "_SETVAR", "INSNAME")
    for (const key of "AB CD") cad.press(key)
    cad.press("Enter")
    written(cad, "INSNAME")
    expect(cad.state().commandLine.prompt).toBe(
      'INSNAME Enter new value for INSNAME, or . for none <"AB CD">:'
    )
  })

  it("leaves Space as Enter at a prompt asking no name", () => {
    const cad = createHarness()
    written(cad, "_SETVAR")
    expect(cad.state().commandLine.takesSpaces).toBe(false)
    written(cad, "ORTHOMODE")
    expect(cad.state().commandLine.takesSpaces).toBe(false)
  })
})
