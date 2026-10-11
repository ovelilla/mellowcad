import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { PolylineEntity } from "../domain/entities"
import { es } from "../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const ARC_PROMPT =
  "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Line/Radius/Second pt/Undo]:"

/** PLINE at its arc prompt, one line drawn, so CLose is offered. */
function plineArc(): CadHarness {
  const cad = createHarness()
  cad.command("PLINE")
  return answerLine(cad, "0,0", "10,0", "A")
}

// AutoCAD 2023's console: what starts several keywords on offer — `C` for
// CEnter and CLose — is `Ambiguous response, please clarify...` and the
// question which, answered by any keyword of the prompt; Enter is `Invalid
// option keyword.` and asks again; anything else is the prompt's own wrong
// answer.
describe("an answer that starts several keywords", () => {
  it("asks which one was meant, and takes it", () => {
    const cad = plineArc()
    answerLine(cad, "C")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ARC_PROMPT} C`,
      "Ambiguous response, please clarify...",
    ])
    expect(cad.state().commandLine.prompt).toBe("PLINE CEnter or CLose?")

    answerLine(cad, "CE")
    expect(cad.commandLog().at(-1)).toBe("CEnter or CLose? CE")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify center point of arc:"
    )
  })

  it("takes the word, `_` and the global one, or another keyword", () => {
    const cad = plineArc()
    answerLine(cad, "C", "close")
    // No tangent arc leaves the one line back to its start: the console's
    // `*Invalid*`, and the polyline closed by a line.
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose? close",
      "*Invalid*",
    ])
    expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)

    const global = plineArc()
    answerLine(global, "C", "_CE")
    expect(global.state().commandLine.prompt).toBe(
      "PLINE Specify center point of arc:"
    )

    const other = plineArc()
    answerLine(other, "C", "A")
    expect(other.state().commandLine.prompt).toBe(
      "PLINE Specify included angle:"
    )
  })

  it("asks again after Enter, or after an answer as ambiguous", () => {
    const cad = plineArc()
    answerLine(cad, "C")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose?",
      "Invalid option keyword.",
    ])
    answerLine(cad, "", "C")
    expect(cad.commandLog().slice(-4)).toEqual([
      "CEnter or CLose?",
      "Invalid option keyword.",
      "CEnter or CLose? C",
      "Ambiguous response, please clarify...",
    ])
    expect(cad.state().commandLine.prompt).toBe("PLINE CEnter or CLose?")
  })

  it("refuses anything else as the prompt does, and asks the prompt again", () => {
    const cad = plineArc()
    answerLine(cad, "C", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose? FOO",
      "2D point or option keyword required.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`PLINE ${ARC_PROMPT}`)

    answerLine(cad, "C", "5,5")
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose? 5,5",
      "2D point or option keyword required.",
    ])
    cad.type("C").enter().click(p(5, 5))
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose?",
      "2D point or option keyword required.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`PLINE ${ARC_PROMPT}`)
  })

  it("takes the start of a lone keyword as far as its first capital", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answerLine(cad, "0,0", "A", "C")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify center point of arc:"
    )
    cad.escape().command("CIRCLE")
    answerLine(cad, "3")
    expect(cad.state().commandLine.prompt).not.toContain("on circle")
  })

  it("lists every keyword it starts, hidden ones too", () => {
    const cad = createHarness()
    cad.command("UCSICON")
    answerLine(cad, "O", "")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Enter an option [ON/OFF/Noorigin/ORigin] <ON>: O",
      "Ambiguous response, please clarify...",
      "ON or OFF or ORigin?",
      "Invalid option keyword.",
    ])
    answerLine(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "ON or OFF or ORigin? FOO",
      "Invalid option keyword.",
    ])

    // AutoCAD names its declared words here, `TLeft or TCenter or TRight?`.
    const text = createHarness()
    text.command("TEXT")
    answerLine(text, "J", "T")
    expect(text.state().commandLine.prompt).toBe("TEXT TL or TC or TR?")

    const array = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    array.command("ARRAYRECT")
    answerLine(array, "L", "", "CO", "COL")
    expect(array.commandLog().slice(-2)).toEqual([
      "Ambiguous response, please clarify...",
      "COUnt or COLumns? COL",
    ])
  })

  it("is answered in the box too", () => {
    const cad = plineArc()
    cad.type("C").enter()
    expect(cad.state().commandLine.prompt).toBe("PLINE CEnter or CLose?")
    cad.type("CE").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify center point of arc:"
    )
  })

  it("asks in Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("POL")
    answerLine(cad, "0,0", "10,0", "A", "CE")
    expect(cad.commandLog().at(-1)).toBe("Respuesta ambigua, especifique...")
    expect(cad.state().commandLine.prompt).toBe("POL cEntro o Cerrar?")
    answerLine(cad, "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "cEntro o Cerrar?",
      "Opción no válida.",
    ])
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Se requiere un punto 2D o una opción."
    )
    answerLine(cad, "CE", "E")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto central del arco:"
    )
  })
})
