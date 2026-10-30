import { createHash } from "node:crypto"

/**
 * "Use MellowCAD", for whoever draws: pages at the docs' root, each in every
 * language (`commands.mdx`, `commands.es.mdx`, `commands.ar.mdx`), in the
 * navigation's order. Every other folder of `content/docs/` is a package's.
 */
export const USE_PAGES = ["commands"] as const

export type UsePage = (typeof USE_PAGES)[number]

/**
 * The repository's coverage notes, where the reference sends each command:
 * every command has a `###` heading there naming it in a code span.
 */
export const COVERAGE_DIR = "docs/coverage"

/**
 * What a translation's `sourceHash` holds: the English file it was written
 * from, so `docs:check` can tell when that file changed and it did not.
 */
export function sourceHash(english: string): string {
  return createHash("sha256").update(english).digest("hex").slice(0, 12)
}

/**
 * A heading's anchor as GitHub and Fumadocs make it (github-slugger's rule),
 * code marks dropped; a heading that ends in `[#id]` is that id.
 */
export function githubAnchor(heading: string): string {
  const custom = /\s*\[#([^\]]+)\]\s*$/.exec(heading)
  if (custom) return custom[1]
  return heading
    .replace(/`/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
    .replace(/ /g, "-")
}
