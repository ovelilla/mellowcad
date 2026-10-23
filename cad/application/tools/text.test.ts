import { describe, expect, it } from "vitest"
import { CadHarness, createHarness } from "../../../test/harness"
import { layerOf, lineOf, p, textOf } from "../../../test/builders"
import {
  AttributeDefinitionEntity,
  MTextEntity,
  TextEntity,
  createAttributeDefinition,
  createMText,
  textCorners,
} from "../../domain/entities"
import { DEFAULT_TEXT_HEIGHT } from "../../domain/textStyles"
import { createTextStyle } from "../../domain/textStyles"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import type { Vec2 } from "../../geometry/Vec2"

/** Arial's line below a text of height 10 (text/p122: B's Y). */
const LINE_BELOW_10 = -16.06412005457026

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

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

  // Arial's line, (ascent + descent + gap) / H = 2355/1466 of the height:
  // p122 (B at −16.06412 for h 10), desktop d01-4 (HHH 8.03206 below GGG, h 5).
  it("continues on a fresh line Arial's line below (text/p122, desktop text/d01-4)", () => {
    const cad = createHarness()
    startText(cad, p(0, 0), "10").type("ONE").enter().type("TWO").enter()
    startText(cad, p(0, 10), "5").type("GGG").enter().type("HHH").enter()

    const lines = cad.entities() as TextEntity[]
    expect(lines.map((line) => line.value)).toEqual([
      "ONE",
      "TWO",
      "GGG",
      "HHH",
    ])
    expect(lines[1].position.y).toBeCloseTo(LINE_BELOW_10, 9)
    expect(lines[3].position.y).toBeCloseTo(10 - 8.03206, 5)
  })

  it("ends the command on an empty line", () => {
    const cad = createHarness()
    startText(cad).type("ONE").enter().enter()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(1)
  })

  // Escape keeps the lines entered and drops the one being typed (desktop
  // text/d01-2: CCC kept, DDD typed then Escape is gone).
  it("drops the line being typed at Escape, keeping those entered (desktop text/d01-2)", () => {
    const cad = createHarness()
    startText(cad).type("CCC").enter().type("DDD").escape()

    expect(cad.only<TextEntity>("text").value).toBe("CCC")
    expect(cad.activeToolId()).toBe("select")
  })

  it("keeps the line being typed when another command takes over", () => {
    const cad = createHarness()
    startText(cad).type("KEEP")
    cad.command("LINE")

    expect(cad.only<TextEntity>("text").value).toBe("KEEP")
    cad.escape()
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
    // text/p122's second -TEXT, continued by Enter.
    expect(second!.position).toBeCloseToPoint(p(0, LINE_BELOW_10))
  })

  it("offers Justify and Style only at the start prompt", () => {
    const cad = createHarness()
    cad.command("TEXT")
    expect(cad.optionAbbreviations()).toEqual(["J", "S"])

    startText(cad)
    expect(cad.optionAbbreviations()).toEqual([])
    cad.escape()
  })

  // The Current line (p101, p106), Justify's list (p103), the prompts named
  // by the justification (p106).
  it("asks TEXT's questions and writes them answered (text/p101, p103, p106)", () => {
    const cad = createHarness()
    cad.command("TEXT")
    expect(cad.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  Left'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify start point of text or [Justify/Style]:"
    )
    cad.option("Justify")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:"
    )
    cad.option("TC")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify top-center point of text:"
    )
    cad.click(p(0, 0))
    expect(cad.state().commandLine.prompt).toBe("TEXT Specify height <2.50>:")
    cad.type("5").enter()
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify rotation angle of text <0>:"
    )
    cad.enter()
    expect(cad.state().commandLine.prompt).toBe("TEXT Enter text:")
    cad.type("MID").enter().escape()

    expect(cad.commandLog()).toEqual([
      "TEXT",
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  Left',
      "Specify start point of text or [Justify/Style]: J",
      "Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]: TC",
      "Specify top-center point of text:",
      "Specify height <2.50>: 5",
      "Specify rotation angle of text <0>:",
      "Enter text: MID",
      "Enter text: *Cancel*",
    ])
    expect(cad.only<TextEntity>("text").justify).toBe("tc")
  })

  it("takes a justification at its first prompt, unlisted, as AutoCAD does (text/p106)", () => {
    const cad = createHarness()
    cad.command("TEXT").option("MC")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify middle point of text:"
    )
    cad.escape().command("TEXT")
    expect(cad.commandLog().at(-1)).toBe(
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  MC'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify middle point of text or [Justify/Style]:"
    )
  })

  it("refuses a justification that is not one of the options", () => {
    const cad = createHarness()
    cad.command("TEXT").option("Justify")
    cad.runtime.setCommandLineText("nope")
    cad.runtime.submitCommandLine()

    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    expect(cad.activeToolId()).toBe("text")
  })

  // A name refused asks again with no Current line (p110, p142); `?` lists,
  // writes the Current line and asks the start point (p109; the `<*>` filter
  // and the pages are Missing).
  it("names a style it cannot find, and lists them with ? (text/p109, p110)", () => {
    const cad = createHarness()
    cad.command("TEXT").option("Style")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Enter style name or [?] <Standard>:"
    )
    cad.type("NOPE").enter()
    expect(cad.commandLog().at(-1)).toBe('Cannot find text style "NOPE".')
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Enter style name or [?] <Standard>:"
    )
    cad.type("?").enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      [
        "Text styles:",
        'Style name: "Standard"    Font typeface: Arial',
        "   Height: 0.00  Width factor: 1.00  Obliquing angle: 0",
        "   Generation: Normal",
        'Current text style: "Standard"',
      ].join("\n"),
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  Left',
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify start point of text or [Justify/Style]:"
    )
    cad.escape()
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

/** The lines `texts` add to the history, each typed and confirmed. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

function texts(cad: CadHarness): TextEntity[] {
  return cad.entities().filter((e): e is TextEntity => e.type === "text")
}

/** LASTPOINT as `ID @` reports it. */
function lastPoint(cad: CadHarness): string {
  return written(cad, "ID", "@").at(-1) ?? ""
}

const CURRENT_LEFT =
  'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  Left'
const deg = (degrees: number) => (degrees * Math.PI) / 180

// AutoCAD 2027's console, each probe's answers typed as it typed them.
describe("TEXT against AutoCAD 2027's console", () => {
  it("refuses Enter at Justify and asks again (text/p156)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "_J", "")).toEqual([
      "TEXT",
      CURRENT_LEFT,
      "Specify start point of text or [Justify/Style]: _J",
      "Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:",
      "Invalid option keyword.",
    ])
    cad.press("Enter")
    expect(cad.commandLog().at(-1)).toBe("Invalid option keyword.")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Enter an option [Left/Center/Right/Middle/TL/TC/TR/ML/MC/MR/BL/BC/BR]:"
    )
    answer(cad, "_L")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify start point of text:"
    )
    cad.escape()
  })

  it("refuses Enter at the start point with nothing to continue (text/p120)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "").slice(-2)).toEqual([
      "Specify start point of text or [Justify/Style]:",
      "Point or option keyword required.",
    ])
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe("Point or option keyword required.")
    expect(cad.activeToolId()).toBe("text")
    cad.escape()
  })

  it("forgets the line to continue at NEW and OPEN (text/p125)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "0,0", "10", "0", "A", "")
    const file = cad.runtime.serializeDrawing()
    cad.runtime.newDrawing()
    expect(written(cad, "TEXT", "").at(-1)).toBe(
      "Point or option keyword required."
    )
    cad.escape()

    answer(cad, "TEXT", "0,0", "10", "0", "B", "")
    cad.runtime.loadDrawing(file)
    expect(written(cad, "TEXT", "").at(-1)).toBe(
      "Point or option keyword required."
    )
    cad.escape()
  })

  it("continues below the last line still in the drawing (text/p128)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "0,0", "10", "0", "A", "")
    answer(cad, "TEXT", "0,50", "5", "0", "B", "")
    answer(cad, "U")
    answer(cad, "TEXT", "", "C", "")

    const c = texts(cad).find((t) => t.value === "C")!
    expect(c.position).toBeCloseToPoint(p(0, LINE_BELOW_10))
    expect(c.height).toBeCloseTo(10)
  })

  it("does not continue below a line that was erased (TEXT-D3)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "0,0", "10", "0", "A", "")
    answer(cad, "ERASE", "_L", "")
    expect(written(cad, "TEXT", "").at(-1)).toBe(
      "Point or option keyword required."
    )
    cad.escape()
  })

  it("writes the Current line again after a style is named or kept (text/p110, p156)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "_S", "Standard")).toEqual([
      "TEXT",
      CURRENT_LEFT,
      "Specify start point of text or [Justify/Style]: _S",
      "Enter style name or [?] <Standard>: Standard",
      CURRENT_LEFT,
    ])
    expect(written(cad, "_S", "")).toEqual([
      "Specify start point of text or [Justify/Style]: _S",
      "Enter style name or [?] <Standard>:",
      CURRENT_LEFT,
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify start point of text or [Justify/Style]:"
    )
    cad.escape()
  })

  it("names the old style with the new one's height, as the console does (text/p162, p126)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    cad.runtime.document.addTextStyle(createTextStyle("BIG", 7))
    expect(written(cad, "TEXT", "_S", "S2").at(-1)).toBe(CURRENT_LEFT)
    expect(written(cad, "_S", "BIG").at(-1)).toBe(
      'Current text style:  "S2"  Text height:  7.00  Annotative:  No  Justify:  Left'
    )
    answer(cad, "5,5")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify rotation angle of text <0>:"
    )
    cad.escape()
  })

  it("does not write it after a name it cannot find (text/p142)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "_S", "'_ZOOM", "").slice(-3)).toEqual([
      'Cannot find text style "\'_ZOOM".',
      "Enter style name or [?] <Standard>:",
      CURRENT_LEFT,
    ])
    cad.escape()
  })

  it("shows a fixed-height style's height in the Current line (text/p121)", () => {
    const cad = createHarness()
    cad.runtime.document.addTextStyle(createTextStyle("BIG", 7))
    cad.runtime.document.setCurrentTextStyle("BIG")
    expect(written(cad, "TEXT")[1]).toBe(
      'Current text style:  "BIG"  Text height:  7.00  Annotative:  No  Justify:  Left'
    )
    cad.escape()
  })

  for (const [value, probe] of [
    ["0", "p111"],
    ["-3", "p112"],
  ]) {
    it(`refuses a height of ${value} (text/${probe})`, () => {
      const cad = createHarness()
      expect(written(cad, "TEXT", "5,5", value).slice(-2)).toEqual([
        `Specify height <2.50>: ${value}`,
        "Value must be positive and nonzero.",
      ])
      expect(cad.state().commandLine.prompt).toBe("TEXT Specify height <2.50>:")
      cad.escape()
    })
  }

  it("refuses FOO at the height and at the rotation (text/p113, p116)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "5,5", "FOO").at(-1)).toBe(
      "Requires numeric distance or second point."
    )
    expect(written(cad, "", "FOO").at(-1)).toBe(
      "Requires valid numeric angle or second point."
    )
    cad.escape()
  })

  it("refuses FOO and _U at the start point (text/p102, p157)", () => {
    const cad = createHarness()
    expect(written(cad, "TEXT", "FOO", "_U").slice(-4)).toEqual([
      "Specify start point of text or [Justify/Style]: FOO",
      "Point or option keyword required.",
      "Specify start point of text or [Justify/Style]: _U",
      "Point or option keyword required.",
    ])
    expect(cad.activeToolId()).toBe("text")
    cad.escape()
  })

  it("stores a negative rotation normalised and offers it next (text/p115)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "5,5", "", "-30", "A", "")
    expect(texts(cad)[0].rotation).toBeCloseTo(deg(330))
    answer(cad, "TEXT", "5,15", "")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify rotation angle of text <330>:"
    )
    cad.escape()
  })

  it("U takes back TEXTSIZE, the justification and the rotation (text/p127)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "_J", "_MC", "5,5", "3", "15", "A", "")
    expect(written(cad, "U")).toEqual(["U", "TEXT"])
    expect(written(cad, "TEXT", "0,0")[1]).toBe(CURRENT_LEFT)
    expect(cad.state().commandLine.prompt).toBe("TEXT Specify height <2.50>:")
    answer(cad, "")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify rotation angle of text <0>:"
    )
    cad.escape()
  })

  it("U takes back the style its Style made current (text/p162)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    answer(cad, "TEXT", "_S", "S2", "5,5", "", "", "A", "")
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("S2")
    answer(cad, "U")
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("Standard")
  })

  it("an empty run keeps the justification, not TEXTSIZE nor the rotation (text/p163, desktop text/d01)", () => {
    for (const end of ["enter", "escape"] as const) {
      const cad = createHarness()
      answer(cad, "TEXT", "_J", "_MC", "5,5", "7", "20")
      if (end === "enter") answer(cad, "")
      else cad.escape()
      expect(cad.entityCount).toBe(0)
      expect(written(cad, "TEXT", "0,0")[1]).toBe(
        'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  MC'
      )
      expect(cad.state().commandLine.prompt).toBe("TEXT Specify height <2.50>:")
      answer(cad, "")
      expect(cad.state().commandLine.prompt).toBe(
        "TEXT Specify rotation angle of text <0>:"
      )
      cad.escape()
    }
  })

  it("wears the properties current at its start point (text/p165)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "5,5", "'-COLOR", "1", "", "", "A", "")
    expect(texts(cad)[0].color).toBeUndefined()
    expect(cad.runtime.document.getSettings().currentColor).not.toBe("ByLayer")
  })

  it("wears the current layer, colour and lineweight, at ELEVATION, no THICKNESS (text/p130)", () => {
    const cad = createHarness()
    const layer = cad.runtime.newLayer()
    cad.runtime.setCurrentLayer(layer)
    answer(cad, "-COLOR", "1")
    answer(cad, "-LWEIGHT", "0.30")
    answer(cad, "ELEV", "5", "2")
    answer(cad, "TEXT", "5,5", "", "", "A", "")
    const text = texts(cad)[0]
    expect(text.layerId).toBe(layer)
    expect(text.color).toBeDefined()
    expect(text.lineweight).toBe(0.3)
    expect(text.elevation).toBeCloseTo(5)
    expect("thickness" in text).toBe(false)
    expect(lastPoint(cad)).toMatch(/Z = 5\.00/)
  })

  it("keeps LASTPOINT on the start point when height and rotation are points (text/p135)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "0,0", "0,7", "10,10", "A", "")
    expect(texts(cad)[0].height).toBeCloseTo(7)
    expect(texts(cad)[0].rotation).toBeCloseTo(Math.PI / 4)
    expect(lastPoint(cad)).toMatch(/X = 0\.00\s+Y = 0\.00/)

    answer(cad, "TEXT", "20,0", "@0,4", "@1,1", "B", "")
    expect(texts(cad)[1].height).toBeCloseTo(4)
    expect(texts(cad)[1].rotation).toBeCloseTo(Math.PI / 4)
  })

  it("takes the start point in each form typed (text/p158)", () => {
    const cad = createHarness()
    answer(cad, "ID", "1,1")
    answer(cad, "TEXT", "@3,4", "", "", "A", "")
    answer(cad, "TEXT", "10<30", "", "", "B", "")
    answer(cad, "TEXT", "@5<90", "", "", "C", "")
    answer(cad, "TEXT", "5,5,7", "", "", "D", "")
    const [a, b, c, d] = texts(cad)
    expect(a.position).toBeCloseToPoint(p(4, 5))
    expect(b.position).toBeCloseToPoint(p(8.660254037844387, 5))
    expect(c.position).toBeCloseToPoint(p(8.660254037844387, 10))
    expect(d.elevation).toBeCloseTo(7)

    answer(cad, "UCS", "_Z", "30")
    answer(cad, "TEXT", "*10,0", "", "", "E", "")
    answer(cad, "TEXT", "@", "", "", "G", "")
    const [, , , , e, g] = texts(cad)
    expect(e.position).toBeCloseToPoint(p(10, 0))
    expect(e.rotation).toBeCloseTo(deg(30))
    expect(g.position).toBeCloseToPoint(p(10, 0))
  })

  it("snaps at the start point, the height and the rotation (text/p136)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "100,0", "")
    answer(cad, "TEXT", "_MID", "50,1", "_END", "99,1", "_END", "1,1", "A", "")
    const text = texts(cad)[0]
    expect(text.position).toBeCloseToPoint(p(50, 0))
    expect(text.height).toBeCloseTo(50)
    expect(text.rotation).toBeCloseTo(Math.PI)
  })

  it("reads the rotation from the UCS X axis and offers it so (text/p131, p164)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "0,0", "", "20", "A", "")
    answer(cad, "UCS", "_Z", "30")
    answer(cad, "TEXT", "10,10", "")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXT Specify rotation angle of text <20>:"
    )
    answer(cad, "", "B", "")
    answer(cad, "TEXT", "20,20", "", "10", "C", "")
    const [, b, c] = texts(cad)
    expect(b.rotation).toBeCloseTo(deg(50))
    expect(c.rotation).toBeCloseTo(deg(40))
  })

  it("keeps leading spaces typed at the command line (text/p155)", () => {
    const cad = createHarness()
    answer(cad, "TEXT", "5,5", "", "", "HELLO WORLD", "")
    answer(cad, "TEXT", "5,15", "", "", "  LEAD", "")
    expect(texts(cad).map((t) => t.value)).toEqual(["HELLO WORLD", "  LEAD"])
  })

  it("draws the height and rotation bands dashed (desktop text/d01-5, d01-6)", () => {
    const cad = createHarness()
    const band = (to: Vec2) => [
      expect.objectContaining({
        a: expect.objectContaining(cad.toScreen(p(0, 0))),
        b: expect.objectContaining(cad.toScreen(to)),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      }),
    ]
    const bands = () =>
      cad
        .scene()
        .primitives.filter(
          (q) =>
            q.kind === "segment" &&
            (q.stroke.color === THEME.rubberBand ||
              q.stroke.color === THEME.dashedRubberBand)
        )
    cad.command("TEXT").click(p(0, 0)).moveTo(p(0, 30))
    expect(bands()).toEqual(band(p(0, 30)))
    cad.enter().moveTo(p(30, 30))
    expect(bands()).toEqual(band(p(30, 30)))
    cad.escape()
  })

  it("names the justification in the Current line with AutoCAD's words (text/p106)", () => {
    const en = createHarness()
    answer(en, "TEXT", "_J", "_TL", "5,5", "", "", "A", "")
    expect(written(en, "TEXT")[1]).toBe(
      'Current text style:  "Standard"  Text height:  2.50  Annotative:  No  Justify:  TL'
    )
    en.escape()

    const spanish = createHarness({ locale: es })
    answer(spanish, "TEXTO", "_J", "_TL", "5,5", "", "", "A", "")
    expect(written(spanish, "TEXTO")[1]).toBe(
      'Estilo de texto actual:  "Standard"  Altura de texto:  2.50  Anotativo:  No  Justificar:  SI'
    )
    answer(spanish, "_J", "_BR")
    spanish.escape()
    expect(written(spanish, "TEXTO")[1]).toMatch(/Justificar: {2}ID$/)
    spanish.escape()
  })

  it("runs as TEXTODIN in Spanish (text/p150)", () => {
    const cad = createHarness({ locale: es })
    expect(written(cad, "TEXTODIN")[1]).toBe(
      'Estilo de texto actual:  "Standard"  Altura de texto:  2.50  Anotativo:  No  Justificar:  Izquierda'
    )
    expect(cad.activeToolId()).toBe("text")
    cad.escape()
  })
})

// -TEXT is TEXT asking one line at the command line (TEXT-D2).
describe("-TEXT", () => {
  it("asks TEXT's questions and one line, then ends (text/p101)", () => {
    const cad = createHarness()
    expect(written(cad, "-TEXT", "5,5", "", "", "HELLO")).toEqual([
      "-TEXT",
      CURRENT_LEFT,
      "Specify start point of text or [Justify/Style]: 5,5",
      "Specify height <2.50>:",
      "Specify rotation angle of text <0>:",
      "Enter text: HELLO",
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(texts(cad).map((t) => t.value)).toEqual(["HELLO"])
    expect(lastPoint(cad)).toMatch(/X = 5\.00\s+Y = 5\.00/)
  })

  it("adds nothing for an empty line (text/p118)", () => {
    const cad = createHarness()
    answer(cad, "-TEXT", "5,5", "", "", "")
    expect(cad.entityCount).toBe(0)
    expect(cad.activeToolId()).toBe("select")
  })

  it("is named -TEXT by U, UNDO and REDO (text/p127, p129)", () => {
    const cad = createHarness()
    answer(cad, "-TEXT", "0,0", "", "", "A")
    answer(cad, "-TEXT", "0,10", "", "", "B")
    expect(written(cad, "UNDO", "2").at(-1)).toBe("-TEXT -TEXT")
    expect(cad.entityCount).toBe(0)
    expect(written(cad, "REDO").slice(1)).toEqual([
      "-TEXT -TEXT",
      "Everything has been redone",
    ])
    expect(written(cad, "U")).toEqual(["U", "-TEXT"])
    expect(cad.entityCount).toBe(1)
  })

  it("continues below the last line at Enter, then ends (text/p128)", () => {
    const cad = createHarness()
    answer(cad, "-TEXT", "0,0", "10", "0", "A")
    answer(cad, "-TEXT", "", "C")
    expect(texts(cad)[1].position).toBeCloseToPoint(p(0, LINE_BELOW_10))
    expect(cad.activeToolId()).toBe("select")
  })

  it("runs as -TEXTO in Spanish, repeated by Enter (text/p148)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "-TEXTO", "0,0", "", "", "A")
    expect(written(cad, "")[0]).toBe("-TEXTO")
    answer(cad, "0,10", "", "", "B")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.entityCount).toBe(2)
  })
})

// TEXT, MTEXT and ATTDEF share TEXTSIZE and TEXTSTYLE: after `-TEXT _S S2 …
// 3`, -MTEXT lists `"S2"  Text height:  3`, its zeros dropped (text/p272),
// and -ATTDEF `"S2"  Text height:  3.0000` (rectang/p313); MTEXT's Height 4
// makes TEXTSIZE 4 (p312).
describe("TEXTSIZE and TEXTSTYLE, shared by TEXT, MTEXT and ATTDEF", () => {
  /** What -ATTDEF writes once its tag, prompt and value are given. */
  function attdefStyle(cad: CadHarness): string | undefined {
    const from = cad.commandLog().length
    answer(cad, "_-ATTDEF", "", "T1", "P1", "V1")
    const line = cad
      .commandLog()
      .slice(from)
      .find((text) => text.startsWith("Current text style:"))
    cad.escape()
    return line
  }

  function mtextStyle(cad: CadHarness): string | undefined {
    const from = cad.commandLog().length
    answer(cad, "_-MTEXT")
    const line = cad.commandLog()[from + 1]
    cad.escape()
    return line
  }

  it("TEXT's height is the one MTEXT and ATTDEF offer (rectang/p313)", () => {
    const cad = createHarness()
    answer(cad, "_TEXT", "5,5", "3", "0", "A", "")

    expect(mtextStyle(cad)).toBe(
      'Current text style:  "Standard"  Text height:  3  Annotative:  No'
    )
    expect(attdefStyle(cad)).toBe(
      'Current text style:  "Standard"  Text height:  3.00  Justify:  Left'
    )
  })

  it("MTEXT's Height is the one TEXT offers next (rectang/p312)", () => {
    const cad = createHarness()
    answer(cad, "_-MTEXT", "5,5", "_H", "4", "25,25", "A", "")
    answer(cad, "_TEXT", "5,5")

    expect(cad.state().commandLine.prompt).toBe("TEXT Specify height <4.00>:")
    cad.escape()
  })

  it("TEXT's Style makes the style current, which MTEXT and ATTDEF list (rectang/p313)", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    answer(cad, "_TEXT", "_S", "S2", "5,5", "3", "0", "A", "")

    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("S2")
    expect(mtextStyle(cad)).toBe(
      'Current text style:  "S2"  Text height:  3  Annotative:  No'
    )
    expect(attdefStyle(cad)).toBe(
      'Current text style:  "S2"  Text height:  3.00  Justify:  Left'
    )
  })

  it("MTEXT's and ATTDEF's Style make the style current too", () => {
    const cad = createHarness()
    cad.runtime.createTextStyle("S2", undefined, false)
    cad.runtime.createTextStyle("S3", undefined, false)
    answer(cad, "_-MTEXT", "5,5", "_S", "S2")
    cad.escape()
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("S2")

    answer(cad, "_-ATTDEF", "", "T1", "P1", "V1", "_S", "S3")
    cad.escape()
    expect(cad.runtime.document.getCurrentTextStyleId()).toBe("S3")
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

  it("discards a single-line edit at Escape and asks again; a second Escape ends (desktop text/d06-5, d06-6)", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("XY").escape()

    expect(edited(cad).value).toBe("OLD")
    expect(cad.activeToolId()).toBe("textedit")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Select an annotation object or [Undo/Mode]:"
    )
    cad.escape()
    expect(cad.activeToolId()).toBe("select")
    expect(edited(cad).value).toBe("OLD")
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
    expect(cad.optionAbbreviations()).toEqual(["S", "M"])
    cad.option("Single")
    expect(cad.optionAbbreviations()).toEqual(["M"])

    cad.click(p(20, 5)).type("ONCE").enter()
    expect(edited(cad).value).toBe("ONCE")
    expect(cad.activeToolId()).toBe("select")
  })

  it("offers Undo in Multiple mode, and backs out its own edits only", () => {
    const cad = withText()
    cad.command("TEXTEDIT")
    expect(cad.optionAbbreviations()).toEqual(["U", "M"])
    cad.option("Undo")
    expect(cad.commandLog().at(-1)).toBe("Command has been completely undone.")

    cad.click(p(20, 5)).type("CHANGED").enter()
    cad.option("Undo")
    expect(edited(cad).value).toBe("OLD")
    cad.escape()
  })

  it("asks and refuses as AutoCAD 2027's console, in each mode (text/p241, p274)", () => {
    const cad = createHarness({
      entities: [textOf(p(0, 0), "OLD", { height: 10, id: "T1" })],
    })
    cad.command("TEXTEDIT")
    answer(cad, "FOO", "M", "FOO", "")
    answer(cad, "M", "S", "FOO", "M")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Enter a text edit mode option [Single/Multiple] <Single>:"
    )
    answer(cad, "")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Select an annotation object or [Mode]:"
    )
    answer(cad, "L")
    cad.type("LAST").enter()

    expect(edited(cad).value).toBe("LAST")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.commandLog()).toEqual([
      "TEXTEDIT",
      "Current settings: Edit mode = Multiple",
      "Select an annotation object or [Undo/Mode]: FOO",
      "*Invalid selection*",
      "Expects a point or Last/Undo",
      "Select an annotation object or [Undo/Mode]: M",
      "Enter a text edit mode option [Single/Multiple] <Multiple>: FOO",
      "Invalid option keyword.",
      "Enter a text edit mode option [Single/Multiple] <Multiple>:",
      "Select an annotation object or [Undo/Mode]: M",
      "Enter a text edit mode option [Single/Multiple] <Multiple>: S",
      "Current settings: Edit mode = Single",
      "Select an annotation object or [Mode]: FOO",
      "*Invalid selection*",
      "Expects a point or Last/Mode]:",
      "Select an annotation object or [Mode]: M",
      "Enter a text edit mode option [Single/Multiple] <Single>:",
      "Select an annotation object or [Mode]: L",
    ])
  })

  it("asks and refuses in Autodesk's Spanish (text/p241, p274, p248)", () => {
    const cad = createHarness({
      locale: es,
      entities: [textOf(p(0, 0), "OLD", { height: 10 })],
    })
    cad.command("EDITARTEXTO")
    answer(cad, "H", "FOO", "M")
    expect(cad.state().commandLine.prompt).toBe(
      "EDITARTEXTO Indique una opción de modo de edición de texto [Simple/Múltiple] <Múltiple>:"
    )
    answer(cad, "S", "FOO")
    expect(cad.commandLog()).toEqual([
      "EDITARTEXTO",
      "Parámetros actuales: Editar modo = Múltiple",
      "Designe un objeto de anotación o [desHacer/Modo]: H",
      "Todos los efectos del comando han sido deshechos.",
      "Designe un objeto de anotación o [desHacer/Modo]: FOO",
      "*Designación no válida*",
      "Requiere un punto o úLTimo/desHacer",
      "Designe un objeto de anotación o [desHacer/Modo]: M",
      "Indique una opción de modo de edición de texto [Simple/Múltiple] <Múltiple>: S",
      "Parámetros actuales: Editar modo = Simple",
      "Designe un objeto de anotación o [Modo]: FOO",
      "*Designación no válida*",
      "Requiere un punto o úLTimo/Modo]:",
    ])
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
    cad.command("TEXTEDIT").click(p(20, 5)).type("NEW").enter().escape()

    expect(edited(cad).id).toBe("T1")
    expect(edited(cad).color).toBe("#ff0000")
  })

  it("undoes one edit per step", () => {
    const cad = withText()
    cad.command("TEXTEDIT").click(p(20, 5)).type("NEW").enter().escape()

    cad.undo()
    expect(edited(cad).value).toBe("OLD")
  })

  it("starts from a double-click on the text as `_textedit`, and goes on (desktop text/d06, DoubleClickRoot.cui)", () => {
    const cad = withText()
    cad.doubleClick(p(20, 5))

    expect(cad.activeToolId()).toBe("textedit")
    expect(cad.state().dynamicInput?.fields[0].value).toBe("OLD")
    expect(cad.commandLog()).toEqual([
      "_textedit",
      "Current settings: Edit mode = Multiple",
    ])

    cad.type("BY DOUBLE CLICK").enter()
    expect(edited(cad).value).toBe("BY DOUBLE CLICK")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Select an annotation object or [Undo/Mode]:"
    )
    cad.escape()
    answer(cad, "U")
    expect(edited(cad).value).toBe("OLD")
    expect(cad.commandLog().at(-1)).toBe("TEXTEDIT")
  })

  it("ignores a double-click on anything else", () => {
    const cad = withText()
    cad.doubleClick(p(-150, -200))

    expect(cad.activeToolId()).toBe("select")
  })
})

describe("TEXTEDIT against AutoCAD 2027's console", () => {
  const OLD = () => textOf(p(0, 0), "OLD", { height: 10, id: "T1" })
  const value = (cad: CadHarness) => cad.byId<TextEntity>("T1").value
  /** The text on layer L1, locked, as p244's -LAYER LOck left it. */
  const locked = () => {
    const cad = createHarness()
    cad.runtime.document.load([{ ...OLD(), layerId: "L1" }], {
      layers: [layerOf("0"), layerOf("L1", { locked: true })],
    })
    return cad
  }

  it("refuses Last on a locked layer and asks again (text/p244)", () => {
    const cad = locked()
    answer(cad, "TEXTEDIT", "L")

    expect(cad.commandLog().slice(-2)).toEqual([
      "Select an annotation object or [Undo/Mode]: L",
      "The object is on a locked layer.",
    ])
    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    expect(cad.activeToolId()).toBe("textedit")
    cad.escape()
    expect(value(cad)).toBe("OLD")
  })

  it("refuses a pick on a locked layer in the same words (text/p244, TEXT-D31)", () => {
    const cad = locked()
    cad.command("TEXTEDIT").click(p(5, 5))

    expect(cad.commandLog().at(-1)).toBe("The object is on a locked layer.")
    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    cad.escape()
  })

  it("says it in Spanish (text/p244)", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.document.load([{ ...OLD(), layerId: "L1" }], {
      layers: [layerOf("0"), layerOf("L1", { locked: true })],
    })
    answer(cad, "EDITARTEXTO", "LT")

    expect(cad.commandLog().at(-1)).toBe(
      "El objeto está en una capa bloqueada."
    )
    cad.escape()
  })

  it("asks again in silence at Last with nothing, Last on a line and a typed point on a line or on nothing (text/p242, p243)", () => {
    const empty = createHarness()
    answer(empty, "TEXTEDIT", "L")
    expect(empty.commandLog().at(-1)).toBe(
      "Select an annotation object or [Undo/Mode]: L"
    )
    empty.escape()

    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })],
    })
    answer(cad, "TEXTEDIT", "L", "5,0", "100,100")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Select an annotation object or [Undo/Mode]: L",
      "Select an annotation object or [Undo/Mode]: 5,0",
      "Select an annotation object or [Undo/Mode]: 100,100",
    ])
    expect(cad.activeToolId()).toBe("textedit")
    cad.escape()
  })

  it("opens the text a typed point finds", () => {
    const cad = createHarness({ entities: [OLD()] })
    answer(cad, "TEXTEDIT", "5,5")

    expect(cad.state().dynamicInput?.fields[0].value).toBe("OLD")
    cad.escape().escape()
  })

  it("says the command is completely undone when Undo takes back its last edit (text/p285, p284)", () => {
    const cad = createHarness({ entities: [OLD()] })
    cad.command("TEXTEDIT").click(p(5, 5)).type("TWO").enter()
    cad.click(p(5, 5)).type("THREE").enter()
    const before = cad.commandLog().length
    answer(cad, "U")
    expect(value(cad)).toBe("TWO")
    expect(cad.commandLog().slice(before)).toEqual([
      "Select an annotation object or [Undo/Mode]: U",
    ])

    answer(cad, "U")
    expect(value(cad)).toBe("OLD")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Select an annotation object or [Undo/Mode]: U",
      "Command has been completely undone.",
    ])
    cad.escape()
  })

  it("U after the run names TEXTEDIT and puts the mode back (text/p249)", () => {
    const cad = createHarness()
    answer(cad, "TEXTEDIT", "")
    answer(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("TEXTEDIT")

    answer(cad, "TEXTEDIT", "M", "S", "")
    answer(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("TEXTEDIT")
    answer(cad, "TEXTEDIT")
    expect(cad.commandLog().at(-1)).toBe(
      "Current settings: Edit mode = Multiple"
    )
    cad.escape()
  })

  it("keeps the mode across a new drawing, a profile's setting (text/p246)", () => {
    const cad = createHarness()
    answer(cad, "TEXTEDIT", "M", "S", "")
    cad.runtime.newDrawing()
    answer(cad, "TEXTEDIT")

    expect(cad.commandLog().at(-1)).toBe("Current settings: Edit mode = Single")
    cad.escape()
  })

  it("U names it EDITARTEXTO in Spanish (text/p249, p282)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "EDITARTEXTO", "M", "S", "")
    answer(cad, "H")

    expect(cad.commandLog().at(-1)).toBe("EDITARTEXTO")
  })

  it.each(["TEXTEDIT", "ED", "DDEDIT", "TEDIT"])(
    "runs as %s (text/p247, acad.pgp)",
    (name) => {
      const cad = createHarness()
      answer(cad, name)

      expect(cad.activeToolId()).toBe("textedit")
      expect(cad.commandLog().at(-1)).toBe(
        "Current settings: Edit mode = Multiple"
      )
      cad.escape()
    }
  )

  it.each(["EDITARTEXTO", "ED", "DDEDIC", "TEDIT"])(
    "runs as %s in Spanish (text/p248, acad.pgp)",
    (name) => {
      const cad = createHarness({ locale: es })
      answer(cad, name)

      expect(cad.activeToolId()).toBe("textedit")
      cad.escape()
    }
  )

  it("opens the one text preselected at once, after the settings line (text/p159)", () => {
    const cad = createHarness({ entities: [OLD()] })
    cad.select("T1")
    answer(cad, "TEXTEDIT")

    expect(cad.commandLog()).toEqual([
      "TEXTEDIT",
      "Current settings: Edit mode = Multiple",
    ])
    expect(cad.state().dynamicInput?.fields[0].value).toBe("OLD")
    cad.type("NEW").enter()
    expect(value(cad)).toBe("NEW")
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Select an annotation object or [Undo/Mode]:"
    )
    cad.escape()
  })

  it("opens a preselected MTEXT or attribute definition too", () => {
    const cad = createHarness({
      entities: [
        createMText(p(0, 0), "MT", { height: 10, id: "M1" }),
        createAttributeDefinition(p(0, 100), "TAG", { value: "V", id: "A1" }),
      ],
    })
    cad.select("M1")
    answer(cad, "TEXTEDIT")
    expect(cad.state().dynamicInput?.fields[0].value).toBe("MT")
    cad.type("NEW").enter()
    expect(cad.byId<MTextEntity>("M1").contents).toBe("NEW")
    cad.escape()

    cad.select("A1")
    answer(cad, "TEXTEDIT")
    expect(cad.state().dynamicInput?.fields[0].value).toBe("TAG")
    cad.escape()
    expect(cad.byId<AttributeDefinitionEntity>("A1").tag).toBe("TAG")
  })

  it("ignores a preselected set holding other objects and asks (text/p146)", () => {
    const cad = createHarness({
      entities: [OLD(), lineOf(p(0, 50), p(100, 50), { id: "L1" })],
    })
    cad.select("T1", "L1")
    answer(cad, "TEXTEDIT")

    expect(cad.state().dynamicInput?.fields ?? []).toHaveLength(0)
    expect(cad.state().commandLine.prompt).toBe(
      "TEXTEDIT Select an annotation object or [Undo/Mode]:"
    )
    cad.escape()
  })
})

describe("text geometry", () => {
  // probe text/p301, p302: the box is the ink's where the justification sets
  // the glyphs: a Left HHH's starts at H's bearing, a Right one's ends at the
  // last H's ink, short of the point by its bearing.
  it("hangs its ink box off the justification point (text/p301, p302)", () => {
    const left = textOf(p(0, 0), "HHH", { height: 10, justify: "left" })
    const right = textOf(p(0, 0), "HHH", { height: 10, justify: "right" })

    expect(Math.min(...textCorners(left).map((c) => c.x))).toBeCloseTo(
      1.11869,
      4
    )
    expect(Math.max(...textCorners(right).map((c) => c.x))).toBeCloseTo(
      -(10.0887 - 8.96317),
      3
    )
  })

  it("is picked anywhere on the lettering, not just on its edge", () => {
    const cad = createHarness({
      entities: [textOf(p(0, 0), "WIDE TEXT", { height: 10, id: "T1" })],
    })
    // Well inside the box, far from every edge.
    cad.click(p(20, 5))

    expect(cad.selectedIds()).toEqual(["T1"])
  })

  // probe text/p302: a BL text's capitals stand 0.29604 of the height above
  // its point, so its box runs from 29.6 to 129.6 at 100 (TXO-01).
  it("is picked where a Bottom text's glyphs stand, not below them (text/p302)", () => {
    const bl = () =>
      textOf(p(0, 0), "HHH", { height: 100, justify: "bl", id: "T" })
    const top = createHarness({ entities: [bl()] })
    top.click(p(50, 120))
    expect(top.selectedIds()).toEqual(["T"])

    const below = createHarness({ entities: [bl()] })
    below.click(p(50, 10))
    expect(below.selectedIds()).toEqual([])
  })

  // probe text/p305: Insertion on a Right text takes its alignment point
  // (DXF 11), 100,0, not the baseline's start.
  it("snaps Insertion to a justified text's justification point (text/p305)", () => {
    const cad = createHarness({
      entities: [
        textOf(p(100, 0), "Hola", { height: 5, justify: "right", id: "T" }),
      ],
    })
    answer(cad, "_LINE", "_INS", "92,2", "@0,20", "")

    const line = cad.entities().find((e) => e.type === "line")
    expect(line?.type === "line" && line.start).toBeCloseToPoint(p(100, 0))
  })
})
