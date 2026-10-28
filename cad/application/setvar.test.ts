import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { createBlockDefinition, type LineEntity } from "../domain/entities"
import { ar } from "../locales/ar"
import { es } from "../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's console reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What `texts` wrote in the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const prompt = (cad: CadHarness) => cad.state().commandLine.prompt
const settings = (cad: CadHarness) => cad.runtime.document.getSettings()

// AutoCAD 2027's console, en-US and es-ES (probes workspace/p100–p169,
// p203–p222, p410–p415). The harness's drawing writes lengths at 2 places,
// AutoCAD's template at 4.
describe("SETVAR asks a variable's name, then its value", () => {
  // probes workspace/p101 (untraced rerun), p169: no default at first
  it("asks the name, then the value, in both languages", () => {
    for (const [locale, setvar, name, value] of [
      [
        undefined,
        "SETVAR",
        "SETVAR Enter variable name or [?]:",
        "Enter new value for ORTHOMODE <0>: 1",
      ],
      [
        es,
        "MODIVAR",
        "MODIVAR Indique nombre de variable o [?]:",
        "Indique nuevo valor para ORTHOMODE <0>: 1",
      ],
    ] as const) {
      const cad = createHarness({ locale })
      answer(cad, setvar)
      expect(prompt(cad)).toBe(name)
      expect(written(cad, "orthomode", "1")).toEqual([
        `${name.slice(setvar.length + 1)} orthomode`,
        value,
      ])
      expect(settings(cad).orthoMode).toBe(true)
    }
  })

  // probes workspace/p105 (en SET, es MV), p413 (es _SET is unknown)
  it("runs as SET in English and MV in Spanish", () => {
    expect(prompt(answer(createHarness(), "SET"))).toBe(
      "SETVAR Enter variable name or [?]:"
    )
    expect(prompt(answer(createHarness({ locale: es }), "MV"))).toBe(
      "MODIVAR Indique nombre de variable o [?]:"
    )
    expect(written(createHarness({ locale: es }), "_SET")).toEqual([
      'Comando "SET" desconocido. Pulse F1 para obtener ayuda.',
    ])
  })

  // probes workspace/p169 (Enter ends with no default), p148 (bare
  // ORTHOMODE names it), p162 (es AUPREC), p107 (Enter repeats SETVAR)
  it("offers the last variable named or typed, none at first", () => {
    const cad = createHarness()
    expect(written(cad, "SETVAR", "")).toEqual([
      "SETVAR",
      "Enter variable name or [?]:",
    ])
    expect(cad.activeToolId()).toBe("select")
    answer(cad, "ORTHOMODE", "1", "SETVAR")
    expect(prompt(cad)).toBe("SETVAR Enter variable name or [?] <ORTHOMODE>:")
    expect(written(cad, "", "0", "")).toEqual([
      "Enter variable name or [?] <ORTHOMODE>:",
      "Enter new value for ORTHOMODE <1>: 0",
      "SETVAR",
    ])
    const spanish = answer(createHarness({ locale: es }), "AUPREC", "2")
    answer(spanish, "MODIVAR")
    expect(prompt(spanish)).toBe(
      "MODIVAR Indique nombre de variable o [?] <AUPREC>:"
    )
  })

  // probes workspace/p100 (`_ORTHOMODE`, global names only), p103, p122,
  // p124: an unknown name ends SETVAR
  it("ends on an unknown name, in Autodesk's words", () => {
    for (const [locale, setvar, unknown] of [
      [
        undefined,
        "SETVAR",
        "Unknown variable name.  Type SETVAR ? for a list of variables.",
      ],
      [
        es,
        "MODIVAR",
        "Nombre de variable desconocido. Teclee MODIVAR ?\npara ver la lista de variables.",
      ],
    ] as const) {
      const cad = createHarness({ locale })
      expect(written(cad, setvar, "_ORTHOMODE").at(-1)).toBe(unknown)
      expect(cad.activeToolId()).toBe("select")
      expect(written(cad, setvar, "ELEV").at(-1)).toBe(unknown)
    }
  })

  // probes workspace/p114, p123 (es 'MODIVAR): transparently, `>>` prompts
  it("runs inside a command typed with an apostrophe", () => {
    for (const [locale, line, setvar, resuming] of [
      [undefined, "LINE", "'_SETVAR", "Resuming LINE command."],
      [es, "LINEA", "'MODIVAR", "Reanudando el comando LINEA."],
    ] as const) {
      const cad = createHarness({ locale })
      answer(cad, line, "0,0", setvar)
      const asked = written(cad, "ORTHOMODE", "1")
      expect(asked[0]).toMatch(/^>>.* \[\?\]: ORTHOMODE$/)
      expect(asked[1]).toMatch(/^>>.* ORTHOMODE <0>: 1$/)
      expect(asked[2]).toBe(resuming)
      expect(cad.activeToolId()).toBe("line")
    }
  })

  // probe workspace/p161: LASTPOINT is kept, the preselection dropped
  // (the console's; the desktop's is WSD's)
  it("keeps LASTPOINT and drops a preselection", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L" })],
    })
    answer(cad, "LINE", "0,0", "10,0", "")
    cad.select("L")
    answer(cad, "AUPREC", "2")
    expect(cad.selectedIds()).toEqual([])
    // `ID @` says where LASTPOINT is.
    expect(written(cad, "ID", "@").at(-1)).toBe(
      " X = 10.00     Y = 0.00     Z = 0.00"
    )
  })

  // probe workspace/p143 (SETVAR AREA), p158 (a step U names SETVAR)
  it("reads a read-only variable and ends, a step U names", () => {
    const cad = createHarness()
    expect(written(cad, "SETVAR", "AREA")).toEqual([
      "SETVAR",
      "Enter variable name or [?]: AREA",
      "AREA = 0.00 (read only)",
    ])
    expect(written(cad, "U")).toEqual(["U", "SETVAR"])
  })

  // probes workspace/p125 (ORTHO*), p126 (A*: the columns, `(read only)`,
  // the newer variables after the older)
  it("lists the variables a wild card matches, read-only ones marked", () => {
    const cad = createHarness()
    expect(written(cad, "SETVAR", "?", "ORTHO*")).toEqual([
      "SETVAR",
      "Enter variable name or [?]: ?",
      "Enter variable(s) to list <*>: ORTHO*",
      "ORTHOMODE         0",
    ])
    const lines = written(cad, "SETVAR", "?", "A*").at(-1)?.split("\n")
    expect(lines).toEqual([
      "AFLAGS            16",
      "AREA              0.00                                 (read only)",
      "ATTMODE           1",
      "AUPREC            0",
      "ARRAYASSOCIATIVITY 1",
    ])
    const spanish = createHarness({ locale: es })
    answer(spanish, "MODIVAR", "?", "")
    const listed = spanish.commandLog().at(-1)?.split("\n") ?? []
    expect(listed).toContain('CLAYER            "0"')
    expect(listed).toContain('CECOLOR           "PORCAPA"')
    expect(listed).toContain("LWDISPLAY         ACT")
    expect(listed).toContain(
      "UNDOCTL           53                                   (sólo lectura)"
    )
  })
})

describe("a system variable typed by its name runs SETVAR for it", () => {
  // probes workspace/p108 (bare), p109 (_), p110 (.), p111 (')
  it("asks its value at the Command prompt in every form", () => {
    for (const [form, echo] of [
      ["ORTHOMODE", "ORTHOMODE"],
      ["_ORTHOMODE", "ORTHOMODE"],
      [".ORTHOMODE", "ORTHOMODE"],
      ["'ORTHOMODE", "'ORTHOMODE"],
    ]) {
      const cad = createHarness()
      expect(written(cad, form)).toEqual([echo])
      expect(prompt(cad)).toBe("ORTHOMODE Enter new value for ORTHOMODE <0>:")
    }
  })

  // probes workspace/p112, p113 (LINE), es p114 (`Reanudando el comando LINEA.`)
  it("runs inside a command typed with an apostrophe", () => {
    for (const [locale, line, resuming] of [
      [undefined, "LINE", "Resuming LINE command."],
      [es, "LINEA", "Reanudando el comando LINEA."],
    ] as const) {
      const cad = createHarness({ locale })
      answer(cad, line, "0,0", "'_ORTHOMODE")
      const asked = written(cad, "1")
      expect(asked[0]).toMatch(/^>>.* ORTHOMODE <0>: 1$/)
      expect(asked[1]).toBe(resuming)
      expect(settings(cad).orthoMode).toBe(true)
      expect(cad.activeToolId()).toBe("line")
    }
  })

  // probes workspace/p164 ('LTSCALE: a transparent command wins), p165
  // (FILL the command, FILLMODE the variable), p136 (ELEVATION)
  it("gives way to a command of its name", () => {
    const cad = createHarness()
    answer(cad, "'_LTSCALE")
    expect(prompt(cad)).toBe(
      "LTSCALE Enter new linetype scale factor <1.0000>:"
    )
    cad.escape()
    answer(cad, "FILL")
    expect(prompt(cad)).toBe("FILL Enter mode [ON/OFF] <ON>:")
    cad.escape()
    answer(cad, "_FILLMODE")
    expect(prompt(cad)).toBe("FILLMODE Enter new value for FILLMODE <1>:")
    cad.escape()
    answer(cad, "ELEVATION")
    expect(prompt(cad)).toBe("ELEVATION Enter new value for ELEVATION <0.00>:")
  })

  // probe workspace/p169: Enter repeats it, echoed by its name
  it("is repeated by Enter", () => {
    const cad = answer(createHarness(), "ORTHOMODE", "1")
    expect(written(cad, "")).toEqual(["ORTHOMODE"])
    expect(prompt(cad)).toBe("ORTHOMODE Enter new value for ORTHOMODE <1>:")
  })

  // probe workspace/p207: the read-only ones answer on one line
  it("reads a read-only one on a line of its own", () => {
    const cad = createHarness()
    for (const [name, line] of [
      ["PERIMETER", "PERIMETER = 0.00 (read only)"],
      ["DISTANCE", "DISTANCE = 0.00 (read only)"],
      ["UCSNAME", 'UCSNAME = "" (read only)'],
      ["UCSORG", "UCSORG = 0.00,0.00,0.00 (read only)"],
      ["UCSXDIR", "UCSXDIR = 1.00,0.00,0.00 (read only)"],
      ["UNDOCTL", "UNDOCTL = 53 (read only)"],
      ["CLEANSCREENSTATE", "CLEANSCREENSTATE = 0 (read only)"],
    ]) {
      expect(written(cad, `_${name}`)).toEqual([name, line])
    }
    answer(cad, "AREA", "0,0", "3,0", "3,4", "", "DIST", "0,0", "6,8")
    answer(cad, "UCS", "_O", "1,2")
    expect(written(cad, "PERIMETER", "DISTANCE", "UCSORG").slice(1, 6)).toEqual(
      [
        "PERIMETER = 12.00 (read only)",
        "DISTANCE",
        "DISTANCE = 10.00 (read only)",
        "UCSORG",
        "UCSORG = 1.00,2.00,0.00 (read only)",
      ]
    )
    expect(cad.activeToolId()).toBe("select")
    cad.runtime.setCleanScreen(true)
    expect(written(cad, "CLEANSCREENSTATE").at(-1)).toBe(
      "CLEANSCREENSTATE = 1 (read only)"
    )
  })
})

describe("the value prompt asks and refuses by the variable's type", () => {
  // probes workspace/p128, p146 (a switch: `~`, `*`, `.`), p121 (_LINE)
  it("refuses what no switch is and asks again", () => {
    for (const [locale, refusal] of [
      [undefined, "Requires 0 or 1 only."],
      [es, "Requiere 0 o sólo 1."],
    ] as const) {
      const cad = createHarness({ locale })
      answer(cad, "ORTHOMODE")
      const lines = written(cad, "2", "~", "*", ".", "_LINE", "1")
      expect(lines.filter((line) => line === refusal)).toHaveLength(5)
      expect(settings(cad).orthoMode).toBe(true)
      expect(cad.activeToolId()).toBe("select")
    }
  })

  // probes workspace/p132, p133 (AUPREC, es with its period), p213
  // (NAVVCUBEDISPLAY 4, INSUNITS 25)
  it("refuses an integer out of its range", () => {
    const cad = createHarness({ locale: es })
    expect(written(cad, "AUPREC", "-1", "FOO", "1.5", "9", "")).toEqual([
      "AUPREC",
      "Indique nuevo valor para AUPREC <0>: -1",
      "Requiere un nº entero entre 0 y 8.",
      "Indique nuevo valor para AUPREC <0>: FOO",
      "Requiere un nº entero entre 0 y 8.",
      "Indique nuevo valor para AUPREC <0>: 1.5",
      "Requiere un nº entero entre 0 y 8.",
      "Indique nuevo valor para AUPREC <0>: 9",
      "Requiere un nº entero entre 0 y 8.",
      "Indique nuevo valor para AUPREC <0>:",
    ])
    // An Arabic interface asks in English, its command language.
    const english = createHarness({ locale: ar })
    expect(written(english, "NAVVCUBEDISPLAY", "4").at(-1)).toBe(
      "Requires an integer between 0 and 3."
    )
    english.escape()
    expect(written(english, "INSUNITS", "25").at(-1)).toBe(
      "Requires an integer between 0 and 24."
    )
  })

  // probes workspace/p135 (ELEVATION: FOO, a negative), p211 (FILLETRAD -1
  // ends SETVAR), p134 (es words)
  it("asks a distance, and ends on one the variable refuses", () => {
    for (const [locale, distance, cannot, invalid] of [
      [
        undefined,
        "Requires numeric distance or two points.",
        "Cannot set FILLETRAD to that value.",
        "*Invalid*",
      ],
      [
        es,
        "Requiere una distancia numérica o dos puntos.",
        "Imposible dar a FILLETRAD ese valor.",
        "*No válido*",
      ],
    ] as const) {
      const cad = createHarness({ locale })
      expect(written(cad, "ELEVATION", "FOO", "-3")[2]).toBe(distance)
      expect(settings(cad).elevation).toBe(-3)
      expect(written(cad, "FILLETRAD", "-1").slice(-2)).toEqual([
        cannot,
        invalid,
      ])
      expect(cad.activeToolId()).toBe("select")
      expect(settings(cad).filletRadius).toBe(0)
    }
  })

  // probes workspace/p137, p138 (CLAYER: quoted, FOO ends), p216
  // (case-blind)
  it("asks a string, quoted, and ends on one the variable refuses", () => {
    const cad = createHarness()
    cad.runtime.createLayer("Walls")
    answer(cad, "CLAYER")
    expect(prompt(cad)).toBe('CLAYER Enter new value for CLAYER <"Walls">:')
    expect(written(cad, "FOO")).toEqual([
      'Enter new value for CLAYER <"Walls">: FOO',
      "Cannot set CLAYER to that value.",
      "*Invalid*",
    ])
    answer(cad, "CLAYER", "0")
    expect(written(cad, "CLAYER", "walls")).toEqual([
      "CLAYER",
      'Enter new value for CLAYER <"0">: walls',
    ])
    const layer = cad.runtime.document.getCurrentLayerId()
    expect(cad.runtime.document.getLayer(layer)?.name).toBe("Walls")
    answer(cad, "TEXTSTYLE")
    expect(written(cad, "standard")).toEqual([
      'Enter new value for TEXTSTYLE <"Standard">: standard',
    ])
  })

  // probes workspace/p141 (SNAPUNIT: FOO, 3,4), p212 (0,0 and -5,5)
  it("asks a point and refuses one the variable does not take", () => {
    for (const [locale, invalid] of [
      [undefined, "Invalid 2D point."],
      [es, "Punto 2D no válido."],
    ] as const) {
      const cad = createHarness({ locale })
      const lines = written(cad, "SNAPUNIT", "FOO", "3,4")
      expect(lines[1]).toMatch(/SNAPUNIT <10.00,10.00>: FOO$/)
      expect(lines[2]).toBe(invalid)
      expect(settings(cad).snapUnit).toEqual({ x: 3, y: 4 })
    }
    const cad = createHarness()
    for (const point of ["0,0", "-5,5"]) {
      expect(written(cad, "SNAPUNIT", point).at(-2)).toBe(
        "Cannot set SNAPUNIT to that value."
      )
    }
  })

  // probes workspace/p203, p213: LWDISPLAY's keywords, es ACT / DES
  it("takes a switch's keywords and shows its value by them", () => {
    const cad = createHarness()
    expect(written(cad, "LWDISPLAY", "OFF")).toEqual([
      "LWDISPLAY",
      "Enter new value for LWDISPLAY <ON>: OFF",
    ])
    expect(settings(cad).lwDisplay).toBe(false)
    expect(written(cad, "LWDISPLAY", "2", "Yes").slice(1)).toEqual([
      "Enter new value for LWDISPLAY <OFF>: 2",
      "Requires 0 or 1 only, or option keyword.",
      "Enter new value for LWDISPLAY <OFF>: Yes",
    ])
    expect(settings(cad).lwDisplay).toBe(true)
    const spanish = createHarness({ locale: es })
    expect(written(spanish, "LWDISPLAY", "ON", "DES").slice(1)).toEqual([
      "Indique nuevo valor para LWDISPLAY <ACT>: ON",
      "Requiere 0 o sólo 1, o una opción.",
      "Indique nuevo valor para LWDISPLAY <ACT>: DES",
    ])
    expect(settings(spanish).lwDisplay).toBe(false)
  })

  // probe workspace/p133: Enter keeps the value
  it("keeps the value on Enter", () => {
    const cad = answer(createHarness(), "TEXTSIZE", "")
    expect(settings(cad).textSize).toBe(2.5)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("a variable runs inside another and inside a transparent command", () => {
  // probe workspace/p119: 'ORTHOMODE in a transparent ZOOM, refusals and
  // all, then ZOOM resumes
  it("nests in a transparent command", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "'ZOOM", "'ORTHOMODE")
    expect(written(cad, "10,0", "1")).toEqual([
      ">>Enter new value for ORTHOMODE <0>: 10,0",
      "Requires 0 or 1 only.",
      ">>Enter new value for ORTHOMODE <0>: 1",
      "Resuming ZOOM command.",
    ])
    expect(cad.activeToolId()).toBe("zoom")
    cad.escape()
    expect(cad.activeToolId()).toBe("line")
    expect(settings(cad).orthoMode).toBe(true)
  })

  // probes workspace/p120 (LINE: the prompt again keeps `>>`), p414 (bare
  // AUPREC: it does not), es `Reanudando el comando MODIVAR.`
  it("nests at another variable's prompt and resumes it as SETVAR", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "'AUPREC", "'ORTHOMODE")
    expect(written(cad, "1", "3")).toEqual([
      ">>Enter new value for ORTHOMODE <0>: 1",
      "Resuming SETVAR command.",
      ">>Enter new value for AUPREC <0>: 3",
      "Resuming LINE command.",
    ])
    expect(settings(cad).anglePrecision).toBe(3)
    const spanish = createHarness({ locale: es })
    answer(spanish, "AUPREC", "'ORTHOMODE")
    expect(written(spanish, "1", "3")).toEqual([
      ">>Indique nuevo valor para ORTHOMODE <0>: 1",
      "Reanudando el comando MODIVAR.",
      "Indique nuevo valor para AUPREC <0>: 3",
    ])
  })

  // probe workspace/p411: 'ZOOM at a transparent variable's prompt
  it("runs a transparent command at a transparent variable's prompt", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "'AUPREC", "'_ZOOM")
    expect(written(cad, "_E", "3").slice(-4)).toEqual([
      "** Requires a regen, cannot be transparent.",
      "Resuming SETVAR command.",
      ">>Enter new value for AUPREC <0>: 3",
      "Resuming LINE command.",
    ])
  })

  // probes workspace/p410, p415: the variable asked, typed at its own
  // prompt, is a value its type refuses; a transparent command stays refused
  // in another
  it("is a value at its own prompt", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "'ORTHOMODE")
    expect(written(cad, "'ORTHOMODE")).toEqual([
      ">>Enter new value for ORTHOMODE <0>: 'ORTHOMODE",
      "Requires 0 or 1 only.",
    ])
    cad.escape().escape()
    answer(cad, "LINE", "0,0", "'ZOOM")
    expect(written(cad, "'PAN").at(-1)).toMatch(/^Requires/)
    expect(cad.activeToolId()).toBe("zoom")
  })
})

describe("every set is one undo step named as it was invoked", () => {
  // probes workspace/p150 (ORTHOMODE), p151 (SETVAR, es MODIVAR), p152,
  // p159 (no change is a step too), p153 (REDO), p412 ('AUPREC)
  it("names the variable, SETVAR, or the apostrophe", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "10,0", "", "ORTHOMODE", "")
    expect(written(cad, "U")).toEqual(["U", "ORTHOMODE"])
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "ORTHOMODE", "1")
    expect(written(cad, "U")).toEqual(["U", "ORTHOMODE"])
    expect(settings(cad).orthoMode).toBe(false)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "ORTHOMODE",
      "Everything has been redone",
    ])
    expect(settings(cad).orthoMode).toBe(true)
    answer(cad, "'AUPREC", "2")
    expect(written(cad, "U")).toEqual(["U", "'AUPREC"])
    const spanish = createHarness({ locale: es })
    answer(spanish, "MODIVAR", "GRIDMODE", "0")
    expect(written(spanish, "H")).toEqual(["H", "MODIVAR"])
    expect(settings(spanish).gridMode).toBe(true)
  })

  // probe workspace/p154: UNDO 2 names both
  it("takes back two with UNDO 2", () => {
    const cad = answer(createHarness(), "AUPREC", "3", "ORTHOMODE", "1")
    expect(written(cad, "UNDO", "2").at(-1)).toBe("ORTHOMODE AUPREC")
    expect(settings(cad).anglePrecision).toBe(0)
    expect(settings(cad).orthoMode).toBe(false)
  })

  // probe workspace/p157: inside LINE, LINE's Undo takes it back with the
  // segment before it, and U names LINE
  it("joins the command it interrupted", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "10,0", "'AUPREC", "3", "U")
    expect(settings(cad).anglePrecision).toBe(0)
    answer(cad, "")
    expect(written(cad, "U")).toEqual(["U", "LINE"])
  })
})

// The values each variable takes (probes workspace/p204, p208–p217, p222;
// WORKSPACE-D33, D34, D38).
describe("each variable takes AutoCAD's values", () => {
  it("CECOLOR: numbers, names, ByLayer and RGB; not ByBlock", () => {
    const cad = createHarness()
    const color = () => settings(cad).currentColor
    answer(cad, "CECOLOR")
    expect(prompt(cad)).toBe('CECOLOR Enter new value for CECOLOR <"BYLAYER">:')
    answer(cad, "1")
    expect(color()).toBe("#ff0000")
    answer(cad, "CECOLOR")
    expect(prompt(cad)).toBe('CECOLOR Enter new value for CECOLOR <"1">:')
    answer(cad, "blue")
    expect(color()).toBe("#0000ff")
    answer(cad, "CECOLOR", "255,0,0")
    answer(cad, "CECOLOR", "RGB:10,20,30")
    expect(color()).toBe("#0a141e")
    answer(cad, "CECOLOR")
    expect(prompt(cad)).toBe(
      'CECOLOR Enter new value for CECOLOR <"RGB:10,20,30">:'
    )
    answer(cad, "256")
    expect(color()).toBe("ByLayer")
    for (const refused of ["BYBLOCK", "0", "8", "257", "FOO", "rojo"]) {
      expect(written(cad, "CECOLOR", refused).at(-2)).toBe(
        "Cannot set CECOLOR to that value."
      )
    }
    const spanish = createHarness({ locale: es })
    answer(spanish, "CECOLOR")
    expect(prompt(spanish)).toBe(
      'CECOLOR Indique nuevo valor para CECOLOR <"PORCAPA">:'
    )
    answer(spanish, "rojo", "CECOLOR", "green")
    expect(settings(spanish).currentColor).toBe("#00ff00")
    answer(spanish, "CECOLOR", "porcapa")
    expect(settings(spanish).currentColor).toBe("ByLayer")
  })

  it("CELTYPE: a linetype case-blind or ByLayer; CELWEIGHT in hundredths", () => {
    const cad = createHarness()
    answer(cad, "CELTYPE")
    expect(prompt(cad)).toBe('CELTYPE Enter new value for CELTYPE <"BYLAYER">:')
    answer(cad, "dashed", "CELTYPE")
    expect(prompt(cad)).toBe('CELTYPE Enter new value for CELTYPE <"Dashed">:')
    answer(cad, "bylayer")
    expect(settings(cad).currentLinetype).toBe("ByLayer")
    expect(written(cad, "CELTYPE", "BYBLOCK").at(-2)).toBe(
      "Cannot set CELTYPE to that value."
    )
    answer(cad, "CELWEIGHT")
    expect(prompt(cad)).toBe("CELWEIGHT Enter new value for CELWEIGHT <-1>:")
    answer(cad, "30")
    expect(settings(cad).currentLineweight).toBe(0.3)
    expect(written(cad, "CELWEIGHT", "0.25", "-4").slice(-3)).toEqual([
      "Requires an integer between -3 and 211.",
      "Enter new value for CELWEIGHT <30>: -4",
      "Requires an integer between -3 and 211.",
    ])
    cad.escape()
    for (const refused of ["26", "-2", "-3"]) {
      expect(written(cad, "CELWEIGHT", refused).at(-2)).toBe(
        "Cannot set CELWEIGHT to that value."
      )
    }
    answer(cad, "CELWEIGHT", "-1")
    expect(settings(cad).currentLineweight).toBe("ByLayer")
  })

  it("HPNAME keeps its `_`, `.` resets it; HPANG in degrees", () => {
    const cad = createHarness()
    answer(cad, "HPNAME", "_ansi31")
    expect(settings(cad).hatchPatternName).toBe("_ANSI31")
    answer(cad, "HPNAME", ".")
    expect(settings(cad).hatchPatternName).toBe("ANGLE")
    expect(written(cad, "HPNAME", "FOO").at(-2)).toBe(
      "Cannot set HPNAME to that value."
    )
    answer(cad, "HPANG", "400", "HPANG")
    expect(prompt(cad)).toBe("HPANG Enter new value for HPANG <40>:")
  })

  it("TEXTSIZE takes a negative as its size and refuses 0", () => {
    const cad = answer(createHarness(), "TEXTSIZE", "-4")
    expect(settings(cad).textSize).toBe(4)
    expect(written(cad, "TEXTSIZE", "0").at(-2)).toBe(
      "Cannot set TEXTSIZE to that value."
    )
  })

  it("INSUNITS takes the units modelled; SNAPMODE 2 turns snap on", () => {
    const cad = answer(createHarness(), "INSUNITS", "6")
    expect(settings(cad).unit).toBe("m")
    for (const refused of ["0", "21", "1"]) {
      expect(written(cad, "INSUNITS", refused).at(-2)).toBe(
        "Cannot set INSUNITS to that value."
      )
    }
    answer(cad, "SNAPMODE", "2")
    expect(settings(cad).snapMode).toBe(true)
  })

  // probe workspace/p213: ATTMODE regenerates
  it("ATTMODE regenerates as ATTDISP does", () => {
    const cad = createHarness()
    expect(written(cad, "ATTMODE", "0").at(-1)).toBe("Regenerating model.")
    expect(settings(cad).attributeDisplay).toBe("off")
    answer(cad, "LINE", "0,0", "'ATTMODE", "2")
    expect(cad.commandLog().at(-2)).toBe("Regen queued.")
  })

  it("UCSICON, NAVVCUBEDISPLAY and the drawing's switches", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    answer(cad, "NAVVCUBEDISPLAY", "1")
    expect(settings(cad).viewCube.visible).toBe(false)
    answer(cad, "NAVVCUBEDISPLAY")
    expect(prompt(cad)).toBe(
      "NAVVCUBEDISPLAY Enter new value for NAVVCUBEDISPLAY <1>:"
    )
    answer(cad, "3", "GRIDMODE", "0", "FILLMODE", "0", "LUPREC", "4")
    expect(settings(cad).viewCube.visible).toBe(true)
    expect(settings(cad).gridMode).toBe(false)
    expect(settings(cad).fillMode).toBe(false)
    expect(settings(cad).precision).toBe(4)
    answer(cad, "THICKNESS", "-2", "PLINEWID", "1", "CHAMFERA", "2")
    answer(cad, "CHAMFERB", "3", "HPSCALE", "2")
    expect(settings(cad)).toMatchObject({
      thickness: -2,
      polylineWidth: 1,
      chamferDistance1: 2,
      chamferDistance2: 3,
      hatchPatternScale: 2,
    })
  })
})

// The variables kept outside the drawing's settings, by a tool or by the
// runtime (WORKSPACE-D30's rest; probes workspace/p205, p211–p214, p216,
// p218, p223, p224).
describe("the variables kept outside the drawing", () => {
  // probes workspace/p205, p211, p213, p216, p212 (acadiso, the console's
  // profile for the registry ones)
  it("asks each with its value", () => {
    const cad = createHarness({ snap: true })
    for (const [name, value] of [
      ["OSMODE", "4133"],
      ["POLARANG", "90"],
      ["POLARDIST", "0.00"],
      ["SELECTIONCYCLING", "0"],
      ["CLIPROMPTLINES", "3"],
      ["TRIMEXTENDMODE", "1"],
      ["EDGEMODE", "0"],
      ["TEXTEDITMODE", "0"],
      ["SPLMETHOD", "0"],
      ["SPLKNOTS", "0"],
      ["SPLDEGREE", "3"],
      ["ARRAYASSOCIATIVITY", "1"],
      ["LASTPOINT", "0.00,0.00,0.00"],
      ["CIRCLERAD", "0.00"],
      ["OFFSETDIST", "-1.00"],
      ["POLYSIDES", "4"],
      ["AFLAGS", "16"],
    ]) {
      answer(cad, name)
      expect(prompt(cad)).toBe(
        `${name} Enter new value for ${name} <${value}>:`
      )
      cad.escape()
    }
    answer(cad, "INSNAME")
    expect(prompt(cad)).toBe(
      'INSNAME Enter new value for INSNAME, or . for none <"">:'
    )
  })

  // probes workspace/p213, p214, p223: each range, asked again
  it("refuses a value out of its range and asks again", () => {
    const cad = createHarness()
    for (const [name, typed, refusal] of [
      ["OSMODE", "32768", "Requires an integer between 0 and 32767."],
      ["SELECTIONCYCLING", "3", "Requires an integer between -2 and 2."],
      ["SELECTIONCYCLING", "FOO", "Requires an integer between -2 and 2."],
      ["CLIPROMPTLINES", "51", "Requires an integer between 0 and 50."],
      ["SPLKNOTS", "3", "Requires an integer between 0 and 2."],
      ["SPLDEGREE", "11", "Requires an integer between 1 and 10."],
      ["SPLDEGREE", "0", "Requires an integer between 1 and 10."],
      ["POLYSIDES", "2", "Requires an integer between 3 and 1024."],
      ["POLYSIDES", "1025", "Requires an integer between 3 and 1024."],
      ["AFLAGS", "64", "Requires an integer between 0 and 63."],
      ["TRIMEXTENDMODE", "2", "Requires 0 or 1 only."],
      ["EDGEMODE", "2", "Requires 0 or 1 only."],
      ["TEXTEDITMODE", "2", "Requires 0 or 1 only."],
      ["SPLMETHOD", "2", "Requires 0 or 1 only."],
      ["ARRAYASSOCIATIVITY", "2", "Requires 0 or 1 only."],
      ["POLARANG", "FOO", "Requires valid numeric angle or two points."],
      ["POLARDIST", "FOO", "Requires numeric distance or two points."],
      ["CIRCLERAD", "FOO", "Requires numeric distance or two points."],
      ["OFFSETDIST", "FOO", "Requires numeric distance or two points."],
      ["LASTPOINT", "FOO", "Invalid point."],
    ]) {
      expect(written(cad, name, typed).at(-1)).toBe(refusal)
      expect(cad.activeToolId()).toBe("setvar")
      cad.escape()
    }
    const spanish = createHarness({ locale: es })
    expect(written(spanish, "LASTPOINT", "FOO").at(-1)).toBe("Punto no válido.")
  })

  // probes workspace/p211 (CIRCLERAD -1), p213 (AFLAGS 63), p223 (POLARANG 0),
  // p224 (AFLAGS 48: -ATTDEF then asks a multiline attribute's lines)
  it("ends on a value it does not take", () => {
    const cad = createHarness()
    for (const [name, typed] of [
      ["CIRCLERAD", "-1"],
      ["POLARANG", "0"],
      ["POLARANG", "360"],
      ["AFLAGS", "48"],
    ]) {
      expect(written(cad, name, typed).slice(-2)).toEqual([
        `Cannot set ${name} to that value.`,
        "*Invalid*",
      ])
      expect(cad.activeToolId()).toBe("select")
    }
    expect(prompt(answer(cad, "AFLAGS"))).toBe(
      "AFLAGS Enter new value for AFLAGS <16>:"
    )
  })

  // probes workspace/p214, p223 (OSMODE 8 and 16384 taken), WORKSPACE-D40
  it("OSMODE sets the running snaps, keeps NOD and GCEN, suspends at 16384", () => {
    const cad = createHarness({ snap: true })
    answer(cad, "OSMODE", "3")
    expect(cad.runtime.snapping.enabledTypes()).toEqual([
      "endpoint",
      "midpoint",
    ])
    answer(cad, "OSMODE", "1033")
    expect(cad.runtime.snapping.enabledTypes()).toEqual(["endpoint"])
    expect(prompt(answer(cad, "OSMODE"))).toBe(
      "OSMODE Enter new value for OSMODE <1033>:"
    )
    answer(cad, "16385")
    expect(cad.state().snapActive).toBe(false)
    answer(cad, "OSMODE", "1")
    expect(cad.state().snapActive).toBe(true)
    // F3 is 16384 too.
    cad.press("F3")
    expect(prompt(answer(cad, "OSMODE"))).toBe(
      "OSMODE Enter new value for OSMODE <16385>:"
    )
  })

  // probe workspace/p223: degrees, put in 0–360
  it("POLARANG sets Polar's increment", () => {
    const cad = answer(createHarness(), "POLARANG", "45")
    expect(cad.state().polarAngleStep).toBe(45)
    answer(cad, "POLARANG", "-30")
    expect(cad.state().polarAngleStep).toBe(330)
    answer(cad, "POLARANG", "400")
    expect(cad.state().polarAngleStep).toBeCloseTo(40, 9)
  })

  // help GUID-66D637C9 ("If this value is 0, the PolarSnap distance assumes
  // the value for Snap X Spacing"), probes workspace/p205 (0 at first), p211
  // (a negative taken); WORKSPACE-D36
  it("POLARDIST 0 steps PolarSnap by Snap X", () => {
    const cad = createHarness({ polar: true })
    answer(cad, "SNAP", "5")
    cad.runtime.setSnapModeType("polar")
    const along = (x: number) => {
      cad.command("LINE").click(p(0, 0)).click(p(x, 0.1)).escape()
      return (cad.latest() as LineEntity).end.x
    }
    expect(along(13)).toBeCloseTo(15, 9)
    answer(cad, "POLARDIST", "4")
    expect(along(13)).toBeCloseTo(12, 9)
    answer(cad, "POLARDIST", "-4")
    expect(cad.state().snapPolarDistance).toBe(-4)
    answer(cad, "POLARDIST", "0", "SNAP", "3")
    expect(along(13)).toBeCloseTo(12, 9)
  })

  // probe workspace/p214: the sign on or off, the size the list box
  it("SELECTIONCYCLING turns cycling and its list box on and off", () => {
    const cad = answer(createHarness(), "SELECTIONCYCLING", "2")
    expect(cad.state().selectionCycling).toMatchObject({
      active: true,
      showList: true,
    })
    answer(cad, "SELECTIONCYCLING", "-1")
    expect(cad.state().selectionCycling.active).toBe(false)
    cad.runtime.toggleSelectionCycling()
    expect(cad.state().selectionCycling).toMatchObject({
      active: true,
      showList: false,
    })
    expect(prompt(answer(cad, "SELECTIONCYCLING"))).toBe(
      "SELECTIONCYCLING Enter new value for SELECTIONCYCLING <1>:"
    )
  })

  // probe workspace/p214; command-line.md (the temporary prompt lines)
  it("CLIPROMPTLINES is how many prompt lines show above the prompt", () => {
    const cad = answer(createHarness(), "CLIPROMPTLINES", "1")
    answer(cad, "LINE", "0,0", "1,1")
    expect(cad.state().commandLine.recent).toHaveLength(1)
    answer(cad, "", "CLIPROMPTLINES", "0")
    expect(cad.state().commandLine.recent).toEqual([])
  })

  // probes workspace/p214 (each switch), trim/p109, spline/p104, text/p246,
  // arrays/p01: what each command then says
  it("sets the modes TRIM, SPLINE, TEXTEDIT and the arrays start in", () => {
    const cad = createHarness()
    answer(cad, "TRIMEXTENDMODE", "0", "EDGEMODE", "1", "TRIM")
    expect(cad.commandLog()).toContain(
      "Current settings: Projection=UCS, Edge=Extend, Mode=Standard"
    )
    cad.escape()
    answer(cad, "SPLMETHOD", "1", "SPLDEGREE", "4", "SPLINE")
    expect(cad.commandLog()).toContain("Current settings: Method=CV   Degree=4")
    cad.escape()
    answer(cad, "SPLMETHOD", "0", "SPLKNOTS", "2", "SPLINE")
    expect(cad.commandLog().at(-1)).toMatch(/Knots=Uniform/)
    cad.escape()
    answer(cad, "TEXTEDITMODE", "1", "TEXTEDIT")
    expect(cad.commandLog()).toContain("Current settings: Edit mode = Single")
    cad.escape()
    const arrays = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L" })],
    })
    answer(arrays, "ARRAYASSOCIATIVITY", "0", "ARRAYRECT", "_L", "")
    expect(arrays.commandLog()).toContain(
      "Type = Rectangular  Associative = No"
    )
  })

  // probes workspace/p211, p213, p223: the next run's defaults
  it("sets the defaults CIRCLE, OFFSET, POLYGON and ATTDEF offer", () => {
    const cad = answer(createHarness(), "CIRCLERAD", "3", "CIRCLE", "0,0")
    expect(prompt(cad)).toBe(
      "CIRCLE Specify radius of circle or [Diameter] <3.00>:"
    )
    cad.escape()
    answer(cad, "OFFSETDIST", "-2", "OFFSET")
    expect(prompt(cad)).toBe(
      "OFFSET Specify offset distance or [Through/Erase/Layer] <Through>:"
    )
    cad.escape()
    answer(cad, "OFFSETDIST", "0", "OFFSET")
    expect(prompt(cad)).toMatch(/<0.00>:$/)
    cad.escape()
    answer(cad, "POLYSIDES", "1024", "POLYGON")
    expect(prompt(cad)).toBe("POLYGON Enter number of sides <1024>:")
    cad.escape()
    answer(cad, "AFLAGS", "3", "ATTDEF")
    expect(cad.commandLog().at(-1)).toMatch(
      /\nInvisible=Y {2}Constant=Y {2}Verify=N {2}Preset=N {2}Lock position=N /
    )
  })

  // probe workspace/p216: an undefined name taken, `.` for none; INSERT
  // finds the one typed case-blind
  it("INSNAME is the block INSERT offers", () => {
    const cad = createHarness({
      blocks: ["B1", "B2"].map((name) =>
        createBlockDefinition(name, p(0, 0), [lineOf(p(0, 0), p(1, 0))])
      ),
    })
    answer(cad, "INSNAME", "b1", "-INSERT")
    expect(prompt(cad)).toBe("-INSERT Enter block name or [?] <B1>:")
    cad.escape()
    answer(cad, "INSNAME", "FOO", "INSNAME")
    expect(prompt(cad)).toBe(
      'INSNAME Enter new value for INSNAME, or . for none <"FOO">:'
    )
    answer(cad, ".", "INSNAME")
    expect(prompt(cad)).toBe(
      'INSNAME Enter new value for INSNAME, or . for none <"">:'
    )
  })

  // probes workspace/p212 (`@5,0` from itself), p224 (in the UCS, a 2D
  // point at ELEVATION, `@` and `@1,1,1`); WORKSPACE-D41
  it("LASTPOINT is typed in the UCS, `@` from itself", () => {
    const cad = answer(createHarness(), "UCS", "_O", "10,0")
    answer(cad, "LASTPOINT", "1,1")
    expect(written(cad, "ID", "@").at(-1)).toBe(
      " X = 1.00     Y = 1.00     Z = 0.00"
    )
    // Kept in the WCS: LINE's `@` there.
    answer(cad, "LINE", "@", "20,0", "")
    expect((cad.latest() as LineEntity).start).toBeCloseToPoint(p(11, 1), 9)
    answer(cad, "ELEVATION", "5", "LASTPOINT", "3,4", "LASTPOINT")
    expect(prompt(cad)).toBe(
      "LASTPOINT Enter new value for LASTPOINT <3.00,4.00,5.00>:"
    )
    answer(cad, "@", "LASTPOINT", "@1,1,1", "LASTPOINT")
    expect(prompt(cad)).toBe(
      "LASTPOINT Enter new value for LASTPOINT <4.00,5.00,6.00>:"
    )
  })

  // probe workspace/p218: U takes back each, named as typed (WORKSPACE-D35)
  it("is one undo step whatever keeps it", () => {
    const cad = createHarness({ snap: true })
    for (const [name, typed, before] of [
      ["OSMODE", "1", "4133"],
      ["POLARANG", "45", "90"],
      ["POLARDIST", "5", "0.00"],
      ["SELECTIONCYCLING", "1", "0"],
      ["CLIPROMPTLINES", "5", "3"],
      ["TRIMEXTENDMODE", "0", "1"],
      ["EDGEMODE", "1", "0"],
      ["TEXTEDITMODE", "1", "0"],
      ["SPLMETHOD", "1", "0"],
      ["SPLKNOTS", "1", "0"],
      ["SPLDEGREE", "4", "3"],
      ["ARRAYASSOCIATIVITY", "0", "1"],
      ["INSNAME", "FOO", '""'],
      ["LASTPOINT", "5,5", "0.00,0.00,0.00"],
      ["CIRCLERAD", "3", "0.00"],
      ["OFFSETDIST", "4", "-1.00"],
      ["POLYSIDES", "6", "4"],
      ["AFLAGS", "3", "16"],
    ]) {
      answer(cad, name, typed)
      expect(written(cad, "U")).toEqual(["U", name])
      answer(cad, name)
      expect(prompt(cad)).toMatch(new RegExp(` <${before}>:$`))
      cad.escape()
    }
  })

  // RECTANG-D48 (rectang/p317): U after CIRCLE leaves CIRCLERAD, where
  // AutoCAD's puts it back (workspace/p221)
  it("leaves CIRCLERAD as U after CIRCLE finds it", () => {
    const cad = answer(createHarness(), "CIRCLE", "0,0", "5", "U", "CIRCLERAD")
    expect(prompt(cad)).toBe("CIRCLERAD Enter new value for CIRCLERAD <5.00>:")
  })

  // rectang/p301, p303, p309, p310 (per drawing, unsaved); p304, p219 (the
  // registry's and the session's, which NEW leaves)
  it("goes back to its default with NEW where it is the drawing's", () => {
    const cad = createHarness({ snap: true })
    const typed: [string, string, string][] = [
      ["CIRCLERAD", "3", "0.00"],
      ["OFFSETDIST", "4", "-1.00"],
      ["POLYSIDES", "6", "4"],
      ["INSNAME", "FOO", '""'],
      ["LASTPOINT", "5,5", "0.00,0.00,0.00"],
      ["OSMODE", "1", "1"],
      ["POLARANG", "45", "45"],
      ["POLARDIST", "5", "5.00"],
      ["SELECTIONCYCLING", "1", "1"],
      ["CLIPROMPTLINES", "5", "5"],
      ["TRIMEXTENDMODE", "0", "0"],
      ["EDGEMODE", "1", "1"],
      ["TEXTEDITMODE", "1", "1"],
      ["SPLMETHOD", "1", "1"],
      ["SPLKNOTS", "1", "1"],
      ["SPLDEGREE", "4", "4"],
      ["ARRAYASSOCIATIVITY", "0", "0"],
      ["AFLAGS", "3", "3"],
    ]
    for (const [name, value] of typed) answer(cad, name, value)
    answer(cad, "_NEW")
    for (const [name, , after] of typed) {
      answer(cad, name)
      expect(prompt(cad)).toMatch(new RegExp(`${name}.* <${after}>:$`))
      cad.escape()
    }
  })
})
