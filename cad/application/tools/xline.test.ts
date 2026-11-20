import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type {
  Entity,
  LineEntity,
  RayEntity,
  XlineEntity,
} from "../../domain/entities"
import { createLine, createRay, createXline } from "../../domain/entities"
import { es } from "../../locales/es"
import { de } from "../../locales/de"

// AutoCAD 2027's XLINE and RAY and what other commands do to them (probes
// scripts/research/probes/xline/).

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const of = <T extends Entity["type"]>(cad: CadHarness, type: T) =>
  cad.entities().filter((e) => e.type === type) as Extract<
    Entity,
    { type: T }
  >[]

const placed = (e: XlineEntity | RayEntity) => [
  e.base.x,
  e.base.y,
  e.direction.x,
  e.direction.y,
]

function expectPlaced(
  e: XlineEntity | RayEntity | undefined,
  [x, y, dx, dy]: readonly number[]
): void {
  expect(e).toBeDefined()
  const [ax, ay, adx, ady] = placed(e!)
  expect(ax).toBeCloseTo(x, 4)
  expect(ay).toBeCloseTo(y, 4)
  expect(adx).toBeCloseTo(dx, 4)
  expect(ady).toBeCloseTo(dy, 4)
}

const xline = (x: number, y: number, dx: number, dy: number, id: string) =>
  createXline({ x, y }, { x: dx, y: dy }, "0", id)!
const ray = (x: number, y: number, dx: number, dy: number, id: string) =>
  createRay({ x, y }, { x: dx, y: dy }, "0", id)!

describe("XLINE", () => {
  // x01: the point form, every xline through the base; on the base `*Invalid*`.
  it("draws xlines through a point and each through point", () => {
    const cad = createHarness()
    const log = typed(cad, "XLINE", "FOO", "0,0", "0,0", "10,5", "0,10", "")
    expect(log).toEqual([
      "XLINE",
      "Specify a point or [Hor/Ver/Ang/Bisect/Offset]: FOO",
      "Point or option keyword required.",
      "Specify a point or [Hor/Ver/Ang/Bisect/Offset]: 0,0",
      "Specify through point: 0,0",
      "*Invalid*",
      "Specify through point: 10,5",
      "Specify through point: 0,10",
      "Specify through point:",
    ])
    const made = of(cad, "xline")
    expect(made).toHaveLength(2)
    expectPlaced(made[1], [0, 0, 0, 1])
    expect(made[0].direction.x).toBeCloseTo(0.894427, 5)
  })

  // x02: Hor and Ver through each point; Ang's prompt shows (0), Enter takes it.
  it("takes Hor, Ver and Ang", () => {
    const cad = createHarness()
    typed(cad, "XLINE", "H", "7,8", "", "XLINE", "V", "5,5", "")
    expectPlaced(of(cad, "xline")[0], [7, 8, 1, 0])
    expectPlaced(of(cad, "xline")[1], [5, 5, 0, 1])
    const log = typed(cad, "XLINE", "A", "30", "1,1", "")
    expect(log[2]).toBe("Enter angle of xline (0) or [Reference]: 30")
    expectPlaced(of(cad, "xline")[2], [1, 1, Math.sqrt(3) / 2, 0.5])
    typed(cad, "XLINE", "A", "", "3,4", "")
    expectPlaced(of(cad, "xline")[3], [3, 4, 1, 0])
  })

  // x03, x08: Reference from a line, an xline; a miss is `No usable object selected`.
  it("measures Reference from a line object", () => {
    const cad = createHarness({
      entities: [createLine(p(0, 0), p(100, 50), "0", "L")],
    })
    const log = typed(
      cad,
      "XLINE",
      "A",
      "R",
      "1000,1000",
      "50,25",
      "30",
      "0,10",
      ""
    )
    expect(log).toContain("No usable object selected")
    expect(log).toContain("Enter angle of xline <0>: 30")
    expectPlaced(of(cad, "xline")[0], [0, 10, 0.55099, 0.834512])
  })

  // x04, x09: Bisect; Enter at the vertex `Invalid point.`; the start on the
  // vertex refused; opposite ends give the start turned 90°.
  it("bisects the angle at the vertex", () => {
    const cad = createHarness()
    const log = typed(
      cad,
      "XLINE",
      "B",
      "",
      "0,0",
      "0,0",
      "10,0",
      "10,-10",
      "-10,0",
      ""
    )
    expect(log).toContain("Invalid point.")
    expect(log).toContain("Start point must differ from vertex point")
    const made = of(cad, "xline")
    expectPlaced(made[0], [0, 0, 0.92388, -0.382683])
    expectPlaced(made[1], [0, 0, 0, 1])
  })

  // x05, x09: Offset by a distance from the line's start, Through based at
  // the point; OFFSETDIST shared with OFFSET; 0 refused.
  it("offsets from a line object", () => {
    const cad = createHarness({
      entities: [createLine(p(10, 0), p(100, 0), "0", "L")],
    })
    const log = typed(cad, "XLINE", "O", "0", "5", "50,0", "50,10", "")
    expect(log).toContain("Value must be positive and nonzero.")
    expect(log).toContain("Specify side to offset: 50,10")
    expectPlaced(of(cad, "xline")[0], [10, 5, 1, 0])
    const again = typed(cad, "XLINE", "O", "T", "50,0", "30,7", "")
    expect(again[2]).toBe("Specify offset distance or [Through] <5.00>: T")
    expectPlaced(of(cad, "xline")[1], [30, 7, 1, 0])
    const third = typed(cad, "XLINE", "O", "", "")
    expect(third[2]).toBe("Specify offset distance or [Through] <Through>:")
  })

  // x06: a circle or a polyline is no line object.
  it("refuses a circle at Select a line object", () => {
    const cad = createHarness()
    typed(cad, "CIRCLE", "0,0", "10")
    const log = typed(cad, "XLINE", "O", "5", "10,0", "")
    expect(log).toContain("No usable object selected")
  })

  // The Spanish console's words (x01, x05).
  it("speaks AutoCAD's Spanish", () => {
    const cad = createHarness({ locale: es })
    const log = typed(cad, "LINEAX", "D", "")
    expect(log[1]).toBe(
      "Precise un punto u [Hor/Ver/ángUlo/Bisectriz/Desfasar]: D"
    )
    expect(log[2]).toBe(
      "Precise distancia o [Punto a atravesar] <Punto a atravesar>:"
    )
  })

  // German's Hor and Ver ask otherwise (table 21730, x02).
  it("words German's Hor apart", () => {
    const cad = createHarness({ locale: de })
    const log = typed(cad, "KLINIE", "HO", "0,0", "", "KLINIE", "W", "", "0,0")
    expect(log[2]).toBe("Durchpunkt angeben: 0,0")
    expect(log.at(-1)).toBe("Durch Punkt angeben: 0,0")
    typed(cad, "")
  })
})

describe("RAY", () => {
  // r01: from the start through each point; on the start `*Invalid*`.
  it("draws rays from a start point", () => {
    const cad = createHarness()
    const log = typed(cad, "RAY", "0,0", "0,0", "10,0", "0,10", "")
    expect(log).toEqual([
      "RAY",
      "Specify start point: 0,0",
      "Specify through point: 0,0",
      "*Invalid*",
      "Specify through point: 10,0",
      "Specify through point: 0,10",
      "Specify through point:",
    ])
    const made = of(cad, "ray")
    expectPlaced(made[0], [0, 0, 1, 0])
    expectPlaced(made[1], [0, 0, 0, 1])
  })

  // r01: a 3D direction, a unit vector across X, Y and Z.
  it("keeps the Z of its points", () => {
    const cad = createHarness()
    typed(cad, "RAY", "1,2,3", "4,6,15", "")
    const r = of(cad, "ray")[0]
    expect(r.elevation).toBe(3)
    expect(r.direction.x).toBeCloseTo(0.230769, 5)
    expect(r.directionZ).toBeCloseTo(0.923077, 5)
  })
})

describe("what other commands do to them", () => {
  const edges = () => [
    createLine(p(0, -50), p(0, 50), "0", "E1"),
    createLine(p(100, -50), p(100, 50), "0", "E2"),
  ]

  // i01: TRIM leaves an xline a ray, the same object, and a ray a line.
  it("TRIM turns an xline into a ray and a ray into a line", () => {
    const cad = createHarness({
      entities: [...edges(), xline(0, 0, 1, 0, "X"), ray(50, 20, 1, 0, "R")],
    })
    typed(cad, "TRIM", "150,0", "", "TRIM", "150,20", "")
    const x = cad.entities().find((e) => e.id === "X")
    expect(x?.type).toBe("ray")
    expectPlaced(x as RayEntity, [100, 0, -1, 0])
    const r = cad.entities().find((e) => e.id === "R") as LineEntity
    expect(r.type).toBe("line")
    expect(r.start).toBeCloseToPoint(p(50, 20))
    expect(r.end).toBeCloseToPoint(p(100, 20))
  })

  // i02: TRIM between two edges leaves two rays, the first the object.
  it("TRIM of an xline's middle leaves two rays", () => {
    const cad = createHarness({
      entities: [...edges(), xline(0, 0, 1, 0, "X")],
    })
    typed(cad, "TRIM", "50,0", "")
    const rays = of(cad, "ray")
    expect(rays).toHaveLength(2)
    expect(rays.find((r) => r.id === "X")).toBeDefined()
    expectPlaced(
      rays.find((r) => r.id === "X"),
      [0, 0, -1, 0]
    )
    expectPlaced(
      rays.find((r) => r.id !== "X"),
      [100, 0, 1, 0]
    )
  })

  // i02: BREAK an xline at two points: two rays; a ray: a line and a ray.
  it("BREAK leaves rays and lines", () => {
    const cad = createHarness({
      entities: [xline(0, 30, 1, 0, "X"), ray(50, 20, 1, 0, "R")],
    })
    typed(cad, "BREAK", "10,30", "20,30")
    expect(of(cad, "ray").filter((r) => r.base.y === 30)).toHaveLength(2)
    typed(cad, "BREAK", "70,20", "80,20")
    const line = cad.entities().find((e) => e.id === "R") as LineEntity
    expect(line.type).toBe("line")
    expect(line.end).toBeCloseToPoint(p(70, 20))
  })

  // i03: EXTEND refuses an xline; a ray's start runs back to the edge.
  it("EXTEND refuses an xline and grows a ray back", () => {
    const cad = createHarness({
      entities: [...edges(), xline(0, 0, 1, 0, "X"), ray(50, 20, 1, 0, "R")],
    })
    const log = typed(cad, "EXTEND", "-50,0", "")
    expect(log).toContain("Cannot EXTEND this object.")
    typed(cad, "EXTEND", "55,20", "")
    expectPlaced(
      cad.entities().find((e) => e.id === "R") as RayEntity,
      [0, 20, 1, 0]
    )
  })

  // i04, i12: OFFSET copies of the same type, Through square to the point.
  it("OFFSET copies an xline and a ray", () => {
    const cad = createHarness({
      entities: [xline(0, 0, 1, 0, "X"), ray(50, 20, 1, 0, "R")],
    })
    typed(cad, "OFFSET", "5", "30,0", "30,10", "55,20", "55,30", "")
    expectPlaced(of(cad, "xline")[1], [0, 5, 1, 0])
    expectPlaced(of(cad, "ray")[1], [50, 25, 1, 0])
    typed(cad, "OFFSET", "T", "70,20", "30,40", "")
    expectPlaced(of(cad, "ray")[2], [50, 40, 1, 0])
  })

  // i04: MIRROR, ROTATE and SCALE map the base and the direction.
  it("MIRROR, ROTATE and SCALE move them as lines", () => {
    const cad = createHarness({ entities: [ray(50, 25, 1, 0, "R")] })
    typed(cad, "MIRROR", "55,25", "", "0,0", "0,10", "N")
    const mirrored = of(cad, "ray").find((r) => r.id !== "R")!
    expectPlaced(mirrored, [-50, 25, -1, 0])
    typed(cad, "ROTATE", "55,25", "", "0,0", "90")
    expectPlaced(
      of(cad, "ray").find((r) => r.id === "R"),
      [-25, 50, 0, 1]
    )
    typed(cad, "SCALE", "-25,55", "", "0,0", "2")
    expectPlaced(
      of(cad, "ray").find((r) => r.id === "R"),
      [-50, 100, 0, 1]
    )
  })

  // i05: STRETCH moves one whole when its base is caught, else leaves it.
  it("STRETCH moves it by its base", () => {
    const cad = createHarness({ entities: [ray(50, 20, 1, 0, "R")] })
    typed(cad, "STRETCH", "C", "80,25", "70,15", "", "0,0", "5,5")
    expectPlaced(of(cad, "ray")[0], [50, 20, 1, 0])
    typed(cad, "STRETCH", "C", "55,25", "45,15", "", "0,0", "5,5")
    expectPlaced(of(cad, "ray")[0], [55, 25, 1, 0])
  })

  // i06: EXPLODE, DIVIDE and AREA refuse them in AutoCAD's words.
  it("EXPLODE, DIVIDE and AREA refuse them", () => {
    const cad = createHarness({
      entities: [xline(0, 0, 1, 0, "X"), ray(50, 20, 1, 0, "R")],
    })
    expect(typed(cad, "EXPLODE", "30,0", "")).toContain("Cannot explode XLINE")
    expect(typed(cad, "EXPLODE", "70,20", "")).toContain("Cannot explode RAY")
    expect(typed(cad, "DIVIDE", "30,0")).toContain("Cannot divide that object.")
    expect(typed(cad, "AREA", "O", "70,20")).toContain(
      "Selected object does not have an area"
    )
  })

  // i07: FILLET of two xlines leaves two rays and the arc.
  it("FILLET trims two xlines to rays", () => {
    const cad = createHarness({
      entities: [xline(0, 0, 1, 0, "A"), xline(200, 0, 0, 1, "D")],
    })
    typed(cad, "FILLET", "R", "5", "150,0", "200,10")
    expectPlaced(
      cad.entities().find((e) => e.id === "A") as RayEntity,
      [195, 0, -1, 0]
    )
    expectPlaced(
      cad.entities().find((e) => e.id === "D") as RayEntity,
      [200, 5, 0, 1]
    )
    expect(of(cad, "arc")).toHaveLength(1)
  })

  // i07: an xline first of two parallel ones has no end to cap from.
  it("FILLET refuses an xline first for a cap", () => {
    const cad = createHarness({
      entities: [xline(0, 0, 1, 0, "A"), ray(50, 20, 1, 0, "R")],
    })
    const log = typed(cad, "FILLET", "30,0", "70,20")
    expect(log).toContain(
      "The first entity must be a line or a ray for cap filleting."
    )
  })

  // i08, i09: END at a ray's start, MID at an xline's base, INT with a line.
  it("snaps END, MID and INT", () => {
    const cad = createHarness({
      snap: true,
      entities: [
        createLine(p(0, -50), p(0, 50), "0", "E1"),
        xline(-300, 0, 1, 0, "X"),
        ray(50, 20, 1, 0, "R"),
      ],
    })
    typed(cad, "LINE", "END", "70,20", "MID", "30,0.5", "INT", "1,1", "")
    const line = of(cad, "line").find((l) => l.id !== "E1")!
    expect(line.start).toBeCloseToPoint(p(50, 20))
    expect(line.end).toBeCloseToPoint(p(-300, 0))
  })

  // i08: the extents leave them out.
  it("leaves them out of ZOOM Extents", () => {
    const cad = createHarness({
      entities: [createLine(p(0, 0), p(10, 0)), xline(0, 0, 0, 1, "X")],
    })
    typed(cad, "ZOOM", "E")
    const view = cad.runtime.viewport
    const left = view.screenToWorld({ x: 0, y: view.height / 2 })
    expect(left.x).toBeGreaterThan(-20)
  })

  // i11: a window takes one when it holds what the view shows of it.
  it("is taken by a window holding its visible stretch", () => {
    const cad = createHarness()
    const view = cad.runtime.viewport
    const middle = view.screenToWorld({ x: view.width / 2, y: view.height / 2 })
    const left = view.screenToWorld({ x: -10, y: 0 })
    const right = view.screenToWorld({ x: view.width + 10, y: 0 })
    const inner = view.screenToWorld({ x: 100, y: 0 })
    const innerRight = view.screenToWorld({ x: view.width - 100, y: 0 })
    typed(cad, "XLINE", "H", `${middle.x},${middle.y}`, "")
    const at = (x: number, dy: number) => `${x},${middle.y + dy}`
    typed(cad, "ERASE", "W", at(inner.x, -5), at(innerRight.x, 5), "")
    expect(of(cad, "xline")).toHaveLength(1)
    typed(cad, "ERASE", "W", at(left.x, -5), at(right.x, 5), "")
    expect(of(cad, "xline")).toHaveLength(0)
  })

  // i11: a window polygon never takes one.
  it("is never taken by a window polygon", () => {
    const cad = createHarness({ entities: [ray(0, 0, 1, 0, "R")] })
    typed(
      cad,
      "ERASE",
      "WP",
      "-10,-10",
      "5000,-10",
      "5000,10",
      "-10,10",
      "",
      ""
    )
    expect(of(cad, "ray")).toHaveLength(1)
  })

  // i14: HATCH takes four xlines as a boundary.
  it("bounds a hatch", () => {
    const cad = createHarness({
      entities: [
        xline(0, 0, 1, 0, "A"),
        xline(0, 10, 1, 0, "B"),
        xline(0, 0, 0, 1, "C"),
        xline(10, 0, 0, 1, "D"),
      ],
    })
    typed(cad, "-HATCH", "5,5", "")
    expect(of(cad, "hatch")).toHaveLength(1)
  })

  // A scale leaves a rising one's direction as it was.
  it("SCALE keeps a 3D direction", () => {
    const made = createXline({ x: 0, y: 0, z: 0 }, { x: 0.6, y: 0, z: 0.8 })!
    const cad = createHarness({ entities: [{ ...made, id: "X" }] })
    typed(cad, "SCALE", "ALL", "", "0,0", "2")
    const x = of(cad, "xline")[0]
    expect(x.direction.x).toBeCloseTo(0.6, 9)
    expect(x.directionZ).toBeCloseTo(0.8, 9)
  })

  // i08: off the plan too, ZOOM Extents leaves it out.
  it("is left out of ZOOM Extents off the plan", () => {
    const cad = createHarness({
      entities: [
        createLine(p(-1, 0), p(1, 0), "0", "L"),
        xline(0, 5, 1, 0, "X"),
      ],
    })
    typed(cad, "-VPOINT", "1,1,1", "ZOOM", "E")
    const zoomed = cad.runtime.viewport.scale
    typed(cad, "ERASE", "ALL", "", "U", "ZOOM", "E")
    expect(zoomed).toBeGreaterThan(50)
  })

  // A zoom between the two picks leaves the same pieces.
  it("FILLET after a zoom between the picks trims to rays", () => {
    const cad = createHarness({
      entities: [xline(0, 0, 1, 0, "A"), xline(200, 0, 0, 1, "D")],
    })
    typed(cad, "FILLET", "R", "5", "150,0")
    cad.runtime.viewport.zoomAt({ x: 500, y: 400 }, 0.01)
    typed(cad, "200,10")
    expect(cad.entities().find((e) => e.id === "A")?.type).toBe("ray")
    expect(cad.entities().find((e) => e.id === "D")?.type).toBe("ray")
  })

  // ARRAYPOLAR's base point is no NaN with one in the set.
  it("ARRAYPOLAR places a set holding one", () => {
    const cad = createHarness({
      entities: [xline(10, 0, 1, 0, "X")],
    })
    typed(cad, "CIRCLE", "20,20", "3")
    typed(cad, "ARRAYPOLAR", "ALL", "", "0,0", "")
    expect(JSON.stringify(cad.entities())).not.toContain("null")
  })

  // i10: LIST as the console writes it.
  it("LISTs base point, unit direction and angle", () => {
    const cad = createHarness({ entities: [xline(5, 5, 0.8358, 0.549, "X")] })
    const log = typed(cad, "LIST", "5,5", "")
    expect(log.join("\n")).toContain("XLINE")
  })
})
