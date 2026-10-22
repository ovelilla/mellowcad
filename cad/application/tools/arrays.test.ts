import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { CircleEntity, Entity, LineEntity } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, layerOf, lineOf, p } from "../../../test/builders"
import { withElevation } from "../../domain/elevation"
import { es } from "../../locales/es"

/**
 * ARRAY, ARRAYRECT, and the arrays' shared prompts, against AutoCAD 2027's
 * console (probes arrays/p100–p179, p204, in en-US and es-ES).
 */

function linesOf(entities: readonly Entity[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

function centres(cad: CadHarness): CircleEntity["center"][] {
  return cad
    .entities()
    .flatMap((e) => (e.type === "circle" ? [(e as CircleEntity).center] : []))
}

/** Whether a circle is centred at x,y, to the console's four places. */
function hasCentre(cad: CadHarness, x: number, y: number): boolean {
  return centres(cad).some(
    (c) => Math.abs(c.x - x) < 1e-4 && Math.abs(c.y - y) < 1e-4
  )
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
      "ARRAYRECT Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
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
      "Type = Rectangular  Associative = No",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: COU",
      "Enter the number of columns <4>: 0",
      "Value must be positive and nonzero.",
      "Enter the number of columns <4>: 2.5",
      "Requires a positive nonzero integer or option keyword.",
      "Enter the number of columns <4>: 3",
      "Enter the number of rows <3>: 2",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <60>: 100",
      "Specify the distance between rows <1>: 50",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: R",
      "Enter the number of rows <2>:",
      "Specify the distance between rows <50>:",
      "Specify the incrementing elevation between rows <0>: 5",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:",
    ])
    expect(cad.entityCount).toBe(6)
    const raised = linesOf(cad.entities()).filter((line) => line.start.y === 50)
    expect(raised.map((line) => line.elevation)).toEqual([5, 5, 5])
  })

  // probes arrays/p110.es, p116.es, p125.es, p131.es, p135.es
  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZRECTANG")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZRECTANG Seleccione un pinzamiento para editar la matriz o [COntar/Espaciado/Columnas/Filas/Salir] <Salir>:"
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

    expect(cad.entityCount).toBe(6)
    const starts = linesOf(cad.entities())
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
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
      "Specify the distance between columns or [Unit cell] <15>: U",
      "Specify first corner point of unit cell:",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: S",
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
    cad.escape().select("L1").command("ARRAYRECT")
    answer("S")
    answer("U")
    cad.click(p(0, 0)).click(p(-30, -20))
    cad.enter()
    const starts = linesOf(cad.entities())
      .map((line) => `${line.start.x},${line.start.y}`)
      .sort()
    expect(starts).toContain("-90,-40")
    expect(cad.entityCount).toBe(12)
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

      expect(cad.entityCount).toBe(1)
      expect(cad.commandLog().at(-1)).toBe(named)
    }
  })

  it("cancels without creating anything", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYRECT").escape()

    expect(cad.entityCount).toBe(1)
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
      "Type = Rectangular  Associative = No",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAY Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
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
    expect(cad.commandLog().at(-1)).toBe("Tipo = Rectangular  Asociativa = No")
    cad.escape()

    answer(cad, "MATRIZ", "_L", "", "CA")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Ruta  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZ Seleccione la curva de trayectoria:"
    )
  })

  it("hands the set to ARRAYPOLAR at POlar (probe arrays/p204)", () => {
    for (const [locale, type] of [
      [undefined, "Type = Polar  Associative = No"],
      [es, "Tipo = Polar  Asociativa = No"],
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
      "Type = Rectangular  Associative = No",
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
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: 5",
      "Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>: 30,20",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYRECT Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:"
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
    const added = cad.entities().slice(2)
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
    const all = cad.entities() as (Entity & {
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
    const zs = cad
      .entities()
      .map((e) => (e as { elevation?: number }).elevation)
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
