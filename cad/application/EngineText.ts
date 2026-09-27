import { MessageFormatter } from "../i18n/format"
import { mergeCatalog } from "../i18n/merge"
import {
  abbreviationOf,
  parseCommandInput,
  type Keyword,
} from "../i18n/keywords"
import type { CompiledMessage, MessageValues } from "../i18n/types"
import { en } from "../locales/en"
import type {
  CommandCatalog,
  EngineLocale,
  InterfaceCatalog,
  PromptId,
} from "../locales/types"
import type { EntityType, DimensionKind, TextJustify } from "../domain/entities"
import type { SnapType } from "./snapping/types"

/** A span of a prompt: text, or the bracketed keyword list. */
export interface PromptSegment {
  readonly text: string
  /** The `[Close/Undo]` span, which a host may set apart. */
  readonly keywords: boolean
}

/** The engine's own vocabulary, for a host's menus and pickers. */
export interface EngineNames {
  readonly snaps: Readonly<Record<SnapType, string>>
  readonly colors: Readonly<Record<string, string>>
  readonly byLayer: string
  readonly linetypes: Readonly<Record<string, string>>
}

type Messages = CommandCatalog["messages"]
export type MessageId = Exclude<keyof Messages, "fileError">
export type FileErrorCode = keyof Messages["fileError"]
export type FeedbackId = Exclude<keyof CommandCatalog["feedback"], "snap">
type Property = InterfaceCatalog["property"]

function compiledTable(
  table: object
): Readonly<Record<string, CompiledMessage>> {
  return table as Readonly<Record<string, CompiledMessage>>
}

/**
 * One language as the engine speaks it: the locale laid over English key by
 * key, formatted with latin digits. Everything the engine says goes through
 * here — the interface (palettes, pickers) and the command language (names,
 * prompts, keywords, messages, what is drawn on the canvas) — so no text lives
 * anywhere else in the engine.
 */
export class EngineText {
  readonly tag: string
  private readonly formatter: MessageFormatter
  private readonly ui: InterfaceCatalog
  private readonly commands: CommandCatalog
  /** Typed command name or alias → global name, in the command language. */
  private readonly byName = new Map<string, string>()
  /** Global name → global name, for `_` in front of it. */
  private readonly byGlobalName = new Map<string, string>()
  private namesCache: EngineNames | null = null
  private idlePromptCache: string | null = null

  constructor(readonly locale: EngineLocale = en) {
    this.tag = locale.tag
    this.formatter = new MessageFormatter(locale.tag)
    this.ui = mergeCatalog<InterfaceCatalog>(en.interface, locale.interface)
    this.commands = mergeCatalog<CommandCatalog>(en.commands, locale.commands)
    for (const [global, names] of Object.entries(this.commands.names)) {
      for (const name of names) this.byName.set(name.toUpperCase(), global)
    }
    for (const [global, names] of Object.entries(en.commands.names)) {
      this.byGlobalName.set(names[0].toUpperCase(), global)
    }
  }

  private format(message: CompiledMessage, values?: MessageValues): string {
    return this.formatter.format(message, values)
  }

  // The interface language.

  /** A tool's label in the rail; a tool the catalog does not know shows its id. */
  tool(id: string): string {
    const label = compiledTable(this.ui.tool)[id]
    return label === undefined ? id : this.format(label)
  }

  /** What a command that is not a tool does, for the autocomplete list. */
  description(command: string): string | null {
    const text = compiledTable(this.ui.description)[command]
    return text === undefined ? null : this.format(text)
  }

  entity(type: EntityType, count: number): string {
    return this.format(this.ui.entity[type], { count })
  }

  propertyTitle(id: keyof Property["title"], count = 1): string {
    return this.format(this.ui.property.title[id], { count })
  }

  propertyGroup(id: keyof Property["group"]): string {
    return this.format(this.ui.property.group[id])
  }

  propertyRow(id: keyof Property["row"]): string {
    return this.format(this.ui.property.row[id])
  }

  propertyValue(id: keyof Property["value"]): string {
    return this.format(this.ui.property.value[id])
  }

  justify(justify: TextJustify): string {
    return this.format(this.ui.property.justify[justify])
  }

  dimensionKind(kind: DimensionKind): string {
    return this.format(this.ui.property.dimensionKind[kind])
  }

  /** A hatch pattern as the palette names it; data it does not know shows its id. */
  hatchPattern(id: string): string {
    const name = compiledTable(this.ui.hatchPattern)[id]
    return name === undefined ? id : this.format(name)
  }

  /** The names a host's menus and pickers show, built once per language. */
  names(): EngineNames {
    this.namesCache ??= {
      snaps: this.table(this.ui.snap) as Record<SnapType, string>,
      colors: this.table(this.ui.color),
      byLayer: this.format(this.ui.byLayer),
      linetypes: this.table(this.ui.linetype),
    }
    return this.namesCache
  }

  private table(messages: object): Record<string, string> {
    return Object.fromEntries(
      Object.entries(compiledTable(messages)).map(([key, message]) => [
        key,
        this.format(message),
      ])
    )
  }

  // The command language.

  /** A command's name first, then its aliases, in the command language. */
  commandNames(command: string): readonly string[] {
    return (
      (this.commands.names as Readonly<Record<string, readonly string[]>>)[
        command
      ] ?? [command]
    )
  }

  /**
   * The global name of the command `text` names: a name or alias of the
   * command language, or `_` and a global name.
   */
  resolveCommand(text: string): string | null {
    const { name, global } = parseCommandInput(text)
    if (name === "") return null
    return (global ? this.byGlobalName : this.byName).get(name) ?? null
  }

  /** The keywords `ids` of `command`, as the command language and `_` spell them. */
  // A keyword's id is its global word, which is what `_` selects.
  keywords(command: string | null, ids: readonly string[]): Keyword[] {
    return ids.map((id) => ({
      id,
      word: this.keyword(command, id),
      global: id,
    }))
  }

  keyword(command: string | null, id: string): string {
    if (command === null) return id
    const table = (
      this.commands.keywords as
        Readonly<Record<string, Readonly<Record<string, string>>>> | undefined
    )?.[command]
    return table?.[id] ?? id
  }

  /** A keyword's abbreviation in the command language (`U` for Undo). */
  abbreviation(command: string | null, id: string): string {
    return abbreviationOf(this.keyword(command, id))
  }

  prompt(id: PromptId): string {
    return this.format(this.commands.prompts[id])
  }

  message(id: MessageId, values?: MessageValues): string {
    return this.format(this.commands.messages[id], values)
  }

  fileError(code: FileErrorCode): string {
    return this.format(this.commands.messages.fileError[code])
  }

  feedback(id: FeedbackId, values?: MessageValues): string {
    return this.format(this.commands.feedback[id], values)
  }

  /** The object snap tooltip drawn beside a marker. */
  snapFeedback(type: SnapType): string {
    return this.format(this.commands.feedback.snap[type])
  }

  /** One line of the HATCH `?` listing. */
  hatchPatternListing(id: string): string {
    const description = compiledTable(
      this.commands.listing.hatchPatternDescription
    )[id]
    return this.format(this.commands.listing.hatchPattern, {
      name: id,
      description: description === undefined ? "" : this.format(description),
    })
  }

  defaultLayerName(n: number): string {
    return this.format(this.commands.defaults.layer, { n })
  }

  copyName(name: string): string {
    return this.format(this.commands.defaults.copyOf, { name })
  }

  fileName(date: string): string {
    return this.format(this.commands.defaults.fileName, { date })
  }

  /** The label a dynamic-input box shows once it holds a point. */
  coordinateLabel(polar: boolean): string {
    const format = this.commands.format
    return this.format(polar ? format.polar : format.cartesian)
  }

  /** `Erase: Yes` — a keyword and the value it is set to. */
  optionValue(keyword: string, value: string): string {
    return this.format(this.commands.format.optionValue, { keyword, value })
  }

  keywordList(words: readonly string[]): string {
    return words.join(this.format(this.commands.format.keywordSeparator))
  }

  /** The word the neutral prompt is headed with (`Command`). */
  idleHead(): string {
    return this.format(this.commands.format.idle)
  }

  /** The neutral prompt, `Command:`. */
  idlePrompt(): string {
    this.idlePromptCache ??= promptString(
      this.composePrompt(this.idleHead(), [])
    )
    return this.idlePromptCache
  }

  /**
   * A prompt from its parts: what is asked (a command name, a field, or the
   * neutral `Command`) and the keywords on offer, e.g. `LINE [Close/Undo]:`.
   */
  composePrompt(head: string, keywords: readonly string[]): PromptSegment[] {
    const format = this.commands.format
    if (keywords.length === 0) {
      return [{ text: this.format(format.prompt, { head }), keywords: false }]
    }
    return this.formatter
      .formatParts<PromptSegment>(
        format.promptWithKeywords,
        { head, list: this.keywordList(keywords) },
        {
          keywords: (chunks) => ({
            text: chunks.join(""),
            keywords: true,
          }),
        }
      )
      .map((part) =>
        typeof part === "string" ? { text: part, keywords: false } : part
      )
  }
}

/** The text of a composed prompt. */
export function promptString(segments: readonly PromptSegment[]): string {
  return segments.map((segment) => segment.text).join("")
}

const shared = new WeakMap<EngineLocale, EngineText>()

/**
 * The engine's text in `locale` (English by default), shared by everything
 * that renders in that language: a build that records many demos in several
 * languages formats each once.
 */
export function engineText(locale: EngineLocale = en): EngineText {
  let text = shared.get(locale)
  if (!text) {
    text = new EngineText(locale)
    shared.set(locale, text)
  }
  return text
}
