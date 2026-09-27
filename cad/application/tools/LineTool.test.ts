import { describe, expect, it } from "vitest"
import type { LineEntity } from "../../domain/entities"
import { createHarness } from "../../../test/harness"
import { deg, p } from "../../../test/builders"

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
      expect(cad.optionKeys()).not.toContain("C")

      cad.click(p(100, 0))
      expect(cad.optionKeys()).toEqual(["U"])

      cad.click(p(100, 100))
      expect(cad.optionKeys()).toEqual(["C", "U"])
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
    it("makes every segment individually undoable", () => {
      const cad = createHarness()

      cad
        .command("LINE")
        .click(p(0, 0))
        .click(p(100, 0))
        .click(p(100, 100))
        .escape()
      expect(cad.entityCount).toBe(2)

      cad.undo()
      expect(cad.entityCount).toBe(1)
      cad.undo()
      expect(cad.entityCount).toBe(0)
      cad.redo()
      expect(cad.entityCount).toBe(1)
    })
  })

  it("draws on the current layer", () => {
    const cad = createHarness()
    const layerId = cad.runtime.createLayer("Walls")

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.only<LineEntity>("line").layerId).toBe(layerId)
  })
})
