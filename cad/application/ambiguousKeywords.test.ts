import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
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

    const array = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    array.command("ARRAYRECT")
    answerLine(array, "L", "", "CO", "COL")
    expect(array.commandLog().slice(-2)).toEqual([
      "Ambiguous response, please clarify...",
      "COUnt or COLumns? COL",
    ])
  })

  // AutoCAD 2023's console (acc/t1, t3, t5): it asks in the words its
  // keywords are declared with, in their declared order.
  it("names the declared words, which the prompt lists otherwise", () => {
    const text = createHarness()
    text.command("TEXT")
    answerLine(text, "J")
    expect(text.state().commandLine.prompt).toBe(
      "TEXT Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:"
    )
    answerLine(text, "T", "TLE")
    expect(text.commandLog().slice(-2)).toEqual([
      "Ambiguous response, please clarify...",
      "TLeft or TCenter or TRight? TLE",
    ])
    expect(text.state().commandLine.prompt).toBe(
      "TEXT Specify top-left point of text:"
    )

    const attdef = createHarness()
    attdef.command("ATTDEF")
    answerLine(attdef, "", "TAG1", "PROMPT1", "DEF", "J", "B")
    expect(attdef.state().commandLine.prompt).toBe(
      "ATTDEF BLeft or BCenter or BRight?"
    )

    const attdisp = createHarness()
    attdisp.command("ATTDISP")
    answerLine(attdisp, "O")
    expect(attdisp.state().commandLine.prompt).toBe("ATTDISP OFf or ON?")
    answerLine(attdisp, "OF")
    attdisp.command("ATTDISP")
    expect(attdisp.state().commandLine.prompt).toBe(
      "ATTDISP Enter attribute visibility setting [Normal/ON/OFF] <OFF>:"
    )

    const spanish = createHarness({ locale: es })
    spanish.command("TEXTO")
    answerLine(spanish, "U", "S")
    expect(spanish.state().commandLine.prompt).toBe(
      "TEXTO SIZquierda o SCentro o SDerecha?"
    )
    answerLine(spanish, "SIZQ")
    expect(spanish.state().commandLine.prompt).toBe(
      "TEXTO Precise punto superior izquierdo de texto:"
    )
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

  it("takes an object snap's name as the prompt's wrong answer", () => {
    const cad = plineArc()
    answerLine(cad, "C", "CENTER")
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose? CENTER",
      "2D point or option keyword required.",
    ])
    cad.type("C").enter().type("CEN").enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "CEnter or CLose? CEN",
      "2D point or option keyword required.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`PLINE ${ARC_PROMPT}`)
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

// AutoCAD 2023's console reads an object snap typed at a point prompt before
// the prompt's keywords: `CEN`, `CENT`, `CENTER` and `_CEN` at PLINE's arc
// prompt are the Center snap (`of`), not `CEnter`, and `CENTER` at ZOOM's
// first prompt is the snap although it spells the `Center` keyword whole.
describe("an object snap's name at a point prompt", () => {
  /** PLINE at its arc prompt from 0,0, a circle about 50,50 to snap to. */
  function arcBesideCircle(locale?: typeof es): CadHarness {
    const cad = createHarness({
      locale,
      entities: [circleOf(p(50, 50), 10)],
    })
    cad.command(locale ? "POL" : "PLINE")
    return answerLine(cad, "0,0", "A")
  }

  it.each(["CEN", "CENT", "CENTER", "_CEN", "cen"])(
    "is the snap, not a keyword it starts: %s",
    (typed) => {
      const cad = arcBesideCircle()
      const prompt = cad.state().commandLine.prompt
      answerLine(cad, typed)
      expect(cad.state().commandLine.prompt).toBe(prompt)
      cad.click(p(60, 50.5))
      expect(cad.commandLog().at(-1)).toMatch(new RegExp(`\\]: ${typed} of$`))
      const [, end] = cad.enter().only<PolylineEntity>("polyline").vertices
      expect(end).toBeCloseToPoint(p(50, 50))
    }
  )

  it("is the snap where it spells a keyword whole", () => {
    const cad = createHarness({ entities: [circleOf(p(50, 50), 10)] })
    cad.command("ZOOM")
    answerLine(cad, "CENTER")
    expect(cad.state().commandLine.prompt).toContain("Specify corner of window")
  })

  it("leaves the keyword to what names no snap", () => {
    const cad = arcBesideCircle()
    answerLine(cad, "CE")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify center point of arc:"
    )
  })

  it("is the snap in Spanish", () => {
    const cad = arcBesideCircle(es)
    const prompt = cad.state().commandLine.prompt
    answerLine(cad, "CEN")
    expect(cad.state().commandLine.prompt).toBe(prompt)
    // `CENTRO` spells both the snap and `cEntro`, which `E` names.
    answerLine(cad, "CENTRO")
    expect(cad.state().commandLine.prompt).toBe(prompt)
    answerLine(cad, "E")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto central del arco:"
    )
  })
})
