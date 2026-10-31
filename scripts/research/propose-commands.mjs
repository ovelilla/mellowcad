/**
 * Proposes a language's command language (the `commands` of `cad/locales/<tag>.json`) from
 * AutoCAD's tables: each English entry is found in the English table and given the string of
 * the same id in the language's, read like this:
 *
 * - a prompt, message or label: by its text, cut and with its ICU arguments as English's;
 * - `names`: the command-name string of the same id, and the aliases `acad_<tag>.pgp` gives it;
 * - `keywords` and `promptKeywords`: the initget strings (`Cerrar desHacer _Close Undo`) that
 *   offer most of the command's or prompt's keywords, word by word;
 * - `keywordLabels`: the word at the same place of the same keyword list.
 *
 *   node scripts/research/propose-commands.mjs --lang pt-BR
 *
 * It writes `research/proposals/<tag>.json`, only the entries one table string settles, and
 * `research/proposals/<tag>.md`, every entry with its ids: those it proposes, to check, and those
 * it leaves out, to word by hand (several: strings that disagree; arguments: printf conversions
 * that do not line up; select: an ICU select, whose words are English's; partial: a match by
 * pattern, loosely or capitalised otherwise; plural; no-source). Nothing is copied unread: the
 * console beats the table (skill `autocad-research`), and a proposal is where a review starts.
 * Gitignored, because it is Autodesk's text.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"

import {
  cut,
  fromCatalog,
  fromTable,
  ICU_ARG,
  index,
  language,
  leaves,
  loose,
  orWords,
  PRINTF,
  patterns,
  root,
  strings,
  table,
  translatedFile,
} from "./tables.mjs"

const { lang } = language(process.argv.slice(2))
const en = JSON.parse(
  readFileSync(new URL("cad/locales/en.json", root), "utf8")
).commands
const enTable = table("all_en.tsv")
const trTable = table(translatedFile(lang))
const enIndex = index(enTable)
const enLoose = index(enTable, loose)
const enPatterns = patterns(enTable)
const or = orWords(enTable, trTable)

const proposal = {}
const rows = []
function settle(section, key, english, candidates) {
  const texts = [...new Set(candidates.map(({ text }) => text))]
  const ids = candidates.map(({ id }) => id)
  const state =
    texts.length === 1 ? "proposed" : texts.length ? "several" : "no-source"
  rows.push({ section, key, english, state, ids, candidates })
  if (state !== "proposed") return
  const path = [section, ...key.split(".")]
  let node = proposal
  for (const part of path.slice(0, -1)) node = node[part] ??= {}
  node[path.at(-1)] = texts[0]
}

// ICU's syntax characters in a table string are quoted; `'` only where ICU would read it.
const quoteIcu = (text) =>
  text.replace(/'(?=[{}<#|'])/g, "''").replace(/[{}<]/g, (c) => `'${c}'`)

// Numbers a table string's printf conversions, in order or where `%2$s` puts them.
const numbered = (text) => {
  let next = 0
  return text.replace(PRINTF, (conversion) => {
    const at = /^%(\d+)\$/.exec(conversion)
    return `\u0001${at ? Number(at[1]) - 1 : next++}\u0001`
  })
}
const holes = (text) =>
  [...text.matchAll(/\u0001(\d+)\u0001/g)].map(([, n]) => n)

// How English's catalog may hold its table string whole, from the least change to the most: the
// line breaks around it dropped, its spaces too, its colon too.
const TRIMS = [
  (text) => text.replace(/^[\r\n]+|[\r\n]+$/g, ""),
  (text) => text.trim(),
  (text) => text.trim().replace(/\s*:$/, ""),
]

/**
 * The translated string of `id` as the catalog would hold `english`, with English's ICU
 * arguments in its printf conversions: trimmed as English's is, layout and all, or else cut where
 * English's table string was cut. Undefined when the conversions do not line up.
 */
function render(id, english) {
  const englishTable = numbered(enTable.get(id))
  const translated = numbered(trTable.get(id))
  if (holes(translated).sort().join() !== holes(englishTable).sort().join())
    return undefined
  const args = [...english.matchAll(ICU_ARG)].map(([arg]) => arg)
  const fill = (text) =>
    quoteIcu(text).replace(/\u0001(\d+)\u0001/g, (whole, n) => args[n] ?? whole)
  const trim = TRIMS.find((t) => fill(t(englishTable)) === english)
  if (trim) return fill(trim(translated))
  let next = 0
  const form = fill(
    cut(
      translated,
      englishTable,
      fromCatalog(english).replace(/\{\}/g, () => `\u0001${next++}\u0001`),
      or
    )
  )
  return /\u0001/.test(form) ? undefined : form
}

const TEXT_SECTIONS = Object.keys(en).filter(
  (s) => !["names", "keywords", "promptKeywords", "keywordLabels"].includes(s)
)
for (const section of TEXT_SECTIONS)
  for (const [key, english] of leaves(en[section], "", [])) {
    if (/, plural,/.test(english)) {
      rows.push({ section, key, english, state: "plural", ids: [] })
      continue
    }
    const form = fromCatalog(english)
    // `{head}:` is the shape of a message, not words a table holds.
    if (!/\p{L}/u.test(form.replace(/\{\}/g, ""))) {
      rows.push({ section, key, english, state: "no-source", ids: [] })
      continue
    }
    const ids = (enIndex.get(form) ?? []).filter((id) => trTable.has(id))
    if (ids.length) {
      const candidates = ids.map((id) => ({ id, text: render(id, english) }))
      // A select's words are English's, copied with the argument: worded by hand.
      const state = candidates.some(({ text }) => text === undefined)
        ? "arguments"
        : /, select,/.test(english)
          ? "select"
          : undefined
      if (state) rows.push({ section, key, english, state, ids, candidates })
      else settle(section, key, english, candidates)
      continue
    }
    // A match by pattern or loosely names the strings to word it from, never the wording.
    const partial = [
      ...new Set([
        ...enPatterns
          .filter(
            ({ regex, literal }) =>
              literal >= 0.6 * form.replace(/\{\}/g, "").length &&
              regex.test(form)
          )
          .map(({ id }) => id),
        ...(enLoose.get(loose(form)) ?? []),
      ]),
    ].filter((id) => trTable.has(id))
    rows.push({
      section,
      key,
      english,
      state: partial.length ? "partial" : "no-source",
      ids: partial,
      candidates: partial.map((id) => ({
        id,
        text: fromTable(trTable.get(id)),
      })),
    })
  }

// A keyword list's words, in order: `[Close/Undo]`, or the last of several.
const listOf = (text) => {
  const lists = [...text.matchAll(/\[([^\]]*)\]/g)]
  return lists.length ? lists.at(-1)[1].split("/") : undefined
}
for (const [command, labels] of Object.entries(en.keywordLabels))
  for (const [keyword, label] of Object.entries(labels)) {
    const candidates = []
    for (const [id, text] of enTable) {
      const at = listOf(text)?.indexOf(label) ?? -1
      const translated = trTable.has(id) ? listOf(trTable.get(id)) : undefined
      if (at >= 0 && translated?.length === listOf(text).length)
        candidates.push({ id, text: translated[at] })
    }
    settle("keywordLabels", `${command}.${keyword}`, label, candidates)
  }

// Every initget string, as the English word and the translated one at each place of its local
// half: `Cerrar desHacer _Close Undo` beside `Close Undo _Close Undo`.
const initgets = []
for (const [id, text] of trTable) {
  const english = enTable.get(id)
  if (!english || !/^[^\n_]+ _[^\n]+$/.test(text)) continue
  const local = (s) => s.slice(0, s.indexOf(" _")).split(" ")
  const words = local(text)
  const englishWords = local(english)
  if (words.length !== englishWords.length || !/ _/.test(english)) continue
  initgets.push({
    id,
    pairs: englishWords
      .map((word, i) => [word, words[i]])
      .filter(([word]) => word !== "dummy"),
  })
}
function keywordsOf(section, owner, keywords) {
  for (const strict of [true, false]) {
    const same = (a, b) =>
      strict ? a === b : a.toLowerCase() === b.toLowerCase()
    const words = Object.values(keywords)
    // A string that shares a single word with a larger set is another prompt's (`Normal
    // Isometric _Standard Isometric` for TRIM's `Standard`).
    const offers = initgets
      .map(({ id, pairs }) => ({
        id,
        pairs: pairs.filter(([word]) => words.some((w) => same(w, word))),
        whole: pairs.length,
      }))
      .filter(
        ({ pairs, whole }) => pairs.length >= Math.min(2, words.length, whole)
      )
    for (const [key, word] of Object.entries(keywords)) {
      if (
        !strict &&
        rows.some((r) => r.section === section && r.key === `${owner}.${key}`)
      )
        continue
      const offering = offers.filter(({ pairs }) =>
        pairs.some(([w]) => same(w, word))
      )
      // The strings closest to this command's or prompt's whole set, not every string that
      // happens to offer one of its words (`Undo` is in hundreds).
      const best = Math.max(0, ...offering.map(({ pairs }) => pairs.length))
      const found = offering
        .filter(({ pairs }) => pairs.length === best)
        .map(({ id, pairs }) => ({
          id,
          text: pairs.find(([w]) => same(w, word))[1],
        }))
      if (strict && found.length)
        settle(section, `${owner}.${key}`, word, found)
      // Capitalised otherwise, the word is another prompt's: its capitals are not this one's.
      else if (!strict)
        rows.push({
          section,
          key: `${owner}.${key}`,
          english: word,
          state: found.length ? "partial" : "no-source",
          ids: found.map(({ id }) => id),
          candidates: found,
        })
    }
  }
}
for (const [command, keywords] of Object.entries(en.keywords))
  keywordsOf("keywords", command, keywords)
for (const [prompt, keywords] of Object.entries(en.promptKeywords))
  keywordsOf("promptKeywords", prompt, keywords)

// The aliases acad.pgp gives each command, in its order and once (it repeats some), but the
// command's own name (`COLOR, *COLOR`): `L,         *LINEA`.
const aliases = new Map()
const pgp = new URL(`acad_${lang}.pgp`, strings)
if (existsSync(pgp))
  for (const line of readFileSync(pgp, "utf8").split(/\r?\n/)) {
    const alias = /^([^;,\s][^,]*),\s*\*(\S+)\s*$/.exec(line)
    if (!alias) continue
    const command = alias[2].toUpperCase()
    aliases.set(
      command,
      new Set([...(aliases.get(command) ?? []), alias[1].trim()])
    )
  }
const namesOf = (name) => [
  name,
  ...[...(aliases.get(name) ?? [])].filter((alias) => alias !== name),
]
for (const [command, [name]] of Object.entries(en.names)) {
  const candidates = []
  for (const [id, text] of enTable)
    if (text === name && trTable.has(id)) {
      const translated = trTable.get(id)
      // A command name is one upper-case word; the same English word elsewhere is a label.
      if (
        /^[^\s]+$/.test(translated) &&
        translated === translated.toUpperCase()
      )
        candidates.push({ id, text: translated })
    }
  const names = [...new Set(candidates.map(({ text }) => text))]
  rows.push({
    section: "names",
    key: command,
    english: en.names[command].join(", "),
    state:
      names.length === 1 ? "proposed" : names.length ? "several" : "no-source",
    ids: candidates.map(({ id }) => id),
    candidates: candidates.map(({ id, text }) => ({
      id,
      text: namesOf(text).join(", "),
    })),
  })
  if (names.length === 1) (proposal.names ??= {})[command] = namesOf(names[0])
}

// The proposal keeps English's order of sections and keys, as the catalogs do.
function ordered(model, node) {
  if (Array.isArray(node) || typeof node !== "object") return node
  return Object.fromEntries(
    Object.keys(model)
      .filter((key) => key in node)
      .map((key) => [key, ordered(model[key], node[key])])
  )
}
const out = new URL("research/proposals/", root)
mkdirSync(out, { recursive: true })
writeFileSync(
  new URL(`${lang}.json`, out),
  // A name's list on one line, as the catalogs hold it.
  JSON.stringify({ commands: ordered(en, proposal) }, null, 2).replace(
    /\[\n\s+([^\]]*?)\n\s+\]/g,
    (_, list) => `[${list.replace(/,\n\s+/g, ", ")}]`
  ) + "\n"
)

const STATES = [
  "several",
  "arguments",
  "select",
  "partial",
  "plural",
  "no-source",
  "proposed",
]
const cell = (text) =>
  String(text ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, "⏎")
const report = [
  `# Proposed command language: ${lang}\n`,
  `From \`research/strings/all_en.tsv\` and \`all_${lang}.tsv\`; the proposals are in \`${lang}.json\`.\n`,
  STATES.map((s) => `${s}: ${rows.filter((r) => r.state === s).length}`).join(
    " · "
  ) + "\n",
]
for (const state of STATES) {
  const these = rows.filter((r) => r.state === state)
  if (!these.length) continue
  report.push(`## ${state}\n`, `| Key | English | ${lang} | Table ids |`)
  report.push("| --- | --- | --- | --- |")
  for (const r of these) {
    const byText = new Map()
    for (const { id, text } of r.candidates ?? [])
      byText.set(text, [...(byText.get(text) ?? []), id])
    const texts = [...byText].map(([text, ids]) =>
      byText.size > 1 ? `${text} (${ids.slice(0, 4).join(", ")})` : text
    )
    report.push(
      `| ${cell(`${r.section}.${r.key}`)} | ${cell(r.english)} | ${cell(texts.join(" · "))} | ${cell(r.ids.slice(0, 4).join(", "))} |`
    )
  }
  report.push("")
}
writeFileSync(new URL(`${lang}.md`, out), report.join("\n"))
console.log(
  `research/proposals/${lang}.json, research/proposals/${lang}.md\n` + report[2]
)
