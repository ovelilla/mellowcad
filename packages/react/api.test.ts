import { describe, expect, it } from "vitest"

import { apiReport, exportedEntries } from "../../test/apiReport"

/**
 * The package's public surface, as `packages/react/api.md` records it
 * (`test/apiReport.ts`). The engine's types its signatures name are the
 * engine's report.
 */

const DIR = import.meta.dirname

describe("@mellowcad/react's public API", () => {
  it("is the one packages/react/api.md records", async () => {
    const report = apiReport({
      dir: DIR,
      writer: "packages/react/api.test.ts",
      entries: exportedEntries(DIR, () => "src/index.ts"),
    })
    await expect(report).toMatchFileSnapshot("./api.md")
  })
})
