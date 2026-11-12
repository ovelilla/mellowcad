import { describe, expect, it } from "vitest"

import { createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"
import {
  createBlockDefinition,
  createLine,
  type InsertEntity,
  type PointEntity,
} from "../../domain/entities"
import { es } from "../../locales/es"

const points = (cad: ReturnType<typeof createHarness>) =>
  cad
    .entities()
    .filter((e): e is PointEntity => e.type === "point")
    .map((e) => ({ ...e.position, z: e.elevation ?? 0 }))

const sorted = (list: readonly { x: number; y: number }[]) =>
  [...list].sort((a, b) => a.x - b.x || a.y - b.y)

/** Ten times the probes' sizes, so a pick of the harness's pixels finds them. */
describe("POINT (point/p01–p04)", () => {
  it("says the point modes, refuses Enter and ends after one point", () => {
    const cad = createHarness()
    cad.command("POINT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current point modes:  PDMODE=0  PDSIZE=0.00"
    )
    expect(cad.state().commandLine.prompt).toBe("POINT Specify a point:")
    cad.enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify a point:",
      "Invalid point.",
    ])
    cad.type("100,200").enter()
    expect(cad.activeToolId()).toBe("select")
    expect(points(cad)).toEqual([{ x: 100, y: 200, z: 0 }])
  })

  it("keeps a typed Z and stores DXF 50 as AutoCAD does in a turned UCS", () => {
    const cad = createHarness()
    cad.command("POINT").type("5,5,3").enter()
    expect(points(cad)).toEqual([{ x: 5, y: 5, z: 3 }])
    cad.command("UCS").type("Z").enter().type("30").enter()
    cad.command("POINT").type("20,0").enter()
    const turned = cad.latest() as PointEntity
    expect(turned.position.x).toBeCloseTo(17.320508, 5)
    expect(turned.position.y).toBeCloseTo(10, 5)
    expect(turned.xAxisAngle).toBeCloseTo(5.759587, 5)
  })

  it("wears THICKNESS (point/p04)", () => {
    const cad = createHarness()
    cad.command("THICKNESS").type("2.5").enter()
    cad.command("POINT").type("10,10").enter()
    expect((cad.latest() as PointEntity).thickness).toBe(2.5)
  })
})

describe("around POINT", () => {
  it("frames a lone point one unit high, as ZOOM Extents does (point/p13)", () => {
    const cad = createHarness()
    cad.command("POINT").type("10,10").enter()
    cad.command("ZOOM").type("E").enter()
    expect(cad.runtime.viewport.scale).toBeGreaterThan(500)
    expect(cad.runtime.viewport.scale).toBeLessThanOrEqual(800)
  })

  it("Multiple Points starts again after each point, and after a transparent ZOOM", () => {
    const cad = createHarness()
    cad.tool("point")
    cad.type("10,10").enter()
    expect(cad.activeToolId()).toBe("point")
    cad.runtime.setCommandLineText("'ZOOM")
    cad.runtime.submitCommandLine()
    cad.type("E").enter()
    cad.type("20,20").enter()
    expect(cad.activeToolId()).toBe("point")
    cad.escape()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts()).toEqual({ point: 2 })
  })

  it("starts a circle at the UCS's X and lays unaligned blocks along it", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(-1, 0), p(1, 0)),
    ])
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 100)],
      blocks: [block],
    })
    cad.command("UCS").type("Z").enter().type("30").enter()
    cad.command("DIVIDE").click(p(100, 0)).type("4").enter()
    const first = points(cad)[0]
    expect(first.x).toBeCloseTo(86.60254, 4)
    expect(first.y).toBeCloseTo(50, 4)
    cad.command("DIVIDE").click(p(0, 100)).option("Block")
    cad.type("B1").enter().option("No")
    cad.type("4").enter()
    const inserts = cad
      .entities()
      .filter((e): e is InsertEntity => e.type === "insert")
    expect(inserts.map((i) => i.rotation)).toEqual(
      Array(4).fill(expect.closeTo(deg(30), 9))
    )
  })
})

describe("PDMODE and PDSIZE (point/p03)", () => {
  it("refuses a figure AutoCAD has none for and regenerates", () => {
    const cad = createHarness()
    cad.command("PDMODE").type("35").enter()
    expect(cad.commandLog().at(-1)).toBe("Regenerating model.")
    cad.command("PDMODE").type("5").enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      "Cannot set PDMODE to that value.",
      "*Invalid*",
    ])
    cad.command("PDSIZE").type("-5").enter()
    expect(cad.runtime.document.getSettings()).toMatchObject({
      pointMode: 35,
      pointSize: -5,
    })
    cad.command("POINT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current point modes:  PDMODE=35  PDSIZE=-5.00"
    )
  })
})

describe("DIVIDE (divide/p01, p03, p04, p08)", () => {
  it("puts count − 1 points along a line and makes them the Previous set", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("DIVIDE")
    expect(cad.state().commandLine.prompt).toBe(
      "DIVIDE Select object to divide:"
    )
    cad.click(p(20, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "DIVIDE Enter the number of segments or [Block]:"
    )
    cad.type("5").enter()
    expect(sorted(points(cad))).toEqual([
      { x: 20, y: 0, z: 0 },
      { x: 40, y: 0, z: 0 },
      { x: 60, y: 0, z: 0 },
      { x: 80, y: 0, z: 0 },
    ])
    cad.command("ERASE")
    for (const answer of ["P", ""]) {
      cad.runtime.setCommandLineText(answer)
      cad.runtime.submitCommandLine()
    }
    expect(cad.typeCounts()).toEqual({ line: 1 })
  })

  it("puts count points round a closed curve, its start among them", () => {
    const circle = createHarness({ entities: [circleOf(p(0, 0), 100)] })
    circle.command("DIVIDE").click(p(100, 0)).type("4").enter()
    expect(points(circle).map((q) => [q.x, q.y])).toEqual([
      [100, 0],
      [expect.closeTo(0, 9), 100],
      [-100, expect.closeTo(0, 9)],
      [expect.closeTo(0, 9), -100],
    ])
    const square = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], {
          closed: true,
        }),
      ],
    })
    square.command("DIVIDE").click(p(100, 50)).type("3").enter()
    const got = points(square)
    expect(got[0]).toEqual({ x: 0, y: 0, z: 0 })
    expect(got[1].x).toBeCloseTo(100, 9)
    expect(got[1].y).toBeCloseTo(33.333333, 5)
    expect(got[2].x).toBeCloseTo(33.333333, 5)
  })

  it("starts an ellipse at its own start, counter-clockwise (p04)", () => {
    const cad = createHarness({
      entities: [ellipseOf(p(0, 0), p(-100, 0), 0.5)],
    })
    cad.command("DIVIDE").click(p(100, 0)).type("4").enter()
    const got = points(cad)
    expect(got[0].x).toBeCloseTo(-100, 9)
    expect(got[1].y).toBeCloseTo(-50, 9)
  })

  it("walks a rising line in space (p08)", () => {
    const cad = createHarness({
      entities: [createLine({ x: 0, y: 0, z: 20 }, { x: 100, y: 0, z: 80 })],
    })
    cad.command("DIVIDE").click(p(50, 0)).type("2").enter()
    expect(points(cad)[0]).toEqual({ x: 50, y: 0, z: 50 })
  })

  it("refuses a count out of 2–32767 and a fraction, and asks again (p06, p10)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("DIVIDE").click(p(50, 0))
    for (const typed of ["1", "32768", "1.5"]) {
      cad.type(typed).enter()
      expect(cad.commandLog().at(-1)).toBe(
        "Requires an integer between 2 and 32767, or option keyword."
      )
    }
  })

  it("says it cannot divide a point, and a pick on nothing ends it (p07)", () => {
    const cad = createHarness()
    cad.command("POINT").type("30,30").enter()
    cad.command("DIVIDE").click(p(30, 30))
    expect(cad.commandLog().slice(-2)).toEqual([
      "Cannot divide that object.",
      "*Invalid*",
    ])
    expect(cad.activeToolId()).toBe("select")
    cad.command("DIVIDE").click(p(300, 300))
    expect(cad.commandLog().at(-1)).toBe("*Invalid*")
    expect(cad.activeToolId()).toBe("select")
  })

  it("inserts a block aligned with the curve, or along the UCS's X (p05)", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(-1, 0), p(1, 0)),
    ])
    const cad = createHarness({
      entities: [arcOf(p(0, 0), 100, 0, deg(90))],
      blocks: [block],
    })
    cad.command("DIVIDE").click(p(100, 0)).option("Block")
    expect(cad.state().commandLine.prompt).toBe(
      "DIVIDE Enter name of block to insert:"
    )
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Invalid block name.")
    cad.type("NOPE").enter()
    expect(cad.commandLog().at(-1)).toBe('Cannot find block "NOPE".')
    cad.type("b1").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIVIDE Align block with object? [Yes/No] <Y>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe(
      "DIVIDE Enter the number of segments:"
    )
    cad.type("3").enter()
    const inserts = cad
      .entities()
      .filter((e): e is InsertEntity => e.type === "insert")
    expect(inserts.map((i) => i.rotation)).toEqual([
      expect.closeTo(2.094395, 5),
      expect.closeTo(2.617994, 5),
    ])
  })
})

describe("MEASURE (divide/p02, p03, p06, p11–p13)", () => {
  it("starts at the end nearer the pick", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("MEASURE")
    expect(cad.state().commandLine.prompt).toBe(
      "MEASURE Select object to measure:"
    )
    cad.click(p(90, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MEASURE Specify length of segment or [Block]:"
    )
    cad.type("30").enter()
    expect(sorted(points(cad)).map((q) => q.x)).toEqual([10, 40, 70])
  })

  it("puts a point on the far end a whole number of steps away", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(90, 0))] })
    cad.command("MEASURE").click(p(10, 0)).type("30").enter()
    expect(sorted(points(cad)).map((q) => q.x)).toEqual([30, 60, 90])
  })

  it("runs round a circle from its angle 0 and a closed polyline from its first vertex", () => {
    const circle = createHarness({ entities: [circleOf(p(0, 0), 100)] })
    circle.command("MEASURE").click(p(-100, 0)).type("50").enter()
    const round = points(circle)
    expect(round).toHaveLength(12)
    expect(round[0].x).toBeCloseTo(87.75826, 4)
    expect(round[0].y).toBeCloseTo(47.94255, 4)
    const square = createHarness({
      entities: [
        polylineOf([p(0, 0), p(100, 0), p(100, 100), p(0, 100)], {
          closed: true,
        }),
      ],
    })
    square.command("MEASURE").click(p(100, 50)).type("40").enter()
    const got = points(square)
    expect(got).toHaveLength(10)
    expect(got.slice(0, 3)).toEqual([
      { x: 40, y: 0, z: 0 },
      { x: 80, y: 0, z: 0 },
      { x: 100, y: 20, z: 0 },
    ])
    expect(got.at(-1)).toEqual({ x: 0, y: 0, z: 0 })
  })

  it("runs a closed ellipse backwards when picked past its middle (p11)", () => {
    const cad = createHarness({
      entities: [ellipseOf(p(0, 0), p(-100, 0), 0.5)],
    })
    cad.command("MEASURE").click(p(100, 0)).type("50").enter()
    const first = points(cad)[0]
    expect(first.x).toBeCloseTo(-69.16861, 3)
    expect(first.y).toBeCloseTo(36.10992, 3)
  })

  it("aligns a block along the curve's own way, measured from its end (p12)", () => {
    const block = createBlockDefinition("B1", p(0, 0), [
      lineOf(p(-1, 0), p(1, 0)),
    ])
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 100))],
      blocks: [block],
    })
    cad.command("MEASURE").click(p(90, 90)).option("Block")
    cad.type("B1").enter().option("Yes")
    expect(cad.state().commandLine.prompt).toBe(
      "MEASURE Specify length of segment:"
    )
    cad.type("40").enter()
    const inserts = cad
      .entities()
      .filter((e): e is InsertEntity => e.type === "insert")
    expect(inserts).toHaveLength(3)
    expect(inserts.every((i) => Math.abs(i.rotation - deg(45)) < 1e-9)).toBe(
      true
    )
    expect(inserts.map((i) => i.position.x).sort((a, b) => a - b)).toEqual([
      expect.closeTo(15.14719, 4),
      expect.closeTo(43.43146, 4),
      expect.closeTo(71.71573, 4),
    ])
  })

  it("refuses a length that is not positive, and ends on one too long or too short (p06, p13)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("MEASURE").click(p(50, 0))
    for (const typed of ["0", "-1"]) {
      cad.type(typed).enter()
      expect(cad.commandLog().at(-1)).toBe(
        "Value must be positive and nonzero."
      )
    }
    cad.type("110").enter()
    expect(cad.commandLog().at(-1)).toBe("Object isn't that long.")
    expect(cad.activeToolId()).toBe("select")
    cad.command("MEASURE").click(p(50, 0)).type("0.001").enter()
    expect(cad.commandLog().at(-1)).toBe("Object is too long.")
    expect(cad.typeCounts()).toEqual({ line: 1 })
  })
})

describe("the Node object snap (point/p11)", () => {
  it("runs from -OSNAP's NOD, listed after Cen, and finds a point", () => {
    const cad = createHarness({ snap: true })
    cad.command("POINT").type("200,100").enter()
    cad.command("-OSNAP").type("END,NOD").enter()
    cad.command("-OSNAP")
    expect(cad.commandLog().at(-1)).toBe("Current osnap modes: End,Node")
    cad.escape()
    cad.command("LINE").click(p(203, 102)).click(p(300, 300)).escape()
    const line = cad.entities().find((e) => e.type === "line")
    expect(line && "start" in line ? line.start : null).toEqual({
      x: 200,
      y: 100,
    })
  })

  it("answers `_NOD` at a point prompt, asking `of`", () => {
    const cad = createHarness()
    cad.command("POINT").type("200,100").enter()
    cad.command("LINE")
    cad.runtime.setCommandLineText("_NOD")
    cad.runtime.submitCommandLine()
    cad.click(p(202, 101))
    expect(cad.commandLog().at(-1)).toBe("Specify first point: _NOD of")
    cad.click(p(300, 300)).escape()
    const line = cad.entities().find((e) => e.type === "line")
    expect(line && "start" in line ? line.start : null).toEqual({
      x: 200,
      y: 100,
    })
  })
})

describe("the figure PDMODE draws", () => {
  it("draws a circle, a square and a plus at PDSIZE, and a dot at 0", () => {
    const cad = createHarness()
    cad.moveTo(p(10, 10))
    const kinds = () => cad.scene().primitives.map((each) => each.kind)
    const before = kinds()
    const added = () => {
      const now = kinds()
      for (const kind of before) now.splice(now.indexOf(kind), 1)
      return now
    }
    cad.command("POINT").type("400,400").enter()
    cad.moveTo(p(10, 10))
    expect(added()).toEqual(["segment"])
    cad.command("PDMODE").type("98").enter()
    cad.command("PDSIZE").type("20").enter()
    cad.moveTo(p(10, 10))
    // The plus, the square's four sides and the circle (desktop point/d01).
    expect(added().sort()).toEqual(["circle", ...Array(6).fill("segment")])
  })
})

describe("in Spanish", () => {
  it("GRADUA and DIVIDE ask in AutoCAD's words", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0))],
    })
    cad.command("GRADUA").click(p(10, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "GRADUA Precise longitud de segmento o [Bloque]:"
    )
    cad.escape()
    cad.command("PUNTO")
    expect(cad.commandLog().at(-1)).toBe(
      "Modos de punto actuales:  PDMODE=0  PDSIZE=0.00"
    )
  })
})
