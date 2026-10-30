import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import {
  commandCatalog,
  demo,
  recordDemo,
  type EngineLocale,
} from "@mellowcad/engine"
import type { EditorLocale } from "@mellowcad/editor"
import { en as editorEnglish } from "@mellowcad/editor/locales/en"

import { COMMAND_GROUPS } from "@/content/commands"
import { loadEditorLocale } from "@/i18n/editor"
import { loadEngineLocale } from "@/i18n/engine"
import { DIRECTION, routing, type AppLocale } from "@/i18n/routing"
import { autocadCommands } from "@/lib/facts"
import { REPOSITORY_URL } from "@/lib/site"
import en from "@/messages/en.json"

import {
  SHORTCUT_SECTIONS,
  type KeyCombo,
  type Shortcut,
  type ShortcutMode,
} from "./shortcuts"
import { COVERAGE_DIR, githubAnchor } from "./use"

/**
 * The pages of "Use MellowCAD" a test writes from their sources (the
 * engine's catalog, the site's messages, `docs/coverage/`), as plain Markdown
 * so search, the `.md` and `llms.txt` read them as any other page. Nothing
 * here is typed in: a word is the engine's or a message.
 */

export const GENERATOR = "lib/docs/generate.test.ts"

type Messages = typeof en

async function messages(locale: AppLocale): Promise<Messages> {
  const own = (await import(`@/messages/${locale}.json`)) as { default: Messages }
  return own.default
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

function frontmatter(fields: Record<string, string>): string {
  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  return `---\n${lines.join("\n")}\n---\n`
}

/**
 * Where `docs/coverage/` documents a command: the first `###` heading naming
 * it in a code span. A command with none fails the page.
 */
export function coverageUrl(id: string, root = process.cwd()): string {
  const dir = join(root, COVERAGE_DIR)
  for (const file of readdirSync(dir).sort()) {
    for (const line of readFileSync(join(dir, file), "utf8").split("\n")) {
      if (line.startsWith("### ") && line.includes(`\`${id}\``)) {
        return `${REPOSITORY_URL}/blob/main/${COVERAGE_DIR}/${file}#${githubAnchor(line.slice(4))}`
      }
    }
  }
  throw new Error(`${id} has no ### heading in ${COVERAGE_DIR}/`)
}

/** What a command asks first, as the history writes it; null when it asks nothing. */
async function firstPrompt(id: string, locale: EngineLocale | undefined): Promise<string | null> {
  const recording = await recordDemo(demo().command(`_${id}`).escape(), { locale })
  const echo = recording.steps.at(-1)?.prompt.echo
  return echo ? echo.map((segment) => segment.text).join("") : null
}

/** A page's file for `locale`: `commands.mdx`, `commands.es.mdx`. */
export function pageFile(page: string, locale: AppLocale): string {
  return locale === routing.defaultLocale ? `${page}.mdx` : `${page}.${locale}.mdx`
}

/**
 * The command reference: every AutoCAD command by ribbon panel, named as the
 * page's command language names it, with its aliases, its description, the
 * first prompt it shows and its coverage notes. Anchors are global names
 * (`#line`), the same in every language.
 */
export async function commandsPage(locale: AppLocale): Promise<string> {
  const t = await messages(locale)
  const engineLocale = await loadEngineLocale(locale)
  const commands = autocadCommands(engineLocale)
  const page = t.Docs.pages.commands
  const blocks: string[] = [markdown(page.lead)]
  for (const group of COMMAND_GROUPS) {
    blocks.push(`## ${prose(t.Groups[group])} [#${group}]`)
    for (const command of commands.filter((entry) => entry.group === group)) {
      const prompt = await firstPrompt(command.id, engineLocale)
      const facts = [
        command.aliases.length > 0 &&
          `- **${prose(t.Docs.reference.aliases)}:** ${command.aliases.map(code).join(", ")}`,
        prompt && `- **${prose(t.Docs.reference.firstPrompt)}:** ${code(prompt)}`,
        `- [${prose(t.Docs.reference.coverage)}](${coverageUrl(command.id)})`,
      ].filter(Boolean)
      blocks.push(
        `### ${isolate(prose(command.name), locale)} [#${command.id.toLowerCase()}]`,
        prose(command.description),
        facts.join("\n")
      )
    }
  }
  return `${frontmatter({
    title: page.title,
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
  const t = await messages(locale)
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
    description: page.description,
    type: "reference",
    generated: GENERATOR,
  })}\n${blocks.join("\n\n")}\n`
}
