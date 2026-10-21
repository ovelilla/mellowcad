import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  PolylineEntity,
  SplineEntity,
} from "../../domain/entities"
import {
  closestOnEntity,
  ellipseEndPoint,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseStartPoint,
  isFullEllipse,
  splineEndPoint,
  splineStartPoint,
} from "../../domain/entities"
import { COLOR_BYLAYER } from "../../domain/colors"
import { type Vec2, V } from "../../geometry/Vec2"
import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, deg, lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive } from "../../scene/types"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What is drawn but the grid and the crosshair: kind, colour, dash. */
const aids = new Set<string>([
  THEME.crosshair,
  THEME.gridMinor,
  THEME.gridMajor,
  THEME.axisX,
  THEME.axisY,
])

/** A command's jig, each primitive as its kind, colour and dash. */
function jig(cad: CadHarness): string[] {
  return cad.scene().primitives.flatMap((q) => {
    const stroke = "stroke" in q ? q.stroke : undefined
    if (!stroke || aids.has(stroke.color)) return []
    return [`${q.kind} ${stroke.color}${stroke.dash ? " dashed" : ""}`]
  })
}

/** CECOLOR 1, the colour a jig should wear. */
function red(cad: CadHarness): string {
  answer(cad, "-COLOR", "1")
  return cad.runtime.document.getSettings().currentColor as string
}

/**
 * The draw commands. Each is checked through both of its input routes — picking
 * with the pointer and typing exact coordinates — because they take different
 * paths through the tool (`onPointerDown` versus the dynamic-input `commitRaw`)
 * and only one of them is usually exercised by hand.
 */

describe("CIRCLE", () => {
  it("asks each question of its modes, CIRCLERAD as the radius default", () => {
    // probes circle/p106, p108 (the prompts), p115, p120 (CIRCLERAD at the
    // radius and twice it at the diameter).
    const cad = createHarness()

    cad.command("CIRCLE").click(p(0, 0)).type("10").enter()
    cad.command("CIRCLE").click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle or [Diameter] <10.00>:"
    )
    cad.option("Diameter")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify diameter of circle <20.00>:"
    )
    cad.enter()
    cad.command("CIRCLE").option("2P")
    expect(cad.state().dynamicInput?.prompt).toBe(
      "Specify first end point of circle's diameter:"
    )
    cad.click(p(0, 100))
    expect(cad.state().dynamicInput?.prompt).toBe(
      "Specify second end point of circle's diameter:"
    )
    cad.escape()

    expect(cad.commandLog()).toEqual([
      "CIRCLE",
      "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:",
      "Specify radius of circle or [Diameter]: 10",
      "CIRCLE",
      "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:",
      "Specify radius of circle or [Diameter] <10.00>: D",
      "Specify diameter of circle <20.00>:",
      "CIRCLE",
      "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]: 2P",
      "Specify first end point of circle's diameter:",
      "Specify second end point of circle's diameter: *Cancel*",
    ])
    expect(
      cad.entities().map((e) => (e.type === "circle" ? e.radius : 0))
    ).toEqual([10, 10])
  })

  it("asks the Ttr objects, then the radius or its second point", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(0, 0), p(0, 100))],
    })

    cad.command("CIRCLE").option("Ttr")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify point on object for first tangent of circle:"
    )
    cad.click(p(50, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify point on object for second tangent of circle:"
    )
    cad.click(p(0, 50))
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe("CIRCLE Specify second point:")
  })

  it("draws from a centre and a radius pick", () => {
    const cad = createHarness()

    cad.command("CIRCLE").click(p(0, 0)).click(p(50, 0))

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(0, 0))
    expect(circle.radius).toBeCloseTo(50)
  })

  it("draws from typed coordinates and a typed radius", () => {
    const cad = createHarness()

    cad.command("CIRCLE").type("10,20").enter().type("50").enter()

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(10, 20))
    expect(circle.radius).toBeCloseTo(50)
  })

  it("ends after a single circle, like AutoCAD", () => {
    const cad = createHarness()

    cad.command("CIRCLE").click(p(0, 0)).click(p(50, 0))

    expect(cad.activeToolId()).toBe("select")
  })

  it("rejects a zero radius and keeps prompting", () => {
    const cad = createHarness()

    cad.command("CIRCLE").click(p(0, 0)).type("0").enter()

    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("circle")
  })

  it("refuses a diameter of 0 or less, as the radius", () => {
    // probe circle/p118: FOO, 0, -5 and `_D` at `Specify diameter of circle:`.
    const cad = answer(createHarness(), "CIRCLE", "0,0", "D")
    answer(cad, "FOO", "0", "-5", "_D", "20")
    expect(cad.commandLog().slice(-9)).toEqual([
      "Specify diameter of circle: FOO",
      "Requires numeric distance or second point.",
      "Specify diameter of circle: 0",
      "Value must be positive and nonzero.",
      "Specify diameter of circle: -5",
      "Value must be positive and nonzero.",
      "Specify diameter of circle: _D",
      "Requires numeric distance or second point.",
      "Specify diameter of circle: 20",
    ])
    expect(cad.only<CircleEntity>("circle").radius).toBe(10)
  })

  it("keeps the last circle's radius as CIRCLERAD, whatever made it", () => {
    // probe circle/p162: 2P → 5, 3P → 7.0711, a diameter of 30 → 15.
    const cad = answer(createHarness(), "CIRCLE", "2P", "0,0", "10,0")
    answer(cad, "CIRCLE", "50,50")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle or [Diameter] <5.00>:"
    )
    answer(cad, "", "CIRCLE", "3P", "0,0", "10,0", "0,10", "CIRCLE", "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle or [Diameter] <7.07>:"
    )
    answer(cad, "D")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify diameter of circle <14.14>:"
    )
    answer(cad, "30", "CIRCLE", "0,0")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify radius of circle or [Diameter] <15.00>:"
    )
  })

  it("halves the typed value in Diameter mode", () => {
    const cad = createHarness()

    cad.command("CIRCLED").type("0,0").enter().type("200").enter()

    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(100)
  })

  it("2-Point takes the two ends of a diameter", () => {
    const cad = createHarness()

    cad.command("CIRCLE2P").click(p(-100, 0)).click(p(100, 0))

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(0, 0))
    expect(circle.radius).toBeCloseTo(100)
  })

  it("3-Point circumscribes the three picks", () => {
    const cad = createHarness()

    cad.command("CIRCLE3P").click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))

    const circle = cad.only<CircleEntity>("circle")
    expect(circle.center).toBeCloseToPoint(p(0, 0), 5)
    expect(circle.radius).toBeCloseTo(100, 5)
  })

  it("ends 2P and 3P that make no circle with *Invalid*", () => {
    // probes circle/p123 (2P on one point), p124 (3P on one line), p125, p164:
    // `*Invalid*` (es `*No válido*`) and the end, LASTPOINT the last point.
    for (const [locale, said] of [
      [undefined, "*Invalid*"],
      [es, "*No válido*"],
    ] as const) {
      const cad = createHarness(locale ? { locale } : {})
      answer(cad, "_CIRCLE", "_2P", "0,0", "0,0")
      expect(cad.commandLog().at(-1)).toBe(said)
      expect(cad.activeToolId()).toBe("select")

      answer(cad, "_CIRCLE", "_3P", "0,0", "10,0", "20,0")
      expect(cad.commandLog().at(-1)).toBe(said)
      expect(cad.activeToolId()).toBe("select")
      expect(cad.entityCount).toBe(0)
      answer(cad, "_ID", "@")
      expect(cad.commandLog().at(-1)).toMatch(/X = 20\.00 +Y = 0\.00/)
    }
  })

  it("offers [3P/2P/Ttr] at the centre and [Diameter] at the radius", () => {
    const cad = createHarness()

    cad.command("CIRCLE")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:"
    )
    cad.click(p(0, 0))
    expect(cad.optionIds()).toEqual(["Diameter"])
    cad.option("Diameter")
    expect(cad.optionIds()).toEqual([])
    cad.click(p(80, 0))

    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(40)
  })

  it("switches to three points or a diameter's two ends from the centre prompt", () => {
    const cad = createHarness()

    cad.command("CIRCLE").option("3P")
    cad.click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))
    cad
      .command("CIRCLE")
      .option("2P")
      .type("#300,0")
      .enter()
      .type("@40,0")
      .enter()

    const [three, two] = cad.entities() as CircleEntity[]
    expect(three.center).toBeCloseToPoint(p(0, 0), 5)
    expect(three.radius).toBeCloseTo(100, 5)
    expect(two.center).toBeCloseToPoint(p(320, 0))
    expect(two.radius).toBeCloseTo(20)
  })

  it("asks Ttr's radius in its own words, POLYGON's in its own", () => {
    // probes circle/p187 (es `Precise radio del círculo`, table 20419) and
    // p188 (POLYGON's `Precise radio de círculo`, 25454).
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 10), circleOf(p(40, 0), 10)],
    })
    answer(cad, "_CIRCLE", "_T")
    cad.click(p(0, 10)).click(p(40, 10))
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCULO Precise radio del círculo:"
    )
    cad.escape()
    answer(cad, "_POLYGON", "6", "0,0", "_I")
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Precise radio de círculo:"
    )
  })

  it("Ttr touches two lines, on the side of the picks", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0)), lineOf(p(0, -100), p(0, 100))],
    })

    cad.command("CIRCLE").option("Ttr").click(p(40, 0)).click(p(0, 40))
    cad.type("10").enter()
    cad.command("CIRCLE").option("Ttr").click(p(-40, 0)).click(p(0, -40))
    cad.type("10").enter()

    const [first, second] = cad.entities().slice(2) as CircleEntity[]
    expect(first.center).toBeCloseToPoint(p(10, 10))
    expect(second.center).toBeCloseToPoint(p(-10, -10))
    expect(second.radius).toBeCloseTo(10)
  })

  it("Ttr touches a circle and a line", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 50), lineOf(p(-100, 80), p(100, 80))],
    })

    cad.command("CIRCLE").option("Ttr").click(p(0, 50)).click(p(10, 80))
    cad.type("15").enter()

    const circle = cad.latest() as CircleEntity
    expect(circle.center).toBeCloseToPoint(p(0, 65))
    expect(circle.radius).toBeCloseTo(15)
  })

  it("Ttr takes the radius as two points, or CIRCLERAD with Enter", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 0), p(100, 0)), lineOf(p(0, -100), p(0, 100))],
    })

    cad.command("CIRCLE").option("Ttr").click(p(40, 0)).click(p(0, 40))
    cad.click(p(300, 300)).click(p(312, 300))
    cad.command("CIRCLE").option("Ttr").click(p(-40, 0)).click(p(0, 40))
    cad.moveTo(p(300, 300)).enter()

    const [pointed, entered] = cad.entities().slice(2) as CircleEntity[]
    expect(pointed.center).toBeCloseToPoint(p(12, 12))
    expect(entered.center).toBeCloseToPoint(p(-12, 12))
    expect(entered.radius).toBeCloseTo(12)
  })

  it("Ttr reports a circle that does not exist and ends", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0)),
        lineOf(p(-100, 10), p(100, 10)),
      ],
    })

    cad.command("CIRCLE").option("Ttr").click(p(0, 0)).click(p(0, 10))
    cad.type("2").enter()

    expect(cad.entityCount).toBe(2)
    expect(cad.commandLog().at(-1)).toBe("Circle does not exist.")
    expect(cad.activeToolId()).toBe("select")
  })

  it("runs the rail's entries as the ribbon's macros", () => {
    // desktop circle/d01, d02, probes p105–p107: the ribbon's Circle buttons
    // run `^C^C_circle`, `_circle \_d`, `_circle _2p`, `_circle _3p`; the
    // desktop writes the prompt the macro's answer opens on its line.
    const run = (id: string, ...answers: string[]) => {
      const cad = createHarness()
      cad.tool(id)
      expect(cad.activeToolId()).toBe(id)
      answer(cad, ...answers)
      return cad
    }
    const centre =
      "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:"

    const radius = run("circle", "0,0", "5")
    expect(radius.commandLog()).toEqual([
      "_circle",
      `${centre} 0,0`,
      "Specify radius of circle or [Diameter]: 5",
    ])

    const diameter = run("circlediameter", "0,0", "20")
    expect(diameter.commandLog()).toEqual([
      "_circle",
      `${centre} 0,0`,
      "Specify radius of circle or [Diameter]: _d Specify diameter of circle: 20",
    ])
    expect(diameter.only<CircleEntity>("circle").radius).toBeCloseTo(10)

    const two = run("circle2p", "0,0", "10,0")
    expect(two.commandLog()).toEqual([
      "_circle",
      `${centre} _2p Specify first end point of circle's diameter: 0,0`,
      "Specify second end point of circle's diameter: 10,0",
    ])

    const three = run("circle3p", "0,0", "10,0", "0,10")
    expect(three.commandLog()).toEqual([
      "_circle",
      `${centre} _3p Specify first point on circle: 0,0`,
      "Specify second point on circle: 10,0",
      "Specify third point on circle: 0,10",
    ])

    const spanish = createHarness({ locale: es })
    spanish.tool("circle2p")
    expect(spanish.state().commandLine.prompt).toBe(
      "CIRCULO Precise primer punto final del diámetro del círculo:"
    )
    answer(spanish, "0,0", "10,0")
    expect(spanish.commandLog().slice(0, 2)).toEqual([
      "_circle",
      "Precise punto central para círculo o [3P/2P/Ttr (Tangente tangente radio)]: _2p Precise primer punto final del diámetro del círculo: 0,0",
    ])
  })

  it("keeps a macro's pause through a transparent command", () => {
    const cad = createHarness()
    cad.tool("circlediameter")
    answer(cad, "'ZOOM", "E", "0,0", "20")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]: 0,0",
      "Specify radius of circle or [Diameter]: _d Specify diameter of circle: 20",
    ])
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(10)
  })

  it("keeps CIRCLED, CIRCLE2P and CIRCLE3P typable, as the rail runs them", () => {
    const cad = createHarness()
    cad.command("CIRCLED").type("0,0").enter().type("200").enter()
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(100)
    expect(cad.commandLog()[0]).toBe("CIRCLED")
  })

  it("takes 2P's and 3P's later points in X and Y only", () => {
    // probes circle/p16, p20 (2P), p18 (`*` in UCS Z 30), p180, p181 (3P): a
    // Z or `*` typed there is `Invalid 2D point.` and the point asked again.
    const cad = answer(createHarness(), "CIRCLE", "2P", "0,0,0")
    for (const typed of ["10,0,5", "@10,0,5", "*20,0"]) {
      answer(cad, typed)
      expect(cad.commandLog().slice(-2)).toEqual([
        `Specify second end point of circle's diameter: ${typed}`,
        "Invalid 2D point.",
      ])
    }
    answer(cad, "10,0")
    expect(cad.only<CircleEntity>("circle").radius).toBeCloseTo(5)

    answer(cad, "CIRCLE", "3P", "0,0,0", "10,0,0", "@10,0,5", "10,0")
    answer(cad, "0,10,5")
    expect(cad.commandLog().slice(-7)).toEqual([
      "Specify second point on circle: 10,0,0",
      "Invalid 2D point.",
      "Specify second point on circle: @10,0,5",
      "Invalid 2D point.",
      "Specify second point on circle: 10,0",
      "Specify third point on circle: 0,10,5",
      "Invalid 2D point.",
    ])
    expect(cad.activeToolId()).toBe("circle")
  })

  it("bends the radius's pick with Ortho, never 2P's or 3P's later picks", () => {
    // desktop circle/d12: 2P's and 3P's later prompts have no base point
    // (UseBasePoint false), so Ortho has nothing to bend them about; the
    // radius's pick is bent from the centre.
    const cad = createHarness()
    cad.press("F8")
    cad.command("CIRCLE").option("2P").click(p(40, 10)).click(p(55, 18))
    const two = cad.latest() as CircleEntity
    expect(two.center).toBeCloseToPoint(p(47.5, 14))
    expect(two.radius).toBeCloseTo(8.5)

    const picks = [p(70, 10), p(80, 14), p(74, 25)]
    cad.command("CIRCLE").option("3P")
    for (const pick of picks) cad.click(pick)
    const three = cad.latest() as CircleEntity
    for (const pick of picks) {
      expect(V.distance(three.center, pick)).toBeCloseTo(three.radius)
    }

    cad.command("CIRCLE").click(p(20, 40)).click(p(26, 43))
    expect((cad.latest() as CircleEntity).radius).toBeCloseTo(6)
  })

  describe("Enter at a prompt with no default", () => {
    // Every CIRCLE prompt is AllowNone:false: Enter is refused in the prompt's
    // own words and the prompt asked again, nothing given lost (probes
    // circle/p109, p114, p119, p126–p130, p306, p309, p310, p376, p377; all
    // with CIRCLERAD 0).
    const tangents = () => [circleOf(p(0, 0), 10), circleOf(p(40, 0), 10)]
    const CASES: ReadonlyArray<{
      prompt: string
      reach: (cad: CadHarness) => void
      en: string
      es: string
    }> = [
      {
        prompt:
          "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:",
        reach: (cad) => answer(cad, "_CIRCLE"),
        en: "Point or option keyword required.",
        es: "Se requiere un punto o una opción.",
      },
      {
        prompt: "Specify radius of circle or [Diameter]:",
        reach: (cad) => answer(cad, "_CIRCLE", "100,100"),
        en: 'Requires numeric radius, point on circumference, or "D".',
        es: 'Precisa un radio numérico, un punto en la circunferencia, o "D".',
      },
      {
        prompt: "Specify diameter of circle:",
        reach: (cad) => answer(cad, "_CIRCLE", "100,100", "_D"),
        en: "Requires numeric distance or second point.",
        es: "Requiere una distancia numérica o un segundo punto.",
      },
      {
        prompt: "Specify first end point of circle's diameter:",
        reach: (cad) => answer(cad, "_CIRCLE", "_2P"),
        en: "Invalid point.",
        es: "Punto no válido.",
      },
      {
        prompt: "Specify second end point of circle's diameter:",
        reach: (cad) => answer(cad, "_CIRCLE", "_2P", "100,100"),
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify first point on circle:",
        reach: (cad) => answer(cad, "_CIRCLE", "_3P"),
        en: "Invalid point.",
        es: "Punto no válido.",
      },
      {
        prompt: "Specify second point on circle:",
        reach: (cad) => answer(cad, "_CIRCLE", "_3P", "100,100"),
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify third point on circle:",
        reach: (cad) => answer(cad, "_CIRCLE", "_3P", "100,100", "110,100"),
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify point on object for first tangent of circle:",
        reach: (cad) => answer(cad, "_CIRCLE", "_T"),
        en: "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
        es: "Requiere una REFENT TAN y la designación de un círculo, arco o línea.",
      },
      {
        prompt: "Specify point on object for second tangent of circle:",
        reach: (cad) => {
          answer(cad, "_CIRCLE", "_T")
          cad.click(p(0, 10))
        },
        en: "Requires a TAN object-snap and selection of Circle, Arc, or Line.",
        es: "Requiere una REFENT TAN y la designación de un círculo, arco o línea.",
      },
      {
        prompt: "Specify radius of circle:",
        reach: (cad) => {
          answer(cad, "_CIRCLE", "_T")
          cad.click(p(0, 10)).click(p(40, 10))
        },
        en: "Requires numeric distance or two points.",
        es: "Requiere una distancia numérica o dos puntos.",
      },
    ]

    it.each(CASES)("refuses it at $prompt and asks again", (c) => {
      const cad = createHarness({ entities: tangents() })
      c.reach(cad)
      const prompt = cad.state().commandLine.prompt
      answer(cad, "")

      expect(cad.commandLog().slice(-2)).toEqual([c.prompt, c.en])
      expect(cad.state().commandLine.prompt).toBe(prompt)
      expect(cad.entityCount).toBe(2)

      const spanish = createHarness({ entities: tangents(), locale: es })
      c.reach(spanish)
      spanish.enter()
      expect(spanish.commandLog().at(-1)).toBe(c.es)
      expect(spanish.activeToolId()).toBe("circle")
    })

    it("keeps what was given: the centre, then a radius makes the circle", () => {
      // probe circle/p376: Enter at the radius, then 5.
      const cad = answer(createHarness(), "CIRCLE", "0,0", "", "5")
      const circle = cad.only<CircleEntity>("circle")
      expect(circle.center).toBeCloseToPoint(p(0, 0))
      expect(circle.radius).toBe(5)
    })
  })

  describe("its jig, as the desktop draws it", () => {
    const sizeLine = `segment ${THEME.dashedRubberBand} dashed`

    it("draws the ghost in the current colour and the size line amber and dashed", () => {
      // desktop circle/d01, d05: with CECOLOR 1 the ghost is red at the radius
      // and the diameter, the line from the centre to the cursor amber and
      // dashed (the trace's UseDashedLine), past the rim at the diameter.
      const cad = createHarness()
      const color = red(cad)
      cad.command("CIRCLE").click(p(0, 0)).moveTo(p(30, 40))
      expect(jig(cad)).toEqual([sizeLine, `circle ${color}`])
      const line = (q: ScenePrimitive) =>
        q.kind === "segment" && q.stroke.dash !== undefined
      expect(cad.scene().primitives.find(line)).toEqual(
        expect.objectContaining({
          a: expect.objectContaining(cad.toScreen(p(0, 0))),
          b: expect.objectContaining(cad.toScreen(p(30, 40))),
          stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
        })
      )

      cad.option("Diameter").moveTo(p(30, 40))
      expect(jig(cad)).toEqual([sizeLine, `circle ${color}`])
      const ghost = cad.scene().primitives.find((q) => q.kind === "circle")
      expect(ghost).toEqual(expect.objectContaining({ radius: 25 }))
      expect(cad.scene().primitives.find(line)).toEqual(
        expect.objectContaining({
          b: expect.objectContaining(cad.toScreen(p(30, 40))),
        })
      )
    })

    it("draws no chord at 2P and nothing at 3P's second point", () => {
      // desktop circle/d02: 2P shows only the ghost; 3P nothing after its
      // first point, then the ghost through the two points and the cursor.
      const cad = createHarness()
      const color = red(cad)
      cad.command("CIRCLE").option("2P").click(p(0, 0)).moveTo(p(30, 40))
      expect(jig(cad)).toEqual([`circle ${color}`])

      cad.escape().command("CIRCLE").option("3P").click(p(0, 0))
      cad.moveTo(p(30, 40))
      expect(jig(cad)).toEqual([])
      cad.click(p(30, 40)).moveTo(p(60, 0))
      expect(jig(cad)).toEqual([`circle ${color}`])
    })

    it("draws Ttr's ghost in the current colour", () => {
      // desktop circle/d03 (nothing at the radius until it is given) and d01.
      const cad = createHarness({
        entities: [lineOf(p(-20, 40), p(60, 40)), circleOf(p(0, 0), 10)],
      })
      const color = red(cad)
      cad.command("CIRCLE").option("Ttr").click(p(30, 40)).click(p(0, 10))
      const objects = jig(cad)
      cad.type("20")
      expect(jig(cad)).toEqual([...objects, `circle ${color}`])
    })
  })
})

describe("ARC", () => {
  describe("its jig, as the desktop draws it", () => {
    const rubberLine = `segment ${THEME.dashedRubberBand} dashed`
    /** The amber dashed line runs from `from` to the cursor at `to`. */
    const runs = (cad: CadHarness, from: Vec2, to: Vec2) =>
      expect(
        cad
          .scene()
          .primitives.find(
            (q) => q.kind === "segment" && q.stroke.dash !== undefined
          )
      ).toEqual(
        expect.objectContaining({
          a: expect.objectContaining(cad.toScreen(from)),
          b: expect.objectContaining(cad.toScreen(to)),
          stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
        })
      )

    it("draws 3P's line from the start, then the ghost alone", () => {
      // desktop arc/d01, d02: with CECOLOR 1 the ghost is red; the line from
      // the start to the cursor at the second point is amber and dashed, and
      // at the end the ghost is drawn without one.
      const cad = createHarness()
      const color = red(cad)
      cad.command("ARC").click(p(0, 0)).moveTo(p(30, 40))
      expect(jig(cad)).toEqual([rubberLine])
      runs(cad, p(0, 0), p(30, 40))

      cad.click(p(30, 40)).moveTo(p(60, 0))
      expect(jig(cad)).toEqual([`arc ${color}`])
    })

    it("draws a centre mode's lines and its ghost in the current colour", () => {
      // desktop arc/d03, d04: SCE's line from the start at the centre prompt,
      // CSE's from the centre at the start prompt; at the end the line from
      // the centre to the cursor and the red ghost.
      const sce = createHarness()
      const color = red(sce)
      sce.command("ARCSCE").click(p(100, 0)).moveTo(p(0, 0))
      expect(jig(sce)).toEqual([rubberLine])
      runs(sce, p(100, 0), p(0, 0))
      sce.click(p(0, 0)).moveTo(p(0, 100))
      expect(jig(sce)).toEqual([rubberLine, `arc ${color}`])
      runs(sce, p(0, 0), p(0, 100))

      const cse = createHarness()
      red(cse)
      cse.command("ARCCSE").click(p(0, 0)).moveTo(p(100, 0))
      expect(jig(cse)).toEqual([rubberLine])
      runs(cse, p(0, 0), p(100, 0))
      cse.click(p(100, 0)).moveTo(p(0, 100))
      expect(jig(cse)).toEqual([rubberLine, `arc ${color}`])
      runs(cse, p(0, 0), p(0, 100))
    })
  })

  it("3-Point sweeps counter-clockwise through the middle pick", () => {
    // probe arc/p01.
    const cad = createHarness()

    cad.command("ARC").click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0), 5)
    expect(arc.radius).toBeCloseTo(100, 5)
    expect(arc.startAngle).toBeCloseToAngle(0, 5)
    expect(arc.endAngle).toBeCloseToAngle(Math.PI, 5)
  })

  it("Start-Centre-End builds the quarter arc", () => {
    // probes arc/p03, p171 (the sweep always counter-clockwise).
    const cad = createHarness()

    cad.command("ARCSCE").click(p(100, 0)).click(p(0, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.radius).toBeCloseTo(100)
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("Centre-Start-End takes the centre first", () => {
    // probe arc/p02.
    const cad = createHarness()

    cad.command("ARCCSE").click(p(0, 0)).click(p(100, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("asks for the centre first with Center at the start point", () => {
    // probes arc/p02, p118: no `or` where Angle and chord Length are not
    // offered.
    const cad = createHarness()

    cad.command("ARC").option("Center")
    expect(cad.state().commandLine.prompt).toBe(
      "ARC Specify center point of arc:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARC Specify start point of arc:"
    )
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARC Specify end point of arc (hold Ctrl to switch direction):"
    )
    cad.click(p(0, 100))

    expect(cad.commandLog()).toEqual([
      "ARC",
      "Specify start point of arc or [Center]: C",
      "Specify center point of arc:",
      "Specify start point of arc:",
      "Specify end point of arc (hold Ctrl to switch direction):",
    ])
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("asks for the centre next with Center at the second point", () => {
    // probes arc/p03, p01 (3P's end, no keyword).
    const cad = createHarness()

    cad.command("ARC").click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "ARC Specify second point of arc or [Center]:"
    )
    cad.option("Center").click(p(0, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
    cad.command("ARC").click(p(0, 0)).click(p(50, 50))
    expect(cad.state().commandLine.prompt).toBe("ARC Specify end point of arc:")
  })

  it("runs clockwise while Ctrl is held at the end point", () => {
    // desktop arc/d03: Ctrl at the pick makes it clockwise.
    const cad = createHarness()

    cad.command("ARCCSE").click(p(0, 0)).click(p(100, 0))
    cad.click(p(0, 100), { ctrlKey: true })

    // Clockwise from 0° round to 90°: counter-clockwise from 90° to 0°.
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(0)
  })

  describe("Enter", () => {
    // Every later ARC prompt is AllowNone false: Enter is refused in the
    // prompt's words and asked again, nothing given lost (probes arc/p113–p118,
    // en and es).
    const CASES: ReadonlyArray<{
      prompt: string
      reach: string[]
      rest: string[]
      en: string
      es: string
    }> = [
      {
        prompt: "Specify second point of arc or [Center]:",
        reach: ["ARC", "0,0"],
        rest: ["10,10", "20,0"],
        en: "2D point or option keyword required.",
        es: "Se requiere un punto 2D o una opción.",
      },
      {
        prompt: "Specify end point of arc:",
        reach: ["ARC", "0,0", "10,10"],
        rest: ["20,0"],
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify center point of arc:",
        reach: ["ARC", "10,0", "C"],
        rest: ["0,0", "0,10"],
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify center point of arc:",
        reach: ["ARC", "C"],
        rest: ["0,0", "10,0", "0,10"],
        en: "Invalid point.",
        es: "Punto no válido.",
      },
      {
        prompt: "Specify start point of arc:",
        reach: ["ARC", "C", "0,0"],
        rest: ["10,0", "0,10"],
        en: "Invalid 2D point.",
        es: "Punto 2D no válido.",
      },
      {
        prompt: "Specify end point of arc (hold Ctrl to switch direction):",
        reach: ["ARC", "C", "0,0", "10,0"],
        rest: ["0,10"],
        en: "2D point or option keyword required.",
        es: "Se requiere un punto 2D o una opción.",
      },
    ]

    it.each(CASES)("refuses it at $prompt and asks again", (c) => {
      const cad = answer(createHarness(), ...c.reach)
      const prompt = cad.state().commandLine.prompt
      answer(cad, "")
      expect(cad.commandLog().slice(-2)).toEqual([c.prompt, c.en])
      expect(cad.state().commandLine.prompt).toBe(prompt)
      cad.enter()
      expect(cad.commandLog().at(-1)).toBe(c.en)
      answer(cad, ...c.rest)
      expect(cad.only<ArcEntity>("arc").radius).toBeCloseTo(10)

      const [, ...given] = c.reach
      const spanish = answer(createHarness({ locale: es }), "ARCO", ...given)
      spanish.enter()
      expect(spanish.commandLog().at(-1)).toBe(c.es)
      expect(spanish.activeToolId()).toBe("arc")
    })

    it("at the start, with nothing to continue, says so and ends", () => {
      // probe arc/p108, en and es.
      const cad = answer(createHarness(), "ARC", "")
      expect(cad.commandLog()).toEqual([
        "ARC",
        "Specify start point of arc or [Center]:",
        "No line or arc to continue.",
        "*Invalid*",
      ])
      expect(cad.activeToolId()).toBe("select")

      const spanish = answer(createHarness({ locale: es }), "ARCO", "")
      expect(spanish.commandLog().slice(-2)).toEqual([
        "No hay línea o arco que se pueda continuar.",
        "*No válido*",
      ])
      expect(spanish.activeToolId()).toBe("select")
    })

    it("at the start, after a line, ends: Continue is not built", () => {
      // probe arc/p109 continues from the line's end (ARC-D4).
      const cad = answer(createHarness(), "LINE", "0,0", "10,0", "", "ARC", "")
      expect(cad.commandLog().at(-1)).toBe(
        "Specify start point of arc or [Center]:"
      )
      expect(cad.activeToolId()).toBe("select")
    })
  })

  it("asks a centre mode's end in Spanish as table 8423 words it", () => {
    // probes arc/p02, p118 (es): `de arco`; 405's `del arco` is Continue's.
    const cad = answer(createHarness({ locale: es }), "ARCO", "C", "0,0")
    answer(cad, "10,0")
    expect(cad.state().commandLine.prompt).toBe(
      "ARCO Precise punto final de arco (mantenga pulsada la tecla Ctrl para cambiar de dirección):"
    )
  })

  it("reads `@` at a centre mode's end from the centre", () => {
    // probes arc/p127, p129 (CSE), p128 (SCE: its centre from the start, the
    // end from the centre), p126 (3P's end from its second point).
    for (const typed of [
      ["ARC", "C", "0,0", "@10,0", "@0,10"],
      ["ARC", "C", "0,0", "@10<0", "@10<90"],
      ["ARC", "10,0", "C", "@-10,0", "@0,10"],
    ]) {
      const arc = answer(createHarness(), ...typed).only<ArcEntity>("arc")
      expect(arc.center).toBeCloseToPoint(p(0, 0))
      expect(arc.radius).toBeCloseTo(10)
      expect(arc.startAngle).toBeCloseToAngle(0)
      expect(arc.endAngle).toBeCloseToAngle(deg(90))
    }
    const three = answer(createHarness(), "ARC", "0,0", "@10,10", "@10,-10")
    const arc = three.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(10, 0))
    expect(arc.endAngle).toBeCloseToAngle(deg(180))
  })

  it("reads its box from the point before, which becomes LASTPOINT", () => {
    // The trace's base point at 3P's second, its end and CSE's start (probe
    // arc/p01; desktop arc/d05), though no Ortho base (d06).
    const cad = answer(createHarness(), "ARC", "5,5")
    cad.type("10,0").enter()
    expect(written(cad, "'ID", "@").at(-2)).toBe(
      " X = 15.00     Y = 5.00     Z = 0.00"
    )
    cad.type("10,-10").enter()
    expect((cad.latest() as ArcEntity).center).toBeCloseToPoint(p(10, -10))
    expect(lastPoint(cad)).toBe(" X = 25.00     Y = -5.00     Z = 0.00")
  })

  it("lies flat at its first point's height", () => {
    // probe arc/p152: ELEVATION 5, a typed `0,0,7` first point → flat at Z 7;
    // p192: `'ELEV` 5 and 3 mid-ARC → at the first point's Z 0, thickness 3.
    const typed = answer(createHarness(), "ELEVATION", "5")
    answer(typed, "ARC", "0,0,7", "10,10", "20,0")
    const high = typed.only<ArcEntity>("arc")
    expect(high.elevation).toBe(7)
    expect(high.normal).toBeUndefined()
    expect(high.center).toBeCloseToPoint(p(10, 0))

    const elev = answer(createHarness(), "ARC", "0,0", "'ELEV", "5", "3")
    answer(elev, "10,10", "20,0")
    const low = elev.only<ArcEntity>("arc")
    expect(low.elevation).toBeUndefined()
    expect(low.thickness).toBe(3)
  })

  describe("a Tangent or Perpendicular", () => {
    const circle = () => [circleOf(p(0, 0), 10)]

    it("at the first point is measured from LASTPOINT", () => {
      // probes arc/p14 (start), p16 (CSE's centre): LASTPOINT 30,0, TAN on a
      // circle r10 → (3.3333, 9.4281); p15: PER on a line from 0,10 → (0,-15).
      const start = createHarness({ entities: circle() })
      answer(start, "ID", "30,0", "ARC", "TAN", "0,10", "0,20", "-20,0")
      const arc = start.latest() as ArcEntity
      const from = V.add(arc.center, {
        x: arc.radius * Math.cos(arc.startAngle),
        y: arc.radius * Math.sin(arc.startAngle),
      })
      expect(from).toBeCloseToPoint(p(10 / 3, 9.428090415820636))

      const centre = createHarness({ entities: circle() })
      answer(centre, "ID", "30,0", "ARC", "C", "TAN", "0,10", "25,25", "20,0")
      expect((centre.latest() as ArcEntity).center).toBeCloseToPoint(
        p(10 / 3, 9.428090415820636)
      )

      const line = createHarness({
        entities: [lineOf(p(-20, -15), p(20, -15))],
      })
      answer(line, "ID", "0,10", "ARC", "PER", "5,-15", "20,20", "-20,0")
      expect((line.latest() as ArcEntity).center).toBeCloseToPoint(p(1.25, 7.5))
    })

    it("after it is measured from the point before, or a centre mode's centre", () => {
      // probe arc/p09: TAN at 3P's second from the start 20,0 → (5, 8.66);
      // p12: TAN at SCE's end from the centre 15,0 → end angle 2.4119.
      const second = createHarness({ entities: circle() })
      answer(second, "ARC", "20,0", "TAN", "0,10", "-20,0")
      const arc = second.latest() as ArcEntity
      expect(arc.center).toBeCloseToPoint(p(0, -17.32050807568877))
      expect(arc.radius).toBeCloseTo(26.457513110645905)

      const end = createHarness({ entities: circle() })
      answer(end, "ARC", "20,0", "C", "15,0", "TAN", "0,10")
      expect((end.latest() as ArcEntity).endAngle).toBeCloseToAngle(
        2.411864997362827
      )
    })
  })

  describe("a degenerate arc", () => {
    // `*Invalid*` and the end of ARC, no object (es `*No válido*`).
    const CASES: ReadonlyArray<{ probe: string; typed: string[] }> = [
      { probe: "p17: three coincident points", typed: ["0,0", "0,0", "0,0"] },
      { probe: "p168: collinear", typed: ["0,0", "10,0", "20,0"] },
      { probe: "p169: the end between", typed: ["0,0", "20,0", "10,0"] },
      { probe: "p170: the end on the start", typed: ["0,0", "10,10", "0,0"] },
      { probe: "p132: `@` at the second", typed: ["0,0", "@", "10,10"] },
      {
        probe: "p162: SCE's end on the start ray",
        typed: ["10,0", "C", "0,0", "20,0"],
      },
      {
        probe: "p166: CSE's end on the start ray",
        typed: ["C", "0,0", "10,0", "5,0"],
      },
      {
        probe: "p190: SCE's end at the centre",
        typed: ["0,10", "C", "0,0", "0,0"],
      },
      {
        probe: "p191: CSE's end at the centre",
        typed: ["C", "0,0", "0,10", "0,0"],
      },
      { probe: "p131: `@` at CSE's end", typed: ["C", "0,0", "10,0", "@"] },
      {
        probe: "p130: `@` at CSE's start, the end on its ray",
        typed: ["C", "0,0", "@", "10,0"],
      },
    ]

    it.each(CASES)("is *Invalid* and the end ($probe)", (c) => {
      const cad = answer(createHarness(), "ARC", ...c.typed)
      expect(cad.commandLog().at(-1)).toBe("*Invalid*")
      expect(cad.entityCount).toBe(0)
      expect(cad.activeToolId()).toBe("select")
    })

    it("with the centre on the start, says the radius is zero", () => {
      // probes arc/p188 (SCE), p189 (CSE): the end is asked, then both lines.
      for (const typed of [
        ["10,0", "C", "10,0", "0,10"],
        ["C", "0,0", "0,0", "0,10"],
      ]) {
        const cad = answer(createHarness(), "ARC", ...typed)
        expect(cad.commandLog().slice(-2)).toEqual([
          "Radius must be non-zero.",
          "*Invalid*",
        ])
        expect(cad.entityCount).toBe(0)
        expect(cad.activeToolId()).toBe("select")
      }
      const spanish = answer(createHarness({ locale: es }), "ARCO", "C")
      answer(spanish, "0,0", "0,0", "0,10")
      expect(spanish.commandLog().slice(-2)).toEqual([
        "El radio no debe ser cero.",
        "*No válido*",
      ])
    })
  })

  it("bends only a centre mode's end with Ortho, from the centre", () => {
    // desktop arc/d06: 3P's points, SCE's centre and CSE's start are taken as
    // picked; the end of a centre mode is bent about the centre.
    const cad = createHarness()
    cad.press("F8")
    const picks = [p(0, 0), p(10, 3), p(20, 1)]
    cad.command("ARC")
    for (const pick of picks) cad.click(pick)
    const three = cad.latest() as ArcEntity
    for (const pick of picks) {
      expect(V.distance(three.center, pick)).toBeCloseTo(three.radius)
    }

    cad.command("ARC").click(p(10, 0)).option("Center").click(p(1, 1))
    cad.click(p(-3, 12))
    const sce = cad.latest() as ArcEntity
    expect(sce.center).toBeCloseToPoint(p(1, 1))
    expect(sce.endAngle).toBeCloseToAngle(deg(90))

    cad.command("ARC").option("Center").click(p(0, 0)).click(p(10, 2))
    cad.click(p(2, 20))
    const cse = cad.latest() as ArcEntity
    expect(cse.radius).toBeCloseTo(Math.hypot(10, 2))
    expect(cse.endAngle).toBeCloseToAngle(deg(90))
  })

  it("takes `<angle` only at a centre mode's end", () => {
    // probes arc/p136 (3P's second), p07 (3P's end), p137 (SCE's centre),
    // p139 (CSE's start): no base point, the prompt's refusal; p140: taken
    // at the end, and a point typed after it is the point typed.
    const refused = (typed: string[], refusal: string) => {
      const cad = answer(createHarness(), "ARC", ...typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.activeToolId()).toBe("arc")
    }
    refused(["0,0", "<45"], "2D point or option keyword required.")
    refused(["0,0", "10,10", "<45"], "Invalid 2D point.")
    refused(["10,0", "C", "<180"], "Invalid 2D point.")
    refused(["C", "0,0", "<0"], "Invalid 2D point.")

    const cad = answer(createHarness(), "ARC", "C", "0,0", "10,0", "<90")
    expect(cad.commandLog().at(-1)).toBe("Angle Override: 90")
    answer(cad, "5,5")
    expect(cad.only<ArcEntity>("arc").endAngle).toBeCloseToAngle(deg(45))
  })

  describe("the rail's entries, the ribbon's macros", () => {
    // acad.cuix: 3-Point `^C^C_arc`, Start, Center, End `^C^C_arc \_c \`,
    // Center, Start, End `^C^C_arc _c` (desktop arc/d01, d03, d04); Enter
    // afterwards repeats ARC, by three points (probes arc/p101, p107).
    const start = "Specify start point of arc or [Center]:"
    const end = "Specify end point of arc (hold Ctrl to switch direction):"

    it("echoes `_arc` and answers `_c`", () => {
      const run = (id: string, ...answers: string[]) => {
        const cad = createHarness()
        cad.tool(id)
        expect(cad.activeToolId()).toBe(id)
        answer(cad, ...answers)
        return cad
      }
      expect(run("arc", "0,0", "10,10", "20,0").commandLog()).toEqual([
        "_arc",
        `${start} 0,0`,
        "Specify second point of arc or [Center]: 10,10",
        "Specify end point of arc: 20,0",
      ])
      expect(run("arcsce", "10,0", "0,0", "0,10").commandLog()).toEqual([
        "_arc",
        `${start} 10,0`,
        "Specify second point of arc or [Center]: _c Specify center point of arc: 0,0",
        `${end} 0,10`,
      ])
      expect(run("arccse", "0,0", "10,0", "0,10").commandLog()).toEqual([
        "_arc",
        `${start} _c Specify center point of arc: 0,0`,
        "Specify start point of arc: 10,0",
        `${end} 0,10`,
      ])
    })

    it("repeats ARC at Enter and undoes as ARC", () => {
      // probe arc/p149: U names ARC (es ARCO, its `H`).
      for (const [locale, u, name] of [
        [undefined, "U", "ARC"],
        [es, "H", "ARCO"],
      ] as const) {
        for (const id of ["arcsce", "arccse"]) {
          const cad = createHarness(locale ? { locale } : {})
          cad.tool(id)
          answer(cad, "10,0", "0,0", "0,10")
          expect(cad.entityCount).toBe(1)
          answer(cad, "")
          expect(cad.state().commandLine.prompt).toBe(
            `${name} ${locale ? "Precise punto inicial del arco o [Centro]:" : start}`
          )
          cad.escape()
          expect(written(cad, "_U")).toEqual([u, name])
          expect(cad.entityCount).toBe(0)
        }
      }
    })

    it("keeps ARCSCE and ARCCSE typable, as the rail runs them", () => {
      const cad = answer(createHarness(), "ARCSCE", "10,0", "0,0", "0,10")
      expect(cad.commandLog().slice(0, 3)).toEqual([
        "ARCSCE",
        `${start} 10,0`,
        "Specify second point of arc or [Center]: _c Specify center point of arc: 0,0",
      ])
      expect(cad.only<ArcEntity>("arc").endAngle).toBeCloseToAngle(deg(90))
      answer(cad, "ARCCSE", "0,0", "20,0", "0,20")
      expect((cad.latest() as ArcEntity).radius).toBeCloseTo(20)
    })
  })
})

describe("ELLIPSE", () => {
  it("takes the two ends of one axis, then the distance to the other", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0)).click(p(0, 40))

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipse.center).toBeCloseToPoint(p(0, 0))
    expect(ellipseSemiMajor(ellipse)).toBeCloseTo(100)
    expect(ellipseSemiMinor(ellipse)).toBeCloseTo(40)
    expect(isFullEllipse(ellipse)).toBe(true)
  })

  it("keeps the longer axis as the major one, whichever was picked first", () => {
    const cad = createHarness()

    // The first axis is the *shorter* one here, so the stored major axis is
    // the perpendicular one — the DXF invariant, not the pick order.
    cad.command("ELLIPSE").click(p(-40, 0)).click(p(40, 0)).click(p(0, 100))

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseSemiMajor(ellipse)).toBeCloseTo(100)
    expect(ellipse.ratio).toBeCloseTo(0.4)
    expect(ellipse.majorAxis.x).toBeCloseTo(0)
  })

  it("measures the second axis from the centre, not from the axis end", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").type("-100,0").enter().type("100,0").enter()
    cad.type("30").enter()

    expect(ellipseSemiMinor(cad.only<EllipseEntity>("ellipse"))).toBeCloseTo(30)
  })

  it("Center mode takes the centre, then one axis endpoint", () => {
    const cad = createHarness()

    cad.command("ELLIPSEC").click(p(0, 0)).click(p(100, 0)).click(p(0, 25))

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipse.center).toBeCloseToPoint(p(0, 0))
    expect(ellipseSemiMajor(ellipse)).toBeCloseTo(100)
    expect(ellipseSemiMinor(ellipse)).toBeCloseTo(25)
  })

  it("reaches Center and Arc from the first prompt's keywords", () => {
    const cad = createHarness()

    cad.command("ELLIPSE")
    expect(cad.optionAbbreviations()).toEqual(["A", "C"])

    cad.option("Center").click(p(0, 0)).click(p(100, 0)).click(p(0, 50))

    expect(cad.only<EllipseEntity>("ellipse").center).toBeCloseToPoint(p(0, 0))
  })

  it("Rotation foreshortens the other axis by the cosine of the angle", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0))
    cad.option("Rotation").type("60").enter()

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseSemiMajor(ellipse)).toBeCloseTo(100)
    expect(ellipseSemiMinor(ellipse)).toBeCloseTo(50)
  })

  it("refuses a rotation that would draw a straight line, and ends", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0))
    cad.option("Rotation").type("90").enter()

    expect(cad.entityCount).toBe(0)
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify rotation around major axis: 90",
      "*Invalid*",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks AutoCAD's questions in turn", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").type("0,0").enter().type("200,0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify distance to other axis or [Rotation]:"
    )
    cad.type("50").enter()
    cad.command("ELLIPSE").option("Center")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify center of ellipse:"
    )
    cad.type("0,0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify endpoint of axis:"
    )
    cad.type("100,0").enter().option("Rotation")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify rotation around major axis:"
    )
    cad.type("60").enter()

    expect(cad.commandLog()).toEqual([
      "ELLIPSE",
      "Specify axis endpoint of ellipse or [Arc/Center]: 0,0",
      "Specify other endpoint of axis: 200,0",
      "Specify distance to other axis or [Rotation]: 50",
      "ELLIPSE",
      "Specify axis endpoint of ellipse or [Arc/Center]: C",
      "Specify center of ellipse: 0,0",
      "Specify endpoint of axis: 100,0",
      "Specify distance to other axis or [Rotation]: R",
      "Specify rotation around major axis: 60",
    ])
    expect(cad.typeCounts()).toEqual({ ellipse: 2 })
  })

  it("draws an elliptical arc from its centre, half of it at Enter", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").option("Arc")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify axis endpoint of elliptical arc or [Center]:"
    )
    cad.option("Center")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify center of elliptical arc:"
    )
    cad.type("0,0").enter().type("100,0").enter().type("50").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify start angle or [Parameter]:"
    )
    cad.type("0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify end angle or [Parameter/Included angle]:"
    )
    cad.option("Included angle")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify included angle for arc <180>:"
    )
    cad.enter()

    // Still an arc: Center keeps the Arc chosen before it.
    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(isFullEllipse(ellipse)).toBe(false)
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(100, 0), 5)
    expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(-100, 0), 5)
  })

  it("draws an elliptical arc between the two angles", () => {
    const cad = createHarness()

    cad.command("ELLIPSEARC").click(p(-100, 0)).click(p(100, 0)).click(p(0, 50))
    cad.click(p(100, 0)).click(p(0, 50))

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(isFullEllipse(ellipse)).toBe(false)
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(100, 0), 5)
    expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(0, 50), 5)
  })

  it("takes an arc's angles as directions, not as raw parameters", () => {
    const cad = createHarness()

    // At ratio 0.5 the point at *parameter* 45° is not the point at 45° from
    // the centre; the prompt asks for the angle, so the end must be on the ray
    // — 45° on from the major axis, which points to the first endpoint.
    cad.command("ELLIPSEARC").click(p(-100, 0)).click(p(100, 0)).click(p(0, 50))
    cad.type("0").enter().type("45").enter()

    const end = ellipseEndPoint(cad.only<EllipseEntity>("ellipse"))
    expect(Math.atan2(end.y, end.x)).toBeCloseToAngle(deg(-135), 5)
  })

  // AutoCAD 2023's console: 0,0 → 100,0 stores Major Axis -50,0, and the arc
  // at 0 starts on 0,0; from a centre, on the endpoint given; and a longer
  // other axis is the semi-axis turned a quarter left (0,0 → 40,0, 50:
  // Major Axis 0,-50).
  it("measures an arc's angles from the major axis, not from world X", () => {
    const cad = createHarness()

    // The major axis runs vertically here, so angle 0 is the bottom of the
    // ellipse, the first endpoint — the frame of AutoCAD's Parameter equation.
    cad.command("ELLIPSEARC").click(p(0, -100)).click(p(0, 100)).click(p(50, 0))
    cad.type("0").enter().type("90").enter()

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(0, -100), 5)
    expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(50, 0), 5)

    cad.command("ELLIPSEARC")
    answer(cad, "0,0", "40,0", "50", "0", "90")
    const turned = cad.entities().at(-1) as EllipseEntity
    expect(turned.majorAxis).toBeCloseToPoint(p(0, -50))
    expect(ellipseStartPoint(turned)).toBeCloseToPoint(p(20, -50), 5)
    expect(ellipseEndPoint(turned)).toBeCloseToPoint(p(40, 0), 5)
  })

  it("Included angle sweeps on from the start angle", () => {
    const cad = createHarness()

    cad.command("ELLIPSEARC").click(p(-100, 0)).click(p(100, 0)).click(p(0, 50))
    cad.type("0").enter()
    cad.option("Included angle").type("90").enter()

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(-100, 0), 5)
    expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(0, -50), 5)
  })

  // AutoCAD 2023's console (acc/e1–e7): Parameter asks `Specify start
  // parameter or [Angle]:` and `Specify end parameter or [Angle/Included
  // angle]:`, the choice holding until Angle; a point there is taken by its
  // angle from the major axis as the parameter, and Included angle sweeps in
  // the end prompt's own measure.
  describe("Parameter", () => {
    /** An arc on 0,0 → 100,0 with the other half-axis 25, at its start. */
    function arc(locale?: typeof es): CadHarness {
      const cad = createHarness({ locale })
      cad.command(locale ? "ELIPSE" : "ELLIPSE")
      answer(cad, "A", "0,0", "100,0", "25")
      return cad
    }

    it("asks parameters, and they are the equation's", () => {
      const cad = arc()
      answer(cad, "P", "0", "FOO", "90")
      expect(cad.commandLog().slice(-5)).toEqual([
        "Specify start angle or [Parameter]: P",
        "Specify start parameter or [Angle]: 0",
        "Specify end parameter or [Angle/Included angle]: FOO",
        "Requires valid numeric angle, second point, or option keyword.",
        "Specify end parameter or [Angle/Included angle]: 90",
      ])
      const ellipse = cad.only<EllipseEntity>("ellipse")
      expect(ellipse.majorAxis).toBeCloseToPoint(p(-50, 0))
      expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(0, 0), 5)
      expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(50, -25), 5)
    })

    it("refuses as the console does and goes back to angles on Angle", () => {
      const cad = arc()
      answer(cad, "FOO", "P", "FOO", "A")
      expect(cad.commandLog().slice(-6)).toEqual([
        "Specify start angle or [Parameter]: FOO",
        "Requires valid numeric angle, second point, or option keyword.",
        "Specify start angle or [Parameter]: P",
        "Specify start parameter or [Angle]: FOO",
        "Requires valid numeric angle, second point, or option keyword.",
        "Specify start parameter or [Angle]: A",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "ELLIPSE Specify start angle or [Parameter]:"
      )
      answer(cad, "30", "P")
      expect(cad.state().commandLine.prompt).toBe(
        "ELLIPSE Specify end parameter or [Angle/Included angle]:"
      )
    })

    it("sweeps Included angle in the end prompt's measure", () => {
      const angles = arc()
      answer(angles, "30", "I", "90")
      expect(
        ellipseEndPoint(angles.only<EllipseEntity>("ellipse"))
      ).toBeCloseToPoint(p(63.8675, -24.0192), 3)

      const parameters = arc()
      answer(parameters, "30", "P", "I", "90")
      expect(
        ellipseEndPoint(parameters.only<EllipseEntity>("ellipse"))
      ).toBeCloseToPoint(p(87.7964, -16.3663), 3)

      const fromParameter = arc()
      answer(fromParameter, "P", "45", "I", "FOO", "90")
      expect(fromParameter.commandLog().slice(-2)).toEqual([
        "Requires valid numeric angle or second point.",
        "Specify included angle for arc <180>: 90",
      ])
      const ellipse = fromParameter.only<EllipseEntity>("ellipse")
      expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(
        p(14.6447, -17.6777),
        3
      )
      expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(85.3553, -17.6777), 3)
    })

    it("takes a point's angle from the major axis as the parameter", () => {
      const parameter = arc()
      answer(parameter, "P", "0,25", "180")
      expect(
        ellipseStartPoint(parameter.only<EllipseEntity>("ellipse"))
      ).toBeCloseToPoint(p(5.2786, 11.1803), 3)

      const angle = arc()
      answer(angle, "0,25", "180")
      expect(
        ellipseStartPoint(angle.only<EllipseEntity>("ellipse"))
      ).toBeCloseToPoint(p(14.6447, 17.6777), 3)
    })

    it("asks in Spanish", () => {
      const cad = arc(es)
      answer(cad, "P", "FOO", "U", "30", "P")
      expect(cad.commandLog().slice(-6)).toEqual([
        "Precise ángulo inicial o [Parámetro]: P",
        "Precise parámetro inicial o [ángUlo]: FOO",
        "Requiere un ángulo numérico válido, un segundo punto o una opción.",
        "Precise parámetro inicial o [ángUlo]: U",
        "Precise ángulo inicial o [Parámetro]: 30",
        "Precise ángulo final o [Parámetro/ángulo Incluido]: P",
      ])
      expect(cad.state().commandLine.prompt).toBe(
        "ELIPSE Precise parámetro final o [ángUlo/ángulo Incluido]:"
      )
    })
  })

  it("ends after a single ellipse, like AutoCAD", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0)).click(p(0, 40))

    expect(cad.activeToolId()).toBe("select")
  })

  it("rejects a zero second axis and keeps prompting", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0)).type("0").enter()

    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("ellipse")
  })
})

describe("SPLINE", () => {
  it("reports its settings and asks AutoCAD's questions", () => {
    const cad = createHarness()

    cad.command("SPLINE")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Specify first point or [Method/Knots]:"
    )
    cad.option("Knots")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter knot parameterization [Chord/Square root/Uniform] <Chord>:"
    )
    cad.option("Square root").option("Method")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter spline creation method [Fit/CV] <Fit>:"
    )
    cad.option("CV").option("Degree")
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter degree of spline <3>:"
    )
    cad.type("2").enter().option("Method").option("Fit").click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter next point or [start Tangency]:"
    )
    cad.click(p(100, 0)).click(p(200, 50)).enter()

    expect(cad.commandLog()).toEqual([
      "SPLINE",
      "Current settings: Method=Fit   Knots=Chord",
      "Specify first point or [Method/Knots]: K",
      "Enter knot parameterization [Chord/Square root/Uniform] <Chord>: S",
      "Current settings: Method=Fit   Knots=Square root",
      "Specify first point or [Method/Knots]: M",
      "Enter spline creation method [Fit/CV] <Fit>: CV",
      "Current settings: Method=CV   Degree=3",
      "Specify first point or [Method/Degree]: D",
      "Enter degree of spline <3>: 2",
      "Current settings: Method=CV   Degree=2",
      "Specify first point or [Method/Degree]: M",
      "Enter spline creation method [Fit/CV] <CV>: F",
      "Current settings: Method=Fit   Knots=Square root",
      "Specify first point or [Method/Knots]:",
      "Enter next point or [start Tangency]:",
      "Enter next point or [end Tangency/Undo]:",
      "Enter next point or [end Tangency/Undo/Close]:",
    ])
  })

  it("draws one fit spline through the picks, ended by Enter", () => {
    const cad = createHarness()
    const picks = [p(0, 0), p(100, 60), p(200, -20), p(300, 40)]

    cad.command("SPL")
    for (const pick of picks) cad.click(pick)
    cad.enter()

    const spline = cad.only<SplineEntity>("spline")
    expect(spline.method).toBe("fit")
    expect(spline.degree).toBe(3)
    expect(spline.points).toBeCloseToPoints(picks)
    for (const pick of picks) {
      expect(closestOnEntity(spline, pick).distance).toBeLessThan(1e-6)
    }
    expect(cad.activeToolId()).toBe("select")
  })

  it("takes typed points relative to the last, as LINE does", () => {
    const cad = createHarness()

    cad.command("SPLINE").type("0,0").enter().type("100,0").enter()
    cad.type("@0,100").enter().enter()

    expect(cad.only<SplineEntity>("spline").points).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 100),
    ])
  })

  it("leaves along the start tangent and arrives along the end tangent", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0))
    cad.option("start Tangency").click(p(0, 10))
    cad.click(p(100, 0)).click(p(200, 0))
    cad.option("end Tangency").click(p(200, -10))

    const spline = cad.only<SplineEntity>("spline")
    expect(V.normalize(spline.startTangent!)).toBeCloseToPoint(p(0, 1))
    expect(V.normalize(spline.endTangent!)).toBeCloseToPoint(p(0, -1))
    expect(cad.activeToolId()).toBe("select")
  })

  it("Undo drops the last point without leaving the command", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(200, 50))
    cad.option("Undo").click(p(200, -50)).enter()

    expect(cad.only<SplineEntity>("spline").points).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(200, -50),
    ])
  })

  it("Escape discards the spline being drawn", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(200, 50))
    cad.escape()

    expect(cad.entityCount).toBe(0)
  })

  it("is one undo step", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(200, 50))
    cad.enter().undo()

    expect(cad.entityCount).toBe(0)
  })

  it("closes a fit spline periodically and ends, asking no tangent", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(50, 80))
    cad.option("Close")

    expect(cad.activeToolId()).toBe("select")
    const spline = cad.only<SplineEntity>("spline")
    expect(spline.closed).toBe(true)
    expect(spline.startTangent).toBeUndefined()
    expect(splineStartPoint(spline)).toBeCloseToPoint(splineEndPoint(spline))
  })

  it("remembers Knots for the next spline, as SPLKNOTS does for the session", () => {
    const cad = createHarness()

    cad.command("SPLINE").option("Knots").option("Uniform")
    cad.click(p(0, 0)).click(p(100, 0)).enter()
    cad.command("SPLINE").click(p(0, 50)).click(p(100, 50)).enter()

    const splines = cad.entities() as SplineEntity[]
    expect(splines.map((s) => s.knots)).toEqual(["uniform", "uniform"])
  })

  it("draws on control vertices at the chosen degree", () => {
    const cad = createHarness()
    const cvs = [p(0, 0), p(50, 100), p(150, 100), p(200, 0)]

    cad.command("SPLINE").option("Method").option("CV")
    cad.option("Degree").type("2").enter()
    for (const cv of cvs) cad.click(cv)
    cad.enter()

    const spline = cad.only<SplineEntity>("spline")
    expect(spline.method).toBe("cv")
    expect(spline.degree).toBe(2)
    expect(spline.points).toBeCloseToPoints(cvs)
    expect(splineStartPoint(spline)).toBeCloseToPoint(cvs[0])
    expect(splineEndPoint(spline)).toBeCloseToPoint(cvs[3])
  })

  it("lowers the degree to one less than the vertex count when there are too few", () => {
    const cad = createHarness()

    cad.command("SPLINE").option("Method").option("CV")
    cad.click(p(0, 0)).click(p(100, 0)).enter()

    expect(cad.only<SplineEntity>("spline").degree).toBe(1)
  })

  it("closes a CV spline at once, from the third vertex on", () => {
    const cad = createHarness()

    cad.command("SPLINE").option("Method").option("CV")
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe("SPLINE Enter next point:")
    cad.click(p(100, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter next point or [Undo]:"
    )
    cad.click(p(50, 80))
    expect(cad.state().commandLine.prompt).toBe(
      "SPLINE Enter next point or [Close/Undo]:"
    )
    cad.option("Close")

    const spline = cad.only<SplineEntity>("spline")
    expect(spline.closed).toBe(true)
    expect(spline.degree).toBe(2)
    expect(cad.activeToolId()).toBe("select")
  })

  it("shows its method, degree, knots and closure in the palette", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(50, 80))
    cad.option("Close").selectAll()

    const rows = cad.state().properties.info!.groups.flatMap((g) => g.rows)
    expect(rows.map((row) => [row.id, row.value])).toEqual([
      ["method", "Fit"],
      ["degree", "3"],
      ["knotParameterization", "Chord"],
      ["closed", "Yes"],
      ["area", expect.stringMatching(/mm²$/)],
    ])
  })
})

describe("POLYGON", () => {
  it("asks AutoCAD's questions in turn, and keeps the count and option", () => {
    // probes polygon/p01 (the prompts), p111 (the count and option kept).
    const cad = createHarness()

    cad.command("POLYGON")
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter number of sides <4>:"
    )
    cad.type("5").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Specify center of polygon or [Edge]:"
    )
    cad.type("0,0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter an option [Inscribed in circle/Circumscribed about circle] <I>:"
    )
    expect(cad.hasFocusedField()).toBe(false)
    cad.press("C")
    cad.press("Enter")
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Specify radius of circle:"
    )
    cad.type("100").enter()

    expect(cad.commandLog()).toEqual([
      "POLYGON",
      "Enter number of sides <4>: 5",
      "Specify center of polygon or [Edge]: 0,0",
      "Enter an option [Inscribed in circle/Circumscribed about circle] <I>: C",
      "Specify radius of circle: 100",
    ])
    cad.command("POLYGON")
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter number of sides <5>:"
    )
    cad.enter().type("300,0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter an option [Inscribed in circle/Circumscribed about circle] <C>:"
    )
  })

  it("starts a typed radius at the top, or half a side past it for an even count (p100, p101)", () => {
    // Six polygons of radius 10, n = 3–8, centred 30 apart from 5,5: the
    // first vertex at 90°, or 90° + 180°/n for an even n, then
    // counterclockwise, Inscribed and Circumscribed alike.
    const typed = (option: string) => {
      const cad = createHarness()
      for (let n = 3; n <= 8; n++) {
        answer(cad, "POLYGON", `${n}`, `${5 + 30 * (n - 3)},5`, option, "10")
      }
      return cad.entities() as PolylineEntity[]
    }
    const inscribed = typed("I")
    expect(inscribed.map((e) => e.closed)).toEqual(Array(6).fill(true))
    const [i3, i4, i5, i6, i7, i8] = inscribed.map((e) => e.vertices)
    expect(i3).toBeCloseToPoints([p(5, 15), p(-3.6603, 0), p(13.6603, 0)], 4)
    expect(i4).toBeCloseToPoints(
      [
        p(27.9289, 12.0711),
        p(27.9289, -2.0711),
        p(42.0711, -2.0711),
        p(42.0711, 12.0711),
      ],
      4
    )
    expect(i5).toBeCloseToPoints(
      [
        p(65, 15),
        p(55.4894, 8.0902),
        p(59.1221, -3.0902),
        p(70.8779, -3.0902),
        p(74.5106, 8.0902),
      ],
      4
    )
    expect(i6).toBeCloseToPoints(
      [
        p(90, 13.6603),
        p(85, 5),
        p(90, -3.6603),
        p(100, -3.6603),
        p(105, 5),
        p(100, 13.6603),
      ],
      4
    )
    expect(i7).toBeCloseToPoints(
      [
        p(125, 15),
        p(117.1817, 11.2349),
        p(115.2507, 2.7748),
        p(120.6612, -4.0097),
        p(129.3388, -4.0097),
        p(134.7493, 2.7748),
        p(132.8183, 11.2349),
      ],
      4
    )
    expect(i8).toBeCloseToPoints(
      [
        p(151.1732, 14.2388),
        p(145.7612, 8.8268),
        p(145.7612, 1.1732),
        p(151.1732, -4.2388),
        p(158.8268, -4.2388),
        p(164.2388, 1.1732),
        p(164.2388, 8.8268),
        p(158.8268, 14.2388),
      ],
      4
    )

    const [c3, c4, c5, c6, c7, c8] = typed("C").map((e) => e.vertices)
    expect(c3).toBeCloseToPoints([p(5, 25), p(-12.3205, -5), p(22.3205, -5)], 4)
    expect(c4).toBeCloseToPoints(
      [p(25, 15), p(25, -5), p(45, -5), p(45, 15)],
      4
    )
    expect(c5).toBeCloseToPoints(
      [
        p(65, 17.3607),
        p(53.2443, 8.8197),
        p(57.7346, -5),
        p(72.2654, -5),
        p(76.7557, 8.8197),
      ],
      4
    )
    expect(c6).toBeCloseToPoints(
      [
        p(89.2265, 15),
        p(83.453, 5),
        p(89.2265, -5),
        p(100.7735, -5),
        p(106.547, 5),
        p(100.7735, 15),
      ],
      4
    )
    expect(c7).toBeCloseToPoints(
      [
        p(125, 16.0992),
        p(116.3223, 11.9202),
        p(114.1791, 2.5302),
        p(120.1843, -5),
        p(129.8157, -5),
        p(135.8209, 2.5302),
        p(133.6777, 11.9202),
      ],
      4
    )
    expect(c8).toBeCloseToPoints(
      [
        p(150.8579, 15),
        p(145, 9.1421),
        p(145, 0.8579),
        p(150.8579, -5),
        p(159.1421, -5),
        p(165, 0.8579),
        p(165, 9.1421),
        p(159.1421, 15),
      ],
      4
    )
  })

  it("turns the polygon to a picked radius", () => {
    const cad = createHarness()

    cad.command("POLYGON").type("4").enter().click(p(0, 0)).enter()
    cad.click(p(0, 50))

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.vertices[0]).toBeCloseToPoint(p(0, 50))
  })

  it("takes a point at the radius, picked or typed, from the pick (p102, p06, p123)", () => {
    // A vertex at the point (Inscribed) or an edge's midpoint (Circumscribed);
    // LASTPOINT stays the centre (p102, p06).
    const picked = createHarness()
    answer(picked, "POLYGON", "4", "5,5", "I")
    picked.click(p(15, 10))
    answer(picked, "POLYGON", "5", "35,5", "I")
    picked.click(p(45, 10))
    answer(picked, "POLYGON", "5", "65,5", "C")
    picked.click(p(75, 10))
    const [square, inscribed, circumscribed] = picked
      .entities()
      .map((e) => (e as PolylineEntity).vertices)
    expect(square).toBeCloseToPoints(
      [p(15, 10), p(0, 15), p(-5, 0), p(10, -5)],
      4
    )
    expect(inscribed).toBeCloseToPoints(
      [
        p(45, 10),
        p(33.3349, 16.0557),
        p(23.9709, 6.8328),
        p(29.8488, -4.9229),
        p(42.8455, -2.9655),
      ],
      4
    )
    expect(circumscribed).toBeCloseToPoints(
      [
        p(71.3673, 17.2654),
        p(55.3025, 14.8459),
        p(52.6393, -1.1803),
        p(67.0582, -8.6655),
        p(78.6327, 2.7346),
      ],
      4
    )
    expect(answer(picked, "ID", "@").commandLog().at(-1)).toBe(
      " X = 65.00     Y = 5.00     Z = 0.00"
    )

    const typed = answer(createHarness(), "POLYGON", "4", "0,0", "C", "10,5")
    expect(typed.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints(
      [p(5, 15), p(-15, 5), p(-5, -15), p(15, -5)],
      4
    )
    expect(answer(typed, "ID", "@").commandLog().at(-1)).toBe(
      " X = 0.00     Y = 0.00     Z = 0.00"
    )

    const relative = answer(
      createHarness(),
      "ID",
      "2,2",
      "POLYGON",
      "4",
      "@3,4",
      "I",
      "@5,0"
    )
    expect(
      relative.only<PolylineEntity>("polyline").vertices
    ).toBeCloseToPoints([p(10, 6), p(5, 11), p(0, 6), p(5, 1)], 4)
  })

  it("refuses a side count outside 3–1024 and asks again", () => {
    // probes polygon/p08, p118 (0 and -3 too).
    const cad = createHarness()

    cad.command("POLYGON").type("2").enter()
    cad.type("4.5").enter()
    expect(cad.commandLog().slice(-4)).toEqual([
      "Enter number of sides <4>: 2",
      "Requires an integer between 3 and 1024.",
      "Enter number of sides <4>: 4.5",
      "Requires an integer between 3 and 1024.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter number of sides <4>:"
    )
    cad.type("1025").enter()
    expect(cad.entityCount).toBe(0)
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Enter number of sides <4>:"
    )
  })

  it("Edge builds it counterclockwise from its first edge", () => {
    const cad = createHarness()

    cad.command("POLYGON").enter().option("Edge")
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Specify first endpoint of edge:"
    )
    cad.type("0,0").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "POLYGON Specify second endpoint of edge:"
    )
    cad.type("10,0").enter()

    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(10, 0),
      p(10, 10),
      p(0, 10),
    ])
  })

  it("refuses Enter at its point prompts in their words and asks again (p02, p03)", () => {
    const cad = answer(createHarness(), "POLYGON", "", "", "0,0", "", "", "")
    expect(cad.commandLog()).toEqual([
      "POLYGON",
      "Enter number of sides <4>:",
      "Specify center of polygon or [Edge]:",
      "Point or option keyword required.",
      "Specify center of polygon or [Edge]: 0,0",
      "Enter an option [Inscribed in circle/Circumscribed about circle] <I>:",
      "Specify radius of circle:",
      "Requires numeric distance or second point.",
      "Specify radius of circle:",
      "Requires numeric distance or second point.",
    ])
    answer(cad, "10")
    expect(cad.entityCount).toBe(1)

    const edge = answer(createHarness(), "POLYGON", "5", "E", "", "0,0", "")
    expect(edge.commandLog().slice(-5)).toEqual([
      "Specify first endpoint of edge:",
      "Invalid point.",
      "Specify first endpoint of edge: 0,0",
      "Specify second endpoint of edge:",
      "Invalid 2D point.",
    ])
    answer(edge, "10,0")
    expect(edge.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints(
      [
        p(0, 0),
        p(10, 0),
        p(13.0902, 9.5106),
        p(5, 15.3884),
        p(-3.0902, 9.5106),
      ],
      4
    )

    const spanish = createHarness({ locale: es })
    answer(spanish, "POLIGONO", "", "", "0,0", "", "")
    answer(spanish, "10", "POLIGONO", "5", "L", "", "0,0", "")
    expect(spanish.commandLog().filter((line) => !line.includes(":"))).toEqual([
      "POLIGONO",
      "Se requiere un punto o una opción.",
      "Requiere una distancia numérica o un segundo punto.",
      "POLIGONO",
      "Punto no válido.",
      "Punto 2D no válido.",
    ])
    expect(spanish.activeToolId()).toBe("polygon")
  })

  it("measures TAN at the centre and Edge's first endpoint from LASTPOINT (p04, p05)", () => {
    const circle = () => [circleOf(p(0, 0), 10)]
    const centre = createHarness({ entities: circle() })
    answer(centre, "ID", "30,0", "POLYGON", "4", "TAN", "0,10", "I", "5")
    expect(centre.latest()).toMatchObject({ type: "polyline" })
    expect((centre.latest() as PolylineEntity).vertices).toBeCloseToPoints(
      [
        p(-0.2022, 12.9636),
        p(-0.2022, 5.8926),
        p(6.8689, 5.8926),
        p(6.8689, 12.9636),
      ],
      4
    )

    const edge = createHarness({ entities: circle() })
    answer(edge, "ID", "30,0", "POLYGON", "4", "E", "TAN", "0,10", "40,0")
    expect(edge.latest()).toMatchObject({ type: "polyline" })
    expect((edge.latest() as PolylineEntity).vertices).toBeCloseToPoints(
      [p(3.3333, 9.4281), p(40, 0), p(49.4281, 36.6667), p(12.7614, 46.0948)],
      4
    )
  })

  it("refuses a radius of 0 or less in AutoCAD's words (p08, p124)", () => {
    const cad = answer(createHarness(), "POLYGON", "5", "0,0", "I")
    answer(cad, "-5", "0")
    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify radius of circle: -5",
      "Value must be positive and nonzero.",
      "Specify radius of circle: 0",
      "Value must be positive and nonzero.",
    ])
    expect(cad.entityCount).toBe(0)

    // `@` at the radius is the centre itself.
    const at = answer(createHarness(), "ID", "3,3", "POLYGON", "4", "@", "I")
    answer(at, "@")
    expect(at.commandLog().slice(-2)).toEqual([
      "Specify radius of circle: @",
      "Value must be positive and nonzero.",
    ])
    answer(at, "10")
    expect(at.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints(
      [
        p(-4.0711, 10.0711),
        p(-4.0711, -4.0711),
        p(10.0711, -4.0711),
        p(10.0711, 10.0711),
      ],
      4
    )
  })

  it("makes a zero-length Edge's polygon, every vertex on one point (p125)", () => {
    const cad = answer(
      createHarness(),
      "ID",
      "3,3",
      "POLYGON",
      "4",
      "E",
      "@",
      "@"
    )

    expect(cad.activeToolId()).not.toBe("polygon")
    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(3, 3),
      p(3, 3),
      p(3, 3),
      p(3, 3),
    ])
  })

  it("takes the side count only as an integer, a sign allowed (p153)", () => {
    const cad = answer(createHarness(), "POLYGON", "3.0", "1e1", "+5")
    expect(cad.commandLog()).toEqual([
      "POLYGON",
      "Enter number of sides <4>: 3.0",
      "Requires an integer between 3 and 1024.",
      "Enter number of sides <4>: 1e1",
      "Requires an integer between 3 and 1024.",
      "Enter number of sides <4>: +5",
    ])
    answer(cad, "5,5", "I", "10")
    expect(cad.only<PolylineEntity>("polyline").vertices).toHaveLength(5)
  })

  it("runs a distance typed after an angle override along it at Edge's end (desktop rectang/d03)", () => {
    // WHY the desktop's RECTANG: the console ignores the override (p09) and
    // the desktop is unprobed at this prompt; RECTANG's other corner honours it.
    const cad = answer(createHarness(), "POLYGON", "4", "E", "5,5")
    cad.moveTo(p(20, 15))
    answer(cad, "<45")
    cad.moveTo(p(20, 15))
    answer(cad, "10")

    expect(cad.commandLog()).toContain("Angle Override: 45")
    expect(cad.only<PolylineEntity>("polyline").vertices[1]).toBeCloseToPoint(
      p(12.0711, 12.0711),
      4
    )
  })

  it("lies at the centre's Z, which LASTPOINT keeps (p131)", () => {
    const cad = answer(createHarness(), "POLYGON", "5", "5,5,3", "I", "10")

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.elevation).toBe(3)
    expect(polygon.vertices[0]).toBeCloseToPoint(p(5, 15))
    expect(answer(cad, "ID", "@").commandLog().at(-1)).toBe(
      " X = 5.00     Y = 5.00     Z = 3.00"
    )
  })

  it("refuses a Z or `*` at Edge's second endpoint, lying at the first's Z (p132, p133)", () => {
    const cad = answer(createHarness(), "POLYGON", "4", "E", "30,5,4")
    answer(cad, "40,5,4", "40,5,0", "*40,5")
    expect(cad.commandLog().slice(-6)).toEqual([
      "Specify second endpoint of edge: 40,5,4",
      "Invalid 2D point.",
      "Specify second endpoint of edge: 40,5,0",
      "Invalid 2D point.",
      "Specify second endpoint of edge: *40,5",
      "Invalid 2D point.",
    ])
    answer(cad, "40,5")

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.elevation).toBe(4)
    expect(polygon.vertices).toBeCloseToPoints([
      p(30, 5),
      p(40, 5),
      p(40, 15),
      p(30, 15),
    ])
  })

  it("levels a typed radius with the UCS, and lies in a tilted one (p104, p135)", () => {
    const turned = answer(createHarness(), "UCS", "Z", "30")
    answer(turned, "POLYGON", "6", "5,5", "I", "10")
    answer(turned, "POLYGON", "5", "35,5", "C", "10")
    const [hexagon, pentagon] = turned
      .entities()
      .map((e) => (e as PolylineEntity).vertices)
    expect(hexagon).toBeCloseToPoints(
      [
        p(-6.8301, 11.8301),
        p(-6.8301, 1.8301),
        p(1.8301, -3.1699),
        p(10.4904, 1.8301),
        p(10.4904, 11.8301),
        p(1.8301, 16.8301),
      ],
      4
    )
    expect(pentagon).toBeCloseToPoints(
      [
        p(21.6305, 32.5348),
        p(15.7203, 19.2602),
        p(26.5188, 9.5372),
        p(39.1029, 16.8026),
        p(36.0818, 31.0159),
      ],
      4
    )

    // In the OCS of a normal along -Y, as AutoCAD lists them.
    const tilted = answer(createHarness(), "UCS", "X", "90")
    answer(tilted, "POLYGON", "4", "5,5", "I", "10")
    answer(tilted, "POLYGON", "4", "E", "30,5", "40,5")
    const [square, edged] = tilted.entities() as PolylineEntity[]
    expect(square.normal?.y).toBeCloseTo(-1, 9)
    expect(square.vertices).toBeCloseToPoints(
      [
        p(-2.0711, 12.0711),
        p(-2.0711, -2.0711),
        p(12.0711, -2.0711),
        p(12.0711, 12.0711),
      ],
      4
    )
    expect(edged.normal?.y).toBeCloseTo(-1, 9)
    expect(edged.vertices).toBeCloseToPoints(
      [p(30, 5), p(40, 5), p(40, 15), p(30, 15)],
      4
    )
  })

  it("runs as PG in Spanish (p108)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "PG")
    expect(cad.state().commandLine.prompt).toBe(
      "POLIGONO Indique número de lados <4>:"
    )
    answer(cad, "6", "5,5", "", "10")
    expect(cad.only<PolylineEntity>("polyline").vertices).toHaveLength(6)
  })

  it("leaves PLINEWID out (p136)", () => {
    const cad = createHarness()
    cad.runtime.document.updateSettings({ polylineWidth: 0.5 })
    answer(cad, "POLYGON", "5", "5,5", "I", "10")
    answer(cad, "POLYGON", "4", "E", "30,5", "40,5")

    for (const polygon of cad.entities() as PolylineEntity[]) {
      expect(polygon.widths).toBeUndefined()
    }
  })

  describe("its jig, as the desktop draws it", () => {
    it("draws the ghost in the current colour, the radius line amber and dashed (d02)", () => {
      // desktop rectang/d02: with CECOLOR 1 the polygon is red at the radius,
      // with an amber dashed line from the centre to the cursor; at Edge's
      // second endpoint the ghost alone.
      const cad = createHarness()
      const color = red(cad)
      answer(cad, "POLYGON", "5", "0,0", "I")
      cad.moveTo(p(30, 40))
      expect(jig(cad)).toEqual([
        `segment ${THEME.dashedRubberBand} dashed`,
        `path ${color}`,
      ])
      const line = (q: ScenePrimitive) =>
        q.kind === "segment" && q.stroke.dash !== undefined
      expect(cad.scene().primitives.find(line)).toEqual(
        expect.objectContaining({
          a: expect.objectContaining(cad.toScreen(p(0, 0))),
          b: expect.objectContaining(cad.toScreen(p(30, 40))),
          stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
        })
      )

      cad.escape()
      answer(cad, "POLYGON", "5", "E", "0,0")
      cad.moveTo(p(30, 40))
      expect(jig(cad)).toEqual([`path ${color}`])
    })
  })
})

describe("PLINE", () => {
  it("asks for the start point, reports the line-width, then the next points", () => {
    const cad = createHarness()

    cad.command("PLINE")
    expect(cad.state().commandLine.prompt).toBe("PLINE Specify start point:")
    cad.click(p(0, 0)).click(p(100, 0)).option("Arc")
    expect(cad.state().dynamicInput?.prompt).toBe(
      "Specify endpoint of arc (hold Ctrl to switch direction) or"
    )
    cad.click(p(100, 100)).enter()

    expect(cad.commandLog()).toEqual([
      "PLINE",
      "Specify start point:",
      "Current line-width is 0.00",
      "Specify next point or [Arc/Halfwidth/Length/Undo/Width]:",
      "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: A",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]:",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Angle/CEnter/CLose/Direction/Halfwidth/Line/Radius/Second pt/Undo/Width]:",
    ])
  })

  it("leaves an arc the other way while Ctrl is held", () => {
    const arcTo = (ctrlKey: boolean) => {
      const cad = createHarness()
      cad.command("PLINE").click(p(0, 0)).click(p(100, 0)).option("Arc")
      cad.click(p(100, 100), { ctrlKey }).enter()
      return cad.only<PolylineEntity>("polyline").bulges?.[1] ?? 0
    }

    // Tangent to the line, the arc turns left (counter-clockwise); started
    // the other way, it turns right.
    expect(arcTo(false)).toBeCloseTo(Math.tan(Math.PI / 4) * 1)
    expect(arcTo(true)).toBeLessThan(0)
  })

  it("accumulates the picks into a single connected entity", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .enter()

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(100, 0), p(100, 100)])
    expect(poly.closed).toBe(false)
    expect(cad.entityCount).toBe(1)
  })

  it("finishes on Enter straight after a pick, with no cursor movement", () => {
    // Regression: the length/angle prompt has no live heading immediately after
    // a pick, so Enter could not resolve and was silently swallowed until the
    // mouse moved.
    const cad = createHarness()

    cad.command("PLINE").click(p(0, 0)).click(p(100, 0)).enter()

    expect(cad.entityCount).toBe(1)
    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("keeps the polyline when Escape ends the command", () => {
    // Regression: Escape used to discard the accumulated vertices because the
    // tool reset its state before the commit-on-deactivate could run. AutoCAD
    // keeps what you drew, exactly as Enter does (desktop pline/d01, d02).
    const cad = createHarness()

    cad
      .command("PLINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.only<PolylineEntity>("polyline").vertices).toHaveLength(3)
  })

  // desktop pline/d01: with CECOLOR 1 the rubber band and the segments drawn
  // so far are red, as the polyline will be; d02: a wide one's band too.
  it("draws the chain so far and the rubber band in the colour the polyline will wear", () => {
    const colours = (cad: CadHarness) =>
      cad
        .scene()
        .primitives.flatMap((q) =>
          q.kind === "path" ? [q.stroke?.color ?? q.fill] : []
        )
    const cad = createHarness()
    cad.runtime.createLayer("Hidden", "#00ffff")

    cad.command("PLINE").click(p(0, 0)).click(p(50, 0)).moveTo(p(80, 40))
    expect(colours(cad)).toEqual(["#00ffff", "#00ffff"])

    // PLN-06: the polyline keeps the colour current at its start point.
    answer(cad, "'-COLOR", "1")
    cad.moveTo(p(80, 30))
    expect(colours(cad)).toEqual(["#00ffff", "#00ffff"])

    const wide = createHarness()
    wide.runtime.setCurrentColor("#ff0000")
    answer(wide, "PLINE", "0,0", "W", "4", "4", "@50,0")
    wide.moveTo(p(80, 40))
    expect(new Set(colours(wide))).toEqual(new Set(["#ff0000"]))
  })

  it("discards a chain too short to be geometry", () => {
    const cad = createHarness()

    cad.command("PLINE").click(p(0, 0)).escape()

    expect(cad.entityCount).toBe(0)
  })

  it("is a single undo step no matter how many vertices", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .click(p(0, 100))
      .enter()
    cad.undo()

    expect(cad.entityCount).toBe(0)
  })

  it("Close joins the last vertex back to the first", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .click(p(0, 100))
      .option("Close")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toHaveLength(4)
  })

  it("Undo steps back one vertex without leaving the command", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .click(p(0, 0))
      .click(p(50, 0))
      .click(p(50, 50))
      .option("Undo")
      .click(p(0, 80))
      .enter()

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(50, 0), p(0, 80)])
  })

  it("Arc mode curves the next segment tangentially", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .type("0,0")
      .enter()
      .type("@100,0")
      .enter()
      .option("Arc")
      .type("@0,100")
      .enter()
      .enter()

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(100, 0), p(100, 100)])
    // Tangent to the +X segment, turning through 180°: bulge = tan(180°/4) = 1.
    expect(poly.bulges?.[1]).toBeCloseTo(1, 5)
  })

  it("accepts typed relative coordinates", () => {
    const cad = createHarness()

    cad
      .command("PLINE")
      .type("0,0")
      .enter()
      .type("@100,0")
      .enter()
      .type("@0,100")
      .enter()
      .enter()

    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(100, 0),
      p(100, 100),
    ])
  })

  describe("its Undo after a transparent command", () => {
    const ltScale = (cad: CadHarness) =>
      cad.runtime.document.getSettings().ltScale

    it("takes 'LTSCALE back with the segment drawn before it", () => {
      // probe pline/p26: `Regenerating model.` said by the Undo, LTSCALE 1.
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(cad, "'LTSCALE", "2")

      expect(written(cad, "U")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: U",
        "Regenerating model.",
      ])
      expect(ltScale(cad)).toBe(1)
      expect(written(cad, "")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:",
      ])
      expect(vertices(cad)).toEqual(["0,0", "10,0"])
    })

    it("takes '-COLOR back with it", () => {
      // probe pline/p27: CECOLOR back to BYLAYER.
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(cad, "'-COLOR", "1", "U", "")

      expect(cad.runtime.document.getSettings().currentColor).toBe(
        COLOR_BYLAYER
      )
      expect(vertices(cad)).toEqual(["0,0", "10,0"])
    })

    it("takes a change back with the segment it was made after, not before", () => {
      // probe pline/p43: LTSCALE stays at the first Undo, goes at the second.
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0")
      answer(cad, "'LTSCALE", "2", "@0,10", "U")
      expect(ltScale(cad)).toBe(2)

      expect(written(cad, "U")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: U",
        "Regenerating model.",
      ])
      expect(ltScale(cad)).toBe(1)
      expect(cad.state().commandLine.prompt).toBe(
        "PLINE Specify next point or [Arc/Halfwidth/Length/Undo/Width]:"
      )
    })

    it("keeps a change made before a Width that went before the segment", () => {
      // probe pline/p44: the Width answered after 'LTSCALE, then the segment.
      const cad = answer(createHarness(), "PLINE", "0,0", "W", "2", "4")
      answer(cad, "@10,0", "'LTSCALE", "2", "W", "1", "1", "@0,10", "U", "")

      expect(ltScale(cad)).toBe(2)
      const polyline = cad.only<PolylineEntity>("polyline")
      expect(vertices(cad)).toEqual(["0,0", "10,0"])
      expect(polyline.widths).toEqual([[2, 4]])
      expect(cad.runtime.document.getSettings().polylineWidth).toBe(0)
    })

    it("keeps a change made at an arc's sub-prompt, before the arc", () => {
      // probe pline/p144: 'LTSCALE at Radius's prompt survives the arc's Undo.
      const cad = answer(createHarness(), "PLINE", "0,0", "10,0", "A", "R")
      answer(cad, "'LTSCALE", "2", "10", "20,10", "U")

      expect(ltScale(cad)).toBe(2)
      expect(cad.state().commandLine.prompt).toBe(
        "PLINE Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:"
      )
      answer(cad, "")
      expect(vertices(cad)).toEqual(["0,0", "10,0"])
    })

    it("removes nothing under UNDO Control None", () => {
      // probe pline/p42: the chain and LTSCALE both stay.
      const cad = answer(createHarness(), "UNDO", "C", "N")
      answer(cad, "PLINE", "0,0", "@10,0", "@0,10", "'LTSCALE", "2", "U")

      expect(cad.state().commandLine.prompt).toBe(
        "PLINE Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]:"
      )
      answer(cad, "")
      expect(ltScale(cad)).toBe(2)
      expect(vertices(cad)).toEqual(["0,0", "10,0", "10,10"])
    })
  })

  describe("Continue", () => {
    it("starts at a clockwise arc's drawn end", () => {
      // probe pline/p32: the arc is stored counter-clockwise from (10,0).
      const cad = answer(createHarness(), ...CLOCKWISE_ARC)
      answer(cad, "PLINE", "", "@5,0", "")

      expect(vertices(cad)).toEqual(["10,0", "15,0"])
    })

    it("starts at a line's end whatever LASTPOINT is, past a circle", () => {
      // probes pline/p185, p190
      const cad = answer(createHarness(), "LINE", "0,0", "10,10", "")
      answer(cad, "ID", "50,50", "CIRCLE", "50,50", "5")
      answer(cad, "PLINE", "", "@5,0", "")

      expect(vertices(cad)).toEqual(["10,10", "15,10"])
    })

    it("starts at a closed polyline's first vertex", () => {
      // probe pline/p189
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(cad, "C", "PLINE", "", "@5,0", "")

      expect(vertices(cad, 1)).toEqual(["0,0", "5,0"])
    })

    it("runs Length on along an arc-ended polyline's tangent", () => {
      // probe pline/p188
      const cad = answer(createHarness(), "PLINE", "0,0", "A", "@10,10", "")
      answer(cad, "PLINE", "", "L", "5", "")

      expect(vertices(cad, 1)).toEqual(["10,10", "10,15"])
    })

    it("with nothing to continue starts at the WCS origin, saying nothing", () => {
      // probes pline/p178, p184, p186: whatever LASTPOINT, past a circle.
      const cad = answer(createHarness(), "PLINE", "", "0,0", "@5,0", "")
      expect(cad.commandLog().slice(0, 4)).toEqual([
        "PLINE",
        "Specify start point:",
        "Current line-width is 0.00",
        "Specify next point or [Arc/Halfwidth/Length/Undo/Width]: 0,0",
      ])
      expect(vertices(cad)).toEqual(["0,0", "0,0", "5,0"])

      const elsewhere = answer(createHarness(), "ID", "7,8")
      answer(elsewhere, "CIRCLE", "30,30", "5", "PLINE", "", "@5,0", "")
      expect(vertices(elsewhere)).toEqual(["0,0", "5,0"])
    })

    it("with nothing to continue starts at the WCS origin in a moved UCS", () => {
      // probe pline/p191: UCS origin 5,5.
      const cad = answer(createHarness(), "UCS", "5,5", "")
      answer(cad, "PLINE", "", "@5,0", "")

      expect(vertices(cad)).toEqual(["0,0", "5,0"])
    })
  })

  describe("the points it is given", () => {
    it("starts at a 3D point's height and refuses a Z after it", () => {
      // probe pline/p18
      const cad = answer(createHarness(), "PLINE", "1,2,3", "@10,0")

      expect(written(cad, "@0,10,5", "20,20,7")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: @0,10,5",
        "2D point or option keyword required.",
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: 20,20,7",
        "2D point or option keyword required.",
      ])
      answer(cad, "")
      expect(cad.only<PolylineEntity>("polyline").elevation).toBe(3)
      expect(vertices(cad)).toEqual(["1,2", "11,2"])
    })

    it("refuses `#` and `*` after the start, in any UCS", () => {
      // probes pline/p19, p20
      const cad = answer(createHarness(), "PLINE", "0,0", "10<30")
      expect(written(cad, "#5,5", "*20,0")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: #5,5",
        "2D point or option keyword required.",
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: *20,0",
        "2D point or option keyword required.",
      ])

      const turned = answer(createHarness(), "UCS", "Z", "30")
      answer(turned, "PLINE", "0,0", "@10,0", "*20,0", "10<0", "")
      expect(turned.commandLog()).toContain(
        "2D point or option keyword required."
      )
      expect(vertices(turned)).toEqual(["0,0", "8.6603,5", "8.6603,5"])
    })

    it("adds a zero-length vertex for `@`", () => {
      // probe pline/p17
      const cad = answer(createHarness(), "PLINE", "@", "@10,0", "@", "@0,5")
      answer(cad, "")

      expect(vertices(cad)).toEqual(["0,0", "10,0", "10,0", "10,5"])
    })

    it("adds a vertex for a direct distance of 0, and runs back for a negative one", () => {
      // probe pline/p195: the console's cursor fixed at (289.98, 116.30).
      const cursor = p(289.98397, 116.30379)
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0")
      cad.moveTo(cursor)
      answer(cad, "0")
      cad.moveTo(cursor)
      answer(cad, "-5", "")

      expect(vertices(cad)).toEqual(["0,0", "10,0", "10,0", "5.3825,-1.9181"])
    })

    it("refuses a Tangent at the start point, with nothing to defer it to", () => {
      // probe pline/p29: `No found`, the snap left unnamed, then the start's.
      const cad = answer(createHarness(), "CIRCLE", "50,0", "10", "ZOOM", "E")
      answer(cad, "PLINE", "TAN", "50,10")

      expect(cad.commandLog().slice(-2)).toEqual([
        "No found for specified point.",
        "Invalid point.",
      ])
      expect(cad.state().commandLine.prompt).toBe("PLINE Specify start point:")
    })

    it("takes CIRCLE typed as a wrong answer, and LINE as its hidden LIne", () => {
      // probe pline/p180
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0")

      expect(written(cad, "_CIRCLE")).toEqual([
        "Specify next point or [Arc/Close/Halfwidth/Length/Undo/Width]: _CIRCLE",
        "2D point or option keyword required.",
      ])
      answer(cad, "_LINE", "@0,10", "")
      expect(vertices(cad)).toEqual(["0,0", "10,0", "10,10"])
    })
  })

  describe("LASTPOINT", () => {
    it("is the last vertex after Close, Undo and Enter", () => {
      // probes pline/p03, p16, p179
      const closed = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(closed, "C")
      expect(lastPoint(closed)).toMatch(/^ X = 10\.00 +Y = 10\.00 /)

      const undone = answer(createHarness(), "PLINE", "20,0", "@10,0", "@0,10")
      answer(undone, "U", "")
      expect(lastPoint(undone)).toMatch(/^ X = 30\.00 +Y = 0\.00 /)

      const ended = answer(createHarness(), "PLINE", "3,4", "")
      expect(ended.entityCount).toBe(0)
      expect(lastPoint(ended)).toMatch(/^ X = 3\.00 +Y = 4\.00 /)
    })

    it("is the vertex Length adds", () => {
      // probes pline/p171, p153: a point at Length measures from the vertex.
      const typed = answer(createHarness(), "PLINE", "0,0", "@10,0", "L", "5")
      answer(typed, "")
      expect(lastPoint(typed)).toMatch(/^ X = 15\.00 +Y = 0\.00 /)

      const pointed = answer(createHarness(), "PLINE", "0,0", "@10,0", "L")
      answer(pointed, "3,4", "")
      expect(vertices(pointed)).toEqual(["0,0", "10,0", "18.0623,0"])
      expect(lastPoint(pointed)).toMatch(/^ X = 18\.06 +Y = 0\.00 /)
    })

    it("stays at the arc's start when its end is refused", () => {
      // probe pline/p38: straight ahead no arc leaves tangent.
      const cad = answer(createHarness(), "PLINE", "0,0", "A", "@10,0")
      expect(cad.commandLog().at(-1)).toBe("*Invalid*")
      answer(cad, "")

      expect(lastPoint(cad)).toMatch(/^ X = 0\.00 +Y = 0\.00 /)
    })
  })

  describe("Close", () => {
    it("closes after Length, and where the last point is the first", () => {
      // probes pline/p162, p163
      const length = answer(createHarness(), "PLINE", "0,0", "@10,0", "L", "5")
      answer(length, "C")
      expect(length.only<PolylineEntity>("polyline").closed).toBe(true)
      expect(vertices(length)).toEqual(["0,0", "10,0", "15,0"])

      const back = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(back, "0,0", "C")
      expect(back.only<PolylineEntity>("polyline").closed).toBe(true)
      expect(vertices(back)).toEqual(["0,0", "10,0", "10,10", "0,0"])
    })

    it("is typed CL and CLOSE too", () => {
      // probe pline/p164
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(cad, "CL", "PLINE", "20,0", "@10,0", "@0,10", "CLOSE")

      const closed = cad
        .entities()
        .filter((e): e is PolylineEntity => e.type === "polyline")
        .map((polyline) => polyline.closed)
      expect(closed).toEqual([true, true])
    })

    it("closes a zero-length first segment, two vertices", () => {
      // probe pline/p177
      const cad = answer(createHarness(), "PLINE", "0,0", "@", "C")

      expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)
      expect(vertices(cad)).toEqual(["0,0", "0,0"])
    })

    it("is undone whole by U, which says PLINE", () => {
      // probe pline/p165
      const cad = answer(createHarness(), "PLINE", "0,0", "@10,0", "@0,10")
      answer(cad, "C", "U")

      expect(cad.commandLog().slice(-2)).toEqual(["U", "PLINE"])
      expect(cad.entityCount).toBe(0)
    })
  })
})

/** `ARC 0,10 7.0710678,7.0710678 10,0`: a quarter drawn clockwise (pline/p32). */
const CLOCKWISE_ARC = ["ARC", "0,10", "7.0710678,7.0710678", "10,0"] as const

/** What answering `texts` writes to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

/** The `index`th polyline's vertices as `x,y`, to four places. */
function vertices(cad: CadHarness, index = 0): string[] {
  const polyline = cad
    .entities()
    .filter((e): e is PolylineEntity => e.type === "polyline")[index]
  const round = (n: number) => Math.round(n * 10000) / 10000 + 0
  return polyline.vertices.map((v) => `${round(v.x)},${round(v.y)}`)
}

/** LASTPOINT as `ID @` writes it. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}
