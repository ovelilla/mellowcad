/**
 * What the research scripts share: the language a run is for, AutoCAD's string tables in
 * `research/strings/`, and how a catalog string is matched against them.
 *
 * See .claude/skills/autocad-research/SKILL.md.
 */
import { existsSync, readFileSync } from "node:fs"

export const root = new URL("../../", import.meta.url)
export const strings = new URL("research/strings/", root)

// The cultures of AutoCAD 2027's language packs, as its install folders name them.
export const CULTURES = [
  "cs-CZ",
  "de-DE",
  "en-US",
  "es-ES",
  "fr-FR",
  "hu-HU",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "zh-CN",
  "zh-TW",
]

/**
 * Takes `--lang <tag>` out of the arguments. The tag is BCP 47, the one the catalogs and
 * `i18n/routing.ts` use (`es`, `pt-BR`), and names the tables (`all_pt-BR.tsv`); Spanish is the
 * default, so a run without it is the Spanish one it always was.
 */
export function language(args) {
  const at = args.findIndex((a) => a === "--lang" || a.startsWith("--lang="))
  if (at < 0) return { lang: "es", rest: args }
  const inline = args[at].startsWith("--lang=")
  const tag = inline ? args[at].slice("--lang=".length) : args[at + 1]
  if (!tag || tag.startsWith("--")) {
    console.error("--lang takes a language tag: --lang pt-BR.")
    process.exit(1)
  }
  const [lang] = Intl.getCanonicalLocales(tag)
  return {
    lang,
    rest: args.filter((_, i) => i !== at && (inline || i !== at + 1)),
  }
}

// AutoCAD's culture for a tag: the same one, or the only culture of its language (`es` is
// es-ES, `pt` pt-BR); `zh` has two and needs its region.
export function cultureOf(lang) {
  const exact = CULTURES.find((c) => c.toLowerCase() === lang.toLowerCase())
  if (exact) return exact
  const ofLanguage = CULTURES.filter((c) => c.split("-")[0] === lang)
  if (ofLanguage.length === 1) return ofLanguage[0]
  console.error(
    ofLanguage.length
      ? `${lang} is ${ofLanguage.join(" or ")}: give the region.`
      : `AutoCAD 2027 has no language pack for ${lang} (${CULTURES.join(", ")}).`
  )
  process.exit(1)
}

// The language's merged table, which must have been extracted (extract-strings.mjs).
export function translatedFile(lang) {
  const file = `all_${lang}.tsv`
  if (!existsSync(new URL(file, strings))) {
    console.error(
      `No research/strings/${file}: extract it with scripts/research/extract-strings.mjs --lang ${lang}.`
    )
    process.exit(1)
  }
  return file
}

export function table(file) {
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
export const PRINTF =
  /%(\d+\$)?[-+ 0#]*(\d+|\*)?(\.(\d+|\*))?(l|ll|h|I64)?([sdifgSuxXc]|q\d?)|%\d/g
export const ICU_ARG =
  /\{\w+(, (number|select|date)[^{}]*(\{[^{}]*\}[^{}]*)*)?\}/g

export const tidy = (text) =>
  text.replace(/\s+/g, " ").trim().replace(/\s*:$/, "")
export const fromTable = (text) => tidy(text.replace(PRINTF, "{}"))
export const fromCatalog = (text) =>
  tidy(text.replace(/'<'/g, "<").replace(/''/g, "'").replace(ICU_ARG, "{}"))
// What precedes a keyword list or a default: the part a prompt id holds.
export const head = (text) => text.split(/ ?\[| <(?=[^>]*>?:?$)/)[0].trim()
// Case, punctuation and spacing aside: a near match is worth a look, never "ok".
export const loose = (text) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}{}]+/gu, " ")
    .trim()

// A string whole, up to its keyword list, and without the "or" before the list: English's, or
// the language's `orWords` for a translated table.
export function forms(text, or = / or$/) {
  const full = fromTable(text)
  const cut = head(full)
  return [...new Set([full, cut, cut.replace(or, "")])]
}

export function index(tableMap, normal = (form) => form) {
  const byForm = new Map()
  for (const [id, text] of tableMap) {
    for (const form of new Set(forms(text).map(normal))) {
      if (!byForm.has(form)) byForm.set(form, [])
      byForm.get(form).push(id)
    }
  }
  return byForm
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// A table string with an argument mid-sentence ("about %s axis") matches the catalog's with the
// argument filled in ("about X axis"); an argument may also stand for nothing ("text%s:").
export const pattern = (form) =>
  new RegExp(`^${form.split("{}").map(escape).join("(.*?)")}$`)

export function patterns(tableMap) {
  return [...tableMap].flatMap(([id, text]) =>
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
}

/**
 * The words a language says "or" with before a keyword list (Spanish `o`, and `u` before an
 * o-sound), read from the tables: the last words of the translated prompts whose English ends in
 * "or", but the odd ones (1% or less) that end a prompt worded otherwise.
 */
export function orWords(englishTable, translatedTable) {
  const count = new Map()
  let prompts = 0
  for (const [id, text] of englishTable) {
    if (!/ or$/.test(head(fromTable(text))) || !translatedTable.has(id))
      continue
    prompts++
    const last = head(fromTable(translatedTable.get(id)))
      .split(" ")
      .at(-1)
    count.set(last, (count.get(last) ?? 0) + 1)
  }
  const words = [...count].filter(([, n]) => n > prompts / 100)
  return new RegExp(` (${words.map(([w]) => escape(w)).join("|")})$`)
}

// How an English table string was cut to match: whole, up to its keyword list, or without the
// "or" that leads into the list. The translation of the same id is cut the same way.
export function cut(text, englishTableText, english, or) {
  const full = fromTable(text)
  const englishFull = fromTable(englishTableText)
  if (englishFull === english) return full
  if (head(englishFull) === english) return head(full)
  return head(full).replace(or, "")
}

export function leaves(node, path, into) {
  if (typeof node === "string") into.push([path, node])
  else if (node && typeof node === "object")
    for (const [key, value] of Object.entries(node))
      leaves(value, path ? `${path}.${key}` : key, into)
  return into
}

export const valueAt = (catalog, key) =>
  key.split(".").reduce((node, part) => node?.[part], catalog)
