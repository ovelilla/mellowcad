/**
 * The check before publishing a package: builds and checks it and the
 * packages of ours it takes as peers, packs the tarballs npm would publish
 * and installs them, everything else from the registry as any user would,
 * into hosts outside the repository. Most hosts are the examples/, so what a
 * stranger copies is what is checked:
 *
 *   @mellowcad/engine  examples/engine-node draws, saves and type-checks; a
 *                      plain Node host drives it in Spanish and is refused a
 *                      deep import; tsc (`nodenext`, strict, no
 *                      skipLibCheck) compiles a host against the shipped
 *                      declarations; Vite bundles a page importing one helper
 *                      to under 1 KB (`sideEffects: false` honoured from the
 *                      tarball), and a page drawing in Spanish at all
 *
 * Run from a package's folder, as its `check:hosts` (which its
 * `prepublishOnly` runs):  npm run check:hosts -w cad
 * It needs the network (the registry), so it
 * is not in the commit gate (engine-package.md). KEEP=1 leaves the hosts in
 * their temporary folder.
 */

import { execFileSync } from "node:child_process"
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

/** Our packages and their folders. */
const WORKSPACES: Record<string, string> = {
  "@mellowcad/engine": "cad",
}

const ISLAND_MAX_BYTES = 1024

type Manifest = {
  name: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}

interface Host {
  readonly name: string
  /** The example the host starts from, if any. */
  readonly example?: string
  /** Files written over it; `null` removes one. */
  readonly files?: Record<string, string | null>
  /** Runs in the installed host; throws on a failure. */
  readonly check: (dir: string) => string
}

function run(
  command: string,
  args: string[],
  cwd: string,
  env: Record<string, string> = {}
): string {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", ...env },
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (error) {
    const { stdout = "", stderr = "" } = error as {
      stdout?: string
      stderr?: string
    }
    process.stderr.write(stdout + stderr)
    throw error
  }
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T
}

function write(dir: string, files: Record<string, string | null>): void {
  for (const [name, text] of Object.entries(files)) {
    if (text === null) {
      rmSync(join(dir, name), { force: true })
      continue
    }
    mkdirSync(dirname(join(dir, name)), { recursive: true })
    writeFileSync(join(dir, name), text)
  }
}

function filesUnder(dir: string, extension: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(extension))
    .map((file) => join(dir, file))
}

function bytes(dir: string, extension: string): number {
  return filesUnder(dir, extension).reduce(
    (sum, file) => sum + statSync(file).size,
    0
  )
}

function expectIn(where: string, haystack: string, needle: string): void {
  if (!haystack.includes(needle))
    throw new Error(`${where}: no ${JSON.stringify(needle)}`)
}

const ENGINE_NODE: Host = {
  name: "engine-node",
  example: "engine-node",
  check(dir) {
    run("node", ["main.ts"], dir)
    const [file] = readdirSync(dir).filter((f) => f.endsWith(".ecad.json"))
    const drawing = readJson<{ entities: unknown[] }>(join(dir, file))
    if (drawing.entities.length !== 2)
      throw new Error(`engine-node: ${file} has ${drawing.entities.length}`)
    expectIn(
      "engine-node",
      readFileSync(join(dir, "drawing.svg"), "utf8"),
      "<svg"
    )
    run("npx", ["tsc", "-p", "."], dir)
    return "engine-node: ok"
  },
}

const FOREIGN_NODE = `import assert from "node:assert/strict"
import {
  CadDriver,
  commandCatalog,
  extendLocale,
  matchCommands,
} from "@mellowcad/engine"
import { es } from "@mellowcad/engine/locales/es"

const cad = new CadDriver({ locale: es })
cad.command("LINEA").click({ x: 0, y: 0 }).click({ x: 100, y: 0 }).escape()
assert.equal(cad.entityCount, 1)
cad.dispose()

const spanish = extendLocale(es, { interface: { byLayer: "Por capa" } })
assert.ok(commandCatalog(spanish).some((command) => command.name === "LINEA"))
assert.ok(matchCommands(commandCatalog(), "LI").length > 0)

await assert.rejects(import("@mellowcad/engine/application/CadDriver"), {
  code: "ERR_PACKAGE_PATH_NOT_EXPORTED",
})
`

const FOREIGN_TYPED = `import {
  CadEngine,
  createMemoryDrawingStore,
  type CadEngineOptions,
  type EngineState,
} from "@mellowcad/engine"
import { ar } from "@mellowcad/engine/locales/ar"

declare const canvas: HTMLCanvasElement

const options: CadEngineOptions = {
  store: createMemoryDrawingStore(),
  scope: "document",
  locale: ar,
}
const engine = new CadEngine(canvas, options)
const state: EngineState = engine.getState()
export const tools: number = state.tools.length
`

const FOREIGN_PAGES: Record<string, string> = {
  island: `import { matchCommands } from "@mellowcad/engine"
console.log(matchCommands([], "L"))
`,
  engine: `import { CadEngine } from "@mellowcad/engine"
import { es } from "@mellowcad/engine/locales/es"
const canvas = document.querySelector("canvas")
if (canvas) new CadEngine(canvas, { locale: es })
`,
}

// One build per page, so a chunk the two would share cannot hide what the
// island alone costs.
const FOREIGN_VITE_CONFIG = `export default {
  logLevel: "warn",
  build: {
    outDir: "out/" + process.env.PAGE,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 2048,
    rolldownOptions: { input: process.env.PAGE + ".html" },
  },
}
`

const ENGINE_FOREIGN: Host = {
  name: "engine-foreign",
  files: {
    // The tools at the versions the repo itself runs.
    "package.json": JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@mellowcad/engine": "*",
        typescript: "5.9.3",
        vite: "8.3.4",
      },
    }),
    "node.mjs": FOREIGN_NODE,
    "typed.ts": FOREIGN_TYPED,
    "tsconfig.json": JSON.stringify({
      compilerOptions: {
        target: "es2022",
        module: "nodenext",
        moduleResolution: "nodenext",
        lib: ["es2023", "dom"],
        strict: true,
        noEmit: true,
        skipLibCheck: false,
        types: [],
      },
      files: ["typed.ts"],
    }),
    "vite.config.mjs": FOREIGN_VITE_CONFIG,
    ...Object.fromEntries(
      Object.entries(FOREIGN_PAGES).flatMap(([page, script]) => [
        [
          `${page}.html`,
          `<!doctype html><canvas></canvas><script type="module" src="./${page}.js"></script>\n`,
        ],
        [`${page}.js`, script],
      ])
    ),
  },
  check(dir) {
    run("node", ["node.mjs"], dir)
    run("npx", ["tsc", "-p", "."], dir)
    for (const page of Object.keys(FOREIGN_PAGES))
      run("npx", ["vite", "build"], dir, { PAGE: page })
    const island = bytes(join(dir, "out/island"), ".js")
    if (island >= ISLAND_MAX_BYTES)
      throw new Error(`engine-foreign: the island page ships ${island} B`)
    return `engine-foreign: ok (island ${island} B, engine ${bytes(join(dir, "out/engine"), ".js")} B)`
  },
}

const HOSTS: Record<string, readonly Host[]> = {
  "@mellowcad/engine": [ENGINE_NODE, ENGINE_FOREIGN],
}

/** The host's package.json with our packages taken from their tarballs. */
function installable(
  manifest: Manifest,
  tarballs: Record<string, string>
): Manifest {
  const dependencies = { ...manifest.dependencies }
  for (const name of Object.keys(dependencies)) {
    if (!(name in WORKSPACES)) continue
    if (!(name in tarballs))
      throw new Error(`a host needs ${name}, which is not packed here`)
    dependencies[name] = `file:${tarballs[name]}`
  }
  return { ...manifest, dependencies }
}

const self = readJson<Manifest>(join(process.cwd(), "package.json"))
const hosts = HOSTS[self.name]
if (!hosts) throw new Error(`no hosts for ${self.name}`)
const packages = [
  ...Object.keys(self.peerDependencies ?? {}).filter(
    (name) => name in WORKSPACES
  ),
  self.name,
]

/** What an example run in place leaves beside its sources. */
const LOCAL = new Set(["node_modules", "dist", ".next"])

const work = mkdtempSync(join(tmpdir(), "mellowcad-hosts-"))
try {
  const tarballs: Record<string, string> = {}
  for (const name of packages) {
    const workspace = WORKSPACES[name]
    run("npm", ["run", "--silent", "build", "-w", workspace], ROOT)
    run("npm", ["run", "--silent", "check", "-w", workspace], ROOT)
    const [packed] = JSON.parse(
      run(
        "npm",
        ["pack", "-w", workspace, "--json", "--pack-destination", work],
        ROOT
      )
    ) as { filename: string }[]
    tarballs[name] = join(work, packed.filename)
  }

  for (const host of hosts) {
    const dir = join(work, host.name)
    if (host.example)
      cpSync(join(ROOT, "examples", host.example), dir, {
        recursive: true,
        filter: (source) => !LOCAL.has(basename(source)),
      })
    else mkdirSync(dir)
    write(dir, host.files ?? {})
    const manifest = installable(
      readJson<Manifest>(join(dir, "package.json")),
      tarballs
    )
    writeFileSync(join(dir, "package.json"), JSON.stringify(manifest, null, 2))
    // The repo's release quarantine, which an install outside it would not read.
    cpSync(join(ROOT, ".npmrc"), join(dir, ".npmrc"))
    run("npm", ["install", "--no-audit", "--no-fund"], dir)
    console.log(host.check(dir))
  }
} finally {
  if (process.env.KEEP) console.log(`hosts kept in ${work}`)
  else rmSync(work, { recursive: true, force: true })
}
