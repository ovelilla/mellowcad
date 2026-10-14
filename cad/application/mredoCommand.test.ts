import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
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
const ARC = ["ARC", "0,0", "5,5", "10,0"]
const THREE = [...LINE, ...CIRCLE, ...ARC]
const ASK = "Enter number of actions or [All/Last]:"
const REFUSED = "Requires an integer between 1 and 32767, or option keyword."

/** A drawing of a line, a circle and an arc, all three taken back by U. */
const undone = () => answer(createHarness(), ...THREE, "U", "U", "U")

// AutoCAD 2023's console (acc/m1–m18, n1–n30 of the MREDO session).
describe("MREDO", () => {
  it("does again that many of what the undos took back", () => {
    const cad = undone()
    expect(written(cad, "MREDO")).toEqual(["MREDO"])
    expect(cad.state().commandLine.prompt).toBe(`MREDO ${ASK}`)
    expect(written(cad, "1", "MREDO", "1")).toEqual([
      `${ASK} 1`,
      "LINE",
      "MREDO",
      `${ASK} 1`,
      "CIRCLE",
    ])
    expect(written(cad, "MREDO", "1", "MREDO", "1")).toEqual([
      "MREDO",
      `${ASK} 1`,
      "ARC",
      "Everything has been redone",
      "MREDO",
      `${ASK} 1`,
      "Nothing to redo",
    ])
    expect(cad.entities()).toHaveLength(3)

    const more = answer(createHarness(), ...THREE, "UNDO", "3")
    expect(written(more, "MREDO", "2", "MREDO", "2")).toEqual([
      "MREDO",
      `${ASK} 2`,
      "LINE CIRCLE",
      "MREDO",
      `${ASK} 2`,
      "ARC",
      "Everything has been redone",
    ])
  })

  it("refuses what is no count, and takes Enter as one", () => {
    const cad = answer(createHarness(), ...LINE, ...CIRCLE, "U", "U")
    answer(cad, "MREDO")
    expect(written(cad, "FOO", "0", "-1", "1.5", "M", "2X", "")).toEqual([
      `${ASK} FOO`,
      REFUSED,
      `${ASK} 0`,
      REFUSED,
      `${ASK} -1`,
      REFUSED,
      `${ASK} 1.5`,
      REFUSED,
      `${ASK} M`,
      REFUSED,
      `${ASK} 2X`,
      REFUSED,
      ASK,
      "LINE",
    ])
    expect(written(cad, "MREDO", "5", "MREDO", "5")).toEqual([
      "MREDO",
      `${ASK} 5`,
      "CIRCLE",
      "Everything has been redone",
      "MREDO",
      `${ASK} 5`,
      "Nothing to redo",
    ])
  })

  it("All does everything again", () => {
    const cad = undone()
    expect(written(cad, "MREDO", "A", "MREDO", "ALL")).toEqual([
      "MREDO",
      `${ASK} A`,
      "LINE CIRCLE ARC",
      "Everything has been redone",
      "MREDO",
      `${ASK} ALL`,
      "Nothing to redo",
    ])
    answer(cad, "U")
    expect(written(cad, "MREDO", "_A").slice(-2)).toEqual([
      "ARC",
      "Everything has been redone",
    ])
  })

  it("Last does the last undo again, once", () => {
    const cad = undone()
    expect(written(cad, "MREDO", "L", "MREDO", "L")).toEqual([
      "MREDO",
      `${ASK} L`,
      "LINE",
      "MREDO",
      `${ASK} L`,
      "The last UNDO operation has been already redone.",
    ])
    expect(written(cad, "U", "MREDO", "LAST", "MREDO", "1")).toEqual([
      "U",
      "LINE",
      "MREDO",
      `${ASK} LAST`,
      "LINE",
      "MREDO",
      `${ASK} 1`,
      "CIRCLE",
    ])

    const many = answer(createHarness(), ...THREE, "UNDO", "3")
    expect(written(many, "MREDO", "_L").slice(-2)).toEqual([
      "LINE CIRCLE ARC",
      "Everything has been redone",
    ])

    const part = answer(createHarness(), ...THREE, "UNDO", "3", "MREDO", "1")
    expect(written(part, "MREDO", "L").slice(-1)).toEqual([
      "The last UNDO operation has been already redone.",
    ])
    const none = answer(createHarness(), ...LINE)
    expect(written(none, "MREDO", "L").slice(-1)).toEqual([
      "The last UNDO operation has been already redone.",
    ])
  })

  it("finds nothing to redo once another command ran, whatever it did", () => {
    for (const other of [
      CIRCLE,
      ["DIST", "0,0", "10,0"],
      ["ID", "0,0"],
      ["ZOOM", "E"],
      ["LTSCALE", ""],
    ]) {
      const cad = answer(createHarness(), ...LINE, "U", ...other)
      expect(written(cad, "MREDO", "1", "MREDO", "A").slice(-1)).toEqual([
        "Nothing to redo",
      ])
      expect(cad.commandLog().slice(-4, -3)).toEqual(["Nothing to redo"])
    }
  })

  it("does marks and groups again as REDO does", () => {
    const mark = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    answer(mark, ...ARC, "UNDO", "B")
    expect(written(mark, "MREDO", "1", "MREDO", "1", "MREDO", "1")).toEqual([
      "MREDO",
      `${ASK} 1`,
      "MREDO",
      `${ASK} 1`,
      "CIRCLE",
      "MREDO",
      `${ASK} 1`,
      "ARC",
      "Everything has been redone",
    ])
    const back = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    answer(back, ...ARC, "UNDO", "B")
    expect(written(back, "MREDO", "L").slice(-2)).toEqual([
      "CIRCLE ARC",
      "Everything has been redone",
    ])
    const alone = answer(createHarness(), ...LINE, "UNDO", "M", "U")
    expect(written(alone, "MREDO", "1", "MREDO", "L")).toEqual([
      "MREDO",
      `${ASK} 1`,
      "Everything has been redone",
      "MREDO",
      `${ASK} L`,
      "The last UNDO operation has been already redone.",
    ])

    const group = answer(createHarness(), "UNDO", "BE", ...LINE, ...CIRCLE)
    answer(group, "UNDO", "E", ...ARC, "U", "U")
    expect(written(group, "MREDO", "1", "MREDO", "1")).toEqual([
      "MREDO",
      `${ASK} 1`,
      "GROUP LINE CIRCLE",
      "MREDO",
      `${ASK} 1`,
      "ARC",
      "Everything has been redone",
    ])
  })

  it("says the regeneration after the names while more is left", () => {
    const cad = answer(createHarness(), ...LINE, "LTSCALE", "2", ...CIRCLE)
    answer(cad, "U", "U", "U")
    expect(written(cad, "MREDO", "2", "MREDO", "1")).toEqual([
      "MREDO",
      `${ASK} 2`,
      "LINE LTSCALE Regenerating model.",
      "MREDO",
      `${ASK} 1`,
      "CIRCLE",
      "Everything has been redone",
    ])
    const last = answer(createHarness(), ...LINE, "LTSCALE", "2", "U", "U")
    expect(written(last, "MREDO", "A").slice(-3)).toEqual([
      "LINE LTSCALE",
      "Everything has been redone",
      "Regenerating model.",
    ])
  })

  it("leaves REDO refused while more is left, as any redo does", () => {
    const cad = answer(createHarness(), ...LINE, ...CIRCLE, "U", "U")
    expect(written(cad, "MREDO", "1", "REDO").slice(-1)).toEqual([
      "REDO must immediately follow the U or UNDO command.",
    ])
    expect(written(cad, "U", "REDO", "MREDO", "1")).toEqual([
      "U",
      "LINE",
      "REDO",
      "LINE",
      "MREDO",
      `${ASK} 1`,
      "CIRCLE",
      "Everything has been redone",
    ])
    expect(written(cad, "REDO")).toEqual(["REDO", "Nothing to redo"])
  })

  it("after an undo that found nothing", () => {
    const cad = answer(createHarness(), ...LINE, "U", "U", "U")
    expect(written(cad, "MREDO", "L", "MREDO", "1")).toEqual([
      "MREDO",
      `${ASK} L`,
      "MREDO",
      `${ASK} 1`,
      "LINE",
      "Everything has been redone",
    ])
    const empty = answer(createHarness(), "U")
    expect(written(empty, "MREDO", "A").slice(-1)).toEqual([
      "Everything has been redone",
    ])

    const group = answer(createHarness(), ...THREE, "UNDO", "BE", "UNDO", "3")
    expect(written(group, "REDO", "MREDO", "L", "MREDO", "1")).toEqual([
      "REDO",
      "Nothing to redo",
      "MREDO",
      `${ASK} L`,
      "Nothing to redo",
      "MREDO",
      `${ASK} 1`,
      "Nothing to redo",
    ])
  })

  it("is not transparent", () => {
    const cad = answer(createHarness(), ...LINE, "U", "LINE", "0,0")
    expect(written(cad, "'MREDO")).toEqual([
      "Specify next point or [Undo]: 'MREDO",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  // acad.cuix: Ctrl+Y and the shortcut menu's Redo run `^C^C_mredo 1`.
  it("Ctrl+Y and the shortcut menu's Redo are MREDO 1", () => {
    const cad = undone()
    cad.press("y", { ctrlKey: true })
    expect(cad.commandLog().slice(-3)).toEqual(["MREDO", `${ASK} 1`, "LINE"])
    cad.runtime.chooseShortcutMenuAction("redo")
    expect(cad.commandLog().slice(-3)).toEqual(["MREDO", `${ASK} 1`, "CIRCLE"])
    expect(cad.entities()).toHaveLength(2)

    answer(cad, "LINE", "0,0", "5,5")
    cad.press("y", { ctrlKey: true })
    expect(cad.state().commandLine.prompt).toBe("Command:")
    expect(cad.commandLog().slice(-3)).toEqual([
      "MREDO",
      `${ASK} 1`,
      "Nothing to redo",
    ])
    expect(cad.entities()).toHaveLength(3)
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "", "CIRCULO", "5,5", "2", "H", "H")
    const ASK_ES = "Indique número de acciones o [Todas/úLtima]:"
    expect(written(cad, "MREHACER", "FOO", "L", "MREHACER", "L")).toEqual([
      "MREHACER",
      `${ASK_ES} FOO`,
      "Requiere un nº entero entre 1 y 32767 o una opción.",
      `${ASK_ES} L`,
      "LINEA",
      "MREHACER",
      `${ASK_ES} L`,
      "Ya se ha repetido la última operación DESHACER.",
    ])
    expect(written(cad, "MREHACER", "T", "MREHACER", "1")).toEqual([
      "MREHACER",
      `${ASK_ES} T`,
      "CIRCULO",
      "Todo repetido",
      "MREHACER",
      `${ASK_ES} 1`,
      "Nada que repetir",
    ])
  })
})
