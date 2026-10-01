import { mergeCatalog } from "../i18n/merge"
import type { DeepPartial } from "../i18n/types"
import type { CommandCatalog, EngineLocale, InterfaceCatalog } from "./types"

/** What a host replaces in a language: any message, name list or keyword. */
export interface LocaleOverrides {
  readonly interface?: DeepPartial<InterfaceCatalog>
  readonly commands?: DeepPartial<CommandCatalog>
}

/**
 * `base` with the host's own words laid over it, key by key: each entry given
 * replaces the base's and everything else is kept. A message is a compiled one
 * (`icu-minify/compile`, in the host's build); a string without arguments
 * already is one. A list of names is replaced whole.
 *
 * Giving `commands` to a language that has none (Arabic) gives it a command
 * language of its own, with the rules of one: a command it leaves out is
 * reached by its global name only.
 */
export function extendLocale(
  base: EngineLocale,
  overrides: LocaleOverrides
): EngineLocale {
  const commands =
    overrides.commands === undefined
      ? base.commands
      : mergeCatalog<DeepPartial<CommandCatalog>>(
          base.commands ?? {},
          overrides.commands
        )
  return {
    tag: base.tag,
    interface: mergeCatalog<DeepPartial<InterfaceCatalog>>(
      base.interface,
      overrides.interface
    ),
    ...(commands && { commands }),
  }
}
