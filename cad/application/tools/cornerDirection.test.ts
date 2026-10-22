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
import { normalizeAngle } from "../../geometry/primitives"

/** The command typed, then each answer, as AutoCAD's prompt reads them. */
function run(
  entities: Entity[],
  command: string,
  ...texts: string[]
): CadHarness {
  const cad = createHarness({ entities })
  cad.command(command)
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The line runs from `start` to `end`, in that order. */
const expectLine = (cad: CadHarness, id: string, start: Vec2, end: Vec2) => {
  const line = cad.byId<LineEntity>(id)
  expect([line.start, line.end]).toBeCloseToPoints([start, end], 4)
}

/** The one entity made: the fillet's arc or the chamfer's bevel. */
const made = <T extends Entity>(cad: CadHarness): T =>
  cad
    .entities()
    .find((e) => e.id !== "L1" && e.id !== "L2" && e.id !== "C")! as T

const expectArc = (
  cad: CadHarness,
  center: Vec2,
  radius: number,
  start: number,
  end: number
) => {
  const arc = made<ArcEntity>(cad)
  expect(arc.center).toBeCloseToPoint(center, 4)
  expect(arc.radius).toBeCloseTo(radius, 4)
  expect(arc.startAngle).toBeCloseToAngle(deg(start), 4)
  expect(arc.endAngle).toBeCloseToAngle(deg(end), 4)
}

const lines = (a: [Vec2, Vec2], b: [Vec2, Vec2]): Entity[] => [
  lineOf(a[0], a[1], { id: "L1" }),
  lineOf(b[0], b[1], { id: "L2" }),
]

const along = (): [Vec2, Vec2] => [p(0, 0), p(100, 0)]
const back = (): [Vec2, Vec2] => [p(100, 0), p(0, 0)]
const up = (): [Vec2, Vec2] => [p(30, -20), p(30, 60)]
const down = (): [Vec2, Vec2] => [p(30, 60), p(30, -20)]

// Every expectation below is AutoCAD 2027's console answering the same input
// (probes rectang/p180–p192, MPDUMP): a line keeps its direction, only its
// moved end changing.
describe("FILLET and CHAMFER keep each line's direction", () => {
  it("FILLET at radius 0, a line drawn either way (p180, p181)", () => {
    const cad = run(lines(back(), up()), "FILLET", "R", "0", "30,40", "80,0")
    expectLine(cad, "L1", p(100, 0), p(30, 0))
    expectLine(cad, "L2", p(30, 0), p(30, 60))

    const forward = run(lines(along(), up()), "FILLET", "30,40", "80,0")
    expectLine(forward, "L1", p(30, 0), p(100, 0))
    expectLine(forward, "L2", p(30, 0), p(30, 60))
  })

  it("FILLET with a radius, both lines drawn either way (p182, p183)", () => {
    const cad = run(lines(along(), up()), "FILLET", "R", "10", "30,40", "80,0")
    expectArc(cad, p(40, 10), 10, 180, 270)
    expectLine(cad, "L1", p(40, 0), p(100, 0))
    expectLine(cad, "L2", p(30, 10), p(30, 60))

    const reversed = run(
      lines(back(), down()),
      "FILLET",
      "R",
      "10",
      "30,40",
      "80,0"
    )
    expectArc(reversed, p(40, 10), 10, 180, 270)
    expectLine(reversed, "L1", p(100, 0), p(40, 0))
    expectLine(reversed, "L2", p(30, 60), p(30, 10))
  })

  it("FILLET extending lines that stop short of the corner (p184, p185)", () => {
    const sharp = run(
      lines([p(20, 0), p(0, 0)], [p(30, 60), p(30, 10)]),
      "FILLET",
      "10,0",
      "30,40"
    )
    expectLine(sharp, "L1", p(30, 0), p(0, 0))
    expectLine(sharp, "L2", p(30, 60), p(30, 0))

    const round = run(
      lines([p(0, 0), p(20, 0)], [p(30, 10), p(30, 60)]),
      "FILLET",
      "R",
      "5",
      "10,0",
      "30,40"
    )
    expectArc(round, p(25, 5), 5, 270, 0)
    expectLine(round, "L1", p(0, 0), p(25, 0))
    expectLine(round, "L2", p(30, 5), p(30, 60))
  })

  it("CHAMFER, the bevel from the first line's cut to the second's (p186–p188)", () => {
    const cad = run(
      lines(back(), down()),
      "CHAMFER",
      "D",
      "10",
      "20",
      "30,40",
      "80,0"
    )
    expectLine(cad, made(cad).id, p(30, 10), p(50, 0))
    expectLine(cad, "L1", p(100, 0), p(50, 0))
    expectLine(cad, "L2", p(30, 60), p(30, 10))

    const forward = run(
      lines(along(), up()),
      "CHAMFER",
      "D",
      "10",
      "20",
      "80,0",
      "30,40"
    )
    expectLine(forward, made(forward).id, p(40, 0), p(30, 20))
    expectLine(forward, "L1", p(40, 0), p(100, 0))
    expectLine(forward, "L2", p(30, 20), p(30, 60))

    const sharp = run(
      lines([p(20, 0), p(0, 0)], [p(30, 60), p(30, 10)]),
      "CHAMFER",
      "10,0",
      "30,40"
    )
    expectLine(sharp, "L1", p(30, 0), p(0, 0))
    expectLine(sharp, "L2", p(30, 60), p(30, 0))
  })

  it("FILLET of a line with a circle (p189, p190)", () => {
    for (const [start, end] of [along(), back()]) {
      const cad = run(
        [
          lineOf(start, end, { id: "L1" }),
          circleOf(p(50, 30), 20, { id: "C" }),
        ],
        "FILLET",
        "R",
        "8",
        "80,0",
        "45,10.6148"
      )
      expectArc(cad, p(67.3205, 8), 8, 128.2132, 270)
      const kept = start.x === 0 ? [p(67.3205, 0), end] : [start, p(67.3205, 0)]
      expectLine(cad, "L1", kept[0], kept[1])
    }
  })

  it("a line joined to a polyline runs as the one picked first (p191, p192)", () => {
    const vertices = (cad: CadHarness) =>
      cad.entities().find((e): e is PolylineEntity => e.type === "polyline")!
    const line = run(
      [lineOf(p(100, 0), p(0, 0)), polylineOf([p(30, -20), p(30, 60)])],
      "FILLET",
      "80,0",
      "30,40"
    )
    expect(vertices(line).vertices).toBeCloseToPoints(
      [p(100, 0), p(30, 0), p(30, 60)],
      4
    )

    const poly = run(
      [lineOf(p(100, 0), p(0, 0)), polylineOf([p(30, 60), p(30, -20)])],
      "FILLET",
      "R",
      "5",
      "30,40",
      "80,0"
    )
    expect(vertices(poly).vertices).toBeCloseToPoints(
      [p(30, 60), p(30, 5), p(35, 0), p(100, 0)],
      4
    )
    expect(vertices(poly).bulges?.[1]).toBeCloseTo(0.4142, 4)
  })

  it("does so in Spanish too (p183 es-ES)", () => {
    const cad = createHarness({ locale: es, entities: lines(back(), down()) })
    cad.command("EMPALME")
    for (const text of ["RA", "10", "30,40", "80,0"]) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    expectLine(cad, "L1", p(100, 0), p(40, 0))
    expectLine(cad, "L2", p(30, 60), p(30, 10))
  })
})

// AutoCAD 2027's console answering the same input (probes corners/<id>, MPDUMP
// at full precision): the lines' sides, the sizes refused, ARC and CIRCLE.
describe("FILLET and CHAMFER round and bevel where the picks say", () => {
  const typed = (entities: Entity[], ...texts: string[]) => {
    const cad = createHarness({ entities })
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const typedEs = (entities: Entity[], ...texts: string[]) => {
    const cad = createHarness({ entities, locale: es })
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  const L = (a: [number, number], b: [number, number], id: string) =>
    lineOf(p(...a), p(...b), { id })
  const ends = (
    cad: CadHarness,
    id: string,
    s: [number, number],
    e: [number, number]
  ) => {
    const line = cad.byId<LineEntity>(id)
    expect([line.start, line.end]).toBeCloseToPoints([p(...s), p(...e)], 6)
  }
  const news = <T extends Entity>(cad: CadHarness, ...old: string[]) =>
    cad.entities().filter((e) => !old.includes(e.id)) as T[]
  const arcIs = (
    arc: ArcEntity,
    c: [number, number],
    r: number,
    s: number,
    e: number
  ) => {
    expect(arc.center).toBeCloseToPoint(p(...c), 6)
    expect(arc.radius).toBeCloseTo(r, 6)
    expect(normalizeAngle(arc.startAngle)).toBeCloseTo(s, 6)
    expect(normalizeAngle(arc.endAngle)).toBeCloseTo(e, 6)
  }
  const X1 = () => [L([-20, 0], [100, 0], "L1"), L([0, -20], [0, 100], "L2")]
  const APART = () => [L([20, 0], [100, 0], "L1"), L([0, 20], [0, 100], "L2")]
  const OBL = () => [L([0, 0], [100, 0], "L1"), L([10, -5], [60, 80], "L2")]

  it("FILLET keeps the short sides picked (p171)", () => {
    const cad = typed(X1(), "FILLET", "R", "10", "-10,0", "0,-10")
    ends(cad, "L1", [-20, 0], [-10, 0])
    ends(cad, "L2", [0, -20], [0, -10])
    arcIs(news<ArcEntity>(cad, "L1", "L2")[0], [-10, -10], 10, 0, Math.PI / 2)
  })

  it("FILLET says a radius too large, in either language (p174)", () => {
    const cad = typed(X1(), "FILLET", "R", "200", "50,0", "0,50")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Fillet radius is too large",
      "*Invalid*",
    ])
    ends(cad, "L1", [-20, 0], [100, 0])
    const sp = typedEs(X1(), "EMPALME", "RA", "200", "50,0", "0,50")
    expect(sp.commandLog().slice(-2)).toEqual([
      "Radio de empalme es demasiado grande",
      "*No válido*",
    ])
  })

  it("FILLET rounds two oblique lines, to full precision (p177)", () => {
    const cad = typed(OBL(), "FILLET", "R", "7.3", "80,0", "50,63")
    ends(cad, "L1", [25.70461796, 0], [100, 0])
    ends(cad, "L2", [19.41249819, 11.00124692], [60, 80])
    arcIs(
      news<ArcEntity>(cad, "L1", "L2")[0],
      [25.70461796, 7.3],
      7.3,
      2.609868586,
      4.71238898
    )
  })

  it("FILLET rounds the quadrant the picks lie in (p179)", () => {
    const cad = typed(
      [L([-100, 0], [100, 0], "L1"), L([0, -100], [0, 100], "L2")],
      "FILLET",
      "R",
      "10",
      "50,0",
      "0,-50"
    )
    ends(cad, "L1", [10, 0], [100, 0])
    ends(cad, "L2", [0, -100], [0, -10])
    arcIs(
      news<ArcEntity>(cad, "L1", "L2")[0],
      [10, -10],
      10,
      Math.PI / 2,
      Math.PI
    )
  })

  it("CHAMFER says a distance too large, in either language (p182)", () => {
    expect(
      typed(X1(), "CHAMFER", "D", "200", "200", "50,0", "0,50")
        .commandLog()
        .slice(-2)
    ).toEqual(["Chamfer distance is too large", "*Invalid*"])
    expect(
      typedEs(X1(), "CHAFLAN", "D", "200", "200", "50,0", "0,50")
        .commandLog()
        .slice(-2)
    ).toEqual(["Distancia de chaflán es demasiado grande", "*No válido*"])
  })

  it("CHAMFER extends lines apart to the cut (p186)", () => {
    const cad = typed(APART(), "CHAMFER", "D", "10", "5", "50,0", "0,50")
    ends(cad, "L1", [10, 0], [100, 0])
    ends(cad, "L2", [0, 5], [0, 100])
  })

  it("CHAMFER bevels two oblique lines, to full precision (p187)", () => {
    const cad = typed(OBL(), "CHAMFER", "D", "7.3", "4.1", "80,0", "50,63")
    ends(cad, "L1", [20.24117647, 0], [100, 0])
    ends(cad, "L2", [15.01995899, 3.533930282], [60, 80])
    const [bevel] = news<LineEntity>(cad, "L1", "L2")
    expect([bevel.start, bevel.end]).toBeCloseToPoints(
      [p(20.24117647, 0), p(15.01995899, 3.533930282)],
      6
    )
  })

  const ARC1 = () => [
    arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "A1" }),
    L([30, -20], [30, 80], "L1"),
  ]
  it("FILLET of a line and an arc nearest the line's pick, off the arc's extent (p321)", () => {
    const cad = typed(ARC1(), "FILLET", "R", "5", "30,-10", "45,21.794")
    ends(cad, "L1", [30, -28.28427125], [30, 80])
    expect(normalizeAngle(cad.byId<ArcEntity>("A1").startAngle)).toBeCloseTo(
      5.603511488,
      6
    )
    arcIs(
      news<ArcEntity>(cad, "A1", "L1")[0],
      [35, -28.28427125],
      5,
      Math.PI,
      5.603511488
    )
  })

  it("FILLET of a line and an arc at radius 0 (p189)", () => {
    const cad = typed(ARC1(), "FILLET", "R", "0", "30,0", "45,21.794")
    ends(cad, "L1", [30, -40], [30, 80])
    expect(normalizeAngle(cad.byId<ArcEntity>("A1").startAngle)).toBeCloseTo(
      5.355890089,
      6
    )
    expect(cad.entities()).toHaveLength(2)
  })

  const ARC2 = () => [
    arcOf(p(0, 0), 50, 0, Math.PI, { id: "A1" }),
    arcOf(p(60, 0), 50, 0, Math.PI, { id: "A2" }),
  ]
  it("FILLET of two arcs, at a radius and at 0 (p190, p191)", () => {
    const cad = typed(ARC2(), "FILLET", "R", "5", "43.30127,25", "16.69873,25")
    expect(normalizeAngle(cad.byId<ArcEntity>("A1").endAngle)).toBeCloseTo(
      0.8410686706,
      6
    )
    expect(normalizeAngle(cad.byId<ArcEntity>("A2").startAngle)).toBeCloseTo(
      2.300523983,
      6
    )
    arcIs(
      news<ArcEntity>(cad, "A1", "A2")[0],
      [30, 33.54101966],
      5,
      0.8410686706,
      2.300523983
    )
    const sharp = typed(
      ARC2(),
      "FILLET",
      "R",
      "0",
      "43.30127,25",
      "16.69873,25"
    )
    expect(normalizeAngle(sharp.byId<ArcEntity>("A1").endAngle)).toBeCloseTo(
      0.927295218,
      6
    )
    expect(normalizeAngle(sharp.byId<ArcEntity>("A2").startAngle)).toBeCloseTo(
      2.214297436,
      6
    )
  })

  const C1L = () => [
    circleOf(p(0, 0), 30, { id: "C1" }),
    L([-50, 10], [50, 10], "L1"),
  ]
  it("FILLET of a line and a circle, the circle untouched, at a radius and at 0 (p192, p193)", () => {
    const cad = typed(C1L(), "FILLET", "R", "5", "40,10", "0,-30")
    ends(cad, "L1", [34.64101615, 10], [50, 10])
    arcIs(
      news<ArcEntity>(cad, "C1", "L1")[0],
      [34.64101615, 5],
      5,
      Math.PI / 2,
      3.284940222
    )
    ends(
      typed(C1L(), "FILLET", "R", "0", "40,10", "0,-30"),
      "L1",
      [28.28427125, 10],
      [50, 10]
    )
  })

  const C2 = () => [
    circleOf(p(0, 0), 30, { id: "C1" }),
    circleOf(p(40, 0), 30, { id: "C2" }),
  ]
  it("FILLET of two circles at a radius, and nothing at 0 (p194, p195)", () => {
    const cad = typed(C2(), "FILLET", "R", "5", "0,30", "40,30")
    arcIs(
      news<ArcEntity>(cad, "C1", "C2")[0],
      [20, 28.72281323],
      5,
      4.104143401,
      5.320634559
    )
    expect(
      typed(C2(), "FILLET", "R", "0", "0,30", "40,30").entities()
    ).toHaveLength(2)
  })

  it("CHAMFER refuses an ARC in Spanish (p196)", () => {
    const sp = typedEs(
      [arcOf(p(0, 0), 50, 0, Math.PI / 2, { id: "A1" })],
      "CHAFLAN",
      "35.35534,35.35534"
    )
    expect(sp.commandLog().at(-1)).toBe(
      "Chaflán requiere 2 líneas (no segmentos de arco)."
    )
  })
})
