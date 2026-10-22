import { describe, expect, it } from "vitest"
import type { ArcEntity, Entity, LineEntity } from "../../domain/entities"
import type { Vec2 } from "../../geometry/Vec2"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import { deg, layerOf, lineOf, p } from "../../../test/builders"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** FILLET at radius 3, which a cap does not heed, then the answers. */
function fillet(entities: Entity[], ...texts: string[]): CadHarness {
  const cad = createHarness({ entities })
  cad.command("FILLET")
  return answer(cad, "R", "3", ...texts)
}

/** The line runs from `start` to `end`, its direction kept. */
const expectLine = (cad: CadHarness, id: string, start: Vec2, end: Vec2) => {
  const line = cad.byId<LineEntity>(id)
  expect([line.start, line.end]).toBeCloseToPoints([start, end], 4)
}

const capOf = (cad: CadHarness): ArcEntity =>
  cad.entities().find((e): e is ArcEntity => e.type === "arc")!

const expectCap = (
  cad: CadHarness,
  center: Vec2,
  radius: number,
  start: number,
  end: number
) => {
  const arc = capOf(cad)
  expect(arc.center).toBeCloseToPoint(center, 4)
  expect(arc.radius).toBeCloseTo(radius, 4)
  expect(arc.startAngle).toBeCloseToAngle(deg(start), 4)
  expect(arc.endAngle).toBeCloseToAngle(deg(end), 4)
}

const equal = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "A" }),
  lineOf(p(0, 10), p(100, 10), { id: "B" }),
]

/** The upper line longer, starting further right. */
const shifted = (): Entity[] => [
  lineOf(p(0, 0), p(100, 0), { id: "A" }),
  lineOf(p(30, 10), p(150, 10), { id: "B" }),
]

/** The same left of the origin. */
const negative = (): Entity[] => [
  lineOf(p(-300, 0), p(-200, 0), { id: "A" }),
  lineOf(p(-270, 10), p(-150, 10), { id: "B" }),
]

// Every expectation below is AutoCAD 2023's console answering the same input
// (LIST, AUPREC 4): acc/c*, d*, e*, g*, h* in the research notes; AutoCAD
// 2027's confirms the cap and the collinear refusal (probes corners/p175,
// p176).
describe("FILLET caps two parallel lines with a half circle", () => {
  it("from the first's end nearer its pick, the second's end moved there (p175, p176)", () => {
    const cad = answer(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "A" }),
          lineOf(p(20, 30), p(120, 30), { id: "B" }),
        ],
      }),
      "FILLET",
      "R",
      "10",
      "80,0",
      "80,30"
    )
    expectLine(cad, "A", p(0, 0), p(100, 0))
    expectLine(cad, "B", p(20, 30), p(100, 30))
    expectCap(cad, p(100, 15), 15, 270, 90)

    const collinear = answer(
      createHarness({
        locale: es,
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(60, 0), p(100, 0), { id: "B" }),
        ],
      }),
      "EMPALME",
      "20,0",
      "80,0"
    )
    expect(collinear.commandLog().at(-1)).toBe(
      "Las líneas colineales no pueden ser unidos con empalme."
    )
  })

  it("at the first line's end nearer its pick, whatever the radius", () => {
    const left = fillet(equal(), "20,0", "80,10")
    expectCap(left, p(0, 5), 5, 90, 270)
    expectLine(left, "A", p(0, 0), p(100, 0))
    expectLine(left, "B", p(0, 10), p(100, 10))
    expect(left.activeToolId()).toBe("select")

    const right = fillet(equal(), "80,0", "20,10")
    expectCap(right, p(100, 5), 5, 270, 90)

    // A pick half way along takes the line's end point (acc/e8).
    expectCap(fillet(equal(), "50,0", "50,10"), p(100, 5), 5, 270, 90)
    const reversed = fillet(
      [
        lineOf(p(100, 0), p(0, 0), { id: "A" }),
        lineOf(p(100, 10), p(0, 10), { id: "B" }),
      ],
      "50,0",
      "50,10"
    )
    expectCap(reversed, p(0, 5), 5, 90, 270)
    expectLine(reversed, "A", p(100, 0), p(0, 0))
  })

  it("extends or trims the second line's end on that side, the first left as it is", () => {
    const extended = fillet(shifted(), "20,0", "120,10")
    expectCap(extended, p(0, 5), 5, 90, 270)
    expectLine(extended, "B", p(0, 10), p(150, 10))
    expectLine(extended, "A", p(0, 0), p(100, 0))

    const trimmed = fillet(shifted(), "90,0", "40,10")
    expectCap(trimmed, p(100, 5), 5, 270, 90)
    expectLine(trimmed, "B", p(30, 10), p(100, 10))

    const upperFirst = fillet(shifted(), "120,10", "20,0")
    expectCap(upperFirst, p(150, 5), 5, 270, 90)
    expectLine(upperFirst, "A", p(0, 0), p(150, 0))
    expectLine(upperFirst, "B", p(30, 10), p(150, 10))

    const inside = fillet(
      [
        lineOf(p(30, 0), p(60, 0), { id: "A" }),
        lineOf(p(0, 10), p(100, 10), { id: "B" }),
      ],
      "40,0",
      "90,10"
    )
    expectCap(inside, p(30, 5), 5, 90, 270)
    expectLine(inside, "B", p(30, 10), p(100, 10))
  })

  it("caps sloping lines across, square to them", () => {
    const cad = fillet(
      [
        lineOf(p(0, 0), p(60, 80), { id: "A" }),
        lineOf(p(10, 0), p(70, 80), { id: "B" }),
      ],
      "12,16",
      "64,72"
    )
    expectCap(cad, p(3.2, -2.4), 4, 143.1301, 323.1301)
    expectLine(cad, "B", p(6.4, -4.8), p(70, 80))
  })

  it("makes nothing where the second line would turn back, and ends", () => {
    const cad = fillet(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(120, 10), p(200, 10), { id: "B" }),
      ],
      "80,0",
      "150,10"
    )
    expect(cad.entities().some((e) => e.type === "arc")).toBe(false)
    expectLine(cad, "B", p(120, 10), p(200, 10))
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog().at(-1)).toBe(
      "Select second object or shift-select to apply corner or [Radius]: 150,10"
    )
  })

  it("says collinear lines cannot be filleted, and ends or in Multiple asks again", () => {
    const collinear = (): Entity[] => [
      lineOf(p(0, 0), p(100, 0), { id: "A" }),
      lineOf(p(120, 0), p(200, 0), { id: "B" }),
      lineOf(p(0, 10), p(100, 10), { id: "C" }),
    ]
    const cad = fillet(collinear(), "80,0", "150,0")
    expect(cad.commandLog().at(-1)).toBe("Collinear lines connot be filleted.")
    expect(cad.activeToolId()).toBe("select")

    const multiple = fillet(collinear(), "M", "80,0", "150,0", "20,0", "20,10")
    expect(multiple.commandLog().slice(-3)).toEqual([
      "Collinear lines connot be filleted.",
      "Select first object or [Undo/Polyline/Radius/Multiple]: 20,0",
      "Select second object or shift-select to apply corner or [Radius]: 20,10",
    ])
    expectCap(multiple, p(0, 5), 5, 90, 270)
    expect(multiple.activeToolId()).toBe("fillet")
  })

  it("puts the cap on the lines' layer, else the current one, with the second's thickness", () => {
    const shared = createHarness()
    shared.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A", layerId: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "B", layerId: "L1" }),
      ],
      { layers: [layerOf("0"), layerOf("L1"), layerOf("L2")] }
    )
    shared.command("FILLET")
    answer(shared, "20,0", "20,10")
    expect(capOf(shared).layerId).toBe("L1")

    const apart = createHarness()
    apart.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "A", layerId: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "B", layerId: "L2" }),
      ],
      { layers: [layerOf("0"), layerOf("L1"), layerOf("L2")] }
    )
    apart.command("FILLET")
    answer(apart, "20,0", "20,10")
    expect(capOf(apart).layerId).toBe(
      apart.runtime.document.getCurrentLayerId()
    )

    const thick = fillet(
      [
        { ...lineOf(p(0, 0), p(100, 0), { id: "A" }), thickness: 5 },
        shifted()[1],
      ],
      "20,0",
      "120,10"
    )
    expect(capOf(thick).thickness ?? 0).toBe(0)
  })

  it("caps two a mode finds at once from the newer, its end nearer the origin", () => {
    const window = fillet(shifted(), "W", "-10,-5", "160,15")
    expectCap(window, p(30, 5), 5, 90, 270)
    expectLine(window, "B", p(30, 10), p(150, 10))
    expectLine(window, "A", p(30, 0), p(100, 0))

    const older = fillet([shifted()[1], shifted()[0]], "W", "160,15", "-10,-5")
    expectCap(older, p(0, 5), 5, 90, 270)
    expectLine(older, "B", p(0, 10), p(150, 10))

    const left = fillet(negative(), "C", "-140,15", "-310,-5")
    expectCap(left, p(-150, 5), 5, 270, 90)
    expectLine(left, "A", p(-300, 0), p(-150, 0))

    // The second's thickness (corners/p360): the older's, the one moved
    // (acc/g3).
    const thick = fillet(
      [{ ...shifted()[0], thickness: 5 } as LineEntity, shifted()[1]],
      "W",
      "-10,-5",
      "160,15"
    )
    expect(capOf(thick).thickness).toBe(5)
  })

  it("reads a fence's crossing as a pick, and a line found alone from the origin", () => {
    const fence = fillet(negative(), "F", "-260,-5", "-260,15", "")
    expectCap(fence, p(-270, 5), 5, 90, 270)
    expectLine(fence, "A", p(-270, 0), p(-200, 0))

    const alone = fillet(shifted(), "W", "-10,-5", "110,5", "120,10")
    expectCap(alone, p(0, 5), 5, 90, 270)
    expectLine(alone, "B", p(0, 10), p(150, 10))

    const last = fillet(negative(), "L", "-280,0")
    expectCap(last, p(-150, 5), 5, 270, 90)
    expectLine(last, "A", p(-300, 0), p(-150, 0))
  })

  it("caps pair after pair in Multiple", () => {
    const cad = fillet(
      [...equal(), lineOf(p(0, 30), p(100, 30), { id: "C" })],
      "M",
      "20,0",
      "20,10",
      "80,10",
      "80,30",
      ""
    )
    const arcs = cad.entities().filter((e): e is ArcEntity => e.type === "arc")
    expect(arcs.map((a) => [a.center.x, a.center.y, a.radius])).toEqual([
      [0, 5, 5],
      [100, 20, 10],
    ])
  })

  it("is answered in Autodesk's Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "A" }),
        lineOf(p(120, 0), p(200, 0), { id: "B" }),
        lineOf(p(0, 10), p(100, 10), { id: "C" }),
      ],
    })
    cad.command("EMPALME")
    answer(cad, "L", "80,0", "150,0", "20,0", "20,10")
    expect(cad.commandLog()).toContain(
      "Las líneas colineales no pueden ser unidos con empalme."
    )
    expectCap(cad, p(0, 5), 5, 90, 270)
  })
})
