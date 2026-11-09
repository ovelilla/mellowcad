/**
 * Proposes a language's interface words from AutoCAD's own: each English leaf of a catalog — the
 * engine's `interface`, or the editor's catalog — is looked up among the installed English
 * resources, and the same id is read in the language's. The sources, by id: each resource DLL's
 * string table (`P <dll> <id>`) and dialog labels (`D <dll> <dialog>:<control>`), the .NET
 * resources' strings (`N <assembly> <key>`) and acad.cuix's names, by UID (`X <uid>`), from
 * `en-US/` and `UserDataCache/en-us/` beside the culture's: the language's pack must be installed.
 * It reads the files; nothing runs.
 *
 *   node scripts/research/propose-interface.mjs --lang fr --catalog engine [--like pt-BR]
 *   node scripts/research/propose-interface.mjs --lang fr --catalog editor [--like pt-BR]
 *
 * `--like <tag>` settles a label its ids word several ways as an installed language already did:
 * the ids whose wording in that language is its catalog's word give this one's (`like`). Its
 * words were chosen by id (skill `language-review`), so the same ids answer here.
 *
 * Writes `research/proposals/<tag>-<catalog>.md` and `.json` (gitignored: Autodesk's text): per
 * key, its English and each wording its ids give, with how many and where, the most frequent
 * first; the JSON holds the keys one wording settles. A label is compared without its accelerator
 * (`&`), trailing `...` or `:` and case; a message with arguments is left to the hand. The palette
 * and the ribbon may word one English label two ways: the catalog row's place decides (skill
 * `language-review`, §4), and what no source gives is ours, marked in `docs/i18n/<tag>.md`.
 * See .claude/skills/autocad-research/SKILL.md.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { join } from "node:path"
import { inflateRawSync } from "node:zlib"

import { dialogs } from "./dialogs.mjs"
import { stringTable } from "./strtable.mjs"
import { cultureOf, language, leaves, root } from "./tables.mjs"

const INSTALL = "/mnt/c/Program Files/Autodesk/AutoCAD 2027"
const CATALOGS = {
  engine: { file: "cad/locales/en.json", under: "interface" },
  editor: { file: "packages/editor/src/locales/en.json", under: null },
}

const { lang, rest } = language(process.argv.slice(2))
const which = rest[rest.indexOf("--catalog") + 1] ?? "engine"
if (!CATALOGS[which]) {
  console.error(`--catalog takes ${Object.keys(CATALOGS).join(" or ")}`)
  process.exit(1)
}
const culture = cultureOf(lang)
const likeAt = rest.indexOf("--like")
const like = likeAt >= 0 ? rest[likeAt + 1] : null
const english = join(INSTALL, "en-US")
const local = join(INSTALL, culture)
if (!existsSync(join(local, "acadres.dll"))) {
  console.error(`${local} has no acadres.dll: is the ${culture} pack installed?`)
  process.exit(1)
}

// A .NET resources stream (ResourceReader, version 2): its string values by name. A
// .resources.dll embeds one per .resx; the magic number finds each. BAML (a dialog's XAML) is not
// a string and is skipped.
function dotnetStrings(file) {
  const bytes = readFileSync(file)
  const out = new Map()
  let from = 0
  for (;;) {
    const at = bytes.indexOf(Buffer.from([0xce, 0xca, 0xef, 0xbe]), from)
    if (at < 0) return out
    from = at + 4
    try {
      let p = at + 8
      const skip = bytes.readInt32LE(p)
      p += 4 + skip
      const version = bytes.readInt32LE(p)
      if (version !== 2) continue
      const count = bytes.readInt32LE(p + 4)
      const types = bytes.readInt32LE(p + 8)
      p += 12
      const int7 = () => {
        let value = 0
        let shift = 0
        for (;;) {
          const b = bytes[p++]
          value |= (b & 0x7f) << shift
          if (!(b & 0x80)) return value
          shift += 7
        }
      }
      for (let t = 0; t < types; t++) p += int7()
      while ((p - at) % 8 !== 0) p++
      p += count * 4
      const positions = []
      for (let i = 0; i < count; i++) positions.push(bytes.readInt32LE(p + i * 4))
      p += count * 4
      const dataSection = at + bytes.readInt32LE(p)
      const names = p + 4
      for (const position of positions) {
        p = names + position
        const length = int7()
        const name = bytes.toString("utf16le", p, p + length)
        p += length
        const offset = bytes.readInt32LE(p)
        p = dataSection + offset
        if (int7() !== 1) continue
        const size = int7()
        out.set(name, bytes.toString("utf8", p, p + size))
      }
    } catch {
      // A false match of the magic number, or a stream of another version.
    }
  }
}

// acad.cuix is a zip of XML: every element with a UID, its text or its `Text` attribute.
function cuixNames(file) {
  const out = new Map()
  if (!existsSync(file)) return out
  const zip = readFileSync(file)
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let p = zip.readUInt32LE(end + 16)
  const entries = zip.readUInt16LE(end + 10)
  for (let i = 0; i < entries; i++) {
    const method = zip.readUInt16LE(p + 10)
    const size = zip.readUInt32LE(p + 20)
    const nameLength = zip.readUInt16LE(p + 28)
    const extra = zip.readUInt16LE(p + 30)
    const comment = zip.readUInt16LE(p + 32)
    const header = zip.readUInt32LE(p + 42)
    const name = zip.toString("utf8", p + 46, p + 46 + nameLength)
    p += 46 + nameLength + extra + comment
    if (!/\.cui$/i.test(name)) continue
    const start =
      header + 30 + zip.readUInt16LE(header + 26) + zip.readUInt16LE(header + 28)
    const raw = zip.subarray(start, start + size)
    const xml = (method === 8 ? inflateRawSync(raw) : raw).toString("utf8")
    const decode = (text) =>
      text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&amp;/g, "&")
    for (const m of xml.matchAll(/<(\w+)\b([^>]*)\bUID="([^"]+)"([^>]*)>([^<]*)<\/\1>/g))
      if (m[5].trim()) out.set(m[3], decode(m[5]))
    for (const m of xml.matchAll(/<\w+\b[^>]*>/g)) {
      const uid = /\bUID="([^"]+)"/.exec(m[0])?.[1]
      const text = /\bText="([^"]*)"/.exec(m[0])?.[1]
      if (uid && text) out.set(`${uid}:Text`, decode(text))
    }
  }
  return out
}

// Every source as `where → text`, for one folder of DLLs and one acad.cuix.
function sources(folder, cuix) {
  const out = new Map()
  for (const file of readdirSync(folder)) {
    const path = join(folder, file)
    if (/\.resources\.dll$/i.test(file)) {
      const assembly = file.replace(/\.resources\.dll$/i, "")
      for (const [key, text] of dotnetStrings(path))
        out.set(`N ${assembly} ${key}`, text)
    } else if (/\.dll$/i.test(file)) {
      const dll = file.replace(/\.dll$/i, "")
      try {
        for (const line of stringTable(path)) {
          const tab = line.indexOf("\t")
          out.set(`P ${dll} ${line.slice(0, tab)}`, JSON.parse(line.slice(tab + 1)))
        }
      } catch {
        // No string table.
      }
      try {
        for (const line of dialogs(path)) {
          const tab = line.indexOf("\t")
          out.set(`D ${dll} ${line.slice(0, tab)}`, JSON.parse(line.slice(tab + 1)))
        }
      } catch {
        // No dialogs.
      }
    }
  }
  for (const [uid, text] of cuixNames(cuix)) out.set(`X ${uid}`, text)
  return out
}

const support = (c) => join(INSTALL, "UserDataCache", c.toLowerCase(), "Support/acad.CUIX")
const englishSources = sources(english, support("en-US"))
const localSources = sources(local, support(culture))
const likeSources = like
  ? sources(join(INSTALL, cultureOf(like)), support(cultureOf(like)))
  : null

// A label as a menu or a dialog writes it, without its accelerator, ellipsis or colon.
const bare = (text) =>
  text
    .replace(/\(&\w\)/g, "")
    .replace(/&(?=\S)/g, "")
    .replace(/\.\.\.$|…$/, "")
    .replace(/\s*:\s*$/, "")
    .replace(/\s+/g, " ")
    .trim()
const key = (text) => bare(text).toLowerCase()

const byEnglish = new Map()
for (const [where, text] of englishSources) {
  const k = key(text)
  if (!k || k.length > 120) continue
  if (!byEnglish.has(k)) byEnglish.set(k, [])
  byEnglish.get(k).push(where)
}

const { file, under } = CATALOGS[which]
const catalogOf = (tag) =>
  JSON.parse(readFileSync(new URL(file.replace(/en\.json$/, `${tag}.json`), root), "utf8"))
const catalog = catalogOf("en")
const entries = []
leaves(under ? catalog[under] : catalog, under ?? "", entries)
const likeWords = new Map()
if (like) {
  const list = []
  const theirs = catalogOf(like)
  leaves(under ? theirs[under] : theirs, under ?? "", list)
  for (const [path, value] of list) likeWords.set(path, value)
}

const report = []
const settled = {}
let one = 0
let liked = 0
let several = 0
let none = 0
for (const [path, value] of entries) {
  if (typeof value !== "string") continue
  if (/[{}<]/.test(value)) {
    report.push({ path, value, state: "message", candidates: [] })
    continue
  }
  const wheres = byEnglish.get(key(value)) ?? []
  const counts = new Map()
  for (const where of wheres) {
    const text = localSources.get(where)
    if (text === undefined) continue
    const word = bare(text)
    if (!word) continue
    if (!counts.has(word)) counts.set(word, [])
    counts.get(word).push(where)
  }
  // One word in several cases (Cercle, CERCLE, cercle) is one candidate, in the English's case.
  const cased = (word) =>
    value === value.toUpperCase()
      ? word.toUpperCase()
      : value[0] === value[0].toUpperCase()
        ? word[0].toUpperCase() + word.slice(1)
        : word[0].toLowerCase() + word.slice(1)
  const merged = new Map()
  for (const [word, from] of counts) {
    const k = word.toLowerCase()
    if (!merged.has(k)) merged.set(k, { words: new Map(), from: [] })
    merged.get(k).words.set(word, (merged.get(k).words.get(word) ?? 0) + from.length)
    merged.get(k).from.push(...from)
  }
  const candidates = [...merged.values()]
    .map(({ words, from }) => {
      const variants = [...words].sort((a, b) => b[1] - a[1]).map(([w]) => w)
      const fitting = variants.find((w) => w === cased(w)) ?? cased(variants[0])
      return { word: fitting, from }
    })
    .sort((a, b) => b.from.length - a.from.length)
  let state =
    candidates.length === 0 ? "none" : candidates.length === 1 ? "one" : "several"
  // The ids that give the other language's word, and what they give here.
  const theirs = likeWords.get(path)
  let chosen = state === "one" ? candidates[0].word : null
  if (state === "several" && typeof theirs === "string") {
    const agreeing = new Set(
      wheres
        .filter((where) => likeSources.has(where) && key(likeSources.get(where)) === key(theirs))
        .map((where) => localSources.get(where))
        .filter((text) => text !== undefined)
        .map(bare)
    )
    if (agreeing.size === 1) {
      state = "like"
      chosen = [...agreeing][0]
    }
  }
  if (chosen !== null) settled[path] = chosen
  if (state === "one") one++
  else if (state === "like") liked++
  else if (state === "several") several++
  else none++
  report.push({ path, value, state, candidates, chosen, theirs })
}

const outDir = new URL("research/proposals/", root)
mkdirSync(outDir, { recursive: true })
const base = `${lang}-${which}`
writeFileSync(new URL(`${base}.json`, outDir), JSON.stringify(settled, null, 2) + "\n")
const order = { one: 0, like: 1, several: 2, none: 3, message: 4 }
const md = [
  `# ${which}'s interface in ${lang}, from the installed ${culture} resources`,
  "",
  `one: ${one} · like: ${liked} · several: ${several} · none: ${none} · messages: ${report.filter((r) => r.state === "message").length}`,
  "",
  ...report
    .sort((a, b) => order[a.state] - order[b.state])
    .map(({ path, value, state, candidates, chosen, theirs }) =>
      [
        `- \`${path}\` (${state}) ${JSON.stringify(value)}` +
          (chosen ? ` → ${JSON.stringify(chosen)}` : "") +
          (like && theirs !== undefined ? ` · ${like}: ${JSON.stringify(theirs)}` : ""),
        ...candidates
          .slice(0, 6)
          .map(
            ({ word, from }) =>
              `  - ${JSON.stringify(word)} ×${from.length}: ${from.join("; ")}`
          ),
      ].join("\n")
    ),
]
writeFileSync(new URL(`${base}.md`, outDir), md.join("\n") + "\n")
console.log(
  `research/proposals/${base}.md, .json — one: ${one} · like: ${liked} · several: ${several} · none: ${none}`
)
