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
import { V } from "../../geometry/Vec2"
import { createHarness } from "../../../test/harness"
import { circleOf, deg, lineOf, p } from "../../../test/builders"

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

  it("refuses a rotation that would draw a straight line", () => {
    const cad = createHarness()

    cad.command("ELLIPSE").click(p(-100, 0)).click(p(100, 0))
    cad.option("Rotation").type("90").enter()

    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("ellipse")
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
    // the centre; the prompt asks for the angle, so the end must be on the ray.
    cad.command("ELLIPSEARC").click(p(-100, 0)).click(p(100, 0)).click(p(0, 50))
    cad.type("0").enter().type("45").enter()

    const end = ellipseEndPoint(cad.only<EllipseEntity>("ellipse"))
    expect(Math.atan2(end.y, end.x)).toBeCloseToAngle(deg(45), 5)
  })

  it("measures an arc's angles from the major axis, not from world X", () => {
    const cad = createHarness()

    // The major axis runs vertically here, so angle 0 is the top of the
    // ellipse — the frame AutoCAD's Parameter equation is written in.
    cad.command("ELLIPSEARC").click(p(0, -100)).click(p(0, 100)).click(p(50, 0))
    cad.type("0").enter().type("90").enter()

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(0, 100), 5)
  })

  it("Included angle sweeps on from the start angle", () => {
    const cad = createHarness()

    cad.command("ELLIPSEARC").click(p(-100, 0)).click(p(100, 0)).click(p(0, 50))
    cad.type("0").enter()
    cad.option("Included angle").type("90").enter()

    const ellipse = cad.only<EllipseEntity>("ellipse")
    expect(ellipseStartPoint(ellipse)).toBeCloseToPoint(p(100, 0), 5)
    expect(ellipseEndPoint(ellipse)).toBeCloseToPoint(p(0, 50), 5)
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

  it("closes a fit spline periodically when Enter takes the default tangent", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(50, 80))
    cad.option("Close").enter()

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

  it("closes a CV spline at once, from the second vertex on", () => {
    const cad = createHarness()

    cad.command("SPLINE").option("Method").option("CV")
    cad.click(p(0, 0)).click(p(100, 0)).click(p(50, 80)).option("Close")

    const spline = cad.only<SplineEntity>("spline")
    expect(spline.closed).toBe(true)
    expect(spline.degree).toBe(2)
    expect(cad.activeToolId()).toBe("select")
  })

  it("shows its method, degree, knots and closure in the palette", () => {
    const cad = createHarness()

    cad.command("SPLINE").click(p(0, 0)).click(p(100, 0)).click(p(50, 80))
    cad.option("Close").enter().selectAll()

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

describe("RECTANG", () => {
  it("asks for the first corner, the option's value and the other corner", () => {
    const cad = createHarness()

    cad.command("RECTANG").option("Elevation")
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify the elevation for rectangles <0.00>:"
    )
    cad.type("5").enter().click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "RECTANG Specify other corner point:"
    )
    cad.click(p(20, 10))

    expect(cad.commandLog()).toEqual([
      "RECTANG",
      "Specify first corner point or [Elevation/Thickness]: E",
      "Specify the elevation for rectangles <0.00>: 5",
      "Specify first corner point or [Elevation/Thickness]:",
      "Specify other corner point:",
    ])
  })

  it("draws a closed polyline from two corners", () => {
    const cad = createHarness()

    cad.command("RECTANG").click(p(0, 0)).click(p(200, 120))

    const rect = cad.only<PolylineEntity>("polyline")
    expect(rect.closed).toBe(true)
    expect(rect.vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("accepts relative dimensions for the second corner", () => {
    const cad = createHarness()

    cad.command("RECTANG").type("0,0").enter().type("@200,120").enter()

    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(200, 0),
      p(200, 120),
      p(0, 120),
    ])
  })

  it("ignores a degenerate rectangle", () => {
    const cad = createHarness()

    cad.command("RECTANG").click(p(0, 0)).click(p(200, 0))

    expect(cad.entityCount).toBe(0)
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
      "Specify next point or [Arc]:",
      "Specify next point or [Arc/Undo]: A",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Line/Undo]:",
      "Specify endpoint of arc (hold Ctrl to switch direction) or [Line/Close/Undo]:",
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
    // keeps what you drew, exactly as Enter does.
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
})
