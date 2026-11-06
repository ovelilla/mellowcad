import { describe, expect, it } from "vitest"

import { THEME, recordDemo, transcript } from "@mellowcad/engine"
import { loadEngineLocale } from "@/i18n/engine"
import { routing } from "@/i18n/routing"
import { plotDemo, renderFigure } from "@/lib/plot"

import { diagramsIn } from "./diagrams.fixture"
import { DOCS_SESSIONS, FIGURES, HERO_FIGURE } from "./figures"

/**
 * Every figure on the landing is a script the engine replays at build time.
 * These tests are what stop the page from lying: a command that breaks, a
 * prompt that fails or a script that draws nothing fails here, not on the page.
 */

describe.each(
  Object.entries({
    hero: HERO_FIGURE,
    ...FIGURES,
    ...Object.fromEntries(
      Object.entries(DOCS_SESSIONS).map(([name, session]) => [
        `docs ${name}`,
        session.figure,
      ])
    ),
    ...Object.fromEntries(
      routing.locales.flatMap((locale) => Object.entries(diagramsIn(locale)))
    ),
  })
)("the %s figure", (_name, figure) => {
  // Scripts name commands by their global name with _ (_LINE), as a
  // portable AutoCAD script does, so they run in every command language.
  it.each(routing.locales)(
    "replays in %s without the engine reporting an error",
    async (language) => {
      const locale = await loadEngineLocale(language)
      const recording = await recordDemo(figure.script, { locale })
      const errors = recording.steps
        .flatMap((step) => step.output)
        .filter((line) => line.kind === "error")
      expect(errors).toEqual([])
    }
  )

  // A live figure is the editor's last frame, and a snap's name runs as long
  // as its language words it: "Endpoint" and «Ponto final» lost their ends.
  it.runIf("live" in figure).each(routing.locales)(
    "keeps its tooltips inside it in %s",
    async (language) => {
      const locale = await loadEngineLocale(language)
      const { scene } = await recordDemo(figure.script, { locale })
      for (const primitive of scene.primitives) {
        if (primitive.kind !== "rect") continue
        if (primitive.fill !== THEME.snapTooltipBg) continue
        expect(primitive.min.x + primitive.width).toBeLessThanOrEqual(
          figure.width
        )
        expect(primitive.min.y + primitive.height).toBeLessThanOrEqual(
          figure.height
        )
      }
    }
  )

  it("draws something", async () => {
    const rendered = await renderFigure(figure)
    // A live figure may be all aid and no object yet — polar tracking before
    // the second point is picked — so it is judged by what it shows.
    if (!("live" in figure)) {
      expect(rendered.recording.document.size).toBeGreaterThan(0)
    }
    expect(rendered.markup).toMatch(/^<(line|circle|path|rect|text)/)
  })
})

describe("the hero", () => {
  it("plots in 8 to 12 seconds, as the brief budgets it, and turns at its end", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    expect(plot.duration).toBeGreaterThanOrEqual(8_000)
    expect(plot.duration).toBeLessThanOrEqual(12_000)
    expect(plot.turned?.at).toBeGreaterThan(plot.lines[0].at)
    expect(plot.turned?.at).toBeLessThanOrEqual(plot.duration)
  })

  it("turns the view as -VIEW's answer ends", () => {
    const actions = HERO_FIGURE.script.actions
    expect(actions[HERO_FIGURE.turn - 1]).toEqual({
      kind: "command",
      text: "_-VIEW",
    })
    expect(actions[HERO_FIGURE.turn].kind).toBe("option")
    expect(HERO_FIGURE.drawing.actions).toEqual(
      actions.slice(0, HERO_FIGURE.drafted)
    )
  })

  it("stays inside the SVG budget of about 600 primitives, both its frames", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    const markup = plot.markup + (plot.turned?.markup ?? "")
    expect(
      markup.match(/<(line|circle|ellipse|path|rect|text) /g)?.length
    ).toBeLessThanOrEqual(600)
    expect(markup.length).toBeLessThan(60_000)
  })

  it("plots in plan only what was drafted: the solid is the last frame's", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    const drafted = await recordDemo(HERO_FIGURE.drawing)
    expect(plot.markup.match(/<(line|circle|path|rect|text) /g)?.length).toBe(
      (await plotDemo(HERO_FIGURE.drawing, HERO_FIGURE)).markup.match(
        /<(line|circle|path|rect|text) /g
      )?.length
    )
    expect(drafted.state.view.preset).toBe("Top")
    expect(plot.recording.state.view.preset).toBe("SWiso")
    expect(
      [...plot.recording.document.getEntities()].filter(
        (entity) => entity.type === "solid3d"
      )
    ).toHaveLength(1)
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
        "CYLINDER",
        "SUBTRACT",
        "-VIEW",
      ])
    )
  })

  it("times its transcript in order, each line after the one before", async () => {
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    const times = plot.lines.map((line) => line.at)
    expect(times).toEqual([...times].sort((a, b) => a - b))
    expect(times.at(-1)).toBeLessThanOrEqual(plot.duration)
  })
})
