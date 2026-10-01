import type { CompiledMessage, DeepPartial } from "../i18n/types"
import type source from "./en.json"

/**
 * The shape of an engine catalog, read off the English source: English is the
 * fallback key by key and the type every other language is checked against.
 */

type Source = typeof source
type Commands = Source["commands"]

/** Every ICU leaf of the source, as the generated module holds it. */
type Compiled<T> = T extends string
  ? CompiledMessage
  : { readonly [K in keyof T]: Compiled<T[K]> }

/** A command's global (English, language-independent) name. */
export type CommandName = keyof Commands["names"]

/**
 * The interface language. A linetype or hatch pattern whose display name is its
 * id is left out of the English module, which falls back to the id.
 */
export type InterfaceCatalog = Omit<
  Compiled<Source["interface"]>,
  "linetype" | "hatchPattern"
> & {
  readonly linetype: Partial<Compiled<Source["interface"]["linetype"]>>
  readonly hatchPattern: Partial<Compiled<Source["interface"]["hatchPattern"]>>
}

/**
 * The command language. `names` and `keywords` are vocabulary, not messages: a
 * keyword marks its abbreviation in capitals (`desHacer`), as `initget` does.
 */
export type CommandCatalog = Compiled<Omit<Commands, "names" | "keywords">> & {
  readonly names: { readonly [C in CommandName]: readonly string[] }
  /**
   * A keyword's global word is its id, so English ships none of these: its
   * source lists them as the inventory other languages translate.
   */
  readonly keywords?: {
    readonly [C in keyof Commands["keywords"]]?: {
      readonly [K in keyof Commands["keywords"][C]]?: string
    }
  }
}

export type KeywordCommand = keyof Commands["keywords"]
export type PromptId = keyof Commands["prompts"]

/** A complete catalog: the English one built into the engine. */
export interface EngineCatalog {
  readonly tag: string
  readonly interface: InterfaceCatalog
  readonly commands: CommandCatalog
}

/**
 * A language the engine is handed explicitly (`new CadEngine(canvas, { locale
 * })`), never registered: one process can draw in several at once.
 *
 * `interface` may leave out any key, and that key is English's. `commands` is
 * the command language and is complete or absent: without it the command
 * language is the global one, as in an English AutoCAD; with it, every command
 * it does not name is reached by its global name alone (`ERASE`, never `E`),
 * while a missing keyword is its global word and any other missing message is
 * English's. Every message is compiled (`icu-minify/compile`) — `names` and
 * `keywords` are words, not messages. The shape follows `en.json`: changing
 * it is a breaking change of the engine.
 */
export interface EngineLocale {
  /** BCP 47, what `Intl` receives (plurals, and digits pinned to latin). */
  readonly tag: string
  readonly interface: DeepPartial<InterfaceCatalog>
  readonly commands?: DeepPartial<CommandCatalog>
}
