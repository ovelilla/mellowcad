import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { THEME } from "@mellowcad/engine"
import { EDITOR_ROOT_ATTRIBUTE, EDITOR_THEME_STYLE } from "./editor-root"

const css = readFileSync(
  new URL("../app/[locale]/(app)/globals.css", import.meta.url),
  "utf8"
)

/** The custom properties declared by the rules whose selector is `selector`. */
function declaredBy(selector: string): string[] {
  const names: string[] = []
  for (const [, body] of css.matchAll(
    new RegExp(
      `(?:^|\\n)\\s*${selector.replace(/[[\]]/g, "\\$&")} \\{([^}]*)\\}`,
      "g"
    )
  ))
    names.push(...[...body.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))
  return names
}

describe("the editor's root", () => {
  it("takes the accent from the grips' blue", () => {
    expect(EDITOR_THEME_STYLE["--active"]).toBe(THEME.grip)
    // No second copy in the stylesheet to drift from it.
    expect(css).not.toMatch(/--active\s*:/)
  })

  it("holds the editor's tokens, not the host's :root", () => {
    expect(declaredBy(`[${EDITOR_ROOT_ATTRIBUTE}]`)).toContain("--background")
    expect(declaredBy(":root")).toEqual([])
  })
})
