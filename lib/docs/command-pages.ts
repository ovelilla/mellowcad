import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { frontmatter } from "fumadocs-core/content/md/frontmatter"

import { DOCS_PATH } from "./packages.ts"
import { COVERAGE_DIR, sourceHash } from "./use.ts"

/**
 * A page of its own for a command (`/docs/commands/offset`), written by
 * `lib/docs/generate.test.ts` from its notes — what a person writes about it,
 * in each language — and from what only the engine knows: its names, aliases,
 * keywords and a session it draws. The notes are the one thing typed by hand,
 * and this file is everything that reads them without the engine, so
 * `docs:check` holds them too.
 */

export const COMMANDS_PATH = `${DOCS_PATH}/commands`

/** The notes, one file per command and language: `offset.md`, `offset.es.md`. */
export const COMMAND_NOTES_DIR = "content/commands"

/** The generated pages, beside the reference that indexes them (`index.mdx`). */
export const COMMAND_PAGES_DIR = "content/docs/commands"

const LOCALE_SUFFIX = /\.([a-z]{2}(?:-[A-Z]{2})?)\.mdx?$/

/**
 * A command's slug: its global name in lower case (`offset`, `-hatch`), the
 * anchor F1 opened in the reference before the command had a page.
 */
export function commandSlug(id: string): string {
  return id.toLowerCase()
}

/** A command's page, unprefixed: `/docs/commands/offset`. */
export function commandPagePath(id: string): string {
  return `${COMMANDS_PATH}/${commandSlug(id)}`
}

/** A file's name for a command in a language: `offset.md`, `offset.es.md`. */
export function localizedFile(id: string, locale: string, extension: "md" | "mdx", english = "en"): string {
  const slug = commandSlug(id)
  return locale === english ? `${slug}.${extension}` : `${slug}.${locale}.${extension}`
}

/** The language a notes or page file is written in, by its suffix. */
export function fileLocale(file: string, english = "en"): string {
  return LOCALE_SUFFIX.exec(file)?.[1] ?? english
}

export interface CommandNotesData {
  /** The page's heading and its step in the breadcrumbs: the words a search uses, first. */
  readonly title: string
  /** Its title in search results, when the heading needs more words there. */
  readonly metaTitle?: string
  readonly description: string
  /** What the session's figure shows: its caption and its accessible name. */
  readonly figure: string
  /**
   * The caption of the drawing before the command (session `<slug>Before`),
   * shown above the session where the change says more beside it (DIMSPACE).
   */
  readonly before?: string
  /** English only: the commands a reader goes on to, by global name. */
  readonly related?: readonly string[]
  /** English only: `sourceHash` of the coverage entry's Missing, as the notes last said it. */
  readonly coverage?: string
  /** A translation: `sourceHash` of the English notes it says. */
  readonly sourceHash?: string
}

export interface CommandOption {
  /** The keyword's global id, as the engine's catalog keys it (`Through`). */
  readonly id: string
  readonly text: string
}

export interface CommandQuestion {
  readonly question: string
  readonly answer: string
}

export interface CommandNotes {
  readonly id: string
  readonly locale: string
  readonly data: CommandNotesData
  /** What the command does and how it starts, before anything else. */
  readonly lead: string
  readonly options: readonly CommandOption[]
  /** What it lacks against AutoCAD 2027, said exactly; none when it lacks nothing. */
  readonly missing?: string
  readonly questions: readonly CommandQuestion[]
}

/** The sections a notes file may have after its lead, in this order. */
const SECTIONS = ["Options", "Missing", "Questions"] as const

/** One `###` block of a section: its heading and its text. */
function blocks(text: string, file: string, section: string): { heading: string; text: string }[] {
  const parts = text.split(/^### +/m)
  if (parts[0].trim()) throw new Error(`${file}: ${section} has text before its first ###`)
  return parts.slice(1).map((part) => {
    const [heading, ...rest] = part.split("\n")
    const body = rest.join("\n").trim()
    if (!body) throw new Error(`${file}: "### ${heading.trim()}" in ${section} says nothing`)
    return { heading: heading.trim(), text: body }
  })
}

/**
 * A notes file: its frontmatter, the lead, then `## Options` (a `###` per
 * keyword, by its global id), `## Missing` and `## Questions` (a `###` per
 * question), each optional but Questions. Section names are the same in every
 * language: they are structure, the page writes them in its own.
 */
export function parseNotes(text: string, file: string): CommandNotes {
  const { data, content } = frontmatter(text)
  const fields = data as Record<string, unknown>
  for (const key of ["title", "description", "figure"] as const) {
    if (typeof fields[key] !== "string" || !(fields[key] as string).trim()) {
      throw new Error(`${file}: frontmatter ${key} is missing`)
    }
  }
  for (const key of ["figure", "before"] as const) {
    if (typeof fields[key] === "string" && (fields[key] as string).includes('"')) {
      throw new Error(`${file}: the ${key} caption is an attribute, without "`)
    }
  }
  const [lead, ...rest] = content.split(/^## +/m)
  if (!lead.trim()) throw new Error(`${file}: the lead is missing`)
  const sections = new Map<string, string>()
  let last = -1
  for (const part of rest) {
    const [heading, ...body] = part.split("\n")
    const name = heading.trim()
    const order = (SECTIONS as readonly string[]).indexOf(name)
    if (order === -1) throw new Error(`${file}: "## ${name}" is none of ${SECTIONS.join(", ")}`)
    if (order <= last) throw new Error(`${file}: its sections go in this order: ${SECTIONS.join(", ")}`)
    last = order
    sections.set(name, body.join("\n"))
  }
  const questions = blocks(sections.get("Questions") ?? "", file, "Questions").map((block) => ({
    question: block.heading,
    answer: block.text,
  }))
  if (questions.length < 2) throw new Error(`${file}: ## Questions asks two at least`)
  const missing = sections.get("Missing")?.trim()
  if (sections.has("Missing") && !missing) throw new Error(`${file}: ## Missing says nothing`)
  const name = path.basename(file)
  return {
    id: name.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.md$/, "").toUpperCase(),
    locale: fileLocale(name),
    data: fields as unknown as CommandNotesData,
    lead: lead.trim(),
    options: blocks(sections.get("Options") ?? "", file, "Options").map((block) => ({
      id: block.heading,
      text: block.text,
    })),
    missing,
    questions,
  }
}

/** The commands with notes, by global name: those with a page of their own. */
export function notedCommands(root: string): string[] {
  const dir = path.join(/*turbopackIgnore: true*/ root, COMMAND_NOTES_DIR)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !LOCALE_SUFFIX.test(file))
    .map((file) => file.replace(/\.md$/, "").toUpperCase())
    .sort()
}

/**
 * The commands with a page of their own, by global name: what the generated
 * pages' folder holds (F1 in `/draw` opens them). Read from the pages, not the
 * notes, so a deployment that builds them is the one that lists them.
 */
export function commandPageIds(root: string): string[] {
  const dir = path.join(/*turbopackIgnore: true*/ root, COMMAND_PAGES_DIR)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") && !LOCALE_SUFFIX.test(file) && file !== "index.mdx")
    .map((file) => file.replace(/\.mdx$/, "").toUpperCase())
    .sort()
}

/** A command's notes in a language, or `undefined` when it has none. */
export function readNotes(root: string, id: string, locale: string): CommandNotes | undefined {
  const file = path.join(/*turbopackIgnore: true*/ root, COMMAND_NOTES_DIR, localizedFile(id, locale, "md"))
  if (!existsSync(file)) return undefined
  return parseNotes(readFileSync(file, "utf8"), path.relative(root, file))
}

/** The English notes' text, whose hash a translation keeps (`sourceHash`). */
export function notesSource(root: string, id: string): string {
  return readFileSync(path.join(/*turbopackIgnore: true*/ root, COMMAND_NOTES_DIR, localizedFile(id, "en", "md")), "utf8")
}

export interface CoverageEntry {
  readonly file: string
  readonly heading: string
  /** Its `**Missing:**` paragraph, or `undefined` when it lacks nothing. */
  readonly missing?: string
}

/**
 * Where `docs/coverage/` documents a command: the first `###` heading naming
 * it in a code span, and its entry down to the next heading.
 */
export function coverageEntry(root: string, id: string): CoverageEntry {
  const dir = path.join(/*turbopackIgnore: true*/ root, COVERAGE_DIR)
  for (const file of readdirSync(dir).sort()) {
    const lines = readFileSync(path.join(dir, file), "utf8").split("\n")
    const start = lines.findIndex((line) => line.startsWith("### ") && line.includes(`\`${id}\``))
    if (start === -1) continue
    // Headings stacked with nothing between them share the last one's entry
    // (UNION and SUBTRACT over INTERSECT's).
    let last = start
    for (let next = start + 1; next < lines.length; next += 1) {
      if (lines[next].startsWith("### ")) last = next
      else if (lines[next].trim()) break
    }
    const after = lines.slice(last + 1)
    const end = after.findIndex((line) => /^#{1,3} /.test(line))
    const entry = (end === -1 ? after : after.slice(0, end)).join("\n")
    const missing = /\*\*Missing:\*\*([\s\S]*?)(?=\n\s*\n\*\*|$)/.exec(entry)?.[1].trim()
    return { file, heading: lines[start].slice(4), missing: missing || undefined }
  }
  throw new Error(`${id} has no ### heading in ${COVERAGE_DIR}/`)
}

/**
 * What an English notes file's `coverage` holds: its coverage entry's Missing,
 * so a command that gains or loses an option fails until its page says so.
 */
export function coverageHash(entry: CoverageEntry): string {
  return sourceHash(entry.missing ?? "")
}

/** The ids of `<Keyword … />`, `<Message … />` and `<Command … />` a notes file names. */
export function notesElements(text: string): {
  keywords: { command?: string; id: string }[]
  messages: string[]
  commands: string[]
} {
  return {
    messages: [...text.matchAll(/<Message\s+id="([^"]+)"\s*\/>/g)].map(([, id]) => id),
    keywords: [...text.matchAll(/<Keyword\s+(?:command="([^"]+)"\s+)?id="([^"]+)"\s*\/>/g)].map(
      ([, command, id]) => ({ command, id })
    ),
    commands: [...text.matchAll(/<Command\s+id="([^"]+)"\s*\/>/g)].map(([, id]) => id),
  }
}

type Catalog = {
  commands?: {
    names?: Record<string, readonly string[]>
    keywords?: Record<string, Record<string, string>>
    messages?: Record<string, unknown>
  }
}

/**
 * What `docs:check` holds a command's notes and pages to, each problem told
 * to `report`: every page has notes and every notes file its pages, in each
 * live language; a translation says the English it was written from
 * (`sourceHash`), with its options in the same order and as many questions;
 * the English notes say the coverage entry's Missing they were written
 * against (`coverage`), so a command that gains or loses an option fails until
 * its page says so; and every keyword, command and related command they name
 * is the engine's.
 */
export function checkCommandNotes(
  root: string,
  locales: { all: readonly string[]; live: readonly string[]; english: string },
  report: (file: string, message: string) => void
): void {
  const catalog = JSON.parse(readFileSync(path.join(/*turbopackIgnore: true*/ root, "cad/locales/en.json"), "utf8")) as Catalog
  const names = catalog.commands?.names ?? {}
  const keywords = catalog.commands?.keywords ?? {}
  const noted = notedCommands(root)
  const notesDir = path.join(/*turbopackIgnore: true*/ root, COMMAND_NOTES_DIR)
  const pagesDir = path.join(/*turbopackIgnore: true*/ root, COMMAND_PAGES_DIR)

  for (const file of existsSync(notesDir) ? readdirSync(notesDir) : []) {
    const id = file.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.md$/, "").toUpperCase()
    if (!file.endsWith(".md") || !noted.includes(id)) {
      report(`${COMMAND_NOTES_DIR}/${file}`, `a command's notes are <global name>.md, with its English beside it`)
    }
  }
  for (const file of existsSync(pagesDir) ? readdirSync(pagesDir) : []) {
    if (/^index(\.[a-z]{2}(?:-[A-Z]{2})?)?\.mdx$/.test(file) || file === "meta.json") continue
    const id = file.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.mdx$/, "").toUpperCase()
    if (!existsSync(path.join(notesDir, localizedFile(id, fileLocale(file), "md")))) {
      report(`${COMMAND_PAGES_DIR}/${file}`, `no notes write it (${COMMAND_NOTES_DIR}/${localizedFile(id, fileLocale(file), "md")})`)
    }
  }

  for (const id of noted) {
    const englishFile = `${COMMAND_NOTES_DIR}/${localizedFile(id, locales.english, "md")}`
    if (!(id in names)) report(englishFile, `${id} is no command of cad/locales/en.json`)
    let english: CommandNotes
    try {
      english = readNotes(root, id, locales.english)!
    } catch (error) {
      report(englishFile, (error as Error).message)
      continue
    }
    const entry = (() => {
      try {
        return coverageEntry(root, id)
      } catch (error) {
        report(englishFile, (error as Error).message)
        return undefined
      }
    })()
    if (english.data.sourceHash !== undefined) report(englishFile, "the English notes are the source: no sourceHash")
    if (entry) {
      const hash = coverageHash(entry)
      if (english.data.coverage !== hash) {
        report(
          englishFile,
          `out of date with its entry in ${COVERAGE_DIR}/${entry.file} ("${entry.heading}"): say what it lacks as its Missing does, then set coverage: "${hash}"`
        )
      }
      if (Boolean(entry.missing) !== Boolean(english.missing)) {
        report(englishFile, entry.missing ? "its coverage entry lists what it lacks: so does ## Missing" : "its coverage entry lacks nothing: no ## Missing")
      }
    }
    for (const other of english.data.related ?? []) {
      if (!(other in names)) report(englishFile, `related: ${other} is no command of cad/locales/en.json`)
    }
    const hash = sourceHash(notesSource(root, id))
    for (const locale of locales.all) {
      const file = `${COMMAND_NOTES_DIR}/${localizedFile(id, locale, "md")}`
      const page = `${COMMAND_PAGES_DIR}/${localizedFile(id, locale, "mdx")}`
      let notes: CommandNotes | undefined
      try {
        notes = readNotes(root, id, locale)
      } catch (error) {
        report(file, (error as Error).message)
        continue
      }
      if (!notes) {
        if (locales.live.includes(locale)) report(file, `missing: ${id}'s notes in ${locale}, a live language`)
        continue
      }
      if (!existsSync(path.join(/*turbopackIgnore: true*/ root, page))) {
        report(page, `missing: run npx vitest run lib/docs/generate.test.ts -u`)
      }
      const elements = notesElements(readFileSync(path.join(/*turbopackIgnore: true*/ root, file), "utf8"))
      const named = [...elements.keywords, ...notes.options.map((option) => ({ command: undefined, id: option.id }))]
      for (const { command, id: keyword } of named) {
        if (!(keyword in (keywords[command ?? id] ?? {}))) {
          report(file, `${keyword} is no keyword of ${command ?? id} (cad/locales/en.json)`)
        }
      }
      for (const other of elements.commands) {
        if (!(other in names)) report(file, `<Command id="${other}" /> names no command of cad/locales/en.json`)
      }
      for (const message of elements.messages) {
        if (typeof catalog.commands?.messages?.[message] !== "string") {
          report(file, `<Message id="${message}" /> names no message of cad/locales/en.json without arguments`)
        }
      }
      if (locale === locales.english) continue
      for (const key of ["related", "coverage"] as const) {
        if (notes.data[key] !== undefined) report(file, `${key} is the English notes' alone`)
      }
      if (notes.data.sourceHash !== hash) {
        report(file, `out of date with ${englishFile}: bring it up to date, then set sourceHash: "${hash}"`)
      }
      const ids = (from: CommandNotes) => from.options.map((option) => option.id).join(", ")
      if (ids(notes) !== ids(english)) report(file, `its options are the English notes', in order: ${ids(english)}`)
      if (notes.questions.length !== english.questions.length) {
        report(file, `it answers the English notes' ${english.questions.length} questions`)
      }
      if (Boolean(notes.missing) !== Boolean(english.missing)) {
        report(file, `## Missing goes with the English notes'`)
      }
      if (Boolean(notes.data.before) !== Boolean(english.data.before)) {
        report(file, `before goes with the English notes'`)
      }
    }
  }
}
