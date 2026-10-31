import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p, polylineOf } from "../../test/builders"
import { createSpline } from "../domain/entities"
import { ptBR } from "../locales/pt-BR"

// The prompts English words alike in several commands and Brazilian
// Portuguese AutoCAD 2027 words per command, each with an id of its own, and
// the keywords one pt-BR prompt spells otherwise (research/console/pt-BR.md;
// the probes named in each case, pt-BR against en-US).

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const run = (command: string, ...answers: string[]) =>
  answer(createHarness({ locale: ptBR }).command(command), ...answers)

describe("Brazilian Portuguese prompts worded per command", () => {
  it("words LINE's, PLINE's and DIST's next point apart (3dpoly/p13, corners/p166, inquiry/p115)", () => {
    expect(asked(run("LINHA", "0,0"))).toBe(
      "LINHA Especificar próximo ponto ou [Desfazer]:"
    )
    expect(asked(run("PLINHA", "0,0"))).toBe(
      "PLINHA Especificar o próximo ponto ou [Arco/Meialargura/Comprimento/Desfazer/LArgura]:"
    )
    expect(asked(run("DIST", "0,0", "M"))).toBe(
      "DIST Especifique o próximo ponto ou [Arco/Comprimento/Desfazer/Total] <Total>:"
    )
  })

  it("words AREA's next point by whether it offers Total, and its first corner apart from RECTANG's (inquiry/p206, hatch/p103)", () => {
    expect(asked(run("AREA"))).toBe(
      "AREA Especificar o primeiro ponto do canto ou [Objeto/Adicionar área/Subtrair área] <Objeto>:"
    )
    expect(asked(run("AREA", "0,0"))).toBe(
      "AREA Especificar próximo ponto ou [Desfazer]:"
    )
    expect(asked(run("AREA", "0,0", "10,0", "10,10"))).toBe(
      "AREA Especifique o próximo ponto ou [Desfazer/Total] <Total>:"
    )
    expect(asked(run("AREA", "A", "0,0"))).toBe(
      "AREA (modo ADICIONAR)Especificar próximo ponto ou [Desfazer]:"
    )
    expect(asked(run("AREA", "A", "0,0", "10,0", "10,10"))).toBe(
      "AREA (modo ADICIONAR)Especifique o próximo ponto ou [Desfazer/Total] <Total>:"
    )
    expect(asked(run("RETANGULO"))).toBe(
      "RETANGULO Especificar primeiro canto ou [CHanfro/Elevação/COncordância/espessURa/Largura]:"
    )
  })

  it("words COPY's base and second points apart from MOVE's and STRETCH's (move/p114, p123)", () => {
    const base = (command: string) => {
      const cad = createHarness({
        locale: ptBR,
        entities: [lineOf(p(0, 0), p(10, 0))],
      })
      return asked(answer(cad.command(command), "_L", ""))
    }
    expect(base("COPIAR")).toBe(
      "COPIAR Especificar um ponto base ou [Descolamento] <Deslocamento>:"
    )
    expect(base("MOVER")).toBe(
      "MOVER Especificar ponto base ou [Deslocamento] <Deslocamento>:"
    )
    expect(base("ESTICAR")).toBe(
      "ESTICAR Especificar ponto base ou [Deslocamento] <Deslocamento>:"
    )
    const second = (command: string) => {
      const cad = createHarness({
        locale: ptBR,
        entities: [lineOf(p(0, 0), p(10, 0))],
      })
      return asked(answer(cad.command(command), "_L", "", "0,0"))
    }
    expect(second("COPIAR")).toMatch(
      /<usar primeiro ponto como deslocamento>:$/
    )
    expect(second("MOVER")).toMatch(
      /<utilizar primeiro ponto como deslocamento>:$/
    )
  })

  it("words PLINE's and DIST's arc center apart from ARC's (pline/p133, p145, arc/p140)", () => {
    expect(asked(run("PLINHA", "0,0", "A", "CE"))).toBe(
      "PLINHA Especificar o centro do arco:"
    )
    expect(asked(run("DIST", "0,0", "M", "A", "CE"))).toBe(
      "DIST Especificar o centro do arco:"
    )
    expect(asked(run("ARCO", "C"))).toBe(
      "ARCO Especificar ponto central do arco:"
    )
  })

  it("lists what pt-BR declares otherwise, as its console does (ucs/p350, blocks/p04, pline/p145, spline-knots/k114)", () => {
    expect(asked(run("ICONEUCS"))).toBe(
      "ICONEUCS Insira uma opção [ATIVADO/DESATIVADO/Sem origem/Origem] <ATIVADO>:"
    )
    expect(asked(run("VISATRIB"))).toMatch(/\[Normal\/ATivado\/Desativado\]/)
    expect(asked(run("DIST", "0,0", "M", "A"))).toMatch(
      /\[âNgulo\/CEntro\/DIreção\/LInha\/Raio\/Segundo pto\/Desfazer\]:$/
    )
  })

  it("words TEXT's justification, UCSICON's and NAVVCUBE's option apart from UCS's and POLYGON's (text/p104, ucs/p350, view/p268, ucs/p231, polygon/p138)", () => {
    expect(asked(run("TEXTO", "J"))).toMatch(/^TEXTO Insira uma opção \[/)
    expect(asked(run("-DEFATRIB", "", "TAG", "", "", "J"))).toMatch(
      /^-DEFATRIB Insira uma opção \[/
    )
    expect(asked(run("ICONEUCS"))).toMatch(/^ICONEUCS Insira uma opção \[/)
    expect(asked(run("CUBONAV"))).toMatch(/^CUBONAV Insira uma opção \[/)
    expect(asked(run("UCS", "NOM"))).toBe(
      "UCS Inserir uma opção [Restaurar/Salvar/Excluir/?]:"
    )
    expect(asked(run("POLIGONO", "5", "0,0"))).toBe(
      "POLIGONO Inserir uma opção [Inscrito no círculo/Circunscrito sobre o círculo] <I>:"
    )
  })

  it("words cuTting edges' selection apart from the one TRIM starts with (trim/p108, p152)", () => {
    const cad = run("APARAR", "O", "P")
    cad.escape()
    expect(asked(cad.command("APARAR"))).toBe(
      "APARAR Selecionar objetos ou [mOdo] <selecionar tudo>:"
    )
    expect(asked(run("APARAR", "A"))).toBe(
      "APARAR Selecione objetos ou <selecionar tudo>:"
    )
    expect(asked(run("ESTENDER", "A"))).toBe(
      "ESTENDER Selecione objetos ou <selecionar tudo>:"
    )
  })
})

describe("Brazilian Portuguese keywords spelled per prompt", () => {
  const abbreviations = (cad: CadHarness) => cad.optionAbbreviations()

  it("takes UCS's and -VIEW's Top, BAck and Left by their Orthographic words (ucs/p153, view/p268)", () => {
    expect(abbreviations(run("UCS", "ORT"))).toEqual([
      "S",
      "I",
      "F",
      "P",
      "E",
      "D",
    ])
    expect(abbreviations(run("-VISTA", "O"))).toEqual([
      "S",
      "I",
      "F",
      "P",
      "E",
      "D",
    ])
  })

  it("takes UCS's ZAxis as EIxoz at New's prompt, listed EIxo z, eixOZ at its first (ucs/p225, 3dpoly/p22)", () => {
    const cad = run("UCS", "NO")
    expect(asked(cad)).toBe(
      "UCS Especificar origem do novo UCS ou [EIxo z/3pontos/OBjeto/Face/Vista/X/Y/Z] <0,0,0>:"
    )
    expect(abbreviations(cad)[0]).toBe("EI")
    expect(cad.state().commandOptions[0]?.label).toBe("EIxo z")
    expect(asked(answer(cad, "EIXOZ"))).toMatch(/^UCS Especificar novo ponto/)
  })

  it("takes PEDIT's eXit as SAir at Straighten's prompt, Sair at the vertex's (pedit/p101)", () => {
    const cad = createHarness({
      locale: ptBR,
      entities: [
        polylineOf([p(0, 0), p(10, 0), p(20, 0), p(30, 0)], { id: "P" }),
      ],
    })
    cad.command("EDITARP").click(p(5, 0)).option("Edit vertex")
    expect(asked(cad)).toMatch(/\[Próximo\/.*\/Sair\] <P>:$/)
    expect(abbreviations(cad).at(-1)).toBe("S")
    cad.option("Straighten")
    expect(asked(cad)).toBe(
      "EDITARP Inserir uma opção [Próximo/Anterior/Ir/SAir] <P>:"
    )
    expect(abbreviations(cad).at(-1)).toBe("SA")
  })

  it("takes SPLINEDIT's eXit as Sair at Weight's and Move's prompts, saIr at the vertex's (inquiry/p429, spline-knots/k137)", () => {
    const cad = createHarness({
      locale: ptBR,
      entities: [
        createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)], {
          id: "S",
        }),
      ],
    })
    cad.command("EDITARSPLINE").click(p(0, 0)).option("Edit vertex")
    expect(asked(cad)).toMatch(/\/saIr\] <saIr>:$/)
    cad.option("Weight")
    expect(asked(cad)).toMatch(
      /^EDITARSPLINE Inserir novo peso \(atual = 1\.00\) ou \[Próximo\/Anterior\/SElecionar ponto\/Sair\] <P>:$/
    )
    answer(cad, "S")
    expect(asked(cad)).toMatch(/\/saIr\] <saIr>:$/)
    cad.option("Move")
    expect(asked(cad)).toMatch(
      /^EDITARSPLINE Especificar nova localização ou \[Próximo\/Anterior\/SElecionar ponto\/Sair\] <P>:$/
    )
  })
})

describe("Brazilian Portuguese object snaps", () => {
  it("are typed by their three capitals, so a keyword's letter stays a keyword (names/p09)", () => {
    expect(asked(run("PLINHA", "0,0", "A"))).toMatch(
      /^PLINHA Especificar ponto final do arco/
    )
    const cad = createHarness({
      locale: ptBR,
      entities: [lineOf(p(0, 0), p(10, 0))],
    })
    answer(cad.command("LINHA"), "MEI", "5,0.1", "20,20", "")
    expect(cad.latest()).toMatchObject({ start: p(5, 0) })
  })

  it("lists the running modes by their short names, in OSMODE's order (names/p07, p10)", () => {
    const cad = run("-OSNAP", "EXT,INS,APA,INT,QUA,PER,MAI,PAR")
    cad.command("-OSNAP")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de osnap atuais: Quadrante,Intersecção,Inserção,Perpendicular,Mais próximo,Aparente,Ext,Paralela"
    )
  })
})

// What no review's probe printed, probed in both languages for pt-BR.
describe("Brazilian Portuguese words only these probes print", () => {
  it("asks MATCHPROP's source in its console's words (names/p21)", () => {
    const cad = createHarness({
      locale: ptBR,
      entities: [lineOf(p(0, 0), p(10, 0))],
    })
    expect(asked(cad.command("PROPIG"))).toBe(
      "PROPIG Selecionar o objeto de origem:"
    )
    cad.click(p(5, 0))
    expect(cad.commandLog().at(-1)).toBe(
      "Configurações ativas atuais:  Cor Camada Tipolinha Espessura de linha Espessura Cota Texto Hachura"
    )
  })

  it("refuses a 3D polyline at CHAMFER as its console fills the table's words (names/p17)", () => {
    const cad = run("POLI3D", "0,0", "100,0", "100,100", "")
    answer(cad, "CHANFRO", "50,0")
    expect(cad.commandLog()).toContain(
      "  Objetos Polilinha 3D não podem ser chanfrado."
    )
  })
})
