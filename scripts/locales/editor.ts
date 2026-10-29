/**
 * Compiles the editor's catalogs, `components/cad/locales/<tag>.json`, into
 * the modules it imports, `<tag>.ts`, as `compile.ts` compiles the engine's:
 * every message becomes icu-minify's compact form, so the browser never ships
 * a message parser. It also writes `values.ts`, what each message takes, read
 * off English, which types every call's arguments.
 *
 * Run after editing a catalog:  npm run locales
 * (the outputs are committed, and a test compiles them again and fails on any
 * drift.)
 */

import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { parse } from "@formatjs/icu-messageformat-parser"

import { compileTree } from "./compile.ts"
import { type Tree, flatten, signature } from "./icu.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
export const EDITOR_LOCALES_DIR = resolve(ROOT, "components/cad/locales")

/** The text of `components/cad/locales/<tag>.ts`, exactly as committed. */
export function editorModule(tag: string, source: Tree): string {
  // English is the complete catalog every other one falls back on.
  const type = tag === "en" ? "EditorCatalog" : "EditorLocale"
  const catalog = { tag, messages: compileTree(source, tag) }
  return [
    `// Generated from ${tag}.json by \`npm run locales\`. Do not edit.`,
    `import type { ${type} } from "./types"`,
    "",
    `export const ${tag}: ${type} = ${JSON.stringify(catalog, null, 2)}`,
    "",
  ].join("\n")
}

const TYPES: Record<string, string> = {
  number: "number",
  date: "Date",
  select: "string",
}

/**
 * The text of `components/cad/locales/values.ts`: for every English message
 * that takes something, each argument with its type and each rich tag. A bare
 * `{name}` is a string; a count is `{count, number}` or a plural.
 */
export function valuesModule(source: Tree): string {
  const rows = [...flatten(source)].flatMap(([key, message]) => {
    const fields = new Map<string, string>()
    for (const entry of signature(parse(message))) {
      if (entry.startsWith("<")) {
        fields.set(entry.slice(1, -1), "RichTag")
        continue
      }
      const [name, kind] = entry.split(":")
      // A typed use of an argument outranks a bare one in the same message.
      if (kind !== undefined || !fields.has(name)) {
        fields.set(name, kind === undefined ? "string" : TYPES[kind])
      }
    }
    if (fields.size === 0) return []
    const members = [...fields].map(([name, type]) => `${name}: ${type}`)
    return [`  ${JSON.stringify(key)}: { ${members.join("; ")} }`]
  })
  return [
    "// Generated from en.json by `npm run locales`. Do not edit.",
    'import type { ReactNode } from "react"',
    "",
    "/** A rich tag: renders the chunks of the message it wraps. */",
    "export type RichTag = (chunks: ReactNode) => ReactNode",
    "",
    "/** What each message takes, by its dotted key; one absent takes nothing. */",
    "export interface EditorValues {",
    ...rows,
    "}",
    "",
  ].join("\n")
}

export function editorTags(): string[] {
  return readdirSync(EDITOR_LOCALES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length))
}

export function readEditorCatalog(tag: string): Tree {
  return JSON.parse(
    readFileSync(resolve(EDITOR_LOCALES_DIR, `${tag}.json`), "utf8")
  )
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  for (const tag of editorTags()) {
    writeFileSync(
      resolve(EDITOR_LOCALES_DIR, `${tag}.ts`),
      editorModule(tag, readEditorCatalog(tag))
    )
    console.log(`components/cad/locales/${tag}.ts`)
  }
  writeFileSync(
    resolve(EDITOR_LOCALES_DIR, "values.ts"),
    valuesModule(readEditorCatalog("en"))
  )
  console.log("components/cad/locales/values.ts")
}
