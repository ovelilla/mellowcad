/**
 * The check before publishing `@mellowcad/engine`: builds the package, packs
 * the tarball npm would publish and installs it, from the registry like any
 * user, into foreign hosts outside the repository:
 *
 *   node     plain Node ESM drives the engine headless in Spanish, and a deep
 *            import is refused (`exports`)
 *   tsc      TypeScript (`nodenext`, strict, no skipLibCheck) compiles a host
 *            against the shipped declarations
 *   vite     a page importing one helper bundles to under 1 KB
 *            (`sideEffects: false` honoured from the tarball), and a page
 *            drawing with `CadEngine` and a language bundles at all
 *
 * Run before publishing:  npm run check:hosts -w cad
 * It needs the network, so it is not in the commit gate (engine-package.md).
 * KEEP=1 leaves the hosts in their temporary folder.
 */

import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

/** The tools the hosts install, at the versions the repo itself runs. */
const HOST_TOOLS = ["typescript@5.9.3", "vite@8.3.4"]

const ISLAND_MAX_BYTES = 1024

function run(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  })
}

function write(dir: string, files: Record<string, string>): void {
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true })
    writeFileSync(join(dir, name), text)
  }
}

const NODE_HOST = `import assert from "node:assert/strict"
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
console.log("node: ok")
`

const TYPED_HOST = `import {
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

const TSCONFIG = JSON.stringify(
  {
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
  },
  null,
  2
)

const PAGES: Record<string, string> = {
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
const VITE_CONFIG = `export default {
  logLevel: "warn",
  build: {
    outDir: "out/" + process.env.PAGE,
    modulePreload: { polyfill: false },
    chunkSizeWarningLimit: 2048,
    rolldownOptions: { input: process.env.PAGE + ".html" },
  },
}
`

function pageHtml(page: string): string {
  return `<!doctype html><canvas></canvas><script type="module" src="./${page}.js"></script>\n`
}

function scriptBytes(dir: string): number {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".js"))
    .reduce((sum, file) => sum + statSync(join(dir, file)).size, 0)
}

const work = mkdtempSync(join(tmpdir(), "mellowcad-hosts-"))
try {
  run("npm", ["run", "--silent", "build", "-w", "cad"], ROOT)
  run("npm", ["run", "--silent", "check", "-w", "cad"], ROOT)
  const packed = JSON.parse(
    run(
      "npm",
      ["pack", "-w", "cad", "--json", "--pack-destination", work],
      ROOT
    )
  ) as { filename: string }[]
  const tarball = join(work, packed[0].filename)

  const host = join(work, "host")
  write(host, {
    "package.json": JSON.stringify({ private: true, type: "module" }),
    "node.mjs": NODE_HOST,
    "typed.ts": TYPED_HOST,
    "tsconfig.json": TSCONFIG,
    "vite.config.mjs": VITE_CONFIG,
    ...Object.fromEntries(
      Object.entries(PAGES).flatMap(([page, script]) => [
        [`${page}.html`, pageHtml(page)],
        [`${page}.js`, script],
      ])
    ),
  })
  run(
    "npm",
    ["install", "--no-audit", "--no-fund", tarball, ...HOST_TOOLS],
    host
  )

  process.stdout.write(run("node", ["node.mjs"], host))
  run("npx", ["tsc", "-p", "."], host)
  console.log("tsc: ok")
  for (const page of Object.keys(PAGES)) {
    execFileSync("npx", ["vite", "build"], {
      cwd: host,
      env: { ...process.env, PAGE: page },
      stdio: ["ignore", "ignore", "inherit"],
    })
  }
  const island = scriptBytes(join(host, "out/island"))
  if (island >= ISLAND_MAX_BYTES) {
    throw new Error(`vite: the island page ships ${island} B of script`)
  }
  console.log(
    `vite: ok (island ${island} B, engine ${scriptBytes(join(host, "out/engine"))} B)`
  )
} finally {
  if (process.env.KEEP) console.log(`hosts kept in ${work}`)
  else rmSync(work, { recursive: true, force: true })
}
