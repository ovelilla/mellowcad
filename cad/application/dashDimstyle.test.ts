import { describe, expect, it } from "vitest"
import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { createDimension, DimensionEntity } from "../domain/entities"
import { es } from "../locales/es"

/**
 * -DIMSTYLE (es -ACOESTIL), the dimension style table at the command line,
 * as AutoCAD 2027's console asks it (probes dimensions/p04–p11, p16).
 */

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

const prompt = (cad: CadHarness) => cad.state().commandLine.prompt
const current = (cad: CadHarness) => cad.state().currentDimStyleId
const names = (cad: CadHarness) => cad.state().dimStyles.map((s) => s.name)

const OPTION =
  "-DIMSTYLE Enter a dimension style option [Save/Restore/STatus/Variables/Apply/?] <Restore>:"
const NAME =
  "-DIMSTYLE Enter a dimension style name, [?] or <select dimension>:"

/** A drawing holding one dimension, D1, on style ISO-25. */
function dimensioned() {
  return createHarness({
    entities: [
      createDimension("linear", p(0, 0), p(10, 0), p(5, 5), { id: "D1" }),
    ],
  })
}

describe("-DIMSTYLE's option prompt (p04, p11)", () => {
  it("says the current style, then asks with Restore as Enter's (p04)", () => {
    const cad = createHarness()
    expect(written(cad, "-DIMSTYLE").at(-1)).toBe(
      "Current dimension style: ISO-25   Annotative: No"
    )
    expect(prompt(cad)).toBe(OPTION)

    answer(cad, "")
    expect(prompt(cad)).toBe(NAME)
  })

  it("refuses a word it does not know and asks again (p11)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE")
    expect(written(cad, "FOO")).toContain("Invalid option keyword.")
    expect(prompt(cad)).toBe(OPTION)
  })

  it("cannot be run transparently (p09)", () => {
    const cad = createHarness()
    cad.command("LINE").type("0,0").enter()
    expect(written(cad, "'-DIMSTYLE")).toContain(
      "** That command may not be invoked transparently **"
    )
    expect(cad.activeToolId()).toBe("line")
  })

  it("asks in Spanish AutoCAD's words (p04 es, p10)", () => {
    const cad = createHarness({ locale: es })
    expect(written(cad, "-ACOESTIL").at(-1)).toBe(
      "Estilo de cota actual: ISO-25   Anotativo: No"
    )
    expect(prompt(cad)).toBe(
      "-ACOESTIL Indique una opción de estilo de cota [Guardar/Restituir/Estado/Variables/Aplicar/?] <Restituir>:"
    )
    answer(cad, "")
    expect(prompt(cad)).toBe(
      "-ACOESTIL Indique un nombre de estilo de cota, [?] o <designar cota>:"
    )
  })
})

describe("-DIMSTYLE's Save (p05, p06, p08)", () => {
  it("saves the current settings under a new name, made current (p08)", () => {
    const cad = createHarness()
    cad.runtime.updateDimStyle("ISO-25", { textHeight: 5 })
    answer(cad, "-DIMSTYLE", "S")
    expect(prompt(cad)).toBe(
      "-DIMSTYLE Enter name for new dimension style or [?]:"
    )
    answer(cad, "plans")

    expect(names(cad)).toEqual(["ISO-25", "plans"])
    expect(current(cad)).toBe("plans")
    expect(cad.state().dimStyles[1].textHeight).toBe(5)
    expect(cad.activeToolId()).toBe("select")
  })

  it("U takes the new style back and ISO-25 is current again, naming -DIMSTYLE (p05)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "_S", "Plans")
    expect(current(cad)).toBe("Plans")

    expect(written(cad, "_U")).toEqual(["U", "-DIMSTYLE"])
    expect(current(cad)).toBe("ISO-25")
    expect(names(cad)).toEqual(["ISO-25"])
  })

  it("names the step -ACOESTIL in Spanish (p05 es)", () => {
    const cad = answer(createHarness({ locale: es }), "-ACOESTIL", "G", "Plans")
    expect(written(cad, "H")).toEqual(["H", "-ACOESTIL"])
  })

  it("asks to redefine a name in use, any case; No asks the name again (p08)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "S", "plans")
    answer(cad, "-DIMSTYLE", "S", "PLANS")
    expect(prompt(cad)).toBe(
      "-DIMSTYLE That name is already in use, redefine it? <N>:"
    )
    answer(cad, "N")
    expect(prompt(cad)).toBe(
      "-DIMSTYLE Enter name for new dimension style or [?]:"
    )
    expect(names(cad)).toEqual(["ISO-25", "plans"])
  })

  it("asks it in Spanish AutoCAD's words (p08 es)", () => {
    const cad = answer(
      createHarness({ locale: es }),
      "-ACOESTIL",
      "G",
      "iso-25"
    )
    expect(prompt(cad)).toBe(
      "-ACOESTIL Este nombre está ya en uso; ¿redefinirlo? <N>:"
    )
  })

  it("Yes on the current style's own name keeps it current (p06)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "_S", "ISO-25", "_Y")
    expect(current(cad)).toBe("ISO-25")
    expect(names(cad)).toEqual(["ISO-25"])
    expect(cad.activeToolId()).toBe("select")
  })

  it("Yes on another style gives it the current settings and makes it current", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "S", "Plans")
    answer(cad, "-DIMSTYLE", "R", "ISO-25")
    cad.runtime.updateDimStyle("ISO-25", { arrowSize: 4 })
    answer(cad, "-DIMSTYLE", "S", "plans", "Y")

    expect(current(cad)).toBe("Plans")
    expect(cad.state().dimStyles[1]).toMatchObject({
      name: "Plans",
      arrowSize: 4,
    })
    expect(written(cad, "_U")).toEqual(["U", "-DIMSTYLE"])
    expect(current(cad)).toBe("ISO-25")
    expect(cad.state().dimStyles[1].arrowSize).toBe(2.5)
  })
})

describe("-DIMSTYLE's Restore (p04, p08, p11, p16)", () => {
  it("makes a style current by its name, any case, and says so (p11)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "S", "B")
    expect(written(cad, "-DIMSTYLE", "R", "iso-25").at(-1)).toBe(
      "Current dimension style: ISO-25   Annotative: No"
    )
    expect(current(cad)).toBe("ISO-25")
    expect(cad.activeToolId()).toBe("select")
  })

  it("says an unknown name, then the current style, and ends (p04, p08, p11)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "R")
    expect(written(cad, "FOO").slice(-2)).toEqual([
      "Unknown dimension style.",
      "Current dimension style: ISO-25   Annotative: No",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("at Enter selects a dimension, whose style is made current (p16)", () => {
    const cad = dimensioned()
    answer(cad, "-DIMSTYLE", "S", "B")
    answer(cad, "-DIMSTYLE", "R", "")
    expect(prompt(cad)).toBe("-DIMSTYLE Select dimension:")

    cad.click(p(5, 5))
    expect(current(cad)).toBe("ISO-25")
    expect(cad.commandLog().at(-1)).toBe(
      "Current dimension style: ISO-25   Annotative: No"
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("says a picked object that is no dimension and asks again (table AcDimRes 5307)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 100), p(100, 100), { id: "L1" })],
    })
    answer(cad, "-DIMSTYLE", "R", "")
    cad.click(p(50, 100))
    expect(cad.commandLog().at(-1)).toBe("Selected object is not a dimension.")
    expect(prompt(cad)).toBe("-DIMSTYLE Select dimension:")
  })
})

describe("-DIMSTYLE's Apply (p11, p16)", () => {
  it("puts the selected dimensions on the current style, one step (p16)", () => {
    const cad = dimensioned()
    answer(cad, "-DIMSTYLE", "S", "B")
    cad.runtime.document.update(
      createDimension("linear", p(0, 0), p(10, 0), p(5, 5), {
        id: "D1",
        styleId: "B",
      })
    )
    answer(cad, "-DIMSTYLE", "R", "ISO-25")
    answer(cad, "-DIMSTYLE", "A")
    expect(prompt(cad)).toBe("-DIMSTYLE Select objects:")
    answer(cad, "L", "")

    expect(cad.byId<DimensionEntity>("D1").styleId).toBe("ISO-25")
    expect(cad.activeToolId()).toBe("select")
    expect(written(cad, "_U")).toEqual(["U", "-DIMSTYLE"])
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe("B")
  })
})

describe("-DIMSTYLE's listings (p06, p07, p10)", () => {
  it("? lists the named styles in the table's order (p07)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "S", "Plans")
    answer(cad, "-DIMSTYLE", "?")
    expect(prompt(cad)).toBe("-DIMSTYLE Enter dimension style(s) to list <*>:")
    expect(written(cad, "").at(-1)).toBe(
      "Named dimension styles:\n\n  ISO-25\n  Plans"
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("? takes wildcards, and says when none matches (table AcDimRes 5300)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "S", "Plans")
    expect(written(cad, "-DIMSTYLE", "?", "P*").at(-1)).toBe(
      "Named dimension styles:\n\n  Plans"
    )
    expect(written(cad, "-DIMSTYLE", "?", "X*").at(-1)).toBe(
      "Named dimension styles:\n\n  No matching dimension styles found."
    )
  })

  it("? in Spanish (p07 es, p10)", () => {
    const cad = answer(createHarness({ locale: es }), "-ACOESTIL", "?", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Estilos de cota guardados:\n\n  ISO-25"
    )
  })

  it("Variables lists a style's modelled variables in AutoCAD's columns (p07)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "V", "ISO-25")
    expect(cad.commandLog().at(-1)).toBe(
      [
        "DIMADEC     0                    Angular decimal places",
        "DIMASZ      2.5000               Arrow size",
        "DIMCEN      2.5000               Center mark size",
        "DIMDEC      2                    Decimal places",
        "DIMDLI      3.7500               Dimension line spacing",
        "DIMDSEP     ,                    Decimal separator",
        "DIMEXE      1.2500               Extension above dimension line",
        "DIMEXO      0.6250               Extension line origin offset",
        "DIMGAP      0.6250               Gap from dimension line to text",
        "DIMSCALE    1.0000               Overall scale factor",
        "DIMTOFL     On                   Force line inside extension lines",
        "DIMTXT      2.5000               Text height",
        "DIMZIN      8                    Zero suppression",
      ].join("\n")
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("Variables at Enter lists the selected dimension's style (p07, p16)", () => {
    const cad = dimensioned()
    answer(cad, "-DIMSTYLE", "V", "")
    cad.click(p(5, 5))
    expect(cad.commandLog().at(-1)).toContain(
      "DIMTXT      2.5000               Text height"
    )
  })

  it("STatus lists the current style first, then its variables (p06)", () => {
    const cad = answer(createHarness(), "-DIMSTYLE", "ST")
    const lines = cad.commandLog().at(-1)?.split("\n") ?? []
    expect(lines[0]).toBe(
      "DIMSTYLE    ISO-25               Current dimension style (read-only)"
    )
    expect(lines[1]).toBe(
      "DIMADEC     0                    Angular decimal places"
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("STatus in Spanish (p06 es)", () => {
    const cad = answer(createHarness({ locale: es }), "-ACOESTIL", "E")
    const lines = cad.commandLog().at(-1)?.split("\n") ?? []
    expect(lines[0]).toBe(
      "DIMSTYLE    ISO-25               Estilo de cota actual (de sólo lectura)"
    )
    expect(lines).toContain(
      "DIMEXO      0.6250               Desfase línea de referencia - origen"
    )
    // A switch is a word of the command language.
    expect(lines).toContain(
      "DIMTOFL     ACT                  Forzar línea dentro de las líneas de referencia"
    )
  })
})
