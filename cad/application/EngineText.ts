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
  CommandName,
  EngineLocale,
  InterfaceCatalog,
  PromptId,
} from "../locales/types"
import type { EntityType, DimensionKind, TextJustify } from "../domain/entities"
import type { SnapType } from "./snapping/types"
import type { ViewPreset } from "./tools/viewPresets"
import type { CompassLetter, ViewCubeFace } from "./viewCube"

/** A span of a prompt: text, or the bracketed keyword list. */
export interface PromptSegment {
  readonly text: string
  /** The `[Close/Undo]` span, which a host may set apart. */
  readonly keywords: boolean
}

/**
 * What the engine names, in the interface language (`EngineState.names`): a
 * host draws these words and never keeps a copy of its own, so a menu and the
 * engine cannot disagree and a language changes them all at once. Each table
 * is keyed by the id the engine hands the host elsewhere in its state.
 *
 * Tool labels and aliases are `EngineState.tools`, a command's name and
 * description `commandCatalog()`, property rows `properties.info`; everything
 * else the host's own chrome says is the host's.
 */
export interface EngineNames {
  /** Object snaps, by `SnapType`: the snap menus and the status bar's list. */
  readonly snaps: Readonly<Record<SnapType, string>>
  /** The standard colours, by `STANDARD_COLORS[].id`. */
  readonly colors: Readonly<Record<string, string>>
  /** ByLayer, for the colour, linetype and lineweight pickers. */
  readonly byLayer: string
  /**
   * Linetypes, by `LINETYPES[].id`. One without an entry shows its id: a
   * linetype's name is the drawing's data, the same in every language.
   */
  readonly linetypes: Readonly<Record<string, string>>
  /** The preset views (`state.view.preset`), and `custom` for any other. */
  readonly views: Readonly<Record<ViewPreset | "custom", string>>
  /** The ViewCube's face labels, by the faces of `state.viewCube`. */
  readonly viewCubeFaces: Readonly<Record<ViewCubeFace, string>>
  /** The ViewCube's compass letters, by `state.viewCube`'s compass. */
  readonly compass: Readonly<Record<CompassLetter, string>>
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
  /** The command language's tag: the locale's own, or English's for the global one. */
  readonly commandTag: string
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
    // A locale without a command language speaks the global one, English.
    this.commandTag = locale.commands ? locale.tag : en.tag
    this.formatter = new MessageFormatter(locale.tag)
    this.ui = mergeCatalog<InterfaceCatalog>(en.interface, locale.interface)
    const own: Partial<Record<CommandName, readonly string[]>> =
      locale.commands?.names ?? {}
    this.commands = {
      ...mergeCatalog<CommandCatalog>(en.commands, locale.commands),
      names: commandLanguageNames(locale),
    }
    // A language's own names come last, so one equal to a global name it left
    // out still runs its own command.
    const entries = Object.entries(this.commands.names) as [
      CommandName,
      readonly string[],
    ][]
    for (const [global, names] of [
      ...entries.filter(([global]) => own[global] === undefined),
      ...entries.filter(([global]) => own[global] !== undefined),
    ]) {
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

  /** An entry of the Properties palette's object type drop-down: `All (6)`, `Line (5)`. */
  propertiesFilter(type: EntityType | null, count: number): string {
    const title = this.ui.property.title
    return type === null
      ? this.format(title.all, { count })
      : this.format(title.type, { type: this.entity(type, 1), count })
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
      views: this.table(this.ui.view) as Record<ViewPreset | "custom", string>,
      viewCubeFaces: this.table(this.ui.viewCube.face) as Record<
        ViewCubeFace,
        string
      >,
      compass: this.table(this.ui.viewCube.compass) as Record<
        CompassLetter,
        string
      >,
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
  keywords(
    command: string | null,
    ids: readonly string[],
    prompt: PromptId | null = null
  ): Keyword[] {
    return ids.map((id) => ({
      id,
      word: this.keyword(command, id, prompt),
      global: id,
    }))
  }

  /** How `command` spells keyword `id`, at `prompt` when it spells it its way. */
  keyword(
    command: string | null,
    id: string,
    prompt: PromptId | null = null
  ): string {
    if (command === null) return id
    const own =
      prompt === null
        ? undefined
        : (
            this.commands.promptKeywords as
              | Readonly<Record<string, Readonly<Record<string, string>>>>
              | undefined
          )?.[prompt]?.[id]
    if (own !== undefined) return own
    const table = (
      this.commands.keywords as
        Readonly<Record<string, Readonly<Record<string, string>>>> | undefined
    )?.[command]
    return table?.[id] ?? id
  }

  /**
   * How a prompt lists a keyword whose word AutoCAD follows with a note —
   * `Ttr (tan tan radius)` — or null for one listed as its word.
   */
  keywordLabel(command: string | null, id: string): string | null {
    if (command === null) return null
    const label = (
      this.commands.keywordLabels as Readonly<
        Record<string, Readonly<Record<string, CompiledMessage>> | undefined>
      >
    )[command]?.[id]
    return label === undefined ? null : this.format(label)
  }

  /** A keyword's abbreviation in the command language (`U` for Undo). */
  abbreviation(command: string | null, id: string): string {
    return abbreviationOf(this.keyword(command, id))
  }

  prompt(id: PromptId, values?: MessageValues): string {
    return this.format(this.commands.prompts[id], values)
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

  /** `LINE Specify first point`: the head of a running command's prompt. */
  commandQuestion(command: string, question: string): string {
    return this.format(this.commands.format.commandPrompt, {
      command,
      question,
    })
  }

  /** A command run transparently, as typed and echoed: `'ZOOM`. */
  transparentCommand(command: string): string {
    return this.format(this.commands.format.transparentCommand, { command })
  }

  /** A transparent command's question, `>>Specify first corner`. */
  transparentPrompt(question: string): string {
    return this.format(this.commands.format.transparentPrompt, { question })
  }

  /** An object snap given at a point prompt, as answered: `_endp of`. */
  snapOverride(snap: string, to: boolean | null): string {
    return this.format(this.commands.format.snapOverride, {
      snap,
      preposition: to === null ? "none" : to ? "to" : "of",
    })
  }

  /** A prompt as the history keeps it once answered: `Specify next point or [Undo]: 100`. */
  answered(prompt: string, answer: string): string {
    return answer === ""
      ? prompt
      : this.format(this.commands.format.answered, { prompt, answer })
  }

  /**
   * A prompt from its parts: what is asked (a command name, a field, or the
   * neutral `Command`), the keywords on offer and the one Enter keeps, e.g.
   * `LINE [Close/Undo]:` or `UCSICON [ON/OFF/Noorigin/ORigin] <ON>:`.
   */
  composePrompt(
    head: string,
    keywords: readonly string[],
    fallback: string | null = null
  ): PromptSegment[] {
    const format = this.commands.format
    if (keywords.length === 0) {
      const text =
        fallback === null
          ? this.format(format.prompt, { head })
          : this.format(format.promptWithValue, { head, value: fallback })
      return [{ text, keywords: false }]
    }
    return this.formatter
      .formatParts<PromptSegment>(
        fallback === null
          ? format.promptWithKeywords
          : format.promptWithDefault,
        { head, list: this.keywordList(keywords), value: fallback ?? "" },
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

/**
 * Every command's name and aliases in `locale`'s command language. Without one
 * it is the global language, English's names and aliases. A language of its
 * own that leaves a command out names it by its global name alone: English's
 * aliases belong to English's `acad.pgp`, and in another language the same
 * letters run other commands (`U` is UNIR in Spanish).
 */
function commandLanguageNames(locale: EngineLocale): CommandCatalog["names"] {
  if (locale.commands === undefined) return en.commands.names
  const own = locale.commands.names
  return Object.fromEntries(
    Object.keys(en.commands.names).map((global) => [
      global,
      own?.[global as CommandName] ?? [global],
    ])
  ) as CommandCatalog["names"]
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
