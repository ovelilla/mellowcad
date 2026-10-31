/**
 * The English each translation was made from, recorded key by key beside it
 * in `translated-from/<tag>.json`, for the three catalogs: the site's, the
 * editor's and the engine's. A key whose English has changed since is stale,
 * and `i18n/freshness.test.ts` lists it with the English it had and has.
 *
 * The last step of `npm run locales`: it records a newly translated key with
 * today's English and drops one no longer translated, but never moves a stale
 * key forward on its own — only once someone has read it and named it:
 *
 *   npm run locales -- --reviewed es:TopBar.save es:interface.tool.line
 *
 * WHY a folder of its own: next-intl infers the site's languages from the
 * `*.json` files in `messages/`, and the compilers read their tags the same way.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

export const CATALOG_DIRS = [
  "messages",
  "packages/editor/src/locales",
  "cad/locales",
] as const

export const RECORD_DIR = "translated-from"

/** A message, a keyword's word, or a command's names and aliases. */
export type Leaf = string | readonly string[]
type Catalog = { readonly [key: string]: Leaf | Catalog }
export type SourceRecord = Readonly<Record<string, Leaf>>

/** Every leaf of a catalog, by its dotted key. */
export function leaves(tree: Catalog, path = ""): Map<string, Leaf> {
  const out = new Map<string, Leaf>()
  for (const [key, value] of Object.entries(tree)) {
    const at = path === "" ? key : `${path}.${key}`
    if (typeof value === "string" || Array.isArray(value)) out.set(at, value)
    else for (const entry of leaves(value as Catalog, at)) out.set(...entry)
  }
  return out
}

const same = (a: Leaf, b: Leaf) => JSON.stringify(a) === JSON.stringify(b)

function readJson<T>(file: string, fallback: T): T {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : fallback
}

export function translationTags(dir: string): string[] {
  return readdirSync(resolve(ROOT, dir))
    .filter((file) => file.endsWith(".json") && file !== "en.json")
    .map((file) => file.slice(0, -".json".length))
}

export const readLeaves = (dir: string, tag: string) =>
  leaves(readJson(resolve(ROOT, dir, `${tag}.json`), {}))

export const recordFile = (dir: string, tag: string) =>
  `${dir}/${RECORD_DIR}/${tag}.json`

export const readRecord = (dir: string, tag: string): SourceRecord =>
  readJson(resolve(ROOT, recordFile(dir, tag)), {})

/** The record files of a catalog, by tag: one per translation, no more. */
export function recordTags(dir: string): string[] {
  const records = resolve(ROOT, dir, RECORD_DIR)
  if (!existsSync(records)) return []
  return readdirSync(records).map((file) => file.slice(0, -".json".length))
}

export interface Freshness {
  /** Translated keys with no English recorded: `npm run locales` adds them. */
  readonly unrecorded: string[]
  /** Recorded keys no longer translated, or gone from English. */
  readonly orphaned: string[]
  readonly stale: { key: string; was: Leaf; now: Leaf }[]
}

export function freshness(
  english: ReadonlyMap<string, Leaf>,
  translation: ReadonlyMap<string, Leaf>,
  record: SourceRecord
): Freshness {
  const translated = [...translation.keys()].filter((key) => english.has(key))
  const unrecorded = translated.filter((key) => !(key in record))
  const orphaned = Object.keys(record).filter(
    (key) => !translation.has(key) || !english.has(key)
  )
  const stale = translated
    .filter((key) => key in record && !same(record[key], english.get(key)!))
    .map((key) => ({ key, was: record[key], now: english.get(key)! }))
  return { unrecorded, orphaned, stale }
}

/**
 * The record after a run: every translated key English has, in the
 * translation's order, with the English already recorded unless `reviewed`
 * names it — and today's English for a key never recorded.
 */
export function nextRecord(
  english: ReadonlyMap<string, Leaf>,
  translation: ReadonlyMap<string, Leaf>,
  record: SourceRecord,
  reviewed: (key: string) => boolean
): SourceRecord {
  return Object.fromEntries(
    [...translation.keys()]
      .filter((key) => english.has(key))
      .map((key) => [
        key,
        key in record && !reviewed(key) ? record[key] : english.get(key)!,
      ])
  )
}

/** One key a line, so a review's diff shows the keys it moved. */
export function serializeRecord(record: SourceRecord): string {
  const rows = Object.entries(record).map(
    ([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`
  )
  return rows.length === 0 ? "{}\n" : `{\n${rows.join(",\n")}\n}\n`
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [flag, ...named] = process.argv.slice(2)
  if (flag !== undefined && (flag !== "--reviewed" || named.length === 0)) {
    console.error("usage: npm run locales [-- --reviewed <tag>:<key> …]")
    process.exit(1)
  }
  const unknown = new Set(named)
  for (const dir of CATALOG_DIRS) {
    const english = readLeaves(dir, "en")
    for (const tag of translationTags(dir)) {
      const file = recordFile(dir, tag)
      const text = serializeRecord(
        nextRecord(english, readLeaves(dir, tag), readRecord(dir, tag), (key) =>
          unknown.delete(`${tag}:${key}`)
        )
      )
      if (existsSync(resolve(ROOT, file))) {
        if (readFileSync(resolve(ROOT, file), "utf8") === text) continue
      } else mkdirSync(resolve(ROOT, dir, RECORD_DIR), { recursive: true })
      writeFileSync(resolve(ROOT, file), text)
      console.log(file)
    }
  }
  if (unknown.size > 0) {
    console.error(`No translation has: ${[...unknown].join(", ")}`)
    process.exitCode = 1
  }
}
