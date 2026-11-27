import { describe, expect, it } from "vitest"
import { Entity, HatchEntity } from "../../domain/entities"
import { es } from "../../locales/es"
import { ptBR } from "../../locales/pt-BR"
import { createHarness, type CadHarness } from "../../../test/harness"
import {
  deg,
  hatchOf,
  layerOf,
  lineOf,
  loopOf,
  p,
} from "../../../test/builders"

/**
 * -HATCHEDIT against AutoCAD 2027's console (probes hatchedit/p01–p16, en-US
 * and es-ES, traced): a set of hatches, `Enter hatch option`, and
 * Properties' pattern, scale and angle.
 */

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function drawing(
  entities: readonly Entity[],
  locale?: typeof es | typeof ptBR
): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  cad.runtime.document.load([...entities], {
    layers: [layerOf("0"), layerOf("LK", { locked: true })],
  })
  return cad
}

/** The lines `answers` (`|` between them, an empty one Enter) add to the history. */
function written(cad: CadHarness, answers: string): string[] {
  const from = cad.commandLog().length
  answer(cad, ...answers.split("|"))
  return cad.commandLog().slice(from)
}

function hatch(cad: CadHarness, id: string): HatchEntity {
  return cad.runtime.document.get(id) as HatchEntity
}

const square = (id: string, x = 0, options = {}) =>
  hatchOf([loopOf(p(x, 0), p(x + 10, 10))], {
    id,
    patternId: "ANGLE",
    ...options,
  })

const OPTION = "Enter hatch option [DIsassociate/Properties] <Properties>:"

describe("-HATCHEDIT against AutoCAD 2027's console in English", () => {
  it("gives the set Properties' pattern, scale and angle, one step U names (p01)", () => {
    const cad = drawing([square("h")])
    expect(written(cad, "-HATCHEDIT|_L|||ANSI32|2|45")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "Select hatch objects:",
      // AutoCAD lists fourteen options: [DIsassociate/Style/Properties/…].
      OPTION,
      // AutoCAD: `[?/Solid/User defined/Gradient]`, as -HATCH's.
      "Enter a pattern name or [?/Solid] <ANGLE>: ANSI32",
      "Specify a scale for the pattern <1.0000>: 2",
      "Specify an angle for the pattern <0>: 45",
    ])
    const edited = hatch(cad, "h")
    expect(edited.patternId).toBe("ANSI32")
    expect(edited.patternScale).toBe(2)
    expect(edited.patternAngle).toBeCloseTo(deg(45))
    // HPNAME, HPSCALE and HPANG are the drawing's still (p01).
    const settings = cad.runtime.document.getSettings()
    expect(settings.hatchPatternName).not.toBe("ANSI32")
    expect(written(cad, "U")).toEqual(["U", "-HATCHEDIT"])
    expect(hatch(cad, "h").patternId).toBe("ANGLE")
  })

  it("makes a solid fill at Solid, and asks no more of one (p02)", () => {
    const cad = drawing([square("h")])
    expect(written(cad, "-HATCHEDIT|_L|||_S")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "Select hatch objects:",
      OPTION,
      "Enter a pattern name or [?/Solid] <ANGLE>: _S",
    ])
    expect(hatch(cad, "h").patternId).toBe("SOLID")
    expect(written(cad, "-HATCHEDIT|_L|||")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "Select hatch objects:",
      OPTION,
      "Enter a pattern name or [?/Solid] <SOLID>:",
    ])
    expect(cad.state().commandLine.command).toBeNull()
  })

  it("drops what is no hatch, offering `varies` where the set differs (p03)", () => {
    const cad = drawing([
      lineOf(p(20, 0), p(30, 0), { id: "l" }),
      square("a"),
      square("b", 40, {
        patternId: "ANSI37",
        patternScale: 3,
        patternAngle: deg(15),
      }),
    ])
    expect(written(cad, "-HATCHEDIT|_ALL|||ANSI32||")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _ALL",
      "3 found",
      "Select hatch objects:",
      "Selected object must be a hatch object.",
      "1 objects removed from selection set.",
      OPTION,
      // No colon after `<varies>` (table 23404).
      "Enter a pattern name or [?/Solid] <varies> ANSI32",
      "Specify a scale for the pattern <varies>:",
      "Specify an angle for the pattern <varies>:",
    ])
    expect(hatch(cad, "a")).toMatchObject({
      patternId: "ANSI32",
      patternScale: 1,
      patternAngle: 0,
    })
    expect(hatch(cad, "b").patternId).toBe("ANSI32")
    expect(hatch(cad, "b").patternScale).toBe(3)
    expect(hatch(cad, "b").patternAngle).toBeCloseTo(deg(15))
  })

  it("offers the set's one value, and keeps each hatch's own at Enter (p11, p12)", () => {
    const cad = drawing([
      square("a", 0, { patternId: "ANSI31" }),
      square("b", 40, { patternId: "ANSI31", patternScale: 3 }),
    ])
    expect(written(cad, "-HATCHEDIT|_ALL|||||45").slice(-3)).toEqual([
      "Enter a pattern name or [?/Solid] <ANSI31>:",
      "Specify a scale for the pattern <varies>:",
      "Specify an angle for the pattern <0>: 45",
    ])
    expect(hatch(cad, "a").patternScale).toBe(1)
    expect(hatch(cad, "b").patternScale).toBe(3)
    expect(hatch(cad, "b").patternAngle).toBeCloseTo(deg(45))
  })

  it("ends at Enter on an empty set, and asks again when no hatch is left (p04, p14)", () => {
    const cad = drawing([lineOf(p(0, 0), p(5, 5), { id: "l" })])
    expect(written(cad, "-HATCHEDIT|")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects:",
    ])
    expect(cad.state().commandLine.command).toBeNull()
    expect(written(cad, "-HATCHEDIT|_L|")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "Select hatch objects:",
      "Selected object must be a hatch object.",
      "1 objects removed from selection set.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "-HATCHEDIT Select hatch objects:"
    )
  })

  it("leaves the set at CAncel and at DIsassociate, a step all the same (p05, p13)", () => {
    const cad = drawing([square("h")])
    expect(written(cad, "-HATCHEDIT|_L||_CA")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "Select hatch objects:",
      `${OPTION} _CA`,
    ])
    expect(cad.state().commandLine.command).toBeNull()
    expect(written(cad, "U")).toEqual(["U", "-HATCHEDIT"])
    written(cad, "-HATCHEDIT|_L||_DI")
    expect(cad.state().commandLine.command).toBeNull()
    expect(hatch(cad, "h").patternId).toBe("ANGLE")
  })

  it("takes a set selected before it, counted after the echo (p07)", () => {
    const cad = drawing([square("h")])
    cad.select("h")
    expect(written(cad, "-HATCHEDIT|_CA")).toEqual([
      "-HATCHEDIT",
      "1 found",
      `${OPTION} _CA`,
    ])
  })

  it("refuses what -HATCH's Properties refuses, in its words (p09)", () => {
    const cad = drawing([square("h")])
    expect(
      written(cad, "-HATCHEDIT|_L|||FOO|ANSI32|0|-2|abc|1|abc|0").slice(5)
    ).toEqual([
      "Enter a pattern name or [?/Solid] <ANGLE>: FOO",
      "Unknown pattern name.",
      "Enter a pattern name or [?/Solid] <ANGLE>: ANSI32",
      "Specify a scale for the pattern <1.0000>: 0",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.0000>: -2",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.0000>: abc",
      "Requires a distance (or numberX).",
      "Specify a scale for the pattern <1.0000>: 1",
      "Specify an angle for the pattern <0>: abc",
      "Requires valid numeric angle or two points.",
      "Specify an angle for the pattern <0>: 0",
    ])
  })

  it("refuses an option it does not have (p10)", () => {
    const cad = drawing([square("h")])
    expect(written(cad, "-HATCHEDIT|_L||FOO").slice(-2)).toEqual([
      `${OPTION} FOO`,
      "Invalid option keyword.",
    ])
  })

  it("counts a hatch on a locked layer and leaves it out (p15)", () => {
    const cad = drawing([square("h", 0, { layerId: "LK" })])
    expect(written(cad, "-HATCHEDIT|_L|")).toEqual([
      "-HATCHEDIT",
      "Select hatch objects: _L",
      "1 found",
      "1 was on a locked layer.",
      "Select hatch objects:",
    ])
    expect(cad.state().commandLine.command).toBeNull()
  })

  it("runs inside LINE, and LINE's U takes it back with it (p06)", () => {
    const cad = drawing([square("h")])
    written(cad, "LINE|20,20|'-HATCHEDIT|_L|||ANSI32||")
    expect(hatch(cad, "h").patternId).toBe("ANSI32")
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
    written(cad, "30,30||U")
    expect(hatch(cad, "h").patternId).toBe("ANGLE")
  })
})

describe("-HATCHEDIT in Spanish (-EDITSOMB)", () => {
  it("asks in the Spanish console's words (p01, p03 es)", () => {
    const cad = drawing(
      [
        lineOf(p(20, 0), p(30, 0), { id: "l" }),
        square("a"),
        square("b", 40, { patternId: "ANSI37", patternScale: 3 }),
      ],
      es
    )
    expect(written(cad, "-EDITSOMB|_ALL|||ANSI32||")).toEqual([
      "-EDITSOMB",
      "Designe objetos de sombreado: _ALL",
      "3 encontrados",
      "Designe objetos de sombreado:",
      "El objeto designado debe ser un objeto de sombreado.",
      "1 objetos eliminados del conjunto de selección.",
      "Indique opción de sombreado [Disociar/Propiedades] <Propiedades>:",
      "Indique nombre de patrón o [?/Sólido] <varía> ANSI32",
      "Especifique una escala para el patrón <varía>:",
      "Precise ángulo del patrón <0>:",
    ])
  })
})

describe("-HATCHEDIT in Brazilian Portuguese (-EDITARHACH)", () => {
  // p03 pt-BR: several hatches' list in English, its default the word, and
  // the angle's `<varia>` against the prompt, with no space after its colon.
  it("lists several hatches' options in English, as its table does (p03 pt-BR)", () => {
    const cad = drawing(
      [
        square("a"),
        square("b", 40, { patternScale: 3, patternAngle: deg(15) }),
      ],
      ptBR
    )
    expect(written(cad, "-EDITARHACH|_ALL||||5|").slice(-4)).toEqual([
      "Insira uma opção de hachura [DIsassociate/Properties] <Propriedades>:",
      "Insira um nome de padrão ou [?/Sólido] <ANGLE>:",
      "Especifique uma escala para o padrão <varia>:5",
      "Especifique um ângulo para o padrão<varia>:",
    ])
  })
})

describe("-HATCHEDIT across a change of language", () => {
  it("rewords its open prompt, its default and `varies` too", () => {
    const cad = drawing([
      square("a"),
      square("b", 40, { patternId: "ANSI37", patternScale: 3 }),
    ])
    written(cad, "-HATCHEDIT|_ALL|")
    cad.runtime.setLocale(es)
    expect(cad.state().commandLine.prompt).toBe(
      "-EDITSOMB Indique opción de sombreado [Disociar/Propiedades] <Propiedades>:"
    )
    written(cad, "")
    expect(cad.state().commandLine.prompt).toBe(
      "-EDITSOMB Indique nombre de patrón o [?/Sólido] <varía>"
    )
  })
})
