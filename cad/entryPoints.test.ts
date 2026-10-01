import { existsSync, readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "..")

/** Everything outside the engine that uses it: the app, the landing, their tests. */
const HOSTS = ["app", "components", "hooks", "i18n", "lib", "content"]

/** `from "…"`, `import "…"`, `import("…")` and `export … from "…"`. */
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name)) yield full
  }
}

/** The repository path a specifier names, or null for a package. */
function target(file: string, specifier: string): string | null {
  if (specifier.startsWith("@/")) return specifier.slice(2)
  if (!specifier.startsWith(".")) return null
  return path
    .relative(ROOT, path.resolve(path.dirname(file), specifier))
    .split(path.sep)
    .join("/")
}

/**
 * The engine's public entry points, tomorrow its package's `exports`: the
 * barrel (`@mellowcad/engine`) and one module per language
 * (`@mellowcad/engine/locales/es`), each built from its `<tag>.json`.
 */
function isPublic(entry: string): boolean {
  if (entry === "cad" || entry === "cad/index") return true
  const language = /^cad\/locales\/([\w-]+)$/.exec(entry)?.[1]
  return (
    language !== undefined &&
    existsSync(path.join(ROOT, "cad/locales", `${language}.json`))
  )
}

describe("the engine's public entry points", () => {
  it("are the only way into it from the app and the landing", () => {
    const deep: string[] = []
    let reached = 0
    for (const dir of HOSTS) {
      for (const file of walk(path.join(ROOT, dir))) {
        const source = readFileSync(file, "utf8")
        for (const [, specifier] of source.matchAll(SPECIFIER)) {
          const into = target(file, specifier)
          if (into === null || !/^cad(\/|$)/.test(into)) continue
          reached++
          if (!isPublic(into)) {
            const at = path.relative(ROOT, file).split(path.sep).join("/")
            deep.push(`${at}: ${specifier}`)
          }
        }
      }
    }
    expect(reached).toBeGreaterThan(20)
    expect(deep).toEqual([])
  })

  it("take a language by its catalog, never the catalog's internals", () => {
    expect(isPublic("cad/locales/es")).toBe(true)
    expect(isPublic("cad/locales/en")).toBe(true)
    expect(isPublic("cad/locales/types")).toBe(false)
    expect(isPublic("cad/locales/extend")).toBe(false)
    expect(isPublic("cad/application/EngineText")).toBe(false)
  })
})
