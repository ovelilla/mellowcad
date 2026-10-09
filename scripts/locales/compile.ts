/**
 * Compiles the engine's catalogs, `cad/locales/<tag>.json`, into the modules
 * the engine imports, `cad/locales/<tag>.ts`: every ICU message becomes
 * icu-minify's compact form, so the browser never ships a message parser.
 * `names`, `keywords` and `promptKeywords` are vocabulary and pass through
 * untouched.
 *
 * Run after editing a catalog:  npm run locales
 * (Node runs the TypeScript directly; the outputs are committed, and a test
 * compiles them again and fails on any drift.)
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import compile from "icu-minify/compile"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
export const LOCALES_DIR = resolve(ROOT, "cad/locales")

type Json = string | readonly Json[] | { readonly [key: string]: Json }

/** Subtrees of `commands` that are words, not messages. */
const VOCABULARY = new Set(["names", "keywords", "promptKeywords"])

/**
 * Where a missing entry falls back to its own key: a keyword's global word is
 * its id, and a linetype or hatch pattern without a display name shows its id.
 * English is the global language, so there an entry equal to its key says
 * nothing the engine does not already know — it stays in the source, as the
 * inventory the other languages translate, and is left out of the module the
 * browser loads.
 */
const KEY_FALLBACK = new Set([
  "commands.keywords",
  "commands.promptKeywords",
  "interface.linetype",
  "interface.hatchPattern",
])

function withoutIdentities(node: Json, depth: number): Json | undefined {
  if (typeof node === "string" || Array.isArray(node)) return node
  const entries = Object.entries(node).flatMap(([key, value]) => {
    if (depth === 0 && value === key) return []
    const kept = depth === 0 ? value : withoutIdentities(value, depth - 1)
    return kept === undefined ? [] : [[key, kept] as const]
  })
  return entries.length === 0 ? undefined : Object.fromEntries(entries)
}

/** English's source without the entries that only restate their key. */
function shippedEnglish(source: Record<string, Json>): Record<string, Json> {
  const copy = structuredClone(source) as Record<string, Record<string, Json>>
  for (const path of KEY_FALLBACK) {
    const [branch, key] = path.split(".")
    // Keywords are one level deeper: a table per command, or per prompt.
    const kept = withoutIdentities(
      copy[branch][key],
      key === "keywords" || key === "promptKeywords" ? 1 : 0
    )
    if (kept === undefined) delete copy[branch][key]
    else copy[branch][key] = kept
  }
  return copy
}

function compileTree(node: Json, path: string): unknown {
  if (typeof node === "string") {
    try {
      return compile(node)
    } catch (error) {
      throw new Error(`${path}: ${(error as Error).message}`)
    }
  }
  if (Array.isArray(node)) {
    throw new Error(`${path}: a message is a string, not a list`)
  }
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      compileTree(value, `${path}.${key}`),
    ])
  )
}

/** The catalog with every message compiled and its vocabulary as written. */
export function compileCatalog(tag: string, source: Record<string, Json>) {
  const { interface: ui, commands } = source as {
    interface: Json
    commands?: Record<string, Json>
  }
  return {
    tag,
    interface: compileTree(ui ?? {}, `${tag}.interface`),
    ...(commands && {
      commands: Object.fromEntries(
        Object.entries(commands).map(([key, value]) => [
          key,
          VOCABULARY.has(key)
            ? value
            : compileTree(value, `${tag}.commands.${key}`),
        ])
      ),
    }),
  }
}

/** The text of `cad/locales/<tag>.ts`, exactly as it is committed. */
export function localeModule(
  tag: string,
  source: Record<string, Json>
): string {
  const catalog = compileCatalog(
    tag,
    tag === "en" ? shippedEnglish(source) : source
  )
  // English is the complete catalog every other one falls back on.
  const type = tag === "en" ? "EngineCatalog" : "EngineLocale"
  return [
    `// Generated from ${tag}.json by \`npm run locales\`. Do not edit.`,
    `import type { ${type} } from "./types"`,
    "",
    `export const ${tag}: ${type} = ${JSON.stringify(catalog, null, 2)}`,
    "",
  ].join("\n")
}

export function catalogTags(): string[] {
  return readdirSync(LOCALES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length))
}

export function readCatalog(tag: string): Record<string, Json> {
  return JSON.parse(readFileSync(resolve(LOCALES_DIR, `${tag}.json`), "utf8"))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  for (const tag of catalogTags()) {
    writeFileSync(
      resolve(LOCALES_DIR, `${tag}.ts`),
      localeModule(tag, readCatalog(tag))
    )
    console.log(`cad/locales/${tag}.ts`)
  }
}
