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
 *   @mellowcad/react   the Vite example without the editor type-checks,
 *                      bundles and renders the canvas in Node; the Next one
 *                      prerenders it from a server page
 *   @mellowcad/editor  examples/editor-vite type-checks, bundles with
 *                      `styles.css` and renders in Node; examples/editor-next
 *                      prerenders a server page that hands a slot a client
 *                      component and turns another off, with `styles.css` and
 *                      the host's Tailwind, under Turbopack and under webpack
 *
 * Run from a package's folder, as its `check:hosts` (which its
 * `prepublishOnly` runs):  npm run check:hosts -w packages/editor
 * It needs the network (the registry, and Google Fonts for next/font), so it
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
  "@mellowcad/react": "packages/react",
  "@mellowcad/editor": "packages/editor",
}

const ISLAND_MAX_BYTES = 1024

const EDITOR_ROOT = "[data-mellowcad-editor]"

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
  /** Our packages it should not depend on (the editor, in react's hosts). */
  readonly without?: readonly string[]
  /** Runs in the installed host; throws on a failure. */
  readonly check: (dir: string) => string
}

/**
 * WHY without `npm_config_dry_run`: `npm publish --dry-run` exports it to its
 * lifecycle scripts, and every `npm pack` and `npm install` here, attw's
 * included, would then write and install nothing.
 */
const INHERITED: NodeJS.ProcessEnv = { ...process.env }
delete INHERITED.npm_config_dry_run

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
      env: { ...INHERITED, NEXT_TELEMETRY_DISABLED: "1", ...env },
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

function text(dir: string, extension: string): string {
  return filesUnder(dir, extension)
    .map((file) => readFileSync(file, "utf8"))
    .join("\n")
}

function expectIn(where: string, haystack: string, needle: string): void {
  if (!haystack.includes(needle))
    throw new Error(`${where}: no ${JSON.stringify(needle)}`)
}

function expectNotIn(where: string, haystack: string, needle: string): void {
  if (haystack.includes(needle))
    throw new Error(`${where}: ${JSON.stringify(needle)} should be gone`)
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

/**
 * React's own hosts are the editor's examples with the editor taken out, and
 * the Vite one's page is the README's first snippet: it is what a reader
 * copies, so it is what type-checks and bundles against the tarball.
 */
function readmeSnippet(file: string): string {
  const [, snippet] =
    readFileSync(join(ROOT, file), "utf8").match(/^```tsx\n([\s\S]*?)^```$/m) ??
    []
  if (!snippet) throw new Error(`${file}: no tsx snippet`)
  return snippet
}

const REACT_RENDER = `import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { CadCanvas, useEditorState } from "@mellowcad/react"

function App() {
  const state = useEditorState(null)
  return createElement(CadCanvas, { "aria-label": String(state) })
}
assert.match(renderToString(createElement(App)), /<canvas aria-label="null"/)
`

const REACT_VITE: Host = {
  name: "react-vite",
  example: "editor-vite",
  without: ["@mellowcad/editor"],
  files: {
    "src/main.tsx": readmeSnippet("packages/react/README.md"),
    "render.mjs": REACT_RENDER,
  },
  check(dir) {
    run("npm", ["run", "build"], dir)
    run("node", ["render.mjs"], dir)
    return "react-vite: ok"
  },
}

const REACT_NEXT: Host = {
  name: "react-next",
  example: "editor-next",
  without: ["@mellowcad/editor"],
  files: {
    "app/host-top-bar.tsx": null,
    "app/layout.tsx": `import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`,
    // A server page renders the canvas, a client component of the package.
    "app/page.tsx": `import { CadCanvas } from "@mellowcad/react"

export default function Page() {
  return <CadCanvas aria-label="Drawing" />
}
`,
  },
  check(dir) {
    run("npx", ["next", "build"], dir)
    const html = readFileSync(join(dir, ".next/server/app/index.html"), "utf8")
    expectIn("react-next", html, `<canvas aria-label="Drawing"`)
    return "react-next: ok"
  },
}

const EDITOR_RENDER = `import assert from "node:assert/strict"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { CadEditor } from "@mellowcad/editor"
import { es } from "@mellowcad/editor/locales/es"
import { es as engineEs } from "@mellowcad/engine/locales/es"

const html = renderToString(
  createElement(CadEditor, { editorLocale: es, engineLocale: engineEs })
)
assert.match(html, /<div data-mellowcad-editor="" lang="es" dir="ltr"/)
assert.match(html, /<canvas/)
`

const EDITOR_VITE: Host = {
  name: "editor-vite",
  example: "editor-vite",
  files: { "render.mjs": EDITOR_RENDER },
  check(dir) {
    run("npm", ["run", "build"], dir)
    expectIn("editor-vite", text(join(dir, "dist"), ".css"), EDITOR_ROOT)
    run("node", ["render.mjs"], dir)
    return "editor-vite: ok"
  },
}

// Both of Next's bundlers: each resolves the package's "use client" modules
// and its stylesheet its own way. Neither drops the stylesheet under
// `sideEffects: false` (Next marks CSS as a side effect; measured), which a
// bare webpack 5 does: the list in its package.json is for that host.
const EDITOR_NEXT: Host = {
  name: "editor-next",
  example: "editor-next",
  check(dir) {
    for (const bundler of ["--turbopack", "--webpack"]) {
      const where = `editor-next ${bundler}`
      rmSync(join(dir, ".next"), { recursive: true, force: true })
      run("npx", ["next", "build", bundler], dir)
      const html = readFileSync(
        join(dir, ".next/server/app/index.html"),
        "utf8"
      )
      // The pieces paint once the engine exists, after mount: the prerender
      // has the zones and the server page's payload names the client
      // component handed to the top bar's.
      expectIn(where, html, "data-mellowcad-editor")
      expectIn(where, html, "[grid-area:top]")
      expectNotIn(where, html, "[grid-area:panel]")
      expectIn(where, html, 'HostTopBar\\"]')
      expectIn(where, text(join(dir, ".next/static"), ".js"), "My drawing app")
      const css = text(join(dir, ".next/static"), ".css")
      expectIn(where, css, EDITOR_ROOT)
      expectIn(where, css, "aria-pressed\\:bg-white\\/15")
    }
    return "editor-next: ok"
  },
}

const HOSTS: Record<string, readonly Host[]> = {
  "@mellowcad/engine": [ENGINE_NODE, ENGINE_FOREIGN],
  "@mellowcad/react": [REACT_VITE, REACT_NEXT],
  "@mellowcad/editor": [EDITOR_VITE, EDITOR_NEXT],
}

/** The host's package.json with our packages taken from their tarballs. */
function installable(
  manifest: Manifest,
  tarballs: Record<string, string>,
  without: readonly string[]
): Manifest {
  const dependencies = { ...manifest.dependencies }
  for (const name of without) delete dependencies[name]
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
      tarballs,
      host.without ?? []
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
