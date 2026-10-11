import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, layerOf, lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** Two lines, then a circle away from them: the circle is the Last object. */
const drawing = () => [
  lineOf(p(0, 0), p(100, 0), { id: "A" }),
  lineOf(p(0, 50), p(100, 50), { id: "B" }),
  circleOf(p(250, 250), 10, { id: "C" }),
]

const SELECTION_MODES =
  "Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object"

// Every transcript below is AutoCAD 2023's console answering the same input.
describe("Select objects' modes", () => {
  it("counts Last, a duplicate, a Window, Remove and Undo as AutoCAD does", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "L", "L", "W", "-10,-10", "110,60", "R", "L", "A")
    answer(cad, "U", "U", "U", "U", "U")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "ERASE",
      "Select objects: L",
      "1 found",
      "Select objects: L",
      "1 found (1 duplicate), 1 total",
      "Select objects: W",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 110,60",
      "2 found, 3 total",
      "Select objects: R",
      "Remove objects: L",
      "1 found, 1 removed, 2 total",
      "Remove objects: A",
      "Select objects: U",
      "Select objects: U",
      "Select objects: U",
      "Select objects: U",
      "Select objects: U",
      "All selections have been undone.",
      "Select objects:",
    ])
    expect(cad.entityCount).toBe(3)
    expect(cad.activeToolId()).toBe("select")
  })

  it("adds the total once anything was found, after Undo too, and never for 0 found", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "W", "200,-100", "300,-50", "U", "L", "U", "W")
    answer(cad, "-10,-10", "110,60")

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: W",
      "Specify first corner: 200,-100",
      "Specify opposite corner: 300,-50",
      "0 found",
      "Select objects: U",
      "All selections have been undone.",
      "Select objects: L",
      "1 found",
      "Select objects: U",
      "Select objects: W",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 110,60",
      "2 found, 2 total",
    ])
  })

  it("writes picked corners on one line, as the opposite corner follows the first", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "W")
    cad.click(p(-10, -10)).click(p(110, 60))
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: W",
      "Specify first corner: Specify opposite corner: 2 found",
      "Select objects:",
      "2 objects erased.",
    ])
    expect(cad.entities().map((e) => e.id)).toEqual(["C"])
  })

  it("starts a window where a pick finds nothing, finished by the next pick", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    cad.click(p(-10, -10))
    expect(cad.state().commandLine.prompt).toBe(
      "ERASE Specify opposite corner:"
    )
    cad.click(p(110, 60))

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: Specify opposite corner: 2 found",
    ])
    expect(cad.selectedIds().sort()).toEqual(["A", "B"])
  })

  it("takes a Window inside it and a Crossing across it, whichever way they are drawn", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    // Right to left, which as BOX or a drag would be a crossing.
    answer(cad, "W", "50,60", "-10,-10")
    expect(cad.selectedIds()).toEqual([])
    answer(cad, "C", "50,-10", "60,60")
    expect(cad.selectedIds().sort()).toEqual(["A", "B"])

    const box = createHarness({ entities: drawing() })
    box.command("ERASE")
    answer(box, "BOX", "50,60", "-10,-10")
    expect(box.selectedIds().sort()).toEqual(["A", "B"])
    expect(box.commandLog().slice(-4)).toEqual([
      "Select objects: BOX",
      "Specify first corner: 50,60",
      "Specify opposite corner: -10,-10",
      "2 found",
    ])
  })

  it("asks the first corner again for a wrong corner or Enter", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "W", "FOO", "-10,-10", "FOO")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: W",
      "Specify first corner: FOO",
      "Invalid window specification.",
      "Specify first corner: -10,-10",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Specify first corner:",
      "Invalid window specification.",
    ])
    expect(cad.state().commandLine.prompt).toBe("ERASE Specify first corner:")
  })

  it("selects ALL, objects on a layer that is off too, and leaves the locked ones out", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A", layerId: "locked" }),
        lineOf(p(0, 50), p(100, 50), { id: "B", layerId: "off" }),
        lineOf(p(0, 100), p(100, 100), { id: "C" }),
      ],
      {
        layers: [
          layerOf("0"),
          layerOf("locked", { locked: true }),
          layerOf("off", { visible: false }),
        ],
      }
    )
    cad.command("ERASE")
    answer(cad, "ALL", "U", "W", "-10,-10", "110,110")

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: ALL",
      "3 found",
      "1 was on a locked layer.",
      "Select objects: U",
      "Select objects: W",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 110,110",
      "2 found, 1 total",
      "1 was on a locked layer.",
    ])
    expect(cad.selectedIds()).toEqual(["C"])
  })

  it("takes the Previous set again, once a command has been given one", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("MOVE")
    answer(cad, "P")
    expect(cad.commandLog().at(-1)).toBe("No previous selection set.")
    answer(cad, "W", "-10,-10", "110,60")
    cad.enter()
    answer(cad, "0,0", "0,10")

    cad.escape().command("ERASE")
    answer(cad, "P")
    expect(cad.commandLog().slice(-2)).toEqual(["Select objects: P", "2 found"])
    cad.enter()
    expect(cad.entities().map((e) => e.id)).toEqual(["C"])

    cad.command("ERASE")
    answer(cad, "P")
    expect(cad.commandLog().at(-1)).toBe("No previous selection set.")
  })

  it("keeps a set selected before the command as the Previous one", () => {
    const cad = createHarness({ entities: drawing() })
    cad.select("A", "C").command("MOVE")
    answer(cad, "0,0", "10,0")
    cad.escape().command("ERASE")
    answer(cad, "P")
    expect(cad.commandLog().slice(-2)).toEqual(["Select objects: P", "2 found"])
  })

  it("selects across a Fence, whose Undo takes back its last point", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "F", "50,-10", "50,20", "U", "50,60")
    expect(cad.state().commandLine.prompt).toBe(
      "ERASE Specify next fence point or [Undo]:"
    )
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: F",
      "Specify first fence point or pick/drag cursor: 50,-10",
      "Specify next fence point or [Undo]: 50,20",
      "Specify next fence point or [Undo]: U",
      "Specify next fence point or [Undo]: 50,60",
      "Specify next fence point or [Undo]:",
      "2 found",
    ])
    expect(cad.selectedIds().sort()).toEqual(["A", "B"])
  })

  it("says what a picked Fence found after the Enter that closes it", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "F")
    cad.click(p(50, -10)).click(p(50, 60)).enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: F",
      "Specify first fence point or pick/drag cursor:",
      "Specify next fence point or [Undo]:",
      "Specify next fence point or [Undo]:",
      "2 found",
    ])
  })

  it("selects in a WPolygon and across a CPolygon", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "WP", "-10,-10", "110,-10", "110,20", "-10,20")
    cad.enter()
    answer(cad, "CP", "50,-10", "60,-10", "60,60")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: WP",
      "First polygon point or pick/drag cursor: -10,-10",
      "Specify endpoint of line or [Undo]: 110,-10",
      "Specify endpoint of line or [Undo]: 110,20",
      "Specify endpoint of line or [Undo]: -10,20",
      "Specify endpoint of line or [Undo]:",
      "1 found",
      "Select objects: CP",
      "First polygon point or pick/drag cursor: 50,-10",
      "Specify endpoint of line or [Undo]: 60,-10",
      "Specify endpoint of line or [Undo]: 60,60",
      "Specify endpoint of line or [Undo]:",
      "2 found (1 duplicate), 2 total",
    ])
  })

  it("refuses a polygon point whose edge has no length or crosses another", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "WP", "0,0", "0,0", "100,0", "0,100", "100,100")

    // The last point's closing edge, back to 0,0, would cross 100,0–0,100.
    expect(cad.commandLog().slice(2)).toEqual([
      "First polygon point or pick/drag cursor: 0,0",
      "Specify endpoint of line or [Undo]: 0,0",
      "Invalid point, polygon segment is zero length.",
      "Specify endpoint of line or [Undo]: 100,0",
      "Specify endpoint of line or [Undo]: 0,100",
      "Specify endpoint of line or [Undo]: 100,100",
      "Invalid point, polygon segments cannot intersect.",
    ])
  })

  it("ends Select objects when Enter closes a fence or polygon too short", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "F", "50,-10")
    cad.enter()
    expect(cad.activeToolId()).toBe("select")

    cad.command("ERASE")
    answer(cad, "L", "WP", "0,0", "10,0")
    cad.enter()
    expect(cad.entities().map((e) => e.id)).toEqual(["A", "B"])
  })

  it("refuses at a fence's point and at Remove objects in AutoCAD's words", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "F", "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify first fence point or pick/drag cursor: FOO",
      "Invalid response.",
    ])
    cad.enter()

    cad.command("ERASE")
    answer(cad, "R", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Remove objects: FOO",
      "*Invalid selection*",
      `Expects a point or ${SELECTION_MODES}`,
    ])
  })

  it("closes the set at SIngle's first find, and takes AUto as the prompt already does", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("MOVE")
    answer(cad, "AU", "SI", "L")

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: AU",
      "Select objects: SI",
      "Select objects: L",
      "1 found",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "MOVE Specify base point or [Displacement] <Displacement>:"
    )
  })

  it("is the same Select objects in every command that asks for a set", () => {
    const cad = createHarness({ entities: drawing() })
    for (const command of ["COPY", "ROTATE", "SCALE", "MIRROR", "EXPLODE"]) {
      cad.command(command)
      answer(cad, "L")
      expect(cad.commandLog().slice(-2), command).toEqual([
        "Select objects: L",
        "1 found",
      ])
      cad.escape().escape()
    }
  })

  it("stretches what a crossing polygon frames", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("STRETCH")
    answer(cad, "CP", "90,-10", "110,-10", "110,10", "90,10")
    cad.enter().enter()
    answer(cad, "0,0", "20,0")

    const line = cad.entities()[0]
    expect(line.type === "line" && [line.start, line.end]).toEqual([
      { x: 0, y: 0 },
      { x: 120, y: 0 },
    ])
  })

  it("asks and counts in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "LT", "LT", "V", "-10,-10", "110,60", "E", "LT", "A", "H")
    answer(cad, "P", "B", "50,-10", "50,60")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: LT",
      "1 encontrados",
      "Designe objetos: LT",
      "1 encontrados (1 duplicados), 1 total",
      "Designe objetos: V",
      "Designe primera esquina: -10,-10",
      "Designe esquina opuesta: 110,60",
      "2 encontrados, 3 total",
      "Designe objetos: E",
      "Elimine objetos: LT",
      "1 encontrados, eliminados 1, 2 total",
      "Elimine objetos: A",
      "Designe objetos: H",
      "Designe objetos: P",
      "No hay ningún conjunto de selección previo.",
      "Designe objetos: B",
      "Precise primer punto del borde o designe/arrastre cursor: 50,-10",
      "Precise punto del borde o [desHacer]: 50,60",
      "Precise punto del borde o [desHacer]:",
      "2 encontrados (2 duplicados), 3 total",
    ])
  })

  it("refuses and undoes in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "H", "OV", "0,0", "0,0", "FOO")
    cad.escape()
    cad.command("BORRA")
    answer(cad, "V", "FOO")

    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: H",
      "Se han anulado todas las designaciones.",
      "Designe objetos: OV",
      "Primer punto del polígono o designe/arrastre cursor: 0,0",
      "Precise punto final de línea o [desHacer]: 0,0",
      "Punto no válido: el segmento del polígono tiene una longitud cero.",
      "Precise punto final de línea o [desHacer]: FOO",
      "Respuesta no válida.",
      "Precise punto final de línea o [desHacer]: *Cancelar*",
      "BORRA",
      "Designe objetos: V",
      "Designe primera esquina: FOO",
      "Designación de ventana no válida.",
    ])
  })
})
