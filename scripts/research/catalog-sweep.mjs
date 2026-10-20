/**
 * Sweeps the engine's catalogs against AutoCAD's string tables: each English string of
 * `cad/locales/en.json` is looked up in the 2027 English table, and the Spanish string of the
 * same key is compared with the 2027 Spanish string of the ids found. Prints Markdown.
 *
 *   node scripts/research/catalog-sweep.mjs                    every key of `commands`
 *   node scripts/research/catalog-sweep.mjs --from <file>...   only the keys these files name
 *   node scripts/research/catalog-sweep.mjs --interface        `interface` too
 *
 * A prompt is matched up to its keyword list, as the catalog holds it; `%s`/`%d` and ICU
 * arguments match one another. States: ok; es-2027 (the Spanish is the release's language pack,
 * reworded by the 2027 update); es-differs; es-several (one English head, several Spanish ones:
 * check which id each prompt is); en-2027 (the English is 2023's, reworded since); en-near (the
 * table's differs in case, punctuation or spacing); plural (an ICU plural, compared by hand);
 * no-source (composed, or worded without a table: its coverage entry should say unverified). `research/strings/previous/` holds the tables before the
 * update. See .claude/skills/command-review/annex-catalogs.md.
 */
import { existsSync, readFileSync } from "node:fs"

const root = new URL("../../", import.meta.url)
const strings = new URL("research/strings/", root)
const args = process.argv.slice(2)
const withInterface = args.includes("--interface")
const from = args.includes("--from")
  ? args.slice(args.indexOf("--from") + 1).filter((a) => !a.startsWith("--"))
  : []

function table(file) {
  const map = new Map()
  const url = new URL(file, strings)
  if (!existsSync(url)) return map
  for (const line of readFileSync(url, "utf8").split("\n")) {
    const tab = line.indexOf("\t")
    if (tab < 0) continue
    try {
      map.set(line.slice(0, tab), JSON.parse(line.slice(tab + 1)))
    } catch {
      // A line the extraction ran together (two strings on one line) is skipped.
    }
  }
  return map
}

// printf's conversions and AutoCAD's own `%q` (a length or angle in the drawing's units).
const PRINTF =
  /%(\d+\$)?[-+ 0#]*(\d+|\*)?(\.(\d+|\*))?(l|ll|h|I64)?([sdifgSuxXc]|q\d?)|%\d/g
const ICU_ARG = /\{\w+(, (number|select|date)[^{}]*(\{[^{}]*\}[^{}]*)*)?\}/g

const tidy = (text) => text.replace(/\s+/g, " ").trim().replace(/\s*:$/, "")
const fromTable = (text) => tidy(text.replace(PRINTF, "{}"))
const fromCatalog = (text) =>
  tidy(text.replace(/'<'/g, "<").replace(/''/g, "'").replace(ICU_ARG, "{}"))
// What precedes a keyword list or a default: the part a prompt id holds.
const head = (text) => text.split(/ ?\[| <(?=[^>]*>?:?$)/)[0].trim()
// Case, punctuation and spacing aside: a near match is worth a look, never "ok".
const loose = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}{}]+/gu, " ")
    .trim()

function forms(text) {
  const full = fromTable(text)
  const cut = head(full)
  return [...new Set([full, cut, cut.replace(/ (or|o|u)$/, "")])]
}

function index(tableMap, normal = (form) => form) {
  const byForm = new Map()
  for (const [id, text] of tableMap) {
    for (const form of new Set(forms(text).map(normal))) {
      if (!byForm.has(form)) byForm.set(form, [])
      byForm.get(form).push(id)
    }
  }
  return byForm
}

function leaves(node, path, into) {
  if (typeof node === "string") into.push([path, node])
  else if (node && typeof node === "object")
    for (const [key, value] of Object.entries(node))
      leaves(value, path ? `${path}.${key}` : key, into)
  return into
}

const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"))
const en = read("cad/locales/en.json")
const es = read("cad/locales/es.json")
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
const valueAt = (catalog, key) =>
  key.split(".").reduce((node, part) => node?.[part], catalog)

const en27 = table("all_en.tsv")
const es27 = table("all_es.tsv")
const enOld = table("previous/all_en.tsv")
const esOld = table("previous/all_es.tsv")
const en27Index = index(en27)
const enOldIndex = index(enOld)
const en27Loose = index(en27, loose)

// A table string with an argument mid-sentence ("about %s axis") matches the catalog's with the
// argument filled in ("about X axis"); an argument may also stand for nothing ("text%s:").
const pattern = (form) =>
  new RegExp(
    `^${form
      .split("{}")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("(.*?)")}$`
  )
const en27Patterns = [...en27].flatMap(([id, text]) =>
  forms(text)
    .filter(
      (form) => form.includes("{}") && form.replace(/\{\}/g, "").length > 8
    )
    .map((form) => ({
      id,
      regex: pattern(form),
      literal: form.replace(/\{\}/g, "").length,
    }))
)

// The Spanish of an id, cut the way its English matched: whole, up to its keyword list, or
// without the "or" that leads into the list.
function spanish(tableMap, id, english) {
  const text = tableMap.get(id)
  if (text === undefined) return undefined
  const full = fromTable(text)
  const englishFull = fromTable(en27.get(id) ?? enOld.get(id) ?? "")
  if (englishFull === english) return full
  if (head(englishFull) === english) return head(full)
  return head(full).replace(/ [ou]$/, "")
}

const results = []
for (const [key, english] of entries) {
  const spanishText = valueAt(es, key)
  const row = { key, english, spanish: spanishText }
  if (/, plural,/.test(english)) {
    results.push({ ...row, state: "plural" })
    continue
  }
  const enForm = fromCatalog(english)
  const esForm =
    typeof spanishText === "string" ? fromCatalog(spanishText) : undefined
  const ids = en27Index.get(enForm) ?? []
  if (ids.length) {
    const now = ids.map((id) => spanish(es27, id, enForm))
    const before = ids.map((id) => spanish(esOld, id, enForm))
    const variants = [...new Set(now)]
    // One English, several Spanish: the catalog holds one, so which id each prompt is matters.
    const state = !now.includes(esForm)
      ? before.includes(esForm)
        ? "es-2027"
        : "es-differs"
      : variants.length > 1
        ? "es-several"
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
          `${fromTable(en27.get(id) ?? "")} / ${fromTable(es27.get(id) ?? "")}`
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
    const spanishOf = (tableMap) =>
      ids.flatMap((id) =>
        tableMap.has(id) ? forms(tableMap.get(id)).map(pattern) : []
      )
    const fits = (patterns) =>
      esForm !== undefined && patterns.some((p) => p.test(esForm))
    results.push({
      ...row,
      state: fits(spanishOf(es27))
        ? "ok"
        : fits(spanishOf(esOld))
          ? "es-2027"
          : "es-differs",
      ids,
      tables: ids.map((id) => fromTable(es27.get(id) ?? "")),
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
              `${fromTable(en27.get(id))} / ${fromTable(es27.get(id) ?? "")}`
          )
        ),
      ],
    })
    continue
  }
  results.push({ ...row, state: "no-source" })
}

const ORDER = [
  "es-2027",
  "en-2027",
  "es-differs",
  "es-several",
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
  console.log("| Key | Catalog en | Catalog es | Table ids | 2027 table |")
  console.log("| --- | --- | --- | --- | --- |")
  for (const r of rows)
    console.log(
      `| ${cell(r.key)} | ${cell(r.english)} | ${cell(r.spanish)} | ${cell(r.ids?.slice(0, 4).join(", "))} | ${cell(r.tables?.join(" · "))} |`
    )
  console.log()
}
