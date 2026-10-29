import path from "node:path"
import { describe, expect, it } from "vitest"

import { apiReport, exportedEntries } from "../../test/apiReport"
import {
  cascadeLayers,
  compileStyles,
  ROOT_ATTRIBUTE,
  undeclaredVariables,
  unscopedSelectors,
} from "../../scripts/editor/styles"
import { EDITOR_THEME_STYLE } from "./src/editor-root"

/**
 * The package's public surface, as `packages/editor/api.md` records it
 * (`test/apiReport.ts`). The engine's and react's types its signatures name
 * are their reports.
 *
 * The catalog's shape stops at `en.json`, as the engine's does:
 * `src/locales/en.d.json.ts` is its type, held by `src/locales/locales.test.ts`.
 */

const DIR = import.meta.dirname

/**
 * The custom properties the stylesheet reads that the editor writes inline:
 * the root's accent, and the place Base UI's positioners give their popups.
 * Anything else it reads and never declares, the host has to set.
 */
const WRITTEN_INLINE = [
  ...Object.keys(EDITOR_THEME_STYLE),
  "--anchor-width",
  "--available-height",
  "--transform-origin",
]

/** What `./styles.css` asks of a host, read from the stylesheet the build writes. */
async function stylesheet(): Promise<string> {
  const css = await compileStyles()
  expect(unscopedSelectors(css)).toEqual([])
  const undeclared = undeclaredVariables(css)
  expect(WRITTEN_INLINE.filter((name) => !undeclared.includes(name))).toEqual(
    []
  )
  const fromHost = undeclared.filter((name) => !WRITTEN_INLINE.includes(name))
  const list = (names: string[]) => names.map((name) => `\`${name}\``)
  return [
    `Scoped to \`[${ROOT_ATTRIBUTE}]\`: its rules match the editor's root and what is inside it, or an element by one of its classes.`,
    `Cascade layers, in order: ${list(cascadeLayers(css)).join(", ")}.`,
    `The host sets, on the root or above it: ${list(fromHost).join(", ")}.`,
  ].join("\n\n")
}

describe("@mellowcad/editor's public API", () => {
  it("is the one packages/editor/api.md records", async () => {
    const report = apiReport({
      dir: DIR,
      writer: "packages/editor/api.test.ts",
      entries: exportedEntries(DIR, (subpath) =>
        subpath === "." ? "src/index.ts" : `src/${subpath}.ts`
      ),
      omit: [path.join(DIR, "src/locales/en.d.json.ts")],
      stylesheets: { "./styles.css": await stylesheet() },
    })
    await expect(report).toMatchFileSnapshot("./api.md")
  })
})
