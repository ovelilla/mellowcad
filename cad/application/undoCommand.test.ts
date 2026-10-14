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
const ASK =
  "Enter the number of operations to undo or [BEgin/End/Mark/Back] <1>:"
const SETTINGS =
  "Current settings: Auto = On, Control = All, Combine = Yes, Layer = Yes"
const REFUSED = "Requires an integer between 1 and 32767, or option keyword."
const GROUP_START =
  "Start of Group encountered.\nMust enter UNDO END to go back further."

// AutoCAD 2023's console (acc/w1–w16, x1–x15 of the hidden UCS words
// session).
describe("UNDO", () => {
  it("asks how many operations, and takes back that many", () => {
    const cad = answer(createHarness(), ...LINE)
    expect(written(cad, "UNDO")).toEqual(["UNDO", SETTINGS])
    expect(cad.state().commandLine.prompt).toBe(`UNDO ${ASK}`)
    expect(written(cad, "FOO", "0", "-1", "1.5", "A", "C", "99")).toEqual([
      `${ASK} FOO`,
      REFUSED,
      `${ASK} 0`,
      REFUSED,
      `${ASK} -1`,
      REFUSED,
      `${ASK} 1.5`,
      REFUSED,
      `${ASK} A`,
      REFUSED,
      `${ASK} C`,
      REFUSED,
      `${ASK} 99`,
      "LINE",
      "Everything has been undone",
    ])

    const two = answer(createHarness(), ...LINE, ...CIRCLE)
    expect(written(two, "UNDO", "5", "REDO")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} 5`,
      "CIRCLE LINE",
      "Everything has been undone",
      "REDO",
      "LINE CIRCLE",
      "Everything has been redone",
    ])
    expect(written(two, "UNDO", "", "U")).toEqual([
      "UNDO",
      SETTINGS,
      ASK,
      "CIRCLE",
      "U",
      "LINE",
    ])

    const exact = answer(createHarness(), ...LINE, ...CIRCLE, "UNDO", "2")
    expect(exact.commandLog().slice(-1)).toEqual(["CIRCLE LINE"])
    expect(written(exact, "U", "REDO")).toEqual([
      "U",
      "Everything has been undone",
      "REDO",
      "REDO must immediately follow the U or UNDO command.",
    ])
  })

  it("Mark stops Back, U and a number, and goes once met", () => {
    const cad = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    answer(cad, "UNDO", "M", ...ARC)
    expect(written(cad, "UNDO", "B")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} B`,
      "ARC",
      "Mark encountered",
    ])
    expect(written(cad, "UNDO", "B").slice(-2)).toEqual([
      "CIRCLE",
      "Mark encountered",
    ])
    expect(written(cad, "UNDO", "B", "Y").slice(-3)).toEqual([
      "This will undo everything. OK? <Y> Y",
      "LINE",
      "Everything has been undone",
    ])

    const u = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    expect(written(u, "U", "U", "U")).toEqual([
      "U",
      "CIRCLE",
      "U",
      "Mark encountered",
      "U",
      "LINE",
    ])

    const count = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    expect(written(count, "UNDO", "2", "REDO").slice(-5)).toEqual([
      "CIRCLE",
      "Mark encountered",
      "REDO",
      "CIRCLE",
      "Everything has been redone",
    ])

    const back = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    answer(back, ...ARC)
    expect(written(back, "UNDO", "B", "REDO").slice(-5)).toEqual([
      "ARC CIRCLE",
      "Mark encountered",
      "REDO",
      "CIRCLE ARC",
      "Everything has been redone",
    ])
    expect(back.entities()).toHaveLength(3)
  })

  it("REDO puts a mark back, saying nothing of it", () => {
    const cad = answer(createHarness(), ...LINE, "UNDO", "M", ...CIRCLE)
    expect(written(cad, "U", "U", "REDO", "REDO")).toEqual([
      "U",
      "CIRCLE",
      "U",
      "Mark encountered",
      "REDO",
      "REDO",
      "REDO must immediately follow the U or UNDO command.",
    ])

    const twice = answer(createHarness(), ...LINE, "UNDO", "M", "UNDO", "M")
    answer(twice, ...CIRCLE, "UNDO", "B")
    expect(written(twice, "UNDO", "B").slice(-1)).toEqual(["Mark encountered"])

    const alone = answer(createHarness(), "UNDO", "M")
    expect(written(alone, "UNDO", "B", "REDO", "U")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} B`,
      "Mark encountered",
      "REDO",
      "Everything has been redone",
      "U",
      "Mark encountered",
    ])
  })

  it("Back with no mark asks before taking back everything", () => {
    const cad = answer(createHarness(), "UNDO", "B")
    expect(cad.state().commandLine.prompt).toBe(
      "UNDO This will undo everything. OK? <Y>"
    )
    answer(cad, "Y")
    expect(cad.commandLog().slice(-2)).toEqual([
      "This will undo everything. OK? <Y> Y",
      "Everything has been undone",
    ])
    answer(cad, ...LINE)
    expect(written(cad, "UNDO", "B", "N")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} B`,
      "This will undo everything. OK? <Y> N",
    ])
    expect(cad.entities()).toHaveLength(1)
    expect(written(cad, "UNDO", "B", "FOO", "", "U")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} B`,
      "This will undo everything. OK? <Y> FOO",
      "Yes or No, please.",
      "This will undo everything. OK? <Y>",
      "LINE",
      "Everything has been undone",
      "U",
      "Nothing to undo",
    ])

    const two = answer(createHarness(), ...LINE, ...CIRCLE, "UNDO", "B", "")
    expect(two.commandLog().slice(-2)).toEqual([
      "CIRCLE LINE",
      "Everything has been undone",
    ])
    expect(written(two, "REDO")).toEqual([
      "REDO",
      "LINE CIRCLE",
      "Everything has been redone",
    ])
  })

  it("BEgin and End make one step of what runs between them", () => {
    const cad = answer(createHarness(), "UNDO", "BE", ...LINE, ...CIRCLE)
    answer(cad, "UNDO", "E")
    expect(written(cad, "UNDO", "1", "REDO", "U")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} 1`,
      "GROUP CIRCLE LINE",
      "REDO",
      "GROUP LINE CIRCLE",
      "Everything has been redone",
      "U",
      "GROUP CIRCLE LINE",
    ])
    expect(cad.entities()).toHaveLength(0)

    const two = answer(createHarness(), "UNDO", "BE", ...LINE, ...CIRCLE)
    answer(two, "UNDO", "E", "UNDO", "G", ...ARC, "UNDO", "END")
    expect(written(two, "U", "U", "REDO")).toEqual([
      "U",
      "GROUP ARC",
      "U",
      "GROUP CIRCLE LINE",
      "REDO",
      "GROUP LINE CIRCLE",
    ])
  })

  it("stops at an open group's start, and takes back an empty one", () => {
    const cad = answer(createHarness(), "UNDO", "BE", ...LINE, ...CIRCLE)
    expect(written(cad, "U", "U", "U", "UNDO", "1")).toEqual([
      "U",
      "CIRCLE",
      "U",
      "LINE",
      "U",
      GROUP_START,
      "UNDO",
      SETTINGS,
      `${ASK} 1`,
      GROUP_START,
    ])
    answer(cad, "UNDO", "E")
    expect(written(cad, "U")).toEqual(["U", "GROUP"])

    const back = answer(createHarness(), ...LINE, "UNDO", "BE", ...CIRCLE)
    expect(written(back, "UNDO", "B").slice(-2)).toEqual([
      "CIRCLE",
      GROUP_START,
    ])
    expect(back.entities()).toHaveLength(1)

    const marked = answer(createHarness(), "UNDO", "BE", ...LINE, "UNDO", "M")
    answer(marked, ...CIRCLE, "UNDO", "E", "UNDO", "B")
    expect(marked.state().commandLine.prompt).toBe(
      "UNDO This will undo everything. OK? <Y>"
    )
    expect(written(marked, "Y").slice(-2)).toEqual([
      "GROUP CIRCLE LINE",
      "Everything has been undone",
    ])

    const alone = answer(createHarness(), ...LINE)
    expect(written(alone, "UNDO", "E", "U")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} E`,
      "U",
      "LINE",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "", "DESHACER", "M")
    answer(cad, "CIRCULO", "5,5", "2", "DESHACER", "I", "LINEA", "0,0", "5,0")
    answer(cad, "", "DESHACER", "F")
    const ASK_ES =
      "Indique el número de operaciones a deshacer o [Inicio/Fin/Marca/Retorno] <1>:"
    expect(written(cad, "DESHACER", "FOO", "R", "DESHACER", "R")).toEqual([
      "DESHACER",
      "Parámetros actuales: Auto = Act, Control = Todos, Combinar = Sí, Capa = Sí",
      `${ASK_ES} FOO`,
      "Requiere un nº entero entre 1 y 32767 o una opción.",
      `${ASK_ES} R`,
      "GRUPO LINEA CIRCULO",
      "Marca encontrada",
      "DESHACER",
      "Parámetros actuales: Auto = Act, Control = Todos, Combinar = Sí, Capa = Sí",
      `${ASK_ES} R`,
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "DESHACER Esto lo deshará todo. ¿De acuerdo? <S>"
    )
  })
})
