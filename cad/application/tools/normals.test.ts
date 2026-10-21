import { describe, expect, it } from "vitest"
import { length3, sub3, type Vec3 } from "../../geometry/Vec3"
import {
  entityNormal,
  entityPointToWorld,
  lineEndZ,
  lineStartZ,
  withNormal,
  type Entity,
  type LineEntity,
} from "../../domain/entities"
import { createHarness, type CadHarness } from "../../../test/harness"
import { circleOf, deg, lineOf, p, polylineOf } from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"

// Its OCS X is the world's X and its OCS Y the world's Z.
const FACING_FRONT = { x: 0, y: -1, z: 0 }

function standing<T extends Entity>(entity: T): T {
  return withNormal(entity, FACING_FRONT)
}

const CIRCLE = standing(circleOf(p(100, 50), 50, { id: "C" }))

function ellipses(cad: CadHarness) {
  return cad
    .scene()
    .primitives.filter((primitive) => primitive.kind === "ellipse")
}

function rows(cad: CadHarness) {
  return (cad.state().properties.info?.groups ?? []).flatMap((group) =>
    group.rows.map((row) => [row.id, row.value] as const)
  )
}

function ends(line: LineEntity) {
  return [
    { ...line.start, z: lineStartZ(line) },
    { ...line.end, z: lineEndZ(line) },
  ]
}

function expectAt(actual: Vec3 | undefined, expected: Vec3) {
  expect(actual?.x).toBeCloseTo(expected.x, 9)
  expect(actual?.y).toBeCloseTo(expected.y, 9)
  expect(actual?.z).toBeCloseTo(expected.z, 9)
}

describe("an object with a normal of its own", () => {
  it("is drawn in its plane: edge-on in plan, round from the front", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    const [plan] = ellipses(cad)
    if (plan?.kind !== "ellipse") throw new Error("no ellipse")
    expect(Math.min(plan.radiusX, plan.radiusY)).toBeLessThan(0.02)
    expect(plan.center).toBeCloseToPoint(
      cad.toScreen({ x: 100, y: 0, z: 50 }),
      6
    )

    cad.command("-VIEW").option("Orthographic").option("Front")
    const [front] = ellipses(cad)
    if (front?.kind !== "ellipse") throw new Error("no ellipse")
    expect(front.radiusY / front.radiusX).toBeCloseTo(1, 6)
  })

  it("is picked in plan where it is drawn, not where its points read", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    cad.click(p(60, 0))
    expect(cad.selectedIds()).toEqual(["C"])

    const flat = createHarness({ entities: [CIRCLE] })
    flat.click(p(100, 100))
    expect(flat.selectedIds()).toEqual([])
  })

  it("is window-selected by its outline on screen", () => {
    const cad = createHarness({ entities: [CIRCLE] })

    cad.click(p(40, -10)).click(p(160, 10))

    expect(cad.selectedIds()).toEqual(["C"])
  })

  it("offers its center in space, in plan and off it", () => {
    const cad = createHarness({ entities: [CIRCLE], snap: true })
    cad.command("LINE").moveTo(p(100, 0))
    expect(cad.state().snap?.type).toBe("center")
    expectAt(cad.state().snap?.point, { x: 100, y: 0, z: 50 })
    cad.escape()

    cad.command("VPOINT").type("1,-1,1").enter()
    cad.command("LINE").moveTo({ x: 100, y: 0, z: 50 })
    expect(cad.state().snap?.type).toBe("center")
    expectAt(cad.state().snap?.point, { x: 100, y: 0, z: 50 })
  })

  it("turns its normal with ROTATE", () => {
    const cad = createHarness({ entities: [CIRCLE] })
    cad.select("C")

    cad.command("ROTATE").click(p(0, 0)).type("90").enter()

    const rotated = cad.latest()
    const normal = entityNormal(rotated)
    expect(normal.x).toBeCloseTo(1, 12)
    expect(normal.y).toBeCloseTo(0, 12)
    expect(normal.z).toBeCloseTo(0, 12)
    if (rotated.type !== "circle") throw new Error("not a circle")
    expectAt(entityPointToWorld(rotated, rotated.center), {
      x: 0,
      y: 100,
      z: 50,
    })
  })

  it("explodes, as a polyline, into lines in the WCS", () => {
    const polyline = standing(
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P" })
    )
    const cad = createHarness({ entities: [polyline] })
    cad.select("P")

    cad.command("EXPLODE")

    const lines = cad
      .entities()
      .filter((entity): entity is LineEntity => entity.type === "line")
    expect(lines.map(ends)).toEqual([
      [
        { x: 0, y: 0, z: 0 },
        { x: 100, y: 0, z: 0 },
      ],
      [
        { x: 100, y: 0, z: 0 },
        { x: 100, y: 0, z: 50 },
      ],
    ])
  })

  it("shows its center in the UCS and its normal in the palette", () => {
    const cad = createHarness({ entities: [CIRCLE] })
    cad.select("C")

    expect(rows(cad)).toEqual(
      expect.arrayContaining([
        ["normalX", "0.00"],
        ["normalY", "-1.00"],
        ["normalZ", "0.00"],
        ["centerX", "100.00"],
        ["centerY", "0.00"],
        ["centerZ", "50.00"],
      ])
    )

    expect(cad.runtime.setSelectionProperty("centerZ", "80")).toBe(true)
    const moved = cad.latest()
    if (moved.type !== "circle") throw new Error("not a circle")
    expectAt(entityPointToWorld(moved, moved.center), { x: 100, y: 0, z: 80 })
    expect(entityNormal(moved)).toEqual(FACING_FRONT)
  })
})

// AutoCAD 2023's console (acc/f19–f22), with UCS X 45 drawn and the WCS
// back: FILLET and CHAMFER work a polyline in its tilted plane, within it or
// joined with a line lying in it; a line off it is non coplanar.
describe("FILLET and CHAMFER on a polyline in a tilted plane", () => {
  const TILTED = { x: 0, y: -Math.SQRT1_2, z: Math.SQRT1_2 }
  /** 0,0 → 100,0 → 100,50 in its OCS, whose X is the world's. */
  const ell = () =>
    withNormal(
      polylineOf([p(0, 0), p(100, 0), p(100, 50)], { id: "P1" }),
      TILTED
    )
  /** 50,100 → 150,100 in the polyline's plane. */
  const inPlane = () => ({
    ...lineOf(p(50, 100 * Math.SQRT1_2), p(150, 100 * Math.SQRT1_2), {
      id: "L1",
    }),
    elevation: 100 * Math.SQRT1_2,
  })
  const only = (cad: CadHarness) => {
    const [poly] = cad.entities()
    if (poly?.type !== "polyline") throw new Error("not a polyline")
    return poly
  }

  it("rounds and bevels two of its segments in its plane", () => {
    const fillet = createHarness({ entities: [ell()] })
    fillet.command("FILLET").option("Radius").type("5").enter()
    fillet.click(p(50, 0)).click(p(100, 20))
    const rounded = only(fillet)
    expect(entityNormal(rounded)).toEqual(TILTED)
    expect(rounded.vertices).toBeCloseToPoints([
      p(0, 0),
      p(95, 0),
      p(100, 5),
      p(100, 50),
    ])
    expect(rounded.bulges?.[1]).toBeCloseTo(Math.tan(Math.PI / 8), 9)
    expectAt(entityPointToWorld(rounded, rounded.vertices[2]), {
      x: 100,
      y: 5 * Math.SQRT1_2,
      z: 5 * Math.SQRT1_2,
    })

    const chamfer = createHarness({ entities: [ell()] })
    chamfer.command("CHAMFER").option("Distance").type("5").enter().enter()
    chamfer.click(p(50, 0)).click(p(100, 20))
    expect(only(chamfer).vertices).toBeCloseToPoints([
      p(0, 0),
      p(95, 0),
      p(100, 5),
      p(100, 50),
    ])
  })

  it("joins a line lying in its plane, and not one off it", () => {
    const cad = createHarness({ entities: [ell(), inPlane()] })
    cad.command("FILLET").option("Radius").type("5").enter()
    cad.click(p(100, 20)).click(p(80, 100 * Math.SQRT1_2))
    const joined = only(cad)
    expect(cad.entities()).toHaveLength(1)
    expect(joined.id).toBe("P1")
    expect(entityNormal(joined)).toEqual(TILTED)
    expect(joined.vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 95),
      p(95, 100),
      p(50, 100),
    ])
    expectAt(entityPointToWorld(joined, joined.vertices[2]), {
      x: 100,
      y: 67.17514421272201,
      z: 67.17514421272201,
    })

    const off = createHarness({
      entities: [ell(), lineOf(p(50, 100), p(150, 100))],
    })
    off.command("FILLET").option("Radius").type("5").enter()
    off.click(p(100, 20)).click(p(100, 100))
    expect(off.commandLog().at(-1)).toBe("Line and polyline are non coplanar.")
    expect(off.entities()).toHaveLength(2)
  })
})

// AutoCAD 2023's console (acc/w7, w9, a1–a7, c1–c3, d1–d2 of 2026-10-14),
// drawn in UCS X 45 with the WCS back and the picks typed in plan: FILLET
// rounds an ARC or a CIRCLE with a line, an arc or a circle lying in its
// tilted plane in that plane, as it does in plan. Ends and centres are LIST's
// in the WCS, angles LIST's in UCS X 45, which is the plane's OCS.
describe("FILLET of an ARC or a CIRCLE in a tilted plane the other shares", () => {
  const TILTED = { x: 0, y: -Math.SQRT1_2, z: Math.SQRT1_2 }
  const answer = (cad: CadHarness, ...texts: string[]) => {
    for (const text of texts) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    return cad
  }
  /** What the commands draw in UCS X 45, the WCS restored. */
  const drawn = (...steps: string[][]) => {
    const cad = createHarness()
    for (const [command, ...rest] of [
      ["UCS", "X", "45"],
      ...steps,
      ["UCS", "W"],
    ]) {
      cad.command(command)
      answer(cad, ...rest)
    }
    return cad.entities()
  }
  const LINE = ["LINE", "0,0", "100,0", ""]
  const CIRCLE = ["CIRCLE", "50,40", "20"]
  const fillet = (entities: Entity[], ...texts: string[]) => {
    const cad = createHarness({ entities })
    cad.command("FILLET")
    return answer(cad, ...texts)
  }
  const near = (actual: Vec3, expected: Vec3) => {
    expect(actual.x).toBeCloseTo(expected.x, 4)
    expect(actual.y).toBeCloseTo(expected.y, 4)
    expect(actual.z).toBeCloseTo(expected.z, 4)
  }
  const lineIn = (cad: CadHarness, from: Vec3, to: Vec3) => {
    const line = cad.entities().find((e) => e.type === "line")
    if (line?.type !== "line") throw new Error("no line")
    const [start, end] = ends(line)
    near(start, from)
    near(end, to)
  }
  /** The arc of `radius` centred at `center`, its angles in the plane's OCS. */
  const arcIn = (
    cad: CadHarness,
    center: Vec3,
    radius: number,
    start: number,
    end: number
  ) => {
    const arc = cad
      .entities()
      .find(
        (e) =>
          e.type === "arc" &&
          e.radius === radius &&
          length3(sub3(entityPointToWorld(e, e.center), center)) < 1e-3
      )
    if (arc?.type !== "arc") throw new Error("no arc")
    near(entityPointToWorld(arc, arc.center), center)
    expect(arc.startAngle).toBeCloseToAngle(deg(start), 4)
    expect(arc.endAngle).toBeCloseToAngle(deg(end), 4)
    near(entityNormal(arc), TILTED)
  }

  it("rounds a line and a circle in their plane, picked either way round", () => {
    const before = drawn(LINE, CIRCLE)
    const cad = fillet(before, "R", "15", "70,0", "50,14.1421")
    expect(cad.entities()).toContainEqual(before[1])
    lineIn(cad, { x: 74.4949, y: 0, z: 0 }, { x: 100, y: 0, z: 0 })
    arcIn(cad, { x: 74.4949, y: 10.6066, z: 10.6066 }, 15, 134.4153, 270)

    const back = drawn(["LINE", "100,0", "0,0", ""], CIRCLE)
    const reversed = fillet(back, "R", "15", "50,14.1421", "30,0")
    lineIn(reversed, { x: 25.5051, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })
    arcIn(reversed, { x: 25.5051, y: 10.6066, z: 10.6066 }, 15, 270, 45.5847)
  })

  it("trims an arc to the part it runs on from the fillet", () => {
    const arc = ["ARC", "C", "50,40", "30,40", "70,40"]
    const cad = fillet(drawn(LINE, arc), "R", "15", "30,0", "50,14.1421")
    lineIn(cad, { x: 0, y: 0, z: 0 }, { x: 25.5051, y: 0, z: 0 })
    arcIn(cad, { x: 50, y: 28.2843, z: 28.2843 }, 20, 180, 225.5847)
    arcIn(cad, { x: 25.5051, y: 10.6066, z: 10.6066 }, 15, 270, 45.5847)
  })

  it("meets at the crossing at radius 0, and leaves two circles as they are", () => {
    const circle = fillet(
      drawn(LINE, ["CIRCLE", "50,10", "20"]),
      "80,0",
      "50,21.2132"
    )
    lineIn(circle, { x: 67.3205, y: 0, z: 0 }, { x: 100, y: 0, z: 0 })
    expect(circle.entities()).toHaveLength(2)

    const arc = ["ARC", "C", "50,10", "30,10", "70,10"]
    const cut = fillet(drawn(LINE, arc), "80,0", "50,-7.0711")
    lineIn(cut, { x: 67.3205, y: 0, z: 0 }, { x: 100, y: 0, z: 0 })
    arcIn(cut, { x: 50, y: 7.0711, z: 7.0711 }, 20, 180, 330)

    const two = drawn(["CIRCLE", "20,40", "20"], CIRCLE)
    const left = fillet(two, "0,28.2843", "70,28.2843")
    expect(left.entities()).toEqual(two)
    expect(left.commandLog().at(-1)).toBe(
      "Select second object or shift-select to apply corner or [Radius]: 70,28.2843"
    )
    expect(left.activeToolId()).toBe("select")
  })

  it("rounds two circles or two arcs", () => {
    const circles = drawn(["CIRCLE", "20,40", "20"], ["CIRCLE", "80,40", "20"])
    const cad = fillet(circles, "R", "15", "40,28.2843", "60,28.2843")
    arcIn(cad, { x: 50, y: 41.0318, z: 41.0318 }, 15, 211.0027, 328.9973)

    const arcs = drawn(
      ["ARC", "C", "20,40", "40,40", "0,40"],
      ["ARC", "C", "80,40", "100,40", "60,40"]
    )
    const cut = fillet(arcs, "R", "15", "20,42.4264", "80,42.4264")
    arcIn(cut, { x: 20, y: 28.2843, z: 28.2843 }, 20, 31.0027, 180)
    arcIn(cut, { x: 80, y: 28.2843, z: 28.2843 }, 20, 0, 148.9973)
    arcIn(cut, { x: 50, y: 41.0318, z: 41.0318 }, 15, 211.0027, 328.9973)
  })

  it("repeats in Multiple", () => {
    const entities = drawn(
      LINE,
      CIRCLE,
      ["LINE", "0,100", "100,100", ""],
      ["CIRCLE", "50,140", "20"]
    )
    const cad = fillet(entities, "M", "R", "15", "70,0", "50,14.1421")
    answer(cad, "70,70.7107", "50,84.8528", "")
    arcIn(cad, { x: 74.4949, y: 10.6066, z: 10.6066 }, 15, 134.4153, 270)
    arcIn(cad, { x: 74.4949, y: 81.3173, z: 81.3173 }, 15, 134.4153, 270)
    expect(cad.activeToolId()).toBe("select")
  })

  it("previews the fillet with the pointer on the other", () => {
    const cad = createHarness({ entities: drawn(LINE, CIRCLE) })
    cad.command("FILLET").option("Radius").type("15").enter()
    cad.click(p(70, 0)).moveTo(p(50, 14.1421))
    const [arc] = cad
      .scene()
      .primitives.filter(
        (primitive) => primitive.kind === "ellipse" && primitive.radiusX === 15
      )
    if (arc?.kind !== "ellipse") throw new Error("no preview")
    expect(arc.stroke?.color).toBe(THEME.rubberBand)
    expect(arc.center).toBeCloseToPoint(
      cad.toScreen({ x: 74.4949, y: 10.6066, z: 10.6066 }),
      2
    )
  })

  it("says a line off the plane is not coplanar, picked either way round", () => {
    const off = drawn(CIRCLE)
    off.push(lineOf(p(0, 50), p(100, 50)))
    for (const picks of [
      ["50,50", "50,14.1421"],
      ["50,14.1421", "50,50"],
    ]) {
      const cad = fillet(off, "R", "5", ...picks)
      expect(cad.commandLog().at(-1)).toBe("Two entities are non coplanar.")
      expect(cad.entities()).toEqual(off)
    }
  })

  it("refuses a wrong answer, and is answered in Autodesk's Spanish", () => {
    const entities = drawn(LINE, CIRCLE)
    const cad = fillet(entities, "R", "15", "50,14.1421", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select second object or shift-select to apply corner or [Radius]: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/Fence/WPolygon/CPolygon/Radius]:",
    ])
    answer(cad, "70,0")
    lineIn(cad, { x: 74.4949, y: 0, z: 0 }, { x: 100, y: 0, z: 0 })

    const spanish = createHarness({ locale: es, entities })
    spanish.command("EMPALME")
    answer(spanish, "RA", "15", "50,14.1421", "FOO")
    expect(spanish.commandLog().slice(-2)).toEqual([
      "*Designación no válida*",
      "Requiere un punto o Ventana/úLTimo/Captura/MArco/Borde/polígonOV/polígonOC/Radio]:",
    ])
    answer(spanish, "70,0")
    lineIn(spanish, { x: 74.4949, y: 0, z: 0 }, { x: 100, y: 0, z: 0 })
    arcIn(spanish, { x: 74.4949, y: 10.6066, z: 10.6066 }, 15, 134.4153, 270)
  })
})
