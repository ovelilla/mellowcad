import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import type { CircleEntity, Entity, LineEntity } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, layerOf, lineOf, p } from "../../../test/builders"
import { withElevation } from "../../domain/elevation"
import { es } from "../../locales/es"

/**
 * ARRAY, ARRAYRECT, ARRAYPOLAR and the arrays' shared prompts, against AutoCAD 2027's
 * console (probes arrays/p100–p179, p200–p279, in en-US and es-ES).
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
  "ARRAYPOLAR Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>:"

describe("ARRAYPOLAR", () => {
  // probe arrays/p248: a line round 0,0, ROTate Yes.
  it("turns each item about the centre", () => {
    const cad = createHarness({
      entities: [lineOf(p(10, 10), p(20, 15), { id: "L1" })],
    })

    cad.select("L1").command("ARRAYPOLAR").click(p(0, 0))
    cad.option("Items").type("4").enter().enter()

    const lines = linesOf(cad.entities())
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
      "Type = Polar  Associative = No",
      "Specify center point of array:",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: I",
      "Enter number of items in array <6>: 4",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: A",
      "Specify angle between items <90>: 30",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: F",
      "Specify the angle to fill (+=ccw, -=cw) <90>: 180",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: ROT",
      "Rotate arrayed items? [Yes/No] <Yes>: N",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: X",
    ])
    // Four items over 180°, 60° apart, carried round by the extents' centre
    // 100,10 without turning (p245).
    expect(linesOf(cad.entities()).map((line) => line.start)).toBeCloseToPoints(
      [p(100, 0), p(41.339746, 81.60254), p(-58.660254, 71.60254), p(-100, -20)]
    )
    expect(linesOf(cad.entities()).every((l) => l.end.x === l.start.x)).toBe(
      true
    )
  })

  // probes arrays/p201, p262: 2027's Spanish centre prompt.
  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(100, 0), p(100, 20), { id: "L1" })],
    })

    cad.select("L1").command("MATRIZPOLAR")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Polar  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Especifique el punto central de la matriz:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZPOLAR Seleccione un pinzamiento para editar la matriz o [Elementos/ángUlo entre/ángulo de Relleno/Girar objetos/Salir] <Salir>:"
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
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: 5,5",
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: 7",
    ])
    expect(cad.state().commandLine.prompt).toBe(POLAR_MAIN)
    expect(cad.entityCount).toBe(1)
  })

  it("asks ROWs or ROTate? at R, ROWs declared but not built (probe arrays/p210)", () => {
    const cad = polar()

    answer(cad, "0,0", "R")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit] <eXit>: R",
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
    const ghosts = () =>
      cad.scene().primitives.filter((prim) => {
        const stroke = (prim as { stroke?: { dash?: readonly number[] } })
          .stroke
        return stroke?.dash?.[0] === 6
      }).length

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
    expect(cad.entityCount).toBe(1)

    const two = createHarness()
    answer(two, "_CIRCLE", "10,10", "2", "_ARRAYPOLAR", "_L", "", "0,0", "_X")
    answer(two, "_UNDO", "2")
    expect(two.commandLog().at(-1)).toBe("ARRAYPOLAR CIRCLE")
    expect(two.entityCount).toBe(0)
    answer(two, "_REDO")
    expect(two.commandLog().slice(-2)).toEqual([
      "CIRCLE ARRAYPOLAR",
      "Everything has been redone",
    ])
    expect(two.entityCount).toBe(6)

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
    return cad.entities().map((e) => {
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
    const zs = cad
      .entities()
      .map((e) => (e as { elevation?: number }).elevation)
    expect(zs).toEqual([5, 5, 5, 5])
  })
})
