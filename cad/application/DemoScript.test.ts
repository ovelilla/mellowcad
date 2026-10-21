import { describe, expect, it } from "vitest"
import type { CircleEntity, LineEntity } from "../domain/entities"
import { THEME } from "../scene/theme"
import { p } from "../../test/builders"
import { demo, promptText, recordDemo, transcript } from "./DemoScript"

describe("recordDemo", () => {
  it("replays a script and says which objects each step drew", async () => {
    const recording = await recordDemo(
      demo()
        .command("LINE")
        .type("0,0")
        .enter()
        .type("@100,0")
        .enter()
        .escape()
        .command("CIRCLE")
        .type("50,0")
        .enter()
        .type("20")
        .enter()
    )

    const drawnBy = recording.steps
      .map((step, index) => ({ index, added: step.added.length }))
      .filter((step) => step.added > 0)
    expect(drawnBy).toEqual([
      { index: 4, added: 1 },
      { index: 10, added: 1 },
    ])
    const [line, circle] = recording.document.getEntities() as [
      LineEntity,
      CircleEntity,
    ]
    expect(line.end).toBeCloseToPoint(p(100, 0))
    expect(circle.radius).toBeCloseTo(20)
  })

  it("records the prompt each input answered, as the engine showed it", async () => {
    const recording = await recordDemo(
      demo().command("CIRCLE").type("0,0").enter().type("12").enter()
    )

    const [start, centre, , radius] = recording.steps
    expect(start.prompt).toEqual({
      command: null,
      field: null,
      fieldKind: null,
      options: [],
      echo: null,
    })
    expect(centre.prompt.command).toBe("CIRCLE")
    expect(centre.prompt.field).toBe("Center")
    expect(radius.prompt.field).toBe("Radius")
  })

  it("keeps what the engine printed with the step that printed it", async () => {
    const recording = await recordDemo(demo().command("NOPE").command("LINE"))

    expect(recording.steps[0].output).toEqual([
      { kind: "error", text: 'Unknown command "NOPE".  Press F1 for help.' },
    ])
    expect(recording.steps[1].output).toEqual([
      { kind: "command", text: "LINE" },
    ])
  })

  it("draws on a template layer made current without a word on the prompt", async () => {
    const recording = await recordDemo(
      demo({ layers: [{ name: "CENTER", linetype: "Center" }] })
        .layer("CENTER")
        .command("LINE")
        .type("0,0")
        .enter()
        .type("10,0")
        .enter()
        .escape()
    )

    const layer = recording.document
      .getLayers()
      .find((candidate) => candidate.name === "CENTER")!
    expect(layer.linetype).toBe("Center")
    expect(recording.document.getEntities()[0].layerId).toBe(layer.id)
    expect(recording.steps[0].output).toEqual([])
  })

  it("fails loudly on a layer the template does not have", async () => {
    await expect(recordDemo(demo().layer("MISSING"))).rejects.toThrow(/MISSING/)
  })

  it("leaves the grid out of the final frame", async () => {
    const recording = await recordDemo(
      demo({ width: 400, height: 300 }).command("LINE")
    )
    expect(recording.scene.width).toBe(400)
    const segments = recording.scene.primitives.filter(
      (primitive) => primitive.kind === "segment"
    )
    // Only the crosshair's two arms: no grid lines, no axes.
    expect(segments.length).toBeLessThanOrEqual(4)
  })

  it("waits out the tracking dwell on a hover, so OTRACK acquires the point", async () => {
    const recording = await recordDemo(
      demo({ snap: true })
        .command("LINE")
        .type("0,0")
        .enter()
        .type("100,0")
        .enter()
        .escape()
        .command("LINE")
        .hover(100, 0)
    )
    const acquired = recording.scene.primitives.filter(
      (primitive) =>
        primitive.kind === "segment" &&
        primitive.stroke.color === THEME.trackingSolid
    )
    expect(acquired.length).toBeGreaterThan(0)
  })

  it("holds the button between down and up, so a lasso shows", async () => {
    const box = (script: ReturnType<typeof demo>) =>
      recordDemo(script).then(({ scene }) =>
        scene.primitives.find(
          (primitive) =>
            primitive.kind === "path" &&
            primitive.fill === THEME.selectionWindowFill
        )
      )
    const base = demo().command("LINE").type("0,0").enter().type("50,0")
    const held = base.enter().escape().down(-20, 20).moveTo(80, -20)
    expect(await box(held)).toBeDefined()
    expect(await box(held.up(80, -20))).toBeUndefined()
  })

  it("presses function keys on the drawing surface", async () => {
    const recording = await recordDemo(demo().press("F10"))
    expect(recording.steps[0].action).toEqual({ kind: "press", key: "F10" })
  })

  it("builds scripts immutably, so two can share a prefix", () => {
    const base = demo().command("LINE")
    const a = base.type("0,0")
    const b = base.escape()
    expect(base.actions).toHaveLength(1)
    expect(a.actions.at(-1)).toEqual({ kind: "type", text: "0,0" })
    expect(b.actions.at(-1)).toEqual({ kind: "escape" })
  })
})

describe("transcript", () => {
  it("reads like command-line history", async () => {
    const lines = transcript(
      await recordDemo(
        demo().command("CIRCLE").type("30,40").enter().type("12").enter()
      )
    )

    expect(lines.map(({ kind, prompt, text }) => [kind, prompt, text])).toEqual(
      [
        ["command", "", "CIRCLE"],
        [
          "input",
          "Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:",
          "30,40",
        ],
        ["input", "Specify radius of circle or [Diameter]:", "12"],
      ]
    )
  })

  it("shows an option letter as the answer and a pick as none", async () => {
    const lines = transcript(
      await recordDemo(
        demo()
          .command("LINE")
          .type("0,0")
          .enter()
          .type("@50,0")
          .enter()
          .command("OFFSET")
          .type("5")
          .enter()
          .click(25, 0)
          .click(25, 10)
          .escape()
          .command("FILLET")
          .option("Radius")
      )
    )

    const offset = lines.filter((line) => line.kind === "input").slice(2)
    expect(offset[0].text).toBe("5")
    expect(offset[0].prompt).toBe(
      "Specify offset distance or [Through/Erase/Layer] <Through>:"
    )
    expect(offset[1].text).toBe("")
    expect(offset.at(-1)).toMatchObject({ text: "R" })
  })

  it("names the step every line came from, for timing an animation", async () => {
    const lines = transcript(
      await recordDemo(demo().command("LINE").type("0,0").enter())
    )
    expect(lines.map((line) => line.step)).toEqual([0, 2])
  })
})

describe("promptText", () => {
  const prompt = {
    command: "CIRCLE",
    field: "Radius",
    fieldKind: "distance" as const,
    options: [],
    echo: null,
  }

  it("puts the keywords after the question, as the command line does", () => {
    expect(
      promptText({
        command: "FILLET",
        field: null,
        fieldKind: null,
        options: ["Radius"],
        echo: null,
      })
    ).toBe("FILLET [Radius]:")
    expect(promptText(prompt, "12")).toBe("Radius:")
    expect(
      promptText({
        command: null,
        field: null,
        fieldKind: null,
        options: [],
        echo: null,
      })
    ).toBe("Command:")
  })

  it("falls back to the command when a point answers a distance box", () => {
    expect(
      promptText(
        { ...prompt, command: "LINE", field: "Length", options: ["Undo"] },
        "@100,0"
      )
    ).toBe("LINE [Undo]:")
    expect(
      promptText({ ...prompt, field: "Center", fieldKind: "coordinate" }, "0,0")
    ).toBe("Center:")
  })

  it("is the question the command names, whatever answers it", () => {
    const echo = [
      { text: "Specify next point or ", keywords: false },
      { text: "[Undo]", keywords: true },
      { text: ":", keywords: false },
    ]
    expect(
      promptText({ ...prompt, command: "LINE", field: "Length", echo }, "@1,0")
    ).toBe("Specify next point or [Undo]:")
  })

  it("never prints an empty question", () => {
    expect(
      promptText({
        ...prompt,
        command: "LINE",
        field: "",
        fieldKind: "coordinate",
      })
    ).toBe("LINE:")
  })
})
