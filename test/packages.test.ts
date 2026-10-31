import { existsSync, readdirSync, readFileSync } from "node:fs"
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
  "examples",
  "i18n",
  "lib",
  "packages",
  "test",
]

/** Every package of ours, the engine included, with its folder and version. */
const ALL = [
  {
    dir: "cad",
    ...readJson<{ name: string; version: string }>("cad/package.json"),
  },
  ...PACKAGES.map(({ dir }) => ({
    dir,
    ...readJson<{ name: string; version: string }>(`${dir}/package.json`),
  })),
]

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(ROOT, file), "utf8")) as T
}

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

type Manifest = {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const EXAMPLES = readdirSync(path.join(ROOT, "examples")).map((dir) => ({
  dir: `examples/${dir}`,
  ...readJson<Manifest>(`examples/${dir}/package.json`),
}))

describe("the examples", () => {
  // WHY: they are not workspaces (their tools stay out of the lockfile), so
  // nothing else moves their versions: `check:hosts` installs them as they
  // are, and a stranger copies them.
  it("ask for our packages at their version and for the repo's tools at its range", () => {
    const root = readJson<Manifest>("package.json")
    const repo = { ...root.dependencies, ...root.devDependencies }
    const stale: string[] = []
    for (const { dir, dependencies = {}, devDependencies = {} } of EXAMPLES) {
      for (const [name, range] of Object.entries({
        ...dependencies,
        ...devDependencies,
      })) {
        const ours = ALL.find((pkg) => pkg.name === name)
        const want = ours ? `^${ours.version}` : repo[name]
        if (want !== undefined && range !== want)
          stale.push(`${dir}: ${name} ${range}, not ${want}`)
      }
    }
    expect(stale).toEqual([])
  })
})

/** Each entry point's exports, from a package's api.md. */
function exportsOf(dir: string, name: string): Map<string, Set<string>> {
  const entries = new Map<string, Set<string>>()
  let names: Set<string> | null = null
  for (const line of readFileSync(path.join(ROOT, dir, "api.md"), "utf8").split(
    "\n"
  )) {
    const heading = line.match(/^## (.+)$/)?.[1]
    if (heading !== undefined) {
      names = heading.startsWith(".") ? new Set() : null
      if (names)
        entries.set(
          heading === "." ? name : `${name}/${heading.slice(2)}`,
          names
        )
      continue
    }
    const exported = line.match(/^export (?:type )?\{ (\w+) \}$/)?.[1]
    if (names && exported) names.add(exported)
  }
  return entries
}

const README_IMPORT =
  /import\s+(?:type\s+)?(?:\{([^}]*)\}\s*from\s*)?["'](@mellowcad\/[^"']+)["']/g
const FENCED = /^```(\w+)(?: (\S+))?\n([\s\S]*?)^```$/gm

/** A package's README and its guides (`docs/*.md`): what an integrator reads. */
function packageDocs(dir: string): string[] {
  const guides = path.join(ROOT, dir, "docs")
  return [
    `${dir}/README.md`,
    ...(existsSync(guides) ? readdirSync(guides) : [])
      .filter((file) => file.endsWith(".md"))
      .map((file) => `${dir}/docs/${file}`),
  ]
}

describe("the READMEs and guides", () => {
  const entries = new Map(
    ALL.flatMap(({ dir, name }) => [...exportsOf(dir, name)])
  )
  // A word of a doc comment is no name of the API.
  const reports = ALL.map(({ dir }) =>
    readFileSync(path.join(ROOT, dir, "api.md"), "utf8")
  )
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
  const readmes = ALL.map(({ dir }) => `${dir}/README.md`)
  const docs = ALL.flatMap(({ dir }) => packageDocs(dir))

  it("are one per package", () => {
    expect(
      readmes.filter((file) => !existsSync(path.join(ROOT, file)))
    ).toEqual([])
  })

  it("import only what each entry point exports", () => {
    const stale: string[] = []
    for (const file of docs) {
      const text = readFileSync(path.join(ROOT, file), "utf8")
      for (const [, , , code] of text.matchAll(FENCED)) {
        for (const [, names = "", specifier] of code.matchAll(README_IMPORT)) {
          const exported = entries.get(specifier)
          if (!exported) {
            stale.push(`${file}: ${specifier}`)
            continue
          }
          for (const name of names.split(",")) {
            const imported = name
              .replace(/^\s*type\s+/, "")
              .split(/\s+as\s+/)[0]
              .trim()
            if (imported && !exported.has(imported))
              stale.push(`${file}: ${imported} from ${specifier}`)
          }
        }
      }
    }
    expect(stale).toEqual([])
  })

  // A name in prose (`CadEditor`, `PieceProps`) is one of the API reports'.
  it("name in their prose only what the API reports hold", () => {
    const words = new Set(reports.match(/[\w$]+/g))
    const stale: string[] = []
    for (const file of docs) {
      const prose = readFileSync(path.join(ROOT, file), "utf8").replace(
        FENCED,
        ""
      )
      for (const [, span] of prose.matchAll(/`([^`]+)`/g)) {
        const specifier = span.match(/^@mellowcad\/[\w/.-]+$/)?.[0]
        if (specifier && !entries.has(specifier)) stale.push(`${file}: ${span}`)
        for (const name of span.match(/\b[A-Z][a-z]\w*[A-Z]\w*\b/g) ?? [])
          if (!words.has(name)) stale.push(`${file}: ${name}`)
      }
    }
    expect(stale).toEqual([])
  })

  it("copy an example's file word for word where they name it", () => {
    const drift: string[] = []
    for (const file of docs) {
      const text = readFileSync(path.join(ROOT, file), "utf8")
      for (const [, , source, code] of text.matchAll(FENCED)) {
        if (source === undefined) continue
        const full = path.join(ROOT, source)
        if (!existsSync(full) || readFileSync(full, "utf8") !== code)
          drift.push(`${file}: ${source}`)
      }
    }
    expect(drift).toEqual([])
  })
})
