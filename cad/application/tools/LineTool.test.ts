import { describe, expect, it, onTestFinished, vi } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { arcOf, circleOf, deg, lineOf, p } from "../../../test/builders"
import { SnapType } from "../snapping/types"

/**
 * LINE end-to-end, driven exactly as a user drives it: start the command, move
 * the pointer, click, type into dynamic input, press keywords. Nothing is
 * stubbed — the real snapping, constraint, dynamic-input and command pipelines
 * run, so these tests fail if any of them regresses, not just the tool.
 */

function lines(entities: readonly { type: string }[]): LineEntity[] {
  return entities.filter((e): e is LineEntity => e.type === "line")
}

describe("LINE", () => {
  it("draws a segment between two picked points", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
  })

  it("chains segments that share their endpoints", () => {
    const cad = createHarness()

    cad
      .command("LINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .escape()

    const drawn = lines(cad.entities())
    expect(drawn).toHaveLength(2)
    expect(drawn[0].end).toBeCloseToPoint(drawn[1].start)
    expect(drawn[1].end).toBeCloseToPoint(p(100, 100))
  })

  it("returns to the neutral Select tool on Escape, keeping what was drawn", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  it("ignores a zero-length segment from a double click", () => {
    const cad = createHarness()

    cad.command("LINE").click(p(50, 50)).click(p(50, 50)).escape()

    expect(cad.entityCount).toBe(0)
  })

  describe("typed coordinates", () => {
    it("accepts an absolute first point and a relative second", () => {
      const cad = createHarness()

      cad.command("LINE").type("0,0").enter().type("@100,0").enter().escape()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 0))
      expect(line.end).toBeCloseToPoint(p(100, 0))
    })

    it("accepts relative polar input", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("100<45").enter().escape()

      const line = cad.only<LineEntity>("line")
      expect(line.end).toBeCloseToPoint(
        p(100 * Math.cos(deg(45)), 100 * Math.sin(deg(45))),
        6
      )
    })

    it("forces an absolute point with the # prefix", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(200, 200)).type("#0,0").enter().escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(0, 0))
    })

    it("takes a length and an angle as separate fields", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("100", "distance")
        .type("30", "angle")
        .enter()
        .escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(30)), 100 * Math.sin(deg(30))),
        6
      )
    })

    it("hard-locks a typed value so a click cannot override it", () => {
      // AutoCAD's dimensional input: once you type a value the mouse stops
      // deciding it, and clicking commits the typed geometry.
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("100", "distance")
        .type("60", "angle")
        .click(p(900, 900))
        .escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(60)), 100 * Math.sin(deg(60))),
        6
      )
    })

    it("locks only the typed component, letting the cursor drive the rest", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .type("80", "distance")
        .click(p(500, 0))
        .escape()

      // Distance locked to 80, direction still taken from the pick.
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(80, 0), 6)
    })
  })

  describe("command options", () => {
    it("offers Close only once the chain has two segments", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0))
      expect(cad.optionAbbreviations()).not.toContain("C")

      cad.click(p(100, 0))
      expect(cad.optionAbbreviations()).toEqual(["U"])

      cad.click(p(100, 100))
      expect(cad.optionAbbreviations()).toEqual(["C", "U"])
    })

    it("Close draws back to the first vertex and ends the command", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(100, 100))
        .option("Close")

      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(3)
      expect(drawn[2].start).toBeCloseToPoint(p(100, 100))
      expect(drawn[2].end).toBeCloseToPoint(p(0, 0))
      expect(cad.activeToolId()).toBe("select")
    })

    it("Undo removes the last segment but keeps drawing", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      expect(cad.entityCount).toBe(2)

      cad.option("Undo")
      expect(cad.entityCount).toBe(1)
      expect(cad.activeToolId()).toBe("line")

      // The chain continues from the vertex the undo stepped back to.
      cad.click(p(200, 0)).escape()
      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(2)
      expect(drawn[1].start).toBeCloseToPoint(p(100, 0))
      expect(drawn[1].end).toBeCloseToPoint(p(200, 0))
    })
  })

  describe("drafting aids", () => {
    it("Ortho locks the segment to the dominant axis", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(100, 30)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
    })

    it("Ortho picks the vertical axis when the cursor leans that way", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(30, 100)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(0, 100))
    })

    it("snaps the start point onto an existing endpoint", () => {
      const cad = createHarness({
        entities: [
          {
            id: "L1",
            type: "line",
            layerId: "0",
            start: p(0, 0),
            end: p(100, 0),
          },
        ],
        snap: true,
      })

      // Pick slightly off the existing endpoint: the endpoint snap must win.
      cad.command("LINE").click(p(101.5, 1.5)).click(p(200, 0)).escape()

      const drawn = lines(cad.entities())
      expect(drawn).toHaveLength(2)
      expect(drawn[1].start).toBeCloseToPoint(p(100, 0))
    })
  })

  describe("undo history", () => {
    it("undoes the whole command with one U, as AutoCAD does", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(100, 100))
        .escape()
      cad.command("LINE").click(p(200, 0)).click(p(300, 0)).escape()
      expect(cad.entityCount).toBe(3)

      cad.undo()
      expect(cad.entityCount).toBe(2)
      cad.undo()
      expect(cad.entityCount).toBe(0)
      cad.redo()
      expect(cad.entityCount).toBe(2)
    })

    it("takes Ctrl+Z inside the command as its Undo option", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      cad.press("z", { ctrlKey: true })

      expect(cad.entityCount).toBe(1)
      expect(cad.activeToolId()).toBe("line")
      cad.click(p(0, 100)).escape()
      expect(lines(cad.entities())[1].start).toBeCloseToPoint(p(100, 0))
    })

    it("ends the command before UNDO, which takes all it drew", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).click(p(100, 0)).click(p(100, 100))
      cad.undo()

      expect(cad.entityCount).toBe(0)
      expect(cad.activeToolId()).toBe("select")
    })
  })

  it("draws on the current layer", () => {
    const cad = createHarness()
    const layerId = cad.runtime.createLayer("Walls")

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.only<LineEntity>("line").layerId).toBe(layerId)
  })
  describe("the next-point prompt", () => {
    it("offers Undo from the first point on, which takes that point back", () => {
      // AutoCAD: "Specify next point or [Undo]:" straight after the first point.
      const cad = createHarness()

      cad.command("LINE").click(p(10, 10))
      expect(cad.optionIds()).toEqual(["Undo"])

      cad.option("Undo")
      expect(cad.activeToolId()).toBe("line")
      expect(cad.optionIds()).toEqual([])
      expect(cad.state().dynamicInput?.fields[0].id).toBe("point")

      cad.click(p(20, 20)).click(p(60, 20)).escape()
      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(20, 20))
    })

    it("runs a typed length the other way when it is negative", () => {
      // "If you had typed -6, the vertical line would have been drawn downward"
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0)).type("-30").enter()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(-30, 0))
    })

    it("measures a length typed next from where the cursor still stands", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0))
      cad.type("100").enter().type("30").enter()

      // The cursor, unmoved at (50, 0), lies back towards the start.
      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(70, 0))
    })

    it("shows only acute angles, and reads a typed one on the cursor's side", () => {
      // "dimension input displays only acute angles … Angles specified when
      // creating new objects rely on the cursor location to determine the
      // positive angle direction."
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(-30, -40))
      const angle = cad.state().dynamicInput?.fields[1]
      expect(Number(angle?.placeholder)).toBeCloseTo(126.87, 2)

      cad.type("100", "distance").type("30", "angle").enter()
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(
        p(100 * Math.cos(deg(-30)), 100 * Math.sin(deg(-30))),
        6
      )
    })

    it("locks the next point to a typed <angle", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("<45").enter()
      expect(cad.commandLog()).toContain("Angle Override: 45")

      cad.click(p(80, 20)).escape()
      const end = cad.only<LineEntity>("line").end
      expect(end.x).toBeCloseTo(end.y, 9)
      expect(end.x).toBeCloseTo(50, 9)
    })

    it("holds the angle override for one point only", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).type("<90").enter()
      cad.moveTo(p(10, 100)).type("100").enter()
      cad.click(p(200, 130)).escape()

      const drawn = lines(cad.entities())
      expect(drawn[0].end).toBeCloseToPoint(p(0, 100))
      expect(drawn[1].end).toBeCloseToPoint(p(200, 130))
    })
  })

  describe("Continue", () => {
    it("leaves the last arc tangent to it, asking only the length", () => {
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter()
      expect(cad.state().dynamicInput?.fields.map((f) => f.id)).toEqual([
        "distance",
      ])
      cad.type("40").enter()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 50))
      expect(line.end).toBeCloseToPoint(p(-40, 50))
      // …and goes on from its end.
      cad.click(p(-40, 0)).escape()
      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(-40, 0))
    })

    it("takes a pick at the length prompt as the length", () => {
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter().click(p(0, 80)).escape()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(-30, 50))
    })
  })

  describe("typed points", () => {
    it("reads @ at the first point from the last point given", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(30, 30)).click(p(80, 30)).escape()
      cad.command("LINE").type("@10,10").enter().click(p(150, 40)).escape()

      expect(lines(cad.entities())[1].start).toBeCloseToPoint(p(90, 40))
    })

    it("runs a length typed on an OTRACK guide from the acquired point", () => {
      vi.useFakeTimers()
      onTestFinished(() => {
        vi.useRealTimers()
      })
      const cad = createHarness({
        entities: [lineOf(p(80, 60), p(120, 60))],
        snap: true,
      })

      cad.command("LINE").click(p(0, 0)).moveTo(p(80, 60))
      vi.advanceTimersByTime(500)
      cad.moveTo(p(80.5, 20)).type("25").enter().escape()

      expect(lines(cad.entities())[1].end).toBeCloseToPoint(p(80, 35))
    })
  })

  describe("the keyboard", () => {
    it("takes keys typed on the drawing into the box, and Space as Enter", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(50, 0))
      for (const key of "100") cad.press(key)
      cad.press(" ")
      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))

      cad.press(" ")
      expect(cad.activeToolId()).toBe("select")
      cad.press(" ")
      expect(cad.activeToolId()).toBe("line")
    })

    it("answers the prompt from the command line, coordinates absolute", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(10, 10))
      cad.runtime.setCommandLineText("100,50")
      cad.runtime.submitCommandLine()
      cad.runtime.setCommandLineText("CIRCLE")
      cad.runtime.submitCommandLine()

      expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 50))
      expect(cad.activeToolId()).toBe("line")
    })
  })

  describe("the prompt and its history", () => {
    it("names the command before each question, and the tooltip only asks", () => {
      const cad = createHarness()
      const asked = () => [
        cad.state().commandLine.prompt,
        cad.state().dynamicInput?.prompt,
      ]

      cad.command("LINE")
      expect(asked()).toEqual(["LINE Specify first point:", "Specify first point:"])
      cad.click(p(0, 0))
      expect(asked()).toEqual([
        "LINE Specify next point or [Undo]:",
        "Specify next point or",
      ])
      cad.click(p(100, 0)).click(p(100, 100))
      expect(asked()[0]).toBe("LINE Specify next point or [Close/Undo]:")
    })

    it("writes each prompt with its answer: bare for a pick or Enter", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).moveTo(p(10, 0))
      cad.type("100").enter()
      cad.type("@0,50").enter()
      cad.click(p(0, 50))
      cad.option("Undo")
      cad.press("Enter")

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "Specify next point or [Undo]: 100",
        "Specify next point or [Undo]: @0,50",
        "Specify next point or [Close/Undo]:",
        "Specify next point or [Close/Undo]: U",
        "Specify next point or [Close/Undo]:",
      ])
      expect(cad.state().commandLine.recent.map((line) => line.text)).toEqual([
        "Specify next point or [Close/Undo]:",
        "Specify next point or [Close/Undo]: U",
        "Specify next point or [Close/Undo]:",
      ])
    })

    it("writes *Cancel* after the prompt Escape leaves", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0)).escape()
      cad.command("LINE").press("Escape")

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point:",
        "Specify next point or [Undo]: *Cancel*",
        "LINE",
        "Specify first point: *Cancel*",
      ])
    })

    it("writes what was typed at the command line, before what it reported", () => {
      const cad = createHarness()

      cad.command("LINE").click(p(0, 0))
      cad.runtime.setCommandLineText("<45")
      cad.runtime.submitCommandLine()

      expect(cad.commandLog().slice(2)).toEqual([
        "Specify next point or [Undo]: <45",
        "Angle Override: 45",
      ])
    })

    it("names no question for Continue's length, whose wording is unverified", () => {
      const cad = createHarness({ entities: [arcOf(p(0, 0), 50, 0, deg(90))] })

      cad.command("LINE").enter()
      expect(cad.state().commandLine.prompt).toBe("LINE:")
      expect(cad.state().dynamicInput?.prompt).toBeNull()
      cad.type("40").enter()

      expect(cad.commandLog()).toEqual(["LINE", "Specify first point:"])
      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
    })

    it("still asks for the first point while a guide offers an offset", () => {
      vi.useFakeTimers()
      onTestFinished(() => {
        vi.useRealTimers()
      })
      const cad = createHarness({
        entities: [lineOf(p(80, 60), p(120, 60))],
        snap: true,
      })

      cad.command("LINE").moveTo(p(80, 60))
      vi.advanceTimersByTime(500)
      cad.moveTo(p(80.5, 20))
      expect(cad.state().dynamicInput?.fields[0].label).toBe("Offset")
      expect(cad.state().commandLine.prompt).toBe("LINE Specify first point:")
      cad.type("25").enter()

      expect(cad.commandLog().at(-1)).toBe("Specify first point: 25")
    })

    it("asks for the next point once a deferred tangent is picked", () => {
      const cad = createHarness({ entities: [circleOf(p(0, 0), 20)] })

      cad.command("LINE").type("tan").enter().click(p(-5, 19))

      expect(cad.state().commandLine.prompt).toBe(
        "LINE Specify next point or [Undo]:"
      )
      expect(cad.commandLog()).toEqual(["LINE", "Specify first point: tan to"])
    })

    it("writes an object snap on the line its pick answers", () => {
      const cad = createHarness({ entities: [lineOf(p(0, 0), p(50, 0))] })

      cad.command("LINE").type("end").enter().click(p(49, 1))
      cad.runtime.setSnapOverride(SnapType.Midpoint)
      cad.click(p(24, 1)).escape()

      expect(cad.commandLog()).toEqual([
        "LINE",
        "Specify first point: end of",
        "Specify next point or [Undo]: _mid of",
        "Specify next point or [Undo]: *Cancel*",
      ])
    })
  })

  describe("Shift", () => {
    it("turns Ortho off while it is held, as it turns it on", () => {
      const cad = createHarness()
      cad.runtime.toggleOrtho()

      cad.command("LINE").click(p(0, 0)).click(p(100, 30), { shiftKey: true })
      cad.click(p(130, 80)).escape()

      const drawn = lines(cad.entities())
      expect(drawn[0].end).toBeCloseToPoint(p(100, 30))
      expect(drawn[1].end).toBeCloseToPoint(p(100, 80))
    })
  })
  describe("a Tangent or Perpendicular at the first point", () => {
    const twoCircles = () =>
      createHarness({
        entities: [circleOf(p(0, 0), 20), circleOf(p(100, 0), 20)],
      })

    it("draws the line tangent to two circles, the one nearest the picks", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(2, 19.5))
      expect(cad.entityCount).toBe(2)
      expect(cad.optionIds()).toEqual(["Undo"])
      cad.type("tan").enter().click(p(98, 19.5)).escape()

      const line = cad.only<LineEntity>("line")
      expect(line.start).toBeCloseToPoint(p(0, 20))
      expect(line.end).toBeCloseToPoint(p(100, 20))
    })

    it("takes the crossing tangent when the picks are on opposite sides", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(5, 19))
      cad.type("tan").enter().click(p(95, -19)).escape()

      const { start, end } = cad.only<LineEntity>("line")
      // Through the midpoint between the circles, touching each square.
      expect((start.y + end.y) / 2).toBeCloseTo(0, 9)
      expect(start.y).toBeGreaterThan(0)
      expect(end.y).toBeLessThan(0)
      expect(Math.hypot(start.x, start.y)).toBeCloseTo(20, 9)
    })

    it("works the tangent point out from a plain next point", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(-5, 19)).click(p(0, 40))
      cad.escape()

      // From (0, 40) the tangents touch at 30° above the horizontal.
      const { start } = cad.only<LineEntity>("line")
      expect(start).toBeCloseToPoint(
        p(-20 * Math.cos(deg(30)), 20 * Math.sin(deg(30))),
        6
      )
    })

    it("drops a perpendicular onto a line from the next point", () => {
      const cad = createHarness({ entities: [lineOf(p(-100, 0), p(100, 0))] })

      cad.command("LINE").type("per").enter().click(p(30, 0.5)).click(p(60, 80))
      cad.escape()

      const drawn = lines(cad.entities())[1]
      expect(drawn.start).toBeCloseToPoint(p(60, 0))
      expect(drawn.end).toBeCloseToPoint(p(60, 80))
    })

    it("takes the pick back with Undo", () => {
      const cad = twoCircles()

      cad.command("LINE").type("tan").enter().click(p(2, 19.5)).option("Undo")
      cad.click(p(200, 200)).click(p(250, 200)).escape()

      expect(cad.only<LineEntity>("line").start).toBeCloseToPoint(p(200, 200))
    })
  })
})
