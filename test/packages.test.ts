import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "..")

/** The workspace packages under packages/, each with its name and exports. */
const PACKAGES = readdirSync(path.join(ROOT, "packages")).map((dir) => {
  const manifest = JSON.parse(
    readFileSync(path.join(ROOT, "packages", dir, "package.json"), "utf8")
  ) as {
    name: string
    exports: Record<string, unknown>
    scripts?: Record<string, string>
  }
  return { dir: `packages/${dir}`, ...manifest }
})

/** Everything that may use a package: the app, the landing, the engine's tests, the other packages. */
const HOSTS = [
  "app",
  "cad",
  "components",
  "content",
  "i18n",
  "lib",
  "packages",
  "test",
]

/** `from "…"`, `import "…"`, `import("…")` and `export … from "…"`. */
const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.name === "dist" || entry.name === "node_modules") continue
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.(ts|tsx)$/.test(entry.name)) yield full
  }
}

describe("the workspace packages", () => {
  it("are each built and checked by the commit hook", () => {
    for (const { dir, scripts = {} } of PACKAGES) {
      expect(Object.keys(scripts), dir).toEqual(
        expect.arrayContaining(["build", "check"])
      )
    }
  })

  it("are reached from outside only by their name and their exports", () => {
    const deep: string[] = []
    for (const host of HOSTS) {
      for (const file of walk(path.join(ROOT, host))) {
        const at = path.relative(ROOT, file).split(path.sep).join("/")
        for (const [, specifier] of readFileSync(file, "utf8").matchAll(
          SPECIFIER
        )) {
          for (const { dir, name, exports } of PACKAGES) {
            if (at.startsWith(`${dir}/`)) continue
            const into = specifier.startsWith("@/")
              ? specifier.slice(2)
              : specifier.startsWith(".")
                ? path
                    .relative(ROOT, path.resolve(path.dirname(file), specifier))
                    .split(path.sep)
                    .join("/")
                : null
            const byPath =
              into !== null && (into === dir || into.startsWith(`${dir}/`))
            const subpath =
              specifier === name
                ? "."
                : specifier.startsWith(`${name}/`)
                  ? `./${specifier.slice(name.length + 1)}`
                  : null
            if (byPath || (subpath !== null && !(subpath in exports)))
              deep.push(`${at}: ${specifier}`)
          }
        }
      }
    }
    expect(deep).toEqual([])
  })

  // WHY: in the repo `@/` resolves to the root, so a package file importing
  // `@/lib/utils` still compiles, against the site's copy, and breaks only
  // once the package is installed somewhere else. Tests are not shipped and
  // may reach the repo's `test/` and `scripts/`.
  it("reach their own files relatively and anything else by its name", () => {
    const outside: string[] = []
    for (const { dir } of PACKAGES) {
      for (const file of walk(path.join(ROOT, dir))) {
        const at = path.relative(ROOT, file).split(path.sep).join("/")
        const shipped =
          !/\.test\.tsx?$/.test(at) && !/\/tsdown\.config\.ts$/.test(at)
        for (const [, specifier] of readFileSync(file, "utf8").matchAll(
          SPECIFIER
        )) {
          if (specifier.startsWith("@/")) {
            outside.push(`${at}: ${specifier}`)
            continue
          }
          if (!specifier.startsWith(".")) continue
          const into = path
            .relative(ROOT, path.resolve(path.dirname(file), specifier))
            .split(path.sep)
            .join("/")
          const own = into.startsWith(`${dir}/`)
          const allowed = own || (!shipped && /^(test|scripts)\//.test(into))
          if (!allowed) outside.push(`${at}: ${specifier}`)
        }
      }
    }
    expect(outside).toEqual([])
  })
})
