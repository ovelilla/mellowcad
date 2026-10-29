import path from "node:path"
import { describe, expect, it } from "vitest"

import { apiReport, exportedEntries } from "../test/apiReport"

/**
 * The engine's public surface, as `cad/api.md` records it (`test/apiReport.ts`).
 *
 * The catalogs' shape stops at `en.json`: `cad/locales/en.d.json.ts` is its
 * type, held by `cad/locales/locales.test.ts`, and a key a command adds would
 * otherwise rewrite this report.
 */

const CAD = import.meta.dirname

describe("the engine's public API", () => {
  it("is the one cad/api.md records", async () => {
    const report = apiReport({
      dir: CAD,
      writer: "cad/api.test.ts",
      // `.` is the barrel, `./locales/es` its module.
      entries: exportedEntries(CAD, (subpath) =>
        subpath === "." ? "index.ts" : `${subpath}.ts`
      ),
      omit: [path.join(CAD, "locales/en.d.json.ts")],
    })
    await expect(report).toMatchFileSnapshot("./api.md")
  })
})
