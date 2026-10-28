import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
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

  // probes workspace/p125 (ORTHO*), p126 (A*: the columns, `(read only)`)
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
      "AREA              0.00                                 (read only)",
      "ATTMODE           1",
      "AUPREC            0",
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
