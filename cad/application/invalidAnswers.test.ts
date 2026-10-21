import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { arcOf, lineOf, p } from "../../test/builders"
import { es } from "../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answerLine(cad: CadHarness, text: string): CadHarness {
  cad.runtime.setCommandLineText(text)
  cad.runtime.submitCommandLine()
  return cad
}

const twoLines = () => [
  lineOf(p(0, 0), p(100, 0), { id: "A" }),
  lineOf(p(0, 0), p(0, 100), { id: "B" }),
]

const SELECTION_MODES =
  "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle"

// AutoCAD reads a command name only at the Command prompt: mid-command, what
// is neither a keyword nor what the question asks is a wrong answer, refused
// in the words of the input function behind the question (AutoCAD 2023's
// console), and the question is asked again.
describe("a wrong answer mid-command", () => {
  // probe line/p09, p103
  it("is refused at a point prompt, never run as a command", () => {
    const cad = createHarness()
    cad.command("LINE")
    answerLine(cad, "FOO")
    expect(cad.commandLog()).toEqual([
      "LINE",
      "Specify first point: FOO",
      "Invalid point.",
    ])

    cad.click(p(0, 0))
    for (const typed of ["FOO", "CIRCLE", "_LINE"]) {
      answerLine(cad, typed)
      expect(cad.commandLog().slice(-2)).toEqual([
        `Specify next point or [Undo]: ${typed}`,
        "Point or option keyword required.",
      ])
    }
    expect(cad.activeToolId()).toBe("line")
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
  })

  it("is refused the same typed into the box", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).type("FOO").enter()

    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]: FOO",
      "Point or option keyword required.",
    ])
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("")
  })

  it("asks for a 2D point where AutoCAD's later points are 2D", () => {
    const cad = createHarness()
    cad.command("ARC").click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("2D point or option keyword required.")
    cad.escape()

    const mirror = createHarness({ entities: twoLines() })
    mirror.select("A").command("MIRROR")
    answerLine(mirror, "FOO")
    expect(mirror.commandLog().at(-1)).toBe("Invalid 2D point.")
    mirror.click(p(0, 50)).click(p(100, 50))
    answerLine(mirror, "FOO")
    expect(mirror.commandLog().at(-1)).toBe("Invalid option keyword.")
  })

  it("asks for a 2D point at CIRCLE's later 2P and 3P points", () => {
    // probes circle/p121, p122 (FOO), p133 (_U), p137 (`<45`, no base point
    // there to turn about), en and es.
    for (const [locale, refusal] of [
      [undefined, "Invalid 2D point."],
      [es, "Punto 2D no válido."],
    ] as const) {
      const cad = createHarness(locale ? { locale } : {})
      for (const typed of ["_CIRCLE", "_3P", "0,0", "FOO"])
        answerLine(cad, typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      for (const typed of ["10,0", "FOO", "_U"]) answerLine(cad, typed)
      expect(cad.commandLog().slice(-3)).toEqual([
        refusal,
        expect.any(String),
        refusal,
      ])
      cad.escape()

      for (const typed of ["_CIRCLE", "_2P", "0,0", "<45"])
        answerLine(cad, typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.activeToolId()).toBe("circle")
    }
  })

  it("names what a distance or an angle takes, from a base point or not", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("OFFSET")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance, two points, or option keyword."
    )
    cad.escape()

    cad.select("A").command("ROTATE").click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle, second point, or option keyword."
    )
    cad.option("Reference")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or two points."
    )
    cad.escape()

    cad.select("A").command("SCALE").click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance, second point, or option keyword."
    )
    cad.option("Reference")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance or two points."
    )
  })

  it("never reads it off the cursor as a value", () => {
    const cad = createHarness({ entities: twoLines() })
    const drawing = () => JSON.stringify(cad.runtime.document.getEntities())
    const before = drawing()

    cad.select("A").command("MOVE").click(p(0, 0)).moveTo(p(50, 50))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid point.")
    cad.escape()
    cad.select("A").command("ROTATE").click(p(0, 0)).moveTo(p(50, 50))
    cad.type("FOO").enter()
    cad.escape()
    cad.select("A").command("SCALE").click(p(0, 0)).moveTo(p(50, 50))
    cad.type("FOO").enter()
    cad.escape()

    expect(drawing()).toBe(before)
  })

  it("keeps CIRCLE's and POLYGON's own words", () => {
    // probes circle/p113 (the radius), p118 (the diameter), p194 (Ttr).
    const cad = createHarness()
    cad.command("CIRCLE").click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      'Requires numeric radius, point on circumference, or "D".'
    )
    cad.option("Diameter")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance or second point."
    )
    cad.escape()

    cad.command("POLYGON")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires an integer between 3 and 1024."
    )
    cad.escape().command("CIRCLE").option("Ttr")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires a TAN object-snap and selection of Circle, Arc, or Line."
    )
    cad.escape().command("SPLINE").option("Method")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
  })

  it("refuses a point at Ttr's tangents in AutoCAD's starred words", () => {
    // probe circle/p300, en and es: a typed point picks no object there.
    const english = createHarness()
    english.command("CIRCLE").option("Ttr")
    answerLine(english, "0,10")
    expect(english.commandLog().slice(-2)).toEqual([
      "Specify point on object for first tangent of circle: 0,10",
      "*Requires a TAN object-snap and selection of Circle, Arc, or Line.",
    ])

    const spanish = createHarness({ locale: es })
    spanish.command("CIRCULO").option("Ttr")
    answerLine(spanish, "0,10")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "Precise punto en objeto para la primera tangente del círculo: 0,10",
      "*Necesita una referencia a un objeto tangente y que se designe un círculo, arco o línea.",
    ])
  })

  it("expects a point or the selection modes at Select objects", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("ERASE")
    answerLine(cad, "LINE")
    expect(cad.commandLog()).toEqual([
      "ERASE",
      "Select objects: LINE",
      "*Invalid selection*",
      `Expects a point or ${SELECTION_MODES}/SUbobject/Object`,
    ])
    cad.escape().command("MIRROR")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      `Expects a point or ${SELECTION_MODES}`
    )
    cad.escape().command("STRETCH")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      `Expects a point or ${SELECTION_MODES.replace("/Group", "")}`
    )
  })

  it("expects a point or the prompt's keywords where one object is picked", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("OFFSET").type("10").enter()
    answerLine(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Exit/Undo",
    ])
    cad.escape().command("FILLET")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius"
    )
  })

  it("expects BREAK's set of one object, and a point or First point after", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("BREAK")
    answerLine(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
    ])
    cad.click(p(50, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")
    cad.option("First point")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid point.")
  })

  it("refuses at the arrays' prompts as AutoCAD's console does", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.select("A").command("ARRAYRECT")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")
    cad.option("COUnt")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires a positive nonzero integer or option keyword."
    )
    cad.escape().select("A").command("ARRAYPATH")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Previous/AUto"
    )
  })

  it("refuses at -HATCH's prompts as AutoCAD's console does", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("HATCH")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("2D point or option keyword required.")
    cad.option("Properties").enter()
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Requires a distance (or numberX).")
    cad.enter()
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or two points."
    )
  })

  it("refuses at the dimension commands' prompts as AutoCAD's console does", () => {
    const cad = createHarness({ entities: twoLines() })
    cad.command("DIMLINEAR")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid point input.")
    cad.click(p(0, 0)).click(p(100, 0)).option("Angle")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid Input.")
    cad.escape().command("DIMRADIUS")
    answerLine(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a single object.",
    ])
    cad.escape().command("DIMSPACE")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Expects a point or Last")
  })

  // WHY no refusal: AutoCAD 2023's console takes it, saying nothing (acc/th3
  // of the TRIM options session).
  it("leaves U to TRIM's prompt, which takes it with nothing to undo", () => {
    const cad = createHarness({
      entities: [...twoLines(), lineOf(p(50, -50), p(50, 50), { id: "C" })],
    })
    cad.command("LINE").click(p(200, 0)).click(p(300, 0)).escape()
    const entities = cad.entityCount

    cad.command("TRIM")
    answerLine(cad, "U")

    expect(cad.commandLog().slice(-2)).toEqual([
      "Current settings: Projection=UCS, Edge=None, Mode=Quick",
      "Select object to trim or shift-select to extend or [cuTting edges/Crossing/mOde/eRase]: U",
    ])
    expect(cad.entityCount).toBe(entities)
    expect(cad.activeToolId()).toBe("trim")
  })

  it("asks Continue's length again from an arc", () => {
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 50, 0, Math.PI / 2)],
    })
    cad.command("LINE").enter()
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires numeric distance or second point."
    )
  })
})

describe("a wrong answer in Spanish", () => {
  it("is refused in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({ locale: es, entities: twoLines() })
    cad.command("LINEA")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Punto no válido.")
    cad.click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Se requiere un punto o una opción.")
    cad.escape()

    cad.command("BORRA")
    answerLine(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Designación no válida*",
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC/Grupo/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico/Subobjeto/Objeto",
    ])
    cad.escape()

    cad.command("DESFASE")
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requiere una distancia numérica, dos puntos o una opción."
    )
    cad.escape()

    cad.command("POLIGONO").enter().click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe("Opción no válida.")
    cad.escape()

    cad.command("CIRCULO").click(p(0, 0))
    answerLine(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      'Precisa un radio numérico, un punto en la circunferencia, o "D".'
    )
  })
})
