import { describe, expect, it } from "vitest"
import type { CircleEntity } from "../../domain/entities"
import { withElevation } from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, ellipseOf, lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/**
 * The setup of the console probes circle/p01–p10 and p330–p377, drawn as
 * they draw it: circle A (0,0) r10, circle B (40,0) r10 (CIRCLERAD 10), line
 * L (−20,−15)–(60,−15) (LASTPOINT (60,−15)), seen as `ZOOM W -30,-30 70,30`.
 */
function probeSetup(options: { locale?: typeof es } = {}): CadHarness {
  const cad = createHarness(options)
  const circle = options.locale ? "CIRCULO" : "CIRCLE"
  const line = options.locale ? "LINEA" : "LINE"
  answer(cad, circle, "0,0", "10", circle, "40,0", "10")
  answer(cad, line, "-20,-15", "60,-15", "")
  answer(cad, "ZOOM", "W", "-30,-30", "70,30")
  return cad
}

/** The circle the answers made, or none. */
function made(cad: CadHarness, ...answers: string[]): CircleEntity | null {
  const before = cad.entities().length
  answer(cad, ...answers)
  const added = cad.entities().slice(before)
  return (added.find((e) => e.type === "circle") as CircleEntity) ?? null
}

type Expected = [x: number, y: number, r: number]

function expectCircle(circle: CircleEntity | null, [x, y, r]: Expected) {
  expect(circle).not.toBeNull()
  expect(circle!.center).toBeCloseToPoint(p(x, y), 4)
  expect(circle!.radius).toBeCloseTo(r, 4)
}

const TAN = (at: string) => ["_TAN", at]
const PER = (at: string) => ["_PER", at]

describe("CIRCLE 3P with Tangents (the ribbon's Tan, Tan, Tan)", () => {
  it("draws the circle touching the three objects", () => {
    // probe circle/p01, desktop d04: the macro `_circle _3p _tan \_tan \_tan \`.
    const cad = probeSetup()
    const circle = made(
      cad,
      "CIRCLE",
      "3P",
      ...TAN("0,10"),
      ...TAN("40,10"),
      ...TAN("20,-15")
    )

    expectCircle(circle, [20, -4.5, 10.5])
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify first point on circle: _TAN to 0,10",
      "Specify second point on circle: _TAN to 40,10",
      "Specify third point on circle: _TAN to 20,-15",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("chooses among the fitting circles by where each object was picked", () => {
    // probes circle/p330a, p330d, p331a, p331c (L first): CIRCLE-D30.
    const cases: [string[], Expected][] = [
      [
        [...TAN("0,-10"), ...TAN("40,-10"), ...TAN("20,-15")],
        [20, 37.5, 52.5],
      ],
      [
        [...TAN("-10,0"), ...TAN("30,0"), ...TAN("20,-15")],
        [9.364916731, 6.2701665379, 21.2701665379],
      ],
      [
        [...TAN("0,10"), ...TAN("40,10"), ...TAN("-15,-15")],
        [-29.364916731, 83.7298334621, 98.7298334621],
      ],
      [
        [...TAN("20,-15"), ...TAN("0,10"), ...TAN("40,10")],
        [20, -4.5, 10.5],
      ],
    ]
    for (const [picks, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", "3P", ...picks), expected)
    }
  })

  it("inscribes a triangle and touches three circles", () => {
    // probes circle/p332a (three lines), p333a, p333b (three circles).
    const triangle = createHarness({
      entities: [
        lineOf(p(-40, 0), p(100, 0)),
        lineOf(p(-15, -20), p(45, 60)),
        lineOf(p(75, -20), p(15, 60)),
      ],
    })
    answer(triangle, "ZOOM", "W", "-50,-30", "110,70")
    expectCircle(
      made(
        triangle,
        "CIRCLE",
        "3P",
        ...TAN("30,0"),
        ...TAN("15,20"),
        ...TAN("45,20")
      ),
      [30, 15, 15]
    )

    const circles = () => {
      const cad = createHarness({
        entities: [
          circleOf(p(0, 0), 10),
          circleOf(p(40, 0), 10),
          circleOf(p(20, 30), 10),
        ],
      })
      return answer(cad, "ZOOM", "W", "-30,-30", "70,50")
    }
    expectCircle(
      made(
        circles(),
        "CIRCLE",
        "3P",
        ...TAN("8.9442719,4.4721360"),
        ...TAN("31.0557281,4.4721360"),
        ...TAN("20,20")
      ),
      [20, 8.3333333333, 11.6666666667]
    )
    expectCircle(
      made(
        circles(),
        "CIRCLE",
        "3P",
        ...TAN("-8.9442719,-4.4721360"),
        ...TAN("48.9442719,-4.4721360"),
        ...TAN("20,40")
      ),
      [20, 8.3333333333, 31.6666666667]
    )
  })

  it("says the circle does not exist when none fits, and ends", () => {
    // desktop circle/d04.
    const cad = createHarness({
      entities: [
        lineOf(p(-50, 0), p(50, 0)),
        lineOf(p(-50, 10), p(50, 10)),
        lineOf(p(-50, 30), p(50, 30)),
      ],
    })
    answer(cad, "ZOOM", "W", "-60,-20", "60,40")
    const circle = made(
      cad,
      "CIRCLE",
      "3P",
      ...TAN("0,0"),
      ...TAN("0,10"),
      ...TAN("0,30")
    )

    expect(circle).toBeNull()
    expect(cad.commandLog().at(-1)).toBe("Circle does not exist.")
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("CIRCLE 2P with Tangents", () => {
  it("ends the diameter where the line of centres crosses each circle", () => {
    // probes circle/p334a–d: the crossing nearer each pick.
    const s = (Math.SQRT1_2 * 10).toFixed(7)
    const t = (40 - Math.SQRT1_2 * 10).toFixed(7)
    const u = (40 + Math.SQRT1_2 * 10).toFixed(7)
    const cases: [string, string, Expected][] = [
      [`-${s},${s}`, `${t},${s}`, [10, 0, 20]],
      [`${s},${s}`, `${u},${s}`, [30, 0, 20]],
      [`${s},${s}`, `${t},${s}`, [20, 0, 10]],
      [`-${s},${s}`, `${u},${s}`, [20, 0, 30]],
    ]
    for (const [first, second, expected] of cases) {
      expectCircle(
        made(probeSetup(), "CIRCLE", "2P", ...TAN(first), ...TAN(second)),
        expected
      )
    }
  })

  it("takes picks square to the line of centres as AutoCAD does", () => {
    // probes circle/p02, p334e, p334f.
    const cases: [string, string, Expected][] = [
      ["0,10", "40,10", [10, 0, 20]],
      ["0,-10", "40,-10", [30, 0, 20]],
      ["40,10", "0,10", [10, 0, 20]],
    ]
    for (const [first, second, expected] of cases) {
      expectCircle(
        made(probeSetup(), "CIRCLE", "2P", ...TAN(first), ...TAN(second)),
        expected
      )
    }
  })

  it("ends on a line at the foot from the other end", () => {
    // probes circle/p374, p370 (CTN-06: a Tangent on a line).
    expectCircle(
      made(probeSetup(), "CIRCLE", "2P", ...TAN("20,-15"), ...TAN("0,-10")),
      [0, -12.5, 2.5]
    )
    expectCircle(
      made(probeSetup(), "CIRCLE", "2P", ...TAN("0,10"), ...TAN("20,-15")),
      [0, -2.5, 12.5]
    )
    expectCircle(
      made(probeSetup(), "CIRCLE", "2P", ...TAN("20,-15"), "60,20"),
      [60, 2.5, 17.5]
    )
  })

  it("ends on a circle toward or away from the other point", () => {
    // probes circle/p08, p09, p335c, p335e (a Perpendicular there: the same).
    const cases: [string[], Expected][] = [
      [
        [...TAN("0,10"), "60,20"],
        [34.74341649, 11.58113883, 26.6227766],
      ],
      [
        ["20,20", ...TAN("40,10")],
        [26.46446609, 13.53553391, 9.14213562],
      ],
      [
        ["60,20", ...TAN("0,-10")],
        [25.2565835097, 8.4188611699, 36.6227766017],
      ],
      [
        [...PER("0,10"), "60,20"],
        [34.7434164903, 11.5811388301, 26.6227766017],
      ],
    ]
    for (const [picks, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", "2P", ...picks), expected)
    }
  })

  it("measures a Perpendicular to a line from LASTPOINT", () => {
    // probe circle/p335: LASTPOINT (60,−15), or the first end given.
    const cases: [string[], Expected][] = [
      [
        [...PER("20,-15"), ...TAN("0,10")],
        [25.1492874993, -6.2873218748, 35.9232921921],
      ],
      [
        [...TAN("0,-10"), ...PER("20,-15")],
        [34.8507125007, -8.7126781252, 25.9232921921],
      ],
      [
        ["20,20", ...PER("20,-15")],
        [20, 2.5, 17.5],
      ],
    ]
    for (const [picks, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", "2P", ...picks), expected)
    }
  })
})

describe("CIRCLE's ghost after a deferred Tangent", () => {
  /** Whether a circle is drawn at `center` with `radius`, in world units. */
  function drawsCircle(cad: CadHarness, [x, y, r]: Expected): boolean {
    const center = cad.toScreen(p(x, y))
    const radius = cad.toScreen(p(x + r, y)).x - center.x
    return cad
      .scene()
      .primitives.some(
        (primitive) =>
          primitive.kind === "circle" &&
          Math.abs(primitive.center.x - center.x) < 0.01 &&
          Math.abs(primitive.center.y - center.y) < 0.01 &&
          Math.abs(primitive.radius - radius) < 0.01
      )
  }

  it("shows the circle through the cursor as the last point", () => {
    // probes circle/p336a (3P) and p08 (2P), the cursor where they typed.
    const three = probeSetup()
    answer(three, "CIRCLE", "3P", ...TAN("0,10"), ...TAN("40,10"))
    three.moveTo(p(20, 30))
    expect(drawsCircle(three, [20, 15, 15])).toBe(true)

    const two = probeSetup()
    answer(two, "CIRCLE", "2P", ...TAN("0,10"))
    two.moveTo(p(60, 20))
    expect(drawsCircle(two, [34.74341649, 11.58113883, 26.6227766])).toBe(true)
  })
})

describe("CIRCLE 3P with a Tangent or Perpendicular among points", () => {
  it("solves the circle through the points and touching the object", () => {
    // probes circle/p03, p04, p336a–c, p371 (CTN-06: a line).
    const cases: [string[], Expected][] = [
      [
        [...TAN("0,10"), "60,20", "70,0"],
        [29.882351153, -7.558824424, 40.82354193],
      ],
      [
        ["20,20", "25,25", ...TAN("40,10")],
        [28.840374726, 16.159625274, 9.638501094],
      ],
      [
        [...TAN("0,10"), ...TAN("40,10"), "20,30"],
        [20, 15, 15],
      ],
      [
        [...TAN("0,10"), "20,30", ...TAN("40,10")],
        [20, 15, 15],
      ],
      [
        ["20,30", ...TAN("0,10"), ...TAN("40,10")],
        [20, 15, 15],
      ],
      [
        [...TAN("20,-15"), "60,20", "70,20"],
        [65, 2.8571428571, 17.8571428571],
      ],
    ]
    for (const [picks, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", "3P", ...picks), expected)
    }
  })

  it("puts the centre on a line given by a Perpendicular", () => {
    // probes circle/p337c, p337d, p337e, p10.
    const cases: [string[], Expected][] = [
      [
        ["20,20", "25,25", ...PER("20,-15")],
        [60, -15, 53.1507290637],
      ],
      [
        [...PER("20,-15"), "0,20", "40,20"],
        [20, -15, 40.3112887415],
      ],
      [
        [...TAN("0,10"), ...PER("20,-15"), "20,30"],
        [33.9444872454, -15, 47.1110255093],
      ],
      [
        [...PER("20,-15"), ...TAN("0,10"), ...TAN("40,10")],
        [20, -15, 35],
      ],
    ]
    for (const [picks, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", "3P", ...picks), expected)
    }
  })

  it("refuses a Perpendicular on a circle at the first point", () => {
    // probe circle/p337f (CTN-07); 2P's first point takes it (p335e).
    const cad = probeSetup()
    answer(cad, "CIRCLE", "3P", ...PER("0,10"))

    expect(cad.commandLog().slice(-2)).toEqual([
      "No Perpendicular found for specified point.",
      "Invalid point.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify first point on circle:"
    )
  })
})

describe("CIRCLE's radius and centre under a Tangent or Perpendicular", () => {
  it("makes the circle tangent to the object picked at the radius", () => {
    // probes circle/p06, p338a–c, p339 (a line), p340 (an arc, as its circle).
    const s = (Math.SQRT1_2 * 10).toFixed(7)
    const cases: [string, string, Expected][] = [
      ["20,20", "40,10", [20, 20, 18.2842712475]],
      ["20,20", `-${s},-${s}`, [20, 20, 38.2842712475]],
      ["2,0", "10,0", [2, 0, 8]],
      ["2,0", "-10,0", [2, 0, 12]],
      ["20,20", "20,-15", [20, 20, 35]],
    ]
    for (const [center, at, expected] of cases) {
      expectCircle(made(probeSetup(), "CIRCLE", center, ...TAN(at)), expected)
    }

    const arc = createHarness()
    answer(
      arc,
      "ARC",
      "C",
      "0,0",
      "10,0",
      "0,10",
      "ZOOM",
      "W",
      "-30,-30",
      "30,30"
    )
    expectCircle(
      made(arc, "CIRCLE", "-20,-20", ...TAN(`${s},${s}`)),
      [-20, -20, 38.2842712475]
    )
  })

  it("measures the centre's Tangent and Perpendicular from LASTPOINT", () => {
    // probes circle/p343 (LASTPOINT (60,−15)), p344 (30,30), p345 (CTN-04).
    expectCircle(
      made(probeSetup(), "CIRCLE", ...TAN("0,10"), "5"),
      [3.9620697286, 9.1816122476, 5]
    )
    expectCircle(
      made(probeSetup(), "ID", "30,30", "CIRCLE", ...TAN("0,10"), "5"),
      [-5.2051760427, 8.538509376, 5]
    )
    expectCircle(
      made(probeSetup(), "CIRCLE", ...PER("20,-15"), "5"),
      [60, -15, 5]
    )
  })

  it("leaves Ortho out of the centre measured from LASTPOINT", () => {
    const cad = probeSetup()
    cad.runtime.toggleOrtho()
    expectCircle(
      made(cad, "CIRCLE", ...TAN("0,10"), "5"),
      [3.9620697286, 9.1816122476, 5]
    )
  })
})

describe("CIRCLE Ttr", () => {
  /** Two circles overlapping, as probes circle/p378 and p379 set them. */
  function overlapping(): CadHarness {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 10), circleOf(p(15, 0), 10)],
    })
    return answer(cad, "ZOOM", "W", "-20,-20", "35,20")
  }

  it("chooses by the least sum of squared distances to the picks", () => {
    // probes circle/p378c, p379b, p379c (CTN-08).
    const cases: [
      [number, number],
      [number, number],
      string,
      [number, number],
    ][] = [
      [[9.6824584, 2.5], [25, 0], "2", [10.1666666667, 6.374863833]],
      [[-8.6602540378, 5], [6.3397459622, -5], "3", [3.5, 6.0621778265]],
      [
        [8.6602540378, -5],
        [5.3407417371, -2.588190451],
        "6",
        [7.5, -14.1332940251],
      ],
    ]
    for (const [first, second, radius, [x, y]] of cases) {
      const cad = overlapping()
      cad.command("CIRCLE").option("Ttr")
      cad.click(p(...first)).click(p(...second))
      answer(cad, radius)
      expect((cad.latest() as CircleEntity).center).toBeCloseToPoint(p(x, y), 5)
    }
  })

  it("takes a typed Tangent and point as a pick there", () => {
    // probe circle/p300 (CTN-11).
    const cad = probeSetup()
    const circle = made(
      cad,
      "CIRCLE",
      "T",
      ...TAN("0,10"),
      ...TAN("40,10"),
      "15"
    )

    expectCircle(circle, [20, 15, 15])
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify point on object for first tangent of circle: _TAN to 0,10",
      "Specify point on object for second tangent of circle: _TAN to 40,10",
      "Specify radius of circle <10.00>: 15",
    ])
  })

  it("refuses with the starred words what is not a Tangent on a line or curve", () => {
    // probes circle/p300 (a point), p373 (_PER, a number), p314 (an ellipse),
    // desktop d13 (a click on nothing or an ellipse) (CTN-12).
    const starred =
      "*Requires a TAN object-snap and selection of Circle, Arc, or Line."
    const cad = probeSetup()
    cad.runtime.document.add(ellipseOf(p(0, 25), p(10, 0), 0.5))
    answer(cad, "CIRCLE", "T", "0,10")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify point on object for first tangent of circle: 0,10",
      starred,
    ])
    answer(cad, ...PER("20,-15"))
    expect(cad.commandLog().at(-1)).toBe(starred)
    answer(cad, "5")
    expect(cad.commandLog().at(-1)).toBe(starred)
    answer(cad, ...TAN("10,25"))
    expect(cad.commandLog().at(-1)).toBe(starred)
    cad.click(p(20, 20))
    expect(cad.commandLog().at(-1)).toBe(starred)
    cad.click(p(10, 25))
    expect(cad.commandLog().at(-1)).toBe(starred)
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify point on object for first tangent of circle:"
    )
  })

  it("refuses a word and a Tangent finding nothing in the plain words", () => {
    // probes circle/p307, p308 (CTN-12).
    const plain =
      "Requires a TAN object-snap and selection of Circle, Arc, or Line."
    const cad = probeSetup()
    answer(cad, "CIRCLE", "T", "FOO")
    expect(cad.commandLog().at(-1)).toBe(plain)
    answer(cad, ...TAN("20,25"))
    expect(cad.commandLog().slice(-2)).toEqual([
      "No found for specified point.",
      plain,
    ])
  })

  it("lies at the objects' common height, else at the elevation", () => {
    // probes circle/p327 (both at Z 3), p321 (at 0, ELEVATION 5), p329 (at 3
    // and 7, ELEVATION 5) (CTN-13).
    const at = (first: number, second: number, elevation: number) => {
      const cad = createHarness({
        entities: [
          withElevation(circleOf(p(0, 0), 10), first),
          withElevation(circleOf(p(40, 0), 10), second),
        ],
      })
      answer(cad, "ZOOM", "W", "-30,-30", "70,30", "ELEV", `${elevation}`, "0")
      cad.command("CIRCLE").option("Ttr").click(p(0, 10)).click(p(40, 10))
      answer(cad, "15")
      return (cad.latest() as CircleEntity).elevation ?? 0
    }
    expect(at(3, 3, 0)).toBe(3)
    expect(at(0, 0, 5)).toBe(0)
    expect(at(3, 7, 5)).toBe(5)
  })
})
