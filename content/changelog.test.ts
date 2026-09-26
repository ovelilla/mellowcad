import { describe, expect, it } from "vitest"

import { changelog, parseChangelog } from "@/lib/changelog"
import packageJson from "@/package.json"

/**
 * `/changelog` is built from `CHANGELOG.md`. These keep the page and the
 * product in step: the newest release is the version that ships, and nothing
 * is dated out of order or left empty.
 */

const versionParts = (version: string) => version.split(".").map(Number)

function newer(a: string, b: string): boolean {
  const [x, y] = [versionParts(a), versionParts(b)]
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i]) return x[i] > y[i]
  }
  return false
}

describe("the changelog", () => {
  const releases = changelog()

  it("leads with the version package.json ships", () => {
    expect(releases[0]?.version).toBe(packageJson.version)
  })

  it("lists releases newest first, each on a real date", () => {
    for (const [index, release] of releases.entries()) {
      expect(new Date(release.date).toISOString().slice(0, 10)).toBe(
        release.date
      )
      const older = releases[index + 1]
      if (older) {
        expect(newer(release.version, older.version)).toBe(true)
        expect(release.date >= older.date).toBe(true)
      }
    }
  })

  it("says something in every section of every release", () => {
    for (const release of releases) {
      expect(release.sections.length).toBeGreaterThan(0)
      for (const section of release.sections) {
        expect(section.items.length).toBeGreaterThan(0)
      }
    }
  })
})

describe("parseChangelog", () => {
  it("reads releases, kinds of change and wrapped entries", () => {
    const releases = parseChangelog(
      [
        "# Changelog",
        "",
        "## [Unreleased]",
        "",
        "### Added",
        "",
        "- Not shipped yet.",
        "",
        "## [1.2.0] - 2026-01-02",
        "",
        "### Fixed",
        "",
        "- An entry that runs",
        "  onto a second line.",
        "- `TRIM` in a block.",
      ].join("\n")
    )
    expect(releases).toEqual([
      {
        version: "1.2.0",
        date: "2026-01-02",
        sections: [
          {
            type: "fixed",
            items: [
              "An entry that runs onto a second line.",
              "`TRIM` in a block.",
            ],
          },
        ],
      },
    ])
  })

  it("fails on a heading it cannot read rather than dropping it", () => {
    expect(() => parseChangelog("## [1.0.0]")).toThrow(/no date/)
    expect(() => parseChangelog("## 1.0.0 on 2 January")).toThrow(/Unreadable/)
    expect(() =>
      parseChangelog("## [1.0.0] - 2026-01-02\n### Improved\n- x")
    ).toThrow(/Unknown kind/)
  })
})
