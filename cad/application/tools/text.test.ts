import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p, textOf } from "../../../test/builders"
import {
  TEXT_LINE_SPACING_FACTOR,
  TextEntity,
  textCorners,
} from "../../domain/entities"
import { DEFAULT_TEXT_HEIGHT } from "../../domain/textStyles"
import { createTextStyle } from "../../domain/textStyles"

/** Runs TEXT up to the point where the text itself is typed. */
function startText(
  cad: ReturnType<typeof createHarness>,
  at = p(0, 0),
  height?: string,
  rotation?: string
) {
  cad.command("TEXT").click(at)
  if (height !== undefined) cad.type(height)
  cad.enter()
  if (rotation !== undefined) cad.type(rotation)
  cad.enter()
  return cad
}

describe("TEXT", () => {
  it("places one line of text at the start point", () => {
    const cad = createHarness()
    startText(cad).type("HELLO").enter().escape()

    const text = cad.only<TextEntity>("text")
    expect(text.position).toBeCloseToPoint(p(0, 0))
    expect(text.value).toBe("HELLO")
    expect(text.height).toBeCloseTo(DEFAULT_TEXT_HEIGHT)
    expect(text.rotation).toBeCloseTo(0)
    expect(text.justify).toBe("left")
    expect(text.styleId).toBe("Standard")
  })

  it("takes the typed height and rotation", () => {
    const cad = createHarness()
    startText(cad, p(10, 20), "12", "90").type("A").enter().escape()

    const text = cad.only<TextEntity>("text")
    expect(text.height).toBeCloseTo(12)
    expect(text.rotation).toBeCloseTo(Math.PI / 2)
    expect(text.position).toBeCloseToPoint(p(10, 20))
  })

  it("continues on a fresh line one line-space below", () => {
    const cad = createHarness()
    startText(cad, p(0, 0), "10").type("ONE").enter().type("TWO").enter()
    cad.escape()

    const lines = cad.entities() as TextEntity[]
    expect(lines.map((line) => line.value)).toEqual(["ONE", "TWO"])
    expect(lines[1].position).toBeCloseToPoint(
      p(0, -10 * TEXT_LINE_SPACING_FACTOR)
    )
  })

  it("ends the command on an empty line", () => {
    const cad = createHarness()
    startText(cad).type("ONE").enter().enter()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  it("keeps what was typed when the command is cancelled", () => {
    const cad = createHarness()
    startText(cad).type("KEEP").escape()

    expect(cad.only<TextEntity>("text").value).toBe("KEEP")
  })

  it("continues beneath the previous line when Enter answers the start prompt", () => {
    const cad = createHarness()
    startText(cad, p(0, 0), "10").type("ONE").enter().escape()

    // Enter at "Specify start point" skips the height and rotation prompts.
    cad.command("TEXT").enter().type("TWO").enter().escape()

    const second = cad
      .entities()
      .find(
        (entity): entity is TextEntity =>
          entity.type === "text" && entity.value === "TWO"
      )
    expect(second).toBeDefined()
    expect(second!.height).toBeCloseTo(10)
    expect(second!.position).toBeCloseToPoint(
      p(0, -10 * TEXT_LINE_SPACING_FACTOR)
    )
  })

  it("offers Justify and Style only at the start prompt", () => {
    const cad = createHarness()
    cad.command("TEXT")
    expect(cad.optionAbbreviations()).toEqual(["J", "S"])

    startText(cad)
    expect(cad.optionAbbreviations()).toEqual([])
    cad.escape()
  })

  it("applies a justification keyword", () => {
    const cad = createHarness()
    cad.command("TEXT").option("Justify").type("tc").enter()
    startText(cad, p(0, 0)).type("MID").enter().escape()

    expect(cad.only<TextEntity>("text").justify).toBe("tc")
  })

  it("re-asks when the justification keyword is not one of the options", () => {
    const cad = createHarness()
    cad.command("TEXT").option("Justify").type("nope").enter()

    expect(cad.commandLog().at(-1)).toContain("Enter an option [Left/Center")
    expect(cad.activeToolId()).toBe("text")
  })

  it("skips the height prompt when the style fixes a height", () => {
    const cad = createHarness()
    cad.runtime.document.addTextStyle(createTextStyle("Title", 20))
    cad.runtime.document.setCurrentTextStyle("Title")

    // Only one Enter before typing: the height prompt never appears.
    cad.command("TEXT").click(p(0, 0)).enter().type("BIG").enter().escape()

    const text = cad.only<TextEntity>("text")
    expect(text.height).toBeCloseTo(20)
    expect(text.styleId).toBe("Title")
  })

  it("starts a new run of lines when you click elsewhere", () => {
    const cad = createHarness()
    startText(cad, p(0, 0), "10").type("ONE")
    cad.click(p(100, 100)).type("TWO").enter().escape()

    const lines = cad.entities() as TextEntity[]
    expect(lines.map((line) => line.value)).toEqual(["ONE", "TWO"])
    expect(lines[1].position).toBeCloseToPoint(p(100, 100))
  })

  it("previews the text being typed and draws it once committed", () => {
    const cad = createHarness()
    startText(cad, p(0, 0), "10").type("LIVE")

    const previews = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "text")
    // One in the drawing overlay while nothing is committed yet.
    expect(previews).toHaveLength(1)
    expect(previews[0]).toMatchObject({ text: "LIVE", height: 10 })
    cad.escape()
  })

  it("undoes a committed line in one step", () => {
    const cad = createHarness()
    startText(cad).type("ONE").enter().escape()
    expect(cad.entityCount).toBe(1)

    cad.undo()
    expect(cad.entityCount).toBe(0)
  })
})

describe("TEXTEDIT", () => {
  /** A drawing with one text object and one line, to test the pick filter. */
  const withText = () =>
    createHarness({
      entities: [
        textOf(p(0, 0), "OLD", { height: 10, id: "T1" }),
        lineOf(p(-200, -200), p(-100, -200), { id: "L1" }),
      ],
    })

  const edited = (cad: CadHarness) => cad.byId<TextEntity>("T1")

  it("opens the object's current wording for editing", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5))

    expect(cad.state().dynamicInput?.fields[0].value).toBe("OLD")
  })

  it("retypes the text in place, keeping the object", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("NEW WORDING").enter()

    expect(edited(cad).value).toBe("NEW WORDING")
    expect(edited(cad).height).toBeCloseTo(10)
    expect(cad.entityCount).toBe(2)
    // Multiple mode is AutoCAD's default: the command keeps asking.
    expect(cad.activeToolId()).toBe("textedit")
    cad.escape()
  })

  it("hides the object it is editing so only the new wording shows", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("LIVE")

    const texts = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "text")
    expect(texts).toHaveLength(1)
    expect(texts[0]).toMatchObject({ text: "LIVE" })
    cad.escape()
  })

  it("keeps the edit when the command is cancelled", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("KEPT").escape()

    expect(edited(cad).value).toBe("KEPT")
  })

  it("leaves the text alone when the box is emptied", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("").enter()

    expect(edited(cad).value).toBe("OLD")
    cad.escape()
  })

  it("ignores anything that is not an annotation object", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(-150, -200))

    // Still asking: the line was not opened for editing.
    expect(cad.activeToolId()).toBe("textedit")
    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    cad.escape()
  })

  it("edits a single object and ends in Single mode", () => {
    const cad = withText()
    cad.command("TEXTEDIT").option("Mode")
    expect(cad.optionAbbreviations()).toEqual(["M"])

    cad.click(p(20, 5)).type("ONCE").enter()
    expect(edited(cad).value).toBe("ONCE")
    expect(cad.activeToolId()).toBe("select")
  })

  it("offers Undo only once something has been edited, and backs it out", () => {
    const cad = withText()
    cad.command("TEXTEDIT")
    expect(cad.optionAbbreviations()).toEqual(["M"])

    cad.click(p(20, 5)).type("CHANGED").enter()
    expect(cad.optionAbbreviations()).toEqual(["U", "M"])

    cad.option("Undo")
    expect(edited(cad).value).toBe("OLD")
    expect(cad.optionAbbreviations()).toEqual(["M"])
    cad.escape()
  })

  it("preserves the id and the ByObject overrides", () => {
    const cad = createHarness({
      entities: [
        {
          ...textOf(p(0, 0), "OLD", { height: 10, id: "T1" }),
          color: "#ff0000",
        },
      ],
    })
    cad.command("TEXTEDIT").click(p(20, 5)).type("NEW").escape()

    expect(edited(cad).id).toBe("T1")
    expect(edited(cad).color).toBe("#ff0000")
  })

  it("undoes one edit per step", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("NEW").escape()

    cad.undo()
    expect(edited(cad).value).toBe("OLD")
  })

  it("starts from a double-click on the text", () => {
    const cad = withText()
    cad.doubleClick(p(20, 5))

    expect(cad.activeToolId()).toBe("textedit")
    expect(cad.state().dynamicInput?.fields[0].value).toBe("OLD")

    cad.type("BY DOUBLE CLICK").enter()
    expect(edited(cad).value).toBe("BY DOUBLE CLICK")
    cad.escape()
  })

  it("ignores a double-click on anything else", () => {
    const cad = withText()
    cad.doubleClick(p(-150, -200))

    expect(cad.activeToolId()).toBe("select")
  })
})

describe("text geometry", () => {
  it("hangs its box off the justification point", () => {
    const left = textOf(p(0, 0), "AB", { height: 10, justify: "left" })
    const right = textOf(p(0, 0), "AB", { height: 10, justify: "right" })

    const leftCorners = textCorners(left)
    const rightCorners = textCorners(right)
    expect(Math.min(...leftCorners.map((c) => c.x))).toBeCloseTo(0)
    expect(Math.max(...rightCorners.map((c) => c.x))).toBeCloseTo(0)
  })

  it("is picked anywhere on the lettering, not just on its edge", () => {
    const cad = createHarness({
      entities: [textOf(p(0, 0), "WIDE TEXT", { height: 10, id: "T1" })],
    })
    // Well inside the box, far from every edge.
    cad.click(p(20, 5))

    expect(cad.selectedIds()).toEqual(["T1"])
  })
})
