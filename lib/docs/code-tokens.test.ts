import { codeToHtml } from "shiki"
import { describe, expect, it } from "vitest"

import { codeTheme, TOKEN_CLASSES, transformerTokenClasses } from "./code-tokens"
import { REPORT_META } from "./remark-package-source"

const SOURCE = `/**
 * The engine on a page: {@link CadDriver} without one.
 */
export declare class CadEngine {
    constructor(canvas: HTMLCanvasElement, options?: CadEngineOptions);
    setLocale(locale: "en" | \`\${string}\`): void;
}`

function highlight(code: string, meta = "") {
  return codeToHtml(code, {
    lang: "ts",
    theme: codeTheme,
    mergeSameStyleTokens: true,
    meta: { __raw: meta },
    transformers: [transformerTokenClasses()],
  })
}

describe("transformerTokenClasses", () => {
  it("colours each token by a class and leaves the block's own colour bare", async () => {
    const html = await highlight(SOURCE)
    const spans = [...html.matchAll(/<span ([^>]*)>/g)].map((match) => match[1])
    expect(spans.filter((attributes) => attributes.includes("style="))).toEqual([])
    expect(html).toContain('class="sx-k"')
    expect(html).toContain('class="sx-c"')
  })

  it("keeps the text as it was", async () => {
    const plain = (html: string) =>
      html
        .replace(/<[^>]+>/g, "")
        .replaceAll("&#x3C;", "<")
        .replaceAll("&#x3E;", ">")
        .replaceAll("&quot;", '"')
    expect(plain(await highlight(SOURCE))).toBe(SOURCE)
  })

  it("draws a block with no numbers as tokens and newlines, a comment as one element", async () => {
    const html = await highlight(SOURCE)
    expect(html).not.toContain('class="line"')
    expect(html).toContain('class="sx-k"')
    const comment = await highlight("/**\n * One comment,\n * three lines.\n */\nlet a = 1")
    expect(comment.match(/class="sx-c"/g)).toHaveLength(1)
    expect(await highlight(SOURCE, 'title="a.ts" lineNumbers')).toContain('class="line"')
  })

  it("colours an API report's comments and nothing else", async () => {
    const html = await highlight(SOURCE, REPORT_META)
    expect([...html.matchAll(/class="(sx-\w)"/g)].map((match) => match[1])).toEqual(["sx-c"])
  })

  it("names a class for every colour the theme gives a token", () => {
    const tokens = codeTheme.settings
      ?.map((setting) => setting.settings?.foreground)
      .filter((colour): colour is string => colour?.startsWith("var(--syntax-token-") === true)
    for (const colour of new Set(tokens)) {
      expect(TOKEN_CLASSES[`color:${colour}`], colour).toBeDefined()
    }
  })
})
