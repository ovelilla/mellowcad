import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  Entity,
  LineEntity,
  PolylineEntity,
} from "../../domain/entities"
import type { Vec2 } from "../../geometry/Vec2"
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

/** A long line, and a short one standing over it at 30 (acc/p*, t*). */
const corner = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "L1" }),
  lineOf(p(30, 10), p(30, 60), { id: "L2" }),
]

/** An open polyline turning up at 100,0, and a line over its first segment. */
const bend = (x = 30): Entity[] => [
  polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P" }),
  lineOf(p(x, 20), p(x, 60), { id: "L" }),
]

/** The line has these two ends, in either order. */
const expectLine = (cad: CadHarness, id: string, a: Vec2, b: Vec2) => {
  const line = cad.byId<LineEntity>(id)
  const ends = [line.start, line.end].sort((u, v) => u.x - v.x || u.y - v.y)
  const want = [a, b].sort((u, v) => u.x - v.x || u.y - v.y)
  expect(ends).toBeCloseToPoints(want, 4)
}

const filletArc = (cad: CadHarness): ArcEntity =>
  cad.entities().find((e): e is ArcEntity => e.type === "arc" && e.radius < 20)!

// Every expectation below is AutoCAD 2023's console answering the same input
// (LIST, AUPREC 4): acc/m*, n*, p*–w*, x* in the research notes.
describe("FILLET's object prompts take the selection modes", () => {
  it("refuses an answer listing the modes and its words, as the console does", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("FILLET")
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])
    answer(cad, "ALL")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius"
    )
    cad.click(p(80, 0))
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
    ])
    cad.escape().command("FILLET")
    answer(cad, "P", "SI")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:"
    )
  })

  it("reads a window's or Last's line as picked at its middle: its longer side", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("FILLET")
    answer(cad, "W", "-10,-5", "130,5")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: W",
      "Specify first corner: -10,-5",
      "Specify opposite corner: 130,5",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    cad.click(p(30, 40))
    expectLine(cad, "L1", p(100, 0), p(30, 0))
    expectLine(cad, "L2", p(30, 0), p(30, 60))

    // Last, the line itself drawn last.
    const last = createHarness({
      entities: [corner()[1], lineOf(p(100, 0), p(0, 0), { id: "L1" })],
    })
    last.command("FILLET")
    answer(last, "L")
    last.click(p(30, 40))
    expectLine(last, "L1", p(100, 0), p(30, 0))
  })

  it("reads a fence as a pick where it crosses", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("FILLET")
    answer(cad, "F", "10,-5", "10,5", "")
    cad.click(p(30, 40))
    expectLine(cad, "L1", p(0, 0), p(30, 0))
  })

  it("asks again, saying nothing, where a mode finds nothing", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("FILLET")
    answer(cad, "W", "200,200", "300,300")
    expect(cad.commandLog().at(-1)).toBe("Specify opposite corner: 300,300")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
    )
    cad.click(p(80, 0))
    answer(cad, "W", "200,200", "300,300")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
  })

  it("fillets two found at the first prompt, the older first, and ends", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        { ...lineOf(p(30, 10), p(30, 60), { id: "L2" }), thickness: 5 },
      ],
    })
    cad.command("FILLET").option("Radius").type("5").enter()
    answer(cad, "W", "-10,-5", "130,65")
    expect(cad.activeToolId()).toBe("select")
    expectLine(cad, "L1", p(100, 0), p(35, 0))
    expectLine(cad, "L2", p(30, 60), p(30, 5))
    const arc = filletArc(cad)
    expect(arc.center).toBeCloseToPoint(p(35, 5), 4)
    expect(arc.startAngle).toBeCloseToAngle(deg(180), 4)
    expect(arc.endAngle).toBeCloseToAngle(deg(270), 4)
    // The first line's thickness: L1's, the older.
    expect(arc.thickness ?? 0).toBe(0)
  })

  it("takes the newest of several at the second prompt", () => {
    for (const [older, newer] of [
      [40, 50],
      [50, 40],
    ]) {
      const cad = createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "L1" }),
          lineOf(p(older, 10), p(older, 60), { id: "OLD" }),
          lineOf(p(newer, 10), p(newer, 60), { id: "NEW" }),
        ],
      })
      cad.command("FILLET").click(p(20, 0))
      answer(cad, "W", "30,5", "60,70")
      expectLine(cad, "L1", p(0, 0), p(newer, 0))
      expectLine(cad, "NEW", p(newer, 60), p(newer, 0))
      expectLine(cad, "OLD", p(older, 10), p(older, 60))
    }
  })

  it("takes a crossed polyline at its first segment crossed, kept from its first vertex", () => {
    for (const window of [
      ["5,-5", "15,5"],
      ["60,-5", "70,5"],
    ]) {
      const cad = createHarness({ entities: bend() })
      cad.command("FILLET")
      answer(cad, "C", ...window)
      cad.click(p(30, 40))
      expect(cad.runtime.document.has("L")).toBe(false)
      expect(cad.byId<PolylineEntity>("P").vertices).toBeCloseToPoints(
        [p(0, 0), p(30, 0), p(30, 60)],
        4
      )
    }

    // A later segment: the side the first vertex lies on, wherever the window.
    const later = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100), p(50, 100)], { id: "P" }),
        lineOf(p(90, 20), p(90, 60), { id: "L" }),
      ],
    })
    later.command("FILLET").click(p(90, 40))
    answer(later, "C", "55,95", "65,105")
    expect(later.byId<PolylineEntity>("P").vertices).toBeCloseToPoints(
      [p(90, 20), p(90, 100), p(50, 100)],
      4
    )

    // A fence picks the segment where it crosses, and that side.
    const fenced = createHarness({ entities: bend() })
    fenced.command("FILLET")
    answer(fenced, "F", "80,-5", "80,5", "")
    fenced.click(p(30, 40))
    expect(fenced.byId<PolylineEntity>("P").vertices).toBeCloseToPoints(
      [p(30, 60), p(30, 0), p(100, 0), p(100, 100)],
      4
    )
  })

  it("makes nothing of a polyline found whole, saying nothing", () => {
    const cad = createHarness({ entities: bend() })
    cad.command("FILLET")
    answer(cad, "W", "-10,-10", "110,110")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.byId<PolylineEntity>("P").vertices).toHaveLength(3)
    expectLine(cad, "L", p(30, 20), p(30, 60))

    const last = createHarness({ entities: [bend()[1], bend()[0]] })
    last.command("FILLET")
    answer(last, "L")
    expect(last.state().commandLine.prompt).toBe(
      "FILLET Select second object or shift-select to apply corner or [Radius]:"
    )
    last.click(p(30, 40))
    expect(last.activeToolId()).toBe("select")
    expect(last.byId<PolylineEntity>("P").vertices).toHaveLength(3)
    expect(last.commandLog().at(-1)).toBe(
      "Select second object or shift-select to apply corner or [Radius]:"
    )
  })

  it("reads a circle and an arc as picked at their middle", () => {
    const circle = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(50, 40), 20, { id: "C1" }),
      ],
    })
    circle.command("FILLET").option("Radius").type("15").enter()
    answer(circle, "W", "20,10", "80,70")
    circle.click(p(10, 0))
    expectLine(circle, "L1", p(0, 0), p(25.5051, 0))
    const arc = filletArc(circle)
    expect(arc.center).toBeCloseToPoint(p(25.5051, 15), 4)
    expect(arc.startAngle).toBeCloseToAngle(deg(270), 4)
    expect(arc.endAngle).toBeCloseToAngle(deg(45.5847), 4)

    // At radius 0 the arc keeps its part with its middle in it.
    for (const [pick, start, end, kept] of [
      [p(10, 10), 0, 150, [p(0, 10), p(32.6795, 10)]],
      [p(90, 10), 30, 180, [p(67.3205, 10), p(100, 10)]],
    ] as const) {
      const cad = createHarness({
        entities: [
          lineOf(p(0, 10), p(100, 10), { id: "L1" }),
          arcOf(p(50, 0), 20, 0, deg(180), { id: "A1" }),
        ],
      })
      cad.command("FILLET").click(pick)
      answer(cad, "W", "25,-1", "75,25")
      const a1 = cad.byId<ArcEntity>("A1")
      expect(a1.startAngle).toBeCloseToAngle(deg(start), 4)
      expect(a1.endAngle).toBeCloseToAngle(deg(end), 4)
      expectLine(cad, "L1", kept[0], kept[1])
    }
  })

  it("rounds the newest polyline Polyline's window finds", () => {
    const cad = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P1" }),
        polylineOf([p(200, 0), p(300, 0), p(300, 100)], { id: "P2" }),
      ],
    })
    cad.command("FILLET").option("Radius").type("10").enter()
    answer(cad, "P", "W", "-10,-10", "310,110")
    expect(cad.commandLog().at(-1)).toBe("1 line was filleted")
    expect(cad.byId<PolylineEntity>("P1").vertices).toHaveLength(3)
    expect(cad.byId<PolylineEntity>("P2").vertices).toBeCloseToPoints(
      [p(200, 0), p(290, 0), p(300, 10), p(300, 100)],
      4
    )
  })

  it("ends saying so where a mode finds the first object again, in Multiple too", () => {
    for (const multiple of [false, true]) {
      const cad = createHarness({ entities: corner() })
      cad.command("FILLET")
      if (multiple) answer(cad, "M")
      cad.click(p(30, 40))
      answer(cad, "L")
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet an entity with itself."
      )
      expect(cad.activeToolId()).toBe("select")
    }
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: corner() })
    cad.command("EMPALME")
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Designación no válida*",
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Deshacer/Polilínea/RAdio",
    ])
    cad.click(p(30, 40))
    answer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Radio]:"
    )
    answer(cad, "LT")
    expect(cad.commandLog().at(-1)).toBe(
      "No se puede empalmar un objeto consigo mismo."
    )
  })
})

describe("CHAMFER's object prompts take the selection modes", () => {
  it("refuses an answer listing the modes and its words", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("CHAMFER")
    answer(cad, "FOO")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Distance",
    ])
    cad.click(p(80, 0))
    answer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Distance"
    )
    cad.escape().command("CHAMFER")
    answer(cad, "P", "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Distance"
    )
  })

  it("takes the newest found at the first prompt too, and asks the second", () => {
    const window = createHarness({ entities: corner() })
    window.command("CHAMFER").option("Distance").type("10").enter()
    window.type("5").enter()
    answer(window, "W", "-10,-5", "130,5")
    window.click(p(30, 40))
    expectLine(window, "L1", p(100, 0), p(40, 0))
    expectLine(window, "L2", p(30, 60), p(30, 5))

    const both = createHarness({ entities: corner() })
    both.command("CHAMFER").option("Distance").type("10").enter()
    both.type("5").enter()
    answer(both, "W", "-10,-5", "130,65")
    expect(both.state().commandLine.prompt).toBe(
      "CHAMFER Select second line or shift-select to apply corner or [Distance]:"
    )
    both.click(p(80, 0))
    expectLine(both, "L2", p(30, 60), p(30, 10))
    expectLine(both, "L1", p(100, 0), p(35, 0))
  })

  it("reads a polyline as FILLET does, and says a circle is no line", () => {
    const crossed = createHarness({ entities: bend() })
    crossed.command("CHAMFER").option("Distance").type("10").enter()
    crossed.type("5").enter()
    answer(crossed, "C", "5,-5", "15,5")
    crossed.click(p(30, 40))
    expect(crossed.byId<PolylineEntity>("P").vertices).toBeCloseToPoints(
      [p(0, 0), p(20, 0), p(30, 5), p(30, 60)],
      4
    )

    const whole = createHarness({
      entities: [bend()[0], lineOf(p(30, -20), p(30, -60), { id: "L" })],
    })
    whole.command("CHAMFER")
    answer(whole, "W", "-10,-10", "110,110")
    whole.click(p(30, -40))
    expect(whole.activeToolId()).toBe("select")
    expect(whole.byId<PolylineEntity>("P").vertices).toHaveLength(3)

    const round = createHarness({
      entities: [...corner(), circleOf(p(200, 0), 10, { id: "C1" })],
    })
    round.command("CHAMFER")
    answer(round, "W", "180,-20", "220,20")
    expect(round.commandLog().at(-1)).toBe(
      "Chamfer requires 2 lines (not arc segments)."
    )
    expect(round.state().commandLine.prompt).toBe(
      "CHAMFER Select first line or [Undo/Polyline/Distance/Multiple]:"
    )
  })

  it("ends saying so where a mode finds the first line again", () => {
    const cad = createHarness({ entities: corner() })
    cad.command("CHAMFER").click(p(30, 40))
    answer(cad, "L")
    expect(cad.commandLog().at(-1)).toBe(
      "Cannot chamfer an entity with itself."
    )
    expect(cad.activeToolId()).toBe("select")
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: corner() })
    cad.command("CHAFLAN")
    answer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/desHacer/Polilínea/Distancia"
    )
    cad.click(p(30, 40))
    answer(cad, "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Distancia"
    )
    answer(cad, "LT")
    expect(cad.commandLog().at(-1)).toBe(
      "No se puede achaflanar un objeto consigo mismo."
    )
  })
})

/** Two lines crossing at 30,0 (acc/a1–a9). */
const cross = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "L1" }),
  lineOf(p(30, -20), p(30, 60), { id: "L2" }),
]

describe("a point typed at FILLET's and CHAMFER's object prompts picks there", () => {
  it("picks each object, keeping the side typed", () => {
    const cad = createHarness({ entities: cross() })
    cad.command("FILLET")
    answer(cad, "30,40", "80,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: 30,40",
      "Select second object or shift-select to apply corner or [Radius]: 80,0",
    ])
    expectLine(cad, "L2", p(30, 0), p(30, 60))
    expectLine(cad, "L1", p(30, 0), p(100, 0))
    expect(cad.activeToolId()).toBe("select")

    const other = createHarness({ entities: cross() })
    other.command("FILLET")
    answer(other, "30,-10", "10,0")
    expectLine(other, "L2", p(30, -20), p(30, 0))
    expectLine(other, "L1", p(0, 0), p(30, 0))
  })

  it("asks again, saying nothing, where a point lies on nothing", () => {
    const cad = createHarness({ entities: cross() })
    cad.command("FILLET")
    answer(cad, "M", "60,40", "30,40", "60,40", "80,0")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Select first object or [Undo/Polyline/Radius/Multiple]: 60,40",
      "Select first object or [Undo/Polyline/Radius/Multiple]: 30,40",
      "Select second object or shift-select to apply corner or [Radius]: 60,40",
      "Select second object or shift-select to apply corner or [Radius]: 80,0",
    ])
    expect(cad.activeToolId()).toBe("fillet")
    expectLine(cad, "L1", p(30, 0), p(100, 0))
  })

  it("reads @ from LASTPOINT, which the point typed becomes", () => {
    const cad = createHarness({ entities: cross() })
    cad.command("LINE")
    answer(cad, "0,60", "30,60", "")
    cad.command("FILLET")
    answer(cad, "@0,-20", "@50,-40")
    expectLine(cad, "L2", p(30, 0), p(30, 60))
    expectLine(cad, "L1", p(30, 0), p(100, 0))
  })

  it("picks Polyline's polyline, asking again on nothing", () => {
    const cad = createHarness({
      entities: [polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P" })],
    })
    cad.command("FILLET")
    answer(cad, "R", "10", "P", "50,50", "50,0")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select 2D polyline or [Radius]: 50,50",
      "Select 2D polyline or [Radius]: 50,0",
      "1 line was filleted",
    ])
    const poly = cad.byId<PolylineEntity>("P")
    expect(poly.vertices).toBeCloseToPoints(
      [p(0, 0), p(90, 0), p(100, 10), p(100, 100)],
      4
    )
    expect(poly.bulges?.[1]).toBeCloseTo(0.4142, 4)
  })

  it("picks CHAMFER's lines too", () => {
    const cad = createHarness({ entities: cross() })
    cad.command("CHAMFER")
    answer(cad, "D", "10", "5", "60,40", "30,40", "60,40", "80,0")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Select first line or [Undo/Polyline/Distance/Multiple]: 60,40",
      "Select first line or [Undo/Polyline/Distance/Multiple]: 30,40",
      "Select second line or shift-select to apply corner or [Distance]: 60,40",
      "Select second line or shift-select to apply corner or [Distance]: 80,0",
    ])
    expectLine(cad, "L2", p(30, 10), p(30, 60))
    expectLine(cad, "L1", p(35, 0), p(100, 0))
    const bevel = cad
      .entities()
      .find(
        (e): e is LineEntity =>
          e.type === "line" && !["L1", "L2"].includes(e.id)
      )!
    expectLine(cad, bevel.id, p(30, 10), p(35, 0))
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    cad.command("EMPALME")
    answer(cad, "30,40", "80,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Designe el primer objeto o [Deshacer/Polilínea/RAdio/múLtiple]: 30,40",
      "Designe el segundo objeto o use la tecla Mayús para aplicar esquina o [Radio]: 80,0",
    ])
    expectLine(cad, "L1", p(30, 0), p(100, 0))
    const chamfer = createHarness({ locale: es, entities: cross() })
    chamfer.command("CHAFLAN")
    answer(chamfer, "30,40", "80,0")
    expect(chamfer.commandLog().slice(-2)).toEqual([
      "Designe la primera línea o [desHacer/Polilínea/Distancia/múLtiple]: 30,40",
      "Designe la segunda línea o use la tecla Mayús para aplicar esquina o [Distancia]: 80,0",
    ])
    expectLine(chamfer, "L1", p(30, 0), p(100, 0))
  })
})
