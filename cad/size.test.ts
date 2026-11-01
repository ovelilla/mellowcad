import { readFileSync } from "node:fs"
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
 * the budgets need no dependency of their own (`size-limit` was ruled out).
 */

const KB = 1024

/** A page importing only this must stay this small: the package's islands. */
const ISLAND_MAX_BYTES = 1 * KB

/**
 * The engine a page drawing with `CadEngine` loads, gzipped: a ceiling at its
 * size when the package was cut, raised only on purpose.
 */
const ENGINE_MAX_GZIP_BYTES = 374 * KB

/**
 * A language's catalog, gzipped, against English's, which the engine carries:
 * what the language adds to its own pages. WHY a ratio: both grow with every
 * command's prompts (English 6.7 KB and Spanish 7.3 KB on 2026-10-01, 24.0
 * and 28.5 KB by 2026-10-31), while a localized catalog runs as long as its
 * words do (Spanish and pt-BR 1.19 times English's); one far past that
 * carries something twice.
 */
const CATALOG_MAX_RATIO = 1.4

const CAD = import.meta.dirname
const fromTsdown = createRequire(
  createRequire(path.join(CAD, "package.json")).resolve("tsdown")
)
const { rolldown } = (await import(
  pathToFileURL(fromTsdown.resolve("rolldown")).href
)) as typeof import("rolldown")

const CATALOGS = Object.keys(
  JSON.parse(readFileSync(path.join(CAD, "package.json"), "utf8")).exports
).flatMap((entry) => entry.match(/^\.\/locales\/(.+)$/)?.[1] ?? [])

/** A page that imports these names from the package and uses them. */
const importing = (...names: string[]) =>
  `import { ${names.join(", ")} } from "@mellowcad/engine"\nconsole.log(${names.join(", ")})`

/** A page that loads a language's catalog, as a host does for its pages. */
const loadingCatalog = (tag: string) =>
  `import * as catalog from ${JSON.stringify(path.join(CAD, "locales", `${tag}.ts`))}\nconsole.log(catalog)`

async function bundle(page: string) {
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
      expect((await bundle(importing(name))).bytes).toBeLessThan(
        ISLAND_MAX_BYTES
      )
    }
  )

  it("keeps the engine under its ceiling", async () => {
    expect((await bundle(importing("CadEngine"))).gzip).toBeLessThan(
      ENGINE_MAX_GZIP_BYTES
    )
  })

  it.each(CATALOGS.filter((tag) => tag !== "en"))(
    "keeps the %s catalog within its ratio of English's",
    async (tag) => {
      const [catalog, english] = await Promise.all(
        [tag, "en"].map(
          async (each) => (await bundle(loadingCatalog(each))).gzip
        )
      )
      expect(catalog / english).toBeLessThan(CATALOG_MAX_RATIO)
    }
  )
})
