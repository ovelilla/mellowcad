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
  layerOf,
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

/**
 * A long line, and a short one standing over it at 30: the modes read it as
 * 2027's console reads the crossing pair of probes corners/p282–p288.
 */
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

// Every expectation below is AutoCAD 2027's console answering the same input
// (probes corners/p113, p282–p289, p296–p298, p302–p305, p308), or
// 2023's where 2027 was not asked (LIST, AUPREC 4: acc/m*, n*, p*–w*, x*): a
// mode finding nothing, a crossed polyline, CHAMFER's two found at the first
// prompt, Polyline's window over two.
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
    // The second object's thickness (corners/p332): L2's, the newer.
    expect(arc.thickness).toBe(5)
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

/** Two lines crossing at 30,0, the probes' (corners/p240–p309). */
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

/** Each answer confirmed at the command line, an empty one as Enter. */
const t = (cad: CadHarness, ...texts: string[]): CadHarness => {
  for (const text of texts) {
    if (text === "") cad.enter()
    else answer(cad, text)
  }
  return cad
}
const crossed = () => createHarness({ entities: cross() })
const POLY = (layerId = "0") =>
  polylineOf([p(0, 0), p(100, 0), p(100, 100)], { id: "P", layerId })
/** The drawing loaded with layer K beside 0, as `-LAYER` made it. */
const withLayers = (
  entities: Entity[],
  layer: Parameters<typeof layerOf>[1],
  locale?: typeof es
) => {
  const cad = createHarness({ locale })
  cad.runtime.document.load(entities, {
    layers: [layerOf("0"), layerOf("K", layer)],
  })
  return cad
}
const onK = (): Entity[] => [cross()[0], { ...cross()[1], layerId: "K" }]

/** LASTPOINT, as `ID @` echoes it. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}
const lp = (x: string, y: string, z = "0.00") =>
  ` X = ${x}     Y = ${y}     Z = ${z}`

const round = (v: number) => {
  const r = Math.round(v * 1000) / 1000
  return Object.is(r, -0) ? "0" : String(r)
}
/** The drawing as the console's dump reads it, sorted. */
function shapes(cad: CadHarness): string[] {
  return cad
    .entities()
    .map((e) => {
      switch (e.type) {
        case "line":
          return `LINE ${e.layerId} ${round(e.start.x)},${round(e.start.y)} ${round(e.end.x)},${round(e.end.y)}`
        case "polyline":
          return `LWPOLYLINE ${e.layerId} ${e.vertices
            .map(
              (v, i) =>
                `${round(v.x)},${round(v.y)}@${round(e.bulges?.[i] ?? 0)}`
            )
            .join(" ")}`
        default:
          return `${e.type.toUpperCase()} ${e.layerId}`
      }
    })
    .sort()
}

const FILLET1 = "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
const FILLET2 =
  "FILLET Select second object or shift-select to apply corner or [Radius]:"
const CORNERED = ["LINE 0 30,0 100,0", "LINE 0 30,0 30,60"]

// AutoCAD 2027's console, en-US and es-ES (probes corners/p257–p269, p309):
// a typed object snap override picks where it finds its point, which becomes
// LASTPOINT; one finding nothing is refused as at a point prompt.
describe("an object snap override typed at FILLET's and CHAMFER's object prompts", () => {
  it("picks the second object at the point found (p257, p259, p261)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "30,40", "_END", "99,1")
    expect(cad.commandLog()).not.toContain("*Invalid selection*")
    expect(shapes(cad)).toEqual(CORNERED)
    expect(lastPoint(cad)).toBe(lp("100.00", "0.00"))
    const mid = t(crossed(), "ID", "5,5", "FILLET", "30,40", "_MID", "51,1")
    expect(lastPoint(mid)).toBe(lp("50.00", "0.00"))
    const near = t(crossed(), "ID", "5,5", "FILLET", "30,40", "_NEA", "80,1")
    expect(lastPoint(near)).toBe(lp("80.00", "0.00"))
  })

  it("picks the first object, and `@` is from the point found (p258)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "_END", "29,59", "@50,-60")
    expect(shapes(cad)).toEqual(CORNERED)
    expect(lastPoint(cad)).toBe(lp("80.00", "0.00"))
  })

  it("takes the newer at a crossing: the first again at the second prompt (p260, p309)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "30,40", "_INT", "31,1")
    expect(cad.commandLog().at(-1)).toBe("Cannot fillet an entity with itself.")
    expect(lastPoint(cad)).toBe(lp("30.00", "0.00"))
    const first = t(crossed(), "ID", "5,5", "FILLET", "_INT", "31,1", "80,0")
    expect(shapes(first)).toEqual(CORNERED)
    expect(lastPoint(first)).toBe(lp("80.00", "0.00"))
  })

  it("keeps the side of a Perpendicular from LASTPOINT (p262)", () => {
    const cad = t(crossed(), "ID", "80,10", "FILLET", "_PER", "1,1", "30,40")
    expect(shapes(cad)).toEqual(CORNERED)
  })

  it("asks again, saying nothing, where the point found is on nothing (p263)", () => {
    const cad = createHarness({
      entities: [cross()[0], circleOf(p(50, 40), 20, { id: "C" })],
    })
    t(cad, "FILLET", "_R", "5", "_CEN", "50,61")
    expect(cad.commandLog().at(-1)).toBe(
      "Select first object or [Undo/Polyline/Radius/Multiple]: _CEN of 50,61"
    )
    expect(cad.state().commandLine.prompt).toBe(FILLET1)
  })

  it("refuses where it finds nothing: its words, then the prompt's (p264)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "_END", "60,40")
    expect(cad.commandLog().slice(-3)).toEqual([
      "No Endpoint found for specified point.",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])
    expect(cad.state().commandLine.prompt).toBe(FILLET1)
    t(cad, "30,40", "80,0")
    expect(shapes(cad)).toEqual(CORNERED)
  })

  it("picks CHAMFER's lines too (p267, p268)", () => {
    const end = t(crossed(), "ID", "5,5", "CHAMFER", "30,40", "_END", "99,1")
    expect(shapes(end)).toEqual(CORNERED)
    expect(lastPoint(end)).toBe(lp("100.00", "0.00"))
    const per = t(crossed(), "ID", "80,10", "CHAMFER", "_PER", "1,1", "30,40")
    expect(shapes(per)).toEqual(CORNERED)
  })

  it("picks Polyline's polyline (p269)", () => {
    const cad = createHarness({ entities: [POLY()] })
    t(cad, "ID", "5,5", "FILLET", "_R", "10", "_P", "_END", "99,1")
    expect(cad.commandLog().at(-1)).toBe("1 line was filleted")
    expect(lastPoint(cad)).toBe(lp("100.00", "0.00"))
  })

  it("is read in Autodesk's Spanish too", () => {
    const cad = createHarness({ locale: es, entities: cross() })
    t(cad, "EMPALME", "30,40", "_END", "99,1")
    expect(cad.commandLog()).not.toContain("*Designación no válida*")
    expect(shapes(cad)).toEqual(CORNERED)
    const missed = createHarness({ locale: es, entities: cross() })
    t(missed, "EMPALME", "_END", "60,40")
    expect(missed.commandLog().slice(-3)).toEqual([
      "No se ha encontrado ptoFINal para el punto designado.",
      "*Designación no válida*",
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Deshacer/Polilínea/RAdio",
    ])
  })

  it("is the point Radius and a mode's corner ask, not a pick", () => {
    const radius = t(crossed(), "FILLET", "_R", "_END", "99,1")
    expect(radius.state().commandLine.prompt).toBe(
      "FILLET Specify second point:"
    )
    t(radius, "100,10")
    expect(radius.state().commandLine.prompt).toBe(FILLET1)
    expect(radius.runtime.document.getSettings().filletRadius).toBeCloseTo(
      10,
      6
    )
    const window = t(crossed(), "FILLET", "_W", "_END", "29,59")
    expect(window.commandLog()).not.toContain("*Invalid selection*")
    expect(window.state().commandLine.prompt).toBe(
      "FILLET Specify opposite corner:"
    )
  })
})

// AutoCAD 2027's console (probe corners/p274): a mode finding only an object
// on a locked layer says so and asks again, the object left as it is.
describe("a mode at FILLET's and CHAMFER's object prompts never takes a locked object", () => {
  it("says so and asks again where a window finds only one (p274)", () => {
    const cad = withLayers(onK(), { locked: true })
    t(cad, "ID", "5,5", "FILLET", "_W", "20,-30", "40,70")
    expect(cad.commandLog().at(-1)).toBe("The object is on a locked layer.")
    expect(cad.state().commandLine.prompt).toBe(FILLET1)
    t(cad, "")
    expect(shapes(cad)).toEqual(["LINE 0 0,0 100,0", "LINE K 30,-20 30,60"])
    expect(lastPoint(cad)).toBe(lp("5.00", "5.00"))
  })

  it("leaves the locked line as it is, by FILLET, CHAMFER, Polyline and Last", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const cad = withLayers(onK(), { locked: true })
      t(cad, command, "_W", "20,-30", "40,70", "80,0")
      expect(shapes(cad)).toContain("LINE K 30,-20 30,60")
    }
    const poly = withLayers([POLY("K")], { locked: true })
    t(poly, "FILLET", "_R", "10", "_P", "_W", "-10,-10", "110,110")
    expect(poly.commandLog().at(-1)).toBe("The object is on a locked layer.")
    expect(shapes(poly)).toEqual(["LWPOLYLINE K 0,0@0 100,0@0 100,100@0"])
    const last = withLayers(onK(), { locked: true })
    t(last, "FILLET", "80,0", "_L")
    expect(last.commandLog().at(-1)).toBe("The object is on a locked layer.")
    expect(last.state().commandLine.prompt).toBe(FILLET2)
    expect(shapes(last)).toContain("LINE K 30,-20 30,60")
  })

  it("takes the newest unlocked one of a find, saying nothing of the locked", () => {
    const cad = withLayers(
      [
        ...onK(),
        lineOf(p(50, 10), p(50, 60), { id: "L3" }),
        lineOf(p(40, 10), p(40, 60), { id: "L4", layerId: "K" }),
      ],
      { locked: true }
    )
    t(cad, "FILLET", "10,0", "_W", "20,-30", "60,70")
    expect(cad.commandLog()).not.toContain("The object is on a locked layer.")
    expectLine(cad, "L1", p(0, 0), p(50, 0))
    expectLine(cad, "L3", p(50, 0), p(50, 60))
  })

  it("is said in Autodesk's Spanish", () => {
    const cad = withLayers(onK(), { locked: true }, es)
    t(cad, "CHAFLAN", "_W", "20,-30", "40,70")
    expect(cad.commandLog().at(-1)).toBe(
      "El objeto está en una capa bloqueada."
    )
  })
})

// AutoCAD 2027's console, en-US and es-ES (probes corners/p240–p256, p265,
// p266, p307): a point typed at the object prompts is a pick, read as a first
// point is, and becomes LASTPOINT, hit or miss.
describe("a point typed at FILLET's and CHAMFER's object prompts, and LASTPOINT", () => {
  it("is the point picked, its Z kept (p240, p241)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "30,40,7", "80,0,3")
    expect(shapes(cad)).toEqual(CORNERED)
    expect(lastPoint(cad)).toBe(lp("80.00", "0.00", "3.00"))
  })

  it("reads `@`, a polar point and `*` as a first point is (p242–p244, p246)", () => {
    for (const [first, second] of [
      ["@25,35", "@50,-40"],
      ["50<53.130102354", "80<0"],
      ["*30,40", "*80,0"],
    ]) {
      const cad = t(crossed(), "ID", "5,5", "FILLET", first, second)
      expect(shapes(cad), first).toEqual(CORNERED)
      expect(lastPoint(cad), first).toBe(lp("80.00", "0.00"))
    }
    const at = t(crossed(), "ID", "30,40", "FILLET", "@", "80,0")
    expect(shapes(at)).toEqual(CORNERED)
  })

  it("refuses `#`, LASTPOINT kept (p245)", () => {
    const cad = t(crossed(), "ID", "5,5", "FILLET", "#30,40")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
    ])
    t(cad, "")
    expect(lastPoint(cad)).toBe(lp("5.00", "5.00"))
  })

  // The console's cursor after `_ZOOM _W -200,-200 200,200`, solved from p247's
  // and p248's answers: 80,10 + 22.9 is 59.3909,0.0162; 30,10 + 22.937 is
  // 9.88293,-1.0186.
  const CURSOR = p(-352.66, -199.6)
  it("reads a number as a direct distance from LASTPOINT towards the cursor (p247, p248, p256)", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const cad = t(crossed(), "ID", "80,10")
      cad.moveTo(CURSOR)
      t(cad, command, "22.9")
      cad.moveTo(CURSOR)
      t(cad, "30,40")
      expect(shapes(cad), command).toEqual(CORNERED)
      expect(lastPoint(cad), command).toBe(lp("30.00", "40.00"))
    }
    const second = t(crossed(), "ID", "5,5", "FILLET", "30,10")
    second.moveTo(CURSOR)
    t(second, "22.937")
    expect(shapes(second)).toEqual(["LINE 0 0,0 30,0", "LINE 0 30,0 30,60"])
    expect(lastPoint(second)).toBe(lp("9.88", "-1.02"))
  })

  it("is LASTPOINT after a miss, at each prompt (p249, p250, p252, p254, p255, p307)", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const first = t(crossed(), "ID", "5,5", command, "60,40", "")
      expect(lastPoint(first), command).toBe(lp("60.00", "40.00"))
      const second = t(crossed(), "ID", "5,5", command, "30,40", "60,40")
      t(second, "@20,-40")
      expect(shapes(second), command).toEqual(CORNERED)
      expect(lastPoint(second), command).toBe(lp("80.00", "0.00"))
    }
    for (const [command, radius] of [
      ["FILLET", ["_R", "10"]],
      ["CHAMFER", []],
    ] as const) {
      const cad = createHarness({ entities: [POLY()] })
      t(cad, "ID", "5,5", command, ...radius, "_P", "50,50", "@50,-5")
      expect(cad.commandLog().at(-1)).toMatch(/^1 line was (fillet|chamfer)ed$/)
      expect(lastPoint(cad), command).toBe(lp("100.00", "45.00"))
    }
  })

  it("is taken as typed, ORTHOMODE on or running snaps on (p265, p266)", () => {
    const ortho = crossed()
    ortho.press("F8")
    t(ortho, "ID", "5,5", "FILLET", "@25,35", "80,0")
    expect(shapes(ortho)).toEqual(CORNERED)
    const snaps = createHarness({ entities: cross(), snap: true })
    t(snaps, "ID", "5,5", "FILLET", "30,40", "99,1")
    expect(lastPoint(snaps)).toBe(lp("99.00", "1.00"))
  })
})

// AutoCAD 2027's console (probes corners/p277–p281): of two objects under a
// pick the newer is taken, whichever is nearer.
describe("a pick at FILLET's and CHAMFER's object prompts over two objects", () => {
  const twoLines = () =>
    createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 2), p(100, 2), { id: "L1B" }),
        lineOf(p(30, -20), p(30, 60), { id: "L2" }),
      ],
    })
  const TWO = ["LINE 0 0,0 100,0", "LINE 0 30,2 100,2", "LINE 0 30,2 30,60"]

  it("takes the newer line, at either prompt (p277, p278, p281)", () => {
    expect(shapes(t(twoLines(), "FILLET", "30,40", "80,0.3"))).toEqual(TWO)
    expect(shapes(t(twoLines(), "FILLET", "80,0.3", "30,40"))).toEqual(TWO)
    expect(shapes(t(twoLines(), "CHAMFER", "30,40", "80,0.3"))).toEqual(TWO)
  })

  it("takes the newer of an arc and a line (p279, p280)", () => {
    const arc = () => arcOf(p(80, 20), 19.7, deg(270), 0, { id: "A" })
    const line = lineOf(p(0, 0), p(100, 0), { id: "L1" })
    const upright = lineOf(p(60, -20), p(60, 60), { id: "L2" })
    const arcNewer = createHarness({ entities: [line, upright, arc()] })
    t(arcNewer, "FILLET", "60,40", "80,0.4")
    expect(arcNewer.commandLog().at(-1)).toBe(
      "No valid fillet with radius 0.00"
    )
    const lineNewer = createHarness({ entities: [arc(), line, upright] })
    t(lineNewer, "FILLET", "60,40", "80,0.4")
    expectLine(lineNewer, "L1", p(60, 0), p(100, 0))
    expectLine(lineNewer, "L2", p(60, 0), p(60, 60))
  })
})

// AutoCAD 2027's console (probes corners/p289–p296): the modes a set takes
// but a single object's pick does not are refused, the prompt asked again.
describe("FILLET's object prompts refuse the modes of a set", () => {
  const REFUSAL = [
    "*Invalid selection*",
    "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Undo/Polyline/Radius",
  ]
  it("refuses Previous, a previous set there (p290)", () => {
    const cad = t(crossed(), "SELECT", "ALL", "", "FILLET", "_PREVIOUS")
    expect(cad.commandLog().slice(-2)).toEqual(REFUSAL)
  })

  it("refuses ALL, Group, AUto, SIngle, Add and Remove (p289, p291–p295)", () => {
    for (const word of ["_ALL", "_G", "_AU", "_SI", "_A", "_REMOVE"]) {
      const cad = t(crossed(), "FILLET", word)
      expect(cad.commandLog().slice(-2), word).toEqual(REFUSAL)
      expect(cad.state().commandLine.prompt).toBe(FILLET1)
    }
  })

  it("refuses ALL at the second prompt (p296)", () => {
    const cad = t(crossed(), "FILLET", "30,40", "_ALL")
    expect(cad.commandLog().slice(-2)).toEqual([
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
    ])
    t(cad, "80,0")
    expect(shapes(cad)).toEqual(CORNERED)
  })
})
