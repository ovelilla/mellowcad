import path from "node:path"
import { describe, expect, it } from "vitest"

import { apiReport, exportedEntries } from "../../test/apiReport"

/**
 * The package's public surface, as `packages/editor/api.md` records it
 * (`test/apiReport.ts`). The engine's and react's types its signatures name
 * are their reports.
 *
 * The catalog's shape stops at `en.json`, as the engine's does:
 * `src/locales/en.d.json.ts` is its type, held by `src/locales/locales.test.ts`.
 */

const DIR = import.meta.dirname

describe("@mellowcad/editor's public API", () => {
  it("is the one packages/editor/api.md records", async () => {
    const report = apiReport({
      dir: DIR,
      writer: "packages/editor/api.test.ts",
      entries: exportedEntries(DIR, (subpath) =>
        subpath === "." ? "src/index.ts" : `src/${subpath}.ts`
      ),
      omit: [path.join(DIR, "src/locales/en.d.json.ts")],
    })
    await expect(report).toMatchFileSnapshot("./api.md")
  })
})
