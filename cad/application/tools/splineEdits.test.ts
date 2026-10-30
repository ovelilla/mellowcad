import { describe, expect, it } from "vitest"
import type { Entity, SplineEntity } from "../../domain/entities"
import { createSpline, splineOnItsPlane } from "../../domain/entities"
import { splineInWorld } from "../../domain/splineEdits"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import { fadedColor } from "../SceneBuilder"

// TRIM, EXTEND, BREAK and BREAKATPOINT of a spline, as AutoCAD 2027's console
// leaves it (probes spline-knots/k01–k37, MPDUMP): each piece on the knots it
// had there, never normalised, the first keeping the object.

const ROOT200 = Math.hypot(10, 10)
const fit = (id = "S") =>
  createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], { id })
const cv = (id = "S") =>
  createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)], { id })
const closedFit = () =>
  createSpline("fit", [p(0, 0), p(20, 0), p(20, 20), p(0, 20)], {
    id: "S",
    closed: true,
  })
const closedCv = () =>
  createSpline("cv", [p(30, 0), p(50, 0), p(50, 20), p(30, 20)], {
    id: "S",
    closed: true,
  })
const splines = (entities: readonly Entity[]) =>
  entities.filter((e): e is SplineEntity => e.type === "spline")

describe("TRIM a spline", () => {
  it("leaves the piece a CV spline on the knots it had (k01, k02)", () => {
    const cad = createHarness({
      entities: [fit(), lineOf(p(15, -10), p(15, 20))],
    })
    cad.command("TRIM").click(p(30, 10))
    const piece = cad.byId<SplineEntity>("S")
    expect(piece).toMatchObject({ method: "cv", degree: 3, closed: false })
    expect(piece.knotVector).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      ...new Array(4).fill(expect.closeTo(1.5 * ROOT200, 12)),
    ])
    expect(piece.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(3.333333333333333, 5.5555555555555545),
        p(8.333333333333334, 13.888888888888888),
        p(13.333333333333334, 7.2222222222222205),
        p(15, 4.999999999999998),
      ],
      10
    )

    const control = createHarness({
      entities: [cv(), lineOf(p(20, -10), p(20, 20))],
    })
    control.command("TRIM").click(p(40, 10))
    expect(control.byId<SplineEntity>("S").knotVector).toEqual([
      0,
      0,
      0,
      0,
      ...new Array(4).fill(expect.closeTo(0.6277186767309857, 12)),
    ])
  })

  it("cuts one in two, the piece after it a new object (k28)", () => {
    const cad = createHarness({
      entities: [
        fit(),
        lineOf(p(8, -10), p(8, 20)),
        lineOf(p(22, -10), p(22, 20)),
      ],
    })
    // Off the lines, which the pick box would take first, being newer.
    cad.command("TRIM").click(p(15, 5))
    const [first, second] = splines(cad.entities())
    expect(first.id).toBe("S")
    expect(first.points).toBeCloseToPoints(
      [p(0, 0), p(2.666667, 4.444444), p(5.333333, 8.888889), p(8, 9.92)],
      6
    )
    expect(first.knotVector?.at(-1)).toBeCloseTo(11.313708498984763, 9)
    expect(second.id).not.toBe("S")
    expect(second.knotVector?.[0]).toBeCloseTo(31.112698372208094, 9)
    expect(second.points).toBeCloseToPoints(
      [p(22, 0.08), p(24.666667, 1.111111), p(27.333333, 5.555556), p(30, 10)],
      6
    )
    // One gesture, one step back.
    cad.undo()
    expect(splines(cad.entities())).toEqual([fit()])
  })

  it("opens a closed one from the far crossing round to the near (k03, k04, k36)", () => {
    const cad = createHarness({
      entities: [closedFit(), lineOf(p(10, -10), p(10, 30))],
    })
    cad.command("TRIM").click(p(20, 0))
    const piece = cad.byId<SplineEntity>("S")
    expect(piece.closed).toBe(false)
    expect(piece.knotVector).toEqual([
      ...new Array(4).fill(expect.closeTo(50, 9)),
      60,
      80,
      80,
      80,
      ...new Array(4).fill(expect.closeTo(90, 9)),
    ])

    for (const [pick, kept] of [
      [p(46.66666667, 3.33333333), [0.5, 0.5, 0.5, 0.5, 1, 2, 2.5]],
      [p(33.33333333, 3.33333333), [2.5, 2.5, 2.5, 2.5, 3, 4, 4, 4, 4.5]],
    ] as const) {
      const closed = createHarness({
        entities: [closedCv(), lineOf(p(40, -10), p(40, 30))],
      })
      closed.command("TRIM").click(pick)
      const knots = closed.byId<SplineEntity>("S").knotVector ?? []
      expect(knots.slice(0, kept.length)).toEqual(
        kept.map((k) => expect.closeTo(k, 9))
      )
    }
  })

  it("cuts one in space or at an angle in plan (k25, k26)", () => {
    const space = createSpline("fit", [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 10, z: 5 },
      { x: 20, y: 0, z: 10 },
      { x: 30, y: 10, z: 0 },
    ])
    const tilted = splineOnItsPlane(
      createSpline("fit", [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 },
        { x: 20, y: 0, z: 20 },
        { x: 30, y: 10, z: 30 },
      ])
    )
    expect(tilted.normal).toBeDefined()
    for (const [spline, end, last] of [
      [space, 22.36223369295682, { x: 15, y: 5.355696, z: 8.390535 }],
      [tilted, 25.980762113533164, { x: 15, y: 5, z: 15 }],
    ] as const) {
      const cad = createHarness({
        entities: [{ ...spline, id: "S" }, lineOf(p(15, -10), p(15, 20))],
      })
      cad.command("TRIM").click(p(30, 10))
      const piece = cad.byId<SplineEntity>("S")
      expect(piece.normal).toEqual(spline.normal)
      expect(piece.knotVector?.at(-1)).toBeCloseTo(end, 9)
      const world = splineInWorld(piece).points.at(-1)!
      expect(world.x).toBeCloseTo(last.x, 6)
      expect(world.y).toBeCloseTo(last.y, 6)
      expect(world.z).toBeCloseTo(last.z, 6)
    }
  })

  it("says why it leaves one, in both modes (k30, k34)", () => {
    for (const [locale, name, said] of [
      [
        undefined,
        "TRIM",
        [
          "Object does not intersect an edge.",
          "Curve must intersect cutting edges at least twice.",
        ],
      ],
      [
        es,
        "RECORTA",
        [
          "El objeto no se interseca con ninguna arista.",
          "La curva debe intersecar las aristas de corte al menos dos veces.",
        ],
      ],
    ] as const) {
      const far = lineOf(p(100, 0), p(100, 10))
      const standard = createHarness({ locale, entities: [fit(), far] })
      standard.command(name).option("mOde").option("Standard").click(p(30, 10))
      expect(standard.commandLog().at(-1)).toBe(said[0])
      expect(standard.entities()).toEqual([fit(), far])
      standard.escape()

      const once = createHarness({
        locale,
        entities: [closedFit(), lineOf(p(10, 10), p(10, 30))],
      })
      once.command(name).click(p(10, -3.75))
      expect(once.commandLog().at(-1)).toBe(said[1])
    }
  })
})

describe("EXTEND a spline", () => {
  it("grows a CV spline by a curved piece (k10, k31)", () => {
    const cad = createHarness({
      entities: [cv(), lineOf(p(50, -10), p(50, 30))],
    })
    cad.command("EXTEND").click(p(40, 10))
    const grown = cad.byId<SplineEntity>("S")
    expect(grown.method).toBe("cv")
    expect(grown.knotVector?.slice(0, 7)).toEqual([0, 0, 0, 0, 1, 1, 1])
    // AutoCAD's end knot 1.16024840, its own crossing search's (domain test).
    expect(grown.knotVector?.at(-1)).toBeCloseTo(1.1602484, 5)
    expect(grown.points.slice(0, 5)).toBeCloseToPoints(
      [p(0, 0), p(5, 15), p(20, -5), p(40, 10), p(43.204968, 12.403726)],
      3
    )
    expect(grown.points.at(-1)!.x).toBeCloseTo(50, 9)
    cad.undo()
    expect(cad.byId("S")).toEqual(cv())
  })

  it("grows a fit spline straight on from a free end, a fit spline still (k17, k19)", () => {
    for (const [edge, pick, grownAt] of [
      [lineOf(p(40, -10), p(40, 60)), p(29.9, 9.9), p(40, 26.666667)],
      [lineOf(p(-10, -30), p(-10, 30)), p(0.1, 0.15), p(-10, -16.666667)],
    ] as const) {
      const cad = createHarness({ entities: [fit(), edge] })
      cad.command("EXTEND").click(pick)
      const grown = cad.byId<SplineEntity>("S")
      expect(grown.method).toBe("fit")
      expect(grown.points).toHaveLength(5)
      expect(
        pick.x > 15 ? grown.points.at(-1)! : grown.points[0]
      ).toBeCloseToPoint(grownAt, 6)
    }
  })

  it("eases a fit spline's end off, up to its own curve (k32)", () => {
    const tangent = { x: -29, y: -10 }
    const spline = createSpline(
      "fit",
      [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
      {
        id: "S",
        endTangent: {
          x: tangent.x / Math.hypot(29, 10),
          y: -10 / Math.hypot(29, 10),
        },
      }
    )
    const cad = createHarness({
      entities: [spline, lineOf(p(40, -10), p(40, 30))],
    })
    cad.command("EXTEND").click(p(29.9, 9.9))
    const grown = cad.byId<SplineEntity>("S")
    expect(grown.points).toBeCloseToPoints(
      [
        p(0, 0),
        p(10, 10),
        p(20, 0),
        p(30, 10),
        p(29.44254, 9.784955),
        p(14.260381, 3.650134),
      ],
      3
    )
    expect(grown.knotVector?.slice(9, 12)).toEqual(
      new Array(3).fill(expect.closeTo(42.973407476, 8))
    )
  })

  it("grows to a spline edge (k27)", () => {
    const edge = createSpline(
      "cv",
      [p(30, 30), p(50, 30), p(50, 50), p(30, 50)],
      { closed: true }
    )
    const cad = createHarness({ entities: [fit(), edge] })
    cad.command("EXTEND").click(p(29.9, 9.9))
    // Met on the edge's chords, a hundred-thousandth of its size.
    expect(cad.byId<SplineEntity>("S").points.at(-1)).toBeCloseToPoint(
      p(42.700354, 31.167256),
      3
    )
  })

  it("says so where it reaches no edge, and refuses a closed one (k20, k27)", () => {
    for (const [locale, name, said] of [
      [
        undefined,
        "EXTEND",
        ["Object does not intersect an edge.", "Cannot EXTEND this object."],
      ],
      [
        es,
        "ALARGA",
        [
          "El objeto no se interseca con ninguna arista.",
          "Este objeto no se puede ALARGAR.",
        ],
      ],
    ] as const) {
      const cad = createHarness({
        locale,
        entities: [cv(), lineOf(p(-10, -30), p(-10, 30))],
      })
      cad.command(name).click(p(0.05, 0.15))
      expect(cad.commandLog().at(-1)).toBe(said[0])
      expect(cad.byId("S")).toEqual(cv())
      cad.escape()

      const closed = createHarness({
        locale,
        entities: [closedCv(), lineOf(p(100, 0), p(100, 10))],
      })
      closed.command(name).click(p(46.66666667, 3.33333333))
      expect(closed.commandLog().at(-1)).toBe(said[1])
    }
  })
})

describe("BREAK a spline", () => {
  it("leaves a fit spline's pieces fit splines (k05)", () => {
    const cad = createHarness({ entities: [fit()] })
    cad
      .command("BREAK")
      .click(p(0, 0))
      .option("First point")
      .click(p(12, 6))
      .click(p(22, 3))
    const [first, second] = splines(cad.entities())
    expect(first).toMatchObject({ id: "S", method: "fit" })
    expect(first.points).toBeCloseToPoints(
      [p(0, 0), p(10, 10), p(13.369530919167282, 7.116165614727937)],
      6
    )
    expect(first.endTangent).toBeCloseToPoint(p(0.707107, -0.867617), 6)
    expect(second.points).toBeCloseToPoints(
      [p(23.621319127754784, 1.0990853622035435), p(30, 10)],
      6
    )
    expect(second.knotVector?.[0]).toBeCloseTo(33.40558987161383, 6)
    cad.undo()
    expect(splines(cad.entities())).toEqual([fit()])
  })

  it("splits one at a point, a CV spline into CV pieces (k21, k22)", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.command("BREAKATPOINT").click(p(10, 10)).click(p(10, 10))
    const [first, second] = splines(cad.entities())
    expect(first.knotVector).toEqual([
      0,
      0,
      0,
      0,
      ROOT200,
      ROOT200,
      ROOT200,
      ROOT200,
    ])
    expect(second.points).toBeCloseToPoints([p(10, 10), p(20, 0), p(30, 10)], 9)

    const control = createHarness({ entities: [cv()] })
    control.command("BREAKATPOINT").click(p(7.065, 5.94)).click(p(7.065, 5.94))
    const [left, right] = splines(control.entities())
    expect(left.points).toBeCloseToPoints(
      [p(0, 0), p(1.5, 4.5), p(3.9, 5.85), p(7.065, 5.94)],
      6
    )
    expect(right.points).toBeCloseToPoints(
      [p(7.065, 5.94), p(14.45, 6.15), p(26, -0.5), p(40, 10)],
      6
    )
  })

  it("opens a closed one from the later point round to the earlier (k07, k08, k37)", () => {
    for (const [first, second] of [
      [p(23.75, 10), p(10, 23.75)],
      [p(10, 23.75), p(23.75, 10)],
    ]) {
      const cad = createHarness({ entities: [closedFit()] })
      cad
        .command("BREAK")
        .click(first)
        .option("First point")
        .click(first)
        .click(second)
      const piece = cad.byId<SplineEntity>("S")
      expect(piece).toMatchObject({ method: "fit", closed: false })
      expect(piece.knotVector).toEqual([
        ...new Array(4).fill(expect.closeTo(50, 6)),
        60,
        80,
        80,
        80,
        100,
        ...new Array(4).fill(expect.closeTo(110, 6)),
      ])
    }

    const cad = createHarness({ entities: [closedCv()] })
    cad
      .command("BREAK")
      .click(p(33.33333333, 3.33333333))
      .option("First point")
      .click(p(46.66666667, 3.33333333))
      .click(p(46.66666667, 16.66666667))
    expect(cad.byId<SplineEntity>("S").knotVector).toEqual(
      [0, 0, 0, 0, 1, 2, 3, 3, 3, 3].map((k) => expect.closeTo(k, 6))
    )
  })

  it("will not split a closed one at one point (k23, k24)", () => {
    for (const [locale, name, said] of [
      [
        undefined,
        "BREAKATPOINT",
        "Cannot break a closed, periodic curve at only one point.",
      ],
      [
        es,
        "PARTIRENPUNTO",
        "No es posible partir una curva periódica cerrada en un solo punto.",
      ],
    ] as const) {
      for (const spline of [closedFit(), closedCv()]) {
        const cad = createHarness({ locale, entities: [spline] })
        const at =
          spline.method === "fit" ? p(10, 23.75) : p(46.66666667, 3.33333333)
        cad.command(name).click(at).click(at)
        expect(cad.commandLog().at(-1)).toBe(said)
        expect(cad.entities()).toEqual([spline])
      }
    }
  })

  it("keeps the weights and the properties, in plan at an angle (k29, k33)", () => {
    const weighed = {
      ...createSpline("cv", cv().points, { id: "S", weights: [3, 1, 1, 1] }),
      color: "#ff0000",
      linetype: "DASHED",
      lineweight: 0.5,
    }
    const cad = createHarness({ entities: [weighed] })
    cad
      .command("BREAK")
      .click(p(40, 10))
      .option("First point")
      .click(p(7, 6))
      .click(p(23.5, 4))
    const [first, second] = splines(cad.entities())
    for (const piece of [first, second]) {
      expect(piece).toMatchObject({
        color: "#ff0000",
        linetype: "DASHED",
        lineweight: 0.5,
      })
    }
    expect(first.knotVector?.at(-1)).toBeCloseTo(0.3950206663223277, 6)
    expect(first.weights?.[1]).toBeCloseTo(2.209959, 6)
    expect(second.weights?.[0]).toBeCloseTo(1.04351, 5)

    const tilted = splineOnItsPlane(
      createSpline(
        "fit",
        [
          { x: 0, y: 0, z: 0 },
          { x: 10, y: 10, z: 10 },
          { x: 20, y: 0, z: 20 },
          { x: 30, y: 10, z: 30 },
        ],
        { id: "S" }
      )
    )
    const angled = createHarness({ entities: [tilted] })
    angled
      .command("BREAK")
      .click(p(0, 0))
      .option("First point")
      .click(p(10, 10))
      .click(p(20, 0))
    const [low, high] = splines(angled.entities())
    expect(low.normal).toEqual(tilted.normal)
    expect(low.knotVector?.at(-1)).toBeCloseTo(17.320508075688775, 9)
    expect(high.knotVector?.[0]).toBeCloseTo(34.641016151377556, 9)
    const start = splineInWorld(high).points[0]
    expect(start.z).toBeCloseTo(20, 9)
  })
})

describe("the look of a spline's edit", () => {
  // As any object's (desktop spline-knots/d05–d08, trim/d01, pieces/d01):
  // the spline is drawn in segments, so the colours tell the pieces apart.
  const colours = (cad: ReturnType<typeof createHarness>) =>
    cad
      .scene()
      .primitives.flatMap((prim) =>
        "stroke" in prim && prim.stroke ? [prim.stroke.color] : []
      )

  it("fades what TRIM takes and glows what EXTEND grows", () => {
    const trim = createHarness({
      entities: [fit(), lineOf(p(15, -10), p(15, 20))],
    })
    trim.command("TRIM").moveTo(p(30, 10))
    expect(colours(trim)).toContain(fadedColor(THEME.entity))
    expect(colours(trim)).toContain(THEME.entity)

    const extend = createHarness({
      entities: [cv(), lineOf(p(50, -10), p(50, 30))],
    })
    extend.command("EXTEND").moveTo(p(40, 10))
    expect(colours(extend)).toContain(THEME.selected)
  })

  it("highlights one at BREAK's pick and ghosts the break at its second point", () => {
    const cad = createHarness({ entities: [cv()] })
    cad.command("BREAK").moveTo(p(40, 10))
    expect(colours(cad)).toContain(THEME.entityHover)
    cad.click(p(40, 10)).moveTo(p(7.065, 5.94))
    expect(colours(cad)).toContain(THEME.selected)
    expect(colours(cad)).toContain(fadedColor(THEME.entity))
  })
})
