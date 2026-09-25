import { CadRuntime } from "./CadRuntime"
import { createRecordingHost } from "./CadDriver"
import { CommandInfo } from "./CommandLine"

/**
 * Every command the prompt accepts — name, aliases and description — read off a
 * headless runtime rather than restated, so a list built from it (the landing's
 * catalogue, its counts) is exactly the table the editor registers.
 */
export function commandCatalog(): CommandInfo[] {
  const runtime = new CadRuntime(createRecordingHost())
  try {
    return runtime.listCommands()
  } finally {
    runtime.dispose()
  }
}
