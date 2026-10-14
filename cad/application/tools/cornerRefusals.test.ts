import { describe, expect, it } from "vitest"
import type { Entity } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import {
  arcOf,
  circleOf,
  deg,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function run(entities: Entity[], command: string, ...texts: string[]) {
  const cad = createHarness({ entities })
  cad.command(command)
  return answer(cad, ...texts)
}

/** Two lines crossing at 30,0. */
const cross = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "L1" }),
  lineOf(p(30, -20), p(30, 60), { id: "L2" }),
]

/** Five segments: 0 along the bottom, 3 up the left, 4 along the top. */
const zigzag = (): Entity[] => [
  polylineOf(
    [p(0, 0), p(100, 0), p(100, 50), p(0, 50), p(0, 100), p(100, 100)],
    { id: "P" }
  ),
]

const APART =
  "Lines belonging to polylines must be consecutive or separated by one segment"

// Every expectation below is AutoCAD 2023's console answering the same input:
// acc/i*, j6, k1–k5, l1, l2 in the research notes.
describe("FILLET and CHAMFER refuse a second pick that makes no corner", () => {
  it("ends saying so where the first object is picked again, in Multiple too", () => {
    for (const multiple of [[], ["M"]]) {
      const cad = run(cross(), "FILLET", ...multiple, "30,40", "30,50")
      expect(cad.commandLog().slice(-2)).toEqual([
        "Select second object or shift-select to apply corner or [Radius]: 30,50",
        "Cannot fillet an entity with itself.",
      ])
      expect(cad.activeToolId()).toBe("select")

      const chamfer = run(cross(), "CHAMFER", ...multiple, "30,40", "30,50")
      expect(chamfer.commandLog().at(-1)).toBe(
        "Cannot chamfer an entity with itself."
      )
      expect(chamfer.activeToolId()).toBe("select")
    }
  })

  it("takes a polyline's segment picked again, an arc and a circle, as the same object", () => {
    const segment = run(zigzag(), "FILLET", "50,0", "60,0")
    expect(segment.commandLog().at(-1)).toBe(
      "Cannot fillet an entity with itself."
    )
    expect(segment.activeToolId()).toBe("select")
    const chamfer = run(zigzag(), "CHAMFER", "50,0", "60,0")
    expect(chamfer.commandLog().at(-1)).toBe(
      "Cannot chamfer an entity with itself."
    )

    const round = (entity: Entity, a: string, b: string) => {
      const cad = run([entity, lineOf(p(0, 0), p(100, 0))], "FILLET", "M", a, b)
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet an entity with itself."
      )
      expect(cad.activeToolId()).toBe("select")
    }
    round(circleOf(p(50, 50), 20), "70,50", "50,70")
    round(arcOf(p(50, 50), 20, deg(0), deg(180)), "70,50", "30,50")
  })

  it("refuses segments of one polyline two or more apart: *Invalid*, or in Multiple the first prompt", () => {
    for (const [a, b] of [
      ["50,0", "0,75"],
      ["100,25", "50,100"],
    ]) {
      const cad = run(zigzag(), "FILLET", a, b)
      expect(cad.commandLog().slice(-2)).toEqual([APART, "*Invalid*"])
      expect(cad.activeToolId()).toBe("select")
    }
    const multiple = run(zigzag(), "FILLET", "M", "50,0", "0,75", "FOO")
    expect(multiple.commandLog().slice(-4)).toEqual([
      APART,
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])

    const chamfer = run(zigzag(), "CHAMFER", "50,0", "0,75")
    expect(chamfer.commandLog().slice(-2)).toEqual([APART, "*Invalid*"])
    const again = run(zigzag(), "CHAMFER", "M", "50,0", "0,75")
    expect(again.commandLog().at(-1)).toBe(APART)
    expect(again.activeToolId()).toBe("chamfer")
  })

  it("still makes the corner of an open polyline's first and last segments", () => {
    const cad = run(
      [polylineOf([p(0, 0), p(100, 0), p(100, 50), p(0, 50), p(0, 100)])],
      "FILLET",
      "50,0",
      "0,80"
    )
    expect(cad.commandLog().slice(-2)).toEqual(["Lines diverge", "*Invalid*"])
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: zigzag() })
    cad.command("EMPALME")
    answer(cad, "50,0", "0,75")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Las líneas pertenecientes a polilíneas tienen que ser consecutivas o estar separadas por un segmento",
      "*No válido*",
    ])
    const itself = createHarness({ locale: es, entities: cross() })
    itself.command("CHAFLAN")
    answer(itself, "30,40", "30,50")
    expect(itself.commandLog().at(-1)).toBe(
      "No se puede achaflanar un objeto consigo mismo."
    )
  })
})

describe("FILLET's and CHAMFER's Polyline say what is no 2D polyline", () => {
  it("asks again saying so, for a pick and for what a mode finds", () => {
    const cad = run(cross(), "FILLET", "P", "30,40", "FOO")
    expect(cad.commandLog().slice(-5, -1)).toEqual([
      "Select 2D polyline or [Radius]: 30,40",
      "Object selected is not a 2D polyline",
      "Select 2D polyline or [Radius]: FOO",
      "*Invalid selection*",
    ])
    expect(cad.activeToolId()).toBe("fillet")

    const circle = run([circleOf(p(50, 50), 20)], "FILLET", "P", "70,50")
    expect(circle.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )

    // The newest found, a line, though the window holds a polyline too.
    const window = run(
      [...zigzag(), lineOf(p(20, 20), p(80, 20), { id: "L" })],
      "FILLET",
      "P",
      "W",
      "-10,-10",
      "110,110"
    )
    expect(window.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )
    expect(window.activeToolId()).toBe("fillet")
    const last = run(
      [...zigzag(), lineOf(p(20, 20), p(80, 20), { id: "L" })],
      "CHAMFER",
      "P",
      "L"
    )
    expect(last.commandLog().at(-1)).toBe(
      "Object selected is not a 2D polyline"
    )
  })

  it("goes back to the first prompt on Enter in Multiple, else ends", () => {
    const cad = run(cross(), "FILLET", "M", "P", "", "FOO")
    expect(cad.commandLog().slice(-4, -1)).toEqual([
      "Select 2D polyline or [Radius]:",
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
      "*Invalid selection*",
    ])
    const chamfer = run(cross(), "CHAMFER", "M", "P", "")
    expect(chamfer.activeToolId()).toBe("chamfer")
    expect(run(cross(), "FILLET", "P", "").activeToolId()).toBe("select")
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    cad.command("CHAFLAN")
    answer(cad, "P", "30,40")
    expect(cad.commandLog().at(-1)).toBe(
      "El objeto designado no es una polilínea 2D."
    )
  })
})

// AutoCAD 2023's console, acc/u1–u3 of 2026-10-14.
describe("FILLET's and CHAMFER's second prompt on Enter", () => {
  it("is asked again without a word, in Multiple or not", () => {
    for (const multiple of [[], ["M"]]) {
      const cad = run(cross(), "FILLET", ...multiple, "30,40", "", "FOO")
      expect(cad.commandLog().slice(-4)).toEqual([
        "Select second object or shift-select to apply corner or [Radius]:",
        "Select second object or shift-select to apply corner or [Radius]: FOO",
        "*Invalid selection*",
        "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
      ])
      expect(cad.activeToolId()).toBe("fillet")

      const chamfer = run(cross(), "CHAMFER", ...multiple, "30,40", "", "80,0")
      expect(chamfer.commandLog().slice(-2)).toEqual([
        "Select second line or shift-select to apply corner or [Distance]:",
        "Select second line or shift-select to apply corner or [Distance]: 80,0",
      ])
    }
  })

  it("is asked again in Spanish too", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    cad.command("EMPALME")
    answer(cad, "30,40", "")
    expect(cad.commandLog().at(-1)).toBe(
      "Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]:"
    )
    expect(cad.activeToolId()).toBe("fillet")
  })
})
