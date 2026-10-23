import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import {
  createMText,
  measureTextWidth,
  MTextEntity,
  MTEXT_LINE_SPACING_FACTOR,
  TextEntity,
} from "../../domain/entities"
import { createTextStyle } from "../../domain/textStyles"

/** A 10-high MTEXT drawn as a box from `first` to `second`, left in the editor. */
function box(cad: CadHarness, first = p(0, 0), second = p(200, -100)) {
  cad.command("MTEXT").click(first).option("Height").type("10").enter()
  return cad.click(second)
}

describe("MTEXT", () => {
  it("wraps the text to the box and hangs it off the top left corner", () => {
    const cad = createHarness()
    box(cad).type("FIRST PARAGRAPH\nSECOND").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.position).toBeCloseToPoint(p(0, 0))
    expect(mtext.width).toBeCloseTo(200)
    expect(mtext.height).toBeCloseTo(10)
    expect(mtext.attachment).toBe("tl")
    expect(mtext.contents).toBe("FIRST PARAGRAPH\\PSECOND")
    expect(cad.activeToolId()).toBe("select")
  })

  it("answers to T and MT", () => {
    const cad = createHarness()
    cad.command("T")
    expect(cad.activeToolId()).toBe("mtext")
    cad.escape().command("MT")
    expect(cad.activeToolId()).toBe("mtext")
    cad.escape()
  })

  it("anchors on the attachment point whichever way the box is dragged", () => {
    const cad = createHarness()
    box(cad, p(200, -100), p(0, 0)).type("X").enter()

    expect(cad.only<MTextEntity>("mtext").position).toBeCloseToPoint(p(0, 0))
  })

  it("offers the corner keywords at the opposite corner", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0))

    expect(cad.optionAbbreviations()).toEqual(["H", "J", "L", "R", "S", "W"])
    cad.escape()
  })

  it("justifies the box by the chosen attachment point", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Justify").option("MC")
    cad.click(p(200, -100)).type("X").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.attachment).toBe("mc")
    expect(mtext.position).toBeCloseToPoint(p(100, -50))
  })

  it("keeps the justification when Enter takes the default", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Justify").enter()

    expect(cad.optionAbbreviations()).toEqual(["H", "J", "L", "R", "S", "W"])
    cad.click(p(100, -50)).type("X").enter()
    expect(cad.only<MTextEntity>("mtext").attachment).toBe("tl")
  })

  it("sets line spacing by a factor or by a distance", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Height").type("10").enter()
    cad.option("Line spacing").option("Exactly").type("2x").enter()
    cad.click(p(100, -50)).type("X").enter()

    const factor = cad.only<MTextEntity>("mtext")
    expect(factor.lineSpacingStyle).toBe("exactly")
    expect(factor.lineSpacingFactor).toBeCloseTo(2)

    cad.command("MTEXT").click(p(0, 0)).option("Line spacing")
    cad.option("At least")
    cad.type(String(3 * MTEXT_LINE_SPACING_FACTOR * 10)).enter()
    cad.click(p(100, -50)).type("Y").enter()
    const distance = cad.entities()[1] as MTextEntity
    expect(distance.lineSpacingStyle).toBe("atLeast")
    expect(distance.lineSpacingFactor).toBeCloseTo(3)
  })

  it("refuses a spacing outside 0.25x to 4x", () => {
    const cad = createHarness()
    cad
      .command("MTEXT")
      .click(p(0, 0))
      .option("Line spacing")
      .option("At least")
    cad.type("5x").enter()

    expect(cad.commandLog().slice(-2)).toEqual([
      "Enter line spacing factor or distance <1x>: 5x",
      "Please specify a line spacing value between 1.04 (0.25x) and 16.67 (4x), inclusive.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Enter line spacing factor or distance <1x>:"
    )
    cad.escape()
  })

  it("asks MTEXT's questions and writes them answered", () => {
    const cad = createHarness()
    cad.command("MTEXT")
    expect(cad.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No'
    )
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify first corner:")
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width]:"
    )
    cad.option("Height")
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify height <2.50>:")
    cad.enter().option("Justify")
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:"
    )
    cad.option("MC").option("Line spacing")
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Enter line spacing type [At least/Exactly] <At least>:"
    )
    cad.option("Exactly").type("2x").enter().option("Rotation")
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Specify rotation angle <0>:"
    )
    cad.enter().option("Style")
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Enter style name or [?] <Standard>:"
    )
    cad.enter().option("Width")
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify width:")
    cad.escape()
  })

  it("turns the box with Rotation", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Rotation").type("90").enter()
    cad.click(p(100, 200)).type("UP").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.rotation).toBeCloseTo(Math.PI / 2)
    expect(mtext.width).toBeCloseTo(200)
    expect(mtext.position).toBeCloseToPoint(p(0, 0))
  })

  it("takes the width from Width, hanging off the first point", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(10, 10)).option("Width").type("80").enter()
    cad.type("NARROW").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.width).toBeCloseTo(80)
    expect(mtext.position).toBeCloseToPoint(p(10, 10))
  })

  it("switches style, and reports one that does not exist", () => {
    const cad = createHarness()
    cad.runtime.document.addTextStyle(createTextStyle("Notes", 0))
    cad.command("MTEXT").click(p(0, 0)).option("Style").type("Fancy").enter()
    expect(cad.commandLog().at(-1)).toBe("Invalid style name")

    cad.type("notes").enter().click(p(100, -50)).type("X").enter()
    expect(cad.only<MTextEntity>("mtext").styleId).toBe("Notes")
  })

  it("uses the height the style fixes", () => {
    const cad = createHarness()
    cad.runtime.document.addTextStyle(createTextStyle("Title", 20))
    cad.runtime.document.setCurrentTextStyle("Title")
    cad.command("MTEXT").click(p(0, 0)).click(p(100, -50)).type("X").enter()

    expect(cad.only<MTextEntity>("mtext").height).toBeCloseTo(20)
  })

  it("remembers its settings for the next run", () => {
    const cad = createHarness()
    box(cad).type("ONE").enter()
    cad.command("MTEXT").click(p(0, -200)).click(p(100, -300))
    cad.type("TWO").enter()

    expect((cad.entities()[1] as MTextEntity).height).toBeCloseTo(10)
  })

  it("throws the text away on Escape", () => {
    const cad = createHarness()
    box(cad).type("GONE").escape()

    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("select")
  })

  it("keeps the text on a click outside the box, not inside it", () => {
    const cad = createHarness()
    box(cad).type("KEEP")
    cad.click(p(100, -5))
    expect(cad.entityCount).toBe(0)

    cad.click(p(500, 500))
    expect(cad.only<MTextEntity>("mtext").contents).toBe("KEEP")
    expect(cad.activeToolId()).toBe("select")
  })

  it("adds nothing for an empty text", () => {
    const cad = createHarness()
    box(cad).enter()

    expect(cad.entityCount).toBe(0)
  })

  it("draws what is typed in place, wrapped, inside its frame", () => {
    const cad = createHarness()
    box(cad, p(0, 0), p(80, -100)).type("ONE TWO THREE")

    const texts = cad
      .scene()
      .primitives.filter((primitive) => primitive.kind === "text")
    expect(texts.map((text) => text.kind === "text" && text.text)).toEqual([
      "ONE TWO",
      "THREE",
    ])
    cad.escape()
  })

  it("is one undo step", () => {
    const cad = createHarness()
    box(cad).type("ONE\nTWO").enter()

    cad.undo()
    expect(cad.entityCount).toBe(0)
  })

  it("ends at the first corner on Enter", () => {
    const cad = createHarness()
    cad.command("MTEXT").enter()

    expect(cad.activeToolId()).toBe("select")
  })
})

describe("-MTEXT", () => {
  it("takes the text a line at a time and ends on an empty line", () => {
    const cad = createHarness()
    cad.command("-MTEXT").click(p(0, 0)).click(p(200, -100))
    cad.type("ONE").enter().type("TWO").enter()
    expect(cad.entityCount).toBe(0)

    cad.enter()
    expect(cad.only<MTextEntity>("mtext").contents).toBe("ONE\\PTWO")
    expect(cad.activeToolId()).toBe("select")
  })

  // The second -MTEXT offers `<4>`, then `<TL>`, `<0>`, `<At least>`, `<1x>`:
  // the height is TEXTSIZE, the rest start again every run (rectang/p312).
  it("starts Justify, Rotation and Line spacing again every run; the height stays", () => {
    const cad = createHarness()
    const answer = (...texts: string[]) => {
      for (const text of texts) {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
    }
    answer("_-MTEXT", "5,5", "_H", "4", "_J", "_MC", "_R", "20", "_L", "_E")
    answer("2", "25,25", "A", "")
    const from = cad.commandLog().length
    answer("_-MTEXT", "5,5", "_H", "", "_J", "", "_R", "", "_L", "")

    expect(
      cad
        .commandLog()
        .slice(from)
        .filter((line) => /<.*>:$/.test(line))
    ).toEqual([
      "Specify height <4.00>:",
      "Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:",
      "Specify rotation angle <0>:",
      "Enter line spacing type [At least/Exactly] <At least>:",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Enter line spacing factor or distance <1x>:"
    )
    cad.escape()
  })
})

describe("editing MTEXT", () => {
  const withMText = () =>
    createHarness({
      entities: [
        createMText(p(0, 0), "OLD\\PLINES", {
          height: 10,
          width: 200,
          id: "M1",
        }),
      ],
    })

  it("opens the paragraphs on a double-click", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5))

    const field = cad.state().dynamicInput?.fields[0]
    expect(field?.kind).toBe("paragraphs")
    expect(field?.value).toBe("OLD\nLINES")
    cad.escape()
  })

  it("writes the new paragraphs back", () => {
    const cad = withMText()
    cad.command("TEXTEDIT").click(p(10, -5)).type("NEW\nTEXT").enter()

    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW\\PTEXT")
    cad.escape()
  })

  it("keeps formatted contents that were not retyped", () => {
    const cad = createHarness({
      entities: [createMText(p(0, 0), "{\\H2x;BIG}", { height: 10, id: "M1" })],
    })
    cad.command("TEXTEDIT").click(p(5, -5)).enter()

    expect(cad.byId<MTextEntity>("M1").contents).toBe("{\\H2x;BIG}")
    cad.escape()
  })

  it("discards the edit on Escape", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5)).type("NOPE").escape()

    expect(cad.byId<MTextEntity>("M1").contents).toBe("OLD\\PLINES")
  })

  it("rewraps to a width dragged with its grip", () => {
    const cad = withMText()
    cad.select("M1").drag(p(200, 0), p(120, 0))

    expect(cad.byId<MTextEntity>("M1").width).toBeCloseTo(120)
  })

  // probe pieces/p255: Top left at 10,50, h10, on L1 red → TEXT OLD and
  // LINES, BaseLeft, on L1 red (their positions differ by the font's metrics,
  // EXP-06, the Text review's).
  it("explodes into one text per line (pieces/p255)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        {
          ...createMText(p(10, 50), "OLD\\PLINES", {
            height: 10,
            id: "M1",
            layerId: "L1",
          }),
          color: "#ff0000",
        },
      ],
      { layers: [layerOf("0"), layerOf("L1")] }
    )
    cad.select("M1").command("EXPLODE")

    const texts = cad.entities() as TextEntity[]
    expect(
      texts.map((text) => [
        text.type,
        text.value,
        text.justify,
        text.layerId,
        text.color,
      ])
    ).toEqual([
      ["text", "OLD", "left", "L1", "#ff0000"],
      ["text", "LINES", "left", "L1", "#ff0000"],
    ])
    expect(texts[0].position).toBeCloseToPoint(p(10, 40))
  })

  // probe pieces/p256: Middle center at 10,50 → OLD BaseLeft at
  // -4.328104,53.415189 and LINES at -10.334243,36.57799, each line's drawn
  // left end, not the column.
  it("makes each line Left at its drawn left end, whatever the attachment (pieces/p256)", () => {
    const cad = createHarness({
      entities: [
        createMText(p(10, 50), "OLD\\PLINES", {
          height: 10,
          attachment: "mc",
          id: "M1",
        }),
      ],
    })
    cad.select("M1").command("EXPLODE")

    const [old, lines] = cad.entities() as TextEntity[]
    expect([old.justify, lines.justify]).toEqual(["left", "left"])
    expect(old.position.x).toBeCloseTo(10 - measureTextWidth("OLD", 10) / 2)
    expect(lines.position.x).toBeCloseTo(10 - measureTextWidth("LINES", 10) / 2)
    expect(old.position.x).toBeCloseTo(-4.328104, 0)
  })

  it("is picked anywhere inside its box", () => {
    const cad = createHarness({
      entities: [
        createMText(p(0, 0), "A", { height: 10, width: 200, id: "M1" }),
        lineOf(p(0, -100), p(10, -100), { id: "L1" }),
      ],
    })
    cad.click(p(150, -5))

    expect(cad.selectedIds()).toEqual(["M1"])
  })
})
