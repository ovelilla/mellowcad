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

// U names what it took back, REDO what it did again: probes line/p41,
// line/p108, line/p110 (en and es).
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
      "Enter the number of operations to undo or [Auto/Control/BEgin/End/Mark/Back] <1>:",
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

  it("names a command started from the rail as the ribbon's macro runs it", () => {
    // probe circle/p159: the ribbon's `_circle` macros undo as CIRCLE (es
    // CIRCULO); LINE's button, `^C^C_line`, as LINE.
    for (const [locale, u, circle, line] of [
      [undefined, "U", "CIRCLE", "LINE"],
      [es, "H", "CIRCULO", "LINEA"],
    ] as const) {
      const cad = createHarness(locale ? { locale } : {})
      cad.tool("line")
      answer(cad, "0,0", "10,0", "")
      cad.tool("circle2p")
      answer(cad, "0,0", "10,0")
      expect(written(cad, "_U", "_U")).toEqual([u, circle, u, line])
    }
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

    // acc/n19 of the MREDO session: with more left, on the names' line.
    const before = answer(createHarness(), "LTSCALE", "2", ...LINE, "U", "U")
    expect(written(before, "REDO", "REDO")).toEqual([
      "REDO",
      "LTSCALE Regenerating model.",
      "REDO",
      "REDO must immediately follow the U or UNDO command.",
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

  // desktop line/d09: with no ^C^C in `_u`, the running prompt takes it as
  // typed, LINE's Undo keyword or a wrong point, and the command goes on.
  it("Ctrl+Z inside a command answers its prompt with _u", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(10, 0))],
    })
    cad.command("LINEA").click(p(0, 40)).click(p(20, 40)).click(p(20, 50))
    const ctrlZ = () => {
      const question = cad
        .state()
        .commandLine.question?.map((span) => span.text)
        .join("")
      const from = cad.commandLog().length
      cad.press("z", { ctrlKey: true })
      expect(cad.commandLog()[from]).toBe(`${question} _u`)
      expect(cad.activeToolId()).toBe("line")
      return cad.commandLog().slice(from)
    }
    expect(ctrlZ()[0]).toMatch(/\[Cerrar\/desHacer\]: _u$/)
    expect(cad.entities()).toHaveLength(2)
    ctrlZ()
    expect(cad.entities()).toHaveLength(1)
    ctrlZ()
    expect(ctrlZ()).toEqual(["Precise primer punto: _u", "Punto no válido."])
    expect(cad.entities()).toHaveLength(1)
  })

  // probe line/p115: `_U` at Length of line: is refused there.
  it("Ctrl+Z at Length of line is refused, and LINE goes on", () => {
    const cad = answer(createHarness(), "ARC", "0,0", "50,50", "100,0")
    answer(cad, "LINE", "")
    cad.press("z", { ctrlKey: true })
    expect(cad.commandLog().slice(-2)).toEqual([
      "Length of line: _u",
      "Requires numeric distance or second point.",
    ])
    expect(cad.activeToolId()).toBe("line")
    expect(cad.entities()).toHaveLength(1)
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
      // probe line/p41 (es)
      "No hay nada que se pueda deshacer",
      "REHACER",
      "REHACER debe ir directamente a continuación del comando H o DESHACER.",
    ])
    expect(written(cad, "DESHACER", "").slice(-1)).toEqual([
      "No hay nada que se pueda deshacer",
    ])
  })
})
