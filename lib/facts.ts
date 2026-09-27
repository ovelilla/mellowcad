import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

import {
  HATCH_PATTERNS,
  LINETYPES,
  LINEWEIGHTS,
  SnapType,
  commandCatalog,
  type CommandInfo,
} from "@/cad"
import {
  COMMAND_FILING,
  COMMAND_GROUPS,
  type CommandGroup,
} from "@/content/commands"
import packageJson from "@/package.json"

/**
 * Every number and list the landing states about the product, derived from
 * the code at build time. Nothing here is typed in by hand.
 */

export interface CatalogCommand extends CommandInfo {
  readonly group: CommandGroup
  /** What to type: the shortest alias, or the name when it has none. */
  readonly key: string
}

/** The commands AutoCAD users know by name, filed by ribbon group. */
export function autocadCommands(): CatalogCommand[] {
  return commandCatalog().flatMap((command) => {
    const filing = COMMAND_FILING[command.id]
    if (!filing || filing.variant) return []
    const key = [command.name, ...command.aliases].reduce((shortest, name) =>
      name.length < shortest.length ? name : shortest
    )
    return [{ ...command, group: filing.group, key }]
  })
}

export function commandsByGroup(): Record<CommandGroup, CatalogCommand[]> {
  const commands = autocadCommands()
  return Object.fromEntries(
    COMMAND_GROUPS.map((group) => [
      group,
      commands.filter((command) => command.group === group),
    ])
  ) as Record<CommandGroup, CatalogCommand[]>
}

export interface ProductFacts {
  readonly commands: number
  readonly aliases: number
  readonly objectSnaps: number
  readonly lineweights: number
  readonly linetypes: number
  readonly hatchPatterns: number
  /** Automated tests in the repository, rounded down to the hundred. */
  readonly tests: number
  readonly version: string
}

export function productFacts(): ProductFacts {
  const commands = autocadCommands()
  return {
    commands: commands.length,
    aliases: commands.reduce((sum, command) => sum + command.aliases.length, 0),
    objectSnaps: Object.values(SnapType).length,
    lineweights: LINEWEIGHTS.length,
    linetypes: LINETYPES.length,
    hatchPatterns: HATCH_PATTERNS.length,
    tests: Math.floor(countTests() / 100) * 100,
    version: packageJson.version,
  }
}

const TEST_ROOTS = ["cad", "test", "content"]
const TEST_CASE = /^\s*(?:it|test)(?:\.each\([^)]*\))?\(/gm

/**
 * Test cases in the repository's suites, counted from their source: one per
 * `it(` / `test(`. It is a floor, not an exact count — which is why the page
 * rounds it down.
 */
function countTests(): number {
  let count = 0
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith(".test.ts")) {
        count += readFileSync(path, "utf8").match(TEST_CASE)?.length ?? 0
      }
    }
  }
  // Read at build time only (every page that states it is prerendered), so the
  // server bundle must not trace the whole repository to carry it.
  for (const dir of TEST_ROOTS) {
    walk(join(/*turbopackIgnore: true*/ process.cwd(), dir))
  }
  return count
}
