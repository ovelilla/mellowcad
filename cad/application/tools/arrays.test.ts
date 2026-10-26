import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type {
  CircleEntity,
  Entity,
  InsertEntity,
  LineEntity,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  layerOf,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"
import { entityPointToWorld, withElevation } from "../../domain/elevation"
import { insertFlatGeometry } from "../../domain/blocks"
import { createBlockDefinition, createInsert } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"

/**
 * ARRAY, ARRAYRECT, ARRAYPOLAR, ARRAYPATH, the arrays' shared prompts and the
 * array object, against AutoCAD 2027's console (probes arrays/p01–p06,
 * p100–p179, p200–p279, p300–p379, p400–p422, in en-US and es-ES).
 */

/**
 * What the drawing shows, each array flattened into its items' objects, the
 * source first: what the probes' `ssget` listed of the loose copies.
 */
function shown(cad: CadHarness): Entity[] {
  const blocks = cad.runtime.document.blockLookup()
  return cad
    .entities()
    .flatMap((entity) =>
      entity.type === "insert" ? insertFlatGeometry(entity, blocks) : [entity]
    )
}

function linesOf(entities: readonly Entity[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

function centres(cad: CadHarness): CircleEntity["center"][] {
  return shown(cad).flatMap((e) =>
    e.type === "circle" ? [(e as CircleEntity).center] : []
  )
}

/** Whether a circle is centred at x,y, to the console's four places. */
function hasCentre(cad: CadHarness, x: number, y: number): boolean {
  return centres(cad).some(
    (c) => Math.abs(c.x - x) < 1e-4 && Math.abs(c.y - y) < 1e-4
  )
}

/**
 * The circles the scene draws but the probes' source at 10,10 (drawn, and
 * glowing while selected): the items, previewed or made.
 */
function itemCircles(cad: CadHarness): { centre: string; stroke: unknown }[] {
  return cad.scene().primitives.flatMap((prim) => {
    if (prim.kind !== "circle") return []
    const c = cad.runtime.viewport.screenToWorld(prim.center)
    return Math.abs(c.x - 10) < 1e-4 && Math.abs(c.y - 10) < 1e-4
      ? []
      : [{ centre: `${round4(c.x)},${round4(c.y)}`, stroke: prim.stroke }]
  })
}

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What `ID @` says LASTPOINT is. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

/** The probes' circle: centre 10,10, radius 2. */
const circle = () => circleOf(p(10, 10), 2, { id: "C" })

describe("ARRAYRECT", () => {
  // probes arrays/p110–p116, p131, p135, p168: the counts' refusals, a 40
  // long line's columns 60 apart and its rows 1 apart.
  it("asks AutoCAD's questions over the preview and writes them answered", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.command("ARRAYRECT").click(p(20, 0)).enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
    )
    cad.option("COUnt")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Enter the number of columns <4>:"
    )
    cad.type("0").enter().type("2.5").enter().type("3").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Enter the number of rows <3>:"
    )
    cad.type("2").enter().option("Spacing")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <60>:"
    )
    cad.type("100").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between rows <1>:"
    )
    cad.type("50").enter().option("Rows").enter().enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the incrementing elevation between rows <0>:"
    )
    cad.type("5").enter().enter()

    expect(cad.commandLog()).toEqual([
      "ARRAYRECT",
      "Select objects: 1 found",
      "Select objects:",
      "Type = Rectangular  Associative = Yes",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: COU",
      "Enter the number of columns <4>: 0",
      "Value must be positive and nonzero.",
      "Enter the number of columns <4>: 2.5",
      "Requires a positive nonzero integer or option keyword.",
      "Enter the number of columns <4>: 3",
      "Enter the number of rows <3>: 2",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <60>: 100",
      "Specify the distance between rows <1>: 50",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: R",
      "Enter the number of rows <2>:",
      "Specify the distance between rows <50>:",
      "Specify the incrementing elevation between rows <0>: 5",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:",
    ])
    expect(shown(cad).length).toBe(6)
    const raised = linesOf(shown(cad)).filter((line) => line.start.y === 50)
    expect(raised.map((line) => line.elevation)).toEqual([5, 5, 5])
  })

  // probes arrays/p110.es, p116.es, p125.es, p131.es, p135.es
  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZRECTANG")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = Sí")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Seleccione un pinzamiento para editar la matriz o [Asociativa/COntar/Espaciado/Columnas/Filas/Salir] <Salir>:"
    )
    cad.option("COUnt")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Indique el número de columnas <4>:"
    )
    cad.enter().enter().option("Spacing")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especificar la distancia entre columnas o [célula de Unidad] <60>:"
    )
    cad.runtime.setCommandLineText("U")
    cad.runtime.submitCommandLine()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Precise primer punto de esquina de la celda de unidad:"
    )
    cad.runtime.setCommandLineText("FOO")
    cad.runtime.submitCommandLine()
    expect(cad.commandLog().at(-1)).toBe(
      "Necesita un valor numérico distinto de cero."
    )
    cad.option("Spacing")
    cad.enter().enter().option("COLumns").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especifique la distancia entre columnas <60>:"
    )
    cad.enter().option("Rows").enter().enter()
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Especifique la elevación incremental entre filas <0>:"
    )
  })

  it("fills a grid, leaving the source in cell (0, 0)", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").option("COLumns")
    cad.type("3").enter().type("100").enter()
    cad.option("Rows").type("2").enter().type("50").enter().enter()
    cad.enter()

    expect(shown(cad).length).toBe(6)
    const starts = linesOf(shown(cad))
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toEqual(
      ["0,0", "0,50", "100,0", "100,50", "200,0", "200,50"].sort()
    )
  })

  // AutoCAD 2027's console: the cell's sides are the two spacings; a wrong
  // first corner leaves Unit cell (probe arrays/p125), Enter there too
  // (p124), a wrong opposite one is asked again (p128).
  it("spaces columns and rows by a unit cell's two corners", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
    })
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }

    cad.select("L1").command("ARRAYRECT")
    answer("S")
    answer("U")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify first corner point of unit cell:"
    )
    answer("FOO")
    answer("S")
    answer("U")
    answer("")
    answer("S")
    answer("U")
    answer("0,0")
    answer("FOO")
    answer("30,20")
    expect(cad.commandLog().slice(-11)).toEqual([
      "Specify first corner point of unit cell: FOO",
      "Requires numeric nonzero value.",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <15>: U",
      "Specify first corner point of unit cell:",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <15>: U",
      "Specify first corner point of unit cell: 0,0",
      "Specify opposite corner: FOO",
      "Invalid point.",
      "Specify opposite corner: 30,20",
    ])
    answer("S")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <30>:"
    )
    // Escape there keeps the cell given before it (ARRAYS-D4); U takes it back.
    cad.escape()
    expect(shown(cad).length).toBe(12)
    answer("_U")
    cad.select("L1").command("ARRAYRECT")
    answer("S")
    answer("U")
    cad.click(p(0, 0)).click(p(-30, -20))
    cad.enter()
    const starts = linesOf(shown(cad))
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toContain("-90,-40")
    expect(shown(cad).length).toBe(12)
  })

  // AutoCAD 2027's console (probes arrays/p125–p127, p130): a number at the
  // first corner is a square cell's side, at the opposite corner a direct
  // distance from the first towards the cursor. `-5` there is 2023's
  // (acc/wn41), unprobed in 2027.
  it("takes a number at a unit cell's corners", () => {
    for (const [locale, command, spacing, prompt, nonzero] of [
      [
        undefined,
        "ARRAYRECT",
        "S",
        "ARRAYRECT Specify the distance between columns or [Unit cell]",
        "Requires numeric nonzero value.",
      ],
      [
        es,
        "MATRIZRECTANG",
        "E",
        "MATRIZRECTANG Especificar la distancia entre columnas o [célula de Unidad]",
        "Necesita un valor numérico distinto de cero.",
      ],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
      })
      const answer = (...texts: string[]) => {
        for (const text of texts) {
          cad.runtime.setCommandLineText(text)
          cad.runtime.submitCommandLine()
        }
      }
      cad.select("L1").command(command)
      for (const refused of ["FOO", "0", "-5"]) {
        answer(spacing, "U", refused)
        expect(cad.commandLog().at(-1)).toBe(nonzero)
      }
      answer(spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <15>:`)
      answer("U", "5", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <5>:`)
      answer("U", "1e1", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <10>:`)
      cad.moveTo(p(289.985, 116.3034))
      answer("U", "100,100", "5", spacing)
      expect(cad.state().commandLine.prompt).toBe(`${prompt} <4.98>:`)
      answer("")
      expect(cad.state().commandLine.prompt).toMatch(/<0[.,]43>:$/)
    }
  })

  it("undoes the whole array in one step, U naming it (probe arrays/p159)", () => {
    for (const [locale, named] of [
      [undefined, "ARRAYRECT"],
      [es, "MATRIZRECTANG"],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
      })

      answer(cad, "_ARRAYRECT", "_L", "", "_X", "_U")

      expect(shown(cad).length).toBe(1)
      expect(cad.commandLog().at(-1)).toBe(named)
    }
  })
})

describe("ARRAY", () => {
  it("asks the array type after the set and hands it to ARRAYRECT (probes arrays/p100, p101)", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "AR", "_L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAY Enter array type [Rectangular/PAth/POlar] <Rectangular>:"
    )
    answer(cad, "_X")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    answer(cad, "")
    expect(cad.commandLog().slice(-8)).toEqual([
      "AR ARRAY",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      "Enter array type [Rectangular/PAth/POlar] <Rectangular>: _X",
      "Invalid option keyword.",
      "Enter array type [Rectangular/PAth/POlar] <Rectangular>:",
      "Type = Rectangular  Associative = Yes",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAY Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
    )
    answer(cad, "_COU", "2", "1", "")
    expect(centres(cad)).toHaveLength(2)
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks it in Spanish, CAmino for PAth (probes arrays/p103, p104)", () => {
    const cad = createHarness({ locale: es, entities: [circle()] })

    answer(cad, "MA", "_L", "")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZ Indique el tipo de matriz [Rectangular/CAmino/POlar] <Rectangular>:"
    )
    answer(cad, "_X")
    expect(cad.commandLog().at(-1)).toBe("Opción no válida.")
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = Sí")
    cad.escape()

    answer(cad, "MATRIZ", "_L", "", "CA")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Ruta  Asociativa = Sí")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZ Seleccione la curva de trayectoria:"
    )
  })

  it("hands the set to ARRAYPOLAR at POlar (probe arrays/p204)", () => {
    for (const [locale, type] of [
      [undefined, "Type = Polar  Associative = Yes"],
      [es, "Tipo = Polar  Asociativa = Sí"],
    ] as const) {
      const cad = createHarness({ locale, entities: [circle()] })

      answer(cad, "_ARRAY", "_L", "", "_PO")
      expect(cad.commandLog().at(-1)).toBe(type)
      answer(cad, "0,0", "_X")
      expect(centres(cad)).toHaveLength(6)
    }
  })

  it("takes a set selected before it, asking no objects again", () => {
    const cad = createHarness({ entities: [circle()] })

    cad.select("C")
    answer(cad, "AR", "")
    expect(cad.commandLog()).toEqual([
      "AR ARRAY 1 found",
      "Enter array type [Rectangular/PAth/POlar] <Rectangular>:",
      "Type = Rectangular  Associative = Yes",
    ])
  })

  // WHY ARRAY, not ARRAYRECT, in U's echo and at the prompt: the run is
  // ARRAY's; what AutoCAD's U says after ARRAY is unprobed.
  it("is one undo step, which U names, and Enter repeats it", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "AR", "_L", "", "", "_X")
    expect(centres(cad)).toHaveLength(12)
    answer(cad, "_U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "ARRAY"])
    expect(centres(cad)).toHaveLength(1)

    const again = createHarness({ entities: [circle()] })
    answer(again, "AR", "_L", "", "", "_X", "")
    expect(again.state().commandLine.prompt).toBe("ARRAY Select objects:")
  })

  // WHY read off Tool.ts: a hook an array command gains later (a rollover,
  // hidden objects) is otherwise lost under ARRAY without a word.
  it("forwards every Tool hook its array commands have", async () => {
    const { ArrayCommandTool } = await import("./ArrayCommandTool")
    const { ArrayTool } = await import("./ArrayTool")
    const { ArrayPolarTool } = await import("./ArrayPolarTool")
    const { ArrayPathTool } = await import("./ArrayPathTool")
    const source = readFileSync(new URL("./Tool.ts", import.meta.url), "utf8")
    const port = source.slice(source.indexOf("export interface Tool {"))
    const hooks = [
      ...port.slice(0, port.indexOf("\n}\n")).matchAll(/^ {2}(\w+)\?\(/gm),
    ].map((match) => match[1])
    expect(hooks).toContain("buildOverlay")
    const has = (type: { prototype: object }, hook: string) =>
      typeof (type.prototype as Record<string, unknown>)[hook] === "function"
    for (const type of [ArrayTool, ArrayPolarTool, ArrayPathTool]) {
      const lost = hooks.filter(
        (hook) => has(type, hook) && !has(ArrayCommandTool, hook)
      )
      expect(lost).toEqual([])
    }
  })
})

describe("ARRAYRECT's answers", () => {
  it("refuses a zero distance and asks again; the elevation takes 0 (probes arrays/p117, p120, p135)", () => {
    for (const [locale, words] of [
      [undefined, "Value must be nonzero."],
      [es, "El valor debe ser diferente de cero."],
    ] as const) {
      const cad = createHarness({ locale, entities: [circle()] })
      const question = () => cad.state().commandLine.prompt

      answer(cad, "_ARRAYRECT", "_L", "", "_S")
      const columns = question()
      answer(cad, "0")
      expect(cad.commandLog().at(-1)).toBe(words)
      expect(question()).toBe(columns)
      answer(cad, "7")
      const rows = question()
      answer(cad, "0")
      expect(cad.commandLog().at(-1)).toBe(words)
      expect(question()).toBe(rows)
      answer(cad, "8", "_COL", "", "0")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "", "_R", "", "0")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "", "0", "_X")
      expect(centres(cad)).toHaveLength(12)
      expect(hasCentre(cad, 31, 26)).toBe(true)
    }
  })

  it("refuses FOO at Spacing's rows with no option keyword (probes arrays/p121, p138)", () => {
    for (const [locale, rows, elevation] of [
      [
        undefined,
        "Requires numeric distance or two points.",
        "Requires numeric distance, two points, or option keyword.",
      ],
      [
        es,
        "Requiere una distancia numérica o dos puntos.",
        "Requiere una distancia numérica, dos puntos o una opción.",
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: [circle()] })

      answer(cad, "_ARRAYRECT", "_L", "", "_S", "7", "FOO")
      expect(cad.commandLog().at(-1)).toBe(rows)
      answer(cad, "8", "_R", "", "", "FOO")
      expect(cad.commandLog().at(-1)).toBe(elevation)
    }
  })

  it("asks again in silence at a point or a number typed at the main prompt (probes arrays/p109, p129)", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "5", "30,20")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: 5",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: 30,20",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
    )
  })

  it("writes the defaults without trailing zeros (probes arrays/p116, p130, p135)", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "_S")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <6>:"
    )
    answer(cad, "4.5", "", "_R", "", "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Enter the number of rows <3>:",
      "Specify the distance between rows <6>:",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the incrementing elevation between rows <0>:"
    )
    answer(cad, "", "_COL", "")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns <4.5>:"
    )
  })

  it("spaces a turned UCS's default by the extents seen along its axes (probe arrays/p165)", () => {
    const cad = createHarness()

    answer(cad, "_UCS", "_Z", "30", "_CIRCLE", "10,10", "2")
    answer(cad, "_ARRAYRECT", "_L", "", "_S")
    // 1.5 × 4 (cos 30° + sin 30°), at the drawing's two places.
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Specify the distance between columns or [Unit cell] <8.2>:"
    )
    answer(cad, "", "", "_X")
    expect(hasCentre(cad, 10.7583, 17.7583)).toBe(true)
    expect(hasCentre(cad, -0.437822, 20.7583)).toBe(true)
  })

  it("reads a unit cell's sides along the UCS's axes, *x,y in the WCS (probe arrays/p147)", () => {
    const cad = createHarness()

    answer(cad, "_UCS", "_Z", "30", "_CIRCLE", "10,10", "2")
    answer(cad, "_ARRAYRECT", "_L", "", "_S", "_U", "*0,0", "*30,20", "_X")
    expect(centres(cad)).toHaveLength(12)
    expect(hasCentre(cad, 34.8205, 31.6506)).toBe(true)
    expect(hasCentre(cad, 2.5, 15.6699)).toBe(true)
    expect(hasCentre(cad, 94.8205, 71.6506)).toBe(true)
  })

  it("leaves LASTPOINT where it was after a unit cell's corners (probe arrays/p148)", () => {
    const cad = createHarness()

    answer(cad, "_CIRCLE", "10,10", "2")
    answer(cad, "_ARRAYRECT", "_L", "", "_S", "_U", "3,4", "30,20", "_X")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
  })

  it("adds the copies in drawing order, whatever the pick order (probe arrays/p167)", () => {
    const cad = createHarness({
      entities: [lineOf(p(40, 0), p(50, 0), { id: "L" }), circle()],
    })

    answer(cad, "_ARRAYRECT", "12,10", "45,0", "", "_COU", "2", "1", "_X")
    const added = shown(cad).slice(2)
    expect(added.map((e) => e.type)).toEqual(["line", "circle"])
    expect(linesOf(added)[0].start).toBeCloseToPoint(p(103, 0))
    expect(hasCentre(cad, 73, 10)).toBe(true)
  })

  it("gives the copies the source's layer, colour and lineweight (probe arrays/p164)", () => {
    const source = {
      ...circle(),
      layerId: "SRC",
      color: "#0000ff",
      lineweight: 0.5,
    } as Entity
    const cad = createHarness()
    cad.runtime.document.load([source], {
      layers: [layerOf("0"), layerOf("SRC"), layerOf("CUR")],
    })
    cad.runtime.setCurrentLayer("CUR")
    cad.runtime.setCurrentColor("#ff0000")
    cad.runtime.setCurrentLineweight(0.3)

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    const all = shown(cad) as (Entity & {
      color?: string
      lineweight?: number
    })[]
    expect(all).toHaveLength(12)
    for (const e of all) {
      expect([e.layerId, e.color, e.lineweight]).toEqual([
        "SRC",
        "#0000ff",
        0.5,
      ])
    }
  })

  it("keeps the source's Z in the copies (probe arrays/p166)", () => {
    const cad = createHarness({ entities: [withElevation(circle(), 5)] })

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    const zs = shown(cad).map((e) => (e as { elevation?: number }).elevation)
    expect(zs).toEqual(Array(12).fill(5))
  })

  it("leaves nothing selected after a preselection (probes arrays/p169–p178)", () => {
    for (const command of ["_ARRAYRECT", "_ARRAY"]) {
      const cad = createHarness({ entities: [circle()] })
      cad.select("C")
      answer(cad, command)
      if (command === "_ARRAY") answer(cad, "")
      answer(cad, "_X")
      expect(cad.selectedIds()).toEqual([])
      expect(centres(cad)).toHaveLength(12)
    }
  })
})

/** The circles' centres, to the console's four places, in the order made. */
function centresAt(cad: CadHarness): string[] {
  const at = (v: number) => {
    const x = Math.round(v * 1e4) / 1e4
    return String(x === 0 ? 0 : x)
  }
  return centres(cad).map((c) => `${at(c.x)},${at(c.y)}`)
}

/** ARRAYPOLAR on the probes' circle, answered up to its centre's prompt. */
function polar(locale?: typeof es): CadHarness {
  const cad = createHarness({ locale, entities: [circle()] })
  return answer(cad, "_ARRAYPOLAR", "_L", "")
}

const POLAR_MAIN =
  "ARRAYPOLAR Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>:"

describe("ARRAYPOLAR", () => {
  // probe arrays/p248: a line round 0,0, ROTate Yes.
  it("turns each item about the centre", () => {
    const cad = createHarness({
      entities: [lineOf(p(10, 10), p(20, 15), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYPOLAR").click(p(0, 0))
    cad.option("Items").type("4").enter().enter()

    const lines = linesOf(shown(cad))
    expect(lines.map((line) => line.start)).toBeCloseToPoints([
      p(10, 10),
      p(-10, 10),
      p(-10, -10),
      p(10, -10),
    ])
    expect(lines.map((line) => line.end)).toBeCloseToPoints([
      p(20, 15),
      p(-15, 20),
      p(-20, -15),
      p(15, -20),
    ])
  })

  // probes arrays/p05, p214, p263: the prompts in order, the defaults the
  // answers leave (4 items 30° apart fill 90°).
  it("asks AutoCAD's questions over the preview and writes them answered", () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYPOLAR")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify center point of array:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(POLAR_MAIN)
    cad.option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Enter number of items in array <6>:"
    )
    cad.type("4").enter().option("Angle between")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <90>:"
    )
    cad.type("30").enter().option("Fill angle")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <90>:"
    )
    cad.type("180").enter().option("ROTate items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Rotate arrayed items? [Yes/No] <Yes>:"
    )
    cad.option("No").option("eXit")

    expect(cad.commandLog()).toEqual([
      "ARRAYPOLAR",
      "1 found",
      "Type = Polar  Associative = Yes",
      "Specify center point of array:",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: I",
      "Enter number of items in array <6>: 4",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: A",
      "Specify angle between items <90>: 30",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: F",
      "Specify the angle to fill (+=ccw, -=cw) <90>: 180",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: ROT",
      "Rotate arrayed items? [Yes/No] <Yes>: N",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: X",
    ])
    // Four items over 180°, 60° apart, carried round by the extents' centre
    // 100,10 without turning (p245).
    expect(linesOf(shown(cad)).map((line) => line.start)).toBeCloseToPoints([
      p(100, 0),
      p(41.339746, 81.60254),
      p(-58.660254, 71.60254),
      p(-100, -20),
    ])
    expect(linesOf(shown(cad)).every((l) => l.end.x === l.start.x)).toBe(true)
  })

  // probes arrays/p201, p262: 2027's Spanish centre prompt.
  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZPOLAR")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Polar  Asociativa = Sí")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Especifique el punto central de la matriz:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Seleccione un pinzamiento para editar la matriz o [Asociativa/Elementos/ángUlo entre/ángulo de Relleno/Girar objetos/Salir] <Salir>:"
    )
    cad.option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Indique el número de elementos de la matriz <6>:"
    )
    cad.enter().option("Angle between")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Indique el ángulo entre elementos <60>:"
    )
    cad.enter().option("Fill angle")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Precise el ángulo que se debe rellenar (+ =antihorario, -=horario) <360>:"
    )
    cad.enter().option("ROTate items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR ¿Girar elementos de la matriz? [Sí/No] <Sí>:"
    )
  })

  // probe arrays/p262: E 4, U Enter, R Enter, G N, S.
  it("answers the Spanish letters", () => {
    const cad = polar(es)

    answer(cad, "0,0", "E", "4", "U", "", "R", "", "G", "N", "S")
    expect(centresAt(cad)).toEqual(["10,10", "-10,10", "-10,-10", "10,-10"])
  })
})

describe("ARRAYPOLAR's answers", () => {
  it("refuses Enter at the centre and asks again (probe arrays/p206)", () => {
    for (const [locale, words] of [
      [undefined, "Point or option keyword required."],
      [es, "Se requiere un punto o una opción."],
    ] as const) {
      const cad = polar(locale)

      answer(cad, "")
      expect(cad.commandLog().at(-1)).toBe(words)
      cad.enter()
      expect(cad.commandLog().at(-1)).toBe(words)
      expect(cad.activeToolId()).toBe("arraypolar")
      answer(cad, "0,0", "_X")
      expect(centres(cad)).toHaveLength(6)
    }
  })

  it("asks again in silence at a point or a number typed at the main prompt (probes arrays/p208, p209)", () => {
    const cad = polar()

    answer(cad, "0,0", "5,5", "7")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: 5,5",
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: 7",
    ])
    expect(cad.state().commandLine.prompt).toBe(POLAR_MAIN)
    expect(shown(cad).length).toBe(1)
  })

  it("asks ROWs or ROTate? at R, ROWs declared but not built (probe arrays/p210)", () => {
    const cad = polar()

    answer(cad, "0,0", "R")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select grip to edit array or [ASsociative/Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: R",
      "Ambiguous response, please clarify...",
    ])
    expect(cad.state().commandLine.prompt).toBe("ARRAYPOLAR ROWs or ROTate?")
    answer(cad, "ROT")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Rotate arrayed items? [Yes/No] <Yes>:"
    )
    // AutoCAD asks the rows (p256); here ROWs is refused.
    answer(cad, "", "ROW")
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")
  })

  it("refuses a count that is no positive whole number up to 32767 (probes arrays/p212, p278, p279)", () => {
    for (const [locale, range] of [
      [
        undefined,
        "Requires an integer between 1 and 32767, or option keyword.",
      ],
      [es, "Requiere un nº entero entre 1 y 32767, o una opción."],
    ] as const) {
      const cad = polar(locale)

      answer(cad, "0,0", "_I", "200000")
      expect(cad.commandLog().at(-1)).toBe(range)
    }
    const cad = polar()
    answer(cad, "0,0", "_I", "FOO", "0", "-3", "2.5", "4", "_X")
    expect(cad.commandLog().slice(-10, -2)).toEqual([
      "Enter number of items in array <6>: FOO",
      "Requires a positive nonzero integer or option keyword.",
      "Enter number of items in array <6>: 0",
      "Value must be positive and nonzero.",
      "Enter number of items in array <6>: -3",
      "Value must be positive and nonzero.",
      "Enter number of items in array <6>: 2.5",
      "Requires a positive nonzero integer or option keyword.",
    ])
    expect(centresAt(cad)).toEqual(["10,10", "-10,10", "-10,-10", "10,-10"])

    const many = polar()
    answer(many, "0,0", "_I", "1001", "_X")
    expect(centres(many)).toHaveLength(1001)
  })

  it("refuses an angle between of 0 or less, and a fill of 0, in AutoCAD's words (probes arrays/p214, p219)", () => {
    for (const [locale, positive, zero] of [
      [
        undefined,
        "Value must be positive and nonzero.",
        "The parameter cannot be set to 0.  Enter a non-zero number or expression.",
      ],
      [
        es,
        "El valor debe ser positivo y diferente de cero.",
        "El parámetro no se puede establecer en 0. Introduzca un número distinto de cero o una expresión.",
      ],
    ] as const) {
      const cad = polar(locale)

      answer(cad, "0,0", "_A", "0")
      expect(cad.commandLog().at(-1)).toBe(positive)
      answer(cad, "-30")
      expect(cad.commandLog().at(-1)).toBe(positive)
      answer(cad, "30", "_F", "0")
      expect(cad.commandLog().at(-1)).toBe(zero)
      answer(cad, "")
      expect(centres(cad)).toHaveLength(1)
    }
    const cad = polar()
    answer(cad, "0,0", "_A", "30", "_F")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <150>:"
    )
  })

  it("takes a fill beyond a turn as its remainder (probe arrays/p217)", () => {
    const cad = polar()

    answer(cad, "0,0", "_F", "400", "_X")
    expect(centresAt(cad)).toEqual([
      "10,10",
      "8.5109,11.2944",
      "6.8562,12.369",
      "5.0681,13.2028",
      "3.1813,13.7797",
      "1.2326,14.0883",
    ])
  })

  it("fits a full turn once the angles between reach 360°, asking nothing (probes arrays/p267–p271)", () => {
    const fullTurn = [
      "10,10",
      "-3.6603,13.6603",
      "-13.6603,3.6603",
      "-10,-10",
      "3.6603,-13.6603",
      "13.6603,-3.6603",
    ]
    for (const answers of [
      ["_F", "180", "_A", "90"], // p267: 450°
      ["_A", "90"], // p268
      ["_A", "72"], // p270: exactly 360°
      ["_A", "73"], // p271: 365°
    ]) {
      const cad = polar()

      answer(cad, "0,0", ...answers, "_A")
      expect(cad.state().commandLine.prompt).toBe(
        "ARRAYPOLAR Specify angle between items <60>:"
      )
      answer(cad, "", "_F")
      expect(cad.state().commandLine.prompt).toBe(
        "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <360>:"
      )
      answer(cad, "", "_X")
      expect(centresAt(cad)).toEqual(fullTurn)
    }
    const short = polar()
    answer(short, "0,0", "_A", "61", "_F")
    expect(short.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <305>:"
    )
  })

  it("keeps a clockwise ring clockwise, its defaults unsigned (probes arrays/p216, p274, p276, p277)", () => {
    const clockwise = [
      "10,10",
      "12.6007,6.4204",
      "13.968,2.2123",
      "13.968,-2.2123",
      "12.6007,-6.4204",
      "10,-10",
    ]
    const cad = polar()

    answer(cad, "0,0", "_F", "-90", "_F")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <90>:"
    )
    answer(cad, "", "_A")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <18>:"
    )
    answer(cad, "", "_X")
    expect(centresAt(cad)).toEqual(clockwise)

    const between = polar()
    answer(between, "0,0", "_F", "-90", "_A", "30", "_F")
    expect(between.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <150>:"
    )
    answer(between, "", "_X")
    expect(centresAt(between)).toEqual([
      "10,10",
      "13.6603,3.6603",
      "13.6603,-3.6603",
      "10,-10",
      "3.6603,-13.6603",
      "-3.6603,-13.6603",
    ])
  })

  it("writes the angles without trailing zeros, at the drawing's precision (probes arrays/p264, p275)", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "AUPREC", "2", "_ARRAYPOLAR", "_L", "", "0,0", "_A")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <60>:"
    )
    answer(cad, "", "_I", "4", "_F", "100", "_A")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <33.33>:"
    )
    answer(cad, "", "_F")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <100>:"
    )
  })

  // WHY: the preview is capped (arrayCounts.ts); the commit is not.
  it("previews no more than a thousand items but makes them all", () => {
    const cad = polar()
    const ghosts = () => itemCircles(cad).length

    answer(cad, "0,0", "_I")
    cad.type("5000")
    expect(ghosts()).toBe(1000)
    cad.enter().enter()
    expect(centres(cad)).toHaveLength(5000)
  })
})

describe("the arrays' counts", () => {
  // probes arrays/p279 (ARRAYPOLAR's), p111 and p331: the same 16-bit integer
  // prompt at ARRAYRECT's and ARRAYPATH's counts.
  it("take up to 32767 in ARRAYRECT and ARRAYPATH too", () => {
    const range = "Requires an integer between 1 and 32767, or option keyword."
    const rect = createHarness({ entities: [circle()] })
    answer(rect, "_ARRAYRECT", "_L", "", "_COU", "200000")
    expect(rect.commandLog().at(-1)).toBe(range)
    answer(rect, "1001", "1", "_X")
    expect(centres(rect)).toHaveLength(1001)

    const path = createHarness({
      entities: [circle(), lineOf(p(0, 0), p(1000, 0), { id: "P" })],
    })
    path.select("C").command("ARRAYPATH").click(p(500, 0))
    answer(path, "_M", "_D", "_I", "200000")
    expect(path.commandLog().at(-1)).toBe(range)
    answer(path, "1001", "_X")
    expect(centres(path)).toHaveLength(1001)
  })
})

describe("ARRAYPOLAR's centre", () => {
  it("refuses FOO at the centre and at the main prompt in AutoCAD's words (probes arrays/p205, p207, p211)", () => {
    for (const [locale, words] of [
      [undefined, "Point or option keyword required."],
      [es, "Se requiere un punto o una opción."],
    ] as const) {
      const cad = polar(locale)

      answer(cad, "FOO")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "0,0", "FOO")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "_Y")
      expect(cad.commandLog().at(-1)).toBe(words)
    }
  })

  it("reads a typed centre as any typed point (probes arrays/p223–p228)", () => {
    for (const [centre, second] of [
      ["0,0,5", "-3.6603,13.6603"], // p223: the copies keep the source's Z
      ["@10,0", "15,1.3397"], // p224: from LASTPOINT 10,10
      ["20<45", "15.6583,8.4839"], // p225
      ["@", "10,10"], // p226
    ]) {
      const cad = createHarness()
      answer(cad, "_CIRCLE", "10,10", "2", "_ARRAYPOLAR", "_L", "")

      answer(cad, centre, "_X")
      expect(centresAt(cad)[1]).toBe(second)
    }
    const turned = createHarness()
    answer(turned, "_CIRCLE", "10,10", "2", "_UCS", "_Z", "30")
    answer(turned, "_ARRAYPOLAR", "_L", "", "*0,0", "_I", "4", "_X")
    expect(centresAt(turned)).toEqual(["10,10", "-10,10", "-10,-10", "10,-10"])
  })

  it("leaves LASTPOINT where it was (probes arrays/p229, p273)", () => {
    const cad = createHarness()

    answer(cad, "_CIRCLE", "10,10", "2", "_ARRAYPOLAR", "_L", "")
    answer(cad, "30,40", "5,5", "_X")
    expect(centresAt(cad)[1]).toBe("45.9808,7.6795")
    expect(lastPoint(cad)).toBe(" X = 10.00     Y = 10.00     Z = 0.00")
  })

  it("takes an object snap typed at the centre (probes arrays/p231, p232, p234)", () => {
    const centreOf = createHarness()
    answer(centreOf, "_CIRCLE", "50,50", "10", "_CIRCLE", "10,10", "2")
    answer(centreOf, "_ARRAYPOLAR", "_L", "", "_CEN", "60,50", "_I", "4", "_X")
    expect(centresAt(centreOf).slice(2)).toEqual(["90,10", "90,90", "10,90"])

    const crossing = createHarness()
    answer(crossing, "_LINE", "-50,30", "50,30", "", "_LINE", "0,-20", "0,80")
    answer(crossing, "", "_CIRCLE", "10,10", "2", "_ARRAYPOLAR", "_L", "")
    answer(crossing, "_INT", "0.5,30.5", "_I", "4", "_X")
    expect(centresAt(crossing).slice(1)).toEqual(["20,40", "-10,50", "-20,20"])

    const end = createHarness()
    answer(end, "_LINE", "-50,30", "50,30", "", "_CIRCLE", "10,10", "2")
    answer(end, "_ARRAYPOLAR", "_L", "", "_END", "-49,31", "_I", "4", "_X")
    expect(centresAt(end).slice(1)).toEqual(["-30,90", "-110,50", "-70,-30"])
  })
})

describe("ARRAYPOLAR's prompts", () => {
  it("keeps the source alone at one item (probe arrays/p213)", () => {
    const cad = polar()

    answer(cad, "0,0", "_I", "1", "_X")
    expect(centresAt(cad)).toEqual(["10,10"])
  })

  it("keeps the fill when the count changes (probes arrays/p215, p220)", () => {
    const seven = polar()
    answer(seven, "0,0", "_I", "7", "_F", "180", "_A")
    expect(seven.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <30>:"
    )
    answer(seven, "30", "_F")
    expect(seven.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify the angle to fill (+=ccw, -=cw) <180>:"
    )
    answer(seven, "", "_X")
    expect(centresAt(seven)).toHaveLength(7)
    expect(centresAt(seven).at(-1)).toBe("-10,-10")

    const four = polar()
    answer(four, "0,0", "_A", "30", "_I", "4", "_A")
    expect(four.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify angle between items <50>:"
    )
    answer(four, "", "_X")
    expect(centresAt(four)).toEqual([
      "10,10",
      "-1.2326,14.0883",
      "-11.5846,8.1116",
      "-13.6603,-3.6603",
    ])
  })

  it("refuses anything but Yes or No at ROTate items, its default the last answer (probe arrays/p222)", () => {
    for (const [locale, words, prompt] of [
      [
        undefined,
        "Invalid option keyword.",
        "ARRAYPOLAR Rotate arrayed items? [Yes/No] <No>:",
      ],
      [
        es,
        "Opción no válida.",
        "MATRIZPOLAR ¿Girar elementos de la matriz? [Sí/No] <No>:",
      ],
    ] as const) {
      const cad = polar(locale)

      answer(cad, "0,0", "_ROT", "FOO")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "_I")
      expect(cad.commandLog().at(-1)).toBe(words)
      answer(cad, "_N", "_ROT")
      expect(cad.state().commandLine.prompt).toBe(prompt)
    }
  })

  it("keeps each default at Enter and makes the array at the main prompt's (probe arrays/p243)", () => {
    const cad = polar()

    answer(cad, "0,0", "_I", "", "_A", "", "_F", "", "_ROT", "", "")
    expect(centres(cad)).toHaveLength(6)
    expect(cad.state().commandLine.prompt).toBe("Command:")
  })

  it("refuses a command typed at its prompts, transparent or not (probes arrays/p238, p244)", () => {
    const cad = polar()

    answer(cad, "_LINE")
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")
    answer(cad, "0,0", "_I", "_LINE")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires a positive nonzero integer or option keyword."
    )
    answer(cad, "4", "'_LINE")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("resumes after 'ZOOM at the centre, the main prompt and ROTate items (probes arrays/p235, p236, p239)", () => {
    const cad = polar()

    answer(cad, "'_ZOOM", "_E")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Specify center point of array:"
    )
    answer(cad, "0,0", "'_ZOOM", "_E")
    expect(cad.state().commandLine.prompt).toBe(POLAR_MAIN)
    answer(cad, "_ROT", "'_ZOOM", "_E")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPOLAR Rotate arrayed items? [Yes/No] <Yes>:"
    )
    answer(cad, "_N", "_X")
    expect(centres(cad)).toHaveLength(6)
  })

  it("is one undo step, which U names and REDO makes again (probes arrays/p240, p241)", () => {
    const cad = polar()
    answer(cad, "0,0", "_X", "_U")
    expect(cad.commandLog().at(-1)).toBe("ARRAYPOLAR")
    expect(shown(cad).length).toBe(1)

    const two = createHarness()
    answer(two, "_CIRCLE", "10,10", "2", "_ARRAYPOLAR", "_L", "", "0,0", "_X")
    answer(two, "_UNDO", "2")
    expect(two.commandLog().at(-1)).toBe("ARRAYPOLAR CIRCLE")
    expect(shown(two).length).toBe(0)
    answer(two, "_REDO")
    expect(two.commandLog().slice(-2)).toEqual([
      "CIRCLE ARRAYPOLAR",
      "Everything has been redone",
    ])
    expect(shown(two).length).toBe(6)

    const spanish = polar(es)
    answer(spanish, "0,0", "_X", "_U")
    expect(spanish.commandLog().at(-1)).toBe("MATRIZPOLAR")
  })
})

describe("what ARRAYPOLAR makes", () => {
  /** Each object's first and last points, to the console's four places. */
  function ends(cad: CadHarness): string[] {
    const at = (v: number) => {
      const x = Math.round(v * 1e4) / 1e4
      return String(x === 0 ? 0 : x)
    }
    const pt = (q: { x: number; y: number }) => `${at(q.x)},${at(q.y)}`
    return shown(cad).map((e) => {
      switch (e.type) {
        case "line":
          return `${pt(e.start)} ${pt(e.end)}`
        case "polyline":
          return `${pt(e.vertices[0])} ${pt(e.vertices.at(-1)!)}`
        case "circle":
        case "arc":
          return pt(e.center)
        default:
          return e.type
      }
    })
  }

  it("carries each item round by the set's extents' centre at ROTate No (probes arrays/p245–p247, p252)", () => {
    const line = createHarness()
    answer(line, "_LINE", "10,10", "20,15", "", "_ARRAYPOLAR", "_L", "")
    answer(line, "0,0", "_I", "4", "_ROT", "_N", "_X")
    expect(ends(line)).toEqual([
      "10,10 20,15",
      "-17.5,12.5 -7.5,17.5",
      "-20,-15 -10,-10",
      "7.5,-17.5 17.5,-12.5",
    ])

    const polyline = createHarness()
    answer(polyline, "_PLINE", "10,10", "30,10", "30,14", "")
    answer(polyline, "_ARRAYPOLAR", "_L", "", "0,0", "_I", "4", "_ROT", "_N")
    answer(polyline, "_X")
    expect(ends(polyline)).toEqual([
      "10,10 30,14",
      "-22,18 -2,22",
      "-30,-14 -10,-10",
      "2,-22 22,-18",
    ])

    // p247: item by item, each item's objects in the set's order.
    const two = createHarness()
    answer(two, "_LINE", "10,10", "20,15", "", "_CIRCLE", "40,0", "2")
    answer(two, "_ARRAYPOLAR", "_W", "5,-5", "45,20", "", "0,0", "_I", "4")
    answer(two, "_ROT", "_N", "_X")
    expect(ends(two).slice(2)).toEqual([
      "-22.5,29.5 -12.5,34.5",
      "7.5,19.5",
      "-42,-3 -32,2",
      "-12,-13",
      "-9.5,-22.5 0.5,-17.5",
      "20.5,-32.5",
    ])

    const arc = createHarness()
    answer(arc, "_ARC", "_C", "20,0", "30,0", "20,10", "_ARRAYPOLAR", "_L")
    answer(arc, "", "0,0", "_I", "4", "_ROT", "_N", "_X")
    expect(ends(arc)).toEqual(["20,0", "-10,20", "-30,-10", "0,-30"])
  })

  it("turns the ring in a turned UCS as in plan (probe arrays/p250)", () => {
    const cad = createHarness()

    answer(cad, "_LINE", "10,10", "20,15", "", "_UCS", "_Z", "30")
    answer(cad, "_ARRAYPOLAR", "_L", "", "10,0", "_I", "4", "_X")
    expect(ends(cad).slice(1)).toEqual([
      "3.6603,6.3397 -1.3397,16.3397",
      "7.3205,0 -2.6795,-5",
      "13.6603,3.6603 18.6603,-6.3397",
    ])
  })

  it("keeps the source's Z (probe arrays/p251)", () => {
    const cad = createHarness()

    answer(cad, "_CIRCLE", "10,10,5", "2", "_ARRAYPOLAR", "_L", "", "0,0")
    answer(cad, "_I", "4", "_X")
    const zs = shown(cad).map((e) => (e as { elevation?: number }).elevation)
    expect(zs).toEqual([5, 5, 5, 5])
  })
})

const round4 = (v: number) => {
  const x = Math.round(v * 1e4) / 1e4
  return Object.is(x, -0) ? 0 : x
}

/** The circles' centres' X, rounded to the console's four places, in order. */
function centreXs(cad: CadHarness): number[] {
  return centres(cad)
    .map((c) => round4(c.x))
    .sort((a, b) => a - b)
}

/** Whether a line runs from a to b, to the console's four places. */
function hasLine(
  cad: CadHarness,
  [ax, ay]: readonly [number, number],
  [bx, by]: readonly [number, number]
): boolean {
  const near = (u: number, v: number) => Math.abs(u - v) < 1e-4
  return linesOf(shown(cad)).some(
    (l) =>
      near(l.start.x, ax) &&
      near(l.start.y, ay) &&
      near(l.end.x, bx) &&
      near(l.end.y, by)
  )
}

/** The probes' path: a line from 0,0 to 100,0. */
const pathLine = () => lineOf(p(0, 0), p(100, 0), { id: "P" })

/**
 * The probes' drawing — the line and the circle at 10,10 — the circle
 * arrayed along the line picked at `at`: off its midpoint, a tie AutoCAD
 * breaks either way (p06, p310, p344).
 */
function pathArray(at = "30,0", locale?: typeof es): CadHarness {
  const cad = createHarness({ locale, entities: [pathLine(), circle()] })
  cad.select("C")
  answer(cad, locale ? "MATRIZCAMINO" : "ARRAYPATH", at)
  return cad
}

/** A drawing whose layer LK is locked. */
function withLocked(entities: Entity[], locale?: typeof es): CadHarness {
  const cad = createHarness({ locale })
  cad.runtime.document.load(entities, {
    layers: [layerOf("0"), layerOf("LK", { locked: true })],
  })
  return cad
}

const PATH_MAIN = /^ARRAYPATH Select grip to edit array/

/** The strokes the tool draws over the probes' path, the line along y = 0. */
function pathStrokes(cad: CadHarness): unknown[] {
  const onPath = (point: { x: number; y: number }) =>
    Math.abs(cad.runtime.viewport.screenToWorld(point).y) < 1e-6
  return cad
    .scene()
    .primitives.flatMap((prim) =>
      prim.kind === "segment" &&
      prim.stroke.color !== undefined &&
      onPath(prim.a) &&
      onPath(prim.b) &&
      (prim.stroke.color === THEME.entityHover ||
        prim.stroke.color === THEME.selected)
        ? [prim.stroke]
        : []
    )
}

describe("ARRAYPATH", () => {
  const path = lineOf(p(0, 0), p(200, 0), { id: "PATH" })
  const source = lineOf(p(400, -25), p(400, 25), { id: "SRC" })

  it("divides the path evenly, the source kept as item 1 (probe arrays/p306)", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(50, 0))
    cad.option("Method").option("Divide").option("Items")
    cad.type("5").enter().enter()

    // The source, four items stepped 50 from it, and the path.
    expect(shown(cad).length).toBe(6)
    expect(shown(cad).find((e) => e.id === "SRC")).toEqual(source)
    const xs = linesOf(shown(cad))
      .filter((line) => line.id !== "PATH")
      .map((line) => round4(line.start.x))
      .sort((a, b) => a - b)
    expect(xs).toEqual([400, 450, 500, 550, 600])
  })

  it("places items at a fixed spacing under the Measure method", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(50, 0))
    cad.option("Items").type("40").enter()
    expect(cad.commandLog().at(-1)).toBe("Maximum items = 6")
    cad.option("Fill entire path").enter()

    // 0, 40, 80, 120, 160, 200 → six items, plus the path.
    expect(shown(cad).length).toBe(7)
  })

  it("takes the copies back in one undo step, which U names (probe arrays/p369)", () => {
    for (const [locale, name] of [
      [undefined, "ARRAYPATH"],
      [es, "MATRIZCAMINO"],
    ] as const) {
      const cad = createHarness({ locale, entities: [path, source] })

      cad.select("SRC").command(name).click(p(50, 0)).option("eXit")
      answer(cad, "_U")

      expect(cad.commandLog().at(-1)).toBe(name)
      expect(shown(cad).length).toBe(2)
      expect(cad.runtime.document.get("SRC")).toEqual(source)
    }
  })

  it("turns each item with the path, or only moves it (probes arrays/p304, p305)", () => {
    const arcPath = arcOf(p(0, 0), 50, 0, deg(180), { id: "PATH" })
    const bar = lineOf(p(70, 0), p(80, 0), { id: "SRC" })

    const aligned = createHarness({ entities: [arcPath, bar] })
    aligned.select("SRC").command("ARRAYPATH").click(p(50, 0)).enter()
    expect(linesOf(shown(aligned))).toHaveLength(11)
    expect(hasLine(aligned, [70, 0], [80, 0])).toBe(true)
    expect(hasLine(aligned, [66.8736, 20.6864], [76.4269, 23.6416])).toBe(true)
    expect(hasLine(aligned, [-69.2995, 9.8784], [-79.1994, 11.2896])).toBe(true)

    const free = createHarness({ entities: [arcPath, bar] })
    free.select("SRC").command("ARRAYPATH").click(p(50, 0))
    free.option("Align items").option("No").enter()
    expect(linesOf(shown(free))).toHaveLength(11)
    expect(hasLine(free, [67.7668, 14.776], [77.7668, 14.776])).toBe(true)
    expect(hasLine(free, [-29.4996, 7.056], [-19.4996, 7.056])).toBe(true)
  })

  it("asks AutoCAD's questions over the preview and writes them answered (probes arrays/p307, p330–p334, p347)", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH")
    expect(cad.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
    cad.click(p(400, 0))
    expect(cad.commandLog().slice(-2)).toEqual([
      "Objects selected to be arrayed may not be selected as path curve.",
      "1 was filtered out",
    ])
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Select grip to edit array or [ASsociative/Method/Items/Align items/eXit] <eXit>:"
    )
    cad.option("Method")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Enter path method [Divide/Measure] <Measure>:"
    )
    cad.option("Divide").option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Enter number of items along path <3>:"
    )
    cad.type("5").enter().option("Method").option("Measure").option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify the distance between items along path <50>:"
    )
    cad.type("30").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify number of items or [Fill entire path] <5>:"
    )
    cad.option("Fill entire path").option("Align items")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Align arrayed items to path? [Yes/No] <Yes>:"
    )
    cad.enter().enter()

    expect(cad.commandLog().slice(0, 5)).toEqual([
      "ARRAYPATH",
      "1 found",
      "Type = Path  Associative = Yes",
      "Select path curve:",
      "Objects selected to be arrayed may not be selected as path curve.",
    ])
    // 0, 30 … 180 → seven items, plus the path.
    expect(shown(cad).length).toBe(8)
  })

  it("asks in the words of Autodesk's Spanish table (probes arrays/p307, p334)", () => {
    const cad = createHarness({ locale: es, entities: [path, source] })

    cad.select("SRC").command("MATRIZCAMINO")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Ruta  Asociativa = Sí")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Seleccione la curva de trayectoria:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Seleccione un pinzamiento para editar la matriz o [Asociativa/Método/Elementos/ALinear elementos/Salir] <Salir>:"
    )
    cad.option("Method")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Introduzca el método de camino [Dividir/Medir] <Medir>:"
    )
    cad.enter().option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Especifique la distancia entre los elementos a lo largo del camino <75>:"
    )
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Número máximo de elementos = 3")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Introduzca el número de elementos o [Llenar todo el camino] <3>:"
    )
    cad.enter().option("Align items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO ¿Alinear elementos de matriz con el camino? [Sí/No] <Sí>:"
    )
  })
})

describe("where ARRAYPATH puts the items", () => {
  it("repeats the source from where it stands, 6 apart, past the path's end (probes arrays/p06, p314)", () => {
    const cad = pathArray()
    answer(cad, "_X")
    expect(centreXs(cad)).toEqual(
      Array.from({ length: 17 }, (_, k) => 10 + 6 * k)
    )
    expect(centres(cad).every((c) => round4(c.y) === 10)).toBe(true)
    expect(shown(cad).find((e) => e.id === "C")).toEqual(circle())
  })

  it("runs from the end nearer the pick (probe arrays/p300)", () => {
    const cad = pathArray("90,0")
    answer(cad, "_X")
    expect(centreXs(cad)).toEqual(
      Array.from({ length: 17 }, (_, k) => 10 - 6 * (16 - k))
    )
  })

  it("follows an arc from either end, turning the items with it (probes arrays/p302, p303)", () => {
    const runs: [string, [number, number], [number, number]][] = [
      ["50,0", [78.2276, 19.5051], [75.33, 28.7296]],
      ["-50,0", [80.6218, 0.3511], [80.0841, -9.3028]],
    ]
    for (const [at, item2, item3] of runs) {
      const cad = createHarness({
        entities: [
          arcOf(p(0, 0), 50, 0, deg(180), { id: "A" }),
          circleOf(p(80, 10), 2, { id: "C" }),
        ],
      })
      cad.select("C")
      answer(cad, "ARRAYPATH", at, "_X")
      expect(centres(cad), at).toHaveLength(27)
      expect(hasCentre(cad, 80, 10), at).toBe(true)
      expect(hasCentre(cad, ...item2), at).toBe(true)
      expect(hasCentre(cad, ...item3), at).toBe(true)
    }
  })

  it("runs round a circle from its angle 0, counter-clockwise, wherever it is picked (probes arrays/p301, p315, p374)", () => {
    for (const at of ["50,0", "0,50"]) {
      const cad = createHarness({
        entities: [
          circleOf(p(0, 0), 50, { id: "R" }),
          circleOf(p(80, 0), 2, { id: "C" }),
        ],
      })
      cad.select("C")
      answer(cad, "ARRAYPATH", at, "_X")
      // floor(2π·50 / 6): the closing item would land on the first.
      expect(centres(cad), at).toHaveLength(53)
      expect(hasCentre(cad, 10.4339, 79.3167), at).toBe(true)
      expect(hasCentre(cad, 78.9372, -12.997), at).toBe(true)
    }

    const divided = createHarness({
      entities: [
        circleOf(p(0, 0), 50, { id: "R" }),
        circleOf(p(80, 0), 2, { id: "C" }),
      ],
    })
    divided.select("C")
    answer(divided, "ARRAYPATH", "50,0", "_M", "_D", "_I")
    expect(divided.state().commandLine.prompt).toBe(
      "ARRAYPATH Enter number of items along path <52>:"
    )
    answer(divided, "", "_X")
    expect(hasCentre(divided, 79.4167, -9.6429)).toBe(true)
  })

  it("divides an open path from end to end (probe arrays/p306)", () => {
    const cad = pathArray()
    answer(cad, "_M", "_D", "_X")
    expect(centreXs(cad)).toEqual(
      Array.from({ length: 17 }, (_, k) => 10 + 6.25 * k)
    )
  })

  it("takes a polyline, turning the items at its corner (probe arrays/p308)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "PL" }),
        circle(),
      ],
    })
    cad.select("C")
    answer(cad, "ARRAYPATH", "50,0")
    expect(cad.state().commandLine.prompt).toMatch(PATH_MAIN)
    answer(cad, "_X")
    expect(centres(cad)).toHaveLength(34)
    expect(hasCentre(cad, 106, 10)).toBe(true)
    expect(hasCentre(cad, 90, 12)).toBe(true)
    expect(hasCentre(cad, 90, 108)).toBe(true)
  })

  it("fills the path, and takes a count over the maximum as the maximum (probes arrays/p333, p373)", () => {
    const filled = pathArray()
    answer(filled, "_I", "10", "_F", "_X")
    expect(centreXs(filled)).toEqual(
      Array.from({ length: 11 }, (_, k) => 10 + 10 * k)
    )

    const capped = pathArray()
    answer(capped, "_I", "10", "20", "_X")
    expect(centres(capped)).toHaveLength(11)
  })

  it("keeps the source's Z (probe arrays/p309)", () => {
    const cad = createHarness({
      entities: [pathLine(), withElevation(circle(), 5)],
    })
    cad.select("C")
    answer(cad, "ARRAYPATH", "30,0", "_X")
    const circles = shown(cad).filter((e) => e.type === "circle")
    expect(circles).toHaveLength(17)
    for (const e of circles) {
      expect((e as { elevation?: number }).elevation).toBe(5)
    }
  })

  it("spaces a turned UCS's default by the extents seen along its axes (probe arrays/p310)", () => {
    const cad = createHarness()
    answer(cad, "_UCS", "_Z", "30", "_LINE", "0,0", "100,0", "")
    answer(cad, "_CIRCLE", "10,10", "2", "_ARRAYPATH", "_L", "", "30,0", "_I")
    // 1.5 × 4 (cos 30° + sin 30°), at the drawing's two places.
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify the distance between items along path <8.2>:"
    )
    answer(cad, "", "", "_X")
    expect(centres(cad)).toHaveLength(13)
    expect(hasCentre(cad, 3.6603, 13.6603)).toBe(true)
    expect(hasCentre(cad, 10.7583, 17.7583)).toBe(true)
  })

  it("previews the very items it makes (BRJ-01's analogue)", () => {
    const cad = pathArray()
    const ghosts = itemCircles(cad)
      .map((item) => item.centre)
      .sort()
    answer(cad, "_X")
    const made = centres(cad)
      .filter((c) => !(c.x === 10 && c.y === 10))
      .map((c) => `${round4(c.x)},${round4(c.y)}`)
      .sort()
    expect(ghosts).toHaveLength(16)
    expect(ghosts).toEqual(made)
  })
})

describe("ARRAYPATH's path pick", () => {
  it("says a locked curve picked and asks again (probe arrays/p338)", () => {
    for (const [locale, name, said] of [
      [undefined, "ARRAYPATH", "1 was on a locked layer."],
      [es, "MATRIZCAMINO", "1 estaba en una capa bloqueada."],
    ] as const) {
      const cad = withLocked(
        [
          lineOf(p(0, 50), p(100, 50), { id: "B" }),
          lineOf(p(0, 0), p(100, 0), { id: "K", layerId: "LK" }),
          circle(),
        ],
        locale
      )
      cad.select("C")
      const select = cad.command(name).state().commandLine.prompt
      answer(cad, "30,0")
      expect(cad.commandLog().at(-1), name).toBe(said)
      expect(cad.state().commandLine.prompt, name).toBe(select)
      cad.click(p(30, 0))
      expect(cad.commandLog().at(-1), name).toBe(said)
      answer(cad, "30,50")
      expect(cad.state().commandLine.prompt, name).not.toBe(select)
    }
  })

  it("says the locked curves a window finds, taking the newest other (probes arrays/p339–p341)", () => {
    const alone = withLocked([
      lineOf(p(0, 50), p(100, 50), { id: "B" }),
      lineOf(p(0, 0), p(100, 0), { id: "K", layerId: "LK" }),
      circle(),
    ])
    alone.select("C").command("ARRAYPATH")
    answer(alone, "_W", "-10,-10", "110,10")
    expect(alone.commandLog().at(-1)).toBe("1 was on a locked layer.")
    expect(alone.state().commandLine.prompt).toBe(
      "ARRAYPATH Select path curve:"
    )

    const locked = lineOf(p(0, 5), p(100, 5), { id: "K", layerId: "LK" })
    for (const entities of [
      [pathLine(), locked, circle()],
      [locked, pathLine(), circle()],
    ]) {
      const cad = withLocked(entities)
      cad.select("C").command("ARRAYPATH")
      answer(cad, "_W", "-10,-10", "110,10")
      expect(cad.commandLog().at(-1)).toBe("1 was on a locked layer.")
      expect(cad.state().commandLine.prompt).toMatch(PATH_MAIN)
      // The run from the end nearer the window's opposite corner.
      answer(cad, "_X")
      expect(hasCentre(cad, -86, 10)).toBe(true)
    }
  })

  it("starts the run at the end nearer a window's last corner, or a crossing's (probes arrays/p376–p378)", () => {
    for (const [mode, first, opposite, last] of [
      ["_W", "-10,-10", "110,5", -86],
      ["_W", "110,5", "-10,-10", 106],
      ["_C", "5,-5", "15,5", 106],
    ] as const) {
      const cad = createHarness({ entities: [pathLine(), circle()] })
      cad.select("C")
      answer(cad, "ARRAYPATH", mode, first, opposite, "_X")
      expect(hasCentre(cad, last, 10), `${mode} ${first}`).toBe(true)
    }
  })

  it("takes a typed object snap's point as the pick, LASTPOINT kept (probes arrays/p342, p343)", () => {
    for (const [snap, at] of [
      ["_END", "95,1"],
      ["_NEA", "80,1"],
    ]) {
      const cad = createHarness({ entities: [pathLine(), circle()] })
      answer(cad, "ID", "5,5")
      cad.select("C")
      answer(cad, "ARRAYPATH", snap, at)
      expect(cad.state().commandLine.prompt, snap).toMatch(PATH_MAIN)
      answer(cad, "_X")
      expect(hasCentre(cad, -86, 10), snap).toBe(true)
      expect(lastPoint(cad), snap).toMatch(/5[.,]00 .* 5[.,]00 /)
    }
  })

  it("takes the newer of two curves under the pick (probe arrays/p345)", () => {
    const cad = createHarness({
      entities: [
        pathLine(),
        lineOf(p(30, -20), p(30, 60), { id: "V" }),
        circle(),
      ],
    })
    cad.select("C")
    answer(cad, "ARRAYPATH", "30,0", "_X")
    expect(hasCentre(cad, 10, 88)).toBe(true)
  })

  it("filters out an object that is no curve (probe arrays/p346)", () => {
    const cad = createHarness({
      entities: [pathLine(), textOf(p(50, 20), "HELLO", { id: "T" }), circle()],
    })
    cad.select("C")
    answer(cad, "ARRAYPATH", "52,21")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select path curve: 52,21",
      "1 was filtered out",
    ])
    expect(cad.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
  })

  it("asks again at Enter (probe arrays/p349)", () => {
    const cad = createHarness({ entities: [pathLine(), circle()] })
    cad.select("C").command("ARRAYPATH").enter()
    expect(cad.commandLog().at(-1)).toBe("Select path curve:")
    expect(cad.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
    answer(cad, "30,0")
    expect(cad.state().commandLine.prompt).toMatch(PATH_MAIN)
  })

  it("says the arrayed objects Previous and ALL find; ALL still takes the curve (probes arrays/p353, p354, p356)", () => {
    for (const [mode, lines, taken] of [
      ["_L", ["Select path curve: _L", "1 was filtered out"], false],
      [
        "_P",
        [
          "Objects selected to be arrayed may not be selected as path curve.",
          "1 was filtered out",
        ],
        false,
      ],
      [
        "_ALL",
        [
          "Objects selected to be arrayed may not be selected as path curve.",
          "2 were filtered out",
        ],
        true,
      ],
    ] as const) {
      const cad = createHarness({ entities: [pathLine(), circle()] })
      cad.select("C")
      answer(cad, "ARRAYPATH", mode)
      expect(cad.commandLog().slice(-lines.length), mode).toEqual(lines)
      expect(PATH_MAIN.test(cad.state().commandLine.prompt), mode).toBe(taken)
    }
  })

  it("rolls over the curve a pick takes as every single pick does (desktop arrays/d03-1)", () => {
    const cad = createHarness({ entities: [pathLine(), circle()] })
    cad.select("C").command("ARRAYPATH").moveTo(p(150, 150))
    expect(pathStrokes(cad)).toEqual([])
    cad.moveTo(p(50, 0))
    expect(pathStrokes(cad)).toEqual([{ color: THEME.entityHover, width: 2 }])
  })

  it("draws the items over the path left as it is (desktop arrays/d03-2)", () => {
    expect(pathStrokes(pathArray())).toEqual([])
  })
})

describe("ARRAYPATH's prompts", () => {
  it("asks again in silence at a point or a number typed at the main prompt (probes arrays/p328, p329)", () => {
    for (const text of ["150,150", "0", "-1"]) {
      const cad = pathArray()
      const lines = cad.commandLog().length
      answer(cad, text)
      expect(cad.commandLog().length - lines, text).toBe(1)
      expect(cad.state().commandLine.prompt, text).toMatch(PATH_MAIN)
    }
  })

  it("refuses at its prompts as AutoCAD's console does, keeping each answer at Enter (probes arrays/p327, p330–p332, p336, p375)", () => {
    const tail = (cad: CadHarness, n: number) => cad.commandLog().slice(-n)

    const main = pathArray()
    answer(main, "FOO")
    expect(tail(main, 1)).toEqual(["Point or option keyword required."])

    const method = pathArray()
    answer(method, "_M", "", "_M", "FOO")
    expect(tail(method, 2)).toEqual([
      "Enter path method [Divide/Measure] <Measure>: FOO",
      "Invalid option keyword.",
    ])

    const count = pathArray()
    answer(count, "_M", "_D", "_I", "0", "2.5", "FOO", "5")
    expect(tail(count, 7)).toEqual([
      "Enter number of items along path <17>: 0",
      "Value must be positive and nonzero.",
      "Enter number of items along path <17>: 2.5",
      "Requires a positive nonzero integer or option keyword.",
      "Enter number of items along path <17>: FOO",
      "Requires a positive nonzero integer or option keyword.",
      "Enter number of items along path <17>: 5",
    ])

    const spacing = pathArray()
    answer(spacing, "_I", "-5", "FOO", "1/2")
    expect(tail(spacing, 5)).toEqual([
      "Value must be positive and nonzero.",
      "Specify the distance between items along path <6>: FOO",
      "Requires numeric distance, two points, or option keyword.",
      "Specify the distance between items along path <6>: 1/2",
      "Maximum items = 201",
    ])

    const align = pathArray()
    answer(align, "_A", "", "_A", "FOO")
    expect(tail(align, 2)).toEqual([
      "Align arrayed items to path? [Yes/No] <Yes>: FOO",
      "Invalid option keyword.",
    ])

    const kept = pathArray()
    answer(kept, "_I", "10", "3", "_I", "5")
    expect(kept.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify number of items or [Fill entire path] <3>:"
    )
  })

  it("writes the defaults without trailing zeros (probes arrays/p307, p334)", () => {
    const cad = pathArray()
    answer(cad, "_I")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify the distance between items along path <6>:"
    )
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("Maximum items = 17")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify number of items or [Fill entire path] <17>:"
    )

    const divided = pathArray()
    answer(divided, "_M", "_D", "_I", "5", "_M", "_M", "_I")
    expect(divided.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify the distance between items along path <25>:"
    )
    answer(divided, "")
    expect(divided.commandLog().at(-1)).toBe("Maximum items = 5")
  })

  it("says Maximum items again after a refusal of the count (probe arrays/p373)", () => {
    for (const [locale, maximum] of [
      [undefined, "Maximum items = 11"],
      [es, "Número máximo de elementos = 11"],
    ] as const) {
      const cad = pathArray("30,0", locale)
      answer(cad, "_I", "10")
      for (const refused of ["0", "-1", "FOO", "2.5"]) {
        answer(cad, refused)
        expect(cad.commandLog().at(-1), refused).toBe(maximum)
      }
      answer(cad, "20", "_X")
      expect(centres(cad)).toHaveLength(11)
    }
  })

  it("resumes the path pick after 'ZOOM, and refuses 'LINE at the main prompt (probes arrays/p366, p368)", () => {
    const cad = createHarness({ entities: [pathLine(), circle()] })
    cad.select("C")
    answer(cad, "ARRAYPATH", "'_ZOOM", "_E")
    expect(cad.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
    answer(cad, "30,0", "'_LINE")
    expect(cad.commandLog().slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
    expect(cad.state().commandLine.prompt).toMatch(PATH_MAIN)
  })

  it("says Maximum items again as a transparent ZOOM resumes the count (probe arrays/p367)", () => {
    const cad = pathArray()
    answer(cad, "_I", "'_ZOOM", "_E")
    expect(cad.commandLog().at(-1)).toBe("Resuming ARRAYPATH command.")
    answer(cad, "10", "'_ZOOM", "_E")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Resuming ARRAYPATH command.",
      "Maximum items = 11",
    ])
    answer(cad, "5", "_X")
    expect(centres(cad)).toHaveLength(5)
  })
})

describe("the arrays' Escape", () => {
  const rect = (locale?: typeof es) =>
    answer(
      createHarness({ locale, entities: [circle()] }),
      locale ? "MATRIZRECTANG" : "_ARRAYRECT",
      "_L",
      ""
    )
  const runs = [
    ["ARRAYRECT", () => rect(), 1],
    [
      "ARRAY",
      () => answer(createHarness({ entities: [circle()] }), "AR", "_L", "", ""),
      1,
    ],
    // WHY ARRAYPOLAR too: d08c's polar run was inconclusive (ARRAYS-D4).
    ["ARRAYPOLAR", () => answer(polar(), "0,0"), 1],
    ["ARRAYPATH", () => pathArray(), 2],
  ] as const

  // desktop arrays/d08 (the array kept, `*Cancelado*`), d08b (ASsociative
  // No: the source and its 11 copies), d08c (ARRAYPATH's copies kept).
  it("makes at the main prompt what Enter makes, in one undo step (desktop arrays/d08, d08b, d08c)", () => {
    for (const [name, run, before] of runs) {
      const entered = answer(run(), "")
      const cad = run()
      cad.escape()
      expect(cad.commandLog().at(-1), name).toMatch(/<eXit>: \*Cancel\*$/)
      expect(centres(cad).length, name).toBeGreaterThan(1)
      expect(centres(cad), name).toEqual(centres(entered))
      answer(cad, "_U")
      expect(cad.commandLog().at(-1), name).toBe(name)
      expect(shown(cad).length, name).toBe(before)
    }
    const es_ = rect(es)
    es_.escape()
    expect(es_.commandLog().at(-1)).toMatch(/<Salir>: \*Cancelado\*$/)
    expect(centres(es_)).toHaveLength(12)
  })

  // ARRAYS-D4, unverified: the desktop showed Escape at the main prompt only.
  it("keeps at a value's prompt the values given before it", () => {
    const cad = rect()
    answer(cad, "_COU", "2")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Enter the number of rows <3>:"
    )
    cad.type("5").escape()
    expect(centres(cad)).toHaveLength(6)

    const ring = answer(polar(), "0,0", "_I", "4", "_ROT")
    ring.escape()
    expect(centres(ring)).toHaveLength(4)

    const entered = answer(pathArray(), "_I", "20", "", "")
    const along = answer(pathArray(), "_I", "20")
    expect(along.state().commandLine.prompt).toMatch(/Fill entire path/)
    along.escape()
    expect(centres(along)).toEqual(centres(entered))
  })

  it("makes nothing before the main prompt", () => {
    const selecting = answer(
      createHarness({ entities: [circle()] }),
      "_ARRAYRECT",
      "_L"
    )
    const typing = answer(
      createHarness({ entities: [circle()] }),
      "AR",
      "_L",
      ""
    )
    const centring = polar()
    const picking = createHarness({ entities: [pathLine(), circle()] })
    picking.select("C").command("ARRAYPATH")
    for (const [cad, before] of [
      [selecting, 1],
      [typing, 1],
      [centring, 1],
      [picking, 2],
    ] as const) {
      cad.escape()
      expect(shown(cad).length).toBe(before)
      expect(cad.activeToolId()).toBe("select")
    }
  })
})

describe("the arrays' preview", () => {
  /** The probes' circle, red and 0.5 mm. */
  const worn = (): Entity => ({
    ...circle(),
    color: "#ff0000",
    lineweight: 0.5,
  })
  const runs = [
    [
      "ARRAYRECT",
      () =>
        answer(createHarness({ entities: [worn()] }), "_ARRAYRECT", "_L", ""),
    ],
    [
      "ARRAYPOLAR",
      () =>
        answer(
          createHarness({ entities: [worn()] }),
          "_ARRAYPOLAR",
          "_L",
          "",
          "0,0"
        ),
    ],
    [
      "ARRAYPATH",
      () => {
        const cad = createHarness({ entities: [pathLine(), worn()] })
        cad.select("C")
        return answer(cad, "ARRAYPATH", "30,0")
      },
    ],
  ] as const

  // desktop arrays/d01-1, d02-2, d03-2: the items solid, in their own colour.
  it("draws the items as the drawing draws them (desktop arrays/d01-1, d02-2, d03-2)", () => {
    for (const [name, run] of runs) {
      const cad = run().moveTo(p(500, 500))
      const previewed = itemCircles(cad)
      expect(previewed.length, name).toBeGreaterThan(0)
      for (const { stroke } of previewed) {
        expect(stroke, name).toMatchObject({ color: "#ff0000" })
        expect(stroke, name).not.toHaveProperty("dash")
      }
      answer(cad, "")
      cad.moveTo(p(500, 500))
      const sorted = (items: ReturnType<typeof itemCircles>) =>
        [...items].sort((a, b) => a.centre.localeCompare(b.centre))
      expect(sorted(previewed), name).toEqual(sorted(itemCircles(cad)))
    }
  })

  it("draws nothing at the polar centre (desktop arrays/d02-1, d02-2)", () => {
    const cad = polar().moveTo(p(0, 0))
    expect(itemCircles(cad)).toEqual([])
    answer(cad, "0,0")
    // The grid, the axes and the crosshair are segments too: the cross was
    // the selection's colour.
    const cross = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          (prim.stroke.color === THEME.selected ||
            prim.stroke.color === THEME.preview)
      )
    expect(cross).toEqual([])
    expect(itemCircles(cad)).toHaveLength(5)
  })

  // AYJ-03, unverified: the trace's UseDashedLine 1 (probe arrays/p123) is
  // not yet seen on the desktop, so Unit cell's rubber band stays solid.
  it("keeps Unit cell's rubber band solid", () => {
    const cad = answer(
      createHarness({ entities: [circle()] }),
      "_ARRAYRECT",
      "_L",
      "",
      "_S",
      "_U",
      "0,0"
    ).moveTo(p(30, 20))
    const band = cad
      .scene()
      .primitives.flatMap((prim) =>
        prim.kind === "segment" && prim.stroke.color === THEME.rubberBand
          ? [prim.stroke]
          : []
      )
    expect(band).toHaveLength(4)
    for (const stroke of band) expect(stroke).not.toHaveProperty("dash")
  })
})

/** The probes' path array: the line 0,0–100,0 and the circle, picked at 50,0. */
function pathDrawing(): Entity[] {
  return [lineOf(p(0, 0), p(100, 0), { id: "PATH" }), circle()]
}

/** The one array the drawing holds. */
function arrayOf(cad: CadHarness): InsertEntity {
  const array = cad.only<InsertEntity>("insert")
  expect(array.array).toBeDefined()
  return array
}

describe("the array object (AYO-01)", () => {
  // probes arrays/p01–p03: `Associative = Yes`, one INSERT of an anonymous
  // block, the source consumed into it; p400: its block holds the source.
  it("is one object of each kind, the source consumed into it", () => {
    for (const [run, type, kind, items] of [
      [["_ARRAYRECT", "_L", "", "_X"], "Rectangular", "rectangular", 12],
      [["_ARRAYPOLAR", "_L", "", "0,0", "_X"], "Polar", "polar", 6],
      [["_ARRAYPATH", "_L", "", "50,0", "_X"], "Path", "path", 17],
    ] as const) {
      const cad = createHarness({ entities: pathDrawing() })

      answer(cad, ...run)

      expect(cad.commandLog()).toContain(`Type = ${type}  Associative = Yes`)
      const array = arrayOf(cad)
      expect(array.array?.kind).toBe(kind)
      expect(array.blockId).toBe("*U1")
      expect(cad.runtime.document.get("C")).toBeUndefined()
      expect(cad.runtime.document.getBlock("*U1")?.entities).toEqual([circle()])
      expect(centres(cad)).toHaveLength(items)
      // The array and the path line, which stays.
      expect(cad.entityCount).toBe(2)
    }
  })

  // probe arrays/p403: the array on CLAYER L2 and CECOLOR 5, the line inside
  // on L1 and red.
  it("is made on the current layer and colour, the objects inside keeping theirs", () => {
    const line = {
      ...lineOf(p(0, 0), p(10, 5), { id: "L" }),
      layerId: "L1",
      color: "#ff0000",
    } as Entity
    const cad = createHarness()
    cad.runtime.document.load([line], {
      layers: [layerOf("0"), layerOf("L1"), layerOf("L2")],
    })
    cad.runtime.setCurrentLayer("L2")
    cad.runtime.setCurrentColor("#0000ff")

    answer(cad, "_ARRAYRECT", "_L", "", "_X")

    expect(arrayOf(cad)).toMatchObject({ layerId: "L2", color: "#0000ff" })
    const items = shown(cad)
    expect(items).toHaveLength(12)
    for (const item of items) {
      expect(item).toMatchObject({ layerId: "L1", color: "#ff0000" })
    }
  })

  // LIST's `Base point:` and the INSERT's position: the source's extents
  // centre (probes arrays/p403, p404), a polar array's centre with the
  // extents centre its base point (p405), the path's start (p406).
  it("stands at AutoCAD's base point", () => {
    const rect = createHarness({
      entities: [lineOf(p(0, 0), p(10, 5), { id: "L" })],
    })
    answer(rect, "_ARRAYRECT", "_L", "", "_X")
    expect(arrayOf(rect).position).toBeCloseToPoint(p(5, 2.5))

    const corner = createHarness({
      entities: [polylineOf([p(3, 1), p(13, 1), p(13, 9)], { id: "PL" })],
    })
    answer(corner, "_ARRAYRECT", "_L", "", "_X")
    expect(arrayOf(corner).position).toBeCloseToPoint(p(8, 5))

    const polar = createHarness({ entities: [circle()] })
    answer(polar, "_ARRAYPOLAR", "_L", "", "0,0", "_X")
    const ring = arrayOf(polar)
    expect(ring.position).toBeCloseToPoint(p(0, 0))
    expect(ring.array?.kind === "polar" && ring.array.basePoint).toEqual(
      p(10, 10)
    )

    const path = createHarness({ entities: pathDrawing() })
    answer(path, "_ARRAYPATH", "_L", "", "50,0", "_X")
    expect(arrayOf(path).position).toBeCloseToPoint(p(0, 0))
  })

  // probe arrays/p402: EXPLODE gives the twelve circles, item by item.
  it("explodes into each item's objects", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    expect(cad.typeCounts()).toEqual({ insert: 1 })
    answer(cad, "_EXPLODE", "_L", "")

    expect(cad.typeCounts()).toEqual({ circle: 12 })
    expect(centres(cad).map((c) => `${round4(c.x)},${round4(c.y)}`)).toEqual([
      "10,10",
      "10,16",
      "10,22",
      "16,10",
      "16,16",
      "16,22",
      "22,10",
      "22,16",
      "22,22",
      "28,10",
      "28,16",
      "28,22",
    ])
  })

  // probe arrays/p418: a line on L1 and a circle on L2, arrayed on layer 0
  // and exploded: each item's line and circle, on their layers.
  it("explodes into objects that keep their layers", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        { ...lineOf(p(0, 0), p(10, 0), { id: "L" }), layerId: "L1" },
        { ...circleOf(p(5, 5), 2, { id: "C" }), layerId: "L2" },
      ],
      { layers: [layerOf("0"), layerOf("L1"), layerOf("L2")] }
    )

    answer(cad, "_ARRAYRECT", "_ALL", "", "_X")
    expect(cad.typeCounts()).toEqual({ insert: 1 })
    answer(cad, "_EXPLODE", "_ALL", "")

    const parts = cad.entities()
    expect(parts).toHaveLength(24)
    expect(parts.map((e) => `${e.type} ${e.layerId}`).slice(0, 4)).toEqual([
      "line L1",
      "circle L2",
      "line L1",
      "circle L2",
    ])
    expect(linesOf(parts).map((l) => `${l.start.x},${l.start.y}`)).toContain(
      "45,21"
    )
    expect(hasCentre(cad, 50, 26)).toBe(true)
  })

  // probe arrays/p409: U takes the array back and the source with its handle.
  it("is taken back by U, the source back with its id", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    expect(cad.typeCounts()).toEqual({ insert: 1 })
    answer(cad, "_U")

    expect(cad.entities()).toEqual([circle()])
    expect(cad.runtime.document.getBlocks()).toEqual([])
  })

  // probes arrays/p411a, p411b: saved and opened, it is still the array.
  it("is saved and opened as the array", () => {
    for (const run of [
      ["_ARRAYRECT", "_L", "", "_X"],
      ["_ARRAYPOLAR", "_L", "", "0,0", "_ROT", "_N", "_X"],
      ["_ARRAYPATH", "_L", "", "50,0", "_X"],
    ]) {
      const cad = createHarness({ entities: pathDrawing() })
      answer(cad, ...run)

      const copy = createHarness()
      copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

      expect(copy.entities()).toEqual(cad.entities())
      expect(arrayOf(copy).array).toEqual(arrayOf(cad).array)
      expect(copy.runtime.document.getBlock("*U1")).toEqual(
        cad.runtime.document.getBlock("*U1")
      )
      expect(centres(copy)).toEqual(centres(cad))
    }
  })

  // probe arrays/p412: `_END` on an item's line snaps to its end.
  it("snaps on its items", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L" })],
    })

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    expect(cad.typeCounts()).toEqual({ insert: 1 })
    answer(cad, "_ID", "_END", "24,0.2")

    expect(cad.commandLog().at(-1)).toBe(" X = 25.00     Y = 0.00     Z = 0.00")
  })

  // probe arrays/p408: a pick on any item takes the whole array.
  it("is taken whole by a pick on any item", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "_X", "_ERASE", "24,16", "")

    expect(cad.entities()).toEqual([])
  })

  // probe arrays/p410: COPY makes a second array, its base point moved.
  it("is copied as a second array", () => {
    const cad = createHarness({ entities: [circle()] })

    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    answer(cad, "_COPY", "_L", "", "0,0", "100,0", "")

    const arrays = cad.entities() as InsertEntity[]
    expect(arrays.map((a) => a.array?.kind)).toEqual([
      "rectangular",
      "rectangular",
    ])
    expect(arrays[1].position).toBeCloseToPoint(p(110, 10))
    expect(centres(cad)).toHaveLength(24)
    expect(hasCentre(cad, 128, 22)).toBe(true)
  })

  // probes arrays/p04–p06: `_AS _N` leaves the copies loose and the source
  // where it was; p364: the next run says `Associative = No`; AcArrayRes:5609
  // offers the answer as the default.
  it("leaves loose copies after ASsociative No, and keeps the answer", () => {
    const cad = createHarness({ entities: pathDrawing() })

    answer(cad, "_ARRAYRECT", "_L", "", "_AS")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Create associative array [Yes/No] <Yes>:"
    )
    answer(cad, "_N")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
    )
    answer(cad, "_X")
    expect(cad.typeCounts()).toEqual({ line: 1, circle: 12 })
    expect(cad.runtime.document.get("C")).toEqual(circle())
    expect(cad.commandLog().slice(-4)).toEqual([
      "Type = Rectangular  Associative = Yes",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: _AS",
      "Create associative array [Yes/No] <Yes>: _N",
      "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>: _X",
    ])

    answer(cad, "_ARRAYPATH", "12,10", "", "50,0")
    expect(cad.commandLog()).toContain("Type = Path  Associative = No")
    answer(cad, "_AS")
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Create associative array [Yes/No] <No>:"
    )
    answer(cad, "", "_X")
    expect(cad.typeCounts()).toEqual({ line: 1, circle: 12 + 16 })
  })

  // probes arrays/p04.es–p06.es: `Asociativa`, its question and the type line.
  it("asks it in Spanish", () => {
    const cad = createHarness({ locale: es, entities: [circle()] })

    answer(cad, "MATRIZRECTANG", "_L", "")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = Sí")
    answer(cad, "A")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Crear matriz asociativa [Sí/No] <Sí>:"
    )
    answer(cad, "N", "")
    expect(cad.typeCounts()).toEqual({ circle: 12 })
    answer(cad, "MATRIZPOLAR", "12,10", "")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Polar  Asociativa = No")
  })

  // The names of strings AcArrayRes 9575, 39923 and 887, in the palette's
  // title and the rollover.
  it("is named by its kind", () => {
    for (const [locale, run, name] of [
      [undefined, ["_ARRAYRECT", "_L", "", "_X"], "Array (Rectangular)"],
      [undefined, ["_ARRAYPOLAR", "_L", "", "0,0", "_X"], "Array (Polar)"],
      [es, ["_ARRAYPATH", "_L", "", "50,0", "_X"], "Matriz (de ruta)"],
    ] as const) {
      const cad = createHarness({ locale, entities: pathDrawing() })
      answer(cad, ...run)

      cad.select(arrayOf(cad).id)

      expect(cad.state().properties.info?.title).toBe(name)
    }
  })

  // ARRAYS-D5: the source is item 1 of the preview, drawn as the items are,
  // not glowing as the selection.
  it("previews the source as item 1", () => {
    const cad = answer(createHarness({ entities: [circle()] }), "_ARRAYRECT")
    answer(cad, "_L", "")

    const source = cad.scene().primitives.flatMap((prim) => {
      if (prim.kind !== "circle") return []
      const c = cad.runtime.viewport.screenToWorld(prim.center)
      return Math.abs(c.x - 10) < 1e-4 && Math.abs(c.y - 10) < 1e-4
        ? [prim.stroke?.color]
        : []
    })
    expect(source).toHaveLength(1)
    expect(source[0]).not.toBe(THEME.selected)
    expect(itemCircles(cad)).toHaveLength(11)
  })

  // An array's anonymous block is no block a user lists or names (probe
  // arrays/p400: `*U2`).
  it("keeps its block out of every list of blocks", () => {
    const cad = createHarness({ entities: [circle()] })
    answer(cad, "_ARRAYRECT", "_L", "", "_X")

    expect(cad.state().blocks).toEqual([])
    // Counted, never named (probe blocks/p156).
    answer(cad, "_-INSERT", "?", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Defined blocks.\nUser     Unnamed\nBlocks   Blocks\n    0        1"
    )
    answer(cad, "_-INSERT", "*U1")
    expect(cad.commandLog().at(-1)).toBe('Block "*U1" is not defined.')
    cad.escape()
    answer(cad, "_ERASE", "_ALL", "")
    // Saved, an unreferenced anonymous block is left out.
    const saved = JSON.parse(cad.runtime.serializeDrawing()) as {
      blocks: unknown[]
    }
    expect(saved.blocks).toEqual([])
    // -PURGE's `*` takes it, by its name (probe blocks/p147).
    answer(cad, "_-PURGE", "_B", "*", "_N")
    expect(cad.commandLog().slice(-2)).toEqual([
      'Deleting block "*U1".',
      "1 block deleted.",
    ])
    expect(cad.runtime.document.getBlock("*U1")).toBeUndefined()
  })

  // probe arrays/p410's second array, through the clipboard: a pasted array
  // lands with an anonymous block of its own.
  it("is pasted with a fresh anonymous block", async () => {
    const cad = createHarness({ entities: [circle()] })
    answer(cad, "_ARRAYRECT", "_L", "", "_X")
    answer(cad, "_COPYCLIP", "_L", "")

    await cad.runtime.pasteFromClipboard()
    cad.click(p(200, 0))

    const arrays = cad.entities() as InsertEntity[]
    expect(arrays.map((a) => a.blockId)).toEqual(["*U1", "*U2"])
    expect(cad.runtime.document.getBlock("*U2")?.entities).toHaveLength(1)
    expect(centres(cad)).toHaveLength(24)
  })
})

describe("ARRAYRECT in a tilted UCS", () => {
  // No probe: the positions ARRAYRECT gave before AYO, its columns along the
  // UCS's X, its rows along its Y and their elevation along its Z. Whether
  // AutoCAD lays a tilted grid so is **unverified**.
  it("keeps the grid in the UCS's axes, as an array and as loose copies", () => {
    for (const associative of ["_Y", "_N"]) {
      const cad = createHarness()
      answer(cad, "_UCS", "_X", "90", "_CIRCLE", "0,0", "2")
      answer(cad, "_ARRAYRECT", "_L", "", "_AS", associative)
      answer(cad, "_COU", "2", "2", "_COL", "", "10", "_R", "", "20", "5", "_X")

      expect(cad.typeCounts()).toEqual(
        associative === "_Y" ? { insert: 1 } : { circle: 4 }
      )
      const placed = shown(cad).flatMap((e) =>
        e.type === "circle" ? [entityPointToWorld(e, e.center)] : []
      )
      // UCS X is the WCS's X, its Y the WCS's Z, its Z the WCS's −Y.
      expect(placed).toHaveLength(4)
      for (const [x, y, z] of [
        [0, 0, 0],
        [0, -5, 20],
        [10, 0, 0],
        [10, -5, 20],
      ]) {
        expect(
          placed.some(
            (c) =>
              Math.abs(c.x - x) < 1e-6 &&
              Math.abs(c.y - y) < 1e-6 &&
              Math.abs(c.z - z) < 1e-6
          ),
          `${x},${y},${z} in ${JSON.stringify(placed)}`
        ).toBe(true)
      }
    }
  })
})

/**
 * The desktop pass's figure (`scripts/research/probes/arrays/dsk-en.sh`,
 * zoomed in on it as there): a circle at -30,0 arrayed 4 by 3 at 8; a circle
 * at 23,43 arrayed about 23,25, six items (the probes' square, as wide); a
 * circle at 62,5 along a line 60,0–140,0 picked near its start, 6 apart.
 */
function figure(kind: "rectangular" | "polar" | "path"): CadHarness {
  const entities: Entity[] =
    kind === "rectangular"
      ? [circleOf(p(-30, 0), 2, { id: "C" })]
      : kind === "polar"
        ? [circleOf(p(23, 43), 3, { id: "C" })]
        : [
            lineOf(p(60, 0), p(140, 0), { id: "PATH" }),
            circleOf(p(62, 5), 2, { id: "C" }),
          ]
  const cad = createHarness({ entities })
  answer(cad, "_ZOOM", "-50,-40", "150,90")
  if (kind === "rectangular") {
    answer(cad, "_ARRAYRECT", "_L", "", "_COU", "4", "3", "_S", "8", "8", "_X")
  } else if (kind === "polar") {
    answer(cad, "_ARRAYPOLAR", "_L", "", "23,25", "_X")
  } else {
    answer(cad, "_ARRAYPATH", "_L", "", "65,0", "_X")
  }
  cad.select(arrayOf(cad).id)
  return cad
}

/** The grips the scene draws, where they are and their shape. */
function gripsShown(cad: CadHarness): string[] {
  return cad.scene().primitives.flatMap((prim) => {
    const grip = (shape: string, at: { x: number; y: number }) => {
      const w = cad.runtime.viewport.screenToWorld(at)
      return [`${shape} ${round4(w.x)},${round4(w.y)}`]
    }
    if (prim.kind === "rect" && prim.fill === THEME.grip) {
      return grip("square", {
        x: prim.min.x + prim.width / 2,
        y: prim.min.y + prim.height / 2,
      })
    }
    if (prim.kind === "path" && prim.fill === THEME.grip) {
      // An arrow's centre: its back's middle a half-size behind its tip.
      const [tip, b1, b2] = prim.points
      const back = { x: (b1.x + b2.x) / 2, y: (b1.y + b2.y) / 2 }
      const u = { x: tip.x - back.x, y: tip.y - back.y }
      const size = Math.hypot(u.x, u.y)
      const centre = {
        x: back.x + (u.x / size) * 4,
        y: back.y + (u.y / size) * 4,
      }
      const w = cad.runtime.viewport.screenToWorld(centre)
      const ahead = cad.runtime.viewport.screenToWorld(tip)
      const heading = Math.atan2(ahead.y - w.y, ahead.x - w.x) * (180 / Math.PI)
      return grip(`arrow@${(Math.round(heading) + 360) % 360}`, centre)
    }
    return []
  })
}

/** The array's parameters but the path, which no grip changes. */
function parameters(cad: CadHarness): Record<string, unknown> {
  const rest = { ...(arrayOf(cad).array as unknown as Record<string, unknown>) }
  delete rest.path
  return rest
}

describe("the array's grips (AYG-01)", () => {
  // desktop arrays/d11-1: the base square, arrows at the second and last
  // column and row, a square at the far corner.
  it("shows a rectangular array's grips", () => {
    const cad = figure("rectangular")
    cad.moveTo(p(100, 100))

    expect(gripsShown(cad).sort()).toEqual(
      [
        "square -30,0",
        "arrow@0 -22,0",
        "arrow@0 -6,0",
        "arrow@90 -30,8",
        "arrow@90 -30,16",
        "square -6,16",
      ].sort()
    )
  })

  // desktop arrays/d11-2: squares at the base point and the centre, an arrow
  // at item 2 pointing round the ring, the ring grey through the base point.
  it("shows a polar array's grips and its ring", () => {
    const cad = figure("polar")
    cad.moveTo(p(100, 100))

    expect(gripsShown(cad).sort()).toEqual(
      ["square 23,43", "square 23,25", "arrow@240 7.4115,34"].sort()
    )
    const rings = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "circle" && prim.stroke?.color === THEME.arrayRing
      )
    expect(rings).toHaveLength(1)
    const ring = rings[0] as {
      center: { x: number; y: number }
      radius: number
    }
    expect(cad.runtime.viewport.screenToWorld(ring.center)).toBeCloseToPoint(
      p(23, 25)
    )
    const edge = cad.runtime.viewport.screenToWorld({
      x: ring.center.x + ring.radius,
      y: ring.center.y,
    })
    expect(edge.x - 23).toBeCloseTo(18)
  })

  // desktop arrays/d11-3: a square at the path's start, an arrow the spacing
  // along it, on the path.
  it("shows a path array's grips", () => {
    const cad = figure("path")
    cad.moveTo(p(100, 100))

    expect(gripsShown(cad).sort()).toEqual(["arrow@0 66,0", "square 60,0"])
  })

  // A block reference that is no array keeps its one insertion grip.
  it("leaves a plain reference its insertion grip", () => {
    const cad = createHarness({
      blocks: [createBlockDefinition("B", p(0, 0), [circle()])],
      entities: [createInsert("B", p(40, 40), { id: "I" })],
    })
    cad.select("I")
    cad.moveTo(p(500, 500))

    expect(gripsShown(cad)).toEqual(["square 40,40"])
  })

  // desktop arrays/d14a (-6,0 → 13,0), d14b (→ 17,0), d14c (→ 13,6): the
  // columns floor(d / 8) + 1, d along the axis from the base.
  it("sets the columns from the last column's arrow", () => {
    for (const to of [p(13, 0), p(17, 0), p(13, 6)]) {
      const cad = figure("rectangular")

      cad.drag(p(-6, 0), to)

      expect(parameters(cad)).toMatchObject({ columns: 6, colSpacing: 8 })
    }
  })

  // desktop arrays/d14k: dragged behind the base, -10 at 8 is 2 columns, -8 apart.
  it("turns the columns back behind the base", () => {
    const cad = figure("rectangular")

    cad.drag(p(-6, 0), p(-40, 0))

    expect(parameters(cad)).toMatchObject({ columns: 2, colSpacing: -8 })
  })

  // desktop arrays/d14e: the last row's arrow to -30,35 is 5 rows; d14g: the
  // corner to 13,35 is 6 columns and 5 rows.
  it("sets the rows, and both counts from the corner", () => {
    const rows = figure("rectangular")
    rows.drag(p(-30, 16), p(-30, 35))
    expect(parameters(rows)).toMatchObject({ columns: 4, rows: 5 })

    const both = figure("rectangular")
    both.drag(p(-6, 16), p(13, 35))
    expect(parameters(both)).toMatchObject({ columns: 6, rows: 5 })
  })

  // desktop arrays/d14i, d14j: a spacing arrow's spacing is the cursor's
  // distance from the base along its axis: 12, 12.5.
  it("sets a spacing from its arrow", () => {
    const columns = figure("rectangular")
    columns.drag(p(-22, 0), p(-18, 0))
    expect(parameters(columns).colSpacing).toBeCloseTo(12)
    expect(parameters(columns).rowSpacing).toBe(8)

    const rows = figure("rectangular")
    rows.drag(p(-30, 8), p(-30, 12.5))
    expect(parameters(rows).colSpacing).toBe(8)
    expect(parameters(rows).rowSpacing).toBeCloseTo(12.5)
  })

  // desktop arrays/d14h, d15b, d16a: the base square, a ring's centre and a
  // path array's start move the array.
  it("moves the array from its base square or centre", () => {
    for (const [kind, from, to] of [
      ["rectangular", p(-30, 0), p(-30, -20)],
      ["polar", p(23, 25), p(30, 25)],
      ["path", p(60, 0), p(60, -10)],
    ] as const) {
      const cad = figure(kind)
      const before = arrayOf(cad)

      cad.drag(from, to)

      const after = arrayOf(cad)
      expect(after.array).toEqual(before.array)
      expect(after.position).toBeCloseToPoint({
        x: before.position.x + to.x - from.x,
        y: before.position.y + to.y - from.y,
      })
    }
  })

  // desktop arrays/d14 history: one step each, which U takes back naming
  // `Grip Edit`.
  it("is one undo step, which U names Grip Edit", () => {
    const cad = figure("rectangular")
    const before = arrayOf(cad)

    cad.drag(p(-6, 0), p(13, 0))
    expect(arrayOf(cad).array).toMatchObject({ columns: 6 })
    answer(cad, "_U")

    expect(cad.commandLog().slice(-2)).toEqual(["U", "Grip Edit"])
    expect(arrayOf(cad)).toEqual(before)
  })

  // ARRAYS-D72, the preview the commit: while the arrow is held at 13,0 the
  // scene draws the six columns the release makes.
  it("previews what the release makes", () => {
    const cad = figure("rectangular")

    cad.mouseDown(p(-6, 0)).moveTo(p(0, 0)).moveTo(p(13, 0))

    const xs = new Set(
      cad.scene().primitives.flatMap((prim) => {
        if (prim.kind !== "circle" || prim.stroke?.color === THEME.selected) {
          return []
        }
        return [round4(cad.runtime.viewport.screenToWorld(prim.center).x)]
      })
    )
    expect([...xs].sort((a, b) => a - b)).toEqual([-30, -22, -14, -6, 2, 10])
    cad.mouseUp(p(13, 0))
    expect(parameters(cad)).toMatchObject({ columns: 6 })
  })

  // desktop arrays/d17: 6 typed while the column count arrow is hot.
  it("takes a count typed while the arrow is hot", () => {
    const cad = figure("rectangular")

    cad.click(p(-6, 0))
    expect(cad.state().dynamicInput?.fields[0]?.label).toBe("Columns")
    cad.type("6").enter()

    expect(parameters(cad)).toMatchObject({ columns: 6, colSpacing: 8 })
  })

  // ARRAYS-D72: a count past 32767 is refused and the grip stays hot.
  it("refuses a count past 32767 and keeps the grip hot", () => {
    const cad = figure("rectangular")

    cad.click(p(-6, 0)).type("40000").enter()
    expect(parameters(cad)).toMatchObject({ columns: 4 })
    cad.click(p(13, 0))

    expect(parameters(cad)).toMatchObject({ columns: 6 })
  })

  // desktop arrays/d15a: the base square to 23,50 is a radius of 25; d15d:
  // to 30,48 the base point stays on its ray, the radius |cursor − centre|;
  // ARRAYS-D73: the source, item 1, goes with it.
  it("stretches a ring's radius from its base square", () => {
    const cad = figure("polar")

    cad.drag(p(23, 43), p(23, 50))

    const ring = arrayOf(cad).array
    expect(ring).toMatchObject({ kind: "polar", items: 6, fill: 360 })
    expect(ring?.kind === "polar" && ring.basePoint).toBeCloseToPoint(p(23, 50))
    expect(hasCentre(cad, 23, 50)).toBe(true)
    expect(hasCentre(cad, 23, 43)).toBe(false)
    expect(centres(cad)).toHaveLength(6)
    for (const c of centres(cad)) {
      expect(Math.hypot(c.x - 23, c.y - 25)).toBeCloseTo(25)
    }

    const off = figure("polar")
    off.drag(p(23, 43), p(30, 48))
    const turned = arrayOf(off).array
    expect(turned?.kind === "polar" && turned.basePoint).toBeCloseToPoint(
      p(23, 25 + Math.hypot(7, 23))
    )
  })

  // desktop arrays/d15e: the angle arrow to 45° from the base is 45 between,
  // the fill (6 − 1) × 45; d15c: to 90° the fill would pass a turn, refused,
  // the grip hot.
  it("sets a ring's angle between, refusing a fill past a turn", () => {
    const cad = figure("polar")

    cad.drag(p(7.4115, 34), p(5, 25))
    expect(parameters(cad)).toMatchObject({ items: 6, fill: 360 })
    cad.click(p(10.272, 37.728))

    expect(parameters(cad)).toMatchObject({ items: 6 })
    const ring = arrayOf(cad).array
    expect(ring?.kind === "polar" && ring.fill).toBeCloseTo(225)
  })

  // desktop arrays/d16b: the spacing arrow to 70,0 spaces the items 10, as
  // many as fit on the 80 long path.
  it("sets a path array's spacing and its items", () => {
    const cad = figure("path")

    cad.drag(p(66, 0), p(70, 0))

    expect(parameters(cad).spacing).toBeCloseTo(10)
    expect(parameters(cad).items).toBe(9)
    const fit = figure("path")
    fit.drag(p(66, 0), p(70.08, 0))
    expect(parameters(fit)).toMatchObject({ items: 8 })
  })

  // ARRAYS-D8: the grips are the block's, so a turned array drags as it
  // shows; its arrows turned with it.
  it("drags a turned array as it shows", () => {
    const cad = figure("rectangular")
    cad.escape()
    answer(cad, "_ROTATE", "_L", "", "-30,0", "90")
    cad.select(arrayOf(cad).id).moveTo(p(100, 100))

    expect(gripsShown(cad)).toContain("arrow@90 -30,24")
    cad.drag(p(-30, 24), p(-30, 43))

    expect(parameters(cad)).toMatchObject({ columns: 6, colSpacing: 8 })
  })

  // ARRAYS-D73: the stretched ring is saved with its source's anchor.
  it("saves a stretched ring", () => {
    const cad = figure("polar")
    cad.drag(p(23, 43), p(23, 50))

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(arrayOf(cad).array).toHaveProperty("sourceBase")
    expect(arrayOf(copy).array).toEqual(arrayOf(cad).array)
    expect(centres(copy)).toEqual(centres(cad))
  })
})

/** The palette's groups as `title: label=value`, a `*` on a row that can be retyped. */
function palette(cad: CadHarness): string[][] {
  return (cad.state().properties.info?.groups ?? []).map((group) => [
    group.title,
    ...group.rows.map(
      (row) => `${row.label}=${row.value}${row.edit ? "*" : ""}`
    ),
  ])
}

/** Retypes the palette's row labelled `label`, as a user does; whether it took. */
function retype(cad: CadHarness, label: string, text: string): boolean {
  const row = cad
    .state()
    .properties.info?.groups.flatMap((group) => group.rows)
    .find((r) => r.label === label)
  expect(row?.edit, label).toBeDefined()
  return cad.runtime.setSelectionProperty(row!.edit!.property, text)
}

describe("the array's palette (AYG-02)", () => {
  // desktop arrays/d13-1: no Block group; Base X/Y/Z under Geometry; the
  // grid's rows under Misc, Included axis angle 90 greyed (Levels and Level
  // spacing are options not built, ARRAYS-D75).
  it("shows a rectangular array's rows", () => {
    const cad = figure("rectangular")

    expect(cad.state().properties.info?.title).toBe("Array (Rectangular)")
    expect(palette(cad)).toEqual([
      ["Geometry", "Base X=-30.00", "Base Y=0.00", "Base Z=0.00"],
      [
        "Misc",
        "Columns=4*",
        "Column spacing=8.00 mm*",
        "Rows=3*",
        "Row spacing=8.00 mm*",
        "Row elevation increment=0.00 mm*",
        "Included axis angle=90°",
      ],
    ])
  })

  // desktop arrays/d13-2: the centre and radius under Geometry; Direction,
  // Items, Angle between items, Fill angle, Rotate items under Misc.
  it("shows a polar array's rows", () => {
    const cad = figure("polar")

    expect(palette(cad)).toEqual([
      [
        "Geometry",
        "Base X=23.00",
        "Base Y=43.00",
        "Base Z=0.00",
        "Center X=23.00",
        "Center Y=25.00",
        "Center Z=0.00",
        "Radius=18.00 mm*",
      ],
      [
        "Misc",
        "Direction=Counter-clockwise*",
        "Items=6*",
        "Angle between items=60°*",
        "Fill angle=360°*",
        "Rotate items=Yes*",
      ],
    ])
  })

  // desktop arrays/d13-3: Path length under Geometry; Method, Items, Item
  // spacing, Align items under Misc.
  it("shows a path array's rows", () => {
    const cad = figure("path")

    expect(palette(cad)).toEqual([
      [
        "Geometry",
        "Base X=60.00",
        "Base Y=0.00",
        "Base Z=0.00",
        "Path length=80.00 mm",
      ],
      [
        "Misc",
        "Method=Measure*",
        "Items=14*",
        "Item spacing=6.00 mm*",
        "Align items=Yes*",
      ],
    ])
  })

  // desktop arrays/d20a: Columns 5; one step, U taking it back naming
  // `Modify Property`.
  it("retypes a grid's counts and spacings", () => {
    const cad = figure("rectangular")
    const before = arrayOf(cad)

    expect(retype(cad, "Columns", "5")).toBe(true)
    expect(parameters(cad)).toMatchObject({ columns: 5 })
    expect(retype(cad, "Row spacing", "12")).toBe(true)
    expect(retype(cad, "Row elevation increment", "3")).toBe(true)
    expect(parameters(cad)).toMatchObject({ rowSpacing: 12, rowElevation: 3 })
    // A count must be one an array takes, a spacing not 0 (ARRAYS-D11).
    expect(retype(cad, "Rows", "0")).toBe(false)
    expect(retype(cad, "Rows", "2.5")).toBe(false)
    expect(retype(cad, "Columns", "40000")).toBe(false)
    expect(retype(cad, "Column spacing", "0")).toBe(false)

    answer(cad, "_U", "_U", "_U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "Modify Property"])
    expect(arrayOf(cad)).toEqual(before)
  })

  // desktop arrays/d20c: Items 8 keeps the fill, 45 apart; d20d: Angle
  // between 30 makes the fill 150; d20e: Fill angle 180 keeps the items, 36
  // apart; d20f: Radius 20 moves the base point to 23,45.
  it("retypes a ring's items, angles and radius", () => {
    const items = figure("polar")
    expect(retype(items, "Items", "8")).toBe(true)
    expect(parameters(items)).toMatchObject({ items: 8, fill: 360 })
    expect(palette(items)[1]).toContain("Angle between items=45°*")

    const between = figure("polar")
    expect(retype(between, "Angle between items", "30")).toBe(true)
    expect(parameters(between)).toMatchObject({ items: 6, fill: 150 })
    // Past a turn: refused (desktop arrays/d15c's drag likewise).
    expect(retype(between, "Angle between items", "90")).toBe(false)

    const fill = figure("polar")
    expect(retype(fill, "Fill angle", "180")).toBe(true)
    expect(palette(fill)[1]).toContain("Angle between items=36°*")

    const radius = figure("polar")
    expect(retype(radius, "Radius", "20")).toBe(true)
    expect(palette(radius)[0]).toContain("Base Y=45.00")
    expect(hasCentre(radius, 23, 45)).toBe(true)
  })

  // ARRAYS-D75: Direction and Rotate items are choices.
  it("turns a ring the other way and stops rotating its items", () => {
    const cad = figure("polar")
    const rows = cad.state().properties.info!.groups[1].rows
    const direction = rows.find((row) => row.label === "Direction")!
    expect(direction.edit?.choices?.map((c) => c.label)).toEqual([
      "Counter-clockwise",
      "Clockwise",
    ])

    expect(retype(cad, "Direction", "1")).toBe(true)
    expect(retype(cad, "Rotate items", "0")).toBe(true)

    expect(parameters(cad)).toMatchObject({ clockwise: true, rotate: false })
    expect(palette(cad)[1]).toEqual([
      "Misc",
      "Direction=Clockwise*",
      "Items=6*",
      "Angle between items=60°*",
      "Fill angle=360°*",
      "Rotate items=No*",
    ])
  })

  // desktop arrays/d20h: Item spacing 10 on the 80 long path is 9 items.
  it("retypes a path array's spacing, method and alignment", () => {
    const cad = figure("path")

    expect(retype(cad, "Item spacing", "10")).toBe(true)
    expect(parameters(cad)).toMatchObject({ spacing: 10, items: 9 })
    expect(retype(cad, "Method", "0")).toBe(true)
    expect(retype(cad, "Align items", "0")).toBe(true)
    expect(retype(cad, "Align items", "1")).toBe(true)
    expect(parameters(cad)).toMatchObject({ method: "divide", items: 9 })
    expect(palette(cad)[1]).toEqual([
      "Misc",
      "Method=Divide*",
      "Items=9*",
      "Item spacing=10.00 mm",
      "Align items=Yes*",
    ])
  })

  // desktop arrays/d07-1 to d07-3, es-ES; the labels it truncates completed
  // (ARRAYS-D76, unverified).
  it("names its rows in Spanish", () => {
    const labels = (kind: "rectangular" | "polar" | "path") => {
      const cad = figure(kind)
      cad.runtime.setLocale(es)
      return palette(cad).map((group) => group.map((row) => row.split("=")[0]))
    }

    expect(labels("rectangular")).toEqual([
      ["Geometría", "Base X", "Base Y", "Base Z"],
      [
        "Varios",
        "Columnas",
        "Espacio entre columnas",
        "Filas",
        "Espacio entre filas",
        "Incremento de elevación de filas",
        "Incluye el ángulo del eje",
      ],
    ])
    expect(labels("polar")[1]).toEqual([
      "Varios",
      "Dirección",
      "Elementos",
      "Ángulo entre elementos",
      "Ángulo de relleno",
      "Girar objetos",
    ])
    expect(labels("path")).toEqual([
      ["Geometría", "Base X", "Base Y", "Base Z", "Longitud de trayectoria"],
      [
        "Varios",
        "Método",
        "Elementos",
        "Espaciado entre elementos",
        "Alinear elementos",
      ],
    ])
  })
})

/**
 * The desktop pass's figure (`figure`) at its command's main prompt, the
 * array not yet made; by default 4 columns and 3 rows 6 apart, the circle's
 * own (desktop arrays/d18c).
 */
function atMainPrompt(
  kind: "rectangular" | "polar" | "path",
  ...answers: string[]
): CadHarness {
  const entities: Entity[] =
    kind === "rectangular"
      ? [circleOf(p(-30, 0), 2, { id: "C" })]
      : kind === "polar"
        ? [circleOf(p(23, 43), 3, { id: "C" })]
        : [
            lineOf(p(60, 0), p(140, 0), { id: "PATH" }),
            circleOf(p(62, 5), 2, { id: "C" }),
          ]
  const cad = createHarness({ entities })
  answer(cad, "_ZOOM", "-50,-40", "150,90")
  if (kind === "rectangular") answer(cad, "_ARRAYRECT", "_L", "", ...answers)
  else if (kind === "polar") {
    answer(cad, "_ARRAYPOLAR", "_L", "", "23,25", ...answers)
  } else answer(cad, "_ARRAYPATH", "_L", "", "65,0", ...answers)
  expect(cad.state().commandLine.prompt).toMatch(/Select grip to edit array/)
  return cad
}

const RECT_MAIN =
  "Select grip to edit array or [ASsociative/COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"

/** The circles' centres the scene draws, rounded, sorted. */
function drawnCentres(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.flatMap((prim) => {
      if (prim.kind !== "circle") return []
      const c = cad.runtime.viewport.screenToWorld(prim.center)
      return [`${round4(c.x)},${round4(c.y)}`]
    })
    .sort()
}

describe("the main prompt's grips (AYG-03)", () => {
  // desktop arrays/d18-1, d01-1 (es), d02-2, d03-2: the preview wears the
  // grips the array wears at `Command:` (d11), the ring left out (d02-2).
  it("draws the array's grips on the preview", () => {
    const rect = atMainPrompt("rectangular", "_S", "8", "8")
    rect.moveTo(p(100, 100))
    expect(gripsShown(rect).sort()).toEqual(
      [
        "square -30,0",
        "arrow@0 -22,0",
        "arrow@0 -6,0",
        "arrow@90 -30,8",
        "arrow@90 -30,16",
        "square -6,16",
      ].sort()
    )

    const polar = atMainPrompt("polar")
    polar.moveTo(p(100, 100))
    expect(gripsShown(polar).sort()).toEqual(
      ["square 23,43", "square 23,25", "arrow@240 7.4115,34"].sort()
    )
    expect(
      polar
        .scene()
        .primitives.some(
          (prim) =>
            prim.kind === "circle" && prim.stroke?.color === THEME.arrayRing
        )
    ).toBe(false)

    const path = atMainPrompt("path")
    path.moveTo(p(100, 100))
    expect(gripsShown(path).sort()).toEqual(["arrow@0 66,0", "square 60,0"])
  })

  // desktop arrays/d01b-1 (es): the grip under the cursor is drawn hot.
  it("draws the grip under the cursor hot", () => {
    const cad = atMainPrompt("rectangular")
    cad.moveTo(p(-12, 0))

    expect(gripsShown(cad)).not.toContain("arrow@0 -12,0")
    expect(gripsShown(cad)).toHaveLength(5)
    expect(
      cad
        .scene()
        .primitives.some(
          (prim) => prim.kind === "path" && prim.fill === THEME.gripHot
        )
    ).toBe(true)
  })

  // desktop arrays/d18c: the column count arrow taken, the preview follows
  // the cursor with the grips hidden and a dashed line from the grip; 32 from
  // the base at 6 apart is 6 columns, and the main prompt is asked again. No
  // `** COLUMN COUNT **` lines: no grip writes its prompt here.
  it("takes a grip's drag at the main prompt", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(-12, 0)).moveTo(p(2, 0))
    expect(cad.state().commandLine.prompt).not.toMatch(/Select grip/)
    expect(gripsShown(cad)).toEqual([])
    expect(
      cad
        .scene()
        .primitives.some(
          (prim) => prim.kind === "segment" && prim.stroke.dash !== undefined
        )
    ).toBe(true)
    expect(drawnCentres(cad).filter((c) => c.endsWith(",0"))).toEqual(
      ["-30,0", "-24,0", "-18,0", "-12,0", "-6,0", "0,0"].sort()
    )
    cad.click(p(2, 0))
    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    expect(gripsShown(cad)).toContain("arrow@0 0,0")
    answer(cad, "_X")

    expect(parameters(cad)).toMatchObject({ columns: 6, colSpacing: 6 })
    expect(cad.commandLog().slice(-2)).toEqual([RECT_MAIN, `${RECT_MAIN} _X`])
  })

  // As at `Command:` (d14): a press dragged to its release takes it too.
  it("takes a grip dragged to its release", () => {
    const cad = atMainPrompt("rectangular")

    cad.drag(p(-12, 0), p(2, 0))
    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    answer(cad, "_X")

    expect(parameters(cad)).toMatchObject({ columns: 6 })
  })

  // desktop arrays/d18c: U after the command echoes ARRAYRECT, the whole run
  // one step, the source back alone.
  it("is one undo step with the command", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(-12, 0)).click(p(2, 0))
    cad.click(p(-30, 12)).click(p(-30, 20))
    answer(cad, "_X")
    expect(parameters(cad)).toMatchObject({ columns: 6, rows: 4 })
    answer(cad, "_U")

    expect(cad.commandLog().slice(-2)).toEqual(["U", "ARRAYRECT"])
    expect(cad.entities().map((e) => e.id)).toEqual(["C"])
  })

  // desktop arrays/d17, as at `Command:`: a number typed while the grip is
  // hot is its count.
  it("takes a value typed while the grip is hot", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(-12, 0))
    expect(cad.state().dynamicInput?.fields[0]?.label).toBe("Columns")
    cad.type("7").enter()
    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    answer(cad, "_X")

    expect(parameters(cad)).toMatchObject({ columns: 7 })
  })

  // desktop arrays/d18d: Enter at the count grip's prompt is refused in the
  // console's words (its `an` typo not copied, ARRAYS-D77) and the main
  // prompt asked again; at a spacing grip it goes back in silence
  // (**unverified**).
  it("refuses Enter while a count grip is hot and asks the main prompt again", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(-12, 0)).moveTo(p(2, 0)).enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Requires an integer between 1 and 32767, or option keyword."
    )
    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    const lines = cad.commandLog().length
    cad.click(p(-24, 0)).enter()
    expect(cad.commandLog()).toHaveLength(lines + 1)
    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    answer(cad, "_X")

    expect(parameters(cad)).toMatchObject({ columns: 4, colSpacing: 6 })
  })

  // ARRAYS-D77, **unverified**: Escape while a grip is hot is Escape at the
  // command, the array made as it stood before the drag (d08).
  it("makes the array as it stood at Escape while a grip is hot", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(-12, 0)).moveTo(p(2, 0)).escape()

    expect(cad.state().commandLine.prompt).toBe("Command:")
    expect(parameters(cad)).toMatchObject({ columns: 4 })
  })

  // desktop arrays/d15a, d15e, as at `Command:`: the base square stretches
  // the radius, the source going with it (ARRAYS-D73); the angle arrow sets
  // the angle between.
  it("takes a ring's radius and angle between at the main prompt", () => {
    const cad = atMainPrompt("polar")

    cad.click(p(23, 43)).click(p(23, 50))
    answer(cad, "_X")
    const ring = arrayOf(cad).array
    expect(ring?.kind === "polar" && ring.basePoint).toBeCloseToPoint(p(23, 50))
    expect(hasCentre(cad, 23, 43)).toBe(false)
    expect(centres(cad)).toHaveLength(6)
    for (const c of centres(cad)) {
      expect(Math.hypot(c.x - 23, c.y - 25)).toBeCloseTo(25)
    }

    const angle = atMainPrompt("polar")
    angle.click(p(7.4115, 34)).click(p(10.272, 37.728))
    answer(angle, "_X")
    const turned = arrayOf(angle).array
    expect(turned?.kind === "polar" && turned.fill).toBeCloseTo(225)
  })

  // desktop arrays/d16b, as at `Command:`: the spacing arrow to 70,0 spaces
  // the items 10 apart, as many as fit on the 80 long path.
  it("takes a path array's spacing at the main prompt", () => {
    const cad = atMainPrompt("path")

    cad.click(p(66, 0)).click(p(70, 0))
    answer(cad, "_X")

    expect(parameters(cad).spacing).toBeCloseTo(10)
    expect(parameters(cad).items).toBe(9)
  })

  // desktop arrays/d14h, as at `Command:`: the base square moves the array,
  // the source with it (**unverified** mid-command); loose copies too, the
  // grips worn whatever ASsociative says (ARRAYS-D77, **unverified**).
  it("moves the array from its base square", () => {
    const cad = atMainPrompt("rectangular")
    cad.click(p(-30, 0)).click(p(-30, -20))
    expect(gripsShown(cad)).toContain("square -30,-20")
    answer(cad, "_X")
    expect(hasCentre(cad, -30, -20)).toBe(true)
    expect(hasCentre(cad, -30, 0)).toBe(false)
    expect(centres(cad)).toHaveLength(12)

    const loose = atMainPrompt("rectangular", "_AS", "_N")
    loose.click(p(-30, 0)).click(p(-30, -20))
    answer(loose, "_X")
    expect(loose.entities()).toHaveLength(12)
    expect(loose.runtime.document.get("C")).toMatchObject({
      center: { x: -30, y: -20 },
    })
    answer(loose, "_U")
    expect(loose.entities()).toHaveLength(1)
    expect(loose.runtime.document.get("C")).toMatchObject({
      center: { x: -30, y: 0 },
    })
  })

  // ARRAYS-D73 without associativity: the stretched ring's loose copies
  // move the source too.
  it("moves a loose ring's source with its radius", () => {
    const cad = atMainPrompt("polar", "_AS", "_N")

    cad.click(p(23, 43)).click(p(23, 50))
    answer(cad, "_X")

    expect(hasCentre(cad, 23, 50)).toBe(true)
    expect(hasCentre(cad, 23, 43)).toBe(false)
    expect(centres(cad)).toHaveLength(6)
  })

  // A click on no grip asks the main prompt again, as before.
  it("asks the main prompt again at a click on no grip", () => {
    const cad = atMainPrompt("rectangular")

    cad.click(p(100, 100))

    expect(cad.state().commandLine.prompt).toBe(`ARRAYRECT ${RECT_MAIN}`)
    expect(gripsShown(cad)).toHaveLength(6)
  })
})
