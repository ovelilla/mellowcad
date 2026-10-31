import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import type { EngineLocale } from "../locales/types"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

// How a prompt writes its default is each language's string, not the
// command's (`commands.promptForms`): English and Spanish write UCS's and
// -VIEW's against what precedes it where pt-BR spaces them (tables 25630,
// 25632, 25634, 26548), and the arrays' main prompt the other way round
// (AcArrayRes 5632, 5644, 5651). Answered with `_`, so every language takes
// one path.

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (locale: EngineLocale | undefined, ...answers: string[]) =>
  answer(createHarness({ locale }), ...answers).state().commandLine.prompt

describe("the form of a prompt's default, per language", () => {
  it("writes UCS Move's origin and Zdepth against the default in English and Spanish, spaced in pt-BR (ucs/p210, p211)", () => {
    expect(asked(undefined, "_UCS", "_M")).toBe(
      "UCS Specify new origin point or [Zdepth]<0,0,0>:"
    )
    expect(asked(es, "_UCS", "_M")).toBe(
      "SCP Precise nuevo punto de origen o [profundidadZ]<0,0,0>:"
    )
    expect(asked(ptBR, "_UCS", "_M")).toBe(
      "UCS Especificar novo ponto de origem ou [profundidadeZ] <0,0,0>:"
    )
    expect(asked(undefined, "_UCS", "_M", "_Z")).toBe("UCS Specify Zdepth<0>:")
    expect(asked(es, "_UCS", "_M", "_Z")).toBe("SCP Precise profundidadZ<0>:")
    expect(asked(ptBR, "_UCS", "_M", "_Z")).toBe(
      "UCS Especificar profundidadeZ <0>:"
    )
  })

  it("writes UCS's and -VIEW's Orthographic default against the list but in pt-BR (ucs/p106, p153, view/p268)", () => {
    expect(asked(undefined, "_UCS", "_G")).toBe(
      "UCS Enter an option [Top/Bottom/Front/BAck/Left/Right]<Top>:"
    )
    expect(asked(es, "_UCS", "_G")).toBe(
      "SCP Indique una opción [SUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<Superior>:"
    )
    expect(asked(es, "_-VIEW", "_O")).toBe(
      "-VISTA Indique una opción [sUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<sUperior>:"
    )
    expect(asked(ptBR, "_UCS", "_G")).toBe(
      "UCS Inserir uma opção [Superior/Inferior/Frontal/Posterior/Esquerdo/Direito] <Superior>:"
    )
    expect(asked(ptBR, "_-VIEW", "_O")).toBe(
      "-VISTA Inserir uma opção [Superior/Inferior/Frontal/Posterior/Esquerda/Direita] <Superior>:"
    )
  })

  it("writes the arrays' main prompt against its default in English and pt-BR, spaced in Spanish (arrays/p01, p100)", () => {
    const main = (locale: EngineLocale | undefined) => {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
      })
      cad.select("L1")
      return answer(cad, "_ARRAYRECT").state().commandLine.prompt
    }
    expect(main(undefined)).toMatch(/\/eXit\]<eXit>:$/)
    expect(main(es)).toMatch(/\/Salir\] <Salir>:$/)
    expect(main(ptBR)).toMatch(/\/saIr\]<saIr>:$/)
  })

  it("leaves no colon after a yes-or-no default in every language (line/p109)", () => {
    expect(asked(undefined, "_UNDO", "_B")).toBe(
      "UNDO This will undo everything. OK? <Y>"
    )
    expect(asked(es, "_UNDO", "_B")).toBe(
      "DESHACER Esto lo deshará todo. ¿De acuerdo? <S>"
    )
    expect(asked(ptBR, "_UNDO", "_B")).toBe(
      "DESFAZER Isto irá desfazer tudo. OK? <S>"
    )
  })
})

// Where a language's prompt string ends without a space after its colon, the
// history writes the answer against it (`commands.answerForms`): DIMSPACE's
// and -DIMSTYLE's redefine in every language (AcDimRes 5994, 5995, 5303;
// dimensions/p06, p260), PEDIT's first prompt, MREDO's, ARRAYPATH's main
// prompt and ARRAYRECT's rows at Spacing only in pt-BR (21229, 26256,
// AcArrayRes 5644, 5718; pedit/p18, names/p11 and the desktop's d05,
// arrays/p116, p332), the unit cell only in Spanish (5717, arrays/p157).
describe("the history's answer after a prompt, per language", () => {
  const written = (cad: CadHarness, ...answers: string[]) => {
    const from = cad.commandLog().length
    answer(cad, ...answers)
    return cad.commandLog().slice(from)
  }
  const first = (locale: EngineLocale | undefined, ...answers: string[]) =>
    written(createHarness({ locale }), ...answers)[1]

  it("writes DIMSPACE's answers against the colon in every language (dimensions/p260)", () => {
    expect(first(undefined, "_DIMSPACE", "50,-40")).toBe(
      "Select base dimension:50,-40"
    )
    expect(first(es, "_DIMSPACE", "50,-40")).toBe("Designar cota base:50,-40")
    expect(first(ptBR, "_DIMSPACE", "50,-40")).toBe(
      "Selecionar a cota de base:50,-40"
    )
  })

  it("writes -DIMSTYLE's redefine answer against the colon in every language (dimensions/p06)", () => {
    const redefine = (locale: EngineLocale | undefined) => {
      const cad = answer(createHarness({ locale }), "_-DIMSTYLE", "_S", "A")
      return written(cad, "_-DIMSTYLE", "_S", "A", "_N").at(-1)
    }
    expect(redefine(undefined)).toBe(
      "That name is already in use, redefine it? <N>:_N"
    )
    expect(redefine(es)).toBe(
      "Este nombre está ya en uso; ¿redefinirlo? <N>:_N"
    )
    expect(redefine(ptBR)).toBe(
      "Este nome já está sendo usado, redefini-lo? <N>:_N"
    )
  })

  it("writes PEDIT's and MREDO's answers against the colon in pt-BR only (pedit/p18, names/p11)", () => {
    expect(first(undefined, "_PEDIT", "_M")).toBe(
      "Select polyline or [Multiple]: _M"
    )
    expect(first(es, "_PEDIT", "_M")).toBe("Designe polilínea o [Múltiple]: _M")
    expect(first(ptBR, "_PEDIT", "_M")).toBe(
      "Selecionar polilinha ou [Múltiplo]:_M"
    )

    const redone = (locale: EngineLocale | undefined) =>
      written(
        answer(createHarness({ locale }), "_LINE", "0,0", "10,0", "", "_U"),
        "_MREDO",
        "_L"
      )[1]
    expect(redone(undefined)).toBe("Enter number of actions or [All/Last]: _L")
    expect(redone(ptBR)).toBe("Digitar número de ações ou [Tudo/úLtimo]:_L")
  })

  it("writes ARRAYPATH's main answer against the colon in pt-BR, ARRAYRECT's past a space (arrays/p332)", () => {
    const main = (locale: EngineLocale | undefined, command: string) => {
      const cad = createHarness({
        locale,
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "P" }),
          circleOf(p(10, 10), 2, { id: "C" }),
        ],
      })
      cad.select("C")
      answer(cad, command, ...(command === "_ARRAYPATH" ? ["30,0"] : []))
      return written(cad, "2.5")[0]
    }
    expect(main(ptBR, "_ARRAYPATH")).toMatch(/\/saIr\]<saIr>:2\.5$/)
    expect(main(ptBR, "_ARRAYRECT")).toMatch(/\/saIr\]<saIr>: 2\.5$/)
    expect(main(undefined, "_ARRAYPATH")).toMatch(/\/eXit\]<eXit>: 2\.5$/)
  })

  it("writes ARRAYRECT's rows at Spacing against the colon in pt-BR, Rows' past a space, and the unit cell's in Spanish (arrays/p116, p157)", () => {
    const rect = (locale: EngineLocale | undefined, ...answers: string[]) => {
      const cad = createHarness({
        locale,
        entities: [circleOf(p(10, 10), 2, { id: "C" })],
      })
      cad.select("C")
      answer(cad, "_ARRAYRECT")
      return written(cad, ...answers)
    }
    expect(rect(ptBR, "_S", "", "8")[2]).toBe(
      "Especifique a distância entre linhas <6>:8"
    )
    expect(rect(ptBR, "_R", "", "8")[2]).toBe(
      "Especificar a distância entre linhas <6>: 8"
    )
    expect(rect(undefined, "_S", "", "8")[2]).toBe(
      "Specify the distance between rows <6>: 8"
    )
    expect(rect(es, "_S", "_U", "0,0")[2]).toBe(
      "Precise primer punto de esquina de la celda de unidad:0,0"
    )
    expect(rect(undefined, "_S", "_U", "0,0")[2]).toBe(
      "Specify first corner point of unit cell: 0,0"
    )
  })
})
