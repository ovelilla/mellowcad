import { createRequire } from "node:module"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { gzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"

/**
 * What a page pays for what it imports from the package, bundled and
 * minified as a host's bundler would. Measured from the source: the build is
 * one module per source file, and `dist` weighed the same (within 0.1 %).
 *
 * WHY tsdown's rolldown: it is already here, as the build's own bundler, so
 * the budgets need no dependency of their own (`size-limit` was ruled out in
 * docs/next-library.md).
 */

const KB = 1024

/** A page importing only this must stay this small: the package's islands. */
const ISLAND_MAX_BYTES = 1 * KB

/**
 * The engine a page drawing with `CadEngine` loads, gzipped: a ceiling at its
 * size when the package was cut, raised only on purpose.
 */
const ENGINE_MAX_GZIP_BYTES = 272 * KB

const CAD = import.meta.dirname
const fromTsdown = createRequire(
  createRequire(path.join(CAD, "package.json")).resolve("tsdown")
)
const { rolldown } = (await import(
  pathToFileURL(fromTsdown.resolve("rolldown")).href
)) as typeof import("rolldown")

/** A page that imports these names from the package and uses them. */
async function bundle(...names: string[]) {
  const page = `import { ${names.join(", ")} } from "@mellowcad/engine"\nconsole.log(${names.join(", ")})`
  const build = await rolldown({
    input: "page",
    platform: "browser",
    logLevel: "silent",
    resolve: { alias: { "@mellowcad/engine": path.join(CAD, "index.ts") } },
    plugins: [
      {
        name: "page",
        resolveId: (id) => (id === "page" ? id : null),
        load: (id) => (id === "page" ? page : null),
      },
    ],
  })
  const { output } = await build.generate({ format: "esm", minify: true })
  await build.close()
  const code = output
    .map((chunk) => ("code" in chunk ? chunk.code : ""))
    .join("")
  return { bytes: Buffer.byteLength(code), gzip: gzipSync(code).length }
}

describe("the package's weight on a page", () => {
  it.each(["matchCommands", "readSavedDrawingSummary"])(
    "keeps %s an island under 1 KB",
    async (name) => {
      expect((await bundle(name)).bytes).toBeLessThan(ISLAND_MAX_BYTES)
    }
  )

  it("keeps the engine under its ceiling", async () => {
    expect((await bundle("CadEngine")).gzip).toBeLessThan(ENGINE_MAX_GZIP_BYTES)
  })
})
