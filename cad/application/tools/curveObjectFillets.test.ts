import { describe, expect, it } from "vitest"
import {
  createSpline,
  type ArcEntity,
  type EllipseEntity,
  type Entity,
  type LineEntity,
  type SplineEntity,
} from "../../domain/entities"
import { normalizeAngle, polarPoint } from "../../geometry/primitives"
import type { Vec2 } from "../../geometry/Vec2"
import { type CadHarness, createHarness } from "../../../test/harness"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import {
  arcOf,
  circleOf,
  deg,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"

/*
 * FILLET of an elliptical arc, a closed ellipse and a spline, against AutoCAD
 * 2027's console: every number below is its MPDUMP's (probes
 * corners/p237–p482, en-US; the Spanish words from the es-ES runs).
 */

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function fillet(entities: Entity[], ...texts: string[]): CadHarness {
  const cad = createHarness({ entities })
  cad.command("FILLET")
  return answer(cad, ...texts)
}

const SPLINE = () =>
  createSpline("fit", [p(0, 0), p(50, 30), p(100, 0), p(150, 30)], {
    id: "S",
  })
const HALF = () =>
  ellipseOf(p(0, 0), p(50, 0), 0.5, {
    id: "E",
    startParam: 0,
    endParam: Math.PI,
  })
const QUARTER = () =>
  ellipseOf(p(0, 0), p(50, 0), 0.5, {
    id: "E",
    startParam: 0,
    endParam: Math.PI / 2,
  })
const ELLIPSE = () => ellipseOf(p(0, 0), p(50, 0), 0.5, { id: "E" })
const upright = (x: number, from: number, to: number, id = "L") =>
  lineOf(p(x, from), p(x, to), { id })

type Expected = (entity: Entity) => void
const DIGITS = 7

function closeTo(actual: Vec2, [x, y]: readonly [number, number]) {
  expect(actual.x).toBeCloseTo(x, DIGITS)
  expect(actual.y).toBeCloseTo(y, DIGITS)
}

const line =
  (start: [number, number], end: [number, number]): Expected =>
  (entity) => {
    const { type, start: s, end: e } = entity as LineEntity
    expect(type).toBe("line")
    closeTo(s, start)
    closeTo(e, end)
  }

/** Its start and end points: AutoCAD's 0 and 2π are one angle. */
const arc =
  (
    center: [number, number],
    radius: number,
    start: [number, number],
    end: [number, number]
  ): Expected =>
  (entity) => {
    const a = entity as ArcEntity
    expect(a.type).toBe("arc")
    closeTo(a.center, center)
    expect(a.radius).toBeCloseTo(radius, DIGITS)
    closeTo(polarPoint(a.center, a.radius, a.startAngle), start)
    closeTo(polarPoint(a.center, a.radius, a.endAngle), end)
  }

const ellipse =
  (...params: [number, number] | []): Expected =>
  (entity) => {
    const e = entity as EllipseEntity
    expect(e.type).toBe("ellipse")
    if (params.length === 0) {
      expect(e.startParam).toBeUndefined()
      return
    }
    // WHY by start and sweep: the dump's start can lie below 0 (p445,
    // p446), where the file's lies in [0, 2π) as the factory stores it.
    const [start, end] = params
    expect(normalizeAngle(e.startParam!)).toBeCloseTo(
      normalizeAngle(start),
      DIGITS
    )
    expect(normalizeAngle(e.endParam! - e.startParam!)).toBeCloseTo(
      normalizeAngle(end - start),
      DIGITS
    )
  }

const spline =
  (method: "fit" | "cv") =>
  (points: [number, number][], knots: number[]): Expected =>
  (entity) => {
    const s = entity as SplineEntity
    expect(s.type).toBe("spline")
    expect(s.method).toBe(method)
    expect(s.points).toHaveLength(points.length)
    s.points.forEach((point, i) => closeTo(point, points[i]))
    expect(s.knotVector).toHaveLength(knots.length)
    s.knotVector!.forEach((knot, i) => expect(knot).toBeCloseTo(knots[i], 6))
  }
const fit = spline("fit")
const cv = spline("cv")

/** Left as it was. */
const same =
  (source: () => Entity): Expected =>
  (entity) =>
    expect(entity).toEqual(source())

function expectDrawing(cad: CadHarness, expected: Expected[]) {
  const entities = cad.entities()
  expect(entities).toHaveLength(expected.length)
  entities.forEach((entity, i) => expected[i](entity))
}

const LINE75 = () => upright(75, -20, 60)
const LINE30 = () => upright(30, -40, 60)

describe("FILLET of an ellipse or a spline at a radius", () => {
  // The spline crosses the line at 75,15: each quadrant picked, U/D the
  // line above or below, R/L the spline right or left of it.
  const UR: Expected[] = [
    fit(
      [
        [0, 0],
        [50, 30],
        [76.884662928, 13.4944118134],
      ],
      [
        0, 0, 0, 0, 58.3095189485, 89.6621541969, 89.6621541969, 89.6621541969,
        89.6621541969,
      ]
    ),
    line([75, -20], [75, 17.4052525066]),
    arc(
      [80, 17.4052525066],
      5,
      [76.884662928, 13.4944118134],
      [75, 17.4052525066]
    ),
  ]

  it("rounds a spline and a line on the side of each tangent at the picks, the arc facing where the tangents meet: the long way round two quadrants in four (p389, p391, p392)", () => {
    expectDrawing(fillet([SPLINE(), LINE75()], "R", "5", "75,50", "100,0"), UR)
    expectDrawing(fillet([SPLINE(), LINE75()], "R", "5", "75,-10", "100,0"), [
      fit(
        [
          [82.9716041062, 8.78481825658],
          [100, 0],
          [150, 30],
        ],
        [
          96.7606864363, 96.7606864363, 96.7606864363, 96.7606864363,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      line([75, -20], [75, 4.76367799094]),
      arc(
        [80, 4.76367799094],
        5,
        [82.9716041062, 8.78481825658],
        [75, 4.76367799094]
      ),
    ])
    expectDrawing(fillet([SPLINE(), LINE75()], "R", "5", "75,-10", "50,30"), [
      fit(
        [
          [73.115337072, 16.5055881866],
          [100, 0],
          [150, 30],
        ],
        [
          85.2664026485, 85.2664026485, 85.2664026485, 85.2664026485,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      line([75, 12.5947474934], [75, 60]),
      arc(
        [70, 12.5947474934],
        5,
        [73.115337072, 16.5055881866],
        [75, 12.5947474934]
      ),
    ])
  })

  it("makes the same whichever is picked first, drawn first, or runs either way (p393, p405, p407, p411)", () => {
    expectDrawing(fillet([SPLINE(), LINE75()], "R", "5", "100,0", "75,50"), UR)
    const [, l, a] = UR
    const drawnFirst = fillet([LINE75(), SPLINE()], "R", "5", "75,50", "100,0")
    l(drawnFirst.byId("L"))
    a(drawnFirst.entities()[2])
    const reversed = fillet(
      [
        createSpline("fit", [p(150, 30), p(100, 0), p(50, 30), p(0, 0)], {
          id: "S",
        }),
        lineOf(p(75, 60), p(75, -20), { id: "L" }),
      ],
      "R",
      "5",
      "75,50",
      "100,0"
    )
    expect(reversed.byId<SplineEntity>("S").points[0]).toBeCloseToPoint(
      p(76.884662928, 13.4944118134)
    )
    expect(reversed.byId<LineEntity>("L").start).toBeCloseToPoint(
      p(75, 17.4052525066)
    )
    a(reversed.entities()[2])
  })

  it("takes the tangent at the pick, not the quadrant: a pick further round turns the arc (p399, p435, p413, p424)", () => {
    expectDrawing(fillet([HALF(), LINE30()], "R", "5", "30,0", "0,25"), [
      ellipse(1.01241468667, Math.PI),
      line([30, -40], [30, 16.4302358221]),
      arc(
        [25, 16.4302358221],
        5,
        [30, 16.4302358221],
        [26.4907169618, 21.2028412887]
      ),
    ])
    expectDrawing(fillet([HALF(), LINE30()], "R", "5", "30,0", "-30,20"), [
      ellipse(0, 1.01241468667),
      line([30, 16.4302358221], [30, 60]),
      arc(
        [25, 16.4302358221],
        5,
        [26.4907169618, 21.2028412887],
        [30, 16.4302358221]
      ),
    ])
    expectDrawing(
      fillet([HALF(), LINE30()], "R", "5", "30,40", "46.0531,9.7355"),
      [
        ellipse(0.850242409909, Math.PI),
        line([30, -40], [30, 23.3642297157]),
        arc(
          [35, 23.3642297157],
          5,
          [32.990050434, 18.786009238],
          [30, 23.3642297157]
        ),
      ]
    )
    expectDrawing(fillet([SPLINE(), LINE75()], "R", "20", "75,50", "100,0"), [
      fit(
        [
          [83.1408729387, 8.65995018805],
          [100, 0],
          [150, 30],
        ],
        [
          96.9580861201, 96.9580861201, 96.9580861201, 96.9580861201,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      line([75, 24.7646422169], [75, 60]),
      arc(
        [95, 24.7646422169],
        20,
        [75, 24.7646422169],
        [83.1408729387, 8.65995018805]
      ),
    ])
  })

  it("runs an elliptical arc round its ellipse, and a spline on past its end, to the arc (p446, p448)", () => {
    expectDrawing(
      fillet([QUARTER(), upright(-30, -40, 60)], "R", "5", "-30,40", "40,15"),
      [
        ellipse(-4.15400734026, Math.PI / 2),
        line([-30, 16.4302358221], [-30, 60]),
        arc(
          [-25, 16.4302358221],
          5,
          [-30, 16.4302358221],
          [-26.4907169618, 21.2028412887]
        ),
      ]
    )
    expectDrawing(
      fillet([SPLINE(), upright(200, -100, 100)], "R", "5", "200,50", "100,0"),
      [
        fit(
          [
            [0, 0],
            [50, 30],
            [100, 0],
            [150, 30],
            [191.464466094, 71.4644660941],
          ],
          [
            0, 0, 0, 0, 58.3095189485, 116.619037897, 174.928556845,
            174.928556845, 174.928556845, 223.284018273, 223.284018273,
            223.284018273, 223.284018273,
          ]
        ),
        line([200, -100], [200, 67.9289321881]),
        arc(
          [195, 67.9289321881],
          5,
          [200, 67.9289321881],
          [191.464466094, 71.4644660941]
        ),
      ]
    )
  })

  it("leaves a closed ellipse, a circle and a closed spline as they are (p450, p453, p368, p468)", () => {
    expectDrawing(fillet([ELLIPSE(), LINE30()], "R", "5", "30,40", "40,15"), [
      same(ELLIPSE),
      line([30, 23.3642297157], [30, 60]),
      arc(
        [35, 23.3642297157],
        5,
        [30, 23.3642297157],
        [32.990050434, 18.786009238]
      ),
    ])
    const circle = () => circleOf(p(60, 0), 20, { id: "C" })
    const round = arc(
      [50.7775168578, 11.8298691748],
      5,
      [46.7852805069, 8.81954545163],
      [47.7033558104, 15.7731588997]
    )
    expectDrawing(fillet([ELLIPSE(), circle()], "R", "5", "80,0", "40,15"), [
      same(ELLIPSE),
      same(circle),
      round,
    ])
    expectDrawing(
      fillet(
        [ELLIPSE(), arcOf(p(60, 0), 20, deg(180), deg(270), { id: "A" })],
        "R",
        "5",
        "60,-20",
        "50,0"
      ),
      [
        same(ELLIPSE),
        arc([60, 0], 20, [47.7033558104, 15.7731588997], [60, -20]),
        round,
      ]
    )
    const closed = () =>
      createSpline("fit", [p(0, 0), p(50, 30), p(100, 0), p(150, 30)], {
        id: "S",
        closed: true,
      })
    expectDrawing(fillet([closed(), LINE75()], "R", "5", "75,50", "100,0"), [
      same(closed),
      line([75, -20], [75, 17.189293514]),
      arc(
        [80, 17.189293514],
        5,
        [76.6157702085, 13.5086700997],
        [75, 17.189293514]
      ),
    ])
  })

  it("rounds a spline with an ARC, a spline or an ellipse, and an ellipse with another (p456, p460, p462, p463)", () => {
    expectDrawing(
      fillet(
        [SPLINE(), arcOf(p(75, 40), 30, deg(270), 0, { id: "A" })],
        "R",
        "5",
        "75,10",
        "100,0"
      ),
      [
        fit(
          [
            [88.7639275011, 4.8232634019],
            [100, 0],
            [150, 30],
          ],
          [
            103.515638251, 103.515638251, 103.515638251, 103.515638251,
            116.619037897, 174.928556845, 174.928556845, 174.928556845,
            174.928556845,
          ]
        ),
        arc([75, 40], 30, [89.0510443565, 13.4939978026], [105, 40]),
        arc(
          [91.3928850826, 9.07633076965],
          5,
          [89.0510443565, 13.4939978026],
          [88.7639275011, 4.8232634019]
        ),
      ]
    )
    const other = () =>
      createSpline("fit", [p(60, -20), p(80, 20), p(70, 60)], { id: "T" })
    expectDrawing(fillet([SPLINE(), other()], "R", "5", "70,60", "100,0"), [
      fit(
        [
          [0, 0],
          [50, 30],
          [81.0898522232, 10.2003902493],
        ],
        [
          0, 0, 0, 0, 58.3095189485, 94.5662054947, 94.5662054947,
          94.5662054947, 94.5662054947,
        ]
      ),
      fit(
        [
          [60, -20],
          [79.2451259332, 15.2562184621],
        ],
        [0, 0, 0, 0, 39.6057798461, 39.6057798461, 39.6057798461, 39.6057798461]
      ),
      arc(
        [84.1263288428, 14.1727711146],
        5,
        [81.0898522232, 10.2003902493],
        [79.2451259332, 15.2562184621]
      ),
    ])
    expectDrawing(fillet([HALF(), SPLINE()], "R", "5", "40,15", "100,0"), [
      ellipse(0, 1.11558563563),
      fit(
        [
          [0, 0],
          [25.9720647868, 23.1689594692],
        ],
        [0, 0, 0, 0, 30.2883720763, 30.2883720763, 30.2883720763, 30.2883720763]
      ),
      arc(
        [23.1712388962, 27.3108641434],
        5,
        [25.9720647868, 23.1689594692],
        [21.9825779856, 22.4542104354]
      ),
    ])
    const upright60 = () =>
      ellipseOf(p(60, 0), p(0, 30), 0.5, {
        id: "F",
        startParam: 0,
        endParam: Math.PI,
      })
    expectDrawing(fillet([HALF(), upright60()], "R", "5", "40,15", "60,30"), [
      ellipse(0.340638063578, Math.PI),
      ellipse(1.14670093784, Math.PI),
      arc(
        [51.2060972102, 11.2438665714],
        5,
        [47.1270843833, 8.35221404074],
        [46.3288297489, 12.3448943235]
      ),
    ])
  })

  it("keeps a CV spline's piece a CV spline (p467)", () => {
    const cvSpline = createSpline(
      "cv",
      [p(0, 0), p(50, 30), p(100, 0), p(150, 30)],
      { id: "S" }
    )
    expectDrawing(fillet([cvSpline, LINE75()], "R", "5", "75,50", "100,15"), [
      cv(
        [
          [80.0134048737, 15.0044802867],
          [103.342269916, 15.0670246091],
          [126.671134958, 16.0026809747],
          [150, 30],
        ],
        [
          0.533422699158, 0.533422699158, 0.533422699158, 0.533422699158, 1, 1,
          1, 1,
        ]
      ),
      line([75, 20.0044623176], [75, 60]),
      arc(
        [80, 20.0044623176],
        5,
        [75, 20.0044623176],
        [80.0134048737, 15.0044802867]
      ),
    ])
  })

  it("puts the arc on the objects' layer or the current one, wearing the current lineweight, not the current colour (p472, p481)", () => {
    const on = (spline: string, line: string) => [
      { ...SPLINE(), layerId: spline, lineweight: 0.3 },
      { ...LINE75(), layerId: line, lineweight: 0.5 },
    ]
    const make = (entities: Entity[]) => {
      const cad = createHarness()
      cad.runtime.document.load(entities, {
        layers: [layerOf("0"), layerOf("A"), layerOf("B"), layerOf("C")],
      })
      cad.runtime.setCurrentLayer("C")
      cad.runtime.setCurrentLineweight(0.7)
      cad.runtime.setCurrentColor("#00ff00")
      cad.command("FILLET")
      return answer(cad, "R", "5", "100,0", "75,50").entities()[2] as ArcEntity
    }
    expect(make(on("A", "A"))).toMatchObject({ layerId: "A", lineweight: 0.7 })
    expect(make(on("A", "A")).color).toBeUndefined()
    expect(make(on("A", "B")).layerId).toBe("C")
  })
})

describe("FILLET of an ellipse or a spline at radius 0", () => {
  it("cuts each where they cross, kept on its picked side, a spline's piece a fit spline still (p441, p443)", () => {
    expectDrawing(fillet([SPLINE(), LINE75()], "75,50", "100,0"), [
      fit(
        [
          [75, 15],
          [100, 0],
          [150, 30],
        ],
        [
          87.4642784227, 87.4642784227, 87.4642784227, 87.4642784227,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      line([75, 15], [75, 60]),
    ])
    expectDrawing(fillet([HALF(), LINE30()], "30,40", "46.0531,9.7355"), [
      ellipse(0, 0.927295218002),
      line([30, 20], [30, 60]),
    ])
  })

  it("reaches a crossing off an elliptical arc from the end its pick is nearer, and grows a spline to one past its end (p445, p237)", () => {
    expectDrawing(
      fillet([QUARTER(), upright(-30, -40, 60)], "-30,40", "40,15"),
      [ellipse(-4.06888787159, Math.PI / 2), line([-30, 20], [-30, 60])]
    )
    const far = () => lineOf(p(150, 150), p(250, 150), { id: "M" })
    expectDrawing(
      fillet([SPLINE(), upright(200, -100, 100), far()], "200,50", "0,0"),
      [
        fit(
          [
            [0, 0],
            [50, 30],
            [100, 0],
            [150, 30],
            [200, 80],
          ],
          [
            0, 0, 0, 0, 58.3095189485, 116.619037897, 174.928556845,
            174.928556845, 174.928556845, 233.238075794, 233.238075794,
            233.238075794, 233.238075794,
          ]
        ),
        line([200, -100], [200, 80]),
        same(far),
      ]
    )
  })

  it("trims a line or an ARC to a closed ellipse, cuts a spline at a circle and two splines at their crossing (p324, p452, p458, p461)", () => {
    expectDrawing(fillet([ELLIPSE(), LINE30()], "30,40", "50,0"), [
      same(ELLIPSE),
      line([30, 20], [30, 60]),
    ])
    expectDrawing(
      fillet(
        [ELLIPSE(), arcOf(p(60, 0), 20, deg(180), deg(270), { id: "A" })],
        "60,-20",
        "50,0"
      ),
      [
        same(ELLIPSE),
        arc([60, 0], 20, [43.9444872454, -11.9256241005], [60, -20]),
      ]
    )
    const circle = () => circleOf(p(75, 40), 30, { id: "C" })
    expectDrawing(fillet([SPLINE(), circle()], "75,10", "100,0"), [
      fit(
        [
          [80.6509060547, 10.5370188073],
          [100, 0],
          [150, 30],
        ],
        [
          94.0543106961, 94.0543106961, 94.0543106961, 94.0543106961,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      same(circle),
    ])
    expectDrawing(
      fillet(
        [
          SPLINE(),
          createSpline("fit", [p(60, -20), p(80, 20), p(70, 60)], { id: "T" }),
        ],
        "70,60",
        "100,0"
      ),
      [
        fit(
          [
            [78.4619510559, 12.2437165464],
            [100, 0],
            [150, 30],
          ],
          [
            91.5015724365, 91.5015724365, 91.5015724365, 91.5015724365,
            116.619037897, 174.928556845, 174.928556845, 174.928556845,
            174.928556845,
          ]
        ),
        fit(
          [
            [78.4619510559, 12.2437165464],
            [80, 20],
            [70, 60],
          ],
          [
            36.3218254741, 36.3218254741, 36.3218254741, 36.3218254741,
            44.72135955, 85.9524158062, 85.9524158062, 85.9524158062,
            85.9524158062,
          ]
        ),
      ]
    )
  })

  it("makes nothing and says nothing where they do not meet, or leave nothing to cut (p236, p454, p471)", () => {
    for (const [entities, picks] of [
      [() => [ELLIPSE(), upright(200, -100, 100)], ["200,50", "50,0"]],
      [() => [QUARTER(), upright(100, -40, 60)], ["100,40", "40,15"]],
      [
        () => [ELLIPSE(), circleOf(p(60, 0), 20, { id: "C" })],
        ["80,0", "40,15"],
      ],
    ] as const) {
      const cad = fillet(entities(), ...picks)
      expect(cad.commandLog().at(-1)).toBe(
        `Select second object or shift-select to apply corner or [Radius]: ${picks[1]}`
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entities()).toEqual(entities())
    }
  })
})

describe("FILLET of an ellipse or a spline: what a mode finds", () => {
  it("reads the spline Last finds at its start, an elliptical arc at its middle, a fence's where it crosses (p477, p478, p480)", () => {
    const last = fillet([LINE75(), SPLINE()], "R", "5", "L", "75,50")
    line([75, 12.5947474934], [75, 60])(last.entities()[0])
    arc(
      [70, 12.5947474934],
      5,
      [73.115337072, 16.5055881866],
      [75, 12.5947474934]
    )(last.entities()[2])
    const half = fillet([LINE30(), HALF()], "R", "5", "L", "30,40")
    ellipse(1.07695848878, Math.PI)(half.entities()[1])
    const fence = fillet(
      [LINE75(), SPLINE()],
      "R",
      "5",
      "F",
      "90,-20",
      "90,40",
      "",
      "75,50"
    )
    expectDrawing(fence, [
      line([75, 17.4052525066], [75, 60]),
      fit(
        [
          [76.884662928, 13.4944118134],
          [100, 0],
          [150, 30],
        ],
        [
          89.6621541969, 89.6621541969, 89.6621541969, 89.6621541969,
          116.619037897, 174.928556845, 174.928556845, 174.928556845,
          174.928556845,
        ]
      ),
      arc(
        [80, 17.4052525066],
        5,
        [75, 17.4052525066],
        [76.884662928, 13.4944118134]
      ),
    ])
  })
})

describe("FILLET of an ellipse or a spline: refusals", () => {
  const both = (entities: () => Entity[], ...texts: string[]) => [
    fillet(entities(), ...texts),
    answer(
      (() => {
        const cad = createHarness({ entities: entities(), locale: es })
        cad.command("_FILLET")
        return cad
      })(),
      ...texts.map((text) => (/^[A-Z]$/.test(text) ? `_${text}` : text))
    ),
  ]

  it("says no fillet fits where a line would keep nothing (p469, p476)", () => {
    const [en, sp] = both(
      () => [HALF(), LINE30()],
      "R",
      "100",
      "30,40",
      "40,15"
    )
    expect(en.commandLog().at(-1)).toBe("No valid fillet with radius 100.00")
    expect(sp.commandLog().at(-1)).toBe(
      "Imposible hacer un empalme de radio 100.00"
    )
    expect(en.activeToolId()).toBe("select")
    expect(en.entities()).toEqual([HALF(), LINE30()])
  })

  it("is unable where the offsets never meet (p470)", () => {
    const [en, sp] = both(
      () => [ELLIPSE(), upright(200, -100, 100)],
      "R",
      "5",
      "200,50",
      "40,15"
    )
    expect(en.commandLog().at(-1)).toBe("Unable to fillet curves.")
    expect(sp.commandLog().at(-1)).toBe("No se pueden empalmar curvas.")
  })

  it("refuses a spline out of every plane (p479)", () => {
    const rising = () =>
      createSpline(
        "fit",
        [
          { x: 0, y: 0, z: 0 },
          { x: 50, y: 30, z: 10 },
          { x: 100, y: 0, z: 0 },
          { x: 150, y: 30, z: 10 },
        ],
        { id: "S" }
      )
    const [en, sp] = both(
      () => [rising(), LINE75()],
      "R",
      "5",
      "75,50",
      "100,0"
    )
    expect(en.commandLog().at(-1)).toBe("The entities are non-coplanar.")
    expect(sp.commandLog().at(-1)).toBe("Los objetos no son coplanares.")
    expect(en.activeToolId()).toBe("select")
  })

  it("cannot fillet one with a polyline's segment, at any radius (p464–p466)", () => {
    for (const radius of ["5", "0"]) {
      const cad = fillet(
        [SPLINE(), polylineOf([p(75, -20), p(75, 60)], { id: "P" })],
        "R",
        radius,
        "75,50",
        "100,0"
      )
      expect(cad.commandLog().at(-1)).toBe(
        "Cannot fillet between these two entities."
      )
    }
  })

  it("in Multiple asks the first prompt again after a refusal, and Undo takes a fillet back (p475)", () => {
    const cad = fillet(
      [SPLINE(), LINE75(), HALF(), LINE30()].map((entity) =>
        entity.id === "L" && "start" in entity && entity.start.x === 30
          ? { ...entity, id: "M" }
          : entity
      ),
      "M",
      "R",
      "5",
      "75,50",
      "100,0",
      "U"
    )
    expect(cad.byId("S")).toEqual(SPLINE())
    answer(cad, "75,50", "100,0", "30,40", "50,0")
    expect(cad.commandLog().at(-1)).toBe("Unable to fillet curves.")
    expect(cad.state().commandLine.prompt).toBe(
      "FILLET Select first object or [Undo/Polyline/Radius/Multiple]:"
    )
    answer(cad, "30,40", "0,25", "")
    expect(cad.entities()).toHaveLength(6)
    cad.runtime.setCommandLineText("U")
    cad.runtime.submitCommandLine()
    expect(cad.byId("S")).toEqual(SPLINE())
    expect(cad.entities()).toHaveLength(4)
  })

  it("says Polyline's words of one (p476)", () => {
    const cad = fillet([HALF()], "P", "40,15")
    expect(cad.commandLog().at(-1)).toBe("Object selected is not a 2D polyline")
  })
})

describe("FILLET of an ellipse or a spline: the look", () => {
  const colours = (cad: CadHarness) =>
    cad
      .scene()
      .primitives.flatMap((prim) =>
        "stroke" in prim && prim.stroke ? [prim.stroke.color] : []
      )

  it("rolls over a spline at the first prompt, and ghosts at the second what the click makes (desktop corners/d01-1, d01-2)", () => {
    const cad = createHarness({ entities: [SPLINE(), LINE75()] })
    cad.command("FILLET").option("Radius").type("5").enter()
    cad.moveTo(p(100, 0))
    expect(colours(cad)).toContain(THEME.entityHover)
    cad.click(p(100, 0)).moveTo(p(75, 50))
    const arcs = cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "arc" && prim.stroke?.color === THEME.selected
      )
    expect(arcs).toHaveLength(1)
    cad.click(p(75, 50))
    expectDrawing(cad, [
      (entity) => expect(entity.id).toBe("S"),
      line([75, -20], [75, 17.4052525066]),
      arc(
        [80, 17.4052525066],
        5,
        [76.884662928, 13.4944118134],
        [75, 17.4052525066]
      ),
    ])
  })
})
