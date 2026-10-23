import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import {
  createMText,
  MTextEntity,
  MTEXT_LINE_SPACING_FACTOR,
  TextEntity,
} from "../../domain/entities"
import { createTextStyle } from "../../domain/textStyles"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"

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

  it("answers to T and MT (text/p261, p262)", () => {
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

  it("refuses a spacing outside 0.25x to 4x (text/p216)", () => {
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

  // text/p202, p213: 2027 lists `/Columns` too, which is not built here.
  it("asks MTEXT's questions and writes them answered (text/p202, p213)", () => {
    const cad = createHarness()
    cad.command("MTEXT")
    expect(cad.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  2.5  Annotative:  No'
    )
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify first corner:")
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe(
      "MTEXT Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width]:"
    )
    cad.option("Height")
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify height <2.5>:")
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

  it("turns the box with Rotation (text/p222)", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).option("Rotation").type("90").enter()
    cad.click(p(100, 200)).type("UP").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.rotation).toBeCloseTo(Math.PI / 2)
    expect(mtext.width).toBeCloseTo(200)
    expect(mtext.position).toBeCloseToPoint(p(0, 0))
  })

  it("takes the width from Width, hanging off the first point (text/p230)", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(10, 10)).option("Width").type("80").enter()
    cad.type("NARROW").enter()

    const mtext = cad.only<MTextEntity>("mtext")
    expect(mtext.width).toBeCloseTo(80)
    expect(mtext.position).toBeCloseToPoint(p(10, 10))
  })

  it("switches style, and reports one that does not exist (text/p226)", () => {
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

  it("closes at once on Escape with nothing typed (desktop text/d06)", () => {
    const cad = createHarness()
    box(cad).escape()

    expect(cad.state().unsavedTextDialog).toBe(false)
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

  // text/p201, desktop text/d05-6: AllowNone false at the first corner.
  it("refuses Enter at the first corner and asks again (text/p201)", () => {
    const cad = createHarness()
    cad.command("MTEXT").enter()

    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify first corner:",
      "Invalid point.",
    ])
    expect(cad.activeToolId()).toBe("mtext")
    expect(cad.state().commandLine.prompt).toBe("MTEXT Specify first corner:")
    cad.escape()
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
      "Specify height <4>:",
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

  it("runs as MTEDIT on a double-click: `_mtedit`, no settings line, ends with the editor (desktop text/d06, DoubleClickRoot.cui)", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5))

    expect(cad.commandLog()).toEqual(["_mtedit"])
    cad.type("NEW").enter()
    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual(["_mtedit"])

    // WHY TEXTEDIT: MTEDIT is not built, so the run is TEXTEDIT's.
    answer(cad, "U")
    expect(cad.byId<MTextEntity>("M1").contents).toBe("OLD\\PLINES")
    expect(cad.commandLog().at(-1)).toBe("TEXTEDIT")
  })

  it("ends at a click outside the editor after a double-click", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5)).type("NEW").click(p(500, 500))

    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW")
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks to save a changed wording after a double-click, and ends (desktop text/d05-5)", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5)).type("NEW").escape()
    expect(cad.state().unsavedTextDialog).toBe(true)
    cad.runtime.answerUnsavedText("yes")

    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW")
    expect(cad.activeToolId()).toBe("select")
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

  it("closes at once on Escape when the wording is unchanged (desktop text/d06)", () => {
    const cad = withMText()
    cad.doubleClick(p(10, -5)).escape()

    expect(cad.state().unsavedTextDialog).toBe(false)
    expect(cad.activeToolId()).toBe("select")
  })

  it("rewraps to a width dragged with its grip", () => {
    const cad = withMText()
    cad.select("M1").drag(p(200, 0), p(120, 0))

    expect(cad.byId<MTextEntity>("M1").width).toBeCloseTo(120)
  })

  // probe pieces/p255: Top left at 10,50, h10, on L1 red → TEXT OLD and
  // LINES, BaseLeft, on L1 red, at 9.324693,39.822647 and 8.976808,22.985448:
  // set by the ink (text/p303).
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
    expect(texts[0].position).toBeCloseToPoint(p(9.324693, 39.822647), 5)
    expect(texts[1].position).toBeCloseToPoint(p(8.976808, 22.985448), 5)
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
    expect(old.position).toBeCloseToPoint(p(-4.328104, 53.415189), 5)
    expect(lines.position).toBeCloseToPoint(p(-10.334243, 36.57799), 5)
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

/** Typed at the command line and confirmed, as a console probe answers. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** What `ID @` says LASTPOINT is. */
function lastPoint(cad: CadHarness): string | undefined {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)
}

const mtexts = (cad: CadHarness) =>
  cad.entities().filter((e): e is MTextEntity => e.type === "mtext")

describe("-MTEXT against AutoCAD 2027's console", () => {
  it("refuses Enter and FOO at the first corner (text/p201, p202)", () => {
    for (const typed of ["", "FOO"]) {
      const cad = createHarness()
      answer(cad, "_-MTEXT", typed)
      expect(cad.commandLog().at(-1)).toBe("Invalid point.")
      expect(cad.state().commandLine.prompt).toBe(
        "-MTEXT Specify first corner:"
      )
      cad.escape()
    }
    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "")
    expect(spanish.commandLog().at(-1)).toBe("Punto no válido.")
    spanish.escape()
  })

  it("refuses FOO, a Z, another prompt's keyword and _U at the opposite corner (text/p203, p205, p214, p251)", () => {
    for (const typed of ["FOO", "25,25,3", "_MC", "_U"]) {
      const cad = createHarness()
      answer(cad, "_-MTEXT", "5,5", typed)
      expect(cad.commandLog().at(-1)).toBe(
        "2D point or option keyword required."
      )
      cad.escape()
    }
    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "5,5", "FOO")
    expect(spanish.commandLog().at(-1)).toBe(
      "Se requiere un punto 2D o una opción."
    )
    spanish.escape()
  })

  it("makes a width-0 object from an opposite corner on the first (text/p204)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "5,5", "A", "")
    expect(mtexts(cad)[0]?.width).toBe(0)
  })

  it("keeps the first corner's Z (text/p206)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5,3", "25,25", "A", "")
    expect(mtexts(cad)[0]?.position).toBeCloseToPoint(p(5, 25))
    expect(mtexts(cad)[0]?.elevation ?? 0).toBeCloseTo(3)
  })

  it("reads @ from the first corner and leaves LASTPOINT on the opposite one (text/p207)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "@20,-10", "A", "")
    expect(mtexts(cad)[0]?.position).toBeCloseToPoint(p(5, 5))
    expect(mtexts(cad)[0]?.width).toBeCloseTo(20)
    expect(lastPoint(cad)).toBe(" X = 25.00     Y = -5.00     Z = 0.00")
  })

  it("reads @ at the first corner from LASTPOINT (text/p279)", () => {
    const cad = createHarness()
    answer(cad, "_LINE", "0,0", "10,0", "", "_-MTEXT", "@5,5", "@20,-10")
    answer(cad, "A", "")
    expect(mtexts(cad)[0]?.position).toBeCloseToPoint(p(15, 5))
  })

  it("refuses Height 0 and -1 as nonzero, FOO as no distance (text/p209, p210, p211)", () => {
    const refusals: Record<string, string> = {
      "0": "Value must be positive and nonzero.",
      "-1": "Value must be positive and nonzero.",
      FOO: "Requires numeric distance or second point.",
    }
    for (const [typed, refusal] of Object.entries(refusals)) {
      const cad = createHarness()
      answer(cad, "_-MTEXT", "5,5", "_H", typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.state().commandLine.prompt).toBe(
        "-MTEXT Specify height <2.5>:"
      )
      cad.escape()
    }
    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "5,5", "_H", "0")
    expect(spanish.commandLog().at(-1)).toBe(
      "El valor debe ser positivo y diferente de cero."
    )
    spanish.escape()
  })

  it("takes a point at Height as its distance from the first corner (text/p212)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_H", "5,9")
    expect(cad.runtime.document.getSettings().textSize).toBeCloseTo(4)
    cad.escape()
  })

  it("refuses FOO at Justify, then takes MC (text/p213)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_J", "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Enter justification [TL/TC/TR/ML/MC/MR/BL/BC/BR] <TL>:"
    )
    answer(cad, "_MC", "25,25", "A", "")
    expect(mtexts(cad)[0]?.position).toBeCloseToPoint(p(15, 15))

    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "5,5", "_J", "FOO")
    expect(spanish.commandLog().at(-1)).toBe("Opción no válida.")
    spanish.escape()
  })

  it("refuses FOO at the spacing type, then takes Exactly 2x (text/p215)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_L", "FOO")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    answer(cad, "_E", "2x", "25,25", "A", "")
    expect(mtexts(cad)[0]?.lineSpacingStyle).toBe("exactly")
    expect(mtexts(cad)[0]?.lineSpacingFactor).toBeCloseTo(2)
  })

  it("takes the declared words Linespacing and Atleast (text/p200, p263)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_LINESPACING", "_ATLEAST")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Enter line spacing factor or distance <1x>:"
    )
    cad.escape()
    answer(cad, "_-MTEXT", "5,5", "LINESPACING", "ATLEAST")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Enter line spacing factor or distance <1x>:"
    )
    cad.escape()

    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "5,5", "INTERLINEADO", "ALMENOS")
    expect(spanish.state().commandLine.prompt).toBe(
      "-TEXTOM Indique el factor de interlineado o distancia <1x>:"
    )
    spanish.escape()
  })

  it("refuses a spacing out of range, and -1 as not positive (text/p216-p219, p221, p272)", () => {
    const range =
      "Please specify a line spacing value between 1.25 (0.25x) and 20 (4x), inclusive."
    const refusals: Record<string, string> = {
      "5x": range,
      "0.2x": range,
      FOO: range,
      "0": range,
      "-1": "Value must be positive.",
    }
    for (const [typed, refusal] of Object.entries(refusals)) {
      const cad = createHarness()
      cad.runtime.document.updateSettings({ textSize: 3 })
      answer(cad, "_-MTEXT", "5,5", "_L", "", typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.state().commandLine.prompt).toBe(
        "-MTEXT Enter line spacing factor or distance <1x>:"
      )
      cad.escape()
    }
  })

  it("takes a bare number as a distance (text/p220)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_L", "", "2", "25,25", "A", "")
    expect(mtexts(cad)[0]?.lineSpacingFactor).toBeCloseTo(0.48)
  })

  // 4 from the first corner, 4 / (5/3 × 2.5) = 0.96 (MPDUMP's
  // LineSpaceDistance 4, LineSpacingFactor 0.96).
  it("takes a point, typed or picked, as its distance from the first corner (text/p265)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_L", "_E", "5,9", "25,25", "A", "")
    expect(mtexts(cad)[0]?.lineSpacingFactor).toBeCloseTo(0.96)

    const picked = createHarness()
    picked.command("MTEXT").click(p(5, 5)).option("Line spacing")
    picked.option("Exactly").click(p(5, 9))
    expect(picked.state().commandLine.prompt).toBe(
      "MTEXT Specify opposite corner or [Height/Justify/Line spacing/Rotation/Style/Width]:"
    )
    picked.click(p(25, -25)).type("A").enter()
    expect(picked.only<MTextEntity>("mtext").lineSpacingFactor).toBeCloseTo(
      0.96
    )
  })

  // UseDashedLine at Height, Rotation, Width and the spacing (text/p209,
  // p222, p228, p265).
  it("draws a dashed band from the first corner at its distances and its angle", () => {
    for (const keyword of ["Height", "Rotation", "Width", "Line spacing"]) {
      const cad = createHarness()
      cad.command("MTEXT").click(p(0, 0)).option(keyword)
      if (keyword === "Line spacing") cad.option("At least")
      cad.moveTo(p(30, 40))
      const bands = cad
        .scene()
        .primitives.filter(
          (primitive) =>
            primitive.kind === "segment" &&
            primitive.stroke.color === THEME.dashedRubberBand &&
            primitive.stroke.dash !== undefined
        )
      expect(bands, keyword).toHaveLength(1)
      cad.escape()
    }
  })

  it("refuses FOO at Rotation and writes the next default as AutoCAD does (text/p222, p223, p224)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_R", "FOO")
    expect(cad.commandLog().at(-1)).toBe(
      "Requires valid numeric angle or second point."
    )
    answer(cad, "5,15", "_R")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Specify rotation angle <90>:"
    )
    answer(cad, "400", "_R")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Specify rotation angle <40>:"
    )
    answer(cad, "-30", "_R")
    expect(cad.state().commandLine.prompt).toBe(
      "-MTEXT Specify rotation angle <330>:"
    )
    cad.escape()

    const turned = createHarness()
    answer(turned, "_-MTEXT", "5,5", "_R", "30", "25,25", "A", "")
    expect(mtexts(turned)[0]?.rotation).toBeCloseTo(Math.PI / 6)
    expect(mtexts(turned)[0]?.position).toBeCloseToPoint(
      p(1.3397459621556123, 11.339745962155618)
    )
  })

  it("takes Width 0, a point, and Enter as 0; refuses -5 and FOO (text/p227-p230, p269, p273)", () => {
    const zero = createHarness()
    answer(zero, "_-MTEXT", "5,5", "_W", "0", "A", "")
    expect(mtexts(zero)[0]?.width).toBe(0)

    const point = createHarness()
    answer(point, "_-MTEXT", "5,5", "_W", "45,5", "A", "")
    expect(mtexts(point)[0]?.width).toBeCloseTo(40)

    const enter = createHarness()
    answer(enter, "_-MTEXT", "5,5", "_W", "")
    expect(enter.state().commandLine.prompt).toBe("-MTEXT MText:")
    answer(enter, "A", "")
    expect(mtexts(enter)[0]?.width).toBe(0)

    const refusals: Record<string, string> = {
      "-5": "Value must be positive.",
      FOO: "Requires numeric distance or second point.",
    }
    for (const [typed, refusal] of Object.entries(refusals)) {
      const cad = createHarness()
      answer(cad, "_-MTEXT", "5,5", "_W", typed)
      expect(cad.commandLog().at(-1)).toBe(refusal)
      expect(cad.state().commandLine.prompt).toBe("-MTEXT Specify width:")
      cad.escape()
    }
    const spanish = createHarness({ locale: es })
    answer(spanish, "_-MTEXT", "5,5", "_W", "-5")
    expect(spanish.commandLog().at(-1)).toBe("El valor debe ser positivo.")
    spanish.escape()
  })

  it("writes its heights without trailing zeros at LUPREC, where TEXT keeps them (text/p202, p264, p266, p272)", () => {
    const pi = createHarness()
    pi.runtime.document.updateSettings({ textSize: 3.14159265 })
    answer(pi, "_-MTEXT")
    expect(pi.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  3.14  Annotative:  No'
    )
    answer(pi, "5,5", "_L", "", "5x")
    expect(pi.commandLog().at(-1)).toBe(
      "Please specify a line spacing value between 1.31 (0.25x) and 20.94 (4x), inclusive."
    )
    pi.escape()

    const three = createHarness()
    three.runtime.document.updateSettings({ textSize: 3 })
    answer(three, "_-MTEXT")
    expect(three.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  3  Annotative:  No'
    )
    three.escape()

    const six = createHarness()
    six.runtime.setDocumentPrecision(6)
    answer(six, "_-MTEXT", "5,5", "_H", "2.123456789", "_H")
    expect(six.state().commandLine.prompt).toBe(
      "-MTEXT Specify height <2.123457>:"
    )
    six.escape()
  })

  it("puts TEXTSIZE back on U, which names -MTEXT (text/p250)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_H", "4", "25,25", "A", "")
    expect(cad.runtime.document.getSettings().textSize).toBeCloseTo(4)
    answer(cad, "_U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "-MTEXT"])
    expect(cad.runtime.document.getSettings().textSize).toBeCloseTo(2.5)
    expect(cad.entityCount).toBe(0)
  })

  it("puts TEXTSTYLE back on U after Style made one current (text/p226c)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    answer(cad, "_-MTEXT", "5,5", "_S", "S2", "25,25", "A", "")
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("S2")
    expect(mtexts(cad)[0]?.styleId).toBe("S2")

    answer(cad, "_U")
    expect(cad.commandLog().at(-1)).toBe("-MTEXT")
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("Standard")
  })

  // MPDUMP's Contents `'_ZOOM\P%%d45\Pa\b{c}\P\P\PA B C`: the lines as typed,
  // `\P` a break of its own, joined by `\P`.
  it("keeps the codes of a typed line raw (text/p255)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "25,25", "'_ZOOM", "%%d45", "a\\b{c}")
    answer(cad, "\\P", "A B C", "")
    expect(mtexts(cad)[0]?.contents).toBe(
      "'_ZOOM\\P%%d45\\Pa\\b{c}\\P\\P\\PA B C"
    )
  })

  it("adds an empty MTEXT when no line is typed, which draws nothing and survives a save and EXPLODE (text/p268)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "25,25", "")
    const empty = cad.only<MTextEntity>("mtext")
    expect(empty.contents).toBe("")
    expect(empty.position).toBeCloseToPoint(p(5, 25))
    cad.moveTo(p(500, 500))
    const glyphs = cad
      .scene()
      .primitives.flatMap((primitive) =>
        primitive.kind === "text" ? [primitive.text] : []
      )
    expect(glyphs.join("")).toBe("")

    const reloaded = parseDrawingFile(cad.runtime.serializeDrawing())
    expect(reloaded.entities).toHaveLength(1)
    expect((reloaded.entities[0] as MTextEntity).contents).toBe("")

    cad.select(empty.id).command("EXPLODE")
    expect(cad.entities().filter((e) => e.type === "text")).toEqual([])
  })

  it("lies at ELEVATION and leaves LASTPOINT there (text/p270)", () => {
    const cad = createHarness()
    answer(cad, "_ELEV", "7", "", "_-MTEXT", "5,5", "25,25", "A", "")
    expect(mtexts(cad)[0]?.elevation ?? 0).toBeCloseTo(7)
    expect(lastPoint(cad)).toBe(" X = 25.00     Y = 25.00     Z = 7.00")
  })

  it("squares up to a UCS turned 30 about Z (text/p257)", () => {
    const cad = createHarness()
    answer(cad, "UCS", "_Z", "30", "_-MTEXT", "0,0", "20,-10", "A", "")
    expect(mtexts(cad)[0]?.rotation).toBeCloseTo(Math.PI / 6)
    expect(mtexts(cad)[0]?.position).toBeCloseToPoint(p(0, 0))
    expect(lastPoint(cad)).toBe(" X = 20.00     Y = -10.00     Z = 0.00")
  })

  it("lies in a UCS turned 90 about X, normal 0,-1,0 (text/p258)", () => {
    const cad = createHarness()
    answer(cad, "UCS", "_X", "90", "_-MTEXT", "0,0", "20,-10", "A", "")
    expect(mtexts(cad)[0]?.normal?.y ?? 0).toBeCloseTo(-1)
  })

  it("answers to -T in English; TEXTOM, TXM, MTEXT, -TEXTOM and -TXM in Spanish, whose T is TEXTO (text/p259, p260, acad.pgp)", () => {
    const cad = createHarness()
    answer(cad, "-T")
    expect(cad.state().commandLine.prompt).toBe("-MTEXT Specify first corner:")
    cad.escape()

    for (const name of ["TEXTOM", "TXM", "MTEXT"]) {
      const spanish = createHarness({ locale: es })
      answer(spanish, name)
      expect(spanish.activeToolId(), name).toBe("mtext")
      expect(spanish.state().commandLine.prompt).toBe(
        "TEXTOM Precise la primera esquina:"
      )
      spanish.escape()
    }
    for (const name of ["-TEXTOM", "-TXM"]) {
      const spanish = createHarness({ locale: es })
      answer(spanish, name, "5,5", "25,25")
      expect(spanish.state().commandLine.prompt, name).toBe("-TEXTOM textoM:")
      spanish.escape()
    }
    const t = createHarness({ locale: es })
    answer(t, "T")
    expect(t.activeToolId()).toBe("text")
    t.escape()
    const mt = createHarness({ locale: es })
    answer(mt, "MT")
    expect(mt.activeToolId()).toBe("select")
  })

  it("labels each box with its own prompt (acmtedRes 1070)", () => {
    const cad = createHarness({ locale: es })
    const label = () => cad.state().dynamicInput?.fields[0]?.label
    cad.command("TEXTOM").click(p(0, 0)).option("Height")
    expect(label()).toBe("Indique la altura")
    cad.escape().command("TEXTOM").click(p(0, 0)).option("Style")
    expect(label()).toBe("Indique el nombre de estilo o")
    cad.escape()
  })
})

// desktop text/d05-5: Escape in the editor with changes asks `Do you want to
// save your text changes?`; No makes nothing (d05); without changes Escape
// closes at once (d06).
describe("MTEXT's Unsaved Changes", () => {
  it("asks before discarding what was typed, and keeps the editor open", () => {
    const cad = createHarness()
    box(cad).type("KEPT")
    cad.escape()

    expect(cad.state().unsavedTextDialog).toBe(true)
    expect(cad.activeToolId()).toBe("mtext")
    expect(cad.entityCount).toBe(0)
  })

  it("Yes keeps the text, as Ctrl+Enter does", () => {
    const cad = createHarness()
    box(cad).type("KEPT").escape()
    cad.runtime.answerUnsavedText("yes")

    expect(cad.state().unsavedTextDialog).toBe(false)
    expect(cad.only<MTextEntity>("mtext").contents).toBe("KEPT")
    expect(cad.activeToolId()).toBe("select")
    cad.undo()
    expect(cad.entityCount).toBe(0)
  })

  it("No discards it and makes nothing", () => {
    const cad = createHarness()
    box(cad).type("GONE").escape()
    cad.runtime.answerUnsavedText("no")

    expect(cad.state().unsavedTextDialog).toBe(false)
    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("select")
  })

  it("Cancel goes back to the editor with the text as it was", () => {
    const cad = createHarness()
    box(cad).type("MORE").escape()
    cad.runtime.answerUnsavedText("cancel")

    expect(cad.state().unsavedTextDialog).toBe(false)
    expect(cad.activeToolId()).toBe("mtext")
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("MORE")
    cad.type("MORE\nTEXT").enter()
    expect(cad.only<MTextEntity>("mtext").contents).toBe("MORE\\PTEXT")
  })

  it("asks at TEXTEDIT on an MTEXT whose wording changed", () => {
    const edited = () => {
      const cad = createHarness({
        entities: [
          createMText(p(0, 0), "OLD", { height: 10, width: 200, id: "M1" }),
        ],
      })
      cad.command("TEXTEDIT").click(p(5, -5)).type("NEW")
      return cad.escape()
    }
    const yes = edited()
    expect(yes.state().unsavedTextDialog).toBe(true)
    yes.runtime.answerUnsavedText("yes")
    expect(yes.byId<MTextEntity>("M1").contents).toBe("NEW")
    yes.escape()

    const no = edited()
    no.runtime.answerUnsavedText("no")
    expect(no.byId<MTextEntity>("M1").contents).toBe("OLD")
    expect(no.activeToolId()).toBe("select")
  })

  it("never asks at -MTEXT's lines", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "25,25", "ONE")
    cad.type("TWO").escape()

    expect(cad.state().unsavedTextDialog).toBe(false)
    expect(cad.activeToolId()).toBe("select")
  })
})
