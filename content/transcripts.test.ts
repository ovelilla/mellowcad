import { describe, expect, it } from "vitest"

import { engineText, recordDemo, transcript } from "@mellowcad/engine"
import { plotDemo } from "@/lib/plot"

import { englishDiagrams } from "./diagrams.fixture"
import { FIGURES, HERO_FIGURE } from "./figures"

/**
 * The command-line history every figure on the landing types out, in English,
 * and the hero's timing. Replayed from the engine at build time, so moving the
 * engine's text into catalogs must leave this file exactly as it is.
 */
describe("the landing's transcripts", () => {
  it("read as the engine words them", async () => {
    const out: string[] = [`idle: ${engineText().idlePrompt()}`]
    const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
    out.push("## hero")
    for (const line of plot.lines) {
      out.push(
        `${line.at} +${line.typing} ${line.kind} | ${line.prompt} | ${line.text}`
      )
    }
    for (const [name, figure] of Object.entries({
      ...FIGURES,
      ...englishDiagrams(),
    })) {
      out.push(`## ${name}`)
      for (const line of transcript(await recordDemo(figure.script))) {
        out.push(`${line.kind} | ${line.prompt} | ${line.text}`)
      }
    }
    await expect(out.join("\n") + "\n").toMatchFileSnapshot(
      "./__snapshots__/transcripts.txt"
    )
  })
})
