import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { withElevation } from "../../domain/entities"
import type { ScenePrimitive } from "../../scene/types"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, deg, lineOf, p, polylineOf } from "../../../test/builders"
import { es } from "../../locales/es"

/**
 * The inquiry and distribution commands. MEASURE creates no geometry at all —
 * its whole output is the on-screen readout — so the scene's label primitives
 * are its observable contract. ARRAYPATH is the opposite: it consumes the
 * source objects and redistributes them along a curve.
 */

function readout(cad: CadHarness): string[] {
  return cad
    .scene()
    .primitives.filter(
      (primitive): primitive is Extract<ScenePrimitive, { kind: "label" }> =>
        primitive.kind === "label"
    )
    .map((label) => label.text)
}

describe("DIST", () => {
  it("reads distance, angle and the deltas while the second point is picked", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 0))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+300\.00 mm/.test(line))).toBe(true)
    expect(lines.some((line) => /Angle\s+0°/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔX\s+300\.00/.test(line))).toBe(true)
    expect(lines.some((line) => /ΔY\s+0\.00/.test(line))).toBe(true)
  })

  it("measures a diagonal", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 400))

    const lines = readout(cad)
    expect(lines.some((line) => /Dist\s+500\.00 mm/.test(line))).toBe(true)
    expect(lines.some((line) => new RegExp(`Angle\\s+53°`).test(line))).toBe(
      true
    )
  })

  it("creates no geometry", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(cad.entityCount).toBe(0)
  })

  it("follows the document's unit and precision", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(0)

    cad.command("DIST").click(p(0, 0)).moveTo(p(300, 0))

    expect(readout(cad).some((line) => /Dist\s+300 mm/.test(line))).toBe(true)
  })

  it("ends after one pair, its readout with it, as AutoCAD's DIST does", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 0))

    expect(cad.activeToolId()).toBe("select")
    expect(readout(cad)).toEqual([])
  })

  it("writes AutoCAD's report at the command prompt", () => {
    const cad = createHarness()

    cad.command("DIST").click(p(0, 0)).click(p(300, 400))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 500.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\n" +
        "Delta X = 300.00,  Delta Y = 400.00,   Delta Z = 0.00"
    )
  })

  it("measures in 3D, putting a typed point without a Z at the elevation", () => {
    const cad = createHarness()
    cad.command("ELEV").type("5").enter().type("0").enter()

    cad.command("DIST").type("0,0,-7").enter().moveTo(p(3, 4))
    expect(readout(cad)).toContain("ΔZ    12.00")
    cad.type("3,4").enter()

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 13.00,  Angle in XY Plane = 53,  Angle from XY Plane = 67\n" +
        "Delta X = 3.00,  Delta Y = 4.00,   Delta Z = 12.00"
    )
  })

  it("takes a snapped point's Z from the object", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("DIST").click(p(100, 0)).click(p(100, 50))

    // Below the XY plane the angle reads the way AutoCAD's do, from 0 to 360.
    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 50.99,  Angle in XY Plane = 90,  Angle from XY Plane = 349\n" +
        "Delta X = 0.00,  Delta Y = 50.00,   Delta Z = -10.00"
    )
  })

  it("reads the deltas and the angle in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").type("90").enter()

    cad.command("DIST").click(p(0, 0)).click(p(0, 100))

    expect(cad.commandLog().at(-1)).toBe(
      "Distance = 100.00,  Angle in XY Plane = 0,  Angle from XY Plane = 0\n" +
        "Delta X = 100.00,  Delta Y = 0.00,   Delta Z = 0.00"
    )
  })

  it("ends on Enter at the first point", () => {
    const cad = createHarness()

    cad.command("DIST").enter()

    expect(cad.activeToolId()).toBe("select")
  })
})

describe("ID", () => {
  it("reports a typed point's X, Y and Z in the UCS", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,3").enter().enter()

    cad.command("ID").type("1,2,3").enter()

    expect(cad.commandLog().at(-1)).toBe(" X = 1.00     Y = 2.00     Z = 3.00")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(0)
  })

  it("takes the Z of the object snapped to, and the elevation otherwise", () => {
    const raised = withElevation(lineOf(p(0, 0), p(100, 0)), 10)
    const cad = createHarness({ entities: [raised], snap: true })

    cad.command("ID").click(p(100, 0))
    expect(cad.commandLog().at(-1)).toBe(
      " X = 100.00     Y = 0.00     Z = 10.00"
    )

    cad.command("ELEV").type("4").enter().type("0").enter()
    cad.command("ID").click(p(50, 80))
    expect(cad.commandLog().at(-1)).toBe(
      " X = 50.00     Y = 80.00     Z = 4.00"
    )
  })
})

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

// AutoCAD 2023's console answering the same input.
describe("DIST and ID ask as AutoCAD 2026", () => {
  it("DIST asks its two points, and Enter at the second measures to the first", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "FOO", "0,0", "FOO", "3,4")
    expect(cad.commandLog()).toEqual([
      "DIST",
      "Specify first point: FOO",
      "Invalid point.",
      "Specify first point: 0,0",
      "Specify second point or [Multiple points]: FOO",
      "Point or option keyword required.",
      "Specify second point or [Multiple points]: 3,4",
      "Distance = 5.00,  Angle in XY Plane = 53,  Angle from XY Plane = 0\nDelta X = 3.00,  Delta Y = 4.00,   Delta Z = 0.00",
    ])
    expect(cad.activeToolId()).toBe("select")
    cad.command("DIST")
    answer(cad, "1,1")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify second point or [Multiple points]:",
      "Distance = 0.00,  Angle in XY Plane = 0,  Angle from XY Plane = 0\nDelta X = 0.00,  Delta Y = 0.00,   Delta Z = 0.00",
    ])
  })

  it("ID asks its point and refuses what is none", () => {
    const cad = createHarness()
    cad.command("ID")
    answer(cad, "FOO", "1,2")
    expect(cad.commandLog()).toEqual([
      "ID",
      "Specify point: FOO",
      "Invalid point.",
      "Specify point: 1,2",
      " X = 1.00     Y = 2.00     Z = 0.00",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIST")
    answer(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "DIST Especifique segundo punto o [puntos Múltiples]:"
    )
    answer(cad, "3,4")
    expect(cad.activeToolId()).toBe("select")
    cad.command("ID")
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise punto: FOO",
      "Punto no válido.",
    ])
  })
})

// AutoCAD 2023's console, the same input: the run so far before each next
// point, Arc left out (not built).
describe("DIST's Multiple points", () => {
  it("adds up the run, says it again after a refusal and undoes a point", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "3,4", "6,8", "FOO", "U", "U", "U", "6,0")
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "DIST",
      "Specify first point: 0,0",
      "Specify second point or [Multiple points]: M",
      "Specify next point or [Length/Undo/Total] <Total>: 3,4",
      "Distance = 5.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: 6,8",
      "Distance = 10.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: FOO",
      "Point or option keyword required.",
      "Distance = 10.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: U",
      "Distance = 5.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: U",
      "Specify next point or [Length/Undo/Total] <Total>: U",
      "All segments already undone.",
      "Specify next point or [Length/Undo/Total] <Total>: 6,0",
      "Distance = 6.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>:",
      "Distance = 6.00",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("closes back to the first point", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "10,0", "10,10", "C")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Close/Length/Undo/Total] <Total>: C",
      "Distance = 34.14",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("goes on by a length, along the last segment or the X axis", () => {
    const cad = createHarness()
    cad.command("DIST")
    answer(cad, "0,0", "M", "L", "7", "10,0", "L", "FOO")
    cad.enter()
    answer(cad, "-4", "L", "@0,5", "T")
    expect(cad.commandLog().slice(3)).toEqual([
      "Specify next point or [Length/Undo/Total] <Total>: L",
      "Specify length of line: 7",
      "Distance = 7.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: 10,0",
      "Distance = 10.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: L",
      "Specify length of line: FOO",
      "Requires numeric distance or second point.",
      "Specify length of line:",
      "Requires numeric distance or second point.",
      "Specify length of line: -4",
      "Distance = 14.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: L",
      "Specify length of line: @0,5",
      "Distance = 19.00",
      "Specify next point or [Close/Length/Undo/Total] <Total>: T",
      "Distance = 19.00",
    ])
  })

  it("reads the run on screen as it goes", () => {
    const cad = createHarness()
    cad.command("DIST").click(p(0, 0))
    answer(cad, "M")
    cad.click(p(300, 0)).moveTo(p(300, 400))
    expect(readout(cad)).toEqual(["Dist  700.00 mm"])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("DIST")
    answer(cad, "0,0", "M", "3,4", "FOO", "C")
    expect(cad.commandLog().slice(2)).toEqual([
      "Especifique segundo punto o [puntos Múltiples]: M",
      "Precise punto siguiente o [Longitud/desHacer/Total] <Total>: 3,4",
      "Distancia = 5.00",
      "Precise punto siguiente o [Cerrar/Longitud/desHacer/Total] <Total>: FOO",
      "Se requiere un punto o una opción.",
      "Distancia = 5.00",
      "Precise punto siguiente o [Cerrar/Longitud/desHacer/Total] <Total>: C",
      "Distancia = 10.00",
    ])
    cad.command("DIST")
    answer(cad, "0,0", "M", "L")
    expect(cad.state().commandLine.prompt).toBe(
      "DIST Precise longitud de línea:"
    )
  })
})

describe("AREA", () => {
  it("reports the area and perimeter of the picked polygon, and ends", () => {
    const cad = createHarness()

    cad
      .command("AREA")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .moveTo(p(0, 100))

    const lines = readout(cad)
    expect(lines.some((line) => /Area\s+10000\.00 mm²/.test(line))).toBe(true)
    expect(lines.some((line) => /Perim\s+400\.00 mm/.test(line))).toBe(true)

    cad.click(p(0, 100)).enter()
    expect(cad.commandLog().at(-1)).toBe("Area = 10000.00, Perimeter = 400.00")
    expect(cad.activeToolId()).toBe("select")
  })

  it("offers Undo from the second point and Total from the fourth", () => {
    const cad = createHarness()

    cad.command("AREA")
    expect(cad.optionAbbreviations()).toEqual(["O"])
    cad.click(p(0, 0)).click(p(100, 0))
    expect(cad.optionAbbreviations()).toEqual(["U"])

    // Step back over the mistaken vertex and replace it.
    cad.option("Undo").click(p(200, 0)).click(p(200, 100))
    expect(cad.optionAbbreviations()).toEqual(["U", "T"])
    cad.click(p(0, 100)).option("Total")

    expect(cad.commandLog().at(-1)).toBe("Area = 20000.00, Perimeter = 600.00")
  })

  it("refuses Enter before a shape has three points", () => {
    const cad = createHarness()

    cad.command("AREA").click(p(0, 0)).click(p(100, 0)).enter()

    expect(cad.activeToolId()).toBe("measurearea")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify next point or [Undo]:",
      "Point or option keyword required.",
    ])
  })

  it("measures an object, the prompt's default", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 100), { id: "L" }),
        circleOf(p(500, 0), 5, { id: "C" }),
      ],
    })

    cad.command("AREA").enter().click(p(50, 50)).click(p(505, 0))

    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object] <Object>:",
      "Select objects:",
      "Selected object does not have an area",
      "Select objects:",
      "Area = 78.54, Circumference = 31.42",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("closes an open curve and reports its length, as AutoCAD's does", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(10, 0), p(10, 10)])],
    })

    cad.command("AREA")
    answer(cad, "O", "FOO", "L")

    expect(cad.commandLog().slice(1)).toEqual([
      "Specify first corner point or [Object] <Object>: O",
      "Select objects: FOO",
      "*Invalid selection*",
      "Expects a point or Last",
      "Select objects: L",
      "Area = 50.00, Length = 20.00",
    ])
  })

  it("keeps the first corner when Undo has nothing else to take back", () => {
    const cad = createHarness()

    cad.command("AREA")
    answer(cad, "FOO", "0,0", "U", "FOO", "10,0", "10,10", "0,10")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "AREA",
      "Specify first corner point or [Object] <Object>: FOO",
      "Point or option keyword required.",
      "Specify first corner point or [Object] <Object>: 0,0",
      "Specify next point or [Undo]: U",
      "All segments already undone.",
      "Command has been completely undone.",
      "Specify next point or [Undo]: FOO",
      "Point or option keyword required.",
      "Specify next point or [Undo]: 10,0",
      "Specify next point or [Undo]: 10,10",
      "Specify next point or [Undo/Total] <Total>: 0,10",
      "Specify next point or [Undo/Total] <Total>:",
      "Area = 100.00, Perimeter = 40.00",
    ])
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 5)],
    })

    cad.command("AREA")
    expect(cad.state().commandLine.prompt).toBe(
      "AREA Precise primer punto de esquina o [Objeto] <Objeto>:"
    )
    answer(cad, "0,0", "H", "10,0", "10,10")
    expect(cad.state().commandLine.prompt).toBe(
      "AREA Precise punto siguiente o [desHacer/Total] <Total>:"
    )
    answer(cad, "T")
    expect(cad.commandLog().slice(3, 5)).toEqual([
      "Ya están deshechos todos los segmentos.",
      "Todos los efectos del comando han sido deshechos.",
    ])
    expect(cad.commandLog().at(-1)).toBe("Área = 50.00, Perímetro = 34.14")

    cad.command("AREA")
    answer(cad, "O", "LT")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Precise primer punto de esquina o [Objeto] <Objeto>: O",
      "Designe objetos: LT",
      "Área = 78.54, Circunferencia = 31.42",
    ])
  })
})

describe("ARRAYPATH", () => {
  const path = lineOf(p(0, 0), p(200, 0), { id: "PATH" })
  const source = lineOf(p(400, -25), p(400, 25), { id: "SRC" })

  it("divides the path into evenly spaced items", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0)) // the path
    cad.option("Method").option("Divide").option("Items")
    cad.type("5").enter().enter()

    // Five items plus the path itself; the source has been redistributed.
    expect(cad.entityCount).toBe(6)
    expect(cad.runtime.document.has("SRC")).toBe(false)
    expect(cad.runtime.document.has("PATH")).toBe(true)

    const centres = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line" && e.id !== "PATH")
      .map((line) => (line.start.x + line.end.x) / 2)
      .sort((a, b) => a - b)
    expect(centres).toHaveLength(5)
    for (const [index, x] of centres.entries()) {
      expect(x).toBeCloseTo(index * 50, 5)
    }
  })

  it("places items at a fixed spacing under the Measure method", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0))
    cad.option("Items").type("40").enter()
    expect(cad.commandLog().at(-1)).toBe("Maximum items = 6")
    cad.option("Fill entire path").enter()

    // 0, 40, 80, 120, 160, 200 → six items, plus the path.
    expect(cad.entityCount).toBe(7)
  })

  it("restores the source in a single undo step", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0)).option("eXit")
    cad.undo()

    expect(cad.entityCount).toBe(2)
    expect(cad.runtime.document.has("SRC")).toBe(true)
  })

  it("aligns items to the curve's tangent, unless told not to", () => {
    const arcPath = {
      id: "PATH",
      type: "arc" as const,
      layerId: "0",
      center: p(0, 0),
      radius: 150,
      startAngle: 0,
      endAngle: deg(180),
    }
    const aligned = createHarness({ entities: [arcPath, source] })

    aligned.select("SRC").command("ARRAYPATH").click(p(150, 0))
    aligned.option("Method").option("Divide")
    aligned.option("Items").type("3").enter().enter()

    const orientations = aligned
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
      .map((line) => Math.abs(line.end.x - line.start.x) < 1e-6)
    // Following a semicircle, the items cannot all keep one orientation.
    expect(new Set(orientations).size).toBeGreaterThan(1)

    const free = createHarness({ entities: [arcPath, source] })
    free.select("SRC").command("ARRAYPATH").click(p(150, 0))
    free.option("Align items").option("No")
    free.option("Method").option("Divide")
    free.option("Items").type("3").enter().enter()

    const unrotated = free
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(unrotated).toHaveLength(3)
    for (const line of unrotated) {
      expect(line.start.x).toBeCloseTo(line.end.x, 6)
    }
  })

  it("asks AutoCAD's questions over the preview and writes them answered", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH")
    expect(cad.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
    cad.click(p(400, 0))
    expect(cad.commandLog().slice(-2)).toEqual([
      "Objects selected to be arrayed may not be selected as path curve.",
      "1 was filtered out",
    ])
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARRAYPATH Select grip to edit array or [Method/Items/Align items/eXit] <eXit>:"
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
      "ARRAYPATH Specify the distance between items along path <50.00>:"
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

    expect(cad.commandLog().slice(0, 4)).toEqual([
      "ARRAYPATH 1 found",
      "Type = Path  Associative = No",
      "Select path curve:",
      "Objects selected to be arrayed may not be selected as path curve.",
    ])
    // 0, 30 … 180 → seven items, plus the path.
    expect(cad.entityCount).toBe(8)
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({ locale: es, entities: [path, source] })

    cad.select("SRC").command("MATRIZCAMINO")
    expect(cad.commandLog().at(-1)).toBe("Tipo = Ruta  Asociativa = No")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Seleccione la curva de trayectoria:"
    )
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Seleccione un pinzamiento para editar la matriz o [Método/Elementos/ALinear elementos/Salir] <Salir>:"
    )
    cad.option("Method")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Introduzca el método de camino [Dividir/Medir] <Medir>:"
    )
    cad.enter().option("Items")
    expect(cad.state().commandLine.prompt).toBe(
      "MATRIZCAMINO Especifique la distancia entre los elementos a lo largo del camino <75.00>:"
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

  it("cancels without touching the drawing", () => {
    const cad = createHarness({ entities: [path, source] })

    cad.select("SRC").command("ARRAYPATH").click(p(100, 0)).escape()

    expect(cad.entityCount).toBe(2)
    expect(cad.runtime.document.has("SRC")).toBe(true)
  })
})
