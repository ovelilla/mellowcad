import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { frontmatter as readFrontmatter } from "fumadocs-core/content/md/frontmatter"
import {
  commandCatalog,
  demo,
  engineText,
  recordDemo,
  type EngineLocale,
  type EngineText,
} from "@mellowcad/engine"
import type { EditorLocale } from "@mellowcad/editor"
import { en as editorEnglish } from "@mellowcad/editor/locales/en"

import { COMMAND_GROUPS } from "@/content/commands"
import { EXERCISES, LEVELS, isExerciseSlug, type ExerciseSlug } from "@/content/demos/exercises"
import { exerciseCommands } from "@/content/demos/exercises/exercise"
import { exerciseSessionName } from "@/content/demos/exercises/sessions"
import { loadEditorLocale } from "@/i18n/editor"
import { loadEngineLocale } from "@/i18n/engine"
import { loadMessages } from "@/i18n/messages"
import { localePath } from "@/i18n/navigation"
import { DIRECTION, routing, type AppLocale } from "@/i18n/routing"
import { autocadCommands, type CatalogCommand } from "@/lib/facts"
import { EDITOR_PATH, REPOSITORY_URL } from "@/lib/site"
import en from "@/messages/en.json"

import {
  COMMANDS_PATH,
  commandPagePath,
  commandSlug,
  coverageEntry,
  notedCommands,
  readNotes,
  type CommandNotes,
} from "./command-pages"
import {
  EXERCISES_PATH,
  exercisePagePath,
  readExerciseNotes,
} from "./exercise-pages"
import {
  SHORTCUT_SECTIONS,
  type KeyCombo,
  type Shortcut,
  type ShortcutMode,
} from "./shortcuts"
import { COVERAGE_DIR, GUIDE_PAGES, githubAnchor } from "./use"

/** The generated pages that are not a command's own, by their file's base. */
export const GENERATED_PAGES = {
  commands: "commands/index",
  shortcuts: "shortcuts",
  exercises: "exercises/index",
} as const

export type GeneratedPage = keyof typeof GENERATED_PAGES

/**
 * The pages of "Use MellowCAD" a test writes from their sources (the
 * engine's catalog, the site's messages, `docs/coverage/`), as plain Markdown
 * so search, the `.md` and `llms.txt` read them as any other page. Nothing
 * here is typed in: a word is the engine's or a message.
 */

export const GENERATOR = "lib/docs/generate.test.ts"

type Messages = typeof en

/**
 * Whether `locale` has its own version of a generated page: English always,
 * another language once its site catalog names the page. Until then a draft
 * is served the English page, as its missing keys are.
 */
export async function translatesPage(locale: AppLocale, page: GeneratedPage): Promise<boolean> {
  if (locale === routing.defaultLocale) return true
  const own = (await import(`@/messages/${locale}.json`)) as {
    default: { Docs?: { pages?: Partial<Record<string, unknown>> } }
  }
  return own.default.Docs?.pages?.[page] !== undefined
}

/** Text as Markdown, its marks escaped (MDX also reads `{` and `<`). */
function prose(text: string): string {
  return text.replace(/[\\`*_{}[\]<>#|]/g, (mark) => `\\${mark}`)
}

/** A message written as Markdown (a page's lead): only what MDX reads is escaped. */
function markdown(text: string): string {
  return text.replace(/[{}<>]/g, (mark) => `\\${mark}`)
}

/**
 * A left-to-right run (a command's name) as right-to-left text holds it,
 * between FSI and PDI, as the catalogs write one (`i18n.md`): `-HATCH` read
 * `HATCH-` in an Arabic heading and its table of contents.
 */
function isolate(text: string, locale: AppLocale): string {
  return DIRECTION[locale] === "rtl" ? `\u2068${text}\u2069` : text
}

/** A code span that holds `text`, however many backticks it has. */
function code(text: string): string {
  const fence = "`".repeat((text.match(/`+/g) ?? [""]).reduce((a, b) => (b.length > a ? b.length : a), 0) + 1)
  const pad = text.startsWith("`") || text.endsWith("`") ? " " : ""
  return `${fence}${pad}${text}${pad}${fence}`
}

function frontmatter(fields: Record<string, unknown>): string {
  const lines = Object.entries(fields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  return `---\n${lines.join("\n")}\n---\n`
}

/**
 * Where `docs/coverage/` documents a command: the first `###` heading naming
 * it in a code span. A command with none fails the page.
 */
export function coverageUrl(id: string, root = process.cwd()): string {
  const { file, heading } = coverageEntry(root, id)
  return `${REPOSITORY_URL}/blob/main/${COVERAGE_DIR}/${file}#${githubAnchor(heading)}`
}

/** What a command asks first, as the history writes it; null when it asks nothing. */
async function firstPrompt(id: string, locale: EngineLocale | undefined): Promise<string | null> {
  const recording = await recordDemo(demo().command(`_${id}`).escape(), { locale })
  const echo = recording.steps.at(-1)?.prompt.echo
  return echo ? echo.map((segment) => segment.text).join("") : null
}

/** A page's file for `locale`: `shortcuts.mdx`, `commands/index.es.mdx`. */
export function pageFile(page: GeneratedPage, locale: AppLocale): string {
  const base = GENERATED_PAGES[page]
  return locale === routing.defaultLocale ? `${base}.mdx` : `${base}.${locale}.mdx`
}

/**
 * A command as a heading names it: in the page's command language and, where
 * that is not the global name (`DESFASE`), with it, as both are searched.
 */
function commandHeading(command: Pick<CatalogCommand, "id" | "name">, locale: AppLocale): string {
  const name = command.name === command.id ? command.name : `${command.name} (${command.id})`
  return isolate(prose(name), locale)
}

/**
 * The command reference: every AutoCAD command by ribbon panel, named as the
 * page's command language names it, with its aliases, its description, the
 * first prompt it shows and its coverage notes. Anchors are global names
 * (`#line`), the same in every language.
 */
export async function commandsPage(locale: AppLocale): Promise<string> {
  const t = await loadMessages(locale)
  const engineLocale = await loadEngineLocale(locale)
  const commands = autocadCommands(engineLocale)
  const page = t.Docs.pages.commands
  const blocks: string[] = [markdown(page.lead)]
  for (const group of COMMAND_GROUPS) {
    blocks.push(`## ${prose(t.Groups[group])} [#${group}]`)
    for (const command of commands.filter((entry) => entry.group === group)) {
      const prompt = await firstPrompt(command.id, engineLocale)
      const notes = readNotes(process.cwd(), command.id, locale)
      // A command with a page of its own leads there, its notes' title the
      // link's words; one without, to what its coverage entry says.
      const more = notes
        ? `- [${prose(notes.data.title)}](${commandPagePath(command.id)})`
        : `- [${prose(t.Docs.reference.coverage)}](${coverageUrl(command.id)})`
      const facts = [
        command.aliases.length > 0 &&
          `- ${label(t.Docs.reference.aliases, locale)} ${command.aliases.map(code).join(", ")}`,
        prompt && `- ${label(t.Docs.reference.firstPrompt, locale)} ${code(prompt)}`,
        more,
      ].filter(Boolean)
      blocks.push(
        `### ${commandHeading(command, locale)} [#${commandSlug(command.id)}]`,
        prose(command.description),
        facts.join("\n")
      )
    }
  }
  return `${frontmatter({
    title: page.title,
    metaTitle: page.metaTitle,
    description: page.description,
    type: "reference",
    generated: GENERATOR,
  })}\n${blocks.join("\n\n")}\n`
}

/** Where the editor's catalog names each mode: its status bar or command line. */
const MODE_LABELS: Record<ShortcutMode, readonly [string, string]> = {
  commandHistory: ["CommandLine", "history"],
  commandLine: ["CommandLine", "label"],
  objectSnap: ["StatusBar", "objectSnap"],
  selectionCycling: ["StatusBar", "selectionCycling"],
  grid: ["StatusBar", "grid"],
  ortho: ["StatusBar", "ortho"],
  snapMode: ["StatusBar", "snapMode"],
  polarTracking: ["StatusBar", "polarTracking"],
  objectSnapTracking: ["StatusBar", "objectSnapTracking"],
}

/** A plain message of the editor's catalog, English where `locale` has none. */
function editorText(locale: EditorLocale | undefined, [group, key]: readonly [string, string]): string {
  for (const catalog of [locale, editorEnglish]) {
    const messages = catalog?.messages as Record<string, Record<string, unknown> | undefined> | undefined
    const text = messages?.[group]?.[key]
    if (typeof text === "string") return text
  }
  throw new Error(`The editor's catalog has no ${group}.${key}`)
}

/** A key combination as the page's language prints it (`Ctrl+Mayús+S`). */
function comboText(combo: KeyCombo, keys: Messages["Docs"]["keys"]): string {
  const named: Record<string, string> = {
    " ": keys.space,
    Enter: keys.enter,
    Escape: keys.escape,
    Tab: keys.tab,
    ArrowUp: keys.up,
    ArrowDown: keys.down,
  }
  return [combo.ctrl && "Ctrl", combo.shift && keys.shift, named[combo.key] ?? combo.key]
    .filter(Boolean)
    .join("+")
}

/**
 * The keyboard shortcuts, by section: each key as the page's language prints
 * it, what it does in the words of whatever names it — the engine's catalog
 * for a command, the editor's for a mode, the messages for the rest — and
 * the command it runs, in the page's command language.
 */
export async function shortcutsPage(locale: AppLocale): Promise<string> {
  const t = await loadMessages(locale)
  const engineLocale = await loadEngineLocale(locale)
  const editorLocale = await loadEditorLocale(locale)
  const catalog = new Map(commandCatalog(engineLocale).map((command) => [command.id, command]))
  const command = (id: string) => {
    const found = catalog.get(id)
    if (!found) throw new Error(`No command ${id} in the engine's catalog`)
    return found
  }
  const labels = t.Docs.shortcuts
  const describe = ({ action }: Shortcut): [string, string] => {
    if ("command" in action) {
      return [
        prose(command(action.command[0]).description),
        action.command.map((id) => code(command(id).name)).join(" / "),
      ]
    }
    if ("mode" in action) return [prose(editorText(editorLocale, MODE_LABELS[action.mode])), ""]
    return [markdown(labels[action.behaviour]), ""]
  }
  const blocks: string[] = [markdown(t.Docs.pages.shortcuts.lead)]
  for (const section of SHORTCUT_SECTIONS) {
    const rows = (section.shortcuts as readonly Shortcut[]).map((shortcut) => {
      const keys = shortcut.keys.map((combo) => code(comboText(combo, t.Docs.keys))).join(", ")
      return `| ${[keys, ...describe(shortcut)].join(" | ")} |`
    })
    blocks.push(
      `## ${prose(labels.sections[section.id])} [#${section.id.toLowerCase()}]`,
      [
        `| ${prose(labels.key)} | ${prose(labels.action)} | ${prose(labels.command)} |`,
        "| --- | --- | --- |",
        ...rows,
      ].join("\n")
    )
  }
  const page = t.Docs.pages.shortcuts
  return `${frontmatter({
    title: page.title,
    metaTitle: page.metaTitle,
    description: page.description,
    type: "reference",
    generated: GENERATOR,
  })}\n${blocks.join("\n\n")}\n`
}

/**
 * A message as Markdown prose with its arguments filled in: `{name}` by its
 * value, and `<tag>words</tag>` by what `tags` makes of the words (a link),
 * both kept out of the escaping. The site's messages are plain ICU; these
 * have no plural or select.
 */
function fill(
  message: string,
  values: Record<string, string>,
  tags: Record<string, (words: string) => string> = {}
): string {
  const kept: string[] = []
  const keep = (markdown: string) => `\u0000${kept.push(markdown) - 1}\u0000`
  const marked = message
    .replace(/<(\w+)>(.*?)<\/\1>/g, (_, tag: string, words: string) => {
      const make = tags[tag]
      if (!make) throw new Error(`No tag <${tag}> for "${message}"`)
      return keep(make(prose(words)))
    })
    .replace(/\{(\w+)\}/g, (_, name: string) => {
      if (!(name in values)) throw new Error(`No value {${name}} for "${message}"`)
      return keep(values[name])
    })
  return prose(marked).replace(/\u0000(\d+)\u0000/g, (_, index: string) => kept[Number(index)])
}

/** An option's anchor: its global id in lower case, words joined by `-`. */
export function optionAnchor(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "list"
}

/**
 * How each language ends a label before its value: French spaces the colon,
 * with a no-break space (docs/i18n/fr.md, "Register").
 */
const LABEL_END: Record<AppLocale, string> = {
  en: ":",
  es: ":",
  "pt-BR": ":",
  ar: ":",
  fr: "\u00a0:",
  it: ":",
  de: ":",
}

/** A list item's bold label, ended as its language ends one. */
function label(text: string, locale: AppLocale): string {
  return `**${prose(text)}${LABEL_END[locale]}**`
}

/** How each language quotes a phrase in running text. */
const QUOTES: Record<AppLocale, readonly [string, string]> = {
  en: ["\u201c", "\u201d"],
  es: ["\u00ab", "\u00bb"],
  "pt-BR": ["\u201c", "\u201d"],
  ar: ["\u00ab", "\u00bb"],
  // French typography spaces its guillemets, with a no-break space (docs/i18n/fr.md).
  fr: ["\u00ab\u00a0", "\u00a0\u00bb"],
  it: ["\u00ab", "\u00bb"],
  // German quotes low, then high: „…“ (docs/i18n/de.md).
  de: ["\u201e", "\u201c"],
}

/**
 * Markdown as plain text, for structured data: links and marks dropped, and
 * code bare — a name or a letter — or quoted when it is a message.
 */
function plainText(markdown: string, locale: AppLocale): string {
  const [open, close] = QUOTES[locale]
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`+([^`]*)`+/g, (_, inner: string) => (inner.includes(" ") ? `${open}${inner}${close}` : inner))
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/[\u2068\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * A notes text with the engine's words put in: `<Keyword id="Through" />` is
 * the keyword as the command language spells it, `<Message id="…" />` what
 * the command line says, `<Command id="TRIM" />` the command's name, a link to
 * its page when it has one. Notes never type them: in Spanish Through is
 * `Atravesar`, and the engine is the one to say so.
 */
function engineWords(
  markdown: string,
  command: string,
  text: EngineText,
  paged: ReadonlySet<string>
): string {
  return markdown
    .replace(/<Keyword\s+(?:command="([^"]+)"\s+)?id="([^"]+)"\s*\/>/g, (_, other: string | undefined, id: string) =>
      code(text.keyword(other ?? command, id))
    )
    .replace(/<Message\s+id="([^"]+)"\s*\/>/g, (_, id: string) =>
      code(text.message(id as Parameters<EngineText["message"]>[0]))
    )
    .replace(/<Command\s+id="([^"]+)"\s*\/>/g, (_, id: string) => {
      const [name] = text.commandNames(id)
      if (!name) throw new Error(`<Command id="${id}" /> names no command`)
      return id !== command && paged.has(id) ? `[${code(name)}](${commandPagePath(id)})` : code(name)
    })
}

/**
 * A command's own page in `locale`: its notes (the lead, what each option
 * does, what it lacks, the questions people search) around what the engine
 * says — its names and aliases, each keyword as the command language spells
 * it and its letters, and a session it draws and writes the history of. The
 * page is the notes' language's; a live language without them fails here.
 */
export async function commandPage(id: string, locale: AppLocale): Promise<string> {
  const root = process.cwd()
  const notes = readNotes(root, id, locale)
  const english = readNotes(root, id, routing.defaultLocale)
  if (!notes || !english) throw new Error(`${id} has no notes in ${locale} (${COMMAND_NOTES_NOTE})`)
  const t = await loadMessages(locale)
  const labels = t.Docs.command
  const engineLocale = await loadEngineLocale(locale)
  const text = engineText(engineLocale)
  const command = autocadCommands(engineLocale).find((entry) => entry.id === id)
  if (!command) throw new Error(`${id} is no AutoCAD command of the engine's catalog`)
  const paged = new Set(notedCommands(root))
  const words = (markdown: string) => engineWords(markdown, id, text, paged)

  const access = [
    `- ${label(labels.command, locale)} ${code(command.name)}`,
    command.name !== command.id &&
      `- ${label(labels.english, locale)} ${fill(labels.englishValue, { name: code(command.id), typed: code(`_${command.id}`) })}`,
    command.aliases.length > 0 &&
      `- ${label(t.Docs.reference.aliases, locale)} ${command.aliases.map(code).join(", ")}`,
    `- ${label(labels.panel, locale)} [${prose(t.Groups[command.group])}](${COMMANDS_PATH}#${command.group})`,
    `- ${label(labels.try, locale)} ${fill(labels.tryText, { key: code(command.key) }, { editor: (words) => `[${words}](${localePath(locale, EDITOR_PATH)})` })}`,
  ].filter(Boolean)

  const blocks: string[] = [
    words(notes.lead),
    access.join("\n"),
    `## ${prose(labels.session)} [#session]`,
    prose(labels.sessionLead),
    notes.data.before && `<Session name="${commandSlug(id)}Before" caption="${notes.data.before}" />`,
    `<Session name="${commandSlug(id)}" caption="${notes.data.figure}" />`,
  ].filter((block): block is string => Boolean(block))

  if (notes.options.length > 0) {
    blocks.push(`## ${prose(labels.options)} [#options]`)
    for (const option of notes.options) {
      // As the prompt lists it: Spanish OFFSET's Through is `punto a Atravesar`.
      const word = text.keywordLabel(id, option.id) ?? text.keyword(id, option.id)
      const letters = text.abbreviation(id, option.id)
      const name = letters && letters !== word ? `${code(word)} (${code(letters)})` : code(word)
      blocks.push(`### ${isolate(name, locale)} [#${optionAnchor(option.id)}]`, words(option.text))
    }
  }

  const coverage = `[${prose(t.Docs.reference.coverage)}](${coverageUrl(id, root)})`
  if (notes.missing) {
    blocks.push(`## ${prose(labels.missing)} [#missing]`, words(notes.missing), coverage)
  }

  blocks.push(`## ${prose(labels.questions)} [#questions]`)
  for (const { question, answer } of notes.questions) {
    blocks.push(`### ${words(question)}`, words(answer))
  }

  // The exercises whose solution runs it, in the library's order.
  const practice = (Object.keys(EXERCISES) as ExerciseSlug[]).flatMap((slug) => {
    const exercise = readExerciseNotes(root, slug, locale)
    return exercise && exerciseCommands(EXERCISES[slug].exercise).includes(id)
      ? [`- [${prose(exercise.data.title)}](${exercisePagePath(slug)})`]
      : []
  })
  if (practice.length > 0) {
    blocks.push(`## ${prose(labels.practice)} [#practice]`, practice.join("\n"))
  }

  const related = english.data.related ?? []
  if (related.length > 0) {
    const catalog = new Map(autocadCommands(engineLocale).map((entry) => [entry.id, entry]))
    blocks.push(
      `## ${prose(labels.related)} [#related]`,
      related
        .map((other) => {
          const entry = catalog.get(other)
          if (!entry) throw new Error(`${id}'s related ${other} is no AutoCAD command of the engine's catalog`)
          const page = readNotes(root, other, locale)
          return page
            ? `- [${prose(page.data.title)}](${commandPagePath(other)})`
            : `- [${commandHeading(entry, locale)}](${COMMANDS_PATH}#${commandSlug(other)}): ${prose(entry.description)}`
        })
        .join("\n")
    )
  }
  if (!notes.missing) blocks.push(coverage)

  return `${frontmatter({
    title: notes.data.title,
    metaTitle: notes.data.metaTitle,
    description: notes.data.description,
    type: "reference",
    generated: GENERATOR,
    faq: notes.questions.map(({ question, answer }) => ({
      question: plainText(words(question), locale),
      answer: plainText(words(answer), locale),
    })),
  })}\n${blocks.join("\n\n")}\n`
}

/** Where a command's notes are, for an error that names them. */
const COMMAND_NOTES_NOTE = "content/commands/"

/**
 * The commands an exercise practises, as its page lists them: each named in
 * the page's command language, leading to its own page where it has one and
 * to its entry in the reference where not.
 */
function practisedCommands(slug: ExerciseSlug, text: EngineText, paged: ReadonlySet<string>): string {
  return exerciseCommands(EXERCISES[slug].exercise)
    .map((id) => {
      const [name] = text.commandNames(id)
      if (!name) throw new Error(`${slug} runs ${id}, no command of the engine's catalog`)
      return `[${code(name)}](${paged.has(id) ? commandPagePath(id) : `${COMMANDS_PATH}#${commandSlug(id)}`})`
    })
    .join(", ")
}

/** An exercise's level, discipline and kind of drawing, as a line. */
function exerciseKind(slug: ExerciseSlug, labels: Messages["Docs"]["exercise"]): string {
  const { level, discipline, space } = EXERCISES[slug]
  return [labels.levels[level], labels.disciplines[discipline], labels.spaces[space]].join(" · ")
}

/**
 * An exercise's own page in `locale`: its notes (the statement, what each
 * step does) around what the engine draws and writes — the drawing, the solid
 * a 3D one ends in, each step drawn as far as it goes with its history — and
 * the commands its solution runs. A link opens it in the editor with its
 * drawing (`/draw?drawing=gasket`).
 */
export async function exercisePage(slug: string, locale: AppLocale): Promise<string> {
  const root = process.cwd()
  if (!isExerciseSlug(slug)) throw new Error(`${slug} is no exercise of content/demos/exercises`)
  const notes = readExerciseNotes(root, slug, locale)
  if (!notes) throw new Error(`${slug} has no notes in ${locale} (content/exercises/)`)
  const { exercise } = EXERCISES[slug]
  const ids = (steps: readonly { id: string }[]) => steps.map((step) => step.id).join(", ")
  if (ids(notes.steps) !== ids(exercise.steps)) {
    throw new Error(`${slug}'s notes in ${locale} tell the steps ${ids(notes.steps)}; its script takes ${ids(exercise.steps)}`)
  }
  const t = await loadMessages(locale)
  const labels = t.Docs.exercise
  const text = engineText(await loadEngineLocale(locale))
  const paged = new Set(notedCommands(root))
  const words = (markdown: string) => engineWords(markdown, "", text, paged)
  const editor = `${localePath(locale, EDITOR_PATH)}?drawing=${slug}`

  const facts = [
    `- ${label(labels.kind, locale)} ${prose(exerciseKind(slug, labels))}`,
    `- ${label(labels.commands, locale)} ${practisedCommands(slug, text, paged)}`,
    `- ${label(labels.editor, locale)} ${fill(labels.editorText, {}, { editor: (words) => `[${words}](${editor})` })}`,
  ]
  const blocks: string[] = [
    words(notes.statement),
    facts.join("\n"),
    `## ${prose(labels.drawing)} [#drawing]`,
    `<Session name="${exerciseSessionName(slug)}" caption="${notes.data.figure}" />`,
  ]
  if (notes.data.model) {
    blocks.push(`<Session name="${exerciseSessionName(slug, "model")}" caption="${notes.data.model}" />`)
  }
  blocks.push(`## ${prose(labels.steps)} [#steps]`, prose(labels.stepsLead))
  notes.steps.forEach((step, index) => {
    const title = `${index + 1}. ${step.title}`
    blocks.push(
      `### ${prose(title)} [#${step.id}]`,
      words(step.text),
      `<Session name="${exerciseSessionName(slug, step.id)}" caption="${title}" />`
    )
  })

  // The next ones in the library's order, round to its start.
  const slugs = Object.keys(EXERCISES) as ExerciseSlug[]
  const at = slugs.indexOf(slug)
  const more = [1, 2, 3].map((step) => slugs[(at + step) % slugs.length])
  blocks.push(
    `## ${prose(labels.more)} [#more]`,
    [
      ...more.map((other) => {
        const page = readExerciseNotes(root, other, locale)
        if (!page) throw new Error(`${other} has no notes in ${locale}`)
        return `- [${prose(page.data.title)}](${exercisePagePath(other)}): ${prose(exerciseKind(other, labels))}`
      }),
      `- [${prose(t.Docs.pages.exercises.title)}](${EXERCISES_PATH})`,
    ].join("\n")
  )

  return `${frontmatter({
    title: notes.data.title,
    metaTitle: notes.data.metaTitle,
    description: notes.data.description,
    type: "practice",
    generated: GENERATOR,
  })}\n${blocks.join("\n\n")}\n`
}

/**
 * The how-to guides as a list, each its title and description in `locale`,
 * read from its page: a live language has its own (`docs:check`).
 */
function guideLinks(locale: AppLocale): string {
  return GUIDE_PAGES.map((guide) => {
    const own = path.join(process.cwd(), "content/docs", locale === routing.defaultLocale ? `${guide}.mdx` : `${guide}.${locale}.mdx`)
    const file = existsSync(own) ? own : path.join(process.cwd(), "content/docs", `${guide}.mdx`)
    const { title, description } = readFrontmatter(readFileSync(file, "utf8")).data as {
      title: string
      description: string
    }
    return `- [${prose(title)}](/docs/${guide}): ${prose(description)}`
  }).join("\n")
}

/**
 * The practice library's index: every exercise by level, each with its
 * drawing, what it is and the commands it practises; then how they open in
 * the editor and the questions its searchers ask.
 */
export async function exercisesPage(locale: AppLocale): Promise<string> {
  const root = process.cwd()
  const t = await loadMessages(locale)
  const page = t.Docs.pages.exercises
  const labels = t.Docs.exercise
  const text = engineText(await loadEngineLocale(locale))
  const paged = new Set(notedCommands(root))
  const slugs = Object.keys(EXERCISES) as ExerciseSlug[]
  const blocks: string[] = [markdown(page.lead)]
  for (const level of LEVELS) {
    blocks.push(`## ${prose(labels.levels[level])} [#${level}]`)
    for (const slug of slugs.filter((other) => EXERCISES[other].level === level)) {
      const notes = readExerciseNotes(root, slug, locale)
      if (!notes) throw new Error(`${slug} has no notes in ${locale} (content/exercises/)`)
      // No link in a heading: the table of contents puts each heading in
      // a link of its own. The exercise's own page is the list's last line.
      blocks.push(
        `### ${prose(notes.data.title)} [#${slug}]`,
        `<Session name="${exerciseSessionName(slug)}" caption="${notes.data.figure}" />`,
        prose(notes.data.description),
        [
          `- ${label(labels.kind, locale)} ${prose(exerciseKind(slug, labels))}`,
          `- ${label(labels.commands, locale)} ${practisedCommands(slug, text, paged)}`,
          `- [${prose(notes.data.title)}](${exercisePagePath(slug)})`,
        ].join("\n")
      )
    }
  }
  blocks.push(`## ${prose(page.guidesTitle)} [#guides]`, markdown(page.guides), guideLinks(locale))
  blocks.push(`## ${prose(page.howTitle)} [#how]`, markdown(page.how))
  const questions = Object.values(page.questions)
  blocks.push(`## ${prose(t.Docs.command.questions)} [#questions]`)
  for (const { question, answer } of questions) blocks.push(`### ${prose(question)}`, markdown(answer))
  return `${frontmatter({
    title: page.title,
    metaTitle: page.metaTitle,
    description: page.description,
    type: "practice",
    generated: GENERATOR,
    faq: questions.map(({ question, answer }) => ({
      question: plainText(question, locale),
      answer: plainText(answer, locale),
    })),
  })}\n${blocks.join("\n\n")}\n`
}

export type { CommandNotes }
