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
import { circleOf, deg, lineOf, p, polylineOf } from "../../../test/builders"

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
