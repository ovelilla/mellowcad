/**
 * Sweeps the engine's catalogs against AutoCAD's string tables: each English string of
 * `cad/locales/en.json` is looked up in the 2027 English table, and the translated string of the
 * same key is compared with the 2027 string of the ids found in the language's table. Prints
 * Markdown.
 *
 *   node scripts/research/catalog-sweep.mjs                    every key of `commands`, Spanish
 *   node scripts/research/catalog-sweep.mjs --lang pt-BR       another language's catalog
 *   node scripts/research/catalog-sweep.mjs --from <file>...   only the keys these files name
 *   node scripts/research/catalog-sweep.mjs --interface        `interface` too
 *
 * A prompt is matched up to its keyword list, as the catalog holds it; `%s`/`%d` and ICU
 * arguments match one another. States: ok; lang-2027 (the translation is the release's language
 * pack, reworded by the 2027 update); lang-differs; lang-several (one English head, several
 * translated ones: check which id each prompt is); en-2027 (the English is 2023's, reworded
 * since); en-near (the table's differs in case, punctuation or spacing); plural (an ICU plural,
 * compared by hand); no-source (composed, or worded without a table: its coverage entry should
 * say unverified). `research/strings/previous/` holds the tables before the update. See
 * .claude/skills/command-review/annex-catalogs.md.
 */
import { existsSync, readFileSync } from "node:fs"

import {
  cut,
  forms,
  fromCatalog,
  fromTable,
  index,
  language,
  leaves,
  loose,
  orWords,
  pattern,
  patterns,
  root,
  table,
  translatedFile,
  valueAt,
} from "./tables.mjs"

const { lang, rest: args } = language(process.argv.slice(2))
const withInterface = args.includes("--interface")
const from = args.includes("--from")
  ? args.slice(args.indexOf("--from") + 1).filter((a) => !a.startsWith("--"))
  : []

const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"))
const catalogPath = `cad/locales/${lang}.json`
if (!existsSync(new URL(catalogPath, root))) {
  console.error(
    `No ${catalogPath}: a language without a catalog starts from propose-commands.mjs.`
  )
  process.exit(1)
}
const en = read("cad/locales/en.json")
const translated = read(catalogPath)
const SKIPPED = new Set(["names", "keywords", "promptKeywords", "format"])

const sections = Object.keys(en.commands).filter((s) => !SKIPPED.has(s))
let entries = sections.flatMap((s) =>
  leaves(en.commands[s], `commands.${s}`, [])
)
if (withInterface) entries.push(...leaves(en.interface, "interface", []))
if (from.length) {
  const named = new Set()
  for (const file of from)
    for (const [, word] of readFileSync(file, "utf8").matchAll(
      /["'`](\w+)["'`]/g
    ))
      named.add(word)
  entries = entries.filter(([key]) => named.has(key.split(".").at(-1)))
}

const en27 = table("all_en.tsv")
const tr27 = table(translatedFile(lang))
const enOld = table("previous/all_en.tsv")
const trOld = table(`previous/all_${lang}.tsv`)
const en27Index = index(en27)
const enOldIndex = index(enOld)
const en27Loose = index(en27, loose)
const en27Patterns = patterns(en27)
const or = orWords(en27, tr27)

const translation = (tableMap, id, english) =>
  tableMap.has(id)
    ? cut(tableMap.get(id), en27.get(id) ?? enOld.get(id) ?? "", english, or)
    : undefined

const results = []
for (const [key, english] of entries) {
  const translatedText = valueAt(translated, key)
  const row = { key, english, translation: translatedText }
  if (/, plural,/.test(english)) {
    results.push({ ...row, state: "plural" })
    continue
  }
  const enForm = fromCatalog(english)
  const trForm =
    typeof translatedText === "string" ? fromCatalog(translatedText) : undefined
  const ids = en27Index.get(enForm) ?? []
  if (ids.length) {
    const now = ids.map((id) => translation(tr27, id, enForm))
    const before = ids.map((id) => translation(trOld, id, enForm))
    const variants = [...new Set(now)]
    // One English, several translations: the catalog holds one, so which id each prompt is matters.
    const state = !now.includes(trForm)
      ? before.includes(trForm)
        ? "lang-2027"
        : "lang-differs"
      : variants.length > 1
        ? "lang-several"
        : "ok"
    const tables = variants.map(
      (text) => `${text} (${ids.filter((_, i) => now[i] === text).join(", ")})`
    )
    results.push({ ...row, state, ids, tables })
    continue
  }
  const oldIds = enOldIndex.get(enForm) ?? []
  if (oldIds.length) {
    results.push({
      ...row,
      state: "en-2027",
      ids: oldIds,
      tables: oldIds.map(
        (id) =>
          `${fromTable(en27.get(id) ?? "")} / ${fromTable(tr27.get(id) ?? "")}`
      ),
    })
    continue
  }
  // Most of the sentence must be the table's own words: "%s is too large" is no source for
  // "Fillet radius is too large".
  const matched = en27Patterns.filter(
    ({ regex, literal }) =>
      literal >= 0.6 * enForm.replace(/\{\}/g, "").length && regex.test(enForm)
  )
  if (matched.length) {
    const ids = [...new Set(matched.map(({ id }) => id))]
    const translatedOf = (tableMap) =>
      ids.flatMap((id) =>
        tableMap.has(id) ? forms(tableMap.get(id)).map(pattern) : []
      )
    const fits = (regexes) =>
      trForm !== undefined && regexes.some((p) => p.test(trForm))
    results.push({
      ...row,
      state: fits(translatedOf(tr27))
        ? "ok"
        : fits(translatedOf(trOld))
          ? "lang-2027"
          : "lang-differs",
      ids,
      tables: ids.map((id) => fromTable(tr27.get(id) ?? "")),
    })
    continue
  }
  const nearIds = en27Loose.get(loose(enForm)) ?? []
  if (nearIds.length) {
    results.push({
      ...row,
      state: "en-near",
      ids: nearIds,
      tables: [
        ...new Set(
          nearIds.map(
            (id) =>
              `${fromTable(en27.get(id))} / ${fromTable(tr27.get(id) ?? "")}`
          )
        ),
      ],
    })
    continue
  }
  results.push({ ...row, state: "no-source" })
}

const ORDER = [
  "lang-2027",
  "en-2027",
  "lang-differs",
  "lang-several",
  "en-near",
  "plural",
  "no-source",
  "ok",
]
const cell = (text) =>
  String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "⏎")
console.log(`# Catalog sweep\n`)
console.log(
  ORDER.map((s) => `${s}: ${results.filter((r) => r.state === s).length}`).join(
    " · "
  ) + "\n"
)
for (const state of ORDER.filter((s) => s !== "ok")) {
  const rows = results.filter((r) => r.state === state)
  if (!rows.length) continue
  console.log(`## ${state}\n`)
  console.log(`| Key | Catalog en | Catalog ${lang} | Table ids | 2027 table |`)
  console.log("| --- | --- | --- | --- | --- |")
  for (const r of rows)
    console.log(
      `| ${cell(r.key)} | ${cell(r.english)} | ${cell(r.translation)} | ${cell(r.ids?.slice(0, 4).join(", "))} | ${cell(r.tables?.join(" · "))} |`
    )
  console.log()
}
