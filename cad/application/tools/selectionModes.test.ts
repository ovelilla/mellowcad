import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import {
  circleOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"
import type { LineEntity } from "../../domain/entities"
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

// Every transcript below is AutoCAD's console answering the same input: 2023's
// where a test cites `acc/…` or nothing, 2027's where it cites a probe of
// `erase/`.
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

  // ERASE says nothing once the set closes (erase/p00, p101).
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

  // erase/p243, p247: Remove objects counts a locked object and says nothing
  // of its layer: it never was in the set.
  it("says nothing of a locked layer at Remove objects", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 50), p(100, 50), { id: "LK", layerId: "locked" }),
      ],
      { layers: [layerOf("0"), layerOf("locked", { locked: true })] }
    )
    cad.command("ERASE")
    answer(cad, "ALL", "R", "W", "-10,-10", "110,60")

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: ALL",
      "2 found",
      "1 was on a locked layer.",
      "Select objects: R",
      "Remove objects: W",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 110,60",
      "2 found, 1 removed, 0 total",
    ])
  })

  it("goes back to Select objects when Undo takes a selection back at Remove objects (erase/p145, p156)", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "_U", "_L", "_R", "_L", "_U")
    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: _U",
      "All selections have been undone.",
      "Select objects: _L",
      "1 found",
      "Select objects: _R",
      "Remove objects: _L",
      "1 found, 1 removed, 0 total",
      "Remove objects: _U",
    ])
    expect(cad.state().commandLine.prompt).toBe("ERASE Select objects:")
    expect(cad.selectedIds()).toEqual(["C"])

    const window = createHarness({ entities: drawing() })
    window.command("ERASE")
    answer(window, "_L", "_W", "-10,-10", "110,60", "_R", "_U")
    expect(window.state().commandLine.prompt).toBe("ERASE Select objects:")
    expect(window.selectedIds()).toEqual(["C"])
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

  it("has no Previous set once U brings an erased one back (erase/p111, p234)", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "_ERASE", "_L", "", "_U", "_ERASE", "_P")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select objects: _P",
      "No previous selection set.",
    ])
    expect(cad.entityCount).toBe(3)

    // Nor the set before it: ERASE's replaced it (p234).
    const after = createHarness({ entities: drawing() })
    answer(after, "_MOVE", "_W", "-10,-10", "110,60", "", "0,0", "1,0")
    answer(after, "_ERASE", "_L", "", "_U", "_MOVE", "_P")
    expect(after.commandLog().at(-1)).toBe("No previous selection set.")
  })

  it("keeps MOVE's set as the Previous one after its U (erase/p162, p240)", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "_MOVE", "_L", "", "0,0", "10,0", "_U", "_ERASE", "_P")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select objects: _P",
      "1 found",
    ])
  })

  it("keeps EXPLODE's pieces as the Previous set, none selected (erase/p236, p258)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 100), p(100, 100), p(100, 150)], { id: "P" }),
      ],
    })
    answer(cad, "_EXPLODE", "50,100", "")
    expect(cad.selectedIds()).toEqual([])

    answer(cad, "_ERASE", "_P", "")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select objects: _P",
      "2 found",
      "Select objects:",
    ])
    expect(cad.entityCount).toBe(0)
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

  // acc/fn2, sq3.
  it("refuses a polygon point whose edge has no length or crosses another", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "WP", "0,0", "0,0", "100,0", "100,100", "50,-50")
    cad.enter()

    expect(cad.commandLog().slice(2)).toEqual([
      "First polygon point or pick/drag cursor: 0,0",
      "Specify endpoint of line or [Undo]: 0,0",
      "Invalid point, polygon segment is zero length.",
      "Specify endpoint of line or [Undo]: 100,0",
      "Specify endpoint of line or [Undo]: 100,100",
      "Specify endpoint of line or [Undo]: 50,-50",
      "Invalid point, polygon segments cannot intersect.",
      "Specify endpoint of line or [Undo]:",
      "0 found",
    ])
  })

  // acc/sq1, sq2, sq4, sq5: the closing edge back to 0,0 crosses 100,0–0,100.
  it("refuses Enter while the polygon's closing edge crosses another, keeping its points", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "WP", "0,0", "100,0", "0,100", "100,100")
    cad.enter().enter()
    answer(cad, "FOO", "U")
    cad.enter()
    answer(cad, "CP", "0,0", "100,0", "0,100", "100,100")
    cad.enter()
    answer(cad, "-50,150")
    cad.enter()

    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: WP",
      "First polygon point or pick/drag cursor: 0,0",
      "Specify endpoint of line or [Undo]: 100,0",
      "Specify endpoint of line or [Undo]: 0,100",
      "Specify endpoint of line or [Undo]: 100,100",
      "Specify endpoint of line or [Undo]:",
      "Invalid point, polygon segments cannot intersect.",
      "Specify endpoint of line or [Undo]:",
      "Invalid point, polygon segments cannot intersect.",
      "Specify endpoint of line or [Undo]: FOO",
      "Invalid response.",
      "Specify endpoint of line or [Undo]: U",
      "Specify endpoint of line or [Undo]:",
      "0 found",
      "Select objects: CP",
      "First polygon point or pick/drag cursor: 0,0",
      "Specify endpoint of line or [Undo]: 100,0",
      "Specify endpoint of line or [Undo]: 0,100",
      "Specify endpoint of line or [Undo]: 100,100",
      "Specify endpoint of line or [Undo]:",
      "Invalid point, polygon segments cannot intersect.",
      "Specify endpoint of line or [Undo]: -50,150",
      "Specify endpoint of line or [Undo]:",
      "2 found",
    ])
  })

  it("refuses it in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "OV", "0,0", "100,0", "0,100", "100,100")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Precise punto final de línea o [desHacer]:",
      "Punto no válido: los segmentos del polígono no pueden intersecarse.",
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

  // AutoCAD 2023's console (acc/u1–u17, v1–v7): `S` starts SIngle and the
  // hidden SUbobject alike where the set takes sub-objects; 2027's ERASE
  // ends there with no count of its own (erase/p130).
  it("asks SIngle or SUbobject? for S, as the console does", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "S")
    expect(cad.state().commandLine.prompt).toBe("ERASE SIngle or SUbobject?")
    answer(cad, "SI", "L")
    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: S",
      "Ambiguous response, please clarify...",
      "SIngle or SUbobject? SI",
      "Select objects: L",
      "1 found",
    ])
    expect(cad.entityCount).toBe(2)

    const other = createHarness({ entities: drawing() })
    other.command("ERASE")
    answer(other, "S", "", "L", "S", "FOO")
    expect(other.commandLog().slice(1)).toEqual([
      "Select objects: S",
      "Ambiguous response, please clarify...",
      "SIngle or SUbobject?",
      "Invalid option keyword.",
      "SIngle or SUbobject? L",
      "1 found",
      "Select objects: S",
      "Ambiguous response, please clarify...",
      "SIngle or SUbobject? FOO",
      "*Invalid selection*",
      `Expects a point or ${SELECTION_MODES}`,
    ])
  })

  it("finds nothing in SUbobject, refuses Last and ALL there, and Object goes back", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "SU", "L", "50,0", "W", "-10,-10", "110,60", "O", "L")
    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: SU",
      "Select objects: L",
      "*Invalid selection*",
      "Expects a point or Window/Crossing/BOX/Fence/WPolygon/CPolygon/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object",
      "Select objects: 50,0",
      "0 found",
      "Select objects: W",
      "Specify first corner: -10,-10",
      "Specify opposite corner: 110,60",
      "0 found",
      "Select objects: O",
      "Select objects: L",
      "1 found",
    ])

    const picked = createHarness({ entities: drawing() })
    picked.command("ERASE")
    answer(picked, "SU")
    picked.click(p(50, 0))
    expect(picked.commandLog().at(-1)).toBe("Select objects: 0 found")
    expect(picked.runtime.selection.isEmpty()).toBe(true)
  })

  // AutoCAD 2027 takes MIRROR's `S` and does nothing, the set left open;
  // `SI` is SIngle (erase/p153 traced, p158 untraced, p154). Only MIRROR was
  // probed: every whole-object set takes it so.
  it("takes S and does nothing where the set is of whole objects, SI being SIngle, and refuses SU", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("MIRROR")
    answer(cad, "SU", "S", "L", "L")
    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: SU",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle",
      "Select objects: S",
      "Select objects: L",
      "1 found",
      "Select objects: L",
      "1 found (1 duplicate), 1 total",
    ])
    expect(cad.state().commandLine.prompt).toBe("MIRROR Select objects:")

    for (const command of ["MIRROR", "COPYCLIP"]) {
      const single = createHarness({ entities: drawing() })
      single.command(command)
      answer(single, "_S", "SI", "L")
      expect(single.commandLog().slice(1, 3), command).toEqual([
        "Select objects: _S",
        "Select objects: SI",
      ])
      expect(single.state().commandLine.prompt, command).not.toContain(
        "Select objects:"
      )
    }
  })

  it("takes S as Subobjeto in Autodesk's Spanish, whose SIngle is úNico", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "S", "LT", "O", "LT")
    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: S",
      "Designe objetos: LT",
      "*Designación no válida*",
      "Requiere un punto o Ventana/Captura/MArco/Borde/polígonOV/polígonOC/Añadir/Eliminar/Múltiple/Previo/desHacer/AUto/úNico/Subobjeto/Objeto",
      "Designe objetos: O",
      "Designe objetos: LT",
      "1 encontrados",
    ])
  })

  it("is the same Select objects in every command that asks for a set", () => {
    const cad = createHarness({ entities: drawing() })
    for (const command of ["COPY", "ROTATE", "SCALE", "MIRROR", "EXPLODE"]) {
      cad.command(command)
      answer(cad, "L")
      const log = cad.commandLog()
      const at = log.lastIndexOf("Select objects: L")
      expect(log.slice(at), command).toEqual(
        // EXPLODE refuses the circle under its count (erase/p213).
        command === "EXPLODE"
          ? ["Select objects: L", "1 found", "1 was not able to be exploded."]
          : ["Select objects: L", "1 found"]
      )
      cad.escape().escape()
    }
  })

  // erase/p02, p137, p138, p223 and p251 (traced), p259, p260: whether a
  // command's set takes sub-objects is what its refusal lists.
  it("lists the modes each command's set takes in its refusal", () => {
    const whole = `Expects a point or ${SELECTION_MODES.replace("/SUbobject/Object", "")}`
    const sub = `Expects a point or ${SELECTION_MODES}`
    const lists: Record<string, string> = {}
    for (const [command, ...before] of [
      ["ERASE"],
      ["MOVE"],
      ["ROTATE"],
      ["SCALE"],
      ["CUTCLIP"],
      ["EXPLODE"],
      ["COPYCLIP"],
      ["ARRAYRECT"],
      ["ARRAYPOLAR"],
      ["ARRAYPATH"],
      ["BLOCK", "BK", "0,0"],
      ["MIRROR"],
      ["JOIN"],
      ["ZOOM", "O"],
    ]) {
      const cad = createHarness({ entities: drawing() })
      cad.command(command)
      answer(cad, ...before, "FOO")
      lists[command] = cad.commandLog().at(-1) ?? ""
    }
    expect(lists).toEqual({
      ERASE: sub,
      MOVE: sub,
      ROTATE: sub,
      SCALE: sub,
      CUTCLIP: sub,
      EXPLODE: whole,
      COPYCLIP: whole,
      ARRAYRECT: whole,
      ARRAYPOLAR: whole,
      ARRAYPATH: whole,
      BLOCK: whole,
      MIRROR: whole,
      JOIN: whole,
      ZOOM: whole,
    })
  })

  // probe transforms/p269: CP stretches the end it frames.
  it("stretches what a crossing polygon frames", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("STRETCH")
    answer(cad, "CP", "90,-10", "110,-10", "110,10", "90,10")
    cad.enter().enter()
    answer(cad, "0,0", "20,0")

    const line = cad.entities()[0] as LineEntity
    expect([line.start, line.end]).toBeCloseToPoints([p(0, 0), p(120, 0)])
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
      "Precise punto final de línea o [desHacer]: *Cancelado*",
      "BORRA",
      "Designe objetos: V",
      "Designe primera esquina: FOO",
      "Designación de ventana no válida.",
    ])
  })
})

// AutoCAD's console: a mode at a single object's pick takes one of what it
// finds — BREAK the oldest (2027's, probes pieces/p125–p132, p144), UCS and
// ARRAYPATH the newest (2023's).
describe("a single object's pick takes the modes", () => {
  it("BREAK takes the oldest object a mode finds, and asks its first point", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("BREAK")
    answer(cad, "W", "200,200", "300,300")
    expect(cad.state().commandLine.prompt).toBe(
      "BREAK Specify first break point:"
    )
    cad.escape().command("BREAK")
    answer(cad, "C", "-10,-10", "50,60", "20,0", "40,0")
    const onA = cad
      .entities()
      .filter((e) => e.type === "line" && e.start.y === 0)
    expect(onA).toHaveLength(2)
    expect(cad.byId("B")).toMatchObject({
      start: { x: 0, y: 50 },
      end: { x: 100, y: 50 },
    })

    cad.command("BREAK")
    answer(cad, "W", "400,400", "500,500", "FOO")
    expect(cad.commandLog().slice(-7)).toEqual([
      "Select object: W",
      "Specify first corner: 400,400",
      "Specify opposite corner: 500,500",
      "No object found",
      "Select object: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
    ])
    cad.escape()
  })

  it("BREAK takes the oldest by every mode, whatever its place (p125–p132)", () => {
    for (const [probe, ...mode] of [
      ["p125", "W", "-10,-10", "110,60"],
      ["p126", "C", "-10,-10", "50,60"],
      ["p127", "ALL"],
      ["p128", "F", "50,-10", "50,60", ""],
      ["p129", "WP", "-10,-10", "110,-10", "110,60", "-10,60", ""],
      ["p130", "CP", "40,-10", "60,-10", "60,60", "40,60", ""],
      ["p131", "BOX", "110,60", "-10,-10"],
    ]) {
      const cad = createHarness({ entities: drawing().slice(0, 2) })
      answer(cad, "BREAK", ...mode, "20,0", "40,0")
      expect(lineEnds(cad), probe).toEqual([
        [
          [0, 0],
          [20, 0],
        ],
        [
          [0, 50],
          [100, 50],
        ],
        [
          [40, 0],
          [100, 0],
        ],
      ])
    }
    const older = createHarness({ entities: drawing().slice(0, 2).reverse() })
    answer(older, "BREAK", "W", "-10,-10", "110,60", "20,0", "40,0")
    expect(older.byId("B")).toMatchObject({ end: { x: 20, y: 50 } })
  })

  it("UCS OBject takes the newest, read at its start", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("UCS")
    answer(cad, "OB", "C", "-10,-10", "50,60")
    expect(cad.runtime.document.getSettings().ucs.origin).toMatchObject({
      x: 0,
      y: 50,
    })
    cad.command("UCS")
    answer(cad, "W")
    cad.command("UCS")
    answer(cad, "OB", "L")
    expect(cad.runtime.document.getSettings().ucs.origin).toMatchObject({
      x: 250,
      y: 250,
    })
    cad.command("UCS")
    answer(cad, "W")
    cad.command("UCS")
    answer(cad, "ZA", "O", "W", "-10,40", "110,60")
    expect(cad.runtime.document.getSettings().ucs.origin).toMatchObject({
      x: 0,
      y: 50,
    })
  })

  it("ARRAYPATH's path takes the newest curve and leaves out what is arrayed", () => {
    const cad = createHarness({ entities: drawing() })
    cad.select("C").command("ARRAYPATH")
    answer(cad, "L")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select path curve: L",
      "1 was filtered out",
    ])
    answer(cad, "C", "-10,-10", "50,60")
    expect(cad.state().commandLine.prompt).toMatch(
      /^ARRAYPATH Select grip to edit array/
    )
    cad.escape()
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("PARTE")
    answer(cad, "LT")
    expect(cad.state().commandLine.prompt).toBe(
      "PARTE Precise primer punto de ruptura:"
    )
    cad.escape()
  })
})

// AutoCAD 2023's console answering the same input.
describe("a point typed at Select objects", () => {
  // probes trim/p400, p401 (en, es): of two lines in the pick box the newer,
  // though the pick is nearer the older.
  it("takes the newest object in the pick box", () => {
    for (const [older, newer, at] of [
      [0, 2, "80,0.3"],
      [2, 0, "80,1.7"],
    ] as const) {
      const cad = createHarness({
        entities: [
          lineOf(p(0, older), p(100, older), { id: "OLDER" }),
          lineOf(p(0, newer), p(100, newer), { id: "NEWER" }),
        ],
      })
      cad.command("ERASE")
      answer(cad, at)
      cad.enter()
      expect(cad.entities().map((e) => e.id)).toEqual(["OLDER"])
    }
  })

  it("picks there, and on nothing starts a window", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "50,0", "50,0", "30,30", "110,60", "30,30", "-10,-10")
    answer(cad, "120,120", "FOO", "@1,1")
    expect(cad.commandLog()).toEqual([
      "ERASE",
      "Select objects: 50,0",
      "1 found",
      "Select objects: 50,0",
      "1 found (1 duplicate), 1 total",
      "Select objects: 30,30",
      "Specify opposite corner: 110,60",
      "0 found",
      "Select objects: 30,30",
      "Specify opposite corner: -10,-10",
      "1 found (1 duplicate), 1 total",
      "Select objects: 120,120",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Select objects: Specify opposite corner: @1,1",
      "0 found",
    ])
    cad.enter()
    expect(cad.runtime.document.has("A")).toBe(false)
  })

  // acc/sw1, sw5–sw8, sw10, sw11.
  it("says the prompt it started at before asking the opposite corner again", () => {
    const cad = createHarness({ entities: drawing() })
    cad.command("ERASE")
    answer(cad, "500,500", "FOO", "FOO", "L")
    cad.enter()
    answer(cad, "600,600", "500,500", "500,500", "L", "R", "500,500", "FOO")
    cad.click(p(-10, -10))
    expect(cad.commandLog().slice(1)).toEqual([
      "Select objects: 500,500",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Select objects: Specify opposite corner: FOO",
      "Invalid window specification.",
      "Select objects: Specify opposite corner: L",
      "Invalid window specification.",
      "Select objects: Specify opposite corner:",
      "Invalid window specification.",
      "Select objects: Specify opposite corner: 600,600",
      "0 found",
      "Select objects: 500,500",
      "Specify opposite corner: 500,500",
      "0 found",
      "Select objects: L",
      "1 found",
      "Select objects: R",
      "Remove objects: 500,500",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Remove objects: Specify opposite corner: 3 found, 1 removed, 0 total",
    ])

    const path = createHarness({ entities: drawing() })
    path.command("ARRAYPATH")
    answer(path, "L")
    path.enter()
    answer(path, "500,500", "FOO", "600,600")
    expect(path.commandLog().slice(-4)).toEqual([
      "Select path curve: 500,500",
      "Specify opposite corner: FOO",
      "Invalid window specification.",
      "Select path curve: Specify opposite corner: 600,600",
    ])
    expect(path.state().commandLine.prompt).toBe("ARRAYPATH Select path curve:")
  })

  it("says it in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "500,500", "FOO", "600,600")
    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: 500,500",
      "Designe esquina opuesta: FOO",
      "Designación de ventana no válida.",
      "Designe objetos: Designe esquina opuesta: 600,600",
      "0 encontrados",
    ])
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: drawing() })
    cad.command("BORRA")
    answer(cad, "50,0", "30,30")
    expect(cad.commandLog().slice(1)).toEqual([
      "Designe objetos: 50,0",
      "1 encontrados",
      "Designe objetos: 30,30",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "BORRA Designe esquina opuesta:"
    )
    cad.escape()
  })
})

describe("@ at a mode's first point", () => {
  it("is LASTPOINT at a Window's first corner, which the corners leave (erase/p149)", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "_ID", "-10,-10", "_ERASE", "_W", "@", "@120,70")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Select objects: _W",
      "Specify first corner: @",
      "Specify opposite corner: @120,70",
      "2 found",
    ])
    cad.enter()
    expect(lastPoint(cad)).toBe(" X = -10.00     Y = -10.00     Z = 0.00")
  })

  it("is LASTPOINT at a WPolygon's first point (erase/p159)", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "_ID", "-10,-10", "_ERASE", "_WP", "@", "@120,0", "@0,30")
    answer(cad, "@-120,0", "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify endpoint of line or [Undo]:",
      "1 found",
    ])
    expect(cad.selectedIds()).toEqual(["A"])
  })

  it("is LASTPOINT at a Fence's first point (erase/p160)", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "_ID", "50,-10", "_ERASE", "_F", "@", "@0,70", "")
    expect(cad.commandLog().at(-1)).toBe("2 found")
    expect(cad.selectedIds().sort()).toEqual(["A", "B"])
  })
})

/** What ID @ reports: LASTPOINT, in the current UCS. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

/** The lines a drawing holds, as [start, end] pairs, in drawing order. */
function lineEnds(cad: CadHarness): [number, number][][] {
  return cad
    .entities()
    .flatMap((entity) =>
      entity.type === "line"
        ? [[entity.start, entity.end].map((point) => [point.x, point.y])]
        : []
    ) as [number, number][][]
}

// AutoCAD's console: a point typed at a single object's pick is a pick there,
// of the newest object under it — BREAK's in 2027's (probes pieces/p100,
// p122, p123, p144, p161, p179), UCS's and ARRAYPATH's in 2023's (acc/bk).
describe("a point typed at a single object's pick", () => {
  it("is BREAK's pick and first break point; on nothing No object found", () => {
    for (const [locale, command, select, second, none, invalid, expects] of [
      [
        undefined,
        "BREAK",
        "Select object:",
        "Specify second break point or [First point]:",
        "No object found",
        "*Invalid selection*",
        "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon",
      ],
      [
        es,
        "PARTE",
        "Designe objeto:",
        "Precise segundo punto de ruptura o [Primer punto]:",
        "No se ha encontrado ningún objeto",
        "*Designación no válida*",
        "Requiere un punto o Ventana/úLTimo/Captura/MArco/Todos/Borde/polígonOV/polígonOC",
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: drawing() })
      cad.command(command)
      answer(cad, "50,30", "FOO", "50,0.2", "70,0")
      expect(cad.commandLog().slice(1, 6)).toEqual([
        `${select} 50,30`,
        none,
        `${select} FOO`,
        invalid,
        expects,
      ])
      expect(cad.commandLog().slice(6)).toEqual([
        `${select} 50,0.2`,
        `${second} 70,0`,
      ])
      // The first point is the typed one, pulled onto the line (p123).
      expect(lineEnds(cad)).toEqual([
        [
          [0, 0],
          [50, 0],
        ],
        [
          [0, 50],
          [100, 50],
        ],
        [
          [70, 0],
          [100, 0],
        ],
      ])
      expect(lastPoint(cad)).toMatch(/70[.,]00 .* 0[.,]00 /)
    }
  })

  it("is BREAK's of the newer line under it, though nearer the older (p122, p123)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(0, 2), p(100, 2), { id: "E" }),
      ],
    })
    answer(cad, "BREAK", "80,0.3", "90,0.3")
    expect(lineEnds(cad)).toEqual([
      [
        [0, 0],
        [100, 0],
      ],
      [
        [0, 2],
        [80, 2],
      ],
      [
        [90, 2],
        [100, 2],
      ],
    ])
  })

  it("is BREAK's from LASTPOINT with @, on the newest object there (p179)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(20, 0), p(80, 0), { id: "D" }),
      ],
    })
    answer(cad, "ID", "50,0", "BREAK", "@", "@")
    expect(lineEnds(cad)).toEqual([
      [
        [0, 0],
        [100, 0],
      ],
      [
        [20, 0],
        [50, 0],
      ],
      [
        [50, 0],
        [80, 0],
      ],
    ])
    expect(cad.byId("D")).toMatchObject({ end: { x: 50, y: 0 } })
    expect(lastPoint(cad)).toMatch(/50[.,]00 .* 0[.,]00 /)
  })

  it("is BREAKATPOINT's pick, which then asks its break point", () => {
    const cad = createHarness({ entities: drawing() })
    answer(cad, "BREAKATPOINT", "50,30", "50,0")
    expect(cad.commandLog().slice(1)).toEqual([
      "Select object: 50,30",
      "No object found",
      "Select object: 50,0",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "BREAKATPOINT Specify break point:"
    )
    answer(cad, "30,0")
    expect(lineEnds(cad)[0]).toEqual([
      [0, 0],
      [30, 0],
    ])
    expect(lastPoint(cad)).toMatch(/30[.,]00 .* 0[.,]00 /)
  })

  it("is UCS OBject's pick, which LASTPOINT stays at; on nothing it ends", () => {
    for (const [locale, ucs, object, select, none] of [
      [
        undefined,
        "UCS",
        "OB",
        "Select object to align UCS:",
        "No object found",
      ],
      [
        es,
        "SCP",
        "B",
        "Designe el objeto a alinear con el SCP:",
        "No se ha encontrado ningún objeto",
      ],
    ] as const) {
      const slant = () => [lineOf(p(20, 10), p(80, 40), { id: "S" })]
      const near = answer(createHarness({ locale, entities: slant() }), ucs)
      answer(near, object, "60,30")
      const at = near.runtime.document.getSettings().ucs
      expect(at.origin).toMatchObject({ x: 80, y: 40 })
      expect(at.xAxis.x).toBeCloseTo(-0.894427, 6)
      expect(at.xAxis.y).toBeCloseTo(-0.447214, 6)
      // 60,30 read in the new UCS (bk12).
      expect(lastPoint(near)).toMatch(/22[.,]36 .* 0[.,]00 .* 0[.,]00/)

      const far = answer(createHarness({ locale, entities: slant() }), ucs)
      answer(far, object, "30,15")
      expect(far.runtime.document.getSettings().ucs.origin).toMatchObject({
        x: 20,
        y: 10,
      })

      const nothing = answer(createHarness({ locale, entities: slant() }), ucs)
      answer(nothing, object, "60,50")
      expect(nothing.commandLog().slice(-2)).toEqual([`${select} 60,50`, none])
      expect(nothing.activeToolId()).toBe("select")
      expect(nothing.runtime.document.getSettings().ucs.origin).toMatchObject({
        x: 0,
        y: 0,
      })
      expect(lastPoint(nothing)).toMatch(/60[.,]00 .* 50[.,]00 /)
    }
  })

  it("is UCS ZAxis Object's pick; on nothing it asks again", () => {
    const cad = createHarness({
      entities: [lineOf(p(20, 10), p(80, 40), { id: "S" })],
    })
    answer(cad, "UCS", "ZA", "O", "60,50", "30,15")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select object: 60,50",
      "No object found",
      "Select object: 30,15",
    ])
    const ucs = cad.runtime.document.getSettings().ucs
    expect(ucs.origin).toMatchObject({ x: 20, y: 10 })
    expect(ucs.xAxis.x).toBeCloseTo(0.447214, 6)
    expect(ucs.xAxis.y).toBeCloseTo(-0.894427, 6)
    // 30,15 read in the new UCS, down its Z (bk16).
    expect(lastPoint(cad)).toMatch(/0[.,]00 .* 0[.,]00 .* -11[.,]18/)
  })

  it("is a click too: on nothing OBject ends and ZAxis Object asks again", () => {
    const cad = createHarness({
      entities: [lineOf(p(20, 10), p(80, 40), { id: "S" })],
    })
    answer(cad, "UCS", "OB")
    cad.click(p(60, 50))
    expect(cad.commandLog().at(-1)).toBe("No object found")
    expect(cad.activeToolId()).toBe("select")

    answer(cad, "UCS", "ZA", "O")
    cad.click(p(60, 50))
    expect(cad.commandLog().at(-1)).toBe("No object found")
    expect(cad.state().commandLine.prompt).toBe("UCS Select object:")
    cad.escape()
  })

  it("is ARRAYPATH's path pick, which leaves LASTPOINT; on nothing a window starts", () => {
    for (const [locale, arrayed, filtered, select, opposite] of [
      [
        undefined,
        "Objects selected to be arrayed may not be selected as path curve.",
        "1 was filtered out",
        "Select path curve:",
        "Specify opposite corner:",
      ],
      [
        es,
        "Los objetos seleccionados para la matriz no se pueden seleccionar como curva de trayectoria.",
        "1 se ha filtrado",
        "Seleccione la curva de trayectoria:",
        "Designe esquina opuesta:",
      ],
    ] as const) {
      const cad = createHarness({ locale, entities: drawing() })
      answer(cad, "ID", "5,5")
      cad.select("C").command(locale ? "MATRIZCAMINO" : "ARRAYPATH")
      answer(cad, "260,250", "300,300", "310,310")
      expect(cad.commandLog().slice(-5)).toEqual([
        `${select} 260,250`,
        arrayed,
        filtered,
        `${select} 300,300`,
        `${opposite} 310,310`,
      ])
      expect(cad.state().commandLine.prompt).toMatch(new RegExp(` ${select}$`))
      answer(cad, "50,0")
      expect(cad.state().commandLine.prompt).not.toMatch(
        new RegExp(` ${select}$`)
      )
      cad.escape()
      expect(lastPoint(cad)).toMatch(/5[.,]00 .* 5[.,]00 /)
    }

    const clicked = createHarness({ entities: drawing() })
    clicked.select("C").command("ARRAYPATH")
    clicked.click(p(300, 300))
    expect(clicked.state().commandLine.prompt).toBe(
      "ARRAYPATH Specify opposite corner:"
    )
    clicked.click(p(-10, -10))
    expect(clicked.state().commandLine.prompt).toMatch(
      /^ARRAYPATH Select grip to edit array/
    )
    clicked.escape()
  })
})

// A press and drag on nothing at Select objects is AutoCAD 2027's lasso, as
// with no command: its line said as it starts and at each Space, its count on
// a line of its own after it, where a window's goes on the prompt's (desktop
// erase/d04, d05, d09).
describe("the lasso at Select objects", () => {
  const entities = () => [
    lineOf(p(0, 0), p(100, 0), { id: "INSIDE" }),
    lineOf(p(100, 80), p(400, 80), { id: "CROSSED" }),
    circleOf(p(600, 600), 10, { id: "FAR" }),
  ]
  /** Encloses INSIDE and crosses CROSSED, setting off rightwards. */
  const RIGHTWARDS = [p(-50, -50), p(200, -50), p(200, 120), p(-50, 120)]
  /** The same, setting off leftwards. */
  const LEFTWARDS = [p(200, -50), p(-50, -50), p(-50, 120), p(200, 120)]

  it("says its line, then counts what it took on the next (erase/d09)", () => {
    const cad = createHarness({ entities: entities() })
    cad.command("ERASE")

    cad.click(p(-50, -50)).click(p(150, 30))
    cad.lasso([...LEFTWARDS, p(210, -40)])
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "ERASE",
      "Select objects: Specify opposite corner: 1 found",
      "Crossing Lasso  Press Spacebar to cycle options",
      "2 found (1 duplicate), 2 total",
      "Select objects:",
    ])
    expect(cad.entities().map((e) => e.id)).toEqual(["FAR"])
  })

  it("takes what it encloses rightwards, and what a fence crosses after Space (erase/d04)", () => {
    const cad = createHarness({ entities: entities() })
    cad.command("ERASE")

    cad.lasso([...RIGHTWARDS, p(-60, -40)])
    cad.mouseDown(RIGHTWARDS[0]).moveTo(RIGHTWARDS[1])
    expect(cad.press(" ")).toBe(true)
    cad.moveTo(RIGHTWARDS[2]).moveTo(RIGHTWARDS[3]).mouseUp(p(-60, -40))

    expect(cad.commandLog()).toEqual([
      "ERASE",
      "Window Lasso  Press Spacebar to cycle options",
      "1 found",
      "Window Lasso  Press Spacebar to cycle options",
      "Fence Lasso  Press Spacebar to cycle options",
      "1 found, 2 total",
    ])
    expect(cad.selectedIds().sort()).toEqual(["CROSSED", "INSIDE"])
    expect(cad.state().commandLine.prompt).toBe("ERASE Select objects:")
  })

  it("removes what it takes with Shift held", () => {
    const cad = createHarness({ entities: entities() })
    cad.command("MOVE").click(p(50, 0)).click(p(300, 80))

    cad.lasso([...RIGHTWARDS, p(-60, -40)], { shiftKey: true })

    expect(cad.commandLog().slice(-2)).toEqual([
      "Window Lasso  Press Spacebar to cycle options",
      "1 found, 1 removed, 1 total",
    ])
    expect(cad.selectedIds()).toEqual(["CROSSED"])
  })

  it("says its line in Spanish AutoCAD's words (erase/d04-cl3, d09-cl7)", () => {
    const cad = createHarness({ locale: es, entities: entities() })
    cad.command("BORRA")

    cad.mouseDown(RIGHTWARDS[0]).moveTo(RIGHTWARDS[1]).press(" ")
    cad.press(" ")
    cad.moveTo(RIGHTWARDS[2]).moveTo(RIGHTWARDS[3]).mouseUp(p(-60, -40))

    expect(cad.commandLog()).toEqual([
      "BORRA",
      "Ventana Forma irregular: pulse la barra espaciadora para recorrer las opciones.",
      "Borde Forma irregular: pulse la barra espaciadora para recorrer las opciones.",
      "Captura Forma irregular: pulse la barra espaciadora para recorrer las opciones.",
      "2 encontrados",
    ])
  })
})
