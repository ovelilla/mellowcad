import { describe, expect, it } from "vitest"
import type {
  AttributeDefinitionEntity,
  CircleEntity,
  LineEntity,
  MTextEntity,
  TextEntity,
} from "../domain/entities"
import { createHarness } from "../../test/harness"

describe("a line keyed in at the command window", () => {
  it("holds a command and its answers, a space ending each", () => {
    const cad = createHarness()
    const keyed = cad.keyIn("CIRCLE 50,25 10")
    expect(keyed.refused).toBeNull()
    expect(keyed.lines.at(-1)).toBe(
      "Specify radius of circle or [Diameter]: 10"
    )
    expect(cad.only<CircleEntity>("circle")).toMatchObject({
      center: { x: 50, y: 25 },
      radius: 10,
    })
  })

  it("keeps the spaces of a text, as a script file's line does", () => {
    // text/p155: `HELLO WORLD` at `Enter text:` is one text.
    const cad = createHarness()
    cad.keyIn("TEXT 0,0 5 0")
    expect(cad.keyIn("Hello big world").refused).toBeNull()
    cad.keyIn("")
    expect(cad.only<TextEntity>("text").value).toBe("Hello big world")
    expect(cad.activeToolId()).toBe("select")
  })

  it("keeps the spaces of every text a prompt asks, not of a name", () => {
    const cad = createHarness()
    cad.keyIn("-MTEXT 0,0 100,-50")
    expect(cad.keyIn("Hello big world").refused).toBeNull()
    cad.keyIn("")
    expect(cad.only<MTextEntity>("mtext").contents).toBe("Hello big world")

    // ATTDEF's tag ends at a space (blocks/p313); its prompt is a text.
    cad.keyIn("ATTDEF")
    expect(cad.keyIn(" PART Part number").refused).toBeNull()
    expect(cad.keyIn("A 100").refused).toBeNull()
    cad.keyIn("0,0 5 0")
    expect(cad.only<AttributeDefinitionEntity>("attdef")).toMatchObject({
      tag: "PART",
      prompt: "Part number",
      value: "A 100",
    })
  })

  it("takes an answer the command writes a notice for", () => {
    const cad = createHarness()
    expect(cad.keyIn("LINE 0,0 U 5,5 10,10 ").refused).toBeNull()
    expect(cad.only<LineEntity>("line")).toMatchObject({
      start: { x: 5, y: 5 },
      end: { x: 10, y: 10 },
    })
  })

  it("presses Enter for every space, and repeats the last command at Command:", () => {
    const cad = createHarness()
    cad.keyIn("LINE 0,0 10,0 ")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.typeCounts()).toEqual({ line: 1 })
    cad.keyIn("")
    expect(cad.activeToolId()).toBe("line")
  })

  it("stops at the first answer refused, the prompt asking again", () => {
    const cad = createHarness()
    expect(cad.keyIn("LINE 0,0 foo 10,10").refused).toEqual({
      answer: "foo",
      message: "Point or option keyword required.",
      untyped: "10,10",
    })
    expect(cad.entityCount).toBe(0)
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
  })

  it("stops at a name the command does not find", () => {
    const cad = createHarness()
    expect(cad.keyIn("-LINETYPE S NOSUCH").refused).toMatchObject({
      answer: "NOSUCH",
      untyped: "",
    })
  })

  it("stops at a command Command: does not know", () => {
    const cad = createHarness()
    const keyed = cad.keyIn("CHAIR 0,0")
    expect(keyed.refused).toMatchObject({ answer: "CHAIR", untyped: "0,0" })
    expect(keyed.refused?.message).toMatch(/^Unknown command "CHAIR"/)
    expect(keyed.lines).toEqual([keyed.refused?.message])
  })

  it("takes one line at a time", () => {
    const cad = createHarness()
    expect(() => cad.keyIn("LINE\n0,0")).toThrow(/one line/)
  })
})

describe("zoomToFit", () => {
  it("frames the drawing without a word in the history", () => {
    const cad = createHarness()
    cad.keyIn("CIRCLE 5000,5000 10")
    const log = cad.commandLog()
    cad.zoomToFit()
    expect(cad.commandLog()).toEqual(log)
    expect(cad.toScreen({ x: 5000, y: 5000 })).toBeCloseToPoint({
      x: 500,
      y: 400,
    })
  })
})
