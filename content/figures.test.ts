import { describe, expect, it } from "vitest"

import { GET } from "@/app/sketches/hero.json/route"
import {
  DEFAULT_LAYER_ID,
  parseDrawingFile,
  recordDemo,
  transcript,
} from "@/cad"
import { plotDemo, renderFigure } from "@/lib/plot"

import { FIGURES, HERO_FIGURE } from "./figures"

/**
 * Every figure on the landing is a script the engine replays at build time.
 * These tests are what stop the page from lying: a command that breaks, a
 * prompt that fails or a script that draws nothing fails here, not on the page.
 */

describe.each(Object.entries({ hero: HERO_FIGURE, ...FIGURES }))(
  "the %s figure",
  (_name, figure) => {
    it("replays without the engine reporting an error", async () => {
      const recording = await recordDemo(figure.script)
      const errors = recording.steps
        .flatMap((step) => step.output)
        .filter((line) => line.kind === "error")
      expect(errors).toEqual([])
    })

    it("draws something", async () => {
      const rendered = await renderFigure(figure)
      // A live figure may be all aid and no object yet — polar tracking before
      // the second point is picked — so it is judged by what it shows.
      if (!("live" in figure)) {
        expect(rendered.recording.document.size).toBeGreaterThan(0)
      }
      expect(rendered.markup).toMatch(/^<(line|circle|path|rect|text)/)
    })
  }
)

describe("the hero", () => {
  it("plots in 8 to 12 seconds, as the brief budgets it", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    expect(plot.duration).toBeGreaterThanOrEqual(8_000)
    expect(plot.duration).toBeLessThanOrEqual(12_000)
  })

  it("stays inside the SVG budget of about 600 primitives", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    expect(
      plot.markup.match(/<(line|circle|path|rect|text) /g)?.length
    ).toBeLessThanOrEqual(600)
    expect(plot.markup.length).toBeLessThan(60_000)
  })

  it("is drawn with the commands the brief names", async () => {
    const commands = transcript(await recordDemo(HERO_FIGURE.script))
      .filter((line) => line.kind === "command")
      .map((line) => line.text)
    expect(commands).toEqual(
      expect.arrayContaining([
        "CIRCLE",
        "OFFSET",
        "RECTANG",
        "LINE",
        "HATCH",
        "DIMDIAMETER",
        "DIMLINEAR",
      ])
    )
  })

  it("times its transcript in order, each line after the one before", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    const times = plot.lines.map((line) => line.at)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times.at(-1)).toBeLessThanOrEqual(plot.duration)
  })

  // The live sketch opens this file; if it stopped loading, "Try it here"
  // would open an empty sheet over the drawing it promised.
  it("is served as a drawing the editor opens, on layer 0", async () => {
    const response = await GET()
    const drawing = parseDrawingFile(await response.text())

    expect(drawing.entities.length).toBe(
      (await recordDemo(HERO_FIGURE.script)).document.size
    )
    expect(drawing.currentLayerId).toBe(DEFAULT_LAYER_ID)
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex")
  })
})
