/**
 * The version arithmetic `npm run deps:check` needs: a dependency of our own
 * for it would be one more thing to review, and `semver` is only a transitive
 * one here. Stable versions only: the review reads prereleases, never takes
 * them.
 */

export type Version = [major: number, minor: number, patch: number]
export type Bump = "major" | "minor" | "patch"

const VERSION = /^v?(\d+)\.(\d+)\.(\d+)(-[\w.-]+)?(\+[\w.-]+)?$/

export function parseVersion(text: string): Version | null {
  const match = VERSION.exec(text.trim())
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}

export const isStable = (text: string) => /^\d+\.\d+\.\d+$/.test(text.trim())

export function compareVersions(a: Version, b: Version) {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
}

/**
 * Below 1.0.0, npm's caret treats the first non-zero number as the major, so
 * 0.2.4 → 0.3.0 is as breaking as 1.x → 2.0.
 */
export function bumpOf(from: Version, to: Version): Bump | null {
  if (compareVersions(to, from) <= 0) return null
  const breaking = from[0] === 0 ? (from[1] === 0 ? 2 : 1) : 0
  const index = to.findIndex((part, i) => part !== from[i])
  return index <= breaking ? "major" : index === 1 ? "minor" : "patch"
}

// A partial version (`16`, `4.x`, `*`) as the numbers it fixes.
function partial(text: string): (number | null)[] {
  const parts = text.replace(/^v/, "").replace(/-.*$/, "").split(".")
  return [0, 1, 2].map((index) =>
    /^\d+$/.test(parts[index] ?? "") ? Number(parts[index]) : null
  )
}

const filled = (parts: (number | null)[]): Version => [
  parts[0] ?? 0,
  parts[1] ?? 0,
  parts[2] ?? 0,
]

type Comparator = (version: Version) => boolean

function caret(parts: (number | null)[]): Comparator {
  const low = filled(parts)
  const high: Version =
    parts[0] === null
      ? [Infinity, 0, 0]
      : parts[0] > 0 || parts[1] === null
        ? [parts[0] + 1, 0, 0]
        : parts[1] > 0 || parts[2] === null
          ? [0, parts[1] + 1, 0]
          : [0, 0, (parts[2] ?? 0) + 1]
  return (v) => compareVersions(v, low) >= 0 && compareVersions(v, high) < 0
}

function tilde(parts: (number | null)[]): Comparator {
  const low = filled(parts)
  const high: Version =
    parts[0] === null
      ? [Infinity, 0, 0]
      : parts[1] === null
        ? [parts[0] + 1, 0, 0]
        : [parts[0], parts[1] + 1, 0]
  return (v) => compareVersions(v, low) >= 0 && compareVersions(v, high) < 0
}

// `16`, `16.x` and `16.4` are ranges of their own: what they leave open.
function xRange(parts: (number | null)[]): Comparator {
  const fixed = parts.findIndex((part) => part === null)
  return fixed === -1
    ? (v) => compareVersions(v, filled(parts)) === 0
    : (v) => parts.slice(0, fixed).every((part, index) => v[index] === part)
}

function comparator(token: string): Comparator {
  const [, operator = "", rest] = /^(\^|~|>=|<=|>|<|=)?(.*)$/.exec(token)!
  const parts = partial(rest)
  if (rest === "" || rest === "*" || /^[xX]$/.test(rest)) return () => true
  const version = filled(parts)
  // `<=16` admits every 16.x and `>16` none: past a partial version is its
  // next one.
  const open = parts.indexOf(null)
  const next: Version | null =
    open > 0
      ? filled(parts.map((part, i) => (i === open - 1 ? part! + 1 : part)))
      : null
  if (next && operator === "<=") return (v) => compareVersions(v, next) < 0
  if (next && operator === ">") return (v) => compareVersions(v, next) >= 0
  switch (operator) {
    case "^":
      return caret(parts)
    case "~":
      return tilde(parts)
    case ">=":
      return (v) => compareVersions(v, version) >= 0
    case ">":
      return (v) => compareVersions(v, version) > 0
    case "<=":
      return (v) => compareVersions(v, version) <= 0
    case "<":
      return (v) => compareVersions(v, version) < 0
    default:
      return xRange(parts)
  }
}

/**
 * Whether a stable version satisfies an npm range: `||`, space-joined
 * comparators, hyphen ranges, `^`, `~` and x-ranges. A range that names a
 * prerelease (`^7.0.0-0`) is read as its release, which is what it admits of
 * stable versions.
 */
export function satisfies(version: string, range: string) {
  const parsed = parseVersion(version)
  if (!parsed) return false
  return range.split("||").some((alternative) => {
    const text = alternative
      .trim()
      .replace(/\s+-\s+/, " - ")
      .replace(/([<>=^~])\s+/g, "$1")
    const hyphen = /^(\S+) - (\S+)$/.exec(text)
    const tokens = hyphen
      ? [`>=${hyphen[1]}`, `<=${hyphen[2]}`]
      : text.split(/\s+/).filter(Boolean)
    return tokens.every((token) => comparator(token)(parsed))
  })
}
