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
import { V } from "../../geometry/Vec2"
import { type CadHarness, createHarness } from "../../../test/harness"
import { circleOf, deg, lineOf, p } from "../../../test/builders"
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
 * The draw commands. Each is checked through both of its input routes — picking
 * with the pointer and typing exact coordinates — because they take different
 * paths through the tool (`onPointerDown` versus the dynamic-input `commitRaw`)
 * and only one of them is usually exercised by hand.
 */

describe("CIRCLE", () => {
  it("asks each question of its modes, CIRCLERAD as the radius default", () => {
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

  it("3-Point ignores a collinear third pick and keeps prompting", () => {
    const cad = createHarness()

    cad.command("CIRCLE3P").click(p(0, 0)).click(p(50, 0)).click(p(100, 0)) // collinear: no circle exists
    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("circle3p")
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
})

describe("ARC", () => {
  it("3-Point sweeps counter-clockwise through the middle pick", () => {
    const cad = createHarness()

    cad.command("ARC").click(p(100, 0)).click(p(0, 100)).click(p(-100, 0))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0), 5)
    expect(arc.radius).toBeCloseTo(100, 5)
    expect(arc.startAngle).toBeCloseToAngle(0, 5)
    expect(arc.endAngle).toBeCloseToAngle(Math.PI, 5)
  })

  it("Start-Centre-End builds the quarter arc", () => {
    const cad = createHarness()

    cad.command("ARCSCE").click(p(100, 0)).click(p(0, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.radius).toBeCloseTo(100)
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("Centre-Start-End takes the centre first", () => {
    const cad = createHarness()

    cad.command("ARCCSE").click(p(0, 0)).click(p(100, 0)).click(p(0, 100))

    const arc = cad.only<ArcEntity>("arc")
    expect(arc.center).toBeCloseToPoint(p(0, 0))
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
  })

  it("asks for the centre first with Center at the start point", () => {
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
    const cad = createHarness()

    cad.command("ARCCSE").click(p(0, 0)).click(p(100, 0))
    cad.click(p(0, 100), { ctrlKey: true })

    // Clockwise from 0° round to 90°: counter-clockwise from 90° to 0°.
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(0)
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

  it("inscribes a typed radius with its bottom edge level", () => {
    const cad = createHarness()

    cad.command("POLYGON").type("6").enter().type("0,0").enter()
    cad.enter().type("100").enter()

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.closed).toBe(true)
    expect(polygon.vertices).toHaveLength(6)
    for (const vertex of polygon.vertices) {
      expect(V.length(vertex)).toBeCloseTo(100, 5)
    }
    // As AutoCAD 2023 lists it: a vertex at 0°, the bottom edge at y = -86.6.
    const ys = polygon.vertices.map((v) => v.y)
    expect(Math.min(...ys)).toBeCloseTo(-86.6025, 3)
    expect(polygon.vertices.some((v) => V.distance(v, p(100, 0)) < 1e-6)).toBe(
      true
    )
  })

  it("puts the radius on the edge midpoints when circumscribed", () => {
    const cad = createHarness()

    cad.command("POLYGON").type("5").enter().type("0,0").enter()
    cad.option("Circumscribed").type("100").enter()

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.vertices).toHaveLength(5)
    // Circumscribed: the radius is the apothem, so vertices sit further out,
    // and a typed one leaves a vertex straight up.
    for (const vertex of polygon.vertices) {
      expect(V.length(vertex)).toBeCloseTo(100 / Math.cos(Math.PI / 5), 5)
    }
    expect(
      polygon.vertices.some(
        (v) => V.distance(v, p(0, 100 / Math.cos(Math.PI / 5))) < 1e-6
      )
    ).toBe(true)
    const edgeMidpoint = V.midpoint(polygon.vertices[0], polygon.vertices[1])
    expect(V.length(edgeMidpoint)).toBeCloseTo(100, 5)
  })

  it("turns the polygon to a picked radius", () => {
    const cad = createHarness()

    cad.command("POLYGON").type("4").enter().click(p(0, 0)).enter()
    cad.click(p(0, 50))

    const polygon = cad.only<PolylineEntity>("polyline")
    expect(polygon.vertices[0]).toBeCloseToPoint(p(0, 50))
  })

  it("refuses a side count outside 3–1024 and asks again", () => {
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
