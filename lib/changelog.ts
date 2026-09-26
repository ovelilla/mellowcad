import { readFileSync } from "node:fs"
import { join } from "node:path"

/** Keep a Changelog's kinds of change, in the order it lists them. */
export const CHANGE_TYPES = [
  "added",
  "changed",
  "deprecated",
  "removed",
  "fixed",
  "security",
] as const

export type ChangeType = (typeof CHANGE_TYPES)[number]

export interface ChangeSection {
  readonly type: ChangeType
  /** One entry each; inline code is still in backticks. */
  readonly items: readonly string[]
}

export interface Release {
  readonly version: string
  /** `YYYY-MM-DD`, the day it went live. */
  readonly date: string
  readonly sections: readonly ChangeSection[]
}

const RELEASE = /^## \[?([^\]\s]+)\]?(?: - (\d{4}-\d{2}-\d{2}))?$/
const SECTION = /^### (.+)$/
const ENTRY = /^[-*] (.+)$/
const CONTINUATION = /^\s+(\S.*)$/

function isChangeType(value: string): value is ChangeType {
  return (CHANGE_TYPES as readonly string[]).includes(value)
}

/**
 * Reads a changelog in Keep a Changelog 1.1.0 form: `## [version] - date` per
 * release, `### Added` and its siblings per kind of change, `- ` per entry,
 * which may wrap onto indented lines. `[Unreleased]` is skipped — the page
 * lists what has shipped — and a malformed heading throws, so a typo fails the
 * build rather than dropping a release from the page.
 */
export function parseChangelog(markdown: string): Release[] {
  const releases: {
    version: string
    date: string
    sections: ChangeSection[]
  }[] = []
  let items: string[] | null = null
  let inRelease = false

  for (const line of markdown.split(/\r?\n/)) {
    if (line.startsWith("## ")) {
      const match = RELEASE.exec(line.trimEnd())
      if (!match) throw new Error(`Unreadable release heading: "${line}"`)
      const [, version, date] = match
      items = null
      inRelease = version.toLowerCase() !== "unreleased"
      if (!inRelease) continue
      if (!date) throw new Error(`Release ${version} has no date`)
      releases.push({ version, date, sections: [] })
      continue
    }
    if (!inRelease) continue

    const section = SECTION.exec(line.trimEnd())
    if (section) {
      const type = section[1].trim().toLowerCase()
      if (!isChangeType(type)) {
        throw new Error(`Unknown kind of change: "${section[1]}"`)
      }
      items = []
      releases.at(-1)!.sections.push({ type, items })
      continue
    }

    const entry = ENTRY.exec(line)
    if (entry && items) {
      items.push(entry[1].trim())
      continue
    }
    const continuation = CONTINUATION.exec(line)
    if (continuation && items && items.length > 0) {
      items[items.length - 1] += ` ${continuation[1].trim()}`
    }
  }
  return releases
}

/** The repository's `CHANGELOG.md`, read at build time. */
export function changelog(): Release[] {
  // Read when the page is prerendered, so the server bundle must not trace
  // the whole repository to carry it.
  const path = join(/*turbopackIgnore: true*/ process.cwd(), "CHANGELOG.md")
  return parseChangelog(readFileSync(path, "utf8"))
}
