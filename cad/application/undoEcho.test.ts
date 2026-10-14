import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { es } from "../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const LINE = ["L", "0,0", "10,0", ""]
const CIRCLE = ["C", "5,5", "2"]

// AutoCAD 2023's console (acc/r1–r20, s1–s14 of the hidden UCS words
// session): U names what it took back, REDO what it did again.
describe("U and REDO say what they did", () => {
  it("U names the command, then says nothing is left", () => {
    const cad = answer(createHarness(), ...LINE, ...CIRCLE)
    expect(written(cad, "U", "U", "U", "U")).toEqual([
      "U",
      "CIRCLE",
      "U",
      "LINE",
      "U",
      "Everything has been undone",
      "U",
      "Nothing to undo",
    ])
    answer(cad, ...LINE)
    expect(written(cad, "U", "U")).toEqual([
      "U",
      "LINE",
      "U",
      "Everything has been undone",
    ])
  })

  it("REDO follows only a U that took something back", () => {
    const cad = answer(createHarness(), ...LINE, ...CIRCLE)
    expect(written(cad, "U", "U", "REDO", "REDO")).toEqual([
      "U",
      "CIRCLE",
      "U",
      "LINE",
      "REDO",
      "LINE",
      "REDO",
      "REDO must immediately follow the U or UNDO command.",
    ])
    expect(cad.entities()).toHaveLength(1)

    const all = answer(createHarness(), ...LINE)
    expect(written(all, "U", "REDO", "REDO")).toEqual([
      "U",
      "LINE",
      "REDO",
      "LINE",
      "Everything has been redone",
      "REDO",
      "Nothing to redo",
    ])

    const fresh = createHarness()
    expect(written(fresh, "U", "REDO")).toEqual([
      "U",
      "Everything has been undone",
      "REDO",
      "REDO must immediately follow the U or UNDO command.",
    ])
  })

  it("has nothing to redo once another command ran", () => {
    for (const between of [CIRCLE, ["ID", "5,5"]]) {
      const cad = answer(createHarness(), ...LINE, "U", ...between)
      expect(written(cad, "REDO")).toEqual(["REDO", "Nothing to redo"])
    }
  })

  it("names a command by its name, however it was typed", () => {
    const cad = answer(createHarness(), ...LINE)
    expect(written(cad, "_U", "_REDO", "UNDO", "")).toEqual([
      "U",
      "LINE",
      "REDO",
      "LINE",
      "Everything has been redone",
      "UNDO",
      "Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes",
      "Enter the number of operations to undo or [BEgin/End/Mark/Back] <1>:",
      "LINE",
    ])
    answer(cad, "UCS", "O", "10,0", "AUPREC", "2")
    answer(cad, ...CIRCLE, "ERASE", "L", "")
    expect(written(cad, "U", "U", "U", "U")).toEqual([
      "U",
      "ERASE",
      "U",
      "CIRCLE",
      "U",
      "AUPREC",
      "U",
      "UCS",
    ])
  })

  it("says the regeneration a command made, a transparent one's too", () => {
    const cad = answer(createHarness(), "LTSCALE", "2")
    expect(written(cad, "U", "REDO")).toEqual([
      "U",
      "LTSCALE Regenerating model.",
      "REDO",
      "LTSCALE",
      "Everything has been redone",
      "Regenerating model.",
    ])

    const view = answer(createHarness(), "-VIEW", "O", "F")
    expect(written(view, "U")).toEqual(["U", "-VIEW Regenerating model."])

    const line = answer(createHarness(), ...LINE)
    answer(line, "LINE", "0,0", "'LTSCALE", "3", "5,0", "")
    expect(written(line, "U", "REDO")).toEqual([
      "U",
      "LINE Regenerating model.",
      "REDO",
      "LINE",
      "Everything has been redone",
      "Regenerating model.",
    ])
  })

  // acad.cuix: Ctrl+Z runs `_u` (ID_U), the shortcut menu's Undo `^C^C_u`.
  it("Ctrl+Z at the Command prompt is U", () => {
    const cad = answer(createHarness(), ...LINE)
    cad.press("z", { ctrlKey: true })
    expect(cad.commandLog().slice(-2)).toEqual(["U", "LINE"])
    expect(cad.entities()).toHaveLength(0)
  })

  it("the shortcut menu's Undo is U", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, ...CIRCLE)
    cad.runtime.chooseShortcutMenuAction("undo")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "CIRCLE"])
  })

  it("speaks Autodesk's Spanish, whose U is H", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "")
    expect(written(cad, "H", "REHACER", "H", "H", "H", "REHACER")).toEqual([
      "H",
      "LINEA",
      "REHACER",
      "LINEA",
      "Todo repetido",
      "H",
      "LINEA",
      "H",
      "Ya se ha deshecho todo",
      "H",
      "Nada que deshacer",
      "REHACER",
      "REHACER debe ir directamente a continuación del comando H o DESHACER.",
    ])
    expect(written(cad, "DESHACER", "").slice(-1)).toEqual([
      "Nada que deshacer",
    ])
  })
})
