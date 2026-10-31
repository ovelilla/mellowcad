import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
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
