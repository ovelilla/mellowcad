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

/**
 * Which layers each layer's product code may import, the table in
 * `.claude/rules/cad-engine.md`. `adapters/` may import every layer; tests are
 * not shipped, so they may import any layer, `test/` and `scripts/`.
 */
const LAYERS: Record<string, string[]> = {
  geometry: [],
  shared: [],
  domain: ["geometry", "shared"],
  scene: ["geometry"],
  serialization: ["geometry", "domain"],
  i18n: [],
  locales: ["i18n"],
  application: [
    "geometry",
    "domain",
    "scene",
    "serialization",
    "shared",
    "i18n",
    "locales",
  ],
}

/** The packages each layer's product code may import. */
const PACKAGES: Record<string, RegExp> = {
  i18n: /^icu-minify\/format$/,
}

describe("the engine's layers", () => {
  it("import only the layers below them, and no package but their own", () => {
    const wrong: string[] = []
    for (const [layer, allowed] of Object.entries(LAYERS)) {
      for (const file of walk(path.join(ROOT, "cad", layer))) {
        if (/\.test\.ts$/.test(file)) continue
        const at = path.relative(ROOT, file).split(path.sep).join("/")
        const code = readFileSync(file, "utf8")
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .replace(/^\s*\/\/.*$/gm, "")
        for (const [, specifier] of code.matchAll(SPECIFIER)) {
          const into = target(file, specifier)
          if (into === null) {
            if (!PACKAGES[layer]?.test(specifier)) {
              wrong.push(`${at}: package ${specifier}`)
            }
            continue
          }
          const [root, into1] = into.split("/")
          if (root !== "cad" || into1 === layer) continue
          if (!allowed.includes(into1)) wrong.push(`${at}: ${specifier}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })

  it("let the runtime's siblings import it only as a type", () => {
    const wrong: string[] = []
    for (const file of walk(path.join(ROOT, "cad/application"))) {
      if (!/\/runtime[A-Z]\w*\.ts$/.test(file)) continue
      const source = readFileSync(file, "utf8")
      for (const [statement] of source.matchAll(
        /^import\s[^;]*?from\s*["']\.\/CadRuntime["']/gm
      )) {
        if (!/^import\s+type\s/.test(statement)) {
          wrong.push(`${path.basename(file)}: ${statement.split("\n")[0]}`)
        }
      }
    }
    expect(wrong).toEqual([])
  })
})

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
