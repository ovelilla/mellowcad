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
  "Enter the number of operations to undo or [Auto/Control/BEgin/End/Mark/Back] <1>:"
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
    expect(written(cad, "FOO", "0", "-1", "1.5", "X", "99")).toEqual([
      `${ASK} FOO`,
      REFUSED,
      `${ASK} 0`,
      REFUSED,
      `${ASK} -1`,
      REFUSED,
      `${ASK} 1.5`,
      REFUSED,
      `${ASK} X`,
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
      "Indique el número de operaciones a deshacer o [Auto/Control/Inicio/Fin/Marca/Retorno] <1>:"
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

const CONTROL =
  "Enter an UNDO control option [All/None/One/Combine/Layer] <All>:"
const ONE = "Enter an option [Control] <1>:"
const COMBINE = "Combine zoom and pan operations? [Yes/No] <Yes>:"
const LAYER = "Combine layer dialog operations? [Yes/No] <Yes>:"
const AUTO = "Enter UNDO Auto mode [ON/OFF]"
const settings = (
  auto: string,
  control: string,
  combine = "Yes",
  layer = "Yes"
) =>
  `Current settings: Auto = ${auto}, Control = ${control}, Combine = ${combine}, Layer = ${layer}`

// AutoCAD 2023's console (acc/k1–k16, h1–h44 of the -PAN session).
describe("UNDO Control and Auto", () => {
  it("None keeps nothing, and U, REDO and MREDO say so", () => {
    const cad = answer(createHarness(), ...LINE)
    expect(written(cad, "UNDO", "C", "N")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} C`,
      `${CONTROL} N`,
    ])
    expect(written(cad, "UNDO")).toEqual(["UNDO", settings("Off", "None")])
    expect(cad.state().commandLine.prompt).toBe(`UNDO ${CONTROL}`)
    expect(written(cad, "AU", "BE", "")).toEqual([
      `${CONTROL} AU`,
      "Invalid option keyword.",
      `${CONTROL} BE`,
      "Invalid option keyword.",
      CONTROL,
    ])
    expect(written(cad, "UNDO", "")).toEqual([
      "UNDO",
      SETTINGS,
      ASK,
      "Nothing to undo",
    ])
    expect(cad.entities()).toHaveLength(1)

    const off = answer(createHarness(), ...LINE, "UNDO", "C", "N")
    expect(written(off, "U", "REDO", "MREDO")).toEqual([
      "U",
      "U command disabled.  Use UNDO command to turn it on",
      "REDO",
      "REDO command disabled. Use UNDO C to turn it on.",
      "MREDO",
      "REDO and MREDO commands disabled. Use UNDO C to turn it on.",
    ])
    expect(off.entities()).toHaveLength(1)
    expect(off.state().commandLine.prompt).toBe("Command:")

    // A command's own Undo steps its prompt back and leaves what it drew.
    answer(off, "L", "0,0", "10,0", "20,0", "U")
    expect(off.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
    answer(off, "")
    expect(off.entities()).toHaveLength(3)

    const back = answer(createHarness(), ...LINE, "UNDO", "C", "N")
    answer(back, "UNDO", "A", ...CIRCLE)
    expect(written(back, "U", "U")).toEqual([
      "U",
      "CIRCLE",
      "Everything has been undone",
      "U",
      "Nothing to undo",
    ])
    expect(back.entities()).toHaveLength(1)
  })

  it("One keeps the last step, and asks only Control", () => {
    const cad = answer(createHarness(), "UNDO", "C", "O", ...LINE, ...CIRCLE)
    expect(written(cad, "U", "U", "REDO", "U", "U")).toEqual([
      "U",
      "CIRCLE",
      "Everything has been undone",
      "U",
      "Nothing to undo",
      "REDO",
      "CIRCLE",
      "Everything has been redone",
      "U",
      "CIRCLE",
      "Everything has been undone",
      "U",
      "Nothing to undo",
    ])
    expect(cad.entities()).toHaveLength(1)

    const asked = answer(createHarness(), "UNDO", "C", "O", ...LINE, ...CIRCLE)
    expect(written(asked, "UNDO", "2", "M", "A", "")).toEqual([
      "UNDO",
      settings("Off", "One"),
      `${ONE} 2`,
      "Requires an integer value 1, or option keyword.",
      `${ONE} M`,
      "Requires an integer value 1, or option keyword.",
      `${ONE} A`,
      "Requires an integer value 1, or option keyword.",
      ONE,
      "CIRCLE",
      "Everything has been undone",
    ])

    // Setting it drops what was kept; All then keeps what One kept.
    const kept = answer(createHarness(), ...LINE, "UNDO", "C", "O")
    expect(written(kept, "UNDO", "")).toEqual([
      "UNDO",
      settings("Off", "One"),
      ONE,
      "Nothing to undo",
    ])
    answer(kept, ...CIRCLE, "UNDO", "C", "A", ...ARC)
    expect(written(kept, "U", "U", "UNDO", "")).toEqual([
      "U",
      "ARC",
      "U",
      "CIRCLE",
      "Everything has been undone",
      "UNDO",
      SETTINGS,
      ASK,
      "Nothing to undo",
    ])

    // A command's own Undo still steps back inside it.
    const line = answer(createHarness(), "UNDO", "C", "O")
    answer(line, "L", "0,0", "10,0", "20,0", "U", "")
    expect(line.entities()).toHaveLength(1)
  })

  it("One and Combine No leave consecutive ZOOMs apart", () => {
    const one = answer(createHarness(), "UNDO", "C", "O", ...LINE)
    const before = one.runtime.viewport.getCamera()
    answer(one, "ZOOM", "2X")
    const after = one.runtime.viewport.getCamera()
    answer(one, "ZOOM", "2X")
    expect(written(one, "U")).toEqual([
      "U",
      "ZOOM",
      "Everything has been undone",
    ])
    expect(one.runtime.viewport.getCamera()).toEqual(after)
    expect(after).not.toEqual(before)

    const apart = answer(createHarness(), ...LINE)
    expect(written(apart, "UNDO", "C", "C", "N")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} C`,
      `${CONTROL} C`,
      `${COMBINE} N`,
    ])
    answer(apart, "ZOOM", "2X", "ZOOM", "2X")
    expect(written(apart, "U", "U", "U")).toEqual([
      "U",
      "ZOOM",
      "U",
      "ZOOM",
      "U",
      "LINE",
    ])
    expect(written(apart, "UNDO", "C", "C", "FOO", "")).toEqual([
      "UNDO",
      settings("On", "All", "No"),
      `${ASK} C`,
      `${CONTROL} C`,
      `${COMBINE} FOO`,
      "Yes or No, please.",
      COMBINE,
    ])
    expect(written(apart, "UNDO", "C", "L", "C", "N")).toEqual([
      "UNDO",
      SETTINGS,
      `${ASK} C`,
      `${CONTROL} L`,
      `${LAYER} C`,
      "Yes or No, please.",
      `${LAYER} N`,
    ])
    expect(written(apart, "UNDO").slice(-1)).toEqual([
      settings("On", "All", "Yes", "No"),
    ])
  })

  it("Auto is asked with its setting, and All turns it on", () => {
    const cad = answer(createHarness(), "UNDO", "A")
    expect(cad.state().commandLine.prompt).toBe(`UNDO ${AUTO} <On>:`)
    expect(written(cad, "FOO", "OFF")).toEqual([
      `${AUTO} <On>: FOO`,
      "Invalid option keyword.",
      `${AUTO} <On>: OFF`,
    ])
    expect(written(cad, "UNDO", "A", "")).toEqual([
      "UNDO",
      settings("Off", "All"),
      `${ASK} A`,
      `${AUTO} <Off>:`,
    ])
    expect(written(cad, "UNDO", "C", "", "UNDO").slice(-1)).toEqual([SETTINGS])
  })

  it("BEgin with a group open leaves a step U takes back silently", () => {
    const cad = answer(createHarness(), "UNDO", "BE", ...LINE, "UNDO", "BE")
    answer(cad, ...CIRCLE, "UNDO", "E")
    expect(written(cad, "U", "U", "REDO", "U", "U")).toEqual([
      "U",
      "GROUP CIRCLE",
      "U",
      "REDO",
      "U",
      "U",
      "GROUP LINE",
    ])

    const count = answer(createHarness(), "UNDO", "BE", ...LINE, "UNDO", "BE")
    answer(count, ...CIRCLE, "UNDO", "E")
    expect(written(count, "UNDO", "3").slice(-1)).toEqual([
      "GROUP CIRCLE GROUP LINE",
    ])

    const empty = answer(createHarness(), ...LINE, "UNDO", "BE", "UNDO", "BE")
    answer(empty, ...CIRCLE, "UNDO", "E")
    expect(written(empty, "U", "U", "U", "U")).toEqual([
      "U",
      "GROUP CIRCLE",
      "U",
      "U",
      "GROUP",
      "U",
      "LINE",
    ])
  })

  it("asks Control and Auto in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0", "10,0", "")
    const ASK_ES =
      "Indique el número de operaciones a deshacer o [Auto/Control/Inicio/Fin/Marca/Retorno] <1>:"
    const CONTROL_ES =
      "Indique una opción de control DESHACER [Todas/Ninguna/Una/Combinar/CApa] <Todas>:"
    const COMBINE_ES = "¿Combinar operaciones de zoom y encuadre? [Sí/No] <Sí>:"
    expect(written(cad, "DESHACER", "C", "C", "FOO", "N")).toEqual([
      "DESHACER",
      "Parámetros actuales: Auto = Act, Control = Todos, Combinar = Sí, Capa = Sí",
      `${ASK_ES} C`,
      `${CONTROL_ES} C`,
      `${COMBINE_ES} FOO`,
      "Sí o No.",
      `${COMBINE_ES} N`,
    ])
    expect(written(cad, "DESHACER", "A").slice(-1)).toEqual([`${ASK_ES} A`])
    expect(cad.state().commandLine.prompt).toBe(
      "DESHACER Indique modo automático de DESHACER [ACT/DES] <ACT>:"
    )
    answer(cad, "", "DESHACER", "C", "CA", "N", "DESHACER", "C", "U")
    expect(
      written(cad, "DESHACER", "2", "C", "N", "H", "REHACER", "MREHACER")
    ).toEqual([
      "DESHACER",
      "Parámetros actuales: Auto = Des, Control = Uno, Combinar = No, Capa = No",
      "Indique una opción [Control] <1>: 2",
      "Requiere un valor 1 entero o una opción.",
      "Indique una opción [Control] <1>: C",
      `${CONTROL_ES} N`,
      "H",
      "Comando H desactivado. Utilice el comando DESHACER para activarlo",
      "REHACER",
      "Comando REHACER desactivado. Usar DESHACER C para activarlo.",
      "MREHACER",
      "Comandos REHACER y MREHACER desactivados. Usar DESHACER C para activarlo.",
    ])
    expect(written(cad, "DESHACER")).toEqual([
      "DESHACER",
      "Parámetros actuales: Auto = Des, Control = Ninguna, Combinar = No, Capa = No",
    ])
  })
})
