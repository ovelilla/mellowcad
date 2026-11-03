import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { boxBrep, brepIsClosed, brepVolume } from "../geometry/solids"
import { brepSliced } from "../geometry/solidEdits"
import { brepMoments, solidInertia } from "../geometry/massProperties"
import type { Solid3dEntity } from "../domain/entities"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { snapshotOf } from "../../test/builders"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const solids = (cad: CadHarness) =>
  cad.entities().filter((e): e is Solid3dEntity => e.type === "solid3d")

const last = (cad: CadHarness) => solids(cad).at(-1)!

function console(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  cad.moveTo({ x: 289.98397, y: 116.30379 })
  return cad
}

function listed(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .slice(4)
    .flatMap((line) => line.split("\n"))
    .slice(4)
}

describe("EXTRUDE", () => {
  it("asks for the set and the height, and extrudes a rectangle (extrude/x01)", () => {
    const cad = console()
    answer(cad, "RECTANG", "0,0", "10,20")
    expect(written(cad, "EXTRUDE", "_L", "", "FOO", "5")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]: _L",
      "1 found",
      "Select objects to extrude or [MOde]:",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
    const solid = last(cad)
    expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(solid.brep)).toBeCloseTo(1000, 9)
    // DELOBJ 3: the rectangle is gone.
    expect(cad.entities()).toHaveLength(1)
    expect(listed(cad)).toEqual([
      "      Solid type = Extrusion",
      " Extrusion height: 5.0000",
      "      Taper angle: 0",
      "   Bounding Box: Lower Bound X = 0.0000   , Y = 0.0000   , Z = 0.0000",
      "                 Upper Bound X = 10.0000  , Y = 20.0000  , Z = 5.0000",
    ])
  })

  it("tapers a circle, the height offered again, and lists the taper round a turn (x01, x03)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "_T", "FOO", "10", "8")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _T",
      "Specify angle of taper for extrusion or [Expression] <0>: FOO",
      "Requires numeric distance, second point, or option keyword.",
      "Specify angle of taper for extrusion or [Expression] <0>: 10",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 8",
    ])
    const m = solidInertia(brepMoments(last(cad).brep))
    expect(brepVolume(last(cad).brep)).toBeCloseTo(467.7253, 4)
    expect(m.centroid.z).toBeCloseTo(3.566, 3)
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "_T", "90", "-30", "5")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <8.0000>: _T",
      "Specify angle of taper for extrusion or [Expression] <10>: 90",
      "Angle must be greater than -90 degrees and less than 90 degrees.",
      "Specify angle of taper for extrusion or [Expression] <10>: -30",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <8.0000>: 5",
    ])
    expect(listed(cad).slice(1, 3)).toEqual([
      " Extrusion height: 5.0000",
      "      Taper angle: 330",
    ])
  })

  it("ends a circle tapered shut at its apex, and makes nothing of a square it cannot take (x03, x06)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_T", "45", "10")
    expect(brepVolume(last(cad).brep)).toBeCloseTo((Math.PI * 25 * 5) / 3, 9)
    answer(cad, "RECTANG", "20,0", "30,10", "EXTRUDE", "_L", "", "_T", "60")
    expect(written(cad, "10")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <10.0000>: 10",
    ])
    expect(solids(cad)).toHaveLength(1)
    expect(cad.entities().map((e) => e.type)).toEqual(["solid3d", "polyline"])
  })

  it("refuses a height of nothing and takes an expression (x02, x03)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "0", "_E", "FOO", "2*3")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 0",
      "Value must be nonzero.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _E",
      "Enter expression: FOO",
      "The syntax is incorrect or a variable is not defined.  Reenter the expression or value.",
      "Enter expression: 2*3",
    ])
    expect(brepVolume(last(cad).brep)).toBeCloseTo(Math.PI * 25 * 6, 9)
  })

  it("extrudes along a direction, refusing coincident points and one along the plane (x02, x11)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_D", "0,0,0")
    expect(written(cad, "0,0,0", "3,0,4")).toEqual([
      "Specify end point of direction: 0,0,0",
      "Points are coincident.",
      "Specify end point of direction: 3,0,4",
    ])
    const box = last(cad).brep.vertices
    expect(box.length).toBe(2)
    expect(listed(cad)).toEqual([
      "      Solid type = Extrusion",
      " Extrusion height: 5.0000",
      "      Taper angle: 0",
      "   Bounding Box: Lower Bound X = -5.0000  , Y = -5.0000  , Z = 0.0000",
      "                 Upper Bound X = 8.0000   , Y = 5.0000   , Z = 4.0000",
    ])
    answer(cad, "CIRCLE", "0,100", "5", "EXTRUDE", "_L", "", "_D", "0,0,0")
    expect(written(cad, "5,0,0")).toEqual([
      "Specify end point of direction: 5,0,0",
      "Extrude direction is parallel to plane of sweep curve.",
    ])
    expect(solids(cad)).toHaveLength(1)
  })

  it("sifts what it cannot sweep as the set closes, and ends on an empty one (x10, x11)", () => {
    const cad = console()
    answer(cad, "LINE", "0,60", "10,80", "")
    expect(written(cad, "EXTRUDE", "_L", "", "")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]: _L",
      "1 found",
      "Select objects to extrude or [MOde]:",
      "Cannot sweep or extrude an object of this type.\n1 object removed from selection set.",
      "Select objects to extrude or [MOde]:",
      "Nothing selected.",
    ])
  })

  it("asks MOde and keeps Solid, its Surface refused (x02)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5")
    expect(written(cad, "EXTRUDE", "_MO", "_SU", "")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]: _MO",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>: _SU",
      "Invalid option keyword.",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>:",
    ])
  })

  it("keeps or asks to erase its profiles by DELOBJ (x07)", () => {
    const cad = console()
    answer(cad, "DELOBJ", "0", "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "5")
    expect(cad.entities()).toHaveLength(2)
    answer(cad, "DELOBJ", "-1", "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "5", "FOO", "_N")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <5.0000>: 5",
      "Erase defining objects? [Yes/No] <Yes>: FOO",
      "Invalid option keyword.",
      "Erase defining objects? [Yes/No] <Yes>: _N",
    ])
    expect(cad.entities()).toHaveLength(4)
    answer(cad, "CIRCLE", "100,0", "5", "EXTRUDE", "_L", "", "5")
    expect(written(cad, "")).toEqual(["Erase defining objects? [Yes/No] <No>:"])
    expect(cad.entities()).toHaveLength(6)
  })

  it("wears the current layer, undoes in one step and saves its history (x10)", () => {
    const cad = console()
    const zero = cad.state().currentLayerId
    cad.runtime.createLayer("L1")
    answer(cad, "CIRCLE", "0,0", "5")
    cad.runtime.setCurrentLayer(zero)
    answer(cad, "EXTRUDE", "_L", "", "5")
    expect(last(cad).layerId).toBe(zero)
    const document = cad.runtime.document
    const reread = parseDrawingFile(
      serializeDrawing(
        snapshotOf(document.getEntities(), { settings: document.getSettings() })
      )
    )
    const saved = reread.entities.find((e) => e.type === "solid3d")
    expect(saved).toEqual(last(cad))
    answer(cad, "U")
    expect(cad.entities().map((e) => e.type)).toEqual(["circle"])
  })

  it("asks in Spanish and Brazilian Portuguese (x01, x02)", () => {
    const spanish = console(es)
    answer(spanish, "RECTANG", "0,0", "10,20")
    expect(written(spanish, "EXTRUSION", "_L", "", "5")).toEqual([
      "EXTRUSION",
      "Densidad de estructura alámbrica actual: ISOLINES=4, Modo de creación de perfiles cerrados = Sólido",
      "Designe objetos para extruir o [MOdo]: _L",
      "1 encontrados",
      "Designe objetos para extruir o [MOdo]:",
      "Precise altura de extrusión o [Dirección/Trayectoria/ángulo Inclinación/Expresión]: 5",
    ])
    expect(
      written(spanish, "_LIST", "_L", "").flatMap((l) => l.split("\n"))
    ).toEqual(
      expect.arrayContaining([
        "    Tipo de sólido = Extrusión",
        "Altura de extrusión: 5.0000",
        "Ángulo Inclinación: 0",
      ])
    )
    const portuguese = console(ptBR)
    answer(portuguese, "CIRCULO", "0,0", "5")
    expect(written(portuguese, "EXTRUSAO", "_L", "", "5")).toEqual([
      "EXTRUSAO",
      "Densidade da estrutura de arame atual:  ISOLINES=4, Modo de criação de perfis fechados = Sólido",
      "Selecione objetos para extrusão ou [MOdo]: _L",
      "1 encontrado(s)",
      "Selecione objetos para extrusão ou [MOdo]:",
      "Especifique a altura ou extrusão ou [Direção/Caminho/ângulo de COnicidade/Expressão]: 5",
    ])
    answer(portuguese, "CIRCULO", "50,0", "5", "EXTRUSAO", "_L", "")
    expect(written(portuguese, "")).toEqual([
      "Especifique a altura da extrusão ou [Direção/Caminho/ângulo de COnicidade/Expressão] <5.0000>:",
    ])
  })
})

/** What `ID @` says LASTPOINT is. */
function lastPoint(cad: CadHarness): number[] {
  answer(cad, "ID", "@")
  const line = cad.commandLog().at(-1)!
  return [...line.matchAll(/-?\d+\.\d+/g)].map((m) => Number(m[0]))
}

function near(actual: number[], expected: number[], digits = 3) {
  expect(actual).toHaveLength(expected.length)
  actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i], digits))
}

/** LIST _L's history and box lines. */
function historyLines(cad: CadHarness): string[] {
  return written(cad, "_LIST", "_L", "")
    .flatMap((line) => line.split("\n"))
    .filter((l) => /Solid type|Extrusion height|Taper angle|Bound/.test(l))
}

describe("EXTRUDE's height base (the Sweeps review, EXT-01)", () => {
  // The base the height is measured from (probe sweeps/p107, p108: the
  // height prompt opening sets LASTPOINT there, a typed number keeps it).
  // AutoCAD: a polyline's base is the mean of 20 points at arc lengths k·L/19
  // along it, its start twice (fits p101, p102, p104, p105, x09's two arcs to
  // 1e-15); a spline's of 19 by parameter (x04); a circle's its centre (x07);
  // a region's its centroid (p103).
  const cases: [string, string[], string][] = [
    [
      "rectangle 0,0 10,20 (x01, p105)",
      ["RECTANG", "0,0", "10,20"],
      "131.4157",
    ],
    ["rectangle 10,20 0,0 (p104)", ["RECTANG", "10,20", "0,0"], "130.3097"],
    [
      "L polyline (p101)",
      ["PLINE", "0,0", "20,0", "20,5", "5,5", "5,15", "0,15", "_C"],
      "132.5929",
    ],
    ["triangle (p102)", ["PLINE", "0,0", "12,0", "3,9", "_C"], "135.9159"],
    [
      "L region (p103)",
      [
        "PLINE",
        "0,0",
        "20,0",
        "20,5",
        "5,5",
        "5,15",
        "0,15",
        "_C",
        "REGION",
        "_L",
        "",
      ],
      "132.5943",
    ],
    [
      "polyline with an arc (x09)",
      ["PLINE", "0,0", "10,0", "_A", "10,10", "_L", "0,10", "_C"],
      "133.5687",
    ],
    [
      "quarter disc (x09)",
      ["PLINE", "30,0", "40,0", "_A", "_CE", "30,0", "30,10", "_L", "_C"],
      "116.5229",
    ],
    [
      "closed fit spline (x04, x09)",
      ["SPLINE", "_M", "_F", "50,0", "60,5", "55,10", "45,8", "_C"],
      "105.9276",
    ],
    ["circle (x07)", ["CIRCLE", "50,0", "5"], "111.8034"],
    ["ellipse (x04)", ["ELLIPSE", "0,0", "10,0", "3"], "137.9311"],
  ]
  for (const [name, draw, height] of cases) {
    it(`100,100 picked for the height is its distance from AutoCAD's base: ${name}`, () => {
      const cad = console()
      answer(cad, ...draw, "EXTRUDE", "_L", "", "100,100")
      expect(historyLines(cad)[1]).toBe(` Extrusion height: ${height}`)
    })
  }

  it("a point in plan is its distance from the base (p107: 20,30 from a 10 × 20 rectangle is 25.5792)", () => {
    const cad = console()
    answer(cad, "RECTANG", "0,0", "10,20", "EXTRUDE", "_L", "", "20,30")
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 25.5792")
  })

  it("the first profile picked gives the base (p106: the circle, then the rectangle)", () => {
    const cad = console()
    answer(
      cad,
      "ZOOM",
      "_W",
      "-10,-10",
      "100,100",
      "RECTANG",
      "0,0",
      "10,10",
      "CIRCLE",
      "50,0",
      "5"
    )
    answer(cad, "DELOBJ", "0", "EXTRUDE", "55,0", "10,5", "", "100,100")
    // Both solids take the one height: from the circle's centre, 111.8034.
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 111.8034")
  })

  it("a typed point off the plane, in plan: its distance in space (p163: 20,0,10 from 0,0,0 is 22.3607)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "20,0,10")
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 22.3607")
  })

  it("`@3,4` and `*53,4` at the height (p154, p155)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "", "@3,4")
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 5.0000")
    const ucs = console()
    answer(
      ucs,
      "UCS",
      "_Z",
      "30",
      "CIRCLE",
      "*50,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "*53,4"
    )
    expect(historyLines(ucs)[1]).toBe(" Extrusion height: 5.0000")
  })
})

describe("EXTRUDE's LASTPOINT (the Sweeps review, SLP-01)", () => {
  it("a point given for the height leaves it at the base (p109: 53,4 → 50,0,0)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "53,4"
    )
    near(lastPoint(cad), [50, 0, 0])
  })

  it("after a taper and the height: the base (p110)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "_T",
      "10",
      "5"
    )
    near(lastPoint(cad), [50, 0, 0])
  })

  it("Direction: its end point (p112: 1,2,3 then 4,5,9)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "_D",
      "1,2,3",
      "4,5,9"
    )
    near(lastPoint(cad), [4, 5, 9])
  })

  it("Direction's end refused as parallel still sets it (p153's 20,0,0)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "0,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "_D",
      "0,0,0",
      "20,0,0"
    )
    near(lastPoint(cad), [20, 0, 0])
  })

  it("Direction's start sets it before the end is asked (p112: 1,2,3 read by 'SETVAR)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "_D",
      "1,2,3"
    )
    const log = written(cad, "'LASTPOINT", "")
    expect(log.join("\n")).toContain("1.0000,2.0000,3.0000")
  })

  it("a pick typed at the select prompt, then the height's base (p114)", () => {
    const cad = console()
    answer(
      cad,
      "ZOOM",
      "_W",
      "-10,-10",
      "100,100",
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7"
    )
    answer(cad, "EXTRUDE", "55,0")
    const log = written(cad, "'LASTPOINT", "")
    expect(log.join("\n")).toContain("55.0000,0.0000,0.0000")
  })

  it("in a rotated UCS, the base in the UCS (p144: 50,0 in UCS Z 30)", () => {
    const cad = console()
    answer(
      cad,
      "UCS",
      "_Z",
      "30",
      "CIRCLE",
      "50,0",
      "5",
      "LASTPOINT",
      "7,7,7",
      "EXTRUDE",
      "_L",
      "",
      "53,4"
    )
    near(lastPoint(cad), [50, 0, 0])
  })
})

describe("EXTRUDE's answers (the Sweeps review)", () => {
  it("extrudes untapered in a run that gave no taper, after one that did (SWO-01; p335, p336)", () => {
    const cad = console()
    answer(cad, "_CIRCLE", "0,0", "5", "_EXTRUDE", "_L", "", "_T", "10", "5")
    answer(cad, "_CIRCLE", "50,0", "5", "_EXTRUDE", "_L", "", "5")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(Math.PI * 25 * 5, 6)
    expect(historyLines(cad).slice(2, 3)).toEqual(["      Taper angle: 0"])
  })

  it("Direction's end typed at the command line is absolute (p113: 10,0,0 to 13,0,4 is 5)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "0,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "_D",
      "10,0,0",
      "13,0,4"
    )
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 5.0000")
  })

  it("Direction's FOO and Enter: `Invalid point.` (EXT-05; p134)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_D")
    expect(written(cad, "FOO", "", "0,0,0", "FOO", "", "0,0,5")).toEqual([
      "Specify start point of direction: FOO",
      "Invalid point.",
      "Specify start point of direction:",
      "Invalid point.",
      "Specify start point of direction: 0,0,0",
      "Specify end point of direction: FOO",
      "Invalid point.",
      "Specify end point of direction:",
      "Invalid point.",
      "Specify end point of direction: 0,0,5",
    ])
  })

  it("Enter takes the height offered (p128)", () => {
    const cad = console()
    answer(
      cad,
      "CIRCLE",
      "0,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "5",
      "CIRCLE",
      "50,0",
      "5",
      "EXTRUDE",
      "_L",
      ""
    )
    expect(written(cad, "")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <5.0000>:",
    ])
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 5.0000")
  })

  it("a negative height lists positive and is offered negative (EXT-06; p129)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "-5")
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 5.0000")
    answer(cad, "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "3")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <-5.0000>: 3",
    ])
  })

  it("Enter at the taper keeps it, Expression gives it (p130)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "_T", "", "_T", "_E", "10+5", "5")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _T",
      "Specify angle of taper for extrusion or [Expression] <0>:",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _T",
      "Specify angle of taper for extrusion or [Expression] <0>: _E",
      "Enter expression: 10+5",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
    expect(historyLines(cad)[2]).toBe("      Taper angle: 15")
  })

  it("Enter at Expression ends the command, nothing made (EXT-03; p131)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_E")
    expect(written(cad, "")).toEqual(["Enter expression:"])
    expect(cad.activeToolId()).not.toBe("extrude")
    expect(solids(cad)).toHaveLength(0)
  })

  it("an expression of 0 is refused and the height asked again (EXT-02; p132)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_E")
    expect(written(cad, "0", "-3")).toEqual([
      "Enter expression: 0",
      "Value must be nonzero.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: -3",
    ])
    expect(historyLines(cad)[1]).toBe(" Extrusion height: 3.0000")
  })

  it("an expression past a right angle at the taper is refused and the taper asked again (EXT-02; p133)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_T", "_E")
    expect(written(cad, "100", "5", "5")).toEqual([
      "Enter expression: 100",
      "Angle must be greater than -90 degrees and less than 90 degrees.",
      "Specify angle of taper for extrusion or [Expression] <0>: 5",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
    expect(historyLines(cad)[2]).toBe("      Taper angle: 5")
  })

  it("another prompt's keyword and a command are refused at the height and the taper (p135, p136)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(
      written(cad, "_ST", "_SU", "_LINE", "_T", "_D", "_LINE", "5", "5")
    ).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _ST",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _SU",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _LINE",
      "Requires numeric distance, second point, or option keyword.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: _T",
      "Specify angle of taper for extrusion or [Expression] <0>: _D",
      "Requires numeric distance, second point, or option keyword.",
      "Specify angle of taper for extrusion or [Expression] <0>: _LINE",
      "Requires numeric distance, second point, or option keyword.",
      "Specify angle of taper for extrusion or [Expression] <0>: 5",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
  })

  it("'ORTHOMODE and 'ZOOM W at the height, the prompt asked again (p137, p166)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "'ORTHOMODE", "1")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 'ORTHOMODE",
      ">>Enter new value for ORTHOMODE <0>: 1",
      "Resuming EXTRUDE command.",
    ])
    expect(
      written(cad, "'_ZOOM", "_W", "-10,-10", "100,100", "5").slice(-2)
    ).toEqual([
      "Resuming EXTRUDE command.",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
  })

  it("a self-intersecting profile is sifted as the set closes (EXT-04; p146)", () => {
    const cad = console()
    answer(cad, "PLINE", "0,0", "10,10", "10,0", "0,10", "_C")
    expect(written(cad, "EXTRUDE", "_L", "")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]: _L",
      "1 found",
      "Select objects to extrude or [MOde]:",
      "Cannot sweep or extrude a self-intersecting curve.\n1 object removed from selection set.",
    ])
    // The set asked again.
    expect(cad.state().commandLine.prompt).toBe(
      "EXTRUDE Select objects to extrude or [MOde]:"
    )
  })

  it("a preselection is counted and the height asked (p148)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "CIRCLE", "30,0", "3")
    cad.selectAll()
    expect(written(cad, "EXTRUDE", "5")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "2 found",
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
    ])
  })

  it("U undoes it whole and names it, REDO redoes it, UNDO 2 names both (p138–p140)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "5")
    expect(written(cad, "_U").at(-1)).toBe("EXTRUDE")
    expect(cad.entities().map((e) => e.type)).toEqual(["circle"])
    expect(written(cad, "_REDO").slice(1)).toEqual([
      "EXTRUDE",
      "Everything has been redone",
    ])
    expect(cad.entities().map((e) => e.type)).toEqual(["solid3d"])
    const two = console()
    answer(
      two,
      "CIRCLE",
      "0,0",
      "5",
      "CIRCLE",
      "50,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "5"
    )
    expect(written(two, "_UNDO", "2").at(-1)).toBe("EXTRUDE CIRCLE")
    expect(two.entities().map((e) => e.type)).toEqual(["circle"])
  })

  it("an empty run: Nothing selected, and U takes it back by name (p141)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5")
    expect(written(cad, "EXTRUDE", "")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]:",
      "Nothing selected.",
    ])
    expect(written(cad, "_U").at(-1)).toBe("EXTRUDE")
    expect(cad.entities()).toHaveLength(1)
  })

  it("MOde: Enter keeps Solid, FOO refused (p150)", () => {
    const cad = console()
    answer(cad, "EXTRUDE")
    expect(
      written(cad, "_MO", "", "_MO", "_SO", "_MO", "FOO", "_SO", "")
    ).toEqual([
      "Select objects to extrude or [MOde]: _MO",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>:",
      "Select objects to extrude or [MOde]: _MO",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>: _SO",
      "Select objects to extrude or [MOde]: _MO",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>: FOO",
      "Invalid option keyword.",
      "Closed profiles creation mode [SOlid/SUrface] <Solid>: _SO",
      "Select objects to extrude or [MOde]:",
      "Nothing selected.",
    ])
  })

  it("DELOBJ -2 asks, 2 erases (p147)", () => {
    const cad = console()
    answer(cad, "DELOBJ", "-2", "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "5", "")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression]: 5",
      "Erase defining objects? [Yes/No] <Yes>:",
    ])
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "DELOBJ", "2", "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "", "5")
    expect(cad.entities()).toHaveLength(2)
  })

  it("the current colour and lineweight, not the profile's (p161)", () => {
    const cad = console()
    answer(
      cad,
      "CECOLOR",
      "3",
      "CIRCLE",
      "0,0",
      "5",
      "CECOLOR",
      "1",
      "CELWEIGHT",
      "30",
      "EXTRUDE",
      "_L",
      "",
      "5"
    )
    const solid = last(cad)
    answer(cad, "CIRCLE", "50,50", "5")
    const ref = cad.latest()
    expect(ref.color).toBeDefined()
    expect(solid.color).toEqual(ref.color)
    expect(solid.lineweight).toEqual(ref.lineweight)
  })

  it("ELEVATION and THICKNESS: from the circle's plane, its thickness ignored (p143)", () => {
    const cad = console()
    answer(
      cad,
      "ELEVATION",
      "3",
      "THICKNESS",
      "2",
      "CIRCLE",
      "0,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "10"
    )
    const solid = last(cad)
    expect(brepVolume(solid.brep)).toBeCloseTo(Math.PI * 25 * 10, 6)
    const zs = solid.brep.vertices.map((v) => v.z)
    expect(Math.min(...zs)).toBeCloseTo(3, 9)
    expect(Math.max(...zs)).toBeCloseTo(13, 9)
  })

  it("Direction in a tilted UCS runs along the UCS's Z (p145: UCS X 90, 0,0,0 to 0,0,5)", () => {
    const cad = console()
    answer(
      cad,
      "UCS",
      "_X",
      "90",
      "CIRCLE",
      "0,0",
      "5",
      "EXTRUDE",
      "_L",
      "",
      "_D",
      "0,0,0",
      "0,0,5",
      "UCS",
      "_W"
    )
    expect(historyLines(cad).slice(1)).toEqual([
      " Extrusion height: 5.0000",
      "      Taper angle: 0",
      "   Bounding Box: Lower Bound X = -5.0000  , Y = -5.0000  , Z = -5.0000",
      "                 Upper Bound X = 5.0000   , Y = 0.0000   , Z = 5.0000",
    ])
  })

  it("a bare number at Direction's end runs along the cursor, in the plane (p156)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_D", "0,0,0")
    expect(written(cad, "5")).toEqual([
      "Specify end point of direction: 5",
      "Extrude direction is parallel to plane of sweep curve.",
    ])
  })

  it("'EXTRUDE at LINE's prompt is refused (p168)", () => {
    const cad = console()
    answer(cad, "LINE", "0,0")
    expect(written(cad, "'EXTRUDE", "10,0", "").slice(0, 3)).toEqual([
      "Specify next point or [Undo]: 'EXTRUDE",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("Enter repeats it (p169)", () => {
    const cad = console()
    answer(
      cad,
      "ZOOM",
      "_W",
      "-10,-10",
      "100,100",
      "CIRCLE",
      "0,0",
      "5",
      "CIRCLE",
      "50,0",
      "5"
    )
    answer(cad, "EXTRUDE", "5,0", "", "5")
    const log = written(cad, "", "55,0", "", "3")
    // The console echoes `.EXTRUDE` after `_.EXTRUDE`; the `.` prefix is
    // command-line.md's known gap, so this checks the repeat alone.
    expect(log[0]).toBe("EXTRUDE")
    expect(log.at(-1)).toBe(
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <5.0000>: 3"
    )
  })

  it("the height and the taper outlive opening another drawing (EXT-07; p149)", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "EXTRUDE", "_L", "", "_T", "15", "7")
    cad.runtime.newDrawing()
    answer(cad, "LUPREC", "4", "CIRCLE", "50,0", "5", "EXTRUDE", "_L", "")
    expect(written(cad, "_T")).toEqual([
      "Specify height of extrusion or [Direction/Path/Taper angle/Expression] <7.0000>: _T",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "EXTRUDE Specify angle of taper for extrusion or [Expression] <15>:"
    )
  })
})

describe("EXTRUDE in Spanish and Brazilian Portuguese (the Sweeps review)", () => {
  it("es: a self-intersecting curve (EXT-04; p146)", () => {
    const cad = console(es)
    answer(cad, "_PLINE", "0,0", "10,10", "10,0", "0,10", "_C")
    expect(written(cad, "EXTRUSION", "_L", "")).toContain(
      "No se puede barrer ni extruir una curva que interseca consigo misma.\nSe ha eliminado 1 objeto del conjunto de selección."
    )
  })

  it("es: the sift of a mixed set, each kind's line once and one count (EXT-04; p162)", () => {
    const cad = console(es)
    answer(
      cad,
      "_ZOOM",
      "_W",
      "-10,-10",
      "100,100",
      "-TEXTO",
      "50,50",
      "2",
      "0",
      "HI"
    )
    answer(
      cad,
      "_PLINE",
      "0,0",
      "10,10",
      "10,0",
      "0,10",
      "_C",
      "_CIRCLE",
      "30,0",
      "3"
    )
    expect(written(cad, "_EXTRUDE", "_ALL", "").slice(-1)).toEqual([
      "No se puede barrer ni extruir una curva que interseca consigo misma.\nNo se puede barrer ni extruir un objeto de este tipo.\nSe han eliminado 2 objetos del conjunto de selección.",
    ])
  })

  it("es: Direction's FOO (EXT-05; p134)", () => {
    const cad = console(es)
    answer(cad, "CIRCULO", "0,0", "5", "EXTRUSION", "_L", "", "_D")
    expect(written(cad, "FOO")).toEqual([
      "Precise punto inicial de dirección: FOO",
      "Punto no válido.",
    ])
  })

  it("es: height with its default, taper, a refused expression (p128, p130, p133)", () => {
    const cad = console(es)
    answer(
      cad,
      "_CIRCLE",
      "0,0",
      "5",
      "_EXTRUDE",
      "_L",
      "",
      "5",
      "_CIRCLE",
      "50,0",
      "5",
      "_EXTRUDE",
      "_L",
      ""
    )
    expect(written(cad, "_T", "", "_T", "_E", "100", "5", "5")).toEqual([
      "Precise altura de extrusión o [Dirección/Trayectoria/ángulo Inclinación/Expresión] <5.0000>: _T",
      "Precise ángulo de inclinación para extrusión o [Expresión] <0>:",
      "Precise altura de extrusión o [Dirección/Trayectoria/ángulo Inclinación/Expresión] <5.0000>: _T",
      "Precise ángulo de inclinación para extrusión o [Expresión] <0>: _E",
      "Introduzca expresión: 100",
      "Debe ser un ángulo superior a -90º e inferior a 90º.",
      "Precise ángulo de inclinación para extrusión o [Expresión] <0>: 5",
      "Precise altura de extrusión o [Dirección/Trayectoria/ángulo Inclinación/Expresión] <5.0000>: 5",
    ])
  })

  it("an expression's 0 in BOX's words, a typed 0 in the distance's (EXT-09; p132, x03)", () => {
    for (const [locale, words] of [
      [es, "No puede ser un valor igual a cero."],
      [ptBR, "Este valor precisa ser diferente de zero."],
    ] as const) {
      const cad = console(locale)
      answer(cad, "_CIRCLE", "0,0", "5", "_EXTRUDE", "_L", "", "_E")
      expect(written(cad, "0").slice(-1)).toEqual([words])
      expect(written(cad, "0").slice(-1)).toEqual([
        locale === es
          ? "El valor debe ser diferente de cero."
          : "O valor deve ser diferente de zero.",
      ])
    }
  })

  it("MOde in es and pt-BR (p150)", () => {
    const spanish = console(es)
    answer(spanish, "_EXTRUDE")
    expect(written(spanish, "_MO", "FOO", "_SO", "")).toEqual([
      "Designe objetos para extruir o [MOdo]: _MO",
      "Modo de creación de perfiles cerrados [Sólido/SUperficie] <Sólido>: FOO",
      "Opción no válida.",
      "Modo de creación de perfiles cerrados [Sólido/SUperficie] <Sólido>: _SO",
      "Designe objetos para extruir o [MOdo]:",
      "No se ha designado nada.",
    ])
    const portuguese = console(ptBR)
    answer(portuguese, "_EXTRUDE")
    expect(written(portuguese, "_MO", "FOO", "_SO", "")).toEqual([
      "Selecione objetos para extrusão ou [MOdo]: _MO",
      "Modo de criação de perfis fechados [SÓlido/SUperfície] <Sólido>: FOO",
      "Opção inválida.",
      "Modo de criação de perfis fechados [SÓlido/SUperfície] <Sólido>: _SO",
      "Selecione objetos para extrusão ou [MOdo]:",
      "Não há nada selecionado.",
    ])
  })

  it("pt-BR: height with its default, taper, a refused expression (p128, p130, p133)", () => {
    const cad = console(ptBR)
    answer(
      cad,
      "_CIRCLE",
      "0,0",
      "5",
      "_EXTRUDE",
      "_L",
      "",
      "5",
      "_CIRCLE",
      "50,0",
      "5",
      "_EXTRUDE",
      "_L",
      ""
    )
    expect(written(cad, "_T", "", "_T", "_E", "100", "5", "5")).toEqual([
      "Especifique a altura da extrusão ou [Direção/Caminho/ângulo de COnicidade/Expressão] <5.0000>: _T",
      "Especifique o ângulo de conicidade para a extrusão ou [Expressão] <0>:",
      "Especifique a altura da extrusão ou [Direção/Caminho/ângulo de COnicidade/Expressão] <5.0000>: _T",
      "Especifique o ângulo de conicidade para a extrusão ou [Expressão] <0>: _E",
      "Insira a expressão: 100",
      "O ângulo deve ser maior do que -90 graus e menor do que 90 graus.",
      "Especifique o ângulo de conicidade para a extrusão ou [Expressão] <0>: 5",
      "Especifique a altura da extrusão ou [Direção/Caminho/ângulo de COnicidade/Expressão] <5.0000>: 5",
    ])
  })

  it("pt-BR: Direction's FOO (EXT-05; p134)", () => {
    const cad = console(ptBR)
    answer(cad, "_CIRCLE", "0,0", "5", "_EXTRUDE", "_L", "", "_D")
    expect(written(cad, "FOO")).toEqual([
      "Especificar ponto inicial de direção: FOO",
      "Ponto inválido.",
    ])
  })

  it("pt-BR: a self-intersecting curve (EXT-04; p146)", () => {
    const cad = console(ptBR)
    answer(cad, "_PLINE", "0,0", "10,10", "10,0", "0,10", "_C")
    expect(written(cad, "_EXTRUDE", "_L", "")).toContain(
      "Não é possível efetuar a varredura ou extrusão de uma curva de autointersecção.\n1 objeto removido do conjunto de seleção."
    )
  })
})

describe("the rail's EXTRUDE runs the ribbon's macro (EXT-10; p400)", () => {
  // acad.cuix, Home > Modeling, ID_Extrude: `^C^C^R_extrude _MO _SO;`.
  it("echoes `_extrude` and answers `_MO` and `_SO`", () => {
    const cad = createHarness()
    cad.tool("extrude")
    expect(cad.commandLog()).toEqual([
      "_extrude",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to extrude or [MOde]: _MO Closed profiles creation mode [SOlid/SUrface] <Solid>: _SO",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "EXTRUDE Select objects to extrude or [MOde]:"
    )
  })

  it("es MOde prompt words (p400)", () => {
    const cad = createHarness({ locale: es })
    cad.tool("extrude")
    expect(cad.commandLog().join("\n")).toContain(
      "Modo de creación de perfiles cerrados [Sólido/SUperficie] <Sólido>: _SO"
    )
  })

  it("typed, asks as typed; Enter after a rail run repeats the bare command, U names its group", () => {
    const typed = console()
    expect(written(typed, "EXTRUDE")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
    ])
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5")
    cad.tool("extrude")
    answer(cad, "_L", "", "5")
    expect(solids(cad)).toHaveLength(1)
    expect(written(cad, "")).toEqual([
      "EXTRUDE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
    ])
    cad.escape()
    expect(written(cad, "_U", "_U")).toEqual([
      "U",
      "EXTRUDE",
      "U",
      "EXTRUDE GROUP",
    ])
    expect(solids(cad)).toHaveLength(0)
  })
})

describe("REVOLVE", () => {
  it("turns a rectangle round Y from 30° through 90°, as r01's MASSPROP", () => {
    const cad = console()
    answer(cad, "RECTANG", "100,0", "110,5")
    expect(
      written(cad, "REVOLVE", "_L", "", "_Y", "_ST", "FOO", "30", "FOO", "90")
    ).toEqual([
      "REVOLVE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to revolve or [MOde]: _L",
      "1 found",
      "Select objects to revolve or [MOde]:",
      "Specify axis start point or define axis by [Object/X/Y/Z] <Object>: _Y",
      "Specify angle of revolution or [STart angle/Reverse/EXpression] <360>: _ST",
      "Specify start angle <0.0>: FOO",
      "Requires valid numeric angle, second point, or option keyword.",
      "Specify start angle <0.0>: 30",
      "Specify angle of revolution or [STart angle/EXpression] <360>: FOO",
      "Requires valid numeric angle, second point, or option keyword.",
      "Specify angle of revolution or [STart angle/EXpression] <360>: 90",
    ])
    const solid = last(cad)
    expect(brepVolume(solid.brep)).toBeCloseTo(8246.6807, 4)
    const m = solidInertia(brepMoments(solid.brep))
    expect(m.centroid.x).toBeCloseTo(24.4855, 4)
    expect(m.centroid.z).toBeCloseTo(-91.3811, 4)
    expect(listed(cad)).toEqual([
      "      Solid type = Revolve",
      "      Start angle: 30",
      "Angle of revolution: 90",
      " Direction vector: X = 0.0000    Y = 1.0000    Z = 0.0000",
      "   Bounding Box: Lower Bound X = -55.0000 , Y = 0.0000   , Z = -110.0000",
      "                 Upper Bound X = 95.2628  , Y = 5.0000   , Z = -50.0000",
    ])
  })

  it("takes two points, Reverse and a negative angle, a whole turn for 0 or past a turn (r03, r07)", () => {
    const cad = console()
    answer(cad, "PLINE", "0,-5", "_A", "_CE", "0,0", "0,5", "_L", "_C")
    answer(cad, "REVOLVE", "_L", "", "_Y", "_R", "-90")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(130.8997, 4)
    expect(solidInertia(brepMoments(last(cad).brep)).centroid.z).toBeCloseTo(
      -1.875,
      9
    )
    expect(listed(cad).slice(1, 4)).toEqual([
      "      Start angle: 0",
      "Angle of revolution: -90",
      " Direction vector: X = 0.0000    Y = -1.0000   Z = 0.0000",
    ])
    answer(
      cad,
      "RECTANG",
      "10,50",
      "20,55",
      "REVOLVE",
      "_L",
      "",
      "0,0",
      "10,0",
      "-400"
    )
    expect(listed(cad).slice(2, 4)).toEqual([
      "Angle of revolution: 360",
      " Direction vector: X = 1.0000    Y = 0.0000    Z = 0.0000",
    ])
    answer(cad, "RECTANG", "10,100", "20,105", "REVOLVE", "_L", "", "_Y", "0")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(Math.PI * 300 * 5, 6)
  })

  it("turns round a line it is given, by an expression (r08)", () => {
    const cad = console()
    answer(cad, "LINE", "0,0", "0,10", "", "RECTANG", "10,0", "20,5")
    expect(
      written(
        cad,
        "REVOLVE",
        "_L",
        "",
        "_O",
        "0,5",
        "_ST",
        "-30",
        "_EX",
        "FOO",
        "45*2"
      )
    ).toEqual([
      "REVOLVE",
      "Current wire frame density:  ISOLINES=4, Closed profiles creation mode = Solid",
      "Select objects to revolve or [MOde]: _L",
      "1 found",
      "Select objects to revolve or [MOde]:",
      "Specify axis start point or define axis by [Object/X/Y/Z] <Object>: _O",
      "Select an object: 0,5",
      "Specify angle of revolution or [STart angle/Reverse/EXpression] <360>: _ST",
      "Specify start angle <0.0>: -30",
      "Specify angle of revolution or [STart angle/EXpression] <360>: _EX",
      "Enter expression: FOO",
      "The syntax is incorrect or a variable is not defined.  Reenter the expression or value.",
      "Enter expression: 45*2",
    ])
    expect(listed(cad).slice(1, 3)).toEqual([
      "      Start angle: -30",
      "Angle of revolution: 90",
    ])
    const box = listed(cad).slice(4)
    expect(box).toEqual([
      "   Bounding Box: Lower Bound X = 5.0000   , Y = 0.0000   , Z = -17.3205",
      "                 Upper Bound X = 20.0000  , Y = 5.0000   , Z = 10.0000",
    ])
  })

  it("refuses an axis across the profile, square to it, of no length or closed (r01, r05, r09)", () => {
    const cad = console()
    answer(cad, "RECTANG", "0,0", "10,5", "REVOLVE", "_L", "", "5,0")
    expect(written(cad, "5,10", "90")).toEqual([
      "Specify axis endpoint: 5,10",
      "Specify angle of revolution or [STart angle/Reverse/EXpression] <360>: 90",
      "The object should be on one side of the axis.",
      "Unable to revolve the selected object.",
    ])
    answer(cad, "REVOLVE", "_L", "", "20,0,0", "20,0,10")
    expect(written(cad, "90")).toEqual([
      "Specify angle of revolution or [STart angle/Reverse/EXpression] <360>: 90",
      "Axis of revolution is perpendicular to plane of revolve curve.",
      "Unable to revolve the selected object.",
    ])
    answer(cad, "REVOLVE", "_L", "", "0,0")
    expect(written(cad, "0,0")).toEqual([
      "Specify axis endpoint: 0,0",
      "Zero length axis is not permitted.",
    ])
    answer(cad, "REVOLVE", "_L", "", "_O")
    expect(written(cad, "_L")).toEqual([
      "Select an object: _L",
      "Cannot get axis direction from a closed curve or edge.",
    ])
    expect(solids(cad)).toHaveLength(0)
  })

  it("asks to erase by DELOBJ, and asks in Spanish and Brazilian Portuguese (r09, r01)", () => {
    const cad = console()
    answer(
      cad,
      "DELOBJ",
      "-1",
      "CIRCLE",
      "30,0",
      "5",
      "REVOLVE",
      "_L",
      "",
      "_Y",
      "90"
    )
    expect(written(cad, "_N")).toEqual([
      "Erase defining objects? [Yes/No] <Yes>: _N",
    ])
    expect(cad.entities()).toHaveLength(2)
    const spanish = console(es)
    answer(spanish, "RECTANG", "100,0", "110,5")
    expect(
      written(spanish, "REVOLUCION", "_L", "", "_Y", "_ST", "30", "90").slice(
        -4
      )
    ).toEqual([
      "Precise punto inicial del eje o defina el eje mediante [Objeto/X/Y/Z] <Objeto>: _Y",
      "Precise ángulo de revolución o [ángulo Inicial/iNvertir/EXpresión] <360>: _ST",
      "Precise ángulo inicial <0.0>: 30",
      "Precise ángulo de revolución o [ángulo Inicial/EXpresión] <360>: 90",
    ])
    const portuguese = console(ptBR)
    answer(portuguese, "_RECTANG", "100,0", "110,5")
    expect(
      written(portuguese, "REVOLUCAO", "_L", "", "_Y", "90").slice(-2)
    ).toEqual([
      "Especificar ponto inicial para eixo ou definir eixo por [Objeto/X/Y/Z] <Objeto>: _Y",
      "Especifique um ângulo de revolução ou [ângulo INicial/Reverter/EXpressão] <360>: 90",
    ])
    expect(
      written(portuguese, "_LIST", "_L", "").flatMap((l) => l.split("\n"))
    ).toEqual(
      expect.arrayContaining([
        "   Ângulo inicial: 0",
        "Ângulo de revolução: 90",
        " Vetor de direção: X = 0.0000    Y = 1.0000    Z = 0.0000",
      ])
    )
  })
})

describe("PRESSPULL", () => {
  it("pulls the area its objects bound, its islands holes, and asks again (its help; presspull/p01)", () => {
    const cad = console()
    answer(cad, "RECTANG", "0,0", "100,60", "CIRCLE", "50,30", "10")
    expect(written(cad, "PRESSPULL", "FOO", "5,5")).toEqual([
      "PRESSPULL",
      "Select object or bounded area: FOO",
      "2D point or option keyword required.",
      "Select object or bounded area: 5,5",
      "Click a face, curve, or inside a bounded area",
    ])
    cad.click({ x: 10, y: 10 })
    expect(written(cad, "20")).toEqual([
      "Specify extrusion height or [Multiple]: 20",
    ])
    const solid = last(cad)
    expect(brepIsClosed(solid.brep)).toBe(true)
    expect(brepVolume(solid.brep)).toBeCloseTo((6000 - Math.PI * 100) * 20, 6)
    // Its objects stay; it asks again until Enter.
    expect(cad.entities().map((e) => e.type)).toEqual([
      "polyline",
      "circle",
      "solid3d",
    ])
    cad.click({ x: 50, y: 30 })
    answer(cad, "5", "")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(Math.PI * 100 * 5, 6)
    expect(cad.commandLog().at(-1)).toBe("Select object or bounded area:")
    answer(cad, "U")
    expect(solids(cad)).toHaveLength(0)
  })

  /** A 10 box seen from (-1.3, -2.2, 1.6), its top, front and left towards the viewer (desktop). */
  function boxInView(): CadHarness {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "ZOOM", "E")
    return cad
  }

  const TOP = { x: 3, y: 7, z: 10 }

  it("extrudes a solid's face clicked, its neighbours left (its help; desktop, solidedit/e01)", () => {
    const cad = boxInView()
    const id = last(cad).id
    answer(cad, "PRESSPULL")
    cad.click(TOP)
    expect(written(cad, "2")).toEqual([
      "Specify extrusion height or [Multiple]: 2",
      "1 extrusion(s) created",
    ])
    expect(last(cad).id).toBe(id)
    expect(brepVolume(last(cad).brep)).toBeCloseTo(1200, 9)
    // As the height is dragged the face's prism shows over the solid.
    cad.click(TOP)
    const before = cad.scene().primitives.length
    cad.moveTo({ x: 3, y: 7, z: 14 })
    expect(cad.scene().primitives.length).toBeGreaterThan(before)
    // Pressed in, the face's prism taken out.
    answer(cad, "-5")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(700, 9)
    expect(written(cad, "")).toEqual(["Select object or bounded area:"])
    // What made it is gone (desktop LIST: History = None, no Solid type).
    expect(listed(cad).join("\n")).not.toContain("Solid type")
    // The whole run is one step (desktop: U says LIST, then PRESSPULL).
    expect(written(cad, "U")).toEqual(["U", "LIST"])
    expect(written(cad, "U")).toEqual(["U", "PRESSPULL"])
    expect(brepVolume(last(cad).brep)).toBeCloseTo(1000, 9)
    expect(last(cad).primitive?.kind).toBe("box")
  })

  it("offsets a face Ctrl+clicked, a slope beside it carried on (desktop; solidedit/e02)", () => {
    const { back } = brepSliced(
      boxBrep(
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 0, y: 10, z: 0 },
        { x: 0, y: 0, z: 10 }
      ),
      {
        origin: { x: 10, y: 0, z: 10 },
        normal: { x: 0.894427190999916, y: 0, z: -0.447213595499958 },
      }
    )
    const sloped = (): CadHarness => {
      const cad = createHarness({
        entities: [{ id: "s", type: "solid3d", layerId: "0", brep: back! }],
      })
      answer(cad, "VPOINT", "-1.3,-2.2,1.6", "ZOOM", "E")
      return cad
    }
    const offset = sloped()
    answer(offset, "PRESSPULL")
    offset.click(TOP, { ctrlKey: true })
    expect(written(offset, "2")).toEqual([
      "Specify offset distance or [Multiple]:2",
      "1 face(s) offset",
    ])
    expect(brepVolume(last(offset).brep)).toBeCloseTo(960, 9)
    expect(last(offset).brep.faces).toHaveLength(6)
    const extruded = sloped()
    answer(extruded, "PRESSPULL")
    extruded.click(TOP)
    answer(extruded, "2")
    expect(brepVolume(last(extruded).brep)).toBeCloseTo(950, 9)
    expect(last(extruded).brep.faces).toHaveLength(7)
  })

  it("takes several faces of a solid before one height with Multiple", () => {
    const cad = boxInView()
    answer(cad, "PRESSPULL", "_M")
    cad.click(TOP)
    cad.click({ x: 6, y: 0, z: 4 })
    answer(cad, "", "2", "")
    expect(cad.commandLog()).toContain("2 extrusion(s) created")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(1400, 9)
  })

  it("takes the top face of a box seen in plan", () => {
    const cad = console()
    answer(cad, "BOX", "0,0,0", "10,10", "10", "PRESSPULL")
    cad.click({ x: 5, y: 5 })
    answer(cad, "3", "")
    expect(brepVolume(last(cad).brep)).toBeCloseTo(1300, 9)
  })

  it("takes several before one height with Multiple", () => {
    const cad = console()
    answer(cad, "CIRCLE", "0,0", "5", "CIRCLE", "50,0", "5", "PRESSPULL", "_M")
    cad.click({ x: 0, y: 0 })
    cad.click({ x: 50, y: 0 })
    answer(cad, "", "3", "")
    expect(solids(cad)).toHaveLength(2)
    expect(solids(cad).every((s) => brepVolume(s.brep) > 235)).toBe(true)
  })
})
