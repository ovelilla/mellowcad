import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { brepIsClosed, brepVolume } from "../geometry/solids"
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
