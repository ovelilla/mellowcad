/**
 * Pairs a language's console with English's, probe by probe, and checks a command language
 * against it: each traced transcript in `research/probes/<command>/<id>.<culture>.txt` is read
 * beside the same probe's `<id>.en-US.txt`, prompt by prompt (the tracer's `Message` and its
 * keywords, `g` the local word and `l` the global one) and line by line between two prompts.
 * Every key of `commands` found in English is then reworded from what the language's console
 * printed in its place.
 *
 *   node scripts/research/console-pair.mjs --lang pt-BR --select     the probes to run (stdout)
 *   node scripts/research/console-pair.mjs --lang pt-BR              the report
 *
 * `--select` reads the English transcripts alone and prints, one `<command> <id>` per line, the
 * fewest probes that show every catalog key and every keyword English's show; run them
 * with `probe.sh --lang <tag> --lang-only`. The report compares each key with the language's
 * catalog, or with `research/proposals/<tag>.json` while there is none, and writes
 * `research/console/<tag>.md` and `.json` (gitignored: Autodesk's text). States: `match`;
 * `differs` (the console says otherwise: it wins over the tables); `several` (the console words
 * the key more than one way: the prompts need ids of their own, or one is another key's);
 * `unpaired` (seen in English, never paired); and `unseen` (no probe shows it). See
 * .claude/skills/command-review/annex-catalogs.md.
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"

import { cultureOf, head, language, leaves, root, valueAt } from "./tables.mjs"

const { lang, rest: args } = language(process.argv.slice(2))
const culture = cultureOf(lang)
const select = args.includes("--select")
const probes = new URL("research/probes/", root)
const read = (path) => JSON.parse(readFileSync(new URL(path, root), "utf8"))

// A transcript as events: the command started, each prompt the tracer saw, each printed line.
function parse(text) {
  const events = []
  // A stack: a transparent command ('-OSNAP inside FILLET) ends back in the one it interrupted.
  const running = []
  const lines = (chunk) => {
    for (const line of chunk.split("\n")) {
      // Kept as printed: LIST and the listings align their columns with spaces.
      const t = line.trimEnd()
      if (t.trim())
        events.push({ t: "line", text: t, command: running.at(-1) ?? null })
    }
  }
  let at = 0
  for (const m of text.matchAll(/«MP (\S+) ?([^»]*)»/g)) {
    lines(text.slice(at, m.index))
    at = m.index + m[0].length
    const [kind, body] = [m[1], m[2]]
    if (kind === "doc.CommandWillStart")
      running.push(JSON.parse(body).GlobalCommandName)
    else if (kind === "doc.CommandEnded" || kind === "doc.CommandFailed")
      running.pop()
    else if (kind.startsWith("ed.Prompting")) {
      const json = JSON.parse(body)
      if (typeof json.Message !== "string") continue
      events.push({
        t: "prompt",
        command: running.at(-1) ?? null,
        message: json.Message.replace(/\s+/g, " ").trim(),
        keywords: (json.Keywords?.items ?? [])
          .filter((k) => k.g !== "dummy")
          .map((k) => ({ local: k.g, global: k.l })),
      })
    }
  }
  lines(text.slice(at))
  return events
}

// The two transcripts' events, paired: prompts in order, and between two prompts the lines in
// order when both printed as many. Lines both languages print alike carry no wording.
function pair(english, local) {
  const prompts = (events) => events.filter((e) => e.t === "prompt")
  const [ep, lp] = [prompts(english), prompts(local)]
  if (ep.length !== lp.length) return null
  const segments = (events) => {
    const out = [[]]
    for (const e of events) {
      if (e.t === "prompt") out.push([])
      else out.at(-1).push(e)
    }
    return out
  }
  const [es, ls] = [segments(english), segments(local)]
  const lines = []
  es.forEach((segment, i) => {
    if (segment.length !== ls[i].length) return
    segment.forEach((e, j) => {
      if (e.text !== ls[i][j].text) lines.push([e, ls[i][j]])
    })
  })
  return { prompts: ep.map((e, i) => [e, lp[i]]), lines }
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
// ICU's apostrophe quoting, undone; `'<'` is AutoCAD's literal angle bracket in the catalog.
const unquote = (text) => text.replace(/'<'/g, "<").replace(/''/g, "'")

// An ICU message's English forms: a plural or select gives one per branch, `#` a number.
function branches(message) {
  const at = message.search(/\{\w+, (plural|select|selectordinal),/)
  if (at < 0) return [message]
  let depth = 0
  let end = at
  for (; end < message.length; end++) {
    if (message[end] === "{") depth++
    else if (message[end] === "}" && --depth === 0) break
  }
  const inner = message.slice(
    message.indexOf(",", message.indexOf(",", at) + 1) + 1,
    end
  )
  const forms = []
  for (const b of inner.matchAll(/[=\w]+ ?\{((?:[^{}]|\{[^{}]*\})*)\}/g))
    forms.push(b[1].replace(/#/g, "{#}"))
  return forms.flatMap((form) =>
    branches(message.slice(0, at) + form + message.slice(end + 1))
  )
}

// A catalog form as a regex over a console line, each `{arg}` a lazy group.
function matcher(form) {
  const names = []
  const source = unquote(form)
    .split(/(\{[\w#]+\})/)
    .map((part) => {
      const arg = /^\{([\w#]+)\}$/.exec(part)
      if (!arg) return escape(part).replace(/\s+/g, "\\s+")
      names.push(arg[1])
      return "(.+?)"
    })
    .join("")
  return { names, regex: new RegExp(`^${source}$`) }
}

// The catalog's prompt is the message up to its keyword list or default, colon dropped.
const promptHead = (message) => head(message).replace(/\s*:$/, "").trim()
// A line is matched as printed, then without its indent: a catalog message the runtime indents
// itself starts without it.
const lineForms = (text) => [text, text.trim()]

// The local text with each English argument's value put back as its placeholder.
function reword(local, names, values) {
  let text = local
  names.forEach((name, i) => {
    const value = values[i]
    if (value && text.split(value).length === 2)
      text = text.replace(value, `{${name}}`)
  })
  return text
}

const english = read("cad/locales/en.json").commands
const SECTIONS = ["prompts", "messages", "feedback", "listing", "defaults"]
const keys = SECTIONS.flatMap((s) =>
  leaves(english[s], s, []).flatMap(([key, text]) =>
    branches(text).map((form) => ({ key, text, ...matcher(form) }))
  )
)

// Every probe with an English transcript, and its language's when there is one.
const runs = []
for (const command of readdirSync(probes)) {
  const dir = new URL(`${command}/`, probes)
  for (const file of readdirSync(dir)) {
    const id = file.match(/^(.+)\.en-US\.txt$/)?.[1]
    if (!id) continue
    const local = new URL(`${id}.${culture}.txt`, dir)
    runs.push({
      command,
      id,
      english: parse(readFileSync(new URL(file, dir), "utf8")),
      local: existsSync(local) ? parse(readFileSync(local, "utf8")) : null,
    })
  }
}

// What an English transcript shows of the catalog: keys, and each command's global keywords.
function shown(events) {
  const found = new Set()
  for (const e of events) {
    const texts = e.t === "prompt" ? [promptHead(e.message)] : lineForms(e.text)
    for (const k of keys)
      if (texts.some((text) => k.regex.test(text))) found.add(k.key)
    if (e.t === "prompt")
      for (const kw of e.keywords)
        found.add(`kw:${e.command}:${promptHead(e.message)}:${kw.global}`)
  }
  return found
}

if (select) {
  // What a probe already run and paired shows is covered: a second pass runs only what is new.
  const covered = new Set()
  for (const r of runs)
    if (r.local && pair(r.english, r.local))
      for (const k of shown(r.english)) covered.add(k)
  // Untraced probes (`.plain`, U and UNDO) pair as one stretch of lines.
  const sets = runs
    .filter((r) => !r.local)
    .map((r) => ({ r, keys: shown(r.english) }))
  const chosen = []
  for (;;) {
    let best = null
    let gain = 0
    for (const s of sets) {
      let n = 0
      for (const k of s.keys) if (!covered.has(k)) n++
      if (n > gain) [best, gain] = [s, n]
    }
    if (!best) break
    for (const k of best.keys) covered.add(k)
    chosen.push(best.r)
  }
  for (const r of chosen) console.log(`${r.command} ${r.id}`)
  console.error(
    `${chosen.length} probes more; ${covered.size} keys and keywords shown.`
  )
  process.exit(0)
}

const catalogPath = `cad/locales/${lang}.json`
const proposalPath = `research/proposals/${lang}.json`
const reference =
  (existsSync(new URL(catalogPath, root)) && read(catalogPath).commands) ||
  (existsSync(new URL(proposalPath, root)) && read(proposalPath).commands)
if (!reference) {
  console.error(`Neither ${catalogPath} nor ${proposalPath} has commands.`)
  process.exit(1)
}

// key → { english: count, local: Map(text → { commands, probes }) }: a key one English text
// shares between commands may be worded per command.
const seen = new Map()
const keywords = new Map() // command → global → Map(local → Set(prompt heads))
const labels = new Map() // command → global → Map(label → probes)
let unpairedRuns = 0
const note = (key, text, where, command) => {
  const entry = seen.get(key) ?? { english: 0, local: new Map() }
  seen.set(key, entry)
  if (text === null) return entry.english++
  const found = entry.local.get(text) ?? { commands: new Set(), probes: [] }
  found.commands.add(command ?? "?")
  if (found.probes.length < 4 && !found.probes.includes(where))
    found.probes.push(where)
  entry.local.set(text, found)
}

for (const r of runs) {
  if (!r.local) {
    for (const k of shown(r.english)) if (!k.startsWith("kw:")) note(k, null)
    continue
  }
  const pairs = pair(r.english, r.local)
  if (!pairs) {
    unpairedRuns++
    continue
  }
  const where = `${r.command}/${r.id}`
  // Each pair in the forms it may match in, the first that matches winning.
  const candidates = [
    ...pairs.prompts.map(([e, l]) => ({
      command: l.command,
      forms: [[promptHead(e.message), promptHead(l.message)]],
    })),
    ...pairs.lines.map(([e, l]) => ({
      command: l.command,
      forms: lineForms(e.text).map((text, i) => [text, lineForms(l.text)[i]]),
    })),
  ]
  for (const k of keys)
    for (const { command, forms } of candidates)
      for (const [en, local] of forms) {
        const m = k.regex.exec(en)
        if (!m) continue
        note(k.key, reword(local, k.names, m.slice(1)), where, command)
        break
      }
  for (const [e, l] of pairs.prompts) {
    const command = l.command ?? "?"
    const listed = /\[([^\]]*)\]/.exec(l.message)?.[1].split("/") ?? []
    for (const kw of l.keywords) {
      const byGlobal = keywords.get(command) ?? new Map()
      keywords.set(command, byGlobal)
      const byLocal = byGlobal.get(kw.global) ?? new Map()
      byGlobal.set(kw.global, byLocal)
      const heads = byLocal.get(kw.local) ?? new Set()
      byLocal.set(kw.local, heads.add(promptHead(e.message)))
    }
    // A listed label is its keyword's word, or starts with it (`Arestas de corte` for `Arestas`)
    // or the other way round; failing both, the keyword at its place, when as many are listed.
    const lower = (text) => text.toLocaleLowerCase()
    for (const [i, label] of listed.entries()) {
      const kw =
        l.keywords.find((k) => k.local === label) ??
        l.keywords.find(
          (k) =>
            lower(label).startsWith(lower(k.local)) ||
            lower(k.local).startsWith(lower(label))
        ) ??
        (listed.length === l.keywords.length ? l.keywords[i] : undefined)
      if (!kw || kw.local === label) continue
      const byGlobal = labels.get(command) ?? new Map()
      labels.set(command, byGlobal)
      const byLabel = byGlobal.get(kw.global) ?? new Map()
      byGlobal.set(kw.global, byLabel)
      byLabel.set(label, (byLabel.get(label) ?? new Set()).add(where))
    }
  }
}
for (const r of runs)
  for (const k of shown(r.english)) if (!k.startsWith("kw:")) note(k, null)

const rows = []
for (const { key, text } of keys.filter(
  (k, i, all) => all.findIndex((o) => o.key === k.key) === i
)) {
  const entry = seen.get(key)
  const ours = valueAt(reference, key)
  const local = entry ? [...entry.local] : []
  const state = !entry
    ? "unseen"
    : !local.length
      ? "unpaired"
      : local.length > 1
        ? "several"
        : local[0][0] === (typeof ours === "string" ? unquote(ours) : ours)
          ? "match"
          : "differs"
  rows.push({
    key,
    english: text,
    ours: ours ?? null,
    state,
    console: Object.fromEntries(
      local.map(([text, { commands, probes }]) => [
        text,
        { commands: [...commands], probes },
      ])
    ),
  })
}
const commandKeywords = Object.fromEntries(
  [...keywords].map(([command, byGlobal]) => [
    command,
    Object.fromEntries(
      [...byGlobal].map(([global, byLocal]) => [
        global,
        Object.fromEntries(
          [...byLocal].map(([local, heads]) => [local, [...heads]])
        ),
      ])
    ),
  ])
)
const commandLabels = Object.fromEntries(
  [...labels].map(([command, byGlobal]) => [
    command,
    Object.fromEntries(
      [...byGlobal].map(([global, byLabel]) => [
        global,
        Object.fromEntries(
          [...byLabel].map(([label, where]) => [label, [...where].slice(0, 4)])
        ),
      ])
    ),
  ])
)

const out = new URL("research/console/", root)
mkdirSync(out, { recursive: true })
writeFileSync(
  new URL(`${lang}.json`, out),
  JSON.stringify(
    { keys: rows, keywords: commandKeywords, labels: commandLabels },
    null,
    1
  )
)
const count = (state) => rows.filter((r) => r.state === state).length
const cell = (text) => String(text ?? "").replace(/\|/g, "\\|")
const md = [
  `# ${lang}'s console against English's`,
  "",
  `${runs.filter((r) => r.local).length} probes run in ${culture}, ${unpairedRuns} of them unpaired (the two runs prompted differently). ` +
    ["match", "differs", "several", "unpaired", "unseen"]
      .map((s) => `${s}: ${count(s)}`)
      .join(" · "),
  "",
  "| Key | State | English | Ours | Console |",
  "| --- | --- | --- | --- | --- |",
  ...rows
    .filter((r) => r.state !== "match")
    .map(
      (r) =>
        `| ${r.key} | ${r.state} | ${cell(r.english)} | ${cell(
          typeof r.ours === "string" ? r.ours : JSON.stringify(r.ours)
        )} | ${Object.entries(r.console)
          .map(
            ([text, { commands, probes }]) =>
              `${cell(text)} [${commands.join(", ")}] (${probes.join(", ")})`
          )
          .join(" · ")} |`
    ),
]
writeFileSync(new URL(`${lang}.md`, out), md.join("\n") + "\n")
console.log(md.slice(0, 3).join("\n"))
