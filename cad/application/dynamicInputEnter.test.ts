import { describe, expect, it, onTestFinished, vi } from "vitest"

import { createHarness, type CadHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import type { CircleEntity, LineEntity, MTextEntity } from "../domain/entities"
import { createTextStyle } from "../domain/textStyles"

/**
 * Enter in the dynamic-input box with nothing typed, after the mouse has
 * moved: "the actions required to complete a command … are similar to those
 * for the Command prompt" — the prompt's `<default>`, or the end of the
 * command. Never the box's reading of where the cursor is. The keyboard's
 * Enter and the right button's are one path.
 */

const FAR = p(300, 300)

/**
 * The keyboard's Enter in the box, and the right button's: a right-click, or
 * the Command menu's Enter where the prompt offers options.
 */
const ENTERS: ReadonlyArray<[string, (cad: CadHarness) => void]> = [
  ["the keyboard", (cad) => cad.enter()],
  [
    "the right button",
    (cad) => {
      cad.rightClick(FAR)
      if (cad.state().shortcutMenu) {
        cad.runtime.chooseShortcutMenuAction("enter")
      }
    },
  ],
]

describe.each(ENTERS)("Enter from %s with nothing typed", (_, enter) => {
  it("ends LINE rather than drawing a segment to the cursor", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).moveTo(p(100, 80))
    enter(cad)

    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(0)
  })

  it("gives CIRCLE the last radius, CIRCLERAD, and ends it with none", () => {
    const cad = createHarness()
    cad.command("CIRCLE").click(p(0, 0)).moveTo(p(30, 0))
    enter(cad)
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(0)

    cad.command("CIRCLE").click(p(0, 0)).type("25").enter()
    cad.command("CIRCLE").click(p(200, 0)).moveTo(p(260, 0))
    enter(cad)
    const circle = cad.latest() as CircleEntity
    expect(circle.center).toBeCloseToPoint(p(200, 0))
    expect(circle.radius).toBeCloseTo(25)
  })

  it("moves by the first point, <use first point as displacement>", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("MOVE").click(p(50, 0)).enter()
    cad.click(p(20, 10)).moveTo(FAR)
    enter(cad)

    expect(cad.byId<LineEntity>("A").start).toBeCloseToPoint(p(20, 10))
    expect(cad.activeToolId()).toBe("select")
  })

  it("rotates by the last angle, 0 at first", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.select("A").command("ROTATE").click(p(0, 0))
    cad.moveTo(p(0, 100))
    enter(cad)
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(100, 0))

    cad.select("A").command("ROTATE").click(p(0, 0))
    cad.type("90").enter()
    cad.select("A").command("ROTATE").click(p(0, 0))
    cad.moveTo(p(100, 100))
    enter(cad)
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(-100, 0))
  })

  it("scales by the last factor, 1 at first", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.select("A").command("SCALE").click(p(0, 0))
    cad.moveTo(FAR)
    enter(cad)
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(100, 0))

    cad.select("A").command("SCALE").click(p(0, 0))
    cad.type("2").enter()
    cad.select("A").command("SCALE").click(p(0, 0))
    cad.moveTo(FAR)
    enter(cad)
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(400, 0))
  })
})

describe("Enter with nothing typed", () => {
  it("commits a form's defaults, which the box shows", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(40, 0), { id: "L1" })],
    })
    cad.select("L1").command("ARRAYRECT").moveTo(FAR).enter()

    expect(cad.entityCount).toBe(4 * 3)
  })

  it("places COPY's first copy by the first point, then takes <Exit>", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("COPY").click(p(50, 0)).enter()
    cad.click(p(20, 10)).moveTo(FAR).enter()
    expect(cad.activeToolId()).toBe("copy")
    expect((cad.latest() as LineEntity).start).toBeCloseToPoint(p(20, 10))

    cad.moveTo(p(0, 200)).enter()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(2)
  })

  it("offsets through a point at first, then by the last distance", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("OFFSET")
    expect(cad.state().commandLine.prompt).toBe(
      "OFFSET [Through/Erase: No/Layer: Source/Multiple: Off] <Through>:"
    )
    cad.moveTo(FAR).enter()
    expect(cad.optionIds()).toEqual(["Distance"])
    cad.escape()

    cad.command("OFFSET").type("10").enter()
    cad.click(p(50, 0)).click(p(50, 20)).enter()
    cad.command("OFFSET").moveTo(FAR).enter()
    cad.click(p(50, 0)).click(p(50, -20)).enter()

    const copy = cad.latest() as LineEntity
    expect(copy.start).toBeCloseToPoint(p(0, -10))
  })

  it("turns the UCS 90° about Z, whatever heading the box reads", () => {
    const cad = createHarness()
    cad.command("UCS").option("Z").moveTo(p(-50, 80)).enter()

    expect(cad.runtime.document.getSettings().ucs.xAxis).toBeCloseToPoint(
      p(0, 1)
    )
  })

  it("keeps MTEXT's height once the cursor has been read", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Height").type("10").enter()
    cad.option("Height").moveTo(p(0, 70)).enter()
    cad.click(p(200, -100)).type("X").enter()

    expect(cad.only<MTextEntity>("mtext").height).toBeCloseTo(10)
  })

  it("keeps TEXT's current style and goes back to the start point", () => {
    const cad = createHarness()
    cad.runtime.document.addTextStyle(createTextStyle("Title", 20))
    cad.runtime.document.setCurrentTextStyle("Title")
    cad.command("TEXT").option("Style").enter()

    expect(cad.activeToolId()).toBe("text")
    expect(cad.optionIds()).toEqual(["Justify", "Style"])
    expect(cad.commandLog().join("\n")).not.toContain("undefined")
  })

  it("continues LINE from the last line at a first point read off a guide", () => {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0))],
      snap: true,
    })
    cad.command("LINE").moveTo(p(100, 0))
    vi.advanceTimersByTime(500)
    cad.moveTo(p(170, 0.5))
    expect(cad.state().dynamicInput?.fields[0].id).toBe("distance")
    cad.enter().click(p(100, 100)).escape()

    const drawn = cad.latest() as LineEntity
    expect(drawn.start).toBeCloseToPoint(p(100, 0))
    expect(drawn.end).toBeCloseToPoint(p(100, 100))
  })

  it("places FROM's base point itself, <Offset> being none", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).command("FROM").click(p(40, 30))
    cad.enter().escape()

    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(40, 30))
  })

  it("keeps a grip edit hot instead of repeating the last command", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "A" })],
    })
    cad.command("LINE").escape()
    cad.select("A").click(p(100, 0)).moveTo(p(150, 50)).enter()
    expect(cad.activeToolId()).toBe("select")
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(100, 0))

    cad.click(p(150, 0))
    expect(cad.byId<LineEntity>("A").end).toBeCloseToPoint(p(150, 0))
  })
})
