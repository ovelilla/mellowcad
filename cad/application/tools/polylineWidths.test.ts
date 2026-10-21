import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p, polylineOf } from "../../../test/builders"
import {
  entityElevation,
  entityThickness,
  type PolylineEntity,
  type PolylineWidth,
} from "../../domain/entities"
import { DEFAULT_LAYER_COLOR } from "../../domain/layers"
import { es } from "../../locales/es"

// AutoCAD's console is the reference for every prompt, refusal and width
// below: what the same answers draw there, read back with MPDUMP — 2027's for
// PLINE (probes pline/p200–p225), 2023's for the other commands (acc/w6–w24).

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const round = (n: number) => Math.round(n * 10000) / 10000

/** Each polyline's widths, segment by segment; `[]` for one with none. */
function widths(cad: CadHarness): number[][][] {
  return cad
    .entities()
    .filter((e): e is PolylineEntity => e.type === "polyline")
    .map((poly) => (poly.widths ?? []).map(([s, e]) => [round(s), round(e)]))
}

function plineWid(cad: CadHarness): number {
  return cad.runtime.document.getSettings().polylineWidth
}

/** PLINEWID as AutoCAD 2023's console was set before each script. */
function harnessAt(width: number): CadHarness {
  const cad = createHarness()
  cad.runtime.document.updateSettings({ polylineWidth: width })
  return cad
}

const WIDE: PolylineWidth[] = [
  [0, 10],
  [2, 2],
]

/** 0,0 → 100,0 tapering from 0 to 10, then 2 wide up to 100,50 (acc/w9). */
function tapered(): PolylineEntity {
  return polylineOf([p(0, 0), p(100, 0), p(100, 50)], {
    id: "P",
    widths: WIDE,
  })
}

describe("PLINE Width and Halfwidth", () => {
  it("asks the starting and ending widths, the ending going on (p200, p201)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "", "5", "10,0", "20,0", "H", "1", "", "30,0")
    answer(cad, "W", "-1", "FOO", "3", "FOO", "-2", "4", "40,0", "")
    expect(cad.commandLog().slice(1)).toEqual([
      "Specify start point: 0,0",
      "Current line-width is 0.00",
      "Specify next point or [Arc/Halfwidth/Length/Undo/Width]: W",
      "Specify starting width <0.00>:",
      "Specify ending width <0.00>: 5",
      "Specify next point or [Arc/Halfwidth/Length/Undo/Width]: 10,0",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: 20,0",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: H",
      "Specify starting half-width <2.50>: 1",
      "Specify ending half-width <1.00>:",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: 30,0",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: W",
      "Specify starting width <2.00>: -1",
      "Value must be positive.",
      "Specify starting width <2.00>: FOO",
      "Requires numeric distance or second point.",
      "Specify starting width <2.00>: 3",
      "Specify ending width <3.00>: FOO",
      "Requires numeric distance or second point.",
      "Specify ending width <3.00>: -2",
      "Value must be positive.",
      "Specify ending width <3.00>: 4",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: 40,0",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:",
    ])
    expect(widths(cad)).toEqual([
      [
        [0, 5],
        [5, 5],
        [2, 2],
        [3, 4],
      ],
    ])
    expect(plineWid(cad)).toBe(4)
  })

  it("starts at PLINEWID and measures a width from the last vertex (p202)", () => {
    const cad = harnessAt(4)
    cad.command("PLINE")
    answer(cad, "0,50", "W", "2,50", "@0,7", "@10,0", "")
    expect(cad.commandLog().slice(2, 5)).toEqual([
      "Current line-width is 4.00",
      "Specify next point or [Arc/Halfwidth/Length/Undo/Width]: W",
      "Specify starting width <4.00>: 2,50",
    ])
    // `@0,7` from the last point given, 0,50: a width answer leaves it.
    expect(widths(cad)).toEqual([[[2, 7]]])
    expect(plineWid(cad)).toBe(7)
  })

  it("offers them in arc mode too, the arcs as wide (p203)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "1", "2", "10,0", "A", "W", "3", "", "H")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify starting half-width <1.50>:"
    )
    answer(cad, "2", "0", "30,10", "")
    expect(cad.commandLog()).toContain(
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]: W"
    )
    expect(widths(cad)).toEqual([
      [
        [1, 2],
        [4, 0],
      ],
    ])
  })

  it("closes at the current width, Close and arc CLose alike (p204, p205)", () => {
    const lines = createHarness()
    lines.command("PLINE")
    answer(lines, "0,50", "10,50", "W", "2", "", "20,60", "C")
    expect(widths(lines)).toEqual([
      [
        [0, 0],
        [2, 2],
        [2, 2],
      ],
    ])
    const arcs = createHarness()
    arcs.command("PLINE")
    answer(arcs, "0,150", "W", "1", "1", "10,150", "A", "20,160", "CL")
    expect(widths(arcs)).toEqual([
      [
        [1, 1],
        [1, 1],
        [1, 1],
      ],
    ])
  })

  it("sets PLINEWID even when no polyline is drawn (p206)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,100", "W", "3", "", "")
    expect(cad.entities()).toEqual([])
    expect(plineWid(cad)).toBe(3)
    cad.command("PLINE")
    answer(cad, "0,0")
    expect(cad.commandLog().at(-1)).toBe("Current line-width is 3.00")
  })

  it("keeps PLINEWID with the polyline's undo step", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "3", "", "10,0", "")
    expect(plineWid(cad)).toBe(3)
    cad.command("U")
    expect(cad.entities()).toEqual([])
    expect(plineWid(cad)).toBe(0)
  })
})

describe("PLINE Undo and the width", () => {
  // The width after Undo is PLINEWID as the command started when every
  // segment left has it, else 0 — whatever was set before.
  it("goes back to 0 after widths of their own (p208)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "2", "", "10,0", "W", "5", "", "20,0", "U")
    answer(cad, "30,0", "")
    expect(widths(cad)).toEqual([
      [
        [2, 2],
        [0, 0],
      ],
    ])
    expect(plineWid(cad)).toBe(0)
  })

  it("goes back to 0 back at the start, and offers it (p209)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,50", "W", "1", "", "10,50", "W", "4", "", "U", "20,50", "W")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify starting width <0.00>:"
    )
    answer(cad, "", "7", "30,50", "")
    expect(widths(cad)).toEqual([
      [
        [0, 0],
        [0, 7],
      ],
    ])
  })

  it("keeps PLINEWID's width while every segment has it (p210–p213)", () => {
    const plain = harnessAt(3)
    plain.command("PLINE")
    answer(plain, "0,0", "10,0", "20,0", "U", "30,0", "")
    expect(widths(plain)).toEqual([
      [
        [3, 3],
        [3, 3],
      ],
    ])
    // A width set but no segment drawn with it (p211).
    const unused = harnessAt(3)
    unused.command("PLINE")
    answer(unused, "0,50", "10,50", "20,50", "W", "5", "5", "U", "30,50", "")
    expect(widths(unused)).toEqual([
      [
        [3, 3],
        [3, 3],
      ],
    ])
    // The segment of another width undone (p212), or the only one (p213).
    const undone = harnessAt(3)
    undone.command("PLINE")
    answer(undone, "0,0", "10,0", "W", "5", "", "20,0", "U", "30,0", "")
    expect(widths(undone)).toEqual([
      [
        [3, 3],
        [3, 3],
      ],
    ])
    const only = harnessAt(3)
    only.command("PLINE")
    answer(only, "0,150", "W", "5", "", "10,150", "U", "20,150", "")
    expect(widths(only)).toEqual([[[3, 3]]])
  })

  it("goes back to 0 where a segment left has another width (p214–p216)", () => {
    const set = harnessAt(3)
    set.command("PLINE")
    answer(set, "0,50", "W", "2", "", "10,50", "20,50", "30,50", "U", "40,50")
    answer(set, "")
    expect(widths(set)).toEqual([
      [
        [2, 2],
        [2, 2],
        [0, 0],
      ],
    ])
    expect(plineWid(set)).toBe(0)
    const half = harnessAt(3)
    half.command("PLINE")
    answer(half, "0,150", "10,150", "H", "2", "", "20,150", "30,150", "U")
    answer(half, "40,150", "")
    expect(widths(half)).toEqual([
      [
        [3, 3],
        [4, 4],
        [0, 0],
      ],
    ])
    const back = harnessAt(3)
    back.command("PLINE")
    answer(back, "0,200", "W", "5", "", "10,200", "W", "3", "", "20,200", "U")
    answer(back, "30,200", "")
    expect(widths(back)).toEqual([
      [
        [5, 5],
        [0, 0],
      ],
    ])
  })

  it("keeps the width with nothing to undo (p217)", () => {
    const cad = harnessAt(7)
    cad.command("PLINE")
    answer(cad, "0,100", "W", "6", "", "U", "10,100", "")
    expect(cad.commandLog()).toContain("All segments already undone.")
    expect(widths(cad)).toEqual([[[6, 6]]])
  })
})

describe("PLINE widths with the rest of the object", () => {
  it("goes back to 0 at each Undo past a width of its own (p218)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "0", "4", "10,0", "W", "6", "8", "20,0", "U", "W")
    expect(cad.state().commandLine.prompt).toBe(
      "PLINE Specify starting width <0.00>:"
    )
    answer(cad, "", "", "30,0", "U", "U", "W", "", "", "40,0", "")
    expect(widths(cad)).toEqual([[]])
    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(40, 0),
    ])
    expect(plineWid(cad)).toBe(0)
  })

  it("refuses Halfwidth's answers as Width's, in Spanish too (p201)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "10,0", "H", "-1", "FOO", "1.5", "-3", "FOO", "0")
    expect(cad.commandLog().slice(-11)).toEqual([
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: H",
      "Specify starting half-width <0.00>: -1",
      "Value must be positive.",
      "Specify starting half-width <0.00>: FOO",
      "Requires numeric distance or second point.",
      "Specify starting half-width <0.00>: 1.5",
      "Specify ending half-width <1.50>: -3",
      "Value must be positive.",
      "Specify ending half-width <1.50>: FOO",
      "Requires numeric distance or second point.",
      "Specify ending half-width <1.50>: 0",
    ])
    answer(cad, "20,0", "")
    expect(widths(cad)).toEqual([
      [
        [0, 0],
        [3, 0],
      ],
    ])
    const spanish = createHarness({ locale: es })
    spanish.command("POL")
    answer(spanish, "0,0", "M", "-1", "FOO")
    expect(spanish.commandLog().slice(-4)).toEqual([
      "Precise mitad de grosor inicial <0.00>: -1",
      "El valor debe ser positivo.",
      "Precise mitad de grosor inicial <0.00>: FOO",
      "Requiere una distancia numérica o un segundo punto.",
    ])
  })

  it("keeps its widths with THICKNESS and ELEVATION (p219)", () => {
    const cad = createHarness()
    // ELEV sets both, as THICKNESS 3 and ELEVATION 5 do there.
    cad.command("ELEV")
    answer(cad, "5", "3")
    cad.command("PLINE")
    answer(cad, "0,0", "W", "2")
    answer(cad, "", "10,0", "A", "20,10", "")
    const poly = cad.only<PolylineEntity>("polyline")
    expect(widths(cad)).toEqual([
      [
        [2, 2],
        [2, 2],
      ],
    ])
    expect(poly.bulges?.[1]).toBeCloseTo(0.41421356, 8)
    expect([entityElevation(poly), entityThickness(poly)]).toEqual([5, 3])
  })

  it("keeps its widths in a UCS turned about X (p220)", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "X", "90")
    cad.command("PLINE")
    answer(cad, "0,0", "W", "1", "2", "10,0", "A")
    answer(cad, "20,10", "")
    const poly = cad.only<PolylineEntity>("polyline")
    expect(widths(cad)).toEqual([
      [
        [1, 2],
        [2, 2],
      ],
    ])
    expect(poly.normal?.y).toBeCloseTo(-1, 9)
    expect(poly.bulges?.[1]).toBeCloseTo(0.41421356, 8)
  })

  it("tapers a zero-length segment typed with @ (p225)", () => {
    const cad = createHarness()
    cad.command("PLINE")
    answer(cad, "0,0", "W", "1", "3", "@", "10,0", "")
    expect(widths(cad)).toEqual([
      [
        [1, 3],
        [3, 3],
      ],
    ])
  })
})

describe("RECTANG Width", () => {
  it("asks the line width, by a value or two points (acc/w6)", () => {
    const cad = createHarness()
    cad.command("RECTANG")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify first corner point or [Chamfer/Elevation/Fillet/Thickness/Width]:"
    )
    answer(cad, "W", "FOO", "-1")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify line width for rectangles <0.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify line width for rectangles <0.00>: -1",
    ])
    answer(cad, "0,50", "@20,10")
    // A negative width is kept as typed and drawn as none.
    expect(widths(cad)).toEqual([[]])
    cad.command("RECTANG")
    expect(cad.commandLog().at(-1)).toBe(
      "Current rectangle modes:  Width=-1.00"
    )
    answer(cad, "W", "3,100", "0,150", "C", "1", "1", "0,100", "@20,10")
    expect(cad.commandLog()).toContain(
      "Specify line width for rectangles <-1.00>: 3,100"
    )
    expect(cad.commandLog()).toContain(" Specify second point: 0,150")
    expect(widths(cad)[1]).toEqual(Array(8).fill([50.0899, 50.0899]))
  })

  it("draws every side and fillet that wide, kept for the session (acc/w6)", () => {
    const cad = createHarness()
    cad.command("RECTANG")
    answer(cad, "F", "2", "W", "1.5", "0,250", "@20,10")
    const rectangle = cad.only<PolylineEntity>("polyline")
    expect(rectangle.bulges?.filter((b) => b !== 0)).toHaveLength(4)
    expect(widths(cad)).toEqual([Array(8).fill([1.5, 1.5])])
    cad.command("RECTANG")
    answer(cad, "W")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify line width for rectangles <1.50>:"
    )
  })

  it("lists Width after Thickness and before Rotation (acc/w7)", () => {
    const cad = createHarness()
    cad.command("RECTANG")
    answer(cad, "E", "1", "T", "2", "F", "1", "W", "2", "0,50", "R", "30")
    answer(cad, "@20,10")
    cad.command("RECTANG")
    expect(cad.commandLog().at(-1)).toBe(
      "Current rectangle modes:  Elevation=1.00  Fillet=1.00  Thickness=2.00  Width=2.00  Rotation=30"
    )
  })

  it("does not take PLINEWID (acc/w7)", () => {
    const cad = harnessAt(3)
    cad.command("RECTANG")
    answer(cad, "0,0", "@20,10")
    expect(widths(cad)).toEqual([[]])
  })
})

describe("in Spanish", () => {
  it("asks POL's and RECTANG's widths in Autodesk's words", () => {
    const cad = createHarness({ locale: es })
    cad.command("POL")
    answer(cad, "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise punto siguiente o [Arco/Mitad grosor/Longitud/desHacer/Grosor]:"
    )
    answer(cad, "G")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise grosor inicial <0.00>:"
    )
    answer(cad, "1")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise grosor final <1.00>:"
    )
    answer(cad, "", "M")
    expect(cad.state().commandLine.prompt).toBe(
      "POL Precise mitad de grosor inicial <0.50>:"
    )
    answer(cad, "", "", "10,0", "")
    cad.command("RECTANG")
    answer(cad, "G")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Precise grosor de línea para rectángulos <0.00>:"
    )
    answer(cad, "2", "0,50", "@10,10")
    cad.command("RECTANG")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de rectángulo actuales:  Grosor=2.00"
    )
    cad.command("RELLENAR")
    expect(cad.state().commandLine.prompt).toBe(
      "RELLENAR Indique modo [ACT/DES] <ACT>:"
    )
  })
})

describe("FILL", () => {
  it("sets FILLMODE, offering it, and U takes it back (acc/w22, w24)", () => {
    const cad = createHarness()
    cad.command("FILL")
    expect(cad.state().commandLine.prompt).toBe(
      "FILL Enter mode [ON/OFF] <ON>:"
    )
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Enter mode [ON/OFF] <ON>: FOO",
      "Invalid option keyword.",
    ])
    answer(cad, "0")
    expect(cad.runtime.document.getSettings().fillMode).toBe(false)
    cad.command("FILL")
    expect(cad.state().commandLine.prompt).toBe(
      "FILL Enter mode [ON/OFF] <OFF>:"
    )
    answer(cad, "1")
    expect(cad.runtime.document.getSettings().fillMode).toBe(true)
    cad.command("FILL")
    answer(cad, "O")
    expect(cad.commandLog().at(-1)).toBe(
      "Ambiguous response, please clarify..."
    )
    answer(cad, "OF")
    expect(cad.runtime.document.getSettings().fillMode).toBe(false)
    cad.command("U")
    expect(cad.runtime.document.getSettings().fillMode).toBe(true)
  })

  it("is transparent (acc/w22)", () => {
    const cad = createHarness()
    cad.command("LINE")
    answer(cad, "0,0", "'FILL", "OFF")
    expect(cad.commandLog().slice(-2)).toEqual([
      ">>Enter mode [ON/OFF] <ON>: OFF",
      "Resuming LINE command.",
    ])
  })

  it("fills a wide polyline, or outlines it when off", () => {
    const cad = createHarness({ entities: [tapered()] })
    // Its two bands, in the layer's colour.
    const filled = () =>
      cad
        .scene()
        .primitives.flatMap((primitive) =>
          primitive.kind === "path" &&
          primitive.stroke?.color === DEFAULT_LAYER_COLOR
            ? [primitive.fill !== undefined]
            : []
        )
    expect(filled()).toEqual([true, true])
    cad.command("FILL")
    answer(cad, "OFF")
    expect(filled()).toEqual([false, false])
  })
})

describe("what the editing commands do with the widths", () => {
  it("SCALE scales them, MIRROR keeps them (acc/w8)", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.command("SCALE")
    answer(cad, "ALL", "", "0,0", "2")
    expect(widths(cad)).toEqual([
      [
        [0, 20],
        [4, 4],
      ],
    ])
    cad.press("Escape")
    cad.command("MIRROR")
    answer(cad, "ALL", "", "0,0", "0,10", "N")
    expect(widths(cad)).toEqual([
      [
        [0, 20],
        [4, 4],
      ],
      [
        [0, 20],
        [4, 4],
      ],
    ])
  })

  it("EXPLODE loses them and says so for each wide polyline (acc/w8, w23)", () => {
    const cad = createHarness({
      entities: [
        tapered(),
        polylineOf([p(0, 200), p(10, 200)], { widths: [[1, 1]] }),
        polylineOf([p(0, 300), p(10, 300)]),
      ],
    })
    cad.command("EXPLODE")
    answer(cad, "ALL", "")
    const lost =
      "Exploding this polyline has lost width information.\nThe UNDO command will restore it."
    expect(cad.commandLog().slice(-3)).toEqual(["Select objects:", lost, lost])
    expect(cad.entities().every((e) => e.type === "line")).toBe(true)
  })

  it("OFFSET keeps them on the copy (acc/w9)", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.command("OFFSET").type("5").enter().click(p(25, 0)).click(p(25, -20))
    expect(widths(cad)).toEqual([WIDE, WIDE])
  })

  it("BREAK cuts a segment's width where it cuts it (acc/w9)", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.command("BREAK").click(p(25, 0)).click(p(75, 0))
    expect(widths(cad)).toEqual([
      [[0, 2.5]],
      [
        [7.5, 10],
        [2, 2],
      ],
    ])
  })

  it("TRIM cuts it there too (acc/w17)", () => {
    const cad = createHarness({
      entities: [tapered(), lineOf(p(50, -30), p(50, 30))],
    })
    cad.command("TRIM").click(p(75, 0))
    expect(widths(cad)).toEqual([[[0, 5]], [[2, 2]]])
  })

  it("EXTEND keeps the widths of the segment it grows (acc/w18)", () => {
    const cad = createHarness({
      entities: [tapered(), lineOf(p(-30, -30), p(-30, 90))],
    })
    cad.command("EXTEND").click(p(25, 0))
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices[0]).toBeCloseToPoint(p(-30, 0))
    expect(widths(cad)).toEqual([WIDE])
  })

  it("FILLET and CHAMFER join the cut segments' widths (acc/w19, w20)", () => {
    const fillet = createHarness({ entities: [tapered()] })
    fillet.command("FILLET")
    answer(fillet, "R", "10")
    fillet.click(p(50, 0)).click(p(100, 25))
    const expected = [
      [
        [0, 10],
        [10, 2],
        [2, 2],
      ],
    ]
    expect(widths(fillet)).toEqual(expected)
    const chamfer = createHarness({ entities: [tapered()] })
    chamfer.command("CHAMFER")
    answer(chamfer, "D", "10", "10")
    chamfer.click(p(50, 0)).click(p(100, 25))
    expect(widths(chamfer)).toEqual(expected)
  })

  it("FILLET of a line and a wide segment: the line has none (acc/w21)", () => {
    const cad = createHarness({
      entities: [tapered(), lineOf(p(50, 80), p(90, 80))],
    })
    cad.command("FILLET")
    answer(cad, "R", "10")
    cad.click(p(70, 80)).click(p(100, 25))
    expect(widths(cad)).toEqual([
      [
        [0, 10],
        [2, 2],
        [2, 0],
        [0, 0],
      ],
    ])
  })

  it("FILLET Polyline rounds every corner the same way (acc/w23)", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 50), p(0, 50)], {
          closed: true,
          widths: [
            [0, 10],
            [2, 4],
            [6, 6],
            [6, 6],
          ],
        }),
      ],
    })
    cad.command("FILLET")
    answer(cad, "R", "5", "P")
    cad.click(p(50, 0))
    expect(widths(cad)).toEqual([
      [
        [0, 10],
        [10, 2],
        [2, 4],
        [4, 6],
        [6, 6],
        [6, 6],
        [6, 6],
        [6, 0],
      ],
    ])
  })

  it("JOIN gives a line the widths of the polyline it joins (acc/w11, w22)", () => {
    const cad = createHarness({
      entities: [
        tapered(),
        lineOf(p(100, 50), p(150, 50)),
        lineOf(p(-50, 0), p(0, 0)),
      ],
    })
    cad.command("JOIN")
    answer(cad, "ALL", "")
    expect(widths(cad)).toEqual([
      [
        [0, 10],
        [0, 10],
        [2, 2],
        [2, 2],
      ],
    ])
    const end = createHarness({
      entities: [
        polylineOf([p(0, 200), p(100, 200)], { widths: [[0, 10]] }),
        lineOf(p(100, 200), p(150, 200)),
      ],
    })
    end.command("JOIN")
    answer(end, "ALL", "")
    expect(widths(end)).toEqual([
      [
        [0, 10],
        [10, 10],
      ],
    ])
    const two = createHarness({
      entities: [
        polylineOf([p(0, 300), p(50, 300)], { widths: [[3, 3]] }),
        polylineOf([p(50, 300), p(100, 300)], { widths: [[1, 1]] }),
      ],
    })
    two.command("JOIN")
    answer(two, "ALL", "")
    expect(widths(two)).toEqual([
      [
        [3, 3],
        [1, 1],
      ],
    ])
  })

  it("picks a wide polyline anywhere on its band", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.click(p(80, 3.5))
    expect(cad.state().selectionCount).toBe(1)
  })
})

describe("the width prompts' rubber band", () => {
  it.each(["Width", "Halfwidth"])(
    "draws a dashed line from the last vertex to the cursor at %s's prompts",
    (option) => {
      // probe pline/p200 (traced): getdist with the last vertex as its base;
      // desktop pline/d06: the dashed line from the last vertex.
      const cad = createHarness()
      cad.command("PLINE").click(p(0, 0)).click(p(50, 0)).option(option)
      cad.moveTo(p(80, 40))
      const from = cad.toScreen(p(50, 0))
      const to = cad.toScreen(p(80, 40))
      const dashed = cad
        .scene()
        .primitives.filter(
          (q) => q.kind === "segment" && q.stroke.dash && q.stroke.dash.length
        )
      expect(dashed).toContainEqual(
        expect.objectContaining({
          a: expect.objectContaining({ x: from.x, y: from.y }),
          b: expect.objectContaining({ x: to.x, y: to.y }),
        })
      )
      cad.enter()
      cad.moveTo(p(90, 40))
      expect(
        cad
          .scene()
          .primitives.filter(
            (q) => q.kind === "segment" && q.stroke.dash && q.stroke.dash.length
          )
      ).toHaveLength(1)
    }
  )
})

describe("the Properties palette", () => {
  const rows = (cad: CadHarness) =>
    Object.fromEntries(
      (cad.state().properties.info?.groups ?? [])
        .flatMap((group) => group.rows)
        .map((row) => [row.id, row.value])
    )

  it("shows the current vertex, its segment's widths and the Global width", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.select("P")
    expect(rows(cad)).toMatchObject({
      vertex: "1",
      vertexX: "0.00",
      vertexY: "0.00",
      startSegmentWidth: "0.00 mm",
      endSegmentWidth: "10.00 mm",
      globalWidth: "",
    })
    expect(cad.runtime.setSelectionProperty("vertex", "2")).toBe(true)
    expect(rows(cad)).toMatchObject({
      vertex: "2",
      vertexX: "100.00",
      startSegmentWidth: "2.00 mm",
      endSegmentWidth: "2.00 mm",
    })
    // The last vertex of an open polyline starts no segment.
    expect(cad.runtime.setSelectionProperty("vertex", "3")).toBe(true)
    expect(rows(cad).startSegmentWidth).toBeUndefined()
    expect(cad.runtime.setSelectionProperty("vertex", "4")).toBe(false)
  })

  it("lists AutoCAD's rows: Geometry, then Misc with Closed (desktop pline/d08)", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.select("P")
    const groups = cad.state().properties.info!.groups
    expect(
      groups.map((group) => [group.id, group.rows.map((row) => row.label)])
    ).toEqual([
      [
        "geometry",
        [
          "Current Vertex",
          "Vertex X",
          "Vertex Y",
          "Start segment width",
          "End segment width",
          "Global width",
          "Elevation",
          "Area",
          "Length",
        ],
      ],
      ["misc", ["Closed"]],
    ])
    // Area and Length read-only, greyed there; Closed a Yes / No choice.
    const closed = groups[1].rows[0]
    expect(closed.value).toBe("No")
    expect(closed.edit?.choices?.map((choice) => choice.label)).toEqual([
      "Yes",
      "No",
    ])
  })

  it("closes and opens a polyline from Closed, one undo step each", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.select("P")
    expect(cad.runtime.setSelectionProperty("closed", "1")).toBe(true)
    const closed = cad.only<PolylineEntity>("polyline")
    expect(closed.closed).toBe(true)
    expect(closed.vertices).toHaveLength(3)
    expect(rows(cad).closed).toBe("Yes")
    expect(cad.runtime.setSelectionProperty("closed", "0")).toBe(true)
    expect(cad.only<PolylineEntity>("polyline")).toEqual(tapered())
    cad.undo()
    expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)
  })

  it("measures a closed polyline of two vertices there and back (p04)", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(10, 0)], { id: "P", closed: true })],
    })
    cad.select("P")
    expect(rows(cad).length).toBe("20.00 mm")
  })

  it("retypes a segment's widths, the Global width and a vertex, one undo step each", () => {
    const cad = createHarness({ entities: [tapered()] })
    cad.select("P")
    cad.runtime.setSelectionProperty("vertex", "2")
    expect(cad.runtime.setSelectionProperty("startSegmentWidth", "3")).toBe(
      true
    )
    expect(cad.runtime.setSelectionProperty("endSegmentWidth", "-1")).toBe(
      false
    )
    expect(widths(cad)).toEqual([
      [
        [0, 10],
        [3, 2],
      ],
    ])
    expect(cad.runtime.setSelectionProperty("vertexY", "5")).toBe(true)
    expect(cad.only<PolylineEntity>("polyline").vertices[1]).toBeCloseToPoint(
      p(100, 5)
    )
    expect(cad.runtime.setSelectionProperty("globalWidth", "1")).toBe(true)
    expect(rows(cad).globalWidth).toBe("1.00 mm")
    expect(widths(cad)).toEqual([
      [
        [1, 1],
        [1, 1],
      ],
    ])
    cad.undo()
    expect(widths(cad)).toEqual([
      [
        [0, 10],
        [3, 2],
      ],
    ])
    cad.select("P")
    expect(cad.runtime.setSelectionProperty("globalWidth", "0")).toBe(true)
    expect(widths(cad)).toEqual([[]])
  })
})
