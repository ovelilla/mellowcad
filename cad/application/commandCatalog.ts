import { CadRuntime } from "./CadRuntime"
import { createRecordingHost } from "./CadDriver"
import { CommandInfo } from "./CommandLine"
import type { EngineLocale } from "../locales/types"

/**
 * Every command the prompt accepts — name, aliases and description, in
 * `locale`'s command language — read off a headless runtime rather than
 * restated, so a list built from it (the landing's catalogue, its counts) is
 * exactly the table the editor registers.
 */
export function commandCatalog(locale?: EngineLocale): CommandInfo[] {
  const runtime = new CadRuntime(createRecordingHost(), null, null, null, {
    locale,
  })
  try {
    return runtime.listCommands()
  } finally {
    runtime.dispose()
  }
}
