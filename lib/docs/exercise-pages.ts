import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { frontmatter } from "fumadocs-core/content/md/frontmatter"

import { notesElements } from "./command-pages.ts"
import { DOCS_PATH } from "./packages.ts"
import { sourceHash } from "./use.ts"

/**
 * The practice library: an exercise's own page (`/docs/exercises/gasket`),
 * written by `lib/docs/generate.test.ts` from its notes — the statement and
 * what each step does, in each language — and from what only the engine
 * knows: the drawing, each step drawn with its history, the commands it
 * practises. This file reads the notes without the engine, so `docs:check`
 * holds them too.
 */

export const EXERCISES_PATH = `${DOCS_PATH}/exercises`

/** The notes, one file per exercise and language: `gasket.md`, `gasket.es.md`. */
export const EXERCISE_NOTES_DIR = "content/exercises"

/** The generated pages, beside the index that lists them (`index.mdx`). */
export const EXERCISE_PAGES_DIR = "content/docs/exercises"

const LOCALE_SUFFIX = /\.([a-z]{2}(?:-[A-Z]{2})?)\.mdx?$/

/** An exercise's page, unprefixed: `/docs/exercises/gasket`. */
export function exercisePagePath(slug: string): string {
  return `${EXERCISES_PATH}/${slug}`
}

/** A file's name for an exercise in a language: `gasket.md`, `gasket.es.mdx`. */
export function exerciseFile(slug: string, locale: string, extension: "md" | "mdx", english = "en"): string {
  return locale === english ? `${slug}.${extension}` : `${slug}.${locale}.${extension}`
}

export interface ExerciseNotesData {
  /** The page's heading and its step in the breadcrumbs: the words a search uses, first. */
  readonly title: string
  /** Its title in search results, when the heading needs more words there. */
  readonly metaTitle?: string
  readonly description: string
  /** What the drawing shows: its caption and its accessible name. */
  readonly figure: string
  /** A 3D exercise: the caption of the finished solid. */
  readonly model?: string
  /** A translation: `sourceHash` of the English notes it says. */
  readonly sourceHash?: string
}

export interface ExerciseStepNotes {
  /** The step's id, its anchor: the script's step it describes. */
  readonly id: string
  readonly title: string
  readonly text: string
}

export interface ExerciseNotes {
  readonly slug: string
  readonly locale: string
  readonly data: ExerciseNotesData
  /** What to draw, and with what, before the steps. */
  readonly statement: string
  readonly steps: readonly ExerciseStepNotes[]
}

/**
 * A notes file: its frontmatter, the statement, then `## Steps`, a
 * `### Title [#id]` per step of its script, in order. Ids are the same in
 * every language; titles are each language's.
 */
export function parseExerciseNotes(text: string, file: string): ExerciseNotes {
  const { data, content } = frontmatter(text)
  const fields = data as Record<string, unknown>
  for (const key of ["title", "description", "figure"] as const) {
    if (typeof fields[key] !== "string" || !(fields[key] as string).trim()) {
      throw new Error(`${file}: frontmatter ${key} is missing`)
    }
  }
  for (const key of ["figure", "model"] as const) {
    if (typeof fields[key] === "string" && (fields[key] as string).includes('"')) {
      throw new Error(`${file}: the ${key} caption is an attribute, without "`)
    }
  }
  const [statement, ...sections] = content.split(/^## +/m)
  if (!statement.trim()) throw new Error(`${file}: the statement is missing`)
  if (sections.length !== 1 || !sections[0].startsWith("Steps\n")) {
    throw new Error(`${file}: after the statement comes ## Steps, and nothing else`)
  }
  const parts = sections[0].slice("Steps\n".length).split(/^### +/m)
  if (parts[0].trim()) throw new Error(`${file}: ## Steps has text before its first ###`)
  const steps = parts.slice(1).map((part) => {
    const [heading, ...rest] = part.split("\n")
    const match = /^(.*\S)\s+\[#([a-zA-Z0-9-]+)\]\s*$/.exec(heading)
    if (!match) throw new Error(`${file}: "### ${heading}" is a title and its [#id]`)
    const body = rest.join("\n").trim()
    if (!body) throw new Error(`${file}: "### ${heading}" says nothing`)
    return { title: match[1], id: match[2], text: body }
  })
  if (steps.length === 0) throw new Error(`${file}: ## Steps has none`)
  const name = path.basename(file)
  return {
    slug: name.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.md$/, ""),
    locale: LOCALE_SUFFIX.exec(name)?.[1] ?? "en",
    data: fields as unknown as ExerciseNotesData,
    statement: statement.trim(),
    steps,
  }
}

/** The exercises with notes, by slug: those with a page of their own. */
export function notedExercises(root: string): string[] {
  const dir = path.join(/*turbopackIgnore: true*/ root, EXERCISE_NOTES_DIR)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".md") && !LOCALE_SUFFIX.test(file))
    .map((file) => file.replace(/\.md$/, ""))
    .sort()
}

/** An exercise's notes in a language, or `undefined` when it has none. */
export function readExerciseNotes(root: string, slug: string, locale: string): ExerciseNotes | undefined {
  const file = path.join(/*turbopackIgnore: true*/ root, EXERCISE_NOTES_DIR, exerciseFile(slug, locale, "md"))
  if (!existsSync(file)) return undefined
  return parseExerciseNotes(readFileSync(file, "utf8"), path.relative(root, file))
}

type Catalog = { commands?: { names?: Record<string, readonly string[]>; keywords?: Record<string, Record<string, string>> } }

/**
 * What `docs:check` holds the exercises' notes and pages to, each problem told
 * to `report`: every page has notes and every notes file its pages, in each
 * live language; a translation says the English it was written from
 * (`sourceHash`), with the same steps in the same order and a model's caption
 * where the English has one; and every command and keyword they name is the
 * engine's. That the steps are the script's is the generator's to check: it
 * runs the engine.
 */
export function checkExerciseNotes(
  root: string,
  locales: { all: readonly string[]; live: readonly string[]; english: string },
  report: (file: string, message: string) => void
): void {
  const catalog = JSON.parse(readFileSync(path.join(/*turbopackIgnore: true*/ root, "cad/locales/en.json"), "utf8")) as Catalog
  const names = catalog.commands?.names ?? {}
  const keywords = catalog.commands?.keywords ?? {}
  const noted = notedExercises(root)
  const notesDir = path.join(/*turbopackIgnore: true*/ root, EXERCISE_NOTES_DIR)
  const pagesDir = path.join(/*turbopackIgnore: true*/ root, EXERCISE_PAGES_DIR)

  for (const file of existsSync(notesDir) ? readdirSync(notesDir) : []) {
    const slug = file.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.md$/, "")
    if (!file.endsWith(".md") || !noted.includes(slug)) {
      report(`${EXERCISE_NOTES_DIR}/${file}`, "an exercise's notes are <slug>.md, with its English beside it")
    }
  }
  for (const file of existsSync(pagesDir) ? readdirSync(pagesDir) : []) {
    if (/^index(\.[a-z]{2}(?:-[A-Z]{2})?)?\.mdx$/.test(file) || file === "meta.json") continue
    const slug = file.replace(/(\.[a-z]{2}(?:-[A-Z]{2})?)?\.mdx$/, "")
    const locale = LOCALE_SUFFIX.exec(file)?.[1] ?? locales.english
    if (!existsSync(path.join(notesDir, exerciseFile(slug, locale, "md", locales.english)))) {
      report(`${EXERCISE_PAGES_DIR}/${file}`, `no notes write it (${EXERCISE_NOTES_DIR}/${exerciseFile(slug, locale, "md", locales.english)})`)
    }
  }

  for (const slug of noted) {
    const englishFile = `${EXERCISE_NOTES_DIR}/${exerciseFile(slug, locales.english, "md", locales.english)}`
    let english: ExerciseNotes
    try {
      english = readExerciseNotes(root, slug, locales.english)!
    } catch (error) {
      report(englishFile, (error as Error).message)
      continue
    }
    if (english.data.sourceHash !== undefined) report(englishFile, "the English notes are the source: no sourceHash")
    const hash = sourceHash(readFileSync(path.join(/*turbopackIgnore: true*/ root, englishFile), "utf8"))
    for (const locale of locales.all) {
      const file = `${EXERCISE_NOTES_DIR}/${exerciseFile(slug, locale, "md", locales.english)}`
      const page = `${EXERCISE_PAGES_DIR}/${exerciseFile(slug, locale, "mdx", locales.english)}`
      let notes: ExerciseNotes | undefined
      try {
        notes = readExerciseNotes(root, slug, locale)
      } catch (error) {
        report(file, (error as Error).message)
        continue
      }
      if (!notes) {
        if (locales.live.includes(locale)) report(file, `missing: ${slug}'s notes in ${locale}, a live language`)
        continue
      }
      if (!existsSync(path.join(/*turbopackIgnore: true*/ root, page))) {
        report(page, "missing: run npx vitest run lib/docs/generate.test.ts -u")
      }
      const elements = notesElements(readFileSync(path.join(/*turbopackIgnore: true*/ root, file), "utf8"))
      for (const { command, id } of elements.keywords) {
        if (!command || !(id in (keywords[command] ?? {}))) {
          report(file, `<Keyword command="${command ?? ""}" id="${id}" /> names no keyword of cad/locales/en.json`)
        }
      }
      for (const other of elements.commands) {
        if (!(other in names)) report(file, `<Command id="${other}" /> names no command of cad/locales/en.json`)
      }
      if (elements.messages.length > 0) report(file, "an exercise's notes name no <Message />")
      if (locale === locales.english) continue
      if (notes.data.sourceHash !== hash) {
        report(file, `out of date with ${englishFile}: bring it up to date, then set sourceHash: "${hash}"`)
      }
      const ids = (from: ExerciseNotes) => from.steps.map((step) => step.id).join(", ")
      if (ids(notes) !== ids(english)) report(file, `its steps are the English notes', in order: ${ids(english)}`)
      if (Boolean(notes.data.model) !== Boolean(english.data.model)) {
        report(file, "model goes with the English notes'")
      }
    }
  }
}
